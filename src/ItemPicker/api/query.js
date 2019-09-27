const SYSTEM_FIELDS = [
  'Id',
  'CurrencyIsoCode',
  'IsDeleted',
  'CreatedBy',
  'CreatedById',
  'CreatedDate',
  'CurrencyIsoCode',
  'LastModifiedBy',
  'LastModifiedById',
  'LastModifiedDate',
  'LastReferencedDate',
  'LastViewedDate',
  'SystemModstamp'
];

const BUFFER_SIZE = 100;

function searchableColumnsFilter(column) {
  // salesforce LIKE operator only supports strings
  const { type } = column;
  return type === 'string' || type === 'reference' || type === 'picklist';
}

function escapeSOQLString(str, isLikeQuery) {
  if (isLikeQuery) return String(str || '').replace(/(['"\\_%])/g, '\\$1');
  return String(str || '').replace(/(['"\\])/g, '\\$1');
}

function formatExpressionValue(type, value) {
  if (value === undefined || value === null) {
    return type === 'boolean' ? 'False' : 'NULL';
  }

  switch (type) {
    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' ? 'True' : 'False';
      }
      return Boolean(value) ? 'True' : 'False';
    case 'reference':
      return `'${value}'`;
    case 'email':
    case 'phone':
    case 'picklist':
    case 'string':
    case 'textarea':
    case 'url':
      return `'${escapeSOQLString(value)}'`;
    default:
      return value.toString();
  }
}

function createExpression(filter) {
  const { field, item } = filter;
  const formatted = formatExpressionValue(field.type, item[field.name]);
  return `${field.name} = ${formatted}`;
}

export async function createParentFilterClause(api, settings) {
  const { sObjectName, recordId, pickerLookupField, pickerLookupValue } = settings;
  if (!sObjectName || !recordId || !pickerLookupField || !pickerLookupValue) return;

  try {
    const soql = `SELECT ${pickerLookupValue} FROM ${sObjectName} WHERE Id='${recordId}'`;
    const lookupValue = await api.query(soql).then(results => {
      return pickerLookupValue
        .split('.')
        .reduce((value, key) => value && value[key], results && results[0]);
    });
    return lookupValue && `${pickerLookupField}='${lookupValue}'`;
  } catch (e) {}
}

export async function createLookupFilterClause(api, sobject, recordId, lookupFieldName) {
  if (!recordId || !lookupFieldName) return;

  const sourceDescription = await api.describe(sobject);
  const lookupFilter = await api.describeLookupFilter(sourceDescription, lookupFieldName);
  if (!lookupFilter) return;

  const { booleanFilter, filterItems } = lookupFilter;
  const lookupSobject = sourceDescription.fields[lookupFieldName].referenceTo[0];
  const lookupDescription = await api.describe(lookupSobject);

  function getSourceValue(obj, [name, ...rest]) {
    if (name === '$Source') return getSourceValue(obj, rest);
    const value = obj[name];
    if (rest.length > 0) return getSourceValue(value, rest);
    return { value, type: sourceDescription.fields[name].type };
  }

  function createExpression($Source, filter) {
    const { field, operation, value, valueField } = filter;
    let leftField, rightField, leftValue, rightValue;

    if (!!~field.indexOf('$Source')) {
      leftValue = getSourceValue($Source, field.split('.'));
    } else {
      leftField = field.replace(`${lookupSobject}.`, '');
    }

    if (valueField) {
      if (!!~valueField.indexOf('$Source')) {
        rightValue = getSourceValue($Source, valueField.split('.'));
      } else {
        rightField = valueField.replace(`${lookupSobject}.`, '');
      }
    } else {
      rightValue = { value };
    }

    if (!leftField && !rightField) {
      return leftValue.value !== rightValue.value ? 'Id=null' : 'Id!=null';
    }

    let lookupField, lookupValue;

    if (!leftField) {
      lookupField = rightField;
      lookupValue = leftValue;
    }
    if (!rightField) {
      lookupField = leftField;
      lookupValue = rightValue;
    }

    if (lookupField === lookupValue) return 'Id!=null';

    const formattedValue = formatExpressionValue(
      lookupValue.type || lookupDescription.fields[lookupField].type,
      lookupValue.value
    );

    switch (operation) {
      case 'equals':
        return `${lookupField}=${formattedValue}`;
      case 'notEqual':
        return `${lookupField}!=${formattedValue}`;
      case 'lessThan':
        return `${lookupField}<${formattedValue}`;
      case 'greaterThan':
        return `${lookupField}>${formattedValue}`;
      case 'lessOrEqual':
        return `${lookupField}<=${formattedValue}`;
      case 'greaterOrEqual':
        return `${lookupField}>=${formattedValue}`;
      case 'contains':
        return `${lookupField} IN ${formattedValue}`;
      case 'notContain':
        return `${lookupField} NOT IN ${formattedValue}`;
      case 'startsWith':
        return `${lookupField} LIKE '${escapeSOQLString(lookupValue.value, true)}%'`;
      case 'includes':
        return `${lookupField} INCLUDES ${formattedValue}`;
      case 'excludes':
        return `${lookupField} EXCLUDES ${formattedValue}`;
      default:
    }
  }

  function interpolate(booleanFilter, clauses) {
    if (booleanFilter) {
      return booleanFilter.replace(
        /(\d+)/g,
        (match, offset, string) => clauses[parseInt(match, 10) - 1]
      );
    } else {
      return clauses.join(' AND ');
    }
  }

  const sourceFields = filterItems
    .map(({ field }) => !!~field.indexOf('$Source') && field.replace('$Source.', ''))
    .filter(Boolean);

  const $Source =
    sourceFields.length > 0
      ? await api
          .query(
            `SELECT ${sourceFields.join(',')} FROM ${sourceDescription.name} WHERE Id='${recordId}'`
          )
          .then(results => results && results[0])
      : {};

  const clauses = filterItems.map(filter => createExpression($Source, filter)).filter(Boolean);

  return clauses.length > 0 && `(${interpolate(booleanFilter, clauses)})`;
}

function createGroupedFiltersClause(filters) {
  if (!filters || !filters.length) return;

  const grouped = filters.reduce((groupsByField, filter) => {
    const fieldName = filter.field.name;
    groupsByField[fieldName] = groupsByField[fieldName] || [];
    groupsByField[fieldName].push(filter);
    return groupsByField;
  }, {});

  return Object.values(grouped)
    .map(filters => {
      const groupClause = filters
        .map(createExpression)
        .filter(Boolean)
        .join(' OR ');
      return groupClause && `(${groupClause})`;
    })
    .filter(Boolean)
    .join(' AND ');
}

function createOrderBy(orderBy, implicitSort = 'Id') {
  const { field, direction } = orderBy;

  switch (field.type) {
    case 'location':
      return;
    case 'reference':
      return `ORDER BY ${field.relationshipName}.Name ${direction} NULLS LAST, ${implicitSort} ${direction}`;
    default:
      return `ORDER BY ${field.name} ${direction} NULLS LAST, ${implicitSort} ${direction}`;
  }
}

function createGroupedSearchClause(columns, keyword) {
  const clauses = columns
    .filter(searchableColumnsFilter)
    .map(({ type, name, relationshipName }) =>
      type === 'reference' ? `${relationshipName}.Name` : name
    )
    .map(columnName => `${columnName} LIKE '%${escapeSOQLString(keyword, true)}%'`)
    .filter(Boolean)
    .join(' OR ');

  return clauses && `(${clauses})`;
}

function createSearchClause(columns, searchParams) {
  const keywords = splitKeywords(searchParams);
  if (!keywords.length) return;
  const searchColumns = searchParams && searchParams.field ? [searchParams.field] : columns;
  return keywords.map(keyword => createGroupedSearchClause(searchColumns, keyword)).join(' AND ');
}

function createWhereClause(query) {
  const { columns, staticFilter, filters, searchParams } = query;
  const conditions = [];

  if (staticFilter) conditions.push(staticFilter);
  if (filters) conditions.push(createGroupedFiltersClause(filters));
  if (searchParams) conditions.push(createSearchClause(columns, searchParams));

  const filtered = conditions.filter(Boolean);
  if (!filtered.length) return;

  return `WHERE ${filtered.join(' AND ')}`;
}

function getFieldNames(description, columns) {
  const fields = ['Id', 'Name', 'CurrencyIsoCode'].filter(name => description.fields[name]);

  columns.forEach(({ type, name, relationshipName }) => {
    if (name) fields.push(name);
    if (type === 'reference') {
      fields.push(`${relationshipName}.Id`);
      fields.push(`${relationshipName}.Name`);
    }
  });

  return [...new Set(fields)]; // distinct fields
}

function splitKeywords(searchParams) {
  return searchParams
    ? searchParams.searchText
        .split(' ')
        .map(x => x.trim())
        .filter(x => x && x.length > 1)
    : [];
}

async function getColumnNamesFromSearchLayout(api, description) {
  const layout = await api.searchLayout(description.name);

  return layout.searchColumns.reduce((names, { name }) => {
    const fieldName = name
      .replace('r.Name', 'c')
      .replace('.Name', '')
      .replace('toLabel(', '')
      .replace(')', '');
    names.push(fieldName);
    return names;
  }, []);
}

export async function getSearchFields(api, description) {
  const columnNames = await getColumnNamesFromSearchLayout(api, description);
  return columnNames
    .map(name => description.fields[name])
    .filter(Boolean)
    .filter(field => !~SYSTEM_FIELDS.indexOf(field.name))
    .filter(field => !/^(FX5__)?Locked_/.test(field.name));
}

export async function executeQuery(api, query) {
  const { description, columns, orderBy, implicitSort } = query;
  if (!description || !columns || !orderBy) return [];

  const fieldNames = getFieldNames(description, columns);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${description.name}`];
  soql.push(createWhereClause(query));
  soql.push(createOrderBy(orderBy, implicitSort));
  soql.push(`LIMIT ${BUFFER_SIZE}`);

  return api.query(soql.join(' '));
}

export function executeScalar(api, query) {
  const { description, columns, orderBy } = query;
  if (!description || !columns || !orderBy) return;

  const soql = [`SELECT COUNT() FROM ${description.name}`];
  soql.push(createWhereClause(query));

  return api.queryCount(soql.join(' '));
}

function createStringMatcher(keyword) {
  return new RegExp(keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // $& means the whole matched string
}

export function executeLocalSearch(query, items, searchParams) {
  const keywords = splitKeywords(searchParams).map(createStringMatcher);
  if (keywords.length === 0) return items;

  const searchColumns = (searchParams && searchParams.field
    ? [searchParams]
    : query.columns
  ).filter(searchableColumnsFilter);

  items.forEach(item => {
    if (item._keywords) return;

    item._keywords = searchColumns
      .map(({ type, name, relationshipName }) =>
        type === 'reference' ? item[name] && item[relationshipName].Name : item[name]
      )
      .join(' ');
  });

  return items
    .filter(item =>
      keywords.reduce((result, search) => result && search.test(item._keywords), true)
    )
    .slice(0, BUFFER_SIZE);
}

export function queryLookupOptions(api, query, field) {
  const { description } = query;
  if (!description) return [];

  const fields = `${field.name}, ${field.relationshipName}.Name`;
  const soql = [`SELECT ${fields} FROM ${description.name}`];
  soql.push(
    createWhereClause({
      ...query,
      filters: query.filters.filter(filter => filter.field.name !== field.name)
    })
  );
  soql.push(`GROUP BY ${fields}`);
  soql.push(`ORDER BY ${field.relationshipName}.Name NULLS LAST`);

  return api.query(soql.join(' ')).then(results =>
    results.map(x => ({
      Id: x[field.name],
      Name: x.Name
    }))
  );
}

export function sortItems(query, items) {
  if (!items || items.length < 2) return items;

  const {
    orderBy: { field, direction }
  } = query;

  let sorter, key;

  switch (field.type) {
    case 'location':
      sorter = () => 0;
      break;
    case 'reference':
      key = field.relationshipName;
      sorter = (a, b) => (a[key] ? a[key].Name : '').localeCompare(b[key] ? b[key].Name : '');
      break;
    default:
      key = field.name;
      sorter = (a, b) => (a[key] || '').localeCompare(b[key] || '');
  }

  items.sort(sorter);
  if (direction === 'DESC') items.reverse();
  return items;
}

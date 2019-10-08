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
const TRUE_EXPRESSION = 'Id!=null';
const FALSE_EXPRESSION = 'Id=null';

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
    case 'time':
      return formatTimeExpressionValue(value);
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

function formatTimeExpressionValue(value) {
  // REST API (localhost) returns time as a valid string
  if (process.env.NODE_ENV === 'development') return value;

  // APEX returns time in milliseconds
  // but SOQL only accepts time in HH:MM:00.000Z format
  let hours, minutes;
  const MS_HOUR = 60 * 60 * 1000;
  const MS_MINUTE = 60 * 1000;
  hours = Math.floor(value / MS_HOUR);
  minutes = (value % MS_HOUR) / MS_MINUTE;

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:00.000Z`;
}

function createExpression(filter) {
  const { field, item } = filter;
  const formatted = formatExpressionValue(field.type, item[field.name]);
  return `${field.name} = ${formatted}`;
}

async function getParentLookupValue(api, settings) {
  const { sObjectName, recordId, pickerLookupField, pickerLookupValue } = settings;
  if (!sObjectName || !recordId || !pickerLookupField || !pickerLookupValue) return;

  try {
    const soql = `SELECT ${pickerLookupValue} FROM ${sObjectName} WHERE Id='${recordId}'`;
    const record = await api.query(soql).then(results => results && results[0]);
    return pickerLookupValue.split('.').reduce((value, key) => value && value[key], record);
  } catch (e) {}
}

export async function createPricebookFilterClauses(api, settings) {
  const parentLookupValue = await getParentLookupValue(api, settings);
  if (!parentLookupValue) return;

  const pricebooks = await api.query(
    `SELECT Id, FX5__Parent_Price_Book__c FROM FX5__Price_Book__c`
  );
  if (!pricebooks) return;

  const parentIds = pricebooks.reduce((parents, { Id, FX5__Parent_Price_Book__c }) => {
    parents[Id] = FX5__Parent_Price_Book__c;
    return parents;
  }, {});

  const parentChain = [];
  let parent = parentLookupValue;

  while (parent) {
    parentChain.push(parent);
    parent = parentIds[parent];
  }

  const filters = parentChain.map((id, index) => {
    const soql = [`FX5__Price_Book__c='${id}'`];
    if (index === 0) return soql[0];

    soql.push(`AND FX5__Catalog_Item__c NOT IN (`);
    soql.push(`SELECT FX5__Catalog_Item__c FROM FX5__CatalogItemPriceBook__c`);
    soql.push(`WHERE FX5__Price_Book__c IN (`);
    soql.push(
      parentChain
        .slice(0, index)
        .map(x => `'${x}'`)
        .join(',')
    );
    soql.push('))');
    return soql.join(' ');
  });

  return filters;
}

export async function createParentFilterClause(api, settings) {
  const { sObjectName, recordId, pickerLookupField, pickerLookupValue } = settings;
  if (!sObjectName || !recordId || !pickerLookupField || !pickerLookupValue) return;
  const lookupValue = await getParentLookupValue(api, settings);
  return lookupValue && `${pickerLookupField}='${lookupValue}'`;
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
    return { value, type: sourceDescription.fields[name].type, recordType: obj.RecordType };
  }

  function createStaticExpression(filter, left, right) {
    let leftValue = left.recordType
      ? `'${left.recordType.Name}'`
      : formatExpressionValue(left.type || right.type, left.value);
    let rightValue = right.recordType
      ? `'${right.recordType.Name}'`
      : formatExpressionValue(left.type || right.type, right.value);

    let result;

    switch (filter.operation) {
      case 'equals':
        result = leftValue === rightValue;
        break;
      case 'notEqual':
        result = leftValue !== rightValue;
        break;
      case 'lessThan':
        result = left.value < right.value;
        break;
      case 'greaterThan':
        result = left.value > right.value;
        break;
      case 'lessOrEqual':
        result = left.value <= right.value;
        break;
      case 'greaterOrEqual':
        result = left.value >= right.value;
        break;
      case 'contains':
        result = right.value && !!~String(left.value || '').indexOf(right.value);
        break;
      case 'notContain':
        result = right.value && !~String(left.value || '').indexOf(right.value);
        break;
      case 'startsWith':
        result = right.value && String(left.value || '').indexOf(right.value) === 0;
        break;
      default:
    }

    return result ? TRUE_EXPRESSION : FALSE_EXPRESSION;
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

    if (!leftField && !rightField) return createStaticExpression(filter, leftValue, rightValue);

    let lookupField, lookupValue;

    // make sure API names are always on the left side of an expression
    if (!leftField) {
      lookupField = rightField;
      lookupValue = leftValue;
    }
    if (!rightField) {
      lookupField = leftField;
      lookupValue = rightValue;
    }

    if (lookupField === lookupValue) {
      return createStaticExpression(filter, leftValue, rightValue);
    }

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

  const sourceFields = new Set(
    filterItems
      .reduce((paths, { field, valueField }) => {
        field && paths.push(field);
        valueField && paths.push(valueField);
        return paths;
      }, [])
      .filter(path => !!~path.indexOf('$Source'))
      .map(path => path.replace('$Source.', ''))
  );

  if (sourceFields.has('RecordTypeId')) {
    sourceFields.add('RecordType.Id');
    sourceFields.add('RecordType.Name');
  }

  const $Source =
    sourceFields.size > 0
      ? await api
          .query(
            `SELECT ${[...sourceFields].join(',')} FROM ${
              sourceDescription.name
            } WHERE Id='${recordId}'`
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

function createWhereClause(query, dynamicCondition) {
  const { columns, staticFilter, filters, searchParams } = query;
  const conditions = [];

  if (staticFilter) conditions.push(staticFilter);
  if (filters) conditions.push(createGroupedFiltersClause(filters));
  if (searchParams) conditions.push(createSearchClause(columns, searchParams));
  if (dynamicCondition) conditions.push(dynamicCondition);

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
    .filter(field => field.type !== 'textarea')
    .filter(field => !~SYSTEM_FIELDS.indexOf(field.name))
    .filter(field => !/^(FX5__)?Locked_/.test(field.name));
}

export async function executeQuery(api, query) {
  const { description, columns, orderBy, dynamicFilters } = query;
  if (!description || !columns || !orderBy) return [];
  if (dynamicFilters) {
    return Promise.all(dynamicFilters.map(filter => executeQuerySingle(api, query, filter)))
      .then(set => set.reduce((arr, x) => arr.concat(x), []))
      .then(items => sortItems(query, items));
  }
  return executeQuerySingle(api, query);
}

async function executeQuerySingle(api, query, dynamicFilter) {
  const { description, columns, orderBy, implicitSort } = query;
  const fieldNames = getFieldNames(description, columns);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${description.name}`];
  soql.push(createWhereClause(query, dynamicFilter));
  soql.push(createOrderBy(orderBy, implicitSort));
  soql.push(`LIMIT ${BUFFER_SIZE}`);

  return api.query(soql.join(' '));
}

export function executeScalar(api, query) {
  const { description, columns, orderBy, dynamicFilters } = query;
  if (!description || !columns || !orderBy) return;
  if (dynamicFilters) {
    return Promise.all(dynamicFilters.map(filter => executeScalarSingle(api, query, filter))).then(
      counts => counts.reduce((sum, x) => (sum += x), 0)
    );
  }
  return executeScalarSingle(api, query);
}

async function executeScalarSingle(api, query, dynamicFilter) {
  const { description } = query;
  const soql = [`SELECT COUNT() FROM ${description.name}`];
  soql.push(createWhereClause(query, dynamicFilter));

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
    case 'email':
    case 'phone':
    case 'picklist':
    case 'string':
    case 'textarea':
    case 'url':
      key = field.name;
      sorter = (a, b) => (a[key] || '').localeCompare(b[key] || '');
      break;
    default:
      key = field.name;
      sorter = (a, b) => a[key] - b[key];
  }

  items.sort(sorter);
  if (direction === 'DESC') items.reverse();
  return items;
}

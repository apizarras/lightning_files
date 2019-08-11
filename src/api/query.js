import { SYSTEM_FIELDS } from '../constants';

const BUFFER_SIZE = 100;

function searchableColumnsFilter(column) {
  // salesforce LIKE operator only supports strings
  const { type } = column;
  return type === 'string' || type === 'reference' || type === 'picklist';
}

function escapeSOQLString(str) {
  return String(str || '').replace(/'/g, "\\'");
}

function createFilterClause(filter) {
  const { field, item } = filter;
  const value = item[field.name];
  if (value === undefined || value === null) return `${field.name} = NULL`;

  let formatted;

  switch (field.type) {
    case 'reference':
      formatted = `'${value}'`;
      break;
    case 'picklist':
    case 'string':
      formatted = `'${escapeSOQLString(value)}'`;
      break;
    default:
      formatted = value.toString();
  }

  return `${field.name} = ${formatted}`;
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
      const groupClause = filters.map(createFilterClause).join(' OR ');
      return groupClause && `(${groupClause})`;
    })
    .filter(clause => clause)
    .join(' AND ');
}

function createOrderBy(orderBy) {
  const { field, direction } = orderBy;

  switch (field.type) {
    case 'location':
      return;
    case 'reference':
      return `ORDER BY ${field.relationshipName}.Name ${direction}, Id`;
    default:
      return `ORDER BY ${field.name} ${direction}, Id`;
  }
}

function createGroupedSearchClause(columns, keyword) {
  const clauses = columns
    .filter(searchableColumnsFilter)
    .map(({ type, name, relationshipName }) =>
      type === 'reference' ? `${relationshipName}.Name` : name
    )
    .map(columnName => `${columnName} LIKE '%${escapeSOQLString(keyword)}%'`)
    .filter(clause => clause)
    .join(' OR ');

  return clauses && `(${clauses})`;
}

function createSearchClause(columns, searchParams) {
  const keywords = splitKeywords(searchParams);
  if (!keywords.length) return;
  const searchColumns =
    searchParams && searchParams.field ? [searchParams.field] : columns;
  return keywords
    .map(keyword => createGroupedSearchClause(searchColumns, keyword))
    .join(' AND ');
}

function createWhereClause(query) {
  const { columns, staticFilters, filters, searchParams } = query;
  const conditions = [];

  if (staticFilters) conditions.push(createGroupedFiltersClause(staticFilters));
  if (filters) conditions.push(createGroupedFiltersClause(filters));
  if (searchParams) conditions.push(createSearchClause(columns, searchParams));

  const filtered = conditions.filter(x => x);
  if (!filtered.length) return;

  return `WHERE ${filtered.join(' AND ')}`;
}

function getFieldNames(description, columns, staticFilters) {
  const fields = [
    'Id',
    'CurrencyIsoCode',
    ...(staticFilters && staticFilters.map(({ field }) => field.name))
  ].filter(name => description.fields[name]);

  columns.forEach(field => {
    const { type, name, relationshipName } = field;
    fields.push(name);
    if (type === 'reference') fields.push(`${relationshipName}.Name`);
  }, []);
  return fields;
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

export async function getSearchColumns(api, settings, description) {
  const columnNames = await getColumnNamesFromSearchLayout(api, description);

  return columnNames
    .map(name => description.fields[name])
    .filter(field => field)
    .filter(
      field => !settings.hideSystemFields || !~SYSTEM_FIELDS.indexOf(field.name)
    )
    .filter(field => !~(settings.restrictedFields || []).indexOf(field.name))
    .filter(field => !/^(FX5__)?Locked_/.test(field.name));
}

export async function executeQuery(api, query) {
  const { description, columns, orderBy, staticFilters } = query;
  if (!description || !columns || !orderBy) return [];

  const fieldNames = getFieldNames(description, columns, staticFilters);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${description.name}`];
  soql.push(createWhereClause(query));
  soql.push(createOrderBy(orderBy));
  soql.push(`LIMIT ${BUFFER_SIZE}`);

  return api.query(soql.join(' '));
}

export function executeScalar(api, query) {
  const { description, columns, orderBy } = query;
  if (!description || !columns || !orderBy) return;

  const soql = [`SELECT COUNT() FROM ${description.name}`];
  soql.push(createWhereClause(query));

  return api.queryScalar(soql.join(' '));
}

export function executeLocalSearch(query, items, searchParams) {
  const keywords = splitKeywords(searchParams).map(
    x => new RegExp(x.trim(), 'i')
  );
  if (keywords.length === 0) return items;

  const searchColumns = (searchParams && searchParams.field
    ? [searchParams.field]
    : query.columns
  ).filter(searchableColumnsFilter);

  items.forEach(item => {
    if (item._keywords) return;

    item._keywords = searchColumns
      .map(({ type, name, relationshipName }) =>
        type === 'reference'
          ? item[name] && item[relationshipName].Name
          : item[name]
      )
      .join(' ');
  });

  return items
    .filter(item =>
      keywords.reduce(
        (result, search) => search.test(item._keywords) && result,
        true
      )
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
  soql.push(`ORDER BY ${field.relationshipName}.Name`);

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
      sorter = (a, b) =>
        (a[key] ? a[key].Name : '').localeCompare(b[key] ? b[key].Name : '');
      break;
    default:
      key = field.name;
      sorter = (a, b) => (a[key] || '').localeCompare(b[key] || '');
  }

  items.sort(sorter);
  if (direction === 'DESC') items.reverse();
  return items;
}

import { SYSTEM_FIELDS } from '../constants';

const BUFFER_SIZE = 200;
const MAX_COLUMNS = 10;

function searchableColumnsFilter(column) {
  const { type } = column;
  return type === 'string' || type === 'reference' || type === 'picklist';
}

function escapeSOQLString(str) {
  return String(str || '').replace(/'/g, "\\'");
}

function getSettingsFields(fields, setting) {
  return (
    setting &&
    setting
      .split(',')
      .map(name => fields[name.trim()])
      .filter(field => field)
  );
}

function criteria(field, item) {
  const value = item[field.name];
  if (!value) return 'NULL';

  switch (field.type) {
    case 'currency':
      return value;
    case 'reference':
      return `'${value}'`;
    default:
      return `'${escapeSOQLString(value)}'`;
  }
}

function getConditions(filters) {
  if (!filters || !filters.length) return;

  const grouped = filters.reduce((byField, filter) => {
    const fieldName = filter.field.name;
    byField[fieldName] = byField[fieldName] || [];
    byField[fieldName].push(filter);
    return byField;
  }, {});

  return Object.values(grouped)
    .map(filters => {
      const group = filters
        .map(({ field, item }) => `${field.name} = ${criteria(field, item)}`)
        .filter(clause => clause)
        .join(' OR ');
      return group && `(${group})`;
    })
    .join(' AND ');
}

function getFieldNames(columns) {
  const fieldNames = columns.reduce(
    (names, field) => {
      const { type, name, relationshipName } = field;
      names.push(name);
      if (type === 'reference') names.push(`${relationshipName}.Name`);
      return names;
    },
    ['Id', 'CurrencyIsoCode'] // TODO: verify CurrencyIsoCode exists (multicurrency enabled)
  );
  return fieldNames;
}

function getOrderBy(orderBy) {
  const { field, direction } = orderBy;
  switch (field.type) {
    case 'location':
      return;
    case 'reference':
      return ` ORDER BY ${field.relationshipName}.Name ${direction}`;
    default:
      return ` ORDER BY ${field.name} ${direction}`;
  }
}

function getKeywords(searchParams) {
  return searchParams
    ? searchParams.searchText
        .split(' ')
        .map(x => x.trim())
        .filter(x => x && x.length > 1)
    : [];
}

function getSearchConditions(columns, searchParams) {
  const keywords = getKeywords(searchParams);
  if (!keywords.length) return;
  const searchColumns =
    searchParams && searchParams.field ? [searchParams.field] : columns;
  return keywords
    .map(keyword => searchClause(searchColumns, keyword))
    .join(' AND ');
}

// salesforce LIKE operator only supports strings
function searchClause(columns, keyword) {
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

function getWhereClause(query) {
  const { columns, staticFilters, filters, searchParams } = query;
  const conditions = [];

  if (staticFilters) conditions.push(getConditions(staticFilters));
  if (filters) conditions.push(getConditions(filters));
  if (searchParams) conditions.push(getSearchConditions(columns, searchParams));

  const filtered = conditions.filter(x => x);
  if (!filtered.length) return;

  return `WHERE ${filtered.join(' AND ')}`;
}

export function getColumns(description, settings) {
  if (!description) return null;

  const columns =
    getSettingsFields(description.fields, settings.displayedColumns) ||
    Object.values(description.fields);

  return columns
    .filter(
      field => !settings.hideSystemFields || !~SYSTEM_FIELDS.indexOf(field.name)
    )
    .filter(field => !~(settings.restrictedFields || []).indexOf(field.name))
    .filter(field => !/^(FX5__)?Locked_/.test(field.name))
    .slice(0, MAX_COLUMNS);
}

export async function executeQuery(api, settings, query) {
  const { sobject, columns, orderBy, staticFilters } = query;
  if (!sobject || !columns || !orderBy) return [];

  const fieldNames = getFieldNames(columns, staticFilters);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${sobject}`];
  soql.push(getWhereClause(query));
  soql.push(getOrderBy(orderBy));
  soql.push(`LIMIT ${BUFFER_SIZE}`);

  return api.query(soql.join(' '));
}

export function executeScalar(api, settings, query) {
  const { sobject, columns, orderBy } = query;
  if (!sobject || !columns || !orderBy) return;

  const soql = [`SELECT COUNT() FROM ${sobject}`];
  soql.push(getWhereClause(query));

  return api.queryScalar(soql.join(' '));
}

export function executeLocalSearch(query, items, searchParams) {
  const keywords = getKeywords(searchParams).map(
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
  const { sobject } = query;
  if (!sobject) return [];

  const fields = `${field.name}, ${field.relationshipName}.Name`;
  const soql = [`SELECT ${fields} FROM ${sobject}`];
  soql.push(getWhereClause(query));
  soql.push(`GROUP BY ${fields}`);
  soql.push(`ORDER BY ${field.relationshipName}.Name`);

  return api.query(soql.join(' ')).then(results =>
    results.map(x => ({
      Id: x[field.name],
      Name: x.Name
    }))
  );
}

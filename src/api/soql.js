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

export function getSettingsFields(fields, setting) {
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

  return filters
    .map(({ field, item }) => `${field.name} = ${criteria(field, item)}`)
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

function getKeywords(searchText) {
  return searchText
    ? searchText
        .split(' ')
        .map(x => x.trim())
        .filter(x => x && x.length > 1)
    : [];
}

function getSearchConditions(columns, searchText) {
  const keywords = getKeywords(searchText);
  if (!keywords.length) return;
  return keywords.map(keyword => searchClause(columns, keyword)).join(' AND ');
}

// salesforce LIKE operator only supports strings
function searchClause(columns, keyword) {
  const clauses = columns
    .filter(searchableColumnsFilter)
    .map(({ type, name, relationshipName }) =>
      type === 'reference' ? `${relationshipName}.Name` : name
    )
    .map(columnName => `${columnName} LIKE '%${escapeSOQLString(keyword)}%'`)
    .join(' OR ');

  return `(${clauses})`;
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
  const {
    sobject,
    columns,
    orderBy,
    staticFilters,
    filters,
    searchText
  } = query;
  if (!sobject || !columns || !orderBy) return [];

  const fieldNames = getFieldNames(columns, staticFilters);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${sobject}`];
  const conditions = [];

  if (staticFilters) conditions.push(getConditions(staticFilters));
  if (filters) conditions.push(getConditions(filters));
  if (searchText) conditions.push(getSearchConditions(columns, searchText));
  if (conditions.filter(x => x).length)
    soql.push(`WHERE ${conditions.filter(x => x).join(' AND ')}`);

  soql.push(getOrderBy(orderBy));
  soql.push(`LIMIT ${BUFFER_SIZE}`);

  return api.query(soql.join(' '));
}

export function executeScalar(api, settings, query) {
  const {
    sobject,
    columns,
    orderBy,
    staticFilters,
    filters,
    searchText
  } = query;
  if (!sobject || !columns || !orderBy) return;

  const soql = [`SELECT COUNT() FROM ${sobject}`];
  const conditions = [];

  if (staticFilters) conditions.push(getConditions(staticFilters));
  if (filters) conditions.push(getConditions(filters));
  if (searchText) conditions.push(getSearchConditions(columns, searchText));
  if (conditions.filter(x => x).length)
    soql.push(`WHERE ${conditions.filter(x => x).join(' AND ')}`);

  return api.queryScalar(soql.join(' '));
}

export function executeLocalSearch(query, items, textSearch) {
  const keywords = getKeywords(textSearch).map(x => new RegExp(x.trim(), 'i'));
  if (keywords.length === 0) return items;

  items.forEach(item => {
    if (item._keywords) return;

    item._keywords = query.columns
      .filter(searchableColumnsFilter)
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

export function queryReducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case 'UPDATE_COLUMNS':
      return { ...state, columns: payload };
    case 'UPDATE_SORT':
      const direction = state.orderBy
        ? state.orderBy.field === payload
          ? state.orderBy.direction === 'ASC'
            ? 'DESC'
            : 'ASC'
          : 'ASC'
        : 'ASC';

      return { ...state, orderBy: { field: payload, direction } };
    case 'ADD_FILTER':
      if (
        state.filters.find(
          ({ field, item }) =>
            field.name === payload.field.name &&
            item[field.name] === payload.item[field.name]
        )
      ) {
        return state;
      }
      return { ...state, filters: state.filters.concat(payload) };
    case 'REMOVE_FILTER':
      return { ...state, filters: state.filters.filter(x => x !== payload) };
    case 'UPDATE_SEARCH':
      if (state.searchText === payload || payload.length === 1) return state;
      return { ...state, searchText: payload };
    case 'RESET':
      return getInitialQuery(payload);
    default:
      return state;
  }
}

export function getInitialQuery(settings) {
  return {
    sobject: settings.sobject,
    columns: undefined,
    orderBy: undefined,
    staticFilters: settings.staticFilters,
    filters: [],
    searchText: undefined
  };
}

function escapeSOQLString(str) {
  return String(str || '').replace(/'/g, "\\'");
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

function getFieldNames(fields) {
  const fieldNames = fields.reduce(
    (names, field) => {
      const { type, name, relationshipName } = field;
      names.push(name);
      if (type === 'reference') names.push(`${relationshipName}.Name`);
      return names;
    },
    ['Id', 'CurrencyIsoCode'] // TODO: verify CurrencyIsoCode exists
  );
  return fieldNames;
}

function getOrderBy(orderBy) {
  const { field, direction } = orderBy;
  return ` ORDER BY ${field.name} ${direction}`;
}

function getSearchConditions(fields, searchText) {
  const keywords = searchText
    ? searchText
        .trim()
        .split(' ')
        .filter(x => x)
    : [];

  if (!keywords.length) return;

  return keywords.map(keyword => searchClause(fields, keyword)).join(' AND ');
}

// salesforce LIKE operator only supports strings
function searchClause(fields, keyword) {
  const clauses = fields
    .filter(({ type }) => type === 'string' || type === 'reference')
    .map(({ type, name, relationshipName }) =>
      type === 'reference' ? `${relationshipName}.Name` : name
    )
    .map(columnName => `${columnName} LIKE '%${escapeSOQLString(keyword)}%'`)
    .join(' OR ');

  return `(${clauses})`;
}

export async function query(
  api,
  sobject,
  columns,
  orderBy,
  staticFilters,
  filters,
  searchText
) {
  if (!sobject || !columns || !orderBy) return;

  const fieldNames = getFieldNames(columns, staticFilters);
  const soql = [`SELECT ${fieldNames.join(',')} FROM ${sobject}`];
  const conditions = [];
  if (staticFilters) conditions.push(getConditions(staticFilters));
  if (filters) conditions.push(getConditions(filters));
  if (searchText) conditions.push(getSearchConditions(columns, searchText));
  if (conditions.filter(x => x).length)
    soql.push(`WHERE ${conditions.filter(x => x).join(' AND ')}`);
  soql.push(getOrderBy(orderBy));
  soql.push(`LIMIT 100`);
  return api.query(soql.join(' '));
}

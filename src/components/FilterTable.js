import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeQuery, executeLocalSearch } from '../api/soql';
import DataTable from './DataTable';
import './FilterTable.scss';

const FilterTable = props => {
  const {
    selectedItems,
    query,
    searchText,
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;
  const { api, settings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!query.columns) return;

    async function fetchRows() {
      setLoading(true);
      const items = await executeQuery(api, settings, query);
      setItems(items);
      setLoading(false);
    }

    fetchRows();
  }, [api, settings, query]);

  useEffect(() => {
    if (query.searchText === searchText) return;
    const filteredItems = executeLocalSearch(query, items, searchText);
    if (filteredItems === items) return;
    setItems(filteredItems);
    setLoading(true);
  }, [query, items, searchText]);

  if (!query.columns) return null;

  const selectedIds = selectedItems.reduce((ids, x) => {
    ids[x.Id] = true;
    return ids;
  }, {});
  const availableItems = items.filter(x => !selectedIds[x.Id]);

  return (
    <div className="filter-table">
      <div className="slds-card__body slds-card__body--inner">
        <strong>
          {selectedItems.length} Selected Item
          {selectedItems.length === 1 ? '' : 's'}
        </strong>
      </div>

      <DataTable
        loading={loading}
        query={query}
        items={availableItems}
        onAddFilter={onAddFilter}
        onUpdateSort={onUpdateSort}
        onSelectItem={onSelectItem}
        onRemoveItem={onRemoveItem}
      />

      <div className="slds-card__body slds-card__body--inner">
        <strong>
          {selectedItems.length} Selected Item
          {selectedItems.length === 1 ? '' : 's'}
        </strong>
      </div>

      {selectedItems.length > 0 && (
        <DataTable
          query={query}
          items={selectedItems}
          selectedItems={selectedItems}
          onAddFilter={onAddFilter}
          onSelectItem={onSelectItem}
          onRemoveItem={onRemoveItem}
        />
      )}
    </div>
  );
};

export default FilterTable;

import React, { useState, useEffect } from 'react';
import { useComponentContext } from '../context';
import { executeQuery, executeLocalSearch } from '../api/query';
import DataTable from './DataTable';
import { Tabs, TabsPanel } from '@salesforce/design-system-react';
import './FilterTable.scss';

const FilterTable = props => {
  const {
    compact,
    multiSelect,
    showRecentItems,
    recentItems,
    selectedItems,
    query,
    columns,
    searchParams,
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;
  const { api } = useComponentContext();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!query.columns) return;
    let cancelled = false;

    async function fetchRows() {
      setLoading(true);
      const items = await executeQuery(api, query);
      if (cancelled) return;
      setItems(items);
      setLoading(false);
    }

    fetchRows();
    return () => (cancelled = true);
  }, [api, query]);

  useEffect(() => {
    if (!query.columns) return;
    if (query.searchParams === searchParams) return;
    const filteredItems = executeLocalSearch(query, items, searchParams);
    if (filteredItems === items) return;

    setItems(filteredItems);
    setLoading(true);
  }, [query, items, searchParams]);

  useEffect(() => {
    if (selectedItems.length === 0) setTabIndex(0);
  }, [selectedItems]);

  return (
    <div className="filter-table">
      <Tabs id="tabs-tables" selectedIndex={tabIndex} onSelect={setTabIndex}>
        <TabsPanel label="Top Search Results">
          <DataTable
            compact={compact}
            style={{ height: 350 }}
            loading={loading}
            columns={columns}
            orderBy={query.orderBy}
            items={items}
            selectedItems={selectedItems}
            onAddFilter={onAddFilter}
            onUpdateSort={onUpdateSort}
            onSelectItem={onSelectItem}
            onRemoveItem={onRemoveItem}
          />
        </TabsPanel>
        {showRecentItems && (
          <TabsPanel label="Recent Items">
            <DataTable
              compact={compact}
              style={{ height: 150 }}
              columns={columns}
              orderBy={query.orderBy}
              items={recentItems}
              selectedItems={selectedItems}
              onSelectItem={onSelectItem}
              onRemoveItem={onRemoveItem}
            />
          </TabsPanel>
        )}
        {multiSelect && selectedItems.length > 0 && (
          <TabsPanel
            label={`${selectedItems.length} Selected Item${selectedItems.length === 1 ? '' : 's'}`}>
            <DataTable
              compact={compact}
              style={{ height: 350 }}
              columns={columns}
              orderBy={query.orderBy}
              items={selectedItems}
              selectedItems={selectedItems}
              onAddFilter={onAddFilter}
              onUpdateSort={onUpdateSort}
              onSelectItem={onSelectItem}
              onRemoveItem={onRemoveItem}
            />
          </TabsPanel>
        )}
      </Tabs>
    </div>
  );
};

export default FilterTable;

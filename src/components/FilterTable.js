import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeQuery, executeLocalSearch } from '../api/query';
import DataTable from './DataTable';
import { Accordion, AccordionPanel } from '@salesforce/design-system-react';
import './FilterTable.scss';

const FilterTable = props => {
  const {
    compact,
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
  const { api } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showRecents, setShowRecents] = useState(false);
  const [showSelected, setShowSelected] = useState(false);

  useEffect(() => {
    if (!query.columns) return;
    let cancelled = false;

    async function fetchRows() {
      setLoading(true);
      if (query.searchParams) setShowResults(true);
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
    setShowResults(true);
  }, [query, items, searchParams]);

  return (
    <div className="filter-table">
      <Accordion>
        <AccordionPanel
          id="results"
          expanded={showResults}
          onTogglePanel={() => setShowResults(!showResults)}
          summary="Top Search Results"
        >
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
        </AccordionPanel>
        {recentItems.length > 0 && (
          <AccordionPanel
            id="recents"
            expanded={showRecents}
            onTogglePanel={() => setShowRecents(!showRecents)}
            summary="Recent Items"
          >
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
          </AccordionPanel>
        )}
        <AccordionPanel
          id="selected"
          expanded={showSelected}
          onTogglePanel={() => setShowSelected(!showSelected)}
          summary={`${selectedItems.length || 'No'} Selected Item${
            selectedItems.length === 1 ? '' : 's'
          }`}
        >
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
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default FilterTable;

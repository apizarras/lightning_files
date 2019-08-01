import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeQuery, executeLocalSearch } from '../api/query';
import DataTable from './DataTable';
import { Accordion, AccordionPanel } from '@salesforce/design-system-react';
import './FilterTable.scss';

const FilterTable = props => {
  const {
    selectedItems,
    query,
    searchParams,
    onAddFilter,
    onUpdateSort,
    onSelectItem,
    onRemoveItem
  } = props;
  const { api, settings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [showResults, setShowResults] = useState(true);
  const [showSelected, setShowSelected] = useState(false);

  useEffect(() => {
    if (!query.columns) return;
    let cancelled = false;

    async function fetchRows() {
      setLoading(true);
      const items = await executeQuery(api, settings, query);
      if (cancelled) return;
      setItems(items);
      setLoading(false);
    }

    fetchRows();
    return () => (cancelled = true);
  }, [api, settings, query]);

  useEffect(() => {
    if (query.searchParams === searchParams) return;
    const filteredItems = executeLocalSearch(query, items, searchParams);
    if (filteredItems === items) return;

    setItems(filteredItems);
    setLoading(true);
    setShowResults(true);
  }, [query, items, searchParams]);

  if (!query.columns) return null;

  const selectedIds = selectedItems.reduce((ids, x) => {
    ids[x.Id] = true;
    return ids;
  }, {});
  const availableItems = items.filter(x => !selectedIds[x.Id]).slice(0, 100);

  return (
    <div className="filter-table">
      <Accordion>
        <AccordionPanel
          id="results"
          expanded={showResults}
          onTogglePanel={() => setShowResults(!showResults)}
          summary="Search Results (Top 100)"
        >
          <DataTable
            compact={true}
            style={{ height: 350 }}
            loading={loading}
            query={query}
            items={availableItems}
            onAddFilter={onAddFilter}
            onUpdateSort={onUpdateSort}
            onSelectItem={onSelectItem}
            onRemoveItem={onRemoveItem}
          />
        </AccordionPanel>
        <AccordionPanel
          id="selected"
          expanded={showSelected}
          onTogglePanel={() => setShowSelected(!showSelected)}
          summary={`${selectedItems.length || 'No'} Selected Item${
            selectedItems.length === 1 ? '' : 's'
          }`}
        >
          {selectedItems.length > 0 && (
            <DataTable
              compact={true}
              query={query}
              items={selectedItems}
              selectedItems={selectedItems}
              onAddFilter={onAddFilter}
              onSelectItem={onSelectItem}
              onRemoveItem={onRemoveItem}
            />
          )}
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default FilterTable;

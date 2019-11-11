import React, { createContext, useState, useContext, useEffect } from 'react';
import { useFields, useInitialFields, useProcessedRows, useMetadata, useDebounce } from '../hooks';
import { LightningContext } from '.';
import { fetchRows, fetchCount, fetchUpdatedRows } from '../../api/fetchRows';

export const DataContext = createContext();

export const DataContextProvider = ({ children }) => {
  const { dataService, handleLightningSelect, settings } = useContext(LightningContext);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [countOfRows, setCountOfRows] = useState(0);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState(null);
  const [gridMeta, setGridMeta] = useState({
    rowCount: 0,
    totalLoaded: 0
  });
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [successfulDelete, setSuccessfulDelete] = useState(false);
  const [fields, shouldUpdate, setShouldUpdate, readOnlyRow] = useFields();
  const { fieldsWarning } = useInitialFields();

  const processedRows = useProcessedRows(rows, fields);
  const [expanded, setExpanded] = useState({ expandedRows: {}, rows: [] });
  const [filters, setFilters] = useState({});
  const [queryFilters, setQueryFilters] = useState({});
  const [sortSettings, setSortSettings] = useState({
    field: settings.initialSortColApiName && settings.initialSortColApiName.trim(),
    direction: settings.initialSortDirection
  });
  const { description, fieldDescriptions, childRelationships, layoutFields } = useMetadata();
  const debouncedFilters = useDebounce(queryFilters, 500);

  useEffect(() => {
    const unsupportedFilterTypes = ['double', 'percent', 'currency', 'datetime', 'date', 'time'];
    const newFilters = {};
    let changed = false;

    Object.keys(filters).forEach(key => {
      if (!unsupportedFilterTypes.includes(filters[key].column.type) && filters[key].rawValue) {
        newFilters[key] = filters[key];
        if (!queryFilters[key] || queryFilters[key].rawValue !== filters[key].rawValue)
          changed = true;
      }
    });
    Object.keys(queryFilters).forEach(key => {
      if (!filters[key]) changed = true;
    });
    if (changed) setQueryFilters(newFilters);
  }, [filters, queryFilters]);

  useEffect(() => {
    if (!settings.fieldsList || !fieldDescriptions || !childRelationships || !layoutFields) return;
    let canceled = false;

    const params = {
      ...settings,
      rowLimit: (page + 1) * settings.rowsPerPage,
      filters: debouncedFilters,
      fieldDescriptions,
      childRelationships,
      dataService,
      sortSettings
    };
    setRowsLoading(true);

    Promise.all([fetchRows(params), fetchCount(params)])
      .then(([data, count]) => {
        if (canceled) return;
        setRows(data);
        setCountOfRows(count);
        setExpanded({ expandedRows: {}, rows: [] });
        const recordsCount = data.reduce(
          (counter, parentItem) => (counter += parentItem.children.length),
          data.length
        );
        setGridMeta({ rowCount: count, totalLoaded: recordsCount === count });
      })
      .catch(e => {
        setRowsError(e);
      })
      .finally(() => {
        setRowsLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [
    fields,
    layoutFields,
    debouncedFilters,
    fieldDescriptions,
    childRelationships,
    page,
    dataService,
    settings,
    sortSettings
  ]);

  const getUpdatedRows = rowIds => {
    const params = {
      ...settings,
      fieldDescriptions,
      dataService,
      rowIds
    };
    return fetchUpdatedRows(params);
  };

  const handleRowDelete = () => {
    return dataService
      .deleteItems(settings.objType, selectedRowIds)
      .then(response => {
        const { deletedRecords, errors } = response;

        let deleted = null;
        if (errors.length > 0) {
          setRowsError(errors[0]);
          deleted = false;
        }

        if (deletedRecords.length > 0) {
          const newRows = rows.reduce((updated, r) => {
            if (r.children) r.children = r.children.filter(c => !deletedRecords.includes(c.Id));
            if (deletedRecords.includes(r.Id)) return updated;
            updated.push(r);
            return updated;
          }, []);

          setRows(newRows);
          setGridMeta({
            rowCount: gridMeta.rowCount - deletedRecords.length,
            totalLoaded: (page + 1) * settings.rowsPerPage >= countOfRows
          });
          deleted = true;
        }

        setSuccessfulDelete(deleted);
        setSelectedRowIds([]);
        handleLightningSelect([]);
      })
      .catch(error => {
        console.error(error);
        setRowsError(error);
      });
  };

  const value = {
    countOfRows,
    fields,
    layoutFields,
    shouldUpdate,
    setShouldUpdate,
    readOnlyRow,
    filters,
    setFilters,
    sortSettings,
    setSortSettings,
    fieldsWarning,
    pluralLabel: description && description.labelPlural,
    rows: {
      rows: processedRows,
      rowsLoading,
      setRowsError,
      rowsError,
      setRows,
      gridMeta,
      handleRowDelete,
      setSuccessfulDelete,
      successfulDelete
    },
    pages: {
      page,
      setPage
    },
    expanded,
    setExpanded,
    selected: {
      selectedRowIds,
      setSelectedRowIds
    },
    getUpdatedRows
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

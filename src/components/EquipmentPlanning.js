import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DataTable, DataTableColumn } from '@salesforce/design-system-react';

export default function EquipmentPlanning(props) {
  const { api } = useAppContext();
  const [fields, setFields] = useState(null);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const fieldsByName = await api.describeFields(
        'FX5__Equipment_Planning__c'
      );
      const fieldNames = Object.keys(fieldsByName).join(',');
      const soql = `SELECT ${fieldNames} FROM FX5__Equipment_Planning__c`;
      const rows = await api.query(soql);

      setFields(fieldsByName);
      setRows(rows);
    }

    fetchRows();
  }, [api]);

  if (!fields || !rows) return null;

  return (
    <DataTable items={rows} striped>
      {Object.values(fields).map(({ name, label }) => (
        <DataTableColumn key={name} label={label} property={name} />
      ))}
    </DataTable>
  );
}

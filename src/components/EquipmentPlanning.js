import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DataTable, DataTableColumn } from '@salesforce/design-system-react';

export default function EquipmentPlanning(props) {
  const { api } = useAppContext();
  const [fields, setFields] = useState(null);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const description = await api.describe('FX5__Equipment_Planning__c');
      const fieldNames = description.fields.map(({ name }) => name).join(',');
      const soql = `SELECT ${fieldNames} FROM FX5__Equipment_Planning__c`;
      const rows = await api.query(soql);

      setFields(description.fields);
      setRows(rows);
    }

    fetchRows();
  }, [api]);

  if (!fields || !rows) return null;

  return (
    <div className="slds-scrollable">
      <DataTable items={rows} striped fixedHeader>
        {fields.map(({ name, label }) => (
          <DataTableColumn key={name} label={label} property={name} />
        ))}
      </DataTable>
    </div>
  );
}

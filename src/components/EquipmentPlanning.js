import React, { useState, useEffect } from 'react';
import { useLightningContext } from '../contexts/LightningContext';

export default function EquipmentPlanning(props) {
  const { api } = useLightningContext();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const result = await api
        .describeFields('FX5__Equipment_Planning__c')
        .then(fieldDescriptions => {
          const fieldList = Object.keys(fieldDescriptions).join(',');
          return `SELECT ${fieldList} FROM FX5__Equipment_Planning__c`;
        })
        .then(soql => api.query(soql));

      setRows(result);
    }

    fetchRows();
  }, [api]);

  if (!rows) return 'no rows found';

  return (
    <div>
      {rows.map(r => (
        <div key={r.Id}>{JSON.stringify(r)}</div>
      ))}
    </div>
  );
}

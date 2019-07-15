import React, { useState, useEffect } from 'react';
import { useApi } from '../api';

export default function EquipmentPlanning(props) {
  const api = useApi();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const soql = await api
        .describeFields('FX5__Equipment_Planning__c')
        .then(fieldDescriptions => {
          const fieldList = Object.keys(fieldDescriptions).join(',');
          return `SELECT ${fieldList} FROM FX5__Equipment_Planning__c`;
        });
      const result = await api.query(soql);

      setRows(result);
    }

    fetchRows();
  }, []);

  if (!rows) return 'no rows found';

  return (
    <div>
      {rows.map(r => (
        <div key={r.Id}>{JSON.stringify(r)}</div>
      ))}
    </div>
  );
}

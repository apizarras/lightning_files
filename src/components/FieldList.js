import React, { useState, useEffect } from 'react';
import { useLightningContext } from '../contexts/LightningContext';

export default function FieldList(props) {
  const { api } = useLightningContext();
  const [fieldList, setFieldList] = useState(null);

  useEffect(() => {
    async function fetchFields() {
      const fieldDescriptions = await api.describeFields(
        'FX5__Equipment_Planning__c'
      );

      setFieldList(Object.keys(fieldDescriptions).join(' '));
    }

    fetchFields();
  }, [api]);

  if (!fieldList) return 'no fields found';

  return <div>{fieldList}</div>;
}

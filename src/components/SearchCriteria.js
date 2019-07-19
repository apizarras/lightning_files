import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SearchCriteria = props => {
  const { api } = useAppContext();
  const [theme, setTheme] = useState();
  const [fields, setFields] = useState();

  useEffect(() => {
    async function fetchData() {
      Promise.all([
        api.theme(),
        api.describe('FX5__Equipment_Planning__c')
      ]).then(([theme, description]) => {
        setTheme(theme);
        setFields(description.fields);
        console.log({ description, theme });
      });
    }

    fetchData();
  }, [api]);

  return (
    <div>
      <input type="text" />
    </div>
  );
};

export default SearchCriteria;

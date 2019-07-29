import React, { useState, useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import ItemPicker from './components/ItemPicker';

const App = () => {
  const { api, settings } = useAppContext();
  const [description, setDescription] = useState();

  useEffect(() => {
    async function fetchColumns() {
      if (!settings.sobject) return;
      const description = await api.describe(settings.sobject);
      setDescription(description);
    }

    fetchColumns();
  }, [api, settings]);

  if (!description) return null;

  return <ItemPicker key={description.name} description={description} />;
};

export default App;

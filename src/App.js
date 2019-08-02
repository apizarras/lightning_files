import React, { useState, useEffect } from 'react';
import { useAppContext } from './contexts/AppContext';
import ItemPicker from './components/ItemPicker';
import { Modal, Button } from '@salesforce/design-system-react';

const App = () => {
  const { api, settings } = useAppContext();
  const [description, setDescription] = useState();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchColumns() {
      if (!settings.sobject) return;
      const description = await api.describe(settings.sobject);
      setDescription(description);
    }

    fetchColumns();
  }, [api, settings]);

  if (!description) return null;

  return (
    <>
      <Button label="Open Item Picker" onClick={() => setIsOpen(true)} />
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        size="medium"
      >
        <ItemPicker key={description.name} description={description} />
      </Modal>
    </>
  );
};

export default App;

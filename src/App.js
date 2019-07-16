import React from 'react';
import FieldList from './components/FieldList';
import EquipmentPlanning from './components/EquipmentPlanning';
import { ToastContainer, Toast } from './components/Toast';

const App = () => {
  return (
    <div className="slds-is-relative">
      <ToastContainer>
        <Toast title="test" type="success" description="this is only a test" />
      </ToastContainer>
      <FieldList />
      <EquipmentPlanning />
    </div>
  );
};

export default App;

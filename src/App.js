import React from 'react';
import FieldList from './components/FieldList';
import EquipmentPlanning from './components/EquipmentPlanning';
import styles from './App.module.css';

const App = () => {
  return (
    <div className={styles.App}>
      <FieldList />
      <EquipmentPlanning />
    </div>
  );
};

export default App;

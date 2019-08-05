import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeScalar } from '../api/query';
import {
  Icon,
  PageHeader,
  PageHeaderControl,
  Button,
  Dropdown,
  DropdownTrigger,
  ButtonGroup
} from '@salesforce/design-system-react';

const Header = props => {
  const {
    description,
    query,
    displayedColumns,
    selectedItems,
    onConfirm,
    onClear,
    onColumnsChange
  } = props;
  const { api } = useAppContext();
  const [count, setCount] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const count = await executeScalar(api, query);
      setCount(count);
    }

    fetchRows();
  }, [api, query]);

  if (!query.columns) return null;

  function onColumnSelect({ value }) {
    const found = displayedColumns.find(({ field }) => field.name === value);
    found.visible = !found.visible;
    onColumnsChange([...displayedColumns]);
  }

  const options = displayedColumns.map(({ visible, field }) => ({
    value: field.name,
    label: field.label
  }));

  const selected = displayedColumns
    .filter(x => x.visible)
    .map(({ field }) => field.name);

  return (
    <PageHeader
      joined
      truncate
      variant="object-home"
      title={description.labelPlural}
      label="Item Picker"
      icon={<Icon category="standard" name="multi_select_checkbox" />}
      info={
        count > 0
          ? `${count} ${
              count === 1 ? 'item' : 'items'
            } • sorted by ${query.orderBy && query.orderBy.field.label}`
          : 'No Matches'
      }
      onRenderActions={() =>
        selectedItems.length > 0 && (
          <PageHeaderControl>
            <Button
              className="slds-float_right"
              onClick={onConfirm}
              disabled={selectedItems.length === 0}
              variant="brand"
              label={`Confirm ${selectedItems.length || 'No'} ${
                selectedItems.length === 1 ? 'Item' : 'Items'
              }`}
            />
            <Button
              className="slds-m-right_medium slds-float_right"
              variant="base"
              label="Clear Selection"
              onClick={onClear}
            />
          </PageHeaderControl>
        )
      }
      onRenderControls={() => (
        <PageHeaderControl>
          <ButtonGroup variant="list">
            <Dropdown
              align="right"
              assistiveText={{ icon: 'Edit Columns' }}
              iconCategory="utility"
              iconName="settings"
              iconVariant="more"
              id="page-header-dropdown-object-home-content-right-2"
              options={options}
              value={selected}
              checkmark={true}
              multiple={true}
              onSelect={onColumnSelect}
            >
              <DropdownTrigger>
                <Button
                  assistiveText={{ icon: 'Edit Columns' }}
                  iconCategory="utility"
                  iconName="table"
                  iconVariant="more"
                  variant="icon"
                />
              </DropdownTrigger>
            </Dropdown>
            {/* <Dropdown
              align="right"
              assistiveText={{ icon: 'Add Filter' }}
              iconCategory="utility"
              iconName="filterList"
              iconVariant="more"
              id="page-header-dropdown-object-home-content-right-2"
              options={filterOptions}
            >
              <DropdownTrigger>
                <Button
                  assistiveText={{ icon: 'Add Filter' }}
                  iconCategory="utility"
                  iconName="filterList"
                  iconVariant="more"
                  variant="icon"
                />
              </DropdownTrigger>
            </Dropdown> */}
          </ButtonGroup>
        </PageHeaderControl>
      )}
    />
  );
};

export default Header;

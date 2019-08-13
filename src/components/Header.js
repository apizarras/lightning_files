import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeScalar } from '../api/query';
import {
  Icon,
  PageHeader,
  PageHeaderControl,
  Button,
  Checkbox,
  Popover
} from '@salesforce/design-system-react';
import './Header.scss';

const Header = props => {
  const {
    description,
    query,
    columns,
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

  function onColumnSelect(column) {
    const found = columns.find(x => x === column);
    found.visible = !found.visible;
    onColumnsChange([...columns]);
  }

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
          : ''
      }
      onRenderActions={
        selectedItems.length > 0
          ? () => (
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
          : undefined
      }
      onRenderControls={() => (
        <PageHeaderControl>
          <Popover
            triggerClassName="column-editor"
            hasNoCloseButton={true}
            position="relative"
            align="bottom right"
            body={columns.map((column, index) => (
              <div className="column-selection" key={column.field.name}>
                <label>
                  <Checkbox
                    checked={column.visible}
                    onChange={() => onColumnSelect(column)}
                  />
                  {column.field.label}
                </label>
              </div>
            ))}
          >
            <Button
              assistiveText={{ icon: 'Edit Columns' }}
              iconCategory="utility"
              iconName="table"
              iconVariant="more"
              variant="icon"
            />
          </Popover>
        </PageHeaderControl>
      )}
    />
  );
};

export default Header;

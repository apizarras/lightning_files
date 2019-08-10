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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Header.scss';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',

  // change background colour if dragging
  background: isDragging ? '#def' : '',
  boxShadow: isDragging ? '0 0 4px 2px rgba(0,0,0,.2)' : '',

  // styles we need to apply on draggables
  ...draggableStyle
});

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

  if (!query.columns) return null;

  function onColumnSelect(column) {
    const found = columns.find(x => x === column);
    found.visible = !found.visible;
    onColumnsChange([...columns]);
  }

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reordered = reorder(
      columns,
      result.source.index,
      result.destination.index
    );
    onColumnsChange([...reordered]);
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
          : 'No Matches'
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
            body={
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {columns.map((column, index) => (
                        <Draggable
                          key={column.field.name}
                          draggableId={column.field.name}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className="column-selection"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <Checkbox
                                checked={column.visible}
                                onChange={() => onColumnSelect(column)}
                              />
                              <label>{column.field.label}</label>
                              <Icon
                                category="utility"
                                name="drag_and_drop"
                                size="xx-small"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            }
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

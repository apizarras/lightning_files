import React from 'react';
import { DataTableCell, Checkbox } from '@salesforce/design-system-react';


const CustomDataTableCell = ({ children, ...props }) => {
  const items = props.items;
  const file = {
    id: props.item.id,
    LatestPublishedVersionId: props.item.LatestPublishedVersionId,
    sync: props.item.sync
  };
  let checkboxValue = props.item.sync;
  const Id = props.item.id;
  const sendData = () => {
    props.handleCheckboxChange(Id, checkboxValue, [items], file);
  };
  return(
    <DataTableCell title="title">
      <Checkbox checked={checkboxValue} id={Id} onChange={sendData} />
    </DataTableCell>
  )
};
CustomDataTableCell.displayName = DataTableCell.displayName;

export default CustomDataTableCell;
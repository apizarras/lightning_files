import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { executeScalar } from '../api/soql';
import {
  PageHeader,
  PageHeaderControl,
  Dropdown,
  DropdownTrigger,
  Button,
  ButtonGroup
} from '@salesforce/design-system-react';

// const actions = () => (
//   <PageHeaderControl>
//     <ButtonGroup>
//       <Button label="Clear Selection" />
//       {/* <Button label="Import Leads" /> */}
//       {/* <Dropdown
//         align="right"
//         assistiveText={{ icon: 'More Options' }}
//         iconCategory="utility"
//         iconName="down"
//         iconVariant="border-filled"
//         id="page-header-dropdown-object-home-nav-right"
//         options={[
//           { label: 'Menu Item One', value: 'A0' },
//           { label: 'Menu Item Two', value: 'B0' },
//           { label: 'Menu Item Three', value: 'C0' },
//           { type: 'divider' },
//           { label: 'Menu Item Four', value: 'D0' }
//         ]}
//       /> */}
//     </ButtonGroup>
//   </PageHeaderControl>
// );

const controls = () => (
  <React.Fragment>
    <PageHeaderControl>
      <Dropdown
        align="right"
        id="page-header-dropdown-object-home-content-right"
        options={[
          { label: 'Menu Item One', value: 'A0' },
          { label: 'Menu Item Two', value: 'B0' },
          { label: 'Menu Item Three', value: 'C0' },
          { type: 'divider' },
          { label: 'Menu Item Four', value: 'D0' }
        ]}
      >
        <DropdownTrigger>
          <Button
            assistiveText={{ icon: 'List View Controls' }}
            iconCategory="utility"
            iconName="settings"
            iconVariant="more"
          />
        </DropdownTrigger>
      </Dropdown>
    </PageHeaderControl>
    <PageHeaderControl>
      <Dropdown
        align="right"
        assistiveText={{ icon: 'Change view' }}
        iconCategory="utility"
        iconName="settings"
        iconVariant="more"
        id="page-header-dropdown-object-home-content-right-2"
        options={[
          { label: 'Menu Item One', value: 'A0' },
          { label: 'Menu Item Two', value: 'B0' },
          { label: 'Menu Item Three', value: 'C0' },
          { type: 'divider' },
          { label: 'Menu Item Four', value: 'D0' }
        ]}
      >
        <DropdownTrigger>
          <Button
            assistiveText={{ icon: 'Change view' }}
            iconCategory="utility"
            iconName="table"
            iconVariant="more"
            variant="icon"
          />
        </DropdownTrigger>
      </Dropdown>
    </PageHeaderControl>
    <PageHeaderControl>
      <Button
        assistiveText={{ icon: 'Refresh' }}
        iconCategory="utility"
        iconName="refresh"
        iconVariant="border"
        variant="icon"
      />
    </PageHeaderControl>
    <PageHeaderControl>
      <ButtonGroup>
        <Button
          assistiveText={{ icon: 'Filters' }}
          iconCategory="utility"
          iconName="filterList"
          iconVariant="border"
          variant="icon"
        />
      </ButtonGroup>
    </PageHeaderControl>
  </React.Fragment>
);

const Header = props => {
  const { description, query } = props;
  const { api, settings } = useAppContext();
  const [count, setCount] = useState();

  useEffect(() => {
    if (!query || !query.columns) return;

    async function fetchRows() {
      const count = await executeScalar(api, settings, query);
      setCount(count);
    }

    fetchRows();
  }, [api, settings, query]);

  if (!query) return null;

  return (
    <PageHeader
      // onRenderActions={actions}
      iconAssistiveText="Item Picker"
      iconCategory="standard"
      iconName="multi_select_checkbox"
      info={
        count &&
        `${count} item${count === 1 ? '' : 's'} • sorted by ${query.orderBy &&
          query.orderBy.field.label}`
      }
      joined
      label="Item Picker"
      onRenderControls={controls}
      title={description.labelPlural}
      truncate
      variant="object-home"
    />
  );
};

export default Header;

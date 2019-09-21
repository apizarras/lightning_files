import React, { useState, useEffect } from 'react';
import { useComponentContext } from '../context';
import { executeScalar } from '../api/query';
import { Icon, PageHeader, PageHeaderControl } from '@salesforce/design-system-react';
import './Header.scss';

const Header = props => {
  const { children, description, query } = props;
  const { api } = useComponentContext();
  const [count, setCount] = useState(null);

  useEffect(() => {
    async function fetchRows() {
      const count = await executeScalar(api, query);
      setCount(count);
    }

    fetchRows();
  }, [api, query]);

  return (
    <PageHeader
      joined
      truncate
      variant="object-home"
      title={description.labelPlural}
      label="Item Picker"
      icon={<Icon category="standard" name="multi_select_checkbox" />}
      info={
        count > 0 ? (
          <span className="slds-text-body--small">
            {count} {count === 1 ? 'items' : 'items'} • sorted by{' '}
            {query.orderBy && query.orderBy.field.label}
          </span>
        ) : (
          ''
        )
      }
      onRenderActions={() => <PageHeaderControl>{children}</PageHeaderControl>}
    />
  );
};

export default Header;

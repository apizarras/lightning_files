import React from 'react';
import { useConnection } from './Connect';
import {
  GlobalHeader,
  GlobalHeaderProfile,
  Popover,
  Button
} from '@salesforce/design-system-react';

const Menu = props => {
  const connection = useConnection();
  const { display_name, organization_name } = connection.identity;

  return (
    <GlobalHeader logoSrc="/assets/images/logo.svg">
      <GlobalHeaderProfile
        popover={
          <Popover
            body={
              <>
                <p className="slds-text-heading_small">{organization_name}</p>
                <Button
                  variant="base"
                  label="Log Out"
                  onClick={() => connection.logout()}
                />
              </>
            }
            id="header-profile-popover-id"
          />
        }
        userName={display_name}
      />
    </GlobalHeader>
  );
};

export default Menu;

import React from 'react';
import { useConnection } from './Connect';
import {
  GlobalHeader,
  GlobalHeaderProfile,
  Popover,
  Button,
} from '@salesforce/design-system-react';

const Menu = props => {
  const connection = useConnection();
  const { display_name, organization_name } = connection.identity;

  return (
    <GlobalHeader logoSrc="/_slds/images/logo.svg">
      <GlobalHeaderProfile
        popover={
          <Popover
            body={
              <div className="slds-clearfix">
                <p className="slds-text-title slds-p-bottom_medium">{organization_name}</p>
                <Button
                  className="slds-float_right"
                  variant="destructive"
                  label="Log Out"
                  onClick={() => connection.logout()}
                />
              </div>
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

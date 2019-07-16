import React from 'react';
import { useConnection } from './Connect';

const Menu = props => {
  const connection = useConnection();
  const { display_name, organization_name } = connection.identity;

  return (
    <div className="slds-page-header">
      <div className="slds-page-header__row">
        <div className="slds-page-header__col-title">
          <div className="slds-media">
            <div className="slds-media__figure">
              <span className="slds-icon_container slds-icon-standard-lightning-component">
                <svg
                  className="slds-icon slds-page-header__icon"
                  aria-hidden="true"
                >
                  <use xlinkHref="/assets/icons/standard-sprite/svg/symbols.svg#lightning_component"></use>
                </svg>
              </span>
            </div>
            <div className="slds-media__body">
              <div className="slds-page-header__name">
                <div className="slds-page-header__name-title">
                  <h1>
                    <span className="slds-page-header__title slds-truncate">
                      {display_name}
                    </span>
                  </h1>
                </div>
              </div>
              <p className="slds-page-header__name-meta">{organization_name}</p>
            </div>
          </div>
        </div>
        <div className="slds-page-header__col-actions">
          <div className="slds-page-header__controls">
            <div className="slds-page-header__control">
              <button
                className="slds-button slds-button_neutral"
                onClick={() => connection.logout()}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;

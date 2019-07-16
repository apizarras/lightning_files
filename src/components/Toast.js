import React, { useState } from 'react';

export const ToastContainer = props => {
  return (
    <div className="slds-notify_container slds-is-absolute">
      {props.children}
    </div>
  );
};

export const Toast = props => {
  const { icon = 'info', type = 'info', title, description } = props;
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div
      className={`slds-notify slds-notify_toast slds-theme_${type}`}
      role="status"
    >
      <span className="slds-assistive-text">{icon}</span>
      <span className="slds-icon_container slds-icon-utility-info slds-m-right_small slds-no-flex slds-align-top">
        <svg className="slds-icon slds-icon_small" aria-hidden="true">
          <use
            xlinkHref={`/assets/icons/utility-sprite/svg/symbols.svg#${icon}`}
          />
        </svg>
      </span>
      <div className="slds-notify__content">
        <h2 className="slds-text-heading_small">{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="slds-notify__close" onClick={() => setHidden(true)}>
        <button
          className="slds-button slds-button_icon slds-button_icon-inverse"
          title="Close"
        >
          <svg
            className="slds-button__icon slds-button__icon_large"
            aria-hidden="true"
          >
            <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#close" />
          </svg>
          <span className="slds-assistive-text">Close</span>
        </button>
      </div>
    </div>
  );
};

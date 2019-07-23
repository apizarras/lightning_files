import React from 'react';
import { Icon } from '@salesforce/design-system-react';

function FormattedValue(props) {
  const { field, item } = props;
  const value = item && item[field.name];
  if (!value) return null;

  let formatted;

  switch (field.type) {
    case 'address':
      const { street, city, state, postalCode, country } = value || {};
      formatted = (
        <React.Fragment>
          {street && <span>{street}</span>}
          <span>
            {city && <span>{city},</span>}
            {state && <span>{state}</span>}
            {postalCode && <span>{postalCode}</span>}
          </span>
          {country && <span>{country}</span>}
        </React.Fragment>
      );
      break;
    case 'base64':
      formatted = <Icon category="doctype" name="unknown" size="xx-small" />;
      break;
    case 'boolean':
      formatted = (
        <Icon
          title={field.label}
          category="utility"
          name="check"
          size="xx-small"
        />
      );
      break;
    case 'currency':
      formatted = (
        <span>
          {value.toFixed(field.scale)}
          <span className="currency-code">{item.CurrencyIsoCode || ''}</span>
        </span>
      );
      break;
    case 'date':
    case 'datetime':
      formatted = new Date(value).toLocaleString();
      break;
    case 'location':
      formatted = `${value.latitude}, ${value.longitude}`;
      break;
    case 'multipicklist':
      formatted = (
        <ul>
          {value.split(';').map(item => (
            <li>{item}</li>
          ))}
        </ul>
      );
      break;
    case 'reference':
      const shallowObject = item && item[field.relationshipName];
      formatted = shallowObject ? shallowObject.Name || value : value;
      break;
    case 'string':
    case 'textarea':
    default:
      formatted = value.toString();
  }

  return (
    <span data-type={field.type} data-size={value.length > 50 ? 'wide' : null}>
      {formatted}
    </span>
  );
}

export default FormattedValue;

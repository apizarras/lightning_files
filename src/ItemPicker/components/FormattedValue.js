import React from 'react';
import { Icon } from '@salesforce/design-system-react';

function FormattedValue(props) {
  const { className, field, item } = props;
  const value = item && item[field.name];
  if (value === undefined || value === null || value === false) return null;
  if (field.type === 'location' && (!value.latitude || !value.longitude)) return null;

  let formatted;

  const attrs = {
    className,
    'data-type': field.type,
    'data-size': value.length > 50 ? 'wide' : null
  };

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
      formatted = <Icon title={field.label} category="utility" name="check" size="xx-small" />;
      break;
    case 'currency':
      attrs['data-currency'] = item.CurrencyIsoCode || null;
      formatted = value.toFixed(field.scale);
      break;
    case 'date':
    case 'datetime':
      // TODO: honor user prefs/timezone
      formatted = new Date(value).toLocaleString();
      break;
    case 'double':
    case 'percent':
      formatted = value.toFixed(field.scale);
      break;
    case 'location':
      const { latitude, longitude } = value;
      formatted = `${parseFloat(latitude).toFixed(field.scale)}, ${parseFloat(longitude).toFixed(
        field.scale
      )}`;
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
    case 'time':
      formatted = formatTime(value);
      break;
    case 'picklist':
    case 'string':
    case 'textarea':
    case 'url':
    default:
      formatted = value.toString();
  }

  return <span {...attrs}>{formatted}</span>;
}

// TODO: honor user prefs
function formatTime(value) {
  let hours, minutes;

  if (process.env.NODE_ENV === 'development') {
    // localhost returns time as a string
    [hours, minutes] = value.split(':').map(x => parseInt(x, 10));
  } else {
    // salesforce returns time in milliseconds
    const MS_HOUR = 60 * 60 * 1000;
    const MS_MINUTE = 60 * 1000;
    hours = Math.floor(value / MS_HOUR);
    minutes = (value % MS_HOUR) / MS_MINUTE;
  }

  return `${hours === 0 ? '12' : hours % 12}:${minutes < 10 ? '0' : ''}${minutes} ${
    hours >= 12 ? 'PM' : 'AM'
  }`;
}

export default FormattedValue;

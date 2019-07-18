// https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_attribute.htm

export const DESIGN_ATTRIBUTES = [
  {
    name: 'setting1',
    label: 'Setting 1',
    type: 'boolean',
    defaultValue: false
  },
  {
    name: 'setting2',
    label: 'Setting 2',
    type: 'string',
    defaultValue: ''
  },
  {
    name: 'setting3',
    label: 'Setting 3',
    type: 'picklist',
    options: ['option1', 'option2', 'option3'],
    defaultValue: ''
  }
];

export const ACTION_TYPES = ['I did something good', 'I did something bad'];

import { useLightningContext } from '../contexts/LightningContext';

export const useApi = () => {
  const { dataService /*, settings, events */ } = useLightningContext();

  return {
    describeFields: sobject => dataService.describeFields(sobject),
    query: soql => dataService.query(soql)
  };
};

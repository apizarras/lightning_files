export const fetchItem = key => {
  return JSON.parse(sessionStorage.getItem(key));
};

export const setItem = (key, data) => {
  return sessionStorage.setItem(key, JSON.stringify(data));
};

export const clearStore = () => {
  return sessionStorage.clear();
};

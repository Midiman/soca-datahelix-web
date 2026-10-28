export const setToLclStorage = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  
  export const getFromLclStorage = key => {
    const value = window.localStorage.getItem(key);
  
    if (value) {
      return JSON.parse(value);
    }
  }
  
const saveDataInLocalStorage = (localStorageName, valueData) => {
  let data = JSON.stringify(valueData);
  localStorage.setItem(localStorageName, data);
};

const getDataFromLocalStorage = (localStorageName) => {
  let getData = JSON.parse(localStorage.getItem(localStorageName));
  return getData;
};

export { saveDataInLocalStorage, getDataFromLocalStorage };

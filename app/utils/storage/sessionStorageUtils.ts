export function setItemInSessionStorage(key: string, value: any): void {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error setting item in sessionStorage:', error);
  }
}

export function getItemFromSessionStorage(key: string): any | null {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return null;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error getting item from sessionStorage:', error);
    return null;
  }
}

export function removeItemFromSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from sessionStorage:', error);
  }
}

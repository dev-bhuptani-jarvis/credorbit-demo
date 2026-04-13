import { decryptData, encryptData } from "./encryptDecrypt";

/**
 * Sets encrypted data in sessionStorage under a specified key.
 *
 * @param {string} key - The key under which data will be stored
 * @param {any} data - The data to encrypt and store
 */
export const setEncryptedSessionStorage = (key: string, data: any): void => {
  if (data) {
    const encryptedString = encryptData(data);
    sessionStorage.setItem(key, encryptedString);
  }
};

/**
 * Retrieves and decrypts data from sessionStorage by key.
 *
 * @param {string} key - The key under which data is stored
 * @returns {any} - Decrypted data or null if decryption fails or key is not found
 */
export const getDecryptedSessionStorage = (key: string): any => {
  const encryptedString = sessionStorage.getItem(key);
  return encryptedString ? decryptData(encryptedString) : null;
};

/**
 * Removes a specific key and its data from sessionStorage.
 *
 * @param {string} key - The key to remove from sessionStorage
 */
export const removeSessionStorageKey = (key: string): void => {
  sessionStorage.removeItem(key);
};

/**
 * Removes all data from sessionStorage.
 */
export const clearSessionStorage = (): void => {
  sessionStorage.clear();
};

import { decryptData, encryptData } from "./encryptDecrypt";
import { environment } from "../constants/environments";

const LOCAL_VALUE_PREFIX = "local-demo:";
const canEncryptSession = (): boolean =>
  Boolean(environment.SECRET_KEY && environment.IV);

const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
};

/**
 * Sets encrypted data in sessionStorage under a specified key.
 *
 * @param {string} key - The key under which data will be stored
 * @param {any} data - The data to encrypt and store
 */
export const setEncryptedSessionStorage = (key: string, data: any): boolean => {
  if (data) {
    try {
      const value = canEncryptSession()
        ? encryptData(data)
        : `${LOCAL_VALUE_PREFIX}${String(data)}`;
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        return false;
      }

      throw error;
    }
  }

  return false;
};

/**
 * Retrieves and decrypts data from sessionStorage by key.
 *
 * @param {string} key - The key under which data is stored
 * @returns {any} - Decrypted data or null if decryption fails or key is not found
 */
export const getDecryptedSessionStorage = (key: string): any => {
  const encryptedString = sessionStorage.getItem(key);

  if (!encryptedString) return null;

  if (encryptedString.startsWith(LOCAL_VALUE_PREFIX)) {
    return encryptedString.slice(LOCAL_VALUE_PREFIX.length);
  }

  if (!canEncryptSession()) {
    sessionStorage.removeItem(key);
    return null;
  }

  try {
    const decryptedValue = decryptData(encryptedString);

    if (!decryptedValue) {
      sessionStorage.removeItem(key);
      return null;
    }

    return decryptedValue;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
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

import CryptoJS from "crypto-js";
import { environment } from "../constants/environments";

const ivValue = CryptoJS.enc.Utf8.parse(environment.IV);
const key = CryptoJS.enc.Utf8.parse(environment.SECRET_KEY);
const vaptKey = CryptoJS.enc.Utf8.parse(environment.VAPT_SECRET_KEY);

const options = {
  iv: ivValue,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
};

/**
 * Encrypts any input data and returns an encrypted string.
 *
 * @param {any} data - The data to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(data, key, options).toString();
};

/**
 * Decrypts an encrypted string and returns the original data as string.
 *
 * @param {string} data - Encrypted string to decrypt
 * @returns {string} - Decrypted data as string
 */
export const decryptData = (
  data: string | CryptoJS.lib.CipherParams
): string => {
  const bytes = CryptoJS.AES.decrypt(data, key, options);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
};

/**
 * Encrypts any input data and returns an encrypted string.
 *
 * @param {any} data - The data to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptVAPTData = (data: any): string => {
  return CryptoJS.AES.encrypt(data, vaptKey, options).toString();
};

/**
 * Decrypts an encrypted string and returns the original data as string.
 *
 * @param {string} data - Encrypted string to decrypt
 * @returns {string} - Decrypted data as string
 */
export const decryptVAPTData = (
  data: string | CryptoJS.lib.CipherParams
): string => {
  const bytes = CryptoJS.AES.decrypt(data, vaptKey, options);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;
};

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
  try {
    const bytes = CryptoJS.AES.decrypt(data, key, options);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
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
  if (
    typeof data === "string" &&
    (!/^[A-Za-z0-9+/]+={0,2}$/.test(data) || data.length < 24)
  ) {
    return data;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(data, vaptKey, options);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    // Local Demo fixtures can contain plain values or values encrypted by another environment.
    return typeof data === "string" ? data : "";
  }
};

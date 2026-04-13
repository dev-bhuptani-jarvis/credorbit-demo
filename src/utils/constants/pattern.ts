export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)(?!.*\.$)(?!.*\.@)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const PAN_NUMBER_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const NUMBER_ONLY_PATTERN = /^[0-9]+$/;

export const NUMBER = /[^0-9]/g;

export const NUMBER_WITH_SINGLE_DOT_PATTERN = /^\d*\.?\d{0,2}$/;

export const AADHAR_CARD_NUMBER_ONLY_PATTERN = /[0-9-]/;

export const BANK_ACCOUNT_NUMBER_ONLY_PATTERN = /^[0-9-]{9,18}$/;

export const IFSC_CODE_PATTERN = /^[A-Z]{4}0[\dA-Za-z]{6}$/;

export const AADHAR_CARD_PATTERN = /^\d{12}$/;

export const UTR_CODE_PATTERN = /^[A-Z]{4}[0-9]{7,18}$/;

export const GST_NUMBER_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const INDIAN_MOBILE_NUMBER_PATTERN = /^[6-9][0-9]{9}$/;

export const VEHICLE_PATTERN =
  /^[A-Z]{2}[\\ -]{0,1}[0-9A-Z]{2}[\\ ""-]{0,1}[0-9A-Z]{1,2}[\\ -]{0,1}[0-9]{1,4}$/;
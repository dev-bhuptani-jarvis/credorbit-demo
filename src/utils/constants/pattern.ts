export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)(?!.*\.$)(?!.*\.@)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const PAN_NUMBER_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const NUMBER_ONLY_PATTERN = /^[0-9]+$/;

export const NUMBER = /[^0-9]/g;

export const NUMBER_WITH_SINGLE_DOT_PATTERN = /^\d*\.?\d{0,2}$/;

export const AADHAR_CARD_NUMBER_ONLY_PATTERN = /[0-9-]/;

export const BANK_ACCOUNT_NUMBER_ONLY_PATTERN = /^[0-9]{9,18}$/;

export const BANK_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &'().-]{1,99}$/;

export const BRANCH_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &'().-]{1,99}$/;

export const CITY_NAME_PATTERN = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;

export const ACCOUNT_HOLDER_NAME_PATTERN = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;

export const ADDRESS_PATTERN = /^(?=.*[A-Za-z0-9])[A-Za-z0-9\s,.'#&()/-]+$/;

export const TRADE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &(),./'-]{1,99}$/;

export const WEBSITE_PATTERN = /^https:\/\/(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}(?:[/?#][^\s<>]*)?$/;

export const IFSC_CODE_PATTERN = /^[A-Z]{4}0[\dA-Za-z]{6}$/;

export const AADHAR_CARD_PATTERN = /^\d{12}$/;

// UTR formats vary by bank/payment rail. Accept only uppercase alphanumeric
// references, with the supported 12–22 character length.
export const UTR_CODE_PATTERN = /^[A-Z0-9]{12,22}$/;

export const GST_NUMBER_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const INDIAN_MOBILE_NUMBER_PATTERN = /^[6-9][0-9]{9}$/;

export const EMI_MONTHS_PATTERN = /^(?:[1-9]|[1-9][0-9]|1[0-9]{2}|2[0-3][0-9]|240)$/;

export const ROI_PERCENT_PATTERN = /^(?:100(?:\.0{1,2})?|(?:[0-9]|[1-9][0-9])(?:\.\d{1,2})?)$/;

export const PROCESSING_FEE_PERCENT_PATTERN = /^(?:10(?:\.0{1,2})?|[0-9](?:\.\d{1,2})?)$/;

export const NON_NEGATIVE_AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export const DISCOUNT_PERCENT_PATTERN = /^(100|[0-9]{1,2})(\.[0-9]{1,2})?$/;

export const AMOUNT_UP_TO_12_DIGITS_PATTERN = /^[0-9]{1,12}(\.[0-9]{1,2})?$/;

export const EMI_AMOUNT_INPUT_PATTERN = /^\d{0,10}(?:\.\d{0,2})?$/;

export const EMI_AMOUNT_PATTERN = /^\d{1,10}(?:\.\d{1,2})?$/;

export const PERSON_NAME_PATTERN = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;

export const COURSE_TENURE_PATTERN = /^(?:[1-9]|[1-9][0-9]|1[01][0-9]|120)$/;

export const COURSE_FEES_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

export const NON_NUMERIC_DECIMAL_CHARACTERS_PATTERN = /[^\d.]/g;

export const COURSE_DESCRIPTION_PATTERN = /^[^<>]+$/;

export const UNSAFE_TEXT_PATTERN = /[<>]/;

export const NUMERIC_DATA_TYPE_PATTERN = /(number|numeric|decimal|integer|int|float|double)/;

export const BOOLEAN_VALUE_PATTERN = /^(true|false)$/i;

// Course names can include common academic separators, e.g. "C++ Programming",
// "MBA - Finance", and "UI/UX: Design". Keep the first character alphanumeric.
export const COURSE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &(),./'+:-]*$/;

export const COURSE_NAME_INPUT_PATTERN = /^[A-Za-z0-9 &(),./'+:\-]$/;

export const USER_NAME_PATTERN = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;

export const DESIGNATION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &().,'/-]*$/;

export const ROLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 _-]*$/;

export const VEHICLE_PATTERN =
  /^[A-Z]{2}[\\ -]{0,1}[0-9A-Z]{2}[\\ ""-]{0,1}[0-9A-Z]{1,2}[\\ -]{0,1}[0-9]{1,4}$/;

export const ALPHABET_SPACE_PATTERN = /^[A-Za-z ]+$/;

export const CIN_NUMBER_REGEX = /^[LU][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;

export const UDHYAM_AADHAAR_REGEX = /^UDYAM(-I)?-[A-Z]{2}-\d{2}-\d{7}$/;

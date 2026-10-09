export const environment = {
  API_URL: process.env.REACT_APP_API_URL,
  SECRET_KEY: process.env.REACT_APP_JWT_SECRET_KEY!,
  USER_NAME: process.env.REACT_APP_JWT_USER_NAME,
  PASSWORD: process.env.REACT_APP_JWT_PASSWORD,
  IV: process.env.REACT_APP_JWT_INITIAL_VECTOR!,
  OTP_TIMER: Number(process.env.REACT_APP_OTP_TIMER),
  REPORT_OTP_TIMER: Number(process.env.REACT_APP_REPORT_OTP_TIMER),
  ZIP_FILE_SIZE: Number(process.env.REACT_APP_ZIP_FILE_SIZE),
  USER_EXPIRY_TIMER: Number(process.env.REACT_APP_USER_EXPIRY_TIMER),
  VAPT_SECRET_KEY: process.env.REACT_APP_VAPT_SECRET_KEY!,
  DOCUMENT_FILE_SIZE: Number(process.env.REACT_APP_DOCUMENT_FILE_SIZE),
  SIGNAL_R_URL: process.env.REACT_APP_SIGNAL_R_API_URL,
  DOMAIN_URL: process.env.REACT_APP_DOMAIN_URL || window.location.hostname
};
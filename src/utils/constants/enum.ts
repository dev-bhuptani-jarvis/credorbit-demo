export enum StorageKeyEnum {
  CRED_ORBIT_PUBLIC_TOKEN = "cred_orbit_public_token",
  CRED_ORBIT_USER_DATA = "cred_orbit_user_data",
  CRED_ORBIT_IMPERSONATE_USER_DATA = "cred_orbit_impersonate_user_data",
  CRED_ORBIT_IMPERSONATE_STUDENT_ID = "cred_orbit_impersonate_student_id",
  CRED_ORBIT_USER_EXPIRY_TIMER = "cred_orbit_user_expiry_timer",
  CRED_ORBIT_USER_PROFILE_FETCH = "cred_orbit_user_profile_fetch",
  CRED_ORBIT_CP_TOTAL_CREDIT = "cred_orbit_cp_total_credit",
  CRED_ORBIT_CREDIT_POP_UP_CLOSE = "cred_orbit_credit_pop_up_close",
  CRED_ORBIT_CREDITS_LOADED = "cred_orbit_credits_loaded",
}

export enum VerifyOTPType {
  LOGIN = "login",
  REGISTER = "register",
  CHANNEL_PARTNER = "channelPartner",
}

export enum LoanStatusType {
  TOTAL = 0,
  PENDING = 1,
  APPLIED = 2,
  QUERY_RAISED = 3,
  SANCTIONED = 4,
  PENDING_AT_CREDIT = 5,
  DISBURSED = 6,
  REJECTED = 7,
}

export enum PaymentStatus {
  UNKNOWN = 0,
  CREATED = 1,
  PAID = 2,
  CANCELLED = 3,
  FAILED = 4,
  EXPIRED = 5,
}

export enum LoanStatus {
  PENDING = "Pending",
  APPLIED = "Applied",
  QUERY_RAISED = "Query Raised",
  SANCTIONED = "Sanctioned",
  PENDING_AT_CREDIT = "Pending At Credit",
  DISBURSED = "Disbursed",
  REJECTED = "Rejected",
}

export enum LoanApplicationStatusType {
  UNSECURED_LOAN = 1,
  SECURED_LOAN = 0,
  BOTH = 2,
}

export enum ReportSuccessType {
  GST_SUCCESS = "SRO037",
  ITR_SUCCESS = "SRS016",
  CREDIT_SCORE_SUCCESS = "SOS174",
  OTP_SUCCESS = "SRS016",
}

export enum PanCategoryType {
  INDIVIDUAL = 1,
  COMPANY = 2,
  HINDU_UNDIVIDED_FAMILY = 3,
  ASSOCIATION_OF_PERSONS = 4,
  BODY_OF_INDIVIDUALS = 5,
  GOVERNMENT_AGENCY = 6,
  ARTIFICIAL_JURIDICAL_PERSON = 7,
  LOCAL_AUTHORITY = 8,
  FIRM = 9,
  TRUST = 10,
  PERSON = 11,
}

export enum ContractType {
  TERMS_AND_CONDITIONS = "Terms & Conditions",
  PRIVACY_POLICY = "Privacy Policy",
  CONTRACT = "Contract",
}

export enum PaymentStatusType {
  PAID = "paid",
  CANCELLED = "cancelled",
  FAILED = "failed",
  UNKNOWN = "unknown",
  CREATED = "created",
}

export enum OTPType {
  FOUR_DIGIT_OTP = 4,
  SIX_DIGIT_OTP = 6,
}

export enum OtpRequestType {
  LOGIN = 1,
  REGISTER = 2,
  CONTRACT = 5,
}

export enum SubscriptionPlanType {
  CUSTOM = "Custom Plan",
}

export enum DocumentType {
  UNSECURED_DOCUMENT = "unsecured",
  SECURED_DOCUMENT = "secured",
}

export enum ReportType {
  CREDIT_REPORT = 1,
  IT_REPORT = 2,
  GST_REPORT = 3,
  BANKING_REPORT = 4,
}

export enum ReportTypeSignalR {
  CreditAnalyticsReport = 1,
  BankingReportInProgress = 2,
  BankingReportCompleted = 3,
  IncomeTaxReport = 4,
  GSTReport = 5,
  ROCReport = 6,
  CFOReport = 7,
  CAMReport = 8,
  UNKNOW = 0
}

export enum MasterEnum {
  // Borrower
  SALARIED = 1,
  SELF_EMPLOYED_PROFESSIONAL = 2,
  SELF_EMPLOYED_NON_PROFESSIONAL = 3,

  // Business Vintage
  BUSINESS_1_YEAR = 1,
  BUSINESS_2_YEARS = 2,
  BUSINESS_3_YEARS = 3,
  BUSINESS_3_PLUS_YEARS = 4,

  // Organization
  PROPRIETOR = 1,
  FIRM = 2,
  LLP = 3,
  COMPANY = 4,

  // Working Duration
  WORK_1_YEAR = 4,
  WORK_2_YEARS = 5,
  WORK_3_YEARS = 6,
  WORK_3_PLUS_YEARS = 7,

  // ITR
  NOT_FILED = 0,
  ITR_1_YEAR = 1,
  ITR_2_YEARS = 2,
  ITR_3_YEARS = 3,
  ITR_3_PLUS_YEARS = 4,

  // Salary
  SALARY_3_MONTHS = 1,
  SALARY_6_MONTHS = 2,
  SALARY_12_MONTHS = 3,

  PROPERTY_OWNED = 1,
  PROPERTY_RENTED = 2,
}

export enum PropertyType {
  RESIDENTIAL = 1,
  COMMERCIAL = 2,
  INDUSTRIAL = 3,
  PLOT = 4
}

export enum AdminDateFilterType {
  TODAY = 1,
  LAST_WEEK = 2,
  LAST_30_DAYS = 3,
  THIS_QUARTER = 4,
  LAST_1_YEAR = 5,
  CUSTOM_DATE_RANGE = 6,
  ALL = 7,
}

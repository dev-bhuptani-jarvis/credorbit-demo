export enum StorageKeyEnum {
  CRED_ORBIT_PUBLIC_TOKEN = "schofee_public_token",
  CRED_ORBIT_USER_DATA = "schofee_user_data",
  CRED_ORBIT_PUBLIC_WHITE_LABEL_TENANT_ID = "schofee_public_white_label_tenant_id",
  CRED_ORBIT_IMPERSONATE_USER_DATA = "schofee_impersonate_user_data",
  CRED_ORBIT_IMPERSONATE_RETURN_PATH = "schofee_impersonate_return_path",
  CRED_ORBIT_WHITE_LABEL_PREVIEW = "schofee_white_label_preview",
  CRED_ORBIT_USER_EXPIRY_TIMER = "schofee_user_expiry_timer",
  CRED_ORBIT_USER_PROFILE_FETCH = "schofee_user_profile_fetch",
  CRED_ORBIT_CP_TOTAL_CREDIT = "schofee_cp_total_credit",
  CRED_ORBIT_CREDIT_POP_UP_CLOSE = "schofee_credit_pop_up_close",
  CRED_ORBIT_CREDITS_LOADED = "schofee_credits_loaded",
  CRED_ORBIT_EDUCATION_LOAN_MARKETPLACE_CONTEXT = "schofee_education_loan_marketplace_context",
  CRED_ORBIT_EDUCATION_LOAN_APPLICATION_CONTEXT = "schofee_education_loan_application_context",
  CRED_ORBIT_PENDING_PROCESSING_FEE_BANK = "schofee_pending_processing_fee_bank",
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

export enum LeadStatusType {
  OPEN = 1,
  CONVERTED = 2,
  REJECTED = 3
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
  Pending = 1,
  Applied = 2,
  QueryRaised = 3,
  Sanctioned = 4,
  PendingAtCredit = 5,
  Disbursed = 6,
  Rejected = 7,
  AgreementSentForESign = 8,
  AwaitingESign = 9,
  AgreementSigned = 10,
  ENACHRequestSent = 11,
  AwaitingENACHRegistration = 12,
  ENACHRegistered = 13,
  Foreclosed = 14,
  Completed = 15,
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
  Yesterday = 8,
  MTD = 9,
  YTD = 10
}

export enum LOAN_TYPE_ID {
  Home_Loan = 1,
  Unsecured_Personal_Loan = 2,
  Machinery_Loan = 3,
  Unsecured_Business_Loan = 4,
  Loan_Against_Property_Plot = 5,
  CCODCGTMSE = 6,
  Loan_Against_Property_Residential = 7,
  Loan_Against_Property_Commercial = 8,
  Loan_Against_Property_Industrial = 9,
  CCODSecured = 10,
  Car_Loan = 11,
  Loan_Against_Property = 12,
  Working_Capital = 13,
};

export enum DashboardType {
  EDUCATION_ADMIN = 0,
  INSTITUTE = 1,
  STUDENT = 2,
  NBFC = 3,
}

export enum CourseType {
  ONLINE = 1,
  OFFLINE = 2
}

export enum DisbursedTrendType {
  ALL_DATA = 0,
  YEARLY = 1,
  MONTHLY = 2
}

export enum DocumentForFileUploadType {
  INSTITUTE = 1,
  BRANCH = 2,
  NBFC = 3,
  STUDENT_PHOTO = 4,
  STUDENT_PAN = 5,
  STUDENT_AADHAR = 6,
  APPLICANT_PHOTO = 7,
  APPLICANT_PAN = 8,
  APPLICANT_AADHAR = 9,
  COAPPLICANT_PHOTO = 10,
  COAPPLICANT_PAN = 11,
  COAPPLICANT_AADHAR = 12,
}

export enum DocumentFileTypeForInstitute {
  AGREEMENT = 1,
  REGISTRATION_DOCUMENT = 2,
  GST_CERTIFICATE = 3,
  PAN = 4,
  OTHER = 5,
  AADHAR_CARD = 6,
  CANCELLED_CHEQUE = 7,
  QUERY = 8,
  SANCTION_LETTER = 9,
}

export enum DeleteAuthorizedPersonType {
  INSTITUTE = 1,
  BRANCH = 2,
  NBFC = 3,
}

export enum LoanTimeLineSteps {
  CREDIT_REPORT = 13,
  BANKING_REPORT = 14
}

export enum ProcessingFeeType {
  PERCENTAGE = 1,
  RUPEES = 2
}

export enum EmiCostType {
  LOW_COST_EMI = 2,
  NO_COST_EMI = 1,
}

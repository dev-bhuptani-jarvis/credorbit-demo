import { AdminDateFilterType, CourseType, LoanStatusType, PaymentStatus } from "./enum";
import { environment } from "./environments";

export const API_URL = environment.API_URL;

export const SIGNAL_R_URL = environment.SIGNAL_R_URL;

export const debounceTimeInMilliseconds = 500;

export const toasterPosition = "top-center";

export const CLIENT_ROLE = {
  SUPER_ADMIN: 1,
  CO_APPLICANT: 5,

  USER_MANAGEMENT: 7,
  STUDENT: 10,
  EDUCATIONAL_INSTITUTE: 11,
  NBFC: 12,
  AUTHORIZED_PERSON: 13
};

export type RouteParams = {
  id: string;
};

export type PermissionModule =
  | "Dashboard"
  | "Profile"
  | "RoleMaster"
  | "ClientMaster"
  | "ChannelPartner"
  | "SourcingPartner"
  | "Reports"
  | "ContractChannelPartner"
  | "ContractSourcingPartner"
  | "ContractClient"
  | "Policy"
  | "Support"
  | "PayOuts"
  | "UserMaster"
  | "TermsAndConditions"
  | "Contracts"
  | "Subscription"
  | "UserManagement"
  | "ChannelPartnerReport"
  | "GeographicalReport"
  | "ChannelPartnerPayout"
  | "ManageUsers"
  | "SourcingPartnerPayout"
  | "WalletAndReferral"
  | "LoanApplicationManagement"
  | "ContractMasterCP"
  | "LeadManagement"
  | "MasterChannelPartner"
  | "MasterChannelPartnerPayout"
  | "BranchManagement"
  | "MasterCPPayout"
  | "ManageEducationInstitute"
  | "ManageCourses"
  | "ManageStudents"
  | "DSACodeManagement"
  | "ManageNBFC";

export const PAYMENT_REQUEST_STATUS = {
  PENDING: 0,
  INCOMPLETE: 1,
  APPROVED: 2,
  REJECTED: 3,
  COMPLETED: 4,
  VIEW_REJECTED: 5,
  HSN_NUMBER: 888, // custom added only for the frontend
  VIEW_REMARKS: 999, // custom added only for the frontend
};

export const statusList = [
  { name: "Pending", code: LoanStatusType.PENDING },
  { name: "Applied", code: LoanStatusType.APPLIED },
  { name: "Query Raised", code: LoanStatusType.QUERY_RAISED },
  { name: "Sanctioned", code: LoanStatusType.SANCTIONED },
  { name: "Pending at Credit", code: LoanStatusType.PENDING_AT_CREDIT },
  { name: "Disbursed", code: LoanStatusType.DISBURSED },
  { name: "Rejected", code: LoanStatusType.REJECTED },
];

export const paymentStatusList = [
  { name: "Unknown", code: PaymentStatus.UNKNOWN },
  { name: "Created", code: PaymentStatus.CREATED },
  { name: "Paid", code: PaymentStatus.PAID },
  { name: "Cancelled", code: PaymentStatus.CANCELLED },
  { name: "Failed", code: PaymentStatus.FAILED },
  { name: "Expired", code: PaymentStatus.EXPIRED },
];

export const getTitleByStatus = (status: string): string => {
  switch (status) {
    case LoanStatusType.PENDING.toString():
      return "Pending Applications";
    case LoanStatusType.APPLIED.toString():
      return "Applied Applications";
    case LoanStatusType.QUERY_RAISED.toString():
      return "Query Raised Applications";
    case LoanStatusType.SANCTIONED.toString():
      return "Sanctioned Applications";
    case LoanStatusType.PENDING_AT_CREDIT.toString():
      return "Pending At Credit Applications";
    case LoanStatusType.DISBURSED.toString():
      return "Disbursed Applications";
    case LoanStatusType.REJECTED.toString():
      return "Rejected Applications";
    case LoanStatusType.TOTAL.toString():
      return "Total Applications";
    default:
      return "List of Applications";
  }
};

export const GST_REPORT_TECHNICAL_ERROR = [
  "EIP018",
  "EPI022",
  "EGU036",
  "ENG034",
  "EGO040",
  "EGU051",
  "EVP085",
  "EPG044",
  "ERT146",
  "EDP1209",
  "RNP020",
];

export const GST_REPORT_NORMAL_ERROR = [
  "EAS517",
  "EIS042",
  "ERO038",
  "EAU043",
  "EGO045",
  "ERE1203",
  "EOA048",
  "EAE052",
  "EUP007",
  "ENI004",
  "ENR029",
];

export const ITR_REPORT_TECHNICAL_ERROR = [
  "ETI058",
  "EIS042",
  "EAF010",
  "ERM1092",
  "ERE1203",
];

export const ITR_REPORT_NORMAL_ERROR = ["EPI022", "EIP018", "EWC002"];

export const CREDIT_SCORE_REPORT_NORMAL_ERROR = [
  "EAD480",
  "EAN456",
  "EAP459",
  "ECI419",
  "ECN469",
  "EID443",
  "EGD444",
  "EAS472",
  "EAN488",
  "EAN460",
  "EAN461",
];

export const CREDIT_SCORE_REPORT_TECHNICAL_ERROR = [
  "EIE428",
  "EIP433",
  "EIR516",
  "ESC445",
  "EPI022",
  "EIP018",
  "EUC578",
  "RNP020",
  "ETP011",
  "EIC028",
  "ENR029",
];

export const formatDecimalValue = (value: string | number) => {
  const stringValue = String(value);

  return stringValue.replace(/(\d+(\.\d+)?)/, (match) => {
    const num = Number(match).toFixed(2);
    return num.endsWith(".00") ? num.slice(0, -3) : num;
  });
};

export const rowsPerPageOptions = [10, 25, 50, 75];

export const formatMobileNumber = (number: string | undefined) => {
  if (!number) return ""; // Handle empty numbers

  // Ensure it's a valid 10-digit number
  const cleaned = number.replace(/\D/g, ""); // Remove non-numeric characters
  if (cleaned.length !== 10) return number; // Return as is if not 10 digits

  return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
};

export const formatCurrencyAmount = (number: number) => {
  return `₹ ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number)}`;
};

export const allowedZipMimeTypes = [
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "application/x-rar-compressed",
  "application/x-compressed",
  "application/vnd.rar",
  "",
];

export const ContractSigned = {
  ADMIN_TO_CP: 1,
  CP_TO_SP: 2,
  CLIENT: 3,
  ADMIN_TO_MASTER_CP: 4,
  MASTER_CP_TO_CP: 5,
}

export const REFERRAL_CODE_LENGTH = 9;

export const dateFilters = [
  { label: "Yesterday", value: AdminDateFilterType.Yesterday },
  { label: "Today", value: AdminDateFilterType.TODAY },
  { label: "Last 7 Days", value: AdminDateFilterType.LAST_WEEK },
  { label: "Last 30 Days", value: AdminDateFilterType.LAST_30_DAYS },
  { label: "This Quarter", value: AdminDateFilterType.THIS_QUARTER },
  { label: "Last 1 Year", value: AdminDateFilterType.LAST_1_YEAR },
  { label: "Custom Range", value: AdminDateFilterType.CUSTOM_DATE_RANGE },
  { label: "MTD", value: AdminDateFilterType.MTD },
  { label: "YTD", value: AdminDateFilterType.YTD },
  { label: "All", value: AdminDateFilterType.ALL },
];

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const courseTypeOptions = [
  { label: "Online", value: CourseType.ONLINE },
  { label: "Offline", value: CourseType.OFFLINE },
];

export const jobGuaranteedOptions = [
  { label: "Job Guaranteed", value: true },
  { label: "Not Job Guaranteed", value: false },
];

export const getLoanStatusClassName = (statusID?: number): string => {
  switch (statusID) {
    case LoanStatusType.PENDING:
      return "status-pending";
    case LoanStatusType.APPLIED:
      return "status-applied";
    case LoanStatusType.QUERY_RAISED:
      return "status-query-raised";
    case LoanStatusType.SANCTIONED:
      return "status-sanctioned";
    case LoanStatusType.PENDING_AT_CREDIT:
      return "status-pending-at-credit";
    case LoanStatusType.DISBURSED:
      return "status-disbursed";
    case LoanStatusType.REJECTED:
      return "status-rejected";
    default:
      return "status-pending";
  }
};

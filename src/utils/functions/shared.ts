import { IsStringNullEmptyOrUndefined } from "./nullCheck";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../constants/environments";
import moment from "moment";
import toast from "react-hot-toast";
import { CLIENT_ROLE, toasterPosition } from "../constants/constant";
import DOMPurify from "dompurify";
import { validationMessages } from "../constants/messages";
import { LoanStatusType, ReportTypeSignalR } from "../constants/enum";
import { getClientDashboardAPI } from "../axios/apiServices";
import { IClientDashboardData, IClientDashboardResponse } from "../../interface/clientDashboard";
import { decryptVAPTData } from "./encryptDecrypt";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import store from "../../store";
import { ReportTypeSignalrResponse } from "../../interface/signalr";
import { setCount } from "../../store/reducer/countSlice";
import { setReportMessage } from "../../store/reducer/reportMessageSlice";
import { setUserData } from "../../store/reducer/userSlice";
import { setWrongUser } from "../../store/reducer/wrongUserSlice";
import { IGetWhiteLabelSettingsByUserIdResponseData, IWhiteLabelPermission } from "../../interface/whiteLabel";
import {
  applyWhiteLabelBranding,
  emitWhiteLabelSettingsUpdated,
} from "./whiteLabelBranding";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "./sessionStorage";
import { StorageKeyEnum } from "../constants/enum";
import { UserData } from "../../interface/otpRequest";

export const IsFormValid = (obj: object): boolean => {
  let count = 0;

  Object.entries(obj).forEach(([key, value]) => {
    if (!IsStringNullEmptyOrUndefined(value)) {
      count += 1;
    }
  });

  return count === 0;
};
export const MAX_FILE_UPLOAD_SIZE_MB = 5;

export const MAX_FILE_UPLOAD_SIZE_BYTES =
  MAX_FILE_UPLOAD_SIZE_MB * 1024 * 1024;

export const MAX_FILE_UPLOAD_NOTE = `Max ${MAX_FILE_UPLOAD_SIZE_MB} MB`;

export const getFileSizeLimitErrorMessage = (
  label = "File",
): string => `${label} size should not exceed ${MAX_FILE_UPLOAD_SIZE_MB} MB.`;

export const isFileSizeWithinLimit = (
  file: File,
  maxSizeInBytes = MAX_FILE_UPLOAD_SIZE_BYTES,
): boolean => file.size <= maxSizeInBytes;

export const PDF_FILE_ACCEPT = ".pdf,application/pdf";

export const IMAGE_FILE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

export const isPdfFile = (file: File): boolean =>
  file.type === "application/pdf" && file.name.toLowerCase().endsWith(".pdf");

export const isImageFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    (file.type === "image/jpeg" && (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))) ||
    (file.type === "image/png" && fileName.endsWith(".png"))
  );
};

export const restrictInputByPattern = (
  event: React.KeyboardEvent,
  pattern: RegExp
): void => {
  const allowedControlKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
    "Enter",
  ];

  if (
    allowedControlKeys.includes(event.key) ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }

  if (!pattern.test(event.key)) {
    event.preventDefault();
  }
};

export const dynamicSecretKey = (): string => {
  return uuidv4();
};

export const extraToken = (): string => {
  return `${environment.SECRET_KEY}_${environment.USER_NAME}_${environment.PASSWORD}`;
};

export const formatDate = (date: string | Date, format?: string): string => {
  return moment(date).format(format || "DD MMM, YYYY h:mm A");
};

export const toastSuccess = (message: string) => {
  toast.remove();
  toast.success(message, {
    position: toasterPosition,
    className: "toast-success",
    style: {
      color: "var(--color-text-black)",
      maxWidth: 500,
      padding: 10,
      fontWeight: 500,
      marginBottom: 60,
      fontSize: 18,
    },
    duration: 5000,
  });
};

export const toastError = (message: string) => {
  toast.remove();
  toast.error(message, {
    position: toasterPosition,
    style: {
      color: "var(--color-text-black)",
      maxWidth: 500,
      padding: 10,
      fontWeight: 500,
      marginBottom: 60,
      fontSize: 18,
    },
    duration: 5000,
  });
};

export const toastInfo = (message: string) => {
  toast.remove();
  toast(message, {
    position: toasterPosition,
    icon: "ℹ️",
    style: {
      color: "var(--color-text-black)",
      maxWidth: 500,
      padding: 10,
      fontWeight: 500,
      marginBottom: 60,
      fontSize: 18,
    },
    duration: 5000,
  });
};

export const toastSuccessWithExtraTime = (message: string) => {
  toast.remove();
  toast.success(message, {
    position: toasterPosition,
    className: "toast-success",
    style: {
      color: "var(--color-text-black)",
      maxWidth: 500,
      padding: 10,
      fontWeight: 500,
      marginBottom: 60,
      fontSize: 18,
    },
    duration: 10000,
  });
};

export const toastErrorWithExtraTime = (message: string) => {
  toast.remove();
  toast.error(message, {
    position: toasterPosition,
    style: {
      color: "var(--color-text-black)",
      maxWidth: 500,
      padding: 10,
      fontWeight: 500,
      marginBottom: 60,
      fontSize: 18,
    },
    duration: 10000,
  });
};

export const showGlobalReportModal = (message: string, title: string) => {
  store.dispatch(setReportMessage({
    title: title,
    message: message,
  }));
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatCourseTenure = (
  value: number | string | null | undefined,
): string => {
  const totalMonths = Number(value || 0);

  if (!totalMonths || totalMonths < 0) {
    return "-";
  }

  return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
};

export const formatAadhaarNumber = (value: string): string => {
  return value
    .replace(/\D/g, "") // Remove non-numeric characters
    .slice(0, 12) // Limit to 12 digits
    .replace(/(\d{4})(\d{4})?(\d{4})?/, (_, p1, p2, p3) =>
      [p1, p2, p3].filter(Boolean).join("-")
    );
};

export const maskAadhaarNumber = (
  aadhaar: string | null | undefined
): string => {
  if (!aadhaar || aadhaar.length !== 12) return ""; // Return empty if invalid
  return aadhaar.replace(/^(\d{4})\d{4}(\d{4})$/, "XXXX-XXXX-$2");
};

export const handleDownloadDocument = async (
  filePath: string,
  fileName: string
): Promise<void> => {
  if (!filePath) {
    toastError(validationMessages.filePathMissing);
    return;
  }

  const response = await fetch(filePath);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const handleViewDocument = (filePath: string): void => {
  if (filePath) {
    window.open(filePath, "_blank");
  } else {
    toastError(validationMessages.filePathMissing);
  }
};

export const handleFileDownload = async (
  filePath: string,
  fileName: string
): Promise<void> => {
  if (!filePath) {
    toastError(validationMessages.filePathMissing);
    return;
  }

  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();

  const pdfBlob = new Blob([arrayBuffer], {
    type: "application/pdf",
  });

  const excelBlob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(filePath.includes('.xlsx') ? excelBlob : pdfBlob);
  const correctedFileName = filePath.includes('.xlsx') ? `${fileName}.xlsx` : `${fileName}.pdf`;
  const a = document.createElement("a");
  a.href = url;
  a.download = correctedFileName;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const handleDownloadCSVData = async (
  data: Record<string, any>[],
  headersMap: Record<string, string>,
  fileName: string
): Promise<void> => {
  if (!data || data.length === 0) {
    toastError("No data available to download.");
    return;
  }

  const headers = Object.keys(headersMap);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[headersMap[header]];

          const shouldFormatDate =
            header === "Registration Date" ||
            header === "Sanctioned Date" ||
            header === "Disbursed Date";

          const formattedValue = shouldFormatDate
            ? value && value !== "-" && moment(value).isValid()
              ? moment(value).format("Do MMMM YYYY")
              : "-"
            : value;

          return `"${String(formattedValue ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  // Join rows
  const csvContent = csvRows.join("\r\n");

  // Add UTF-8 BOM so Excel correctly displays ₹ and other Unicode characters
  const csvWithBom = "\uFEFF" + csvContent;

  const blob = new Blob([csvWithBom], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

export const generateCaptcha = (): string => {
  const chars = "0123456789";
  let generatedCaptcha = "";

  for (let i = 0; i < 4; i++) {
    generatedCaptcha += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return generatedCaptcha;
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  });
};

export function shouldShowContractModal(enforcementDate: string | null | undefined): boolean {
  if (!enforcementDate) return false;

  const daysUntilEnforcement = Math.floor(
    (new Date(enforcementDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Show if within 30 days OR passed
  return daysUntilEnforcement <= 30;
}

export function isWithin30DaysOnly(enforcementDate: string | null | undefined): boolean {
  if (!enforcementDate) return false;

  const daysUntilEnforcement = Math.floor(
    (new Date(enforcementDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Future only (exclude today) and ≤ 30 days
  return daysUntilEnforcement > 0 && daysUntilEnforcement <= 30;
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const formatAadhar = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
};

export const normalizeGenderForPayload = (
  value: string | null | undefined
): string => {
  const normalizedValue = (value || "").trim().toLowerCase();

  if (
    normalizedValue === "male" ||
    normalizedValue === "female" ||
    normalizedValue === "other"
  ) {
    return normalizedValue;
  }

  return "";
};

export const normalizeGenderForDisplay = (
  value: string | null | undefined
): "Male" | "Female" | "Other" | "" => {
  const normalizedValue = normalizeGenderForPayload(value);

  if (normalizedValue === "male") return "Male";
  if (normalizedValue === "female") return "Female";
  if (normalizedValue === "other") return "Other";

  return "";
};

export const normalizeAadhar = (value = "") =>
  value.replace(/[^0-9]/g, "");

export const getFetchEligibilityStatus = (
  date: string | null
): { isEnabled: boolean; daysLeft: number } => {
  if (!date) {
    return {
      isEnabled: true,
      daysLeft: 0,
    };
  }

  const fetched = moment(date);
  const today = moment();

  if (!fetched.isValid()) {
    return {
      isEnabled: true,
      daysLeft: 0,
    };
  }

  const daysPassed = today.diff(fetched, "days");

  return {
    isEnabled: daysPassed === 0,
    daysLeft: Math.max(daysPassed, 0),
  };
};

export const fetchCreditAnalyticsDashboard = async (
  reportType: ReportTypeSignalR, data: ReportTypeSignalrResponse
): Promise<void> => {
  switch (reportType) {
    case ReportTypeSignalR.CreditAnalyticsReport:
    case ReportTypeSignalR.IncomeTaxReport:
      {
        const response: IClientDashboardResponse =
          await getClientDashboardAPI();

        if (!response) return;

        if (response.statusCode === 200) {
          const decryptedData = {
            ...response.data,
            gstNumber: response.data.gstNumber
              ? decryptVAPTData(response.data.gstNumber)
              : null,
          };

          const creditReportEligibility = getFetchEligibilityStatus(
            decryptedData.creditReportDate
          );

          const incomeTaxReportEligibility = getFetchEligibilityStatus(
            decryptedData.itrReportDate
          );

          const finalData: IClientDashboardData = {
            ...decryptedData,
            creditScoreRefetchedDays:
              creditReportEligibility?.daysLeft,
            incomeTaxRefetchedDays:
              incomeTaxReportEligibility?.daysLeft,
          };

          store.dispatch(setCustomerInfo(finalData));

          store.dispatch(setCount((prev: number) => prev + 1));

          store.dispatch(setReportMessage({
            title: "Report Update",
            message: data?.message,
          }));
        } else {
          toastError(response.message);
        }
        break;
      }

    case ReportTypeSignalR.BankingReportInProgress:
    case ReportTypeSignalR.BankingReportCompleted:
    case ReportTypeSignalR.GSTReport:
    case ReportTypeSignalR.UNKNOW:
      {
        if (data?.statusCode === 409) {
          store.dispatch(setWrongUser(true));
          store.dispatch(setReportMessage({
            title: "Report Update",
            message: data?.message,
          }));
          return;
        }

        store.dispatch(setReportMessage({
          title: "Report Update",
          message: data?.message,
        }));
        store.dispatch(setCount((prev: number) => prev + 1));
        break;
      }

    default:
      store.dispatch(setReportMessage({
        title: "Report Update",
        message: data?.message,
      }));
      console.log("No action defined for report type:", reportType);
      break;
  }
};

export const updateWhiteLabelSettings = async (
  data: ReportTypeSignalrResponse
): Promise<void> => {
  const currentUser = store.getState()?.user?.user;
  const incomingSettings = data?.whiteLabelSettings;

  if (!currentUser || !incomingSettings || !data?.whiteLabelUserId) {
    return;
  }

  const mergeWhiteLabelUser = (user: UserData): UserData => ({
    ...user,
    whiteLabelSettings: {
      ...user.whiteLabelSettings,
      ...incomingSettings,
      whiteLabelPermission: {
        ...user.whiteLabelSettings?.whiteLabelPermission,
        ...incomingSettings.whiteLabelPermission,
      },
    },
  });

  const updatedUser = mergeWhiteLabelUser(currentUser);

  const impersonateUserDataRaw = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
  );

  let impersonateUserData: UserData | null = null;

  if (impersonateUserDataRaw) {
    try {
      impersonateUserData = JSON.parse(impersonateUserDataRaw) as UserData;
    } catch (error) {
      console.error(
        "Failed to parse impersonated user data while updating white label settings.",
        error,
      );
    }
  }

  const shouldRefreshImpersonateUser =
    impersonateUserData &&
    impersonateUserData.userID !== currentUser.userID &&
    impersonateUserData.whiteLabelSettings?.whiteLabelUserId ===
    data.whiteLabelUserId;

  if (shouldRefreshImpersonateUser && impersonateUserData) {
    const updatedImpersonateUser = mergeWhiteLabelUser(impersonateUserData);

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      JSON.stringify(updatedImpersonateUser),
    );
  }

  store.dispatch(setUserData(updatedUser));
  applyWhiteLabelBranding(updatedUser.whiteLabelSettings);
  emitWhiteLabelSettingsUpdated(data.whiteLabelUserId);

  if (data.message) {
    toastSuccess(data.message);
  }
};

export const rgbToHex = (value: string): string => {
  const matches = value.match(/\d+/g);

  if (!matches || matches.length < 3) return value;

  const [red, green, blue] = matches.slice(0, 3).map(Number);

  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
};

export const resolveColorValue = (value: string): string => {
  if (typeof window === "undefined") return value;

  if (value.startsWith("var(")) {
    const variableName = value.slice(4, -1).trim();
    const resolvedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();

    if (!resolvedValue) return value;

    if (resolvedValue.startsWith("#")) return resolvedValue;

    if (resolvedValue.startsWith("rgb")) return rgbToHex(resolvedValue);

    return resolvedValue;
  }

  if (value.startsWith("rgb")) return rgbToHex(value);

  return value;
};

export const getRoleName = (roleId: number): string => {
  if (roleId === CLIENT_ROLE.SUPER_ADMIN) return "Admin";
  return "User";
};

export const extractPermission = (
  source?: IWhiteLabelPermission | IGetWhiteLabelSettingsByUserIdResponseData | null,
): IWhiteLabelPermission | null => {
  if (!source) return null;

  // ✅ If nested structure
  if ("whiteLabelPermission" in source) {
    return source.whiteLabelPermission;
  }

  // ✅ Already flat permission
  return source;
};

export const convertNumberToWords = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertBelowThousand = (num: number): string => {
    if (num === 0) return "";
    if (num < 20) return belowTwenty[num];
    if (num < 100) {
      return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${belowTwenty[num % 10]}` : ""
        }`;
    }

    return `${belowTwenty[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${convertBelowThousand(num % 100)}` : ""
      }`;
  };

  let remainingValue = Math.floor(value);
  const words: string[] = [];

  if (remainingValue >= 10_000_000) {
    const crore = Math.floor(remainingValue / 10_000_000);
    words.push(`${convertNumberToWords(crore)} Crore`);
    remainingValue %= 10_000_000;
  }

  if (remainingValue >= 100_000) {
    const lakh = Math.floor(remainingValue / 100_000);
    words.push(`${convertBelowThousand(lakh)} Lakh`);
    remainingValue %= 100_000;
  }

  if (remainingValue >= 1_000) {
    const thousand = Math.floor(remainingValue / 1_000);
    words.push(`${convertBelowThousand(thousand)} Thousand`);
    remainingValue %= 1_000;
  }

  if (remainingValue > 0) {
    words.push(convertBelowThousand(remainingValue));
  }

  return words.join(" ").trim();
};

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

export const getApiErrorMessage = (message?: string | null): string =>
  message?.trim() || "There is some internal server issue, please check after some time";
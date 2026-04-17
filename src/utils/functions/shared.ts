import { IsStringNullEmptyOrUndefined } from "./nullCheck";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../constants/environments";
import moment from "moment";
import toast from "react-hot-toast";
import { toasterPosition } from "../constants/constant";
import DOMPurify from "dompurify";
import { validationMessages } from "../constants/messages";
import { LOAN_EMAIL_TEMPLATES } from "../constants/loanEmailTemplates";
import { ISubmitApplicationToBankDetailsResponseData } from "../../interface/applyLoan";
import { ReportTypeSignalR } from "../constants/enum";
import { getClientDashboardAPI } from "../axios/apiServices";
import { IClientDashboardData, IClientDashboardResponse } from "../../interface/clientDashboard";
import { decryptVAPTData } from "./encryptDecrypt";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import store from "../../store";
import { ReportTypeSignalrResponse } from "../../interface/signalr";
import { setCount } from "../../store/reducer/countSlice";
import { setReportMessage } from "../../store/reducer/reportMessageSlice";
import { setWrongUser } from "../../store/reducer/wrongUserSlice";

export const IsFormValid = (obj: object): boolean => {
  let count = 0;

  Object.entries(obj).forEach(([key, value]) => {
    if (!IsStringNullEmptyOrUndefined(value)) {
      count += 1;
    }
  });

  return count === 0 ? true : false;
};

export const restrictInputByPattern = (
  event: React.KeyboardEvent,
  pattern: RegExp
): void => {
  if (!pattern.test(event.key)) {
    event.preventDefault();
  }
};

export const handleErrors = (): void => {
  // prevent production and staging console and warnings
  if (
    process.env.REACT_APP_NAME === "PRODUCTION" ||
    process.env.REACT_APP_NAME === "STAGING"
  ) {
    console.log = () => { };
    console.error = () => { };
    console.debug = () => { };
    console.warn = () => { };
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
      color: "#000",
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
      color: "#000",
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
      color: "#000",
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
      color: "#000",
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
      color: "#000",
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
  window.open(filePath, "_blank", "noopener,noreferrer");
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
    headers.join(","), // CSV Header Row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[headersMap[header]];
          const formattedValue =
            header === "Registration Date" || header === "Disbursed Date"
              ? moment(value).format("Do MMMM YYYY")
              : value;

          const safeValue =
            typeof formattedValue === "string"
              ? `"${formattedValue.replace(/"/g, '""')}"`
              : `"${formattedValue ?? ""}"`;

          return safeValue;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

export const normalizeCmsContent = (content: string): string => {
  if (!content) return "";

  return content
    .replace(/\uFEFF/g, "")
    .replace(/\u200B/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/ï»¿/g, "")
    .replace(/â€œ/g, "\u201c")
    .replace(/â€\u009D|â€\u009c|â€\u009d|â€/g, "\u201d")
    .replace(/â€˜|â€\u0098/g, "\u2018")
    .replace(/â€™|â€\u0099/g, "\u2019")
    .replace(/â€“/g, "\u2013")
    .replace(/â€”/g, "\u2014")
    .replace(/â€¦/g, "\u2026")
    .replace(/â€‘/g, "\u2011")
    .replace(/Â/g, "");
};

export const cleanCmsContent = (content: string): string => {
  if (!content) return "";

  return content
    .replace(/\uFEFF/g, "")
    .replace(/\u200B/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\u00EF\u00BB\u00BF/g, "")
    .replace(/\u00E2\u20AC\u0153/g, "\u201c")
    .replace(/\u00E2\u20AC(?:\u009D|\u009C)/g, "\u201d")
    .replace(/\u00E2\u20AC(?:\u02DC|\u0098)/g, "\u2018")
    .replace(/\u00E2\u20AC(?:\u2122|\u0099)/g, "\u2019")
    .replace(/\u00E2\u20AC\u201C/g, "\u2013")
    .replace(/\u00E2\u20AC\u201D/g, "\u2014")
    .replace(/\u00E2\u20AC\u00A6/g, "\u2026")
    .replace(/\u00E2\u20AC\u2018/g, "\u2011")
    .replace(/\u00C2/g, "");
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(cleanCmsContent(html), {
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

export const generateEmailFromTemplate = (
  data: ISubmitApplicationToBankDetailsResponseData
) => {
  const template = LOAN_EMAIL_TEMPLATES[data.loanDetails.loanType];

  if (!template) {
    toastError("Email template not found for loan type");
  }

  const formatAmount = (amount: number) =>
    amount?.toLocaleString("en-IN");

  const replacements: Record<string, string> = {
    ApplicantName: data.applicantInfo.fullName,
    LoanAmount: formatAmount(data.loanDetails.loanAmount),
    LoanTenure: data.loanDetails.loanTenure?.toString() || "",
    LoanPurpose: data.loanDetails.loanPurpose,
    BankManagerName: data.loanDetails.managerEmail,
    DocumentsUrl: data.packageZipUrl,
    "Partner Name": data.cpInfo.fullName,
    "Application ID": data.loanDetails.loanApplicationCode,
    "Client Name": data.applicantInfo.fullName,
    "Loan Type": data.loanDetails.loanType,
    "Bank / NBFC": data.loanDetails.name,
    Date: formatDate(new Date(), "DD MMM, YYYY")
  };

  const applyReplacements = (text: string) =>
    text.replace(/{{(.*?)}}/g, (_, key) => replacements[key] || "");

  return {
    to: [data.loanDetails.managerEmail],
    bcc: ["support@credorbit.com"],
    subject: applyReplacements(template.subject),
    body: applyReplacements(template.body)
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


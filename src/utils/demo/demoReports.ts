import {
  IBankingAnalyticsReportResponse,
  IChannelPartnerClientReportDetailResponse,
  IGSTReportResponse,
  IITRReportResponse,
  IExternalReportResponse,
  IValidateGSTReportResponse,
} from "../../interface/reports";
import {
  IDocumentListDetailResponse,
  IDocumentListResponse,
  IGetSecureUnsecureDocumentListResponse,
} from "../../interface/document";
import { APIResponseEntity } from "../../interface/apiResponse";
import { IInstitutionListResponse, IUploadBankDocumentResponse } from "../../interface/bankDetail";
import { IIsProceedForCamReportResponse, IIsProceedForCreditReportResponse } from "../../interface/wallet";
import { ICreditAnalyticsResponse } from "../../interface/clientDashboard";
import { ILoanMarketResponse } from "../../interface/loanMarketPlace";
import {
  IGetApplyForLoanResponse,
  ISubmitLoanApplicationToBankResponse,
} from "../../interface/applyLoan";
import { IAdminDashboardResponse } from "../../interface/adminDashboard";
import {
  IChannelPartnerDetailResponse,
  IChannelPartnerResponse,
} from "../../interface/channelPartner";
import { IAadharCardResponse } from "../../interface/contract";
import { IFetchAllPaymentsResponse } from "../../interface/subscription";
import { IFetchTabWiseUserListingResponse } from "../../interface/subscription";
import { IGetUserRightsForUserManagementResponse } from "../../interface/userManagement";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const nexusCpReportDetailResponse = {
  status: true,
  statusCode: 200,
  message: "Channel partner details fetched successfully!",
  data: {
    clientID: "00000000-0000-0000-0000-000000000000",
    clientName: null,
    clientCode: null,
    mobileNumber: null,
    email: null,
    channelPartner: null,
    panNumber: null,
    clientReports: [
      {
        name: "GST Report",
        filePath: "/assets/images/GST Report.pdf",
        reportType: 5,
      },
      {
        name: "ITR Report",
        filePath: "/assets/images/ITR Report.pdf",
        reportType: 4,
      },
      {
        name: "Banking Report",
        filePath: "/assets/images/Banking Report.pdf",
        reportType: 3,
      },
      {
        name: "Credit Analytics Report",
        filePath: "/assets/images/Credit Analytics Report.pdf",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - DARSHAK ATULKUMAR ACHARYA",
        filePath: "/assets/images/Credit Analytics Report.pdf",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - DARSHAK ATULKUMAR ACHARYA",
        filePath: "/assets/images/Credit Analytics Report.pdf",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - ASHOK SAINI",
        filePath: "/assets/images/Credit Analytics Report.pdf",
        reportType: 1,
      },
      {
        name: "CAM Report_HL_08de8bd3-7517-4b14-895d-86d153b58721_03/27/2026 09:18:27_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "/assets/images/CAM_Report_Sample_HL.xlsx",
        reportType: 8,
      },
      {
        name: "CAM Report_WC_Secured_08de955e-20ce-444e-888c-8ad06a3b1f1a_04/08/2026 11:01:48_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "/assets/images/CAM_Report_Sample_WC.xlsx",
        reportType: 8,
      },
      {
        name: "CAM Report_LAP_Residential_08de955a-236c-4f99-8f84-c84f7ae8f09d_04/14/2026 10:15:28_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "/assets/images/CAM_Report_Sample_LAP.xlsx",
        reportType: 8,
      },
      {
        name: "CAM Report_LAP_Residential_08de9a0f-245d-46d6-8a46-67bacbe62074_04/14/2026 11:10:48_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "/assets/images/CAM_Report_Sample_UBL.xlsx",
        reportType: 8,
      },
    ],
  },
} as IChannelPartnerClientReportDetailResponse;

export const getDemoCpReportDetailByClientId = async (
  clientID: string,
): Promise<IChannelPartnerClientReportDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (clientID === "08de0598-4bee-48ca-8a7c-005b36583e79") {
    return nexusCpReportDetailResponse;
  }

  return null;
};

const nexusItrDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "ITR details fetched successfully.",
  data: {
    itrReportDate: "2025-10-31T11:40:22.178244",
    itrDetailsList: [
      {
        id: "08de1872-61c7-4d0d-82af-f9557911e2de",
        fileName: "ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251031_171022",
        filePath: null,
        retrievedDate: "2025-10-31T17:10:22.178244",
        pdfFilePath: "/assets/images/ITR Report.pdf",
        excelFilePath: "/assets/images/ITR Report_Sample.xlsx",
      },
      {
        id: "08de107b-a2eb-4d52-85e4-d3cea3cbd02b",
        fileName: "ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251021_135701",
        filePath: null,
        retrievedDate: "2025-10-21T13:57:01.145641",
        pdfFilePath: "/assets/images/ITR Report.pdf",
        excelFilePath: "/assets/images/ITR Report_Sample.xlsx",
      },
    ],
  },
} as IITRReportResponse;

const nexusGstDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "GST details fetched successfully!",
  data: {
    enableGstReport: true,
    gstNumber: "djtPZLt2l6mxlm5kPD32xw==",
    gstList: [
      { id: 220, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "qM1+glEUF++WdxM3oyACgw==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
      { id: 221, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "LrDZ99I/RC7UGJElYhBrLQ==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
      { id: 222, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "djtPZLt2l6mxlm5kPD32xw==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
    ],
    gstDetailsList: [
      { id: "08de74f7-44ea-4dfe-8b46-658ac0e4abad", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20260226_105117", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2026-02-26T10:51:11.871114", gstFrom: "Apr 2023", gstTo: "Nov 2025", gstNumber: "24ABBFM8327L1Z2" },
      { id: "08de1929-6cb7-4754-88cf-b4200c7e583a", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_150042", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-11-01T15:00:42.081426", gstFrom: "Apr 2023", gstTo: "Sep 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ" },
      { id: "08de1924-f83f-4159-829e-ec09c65a9836", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_142842", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-11-01T14:28:42.549947", gstFrom: "Apr 2023", gstTo: "Sep 2025", gstNumber: "08AAGCN4499R1ZD" },
      { id: "08de0bd6-e5a6-428b-82fc-002972127382", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160645", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-10-15T16:06:45.375995", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
      { id: "08de0bd6-572f-4d44-8b23-dee4ed341271", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160201", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
      { id: "08de05a1-d2a1-4d0b-84b4-48d8313c4cc0", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183220", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-08-07T18:32:20.416701", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ" },
      { id: "08de05a1-87ea-4b24-8287-785490863a86", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183014", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-08-07T18:30:13.942839", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ" },
      { id: "08de05a0-0e87-4346-86ba-d6a449fc50fc", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_181911", pdfFilePath: "/assets/images/GST Report.pdf", excelFilePath: "/assets/images/GST Report_Sample.xlsx", retrievedDate: "2025-08-07T18:19:10.943928", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
    ],
  },
} as unknown as IGSTReportResponse;

const nexusBankingAnalyticsDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "Banking Analytics details fetched successfully.",
  data: {
    bankingReportDate: false,
    bankingAnalyticsDetailsList: [
      {
        id: "08de868c-b1ab-4ef4-837d-36e47fbd1d50",
        fileName: "Banking Report_NEXUS NUTRI SCIENCE LIMITED_20260320_195556",
        filePath: null,
        retrievedDate: "2026-03-20T19:55:56.378287",
        bankName: "Yes Bank",
        accountType: "Current",
        period: "01-08-2022 to 31-08-2022",
        pdfFilePath: "/assets/images/Banking Report.pdf",
        excelFilePath: "/assets/images/Banking Report_Sample.xlsx",
      },
    ],
  },
} as unknown as IBankingAnalyticsReportResponse;

const nexusDocumentStatusResponse = {
  status: true,
  statusCode: 200,
  message: "Document status fetched successfully",
  data: [
    { documentName: "BankStatements", isCarryingFiles: true, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Loan Documents - Company", isCarryingFiles: true, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "KYC - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "KYC - Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "IT Returns - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "IT Returns - Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "TAR", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "SAR of Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Loan Documents - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "GST Returns", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Property Documents", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: true },
    { documentName: "Unrecognized", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
  ],
} as IDocumentListResponse;

const nexusDocumentDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "",
  data: {
    documentType: "BankStatements",
    folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements",
    fileModels: [],
    missingDocuments: [],
    subFolders: [
      {
        subFolderName: "BankStatements",
        files: [
          { fileName: "Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
          { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %$( BANK STATEMENT AUG-22.pdf", uploadDate: "2026-03-20T14:23:39Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
          { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf", uploadDate: "2026-01-22T06:41:26Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
        ],
      },
    ],
    isFileModels: false,
  },
} as IDocumentListDetailResponse;

const nexusSecureUnsecureDocumentListResponse = {
  status: true,
  statusCode: 200,
  message: "Document List Fetched successfully!",
  data: [
    { folderName: "KYC - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/KYC - Directors", subFolders: [{ subFolderName: "PAN Card", files: [] }, { subFolderName: "Aadhar Card", files: [] }, { subFolderName: "Light Bill", files: [] }, { subFolderName: "Tax Bill", files: [] }] },
    { folderName: "KYC - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/KYC - Company", subFolders: [{ subFolderName: "PAN of Company", files: [] }, { subFolderName: "GST Certificate", files: [] }, { subFolderName: "VAT Certificate", files: [] }, { subFolderName: "Udhyam Certificate", files: [] }, { subFolderName: "Certificate of Incorporation", files: [] }, { subFolderName: "Certificate of Import-Export", files: [] }, { subFolderName: "Rent Agreement", files: [] }, { subFolderName: "GPCB Certificate", files: [] }, { subFolderName: "MOA", files: [] }, { subFolderName: "AOA", files: [] }, { subFolderName: "Light Bill of business", files: [] }, { subFolderName: "Tax Bill of business", files: [] }, { subFolderName: "ISO Certificate", files: [] }] },
    { folderName: "IT Returns - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/IT Returns - Directors", subFolders: [{ subFolderName: "ITR Acknowledgement", files: [] }, { subFolderName: "ITR Form", files: [] }, { subFolderName: "Computation of Income", files: [] }, { subFolderName: "Form 26AS", files: [] }] },
    { folderName: "IT Returns - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/IT Returns - Company", subFolders: [{ subFolderName: "ITR Acknowledgement", files: [] }, { subFolderName: "ITR Form", files: [] }, { subFolderName: "Computation of Income", files: [] }, { subFolderName: "Form 26AS", files: [] }] },
    { folderName: "TAR", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/TAR", subFolders: [{ subFolderName: "Form 3CD", files: [] }, { subFolderName: "Financials", files: [] }, { subFolderName: "Acknowledgement Receipt of TAR", files: [] }] },
    { folderName: "SAR of Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/SAR of Company", subFolders: [{ subFolderName: "Auditors Report", files: [] }, { subFolderName: "Financials", files: [] }, { subFolderName: "Director's Report", files: [] }] },
    { folderName: "BankStatements", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements", subFolders: [{ subFolderName: "BankStatements", files: [] }] },
    { folderName: "Loan Documents - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Loan Documents - Directors", subFolders: [{ subFolderName: "Welcome letter or Sanction letter", files: [] }, { subFolderName: "Statement of Account or SOA", files: [] }] },
    { folderName: "Loan Documents - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Loan Documents - Company", subFolders: [{ subFolderName: "Welcome letter or Sanction letter", files: [] }, { subFolderName: "Statement of Account or SOA", files: [] }] },
    { folderName: "GST Returns", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/GST Returns", subFolders: [{ subFolderName: "GSTR 3B", files: [] }, { subFolderName: "GSTR 1", files: [] }] },
    { folderName: "Property Documents", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Property Documents", subFolders: [{ subFolderName: "7 by 12 Utara", files: [] }, { subFolderName: "Form 8A", files: [] }, { subFolderName: "Form 6 Hakka Patra Entries", files: [] }, { subFolderName: "NA Permission Order", files: [] }, { subFolderName: "Gam Namuno 2", files: [] }, { subFolderName: "Layout Plan of the Unit", files: [] }, { subFolderName: "Raja Chiththi or Commencement Certificate", files: [] }, { subFolderName: "Land Purchase Agreement", files: [] }, { subFolderName: "Original Title Report", files: [] }, { subFolderName: "Development Agreement", files: [] }, { subFolderName: "Society Registration Certificate", files: [] }, { subFolderName: "Society No Due Certificate", files: [] }, { subFolderName: "Index - 2", files: [] }, { subFolderName: "Sale deed copy", files: [] }, { subFolderName: "Allotment Letter", files: [] }, { subFolderName: "Possesion Letter", files: [] }, { subFolderName: "Share Certificate", files: [] }, { subFolderName: "Mortgage deed copy", files: [] }, { subFolderName: "Release of mortgage", files: [] }] },
  ],
} as IGetSecureUnsecureDocumentListResponse;

const nexusSubfolderDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "",
  data: {
    documentType: "BankStatements",
    folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/",
    fileModels: [
      { fileName: "Subscription Invoice Jarvis Credo CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
      { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %$( BANK STATEMENT AUG-22.pdf", uploadDate: "2026-03-20T14:23:39Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
      { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf", uploadDate: "2026-01-22T06:41:26Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
    ],
    missingDocuments: null as unknown as string[],
    subFolders: null as unknown as any[],
    isFileModels: true,
  },
} as IDocumentListDetailResponse;

export const getDemoItrDetails = async (): Promise<IITRReportResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusItrDetailsResponse;
};

export const getDemoGstDetails = async (): Promise<IGSTReportResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusGstDetailsResponse;
};

export const getDemoBankingAnalyticsDetails =
  async (): Promise<IBankingAnalyticsReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return nexusBankingAnalyticsDetailsResponse;
  };

export const getDemoDocumentStatus = async (): Promise<IDocumentListResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusDocumentStatusResponse;
};

export const getDemoDocumentDetails = async (
  folderName: string,
): Promise<IDocumentListDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (folderName === "BankStatements") {
    return nexusDocumentDetailsResponse;
  }

  return null;
};

export const getDemoSecureUnsecureDocumentList =
  async (): Promise<IGetSecureUnsecureDocumentListResponse> => {
    await wait(DEMO_DELAY_MS);
    return nexusSecureUnsecureDocumentListResponse;
  };

export const getDemoSubfolderDetails = async (
  folderName: string,
  subFolderName: string,
): Promise<IDocumentListDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (folderName === "BankStatements" && subFolderName === "BankStatements") {
    return nexusSubfolderDetailsResponse;
  }

  return null;
};

const proceedForCreditReportResponse = {
  status: true,
  statusCode: 200,
  message: "Consent is required to proceed. Please verify using OTP.",
  data: {
    isConsentRequired: true,
    reservationId: "00000000-0000-0000-0000-000000000000",
  },
} as IIsProceedForCreditReportResponse;

const sendOtpForCreditReportResponse = {
  status: true,
  statusCode: 200,
  message: "OTP sent successfully.",
  data: {
    requestId: "1142510",
  },
} as IExternalReportResponse;

const verifyOtpAndGenerateReportResponse = {
  status: true,
  statusCode: 200,
  message:
    "Your request is currently being processed. You will be notified once the report is ready. Please wait.",
  data: null,
} as unknown as ICreditAnalyticsResponse;

const validateGstReportGenerationResponse = {
  status: true,
  statusCode: 200,
  message: "Eligible to generate new report.",
  data: null,
} as unknown as IValidateGSTReportResponse;

const institutionListResponse = {
  status: true,
  statusCode: 200,
  message: "Institution list fetched successfully!",
  data: [
    { institutionID: 1, bankName: "HDFC Bank" },
    { institutionID: 2, bankName: "State Bank of India" },
    { institutionID: 3, bankName: "ICICI Bank Ltd" },
    { institutionID: 4, bankName: "Axis Bank" },
    { institutionID: 5, bankName: "Kotak Mahindra Bank" },
    { institutionID: 6, bankName: "Andhra Bank" },
    { institutionID: 7, bankName: "IDBI Bank" },
    { institutionID: 8, bankName: "Canara Bank" },
    { institutionID: 9, bankName: "Punjab National Bank" },
    { institutionID: 10, bankName: "Central Bank of India" },
    { institutionID: 11, bankName: "Yes Bank Ltd" },
    { institutionID: 12, bankName: "Indian Bank" },
    { institutionID: 13, bankName: "Federal Bank" },
    { institutionID: 14, bankName: "Citibank" },
    { institutionID: 15, bankName: "Bank of India" },
    { institutionID: 16, bankName: "Union Bank of India" },
    { institutionID: 17, bankName: "Bank of Baroda" },
    { institutionID: 19, bankName: "Dena Bank" },
    { institutionID: 20, bankName: "Vijaya Bank" },
    { institutionID: 21, bankName: "Corporation Bank" },
    { institutionID: 22, bankName: "Oriental Bank of Commerce" },
    { institutionID: 23, bankName: "United Bank of India" },
    { institutionID: 24, bankName: "Syndicate Bank" },
    { institutionID: 25, bankName: "Standard Chartered Bank" },
    { institutionID: 26, bankName: "IndusInd Bank Ltd" },
    { institutionID: 27, bankName: "Allahabad Bank" },
    { institutionID: 28, bankName: "Karnataka Bank" },
    { institutionID: 29, bankName: "IDFC FIRST Bank Ltd" },
    { institutionID: 30, bankName: "Indian Overseas Bank" },
    { institutionID: 31, bankName: "Paytm Payments Bank" },
    { institutionID: 32, bankName: "Karur Vysya Bank" },
    { institutionID: 33, bankName: "Ujjivan Small Finance Bank" },
    { institutionID: 34, bankName: "UCO Bank" },
    { institutionID: 35, bankName: "South Indian Bank" },
    { institutionID: 36, bankName: "RBL (Ratnakar) Bank" },
    { institutionID: 37, bankName: "Fino Payments Bank" },
    { institutionID: 38, bankName: "Bank of Maharashtra" },
    { institutionID: 39, bankName: "AU Small Finance Bank" },
    { institutionID: 40, bankName: "Punjab and Sind Bank" },
    { institutionID: 41, bankName: "Fincare Small Finance Bank" },
    { institutionID: 42, bankName: "Dbs Bank" },
    { institutionID: 43, bankName: "Bandhan Bank" },
    { institutionID: 44, bankName: "Municipal Bank" },
    { institutionID: 45, bankName: "Utkarsh Small Finance Bank" },
    { institutionID: 46, bankName: "Jana Small Finance Bank" },
    { institutionID: 47, bankName: "Esaf Small Finance Bank" },
    { institutionID: 48, bankName: "Equitas Small Finance Bank" },
    { institutionID: 49, bankName: "CITY UNION BANK LTD" },
    { institutionID: 50, bankName: "India Post Payments Bank" },
    { institutionID: 51, bankName: "DCB Bank Ltd" },
    { institutionID: 69, bankName: "Saraswat co-operative Bank Ltd" },
    { institutionID: 70, bankName: "Airtel Payments Bank" },
    { institutionID: 71, bankName: "Tamilnad Mercentile Bank Ltd." },
    { institutionID: 72, bankName: "Rajasthan Marudhara Gramin Bank" },
    { institutionID: 73, bankName: "Yes Bank Ltd" },
    { institutionID: 74, bankName: "Jammu&Kashmir Bank" },
    { institutionID: 75, bankName: "Karnataka Vikas Grameena Bank" },
    { institutionID: 76, bankName: "AP GRAMEENA VIKAS BANK" },
    { institutionID: 77, bankName: "Punjab and Sind Bank" },
    { institutionID: 78, bankName: "Thane Janata Sahakari Bank" },
    { institutionID: 79, bankName: "THE COSMOS CO-OP. BANK LTD" },
    { institutionID: 80, bankName: "CSB Bank Ltd." },
    { institutionID: 81, bankName: "GP Parsik Bank" },
    { institutionID: 82, bankName: "Dhanlaxmi Bank" },
    { institutionID: 83, bankName: "Shamrao Vithal Co-op. Bank Ltd." },
    { institutionID: 84, bankName: "Telangana State Co-operative Apex Bank Ltd." },
    { institutionID: 85, bankName: "Janata Sahakari Bank Ltd." },
    { institutionID: 86, bankName: "Kalyan Janata Sahakari Bank Ltd." },
    { institutionID: 87, bankName: "kallapana awade Bank" },
    { institutionID: 88, bankName: "Sarva Haryana Gramin Bank" },
    { institutionID: 89, bankName: "Post Office Saving Bank" },
    { institutionID: 90, bankName: "Sarvodaya Commercial Co-Operactive Bank Limited" },
    { institutionID: 91, bankName: "NKGSB Bank" },
    { institutionID: 92, bankName: "HSBC" },
    { institutionID: 93, bankName: "ACME BANK" },
    { institutionID: 94, bankName: "FinShareBankServer" },
    { institutionID: 95, bankName: "Setu FIP" },
    { institutionID: 96, bankName: "Finvu Bank Ltd" },
    { institutionID: 98, bankName: "Tripura Gramin Bank" },
    { institutionID: 108, bankName: "Federal Bank Ltd" },
    { institutionID: 110, bankName: "Deutsche Bank" },
    { institutionID: 112, bankName: "Jana Small Finance Bank" },
    { institutionID: 114, bankName: "Saraswat Bank" },
    { institutionID: 133, bankName: "IDFC FIRST Bank Ltd(Micro Business Loan)" },
    { institutionID: 134, bankName: "Yes Bank Ltd (Micro Business Loan)" },
    { institutionID: 135, bankName: "Kotak Bank Ltd" },
  ],
} as IInstitutionListResponse;

const loanDocumentsUploadedResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Documents uploaded successfully!",
  data: {
    uploadedFiles: [
      {
        id: "08de9adf-00af-46e3-8b43-3ff357f3fbcd",
        bankID: 73,
        fileName: "YES BANK STATEMENT AUG-22 1.pdf",
        filePath: "/assets/images/document_uploaded.pdf",
        isValidPdf: true,
        isScannedPdf: false,
        hasPasswordIssue: false,
      },
    ],
    bankingReportDate: null,
  },
} as unknown as IUploadBankDocumentResponse;

const validateBankStatementFilesResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Documents uploaded successfully!",
  data: {
    uploadedFiles: [
      {
        id: "08de9adf-00af-46e3-8b43-3ff357f3fbcd",
        bankID: 73,
        fileName: "YES BANK STATEMENT AUG-22 1.pdf",
        filePath: "/assets/images/document_uploaded.pdf",
        isValidPdf: true,
        isScannedPdf: false,
        hasPasswordIssue: false,
      },
    ],
    bankingReportDate: null,
  },
} as unknown as APIResponseEntity;

const uploadBankStatementFilesResponse = {
  status: true,
  statusCode: 200,
  message:
    "Your request is currently being processed. You will be notified once the process is completed. Please wait.",
  data: null,
} as APIResponseEntity;

export const getDemoProceedForCreditReport =
  async (): Promise<IIsProceedForCreditReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return proceedForCreditReportResponse;
  };

export const getDemoSendOtpForCreditReport =
  async (): Promise<IExternalReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return sendOtpForCreditReportResponse;
  };

export const getDemoVerifyOtpAndGenerateReport =
  async (): Promise<ICreditAnalyticsResponse> => {
    await wait(DEMO_DELAY_MS);
    return verifyOtpAndGenerateReportResponse;
  };

export const getDemoValidateGstReportGeneration =
  async (): Promise<IValidateGSTReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return validateGstReportGenerationResponse;
  };

export const getDemoInstitutionList =
  async (): Promise<IInstitutionListResponse> => {
    await wait(DEMO_DELAY_MS);
    return institutionListResponse;
  };

export const getDemoUploadLoanDocuments =
  async (): Promise<IUploadBankDocumentResponse> => {
    await wait(DEMO_DELAY_MS);
    return loanDocumentsUploadedResponse;
  };

export const getDemoValidateBankStatementFiles =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return validateBankStatementFilesResponse;
  };

export const getDemoUploadBankStatementFiles =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return uploadBankStatementFilesResponse;
  };

const uploadedBankDocumentsResponse = {
  status: true,
  statusCode: 200,
  message: "Uploaded bank documents fetched successfully!",
  data: {
    uploadedFiles: [
      {
        id: "08de9adf-00af-46e3-8b43-3ff357f3fbcd",
        bankID: 73,
        fileName: "YES BANK STATEMENT AUG-22 1.pdf",
        filePath:
          "/assets/images/document_uploaded.pdf",
        isValidPdf: true,
        isScannedPdf: false,
        hasPasswordIssue: false,
      },
    ],
    bankingReportDate: "2026-04-15T11:06:11",
  },
};

const proceedForCamReportResponse = {
  status: true,
  statusCode: 200,
  message: "Report is Completed",
  data: {
    isInProgress: false,
    reportType: 3,
  },
} as IIsProceedForCamReportResponse;

const loanMarketplaceResponse = {
  status: true,
  statusCode: 200,
  message: "Loan market place loaded successfully!",
  data: {
    bankDetails: [
      {
        "bankID": 109,
        "bankName": "ICICI Home Finance",
        "loanAmount": 1193985.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.550000000000000000000000000,
        "roI_Max": 10.050000000000000000000000000,
        "tenure": 15.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/ICICI-HF-logo.jpg?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=3DtFIHk1WNSS5p3C4PHH43J2f%2BoTKB%2BRwOIfPxH2N7k%3D"
      },
      {
        "bankID": 99,
        "bankName": "ICICI Home Finance Ltd",
        "loanAmount": 1193985.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.550000000000000000000000000,
        "roI_Max": 10.050000000000000000000000000,
        "tenure": 15.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/ICICI_Home_Finance_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=maj%2FUeqMPo%2Bwuq4hQtqakR21xh%2Fu7Ph4oh3tTe3f9AU%3D"
      },
      {
        "bankID": 100,
        "bankName": "Poonawala Fincorp Ltd",
        "loanAmount": 1000338.0000000000000000000000,
        "emi": 10168.000000000000000000000000,
        "roI_Min": 11.500000000000000000000000000,
        "roI_Max": 13.000000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Poonawala_Fincorp_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=2mG1jRjE9OJ4eY2ehWPb6Y7ZdaNE5MyhuFMrm%2FcH0XY%3D"
      },
      {
        "bankID": 26,
        "bankName": "IndusInd Bank Ltd",
        "loanAmount": 1518922.0000000000000000000000,
        "emi": 15042.000000000000000000000000,
        "roI_Min": 11.500000000000000000000000000,
        "roI_Max": 13.000000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Indusind_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=H%2FiiTE2khXy21MvxzJKqozxTd166GR8cOQVIrLAzh%2FY%3D"
      },
      {
        "bankID": 29,
        "bankName": "IDFC FIRST Bank Ltd",
        "loanAmount": 1297750.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.000000000000000000000000000,
        "roI_Max": 11.500000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/IDFC_First_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=OKI0v4Wk2lxtzMQ0SsASnIFDeoNqVR2UF4EaNtmuR%2Fk%3D"
      },
      {
        "bankID": 33,
        "bankName": "Ujjivan Small Finance Bank",
        "loanAmount": 1535828.0000000000000000000000,
        "emi": 15042.000000000000000000000000,
        "roI_Min": 10.990000000000000000000000000,
        "roI_Max": 12.490000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/ujjivan-bank-logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=J%2FFagfo3UtjofBrJaMwdNkpLQexuylkb5EzGw3msJuc%3D"
      },
      {
        "bankID": 101,
        "bankName": "Axis Finance Ltd ",
        "loanAmount": 1315997.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.250000000000000000000000000,
        "roI_Max": 11.750000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Axis_Finance_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=ZJqb8KYQh24QgjgW1Q9%2F5SLloKyA0FtQjpv9Ao7RtyM%3D"
      },
      {
        "bankID": 51,
        "bankName": "DCB Bank Ltd",
        "loanAmount": 1243274.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.750000000000000000000000000,
        "roI_Max": 11.250000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/DCB_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=RWtuNYsp%2BxIExfAYZRPdi1cBAEKlY7fjQlQTUYfgIoA%3D"
      },
      {
        "bankID": 117,
        "bankName": "Fullerton India Home Finance Company Ltd",
        "loanAmount": 1181180.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.500000000000000000000000000,
        "roI_Max": 13.750000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 3,
        "bankName": "ICICI Bank Ltd",
        "loanAmount": 1193985.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.550000000000000000000000000,
        "roI_Max": 10.050000000000000000000000000,
        "tenure": 15.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/ICICI_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=EPlYlq1%2FUnu5c%2Bn3LJucmahAkXNokMyY%2FjJj5mutQ8s%3D"
      },
      {
        "bankID": 105,
        "bankName": "Tata Capital Ltd",
        "loanAmount": 891437.0000000000000000000000,
        "emi": 8544.000000000000000000000000,
        "roI_Min": 9.900000000000000000000000000,
        "roI_Max": 11.400000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Tata_Capital_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=DXmYpid%2BvUIFaF76HT5%2FJY1G05zktlcxj9ezaqie%2BLg%3D"
      },
      {
        "bankID": 106,
        "bankName": "Cholamandalam Investment and Finance Company Ltd",
        "loanAmount": 1142492.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 11.000000000000000000000000000,
        "roI_Max": 12.500000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Chola_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=2KPDHQX84R%2Br7s5oDF7hQ2FkpCmifuiGJENsjNKOLJQ%3D"
      },
      {
        "bankID": 11,
        "bankName": "Yes Bank Ltd",
        "loanAmount": 1060867.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.600000000000000000000000000,
        "roI_Max": 12.100000000000000000000000000,
        "tenure": 15.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Yes_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=tJcxHjA7zZ%2BDS4VUH%2FOPlHr6GKIE0PM291fhq3KQFSs%3D"
      },
      {
        "bankID": 107,
        "bankName": "Aditya Birla Finance Ltd",
        "loanAmount": 1265130.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.500000000000000000000000000,
        "roI_Max": 11.000000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Aditya_Birla_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=r7CNEdF%2Fovs5zqVioiGp5NFWkHEuZHrGp4kJg%2Ff3tIY%3D"
      },
      {
        "bankID": 108,
        "bankName": "Federal Bank Ltd",
        "loanAmount": 1180275.0000000000000000000000,
        "emi": 10168.000000000000000000000000,
        "roI_Min": 8.400000000000000000000000000,
        "roI_Max": 10.000000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Federal_Bank_Logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=fuU5hBpZzVwEwuOFyinekDtNDvUlEPpDjVw3VuAkUXQ%3D"
      },
      {
        "bankID": 5,
        "bankName": "Kotak Mahindra Bank",
        "loanAmount": 1251944.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.650000000000000000000000000,
        "roI_Max": 11.150000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/Kotak-Bank-logo.png?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=AGk%2BGLvHygIuNG0kqM3Un8S2RsmiXHTm9XoQ7qej0JI%3D"
      },
      {
        "bankID": 39,
        "bankName": "AU Small Finance Bank",
        "loanAmount": 1238305.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 11.000000000000000000000000000,
        "roI_Max": 13.500000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 118,
        "bankName": "Home First Finance Company",
        "loanAmount": 1315393.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.950000000000000000000000000,
        "roI_Max": 13.000000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 119,
        "bankName": "L & T Finance",
        "loanAmount": 1499004.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.750000000000000000000000000,
        "roI_Max": 8.850000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 120,
        "bankName": "Capri Global Housing Finance Ltd ",
        "loanAmount": 1297750.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.000000000000000000000000000,
        "roI_Max": 11.500000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 121,
        "bankName": "Mahindra Home Finance ",
        "loanAmount": 1297750.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.000000000000000000000000000,
        "roI_Max": 11.500000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 122,
        "bankName": "Bajaj Housing Finance Ltd  ",
        "loanAmount": 1289183.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.500000000000000000000000000,
        "roI_Max": 12.000000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 123,
        "bankName": "Godrej Housing Finance",
        "loanAmount": 1402463.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.500000000000000000000000000,
        "roI_Max": 11.000000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 46,
        "bankName": "Jana Small Finance Bank",
        "loanAmount": 1289183.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.500000000000000000000000000,
        "roI_Max": 13.500000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 124,
        "bankName": "General Insurance Corporation Housing Finance Ltd",
        "loanAmount": 1577077.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.200000000000000000000000000,
        "roI_Max": 13.500000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 125,
        "bankName": "Hero Housing Finance ",
        "loanAmount": 1433453.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.250000000000000000000000000,
        "roI_Max": 12.000000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 126,
        "bankName": "Indiabulls Housing Finance Ltd",
        "loanAmount": 1377034.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.250000000000000000000000000,
        "roI_Max": 12.000000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 127,
        "bankName": "India Shelter",
        "loanAmount": 1142492.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 11.000000000000000000000000000,
        "roI_Max": 13.000000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 129,
        "bankName": "Jm Finance Home Loans",
        "loanAmount": 1105808.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 11.500000000000000000000000000,
        "roI_Max": 13.500000000000000000000000000,
        "tenure": 20.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 130,
        "bankName": "Kifs Housing Finance Ltd",
        "loanAmount": 1248983.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.500000000000000000000000000,
        "roI_Max": 13.500000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 131,
        "bankName": "Piramal Housing & Capital Finance",
        "loanAmount": 1323328.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.750000000000000000000000000,
        "roI_Max": 13.000000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 132,
        "bankName": "Pnb Housing Finance Ltd",
        "loanAmount": 1399519.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 9.050000000000000000000000000,
        "roI_Max": 10.450000000000000000000000000,
        "tenure": 25.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 36,
        "bankName": "RBL (Ratnakar) Bank",
        "loanAmount": 1258231.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 10.800000000000000000000000000,
        "roI_Max": 12.000000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
      {
        "bankID": 16,
        "bankName": "Union Bank of India",
        "loanAmount": 1694850.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 7.4500000000000000000000000000,
        "roI_Max": 8.400000000000000000000000000,
        "tenure": 30.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": ""
      },
    ],
  },
} as unknown as ILoanMarketResponse;

const applyForLoanResponse = {
  status: true,
  statusCode: 200,
  message: "Apply for loan details fetched successfully!",
  data: {
    channelPartnerCode: "COCP241101",
    channelPartnerPayoutPercent: 2,
    sourcingPartnerName: null,
    sourcingPartnerPayoutPercent: 0,
    coApplicantsList: [
      { id: "08de8afd-62f3-4994-8d0f-fd936249a9f5", name: "DARSHAK ATULKUMAR ACHARYA", firstName: null, middleName: null, lastName: null, pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-6a0b-4388-89f9-1a3cb61e8558", name: "DEV SANJAYKUMAR BHUPTANI", firstName: null, middleName: null, lastName: null, pan: "yMxMPliigDtX5/toz6v+xQ==", aadhaarNumber: "5MQcIhAiN8RAsJHaUSjBQg==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-6bba-4a16-87a3-7cefdc4a60d7", name: "NISHI BHAVSAR", firstName: null, middleName: null, lastName: null, pan: "fS8pJqDN4tti+RyalNeN7w==", aadhaarNumber: null, address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-6f38-4e09-87b7-4b40bbfe8389", name: "DARSHAK ATULKUMAR ACHARYA", firstName: null, middleName: null, lastName: null, pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-7446-46f3-8533-2db398fac681", name: "DARSHAK ATULKUMAR ACHARYA", firstName: null, middleName: null, lastName: null, pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-7be1-4134-8dfa-30b711db53e1", name: "DEV SANJAYKUMAR BHUPTANI", firstName: null, middleName: null, lastName: null, pan: "yMxMPliigDtX5/toz6v+xQ==", aadhaarNumber: "5MQcIhAiN8RAsJHaUSjBQg==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-8b2e-418a-8c11-c9a4541baff4", name: "NISHI BHAVSAR", firstName: null, middleName: null, lastName: null, pan: "fS8pJqDN4tti+RyalNeN7w==", aadhaarNumber: null, address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-8e5e-4787-8538-3fbd0ef9a9e5", name: "NISHI BHAVSAR", firstName: null, middleName: null, lastName: null, pan: "fS8pJqDN4tti+RyalNeN7w==", aadhaarNumber: null, address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de8afd-b710-4ef9-8852-ce3c16f7c991", name: "NISHI BHAVSAR", firstName: null, middleName: null, lastName: null, pan: "fS8pJqDN4tti+RyalNeN7w==", aadhaarNumber: null, address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de90a0-d788-4ff6-82ce-25c363c59baf", name: "DEV SANJAYKUMAR BHUPTANI", firstName: null, middleName: null, lastName: null, pan: "yMxMPliigDtX5/toz6v+xQ==", aadhaarNumber: "5MQcIhAiN8RAsJHaUSjBQg==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de90a0-dfd7-4f41-8d66-883df7bdb523", name: "DARSHAK ATULKUMAR ACHARYA", firstName: null, middleName: null, lastName: null, pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de9956-ff7d-4dbe-88ee-0167cfd2bca4", name: "KARAN RAI", firstName: null, middleName: null, lastName: null, pan: "nH+TAIKCrJ2XFm/gjXt2kw==", aadhaarNumber: "Kn0ctiYNs+aXuSCOTZ4o/w==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de99e5-5265-4696-85d7-129fd8a235c0", name: "ASHOK SAINI", firstName: null, middleName: null, lastName: null, pan: "iJ2tPLSwpMKeMIDLJ6fxIA==", aadhaarNumber: "Lz15O4Tp2hBBAcWonFQurw==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
    ],
  },
} as unknown as IGetApplyForLoanResponse;

const submitApplyForLoanResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Application edited successfully!",
  data: null,
} as APIResponseEntity;

const submitApplicationToBankResponse = {
  status: true,
  statusCode: 200,
  message: "Data fetch Successfully",
  data: {
    packageZipUrl: "/assets/images/document_uploaded.pdf",
    loanDetails: {
      loanType: "Home Loan",
      loanTypeId: 1,
      loanAmount: 5000000,
      loanTenure: 15,
      loanPurpose: "Business expansion",
      name: "ICICI Home Finance",
      managerEmail: "dev.bhuptani@jarvistechnolabs.com",
      loanApplicationCode: "COLA260423",
    },
    applicantInfo: {
      fullName: "NEXUS NUTRI SCIENCE LIMITED",
      phoneNumber: "7UnlDe9E9Dd9xrAPlVCSAQ==",
      email: "QGbhj6TQHkSdcMwrOQjuXnJm9WgL5JmzhNFbOyF3+QA=",
      code: "COCU251003",
      id: "08de0598-4bee-48ca-8a7c-005b36583e79",
    },
    cpInfo: {
      fullName: "Jarvis Credo CP",
      phoneNumber: "DR/IXQnqfRCnSsOyS0i9gA==",
      email: "PjCsDPUr/SMcy0TJrJ1Wb5Ggye2vwjyj41h4oJMW5LQ=",
      code: "COCP241101",
      id: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    },
  },
} as unknown as ISubmitLoanApplicationToBankResponse;

export const getDemoUploadedBankDocuments = async (): Promise<any> => {
  await wait(DEMO_DELAY_MS);
  return uploadedBankDocumentsResponse;
};

export const getDemoProceedForCamReport =
  async (): Promise<IIsProceedForCamReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return proceedForCamReportResponse;
  };

export const getDemoLoanMarketplace =
  async (): Promise<ILoanMarketResponse> => {
    await wait(DEMO_DELAY_MS);
    return loanMarketplaceResponse;
  };

export const getDemoApplyForLoan =
  async (): Promise<IGetApplyForLoanResponse> => {
    await wait(DEMO_DELAY_MS);
    return applyForLoanResponse;
  };

export const getDemoSubmitApplyForLoan =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return submitApplyForLoanResponse;
  };

export const getDemoSubmitApplicationToBank =
  async (): Promise<ISubmitLoanApplicationToBankResponse> => {
    await wait(DEMO_DELAY_MS);
    return submitApplicationToBankResponse;
  };

const adminDashboardResponse = {
  status: true,
  statusCode: 200,
  message: "Admin Dashboard fetched successfully!",
  data: {
    totalCountByStatus: [
      { displayName: "Total Applications", displayOrder: 0, amount: 64935353395, noOfApplications: 544, formattedAmount: "6493.54 Cr+", statusID: 0 },
      { displayName: "Pending Applications", displayOrder: 1, amount: 13529593971, noOfApplications: 401, formattedAmount: "1352.96 Cr+", statusID: 1 },
      { displayName: "Login Applications", displayOrder: 2, amount: 11102000, noOfApplications: 7, formattedAmount: "1.11 Cr+", statusID: 2 },
      { displayName: "Query Raised Applications", displayOrder: 3, amount: 57850000, noOfApplications: 5, formattedAmount: "5.78 Cr+", statusID: 3 },
      { displayName: "Sanctioned Applications", displayOrder: 4, amount: 105930000, noOfApplications: 8, formattedAmount: "10.59 Cr+", statusID: 4 },
      { displayName: "Pending at Credit Applications", displayOrder: 5, amount: 51800000, noOfApplications: 4, formattedAmount: "5.18 Cr+", statusID: 5 },
      { displayName: "Disbursed Applications", displayOrder: 6, amount: 51177562424, noOfApplications: 117, formattedAmount: "5117.76 Cr+", statusID: 6 },
      { displayName: "Rejected Applications", displayOrder: 7, amount: 1515000, noOfApplications: 2, formattedAmount: "15.15 Lac+", statusID: 7 },
    ],
    usersInfo: [
      { name: "Total Channel Partners", count: 168, userType: 2 },
      { name: "Total Sourcing Partners", count: 28, userType: 3 },
      { name: "Total Borrowers", count: 284, userType: 4 },
    ],
    demographicsData: [
      { state: "BkFZ9XSp8OfIQZ3E6jrlAA==", noOfLoanApplications: 44 },
      { state: "dIayBu0kn5QP5At0Guk7LA==", noOfLoanApplications: 47 },
      { state: "ACqMBUzXjoW77dzATOXLvA==", noOfLoanApplications: 314 },
      { state: "pY1R+9dga/ja2YTReusQpA==", noOfLoanApplications: 59 },
      { state: "Undefined", noOfLoanApplications: 4 },
      { state: "unJUjeuCpUouuJEDOF3KDQ==", noOfLoanApplications: 6 },
      { state: "L1MWogL0x041Lf+WruCtvQ==", noOfLoanApplications: 1 },
      { state: "ahnHrK957WCTbjYP7sILOw==", noOfLoanApplications: 1 },
      { state: "QNpWMyqbgJxqgAhGIiewjw==", noOfLoanApplications: 1 },
      { state: "+Nc2SyNG7yy3LcoI/EJF8Q==", noOfLoanApplications: 4 },
      { state: "VB2GvCF0D0uzjJCEpNeylg==", noOfLoanApplications: 2 },
      { state: "AbmvO4UEcKAc+fFlnpsPFA==", noOfLoanApplications: 1 },
      { state: "+gPpI3q8pU3hV073A/r+lg==", noOfLoanApplications: 3 },
      { state: "Doxh6TtOlfyw71kRDlkoRw==", noOfLoanApplications: 2 },
      { state: "Undefined", noOfLoanApplications: 14 },
      { state: "ROGqkyzYRdFojDBmRm8NQg==", noOfLoanApplications: 5 },
      { state: "FYoYFhz5ZKpxJ0X7Pw8fHg==", noOfLoanApplications: 1 },
      { state: "z19VcZmQerqZ/vPnKMQBOw==", noOfLoanApplications: 1 },
      { state: "J9zJBmmB4zDeQF4jdERuzw==", noOfLoanApplications: 3 },
      { state: "fXBXw7uyF+PFS3l35+3h3g==", noOfLoanApplications: 3 },
      { state: "iwzMylAmEbU9PIGSimBtdg==", noOfLoanApplications: 27 },
      { state: "TtxHzQMMHTs573lliAqrqw==", noOfLoanApplications: 1 },
    ],
  },
} as IAdminDashboardResponse;

const channelPartnerListingResponse = {
  status: true,
  statusCode: 200,
  message: "List of channelpartners fetched successfully!",
  data: {
    totalCount: 168,
    channelPartnerList: [
      {
        "id": "08de994b-df47-4fdd-8d0d-f14d7695ce08",
        "name": "DARSHAK ATULKUMAR ACHARYA",
        "code": "COCP260401",
        "registeredDate": "2026-04-13T16:30:28.08216",
        "mobileNumber": "5U8wsmljtwmIsUU9juI9Yw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de8e59-4243-44fa-8d4c-dd16a1f71486",
        "name": "JITENDRAKUMAR GAMANBHAI PRAJAPATI",
        "code": "COCP260305",
        "registeredDate": "2026-03-30T18:08:34.803455",
        "mobileNumber": "tZT/xdHPZZWLbrT2tZ3rUQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 12000,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de7a8d-1789-4179-8f29-2dda0f53b883",
        "name": "NICE WAY REAL MARKETING",
        "code": "COCP260301",
        "registeredDate": "2026-03-05T13:29:13.693867",
        "mobileNumber": "En/kcUr3BHYK3p2S9kTZAQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 500,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de51c6-291b-426b-8d21-49a6d0731dcd",
        "name": "BHAVYA TIWARI",
        "code": "COCP260103",
        "registeredDate": "2026-01-12T16:04:26.812731",
        "mobileNumber": "hLbyhGDDpajNBBwEovp5fg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 18500,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de4370-6693-43da-8b77-2f012086ae70",
        "name": "HETARTH RAKESH SHAH",
        "code": "COCP251204",
        "registeredDate": "2025-12-25T10:15:16.940279",
        "mobileNumber": "zQ8sfphvImXuuUSU5aV2CA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de413f-664a-40c7-8773-c9a3bc6e1f67",
        "name": "VINOD KUMAR SEVAK",
        "code": "COCP251203",
        "registeredDate": "2025-12-22T15:19:28.805656",
        "mobileNumber": "MsPHf0XE4ZDtWYHA7tuC9g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de3c82-f6be-4625-8f75-89897aa0249d",
        "name": "MEET ASHOKKUMAR RATHI",
        "code": "COCP251202",
        "registeredDate": "2025-12-16T14:40:31.618771",
        "mobileNumber": "JfIZY099JxoBPFedlRbI0Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de30e4-97c3-4169-8d8e-b75a69d98da0",
        "name": "SHREEJI FINCORP",
        "code": "COCP251201",
        "registeredDate": "2025-12-01T19:49:08.993863",
        "mobileNumber": "RB/n+OIaVp2K8Ewjpmju7A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08de2b20-7c08-4796-8cca-0e03165b1387",
        "name": "SWATI OJHA",
        "code": "COCP251102",
        "registeredDate": "2025-11-24T11:42:45.300694",
        "mobileNumber": "qZhVPVXFYYzt4kGT48PM/g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddfcc5-b054-4b92-8d9e-6a4de6d77804",
        "name": "Yash Dhamsaniya",
        "code": "COCP250915",
        "registeredDate": "2025-09-26T11:56:55.352455",
        "mobileNumber": "B29hKKbxhpyP/RRNF2Psdw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddeb84-98d4-411c-8f38-ef956232d7e0",
        "name": "NISHITA JUNEJA",
        "code": "COCP250907",
        "registeredDate": "2025-09-04T12:58:08.871992",
        "mobileNumber": "s7E4Q3CIXsIMbpGsV4fewQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 20000,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddeb7d-df07-4f0b-8b99-88a401bb185a",
        "name": "MOHD SALIQUE ZUBAIR AHMED SHAIKH",
        "code": "COCP250906",
        "registeredDate": "2025-09-04T12:10:00.174791",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddead2-69c5-4922-81d4-a8e3dfb55202",
        "name": "Shashank Surana",
        "code": "COCP250905",
        "registeredDate": "2025-09-03T15:42:39.497184",
        "mobileNumber": "tCw5VZd3rmwpbWMIh8UhDA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddea0e-c789-4296-83dd-924091a314db",
        "name": "CHHAYA MAYUR PATEL",
        "code": "COCP250904",
        "registeredDate": "2025-09-02T16:22:15.457389",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde92d-17bb-4d48-8ee3-67aaab27e7bd",
        "name": "JANE ELIZABETH COX",
        "code": "COCP250902",
        "registeredDate": "2025-09-01T13:26:43.746383",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde913-c798-41b3-8037-6d50a49e6d30",
        "name": "REKHA RANI AGARWAL",
        "code": "COCP250901",
        "registeredDate": "2025-09-01T10:25:31.872136",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 1,
        "activeCredits": 5000,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde528-2597-47e7-8edd-91910ee26afb",
        "name": "Sanjay Bhuptani",
        "code": "COCP250819",
        "registeredDate": "2025-08-27T10:41:14.859165",
        "mobileNumber": "ZfvZSm+ohrSXS9MlEORG5g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde486-da60-4169-8585-42052d5d5c43",
        "name": "SHASHANK SURANA",
        "code": "COCP250817",
        "registeredDate": "2025-08-26T15:26:39.694918",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde473-28bd-41ad-8fd6-4d189bfe2bbe",
        "name": "NIKUNJ MAKRANI",
        "code": "COCP250816",
        "registeredDate": "2025-08-26T13:05:41.233172",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 1,
        "activeCredits": 39950,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde3d1-58b3-44fc-8897-cc87e8fa7012",
        "name": "MEGHAL BHIKHUBHAI SHAH",
        "code": "COCP250815",
        "registeredDate": "2025-08-25T17:47:23.225099",
        "mobileNumber": "qSQuA0J5H6XDp9KKPaw8mA==",
        "noOfRegisteredSP": 1,
        "activeCredits": 7828,
        "reservedCredits": 597,
        "isActive": true
      },
      {
        "id": "08dde3b9-8ba4-40d5-86b8-b11d8d6db4af",
        "name": "Sandeep Yadav ",
        "code": "COCP250814",
        "registeredDate": "2025-08-25T14:57:00.771506",
        "mobileNumber": "Bitr1ZmbuBaNJagpj6OFUQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 2200,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dde398-9bf9-471f-8f08-f30e9adaa08a",
        "name": "JIGAR BHARATKUMAR SONI",
        "code": "COCP250813",
        "registeredDate": "2025-08-25T11:01:14.782693",
        "mobileNumber": "HXzJ5X2GrtxfRDcqPSmlVA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 1902,
        "reservedCredits": 398,
        "isActive": true
      },
      {
        "id": "08dde07f-b110-4acc-8bd3-90700dd6996f",
        "name": "DEV SANJAYKUMAR BHUPTANI",
        "code": "COCP250810",
        "registeredDate": "2025-08-21T12:25:19.257579",
        "mobileNumber": "5U8wsmljtwmIsUU9juI9Yw",
        "noOfRegisteredSP": 0,
        "activeCredits": 100000,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dddf20-4c23-47d0-8b93-39247a033e8d",
        "name": "DEV SANJAYKUMAR BHUPTANI",
        "code": "COCP250809",
        "registeredDate": "2025-08-19T18:29:56.577699",
        "mobileNumber": "vO5BMExR9EM6qawgtekoVg==",
        "noOfRegisteredSP": 1,
        "activeCredits": 97657,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddd995-30f8-441c-8da1-3f6153bd379d",
        "name": "Neeraj Dixit",
        "code": "COCP250807",
        "registeredDate": "2025-08-12T17:11:35.140833",
        "mobileNumber": "/cyncIyYwO1gqUryLt0cyg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddd8cb-2536-4cb3-84af-6a6f019bd9f5",
        "name": "Neeraj Dixit",
        "code": "COCP250806",
        "registeredDate": "2025-08-11T17:05:17.078647",
        "mobileNumber": "UYnUHj3I626nMnuBk3i9vA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddd8c7-e6cc-47e0-87ef-67896b58eb4c",
        "name": "Mohit Bansal",
        "code": "COCP250805",
        "registeredDate": "2025-08-11T16:42:03.873068",
        "mobileNumber": "aK6u2qEaNBDZDxrwPy/wVA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddd587-50ed-4dc6-8b04-bd48c2900e08",
        "name": "RAHUL KUMAR PATEL",
        "code": "COCP250801",
        "registeredDate": "2025-08-07T13:22:11.151773",
        "mobileNumber": "DBBzD6Upqab7EFsiMnNhBw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 6000,
        "reservedCredits": 696,
        "isActive": true
      },
      {
        "id": "08ddcff5-bbe8-4b5f-8bb4-367d3de6edaf",
        "name": "ABHISHEK BALDWA",
        "code": "COCP250726",
        "registeredDate": "2025-07-31T11:17:28.289808",
        "mobileNumber": "TQb/VEMz4ThH5pwQA6WmYQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddcb71-8441-43fe-801b-484b9e2de063",
        "name": "MILAPBHAI ASHOKKUMAR AMBAVI",
        "code": "COCP250724",
        "registeredDate": "2025-07-25T17:20:56.706567",
        "mobileNumber": "rkni6SQUBqAkJ+pW5U7GzQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc9e8-1179-4bec-85da-d8d130755ebc",
        "name": "HARDIK ANILKUMAR RAMI",
        "code": "COCP250723",
        "registeredDate": "2025-07-23T18:24:31.923888",
        "mobileNumber": "ps170WrqdfpkwV1q723olA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc912-f222-4bed-8965-8432a7f7d5ae",
        "name": "KARAN GOPALBHAI GUPTA",
        "code": "COCP250722",
        "registeredDate": "2025-07-22T16:58:56.543559",
        "mobileNumber": "grKBXPQMiADRhqDcXYYqrw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc90f-38d2-46cd-879e-07a73246cc76",
        "name": "Igfhf",
        "code": "COCP250721",
        "registeredDate": "2025-07-22T16:32:17.148373",
        "mobileNumber": "qqeqv0X8TZp3ewrhQbaF4Bg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc908-b8ec-41a2-899a-8da5142a3823",
        "name": "DEV SANJAYKUMAR BHUPTANI",
        "code": "COCP250720",
        "registeredDate": "2025-07-22T15:45:45.587994",
        "mobileNumber": "vO5BMExR9EM6qawgtekoVg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc8d5-9a64-417f-858a-a10c4cf0afd8",
        "name": "KAMAL THAKKAR",
        "code": "COCP250717",
        "registeredDate": "2025-07-22T09:39:50.022638",
        "mobileNumber": "lKcQjwzxooP7uWZml4M1Bw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc5dd-a78a-4e2d-851a-a43a03deaea9",
        "name": "ABHISHEKKUMAR GIRISHBHAI SONI",
        "code": "COCP250716",
        "registeredDate": "2025-07-18T14:59:54.581629",
        "mobileNumber": "tXMpL8fBL6TZYdmG1hDstg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddc5c1-ab46-4a88-8b26-c5f1c2334d34",
        "name": "KENAN SATYAWADI",
        "code": "COCP250715",
        "registeredDate": "2025-07-18T11:39:34.934968",
        "mobileNumber": "a/mks9ZrmiYSj4+hyhJqXQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbedb-b89c-4f73-8e4e-bb555fe508ff",
        "name": "Tushar Vagehla",
        "code": "COCP250714",
        "registeredDate": "2025-07-09T16:58:26.083096",
        "mobileNumber": "vT6VKW8qCcry25+vqnqFPA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbec1-712e-4c27-8bb7-7fc5baae1035",
        "name": "ASHOK TEKCHAND RATHI",
        "code": "COCP250713",
        "registeredDate": "2025-07-09T13:50:19.333328",
        "mobileNumber": "SKFGKa2Xm2OTdhvvv4lluA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbeb9-f6d2-4a01-833c-309a83b07691",
        "name": "Rakesh Malviya",
        "code": "COCP250712",
        "registeredDate": "2025-07-09T12:56:47.5704",
        "mobileNumber": "aaq6LHbGoLlaeXAnUbn1eQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbeb8-285d-4291-80f7-a2ead84f6b0c",
        "name": "AKANKSHASINGH SHRISANJAYSINGH RAJPUT",
        "code": "COCP250711",
        "registeredDate": "2025-07-09T12:43:51.692905",
        "mobileNumber": "KyaK7j2WclBi/KxN6wN+/Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbde0-3c14-4c6c-8a6e-c0b08dbe1202",
        "name": "YOGESHKUMAR DEVRAMBHAI RAJGOR",
        "code": "COCP250710",
        "registeredDate": "2025-07-08T10:58:13.476946",
        "mobileNumber": "EIFSW7p+XCR7Sj/fYO9MVw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbb97-78da-4206-8558-856f1850be44",
        "name": "M A A K & ASSOCIATES",
        "code": "COCP250709",
        "registeredDate": "2025-07-05T13:12:19.849156",
        "mobileNumber": "u+7LKvzwIU0fC7257AHB3A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddbae0-17d8-4753-824d-1f4a875ac425",
        "name": "RONAK RAJENDRAKUMAR DOSHI",
        "code": "COCP250708",
        "registeredDate": "2025-07-04T15:19:39.19789",
        "mobileNumber": "YnH/KFaSSYDnbqmh096WWw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddba22-745a-4f02-81a0-136a896a6b28",
        "name": "Darshak Acharya",
        "code": "COCP250707",
        "registeredDate": "2025-07-03T16:42:10.024724",
        "mobileNumber": "5U8wsmljtwmIsUU9juI9Y",
        "noOfRegisteredSP": 0,
        "activeCredits": 2700,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddba1f-eb87-4bf5-8e6e-d6959fba2261",
        "name": "NISHI BHAVSAR",
        "code": "COCP250706",
        "registeredDate": "2025-07-03T16:24:01.47711",
        "mobileNumber": "slrxZTXKtqEqo2MkDA79xQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddba08-36b5-451a-8c8c-a052df68ddf1",
        "name": "PALLAVI KIRTIBHAI BHOJANI",
        "code": "COCP250704",
        "registeredDate": "2025-07-03T13:34:19.683505",
        "mobileNumber": "0y9Ju1AwQEKTnp+KTdIE3g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddba00-68d9-47f7-8291-c2c06d997487",
        "name": "HARSH KIRTIBHAI BHOJANI",
        "code": "COCP250703",
        "registeredDate": "2025-07-03T12:38:27.829103",
        "mobileNumber": "1ZWP43PWgaNnuSptMNjtlw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddb945-d962-420d-8f60-f9bffe54cdc0",
        "name": "PRAKASH BANGAR",
        "code": "COCP250702",
        "registeredDate": "2025-07-02T14:23:00.734782",
        "mobileNumber": "vgoZpjTTdiIlZSFCWnzMsw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddb857-3eb1-4eab-8aa1-d50ff0464916",
        "name": "PIYUSH BORISA",
        "code": "COCP250701",
        "registeredDate": "2025-07-01T09:55:00.994894",
        "mobileNumber": "uJTqnvJp4ul4BKDqb560BQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08ddafc8-e0be-4d89-85d7-0c4d9202036a",
        "name": "ANKIT V SRIVASTAVA",
        "code": "COCP250604",
        "registeredDate": "2025-06-20T12:35:45.537436",
        "mobileNumber": "aC/xo5wczlcLReqCCKjlBg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda80a-1520-4538-8de7-6dcf7a82de88",
        "name": "JAY SANJAYBHAI THAKKAR",
        "code": "COCP250603",
        "registeredDate": "2025-06-10T16:02:21.405736",
        "mobileNumber": "6/waKfWJeWLj5iXJPgC1oQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda191-d880-45e3-84a6-5f737b2389de",
        "name": "Kamal Thakkar",
        "code": "COCP250602",
        "registeredDate": "2025-06-02T10:26:33.109651",
        "mobileNumber": "UHJPRqv77ZB27Vt5gNADFg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda0ef-987c-40b7-8944-1c9f4dc5f88d",
        "name": "NIMESH RAMESHBHAI HARIYA",
        "code": "COCP250601",
        "registeredDate": "2025-06-01T15:05:07.227581",
        "mobileNumber": "jRGtmJ43nMDB6Jj2vFfXBw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda049-74b5-4fcd-8e56-73f9956a0214",
        "name": "HARSHIL SANDIPKUMAR SHAH",
        "code": "COCP250532",
        "registeredDate": "2025-05-31T19:15:50.7531",
        "mobileNumber": "xmnnE4nwYqJp+8gwqk1LHw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda011-1856-4358-8415-a7026b01154b",
        "name": "MARMIK GIRISHBHAI SHAH",
        "code": "COCP250531",
        "registeredDate": "2025-05-31T12:32:23.966832",
        "mobileNumber": "hfRPMI/8m5Sk1IM2nKB1hw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dda004-fe33-488a-84d3-45973c4cc54c",
        "name": "AARTI SHANTILAL BHANDERI",
        "code": "COCP250530",
        "registeredDate": "2025-05-31T11:05:46.147927",
        "mobileNumber": "aF0GT6OirvpLvGmHXvGiFw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9f5f-8360-4ec5-8ca4-ac82b4089b5c",
        "name": "NAMAN ANILKUMAR SHETH",
        "code": "COCP250527",
        "registeredDate": "2025-05-30T15:21:13.135487",
        "mobileNumber": "tiphzAVyq+zB/yZ8LhEctA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9f42-243c-4221-83e7-6424a4a75087",
        "name": "Bharat Dobariya",
        "code": "COCP250526",
        "registeredDate": "2025-05-30T11:50:58.105654",
        "mobileNumber": "xAZyyVIGTAJ1o+kakUoV1g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9e9d-68c7-4a0a-8f87-b27c84c261a8",
        "name": "Rushabh Shah",
        "code": "COCP250525",
        "registeredDate": "2025-05-29T16:11:46.144546",
        "mobileNumber": "DwNWdaFmjxbwi5IBsZAVPw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9de7-7cbe-49a1-83ca-c725f16159b1",
        "name": "Meet Rathi",
        "code": "COCP250524",
        "registeredDate": "2025-05-28T18:29:31.235023",
        "mobileNumber": "d2kS48olhwOxgRx0gjynbA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9c20-a285-4183-82fd-57d888f3ac51",
        "name": "Piyush Pandya",
        "code": "COCP250523",
        "registeredDate": "2025-05-26T12:13:33.597849",
        "mobileNumber": "qOf3h8Pq5e3pn3lUIqiutA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9c15-b0f1-4537-83a8-6f3bd11b6680",
        "name": "SHASHANK SINGH",
        "code": "COCP250522",
        "registeredDate": "2025-05-26T10:55:13.33213",
        "mobileNumber": "lsZpNKF4f1Evo0wL3YtpqA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9a9c-b972-4023-869b-cb6e7517a4d8",
        "name": "SUMIT SAHA",
        "code": "COCP250521",
        "registeredDate": "2025-05-24T13:56:47.322503",
        "mobileNumber": "55NPozHHsFDW3jCCgzoVFQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd991d-d60a-4c5a-8af4-6389cb8205fb",
        "name": "Reetu Chaudhary",
        "code": "COCP250520",
        "registeredDate": "2025-05-22T16:15:58.060942",
        "mobileNumber": "skXHmcK4HqKXfpStI7Yb6A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd991d-cf4b-477d-85ed-c13fa2889f7f",
        "name": "Shrey Sheth",
        "code": "COCP250519",
        "registeredDate": "2025-05-22T16:15:46.740856",
        "mobileNumber": "HkiRnxqPeZp3ezM/k3FOaA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd991d-cc6a-4ab7-8e10-68a33234870b",
        "name": "Harsh Gohil",
        "code": "COCP250518",
        "registeredDate": "2025-05-22T16:15:41.912193",
        "mobileNumber": "J60RbyyYCfXVsEfErVGkoQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd991d-ca80-418c-8b47-9541777fef85",
        "name": "GOPALKUMAR ALPESHBHAI KHORASIYA",
        "code": "COCP250517",
        "registeredDate": "2025-05-22T16:15:38.697146",
        "mobileNumber": "M/VNVX/4jiSJtfXbgWhETg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 12000,
        "reservedCredits": 99,
        "isActive": true
      },
      {
        "id": "08dd991d-c06d-4814-84f5-af9c8593c498",
        "name": "Ritu Vaishnav",
        "code": "COCP250516",
        "registeredDate": "2025-05-22T16:15:21.797789",
        "mobileNumber": "XqrbDKOtOc345TBiwZ2CFg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd991d-bf39-49a5-85f0-d8f981cfc6bc",
        "name": "TUSHAR MUKESHBHAI VAGHELA",
        "code": "COCP250515",
        "registeredDate": "2025-05-22T16:15:19.776832",
        "mobileNumber": "K/pn9VCzJR/ARSuwUSVmyw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9754-ea81-450d-8477-b03939f6815b",
        "name": "SHREYESH SONI",
        "code": "COCP250514",
        "registeredDate": "2025-05-20T09:45:12.386787",
        "mobileNumber": "C5Vib1LKCU9NzlqXYsi2Lg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9754-9e84-433b-8977-463910bb017d",
        "name": "AAREN INTPRO",
        "code": "COCP250513",
        "registeredDate": "2025-05-20T09:43:04.898798",
        "mobileNumber": "5mSamB7qvNp+13U4biaDCg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd93a9-865f-4917-8ac9-6bff15d483c0",
        "name": "Moxesh Shah",
        "code": "COCP250511",
        "registeredDate": "2025-05-15T17:40:46.961388",
        "mobileNumber": "HMuT1gzK6t4kmUNVDJC9qw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9151-31b8-4342-876b-ce0b4b35e372",
        "name": "NISHI BHAVSAR",
        "code": "COCP250510",
        "registeredDate": "2025-05-12T18:03:26.901187",
        "mobileNumber": "yMCDKYEplqdNuC4djsrzUw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9122-f4c0-4096-858c-286084492fee",
        "name": "BIJAL HASMUKHBHAI KORADIYA",
        "code": "COCP250509",
        "registeredDate": "2025-05-12T12:32:27.752425",
        "mobileNumber": "vfRTpVRMM/r8jGww/KRgrA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd9122-4dff-4de7-8747-52eba6f462c0",
        "name": "MEET ASHOKKUMAR RATHI",
        "code": "COCP250508",
        "registeredDate": "2025-05-12T12:27:48.000564",
        "mobileNumber": "UT+rSk/EUf2ppp22c4aACA==",
        "noOfRegisteredSP": 1,
        "activeCredits": 12000,
        "reservedCredits": 1592,
        "isActive": true
      },
      {
        "id": "08dd8ebc-da6d-4560-87b7-a7e103d905c8",
        "name": "INS Arihant",
        "code": "COCP250505",
        "registeredDate": "2025-05-09T11:16:32.602495",
        "mobileNumber": "/D/jMxrrCQMmCovvbZPAnA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8e0c-bab1-47e6-819f-7342ccd2f82d",
        "name": "Logi Headphone 2",
        "code": "COCP250504",
        "registeredDate": "2025-05-08T14:15:47.932312",
        "mobileNumber": "3EpKaXArowdR6v0EsGLXKw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8e00-b45a-4ed7-85f4-522bb32372a7",
        "name": "KHAN ZAFAR ZUBER AHMED",
        "code": "COCP250502",
        "registeredDate": "2025-05-08T12:49:43.347906",
        "mobileNumber": "io0feSuxOBsbs0YrnzkOFQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8de9-02f7-43a8-8322-1c4f98b76aee",
        "name": "MARUTHACHALAM MAHESWARI",
        "code": "COCP250501",
        "registeredDate": "2025-05-08T10:00:07.310806",
        "mobileNumber": "PBcZ3Kk3sFBe9h7Zi+fWHw==",
        "noOfRegisteredSP": 2,
        "activeCredits": 12000,
        "reservedCredits": 795,
        "isActive": true
      },
      {
        "id": "08dd83b3-8c94-4d41-8d77-5883c2a414df",
        "name": "KEF HOSPITALITY INDIA PRIVATE LIMITED",
        "code": "COCP250409",
        "registeredDate": "2025-04-25T10:12:13.741739",
        "mobileNumber": "HV5FiqsnVIrtU82SHmdw+w==",
        "noOfRegisteredSP": 2,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8331-62df-4c81-8147-905c48a58d39",
        "name": "CP",
        "code": "COCP250408",
        "registeredDate": "2025-04-24T18:40:29.182955",
        "mobileNumber": "0StYI7CuhYkKSAbrJsBAaQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8324-20bc-478a-8b16-7875b4235567",
        "name": "ChannelPartner",
        "code": "COCP250407",
        "registeredDate": "2025-04-24T17:05:34.774314",
        "mobileNumber": "5CNo5cyh2eSP8sRHvDWlNg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd82fe-9a2f-4a5a-88e9-1e8b1b72773d",
        "name": "MAULIK GIRISH SHAREDALAL",
        "code": "COCP250406",
        "registeredDate": "2025-04-24T12:36:57.655966",
        "mobileNumber": "Gtgl2Ekqkw2N+X5LuI853A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd8194-b28b-450e-88fd-537e187580e5",
        "name": "Priyank",
        "code": "COCP250405",
        "registeredDate": "2025-04-22T17:26:20.706988",
        "mobileNumber": "Cs4c+0/0I7BA5ywBlLOJPw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd7daa-1d24-4f78-8b11-b0e405a72497",
        "name": "BHAVYA  TIWARI",
        "code": "COCP250403",
        "registeredDate": "2025-04-17T17:49:34.326794",
        "mobileNumber": "ayd9FPvdJnogRJbULyE1JQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd75c3-c823-4ae0-8469-106632868a54",
        "name": "DEV SANJAYKUMAR BHUPTANI",
        "code": "COCP250402",
        "registeredDate": "2025-04-07T16:33:09.322421",
        "mobileNumber": "91KEQZdzO+bkOm6zYZ3JWg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd7272-edf7-4cc6-8a00-6d1f1ed44abb",
        "name": "Meghal Shah",
        "code": "COCP250401",
        "registeredDate": "2025-04-03T11:16:50.075339",
        "mobileNumber": "BLOeYI5aru8vAaX/M8eqRA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd703c-e40e-4c09-8611-1d415d22ba08",
        "name": "Devid",
        "code": "COCP250313",
        "registeredDate": "2025-03-31T15:44:58.297437",
        "mobileNumber": "tIxBvJXWmJSxEBFoFrZVvw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd66bc-53f6-4c9f-8c6f-e165f942b864",
        "name": "VISHAL PARASHAR",
        "code": "COCP250312",
        "registeredDate": "2025-03-19T13:32:00.504452",
        "mobileNumber": "hhFdxRrGeuUfy1gsUs+8nw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd6609-670d-46d5-89c1-1f0b374c5c5d",
        "name": "MSACA BIZZSOLVE LLP",
        "code": "COCP250311",
        "registeredDate": "2025-03-18T16:11:12.611083",
        "mobileNumber": "5D9rxg7pqM2x2MaJHs70MA==",
        "noOfRegisteredSP": 2,
        "activeCredits": 1000,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd6218-47a1-43ee-804e-aba9b683718d",
        "name": "MSACA BIZZSOLVE LLP",
        "code": "COCP250310",
        "registeredDate": "2025-03-13T15:47:37.686462",
        "mobileNumber": "g3yhC94GqkN/1nyB0ekp9A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd6206-2750-4208-843f-8ede06f6ddc9",
        "name": "MEGHAL SHAH & ASSOCIATES",
        "code": "COCP250309",
        "registeredDate": "2025-03-13T13:37:52.526592",
        "mobileNumber": "BZd7SWab7Dc7+FXNtvJVBw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd5b1c-929f-4857-8f55-40eaec0e26c5",
        "name": "Viarat",
        "code": "COCP250307",
        "registeredDate": "2025-03-04T18:30:43.356976",
        "mobileNumber": "NIWClwT8Pdd+GwmwkMzIfg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd5b1a-b38a-479a-8e72-e34bebad6056",
        "name": "demo",
        "code": "COCP250305",
        "registeredDate": "2025-03-04T18:17:19.595067",
        "mobileNumber": "2A+NqB87Lgow+XYOXwPK9A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd5b18-0c07-4865-83d2-f2375f5df3a5",
        "name": "DEV SANJAYKUMAR BHUPTANI",
        "code": "COCP250304",
        "registeredDate": "2025-03-04T17:58:19.543902",
        "mobileNumber": "sLIxE8OOp/0+OMiWdwXrKw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd5a42-bf0d-4b17-857a-56324a7b9bfb",
        "name": "New CP with Roles",
        "code": "COCP250301",
        "registeredDate": "2025-03-03T16:31:27.61221",
        "mobileNumber": "nn+h2yDg5u3FFqwf7QLayw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd5594-419b-4bac-8135-96f1da8e46bf",
        "name": "Dhrumit ",
        "code": "COCP250203",
        "registeredDate": "2025-02-25T17:32:20.065667",
        "mobileNumber": "g3yhC94GqkN/1nyB0ekp9A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd556e-bb42-43be-8ee6-3e0784a9521d",
        "name": "Nishita Juneja",
        "code": "COCP250202",
        "registeredDate": "2025-02-25T13:03:43.290319",
        "mobileNumber": "rk3UyAfZNv2uOKYttQ4OIg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd54d5-1161-4759-8506-af2413df2c33",
        "name": "Nemil Shah",
        "code": "COCP250201",
        "registeredDate": "2025-02-24T18:43:45.281172",
        "mobileNumber": "8aZqJVt+P37YrTmvnCwkFw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd41cf-38ff-44d4-8e52-f202659248bc",
        "name": "Devil Bhuptani",
        "code": "COCP250108",
        "registeredDate": "2025-01-31T13:44:02.674709",
        "mobileNumber": "EMguGaDPpEWJrBaa3yIQrw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd3b75-f3c2-4bec-8a88-b267131b3ca7",
        "name": "dwsf",
        "code": "COCP250106",
        "registeredDate": "2025-01-23T11:49:54.328266",
        "mobileNumber": "vwr1bh8g0orQKfEHxdE1sA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd3ae6-d9d6-4564-890f-f59833b35660",
        "name": "Good Vibes",
        "code": "COCP250105",
        "registeredDate": "2025-01-22T18:45:32.804185",
        "mobileNumber": "3zQ/GF3y6E8JTkCt8nn2lw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd3ae5-b8f6-48f7-8d87-c4852ba037cb",
        "name": "Samsung",
        "code": "COCP250104",
        "registeredDate": "2025-01-22T18:37:09.644168",
        "mobileNumber": "M7MTd2F8gZG48wSV13+EOg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd33a2-ad8c-46ee-8280-9bead03fa89d",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP25013",
        "registeredDate": "2025-01-13T12:49:54.585819",
        "mobileNumber": "kBBSccLuZEgixlf3lm/E/Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2b13-2e73-4b18-8270-e18836738b35",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP25012",
        "registeredDate": "2025-01-02T15:22:34.01846",
        "mobileNumber": "9qDsHV8dKG6q6GaKcneVwQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2b10-55b5-42ee-8224-e19a60e55382",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP25011",
        "registeredDate": "2025-01-02T15:02:11.387056",
        "mobileNumber": "pGOH7PuPFvP3/RemzI8ryA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "4a15970b-3b8a-4ce8-bb44-f9db899d7dba",
        "name": "CredOrbitCP",
        "code": "COCP24091",
        "registeredDate": "2024-12-30T23:13:26",
        "mobileNumber": "DR/IXQnqfRCnSsOyS0i9gA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 500,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd28cf-4d70-4849-8efd-c8e385cdf013",
        "name": "Pushpa",
        "code": "COCP241248",
        "registeredDate": "2024-12-30T18:11:37.901642",
        "mobileNumber": "UpT1KQYTN51XME4Yw5f3tQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd28cb-48c2-4120-8921-bca452d5518a",
        "name": "udggu",
        "code": "COCP241247",
        "registeredDate": "2024-12-30T17:42:52.05997",
        "mobileNumber": "HHf7GpzIApVn3ybM3H8lRQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd289f-d47a-402d-8de4-c4f6a019b25c",
        "name": "dyhb",
        "code": "COCP241246",
        "registeredDate": "2024-12-30T12:31:48.612174",
        "mobileNumber": "REZFvByCgkf8hnJwm1LGVw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2655-2d71-4d67-8f99-21a80ac07c55",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241245",
        "registeredDate": "2024-12-27T14:32:23.298035",
        "mobileNumber": "y89t3uIRVXEwjI0n2SSsOA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd25b0-2d67-4413-8d5b-4ddcb33c2ee8",
        "name": "dgfdggfd",
        "code": "COCP241244",
        "registeredDate": "2024-12-26T18:51:16.266128",
        "mobileNumber": "dRELuGBxy5jt1kbscbNSnw==",
        "noOfRegisteredSP": 1,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd25aa-5983-4dae-8895-410dc2176ed5",
        "name": "hefgu",
        "code": "COCP241243",
        "registeredDate": "2024-12-26T18:09:33.29405",
        "mobileNumber": "XI7Dr/2wn071+15NXLsSkw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd25a4-4829-432e-8bd5-9db220984d1e",
        "name": "Dora",
        "code": "COCP241242",
        "registeredDate": "2024-12-26T17:26:07.197146",
        "mobileNumber": "uUjsc8J+hBXhBQwFNjMb8Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2596-99f9-43e6-8b7b-d62ab50b29a2",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241241",
        "registeredDate": "2024-12-26T15:48:11.504269",
        "mobileNumber": "XcoJ7NpKYeomY/WiU8tpgQ==",
        "noOfRegisteredSP": 1,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2418-4db9-4249-8876-2f3dd4e5fada",
        "name": "grefger",
        "code": "COCP241240",
        "registeredDate": "2024-12-24T18:11:35.827179",
        "mobileNumber": "lC5IwSDGRJNKhPhdl0Un0g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd240f-e7c4-493d-8d47-5e2659176759",
        "name": "tfdgrefg",
        "code": "COCP241239",
        "registeredDate": "2024-12-24T17:11:28.800562",
        "mobileNumber": "FIExIh/5ReamgB48YmFgPg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd240e-8684-4ef0-858e-188717d90478",
        "name": "dbusnj",
        "code": "COCP241238",
        "registeredDate": "2024-12-24T17:01:36.14483",
        "mobileNumber": "i/RtGZ4NwvuLzusIk4XEiA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2357-a6a4-4edd-87e4-3628829ca0f0",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241237",
        "registeredDate": "2024-12-23T19:12:32.139419",
        "mobileNumber": "OkeN2lzlPExKEBoILKuuMQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2323-985f-46b6-849d-cbc867e3e7bc",
        "name": "ferddfg",
        "code": "COCP241231",
        "registeredDate": "2024-12-23T12:59:54.354641",
        "mobileNumber": "XC4e8e/C4f1MygtkLTf9Ng==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd20bf-12c4-4f98-8f6b-77254fc86b3e",
        "name": "TestCP1",
        "code": "COCP241230",
        "registeredDate": "2024-12-20T11:55:18.210992",
        "mobileNumber": "XwVyOwFM0Mmp7E/86MobQw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2033-6e43-4234-81f0-fff0783719c7",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241229",
        "registeredDate": "2024-12-19T19:15:42.179255",
        "mobileNumber": "FKA1B8O47ECTtcaT6yGNyg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2033-497e-4532-84a3-14cfd4179756",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241228",
        "registeredDate": "2024-12-19T19:14:40.491399",
        "mobileNumber": "FrT4NKsC4rWsftilN8FY0w==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2032-4195-4cf9-8981-c011f6647838",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241227",
        "registeredDate": "2024-12-19T19:07:17.726846",
        "mobileNumber": "TYuIOnR2g/XT05Uf61b5eQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd2030-2013-47a6-86c7-488b6886e142",
        "name": "dkjfvafv",
        "code": "COCP241226",
        "registeredDate": "2024-12-19T18:52:02.510332",
        "mobileNumber": "AXvg0YyxN/C+UxUakbVsgg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd201b-c073-4fbd-87f7-64d4d7a5ba9e",
        "name": "ferdsfe",
        "code": "COCP241225",
        "registeredDate": "2024-12-19T16:26:12.148016",
        "mobileNumber": "keTFLeGyHQ6ZfQVmoCKj5w==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f2b-1af6-4606-816b-09c85b83b32e",
        "name": "Remote Controller",
        "code": "COCP241224",
        "registeredDate": "2024-12-18T11:43:35.285552",
        "mobileNumber": "ldw+jcYrsuL69/Kr7g5sSw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f27-2b57-41f0-8f4e-42ce89bda637",
        "name": "KK",
        "code": "COCP241223",
        "registeredDate": "2024-12-18T11:15:24.776556",
        "mobileNumber": "ZSZzol2RoEYIZSa1RqriMQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f25-4774-440d-8f8f-aa56c9b3aee1",
        "name": "Vilen",
        "code": "COCP241222",
        "registeredDate": "2024-12-18T11:01:52.950312",
        "mobileNumber": "OwN04MBhLorKIuD+AJjenA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f25-0317-48e7-8b3b-56a449f6cb03",
        "name": "Arijit Singh",
        "code": "COCP241221",
        "registeredDate": "2024-12-18T10:59:58.257897",
        "mobileNumber": "MEdL9ir0nNrxcEUVS70scg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f23-27de-485d-8fcb-63d62f1e4545",
        "name": "Anuv Jain",
        "code": "COCP241220",
        "registeredDate": "2024-12-18T10:46:40.964291",
        "mobileNumber": "AUBNXR2wqQiqTjqd8NyooQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f22-92dc-46c9-80a8-887d642a9f73",
        "name": "Ram Yadav",
        "code": "COCP241219",
        "registeredDate": "2024-12-18T10:42:30.971484",
        "mobileNumber": "UtGWJEm2SKH8Ej11BTeSkQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f21-cd32-4a76-8cef-318be2362dc4",
        "name": "Varun Mayya",
        "code": "COCP241218",
        "registeredDate": "2024-12-18T10:36:59.347803",
        "mobileNumber": "+6qcRnshl+KG8HU9w7f3hA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f1e-618f-48f3-8243-92209499c4d5",
        "name": "Lala",
        "code": "COCP241217",
        "registeredDate": "2024-12-18T10:12:30.273107",
        "mobileNumber": "iy3wq9ae3pgSRhz2fYVdRw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f1d-c347-425f-8d77-38dca917fbe8",
        "name": "Rishabh Jain",
        "code": "COCP241216",
        "registeredDate": "2024-12-18T10:08:04.717897",
        "mobileNumber": "m0o7Fky1s3Z4Za5r729c5A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1f1d-3d19-4f7c-8fef-e0ba2026bfc3",
        "name": "Ratan Tata",
        "code": "COCP241215",
        "registeredDate": "2024-12-18T10:04:19.607613",
        "mobileNumber": "CgBVSUOypJ688civZgJcuQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1ea7-82b1-4448-8dc6-68f36555ca88",
        "name": "Inventory",
        "code": "COCP241214",
        "registeredDate": "2024-12-17T20:01:35.747866",
        "mobileNumber": "fbb0PqgpX140W/q+jd0wUg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1ea5-4d6b-4b7e-8921-19b36dd53170",
        "name": "babulal",
        "code": "COCP241213",
        "registeredDate": "2024-12-17T19:45:47.379646",
        "mobileNumber": "vbdpqqBu5jcmNqRyPb7ClQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1e9f-984b-4ee7-8f47-8db5cc6e6724",
        "name": "fgbghsdfju",
        "code": "COCP241212",
        "registeredDate": "2024-12-17T19:04:56.020025",
        "mobileNumber": "4TpsxGBBIw2sBnCmf68uPg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1b4d-adc2-461f-8ea8-06ca27f253c5",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241211",
        "registeredDate": "2024-12-13T13:40:59.809817",
        "mobileNumber": "HSKTYuX05paZEzanC0T8FQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1b3c-5242-4470-80f9-749dde6ff0f9",
        "name": "fgjkvngud",
        "code": "COCP241210",
        "registeredDate": "2024-12-13T11:36:44.854001",
        "mobileNumber": "a60Kh9RTM/wk8zXLYhmMoA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1b3a-c91d-476f-8913-be4bb633ecc7",
        "name": "fgbgoifhdin",
        "code": "COCP24129",
        "registeredDate": "2024-12-13T11:25:45.265094",
        "mobileNumber": "JweyrdFS9yctZ12CiF4orw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1a81-99ae-45c4-8ec3-5ce8b0a13295",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP24128",
        "registeredDate": "2024-12-12T13:20:08.792159",
        "mobileNumber": "ZTrfPzu49EIXZhmdKIYlvg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1a76-6212-4dbd-81c9-08c1237b18ce",
        "name": "Devil Dev",
        "code": "COCP24127",
        "registeredDate": "2024-12-12T11:59:51.034297",
        "mobileNumber": "5bMgoKxSv3ihWtYzpK16Fg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1a76-287d-415d-8eb9-42b0770202ab",
        "name": "Doraemon",
        "code": "COCP24126",
        "registeredDate": "2024-12-12T11:58:14.420263",
        "mobileNumber": "Gj29h56Ae4ReERPbBhSb3w==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1a71-a23f-44d2-81ff-d06a6e80264f",
        "name": "Dev Shah",
        "code": "COCP24125",
        "registeredDate": "2024-12-12T11:25:51.216049",
        "mobileNumber": "zb4QQ76EetwVs8ztCRbhyQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1a71-a228-4590-887d-39d5037ffdce",
        "name": "Works Fine",
        "code": "COCP24124",
        "registeredDate": "2024-12-12T11:25:51.063786",
        "mobileNumber": "/50319NQOiqNbu0jON2QlA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd19dd-ba1d-48c0-8e1f-2627f1d4e1f2",
        "name": "Dev CP test",
        "code": "COCP24123",
        "registeredDate": "2024-12-11T17:47:05.741237",
        "mobileNumber": "DR/IXQnqfRCnSsOyS0i9gA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd19a4-592d-4bb1-86ba-b60766c85d60",
        "name": "Dr HATHI",
        "code": "COCP24122",
        "registeredDate": "2024-12-11T10:56:21.795397",
        "mobileNumber": "BcJf1hkTi2OzgbayIADFQg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd185c-7be0-4cc9-8c1d-ece8364fa5de",
        "name": "Bill Gates",
        "code": "COCP24121",
        "registeredDate": "2024-12-10T01:19:25.081982",
        "mobileNumber": "8MQxYb/JFH4+kccGKgXHKA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd138d-b987-44d9-8094-0c8819c1e039",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241068",
        "registeredDate": "2024-12-03T16:59:18.044665",
        "mobileNumber": "YMwPLxyt7VgotIeB1GOW+A==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd135d-fe56-4a30-8d3e-5e8acbe87a0e",
        "name": "Dev",
        "code": "COCP241066",
        "registeredDate": "2024-12-03T16:47:37.634788",
        "mobileNumber": "1xI0K0TYshP/oisawWXQQg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1388-de50-4a45-83b4-83d3c934dfd4",
        "name": "Devil",
        "code": "COCP241019",
        "registeredDate": "2024-12-03T16:24:32.278364",
        "mobileNumber": "7B9RgTCcufaAkf9mUxcS7Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd1388-9d00-47df-8621-faa63d81014e",
        "name": "Dev CP",
        "code": "COCP240962",
        "registeredDate": "2024-12-03T16:22:42.693084",
        "mobileNumber": "SF1kUD7DtUoD1tO7YGtrhQ==",
        "noOfRegisteredSP": 2,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0fb0-71a1-4e03-8aaa-dea0730bb80b",
        "name": "dfgdfgj",
        "code": "COCP241067",
        "registeredDate": "2024-11-28T18:57:45.144208",
        "mobileNumber": "89b4Ubo49h1f6BtYz2WfLg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0ddb-f149-470a-89cc-2dccfd56b898",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241032",
        "registeredDate": "2024-11-26T11:04:05.359006",
        "mobileNumber": "EjFIX6UMNgoIrc+kIoGMqw==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0d3e-e7e7-4880-8a87-69eb93d05a40",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241083",
        "registeredDate": "2024-11-25T16:19:58.631428",
        "mobileNumber": "ZTrfPzu49EIXZhmdKIYlvg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0d32-1537-403f-889d-d58f4b8ed9a1",
        "name": "fghgfh",
        "code": "COCP241011",
        "registeredDate": "2024-11-25T14:48:11.185661",
        "mobileNumber": "L9E+1olRyOsEQLawCqAp3Q==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0d1c-9510-4d1b-85ad-2350c6c167c8",
        "name": "bnifgnifgdikn",
        "code": "COCP241089",
        "registeredDate": "2024-11-25T12:14:16.763079",
        "mobileNumber": "jVb5Mnuf1l02kVXvW5pn2w==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0d1a-8584-4e86-8943-6227f7f8c729",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241093",
        "registeredDate": "2024-11-25T11:59:31.686828",
        "mobileNumber": "ZooxVLY32YpZf2dipcFMcg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0abc-63a8-4b65-8eab-bfaba0cf0ef5",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241015",
        "registeredDate": "2024-11-22T11:40:39.860838",
        "mobileNumber": "N9nfTpSUcUzgy79UopCKkg==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0abc-19fa-4e2a-8d8a-bbba5c57cdc0",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241068",
        "registeredDate": "2024-11-22T11:38:36.247981",
        "mobileNumber": "HT0N5SibwF4fr9FtGAsLTQ==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0abb-9443-46a9-83e1-407c8c3f9ed8",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241023",
        "registeredDate": "2024-11-22T11:34:51.908609",
        "mobileNumber": "6N0FY/HtklHP+mGUIwLg3g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0abb-3722-4202-8266-bc750eb92f05",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241092",
        "registeredDate": "2024-11-22T11:32:15.662304",
        "mobileNumber": "kRe8kUWhsecjOP1FPOpyIA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0aba-dfff-4e8c-8f84-2a0eb83b8efe",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241056",
        "registeredDate": "2024-11-22T11:29:49.476286",
        "mobileNumber": "HWdLs7pDwbGgdTipiymJ9g==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "08dd0ab9-853b-44ca-8a0b-6a0708ed852a",
        "name": "MEGHAL SHAH NEW & ASSOCIATES",
        "code": "COCP241094",
        "registeredDate": "2024-11-22T11:20:07.691127",
        "mobileNumber": "aib2JyYmsweVczEplXYDgA==",
        "noOfRegisteredSP": 0,
        "activeCredits": 0,
        "reservedCredits": 0,
        "isActive": true
      },
      {
        "id": "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
        "name": "Jarvis Credo CP",
        "code": "COCP241101",
        "registeredDate": "2024-10-28T16:54:09",
        "mobileNumber": "DR/IXQnqfRCnSsOyS0i9gA==",
        "noOfRegisteredSP": 12,
        "activeCredits": 2190270,
        "reservedCredits": 99,
        "isActive": true
      }
    ],
  },
} as unknown as IChannelPartnerResponse;

const adminChannelPartnerReportResponse = {
  status: true,
  statusCode: 200,
  message: "Channel partner report fetched successfully!",
  data: {
    channelPartnersQueue: [
      {
        "cpID": "08de994b-df47-4fdd-8d0d-f14d7695ce08",
        "cpCode": "COCP260401",
        "cpName": "DARSHAK ATULKUMAR ACHARYA",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de8e59-4243-44fa-8d4c-dd16a1f71486",
        "cpCode": "COCP260305",
        "cpName": "JITENDRAKUMAR GAMANBHAI PRAJAPATI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de7a8d-1789-4179-8f29-2dda0f53b883",
        "cpCode": "COCP260301",
        "cpName": "NICE WAY REAL MARKETING",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de51c6-291b-426b-8d21-49a6d0731dcd",
        "cpCode": "COCP260103",
        "cpName": "BHAVYA TIWARI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de4370-6693-43da-8b77-2f012086ae70",
        "cpCode": "COCP251204",
        "cpName": "HETARTH RAKESH SHAH",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de413f-664a-40c7-8773-c9a3bc6e1f67",
        "cpCode": "COCP251203",
        "cpName": "VINOD KUMAR SEVAK",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de3c82-f6be-4625-8f75-89897aa0249d",
        "cpCode": "COCP251202",
        "cpName": "MEET ASHOKKUMAR RATHI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08de30e4-97c3-4169-8d8e-b75a69d98da0",
        "cpCode": "COCP251201",
        "cpName": "SHREEJI FINCORP",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 5000000.0000000000000000000000
      },
      {
        "cpID": "08de2b20-7c08-4796-8cca-0e03165b1387",
        "cpCode": "COCP251102",
        "cpName": "SWATI OJHA",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddfcc5-b054-4b92-8d9e-6a4de6d77804",
        "cpCode": "COCP250915",
        "cpName": "Yash Dhamsaniya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddeb84-98d4-411c-8f38-ef956232d7e0",
        "cpCode": "COCP250907",
        "cpName": "NISHITA JUNEJA",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 2,
        "totalAmount": 10200000.000000000000000000000
      },
      {
        "cpID": "08ddeb7d-df07-4f0b-8b99-88a401bb185a",
        "cpCode": "COCP250906",
        "cpName": "MOHD SALIQUE ZUBAIR AHMED SHAIKH",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddead2-69c5-4922-81d4-a8e3dfb55202",
        "cpCode": "COCP250905",
        "cpName": "Shashank Surana",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddea0e-c789-4296-83dd-924091a314db",
        "cpCode": "COCP250904",
        "cpName": "CHHAYA MAYUR PATEL",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dde92d-17bb-4d48-8ee3-67aaab27e7bd",
        "cpCode": "COCP250902",
        "cpName": "JANE ELIZABETH COX",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dde913-c798-41b3-8037-6d50a49e6d30",
        "cpCode": "COCP250901",
        "cpName": "REKHA RANI AGARWAL",
        "spCount": 1,
        "clientsCount": 4,
        "totalLoan": 7,
        "totalAmount": 15000000.000000000000000000000
      },
      {
        "cpID": "08dde528-2597-47e7-8edd-91910ee26afb",
        "cpCode": "COCP250819",
        "cpName": "Sanjay Bhuptani",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dde486-da60-4169-8585-42052d5d5c43",
        "cpCode": "COCP250817",
        "cpName": "SHASHANK SURANA",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dde473-28bd-41ad-8fd6-4d189bfe2bbe",
        "cpCode": "COCP250816",
        "cpName": "NIKUNJ MAKRANI",
        "spCount": 1,
        "clientsCount": 4,
        "totalLoan": 1,
        "totalAmount": 2200000.0000000000000000000000
      },
      {
        "cpID": "08dde3d1-58b3-44fc-8897-cc87e8fa7012",
        "cpCode": "COCP250815",
        "cpName": "MEGHAL BHIKHUBHAI SHAH",
        "spCount": 1,
        "clientsCount": 14,
        "totalLoan": 28,
        "totalAmount": 479500000.00000000000000000000
      },
      {
        "cpID": "08dde3b9-8ba4-40d5-86b8-b11d8d6db4af",
        "cpCode": "COCP250814",
        "cpName": "Sandeep Yadav ",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dde398-9bf9-471f-8f08-f30e9adaa08a",
        "cpCode": "COCP250813",
        "cpName": "JIGAR BHARATKUMAR SONI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 10000000.000000000000000000000
      },
      {
        "cpID": "08dde07f-b110-4acc-8bd3-90700dd6996f",
        "cpCode": "COCP250810",
        "cpName": "DEV SANJAYKUMAR BHUPTANI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dddf20-4c23-47d0-8b93-39247a033e8d",
        "cpCode": "COCP250809",
        "cpName": "DEV SANJAYKUMAR BHUPTANI",
        "spCount": 1,
        "clientsCount": 3,
        "totalLoan": 12,
        "totalAmount": 19150000.000000000000000000000
      },
      {
        "cpID": "08ddd995-30f8-441c-8da1-3f6153bd379d",
        "cpCode": "COCP250807",
        "cpName": "Neeraj Dixit",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddd8cb-2536-4cb3-84af-6a6f019bd9f5",
        "cpCode": "COCP250806",
        "cpName": "Neeraj Dixit",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddd8c7-e6cc-47e0-87ef-67896b58eb4c",
        "cpCode": "COCP250805",
        "cpName": "Mohit Bansal",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddd587-50ed-4dc6-8b04-bd48c2900e08",
        "cpCode": "COCP250801",
        "cpName": "RAHUL KUMAR PATEL",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 20000000.000000000000000000000
      },
      {
        "cpID": "08ddcff5-bbe8-4b5f-8bb4-367d3de6edaf",
        "cpCode": "COCP250726",
        "cpName": "ABHISHEK BALDWA",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddcb71-8441-43fe-801b-484b9e2de063",
        "cpCode": "COCP250724",
        "cpName": "MILAPBHAI ASHOKKUMAR AMBAVI",
        "spCount": 0,
        "clientsCount": 3,
        "totalLoan": 2,
        "totalAmount": 4000000.0000000000000000000000
      },
      {
        "cpID": "08ddc9e8-1179-4bec-85da-d8d130755ebc",
        "cpCode": "COCP250723",
        "cpName": "HARDIK ANILKUMAR RAMI",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 2,
        "totalAmount": 4000000.0000000000000000000000
      },
      {
        "cpID": "08ddc912-f222-4bed-8965-8432a7f7d5ae",
        "cpCode": "COCP250722",
        "cpName": "KARAN GOPALBHAI GUPTA",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 3,
        "totalAmount": 6000000.0000000000000000000000
      },
      {
        "cpID": "08ddc90f-38d2-46cd-879e-07a73246cc76",
        "cpCode": "COCP250721",
        "cpName": "Igfhf",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddc908-b8ec-41a2-899a-8da5142a3823",
        "cpCode": "COCP250720",
        "cpName": "DEV SANJAYKUMAR BHUPTANI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddc8d5-9a64-417f-858a-a10c4cf0afd8",
        "cpCode": "COCP250717",
        "cpName": "KAMAL THAKKAR",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 1,
        "totalAmount": 5000000.0000000000000000000000
      },
      {
        "cpID": "08ddc5dd-a78a-4e2d-851a-a43a03deaea9",
        "cpCode": "COCP250716",
        "cpName": "ABHISHEKKUMAR GIRISHBHAI SONI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddc5c1-ab46-4a88-8b26-c5f1c2334d34",
        "cpCode": "COCP250715",
        "cpName": "KENAN SATYAWADI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 1000000.0000000000000000000000
      },
      {
        "cpID": "08ddbedb-b89c-4f73-8e4e-bb555fe508ff",
        "cpCode": "COCP250714",
        "cpName": "Tushar Vagehla",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddbec1-712e-4c27-8bb7-7fc5baae1035",
        "cpCode": "COCP250713",
        "cpName": "ASHOK TEKCHAND RATHI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddbeb9-f6d2-4a01-833c-309a83b07691",
        "cpCode": "COCP250712",
        "cpName": "Rakesh Malviya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddbeb8-285d-4291-80f7-a2ead84f6b0c",
        "cpCode": "COCP250711",
        "cpName": "AKANKSHASINGH SHRISANJAYSINGH RAJPUT",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 2000000.0000000000000000000000
      },
      {
        "cpID": "08ddbde0-3c14-4c6c-8a6e-c0b08dbe1202",
        "cpCode": "COCP250710",
        "cpName": "YOGESHKUMAR DEVRAMBHAI RAJGOR",
        "spCount": 0,
        "clientsCount": 4,
        "totalLoan": 4,
        "totalAmount": 1510000.0000000000000000000000
      },
      {
        "cpID": "08ddbb97-78da-4206-8558-856f1850be44",
        "cpCode": "COCP250709",
        "cpName": "M A A K & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddbae0-17d8-4753-824d-1f4a875ac425",
        "cpCode": "COCP250708",
        "cpName": "RONAK RAJENDRAKUMAR DOSHI",
        "spCount": 0,
        "clientsCount": 3,
        "totalLoan": 3,
        "totalAmount": 22000000.000000000000000000000
      },
      {
        "cpID": "08ddba22-745a-4f02-81a0-136a896a6b28",
        "cpCode": "COCP250707",
        "cpName": "Darshak Acharya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddba1f-eb87-4bf5-8e6e-d6959fba2261",
        "cpCode": "COCP250706",
        "cpName": "NISHI BHAVSAR",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddba08-36b5-451a-8c8c-a052df68ddf1",
        "cpCode": "COCP250704",
        "cpName": "PALLAVI KIRTIBHAI BHOJANI",
        "spCount": 0,
        "clientsCount": 9,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddba00-68d9-47f7-8291-c2c06d997487",
        "cpCode": "COCP250703",
        "cpName": "HARSH KIRTIBHAI BHOJANI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 20000000.000000000000000000000
      },
      {
        "cpID": "08ddb945-d962-420d-8f60-f9bffe54cdc0",
        "cpCode": "COCP250702",
        "cpName": "PRAKASH BANGAR",
        "spCount": 0,
        "clientsCount": 3,
        "totalLoan": 2,
        "totalAmount": 80000000.00000000000000000000
      },
      {
        "cpID": "08ddb857-3eb1-4eab-8aa1-d50ff0464916",
        "cpCode": "COCP250701",
        "cpName": "PIYUSH BORISA",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08ddafc8-e0be-4d89-85d7-0c4d9202036a",
        "cpCode": "COCP250604",
        "cpName": "ANKIT V SRIVASTAVA",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 5000000.0000000000000000000000
      },
      {
        "cpID": "08dda80a-1520-4538-8de7-6dcf7a82de88",
        "cpCode": "COCP250603",
        "cpName": "JAY SANJAYBHAI THAKKAR",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 4,
        "totalAmount": 26500000.000000000000000000000
      },
      {
        "cpID": "08dda191-d880-45e3-84a6-5f737b2389de",
        "cpCode": "COCP250602",
        "cpName": "Kamal Thakkar",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dda0ef-987c-40b7-8944-1c9f4dc5f88d",
        "cpCode": "COCP250601",
        "cpName": "NIMESH RAMESHBHAI HARIYA",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dda049-74b5-4fcd-8e56-73f9956a0214",
        "cpCode": "COCP250532",
        "cpName": "HARSHIL SANDIPKUMAR SHAH",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dda011-1856-4358-8415-a7026b01154b",
        "cpCode": "COCP250531",
        "cpName": "MARMIK GIRISHBHAI SHAH",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dda004-fe33-488a-84d3-45973c4cc54c",
        "cpCode": "COCP250530",
        "cpName": "AARTI SHANTILAL BHANDERI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9f5f-8360-4ec5-8ca4-ac82b4089b5c",
        "cpCode": "COCP250527",
        "cpName": "NAMAN ANILKUMAR SHETH",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 5000000.0000000000000000000000
      },
      {
        "cpID": "08dd9f42-243c-4221-83e7-6424a4a75087",
        "cpCode": "COCP250526",
        "cpName": "Bharat Dobariya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9e9d-68c7-4a0a-8f87-b27c84c261a8",
        "cpCode": "COCP250525",
        "cpName": "Rushabh Shah",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9de7-7cbe-49a1-83ca-c725f16159b1",
        "cpCode": "COCP250524",
        "cpName": "Meet Rathi",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9c20-a285-4183-82fd-57d888f3ac51",
        "cpCode": "COCP250523",
        "cpName": "Piyush Pandya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9c15-b0f1-4537-83a8-6f3bd11b6680",
        "cpCode": "COCP250522",
        "cpName": "SHASHANK SINGH",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9a9c-b972-4023-869b-cb6e7517a4d8",
        "cpCode": "COCP250521",
        "cpName": "SUMIT SAHA",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 3,
        "totalAmount": 13500000.000000000000000000000
      },
      {
        "cpID": "08dd991d-d60a-4c5a-8af4-6389cb8205fb",
        "cpCode": "COCP250520",
        "cpName": "Reetu Chaudhary",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd991d-cf4b-477d-85ed-c13fa2889f7f",
        "cpCode": "COCP250519",
        "cpName": "Shrey Sheth",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd991d-cc6a-4ab7-8e10-68a33234870b",
        "cpCode": "COCP250518",
        "cpName": "Harsh Gohil",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd991d-ca80-418c-8b47-9541777fef85",
        "cpCode": "COCP250517",
        "cpName": "GOPALKUMAR ALPESHBHAI KHORASIYA",
        "spCount": 0,
        "clientsCount": 4,
        "totalLoan": 3,
        "totalAmount": 10500000.000000000000000000000
      },
      {
        "cpID": "08dd991d-c06d-4814-84f5-af9c8593c498",
        "cpCode": "COCP250516",
        "cpName": "Ritu Vaishnav",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd991d-bf39-49a5-85f0-d8f981cfc6bc",
        "cpCode": "COCP250515",
        "cpName": "TUSHAR MUKESHBHAI VAGHELA",
        "spCount": 0,
        "clientsCount": 3,
        "totalLoan": 2,
        "totalAmount": 1300000.0000000000000000000000
      },
      {
        "cpID": "08dd9754-ea81-450d-8477-b03939f6815b",
        "cpCode": "COCP250514",
        "cpName": "SHREYESH SONI",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 1,
        "totalAmount": 10000000.000000000000000000000
      },
      {
        "cpID": "08dd9754-9e84-433b-8977-463910bb017d",
        "cpCode": "COCP250513",
        "cpName": "AAREN INTPRO",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd93a9-865f-4917-8ac9-6bff15d483c0",
        "cpCode": "COCP250511",
        "cpName": "Moxesh Shah",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9151-31b8-4342-876b-ce0b4b35e372",
        "cpCode": "COCP250510",
        "cpName": "NISHI BHAVSAR",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd9122-f4c0-4096-858c-286084492fee",
        "cpCode": "COCP250509",
        "cpName": "BIJAL HASMUKHBHAI KORADIYA",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 1,
        "totalAmount": 10000000.000000000000000000000
      },
      {
        "cpID": "08dd9122-4dff-4de7-8747-52eba6f462c0",
        "cpCode": "COCP250508",
        "cpName": "MEET ASHOKKUMAR RATHI",
        "spCount": 1,
        "clientsCount": 57,
        "totalLoan": 76,
        "totalAmount": 915011428.0000000000000000000
      },
      {
        "cpID": "08dd8ebc-da6d-4560-87b7-a7e103d905c8",
        "cpCode": "COCP250505",
        "cpName": "INS Arihant",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd8e0c-bab1-47e6-819f-7342ccd2f82d",
        "cpCode": "COCP250504",
        "cpName": "Logi Headphone 2",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd8e00-b45a-4ed7-85f4-522bb32372a7",
        "cpCode": "COCP250502",
        "cpName": "KHAN ZAFAR ZUBER AHMED",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd8de9-02f7-43a8-8322-1c4f98b76aee",
        "cpCode": "COCP250501",
        "cpName": "MARUTHACHALAM MAHESWARI",
        "spCount": 2,
        "clientsCount": 6,
        "totalLoan": 66,
        "totalAmount": 114189144.00000000000000000000
      },
      {
        "cpID": "08dd83b3-8c94-4d41-8d77-5883c2a414df",
        "cpCode": "COCP250409",
        "cpName": "KEF HOSPITALITY INDIA PRIVATE LIMITED",
        "spCount": 2,
        "clientsCount": 5,
        "totalLoan": 6,
        "totalAmount": 1500000.0000000000000000000000
      },
      {
        "cpID": "08dd8331-62df-4c81-8147-905c48a58d39",
        "cpCode": "COCP250408",
        "cpName": "CP",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd8324-20bc-478a-8b16-7875b4235567",
        "cpCode": "COCP250407",
        "cpName": "ChannelPartner",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd82fe-9a2f-4a5a-88e9-1e8b1b72773d",
        "cpCode": "COCP250406",
        "cpName": "MAULIK GIRISH SHAREDALAL",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd8194-b28b-450e-88fd-537e187580e5",
        "cpCode": "COCP250405",
        "cpName": "Priyank",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd7daa-1d24-4f78-8b11-b0e405a72497",
        "cpCode": "COCP250403",
        "cpName": "BHAVYA  TIWARI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 2000000.0000000000000000000000
      },
      {
        "cpID": "08dd75c3-c823-4ae0-8469-106632868a54",
        "cpCode": "COCP250402",
        "cpName": "DEV SANJAYKUMAR BHUPTANI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd7272-edf7-4cc6-8a00-6d1f1ed44abb",
        "cpCode": "COCP250401",
        "cpName": "Meghal Shah",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd703c-e40e-4c09-8611-1d415d22ba08",
        "cpCode": "COCP250313",
        "cpName": "Devid",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd66bc-53f6-4c9f-8c6f-e165f942b864",
        "cpCode": "COCP250312",
        "cpName": "VISHAL PARASHAR",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd6609-670d-46d5-89c1-1f0b374c5c5d",
        "cpCode": "COCP250311",
        "cpName": "MSACA BIZZSOLVE LLP",
        "spCount": 2,
        "clientsCount": 25,
        "totalLoan": 31,
        "totalAmount": 296900000.00000000000000000000
      },
      {
        "cpID": "08dd6218-47a1-43ee-804e-aba9b683718d",
        "cpCode": "COCP250310",
        "cpName": "MSACA BIZZSOLVE LLP",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd6206-2750-4208-843f-8ede06f6ddc9",
        "cpCode": "COCP250309",
        "cpName": "MEGHAL SHAH & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd5b1c-929f-4857-8f55-40eaec0e26c5",
        "cpCode": "COCP250307",
        "cpName": "Viarat",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd5b1a-b38a-479a-8e72-e34bebad6056",
        "cpCode": "COCP250305",
        "cpName": "demo",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd5b18-0c07-4865-83d2-f2375f5df3a5",
        "cpCode": "COCP250304",
        "cpName": "DEV SANJAYKUMAR BHUPTANI",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 3,
        "totalAmount": 1200000.0000000000000000000000
      },
      {
        "cpID": "08dd5a42-bf0d-4b17-857a-56324a7b9bfb",
        "cpCode": "COCP250301",
        "cpName": "New CP with Roles",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd5594-419b-4bac-8135-96f1da8e46bf",
        "cpCode": "COCP250203",
        "cpName": "Dhrumit ",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 1,
        "totalAmount": 10000000.000000000000000000000
      },
      {
        "cpID": "08dd556e-bb42-43be-8ee6-3e0784a9521d",
        "cpCode": "COCP250202",
        "cpName": "Nishita Juneja",
        "spCount": 0,
        "clientsCount": 2,
        "totalLoan": 38,
        "totalAmount": 68509360.000000000000000000000
      },
      {
        "cpID": "08dd54d5-1161-4759-8506-af2413df2c33",
        "cpCode": "COCP250201",
        "cpName": "Nemil Shah",
        "spCount": 0,
        "clientsCount": 1,
        "totalLoan": 2,
        "totalAmount": 15500000.000000000000000000000
      },
      {
        "cpID": "08dd41cf-38ff-44d4-8e52-f202659248bc",
        "cpCode": "COCP250108",
        "cpName": "Devil Bhuptani",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd3b75-f3c2-4bec-8a88-b267131b3ca7",
        "cpCode": "COCP250106",
        "cpName": "dwsf",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd3ae6-d9d6-4564-890f-f59833b35660",
        "cpCode": "COCP250105",
        "cpName": "Good Vibes",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd3ae5-b8f6-48f7-8d87-c4852ba037cb",
        "cpCode": "COCP250104",
        "cpName": "Samsung",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd33a2-ad8c-46ee-8280-9bead03fa89d",
        "cpCode": "COCP25013",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2b13-2e73-4b18-8270-e18836738b35",
        "cpCode": "COCP25012",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2b10-55b5-42ee-8224-e19a60e55382",
        "cpCode": "COCP25011",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "4a15970b-3b8a-4ce8-bb44-f9db899d7dba",
        "cpCode": "COCP24091",
        "cpName": "CredOrbitCP",
        "spCount": 0,
        "clientsCount": 47,
        "totalLoan": 18,
        "totalAmount": 83250000.00000000000000000000
      },
      {
        "cpID": "08dd28cf-4d70-4849-8efd-c8e385cdf013",
        "cpCode": "COCP241248",
        "cpName": "Pushpa",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd28cb-48c2-4120-8921-bca452d5518a",
        "cpCode": "COCP241247",
        "cpName": "udggu",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd289f-d47a-402d-8de4-c4f6a019b25c",
        "cpCode": "COCP241246",
        "cpName": "dyhb",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2655-2d71-4d67-8f99-21a80ac07c55",
        "cpCode": "COCP241245",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd25b0-2d67-4413-8d5b-4ddcb33c2ee8",
        "cpCode": "COCP241244",
        "cpName": "dgfdggfd",
        "spCount": 1,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd25aa-5983-4dae-8895-410dc2176ed5",
        "cpCode": "COCP241243",
        "cpName": "hefgu",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd25a4-4829-432e-8bd5-9db220984d1e",
        "cpCode": "COCP241242",
        "cpName": "Dora",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2596-99f9-43e6-8b7b-d62ab50b29a2",
        "cpCode": "COCP241241",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 1,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2418-4db9-4249-8876-2f3dd4e5fada",
        "cpCode": "COCP241240",
        "cpName": "grefger",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd240f-e7c4-493d-8d47-5e2659176759",
        "cpCode": "COCP241239",
        "cpName": "tfdgrefg",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd240e-8684-4ef0-858e-188717d90478",
        "cpCode": "COCP241238",
        "cpName": "dbusnj",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2357-a6a4-4edd-87e4-3628829ca0f0",
        "cpCode": "COCP241237",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2323-985f-46b6-849d-cbc867e3e7bc",
        "cpCode": "COCP241231",
        "cpName": "ferddfg",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd20bf-12c4-4f98-8f6b-77254fc86b3e",
        "cpCode": "COCP241230",
        "cpName": "TestCP1",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2033-6e43-4234-81f0-fff0783719c7",
        "cpCode": "COCP241229",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2033-497e-4532-84a3-14cfd4179756",
        "cpCode": "COCP241228",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2032-4195-4cf9-8981-c011f6647838",
        "cpCode": "COCP241227",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd2030-2013-47a6-86c7-488b6886e142",
        "cpCode": "COCP241226",
        "cpName": "dkjfvafv",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd201b-c073-4fbd-87f7-64d4d7a5ba9e",
        "cpCode": "COCP241225",
        "cpName": "ferdsfe",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f2b-1af6-4606-816b-09c85b83b32e",
        "cpCode": "COCP241224",
        "cpName": "Remote Controller",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f27-2b57-41f0-8f4e-42ce89bda637",
        "cpCode": "COCP241223",
        "cpName": "KK",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f25-4774-440d-8f8f-aa56c9b3aee1",
        "cpCode": "COCP241222",
        "cpName": "Vilen",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f25-0317-48e7-8b3b-56a449f6cb03",
        "cpCode": "COCP241221",
        "cpName": "Arijit Singh",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f23-27de-485d-8fcb-63d62f1e4545",
        "cpCode": "COCP241220",
        "cpName": "Anuv Jain",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f22-92dc-46c9-80a8-887d642a9f73",
        "cpCode": "COCP241219",
        "cpName": "Ram Yadav",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f21-cd32-4a76-8cef-318be2362dc4",
        "cpCode": "COCP241218",
        "cpName": "Varun Mayya",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f1e-618f-48f3-8243-92209499c4d5",
        "cpCode": "COCP241217",
        "cpName": "Lala",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f1d-c347-425f-8d77-38dca917fbe8",
        "cpCode": "COCP241216",
        "cpName": "Rishabh Jain",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1f1d-3d19-4f7c-8fef-e0ba2026bfc3",
        "cpCode": "COCP241215",
        "cpName": "Ratan Tata",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1ea7-82b1-4448-8dc6-68f36555ca88",
        "cpCode": "COCP241214",
        "cpName": "Inventory",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1ea5-4d6b-4b7e-8921-19b36dd53170",
        "cpCode": "COCP241213",
        "cpName": "babulal",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1e9f-984b-4ee7-8f47-8db5cc6e6724",
        "cpCode": "COCP241212",
        "cpName": "fgbghsdfju",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1b4d-adc2-461f-8ea8-06ca27f253c5",
        "cpCode": "COCP241211",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1b3c-5242-4470-80f9-749dde6ff0f9",
        "cpCode": "COCP241210",
        "cpName": "fgjkvngud",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1b3a-c91d-476f-8913-be4bb633ecc7",
        "cpCode": "COCP24129",
        "cpName": "fgbgoifhdin",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1a81-99ae-45c4-8ec3-5ce8b0a13295",
        "cpCode": "COCP24128",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1a76-6212-4dbd-81c9-08c1237b18ce",
        "cpCode": "COCP24127",
        "cpName": "Devil Dev",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1a76-287d-415d-8eb9-42b0770202ab",
        "cpCode": "COCP24126",
        "cpName": "Doraemon",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1a71-a23f-44d2-81ff-d06a6e80264f",
        "cpCode": "COCP24125",
        "cpName": "Dev Shah",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1a71-a228-4590-887d-39d5037ffdce",
        "cpCode": "COCP24124",
        "cpName": "Works Fine",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd19dd-ba1d-48c0-8e1f-2627f1d4e1f2",
        "cpCode": "COCP24123",
        "cpName": "Dev CP test",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd19a4-592d-4bb1-86ba-b60766c85d60",
        "cpCode": "COCP24122",
        "cpName": "Dr HATHI",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd185c-7be0-4cc9-8c1d-ece8364fa5de",
        "cpCode": "COCP24121",
        "cpName": "Bill Gates",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd138d-b987-44d9-8094-0c8819c1e039",
        "cpCode": "COCP241068",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd135d-fe56-4a30-8d3e-5e8acbe87a0e",
        "cpCode": "COCP241066",
        "cpName": "Dev",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1388-de50-4a45-83b4-83d3c934dfd4",
        "cpCode": "COCP241019",
        "cpName": "Devil",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd1388-9d00-47df-8621-faa63d81014e",
        "cpCode": "COCP240962",
        "cpName": "Dev CP",
        "spCount": 2,
        "clientsCount": 5,
        "totalLoan": 1,
        "totalAmount": 50000.000000000000000000000000
      },
      {
        "cpID": "08dd0fb0-71a1-4e03-8aaa-dea0730bb80b",
        "cpCode": "COCP241067",
        "cpName": "dfgdfgj",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0ddb-f149-470a-89cc-2dccfd56b898",
        "cpCode": "COCP241032",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0d3e-e7e7-4880-8a87-69eb93d05a40",
        "cpCode": "COCP241083",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0d32-1537-403f-889d-d58f4b8ed9a1",
        "cpCode": "COCP241011",
        "cpName": "fghgfh",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0d1c-9510-4d1b-85ad-2350c6c167c8",
        "cpCode": "COCP241089",
        "cpName": "bnifgnifgdikn",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0d1a-8584-4e86-8943-6227f7f8c729",
        "cpCode": "COCP241093",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0abc-63a8-4b65-8eab-bfaba0cf0ef5",
        "cpCode": "COCP241015",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0abc-19fa-4e2a-8d8a-bbba5c57cdc0",
        "cpCode": "COCP241068",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0abb-9443-46a9-83e1-407c8c3f9ed8",
        "cpCode": "COCP241023",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0abb-3722-4202-8266-bc750eb92f05",
        "cpCode": "COCP241092",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0aba-dfff-4e8c-8f84-2a0eb83b8efe",
        "cpCode": "COCP241056",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "08dd0ab9-853b-44ca-8a0b-6a0708ed852a",
        "cpCode": "COCP241094",
        "cpName": "MEGHAL SHAH NEW & ASSOCIATES",
        "spCount": 0,
        "clientsCount": 0,
        "totalLoan": 0,
        "totalAmount": 0.0000000000000000000000000000
      },
      {
        "cpID": "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
        "cpCode": "COCP241101",
        "cpName": "Jarvis Credo CP",
        "spCount": 12,
        "clientsCount": 39,
        "totalLoan": 203,
        "totalAmount": 62379743463.000000000000000000
      }
    ],
    totalCount: 168,
  },
};

const adminGeographicalReportResponse = {
  status: true,
  statusCode: 200,
  message: "Geographical report fetched successfully!",
  data: {
    list: [
      { state: "yMHaOLJf6eJtjPP1f5sR6w==", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "BkFZ9XSp8OfIQZ3E6jrlAA==", cpCount: 23, spCount: 5, clientsCount: 52, totalLoan: 44, totalAmount: 10331160000 },
      { state: "j+Rqzohk/rjAppMLVNEJkA==", cpCount: 2, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "+Nc2SyNG7yy3LcoI/EJF8Q==", cpCount: 2, spCount: 0, clientsCount: 2, totalLoan: 0, totalAmount: 0 },
      { state: "n4IwWbCn5naHUMjBYF5yHA==", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "QNpWMyqbgJxqgAhGIiewjw==", cpCount: 3, spCount: 1, clientsCount: 1, totalLoan: 1, totalAmount: 1500000 },
      { state: "Qi+5zrdMw5OgPMur26LqRg==", cpCount: 1, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "sogSyP5pUfzgfiI7Chvf7A==", cpCount: 3, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "NEc+zzofMaYev/y4LOycBA==", cpCount: 1, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "BOhUe0ZwmrMELS5qe17pFg==", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
    ],
    totalCount: 48,
    stateList: ["yMHaOLJf6eJtjPP1f5sR6w==", "BkFZ9XSp8OfIQZ3E6jrlAA==", "j+Rqzohk/rjAppMLVNEJkA==", "+Nc2SyNG7yy3LcoI/EJF8Q==", "n4IwWbCn5naHUMjBYF5yHA==", "QNpWMyqbgJxqgAhGIiewjw==", "Qi+5zrdMw5OgPMur26LqRg==", "sogSyP5pUfzgfiI7Chvf7A==", "NEc+zzofMaYev/y4LOycBA==", "BOhUe0ZwmrMELS5qe17pFg==", "Jd9U2a8A0PFORjHdsSAZvA==", "R7i2vLGU8R66bZqUZMNNrQ==", "lk9xqgW2sPq/lPzqgJIMm6xgeHb4r0Pj+BbF/txEtyw=", "8WGqwq+EbVIMdQdD4jK4Ng==", "vAaA/tru9bOv1+i0uHv1XA==", "BVbWnwuO1Zg2Vu5f85uyFqmLlMOORkB4P9IvR7/bQpM=", "SZlcru02m8mrOUqgCbn20g==", "0WpJ9RtHNRUyId9tcH9gug==", "6hAkBCl0QKVE+XYzVS7UJQ==", "8ru+ZLNKqagHcke4Zd3+rA==", "/eT8eO8BgUPg0WwN4dPtPKgCjklCcX4yZ3TvTM7ZM1U=", "r+6KvOJgN7vp8AaRKO2gzQ==", "IspQerH05QylSfpTzbRSpA==", "dIayBu0kn5QP5At0Guk7LA==", "Undefined", "ACqMBUzXjoW77dzATOXLvA==", "pY1R+9dga/ja2YTReusQpA==", "tuxl0TPzXPdtMobCmUma6Q==", "MEARbSArFtxbdwC5qge3Jg==", "unJUjeuCpUouuJEDOF3KDQ==", "L1MWogL0x041Lf+WruCtvQ==", "ahnHrK957WCTbjYP7sILOw==", "VB2GvCF0D0uzjJCEpNeylg==", "AbmvO4UEcKAc+fFlnpsPFA==", "+gPpI3q8pU3hV073A/r+lg==", "Doxh6TtOlfyw71kRDlkoRw==", "Undefined", "ROGqkyzYRdFojDBmRm8NQg==", "FYoYFhz5ZKpxJ0X7Pw8fHg==", "IdaAArQmuSjrmvnSmPNUpg==", "z19VcZmQerqZ/vPnKMQBOw==", "LxH/BvDTeam8WhHovEct0w==", "J9zJBmmB4zDeQF4jdERuzw==", "sTUfvjQ8ZGFSX+V+z0xnoA==", "65DRFDMS57CZrj8D4QofYg==", "fXBXw7uyF+PFS3l35+3h3g==", "iwzMylAmEbU9PIGSimBtdg==", "TtxHzQMMHTs573lliAqrqw=="],
  },
};

const fetchAllPaymentsResponse = {
  status: true,
  statusCode: 200,
  message: "Subcription history fetched successfully!",
  data: {
    totalRecords: 134,
    page: 1,
    pageSize: 10,
    records: [
      { userName: "Jarvis Credo CP", userType: 2, amount: 23600.0, creditPoints: 25000, dateTime: "2026-04-13T18:27:46.594246", paymentLinkID: 208, razorpayLinkID: "plink_Scz8oW1hsjRLBH", planName: "Custom Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "DARSHAK ATULKUMAR ACHARYA", userType: 4, amount: 588.82, creditPoints: 500, dateTime: "2026-04-13T17:18:42.393527", paymentLinkID: 207, razorpayLinkID: "plink_ScxxBC3QaUQKJm", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 5898.82, creditPoints: 6000, dateTime: "2026-04-01T19:26:36.49692", paymentLinkID: 206, razorpayLinkID: "plink_SYFj3f45LALOGU", planName: "Power Pack Plan", paymentStatus: "Failed", colorCode: "#dc3545" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 11798.82, creditPoints: 12000, dateTime: "2026-04-01T19:15:58.325381", paymentLinkID: 205, razorpayLinkID: "plink_SYFYH18Hk3qHGf", planName: "Max Saver Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 2358.82, creditPoints: 2200, dateTime: "2026-04-01T17:34:55.972106", paymentLinkID: 204, razorpayLinkID: "plink_SYDpXxWRfIjYSb", planName: "Value Plus Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 2358.82, creditPoints: 2200, dateTime: "2026-04-01T17:19:05.009716", paymentLinkID: 203, razorpayLinkID: "plink_SYDWAZku64oKzC", planName: "Value Plus Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-04-01T16:44:36.774228", paymentLinkID: 202, razorpayLinkID: "plink_SYCyORyRygnNLQ", planName: "Kickstart Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-04-01T16:43:49.071867", paymentLinkID: 201, razorpayLinkID: "plink_SYCx86fJZYRH5i", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-03-31T18:57:50.383813", paymentLinkID: 200, razorpayLinkID: "plink_SXqao4rR0dojFF", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "Jarvis Credo CP", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-03-31T16:31:14.333059", paymentLinkID: 199, razorpayLinkID: "plink_SXnhCj285qnbwt", planName: "Kickstart Plan", paymentStatus: "Expired", colorCode: "#dc3545" },
    ],
  },
} as IFetchAllPaymentsResponse;

export const getDemoAdminDashboard = async (): Promise<IAdminDashboardResponse> => {
  await wait(DEMO_DELAY_MS);
  return adminDashboardResponse;
};

export const getDemoChannelPartnerListing = async (): Promise<IChannelPartnerResponse> => {
  await wait(DEMO_DELAY_MS);
  return channelPartnerListingResponse;
};

export const getDemoAdminChannelPartnerReport = async (): Promise<any> => {
  await wait(DEMO_DELAY_MS);
  return adminChannelPartnerReportResponse;
};

export const getDemoAdminGeographicalReport = async (): Promise<any> => {
  await wait(DEMO_DELAY_MS);
  return adminGeographicalReportResponse;
};

export const getDemoFetchAllPayments = async (): Promise<IFetchAllPaymentsResponse> => {
  await wait(DEMO_DELAY_MS);
  return fetchAllPaymentsResponse;
};

const fetchUserTabwiseCpResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    totalRecords: 168,
    page: 1,
    pageSize: 25,
    records: [
      { id: "08dd0ab9-853b-44ca-8a0b-6a0708ed852a", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "HZevnFWGrLBm5QgEqaXN9WmzDl97v/n8r234NCXj2Y4=", panNumber: "xMsHqG437iSeswfQTMqVHQ==", phoneNumber: "aib2JyYmsweVczEplXYDgA==", code: "COCP241094" },
      { id: "08dd0aba-dfff-4e8c-8f84-2a0eb83b8efe", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "3hOQgtf0GooIaQdAEnE4N5awsKz9tHXW+gLQAOCKWUA=", panNumber: "83Jst6cJGoXnbJYhCDkRcg==", phoneNumber: "HWdLs7pDwbGgdTipiymJ9g==", code: "COCP241056" },
      { id: "08dd0abb-3722-4202-8266-bc750eb92f05", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "3HD0czAxWBXtyqYCUaOLIlueL/Nu3v+wmdSHz+yeBJk=", panNumber: "azkGogdtPNi4UuTxbo4EgA==", phoneNumber: "kRe8kUWhsecjOP1FPOpyIA==", code: "COCP241092" },
      { id: "08dd0abb-9443-46a9-83e1-407c8c3f9ed8", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "QUSYnYfxXn5kusWkz9nLm3LAYczs8BCdVxlX8GAyjTY=", panNumber: "sM91xeX787uUdQnob0+1Zg==", phoneNumber: "6N0FY/HtklHP+mGUIwLg3g==", code: "COCP241023" },
      { id: "08dd0abc-19fa-4e2a-8d8a-bbba5c57cdc0", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "KP1pFGr1XRJchKjuLqiHtnIuELnIRoEl9mdBY2d+mcc=", panNumber: "RZTimAuzqlwRH95Mp2m6Aw==", phoneNumber: "HT0N5SibwF4fr9FtGAsLTQ==", code: "COCP241068" },
      { id: "08dd0abc-63a8-4b65-8eab-bfaba0cf0ef5", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: "P7YnuSs7UjFcTKYMJyvn5g==", phoneNumber: "N9nfTpSUcUzgy79UopCKkg==", code: "COCP241015" },
      { id: "08dd0d1a-8584-4e86-8943-6227f7f8c729", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: "0vVvW6wPn+xxI6n4SKHO3g==", phoneNumber: "ZooxVLY32YpZf2dipcFMcg==", code: "COCP241093" },
      { id: "08dd0d1c-9510-4d1b-85ad-2350c6c167c8", fullName: "bnifgnifgdikn", email: "IoDvjSgAiCaHFlbpo3QeqA==", panNumber: null, phoneNumber: "jVb5Mnuf1l02kVXvW5pn2w==", code: "COCP241089" },
      { id: "08dd0d32-1537-403f-889d-d58f4b8ed9a1", fullName: "fghgfh", email: "88yfLRXKC734wVbErms8aXWXmLjbrffDuU6hOlrv1S4=", panNumber: null, phoneNumber: "L9E+1olRyOsEQLawCqAp3Q==", code: "COCP241011" },
      { id: "08dd0d3e-e7e7-4880-8a87-69eb93d05a40", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "IPBOmawRFQmx9AzKz9znH/lK0U6gAHPy12AetGrSykA=", panNumber: "bOC+v0+r13ZdJU3/xAazGQ==", phoneNumber: "ZTrfPzu49EIXZhmdKIYlvg==", code: "COCP241083" },
      { id: "08dd0ddb-f149-470a-89cc-2dccfd56b898", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "b48EReynLEC4yBnP3TtEMvHtaW16V6PA1fBYsz43+RA18VThLQVEwXtI59Wi6Yab", panNumber: "ePr66Fql2hWFACCbv1mfXQ==", phoneNumber: "EjFIX6UMNgoIrc+kIoGMqw==", code: "COCP241032" },
      { id: "08dd0fb0-71a1-4e03-8aaa-dea0730bb80b", fullName: "dfgdfgj", email: "4TtYiqFhgO2mj+3Qy+oFhhSdQ2DNK6A0/WUFiUs1Cs8=", panNumber: null, phoneNumber: "89b4Ubo49h1f6BtYz2WfLg==", code: "COCP241067" },
      { id: "08dd135d-fe56-4a30-8d3e-5e8acbe87a0e", fullName: "Dev", email: "6vc+qYm6rI5AhHT+0ZqxYRW7u9UINID0PVoK8AZ8g6o=", panNumber: null, phoneNumber: "1xI0K0TYshP/oisawWXQQg==", code: "COCP241066" },
      { id: "08dd1388-9d00-47df-8621-faa63d81014e", fullName: "Dev CP", email: "b48EReynLEC4yBnP3TtEMvHtaW16V6PA1fBYsz43+RA18VThLQVEwXtI59Wi6Yab", panNumber: "XG/oB+KaL19jopNI2Wfi6g==", phoneNumber: "SF1kUD7DtUoD1tO7YGtrhQ==", code: "COCP240962" },
      { id: "08dd1388-de50-4a45-83b4-83d3c934dfd4", fullName: "Devil", email: "b48EReynLEC4yBnP3TtEMvHtaW16V6PA1fBYsz43+RA18VThLQVEwXtI59Wi6Yab", panNumber: null, phoneNumber: "7B9RgTCcufaAkf9mUxcS7Q==", code: "COCP241019" },
      { id: "08dd138d-b987-44d9-8094-0c8819c1e039", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "b48EReynLEC4yBnP3TtEMvHtaW16V6PA1fBYsz43+RA18VThLQVEwXtI59Wi6Yab", panNumber: "XG/oB+KaL19jopNI2Wfi6g==", phoneNumber: "YMwPLxyt7VgotIeB1GOW+A==", code: "COCP241068" },
      { id: "08dd185c-7be0-4cc9-8c1d-ece8364fa5de", fullName: "Bill Gates", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: null, phoneNumber: "8MQxYb/JFH4+kccGKgXHKA==", code: "COCP24121" },
      { id: "08dd19a4-592d-4bb1-86ba-b60766c85d60", fullName: "Dr HATHI", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: null, phoneNumber: "BcJf1hkTi2OzgbayIADFQg==", code: "COCP24122" },
      { id: "08dd19dd-ba1d-48c0-8e1f-2627f1d4e1f2", fullName: "Dev CP test", email: "OcS1Hjn3mybVI2XfeQUb5PeVT59z3SLHZZxUtJBAO0Y=", panNumber: null, phoneNumber: "DR/IXQnqfRCnSsOyS0i9gA==", code: "COCP24123" },
      { id: "08dd1a71-a228-4590-887d-39d5037ffdce", fullName: "Works Fine", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: "PMdy0rVXQwBoU3Y8n5SBJQ==", phoneNumber: "/50319NQOiqNbu0jON2QlA==", code: "COCP24124" },
      { id: "08dd1a71-a23f-44d2-81ff-d06a6e80264f", fullName: "Dev Shah", email: "nLFO0PWYFRBnwckVz2EHkZkdlByEh0I21SFZAXiE2SM=", panNumber: null, phoneNumber: "zb4QQ76EetwVs8ztCRbhyQ==", code: "COCP24125" },
      { id: "08dd1a76-287d-415d-8eb9-42b0770202ab", fullName: "Doraemon", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRio", panNumber: null, phoneNumber: "Gj29h56Ae4ReERPbBhSb3w==", code: "COCP24126" },
      { id: "08dd1a76-6212-4dbd-81c9-08c1237b18ce", fullName: "Devil Dev", email: "75tB2hzvWlC9cgF2ma9mAPo6XUrB0OAXbtMskRfJWQ8=", panNumber: null, phoneNumber: "5bMgoKxSv3ihWtYzpK16Fg==", code: "COCP24127" },
      { id: "08dd1a81-99ae-45c4-8ec3-5ce8b0a13295", fullName: "MEGHAL SHAH NEW & ASSOCIATES", email: "b48EReynLEC4yBnP3TtEMvHtaW16V6PA1fBYsz43+RA18VThLQVEwXtI59Wi6Yab", panNumber: "v7tAfywMVeo8d0BhVvu2lg==", phoneNumber: "ZTrfPzu49EIXZhmdKIYlvg==", code: "COCP24128" },
      { id: "08dd1b3a-c91d-476f-8913-be4bb633ecc7", fullName: "fgbgoifhdin", email: "DtLHwiOHhfJ97S6nhUuFFoEViJdx3V1cVAbTAvOJMjI=", panNumber: "PMdy0rVXQwBoU3Y8n5SBJQ==", phoneNumber: "JweyrdFS9yctZ12CiF4orw==", code: "COCP24129" },
    ],
  },
} as IFetchTabWiseUserListingResponse;

const fetchUserTabwiseBorrowerResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    totalRecords: 2,
    page: 1,
    pageSize: 25,
    records: [
      { id: "08dddf16-f7ed-42f5-82ba-a2db74dbe6bb", fullName: "DEV SANJAYKUMAR BHUPTANI", email: "7GXoQbDwZRA+tc8d8f8cVMMQJgWXh461lhD7RAVZtTY=", panNumber: "yMxMPliigDtX5/toz6v+xQ==", phoneNumber: "vO5BMExR9EM6qawgtekoVg==", code: "COCU250833" },
      { id: "08de9951-cbe9-49b4-8bd3-8b026851bc4e", fullName: "DARSHAK ATULKUMAR ACHARYA", email: "A2xVMijTJtUWs+OMO2INmIa9OaL4KCCUK4BBCBK6+arbpAkIr+fiXSI5EkRioGKr", panNumber: "P4OJWWP5SgQ3vzk/ukhRmA==", phoneNumber: "5U8wsmljtwmIsUU9juI9Yw==", code: "COCU260402" },
    ],
  },
} as IFetchTabWiseUserListingResponse;

const addCreditForUserResponse = {
  status: true,
  statusCode: 200,
  message: "Credit added for user successfully",
  data: {},
} as APIResponseEntity;

export const getDemoFetchUserTabwise = async (
  type: number,
): Promise<IFetchTabWiseUserListingResponse> => {
  await wait(DEMO_DELAY_MS);
  return type === 4 ? fetchUserTabwiseBorrowerResponse : fetchUserTabwiseCpResponse;
};

export const getDemoAddCreditForUser = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return addCreditForUserResponse;
};

const channelPartnerDetailResponse = {
  status: true,
  statusCode: 200,
  message: null,
  data: {
    id: "08de994b-df47-4fdd-8d0d-f14d7695ce08",
    name: "DARSHAK ATULKUMAR ACHARYA",
    code: "COCP260401",
    mobileNumber: "5U8wsmljtwmIsUU9juI9Yw==",
    email: "beP+hSaer3H7U994276RqMbZoFEpB+0n+sx+vjF06MI=",
    panNumber: "P4OJWWP5SgQ3vzk/ukhRmA==",
    payOuts: 1.0,
    loansCompleted: 0,
    noOfRegisteredSP: 0,
  },
} as unknown as IChannelPartnerDetailResponse;

const updatePayoutResponse = {
  status: true,
  statusCode: 200,
  message: "Payout updated successfully!",
  data: null,
} as APIResponseEntity;

const deleteRoleResponse = {
  status: true,
  statusCode: 200,
  message: "Role deleted successfully!",
  data: false,
} as APIResponseEntity;

const addPanForCpResponse = {
  status: true,
  statusCode: 200,
  message: "Channel Partner added successfully!",
  data: false,
} as APIResponseEntity;

const updateAadharResponse = {
  status: true,
  statusCode: 200,
  message: "Aadhaar updated successfully!",
  data: false,
} as APIResponseEntity;

const generateAadharOtpResponse = {
  status: true,
  statusCode: 200,
  message: "Channel Partner added successfully!",
  data: {
    clientId: "00000000000",
    otpSent: true,
    ifNumber: true,
    validAadhaar: true,
  },
} as IAadharCardResponse;

const createSpPaymentRequestResponse = {
  status: true,
  statusCode: 200,
  message: "Payment request created successfully!",
  data: false,
} as APIResponseEntity;

const userRightsForUserManagementResponse = {
  status: true,
  statusCode: 200,
  message: "Roles and rights of User Management fetched successfully!",
  data: {
    userEmail: "uzyiGBViw7ly/pbDameKR2cfWC3fN9ukBglyS63c30k=",
    rolesAndRights: [
      { id: 997, rightID: 1, rightName: "Dashboard", displayName: "Dashboard", displayOrder: 1, create: true, view: null, list: true },
      { id: 998, rightID: 2, rightName: "Profile", displayName: "Profile", displayOrder: 2, create: true, view: null, list: true },
      { id: 999, rightID: 3, rightName: "RoleMaster", displayName: "Role Master", displayOrder: 5, create: true, view: true, list: true },
      { id: 1000, rightID: 4, rightName: "ClientMaster", displayName: "Client Master", displayOrder: 7, create: true, view: true, list: true },
      { id: 1001, rightID: 6, rightName: "SourcingPartner", displayName: "Sourcing Partner", displayOrder: 9, create: true, view: true, list: true },
      { id: 1002, rightID: 7, rightName: "Reports", displayName: "Reports", displayOrder: 10, create: null, view: true, list: true },
      { id: 1003, rightID: 8, rightName: "ContractChannelPartner", displayName: "Channel Partner Contract ", displayOrder: 14, create: null, view: null, list: true },
      { id: 1004, rightID: 9, rightName: "ContractSourcingPartner", displayName: "Sourcing Partner Contract ", displayOrder: 15, create: null, view: null, list: true },
      { id: 1005, rightID: 18, rightName: "ManageUsers", displayName: "Manage Users", displayOrder: 4, create: true, view: true, list: true },
      { id: 1006, rightID: 21, rightName: "ChannelPartnerPayout", displayName: "My Payout", displayOrder: 21, create: true, view: true, list: true },
      { id: 1007, rightID: 22, rightName: "SourcingPartnerPayout", displayName: "SP Payout", displayOrder: 22, create: true, view: true, list: true },
      { id: 1008, rightID: 11, rightName: "Policy", displayName: "Policy", displayOrder: 17, create: null, view: null, list: true },
      { id: 1009, rightID: 12, rightName: "Support", displayName: "Support", displayOrder: 18, create: null, view: null, list: true },
      { id: 1010, rightID: 13, rightName: "PayOuts", displayName: "Payouts", displayOrder: 20, create: null, view: null, list: true },
      { id: 1011, rightID: 14, rightName: "UserMaster", displayName: "Master", displayOrder: 6, create: null, view: null, list: true },
      { id: 1012, rightID: 15, rightName: "Contracts", displayName: "Contracts", displayOrder: 13, create: null, view: null, list: true },
    ],
  },
} as unknown as IGetUserRightsForUserManagementResponse;

const submitUserRightsForUserManagementResponse = {
  status: true,
  statusCode: 200,
  message: "Rights edited successfully!",
  data: null,
} as unknown as IGetUserRightsForUserManagementResponse;

const uploadAllDocumentsResponse = {
  status: true,
  statusCode: 200,
  message: "File(s) uploaded and processed successfully!",
  data: [
    {
      documentType: "Unstructured",
      documentTypeID: null,
      extractedText:
        "GSTR Analysis Report - NEXUS NUTRI SCIENCE LIMITED\nPAN: AAGCN4499R\nGSTIN: 24AAGCN4499R1ZJ\nPeriod From: Apr 2023\nPeriod To: Dec 2025\nState of Operations: Gujarat\nOverview of GST Returns, business breakup, monthly sale and purchase, top customers, top suppliers, HSN summary, statewise sale and purchase, circular transactions, and other OCR-extracted GST analytics sections.",
      extractedDate: "2022-01-08T00:00:00",
    },
    {
      documentType: "BankStatements",
      documentTypeID: null,
      extractedText:
        "Banking Statement Analysis Report\nFor AAN LIFESCIENCE\nGenerated on 20 Mar 2026 19:56\nBank: Yes Bank\nAccount No.: 021573800000083\nPeriod: 01-08-2022 to 31-08-2022\nOpening Balance: -19,576,223.92\nClosing Balance: -18,285,356.92\nIncludes banking transaction snapshot, average balances, top debit and credit transactions, cyclic transactions, exceptional transactions, customer summary, supplier summary, and cash flow analysis.",
      extractedDate: "2022-01-08T00:00:00",
    },
    {
      documentType: "PropertyDocument",
      documentTypeID: null,
      extractedText:
        "Equifax Score: 808\nName: DARSHAK ACHARYA\nPAN: EVWPA0494K\nTotal Accounts: 2\nActive Accounts: 2\nTotal Outstanding Balance: 1434\nRecent Account Open Date: 15-10-2024\nOldest Account Open Date: 30-08-2023\nActive credit card accounts reported from SBI Cards and HDFC Bank. No DPD, no settlements, and no write-offs recorded.",
      extractedDate: null,
    },
    {
      documentType: "PropertyDocument",
      documentTypeID: null,
      extractedText:
        "Credit Report\nFor DARSHAK ATULKUMAR ACHARYA\nGenerated on 21 Nov 2025 10:10\nEquifax Score: 808\nActive Accounts: 2\nOverdue Accounts: 0\nTotal Outstanding Balance: 1,434.00\nLenders: HDFC Bank Limited and SBI Cards and Payment Services Limited\nIncludes general info, account summary, repayment obligations, enquiries, appendix, and loan analysis.",
      extractedDate: null,
    },
    {
      documentType: "PropertyDocument",
      documentTypeID: null,
      extractedText:
        "Equifax Score: 801\nName: DARSHAK ACHARYA\nPAN: EVWPA0494K\nTotal Accounts: 2\nActive Accounts: 2\nTotal Outstanding Balance: 4479\nRecent Account Open Date: 15-10-2024\nOldest Account Open Date: 30-08-2023\nUpdated bureau extract showing HDFC Bank credit card limit of 204000 and SBI Card limit of 60000 with zero overdue.",
      extractedDate: null,
    },
    {
      documentType: "LoanStatement",
      documentTypeID: null,
      extractedText:
        "Credit Bureau Report\nFor DARSHAK ATULKUMAR ACHARYA\nGenerated on 26 Mar 2026 12:14\nEquifax Score: 801\nActive Accounts: 2\nOverdue Accounts: 0\nTotal Outstanding Balance: 4,479.00\nDetailed active loan summary includes HDFC Bank Limited and SBI Cards and Payment Services Limited credit card accounts, repayment obligations, loan enquiries, delayed payment analysis, and appendix definitions.",
      extractedDate: null,
    },
  ],
} as unknown as APIResponseEntity;

const deleteReuploadLoanDocumentResponse = {
  status: true,
  statusCode: 200,
  message: "File deleted successfully!",
  data: null,
} as unknown as APIResponseEntity;

const deleteUploadRemainingDocumentsResponse = {
  status: true,
  statusCode: 200,
  message: "Files uploaded successfully!",
  data: [
    {
      fileName: "dummy.pdf",
      filePath: "/assets/images/document_uploaded.pdf",
      url: "/assets/images/document_uploaded.pdf",
    },
  ],
} as APIResponseEntity;

const updateGstDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "GST Added Successfully",
  data: "true",
} as APIResponseEntity;

const moveDocumentResponse = {
  status: true,
  statusCode: 200,
  message: "Document moved successfully!",
  data: null,
} as APIResponseEntity;

const generateSubscriptionInvoiceResponse = {
  status: true,
  statusCode: 200,
  message: "Invoice generated successfully!",
  data: "/assets/images/document_uploaded.pdf",
} as unknown as APIResponseEntity;

const updateLoanApplicationAmountResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Application Updated Successfully",
  data: 1,
} as APIResponseEntity;

const fileAutomatedRequestForItrUsingLinkResponse = {
  status: true,
  statusCode: 200,
  message:
    "A link to enter ITR username and password is succsessfully sent to provided Email ID!",
  data: {
    responseCode: "SRS016",
    referenceID: "a667e161-b747-4b69-b9e2-39c26b12a894",
    reservationId: "32958c28-0647-454a-9037-0e792f6ee89a",
  },
} as unknown as APIResponseEntity;

const gstReportGenerateOtpUsingLinkResponse = {
  status: true,
  statusCode: 200,
  message:
    "OTP generation Link for requested GSTIN is successfully sent to the requested email ID.",
  data: {
    responseCode: "SRS016",
    gstIn: "8lebhIcUZS24q+boxaByLQ==",
    reservationID: "63a4baf3-70ac-4f67-aa00-3009c38f7fe3",
    referenceID: "90da13be-481b-40ac-b000-7063b663326a",
  },
} as unknown as APIResponseEntity;

const gstReportViaPasswordUsingLinkResponse = {
  status: true,
  statusCode: 200,
  message:
    "OTP generation Link for requested GSTIN is successfully sent to the requested email ID.",
  data: {
    responseCode: "SRS016",
    gstIn: null,
    reservationID: "05ea7f78-073b-49c5-ab64-56c5a5a57bf8",
    referenceID: "d5d69301-a4ca-40e1-b6e2-3922c6d67782",
  },
} as unknown as APIResponseEntity;

const gstReportGenerateOtpResponse = {
  status: true,
  statusCode: 200,
  message: "OTP for GST verification has been sent successfully.",
  data: {
    responseCode: "SRO037",
    gstIn: "LrDZ99I/RC7UGJElYhBrLQ==",
    reservationID: null,
  },
} as unknown as APIResponseEntity;

const gstReportVerifyOtpResponse = {
  status: true,
  statusCode: 200,
  message: "OTP verified successfully",
  data: null,
} as unknown as APIResponseEntity;

const fileAutomatedRequestForItrResponse = {
  status: true,
  statusCode: 200,
  message: "Report downloaded successfully!",
  data: null,
} as unknown as APIResponseEntity;

const generateGstReportResponse = {
  status: true,
  statusCode: 200,
  message: "Report downloaded successfully!",
  data: null,
} as APIResponseEntity;

const generateItrReportResponse = {
  status: true,
  statusCode: 200,
  message: "Report downloaded successfully!",
  data: null,
} as APIResponseEntity;

const getGstReportForLinkApproachResponse = {
  status: true,
  statusCode: 200,
  message: "GST Report downloaded successfully!",
  data: null,
} as APIResponseEntity;

export const getDemoChannelPartnerDetail = async (): Promise<IChannelPartnerDetailResponse> => {
  await wait(DEMO_DELAY_MS);
  return channelPartnerDetailResponse;
};

export const getDemoUpdatePayout = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return updatePayoutResponse;
};

export const getDemoDeleteRole = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return deleteRoleResponse;
};

export const getDemoAddPanForCP = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return addPanForCpResponse;
};

export const updateAadhar = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return updateAadharResponse;
};

export const getDemoGenerateAadharOtp = async (): Promise<IAadharCardResponse> => {
  await wait(DEMO_DELAY_MS);
  return generateAadharOtpResponse;
};

export const getDemoCreateSpPaymentRequest = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return createSpPaymentRequestResponse;
};

export const getDemoUserRightsForUserManagement = async (): Promise<IGetUserRightsForUserManagementResponse> => {
  await wait(DEMO_DELAY_MS);
  return userRightsForUserManagementResponse;
};

export const getDemoSubmitUserRightsForUserManagement = async (): Promise<IGetUserRightsForUserManagementResponse> => {
  await wait(DEMO_DELAY_MS);
  return submitUserRightsForUserManagementResponse;
};

export const getDemoUploadAllDocuments = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return uploadAllDocumentsResponse;
};

export const getDemoDeleteReuploadLoanDocument = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return deleteReuploadLoanDocumentResponse;
};

export const getDemoDeleteUploadRemainingDocuments = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return deleteUploadRemainingDocumentsResponse;
};

export const updateGstDetails = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return updateGstDetailsResponse;
};

export const getDemoMoveDocument = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return moveDocumentResponse;
};

export const getDemoGenerateSubscriptionInvoice = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return generateSubscriptionInvoiceResponse;
};

export const getDemoUpdateLoanApplicationAmount = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return updateLoanApplicationAmountResponse;
};

export const getDemoFileAutomatedRequestForItrUsingLink = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return fileAutomatedRequestForItrUsingLinkResponse;
};

export const getDemoGstReportGenerateOtpUsingLink = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return gstReportGenerateOtpUsingLinkResponse;
};

export const getDemoGstReportViaPasswordUsingLink = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return gstReportViaPasswordUsingLinkResponse;
};

export const getDemoGstReportGenerateOtp = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return gstReportGenerateOtpResponse;
};

export const getDemoGstReportVerifyOtp = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return gstReportVerifyOtpResponse;
};

export const getDemoFileAutomatedRequestForItr = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return fileAutomatedRequestForItrResponse;
};

export const getDemoGenerateGstReport = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return generateGstReportResponse;
};

export const getDemoGenerateItrReport = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return generateItrReportResponse;
};

export const getGstReportForLinkApproach = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return getGstReportForLinkApproachResponse;
};

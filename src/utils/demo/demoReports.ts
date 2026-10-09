// @ts-nocheck
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
import { IAdminAllDataResponse, IAdminDashboardResponse } from "../../interface/adminDashboard";
import {
  IChannelPartnerDetailResponse,
  IChannelPartnerResponse,
} from "../../interface/channelPartner";
import { IAadharCardResponse } from "../../interface/contract";
import { IFetchAllPaymentsResponse } from "../../interface/subscription";
import { IFetchTabWiseUserListingResponse } from "../../interface/subscription";
import { IGetUserRightsForUserManagementResponse } from "../../interface/userManagement";
import { encryptVAPTData } from "../functions/encryptDecrypt";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const nexusCpReportDetailResponse = {
  status: true,

  statusCode: 200,

  message:
    "Channel partner details fetched successfully!",

  data: {
    clientID:
      "00000000-0000-0000-0000-000000000000",

    clientName: null,

    clientCode: null,

    mobileNumber: null,

    email: null,

    channelPartner: null,

    panNumber: null,

    clientReports: [
      {
        name: "GST Report",

        filePath:
          "/assets/images/GST Report.pdf",

        reportType: 5,
      },

      {
        name: "ITR Report",

        filePath:
          "/assets/images/ITR Report.pdf",

        reportType: 4,
      },

      {
        name: "Banking Report",

        filePath:
          "/assets/images/Banking Report.pdf",

        reportType: 3,
      },

      {
        name:
          "Credit Analytics Report",

        filePath:
          "/assets/images/Credit Analytics Report.pdf",

        reportType: 1,
      },

      {
        name:
          "Credit Analytics Report of Partner - DEMO PARTNER ONE",

        filePath:
          "/assets/images/Credit Analytics Report.pdf",

        reportType: 1,
      },

      {
        name:
          "Credit Analytics Report of Partner - DEMO USER TWO",

        filePath:
          "/assets/images/Credit Analytics Report.pdf",

        reportType: 1,
      },

      {
        name:
          "Credit Analytics Report of Partner - DEMO USER FOUR",

        filePath:
          "/assets/images/Credit Analytics Report.pdf",

        reportType: 1,
      },

      {
        name:
          "CAM Report_HL_08de8bd3-7517-4b14-895d-86d153b58721_03/27/2026 09:18:27_DEMO INDUSTRIES PRIVATE LIMITED",

        filePath:
          "/assets/images/CAM_Report_Sample_HL.xlsx",

        reportType: 8,
      },

      {
        name:
          "CAM Report_WC_Secured_08de955e-20ce-444e-888c-8ad06a3b1f1a_04/08/2026 11:01:48_DEMO INDUSTRIES PRIVATE LIMITED",

        filePath:
          "/assets/images/CAM_Report_Sample_WC.xlsx",

        reportType: 8,
      },

      {
        name:
          "CAM Report_LAP_Residential_08de955a-236c-4f99-8f84-c84f7ae8f09d_04/14/2026 10:15:28_DEMO INDUSTRIES PRIVATE LIMITED",

        filePath:
          "/assets/images/CAM_Report_Sample_LAP.xlsx",

        reportType: 8,
      },

      {
        name:
          "CAM Report_UBL_08de9a0f-245d-46d6-8a46-67bacbe62074_04/14/2026 11:10:48_DEMO INDUSTRIES PRIVATE LIMITED",

        filePath:
          "/assets/images/CAM_Report_Sample_UBL.xlsx",

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

const demoItrDetailsResponse: IITRReportResponse = {
  status: true,

  statusCode: 200,

  message:
    "ITR details fetched successfully.",

  data: {
    itrReportDate:
      "2025-10-31T11:40:22.178244",

    itrDetailsList: [
      {
        id:
          "demo-itr-id-001",

        fileName:
          "ITR_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20251031_171022",

        filePath: null,

        retrievedDate:
          "2025-10-31T17:10:22.178244",

        pdfFilePath:
          "/assets/images/ITR Report.pdf",

        excelFilePath:
          "/assets/images/ITR Report_Sample.xlsx",
      },

      {
        id:
          "demo-itr-id-002",

        fileName:
          "ITR_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20251021_135701",

        filePath: null,

        retrievedDate:
          "2025-10-21T13:57:01.145641",

        pdfFilePath:
          "/assets/images/ITR Report.pdf",

        excelFilePath:
          "/assets/images/ITR Report_Sample.xlsx",
      },
    ],
  },
} as IITRReportResponse;

const demoGstDetailsResponse = {
  status: true,

  statusCode: 200,

  message:
    "GST details fetched successfully!",

  data: {
    enableGstReport: true,

    gstNumber:
      "27ABCDE1234F1Z5",

    gstList: [
      {
        id: 220,

        userId:
          "demo-user-id-001",

        gstNo:
          "27ABCDE1234F1Z5",

        dateOfGstRegistration:
          "2025-10-10",

        tradeName:
          "ABC Industries Private Limited",

        gstAddress:
          "Ahmedabad, Gujarat",

        cinOrLLP:
          "U12345GJ2025PTC000001",

        user: null,
      },

      {
        id: 221,

        userId:
          "demo-user-id-001",

        gstNo:
          "24ABCDE1234F1Z2",

        dateOfGstRegistration:
          "2025-11-15",

        tradeName:
          "ABC Trading Division",

        gstAddress:
          "Surat, Gujarat",

        cinOrLLP:
          "U12345GJ2025PTC000002",

        user: null,
      },

      {
        id: 222,

        userId:
          "demo-user-id-001",

        gstNo:
          "29ABCDE1234F1Z8",

        dateOfGstRegistration:
          "2026-01-08",

        tradeName:
          "ABC South Operations",

        gstAddress:
          "Bengaluru, Karnataka",

        cinOrLLP:
          "U12345KA2025PTC000003",

        user: null,
      },
    ],

    gstDetailsList: [
      {
        id:
          "29AAACC1206D2ZB",

        fileName:
          "GST_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20260226_105117",

        pdfFilePath:
          "/assets/images/GST Report.pdf",

        excelFilePath:
          "/assets/images/GST Report_Sample.xlsx",

        retrievedDate:
          "2026-02-26T10:51:11.871114",

        gstFrom:
          "Apr 2023",

        gstTo:
          "Nov 2025",

        gstNumber:
          "27ABCDE1234F1Z5",
      },

      {
        id:
          "29AAACC1206D2ZB",

        fileName:
          "GST_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20251101_150042",

        pdfFilePath:
          "/assets/images/GST Report.pdf",

        excelFilePath:
          "/assets/images/GST Report_Sample.xlsx",

        retrievedDate:
          "2025-11-01T15:00:42.081426",

        gstFrom:
          "Apr 2023",

        gstTo:
          "Sep 2025",

        gstNumber:
          "27ABCDE1234F1Z5, 24ABCDE1234F1Z2",
      },

      {
        id:
          "29AAACC1206D2ZB",

        fileName:
          "GST_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20251101_142842",

        pdfFilePath:
          "/assets/images/GST Report.pdf",

        excelFilePath:
          "/assets/images/GST Report_Sample.xlsx",

        retrievedDate:
          "2025-11-01T14:28:42.549947",

        gstFrom:
          "Apr 2023",

        gstTo:
          "Sep 2025",

        gstNumber:
          "27ABCDE1234F1Z5",
      },

      {
        id:
          "29AAACC1206D2ZB",

        fileName:
          "GST_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20251015_160645",

        pdfFilePath:
          "/assets/images/GST Report.pdf",

        excelFilePath:
          "/assets/images/GST Report_Sample.xlsx",

        retrievedDate:
          "2025-10-15T16:06:45.375995",

        gstFrom:
          "Apr 2023",

        gstTo:
          "Aug 2025",

        gstNumber:
          "29AAACC1206D2ZB, 29AAACC1206D2ZC, 29AAACC1206D2ZD",
      },
    ],
  },
} as unknown as IGSTReportResponse;

const nexusBankingAnalyticsDetailsResponse = {
  status: true,

  statusCode: 200,

  message:
    "Banking Analytics details fetched successfully.",

  data: {
    bankingReportDate: false,

    bankingAnalyticsDetailsList: [
      {
        id:
          "08de868c-b1ab-4ef4-837d-36e47fbd1d50",

        fileName:
          "Banking_Report_ABC_INDUSTRIES_PRIVATE_LIMITED_20260320_195556",

        filePath: null,

        retrievedDate:
          "2026-03-20T19:55:56.378287",

        bankName:
          "HDFC Bank",

        accountType:
          "Current",

        period:
          "01-08-2022 to 31-08-2022",

        pdfFilePath:
          "/assets/images/Banking Report.pdf",

        excelFilePath:
          "/assets/images/Banking Report_Sample.xlsx",
      },
    ],
  },
} as unknown as IBankingAnalyticsReportResponse;

const nexusDocumentStatusResponse = {
  status: true,

  statusCode: 200,

  message:
    "Document status fetched successfully",

  data: [
    {
      documentName:
        "Bank Statements",

      isCarryingFiles: true,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "Loan Documents - Company",

      isCarryingFiles: true,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "KYC - Directors",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "KYC - Company",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "IT Returns - Directors",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "IT Returns - Company",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName: "TAR",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "SAR of Company",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "Loan Documents - Directors",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "GST Returns",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },

    {
      documentName:
        "Property Documents",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: true,
    },

    {
      documentName:
        "Unrecognized",

      isCarryingFiles: false,

      isRequired: false,

      isExclamation: false,

      missingFiles: [],

      isSecure: null,
    },
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
          { fileName: "Subs%#criptionIn(voiceOrbitex Prime CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceOrbitex Prime CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
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
      { fileName: "Subscription Invoice Orbitex Prime CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceOrbitex Prime CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "/assets/images/document_uploaded.pdf" },
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
  return demoItrDetailsResponse;
};

export const getDemoGstDetails = async (): Promise<IGSTReportResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoGstDetailsResponse;
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

const getAdminAllDataResponse = {
  "status": true,
  "statusCode": 200,
  "message": "Admin data fetched successfully!",
  "data": {
    "usersInfo": [
      {
        "name": "Total Channel Partners",
        "userType": 2,
        "count": 169
      },
      {
        "name": "Total Sourcing Partners",
        "userType": 3,
        "count": 29
      },
      {
        "name": "Total Borrowers",
        "userType": 4,
        "count": 296
      }
    ],
    "totalLoanApplications": 562,
    "totalDisbursedApplications": 780,
    "subscriptionDetails": {
      "subscriptionsSold": 49,
      "cumulativeAmount": 1751667.52,
      "creditsProvided": 1904250
    },
    "reportCounts": [
      {
        "name": "Loan Applications",
        "count": 562
      },
      {
        "name": "PDF Credit Reports",
        "count": 78
      },
      {
        "name": "Excel Credit Reports",
        "count": 115
      },
      {
        "name": "PDF ITR Reports",
        "count": 90
      },
      {
        "name": "Excel ITR Reports",
        "count": 159
      },
      {
        "name": "PDF GST Reports",
        "count": 91
      },
      {
        "name": "Excel GST Reports",
        "count": 89
      },
      {
        "name": "PDF Banking Reports",
        "count": 71
      },
      {
        "name": "Excel Banking Reports",
        "count": 205
      },
      {
        "name": "CAM Reports",
        "count": 130
      }
    ],
    "loanTypeApplicationCounts": [
      {
        "loanTypeName": "Home Loan Applications",
        "count": 101
      },
      {
        "loanTypeName": "Personal Loan Applications",
        "count": 35
      },
      {
        "loanTypeName": "Loan against property - Residential Applications",
        "count": 163
      },
      {
        "loanTypeName": "Loan against property - Commercial Applications",
        "count": 87
      },
      {
        "loanTypeName": "CC/OD - CGTMSE Applications",
        "count": 11
      },
      {
        "loanTypeName": "Unsecured Business Loan Applications",
        "count": 33
      },
      {
        "loanTypeName": "Car Loan Applications",
        "count": 10
      },
      {
        "loanTypeName": "CC/OD - Secured Applications",
        "count": 67
      },
      {
        "loanTypeName": "Loan against property - Industrial Applications",
        "count": 28
      },
      {
        "loanTypeName": "Loan against property - Plot Applications",
        "count": 25
      },
      {
        "loanTypeName": "Machinery/Equipment Loan Applications",
        "count": 2
      }
    ]
  }
};

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

export const getAdminAllData =
  async (): Promise<IAdminAllDataResponse> => {
    await wait(DEMO_DELAY_MS);
    return getAdminAllDataResponse;
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

const nbfcLoanMarketplaceResponse = {
  status: true,
  statusCode: 200,
  message: "NBFC Loan market place loaded successfully!",
  data: {
    bankDetails: [
      {
        "bankID": 109,
        "bankName": "NBFC Bank 1",
        "loanAmount": 1193985.0000000000000000000000,
        "emi": 11793.000000000000000000000000,
        "roI_Min": 8.550000000000000000000000000,
        "roI_Max": 10.050000000000000000000000000,
        "tenure": 15.000000000000000000000000000,
        "loanType": "Home Loan",
        "loanTypeID": 1,
        "minCreditScore": 0,
        "bankImage": "https://credstagestorage.blob.core.windows.net/credorbit-dev/BankLogoImages/ICICI-HF-logo.jpg?sv=2025-05-05&se=2026-04-15T12%3A30%3A05Z&sr=b&sp=r&sig=3DtFIHk1WNSS5p3C4PHH43J2f%2BoTKB%2BRwOIfPxH2N7k%3D"
      }
    ],
  },
} as unknown as ILoanMarketResponse;

const applyForLoanResponse = {
  status: true,

  statusCode: 200,

  message:
    "Apply for loan details fetched successfully!",

  data: {
    channelPartnerCode:
      "COCP241101",

    channelPartnerPayoutPercent: 2,

    sourcingPartnerName: null,

    sourcingPartnerPayoutPercent: 0,

    coApplicantsList: [
      {
        id:
          "08de8afd-62f3-4994-8d0f-fd936249a9f5",

        name:
          "DEMO PARTNER ONE",

        firstName:
          "VIKRAM",

        middleName: "",

        lastName:
          "DESAI",

        pan:
          "PARTN4321P",

        aadhaarNumber:
          "XXXX-XXXX-4521",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-6a0b-4388-89f9-1a3cb61e8558",

        name:
          "DEMO USER ONE",

        firstName:
          "AARAV",

        middleName: "",

        lastName:
          "SHARMA",

        pan:
          "PQRSX6789L",

        aadhaarNumber:
          "XXXX-XXXX-9087",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-6bba-4a16-87a3-7cefdc4a60d7",

        name:
          "DEMO USER FOUR",

        firstName:
          "NEHA",

        middleName: "",

        lastName:
          "VERMA",

        pan:
          "TYUIO1234K",

        aadhaarNumber:
          "XXXX-XXXX-5567",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-6f38-4e09-87b7-4b40bbfe8389",

        name:
          "DEMO USER TWO",

        firstName:
          "RIYA",

        middleName: "",

        lastName:
          "MEHTA",

        pan:
          "ASDFG4567H",

        aadhaarNumber:
          "XXXX-XXXX-2234",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-7446-46f3-8533-2db398fac681",

        name:
          "DEMO USER SIX",

        firstName:
          "KARAN",

        middleName: "",

        lastName:
          "MALHOTRA",

        pan:
          "ZXCVB7654N",

        aadhaarNumber:
          "XXXX-XXXX-8890",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-7be1-4134-8dfa-30b711db53e1",

        name:
          "DEMO USER FIVE",

        firstName:
          "NISHA",

        middleName: "",

        lastName:
          "ARORA",

        pan:
          "QWERT0987P",

        aadhaarNumber:
          "XXXX-XXXX-6678",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-8b2e-418a-8c11-c9a4541baff4",

        name:
          "AARUSH PATEL",

        firstName:
          "AARUSH",

        middleName: "",

        lastName:
          "PATEL",

        pan:
          "LKJHG1122M",

        aadhaarNumber:
          "XXXX-XXXX-7788",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-8e5e-4787-8538-3fbd0ef9a9e5",

        name:
          "PRIYA SINGH",

        firstName:
          "PRIYA",

        middleName: "",

        lastName:
          "SINGH",

        pan:
          "MNBVC3344R",

        aadhaarNumber:
          "XXXX-XXXX-1123",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de8afd-b710-4ef9-8852-ce3c16f7c991",

        name:
          "ROHAN GUPTA",

        firstName:
          "ROHAN",

        middleName: "",

        lastName:
          "GUPTA",

        pan:
          "POIUY6677T",

        aadhaarNumber:
          "XXXX-XXXX-3456",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de90a0-d788-4ff6-82ce-25c363c59baf",

        name:
          "ANANYA SHAH",

        firstName:
          "ANANYA",

        middleName: "",

        lastName:
          "SHAH",

        pan:
          "GHJKL8899W",

        aadhaarNumber:
          "XXXX-XXXX-4567",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de90a0-dfd7-4f41-8d66-883df7bdb523",

        name:
          "VEDANT JOSHI",

        firstName:
          "VEDANT",

        middleName: "",

        lastName:
          "JOSHI",

        pan:
          "BNMAS5544X",

        aadhaarNumber:
          "XXXX-XXXX-9981",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de9956-ff7d-4dbe-88ee-0167cfd2bca4",

        name:
          "RITIKA KHANNA",

        firstName:
          "RITIKA",

        middleName: "",

        lastName:
          "KHANNA",

        pan:
          "CVBNM7788Q",

        aadhaarNumber:
          "XXXX-XXXX-7812",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },

      {
        id:
          "08de99e5-5265-4696-85d7-129fd8a235c0",

        name:
          "ARJUN MEHRA",

        firstName:
          "ARJUN",

        middleName: "",

        lastName:
          "MEHRA",

        pan:
          "TREWA2233S",

        aadhaarNumber:
          "XXXX-XXXX-6734",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: null,

        gender: null,

        creditScore: null,
      },
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
    packageZipUrl:
      "/assets/images/document_uploaded.pdf",

    loanDetails: {
      loanType: "Home Loan",

      loanTypeId: 1,

      loanAmount: 5000000,

      loanTenure: 15,

      loanPurpose:
        "Business expansion",

      name:
        "HDFC Home Finance",

      managerEmail:
        "rm.demo@example.com",

      loanApplicationCode:
        "COLA260423",
    },

    applicantInfo: {
      fullName:
        "DEMO INDUSTRIES PRIVATE LIMITED",

      phoneNumber:
        "9000000001",

      email:
        "nexustest@yopmail.com",

      code: "COCU251003",

      id:
        "08de0598-4bee-48ca-8a7c-005b36583e79",
    },

    cpInfo: {
      fullName:
        "Demo Prime CP",

      phoneNumber:
        "9000000002",

      email:
        "partner.demo@example.com",

      code: "COCP241101",

      id:
        "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
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

export const getDemoNBFCLoanMarketplace =
  async (): Promise<ILoanMarketResponse> => {
    await wait(DEMO_DELAY_MS);
    return nbfcLoanMarketplaceResponse;
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
      { displayName: "Sanctioned Applications", displayOrder: 4, amount: 111020000, noOfApplications: 102, formattedAmount: "10.59 Cr+", statusID: 4 },
      { displayName: "Pending at Credit Applications", displayOrder: 5, amount: 51800000, noOfApplications: 4, formattedAmount: "5.18 Cr+", statusID: 5 },
      { displayName: "Disbursed Applications", displayOrder: 6, amount: 105930000, noOfApplications: 117, formattedAmount: "11.10 Cr+", statusID: 6 },
      { displayName: "Rejected Applications", displayOrder: 7, amount: 1515000, noOfApplications: 2, formattedAmount: "15.15 Lac+", statusID: 7 },
    ],
    usersInfo: [
      { name: "Total Channel Partners", count: 168, userType: 2 },
      { name: "Total Sourcing Partners", count: 28, userType: 3 },
      { name: "Total Borrowers", count: 284, userType: 4 },
    ],
    demographicsData: [
      { state: "GUJARAT", noOfLoanApplications: 358 },
      { state: "West Bengal", noOfLoanApplications: 47 },
      { state: "Gota", noOfLoanApplications: 6 },
      { state: "BIHAR", noOfLoanApplications: 1 },
      { state: "MAHARASTRA", noOfLoanApplications: 1 },
      { state: "Maharashtra", noOfLoanApplications: 1 },
      { state: "Rajasthan", noOfLoanApplications: 4 },
      { state: "MADHYA PRADESH", noOfLoanApplications: 1 },
      { state: "UTTAR PRADESH", noOfLoanApplications: 1 },
      { state: "TAMIL NADU", noOfLoanApplications: 3 },
      { state: "DELHI", noOfLoanApplications: 3 },
      { state: "Odisha", noOfLoanApplications: 27 },
      { state: "Nagaland", noOfLoanApplications: 1 },
    ],
  },
} as IAdminDashboardResponse;

const demoChannelPartnerListingResponse = {
  status: true,
  statusCode: 200,
  message:
    "List of channel partners fetched successfully!",
  data: {
    totalCount: 10,

    channelPartnerList: [
      {
        id:
          "demo-cp-001",

        name:
          "ABC INDUSTRIES PRIVATE LIMITED",

        code:
          "DEMOCP260401",

        registeredDate:
          "2026-04-13T16:30:28.08216",

        mobileNumber:
          encryptVAPTData("9000000001"),

        noOfRegisteredSP: 2,

        activeCredits: 12000,

        reservedCredits: 500,

        isActive: true,
      },

      {
        id:
          "demo-cp-002",

        name:
          "XYZ BUSINESS SOLUTIONS LLP",

        code:
          "DEMOCP260305",

        registeredDate:
          "2026-03-30T18:08:34.803455",

        mobileNumber:
          encryptVAPTData("9000000002"),

        noOfRegisteredSP: 1,

        activeCredits: 8000,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-cp-003",

        name:
          "MNO USER",

        code:
          "DEMOCP260301",

        registeredDate:
          "2026-03-05T13:29:13.693867",

        mobileNumber:
          encryptVAPTData("9000000003"),

        noOfRegisteredSP: 0,

        activeCredits: 5000,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-cp-004",

        name:
          "DEF INDUSTRIES PRIVATE LIMITED",

        code:
          "DEMOCP260103",

        registeredDate:
          "2026-01-12T16:04:26.812731",

        mobileNumber:
          encryptVAPTData("9000000004"),

        noOfRegisteredSP: 3,

        activeCredits: 18500,

        reservedCredits: 250,

        isActive: true,
      },

      {
        id:
          "demo-cp-005",

        name:
          "GLOBAL TECH ENTERPRISES",

        code:
          "DEMOCP251204",

        registeredDate:
          "2025-12-25T10:15:16.940279",

        mobileNumber:
          encryptVAPTData("9000000005"),

        noOfRegisteredSP: 1,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-cp-006",

        name:
          "PQR FINCORP LLP",

        code:
          "DEMOCP251203",

        registeredDate:
          "2025-12-22T15:19:28.805656",

        mobileNumber:
          encryptVAPTData("9000000006"),

        noOfRegisteredSP: 0,

        activeCredits: 2500,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-cp-007",

        name:
          "OPQ USER",

        code:
          "DEMOCP251202",

        registeredDate:
          "2025-12-16T14:40:31.618771",

        mobileNumber:
          encryptVAPTData("9000000007"),

        noOfRegisteredSP: 2,

        activeCredits: 9200,

        reservedCredits: 1200,

        isActive: true,
      },

      {
        id:
          "demo-cp-008",

        name:
          "NEXUS CONSULTANCY SERVICES",

        code:
          "DEMOCP251201",

        registeredDate:
          "2025-12-01T19:49:08.993863",

        mobileNumber:
          encryptVAPTData("9000000008"),

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-cp-009",

        name:
          "SKYLINE INFRA ENTERPRISES",

        code:
          "DEMOCP251102",

        registeredDate:
          "2025-11-24T11:42:45.300694",

        mobileNumber:
          encryptVAPTData("9000000009"),

        noOfRegisteredSP: 4,

        activeCredits: 15000,

        reservedCredits: 300,

        isActive: true,
      },

      {
        id:
          "demo-cp-010",

        name:
          "ORBITEX CAPITAL CONSULTANTS LLP",

        code:
          "DEMOCP250915",

        registeredDate:
          "2025-09-26T11:56:55.352455",

        mobileNumber:
          encryptVAPTData("9000000010"),

        noOfRegisteredSP: 1,

        activeCredits: 4500,

        reservedCredits: 0,

        isActive: true,
      },
    ],
  },
};

const demoAdminChannelPartnerReportResponse = {
  status: true,

  statusCode: 200,

  message:
    "Channel partner report fetched successfully!",

  data: {
    totalCount: 10,

    channelPartnersQueue: [
      {
        cpID:
          "demo-cp-001",

        cpCode:
          "DEMOCP260401",

        cpName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        spCount: 2,

        clientsCount: 8,

        totalLoan: 14,

        totalAmount: 125000000,
      },

      {
        cpID:
          "demo-cp-002",

        cpCode:
          "DEMOCP260305",

        cpName:
          "XYZ BUSINESS SOLUTIONS LLP",

        spCount: 1,

        clientsCount: 5,

        totalLoan: 7,

        totalAmount: 58000000,
      },

      {
        cpID:
          "demo-cp-003",

        cpCode:
          "DEMOCP260301",

        cpName:
          "NICE WAY REAL MARKETING",

        spCount: 0,

        clientsCount: 2,

        totalLoan: 3,

        totalAmount: 22000000,
      },

      {
        cpID:
          "demo-cp-004",

        cpCode:
          "DEMOCP260103",

        cpName:
          "GLOBAL FINCORP CONSULTANCY",

        spCount: 3,

        clientsCount: 14,

        totalLoan: 26,

        totalAmount: 315000000,
      },

      {
        cpID:
          "demo-cp-005",

        cpCode:
          "DEMOCP251204",

        cpName:
          "SHREEJI FINCORP",

        spCount: 1,

        clientsCount: 4,

        totalLoan: 5,

        totalAmount: 45000000,
      },

      {
        cpID:
          "demo-cp-007",

        cpCode:
          "DEMOCP251202",

        cpName:
          "ORBITEX CONSULTANCY SERVICES",

        spCount: 2,

        clientsCount: 11,

        totalLoan: 18,

        totalAmount: 198500000,
      },

      {
        cpID:
          "demo-cp-008",

        cpCode:
          "DEMOCP251201",

        cpName:
          "SKYLINE INFRA ENTERPRISES",

        spCount: 1,

        clientsCount: 6,

        totalLoan: 9,

        totalAmount: 76000000,
      },
    ],
  },
};

const adminGeographicalReportResponse = {
  status: true,
  statusCode: 200,
  message: "Geographical report fetched successfully!",
  data: {
    list: [
      { state: "Tamil Nadu", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "GUJARAT", cpCount: 23, spCount: 5, clientsCount: 52, totalLoan: 44, totalAmount: 10331160000 },
      { state: "Punjab", cpCount: 2, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "Rajasthan", cpCount: 2, spCount: 0, clientsCount: 2, totalLoan: 0, totalAmount: 0 },
      { state: "Meghalaya", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
      { state: "Maharashtra", cpCount: 3, spCount: 1, clientsCount: 1, totalLoan: 1, totalAmount: 1500000 },
      { state: "Madhya Pradesh", cpCount: 1, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "Ladakh", cpCount: 3, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "Uttar Pradesh", cpCount: 1, spCount: 0, clientsCount: 0, totalLoan: 0, totalAmount: 0 },
      { state: "Telangana", cpCount: 0, spCount: 0, clientsCount: 1, totalLoan: 0, totalAmount: 0 },
    ],

    totalCount: 48,

    stateList: [
      "Tamil Nadu",
      "GUJARAT",
      "Punjab",
      "Rajasthan",
      "Meghalaya",
      "Maharashtra",
      "Madhya Pradesh",
      "Ladakh",
      "Uttar Pradesh",
      "Telangana",
      "Kerala",
      "Tripura",
      "Jammu and Kashmir",
      "Karnataka",
      "Jharkhand",
      "Himachal Pradesh",
      "Bihar",
      "Haryana",
      "Assam",
      "Chhattisgarh",
      "Arunachal Pradesh",
      "Uttarakhand",
      "Andhra Pradesh",
      "West Bengal",
      "Undefined",
      "Gujarat",
      "",
      "Delhi",
      "Test",
      "Gota",
      "BIHAR",
      "MAHARASTRA",
      "Ahmedabad",
      "Gujrat ",
      "Gujarat ",
      "Bagodara",
      "GUJRAT",
      "MADHYA PRADESH",
      "MAHARASHTRA",
      "RAJASTHAN",
      "UTTAR PRADESH",
      "UTTARAKHAND",
      "TAMIL NADU",
      "PUNJAB",
      "DELHI",
      "Odisha",
      "Nagaland",
    ],
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
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 23600.0, creditPoints: 25000, dateTime: "2026-04-13T18:27:46.594246", paymentLinkID: 208, razorpayLinkID: "plink_Scz8oW1hsjRLBH", planName: "Custom Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "DEMO PRIMARY USER", userType: 4, amount: 588.82, creditPoints: 500, dateTime: "2026-04-13T17:18:42.393527", paymentLinkID: 207, razorpayLinkID: "plink_ScxxBC3QaUQKJm", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 5898.82, creditPoints: 6000, dateTime: "2026-04-01T19:26:36.49692", paymentLinkID: 206, razorpayLinkID: "plink_SYFj3f45LALOGU", planName: "Power Pack Plan", paymentStatus: "Failed", colorCode: "#dc3545" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 11798.82, creditPoints: 12000, dateTime: "2026-04-01T19:15:58.325381", paymentLinkID: 205, razorpayLinkID: "plink_SYFYH18Hk3qHGf", planName: "Max Saver Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 2358.82, creditPoints: 2200, dateTime: "2026-04-01T17:34:55.972106", paymentLinkID: 204, razorpayLinkID: "plink_SYDpXxWRfIjYSb", planName: "Value Plus Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 2358.82, creditPoints: 2200, dateTime: "2026-04-01T17:19:05.009716", paymentLinkID: 203, razorpayLinkID: "plink_SYDWAZku64oKzC", planName: "Value Plus Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-04-01T16:44:36.774228", paymentLinkID: 202, razorpayLinkID: "plink_SYCyORyRygnNLQ", planName: "Kickstart Plan", paymentStatus: "Created", colorCode: "#17a2b8" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-04-01T16:43:49.071867", paymentLinkID: 201, razorpayLinkID: "plink_SYCx86fJZYRH5i", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-03-31T18:57:50.383813", paymentLinkID: 200, razorpayLinkID: "plink_SXqao4rR0dojFF", planName: "Kickstart Plan", paymentStatus: "Paid", colorCode: "#28a745" },
      { userName: "DEMO PRIMARY USER", userType: 2, amount: 588.82, creditPoints: 500, dateTime: "2026-03-31T16:31:14.333059", paymentLinkID: 199, razorpayLinkID: "plink_SXnhCj285qnbwt", planName: "Kickstart Plan", paymentStatus: "Expired", colorCode: "#dc3545" },
    ],
  },
} as IFetchAllPaymentsResponse;

export const getDemoAdminDashboard = async (): Promise<IAdminDashboardResponse> => {
  await wait(DEMO_DELAY_MS);
  return adminDashboardResponse;
};

export const getDemoChannelPartnerListing = async (): Promise<IChannelPartnerResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoChannelPartnerListingResponse;
};

export const getDemoAdminChannelPartnerReport = async (): Promise<any> => {
  await wait(DEMO_DELAY_MS);
  return demoAdminChannelPartnerReportResponse;
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
      { id: "08dddf16-f7ed-42f5-82ba-a2db74dbe6bb", fullName: "DEMO PRIMARY USER", email: "7GXoQbDwZRA+tc8d8f8cVMMQJgWXh461lhD7RAVZtTY=", panNumber: "yMxMPliigDtX5/toz6v+xQ==", phoneNumber: "vO5BMExR9EM6qawgtekoVg==", code: "COCU250833" },
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
    userEmail: "demouser@yopmail.com",
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

  message:
    "File(s) uploaded and processed successfully!",

  data: [
    {
      documentType:
        "Unstructured",

      documentTypeID: null,

      extractedText:
        "GSTR Analysis Report - DEMO INDUSTRIES PRIVATE LIMITED\nPAN: DEMOP1234D\nGSTIN: 27DEMOP1234D1Z5\nPeriod From: Apr 2023\nPeriod To: Dec 2025\nState of Operations: Gujarat\nOverview of GST Returns, business breakup, monthly sale and purchase, top customers, top suppliers, HSN summary, statewise sale and purchase, circular transactions, and other OCR-extracted GST analytics sections.",

      extractedDate:
        "2022-01-08T00:00:00",
    },

    {
      documentType:
        "BankStatements",

      documentTypeID: null,

      extractedText:
        "Banking Statement Analysis Report\nFor DEMO INDUSTRIES PRIVATE LIMITED\nGenerated on 20 Mar 2026 19:56\nBank: HDFC Bank\nAccount No.: 50200045871234\nPeriod: 01-08-2022 to 31-08-2022\nOpening Balance: -19,576,223.92\nClosing Balance: -18,285,356.92\nIncludes banking transaction snapshot, average balances, top debit and credit transactions, cyclic transactions, exceptional transactions, customer summary, supplier summary, and cash flow analysis.",

      extractedDate:
        "2022-01-08T00:00:00",
    },

    {
      documentType:
        "PropertyDocument",

      documentTypeID: null,

      extractedText:
        "Equifax Score: 808\nName: DEMO PARTNER ONE\nPAN: PARTN4321P\nTotal Accounts: 2\nActive Accounts: 2\nTotal Outstanding Balance: 1434\nRecent Account Open Date: 15-10-2024\nOldest Account Open Date: 30-08-2023\nActive credit card accounts reported from SBI Cards and HDFC Bank. No DPD, no settlements, and no write-offs recorded.",

      extractedDate: null,
    },

    {
      documentType:
        "PropertyDocument",

      documentTypeID: null,

      extractedText:
        "Credit Report\nFor DEMO PARTNER ONE\nGenerated on 21 Nov 2025 10:10\nEquifax Score: 808\nActive Accounts: 2\nOverdue Accounts: 0\nTotal Outstanding Balance: 1,434.00\nLenders: HDFC Bank Limited and SBI Cards and Payment Services Limited\nIncludes general info, account summary, repayment obligations, enquiries, appendix, and loan analysis.",

      extractedDate: null,
    },

    {
      documentType:
        "PropertyDocument",

      documentTypeID: null,

      extractedText:
        "Equifax Score: 801\nName: DEMO PARTNER ONE\nPAN: PARTN4321P\nTotal Accounts: 2\nActive Accounts: 2\nTotal Outstanding Balance: 4479\nRecent Account Open Date: 15-10-2024\nOldest Account Open Date: 30-08-2023\nUpdated bureau extract showing HDFC Bank credit card limit of 204000 and SBI Card limit of 60000 with zero overdue.",

      extractedDate: null,
    },

    {
      documentType:
        "LoanStatement",

      documentTypeID: null,

      extractedText:
        "Credit Bureau Report\nFor DEMO PARTNER ONE\nGenerated on 26 Mar 2026 12:14\nEquifax Score: 801\nActive Accounts: 2\nOverdue Accounts: 0\nTotal Outstanding Balance: 4,479.00\nDetailed active loan summary includes HDFC Bank Limited and SBI Cards and Payment Services Limited credit card accounts, repayment obligations, loan enquiries, delayed payment analysis, and appendix definitions.",

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
import { APIResponseEntity } from "./apiResponse";
import { IDocumentListDetailData } from "./document";
import { ILogoutResponse } from "./logout";

export interface ILoanParams {
  loanAppID: string;
}

export interface ILoanResponse extends APIResponseEntity {
  data: ILoanDetailData;
}

export interface ILoanDetailData {
  loanApplicationCode: string;
  loanApplicationID: string;
  bankName: string | null;
  loanType: string;
  loanAmount: number;
  disbursedAmount: number;
  sanctionedAmount: number;
  loanAppiedDate: string;
  loanSanctionedDate: string;
  loanDisbursedDate: string;
  sanctionLetterUrl: string;
  rateOfInterest: number;
  coApplicantName1: string;
  coApplicantName2: string;
  referenceName1: string;
  referenceName2: string;
  uploadedDocuments: IDocumentListDetailData[];
  status: {
    label: string;
    color: string;
    statusID: number;
  };
  loanDisbursementcomments: string[];
  loanSanctioncomments: string;
  disbursedHistory: [
    {
      loanDisbursedDate: string;
      disbursedAmount: number;
      loanDisbursementComment: string;
    }
  ];
}

export interface ILoanTypeListResponse extends APIResponseEntity {
  data: ILoanTypeListData;
}

export interface ILoanTypeListData {
  loanTypes: ILoanTypeData[];
  unitOptions: ILoanUnitOptions[];
  industryOptions: ILoanIndustryOptions[];
  professionOptions: ILoanProfessionOptions[];
}
export interface ILoanTypeData {
  loanTypeId: number;
  loanTypeName: string;
  displayName: string;
  displayOrder: number;
  isSecuredLoan: number;
  isMarketValueRequired: boolean;
  loanTenure?: {
    loanTenureID: number;
    loanTenureInYears: number;
  }[];
}

export interface ILoanUnitOptions {
  id: number;
  displayName: string;
}

export interface ILoanIndustryOptions {
  id: number;
  displayName: string;
}

export interface ILoanProfessionOptions {
  id: number;
  displayName: string;
}

export interface IUpdateLoanStatus {
  loanApplicationID: string;
  statusID?: number;
  loanJourneyStatus?: number;
  sanctionedDate?: string;
  sanctionedAmount?: string;
  sanctionLetterPath?: string;
  disbursedDate?: string;
  disbursedAmount?: string;
  comments?: string;
}

export interface IUpdateLoanStatusResponse extends APIResponseEntity {
  data: ILogoutResponse | string;
}

export interface BorrowerType {
  id: number;
  displayName: string;
}

export interface IMultiDSACodeListResponse extends APIResponseEntity {
  data: IMultiDSACodeData[];
}

export interface IMultiDSACodeData {
  id: number;
  loanTypeeid: number;
  loanTypeName: string;
  userid: string;
  userName: string;
  dsaCode: string;
  payoutPercentage: number;
  remainingPayoutPercentage: number;
}

export interface ISaveMultiDSACodeBody {
  records: ISaveMultiDSACodeData[];
}

export interface ISaveMultiDSACodeData {
  id: number;
  loanTypeeid: number;
  dsaCode: string;
  payoutPercentage: number;
}

export interface IGetLoanDetailForNBFCResponse extends APIResponseEntity {
  data: IGetLoanDetailForNBFCResponseData;
}

export interface IGetLoanDetailForNBFCResponseData {
  loanApplicationID: string;
  studentDetail: INBFCStudentDetail;
  courseLoanRequest: ICourseLoanRequest;
  kfsDetails: IKFSDetails;
  uploadedDocumentsByInstitute: IUploadedDocument[];
  actionCenter: IActionCenterStatus[];
  activityLog: IActivityLog[];
  loanSummary: ILoanSummary;
  repaymentSchedule: IRepaymentSchedule[];
  loanDocuments: ILoanDocument[];
}

export interface INBFCStudentDetail {
  studentID: string;
  studentCode: string;
  name: string;
  photo: string;
  loanApplicationCode: string;
  courseName: string;
  instituteName: string;
  instituteTradeName: string | null;
  disbursedDate: string | null;
  utrNumber: string;
}

export interface ICourseLoanRequest {
  courseId: string;
  courseName: string;
  courseFee: number;
  tenure: number;
  loanRequestedAmount: number;
}

export interface IKFSDetails {
  agreedFee: number;
  discountAmount: number;
  downPayment: number;
  totalLoanAmount: number;
  numbersOfEMI: number;
  advancedEMI: number;
  remainingEMI: number;
  emiAmount: number;
}

export interface IUploadedDocument {
  documentType: string;
  documentName: string;
  filePath: string;
  uploadedDate: string | null;
}

export interface IActionCenterStatus {
  statusId: number;
  statusName: string;
  isCompleted: boolean;
  statusUpdatedDate: string | null;
}

export interface IActivityLog {
  id: string;
  eventDate: string;
  eventType: string;
  eventDescription: string | null;
  userName: string;
}

export interface ILoanSummary {
  loanAmount: number;
  interestRate: number | null;
  emiAmount: number;
  enachMandate: boolean;
  totalEMI: number;
  paidEMI: number;
  outstandingAmount: number | null;
}

export interface IRepaymentSchedule {
  [key: string]: unknown;
}

export interface ILoanDocument {
  [key: string]: unknown;
}
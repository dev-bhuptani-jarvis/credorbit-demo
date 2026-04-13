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
  statusID: number;
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

import { APIResponseEntity } from "./apiResponse";

export interface ILoanMarketPlacePayload {
  loanAppID: string;
}

export interface ILoanMarketResponse extends APIResponseEntity {
  data: ILoanMarketResponseData;
}

export interface ILoanMarketResponseData {
  bankDetails: ILoanMarketBankDetails[] | null;
  camReportPath: string;
}

export interface ILoanMarketBankDetails {
  bankImage: string;
  bankID: number;
  bankName: string;
  loanAmount: number;
  emi: number;
  roI_Min: number;
  roI_Max: number;
  tenure: number;
  loanType: string;
  loanTypeID: number;
  minCreditScore: number;
}

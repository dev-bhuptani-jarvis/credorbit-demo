import { APIResponseEntity } from "./apiResponse";

export interface IGSTGenerateOTPBody {
  gstin: string;
  userName: string;
}

export interface IGSTGenerateOTPResponse extends APIResponseEntity {
  data: { gstin: string; responseCode: string };
}

export interface IGSTVerifyOTPBody {
  gstin: string;
  otp: string;
}

export interface IGSTValidateReportBody {
  gstinList: string[];
}


export interface IGSTCredentials {
  gstNumber: string;
  userName: string;
  otp: string;
}
import { APIResponseEntity } from "./apiResponse";

export interface IRefferalData {
    referredName: string,
    referralCode: string,
    status: string,
    referredDate: string
}

export interface IRefferalListingResponse extends APIResponseEntity {
    data: IRefferalData[];
}

export interface IWalletData {
    date: string,
    transactionType: string,
    points: number,
    description: string
}

export interface IIsProceedForCamReportEntity {
    isProceedForCamReport: false,
    reports: IIsProceedForReportEntity[]
}

export interface IIsProceedForReportEntity {
    reportType: string,
    status: string
}

export interface IWalletListingResponse extends APIResponseEntity {
    data: IWalletData[];
}

export interface IRefferalDataResponse extends APIResponseEntity {
    data: number;
}

export interface IRefferalCodeResponse extends APIResponseEntity {
    data: string | null;
}

export interface IRefferalCodeResponse extends APIResponseEntity {
    data: string | null;
}

export interface IIsProceedForCamReportResponse extends APIResponseEntity {
    data: IIsProceedForCamReportEntity | IIsProceedForGeneratingReport;
}

export interface IIsProceedForGeneratingReport {
    isInProgress: boolean,
    reportType: number
}

export interface IIsProceedForCreditReportResponse extends APIResponseEntity {
    data: IIsProceedForGeneratingCreditReport;
}

export interface IIsProceedForGeneratingCreditReport {
    isConsentRequired: boolean,
    reservationId: string,
}

import { APIResponseEntity } from "./apiResponse";
import { ILoanDetailData } from "./loanDetail";

export interface IGetAllLeadParams {
    page: number;
    pageSize: number;
    leadUserId?: string;
    search?: string;
    leadStatusId?: number;
    loanTypeId?: number;
}

export interface ILeadListItem {
    leadID: string;
    loanType: string;
    mobileNumber: string;
    emailAddress: string;
    panNumber: string | null;
    loanTypeId: number;
    userName: string;
    leadStatusId: number;
    leadStatus: string;
    createdDate: string;
    lastEdited: string | null;
}

export interface IGetAllLeadResponse extends APIResponseEntity {
    data: {
        totalCount: number;
        leads: ILeadListItem[]
    }
}

export interface IGetAllLeadDetailResponse extends APIResponseEntity {
    data: IGetAllLeadDetailResponseData
}

export interface IGetAllLeadDetailResponseData {
    leadID: string,
    loanType: string,
    mobileNumber: string,
    emailAddress: string,
    panNumber: string | null,
    userName: string,
    leadStatusId: number,
    leadStatus: string,
    createdDate: string,
    lastEdited: string,
    loanApplicationDetail: ILoanDetailData
}
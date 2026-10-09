import { APIResponseEntity } from "./apiResponse";

export interface IListAllApplicationsResponse extends APIResponseEntity {
    data: IListAllApplicationsResponseData;
}

export interface IListAllApplicationsResponseData {
    totalLoanApplications: number;
    loanApplications: ILoanApplication[];
    totalCountByStatus: IApplicationStatusCount[];
}

export interface ILoanApplication {
    loanApplicationID: string;
    disbursementId: string;
    loanApplicationCode: string;
    bankName: string | null;
    loanType: string;
    loanTypeID: number;
    date: string;
    sanctionedDate: string | null;
    disbursedDate: string | null;
    loanAmount: number;
    sanctionedLoanAmount: number | null;
    disbursedLoanAmount: number | null;
    sanctionLetterUrl: string | null;
    raisedQuery: string | null;
    customerName: string;
    userID: string;
    progressPercent: number;
    loanJourneyStatus: number;
    isCamReportGenerated: boolean;
    assignedUserDetails: IAssignedUserDetails | null;
    status: ILoanApplicationStatus;
}

export interface ILoanApplicationStatus {
    label: string;
    color: string;
    statusID: number;
}

export interface IAssignedUserDetails {
}

export interface IApplicationStatusCount {
    displayName: string;
    displayOrder: number;
    amount: number;
    noOfApplications: number;
    formattedAmount: string;
    statusID: number;
}
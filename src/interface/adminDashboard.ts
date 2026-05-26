import { APIResponseEntity } from "./apiResponse";

export interface IAdminDashboardResponse extends APIResponseEntity {
  data: IAdminDashboardData;
}

export interface IAdminDashboardData {
  totalCountByStatus: ITotalCountByStatus[];
  usersInfo: ITotalNoOfUsers[];
  demographicsData: IDemographicsData[];
}

export interface ITotalCountByStatus {
  displayName: string;
  displayOrder?: number;
  amount: number;
  noOfApplications: number;
  formattedAmount: string | null;
  statusID: number;
}

interface IDemographicsData {
  state: string;
  noOfLoanApplications: number;
}

export interface ITotalNoOfUsers {
  name: string;
  count: number;
  userType: number;
}

export interface IAdminDashboardFilterBody {
  filterType: number;
  startDate?: string;
  endDate?: string;
}

export interface IAdminAllDataResponse extends APIResponseEntity {
  data: IAdminAllData;
}

export interface IAdminAllData {
  usersInfo: ITotalNoOfUsers[];
  totalLoanApplications: number;
  subscriptionDetails: ISubscriptionDetails;
  reportCounts: IReportCounts[];
  loanTypeApplicationCounts: ILoanTypeApplicationCount[];
}

export interface ILoanTypeApplicationCount {
  loanTypeName: string;
  count: number;
}

export interface IReportCounts {
  name: string;
  count: number;
}

export interface ISubscriptionDetails {
  subscriptionsSold: number;
  cumulativeAmount: number;
  creditsProvided: number;
}

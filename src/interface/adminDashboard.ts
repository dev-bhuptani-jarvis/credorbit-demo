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

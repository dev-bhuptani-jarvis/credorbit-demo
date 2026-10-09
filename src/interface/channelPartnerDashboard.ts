import { ITotalCountByStatus } from "./adminDashboard";
import { APIResponseEntity } from "./apiResponse";
import { ILoanApplicationData } from "./client";

export interface IChannelPartnerDashboardResponse extends APIResponseEntity {
  data: IChannelPartnerDashboardData;
}

export interface IChannelPartnerDashboardData {
  totalLoanApplicationsCountByStatus: ITotalCountByStatus[];
  loanApplicationStatusGraphList: LoanApplicationStatusGraph[];
  isAddApplicationEnabled: boolean;
  userDetails?: {
    contractEnforcementDate: string;
    emailID: string;
    isContractSigned: boolean;
    profilePicture: string;
    showPanDetailPopUp: boolean;
    userName: string;
  };
}

export interface LoanApplicationStatusGraph {
  statusID: number;
  status: string;
  percentageValue: number;
  color: string;
}

export interface ILoanApplicationParams {
  userType: number;
  page: number;
  pageSize: number;
  userID: string;
  search?: string;
  statusFilter?: string;
  parentUserId?: string;
}

export interface IGetAllLoanApplicationsResponse extends APIResponseEntity {
  data: IGetAllLoanApplicationsData;
}

export interface IGetAllLoanApplicationsData {
  totalLoanApplications: number;
  loanApplications: ILoanApplicationData[];
  totalCountByStatus: ITotalCountByStatusFilter[];
}

export interface IStatus {
  label: string;
  color: string;
  statusID?: number;
}

export interface ITotalCountByStatusFilter {
  displayName: string;
  displayOrder: number;
  amount: number;
  noOfApplications: number;
  formattedAmount: string;
  statusID: number;
}

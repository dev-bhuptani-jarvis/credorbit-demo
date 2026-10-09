import { APIResponseEntity } from "./apiResponse";
import { IStatus } from "./channelPartnerDashboard";

export interface IAdminDashboardResponse extends APIResponseEntity {
  data: IAdminDashboardData;
}

export interface IAdminDashboardData {
  totalCountByStatus: ITotalCountByStatus[];
  usersInfo: ITotalNoOfUsers[];
  demographicsData: IDemographicsData[];
  disbursementTrend: IAdminDisbursementTrend;
  rewardsAndReferrals?: IAdminRewardsAndReferrals;
  topCitiesByLoanApps: IAdminTopCityByLoanApps[];
  recentApplications: IRecentApplicationAdmin[];
  newlyOnboardedPartners: INewlyOnboardedPartnersAdmin[];
}

export interface IAdminDisbursementTrend {
  overallTrend: IAdminDisbursementTrendItem[];
  cpWiseTrend?: IAdminDisbursementTrendItem[];
  masterCpWiseTrend?: IAdminDisbursementTrendItem[];
}

export interface IAdminRewardsAndReferrals {
  pointsIssued: number | null;
  pointsRedeemed: number | null;
  referrals: number | null;
}

export interface IAdminDisbursementTrendItem {
  displayName: string;
  displayOrder: number;
  sanctionedAmount: number;
  formattedSanctionedAmount: string;
  disbursedAmount: number;
  formattedDisbursedAmount: string;
  sanctionCount: number;
  disbursementCount: number;
}

export interface IAdminTopCityByLoanApps {
  state: string;
  city: string;
  totalApps: number;
  totalSanctionedAmount: number;
  formattedTotalSanctionedAmount: string;
  totalDisbursedAmount: number;
  formattedTotalDisbursedAmount: string;
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
  filterType?: number;
  startDate?: string;
  endDate?: string;
  dashboardType?: number;
}

export interface IIDisbursementTrendDataFilterBody {
  filterType: number;
  year?: number;
}

export interface IDashboardReportNavigationState {
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

export interface IRecentApplicationAdmin {
  appCode: string;
  borrower: string;
  product: string;
  amount: number;
  formattedAmount: string;
  partner: string;
  status: IStatus;
  tat: string | null;
}

export interface INewlyOnboardedPartnersAdmin {
  partnerCode: string;
  name: string;
  type: string;
  city: string;
}

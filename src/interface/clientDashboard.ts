import { ILoanApplicationData } from "./client";
import { APIResponseEntity } from "./apiResponse";
import { ITotalCountByStatus } from "./adminDashboard";
import { IClientDetailList, IExternalReportData, IGSTList } from "./reports";

export interface IClientDashboardResponse extends APIResponseEntity {
  data: IClientDashboardData;
}

export interface IClientDashboardData {
  creditScore: number | null;
  maxCreditScore: number;
  creditReportDate: string | null,
  bankingReportDate: string | null,
  itrReportDate: string | null,
  gstReportDate: string | null,
  rocReportDate: string | null,
  cfoReportDate: string | null,
  creditScoreRefetchedDays?: number;
  incomeTaxRefetchedDays?: number;
  loanApplicationList: ILoanApplicationData[];
  gstNumber: string | null;
  totalLoanApplicationsCountByStatus: ITotalCountByStatus[];
  reports: IClientDetailList[];
  gstList: IGSTList[];
  partners: IPartnerScore[];
  gstReportRefetchedDays?: number;
}

export interface ICreditAnalyticsResponse extends APIResponseEntity {
  data: number | IExternalReportData;
}

export interface IPartnerScore {
  aadhaarNumber: string;
  address: string;
  city: string | null;
  creditScore: number | null;
  dateOfBirth: string;
  firstName: string | null;
  gender: string;
  id: string;
  lastName: string | null;
  middleName: string | null;
  mobile: string | null;
  name: string;
  pan: string;
  pinCode: string | null;
  state: string | null;
}

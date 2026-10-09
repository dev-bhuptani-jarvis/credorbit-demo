import { APIResponseEntity } from "./apiResponse";

// Common for the Admin Channel Partner Reports and Geographical Reports
export interface IReportParams {
  page: number;
  pageSize: number;
  filterType?: number;
  channelPartner?: string;
  stateFilter?: string;
  filter?: string;
  entityTypeFilter?: number;
  loanStatusFilter?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  bankId?: number;
  partnerType?: number;
  payoutStatus?: number;
  partnerTypeFilter?: number;
  payoutStatusFilter?: number;
  IndustryID?: number;
}

export interface IReportResponse extends APIResponseEntity {
  data: IReportResponseData;
}

interface IReportResponseData {
  totalCount: number;
  channelPartnersQueue: IChannelPartnersQueue[];
  segmentFocusDropdown: ISegmentFocusDropdown[];
}

export interface IChannelPartnersQueue {
  cpID: string;
  cpCode: string;
  cpName: string;
  partnerType: string;
  panType: string | null;
  dateOnboarded: string;
  parentUser: string;
  segmentFocus: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  commision: number;
  spCount: number;
}

export interface ISegmentFocusDropdown {
  id: number;
  displayName: string;
}

export interface IAdminChannelPartnerDailyReportResponse
  extends APIResponseEntity {
  data: IAdminChannelPartnerDailyReportData;
}

export interface IAdminChannelPartnerDailyReportData {
  dailyReportQueue: IAdminChannelPartnerDailyReportItem[];
  totalCount: number;
}

export interface IAdminChannelPartnerDailyReportItem {
  reportDate: string;
  partnerID: string;
  partnerName: string;
  partnerType: string;
  newOnboarded: string;
  appsLoggedDay: number;
  appsLoggedMTD: number;
  appsLoggedYTD: number;
  sanctionedCountDay: number;
  sanctionedAmountDay: number;
  sanctionedCountMTD: number;
  sanctionedAmountMTD: number;
  disbursedCountDay: number;
  disbursedAmountDay: number;
  disbursedCountMTD: number;
  disbursedAmountMTD: number;
  loginToSanctionTATAvgDays: number;
  sanctionToDisbTATAvgDays: number;
  approvalRatePercent: number;
  funnelConversionPercent: number;
  formattedsanctionedAmountDay: string;
  formattedsanctionedAmountMTD: string;
  formatteddisbursedAmountDay: string;
  formatteddisbursedAmountMTD: string;
}

export interface IApplicationFunnelDailyReportParams {
  search: string;
  page: number;
  pageSize: number;
  filterType: number;
  startDate: string | null;
  endDate: string | null;
}

export interface IApplicationFunnelDailyReportResponse
  extends APIResponseEntity {
  data: IApplicationFunnelDailyReportData;
}

export interface IApplicationFunnelDailyReportData {
  applications: IApplicationFunnelDailyReportItem[];
  totalCount: number;
}

export interface IApplicationFunnelDailyReportItem {
  loanApplicationID: string;
  applicationCode: string;
  borrowerCode: string;
  borrowerName: string;
  partner: string;
  productType: string;
  loanAmount: number;
  formattedLoanAmount: string;
  applicationCreated: string;
  status: IStatus;
  loginToSanctionTAT: string | null;
  sanctionToDisbTAT: string | null;
  loginTimestamp: string | null;
  disbursedTime: string | null;
}

export interface IGeographicalReportResponse extends APIResponseEntity {
  data: IGeographicalReportResponseData;
}

interface IGeographicalReportResponseData {
  list: IGeographicalChannelPartnerQueue[];
  totalCount: number;
  stateList: string[];
}

export interface IGeographicalChannelPartnerQueue {
  state?: string;
  city?: string;
  cpCount: number;
  spCount: number;
  clientsCount: number;
  totalLoan: number;
  totalAmount: number;
}

export interface IGSTList {
  id: number;
  userId: string;
  gstNo: string;
  dateOfGstRegistration: string | null;
  tradeName: string | null;
  gstAddress: string | null;
  cinOrLLP: string | null;
  user: string | null;
}

export interface IStatus {
  label: string;
  color: string;
  statusID: number;
}

export interface IStudentReportDetailResponse extends APIResponseEntity {
  data: IStudentReportDetailResponseData;
}

export interface IStudentReportDetailResponseData {
  studentID: string;
  studentName: string;
  studentCode: string;
  mobileNumber: string;
  email: string;
  panNumber: string;
  institute: string;
  studentReports: IStudentReports[];
}

export interface IStudentReports {
  name: string;
  filePath: string;
  reportType: number;
}

export interface IClientDetailList {
  filePath: string;
  name: string;
  reportType: number;
}

export interface IExternalReportResponse extends APIResponseEntity {
  data: IExternalReportData;
}

export interface IExternalReportData {
  responseCode: string;
  referenceID: string | null;
  reservationId: string | null;
  requestId?: string;
}

export interface IGetStudentCoApplicantsListResponse extends APIResponseEntity {
  data: IGetStudentCoApplicantsList[];
}

export interface IGetStudentCoApplicantsList {
  id: string,
  name: string,
  firstName: string | null,
  middleName: string | null,
  lastName: string | null,
  pan: string,
  aadhaarNumber: string | null,
  address: string,
  state: string | null,
  city: string | null,
  pinCode: string | null,
  mobile: string,
  dateOfBirth: string,
  gender: string,
  creditScore: number | null,
  userType: number
}

export interface IInstituteReportParams {
  page: number;
  pageSize: number;
  studentFilter?: string;
}
export interface IInstituteReportResponse extends APIResponseEntity {
  data: IInstituteReportResponseData;
}

interface IInstituteReportResponseData {
  totalCount: number;
  studentsList: IStudentList[];
}

export interface IStudentList {
  studentID: string,
  studentName: string,
  studentCode: string,
  mobile: string
}
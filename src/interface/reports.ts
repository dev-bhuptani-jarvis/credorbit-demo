import { APIResponseEntity } from "./apiResponse";

// Common for the Admin Channel Partner Reports and Geographical Reports
export interface IReportParams {
  page: number;
  pageSize: number;
  channelPartner?: string;
  stateFilter?: string;
  filter?: string;
}

export interface IReportResponse extends APIResponseEntity {
  data: IReportResponseData;
}

interface IReportResponseData {
  totalCount: number;
  channelPartnersQueue: IChannelPartnersQueue[];
}

export interface IChannelPartnersQueue {
  cpID: string;
  cpCode: string;
  cpName: string;
  spCount: number;
  clientsCount: number;
  totalLoan: number;
  totalAmount: number;
}

export interface IGeographicalReportResponse extends APIResponseEntity {
  data: IGeographicalReportResponseData;
}

interface IGeographicalReportResponseData {
  list: IGeographicalChannelPartnerQueue[];
  totalCount: number;
  stateList: string[];
}

export interface ICityDropdown {
  name: string;
  code: number;
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

export interface IGSTReportResponse extends APIResponseEntity {
  data: IGSTReportData;
}

export interface IGSTReportData {
  gstNumber: string;
  gstDetailsList: IGSTDetail[];
  gstList: IGSTList[];
  gstReportRefetchedDays?: number;
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

export interface IGSTDetail {
  id: string;
  fileName: string;
  pdfFilePath: string;
  excelFilePath: string;
  retrievedDate: string;
  gstFrom: null;
  gstTo: null;
  gstNumber: string;
}

export interface IITRReportBody {
  username: string;
  password: string;
}

export interface IShareLinkITRReportBody {
  referenceID: string;
  reservationId: string;
}

export interface IITRReportResponse extends APIResponseEntity {
  data: IITRReportData;
}

export interface IITRReportData {
  itrReportDate: string | null;
  itrReportRefetchedDays: number;
  itrDetailsList: IITRDetail[];
}

export interface IITRDetail {
  id: string;
  fileName: string;
  retrievedDate: string;
  pdfFilePath: string;
  excelFilePath: string;
}

export interface IBankingAnalyticsReportResponse extends APIResponseEntity {
  data: IBankingAnalyticsReportData;
}

export interface IBankingAnalyticsReportData {
  bankingAnalyticsDetailsList: IBankingReportList[];
}

export interface IBankingReportList {
  id: string;
  fileName: string;
  pdfFilePath: string;
  excelFilePath: string;
  retrievedDate: string;
  bankName: null;
  accountType: null;
  period: null;
}

export interface IChannelPartnerReportParams {
  page: number;
  pageSize: number;
  clientFilter?: string;
}
export interface IChannelPartnerClientReportResponse extends APIResponseEntity {
  data: IChannelPartnerClientReportData;
}

interface IChannelPartnerClientReportData {
  totalCount: number;
  clientsList: IClientList[];
}

export interface IClientList {
  clientID: string;
  clientName: string;
  clientCode: string;
  mobile: string;
  sourcingPartnerName: string;
}

export interface IChannelPartnerClientReportDetailResponse
  extends APIResponseEntity {
  data: IChannelPartnerClientReportDetailData;
}

export interface IChannelPartnerClientReportDetailData {
  channelPartner: string;
  clientCode: string;
  clientID: string;
  clientName: string;
  email: string;
  mobileNumber: string;
  panNumber: string;
  clientReports: IClientDetailList[];
}

export interface IClientDetailListParams {
  clientID: string;
  isClientDetailsRequired: boolean;
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

export interface IGenerateGstReportUsingLinkBodyForOTP {
  gstIn: string;
  email: string;
}

export interface IGenerateGstReportUsingLinkBodyForPassword {
  gstInList: string[];
  emailList: string[];
}

export interface IGenerateGstReportShareLink extends APIResponseEntity {
  data: {
    responseCode: string;
    gstIn: string | null;
    reservationID: string | null;
    referenceID: string;
  };
}

export interface IValidateGSTReportResponse extends APIResponseEntity {
  data: {
    gstReportDate: string
  };
}
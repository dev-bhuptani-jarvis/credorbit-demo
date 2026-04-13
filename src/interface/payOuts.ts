import { APIResponseEntity } from "./apiResponse";
import { IStatus } from "./channelPartnerDashboard";

export interface IPayOutsParams {
  page: number;
  pageSize: number;
  userType: number;
  month?: string;
  partnerName?: string;
}

export interface IPayOutsResponse extends APIResponseEntity {
  data: IPayOutsData;
}

export interface IPayOutsData {
  totalPayOutsCount: number;
  payOuts: IPayOuts[];
}

export interface IPayOuts {
  payoutID: string;
  userName: string;
  month: string;
  amountSanctioned: number;
  amountDisburse: number;
  payOutPercent: number;
  gstPercent: number;
}

export interface IPayOutsDetailParams {
  page: number;
  pageSize: number;
  payoutID: string;
  userType: number;
  fromDate?: string;
  toDate?: string;
}

export interface IPayOutsDetailResponse extends APIResponseEntity {
  data: IPayOutsDetailData;
}

export interface IPayOutsDetailData {
  userId: string;
  userName: string;
  mobileNumber: string;
  email: string;
  panNumber: string;
  payOutPercent: number;
  loansCompleted: number;
  payoutList: IPayOutsDetailList[];
  totalCount: number;
  userCode: string;
}

export interface IPayOutsDetailList {
  applicantName: string;
  applicationId: string;
  applicationCode: string;
  date: string;
  amountSanctioned: number;
  amountDisburse: number;
  payoutPercent: number;
  payAmount: number;
  gstAmount: number;
  tdsAmount: number;
  bills: number;
  netPayment: number;
  payoutStatus: IStatus;
  remarks: string | null;
  reason: string | null;
  paymentDate: string | null;
  requestStatus: number | null;
  disbursementDate: string | null;
  invoiceUrl: string;
  saccode?: string;
  userInvoiceNumber?: string;
}

export interface ICreatePayOutsRequestParams {
  applicationID: string;
}

export interface IGenerateSpPayoutInvoiceParams {
  spId: string,
  applicationCode: string,
  disbursedDate: string,
  payAmount: number,
  gstAmount: number,
  tdsAmount: number,
  netPayment: number,
  applicationID: string,
  payoutId: string,
  saccode?: string,
  userInvoiceNumber?: string,
  recipientName: string,
  recipientGST: string,
  recipientEmail: string,
  recipientAddress: string
}

export interface IGenerateSpPayoutInvoiceResponse extends APIResponseEntity {
  data: string,
}

export interface IGenerateCpPayoutInvoiceParams {
  cpId: string,
  applicationCode: string,
  disbursedDate: string,
  payAmount: number,
  gstAmount: number,
  tdsAmount: number,
  netPayment: number,
  applicationID: string,
  payoutId: string,
  saccode: string,
  userInvoiceNumber?: string,
  recipientName: string,
  recipientGST: string,
  recipientEmail: string,
  recipientAddress: string,
  recipientStateID: number,
  recipientStateName: string,
  recipientStateCode: string
}

export interface IGenerateCpPayoutInvoiceResponse extends APIResponseEntity {
  data: string,
}

export interface IPayOutsUpdateStatusParams {
  applicationID: string;
  userType: number;
  status: number;
  reason?: string;
  remarks?: string;
  paymentDate?: string;
}

export interface ISourcingPartnerPayOutsParams {
  page: number;
  pageSize: number;
  spFilter?: string;
}

export interface ISourcingPartnerPayOutsResponse extends APIResponseEntity {
  data: ISourcingPartnerPayOutsData;
}

export interface ISourcingPartnerPayOutsData {
  totalPaymentRequestsCount: number;
  paymentRequests: ISourcingPartnerPayOuts[];
}

export interface ISourcingPartnerPayOuts {
  spID: string;
  spName: string;
  spCode: string;
  noOfPendingRequests: number;
  noOfApprovedRequests: number;
  noOfRejectedRequests: number;
  noOfCompletedRequests: number;
}

export interface ISourcingPartnerPayOutDetailResponse
  extends APIResponseEntity {
  data: ISourcingPartnerPayOutDetailResponseData;
}

export interface ISourcingPartnerPayOutDetailResponseData {
  userId: string;
  userName: string;
  userCode: string;
  mobileNumber: string;
  email: string;
  panNumber: string;
  payOutPercent: number;
  loansCompleted: number;
  totalCount: number;
  payoutList: IPayOutsDetailList[];
}

export interface ISourcingPartnerPayOutDetailParams {
  page: number;
  pageSize: number;
  spID: string;
  fromDate?: string;
  toDate?: string;
}


export interface IGeneratePayoutInvoiceParams {
  spID: string;
  applicationCode: string;
  disbursedDate: string;
  payAmount: number;
  gstAmount: number;
  tdsAmount: number;
  netPayment: number;
  applicationID: string;
}

export interface IGeneratePayoutInvoiceResponse extends APIResponseEntity {
  data: string;
}

export interface IGenerateSubscriptionInvoiceParams {
  paymentLinkID: string;
  payAmount: number;
  gstAmount: number;
  netPayment: number;
  amountWithoutGST: number;
  planName: string;
  credits: string;
}

export interface IGenerateSubscriptionInvoiceResponse extends APIResponseEntity {
  data: string;
}

export interface IFetchStateResponse extends APIResponseEntity {
  data: IFetchStateResponseData[]
}

export interface IFetchStateResponseData {
  id: number,
  name: string,
  stateCode: string
}
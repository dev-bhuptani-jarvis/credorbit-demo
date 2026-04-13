import { APIResponseEntity } from "./apiResponse";

export interface ISourcingPartnerResponse extends APIResponseEntity {
  data: ISourcingPartnerData;
}

export interface ISourcingPartnerData {
  totalCount: number;
  sourcingPartersList: ISourcingPartner[];
}

export interface ISourcingPartner {
  id: string;
  name: string;
  code: string;
  mobileNumber: string;
  isActive: boolean;
  registeredDate: string;
}

export interface ISourcingPartnerParams {
  userID: string;
}

export interface ISourcingPartnerDetailsResponse extends APIResponseEntity {
  data: ISourcingPartnerDetailsData;
}

export interface ISourcingPartnerDetailsData {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  channelPartner: string;
  panNumber: string;
  payOuts: number;
  loansCompleted: number;
  code: string;
}

export interface ICustomerListData {
  id: string;
  fullName: string;
  phoneNumber: string;
  createdDate: string;
  isActive: boolean;
}

export interface ISourcingPartnerListParams {
  page: number;
  pageSize: number;
  sourcingPartner?: string;
  channelpartnerID: string;
}

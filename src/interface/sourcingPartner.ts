import { APIResponseEntity } from "./apiResponse";

export interface ISourcingPartnerResponse extends APIResponseEntity {
  data: ISourcingPartnerData;
}

export interface ISourcingPartnerData {
  totalCount: number;
  sourcingPartersList: ISourcingPartner[];
  categoryList?: {
    id: number;
    name: string;
  }[];
}

export interface ISourcingPartner {
  id: string;
  name: string;
  code: string;
  mobileNumber: string;
  isActive: boolean;
  registeredDate: string;
  noOfRegisteredSP?: number;
  activeCredits?: number;
  reservedCredits?: number;
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

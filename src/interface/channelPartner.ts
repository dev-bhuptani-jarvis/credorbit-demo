import { APIResponseEntity } from "./apiResponse";

export interface IChannelPartnerResponse extends APIResponseEntity {
  data: IChannelPartnerData;
}

interface IChannelPartnerData {
  totalCount: number;
  channelPartnerList: IUserMasterChannelPartner[];
}

export interface IUserMasterChannelPartner {
  id: string;
  name: string;
  code: string;
  mobileNumber: string;
  isActive: boolean;
  registeredDate: string;
  noOfRegisteredSP: number;
}

export interface IChannelPartnerDetailResponse extends APIResponseEntity {
  data: IChannelPartnerDetail;
}

export interface IChannelPartnerDetail {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  panNumber: string;
  payOuts: number;
  loansCompleted: number;
  code: string;
  noOfRegisteredSP: number;
}

export interface IChannelPartnerParams {
  userId: string;
  userType: number;
  customerName?: string;
  categoryID?: string;
  sourcingPartner?: string;
}

export interface IChannelPartnerListParams {
  page: number;
  pageSize: number;
  channelPartner?: string;
}

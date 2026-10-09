import { APIResponseEntity } from "./apiResponse";
import { ICategoryList } from "./clientMaster";

export interface IChannelPartnerResponse extends APIResponseEntity {
  data: IChannelPartnerData;
}

export interface IChannelPartnerData {
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
  activeCredits: number;
  freeCredits: number;
  subscribedCredits: number;
  reservedCredits: number;
  usedCredits: number;
  tokenCreatedDate: string | null;
  refreshTokenCreatedDate: string | null;
  isTestUser: boolean;
  masterCPName: string | null;
  isUserUnderMasterCP: boolean;
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
  search?: string;
  filterType?: number;
  startDate?: string;
  endDate?: string;
}

export interface IMasterCpClientResponse extends APIResponseEntity {
  data: IMasterCpClientData;
}

export interface IMasterCpClientData {
  totalCount: number;
  customersList: IMasterCpClient[];
  categoryList: ICategoryList[];
}

export interface IMasterCpClient {
  id: string;
  customerCode: string;
  fullName: string;
  phoneNumber: string;
  cpName: string;
  sourcingPartnerName: string | null;
  createdDate: string;
  isActive: boolean;
  applicationStatuses: string[];
  userManagementUserName: string | null;
  branchName: string | null;
}

export interface IMasterChannelPartnerListParams {
  page: number;
  pageSize: number;
  search?: string;
}

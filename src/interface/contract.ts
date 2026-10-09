import { APIResponseEntity } from "./apiResponse";

export interface IContractResponse extends APIResponseEntity {
  data: IContractResponseData;
}

export interface IContractResponseData {
  isAgreed: boolean,
  content: string,
  updatedDate: string,
  aadhaarNumber?: string | null,
  contractVersion?: number | null,
  contractEnforcementDate?: string | null,
  contractUserMappingID?: number | null
}

export interface IContractParams {
  pageName: string;
  contractTypeID?: number;
}

export interface IContractListParams {
  userType: number;
  page: number;
  pageSize: number;
  user?: string;
  search?: string;
}

export interface IContractListResponse extends APIResponseEntity {
  data: IContractListData;
}

interface IContractListData {
  totalCount: number;
  contractList: IContractListItemData[];
}

export interface IContractListItemData {
  id: number;
  name: string;
  userCode: string;
  mobileNumber: string;
  contractSigned: string | null;
  isActive: boolean;
}

export interface IUpdatedContractBody {
  pageName: string;
  description: string;
  contractID?: number;
  contractEnforcementDate?: string;
}

export interface IUpdatedContractStatusBody {
  mobileNumber: string;
  otp: string;
  userID: string;
  status: boolean;
}

export interface OnlyAadharNumber {
  userID: string;
  aadharNumber: string;
}

export interface OnlyMobileNumber {
  emailID: string;
  otpType: number;
  mobileNumber: string;
  whiteLabelTenantId: string;
}

export interface IAadharCardResponse extends APIResponseEntity {
  data: IAadharCardData;
}

export interface IAadharCardData {
  clientId: string;
  otpSent: boolean;
  ifNumber: boolean;
  validAadhaar: boolean;
}

export interface IUserListForAdminContractListResponse extends APIResponseEntity {
  data: IUserListForAdminContractListData;
}

export interface IUserListForAdminContractListData {
  totalCount: number;
  userList: IUserListForAdminContractListItemData[];
}

export interface IUserListForAdminContractListItemData {
  id: string,
  name: string,
  userCode: string,
  mobileNumber: string,
  contractSigned: string | null,
  channelPartnerName: string,
  sourcingPartnerName: string | null,
  isActive: boolean,
}

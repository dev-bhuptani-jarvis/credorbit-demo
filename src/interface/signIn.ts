import { APIResponseEntity } from "./apiResponse";

export interface ISendOTPRequestBySignIn {
  emailID: string;
  mobileNumber: string;
  otpType?: number;
  isFetchLinkedUsers?: boolean;
  captcha: string;
}

export interface IRegisterValues {
  name: string;
  emailID: string;
  mobileNumber: string;
  isTnCAccepted: boolean;
  isIndianAdult: boolean;
  otpType: number;
  userType: number;
  captcha: string;
  channelPartnerCode?: string;
  referralCode?: string;
}

export interface IRegisterValidaton {
  name: string;
  emailID: string;
  mobileNumber: string;
  checkboxes: string;
  captcha: string;
}

export interface IRegisterParams {
  emailID: string;
  mobileNumber: string;
  panNumber?: string;
  name?: string;
  otpType?: number; // only for the login and register
  userType: number;
  parentID?: string;
  extraToken: string;
  isUserDetailsRequired: boolean;
  channelPartnerCode?: string;
}

export interface ISendOTPResponse extends APIResponseEntity {
  data: ISendOTPResponseData;
}

export interface ISendOTPResponseData {
  associatedUsers: IAssociatedUsersData[];
}

export interface IAssociatedUsersData {
  userType: number;
  cpID: string | null;
  spID: string | null;
  cpName: string | null;
  spName: string | null;
  userName: string;
  userID: string;
}
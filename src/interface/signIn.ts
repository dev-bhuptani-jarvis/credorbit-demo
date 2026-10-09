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
  masterChannelPartnerCode?: string;
  referralCode?: string;
  leadID?: string;
}

export interface IRegisterValidaton {
  name: string;
  emailID: string;
  mobileNumber: string;
  checkboxes: string;
  captcha: string;
}

export interface IRegisterParams {
  emailID?: string;
  mobileNumber?: string;
  panNumber?: string;
  name?: string;
  otpType?: number; // only for the login and register
  userType: number;
  parentID?: string;
  extraToken: string;
  isUserDetailsRequired: boolean;
  channelPartnerCode?: string;
  masterChannelPartnerCode?: string;
  leadID?: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  category?: string;
  dob?: string | null;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  zipCode?: string | null;
  maskedAadhaar?: string | null;
  gender?: string | null;
  gstNumber?: string | null;
  constitutionOfInstitute?: string | null;
  tradeName?: string | null;
  website?: string | null;
  authorisedPersons?: IAuthorizedPersonRegisterRequest[];
  whiteLabelTenantId: string;
  masterCpID?: string;
  isEducationalPortal?: boolean;
}

export interface IAuthorizedPersonRegisterRequest {
  name?: string;
  dateOfBirth?: string;
  panNumber?: string;
  address?: string;
  gender?: string;
  constitution?: string;
  constitutionOfInstitute?: string | null;
  mobileNumber?: string;
  emailAddress?: string;
  userType: number;
  profilePhoto?: File | null;
  profilePhotoPath?: string | null;
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

export interface ISendOTPForLeadResponse extends APIResponseEntity {
  data: ISendOTPForLeadResponseData;
}

export interface ISendOTPForLeadResponseData {
  isFromLead: boolean;
  leadId: string;
  leadLoanType: number;
  leadStatus: number;
}

import { APIResponseEntity } from "./apiResponse";
import { Permission } from "./sidebarPermission";

export interface IVerifyEmailOTPRequest {
  emailID: string;
  mobileNumber: string;
  otp: string;
  extraToken: string;
  isIndianAdult?: boolean;
  isTnCAccepted?: boolean;
  userType?: number;
}

export interface IVerifyEmailOTPResponse extends APIResponseEntity {
  data: UserData;
}

export interface UserData {
  emailID: string;
  mobileNumber: string;
  permissions: Permission[];
  profilePicture: string;
  roleID: number;
  roleName: string;
  token: string;
  userID: string;
  userName: string;
  userType: number;
  showPanDetailPopUp: boolean;
  isDefaultCpClient: boolean;
  isContractSigned: boolean;
  panNumber: string;
  gstNumber: string | null;
  panTypeID: number;
  contractEnforcementDate: string
}

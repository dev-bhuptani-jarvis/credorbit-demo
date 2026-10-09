import { APIResponseEntity } from "./apiResponse";
import { Permission } from "./sidebarPermission";
import { IGetWhiteLabelSettingsByUserIdResponseData } from "./whiteLabel";

export interface ICheckLeadUserExistsOrNoteRequest {
  panNumber: string;
  leadId: string;
  userType: number;
  extraToken: string;
}

export interface IVerifyEmailOTPRequest {
  emailID?: string;
  mobileNumber?: string;
  otp: string;
  extraToken: string;
  isIndianAdult?: boolean;
  isTnCAccepted?: boolean;
  userType?: number;
  leadID?: string;
  isEducationalPortal?: boolean;
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
  parentUserId?: string | null;
  userName: string;
  userType: number;
  showPanDetailPopUp: boolean;
  isDefaultCpClient: boolean;
  isContractSigned: boolean;
  panNumber: string;
  gstNumber: string | null;
  panTypeID: number;
  contractEnforcementDate: string | null;
  whiteLabelSettings?: IGetWhiteLabelSettingsByUserIdResponseData | null;
  isFromLead?: boolean;
  leadId?: string;
  leadLoanType?: number;
  leadStatus?: number;
  isUserUnderMasterCP: boolean;
  parentUserType: number;
  tradeName: string | null;
}

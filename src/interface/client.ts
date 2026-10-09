import { IStatus } from "./channelPartnerDashboard";
import { APIResponseEntity } from "./apiResponse";

export interface IClientResponse extends APIResponseEntity {
  data: IClientData;
}

export interface IClientData {
  clientID: string;
  clientName: string;
  clientCode: string;
  mobileNumber: string;
  email: string;
  channelPartner: string;
  panNumber: string;
  loanApplicationsList: ILoanApplicationData[];
}

export interface ILoanApplicationData {
  loanApplicationID: string;
  loanApplicationCode: string;
  loanJourneyStatus: number;
  bankName: string | null;
  loanTypeID: number;
  disbursementId: string;
  date: string;
  sanctionedDate: string | null;
  disbursedDate: string | null;
  loanAmount: number;
  sanctionedLoanAmount: number | null;
  disbursedLoanAmount: number | null;
  sanctionLetterUrl: string | null;
  progressPercent: number;
  isCamReportGenerated: boolean;
  status: IStatus;
  customerName: string;
  loanType: string | null;
  userID: string;
  comments?: string | null;
  raisedQuery?: string | null;
  assignedUserDetails: IAssignedUserDetails | null;
}

export interface IAssignedUserDetails {
  userID: string;
  emailID: string;
  userName: string;
  mobileNumber: string | null;
  phoneNumber: string;
  designation: string;
  userType: number;
  roleID: number;
  profilePicture: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  categoryID: string | null;
  createdBy: string;
  isActive: boolean;
  parentID: string;
  createdByID: string;
}

export interface IClientPartnerParams {
  userID: string;
}

export interface IFetchCreditScoreBody {
  otp: string;
  requestId: string;
  reservationId: string;
  partnerID: string;
}

export interface IResendOTPCreditScoreBody {
  requestId: string;
}

export interface IFetchCreditScoreForEducationBody {
  otp: string;
  requestId: string;
  partnerID: string;
  loanApplicationID: string;
  studentID: string;
}

export interface IResendOTPCreditScoreForEducationBody {
  requestId: string;
}

export interface IPartnerParams {
  listType: number;
}

export interface IGetPartnerListResponse extends APIResponseEntity {
  data: IPartnerList[];
}

export interface IPartnerList {
  id: string;
  name: string;
  email: string;
}

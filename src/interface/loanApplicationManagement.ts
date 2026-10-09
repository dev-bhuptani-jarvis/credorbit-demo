import { APIResponseEntity } from "./apiResponse";
import { ILoanApplicationStatus } from "./nbfcApplication";

export interface ILoanApplicationStatusDropdownOption {
  displayName: string;
  statusID: number;
}

export interface ILoanApplicationPermissionUser {
  userID: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  roleName: string;
  isActive: boolean;
}

export interface IGetLoanApplicationPermissionUsersParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IGetLoanApplicationPermissionUsersData {
  users: ILoanApplicationPermissionUser[];
  totalCount: number;
}

export interface IGetLoanApplicationPermissionUsersResponse
  extends APIResponseEntity {
  data: IGetLoanApplicationPermissionUsersData;
}

export interface IAssignLoansToUMUserBody {
  umUserId: string;
  loanApplicationIds: string[];
}

export interface IGetEduPortalLoanApplicationBody {
  page: number;
  pageSize: number;
  statusFilter?: number[];
  userType: number;
  userID: string;
  search?: string;
  dateTimeFilter?: number;
}

export interface IGetEduPortalLoanApplicationResponse extends APIResponseEntity {
  data: IGetEduPortalLoanApplicationResponseData;
}

export interface IGetEduPortalLoanApplicationResponseData {
  total: number;
  loanApplications: IEduPortalLoanApplication[];
}

export interface IEduPortalLoanApplication {
  loanApplicationID: string;
  applicationCode: string;
  studentName: string;
  courseName: string;
  instituteName: string;
  tradeName: string | null;
  loanAmount: number;
  loanAppliedDate: string;
  status: {
    label: string;
    statusId: number;
    color: string;
  };
  verificationStatus: string;
  studentID: string;
  studentInfo: {
    studentID: string;
    studentName: string;
    panNumber: string;
    email: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string;
    code: string;
    address: string;
  }
}
import { APIResponseEntity } from "./apiResponse";
import { IRolePermission } from "./roleMaster";

export interface IUserDataResponse extends APIResponseEntity {
  data: IUserData;
}

export interface IUserData {
  totalCount: number;
  userManagementList: IUsersData[];
}

export interface IUsersData {
  userID: string;
  userName: string;
  roleName: string;
  designation: string;
  email: string;
  mobileNumber: string;
  status: boolean;
}

export interface IUserMasterListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface IUserDetailData {
  userID?: string;
  firstName?: string;
  lastName?: string;
  rolesList: string[];
  designation: string;
  email: string;
  mobileNumber: string;
  status: boolean;
  selectedRoleName: string;
  fullName?: string;
}

export interface ISaveUserDetailData {
  userID?: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  designation: string;
  roleName: string;
  status: boolean;
}

export interface IUserDetailValidationData {
  firstName: string;
  lastName: string;
  rolesList: string;
  designation: string;
  email: string;
  mobileNumber: string;
}

export interface IGetAddEditRoleUserResponse extends APIResponseEntity {
  data: IGetAddEditRoleUserData;
}

interface IGetAddEditRoleUserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  designation: string;
  selectedRoleName: string;
  isActive: boolean;
  rolesList: { id: number; roleName: string }[];
}

export interface IGetUserRightsForUserManagementResponse
  extends APIResponseEntity {
  data: IUserRightData | null;
}

export interface IUserRightData {
  userEmail: string;
  rolesAndRights: IRolePermission[];
}

export interface IUpdateUserRightBodyData {
  userID: string;
  permissions: IRolePermission[];
}

export interface IRoleOption {
  label: string;
  value: number;
}

import { APIResponseEntity } from "./apiResponse";

export interface IRoleMasterResponse extends APIResponseEntity {
  data: IRoleMasterData;
}

interface IRoleMasterData {
  totalCount: number;
  rolesList: IRoleList[];
}

export interface IRoleList {
  roleID: number;
  roleName: string;
  isActive: boolean;
}

export interface IRoleDetailResponse extends APIResponseEntity {
  data: IRoleDetailData;
}

export interface IRoleDetailData {
  roleID?: number;
  roleName: string;
  isActive: boolean;
  permissions: IRolePermission[];
  linkedUserID?: string;
}

export interface IRolePermission {
  id: number | null;
  rightID: number;
  parentID: number;
  rightName: string;
  displayName?: string;
  displayOrder: number;
  create: boolean | null;
  view: boolean | null;
  list: boolean | null;
}

export interface IRoleParams {
  roleID: number;
}

export interface IRoleMasterListParams {
  page: number;
  pageSize: number;
  isMasterRole: boolean;
  linkedUserID?: string;
}

export interface IRoleValidation {
  roleName: string;
}

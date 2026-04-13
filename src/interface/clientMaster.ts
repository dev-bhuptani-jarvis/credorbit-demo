import { APIResponseEntity } from "./apiResponse";

export interface IClientMasterResponse extends APIResponseEntity {
  data: IClientMasterData;
}

interface IClientMasterData {
  totalCount: number;
  customersList: IClientMaster[];
  categoryList: ICategoryList[];
}

export interface ICategoryList {
  id: number;
  name: string;
}

export interface IClientMaster {
  id: string;
  customerCode: string;
  fullName: string;
  phoneNumber: string;
  sourcingPartnerName: string | null;
  createdDate: string;
  isActive: boolean;
  applicationStatuses: string[];
}

export interface IClientMasterListingParams {
  page: number;
  pageSize: number;
  customerName?: string;
  categoryID?: string;
  parentID?: string;
  isShowOnlyActiveClients?: boolean;
  needCpAndSpClients?: boolean;
}

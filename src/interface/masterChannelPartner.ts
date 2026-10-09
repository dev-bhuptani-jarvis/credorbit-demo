import { APIResponseEntity } from "./apiResponse";
import { IGetSubscriptionPlanByIdResponseData, IGetSubscriptionPlansRights } from "./planConfiguration";

export interface IMasterChannelPartnerResponse extends APIResponseEntity {
    data: IMasterChannelPartnerData;
}

interface IMasterChannelPartnerData {
    totalCount: number;
    masterCpList: IMasterChannelPartner[];
}

export interface IMasterChannelPartner {
    id: string,
    name: string,
    code: string,
    registeredDate: string,
    mobileNumber: string,
    email: string,
    noOfRegisteredCp: number,
    noOfRegisteredBranches: number,
    activeCredits: number,
    reservedCredits: number,
    isActive: boolean
}

export interface IMasterChannelPartnerListParams {
    page: number;
    pageSize: number;
    search?: string;
}

export interface IMasterChannelPartnerParams {
    id: string
}

export interface IUpdateMasterChannelPartnerParams {
    masterCpID: string,
    isActive: boolean
}

export interface IMasterChannelPartnerDetailResponse extends APIResponseEntity {
    data: IMasterChannelPartnerDetail;
}

export interface IMasterChannelPartnerDetail {
    id: string,
    name: string,
    code: string,
    registeredDate: string,
    mobileNumber: string,
    email: string,
    panNumber: string,
    address: string,
    city: string,
    state: string,
    pinCode: string,
    noOfRegisteredCp: number,
    noOfRegisteredBranches: number,
    totalCredits: number,
    activeCredits: number,
    reservedCredits: number,
    isActive: boolean,
    configurations: IMasterCPCapacityResponseData
}

export interface IMasterCPDetailsForPlanConfigurationsResponse extends APIResponseEntity {
    data: IMasterCPDetailsForPlanConfigurationsResponseData;
}

export interface IMasterCPDetailsForPlanConfigurationsResponseData {
    userId: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    planName: string | null,
    activeCredits: number,
    reservedCredits: number,
    planDetails: IGetSubscriptionPlanByIdResponseData | null,
    configurations: IConfigurations[] | null,
    userRights: IGetSubscriptionPlansRights[],
}

export interface IConfigurations {
    configurationID: number,
    configurationName: string,
    configurationValue: string,
    createdDate: string,
    updatedDate: string
}

export interface ISaveSubscriptionPlanWithMCPConfigAndRightsBody {
    planID: number,
    userID: string,
    mcpPlanConfigurations: IMasterCPPlanConfiguration[],
    userRights: IMasterCPUserRights
}

export interface IMasterCPPlanConfiguration {
    mcpConfigurationListID: number,
    configurationValue: string
}

export interface IMasterCPUserRights {
    permissions: IMasterCPUserRightsPermission[]
}

export interface IMasterCPUserRightsPermission {
    rightID: number,
    create: boolean | null,
    delete: boolean | null,
    view: boolean | null,
    list: boolean | null
}

export interface ISaveSubscriptionPlanDetailBody {
    planID: number,
    userID: string
}

export interface ISaveMCPConfigurationsBody {
    planID: number,
    userID: string,
    mcpPlanConfigurations: IMasterCPPlanConfiguration[],
}

export interface ISaveMCPUserRightsBody {
    planID: number,
    userID: string,
    userRights: IMasterCPUserRights
}

export interface IMasterCPCapacityResponse extends APIResponseEntity {
    data: IMasterCPCapacityResponseData;
}

export interface IMasterCPCapacityResponseData {
    masterCpId: string,
    masterCpName: string,
    totalOccupiedCount: number,
    configurations: IConfigurationsCapacity[]
}

export interface IConfigurationsCapacity {
    configurationID: number,
    configurationName: string,
    configurationValue: string,
    maximumCount: number,
    occupiedCount: number,
    remainingCount: number
}

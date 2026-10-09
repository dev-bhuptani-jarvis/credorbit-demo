import { APIResponseEntity } from "./apiResponse"

export interface IGetSubscriptionPlansByUserTypeBody {
    userType: number,
    page: number,
    pageSize: number,
    searchText?: string,
    userId?: string
}

export interface IGetSubscriptionPlansByUserTypeResponse extends APIResponseEntity {
    data: IGetSubscriptionPlansByUserTypeResponseData
}

export interface IGetSubscriptionPlansByUserTypeResponseData {
    totalCount: number,
    page: number,
    pageSize: number,
    totalPages: number,
    data: IGetSubscriptionPlanByIdResponseData[]
}

export interface IGetSubscriptionPlanByIdResponseData {
    planID: number,
    name: string,
    credits: number,
    price: number,
    planForUserType: number,
    isActive: boolean,
    planDescription: string | null
}

export interface IGetMCPConfigurationListResponse extends APIResponseEntity {
    data: IGetMCPConfigurationListResponseData
}

export interface IGetMCPConfigurationListResponseData {
    totalCount: number;
    configurations: IGetMCPConfigurations[],
    permissions: IGetMCPPermissions[]
}

export interface IGetMCPConfigurations {
    id: number,
    configurationName: string,
    userType: number,
    isActive: boolean,
    createdDate: string
}

export interface IGetMCPPermissions {
    id: number,
    rightID: number,
    parentID: number,
    rightName: string,
    displayName: string,
    displayOrder: number,
    create: boolean | null,
    view: boolean | null,
    list: boolean | null
}

export interface ISavePlanMasterBody {
    subscriptionPlan: {
        name: string,
        credits: number,
        price: number,
        planForUserType: number,
        isActive: boolean
    },
    mcpPlanConfigurations: {
        mcpConfigurationListID: number,
        configurationValue: string
    }[],
    planRights: {
        permissions: {
            rightID: number,
            create: boolean | null,
            view: boolean | null,
            list: boolean | null
        }[]
    }
}

export interface PlanConfigurationFormErrors {
    name: string;
    credits: string;
    price: string;
    configurations: Record<number, string>;
};

export interface EditableConfiguration extends IGetMCPConfigurations {
    value: string;
}

export interface PlanConfigurationFormData {
    planID?: number;
    name: string;
    credits: string;
    price: string;
    isActive: boolean;
    configurations: EditableConfiguration[];
    permissions: IGetMCPPermissions[];
};

export type PlanMode = "create" | "view" | "edit";

export interface IGetSubscriptionPlansConfigurationResponse extends APIResponseEntity {
    data: IGetSubscriptionPlansConfigurationResponseData
}

export interface IGetSubscriptionPlansConfigurationResponseData {
    planID: number,
    name: string,
    credits: number,
    price: number,
    planForUserType: number,
    isActive: boolean,
    configurations: IGetSubscriptionPlansConfiguration[],
    planRights: IGetSubscriptionPlansRights[]
}

export interface IGetSubscriptionPlansConfiguration {
    id: number,
    mcpConfigurationListID: number,
    configurationName: string,
    configurationValue: string,
    createdDate: string
}

export interface IGetSubscriptionPlansRights {
    parentID: number,
    rightID: number,
    rightName: string,
    create: boolean | null,
    delete?: boolean | null,
    view: boolean | null,
    list: boolean | null,
    userRights?: boolean | null,
    displayOrder: number,
    displayName: string
}

export interface IGetSubscriptionPlansConfigurationBody {
    planId: number
}

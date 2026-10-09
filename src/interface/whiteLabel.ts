import { APIResponseEntity } from "./apiResponse";

export interface AssignWhiteLabelFeatureRequest {
    whiteLabelUserId?: string,
    id?: string,
    isFeatureActive: boolean,
    isReportPDFEnable: boolean,
    isReportExcelEnable: boolean,
    isUIEnable: boolean,
    isPayoutInvoiceEnable: boolean,
    isSubscriptionInvoiceEnable: boolean,
    isEmailEnable: boolean,
};

export interface WhiteLabelForm {
    id: string;
    uploadLogo: File | null;
    faviconFile: File | null;
    companyName: string;
    displayName: string;
    subDomainURL: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoPreview: string;
    faviconPreview: string;
    isFeatureActive: boolean;
    isReportPDFEnable: boolean;
    isReportExcelEnable: boolean;
    isUIEnable: boolean;
    isPayoutInvoiceEnable: boolean;
    isSubscriptionInvoiceEnable: boolean;
    isEmailEnable: boolean;
};

export interface WhiteLabelFormErrors {
    uploadLogo: string;
    faviconFile: string;
    companyName: string;
    displayName: string;
    subDomainURL: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
};

export interface SaveWhiteLabelSettingsBody {
    whiteLabelUserId?: string,
    companyName: string,
    displayName: string,
    subDomainURL: string,
    logoUrl: string,
    faviconUrl: string,
    primaryColor: string,
    secondaryColor: string,
};

export interface IGetWhiteLabelCPListAsyncResponse extends APIResponseEntity {
    data: IGetWhiteLabelCPListAsyncResponseData;
}

export interface IGetWhiteLabelCPListAsyncResponseData {
    totalCount: number,
    records: IGetWhiteLabelCPDetailsAsyncResponseData[]
}

export interface IGetWhiteLabelCPDetailsAsyncResponseData {
    id: string,
    isFeatureActive: boolean,
    isUIEnable: boolean,
    isReportPDFEnable: boolean,
    isReportExcelEnable: boolean,
    isPayoutInvoiceEnable: boolean,
    isSubscriptionInvoiceEnable: boolean,
    isEmailEnable: boolean,
    createdDate: string,
    userDetails: IGetWhiteLabelCPDetailsAsyncResponseDataUserDetails
    subDomainUrl: string
}

export interface IGetWhiteLabelCPDetailsAsyncResponseDataUserDetails {
    id: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    roleID: number
}

export interface IGetWhiteLabelSettingsByUserIdResponse extends APIResponseEntity {
    data: IGetWhiteLabelSettingsByUserIdResponseData;
}

export interface IGetWhiteLabelSettingsByUserIdResponseData {
    id: string;
    whiteLabelUserId: string;

    companyName: string;
    displayName: string;
    logoUrl: string;
    faviconUrl: string;
    logoUrlBase64?: string;
    faviconUrlBase64?: string;

    primaryColor: string;
    secondaryColor: string;
    accentColor: string | null;

    fontFamily: string | null;
    theme: string;
    customCss: string | null;

    isLogoUploaded: boolean;
    userDetails: IWhiteLabelSettingsUserDetails;
    whiteLabelPermission: IWhiteLabelPermission;

    subDomainURL: string;
    userType: number;
}

export interface IWhiteLabelPermission {
    id: string;
    isFeatureActive: boolean;
    isUIEnable: boolean;
    isReportPDFEnable: boolean;
    isReportExcelEnable: boolean;
    isPayoutInvoiceEnable: boolean;
    isSubscriptionInvoiceEnable: boolean;
    isEmailEnable: boolean;
}

export interface IWhiteLabelSettingsUserDetails {
    id: string;
    fullName: string;
    email: string;
    panNumber: string;
    phoneNumber: string;
    code: string;
}

export interface IGetWhiteLabelUserIdResponse extends APIResponseEntity {
    data: IGetWhiteLabelUserIdResponseData;
}

export interface IGetWhiteLabelUserIdResponseData {
    whiteLabel: IWhiteLabel;
    userDetails: IUserDetails;
}

export interface IWhiteLabel {
    id: string;
    whiteLabelUserId: string;
    isFeatureActive: boolean;
    isUIEnable: boolean;
    isReportPDFEnable: boolean;
    isReportExcelEnable: boolean;
    isPayoutInvoiceEnable: boolean;
    isSubscriptionInvoiceEnable: boolean;
    isEmailEnable: boolean;
}
export interface IUserDetails {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    roleID: number;
}

export interface IWhiteLabelSettingParams {
    page: number;
    pageSize: number;
    search?: string;
}

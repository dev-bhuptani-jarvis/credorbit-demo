import { APIResponseEntity } from "./apiResponse";

export interface ISubscriptionBody {
    subscriptionPlanID: string;
    amount?: string;
}

export interface ISubscriptionResponse extends APIResponseEntity {
    data: ISubscriptionResponseData;
}

interface ISubscriptionResponseData {
    linkId: string;
    shortUrl: string;
    status: string;
}

export interface ISubscriptionListingResponse extends APIResponseEntity {
    data: ISubscriptionListingData;
}

export interface ISubscriptionPlanListingResponse extends APIResponseEntity {
    data: ISubscriptionPlanListingData[];
}

export interface ISubscriptionUsageResponse extends APIResponseEntity {
    data: { subscriptionUsage: ISubscriptionUsageListingData[] };
}

export interface IFetchTabWiseUserListingResponse extends APIResponseEntity {
    data: ITabUserWiseListingData;
}

export interface ISubscriptionUsageListingData {
    id: number,
    credits: number,
    isCreditsAdd: boolean | null,
    reason: string,
    createdAt: string
}

export interface ISubscriptionPlanListingData {
    planID: number,
    name: string,
    credits: number,
    price: number
}

export interface ISubscriptionListingData {
    totalCredits: number;
    reservedCredits?: number;
    subscriptionHistory: ISubscriptionResponseListingData[];
}

export interface ISubscriptionResponseListingData {
    planName: string,
    amount: number,
    gstAmount: number,
    amountWithoutGst: number,
    creditPoints: number,
    dateTime: string,
    paymentStatus: string,
    colorCode: string,
    paymentLinkID: string;
    subscriptionUrl: string;
}

export interface IFetchAllPaymentsResponse extends APIResponseEntity {
    data: IFetchAllPaymentsResponseData;
}

export interface IFetchAllPaymentsResponseData {
    totalRecords: number,
    page: number,
    pageSize: number,
    records: IFetchAllPaymentsResponseRecord[]
}

export interface IFetchAllPaymentsResponseRecord {
    userName: string,
    userType: number,
    amount: number,
    creditPoints: number,
    dateTime: string,
    paymentLinkID: number,
    razorpayLinkID: string,
    planName: string,
    paymentStatus: string,
    colorCode: string
}

export interface IPaginateReqEntityForSubscription {
    page: number,
    pageSize: number,
    search?: string,
    status?: string
}

export interface IPaginateReqEntityForFetchUserTabWise {
    page: number,
    pageSize: number,
    search?: string,
    type: number
}

export interface ITabUserWiseListingData {
    totalRecords: number;
    page: number;
    pageSize: number;
    records: TabWiseUserRecordEntity[];
}

export interface TabWiseUserRecordEntity {
    id: string;
    fullName: string;
    email: string;
    panNumber: string;
    phoneNumber: string;
    code: string;
}

export interface IAddCreditsBody {
    creditbeneficiaryUserID: string;
    credit: number;
}

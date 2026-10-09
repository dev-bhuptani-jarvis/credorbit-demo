import { APIResponseEntity } from "./apiResponse";

export interface IBranchesResponse extends APIResponseEntity {
    data: IBranchesResponseData;
}

export interface IBranchesResponseData {
    totalCount: number;
    branches: IBranches[];
}

export interface IBranches {
    branchId: string,
    masterCpId: string,
    masterCpName: string,
    branchName: string,
    branchCode: string,
    email: string,
    phoneNumber: string,
    state: string,
    city: string,
    gstNumber: string,
    useMasterCpGst: boolean,
    isIndividualBilling: boolean,
    isActive: boolean,
    createdDate: string,
    activeClientsCount: number,
    activeLoanApplicationsCount: number
}

export interface IBranchesDetailsResponse extends APIResponseEntity {
    data: IBranchesDetailsResponseData
}

export interface IBranchesDetailsResponseData {
    branchId: string,
    masterCpId: string,
    masterCpName: string,
    branchName: string,
    branchCode: string,
    panNumber: string,
    email: string,
    phoneNumber: string,
    address: string,
    area?: string,
    city: string,
    state: string,
    country: string,
    zipCode: string,
    gstNumber: string,
    useMasterCpGst: boolean,
    isIndividualBilling: boolean,
    isActive: boolean,
    individualBillingBodyTemplate: boolean,
    createdDate: string,
    updatedDate: string | null,
    activeChildUsersCount: number,
    activeLoanApplicationsCount: number
}

export interface ICreateBranchBody {
    masterCpId: string,
    branchId?: string,
    branchName: string,
    email: string,
    phoneNumber: string,
    address: string,
    area: string,
    city: string,
    state: string,
    country: string,
    zipCode: string,
    useMasterCpGst: boolean,
    isIndividualBilling: boolean,
    isActive: boolean,
    gstNumber?: string,
    whiteLabelTenantId: string
}

export interface ICreateBranchFormData {
    branchName: string;
    email: string;
    phoneNumber: string;
    address: string;
    area: string;
    zipCode: string;
    city: string;
    state: string;
    country: string;
    useMasterCpGst: boolean;
    gstNumber: string;
    isIndividualBilling: boolean;
    isActive: boolean;
}

export interface ICreateBranchValidation {
    branchName: string;
    email: string;
    phoneNumber: string;
    address: string;
    area: string;
    zipCode: string;
    gstNumber: string;
}
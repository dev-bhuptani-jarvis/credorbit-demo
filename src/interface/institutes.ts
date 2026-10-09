import { APIResponseEntity } from "./apiResponse";

export interface IGetAllEducationInstitutesResponse extends APIResponseEntity {
    data: IGetAllEducationInstitutesResponseData
}

export interface IGetAllEducationInstitutesResponseData {
    totalCount: number;
    educationalInstituteList: IEducationInstitutes[]
}

export interface IEducationInstitutes {
    id: string;
    fullName: string;
    tradeName: string | null;
    panNumber: string;
    email: string;
    phoneNumber: string;
    dob: string;
    aadhaar: string;
    code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    constitutionOfInstitute: string | null;
    website: string | null;
    isActive: boolean;
    branchCount: number;
    createdAt: string;
}

export interface IGetAllEducationInstitutesDetailedResponse extends APIResponseEntity {
    data: IGetAllEducationInstitutesDetailedResponseData
}

export interface IGetAllEducationInstitutesDetailedResponseData {
    id: string;
    fullName: string;
    tradeName: string | null;
    panNumber: string;
    email: string;
    phoneNumber: string;
    dob: string | null;
    aadhaar: string | null;
    gstNumber: string | null;
    code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    constitutionOfInstitute: string;
    website: string | null;
    isActive: boolean;
    authorisedPersons: IEducationalInstituteBranchAuthorisedPerson[];
    agreements?: IGetAllEducationInstitutesDetailedDocuments[]
}

export interface IGetAllEducationInstitutesDetailedDocuments {
    type: string,
    fileUrl: string,
    uploadedAt: string
}

export interface IGetAllEducationInstitutesDetailedBranches {
    id: string;
    branchCode: string;
    branchName: string;
    contactPerson: string;
    mobileNumber: string;
    isPaymentBranch: boolean;
    city: string;
    state: string;
    isActive: boolean;
}

export interface IEducationalInstituteBranchAuthorisedPerson {
    id?: string;
    name: string,
    dateOfBirth: string | null,
    panNumber: string,
    address: string,
    gender: string,
    constitution: string | null,
    constitutionOfInstitute: string | null,
    mobileNumber: string,
    emailAddress: string,
    profilePhotoPath: string,
    profilePhoto?: string | null,
}

export interface IEducationalInstituteBranch {
    id: string;
    instituteID?: string;
    instituteName?: string | null;
    branchCode: string;
    branchName: string;
    contactPersonName?: string | null;
    contactPerson?: string | null;
    mobileNumber?: string | null;
    emailAddress?: string | null;
    state?: string | null;
    city?: string | null;
    isActive?: boolean | null;
    isBillingBranch?: boolean | null;
    isPaymentBranch?: boolean | null;
    panNumber?: string | null;
    panAddress?: string | null;
    aadharNumber?: string | null;
    address?: string | null;
    pinCode?: string | null;
    country?: string | null;
    gstNumber?: string | null;
    gstAddress?: string | null;
    dateOfGstRegistration?: string | null;
    accountHolderName?: string | null;
    bankName?: string | null;
    accountNo?: string | null;
    accountNumber?: string | null;
    ifscCode?: string | null;
    createdDate?: string | null;
    authorisedPersons?: IEducationalInstituteBranchAuthorisedPerson[];
    agreements?: IGetAllEducationInstitutesDetailedDocuments[] | null;
}

export interface IGetEducationalInstituteBranchListResponseData {
    totalCount?: number;
    educationalInstituteBranches?: IEducationalInstituteBranch[];
    educationalInstituteBranchList?: IEducationalInstituteBranch[];
    branches?: IEducationalInstituteBranch[];
}

export interface IGetEducationalInstituteBranchListResponse extends APIResponseEntity {
    data: IGetEducationalInstituteBranchListResponseData;
}

export interface IGetEducationalInstituteBranchDetailsResponse extends APIResponseEntity {
    data: IEducationalInstituteBranch;
}

export interface IGetEducationalInstituteBranchListParams {
    instituteID: string;
    search?: string;
    encryptedSearch?: string;
    stateSearch?: string;
}

export interface IGetAllNBFCResponse extends APIResponseEntity {
    data: IGetAllNBFCResponseData
}

export interface IGetAllNBFCResponseData {
    totalCount: number;
    nBFCUserList: IGetAllNBFC[]
}

export interface IGetAllNBFC {
    id: string;
    fullName: string;
    tradeName: string | null;
    panNumber: string;
    email: string;
    phoneNumber: string;
    dob: string;
    aadhaar: string | null;
    code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    gender: number;
}

export interface IAddEducationalInstituteResponse extends APIResponseEntity {
    data: IAddEducationalInstituteResponseData
}

export interface IAddEducationalInstituteResponseData {
    userID: string;
    parentUserId: string;
    parentUserType: number;
    userName: string;
    masterCPId: string | null;
    showPanDetailPopUp: boolean;
    emailID: string;
    mobileNumber: string;
    token: string;
    userType: number;
    panTypeID: number;
    roleID: number;
    panNumber: string;
    gstNumber: string | null;
    roleName: string;
    whiteLabelSettings: string | null;
    profilePicture: string;
    contractEnforcementDate: string | null;
    isDefaultCpClient: boolean;
    isContractSigned: boolean;
    isUserUnderMasterCP: boolean;
    permissions: {
        rightID: number;
        parentID: number;
        rightName: string;
        create: boolean | null;
        delete: boolean | null;
        view: boolean | null;
        list: boolean;
        displayName: string;
        displayOrder: number
    }[]
}

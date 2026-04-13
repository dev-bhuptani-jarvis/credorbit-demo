import { APIResponseEntity } from "./apiResponse";
import {
    ILoanIndustryOptions,
    ILoanProfessionOptions,
    ILoanUnitOptions,
} from "./loanDetail";

export interface ILoanPropertyPayload {
    propertyType: number;
    size?: string;
    pincode?: string;
    address?: string;
    location?: string;
    ownership?: string;
    saleDeedValue?: string;
    approxMarketValue?: string;
}

export interface LoanValues {
    isSecuredLoanApp: boolean;
    loanCategory: number;
    loanAmount: string;
    hasOtherIncome: boolean | null;
    directorPartnerRemuneration: string;
    interestIncome: string;
    anyOtherIncome: string;
    unit: ILoanUnitOptions;
    profession: ILoanProfessionOptions;
    industry: ILoanIndustryOptions;
    borrowerType: ILoanUnitOptions;
    businessVintage: ILoanUnitOptions;
    typeOfOrganizationWhereEmployeeWorking: ILoanUnitOptions;
    durationOfWorkingAtOrganization: ILoanUnitOptions;
    yearsOfITRFiled: ILoanUnitOptions;
    salarySlipAvailableMonths: ILoanUnitOptions;
    averageGrossMonthlySalary: string;
    bankName?: string;
    properties: ILoanPropertyPayload[];
}

export interface LoanErrors {
    loanCategory: string;
    loanAmount: string;
    hasOtherIncome: string;
    directorPartnerRemuneration: string;
    interestIncome: string;
    anyOtherIncome: string;
    unit: string;
    profession: string;
    industry: string;
    borrowerType: string;
    businessVintage: string;
    typeOfOrganizationWhereEmployeeWorking: string;
    durationOfWorkingAtOrganization: string;
    yearsOfITRFiled: string;
    salarySlipAvailableMonths: string;
    averageGrossMonthlySalary: string;
    bankName: string;
}

export interface IAddLoanApplication {
    clientID: string;
    loanTypeID: number;
    loanAmount: number;
    isSecuredLoanApp: boolean;
    hasOtherIncome?: boolean;
    directorPartnerRemuneration?: number;
    interestIncome?: number;
    anyOtherIncome?: number;
    typeOfBusinessID: number;
    professionID: number;
    industryID: number;
    typeOfBorrower: number;
    typeOfOrganizationWhereEmployeeWorking?: number;
    durationOfWorkingAtOrganization?: number;
    yearsOfITRFiled?: number;
    salarySlipAvailableMonths?: number;
    averageGrossMonthlySalary?: number;
    businessVintage?: number;
    properties?: ILoanPropertyPayload[];
}

export interface IGetApplyForLoanResponse extends APIResponseEntity {
    data: IApplyLoanValues;
}

export interface IApplyLoanValues {
    channelPartnerCode: string;
    channelPartnerPayoutPercent: number | undefined;
    sourcingPartnerName: string | null;
    sourcingPartnerPayoutPercent: number;
    coApplicantsList: ICoApplicantList[];
}

export interface ICoApplicantList {
    id: string;
    name: string;
    pan: string;
    aadhaarNumber: string | null;
}

export interface IGetApplyForLoanParams {
    loanApplicationID: string;
    bankID?: number;
}

export interface ISubmitCoApplicant {
    loanApplicationID: string;
    coApplicantsList?: string[];
    dsaCode?: string;
    referenceName1?: string;
    referenceName2?: string;
    referenceMobile1?: string;
    referenceMobile2?: string;
    referenceAddress1?: string;
    referenceAddress2?: string;
    bankID: number;
    loanTenureID: number;
    rateOfInterest: number;
}

export interface IBankInfo {
    bankID: number;
    loanTenureID: number;
    rateOfInterest: number;
}

export interface IApplyLoanValidation {
    dsaCode: string;
    payoutPercentage: string;
}

export interface ApplyLoanModalProps {
    loanModal: boolean;
    setLoanModal: (visible: boolean) => void;
    bankInfo: IBankInfo;
}

export interface IReferences {
    referenceName1: string;
    referenceMobile1: string;
    referenceAddress1: string;
    referenceName2: string;
    referenceMobile2: string;
    referenceAddress2: string;
}

export interface IApplyLoanApplicationResponse extends APIResponseEntity {
    data: IApplyLoanApplicationResponseData;
}

interface IApplyLoanApplicationResponseData {
    loanAppID: string;
    customerID: string;
    loanStatusID: number;
    loanTypeID: number;
    loanTenureID: null;
    loanAmount: number;
    loanProcessorID: string;
    loanProcessorType: number;
    createdDate: string;
}

export interface ISubmitLoanApplicationToBankResponse extends APIResponseEntity {
    data: ISubmitApplicationToBankDetailsResponseData,
}

export interface ISubmitApplicationToBankDetailsResponseData {
    packageZipUrl: string,
    loanDetails: ISubmitApplicationToBankDetailsLoanDetails,
    applicantInfo: ISubmitApplicationToBankDetailsApplicantInfo,
    cpInfo: ISubmitApplicationToBankDetailsCPInfo
}

export interface ISubmitApplicationToBankDetailsLoanDetails {
    loanType: string,
    loanAmount: number,
    loanTenure: number | null,
    loanPurpose: string,
    name: string,
    managerEmail: string,
    loanApplicationCode: string,
}

export interface ISubmitApplicationToBankDetailsApplicantInfo {
    fullName: string,
    phoneNumber: string,
    email: string,
    code: string,
    id: string
}

export interface ISubmitApplicationToBankDetailsCPInfo {
    fullName: string,
    phoneNumber: string,
    email: string,
    code: string,
    id: string
}

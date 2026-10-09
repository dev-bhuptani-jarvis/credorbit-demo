import { APIResponseEntity } from "./apiResponse";
import {
  ILoanIndustryOptions,
  ILoanProfessionOptions,
  ILoanUnitOptions,
} from "./loanDetail";

export interface LoanValues {
  isSecuredLoanApp: boolean;
  loanCategory: number;
  loanAmount: string;
  hasOtherIncome?: boolean | null;
  directorPartnerRemuneration?: string;
  interestIncome?: string;
  anyOtherIncome?: string;
  approxMarketValue?: string;
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
  saleDeedValue: string;
}
export interface LoanErrors {
  loanCategory: string;
  loanAmount: string;
  hasOtherIncome?: string;
  directorPartnerRemuneration?: string;
  interestIncome?: string;
  anyOtherIncome?: string;
  approxMarketValue?: string;
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
  saleDeedValue: string;
}

export interface IAddLoanApplication {
  clientID: string;
  leadId?: string;
  loanTypeID: number;
  loanAmount: number;
  isSecuredLoanApp: boolean;
  hasOtherIncome?: boolean;
  directorPartnerRemuneration?: number;
  interestIncome?: number;
  anyOtherIncome?: number;
  approxMarketValue?: number;
  typeOfBusinessID: number;
  professionID: number;
  industryID: number;
  typeOfBorrower: number;
  saleDeedValue: number;
  typeOfOrganizationWhereEmployeeWorking?: number;
  durationOfWorkingAtOrganization?: number;
  yearsOfITRFiled?: number;
  salarySlipAvailableMonths?: number;
  averageGrossMonthlySalary?: number;
  businessVintage?: number
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

export interface IAddLoanApplicationForEducationalInstituteResponse extends APIResponseEntity {
  data: IAddLoanApplicationForEducationalInstituteResponseData
}

export interface IAddLoanApplicationForEducationalInstituteResponseData {
  loanAppID: string,
  customerID: string,
  loanStatusID: number,
  loanTypeID: number,
  loanTenureID: number | null,
  loanAmount: number,
  loanProcessorID: string,
  loanProcessorType: number,
  createdDate: number
}

export interface IFetchEducationPortalLoanDetailsResponse extends APIResponseEntity {
  data: IFetchEducationPortalLoanDetailsData;
}

export interface IFetchEducationPortalLoanDetailsData {
  studentID: string;
  loanApplicationID: string;
  loanApplicationCode: string;
  creditScore: string | null;
  abb: number | null;
  studentInfo: ILoanStudentInfo;
  loanStructure: ILoanStructure;
  consent: ILoanConsent;
  applicants: ILoanParticipant[];
  coApplicants: ILoanParticipant[];
}

export interface ILoanStudentInfo {
  studentName: string,
  studentCode: string,
  course: string,
  dateOfBirth: string,
  gender: string,
  creditScore: string | null,
  abb: number | null,
  lastTimeCreditScoreFetchDate: string | null,
  pan: string,
  mobileNumber: string,
  emailAddress: string,
  address: string,
  photo: string,
  panDocument: string,
  aadharDocument: string
}

export interface ILoanStructure {
  courseID: string;
  course: string;
  tenureInYears: number;
  agreedFee: number;
  discountRate: number;
  discountAmount: number;
  netAgreedFee: number;
  downPayment: number;
  emiPlanInMonths: number;
  advancedEMIMonths: number;
  advancedEMIAmount: number;
  remainingEMIs: number;
  disbursementToInstitute: number;
  netLoanAmount: number;
  emiAmount: number;
  emiAmountDescription: string;
}

export interface ILoanConsent {
  isTermsAndPrivacyConsentGiven: boolean;
  isCreditInformationConsentGiven: boolean;
  isDigiLockerConsentGiven: boolean;
  isDataSharingConsentGiven: boolean;
  isCommunicationConsentGiven: boolean;
  consentedAt: string | null;
}

export interface ILoanParticipant {
  participantID: string;
  participantUserType: number;
  name: string;
  pan: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string | null;
  emailAddress: string;
  address: string;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  relation: string | null;
  isVerified: boolean;
  verificationStatus: string;
  photo: string;
  panDocument: string;
  aadharDocument: string;
}

export interface IGetLoanMarketPlaceForEducationalInstituteResponse extends APIResponseEntity {
  data: IGetLoanMarketPlaceForEducationalInstituteResponseData;
}

export interface IGetLoanMarketPlaceForEducationalInstituteResponseData {
  studentID: string;
  loanApplicationID: string;
  loanApplicationCode: string;
  studentInfo: ILoanMarketplaceStudentInfo;
  loanStructure: ILoanMarketplaceLoanStructure;
  courseDetails: ILoanMarketplaceLoanStructure;
  creditScore: number | null;
  abb: number | null;
  consent: ILoanMarketplaceConsent;
  applicants: ILoanMarketplaceParticipant[];
  coApplicants: ILoanMarketplaceParticipant[];
  isPaymentDone: boolean;
  bankDetails: ILoanMarketplaceBankDetail[];
}

export interface ILoanMarketplaceStudentInfo {
  studentName: string;
  studentCode: string;
  course: string;
  dateOfBirth: string;
  gender: string;
  creditScore: number | null;
  abb: number | null;
  lastTimeCreditScoreFetchDate: string | null;
  pan: string;
  mobileNumber: string;
  emailAddress: string;
  address: string;
  photo: string;
  panDocument: string;
  aadharDocument: string;
}

export interface ILoanMarketplaceLoanStructure {
  courseID: string;
  course: string;
  tenureInYears: number;
  agreedFee: number;
  discountRate: number;
  discountAmount: number;
  netAgreedFee: number;
  downPayment: number;
  emiPlanInMonths: number;
  advancedEMIMonths: number;
  advancedEMIAmount: number;
  remainingEMIs: number;
  disbursementToInstitute: number;
  netLoanAmount: number;
  emiAmount: number;
  emiAmountDescription: string;
}

export interface ILoanMarketplaceConsent {
  isTermsAndPrivacyConsentGiven: boolean;
  isCreditInformationConsentGiven: boolean;
  isDigiLockerConsentGiven: boolean;
  isDataSharingConsentGiven: boolean;
  isCommunicationConsentGiven: boolean;
  consentedAt: string | null;
}

export interface ILoanMarketplaceParticipant {
  participantID: string;
  participantUserType: number;
  name: string;
  pan: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string | null;
  emailAddress: string;
  address: string;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  relation: string | null;
  photo: string;
  panDocument: string;
  aadharDocument: string;
  isVerified: boolean;
  verificationStatus: string;
}

export interface ILoanMarketplaceBankDetail {
  nbfcID: string;
  nbfcName: string;
  bankID: number;
  bankName: string;
  loanAmount: number;
  emi: number;
  roi_Min: number;
  roi_Max: number;
  tenure: number;
  loanType: string;
  loanTypeID: number;
  minCreditScore: number;
  bankImage: string;
  processingFeeAmount: number;
  advancedEMI: number;
  remainingEMI: number;
  interestAmount: number;
  disbursementToInstitute: number;
  isPaymentDone: boolean;
}

export interface ISubmitLoanApplicationToBankForEducationInstituteResponse
  extends APIResponseEntity {
  data: ISubmitLoanApplicationToBankForEducationInstituteResponseData;
}

export interface ISubmitLoanApplicationToBankForEducationInstituteResponseData {
  packageZipUrl: string;
  loanDetails: ISubmittedLoanDetails;
  applicantInfo: ILoanApplicationPersonInfo;
  cpInfo: ILoanApplicationPersonInfo;
}

export interface ISubmittedLoanDetails {
  loanType: string;
  loanTypeId: number;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  name: string;
  managerEmail: string;
  loanApplicationCode: string;
}

export interface ILoanApplicationPersonInfo {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  code: string;
}

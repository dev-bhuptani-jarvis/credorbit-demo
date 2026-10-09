import { APIResponseEntity } from "./apiResponse";

export interface IUserProfileResponse extends APIResponseEntity {
  data: IUserInfo;
}

export interface IPincodeFetchDetailsResponse extends APIResponseEntity {
  data: IPincodeFetchDetails;
}

export interface IUserInfo {
  id?: string;
  name: string;
  fullName?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  profilePicture?: string;
  gstList: IGSTListInfo[];
  billingDetails: boolean;
  role: string;
  customerID?: string;
  isCompany: boolean;
  coApplicants: CoApplicantData[];
  partners: PartnerData[];
  commission?: number;
  bankAccountNumber: string | null;
  bankName: string | null;
  ifscCode: string | null;
  dateOfBirth: string;
  selectedGstNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  aadhaar: string | null;
  country: string;
  udhyamAadhaar: string | null;
  userConsents: UserConsentData[];
  cpCompanyLogo?: string;
  cinOrLLP?: string | null;
  gstInfo: UserGstInfo;
  category?: string | null;
  tradeName?: string | null;
  gstNumber?: string | null;
  constitution?: string | null;
  constitutionOfInstitute?: string | null;
  website?: string | null;
  maskedAadhaar?: string | null;
}

interface UserGstInfo {
  tradeName: string | null;
  gstAddress: string | null;
  dateOfGstRegistration: string | null;
}

interface UserConsentData {
  userConsentID: number;
  consentName: string;
  isConsented: boolean;
}

export interface IGSTListInfo {
  gstNumber: string;
  dateOfGstRegistration?: string | null;
  gstAddress?: string | null;
  tradeName?: string | null;
  dateOfRegistration?: string | null;
}

interface CoApplicantData {
  id: string;
  aadhaarNumber: string;
  name: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  pan: string;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  pinCode?: string | null;
  mobile?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  creditScore?: number | null;
}

interface PartnerData {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  pan: string;
  aadhaarNumber: string;
  address: string | null;
  state: string | null;
  city: string | null;
  pinCode: string | null;
  mobile: string | null;
  emailID?: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  creditScore: string | null;
  constitution?: string | null;
  constitutionOfInstitute?: string | null;
  profilePhoto?: File | null;
  profilePhotoUrl?: string | null;
}

export interface IUserValidation {
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  aadhaar: string;
  mobileNumber: string;
  cinOrLLP?: string;
  udhyamAadhaar?: string;
}

export interface IProfileFieldUpdateable {
  aadhaar: boolean;
  address: boolean;
  city: boolean;
  state: boolean;
  zipCode: boolean;
  mobileNumber: boolean;
}

export interface IUpdateAadhaarBody {
  clientID: string;
  otp: string;
  coapplicantOrPartnerID: string;
  aadhaarNumber: string;
  userType: number;
}

export interface IDeleteUser {
  userId: string;
  userType: number;
}

export interface IPincodeFetchDetails {
  name: string;
  district: string;
  state: string;
  circle: string;
  division: string;
  country: string;
}

export interface IValidateUdhyamNumberBody {
  udyamRegNo: string;
}

export interface IValidateCINNumberBody {
  cin: string;
}

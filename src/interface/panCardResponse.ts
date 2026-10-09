import { APIResponseEntity } from "./apiResponse";

export interface IPanCardResponse extends APIResponseEntity {
  data: PanCardResponse;
}

export interface PanCardResponse {
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  isTnCAccepted: boolean;
  isIndianAdult: boolean;
  userType: number;
  otpType: number;
  userID: string;
}

export interface PanCardValidation {
  panNumber: string;
  emailID: string;
  mobileNumber: string;
}

export interface OnlyPanNumber {
  panNumber: string;
  sourcingPartner?: string;
  parentID?: string;
}

export interface IAddPanCardResponse extends APIResponseEntity {
  data: IAddPanCardResponseData;
}

export interface IAddPanCardResponseData {
  panNumber: string;
  emailID: string | null;
  mobileNumber: string | null;
  fullName: string;
  category: string;
  website?: string | null;
  tradeName?: string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  maskedAadhaar?: string;
  gender?: string;
  gstNumber?: IGstNumberDetails[] | null;
}

export interface IGstNumberDetails {
  gstin: string;
  state: string;
  stateCode: string;
  activeStatus: string;
}

export interface IConfirmDetail {
  panNumber: string | null;
  emailID: string | null;
  mobileNumber: string | null;
  fullName: string;
  category: string;
  gstNumber?: string | null;
  gstDetails?: IGstNumberDetails[] | null;
  constitutionOfInstitute?: string | null;
  constitution?: string | null;
  website?: string | null;
  tradeName?: string | null;
  dob?: string | null;
  address?: string | null;
  state?: string | null;
  city?: string | null;
  zipCode?: string | null;
  maskedAadhaar?: string | null;
  gender?: string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

export interface IUpdatedFormValues {
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  userID: string;
  userType: number;
}

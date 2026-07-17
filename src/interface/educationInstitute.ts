export interface IEducationInstituteDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export type EducationInstitutePersonGender = "Male" | "Female" | "Other" | "";

export interface IEducationInstituteAuthorizedPerson {
  id: string;
  panNumber: string;
  fullName: string;
  constitution: string;
  dateOfBirth: string;
  gender: EducationInstitutePersonGender;
  gstNumber: string;
  mobileNumber: string;
  email: string;
}

export interface IEducationInstituteBranch {
  id: string;
  branchCode: string;
  branchName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  state: string;
  city: string;
  address: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isActive: boolean;
  isPaymentBranch: boolean;
  createdAt: string;
  updatedAt: string;
  documents: IEducationInstituteDocument[];
}

export interface IEducationInstitute {
  id: string;
  instituteCode: string;
  instituteName: string;
  category: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  state: string;
  city: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  registrationNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documents: IEducationInstituteDocument[];
  totalStudents: number;
  authorizedPersons: IEducationInstituteAuthorizedPerson[];
  branches: IEducationInstituteBranch[];
}

export interface IEducationInstituteFormData {
  institutePanNumber: string;
  instituteName: string;
  category: string;
  mobileNumber: string;
  email: string;
  gstNumber: string;
  contactPerson: string;
  state: string;
  city: string;
  address: string;
  registrationNumber: string;
  isActive: boolean;
  authorizedPersons: IEducationInstituteAuthorizedPerson[];
}

export interface IEducationInstituteBranchFormData {
  branchName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  state: string;
  city: string;
  address: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isActive: boolean;
}

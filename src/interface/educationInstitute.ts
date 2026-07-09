export interface IEducationInstituteDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
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
  branches: IEducationInstituteBranch[];
}

export interface IEducationInstituteFormData {
  instituteName: string;
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

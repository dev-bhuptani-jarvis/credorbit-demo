export type EducationPersonGender = "Male" | "Female" | "Other" | "";

export interface IEducationStudentFormData {
  studentName: string;
  studentPan: string;
  studentPanDocument: string | null;
  studentAadhaarDocument: string | null;
  studentDateOfBirth: string;
  studentGender: EducationPersonGender;
  studentPhoto: string | null;
  mobileNumber: string;
  email: string;
  address: string;
  applicants: IEducationStudentApplicant[];
  coApplicantName: string;
  coApplicantMobileNumber: string;
  coApplicantRelation: string;
  isActive: boolean;
}

export interface IEducationStudentApplicant {
  id?: string;
  name: string;
  pan: string;
  panDocument: string | null;
  aadhaarDocument: string | null;
  dateOfBirth: string;
  gender: EducationPersonGender;
  mobileNumber: string;
  email: string;
  photo: string | null;
  address?: string;
}

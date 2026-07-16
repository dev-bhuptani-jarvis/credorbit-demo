import {
  IEducationStudentApplicant,
  IEducationStudentFormData,
} from "../../interface/educationManagement";

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const createEmptyApplicant = (): IEducationStudentApplicant => ({
  id: `applicant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  pan: "",
  panDocument: null,
  aadhaarDocument: null,
  dateOfBirth: "",
  gender: "",
  mobileNumber: "",
  email: "",
  photo: null,
  address: "",
});

export const defaultStudentForm: IEducationStudentFormData = {
  studentName: "",
  courseId: "",
  studentPan: "",
  studentPanDocument: null,
  studentAadhaarDocument: null,
  studentDateOfBirth: "",
  studentGender: "",
  studentPhoto: null,
  isMinor: false,
  parentPan: "",
  mobileNumber: "",
  email: "",
  address: "",
  applicants: [createEmptyApplicant()],
  coApplicantName: "",
  coApplicantMobileNumber: "",
  coApplicantRelation: "",
  isActive: true,
};

export const toInputDate = (value: string): Date | null =>
  value ? new Date(value) : null;

export const toIsoDate = (value: Date | null): string =>
  value
    ? new Date(value.getTime() - value.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    : "";

export const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

export const convertFileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });

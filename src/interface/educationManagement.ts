import { APIResponseEntity } from "./apiResponse";

export interface IEducationCourse {
  id: string;
  courseName: string;
  courseTenure: string;
  courseFees: number;
  courseType: "Online" | "Offline";
  isJobGuaranteed: boolean;
  description: string;
  numberOfEmi: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IEducationCourseFormData {
  courseName: string;
  courseTenure: string;
  courseFees: string;
  courseType: "Online" | "Offline" | "";
  isJobGuaranteed: boolean;
  numberOfEmi: number;
  description: string;
  isActive: boolean;
}

export interface IEducationStudentLoanSummary {
  enrolledCourseCount: number;
  appliedLoanAmount: number;
  totalLoansAvailed: number;
  activeLoans: number;
  closedLoans: number;
  outstandingAmount: number;
  emiInformation: string;
  repaymentStatus: string;
}

export interface IEducationStudentCreditSummary {
  creditBureauSummary: string;
  creditScore: number;
  creditHistory: string;
}

export interface IEducationStudent {
  id: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseName: string;
  studentPan: string;
  isMinor: boolean;
  parentPan: string;
  mobileNumber: string;
  email: string;
  coApplicantName: string;
  coApplicantMobileNumber: string;
  coApplicantRelation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  loanDetails: IEducationStudentLoanSummary;
  creditInformation: IEducationStudentCreditSummary;
}

export interface IEducationStudentFormData {
  studentName: string;
  courseId: string;
  studentPan: string;
  isMinor: boolean;
  parentPan: string;
  mobileNumber: string;
  email: string;
  coApplicantName: string;
  coApplicantMobileNumber: string;
  coApplicantRelation: string;
  isActive: boolean;
}

export interface IEducationStudentEnrollment {
  id: string;
  draftId?: string;
  studentUserId: string;
  instituteName: string;
  courseName: string;
  duration: string;
  feeStructure: number;
  courseType: "Online" | "Offline";
  loanAccountNumber: string;
  loanAmount: number;
  outstandingAmount: number;
  emiAmount: number;
  emiSchedule: string;
  repaymentStatus: "On-Time" | "Delayed" | "Overdue" | "Closed" | "Pending";
  loanStatus: "Active" | "Closed";
  applicationStatus:
    | "Pending"
    | "Approved"
    | "Sanctioned"
    | "Disbursed"
    | "Rejected"
    | "Query Raised";
  sanctionLetterUrl?: string | null;
  loanAgreementUrl?: string | null;
  repaymentScheduleUrl?: string | null;
  creditBureauSummary: string;
  creditScore: number;
  creditHistory: string;
  createdAt: string;
}

export type EducationDiscountType = "percentage" | "amount";

export interface IEducationLoanDraft {
  id: string;
  studentId: string;
  studentUserId: string;
  instituteName: string;
  studentName: string;
  studentPan: string;
  studentEmail: string;
  studentMobileNumber: string;
  parentPan?: string;
  coApplicantName?: string;
  coApplicantMobileNumber?: string;
  coApplicantRelation?: string;
  courseId: string;
  courseName: string;
  courseTenure: string;
  courseType: "Online" | "Offline";
  courseFees: number;
  emiOptionMonths: number;
  downpayment: number;
  discountType: EducationDiscountType;
  discountValue: number;
  discountAmount: number;
  discountedCourseFee: number;
  loanAmount: number;
  advanceEmi: number;
  numberOfEmis: number;
  emiAmount: number;
  totalAmountToInstitute: number;
  consentAccepted: boolean;
  hasCoApplicant: boolean;
  loanApplicationStatus:
    | "Pending"
    | "Approved"
    | "Sanctioned"
    | "Disbursed"
    | "Rejected"
    | "Query Raised";
  sanctionDate: string | null;
  disbursementDate: string | null;
  utrNumber: string;
  transactionReference: string;
  disbursementRemarks: string;
  queryRemarks: string;
  enachEnabled: boolean;
  enachRegisteredAt: string | null;
  loanAgreementSentAt: string | null;
  sanctionLetterUrl: string | null;
  loanAgreementUrl: string | null;
  repaymentScheduleUrl: string | null;
  disbursementAdviceUrl: string | null;
  status: "draft" | "cam_generated" | "submitted";
  createdAt: string;
  updatedAt: string;
}

export interface ICreateEducationLoanDraftBody {
  student: IEducationStudent;
  course: IEducationCourse;
  instituteName: string;
  courseFees: number;
  emiOptionMonths: number;
  downpayment: number;
  discountType: EducationDiscountType;
  discountValue: number;
}

export interface ICreateEducationLoanDraftResponse extends APIResponseEntity {
  data: IEducationLoanDraft;
}

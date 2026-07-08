export interface IEducationCourse {
  id: string;
  courseName: string;
  courseTenure: string;
  courseFees: number;
  courseType: "Online" | "Offline";
  isJobGuaranteed: boolean;
  description: string;
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
  description: string;
  isActive: boolean;
}

export interface IEducationStudentLoanSummary {
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

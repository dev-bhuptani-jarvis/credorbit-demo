import { IEducationStudentEnrollment } from "../../interface/educationManagement";

const STUDENT_USER_ID = "student-role-001";

const STORAGE_KEY = "credorbit.studentEnrollments";

const seedEnrollments: IEducationStudentEnrollment[] = [
  {
    id: "enroll-001",
    studentUserId: STUDENT_USER_ID,
    instituteName: "Education Institute One",
    courseName: "BBA in Finance and Lending",
    duration: "3 Years",
    feeStructure: 180000,
    courseType: "Offline",
    loanAccountNumber: "EDULOAN001245",
    loanAmount: 150000,
    outstandingAmount: 92000,
    emiAmount: 8450,
    emiSchedule: "5th of every month",
    repaymentStatus: "On-Time",
    loanStatus: "Active",
    applicationStatus: "Disbursed",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    creditBureauSummary: "Healthy repayment history with steady monthly servicing.",
    creditScore: 744,
    creditHistory: "One active education loan with no missed EMI records to date.",
    createdAt: "2026-05-08T10:30:00.000Z",
  },
  {
    id: "enroll-002",
    studentUserId: STUDENT_USER_ID,
    instituteName: "Education Institute One",
    courseName: "Certificate in NBFC Operations",
    duration: "6 Months",
    feeStructure: 55000,
    courseType: "Offline",
    loanAccountNumber: "EDULOAN001389",
    loanAmount: 50000,
    outstandingAmount: 0,
    emiAmount: 4200,
    emiSchedule: "18th of every month",
    repaymentStatus: "Closed",
    loanStatus: "Closed",
    applicationStatus: "Approved",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    creditBureauSummary: "Short-tenure loan completed successfully without repayment stress.",
    creditScore: 758,
    creditHistory: "One closed education loan and one active loan, both handled well.",
    createdAt: "2026-02-12T14:00:00.000Z",
  },
  {
    id: "enroll-003",
    studentUserId: STUDENT_USER_ID,
    instituteName: "Education Institute One",
    courseName: "Diploma in Credit Underwriting",
    duration: "12 Months",
    feeStructure: 95000,
    courseType: "Online",
    loanAccountNumber: "EDULOAN001512",
    loanAmount: 85000,
    outstandingAmount: 41000,
    emiAmount: 5250,
    emiSchedule: "10th of every month",
    repaymentStatus: "Delayed",
    loanStatus: "Active",
    applicationStatus: "Disbursed",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    creditBureauSummary: "Minor repayment delays observed but the account is still serviceable.",
    creditScore: 701,
    creditHistory: "A few EMIs were delayed during the last quarter but no write-off risk identified.",
    createdAt: "2026-04-04T09:15:00.000Z",
  },
  {
    id: "enroll-004",
    studentUserId: STUDENT_USER_ID,
    instituteName: "Education Institute One",
    courseName: "Advanced Lending Analytics",
    duration: "18 Months",
    feeStructure: 125000,
    courseType: "Offline",
    loanAccountNumber: "EDULOAN001648",
    loanAmount: 110000,
    outstandingAmount: 73500,
    emiAmount: 6100,
    emiSchedule: "12th of every month",
    repaymentStatus: "Overdue",
    loanStatus: "Active",
    applicationStatus: "Disbursed",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    creditBureauSummary: "Repayment has crossed the expected schedule and needs immediate attention.",
    creditScore: 668,
    creditHistory: "Recent overdue behaviour is visible against the active education loan.",
    createdAt: "2026-03-11T11:45:00.000Z",
  },
];

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && !!window.localStorage;

const persistEnrollments = (enrollments: IEducationStudentEnrollment[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
};

const normalizeEnrollments = (
  enrollments: IEducationStudentEnrollment[],
): IEducationStudentEnrollment[] => {
  const existingEnrollmentIds = new Set(enrollments.map((enrollment) => enrollment.id));
  const missingSeedEnrollments = seedEnrollments.filter(
    (enrollment) => !existingEnrollmentIds.has(enrollment.id),
  );

  return [...enrollments, ...missingSeedEnrollments];
};

const getAllEnrollments = (): IEducationStudentEnrollment[] => {
  if (!canUseStorage()) return seedEnrollments;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    persistEnrollments(seedEnrollments);
    return seedEnrollments;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationStudentEnrollment[];
    if (!Array.isArray(parsedValue)) {
      return seedEnrollments;
    }

    const normalizedEnrollments = normalizeEnrollments(parsedValue);

    if (JSON.stringify(normalizedEnrollments) !== JSON.stringify(parsedValue)) {
      persistEnrollments(normalizedEnrollments);
    }

    return normalizedEnrollments;
  } catch {
    persistEnrollments(seedEnrollments);
    return seedEnrollments;
  }
};

export const getStudentEnrollments = (
  studentUserId: string = STUDENT_USER_ID,
): IEducationStudentEnrollment[] =>
  getAllEnrollments().filter((item) => item.studentUserId === studentUserId);

export const getStudentEnrollmentById = (
  enrollmentId: string,
): IEducationStudentEnrollment | undefined =>
  getAllEnrollments().find((item) => item.id === enrollmentId);

export const addStudentEnrollment = (
  enrollment: IEducationStudentEnrollment,
): IEducationStudentEnrollment => {
  const enrollments = getAllEnrollments();
  persistEnrollments([enrollment, ...enrollments]);
  return enrollment;
};

export const updateStudentEnrollmentApplicationStatus = (
  enrollmentId: string,
  applicationStatus: IEducationStudentEnrollment["applicationStatus"],
): IEducationStudentEnrollment | undefined => {
  const enrollments = getAllEnrollments();
  let updatedEnrollment: IEducationStudentEnrollment | undefined;

  const nextEnrollments = enrollments.map((enrollment) => {
    if (enrollment.id !== enrollmentId) return enrollment;

    updatedEnrollment = {
      ...enrollment,
      applicationStatus,
      loanStatus:
        applicationStatus === "Rejected" || applicationStatus === "Approved"
          ? "Closed"
          : "Active",
      outstandingAmount:
        applicationStatus === "Rejected" ? 0 : enrollment.outstandingAmount,
      repaymentStatus:
        applicationStatus === "Disbursed"
          ? enrollment.repaymentStatus
          : applicationStatus === "Rejected"
            ? "Closed"
            : "Pending",
    };

    return updatedEnrollment;
  });

  persistEnrollments(nextEnrollments);
  return updatedEnrollment;
};

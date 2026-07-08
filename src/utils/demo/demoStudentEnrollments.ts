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
    creditBureauSummary: "Short-tenure loan completed successfully without repayment stress.",
    creditScore: 758,
    creditHistory: "One closed education loan and one active loan, both handled well.",
    createdAt: "2026-02-12T14:00:00.000Z",
  },
];

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && !!window.localStorage;

const persistEnrollments = (enrollments: IEducationStudentEnrollment[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
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
    return Array.isArray(parsedValue) ? parsedValue : seedEnrollments;
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

import {
  IEducationStudent,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { getEducationCourseById, getEducationCourses } from "./demoEducationCourses";

const STORAGE_KEY = "credorbit.educationStudents";

const normalizeStudentLoanDetails = (
  student: IEducationStudent,
): IEducationStudent => ({
  ...student,
  loanDetails: {
    ...student.loanDetails,
    enrolledCourseCount:
      student.loanDetails.enrolledCourseCount || student.loanDetails.totalLoansAvailed || 1,
    appliedLoanAmount:
      student.loanDetails.appliedLoanAmount || student.loanDetails.outstandingAmount || 0,
  },
});

const seedStudents: IEducationStudent[] = [
  {
    id: "student-001",
    studentCode: "COSTU2001",
    studentName: "Aarav Shah",
    courseId: "course-001",
    courseName: "BBA in Finance and Lending",
    studentPan: "AARAV1234S",
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876501122",
    email: "aarav.shah@student.demo",
    coApplicantName: "Rohit Shah",
    coApplicantMobileNumber: "9876502211",
    coApplicantRelation: "Father",
    isActive: true,
    createdAt: "2026-05-01T11:00:00.000Z",
    updatedAt: "2026-05-01T11:00:00.000Z",
    loanDetails: {
      enrolledCourseCount: 2,
      appliedLoanAmount: 240000,
      totalLoansAvailed: 2,
      activeLoans: 1,
      closedLoans: 1,
      outstandingAmount: 185000,
      emiInformation: "INR 8,500 / month",
      repaymentStatus: "On-Time",
    },
    creditInformation: {
      creditBureauSummary: "Healthy student borrower with timely EMI history.",
      creditScore: 742,
      creditHistory: "1 closed education loan and 1 active loan with no reported defaults.",
    },
  },
  {
    id: "student-002",
    studentCode: "COSTU2002",
    studentName: "Diya Patel",
    courseId: "course-002",
    courseName: "Diploma in Credit Underwriting",
    studentPan: "DIYAP1234P",
    isMinor: true,
    parentPan: "PATEL1234K",
    mobileNumber: "9876503344",
    email: "diya.patel@student.demo",
    coApplicantName: "Nikita Patel",
    coApplicantMobileNumber: "9876505566",
    coApplicantRelation: "Mother",
    isActive: true,
    createdAt: "2026-05-07T14:30:00.000Z",
    updatedAt: "2026-05-07T14:30:00.000Z",
    loanDetails: {
      enrolledCourseCount: 1,
      appliedLoanAmount: 95000,
      totalLoansAvailed: 1,
      activeLoans: 1,
      closedLoans: 0,
      outstandingAmount: 92000,
      emiInformation: "INR 4,250 / month",
      repaymentStatus: "Delayed",
    },
    creditInformation: {
      creditBureauSummary: "Thin-file student profile supported by parent co-applicant.",
      creditScore: 689,
      creditHistory: "New borrower with one active education loan and minor repayment delays.",
    },
  },
  {
    id: "student-003",
    studentCode: "COSTU2003",
    studentName: "Kavya Nair",
    courseId: "COCOU2603",
    courseName: "Certificate in NBFC Operations",
    studentPan: "KAVYA1234N",
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876507788",
    email: "kavya.nair@student.demo",
    coApplicantName: "Suresh Nair",
    coApplicantMobileNumber: "9876508899",
    coApplicantRelation: "Father",
    isActive: true,
    createdAt: "2026-05-10T10:15:00.000Z",
    updatedAt: "2026-05-10T10:15:00.000Z",
    loanDetails: {
      enrolledCourseCount: 1,
      appliedLoanAmount: 55000,
      totalLoansAvailed: 1,
      activeLoans: 1,
      closedLoans: 0,
      outstandingAmount: 48000,
      emiInformation: "INR 4,200 / month",
      repaymentStatus: "Overdue",
    },
    creditInformation: {
      creditBureauSummary: "Short-tenure borrower with overdue installments requiring follow-up.",
      creditScore: 661,
      creditHistory: "One active education loan with overdue repayment behaviour.",
    },
  },
  {
    id: "student-004",
    studentCode: "COSTU2004",
    studentName: "Rohan Mehta",
    courseId: "COCOU2601",
    courseName: "BBA in Finance and Lending",
    studentPan: "ROHAN1234M",
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876509900",
    email: "rohan.mehta@student.demo",
    coApplicantName: "Milan Mehta",
    coApplicantMobileNumber: "9876509911",
    coApplicantRelation: "Brother",
    isActive: true,
    createdAt: "2026-05-12T09:45:00.000Z",
    updatedAt: "2026-05-12T09:45:00.000Z",
    loanDetails: {
      enrolledCourseCount: 2,
      appliedLoanAmount: 180000,
      totalLoansAvailed: 2,
      activeLoans: 0,
      closedLoans: 2,
      outstandingAmount: 0,
      emiInformation: "Closed",
      repaymentStatus: "Closed",
    },
    creditInformation: {
      creditBureauSummary: "Completed both course-linked loans without any residual balance.",
      creditScore: 771,
      creditHistory: "Two education loans successfully closed with solid repayment discipline.",
    },
  },
  {
    id: "student-005",
    studentCode: "COSTU2005",
    studentName: "Mihir Joshi",
    courseId: "COCOU2602",
    courseName: "Diploma in Credit Underwriting",
    studentPan: "MIHIR1234J",
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876506677",
    email: "mihir.joshi@student.demo",
    coApplicantName: "Rupal Joshi",
    coApplicantMobileNumber: "9876507766",
    coApplicantRelation: "Mother",
    isActive: true,
    createdAt: "2026-05-15T16:20:00.000Z",
    updatedAt: "2026-05-15T16:20:00.000Z",
    loanDetails: {
      enrolledCourseCount: 1,
      appliedLoanAmount: 95000,
      totalLoansAvailed: 1,
      activeLoans: 1,
      closedLoans: 0,
      outstandingAmount: 76000,
      emiInformation: "INR 3,950 / month",
      repaymentStatus: "On-Time",
    },
    creditInformation: {
      creditBureauSummary: "Consistent repayment pattern with a stable student credit profile.",
      creditScore: 733,
      creditHistory: "One active education loan with clean on-time EMI servicing.",
    },
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const normalizeEducationStudents = (
  students: IEducationStudent[],
): IEducationStudent[] => {
  const normalizedStudents = students.map(normalizeStudentLoanDetails);
  const existingStudentIds = new Set(normalizedStudents.map((student) => student.id));
  const missingSeedStudents = seedStudents.filter(
    (student) => !existingStudentIds.has(student.id),
  );

  return [...normalizedStudents, ...missingSeedStudents.map(normalizeStudentLoanDetails)];
};

const persistStudents = (students: IEducationStudent[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const getEducationStudents = (): IEducationStudent[] => {
  if (!canUseStorage()) return normalizeEducationStudents(seedStudents);

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const normalizedSeedStudents = normalizeEducationStudents(seedStudents);
    persistStudents(normalizedSeedStudents);
    return normalizedSeedStudents;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationStudent[];
    if (!Array.isArray(parsedValue)) {
      return normalizeEducationStudents(seedStudents);
    }

    const normalizedStudents = normalizeEducationStudents(parsedValue);

    if (JSON.stringify(normalizedStudents) !== JSON.stringify(parsedValue)) {
      persistStudents(normalizedStudents);
    }

    return normalizedStudents;
  } catch {
    const normalizedSeedStudents = normalizeEducationStudents(seedStudents);
    persistStudents(normalizedSeedStudents);
    return normalizedSeedStudents;
  }
};

export const getEducationStudentById = (
  studentId: string,
): IEducationStudent | undefined =>
  getEducationStudents().find((student) => student.id === studentId);

export const createEducationStudent = (
  studentData: IEducationStudentFormData,
): IEducationStudent => {
  const students = getEducationStudents();
  const courses = getEducationCourses();
  const matchedCourse =
    courses.find((course) => course.id === studentData.courseId) ||
    getEducationCourseById(studentData.courseId);
  const now = new Date().toISOString();
  const nextNumber = students.length + 1001;

  const nextStudent: IEducationStudent = {
    id: `student-${Date.now()}`,
    studentCode: `COSTU20${nextNumber}`,
    studentName: studentData.studentName.trim(),
    courseId: studentData.courseId,
    courseName: matchedCourse?.courseName || "Unassigned Course",
    studentPan: studentData.studentPan.trim().toUpperCase(),
    isMinor: studentData.isMinor,
    parentPan: studentData.parentPan.trim().toUpperCase(),
    mobileNumber: studentData.mobileNumber.trim(),
    email: studentData.email.trim().toLowerCase(),
    coApplicantName: studentData.coApplicantName.trim(),
    coApplicantMobileNumber: studentData.coApplicantMobileNumber.trim(),
    coApplicantRelation: studentData.coApplicantRelation.trim(),
    isActive: studentData.isActive,
    createdAt: now,
    updatedAt: now,
    loanDetails: {
      enrolledCourseCount: 1,
      appliedLoanAmount: 125000,
      totalLoansAvailed: 1,
      activeLoans: 1,
      closedLoans: 0,
      outstandingAmount: 125000,
      emiInformation: "INR 5,400 / month",
      repaymentStatus: "Pending",
    },
    creditInformation: {
      creditBureauSummary: "Freshly onboarded student profile awaiting a longer repayment trail.",
      creditScore: 701,
      creditHistory: "Newly created student borrower with one active education loan.",
    },
  };

  persistStudents([nextStudent, ...students]);
  return nextStudent;
};

export const updateEducationStudent = (
  studentId: string,
  studentData: IEducationStudentFormData,
): IEducationStudent | undefined => {
  const students = getEducationStudents();
  const matchedCourse = getEducationCourseById(studentData.courseId);
  let updatedStudent: IEducationStudent | undefined;

  const nextStudents = students.map((student) => {
    if (student.id !== studentId) return student;

    updatedStudent = {
      ...student,
      studentName: studentData.studentName.trim(),
      courseId: studentData.courseId,
      courseName: matchedCourse?.courseName || student.courseName,
      studentPan: studentData.studentPan.trim().toUpperCase(),
      isMinor: studentData.isMinor,
      parentPan: studentData.parentPan.trim().toUpperCase(),
      mobileNumber: studentData.mobileNumber.trim(),
      email: studentData.email.trim().toLowerCase(),
      coApplicantName: studentData.coApplicantName.trim(),
      coApplicantMobileNumber: studentData.coApplicantMobileNumber.trim(),
      coApplicantRelation: studentData.coApplicantRelation.trim(),
      isActive: studentData.isActive,
      updatedAt: new Date().toISOString(),
    };

    return updatedStudent;
  });

  persistStudents(nextStudents);
  return updatedStudent;
};

export const deleteEducationStudent = (studentId: string): void => {
  const students = getEducationStudents();
  persistStudents(students.filter((student) => student.id !== studentId));
};

import {
  IEducationStudent,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { getEducationCourseById, getEducationCourses } from "./demoEducationCourses";

const STORAGE_KEY = "credorbit.educationStudents";

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
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const persistStudents = (students: IEducationStudent[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const getEducationStudents = (): IEducationStudent[] => {
  if (!canUseStorage()) return seedStudents;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    persistStudents(seedStudents);
    return seedStudents;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationStudent[];
    return Array.isArray(parsedValue) ? parsedValue : seedStudents;
  } catch {
    persistStudents(seedStudents);
    return seedStudents;
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

import {
  IEducationStudent,
  IEducationStudentApplicant,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { getEducationCourseById, getEducationCourses } from "./demoEducationCourses";

const STORAGE_KEY = "credorbit.educationStudents";

const createApplicant = (
  overrides: Partial<IEducationStudentApplicant> = {},
): IEducationStudentApplicant => ({
  id: overrides.id || `applicant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: overrides.name || "",
  pan: overrides.pan || "",
  dateOfBirth: overrides.dateOfBirth || "",
  gender: overrides.gender || "",
  mobileNumber: overrides.mobileNumber || "",
  email: overrides.email || "",
  photo: overrides.photo ?? null,
});

const createLegacyApplicant = (
  name: string,
  mobileNumber: string,
  pan: string,
): IEducationStudentApplicant =>
  createApplicant({
    name,
    mobileNumber,
    pan,
    dateOfBirth: "1988-01-01",
    gender: "Female",
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@applicant.demo`,
    photo: null,
    id: `applicant-${name.toLowerCase().replace(/\s+/g, "-")}`,
  });

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
    studentPan: "",
    studentDateOfBirth: "2004-04-18",
    studentGender: "Male",
    studentPhoto: null,
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876501122",
    email: "aarav.shah@student.demo",
    applicants: [
      createApplicant({
        id: "applicant-001",
        name: "Rohit Shah",
        pan: "ROHIT1234S",
        dateOfBirth: "1983-07-11",
        gender: "Male",
        mobileNumber: "9876502211",
        email: "rohit.shah@applicant.demo",
      }),
      createApplicant({
        id: "applicant-001a",
        name: "Pooja Shah",
        pan: "POOJA1234P",
        dateOfBirth: "1986-03-29",
        gender: "Female",
        mobileNumber: "9876502244",
        email: "pooja.shah@applicant.demo",
      }),
      createApplicant({
        id: "applicant-002a",
        name: "Rakesh Patel",
        pan: "RAKES1234R",
        dateOfBirth: "1979-04-17",
        gender: "Male",
        mobileNumber: "9876505588",
        email: "rakesh.patel@applicant.demo",
      }),
    ],
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
      lastDateCreditScore: "2026-05-01",
    },
  },
  {
    id: "student-002",
    studentCode: "COSTU2002",
    studentName: "Diya Patel",
    courseId: "course-002",
    courseName: "Diploma in Credit Underwriting",
    studentPan: "",
    studentDateOfBirth: "2007-09-02",
    studentGender: "Female",
    studentPhoto: null,
    isMinor: true,
    parentPan: "PATEL1234K",
    mobileNumber: "9876503344",
    email: "diya.patel@student.demo",
    applicants: [
      createApplicant({
        id: "applicant-002",
        name: "Nikita Patel",
        pan: "NIKIT1234P",
        dateOfBirth: "1982-10-06",
        gender: "Female",
        mobileNumber: "9876505566",
        email: "nikita.patel@applicant.demo",
      }),
      createApplicant({
        id: "applicant-002a",
        name: "Rakesh Patel",
        pan: "RAKES1234R",
        dateOfBirth: "1979-04-17",
        gender: "Male",
        mobileNumber: "9876505588",
        email: "rakesh.patel@applicant.demo",
      }),
    ],
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
      lastDateCreditScore: "2026-05-07",
    },
  },
  {
    id: "student-003",
    studentCode: "COSTU2003",
    studentName: "Kavya Nair",
    courseId: "COCOU2603",
    courseName: "Certificate in NBFC Operations",
    studentPan: "",
    studentDateOfBirth: "2003-12-22",
    studentGender: "Female",
    studentPhoto: null,
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876507788",
    email: "kavya.nair@student.demo",
    applicants: [
      createApplicant({
        id: "applicant-003",
        name: "Suresh Nair",
        pan: "SURES1234N",
        dateOfBirth: "1980-02-15",
        gender: "Male",
        mobileNumber: "9876508899",
        email: "suresh.nair@applicant.demo",
      }),
      createApplicant({
        id: "applicant-003a",
        name: "Latha Nair",
        pan: "LATHA1234L",
        dateOfBirth: "1983-11-08",
        gender: "Female",
        mobileNumber: "9876508800",
        email: "latha.nair@applicant.demo",
      }),
    ],
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
      lastDateCreditScore: "2026-05-10",
    },
  },
  {
    id: "student-004",
    studentCode: "COSTU2004",
    studentName: "Rohan Mehta",
    courseId: "COCOU2601",
    courseName: "BBA in Finance and Lending",
    studentPan: "",
    studentDateOfBirth: "2002-06-12",
    studentGender: "Male",
    studentPhoto: null,
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876509900",
    email: "rohan.mehta@student.demo",
    applicants: [
      createApplicant({
        id: "applicant-004",
        name: "Milan Mehta",
        pan: "MILAN1234M",
        dateOfBirth: "1991-01-24",
        gender: "Male",
        mobileNumber: "9876509911",
        email: "milan.mehta@applicant.demo",
      }),
    ],
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
      lastDateCreditScore: "2026-05-12",
    },
  },
  {
    id: "student-005",
    studentCode: "COSTU2005",
    studentName: "Mihir Joshi",
    courseId: "COCOU2602",
    courseName: "Diploma in Credit Underwriting",
    studentPan: "",
    studentDateOfBirth: "2004-11-03",
    studentGender: "Male",
    studentPhoto: null,
    isMinor: false,
    parentPan: "",
    mobileNumber: "9876506677",
    email: "mihir.joshi@student.demo",
    applicants: [
      createApplicant({
        id: "applicant-005",
        name: "Rupal Joshi",
        pan: "RUPAL1234J",
        dateOfBirth: "1984-08-19",
        gender: "Female",
        mobileNumber: "9876507766",
        email: "rupal.joshi@applicant.demo",
      }),
    ],
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
      lastDateCreditScore: "2026-05-15",
    },
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const deriveApplicants = (student: IEducationStudent): IEducationStudentApplicant[] => {
  if (Array.isArray(student.applicants) && student.applicants.length > 0) {
    return student.applicants.map((applicant, index) =>
      createApplicant({
        ...applicant,
        id: applicant.id || `${student.id}-applicant-${index + 1}`,
      }),
    );
  }

  if (student.coApplicantName.trim()) {
    return [
      createLegacyApplicant(
        student.coApplicantName.trim(),
        student.coApplicantMobileNumber.trim(),
        student.parentPan.trim() || "APPLI1234Q",
      ),
    ];
  }

  return [];
};

const withLegacyApplicantFields = (student: IEducationStudent): IEducationStudent => {
  const applicants = deriveApplicants(student);
  const primaryApplicant = applicants[0];

  return normalizeStudentLoanDetails({
    ...student,
    studentDateOfBirth: student.studentDateOfBirth || "",
    studentGender: student.studentGender || "",
    studentPhoto: student.studentPhoto ?? null,
    applicants,
    coApplicantName: primaryApplicant?.name || "",
    coApplicantMobileNumber: primaryApplicant?.mobileNumber || "",
    coApplicantRelation:
      student.coApplicantRelation || (primaryApplicant ? "Applicant 1" : ""),
  });
};

const normalizeEducationStudents = (
  students: IEducationStudent[],
): IEducationStudent[] => {
  const normalizedStudents = students.map(withLegacyApplicantFields);
  const existingStudentIds = new Set(normalizedStudents.map((student) => student.id));
  const missingSeedStudents = seedStudents.filter(
    (student) => !existingStudentIds.has(student.id),
  );

  return [...normalizedStudents, ...missingSeedStudents.map(withLegacyApplicantFields)];
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

const buildStudentRecord = (
  studentData: IEducationStudentFormData,
  studentCode: string,
  createdAt: string,
  updatedAt: string,
  existingLoanDetails?: IEducationStudent["loanDetails"],
  existingCreditInfo?: IEducationStudent["creditInformation"],
): IEducationStudent => {
  const matchedCourse =
    getEducationCourses().find((course) => course.id === studentData.courseId) ||
    getEducationCourseById(studentData.courseId);
  const applicants = (studentData.applicants || []).map((applicant, index) =>
    createApplicant({
      ...applicant,
      id: applicant.id || `applicant-${Date.now()}-${index + 1}`,
      name: applicant.name.trim(),
      pan: applicant.pan.trim().toUpperCase(),
      dateOfBirth: applicant.dateOfBirth,
      gender: applicant.gender,
      mobileNumber: applicant.mobileNumber.trim(),
      email: applicant.email.trim().toLowerCase(),
      photo: applicant.photo ?? null,
    }),
  );
  const primaryApplicant = applicants[0];

  return withLegacyApplicantFields({
    id: "",
    studentCode,
    studentName: studentData.studentName.trim(),
    courseId: studentData.courseId,
    courseName: matchedCourse?.courseName || "Unassigned Course",
    studentPan: "",
    studentDateOfBirth: studentData.studentDateOfBirth,
    studentGender: studentData.studentGender,
    studentPhoto: studentData.studentPhoto ?? null,
    isMinor: studentData.isMinor,
    parentPan: studentData.parentPan.trim().toUpperCase(),
    mobileNumber: studentData.mobileNumber.trim(),
    email: studentData.email.trim().toLowerCase(),
    applicants,
    coApplicantName: primaryApplicant?.name || "",
    coApplicantMobileNumber: primaryApplicant?.mobileNumber || "",
    coApplicantRelation: primaryApplicant ? "Applicant 1" : "",
    isActive: studentData.isActive,
    createdAt,
    updatedAt,
    loanDetails:
      existingLoanDetails || {
        enrolledCourseCount: 1,
        appliedLoanAmount: 125000,
        totalLoansAvailed: 1,
        activeLoans: 1,
        closedLoans: 0,
        outstandingAmount: 125000,
        emiInformation: "INR 5,400 / month",
        repaymentStatus: "Pending",
      },
    creditInformation:
      existingCreditInfo || {
        creditBureauSummary:
          "Freshly onboarded student profile awaiting a longer repayment trail.",
        creditScore: 701,
        creditHistory: "Newly created student borrower with one active education loan.",
        lastDateCreditScore: new Date().toISOString(),
      },
  });
};

export const createEducationStudent = (
  studentData: IEducationStudentFormData,
): IEducationStudent => {
  const students = getEducationStudents();
  const now = new Date().toISOString();
  const nextNumber = students.length + 1001;

  const nextStudent = buildStudentRecord(
    studentData,
    `COSTU20${nextNumber}`,
    now,
    now,
  );
  nextStudent.id = `student-${Date.now()}`;

  persistStudents([nextStudent, ...students]);
  return nextStudent;
};

export const updateEducationStudent = (
  studentId: string,
  studentData: IEducationStudentFormData,
): IEducationStudent | undefined => {
  const students = getEducationStudents();
  let updatedStudent: IEducationStudent | undefined;

  const nextStudents = students.map((student) => {
    if (student.id !== studentId) return student;

    updatedStudent = buildStudentRecord(
      studentData,
      student.studentCode,
      student.createdAt,
      new Date().toISOString(),
      student.loanDetails,
      student.creditInformation,
    );
    updatedStudent.id = student.id;

    return updatedStudent;
  });

  persistStudents(nextStudents);
  return updatedStudent;
};

export const deleteEducationStudent = (studentId: string): void => {
  const students = getEducationStudents();
  persistStudents(students.filter((student) => student.id !== studentId));
};

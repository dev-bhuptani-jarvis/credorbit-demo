// @ts-nocheck
import { IClientDashboardData, IPartnerScore } from "../../interface/clientDashboard";
import { IClientDetailList } from "../../interface/reports";
import {
  EducationDiscountType,
  IEducationCourse,
  IEducationLoanDraft,
  IEducationStudentApplicant,
  IEducationStudent,
} from "../../interface/educationManagement";
import {
  addStudentEnrollment,
  getStudentEnrollments,
  updateStudentEnrollmentApplicationStatus,
} from "./demoStudentEnrollments";

const STUDENT_CAM_REPORTS_KEY = "credorbit.studentCamReports";
const EDUCATION_LOAN_DRAFTS_KEY = "credorbit.educationLoanDrafts";
const EDUCATION_LOAN_RESUME_STEP_KEY = "credorbit.educationLoanResumeStep";
const DEFAULT_STUDENT_USER_ID = "student-role-001";

export type EducationLoanResumeStep =
  | "consent"
  | "credit-score"
  | "banking-details"
  | "loan-offer"
  | "submitted";

const seedStudentCamReports: IClientDetailList[] = [
  {
    name: "CAM Report_BBA_Finance_20260701_STUDENT_ONE",
    filePath: "/assets/images/CAM_Report_Sample_HL.xlsx",
    reportType: 8,
  },
];

const seedEducationLoanDrafts: IEducationLoanDraft[] = [
  {
    id: "COEDU2601",
    studentId: "student-001",
    studentUserId: DEFAULT_STUDENT_USER_ID,
    instituteName: "Credorbit School of Finance",
    studentName: "Aarav Shah",
    studentPan: "AARAV1234S",
    studentEmail: "aarav.shah@student.demo",
    studentMobileNumber: "9876501122",
    parentPan: "",
    coApplicantName: "Rohit Shah",
    coApplicantMobileNumber: "9876502211",
    coApplicantRelation: "Father",
    courseId: "course-001",
    courseName: "BBA in Finance and Lending",
    courseTenure: "3 Years",
    courseType: "Offline",
    courseFees: 180000,
    emiOptionMonths: 24,
    advancedEmiMonths: 10,
    downpayment: 20000,
    discountValue: 5000,
    discountAmount: 5000,
    discountedCourseFee: 175000,
    loanAmount: 155000,
    advanceEmi: 6458.33,
    numberOfEmis: 24,
    emiAmount: 6458.33,
    totalAmountToInstitute: 175000,
    selectedBankId: 1,
    selectedBankName: "NBFC Bank 1",
    processingFeeAmount: 1550,
    processingFeePaid: true,
    processingFeePaidAt: "2026-06-05T10:15:00.000Z",
    consentAccepted: true,
    hasCoApplicant: true,
    loanApplicationStatus: "Sanctioned",
    sanctionDate: "2026-06-08T11:00:00.000Z",
    disbursementDate: null,
    utrNumber: "",
    transactionReference: "",
    disbursementRemarks: "",
    queryRemarks: "",
    enachEnabled: true,
    enachRegisteredAt: "2026-06-10T09:30:00.000Z",
    loanAgreementSentAt: "2026-06-09T12:00:00.000Z",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    disbursementAdviceUrl: null,
    status: "submitted",
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-10T09:30:00.000Z",
  },
  {
    id: "COEDU2602",
    studentId: "student-001",
    studentUserId: DEFAULT_STUDENT_USER_ID,
    instituteName: "Pioneer Institute of Business Studies",
    studentName: "Aarav Shah",
    studentPan: "AARAV1234S",
    studentEmail: "aarav.shah@student.demo",
    studentMobileNumber: "9876501122",
    parentPan: "",
    coApplicantName: "Rohit Shah",
    coApplicantMobileNumber: "9876502211",
    coApplicantRelation: "Father",
    courseId: "course-001",
    courseName: "BBA in Finance and Lending",
    courseTenure: "3 Years",
    courseType: "Offline",
    courseFees: 95000,
    emiOptionMonths: 18,
    downpayment: 10000,
    advancedEmiMonths: 10,
    discountValue: 10,
    discountAmount: 9500,
    discountedCourseFee: 85500,
    loanAmount: 75500,
    advanceEmi: 4194.44,
    numberOfEmis: 18,
    emiAmount: 4194.44,
    totalAmountToInstitute: 85500,
    selectedBankId: 2,
    selectedBankName: "NBFC Bank 2",
    processingFeeAmount: 755,
    processingFeePaid: true,
    processingFeePaidAt: "2026-05-14T13:15:00.000Z",
    consentAccepted: true,
    hasCoApplicant: true,
    loanApplicationStatus: "Disbursed",
    sanctionDate: "2026-05-18T10:30:00.000Z",
    disbursementDate: "2026-05-22T15:00:00.000Z",
    utrNumber: "UTR20260522001",
    transactionReference: "TXN-EDU-522001",
    disbursementRemarks: "First tranche released successfully.",
    queryRemarks: "",
    enachEnabled: true,
    enachRegisteredAt: "2026-05-20T08:45:00.000Z",
    loanAgreementSentAt: "2026-05-19T11:00:00.000Z",
    sanctionLetterUrl: "/assets/images/sanction-letter.pdf",
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
    repaymentScheduleUrl: "/assets/images/CAM_Report_Sample_HL.xlsx",
    disbursementAdviceUrl: "/assets/images/sanction-letter.pdf",
    status: "submitted",
    createdAt: "2026-05-14T13:00:00.000Z",
    updatedAt: "2026-05-22T15:00:00.000Z",
  },
  {
    id: "COEDU2603",
    studentId: "student-002",
    studentUserId: DEFAULT_STUDENT_USER_ID,
    instituteName: "Global Academy of Finance & Management",
    studentName: "Diya Patel",
    studentPan: "DIYAP1234P",
    studentEmail: "diya.patel@student.demo",
    studentMobileNumber: "9876503344",
    parentPan: "PATEL1234K",
    coApplicantName: "Nikita Patel",
    coApplicantMobileNumber: "9876505566",
    coApplicantRelation: "Mother",
    courseId: "course-002",
    courseName: "Diploma in Credit Underwriting",
    courseTenure: "12 Months",
    courseType: "Online",
    courseFees: 110000,
    emiOptionMonths: 12,
    advancedEmiMonths: 10,
    downpayment: 15000,
    discountValue: 5000,
    discountAmount: 5000,
    discountedCourseFee: 105000,
    loanAmount: 90000,
    advanceEmi: 7500,
    numberOfEmis: 12,
    emiAmount: 7500,
    totalAmountToInstitute: 105000,
    selectedBankId: 3,
    selectedBankName: "NBFC Bank 3",
    processingFeeAmount: 900,
    processingFeePaid: true,
    processingFeePaidAt: "2026-06-18T09:35:00.000Z",
    consentAccepted: true,
    hasCoApplicant: true,
    loanApplicationStatus: "Pending",
    sanctionDate: null,
    disbursementDate: null,
    utrNumber: "",
    transactionReference: "",
    disbursementRemarks: "",
    queryRemarks: "",
    enachEnabled: false,
    enachRegisteredAt: null,
    loanAgreementSentAt: null,
    sanctionLetterUrl: null,
    loanAgreementUrl: null,
    repaymentScheduleUrl: null,
    disbursementAdviceUrl: null,
    status: "submitted",
    createdAt: "2026-06-18T09:20:00.000Z",
    updatedAt: "2026-06-18T09:20:00.000Z",
  },
];

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && !!window.localStorage;

const readFromStorage = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

const writeToStorage = <T,>(key: string, value: T): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const parseCourseTenureMonths = (courseTenure: string): number => {
  const numericValue = Number(courseTenure.match(/\d+/)?.[0] || 0);
  const normalizedTenure = courseTenure.toLowerCase();

  if (normalizedTenure.includes("year")) {
    return numericValue * 12;
  }

  return numericValue;
};

const toCurrencyNumber = (value: number): number =>
  Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

const getPrimaryApplicant = (
  applicants: IEducationStudentApplicant[] | undefined,
): IEducationStudentApplicant | undefined => applicants?.[0];

const normalizeEducationLoanDrafts = (
  drafts: IEducationLoanDraft[],
): IEducationLoanDraft[] => {
  const existingDraftIds = new Set(drafts.map((draft) => draft.id));
  const missingSeedDrafts = seedEducationLoanDrafts.filter(
    (draft) => !existingDraftIds.has(draft.id),
  );

  return [...drafts, ...missingSeedDrafts];
};

export const getEducationLoanDrafts = (): IEducationLoanDraft[] =>
  (() => {
    const drafts = readFromStorage<IEducationLoanDraft[]>(
      EDUCATION_LOAN_DRAFTS_KEY,
      seedEducationLoanDrafts,
    );
    const normalizedDrafts = normalizeEducationLoanDrafts(drafts);

    if (canUseStorage() && JSON.stringify(normalizedDrafts) !== JSON.stringify(drafts)) {
      writeToStorage(EDUCATION_LOAN_DRAFTS_KEY, normalizedDrafts);
    }

    return normalizedDrafts;
  })();

const persistEducationLoanDrafts = (drafts: IEducationLoanDraft[]): void => {
  writeToStorage(EDUCATION_LOAN_DRAFTS_KEY, drafts);
};

export const getEducationLoanResumeStep = (
  draftId: string,
): EducationLoanResumeStep | undefined => {
  const stepMap = readFromStorage<Record<string, EducationLoanResumeStep>>(
    EDUCATION_LOAN_RESUME_STEP_KEY,
    {},
  );

  return stepMap[draftId];
};

export const setEducationLoanResumeStep = (
  draftId: string,
  step: EducationLoanResumeStep,
): void => {
  const stepMap = readFromStorage<Record<string, EducationLoanResumeStep>>(
    EDUCATION_LOAN_RESUME_STEP_KEY,
    {},
  );

  writeToStorage(EDUCATION_LOAN_RESUME_STEP_KEY, {
    ...stepMap,
    [draftId]: step,
  });
};

export const getEducationLoanDraftById = (
  draftId: string,
): IEducationLoanDraft | undefined =>
  getEducationLoanDrafts().find((draft) => draft.id === draftId);

export const calculateEducationLoanSummary = ({
  courseFees,
  emiOptionMonths,
  advancedEmiMonths,
  downpayment,
  discountValue,
}: {
  courseFees: number;
  emiOptionMonths: number;
  advancedEmiMonths: number | null;
  downpayment: number;
  discountValue: number;
}) => {
  const safeCourseFees = Math.max(courseFees, 0);
  const safeDownpayment = Math.max(downpayment, 0);
  const safeDiscountAmount = Math.max(discountValue, 0);

  // Discount amount cannot exceed course fee
  const normalizedDiscountAmount = Math.min(
    safeCourseFees,
    safeDiscountAmount,
  );

  // Fee after discount
  const discountedCourseFee = Math.max(
    safeCourseFees - normalizedDiscountAmount,
    0,
  );

  // Loan amount after down payment
  const loanAmount = Math.max(
    discountedCourseFee - safeDownpayment,
    0,
  );

  // Advanced EMI months (optional)
  const advanceMonths = advancedEmiMonths ?? 0;

  // Remaining EMI count
  const numberOfEmis = Math.max(
    emiOptionMonths - advanceMonths,
    1,
  );

  // EMI amount
  const emiAmount = loanAmount / numberOfEmis;

  // Total amount paid as Advance EMI
  const advanceEmi = advanceMonths * emiAmount;

  return {
    discountAmount: toCurrencyNumber(normalizedDiscountAmount),
    discountedCourseFee: toCurrencyNumber(discountedCourseFee),
    loanAmount: toCurrencyNumber(loanAmount),
    advanceEmi: toCurrencyNumber(advanceEmi),
    numberOfEmis,
    emiAmount: toCurrencyNumber(emiAmount),
    totalAmountToInstitute: toCurrencyNumber(discountedCourseFee),
  };
};

export const createEducationLoanDraft = ({
  student,
  course,
  instituteName,
  courseFees,
  emiOptionMonths,
  advancedEmiMonths,
  downpayment,
  discountValue,
}: {
  student: IEducationStudent;
  course: IEducationCourse;
  instituteName: string;
  courseFees: number;
  emiOptionMonths: number;
  advancedEmiMonths: number | null;
  downpayment: number;
  discountValue: number;
}): IEducationLoanDraft => {
  const drafts = getEducationLoanDrafts();
  const now = new Date().toISOString();

  const summary = calculateEducationLoanSummary({
    courseFees,
    emiOptionMonths,
    advancedEmiMonths,
    downpayment,
    discountValue,
  });

  const nextDraft: IEducationLoanDraft = {
    id: `edu-loan-${Date.now()}`,
    studentId: student.id,
    studentUserId: DEFAULT_STUDENT_USER_ID,
    instituteName,
    studentName: student.studentName,
    studentPan: student.studentPan,
    studentDateOfBirth: student.studentDateOfBirth,
    studentGender: student.studentGender,
    studentPhoto: student.studentPhoto,
    studentEmail: student.email,
    studentMobileNumber: student.mobileNumber,
    applicants: student.applicants,
    parentPan: student.parentPan,
    coApplicantName:
      getPrimaryApplicant(student.applicants)?.name ||
      student.coApplicantName,
    coApplicantMobileNumber:
      getPrimaryApplicant(student.applicants)?.mobileNumber ||
      student.coApplicantMobileNumber,
    coApplicantRelation: student.coApplicantRelation,

    courseId: course.id,
    courseName: course.courseName,
    courseTenure: course.courseTenure,
    courseType: course.courseType,

    courseFees,
    emiOptionMonths,
    advancedEmiMonths,
    downpayment,

    // Discount
    discountValue,
    discountAmount: summary.discountAmount,
    discountedCourseFee: summary.discountedCourseFee,

    // Loan
    loanAmount: summary.loanAmount,
    advanceEmi: summary.advanceEmi,
    numberOfEmis: summary.numberOfEmis,
    emiAmount: summary.emiAmount,
    totalAmountToInstitute: summary.totalAmountToInstitute,
    selectedBankId: null,
    selectedBankName: null,
    processingFeeAmount: 0,
    processingFeePaid: false,
    processingFeePaidAt: null,

    consentAccepted: true,
    hasCoApplicant: (student.applicants || []).length > 0,

    loanApplicationStatus: "Pending",
    sanctionDate: null,
    disbursementDate: null,
    utrNumber: "",
    transactionReference: "",
    disbursementRemarks: "",
    queryRemarks: "",
    enachEnabled: false,
    enachRegisteredAt: null,
    loanAgreementSentAt: null,
    sanctionLetterUrl: null,
    loanAgreementUrl: null,
    repaymentScheduleUrl: null,
    disbursementAdviceUrl: null,

    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  persistEducationLoanDrafts([nextDraft, ...drafts]);

  return nextDraft;
};

export const updateEducationLoanDraftStatus = (
  draftId: string,
  status: IEducationLoanDraft["status"],
): IEducationLoanDraft | undefined => {
  const drafts = getEducationLoanDrafts();
  let updatedDraft: IEducationLoanDraft | undefined;

  const nextDrafts = drafts.map((draft) => {
    if (draft.id !== draftId) return draft;

    updatedDraft = {
      ...draft,
      status,
      updatedAt: new Date().toISOString(),
    };

    return updatedDraft;
  });

  persistEducationLoanDrafts(nextDrafts);
  return updatedDraft;
};

export const getPendingEducationLoanApplicationsByStudent = (
  studentId: string,
): IEducationLoanDraft[] =>
  getEducationLoanDrafts().filter(
    (draft) =>
      draft.studentId === studentId &&
      draft.status === "submitted" &&
      draft.loanApplicationStatus === "Pending",
  );

export const updateEducationLoanDraftOfferSelection = (
  draftId: string,
  updates: Partial<
    Pick<
      IEducationLoanDraft,
      | "selectedBankId"
      | "selectedBankName"
      | "processingFeeAmount"
      | "processingFeePaid"
      | "processingFeePaidAt"
    >
  >,
): IEducationLoanDraft | undefined => {
  const drafts = getEducationLoanDrafts();
  let updatedDraft: IEducationLoanDraft | undefined;

  const nextDrafts = drafts.map((draft) => {
    if (draft.id !== draftId) return draft;

    updatedDraft = {
      ...draft,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return updatedDraft;
  });

  persistEducationLoanDrafts(nextDrafts);
  return updatedDraft;
};

export const getNbfcEducationLoanApplications = (): IEducationLoanDraft[] =>
  getEducationLoanDrafts().filter((draft) => draft.status === "submitted");

export const updateNbfcEducationLoanApplicationStatus = (
  draftId: string,
  updates: Partial<
    Pick<
      IEducationLoanDraft,
      | "loanApplicationStatus"
      | "sanctionDate"
      | "disbursementDate"
      | "utrNumber"
      | "transactionReference"
      | "disbursementRemarks"
      | "queryRemarks"
      | "enachEnabled"
      | "enachRegisteredAt"
      | "loanAgreementSentAt"
      | "sanctionLetterUrl"
      | "loanAgreementUrl"
      | "repaymentScheduleUrl"
      | "disbursementAdviceUrl"
    >
  >,
): IEducationLoanDraft | undefined => {
  const drafts = getEducationLoanDrafts();
  let updatedDraft: IEducationLoanDraft | undefined;

  const nextDrafts = drafts.map((draft) => {
    if (draft.id !== draftId) return draft;

    const nextStatus = updates.loanApplicationStatus || draft.loanApplicationStatus;

    updatedDraft = {
      ...draft,
      ...updates,
      loanApplicationStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    if (nextStatus === "Sanctioned" && !updatedDraft.sanctionDate) {
      updatedDraft.sanctionDate = new Date().toISOString();
    }

    if (nextStatus === "Sanctioned") {
      updatedDraft.sanctionLetterUrl =
        updates.sanctionLetterUrl || "/assets/images/sanction-letter.pdf";
      updatedDraft.loanAgreementUrl =
        updates.loanAgreementUrl || "/assets/images/sanction-letter.pdf";
      updatedDraft.repaymentScheduleUrl =
        updates.repaymentScheduleUrl || "/assets/images/CAM_Report_Sample_HL.xlsx";
    }

    if (nextStatus === "Disbursed") {
      updatedDraft.disbursementAdviceUrl =
        updates.disbursementAdviceUrl || "/assets/images/sanction-letter.pdf";
      updatedDraft.disbursementDate =
        updates.disbursementDate || updatedDraft.disbursementDate || new Date().toISOString();
    }

    return updatedDraft;
  });

  persistEducationLoanDrafts(nextDrafts);

  const linkedEnrollment = getStudentEnrollments().find(
    (enrollment) => enrollment.draftId === draftId,
  );

  if (linkedEnrollment) {
    updateStudentEnrollmentApplicationStatus(
      linkedEnrollment.id,
      updatedDraft?.loanApplicationStatus || linkedEnrollment.applicationStatus,
    );
  }

  return updatedDraft;
};

export const sendNbfcLoanAgreementForSigning = (
  draftId: string,
): IEducationLoanDraft | undefined =>
  updateNbfcEducationLoanApplicationStatus(draftId, {
    loanAgreementSentAt: new Date().toISOString(),
    loanAgreementUrl: "/assets/images/sanction-letter.pdf",
  });

export const enableNbfcEnach = (
  draftId: string,
): IEducationLoanDraft | undefined =>
  updateNbfcEducationLoanApplicationStatus(draftId, {
    enachEnabled: true,
    enachRegisteredAt: new Date().toISOString(),
  });

export const getStudentCamReports = (
  studentUserId: string = DEFAULT_STUDENT_USER_ID,
): IClientDetailList[] => {
  const allReports = readFromStorage<
    Record<string, IClientDetailList[]>
  >(STUDENT_CAM_REPORTS_KEY, {
    [DEFAULT_STUDENT_USER_ID]: seedStudentCamReports,
  });

  return allReports[studentUserId] || [];
};

export const addStudentCamReport = ({
  studentUserId = DEFAULT_STUDENT_USER_ID,
  courseName,
}: {
  studentUserId?: string;
  courseName: string;
}): IClientDetailList[] => {
  const reportMap = readFromStorage<Record<string, IClientDetailList[]>>(
    STUDENT_CAM_REPORTS_KEY,
    {
      [DEFAULT_STUDENT_USER_ID]: seedStudentCamReports,
    },
  );

  const reportName = `CAM Report_${courseName.replace(/\s+/g, "_")}_${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}_STUDENT`;

  const nextReport: IClientDetailList = {
    name: reportName,
    filePath: "/assets/images/CAM_Report_Sample_HL.xlsx",
    reportType: 8,
  };

  const currentReports = reportMap[studentUserId] || [];
  const alreadyExists = currentReports.some((report) => report.name === reportName);

  const nextReports = alreadyExists
    ? currentReports
    : [nextReport, ...currentReports];

  writeToStorage(STUDENT_CAM_REPORTS_KEY, {
    ...reportMap,
    [studentUserId]: nextReports,
  });

  return nextReports;
};

export const buildEducationCustomerInfo = (
  student: IEducationStudent,
): IClientDashboardData => {
  const currentEnrollments = getStudentEnrollments(DEFAULT_STUDENT_USER_ID);
  const partnerList: IPartnerScore[] = (student.applicants || []).map(
    (applicant, index) => ({
      aadhaarNumber: "",
      address: "Education Applicant Address",
      city: "Ahmedabad",
      creditScore: null,
      dateOfBirth: applicant.dateOfBirth || "1990-01-01",
      firstName: applicant.name.split(" ")[0] || applicant.name,
      gender: applicant.gender || "Female",
      id: applicant.id || `co-applicant-${student.id}-${index + 1}`,
      lastName: applicant.name.split(" ").slice(1).join(" ") || null,
      middleName: null,
      mobile: applicant.mobileNumber || null,
      name: applicant.name,
      pan: applicant.pan || student.parentPan || "COPAN1234Q",
      pinCode: "380015",
      state: "Gujarat",
    }),
  );

  return {
    creditScore: student.creditInformation.creditScore || null,
    maxCreditScore: 900,
    creditScoreRefetchedDays: 0,
    incomeTaxRefetchedDays: 0,
    creditReportDate: null,
    bankingReportDate: null,
    itrReportDate: null,
    gstReportDate: null,
    rocReportDate: null,
    cfoReportDate: null,
    loanApplicationList: currentEnrollments.map((enrollment, index) => ({
      loanApplicationID: enrollment.id,
      loanApplicationCode: `EDUAPP${String(index + 1).padStart(4, "0")}`,
      bankName: "Education Finance Partner",
      loanTypeID: 0,
      disbursementId: "00000000-0000-0000-0000-000000000000",
      date: enrollment.createdAt,
      sanctionedDate: null,
      disbursedDate: null,
      loanAmount: enrollment.loanAmount,
      sanctionedLoanAmount: null,
      disbursedLoanAmount: null,
      sanctionLetterUrl: null,
      progressPercent: enrollment.applicationStatus === "Disbursed" ? 100 : 60,
      isCamReportGenerated: true,
      status: {
        label: enrollment.applicationStatus,
        color: enrollment.applicationStatus === "Rejected" ? "#F64F59" : "#FF632C",
        statusID: 1,
      },
      customerName: student.studentName,
      loanType: "Education Loan",
      userID: DEFAULT_STUDENT_USER_ID,
      raisedQuery: null,
      comments: null,
    })),
    gstNumber: null,
    totalLoanApplicationsCountByStatus: [],
    reports: getStudentCamReports(DEFAULT_STUDENT_USER_ID),
    gstList: [],
    partners: partnerList,
    gstReportRefetchedDays: 0,
  };
};

export const completeEducationLoanApplication = (
  draftId: string,
): IEducationLoanDraft | undefined => {
  const draft = updateEducationLoanDraftStatus(draftId, "submitted");

  if (!draft) return undefined;

  addStudentEnrollment({
    id: `enroll-${Date.now()}`,
    draftId: draft.id,
    studentUserId: draft.studentUserId,
    instituteName: draft.instituteName,
    courseName: draft.courseName,
    duration: draft.courseTenure,
    feeStructure: draft.discountedCourseFee,
    courseType: draft.courseType,
    loanAccountNumber: `EDULOAN${Date.now().toString().slice(-6)}`,
    loanAmount: draft.loanAmount,
    outstandingAmount: draft.loanAmount,
    emiAmount: draft.emiAmount,
    emiSchedule: "5th of every month",
    repaymentStatus: "Pending",
    loanStatus: "Active",
    applicationStatus: "Pending",
    creditBureauSummary:
      "Credit bureau check completed for the student application and linked financing.",
    creditScore: 0,
    creditHistory:
      "New education loan application submitted and awaiting sanction outcome.",
    createdAt: new Date().toISOString(),
  });

  return draft;
};

export const getRecommendedEmiOptions = (courseTenure: string): number[] => {
  const durationInMonths = parseCourseTenureMonths(courseTenure);

  if (durationInMonths < 12) {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  }
  if (durationInMonths <= 12) return [6, 9, 12];
  if (durationInMonths <= 24) return [6, 12, 18, 24];
  return [12, 18, 24, 36];
};
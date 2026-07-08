import { IClientDashboardData, IPartnerScore } from "../../interface/clientDashboard";
import { IClientDetailList } from "../../interface/reports";
import {
  EducationDiscountType,
  IEducationCourse,
  IEducationLoanDraft,
  IEducationStudent,
} from "../../interface/educationManagement";
import {
  addStudentEnrollment,
  getStudentEnrollments,
  updateStudentEnrollmentApplicationStatus,
} from "./demoStudentEnrollments";

const STUDENT_CAM_REPORTS_KEY = "credorbit.studentCamReports";
const EDUCATION_LOAN_DRAFTS_KEY = "credorbit.educationLoanDrafts";
const DEFAULT_STUDENT_USER_ID = "student-role-001";

const seedStudentCamReports: IClientDetailList[] = [
  {
    name: "CAM Report_BBA_Finance_20260701_STUDENT_ONE",
    filePath: "/assets/images/CAM_Report_Sample_HL.xlsx",
    reportType: 8,
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

export const getEducationLoanDrafts = (): IEducationLoanDraft[] =>
  readFromStorage<IEducationLoanDraft[]>(EDUCATION_LOAN_DRAFTS_KEY, []);

const persistEducationLoanDrafts = (drafts: IEducationLoanDraft[]): void => {
  writeToStorage(EDUCATION_LOAN_DRAFTS_KEY, drafts);
};

export const getEducationLoanDraftById = (
  draftId: string,
): IEducationLoanDraft | undefined =>
  getEducationLoanDrafts().find((draft) => draft.id === draftId);

export const calculateEducationLoanSummary = ({
  courseFees,
  emiOptionMonths,
  downpayment,
  discountType,
  discountValue,
}: {
  courseFees: number;
  emiOptionMonths: number;
  downpayment: number;
  discountType: EducationDiscountType;
  discountValue: number;
}) => {
  const safeCourseFees = Math.max(courseFees, 0);
  const safeDownpayment = Math.max(downpayment, 0);
  const safeDiscountValue = Math.max(discountValue, 0);
  const discountAmount =
    discountType === "percentage"
      ? (safeCourseFees * safeDiscountValue) / 100
      : safeDiscountValue;
  const normalizedDiscountAmount = Math.min(safeCourseFees, discountAmount);
  const discountedCourseFee = Math.max(
    safeCourseFees - normalizedDiscountAmount,
    0,
  );
  const loanAmount = Math.max(discountedCourseFee - safeDownpayment, 0);
  const numberOfEmis = Math.max(emiOptionMonths, 1);
  const emiAmount = loanAmount / numberOfEmis;

  return {
    discountAmount: toCurrencyNumber(normalizedDiscountAmount),
    discountedCourseFee: toCurrencyNumber(discountedCourseFee),
    loanAmount: toCurrencyNumber(loanAmount),
    advanceEmi: toCurrencyNumber(emiAmount),
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
  downpayment,
  discountType,
  discountValue,
}: {
  student: IEducationStudent;
  course: IEducationCourse;
  instituteName: string;
  courseFees: number;
  emiOptionMonths: number;
  downpayment: number;
  discountType: EducationDiscountType;
  discountValue: number;
}): IEducationLoanDraft => {
  const drafts = getEducationLoanDrafts();
  const now = new Date().toISOString();
  const summary = calculateEducationLoanSummary({
    courseFees,
    emiOptionMonths,
    downpayment,
    discountType,
    discountValue,
  });

  const nextDraft: IEducationLoanDraft = {
    id: `edu-loan-${Date.now()}`,
    studentId: student.id,
    studentUserId: DEFAULT_STUDENT_USER_ID,
    instituteName,
    studentName: student.studentName,
    studentPan: student.studentPan,
    studentEmail: student.email,
    studentMobileNumber: student.mobileNumber,
    parentPan: student.parentPan,
    coApplicantName: student.coApplicantName,
    coApplicantMobileNumber: student.coApplicantMobileNumber,
    coApplicantRelation: student.coApplicantRelation,
    courseId: course.id,
    courseName: course.courseName,
    courseTenure: course.courseTenure,
    courseType: course.courseType,
    courseFees,
    emiOptionMonths,
    downpayment,
    discountType,
    discountValue,
    discountAmount: summary.discountAmount,
    discountedCourseFee: summary.discountedCourseFee,
    loanAmount: summary.loanAmount,
    advanceEmi: summary.advanceEmi,
    numberOfEmis: summary.numberOfEmis,
    emiAmount: summary.emiAmount,
    totalAmountToInstitute: summary.totalAmountToInstitute,
    consentAccepted: true,
    hasCoApplicant: !!student.coApplicantName.trim(),
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
  const partnerList: IPartnerScore[] = student.coApplicantName.trim()
    ? [
        {
          aadhaarNumber: "",
          address: "Education Co-applicant Address",
          city: "Ahmedabad",
          creditScore: null,
          dateOfBirth: "1990-01-01",
          firstName: student.coApplicantName.split(" ")[0] || student.coApplicantName,
          gender: "Female",
          id: `co-applicant-${student.id}`,
          lastName: student.coApplicantName.split(" ").slice(1).join(" ") || null,
          middleName: null,
          mobile: student.coApplicantMobileNumber || null,
          name: student.coApplicantName,
          pan: student.parentPan || "COPAN1234Q",
          pinCode: "380015",
          state: "Gujarat",
        },
      ]
    : [];

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

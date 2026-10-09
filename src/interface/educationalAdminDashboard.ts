import { APIResponseEntity } from "./apiResponse";

export interface IEducationAdminDashboardResponse extends APIResponseEntity {
    data: IEducationAdminDashboardData;
}

export interface IEducationAdminDashboardData {
    totalRegisteredInstitutes: number;
    totalRegisteredLenders: number;
    totalStudentsEnrolled: number;
    placementLinkedCourse: number;
    totalApplicationInInstitute: number;
    totalSanctionedApplication: number;
    totalDisbursedApplication: number;
    applicationOverview: IEducationAdminDashboardApplicationOverview[] | null;
    disbursementTrend: IEducationAdminDashboardDisbursementTrend | null;
    disbursementTrendData: IEducationAdminDashboardDisbursementTrendData;
    instituteWiseDisbursement: IEducationAdminDashboardInstituteWiseDisbursement | null;
    courseWiseDisbursement: IEducationAdminDashboardCourseWiseDisbursement | null;
    paymentHistoryCards: IEducationAdminDashboardPaymentHistoryCards;
    paymentHistoryTrend: IEducationAdminDashboardPaymentHistoryTrend;
    studentLoanSummary: IEducationAdminDashboardApplicationOverview[] | null;
}

export interface IEducationAdminDashboardApplicationOverview {
    displayName: string;
    displayOrder: number;
    amount: number;
    noOfApplications: number;
    formattedAmount: string;
    percentageValue: number;
    statusID: number;
}

export interface IEducationAdminDashboardDisbursementTrend {
    monthly: IEducationAdminDashboardYearWiseChartData;
    yearly: IEducationAdminDashboardChartData;
}

export interface IEducationAdminDashboardDisbursementTrendData {
    monthly: IEducationAdminDashboardMonthlyDisbursementTrend;
    yearly: IEducationAdminDashboardChartData;
}

export interface IEducationAdminDashboardMonthlyDisbursementTrend {
    prevYear?: IEducationAdminDashboardChartData;
    currYear?: IEducationAdminDashboardChartData;
}

export interface IEducationAdminDashboardYearWiseChartData {
    [year: string]: IEducationAdminDashboardChartData;
}

export interface IEducationAdminDashboardChartData {
    title: string;
    categories: string[];
    amountData: number[];
    applicationCountData: number[];
}

export interface IEducationAdminDashboardInstituteWiseDisbursement {
    monthly: IEducationAdminDashboardMonthlyInstituteWiseDisbursement;
    yearly: IEducationAdminDashboardYearlyInstituteWiseDisbursement;
}

export interface IEducationAdminDashboardMonthlyInstituteWiseDisbursement {
    prevYear: IEducationAdminDashboardMonthWiseInstituteData;
    currYear: IEducationAdminDashboardMonthWiseInstituteData;
}

export interface IEducationAdminDashboardMonthWiseInstituteData {
    [month: string]: IEducationAdminDashboardInstituteWiseDisbursementItem[];
}

export interface IEducationAdminDashboardYearlyInstituteWiseDisbursement {
    [year: string]: IEducationAdminDashboardInstituteWiseDisbursementItem[];
}

export interface IEducationAdminDashboardInstituteWiseDisbursementItem {
    name: string;
    y: number;
}

export interface IEducationAdminDashboardCourseWiseDisbursement {
    monthly: IEducationAdminDashboardMonthlyCourseWiseDisbursement;
    yearly: IEducationAdminDashboardYearlyCourseWiseDisbursement;
}

export interface IEducationAdminDashboardMonthlyCourseWiseDisbursement {
    prevYear: IEducationAdminDashboardMonthWiseCourseData;
    currYear: IEducationAdminDashboardMonthWiseCourseData;
}

export interface IEducationAdminDashboardMonthWiseCourseData {
    [month: string]: IEducationAdminDashboardCourseWiseDisbursementItem[];
}

export interface IEducationAdminDashboardYearlyCourseWiseDisbursement {
    [year: string]: IEducationAdminDashboardCourseWiseDisbursementItem[];
}

export interface IEducationAdminDashboardCourseWiseDisbursementItem {
    courseID: string;
    courseName: string;
    totalLoans: number;
    totalDisbursedAmount: number;
}

export interface IEducationAdminDashboardPaymentHistoryCards {
    monthly: IEducationAdminDashboardMonthlyPaymentHistoryCards;
    yearly: IEducationAdminDashboardYearlyPaymentHistoryCards;
}

export interface IEducationAdminDashboardMonthlyPaymentHistoryCards {
    prevYear: IEducationAdminDashboardMonthWisePaymentHistoryCards;
    currYear: IEducationAdminDashboardMonthWisePaymentHistoryCards;
}

export interface IEducationAdminDashboardMonthWisePaymentHistoryCards {
    [month: string]: IEducationAdminDashboardPaymentHistoryCard[];
}

export interface IEducationAdminDashboardYearlyPaymentHistoryCards {
    [year: string]: IEducationAdminDashboardPaymentHistoryCard[];
}

export interface IEducationAdminDashboardPaymentHistoryCard {
    title: string;
    color: string;
    loanCount: number;
    emiCount: number;
    emiAmount: number;
}

export interface IEducationAdminDashboardPaymentHistoryTrend {
    monthly: IEducationAdminDashboardMonthlyPaymentHistoryTrend;
    yearly: IEducationAdminDashboardPaymentHistoryTrendData;
}

export interface IEducationAdminDashboardMonthlyPaymentHistoryTrend {
    prevYear: IEducationAdminDashboardPaymentHistoryTrendData;
    currYear: IEducationAdminDashboardPaymentHistoryTrendData;
}

export interface IEducationAdminDashboardPaymentHistoryTrendData {
    categories: string[];
    amountLabel: string;
    series: IEducationAdminDashboardPaymentHistorySeriesItem[];
}

export interface IEducationAdminDashboardPaymentHistorySeriesItem {
    name: string;
    color: string;
    data: number[];
}

export interface IDisbursementTrendDataDashboardResponse
    extends APIResponseEntity {
    data: IEducationAdminDashboardDisbursementTrendData;
}

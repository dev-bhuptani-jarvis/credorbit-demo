import { APIResponseEntity } from "./apiResponse";
import { IStatus } from "./channelPartnerDashboard";
import { IMasterCPCapacityResponseData } from "./masterChannelPartner";

export interface IMasterCPDashboardResponse extends APIResponseEntity {
    data: IMasterCPDashboardResponseData
}

export interface IMasterCPDashboardResponseData {
    summary: IMasterCPDashboardResponseDataSummary;
    masterCpCapacity: IMasterCPCapacityResponseData;
    cpPerformance: IMasterCPDashboardResponseDataCPPerformance[];
    branchPerformance: IMasterCPDashboardResponseDataBranchPerformance[];
    businessGrowth: IMasterCPDashboardResponseDataBusinessGrowth;
    disbursementTrend: IMasterCPDashboardResponseDataDisbursementTrend;
    loanTypeMix: IMasterCPDashboardResponseDataLoanTypeMix;
    applicationFunnel: IMasterCPDashboardResponseDataApplicationFunnelMTD;
    topCitiesByLoanApps: IMasterCPDashboardResponseDataCityStats[];
    creditsUtilisationByBranch: IMasterCPDashboardResponseBranchCreditUtilization[];
    recentApplications: IMasterCPDashboardResponseRecentApplications[];
    commissionandrevenue: IMasterCPDashboardResponseDataCommissionAndRevenue;
    tatAndProcessingMetrics: IMasterCPTatAndProcessingMetrics;
    masterCpLoanTypeWiseDashboardResponse: IMasterCPLoanTypeWiseDashboardResponse;
    topCPsByDisbursement: IMasterCPTopDisbursementResponse;
    topBranchesByDisbursement: IMasterCPTopDisbursementResponse;
    dashboardOverview: IMasterCPDashboardOverview;
    paymentReconciliationCard: IPaymentReconciliationCard;
    payoutReceivableCard: IPayoutReceivableCard;
    newCpsThisMonth?: IMasterCPNewCpsThisMonth;
    payoutDashboard?: IMasterCPPayoutDashboard;
    cpProductivity: IMasterCPPerformanceCard;
    bankWisePayoutReceivable: IMasterCpBankWisePayoutReceivable[],
    stateList: string[];
    totalCount: number;
}

export interface IMasterCPNewCpsThisMonth {
    totalOnboarded: number;
    activeLive: number;
    ytdTotal: number;
}

export interface IMasterCPPayoutDashboardGraphItem {
    month: string;
    netPayout: number;
    formattedNetPayout: string;
    receivable: number;
    formattedReceivable?: string;
}

export interface IMasterCPPayoutDashboard {
    totalDisbursed: number;
    grossCommissionEarned: number;
    tdsDeducted: number;
    netPayoutToCPs: number;
    payoutPaidCPs: number;
    payoutPendingCPs: number;
    netPayoutToSPs: number;
    payoutPaidSPs: number;
    payoutPendingSPs: number;
    receivableFromBanks: number;
    formattedTotalDisbursed: string;
    formattedGrossCommissionEarned: string;
    formattedTdsDeducted: string;
    formattedNetPayoutToCPs: string;
    formattedPayoutPaidCPs: string;
    formattedPayoutPendingCPs: string;
    formattedNetPayoutToSPs: string;
    formattedPayoutPaidSPs: string;
    formattedPayoutPendingSPs: string;
    formattedReceivableFromBanks: string;
    graphData: IMasterCPPayoutDashboardGraphItem[];
}
export interface IMasterCpBankWisePayoutReceivable {
    bankId: number;
    bankName: string;
    pendingAmount: number;
}
export interface IMasterCPPerformanceCard {
    averageAppsPerCp: number;
    formattedAverageAppsPerCp: string;
    formattedTopCpDisbursementAmount: string;
    topCpDisbursementAmount: number;
    topCpId: string;
    topCpName: string;
    zeroActivityCps: number;
}
export interface IPaymentReconciliationCard {
    pendingFromBanks: number;
    pendingFromMasterCP: number;
    pendingFromCP: number;
    fullySettled: number;
}

export interface IPayoutReceivableCard {
    totalReceivable: number;
    received: number;
    pending: number;
}

export interface IMasterCPTatMetric {
    currentValue: number;
    formattedCurrentValue: string;
    previousValue: number;
    formattedPreviousValue: string;
    changeValue: number;
    formattedChangeValue: string;
}

export interface IMasterCPTatAndProcessingMetrics {
    loginToSanctionTat: IMasterCPTatMetric;
    sanctionToDisbursementTat: IMasterCPTatMetric;
    endToEndTat: IMasterCPTatMetric;
    approvalRate: IMasterCPTatMetric;
    rejectionRate: IMasterCPTatMetric;
    appliedCount: number;
    sanctionedCount: number;
    rejectedCount: number;
}

export interface IMasterCPDashboardResponseRecentApplications {
    appCode: string;
    borrower: string;
    product: string;
    amount: number;
    cpName: string | null;
    branchName: string | null;
    status: IStatus;
    tat: string;
}


export interface IMasterCPDashboardResponseBranchCreditUtilization {
    branchName: string;
    creditsUsed: number;
    percentage: number;
}
export interface IMasterCPDashboardResponseDataCityStats {
    city: string;
    totalApps: number;
    totalSanctionedAmount: number;
    formattedTotalSanctionedAmount: string;
    totalDisbursedAmount: number;
    formattedTotalDisbursedAmount: string;
}

export interface IMasterCPDashboardResponseDataDisbursementTrend {
    overallTrend?: IDisbursementTrendSeriesItem[];
    cpWiseTrend?: IDisbursementTrendSeriesItem[];
    branchWiseTrend?: IDisbursementTrendSeriesItem[];
    overallMix?: IDisbursementTrendSeriesItem[];
    cpWiseMix?: IDisbursementTrendSeriesItem[];
    branchWiseMix?: IDisbursementTrendSeriesItem[];
    sanctionCount?: number;
    disbursementCount?: number;
}

export interface IDisbursementTrendSeriesItem {
    loanTypeId?: number;
    loanTypeName?: string;
    displayName?: string;
    displayOrder?: number;
    monthName?: string;
    label?: string;
    count?: number;
    totalAmount?: number;
    formattedTotalAmount?: string;
    percentage?: number;
    targetAmount?: number;
    sanctionedAmount?: number;
    disbursedAmount?: number;
    formattedTargetAmount?: string;
    formattedSanctionedAmount?: string;
    formattedDisbursedAmount?: string;
}

export interface IMasterCPDashboardResponseDataLoanTypeMix {
    overallMix?: IDisbursementTrendSeriesItem[];
    cpWiseMix?: IDisbursementTrendSeriesItem[];
    branchWiseMix?: IDisbursementTrendSeriesItem[];
}

export interface IMasterCPDashboardResponseDataApplicationFunnelMTD {
    pending: number;
    applied: number;
    sanctioned: number;
    disbursed: number;
    rejected: number;
    overallConversion: number;
    sanctionToDisbConversion: number
}

export interface IMasterCPDashboardResponseDataSummary {
    totalCp: number;
    totalActiveCp: number;

    totalBranch: number;
    totalActiveBranch: number;

    totalCpWiseBusiness: number;
    formattedTotalCpWiseBusiness: string;

    totalBranchWiseBusiness: number;
    formattedTotalBranchWiseBusiness: string;

    totalCreditBalance: number;
    totalCreditConsumption: number;

    totalApplications: number;
    totalCpApplications: number;
    totalBranchApplications: number;

    totalDisbursementAmount: number;
    formattedTotalDisbursementAmount: string;

    totalSanctionedAmount: number;
    formattedTotalSanctionedAmount: string;

    averageTat: string;
}

export interface IMasterCPDashboardResponseDataCPPerformance {
    id: string;
    name: string;
    code: string;

    city: string;
    state: string;

    amount: number;
    formattedAmount: string;

    noOfLoanApplications: number;
    noOfClients: number;

    isActive: boolean;
}

export interface IMasterCPDashboardResponseDataBranchPerformance {
    branchId: string;
    branchName: string;

    city: string;
    state: string;

    amount: number;
    formattedAmount: string;

    noOfLoanApplications: number;
    noOfClients: number;

    isActive: boolean;
}

export interface IMasterCPDashboardResponseDataBusinessGrowth {
    cpWiseBusinessGrowth: IMasterCPDashboardResponseDataBusinessGrowthItem[];
    branchWiseBusinessGrowth: IMasterCPDashboardResponseDataBusinessGrowthItem[];
}

export interface IMasterCPDashboardResponseDataBusinessGrowthItem {
    displayName: string;
    displayOrder: number;

    amount: number;
    noOfApplications: number;
    formattedAmount?: string;
}

export interface IMasterCPDashboardResponseDataCommissionAndRevenue {
    totalPayAmount: number;
    totalGstAmount: number;
    totalTdsAmount: number;
    totalNetPayment: number;

    grossCommissionEarned: number;
    formattedGrossCommissionEarned: string;

    tdsDeducted: number;
    formattedTdsDeducted: string;

    netCommission: number;
    formattedNetCommission: string;

    receivableFromBanks: number;
    formattedReceivableFromBanks: string;

    cpPayoutDeducted: number;
    formattedCpPayoutDeducted: string;

    netIncomeAfterCpPayout: number;
    formattedNetIncomeAfterCpPayout: string;

    yoYGrowthPercentage: number;
    yoYGrowth: string;

    financialYearWiseGrowth: IMasterCPDashboardFinancialYearGrowth[];
}

export interface IMasterCPDashboardFinancialYearGrowth {
    financialYear: string;

    grossCommissionEarned: number;
    formattedGrossCommissionEarned: string;

    netCommission: number;
    formattedNetCommission: string;

    netIncomeAfterCpPayout: number;
    formattedNetIncomeAfterCpPayout: string;

    growthPercentage: number;
    formattedGrowthPercentage: string;
}

export interface IMasterCPLoanTypeWiseDashboardResponse {
    filterType: number;
    trendMonths: number;
    currentRangeLabel: string;

    totalApplications: number;
    totalAmount: number;
    formattedTotalAmount: string;

    labels: string[];

    series: IMasterCPLoanTypeWiseSeries[];

    loanTypes: IMasterCPLoanTypeWiseSummary[];
}

export interface IMasterCPLoanTypeWiseSeries {
    loanTypeId: number;
    loanTypeName: string;
    displayOrder: number;

    data: number[];
    formattedData: string[];
}

export interface IMasterCPLoanTypeWiseSummary {
    loanTypeId: number;
    loanTypeName: string;
    displayOrder: number;

    applicationCount: number;

    totalAmount: number;
    formattedTotalAmount: string;

    previousApplicationCount: number;
    previousTotalAmount: number;
    formattedPreviousTotalAmount: string;

    growthPercentage: number;
}

export interface IMasterCPTopDisbursementResponse {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    records: IMasterCPTopDisbursementRecord[];
}

export interface IMasterCPTopDisbursementRecord {
    rank: number;

    userID: string;
    name: string;
    code: string;

    amount: number;
    formattedAmount: string;

    isActive: boolean;
    createdDate: string;
}

export interface IMasterCPDashboardOverview {
    summary: IMasterCPDashboardOverviewSummary;

    masterCpCapacity: IMasterCPCapacityResponseData;

    businessGrowth: IMasterCPDashboardResponseDataBusinessGrowth;

    top10CpByDisbursement: IMasterCPDashboardOverviewTopCP[];

    stateList: string[];
}

export interface IMasterCPDashboardOverviewSummary {
    totalCp: number;
    totalActiveCp: number;

    totalBranch: number;
    totalActiveBranch: number;

    totalClients: number;

    totalApplications: number;
    totalCpApplications: number;
    totalBranchApplications: number;

    totalAmount: number;
    formattedTotalAmount: string;

    totalCpAmount: number;
    formattedTotalCpAmount: string;

    totalBranchAmount: number;
    formattedTotalBranchAmount: string;

    totalSanctionedAmount: number;
    formattedTotalSanctionedAmount: string;

    totalDisbursementAmount: number;
    formattedTotalDisbursementAmount: string;

    totalCreditBalance: number;
    totalCreditConsumption: number;
}

export interface IMasterCPDashboardOverviewTopCP {
    rank: number;

    id: string;

    state: string;
    city: string;

    name: string;
    code: string;

    amount: number;
    formattedAmount: string;

    noOfLoanApplications: number;
    noOfClients: number;

    isActive: boolean;
}

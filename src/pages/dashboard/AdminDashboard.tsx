import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import { RootState } from "../../store";
import {
  getAdminAllDataAPI,
  getAdminDashboardAPI,
} from "../../utils/axios/apiServices";
import {
  IAdminAllData,
  IAdminAllDataResponse,
  IAdminDashboardData,
  IAdminDashboardFilterBody,
  IAdminDashboardResponse,
  ITotalCountByStatus,
  ITotalNoOfUsers,
} from "../../interface/adminDashboard";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatDecimalValue,
} from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { AdminDateFilterType } from "../../utils/constants/enum";
import {
  formatDate,
  toastError,
} from "../../utils/functions/shared";
import { getEducationLoanDrafts } from "../../utils/demo/demoEducationLoanFlow";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import {
  IsEmptyObject,
  IsNullOrEmptyArray,
} from "../../utils/functions/nullCheck";

const dateFilters = [
  { label: "Today", value: AdminDateFilterType.TODAY },
  { label: "Last Week", value: AdminDateFilterType.LAST_WEEK },
  { label: "Last 30 Days", value: AdminDateFilterType.LAST_30_DAYS },
  { label: "This Quarter", value: AdminDateFilterType.THIS_QUARTER },
  { label: "Last 1 Year", value: AdminDateFilterType.LAST_1_YEAR },
  { label: "Custom Range", value: AdminDateFilterType.CUSTOM_DATE_RANGE },
  { label: "All", value: AdminDateFilterType.ALL },
];

const chartColors = [
  "#ff632c",
  "#2563eb",
  "#27ae60",
  "#fc902c",
  "#7c3aed",
  "#4bd184",
  "#3da0e7",
  "#ff4d4f",
];

const distributeTrendAcrossMonths = (total: number, monthCount: number): number[] => {
  if (total <= 0 || monthCount <= 0) return Array.from({ length: monthCount }, () => 0);

  const weights = [0.12, 0.18, 0.14, 0.2, 0.15, 0.21].slice(0, monthCount);
  const normalizedWeights =
    weights.length === monthCount
      ? weights
      : Array.from({ length: monthCount }, () => 1 / monthCount);

  const roundedValues = normalizedWeights.map((weight) =>
    Math.round((total * weight) / 50) * 50,
  );
  const roundedTotal = roundedValues.reduce((sum, value) => sum + value, 0);
  const difference = total - roundedTotal;

  roundedValues[roundedValues.length - 1] += difference;

  return roundedValues;
};

const isDateWithinEducationFilter = (
  value: string | null | undefined,
  filterType: AdminDateFilterType,
  customStartDate: Date | null,
  customEndDate: Date | null,
): boolean => {
  if (!value) return false;

  const currentDate = new Date(value);

  if (Number.isNaN(currentDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filterType) {
    case AdminDateFilterType.TODAY: {
      const filterDate = new Date(today);
      return currentDate >= filterDate;
    }
    case AdminDateFilterType.LAST_WEEK: {
      const filterDate = new Date(today);
      filterDate.setDate(filterDate.getDate() - 7);
      return currentDate >= filterDate;
    }
    case AdminDateFilterType.LAST_30_DAYS: {
      const filterDate = new Date(today);
      filterDate.setDate(filterDate.getDate() - 30);
      return currentDate >= filterDate;
    }
    case AdminDateFilterType.THIS_QUARTER: {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const filterDate = new Date(today.getFullYear(), quarterStartMonth, 1);
      return currentDate >= filterDate;
    }
    case AdminDateFilterType.LAST_1_YEAR: {
      const filterDate = new Date(today);
      filterDate.setFullYear(filterDate.getFullYear() - 1);
      return currentDate >= filterDate;
    }
    case AdminDateFilterType.CUSTOM_DATE_RANGE: {
      if (!customStartDate || !customEndDate) return true;

      const normalizedStartDate = new Date(customStartDate);
      normalizedStartDate.setHours(0, 0, 0, 0);

      const normalizedEndDate = new Date(customEndDate);
      normalizedEndDate.setHours(23, 59, 59, 999);

      return currentDate >= normalizedStartDate && currentDate <= normalizedEndDate;
    }
    case AdminDateFilterType.ALL:
    default:
      return true;
  }
};

const AdminDashboard = () => {
  const [adminInfo, setAdminInfo] = useState<IAdminDashboardData>();

  const [adminAllData, setAdminAllData] = useState<IAdminAllData>();

  const [loading, setLoading] = useState<boolean>(false);

  const [dateFilter, setDateFilter] = useState<AdminDateFilterType>(AdminDateFilterType.ALL);

  const [startDate, setStartDate] = useState<Date | null>(null);

  const [endDate, setEndDate] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<"channelPartner" | "education">("channelPartner");

  const [educationDateFilter, setEducationDateFilter] =
    useState<AdminDateFilterType>(AdminDateFilterType.ALL);

  const [educationStartDate, setEducationStartDate] = useState<Date | null>(null);

  const [educationEndDate, setEducationEndDate] = useState<Date | null>(null);

  const [educationDisbursementView, setEducationDisbursementView] =
    useState<"monthly" | "yearly">("monthly");

  const [educationDisbursementYear, setEducationDisbursementYear] =
    useState<number | null>(null);

  const navigate = useNavigate();

  const { userName, userType } = useSelector((state: RootState) => state.user.user);

  const fetchDashboardDetail = useCallback(async (): Promise<void> => {
    setLoading(true);

    const response: IAdminDashboardResponse = await getAdminDashboardAPI();

    if (!response) return;

    if (response.statusCode === 200) {
      setAdminInfo(response.data);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  }, []);

  const fetchAllData = useCallback(async (overrideBody?: IAdminDashboardFilterBody): Promise<void> => {
    setLoading(true);

    const body = overrideBody || {
      filterType: dateFilter,
    };

    const response: IAdminAllDataResponse = await getAdminAllDataAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      setAdminAllData(response.data);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  }, [dateFilter]);

  const handleDateFilterChange = (value: AdminDateFilterType): void => {
    setDateFilter(value);

    if (value !== AdminDateFilterType.CUSTOM_DATE_RANGE) {
      setStartDate(null);
      setEndDate(null);
      fetchAllData({ filterType: value });
    }
  };

  const handleApplyCustomRange = (): void => {
    if (!startDate || !endDate) {
      toastError("Please select start date and end date.");
      return;
    }

    if (startDate > endDate) {
      toastError("Start date cannot be greater than end date.");
      return;
    }

    fetchAllData({
      filterType: AdminDateFilterType.CUSTOM_DATE_RANGE,
      startDate: `${formatDate(startDate, "YYYY-MM-DD")}T00:00:00`,
      endDate: `${formatDate(endDate, "YYYY-MM-DD")}T23:59:59`,
    });
  };

  const dashboardRoute = useCallback((): void => {
    if (userType === CLIENT_ROLE.SUPER_ADMIN) {
      navigate(RoutePathConstant.private.dashboard);
    } else if (userType === CLIENT_ROLE.CUSTOMER) {
      navigate(RoutePathConstant.private.clientDashboard);
    } else if (userType === CLIENT_ROLE.SOURCING_PARTNER) {
      navigate(RoutePathConstant.private.userMasterClientMaster);
    } else {
      navigate(RoutePathConstant.private.channelPartnerDashboard);
    }
  }, [navigate, userType]);

  const handleEducationDateFilterChange = (value: AdminDateFilterType): void => {
    setEducationDateFilter(value);

    if (value !== AdminDateFilterType.CUSTOM_DATE_RANGE) {
      setEducationStartDate(null);
      setEducationEndDate(null);
    }
  };

  const handleEducationApplyCustomRange = (): void => {
    if (!educationStartDate || !educationEndDate) {
      toastError("Please select start date and end date.");
      return;
    }

    if (educationStartDate > educationEndDate) {
      toastError("Start date cannot be greater than end date.");
      return;
    }
  };

  const totalUsers = useMemo(
    () => (adminAllData?.usersInfo || []).reduce((sum, item) => sum + item.count, 0),
    [adminAllData?.usersInfo],
  );

  const totalReports = useMemo(
    () => (adminAllData?.reportCounts || []).reduce((sum, item) => sum + item.count, 0),
    [adminAllData?.reportCounts],
  );

  const totalApplications = adminAllData?.totalLoanApplications || 0;

  const totalDisbursedApplications = adminAllData?.totalDisbursedApplications || 0;

  const subscriptionDetails = adminAllData?.subscriptionDetails;
  const subscriptionsSold = subscriptionDetails?.subscriptionsSold || 0;
  const creditsProvided = subscriptionDetails?.creditsProvided || 0;
  const cumulativeAmount = subscriptionDetails?.cumulativeAmount || 0;

  const geographicalApplications = useMemo(
    () =>
      adminInfo?.demographicsData
        ?.map((item) => ({
          state: item.state || "-",
          noOfLoanApplications: item.noOfLoanApplications || 0,
        }))
        .sort(
          (firstItem, secondItem) =>
            secondItem.noOfLoanApplications - firstItem.noOfLoanApplications,
        ) ?? [],
    [adminInfo?.demographicsData],
  );

  const applicationStatusData = useMemo(
    () =>
      adminInfo?.totalCountByStatus
        ?.map((item) => ({
          name: item.displayName || "-",
          y: item.noOfApplications || 0,
          amount: item.formattedAmount,
        }))
        .filter((item) => item.y > 0) ?? [],
    [adminInfo?.totalCountByStatus],
  );

  const userMixData = useMemo(
    () =>
      adminAllData?.usersInfo?.map((item) => ({
        name: item.name,
        y: item.count || 0,
      })) ?? [],
    [adminAllData?.usersInfo],
  );

  const reportData = useMemo(() => adminAllData?.reportCounts || [], [adminAllData?.reportCounts]);
  const loanTypeData = useMemo(
    () => adminAllData?.loanTypeApplicationCounts || [],
    [adminAllData?.loanTypeApplicationCounts],
  );
  const quickMetrics = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "bi-people",
      subtitle: "Combined across all user groups",
    },
    {
      title: "Loan Applications",
      value: totalApplications,
      icon: "bi-file-earmark-bar-graph",
      subtitle: "Applications captured in selected period",
    },
    {
      title: "Reports Generated",
      value: totalReports,
      icon: "bi-journal-richtext",
      subtitle: "Across all available report types",
    },
    {
      title: "Subscriptions Sold",
      value: subscriptionsSold,
      icon: "bi-stars",
      subtitle: "Subscription activity in the current filter",
    },
  ];

  const sanctionedStatus = useMemo(
    () =>
      adminInfo?.totalCountByStatus?.find((item) =>
        item.displayName?.toLowerCase().includes("sanction"),
      ),
    [adminInfo?.totalCountByStatus],
  );

  const registeredInstituteCount = useMemo(
    () =>
      adminAllData?.usersInfo?.find((item) => item.userType === CLIENT_ROLE.CUSTOMER)?.count || 0,
    [adminAllData?.usersInfo],
  );

  const educationDrafts = useMemo(() => getEducationLoanDrafts(), []);

  const educationFilteredDisbursementEntries = useMemo(
    () =>
      educationDrafts
        .filter((draft) =>
          ["Sanctioned", "Disbursed"].includes(draft.loanApplicationStatus),
        )
        .map((draft) => ({
          id: draft.id,
          instituteName: draft.instituteName || "Unknown Institute",
          courseName: draft.courseName || "Unknown Course",
          amount: draft.loanAmount || 0,
          date:
            draft.disbursementDate ||
            draft.sanctionDate ||
            draft.updatedAt ||
            draft.createdAt,
        }))
        .filter((entry) =>
          isDateWithinEducationFilter(
            entry.date,
            educationDateFilter,
            educationStartDate,
            educationEndDate,
          ),
        ),
    [educationDateFilter, educationDrafts, educationEndDate, educationStartDate],
  );
  const educationDisbursementYearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          educationFilteredDisbursementEntries.map((entry) =>
            new Date(entry.date).getFullYear(),
          ),
        ),
      )
        .sort((firstYear, secondYear) => secondYear - firstYear)
        .map((year) => ({
          label: String(year),
          value: year,
        })),
    [educationFilteredDisbursementEntries],
  );


  const educationRepaymentRecords = useMemo(
    () =>
      educationDrafts
        .filter((draft) =>
          ["Sanctioned", "Disbursed"].includes(draft.loanApplicationStatus),
        )
        .map((draft) => ({
          draftId: draft.id,
          instituteName: draft.instituteName || "Unknown Institute",
          emiAmount: draft.emiAmount || 0,
          outstandingAmount:
            getEducationStudentById(draft.studentId)?.loanDetails.outstandingAmount || 0,
          repaymentStatus:
            getEducationStudentById(draft.studentId)?.loanDetails.repaymentStatus || "Pending",
          date:
            draft.disbursementDate ||
            draft.sanctionDate ||
            draft.updatedAt ||
            draft.createdAt,
        }))
        .filter((entry) =>
          isDateWithinEducationFilter(
            entry.date,
            educationDateFilter,
            educationStartDate,
            educationEndDate,
          ),
        ),
    [educationDateFilter, educationDrafts, educationEndDate, educationStartDate],
  );

  const educationMetrics = [
    {
      title: "Total Registered Educational Institutes",
      value: registeredInstituteCount,
      icon: "bi-buildings",
      subtitle: "Initial institute footprint derived from current master data",
    },
    {
      title: "Total Registered Lender",
      value: sanctionedStatus?.noOfApplications || 0,
      icon: "bi-patch-check",
      subtitle: "NBFC Lender registered in our portal",
    },
    {
      title: "Total Registered Students",
      value: totalDisbursedApplications,
      icon: "bi-mortarboard",
      subtitle: "Current student applications tracked on the platform",
    }
  ];

  const educationDisbursementTrendConfig = useMemo(() => {
    if (educationFilteredDisbursementEntries.length === 0) return null;
    if (educationDisbursementYearOptions.length === 0) return null;

    const selectedYear =
      educationDisbursementYear ?? educationDisbursementYearOptions[0].value;

    if (educationDisbursementView === "yearly") {
      const categories = [...educationDisbursementYearOptions]
        .reverse()
        .map((option) => String(option.value));

      return {
        title: "Yearly Disbursement Trend",
        categories,
        amountData: categories.map((yearLabel) =>
          educationFilteredDisbursementEntries
            .filter((entry) => new Date(entry.date).getFullYear() === Number(yearLabel))
            .reduce((sum, entry) => sum + entry.amount, 0),
        ),
        applicationCountData: categories.map(
          (yearLabel) =>
            educationFilteredDisbursementEntries.filter(
              (entry) => new Date(entry.date).getFullYear() === Number(yearLabel),
            ).length,
        ),
      };
    }

    const categories = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      title: `Monthly Disbursement Trend (${selectedYear})`,
      categories,
      amountData: categories.map((_, monthIndex) =>
        educationFilteredDisbursementEntries
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            return (
              entryDate.getFullYear() === selectedYear &&
              entryDate.getMonth() === monthIndex
            );
          })
          .reduce((sum, entry) => sum + entry.amount, 0),
      ),
      applicationCountData: categories.map(
        (_, monthIndex) =>
          educationFilteredDisbursementEntries.filter((entry) => {
            const entryDate = new Date(entry.date);
            return (
              entryDate.getFullYear() === selectedYear &&
              entryDate.getMonth() === monthIndex
            );
          }).length,
      ),
    };
  }, [
    educationDisbursementYear,
    educationDisbursementYearOptions,
    educationDisbursementView,
    educationFilteredDisbursementEntries,
  ]);

  useEffect(() => {
    if (educationDisbursementYearOptions.length === 0) {
      setEducationDisbursementYear(null);
      return;
    }

    setEducationDisbursementYear((currentYear) =>
      currentYear &&
      educationDisbursementYearOptions.some(
        (option) => option.value === currentYear,
      )
        ? currentYear
        : educationDisbursementYearOptions[0].value,
    );
  }, [educationDisbursementYearOptions]);

  const educationInstituteWiseDisbursementData = useMemo(
    () =>
      Object.entries(
        educationFilteredDisbursementEntries.reduce((accumulator, entry) => {
          accumulator[entry.instituteName] =
            (accumulator[entry.instituteName] || 0) + entry.amount;
          return accumulator;
        }, {} as Record<string, number>),
      ).map(([instituteName, amount]) => ({
        name: instituteName,
        y: amount,
      })),
    [educationFilteredDisbursementEntries],
  );

  const parseRemainingEmis = useCallback(
    (emiAmount: number, outstandingAmount: number): number => {
      if (!emiAmount || outstandingAmount <= 0) return 0;
      return Math.max(1, Math.ceil(outstandingAmount / emiAmount));
    },
    [],
  );

  const educationPaymentHistoryCards = useMemo(() => {
    const cardConfigs = [
      {
        title: "Ongoing",
        statuses: ["On-Time", "Pending"],
        color: "#0BB680",
      },
      {
        title: "Delayed",
        statuses: ["Delayed"],
        color: "#F4A917",
      },
      {
        title: "Overdue",
        statuses: ["Overdue"],
        color: "#F64F59",
      },
    ];

    return cardConfigs.map((config) => {
      const matchedRecords = educationRepaymentRecords.filter((record) =>
        config.statuses.includes(record.repaymentStatus),
      );

      return {
        title: config.title,
        color: config.color,
        loanCount: matchedRecords.length,
        emiCount: matchedRecords.reduce(
          (sum, record) => sum + parseRemainingEmis(record.emiAmount, record.outstandingAmount),
          0,
        ),
        emiAmount: matchedRecords.reduce((sum, record) => sum + record.emiAmount, 0),
      };
    });
  }, [educationRepaymentRecords, parseRemainingEmis]);

  const educationPaymentHistoryTrend = useMemo(() => {
    const monthKeys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const statusSeries = [
      {
        name: "Ongoing",
        color: "#0BB680",
        statuses: ["On-Time", "Pending"],
      },
      {
        name: "Delayed",
        color: "#F4A917",
        statuses: ["Delayed"],
      },
      {
        name: "Overdue",
        color: "#F64F59",
        statuses: ["Overdue"],
      },
    ];

    return {
      categories: monthKeys,
      amountLabel: "Total scheduled EMI amount",
      series: statusSeries.map((series) => {
        const totalAmount = educationRepaymentRecords
          .filter((record) => series.statuses.includes(record.repaymentStatus))
          .reduce((sum, record) => sum + record.emiAmount, 0);

        return {
          name: series.name,
          color: series.color,
          data: distributeTrendAcrossMonths(totalAmount, monthKeys.length),
        };
      }),
    };
  }, [educationRepaymentRecords]);

  const spotlightMetrics: Array<{
    title: string;
    value: string | number;
    helper: string;
  }> = [
      {
        title: "Credits Provided",
        value: creditsProvided,
        helper: "Credits distributed to partners and clients",
      },
      {
        title: "Subscription Revenue",
        value: cumulativeAmount ? formatCurrencyAmount(cumulativeAmount) : 0,
        helper: "Cumulative subscription amount",
      }
    ];

  const statusDonutOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 320,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> applications",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderWidth: 0,
        style: {
          color: "var(--color-white)",
        },
      },
      plotOptions: {
        pie: {
          innerSize: "62%",
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            distance: 10,
            style: {
              color: "var(--color-text-black)",
              textOutline: "none",
              fontSize: "11px",
              fontWeight: "600",
            },
            formatter: function (this: any) {
              return this.y ? `${this.point.name}: ${this.y}` : "";
            },
          },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          type: "pie" as const,
          name: "Applications",
          colorByPoint: true,
          data: applicationStatusData.map((item, index) => ({
            name: item.name,
            y: item.y,
            color: chartColors[index % chartColors.length],
          })),
        },
      ],
    }),
    [applicationStatusData],
  );

  const userMixOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: 700,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: userMixData.map((item) => item.name),
        lineColor: "var(--color-surface-soft-25)",
        tickLength: 0,
        labels: {
          style: {
            color: "var(--color-text-black)",
            fontSize: "12px",
          },
        },
      },
      yAxis: {
        title: {
          text: "Users",
          style: {
            color: "var(--color-text-black)",
          },
        },
        allowDecimals: false,
        endOnTick: false,
        gridLineColor: "var(--color-surface-soft-25)",
        labels: {
          style: {
            color: "var(--color-text-black)",
          },
        },
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> users",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderWidth: 0,
        style: {
          color: "var(--color-white)",
        },
      },
      plotOptions: {
        column: {
          borderRadius: 10,
          pointPadding: 0.08,
          borderWidth: 0,
        },
        series: {
          dataLabels: {
            enabled: true,
            style: {
              color: "var(--color-text-black)",
              textOutline: "none",
            },
          },
        },
      },
      series: [
        {
          type: "column" as const,
          name: "Users",
          data: userMixData.map((item, index) => ({
            y: item.y,
            color: chartColors[index % chartColors.length],
          })),
        },
      ],
    }),
    [userMixData],
  );

  const reportOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        backgroundColor: "transparent",
        height: Math.max(280, reportData.length * 70),
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: reportData.map((item) => item.name),
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: "var(--color-text-black)",
            fontSize: "12px",
            fontWeight: "500",
          },
        },
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        gridLineColor: "var(--color-surface-soft-25)",
        title: {
          text: "Reports",
          style: {
            color: "var(--color-text-black)",
          },
        },
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> reports",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderWidth: 0,
        style: {
          color: "var(--color-white)",
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          borderWidth: 0,
          pointPadding: 0.12,
        },
      },
      series: [
        {
          type: "bar" as const,
          name: "Reports",
          data: reportData.map((item, index) => ({
            y: item.count,
            color: chartColors[index % chartColors.length],
          })),
        },
      ],
    }),
    [reportData],
  );

  const loanTypeOptions = useMemo(
    () => ({
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: 340,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: loanTypeData.map((item) => item.loanTypeName),
        labels: {
          rotation: loanTypeData.length > 4 ? -25 : 0,
          style: {
            color: "var(--color-text-black)",
            fontSize: "12px",
          },
        },
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        gridLineColor: "var(--color-surface-soft-25)",
        title: {
          text: "Applications",
          style: {
            color: "var(--color-text-black)",
          },
        },
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat: "<b>{point.y}</b> applications",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderWidth: 0,
        style: {
          color: "var(--color-white)",
        },
      },
      plotOptions: {
        column: {
          borderRadius: 10,
          borderWidth: 0,
          pointPadding: 0.1,
        },
      },
      series: [
        {
          type: "column" as const,
          name: "Applications",
          data: loanTypeData.map((item, index) => ({
            y: item.count,
            color: chartColors[index % chartColors.length],
          })),
        },
      ],
    }),
    [loanTypeData],
  );

  const geographyOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        height: 420,
        backgroundColor: "transparent",
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      plotOptions: {
        pie: {
          animation: false,
          borderWidth: 0,
          size: "88%",
          showInLegend: true,
          cursor: "pointer",
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
            distance: 12,
            style: {
              color: "var(--color-text-black)",
              fontSize: "11px",
              fontWeight: "600",
              textOutline: "none",
            },
            formatter: function (this: any): string {
              return this.y ? `${this.point.name}: ${this.y}` : "";
            },
          },
        },
      },
      tooltip: {
        headerFormat: "",
        pointFormat: "{point.name}: <b>{point.y}</b> applications",
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderWidth: 0,
        style: {
          color: "var(--color-white)",
        },
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: "var(--color-text-black)",
          fontSize: "12px",
          fontWeight: "500",
        },
        itemHiddenStyle: {
          color: "var(--color-text-muted)",
        },
      },
      series: [
        {
          type: "pie" as const,
          name: "Loan Applications",
          colorByPoint: true,
          data: geographicalApplications.map((item, index) => ({
            name: item.state,
            y: item.noOfLoanApplications,
            color: chartColors[index % chartColors.length],
          })),
        },
      ],
    }),
    [geographicalApplications],
  );

  useEffect(() => {
    fetchDashboardDetail();
    dashboardRoute();
    fetchAllData({ filterType: AdminDateFilterType.ALL });
  }, [dashboardRoute, fetchAllData, fetchDashboardDetail]);

  return (
    <div className="whiteBoxHldr p-30 admin-dashboard-shell">
      <Loader isLoading={loading} />

      <div className="admin-dashboard">
        <section className="admin-dashboard-tabs">
          <button
            type="button"
            className={`admin-dashboard-tab ${activeTab === "channelPartner" ? "is-active" : ""}`}
            onClick={() => setActiveTab("channelPartner")}
          >
            Channel Partner
          </button>
          <button
            type="button"
            className={`admin-dashboard-tab ${activeTab === "education" ? "is-active" : ""}`}
            onClick={() => setActiveTab("education")}
          >
            Education Portal
          </button>
        </section>

        {activeTab === "channelPartner" ? (
          <>
            <section className="admin-dashboard-hero">
              <div className="admin-dashboard-hero__content">
                <h1 className="admin-dashboard-hero__title">Welcome back, {userName}</h1>
                <p className="admin-dashboard-hero__copy">
                  Monitor users, subscriptions, reports, and loan application momentum from one
                  place without changing any of the existing workflows.
                </p>

                <div className="admin-dashboard-hero__chips">
                  <div className="admin-dashboard-pill">
                    <i className="bi bi-clock-history" />
                    Active filter: {dateFilters.find((item) => item.value === dateFilter)?.label}
                  </div>
                  <div className="admin-dashboard-pill">
                    <i className="bi bi-lightning-charge" />
                    {totalApplications} loan applications tracked
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-hero__spotlight">
                {spotlightMetrics.map((metric) => (
                  <div key={metric.title} className="admin-dashboard-spotlight-card">
                    <div className="admin-dashboard-spotlight-card__label">{metric.title}</div>
                    <div className="admin-dashboard-spotlight-card__value">{metric.value}</div>
                    <div className="admin-dashboard-spotlight-card__helper">{metric.helper}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-dashboard-filter-panel">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Date Filter" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Switch the dashboard period instantly or apply a custom range.
                  </p>
                </div>
              </div>

              <div className="admin-dashboard-filter-actions">
                {dateFilters.map((filterItem) => (
                  <Button
                    key={filterItem.value}
                    className={`btn ${filterItem.value === dateFilter ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => handleDateFilterChange(filterItem.value)}
                  >
                    {filterItem.label}
                  </Button>
                ))}
              </div>

              {dateFilter === AdminDateFilterType.CUSTOM_DATE_RANGE && (
                <div className="row g-3 mt-1">
                  <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                    <label className="form-label small fw-semibold">Start Date</label>
                    <Calendar
                      inputId="adminDashboardStartDate"
                      value={startDate}
                      placeholder="From Date"
                      readOnlyInput
                      maxDate={endDate || new Date()}
                      showButtonBar
                      className="w-100"
                      onChange={(e) => {
                        const selectedStartDate = e.value as Date | null;
                        const nextEndDate =
                          selectedStartDate && endDate && endDate < selectedStartDate
                            ? null
                            : endDate;

                        setStartDate(selectedStartDate);
                        setEndDate(nextEndDate);
                      }}
                    />
                  </div>
                  <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                    <label className="form-label small fw-semibold">End Date</label>
                    <Calendar
                      inputId="adminDashboardEndDate"
                      value={endDate}
                      placeholder="To Date"
                      readOnlyInput
                      minDate={startDate || undefined}
                      maxDate={new Date()}
                      showButtonBar
                      className="w-100"
                      disabled={!startDate}
                      onChange={(e) => setEndDate(e.value as Date | null)}
                    />
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 col-12 d-flex align-items-end">
                    <Button
                      label="Apply"
                      icon="bi bi-funnel"
                      className="btn btn-orange gap-2"
                      onClick={handleApplyCustomRange}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="admin-dashboard-metrics-grid">
              {quickMetrics.map((metric) => (
                <div key={metric.title} className="admin-dashboard-metric-card">
                  <div className="admin-dashboard-metric-card__icon">
                    <i className={`bi ${metric.icon}`} />
                  </div>
                  <div className="admin-dashboard-metric-card__body">
                    <div className="admin-dashboard-metric-card__title">{metric.title}</div>
                    <div className="admin-dashboard-metric-card__value">{metric.value}</div>
                    <div className="admin-dashboard-metric-card__subtitle">{metric.subtitle}</div>
                  </div>
                </div>
              ))}
            </section>

            <section className="row g-4">
              {!IsNullOrEmptyArray(adminAllData?.usersInfo || []) && (
                <div className="col-12 col-xl-7">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="User Overview" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Distribution of users across key account types.
                        </p>
                      </div>
                    </div>

                    <div className="admin-dashboard-user-grid">
                      {adminAllData?.usersInfo.map((userInfo: ITotalNoOfUsers, index: number) => (
                        <div
                          key={userInfo.userType}
                          className={`admin-dashboard-user-card ${userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER ? "is-clickable" : ""}`}
                          onClick={() => {
                            if (userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER) {
                              navigate(RoutePathConstant.private.userMasterChannelPartner);
                            }
                          }}
                        >
                          <div
                            className="admin-dashboard-user-card__accent"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <div className="admin-dashboard-user-card__count">{userInfo.count}</div>
                          <div className="admin-dashboard-user-card__name">{userInfo.name}</div>
                          <div className="admin-dashboard-user-card__meta">
                            {userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER
                              ? "Tap to open channel partner listing"
                              : "Current dashboard summary"}
                          </div>
                          {userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER && (
                            <div className="admin-dashboard-user-card__arrow">
                              <i className="bi bi-arrow-up-right" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!IsNullOrEmptyArray(applicationStatusData) && (
                <div className="col-12 col-xl-5">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="Application Status Mix" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Share of applications by lifecycle stage.
                        </p>
                      </div>
                    </div>

                    <HighchartsReact highcharts={Highcharts} options={statusDonutOptions} />

                    <div className="admin-dashboard-legend-list">
                      {applicationStatusData.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="admin-dashboard-legend-item">
                          <span
                            className="admin-dashboard-legend-swatch"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <span className="admin-dashboard-legend-label">{item.name}</span>
                          <span className="admin-dashboard-legend-value">{item.y}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="row g-4">
              {!IsNullOrEmptyArray(userMixData) && (
                <div className="col-12 col-xl-6">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="User Composition" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Compare user segments side by side.
                        </p>
                      </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={userMixOptions} />
                  </div>
                </div>
              )}

              {!IsNullOrEmptyArray(reportData) && (
                <div className="col-12 col-xl-6">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="Report Counts" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Reporting activity by available report category.
                        </p>
                      </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={reportOptions} />
                  </div>
                </div>
              )}
            </section>

            <section className="row g-4">
              {subscriptionDetails && !IsEmptyObject(subscriptionDetails) && (
                <div className="col-12 col-xl-4">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="Subscription Details" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Revenue and credit movement for subscriptions.
                        </p>
                      </div>
                    </div>

                    <div className="admin-dashboard-stack-list">
                      {Object.entries(subscriptionDetails).map(([key, value], index) => {
                        return (
                          <div key={key} className="admin-dashboard-stack-card">
                            <div
                              className="admin-dashboard-stack-card__line"
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            />
                            <div className="admin-dashboard-stack-card__content">
                              <div className="admin-dashboard-stack-card__label">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="admin-dashboard-stack-card__value">
                                {key === "cumulativeAmount" && value
                                  ? formatCurrencyAmount(value as number)
                                  : (value as number)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!IsNullOrEmptyArray(loanTypeData) && (
                <div className="col-12 col-xl-8">
                  <div className="admin-dashboard-panel h-100">
                    <div className="admin-dashboard-section-head">
                      <div>
                        <TableTitle title="Loan Type Application Counts" />
                        <p className="admin-dashboard-section-copy mb-0">
                          Demand distribution across loan products.
                        </p>
                      </div>
                    </div>
                    <HighchartsReact highcharts={Highcharts} options={loanTypeOptions} />
                  </div>
                </div>
              )}
            </section>

            {!IsNullOrEmptyArray(adminInfo?.totalCountByStatus || []) && (
              <section className="admin-dashboard-panel">
                <div className="admin-dashboard-section-head">
                  <div>
                    <TableTitle title="Loan Application Snapshots" />
                    <p className="admin-dashboard-section-copy mb-0">
                      Amounts and counts by application status.
                    </p>
                  </div>
                </div>

                <div className="row g-4">
                  {adminInfo?.totalCountByStatus.map(
                    (applicationStatus: ITotalCountByStatus, index: number) => (
                      <div
                        key={applicationStatus.displayName}
                        className="col-lg-4 col-md-6 col-12"
                      >
                        <div className="admin-dashboard-status-card h-100">
                          <div
                            className="admin-dashboard-status-card__glow"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <div className="admin-dashboard-status-card__label">
                            {applicationStatus.displayName}
                          </div>
                          <div className="admin-dashboard-status-card__value">
                            {applicationStatus.noOfApplications}
                          </div>
                          <div className="admin-dashboard-status-card__amount">
                            {applicationStatus.formattedAmount
                              ? `Amount: Rs ${formatDecimalValue(applicationStatus.formattedAmount)}`
                              : "Amount not available"}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

            {!IsNullOrEmptyArray(adminInfo?.demographicsData || []) && (
              <section className="admin-dashboard-panel">
                <div className="admin-dashboard-section-head">
                  <div>
                    <TableTitle title="Geographical Applications" />
                    <p className="admin-dashboard-section-copy mb-0">
                      State-wise application distribution by volume.
                    </p>
                  </div>

                  <div className="BtnRightHldr">
                    <Button
                      className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"} w-100`}
                      onClick={() => navigate(RoutePathConstant.private.geographicalReport)}
                      disabled={loading}
                    >
                      <div className="d-flex gap-2 align-items-center">
                        View All
                        <i className="bi bi-arrow-right" />
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="admin-dashboard-geo-chart">
                  <HighchartsReact highcharts={Highcharts} options={geographyOptions} />
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="admin-dashboard-filter-panel">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Date Filter" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Filter all education portal disbursement and repayment views by period.
                  </p>
                </div>
              </div>

              <div className="admin-dashboard-filter-actions">
                {dateFilters.map((filterItem) => (
                  <Button
                    key={filterItem.value}
                    className={`btn ${filterItem.value === educationDateFilter ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => handleEducationDateFilterChange(filterItem.value)}
                  >
                    {filterItem.label}
                  </Button>
                ))}
              </div>

              {educationDateFilter === AdminDateFilterType.CUSTOM_DATE_RANGE && (
                <div className="row g-3 mt-1">
                  <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                    <label className="form-label small fw-semibold">Start Date</label>
                    <Calendar
                      inputId="adminEducationDashboardStartDate"
                      value={educationStartDate}
                      placeholder="From Date"
                      readOnlyInput
                      maxDate={educationEndDate || new Date()}
                      showButtonBar
                      className="w-100"
                      onChange={(e) => {
                        const selectedStartDate = e.value as Date | null;
                        const nextEndDate =
                          selectedStartDate &&
                          educationEndDate &&
                          educationEndDate < selectedStartDate
                            ? null
                            : educationEndDate;

                        setEducationStartDate(selectedStartDate);
                        setEducationEndDate(nextEndDate);
                      }}
                    />
                  </div>
                  <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                    <label className="form-label small fw-semibold">End Date</label>
                    <Calendar
                      inputId="adminEducationDashboardEndDate"
                      value={educationEndDate}
                      placeholder="To Date"
                      readOnlyInput
                      minDate={educationStartDate || undefined}
                      maxDate={new Date()}
                      showButtonBar
                      className="w-100"
                      disabled={!educationStartDate}
                      onChange={(e) => setEducationEndDate(e.value as Date | null)}
                    />
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 col-12 d-flex align-items-end">
                    <Button
                      label="Apply"
                      icon="bi bi-funnel"
                      className="btn btn-orange gap-2"
                      onClick={handleEducationApplyCustomRange}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="admin-dashboard-metrics-grid admin-dashboard-metrics-grid--education">
              {educationMetrics.map((metric) => (
                <div key={metric.title} className="admin-dashboard-metric-card">
                  <div className="admin-dashboard-metric-card__icon">
                    <i className={`bi ${metric.icon}`} />
                  </div>
                  <div className="admin-dashboard-metric-card__body">
                    <div className="admin-dashboard-metric-card__title">{metric.title}</div>
                    <div className="admin-dashboard-metric-card__value">{metric.value}</div>
                    <div className="admin-dashboard-metric-card__subtitle">{metric.subtitle}</div>
                  </div>
                </div>
              ))}
            </section>

            <section className="row g-4 mt-1">
              <div className="col-xl-7 col-lg-7 col-12">
                <section className="admin-dashboard-panel h-100">
                  <div className="admin-dashboard-section-head">
                    <div>
                      <TableTitle title="Disbursement Trend" />
                      <p className="admin-dashboard-section-copy mb-0">
                        Compare disbursement amount and application count across all institutes by month or year.
                      </p>
                    </div>

                    <div className="admin-dashboard-filter-actions form-group">
                      {educationDisbursementView === "monthly" &&
                        educationDisbursementYearOptions.length > 0 && (
                          <Dropdown
                            value={educationDisbursementYear}
                            options={educationDisbursementYearOptions}
                            onChange={(event) =>
                              setEducationDisbursementYear(event.value as number)
                            }
                            placeholder="Select Year"
                            className="admin-dashboard-filter-dropdown"
                          />
                        )}
                      <Button
                        className={`btn ${educationDisbursementView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                        onClick={() => setEducationDisbursementView("monthly")}
                      >
                        Monthly
                      </Button>
                      <Button
                        className={`btn ${educationDisbursementView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                        onClick={() => setEducationDisbursementView("yearly")}
                      >
                        Yearly
                      </Button>
                    </div>
                  </div>

                  {educationDisbursementTrendConfig ? (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: "column",
                          height: 340,
                        },
                        credits: {
                          enabled: false,
                        },
                        title: {
                          text: educationDisbursementTrendConfig.title,
                        },
                        xAxis: {
                          categories: educationDisbursementTrendConfig.categories,
                        },
                        yAxis: [
                          {
                            title: {
                              text: "Disbursement Amount",
                            },
                            labels: {
                              formatter: function (this: any): string {
                                return `\u20B9${Number(this.value).toLocaleString("en-IN")}`;
                              },
                            },
                          },
                          {
                            title: {
                              text: "No. of Applications",
                            },
                            allowDecimals: false,
                            opposite: true,
                          },
                        ],
                        legend: {
                          enabled: true,
                        },
                        tooltip: {
                          shared: true,
                        },
                        plotOptions: {
                          column: {
                            borderRadius: 8,
                            grouping: true,
                          },
                        },
                        series: [
                          {
                            type: "column",
                            name: "Disbursement Amount",
                            color: "#FF632C",
                            data: educationDisbursementTrendConfig.amountData,
                            tooltip: {
                              valuePrefix: "\u20B9",
                            },
                          },
                          {
                            type: "column",
                            name: "No. of Applications",
                            yAxis: 1,
                            color: "#2563EB",
                            data: educationDisbursementTrendConfig.applicationCountData,
                            tooltip: {
                              valueSuffix: " applications",
                            },
                          },
                        ],
                      }}
                    />
                  ) : (
                    <p className="admin-dashboard-section-copy mb-0">
                      No disbursement records found for the selected date range.
                    </p>
                  )}
                </section>
              </div>

              <div className="col-xl-5 col-lg-5 col-12">
                <section className="admin-dashboard-panel h-100">
                  <div className="admin-dashboard-section-head">
                    <div>
                      <TableTitle title="Institute Wise Disbursement" />
                      <p className="admin-dashboard-section-copy mb-0">
                        Share of total disbursement completed across all institutes.
                      </p>
                    </div>
                  </div>

                  {!IsNullOrEmptyArray(educationInstituteWiseDisbursementData) ? (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={{
                        chart: {
                          type: "pie",
                          height: 340,
                        },
                        credits: {
                          enabled: false,
                        },
                        title: {
                          text: null,
                        },
                        tooltip: {
                          pointFormatter: function (this: any): string {
                            return `<span style="color:${this.color}">\u25cf</span> <b>${this.name}</b>: ₹${Number(this.y).toLocaleString("en-IN")}`;
                          },
                        },
                        plotOptions: {
                          pie: {
                            innerSize: "52%",
                            dataLabels: {
                              enabled: true,
                              formatter: function (this: any): string {
                                return `<b>${this.point.name}</b><br/>₹${Number(this.point.y).toLocaleString("en-IN")}`;
                              },
                            },
                          },
                        },
                        series: [
                          {
                            type: "pie",
                            name: "Disbursement Amount",
                            data: educationInstituteWiseDisbursementData,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <p className="admin-dashboard-section-copy mb-0">
                      No institute disbursement data found for the selected date range.
                    </p>
                  )}
                </section>
              </div>
            </section>

            <section className="admin-dashboard-panel mt-4">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Payment History" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Ongoing, delayed, and overdue repayment visibility with EMI trends across all institutes.
                  </p>
                </div>
              </div>

              <div className="row g-4 align-items-stretch">
                <div className="col-xl-5 col-lg-5 col-12">
                  <div className="admin-dashboard-user-grid education-dashboard-user-grid">
                    {educationPaymentHistoryCards.map((card) => (
                      <div key={card.title} className="admin-dashboard-user-card">
                        <div
                          className="admin-dashboard-user-card__accent"
                          style={{ backgroundColor: card.color }}
                        />
                        <div className="admin-dashboard-user-card__count">{card.loanCount}</div>
                        <div className="admin-dashboard-user-card__name">{card.title}</div>
                        <div className="admin-dashboard-user-card__meta">
                          No. of Loans: {card.loanCount}
                        </div>
                        <div className="admin-dashboard-user-card__meta">
                          No. of EMIs: {card.emiCount}
                        </div>
                        <div className="admin-dashboard-user-card__meta">
                          Total Scheduled EMI: {formatCurrencyAmount(card.emiAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-xl-7 col-lg-7 col-12">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={{
                      chart: {
                        type: "line",
                        height: 360,
                        backgroundColor: "transparent",
                      },
                      credits: {
                        enabled: false,
                      },
                      title: {
                        text: "Payment History Trend",
                      },
                      xAxis: {
                        categories: educationPaymentHistoryTrend.categories,
                        lineColor: "#d8e1ec",
                      },
                      yAxis: {
                        title: {
                          text: educationPaymentHistoryTrend.amountLabel,
                        },
                        labels: {
                          formatter: function (this: any): string {
                            return `\u20B9${Number(this.value).toLocaleString("en-IN")}`;
                          },
                        },
                      },
                      tooltip: {
                        shared: true,
                        useHTML: true,
                        formatter: function (this: any): string {
                          const rows = this.points
                            .map(
                              (point: any) =>
                                `<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:${point.color}">${point.series.name}</span><b>\u20B9${Number(point.y).toLocaleString("en-IN")}</b></div>`,
                            )
                            .join("");

                          return `<div><div style="font-weight:700;margin-bottom:8px;">${this.x}</div>${rows}</div>`;
                        },
                      },
                      plotOptions: {
                        line: {
                          lineWidth: 3,
                          marker: {
                            enabled: true,
                            radius: 4,
                          },
                          dataLabels: {
                            enabled: true,
                            formatter: function (this: any): string {
                              return this.y
                                ? `\u20B9${Number(this.y).toLocaleString("en-IN")}`
                                : "";
                            },
                            style: {
                              textOutline: "none",
                              fontSize: "10px",
                              fontWeight: "600",
                            },
                          },
                        },
                      },
                      legend: {
                        align: "center",
                        verticalAlign: "bottom",
                      },
                      series: educationPaymentHistoryTrend.series.map((series) => ({
                        type: "line" as const,
                        name: series.name,
                        color: series.color,
                        data: series.data,
                      })),
                    }}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
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

const AdminDashboard = () => {
  const [adminInfo, setAdminInfo] = useState<IAdminDashboardData>();

  const [adminAllData, setAdminAllData] = useState<IAdminAllData>();

  const [loading, setLoading] = useState<boolean>(false);

  const [dateFilter, setDateFilter] = useState<AdminDateFilterType>(AdminDateFilterType.ALL);

  const [startDate, setStartDate] = useState<Date | null>(null);

  const [endDate, setEndDate] = useState<Date | null>(null);

  const [activeTab, setActiveTab] = useState<"channelPartner" | "education">("channelPartner");

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

  const disbursedStatus = useMemo(
    () =>
      adminInfo?.totalCountByStatus?.find((item) =>
        item.displayName?.toLowerCase().includes("disburs"),
      ),
    [adminInfo?.totalCountByStatus],
  );

  const registeredInstituteCount = useMemo(
    () =>
      adminAllData?.usersInfo?.find((item) => item.userType === CLIENT_ROLE.CUSTOMER)?.count || 0,
    [adminAllData?.usersInfo],
  );

  const educationMetrics = [
    {
      title: "Total Registered Students",
      value: totalDisbursedApplications,
      icon: "bi-mortarboard",
      subtitle: "Current student applications tracked on the platform",
    },
    {
      title: "Total Availed Loans",
      value: totalApplications,
      icon: "bi-journal-check",
      subtitle: "Loans initiated through the education journey",
    },
    {
      title: "Total Sanctioned Loans",
      value: sanctionedStatus?.noOfApplications || 0,
      icon: "bi-patch-check",
      subtitle: "Education loans that reached sanction stage",
    },
    {
      title: "Total Loan Amount Disbursed by NBFCs",
      value: formatCurrencyAmount(disbursedStatus?.amount || 0),
      icon: "bi-bank",
      subtitle: "Cumulative disbursal value visible in the current dataset",
    },
    {
      title: "Total Registered Educational Institutes",
      value: registeredInstituteCount,
      icon: "bi-buildings",
      subtitle: "Initial institute footprint derived from current master data",
    },
  ];

  const educationReportSections = [
    {
      title: "NBFC Loan Distribution",
      copy: "Funding and approval momentum using the current loan pipeline.",
      rows: [
        {
          label: disbursedStatus?.displayName || "Disbursed",
          value: formatCurrencyAmount(disbursedStatus?.amount || 0),
          helper: `${disbursedStatus?.noOfApplications || 0} loans`,
        },
        {
          label: sanctionedStatus?.displayName || "Sanctioned",
          value: formatCurrencyAmount(sanctionedStatus?.amount || 0),
          helper: `${sanctionedStatus?.noOfApplications || 0} loans`,
        },
        {
          label: "Active Loan Pipeline",
          value: formatCurrencyAmount(
            (disbursedStatus?.amount || 0) + (sanctionedStatus?.amount || 0),
          ),
          helper: `${(disbursedStatus?.noOfApplications || 0) +
            (sanctionedStatus?.noOfApplications || 0)
            } loans`,
        },
      ],
    },
    {
      title: "Student Loan Distribution",
      copy: "Student demand distribution using current application activity.",
      rows: [
        {
          label: "Registered Students",
          value: totalDisbursedApplications,
          helper: "Current application volume",
        },
        {
          label: "Availed Loans",
          value: totalApplications,
          helper: "Loans initiated in this dashboard view",
        },
        {
          label: "Sanctioned Loans",
          value: sanctionedStatus?.noOfApplications || 0,
          helper: "Students who progressed to sanction",
        },
      ],
    },
    {
      title: "Institute-wise Loan Distribution",
      copy: "Institute onboarding and education lending concentration snapshot.",
      rows: [
        {
          label: "Ahmedabad School of Finance",
          value: registeredInstituteCount,
        },
        {
          label: "Surat Business Academy",
          value: sanctionedStatus?.noOfApplications || 0,
        },
        {
          label: "Nagpur Education Hub",
          value: disbursedStatus?.noOfApplications || 0,
        },
      ],
    },
  ];

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
            <section className="admin-dashboard-hero admin-dashboard-hero--education">
              <div className="admin-dashboard-hero__content">
                <div className="admin-dashboard-eyebrow">
                  <i className="bi bi-mortarboard-fill" />
                  Education Lending View
                </div>
                <h1 className="admin-dashboard-hero__title">Loan Summary Dashboard</h1>
                <p className="admin-dashboard-hero__copy">
                  Track student onboarding, education loan movement, NBFC disbursals, and
                  institute footprint from one focused admin view.
                </p>

                <div className="admin-dashboard-hero__chips">
                  <div className="admin-dashboard-pill">
                    <i className="bi bi-people" />
                    {totalApplications} students in active education journey
                  </div>
                  <div className="admin-dashboard-pill">
                    <i className="bi bi-building" />
                    {registeredInstituteCount} institutes currently reflected
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-hero__spotlight">
                <div className="admin-dashboard-spotlight-card">
                  <div className="admin-dashboard-spotlight-card__label">Sanctioned Loans</div>
                  <div className="admin-dashboard-spotlight-card__value">
                    {sanctionedStatus?.noOfApplications || 0}
                  </div>
                  <div className="admin-dashboard-spotlight-card__helper">
                    Education loans progressed to sanction stage.
                  </div>
                </div>

                <div className="admin-dashboard-spotlight-card">
                  <div className="admin-dashboard-spotlight-card__label">
                    NBFC Disbursed Amount
                  </div>
                  <div className="admin-dashboard-spotlight-card__value">
                    {formatCurrencyAmount(disbursedStatus?.amount || 0)}
                  </div>
                  <div className="admin-dashboard-spotlight-card__helper">
                    Current disbursal amount derived from the available admin dataset.
                  </div>
                </div>
              </div>
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

            <section className="admin-dashboard-panel">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Loan Reports" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Detailed report blocks for NBFC funding, student distribution, and institute
                    distribution.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {educationReportSections.map((section) => (
                  <div key={section.title} className="col-12 col-xl-4">
                    <div className="admin-dashboard-education-report h-100">
                      <div className="admin-dashboard-education-report__title">
                        {section.title}
                      </div>
                      <p className="admin-dashboard-education-report__copy mb-0">
                        {section.copy}
                      </p>

                      <div className="admin-dashboard-education-report__list">
                        {section.rows.map((row) => (
                          <div key={row.label} className="admin-dashboard-education-report__item">
                            <div>
                              <div className="admin-dashboard-education-report__label">
                                {row.label}
                              </div>
                            </div>
                            <div className="admin-dashboard-education-report__value">
                              {row.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

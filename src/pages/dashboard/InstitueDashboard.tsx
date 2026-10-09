import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import TableTitle from '../../components/TableTitle';
import { dateFilters, formatCurrencyAmount } from '../../utils/constants/constant';
import { Button } from 'primereact/button';
import { AdminDateFilterType, DashboardType } from '../../utils/constants/enum';
import { Calendar } from 'primereact/calendar';
import { formatDate, toastError } from '../../utils/functions/shared';
import { Dropdown } from 'primereact/dropdown';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IAdminDashboardFilterBody } from '../../interface/adminDashboard';
import { validationMessages } from '../../utils/constants/messages';
import {
  IEducationAdminDashboardCourseWiseDisbursement,
  IEducationAdminDashboardCourseWiseDisbursementItem,
  IEducationAdminDashboardData,
  IEducationAdminDashboardDisbursementTrendData,
  IEducationAdminDashboardPaymentHistoryCard,
  IEducationAdminDashboardPaymentHistoryCards,
  IEducationAdminDashboardPaymentHistoryTrend,
  IEducationAdminDashboardPaymentHistoryTrendData,
  IEducationAdminDashboardResponse,
} from '../../interface/educationalAdminDashboard';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import Loader from '../../components/Loader';
import { getCommonDashboardForEducationAPI } from '../../utils/axios/apiServices';

type IInstituteApplicationCard = {
  title: string;
  count: number;
  amount: number;
  color: string;
  routeStatus: number;
};

type IInstituteDisbursementTrendConfig =
  IEducationAdminDashboardDisbursementTrendData["yearly"];

type IInstituteFunnelTooltip = {
  left: number;
  top: number;
  step: IInstituteApplicationCard;
};

type ITimeView = "monthly" | "yearly";

type ISelectOption = {
  label: string;
  value: string | number;
};

type IMonthlyRecord<T> = {
  prevYear?: Record<string, T>;
  currYear?: Record<string, T>;
};

type IYearlyRecord<T> = {
  [year: string]: T;
};

const getOrderedRecordKeys = (record?: Record<string, unknown>): string[] => {
  if (!record) {
    return [];
  }

  return Object.keys(record).sort((firstKey, secondKey) => {
    const firstDate = new Date(`${firstKey} 1, 2000`).getTime();
    const secondDate = new Date(`${secondKey} 1, 2000`).getTime();

    if (Number.isNaN(firstDate) || Number.isNaN(secondDate)) {
      return firstKey.localeCompare(secondKey);
    }

    return firstDate - secondDate;
  });
};

const getPeriodicYearOptions = <T,>(
  data?: {
    monthly?: IMonthlyRecord<T>;
    yearly?: IYearlyRecord<T>;
  } | null,
): ISelectOption[] => {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>();

  if (data?.monthly?.prevYear) {
    years.add(currentYear - 1);
  }

  if (data?.monthly?.currYear) {
    years.add(currentYear);
  }

  Object.keys(data?.yearly ?? {}).forEach((year) => {
    const parsedYear = Number(year);

    if (!Number.isNaN(parsedYear)) {
      years.add(parsedYear);
    }
  });

  return Array.from(years)
    .sort((firstYear, secondYear) => secondYear - firstYear)
    .map((year) => ({
      label: String(year),
      value: year,
    }));
};

const getMonthlyRecordByYear = <T,>(
  monthlyData: IMonthlyRecord<T> | undefined,
  selectedYear: number | null,
): Record<string, T> | undefined => {
  if (!monthlyData) {
    return undefined;
  }

  const currentYear = new Date().getFullYear();

  if (selectedYear === currentYear && monthlyData.currYear) {
    return monthlyData.currYear;
  }

  if (selectedYear === currentYear - 1 && monthlyData.prevYear) {
    return monthlyData.prevYear;
  }

  return monthlyData.currYear ?? monthlyData.prevYear;
};

const getMonthOptions = <T,>(
  monthlyData: IMonthlyRecord<T> | undefined,
  selectedYear: number | null,
): ISelectOption[] => {
  const record = getMonthlyRecordByYear(monthlyData, selectedYear);

  return getOrderedRecordKeys(record).map((month) => ({
    label: month,
    value: month,
  }));
};

const getDefaultMonth = <T,>(
  monthlyData: IMonthlyRecord<T> | undefined,
  selectedYear: number | null,
): string | null => {
  const record = getMonthlyRecordByYear(monthlyData, selectedYear);

  if (!record) {
    return null;
  }

  const orderedKeys = getOrderedRecordKeys(record);

  const monthWithData = [...orderedKeys]
    .reverse()
    .find((month) => {
      const value = record[month];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(value);
    });

  return monthWithData ?? orderedKeys[orderedKeys.length - 1] ?? orderedKeys[0] ?? null;
};

const getYearlyEntry = <T,>(
  yearlyData: IYearlyRecord<T> | undefined,
  selectedYear: number | null,
): T | undefined => {
  if (!yearlyData) {
    return undefined;
  }

  if (selectedYear && yearlyData[String(selectedYear)] !== undefined) {
    return yearlyData[String(selectedYear)];
  }

  const yearlyKeys = Object.keys(yearlyData).sort();

  return yearlyKeys.length > 0 ? yearlyData[yearlyKeys[yearlyKeys.length - 1]] : undefined;
};

const InstitueDashboard = () => {
  const [instituteInfo, setInstituteInfo] =
    useState<IEducationAdminDashboardData | null>(null);

  const [instituteDateFilter, setInstituteDateFilter] =
    useState<AdminDateFilterType>(AdminDateFilterType.ALL);

  const [instituteStartDate, setInstituteStartDate] = useState<Date | null>(null);

  const [instituteEndDate, setInstituteEndDate] = useState<Date | null>(null);

  const [instituteDisbursementView, setInstituteDisbursementView] =
    useState<ITimeView>("monthly");

  const [instituteDisbursementData, setInstituteDisbursementData] =
    useState<IEducationAdminDashboardDisbursementTrendData | null>(null);

  const [instituteDisbursementYear, setInstituteDisbursementYear] =
    useState<number | null>(null);

  const [instituteCourseDisbursementView, setInstituteCourseDisbursementView] =
    useState<ITimeView>("monthly");

  const [instituteCourseDisbursementYear, setInstituteCourseDisbursementYear] =
    useState<number | null>(null);

  const [instituteCourseDisbursementMonth, setInstituteCourseDisbursementMonth] =
    useState<string | null>(null);

  const [institutePaymentHistoryView, setInstitutePaymentHistoryView] =
    useState<ITimeView>("monthly");

  const [institutePaymentHistoryYear, setInstitutePaymentHistoryYear] =
    useState<number | null>(null);

  const [institutePaymentHistoryMonth, setInstitutePaymentHistoryMonth] =
    useState<string | null>(null);

  const [loader, setLoader] = useState<boolean>(false);

  const [hoveredFunnelTooltip, setHoveredFunnelTooltip] =
    useState<IInstituteFunnelTooltip | null>(null);

  const navigate = useNavigate();

  const updateFunnelTooltipPosition = (
    event: MouseEvent<HTMLButtonElement>,
    step: IInstituteApplicationCard,
  ): void => {
    const funnelPanel = event.currentTarget.closest(".education-dashboard-funnel-panel");

    if (!(funnelPanel instanceof HTMLElement)) {
      return;
    }

    const bandRect = event.currentTarget.getBoundingClientRect();
    const panelRect = funnelPanel.getBoundingClientRect();

    setHoveredFunnelTooltip({
      left: bandRect.left - panelRect.left + (bandRect.width / 2),
      top: bandRect.top - panelRect.top - 14,
      step,
    });
  };

  const handleInstituteApplyCustomRange = (): void => {
    if (!instituteStartDate || !instituteEndDate) {
      toastError(validationMessages.selectStartEndDate);
      return;
    }

    if (instituteStartDate > instituteEndDate) {
      toastError(validationMessages.startDateCanNotGreaterThanEndDate);
      return;
    }

    fetchInstituteDashboardDetail({
      filterType: AdminDateFilterType.CUSTOM_DATE_RANGE,
      startDate: `${formatDate(instituteStartDate, "YYYY-MM-DD")}T00:00:00`,
      endDate: `${formatDate(instituteEndDate, "YYYY-MM-DD")}T23:59:59`,
      dashboardType: DashboardType.INSTITUTE,
    });
  };

  const handleInstituteDateFilterChange = (value: AdminDateFilterType): void => {
    setInstituteDateFilter(value);

    if (value !== AdminDateFilterType.CUSTOM_DATE_RANGE) {
      setInstituteStartDate(null);
      setInstituteEndDate(null);
    }
  };

  const fetchInstituteDashboardDetail = useCallback(
    async (overrideBody?: IAdminDashboardFilterBody): Promise<void> => {
      setLoader(true);

      const body = overrideBody || {
        filterType: instituteDateFilter,
        dashboardType: DashboardType.INSTITUTE
      };

      const response: IEducationAdminDashboardResponse = await getCommonDashboardForEducationAPI(body);

      if (response.statusCode === 200) {
        setInstituteInfo(response.data);
        setInstituteDisbursementData(response.data.disbursementTrendData);
      } else {
        toastError(response.message);
      }

      setLoader(false);
    },
    [instituteDateFilter],
  );

  const instituteDisbursementYearOptions = useMemo(
    () => {
      const currentYear = new Date().getFullYear();
      const options = [];

      if (instituteDisbursementData?.monthly?.prevYear) {
        options.push({
          label: String(currentYear - 1),
          value: currentYear - 1,
        });
      }

      if (instituteDisbursementData?.monthly?.currYear) {
        options.push({
          label: String(currentYear),
          value: currentYear,
        });
      }

      return options;
    },
    [instituteDisbursementData],
  );

  const instituteInstituteApplicationCards = useMemo<IInstituteApplicationCard[]>(
    () => {
      const statusColors = [
        "#0d8dc9",
        "#7C3AED",
        "#16A34A",
        "#EA580C",
        "#DB2777",
        "#0891B2",
      ];

      return (
        instituteInfo?.applicationOverview
          ?.slice()
          ?.sort((firstItem, secondItem) => firstItem.displayOrder - secondItem.displayOrder)
          ?.map((item, index) => ({
            title: item.displayName,
            count: item.noOfApplications,
            amount: item.amount,
            color: statusColors[index % statusColors.length],
            routeStatus: item.statusID,
          })) ?? []
      );
    },
    [instituteInfo],
  );

  const instituteApplicationFunnelSteps = useMemo(
    () => [...instituteInstituteApplicationCards].sort((secondStep, firstStep) => firstStep.count - secondStep.count),
    [instituteInstituteApplicationCards],
  );

  const instituteApplicationFunnelTotalCount = useMemo(
    () => instituteApplicationFunnelSteps.reduce((total, step) => total + step.count, 0),
    [instituteApplicationFunnelSteps],
  );

  const instituteDisbursementTrendConfig = useMemo<IInstituteDisbursementTrendConfig | undefined>(() => {
    if (instituteDisbursementView === "yearly") {
      return instituteDisbursementData?.yearly;
    }

    const selectedYear =
      instituteDisbursementYear ?? instituteDisbursementYearOptions?.[0]?.value;

    if (!selectedYear) {
      return instituteDisbursementData?.monthly?.currYear ?? instituteDisbursementData?.monthly?.prevYear;
    }

    const currentYear = new Date().getFullYear();

    if (selectedYear === currentYear) {
      return instituteDisbursementData?.monthly?.currYear;
    }

    if (selectedYear === currentYear - 1) {
      return instituteDisbursementData?.monthly?.prevYear;
    }

    return undefined;
  }, [instituteDisbursementData, instituteDisbursementView, instituteDisbursementYear, instituteDisbursementYearOptions]);

  const hasInstituteDisbursementTrendData = useMemo((): boolean => {
    if (!instituteDisbursementTrendConfig) {
      return false;
    }

    return (
      (instituteDisbursementTrendConfig.categories?.length ?? 0) > 0 &&
      ((instituteDisbursementTrendConfig.amountData || []).some((amount) => Number(amount) > 0) ||
        (instituteDisbursementTrendConfig.applicationCountData || []).some(
          (applicationCount) => Number(applicationCount) > 0,
        ))
    );
  }, [instituteDisbursementTrendConfig]);

  const instituteCourseDisbursementYearOptions = useMemo(
    () => getPeriodicYearOptions<IEducationAdminDashboardCourseWiseDisbursementItem[]>(
      instituteInfo?.courseWiseDisbursement,
    ),
    [instituteInfo],
  );

  const instituteCourseDisbursementMonthOptions = useMemo(
    () => getMonthOptions(
      instituteInfo?.courseWiseDisbursement?.monthly,
      instituteCourseDisbursementYear ?? (instituteCourseDisbursementYearOptions[0]?.value as number | undefined) ?? null,
    ),
    [instituteCourseDisbursementYear, instituteCourseDisbursementYearOptions, instituteInfo],
  );

  const instituteCourseDisbursementData = useMemo(() => {
    const courseWiseDisbursement = instituteInfo?.courseWiseDisbursement as IEducationAdminDashboardCourseWiseDisbursement | null | undefined;

    if (!courseWiseDisbursement) {
      return [];
    }

    if (instituteCourseDisbursementView === "yearly") {
      return getYearlyEntry(
        courseWiseDisbursement.yearly,
        instituteCourseDisbursementYear ?? (instituteCourseDisbursementYearOptions[0]?.value as number | undefined) ?? null,
      ) ?? [];
    }

    const monthlyRecord = getMonthlyRecordByYear(
      courseWiseDisbursement.monthly,
      instituteCourseDisbursementYear ?? (instituteCourseDisbursementYearOptions[0]?.value as number | undefined) ?? null,
    );

    const selectedMonth =
      instituteCourseDisbursementMonth ??
      (instituteCourseDisbursementMonthOptions[0]?.value as string | undefined) ??
      null;

    return selectedMonth ? monthlyRecord?.[selectedMonth] ?? [] : [];
  }, [
    instituteCourseDisbursementMonth,
    instituteCourseDisbursementMonthOptions,
    instituteCourseDisbursementView,
    instituteCourseDisbursementYear,
    instituteCourseDisbursementYearOptions,
    instituteInfo,
  ]);

  const hasInstituteCourseDisbursementData = useMemo(
    () => instituteCourseDisbursementData.length > 0,
    [instituteCourseDisbursementData],
  );

  const instituteCourseDisbursementChartData = useMemo(
    () =>
      instituteCourseDisbursementData.map((item) => ({
        name: item.courseName,
        y: Math.max(Number(item.totalLoans ?? 0), 0),
        totalLoans: Number(item.totalLoans ?? 0),
        totalDisbursedAmount: Number(item.totalDisbursedAmount ?? 0),
      })),
    [instituteCourseDisbursementData],
  );

  const institutePaymentHistoryYearOptions = useMemo(
    () => getPeriodicYearOptions<IEducationAdminDashboardPaymentHistoryCard[]>(
      instituteInfo?.paymentHistoryCards,
    ),
    [instituteInfo],
  );

  const institutePaymentHistoryMonthOptions = useMemo(
    () => getMonthOptions(
      instituteInfo?.paymentHistoryCards?.monthly,
      institutePaymentHistoryYear ?? (institutePaymentHistoryYearOptions[0]?.value as number | undefined) ?? null,
    ),
    [instituteInfo, institutePaymentHistoryYear, institutePaymentHistoryYearOptions],
  );

  const institutePaymentHistoryCards = useMemo<IEducationAdminDashboardPaymentHistoryCard[]>(() => {
    const paymentHistoryCards = instituteInfo?.paymentHistoryCards as IEducationAdminDashboardPaymentHistoryCards | null | undefined;

    if (!paymentHistoryCards) {
      return [];
    }

    if (institutePaymentHistoryView === "yearly") {
      return getYearlyEntry(
        paymentHistoryCards.yearly,
        institutePaymentHistoryYear ?? (institutePaymentHistoryYearOptions[0]?.value as number | undefined) ?? null,
      ) ?? [];
    }

    const monthlyRecord = getMonthlyRecordByYear(
      paymentHistoryCards.monthly,
      institutePaymentHistoryYear ?? (institutePaymentHistoryYearOptions[0]?.value as number | undefined) ?? null,
    );

    const selectedMonth =
      institutePaymentHistoryMonth ??
      (institutePaymentHistoryMonthOptions[0]?.value as string | undefined) ??
      null;

    return selectedMonth ? monthlyRecord?.[selectedMonth] ?? [] : [];
  }, [
    instituteInfo,
    institutePaymentHistoryMonth,
    institutePaymentHistoryMonthOptions,
    institutePaymentHistoryView,
    institutePaymentHistoryYear,
    institutePaymentHistoryYearOptions,
  ]);

  const institutePaymentHistoryTrend = useMemo(() => {
    const paymentHistoryTrend = instituteInfo?.paymentHistoryTrend as IEducationAdminDashboardPaymentHistoryTrend | null | undefined;

    if (!paymentHistoryTrend) {
      return undefined;
    }

    if (institutePaymentHistoryView === "yearly") {
      return paymentHistoryTrend.yearly;
    }

    const selectedYear =
      institutePaymentHistoryYear ?? (institutePaymentHistoryYearOptions[0]?.value as number | undefined) ?? null;

    const currentYear = new Date().getFullYear();

    if (selectedYear === currentYear && paymentHistoryTrend.monthly.currYear) {
      return paymentHistoryTrend.monthly.currYear;
    }

    if (selectedYear === currentYear - 1 && paymentHistoryTrend.monthly.prevYear) {
      return paymentHistoryTrend.monthly.prevYear;
    }

    return paymentHistoryTrend.monthly.currYear ?? paymentHistoryTrend.monthly.prevYear;
  }, [instituteInfo, institutePaymentHistoryView, institutePaymentHistoryYear, institutePaymentHistoryYearOptions]);

  const selectedInstitutePaymentHistoryTrend = useMemo(() => {
    return institutePaymentHistoryTrend as IEducationAdminDashboardPaymentHistoryTrendData | undefined;
  }, [institutePaymentHistoryTrend]);

  const hasInstitutePaymentHistoryData = useMemo(
    () =>
      institutePaymentHistoryCards.length > 0 ||
      (selectedInstitutePaymentHistoryTrend?.series?.length ?? 0) > 0,
    [institutePaymentHistoryCards, selectedInstitutePaymentHistoryTrend],
  );

  useEffect(() => {
    if (!instituteDisbursementYear && instituteDisbursementYearOptions.length > 0) {
      setInstituteDisbursementYear(instituteDisbursementYearOptions[0].value);
    }
  }, [instituteDisbursementYear, instituteDisbursementYearOptions]);

  useEffect(() => {
    if (!instituteCourseDisbursementYear && instituteCourseDisbursementYearOptions.length > 0) {
      setInstituteCourseDisbursementYear(instituteCourseDisbursementYearOptions[0].value as number);
    }
  }, [instituteCourseDisbursementYear, instituteCourseDisbursementYearOptions]);

  useEffect(() => {
    const availableMonths = instituteCourseDisbursementMonthOptions.map(
      (option) => option.value as string,
    );

    if (availableMonths.length === 0) {
      if (instituteCourseDisbursementMonth !== null) {
        setInstituteCourseDisbursementMonth(null);
      }
      return;
    }

    if (
      instituteCourseDisbursementMonth &&
      availableMonths.includes(instituteCourseDisbursementMonth)
    ) {
      return;
    }

    const nextMonth = getDefaultMonth(
      instituteInfo?.courseWiseDisbursement?.monthly,
      instituteCourseDisbursementYear,
    );

    if (nextMonth) {
      setInstituteCourseDisbursementMonth(nextMonth);
    }
  }, [
    instituteCourseDisbursementMonth,
    instituteCourseDisbursementMonthOptions,
    instituteCourseDisbursementYear,
    instituteInfo,
  ]);

  useEffect(() => {
    if (!institutePaymentHistoryYear && institutePaymentHistoryYearOptions.length > 0) {
      setInstitutePaymentHistoryYear(institutePaymentHistoryYearOptions[0].value as number);
    }
  }, [institutePaymentHistoryYear, institutePaymentHistoryYearOptions]);

  useEffect(() => {
    const availableMonths = institutePaymentHistoryMonthOptions.map(
      (option) => option.value as string,
    );

    if (availableMonths.length === 0) {
      if (institutePaymentHistoryMonth !== null) {
        setInstitutePaymentHistoryMonth(null);
      }
      return;
    }

    if (
      institutePaymentHistoryMonth &&
      availableMonths.includes(institutePaymentHistoryMonth)
    ) {
      return;
    }

    const nextMonth = getDefaultMonth(
      instituteInfo?.paymentHistoryCards?.monthly,
      institutePaymentHistoryYear,
    );

    if (nextMonth) {
      setInstitutePaymentHistoryMonth(nextMonth);
    }
  }, [
    instituteInfo,
    institutePaymentHistoryMonth,
    institutePaymentHistoryMonthOptions,
    institutePaymentHistoryYear,
  ]);

  useEffect(() => {
    if (instituteDateFilter === AdminDateFilterType.CUSTOM_DATE_RANGE) {
      return;
    }

    fetchInstituteDashboardDetail({
      filterType: instituteDateFilter,
      dashboardType: DashboardType.INSTITUTE,
    });
  }, [fetchInstituteDashboardDetail, instituteDateFilter]);

  return (
    <>
      <Loader isLoading={loader} />

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
              className={`btn ${filterItem.value === instituteDateFilter ? "btn-orange" : "btn-orange-line"}`}
              onClick={() => handleInstituteDateFilterChange(filterItem.value)}
            >
              {filterItem.label}
            </Button>
          ))}
        </div>

        {instituteDateFilter === AdminDateFilterType.CUSTOM_DATE_RANGE && (
          <div className="row g-3 mt-1">
            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
              <label className="form-label small fw-semibold">Start Date</label>
              <Calendar
                inputId="adminEducationDashboardStartDate"
                value={instituteStartDate}
                placeholder="From Date"
                readOnlyInput
                maxDate={instituteEndDate || new Date()}
                showButtonBar
                className="w-100"
                onChange={(e) => {
                  const selectedStartDate = e.value as Date | null;
                  const nextEndDate =
                    selectedStartDate &&
                      instituteEndDate &&
                      instituteEndDate < selectedStartDate
                      ? null
                      : instituteEndDate;

                  setInstituteStartDate(selectedStartDate);
                  setInstituteEndDate(nextEndDate);
                }}
              />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
              <label className="form-label small fw-semibold">End Date</label>
              <Calendar
                inputId="adminEducationDashboardEndDate"
                value={instituteEndDate}
                placeholder="To Date"
                readOnlyInput
                minDate={instituteStartDate || undefined}
                maxDate={new Date()}
                showButtonBar
                className="w-100"
                disabled={!instituteStartDate}
                onChange={(e) => setInstituteEndDate(e.value as Date | null)}
              />
            </div>
            <div className="col-lg-2 col-md-4 col-sm-6 col-12 d-flex align-items-end">
              <Button
                label="Apply"
                icon="bi bi-funnel"
                className="btn btn-orange gap-2"
                onClick={handleInstituteApplyCustomRange}
              />
            </div>
          </div>
        )}
      </section>

      {instituteInstituteApplicationCards.length > 0 &&
        <div className="col-12 mt-5">
          <div className="row g-4 align-items-stretch">
            <div className="col-xl-7 col-lg-7 col-12">
              <section className="admin-dashboard-panel h-100">
                <div className="admin-dashboard-section-head">
                  <div>
                    <TableTitle title="Application Overview" />
                    <p className="admin-dashboard-section-copy mb-0">
                      Amounts and counts by application status.
                    </p>
                  </div>
                </div>

                <div className="row g-4">
                  {instituteInstituteApplicationCards.map((card) => (
                    <div key={card.title} className="col-md-6 col-12">
                      <div
                        className="admin-dashboard-status-card h-100 education-dashboard-status-card"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `${RoutePathConstant.private.educationLoanApplications}?status=${card.routeStatus}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(
                              `${RoutePathConstant.private.educationLoanApplications}?status=${card.routeStatus}`,
                            );
                          }
                        }}
                      >
                        <div
                          className="admin-dashboard-status-card__glow"
                          style={{ backgroundColor: card.color }}
                        />
                        <div className="admin-dashboard-status-card__label">
                          {card.title}
                        </div>
                        <div className="admin-dashboard-status-card__value">
                          {card.count}
                        </div>
                        <div className="admin-dashboard-status-card__amount">
                          Amount: {formatCurrencyAmount(card.amount)}
                        </div>
                        <div className="education-dashboard-status-card__arrow">
                          <i className="bi bi-arrow-up-right" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="col-xl-5 col-lg-5 col-12">
              <section className="admin-dashboard-panel h-100">
                <div className="admin-dashboard-section-head">
                  <div>
                    <TableTitle title="Application Funnel" />
                    <p className="admin-dashboard-section-copy mb-0">
                      Share of applications by lifecycle stage.
                    </p>
                  </div>
                </div>

                <div className="education-dashboard-funnel-panel">
                  {hoveredFunnelTooltip && (
                    <div
                      className="education-dashboard-funnel-tooltip-floating"
                      style={{
                        left: hoveredFunnelTooltip.left,
                        top: hoveredFunnelTooltip.top,
                      }}
                    >
                      <div className="education-dashboard-funnel-band__tooltip-title">
                        {hoveredFunnelTooltip.step.title}
                      </div>
                      <div className="education-dashboard-funnel-band__tooltip-row">
                        <span className="education-dashboard-funnel-band__tooltip-dot" />
                        <span>{hoveredFunnelTooltip.step.count} applications</span>
                      </div>
                      <div className="education-dashboard-funnel-band__tooltip-amount">
                        {formatCurrencyAmount(hoveredFunnelTooltip.step.amount)}
                      </div>
                    </div>
                  )}

                  <div className="education-dashboard-funnel-triangle">
                    {instituteApplicationFunnelSteps.map((step, index) => {
                      const previousStepColor =
                        index > 0 ? instituteApplicationFunnelSteps[index - 1].color : "transparent";

                      return (
                        <button
                          key={step.title}
                          type="button"
                          className={`education-dashboard-funnel-band ${index > 0 ? "education-dashboard-funnel-band--stacked" : ""}`}
                          style={{
                            background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}CC 100%)`,
                            ["--funnel-previous-color" as string]: previousStepColor,
                          }}
                          onClick={() =>
                            navigate(
                              `${RoutePathConstant.private.educationLoanApplications}?status=${step.routeStatus}`,
                            )
                          }
                          onMouseEnter={(event) => updateFunnelTooltipPosition(event, step)}
                          onMouseMove={(event) => updateFunnelTooltipPosition(event, step)}
                          onMouseLeave={() => setHoveredFunnelTooltip(null)}
                        >
                          <div className="education-dashboard-funnel-band__value">
                            {step.count}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      }

      <div className="col-12 mt-4">
        <div className="row g-4 align-items-stretch">
          <div className="col-12">
            <section className="admin-dashboard-panel h-100">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Disbursement Trend" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Compare disbursement amount and application count against month or year.
                  </p>
                </div>

                <div className="admin-dashboard-filter-actions form-group">
                  {instituteDisbursementView === "monthly" &&
                    instituteDisbursementYearOptions.length > 0 && (
                      <Dropdown
                        value={instituteDisbursementYear}
                        options={instituteDisbursementYearOptions}
                        onChange={(event) =>
                          setInstituteDisbursementYear(event.value as number)
                        }
                        placeholder="Select Year"
                        className="admin-dashboard-filter-dropdown"
                      />
                    )}
                  <Button
                    className={`btn ${instituteDisbursementView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => setInstituteDisbursementView("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    className={`btn ${instituteDisbursementView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => setInstituteDisbursementView("yearly")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              {hasInstituteDisbursementTrendData && instituteDisbursementTrendConfig &&
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
                      text: instituteDisbursementTrendConfig.title,
                    },
                    xAxis: {
                      categories: instituteDisbursementTrendConfig.categories,
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
                        color: "#0d8dc9",
                        data: instituteDisbursementTrendConfig.amountData,
                        tooltip: {
                          valuePrefix: "\u20B9",
                        },
                      },
                      {
                        type: "column",
                        name: "No. of Applications",
                        yAxis: 1,
                        color: "#2563EB",
                        data: instituteDisbursementTrendConfig.applicationCountData,
                        tooltip: {
                          valueSuffix: " applications",
                        },
                      },
                    ],
                  }}
                />
              }

              {!hasInstituteDisbursementTrendData && (
                <p className="admin-dashboard-section-copy mb-0">
                  No disbursement trend data found for the selected date range.
                </p>
              )}
            </section>
          </div>

          <div className="col-12">
            <section className="admin-dashboard-panel h-100">
              <div className="admin-dashboard-section-head">
                <div>
                  <TableTitle title="Course Wise Disbursement" />
                  <p className="admin-dashboard-section-copy mb-0">
                    Share of total disbursement completed across institute courses.
                  </p>
                </div>

                <div className="admin-dashboard-filter-actions form-group">
                  {instituteCourseDisbursementYearOptions.length > 0 && (
                    <Dropdown
                      value={instituteCourseDisbursementYear}
                      options={instituteCourseDisbursementYearOptions}
                      onChange={(event) =>
                        setInstituteCourseDisbursementYear(event.value as number)
                      }
                      placeholder="Select Year"
                      className="admin-dashboard-filter-dropdown"
                    />
                  )}
                  {instituteCourseDisbursementView === "monthly" &&
                    instituteCourseDisbursementMonthOptions.length > 0 && (
                      <Dropdown
                        value={instituteCourseDisbursementMonth}
                        options={instituteCourseDisbursementMonthOptions}
                        onChange={(event) =>
                          setInstituteCourseDisbursementMonth(event.value as string)
                        }
                        placeholder="Select Month"
                        className="admin-dashboard-filter-dropdown"
                      />
                    )}
                  <Button
                    className={`btn ${instituteCourseDisbursementView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => setInstituteCourseDisbursementView("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    className={`btn ${instituteCourseDisbursementView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                    onClick={() => setInstituteCourseDisbursementView("yearly")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              {hasInstituteCourseDisbursementData ?
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
                        return `
                          <span style="color:${this.color}">\u25cf</span>
                          <b>${this.name}</b><br/>
                          Loans: ${Number(this.totalLoans).toLocaleString("en-IN")}<br/>
                          Disbursed Amount: \u20B9${Number(this.totalDisbursedAmount).toLocaleString("en-IN")}
                        `;
                      },
                    },
                    plotOptions: {
                      pie: {
                        innerSize: "52%",
                        dataLabels: {
                          enabled: true,
                          formatter: function (this: any): string {
                            return `<b>${this.point.name}</b><br/>${Number(this.point.y).toLocaleString("en-IN")} Loan${this.point.y === 1 ? "" : "s"}`;
                          }
                        },
                      },
                    },
                    series: [
                      {
                        type: "pie",
                        name: "Total Loans",
                        data: instituteCourseDisbursementChartData,
                      },
                    ],
                  }}
                /> :
                <p className="admin-dashboard-section-copy mb-0">
                  No course-wise disbursement data available.
                </p>
              }
            </section>
          </div>
        </div>
      </div>

      <div className="col-12 mt-4">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-head">
            <div>
              <TableTitle title="Payment History" />
              <p className="admin-dashboard-section-copy mb-0">
                Ongoing, delayed, and overdue repayment visibility with EMI trends.
              </p>
            </div>

            <div className="admin-dashboard-filter-actions form-group">
              {institutePaymentHistoryYearOptions.length > 0 && (
                <Dropdown
                  value={institutePaymentHistoryYear}
                  options={institutePaymentHistoryYearOptions}
                  onChange={(event) =>
                    setInstitutePaymentHistoryYear(event.value as number)
                  }
                  placeholder="Select Year"
                  className="admin-dashboard-filter-dropdown"
                />
              )}
              {institutePaymentHistoryView === "monthly" &&
                institutePaymentHistoryMonthOptions.length > 0 && (
                  <Dropdown
                    value={institutePaymentHistoryMonth}
                    options={institutePaymentHistoryMonthOptions}
                    onChange={(event) =>
                      setInstitutePaymentHistoryMonth(event.value as string)
                    }
                    placeholder="Select Month"
                    className="admin-dashboard-filter-dropdown"
                  />
                )}
              <Button
                className={`btn ${institutePaymentHistoryView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                onClick={() => setInstitutePaymentHistoryView("monthly")}
              >
                Monthly
              </Button>
              <Button
                className={`btn ${institutePaymentHistoryView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                onClick={() => setInstitutePaymentHistoryView("yearly")}
              >
                Yearly
              </Button>
            </div>
          </div>

          {hasInstitutePaymentHistoryData ? (
            <div className="row g-4 align-items-stretch">
              <div className="col-xl-5 col-lg-5 col-12">
                <div className="admin-dashboard-user-grid education-dashboard-user-grid">
                  {institutePaymentHistoryCards.map((card) => (
                    <div
                      key={card.title}
                      className="admin-dashboard-user-card"
                    >
                      <div
                        className="admin-dashboard-user-card__accent"
                        style={{ backgroundColor: card.color }}
                      />
                      <div className="admin-dashboard-user-card__count">
                        {card.loanCount}
                      </div>
                      <div className="admin-dashboard-user-card__name">
                        {card.title}
                      </div>
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
                {selectedInstitutePaymentHistoryTrend && (
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
                        categories: selectedInstitutePaymentHistoryTrend.categories,
                        lineColor: "#d8e1ec",
                      },
                      yAxis: {
                        title: {
                          text: selectedInstitutePaymentHistoryTrend.amountLabel,
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
                      series: selectedInstitutePaymentHistoryTrend.series.map((series) => ({
                        type: "line" as const,
                        name: series.name,
                        color: series.color,
                        data: series.data,
                      })),
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="admin-dashboard-section-copy mb-0">
              No payment history data for selected filters.
            </p>
          )}
        </section>
      </div>

    </>
  );
};

export default InstitueDashboard;

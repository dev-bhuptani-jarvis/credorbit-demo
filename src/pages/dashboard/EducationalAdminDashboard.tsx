import { type MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
    IEducationAdminDashboardData,
    IEducationAdminDashboardDisbursementTrendData,
    IEducationAdminDashboardInstituteWiseDisbursement,
    IEducationAdminDashboardInstituteWiseDisbursementItem,
    IEducationAdminDashboardPaymentHistoryCard,
    IEducationAdminDashboardPaymentHistoryCards,
    IEducationAdminDashboardPaymentHistorySeriesItem,
    IEducationAdminDashboardPaymentHistoryTrend,
    IEducationAdminDashboardPaymentHistoryTrendData,
    IEducationAdminDashboardResponse,
} from '../../interface/educationalAdminDashboard';
import Loader from '../../components/Loader';
import { getCommonDashboardForEducationAPI } from '../../utils/axios/apiServices';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';

type IEducationMatrixItem = {
    title: string;
    value: string | number;
    icon: string;
    subtitle: string;
    redirect?: () => void;
};

type IEducationDisbursementTrendConfig = IEducationAdminDashboardDisbursementTrendData["yearly"];

type ISharedTooltipPoint = Highcharts.Point & {
    color?: string;
    points?: Highcharts.Point[];
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

type IEducationFunnelTooltip = {
    left: number;
    top: number;
    step: {
        title: string;
        count: number;
        amount: number;
    };
};

const APPLICATION_OVERVIEW_COLORS = ["#0d8dc9", "#7C3AED", "#16A34A", "#EA580C", "#DB2777", "#0891B2"];

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

const EducationalAdminDashboard = () => {
    const [educationInfo, setEducationInfo] = useState<IEducationAdminDashboardData | null>(null);

    const [educationDateFilter, setEducationDateFilter] = useState<AdminDateFilterType>(AdminDateFilterType.ALL);

    const [educationStartDate, setEducationStartDate] = useState<Date | null>(null);

    const [educationEndDate, setEducationEndDate] = useState<Date | null>(null);

    const [educationDisbursementData, setEducationDisbursementData] = useState<IEducationAdminDashboardDisbursementTrendData | null>(null);

    const [educationDisbursementView, setEducationDisbursementView] = useState<ITimeView>("monthly");

    const [educationDisbursementYear, setEducationDisbursementYear] = useState<number | null>(null);

    const [educationInstituteDisbursementView, setEducationInstituteDisbursementView] = useState<ITimeView>("monthly");

    const [educationInstituteDisbursementYear, setEducationInstituteDisbursementYear] = useState<number | null>(null);

    const [educationInstituteDisbursementMonth, setEducationInstituteDisbursementMonth] = useState<string | null>(null);

    const [educationPaymentHistoryView, setEducationPaymentHistoryView] = useState<ITimeView>("monthly");

    const [educationPaymentHistoryYear, setEducationPaymentHistoryYear] = useState<number | null>(null);

    const [educationPaymentHistoryMonth, setEducationPaymentHistoryMonth] = useState<string | null>(null);

    const [loader, setLoader] = useState<boolean>(false);

    const [hoveredFunnelTooltip, setHoveredFunnelTooltip] =
        useState<IEducationFunnelTooltip | null>(null);

    const navigate = useNavigate();

    const updateFunnelTooltipPosition = (
        event: MouseEvent<HTMLButtonElement>,
        step: IEducationFunnelTooltip["step"],
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

    const handleEducationApplyCustomRange = (): void => {
        if (!educationStartDate || !educationEndDate) {
            toastError(validationMessages.selectStartEndDate);
            return;
        }

        if (educationStartDate > educationEndDate) {
            toastError(validationMessages.startDateCanNotGreaterThanEndDate);
            return;
        }

        fetchEducationDashboardDetail({
            filterType: AdminDateFilterType.CUSTOM_DATE_RANGE,
            startDate: `${formatDate(educationStartDate, "YYYY-MM-DD")}T00:00:00`,
            endDate: `${formatDate(educationEndDate, "YYYY-MM-DD")}T23:59:59`,
            dashboardType: DashboardType.EDUCATION_ADMIN,
        });
    };

    const handleEducationDateFilterChange = (value: AdminDateFilterType): void => {
        setEducationDateFilter(value);

        if (value !== AdminDateFilterType.CUSTOM_DATE_RANGE) {
            setEducationStartDate(null);
            setEducationEndDate(null);
        }
    };

    const fetchEducationDashboardDetail = useCallback(
        async (overrideBody?: IAdminDashboardFilterBody): Promise<void> => {
            setLoader(true);

            const body = overrideBody || {
                filterType: educationDateFilter,
                dashboardType: DashboardType.EDUCATION_ADMIN,
            };

            const response: IEducationAdminDashboardResponse = await getCommonDashboardForEducationAPI(body);

            if (response.statusCode === 200) {
                setEducationInfo(response.data);
                setEducationDisbursementData(response.data.disbursementTrendData);
            } else {
                toastError(response.message);
            }

            setLoader(false);
        },
        [educationDateFilter],
    );

    const educationDisbursementYearOptions = useMemo(() => {
        const options: { label: string; value: number }[] = [];
        const prevYear = educationDisbursementData?.monthly?.prevYear;
        const currYear = educationDisbursementData?.monthly?.currYear;

        if (prevYear) {
            options.push({
                label: prevYear.title.match(/\d{4}/)?.[0] ?? "Previous",
                value: Number(prevYear.title.match(/\d{4}/)?.[0]),
            });
        }

        if (currYear) {
            options.push({
                label: currYear.title.match(/\d{4}/)?.[0] ?? "Current",
                value: Number(currYear.title.match(/\d{4}/)?.[0]),
            });
        }

        return options;
    }, [educationDisbursementData]);

    const educationMatrix: IEducationMatrixItem[] = useMemo(() => ([
        {
            title: "Total Registered Educational Institutes",
            value: educationInfo?.totalRegisteredInstitutes ?? 0,
            icon: "bi-buildings",
            subtitle: "Colleges and universities onboarded across India",
            redirect: () => navigate(RoutePathConstant.private.educationManagedInstitute),
        },
        {
            title: "Total Registered Lenders",
            value: educationInfo?.totalRegisteredLenders ?? 0,
            icon: "bi-patch-check",
            subtitle: "Lender and banking partners connected to the portal",
            redirect: () => navigate(RoutePathConstant.private.educationManagedNbfc),
        },
        {
            title: "Total Registered Students",
            value: educationInfo?.totalStudentsEnrolled ?? 0,
            icon: "bi-mortarboard",
            subtitle: "Applicants currently active in the education journey",
        },
    ]), [educationInfo]);

    const educationApplicationOverview = useMemo(
        () => [...(educationInfo?.applicationOverview || [])].sort(
            (firstItem, secondItem) => firstItem.displayOrder - secondItem.displayOrder,
        ),
        [educationInfo?.applicationOverview],
    );

    const educationApplicationFunnel = useMemo(
        () => [...educationApplicationOverview].sort(
            (secondItem, firstItem) => firstItem.noOfApplications - secondItem.noOfApplications,
        ),
        [educationApplicationOverview],
    );

    const educationDisbursementTrendConfig = useMemo<IEducationDisbursementTrendConfig | undefined>(() => {
        if (educationDisbursementView === "yearly") {
            return educationDisbursementData?.yearly;
        }

        const monthly = educationDisbursementData?.monthly;

        if (!monthly) {
            return undefined;
        }

        const selectedYear =
            educationDisbursementYear ??
            Number(monthly.currYear?.title.match(/\d{4}/)?.[0]);

        const currentYear = Number(monthly.currYear?.title.match(/\d{4}/)?.[0]);
        const previousYear = Number(monthly.prevYear?.title.match(/\d{4}/)?.[0]);

        if (selectedYear === currentYear) {
            return monthly.currYear;
        }

        if (selectedYear === previousYear) {
            return monthly.prevYear;
        }

        return undefined;
    }, [educationDisbursementData, educationDisbursementView, educationDisbursementYear]);

    const hasDisbursementTrendData = useMemo((): boolean => {
        if (!educationDisbursementTrendConfig) {
            return false;
        }

        return (
            (educationDisbursementTrendConfig.categories?.length ?? 0) > 0 &&
            (educationDisbursementTrendConfig.amountData?.length ?? 0) > 0 &&
            (educationDisbursementTrendConfig.applicationCountData?.length ?? 0) > 0
        );
    }, [educationDisbursementTrendConfig]);

    const educationInstituteDisbursementYearOptions = useMemo(
        () => getPeriodicYearOptions<IEducationAdminDashboardInstituteWiseDisbursementItem[]>(
            educationInfo?.instituteWiseDisbursement,
        ),
        [educationInfo],
    );

    const educationInstituteDisbursementMonthOptions = useMemo(
        () => getMonthOptions(
            educationInfo?.instituteWiseDisbursement?.monthly,
            educationInstituteDisbursementYear ?? (educationInstituteDisbursementYearOptions[0]?.value as number | undefined) ?? null,
        ),
        [educationInfo, educationInstituteDisbursementYear, educationInstituteDisbursementYearOptions],
    );

    const educationInstituteWiseDisbursement = useMemo(() => {
        const instituteWiseDisbursement = educationInfo?.instituteWiseDisbursement as IEducationAdminDashboardInstituteWiseDisbursement | null | undefined;

        if (!instituteWiseDisbursement) {
            return [];
        }

        const selectedYear =
            educationInstituteDisbursementYear ??
            (educationInstituteDisbursementYearOptions[0]?.value as number | undefined) ??
            null;

        if (educationInstituteDisbursementView === "yearly") {
            return getYearlyEntry(instituteWiseDisbursement.yearly, selectedYear) ?? [];
        }

        const monthlyRecord = getMonthlyRecordByYear(instituteWiseDisbursement.monthly, selectedYear);
        const selectedMonth =
            educationInstituteDisbursementMonth ??
            (educationInstituteDisbursementMonthOptions[0]?.value as string | undefined) ??
            null;

        return selectedMonth ? monthlyRecord?.[selectedMonth] ?? [] : [];
    }, [
        educationInfo,
        educationInstituteDisbursementMonth,
        educationInstituteDisbursementMonthOptions,
        educationInstituteDisbursementView,
        educationInstituteDisbursementYear,
        educationInstituteDisbursementYearOptions,
    ]);

    const hasInstituteWiseDisbursement = useMemo(
        (): boolean => educationInstituteWiseDisbursement.some((item) => Number(item?.y ?? 0) > 0),
        [educationInstituteWiseDisbursement],
    );

    const educationPaymentHistoryYearOptions = useMemo(
        () => getPeriodicYearOptions<IEducationAdminDashboardPaymentHistoryCard[]>(
            educationInfo?.paymentHistoryCards,
        ),
        [educationInfo],
    );

    const educationPaymentHistoryMonthOptions = useMemo(
        () => getMonthOptions(
            educationInfo?.paymentHistoryCards?.monthly,
            educationPaymentHistoryYear ?? (educationPaymentHistoryYearOptions[0]?.value as number | undefined) ?? null,
        ),
        [educationInfo, educationPaymentHistoryYear, educationPaymentHistoryYearOptions],
    );

    const educationPaymentHistoryCards = useMemo(() => {
        const paymentHistoryCards = educationInfo?.paymentHistoryCards as IEducationAdminDashboardPaymentHistoryCards | null | undefined;

        if (!paymentHistoryCards) {
            return [];
        }

        const selectedYear =
            educationPaymentHistoryYear ??
            (educationPaymentHistoryYearOptions[0]?.value as number | undefined) ??
            null;

        if (educationPaymentHistoryView === "yearly") {
            return getYearlyEntry(paymentHistoryCards.yearly, selectedYear) ?? [];
        }

        const monthlyRecord = getMonthlyRecordByYear(paymentHistoryCards.monthly, selectedYear);
        const selectedMonth =
            educationPaymentHistoryMonth ??
            (educationPaymentHistoryMonthOptions[0]?.value as string | undefined) ??
            null;

        return selectedMonth ? monthlyRecord?.[selectedMonth] ?? [] : [];
    }, [
        educationInfo,
        educationPaymentHistoryMonth,
        educationPaymentHistoryMonthOptions,
        educationPaymentHistoryView,
        educationPaymentHistoryYear,
        educationPaymentHistoryYearOptions,
    ]);

    const educationPaymentHistoryTrend = useMemo(() => {
        const paymentHistoryTrend = educationInfo?.paymentHistoryTrend as IEducationAdminDashboardPaymentHistoryTrend | null | undefined;

        if (!paymentHistoryTrend) {
            return undefined;
        }

        const selectedYear =
            educationPaymentHistoryYear ??
            (educationPaymentHistoryYearOptions[0]?.value as number | undefined) ??
            null;

        if (educationPaymentHistoryView === "yearly") {
            return paymentHistoryTrend.yearly;
        }

        const currentYear = new Date().getFullYear();

        if (selectedYear === currentYear && paymentHistoryTrend.monthly.currYear) {
            return paymentHistoryTrend.monthly.currYear;
        }

        if (selectedYear === currentYear - 1 && paymentHistoryTrend.monthly.prevYear) {
            return paymentHistoryTrend.monthly.prevYear;
        }

        return paymentHistoryTrend.monthly.currYear ?? paymentHistoryTrend.monthly.prevYear;
    }, [educationInfo, educationPaymentHistoryView, educationPaymentHistoryYear, educationPaymentHistoryYearOptions]);

    const selectedEducationPaymentHistoryTrend = useMemo(
        () => educationPaymentHistoryTrend as IEducationAdminDashboardPaymentHistoryTrendData | undefined,
        [educationPaymentHistoryTrend],
    );

    const hasEducationPaymentHistoryData = useMemo(
        () =>
            educationPaymentHistoryCards.length > 0 ||
            (selectedEducationPaymentHistoryTrend?.series?.length ?? 0) > 0,
        [educationPaymentHistoryCards, selectedEducationPaymentHistoryTrend],
    );

    useEffect(() => {
        if (!educationDisbursementYear && educationDisbursementYearOptions.length > 0) {
            setEducationDisbursementYear(educationDisbursementYearOptions[0].value);
        }
    }, [educationDisbursementYear, educationDisbursementYearOptions]);

    useEffect(() => {
        if (!educationInstituteDisbursementYear && educationInstituteDisbursementYearOptions.length > 0) {
            setEducationInstituteDisbursementYear(educationInstituteDisbursementYearOptions[0].value as number);
        }
    }, [educationInstituteDisbursementYear, educationInstituteDisbursementYearOptions]);

    useEffect(() => {
        const availableMonths = educationInstituteDisbursementMonthOptions.map(
            (option) => option.value as string,
        );

        if (availableMonths.length === 0) {
            if (educationInstituteDisbursementMonth !== null) {
                setEducationInstituteDisbursementMonth(null);
            }
            return;
        }

        if (
            educationInstituteDisbursementMonth &&
            availableMonths.includes(educationInstituteDisbursementMonth)
        ) {
            return;
        }

        const nextMonth = getDefaultMonth(
            educationInfo?.instituteWiseDisbursement?.monthly,
            educationInstituteDisbursementYear,
        );

        if (nextMonth) {
            setEducationInstituteDisbursementMonth(nextMonth);
        }
    }, [
        educationInfo,
        educationInstituteDisbursementMonth,
        educationInstituteDisbursementMonthOptions,
        educationInstituteDisbursementYear,
    ]);

    useEffect(() => {
        if (!educationPaymentHistoryYear && educationPaymentHistoryYearOptions.length > 0) {
            setEducationPaymentHistoryYear(educationPaymentHistoryYearOptions[0].value as number);
        }
    }, [educationPaymentHistoryYear, educationPaymentHistoryYearOptions]);

    useEffect(() => {
        const availableMonths = educationPaymentHistoryMonthOptions.map(
            (option) => option.value as string,
        );

        if (availableMonths.length === 0) {
            if (educationPaymentHistoryMonth !== null) {
                setEducationPaymentHistoryMonth(null);
            }
            return;
        }

        if (
            educationPaymentHistoryMonth &&
            availableMonths.includes(educationPaymentHistoryMonth)
        ) {
            return;
        }

        const nextMonth = getDefaultMonth(
            educationInfo?.paymentHistoryCards?.monthly,
            educationPaymentHistoryYear,
        );

        if (nextMonth) {
            setEducationPaymentHistoryMonth(nextMonth);
        }
    }, [
        educationInfo,
        educationPaymentHistoryMonth,
        educationPaymentHistoryMonthOptions,
        educationPaymentHistoryYear,
    ]);

    useEffect(() => {
        if (educationDateFilter === AdminDateFilterType.CUSTOM_DATE_RANGE) {
            return;
        }

        fetchEducationDashboardDetail({
            filterType: educationDateFilter,
            dashboardType: DashboardType.EDUCATION_ADMIN,
        });
    }, [educationDateFilter, fetchEducationDashboardDetail]);

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

            <section className="admin-dashboard-metrics-grid admin-dashboard-metrics-grid--education mt-5">
                {educationMatrix.map((metric: IEducationMatrixItem) => (
                    <div key={metric.title} className={`admin-dashboard-metric-card ${metric.redirect ? 'cursor-pointer' : ''}`} onClick={() => metric.redirect && metric.redirect()}>
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

            {educationApplicationOverview.length > 0 && (
                <section className="row g-4 mt-1 align-items-stretch">
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
                                {educationApplicationOverview.map((applicationStatus, index) => (
                                    <div key={applicationStatus.statusID} className="col-md-6 col-12">
                                        <div
                                            className="admin-dashboard-status-card h-100 education-dashboard-status-card"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => navigate(`${RoutePathConstant.private.educationLoanApplications}?status=${applicationStatus.statusID}`)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    navigate(`${RoutePathConstant.private.educationLoanApplications}?status=${applicationStatus.statusID}`);
                                                }
                                            }}
                                        >
                                            <div
                                                className="admin-dashboard-status-card__glow"
                                                style={{ backgroundColor: APPLICATION_OVERVIEW_COLORS[index % APPLICATION_OVERVIEW_COLORS.length] }}
                                            />
                                            <div className="admin-dashboard-status-card__label">{applicationStatus.displayName}</div>
                                            <div className="admin-dashboard-status-card__value">{applicationStatus.noOfApplications}</div>
                                            <div className="admin-dashboard-status-card__amount">
                                                Amount: {formatCurrencyAmount(applicationStatus.amount)}
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
                                        Application stages ordered by count.
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
                                    {educationApplicationFunnel.map((applicationStatus, index) => {
                                        const color = APPLICATION_OVERVIEW_COLORS[index % APPLICATION_OVERVIEW_COLORS.length];
                                        const previousColor = index > 0
                                            ? APPLICATION_OVERVIEW_COLORS[(index - 1) % APPLICATION_OVERVIEW_COLORS.length]
                                            : "transparent";
                                        const funnelStep = {
                                            title: applicationStatus.displayName,
                                            count: applicationStatus.noOfApplications,
                                            amount: applicationStatus.amount,
                                        };

                                        return (
                                            <button
                                                key={applicationStatus.statusID}
                                                type="button"
                                                className={`education-dashboard-funnel-band ${index > 0 ? "education-dashboard-funnel-band--stacked" : ""}`}
                                                style={{
                                                    background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                                                    ["--funnel-previous-color" as string]: previousColor,
                                                }}
                                                onClick={() => navigate(`${RoutePathConstant.private.educationLoanApplications}?status=${applicationStatus.statusID}`)}
                                                onMouseEnter={(event) => updateFunnelTooltipPosition(event, funnelStep)}
                                                onMouseMove={(event) => updateFunnelTooltipPosition(event, funnelStep)}
                                                onMouseLeave={() => setHoveredFunnelTooltip(null)}
                                            >
                                                <div className="education-dashboard-funnel-band__value">
                                                    {applicationStatus.noOfApplications}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            )}

            <section className="row g-4 mt-1">
                <div className="col-12">
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
                                            onChange={(event) => setEducationDisbursementYear(event.value)}
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

                        {loader ? (
                            <p className="admin-dashboard-section-copy mb-0">
                                Loading disbursement trend...
                            </p>
                        ) : hasDisbursementTrendData && educationDisbursementTrendConfig ? (
                            <HighchartsReact
                                key={`${educationDisbursementView}-${educationDisbursementYear}`}
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
                                                formatter: function (this: Highcharts.AxisLabelsFormatterContextObject): string {
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
                                No disbursement trend data for selected filters.
                            </p>
                        )}
                    </section>
                </div>

                <div className="col-12">
                    <section className="admin-dashboard-panel h-100">
                        <div className="admin-dashboard-section-head">
                            <div>
                                <TableTitle title="Institute Wise Disbursement" />
                                <p className="admin-dashboard-section-copy mb-0">
                                    Share of total disbursement completed across all institutes.
                                </p>
                            </div>

                            <div className="admin-dashboard-filter-actions form-group">
                                {educationInstituteDisbursementYearOptions.length > 0 && (
                                    <Dropdown
                                        value={educationInstituteDisbursementYear}
                                        options={educationInstituteDisbursementYearOptions}
                                        onChange={(event) => setEducationInstituteDisbursementYear(event.value as number)}
                                        placeholder="Select Year"
                                        className="admin-dashboard-filter-dropdown"
                                    />
                                )}
                                {educationInstituteDisbursementView === "monthly" &&
                                    educationInstituteDisbursementMonthOptions.length > 0 && (
                                        <Dropdown
                                            value={educationInstituteDisbursementMonth}
                                            options={educationInstituteDisbursementMonthOptions}
                                            onChange={(event) => setEducationInstituteDisbursementMonth(event.value as string)}
                                            placeholder="Select Month"
                                            className="admin-dashboard-filter-dropdown"
                                        />
                                    )}
                                <Button
                                    className={`btn ${educationInstituteDisbursementView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                                    onClick={() => setEducationInstituteDisbursementView("monthly")}
                                >
                                    Monthly
                                </Button>
                                <Button
                                    className={`btn ${educationInstituteDisbursementView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                                    onClick={() => setEducationInstituteDisbursementView("yearly")}
                                >
                                    Yearly
                                </Button>
                            </div>
                        </div>

                        {loader ? (
                            <p className="admin-dashboard-section-copy mb-0">
                                Loading institute disbursement...
                            </p>
                        ) : hasInstituteWiseDisbursement ? (
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
                                        pointFormatter: function (this: Highcharts.Point): string {
                                            return `<span style="color:${this.color}">\u25cf</span> <b>${this.name}</b>: \u20B9${Number(this.y).toLocaleString("en-IN")}`;
                                        },
                                    },
                                    plotOptions: {
                                        pie: {
                                            innerSize: "52%",
                                            dataLabels: {
                                                enabled: true,
                                                formatter: function (this: Highcharts.Point & { point: Highcharts.Point }): string {
                                                    return `<b>${this.point.name}</b><br/>\u20B9${Number(this.point.y).toLocaleString("en-IN")}`;
                                                },
                                            },
                                        },
                                    },
                                    series: [
                                        {
                                            type: "pie",
                                            name: "Disbursement Amount",
                                            data: educationInstituteWiseDisbursement,
                                        },
                                    ],
                                }}
                            />
                        ) : (
                            <p className="admin-dashboard-section-copy mb-0">
                                No institute-wise disbursement data for selected filters.
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

                    <div className="admin-dashboard-filter-actions form-group">
                        {educationPaymentHistoryYearOptions.length > 0 && (
                            <Dropdown
                                value={educationPaymentHistoryYear}
                                options={educationPaymentHistoryYearOptions}
                                onChange={(event) => setEducationPaymentHistoryYear(event.value as number)}
                                placeholder="Select Year"
                                className="admin-dashboard-filter-dropdown"
                            />
                        )}
                        {educationPaymentHistoryView === "monthly" &&
                            educationPaymentHistoryMonthOptions.length > 0 && (
                                <Dropdown
                                    value={educationPaymentHistoryMonth}
                                    options={educationPaymentHistoryMonthOptions}
                                    onChange={(event) => setEducationPaymentHistoryMonth(event.value as string)}
                                    placeholder="Select Month"
                                    className="admin-dashboard-filter-dropdown"
                                />
                            )}
                        <Button
                            className={`btn ${educationPaymentHistoryView === "monthly" ? "btn-orange" : "btn-orange-line"}`}
                            onClick={() => setEducationPaymentHistoryView("monthly")}
                        >
                            Monthly
                        </Button>
                        <Button
                            className={`btn ${educationPaymentHistoryView === "yearly" ? "btn-orange" : "btn-orange-line"}`}
                            onClick={() => setEducationPaymentHistoryView("yearly")}
                        >
                            Yearly
                        </Button>
                    </div>
                </div>

                {hasEducationPaymentHistoryData ? (
                    <div className="row g-4 align-items-stretch">
                        <div className="col-12 col-lg-5">
                            <div className="admin-dashboard-user-grid education-dashboard-user-grid">
                                {educationPaymentHistoryCards.map((card: IEducationAdminDashboardPaymentHistoryCard) => (
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

                        <div className="col-12 col-lg-7">
                            {selectedEducationPaymentHistoryTrend && (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={{
                                        chart: {
                                            type: "line",
                                            height: null,
                                            backgroundColor: "transparent",
                                        },
                                        credits: {
                                            enabled: false,
                                        },
                                        title: {
                                            text: "Payment History Trend",
                                        },
                                        xAxis: {
                                            categories: selectedEducationPaymentHistoryTrend.categories,
                                            lineColor: "#d8e1ec",
                                        },
                                        yAxis: {
                                            title: {
                                                text: selectedEducationPaymentHistoryTrend.amountLabel,
                                            },
                                            labels: {
                                                formatter: function (this: Highcharts.AxisLabelsFormatterContextObject): string {
                                                    return `\u20B9${Number(this.value).toLocaleString("en-IN")}`;
                                                },
                                            },
                                        },
                                        tooltip: {
                                            shared: true,
                                            useHTML: true,
                                            outside: false,
                                            style: {
                                                fontSize: "12px",
                                            },
                                            formatter: function (this: ISharedTooltipPoint): string {
                                                const rows = (this.points ?? [])
                                                    .map(
                                                        (point: Highcharts.Point) =>
                                                            `<div style="display:flex;justify-content:space-between;gap:16px;"><span style="color:${point.color}">${point.series.name}</span><b>\u20B9${Number(point.y).toLocaleString("en-IN")}</b></div>`,
                                                    )
                                                    .join("");

                                                return `<div><div style="font-weight:700;margin-bottom:8px;">${String(this.category ?? "")}</div>${rows}</div>`;
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
                                                    formatter: function (this: Highcharts.Point): string {
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
                                        series: selectedEducationPaymentHistoryTrend.series.map((series: IEducationAdminDashboardPaymentHistorySeriesItem) => ({
                                            type: "line" as const,
                                            name: series.name,
                                            color: series.color,
                                            data: series.data,
                                        })),
                                        responsive: {
                                            rules: [
                                                {
                                                    condition: {
                                                        maxWidth: 768,
                                                    },
                                                    chartOptions: {
                                                        chart: {
                                                            height: 300,
                                                        },
                                                        legend: {
                                                            layout: "horizontal",
                                                            align: "center",
                                                            verticalAlign: "bottom",
                                                        },
                                                        plotOptions: {
                                                            line: {
                                                                dataLabels: {
                                                                    enabled: false,
                                                                },
                                                            },
                                                        },
                                                        xAxis: {
                                                            labels: {
                                                                style: {
                                                                    fontSize: "10px",
                                                                },
                                                            },
                                                        },
                                                        yAxis: {
                                                            labels: {
                                                                style: {
                                                                    fontSize: "10px",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                {
                                                    condition: {
                                                        maxWidth: 480,
                                                    },
                                                    chartOptions: {
                                                        chart: {
                                                            height: 250,
                                                        },
                                                        title: {
                                                            style: {
                                                                fontSize: "14px",
                                                            },
                                                        },
                                                        legend: {
                                                            itemStyle: {
                                                                fontSize: "10px",
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
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
        </>
    );
};

export default EducationalAdminDashboard;

import { Dropdown, DropdownFilterEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrencyAmount } from "../../../utils/constants/constant";
import { validationMessages } from "../../../utils/constants/messages";
import {
    AMOUNT_UP_TO_12_DIGITS_PATTERN,
    DISCOUNT_PERCENT_PATTERN,
} from "../../../utils/constants/pattern";
import {
    IEducationCourseManagementData,
    IEducationCourseManagementFilterReq,
    IEducationCourseManagementResponse,
} from "../../../interface/courseManagement";
import { getAllGetEducationalInstituteCoursesAPI } from "../../../utils/axios/apiServices";
import Loader from "../../../components/Loader";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { CourseType } from "../../../utils/constants/enum";
import { IStudent } from "../../../interface/student";
import { formatCourseTenure } from "../../../utils/functions/shared";

export interface ICourseSelectionPayload {
    clientID: string;
    courseID: string;
    noOfEMIs: number;
    noOfAdvanceEMI: number | null;
    discountPercentage: number | null;
    discountAmount: number | null;
    downpaymentAmount: number | null;
    financedAmount: number;
    emiAmount: number | null;
    loanTypeID: number;
    courseFees: number;
    loanApplicationID?: string;
}

export interface ICourseSelectionInitialValues {
    courseID: string;
    courseName: string;
    courseFees: number;
    courseTenure: number;
    noOfEMIs: number;
    noOfAdvanceEMI: number;
    discountAmount: number;
    downpaymentAmount: number;
}

interface ICourseSelectionProps {
    selectedStudent: IStudent | null;
    onValidationChange?: (isValid: boolean) => void;
    onSelectionChange?: (payload: ICourseSelectionPayload | null) => void;
    initialValues?: ICourseSelectionInitialValues | null;
    isCourseLocked?: boolean;
    showValidationErrors?: boolean;
}

const parseAmount = (value: string | number | null | undefined): number => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    return (
        Number(
            String(value || "")
                .replace(/,/g, "")
                .replace(/[^\d.]/g, ""),
        ) || 0
    );
};

const DISCOUNT_PERCENTAGE_MAX_LENGTH = 6;

const AMOUNT_MAX_LENGTH = 15;

// Keeps the raw value typed by the user while allowing a maximum of 2 decimal places.
const sanitizeNumericInput = (value: string, maxLength: number): string => {
    const sanitizedValue = value
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "");

    // Allow only the first decimal point
    const [integerPart, ...decimalParts] = sanitizedValue.split(".");
    
    const decimalPart = decimalParts.join("").slice(0, 2);

    const result = decimalParts.length > 0
        ? `${integerPart}.${decimalPart}`
        : integerPart;

    return result.slice(0, maxLength);
};

// Used on blur: a trailing decimal point ("2.") is an incomplete entry, not a value.
const finalizeNumericInput = (value: string, maxLength: number): string =>
    sanitizeNumericInput(value, maxLength).replace(/\.$/, "");

// Converts a stored number into a plain input value without any digit grouping.
const toInputValue = (value: string | number): string => {
    const numericValue = parseAmount(value);
    return numericValue ? String(Number(numericValue.toFixed(2))) : "";
};

// Empty values are optional; an incomplete entry such as "2." is still being typed.
const getNumericFieldError = (
    value: string,
    pattern: RegExp,
    message: string,
): string => {
    if (!value || value.endsWith(".")) {
        return "";
    }

    return pattern.test(value) ? "" : message;
};

const COURSE_PAGE_SIZE = 10;

const CourseSelection = ({
    onValidationChange,
    onSelectionChange,
    selectedStudent,
    initialValues,
    isCourseLocked = false,
    showValidationErrors = false,
}: ICourseSelectionProps) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const [courseOptions, setCourseOptions] = useState<any[]>([]);

    const [selectedCourse, setSelectedCourse] =
        useState<IEducationCourseManagementData>();

    const [selectedCourseTenure, setSelectedCourseTenure] = useState<string>("");

    const [emiOptionMonths, setEmiOptionMonths] = useState<number>(0);

    const [advancedEmiMonths, setAdvancedEmiMonths] = useState<number | null>(
        null,
    );

    const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

    const [discountPercentage, setDiscountPercentage] = useState<string>("");

    const [discountAmount, setDiscountAmount] = useState<string>("");

    const [downpayment, setDownpayment] = useState<string>("");

    const { userID } = useSelector((state: RootState) => state.user.user);

    const hasLoadedInitialValues = useRef(false);

    const courseDropdownRef = useRef<Dropdown>(null);

    const courseSearchRef = useRef("");

    const coursePageRef = useRef(0);

    const hasMoreCoursesRef = useRef(true);

    const isFetchingCoursesRef = useRef(false);

    const courseSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const courseScrollContainerRef = useRef<HTMLElement | null>(null);

    const courseScrollHandlerRef = useRef<((event: Event) => void) | null>(null);

    const fetchCourses = async (reset = false): Promise<void> => {
        if (
            !userID ||
            isFetchingCoursesRef.current ||
            (!reset && !hasMoreCoursesRef.current)
        ) {
            return;
        }

        const page = reset ? 1 : coursePageRef.current + 1;
        isFetchingCoursesRef.current = true;
        setLoading(true);

        const queryParams: IEducationCourseManagementFilterReq = {
            instituteId: userID,
            page,
            pageSize: COURSE_PAGE_SIZE,
        };

        if (courseSearchRef.current) {
            queryParams.courseName = courseSearchRef.current;
        }

        try {
            const response: IEducationCourseManagementResponse =
                await getAllGetEducationalInstituteCoursesAPI(queryParams);

            if (response?.statusCode === 200) {
                const nextCourses = response.data?.courseList || [];
                const totalCount = response.data?.totalCount || 0;

                setCourseOptions((previousCourses) => {
                    const courses = reset
                        ? nextCourses
                        : [...previousCourses, ...nextCourses];
                    return Array.from(
                        new Map(courses.map((course) => [course.id, course])).values(),
                    );
                });

                coursePageRef.current = page;
                hasMoreCoursesRef.current = page * COURSE_PAGE_SIZE < totalCount;
            }
        } finally {
            isFetchingCoursesRef.current = false;
            setLoading(false);
        }
    };

    const detachCourseScrollListener = (): void => {
        if (courseScrollContainerRef.current && courseScrollHandlerRef.current) {
            courseScrollContainerRef.current.removeEventListener(
                "scroll",
                courseScrollHandlerRef.current,
            );
        }

        courseScrollContainerRef.current = null;
        courseScrollHandlerRef.current = null;
    };

    const attachCourseScrollListener = (): void => {
        detachCourseScrollListener();

        const overlay = courseDropdownRef.current?.getOverlay();
        const scrollContainer = overlay?.querySelector(
            ".p-dropdown-items-wrapper",
        ) as HTMLElement | null;

        if (!scrollContainer) {
            return;
        }

        const handleScroll = (): void => {
            const isAtBottom =
                scrollContainer.scrollTop + scrollContainer.clientHeight >=
                scrollContainer.scrollHeight - 8;

            if (isAtBottom) {
                fetchCourses();
            }
        };

        courseScrollContainerRef.current = scrollContainer;
        courseScrollHandlerRef.current = handleScroll;
        scrollContainer.addEventListener("scroll", handleScroll);
    };

    // Keeps the amount in sync while the entered percentage is still a valid value.
    const syncDiscountAmountFromPercentage = (percentageValue: string): void => {
        const fee: number = selectedCourse?.courseFees || 0;

        if (!percentageValue) {
            setDiscountAmount("");
            return;
        }

        if (!fee || !DISCOUNT_PERCENT_PATTERN.test(percentageValue)) {
            return;
        }

        const amount = (fee * Number(percentageValue)) / 100;

        setDiscountAmount(amount ? toInputValue(amount) : "");
    };

    // Keeps the percentage in sync while the entered amount is still a valid value.
    const syncDiscountPercentageFromAmount = (amountValue: string): void => {
        const fee: number = selectedCourse?.courseFees || 0;

        if (!amountValue) {
            setDiscountPercentage("");
            return;
        }

        if (!fee || !AMOUNT_UP_TO_12_DIGITS_PATTERN.test(amountValue)) {
            return;
        }

        const amount = Math.min(parseAmount(amountValue), fee);
        const percentage = (amount / fee) * 100;

        setDiscountPercentage(
            percentage ? Number(percentage.toFixed(2)).toString() : "",
        );
    };

    const handleDiscountPercentageChange = (rawValue: string): void => {
        const value = sanitizeNumericInput(
            rawValue,
            DISCOUNT_PERCENTAGE_MAX_LENGTH,
        );

        setDiscountPercentage(value);

        if (value.endsWith(".")) {
            return;
        }

        syncDiscountAmountFromPercentage(value);
    };

    const handleDiscountPercentageBlur = (): void => {
        const value = finalizeNumericInput(
            discountPercentage,
            DISCOUNT_PERCENTAGE_MAX_LENGTH,
        );

        setDiscountPercentage(value);
        syncDiscountAmountFromPercentage(value);
    };

    const handleDiscountAmountChange = (rawValue: string): void => {
        const value = sanitizeNumericInput(rawValue, AMOUNT_MAX_LENGTH);

        setDiscountAmount(value);

        if (value.endsWith(".")) {
            return;
        }

        syncDiscountPercentageFromAmount(value);
    };

    const handleDiscountAmountBlur = (): void => {
        const value = finalizeNumericInput(discountAmount, AMOUNT_MAX_LENGTH);

        setDiscountAmount(value);
        syncDiscountPercentageFromAmount(value);
    };

    const handleDownpaymentChange = (rawValue: string): void => {
        setDownpayment(sanitizeNumericInput(rawValue, AMOUNT_MAX_LENGTH));
    };

    const handleDownpaymentBlur = (): void => {
        setDownpayment(finalizeNumericInput(downpayment, AMOUNT_MAX_LENGTH));
    };

    const handleCourseChange = (courseId: string): void => {
        setSelectedCourseId(courseId);

        const selectedCourseData =
            courseOptions.find((course) => course.id === courseId) || null;

        setSelectedCourse(selectedCourseData);

        const totalMonths = Number(selectedCourseData?.courseTenure || 0);

        setSelectedCourseTenure(
            selectedCourseData?.courseTenure ? formatCourseTenure(totalMonths) : "",
        );

        setEmiOptionMonths(0);
        setAdvancedEmiMonths(null);
        setDiscountPercentage("");
        setDiscountAmount("");
        setDownpayment("");
        setReviewErrors({});
    };

    const emiOptions = useMemo(() => {
        const totalMonths = Number(selectedCourse?.courseTenure || 0);

        return Array.from({ length: totalMonths }, (_, index) => ({
            label: `${index + 1} Month${index === 0 ? "" : "s"}`,
            value: index + 1,
        }));
    }, [selectedCourse?.courseTenure]);

    const advancedEmiOptions = useMemo(() => {
        if (!emiOptionMonths) {
            return [];
        }

        return Array.from({ length: emiOptionMonths }, (_, index) => ({
            label: `${index} Month${index === 0 ? "" : "s"}`,
            value: index,
        })).slice(0, emiOptionMonths);
    }, [emiOptionMonths]);

    const selectableCourseOptions = useMemo(() => {
        if (
            !initialValues ||
            courseOptions.some((course) => course.id === initialValues.courseID)
        ) {
            return courseOptions;
        }

        return [
            {
                id: initialValues.courseID,
                courseName: initialValues.courseName,
                courseFees: initialValues.courseFees,
                courseTenure: initialValues.courseTenure,
            },
            ...courseOptions,
        ];
    }, [courseOptions, initialValues]);

    const summary = useMemo(() => {
        const agreedFee = selectedCourse?.courseFees || 0;
        const appliedDiscountAmount = Math.min(
            parseAmount(discountAmount),
            agreedFee,
        );
        const discountedCourseFee = Math.max(agreedFee - appliedDiscountAmount, 0);
        const appliedDownpayment = Math.min(
            parseAmount(downpayment),
            discountedCourseFee,
        );
        const loanAmount = Math.max(discountedCourseFee - appliedDownpayment, 0);

        const advanceMonths = advancedEmiMonths || 0;
        const totalMonths = emiOptionMonths || 0;
        const numberOfEmis = Math.max(totalMonths - advanceMonths, 0);

        // Amount for one EMI
        const perEmiAmount = totalMonths > 0 ? loanAmount / totalMonths : 0;

        // Total advance EMI amount
        const advanceEmi = perEmiAmount * advanceMonths;

        // Amount for each remaining EMI after advance EMIs are paid
        const emiAmount = numberOfEmis > 0 ? perEmiAmount : 0;

        return {
            agreedFee,
            discountAmount: appliedDiscountAmount,
            discountedCourseFee,
            downpayment: appliedDownpayment,
            loanAmount,
            advanceEmi,
            numberOfEmis,
            emiAmount,
        };
    }, [
        advancedEmiMonths,
        discountAmount,
        downpayment,
        emiOptionMonths,
        selectedCourse?.courseFees,
    ]);

    useEffect(() => {
        courseSearchRef.current = "";
        coursePageRef.current = 0;
        hasMoreCoursesRef.current = true;
        setCourseOptions([]);
        fetchCourses(true);
    }, [userID]);

    useEffect(
        () => () => {
            if (courseSearchTimeoutRef.current) {
                clearTimeout(courseSearchTimeoutRef.current);
            }
            detachCourseScrollListener();
        },
        [],
    );

    useEffect(() => {
        if (!initialValues || hasLoadedInitialValues.current) return;

        const initialCourse = courseOptions.find(
            (course) => course.id === initialValues.courseID,
        ) || {
            id: initialValues.courseID,
            courseName: initialValues.courseName,
            courseFees: initialValues.courseFees,
            courseTenure: initialValues.courseTenure,
        };

        setSelectedCourseId(initialValues.courseID);
        setSelectedCourse(initialCourse);
        setSelectedCourseTenure(formatCourseTenure(initialValues.courseTenure));
        setEmiOptionMonths(initialValues.noOfEMIs);
        setAdvancedEmiMonths(initialValues.noOfAdvanceEMI);
        setDiscountAmount(toInputValue(initialValues.discountAmount));
        setDiscountPercentage(
            initialValues.courseFees && initialValues.discountAmount
                ? Number(
                    Math.min(
                        (initialValues.discountAmount / initialValues.courseFees) * 100,
                        100,
                    ).toFixed(2),
                ).toString()
                : "",
        );
        setDownpayment(toInputValue(initialValues.downpaymentAmount));
        hasLoadedInitialValues.current = true;
    }, [courseOptions, initialValues]);

    const discountPercentageError = useMemo(
        () =>
            getNumericFieldError(
                discountPercentage,
                DISCOUNT_PERCENT_PATTERN,
                validationMessages.discountPercentInvalid,
            ),
        [discountPercentage],
    );

    const discountAmountError = useMemo(
        () =>
            getNumericFieldError(
                discountAmount,
                AMOUNT_UP_TO_12_DIGITS_PATTERN,
                validationMessages.discountAmountInvalid,
            ),
        [discountAmount],
    );

    const downpaymentError = useMemo(
        () =>
            getNumericFieldError(
                downpayment,
                AMOUNT_UP_TO_12_DIGITS_PATTERN,
                validationMessages.downPaymentInvalid,
            ),
        [downpayment],
    );

    const isLoanStructureValid =
        !discountPercentageError && !discountAmountError && !downpaymentError;

    const courseError = showValidationErrors && !selectedCourseId
        ? "Please select course"
        : "";

    const emiOptionError = showValidationErrors && !emiOptionMonths
        ? "Please select EMI option"
        : "";

    useEffect(() => {
        onValidationChange?.(
            !!selectedCourseId && emiOptionMonths > 0 && isLoanStructureValid,
        );
    }, [
        emiOptionMonths,
        isLoanStructureValid,
        onValidationChange,
        selectedCourseId,
    ]);

    useEffect(() => {
        if (!selectedCourseId || !emiOptionMonths || !selectedStudent) {
            onSelectionChange?.(null);
            return;
        }

        onSelectionChange?.({
            courseID: selectedCourseId,
            noOfEMIs: emiOptionMonths,
            noOfAdvanceEMI: advancedEmiMonths ?? 0,
            discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
            discountAmount: discountAmount ? parseAmount(discountAmount) : 0,
            downpaymentAmount: downpayment ? parseAmount(downpayment) : 0,
            financedAmount: summary.loanAmount,
            emiAmount: emiOptionMonths > 0 ? Number(summary.emiAmount.toFixed(2)) : 0,
            loanTypeID: 14,
            clientID: selectedStudent?.id,
            courseFees: selectedCourse?.courseFees || 0,
        });
    }, [
        advancedEmiMonths,
        discountAmount,
        discountPercentage,
        downpayment,
        emiOptionMonths,
        onSelectionChange,
        selectedCourseId,
        summary.emiAmount,
        summary.loanAmount,
    ]);

    return (
        <>
            <Loader isLoading={loading} />

            <div className="row g-4">
                <div className="col-12">
                    <div className="borderBoxHldr p-24 h-100">
                        <div className="mb-4">
                            <h4 className="mb-1">Select Course</h4>
                            <p className="mb-0 text-muted">
                                Match the application to the right course configuration and fee
                                structure.
                            </p>
                        </div>

                        <div className="form-group col-lg-6 col-12 px-0">
                            <label className="form-label">
                                Course<sup>*</sup>
                            </label>
                            <Dropdown
                                ref={courseDropdownRef}
                                className="w-100"
                                value={selectedCourseId}
                                options={selectableCourseOptions}
                                optionLabel="courseName"
                                optionValue="id"
                                onChange={(event) => handleCourseChange(event.value)}
                                placeholder="Select course"
                                filter
                                filterBy="courseName"
                                filterDelay={0}
                                onFilter={(event: DropdownFilterEvent) => {
                                    const searchText = event.filter.trim();

                                    if (searchText === courseSearchRef.current) {
                                        return;
                                    }

                                    courseSearchRef.current = searchText;
                                    coursePageRef.current = 0;
                                    hasMoreCoursesRef.current = true;
                                    setCourseOptions([]);

                                    if (courseSearchTimeoutRef.current) {
                                        clearTimeout(courseSearchTimeoutRef.current);
                                    }

                                    courseSearchTimeoutRef.current = setTimeout(() => {
                                        fetchCourses(true);
                                    }, 300);
                                }}
                                onShow={attachCourseScrollListener}
                                onHide={detachCourseScrollListener}
                                disabled={isCourseLocked}
                                aria-invalid={!!courseError}
                            />
                            {courseError ? <small className="error">{courseError}</small> : null}
                        </div>
                    </div>
                </div>

                {selectedCourse && (
                    <div className="col-12">
                        <div className="borderBoxHldr p-24 h-100">
                            <div className="row g-4 align-items-stretch">
                                <div className="col-lg-4 col-12 d-flex flex-column">
                                    <h4 className="mb-3">Course Information</h4>

                                    <div
                                        className="p-20"
                                        style={{
                                            border: "1px solid #f1d4c8",
                                            borderRadius: "20px",
                                            background:
                                                "linear-gradient(135deg, rgba(255, 99, 44, 0.08), rgba(255, 247, 242, 0.95))",
                                            padding: "14px",
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    >
                                        <div className="mb-3">
                                            <small className="text-muted d-block mb-1">
                                                Course Name
                                            </small>
                                            <b>{selectedCourse.courseName}</b>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block mb-1">
                                                Course Tenure
                                            </small>
                                            <b>
                                                {selectedCourse.courseTenure
                                                    ? formatCourseTenure(selectedCourse.courseTenure)
                                                    : "-"}
                                            </b>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block mb-1">
                                                Course Type
                                            </small>
                                            <b>
                                                {selectedCourse.courseType === CourseType.ONLINE
                                                    ? "Online"
                                                    : selectedCourse.courseType === CourseType.OFFLINE
                                                        ? "Offline"
                                                        : ""}
                                            </b>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block mb-1">
                                                Course Fees
                                            </small>
                                            <b>{formatCurrencyAmount(selectedCourse.courseFees)}</b>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block mb-1">
                                                Job Guaranteed
                                            </small>
                                            <b>{selectedCourse.isItJobGuaranteed ? "Yes" : "No"}</b>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-12">
                                    <h4 className="mb-3">Configure Loan Structure</h4>

                                    <div className="row g-3">
                                        <div className="form-group col-12">
                                            <label className="form-label">
                                                Course Tenure<sup>*</sup>
                                            </label>
                                            <InputText
                                                className="form-control w-100"
                                                value={selectedCourseTenure}
                                                disabled
                                                placeholder="Select course tenure"
                                            />
                                        </div>

                                        <div className="form-group col-12">
                                            <label className="form-label">
                                                EMI Options<sup>*</sup>
                                            </label>
                                            <Dropdown
                                                className="w-100"
                                                value={emiOptionMonths}
                                                options={emiOptions}
                                                onChange={(event) => {
                                                    setEmiOptionMonths(event.value);
                                                    setAdvancedEmiMonths(null);
                                                    setReviewErrors((previous) => ({
                                                        ...previous,
                                                        emiOptionMonths: "",
                                                    }));
                                                }}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Select EMI option"
                                                aria-invalid={!!emiOptionError}
                                            />
                                            {(emiOptionError || reviewErrors.emiOptionMonths) && (
                                                <small className="error">
                                                    {emiOptionError || reviewErrors.emiOptionMonths}
                                                </small>
                                            )}
                                        </div>

                                        <div className="form-group col-12">
                                            <label className="form-label">Advanced EMI Options</label>
                                            <Dropdown
                                                className="w-100"
                                                value={advancedEmiMonths}
                                                options={advancedEmiOptions}
                                                onChange={(event) => {
                                                    setAdvancedEmiMonths(event.value);
                                                    setReviewErrors((previous) => ({
                                                        ...previous,
                                                        advancedEmiMonths: "",
                                                    }));
                                                }}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Select Advanced EMI Option"
                                                showClear
                                            />
                                        </div>

                                        <div className="form-group col-md-6 col-12">
                                            <label
                                                className="form-label"
                                                htmlFor="discountPercentage"
                                            >
                                                Discount (%)
                                            </label>
                                            <InputText
                                                id="discountPercentage"
                                                className="form-control"
                                                value={discountPercentage}
                                                placeholder="Enter discount %"
                                                maxLength={DISCOUNT_PERCENTAGE_MAX_LENGTH}
                                                onChange={(event) =>
                                                    handleDiscountPercentageChange(event.target.value)
                                                }
                                                onBlur={handleDiscountPercentageBlur}
                                            />
                                            {discountPercentageError ? (
                                                <small className="error">
                                                    {discountPercentageError}
                                                </small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-md-6 col-12">
                                            <label className="form-label" htmlFor="discountAmount">
                                                Discount in Amount
                                            </label>
                                            <InputText
                                                id="discountAmount"
                                                className="form-control"
                                                value={discountAmount}
                                                placeholder="Enter discount amount"
                                                maxLength={AMOUNT_MAX_LENGTH}
                                                onChange={(event) =>
                                                    handleDiscountAmountChange(event.target.value)
                                                }
                                                onBlur={handleDiscountAmountBlur}
                                            />
                                            {discountAmountError ? (
                                                <small className="error">{discountAmountError}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-12">
                                            <label className="form-label" htmlFor="downpayment">
                                                Down payment (Optional)
                                            </label>
                                            <InputText
                                                id="downpayment"
                                                className="form-control"
                                                value={downpayment}
                                                placeholder="Enter down payment"
                                                maxLength={AMOUNT_MAX_LENGTH}
                                                onChange={(event) =>
                                                    handleDownpaymentChange(event.target.value)
                                                }
                                                onBlur={handleDownpaymentBlur}
                                            />
                                            {downpaymentError ? (
                                                <small className="error">{downpaymentError}</small>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-4 col-12 d-flex flex-column">
                                    <h4 className="mb-3">Loan Summary</h4>

                                    <div
                                        className="table-responsive flex-grow-1"
                                        style={{
                                            border: "1px solid #f1d4c8",
                                            borderRadius: "18px",
                                            overflow: "hidden",
                                            padding: "10px",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <table className="table mb-0 align-middle">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-semibold">Agreed Fee</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(selectedCourse?.courseFees)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Discount</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.discountAmount)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Net Agreed Fee</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.discountedCourseFee)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Down Payment</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.downpayment)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Total Loan Amount</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.loanAmount)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">EMI Plan</td>
                                                    <td className="text-end">{emiOptionMonths || 0}</td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Advanced EMI</td>
                                                    <td className="text-end">{advancedEmiMonths ?? 0}</td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Advance EMI Amount</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.advanceEmi)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">Remaining EMIs</td>
                                                    <td className="text-end">{summary.numberOfEmis}</td>
                                                </tr>

                                                <tr>
                                                    <td className="fw-semibold">EMI Amount</td>
                                                    <td className="text-end">
                                                        {formatCurrencyAmount(summary.emiAmount)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CourseSelection;

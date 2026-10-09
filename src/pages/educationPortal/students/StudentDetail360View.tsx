import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import {
  IGetStudentLoanDetailResponseData,
  ILoanDocument,
  IPaymentSchedule,
  ILoanTimelineJourney,
  IStudent
} from "../../../interface/student";
import {
  getStudentLoanDetailAPI,
  isProceedForCamReportForEducationalInstituteAPI,
} from "../../../utils/axios/apiServices";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  RouteParams,
} from "../../../utils/constants/constant";
import { formatCourseTenure, formatDate, toastError, toastInfo } from "../../../utils/functions/shared";
import { LoanStatus, LoanStatusType, LoanTimeLineSteps, PaymentStatus } from "../../../utils/constants/enum";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { decryptVAPTData } from "../../../utils/functions/encryptDecrypt";
import { Dialog } from "primereact/dialog";
import {
  IIsProceedForCamReportEntity,
  IIsProceedForReportEntity,
} from "../../../interface/wallet";

type StudentDetail360LocationState = {
  selectedDraftId?: string;
  loanApplicationId?: string;
  studentID?: string;
  studentName?: string;
  selectedStudent?: IStudent | null;
};

const defaultStudentLoanDetail: IGetStudentLoanDetailResponseData = {
  loanApplicationID: "",
  isLoanMarketPlaceGenerated: false,
  isBankingReportRequired: false,
  isCreditReportRequired: false,
  isCreditReportFetched: false,
  isBankingReportFetched: false,
  showRepaymentSection: false,
  showForeClosure: false,
  showOverdueAmount: false,
  queryRaisedComment: null,
  studentDetail: {
    studentID: "",
    name: "",
    photo: "",
    loanApplicationCode: "",
    creditScore: null,
    lastFetchedCreditScore: null,
  },
  courseDetail: {
    courseId: "",
    courseName: "",
    instituteName: "",
    instituteTradeName: "",
    courseAgreedFee: 0,
    tenure: 0,
  },
  loanDetail: {
    nbfcBankName: "",
    currentStatusId: 0,
    currentStatus: "",
    processingFee: null,
    eNachStatus: false,
    sanctionedDate: null,
    disbursementDate: null,
    lstLoanTimelineJourney: [],
  },
  loanPaymentDetails: {
    loanAmount: 0,
    downPayment: 0,
    advancePayment: 0,
    discountAmount: 0,
    totalEMI: 0,
    emiAmount: 0,
    advanceEMI: 0,
    paidEMI: 0,
    pendingEMI: 0,
    lastEMIPaidDate: null,
    emiMaturityDate: null,
    lstPaymentSchedule: null,
  },
  loanDocuments: [],
};

const StudentDetail360View = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams<RouteParams>();

  const { message } = useSelector(
    (state: RootState) => state.reportMessage,
  );

  const { userType } = useSelector((state: RootState) => state.user.user);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const locationState = (location.state || {}) as StudentDetail360LocationState;

  const [loading, setLoading] = useState<boolean>(false);

  const [camReportDetails, setCamReportDetails] = useState<IIsProceedForReportEntity[]>([]);

  const [cAMReportPopUp, setCAMReportPopUp] = useState<boolean>(false);

  const [studentLoanDetail, setStudentLoanDetail] =
    useState<IGetStudentLoanDetailResponseData>(defaultStudentLoanDetail);

  const loanApplicationID =
    locationState.selectedDraftId || locationState.loanApplicationId || "";

  const studentID = locationState.studentID || id || "";

  const defaultStudentDetail = defaultStudentLoanDetail.studentDetail ?? {
    studentID: "",
    name: "",
    photo: "",
    loanApplicationCode: "",
    creditScore: null,
    lastFetchedCreditScore: null,
  };

  const defaultCourseDetail = defaultStudentLoanDetail.courseDetail ?? {
    courseId: "",
    courseName: "",
    instituteName: "",
    courseAgreedFee: 0,
    tenure: 0,
    instituteTradeName: ""
  };

  const defaultLoanDetail = defaultStudentLoanDetail.loanDetail ?? {
    nbfcBankName: "",
    currentStatusId: 0,
    currentStatus: "",
    processingFee: null,
    eNachStatus: false,
    sanctionedDate: null,
    disbursementDate: null,
    lstLoanTimelineJourney: [],
  };

  const defaultLoanPaymentDetails = defaultStudentLoanDetail.loanPaymentDetails ?? {
    loanAmount: 0,
    downPayment: 0,
    advancePayment: 0,
    discountAmount: 0,
    totalEMI: 0,
    emiAmount: 0,
    advanceEMI: 0,
    paidEMI: 0,
    pendingEMI: 0,
    lastEMIPaidDate: null,
    emiMaturityDate: null,
    lstPaymentSchedule: [],
  };

  const studentDetail: NonNullable<IGetStudentLoanDetailResponseData["studentDetail"]> =
  {
    studentID:
      studentLoanDetail.studentDetail?.studentID ??
      defaultStudentDetail.studentID,
    name:
      studentLoanDetail.studentDetail?.name ??
      defaultStudentDetail.name,
    photo:
      studentLoanDetail.studentDetail?.photo ??
      defaultStudentDetail.photo,
    loanApplicationCode:
      studentLoanDetail.studentDetail?.loanApplicationCode ??
      defaultStudentDetail.loanApplicationCode,
    creditScore:
      studentLoanDetail.studentDetail?.creditScore ??
      defaultStudentDetail.creditScore,
    lastFetchedCreditScore:
      studentLoanDetail.studentDetail?.lastFetchedCreditScore ??
      defaultStudentDetail.lastFetchedCreditScore,
  };

  const courseDetail: NonNullable<IGetStudentLoanDetailResponseData["courseDetail"]> =
  {
    courseId:
      studentLoanDetail.courseDetail?.courseId ??
      defaultCourseDetail.courseId,
    courseName:
      studentLoanDetail.courseDetail?.courseName ??
      defaultCourseDetail.courseName,
    instituteName:
      studentLoanDetail.courseDetail?.instituteName ??
      defaultCourseDetail.instituteName,
    courseAgreedFee:
      studentLoanDetail.courseDetail?.courseAgreedFee ??
      defaultCourseDetail.courseAgreedFee,
    tenure:
      studentLoanDetail.courseDetail?.tenure ??
      defaultCourseDetail.tenure,
    instituteTradeName:
      studentLoanDetail.courseDetail?.instituteTradeName ??
      defaultCourseDetail.instituteTradeName,
  };

  const loanDetail: NonNullable<IGetStudentLoanDetailResponseData["loanDetail"]> =
  {
    nbfcBankName:
      studentLoanDetail.loanDetail?.nbfcBankName ??
      defaultLoanDetail.nbfcBankName,
    currentStatusId:
      studentLoanDetail.loanDetail?.currentStatusId ??
      defaultLoanDetail.currentStatusId,
    currentStatus:
      studentLoanDetail.loanDetail?.currentStatus ??
      defaultLoanDetail.currentStatus,
    processingFee:
      studentLoanDetail.loanDetail?.processingFee ??
      defaultLoanDetail.processingFee,
    eNachStatus:
      studentLoanDetail.loanDetail?.eNachStatus ??
      defaultLoanDetail.eNachStatus,
    sanctionedDate:
      studentLoanDetail.loanDetail?.sanctionedDate ??
      defaultLoanDetail.sanctionedDate,
    disbursementDate:
      studentLoanDetail.loanDetail?.disbursementDate ??
      defaultLoanDetail.disbursementDate,
    lstLoanTimelineJourney:
      studentLoanDetail.loanDetail?.lstLoanTimelineJourney || [],
  };

  const loanPaymentDetails: NonNullable<
    IGetStudentLoanDetailResponseData["loanPaymentDetails"]
  > = useMemo(
    () => ({
      loanAmount:
        studentLoanDetail.loanPaymentDetails?.loanAmount ??
        defaultLoanPaymentDetails.loanAmount,

      downPayment:
        studentLoanDetail.loanPaymentDetails?.downPayment ??
        defaultLoanPaymentDetails.downPayment,

      advancePayment:
        studentLoanDetail.loanPaymentDetails?.advancePayment ??
        defaultLoanPaymentDetails.advancePayment,

      discountAmount:
        studentLoanDetail.loanPaymentDetails?.discountAmount ??
        defaultLoanPaymentDetails.discountAmount,

      totalEMI:
        studentLoanDetail.loanPaymentDetails?.totalEMI ??
        defaultLoanPaymentDetails.totalEMI,

      emiAmount:
        studentLoanDetail.loanPaymentDetails?.emiAmount ??
        defaultLoanPaymentDetails.emiAmount,

      advanceEMI:
        studentLoanDetail.loanPaymentDetails?.advanceEMI ??
        defaultLoanPaymentDetails.advanceEMI,

      paidEMI:
        studentLoanDetail.loanPaymentDetails?.paidEMI ??
        defaultLoanPaymentDetails.paidEMI,

      pendingEMI:
        studentLoanDetail.loanPaymentDetails?.pendingEMI ??
        defaultLoanPaymentDetails.pendingEMI,

      lastEMIPaidDate:
        studentLoanDetail.loanPaymentDetails?.lastEMIPaidDate ??
        defaultLoanPaymentDetails.lastEMIPaidDate,

      emiMaturityDate:
        studentLoanDetail.loanPaymentDetails?.emiMaturityDate ??
        defaultLoanPaymentDetails.emiMaturityDate,

      lstPaymentSchedule:
        studentLoanDetail.loanPaymentDetails?.lstPaymentSchedule || [],
    }),
    [
      studentLoanDetail.loanPaymentDetails,
      defaultLoanPaymentDetails,
    ]
  );

  const timeline = useMemo<ILoanTimelineJourney[]>(
    () => {
      const timelineJourney = loanDetail.lstLoanTimelineJourney || [];
      const currentStatusId = Number(loanDetail.currentStatusId || 0);

      if (currentStatusId === LoanStatus.Rejected) {
        return timelineJourney
          .filter((item) => Number(item.statusId) === LoanStatus.Rejected)
          .map((item) => ({
            ...item,
            isCompleted: true,
          }));
      }

      const hasCompletedStatus = timelineJourney.some(
        (item) => Number(item.statusId) === LoanStatus.Completed,
      );

      if (hasCompletedStatus) {
        return timelineJourney.filter((item) => Number(item.statusId) !== LoanStatus.Rejected);
      }

      return timelineJourney;
    },
    [
      loanDetail.currentStatusId,
      loanDetail.lstLoanTimelineJourney,
    ],
  );

  const documentList = useMemo<ILoanDocument[]>(
    () => studentLoanDetail.loanDocuments || [],
    [studentLoanDetail.loanDocuments],
  );

  const studentInitials = useMemo(() => {
    const name = studentDetail.name?.trim();

    if (!name) {
      return "ST";
    }

    const parts = name.split(/\s+/).filter(Boolean);

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [studentDetail.name]);

  const paymentSchedule = useMemo<IPaymentSchedule[]>(
    () => loanPaymentDetails.lstPaymentSchedule || [],
    [loanPaymentDetails.lstPaymentSchedule],
  );

  const nextPendingPayment = useMemo<IPaymentSchedule | null>(
    () =>
      paymentSchedule.find((item) => Number(item.status) !== PaymentStatus.PAID) || null,
    [paymentSchedule],
  );

  const lastCompletedPayment = useMemo<IPaymentSchedule | null>(() => {
    const completedPayments = paymentSchedule.filter(
      (item) => Number(item.status) === PaymentStatus.PAID,
    );

    if (!completedPayments.length) {
      return null;
    }

    return completedPayments[completedPayments.length - 1];
  }, [paymentSchedule]);

  const outstandingAmount = useMemo(() => {
    const { loanAmount, paidEMI, emiAmount } = loanPaymentDetails;

    if (!loanAmount) {
      return 0;
    }

    const remainingAmount = loanAmount - paidEMI * emiAmount;

    return remainingAmount > 0 ? remainingAmount : 0;
  }, [loanPaymentDetails]);

  const fetchStudentLoanDetail = async (): Promise<void> => {
    if (!studentID) {
      toastError("Student ID is missing");
      navigate(RoutePathConstant.private.educationManageStudents);
      return;
    }

    if (!loanApplicationID) {
      toastError("Loan application ID is missing");
      navigate(`${RoutePathConstant.private.educationStudentDetail}/${id}`);
      return;
    }

    setLoading(true);

    const response = await getStudentLoanDetailAPI({
      loanApplicationID,
    });

    if (response?.statusCode === 200 && response.data) {
      setStudentLoanDetail({
        ...defaultStudentLoanDetail,
        ...response.data,
        studentDetail: {
          studentID:
            response.data.studentDetail?.studentID ??
            defaultStudentDetail.studentID,
          name:
            response.data.studentDetail?.name ??
            defaultStudentDetail.name,
          photo:
            response.data.studentDetail?.photo ??
            defaultStudentDetail.photo,
          loanApplicationCode:
            response.data.studentDetail?.loanApplicationCode ??
            defaultStudentDetail.loanApplicationCode,
          creditScore:
            response.data.studentDetail?.creditScore ??
            defaultStudentDetail.creditScore,
          lastFetchedCreditScore:
            response.data.studentDetail?.lastFetchedCreditScore ??
            defaultStudentDetail.lastFetchedCreditScore,
        },
        courseDetail: {
          courseId:
            response.data.courseDetail?.courseId ??
            defaultCourseDetail.courseId,
          courseName:
            response.data.courseDetail?.courseName ??
            defaultCourseDetail.courseName,
          instituteName:
            response.data.courseDetail?.instituteName ??
            defaultCourseDetail.instituteName,
          courseAgreedFee:
            response.data.courseDetail?.courseAgreedFee ??
            defaultCourseDetail.courseAgreedFee,
          tenure:
            response.data.courseDetail?.tenure ??
            defaultCourseDetail.tenure,
          instituteTradeName:
            response.data.courseDetail?.instituteTradeName ??
            defaultCourseDetail.instituteTradeName,
        },
        loanDetail: {
          nbfcBankName:
            response.data.loanDetail?.nbfcBankName ??
            defaultLoanDetail.nbfcBankName,
          currentStatusId:
            response.data.loanDetail?.currentStatusId ??
            defaultLoanDetail.currentStatusId,
          currentStatus:
            response.data.loanDetail?.currentStatus ??
            defaultLoanDetail.currentStatus,
          processingFee:
            response.data.loanDetail?.processingFee ??
            defaultLoanDetail.processingFee,
          eNachStatus:
            response.data.loanDetail?.eNachStatus ??
            defaultLoanDetail.eNachStatus,
          sanctionedDate:
            response.data.loanDetail?.sanctionedDate ??
            defaultLoanDetail.sanctionedDate,
          disbursementDate:
            response.data.loanDetail?.disbursementDate ??
            defaultLoanDetail.disbursementDate,
          lstLoanTimelineJourney:
            response.data.loanDetail?.lstLoanTimelineJourney || [],
        },
        loanPaymentDetails: {
          loanAmount:
            response.data.loanPaymentDetails?.loanAmount ??
            defaultLoanPaymentDetails.loanAmount,
          downPayment:
            response.data.loanPaymentDetails?.downPayment ??
            defaultLoanPaymentDetails.downPayment,
          advancePayment:
            response.data.loanPaymentDetails?.advancePayment ??
            defaultLoanPaymentDetails.advancePayment,
          discountAmount:
            response.data.loanPaymentDetails?.discountAmount ??
            defaultLoanPaymentDetails.discountAmount,
          totalEMI:
            response.data.loanPaymentDetails?.totalEMI ??
            defaultLoanPaymentDetails.totalEMI,
          emiAmount:
            response.data.loanPaymentDetails?.emiAmount ??
            defaultLoanPaymentDetails.emiAmount,
          advanceEMI:
            response.data.loanPaymentDetails?.advanceEMI ??
            defaultLoanPaymentDetails.advanceEMI,
          paidEMI:
            response.data.loanPaymentDetails?.paidEMI ??
            defaultLoanPaymentDetails.paidEMI,
          pendingEMI:
            response.data.loanPaymentDetails?.pendingEMI ??
            defaultLoanPaymentDetails.pendingEMI,
          lastEMIPaidDate:
            response.data.loanPaymentDetails?.lastEMIPaidDate ??
            defaultLoanPaymentDetails.lastEMIPaidDate,
          emiMaturityDate:
            response.data.loanPaymentDetails?.emiMaturityDate ??
            defaultLoanPaymentDetails.emiMaturityDate,
          lstPaymentSchedule:
            response.data.loanPaymentDetails?.lstPaymentSchedule || [],
        },
        loanDocuments: response.data.loanDocuments || [],
      });
    } else {
      toastError(response?.message);
      navigate(`${RoutePathConstant.private.educationStudentDetail}/${studentID}`);
    }
    setLoading(false);
  };

  const canEditLoanApplication =
    !isImpersonate &&
    userType !== CLIENT_ROLE.SUPER_ADMIN &&
    [LoanStatusType.PENDING, LoanStatusType.QUERY_RAISED].includes(Number(loanDetail.currentStatusId));

  const handleEditLoanApplication = (): void => {
    navigate(RoutePathConstant.private.educationStudentLoanApplication, {
      state: {
        selectedStudent: locationState.selectedStudent || {
          id: studentID,
          fullName: studentDetail.name,
          panNumber: "",
          email: "",
          phoneNumber: "",
          gender: 0,
          dob: "",
          aadhaar: "",
          code: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        activeIndex: 1,
        isEditingLoan: true,
        loanApplicationId: loanApplicationID,
        studentID,
        returnTo: `${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`,
      },
    });
  };

  const formatDisplayDate = (value?: string | null): string => {
    if (!value) {
      return "-";
    }

    return formatDate(value, "DD MMM, YYYY");
  };

  const formatDisplayAmount = (value?: number | null): string => {
    if (value === null || value === undefined) {
      return "-";
    }

    return formatCurrencyAmount(Number(value || 0));
  };

  const renderDetailCard = (label: string, value: string): JSX.Element => (
    <div className="student-360-view__metric-card">
      <span className="student-360-view__metric-label">{label}</span>
      <strong className="student-360-view__metric-value">{value || "-"}</strong>
    </div>
  );

  const openDocument = (filePath?: string): void => {
    if (!filePath) {
      toastError("Document path is not available.");
      return;
    }

    window.open(filePath, "_blank", "noopener,noreferrer");
  };

  const handleComingSoon = (): void => {
    toastInfo("Coming Soon");
  };

  const handleTimelineClick = useCallback(
    (statusId: number): void => {
      if (!loanApplicationID || !studentID) {
        toastError("Loan application context is missing");
        return;
      }

      if (loanDetail.currentStatusId !== statusId) {
        return;
      }

      if (statusId === LoanTimeLineSteps.CREDIT_REPORT) {
        if (!studentLoanDetail.isCreditReportRequired) {
          return;
        }

        navigate(RoutePathConstant.private.educationStudentConsentVerification, {
          state: {
            loanApplicationId: loanApplicationID,
            studentID,
            studentName:
              locationState.studentName || studentDetail.name || "",
            selectedStudent: locationState.selectedStudent || null,
          },
        });
        return;
      }

      if (statusId === LoanTimeLineSteps.BANKING_REPORT) {
        if (!studentLoanDetail.isBankingReportRequired) {
          return;
        }

        navigate(RoutePathConstant.private.educationStudentBankDetails, {
          state: {
            isEducationPortal: true,
            loanApplicationId: loanApplicationID,
            studentID,
            studentName:
              locationState.studentName || studentDetail.name || "",
            selectedStudent: locationState.selectedStudent || null,
            isBankingReportRequired: studentLoanDetail.isBankingReportRequired,
          },
        });
      }
    },
    [
      loanApplicationID,
      locationState.studentName,
      locationState.selectedStudent,
      navigate,
      studentID,
      loanDetail.currentStatusId,
      studentDetail.name,
      studentLoanDetail.isBankingReportRequired,
      studentLoanDetail.isCreditReportRequired,
    ],
  );

  const handleReportNavigation = useCallback(
    (reportType: string): void => {
      if (!loanApplicationID || !studentID) {
        toastError("Loan application context is missing");
        return;
      }

      const navigationState = {
        loanApplicationId: loanApplicationID,
        studentID,
        studentName:
          locationState.studentName || studentDetail.name || "",
        selectedStudent: locationState.selectedStudent || null,
        isCreditReportRequired: studentLoanDetail.isCreditReportRequired,
        isBankingReportRequired: studentLoanDetail.isBankingReportRequired,
      };

      if (reportType === "Credit Analytics Report") {
        if (!studentLoanDetail.isCreditReportRequired) {
          return;
        }

        navigate(RoutePathConstant.private.educationStudentConsentVerification, {
          state: navigationState,
        });
        return;
      }

      if (reportType === "Banking Report") {
        if (!studentLoanDetail.isBankingReportRequired) {
          return;
        }

        navigate(RoutePathConstant.private.educationStudentBankDetails, {
          state: {
            ...navigationState,
            isEducationPortal: true,
            isBankingReportRequired: studentLoanDetail.isBankingReportRequired,
          },
        });
      }
    },
    [
      loanApplicationID,
      locationState.selectedStudent,
      locationState.studentName,
      navigate,
      studentID,
      studentDetail.name,
      studentLoanDetail.isBankingReportRequired,
      studentLoanDetail.isCreditReportRequired,
    ],
  );

  const handleLoanMarketPlaceNavigation = async (): Promise<void> => {
    if (!loanApplicationID || !studentID) {
      toastError("Loan application context is missing");
      return;
    }

    if (!studentLoanDetail.isLoanMarketPlaceGenerated) {
      setLoading(true);

      try {
        const response = await isProceedForCamReportForEducationalInstituteAPI(
          undefined,
          studentID,
          loanApplicationID,
        );

        if (response?.statusCode !== 200 || !response.data) {
          toastError(response?.message);
          return;
        }

        const camReportData = response.data as IIsProceedForCamReportEntity;

        if (!camReportData.isProceedForCamReport) {
          if (camReportData.reports?.length) {
            setCamReportDetails(camReportData.reports);
            setCAMReportPopUp(true);
          } else {
            toastError(response.message);
          }
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    navigate(RoutePathConstant.private.loanMarketPlaceForEducationInstitute, {
      state: {
        loanApplicationId: loanApplicationID,
        loanApplicationID,
        studentID,
        studentName: locationState.studentName || studentDetail.name || "",
        selectedStudent: locationState.selectedStudent || null,
        origin: "student-360",
      },
    });
  };

  const statusBodyTemplate = (report: IIsProceedForReportEntity): JSX.Element => {
    const statusClass = report.status === "Completed"
      ? "greenLine"
      : report.status === "In Progress"
        ? "orangeLine"
        : "redLine";

    return <span className={`StatusLabel ${statusClass}`}>{report.status}</span>;
  };

  const footerContentCamReport = (
    <div className="d-flex justify-content-end mt-3">
      <Button
        className="btn btn-black-line text-center"
        label="Close"
        onClick={() => setCAMReportPopUp(false)}
      />
    </div>
  );

  const getReportStatusClassName = (status: string): string => {
    if (status === "Completed") {
      return "student-360-view__timeline-subitem--completed";
    }

    if (status === "Not Fetched") {
      return "student-360-view__timeline-subitem--pending";
    }

    return "";
  };

  const getReportActionLabel = (status: string): string =>
    status === "Completed" ? "View" : "Pending";

  const isFetchedReportNotRequired = (reportType: string): boolean =>
    (reportType === "Credit Analytics Report" &&
      !studentLoanDetail.isCreditReportRequired &&
      studentLoanDetail.isCreditReportFetched) ||
    (reportType === "Banking Report" &&
      !studentLoanDetail.isBankingReportRequired &&
      studentLoanDetail.isBankingReportFetched);

  const reportList = useMemo(() => {
    const reports: { reportType: string; status: string }[] = [];

    if (studentLoanDetail.isCreditReportRequired) {
      reports.push({
        reportType: "Credit Analytics Report",
        status: studentLoanDetail.isCreditReportFetched ? "Completed" : "Not Fetched",
      });
    }

    if (studentLoanDetail.isBankingReportRequired) {
      reports.push({
        reportType: "Banking Report",
        status: studentLoanDetail.isBankingReportFetched ? "Completed" : "Not Fetched",
      });
    }

    return reports;
  }, [
    studentLoanDetail.isBankingReportFetched,
    studentLoanDetail.isBankingReportRequired,
    studentLoanDetail.isCreditReportFetched,
    studentLoanDetail.isCreditReportRequired,
  ]);

  useEffect(() => {
    fetchStudentLoanDetail();
  }, [loanApplicationID, id, message]);

  return (
    <>
      <div className="whiteBoxHldr p-24 student-360-view-page">
        <Loader isLoading={loading} />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <h3 className="mb-0 student-360-view__page-title">Student 360 View</h3>
          <Button className="btn btn-black-line" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <div className="student-360-view__layout">
          <div className="student-360-view__main">
            <div className="student-360-view__hero">
              <div className="student-360-view__hero-left">
                <div className="student-360-view__avatar">
                  {studentDetail.photo ? (
                    <img
                      src={studentDetail.photo}
                      alt={studentDetail.name || "student"}
                      className="student-360-view__avatar-image"
                    />
                  ) : (
                    <span>{studentInitials}</span>
                  )}
                </div>

                <div className="student-360-view__hero-meta">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <h4 className="mb-0 student-360-view__student-name">
                      {studentDetail.name || "-"}
                    </h4>

                    {loanDetail.currentStatus ? (
                      <span className="student-360-view__status-pill">
                        {loanDetail.currentStatus}
                      </span>
                    ) : null}
                  </div>

                  <p className="mb-0 student-360-view__student-subtitle">
                    {studentDetail.loanApplicationCode || "-"}
                    {" - "}
                    {courseDetail.courseName || "-"}
                  </p>
                </div>
              </div>

              {studentDetail.creditScore !== null &&
                studentDetail.creditScore !== undefined &&
                <div className="student-360-view__credit-card">
                  <span className="student-360-view__credit-label">Credit</span>
                  <strong className="student-360-view__credit-score">
                    {studentDetail.creditScore ?? "-"}
                  </strong>
                  {studentDetail.creditScore !== null &&
                    studentDetail.lastFetchedCreditScore ? (
                    <span className="student-360-view__credit-date">
                      Updated {formatDisplayDate(studentDetail.lastFetchedCreditScore)}
                    </span>
                  ) : null}
                </div>
              }
            </div>

            <div className="student-360-view__content-grid">
              <div className="borderBoxHldr p-24 student-360-view__section-card">
                <div className="student-360-view__section-head">
                  <h5 className="mb-1">Course Details</h5>
                  <p className="mb-0">
                    Course, institute, fee breakup, sanctioned amount, and tenure.
                  </p>
                </div>

                <div className="student-360-view__metric-grid">
                  {renderDetailCard(
                    "Course",
                    courseDetail.courseName || "-",
                  )}

                  {renderDetailCard(
                    "Institute",
                    courseDetail.instituteTradeName
                      ? decryptVAPTData(courseDetail.instituteTradeName)
                      : courseDetail.instituteName || "-",
                  )}

                  {renderDetailCard(
                    "Fee",
                    formatDisplayAmount(courseDetail.courseAgreedFee),
                  )}

                  {renderDetailCard(
                    "Down Payment",
                    formatDisplayAmount(loanPaymentDetails.downPayment),
                  )}

                  {renderDetailCard(
                    "Loan Amount",
                    formatDisplayAmount(loanPaymentDetails.loanAmount),
                  )}

                  {renderDetailCard(
                    "Tenure",
                    formatCourseTenure(courseDetail.tenure)
                  )}
                </div>
              </div>

              <div className="borderBoxHldr p-24 student-360-view__section-card">
                <div className="student-360-view__section-head student-360-view__section-head--loan">
                  <div>
                    <h5 className="mb-1">Loan Details</h5>
                    <p className="mb-0">
                      Current lending progress, fee details, and readiness status.
                    </p>
                  </div>

                  <div className="student-360-view__loan-actions">
                    {canEditLoanApplication ? (
                      <Button
                        className="btn btn-orange-line"
                        icon="bi bi-pencil-square me-2"
                        label="Edit Application"
                        onClick={handleEditLoanApplication}
                      />
                    ) : null}

                    {studentLoanDetail.showOverdueAmount ? (
                      <Button
                        className="btn btn-orange-line"
                        onClick={handleComingSoon}
                      >
                        Repay EMI Overdue
                      </Button>
                    ) : null}

                    {studentLoanDetail.showForeClosure ? (
                      <Button
                        className="btn btn-orange-line"
                        onClick={handleComingSoon}
                      >
                        Force Close Loan
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="student-360-view__metric-grid">
                  {renderDetailCard(
                    "Application Status",
                    loanDetail.currentStatus || "-",
                  )}

                  {renderDetailCard(
                    "Lender Details",
                    loanDetail.nbfcBankName || "-",
                  )}

                  {renderDetailCard(
                    "Processing Fee",
                    formatDisplayAmount(loanDetail.processingFee),
                  )}

                  {renderDetailCard(
                    "E-Nach",
                    loanDetail.eNachStatus
                      ? "Completed"
                      : "Pending",
                  )}

                  {renderDetailCard(
                    "Sanction Date",
                    formatDisplayDate(loanDetail.sanctionedDate),
                  )}

                  {renderDetailCard(
                    "Disbursement Date",
                    formatDisplayDate(loanDetail.disbursementDate),
                  )}
                </div>
              </div>
            </div>

            {studentLoanDetail.showRepaymentSection ? (
              <div className="borderBoxHldr p-24 student-360-view__section-card mt-4">
                <div className="student-360-view__section-head student-360-view__section-head--repayment">
                  <div>
                    <h5 className="mb-1">Repayment Details</h5>
                    <p className="mb-0">
                      EMI repayment summary for the selected student loan.
                    </p>
                  </div>

                  <Button className="btn btn-orange" onClick={handleComingSoon}>
                    Pay Now
                  </Button>
                </div>

                <div className="student-360-view__metric-grid">
                  {renderDetailCard(
                    "Last EMI Paid Date",
                    formatDisplayDate(
                      loanPaymentDetails.lastEMIPaidDate ||
                      lastCompletedPayment?.emiPaidDate ||
                      null,
                    ),
                  )}

                  {renderDetailCard(
                    "Last EMI Paid Amount",
                    loanPaymentDetails.paidEMI > 0
                      ? formatDisplayAmount(loanPaymentDetails.emiAmount)
                      : "-",
                  )}

                  {renderDetailCard(
                    "Next EMI Paid Date",
                    formatDisplayDate(nextPendingPayment?.emiDate || null),
                  )}

                  {renderDetailCard(
                    "Next EMI Paid Amount",
                    loanPaymentDetails.emiAmount
                      ? formatDisplayAmount(loanPaymentDetails.emiAmount)
                      : "-",
                  )}

                  {renderDetailCard(
                    "Loan Maturity Date",
                    formatDisplayDate(loanPaymentDetails.emiMaturityDate),
                  )}

                  {renderDetailCard(
                    "Loan Start Date",
                    formatDisplayDate(
                      loanDetail.disbursementDate ||
                      loanDetail.sanctionedDate,
                    ),
                  )}

                  {renderDetailCard(
                    "Loan Sanctioned Amount",
                    formatDisplayAmount(loanPaymentDetails.loanAmount),
                  )}

                  {renderDetailCard(
                    "Loan Current Outstanding",
                    formatDisplayAmount(outstandingAmount),
                  )}
                </div>
              </div>
            ) : null}

            <div className="borderBoxHldr p-24 student-360-view__section-card mt-4">
              <div className="student-360-view__section-head student-360-view__section-head--documents">
                <div>
                  <h5 className="mb-1">Uploaded Documents</h5>
                  <p className="mb-0">
                    Loan paperwork and generated lending reports for this student.
                  </p>
                </div>
              </div>

              {documentList.length > 0 ? (
                <div className="student-360-view__documents-grid">
                  {documentList.map((document) => (
                    <button
                      key={document.id}
                      type="button"
                      className="student-360-view__document-card"
                      onClick={() => openDocument(document.filePath)}
                    >
                      <div className="student-360-view__document-icon">
                        <i className="pi pi-file" />
                      </div>

                      <div className="student-360-view__document-copy">
                        <strong>{document.documentName || "-"}</strong>
                        <span>
                          {document.documentType
                            ? `Type: ${document.documentType}`
                            : "Document available for preview"}
                        </span>
                      </div>

                      <i className="icon-download student-360-view__document-download" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="student-360-view__empty-state">
                  No loan documents available for this application yet.
                </div>
              )}
            </div>
          </div>

          <aside className="borderBoxHldr p-24 student-360-view__timeline-panel">
            <h5 className="mb-1">Journey Timeline</h5>
            <p className="mb-3 student-360-view__timeline-intro">
              Click a stage to jump
            </p>

            {timeline.length > 0 ? (
              <div className="student-360-view__timeline-list">
                {timeline.map((item) => (
                  <div key={`${item.statusId}-${item.statusName}`}>
                    <button
                      type="button"
                      className={`student-360-view__timeline-item ${item.isCompleted
                        ? "student-360-view__timeline-item--active"
                        : ""
                        } ${loanDetail.currentStatusId === item.statusId
                          ? "student-360-view__timeline-item--active"
                          : ""
                        }`}
                      onClick={() => handleTimelineClick(item.statusId)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor:
                          loanDetail.currentStatusId === item.statusId &&
                            (item.statusId === LoanTimeLineSteps.CREDIT_REPORT || item.statusId === LoanTimeLineSteps.BANKING_REPORT)
                            ? "pointer"
                            : "default",
                      }}
                    >
                      <span className="student-360-view__timeline-dot" />
                      <div className="student-360-view__timeline-copy">
                        <strong>{item.statusName || "-"}</strong>

                        {item.statusUpdatedDate ? (
                          <span>{formatDisplayDate(item.statusUpdatedDate)}</span>
                        ) : null}
                      </div>
                    </button>

                    {item === timeline[0] ? (
                      <div className="student-360-view__timeline-sublist">
                        {reportList.map((report) => (
                          <button
                            key={`${report.reportType}-${report.status}`}
                            type="button"
                            className="student-360-view__timeline-subitem"
                            onClick={() => handleReportNavigation(report.reportType)}
                          >
                            <span
                              className={`student-360-view__timeline-subitem-title ${getReportStatusClassName(report.status)} ${isFetchedReportNotRequired(report.reportType)
                                ? "student-360-view__timeline-subitem--pending"
                                : ""
                                }`}
                            >
                              {report.reportType}
                            </span>

                            <span
                              className={`student-360-view__timeline-subitem-action ${getReportStatusClassName(report.status)} ${isFetchedReportNotRequired(report.reportType)
                                ? "student-360-view__timeline-subitem--pending"
                                : ""
                                }`}
                            >
                              {!studentLoanDetail.isCreditReportRequired &&
                                !studentLoanDetail.isCreditReportFetched &&
                                report.reportType === "Credit Analytics Report"
                                ? "Skip"
                                : !studentLoanDetail.isBankingReportRequired &&
                                  !studentLoanDetail.isBankingReportFetched &&
                                  report.reportType === "Banking Report"
                                  ? "Skip"
                                  : report.reportType === "Banking Report" && !studentLoanDetail.isBankingReportFetched
                                    ? "Not Fetched"
                                    : getReportActionLabel(report.status)}
                            </span>
                          </button>
                        ))}

                        <button
                          type="button"
                          className="student-360-view__timeline-subitem"
                          onClick={handleLoanMarketPlaceNavigation}
                          disabled={!loanApplicationID || !studentID || loading}
                        >
                          <span
                            className={`student-360-view__timeline-subitem-title ${getReportStatusClassName(
                              studentLoanDetail.isLoanMarketPlaceGenerated ? "Completed" : "Not Fetched",
                            )}`}
                          >
                            Eligibility Screen
                          </span>

                          <span
                            className={`student-360-view__timeline-subitem-action ${getReportStatusClassName(
                              studentLoanDetail.isLoanMarketPlaceGenerated ? "Completed" : "Not Fetched",
                            )}`}
                          >
                            {studentLoanDetail.isLoanMarketPlaceGenerated ? "View" : "Pending"}
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="student-360-view__empty-state student-360-view__empty-state--compact">
                Timeline details are not available.
              </div>
            )}
          </aside>
        </div>
      </div>

      {cAMReportPopUp &&
        <Dialog
          header="Eligibility Screening Report"
          visible={cAMReportPopUp}
          onHide={() => setCAMReportPopUp(false)}
          draggable={false}
          resizable={false}
          modal
          closable
          blockScroll
          className="modalWrapper"
          style={{ width: "500px" }}
          footer={footerContentCamReport}
        >
          <div className="modal-content">
            <div className="modal-body">
              <div className="camList">
                {camReportDetails.map((item, index) => (
                  <div key={index} className="camCard">
                    <div className="camLeft">
                      <span className="camTitle">{item.reportType}</span>
                    </div>

                    {statusBodyTemplate(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      }
    </>
  );
};

export default StudentDetail360View;

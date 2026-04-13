import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  IClientDashboardData,
  IClientDashboardResponse,
  ICreditAnalyticsResponse,
  IPartnerScore,
} from "../../interface/clientDashboard";
import {
  downloadAllReportsAPI,
  getAllLoanApplicationsAPI,
  getClientDashboardAPI,
  getCreditAnalyticsSendOtpAPI,
  getCreditAnalyticsVerifyOtpAPI,
  proceedForCreditReportAPI,
  resendOtpForCreditReportAPI,
} from "../../utils/axios/apiServices";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { RootState } from "../../store";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { Dialog } from "primereact/dialog";
import { InputOtp } from "primereact/inputotp";
import Loader from "../../components/Loader";
import {
  IFetchCreditScoreBody,
  ILoanApplicationData,
  IResendOTPCreditScoreBody,
} from "../../interface/client";
import { useDispatch, useSelector } from "react-redux";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import {
  formatDate,
  formatTime,
  getFetchEligibilityStatus,
  shouldShowContractModal,
  showGlobalReportModal,
  toastError,
  toastErrorWithExtraTime,
  toastInfo,
  toastSuccessWithExtraTime,
} from "../../utils/functions/shared";
import { ProgressBar } from "primereact/progressbar";
import { ITotalCountByStatus } from "../../interface/adminDashboard";
import {
  IGetAllLoanApplicationsData,
  IGetAllLoanApplicationsResponse,
  ILoanApplicationParams,
} from "../../interface/channelPartnerDashboard";
import {
  CLIENT_ROLE,
  CREDIT_SCORE_REPORT_NORMAL_ERROR,
  CREDIT_SCORE_REPORT_TECHNICAL_ERROR,
  formatCurrencyAmount,
  getTitleByStatus,
} from "../../utils/constants/constant";
import { PaginateReqEntity } from "../../interface/pagination";
import BackButton from "../../components/BackButton";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import {
  OTPType,
  ReportType,
  StorageKeyEnum,
} from "../../utils/constants/enum";
import { setUserData } from "../../store/reducer/userSlice";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import TableTitle from "../../components/TableTitle";
import { environment } from "../../utils/constants/environments";
import { Checkbox } from "primereact/checkbox";
import { Tooltip } from "primereact/tooltip";
import {
  IClientDetailList,
  IExternalReportResponse,
} from "../../interface/reports";
import { ILogoutResponse } from "../../interface/logout";
import { incrementResendCount } from "../../store/reducer/resendCountSlice";
import introJs from "intro.js";
import "intro.js/introjs.css";
import ModalLoader from "../../components/ModalLoader";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import CreditNotAvailable from "../../components/CreditNotAvailable";
import ReFetchModal from "../../components/ReFetchModal";
import { setReportMessage } from "../../store/reducer/reportMessageSlice";

interface IFinancialDetails {
  name: string;
  description: string;
  iconClass: string;
  link: string | (() => void);
}

export type IUserCreditInfo = {
  id?: string;
  name?: string;
  creditScore?: number | null;
  maxCreditScore?: number | null;
};

const ClientDashboard = () => {
  const [adminInfo, setAdminInfo] = useState<IGetAllLoanApplicationsData>();

  const [otpValues, setOtpValues] = useState<number | undefined>(undefined);

  const [clientInfo, setClientInfo] = useState<IClientDashboardData>();

  const [showCreditScore, setShowCreditScore] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [referenceID, setReferenceID] = useState<string>("");

  const [reservationId, setReservationId] = useState<string>("");

  const [partnerId, setPartnerId] = useState<string>("");

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [showSpecialError, setShowSpecialError] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [showDownloadReportModal, setShowDownloadReportModal] =
    useState<boolean>(false);

  const [selectedReports, setSelectedReports] = useState<{
    [key: number]: boolean;
  }>({});

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [showCreditPopup, setShowCreditPopup] = useState<boolean>(false);

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const introRef = useRef(null);

  const otpRef = useRef<HTMLInputElement | null>(null);

  const {
    userName,
    userID,
    isContractSigned,
    contractEnforcementDate,
    userType,
  } = useSelector((state: RootState) => state.user.user);

  const { search } = useLocation();

  const urlParams = new URLSearchParams(search);

  const status = urlParams.get("status");

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const { resendCount } = useSelector((state: RootState) => state.resend);

  const handleImpersonateLogoutForCredit = (): void => {
    if (isDefaultCpClient) {
      navigate(RoutePathConstant.private.subscription, {
        state: { creditsInSufficient: true },
      });
      return;
    }

    const previousUserData = JSON.parse(
      getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      ),
    );

    dispatch(setUserData(previousUserData));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      previousUserData.token,
    );
    navigate(RoutePathConstant.private.subscription, {
      state: { creditsInSufficient: true },
    });

    dispatch(setImpersonateUser(false));
  };

  const fetchDashboardDetail = async (): Promise<void> => {
    if (!status) return;

    setLoading(true);

    const value: ILoanApplicationParams = {
      userType: CLIENT_ROLE.CUSTOMER,
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      userID,
    };

    if (status !== "0") {
      value.statusFilter = status;
    }

    const response: IGetAllLoanApplicationsResponse =
      await getAllLoanApplicationsAPI(value);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setAdminInfo(response?.data);
      setTotalRecords(response?.data?.totalLoanApplications);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchClientDashboardDetail = async (): Promise<void> => {
    setLoading(true);

    const response: IClientDashboardResponse = await getClientDashboardAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : null,
      };

      const creditReportEligibility = getFetchEligibilityStatus(
        decryptedData.creditReportDate,
      );

      const incomeTaxReportEligibility = getFetchEligibilityStatus(
        decryptedData.itrReportDate,
      );

      const finalData: IClientDashboardData = {
        ...decryptedData,
        creditScoreRefetchedDays: creditReportEligibility?.daysLeft,
        incomeTaxRefetchedDays: incomeTaxReportEligibility?.daysLeft,
      };

      setClientInfo(finalData);

      dispatch(setCustomerInfo(finalData));
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const statusBody = (rowData: ILoanApplicationData): JSX.Element => {
    return (
      <span
        className="StatusLabel"
        style={{ backgroundColor: rowData.status.color }}
      >
        {rowData.status.label}
      </span>
    );
  };

  const financialDetailsData: IFinancialDetails[] = [
    {
      name: "Income Tax",
      description: "List of all Income Tax report listed here.",
      iconClass: "icon-incom",
      link: RoutePathConstant.private.incomeTaxReport,
    },
    {
      name: "GST Report",
      description: "List of all the GST reports are listed here.",
      iconClass: "icon-pay",
      link: RoutePathConstant.private.gstReport,
    },
    {
      name: "Banking Analytics",
      description: "List of all the banking analytics are listed here.",
      iconClass: "icon-pay",
      link: RoutePathConstant.private.bankingAnalyticsReport,
    },
    {
      name: "Business Report",
      description: "List of all the business reports are listed here.",
      iconClass: "icon-pay",
      link: () => toastInfo("Coming Soon"),
    },
    {
      name: "Virtual CFO Report",
      description:
        "Get the detailed insights into your business’s financial health",
      iconClass: "icon-pay",
      link: () => toastInfo("Coming Soon"),
    },
    {
      name: "Uploaded Document",
      description: "Upload the documents here for hassle-free application.",
      iconClass: "icon-policy",
      link: RoutePathConstant.private.documents,
    },
  ];

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (typeof value === "number") {
      setOtpValues(value);
    } else if (typeof value === "string") {
      setOtpValues(Number(value));
    } else {
      setOtpValues(undefined);
    }

    setShowNormalError("");
    setShowSpecialError(false);
  };

  const handleErrorMessage = (response: IExternalReportResponse) => {
    if (
      CREDIT_SCORE_REPORT_NORMAL_ERROR.includes(response?.data?.responseCode)
    ) {
      showGlobalReportModal(response?.message, "Credit Report Update");
    } else if (
      CREDIT_SCORE_REPORT_TECHNICAL_ERROR.includes(response?.data?.responseCode)
    ) {
      setShowNormalError(response?.message);
    } else {
      showGlobalReportModal(response?.message, "Credit Report Update");
    }
  };

  const handleGetCreditScore = async (
    partner?: IPartnerScore,
  ): Promise<void> => {
    setLoading(true);

    const proceedForResponse = await proceedForCreditReportAPI();

    if (!proceedForResponse) return;

    if (
      proceedForResponse.statusCode === 200 &&
      proceedForResponse.data.isConsentRequired
    ) {
      setShowCreditScore(true);

      setShowRefetchReport(false);

      setReservationId(proceedForResponse.data.reservationId);

      const response: IExternalReportResponse =
        await getCreditAnalyticsSendOtpAPI(partner?.id!);

      if (!response) return;

      if (response.statusCode === 200) {
        setShowOTP(true);
        setShowNormalError("");
        setTimeLeft(environment.REPORT_OTP_TIMER);
        setReferenceID(response?.data?.requestId!);
        setReservationId(response?.data?.reservationId!);
        setPartnerId(partner?.id!);
        toastSuccessWithExtraTime(response?.message);
      } else if (response?.statusCode === 402) {
        if (!isImpersonate) {
          setShowCreditPopup(true);
        } else {
          handleImpersonateLogout();
        }
      } else {
        toastErrorWithExtraTime(response.message);
        // handleErrorMessage(response as IExternalReportResponse);
      }
    } else {
      setShowRefetchReport(false);

      dispatch(
        setReportMessage({
          title: "Credit Report Update",
          message: proceedForResponse.message,
        }),
      );

      setShowCreditScore(!showCreditScore);
    }

    setLoading(false);
  };

  const handleValidateOTP = async (): Promise<void> => {
    if (!otpValues || otpValues.toString().length !== OTPType.SIX_DIGIT_OTP) {
      toastErrorWithExtraTime(
        `Please enter a valid ${OTPType.SIX_DIGIT_OTP}-digit OTP`,
      );
      return;
    }

    setShowNormalError("");
    setShowSpecialError(false);
    setTimeLeft(environment.REPORT_OTP_TIMER);
    setReportLoading(true);

    const body: IFetchCreditScoreBody = {
      otp: Number(otpValues),
      requestId: referenceID,
      reservationId,
      partnerID: partnerId,
    };

    const response: ICreditAnalyticsResponse =
      await getCreditAnalyticsVerifyOtpAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "Credit Report Update");
      setShowOTP(false);
      setShowCreditScore(false);
    }
    // else if (
    //   (response?.data as IExternalReportData)?.responseCode === "EPN492"
    // ) {
    //   setShowSpecialError(true);
    // }
    // else if (typeof response?.data === "object") {
    //   console.log('third')
    //   handleErrorMessage(response as IExternalReportResponse);
    // }
    else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogoutForCredit();
      }
    } else {
      toastErrorWithExtraTime(response.message);
      // showGlobalReportModal(response?.message, "Credit Report Update");
    }

    setOtpValues(undefined);
    setReportLoading(false);
  };

  const handleCheckboxChange = (reportType: number) => {
    setSelectedReports((prevState) => ({
      ...prevState,
      [reportType]: !prevState[reportType],
    }));
  };

  const progressAction = (
    loanApplication: ILoanApplicationData,
  ): JSX.Element => {
    return (
      <>
        <p style={{ fontSize: "0.625em" }}>
          {loanApplication.progressPercent}% Completed
        </p>
        <ProgressBar
          style={{ height: "6px" }}
          value={loanApplication.progressPercent}
          showValue={false}
        />
      </>
    );
  };

  const actionBody = (rowData: ILoanApplicationData): JSX.Element => {
    const viewTooltipId = `view-loan-${rowData.loanApplicationID}`;
    const actionTooltipId = `loan-action-${rowData.loanApplicationID}`;
    const editTooltipId = `loan-edit-${rowData.loanApplicationID}`;

    return (
      <>
        <Tooltip target={`#${viewTooltipId}`} position="top" />
        <Button
          id={viewTooltipId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View Loan Application"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.loanDetail}/${rowData.loanApplicationID}`,
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
        </Button>

        {!rowData.isCamReportGenerated && (
          <>
            <Tooltip target={`#${editTooltipId}`} position="top" />

            <Button
              id={editTooltipId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Edit Loan Application"
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.editLoan}/${rowData.loanApplicationID}`,
                )
              }
            >
              <i className="bi bi-pencil-fill" />
            </Button>
          </>
        )}

        {rowData.isCamReportGenerated ? (
          <>
            <Tooltip target={`#${actionTooltipId}`} position="top" />
            <Button
              id={actionTooltipId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Loan Market Place"
              onClick={() =>
                navigate(RoutePathConstant.private.loanMarketPlace, {
                  state: {
                    showDocument: true,
                    loanType: rowData?.loanTypeID,
                    loanApp: rowData?.loanApplicationID,
                  },
                })
              }
            >
              <i className="bi bi-list-check" />
            </Button>
          </>
        ) : (
          <>
            <Tooltip target={`#${actionTooltipId}`} position="top" />
            <Button
              id={actionTooltipId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Check Eligibility"
              onClick={() =>
                navigate(RoutePathConstant.private.checkEligibility, {
                  state: {
                    loanType: rowData?.loanTypeID,
                    loanApp: rowData?.loanApplicationID,
                  },
                })
              }
            >
              <i className="bi bi-list-check" />
            </Button>
          </>
        )}
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const handleImpersonateLogout = (): void => {
    const previousUserData = JSON.parse(
      getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      ),
    );

    dispatch(setUserData(previousUserData));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      previousUserData.token,
    );

    navigate(RoutePathConstant.private.userMasterClientMaster);

    dispatch(setImpersonateUser(false));
  };

  const resendOTP = async (): Promise<void> => {
    if (resendCount >= 3) return;

    setLoading(true);
    setTimeLeft(environment.REPORT_OTP_TIMER);

    const body: IResendOTPCreditScoreBody = {
      requestId: referenceID,
    };

    const response: ILogoutResponse = await resendOtpForCreditReportAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      showGlobalReportModal(response.message, "Credit Report Update");
      dispatch(incrementResendCount());
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response.message);
    }

    setLoading(false);
  };

  const handleDownloadAllReport = async (): Promise<void> => {
    const selectedReportData =
      clientInfo?.reports?.filter(
        (report: IClientDetailList) => selectedReports[report.reportType],
      ) ?? [];

    const reportTypes = selectedReportData
      ?.map((report) => report.reportType)
      .filter((type) => type !== undefined);

    if (reportTypes.length === 0) {
      toastError("Please select the report to download");
      return;
    }

    if (reportTypes.length === 1) {
      const singleReport = selectedReportData[0];
      const filePath = singleReport.filePath.replace(/\\/g, "/");

      const a = document.createElement("a");
      a.href = filePath;
      a.download = `${singleReport.name}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const response: ArrayBuffer = await downloadAllReportsAPI(
        reportTypes,
        userID,
      );

      const blob = new Blob([response], { type: "application/zip" });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `Reports-${userName}.zip`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    setSelectedReports({});
    setShowDownloadReportModal(false);
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        disabled={loading}
        onClick={() => {
          setSelectedReports({});
          setShowDownloadReportModal(false);
        }}
      >
        Cancel
      </Button>

      <Button
        className={`btn ${
          loading ? "btn-orange-disabled" : "btn-orange"
        } w-100`}
        disabled={loading}
        onClick={handleDownloadAllReport}
      >
        {loading ? "Generating Report..." : "Download Report"}
      </Button>
    </div>
  );

  const startNormalTour = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: "Check Your Credit Score",
          element: ".check-credit-score",
          intro: "Here, you can check your credit score and get insights.",
        },
        {
          title: "Apply for a Loan",
          element: ".apply-loan",
          intro: "Start your loan application process quickly from here.",
        },
        {
          title: "Financial Analytics",
          element: ".financialAnalyticsTour",
          intro: "Analyze your financial reports and insights here.",
        },
      ],
      disableInteraction: true, // Prevents user interaction
      showProgress: false, // Hides progress bar
      showBullets: true, // Shows step bullets
      exitOnOverlayClick: true,
      exitOnEsc: true,
      showButtons: true,
      nextLabel: "→", // Replaces "Next" with right arrow
      prevLabel: "←", // Replaces "Prev" with left arrow
      doneLabel: "✔ Finish", // Custom finish button
    });

    intro.onafterchange(() => {
      const oldCloseButton = document.querySelector(".introjs-close-button");
      if (oldCloseButton) {
        oldCloseButton.remove();
      }

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "✖"; // Cross icon
      closeButton.className = "introjs-close-button";
      closeButton.style.position = "absolute";
      closeButton.style.top = "10px";
      closeButton.style.right = "10px";
      closeButton.style.background = "transparent";
      closeButton.style.border = "none";
      closeButton.style.fontSize = "18px";
      closeButton.style.cursor = "pointer";
      closeButton.style.zIndex = "9999";

      closeButton.onclick = () => {
        intro.exit(true);
      };

      const tooltip = document.querySelector(".introjs-tooltip");
      if (tooltip) {
        tooltip.appendChild(closeButton);
      }
    });

    intro.start();
  };

  const startSpecialTour = () => {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          title: "Your Credit Score",
          element: ".check-credit-score",
          intro: "Here, you can check your credit score and get insights.",
        },
        {
          title: "Loan Applications",
          element: ".ApplicationsBoxWrapper",
          intro: "This section shows your loan applications.",
        },
        {
          title: "Financial Analytics",
          element: ".financialAnalyticsTour",
          intro: "Analyze your financial reports and insights here.",
        },
      ],
      disableInteraction: true, // Prevents user interaction
      showProgress: false, // Hides progress bar
      showBullets: true, // Shows step bullets
      exitOnOverlayClick: true,
      exitOnEsc: true,
      showButtons: true,
      nextLabel: "→", // Replaces "Next" with right arrow
      prevLabel: "←", // Replaces "Prev" with left arrow
      doneLabel: "✔ Finish", // Custom finish button
    });

    intro.onafterchange(() => {
      const oldCloseButton = document.querySelector(".introjs-close-button");
      if (oldCloseButton) {
        oldCloseButton.remove();
      }

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "✖"; // Cross icon
      closeButton.className = "introjs-close-button";
      closeButton.style.position = "absolute";
      closeButton.style.top = "10px";
      closeButton.style.right = "10px";
      closeButton.style.background = "transparent";
      closeButton.style.border = "none";
      closeButton.style.fontSize = "18px";
      closeButton.style.cursor = "pointer";
      closeButton.style.zIndex = "9999";

      closeButton.onclick = () => {
        intro.exit(true);
      };

      const tooltip = document.querySelector(".introjs-tooltip");
      if (tooltip) {
        tooltip.appendChild(closeButton);
      }
    });

    intro.start();
  };

  const validUser = (): boolean => {
    return isDefaultCpClient || isImpersonate;
  };

  const handleClickCreditReport = async (): Promise<void> => {
    if (clientInfo?.creditReportDate === null) {
      handleReportFetchFunction();
    } else if ((clientInfo?.creditScoreRefetchedDays ?? 0) < 30) {
      setShowRefetchReport(true);
    } else {
      handleReportFetchFunction();
    }
  };

  const handlePartnerCreditReport = async (): Promise<void> => {
    setShowCreditScore(!showCreditScore);
  };

  const handleReportFetchFunction = async () => {
    setLoading(true);

    const response = await proceedForCreditReportAPI();

    if (!response) return;

    if (response.statusCode === 200 && response.data.isConsentRequired) {
      setShowCreditScore(true);

      setShowRefetchReport(false);

      setReservationId(response.data.reservationId);
    } else {
      setShowRefetchReport(false);

      dispatch(
        setReportMessage({
          title: "Credit Report Update",
          message: response.message,
        }),
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (status) {
      fetchDashboardDetail();
    } else {
      fetchClientDashboardDetail();
    }
  }, [status, filterReq]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  useEffect(() => {
    // Wait for the component to mount and find the first input
    setTimeout(() => {
      const firstInput = document.querySelector(
        ".p-inputotp input",
      ) as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (otpValues && otpValues.toString().length === OTPType.SIX_DIGIT_OTP) {
      handleValidateOTP();
    }
  }, [otpValues]);

  useEffect(() => {
    userType === CLIENT_ROLE.CUSTOMER &&
      !isImpersonate &&
      setShowContractAgreement(!isContractSigned);
  }, [isContractSigned]);

  return (
    <div className="whiteBoxHldr p-30">
      <Loader isLoading={loading} />

      <Dialog
        visible={reportLoading}
        modal
        draggable={false}
        resizable={false}
        className="modalWrapper"
        onHide={() => {}}
        blockScroll
      >
        <div className="text-center">
          <ModalLoader />
        </div>
        <h2 className="txt-orange mt-3">Processing...</h2>
        {/* <p className="mt-2">⚠️ Please do not refresh the page!</p> */}
        <p className="mt-2">
          Hang on! Your report is being generated. This might take a few
          moments.
        </p>
        <p className="mt-2">Sit tight while we fetch your credit score. 🚀</p>
        <p className="mt-2">
          If you see loader for{" "}
          <strong>5 mins or more please refresh the page</strong> to get the
          report
        </p>
      </Dialog>

      {!status && (
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleMainWrapper txt-orange d-flex justify-content-between">
              <h2 className="client-welcome">
                <span>Welcome,</span> {userName}
              </h2>
              <Button
                label="Start Tutorial"
                className="btn btn-orange text-center"
                onClick={validUser() ? startNormalTour : startSpecialTour}
              />
            </div>
          </div>

          {clientInfo && (
            <div className="col-12 scoreLoanProWrapper mb-4 mt-5">
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12 check-credit-score">
                  <div className="scoreLoanProHldr d-flex justify-content-between">
                    <div className="scoreLoanProTxt">
                      <h3 className="fw-bolder">Check Your Credit Score</h3>

                      {clientInfo?.partners?.length > 0 ? (
                        <p className="my-3">
                          <span>
                            You can now check your partner’s credit score
                            instantly—safe, simple, and hassle-free.
                          </span>
                        </p>
                      ) : clientInfo?.creditScore !== null ? (
                        <p className="my-3">
                          Your Credit Score:{" "}
                          <span className="scoreHldr">
                            <span className="score">
                              {clientInfo?.creditScore}
                            </span>{" "}
                            / {clientInfo?.maxCreditScore}
                          </span>
                        </p>
                      ) : (
                        <p className="my-3">
                          <span>
                            Don't know your credit score? Don't worry, check it
                            out now.
                          </span>
                        </p>
                      )}
                      <Button
                        className={`btn ${
                          clientInfo?.creditScore !== null
                            ? !validUser()
                              ? "btn-orange-disabled"
                              : "btn-orange"
                            : "btn-orange"
                        }`}
                        disabled={
                          clientInfo?.creditScore !== null
                            ? !validUser()
                            : false
                        }
                        onClick={
                          clientInfo?.partners?.length > 0
                            ? handlePartnerCreditReport
                            : handleClickCreditReport
                        }
                        label="Check Now"
                      />
                    </div>

                    <div className="scoreLoanProImg flex-shrink-0">
                      <img
                        src="/assets/images/score-img1.svg"
                        alt="score"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  {validUser() ? (
                    <div className="scoreLoanProHldr apply-loan d-flex justify-content-between">
                      <div className="scoreLoanProTxt">
                        <h3 className="fw-bolder">Apply for loan</h3>

                        <p className="my-3">
                          Initiate a loan application in just simple step, Start
                        </p>

                        <Button
                          className="btn btn-orange-line"
                          onClick={() =>
                            navigate(RoutePathConstant.private.applyLoan)
                          }
                          label="Get Started"
                        />
                      </div>

                      <div className="scoreLoanProImg flex-shrink-0">
                        <img
                          src="/assets/images/score-img.svg"
                          alt="score"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="col-12 ApplicationsBoxWrapper mb-4">
                      <div className="row">
                        {clientInfo?.totalLoanApplicationsCountByStatus?.map(
                          (applicationStatus: ITotalCountByStatus) => {
                            return (
                              <div
                                key={applicationStatus?.statusID}
                                className="col-lg-4 col-md-4 col-sm-6 col-12 mt-4"
                                style={{
                                  cursor:
                                    applicationStatus?.noOfApplications > 0
                                      ? "pointer"
                                      : "default",
                                }}
                                onClick={() => {
                                  if (applicationStatus?.noOfApplications > 0) {
                                    navigate(
                                      `${RoutePathConstant.private.clientDashboard}?status=${applicationStatus?.statusID}`,
                                    );
                                  }
                                }}
                              >
                                <div className="applicationBoxHldr">
                                  <div className="amountHldr txt-orange">
                                    <h2
                                      className="fw-bold"
                                      style={{ fontSize: "2.813em" }}
                                    >
                                      {applicationStatus?.noOfApplications}
                                    </h2>
                                  </div>

                                  <h3>{applicationStatus?.displayName}</h3>

                                  {applicationStatus?.noOfApplications > 0 && (
                                    <div className="clickNext">
                                      <i className="bi bi-arrow-right" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {validUser() && (
            <div className="col-12 ApplicationsBoxWrapper mb-4">
              <div className="row">
                {clientInfo?.totalLoanApplicationsCountByStatus?.map(
                  (applicationStatus: ITotalCountByStatus) => {
                    return (
                      <div
                        key={applicationStatus?.statusID}
                        className="col-lg-4 col-md-4 col-sm-6 col-12 mt-4"
                        style={{
                          cursor:
                            applicationStatus?.noOfApplications > 0
                              ? "pointer"
                              : "default",
                        }}
                        onClick={() => {
                          if (applicationStatus?.noOfApplications > 0) {
                            navigate(
                              `${RoutePathConstant.private.clientDashboard}?status=${applicationStatus?.statusID}`,
                            );
                          }
                        }}
                      >
                        <div className="applicationBoxHldr">
                          <div className="amountHldr txt-orange">
                            <h2
                              className="fw-bold"
                              style={{ fontSize: "2.813em" }}
                            >
                              {applicationStatus?.noOfApplications}
                            </h2>
                          </div>

                          <h3>{applicationStatus?.displayName}</h3>

                          {applicationStatus?.noOfApplications > 0 && (
                            <div className="clickNext">
                              <i className="bi bi-arrow-right" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {clientInfo?.loanApplicationList &&
            !IsNullOrEmptyArray(clientInfo?.loanApplicationList) && (
              <div className="col-12">
                <div className="titleLinkMain mt-3 mb-3 justify-content-between">
                  <TableTitle title="Loan Application List" />

                  <Button
                    className="btn btn-orange"
                    onClick={() =>
                      navigate(
                        `${RoutePathConstant.private.clientDashboard}?status=0`,
                      )
                    }
                  >
                    <div className="d-flex gap-3">
                      View All <i className="bi bi-arrow-right" />
                    </div>
                  </Button>
                </div>

                <div className="table-responsive">
                  <DataTable
                    className="tableMain"
                    value={clientInfo?.loanApplicationList}
                    emptyMessage="No Loan Application found"
                  >
                    <Column header="Code" field="loanApplicationCode" />

                    <Column
                      body={(rowData: ILoanApplicationData) =>
                        rowData?.loanType || "-"
                      }
                      header="Loan Type"
                    />

                    <Column
                      body={(rowData) =>
                        formatDate(rowData.date, "DD MMM, YYYY")
                      }
                      header="Date"
                    />

                    <Column
                      body={(rowData: ILoanApplicationData) =>
                        formatCurrencyAmount(rowData.loanAmount)
                      }
                      header="Loan Amount"
                    />

                    <Column
                      body={(rowData: ILoanApplicationData) => {
                        return rowData.sanctionedLoanAmount
                          ? formatCurrencyAmount(rowData.sanctionedLoanAmount)
                          : "-";
                      }}
                      header="Sanctioned"
                    />

                    <Column
                      body={(rowData: ILoanApplicationData) => {
                        return rowData.disbursedLoanAmount
                          ? formatCurrencyAmount(rowData.disbursedLoanAmount)
                          : "-";
                      }}
                      header="Disbursed"
                    />

                    <Column body={progressAction} header="Progress" />

                    <Column body={statusBody} header="Status" />

                    {validUser() && (
                      <Column body={actionBody} header="Action" />
                    )}
                  </DataTable>
                </div>
              </div>
            )}

          <div className="col-12 financialAnalyticsTour" ref={introRef}>
            <div className="titleLinkMain mt-4 mb-3 justify-content-between">
              <TableTitle title="Financial Analytics" />

              {validUser() && clientInfo && clientInfo?.reports.length > 0 && (
                <Button
                  className="btn btn-orange"
                  label="Download Reports"
                  onClick={() =>
                    setShowDownloadReportModal(!showDownloadReportModal)
                  }
                />
              )}
            </div>

            <div className="row FinancDetailsWrapper">
              {financialDetailsData.map((detail) => {
                return (
                  <div
                    className="col-lg-4 col-md-4 col-sm-12 col-12 mb-4"
                    key={detail.name}
                  >
                    <div
                      className="FinancDetailsHldr"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (typeof detail.link === "string") {
                          if (detail.name === "Uploaded Document") {
                            navigate(detail.link, { state: { loanType: 0 } });
                          } else {
                            navigate(detail.link);
                          }
                        } else if (typeof detail.link === "function") {
                          detail.link();
                        }
                      }}
                    >
                      <i
                        className={`${detail.iconClass} leftIcon flex-shrink-0`}
                      />

                      <div className="FinancDetailsTxt">
                        <h3 className="fw-bold">{detail.name}</h3>

                        <p className="mt-2">{detail.description}</p>
                      </div>

                      <Link
                        to="#"
                        style={{
                          pointerEvents: "auto",
                          color: "inherit",
                        }}
                      >
                        <i className="bi bi-arrow-right rightIcon flex-shrink-0" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {clientInfo && (
            <Dialog
              visible={showCreditScore}
              modal
              onHide={() => {
                setShowCreditScore(false);
                setShowOTP(false);
              }}
              header="Get Credit Score"
              className="modalWrapper credit-score-dialog"
              draggable={false}
              resizable={false}
              blockScroll
              style={{
                width:
                  showOTP || clientInfo?.partners?.length === 0
                    ? "760px"
                    : "960px",
                margin: "30px",
              }}
            >
              <Dialog
                visible={loading}
                modal
                onHide={() => setLoading(false)}
                header="Preparing Your Credit Insights"
                className="modalWrapper"
                draggable={false}
                resizable={false}
                blockScroll
                style={{ width: "760px" }}
              >
                <div className="text-center">
                  <ModalLoader />
                </div>
                <h2 className="txt-orange mt-3">Processing...</h2>
                <p className="mt-2 mb-3">
                  We’re securely analyzing your credit data to generate report.
                  This will only take a few seconds.
                </p>
              </Dialog>
              <div className="modal-content">
                <div className="modal-body credit-score-dialog-body">
                  {showOTP ? (
                    <>
                      {loading && !referenceID ? (
                        <div className="credit-score-inline-status">
                          <p>Sending OTP...</p>
                        </div>
                      ) : (
                        <>
                          <div className="credit-score-verify-panel">
                            <div className="form-group credit-score-otp-field">
                              <label htmlFor="otpInput" className="form-label">
                                Enter OTP<sup>*</sup>
                              </label>
                              <div className="credit-score-otp-wrap">
                                <InputOtp
                                  ref={otpRef}
                                  id="otpInput"
                                  integerOnly
                                  value={otpValues}
                                  onChange={(e) => handleOtpChange(e.value)}
                                  length={OTPType.SIX_DIGIT_OTP}
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            {resendCount < 3 && (
                              <div className="registerWrapper mt-2 credit-score-otp-meta">
                                {timeLeft > 0 ? (
                                  <b className="txt-14">{`Resend OTP in ${formatTime(
                                    timeLeft,
                                  )}`}</b>
                                ) : (
                                  <Button
                                    className="resendBtn p-button-link"
                                    onClick={resendOTP}
                                    label="Resend OTP"
                                    disabled={loading || timeLeft > 0}
                                  />
                                )}
                              </div>
                            )}

                            {showNormalError && (
                              <span className="error">{showNormalError}</span>
                            )}
                          </div>

                          <div className="modal-footer mt-3 credit-score-footer">
                            <Button
                              className="btn btn-black-line w-100 text-center"
                              onClick={() => {
                                setTimeLeft(0);
                                setShowCreditScore(!showCreditScore);
                                setShowOTP(false);
                                setOtpValues(undefined);
                              }}
                              label="Back"
                              disabled={loading}
                            />
                            <Button
                              className="btn btn-orange ms-2 w-100 text-center"
                              onClick={handleValidateOTP}
                              label="Verify OTP"
                              disabled={loading}
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {!clientInfo?.partners ||
                      clientInfo?.partners?.length === 0 ? (
                        <>
                          <p>
                            Generate an OTP to securely fetch your latest credit
                            score.
                          </p>
                          <div className="modal-footer credit-score-footer">
                            <Button
                              className="btn btn-black-line text-center"
                              onClick={() => setShowCreditScore(false)}
                              label="Back"
                              disabled={loading}
                            />
                            <Button
                              className={`btn ${
                                loading ? "btn-orange-disabled" : "btn-orange"
                              } text-center`}
                              onClick={() => handleGetCreditScore()}
                              disabled={loading}
                              label={loading ? "Processing..." : "Get OTP"}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="credit-score-partner-state">
                            <div className="credit-score-partner-state-header">
                              <div>
                                <span className="credit-score-eyebrow">
                                  Partner Profiles
                                </span>
                                <h3 className="credit-score-panel-title">
                                  Select a partner to fetch the score
                                </h3>
                                <p className="form-text mb-0">
                                  Review available partner records and continue
                                  with the person whose score you want to
                                  retrieve.
                                </p>
                              </div>
                              <span className="credit-score-partner-count">
                                {clientInfo?.partners?.length} Partners
                              </span>
                            </div>

                            <div className="credit-score-partner-grid">
                              {clientInfo?.partners?.map(
                                (person: IUserCreditInfo, index) => (
                                  <div
                                    key={person.id || index}
                                    className="credit-score-partner-card"
                                  >
                                    <div className="credit-score-partner-card-top">
                                      <div>
                                        <h4>{person.name}</h4>
                                        <p>
                                          {person.creditScore !== null
                                            ? "Existing bureau record available"
                                            : "No score fetched yet"}
                                        </p>
                                      </div>

                                      {person.creditScore !== null &&
                                        person.creditScore !== undefined && (
                                          <div className="credit-score-badge">
                                            <span className="credit-score-badge-label">
                                              Score
                                            </span>
                                            <div className="credit-score-badge-value">
                                              {person.creditScore}
                                              {person.maxCreditScore && (
                                                <small>
                                                  / {person.maxCreditScore}
                                                </small>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>

                                    <Button
                                      className="btn btn-orange credit-score-partner-action"
                                      label="Check Credit Score"
                                      onClick={() =>
                                        handleGetCreditScore(
                                          person as IPartnerScore,
                                        )
                                      }
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="modal-footer credit-score-footer">
                            <Button
                              className="btn btn-black-line w-100 text-center"
                              onClick={() => setShowCreditScore(false)}
                              label="Close"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Dialog>
          )}
        </div>
      )}

      {status && (
        <div className="col-12">
          <div className="titleLinkMain mb-3">
            <h2 className="txt-24">{getTitleByStatus(status)}</h2>
          </div>

          <div className="table-responsive">
            <DataTable
              className="tableMain"
              value={adminInfo?.loanApplications}
              emptyMessage="No Loan Application found"
            >
              <Column field="loanApplicationCode" header="Code" />

              <Column
                body={(rowData: ILoanApplicationData) =>
                  rowData?.loanType || "-"
                }
                header="Loan Type"
              />

              <Column
                body={(rowData) => formatDate(rowData.date, "DD MMM, YYYY")}
                header="Date"
              />

              <Column
                body={(rowData: ILoanApplicationData) =>
                  formatCurrencyAmount(rowData.loanAmount)
                }
                header="Loan Amount"
              />

              <Column
                body={(rowData: ILoanApplicationData) => {
                  return rowData.sanctionedLoanAmount
                    ? formatCurrencyAmount(rowData.sanctionedLoanAmount)
                    : "-";
                }}
                header="Sanctioned"
              />

              <Column
                body={(rowData: ILoanApplicationData) => {
                  return rowData.disbursedLoanAmount
                    ? formatCurrencyAmount(rowData.disbursedLoanAmount)
                    : "-";
                }}
                header="Disbursed"
              />

              <Column body={progressAction} header="Progress" />

              <Column body={statusBody} header="Status" />

              {validUser() && <Column body={actionBody} header="Action" />}
            </DataTable>
          </div>

          {!IsNullOrEmptyArray(adminInfo?.loanApplications || []) &&
            Boolean(status) && (
              <PrimePaginator
                onPageChange={onPageChange}
                pageNumber={filterReq.pageNumber}
                pageSize={filterReq.pageSize}
                totalRecords={totalRecords}
              />
            )}

          {Boolean(status) && (
            <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-5">
              <BackButton />
            </div>
          )}
        </div>
      )}

      {!status && isImpersonate && (
        <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-5">
          <Button
            className="btn btn-black-line p-4"
            onClick={() => handleImpersonateLogout()}
          >
            <span style={{ fontWeight: "600", fontSize: "16px" }}>
              Back to Client list
            </span>
          </Button>
        </div>
      )}

      {showContractAgreement &&
        shouldShowContractModal(contractEnforcementDate) && (
          <ContractAgreementModal
            showContractAgreement={
              showContractAgreement &&
              shouldShowContractModal(contractEnforcementDate)
            }
            setShowContractAgreement={(value) => {
              if (!value) {
              }
              setShowContractAgreement(value);
            }}
          />
        )}

      <Dialog
        visible={showDownloadReportModal}
        modal
        onHide={() => setShowDownloadReportModal(false)}
        header="Download Reports"
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "500px" }}
        footer={footerContent}
        blockScroll
      >
        <div className="modal-content">
          <div className="modal-body">
            <p>
              Select the document from below for which you want to download the
              report for,
            </p>
            <div className="form-check mt-4 d-flex flex-column">
              {clientInfo?.reports.map((report) => (
                <div
                  key={report.reportType}
                  className="d-flex align-items-center mt-2"
                >
                  <Checkbox
                    inputId={`report-${report.reportType}`}
                    checked={selectedReports[report.reportType] || false}
                    onChange={() => handleCheckboxChange(report.reportType)}
                  />

                  <label
                    htmlFor={`report-${report.reportType}`}
                    className="form-check-label txt-14"
                  >
                    {report.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showSpecialError}
        modal
        header="Mobile Number Mismatch"
        onHide={() => setShowSpecialError(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "500px" }}
        blockScroll
      >
        <div className="modal-content">
          <div className="modal-body">
            <p>
              The mobile number does not match the credit bureau records. Please
              <span
                className="btn btn-link px-1"
                onClick={() => navigate(RoutePathConstant.private.profile)}
              >
                update it in your profile
              </span>
              to proceed.
            </p>
          </div>
        </div>
      </Dialog>

      <CreditNotAvailable
        isShow={showCreditPopup}
        onHide={() => setShowCreditPopup(false)}
        message="Your channel partner does not have credits. Please ask them to add the credits."
      />

      <ReFetchModal
        visible={showRefetchReport}
        onHide={() => setShowRefetchReport(false)}
        reportType={ReportType.CREDIT_REPORT}
        daysLeft={clientInfo?.creditScoreRefetchedDays || 0}
        reportFetchFunction={handleReportFetchFunction}
      />
    </div>
  );
};

export default ClientDashboard;

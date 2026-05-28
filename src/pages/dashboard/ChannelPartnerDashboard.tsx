import { useEffect, useRef, useState } from "react";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatCurrencyAmount,
  formatDecimalValue,
  getTitleByStatus,
  statusList,
} from "../../utils/constants/constant";
import {
  IChannelPartnerDashboardData,
  IChannelPartnerDashboardResponse,
  IGetAllLoanApplicationsData,
  IGetAllLoanApplicationsResponse,
  ILoanApplicationParams,
} from "../../interface/channelPartnerDashboard";
import {
  fetchImpersonateUser,
  fetchSubsciptionHistoryAPI,
  fetchUserProfile,
  getAllLoanApplicationsAPI,
  getChannelPartnerDashboardAPI,
  getClientDashboardAPI,
  getLoanDetailAPI,
  updateLoanApplicationStatusAPI,
  uploadSanctionLetterForLoanApplicationAPI,
} from "../../utils/axios/apiServices";
import { useLocation, useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import AddPanModal from "../../components/AddPanModal";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressBar } from "primereact/progressbar";
import PrimePaginator from "../../components/PrimePaginator";
import { ITotalCountByStatus } from "../../interface/adminDashboard";
import { ILoanApplicationData } from "../../interface/client";
import TableTitle from "../../components/TableTitle";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import {
  extraToken,
  formatDate,
  handleDownloadCSVData,
  restrictInputByPattern,
  shouldShowContractModal,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { IGeneratePublicTokenRequest } from "../../interface/publicToken";
import {
  decryptVAPTData,
  encryptData,
} from "../../utils/functions/encryptDecrypt";
import { IVerifyEmailOTPResponse } from "../../interface/otpRequest";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { setUserData } from "../../store/reducer/userSlice";
import { setEncryptedSessionStorage } from "../../utils/functions/sessionStorage";
import {
  LoanStatus,
  LoanStatusType,
  StorageKeyEnum,
} from "../../utils/constants/enum";
import { useDispatch } from "react-redux";
import { IClientDashboardResponse } from "../../interface/clientDashboard";
import { IUserProfileResponse } from "../../interface/userData";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { Tooltip } from "primereact/tooltip";
import usePermission, { ActionType } from "../../hooks/usePermission";
import SearchButton from "../../components/SearchButton";
import useDebouncedEffect from "../../hooks/useDebounce";
import { Dialog } from "primereact/dialog";
import {
  ILoanParams,
  ILoanResponse,
  IUpdateLoanStatus,
  IUpdateLoanStatusResponse,
} from "../../interface/loanDetail";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { NUMBER_ONLY_PATTERN } from "../../utils/constants/pattern";
import moment from "moment";
import { validationMessages } from "../../utils/constants/messages";
import { environment } from "../../utils/constants/environments";
import { ISubscriptionListingResponse } from "../../interface/subscription";

const ChannelPartnerDashboard = () => {
  const [adminInfo, setAdminInfo] = useState<IGetAllLoanApplicationsData>();

  const [channelPartnerInfo, setChannelPartnerInfo] =
    useState<IChannelPartnerDashboardData>();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedLoanApplication, setSelectedLoanApplication] =
    useState<string>("");

  const [changeStatus, setChangeStatus] = useState<boolean>(false);

  const [selectedStatus, setSelectedStatus] = useState<{
    name: string;
    code: number;
  } | null>(null);

  const [currentStatus, setCurrentStatus] = useState<{
    name: string;
    code: number;
  } | null>(null);

  const [statusError, setStatusError] = useState<string>("");

  const [formValues, setFormValues] = useState<{
    dateOfRegistration: string;
    amount: string;
    uploadedLetter?: File | null;
    letterPath?: string;
    comments?: string;
    query?: string;
  }>({
    dateOfRegistration: "",
    amount: "",
    uploadedLetter: null,
    letterPath: "",
    comments: "",
    query: "",
  });

  const [formErrors, setFormErrors] = useState<{
    dateOfRegistration: string;
    amount: string;
    uploadedLetter?: string;
    comments?: string;
  }>({
    dateOfRegistration: "",
    amount: "",
    uploadedLetter: "",
    comments: "",
  });

  const [loanApplicationPopUpDetails, setLoanApplicationPopUpDetails] =
    useState<{
      clientName: string;
      loanType: string;
    }>({
      clientName: "",
      loanType: "",
    });

  const [disbursementHistoryDetails, setDisbursementHistoryDetails] = useState<
    {
      loanDisbursedDate: string;
      disbursedAmount: number;
      loanDisbursementComment: string;
    }[]
  >([]);

  const [commentsDialogVisible, setCommentsDialogVisible] =
    useState<boolean>(false);

  const [selectedComments, setSelectedComments] = useState<string>("");

  const { search } = useLocation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const urlParams = new URLSearchParams(search);

  const status = urlParams.get("status");

  const {
    userName,
    userType,
    showPanDetailPopUp,
    userID,
    isContractSigned,
    contractEnforcementDate,
  } = useSelector((state: RootState) => state.user.user);

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const { create } = usePermission("Dashboard", ["create"])();

  const clientMasterRight: Record<ActionType, boolean> = usePermission(
    "ClientMaster",
    ["create"],
  )();

  const sourcingPartnerRight: Record<ActionType, boolean> = usePermission(
    "SourcingPartner",
    ["create"],
  )();

  const dropdownRef = useRef<any>(null);

  const headersMap: Record<string, string> = {
    "Loan Application Code": "loanApplicationCode",
    "Customer Name": "customerName",
    "Loan Type": "loanType",
    Date: "date",
  };

  const fetchChannelPartnerDashboard = async (): Promise<void> => {
    setLoading(true);

    const response: IChannelPartnerDashboardResponse =
      await getChannelPartnerDashboardAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setChannelPartnerInfo(response.data);
    }

    setLoading(false);
  };

  const chartData = {
    chart: {
      type: "pie",
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    series: [
      {
        name: "status",
        colorByPoint: true,
        animation: {
          duration: 2000,
        },
        allowOverlap: true,
        data: channelPartnerInfo?.loanApplicationStatusGraphList.map(
          (channelInfo) => ({
            name: channelInfo.status,
            y: channelInfo.percentageValue,
            color: channelInfo.color,
            statusId: channelInfo.statusID,
          }),
        ),
      },
    ],
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      series: {
        allowPointSelect: true,
        innerSize: "50%",
        cursor: "pointer",
        borderRadius: 8,
        events: {
          click: function (event: {
            point: { options: { statusId: number } };
          }) {
            const statusId = event.point.options.statusId;
            navigate(
              `${RoutePathConstant.private.channelPartnerDashboard}?status=${statusId}`,
            );
          },
        },
      },
      pie: {
        allowPointSelect: true,
        borderWidth: 2,
        cursor: "pointer",
        showInLegend: true,
        dataLabels: {
          enabled: true,
          distance: 50,
          softConnector: true,
          formatter: function (this: any): string {
            return `<b>${this.options.name}</b><br>${this.options.y.toFixed(
              2,
            )}%`;
          },
        },
        allowOverlap: false,
        fillColor: "#d8d8d8",
      },
    },
    tooltip: {
      headerFormat: "",
      pointFormatter: function (this: any): string {
        return (
          `<span style="color:${this.options.color}">\u25cf</span> ` +
          `${this.options.name} loan application: <b>${this.options.y.toFixed(
            2,
          )}%</b>`
        );
      },
    },
    legend: {
      labelFormatter: function (this: any): string {
        const percentage = this.y.toFixed(2);
        return `${this.name} (${percentage}%)`;
      },
    },
  };

  const fetchDashboardDetail = async (): Promise<void> => {
    if (!status) return;

    setLoading(true);

    const value: ILoanApplicationParams = {
      userType: CLIENT_ROLE.CHANNEL_PARTNER,
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      userID,
    };

    if (filterReq?.searchText?.trim()) {
      value.search = filterReq?.searchText?.trim();
    }

    if (status !== "0") {
      value.statusFilter = status;
    }

    const response: IGetAllLoanApplicationsResponse =
      await getAllLoanApplicationsAPI(value);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setAdminInfo(response.data);
      setTotalRecords(response.data.totalLoanApplications);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchLoanDetailApi = async (loanId: string): Promise<void> => {
    setLoading(true);

    if (!loanId) return;

    const params: ILoanParams = { loanAppID: loanId };

    const response: ILoanResponse = await getLoanDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setDisbursementHistoryDetails(response.data.disbursedHistory);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchSubscriptionHistory = async (): Promise<void> => {
    setLoading(true);

    const response: ISubscriptionListingResponse =
      await fetchSubsciptionHistoryAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const totalCredit = response.data.totalCredits || 0;

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_CP_TOTAL_CREDIT,
        JSON.stringify(totalCredit),
      );

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_CREDITS_LOADED,
        "true",
      );

      window.dispatchEvent(new Event("creditsUpdated"));
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleReset = (): void => {
    setSelectedStatus(null);

    setCurrentStatus(null);

    setChangeStatus(false);

    setSelectedLoanApplication("");

    setFormValues({
      dateOfRegistration: "",
      amount: "",
      uploadedLetter: null,
      letterPath: "",
      comments: "",
    });

    setFormErrors({
      dateOfRegistration: "",
      amount: "",
      uploadedLetter: "",
      comments: "",
    });

    setLoanApplicationPopUpDetails({
      loanType: "",
      clientName: "",
    });

    setDisbursementHistoryDetails([]);

    setStatusError("");
  };

  const validateSanctionForm = () => {
    const errors: any = {};

    if (shouldShowSanctionFields()) {
      if (!formValues.dateOfRegistration) {
        errors.dateOfRegistration = validationMessages.sanctionedDateRequired;
      }

      if (!formValues.amount || Number(formValues.amount) <= 0) {
        errors.amount = validationMessages.sanctionedAmountRequired;
      }

      if (!formValues.letterPath) {
        errors.uploadedLetter = validationMessages.sanctionedLetterRequired;
      }

      if (!formValues.comments?.trim()) {
        errors.comments = validationMessages.commentsRequired;
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateDisbursedForm = () => {
    const errors: any = {};

    if (shouldShowDisbursedField() || shouldShowDisbursedFields()) {
      if (!formValues.dateOfRegistration) {
        errors.dateOfRegistration = validationMessages.disbursedDateRequired;
      }

      if (!formValues.amount || Number(formValues.amount) <= 0) {
        errors.amount = validationMessages.disbursedAmountRequired;
      }

      if (!formValues.comments?.trim()) {
        errors.comments = validationMessages.commentsRequired;
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateQueryRaisedForm = () => {
    const errors: any = {};

    if (shouldShowQueryRaiseFields() && !formValues.query?.trim()) {
      errors.comments = validationMessages.queryRequired;
    }

    setFormErrors((prev) => ({
      ...prev,
      ...errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleChangeStatus = async () => {
    if (!selectedStatus) {
      setStatusError("Please select any one status");
      return;
    }

    if (
      currentStatus &&
      selectedStatus.code === currentStatus.code &&
      !isDisbursedUpdateFlow()
    ) {
      setStatusError(
        "Selected status is already applied to this loan application",
      );
      return;
    }

    if (shouldShowSanctionFields()) {
      const isValid = validateSanctionForm();
      if (!isValid) return;
    }

    if (shouldShowQueryRaiseFields()) {
      const isValid = validateQueryRaisedForm();
      if (!isValid) return;
    }

    if (shouldShowDisbursedFields() || shouldShowDisbursedField()) {
      const isValid = validateDisbursedForm();
      if (!isValid) return;
    }

    if (!selectedStatus || selectedLoanApplication === "") return;

    setStatusError("");
    setLoading(true);

    const body: IUpdateLoanStatus = {
      loanApplicationID: selectedLoanApplication,
      statusID: selectedStatus.code,
      comments: shouldShowQueryRaiseFields()
        ? formValues.query?.trim()
        : formValues.comments,
    };

    if (shouldShowSanctionFields()) {
      body.sanctionedDate = formValues.dateOfRegistration;
      body.sanctionedAmount = formValues.amount.replace(/,/g, "");
      body.sanctionLetterPath = formValues.letterPath;
    }

    if (shouldShowDisbursedFields() || shouldShowDisbursedField()) {
      body.disbursedDate = formValues.dateOfRegistration;
      body.disbursedAmount = formValues.amount.replace(/,/g, "");
    }

    try {
      const response: IUpdateLoanStatusResponse =
        await updateLoanApplicationStatusAPI(body);

      if (!response) return;

      if (response && response.statusCode === 200) {
        handleReset();

        fetchDashboardDetail();

        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }
    } catch (error: any) {
      toastError(error.response.data.message);
    }

    setLoading(false);
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        disabled={loading}
        onClick={handleReset}
      >
        Cancel
      </Button>

      <Button
        className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
          } w-100`}
        onClick={handleChangeStatus}
        disabled={loading}
      >
        {loading ? "Updating status..." : "Update Status"}
      </Button>
    </div>
  );

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const statusBody = (rowData: ILoanApplicationData) => {
    const getLoanStatusClassName = (statusID?: number): string => {
      switch (statusID) {
        case LoanStatusType.PENDING:
          return "status-pending";
        case LoanStatusType.APPLIED:
          return "status-applied";
        case LoanStatusType.QUERY_RAISED:
          return "status-query-raised";
        case LoanStatusType.SANCTIONED:
          return "status-sanctioned";
        case LoanStatusType.PENDING_AT_CREDIT:
          return "status-pending-at-credit";
        case LoanStatusType.DISBURSED:
          return "status-disbursed";
        case LoanStatusType.REJECTED:
          return "status-rejected";
        default:
          return "status-pending";
      }
    };

    const isClickable =
      userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userType === CLIENT_ROLE.USER_MANAGEMENT;

    const viewTooltipId = `view-loan-application-${rowData.loanApplicationID}`;

    return (
      <>
        <Tooltip target={`#${viewTooltipId}`} position="top" />

        <Button
          id={viewTooltipId}
          className="trash-icon p-0 ms-2"
          onClick={() => {
            if (isClickable) {
              setSelectedLoanApplication(rowData.loanApplicationID);

              setChangeStatus(true);

              setSelectedStatus({
                name: rowData.status.label,
                code: rowData.status.statusID || 0,
              });

              setCurrentStatus({
                name: rowData.status.label,
                code: rowData.status.statusID || 0,
              });

              setLoanApplicationPopUpDetails({
                clientName: rowData.customerName,
                loanType: rowData.loanType || "",
              });

              if (status === String(LoanStatusType.DISBURSED)) {
                fetchLoanDetailApi(rowData.loanApplicationID);
              }
            }
          }}
          data-pr-tooltip={
            isClickable
              ? status === String(LoanStatusType.DISBURSED)
                ? "Re-disburse this loan application"
                : "Change Loan Status"
              : ""
          }
          disabled={!isClickable}
        >
          <span
            className="StatusLabel"
            style={{
              backgroundColor: rowData.status.color,
              cursor: isClickable ? "pointer" : "not-allowed",
            }}
          >
            {rowData.status.label}
          </span>
        </Button>
      </>
    );
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
    const viewTooltipId = `view-loan-application-${rowData.loanApplicationID}`;

    const editTooltipId = `loan-edit-${rowData.loanApplicationID}`;

    return (
      <>
        <Tooltip target={`#${viewTooltipId}`} position="top" />
        <Button
          className="trash-icon p-0 me-2"
          id={viewTooltipId}
          data-pr-tooltip="View Loan Application"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.loanDetail}/${rowData.loanApplicationID}`,
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
        </Button>

        {!rowData.isCamReportGenerated &&
          ![LoanStatusType.DISBURSED, LoanStatusType.SANCTIONED].includes(
            rowData?.status?.statusID as LoanStatusType,
          ) && (
            <>
              <Tooltip target={`#${editTooltipId}`} position="top" />

              <Button
                id={editTooltipId}
                className="trash-icon p-0 me-2"
                data-pr-tooltip="Edit Loan Application"
                onClick={() =>
                  navigate(
                    `${RoutePathConstant.private.editLoan}/${rowData.loanApplicationID}`,
                    {
                      state: { fullName: rowData.customerName },
                    },
                  )
                }
              >
                <i className="bi bi-pencil-fill" />
              </Button>
            </>
          )}
      </>
    );
  };

  const handleCompleteApplication = async (
    rowData: ILoanApplicationData,
  ): Promise<void> => {
    if (userType === CLIENT_ROLE.CHANNEL_PARTNER) {
      setLoading(true);

      const body: IGeneratePublicTokenRequest = {
        userID: rowData.userID,
        extraToken: encryptData(extraToken()),
      };

      const response: IVerifyEmailOTPResponse =
        await fetchImpersonateUser(body);

      if (!response) return;

      if (response && response.statusCode === 200) {
        const decryptedData = {
          ...response.data,
          emailID: response.data.emailID
            ? (response.data.emailID)
            : "",
          mobileNumber: response.data.mobileNumber
            ? (response.data.mobileNumber)
            : "",
          panNumber: response.data.panNumber
            ? (response.data.panNumber)
            : "",
          gstNumber: response.data.gstNumber
            ? (response.data.gstNumber)
            : null,
        };

        dispatch(setImpersonateUser(true));

        dispatch(setUserData(decryptedData));

        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
          decryptedData.token,
        );

        handleClientDashboard(rowData);

        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }

      setLoading(false);
    } else {
      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          loanType: rowData?.loanTypeID,
          loanApp: rowData?.loanApplicationID,
        },
      });
    }
  };

  const handleClientDashboard = async (
    rowData: ILoanApplicationData,
  ): Promise<void> => {
    setLoading(true);

    const response: IClientDashboardResponse = await getClientDashboardAPI();

    const responseProfile: IUserProfileResponse = await fetchUserProfile();

    if (!response && !responseProfile) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : null,
      };

      dispatch(setCustomerInfo(decryptedData));

      const missingFields = [];

      if (IsStringNullEmptyOrUndefined(responseProfile.data.address!)) {
        missingFields.push("Address");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.state!)) {
        missingFields.push("State");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.city!)) {
        missingFields.push("City");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.zipCode!)) {
        missingFields.push("Zip Code");
      }

      if (missingFields.length > 0) {
        navigate(RoutePathConstant.private.profile);
        toastSuccess(
          `The following fields are missing: ${missingFields.join(
            ", ",
          )}. Please add them.`,
        );
      } else {
        navigate(RoutePathConstant.private.checkEligibility, {
          state: {
            loanType: rowData?.loanTypeID,
            loanApp: rowData?.loanApplicationID,
          },
        });
      }
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDownloadLoanApplication = async (): Promise<void> => {
    if (!status) return;

    setLoading(true);

    const value: ILoanApplicationParams = {
      userType: CLIENT_ROLE.CHANNEL_PARTNER,
      page: 0,
      pageSize: 0,
      userID,
      statusFilter: status,
    };

    if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
      value.search = searchText.trim();
    }

    const response: IGetAllLoanApplicationsResponse =
      await getAllLoanApplicationsAPI(value);

    if (!response) return;

    if (response && response.statusCode === 200) {
      handleDownloadCSVData(
        response.data.loanApplications,
        headersMap,
        `${getTitleByStatus(status)}`,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const getStatusOptions = (
    loanApplicationsList: ILoanApplicationData[] | undefined,
    selectedLoanApplication: string,
    availableStatusList: { name: string; code: number }[],
  ): { name: string; code: number }[] => {
    const selectedLoan = loanApplicationsList?.find(
      (loan: ILoanApplicationData) =>
        loan.loanApplicationID === selectedLoanApplication,
    );

    const currentStatus = selectedLoan?.status.label as LoanStatus;

    if (currentStatus === LoanStatus.PENDING) {
      return availableStatusList.filter((s) =>
        [LoanStatus.PENDING, LoanStatus.APPLIED].includes(
          s.name as LoanStatus,
        ),
      );
    } else if (currentStatus === LoanStatus.DISBURSED) {
      return availableStatusList.filter((s) => s.name === LoanStatus.DISBURSED);
    } else if (currentStatus === LoanStatus.SANCTIONED) {
      return availableStatusList.filter((s) =>
        [LoanStatus.SANCTIONED, LoanStatus.DISBURSED].includes(
          s.name as LoanStatus,
        ),
      );
    } else {
      return availableStatusList.filter(
        (s) => s.name !== LoanStatus.DISBURSED,
      );
    }
  };

  const handleViewComments = (comments?: string | null) => {
    setSelectedComments(comments || "-");
    setCommentsDialogVisible(true);
  };

  const shouldShowQueryRaisedFields = (): boolean => {
    return LoanStatusType.QUERY_RAISED === Number(status);
  };

  const shouldShowDisbursedFields = (): boolean => {
    return LoanStatusType.DISBURSED === Number(status);
  };

  const shouldShowSanctionedFields = (): boolean => {
    return LoanStatusType.SANCTIONED === Number(status);
  };

  const shouldShowDisbursedField = (): boolean => {
    const selectedLoan = adminInfo?.loanApplications?.find(
      (loan: ILoanApplicationData) =>
        loan.loanApplicationID === selectedLoanApplication,
    );

    const currentStatus = selectedLoan?.status.label as LoanStatus;

    return (
      LoanStatusType.DISBURSED === selectedStatus?.code &&
      currentStatus !== LoanStatus.DISBURSED
    );
  };

  const isDisbursedUpdateFlow = (): boolean => {
    return shouldShowDisbursedFields() && !shouldShowDisbursedField();
  };

  const shouldShowQueryRaiseFields = (): boolean => {
    const selectedLoan = adminInfo?.loanApplications?.find(
      (loan: ILoanApplicationData) =>
        loan.loanApplicationID === selectedLoanApplication,
    );

    const currentStatus = selectedLoan?.status.label as LoanStatus;

    return (
      LoanStatusType.QUERY_RAISED === selectedStatus?.code &&
      currentStatus !== LoanStatus.QUERY_RAISED
    );
  };

  const shouldShowSanctionFields = (): boolean => {
    const selectedLoan = adminInfo?.loanApplications?.find(
      (loan: ILoanApplicationData) =>
        loan.loanApplicationID === selectedLoanApplication,
    );

    const currentStatus = selectedLoan?.status.label as LoanStatus;

    return (
      LoanStatusType.SANCTIONED === selectedStatus?.code &&
      currentStatus !== LoanStatus.SANCTIONED
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setLoading(true);

    const files = event.target.files;

    if (!files || files.length === 0) {
      toastError("No file selected");
      setLoading(false);
      event.target.value = "";
      return;
    }

    const MAX_FILE_SIZE = environment.DOCUMENT_FILE_SIZE * 1024 * 1024;

    if (files[0].size > MAX_FILE_SIZE) {
      toastError(
        `File ${files[0].name} exceeds the ${environment.DOCUMENT_FILE_SIZE} MB limit.`,
      );
      setLoading(false);
      event.target.value = "";
      return;
    }

    const formData: FormData = new FormData();

    formData.append("file", files[0]);

    formData.append("loanApplicationID", selectedLoanApplication);

    try {
      const response: IUpdateLoanStatusResponse =
        await uploadSanctionLetterForLoanApplicationAPI(formData);

      if (!response) return;

      if (response.statusCode === 200) {
        setFormValues((prev) => ({
          ...prev,
          letterPath: typeof response.data === "string" ? response.data : "",
        }));

        setFormErrors((prev) => ({
          ...prev,
          uploadedLetter: "",
        }));

        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }

      setLoading(false);
      event.target.value = "";
    } catch (error) {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleChange = (fieldName: string, value: string): void => {
    if (fieldName === "amount") {
      // Remove non-digits
      const rawValue = value.replace(/\D/g, "");

      // Format in Indian numbering
      const formattedValue = rawValue
        ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
        : "";

      setFormValues((prev) => ({
        ...prev,
        amount: formattedValue,
      }));

      // ✅ validate using rawValue (important!)
      setFormErrors((prev) => ({
        ...prev,
        amount: rawValue
          ? ""
          : shouldShowDisbursedFields()
            ? validationMessages.disbursedAmountRequired
            : validationMessages.sanctionedAmountRequired,
      }));

      return;
    }

    // Non-amount fields
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setFormErrors((prevErrors) => {
      if (fieldName === "query") {
        return {
          ...prevErrors,
          comments: value.trim() ? "" : validationMessages.queryRequired,
        };
      }

      if (fieldName === "comments") {
        return {
          ...prevErrors,
          comments: value.trim() ? "" : validationMessages.commentsRequired,
        };
      }

      return {
        ...prevErrors,
        [fieldName]: "",
      };
    });
  };

  const handleDateOfRegistration = (date: Date | null) => {
    if (date) {
      const now = new Date();

      const updatedDate = new Date(date);

      updatedDate.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        0,
      );

      const formattedDate = moment(updatedDate).format("YYYY-MM-DD[T]HH:mm:ss");

      setFormValues((prev) => ({
        ...prev,
        dateOfRegistration: formattedDate,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        dateOfRegistration: "",
      }));
    }

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      dateOfRegistration: !date
        ? validationMessages.sanctionedDateOfRegistrationRequired
        : "",
    }));
  };

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText],
  );

  useEffect(() => {
    if (status) {
      fetchDashboardDetail();
    } else {
      fetchChannelPartnerDashboard();
      fetchSubscriptionHistory();
    }
  }, [
    status,
    isProfileUpdated,
    filterReq.pageNumber,
    filterReq.pageSize,
    filterReq.searchText,
  ]);

  useEffect(() => {
    setSearchText("");
    setFilterReq((prev) => ({
      ...prev,
      searchText: "",
      pageNumber: 0,
    }));
  }, [status]);

  useEffect(() => {
    setPanDetailPopUp(showPanDetailPopUp);
  }, [showPanDetailPopUp]);

  useEffect(() => {
    userType === CLIENT_ROLE.CHANNEL_PARTNER &&
      setShowContractAgreement(!isContractSigned);
  }, [isContractSigned]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const panel = document.querySelector(".p-dropdown-panel");
      const target = event.target as HTMLElement;

      if (panel && panel.contains(target)) {
        return;
      }

      if (dropdownRef.current) {
        dropdownRef.current.hide();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="row">
          {!status && (
            <div className="col-lg-12 mb-4">
              <div className="col-12 titleMainWrapper justify-content-between">
                <h2 className="fw-bold txt-30">
                  <span>Welcome,</span> {userName}
                </h2>
                <div
                  className="BtnRightHldr d-flex flex-row"
                  style={{ gap: "10px" }}
                >
                  {create && (
                    <div className="form-group">
                      <Button
                        className="btn btn-orange-line"
                        onClick={() =>
                          navigate(RoutePathConstant.private.addApplications)
                        }
                        disabled={!channelPartnerInfo?.isAddApplicationEnabled}
                      >
                        Add Application
                      </Button>
                    </div>
                  )}

                  {(clientMasterRight.create ||
                    sourcingPartnerRight.create) && (
                      <div className="form-group">
                        <Button
                          className="btn btn-orange"
                          icon="bi bi-plus-circle me-2"
                          iconPos="left"
                          onClick={() => {
                            if (
                              !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                              !isContractSigned &&
                              !hasSkippedContractAgreement &&
                              shouldShowContractModal(contractEnforcementDate)
                            ) {
                              setShowContractAgreement(true);
                            } else {
                              setPanDetailPopUp(true);
                            }
                          }}
                        >
                          Add Client
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {!status && channelPartnerInfo && (
            <div className="col-12 ApplicationsBoxWrapper mb-4">
              <div className="row">
                {channelPartnerInfo.totalLoanApplicationsCountByStatus.map(
                  (applicationStatus: ITotalCountByStatus) => {
                    return (
                      <div
                        key={applicationStatus.statusID}
                        className="col-lg-4 col-md-6 col-sm-6 col-12 mt-4"
                        style={{
                          cursor:
                            applicationStatus.amount > 0
                              ? "pointer"
                              : "default",
                        }}
                        onClick={() => {
                          if (applicationStatus.amount > 0) {
                            navigate(
                              `${RoutePathConstant.private.channelPartnerDashboard}?status=${applicationStatus.statusID}`,
                            );
                          }
                        }}
                      >
                        <div className="applicationBoxHldr">
                          <div className="amoutnHldr">
                            <h2 className="fw-bold">
                              {applicationStatus.noOfApplications}
                            </h2>

                            <p className="txt-20">
                              Amount: ₹
                              {applicationStatus.amount !== 0 &&
                                applicationStatus.formattedAmount
                                ? formatDecimalValue(
                                  applicationStatus.formattedAmount,
                                )
                                : "00"}
                            </p>
                          </div>

                          <h3 className="fw-bold">
                            {applicationStatus.displayName}
                          </h3>

                          {applicationStatus.amount > 0 && (
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

          {!status && channelPartnerInfo?.loanApplicationStatusGraphList && (
            <div className="col-12">
              <div className="row">
                <div className="col-lg-12 mt-4">
                  <div className="titleMainWrapper">
                    <h2 className="fw-bold">Application Status</h2>
                  </div>

                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chartData}
                  />
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="col-12">
              <div className="titleLinkMain mb-4 d-flex justify-content-between">
                <TableTitle title={getTitleByStatus(status)} />
                <div className="BtnRightHldr">
                  <div className="col-12 d-flex gap-3 align-items-center">
                    <SearchButton
                      searchText={searchText}
                      setSearchText={setSearchText}
                      placeholder="Search by Client"
                    />
                    <Button
                      className="btn btn-orange"
                      onClick={() => handleDownloadLoanApplication()}
                      disabled={
                        adminInfo?.loanApplications.length === 0 || !create
                      }
                    >
                      <i className="bi bi-download me-2" /> Download Loan
                      Application
                    </Button>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <DataTable
                  key={clickCounter}
                  className="tableMain"
                  value={adminInfo?.loanApplications}
                  emptyMessage="No Application Found"
                >
                  <Column field="loanApplicationCode" header="Code" />

                  <Column
                    body={(rowData: ILoanApplicationData) => {
                      const tooltipId = `tooltip-${rowData.loanApplicationID}`;

                      const style: React.CSSProperties = {
                        cursor: "pointer",
                        fontWeight: "bold",
                      };
                      return (
                        <>
                          <Tooltip target=".customer-name-tooltip" />
                          <span
                            className="customer-name-tooltip"
                            id={tooltipId}
                            data-pr-tooltip="Login as a client"
                            style={style}
                            onClick={() => {
                              if (
                                !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                                !isContractSigned &&
                                !hasSkippedContractAgreement &&
                                shouldShowContractModal(contractEnforcementDate)
                              ) {
                                setShowContractAgreement(true);
                              } else {
                                if (showPanDetailPopUp) {
                                  setPanDetailPopUp(true);
                                } else {
                                  handleCompleteApplication(rowData);
                                }
                              }
                            }}
                          >
                            {rowData.customerName}
                          </span>
                        </>
                      );
                    }}
                    header="Client Name"
                  />

                  <Column
                    body={(rowData: ILoanApplicationData) =>
                      rowData?.loanType || "-"
                    }
                    header="Loan Type"
                  />

                  <Column
                    body={(rowData) => formatDate(rowData.date, "DD MMM, YYYY")}
                    header="Applied Date"
                  />

                  <Column
                    body={(rowData: ILoanApplicationData) =>
                      formatCurrencyAmount(rowData.loanAmount)
                    }
                    header="Loan Amount"
                  />

                  {(shouldShowDisbursedFields() ||
                    shouldShowSanctionedFields()) && (
                      <Column
                        body={(rowData: ILoanApplicationData) =>
                          rowData.sanctionedLoanAmount
                            ? formatCurrencyAmount(rowData.sanctionedLoanAmount)
                            : "-"
                        }
                        header="Sanctioned"
                      />
                    )}

                  {shouldShowQueryRaisedFields() && (
                    <Column
                      header="Query Raised"
                      body={(rowData: ILoanApplicationData) => {
                        if (!rowData.raisedQuery) {
                          return <span>-</span>;
                        }

                        return (
                          <Button
                            className="resendBtn p-button-link p-0"
                            label="View Query"
                            onClick={() => handleViewComments(rowData.raisedQuery)}
                          />
                        );
                      }}
                    />
                  )}

                  {(shouldShowDisbursedField() || shouldShowDisbursedFields() || shouldShowSanctionedFields() || shouldShowSanctionFields()) && (
                    <Column
                      header="Comments"
                      body={(rowData: ILoanApplicationData) => {
                        if (!rowData.comments) {
                          return <span>-</span>;
                        }

                        return (
                          <Button
                            className="resendBtn p-button-link p-0"
                            label="View Comments"
                            onClick={() => handleViewComments(rowData.comments)}
                          />
                        );
                      }}
                    />
                  )}

                  {shouldShowDisbursedFields() && (
                    <Column
                      header="Disbursed"
                      body={(rowData: ILoanApplicationData) => {
                        const amount = rowData.disbursedLoanAmount;

                        return (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>
                              {amount ? formatCurrencyAmount(amount) : "-"}
                            </span>

                            {amount && (
                              <i
                                className="bi bi-info-circle palette-info-icon"
                                style={{ cursor: "pointer" }}
                                title="Re-disburse this loan application"
                                onClick={() => {
                                  setSelectedLoanApplication(
                                    rowData.loanApplicationID,
                                  );

                                  setLoanApplicationPopUpDetails({
                                    clientName: rowData.customerName,
                                    loanType: rowData.loanType || "",
                                  });

                                  setChangeStatus(true);

                                  setSelectedStatus({
                                    name: rowData.status.label,
                                    code: rowData.status.statusID || 0,
                                  });

                                  if (
                                    status === String(LoanStatusType.DISBURSED)
                                  ) {
                                    fetchLoanDetailApi(
                                      rowData.loanApplicationID,
                                    );
                                  }
                                }}
                              />
                            )}
                          </div>
                        );
                      }}
                    />
                  )}

                  <Column body={progressAction} header="Progress" />

                  <Column body={statusBody} header="Status" />

                  <Column body={actionBody} header="Action" />
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
                  <Button
                    className="btn btn-black-line text-center"
                    onClick={() =>
                      navigate(
                        RoutePathConstant.private.channelPartnerDashboard,
                      )
                    }
                    label="Back"
                  />
                </div>
              )}
            </div>
          )}

          <AddPanModal
            panDetailPopUp={panDetailPopUp}
            setPanDetailPopUp={setPanDetailPopUp}
            showPartnerOption={showPanDetailPopUp === false}
            targetUser={CLIENT_ROLE.CUSTOMER}
          />

          {showContractAgreement &&
            shouldShowContractModal(contractEnforcementDate) && (
              <ContractAgreementModal
                showContractAgreement={
                  showContractAgreement &&
                  shouldShowContractModal(contractEnforcementDate)
                }
                setShowContractAgreement={(value) => {
                  if (!value) {
                    setHasSkippedContractAgreement(true);
                    setClickCounter((prev) => prev + 1);
                  }
                  setShowContractAgreement(value);
                }}
              />
            )}
        </div>

        <Dialog
          header={`${loanApplicationPopUpDetails?.clientName}${loanApplicationPopUpDetails?.loanType
            ? ` - ${loanApplicationPopUpDetails.loanType}`
            : ""
            }`}
          visible={changeStatus}
          onHide={handleReset}
          modal
          draggable={false}
          resizable={false}
          footer={footerContent}
          blockScroll
          className="modalWrapper responsive-dialog"
        >
          <>
            <Loader isLoading={loading} />

            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="form-label small" htmlFor="updateStatus">
                      Update Loan Application Status<sup>*</sup>
                    </label>

                    <div className="form-group">
                      {status === String(LoanStatusType.DISBURSED) ? (
                        <>
                          <InputText
                            id="category"
                            value={selectedStatus?.name}
                            className="form-control text-capitalize"
                            disabled
                          />
                        </>
                      ) : (
                        <Dropdown
                          ref={dropdownRef}
                          value={selectedStatus}
                          placeholder="Select a Status"
                          onChange={(e) => {
                            setSelectedStatus(e.value);
                            setStatusError("");
                            setFormValues({
                              dateOfRegistration: "",
                              amount: "",
                              uploadedLetter: null,
                              letterPath: "",
                              comments: "",
                              query: "",
                            });

                            setFormErrors({
                              dateOfRegistration: "",
                              amount: "",
                              uploadedLetter: "",
                              comments: "",
                            });
                          }}
                          options={getStatusOptions(
                            adminInfo?.loanApplications,
                            selectedLoanApplication,
                            statusList,
                          )}
                          optionLabel="name"
                          showClear
                        />
                      )}

                      {statusError && (
                        <small className="text-danger">{statusError}</small>
                      )}

                      {shouldShowQueryRaiseFields() && (
                        <>
                          <div className="mt-3">
                            <label className="form-label small">
                              Query<sup>*</sup>
                            </label>

                            <textarea
                              name="query"
                              className="form-control"
                              rows={3}
                              maxLength={150}
                              placeholder="Enter query"
                              value={formValues.query || ""}
                              onChange={(e) =>
                                handleChange(
                                  e.target.name,
                                  e.target.value.trimStart(),
                                )
                              }
                            />

                            {formErrors.comments && (
                              <small className="text-danger">
                                {formErrors.comments}
                              </small>
                            )}
                          </div>
                        </>
                      )}

                      {shouldShowSanctionFields() && (
                        <>
                          {/* Sanction Date */}
                          <div className="mt-3">
                            <label className="form-label small">
                              Sanction Date<sup>*</sup>
                            </label>

                            <Calendar
                              name="dateOfRegistration"
                              value={
                                formValues?.dateOfRegistration
                                  ? new Date(formValues?.dateOfRegistration)
                                  : null
                              }
                              onChange={(e) =>
                                handleDateOfRegistration(e.value as Date | null)
                              }
                              placeholder="Select Date"
                              dateFormat="dd/mm/yy"
                              className="w-100"
                              maxDate={new Date()}
                              showButtonBar
                              hourFormat="24"
                              showSeconds // 👈 ADD THIS
                              stepMinute={1} // 👈 ensures proper time selection
                            />

                            {formErrors.dateOfRegistration && (
                              <small className="text-danger">
                                {formErrors.dateOfRegistration}
                              </small>
                            )}
                          </div>

                          {/* Sanction Amount */}
                          <div className="form-group mt-3">
                            <label className="form-label small">
                              Sanction Amount<sup>*</sup>
                            </label>

                            <div className="form-group search">
                              <i className="bi bi-currency-rupee" />
                              <InputText
                                name="amount"
                                value={formValues?.amount || ""}
                                maxLength={15}
                                onChange={(e) =>
                                  handleChange(
                                    e.target.name,
                                    e.target.value.toUpperCase().trim(),
                                  )
                                }
                                onKeyPress={(e) =>
                                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                }
                                placeholder="Enter Amount"
                                className="form-control"
                              />
                            </div>

                            {formErrors.amount && (
                              <small className="text-danger">
                                {formErrors.amount}
                              </small>
                            )}
                          </div>

                          {/* Upload Sanction Letter */}
                          <div className="mt-3">
                            <label className="form-label small">
                              Upload Sanction Letter<sup>*</sup>
                            </label>

                            <div
                              className={`upload-container sanction-upload-box p-3 text-center ${formErrors.uploadedLetter ? "has-error" : ""
                                }`}
                              onClick={() =>
                                document
                                  .getElementById("uploadedLetter")
                                  ?.click()
                              }
                            >
                              <input
                                type="file"
                                id="uploadedLetter"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="d-none"
                              />

                              {formValues?.letterPath ? (
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <i
                                    className="bi bi-file-pdf-fill text-danger"
                                    style={{ fontSize: "24px" }}
                                  />
                                  <div className="text-start">
                                    <p className="mb-0 fw-semibold text-dark">
                                      File Uploaded Successfully
                                    </p>
                                    <small className="text-muted">
                                      {formValues?.uploadedLetter?.size
                                        ? `${(
                                          formValues.uploadedLetter.size /
                                          1024
                                        ).toFixed(2)} KB`
                                        : "PDF Document"}
                                    </small>
                                  </div>
                                  <Button
                                    icon="bi bi-x-circle-fill"
                                    className="p-button-rounded p-button-text p-button-danger ms-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChange("uploadedLetter", "");
                                      handleChange("letterPath", "");
                                    }}
                                    style={{ padding: "0.25rem" }}
                                  />
                                </div>
                              ) : (
                                <>
                                  <i
                                    className="bi bi-cloud-upload sanction-upload-icon"
                                  />
                                  <p className="mb-1 mt-2 fw-semibold">
                                    Click to upload sanction letter
                                  </p>
                                  <small className="text-muted">
                                    PDF files only (Max 5MB)
                                  </small>
                                </>
                              )}
                            </div>

                            {formErrors.uploadedLetter && (
                              <small className="text-danger d-block mt-2">
                                {formErrors.uploadedLetter}
                              </small>
                            )}
                          </div>

                          <div className="mt-3">
                            <label className="form-label small">
                              Comments<sup>*</sup>
                            </label>

                            <textarea
                              name="comments"
                              className="form-control"
                              rows={3}
                              maxLength={150}
                              placeholder="Enter comments"
                              value={formValues.comments || ""}
                              onChange={(e) =>
                                handleChange(
                                  e.target.name,
                                  e.target.value.trimStart(),
                                )
                              }
                            />

                            {formErrors.comments && (
                              <small className="text-danger">
                                {formErrors.comments}
                              </small>
                            )}
                          </div>
                        </>
                      )}

                      {(shouldShowDisbursedFields() ||
                        shouldShowDisbursedField()) && (
                          <>
                            {/* Disbursed Date */}
                            <div className="mt-3">
                              <label className="form-label small">
                                Disbursed Date<sup>*</sup>
                              </label>

                              <Calendar
                                name="dateOfRegistration"
                                value={
                                  formValues?.dateOfRegistration
                                    ? new Date(formValues?.dateOfRegistration)
                                    : null
                                }
                                onChange={(e) =>
                                  handleDateOfRegistration(e.value as Date | null)
                                }
                                placeholder="Select Date"
                                dateFormat="dd/mm/yy"
                                className="w-100"
                                maxDate={new Date()}
                                showButtonBar
                                showSeconds // 👈 ADD THIS
                                stepMinute={1} // 👈 ensures proper time selection
                                hourFormat="24"
                              />

                              {formErrors.dateOfRegistration && (
                                <small className="text-danger">
                                  {formErrors.dateOfRegistration}
                                </small>
                              )}
                            </div>

                            {/* Disbursed Amount */}
                            <div className="form-group mt-3">
                              <label className="form-label small">
                                Disbursed Amount<sup>*</sup>
                              </label>

                              <div className="form-group search">
                                <i className="bi bi-currency-rupee" />
                                <InputText
                                  name="amount"
                                  value={formValues?.amount || ""}
                                  maxLength={15}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.name,
                                      e.target.value.toUpperCase().trim(),
                                    )
                                  }
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                  }
                                  placeholder="Enter Amount"
                                  className="form-control"
                                />
                              </div>

                              {formErrors.amount && (
                                <small className="text-danger">
                                  {formErrors.amount}
                                </small>
                              )}
                            </div>

                            {/* Comments */}
                            <div className="mt-3">
                              <label className="form-label small">
                                Comments<sup>*</sup>
                              </label>

                              <textarea
                                name="comments"
                                className="form-control"
                                rows={3}
                                placeholder="Enter comments"
                                value={formValues.comments || ""}
                                maxLength={150}
                                onChange={(e) =>
                                  handleChange(
                                    e.target.name,
                                    e.target.value.trimStart(),
                                  )
                                }
                              />

                              {formErrors.comments && (
                                <small className="text-danger">
                                  {formErrors.comments}
                                </small>
                              )}
                            </div>

                            {/* Disbursement History */}
                            {disbursementHistoryDetails?.length > 0 && (
                              <div className="mt-4">
                                <h6 className="mb-3">Disbursement History</h6>

                                <div className="table-responsive-wrapper">
                                  <div className="custom-table">
                                    {/* Header */}
                                    <div className="custom-table-header">
                                      <div className="table-row">
                                        <div className="table-col">Date</div>
                                        <div className="table-col">Amount</div>
                                        <div className="table-col">Comments</div>
                                      </div>
                                    </div>

                                    {/* Body */}
                                    {disbursementHistoryDetails.map(
                                      (item: any, index: number) => (
                                        <div
                                          key={index}
                                          className={`custom-table-row ${index !==
                                            disbursementHistoryDetails.length - 1
                                            ? "border-bottom"
                                            : ""
                                            }`}
                                        >
                                          <div className="table-row">
                                            <div className="table-col">
                                              {item.loanDisbursedDate
                                                ? formatDate(
                                                  item.loanDisbursedDate,
                                                  "DD MMM, YYYY",
                                                )
                                                : "-"}
                                            </div>

                                            <div className="table-col">
                                              ₹{" "}
                                              {Number(
                                                item.disbursedAmount || 0,
                                              ).toLocaleString("en-IN")}
                                            </div>

                                            <div className="table-col">
                                              {item.loanDisbursementComment ||
                                                "-"}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </Dialog>

        {status &&
          <Dialog
            header={status === LoanStatusType.QUERY_RAISED.toString() ? "Raised Query" : "Comments"}
            visible={commentsDialogVisible}
            onHide={() => {
              setCommentsDialogVisible(false);
              setSelectedComments("");
            }}
            modal
            draggable={false}
            resizable={false}
            blockScroll
            className="modalWrapper responsive-dialog"
            style={{ width: "550px" }}
            footer={() => (
              <Button
                label="Close"
                className="btn btn-orange"
                onClick={() => {
                  setCommentsDialogVisible(false);
                  setSelectedComments("");
                }}
              />
            )}
          >
            <p className="mb-0 text-break" style={{ whiteSpace: "pre-wrap" }}>
              {selectedComments}
            </p>
          </Dialog>
        }
      </div>
    </>
  );
};

export default ChannelPartnerDashboard;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchImpersonateUser,
  fetchUserProfile,
  getClientDashboardAPI,
  getClientDetailAPI,
  getLoanDetailAPI,
  updateLoanApplicationStatusAPI,
  uploadSanctionLetterForLoanApplicationAPI,
} from "../../utils/axios/apiServices";
import {
  IClientData,
  IClientPartnerParams,
  IClientResponse,
  ILoanApplicationData,
} from "../../interface/client";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
  RouteParams,
  statusList,
} from "../../utils/constants/constant";
import {
  extraToken,
  formatDate,
  handleDownloadCSVData,
  restrictInputByPattern,
  shouldShowContractModal,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { ProgressBar } from "primereact/progressbar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import {
  ILoanParams,
  ILoanResponse,
  IUpdateLoanStatus,
  IUpdateLoanStatusResponse,
} from "../../interface/loanDetail";
import TableTitle from "../../components/TableTitle";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import AddPanModal from "../../components/AddPanModal";
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
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import moment from "moment";
import { InputText } from "primereact/inputtext";
import { NUMBER_ONLY_PATTERN } from "../../utils/constants/pattern";
import { Calendar } from "primereact/calendar";
import { validationMessages } from "../../utils/constants/messages";
import { environment } from "../../utils/constants/environments";
import { Tooltip } from "primereact/tooltip";

const ClientDetail = () => {
  const [clientDetail, setClientDetail] = useState<IClientData>();

  const [selectedLoanApplication, setSelectedLoanApplication] =
    useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [changeStatus, setChangeStatus] = useState<boolean>(false);

  const [selectedStatus, setSelectedStatus] = useState<{
    name: string;
    code: number;
  } | null>(null);

  const [statusError, setStatusError] = useState<string>("");

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

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

  const navigate = useNavigate();

  const { id } = useParams<RouteParams>();

  const { view } = usePermission("ClientMaster", ["view"])();

  const dispatch = useDispatch();

  const {
    userType,
    isContractSigned,
    showPanDetailPopUp,
    contractEnforcementDate,
  } = useSelector((state: RootState) => state.user.user);

  const headersMap: Record<string, string> = {
    "Loan Application Code": "loanApplicationCode",
    "Customer Name": "customerName",
    "Loan Type": "loanType",
    Date: "date",
  };

  const fetchClientDetailApi = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const params: IClientPartnerParams = {
      userID: id,
    };

    const response: IClientResponse = await getClientDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setClientDetail(response.data);
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

  const progressAction = (loanApplication: ILoanApplicationData) => {
    return (
      <>
        <p>{loanApplication.progressPercent}% Completed</p>
        <ProgressBar
          style={{ height: "6px" }}
          value={loanApplication.progressPercent}
          showValue={false}
        />
      </>
    );
  };

  const actionBody = (rowData: ILoanApplicationData): JSX.Element => {
    const viewId = `loan-view-${rowData.loanApplicationID}`;
    const eligibilityId = `loan-eligibility-${rowData.loanApplicationID}`;
    const editTooltipId = `loan-edit-${rowData.loanApplicationID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${eligibilityId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View Loan Application"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.loanDetail}/${rowData.loanApplicationID}`,
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" />
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

        {(userType === CLIENT_ROLE.CHANNEL_PARTNER ||
          userType === CLIENT_ROLE.USER_MANAGEMENT) &&
          rowData.status.statusID === LoanStatusType.PENDING && (
            <Button
              id={eligibilityId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Check Eligibility"
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
                    handleCompleteApplication(
                      id!,
                      rowData.loanTypeID,
                      rowData.loanApplicationID,
                    );
                  }
                }
              }}
            >
              <i className="bi bi-list-check" />
            </Button>
          )}
      </>
    );
  };

  const handleReset = (): void => {
    setSelectedStatus(null);
    setChangeStatus(false);
    setSelectedLoanApplication("");
    setDisbursementHistoryDetails([]);
  };

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

  const statusBody = (rowData: ILoanApplicationData) => {
    const isClickable =
      userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userType === CLIENT_ROLE.USER_MANAGEMENT;

    const statusId = `loan-status-${rowData.loanApplicationID}`;

    return (
      <>
        <Tooltip target={`#${statusId}`} position="top" />

        <Button
          id={statusId}
          className="trash-icon p-0 ms-2"
          onClick={() => {
            if (isClickable) {
              setSelectedLoanApplication(rowData.loanApplicationID);
              setChangeStatus(true);

              setSelectedStatus({
                name: rowData.status.label,
                code: rowData.status.statusID || 0,
              });

              if (rowData.status.statusID === LoanStatusType.DISBURSED) {
                fetchLoanDetailApi(rowData.loanApplicationID);
              }
            }
          }}
          data-pr-tooltip={isClickable ? "Change Loan Status" : ""}
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
      setStatusError("Please select any one option");
      return;
    }

    if (!selectedStatus || selectedLoanApplication === "") return;

    // ✅ SANCTION VALIDATION
    if (shouldShowSanctionFields()) {
      const isValid = validateSanctionForm();
      if (!isValid) return;
    }

    // ✅ QUERY RAISED VALIDATION
    if (shouldShowQueryRaiseFields()) {
      const isValid = validateQueryRaisedForm();
      if (!isValid) return;
    }

    // ✅ DISBURSED VALIDATION
    if (shouldShowDisbursedFields()) {
      const isValid = validateDisbursedForm();
      if (!isValid) return;
    }

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

    if (shouldShowDisbursedFields()) {
      body.disbursedDate = formValues.dateOfRegistration;
      body.disbursedAmount = formValues.amount.replace(/,/g, "");
    }

    try {
      const response: IUpdateLoanStatusResponse =
        await updateLoanApplicationStatusAPI(body);

      if (!response) return;

      if (response && response.statusCode === 200) {
        handleReset();

        fetchClientDetailApi();

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

  const handleCompleteApplication = async (
    userId: string,
    loanType: number,
    loanApp: string,
  ): Promise<void> => {
    if (
      userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userType === CLIENT_ROLE.USER_MANAGEMENT
    ) {
      setLoading(true);

      const body: IGeneratePublicTokenRequest = {
        userID: userId,
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

        handleClientDashboard(loanApp, loanType);

        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }

      setLoading(false);
    } else {
      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          loanType,
          loanApp,
        },
      });
    }
  };

  const handleClientDashboard = async (
    loanApp: string,
    loanType: number,
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
            loanType,
            loanApp,
          },
        });
      }
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDownloadLoanApplication = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const params: IClientPartnerParams = {
      userID: id,
    };

    const response: IClientResponse = await getClientDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      handleDownloadCSVData(
        response.data.loanApplicationsList,
        headersMap,
        `Loan Applications_${moment().format("YYYY-MM-DD")}`,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const getStatusOptions = (
    clientDetail: IClientData | undefined,
    selectedLoanApplication: string,
    availableStatusList: { name: string; code: number }[],
  ): { name: string; code: number }[] => {
    const selectedLoan = clientDetail?.loanApplicationsList?.find(
      (loan) => loan.loanApplicationID === selectedLoanApplication,
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

  const shouldShowDisbursedFields = (): boolean => {
    return LoanStatusType.DISBURSED === Number(selectedStatus?.code);
  };

  const shouldShowQueryRaiseFields = (): boolean => {
    const selectedLoan = clientDetail?.loanApplicationsList?.find(
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
    const selectedLoan = clientDetail?.loanApplicationsList?.find(
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
      // remove all non-digits
      const rawValue = value.replace(/\D/g, "");

      // format using Indian number system
      const formattedValue = rawValue
        ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
        : "";

      setFormValues((prev) => ({
        ...prev,
        amount: formattedValue,
      }));

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

  const validateSanctionForm = (): boolean => {
    const errors: any = {};

    if (!formValues.dateOfRegistration) {
      errors.dateOfRegistration = validationMessages.sanctionedDateRequired;
    }

    if (!formValues.amount) {
      errors.amount = validationMessages.sanctionedAmountRequired;
    }

    if (!formValues.letterPath) {
      errors.uploadedLetter = validationMessages.sanctionedLetterRequired;
    }

    if (!formValues.comments?.trim()) {
      errors.comments = validationMessages.commentsRequired;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));

    return Object.keys(errors).length === 0;
  };

  const validateDisbursedForm = (): boolean => {
    const errors: any = {};

    if (!formValues.dateOfRegistration) {
      errors.dateOfRegistration = validationMessages.disbursedDateRequired;
    }

    if (!formValues.amount) {
      errors.amount = validationMessages.disbursedAmountRequired;
    }

    if (!formValues.comments?.trim()) {
      errors.comments = validationMessages.commentsRequired;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));

    return Object.keys(errors).length === 0;
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

    setFormErrors((prev) => ({
      ...prev,
      dateOfRegistration: !date
        ? shouldShowDisbursedFields()
          ? validationMessages.disbursedDateRequired
          : validationMessages.sanctionedDateRequired
        : "",
    }));
  };

  useEffect(() => {
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
  }, [selectedStatus]);

  useEffect(() => {
    fetchClientDetailApi();
  }, [id]);

  return (
    <div className="row">
      <Loader isLoading={loading} />

      <div className="col-lg-12 col-md-12 col-sm-12 col-12">
        <div className="whiteBoxHldr p-30">
          <div className="row">
            <div className="col-12">
              <TableTitle
                title={`Client Information - ${clientDetail?.clientName ? clientDetail?.clientName : ""
                  }`}
              />

              <div className="row">
                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Client Code</b>
                        <p className="text-break">{clientDetail?.clientCode}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Client Name</b>
                        <p className="text-break">{clientDetail?.clientName}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Mobile Number</b>
                        <p className="text-break">
                          {formatMobileNumber(clientDetail?.mobileNumber)}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Email</b>

                        <p className="text-break">{clientDetail?.email}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Channel Partner</b>
                        <p className="text-break">
                          {clientDetail?.channelPartner}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>PAN Number</b>
                        <p className="text-break">{clientDetail?.panNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="txt-24 mb-3 mt-4 fw-bold">
                    Loan Applications
                  </h2>
                  <Button
                    className="btn btn-orange"
                    onClick={() => handleDownloadLoanApplication()}
                    disabled={clientDetail?.loanApplicationsList?.length === 0}
                  >
                    <i className="bi bi-download me-2" /> Download Loan
                    Application
                  </Button>
                </div>

                <div className="col-12">
                  <div className="whiteBoxHldr">
                    <div className="table-responsive">
                      <DataTable
                        key={clickCounter}
                        className="tableMain"
                        value={clientDetail?.loanApplicationsList}
                        emptyMessage="No Application Found"
                      >
                        <Column field="loanApplicationCode" header="Code" />

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
                          header="Applied Date"
                        />

                        <Column
                          body={(rowData: ILoanApplicationData) =>
                            formatCurrencyAmount(rowData.loanAmount)
                          }
                          header="Loan Amount"
                        />

                        <Column
                          body={(rowData: ILoanApplicationData) =>
                            rowData.sanctionedLoanAmount
                              ? formatCurrencyAmount(
                                rowData.sanctionedLoanAmount,
                              )
                              : "-"
                          }
                          header="Sanctioned"
                        />

                        <Column
                          body={(rowData: ILoanApplicationData) =>
                            rowData.disbursedLoanAmount
                              ? formatCurrencyAmount(
                                rowData.disbursedLoanAmount,
                              )
                              : "-"
                          }
                          header="Disbursed"
                        />

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

                        <Column body={progressAction} header="Progress" />

                        <Column body={statusBody} header="Status" />

                        {view && <Column body={actionBody} header="Action" />}
                      </DataTable>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-4">
                  <BackButton />
                </div>

                <Dialog
                  header="Update Status"
                  visible={changeStatus}
                  onHide={handleReset}
                  modal
                  draggable={false}
                  resizable={false}
                  footer={footerContent}
                  className="modalWrapper responsive-dialog"
                  blockScroll
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-body">
                        <div className="form-group mb-3">
                          <label
                            className="form-label small"
                            htmlFor="updateStatus"
                          >
                            Update Loan Application Status<sup>*</sup>
                          </label>

                          <div className="form-group">
                            <Dropdown
                              value={selectedStatus}
                              placeholder="Select a Status"
                              onChange={(e) => {
                                setSelectedStatus(e.value);
                                setStatusError("");
                              }}
                              options={getStatusOptions(
                                clientDetail,
                                selectedLoanApplication,
                                statusList,
                              )}
                              optionLabel="name"
                              showClear
                            />

                            {statusError && (
                              <small className="text-danger">
                                {statusError}
                              </small>
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
                                        ? new Date(
                                          formValues?.dateOfRegistration,
                                        )
                                        : null
                                    }
                                    onChange={(e) =>
                                      handleDateOfRegistration(
                                        e.value as Date | null,
                                      )
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
                                      onChange={(e) =>
                                        handleChange(
                                          e.target.name,
                                          e.target.value.toUpperCase().trim(),
                                        )
                                      }
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
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
                                    className={`upload-container sanction-upload-box p-3 text-center ${formErrors.uploadedLetter
                                        ? "has-error"
                                        : ""
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
                                                formValues.uploadedLetter
                                                  .size / 1024
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

                            {shouldShowDisbursedFields() && (
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
                                        ? new Date(
                                          formValues?.dateOfRegistration,
                                        )
                                        : null
                                    }
                                    onChange={(e) =>
                                      handleDateOfRegistration(
                                        e.value as Date | null,
                                      )
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
                                      onChange={(e) =>
                                        handleChange(
                                          e.target.name,
                                          e.target.value.toUpperCase().trim(),
                                        )
                                      }
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
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
                                    <h6 className="mb-3">
                                      Disbursement History
                                    </h6>

                                    <div className="table-responsive-wrapper">
                                      <div className="custom-table">
                                        {/* Header */}
                                        <div className="custom-table-header">
                                          <div className="table-row">
                                            <div className="table-col">
                                              Date
                                            </div>
                                            <div className="table-col">
                                              Amount
                                            </div>
                                            <div className="table-col">
                                              Comments
                                            </div>
                                          </div>
                                        </div>

                                        {/* Body */}
                                        {disbursementHistoryDetails.map(
                                          (item: any, index: number) => (
                                            <div
                                              key={index}
                                              className={`custom-table-row ${index !==
                                                disbursementHistoryDetails.length -
                                                1
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
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {panDetailPopUp && (
        <AddPanModal
          panDetailPopUp={panDetailPopUp}
          setPanDetailPopUp={setPanDetailPopUp}
          showPartnerOption={
            String(showPanDetailPopUp) === "true" ? false : true
          }
          targetUser={CLIENT_ROLE.CUSTOMER}
        />
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
                setHasSkippedContractAgreement(true);
                setClickCounter((prev) => prev + 1);
              }
              setShowContractAgreement(value);
            }}
          />
        )}

      <Dialog
        header="Comments"
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
      >
        <p className="mb-0 text-break" style={{ whiteSpace: "pre-wrap" }}>
          {selectedComments}
        </p>
      </Dialog>
    </div>
  );
};

export default ClientDetail;

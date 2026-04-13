import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BackButton from "../../components/BackButton";
import { Dialog } from "primereact/dialog";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { InputText } from "primereact/inputtext";
import {
  generateGstReportAPI,
  getGstDetailsAPI,
  getGstReportGenerateOtpAPI,
  getGstReportVerifyOtpAPI,
  updateGstDetailsAPI,
  validateGstReportGenerationAPI,
  getGstReportGenerateOtpUsingLinkAPI,
  getGstReportViaPasswordUsingLinkAPI,
  getGstReportForLinkApproachAPI,
} from "../../utils/axios/apiServices";
import {
  formatTime,
  getFetchEligibilityStatus,
  handleFileDownload,
  restrictInputByPattern,
  showGlobalReportModal,
  toastError,
  toastErrorWithExtraTime,
  toastSuccess,
} from "../../utils/functions/shared";
import {
  IExternalReportResponse,
  IGenerateGstReportUsingLinkBodyForOTP,
  IGenerateGstReportUsingLinkBodyForPassword,
  IGSTDetail,
  IGSTReportData,
  IGSTReportResponse,
} from "../../interface/reports";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import TableTitle from "../../components/TableTitle";
import moment from "moment";
import { IGSTListInfo } from "../../interface/userData";
import {
  GST_NUMBER_PATTERN,
  NUMBER,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import {
  IGSTCredentials,
  IGSTGenerateOTPBody,
  IGSTGenerateOTPResponse,
  IGSTValidateReportBody,
  IGSTVerifyOTPBody,
} from "../../interface/checkEligibility";
import {
  GST_REPORT_NORMAL_ERROR,
  GST_REPORT_TECHNICAL_ERROR,
} from "../../utils/constants/constant";
import {
  OTPType,
  ReportSuccessType,
  ReportType,
  StorageKeyEnum,
} from "../../utils/constants/enum";
import { Link, useNavigate } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import ModalLoader from "../../components/ModalLoader";
import { validationMessages } from "../../utils/constants/messages";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import { RadioButton } from "primereact/radiobutton";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { setUserData } from "../../store/reducer/userSlice";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { useDispatch } from "react-redux";
import CreditNotAvailable from "../../components/CreditNotAvailable";
import ReFetchModal from "../../components/ReFetchModal";
import { Tooltip } from "primereact/tooltip";

const GstReport = () => {
  const [gstInfo, setGstInfo] = useState<IGSTReportData>();

  const [selectedGstNumbers, setSelectedGstNumbers] = useState<string[]>([]);

  const [currentGstIndex, setCurrentGstIndex] = useState<number>(0);

  const [gstCredentials, setGstCredentials] = useState<IGSTCredentials[]>([]);

  const [gstUserName, setGstUserName] = useState<string>("");

  const [gstUserNameError, setGstUserNameError] = useState<string>(
    validationMessages.gstUserNameRequired,
  );

  const [otp, setOtp] = useState<string>("");

  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [showGSTReports, setShowGSTReports] = useState<boolean>(false);

  const [showGstSelection, setShowGstSelection] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [showSpecialPopup, setShowSpecialPopup] = useState<boolean>(false);

  const [addGSTNumber, setAddGSTNumber] = useState<boolean>(false);

  const [gstSelectionError, setGstSelectionError] = useState<string>("");

  const [resendTimer, setResendTimer] = useState<number>(0);

  const [canResend, setCanResend] = useState<boolean>(false);

  const [showMethodSelection, setShowMethodSelection] =
    useState<boolean>(false);

  const [selectedMethod, setSelectedMethod] = useState<string>(""); // "manual" or "sharelink"

  const [showShareLinkOptions, setShowShareLinkOptions] =
    useState<boolean>(false);

  const [shareLinkMethod, setShareLinkMethod] = useState<string>(""); // "otp" or "password"

  const [email, setEmail] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");

  const [referenceId, setReferenceId] = useState<string>("");

  const [emailList, setEmailList] = useState<string[]>([]);

  const [emailListErrors, setEmailListErrors] = useState<string[]>([]);

  const [showCreditPopup, setShowCreditPopup] = useState(false);

  const [formValues, setFormValues] = useState<IGSTListInfo>({
    gstNumber: "",
    gstAddress: "",
    dateOfRegistration: "",
    tradeName: "",
    cinOrLlp: "",
  });

  const [formErrors, setFormErrors] = useState<IGSTListInfo>({
    gstNumber: "",
    gstAddress: "",
    dateOfRegistration: "",
    tradeName: "",
    cinOrLlp: "",
  });

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const [gstMessage, setGstMessage] = useState<string>("");

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const { count } = useSelector((state: RootState) => state.count);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleImpersonateLogout = (): void => {
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

  const getGstNumbersArray = () => {
    if (gstInfo?.gstList.length === 1)
      return gstInfo?.gstList.map((gst) => decryptVAPTData(gst.gstNo));

    return gstInfo?.gstList.map((gst) => decryptVAPTData(gst.gstNo));
  };

  const toggleSelectedGst = (gstNumber: string): void => {
    setSelectedGstNumbers((prev) =>
      prev.includes(gstNumber)
        ? prev.filter((gst) => gst !== gstNumber)
        : [...prev, gstNumber],
    );
    setGstSelectionError("");
  };

  const startResendTimer = () => {
    setResendTimer(120);
    setCanResend(false);
  };

  const fetchGSTReport = async (): Promise<void> => {
    setLoading(true);

    const response: IGSTReportResponse = await getGstDetailsAPI();

    if (!response) return;

    if (response && response?.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : "",
      };

      setGstInfo(decryptedData);
    }
    setLoading(false);
  };

  const handleReset = (): void => {
    setShowGSTReports(false);
    setShowGstSelection(true);
    setSelectedGstNumbers([]);
    setCurrentGstIndex(0);
    setGstCredentials([]);
    setGstUserName("");
    setGstUserNameError(validationMessages.gstUserNameRequired);
    setOtp("");
    setShowOTP(false);
    setIsFormSubmitted(false);
    setLoading(false);
    setShowNormalError("");
    setGstSelectionError("");
    setAddGSTNumber(false);
    setResendTimer(0);
    setCanResend(false);
    setShowMethodSelection(false);
    setSelectedMethod("");
    setShowShareLinkOptions(false);
    setShareLinkMethod("");
    setEmail("");
    setEmailError("");
    setReferenceId("");
    setFormErrors({
      gstNumber: "",
      gstAddress: "",
      dateOfRegistration: "",
      tradeName: "",
      cinOrLlp: "",
    });
    setFormValues({
      gstNumber: "",
      gstAddress: "",
      dateOfRegistration: "",
      tradeName: "",
      cinOrLlp: "",
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleGstSelectionNext = async (gstList: string[]): Promise<void> => {
    if (gstList.length === 0) {
      setGstSelectionError("Please select at least one GST number");
      return;
    }

    setGstSelectionError("");

    setLoading(true);

    const body: IGSTValidateReportBody = {
      gstinList: gstList.map((gst) => encryptVAPTData(gst)),
    };

    const response = await validateGstReportGenerationAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      setShowGstSelection(false);
      setShowMethodSelection(true);
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else if (response?.statusCode === 409) {
      const eligibility = getFetchEligibilityStatus(
        response.data.gstReportDate,
      );

      setGstInfo((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          gstReportRefetchedDays: eligibility.daysLeft,
        };
      });

      setShowRefetchReport(true);
      setGstMessage(response.message);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleMethodSelection = (method: string): void => {
    setSelectedMethod(method);

    if (method === "manual") {
      // Start manual flow
      const initialCredentials = selectedGstNumbers.map((gst) => ({
        gstNumber: gst,
        userName: "",
        otp: "",
      }));
      setGstCredentials(initialCredentials);
      setCurrentGstIndex(0);
      setShowMethodSelection(false);
    } else if (method === "sharelink") {
      // Show share link
      if (selectedGstNumbers.length > 1) {
        setEmailList(new Array(selectedGstNumbers.length).fill(""));
        setEmailListErrors(new Array(selectedGstNumbers.length).fill(""));
      }

      setShowMethodSelection(false);
      setShowShareLinkOptions(true);
    }
  };

  const handleShareLinkGeneration = async (): Promise<void> => {
    // Validation for single GST
    if (selectedGstNumbers.length === 1) {
      if (!email.trim()) {
        setEmailError("Email is required");
        return;
      }

      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      setEmailError("");
    } else {
      // Validation for multiple GSTs
      let hasErrors = false;
      const newErrors = [...emailListErrors];

      emailList.forEach((emailItem, index) => {
        if (!emailItem || !emailItem.trim()) {
          newErrors[index] = "Email is required";
          hasErrors = true;
        } else if (!validateEmail(emailItem)) {
          newErrors[index] = "Please enter a valid email address";
          hasErrors = true;
        } else {
          newErrors[index] = "";
        }
      });

      setEmailListErrors(newErrors);

      if (hasErrors) {
        return;
      }
    }

    setLoading(true);

    let response;

    if (selectedGstNumbers.length === 1) {
      const encryptedEmail = encryptVAPTData(email);

      if (shareLinkMethod === "otp") {
        // Single GST with OTP
        const body: IGenerateGstReportUsingLinkBodyForOTP = {
          gstIn: encryptVAPTData(selectedGstNumbers[0]),
          email: encryptedEmail,
        };

        response = await getGstReportGenerateOtpUsingLinkAPI(body);
      } else {
        // Single GST with Password
        const body: IGenerateGstReportUsingLinkBodyForPassword = {
          gstInList: selectedGstNumbers.map((gst) => encryptVAPTData(gst)),
          emailList: [encryptedEmail],
        };

        response = await getGstReportViaPasswordUsingLinkAPI(body);
      }
    } else {
      // Multiple GST with Password
      const body = {
        gstInList: selectedGstNumbers.map((gst) => encryptVAPTData(gst)),
        emailList: emailList.map((emailItem) => encryptVAPTData(emailItem)),
      };
      response = await getGstReportViaPasswordUsingLinkAPI(body);
    }

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "GST Report Update");
      setReferenceId(response?.data?.referenceID);
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response?.message);
    }
    // setShowGSTReports(false);
    handleReset();
    setLoading(false);
  };

  const handleReferenceIdSubmit = async (): Promise<void> => {
    if (!referenceId.trim()) {
      return;
    }

    setReportLoading(true);

    const body = {
      referenceID: referenceId.trim(),
    };

    const response = await getGstReportForLinkApproachAPI(body);

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "GST Report Update");
      setShowGSTReports(false);
      handleReset();
      fetchGSTReport();
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response?.message);
    }

    setReportLoading(false);
  };

  const handleBackToGstSelection = (): void => {
    setShowGstSelection(true);
    setShowMethodSelection(false);
    setShowShareLinkOptions(false);
    setCurrentGstIndex(0);
    setGstCredentials([]);
    setGstUserName("");
    setGstUserNameError(validationMessages.gstUserNameRequired);
    setOtp("");
    setShowOTP(false);
    setShowNormalError("");
    setResendTimer(0);
    setCanResend(false);
    setSelectedMethod("");
    setShareLinkMethod("");
    setEmail("");
    setEmailError("");
    setReferenceId("");
    setSelectedMethod("");
  };

  const handleBackToMethodSelection = (): void => {
    setShowMethodSelection(true);
    setShowShareLinkOptions(false);
    setCurrentGstIndex(0);
    setGstCredentials([]);
    setGstUserName("");
    setGstUserNameError(validationMessages.gstUserNameRequired);
    setOtp("");
    setShowOTP(false);
    setShowNormalError("");
    setResendTimer(0);
    setCanResend(false);
    setShareLinkMethod("");
    setEmail("");
    setEmailError("");
    setEmailList([]);
    setEmailListErrors([]);
    setSelectedMethod("");
  };

  const validateGST = (value: string) => {
    if (IsStringNullEmptyOrUndefined(value)) {
      return validationMessages.gstUserNameRequired;
    } else {
      return "";
    }
  };

  const handleChange = (value: string): void => {
    setGstUserName(value);
    setGstUserNameError(validateGST(value));
    setShowNormalError("");
  };

  const handleErrorMessage = (response: IGSTGenerateOTPResponse) => {
    if (GST_REPORT_TECHNICAL_ERROR.includes(response?.data?.responseCode)) {
      toastErrorWithExtraTime(response?.message);
    } else if (response?.data?.responseCode === "EAA049") {
      toastErrorWithExtraTime(response?.message);
      setShowSpecialPopup(true);
      setGstUserName("");
      setGstUserNameError("");
    } else if (GST_REPORT_NORMAL_ERROR.includes(response?.data?.responseCode)) {
      setShowNormalError(response?.message);
    } else {
      toastErrorWithExtraTime(response?.message);
    }
  };

  const handleGSTDetail = async (): Promise<void> => {
    setIsFormSubmitted(true);
    setShowNormalError("");

    const trimmedUserName = gstUserName.trim();

    if (!trimmedUserName) {
      setGstUserNameError(validationMessages.gstUserNameRequired);
      return;
    }

    if (trimmedUserName.length > 100) {
      setGstUserNameError(validationMessages.gstUserNameInvalid);
      return;
    }

    setLoading(true);

    const currentGstNumber = selectedGstNumbers[currentGstIndex];

    const body: IGSTGenerateOTPBody = {
      gstin: currentGstNumber ? encryptVAPTData(currentGstNumber) : "",
      userName: trimmedUserName ? encryptVAPTData(trimmedUserName) : "",
    };

    try {
      const response: IGSTGenerateOTPResponse =
        await getGstReportGenerateOtpAPI(body);

      if (!response) return;

      if (response?.data?.responseCode === ReportSuccessType.GST_SUCCESS) {
        setShowOTP(true);
        showGlobalReportModal(response?.message, "GST Report Update");

        const updatedCredentials = [...gstCredentials];
        updatedCredentials[currentGstIndex].userName = trimmedUserName;
        setGstCredentials(updatedCredentials);

        // Start the resend timer
        startResendTimer();
      } else {
        setShowOTP(false);
        handleErrorMessage(response);
      }
    } catch (err) {
      setShowOTP(false);
    }

    setIsFormSubmitted(false);
    setLoading(false);
  };

  const handleResendOTP = async (): Promise<void> => {
    if (!canResend) return;

    setShowNormalError("");
    setLoading(true);

    const currentGstNumber = selectedGstNumbers[currentGstIndex];
    const currentUserName = gstCredentials[currentGstIndex].userName;

    const body: IGSTGenerateOTPBody = {
      gstin: currentGstNumber ? encryptVAPTData(currentGstNumber) : "",
      userName: currentUserName ? encryptVAPTData(currentUserName) : "",
    };

    const response: IGSTGenerateOTPResponse =
      await getGstReportGenerateOtpAPI(body);

    if (!response) return;

    if (response?.data?.responseCode === ReportSuccessType.GST_SUCCESS) {
      showGlobalReportModal("OTP resent successfully", "GST Report Update");
      setOtp("");
      startResendTimer();
    } else {
      handleErrorMessage(response);
    }

    setLoading(false);
  };

  const handleConfirmGST = async (): Promise<boolean> => {
    setShowNormalError("");

    if (!otp || otp.length !== OTPType.SIX_DIGIT_OTP) {
      toastErrorWithExtraTime(
        `Please enter ${OTPType.SIX_DIGIT_OTP} digits OTP number`,
      );
      return false;
    }

    setReportLoading(true);

    const currentGstNumber = selectedGstNumbers[currentGstIndex];

    const body: IGSTVerifyOTPBody = {
      gstin: currentGstNumber ? encryptVAPTData(currentGstNumber) : "",
      otp,
    };

    const response: IExternalReportResponse =
      await getGstReportVerifyOtpAPI(body);

    if (!response) {
      setReportLoading(false);
      return false;
    }

    if (response?.statusCode === 200) {
      const updatedCredentials = [...gstCredentials];
      updatedCredentials[currentGstIndex].otp = otp;
      setGstCredentials(updatedCredentials);

      showGlobalReportModal(response?.message, "GST Report Update");

      if (currentGstIndex < selectedGstNumbers.length - 1) {
        setCurrentGstIndex(currentGstIndex + 1);
        setGstUserName("");
        setGstUserNameError(validationMessages.gstUserNameRequired);
        setOtp("");
        setShowOTP(false);
        setIsFormSubmitted(false);
        setResendTimer(0);
        setCanResend(false);
        setReportLoading(false);
        return true;
      } else {
        // Last GST verified successfully
        setReportLoading(false);
        return true;
      }
    } else if (
      GST_REPORT_TECHNICAL_ERROR.includes(response?.data?.responseCode)
    ) {
      toastErrorWithExtraTime(response?.message);
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else if (GST_REPORT_NORMAL_ERROR.includes(response?.data?.responseCode)) {
      setShowNormalError(response?.message);
    } else {
      toastErrorWithExtraTime(response?.message);
    }

    setReportLoading(false);
    return false;
  };

  const handleCompleteGSTProcess = async (): Promise<void> => {
    // First verify the last OTP
    const isLastOtpVerified = await handleConfirmGST();

    if (!isLastOtpVerified) {
      return; // Don't proceed if OTP verification failed
    }

    setReportLoading(true);

    const completionData = {
      gstDetails: gstCredentials.map((cred) => ({
        gstin: encryptVAPTData(cred.gstNumber),
        userName: encryptVAPTData(cred.userName),
        otp: cred.otp,
      })),
    };

    const gstinListData = {
      gstinList: completionData.gstDetails.map((item) => item.gstin),
    };

    const response = await generateGstReportAPI(gstinListData);

    if (response?.statusCode === 200) {
      setShowGSTReports(false);
      setShowGstSelection(true);
      setCurrentGstIndex(0);
      setGstCredentials([]);
      setResendTimer(0);
      setCanResend(false);
      fetchGSTReport();
      showGlobalReportModal(response?.message, "GST Report Update");
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response?.message);
    }

    setReportLoading(false);
  };

  const normalizeGstFormData = (data: IGSTListInfo): IGSTListInfo => {
    return {
      ...data,
      gstAddress: data.gstAddress === "" ? null : data.gstAddress,
      dateOfRegistration:
        data.dateOfRegistration === "" ? null : data.dateOfRegistration,
      tradeName: data.tradeName === "" ? null : data.tradeName,
      cinOrLlp: data.cinOrLlp === "" ? null : data.cinOrLlp,
    };
  };

  const validateForm = (): boolean => {
    const errors: IGSTListInfo = {
      gstNumber: "",
      gstAddress: "",
      dateOfRegistration: "",
      tradeName: "",
      cinOrLlp: "",
    };

    let isValid = true;

    if (IsStringNullEmptyOrUndefined(formValues.gstNumber)) {
      errors.gstNumber = validationMessages.gstNumberRequired;
      isValid = false;
    } else if (!GST_NUMBER_PATTERN.test(formValues.gstNumber)) {
      errors.gstNumber = validationMessages.gstNumberInvalid;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddGstInfo = async () => {
    setIsFormSubmitted(true);
    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);

    const cleanedData: IGSTListInfo = normalizeGstFormData(formValues);

    const cleanedBody: IGSTListInfo = {
      gstNumber: encryptVAPTData(cleanedData.gstNumber),
      gstAddress: encryptVAPTData(cleanedData.gstAddress),
      dateOfRegistration: encryptVAPTData(cleanedData.dateOfRegistration),
      tradeName: encryptVAPTData(cleanedData.tradeName),
      cinOrLlp: encryptVAPTData(cleanedData.cinOrLlp),
    };

    const response = await updateGstDetailsAPI(cleanedBody);

    if (response && response.statusCode === 200) {
      showGlobalReportModal(
        "GST Information added successfully",
        "GST Report Update",
      );
      setAddGSTNumber(false);
      fetchGSTReport();
    } else {
      showGlobalReportModal(
        response?.message || "Failed to add GST Info",
        "GST Report Update",
      );
    }

    setLoading(false);
  };

  const resetForm = (): void => {
    setFormValues({
      gstNumber: "",
      gstAddress: "",
      dateOfRegistration: "",
      tradeName: "",
      cinOrLlp: "",
    });

    setFormErrors({
      gstNumber: "",
      gstAddress: "",
      dateOfRegistration: "",
      tradeName: "",
      cinOrLlp: "",
    });

    setIsFormSubmitted(false);
  };

  const actionBody = (clientInfo: IGSTDetail): JSX.Element => {
    const pdfId = `gst-pdf-${clientInfo.id}`;
    const excelId = `gst-excel-${clientInfo.id}`;

    return (
      <>
        <Tooltip target={`#${pdfId}`} position="top" />
        <Tooltip target={`#${excelId}`} position="top" />

        <Button
          id={pdfId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download PDF Report"
          onClick={() =>
            handleFileDownload(clientInfo.pdfFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/pdf-download.svg"
            alt="pdf-download-icon"
            loading="lazy"
          />
        </Button>

        <Button
          id={excelId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download Excel Report"
          onClick={() =>
            handleFileDownload(clientInfo.excelFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/excel-download.svg"
            alt="excel-download-icon"
            loading="lazy"
          />
        </Button>
      </>
    );
  };

  const gstFooter = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-orange"
        onClick={() => setShowSpecialPopup(false)}
      >
        Okay
      </Button>
    </div>
  );

  const addGstNumberFooter = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-orange-line w-100"
        onClick={() => handleReset()}
      >
        Cancel
      </Button>
      <Button className="btn btn-orange w-100" onClick={handleAddGstInfo}>
        Add
      </Button>
    </div>
  );

  const handleClickGSTReport = (): void => {
    const refetchDays = gstInfo?.gstReportRefetchedDays;

    if (refetchDays !== undefined && refetchDays < 30) {
      setShowRefetchReport(true);
      return;
    }

    if (!gstNumbersArray || gstNumbersArray.length === 0) {
      return;
    }

    const newList =
      gstNumbersArray.length > 1 ? selectedGstNumbers : [gstNumbersArray[0]];

    setSelectedGstNumbers(newList);
    handleGstSelectionNext(newList);
  };

  useEffect(() => {
    if (!addGSTNumber) resetForm();
  }, [addGSTNumber]);

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (showGSTReports) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    if (showGSTReports) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showGSTReports]);

  useEffect(() => {
    fetchGSTReport();
  }, [count]);

  const gstNumbersArray = getGstNumbersArray();

  return (
    <>
      <Loader isLoading={loading} />

      <Dialog
        visible={reportLoading}
        onHide={() => {}}
        draggable={false}
        resizable={false}
        modal
        className="modalWrapper"
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
        <p className="mt-2">
          If you see loader for{" "}
          <strong>5 mins or more please refresh the page</strong> to get the
          report
        </p>
      </Dialog>

      <div className="col-12">
        <div className="whiteBoxHldr p-24">
          <div className="row">
            <div className="col-lg-12">
              <div className="col-12 mb-4 titleBtnWrapper">
                <TableTitle title="GST Details" />

                <div className="BtnRightHldr">
                  {(isDefaultCpClient || isImpersonate) && (
                    <Button
                      className="btn btn-orange"
                      onClick={() => setShowGSTReports(true)}
                      label="Get GST Report"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive mb-4">
            <DataTable
              className="tableMain"
              value={gstInfo?.gstDetailsList}
              emptyMessage="No Report Found"
            >
              <Column
                header="Sr. No."
                body={(rowData, options) => options.rowIndex + 1}
              />

              <Column field="fileName" header="File Name" />

              <Column
                header="GST Number"
                body={(rowData: IGSTDetail) => {
                  if (!rowData.gstNumber) return "-";
                  const gstList = rowData.gstNumber
                    .split(",")
                    .map((gst) => gst.trim());
                  return (
                    <div>
                      {gstList.map((gst, index) => (
                        <div key={index} className="p-2">
                          {gst}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />

              <Column
                body={(rowData: IGSTDetail) =>
                  rowData.retrievedDate
                    ? moment(rowData.retrievedDate).format(
                        "Do MMMM YYYY, h:mm A",
                      )
                    : "-"
                }
                header="Fetched Date & Time"
              />

              <Column
                body={(rowData: IGSTDetail) =>
                  rowData.gstFrom
                    ? moment(rowData.gstFrom).format("MMMM YYYY")
                    : "-"
                }
                header="GST From"
              />

              <Column
                body={(rowData: IGSTDetail) =>
                  rowData.gstTo
                    ? moment(rowData.gstTo).format("MMMM YYYY")
                    : "-"
                }
                header="GST To"
              />

              <Column body={actionBody} header="Action" />
            </DataTable>
          </div>

          <BackButton />
        </div>
      </div>

      <Dialog
        visible={showGSTReports}
        modal
        onHide={handleReset}
        header="GST Details"
        className="modalWrapper"
        draggable={false}
        resizable={false}
        closable={false}
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="modal-content">
          <Loader isLoading={loading} />

          <div className="modal-body">
            {showGstSelection && gstNumbersArray ? (
              // GST Selection Screen
              <div className="row">
                <div className="form-group">
                  <label className="form-label small" htmlFor="gstin">
                    {gstNumbersArray.length > 1
                      ? "Select GST Numbers"
                      : "GST Number"}
                    <sup>*</sup>
                  </label>

                  {gstNumbersArray.length > 1 ? (
                    <>
                      <div
                        className={`border rounded-3 p-2 ${
                          gstSelectionError ? "border-danger" : ""
                        }`}
                        style={{ maxHeight: "220px", overflowY: "auto" }}
                      >
                        <div
                          className="d-flex flex-column gap-2"
                          style={{ flexWrap: "wrap", overflow: "hidden" }}
                        >
                          {gstNumbersArray.map((gst) => {
                            const isSelected = selectedGstNumbers.includes(gst);

                            return (
                              <button
                                key={gst}
                                type="button"
                                className={`w-100 text-start rounded-3 px-3 py-2 border ${
                                  isSelected
                                    ? "border-orange bg-light"
                                    : "border-light-subtle bg-white"
                                }`}
                                onClick={() => toggleSelectedGst(gst)}
                              >
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                  <div className="d-flex align-items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="form-check-input mt-0"
                                      checked={isSelected}
                                      readOnly
                                    />
                                    <span className="fw-medium">{gst}</span>
                                  </div>

                                  {isSelected && (
                                    <span className="badge rounded-pill text-bg-orange">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {gstSelectionError && (
                        <span className="error">{gstSelectionError}</span>
                      )}
                    </>
                  ) : (
                    <InputText
                      id="gstin"
                      className="form-control"
                      placeholder="GST Number"
                      value={gstNumbersArray[0] || ""}
                      name="gstin"
                      disabled
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                    />
                  )}
                </div>

                <div className="form-group mt-4 d-flex">
                  <Button
                    className="btn btn-black-line text-center w-100"
                    onClick={handleReset}
                    label="Cancel"
                  />

                  <Button
                    className={`btn ${
                      gstInfo?.gstNumber === ""
                        ? "btn-orange-disabled"
                        : "btn-orange"
                    } ms-2 w-100 text-center`}
                    onClick={handleClickGSTReport}
                    label="Next"
                    disabled={gstInfo?.gstNumber === ""}
                  />
                </div>
              </div>
            ) : showMethodSelection ? (
              // Method Selection Screen
              <div className="row">
                <div className="form-group">
                  <label className="form-label mb-3">
                    <strong>Choose Report Generation Method</strong>
                  </label>

                  <div className="d-flex flex-column gap-3">
                    {/* Manual Entry */}
                    <div
                      className="p-3 border rounded cursor-pointer"
                      onClick={() => setSelectedMethod("manual")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center">
                        <RadioButton
                          inputId="manual"
                          name="method"
                          value="manual"
                          onChange={(e) => setSelectedMethod(e.value)}
                          checked={selectedMethod === "manual"}
                        />
                        <label
                          htmlFor="manual"
                          className="ms-2 mb-0 cursor-pointer"
                          style={{ cursor: "pointer", flex: 1 }}
                        >
                          <strong>Manual Entry</strong>
                          <p className="mb-0 text-muted small">
                            Enter credentials manually for each GST number
                          </p>
                        </label>
                      </div>
                    </div>

                    {/* Share Link */}
                    <div
                      className="p-3 border rounded cursor-pointer"
                      onClick={() => setSelectedMethod("sharelink")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center">
                        <RadioButton
                          inputId="sharelink"
                          name="method"
                          value="sharelink"
                          onChange={(e) => setSelectedMethod(e.value)}
                          checked={selectedMethod === "sharelink"}
                        />
                        <label
                          htmlFor="sharelink"
                          className="ms-2 mb-0 cursor-pointer"
                          style={{ cursor: "pointer", flex: 1 }}
                        >
                          <strong>Share Link</strong>
                          <p className="mb-0 text-muted small">
                            Send a secure link via email to generate report
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group mt-4 d-flex">
                  <Button
                    className="btn btn-black-line text-center w-100"
                    onClick={handleBackToGstSelection}
                    label="Back"
                  />
                  <Button
                    className={`btn ${
                      !selectedMethod ? "btn-orange-disabled" : "btn-orange"
                    } ms-2 w-100 text-center`}
                    onClick={() => handleMethodSelection(selectedMethod)}
                    label="Continue"
                    disabled={!selectedMethod}
                  />
                </div>
              </div>
            ) : showShareLinkOptions ? (
              // Share Link Options Screen
              <div className="row">
                {selectedGstNumbers.length === 1 ? (
                  <>
                    <div className="form-group">
                      <label className="form-label small" htmlFor="email">
                        Email Address <sup>*</sup>
                      </label>
                      <InputText
                        id="email"
                        className="form-control"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value.trim());
                          setEmailError("");
                        }}
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                      />
                      {emailError && (
                        <span className="error">{emailError}</span>
                      )}
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label mb-3">
                        <strong>Choose Authentication Method</strong>
                      </label>

                      <div className="d-flex flex-column gap-3">
                        {/* OTP Option */}
                        <div
                          className={`p-3 border rounded ${
                            referenceId
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !referenceId && setShareLinkMethod("otp")
                          }
                        >
                          <div className="d-flex align-items-center">
                            <RadioButton
                              inputId="otp"
                              name="shareLinkMethod"
                              value="otp"
                              onChange={(e) => setShareLinkMethod(e.value)}
                              checked={shareLinkMethod === "otp"}
                              disabled={!!referenceId}
                            />
                            <label htmlFor="otp" className="ms-2 mb-0">
                              <strong>Generate via OTP</strong>
                              <p className="mb-0 text-muted small">
                                User will verify using OTP
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Password Option */}
                        <div
                          className={`p-3 border rounded ${
                            referenceId
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !referenceId && setShareLinkMethod("password")
                          }
                        >
                          <div className="d-flex align-items-center">
                            <RadioButton
                              inputId="password"
                              name="shareLinkMethod"
                              value="password"
                              onChange={(e) => setShareLinkMethod(e.value)}
                              checked={shareLinkMethod === "password"}
                              disabled={!!referenceId}
                            />
                            <label htmlFor="password" className="ms-2 mb-0">
                              <strong>Generate via Password</strong>
                              <p className="mb-0 text-muted small">
                                User will verify using password
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="alert alert-warning mt-3">
                      <small>
                        <strong>Note:</strong> Please provide an email address
                        for each GST number. Multiple GST numbers will use
                        password authentication only.
                      </small>
                    </div>

                    {selectedGstNumbers.map((gstNumber, index) => (
                      <div key={index} className="form-group mb-3">
                        <label className="form-label small">
                          Email for {gstNumber} <sup>*</sup>
                        </label>
                        <InputText
                          className="form-control"
                          placeholder={`Enter email for GST ${index + 1}`}
                          value={emailList[index] || ""}
                          onChange={(e) => {
                            const newEmailList = [...emailList];
                            newEmailList[index] = e.target.value.trim();
                            setEmailList(newEmailList);

                            // Clear error for this field
                            const newErrors = [...emailListErrors];
                            newErrors[index] = "";
                            setEmailListErrors(newErrors);
                          }}
                          // onPaste={(e) => e.preventDefault()}
                          // onCopy={(e) => e.preventDefault()}
                          // onCut={(e) => e.preventDefault()}
                        />
                        {emailListErrors[index] && (
                          <span className="error">
                            {emailListErrors[index]}
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                <div className="form-group mt-4 d-flex">
                  <Button
                    className="btn btn-black-line text-center w-100"
                    onClick={handleBackToMethodSelection}
                    label="Back"
                  />

                  {referenceId ? (
                    <Button
                      className={`btn ${
                        !referenceId ? "btn-orange-disabled" : "btn-orange"
                      } ms-2 w-100 text-center`}
                      onClick={handleReferenceIdSubmit}
                      label="Generate Report"
                      disabled={!referenceId}
                    />
                  ) : (
                    <Button
                      className={`btn ${
                        (selectedGstNumbers.length === 1 &&
                          (!email || !shareLinkMethod)) ||
                        (selectedGstNumbers.length > 1 &&
                          emailList.some((e) => !e || !e.trim()))
                          ? "btn-orange-disabled"
                          : "btn-orange"
                      } ms-2 w-100 text-center`}
                      onClick={() => {
                        if (selectedGstNumbers.length > 1)
                          setShareLinkMethod("password");
                        handleShareLinkGeneration();
                      }}
                      label="Send Link"
                      disabled={
                        (selectedGstNumbers.length === 1 &&
                          (!email || !shareLinkMethod)) ||
                        (selectedGstNumbers.length > 1 &&
                          emailList.some((e) => !e || !e.trim()))
                      }
                    />
                  )}
                </div>
              </div>
            ) : (
              // Manual Entry Form (for multiple GSTs)
              <div className="row">
                {selectedGstNumbers.length > 1 && (
                  <div className="alert alert-info mb-3">
                    <strong>
                      Processing GST {currentGstIndex + 1} of{" "}
                      {selectedGstNumbers.length}
                    </strong>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label small">GST Number</label>
                  <InputText
                    className="form-control"
                    value={selectedGstNumbers[currentGstIndex]}
                    disabled
                  />
                </div>

                <div className="form-group mt-3">
                  <label className="form-label small" htmlFor="userName">
                    User Name<sup>*</sup>
                  </label>

                  <InputText
                    id="userName"
                    className="form-control"
                    placeholder="Enter username"
                    value={gstUserName.trim()}
                    name="userName"
                    maxLength={100}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={showOTP}
                    // onPaste={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">{gstUserNameError}</span>
                  )}
                </div>

                {showOTP && (
                  <>
                    <div className="form-group mt-3">
                      <label className="form-label small" htmlFor="otp">
                        OTP<sup>*</sup>
                      </label>

                      <InputText
                        id="otp"
                        className="form-control"
                        placeholder="Enter OTP"
                        value={otp.trim()}
                        name="otp"
                        maxLength={6}
                        onChange={(e) => {
                          setShowNormalError("");
                          setGstUserNameError("");

                          const numericValue = e.target.value.replace(
                            NUMBER,
                            "",
                          );
                          setOtp(numericValue);
                        }}
                        onKeyPress={(e) =>
                          restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                        }
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                      />
                    </div>

                    <div className="mt-2 d-flex align-items-center justify-content-between">
                      {resendTimer > 0 ? (
                        <b className="txt-14" style={{ fontWeight: 600 }}>
                          Resend OTP in {formatTime(resendTimer)}
                        </b>
                      ) : (
                        <Button
                          className="resendBtn"
                          onClick={handleResendOTP}
                          label="Resend OTP"
                          disabled={loading || !canResend}
                        />
                      )}
                    </div>
                  </>
                )}

                {showNormalError && (
                  <span className="error">{showNormalError}</span>
                )}

                {/* Show progress */}
                {selectedGstNumbers.length > 1 && currentGstIndex > 0 && (
                  <div className="mt-3">
                    <small className="text-success">
                      ✓ Completed {currentGstIndex} of{" "}
                      {selectedGstNumbers.length} GST numbers
                    </small>
                  </div>
                )}

                <div className="form-group mt-4 d-flex">
                  <Button
                    className="btn btn-black-line text-center w-100"
                    onClick={handleBackToMethodSelection}
                    label="Back"
                    // disabled={showOTP}
                  />

                  <Button
                    className="btn btn-orange ms-2 w-100 text-center"
                    onClick={() => {
                      if (showOTP) {
                        if (currentGstIndex < selectedGstNumbers.length - 1) {
                          handleConfirmGST();
                        } else {
                          handleCompleteGSTProcess();
                        }
                      } else {
                        handleGSTDetail();
                      }
                    }}
                    label={
                      showOTP
                        ? currentGstIndex < selectedGstNumbers.length - 1
                          ? "Next GST"
                          : "Complete"
                        : "Get OTP"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showSpecialPopup}
        onHide={() => setShowSpecialPopup(false)}
        draggable={false}
        resizable={false}
        modal
        blockScroll
        header="Enable API Access on GST Portal"
        className="modalWrapper"
        footer={gstFooter}
      >
        <iframe
          title="GST Content"
          src="/assets/images/gst_video.mp4"
          width="100%"
          height="300px"
          className="mb-4"
        />

        <p className="mt-2 mb-2">
          To proceed, please ensure that API access is enabled on the GST portal
          by following the steps below:
        </p>

        <div className="d-flex gap-2 flex-column">
          <li>
            Log-in to government portal at{" "}
            <Link
              to="https://services.gst.gov.in/services/login"
              target="_blank"
            >
              https://services.gst.gov.in/services/login
            </Link>
          </li>
          <li>On the top-right corner, click on My Profile</li>
          <li>Click on Manage API Access</li>
          <li>Choose Yes under Enable API Request</li>
          <li>Under Duration, choose 30 days</li>
          <li>Click on Proceed</li>
        </div>
      </Dialog>

      <Dialog
        visible={addGSTNumber}
        onHide={() => {
          setAddGSTNumber(false);
          handleReset();
        }}
        draggable={false}
        resizable={false}
        modal
        blockScroll
        header="Add GST Information"
        className="modalWrapper"
        style={{ width: "500px" }}
        footer={addGstNumberFooter}
      >
        <div className="form-group mb-3">
          <label className="form-label small" htmlFor="gstNumber">
            GST Number <sup>*</sup>
          </label>
          <InputText
            name="gstNumber"
            value={formValues.gstNumber}
            className="form-control"
            placeholder="Enter GST Number"
            maxLength={15}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().trim();

              setFormValues({
                ...formValues,
                gstNumber: value,
              });

              if (!value) {
                setFormErrors({
                  ...formErrors,
                  gstNumber: validationMessages.gstNumberRequired,
                });
              } else if (!GST_NUMBER_PATTERN.test(value)) {
                setFormErrors({
                  ...formErrors,
                  gstNumber: validationMessages.gstNumberInvalid,
                });
              } else {
                setFormErrors({
                  ...formErrors,
                  gstNumber: "",
                });
              }
            }}
            // onPaste={(e) => e.preventDefault()}
            // onCopy={(e) => e.preventDefault()}
            // onCut={(e) => e.preventDefault()}
          />
          {isFormSubmitted && formErrors.gstNumber && (
            <span className="error">{formErrors.gstNumber}</span>
          )}
        </div>

        <div className="form-group mb-3">
          <label className="form-label small" htmlFor="gstAddress">
            GST Address
          </label>
          <InputText
            name="gstAddress"
            value={formValues.gstAddress}
            className="form-control"
            placeholder="Enter GST Address"
            onChange={(e) =>
              setFormValues({
                ...formValues,
                gstAddress: e.target.value.toUpperCase().trim(),
              })
            }
            // onPaste={(e) => e.preventDefault()}
            // onCopy={(e) => e.preventDefault()}
            // onCut={(e) => e.preventDefault()}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label small" htmlFor="dateOfRegistration">
            Date of GST Registration
          </label>
          <Calendar
            name="dateOfRegistration"
            value={
              formValues.dateOfRegistration
                ? new Date(formValues.dateOfRegistration)
                : null
            }
            onChange={(e) =>
              setFormValues((prev) => ({
                ...prev,
                dateOfRegistration: e.value
                  ? new Date(e.value).toISOString().split("T")[0]
                  : "",
              }))
            }
            placeholder="Select Date"
            dateFormat="dd/mm/yy"
            className="w-100"
            maxDate={new Date()}
            showButtonBar
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label small" htmlFor="tradeName">
            Trade Name
          </label>
          <InputText
            name="tradeName"
            value={formValues.tradeName}
            className="form-control"
            placeholder="Enter Trade Name"
            onChange={(e) =>
              setFormValues({
                ...formValues,
                tradeName: e.target.value.toUpperCase().trim(),
              })
            }
            // onPaste={(e) => e.preventDefault()}
            // onCopy={(e) => e.preventDefault()}
            // onCut={(e) => e.preventDefault()}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label small" htmlFor="cinOrLlp">
            CIN/LLP
          </label>
          <InputText
            name="cinOrLlp"
            value={formValues.cinOrLlp}
            className="form-control"
            placeholder="Enter CIN or LLP"
            onChange={(e) =>
              setFormValues({
                ...formValues,
                cinOrLlp: e.target.value.toUpperCase().trim(),
              })
            }
            // onPaste={(e) => e.preventDefault()}
            // onCopy={(e) => e.preventDefault()}
            // onCut={(e) => e.preventDefault()}
          />
        </div>
      </Dialog>

      <CreditNotAvailable
        isShow={showCreditPopup}
        onHide={() => setShowCreditPopup(false)}
        message="Your channel partner does not have credits. Please ask them to add the credits."
      />

      {gstNumbersArray && (
        <ReFetchModal
          visible={showRefetchReport}
          onHide={() => {
            setShowRefetchReport(false);
            handleReset();
          }}
          reportType={ReportType.GST_REPORT}
          daysLeft={gstInfo?.gstReportRefetchedDays || 0}
          reportFetchFunction={() => {
            setShowGstSelection(false);
            setShowMethodSelection(true);
            setShowRefetchReport(false);
            setGstMessage("");
            setGstInfo((prev) => {
              if (!prev) return prev;

              const { gstReportRefetchedDays, ...rest } = prev;
              return rest;
            });
          }}
          message={gstMessage}
        />
      )}
    </>
  );
};

export default GstReport;

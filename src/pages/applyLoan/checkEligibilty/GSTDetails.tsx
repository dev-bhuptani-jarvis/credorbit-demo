import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import Loader from "../../../components/Loader";
import ModalLoader from "../../../components/ModalLoader";
import {
  formatTime,
  getFetchEligibilityStatus,
  restrictInputByPattern,
  showGlobalReportModal,
  toastError,
  toastErrorWithExtraTime,
  toastSuccess,
} from "../../../utils/functions/shared";
import { IsStringNullEmptyOrUndefined } from "../../../utils/functions/nullCheck";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../../utils/functions/encryptDecrypt";
import {
  generateGstReportAPI,
  getGstReportGenerateOtpAPI,
  getGstReportVerifyOtpAPI,
  updateGstDetailsAPI,
  validateGstReportGenerationAPI,
  getGstReportGenerateOtpUsingLinkAPI,
  getGstReportViaPasswordUsingLinkAPI,
  getGstReportForLinkApproachAPI,
} from "../../../utils/axios/apiServices";
import {
  IGSTCredentials,
  IGSTGenerateOTPBody,
  IGSTGenerateOTPResponse,
  IGSTValidateReportBody,
  IGSTVerifyOTPBody,
} from "../../../interface/checkEligibility";
import {
  IExternalReportResponse,
  IGenerateGstReportUsingLinkBodyForOTP,
  IGenerateGstReportUsingLinkBodyForPassword,
} from "../../../interface/reports";
import { IGSTListInfo } from "../../../interface/userData";
import { validationMessages } from "../../../utils/constants/messages";
import {
  NUMBER,
  NUMBER_ONLY_PATTERN,
  GST_NUMBER_PATTERN,
} from "../../../utils/constants/pattern";
import {
  OTPType,
  ReportSuccessType,
  ReportType,
  StorageKeyEnum,
} from "../../../utils/constants/enum";
import {
  GST_REPORT_NORMAL_ERROR,
  GST_REPORT_TECHNICAL_ERROR,
} from "../../../utils/constants/constant";
import { RootState } from "../../../store";
import { setCustomerInfo } from "../../../store/reducer/customerSlice";
import { IClientDashboardData } from "../../../interface/clientDashboard";
import { Link, useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../../utils/functions/sessionStorage";
import { setUserData } from "../../../store/reducer/userSlice";
import { setImpersonateUser } from "../../../store/reducer/impersonateSlice";
import CreditNotAvailable from "../../../components/CreditNotAvailable";
import ReFetchModal from "../../../components/ReFetchModal";

interface INextStepProps {
  nextStep?: () => void;
  prevStep?: () => void;
}

const GSTDetails = ({ nextStep, prevStep }: INextStepProps) => {
  const dispatch = useDispatch();

  const { customerInfo } = useSelector((state: RootState) => state.customer);

  const [loading, setLoading] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [showSpecialPopup, setShowSpecialPopup] = useState<boolean>(false);

  const [showGstSelection, setShowGstSelection] = useState<boolean>(true);

  const [selectedGstNumbers, setSelectedGstNumbers] = useState<string[]>([]);

  const [gstSelectionError, setGstSelectionError] = useState<string>("");

  const [gstCredentials, setGstCredentials] = useState<IGSTCredentials[]>([]);

  const [currentGstIndex, setCurrentGstIndex] = useState<number>(0);

  const [gstUserName, setGstUserName] = useState<string>("");

  const [gstUserNameError, setGstUserNameError] = useState<string>(
    validationMessages.gstUserNameRequired,
  );

  const [otp, setOtp] = useState<string>("");

  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [resendTimer, setResendTimer] = useState<number>(0);

  const [canResend, setCanResend] = useState<boolean>(false);

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [addGSTNumber, setAddGSTNumber] = useState<boolean>(false);

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

  const [showMethodSelection, setShowMethodSelection] =
    useState<boolean>(false);

  const [selectedMethod, setSelectedMethod] = useState<string>(""); // “manual” or “sharelink”

  const [showShareLinkOptions, setShowShareLinkOptions] =
    useState<boolean>(false);

  const [shareLinkMethod, setShareLinkMethod] = useState<string>(""); // “otp” or “password”

  const [email, setEmail] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");

  const [emailList, setEmailList] = useState<string[]>([]);

  const [emailListErrors, setEmailListErrors] = useState<string[]>([]);

  const [referenceId, setReferenceId] = useState<string>("");

  const [showCreditPopup, setShowCreditPopup] = useState<boolean>(false);

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const [gstMessage, setGstMessage] = useState<string>("");

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const navigate = useNavigate();

  // Utility functions
  const getGstNumbersArray = (): string[] => {
    if (customerInfo?.gstList?.length) {
      return customerInfo.gstList.map((gst: any) => gst.gstNo);
    }
    return [];
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

  // Timer effect for resend
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

  // Handlers
  const validateEmail = (em: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(em);
  };

  const handleChangeUserName = (value: string): void => {
    const trimmedValue = value.trim();
    setGstUserName(value);

    if (trimmedValue) {
      setGstUserNameError("");
    } else {
      setGstUserNameError(validationMessages.gstUserNameRequired);
    }

    setShowNormalError("");
  };

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

    if (response?.statusCode === 200) {
      toastSuccess(response.message);

      const initialCredentials = gstList.map((gst) => ({
        gstNumber: gst,
        userName: "",
        otp: "",
      }));

      setGstCredentials(initialCredentials);

      setCurrentGstIndex(0);

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

      // setGstInfo((prev) => {
      //   if (!prev) return prev;

      //   return {
      //     ...prev,
      //     gstReportRefetchedDays: eligibility.daysLeft,
      //   };
      // });

      setShowRefetchReport(true);
      setGstMessage(response.message);
    } else {
      toastError(response?.message);
    }
    setLoading(false);
  };

  const handleMethodSelection = (method: string): void => {
    setSelectedMethod(method);
    if (method === "manual") {
      const initialCredentials = selectedGstNumbers.map((gst) => ({
        gstNumber: gst,
        userName: "",
        otp: "",
      }));

      setGstCredentials(initialCredentials);

      setCurrentGstIndex(0);

      setShowMethodSelection(false);
      setReportLoading(false);
    } else if (method === "sharelink") {
      // setup list if multiple
      if (selectedGstNumbers.length > 1) {
        setEmailList(new Array(selectedGstNumbers.length).fill(""));
        setEmailListErrors(new Array(selectedGstNumbers.length).fill(""));
      }

      setShowMethodSelection(false);

      setReportLoading(false);
      setShowShareLinkOptions(true);
    }
  };

  const handleShareLinkGeneration = async (): Promise<void> => {
    // Emails validation
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
      let hasErrors = false;
      const newErrors = [...emailListErrors];
      emailList.forEach((em, idx) => {
        if (!em || !em.trim()) {
          newErrors[idx] = "Email is required";
          hasErrors = true;
        } else if (!validateEmail(em)) {
          newErrors[idx] = "Please enter a valid email address";
          hasErrors = true;
        } else {
          newErrors[idx] = "";
        }
      });
      setEmailListErrors(newErrors);
      if (hasErrors) return;
    }

    setLoading(true);
    let response: any;

    if (selectedGstNumbers.length === 1) {
      const encryptedEmail = encryptVAPTData(email);
      if (shareLinkMethod === "otp") {
        const body: IGenerateGstReportUsingLinkBodyForOTP = {
          gstIn: encryptVAPTData(selectedGstNumbers[0]),
          email: encryptedEmail,
        };
        response = await getGstReportGenerateOtpUsingLinkAPI(body);
      } else {
        const body: IGenerateGstReportUsingLinkBodyForPassword = {
          gstInList: selectedGstNumbers.map((gst) => encryptVAPTData(gst)),
          emailList: [encryptedEmail],
        };
        response = await getGstReportViaPasswordUsingLinkAPI(body);
      }
    } else {
      const encryptedGsts = selectedGstNumbers.map((gst) =>
        encryptVAPTData(gst),
      );
      const encryptedEmails = emailList.map((em) => encryptVAPTData(em));
      const body: IGenerateGstReportUsingLinkBodyForPassword = {
        gstInList: encryptedGsts,
        emailList: encryptedEmails,
      };
      response = await getGstReportViaPasswordUsingLinkAPI(body);
    }

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "GST Report Update");
      setReferenceId(response.data.referenceID);
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response?.message || "Link generation failed");
    }

    setLoading(false);
  };

  const handleReferenceIdSubmit = async (): Promise<void> => {
    if (!referenceId.trim()) {
      return;
    }

    setReportLoading(true);
    const body = { referenceID: referenceId.trim() };
    const response = await getGstReportForLinkApproachAPI(body);

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "GST Report Update");
      setReportLoading(false);
      nextStep?.();
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(
        response?.message || "Failed to get report from link",
      );
    }

    setReportLoading(false);
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
      gstin: encryptVAPTData(currentGstNumber),
      userName: encryptVAPTData(trimmedUserName),
    };

    const response: IGSTGenerateOTPResponse =
      await getGstReportGenerateOtpAPI(body);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.data.responseCode === ReportSuccessType.GST_SUCCESS) {
      setShowOTP(true);
      showGlobalReportModal(response?.message, "GST Report Update");
      const updated = [...gstCredentials];

      if (!updated[currentGstIndex]) {
        updated[currentGstIndex] = {
          gstNumber: selectedGstNumbers[currentGstIndex],
          userName: "",
          otp: "",
        };
      }
      updated[currentGstIndex].userName = trimmedUserName;
      setGstCredentials(updated);
      startResendTimer();
    } else {
      setShowOTP(false);
      handleErrorMessage(response);
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
      gstin: encryptVAPTData(currentGstNumber),
      userName: encryptVAPTData(currentUserName),
    };
    const response = await getGstReportGenerateOtpAPI(body);
    if (!response) {
      setLoading(false);
      return;
    }
    if (response.data.responseCode === ReportSuccessType.GST_SUCCESS) {
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
      gstin: encryptVAPTData(currentGstNumber),
      otp: otp.trim(),
    };

    const response: IExternalReportResponse =
      await getGstReportVerifyOtpAPI(body);

    if (!response) {
      setReportLoading(false);
      return false;
    }
    if (response.statusCode === 200) {
      const updated = [...gstCredentials];
      updated[currentGstIndex].otp = otp.trim();
      setGstCredentials(updated);

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
        setReportLoading(false);
        return true;
      }
    } else if (
      GST_REPORT_TECHNICAL_ERROR.includes(response.data?.responseCode)
    ) {
      toastErrorWithExtraTime(response.message);
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else if (GST_REPORT_NORMAL_ERROR.includes(response.data?.responseCode)) {
      setShowNormalError(response.message);
    } else {
      toastErrorWithExtraTime(response.message);
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
    const gstinListData = {
      gstinList: gstCredentials.map((cred) => encryptVAPTData(cred.gstNumber)),
    };

    const response = await generateGstReportAPI(gstinListData);
    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "GST Report Update");
      nextStep?.();
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

  const normalizeGstFormData = (data: IGSTListInfo): IGSTListInfo => {
    return {
      gstNumber: data.gstNumber,
      gstAddress: data.gstAddress === "" ? null : data.gstAddress,
      dateOfRegistration:
        data.dateOfRegistration === "" ? null : data.dateOfRegistration,
      tradeName: data.tradeName === "" ? null : data.tradeName,
      cinOrLlp: data.cinOrLlp === "" ? null : data.cinOrLlp,
    };
  };

  const handleAddGstInfo = async () => {
    setIsFormSubmitted(true);
    if (!validateForm()) return;
    setLoading(true);
    const cleaned = normalizeGstFormData(formValues);
    const cleanedBody = {
      gstNumber: encryptVAPTData(cleaned.gstNumber),
      gstAddress: encryptVAPTData(cleaned.gstAddress),
      dateOfRegistration: encryptVAPTData(cleaned.dateOfRegistration),
      tradeName: encryptVAPTData(cleaned.tradeName),
      cinOrLlp: encryptVAPTData(cleaned.cinOrLlp),
    };
    const response = await updateGstDetailsAPI(cleanedBody);
    if (response?.statusCode === 200) {
      showGlobalReportModal(
        "GST Information added successfully",
        "GST Report Update",
      );

      setAddGSTNumber(false);

      const updatedCustomerInfo: IClientDashboardData = {
        ...customerInfo,
        gstNumber: formValues.gstNumber,
      };

      dispatch(setCustomerInfo(updatedCustomerInfo));
    } else {
      toastErrorWithExtraTime(response?.message || "Failed to add GST Info");
    }

    setLoading(false);
  };

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

  const handleReset = (): void => {
    setShowGstSelection(true);
    setSelectedGstNumbers([]);
    setCurrentGstIndex(0);
    setGstCredentials([]);
    setGstSelectionError("");
    setGstUserName("");
    setGstUserNameError(validationMessages.gstUserNameRequired);
    setOtp("");
    setShowOTP(false);
    setIsFormSubmitted(false);
    setLoading(false);
    setResendTimer(0);
    setCanResend(false);
    setShowNormalError("");
    setShowMethodSelection(false);
    setSelectedMethod("");
    setShowShareLinkOptions(false);
    setShareLinkMethod("");
    setEmail("");
    setEmailError("");
    setReferenceId("");
    setEmailList([]);
    setEmailListErrors([]);
    setAddGSTNumber(false);
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

  const handleBackToMethodSelection = (): void => {
    setShowMethodSelection(true);
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
  };

  const gstNumbersArray = getGstNumbersArray();

  return (
    <>
      <Dialog
        visible={reportLoading}
        onHide={() => { }}
        draggable={false}
        resizable={false}
        modal
        className="modalWrapper"
        blockScroll
      >
        <div className="text-center">
          <ModalLoader />
        </div>
        <h2 className="txt-orange mt-3">Processing…</h2>
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

      <Loader isLoading={loading} />

      <div className="col-12 justify-content-center d-flex">
        <div className="col-xl-8 col-lg-8 col-md-9 col-sm-9 col-10 mt-2">
          <div className="whiteBoxHldr shadow p-24">
            <div className="row">
              <h1 className="check-eligibilty-title-text">GST Details</h1>

              <>
                {showGstSelection && (
                  <div className="row">
                    <div className="form-group">
                      <label className="form-label small mt-4" htmlFor="gstin">
                        {gstNumbersArray.length > 1
                          ? "Select GST Numbers"
                          : "GST Number"}
                        <sup>*</sup>
                      </label>

                      {gstNumbersArray.length > 1 ? (
                        <>
                          <div
                            className={`border rounded-3 p-2 ${gstSelectionError ? "border-danger" : ""
                              }`}
                            style={{ maxHeight: "220px", overflowY: "auto" }}
                          >
                            <div
                              className="d-flex flex-column gap-2"
                              style={{ flexWrap: "wrap", overflow: "hidden" }}
                            >
                              {gstNumbersArray.map((gst) => {
                                const isSelected =
                                  selectedGstNumbers.includes(gst);

                                return (
                                  <button
                                    key={gst}
                                    type="button"
                                    className={`w-100 text-start rounded-3 px-3 py-2 border ${isSelected
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
                          placeholder="Enter GST Number"
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
                        onClick={() => {
                          handleReset();
                          prevStep?.();
                        }}
                        label="Previous"
                      />
                      <Button
                        className={`btn ${customerInfo?.gstNumber === "" ||
                            customerInfo?.gstNumber === null
                            ? "btn-orange-disabled"
                            : "btn-orange"
                          } ms-2 w-100 text-center`}
                        onClick={() => {
                          let newList =
                            gstNumbersArray.length > 1
                              ? selectedGstNumbers
                              : [gstNumbersArray[0]];

                          setSelectedGstNumbers(newList);
                          handleGstSelectionNext(newList);
                        }}
                        label="Next"
                        disabled={
                          customerInfo?.gstNumber === "" ||
                          customerInfo?.gstNumber === null
                        }
                      />
                    </div>
                  </div>
                )}

                {!showGstSelection && showMethodSelection && (
                  <div className="row">
                    <div className="form-group">
                      <label className="form-label mb-3">
                        <strong>Choose Report Generation Method</strong>
                      </label>
                      <div className="d-flex flex-column gap-3">
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
                        onClick={handleReset}
                        label="Back"
                      />
                      <Button
                        className={`btn ${!selectedMethod ? "btn-orange-disabled" : "btn-orange"
                          } ms-2 w-100 text-center`}
                        onClick={() => handleMethodSelection(selectedMethod)}
                        label="Continue"
                        disabled={!selectedMethod}
                      />
                    </div>
                  </div>
                )}

                {!showGstSelection && showShareLinkOptions && (
                  <div className="row">
                    {selectedGstNumbers.length === 1 ? (
                      <>
                        <div className="form-group mt-2">
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
                            <div
                              className={`p-3 border rounded ${referenceId
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

                            <div
                              className={`p-3 border rounded ${referenceId
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
                            <strong>Note:</strong> Please provide an email
                            address for each GST number. Multiple GST numbers
                            will use password authentication only.
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
                        onClick={() => {
                          setShowShareLinkOptions(false);
                          setShowMethodSelection(true);
                        }}
                        label="Back"
                      />

                      {referenceId ? (
                        <Button
                          className={`btn ${!referenceId ? "btn-orange-disabled" : "btn-orange"
                            } ms-2 w-100 text-center`}
                          onClick={handleReferenceIdSubmit}
                          label="Generate Report"
                          disabled={!referenceId}
                        />
                      ) : (
                        <Button
                          className={`btn ${(selectedGstNumbers.length === 1 &&
                              (!email || !shareLinkMethod)) ||
                              (selectedGstNumbers.length > 1 &&
                                emailList.some((e) => !e || !e.trim()))
                              ? "btn-orange-disabled"
                              : "btn-orange"
                            } ms-2 w-100 text-center`}
                          onClick={handleShareLinkGeneration}
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
                )}

                {!showGstSelection &&
                  !showMethodSelection &&
                  !showShareLinkOptions && (
                    <div className="row mt-2">
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
                          onChange={(e) => handleChangeUserName(e.target.value)}
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
                          disabled={showOTP}
                        />
                        <Button
                          className="btn btn-orange ms-2 w-100 text-center"
                          onClick={() => {
                            if (showOTP) {
                              if (
                                currentGstIndex <
                                selectedGstNumbers.length - 1
                              ) {
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
                                : "Next Step"
                              : "Get OTP"
                          }
                        />
                      </div>
                    </div>
                  )}
              </>

              {/* Skip button */}
              {/* {IsStringNullEmptyOrUndefined(customerInfo.gstNumber || "")
                ? !showOTP &&
                  customerInfo.enableGSTReport && ( */}
              <div className="form-group mt-4 d-flex justify-content-end">
                <Button onClick={nextStep} className="skipBtn">
                  <b>
                    Skip
                    <i className="bi bi-arrow-right ms-2" />
                  </b>
                </Button>
              </div>
              {/* )
                : null} */}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        visible={showSpecialPopup}
        onHide={() => setShowSpecialPopup(false)}
        draggable={false}
        resizable={false}
        modal
        header="Enable API Access on GST Portal"
        className="modalWrapper"
        footer={gstFooter}
        blockScroll
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
        header="Add GST Information"
        className="modalWrapper"
        style={{ width: "500px" }}
        footer={addGstNumberFooter}
        blockScroll
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
              setFormValues({ ...formValues, gstNumber: value });
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
                setFormErrors({ ...formErrors, gstNumber: "" });
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

        <div className="modal-footer gap-3">
          <Button
            className="btn btn-orange-line w-100"
            onClick={() => {
              setAddGSTNumber(false);
              handleReset();
            }}
          >
            Cancel
          </Button>
          <Button className="btn btn-orange w-100" onClick={handleAddGstInfo}>
            Add
          </Button>
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
          daysLeft={customerInfo?.gstReportRefetchedDays || 0}
          reportFetchFunction={() => {
            setShowGstSelection(false);
            setShowMethodSelection(true);
            setShowRefetchReport(false);
            setGstMessage("");
            // dispatch(
            //   setCustomerInfo((prev: any) => {
            //     if (!prev) return prev;

            //     const { gstReportRefetchedDays, ...rest } = prev;
            //     return rest;
            //   }),
            // );
          }}
          message={gstMessage}
        />
      )}
    </>
  );
};

export default GSTDetails;

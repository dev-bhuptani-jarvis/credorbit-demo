import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useState } from "react";
import { INextStepProps } from "./GetCreditScore";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import {
  IExternalReportResponse,
  IShareLinkITRReportBody,
} from "../../../interface/reports";
import {
  fileAutomatedRequestForItrAPI,
  fileAutomatedRequestForItrUsingLinkAPI,
  generateITRReportAPI,
  IsProceedForCamReport,
} from "../../../utils/axios/apiServices";
import {
  getFetchEligibilityStatus,
  showGlobalReportModal,
  toastError,
  toastErrorWithExtraTime,
  toastSuccess,
} from "../../../utils/functions/shared";
import {
  ITR_REPORT_NORMAL_ERROR,
  ITR_REPORT_TECHNICAL_ERROR,
} from "../../../utils/constants/constant";
import { Dialog } from "primereact/dialog";
import ModalLoader from "../../../components/ModalLoader";
import { validationMessages } from "../../../utils/constants/messages";
import { encryptVAPTData } from "../../../utils/functions/encryptDecrypt";
import { setCustomerInfo } from "../../../store/reducer/customerSlice";
import { APIResponseEntity } from "../../../interface/apiResponse";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../../utils/functions/sessionStorage";
import {
  ReportType,
  ReportTypeSignalR,
  StorageKeyEnum,
} from "../../../utils/constants/enum";
import { setUserData } from "../../../store/reducer/userSlice";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import { setImpersonateUser } from "../../../store/reducer/impersonateSlice";
import { useNavigate } from "react-router-dom";
import CreditNotAvailable from "../../../components/CreditNotAvailable";
import ReFetchModal from "../../../components/ReFetchModal";
import { IsNullOrUndefined } from "../../../utils/functions/nullCheck";
import {
  IIsProceedForCamReportResponse,
  IIsProceedForGeneratingReport,
} from "../../../interface/wallet";

const IncomeTaxDetail = ({ nextStep, prevStep }: INextStepProps) => {
  const [panPassword, setPanPassword] = useState<string>("");

  const [panPasswordErrors, setPanPasswordErrors] = useState<string>(
    validationMessages.panPasswordRequired,
  );

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [prevReportLoading, setPrevReportLoading] = useState<boolean>(false);

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [showCreditPopup, setShowCreditPopup] = useState<boolean>(false);

  const [showGenerateReportButton, setShowGenerateReportButton] =
    useState<boolean>(false);

  const [shareLinkReference, setShareLinkReference] =
    useState<IShareLinkITRReportBody>({
      referenceID: "",
      reservationId: "",
    });

  const [useShareLink, setUseShareLink] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");

  const [emailErrors, setEmailErrors] = useState<string>("");

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const { panNumber } = useSelector((state: RootState) => state.user.user);

  const { customerInfo } = useSelector((state: RootState) => state.customer);

  const eligibility = getFetchEligibilityStatus(customerInfo.itrReportDate);

  const [isRefetchFlow, setIsRefetchFlow] = useState<boolean>(false);

  const shouldShowRefetchPrompt =
    !IsNullOrUndefined(customerInfo?.itrReportDate) &&
    (eligibility?.daysLeft ?? 0) < 30;

  const canProceedNext =
    !IsNullOrUndefined(customerInfo?.itrReportDate) &&
    !shouldShowRefetchPrompt &&
    !isRefetchFlow &&
    !showGenerateReportButton;

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleChange = (value: string): void => {
    setPanPassword(value);
    setPanPasswordErrors(
      value.trim() ? "" : validationMessages.panPasswordRequired,
    );
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailErrors("Email is required");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailErrors("Please enter a valid email address");
      return false;
    }
    setEmailErrors("");
    return true;
  };

  const handleEmailChange = (value: string): void => {
    setEmail(value);
    if (isFormSubmitted) validateEmail(value);
  };

  const handleErrorMessage = (response: IExternalReportResponse) => {
    if (ITR_REPORT_NORMAL_ERROR.includes(response?.data?.responseCode)) {
      toastErrorWithExtraTime(response?.message);
    } else if (
      ITR_REPORT_TECHNICAL_ERROR.includes(response?.data?.responseCode)
    ) {
      setShowNormalError(response?.message);
    } else {
      toastErrorWithExtraTime(response?.message);
    }
  };

  const handleModeToggle = (mode: boolean): void => {
    setUseShareLink(mode);
    setIsFormSubmitted(false);
    setPanPassword("");
    setPanPasswordErrors(validationMessages.panPasswordRequired);
    setEmail("");
    setEmailErrors("");
    setShowNormalError("");
    setShowGenerateReportButton(false);
    setShareLinkReference({
      referenceID: "",
      reservationId: "",
    });
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

  const handleIncomeTaxDetail = async (): Promise<void> => {
    await proceedIfNotInProgress(async () => {
      setIsFormSubmitted(true);

      if (!panPassword.trim()) {
        setPanPasswordErrors(validationMessages.panPasswordRequired);
        return;
      }

      setReportLoading(true);

      const response: IExternalReportResponse =
        await fileAutomatedRequestForItrAPI({
          username: encryptVAPTData(panNumber),
          password: encryptVAPTData(panPassword),
        });

      if (!response) return;

      if (response.statusCode === 200) {
        showGlobalReportModal(response.message, "Income Tax Report Update");
        dispatch(setCustomerInfo({ ...customerInfo }));
        setShowGenerateReportButton(false);
        setIsRefetchFlow(false);
        nextStep?.();
      } else if (response.statusCode === 402) {
        !isImpersonate ? setShowCreditPopup(true) : handleImpersonateLogout();
      } else {
        handleErrorMessage(response);
      }

      setReportLoading(false);
    });
  };

  const handleShareLinkSubmit = async (): Promise<void> => {
    await proceedIfNotInProgress(async () => {
      setIsFormSubmitted(true);

      if (!validateEmail(email)) return;

      setReportLoading(true);

      const response: IExternalReportResponse =
        await fileAutomatedRequestForItrUsingLinkAPI({
          email: encryptVAPTData(email.trim()),
        });

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);

        setShowGenerateReportButton(true);

        setShareLinkReference({
          referenceID: response.data.referenceID!,
          reservationId: response.data.reservationId!,
        });

        setShowNormalError("");
      } else if (response.statusCode === 402) {
        !isImpersonate ? setShowCreditPopup(true) : handleImpersonateLogout();
      } else {
        handleErrorMessage(response);
      }

      setReportLoading(false);
    });
  };

  const handleCheckGenerateITRReport = async (): Promise<boolean> => {
    setPrevReportLoading(true);

    const response: IIsProceedForCamReportResponse =
      await IsProceedForCamReport(ReportTypeSignalR.IncomeTaxReport);

    setPrevReportLoading(false);

    if (!response) return false;

    if (response.statusCode === 200) {
      const data = response.data as IIsProceedForGeneratingReport;

      if (data?.isInProgress) {
        toastErrorWithExtraTime(response.message);
        return false;
      }
    }

    return true;
  };

  const proceedIfNotInProgress = async (action: () => Promise<void> | void) => {
    const canProceed = await handleCheckGenerateITRReport();
    if (!canProceed) return;

    await action();
  };

  const handleGenerateITRReport = async (): Promise<void> => {
    await proceedIfNotInProgress(async () => {
      setReportLoading(true);

      const response: APIResponseEntity =
        await generateITRReportAPI(shareLinkReference);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        dispatch(setCustomerInfo({ ...customerInfo }));
        setShowGenerateReportButton(false);
        setIsRefetchFlow(false);
        nextStep?.();
      } else if (response.statusCode === 402) {
        !isImpersonate ? setShowCreditPopup(true) : handleImpersonateLogout();
      } else {
        toastError(response.message);
      }

      setReportLoading(false);
    });
  };

  const handleClickITReport = (): void => {
    proceedIfNotInProgress(() => {
      if (shouldShowRefetchPrompt) {
        setShowRefetchReport(true);
      }
    });
  };

  return (
    <>
      <Dialog
        visible={reportLoading || prevReportLoading}
        onHide={() => {}}
        draggable={false}
        resizable={false}
        modal
        blockScroll
        className="modalWrapper"
      >
        <div className="text-center">
          <ModalLoader />
        </div>

        <h2 className="txt-orange mt-3">Processing...</h2>

        {prevReportLoading ? (
          <p className="mt-2">
            We are securely verifying your Income Tax Return (ITR) details and
            current status to ensure accurate processing.
          </p>
        ) : (
          <>
            <p className="mt-2">
              {useShareLink
                ? "Sending the link to your email. This might take a few moments."
                : "Hang on! Your report is being generated. This might take a few moments."}
            </p>
            <p className="mt-2">
              We’re securely fetching your ITR details. You’ll be automatically
              moved to the next step once it’s ready.
            </p>
          </>
        )}
      </Dialog>

      <div className="col-12 justify-content-center d-flex">
        <div className="col-xl-6 col-lg-6 col-md-8 col-sm-8 col-10 mt-2">
          <div className="whiteBoxHldr shadow p-24">
            <h1 className="check-eligibilty-title-text mb-3">
              Income Tax Details
            </h1>

            {canProceedNext && (
              <p>
                <span>
                  Your IT report has already been fetched. Please proceed to the
                  next step.
                </span>
              </p>
            )}

            {shouldShowRefetchPrompt && !isRefetchFlow && (
              <>
                <p className="mb-2">
                  You have already fetched this report{" "}
                  <span className="txt-orange">{eligibility?.daysLeft}</span>{" "}
                  {(eligibility?.daysLeft ?? 0) === 1 ? "day" : "days"} ago.
                  <br />
                  Do you want to re-fetch it?
                </p>

                <small className="text-muted d-block">
                  Note: Re-fetching your IT report may cut additional credits.
                  Please proceed with caution.
                </small>
              </>
            )}

            {(customerInfo?.itrReportDate === null ||
              showGenerateReportButton ||
              isRefetchFlow) && (
              <>
                <div className="form-group mb-3 d-flex gap-3">
                  <Button
                    className={`btn ${
                      useShareLink ? "btn-orange" : "btn-black-line"
                    } flex-fill text-center`}
                    onClick={() => handleModeToggle(true)}
                    label="Share Link"
                  />

                  <Button
                    className={`btn ${
                      !useShareLink ? "btn-orange" : "btn-black-line"
                    } flex-fill text-center`}
                    onClick={() => handleModeToggle(false)}
                    label="Manual Entry"
                  />
                </div>

                <div className="form-group mt-3">
                  <label className="form-label small" htmlFor="panNumber">
                    PAN<sup>*</sup>
                  </label>
                  <InputText
                    id="panNumber"
                    className="form-control"
                    placeholder="Enter the PAN Number"
                    value={panNumber}
                    name="panNumber"
                    disabled
                    // onPaste={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />
                </div>

                {useShareLink ? (
                  <div className="form-group mt-3">
                    <label className="form-label small" htmlFor="email">
                      Email Address<sup>*</sup>
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="Enter email address"
                      value={email}
                      name="email"
                      onChange={(e) => handleEmailChange(e.target.value)}
                    />
                    {isFormSubmitted && emailErrors && (
                      <span className="error">{emailErrors}</span>
                    )}
                    <small className="form-text text-muted mt-2 d-block">
                      A secure link will be sent to this email to complete the
                      authentication process.
                    </small>
                  </div>
                ) : (
                  <div className="form-group mt-3">
                    <label className="form-label small" htmlFor="panPassword">
                      Password<sup>*</sup>
                    </label>

                    <div className="d-flex align-items-center position-relative">
                      <InputText
                        type={showPassword ? "text" : "password"}
                        id="panPassword"
                        className="form-control pe-5"
                        placeholder="Enter the password"
                        value={panPassword.trim()}
                        maxLength={25}
                        name="panPassword"
                        onChange={(e) => handleChange(e.target.value)}
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                      />
                      <Button
                        className="btn position-absolute end-0 me-2 bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <img
                            src="/assets/images/eye.svg"
                            alt="eye-icon"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src="/assets/images/eye-slash.svg"
                            alt="eye-icon"
                            loading="lazy"
                          />
                        )}
                      </Button>
                    </div>
                    {isFormSubmitted && (
                      <span className="error">{panPasswordErrors}</span>
                    )}
                  </div>
                )}

                {showNormalError && (
                  <span className="error">{showNormalError}</span>
                )}
              </>
            )}

            <div className="form-group mt-4 d-flex">
              <Button
                className="btn btn-black-line text-center w-100"
                onClick={prevStep}
                label="Previous"
              />
              {shouldShowRefetchPrompt && !isRefetchFlow ? (
                <Button
                  className="btn btn-orange ms-2 w-100 text-center"
                  onClick={handleClickITReport}
                  label="Re-fetch Income Tax Report"
                />
              ) : canProceedNext ? (
                <Button
                  className="btn btn-orange ms-2 w-100 text-center"
                  onClick={nextStep}
                  label="Next"
                />
              ) : (
                <>
                  {showGenerateReportButton ? (
                    <Button
                      className="btn btn-orange ms-2 w-100 text-center"
                      onClick={handleGenerateITRReport}
                      label="Generate Report"
                    />
                  ) : (
                    <Button
                      className="btn btn-orange ms-2 w-100 text-center"
                      onClick={
                        useShareLink
                          ? handleShareLinkSubmit
                          : handleIncomeTaxDetail
                      }
                      label={useShareLink ? "Send Link" : "Get Details"}
                    />
                  )}
                </>
              )}
            </div>
            <div className="form-group mt-4 d-flex justify-content-end">
              <Button onClick={nextStep} className="skipBtn">
                <b>
                  Skip
                  <i className="bi bi-arrow-right ms-2" />
                </b>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreditNotAvailable
        isShow={showCreditPopup}
        onHide={() => setShowCreditPopup(false)}
        message="Your channel partner does not have credits. Please ask them to add the credits."
      />

      <ReFetchModal
        visible={showRefetchReport}
        onHide={() => setShowRefetchReport(false)}
        reportType={ReportType.IT_REPORT}
        daysLeft={eligibility?.daysLeft}
        reportFetchFunction={() => {
          setShowRefetchReport(false);
          setIsRefetchFlow(true);
          setShowGenerateReportButton(false);
          setShowNormalError("");
        }}
      />
    </>
  );
};

export default IncomeTaxDetail;

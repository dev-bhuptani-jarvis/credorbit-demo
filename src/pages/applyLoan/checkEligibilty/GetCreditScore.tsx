import { InputOtp } from "primereact/inputotp";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import {
  formatTime,
  getFetchEligibilityStatus,
  showGlobalReportModal,
  toastErrorWithExtraTime,
  toastSuccessWithExtraTime,
} from "../../../utils/functions/shared";
import {
  getCreditAnalyticsSendOtpAPI,
  getCreditAnalyticsVerifyOtpAPI,
  proceedForCreditReportAPI,
  resendOtpForCreditReportAPI,
} from "../../../utils/axios/apiServices";
import {
  IFetchCreditScoreBody,
  IResendOTPCreditScoreBody,
} from "../../../interface/client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import Loader from "../../../components/Loader";
import {
  OTPType,
  ReportType,
  StorageKeyEnum,
} from "../../../utils/constants/enum";
import { IExternalReportResponse } from "../../../interface/reports";
import { environment } from "../../../utils/constants/environments";
import { ILogoutResponse } from "../../../interface/logout";
import { incrementResendCount } from "../../../store/reducer/resendCountSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import { Dialog } from "primereact/dialog";
import {
  ICreditAnalyticsResponse,
  IPartnerScore,
} from "../../../interface/clientDashboard";
import ModalLoader from "../../../components/ModalLoader";
import CreditNotAvailable from "../../../components/CreditNotAvailable";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../../utils/functions/sessionStorage";
import { setUserData } from "../../../store/reducer/userSlice";
import { setImpersonateUser } from "../../../store/reducer/impersonateSlice";
import ReFetchModal from "../../../components/ReFetchModal";
import { IUserCreditInfo } from "../../dashboard/ClientDashboard";
import { setReportMessage } from "../../../store/reducer/reportMessageSlice";

export interface INextStepProps {
  nextStep?: () => void;
  prevStep?: () => void;
}

const GetCreditScore = ({ nextStep }: INextStepProps) => {
  const [otpValues, setOtpValues] = useState<string>("");

  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [referenceID, setReferenceID] = useState<string>("");

  const [reservationId, setReservationId] = useState<string>("");

  const [partnerId, setPartnerId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [showSpecialError, setShowSpecialError] = useState<boolean>(false);

  const [showCreditPopup, setShowCreditPopup] = useState<boolean>(false);

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const [showCreditScore, setShowCreditScore] = useState<boolean>(false);

  const { customerInfo } = useSelector((state: RootState) => state.customer);

  const { resendCount } = useSelector((state: RootState) => state.resend);

  const otpRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { state } = useLocation();

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (typeof value === "number" || typeof value === "string") {
      setOtpValues(String(value));
    } else {
      setOtpValues("");
    }

    setShowNormalError("");
  };

  const handleClickCreditReport = async (): Promise<void> => {
    setLoading(true);

    const eligibility = getFetchEligibilityStatus(
      customerInfo?.creditReportDate,
    );

    if (customerInfo?.creditReportDate === null) {
      handleReportFetchFunction();
    } else if ((eligibility?.daysLeft ?? 0) < 30) {
      setShowRefetchReport(true);
    } else {
      handleGetCreditScore();
    }

    setLoading(false);
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
      const response: IExternalReportResponse =
        await getCreditAnalyticsSendOtpAPI(partner?.id!);

      if (!response) return;

      if (response?.statusCode === 200) {
        setShowOTP(true);
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
        setShowOTP(false);
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

  const handlePartnerCreditReport = async (): Promise<void> => {
    setShowCreditScore(!showCreditScore);
  };

  const handleValidateOTP = async (): Promise<void> => {
    if (!otpValues || otpValues.toString().length !== OTPType.SIX_DIGIT_OTP) {
      toastErrorWithExtraTime(
        `Please enter a valid ${OTPType.SIX_DIGIT_OTP} digit OTP`,
      );
      return;
    }

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
      nextStep?.();
    }
    // else if (
    //   (response?.data as IExternalReportData)?.responseCode === "EPN492"
    // ) {
    //   setShowSpecialError(true);
    // } else if (typeof response?.data === "object") {
    //   handleErrorMessage(response as IExternalReportResponse);
    // }
    else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastErrorWithExtraTime(response.message);
    }

    setReportLoading(false);
    setOtpValues("");
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
      toastSuccessWithExtraTime(response.message);
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

  const handleBackClick = () => {
    if (state.parent) {
      navigate(RoutePathConstant.private.clientDashboard);
    } else {
      navigate(-1);
    }
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
      setShowOTP(false);

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

  return (
    <>
      <Dialog
        visible={reportLoading}
        modal
        draggable={false}
        resizable={false}
        className="modalWrapper"
        onHide={() => { }}
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

      <Loader isLoading={loading} />

      <div className="col-12 justify-content-center d-flex">
        <div className="col-lg-6 col-md-10 col-sm-10 col-7 mt-2">
          <div className="whiteBoxHldr shadow p-24">
            <div className="row">
              <h1 className="check-eligibilty-title-text">Get Credit Score</h1>

              {showOTP && (
                <div className="row mt-4">
                  <div className="form-group">
                    <label htmlFor="otpInput" className="form-label small">
                      Enter OTP<sup>*</sup>
                    </label>

                    <InputOtp
                      id="otpInput"
                      ref={otpRef}
                      value={otpValues}
                      onChange={(e) => handleOtpChange(e.value)}
                      length={OTPType.SIX_DIGIT_OTP}
                    />
                  </div>

                  {resendCount < 3 && (
                    <div className="registerWrapper mt-2">
                      {timeLeft > 0 ? (
                        <b
                          className="txt-14"
                          style={{ fontWeight: "600" }}
                        >{`Resending OTP in ${formatTime(timeLeft)}`}</b>
                      ) : (
                        <Button
                          className="resendBtn"
                          onClick={resendOTP}
                          label="Resend OTP"
                          disabled={loading || timeLeft > 0}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {showNormalError && (
                <span className="error">{showNormalError}</span>
              )}

              {!showOTP && (
                <p className="mt-2">
                  <p className="mt-2">
                    {customerInfo?.partners?.length > 0 ? (
                      <p className="my-3">
                        <span>
                          You can now check your partner’s credit score
                          instantly—safe, simple, and hassle-free.
                        </span>
                      </p>
                    ) : customerInfo.creditScore !== null ? (
                      <p className="my-3">
                        Your credit score data has been successfully retrieved,
                        and your current credit score is{" "}
                        <strong>{customerInfo.creditScore}</strong>
                      </p>
                    ) : (
                      <p className="my-3">
                        <span>
                          Don't know your credit score? Don't worry check it out
                          now.
                        </span>
                      </p>
                    )}
                  </p>
                </p>
              )}

              <div className="form-group mt-4 d-flex">
                <Button
                  className="btn btn-black-line w-100 text-center"
                  onClick={handleBackClick}
                  label="Back"
                />

                <Button
                  className="btn btn-orange ms-2 w-100 text-center"
                  onClick={
                    customerInfo?.partners?.length > 0
                      ? handlePartnerCreditReport
                      : showOTP
                        ? handleValidateOTP
                        : handleClickCreditReport
                  }
                  label={
                    loading
                      ? "Processing..."
                      : customerInfo?.partners?.length > 0
                        ? "Check Now"
                        : `Get ${showOTP ? "Credit Score" : "OTP"}`
                  }
                />
              </div>

              {!showOTP && (
                <div className="form-group mt-4 d-flex justify-content-end">
                  <Button onClick={nextStep} className="skipBtn">
                    <b style={{ fontSize: "1em" }}>
                      Skip
                      <i className="bi bi-arrow-right ms-2" />
                    </b>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
        daysLeft={customerInfo?.creditScoreRefetchedDays || 0}
        reportFetchFunction={handleReportFetchFunction}
      />

      {customerInfo && (
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
              showOTP || customerInfo?.partners?.length === 0
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
              We’re securely analyzing your credit data to generate report. This
              will only take a few seconds.
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
                            setOtpValues("");
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
                  {!customerInfo?.partners ||
                    customerInfo?.partners?.length === 0 ? (
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
                          className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
                            } text-center`}
                          onClick={() => {
                            setShowCreditScore(false);
                            handleGetCreditScore();
                          }}
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
                              Co-Applicant Profiles
                            </span>
                            <h3 className="credit-score-panel-title">
                              Select a co-applicant to fetch the score
                            </h3>
                            <p className="form-text mb-0">
                              Review available co-applicant records and continue
                              with the person whose score you want to retrieve.
                            </p>
                          </div>
                          <span className="credit-score-partner-count">
                            {customerInfo?.partners?.length} Co-Applicants
                          </span>
                        </div>

                        <div className="credit-score-partner-grid">
                          {customerInfo?.partners?.map(
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
    </>
  );
};

export default GetCreditScore;

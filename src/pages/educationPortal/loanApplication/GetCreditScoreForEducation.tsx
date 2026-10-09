import { useEffect, useMemo, useRef, useState } from "react";
import { InputOtp } from "primereact/inputotp";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import ModalLoader from "../../../components/ModalLoader";
import {
  getCoApplicantsListAPI,
  proceedForCreditReportEducationalInsituteAPI,
  resendOtpForCreditReportEducationalInsituteAPI,
  sendOtpForCreditReportEducationalInsituteAPI,
  verifyOtpAndGenerateReportEducationalInsituteAPI,
} from "../../../utils/axios/apiServices";
import {
  formatDate,
  formatTime,
  toastErrorWithExtraTime,
  toastSuccessWithExtraTime,
} from "../../../utils/functions/shared";
import {
  IFetchCreditScoreForEducationBody,
  IResendOTPCreditScoreForEducationBody,
} from "../../../interface/client";
import { ICreditAnalyticsResponse } from "../../../interface/clientDashboard";
import {
  IExternalReportResponse,
  IGetStudentCoApplicantsList,
  IGetStudentCoApplicantsListResponse,
} from "../../../interface/reports";
import { IIsProceedForCreditReportResponse } from "../../../interface/wallet";
import { OTPType } from "../../../utils/constants/enum";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import { IStudent } from "../../../interface/student";
import { decryptVAPTData } from "../../../utils/functions/encryptDecrypt";
import {
  CLIENT_ROLE,
  formatMobileNumber,
} from "../../../utils/constants/constant";

type EducationCreditScoreNavigationState = {
  loanApplicationId?: string;
  studentID?: string;
  studentName?: string;
  selectedStudent?: IStudent | null;
  isCreditReportRequired?: boolean;
  isBankingReportRequired?: boolean;
};

const GetCreditScoreForEducation = () => {
  const [otpValues, setOtpValues] = useState<string>("");

  const [showOTP, setShowOTP] = useState<boolean>(false);

  const [referenceID, setReferenceID] = useState<string>("");

  const [participantId, setParticipantId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [showCreditScore, setShowCreditScore] = useState<boolean>(false);

  const [participants, setParticipants] = useState<
    IGetStudentCoApplicantsList[]
  >([]);

  const [completedParticipantIds, setCompletedParticipantIds] = useState<
    string[]
  >([]);

  const otpRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const { state } = useLocation();

  const {
    loanApplicationId = "",
    studentID = "",
    studentName = "",
    selectedStudent = null,
    isCreditReportRequired = true,
    isBankingReportRequired = true,
  } = (state || {}) as EducationCreditScoreNavigationState;

  const availableParticipants = useMemo(
    () =>
      participants.filter(
        (participant) => !completedParticipantIds.includes(participant.id),
      ),
    [completedParticipantIds, participants],
  );

  const hasAnyCreditScore = useMemo(
    () =>
      participants.some(
        (participant) =>
          participant.creditScore !== null &&
          participant.creditScore !== undefined,
      ),
    [participants],
  );

  const hasCreditScore = (participant: IGetStudentCoApplicantsList): boolean =>
    participant.creditScore !== null ||
    completedParticipantIds.includes(participant.id);

  const getParticipantAddress = (
    participant: IGetStudentCoApplicantsList,
  ): string => {
    const addressParts = [
      participant.address ? decryptVAPTData(participant.address) : "",
      participant.city || "",
      participant.state || "",
      participant.pinCode || "",
    ].filter(Boolean);

    return addressParts.length > 0 ? addressParts.join(", ") : "-";
  };

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (typeof value === "number" || typeof value === "string") {
      setOtpValues(String(value));
    } else {
      setOtpValues("");
    }

    setShowNormalError("");
  };

  const fetchParticipants = async (): Promise<void> => {
    if (!loanApplicationId) {
      return;
    }

    setLoading(true);

    try {
      const params = {
        studentId: studentID,
      };

      const response: IGetStudentCoApplicantsListResponse =
        await getCoApplicantsListAPI(params);

      if (!(response && response.statusCode === 200)) {
        toastErrorWithExtraTime(response?.message);
        return;
      }

      setParticipants(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCreditScore = async (
    participant?: IGetStudentCoApplicantsList,
  ): Promise<void> => {
    if (!participant?.id) {
      toastErrorWithExtraTime("Please select an applicant.");
      return;
    }

    setLoading(true);

    const body = {
      partnerID: participant.id,
    };

    const proceedForResponse: IIsProceedForCreditReportResponse =
      await proceedForCreditReportEducationalInsituteAPI(body);

    if (!proceedForResponse) {
      setLoading(false);
      return;
    }

    if (proceedForResponse.statusCode !== 200) {
      setShowOTP(false);
      toastErrorWithExtraTime(proceedForResponse.message);
      setLoading(false);
      return;
    }

    if (!proceedForResponse.data?.isConsentRequired) {
      setShowOTP(false);
      toastSuccessWithExtraTime(proceedForResponse.message);
      setLoading(false);
      setShowCreditScore(false);
      return;
    }

    const response: IExternalReportResponse =
      await sendOtpForCreditReportEducationalInsituteAPI(participant.id);

    if (response?.statusCode === 200) {
      setShowOTP(true);
      setTimeLeft(30);
      setReferenceID(response?.data?.requestId || "");
      setParticipantId(participant.id);
      toastSuccessWithExtraTime(response?.message);
    } else {
      setShowOTP(false);
      toastErrorWithExtraTime(response?.message);
    }

    setLoading(false);
  };

  const handleClickCreditReport = async (): Promise<void> => {
    if (!loanApplicationId) {
      toastErrorWithExtraTime("Loan application ID is missing.");
      return;
    }

    await fetchParticipants();
    setShowCreditScore(true);
  };

  const handleValidateOTP = async (): Promise<void> => {
    if (!otpValues || otpValues.length !== OTPType.SIX_DIGIT_OTP) {
      toastErrorWithExtraTime(
        `Please enter a valid ${OTPType.SIX_DIGIT_OTP} digit OTP`,
      );
      return;
    }

    setReportLoading(true);

    const body: IFetchCreditScoreForEducationBody = {
      otp: otpValues,
      requestId: referenceID,
      // reservationId,
      partnerID: participantId,
      loanApplicationID: loanApplicationId,
      studentID,
    };

    const response: ICreditAnalyticsResponse =
      await verifyOtpAndGenerateReportEducationalInsituteAPI(body);

    if (response?.statusCode === 200) {
      toastSuccessWithExtraTime(response.message);

      setCompletedParticipantIds((previous) =>
        previous.includes(participantId)
          ? previous
          : [...previous, participantId],
      );

      setShowOTP(false);

      setOtpValues("");

      setReferenceID("");

      setTimeLeft(0);

      navigate(
        `${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`,
        {
          state: {
            selectedDraftId: loanApplicationId,
            loanApplicationId,
            studentID,
            studentName: selectedStudent?.fullName || studentName || "",
            selectedStudent,
          },
        },
      );
    } else {
      setShowNormalError(response?.message);
    }

    setReportLoading(false);
  };

  const resendOTP = async (): Promise<void> => {
    setLoading(true);
    setTimeLeft(30);

    const body: IResendOTPCreditScoreForEducationBody = {
      requestId: referenceID,
    };

    const response: IExternalReportResponse =
      await resendOtpForCreditReportEducationalInsituteAPI(body);

    if (response?.statusCode === 200) {
      toastSuccessWithExtraTime(response.message);
    } else {
      toastErrorWithExtraTime(response?.message);
    }

    setLoading(false);
  };

  const handleBackClick = () => {
    navigate(
      `${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`,
      {
        state: {
          selectedDraftId: loanApplicationId,
          loanApplicationId,
          studentID,
          studentName: selectedStudent?.fullName || studentName || "",
          selectedStudent,
        },
      },
    );
  };

  const handleGoToBankDetails = (): void => {
    navigate(RoutePathConstant.private.educationStudentBankDetails, {
      state: {
        isEducationPortal: true,
        previousRoute: "credit-score",
        loanApplicationId,
        studentID,
        studentName: selectedStudent?.fullName || studentName || "",
        selectedStudent,
        isBankingReportRequired,
      },
    });
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
    setTimeout(() => {
      const firstInput = document.querySelector(
        ".p-inputotp input",
      ) as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }, [showOTP]);

  useEffect(() => {
    fetchParticipants();
  }, [loanApplicationId, studentID]);

  useEffect(() => {
    if (otpValues && otpValues.length === OTPType.SIX_DIGIT_OTP) {
      handleValidateOTP();
    }
  }, [otpValues]);

  if (!loanApplicationId || !studentID) {
    return (
      <div className="whiteBoxHldr p-30">
        <p className="mb-3">Verification context is missing.</p>
        <Button
          className="btn btn-black-line"
          label="Back"
          onClick={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="whiteBoxHldr p-30">
        <div className="row">
          <div className="col-12">
            <div className="col-12 mb-4 titleMainWrapper txt-orange">
              <h2 className="client-welcome">
                <span>Application for,</span>{" "}
                {selectedStudent?.fullName || studentName || "Student"}
              </h2>
            </div>

            <Loader isLoading={loading} />

            <div className="col-12 justify-content-center d-flex mt-5">
              <div className="col-lg-6 col-md-10 col-sm-10 col-7 mt-2">
                <div className="whiteBoxHldr shadow p-24">
                  <div className="row text-heading-muted">
                    <h1 className="check-eligibilty-title-text">
                      Get Credit Score
                    </h1>

                    <p className="my-3">
                      Select the applicant or co-applicant and continue to fetch
                      the credit report.
                    </p>

                    <div className="form-group mt-4 d-flex">
                      <Button
                        className="btn btn-black-line w-100 text-center"
                        onClick={handleBackClick}
                        label="Back"
                      />

                      {hasAnyCreditScore ? (
                        <Button
                          className="btn btn-black-line ms-2 w-100 text-center"
                          onClick={handleClickCreditReport}
                          label="View / Fetch Credit Score"
                          disabled={loading}
                        />
                      ) : (
                        <Button
                          className="btn btn-orange ms-2 w-100 text-center"
                          onClick={handleClickCreditReport}
                          label="Fetch Credit Score"
                        />
                      )}

                      {!isCreditReportRequired ? (
                        <Button
                          className="btn btn-orange ms-2 w-100 text-center"
                          onClick={handleGoToBankDetails}
                          label="Skip"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                  showOTP || availableParticipants.length === 0
                    ? "760px"
                    : "960px",
                margin: "30px",
              }}
            >
              <Loader isLoading={loading} />

              <div className="modal-content">
                <div className="modal-body credit-score-dialog-body">
                  {showOTP ? (
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

                        <div className="registerWrapper mt-2 credit-score-otp-meta">
                          {timeLeft > 0 ? (
                            <b className="txt-14">{`Resend OTP in ${formatTime(timeLeft)}`}</b>
                          ) : (
                            <Button
                              className="resendBtn p-button-link"
                              onClick={resendOTP}
                              label="Resend OTP"
                              disabled={loading || timeLeft > 0}
                            />
                          )}
                        </div>

                        {showNormalError && (
                          <span className="error">{showNormalError}</span>
                        )}
                      </div>

                      <div className="modal-footer mt-3 credit-score-footer">
                        <Button
                          className="btn btn-black-line w-100 text-center"
                          onClick={() => {
                            setTimeLeft(0);
                            setShowOTP(false);
                            setOtpValues("");
                            setShowNormalError("");
                          }}
                          label="Back"
                          disabled={loading}
                        />
                        <Button
                          className="btn btn-orange ms-2 w-100 text-center"
                          onClick={() => void handleValidateOTP()}
                          label="Verify OTP"
                          disabled={loading}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {participants.length === 0 ? (
                        <>
                          <p>No applicant or co-applicant details available.</p>
                          <div className="modal-footer credit-score-footer">
                            <Button
                              className="btn btn-black-line text-center"
                              onClick={() => setShowCreditScore(false)}
                              label="Close"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="credit-score-partner-state">
                            <div className="credit-score-partner-state-header">
                              <div>
                                <span className="credit-score-eyebrow">
                                  Profiles
                                </span>
                                <h3 className="credit-score-panel-title">
                                  Select a profile to fetch the score
                                </h3>
                                <p className="form-text mb-0">
                                  Review the available applicants and
                                  co-applicants, then continue with the person
                                  whose credit report you want to fetch.
                                </p>
                              </div>
                              <span className="credit-score-partner-count">
                                {participants.length} Profiles
                              </span>
                            </div>

                            <div className="credit-score-partner-grid">
                              {participants.map(
                                (person: IGetStudentCoApplicantsList) => (
                                  <div
                                    key={person.id}
                                    className="credit-score-partner-card"
                                  >
                                    <div className="credit-score-partner-card-top">
                                      <div>
                                        <h4>{person.name || "Applicant"}</h4>
                                        <p>
                                          {person.userType ===
                                            CLIENT_ROLE.CO_APPLICANT
                                            ? "Co-Applicant"
                                            : "Applicant"}
                                        </p>
                                        <p>
                                          {hasCreditScore(person)
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
                                            </div>
                                          </div>
                                        )}
                                    </div>

                                    <div className="row mt-3 text-start">
                                      <div className="col-md-6 mb-3">
                                        <b>PAN</b>
                                        <p className="mb-0 text-break">
                                          {person.pan
                                            ? decryptVAPTData(person.pan)
                                            : "-"}
                                        </p>
                                      </div>
                                      <div className="col-md-6 mb-3">
                                        <b>Aadhaar Number</b>
                                        <p className="mb-0 text-break">
                                          {person.aadhaarNumber
                                            ? decryptVAPTData(
                                              person.aadhaarNumber,
                                            )
                                            : "-"}
                                        </p>
                                      </div>
                                      <div className="col-md-6 mb-3">
                                        <b>Mobile Number</b>
                                        <p className="mb-0 text-break">
                                          {person.mobile
                                            ? formatMobileNumber(
                                              decryptVAPTData(person.mobile),
                                            )
                                            : "-"}
                                        </p>
                                      </div>
                                      <div className="col-md-6 mb-3">
                                        <b>Date of Birth</b>
                                        <p className="mb-0 text-break">
                                          {person.dateOfBirth
                                            ? formatDate(
                                              decryptVAPTData(
                                                person.dateOfBirth,
                                              ),
                                              "DD MMM, YYYY",
                                            )
                                            : "-"}
                                        </p>
                                      </div>
                                      <div className="col-md-6 mb-3">
                                        <b>Gender</b>
                                        <p className="mb-0 text-break">
                                          {person.gender
                                            ? person.gender
                                              .charAt(0)
                                              .toUpperCase() +
                                            person.gender
                                              .slice(1)
                                              .toLowerCase()
                                            : "-"}
                                        </p>
                                      </div>
                                      <div className="col-md-6 mb-3">
                                        <b>Credit Score</b>
                                        <p className="mb-0 text-break">
                                          {person.creditScore ?? "-"}
                                        </p>
                                      </div>
                                      <div className="col-12 mb-3">
                                        <b>Address</b>
                                        <p className="mb-0 text-break">
                                          {getParticipantAddress(person)}
                                        </p>
                                      </div>
                                    </div>

                                    <Button
                                      className="btn btn-orange credit-score-partner-action"
                                      label="Check Credit Score"
                                      disabled={loading}
                                      onClick={() =>
                                        handleGetCreditScore(person)
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
              <p className="mt-2">
                Hang on! The credit report is being generated for the selected
                applicant.
              </p>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetCreditScoreForEducation;

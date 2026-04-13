import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import {
  generateAadharOTP,
  getApplyForLoanAPI,
  submitApplicationToBankAPI,
  submitApplyForLoanAPI,
  updateAadharAPI,
} from "../utils/axios/apiServices";
import {
  IApplyLoanValidation,
  IApplyLoanValues,
  ICoApplicantList,
  IGetApplyForLoanParams,
  IGetApplyForLoanResponse,
  ISubmitCoApplicant,
  ApplyLoanModalProps,
  IReferences,
  ISubmitApplicationToBankDetailsResponseData,
} from "../interface/applyLoan";
import { MultiSelect } from "primereact/multiselect";
import {
  formatTime,
  generateEmailFromTemplate,
  restrictInputByPattern,
  toastError,
  toastErrorWithExtraTime,
  toastSuccess,
} from "../utils/functions/shared";
import { APIResponseEntity } from "../interface/apiResponse";
import { NUMBER_ONLY_PATTERN } from "../utils/constants/pattern";
import Loader from "./Loader";
import { IsStringNullEmptyOrUndefined } from "../utils/functions/nullCheck";
import { IAadharCardResponse, OnlyAadharNumber } from "../interface/contract";
import { InputOtp } from "primereact/inputotp";
import { environment } from "../utils/constants/environments";
import { IUpdateAadhaarBody } from "../interface/userData";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { useLocation, useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { OTPType } from "../utils/constants/enum";
import { validationMessages } from "../utils/constants/messages";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../utils/functions/encryptDecrypt";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const ApplyLoanModal = ({
  loanModal,
  setLoanModal,
  bankInfo,
}: ApplyLoanModalProps) => {
  const [formValues, setFormValues] = useState<IApplyLoanValues>();

  const [formErrors, setFormErrors] = useState<IApplyLoanValidation>({
    dsaCode: "DSA Code is required",
    payoutPercentage: "Payout Percentage is required",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [selectedCoApplicant, setSelectedCoApplicant] = useState<
    ICoApplicantList[]
  >([]);

  const [dsaCode, setDsaCode] = useState<string>("");

  const [references, setReferences] = useState<IReferences>({
    referenceName1: "",
    referenceMobile1: "",
    referenceAddress1: "",
    referenceName2: "",
    referenceMobile2: "",
    referenceAddress2: "",
  });

  const [aadhaarInputs, setAadhaarInputs] = useState<{ [key: string]: string }>(
    {},
  );

  const [verifiedAadhaar, setVerifiedAadhaar] = useState<{
    [key: string]: boolean;
  }>({});

  const [aadharCardPopUp, setAadharCardPopUp] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [otpValues, setOtpValues] = useState<number | undefined>(undefined);

  const [selectedAadhaar, setSelectedAadhaar] = useState<string>("");

  const [selectedCoApplicantID, setSelectedCoApplicantID] =
    useState<string>("");

  const [clientID, setClientID] = useState<string>("");

  const [showEmailChooser, setShowEmailChooser] = useState<boolean>(false);

  const [emailPayload, setEmailPayload] =
    useState<ISubmitApplicationToBankDetailsResponseData | null>(null);

  const [isProcessingModalVisible, setIsProcessingModalVisible] =
    useState<boolean>(false);

  const [processingProgress, setProcessingProgress] = useState<number>(0);

  const [currentProcessingMessageIndex, setCurrentProcessingMessageIndex] =
    useState<number>(0);

  const { state } = useLocation();

  const navigate = useNavigate();

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const handleClose = () => {
    setLoanModal(false);
    setDsaCode("");
    setReferences({
      referenceName1: "",
      referenceMobile1: "",
      referenceAddress1: "",
      referenceName2: "",
      referenceMobile2: "",
      referenceAddress2: "",
    });
    setSelectedCoApplicant([]);
    setFormErrors({
      dsaCode: "DSA Code is required",
      payoutPercentage: "Payout Percentage is required",
    });
    setIsFormSubmitted(false);
    setLoading(false);
    setAadharCardPopUp(false);
    setShowEmailChooser(false);
    setIsProcessingModalVisible(false);
    setProcessingProgress(0);
    setCurrentProcessingMessageIndex(0);
  };

  const processingMessages = [
    "We’re securely retrieving your application details and preparing your financial profile for submission.",
    "We’re preparing your documents and compiling a comprehensive financial report to ensure everything is accurate and complete.",
    "Almost done — we’re securely submitting your application to the bank.",
  ];

  const processingMilestones = [35, 70, 100];

  const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const updateProcessingModal = async (
    stepIndex: number,
    shouldPause = false,
  ): Promise<void> => {
    const percentage = processingMilestones[stepIndex];

    if (!percentage) return;

    setProcessingProgress(percentage);

    if (shouldPause) {
      await wait(600);
    }
  };

  const openEmailClient = (
    emailData: ISubmitApplicationToBankDetailsResponseData,
  ) => {
    setEmailPayload(emailData);
    setShowEmailChooser(true); // open modal
  };

  const openGmail = () => {
    if (!emailPayload) return;

    const { subject, body } = generateEmailFromTemplate(emailPayload);
    const to = emailPayload.loanDetails.managerEmail;
    const bcc = "support@credorbit.com";

    const gmailURL =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(to)}` +
      `&bcc=${encodeURIComponent(bcc)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(
      gmailURL,
      "shareWindow",
      "width=600,height=500,left=100,top=100,noopener,noreferrer",
    );

    setShowEmailChooser(false);
    handleClose();
    navigate(RoutePathConstant.private.clientDashboard);
  };

  const openOutlook = () => {
    if (!emailPayload) return;

    const { subject, body } = generateEmailFromTemplate(emailPayload);
    const to = emailPayload.loanDetails.managerEmail;
    const bcc = "support@credorbit.com";

    const outlookBody = `Please CC: ${bcc}\n\n` + body.replace(/\n/g, "\r\n");

    const outlookURL =
      "https://outlook.office.com/mail/0/deeplink/compose" +
      "?popoutv2=1" +
      `&to=${encodeURIComponent(to)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(outlookBody)}`;

    window.open(
      outlookURL,
      "shareWindow",
      "width=600,height=500,left=100,top=100,noopener,noreferrer",
    );

    setShowEmailChooser(false);
    handleClose();
    navigate(RoutePathConstant.private.clientDashboard);
  };

  const openDefaultMail = () => {
    if (!emailPayload) return;

    const { subject, body } = generateEmailFromTemplate(emailPayload);
    const to = emailPayload.loanDetails.managerEmail;
    const bcc = "support@credorbit.com";

    const mailtoLink =
      `mailto:${to}` +
      `?bcc=${encodeURIComponent(bcc)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    setShowEmailChooser(false);
    handleClose();
    navigate(RoutePathConstant.private.clientDashboard);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsFormSubmitted(true);

    let errors: IApplyLoanValidation = { ...formErrors };

    // ✅ DSA Code validation
    if (!isDefaultCpClient && IsStringNullEmptyOrUndefined(dsaCode)) {
      errors.dsaCode = "DSA Code is required";
    }

    // ✅ Payout validation
    if (
      !isDefaultCpClient &&
      (!formValues?.channelPartnerPayoutPercent ||
        Number(formValues.channelPartnerPayoutPercent) <= 0)
    ) {
      errors.payoutPercentage = "Payout Percentage is required";
    }

    setFormErrors(errors);

    const isValid = Object.values(errors).every((val) => !val);

    if (!isValid) return;

    setIsProcessingModalVisible(true);

    const fieldsToEncrypt: (keyof IReferences | "dsaCode")[] = [
      "referenceMobile1",
      "referenceMobile2",
      "referenceAddress1",
      "referenceAddress2",
    ];

    const encryptedReferences = Object.keys(references).reduce((acc, key) => {
      const typedKey = key as keyof IReferences;
      const value = references[typedKey]?.trim?.() || "";

      if (value !== "") {
        acc[typedKey] = fieldsToEncrypt.includes(typedKey)
          ? encryptVAPTData(value)
          : value;
      }

      return acc;
    }, {} as Partial<IReferences>);

    const body: ISubmitCoApplicant = {
      loanApplicationID: state.loanApp,
      bankID: bankInfo.bankID,
      loanTenureID: bankInfo.loanTenureID,
      rateOfInterest: bankInfo.rateOfInterest,

      ...(selectedCoApplicant.length > 0 && {
        coApplicantsList: selectedCoApplicant.map((a) => a.id),
      }),

      ...(Object.keys(encryptedReferences).length > 0 && encryptedReferences),

      ...(dsaCode?.trim() && { dsaCode: encryptVAPTData(dsaCode) }),

      ...(formValues?.channelPartnerPayoutPercent != null &&
        formValues.channelPartnerPayoutPercent > 0 && {
          channelPartnerPayoutPercent: Number(
            formValues.channelPartnerPayoutPercent,
          ),
        }),

      ...(formValues?.sourcingPartnerPayoutPercent != null &&
        formValues.sourcingPartnerPayoutPercent > 0 && {
          sourcingPartnerPayoutPercent: Number(
            formValues.sourcingPartnerPayoutPercent,
          ),
        }),
    };

    const response = await submitApplyForLoanAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      await updateProcessingModal(0, true);
      await handleSendMailToManager();
    } else {
      toastError(response?.message);
    }
  };

  const handleSendMailToManager = async (): Promise<void> => {
    setLoading(true);
    await updateProcessingModal(1);

    const params: IGetApplyForLoanParams = {
      loanApplicationID: state.loanApp,
      bankID: bankInfo?.bankID,
    };

    const response = await submitApplicationToBankAPI(params);

    if (!response) {
      setIsProcessingModalVisible(false);
      setProcessingProgress(0);
      setCurrentProcessingMessageIndex(0);
      setLoading(false);
      return;
    }

    if (response && response.statusCode === 200) {
      await updateProcessingModal(2, true);
      setIsProcessingModalVisible(false);
      setProcessingProgress(0);
      setCurrentProcessingMessageIndex(0);
      openEmailClient(response.data);

      // setTimeout(
      //   () => navigate(RoutePathConstant.private.clientDashboard),
      //   2000,
      // );
    } else {
      setIsProcessingModalVisible(false);
      setProcessingProgress(0);
      setCurrentProcessingMessageIndex(0);
      toastError(response.message);
    }

    setLoading(false);
    // handleClose();
  };

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (typeof value === "number") {
      setOtpValues(value);
    } else if (typeof value === "string") {
      setOtpValues(Number(value));
    } else {
      setOtpValues(undefined);
    }
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className={`btn ${
          loading ? "btn-black-line-disabled" : "btn-black-line"
        } w-100`}
        onClick={handleClose}
        disabled={loading}
      >
        Cancel
      </Button>

      <Button
        className={`btn ${
          loading ? "btn-orange-disabled" : "btn-orange"
        } w-100`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Applying..." : "Apply"}
      </Button>
    </div>
  );

  const handleAgree = async (): Promise<void> => {
    if (!otpValues || otpValues.toString().length !== OTPType.SIX_DIGIT_OTP) {
      toastErrorWithExtraTime(
        `Please enter a valid ${OTPType.SIX_DIGIT_OTP} digit OTP`,
      );
      return;
    }

    setLoading(true);

    const body: IUpdateAadhaarBody = {
      clientID,
      otp: String(otpValues),
      coapplicantOrPartnerID: selectedCoApplicantID,
      aadhaarNumber: encryptVAPTData(selectedAadhaar.replace(/\D/g, "")),
      userType: CLIENT_ROLE.CO_APPLICANT,
    };

    const response: APIResponseEntity = await updateAadharAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setVerifiedAadhaar((prev) => ({
        ...prev,
        [selectedCoApplicantID]: true, // Mark Aadhaar as verified
      }));
      setAadharCardPopUp(false);
      toastSuccess(response.message);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const aadharFooterContent = (
    <div className="modal-footer gap-3">
      <Button className="btn btn-black-line w-100" onClick={handleClose}>
        Cancel
      </Button>

      <Button className="btn btn-orange w-100" onClick={handleAgree}>
        Add Aadhaar Number
      </Button>
    </div>
  );

  const emailFooterContent = (
    <div className="modal-footer gap-3">
      <Button
        className={`btn ${
          loading ? "btn-black-line-disabled" : "btn-black-line"
        } w-100`}
        onClick={handleClose}
        disabled={loading}
      >
        Cancel
      </Button>
    </div>
  );

  const fetchLoanDetailData = async () => {
    setLoading(true);

    const params: IGetApplyForLoanParams = {
      loanApplicationID: state.loanApp,
    };

    const response: IGetApplyForLoanResponse = await getApplyForLoanAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedSelected = response.data.coApplicantsList.map(
        (applicant) => ({
          ...applicant,
          pan: applicant.pan ? decryptVAPTData(applicant.pan) : "",
          aadhaarNumber: applicant.aadhaarNumber
            ? decryptVAPTData(applicant.aadhaarNumber)
            : "",
        }),
      );

      const decryptedResponse = {
        ...response.data,
        coApplicantsList: decryptedSelected,
      };

      setFormValues(decryptedResponse);

      if (
        !decryptedResponse.channelPartnerPayoutPercent &&
        decryptedResponse.channelPartnerPayoutPercent !== 0
      ) {
        setFormErrors((prev) => ({
          ...prev,
          payoutPercentage: "Payout Percentage is required",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          payoutPercentage: "",
        }));
      }
    }

    setLoading(false);
  };

  const handleCoApplicantChange = (selected: ICoApplicantList[]) => {
    if (selected.length > 2) {
      toastError("You can maximum select two co-applicants.");
      return;
    }

    setSelectedCoApplicant(selected);
  };

  const handleReferenceChange = (key: string, value: string) => {
    setReferences((prevReferences) => ({
      ...prevReferences,
      [key]: value,
    }));
  };

  const handleChangeDSACode = (fieldName: string, value: string): void => {
    if (fieldName === "dsaCode") {
      setFormErrors((prev) => ({
        ...prev,
        dsaCode: IsStringNullEmptyOrUndefined(value)
          ? "DSA Code is required"
          : "",
      }));
    }

    setDsaCode(value);
  };

  const handleAadhaarChange = (id: string, value: string) => {
    setAadhaarInputs((prev) => ({
      ...prev,
      [id]: value, // Store Aadhaar input separately
    }));
  };

  const handleVerifyAadhaar = async (id: string): Promise<void> => {
    if (!aadhaarInputs[id] || aadhaarInputs[id].length !== 12) {
      toastError(validationMessages.aadhaarInvalid);
      return;
    }

    setLoading(true);
    setTimeLeft(environment.OTP_TIMER);

    const body: OnlyAadharNumber = {
      userID: id,
      aadharNumber: encryptVAPTData(aadhaarInputs[id].replace(/\D/g, "")),
    };

    const response: IAadharCardResponse = await generateAadharOTP(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setClientID(response.data.clientId);
      toastSuccess(response.message);
      setAadharCardPopUp(true);
      setSelectedAadhaar(aadhaarInputs[id]);
      setSelectedCoApplicantID(id);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const resendOTP = async (): Promise<void> => {
    setLoading(true);
    setTimeLeft(environment.OTP_TIMER); // Reset timer

    const body: OnlyAadharNumber = {
      userID: selectedCoApplicantID,
      aadharNumber: encryptVAPTData(selectedAadhaar.replace(/\D/g, "")),
    };

    const response: IAadharCardResponse = await generateAadharOTP(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const dialogHeader = (
    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between w-100 gap-2">
      <span className="fw-semibold">Apply For Loan</span>

      <div className="d-flex align-items-center gap-2 info-box">
        <i className="bi bi-info-circle-fill text-primary" />
        <small className="info-text">
          For any further query, contact{" "}
          <a
            href="tel:+919824909300"
            className="fw-semibold text-decoration-none"
          >
            +91 98249 09300
          </a>
        </small>
      </div>
    </div>
  );

  const handlePercentageChange = (
    field: keyof IApplyLoanValues,
    value: string,
  ) => {
    // Regex: allow only numbers with up to 2 decimals
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      // Empty check
      if (value === "") {
        setFormErrors((prev) => ({
          ...prev,
          payoutPercentage: "Payout Percentage is required",
        }));
        setFormValues((prev) => ({
          ...prev!,
          [field]: "",
        }));
        return;
      }

      const num = parseFloat(value);

      // Min/max validation
      if (num <= 0 || num > 100) {
        setFormErrors((prev) => ({
          ...prev,
          payoutPercentage: "Payout Percentage must be between 0 and 100",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          payoutPercentage: "",
        }));
      }

      setFormValues((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  useEffect(() => {
    fetchLoanDetailData();
  }, []);

  useEffect(() => {
    setTimeLeft(environment.OTP_TIMER);
  }, []);

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
    if (otpValues && otpValues.toString().length === OTPType.SIX_DIGIT_OTP) {
      handleAgree();
    }
  }, [otpValues]);

  useEffect(() => {
    if (isDefaultCpClient) {
      setDsaCode("");

      setFormValues((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          channelPartnerPayoutPercent: undefined,
        };
      });

      setFormErrors({
        dsaCode: "",
        payoutPercentage: "",
      });
    }
  }, [isDefaultCpClient]);

  useEffect(() => {
    if (!isProcessingModalVisible) {
      setCurrentProcessingMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentProcessingMessageIndex(
        (prev) => (prev + 1) % processingMessages.length,
      );
    }, 2200);

    return () => clearInterval(timer);
  }, [isProcessingModalVisible]);

  return (
    <>
      <Dialog
        header={dialogHeader}
        visible={loanModal}
        modal
        onHide={handleClose}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={footerContent}
        blockScroll
        style={{ width: "95vw", maxWidth: "1000px" }}
        contentStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <div className="row">
          <Loader isLoading={loading} />

          {!isDefaultCpClient && (
            <div className="row">
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label
                  className="form-label small"
                  htmlFor="channelPartnerCode"
                >
                  Channel Partner Code
                </label>

                <InputText
                  name="channelPartnerCode"
                  className="form-control"
                  placeholder="Enter Channel Partner Code"
                  disabled
                  value={formValues?.channelPartnerCode}
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label className="form-label small" htmlFor="dsaCode">
                  DSA Code <sup>*</sup>
                </label>

                <InputText
                  name="dsaCode"
                  className="form-control"
                  placeholder="Enter your DSA Code"
                  value={dsaCode.trim()}
                  onChange={(e) =>
                    handleChangeDSACode("dsaCode", e.target.value)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && formErrors.dsaCode && (
                  <span className="error">{formErrors.dsaCode}</span>
                )}
              </div>

              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-lg-0">
                <label
                  className="form-label small"
                  htmlFor="channelPartnerPayoutPercent"
                >
                  Payout Percentage <sup>*</sup>
                </label>

                <InputText
                  name="channelPartnerPayoutPercent"
                  className="form-control"
                  placeholder="Enter your Payout Percentage"
                  value={formValues?.channelPartnerPayoutPercent?.toString()}
                  onChange={(e) =>
                    handlePercentageChange(
                      "channelPartnerPayoutPercent",
                      e.target.value,
                    )
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && formErrors.payoutPercentage && (
                  <span className="error">{formErrors.payoutPercentage}</span>
                )}
              </div>
            </div>
          )}

          {formValues?.sourcingPartnerName !== null && (
            <>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0 mt-3">
                <label className="form-label small" htmlFor="sourcingPartner">
                  Sourcing Partner
                </label>

                <InputText
                  name="sourcingPartner"
                  className="form-control"
                  placeholder="Sourcing Partner"
                  value={formValues?.sourcingPartnerName}
                  disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0 mt-3">
                <label
                  className="form-label small"
                  htmlFor="sourcingPartnerPayoutPercent"
                >
                  Sourcing Partner Payout(%)
                </label>

                <InputText
                  name="sourcingPartnerPayoutPercent"
                  className="form-control"
                  placeholder="Sourcing Partner Pay-out"
                  value={formValues?.sourcingPartnerPayoutPercent?.toString()}
                  onChange={(e) =>
                    handlePercentageChange(
                      "sourcingPartnerPayoutPercent",
                      e.target.value,
                    )
                  }
                  disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            </>
          )}
          <div
            className={`form-group mt-3 ${
              formValues?.sourcingPartnerName !== null
                ? "col-4"
                : "col-lg-6 col-12 mb-2"
            }`}
          >
            <label className="form-label small" htmlFor="coapplicantPAN">
              Select Co-Applicant
            </label>

            <MultiSelect
              placeholder="Select Co-Applicants"
              value={selectedCoApplicant}
              onChange={(e) => handleCoApplicantChange(e.value)}
              options={formValues?.coApplicantsList?.map((option) => ({
                label: option.name,
                value: option,
              }))}
              maxSelectedLabels={2}
            />
          </div>

          {selectedCoApplicant.length > 0 &&
            selectedCoApplicant.map((coApplicant, index) => {
              return (
                <div className="row mt-3" key={coApplicant.id}>
                  <div className="form-group col-lg-6 col-12 mb-2">
                    <div>
                      <label
                        className="form-label small"
                        htmlFor="coapplicantPAN"
                      >
                        Co-Applicant’s ({index + 1}) PAN No.
                      </label>

                      <InputText
                        name="coapplicantPAN"
                        className="form-control"
                        placeholder="Enter PAN Number"
                        value={coApplicant.pan.trim()}
                        disabled
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                      />
                    </div>
                  </div>
                  <div className="form-group col-lg-6 col-12 mb-2">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label small"
                        htmlFor="coapplicantAadhar"
                      >
                        Co-Applicant’s ({index + 1}) Aadhar No.
                      </label>

                      {aadhaarInputs[coApplicant.id] &&
                        !verifiedAadhaar[coApplicant.id] && (
                          <span
                            className="txt-14 txt-orange"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleVerifyAadhaar(coApplicant.id)}
                          >
                            Verify Aadhaar Number
                          </span>
                        )}
                    </div>
                    <InputText
                      name="coapplicantAadhar"
                      className="form-control"
                      placeholder="Enter Aadhaar Number"
                      value={
                        aadhaarInputs[coApplicant.id] ||
                        coApplicant?.aadhaarNumber?.trim()
                      }
                      onChange={(e) =>
                        handleAadhaarChange(coApplicant.id, e.target.value)
                      }
                      disabled={
                        verifiedAadhaar[coApplicant.id] ||
                        !!coApplicant.aadhaarNumber
                      }
                      maxLength={12}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              );
            })}
          <div className="mt-3">
            <h2 className="txt-20">Add References</h2>

            <div className="row mt-3">
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label className="form-label small" htmlFor="referenceName1">
                  Name
                </label>

                <InputText
                  name="referenceName1"
                  className="form-control"
                  placeholder="Enter Name"
                  value={references.referenceName1}
                  onChange={(e) =>
                    handleReferenceChange("referenceName1", e.target.value)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label className="form-label small" htmlFor="referenceMobile1">
                  Mobile
                </label>

                <InputText
                  name="referenceMobile1"
                  className="form-control"
                  placeholder="Enter Mobile Number"
                  value={references.referenceMobile1}
                  onChange={(e) =>
                    handleReferenceChange("referenceMobile1", e.target.value)
                  }
                  maxLength={10}
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-lg-0">
                <label className="form-label small" htmlFor="referenceAddress1">
                  Address
                </label>

                <InputText
                  name="referenceAddress1"
                  className="form-control"
                  placeholder="Enter Address"
                  value={references.referenceAddress1}
                  onChange={(e) =>
                    handleReferenceChange("referenceAddress1", e.target.value)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label className="form-label small" htmlFor="referenceName2">
                  Name
                </label>

                <InputText
                  name="referenceName2"
                  className="form-control"
                  placeholder="Enter Name"
                  value={references.referenceName2}
                  onChange={(e) =>
                    handleReferenceChange("referenceName2", e.target.value)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-md-0">
                <label className="form-label small" htmlFor="referenceMobile2">
                  Mobile
                </label>

                <InputText
                  name="referenceMobile2"
                  className="form-control"
                  placeholder="Enter Mobile Number"
                  value={references.referenceMobile2}
                  onChange={(e) =>
                    handleReferenceChange("referenceMobile2", e.target.value)
                  }
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  maxLength={10}
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mt-3 mt-lg-0">
                <label className="form-label small" htmlFor="referenceAddress2">
                  Address
                </label>

                <InputText
                  name="referenceAddress2"
                  className="form-control"
                  placeholder="Enter Address"
                  value={references.referenceAddress2}
                  onChange={(e) =>
                    handleReferenceChange("referenceAddress2", e.target.value)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={isProcessingModalVisible}
        modal
        onHide={() => setIsProcessingModalVisible(false)}
        closable={false}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "92vw", maxWidth: "520px" }}
        header="Processing Application"
        className="modalWrapper"
      >
        <div className="py-3 px-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="mb-0 fw-bold">Please wait</h3>
            <span className="fw-semibold text-orange">
              {processingProgress}%
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "10px",
              borderRadius: "999px",
              backgroundColor: "#f3f4f6",
              overflow: "hidden",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: `${processingProgress}%`,
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #f59e0b 0%, #ff632c 100%)",
                transition: "width 0.35s ease",
              }}
            />
          </div>

          <div
            className="mb-0"
            style={{
              color: "#4b5563",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            <div
              style={{
                height: "78px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  transform: `translateY(-${currentProcessingMessageIndex * 78}px)`,
                  transition: "transform 0.45s ease",
                }}
              >
                {processingMessages.map((message, index) => (
                  <div
                    key={`${index}-${message.slice(0, 18)}`}
                    style={{
                      minHeight: "78px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Enter Aadhaar OTP"
        visible={aadharCardPopUp}
        modal
        onHide={() => {
          setOtpValues(undefined);
          setAadharCardPopUp(false);
        }}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        footer={aadharFooterContent}
        style={{ width: "500px" }}
      >
        <div className="modal-content">
          <Loader isLoading={loading} />

          <div className="modal-body">
            <p className="mb-3">
              Validate your Aadhaar card details by entering the OTP sent to
              your registered mobile number.
            </p>

            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="otpInput">
                Enter OTP <sup>*</sup>
              </label>

              <InputOtp
                id="otpInput"
                integerOnly
                value={otpValues}
                onChange={(e) => handleOtpChange(e.value)}
                length={OTPType.SIX_DIGIT_OTP}
              />

              {timeLeft > 0 ? (
                <b
                  className="txt-14"
                  style={{ fontWeight: "600" }}
                >{`Resend OTP in ${formatTime(timeLeft)}`}</b>
              ) : (
                <Button
                  className="resendBtn"
                  onClick={resendOTP}
                  label="Resend OTP"
                  disabled={loading || timeLeft > 0}
                />
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Choose Email Client"
        visible={showEmailChooser}
        onHide={() => setShowEmailChooser(false)}
        style={{ width: "95vw", maxWidth: "420px" }}
        className="emailChooserDialog modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        footer={emailFooterContent}
      >
        <div className="email-chooser-container">
          <div className="email-card gmail" onClick={openGmail}>
            <i className="pi pi-google email-icon gmail-icon" />
            <div>
              <div className="email-title">Gmail</div>
              <div className="email-sub">Open in Google Mail</div>
            </div>
          </div>

          <div className="email-card outlook" onClick={openOutlook}>
            <i className="pi pi-microsoft email-icon outlook-icon" />
            <div>
              <div className="email-title">Outlook</div>
              <div className="email-sub">Open in Microsoft Outlook</div>
            </div>
          </div>

          <div className="email-card default" onClick={openDefaultMail}>
            <i className="pi pi-envelope email-icon default-icon" />
            <div>
              <div className="email-title">Default Mail App</div>
              <div className="email-sub">Use device email application</div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplyLoanModal;

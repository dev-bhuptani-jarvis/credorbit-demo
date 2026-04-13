import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CLIENT_ROLE,
  REFERRAL_CODE_LENGTH,
} from "../../utils/constants/constant";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { OtpRequestType, VerifyOTPType } from "../../utils/constants/enum";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  extraToken,
  generateCaptcha,
  IsFormValid,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import OtpModal from "../../components/otpModal";
import {
  sendOTPAPI,
  verifyReferralCodeAPI,
} from "../../utils/axios/apiServices";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import {
  IRegisterParams,
  IRegisterValidaton,
  IRegisterValues,
  ISendOTPResponse,
} from "../../interface/signIn";
import {
  encryptData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import { validationMessages } from "../../utils/constants/messages";
import Loader from "../../components/Loader";
import { startLoading, stopLoading } from "../../store/reducer/loaderSlice";
import { useDispatch } from "react-redux";

const getNameFieldError = (value: string, userType: number): string => {
  if (IsStringNullEmptyOrUndefined(value)) {
    return validationMessages.panNumberRequired;
  }
  return !PAN_NUMBER_PATTERN.test(value)
    ? validationMessages.panNumberInvalid
    : "";
};

const getInitialFormValues = (userType: number): IRegisterValues => ({
  name: "",
  emailID: "",
  mobileNumber: "",
  isTnCAccepted: false,
  isIndianAdult: false,
  otpType: OtpRequestType.REGISTER,
  userType,
  captcha: "",
});

const getInitialFormErrors = (userType: number): IRegisterValidaton => ({
  name: getNameFieldError("", userType),
  emailID: validationMessages.emailRequired,
  mobileNumber: validationMessages.mobileNumberRequired,
  checkboxes: validationMessages.checkboxesRequired,
  captcha: validationMessages.captchaRequired,
});

const RegisterPage = () => {
  const [formValues, setFormValues] = useState<IRegisterValues>(() =>
    getInitialFormValues(CLIENT_ROLE.CUSTOMER),
  );

  const [formErrors, setFormErrors] = useState<IRegisterValidaton>(() =>
    getInitialFormErrors(CLIENT_ROLE.CUSTOMER),
  );

  const isLoading = useSelector(
    (state: RootState) => state.loader.activeRequests > 0,
  );

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);

  const [captcha, setCaptcha] = useState<string>("");

  const [isReferralUser, setIsReferralUser] = useState<boolean>(false);

  const [isReferralVerified, setIsReferralVerified] = useState<boolean>(false);

  const [lastVerifiedReferral, setLastVerifiedReferral] = useState<string>("");

  const { isLogin } = useSelector((state: RootState) => state.auth);

  const { token } = useSelector((state: RootState) => state.auth);

  const type = VerifyOTPType.REGISTER;

  const { search } = useLocation();

  const nameInputRef = useRef<HTMLInputElement>(null);

  const userData = useSelector((state: RootState) => state.user.user);

  const { userID } = userData;

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const queryParams = new URLSearchParams(search);

  const referralCode = queryParams.get("referralCode");

  const channelPartnerCode = queryParams.get("channelPartnerCode");

  const handleReferralVerification = async (code: string) => {
    if (code.length !== REFERRAL_CODE_LENGTH || code === lastVerifiedReferral) {
      return;
    }

    const isValid = await verifyReferralCode(code);

    if (isValid) {
      setFormErrors((prev) => ({ ...prev, referralCode: "" }));
      setIsReferralVerified(true);
      setLastVerifiedReferral(code);
    } else {
      setIsReferralVerified(false);
    }
  };

  const handleChange = (fieldName: string, value: any): void => {
    if (fieldName === "isTnCAccepted" || fieldName === "isIndianAdult") {
      const updatedValues = { ...formValues, [fieldName]: value };

      const areCheckboxesValid =
        updatedValues.isTnCAccepted && updatedValues.isIndianAdult;
      setFormErrors({
        ...formErrors,
        checkboxes: areCheckboxesValid
          ? ""
          : validationMessages.checkboxesRequired,
      });

      setFormValues(updatedValues);
      return;
    }

    switch (fieldName) {
      case "name": {
        setFormErrors({
          ...formErrors,
          name: getNameFieldError(value, formValues.userType),
        });
        break;
      }
      case "emailID": {
        const isValid: boolean = EMAIL_PATTERN.test(value);

        setFormErrors({
          ...formErrors,
          emailID: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.emailRequired
            : !isValid
              ? validationMessages.emailInvalid
              : "",
        });

        break;
      }

      case "mobileNumber": {
        const isValid: boolean =
          INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

        setFormErrors({
          ...formErrors,
          mobileNumber: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.mobileNumberRequired
            : !isValid
              ? validationMessages.mobileNumberInvalid
              : "",
        });

        break;
      }

      case "captcha": {
        if (IsStringNullEmptyOrUndefined(value)) {
          setFormErrors({
            ...formErrors,
            captcha: validationMessages.captchaRequired,
          });
        } else if (value !== captcha) {
          setFormErrors({
            ...formErrors,
            captcha: validationMessages.captchaInvalid,
          });
        } else {
          setFormErrors({
            ...formErrors,
            captcha: "",
          });
        }
        break;
      }
    }

    setFormValues({ ...formValues, [fieldName]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const { isTnCAccepted, isIndianAdult } = formValues;

    if (!isTnCAccepted || !isIndianAdult) {
      setFormErrors({
        ...formErrors,
        checkboxes: validationMessages.checkboxesRequired,
      });
      return;
    }

    if (
      formValues.userType === CLIENT_ROLE.CHANNEL_PARTNER &&
      !referralCode &&
      formValues.referralCode &&
      !isReferralVerified
    ) {
      toastError("Please enter a valid referral code");
      return;
    }

    const isValid: boolean = IsFormValid(formErrors);

    if (isValid) {
      setIsFormSubmitted(false);
      dispatch(startLoading());

      const payload: IRegisterParams = {
        emailID: encryptVAPTData(formValues.emailID.toLowerCase().trim()),
        mobileNumber: encryptVAPTData(formValues.mobileNumber.trim()),
        otpType: formValues.otpType,
        userType: formValues.userType,
        isUserDetailsRequired: true,
        extraToken: encryptData(extraToken()),
        parentID: userID,
        panNumber: encryptVAPTData(formValues.name.trim()),
      };

      const response: ISendOTPResponse = await sendOTPAPI(payload);

      if (!response) return;

      if (response.statusCode === 200) {
        setShowOTPModal(true);
        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }
    }

    dispatch(stopLoading());
  };

  const switchRole = (role: number) => {
    setFormValues(getInitialFormValues(role));
    setFormErrors(getInitialFormErrors(role));
    setCaptcha(generateCaptcha());
  };

  const verifyReferralCode = async (code: string): Promise<boolean> => {
    try {
      if (code.length !== REFERRAL_CODE_LENGTH) {
        return false;
      }

      dispatch(startLoading());

      const response = await verifyReferralCodeAPI(code);

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        return true;
      } else {
        toastError(response.message);
        return false;
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    const handleReferralFlow = async () => {
      if (referralCode) {
        const isValid = await verifyReferralCode(referralCode);

        if (isValid) {
          setFormValues((prev) => ({
            ...prev,
            referralCode,
            userType: CLIENT_ROLE.CHANNEL_PARTNER,
          }));
          setIsReferralUser(true);
          setIsReferralVerified(true);
        } else {
          navigate(RoutePathConstant.public.register, { replace: true });
        }
      }
    };

    if (channelPartnerCode) {
      setFormValues((prev) => ({ ...prev, channelPartnerCode }));
      setIsReferralUser(true);
    }

    if (!IsStringNullEmptyOrUndefined(token)) handleReferralFlow();

    setCaptcha(generateCaptcha());
  }, [search, token, referralCode]);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [formValues.userType]);

  useEffect(() => {
    const roleFromURL = search.split("=")[1];
    if (roleFromURL === "2") switchRole(CLIENT_ROLE.CHANNEL_PARTNER);

    setCaptcha(generateCaptcha());
  }, []);

  return (
    <>
      <Loader isLoading={isLoading} />

      {!showOTPModal && (
        <div className="row">
          {!isLogin && (
            <div className="col-12 mb-4">
              <h2 className="txt-24 mb-2">Welcome!</h2>

              <p>
                Let's begin your journey with Credorbit.
                {!isReferralUser && (
                  <> Please select the role you'd like to continue with.</>
                )}
              </p>
            </div>
          )}

          {!isReferralUser && (
            <div className="col-12 mb-4 d-flex justify-content-between">
              <div className="form-check">
                <RadioButton
                  inputId="client"
                  name="userType"
                  value={CLIENT_ROLE.CUSTOMER}
                  onChange={() => switchRole(CLIENT_ROLE.CUSTOMER)}
                  checked={formValues.userType === CLIENT_ROLE.CUSTOMER}
                />
                <label htmlFor="client" className="form-check-label ms-2">
                  Borrower
                </label>
              </div>

              <div className="form-check">
                <RadioButton
                  inputId="channelPartner"
                  name="userType"
                  value={CLIENT_ROLE.CHANNEL_PARTNER}
                  checked={formValues.userType === CLIENT_ROLE.CHANNEL_PARTNER}
                  onChange={() => switchRole(CLIENT_ROLE.CHANNEL_PARTNER)}
                />
                <label
                  htmlFor="channelPartner"
                  className="form-check-label ms-2"
                >
                  Channel Partner
                </label>
              </div>
            </div>
          )}

          <form className="col-12" autoComplete="off" onSubmit={handleSubmit}>
            {/* <div className="form-group mb-4">
              <label className="form-label small" htmlFor="channelPartnerCode">
                Channel Partner Code
                <sup>*</sup>
              </label>
              <InputText
                id="channelPartnerCode"
                className="form-control"
                name="channelPartnerCode"
                value={formValues.channelPartnerCode}
                disabled
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
              />
            </div> */}

            <div className="form-group mb-4">
              <label className="form-label small" htmlFor="name">
                PAN
                <sup>*</sup>
              </label>
              <InputText
                id="name"
                ref={nameInputRef}
                placeholder="Enter your PAN"
                className="form-control"
                maxLength={10}
                name="name"
                value={formValues.name}
                onChange={(e) => {
                  const trimmedValue = e.target.value.trim().toUpperCase();
                  handleChange("name", trimmedValue);
                }}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
              />
              {isFormSubmitted && (
                <span className="error">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group mb-4">
              <label className="form-label small" htmlFor="mobileNumber">
                Mobile Number<sup>*</sup>
              </label>

              <InputText
                id="mobileNumber"
                className="form-control"
                name="mobileNumber"
                maxLength={10}
                value={formValues.mobileNumber}
                onChange={(e) =>
                  handleChange(e.target.name, e.target.value.trim())
                }
                onKeyPress={(e) =>
                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                }
                placeholder="Enter your mobile number"
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
              />

              {isFormSubmitted && (
                <span className="error">{formErrors.mobileNumber}</span>
              )}
            </div>

            <div className="form-group mb-4">
              <label className="form-label small" htmlFor="emailID">
                Email Address<sup>*</sup>
              </label>

              <InputText
                id="emailID"
                placeholder="Enter your email address"
                className="form-control"
                maxLength={50}
                name="emailID"
                value={formValues.emailID}
                onChange={(e) =>
                  handleChange(
                    e.target.name,
                    e.target.value.toLowerCase().trim(),
                  )
                }
                // onPaste={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
              />

              {isFormSubmitted && (
                <span className="error">{formErrors.emailID}</span>
              )}
            </div>

            {referralCode && (
              <div className="form-group mb-4">
                <label className="form-label small" htmlFor="referralCode">
                  Referral Code
                </label>
                <InputText
                  id="referralCode"
                  className="form-control"
                  name="referralCode"
                  value={formValues.referralCode}
                  disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            )}

            {!referralCode &&
              formValues.userType === CLIENT_ROLE.CHANNEL_PARTNER && (
                <div className="form-group mb-4">
                  <label className="form-label small" htmlFor="referralCode">
                    Referral Code
                  </label>
                  <InputText
                    id="referralCode"
                    className="form-control"
                    name="referralCode"
                    value={formValues.referralCode}
                    disabled={!!referralCode}
                    onChange={(e) => {
                      const value = e.target.value.trim().toUpperCase();

                      handleChange("referralCode", value);

                      // reset verification if user edits code
                      if (value !== lastVerifiedReferral) {
                        setIsReferralVerified(false);
                      }

                      // 🔥 ONLY PLACE where API will ever be called
                      if (value.length === REFERRAL_CODE_LENGTH) {
                        handleReferralVerification(value);
                      }
                    }}
                    maxLength={REFERRAL_CODE_LENGTH}
                    placeholder="Enter referral code"
                    // onPaste={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />
                </div>
              )}

            <div className="form-group mb-4">
              <label className="form-label small">Captcha</label>
              <div className="captcha-container">{captcha}</div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label small" htmlFor="captcha">
                Enter Captcha<sup>*</sup>
              </label>
              <InputText
                id="captcha"
                className="form-control"
                name="captcha"
                maxLength={4}
                value={formValues.captcha}
                onChange={(e) => handleChange("captcha", e.target.value)}
                placeholder="Enter Captcha"
                onKeyPress={(e) => {
                  if (!NUMBER_ONLY_PATTERN.test(e.key) && e.key !== "Enter") {
                    e.preventDefault();
                  }
                }}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
              />
              {isFormSubmitted && (
                <span className="error">{formErrors.captcha}</span>
              )}
            </div>

            <div className="form-group mb-4">
              <div className="form-check">
                <Checkbox
                  name="isTnCAccepted"
                  checked={formValues.isTnCAccepted}
                  onChange={(e) =>
                    handleChange("isTnCAccepted", e.target.checked)
                  }
                />

                <label className="form-check-label txt-14">
                  I Accept the{" "}
                  <Link
                    to={
                      formValues.userType === CLIENT_ROLE.CUSTOMER
                        ? RoutePathConstant.public.clientPolicy
                        : RoutePathConstant.public.channelPartnerPolicy
                    }
                  >
                    Terms and Conditions
                  </Link>{" "}
                  &{" "}
                  <Link to={RoutePathConstant.public.policy}>
                    Privacy Policy{" "}
                  </Link>{" "}
                  of Credorbit
                </label>
              </div>
            </div>

            <div className="form-group mb-4">
              <div className="form-check">
                <Checkbox
                  name="isIndianAdult"
                  checked={formValues.isIndianAdult}
                  onChange={(e) =>
                    handleChange("isIndianAdult", e.target.checked)
                  }
                />

                <label
                  className="form-check-label txt-14"
                  htmlFor="isIndianAdult"
                >
                  I confirm that I am an Indian above 18 years of age, residing
                  in India and have read & agreed to Credorbit’s Privacy Policy
                  and Credorbit Terms &Conditions. I agree to receive calls,
                  SMS, E-mail & WhatsApp messages from Credorbit, and this
                  consent overrides any registration for DNC / NDNC.
                </label>
              </div>
              {isFormSubmitted && formErrors.checkboxes && (
                <div className="error mb-4">{formErrors.checkboxes}</div>
              )}
            </div>

            <div className="form-group mb-4">
              <Button
                type="submit"
                className={`btn ${
                  isLoading ? "btn-orange-disabled" : "btn-orange"
                } w-100 text-center`}
                disabled={isLoading}
                label={isLoading ? "Loading..." : "Register"}
              />
            </div>

            {!isLogin && (
              <div className="registerWrapper">
                Already have an account?{" "}
                <Link to={RoutePathConstant.public.login}>Login</Link>
              </div>
            )}
          </form>
        </div>
      )}

      {showOTPModal && <OtpModal formValues={formValues} type={type} />}
    </>
  );
};

export default RegisterPage;

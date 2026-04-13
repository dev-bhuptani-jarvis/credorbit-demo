import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  EMAIL_PATTERN,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import { OtpRequestType, VerifyOTPType } from "../../utils/constants/enum";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import {
  IsFormValid,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import OtpModal from "../../components/otpModal";
import { sendOTPAPI } from "../../utils/axios/apiServices";
import {
  IAssociatedUsersData,
  ISendOTPRequestBySignIn,
  ISendOTPResponse,
} from "../../interface/signIn";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { validationMessages } from "../../utils/constants/messages";
import { generateCaptcha } from "../../utils/functions/shared";
import { encryptVAPTData } from "../../utils/functions/encryptDecrypt";

const Login = () => {
  const [formValues, setFormValues] = useState<ISendOTPRequestBySignIn>({
    emailID: "",
    mobileNumber: "",
    otpType: OtpRequestType.LOGIN,
    isFetchLinkedUsers: true,
    captcha: "",
  });

  const [formErrors, setFormErrors] = useState<ISendOTPRequestBySignIn>({
    emailID: validationMessages.emailRequired,
    mobileNumber: validationMessages.mobileNumberRequired,
    captcha: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);

  const [captcha, setCaptcha] = useState<string>("");

  const [associatedUsersData, setAssociatedUsersData] = useState<
    IAssociatedUsersData[]
  >([]);

  const type = VerifyOTPType.LOGIN;

  const validateCaptcha = (): boolean => {
    const enteredCaptcha: string = formValues.captcha?.trim() || "";

    if (enteredCaptcha === "") {
      setFormErrors((prev) => ({
        ...prev,
        captcha: validationMessages.captchaRequired,
      }));
      return false;
    }

    if (enteredCaptcha !== captcha) {
      setFormErrors((prev) => ({
        ...prev,
        captcha: validationMessages.captchaInvalid,
      }));
      setCaptcha(generateCaptcha());
      return false;
    }

    setFormErrors((prev) => ({ ...prev, captcha: "" }));
    return true;
  };

  const handleChange = (fieldName: string, value: string): void => {
    const errors = { ...formErrors };

    if (fieldName === "emailID") {
      const isValid: boolean = EMAIL_PATTERN.test(value);

      errors.emailID = IsStringNullEmptyOrUndefined(value)
        ? validationMessages.emailRequired
        : !isValid
        ? validationMessages.emailInvalid
        : "";
    } else if (fieldName === "mobileNumber") {
      const isValid: boolean =
        NUMBER_ONLY_PATTERN.test(value) && value.length === 10;

      errors.mobileNumber = IsStringNullEmptyOrUndefined(value)
        ? validationMessages.mobileNumberRequired
        : !isValid
        ? validationMessages.mobileNumberInvalid
        : "";
    } else if (fieldName === "captcha") {
      errors.captcha = IsStringNullEmptyOrUndefined(value)
        ? validationMessages.captchaRequired
        : "";
    }

    setFormErrors(errors);
    setFormValues({ ...formValues, [fieldName]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const isValid: boolean = IsFormValid(formErrors);

    const isValidCaptcha: boolean = validateCaptcha();

    if (!isValid || !isValidCaptcha) {
      return;
    }

    setLoading(true);

    const body = {
      emailID: encryptVAPTData(formValues.emailID),
      mobileNumber: encryptVAPTData(formValues.mobileNumber),
      otpType: formValues.otpType,
      isFetchLinkedUsers: formValues.isFetchLinkedUsers,
    };

    const response: ISendOTPResponse = await sendOTPAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setAssociatedUsersData(response.data.associatedUsers);
      setShowOTPModal(true);
      toastSuccess(response.message);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  return (
    <>
      {!showOTPModal && (
        <div className="row">
          <div className="col-12 mb-4">
            <h2 className="txt-24 mb-2">Welcome!</h2>

            <p>Let's begin your journey with Credorbit.</p>
          </div>

          <form
            autoComplete="off"
            onSubmit={(e) => handleSubmit(e)}
            className="col-12"
          >
            <div className="form-group mb-4">
              <label className="form-label small" htmlFor="emailID">
                Email ID<sup>*</sup>
              </label>

              <InputText
                autoFocus
                id="emailID"
                placeholder="Enter your email id"
                className="form-control"
                maxLength={50}
                name="emailID"
                value={formValues.emailID}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                onChange={(e) =>
                  handleChange(
                    e.target.name,
                    e.target.value.toLowerCase().trim()
                  )
                }
              />

              {isFormSubmitted && (
                <span className="error">{formErrors.emailID}</span>
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
                onKeyPress={(e) => {
                  if (!NUMBER_ONLY_PATTERN.test(e.key) && e.key !== "Enter") {
                    e.preventDefault();
                  }
                }}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                placeholder="Enter the mobile number"
              />

              {isFormSubmitted && (
                <span className="error">{formErrors.mobileNumber}</span>
              )}
            </div>

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
                onChange={(e) => handleChange(e.target.name, e.target.value)}
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
              <Button
                type="submit"
                disabled={loading}
                className={`btn ${
                  loading ? "btn-orange-disabled" : "btn-orange"
                } w-100`}
              >
                {loading ? "Loading..." : "Sign in"}
              </Button>
            </div>

            <div className="registerWrapper">
              Don't have an account?{" "}
              <Link to={RoutePathConstant.public.register}>Register</Link>
            </div>
          </form>
        </div>
      )}

      {showOTPModal && (
        <OtpModal
          formValues={formValues}
          type={type}
          associatedUsersData={associatedUsersData}
          setAssociatedUsersData={setAssociatedUsersData}
        />
      )}
    </>
  );
};

export default Login;

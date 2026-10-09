import { useLocation, useNavigate } from "react-router-dom";
import {
  extraToken,
  formatTime,
  toastError,
  toastSuccess
} from "../utils/functions/shared";
import { CLIENT_ROLE } from "../utils/constants/constant";
import {
  OTPType,
  StorageKeyEnum,
  VerifyOTPType,
} from "../utils/constants/enum";
import { useEffect, useRef, useState } from "react";
import { sendOTPAPI, verifyEmailOTPAPI } from "../utils/axios/apiServices";
import { IVerifyEmailOTPResponse } from "../interface/otpRequest";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/reducer/authSlice";
import { RoutePathConstant } from "../utils/constants/routePaths";
import {
  decryptVAPTData,
  encryptData,
  encryptVAPTData,
} from "../utils/functions/encryptDecrypt";
import { setUserData } from "../store/reducer/userSlice";
import { Button } from "primereact/button";
import { InputOtp } from "primereact/inputotp";
import { ISendOTPResponse } from "../interface/signIn";
import { setProfileUpdated } from "../store/reducer/profileSlice";
import { environment } from "../utils/constants/environments";
import { RootState } from "../store";
import { setCount } from "../store/reducer/countSlice";
import { IAssociatedUsersData } from "../interface/signIn";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import Loader from "./Loader";
import { applyWhiteLabelBranding } from "../utils/functions/whiteLabelBranding";

interface OtpModalProps {
  formValues: any;
  type: string;
  setOtpModal?: (visible: boolean) => void;
  associatedUsersData?: IAssociatedUsersData[];
  setAssociatedUsersData?: (data: IAssociatedUsersData[]) => void;
}

const OtpModal = ({
  formValues,
  type,
  setOtpModal,
  associatedUsersData = [],
  setAssociatedUsersData,
}: OtpModalProps) => {
  const [otpValues, setOtpValues] = useState<string | undefined>();

  const [loading, setLoading] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [selectedRole, setSelectedRole] = useState<IAssociatedUsersData | null>(
    null,
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const { whiteLabelSettings } = useSelector((state: RootState) => state.user.user);
  const publicWhiteLabelTenantId = useSelector(
    (state: RootState) => state.user.publicWhiteLabelTenantId,
  );

  const otpRef = useRef<HTMLInputElement | null>(null);

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (value !== null && value !== undefined) {
      setOtpValues(String(value));
    } else {
      setOtpValues("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") {
      type === VerifyOTPType.REGISTER ? handleSubmit() : handleTrialSubmit();
    }
  };

  const handleSubmit = async (customFormValues?: any): Promise<void> => {
    if (loading) return;

    if (!otpValues || otpValues.toString().length !== OTPType.FOUR_DIGIT_OTP) {
      toastError(`Please enter a valid ${OTPType.FOUR_DIGIT_OTP} digit OTP`);
      return;
    }

    setLoading(true);

    const payload: any = {
      otp: otpValues,
      extraToken: encryptData(extraToken()),
      userID: customFormValues?.userID,
      whiteLabelTenantId:
        whiteLabelSettings?.id || publicWhiteLabelTenantId || "",
      isEducationalPortal: true,
    };

    if (formValues.leadID) {
      payload.leadID = formValues.leadID;
    } else {
      payload.emailID = encryptVAPTData(formValues.emailID);
      payload.mobileNumber = encryptVAPTData(formValues.mobileNumber);
    }

    if (formValues.channelPartnerCode) {
      payload.channelPartnerCode = formValues.channelPartnerCode;
    }

    if (formValues.referralCode) {
      payload.referralCode = formValues.referralCode;
    }

    switch (type) {
      case VerifyOTPType.LOGIN:
        payload.isUserDetailsRequired = true;
        break;

      case VerifyOTPType.REGISTER:
        Object.assign(payload, {
          userType: formValues.userType,
          isUserDetailsRequired: true,
          isIndianAdult: formValues.isIndianAdult,
          isTnCAccepted: formValues.isTnCAccepted,
          isSelfRegistered: true,
          panNumber: encryptVAPTData(formValues.name),
        });
        break;
    }

    const response: IVerifyEmailOTPResponse = await verifyEmailOTPAPI(payload);

    setLoading(false);

    if (!response) return;

    if (response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        emailID: response.data.emailID
          ? decryptVAPTData(response.data.emailID)
          : "",
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : null,
      };

      const updatedResponse = {
        ...response,
        data: decryptedData,
      };

      switch (type) {
        case VerifyOTPType.LOGIN:
          handleLogin(updatedResponse);
          break;
        case VerifyOTPType.REGISTER:
          if (updatedResponse?.data?.isFromLead) {
            handleRegisterForLead(updatedResponse);
          } else {
            handleRegister(updatedResponse);
          }
          break;
        case VerifyOTPType.CHANNEL_PARTNER:
          handleChannelPartner(updatedResponse);
          break;
      }

      setOtpValues(undefined);
    } else {
      toastError(response.message);
      if (setOtpModal) setOtpModal(false);
      navigate(RoutePathConstant.public.login);
    }
  };

  const handleRoleSelectionSubmit = () => {
    if (!selectedRole) return;

    const updatedValues = {
      userID: selectedRole.userID,
    };

    handleSubmit(updatedValues);
  };

  const handleLoginForLead = async (
    response: IVerifyEmailOTPResponse,
  ): Promise<void> => {
    applyWhiteLabelBranding(response.data?.whiteLabelSettings);

    dispatch(setAuth(true));

    dispatch(setUserData(response.data));

    dispatch(setCount(environment.USER_EXPIRY_TIMER));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_USER_EXPIRY_TIMER,
      String(environment.USER_EXPIRY_TIMER),
    );

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      response.data.token,
    );

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      JSON.stringify(response.data),
    );

    toastSuccess(response.message);

    setLoading(false);

    navigate(RoutePathConstant.private.applyLoan, {
      state: response.data,
    });
  };

  const handleLogin = async (
    response: IVerifyEmailOTPResponse,
  ): Promise<void> => {
    applyWhiteLabelBranding(response.data?.whiteLabelSettings);

    dispatch(setAuth(true));

    dispatch(setUserData(response.data));

    dispatch(setCount(environment.USER_EXPIRY_TIMER));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_USER_EXPIRY_TIMER,
      String(environment.USER_EXPIRY_TIMER),
    );

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      response.data.token,
    );

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      JSON.stringify(response.data),
    );

    toastSuccess(response.message);

    setLoading(false);

    switch (response.data.roleID) {
      case CLIENT_ROLE.SUPER_ADMIN:
        navigate(RoutePathConstant.private.dashboard);
        break;
      case CLIENT_ROLE.USER_MANAGEMENT:
      case CLIENT_ROLE.EDUCATIONAL_INSTITUTE:
        navigate(RoutePathConstant.private.institueDashboard);
        break;
      case CLIENT_ROLE.STUDENT:
        navigate(RoutePathConstant.private.studentDashboard);
        break;
      case CLIENT_ROLE.NBFC:
        navigate(RoutePathConstant.private.nbfcDashboard);
        break;
      default:
        navigate(RoutePathConstant.private.institueDashboard);
        break;
    }
  };

  const handleRegisterForLead = async (
    response: IVerifyEmailOTPResponse,
  ): Promise<void> => {
    navigate(RoutePathConstant.public.congratulations);
    setTimeout(() => handleLoginForLead(response), 5000);
  }

  const handleRegister = async (
    response: IVerifyEmailOTPResponse,
  ): Promise<void> => {
    navigate(RoutePathConstant.public.congratulations);
    setTimeout(() => handleLogin(response), 5000);
  };

  const handleChannelPartner = (response: IVerifyEmailOTPResponse): void => {
    toastSuccess(response.message);
    setOtpModal?.(false);
    dispatch(setProfileUpdated(!isProfileUpdated));
  };

  const resendOTP = async (): Promise<void> => {
    setLoading(true);

    setTimeLeft(environment.OTP_TIMER);

    const body: any = {
      otpType: formValues.otpType,
      isFetchLinkedUsers: formValues.isFetchLinkedUsers,
      whiteLabelTenantId:
        whiteLabelSettings?.id || publicWhiteLabelTenantId || "",
      isEducationalPortal: true
    };

    if (formValues.leadID) {
      body.leadID = formValues.leadID;
    } else {
      body.emailID = encryptVAPTData(formValues.emailID);
      body.mobileNumber = encryptVAPTData(formValues.mobileNumber);
    }

    if (formValues.masterChannelPartnerCode) {
      body.masterChannelPartnerCode = formValues.masterChannelPartnerCode;
    }

    if (formValues.channelPartnerCode) {
      body.channelPartnerCode = formValues.channelPartnerCode;
    }

    const response: ISendOTPResponse = await sendOTPAPI(body);
    setLoading(false);

    if (!response) return;

    if (response.statusCode === 200) {
      setAssociatedUsersData &&
        setAssociatedUsersData(response.data.associatedUsers);
      toastSuccess(response.message);
    } else {
      toastError(response.message);
    }
  };

  const handleReset = () => {
    setPanDetailPopUp(false);
    setSelectedRole(null);
  };

  const handleTrialSubmit = () => {
    if (loading) return;

    if (!otpValues || otpValues.toString().length !== OTPType.FOUR_DIGIT_OTP) {
      toastError(`Please enter a valid ${OTPType.FOUR_DIGIT_OTP} digit OTP`);
      return;
    }

    const updatedValues = {
      userID: associatedUsersData[0].userID,
    };

    if (associatedUsersData.length === 1) {
      handleSubmit(updatedValues);
    } else {
      setPanDetailPopUp(true);
    }
  };

  useEffect(() => setTimeLeft(environment.OTP_TIMER), []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeout(() => {
      const firstInput = document.querySelector(
        ".p-inputotp input",
      ) as HTMLInputElement;
      firstInput?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (otpValues && otpValues.toString().length === OTPType.FOUR_DIGIT_OTP) {
      if (type === VerifyOTPType.REGISTER) {
        handleSubmit();
      } else {
        handleTrialSubmit();
      }
    }
  }, [otpValues]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="row" onKeyDown={handleKeyDown}>
        <div className="col-12">
          <h2 className="txt-24 mb-2 fw-bold primary-color">Enter OTP</h2>
        </div>

        <div className="col-12">
          <div className="form-group otpMain mb-3">
            <InputOtp
              ref={otpRef}
              integerOnly
              value={otpValues}
              onChange={(e) => handleOtpChange(e.value)}
            />
          </div>

          <div className="registerWrapper mb-4 primary-color">
            {timeLeft > 0 ? (
              <b className="txt-14" style={{ fontWeight: 600 }}>
                Resend OTP in {formatTime(timeLeft)}
              </b>
            ) : (
              <Button
                className="resendBtn primary-color"
                onClick={resendOTP}
                label="Resend OTP"
                disabled={loading}
              />
            )}
          </div>

          <div className="d-flex gap-3">
            {pathname !== "/" &&
              pathname !== RoutePathConstant.public.login &&
              pathname !== RoutePathConstant.public.register && (
                <Button
                  className="btn btn-black-line text-center w-100"
                  disabled={loading}
                  onClick={() => setOtpModal?.(false)}
                  label="Cancel"
                />
              )}
            <Button
              type="button"
              className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
                } w-100 text-center`}
              disabled={loading}
              onClick={
                type === VerifyOTPType.REGISTER
                  ? handleSubmit
                  : handleTrialSubmit
              }
              label={
                pathname !== "/" &&
                  pathname !== RoutePathConstant.public.login &&
                  pathname !== RoutePathConstant.public.register
                  ? loading
                    ? "Processing..."
                    : "Next"
                  : "Submit"
              }
            />
          </div>
        </div>
      </div>

      <Dialog
        header="Select User"
        visible={panDetailPopUp}
        modal
        onHide={handleReset}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "600px", maxWidth: "90vw" }}
        blockScroll
        footer={
          <div className="d-flex justify-content-end mt-2 gap-2">
            <Button
              label="Cancel"
              className="btn btn-black-line w-100 text-center"
              onClick={handleReset}
            />
            <Button
              label="Proceed"
              className="btn btn-orange w-100 text-center"
              onClick={handleRoleSelectionSubmit}
              disabled={!selectedRole || loading}
            />
          </div>
        }
      >
        <Loader isLoading={loading} />

        {associatedUsersData.length > 1 && (
          <div
            className="flex flex-col gap-3 overflow-y-auto pr-2"
            style={{ maxHeight: "24rem" }}
          >
            {associatedUsersData.map((user, index) => (
              <div
                key={index}
                className={`d-flex gap-3 p-3 border mt-2 rounded-2 cursor-pointer ${selectedRole?.userType === user.userType &&
                  selectedRole?.userID === user.userID
                  ? "bg-orange-50 border-orange-400"
                  : "hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedRole(user)}
              >
                <RadioButton
                  inputId={`role-${index}`}
                  name="selectedRole"
                  value={user}
                  onChange={(e) => setSelectedRole(e.value)}
                  checked={
                    selectedRole?.userType === user.userType &&
                    selectedRole?.userID === user.userID
                  }
                />
                <div>
                  <label
                    htmlFor={`role-${index}`}
                    className="cursor-pointer primary-color"
                    style={{ lineHeight: "1.5" }}
                  >
                    {user.userType === CLIENT_ROLE.USER_MANAGEMENT && (
                      <p className="text-sm text-gray-500">
                        {user.userName} is a user under User Management.
                        {user.cpName ? (
                          <>
                            {" "}
                            This user is linked to the Institute{" "}
                            <strong>{user.cpName}</strong>.
                          </>
                        ) : null}
                      </p>
                    )}

                    {user.userType === CLIENT_ROLE.EDUCATIONAL_INSTITUTE && (
                      <p className="text-sm text-gray-500">
                        {user.userName} is a Education Institute.
                      </p>
                    )}

                    {user.userType === CLIENT_ROLE.STUDENT && (
                      <p className="text-sm text-gray-500">
                        {user.userName} is a Student under the {user.cpName} Institute.
                      </p>
                    )}

                    {user.userType === CLIENT_ROLE.NBFC && (
                      <p className="text-sm text-gray-500">
                        {user.userName} is a Lender.
                      </p>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default OtpModal;

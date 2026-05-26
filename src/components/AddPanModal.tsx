import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import {
  extraToken,
  IsFormValid,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../utils/functions/shared";
import { useEffect, useState } from "react";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { StorageKeyEnum } from "../utils/constants/enum";
import {
  IAddPanCardResponse,
  IConfirmDetail,
  IUpdatedFormValues,
  OnlyPanNumber,
} from "../interface/panCardResponse";
import { RootState } from "../store";
import {
  addPanForCPAPI,
  addUserWithoutOTPAPI,
  fetchCpSpListAPI,
  fetchDetailsByPan,
} from "../utils/axios/apiServices";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../utils/constants/pattern";
import { IsStringNullEmptyOrUndefined } from "../utils/functions/nullCheck";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import {
  IGetPartnerListResponse,
  IPartnerList,
  IPartnerParams,
} from "../interface/client";
import { ILogoutResponse } from "../interface/logout";
import { APIResponseEntity } from "../interface/apiResponse";
import { updateShowPanDetailPopUp } from "../store/reducer/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import Loader from "./Loader";
import { setProfileUpdated } from "../store/reducer/profileSlice";
import { IRegisterParams } from "../interface/signIn";
import {
  decryptVAPTData,
  encryptData,
  encryptVAPTData,
} from "../utils/functions/encryptDecrypt";
import usePermission, { ActionType } from "../hooks/usePermission";
import { validationMessages } from "../utils/constants/messages";
import { useLocation } from "react-router-dom";
import { RoutePathConstant } from "../utils/constants/routePaths";

interface PanAddModalProps {
  panDetailPopUp: boolean;
  setPanDetailPopUp: (visible: boolean) => void;
  showPartnerOption: boolean;
  targetUser: number;
}

interface IValidation {
  emailID: string;
  mobileNumber: string;
}

const AddPanModal = ({
  panDetailPopUp,
  setPanDetailPopUp,
  showPartnerOption,
  targetUser,
}: PanAddModalProps) => {
  const [formValues, setFormValues] = useState<OnlyPanNumber>({
    panNumber: "",
  });

  const [formErrors, setFormErrors] = useState<OnlyPanNumber>({
    panNumber: validationMessages.panNumberInvalid,
  });

  const [validation, setValidation] = useState<IValidation>({
    emailID: validationMessages.emailRequired,
    mobileNumber: validationMessages.mobileNumberRequired,
  });

  const [confirmDetail, setConfirmDetail] = useState<IConfirmDetail>({
    panNumber: "",
    emailID: "",
    mobileNumber: "",
    fullName: "",
    category: "",
  });

  const [updatedFormValues, setUpdatedFormValues] =
    useState<IUpdatedFormValues>({
      panNumber: "",
      emailID: "",
      mobileNumber: "",
      userID: "",
      userType: targetUser,
    });

  const [loading, setLoading] = useState<boolean>(false);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [emailEditable, setEmailEditable] = useState<boolean>(false);

  const [mobileEditable, setMobileEditable] = useState<boolean>(false);

  const [userType, setUserType] = useState<number>(CLIENT_ROLE.SUPER_ADMIN);

  const [selectedUser, setSelectedUser] = useState<IPartnerList | null>(null);

  const [partnerList, setPartnerList] = useState<IPartnerList[]>([]);

  const dispatch = useDispatch();

  const userData = useSelector((state: RootState) => state.user.user);

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const { showPanDetailPopUp, emailID, mobileNumber, userID, panNumber } =
    userData;

  const clientMasterRight: Record<ActionType, boolean> = usePermission(
    "ClientMaster",
    ["create"]
  )();

  const sourcingPartnerRight: Record<ActionType, boolean> = usePermission(
    "SourcingPartner",
    ["create"]
  )();

  const { pathname } = useLocation();

  const handleReset = () => {
    setFormValues({ ...formValues, panNumber: "" });
    setValidation({ emailID: "", mobileNumber: "" });
    setFormErrors({ panNumber: "", sourcingPartner: "" });
    setPanDetailPopUp(false);
    setShowConfirmModal(false);
    setUserType(CLIENT_ROLE.SUPER_ADMIN);
    setSelectedUser(null);
    setIsFormSubmitted(false);
  };

  const fetchPartnerList = async (): Promise<void> => {
    const params: IPartnerParams = {
      listType: userData.userType,
    };

    const response: IGetPartnerListResponse = await fetchCpSpListAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const formattedData = response?.data?.map((item) => ({
        id: item.id,
        name: `${item.name} (${item.email || ""})`,
        email: item.email || "",
      }));

      setPartnerList(formattedData);
    } else {
      toastError(response.message);
    }
  };

  const handleChange = (fieldName: string, value: string): void => {
    if (fieldName === "panNumber") {
      const isValid: boolean = PAN_NUMBER_PATTERN.test(value);

      setFormErrors((prevErrors) => ({
        ...prevErrors,
        panNumber:
          !value || IsStringNullEmptyOrUndefined(value)
            ? validationMessages.panNumberInvalid
            : !isValid
              ? validationMessages.panNumberInvalid
              : "",
      }));
    }

    setFormValues({ ...formValues, [fieldName]: value });
  };

  const handleVerifyUser = async (
    updatedEmailID: string | null,
    updatedMobileNumber: string | null
  ) => {
    const emailValid: boolean =
      updatedEmailID?.trim().toLowerCase() === emailID.trim().toLowerCase();

    const mobileNumberValid: boolean =
      updatedMobileNumber?.trim().toLowerCase() ===
      mobileNumber.trim().toLowerCase();

    if (!emailValid || !mobileNumberValid) {
      let errorMessage = "Your registered ";

      if (!emailValid && !mobileNumberValid) {
        errorMessage += "email and mobile number ";
      } else if (!emailValid) {
        errorMessage += "email ";
      } else if (!mobileNumberValid) {
        errorMessage += "mobile number ";
      }

      errorMessage += "linked with PAN doesn't match!";
      toastError(errorMessage);
      return;
    }

    const body = {
      fullName: confirmDetail.fullName,
      firstName: confirmDetail.firstName,
      middleName: confirmDetail.middleName,
      lastName: confirmDetail.lastName,
      category: confirmDetail.category,
      panNumber: encryptVAPTData(formValues.panNumber),
      emailID: encryptVAPTData(updatedEmailID),
      mobileNumber: encryptVAPTData(updatedMobileNumber),
      dob: encryptVAPTData(confirmDetail.dob),
      address: encryptVAPTData(confirmDetail.address),
      state: encryptVAPTData(confirmDetail.state),
      city: encryptVAPTData(confirmDetail.city),
      zipCode: encryptVAPTData(confirmDetail.zipCode),
      maskedAadhaar: encryptVAPTData(confirmDetail.maskedAadhaar),
      gender: confirmDetail.gender,
    };

    const response: APIResponseEntity = await addPanForCPAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      handleReset();

      const updatedUser = {
        ...userData,
        panNumber: formValues.panNumber,
        userName: confirmDetail.fullName,
        showPanDetailPopUp: false,
      };

      dispatch(updateShowPanDetailPopUp(updatedUser));

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
        JSON.stringify(updatedUser)
      );
    } else {
      toastError(response.message);
    }
  };

  const handleNextClick = async (): Promise<void | null> => {
    setIsFormSubmitted(true);

    if (userType === CLIENT_ROLE.CHANNEL_PARTNER && !selectedUser) {
      setFormErrors({
        ...formErrors,
        sourcingPartner: validationMessages.sourcingPartnerRequired,
      });
      return;
    }

    const isValid: boolean = IsFormValid(formErrors);

    if (!isValid) return;

    setLoading(true);

    if (formValues.panNumber === panNumber) {
      toastError(validationMessages.panNumberSame);
      setLoading(false);
      return;
    }

    const updatedSourcingPartnerFormValues = {
      panNumber: encryptVAPTData(formValues.panNumber),
      spID: selectedUser?.id,
      isClientUnderSP: true,
    };

    const encryptedPayload = {
      panNumber: encryptVAPTData(formValues.panNumber),
    };

    const response: IAddPanCardResponse = await fetchDetailsByPan(
      showPartnerOption && selectedUser
        ? updatedSourcingPartnerFormValues
        : encryptedPayload
    );
    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        emailID: response.data.emailID
          ? decryptVAPTData(response.data.emailID)
          : null,
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : null,
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : null,
        dob: response.data.dob ? decryptVAPTData(response.data.dob) : null,
        address: response.data.address
          ? decryptVAPTData(response.data.address)
          : null,
        state: response.data.state
          ? decryptVAPTData(response.data.state)
          : null,
        city: response.data.city ? decryptVAPTData(response.data.city) : null,
        zipCode: response.data.zipCode
          ? decryptVAPTData(response.data.zipCode)
          : null,
      };

      setConfirmDetail(decryptedData);

      setEmailEditable(response.data.emailID !== null);

      setMobileEditable(response.data.mobileNumber !== null);

      setValidation({
        emailID:
          response.data.emailID === null
            ? validationMessages.emailRequired
            : "",
        mobileNumber:
          response.data.mobileNumber === null
            ? validationMessages.mobileNumberRequired
            : "",
      });

      setUpdatedFormValues({
        ...updatedFormValues,
        emailID: response.data.emailID || "",
        mobileNumber: response.data.mobileNumber || "",
        panNumber: response.data.panNumber,
        userID: selectedUser?.id || userID,
        ...((selectedUser?.id ||
          targetUser === CLIENT_ROLE.SOURCING_PARTNER ||
          targetUser === CLIENT_ROLE.CO_APPLICANT ||
          targetUser === CLIENT_ROLE.PARTNER) && {
          isTnCAccepted: true,
          isIndianAdult: true,
        }),
      });

      setShowConfirmModal(true);
      setPanDetailPopUp(false);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleAddClient = async (): Promise<void> => {
    setIsFormSubmitted(true);

    if (showPanDetailPopUp) {
      handleVerifyUser(
        confirmDetail.emailID || userData.emailID,
        confirmDetail.mobileNumber || userData.mobileNumber
      );
      return;
    }

    setLoading(true);

    const payload: IRegisterParams = {
      emailID: encryptVAPTData(confirmDetail.emailID)!,
      mobileNumber: encryptVAPTData(confirmDetail.mobileNumber)!,
      extraToken: encryptData(extraToken()),
      panNumber: encryptVAPTData(confirmDetail.panNumber),
      userType: targetUser,
      isUserDetailsRequired: true,
      parentID: selectedUser?.id || userID,
    };

    const response: ILogoutResponse = await addUserWithoutOTPAPI(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setShowConfirmModal(false);

      toastSuccess(response.message);

      dispatch(setProfileUpdated(!isProfileUpdated));
    } else {
      toastError(response.message);
    }

    setIsFormSubmitted(false);

    setLoading(false);
  };

  const confirmFooterContent = (
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
        onClick={handleAddClient}
        disabled={loading}
      >
        {loading ? "Processing..." : "Add"}
      </Button>
    </div>
  );

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
        onClick={handleNextClick}
        disabled={loading}
      >
        {loading ? "Fetching PAN details..." : "Next"}
      </Button>
    </div>
  );

  const handleChangeEmail = (value: string) => {
    const isValid: boolean = EMAIL_PATTERN.test(value);

    setValidation({
      ...validation,
      emailID: IsStringNullEmptyOrUndefined(String(value))
        ? validationMessages.emailRequired
        : !isValid
          ? validationMessages.emailInvalid
          : "",
    });

    setConfirmDetail({
      ...confirmDetail,
      emailID: value,
    });

    setUpdatedFormValues({
      ...updatedFormValues,
      emailID: value,
    });
  };

  const handleChangeMobile = (value: string) => {
    const isValid: boolean =
      INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

    setValidation({
      ...validation,
      mobileNumber: IsStringNullEmptyOrUndefined(String(value))
        ? validationMessages.mobileNumberRequired
        : !isValid
          ? validationMessages.mobileNumberInvalid
          : "",
    });

    setConfirmDetail({
      ...confirmDetail,
      mobileNumber: value,
    });

    setUpdatedFormValues({
      ...updatedFormValues,
      mobileNumber: value,
    });
  };

  useEffect(() => {
    if (userData?.userType === CLIENT_ROLE.CHANNEL_PARTNER) fetchPartnerList();
  }, [userType, isProfileUpdated]);

  useEffect(() => {
    setUpdatedFormValues({
      ...updatedFormValues,
      userType: targetUser,
    });
  }, [targetUser]);

  useEffect(() => {
    const isValid: boolean = PAN_NUMBER_PATTERN.test(formValues.panNumber);

    const commonFormErrors = {
      ...formErrors,
      panNumber:
        !formValues.panNumber ||
          IsStringNullEmptyOrUndefined(formValues.panNumber)
          ? validationMessages.panNumberInvalid
          : !isValid
            ? validationMessages.panNumberInvalid
            : "",
    };

    setFormErrors(
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? {
          ...commonFormErrors,
          sourcingPartner: selectedUser
            ? ""
            : validationMessages.sourcingPartnerRequired,
        }
        : {
          ...commonFormErrors,
          sourcingPartner: "",
        }
    );
  }, [userType, selectedUser, formValues.panNumber]);

  useEffect(() => {
    if (
      sourcingPartnerRight.create === true &&
      clientMasterRight.create === false
    ) {
      setUserType(CLIENT_ROLE.CHANNEL_PARTNER);
    }
  }, [sourcingPartnerRight.create, clientMasterRight.create]);

  return (
    <>
      <Dialog
        header="PAN Details"
        visible={panDetailPopUp}
        modal
        onHide={handleReset}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={footerContent}
        blockScroll
        style={{ width: "650px" }}
      >
        <div className="modal-content">
          <Loader isLoading={loading} />

          <div className="modal-body">
            {!IsStringNullEmptyOrUndefined(panNumber) && (
              <>
                {clientMasterRight.create &&
                  sourcingPartnerRight.create &&
                  showPartnerOption &&
                  partnerList.length !== 0 ? (
                  <div className="col-12 mb-4 d-flex justify-content-between">
                    {/* Create Client under Channel Partner */}
                    <div className="form-check">
                      <RadioButton
                        inputId={String(CLIENT_ROLE.SUPER_ADMIN)}
                        name="userType"
                        value={CLIENT_ROLE.SUPER_ADMIN}
                        onChange={() => {
                          setSelectedUser(null);
                          setUserType(CLIENT_ROLE.SUPER_ADMIN);
                        }}
                        checked={userType === CLIENT_ROLE.SUPER_ADMIN}
                      />
                      <label htmlFor="admin" className="form-check-label ms-2">
                        Create Client under Channel Partner
                      </label>
                    </div>

                    {/* Create Client under Sourcing Partner */}
                    <div className="form-check">
                      <RadioButton
                        inputId={String(CLIENT_ROLE.CHANNEL_PARTNER)}
                        name="userType"
                        value={CLIENT_ROLE.CHANNEL_PARTNER}
                        checked={userType === CLIENT_ROLE.CHANNEL_PARTNER}
                        onChange={() => {
                          setSelectedUser(null);
                          setUserType(CLIENT_ROLE.CHANNEL_PARTNER);
                        }}
                      />
                      <label
                        htmlFor="channelPartner"
                        className="form-check-label ms-2"
                      >
                        Create Client under Sourcing Partner
                      </label>
                    </div>
                  </div>
                ) : (
                  (clientMasterRight.create || sourcingPartnerRight.create) &&
                  !pathname.includes(
                    RoutePathConstant.private.userMasterSourcingPartner
                  ) &&
                  !pathname.includes(RoutePathConstant.private.profile) && (
                    <div className="form-check mb-2">
                      <RadioButton checked />
                      <label
                        htmlFor="channelPartner"
                        className="form-check-label ms-2"
                      >
                        {clientMasterRight.create
                          ? "Create Client under Channel Partner"
                          : "Create Client under Sourcing Partner"}
                      </label>
                    </div>
                  )
                )}
              </>
            )}
            <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
              {targetUser === CLIENT_ROLE.CO_APPLICANT
                ? "Enter the PAN Card number to add the Co-Applicant and to Authenticate your identity and make you journey hassle free."
                : targetUser === CLIENT_ROLE.PARTNER
                  ? "Enter the PAN Card number to add the Partners and to Authenticate your identity and make you journey hassle free."
                  : IsStringNullEmptyOrUndefined(panNumber)
                    ? "Your PAN card details are missing. Please update or provide your PAN information to complete identity verification. Only after verification will you be able to proceed with other actions."
                    : "Enter the PAN Card number to Authenticate your identity and make you journey hassle free."}
            </p>
            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="panNumber">
                PAN <sup>*</sup>
              </label>

              <InputText
                autoFocus
                name="panNumber"
                value={formValues.panNumber.trim().toUpperCase()}
                className="form-control"
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                maxLength={10}
                onChange={(e) =>
                  handleChange(
                    e.target.name,
                    e.target.value.toUpperCase().trim()
                  )
                }
              // onPaste={(e) => e.preventDefault()}
              // onCopy={(e) => e.preventDefault()}
              // onCut={(e) => e.preventDefault()}
              />

              {isFormSubmitted && (
                <span className="error">{formErrors.panNumber}</span>
              )}
            </div>
            {sourcingPartnerRight.create &&
              showPartnerOption &&
              userType === CLIENT_ROLE.CHANNEL_PARTNER && (
                <div className="form-group mb-3">
                  <Dropdown
                    value={selectedUser}
                    filter
                    placeholder="Select a Sourcing Partner"
                    onChange={(e) => setSelectedUser(e.value)}
                    options={partnerList.sort((a, b) =>
                      a.name.localeCompare(b.name)
                    )}
                    optionLabel="name"
                    showClear
                  />

                  {isFormSubmitted && (
                    <span className="error">{formErrors.sourcingPartner}</span>
                  )}
                </div>
              )}
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showConfirmModal}
        header="Confirm Details"
        modal
        onHide={handleReset}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={confirmFooterContent}
        blockScroll
        style={{ width: "400px" }}
      >
        <div className="modalWrapper modal-dialog modal-dialog-centered p-0">
          <Loader isLoading={loading} />

          <div className="modal-content">
            <div className="modal-body">
              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="individualName">
                  Individual Name
                </label>

                <InputText
                  id="individualName"
                  value={confirmDetail.fullName}
                  className="form-control"
                  disabled
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="category">
                  Category
                </label>

                <InputText
                  id="category"
                  value={confirmDetail.category}
                  className="form-control text-capitalize"
                  disabled
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="panNumber">
                  PAN Number
                </label>

                <InputText
                  id="panNumber"
                  value={confirmDetail.panNumber}
                  className="form-control"
                  disabled
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="emailAddress">
                  Email Address <sup>*</sup>
                </label>

                {showPanDetailPopUp ? (
                  <InputText
                    id="emailAddress"
                    value={confirmDetail.emailID || userData?.emailID}
                    className="form-control"
                    disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                  />
                ) : (
                  <>
                    <InputText
                      autoFocus
                      id="emailAddress"
                      name="emailAddress"
                      value={confirmDetail.emailID?.trim().toLowerCase()}
                      placeholder="Enter Email Address"
                      className="form-control"
                      disabled={emailEditable}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                      onChange={(e) =>
                        handleChangeEmail(e.target.value.trim().toLowerCase())
                      }
                    />

                    {isFormSubmitted && (
                      <span className="error">{validation.emailID}</span>
                    )}
                  </>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="mobileNumber">
                  Mobile Number <sup>*</sup>
                </label>

                {showPanDetailPopUp ? (
                  <InputText
                    id="mobileNumber"
                    value={confirmDetail.mobileNumber || userData?.mobileNumber}
                    className="form-control"
                    disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                  />
                ) : (
                  <>
                    <InputText
                      autoFocus
                      id="mobileNumber"
                      name="mobileNumber"
                      value={confirmDetail.mobileNumber}
                      placeholder="Enter Mobile Number"
                      className="form-control"
                      maxLength={10}
                      disabled={mobileEditable}
                      onChange={(e) => handleChangeMobile(e.target.value)}
                      onKeyPress={(e) =>
                        restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                      }
                    // onPaste={(e) => e.preventDefault()}
                    // onCopy={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                    />

                    {isFormSubmitted && (
                      <span className="error">{validation.mobileNumber}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AddPanModal;

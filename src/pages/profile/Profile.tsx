import { useEffect, useState } from "react";
import {
  fetchUserProfile,
  generateAadharOTP,
  getDataByPincodeAPI,
  updateAadharAPI,
  updateUserProfile,
  validateCinNumberAPI,
  validateUdyamNumberAPI,
  sendUpdateMobileOtp,
  verifyUpdateMobileOtp
} from "../../utils/axios/apiServices";
import {
  IGSTListInfo,
  IPincodeFetchDetailsResponse,
  IProfileFieldUpdateable,
  IUpdateAadhaarBody,
  IUserInfo,
  IUserProfileResponse,
  IUserValidation,
  IValidateCINNumberBody,
  IValidateUdhyamNumberBody,
} from "../../interface/userData";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import {
  CLIENT_ROLE,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { useSelector, useDispatch } from "react-redux";
import {
  formatAadhaarNumber,
  formatTime,
  getFileSizeLimitErrorMessage,
  IMAGE_FILE_ACCEPT,
  IsFormValid,
  isFileSizeWithinLimit,
  isImageFile,
  maskAadhaarNumber,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { APIResponseEntity } from "../../interface/apiResponse";
import { RootState } from "../../store";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import { Dialog } from "primereact/dialog";
import { InputOtp } from "primereact/inputotp";
import {
  IAadharCardResponse,
  OnlyAadharNumber,
} from "../../interface/contract";
import { RadioButton } from "primereact/radiobutton";
import {
  BANK_ACCOUNT_NUMBER_ONLY_PATTERN,
  BANK_NAME_PATTERN,
  CIN_NUMBER_REGEX,
  IFSC_CODE_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
  UDHYAM_AADHAAR_REGEX,
} from "../../utils/constants/pattern";
import { updateShowPanDetailPopUp } from "../../store/reducer/userSlice";
import { setEncryptedSessionStorage } from "../../utils/functions/sessionStorage";
import { OTPType, StorageKeyEnum } from "../../utils/constants/enum";
import { ProfileTextField } from "./ProfileTextField";
import { Dropdown } from "primereact/dropdown";
import DateTextField from "./DateTextField";
import { environment } from "../../utils/constants/environments";
import { validationMessages } from "../../utils/constants/messages";
import { Checkbox } from "primereact/checkbox";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import { Image } from "primereact/image";
import { Calendar } from "primereact/calendar";

const MOBILE_UPDATE_OTP_LENGTH = 4;

const Profile = () => {
  const [userFormData, setUserFormData] = useState<IUserInfo>();

  const [verifiedProfileFields, setVerifiedProfileFields] = useState({
    cinOrLLP: false,
    udhyamAadhaar: false,
    mobileNumber: false,
  });

  const [initialValidationFields, setInitialValidationFields] = useState<{
    cinOrLLP: string | null;
    udhyamAadhaar: string | null;
  }>({
    cinOrLLP: null,
    udhyamAadhaar: null,
  });

  const [verifyingProfileField, setVerifyingProfileField] = useState<
    "cinOrLLP" | "udhyamAadhaar" | "mobileNumber" | null
  >(null);

  const [formErrors, setFormErrors] = useState<IUserValidation>({
    bankAccountNumber: validationMessages.bankAccountNumberRequired,
    ifscCode: validationMessages.ifscCodeRequired,
    bankName: validationMessages.bankNameRequired,
    address: validationMessages.addressRequired,
    city: validationMessages.cityRequired,
    state: validationMessages.stateRequired,
    zipCode: validationMessages.zipCodeRequired,
    aadhaar: validationMessages.aadhaarRequired,
    mobileNumber: validationMessages.mobileNumberRequired,
    cinOrLLP: "",
    udhyamAadhaar: "",
  });

  const [selectedGSTNumber, setSelectedGSTNumber] = useState<string>("");

  const [selectedGSTDetail, setSelectedGSTDetail] = useState<IGSTListInfo>();

  const [manualGSTDetails, setManualGSTDetails] = useState({
    gstAddress: "",
    tradeName: "",
  });

  const [manualGSTDate, setManualGSTDate] = useState<string>("");

  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState<
    number | null
  >(null);

  const [selectedPartnerDraft, setSelectedPartnerDraft] = useState<
    IUserInfo["partners"][number] | null
  >(null);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof IUserValidation, boolean>>
  >({});

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [isFieldEditable, setIsFieldEditable] =
    useState<IProfileFieldUpdateable>({
      aadhaar: false,
      address: false,
      city: false,
      state: false,
      zipCode: false,
      mobileNumber: false,
    });

  const [loading, setLoading] = useState<boolean>(false);

  const [mobileOtpPopUp, setMobileOtpPopUp] = useState<boolean>(false);

  const [mobileOtpValue, setMobileOtpValue] = useState<string>("");

  const [mobileNumberForVerification, setMobileNumberForVerification] =
    useState<string>("");

  const [aadhaarCardNumber, setAadhaarCardNumber] = useState<string>("");

  const userData = useSelector((state: RootState) => state.user.user);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [mobileOtpTimeLeft, setMobileOtpTimeLeft] = useState<number>(0);

  const { create } = usePermission("Profile", ["create"])();

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const dispatch = useDispatch();

  const shouldIncludeBankDetails = (
    userType: number,
  ): boolean =>
    [CLIENT_ROLE.SUPER_ADMIN].includes(userType);

  const fetchUserInfo = async (): Promise<void> => {
    setLoading(true);

    const response: IUserProfileResponse = await fetchUserProfile();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        emailID: response.data.emailID
          ? decryptVAPTData(response.data.emailID)
          : "",
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        address: response.data.address
          ? decryptVAPTData(response.data.address)
          : "",
        city: response.data.city ? decryptVAPTData(response.data.city) : "",
        state: response.data.state ? decryptVAPTData(response.data.state) : "",
        selectedGstNumber: response.data.selectedGstNumber
          ? decryptVAPTData(response.data.selectedGstNumber)
          : "",
        udhyamAadhaar: response.data.udhyamAadhaar
          ? decryptVAPTData(response.data.udhyamAadhaar)
          : null,
        cinOrLLP: response.data.cinOrLLP
          ? decryptVAPTData(response.data.cinOrLLP)
          : null,
        zipCode: response.data.zipCode
          ? decryptVAPTData(response.data.zipCode)
          : "",
        dateOfBirth: response.data.dateOfBirth
          ? decryptVAPTData(response.data.dateOfBirth)
          : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
        aadhaar: response.data.aadhaar
          ? decryptVAPTData(response.data.aadhaar).replace(/-/g, "")
          : "",
        ifscCode: response.data.ifscCode
          ? decryptVAPTData(response.data.ifscCode)
          : "",
        bankAccountNumber: response.data.bankAccountNumber
          ? decryptVAPTData(response.data.bankAccountNumber)
          : "",
        partners:
          response.data.partners?.map((partner) => ({
            ...partner,
            pan: partner.pan ? decryptVAPTData(partner.pan) : "",
            aadhaarNumber: partner.aadhaarNumber
              ? decryptVAPTData(partner.aadhaarNumber)?.replace(/-/g, "")
              : "",
            address: partner.address ? decryptVAPTData(partner.address) : "",
            city: partner.city ? decryptVAPTData(partner.city) : "",
            state: partner.state ? decryptVAPTData(partner.state) : "",
            pinCode: partner.pinCode ? decryptVAPTData(partner.pinCode) : "",
            dateOfBirth: partner.dateOfBirth
              ? decryptVAPTData(partner.dateOfBirth)
              : "",
            mobile: partner.mobile ? decryptVAPTData(partner.mobile) : "",
            gender: partner.gender ? partner.gender : "",
          })) || [],
        coApplicants:
          response.data.coApplicants?.map((coApplicant) => ({
            ...coApplicant,
            pan: coApplicant.pan ? decryptVAPTData(coApplicant.pan) : "",
            aadhaarNumber: coApplicant.aadhaarNumber
              ? decryptVAPTData(coApplicant.aadhaarNumber)?.replace(/-/g, "")
              : "",
          })) || [],
        gstList:
          response.data.gstList?.map((gst) => ({
            ...gst,
            gstNumber: gst.gstNumber
              ? decryptVAPTData(gst.gstNumber)
              : gst.gstNumber,
            tradeName: gst.tradeName
              ? decryptVAPTData(gst.tradeName) === "" ? null : decryptVAPTData(gst.tradeName)
              : gst.tradeName,
            gstAddress: gst.gstAddress
              ? decryptVAPTData(gst.gstAddress) === "" ? null : decryptVAPTData(gst.gstAddress)
              : gst.gstAddress,
            dateOfGstRegistration: gst.dateOfGstRegistration
              ? decryptVAPTData(gst.dateOfGstRegistration) === "" ? null : decryptVAPTData(gst.dateOfGstRegistration)
              : gst.dateOfGstRegistration,
          })) || [],
      };

      setSelectedGSTNumber(decryptedData.selectedGstNumber!);

      setInitialValidationFields({
        cinOrLLP: decryptedData.cinOrLLP ?? null,
        udhyamAadhaar: decryptedData.udhyamAadhaar ?? null,
      });

      // setVerifiedProfileFields({
      //   cinOrLLP: !IsStringNullEmptyOrUndefined(
      //     decryptedData.cinOrLLP ?? "",
      //   ),
      //   udhyamAadhaar: !IsStringNullEmptyOrUndefined(
      //     decryptedData.udhyamAadhaar ?? "",
      //   ),
      // });

      const updatedUser = {
        ...userData,
        profilePicture: decryptedData.profilePicture!,
      };

      dispatch(updateShowPanDetailPopUp(updatedUser));

      if (!isImpersonate) {
        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
          JSON.stringify(updatedUser),
        );
      }

      const maskUserData = (data: IUserInfo | undefined) => {
        if (!data) return undefined;
        return {
          ...data,
          aadhaar: maskAadhaarNumber(data.aadhaar),
          partners:
            data.partners?.map((partner: any) => ({
              ...partner,
              aadhaarNumber: maskAadhaarNumber(partner.aadhaarNumber),
            })) || [],
          coApplicants:
            data.coApplicants?.map((coApplicant: any) => ({
              ...coApplicant,
              aadhaarNumber: maskAadhaarNumber(coApplicant.aadhaarNumber),
            })) || [],
        };
      };

      setUserFormData(maskUserData(decryptedData));
    }

    setLoading(false);
  };

  const handlePinCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);

    const { name, value } = e.target;

    setFormErrors({
      ...formErrors,
      [name]: IsStringNullEmptyOrUndefined(value)
        ? validationMessages.zipCodeRequired
        : value.length !== 6
          ? validationMessages.zipCodeInvalid
          : "",
    });

    setUserFormData({
      ...userFormData!,
      [name]: value,
    });

    if (value.length === 6) {
      const response: IPincodeFetchDetailsResponse = await getDataByPincodeAPI({
        pincode: value ? Number(value) : 0,
      });

      if (!response) return;

      if (response.data && response.statusCode === 200) {
        setUserFormData((prev: any) => ({
          ...prev,
          city: response.data.circle,
          state: response.data.state,
          country: response.data.country,
        }));
        setFormErrors((prev: any) => ({
          ...prev,
          city: "",
          state: "",
          country: "",
        }));
      } else {
        toastError(response.message);
      }
    }

    setLoading(false);
  };

  const handleUdhyamAadhaar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.toUpperCase().replace(/\s/g, "");

    setVerifiedProfileFields((prev) => ({
      ...prev,
      udhyamAadhaar: false,
    }));

    setFormErrors((prev) => ({
      ...prev,
      udhyamAadhaar: IsStringNullEmptyOrUndefined(sanitizedValue)
        ? ""
        : !UDHYAM_AADHAAR_REGEX.test(sanitizedValue)
          ? validationMessages.validUdhyamNumber
          : "Please verify the Udhyam Aadhaar number",
    }));

    setUserFormData({
      ...userFormData!,
      [name]: sanitizedValue,
    });
  };

  const appendValidatedProfileField = (
    formData: FormData,
    fieldName: "cinOrLLP" | "udhyamAadhaar",
    fieldValue?: string | null,
  ): void => {
    const normalizedValue = fieldValue?.trim() ?? "";
    const initialValue = initialValidationFields[fieldName];
    const shouldAppendValue = verifiedProfileFields[fieldName];

    if (
      !IsStringNullEmptyOrUndefined(normalizedValue) &&
      shouldAppendValue
    ) {
      formData.append(fieldName, encryptVAPTData(normalizedValue));
      return;
    }

    if (!IsStringNullEmptyOrUndefined(initialValue ?? "")) {
      formData.append(fieldName, "");
    }
  };

  const validateUdhyamAadhaarField = async (
    valueToValidate?: string | null,
    showSuccessToast: boolean = true,
  ): Promise<boolean> => {
    const value = (valueToValidate ?? userFormData?.udhyamAadhaar ?? "")
      .toUpperCase()
      .trim();

    if (IsStringNullEmptyOrUndefined(value)) {
      toastError(validationMessages.validUdhyamNumber);
      setFormErrors((prev) => ({
        ...prev,
        udhyamAadhaar: validationMessages.validUdhyamNumber,
      }));
      setVerifiedProfileFields((prev) => ({
        ...prev,
        udhyamAadhaar: false,
      }));
      return false;
    }

    if (!UDHYAM_AADHAAR_REGEX.test(value)) {
      toastError(validationMessages.validUdhyamNumber);
      setFormErrors((prev) => ({
        ...prev,
        udhyamAadhaar: validationMessages.validUdhyamNumber,
      }));
      return false;
    }

    setVerifyingProfileField("udhyamAadhaar");

    const body: IValidateUdhyamNumberBody = {
      udyamRegNo: encryptVAPTData(value),
    };

    try {
      const response: APIResponseEntity = await validateUdyamNumberAPI(body);

      if (!response || response.statusCode !== 200) {
        const errorMessage =
          response?.message || validationMessages.validUdhyamNumber;
        toastError(errorMessage);
        setFormErrors((prev) => ({
          ...prev,
          udhyamAadhaar: errorMessage,
        }));
        setVerifiedProfileFields((prev) => ({
          ...prev,
          udhyamAadhaar: false,
        }));
        return false;
      }

      setUserFormData((prev) =>
        prev
          ? {
            ...prev,
            udhyamAadhaar: value,
          }
          : prev,
      );
      setFormErrors((prev) => ({
        ...prev,
        udhyamAadhaar: "",
      }));
      setVerifiedProfileFields((prev) => ({
        ...prev,
        udhyamAadhaar: true,
      }));

      if (showSuccessToast) {
        toastSuccess(response.message);
      }

      return true;
    } finally {
      setVerifyingProfileField(null);
    }
  };

  const handleCINNumber = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.toUpperCase().replace(/\s/g, "");

    setVerifiedProfileFields((prev) => ({
      ...prev,
      cinOrLLP: false,
    }));
    setFormErrors((prev) => ({
      ...prev,
      cinOrLLP: IsStringNullEmptyOrUndefined(sanitizedValue)
        ? ""
        : !CIN_NUMBER_REGEX.test(sanitizedValue)
          ? validationMessages.validCINNumber
          : "Please verify the CIN/LLP number",
    }));

    setUserFormData({
      ...userFormData!,
      [name]: sanitizedValue,
    });
  };

  const validateCINNumberField = async (
    valueToValidate?: string | null,
    showSuccessToast: boolean = true,
  ): Promise<boolean> => {
    const value = (valueToValidate ?? userFormData?.cinOrLLP ?? "")
      .toUpperCase()
      .trim();

    if (IsStringNullEmptyOrUndefined(value)) {
      toastError(validationMessages.validCINNumber);
      setFormErrors((prev) => ({
        ...prev,
        cinOrLLP: validationMessages.validCINNumber,
      }));
      setVerifiedProfileFields((prev) => ({
        ...prev,
        cinOrLLP: false,
      }));
      return false;
    }

    if (!CIN_NUMBER_REGEX.test(value)) {
      toastError(validationMessages.validCINNumber);
      setFormErrors((prev) => ({
        ...prev,
        cinOrLLP: validationMessages.validCINNumber,
      }));
      return false;
    }

    setVerifyingProfileField("cinOrLLP");

    const body: IValidateCINNumberBody = {
      cin: encryptVAPTData(value),
    };

    try {
      const response: APIResponseEntity = await validateCinNumberAPI(body);

      if (!response || response.statusCode !== 200) {
        const errorMessage =
          response?.message || validationMessages.validCINNumber;
        toastError(errorMessage);
        setFormErrors((prev) => ({
          ...prev,
          cinOrLLP: errorMessage,
        }));
        setVerifiedProfileFields((prev) => ({
          ...prev,
          cinOrLLP: false,
        }));
        return false;
      }

      setUserFormData((prev) =>
        prev
          ? {
            ...prev,
            cinOrLLP: value,
          }
          : prev,
      );
      setFormErrors((prev) => ({
        ...prev,
        cinOrLLP: "",
      }));
      setVerifiedProfileFields((prev) => ({
        ...prev,
        cinOrLLP: true,
      }));

      if (showSuccessToast) {
        toastSuccess(response.message);
      }

      return true;
    } finally {
      setVerifyingProfileField(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;

    setTouchedFields((previous) => ({
      ...previous,
      [name as keyof IUserValidation]: true,
    }));

    switch (name) {
      case "bankAccountNumber": {
        let errorMessage: string = "";
        const isValid = BANK_ACCOUNT_NUMBER_ONLY_PATTERN.test(value);

        if (shouldIncludeBankDetails(userData.userType)) {
          if (!isValid) {
            errorMessage = validationMessages.bankAccountNumberInvalid;
          }

          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.bankAccountNumberRequired;
          }
        } else if (shouldIncludeBankDetails(userData.userType)) {
          if (!IsStringNullEmptyOrUndefined(value)) {
            if (!isValid) {
              errorMessage = validationMessages.bankAccountNumberInvalid;
            }
          }
        }

        setFormErrors({
          ...formErrors,
          [name]: errorMessage,
        });

        setUserFormData({
          ...userFormData!,
          [name]: value,
        });
        break;
      }

      case "ifscCode": {
        let errorMessage: string = "";
        const isValid: boolean = IFSC_CODE_PATTERN.test(value);

        if (shouldIncludeBankDetails(userData.userType)) {
          if (!isValid) {
            errorMessage = validationMessages.ifscCodeInvalid;
          }

          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.ifscCodeRequired;
          }
        } else if (shouldIncludeBankDetails(userData.userType)) {
          if (!IsStringNullEmptyOrUndefined(value)) {
            if (!isValid) {
              errorMessage = validationMessages.ifscCodeInvalid;
            }
          }
        }

        setFormErrors({
          ...formErrors,
          [name]: errorMessage,
        });

        setUserFormData({
          ...userFormData!,
          [name]: value.toUpperCase().trim(),
        });

        break;
      }

      case "bankName": {
        let errorMessage: string = "";

        if (shouldIncludeBankDetails(userData.userType)) {
          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.bankNameRequired;
          } else if (!BANK_NAME_PATTERN.test(value.trim())) {
            errorMessage = validationMessages.bankNameInvalidGeneric;
          }
        } else if (shouldIncludeBankDetails(userData.userType) && !IsStringNullEmptyOrUndefined(value) && !BANK_NAME_PATTERN.test(value.trim())) {
          errorMessage = validationMessages.bankNameInvalidGeneric;
        }

        setFormErrors({
          ...formErrors,
          [name]: errorMessage,
        });

        setUserFormData({
          ...userFormData!,
          [name]: value.trimStart(),
        });
        break;
      }

      case "address": {
        let cleanedValue = value
          .replace(/[^a-zA-Z0-9\s,./-]/g, "")
          .replace(/\b\w/g, (char) => char.toUpperCase())
          .trimStart();

        setFormErrors({
          ...formErrors,
          [name]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.addressRequired
            : "",
        });

        setUserFormData({
          ...userFormData!,
          [name]: cleanedValue,
        });

        break;
      }

      case "city": {
        let cleanedValue = value
          .replace(/[^a-zA-Z\s]/g, "")
          .replace(/\b\w/g, (char) => char.toUpperCase())
          .trimStart();

        setFormErrors({
          ...formErrors,
          [name]: IsStringNullEmptyOrUndefined(cleanedValue)
            ? validationMessages.cityRequired
            : "",
        });

        setUserFormData({
          ...userFormData!,
          [name]: cleanedValue,
        });
        break;
      }

      case "state": {
        let cleanedValue = value
          .replace(/[^a-zA-Z\s]/g, "") // Remove everything except letters and spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
          .trimStart(); // Remove leading spaces

        setFormErrors({
          ...formErrors,
          [name]: IsStringNullEmptyOrUndefined(cleanedValue)
            ? validationMessages.stateRequired
            : "",
        });

        setUserFormData({
          ...userFormData!,
          [name]: cleanedValue,
        });
        break;
      }

      case "zipCode": {
        if (e.target instanceof HTMLInputElement) {
          handlePinCode(e as React.ChangeEvent<HTMLInputElement>);
        }
        break;
      }

      case "aadhaar": {
        const rawValue = value.replace(/\D/g, "").slice(0, 12);
        const formattedValue = formatAadhaarNumber(rawValue);

        setFormErrors({
          ...formErrors,
          [name]: IsStringNullEmptyOrUndefined(rawValue)
            ? validationMessages.aadhaarRequired
            : rawValue.length !== 12
              ? validationMessages.aadhaarInvalid
              : "",
        });

        setUserFormData({ ...userFormData!, [name]: formattedValue });

        setAadhaarCardNumber(formattedValue);
        return;
      }

      case "udhyamAadhaar": {
        if (e.target instanceof HTMLInputElement) {
          handleUdhyamAadhaar(e as React.ChangeEvent<HTMLInputElement>);
        }
        break;
      }

      case "cinOrLLP": {
        if (e.target instanceof HTMLInputElement) {
          handleCINNumber(e as React.ChangeEvent<HTMLInputElement>);
        }
        break;
      }

      case "mobileNumber": {
        const isValid: boolean =
          INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

        setVerifiedProfileFields((prev) => ({
          ...prev,
          mobileNumber: false,
        }));

        setFormErrors({
          ...formErrors,
          [name]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.mobileNumberRequired
            : !isValid
              ? validationMessages.mobileNumberInvalid
              : "",
        });

        setUserFormData({
          ...userFormData!,
          [name]: value.trim(),
        });

        break;
      }

      default:
        break;
    }
  };

  const shouldShowFieldError = (field: keyof IUserValidation): boolean =>
    isEditable && (isFormSubmitted || Boolean(touchedFields[field]));

  const handleGSTDetailFieldChange = (
    field: keyof typeof manualGSTDetails,
    value: string,
  ): void => {
    setManualGSTDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getGSTDetailValue = (
    field: keyof typeof manualGSTDetails,
  ): string => {
    const manualValue = manualGSTDetails[field];

    if (!IsStringNullEmptyOrUndefined(manualValue)) {
      return manualValue;
    }

    return selectedGSTDetail?.[field] ?? "";
  };

  const normalizeGSTDateToISO = (value?: string | null): string => {
    if (IsStringNullEmptyOrUndefined(value ?? "")) {
      return "";
    }

    const trimmedValue = value!.trim();

    const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateMatch) {
      return trimmedValue;
    }

    const slashDateMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashDateMatch) {
      const [, day, month, year] = slashDateMatch;
      return `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(trimmedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return trimmedValue;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getGSTDateValue = (): string => {
    if (!IsStringNullEmptyOrUndefined(manualGSTDate)) {
      return normalizeGSTDateToISO(manualGSTDate);
    }

    if (!selectedGSTDetail?.dateOfGstRegistration) {
      return "";
    }

    return normalizeGSTDateToISO(selectedGSTDetail.dateOfGstRegistration);
  };

  const buildGSTInfoPayload = (): string => {
    if (!userFormData?.isCompany || !selectedGSTNumber) {
      return JSON.stringify({
        tradeName: "",
        gstAddress: "",
        dateOfGstRegistration: "",
      });
    }

    return JSON.stringify({
      tradeName: encryptVAPTData(getGSTDetailValue("tradeName")),
      gstAddress: encryptVAPTData(getGSTDetailValue("gstAddress")),
      dateOfGstRegistration: encryptVAPTData(getGSTDateValue()),
    });
  };

  const handleUpdateGstDetail = (): void => {
    const updatedDetail = userFormData?.gstList.find(
      (gstDetail) => gstDetail.gstNumber === selectedGSTNumber,
    );

    setSelectedGSTDetail(updatedDetail);
    setManualGSTDetails({
      gstAddress: "",
      tradeName: "",
    });
    setManualGSTDate("");
  };

  const handleEnforcementDateChange = (value: Date | null): void => {
    if (!value) {
      setManualGSTDate("");
      return;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    setManualGSTDate(`${year}-${month}-${day}`);
  };

  const handleOpenPartnerDetails = (partnerIndex: number): void => {
    const partner = userFormData?.partners?.[partnerIndex];

    if (!partner) return;

    setSelectedPartnerIndex(partnerIndex);
    setSelectedPartnerDraft({ ...partner });
  };

  const handleClosePartnerDetails = (): void => {
    setSelectedPartnerIndex(null);
    setSelectedPartnerDraft(null);
  };

  const handlePartnerDraftChange = (field: string, value: string): void => {
    if (!selectedPartnerDraft) return;

    setSelectedPartnerDraft({
      ...selectedPartnerDraft,
      [field]: value,
    });
  };

  const handlePartnerDraftPinCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!selectedPartnerDraft) return;

    const value = e.target.value;

    setSelectedPartnerDraft((prev) =>
      prev
        ? {
          ...prev,
          pinCode: value,
          city: value.length === 6 ? prev.city : "",
          state: value.length === 6 ? prev.state : "",
        }
        : prev,
    );

    if (value.length !== 6) return;

    setLoading(true);

    const response: IPincodeFetchDetailsResponse = await getDataByPincodeAPI({
      pincode: Number(value),
    });

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.data && response.statusCode === 200) {
      setSelectedPartnerDraft((prev) =>
        prev
          ? {
            ...prev,
            city: response.data.circle,
            state: response.data.state,
          }
          : prev,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const getEncryptedPartners = (
    partners: IUserInfo["partners"] | undefined,
  ): Record<string, unknown>[] =>
    partners?.map((partner: any) => {
      const encryptedPartner: any = {};

      Object.keys(partner).forEach((key) => {
        if (
          [
            "id",
            "name",
            "firstName",
            "middleName",
            "lastName",
            "gender",
          ].includes(key)
        ) {
          encryptedPartner[key] = partner[key];
        } else {
          const currentValue = partner[key];
          encryptedPartner[key] =
            currentValue !== null &&
              currentValue !== undefined &&
              currentValue !== ""
              ? encryptVAPTData(String(currentValue))
              : currentValue;
        }
      });

      return encryptedPartner;
    }) || [];

  const buildProfileFormData = (
    partnersOverride?: IUserInfo["partners"],
  ): FormData => {
    const formData: FormData = new FormData();

    formData.append("billingDetails", "true");

    if (shouldIncludeBankDetails(userData.userType)) {
      formData.append("bankName", userFormData?.bankName || "");

      formData.append(
        "bankAccountNumber",
        userFormData?.bankAccountNumber
          ? encryptVAPTData(userFormData?.bankAccountNumber)
          : "",
      );

      formData.append(
        "ifscCode",
        userFormData?.ifscCode ? encryptVAPTData(userFormData?.ifscCode) : "",
      );
    }

    formData.append("aadhaar", encryptVAPTData(userFormData?.aadhaar));

    if (userFormData?.isCompany && selectedGSTNumber) {
      formData.append("gstNumber", encryptVAPTData(selectedGSTNumber));
      formData.append("gstInfo", buildGSTInfoPayload());
    }

    formData.append("address", encryptVAPTData(userFormData?.address!));
    formData.append("city", encryptVAPTData(userFormData?.city!));
    formData.append("state", encryptVAPTData(userFormData?.state!));
    formData.append("zipCode", encryptVAPTData(userFormData?.zipCode!));

    appendValidatedProfileField(
      formData,
      "udhyamAadhaar",
      userFormData?.udhyamAadhaar,
    );
    appendValidatedProfileField(formData, "cinOrLLP", userFormData?.cinOrLLP);

    formData.append(
      "mobileNumber",
      encryptVAPTData(String(userFormData?.mobileNumber)),
    );

    formData.append("userConsents", JSON.stringify(userFormData?.userConsents));
    formData.append(
      "partners",
      JSON.stringify(
        getEncryptedPartners(partnersOverride ?? userFormData?.partners),
      ),
    );

    return formData;
  };

  const handleSavePartnerDetails = async (): Promise<void> => {
    if (
      selectedPartnerIndex === null ||
      !selectedPartnerDraft ||
      !userFormData?.partners
    ) {
      return;
    }

    setLoading(true);

    const updatedPartners = [...userFormData.partners];
    updatedPartners[selectedPartnerIndex] = selectedPartnerDraft;

    const formData = buildProfileFormData(updatedPartners);

    const response: APIResponseEntity = await updateUserProfile(formData);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      handleClosePartnerDetails();
      fetchUserInfo();
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleReset = (): void => {
    setAadhaarCardNumber("");
    handleClosePartnerDetails();
    setIsEditable(false);
    setTouchedFields({});
    setVerifiedProfileFields({
      cinOrLLP: false,
      udhyamAadhaar: false,
      mobileNumber: false,
    });
    closeMobileOtpModal();
    setMobileNumberForVerification("");
    fetchUserInfo();
    setIsFormSubmitted(false);
  };

  const handleSave = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const effectiveFormErrors = {
      ...formErrors,
      cinOrLLP:
        !verifiedProfileFields.cinOrLLP &&
          !IsStringNullEmptyOrUndefined(userFormData?.cinOrLLP ?? "")
          ? ""
          : formErrors.cinOrLLP,
      udhyamAadhaar:
        !verifiedProfileFields.udhyamAadhaar &&
          !IsStringNullEmptyOrUndefined(userFormData?.udhyamAadhaar ?? "")
          ? ""
          : formErrors.udhyamAadhaar,
    };

    if (
      effectiveFormErrors.cinOrLLP !== formErrors.cinOrLLP ||
      effectiveFormErrors.udhyamAadhaar !== formErrors.udhyamAadhaar
    ) {
      setFormErrors(effectiveFormErrors);
    }

    const isValid: boolean = IsFormValid(effectiveFormErrors);

    if (!isValid) return;

    setLoading(true);

    const formData: FormData = new FormData();

    formData.append("billingDetails", "true");

    if (shouldIncludeBankDetails(userData.userType)) {
      formData.append("bankName", userFormData?.bankName || "");

      formData.append(
        "bankAccountNumber",
        userFormData?.bankAccountNumber
          ? encryptVAPTData(userFormData?.bankAccountNumber)
          : "",
      );

      formData.append(
        "ifscCode",
        userFormData?.ifscCode ? encryptVAPTData(userFormData?.ifscCode) : "",
      );
    }

    // Temporary added for until the aadhar number flow is not working
    formData.append("aadhaar", encryptVAPTData(userFormData?.aadhaar));

    if (userFormData?.isCompany && selectedGSTNumber) {
      formData.append("gstNumber", encryptVAPTData(selectedGSTNumber));
      formData.append("gstInfo", buildGSTInfoPayload());
    }

    formData.append("address", encryptVAPTData(userFormData?.address!));

    formData.append("city", encryptVAPTData(userFormData?.city!));

    formData.append("state", encryptVAPTData(userFormData?.state!));

    formData.append("zipCode", encryptVAPTData(userFormData?.zipCode!));

    appendValidatedProfileField(
      formData,
      "udhyamAadhaar",
      userFormData?.udhyamAadhaar,
    );

    appendValidatedProfileField(formData, "cinOrLLP", userFormData?.cinOrLLP);

    formData.append(
      "mobileNumber",
      encryptVAPTData(String(userFormData?.mobileNumber)),
    );

    formData.append("userConsents", JSON.stringify(userFormData?.userConsents));

    const encryptedPartners =
      userFormData?.partners?.map((partner: any) => {
        const encryptedPartner: any = {};

        Object.keys(partner).forEach((key) => {
          if (
            [
              "id",
              "name",
              "firstName",
              "middleName",
              "lastName",
              "gender",
            ].includes(key)
          ) {
            encryptedPartner[key] = partner[key];
          } else {
            const value = partner[key];
            encryptedPartner[key] =
              value !== null && value !== undefined && value !== ""
                ? encryptVAPTData(String(value))
                : value;
          }
        });

        return encryptedPartner;
      }) || [];

    formData.append("partners", JSON.stringify(encryptedPartners));

    const response: APIResponseEntity = await updateUserProfile(formData);

    if (!response) return;

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      handleReset();
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setLoading(true);

    const input = e.target;
    const selectedFile = e.target.files ? e.target.files[0] : null;
    const inputId = e.target.id;

    if (!selectedFile) {
      input.value = "";
      setLoading(false);
      return;
    }

    if (!isImageFile(selectedFile)) {
      toastError("Invalid file type. Only JPG, JPEG, or PNG images are allowed.");
      input.value = "";
      setLoading(false);
      return;
    }

    if (!isFileSizeWithinLimit(selectedFile)) {
      toastError(getFileSizeLimitErrorMessage("File"));
      input.value = "";
      setLoading(false);
      return;
    }

    const formData: FormData = new FormData();

    if (inputId === "profileImage") {
      formData.append("profilePicture", selectedFile);
    }

    if (inputId === "cpCompanyLogo") {
      formData.append("cpCompanyLogo", selectedFile);
    }

    const response: APIResponseEntity = await updateUserProfile(formData);

    if (!response) return;

    if (response.statusCode === 200) {
      fetchUserInfo();
      toastSuccess(response.message);
    } else {
      toastError(response.message);
    }

    input.value = "";
    setLoading(false);
  };

  const handleSendMobileOtp = async (): Promise<void> => {
    const mobileNumber = String(userFormData?.mobileNumber || "").trim();
    const isValidMobileNumber =
      INDIAN_MOBILE_NUMBER_PATTERN.test(mobileNumber) &&
      mobileNumber.length === 10;

    if (!isValidMobileNumber) {
      // setFormErrors((prev) => ({
      //   ...prev,
      //   mobileNumber: validationMessages.mobileNumberInvalid,
      // }));
      toastError(validationMessages.mobileNumberInvalid);
      return;
    }

    setLoading(true);
    setVerifyingProfileField("mobileNumber");

    try {
      const response: APIResponseEntity = await sendUpdateMobileOtp({
        mobileNumber: encryptVAPTData(mobileNumber),
      });

      if (response?.statusCode === 200) {
        setMobileNumberForVerification(mobileNumber);
        setMobileOtpValue("");
        setMobileOtpTimeLeft(environment.OTP_TIMER);
        setMobileOtpPopUp(true);
        toastSuccess(response.message);
      } else if (response) {
        toastError(response.message);
      }
    } finally {
      setVerifyingProfileField(null);
      setLoading(false);
    }
  };

  const handleVerifyMobileOtp = async (): Promise<void> => {
    if (mobileOtpValue.length !== MOBILE_UPDATE_OTP_LENGTH) {
      toastError(`Please enter a valid ${MOBILE_UPDATE_OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);
    setVerifyingProfileField("mobileNumber");

    try {
      const response: APIResponseEntity = await verifyUpdateMobileOtp({
        mobileNumber: encryptVAPTData(mobileNumberForVerification),
        otp: mobileOtpValue,
      });

      if (response?.statusCode === 200) {
        setVerifiedProfileFields((prev) => ({
          ...prev,
          mobileNumber: true,
        }));
        setFormErrors((prev) => ({
          ...prev,
          mobileNumber: "",
        }));
        setMobileOtpPopUp(false);
        setMobileOtpValue("");
        setMobileOtpTimeLeft(0);
        toastSuccess(response.message);
      } else if (response) {
        toastError(response.message);
      }
    } finally {
      setVerifyingProfileField(null);
      setLoading(false);
    }
  };

  const resendMobileOtp = async (): Promise<void> => {
    if (!mobileNumberForVerification) return;

    setLoading(true);

    try {
      const response: APIResponseEntity = await sendUpdateMobileOtp({
        mobileNumber: encryptVAPTData(mobileNumberForVerification),
      });

      if (response?.statusCode === 200) {
        setMobileOtpValue("");
        setMobileOtpTimeLeft(environment.OTP_TIMER);
        toastSuccess(response.message);
      } else if (response) {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeMobileOtpModal = (): void => {
    setMobileOtpPopUp(false);
    setMobileOtpValue("");
    setMobileOtpTimeLeft(0);
  };

  const handleEditButton = (): void => {
    setTouchedFields({});
    setIsFieldEditable(() => ({
      aadhaar:
        !userFormData?.isCompany &&
        IsStringNullEmptyOrUndefined(userFormData?.aadhaar ?? ""),
      address:
        userData.userType === CLIENT_ROLE.USER_MANAGEMENT
          ? IsStringNullEmptyOrUndefined(userFormData?.address ?? "")
          : true,
      city:
        userData.userType === CLIENT_ROLE.USER_MANAGEMENT
          ? IsStringNullEmptyOrUndefined(userFormData?.city ?? "")
          : true,
      state:
        userData.userType === CLIENT_ROLE.USER_MANAGEMENT
          ? IsStringNullEmptyOrUndefined(userFormData?.state ?? "")
          : true,
      zipCode:
        userData.userType === CLIENT_ROLE.USER_MANAGEMENT
          ? IsStringNullEmptyOrUndefined(userFormData?.zipCode ?? "")
          : true,
      mobileNumber: IsStringNullEmptyOrUndefined(
        userFormData?.mobileNumber ?? "",
      ),
    }));

    setIsEditable(!isEditable);

    setFormErrors({
      ...formErrors,

      bankAccountNumber:
        shouldIncludeBankDetails(userData.userType) &&
          IsStringNullEmptyOrUndefined(userFormData?.bankAccountNumber ?? "")
          ? validationMessages.bankAccountNumberRequired
          : "",

      ifscCode:
        shouldIncludeBankDetails(userData.userType) &&
          IsStringNullEmptyOrUndefined(userFormData?.ifscCode ?? "")
          ? validationMessages.ifscCodeRequired
          : "",

      bankName:
        shouldIncludeBankDetails(userData.userType) &&
          IsStringNullEmptyOrUndefined(userFormData?.bankName ?? "")
          ? validationMessages.bankNameRequired
          : "",

      address: IsStringNullEmptyOrUndefined(userFormData?.address ?? "")
        ? validationMessages.addressRequired
        : "",

      city: IsStringNullEmptyOrUndefined(userFormData?.city ?? "")
        ? validationMessages.cityRequired
        : "",

      state: IsStringNullEmptyOrUndefined(userFormData?.state ?? "")
        ? validationMessages.stateRequired
        : "",

      zipCode: IsStringNullEmptyOrUndefined(userFormData?.zipCode ?? "")
        ? validationMessages.zipCodeRequired
        : "",

      aadhaar:
        !userFormData?.isCompany &&
          IsStringNullEmptyOrUndefined(userFormData?.aadhaar ?? "")
          ? validationMessages.aadhaarRequired
          : "",

      mobileNumber:
        userData.userType === CLIENT_ROLE.USER_MANAGEMENT
          ? ""
          : IsStringNullEmptyOrUndefined(userFormData?.mobileNumber ?? "")
            ? validationMessages.mobileNumberRequired
            : "",

      cinOrLLP: IsStringNullEmptyOrUndefined(userFormData?.cinOrLLP ?? "")
        ? ""
        : verifiedProfileFields.cinOrLLP
          ? ""
          : "Please verify the CIN/LLP number",

      udhyamAadhaar: IsStringNullEmptyOrUndefined(
        userFormData?.udhyamAadhaar ?? "",
      )
        ? ""
        : verifiedProfileFields.udhyamAadhaar
          ? ""
          : "Please verify the Udhyam Aadhaar number",
    });
  };

  const resendOTP = async (): Promise<void> => {
    setLoading(true);
    setTimeLeft(environment.OTP_TIMER);

    const body: OnlyAadharNumber = {
      userID: userData.userID,
      aadharNumber: encryptVAPTData(aadhaarCardNumber.replace(/\D/g, "")),
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

  const handleConsentChange = (userConsentID: number, isConsented: boolean) => {
    const updatedUserConsents = [...(userFormData?.userConsents || [])];

    const index = updatedUserConsents.findIndex(
      (consent) => consent.userConsentID === userConsentID,
    );

    if (index !== -1) {
      updatedUserConsents[index].isConsented = isConsented;
      setUserFormData({
        ...userFormData,
        userConsents: updatedUserConsents,
      } as IUserInfo);
    }
  };

  const handleCopyValue = (value: string, label: string): void => {
    if (IsStringNullEmptyOrUndefined(value)) {
      toastError(`${label} not available to copy.`);
      return;
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        toastSuccess(`${label} copied successfully.`);
      })
      .catch(() => {
        toastError(`Failed to copy ${label}. Please try again.`);
      });
  };

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
    let timer: NodeJS.Timeout | null = null;

    if (mobileOtpTimeLeft > 0) {
      timer = setInterval(() => {
        setMobileOtpTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mobileOtpTimeLeft]);

  useEffect(() => {
    // isProfileUpdated is for the updation of Partners and Co-Applicants fields
    fetchUserInfo();
  }, [isProfileUpdated]);

  useEffect(() => {
    handleUpdateGstDetail();
  }, [selectedGSTNumber, userFormData?.gstList]);

  return (
    <>
      <div className="whiteBoxHldr p-30">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="titleMainWrapper">
              <h2 className="txt-24">
                {`${isEditable ? "Edit " : ""}`}Profile
              </h2>
            </div>
          </div>

          <div className="col-12 mb-4 profileHeroStickyWrap">
            <div className="profileHeroCard">
              <div className="profileHeroIdentity">
                <div className="profilePhoto profileHeroAvatar">
                  {userFormData?.profilePicture ? (
                    <Image
                      src={userFormData?.profilePicture}
                      zoomSrc={userFormData?.profilePicture}
                      alt="Profile"
                      width="60"
                      height="60"
                      preview
                      className="profile-photo-img"
                    />
                  ) : (
                    <div className="profileHeroFallback">
                      {userFormData?.name?.charAt(0) || "P"}
                    </div>
                  )}

                  {create && (
                    <label
                      htmlFor="profileImage"
                      className="edit-icon"
                      aria-label="Edit Profile Image"
                    >
                      <i className="icon-edit" />
                    </label>
                  )}
                </div>

                <div className="profileHeroMeta">
                  <h3 className="profileHeroName">{userFormData?.name}</h3>

                  {userFormData?.panNumber &&
                    <div className="profileHeroPanRow">
                      <span className="profileHeroPan">
                        {userFormData?.panNumber}
                      </span>

                      <button
                        type="button"
                        className="profileIconButton"
                        onClick={() =>
                          handleCopyValue(
                            userFormData?.panNumber || "",
                            "PAN Card",
                          )
                        }
                        aria-label="Copy PAN"
                      >
                        <i className="bi bi-copy" />
                      </button>
                    </div>
                  }

                  <p className="profileHeroSubtext mb-0">
                    {userFormData?.role}
                  </p>
                </div>
              </div>

              <div className="profileHeroActions">
                {isEditable ? (
                  <>
                    <Button
                      className="btn btn-black-line"
                      onClick={handleReset}
                      label="Cancel"
                      disabled={verifyingProfileField !== null}
                    />
                    <Button
                      className="btn btn-orange"
                      onClick={handleSave}
                      label="Save"
                      disabled={verifyingProfileField !== null}
                    />
                  </>
                ) : (
                  create && (
                    <button
                      type="button"
                      className="profileIconButton profileHeroEdit"
                      onClick={handleEditButton}
                      aria-label="Edit profile"
                    >
                      <i className="icon-edit" />
                    </button>
                  )
                )}
              </div>
            </div>

            <InputText
              type="file"
              id="profileImage"
              accept={IMAGE_FILE_ACCEPT}
              onChange={handleFileChange}
              className="d-none"
            />
          </div>

          <div className="col-12">
            <div className="row profileWrapper">
              <div className="col-12">
                <div className="row">
                  <div className="col-12">
                    <div className="profileSectionHeader">
                      Credorbit Profile
                    </div>
                  </div>

                  {userData.userType !== CLIENT_ROLE.SUPER_ADMIN && userData.userType !== CLIENT_ROLE.USER_MANAGEMENT && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <div className="d-flex flex-row align-items-center justify-content-between">
                          <label
                            className="form-label mb-0"
                            htmlFor="customerID"
                          >
                            Code
                          </label>
                        </div>

                        <InputText
                          className="form-control"
                          placeholder="Code"
                          name="customerID"
                          value={userFormData?.customerID!}
                          disabled
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>
                  )}

                  {!userFormData?.isCompany && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <div className="d-flex justify-content-between">
                          <label className="form-label" htmlFor="aadhaar">
                            Aadhaar Number
                            {isEditable && isFieldEditable.aadhaar && (
                              <sup>*</sup>
                            )}
                          </label>
                        </div>

                        <InputText
                          className="form-control"
                          placeholder="Enter your aadhaar number"
                          name="aadhaar"
                          value={userFormData?.aadhaar ?? ""}
                          onChange={handleChange}
                          maxLength={14}
                          onKeyPress={(e) =>
                            restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                          }
                          // onPaste={(e) => e.preventDefault()}
                          // onCopy={(e) => e.preventDefault()}
                          // onCut={(e) => e.preventDefault()}
                          disabled={!isEditable || !isFieldEditable.aadhaar}
                        />

                        {shouldShowFieldError("aadhaar") && (
                          <span className="error">{formErrors.aadhaar}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {userData.userType !== CLIENT_ROLE.USER_MANAGEMENT && (
                    <DateTextField
                      label={
                        userFormData?.isCompany
                          ? "Date of Incorporation"
                          : "Date of Birth"
                      }
                      name="dateOfBirth"
                      value={
                        userFormData?.dateOfBirth
                          ? new Date(userFormData?.dateOfBirth).toISOString()
                          : ""
                      }
                      placeholder={
                        userFormData?.isCompany
                          ? "Date of Incorporation"
                          : "Date of Birth"
                      }
                    />
                  )}

                  <ProfileTextField
                    label="Email ID"
                    name="emailID"
                    value={userFormData?.emailID!}
                    placeholder="Email ID"
                  />

                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <label
                          className="form-label mb-0"
                          htmlFor="mobileNumber"
                        >
                          Mobile Number
                          {isEditable &&
                            userData.userType !== CLIENT_ROLE.USER_MANAGEMENT && (
                              <sup>*</sup>
                            )}
                        </label>

                        {isEditable &&
                          !IsStringNullEmptyOrUndefined(
                            userFormData?.mobileNumber?.trim() ?? "",
                          ) && (
                            <button
                              type="button"
                              className={`border-0 bg-transparent fw-medium small ${verifiedProfileFields.mobileNumber
                                ? "text-success"
                                : "text-orange cursor-pointer"
                                }`}
                              onClick={handleSendMobileOtp}
                              disabled={
                                verifiedProfileFields.mobileNumber ||
                                verifyingProfileField !== null
                              }
                            >
                              {verifyingProfileField === "mobileNumber" ? (
                                "Sending OTP..."
                              ) : verifiedProfileFields.mobileNumber ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-1" />
                                  Verified
                                </>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          )}
                      </div>

                      <InputText
                        className="form-control"
                        placeholder="Enter your mobile number"
                        name="mobileNumber"
                        value={
                          userData.userType === CLIENT_ROLE.USER_MANAGEMENT ||
                            !isEditable
                            ? formatMobileNumber(userFormData?.mobileNumber)
                            : userFormData?.mobileNumber
                        }
                        onChange={handleChange}
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        maxLength={10}
                        onKeyPress={(e) => {
                          restrictInputByPattern(e, NUMBER_ONLY_PATTERN);
                          if (
                            e.currentTarget.selectionStart === 0 &&
                            e.key === " "
                          ) {
                            e.preventDefault();
                          }
                        }}
                        // disabled={
                        //   !isEditable ||
                        //   userData.userType === CLIENT_ROLE.USER_MANAGEMENT ||
                        //   userData.userType === CLIENT_ROLE.CHANNEL_PARTNER
                        // }
                        disabled={!isEditable}
                      />

                      {shouldShowFieldError("mobileNumber") && (
                        <span className="error">{formErrors.mobileNumber}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <label
                          className="form-label mb-0"
                          htmlFor="cinOrLLP"
                        >
                          CIN/LLP
                        </label>

                        {isEditable &&
                          !IsStringNullEmptyOrUndefined(
                            userFormData?.cinOrLLP?.trim() ?? "",
                          ) && (
                            <button
                              type="button"
                              className={`border-0 bg-transparent fw-medium small ${verifiedProfileFields.cinOrLLP
                                ? "text-success"
                                : "text-orange cursor-pointer"
                                }`}
                              onClick={() => validateCINNumberField()}
                              disabled={
                                verifiedProfileFields.cinOrLLP ||
                                verifyingProfileField !== null
                              }
                            >
                              {verifyingProfileField === "cinOrLLP" ? (
                                "Verifying..."
                              ) : verifiedProfileFields.cinOrLLP ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-1" />
                                  Verified
                                </>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          )}
                      </div>

                      <InputText
                        className="form-control"
                        placeholder="Enter your CIN/LLP"
                        name="cinOrLLP"
                        value={userFormData?.cinOrLLP ?? ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        maxLength={25}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                      />

                      {shouldShowFieldError("cinOrLLP") &&
                        formErrors.cinOrLLP && (
                          <span className="error">{formErrors.cinOrLLP}</span>
                        )}

                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <label
                          className="form-label mb-0"
                          htmlFor="udhyamAadhaar"
                        >
                          Udhyam Aadhaar
                        </label>

                        {isEditable &&
                          !IsStringNullEmptyOrUndefined(
                            userFormData?.udhyamAadhaar?.trim() ?? "",
                          ) && (
                            <button
                              type="button"
                              className={`border-0 bg-transparent fw-medium small ${verifiedProfileFields.udhyamAadhaar
                                ? "text-success"
                                : "text-orange cursor-pointer"
                                }`}
                              onClick={() => validateUdhyamAadhaarField()}
                              disabled={
                                verifiedProfileFields.udhyamAadhaar ||
                                verifyingProfileField !== null
                              }
                            >
                              {verifyingProfileField === "udhyamAadhaar" ? (
                                "Verifying..."
                              ) : verifiedProfileFields.udhyamAadhaar ? (
                                <>
                                  <i className="bi bi-check-circle-fill me-1" />
                                  Verified
                                </>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          )}
                      </div>

                      <InputText
                        className="form-control"
                        placeholder="Enter your Udhyam Aadhaar"
                        name="udhyamAadhaar"
                        value={userFormData?.udhyamAadhaar ?? ""}
                        onChange={handleChange}
                        disabled={!isEditable}
                        maxLength={25}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                      />

                      {shouldShowFieldError("udhyamAadhaar") &&
                        formErrors.udhyamAadhaar && (
                          <span className="error">
                            {formErrors.udhyamAadhaar}
                          </span>
                        )}

                    </div>
                  </div>
                  <div className="col-12">
                    <div className="profileSectionHeader">Address Details</div>
                  </div>

                  <div className="col-12">
                    <div className="row align-items-stretch">
                      <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="form-group mb-4 h-100">
                          <label className="form-label" htmlFor="address">
                            Address
                            {isEditable && isFieldEditable.address && (
                              <sup>*</sup>
                            )}
                          </label>

                          <InputTextarea
                            className="form-control profileAddressTextarea"
                            placeholder="Enter your address"
                            name="address"
                            rows={8}
                            maxLength={250}
                            value={userFormData?.address ?? ""}
                            onChange={handleChange}
                            disabled={!isEditable || !isFieldEditable.address}
                          />

                          {shouldShowFieldError("address") && (
                            <span className="error">{formErrors.address}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="row">
                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label"
                                htmlFor="zipCode"
                              >
                                PIN Code
                                {isEditable && isFieldEditable.zipCode && (
                                  <sup>*</sup>
                                )}
                              </label>

                              <InputText
                                className="form-control"
                                placeholder="Enter your PIN Code"
                                name="zipCode"
                                value={userFormData?.zipCode ?? ""}
                                onChange={handleChange}
                                maxLength={6}
                                onKeyPress={(e) =>
                                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                }
                                disabled={
                                  !isEditable || !isFieldEditable.zipCode
                                }
                              />

                              {shouldShowFieldError("zipCode") && (
                                <span className="error">
                                  {formErrors.zipCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label"
                                htmlFor="city"
                              >
                                City
                                {isEditable && isFieldEditable.city && (
                                  <sup>*</sup>
                                )}
                              </label>

                              <InputText
                                className="form-control"
                                placeholder="Enter your city"
                                name="city"
                                value={userFormData?.city ?? ""}
                                maxLength={50}
                                disabled
                              />

                              {shouldShowFieldError("city") && (
                                <span className="error">{formErrors.city}</span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label"
                                htmlFor="state"
                              >
                                State
                                {isEditable && isFieldEditable.state && (
                                  <sup>*</sup>
                                )}
                              </label>

                              <InputText
                                className="form-control"
                                placeholder="Enter your state"
                                name="state"
                                maxLength={50}
                                value={userFormData?.state ?? ""}
                                disabled
                              />

                              {shouldShowFieldError("state") && (
                                <span className="error">
                                  {formErrors.state}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label"
                                htmlFor="country"
                              >
                                Country
                              </label>

                              <InputText
                                className="form-control"
                                placeholder="Country"
                                name="country"
                                value={userFormData?.country ?? ""}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(userFormData?.gstList &&
                    userFormData?.gstList?.length > 0) &&
                    <>
                      <div className="col-12">
                        <div className="profileSectionHeader">GST Info</div>
                      </div>

                      {/* GST NO. */}
                      {userFormData?.gstList.length > 1 ? (
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                          <div className="form-group mb-4">
                            <label
                              className="form-label"
                              htmlFor="gstSelect"
                            >
                              GST No.
                            </label>

                            <Dropdown
                              id="gstSelect"
                              variant={isEditable ? "outlined" : "filled"}
                              value={selectedGSTNumber}
                              options={userFormData?.gstList.sort((a, b) =>
                                a.gstNumber.localeCompare(b.gstNumber),
                              )}
                              placeholder="Please Select GST Number"
                              onChange={(e) => setSelectedGSTNumber(e.value)}
                              optionLabel="gstNumber"
                              optionValue="gstNumber"
                              disabled={!isEditable}
                            />
                          </div>
                        </div>
                      ) : (
                        <ProfileTextField
                          label="GST No."
                          name={selectedGSTNumber}
                          value={selectedGSTNumber}
                          placeholder="Please Select GST Number"
                        />
                      )}
                      <div className="col-lg-4 col-md-6 col-sm-12 col-12">      <div className="form-group mb-3">
                        <label className="form-label small" htmlFor="dateOfRegistration">
                          Date of GST Registration
                        </label>

                        <Calendar
                          name="dateOfRegistration"
                          value={getGSTDateValue() ? new Date(`${getGSTDateValue()}T00:00:00`) : null}
                          onChange={(e) =>
                            handleEnforcementDateChange(e.value as Date | null)
                          }
                          placeholder="Select Date"
                          dateFormat="dd/mm/yy"
                          className="w-100"
                          maxDate={new Date()}
                          showButtonBar
                          // disabled={
                          //   !isEditable ||
                          //   !IsStringNullEmptyOrUndefined(
                          //     selectedGSTDetail?.dateOfGstRegistration ?? "",
                          //   )
                          // }
                          disabled
                        />
                      </div>
                      </div>

                      {/* GST Address */}
                      <ProfileTextField
                        label="GST Address"
                        name={`gstAddress-${selectedGSTDetail?.gstAddress ?? "manual"}`}
                        value={getGSTDetailValue("gstAddress")}
                        placeholder="Enter GST Address"
                        // disabled={
                        //   !isEditable ||
                        //   !IsStringNullEmptyOrUndefined(
                        //     selectedGSTDetail?.gstAddress ?? "",
                        //   )
                        // }
                        disabled
                        onChange={(name, value) =>
                          handleGSTDetailFieldChange("gstAddress", value)
                        }
                      />

                      {/* Trade Name */}
                      <ProfileTextField
                        label="Trade Name"
                        name={`tradeName-${selectedGSTDetail?.tradeName ?? "manual"}`}
                        value={getGSTDetailValue("tradeName")}
                        placeholder="Enter Trade Name"
                        // disabled={
                        //   !isEditable ||
                        //   !IsStringNullEmptyOrUndefined(
                        //     selectedGSTDetail?.tradeName ?? "",
                        //   )
                        // }
                        disabled
                        onChange={(name, value) =>
                          handleGSTDetailFieldChange("tradeName", value)
                        }
                      />
                    </>
                  }

                  {/* Company Logo */}
                  <div className="col-12 mb-4 profileWrapper">
                    <div className="form-group">
                      <label className="form-label">Company Logo</label>

                      <div className="companyLogoField">
                        {userFormData?.cpCompanyLogo ? (
                          <div className="profilePhoto profileHeroAvatar companyLogoAvatar">
                            <Image
                              src={userFormData?.cpCompanyLogo}
                              zoomSrc={userFormData?.cpCompanyLogo}
                              alt="Company Logo"
                              width="60"
                              height="60"
                              preview
                              className="profile-photo-img"
                            />

                            {create && (
                              <label
                                htmlFor="cpCompanyLogo"
                                className="edit-icon"
                                aria-label="Edit Company Logo"
                              >
                                <i className="icon-edit" />
                              </label>
                            )}
                          </div>
                        ) : (
                          <div className="profilePhoto profileHeroAvatar companyLogoAvatar">
                            <div className="profileHeroFallback companyLogoFallback">
                              {userFormData?.name?.charAt(0) || "C"}
                            </div>

                            {create && (
                              <label
                                htmlFor="cpCompanyLogo"
                                className="edit-icon"
                                aria-label="Upload Company Logo"
                              >
                                <i className="icon-edit" />
                              </label>
                            )}
                          </div>
                        )}

                        <div className="companyLogoFieldMeta">
                          <span className="companyLogoFieldTitle">
                            {userFormData?.cpCompanyLogo
                              ? "Company logo"
                              : "Upload company logo"}
                          </span>

                          <span className="companyLogoFieldHint">
                            {userFormData?.cpCompanyLogo
                              ? "Click the image to preview the full logo."
                              : "Add a company logo to complete the profile."}
                          </span>

                          {!create && !userFormData?.cpCompanyLogo && (
                            <span className="text-muted small">
                              No logo uploaded
                            </span>
                          )}
                        </div>
                      </div>

                      <InputText
                        type="file"
                        id="cpCompanyLogo"
                        accept={IMAGE_FILE_ACCEPT}
                        onChange={handleFileChange}
                        className="d-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {shouldIncludeBankDetails(userData.userType) && (
            <div className="col-lg-12 mb-2">
              <div className="titleMainWrapper">
                <h2 className="txt-24">Bank Details</h2>
              </div>

              <div className="col-12 mt-3">
                <div className="row">
                  {/* Bank Name */}
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <label className="form-label" htmlFor="bankName">
                        Bank Name
                        {isEditable &&
                          shouldIncludeBankDetails(userData.userType) && (
                            <sup>*</sup>
                          )}
                      </label>

                      <InputText
                        className="form-control"
                        placeholder="Enter your Bank Name"
                        name="bankName"
                        id="bankName"
                        onChange={handleChange}
                        value={userFormData?.bankName}
                        disabled={!isEditable}
                        maxLength={100}
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        onKeyPress={(e) => {
                          if (
                            e.currentTarget.selectionStart === 0 &&
                            e.key === " "
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />

                      {shouldShowFieldError("bankName") && (
                        <span className="error">{formErrors.bankName}</span>
                      )}
                    </div>
                  </div>

                  {/* Bank Account Number */}
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <label
                        className="form-label"
                        htmlFor="bankAccountNumber"
                      >
                        Bank Account No.
                        {isEditable &&
                          shouldIncludeBankDetails(userData.userType) && (
                            <sup>*</sup>
                          )}
                      </label>

                      <InputText
                        className="form-control"
                        id="bankAccountNumber"
                        name="bankAccountNumber"
                        onChange={handleChange}
                        onKeyPress={(e) =>
                          restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                        }
                        maxLength={18}
                        placeholder="Enter your Bank Account No."
                        value={userFormData?.bankAccountNumber}
                        disabled={!isEditable}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                      />

                      {shouldShowFieldError("bankAccountNumber") && (
                        <span className="error">
                          {formErrors.bankAccountNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <label className="form-label" htmlFor="ifscCode">
                        IFSC Code
                        {isEditable &&
                          shouldIncludeBankDetails(userData.userType) && (
                            <sup>*</sup>
                          )}
                      </label>

                      <InputText
                        id="ifscCode"
                        className="form-control"
                        placeholder="Enter IFSC Code"
                        name="ifscCode"
                        value={userFormData?.ifscCode}
                        onChange={handleChange}
                        maxLength={11}
                        disabled={!isEditable}
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                      />

                      {shouldShowFieldError("ifscCode") && (
                        <span className="error">{formErrors.ifscCode}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!IsNullOrEmptyArray(userFormData?.userConsents || []) && (
          <div className="col-lg-12 mb-4">
            <div className="titleMainWrapper">
              <h2 className="txt-24">My Consents</h2>
            </div>

            <div className="col-12 mt-3 d-flex flex-wrap gap-3">
              {!IsNullOrEmptyArray(userFormData?.userConsents || []) &&
                userFormData?.userConsents.map((consent) => {
                  return (
                    <div
                      className="d-flex align-items-center text-center px-3 py-2 form-check"
                      key={consent.userConsentID}
                    >
                      <Checkbox
                        inputId={`consent-${consent.userConsentID}`}
                        className="me-2"
                        checked={consent.isConsented}
                        onChange={(e) =>
                          handleConsentChange(
                            consent.userConsentID,
                            e.checked as boolean,
                          )
                        }
                        disabled={!isEditable}
                      />
                      <label htmlFor={`consent-${consent.userConsentID}`} className="primary-color">
                        {consent.consentName}
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {isEditable && (
          <div className="col-12 mt-2 mb-3">
            <div className="d-flex justify-content-end gap-3 flex-wrap">
              <Button
                className="btn btn-black-line"
                onClick={handleReset}
                label="Cancel"
                disabled={verifyingProfileField !== null}
              />
              <Button
                className="btn btn-orange"
                onClick={handleSave}
                label="Save"
                disabled={verifyingProfileField !== null}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog
        header="Verify Mobile Number"
        visible={mobileOtpPopUp}
        modal
        onHide={closeMobileOtpModal}
        blockScroll
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "500px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-orange-line w-100 text-center"
              label="Cancel"
              onClick={closeMobileOtpModal}
            />
            <Button
              className="btn btn-orange w-100 text-center"
              label="Verify OTP"
              onClick={handleVerifyMobileOtp}
              disabled={
                loading ||
                mobileOtpValue.length !== MOBILE_UPDATE_OTP_LENGTH
              }
            />
          </div>
        }
      >
        <div className="modal-content">
          <Loader isLoading={loading} />

          <div className="modal-body">
            <p className="mb-3">
              Enter the OTP sent to {formatMobileNumber(mobileNumberForVerification)}.
            </p>

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="mobileOtpInput">
                Enter OTP <sup>*</sup>
              </label>

              <InputOtp
                id="mobileOtpInput"
                integerOnly
                value={mobileOtpValue}
                onChange={(event) =>
                  setMobileOtpValue(String(event.value || ""))
                }
                length={MOBILE_UPDATE_OTP_LENGTH}
              />

              {mobileOtpTimeLeft > 0 ? (
                <b
                  className="txt-14"
                  style={{ fontWeight: "600" }}
                >{`Resend OTP in ${formatTime(mobileOtpTimeLeft)}`}</b>
              ) : (
                <Button
                  className="resendBtn"
                  onClick={resendMobileOtp}
                  label="Resend OTP"
                  disabled={loading || mobileOtpTimeLeft > 0}
                />
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {selectedPartnerIndex !== null && selectedPartnerDraft && (
        <Dialog
          header={`${selectedPartnerDraft.name || "Partner"} Details`}
          visible={selectedPartnerIndex !== null}
          modal
          onHide={handleClosePartnerDetails}
          blockScroll
          className="modalWrapper profileDetailsDialog"
          draggable={false}
          resizable={false}
          style={{ width: "900px", maxWidth: "95vw" }}
          contentStyle={{ maxHeight: "75vh", overflowY: "auto" }}
          footer={
            <>
              {isEditable && (
                <span className="small text-muted d-flex mt-2">
                  Note: Partner changes are saved separately from profile edit.
                </span>
              )}
              <div className="modal-footer gap-3">
                <Button
                  className="btn btn-black-line w-100 text-center"
                  label="Cancel"
                  onClick={handleClosePartnerDetails}
                />
                <Button
                  className="btn btn-orange w-100 text-center"
                  label="Save"
                  onClick={handleSavePartnerDetails}
                />
              </div>
            </>
          }
        >
          <div className="row">
            <Loader isLoading={loading} />
            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">PAN</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.pan || ""}
                  disabled
                  placeholder="Partner PAN Number"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">Aadhaar Number</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.aadhaarNumber || ""}
                  disabled
                  placeholder="Partner Aadhaar Number"
                />
              </div>
            </div>

            <DateTextField
              label="Date of Birth"
              name="partnerDetailsDob"
              value={
                selectedPartnerDraft.dateOfBirth
                  ? new Date(selectedPartnerDraft.dateOfBirth).toISOString()
                  : ""
              }
              placeholder="Partner Date of Birth"
            />

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">Mobile Number</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.mobile || ""}
                  maxLength={10}
                  onChange={(e) =>
                    handlePartnerDraftChange("mobile", e.target.value)
                  }
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  placeholder="Partner Mobile Number"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">PIN Code</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.pinCode || ""}
                  maxLength={6}
                  onChange={handlePartnerDraftPinCodeChange}
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  placeholder="Partner's PIN Code"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">State</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.state || ""}
                  disabled
                  placeholder="Partner's State"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">City</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.city || ""}
                  disabled
                  placeholder="Partner's City"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label">Gender</label>
                <div className="d-flex">
                  <div className="form-check form-check-inline">
                    <RadioButton
                      name={`partner-dialog-gender-${selectedPartnerIndex}`}
                      inputId={`partner-dialog-male-${selectedPartnerIndex}`}
                      value="M"
                      checked={selectedPartnerDraft.gender === "M"}
                      onChange={() => handlePartnerDraftChange("gender", "M")}
                    />
                    <label
                      className="form-check-label primary-color"
                      htmlFor={`partner-dialog-male-${selectedPartnerIndex}`}
                    >
                      Male
                    </label>
                  </div>

                  <div className="form-check form-check-inline">
                    <RadioButton
                      name={`partner-dialog-gender-${selectedPartnerIndex}`}
                      inputId={`partner-dialog-female-${selectedPartnerIndex}`}
                      value="F"
                      checked={selectedPartnerDraft.gender === "F"}
                      onChange={() => handlePartnerDraftChange("gender", "F")}
                    />
                    <label
                      className="form-check-label primary-color"
                      htmlFor={`partner-dialog-female-${selectedPartnerIndex}`}
                    >
                      Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="form-group mb-0">
                <label className="form-label">Address</label>
                <InputTextarea
                  className="form-control"
                  value={selectedPartnerDraft.address || ""}
                  rows={3}
                  maxLength={250}
                  onChange={(e) =>
                    handlePartnerDraftChange(
                      "address",
                      e.target.value?.trimStart(),
                    )
                  }
                  placeholder="Partner's Address"
                />
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default Profile;

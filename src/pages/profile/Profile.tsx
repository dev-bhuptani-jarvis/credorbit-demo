import { useEffect, useMemo, useState } from "react";
import {
  convertPartnersToCoApplicantsAPI,
  fetchUserProfile,
  generateAadharOTP,
  getDataByPincodeAPI,
  updateAadharAPI,
  updateUserProfile,
} from "../../utils/axios/apiServices";
import {
  IGSTListInfo,
  IPincodeFetchDetailsResponse,
  IProfileFieldUpdateable,
  IUpdateAadhaarBody,
  IUserInfo,
  IUserProfileResponse,
  IUserValidation,
} from "../../interface/userData";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { useSelector, useDispatch } from "react-redux";
import {
  formatAadhaarNumber,
  formatDate,
  formatTime,
  IsFormValid,
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
import CameraCaptureDialog from "../../components/CameraCaptureDialog";
import usePermission from "../../hooks/usePermission";
import { Dialog } from "primereact/dialog";
import { InputOtp } from "primereact/inputotp";
import {
  IAadharCardResponse,
  OnlyAadharNumber,
} from "../../interface/contract";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import {
  BANK_ACCOUNT_NUMBER_ONLY_PATTERN,
  IFSC_CODE_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import AddPanModal from "../../components/AddPanModal";
import { updateShowPanDetailPopUp } from "../../store/reducer/userSlice";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { OTPType, StorageKeyEnum } from "../../utils/constants/enum";
import DeleteUserModal from "../../components/DeleteUserModal";
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
import { Tooltip } from "primereact/tooltip";
import { setProfileUpdated } from "../../store/reducer/profileSlice";
import { Image } from "primereact/image";
import { IEducationStudentApplicant } from "../../interface/educationManagement";
import { getEducationLoanDrafts } from "../../utils/demo/demoEducationLoanFlow";
import {
  getEducationStudentById,
  getEducationStudents,
} from "../../utils/demo/demoEducationStudents";

const constitutionOptions = [
  { label: "Proprietorship", value: "Proprietorship" },
  { label: "Partnership", value: "Partnership" },
  { label: "Private Limited Company", value: "Private Limited Company" },
  { label: "Public Limited Company", value: "Public Limited Company" },
  { label: "LLP", value: "LLP" },
  { label: "Society", value: "Society" },
  { label: "Trust", value: "Trust" },
];

const DEFAULT_STUDENT_USER_ID = "student-role-001";

const Profile = () => {
  const [userFormData, setUserFormData] = useState<IUserInfo>();

  console.log('userFormData', userFormData)

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
  });

  const [selectedGSTNumber, setSelectedGSTNumber] = useState<string>("");

  const [selectedGSTDetail, setSelectedGSTDetail] = useState<IGSTListInfo>();

  const [targetUser, setTargetUser] = useState<number>(
    CLIENT_ROLE.CO_APPLICANT,
  );

  const [targetUserName, setTargetUserName] = useState<string>("");

  const [editingAadhaar, setEditingAadhaar] = useState<string | null>(null);

  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState<
    number | null
  >(null);

  const [selectedPartnerDraft, setSelectedPartnerDraft] = useState<
    IUserInfo["partners"][number] | null
  >(null);

  const [showAuthorizedPersonCamera, setShowAuthorizedPersonCamera] =
    useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

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

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [aadharCardPopUp, setAadharCardPopUp] = useState<boolean>(false);

  const [otpValues, setOtpValues] = useState<string | undefined>(undefined);

  const [clientID, setClientID] = useState<string>("");

  const [userID, setUserID] = useState<string>("");

  const [userType, setUserType] = useState<number>(0);

  const [deleteID, setDeleteID] = useState<string>("");

  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const [aadhaarCardNumber, setAadhaarCardNumber] = useState<string>("");

  const userData = useSelector((state: RootState) => state.user.user);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { create } = usePermission("Profile", ["create"])();

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const dispatch = useDispatch();
  const impersonatedStudentId = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
  );

  const isEducationInstituteProfile =
    (userFormData?.role || "") === "Educational Institute";

  const isNbfcRestrictedProfile = ["NBFC User", "NBFC"].includes(
    userFormData?.role || "",
  );

  const isStudentPortalProfile =
    userData.userID === DEFAULT_STUDENT_USER_ID ||
    userData.roleName === "Student" ||
    Boolean(impersonatedStudentId);

  const studentContext = useMemo(() => {
    if (!isStudentPortalProfile) return null;

    const directStudentId = impersonatedStudentId || userData.userID;

    if (directStudentId) {
      const matchedStudent = getEducationStudentById(directStudentId);
      if (matchedStudent) {
        return {
          student: matchedStudent,
          studentUserId: impersonatedStudentId
            ? directStudentId
            : userData.userID || DEFAULT_STUDENT_USER_ID,
        };
      }
    }

    const draftCandidates = getEducationLoanDrafts().filter(
      (draft) =>
        draft.studentUserId === (userData.userID || DEFAULT_STUDENT_USER_ID),
    );

    if (draftCandidates.length > 0) {
      const matchedStudent = getEducationStudentById(draftCandidates[0].studentId);

      if (matchedStudent) {
        return {
          student: matchedStudent,
          studentUserId: draftCandidates[0].studentUserId,
        };
      }
    }

    return {
      student: getEducationStudents()[0],
      studentUserId: userData.userID || DEFAULT_STUDENT_USER_ID,
    };
  }, [
    impersonatedStudentId,
    isStudentPortalProfile,
    userData.userID,
  ]);

  const studentApplications = useMemo(() => {
    if (!studentContext?.student) return [];

    const matchedByStudentId = getEducationLoanDrafts().filter(
      (draft) => draft.studentId === studentContext.student.id,
    );

    const matchedDrafts =
      matchedByStudentId.length > 0
        ? matchedByStudentId
        : getEducationLoanDrafts().filter(
            (draft) => draft.studentUserId === studentContext.studentUserId,
          );

    return matchedDrafts.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }, [studentContext]);

  const fetchUserInfo = async (): Promise<void> => {
    setLoading(true);

    const response: IUserProfileResponse = await fetchUserProfile();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setSelectedGSTNumber(response.data.selectedGstNumber!);

      const updatedUser = {
        ...userData,
        profilePicture: response.data.profilePicture!,
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

      setUserFormData(maskUserData(response.data));
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

  const handlePinCodePartner = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    setLoading(true);

    const { value } = e.target;

    // 1️⃣ Immediately update only pincode
    setUserFormData((prev) => {
      if (!prev) return prev;

      const partners = [...prev.partners];

      partners[index] = {
        ...partners[index],
        pinCode: value,
      };

      return { ...prev, partners };
    });

    // 2️⃣ Stop if not 6 digits
    if (value.length !== 6) return;

    // 3️⃣ Call API
    const response: IPincodeFetchDetailsResponse = await getDataByPincodeAPI({
      pincode: Number(value),
    });

    if (!response) return;

    if (response.data && response.statusCode === 200) {
      // 4️⃣ Update city/state/country safely
      setUserFormData((prev) => {
        if (!prev) return prev;

        const partners = [...prev.partners];

        partners[index] = {
          ...partners[index],
          city: response.data.circle,
          state: response.data.state,
        };

        return { ...prev, partners };
      });
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;

    switch (name) {
      case "bankAccountNumber": {
        let errorMessage: string = "";
        const isValid = BANK_ACCOUNT_NUMBER_ONLY_PATTERN.test(value);

        if (userData.userType === CLIENT_ROLE.SOURCING_PARTNER) {
          if (!isValid) {
            errorMessage = validationMessages.bankAccountNumberInvalid;
          }

          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.bankAccountNumberRequired;
          }
        } else if (userData.userType === CLIENT_ROLE.CHANNEL_PARTNER) {
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

        if (userData.userType === CLIENT_ROLE.SOURCING_PARTNER) {
          if (!isValid) {
            errorMessage = validationMessages.ifscCodeInvalid;
          }

          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.ifscCodeRequired;
          }
        } else if (userData.userType === CLIENT_ROLE.CHANNEL_PARTNER) {
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

        if (userData.userType === CLIENT_ROLE.SOURCING_PARTNER) {
          if (IsStringNullEmptyOrUndefined(value)) {
            errorMessage = validationMessages.bankNameRequired;
          }
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
        setUserFormData({
          ...userFormData!,
          [name]: value.toUpperCase(),
        });
        break;
      }

      case "constitution":
      case "website": {
        setUserFormData({
          ...userFormData!,
          [name]: value.trim(),
        });
        break;
      }

      case "mobileNumber": {
        const isValid: boolean =
          INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

        if (userData.userType === CLIENT_ROLE.USER_MANAGEMENT) {
          setFormErrors({ ...formErrors, [name]: "" });

          setUserFormData({
            ...userFormData!,
            [name]: value.trim(),
          });

          return;
        }

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

  const handleUpdateGstDetail = (): void => {
    const updatedDetail = userFormData?.gstList.find(
      (gstDetail) => gstDetail.gstNumber === selectedGSTNumber,
    );

    setSelectedGSTDetail(updatedDetail);
  };

  const handleRadioButtonChange = (event: RadioButtonChangeEvent): void => {
    const { name, value } = event.target;

    setUserFormData((prevState) => {
      if (!prevState) return prevState;

      // Special case: update partner gender inside partners array
      if (name === "gender") {
        return {
          ...prevState,
          partners: prevState.partners?.map((partner, index) =>
            index === 0
              ? { ...partner, gender: value } // update gender
              : partner,
          ),
        };
      }

      // Default: yes/no booleans
      return {
        ...prevState,
        [name]: value === "yes",
      };
    });
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

  const handlePartnerPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile || !selectedPartnerDraft) {
      e.target.value = "";
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      handlePartnerDraftChange("profilePicture", String(fileReader.result || ""));
    };
    fileReader.readAsDataURL(selectedFile);
    e.target.value = "";
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
            "profilePicture",
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

    formData.append("billingDetails", String(userFormData?.billingDetails));

    if (
      userData.userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userData.userType === CLIENT_ROLE.SOURCING_PARTNER
    ) {
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
    }

    formData.append("address", encryptVAPTData(userFormData?.address!));
    formData.append("city", encryptVAPTData(userFormData?.city!));
    formData.append("state", encryptVAPTData(userFormData?.state!));
    formData.append("zipCode", encryptVAPTData(userFormData?.zipCode!));

    formData.append(
      "udhyamAadhaar",
      encryptVAPTData(userFormData?.udhyamAadhaar || ""),
    );

    formData.append(
      "mobileNumber",
      encryptVAPTData(String(userFormData?.mobileNumber)),
    );

    formData.append("constitution", userFormData?.constitution || "");
    formData.append("website", userFormData?.website || "");

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
    setOtpValues(undefined);
    setEditingAadhaar(null);
    setAadhaarCardNumber("");
    setAadharCardPopUp(false);
    handleClosePartnerDetails();
    setIsEditable(false);
    fetchUserInfo();
    setIsFormSubmitted(false);
    setTargetUser(CLIENT_ROLE.CO_APPLICANT);
    setTargetUserName("");
  };

  const handleChangeTargetUser = (value: number): void => {
    setTargetUser(value);
    setPanDetailPopUp(!panDetailPopUp);
  };

  const handleSave = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const isValid: boolean = IsFormValid(formErrors);

    if (!isValid) return;

    setLoading(true);

    // Temporary added for until the aadhar number flow is not working
    // if (isFieldEditable.aadhaar) {
    //   toastError(validationMessages.verifyAadhaarNumberRequired);
    //   return;
    // }

    const formData: FormData = new FormData();

    formData.append("billingDetails", String(userFormData?.billingDetails));

    if (
      userData.userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userData.userType === CLIENT_ROLE.SOURCING_PARTNER
    ) {
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

    if (userFormData?.isCompany && selectedGSTNumber)
      formData.append("gstNumber", encryptVAPTData(selectedGSTNumber));

    formData.append("address", encryptVAPTData(userFormData?.address!));

    formData.append("city", encryptVAPTData(userFormData?.city!));

    formData.append("state", encryptVAPTData(userFormData?.state!));

    formData.append("zipCode", encryptVAPTData(userFormData?.zipCode!));

    formData.append(
      "udhyamAadhaar",
      encryptVAPTData(userFormData?.udhyamAadhaar || ""),
    );

    formData.append(
      "mobileNumber",
      encryptVAPTData(String(userFormData?.mobileNumber)),
    );

    formData.append("constitution", userFormData?.constitution || "");
    formData.append("website", userFormData?.website || "");

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
              "profilePicture",
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

  const handleAgree = async (): Promise<void> => {
    if (!otpValues || otpValues.toString().length !== OTPType.SIX_DIGIT_OTP) {
      toastError(`Please enter a valid ${OTPType.SIX_DIGIT_OTP}-digit OTP`);
      return;
    }
    setLoading(true);

    const body: IUpdateAadhaarBody = {
      clientID,
      otp: otpValues,
      coapplicantOrPartnerID: userID,
      aadhaarNumber: encryptVAPTData(aadhaarCardNumber.replace(/\D/g, "")),
      userType,
    };

    const response: APIResponseEntity = await updateAadharAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      handleReset();
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const validUser = (): boolean => {
    return (
      userData.userType === CLIENT_ROLE.CUSTOMER ||
      userData.userType === CLIENT_ROLE.CHANNEL_PARTNER
    );
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-orange-line w-100 text-center"
        label="Cancel"
        onClick={handleReset}
      />
      <Button
        className="btn btn-orange w-100 text-center"
        onClick={handleAgree}
        label="Add Aadhaar Number"
      />
    </div>
  );

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (value !== null && value !== undefined) {
      setOtpValues(String(value));
    } else {
      setOtpValues("");
    }
  };

  const handleGetAadharCardOTP = async (
    value: { aadhaarNumber: string; id: string },
    index: number,
    userType: number,
  ): Promise<void> => {
    setLoading(true);

    const { aadhaarNumber, id } = value;

    const body: OnlyAadharNumber = {
      userID: id,
      aadharNumber: encryptVAPTData(aadhaarNumber.replace(/\D/g, "")),
    };

    const response: IAadharCardResponse = await generateAadharOTP(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setClientID(response.data.clientId);
      setUserID(id);
      setEditingAadhaar(null);
      setAadharCardPopUp(true);
      setUserType(userType);
      setTargetUser(index);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDelete = (
    roleID: string,
    targetedUser: number,
    targetedName: string,
  ): void => {
    setDeleteID(roleID);
    setDeleteModal(true);
    setTargetUser(targetedUser);
    setTargetUserName(targetedName);
  };

  const handleAddToCoApplicants = async (partnersID: string): Promise<void> => {
    if (!partnersID) return toastError("Partner ID is missing");

    setLoading(true);

    const body = {
      partnersID,
      userType: CLIENT_ROLE.CO_APPLICANT,
    };

    const response = await convertPartnersToCoApplicantsAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      dispatch(setProfileUpdated(!isProfileUpdated));
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleEditButton = (): void => {
    setIsFieldEditable(() => ({
      aadhaar:
        !userFormData?.isCompany &&
        IsStringNullEmptyOrUndefined(userFormData?.aadhaar ?? ""),
      address:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER
          ? IsStringNullEmptyOrUndefined(userFormData?.address ?? "")
          : true,
      city:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER
          ? IsStringNullEmptyOrUndefined(userFormData?.city ?? "")
          : true,
      state:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER
          ? IsStringNullEmptyOrUndefined(userFormData?.state ?? "")
          : true,
      zipCode:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER
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
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER &&
          IsStringNullEmptyOrUndefined(userFormData?.bankAccountNumber ?? "")
          ? validationMessages.bankAccountNumberRequired
          : "",

      ifscCode:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER &&
          IsStringNullEmptyOrUndefined(userFormData?.ifscCode ?? "")
          ? validationMessages.ifscCodeRequired
          : "",

      bankName:
        userData.userType === CLIENT_ROLE.SOURCING_PARTNER &&
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

  const handleRegistrationLinkCopy = () => {
    if (!userFormData?.customerID) {
      toastError(
        "Unable to generate registration link. Channel Partner Code is missing.",
      );
      return;
    }

    const registrationLink = `${window.location.origin}/register?channelPartnerCode=${userFormData.customerID}`;

    navigator.clipboard
      .writeText(registrationLink)
      .then(() => {
        toastSuccess(
          "Registration link copied successfully. You can now share it with the customer.",
        );
      })
      .catch(() => {
        toastError("Failed to copy the registration link. Please try again.");
      });
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
    // isProfileUpdated is for the updation of Partners and Co-Applicants fields
    fetchUserInfo();
  }, [isProfileUpdated]);

  useEffect(() => {
    handleUpdateGstDetail();
  }, [selectedGSTNumber]);

  useEffect(() => {
    if (otpValues && otpValues.toString().length === OTPType.SIX_DIGIT_OTP) {
      handleAgree();
    }
  }, [otpValues]);

  const renderStudentProfileField = (
    label: string,
    value?: string | null,
  ): JSX.Element => (
    <div className="col-lg-4 col-md-6 col-sm-12 col-12" key={label}>
      <div className="form-group mb-4">
        <label className="form-label small">{label}</label>
        <InputText className="form-control" value={value || "-"} disabled />
      </div>
    </div>
  );

  const renderEducationApplicantFields = (
    applicant: IEducationStudentApplicant | undefined,
    relationLabel?: string,
  ): JSX.Element[] => {
    if (!applicant) {
      return [renderStudentProfileField("Status", "No details available")];
    }

    return [
      renderStudentProfileField("Name", applicant.name || "-"),
      renderStudentProfileField("PAN", applicant.pan || "-"),
      renderStudentProfileField(
        "Date of Birth",
        applicant.dateOfBirth
          ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
          : "-",
      ),
      renderStudentProfileField(
        "Mobile Number",
        applicant.mobileNumber
          ? formatMobileNumber(applicant.mobileNumber)
          : "-",
      ),
      renderStudentProfileField("Email Address", applicant.email || "-"),
      renderStudentProfileField("Gender", applicant.gender || "-"),
      renderStudentProfileField("Address", applicant.address || "-"),
      renderStudentProfileField(
        "Photo",
        applicant.photo ? "Uploaded" : "Not uploaded",
      ),
      ...(relationLabel
        ? [renderStudentProfileField("Relation", relationLabel)]
        : []),
    ];
  };

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
                      <i className="bi bi-pencil-square" />
                    </label>
                  )}
                </div>

                <div className="profileHeroMeta">
                  <h3 className="profileHeroName">{userFormData?.name}</h3>

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
                    />
                    <Button
                      className="btn btn-orange"
                      onClick={handleSave}
                      label="Save"
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
                      <i className="bi bi-pencil-square" />
                    </button>
                  )
                )}
              </div>
            </div>

            <InputText
              type="file"
              id="profileImage"
              accept="image/*"
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

                  {userData.userType !== CLIENT_ROLE.SUPER_ADMIN && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <div className="d-flex flex-row align-items-center justify-content-between">
                          <label
                            className="form-label mb-0"
                            htmlFor="customerID"
                          >
                            {isStudentPortalProfile ? "Student Code" : "Code"}
                          </label>

                          {userData.userType ===
                            CLIENT_ROLE.CHANNEL_PARTNER &&
                            !isEducationInstituteProfile &&
                            !isNbfcRestrictedProfile && (
                              <>
                                <span
                                  id="registrationLink"
                                  className="text-orange cursor-pointer fw-medium small"
                                  onClick={handleRegistrationLinkCopy}
                                >
                                  Registration Link
                                </span>

                                <Tooltip
                                  target="#registrationLink"
                                  content="Click here to copy the registration link which you can share with your borrower"
                                  position="top"
                                />
                              </>
                            )}
                        </div>

                        <InputText
                          className="form-control"
                          placeholder={
                            isStudentPortalProfile
                              ? "Student Code"
                              : "Channel Partner Code"
                          }
                          name="customerID"
                          value={
                            isStudentPortalProfile
                              ? studentContext?.student?.studentCode || ""
                              : userFormData?.customerID || ""
                          }
                          disabled
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        />
                      </div>
                    </div>
                  )}

                  {userData.userType === CLIENT_ROLE.SOURCING_PARTNER && (
                    <ProfileTextField
                      label="Commission (in %)"
                      name="commission"
                      value={String(userFormData?.commission?.toFixed(2))}
                      placeholder="Commission"
                    />
                  )}

                  {!userFormData?.isCompany && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <div className="d-flex justify-content-between">
                          <label className="form-label small" htmlFor="aadhaar">
                            Aadhaar Number
                            {isEditable && isFieldEditable.aadhaar && (
                              <sup>*</sup>
                            )}
                          </label>

                          {/* Temporary added for until the aadhar number flow is not working */}
                          {/* {isEditable && isFieldEditable.aadhaar && (
                          <span
                            className="txt-14 txt-orange"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (userFormData?.aadhaar !== "") {
                                handleGetAadharCardOTP(
                                  {
                                    aadhaarNumber: userFormData?.aadhaar ?? "",
                                    id: userData.userID,
                                  },
                                  0,
                                  userData.userType
                                );
                              } else {
                                toastError(validationMessages.aadhaarRequired);
                              }
                            }}
                          >
                            Verify Aadhaar Number
                          </span>
                        )} */}
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

                        {isFormSubmitted && isEditable && (
                          <span className="error">{formErrors.aadhaar}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {userFormData?.dateOfBirth &&
                    <DateTextField
                      label={
                        userFormData?.isCompany
                          ? "Date of Incorporation"
                          : "Date of Birth"
                      }
                      name="dateOfBirth"
                      value={userFormData?.dateOfBirth}
                      placeholder={
                        userFormData?.isCompany
                          ? "Date of Incorporation"
                          : "Date of Birth"
                      }
                    />
                  }

                  <ProfileTextField
                    label="Email ID"
                    name="emailID"
                    value={userFormData?.emailID!}
                    placeholder="Email ID"
                  />

                  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                    <div className="form-group mb-4">
                      <label
                        className="form-label small"
                        htmlFor="mobileNumber"
                      >
                        Mobile Number
                        {isEditable && isFieldEditable.mobileNumber && (
                          <sup>*</sup>
                        )}
                      </label>

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
                        disabled={
                          !isEditable ||
                          userData.userType === CLIENT_ROLE.USER_MANAGEMENT ||
                          userData.userType === CLIENT_ROLE.CHANNEL_PARTNER
                        }
                      />

                      {isFormSubmitted && isEditable && (
                        <span className="error">{formErrors.mobileNumber}</span>
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
                          <label className="form-label small" htmlFor="address">
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

                          {isFormSubmitted && isEditable && (
                            <span className="error">{formErrors.address}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                        <div className="row">
                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label small"
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

                              {isFormSubmitted && isEditable && (
                                <span className="error">
                                  {formErrors.zipCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label small"
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

                              {isFormSubmitted && isEditable && (
                                <span className="error">{formErrors.city}</span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label small"
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

                              {isFormSubmitted && isEditable && (
                                <span className="error">
                                  {formErrors.state}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label small"
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

                  {isStudentPortalProfile && studentContext?.student && (
                    <>
                      <div className="col-12">
                        <div className="profileSectionHeader">
                          Student Academic Details
                        </div>
                      </div>

                      {renderStudentProfileField(
                        "Course",
                        studentContext.student.courseName || "-",
                      )}
                      {renderStudentProfileField(
                        "Institute Name",
                        studentApplications[0]?.instituteName || "-",
                      )}
                      {renderStudentProfileField(
                        "Gender",
                        studentContext.student.studentGender || "-",
                      )}
                      {renderStudentProfileField(
                        "Parent PAN",
                        studentContext.student.parentPan || "-",
                      )}
                      {renderStudentProfileField(
                        "Registered On",
                        studentContext.student.createdAt
                          ? formatDate(
                            studentContext.student.createdAt,
                            "DD MMM, YYYY",
                          )
                          : "-",
                      )}
                      {renderStudentProfileField(
                        "Photo",
                        studentContext.student.studentPhoto
                          ? "Uploaded"
                          : "Not uploaded",
                      )}

                      <div className="col-12">
                        <div className="profileSectionHeader">Loan Summary</div>
                      </div>

                      {renderStudentProfileField(
                        "Latest Application",
                        studentApplications[0]?.courseName || "-",
                      )}
                      {renderStudentProfileField(
                        "Application Status",
                        studentApplications[0]?.loanApplicationStatus || "-",
                      )}
                      {renderStudentProfileField(
                        "Loan Amount",
                        studentApplications[0]
                          ? formatCurrencyAmount(studentApplications[0].loanAmount)
                          : "-",
                      )}
                      {renderStudentProfileField(
                        "Outstanding Amount",
                        formatCurrencyAmount(
                          studentContext.student.loanDetails.outstandingAmount || 0,
                        ),
                      )}
                      {renderStudentProfileField(
                        "Credit Score",
                        String(
                          studentContext.student.creditInformation.creditScore ||
                            "-",
                        ),
                      )}
                      {renderStudentProfileField(
                        "Course Fee",
                        studentApplications[0]
                          ? formatCurrencyAmount(studentApplications[0].courseFees)
                          : "-",
                      )}

                      <div className="col-12">
                        <div className="profileSectionHeader">
                          Applicant Details
                        </div>
                      </div>

                      {renderEducationApplicantFields(
                        studentContext.student.applicants?.[0],
                      )}

                      <div className="col-12">
                        <div className="profileSectionHeader">
                          Co-applicant Details
                        </div>
                      </div>

                      {studentContext.student.applicants?.slice(1).length ? (
                        studentContext.student.applicants
                          .slice(1)
                          .flatMap((applicant, index) => [
                            <div
                              className="col-12"
                              key={`student-co-applicant-heading-${applicant.id || index}`}
                            >
                              <h6 className="mb-3">
                                {studentContext.student.coApplicantRelation ||
                                  `Co-applicant ${index + 1}`}
                              </h6>
                            </div>,
                            ...renderEducationApplicantFields(
                              applicant,
                              studentContext.student.coApplicantRelation ||
                                `Co-applicant ${index + 1}`,
                            ),
                          ])
                      ) : (
                        renderStudentProfileField(
                          "Status",
                          "No co-applicant details available",
                        )
                      )}
                    </>
                  )}

                  {(userFormData?.isCompany ||
                    (userFormData?.gstList &&
                      userFormData?.gstList?.length > 0)) && (
                      <>
                        <div className="col-12">
                          <div className="profileSectionHeader">GST Info</div>
                        </div>

                        {/* GST NO. */}
                        {userFormData?.gstList.length > 1 ? (
                          <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="form-group mb-4">
                              <label
                                className="form-label small"
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

                        {/* Date of GST Registration */}
                        <DateTextField
                          label="Date of GST Registration"
                          name={`dateOfGstRegistration-${selectedGSTDetail?.dateOfGstRegistration}`}
                          value={
                            selectedGSTDetail?.dateOfGstRegistration
                              ? new Date(
                                selectedGSTDetail?.dateOfGstRegistration,
                              ).toISOString()
                              : ""
                          }
                          placeholder="Select GST number to view registration date"
                        />

                        {/* GST Address */}
                        <ProfileTextField
                          label="GST Address"
                          name={`gstAddress-${selectedGSTDetail?.gstAddress}`}
                          value={selectedGSTDetail?.gstAddress!}
                          placeholder="Select GST number to view address"
                        />

                        {!isNbfcRestrictedProfile &&
                          <>
                            {/* Trade Name */}
                            <ProfileTextField
                              label="Trade Name"
                              name={`tradeName-${selectedGSTDetail?.tradeName}`}
                              value={selectedGSTDetail?.tradeName!}
                              placeholder="Select GST number to view trade name"
                            />

                            {/* CIN/LLP */}
                            <ProfileTextField
                              label="CIN/LLP"
                              name={`cinOrLlp-${selectedGSTDetail?.cinOrLlp}`}
                              value={selectedGSTDetail?.cinOrLlp!}
                              placeholder="Select GST number to view CIN/LLP"
                              tooltip={true}
                            />
                          </>
                        }

                      </>
                    )}

                  {!isNbfcRestrictedProfile && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <label
                          className="form-label small"
                          htmlFor="udhyamAadhaar"
                        >
                          Udhyam Aadhaar
                        </label>

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
                      </div>
                    </div>
                  )}

                  {isEducationInstituteProfile && (
                    <>
                      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                        <div className="form-group mb-4">
                          <label className="form-label small" htmlFor="constitution">
                            Constitution
                          </label>

                          <Dropdown
                            id="constitution"
                            className="w-100"
                            value={userFormData?.constitution || ""}
                            options={constitutionOptions}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select constitution"
                            onChange={(e) =>
                              setUserFormData((prev) =>
                                prev
                                  ? {
                                    ...prev,
                                    constitution: e.value,
                                  }
                                  : prev,
                              )
                            }
                            disabled={!isEditable}
                          />
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                        <div className="form-group mb-4">
                          <label className="form-label small" htmlFor="website">
                            Website
                          </label>

                          <InputText
                            id="website"
                            className="form-control"
                            placeholder="Enter institute website"
                            name="website"
                            value={userFormData?.website ?? ""}
                            onChange={handleChange}
                            disabled={!isEditable}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Company Logo */}
                  {userData.userType === CLIENT_ROLE.CHANNEL_PARTNER &&
                    !isEducationInstituteProfile && (
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12 mb-4">
                      <label className="form-label">Company Logo</label>

                      <div className="companyLogoField">
                        {userFormData?.cpCompanyLogo ? (
                          <div className="profilePhoto profileHeroAvatar companyLogoAvatar">
                            <Image
                              src={userFormData.cpCompanyLogo}
                              zoomSrc={userFormData.cpCompanyLogo}
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
                                <i className="bi bi-pencil-square" />
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
                                <i className="bi bi-pencil-square" />
                              </label>
                            )}
                          </div>
                        )}

                        <div className="companyLogoFieldMeta">
                          <span className="companyLogoFieldTitle">
                            {userFormData?.cpCompanyLogo
                              ? "Company logo uploaded"
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
                        accept="image/*"
                        onChange={handleFileChange}
                        className="d-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {(userData.userType === CLIENT_ROLE.CHANNEL_PARTNER ||
            userData.userType === CLIENT_ROLE.SOURCING_PARTNER) &&
            !isNbfcRestrictedProfile &&
            !isEducationInstituteProfile && (
              <div className="col-lg-12 mb-2">
                <div className="titleMainWrapper">
                  <h2 className="txt-24">Bank Details</h2>
                </div>

                <div className="col-12 mt-3">
                  <div className="row">
                    {/* Bank Name */}
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <label className="form-label small" htmlFor="bankName">
                          Bank Name
                          {isEditable &&
                            userData.userType ===
                            CLIENT_ROLE.SOURCING_PARTNER && <sup>*</sup>}
                        </label>

                        <InputText
                          className="form-control"
                          placeholder="Enter your Bank Name"
                          name="bankName"
                          id="bankName"
                          onChange={handleChange}
                          value={userFormData?.bankName}
                          disabled={!isEditable}
                          maxLength={50}
                          // onPaste={(e) => e.preventDefault()}
                          // onCopy={(e) => e.preventDefault()}
                          // onCut={(e) => e.preventDefault()}
                          onKeyPress={(e) => {
                            const regex = /^[a-zA-Z\s]*$/;
                            if (!regex.test(e.key)) {
                              e.preventDefault();
                            }

                            if (
                              e.currentTarget.selectionStart === 0 &&
                              e.key === " "
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />

                        {isFormSubmitted && isEditable && (
                          <span className="error">{formErrors.bankName}</span>
                        )}
                      </div>
                    </div>

                    {/* Bank Account Number */}
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <label
                          className="form-label small"
                          htmlFor="bankAccountNumber"
                        >
                          Bank Account No.
                          {isEditable &&
                            userData.userType ===
                            CLIENT_ROLE.SOURCING_PARTNER && <sup>*</sup>}
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

                        {isFormSubmitted && isEditable && (
                          <span className="error">
                            {formErrors.bankAccountNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* IFSC Code */}
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                      <div className="form-group mb-4">
                        <label className="form-label small" htmlFor="ifscCode">
                          IFSC Code
                          {isEditable &&
                            userData.userType ===
                            CLIENT_ROLE.SOURCING_PARTNER && <sup>*</sup>}
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
                          onKeyPress={(e) => {
                            const regex = /^[a-zA-Z0-9]*$/;
                            if (!regex.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />

                        {isFormSubmitted && isEditable && (
                          <span className="error">{formErrors.ifscCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {!isNbfcRestrictedProfile &&
          !IsNullOrEmptyArray(userFormData?.userConsents || []) && (
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
                        <label htmlFor={`consent-${consent.userConsentID}`}>
                          {consent.consentName}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        {(userData.userType === CLIENT_ROLE.CUSTOMER ||
          userData.userType === CLIENT_ROLE.CHANNEL_PARTNER) &&
          !isNbfcRestrictedProfile &&
          !isStudentPortalProfile && (
            <div className="col-lg-12 mb-4">
              <div className="titleMainWrapper">
                <h2 className="txt-24">
                  {isEducationInstituteProfile
                    ? "Authorized Persons"
                    : "Partners / Directors"}
                </h2>

                {create && isEditable && (
                  <div className="btnGroup">
                    <Button
                      className="btn btn-orange fw-bold"
                      onClick={() => handleChangeTargetUser(CLIENT_ROLE.PARTNER)}
                      label={
                        isEducationInstituteProfile
                          ? "Add Authorized Person"
                          : "Add Partners"
                      }
                      iconPos="left"
                      icon="bi bi-plus-circle me-2"
                    />
                  </div>
                )}
              </div>

              <div className="col-12 mt-3 profilePersonGrid">
                {!IsNullOrEmptyArray(userFormData?.partners || []) &&
                  userFormData?.partners.map((partner, index) => {
                    const isEditing = editingAadhaar === partner.id;

                    return (
                      <div key={partner.id} className="profilePersonCard">
                        <div className="profilePersonCardTop">
                          <div className="profilePersonInfo">
                            {partner.profilePicture && (
                              <img
                                src={partner.profilePicture}
                                alt={partner.name}
                                className="profilePersonThumb"
                              />
                            )}
                            <h3>{partner.name}</h3>
                            <p>
                              {partner.pan}
                              {partner.email ? ` • ${partner.email}` : ""}
                            </p>
                          </div>

                          <div className="profilePersonActions">
                            <button
                              type="button"
                              className="profileIconButton"
                              onClick={() => handleOpenPartnerDetails(index)}
                              aria-label="View Partner Details"
                            >
                              <i className="bi bi-eye" />
                            </button>

                            {isEditable && (
                              <>
                                {partner.aadhaarNumber === null && !isEditing && (
                                  <button
                                    type="button"
                                    className="profileIconButton"
                                    onClick={() => setEditingAadhaar(partner.id)}
                                    aria-label="Update Aadhaar"
                                  >
                                    <i className="bi bi-pencil-square" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="profileIconButton profileIconButtonDanger"
                                  onClick={() =>
                                    handleDelete(
                                      partner.id,
                                      CLIENT_ROLE.CHANNEL_PARTNER,
                                      isEducationInstituteProfile
                                        ? "Authorized Person"
                                        : "Partner/Director",
                                    )
                                  }
                                  aria-label="Delete Partner"
                                >
                                  <i className="bi bi-trash3" />
                                </button>

                                {userData.userType === CLIENT_ROLE.CUSTOMER && (
                                  <button
                                    type="button"
                                    className="profileIconButton"
                                    onClick={() =>
                                      handleAddToCoApplicants(partner.id)
                                    }
                                    aria-label="Add to Co-Applicants"
                                  >
                                    <i className="bi bi-person-plus" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="profilePersonEditor">
                            <InputText
                              className="form-control"
                              placeholder="Enter Partner Aadhaar Number"
                              name={`partnerAadhar-${index}`}
                              value={partner.aadhaarNumber || ""}
                              maxLength={12}
                              onChange={(e) => {
                                const updatedPartners = [
                                  ...userFormData.partners,
                                ];
                                updatedPartners[index].aadhaarNumber =
                                  e.target.value;
                                setUserFormData({
                                  ...userFormData,
                                  partners: updatedPartners,
                                });
                                setAadhaarCardNumber(e.target.value);
                              }}
                              onKeyPress={(e) =>
                                restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                              }
                            />

                            <div className="profilePersonEditorActions">
                              <Button
                                label="Cancel"
                                className="btn btn-orange-line"
                                onClick={handleReset}
                              />
                              <Button
                                label="Add"
                                icon="bi bi-plus-circle me-2"
                                className="btn btn-orange fw-bold"
                                onClick={() => {
                                  handleGetAadharCardOTP(
                                    userFormData.partners[index],
                                    index,
                                    CLIENT_ROLE.PARTNER,
                                  );
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {IsNullOrEmptyArray(userFormData?.partners || []) && (
                  <p className="small">
                    {isEducationInstituteProfile
                      ? "No Authorized Person Found"
                      : "No Partners Found"}
                  </p>
                )}
              </div>
            </div>
          )}

        {userData.userType === CLIENT_ROLE.CUSTOMER &&
          !isStudentPortalProfile && (
          <div className="col-lg-12 mb-4">
            <div className="titleMainWrapper">
              <h2>Co-Applicants</h2>

              {create && isEditable && (
                <div className="btnGroup">
                  <Button
                    className="btn btn-orange fw-bold"
                    onClick={() =>
                      handleChangeTargetUser(CLIENT_ROLE.CO_APPLICANT)
                    }
                    label="Add Co-Applicants"
                    iconPos="left"
                    icon="bi bi-plus-circle me-2"
                  />
                </div>
              )}
            </div>
            <div className="col-12 mt-3 profilePersonGrid">
              {!IsNullOrEmptyArray(userFormData?.coApplicants || []) &&
                userFormData?.coApplicants.map((coApplicant, index) => {
                  const isEditing = editingAadhaar === coApplicant.id;
                  return (
                    <div key={coApplicant.id} className="profilePersonCard">
                      <div className="profilePersonCardTop">
                        <div className="profilePersonInfo">
                          <h3>
                            {coApplicant.name || `Co-Applicant ${index + 1}`}
                          </h3>
                          <p>{coApplicant.pan || "PAN not available"}</p>
                        </div>

                        {isEditable && (
                          <div className="profilePersonActions">
                            {coApplicant.aadhaarNumber === null &&
                              !isEditing && (
                                <button
                                  type="button"
                                  className="profileIconButton"
                                  onClick={() =>
                                    setEditingAadhaar(coApplicant.id)
                                  }
                                  aria-label="Update Aadhaar"
                                >
                                  <i className="bi bi-pencil-square" />
                                </button>
                              )}

                            {validUser() && (
                              <button
                                type="button"
                                className="profileIconButton profileIconButtonDanger"
                                onClick={() =>
                                  handleDelete(
                                    coApplicant.id,
                                    CLIENT_ROLE.CHANNEL_PARTNER,
                                    "Co-Applicant",
                                  )
                                }
                                aria-label="Delete Co-Applicant"
                              >
                                <i className="bi bi-trash3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="profilePersonEditor">
                          <InputText
                            id={`coApplicantAadhar-${index}`}
                            className="form-control"
                            placeholder="Enter Co-Applicant Aadhaar Number"
                            name={`coApplicantAadhar-${index}`}
                            value={coApplicant.aadhaarNumber || ""}
                            maxLength={12}
                            onChange={(e) => {
                              const updatedCoApplicants = [
                                ...userFormData.coApplicants,
                              ];
                              updatedCoApplicants[index].aadhaarNumber =
                                e.target.value;
                              setUserFormData({
                                ...userFormData,
                                coApplicants: updatedCoApplicants,
                              });
                              setAadhaarCardNumber(e.target.value);
                            }}
                            onKeyPress={(e) =>
                              restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                            }
                          />

                          <div className="profilePersonEditorActions">
                            <Button
                              label="Cancel"
                              className="btn btn-orange-line fw-bold"
                              onClick={handleReset}
                            />
                            <Button
                              label="Add"
                              icon="bi bi-plus-circle me-2 fw-bold"
                              className="btn btn-orange"
                              onClick={() => {
                                handleGetAadharCardOTP(
                                  userFormData.coApplicants[index],
                                  index,
                                  CLIENT_ROLE.CO_APPLICANT,
                                );
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {IsNullOrEmptyArray(userFormData?.coApplicants || []) && (
                <p className="small">No Co-Applicant Found</p>
              )}
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
              />
              <Button
                className="btn btn-orange"
                onClick={handleSave}
                label="Save"
              />
            </div>
          </div>
        )}
      </div>

      <AddPanModal
        panDetailPopUp={panDetailPopUp}
        setPanDetailPopUp={setPanDetailPopUp}
        showPartnerOption={false}
        targetUser={targetUser}
      />

      <Dialog
        header="Enter Aadhaar OTP"
        visible={aadharCardPopUp}
        modal
        onHide={() => {
          setAadhaarCardNumber("");
          setAadharCardPopUp(false);
        }}
        blockScroll
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={footerContent}
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

      {selectedPartnerIndex !== null && selectedPartnerDraft && (
        <Dialog
          header={`${selectedPartnerDraft.name || (isEducationInstituteProfile ? "Authorized Person" : "Partner")} Details`}
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
                  {isEducationInstituteProfile
                    ? "Note: Authorized person changes are saved separately from profile edit."
                    : "Note: Partner changes are saved separately from profile edit."}
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
            <div className="col-12 mb-3">
              <div className="educationAuthorizedPhotoPanel">
                <div className="educationAuthorizedPhotoPreview">
                  {selectedPartnerDraft.profilePicture ? (
                    <img
                      src={selectedPartnerDraft.profilePicture}
                      alt={selectedPartnerDraft.name || "Authorized Person"}
                    />
                  ) : (
                    <div className="educationAuthorizedPhotoFallback">
                      {(selectedPartnerDraft.name || "A").charAt(0)}
                    </div>
                  )}
                </div>

                <div className="educationAuthorizedPhotoActions">
                  <label
                    htmlFor="authorizedPersonPhotoUpload"
                    className="btn btn-orange-line mb-0"
                  >
                    Upload Photo
                  </label>
                  <button
                    type="button"
                    className="btn btn-orange mb-0"
                    onClick={() => setShowAuthorizedPersonCamera(true)}
                  >
                    Capture Photo
                  </button>
                </div>

                <input
                  type="file"
                  id="authorizedPersonPhotoUpload"
                  accept="image/*"
                  onChange={handlePartnerPhotoChange}
                  className="d-none"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label small">Name</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.name || ""}
                  onChange={(e) => handlePartnerDraftChange("name", e.target.value.trimStart())}
                  placeholder={
                    isEducationInstituteProfile ? "Authorized person name" : "Partner name"
                  }
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label small">PAN</label>
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
                <label className="form-label small">Aadhaar Number</label>
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
                <label className="form-label small">Mobile Number</label>
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
                <label className="form-label small">Email</label>
                <InputText
                  className="form-control"
                  value={selectedPartnerDraft.email || ""}
                  onChange={(e) => handlePartnerDraftChange("email", e.target.value.trim())}
                  placeholder="Authorized person email"
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="form-group mb-3">
                <label className="form-label small">PIN Code</label>
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
                <label className="form-label small">State</label>
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
                <label className="form-label small">City</label>
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
                <label className="form-label small">Gender</label>
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
                      className="form-check-label"
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
                      className="form-check-label"
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
                <label className="form-label small">Address</label>
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

      <CameraCaptureDialog
        visible={showAuthorizedPersonCamera}
        title="Capture Authorized Person Photo"
        onHide={() => setShowAuthorizedPersonCamera(false)}
        onCapture={(dataUrl) => {
          handlePartnerDraftChange("profilePicture", dataUrl);
          setShowAuthorizedPersonCamera(false);
        }}
      />

      {deleteModal && (
        <DeleteUserModal
          deleteModal={deleteModal}
          setDeleteModal={setDeleteModal}
          deleteId={deleteID}
          fetchListingAPI={fetchUserInfo}
          targetUser={targetUser}
          targetUserName={targetUserName}
        />
      )}
    </>
  );
};

export default Profile;

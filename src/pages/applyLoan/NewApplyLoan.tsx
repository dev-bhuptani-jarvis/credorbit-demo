import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RadioButton } from "primereact/radiobutton";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  extraToken,
  IsFormValid,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { NUMBER, NUMBER_ONLY_PATTERN } from "../../utils/constants/pattern";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import {
  IAddLoanApplication,
  IApplyLoanApplicationResponse,
} from "../../interface/applyLoan";
import {
  addLoanApplicationAPI,
  fetchImpersonateUser,
  fetchUserProfile,
  getClientDashboardAPI,
  getDataByPincodeAPI,
  getLoanDetailAPI,
  getLoanTypeListAPI,
  updateLoanApplicationAmountAPI,
} from "../../utils/axios/apiServices";
import {
  BorrowerType,
  ILoanIndustryOptions,
  ILoanParams,
  ILoanProfessionOptions,
  ILoanResponse,
  ILoanTypeData,
  ILoanTypeListResponse,
  ILoanUnitOptions,
} from "../../interface/loanDetail";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CLIENT_ROLE } from "../../utils/constants/constant";
import { Steps } from "primereact/steps";
import Congratulation from "./Congratulation";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import {
  LoanApplicationStatusType,
  MasterEnum,
  PropertyType,
  StorageKeyEnum,
} from "../../utils/constants/enum";
import Loader from "../../components/Loader";
import { IGeneratePublicTokenRequest } from "../../interface/publicToken";
import {
  decryptVAPTData,
  encryptData,
} from "../../utils/functions/encryptDecrypt";
import { IVerifyEmailOTPResponse } from "../../interface/otpRequest";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { setUserData } from "../../store/reducer/userSlice";
import { setEncryptedSessionStorage } from "../../utils/functions/sessionStorage";
import { IClientDashboardResponse } from "../../interface/clientDashboard";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { useDispatch } from "react-redux";
import {
  IPincodeFetchDetailsResponse,
  IUserProfileResponse,
} from "../../interface/userData";
import { validationMessages } from "../../utils/constants/messages";
import {
  ILoanPropertyPayload,
  LoanErrors,
  LoanValues,
} from "../../interface/new-apply-loan";

const EMPTY_OPTION = { id: 0, displayName: "" };

const NewApplyLoan = () => {
  const getInitialFormValues = (isSecuredLoanApp = true): LoanValues => ({
    isSecuredLoanApp,
    loanCategory: 0,
    loanAmount: "",
    hasOtherIncome: null,
    directorPartnerRemuneration: "",
    interestIncome: "",
    anyOtherIncome: "",
    averageGrossMonthlySalary: "",
    unit: EMPTY_OPTION,
    profession: EMPTY_OPTION,
    industry: EMPTY_OPTION,
    borrowerType: EMPTY_OPTION,
    businessVintage: EMPTY_OPTION,
    typeOfOrganizationWhereEmployeeWorking: EMPTY_OPTION,
    durationOfWorkingAtOrganization: EMPTY_OPTION,
    yearsOfITRFiled: EMPTY_OPTION,
    salarySlipAvailableMonths: EMPTY_OPTION,
    bankName: "",
    properties: [],
  });

  const getInitialFormErrors = (isSecuredLoanApp = true): LoanErrors => ({
    loanCategory: validationMessages.selectLoanType,
    loanAmount: validationMessages.selectLoanAmount,
    hasOtherIncome: "",
    directorPartnerRemuneration: "",
    interestIncome: "",
    anyOtherIncome: "",
    unit: validationMessages.selectUnit,
    profession: "",
    industry: validationMessages.selectIndustry,
    borrowerType: validationMessages.selectBorrowerType,
    businessVintage: validationMessages.businessVintage,
    typeOfOrganizationWhereEmployeeWorking:
      validationMessages.typeOfOrganizationWhereEmployeeWorking,
    durationOfWorkingAtOrganization:
      validationMessages.durationOfWorkingAtOrganization,
    yearsOfITRFiled: validationMessages.yearsOfITRFiled,
    salarySlipAvailableMonths: "",
    averageGrossMonthlySalary: validationMessages.averageGrossMonthlySalary,
    bankName: "",
  });

  const getUpdateFormErrors = (): LoanErrors => ({
    loanCategory: "",
    loanAmount: "",
    hasOtherIncome: "",
    directorPartnerRemuneration: "",
    interestIncome: "",
    anyOtherIncome: "",
    unit: "",
    profession: "",
    industry: "",
    borrowerType: "",
    businessVintage: "",
    typeOfOrganizationWhereEmployeeWorking: "",
    durationOfWorkingAtOrganization: "",
    yearsOfITRFiled: "",
    salarySlipAvailableMonths: "",
    averageGrossMonthlySalary: "",
    bankName: "",
  });

  const [formValues, setFormValues] = useState<LoanValues>(
    getInitialFormValues(),
  );

  const [formErrors, setFormErrors] = useState<LoanErrors>(
    getInitialFormErrors(),
  );

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [congratulationMessage, setCongratulationMessage] =
    useState<string>("");

  const [showCongratulationModal, setShowCongratulationModal] =
    useState<boolean>(false);

  const [loanTypeList, setLoanTypeList] = useState<ILoanTypeData[]>([]);

  const [unitList, setUnitList] = useState<ILoanUnitOptions[]>([]);

  const [professionList, setProfessionList] = useState<ILoanIndustryOptions[]>(
    [],
  );

  const [industryList, setIndustryList] = useState<ILoanProfessionOptions[]>(
    [],
  );

  const MASTER_BORROWER_TYPE_LIST: BorrowerType[] = [
    { id: MasterEnum.SALARIED, displayName: "Salaried" },
    {
      id: MasterEnum.SELF_EMPLOYED_PROFESSIONAL,
      displayName: "Self Employed Professional",
    },
    {
      id: MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL,
      displayName: "Self Employed Non Professional",
    },
  ];

  const [borrowerTypeList, setBorrowerTypeList] = useState<BorrowerType[]>([
    {
      id: MasterEnum.SALARIED,
      displayName: "Salaried",
    },
    {
      id: MasterEnum.SELF_EMPLOYED_PROFESSIONAL,
      displayName: "Self Employed Professional",
    },
    {
      id: MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL,
      displayName: "Self Employed Non Professional",
    },
  ]);

  const businessVintageList = [
    { displayName: "1 Year", id: MasterEnum.BUSINESS_1_YEAR },
    { displayName: "2 Years", id: MasterEnum.BUSINESS_2_YEARS },
    { displayName: "3 Years", id: MasterEnum.BUSINESS_3_YEARS },
    { displayName: "3+ Years", id: MasterEnum.BUSINESS_3_PLUS_YEARS },
  ];

  const organizationTypeList = [
    { displayName: "Proprietor", id: MasterEnum.PROPRIETOR },
    { displayName: "Firm", id: MasterEnum.FIRM },
    { displayName: "LLP", id: MasterEnum.LLP },
    { displayName: "Company", id: MasterEnum.COMPANY },
  ];

  const workingDurationList = [
    { displayName: "1 Year", id: MasterEnum.WORK_1_YEAR },
    { displayName: "2 Years", id: MasterEnum.WORK_2_YEARS },
    { displayName: "3 Years", id: MasterEnum.WORK_3_YEARS },
    { displayName: "3+ Years", id: MasterEnum.WORK_3_PLUS_YEARS },
  ];

  const itrFiledYearsList = [
    { displayName: "Not Filed", id: MasterEnum.NOT_FILED },
    { displayName: "1 Year", id: MasterEnum.ITR_1_YEAR },
    { displayName: "2 Years", id: MasterEnum.ITR_2_YEARS },
    { displayName: "3 Years", id: MasterEnum.ITR_3_YEARS },
    { displayName: "3+ Years", id: MasterEnum.ITR_3_PLUS_YEARS },
  ];

  const PROPERTY_TYPE_OPTIONS = [
    { id: PropertyType.RESIDENTIAL, label: "Residential" },
    { id: PropertyType.COMMERCIAL, label: "Commercial" },
    { id: PropertyType.INDUSTRIAL, label: "Industrial" },
    { id: PropertyType.PLOT, label: "Plot" },
  ];

  const PROPERTY_OWNERSHIP_OPTIONS = [
    { id: MasterEnum.PROPERTY_OWNED, label: "Owned" },
    { id: MasterEnum.PROPERTY_RENTED, label: "Rented" },
  ];

  const [updatedLoanTypeList, setUpdatedLoanTypeList] = useState<
    ILoanTypeData[]
  >([]);

  const userData = useSelector((state: RootState) => state.user.user);

  const navigate = useNavigate();

  const { state } = useLocation();

  const { id } = useParams();

  const isEditMode = id ? !IsStringNullEmptyOrUndefined(id) : false;

  const hasFetchedLoanDetailsRef = useRef<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  const dispatch = useDispatch();

  const { userType, userID } = useSelector(
    (state: RootState) => state.user.user,
  );

  const items = [{ label: "Select Client" }, { label: "Select Loan" }];

  const selectedLoanType = loanTypeList.find(
    (loan) => loan.loanTypeId === formValues.loanCategory,
  );

  const isHomeLoanSelected = selectedLoanType?.loanTypeName === "HomeLoan";

  const isLapLoanSelected =
    selectedLoanType?.loanTypeName?.startsWith("LoanProperty");

  const isUnsecuredBusinessLoanSelected =
    selectedLoanType?.loanTypeName === "UnsecuredBusinessLoan";

  const isCcOdSecuredLoanSelected =
    selectedLoanType?.loanTypeName === "CC/ODSecured";

  const isWorkingCapitalLoanSelected =
    isCcOdSecuredLoanSelected ||
    selectedLoanType?.loanTypeName === "CC/ODCGTMSE";

  const isPersonalLoanSelected =
    selectedLoanType?.loanTypeName === "PersonalLoan";

  const shouldShowPropertyFields =
    isHomeLoanSelected ||
    isLapLoanSelected ||
    isWorkingCapitalLoanSelected ||
    isPersonalLoanSelected;

  const shouldShowOtherIncomeFields = isHomeLoanSelected || isLapLoanSelected;

  const isFieldEditable = (fieldName: string): boolean =>
    !isEditMode || ["loanAmount", "loanCategory"].includes(fieldName);

  const getPropertyByType = (propertyType: number) =>
    formValues.properties.find(
      (property) => property.propertyType === propertyType,
    );

  const residentialProperty = getPropertyByType(PropertyType.RESIDENTIAL);

  const commercialProperty = getPropertyByType(PropertyType.COMMERCIAL);

  const industrialProperty = getPropertyByType(PropertyType.INDUSTRIAL);

  const plotProperty = getPropertyByType(PropertyType.PLOT);

  const availablePropertyOptions = PROPERTY_TYPE_OPTIONS.filter((option) => {
    if (option.id === PropertyType.RESIDENTIAL) {
      return (
        isHomeLoanSelected ||
        isLapLoanSelected ||
        isWorkingCapitalLoanSelected ||
        isPersonalLoanSelected
      );
    }

    if (option.id === PropertyType.COMMERCIAL) {
      return (
        isLapLoanSelected ||
        isWorkingCapitalLoanSelected ||
        isPersonalLoanSelected
      );
    }

    if (option.id === PropertyType.INDUSTRIAL) {
      return (
        isLapLoanSelected ||
        isWorkingCapitalLoanSelected ||
        isPersonalLoanSelected
      );
    }

    if (option.id === PropertyType.PLOT) {
      return (
        isLapLoanSelected ||
        isWorkingCapitalLoanSelected ||
        isPersonalLoanSelected
      );
    }

    return false;
  });

  const addProperty = (propertyType: number) => {
    setFormValues((prev) => {
      if (
        prev.properties.some(
          (property) => property.propertyType === propertyType,
        )
      ) {
        return prev;
      }

      return {
        ...prev,
        properties: [
          ...prev.properties,
          {
            propertyType,
            size: "",
            pincode: "",
            address: "",
            location: "",
            ownership: "",
            saleDeedValue: "",
            approxMarketValue: "",
          },
        ],
      };
    });
  };

  const removeProperty = (propertyType: number) => {
    setFormValues((prev) => ({
      ...prev,
      properties: prev.properties.filter(
        (property) => property.propertyType !== propertyType,
      ),
    }));
  };

  const updatePropertyField = (
    propertyType: number,
    field: keyof Omit<ILoanPropertyPayload, "propertyType">,
    value: string,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      properties: prev.properties.map((property) =>
        property.propertyType === propertyType
          ? { ...property, [field]: value }
          : property,
      ),
    }));
  };

  const handlePropertyAmountChange = (
    propertyType: number,
    field: "size" | "saleDeedValue" | "approxMarketValue",
    value: string,
  ) => {
    const rawValue = value.replace(NUMBER, "");
    const formattedValue = rawValue
      ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
      : "";

    updatePropertyField(propertyType, field, formattedValue);
  };

  const handlePropertyPinCodeChange = async (
    propertyType: number,
    value: string,
  ): Promise<void> => {
    if (!isFieldEditable("properties")) return;

    const pinCodeValue = value.replace(NUMBER, "").slice(0, 6);
    updatePropertyField(propertyType, "pincode", pinCodeValue);

    if (pinCodeValue.length !== 6) {
      updatePropertyField(propertyType, "location", "");
      return;
    }

    setLoading(true);

    const response: IPincodeFetchDetailsResponse = await getDataByPincodeAPI({
      pincode: pinCodeValue ? Number(pinCodeValue) : 0,
    });

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.data && response.statusCode === 200) {
      updatePropertyField(propertyType, "location", response.data.circle ?? "");
    } else {
      updatePropertyField(propertyType, "location", "");

      toastError(response.message);
    }

    setLoading(false);
  };

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    if (!isFieldEditable(fieldName)) return;

    if (
      fieldName === "loanAmount" ||
      fieldName === "averageGrossMonthlySalary" ||
      fieldName === "directorPartnerRemuneration" ||
      fieldName === "interestIncome" ||
      fieldName === "anyOtherIncome"
    ) {
      // Remove all non-numeric characters except digits
      const rawValue = value.toString().replace(NUMBER, "");

      // Format the number using the Indian numbering system
      const formattedValue = rawValue
        ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
        : "";

      setFormValues((prev) => ({
        ...prev,
        [fieldName]: formattedValue, // Store formatted value in state
      }));

      let errorMessage = "";

      if (
        rawValue.length === 0 ||
        isNaN(Number(rawValue)) ||
        Number(rawValue) <= 0
      ) {
        if (fieldName === "loanAmount") {
          errorMessage = validationMessages.selectLoanAmount;
        } else if (fieldName === "averageGrossMonthlySalary") {
          errorMessage = validationMessages.averageGrossMonthlySalary;
        }
      }

      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));

      return;
    }

    // Handle isSecuredLoanApp separately (checkbox)
    if (fieldName === "isSecuredLoanApp") {
      setFormValues((prev) => ({
        ...prev,
        isSecuredLoanApp: value as boolean,
      }));
      return;
    }

    if (fieldName === "hasOtherIncome") {
      const hasOtherIncome = value as boolean;

      setFormValues((prev) => ({
        ...prev,
        hasOtherIncome,
        directorPartnerRemuneration: hasOtherIncome
          ? prev.directorPartnerRemuneration
          : "",
        interestIncome: hasOtherIncome ? prev.interestIncome : "",
        anyOtherIncome: hasOtherIncome ? prev.anyOtherIncome : "",
      }));

      setFormErrors((prev) => ({
        ...prev,
        hasOtherIncome: "",
        directorPartnerRemuneration: "",
        interestIncome: "",
        anyOtherIncome: "",
      }));

      return;
    }

    // Handle dropdowns and text fields dynamically
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));

    setFormErrors((prev) => {
      if (fieldName === "profession" && formValues.unit.id !== 3) {
        return {
          ...prev,
          profession: "", // No error if unit is NOT 3
        };
      }

      return {
        ...prev,
        [fieldName]:
          fieldName === "loanCategory"
            ? value
              ? ""
              : validationMessages.selectLoanType
            : fieldName === "borrowerType"
              ? IsStringNullEmptyOrUndefined(
                (value as { displayName?: string })?.displayName ?? "",
              )
                ? validationMessages.selectBorrowerType
                : ""
              : fieldName === "unit"
                ? IsStringNullEmptyOrUndefined(
                  (value as { displayName?: string })?.displayName ?? "",
                )
                  ? validationMessages.selectUnit
                  : ""
                : fieldName === "profession"
                  ? IsStringNullEmptyOrUndefined(
                    (value as { displayName?: string })?.displayName ?? "",
                  )
                    ? validationMessages.selectProfession
                    : ""
                  : fieldName === "industry"
                    ? IsStringNullEmptyOrUndefined(
                      (value as { displayName?: string })?.displayName ?? "",
                    )
                      ? validationMessages.selectIndustry
                      : ""
                    : fieldName === "businessVintage"
                      ? IsStringNullEmptyOrUndefined(
                        (value as { displayName?: string })?.displayName ??
                        "",
                      )
                        ? validationMessages.businessVintage
                        : ""
                      : fieldName === "yearsOfITRFiled"
                        ? IsStringNullEmptyOrUndefined(
                          (value as { displayName?: string })?.displayName ??
                          "",
                        )
                          ? validationMessages.yearsOfITRFiled
                          : ""
                        : fieldName === "typeOfOrganizationWhereEmployeeWorking"
                          ? IsStringNullEmptyOrUndefined(
                            (value as { displayName?: string })
                              ?.displayName ?? "",
                          )
                            ? validationMessages.typeOfOrganizationWhereEmployeeWorking
                            : ""
                          : fieldName === "durationOfWorkingAtOrganization"
                            ? IsStringNullEmptyOrUndefined(
                              (value as { displayName?: string })
                                ?.displayName ?? "",
                            )
                              ? validationMessages.durationOfWorkingAtOrganization
                              : ""
                            : fieldName === "salarySlipAvailableMonths"
                              ? IsStringNullEmptyOrUndefined(
                                (value as { displayName?: string })
                                  ?.displayName ?? "",
                              )
                                ? validationMessages.salarySlipAvailableMonths
                                : ""
                              : fieldName === "bankName"
                                ? formValues.borrowerType.id ===
                                  MasterEnum.SALARIED &&
                                  IsStringNullEmptyOrUndefined(
                                    (value as string) ?? "",
                                  )
                                  ? validationMessages.bankNameRequired
                                  : ""
                                : "",
      };
    });
  };

  const handleCompleteApplication = async (
    loanTypeID: number,
    loanAppID: string,
  ): Promise<void> => {
    if (userType === CLIENT_ROLE.CHANNEL_PARTNER) {
      setLoading(true);

      const body: IGeneratePublicTokenRequest = {
        userID: state?.id!,
        extraToken: encryptData(extraToken()),
      };

      const response: IVerifyEmailOTPResponse =
        await fetchImpersonateUser(body);

      if (!response) return;

      if (response && response.statusCode === 200) {
        const decryptedData = {
          ...response.data,
          emailID: response.data.emailID
            ? (response.data.emailID)
            : "",
          mobileNumber: response.data.mobileNumber
            ? (response.data.mobileNumber)
            : "",
          panNumber: response.data.panNumber
            ? (response.data.panNumber)
            : "",
          gstNumber: response.data.gstNumber
            ? (response.data.gstNumber)
            : null,
        };

        dispatch(setImpersonateUser(true));

        dispatch(setUserData(decryptedData));

        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
          decryptedData.token,
        );

        handleClientDashboard(loanTypeID, loanAppID);

        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }

      setLoading(false);
    } else {
      navigate(RoutePathConstant.private.checkEligibility, {
        state: { loanType: loanTypeID, loanApp: loanAppID },
      });
    }
  };

  const handleClientDashboard = async (
    loanTypeID: number,
    loanAppID: string,
  ): Promise<void> => {
    setLoading(true);

    const response: IClientDashboardResponse = await getClientDashboardAPI();

    const responseProfile: IUserProfileResponse = await fetchUserProfile();

    if (!response && !responseProfile) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : null,
      };

      dispatch(setCustomerInfo(decryptedData));

      const missingFields = [];

      if (IsStringNullEmptyOrUndefined(responseProfile.data.address!)) {
        missingFields.push("Address");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.state!)) {
        missingFields.push("State");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.city!)) {
        missingFields.push("City");
      }
      if (IsStringNullEmptyOrUndefined(responseProfile.data.zipCode!)) {
        missingFields.push("Zip Code");
      }

      if (missingFields.length > 0) {
        navigate(RoutePathConstant.private.profile);
        toastSuccess(
          `The following fields are missing: ${missingFields.join(
            ", ",
          )}. Please add them.`,
        );
      } else {
        navigate(RoutePathConstant.private.checkEligibility, {
          state: { loanType: loanTypeID, loanApp: loanAppID, parent: true },
        });
      }
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleRedirection = (): void => {
    if (
      userType === CLIENT_ROLE.CHANNEL_PARTNER ||
      userType === CLIENT_ROLE.USER_MANAGEMENT
    ) {
      navigate(RoutePathConstant.private.channelPartnerDashboard);
    } else {
      navigate(RoutePathConstant.private.clientDashboard);
    }
  };

  const handleCreateLoanApplication = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    let updatedFormErrors = { ...formErrors };

    if (isEditMode) {
      updatedFormErrors = {
        ...getInitialFormErrors(formValues.isSecuredLoanApp),
        loanAmount:
          IsStringNullEmptyOrUndefined(formValues.loanAmount) ||
            Number(formValues.loanAmount.replace(/,/g, "")) <= 0
            ? validationMessages.selectLoanAmount
            : "",
      };

      setFormErrors(updatedFormErrors);

      const isValid = IsFormValid(updatedFormErrors);

      if (!isValid) return;

      setIsFormSubmitted(false);
      setLoading(true);

      const body = {
        loanAppID: id,
        clientID: state?.id || userID,
        loanTypeID: formValues.loanCategory,
        loanAmount: formValues.loanAmount.replace(/,/g, ""),
        isSecuredLoanApp: formValues.isSecuredLoanApp,
      };

      const response: IApplyLoanApplicationResponse =
        await addLoanApplicationAPI(body as unknown as IAddLoanApplication);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        handleRedirection();
      } else {
        toastError(response.message);
      }

      setLoading(false);
      return;
    }

    if (
      formValues.borrowerType.id === MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL
    ) {
      updatedFormErrors.unit = IsStringNullEmptyOrUndefined(
        formValues.unit.displayName as string,
      )
        ? validationMessages.selectUnit
        : "";
    } else {
      updatedFormErrors.unit = "";
    }

    if (formValues.borrowerType.id === MasterEnum.SELF_EMPLOYED_PROFESSIONAL) {
      updatedFormErrors.profession = IsStringNullEmptyOrUndefined(
        formValues.profession.displayName as string,
      )
        ? validationMessages.selectProfession
        : "";
    } else {
      updatedFormErrors.profession = "";
    }

    if (
      !IsStringNullEmptyOrUndefined(formValues.borrowerType.displayName) &&
      formValues.borrowerType.id !== MasterEnum.SALARIED
    ) {
      updatedFormErrors.businessVintage = IsStringNullEmptyOrUndefined(
        formValues.businessVintage.displayName,
      )
        ? validationMessages.businessVintage
        : "";
    } else {
      updatedFormErrors.businessVintage = "";
    }

    // ===============================
    // Borrower Type validation
    // ===============================
    updatedFormErrors.borrowerType = IsStringNullEmptyOrUndefined(
      formValues.borrowerType.displayName,
    )
      ? validationMessages.selectBorrowerType
      : "";

    updatedFormErrors.yearsOfITRFiled = IsStringNullEmptyOrUndefined(
      formValues.yearsOfITRFiled.displayName,
    )
      ? validationMessages.yearsOfITRFiled
      : "";

    // ===============================
    // NON-SALARIED (SEP / SENP)
    // ===============================
    if (formValues.borrowerType.id !== MasterEnum.SALARIED) {
      // ✅ Business Vintage required
      updatedFormErrors.businessVintage = IsStringNullEmptyOrUndefined(
        formValues.businessVintage.displayName,
      )
        ? validationMessages.businessVintage
        : "";

      // 🚫 Clear ALL salaried errors
      updatedFormErrors.industry = IsStringNullEmptyOrUndefined(
        formValues.industry.displayName,
      )
        ? validationMessages.selectIndustry
        : "";
      updatedFormErrors.typeOfOrganizationWhereEmployeeWorking = "";
      updatedFormErrors.durationOfWorkingAtOrganization = "";
      updatedFormErrors.salarySlipAvailableMonths = "";
      updatedFormErrors.averageGrossMonthlySalary = "";
      updatedFormErrors.bankName = "";
    } else {
      // ===============================
      // SALARIED FLOW
      // ===============================
      updatedFormErrors.businessVintage = "";

      updatedFormErrors.typeOfOrganizationWhereEmployeeWorking =
        IsStringNullEmptyOrUndefined(
          formValues.typeOfOrganizationWhereEmployeeWorking.displayName,
        )
          ? validationMessages.typeOfOrganizationWhereEmployeeWorking
          : "";

      updatedFormErrors.durationOfWorkingAtOrganization =
        IsStringNullEmptyOrUndefined(
          formValues.durationOfWorkingAtOrganization.displayName,
        )
          ? validationMessages.durationOfWorkingAtOrganization
          : "";

      updatedFormErrors.yearsOfITRFiled = IsStringNullEmptyOrUndefined(
        formValues.yearsOfITRFiled.displayName,
      )
        ? validationMessages.yearsOfITRFiled
        : "";

      updatedFormErrors.averageGrossMonthlySalary =
        !formValues.isSecuredLoanApp &&
          IsStringNullEmptyOrUndefined(formValues.averageGrossMonthlySalary)
          ? validationMessages.averageGrossMonthlySalary
          : "";

      // 🔹 ITR NOT FILED
      updatedFormErrors.unit = "";
      updatedFormErrors.profession = "";
      updatedFormErrors.industry = "";
      updatedFormErrors.salarySlipAvailableMonths = "";
      updatedFormErrors.bankName = IsStringNullEmptyOrUndefined(
        formValues.bankName ?? "",
      )
        ? validationMessages.bankNameRequired
        : "";
    }

    if (shouldShowPropertyFields) {
    } else {
    }

    setFormErrors(updatedFormErrors);

    const isValid: boolean = IsFormValid(updatedFormErrors);

    if (isValid) {
      setIsFormSubmitted(false);
      setLoading(true);

      const properties: ILoanPropertyPayload[] = formValues.properties.map(
        (property) => ({
          propertyType: property.propertyType,
          size: property.size?.replace(/,/g, ""),
          pincode: property.pincode?.trim(),
          address: property.address?.trim(),
          location: property.location?.trim(),
          ownership: property.ownership?.trim(),
          saleDeedValue: property.saleDeedValue?.replace(/,/g, ""),
          approxMarketValue: property.approxMarketValue?.replace(/,/g, ""),
        }),
      );

      const rawBody = {
        clientID: state?.id || userID,
        isSecuredLoanApp: formValues.isSecuredLoanApp,
        loanTypeID: formValues.loanCategory,
        loanAmount: formValues.loanAmount.replace(/,/g, ""),
        hasOtherIncome:
          shouldShowOtherIncomeFields && formValues.hasOtherIncome !== null
            ? formValues.hasOtherIncome
            : undefined,
        directorPartnerRemuneration:
          shouldShowOtherIncomeFields && formValues.hasOtherIncome
            ? formValues.directorPartnerRemuneration.replace(/,/g, "")
            : undefined,
        interestIncome:
          shouldShowOtherIncomeFields && formValues.hasOtherIncome
            ? formValues.interestIncome.replace(/,/g, "")
            : undefined,
        anyOtherIncome:
          shouldShowOtherIncomeFields && formValues.hasOtherIncome
            ? formValues.anyOtherIncome.replace(/,/g, "")
            : undefined,
        averageGrossMonthlySalary: formValues.averageGrossMonthlySalary.replace(
          /,/g,
          "",
        ),
        unit: formValues.unit.id,
        profession: formValues.profession.id,
        industry: formValues.industry.id,
        typeOfBorrower: formValues.borrowerType.id,
        businessVintage: formValues.businessVintage.id,
        typeOfOrganizationWhereEmployeeWorking:
          formValues.typeOfOrganizationWhereEmployeeWorking.id,
        durationOfWorkingAtOrganization:
          formValues.durationOfWorkingAtOrganization.id,
        yearsOfITRFiled: formValues.yearsOfITRFiled.id,
        salarySlipAvailableMonths: formValues.salarySlipAvailableMonths.id,
        bankName: formValues.bankName?.trim(),
        properties,
      };

      const amountFields = new Set([
        "loanAmount",
        "averageGrossMonthlySalary",
        "directorPartnerRemuneration",
        "interestIncome",
        "anyOtherIncome",
      ]);

      const body = Object.entries(rawBody).reduce(
        (acc, [key, value]) => {
          if (value === undefined || value === null) return acc;

          if (typeof value === "string") {
            const normalizedValue = value.trim();

            if (normalizedValue === "") return acc;

            acc[key] = amountFields.has(key)
              ? normalizedValue
              : normalizedValue;

            return acc;
          }

          if (typeof value === "number") {
            if (key !== "loanCategory" && value === 0) return acc;

            acc[key] = value;
            return acc;
          }

          acc[key] = value;
          return acc;
        },
        {} as Record<
          string,
          string | number | boolean | ILoanPropertyPayload[]
        >,
      );

      const response: IApplyLoanApplicationResponse =
        await addLoanApplicationAPI(body as unknown as IAddLoanApplication);

      if (!response) return;

      if (response?.statusCode === 200) {
        setCongratulationMessage(response?.message);
        setShowCongratulationModal(true);
        setTimeout(() => {
          setShowCongratulationModal(false);
          handleCompleteApplication(
            response.data.loanTypeID,
            response.data.loanAppID,
          );
        }, 3000);
        setLoading(false);
      } else {
        toastError(response?.message);
        setLoading(false);
        return;
      }
    }
  };

  const handleUpdateLoanApplication = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const updatedLoanAmount = formValues.loanAmount.replace(/,/g, "");

    const updatedFormErrors = {
      ...getUpdateFormErrors(),
      loanAmount:
        IsStringNullEmptyOrUndefined(updatedLoanAmount) ||
          Number(updatedLoanAmount) <= 0
          ? validationMessages.selectLoanAmount
          : "",
    };

    setFormErrors(updatedFormErrors);

    const isValid = IsFormValid(updatedFormErrors);

    if (!isValid) return;

    if (!id) {
      toastError("Loan Application ID is missing");
      return;
    }

    setLoading(true);
    setIsFormSubmitted(false);

    const body = {
      loanAppID: id,
      loanAmount: updatedLoanAmount,
      loanTypeID: formValues.loanCategory,
    };

    const response = await updateLoanApplicationAmountAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      toastSuccess(response?.message);
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const getLoanTypeList = async (): Promise<void> => {
    setLoading(true);
    const response: ILoanTypeListResponse = await getLoanTypeListAPI();

    if (response && response?.statusCode === 200) {
      setLoanTypeList(response?.data?.loanTypes);
      setUnitList(response?.data?.unitOptions);
      setIndustryList(response?.data?.industryOptions);
      setProfessionList(response?.data?.professionOptions);
      setLoading(false);
    }
  };

  const fetchLoanApplicationDetails = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const params: ILoanParams = { loanAppID: id };

    const response: ILoanResponse = await getLoanDetailAPI(params);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode !== 200) {
      toastError(response.message);
      setLoading(false);
      return;
    }

    const rawValue = response?.data?.loanAmount
      ?.toString()
      ?.replace(NUMBER, "");

    const formattedValue = rawValue
      ? new Intl.NumberFormat("en-IN")?.format(Number(rawValue))
      : "";

    const nextFormValues = {
      ...formValues,
      loanAmount: formattedValue,
    };

    setFormValues(nextFormValues);
    setFormErrors(getUpdateFormErrors());

    hasFetchedLoanDetailsRef.current = true;
    setLoading(false);
  };

  const filterOptions = () => {
    const filterCriteria: number[] = formValues.isSecuredLoanApp
      ? [
        LoanApplicationStatusType.UNSECURED_LOAN,
        LoanApplicationStatusType.BOTH,
      ]
      : [
        LoanApplicationStatusType.SECURED_LOAN,
        LoanApplicationStatusType.BOTH,
      ];

    const filteredList: ILoanTypeData[] = loanTypeList.filter((opt) =>
      filterCriteria.includes(opt.isSecuredLoan),
    );

    setUpdatedLoanTypeList(filteredList);
  };

  useEffect(() => {
    getLoanTypeList();
  }, []);

  useEffect(() => {
    if (state) {
      setActiveIndex(1);
    }
  }, [state]);

  useEffect(() => {
    if (
      isLapLoanSelected ||
      isUnsecuredBusinessLoanSelected ||
      isCcOdSecuredLoanSelected
    ) {
      const filteredList = MASTER_BORROWER_TYPE_LIST.filter(
        (item) => item.id !== MasterEnum.SALARIED,
      );

      setBorrowerTypeList(filteredList);

      if (formValues.borrowerType.id === MasterEnum.SALARIED) {
        setFormValues((prev) => ({
          ...prev,
          borrowerType: EMPTY_OPTION,
        }));

        setFormErrors((prev) => ({
          ...prev,
          borrowerType: validationMessages.selectBorrowerType,
        }));
      }

      return;
    }

    setBorrowerTypeList(MASTER_BORROWER_TYPE_LIST);
  }, [
    isLapLoanSelected,
    isUnsecuredBusinessLoanSelected,
    isCcOdSecuredLoanSelected,
    formValues.borrowerType.id,
  ]);

  useEffect(() => {
    filterOptions();
  }, [formValues.isSecuredLoanApp, loanTypeList]);

  useEffect(() => {
    if (!isEditMode || hasFetchedLoanDetailsRef.current) return;

    fetchLoanApplicationDetails();
  }, [id, isEditMode, loanTypeList, unitList, professionList, industryList]);

  useEffect(() => {
    if (!shouldShowPropertyFields) {
      if (formValues.properties.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          properties: [],
        }));
      }

      return;
    }

    const allowedPropertyTypeIds = new Set(
      availablePropertyOptions.map((option) => option.id),
    );

    if (
      formValues.properties.some(
        (property) => !allowedPropertyTypeIds.has(property.propertyType),
      )
    ) {
      setFormValues((prev) => ({
        ...prev,
        properties: prev.properties.filter((property) =>
          allowedPropertyTypeIds.has(property.propertyType),
        ),
      }));
    }
  }, [
    shouldShowPropertyFields,
    formValues.properties,
    availablePropertyOptions,
  ]);

  useEffect(() => {
    if (shouldShowOtherIncomeFields) return;

    if (
      formValues.hasOtherIncome !== null ||
      formValues.directorPartnerRemuneration ||
      formValues.interestIncome ||
      formValues.anyOtherIncome
    ) {
      setFormValues((prev) => ({
        ...prev,
        hasOtherIncome: null,
        directorPartnerRemuneration: "",
        interestIncome: "",
        anyOtherIncome: "",
      }));
    }
  }, [
    shouldShowOtherIncomeFields,
    formValues.hasOtherIncome,
    formValues.directorPartnerRemuneration,
    formValues.interestIncome,
    formValues.anyOtherIncome,
  ]);

  return (
    <div className="whiteBoxHldr p-30">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12 mb-5">
          <div className="titleMainWrapper">
            <h2 className="txt-24">
              {isEditMode ? "Edit Loan Application" : "Create Loan Application"}
              {(state?.fullName || userData?.userName) &&
                ` for ${state?.fullName || userData?.userName}`}
            </h2>
          </div>

          <form
            ref={formRef}
            className="col-12"
            autoComplete="off"
            onSubmit={
              isEditMode
                ? handleUpdateLoanApplication
                : handleCreateLoanApplication
            }
          >
            <div className="col-12 mt-2">
              {!isEditMode && (
                <div className="titleMainWrapper justify-content-center d-flex flex-column">
                  {state && (
                    <div className="req-det-steps mb-4 mt-3">
                      <Steps
                        model={items}
                        activeIndex={activeIndex}
                        onSelect={(e) => setActiveIndex(e.index)}
                      />
                    </div>
                  )}

                  <h2 className="txt-24 mt-4">Select Loan</h2>

                  <p className="mt-2 mb-4">
                    Please choose the type of loan you wish to apply for.
                  </p>
                </div>
              )}

              <div className="form-group mb-4 mt-4 d-flex gap-3">
                <div className="form-check">
                  <RadioButton
                    inputId="securedLoan"
                    name="loanType"
                    value={true}
                    onChange={() => {
                      if (isEditMode) return;
                      setFormValues(getInitialFormValues(true));
                      setFormErrors(getInitialFormErrors(true));
                    }}
                    checked={formValues.isSecuredLoanApp === true}
                  />

                  <label className="form-check-label" htmlFor="securedLoan">
                    <b>Secured Loan</b>
                  </label>
                </div>

                <div className="form-check">
                  <RadioButton
                    inputId="unsecuredLoan"
                    name="loanType"
                    value={false}
                    onChange={() => {
                      if (isEditMode) return;
                      setFormValues(getInitialFormValues(false));
                      setFormErrors(getInitialFormErrors(false));
                    }}
                    checked={formValues.isSecuredLoanApp === false}
                  />

                  <label className="form-check-label" htmlFor="unsecuredLoan">
                    <b>Unsecured Loan</b>
                  </label>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-lg-4 col-12" data-edit-field="loanCategory">
                  <div className="form-group w-100">
                    <label
                      className="form-label small font-15"
                      htmlFor="loanCategory"
                    >
                      Loan Type <sup>*</sup>
                    </label>

                    <Dropdown
                      value={formValues.loanCategory}
                      onChange={(e) =>
                        handleInputChange("loanCategory", e.value)
                      }
                      options={updatedLoanTypeList
                        .sort((a, b) =>
                          a.displayName.localeCompare(b.displayName),
                        )
                        .map((loan) => ({
                          label: loan.displayName,
                          value: loan.loanTypeId,
                        }))}
                      placeholder="Select Loan Type"
                      disabled={!isFieldEditable("loanCategory")}
                    />

                    {isFormSubmitted && (
                      <span className="error">{formErrors.loanCategory}</span>
                    )}
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="form-group w-100">
                    <label
                      className="form-label small font-15"
                      htmlFor="borrowerType"
                    >
                      Borrower Type <sup>*</sup>
                    </label>

                    <Dropdown
                      value={formValues.borrowerType}
                      placeholder="Select Borrower Type"
                      onChange={(e) =>
                        handleInputChange("borrowerType", e.value)
                      }
                      options={borrowerTypeList.sort((a, b) =>
                        a.displayName.localeCompare(b.displayName),
                      )}
                      optionLabel="displayName"
                      disabled={isEditMode}
                    />

                    {isFormSubmitted && (
                      <span className="error">{formErrors.borrowerType}</span>
                    )}
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="form-group w-100">
                    <label
                      className="form-label small font-15"
                      htmlFor="loanAmount"
                    >
                      Loan Amount <sup>*</sup>
                    </label>

                    <div className="form-group search">
                      <i className="bi bi-currency-rupee" />
                      <InputText
                        id="loanAmount"
                        value={formValues.loanAmount}
                        className="form-control"
                        placeholder="Enter the loan amount"
                        onChange={(e) =>
                          handleInputChange("loanAmount", e.target.value)
                        }
                        onKeyPress={(e) =>
                          restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                        }
                        maxLength={15}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                      />
                    </div>

                    {isFormSubmitted && (
                      <span className="error">{formErrors.loanAmount}</span>
                    )}
                  </div>
                </div>

                {formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL && (
                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label
                          className="form-label small font-15"
                          htmlFor="unit"
                        >
                          Nature of Business Activity <sup>*</sup>
                        </label>

                        <Dropdown
                          value={formValues.unit}
                          placeholder="Select nature of business activity"
                          onChange={(e) => handleInputChange("unit", e.value)}
                          options={unitList.sort((a, b) =>
                            a.displayName.localeCompare(b.displayName),
                          )}
                          optionLabel="displayName"
                          disabled={isEditMode}
                        />

                        {isFormSubmitted && (
                          <span className="error">{formErrors.unit}</span>
                        )}
                      </div>
                    </div>
                  )}

                {formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_PROFESSIONAL && (
                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label
                          className="form-label small font-15"
                          htmlFor="profession"
                        >
                          Profession <sup>*</sup>
                        </label>

                        <Dropdown
                          value={formValues.profession}
                          placeholder="Select Profession"
                          onChange={(e) =>
                            handleInputChange("profession", e.value)
                          }
                          options={professionList.sort((a, b) =>
                            a.displayName.localeCompare(b.displayName),
                          )}
                          optionLabel="displayName"
                          disabled={isEditMode}
                        />

                        {isFormSubmitted && (
                          <span className="error">{formErrors.profession}</span>
                        )}
                      </div>
                    </div>
                  )}

                {(formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_PROFESSIONAL ||
                  formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL) && (
                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label
                          className="form-label small font-15"
                          htmlFor="industry"
                        >
                          Industry <sup>*</sup>
                        </label>

                        <Dropdown
                          value={formValues.industry}
                          placeholder="Select Industry"
                          onChange={(e) => handleInputChange("industry", e.value)}
                          options={industryList.sort((a, b) =>
                            a.displayName.localeCompare(b.displayName),
                          )}
                          optionLabel="displayName"
                          filter
                          filterBy="displayName"
                          filterPlaceholder="Search Industry"
                          disabled={isEditMode}
                        />

                        {isFormSubmitted && (
                          <span className="error">{formErrors.industry}</span>
                        )}
                      </div>
                    </div>
                  )}

                {formValues.borrowerType.id === MasterEnum.SALARIED && (
                  <div className="col-lg-4 col-12">
                    <div className="form-group w-100">
                      <label className="form-label small font-15">
                        Average Gross Monthly Salary <sup>*</sup>
                      </label>

                      <div className="form-group search">
                        <i className="bi bi-currency-rupee" />
                        <InputText
                          value={formValues.averageGrossMonthlySalary}
                          className="form-control"
                          placeholder="Enter Average Gross Monthly Salary"
                          onChange={(e) =>
                            handleInputChange(
                              "averageGrossMonthlySalary",
                              e.target.value,
                            )
                          }
                          maxLength={15}
                          onKeyPress={(e) =>
                            restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                          }
                          disabled={isEditMode}
                        />
                      </div>

                      {isFormSubmitted && (
                        <span className="error">
                          {formErrors.averageGrossMonthlySalary}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_PROFESSIONAL ||
                  formValues.borrowerType.id ===
                  MasterEnum.SELF_EMPLOYED_NON_PROFESSIONAL) && (
                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label
                          className="form-label small font-15"
                          htmlFor="industry"
                        >
                          Business Vintage <sup>*</sup>
                        </label>

                        <Dropdown
                          value={formValues.businessVintage}
                          placeholder="Select Business Vintage"
                          onChange={(e) =>
                            handleInputChange("businessVintage", e.value)
                          }
                          options={businessVintageList}
                          optionLabel="displayName"
                          disabled={isEditMode}
                        />
                        {isFormSubmitted && (
                          <span className="error">
                            {formErrors.businessVintage}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="col-lg-4 col-12">
                  <div className="form-group w-100">
                    <label className="form-label small font-15">
                      Years Of ITR Filed <sup>*</sup>
                    </label>

                    <Dropdown
                      value={formValues.yearsOfITRFiled}
                      placeholder="Select ITR Filed Years"
                      onChange={(e) =>
                        handleInputChange("yearsOfITRFiled", e.value)
                      }
                      options={itrFiledYearsList}
                      optionLabel="displayName"
                      disabled={isEditMode}
                    />

                    {isFormSubmitted && (
                      <span className="error">
                        {formErrors.yearsOfITRFiled}
                      </span>
                    )}
                  </div>
                </div>

                {formValues.borrowerType.id === MasterEnum.SALARIED && (
                  <>
                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label className="form-label small font-15">
                          Type Of Organization Where Employee Working
                          <sup>*</sup>
                        </label>

                        <Dropdown
                          value={
                            formValues.typeOfOrganizationWhereEmployeeWorking
                          }
                          placeholder="Select Organization Type Where Employee Working"
                          onChange={(e) =>
                            handleInputChange(
                              "typeOfOrganizationWhereEmployeeWorking",
                              e.value,
                            )
                          }
                          options={organizationTypeList}
                          optionLabel="displayName"
                          disabled={isEditMode}
                        />

                        {isFormSubmitted && (
                          <span className="error">
                            {formErrors.typeOfOrganizationWhereEmployeeWorking}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label className="form-label small font-15">
                          Duration Of Working At Organization<sup>*</sup>
                        </label>

                        <Dropdown
                          value={formValues.durationOfWorkingAtOrganization}
                          placeholder="Select Working Duration At Organization"
                          onChange={(e) =>
                            handleInputChange(
                              "durationOfWorkingAtOrganization",
                              e.value,
                            )
                          }
                          options={workingDurationList}
                          optionLabel="displayName"
                          disabled={isEditMode}
                        />

                        {isFormSubmitted && (
                          <span className="error">
                            {formErrors.durationOfWorkingAtOrganization}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-4 col-12">
                      <div className="form-group w-100">
                        <label className="form-label small font-15">
                          Bank Name<sup>*</sup>
                        </label>

                        <div className="form-group">
                          <InputText
                            value={formValues.bankName}
                            className="form-control"
                            placeholder="Enter the bank name"
                            onChange={(e) =>
                              handleInputChange(
                                "bankName",
                                e.target.value.trimStart(),
                              )
                            }
                            maxLength={50}
                            disabled={isEditMode}
                          // onPaste={(e) => e.preventDefault()}
                          // onCopy={(e) => e.preventDefault()}
                          // onCut={(e) => e.preventDefault()}
                          />
                        </div>

                        {isFormSubmitted && (
                          <span className="error">{formErrors.bankName}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {shouldShowOtherIncomeFields && (
                  <>
                    <div className="col-12">
                      <div
                        className="p-3 rounded"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <div className="row g-3 align-items-end">
                          <div className="col-lg-4 col-12">
                            <div className="form-group w-100 mb-0">
                              <label className="form-label small font-15 mb-3 d-block">
                                Other Income
                              </label>

                              <div className="d-flex flex-wrap gap-4">
                                <div className="form-check">
                                  <RadioButton
                                    inputId="otherIncomeNo"
                                    name="hasOtherIncome"
                                    value={false}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "hasOtherIncome",
                                        Boolean(e.value),
                                      )
                                    }
                                    checked={
                                      formValues.hasOtherIncome === false
                                    }
                                    disabled={isEditMode}
                                  />
                                  <label
                                    className="form-check-label ms-2"
                                    htmlFor="otherIncomeNo"
                                  >
                                    No
                                  </label>
                                </div>

                                <div className="form-check">
                                  <RadioButton
                                    inputId="otherIncomeYes"
                                    name="hasOtherIncome"
                                    value={true}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "hasOtherIncome",
                                        Boolean(e.value),
                                      )
                                    }
                                    checked={formValues.hasOtherIncome === true}
                                    disabled={isEditMode}
                                  />
                                  <label
                                    className="form-check-label ms-2"
                                    htmlFor="otherIncomeYes"
                                  >
                                    Yes
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {formValues.hasOtherIncome && (
                            <>
                              <div className="col-lg-4 col-12">
                                <div className="form-group w-100 mb-0">
                                  <label className="form-label small font-15">
                                    Director/Partner Remuneration
                                  </label>

                                  <div className="form-group search">
                                    <i className="bi bi-currency-rupee" />
                                    <InputText
                                      value={
                                        formValues.directorPartnerRemuneration
                                      }
                                      className="form-control"
                                      placeholder="Enter Director/Partner Remuneration"
                                      onChange={(e) =>
                                        handleInputChange(
                                          "directorPartnerRemuneration",
                                          e.target.value,
                                        )
                                      }
                                      maxLength={15}
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
                                      disabled={isEditMode}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-4 col-12">
                                <div className="form-group w-100 mb-0">
                                  <label className="form-label small font-15">
                                    Interest Income
                                  </label>

                                  <div className="form-group search">
                                    <i className="bi bi-currency-rupee" />
                                    <InputText
                                      value={formValues.interestIncome}
                                      className="form-control"
                                      placeholder="Enter Interest Income"
                                      onChange={(e) =>
                                        handleInputChange(
                                          "interestIncome",
                                          e.target.value,
                                        )
                                      }
                                      maxLength={15}
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
                                      disabled={isEditMode}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-4 col-12">
                                <div className="form-group w-100 mb-0">
                                  <label className="form-label small font-15">
                                    Any Other Income
                                  </label>

                                  <div className="form-group search">
                                    <i className="bi bi-currency-rupee" />
                                    <InputText
                                      value={formValues.anyOtherIncome}
                                      className="form-control"
                                      placeholder="Enter Any Other Income"
                                      onChange={(e) =>
                                        handleInputChange(
                                          "anyOtherIncome",
                                          e.target.value,
                                        )
                                      }
                                      maxLength={15}
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
                                      disabled={isEditMode}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {shouldShowPropertyFields && (
                  <>
                    <div className="col-12">
                      <div
                        className="p-3 rounded"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <label className="form-label small font-15 mb-3 d-block">
                          Property Types
                        </label>

                        <div className="d-flex flex-wrap gap-4">
                          {availablePropertyOptions.map((option) => (
                            <div className="form-check" key={option.id}>
                              <Checkbox
                                inputId={`toggleProperty-${option.id}`}
                                onChange={(e) =>
                                  e.checked
                                    ? addProperty(option.id)
                                    : removeProperty(option.id)
                                }
                                checked={!!getPropertyByType(option.id)}
                                disabled={isEditMode}
                              />
                              <label
                                className="form-check-label ms-2"
                                htmlFor={`toggleProperty-${option.id}`}
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {residentialProperty && (
                      <div className="col-lg-6 col-12">
                        <div
                          className="p-3 rounded h-100"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Residential Property</h6>
                            {!isEditMode && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() => removeProperty(1)}
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="row g-3">
                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Property Size (in sq.ft.)
                                </label>

                                <InputText
                                  value={residentialProperty.size ?? ""}
                                  placeholder="Enter Property Size in sq.ft."
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyAmountChange(
                                      1,
                                      "size",
                                      e.target.value,
                                    )
                                  }
                                  maxLength={15}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  PIN Code
                                </label>

                                <InputText
                                  value={residentialProperty.pincode ?? ""}
                                  placeholder="Enter PIN Code"
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyPinCodeChange(
                                      1,
                                      e.target.value,
                                    )
                                  }
                                  maxLength={6}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Address
                                </label>

                                <InputTextarea
                                  value={residentialProperty.address ?? ""}
                                  placeholder="Enter Residential Address"
                                  className="form-control"
                                  onChange={(e) =>
                                    updatePropertyField(
                                      1,
                                      "address",
                                      e.target.value.trimStart(),
                                    )
                                  }
                                  maxLength={250}
                                  rows={3}
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Location
                                </label>

                                <InputText
                                  value={residentialProperty.location ?? ""}
                                  placeholder="Location will auto-fill from PIN Code"
                                  className="form-control"
                                  disabled
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Ownership
                                </label>

                                <div className="d-flex flex-wrap gap-3 mt-2">
                                  {PROPERTY_OWNERSHIP_OPTIONS.map((option) => (
                                    <div className="form-check" key={option.id}>
                                      <RadioButton
                                        inputId={`residentialOwnership-${option.id}`}
                                        name="residentialOwnership"
                                        value={String(option.id)}
                                        onChange={(e) =>
                                          updatePropertyField(
                                            1,
                                            "ownership",
                                            String(e.value),
                                          )
                                        }
                                        checked={
                                          residentialProperty.ownership ===
                                          String(option.id)
                                        }
                                        disabled={isEditMode}
                                      />

                                      <label
                                        className="form-check-label ms-2"
                                        htmlFor={`residentialOwnership-${option.id}`}
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Sale Deed Value
                                </label>

                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      residentialProperty.saleDeedValue ?? ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Sale Deed Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        1,
                                        "saleDeedValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Approx. Market Value
                                </label>

                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      residentialProperty.approxMarketValue ??
                                      ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Approx. Market Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        1,
                                        "approxMarketValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {commercialProperty && (
                      <div className="col-lg-6 col-12">
                        <div
                          className="p-3 rounded h-100"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Commercial Property</h6>
                            {!isEditMode && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() =>
                                  removeProperty(PropertyType.COMMERCIAL)
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="row g-3">
                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Property Size (in sq.ft.)
                                </label>

                                <InputText
                                  value={commercialProperty.size ?? ""}
                                  placeholder="Enter Property Size in sq.ft."
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyAmountChange(
                                      PropertyType.COMMERCIAL,
                                      "size",
                                      e.target.value,
                                    )
                                  }
                                  maxLength={15}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  PIN Code
                                </label>

                                <InputText
                                  value={commercialProperty.pincode ?? ""}
                                  placeholder="Enter PIN Code"
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyPinCodeChange(
                                      PropertyType.COMMERCIAL,
                                      e.target.value,
                                    )
                                  }
                                  maxLength={6}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Address
                                </label>

                                <InputTextarea
                                  value={commercialProperty.address ?? ""}
                                  placeholder="Enter Commercial Address"
                                  className="form-control"
                                  onChange={(e) =>
                                    updatePropertyField(
                                      PropertyType.COMMERCIAL,
                                      "address",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Location
                                </label>

                                <InputText
                                  value={commercialProperty.location ?? ""}
                                  placeholder="Location will auto-fill from PIN Code"
                                  className="form-control"
                                  disabled
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Ownership
                                </label>

                                <div className="d-flex flex-wrap gap-3 mt-2">
                                  {PROPERTY_OWNERSHIP_OPTIONS.map((option) => (
                                    <div className="form-check" key={option.id}>
                                      <RadioButton
                                        inputId={`commercialOwnership-${option.id}`}
                                        name="commercialOwnership"
                                        value={String(option.id)}
                                        onChange={(e) =>
                                          updatePropertyField(
                                            PropertyType.COMMERCIAL,
                                            "ownership",
                                            String(e.value),
                                          )
                                        }
                                        checked={
                                          commercialProperty.ownership ===
                                          String(option.id)
                                        }
                                        disabled={isEditMode}
                                      />

                                      <label
                                        className="form-check-label ms-2"
                                        htmlFor={`commercialOwnership-${option.id}`}
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Sale Deed Value
                                </label>

                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      commercialProperty.saleDeedValue ?? ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Sale Deed Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.COMMERCIAL,
                                        "saleDeedValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Approx. Market Value
                                </label>

                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      commercialProperty.approxMarketValue ?? ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Approx. Market Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.COMMERCIAL,
                                        "approxMarketValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {industrialProperty && (
                      <div className="col-lg-6 col-12">
                        <div
                          className="p-3 rounded h-100"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Industrial Property</h6>
                            {!isEditMode && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() =>
                                  removeProperty(PropertyType.INDUSTRIAL)
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="row g-3">
                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Property Size (in sq.ft.)
                                </label>
                                <InputText
                                  value={industrialProperty.size ?? ""}
                                  placeholder="Enter Property Size in sq.ft."
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyAmountChange(
                                      PropertyType.INDUSTRIAL,
                                      "size",
                                      e.target.value,
                                    )
                                  }
                                  maxLength={15}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  PIN Code
                                </label>
                                <InputText
                                  value={industrialProperty.pincode ?? ""}
                                  placeholder="Enter PIN Code"
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyPinCodeChange(
                                      PropertyType.INDUSTRIAL,
                                      e.target.value,
                                    )
                                  }
                                  maxLength={6}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Address
                                </label>
                                <InputTextarea
                                  value={industrialProperty.address ?? ""}
                                  placeholder="Enter Industrial Address"
                                  className="form-control"
                                  onChange={(e) =>
                                    updatePropertyField(
                                      PropertyType.INDUSTRIAL,
                                      "address",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Location
                                </label>
                                <InputText
                                  value={industrialProperty.location ?? ""}
                                  placeholder="Location will auto-fill from PIN Code"
                                  className="form-control"
                                  disabled
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Ownership
                                </label>
                                <div className="d-flex flex-wrap gap-3 mt-2">
                                  {PROPERTY_OWNERSHIP_OPTIONS.map((option) => (
                                    <div className="form-check" key={option.id}>
                                      <RadioButton
                                        inputId={`industrialOwnership-${option.id}`}
                                        name="industrialOwnership"
                                        value={String(option.id)}
                                        onChange={(e) =>
                                          updatePropertyField(
                                            PropertyType.INDUSTRIAL,
                                            "ownership",
                                            String(e.value),
                                          )
                                        }
                                        checked={
                                          industrialProperty.ownership ===
                                          String(option.id)
                                        }
                                        disabled={isEditMode}
                                      />
                                      <label
                                        className="form-check-label ms-2"
                                        htmlFor={`industrialOwnership-${option.id}`}
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Sale Deed Value
                                </label>
                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      industrialProperty.saleDeedValue ?? ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Sale Deed Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.INDUSTRIAL,
                                        "saleDeedValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Approx. Market Value
                                </label>
                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={
                                      industrialProperty.approxMarketValue ?? ""
                                    }
                                    className="form-control"
                                    placeholder="Enter Approx. Market Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.INDUSTRIAL,
                                        "approxMarketValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {plotProperty && (
                      <div className="col-lg-6 col-12">
                        <div
                          className="p-3 rounded h-100"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Plot Property</h6>
                            {!isEditMode && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() =>
                                  removeProperty(PropertyType.PLOT)
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="row g-3">
                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Property Size (in sq.ft.)
                                </label>
                                <InputText
                                  value={plotProperty.size ?? ""}
                                  placeholder="Enter Property Size in sq.ft."
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyAmountChange(
                                      PropertyType.PLOT,
                                      "size",
                                      e.target.value,
                                    )
                                  }
                                  maxLength={15}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  PIN Code
                                </label>
                                <InputText
                                  value={plotProperty.pincode ?? ""}
                                  placeholder="Enter PIN Code"
                                  className="form-control"
                                  onChange={(e) =>
                                    handlePropertyPinCodeChange(
                                      PropertyType.PLOT,
                                      e.target.value,
                                    )
                                  }
                                  maxLength={6}
                                  onKeyPress={(e) =>
                                    restrictInputByPattern(
                                      e,
                                      NUMBER_ONLY_PATTERN,
                                    )
                                  }
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Address
                                </label>
                                <InputTextarea
                                  value={plotProperty.address ?? ""}
                                  placeholder="Enter Plot Address"
                                  className="form-control"
                                  onChange={(e) =>
                                    updatePropertyField(
                                      PropertyType.PLOT,
                                      "address",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  disabled={isEditMode}
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Location
                                </label>
                                <InputText
                                  value={plotProperty.location ?? ""}
                                  placeholder="Location will auto-fill from PIN Code"
                                  className="form-control"
                                  disabled
                                />
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Ownership
                                </label>
                                <div className="d-flex flex-wrap gap-3 mt-2">
                                  {PROPERTY_OWNERSHIP_OPTIONS.map((option) => (
                                    <div className="form-check" key={option.id}>
                                      <RadioButton
                                        inputId={`plotOwnership-${option.id}`}
                                        name="plotOwnership"
                                        value={String(option.id)}
                                        onChange={(e) =>
                                          updatePropertyField(
                                            PropertyType.PLOT,
                                            "ownership",
                                            String(e.value),
                                          )
                                        }
                                        checked={
                                          plotProperty.ownership ===
                                          String(option.id)
                                        }
                                        disabled={isEditMode}
                                      />
                                      <label
                                        className="form-check-label ms-2"
                                        htmlFor={`plotOwnership-${option.id}`}
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Sale Deed Value
                                </label>
                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={plotProperty.saleDeedValue ?? ""}
                                    className="form-control"
                                    placeholder="Enter Sale Deed Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.PLOT,
                                        "saleDeedValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6 col-12">
                              <div className="form-group w-100">
                                <label className="form-label small font-15">
                                  Approx. Market Value
                                </label>
                                <div className="form-group search">
                                  <i className="bi bi-currency-rupee" />
                                  <InputText
                                    value={plotProperty.approxMarketValue ?? ""}
                                    className="form-control"
                                    placeholder="Enter Approx. Market Value"
                                    onChange={(e) =>
                                      handlePropertyAmountChange(
                                        PropertyType.PLOT,
                                        "approxMarketValue",
                                        e.target.value,
                                      )
                                    }
                                    maxLength={15}
                                    onKeyPress={(e) =>
                                      restrictInputByPattern(
                                        e,
                                        NUMBER_ONLY_PATTERN,
                                      )
                                    }
                                    disabled={isEditMode}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-5">
              <div className="form-group">
                <Button
                  className="btn btn-black-line"
                  label="Cancel"
                  onClick={handleRedirection}
                />

                <Button
                  className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
                    } ms-2 text-center`}
                  disabled={loading}
                  label={
                    loading ? "Loading..." : isEditMode ? "Update" : "Next"
                  }
                  type="submit"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <Dialog
        visible={showCongratulationModal}
        modal
        onHide={() => {
          setShowCongratulationModal(false);
        }}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "500px" }}
        blockScroll
      >
        <Congratulation message={congratulationMessage} />
      </Dialog>
    </div>
  );
};

export default NewApplyLoan;

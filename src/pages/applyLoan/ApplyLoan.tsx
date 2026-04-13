import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RadioButton } from "primereact/radiobutton";
import { FormEvent, useEffect, useState } from "react";
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
  LoanErrors,
  LoanValues,
} from "../../interface/applyLoan";
import {
  addLoanApplicationAPI,
  fetchImpersonateUser,
  fetchUserProfile,
  getClientDashboardAPI,
  getLoanTypeListAPI,
} from "../../utils/axios/apiServices";
import {
  BorrowerType,
  ILoanIndustryOptions,
  ILoanProfessionOptions,
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
import {
  LoanApplicationStatusType,
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
import { IUserProfileResponse } from "../../interface/userData";
import { validationMessages } from "../../utils/constants/messages";

const ApplyLoan = () => {
  const [formValues, setFormValues] = useState<LoanValues>({
    isSecuredLoanApp: true,
    loanCategory: 0,
    loanAmount: "",
    hasOtherIncome: null,
    directorPartnerRemuneration: "",
    interestIncome: "",
    anyOtherIncome: "",
    averageGrossMonthlySalary: "",
    saleDeedValue: "",
    unit: { id: 0, displayName: "" },
    profession: { id: 0, displayName: "" },
    industry: { id: 0, displayName: "" },
    borrowerType: { id: 0, displayName: "" },
    businessVintage: { id: 0, displayName: "" },
    typeOfOrganizationWhereEmployeeWorking: { id: 0, displayName: "" },
    durationOfWorkingAtOrganization: { id: 0, displayName: "" },
    yearsOfITRFiled: { id: 0, displayName: "" },
    salarySlipAvailableMonths: { id: 0, displayName: "" },
  });

  const [formErrors, setFormErrors] = useState<LoanErrors>({
    loanCategory: validationMessages.selectLoanType,
    loanAmount: validationMessages.selectLoanAmount,
    hasOtherIncome: "",
    directorPartnerRemuneration: "",
    interestIncome: "",
    anyOtherIncome: "",
    unit: validationMessages.selectUnit,
    profession: "",
    industry: validationMessages.selectIndustry,
    approxMarketValue: validationMessages.selectApproxMarketValue,
    borrowerType: validationMessages.selectBorrowerType,
    businessVintage: validationMessages.businessVintage,
    typeOfOrganizationWhereEmployeeWorking:
      validationMessages.typeOfOrganizationWhereEmployeeWorking,
    durationOfWorkingAtOrganization:
      validationMessages.durationOfWorkingAtOrganization,
    yearsOfITRFiled: validationMessages.yearsOfITRFiled,
    salarySlipAvailableMonths: validationMessages.salarySlipAvailableMonths,
    averageGrossMonthlySalary: validationMessages.averageGrossMonthlySalary,
    saleDeedValue: validationMessages.saleDeedValue,
  });

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
    { id: 1, displayName: "Salaried" },
    { id: 2, displayName: "Self Employed Professional" },
    { id: 3, displayName: "Self Employed Non Professional" },
  ];

  const [borrowerTypeList, setBorrowerTypeList] = useState<BorrowerType[]>([
    {
      id: 1,
      displayName: "Salaried",
    },
    {
      id: 2,
      displayName: "Self Employed Professional",
    },
    {
      id: 3,
      displayName: "Self Employed Non Professional",
    },
  ]);

  const businessVintageList = [
    { displayName: "1 Year", id: 1 },
    { displayName: "2 Years", id: 2 },
    { displayName: "3 Years", id: 3 },
    { displayName: "3+ Years", id: 4 },
  ];

  const organizationTypeList = [
    { displayName: "Proprietor", id: 1 },
    { displayName: "Firm", id: 2 },
    { displayName: "LLP", id: 3 },
    { displayName: "Company", id: 4 },
  ];

  const workingDurationList = [
    { displayName: "< 3 Months", id: 1 },
    { displayName: "3 - 6 Months", id: 2 },
    { displayName: "6 - 12 Months", id: 3 },
    { displayName: "1 Year", id: 4 },
    { displayName: "2 Years", id: 5 },
    { displayName: "3 Years", id: 6 },
    { displayName: "3+ Years", id: 7 },
  ];

  const itrFiledYearsList = [
    { displayName: "Not Filed", id: 0 },
    { displayName: "Filed - 1 Year", id: 1 },
    { displayName: "Filed - 2 Years", id: 2 },
    { displayName: "Filed - 3 Years", id: 3 },
  ];

  const salarySlipMonthsList = [
    { displayName: "3 Months", id: 1 },
    { displayName: "6 Months", id: 2 },
    { displayName: "12 Months", id: 3 },
  ];

  const [updatedLoanTypeList, setUpdatedLoanTypeList] = useState<
    ILoanTypeData[]
  >([]);

  const userData = useSelector((state: RootState) => state.user.user);

  const navigate = useNavigate();

  const { state } = useLocation();

  const { id } = useParams();

  const dispatch = useDispatch();

  const { userType, userID } = useSelector(
    (state: RootState) => state.user.user,
  );

  const items = [{ label: "Select Client" }, { label: "Select Loan" }];

  const selectedLoanType = loanTypeList.find(
    (loan) => loan.loanTypeId === formValues.loanCategory,
  );

  const shouldShowOtherIncomeFields =
    selectedLoanType?.displayName === "Home Loan" ||
    selectedLoanType?.displayName.includes("Loan against property");

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    if (
      fieldName === "loanAmount" ||
      fieldName === "approxMarketValue" ||
      fieldName === "saleDeedValue" ||
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
        } else if (fieldName === "approxMarketValue") {
          errorMessage = validationMessages.selectApproxMarketValue;
        } else if (fieldName === "saleDeedValue") {
          errorMessage = validationMessages.saleDeedValue;
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
        approxMarketValue: value ? prev.approxMarketValue : "",
      }));

      if (!value) {
        setFormErrors((prev) => ({
          ...prev,
          approxMarketValue: "",
        }));
      }
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
        [fieldName]: IsStringNullEmptyOrUndefined(value as string)
          ? `Please enter a valid ${fieldName}`
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    let updatedFormErrors = { ...formErrors };

    if (formValues.isSecuredLoanApp) {
      updatedFormErrors.approxMarketValue = IsStringNullEmptyOrUndefined(
        formValues.approxMarketValue as string,
      )
        ? validationMessages.selectApproxMarketValue
        : "";
    }

    if (formValues.unit.id === 3) {
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
      formValues.borrowerType.id !== 1
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

    // ===============================
    // NON-SALARIED (SEP / SENP)
    // ===============================
    if (formValues.borrowerType.id !== 1) {
      // ✅ Business Vintage required
      updatedFormErrors.businessVintage = IsStringNullEmptyOrUndefined(
        formValues.businessVintage.displayName,
      )
        ? validationMessages.businessVintage
        : "";

      // 🚫 Clear ALL salaried errors
      updatedFormErrors.typeOfOrganizationWhereEmployeeWorking = "";
      updatedFormErrors.durationOfWorkingAtOrganization = "";
      updatedFormErrors.yearsOfITRFiled = "";
      updatedFormErrors.salarySlipAvailableMonths = "";
      updatedFormErrors.averageGrossMonthlySalary = "";
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

      if (!formValues.isSecuredLoanApp) {
        updatedFormErrors.averageGrossMonthlySalary =
          IsStringNullEmptyOrUndefined(formValues.averageGrossMonthlySalary)
            ? validationMessages.averageGrossMonthlySalary
            : "";
      }

      // 🔹 ITR NOT FILED
      if (formValues.yearsOfITRFiled.id === 0) {
        updatedFormErrors.salarySlipAvailableMonths =
          IsStringNullEmptyOrUndefined(
            formValues.salarySlipAvailableMonths.displayName,
          )
            ? validationMessages.salarySlipAvailableMonths
            : "";
      } else {
        updatedFormErrors.averageGrossMonthlySalary = "";
        updatedFormErrors.salarySlipAvailableMonths = "";
      }
    }

    setFormErrors(updatedFormErrors);

    const isValid: boolean = IsFormValid(updatedFormErrors);

    if (isValid) {
      const {
        isSecuredLoanApp,
        loanAmount,
        loanCategory,
        approxMarketValue,
        unit,
        profession,
        industry,
        borrowerType,
        typeOfOrganizationWhereEmployeeWorking,
        saleDeedValue,
        yearsOfITRFiled,
        durationOfWorkingAtOrganization,
        salarySlipAvailableMonths,
        averageGrossMonthlySalary,
        businessVintage,
        hasOtherIncome,
        directorPartnerRemuneration,
        interestIncome,
        anyOtherIncome,
      } = formValues;

      setIsFormSubmitted(false);
      setLoading(true);

      const body: IAddLoanApplication = {
        clientID: state?.id || userID,
        isSecuredLoanApp: isSecuredLoanApp,
        loanTypeID: loanCategory,
        loanAmount: Number(loanAmount.replace(/,/g, "")),
        typeOfBusinessID: unit?.id,
        professionID: profession?.id,
        industryID: industry?.id,
        typeOfBorrower: borrowerType?.id,
        saleDeedValue: saleDeedValue
          ? Number(saleDeedValue.replace(/,/g, ""))
          : 0,
      };

      if (shouldShowOtherIncomeFields && hasOtherIncome !== null) {
        body.hasOtherIncome = hasOtherIncome;
      }

      if (shouldShowOtherIncomeFields && hasOtherIncome) {
        body.directorPartnerRemuneration = directorPartnerRemuneration
          ? Number(directorPartnerRemuneration.replace(/,/g, ""))
          : 0;
        body.interestIncome = interestIncome
          ? Number(interestIncome.replace(/,/g, ""))
          : 0;
        body.anyOtherIncome = anyOtherIncome
          ? Number(anyOtherIncome.replace(/,/g, ""))
          : 0;
      }

      if (isSecuredLoanApp && approxMarketValue) {
        body.approxMarketValue = Number(approxMarketValue.replace(/,/g, ""));
      }

      if (borrowerType?.id === 1) {
        body.typeOfOrganizationWhereEmployeeWorking =
          typeOfOrganizationWhereEmployeeWorking?.id;
        body.durationOfWorkingAtOrganization =
          durationOfWorkingAtOrganization?.id;
        body.yearsOfITRFiled = yearsOfITRFiled?.id;
        body.salarySlipAvailableMonths = salarySlipAvailableMonths?.id;
      }

      if (!isSecuredLoanApp) {
        body.averageGrossMonthlySalary = averageGrossMonthlySalary
          ? Number(averageGrossMonthlySalary.replace(/,/g, ""))
          : 0;
      }

      if (borrowerType?.id === 2 || borrowerType?.id === 3) {
        body.businessVintage = businessVintage?.id;
      }

      const response: IApplyLoanApplicationResponse =
        await addLoanApplicationAPI(body);

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

    setFormValues({
      isSecuredLoanApp: formValues.isSecuredLoanApp,
      loanCategory: 0,
      loanAmount: "",
      hasOtherIncome: null,
      directorPartnerRemuneration: "",
      interestIncome: "",
      anyOtherIncome: "",
      averageGrossMonthlySalary: "",
      saleDeedValue: "",
      unit: { id: 0, displayName: "" },
      profession: { id: 0, displayName: "" },
      industry: { id: 0, displayName: "" },
      approxMarketValue: formValues.isSecuredLoanApp ? "" : undefined,
      borrowerType: { id: 0, displayName: "" },
      businessVintage: { id: 0, displayName: "" },
      typeOfOrganizationWhereEmployeeWorking: { id: 0, displayName: "" },
      durationOfWorkingAtOrganization: { id: 0, displayName: "" },
      yearsOfITRFiled: { id: 0, displayName: "" },
      salarySlipAvailableMonths: { id: 0, displayName: "" },
    });

    setFormErrors({
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
      salarySlipAvailableMonths: validationMessages.salarySlipAvailableMonths,
      averageGrossMonthlySalary: validationMessages.averageGrossMonthlySalary,
      saleDeedValue: formValues.isSecuredLoanApp
        ? validationMessages.saleDeedValue
        : "",
    });

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
    if (!formValues.isSecuredLoanApp && formValues.loanCategory === 4) {
      const filteredList = MASTER_BORROWER_TYPE_LIST.filter(
        (item) => item.displayName !== "Salaried",
      );
      setBorrowerTypeList(filteredList);
    } else {
      // ✅ All options restore
      setBorrowerTypeList(MASTER_BORROWER_TYPE_LIST);
    }
  }, [formValues.isSecuredLoanApp, formValues.loanCategory]);

  useEffect(() => {
    if (formValues.yearsOfITRFiled.id !== 0) {
      setFormErrors((prev) => ({
        ...prev,
        salarySlipAvailableMonths: "",
        averageGrossMonthlySalary: "",
      }));
    }
  }, [formValues.yearsOfITRFiled]);

  useEffect(() => {
    filterOptions();
  }, [formValues.isSecuredLoanApp, loanTypeList]);

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

      setFormErrors((prev) => ({
        ...prev,
        hasOtherIncome: "",
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
              Application
              {state?.fullName
                ? ` for, ${state.fullName}`
                : ` for, ${userData.userName}`}
            </h2>
          </div>

          <form className="col-12" autoComplete="off" onSubmit={handleSubmit}>
            <div className="col-12 mt-2">
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

                <h2 className="txt-24">Select Loan</h2>

                <p className="mt-2 mb-4">
                  Please choose the type of loan you wish to apply for.
                </p>
              </div>

              <div className="form-group mb-4 d-flex gap-3">
                <div className="form-check">
                  <RadioButton
                    inputId="securedLoan"
                    name="loanType"
                    value={true}
                    onChange={() => handleInputChange("isSecuredLoanApp", true)}
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
                    onChange={() =>
                      handleInputChange("isSecuredLoanApp", false)
                    }
                    checked={formValues.isSecuredLoanApp === false}
                  />

                  <label className="form-check-label" htmlFor="unsecuredLoan">
                    <b>Unsecured Loan</b>
                  </label>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-lg-4 col-12">
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
                        value={formValues.loanAmount}
                        className="form-control"
                        placeholder="Enter the loan amount"
                        onChange={(e) =>
                          handleInputChange("loanAmount", e.target.value)
                        }
                        onKeyPress={(e) =>
                          restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                        }
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

                {formValues.isSecuredLoanApp && (
                  <div className="col-lg-4 col-12">
                    <div className="form-group w-100">
                      <label
                        className="form-label small font-15"
                        htmlFor="approxMarketValue"
                      >
                        Approx. Market Value <sup>*</sup>
                      </label>

                      <div className="form-group search">
                        <i className="bi bi-currency-rupee" />
                        <InputText
                          value={formValues.approxMarketValue}
                          className="form-control"
                          placeholder="Enter the approx. value"
                          onChange={(e) =>
                            handleInputChange(
                              "approxMarketValue",
                              e.target.value,
                            )
                          }
                          onKeyPress={(e) =>
                            restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                          }
                          // onPaste={(e) => e.preventDefault()}
                          // onCopy={(e) => e.preventDefault()}
                          // onCut={(e) => e.preventDefault()}
                        />
                      </div>

                      {isFormSubmitted && (
                        <span className="error">
                          {formErrors.approxMarketValue}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-lg-4 col-12">
                  <div className="form-group w-100">
                    <label className="form-label small font-15" htmlFor="unit">
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
                    />

                    {isFormSubmitted && (
                      <span className="error">{formErrors.unit}</span>
                    )}
                  </div>
                </div>

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
                      disabled={formValues.unit.id !== 3}
                      variant={formValues.unit.id === 3 ? "outlined" : "filled"}
                      placeholder="Select Profession"
                      onChange={(e) => handleInputChange("profession", e.value)}
                      options={professionList.sort((a, b) =>
                        a.displayName.localeCompare(b.displayName),
                      )}
                      optionLabel="displayName"
                    />

                    {isFormSubmitted && (
                      <span className="error">{formErrors.profession}</span>
                    )}
                  </div>
                </div>

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
                    />

                    {isFormSubmitted && (
                      <span className="error">{formErrors.industry}</span>
                    )}
                  </div>
                </div>

                {formValues.isSecuredLoanApp && (
                  <div className="col-lg-4 col-12">
                    <div className="form-group w-100">
                      <label className="form-label small font-15">
                        Sale Deed Value <sup>*</sup>
                      </label>

                      <div className="form-group search">
                        <i className="bi bi-currency-rupee" />
                        <InputText
                          value={formValues.saleDeedValue}
                          className="form-control"
                          placeholder="Enter Sale Deed Value"
                          onChange={(e) =>
                            handleInputChange("saleDeedValue", e.target.value)
                          }
                          onKeyPress={(e) =>
                            restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                          }
                        />
                      </div>

                      {isFormSubmitted && (
                        <span className="error">
                          {formErrors.saleDeedValue}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!formValues.isSecuredLoanApp && (
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
                          onKeyPress={(e) =>
                            restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                          }
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

                {!IsStringNullEmptyOrUndefined(
                  formValues.borrowerType.displayName,
                ) &&
                  formValues.borrowerType.id !== 1 && (
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
                        />
                        {isFormSubmitted && (
                          <span className="error">
                            {formErrors.businessVintage}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {formValues.borrowerType.id === 1 && (
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
                        />

                        {isFormSubmitted && (
                          <span className="error">
                            {formErrors.yearsOfITRFiled}
                          </span>
                        )}
                      </div>
                    </div>

                    {!IsStringNullEmptyOrUndefined(
                      formValues.yearsOfITRFiled.displayName,
                    ) &&
                      formValues.yearsOfITRFiled.id === 0 && (
                        <>
                          <div className="col-lg-4 col-12">
                            <div className="form-group w-100">
                              <label className="form-label small font-15">
                                Salary Slip Available Months<sup>*</sup>
                              </label>

                              <Dropdown
                                value={formValues.salarySlipAvailableMonths}
                                placeholder="Select Salary Slip Available Months"
                                onChange={(e) =>
                                  handleInputChange(
                                    "salarySlipAvailableMonths",
                                    e.value,
                                  )
                                }
                                options={salarySlipMonthsList}
                                optionLabel="displayName"
                              />

                              {isFormSubmitted && (
                                <span className="error">
                                  {formErrors.salarySlipAvailableMonths}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
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
                                    inputId="applyLoanOtherIncomeNo"
                                    name="applyLoanHasOtherIncome"
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
                                  />

                                  <label
                                    className="form-check-label ms-2"
                                    htmlFor="applyLoanOtherIncomeNo"
                                  >
                                    No
                                  </label>
                                </div>

                                <div className="form-check">
                                  <RadioButton
                                    inputId="applyLoanOtherIncomeYes"
                                    name="applyLoanHasOtherIncome"
                                    value={true}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "hasOtherIncome",
                                        Boolean(e.value),
                                      )
                                    }
                                    checked={formValues.hasOtherIncome === true}
                                  />

                                  <label
                                    className="form-check-label ms-2"
                                    htmlFor="applyLoanOtherIncomeYes"
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
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
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
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
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
                                      onKeyPress={(e) =>
                                        restrictInputByPattern(
                                          e,
                                          NUMBER_ONLY_PATTERN,
                                        )
                                      }
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
                  className={`btn ${
                    loading ? "btn-orange-disabled" : "btn-orange"
                  } ms-2 text-center`}
                  disabled={loading}
                  label={loading ? "Loading..." : "Next"}
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

export default ApplyLoan;

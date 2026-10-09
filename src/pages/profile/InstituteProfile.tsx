import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import Loader from "../../components/Loader";
import { RootState } from "../../store";
import {
  fetchStatesAPI,
  getDataByPincodeAPI,
  getEducationInstituteByIdAPI,
  getEducationalInstituteBranchesAPI,
  uploadEducationalInstituteAgreementAPI,
  updateEducationalInstituteAPI,
} from "../../utils/axios/apiServices";
import {
  IGetAllEducationInstitutesDetailedBranches,
  IGetAllEducationInstitutesDetailedDocuments,
  IGetAllEducationInstitutesDetailedResponse,
  IGetAllEducationInstitutesDetailedResponseData,
  IEducationalInstituteBranchAuthorisedPerson,
} from "../../interface/institutes";
import { IFetchStateResponse, IFetchStateResponseData } from "../../interface/payOuts";
import { IRegisterParams, IAuthorizedPersonRegisterRequest } from "../../interface/signIn";
import { APIResponseEntity } from "../../interface/apiResponse";
import {
  decryptVAPTData,
  encryptData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import {
  extraToken,
  formatDate,
  getFileSizeLimitErrorMessage,
  IsFormValid,
  isFileSizeWithinLimit,
  isPdfFile,
  MAX_FILE_UPLOAD_NOTE,
  PDF_FILE_ACCEPT,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import {
  GST_NUMBER_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
  PAN_NUMBER_PATTERN,
  TRADE_NAME_PATTERN,
  WEBSITE_PATTERN,
} from "../../utils/constants/pattern";
import { DocumentFileTypeForInstitute } from "../../utils/constants/enum";
import { validationMessages } from "../../utils/constants/messages";
import { CLIENT_ROLE, formatMobileNumber } from "../../utils/constants/constant";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";

interface IInstituteProfileForm {
  id: string;
  fullName: string;
  tradeName: string;
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  dob: string;
  aadhaar: string;
  gstNumber: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  constitutionOfInstitute: string;
  website: string;
  isActive: boolean;
  authorisedPersons: IEducationalInstituteBranchAuthorisedPerson[];
}

interface IInstituteProfileValidation {
  tradeName: string;
  panNumber: string;
  aadhaar: string;
  website: string;
  fullName: string;
  emailID: string;
  mobileNumber: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IInstituteUploadDocumentForm {
  documentType: string;
  file: File | null;
}

const initialFormData: IInstituteProfileForm = {
  id: "",
  fullName: "",
  tradeName: "",
  panNumber: "",
  emailID: "",
  mobileNumber: "",
  dob: "",
  aadhaar: "",
  gstNumber: "",
  code: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  constitutionOfInstitute: "",
  website: "",
  isActive: false,
  authorisedPersons: [],
};

const initialValidation: IInstituteProfileValidation = {
  tradeName: "",
  panNumber: "",
  aadhaar: "",
  website: "",
  fullName: "",
  emailID: "",
  mobileNumber: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
};

const instituteDocumentTypeOptions = [
  { label: "Agreement", value: "Agreement" },
  { label: "Registration Document", value: "Registration Document" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "PAN", value: "PAN" },
  { label: "Other", value: "Other" },
];

const instituteDocumentTypeMap: Record<string, DocumentFileTypeForInstitute> = {
  Agreement: DocumentFileTypeForInstitute.AGREEMENT,
  "Registration Document": DocumentFileTypeForInstitute.REGISTRATION_DOCUMENT,
  "GST Certificate": DocumentFileTypeForInstitute.GST_CERTIFICATE,
  PAN: DocumentFileTypeForInstitute.PAN,
  Other: DocumentFileTypeForInstitute.OTHER,
};

const InstituteProfile = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const { isImpersonate } = useSelector((state: RootState) => state.impersonateUser);

  const { userID, whiteLabelSettings } = user;

  const [loading, setLoading] = useState<boolean>(false);

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [userFormData, setUserFormData] =
    useState<IInstituteProfileForm>(initialFormData);

  const [initialUserFormData, setInitialUserFormData] =
    useState<IInstituteProfileForm>(initialFormData);

  const [formErrors, setFormErrors] =
    useState<IInstituteProfileValidation>(initialValidation);

  const [stateOptions, setStateOptions] = useState<IFetchStateResponseData[]>([]);

  const [instituteDetail, setInstituteDetail] =
    useState<IGetAllEducationInstitutesDetailedResponseData | null>(null);

  const [branchRecords, setBranchRecords] = useState<
    IGetAllEducationInstitutesDetailedBranches[]
  >([]);

  const [showInstituteDocumentDialog, setShowInstituteDocumentDialog] =
    useState<boolean>(false);

  const [uploadDocumentForm, setUploadDocumentForm] =
    useState<IInstituteUploadDocumentForm>({
      documentType: "",
      file: null,
    });

  const [uploadDocumentErrors, setUploadDocumentErrors] = useState<{
    documentType: string;
    file: string;
  }>({
    documentType: "",
    file: "",
  });

  const [documentFileInputKey, setDocumentFileInputKey] = useState<number>(0);

  const decryptValueOrFallback = (value?: string | null): string => {
    if (!value) return "";

    const decryptedValue = decryptVAPTData(value);
    return decryptedValue || value;
  };

  const buildValidationState = (
    formData: IInstituteProfileForm,
  ): IInstituteProfileValidation => {
    const emailValue = formData.emailID.trim().toLowerCase();
    const mobileValue = formData.mobileNumber.trim();
    const gstValue = formData.gstNumber.trim().toUpperCase();

    return {
      panNumber:
        IsStringNullEmptyOrUndefined(formData.panNumber.trim()) ||
          PAN_NUMBER_PATTERN.test(formData.panNumber.trim())
          ? ""
          : "Please enter valid PAN number",
      aadhaar:
        IsStringNullEmptyOrUndefined(formData.aadhaar.trim()) || /^\d{12}$/.test(formData.aadhaar.trim())
          ? ""
          : "Please enter valid Aadhaar number",
      tradeName:
        IsStringNullEmptyOrUndefined(formData.tradeName.trim()) ||
          (TRADE_NAME_PATTERN.test(formData.tradeName.trim()) && formData.tradeName.trim().length >= 2 && formData.tradeName.trim().length <= 100)
          ? ""
          : validationMessages.tradeNameInvalid,
      website:
        IsStringNullEmptyOrUndefined(formData.website.trim()) || WEBSITE_PATTERN.test(formData.website.trim())
          ? ""
          : validationMessages.websiteInvalid,
      fullName: IsStringNullEmptyOrUndefined(formData.fullName.trim())
        ? "Please enter institute name"
        : "",
      emailID: IsStringNullEmptyOrUndefined(emailValue)
        ? validationMessages.emailRequired
        : !/^(?!\.)(?!.*\.\.)(?!.*\.$)(?!.*\.@)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
          emailValue,
        )
          ? validationMessages.emailInvalid
          : "",
      mobileNumber: IsStringNullEmptyOrUndefined(mobileValue)
        ? validationMessages.mobileNumberRequired
        : !(
          INDIAN_MOBILE_NUMBER_PATTERN.test(mobileValue) &&
          mobileValue.length === 10
        )
          ? validationMessages.mobileNumberInvalid
          : "",
      gstNumber:
        IsStringNullEmptyOrUndefined(gstValue) || GST_NUMBER_PATTERN.test(gstValue)
          ? ""
          : "Please enter valid GST number",
      address: IsStringNullEmptyOrUndefined(formData.address.trim())
        ? validationMessages.addressRequired
        : "",
      city: IsStringNullEmptyOrUndefined(formData.city.trim())
        ? validationMessages.cityRequired
        : "",
      state: IsStringNullEmptyOrUndefined(formData.state.trim())
        ? validationMessages.stateRequired
        : "",
      zipCode: IsStringNullEmptyOrUndefined(formData.zipCode.trim())
        ? validationMessages.zipCodeRequired
        : formData.zipCode.trim().length !== 6
          ? validationMessages.zipCodeInvalid
          : "",
    };
  };

  const mapInstituteResponseToForm = useCallback((
    instituteData: IGetAllEducationInstitutesDetailedResponseData,
  ): IInstituteProfileForm => ({
    id: instituteData.id,
    fullName: instituteData.fullName || "",
    tradeName: instituteData.tradeName ? decryptValueOrFallback(instituteData.tradeName) : "",
    panNumber: decryptValueOrFallback(instituteData.panNumber),
    emailID: decryptValueOrFallback(instituteData.email),
    mobileNumber: decryptValueOrFallback(instituteData.phoneNumber),
    dob: decryptValueOrFallback(instituteData.dob),
    aadhaar: decryptValueOrFallback(instituteData.aadhaar),
    gstNumber: decryptValueOrFallback(instituteData.gstNumber),
    code: instituteData.code || "",
    address: decryptValueOrFallback(instituteData.address),
    city: decryptValueOrFallback(instituteData.city),
    state: decryptValueOrFallback(instituteData.state),
    country: instituteData.country || "India",
    zipCode: decryptValueOrFallback(instituteData.zipCode),
    constitutionOfInstitute: instituteData.constitutionOfInstitute || "",
    website: instituteData.website || "",
    isActive: instituteData.isActive,
    authorisedPersons: instituteData.authorisedPersons || [],
  }), []);

  const fetchInstituteProfile = useCallback(async (): Promise<void> => {
    if (!userID) return;

    setLoading(true);

    try {
      const response: IGetAllEducationInstitutesDetailedResponse =
        await getEducationInstituteByIdAPI(userID);

      if (!response) return;

      if (response.statusCode === 200) {
        setInstituteDetail(response.data);
        const mappedData = mapInstituteResponseToForm(response.data);
        setUserFormData(mappedData);
        setInitialUserFormData(mappedData);
        setFormErrors(initialValidation);
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  }, [mapInstituteResponseToForm, userID]);

  const fetchBranchList = useCallback(async (): Promise<void> => {
    if (!userID) return;

    const response = await getEducationalInstituteBranchesAPI({
      instituteID: userID,
    });

    if (response?.statusCode === 200) {
      const branchList =
        response.data?.educationalInstituteBranches ||
        response.data?.educationalInstituteBranchList ||
        response.data?.branches ||
        [];

      setBranchRecords(
        branchList.map((branch) => ({
          id: branch.id,
          branchCode: branch.branchCode || "",
          branchName: branch.branchName || "",
          contactPerson: branch.contactPerson || branch.contactPersonName || "",
          mobileNumber: branch.mobileNumber
            ? decryptValueOrFallback(branch.mobileNumber)
            : "",
          isPaymentBranch:
            typeof branch.isPaymentBranch === "boolean"
              ? branch.isPaymentBranch
              : !!branch.isBillingBranch,
          city: branch.city ? decryptValueOrFallback(branch.city) : "",
          state: branch.state ? decryptValueOrFallback(branch.state) : "",
          isActive:
            typeof branch.isActive === "boolean" ? branch.isActive : false,
        })),
      );
    }
  }, [userID]);

  const fetchStatesList = useCallback(async (): Promise<void> => {
    const response: IFetchStateResponse = await fetchStatesAPI();

    if (!response) return;

    if (response.statusCode === 200) {
      setStateOptions(response.data || []);
    }
  }, []);

  useEffect(() => {
    fetchStatesList();
    fetchInstituteProfile();
    fetchBranchList();
  }, [fetchBranchList, fetchInstituteProfile, fetchStatesList]);

  const handleChange = (name: keyof IInstituteProfileForm, value: string): void => {
    let updatedValue = value;

    if (name === "emailID") {
      updatedValue = value.trim().toLowerCase();
    }

    if (name === "gstNumber") {
      updatedValue = value.toUpperCase().trim();
    }

    setUserFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setFormErrors(buildValidationState({
      ...userFormData,
      [name]: updatedValue,
    }));
  };

  const handleStateChange = (selectedState: IFetchStateResponseData | null): void => {
    setUserFormData((prev) => ({
      ...prev,
      state: selectedState?.name || "",
    }));

    if (isFormSubmitted) {
      setFormErrors((prev) => ({
        ...prev,
        state: selectedState?.name ? "" : validationMessages.stateRequired,
      }));
    }
  };

  const handlePinCode = async (value: string): Promise<void> => {
    setUserFormData((prev) => ({
      ...prev,
      zipCode: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      zipCode: IsStringNullEmptyOrUndefined(value)
        ? validationMessages.zipCodeRequired
        : value.length !== 6
          ? validationMessages.zipCodeInvalid
          : "",
    }));

    if (value.length !== 6) return;

    setLoading(true);

    try {
      const response = await getDataByPincodeAPI({
        pincode: Number(value),
      });

      if (!response) return;

      if (response.statusCode === 200) {
        setUserFormData((prev) => ({
          ...prev,
          city: response.data.circle || prev.city,
          state: response.data.state || prev.state,
          country: response.data.country || prev.country,
        }));
        setFormErrors((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setUserFormData(initialUserFormData);
    setFormErrors(initialValidation);
    setIsFormSubmitted(false);
    setIsEditable(false);
  };

  const openFileLink = (filePath?: string | null): void => {
    if (filePath && typeof window !== "undefined") {
      window.open(filePath, "_blank", "noopener,noreferrer");
      return;
    }

    toastError(validationMessages.filePathMissing);
  };

  const handleInstituteDocumentFieldChange = (
    field: "documentType" | "file",
    value: string | File | null,
  ): void => {
    let nextValue = value;
    let nextFileError = "";

    if (field === "file" && value instanceof File) {
      if (!isPdfFile(value)) {
        nextValue = null;
        nextFileError = "Only PDF file are allowed.";
      } else if (!isFileSizeWithinLimit(value)) {
        nextValue = null;
        nextFileError = getFileSizeLimitErrorMessage("File");
      }
    }

    setUploadDocumentForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    setUploadDocumentErrors((prev) => ({
      ...prev,
      [field]:
        field === "documentType"
          ? nextValue
            ? ""
            : "Please select document type"
          : nextFileError || (nextValue ? "" : "Please upload PDF file"),
    }));
  };

  const handleUploadInstituteDocument = async (): Promise<void> => {
    const nextErrors = {
      documentType: uploadDocumentForm.documentType ? "" : "Please select document type",
      file: uploadDocumentForm.file ? "" : "Please upload PDF file",
    };

    setUploadDocumentErrors(nextErrors);

    if (nextErrors.documentType || nextErrors.file || !uploadDocumentForm.file) {
      return;
    }

    if (!isFileSizeWithinLimit(uploadDocumentForm.file)) {
      setUploadDocumentErrors((prev) => ({
        ...prev,
        file: getFileSizeLimitErrorMessage("File"),
      }));
      return;
    }

    const documentType = instituteDocumentTypeMap[uploadDocumentForm.documentType];

    if (!documentType) {
      toastError("Invalid document type selected.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("documentFile", uploadDocumentForm.file);
      formData.append("instituteID", userID || "");
      formData.append("documentType", String(documentType));

      const response = await uploadEducationalInstituteAgreementAPI(formData);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        setShowInstituteDocumentDialog(false);
        setUploadDocumentForm({
          documentType: "",
          file: null,
        });
        setUploadDocumentErrors({
          documentType: "",
          file: "",
        });
        setDocumentFileInputKey((prev) => prev + 1);
        await fetchInstituteProfile();
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (isImpersonate) return;

    setIsFormSubmitted(true);

    const nextErrors = buildValidationState(userFormData);
    setFormErrors(nextErrors);

    if (!IsFormValid(nextErrors)) return;

    setLoading(true);

    const authorisedPersonsPayload: IAuthorizedPersonRegisterRequest[] =
      userFormData.authorisedPersons.map((person) => ({
        name: person.name || "",
        dateOfBirth: person.dateOfBirth
          ? encryptVAPTData(decryptValueOrFallback(person.dateOfBirth))
          : undefined,
        panNumber: person.panNumber
          ? encryptVAPTData(decryptValueOrFallback(person.panNumber))
          : "",
        address: person.address
          ? encryptVAPTData(decryptValueOrFallback(person.address))
          : undefined,
        gender:
          typeof person.gender === "number"
            ? String(person.gender)
            : String(person.gender || ""),
        constitution: decryptValueOrFallback(person.constitution),
        constitutionOfInstitute: decryptValueOrFallback(person.constitution),
        mobileNumber: person.mobileNumber
          ? encryptVAPTData(decryptValueOrFallback(person.mobileNumber))
          : "",
        emailAddress: person.emailAddress
          ? encryptVAPTData(
            decryptValueOrFallback(person.emailAddress).trim().toLowerCase(),
          )
          : "",
        userType: CLIENT_ROLE.AUTHORIZED_PERSON,
        profilePhotoPath: person.profilePhotoPath || null,
      }));

    const payload: IRegisterParams & {
      instituteID: string;
      isEditMode: boolean;
    } = {
      instituteID: userFormData.id,
      isEditMode: true,
      emailID: encryptVAPTData(userFormData.emailID.trim().toLowerCase()),
      mobileNumber: encryptVAPTData(userFormData.mobileNumber.trim()),
      extraToken: encryptData(extraToken()),
      panNumber: encryptVAPTData(userFormData.panNumber),
      userType: CLIENT_ROLE.EDUCATIONAL_INSTITUTE,
      isUserDetailsRequired: true,
      parentID: userID,
      fullName: userFormData.fullName.trim(),
      category: userFormData.constitutionOfInstitute || undefined,
      dob: userFormData.dob ? encryptVAPTData(userFormData.dob) : null,
      address: userFormData.address
        ? encryptVAPTData(userFormData.address.trim())
        : null,
      state: userFormData.state
        ? encryptVAPTData(userFormData.state.trim())
        : null,
      city: userFormData.city ? encryptVAPTData(userFormData.city.trim()) : null,
      zipCode: userFormData.zipCode
        ? encryptVAPTData(userFormData.zipCode.trim())
        : null,
      maskedAadhaar: userFormData.aadhaar || null,
      gstNumber: userFormData.gstNumber
        ? encryptVAPTData(userFormData.gstNumber.trim())
        : null,
      constitutionOfInstitute: userFormData.constitutionOfInstitute || null,
      tradeName: userFormData.tradeName
        ? encryptVAPTData(userFormData.tradeName.trim())
        : null,
      website: userFormData.website.trim() || null,
      authorisedPersons: authorisedPersonsPayload,
      whiteLabelTenantId: whiteLabelSettings?.id || "",
      masterCpID: userID || "",
    };

    try {
      const response: APIResponseEntity = await updateEducationalInstituteAPI(
        payload,
      );

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        await fetchInstituteProfile();
        await fetchBranchList();
        setIsEditable(false);
        setIsFormSubmitted(false);
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedStateOption =
    stateOptions.find((option) => option.name === userFormData.state) || null;

  const renderAuthorizedPersonDetails = (
    person: IEducationalInstituteBranchAuthorisedPerson,
    sectionTitle: string,
  ): JSX.Element => (
    <div className="borderBoxHldr p-24 profile-person-card">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
        <div>
          <h5 className="mb-1">{sectionTitle}</h5>
          <span className="text-muted small">{person.name || "Authorized person information"}</span>
        </div>
        <span className="badge rounded-pill text-bg-light border">Authorized</span>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Name</b>
          <p className="text-break">{person.name || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">
            {person.panNumber ? decryptValueOrFallback(person.panNumber) : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {person.dateOfBirth
              ? formatDate(decryptValueOrFallback(person.dateOfBirth), "DD MMM, YYYY")
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Gender</b>
          <p className="text-break">{person.gender
            ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1).toLowerCase()
            : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {person.mobileNumber
              ? formatMobileNumber(decryptValueOrFallback(person.mobileNumber))
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">
            {person.emailAddress ? decryptValueOrFallback(person.emailAddress) : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Constitution</b>
          <p className="text-break">{decryptValueOrFallback(person.constitution) || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Profile Photo</b>
          <p className="text-break mt-1">
            {person.profilePhoto ? (
              <a
                href={person.profilePhoto}
                target="_blank"
                rel="noreferrer"
                className="text-primary fw-semibold"
              >
                View Document
              </a>
            ) : (
              "Not uploaded"
            )}
          </p>
        </div>
        <div className="col-12 mb-0">
          <b>Address</b>
          <p className="text-break">
            {person.address ? decryptValueOrFallback(person.address) : "-"}
          </p>
        </div>
      </div>
    </div>
  );

  const renderDocumentCard = (
    documentData: IGetAllEducationInstitutesDetailedDocuments,
    index: number,
  ): JSX.Element => (
    <div key={`${documentData.fileUrl}-${index}`} className="col-lg-4 col-md-6 col-12">
      <article className="document-card profile-document-card h-100">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h5 className="mb-0">{documentData.type || `Document ${index + 1}`}</h5>
      </div>

      <div className="row">
        <div className="col-sm-6 col-12 mb-3">
          <b>Document Type</b>
          <p className="text-break mb-0">{documentData.type || "-"}</p>
        </div>
        <div className="col-sm-6 col-12 mb-3">
          <b>Uploaded Date</b>
          <p className="text-break mb-0">
            {formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}
          </p>
        </div>
        <div className="col-12 mb-0">
          <b>Action</b>
          <p className="mt-1 mb-0">
            {documentData.fileUrl ? (
              <a href={documentData.fileUrl} target="_blank" rel="noreferrer" className="text-primary fw-semibold">
                View Document
              </a>
            ) : "Not uploaded"}
          </p>
        </div>
      </div>
      </article>
    </div>
  );

  const renderBranchCard = (
    branch: IGetAllEducationInstitutesDetailedBranches,
  ): JSX.Element => (
    <div key={branch.id} className="borderBoxHldr p-24 profile-branch-card">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
        <div>
          <h5 className="mb-1">{branch.branchName || "Unnamed Branch"}</h5>
          <span className="text-muted small">{branch.branchCode || "Branch details"}</span>
        </div>
        <span className={`badge rounded-pill ${branch.isActive ? "text-bg-success" : "text-bg-secondary"}`}>
          {branch.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>Branch Code</b>
          <p className="text-break">{branch.branchCode || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>Contact Person</b>
          <p className="text-break">{branch.contactPerson || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {branch.mobileNumber ? formatMobileNumber(branch.mobileNumber) : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>Payment Branch</b>
          <p className="text-break">{branch.isPaymentBranch ? "Yes" : "No"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>City</b>
          <p className="text-break">{branch.city || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>State</b>
          <p className="text-break">{branch.state || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <b>Status</b>
          <p className="text-break">{branch.isActive ? "Active" : "Inactive"}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="row">
        <Loader isLoading={loading} />

        <div className="col-12 mb-4">
          <div className="titleMainWrapper">
            <h2 className="txt-24 mb-1">Institute Profile</h2>

            {!isEditable && !isImpersonate && (
              <div className="btnGroup">
                <Button
                  className="btn btn-orange"
                  icon="icon-edit me-2"
                  label="Edit Profile"
                  onClick={() => setIsEditable(true)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Institute Name <sup>*</sup></label>
            <InputText
              className="form-control"
              value={userFormData.fullName}
              disabled={!isEditable || Boolean(initialUserFormData.fullName)}
              placeholder="Institute name"
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {isFormSubmitted && formErrors.fullName && (
              <small className="error">{formErrors.fullName}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Institute Code</label>
            <InputText
              className="form-control"
              value={userFormData.code}
              disabled
              placeholder="Institute code"
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Constitution</label>
            <InputText
              className="form-control text-capitalize"
              value={userFormData.constitutionOfInstitute}
              disabled={!isEditable || Boolean(initialUserFormData.constitutionOfInstitute)}
              placeholder="Constitution"
              onChange={(e) => handleChange("constitutionOfInstitute", e.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">PAN Number</label>
            <InputText
              className="form-control"
              value={userFormData.panNumber}
              disabled={!isEditable || Boolean(initialUserFormData.panNumber)}
              placeholder="PAN number"
              onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())}
            />
            {formErrors.panNumber && <small className="error">{formErrors.panNumber}</small>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">GST Number</label>
            <InputText
              className="form-control"
              value={userFormData.gstNumber}
              disabled={!isEditable}
              placeholder="Enter GST number"
              maxLength={15}
              onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())}
            />
            {formErrors.gstNumber && (
              <small className="error">{formErrors.gstNumber}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Trade Name</label>
            <InputText
              className="form-control"
              value={userFormData.tradeName}
              disabled={!isEditable}
              placeholder="Enter trade name"
              maxLength={100}
              onChange={(e) => handleChange("tradeName", e.target.value?.trimStart())}
            />
            {formErrors.tradeName && <small className="error">{formErrors.tradeName}</small>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Email Address <sup>*</sup></label>
            <InputText
              className="form-control"
              value={userFormData.emailID}
              disabled={!isEditable}
              placeholder="Enter email address"
              onChange={(e) => handleChange("emailID", e.target.value)}
            />
            {isFormSubmitted && formErrors.emailID && (
              <small className="error">{formErrors.emailID}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Mobile Number <sup>*</sup></label>
            <InputText
              className="form-control"
              value={userFormData.mobileNumber}
              disabled={!isEditable}
              placeholder="Enter mobile number"
              maxLength={10}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
            />
            {isFormSubmitted && formErrors.mobileNumber && (
              <small className="error">{formErrors.mobileNumber}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Website</label>
            <InputText
              className="form-control"
              value={userFormData.website}
              disabled={!isEditable}
              placeholder="Enter website"
              maxLength={255}
              onChange={(e) => handleChange("website", e.target.value.trim())}
            />
            {formErrors.website && <small className="error">{formErrors.website}</small>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Date of Incorporation / DOB</label>
            <div className="position-relative">
              <InputText
                className="form-control"
                value={userFormData.dob ? formatDate(userFormData.dob, "DD-MM-YYYY") : ""}
                disabled={!isEditable || Boolean(initialUserFormData.dob)}
                placeholder="Date"
                onChange={(e) => handleChange("dob", e.target.value)}
              />
              <i className="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3 secondary-icon" />
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Aadhaar</label>
            <InputText
              className="form-control"
              value={userFormData.aadhaar}
              disabled={!isEditable || Boolean(initialUserFormData.aadhaar)}
              placeholder="Aadhaar"
              maxLength={12}
              onChange={(e) => handleChange("aadhaar", e.target.value)}
            />
            {formErrors.aadhaar && <small className="error">{formErrors.aadhaar}</small>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">PIN Code <sup>*</sup></label>
            <InputText
              className="form-control"
              value={userFormData.zipCode}
              disabled={!isEditable}
              placeholder="Enter PIN code"
              maxLength={6}
              onChange={(e) => void handlePinCode(e.target.value)}
              onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
            />
            {isFormSubmitted && formErrors.zipCode && (
              <small className="error">{formErrors.zipCode}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">State <sup>*</sup></label>
            <Dropdown
              className="w-100"
              value={selectedStateOption}
              disabled
              options={stateOptions}
              optionLabel="name"
              placeholder="Select state"
              onChange={(e) => handleStateChange(e.value || null)}
            />
            {isFormSubmitted && formErrors.state && (
              <small className="error">{formErrors.state}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">City <sup>*</sup></label>
            <InputText
              className="form-control"
              value={userFormData.city}
              disabled
              placeholder="Enter city"
              // onChange={(e) => handleChange("city", e.target.value)}
            />
            {isFormSubmitted && formErrors.city && (
              <small className="error">{formErrors.city}</small>
            )}
          </div>
        </div>

        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Address <sup>*</sup></label>
            <InputTextarea
              className="form-control"
              rows={4}
              value={userFormData.address}
              disabled={!isEditable}
              placeholder="Enter address"
              onChange={(e) => handleChange("address", e.target.value.trimStart())}
            />
            {isFormSubmitted && formErrors.address && (
              <small className="error">{formErrors.address}</small>
            )}
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="col-12 mb-4">
            <div className="titleMainWrapper">
              <h2 className="txt-24 mb-1">Authorized Persons</h2>
            </div>

            {userFormData.authorisedPersons.length > 0 ? (
              <div className="d-flex flex-column gap-4 mt-3">
                {userFormData.authorisedPersons.map((person, index) =>
                  renderAuthorizedPersonDetails(
                    person,
                    `Authorized Person ${index + 1}`,
                  ),
                )}
              </div>
            ) : (
              <p className="mb-0 text-muted">No authorized persons available.</p>
            )}
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap titleMainWrapper">
            <h2 className="txt-24 mb-1">Uploaded Documents</h2>
            {!isImpersonate &&
              <div>
                <Button
                  className="btn btn-orange"
                  onClick={() => setShowInstituteDocumentDialog(true)}
                >
                  <i className="bi bi-upload me-2" />
                  Upload Document
                </Button>
              </div>
            }
          </div>

          {instituteDetail?.agreements?.length ? (
            <div className="row g-3 mt-1">
              {instituteDetail.agreements.map(renderDocumentCard)}
            </div>
          ) : (
            <p className="mb-0 text-muted">
              No documents uploaded for this institute yet.
            </p>
          )}
        </div>

        <div className="col-12 mb-4">
          <div className="titleMainWrapper">
            <h2 className="txt-24 mb-1">Institute Branches</h2>
          </div>
          {branchRecords.length > 0 ? (
            <div className="d-flex flex-column gap-4 mt-3">
              {branchRecords.map(renderBranchCard)}
            </div>
          ) : (
            <p className="mb-0 text-muted">
              No branches added for this institute yet.
            </p>
          )}
        </div>

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

      <Dialog
        visible={showInstituteDocumentDialog}
        header="Upload Institute Document"
        modal
        onHide={() => setShowInstituteDocumentDialog(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "760px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100"
              onClick={() => setShowInstituteDocumentDialog(false)}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              className="btn btn-orange w-100"
              onClick={handleUploadInstituteDocument}
              disabled={loading}
            >
              Upload
            </Button>
          </div>
        }
      >
        <Loader isLoading={loading} />

        <div className="modal-content">
          <div
            className="modal-body"
            style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" }}
          >
            <div className="row">
              <div className="form-group col-12 mb-3">
                <label className="form-label small" htmlFor="documentType">
                  Document Type <sup>*</sup>
                </label>
                <Dropdown
                  id="documentType"
                  value={uploadDocumentForm.documentType}
                  onChange={(e) =>
                    handleInstituteDocumentFieldChange("documentType", e.value)
                  }
                  options={instituteDocumentTypeOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                />
                {uploadDocumentErrors.documentType && (
                  <small className="error">{uploadDocumentErrors.documentType}</small>
                )}
              </div>

              <div className="col-12 mb-4">
                <label className="form-label small" htmlFor="documentFile">
                  Upload PDF <sup>*</sup>
                </label>
                <small className="text-muted d-block mb-2">Only PDF file up to {MAX_FILE_UPLOAD_NOTE}.</small>
                <div
                  style={{
                    border: "1px dashed #b8bec9",
                    borderRadius: "14px",
                    padding: "28px 20px",
                    textAlign: "center",
                    backgroundColor: "#fbfcfe",
                  }}
                >
                  <div style={{ fontSize: "38px", lineHeight: 1, color: "#5f6f8a" }}>
                    <i className="bi bi-cloud-arrow-up" />
                  </div>
                  <p
                    className="mb-3"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#58657d",
                    }}
                  >
                    Upload institute document in PDF format only
                  </p>
                  <input
                    key={documentFileInputKey}
                    id="documentFile"
                    type="file"
                    accept={PDF_FILE_ACCEPT}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleInstituteDocumentFieldChange(
                        "file",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                  <Button
                    type="button"
                    className="btn btn-black-line"
                    onClick={() => document.getElementById("documentFile")?.click()}
                    label="Upload PDF"
                  />
                  {uploadDocumentForm.file && (
                    <small className="text-muted d-block mt-3">
                      {uploadDocumentForm.file.name}
                    </small>
                  )}
                </div>
                {uploadDocumentErrors.file && (
                  <small className="error">{uploadDocumentErrors.file}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default InstituteProfile;

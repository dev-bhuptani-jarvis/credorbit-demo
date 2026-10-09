import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import Loader from "../../components/Loader";
import { RootState } from "../../store";
import {
  fetchStatesAPI,
  getDataByPincodeAPI,
  getNBFCUserByIdAPI,
  updateNBFCUserAPI,
  uploadEducationalInstituteAgreementAPI,
} from "../../utils/axios/apiServices";
import {
  IGetAllEducationInstitutesDetailedDocuments,
  IGetAllEducationInstitutesDetailedResponse,
  IGetAllEducationInstitutesDetailedResponseData,
  IEducationalInstituteBranchAuthorisedPerson,
} from "../../interface/institutes";
import {
  IFetchStateResponse,
  IFetchStateResponseData,
} from "../../interface/payOuts";
import { APIResponseEntity } from "../../interface/apiResponse";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import {
  formatDate,
  getFileSizeLimitErrorMessage,
  isFileSizeWithinLimit,
  isPdfFile,
  MAX_FILE_UPLOAD_NOTE,
  PDF_FILE_ACCEPT,
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
import { formatMobileNumber } from "../../utils/constants/constant";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";

interface INBFCProfileForm {
  id: string;
  fullName: string;
  tradeName: string;
  panNumber: string;
  emailID: string;
  mobileNumber: string;
  dob: string;
  gstNumber: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  constitutionOfInstitute: string;
  website: string;
  gender: string;
  isActive: boolean;
  authorisedPersons: IEducationalInstituteBranchAuthorisedPerson[];
}

interface INBFCProfileValidation {
  tradeName: string;
  panNumber: string;
  website: string;
  gstNumber: string;
  emailID: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IUploadDocumentForm {
  documentType: string;
  file: File | null;
}

const initialFormData: INBFCProfileForm = {
  id: "",
  fullName: "",
  tradeName: "",
  panNumber: "",
  emailID: "",
  mobileNumber: "",
  dob: "",
  gstNumber: "",
  code: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  constitutionOfInstitute: "",
  website: "",
  gender: "",
  isActive: false,
  authorisedPersons: [],
};

const initialValidation: INBFCProfileValidation = {
  tradeName: "",
  panNumber: "",
  website: "",
  gstNumber: "",
  emailID: "",
  mobileNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
};

const documentTypeOptions = [
  { label: "Agreement", value: "Agreement" },
  { label: "Registration Document", value: "Registration Document" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "PAN", value: "PAN" },
  { label: "Other", value: "Other" },
];

const documentTypeMap: Record<string, DocumentFileTypeForInstitute> = {
  Agreement: DocumentFileTypeForInstitute.AGREEMENT,
  "Registration Document": DocumentFileTypeForInstitute.REGISTRATION_DOCUMENT,
  "GST Certificate": DocumentFileTypeForInstitute.GST_CERTIFICATE,
  PAN: DocumentFileTypeForInstitute.PAN,
  Other: DocumentFileTypeForInstitute.OTHER,
};

const NBFCProfile = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const { userID, whiteLabelSettings } = user;

  const [loading, setLoading] = useState(false);

  const [isEditable, setIsEditable] = useState(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const [formData, setFormData] = useState<INBFCProfileForm>(initialFormData);

  const [initialFormState, setInitialFormState] =
    useState<INBFCProfileForm>(initialFormData);

  const [formErrors, setFormErrors] =
    useState<INBFCProfileValidation>(initialValidation);

  const [stateOptions, setStateOptions] = useState<IFetchStateResponseData[]>(
    [],
  );

  const [nbfcDetail, setNbfcDetail] =
    useState<IGetAllEducationInstitutesDetailedResponseData | null>(null);

  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  const [uploadDocumentForm, setUploadDocumentForm] =
    useState<IUploadDocumentForm>({
      documentType: "",
      file: null,
    });

  const [uploadDocumentErrors, setUploadDocumentErrors] = useState({
    documentType: "",
    file: "",
  });

  const [documentFileInputKey, setDocumentFileInputKey] = useState(0);

  const decryptValueOrFallback = (value?: string | null): string => {
    if (!value) return "";
    const decryptedValue = decryptVAPTData(value);
    return decryptedValue || value;
  };

  const mapDetailToForm = useCallback(
    (
      detail: IGetAllEducationInstitutesDetailedResponseData,
    ): INBFCProfileForm => ({
      id: detail.id,
      fullName: decryptValueOrFallback(detail.fullName),
      tradeName: decryptValueOrFallback(detail.tradeName),
      panNumber: decryptValueOrFallback(detail.panNumber),
      emailID: decryptValueOrFallback(detail.email),
      mobileNumber: decryptValueOrFallback(detail.phoneNumber),
      dob: decryptValueOrFallback(detail.dob),
      gstNumber: decryptValueOrFallback(detail.gstNumber),
      code: detail.code || "",
      address: decryptValueOrFallback(detail.address),
      city: decryptValueOrFallback(detail.city),
      state: decryptValueOrFallback(detail.state),
      zipCode: decryptValueOrFallback(detail.zipCode),
      constitutionOfInstitute: decryptValueOrFallback(
        detail.constitutionOfInstitute,
      ),
      website: decryptValueOrFallback(detail.website),
      gender: decryptValueOrFallback(
        (detail as unknown as { gender?: string }).gender,
      ),
      isActive: detail.isActive,
      authorisedPersons: detail.authorisedPersons || [],
    }),
    [],
  );

  const buildValidationState = (
    nextFormData: INBFCProfileForm,
  ): INBFCProfileValidation => ({
    panNumber:
      IsStringNullEmptyOrUndefined(nextFormData.panNumber.trim()) ||
        PAN_NUMBER_PATTERN.test(nextFormData.panNumber.trim())
        ? ""
        : "Please enter valid PAN number",
    tradeName:
      IsStringNullEmptyOrUndefined(nextFormData.tradeName.trim()) ||
        (TRADE_NAME_PATTERN.test(nextFormData.tradeName.trim()) &&
          nextFormData.tradeName.trim().length >= 2 &&
          nextFormData.tradeName.trim().length <= 100)
        ? ""
        : validationMessages.tradeNameInvalid,
    website:
      IsStringNullEmptyOrUndefined(nextFormData.website.trim()) ||
        WEBSITE_PATTERN.test(nextFormData.website.trim())
        ? ""
        : validationMessages.websiteInvalid,
    gstNumber:
      IsStringNullEmptyOrUndefined(nextFormData.gstNumber.trim()) ||
        GST_NUMBER_PATTERN.test(nextFormData.gstNumber.trim())
        ? ""
        : "Please enter valid GST number",
    emailID: IsStringNullEmptyOrUndefined(nextFormData.emailID.trim())
      ? validationMessages.emailRequired
      : !/^(?!\.)(?!.*\.\.)(?!.*\.$)(?!.*\.@)[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
        nextFormData.emailID.trim().toLowerCase(),
      )
        ? validationMessages.emailInvalid
        : "",
    mobileNumber: IsStringNullEmptyOrUndefined(nextFormData.mobileNumber.trim())
      ? validationMessages.mobileNumberRequired
      : !INDIAN_MOBILE_NUMBER_PATTERN.test(nextFormData.mobileNumber.trim())
        ? validationMessages.mobileNumberInvalid
        : "",
    address: IsStringNullEmptyOrUndefined(nextFormData.address.trim())
      ? validationMessages.addressRequired
      : "",
    city: IsStringNullEmptyOrUndefined(nextFormData.city.trim())
      ? validationMessages.cityRequired
      : "",
    state: IsStringNullEmptyOrUndefined(nextFormData.state.trim())
      ? validationMessages.stateRequired
      : "",
    zipCode: IsStringNullEmptyOrUndefined(nextFormData.zipCode.trim())
      ? validationMessages.zipCodeRequired
      : nextFormData.zipCode.trim().length !== 6
        ? validationMessages.zipCodeInvalid
        : "",
  });

  const fetchNbfcProfile = useCallback(async (): Promise<void> => {
    if (!userID) return;

    setLoading(true);
    try {
      const response: IGetAllEducationInstitutesDetailedResponse =
        await getNBFCUserByIdAPI(userID);

      if (!response) return;

      if (response.statusCode === 200) {
        setNbfcDetail(response.data);
        const mappedForm = mapDetailToForm(response.data);
        setFormData(mappedForm);
        setInitialFormState(mappedForm);
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  }, [mapDetailToForm, userID]);

  const fetchStatesList = useCallback(async (): Promise<void> => {
    const response: IFetchStateResponse = await fetchStatesAPI();
    if (response?.statusCode === 200) {
      setStateOptions(response.data || []);
    }
  }, []);

  useEffect(() => {
    void fetchNbfcProfile();
    void fetchStatesList();
  }, [fetchNbfcProfile, fetchStatesList]);

  const handleChange = (
    fieldName: keyof INBFCProfileForm,
    value: string,
  ): void => {
    let updatedValue = value;

    if (fieldName === "emailID") {
      updatedValue = value.trim().toLowerCase();
    }

    if (fieldName === "gstNumber") {
      updatedValue = value.toUpperCase().trim();
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: updatedValue,
    }));

    setFormErrors(
      buildValidationState({
        ...formData,
        [fieldName]: updatedValue,
      }),
    );
  };

  const handlePinCode = async (value: string): Promise<void> => {
    setFormData((prev) => ({
      ...prev,
      zipCode: value,
    }));

    if (value.length !== 6) return;

    setLoading(true);
    try {
      const response = await getDataByPincodeAPI({ pincode: Number(value) });

      if (response?.statusCode === 200) {
        setFormData((prev) => ({
          ...prev,
          city: response.data.circle || prev.city,
          state: response.data.state || prev.state,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setFormData(initialFormState);
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

  const handleDocumentFieldChange = (
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

  const handleUploadDocument = async (): Promise<void> => {
    const nextErrors = {
      documentType: uploadDocumentForm.documentType
        ? ""
        : "Please select document type",
      file: uploadDocumentForm.file ? "" : "Please upload PDF file",
    };

    setUploadDocumentErrors(nextErrors);

    if (
      nextErrors.documentType ||
      nextErrors.file ||
      !uploadDocumentForm.file
    ) {
      return;
    }

    if (!isFileSizeWithinLimit(uploadDocumentForm.file)) {
      setUploadDocumentErrors((prev) => ({
        ...prev,
        file: getFileSizeLimitErrorMessage("File"),
      }));
      return;
    }

    const documentType = documentTypeMap[uploadDocumentForm.documentType];

    if (!documentType) {
      toastError("Invalid document type selected.");
      return;
    }

    setLoading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("documentFile", uploadDocumentForm.file);
      uploadFormData.append("instituteID", userID || "");
      uploadFormData.append("documentType", String(documentType));

      const response =
        await uploadEducationalInstituteAgreementAPI(uploadFormData);

      if (response?.statusCode === 200) {
        toastSuccess(response.message);
        setShowDocumentDialog(false);
        setUploadDocumentForm({ documentType: "", file: null });
        setUploadDocumentErrors({ documentType: "", file: "" });
        setDocumentFileInputKey((prev) => prev + 1);
        await fetchNbfcProfile();
      } else if (response) {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    setIsFormSubmitted(true);
    const nextErrors = buildValidationState(formData);
    setFormErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);

    const payload: {
      id: string;
      emailID: string;
      mobileNumber: string;
      panNumber: string;
      tradeName: string | null;
      fullName: string;
      firstName: string;
      middleName: string;
      lastName: string;
      category: string;
      address: string | null;
      state: string | null;
      city: string | null;
      zipCode: string | null;
      gender: string | null;
      dob: string | null;
      constitutionOfInstitute: string;
      authorisedPersons: unknown;
    } = {
      id: formData.id,
      emailID: encryptVAPTData(formData.emailID.trim().toLowerCase()),
      mobileNumber: encryptVAPTData(formData.mobileNumber.trim()),
      panNumber: encryptVAPTData(formData.panNumber),
      tradeName: formData.tradeName
        ? encryptVAPTData(formData.tradeName.trim())
        : null,
      fullName: formData.fullName,
      firstName: formData.fullName,
      middleName: "",
      lastName: "",
      category: formData.constitutionOfInstitute || "",
      address: formData.address
        ? encryptVAPTData(formData.address.trim())
        : null,
      state: formData.state ? encryptVAPTData(formData.state.trim()) : null,
      city: formData.city ? encryptVAPTData(formData.city.trim()) : null,
      zipCode: formData.zipCode
        ? encryptVAPTData(formData.zipCode.trim())
        : null,
      dob: formData.dob ? encryptVAPTData(formData.dob) : null,
      gender: formData.gender || null,
      constitutionOfInstitute: formData.constitutionOfInstitute || "",
      authorisedPersons:
        nbfcDetail?.authorisedPersons || formData.authorisedPersons,
    };

    try {
      const response: APIResponseEntity = await updateNBFCUserAPI(payload);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        await fetchNbfcProfile();
        setIsEditable(false);
        setIsFormSubmitted(false);
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
              ? formatDate(
                decryptValueOrFallback(person.dateOfBirth),
                "DD MMM, YYYY",
              )
              : "-"}
          </p>
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
            {person.emailAddress
              ? decryptValueOrFallback(person.emailAddress)
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Constitution</b>
          <p className="text-break">
            {decryptValueOrFallback(person.constitution) || "-"}
          </p>
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
    <div
      key={`${documentData.fileUrl}-${index}`}
      className="document-card profile-document-card"
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h5 className="mb-0">{documentData.type || `Document ${index + 1}`}</h5>
      </div>

      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-12 col-12 mb-4">
          <b>Document Type</b>
          <p className="text-break mb-0">{documentData.type || "-"}</p>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 col-12 mb-4">
          <b>Uploaded Date</b>
          <p className="text-break mb-0">
            {formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}
          </p>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-12 col-12 mb-4">
          <b>Action</b>
          <p className="mt-1 mb-0">
            {documentData.fileUrl ? (
              <a href={documentData.fileUrl} target="_blank" rel="noreferrer" className="text-primary fw-semibold">
                View Document
              </a>
            ) : "Not uploaded"}
          </p>
        </div>
        <div className="col-12 mb-0">
          <b>File</b>
          <p className="text-break mb-0">
            {documentData.fileUrl ? "Document uploaded" : "-"}
          </p>
        </div>
      </div>
    </div>
  );

  const selectedStateOption =
    stateOptions.find((option) => option.name === formData.state) || null;

  return (
    <>
      <div className="row">
        <Loader isLoading={loading} />

        <div className="col-12 mb-4">
          <div className="titleMainWrapper">
            <h2>Lender Profile</h2>

            {!isEditable && (
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
            <label className="form-label">Lender Name</label>
            <InputText
              className="form-control"
              value={formData.fullName}
              disabled={!isEditable || Boolean(initialFormState.fullName)}
              placeholder="Lender name"
              onChange={(event) => handleChange("fullName", event.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Lender Code</label>
            <InputText
              className="form-control"
              value={formData.code}
              disabled
              placeholder="Lender code"
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Constitution</label>
            <InputText
              className="form-control"
              value={formData.constitutionOfInstitute}
              disabled={!isEditable || Boolean(initialFormState.constitutionOfInstitute)}
              placeholder="Constitution"
              onChange={(event) => handleChange("constitutionOfInstitute", event.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">PAN Number</label>
            <InputText
              className="form-control"
              value={formData.panNumber}
              disabled={!isEditable || Boolean(initialFormState.panNumber)}
              placeholder="PAN number"
            onChange={(event) => handleChange("panNumber", event.target.value.toUpperCase())}
          />
            {formErrors.panNumber && <small className="error">{formErrors.panNumber}</small>}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">GST Number</label>
            <InputText
              className="form-control"
              value={formData.gstNumber}
              disabled={!isEditable}
              placeholder="Enter GST number"
              maxLength={15}
              onChange={(event) =>
                handleChange("gstNumber", event.target.value.toUpperCase())
              }
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
              value={formData.tradeName}
              disabled={!isEditable}
              placeholder="Enter trade name"
              maxLength={100}
              onChange={(event) =>
                handleChange("tradeName", event.target.value?.trimStart())
              }
            />
            {formErrors.tradeName && (
              <small className="error">{formErrors.tradeName}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              Email Address <sup>*</sup>
            </label>
            <InputText
              className="form-control"
              value={formData.emailID}
              disabled={!isEditable}
              placeholder="Enter email address"
              onChange={(event) => handleChange("emailID", event.target.value)}
            />
            {isFormSubmitted && formErrors.emailID && (
              <small className="error">{formErrors.emailID}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              Mobile Number <sup>*</sup>
            </label>
            <InputText
              className="form-control"
              value={formData.mobileNumber}
              disabled={!isEditable}
              placeholder="Enter mobile number"
              maxLength={10}
              onKeyPress={(event) => {
                if (!NUMBER_ONLY_PATTERN.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onChange={(event) =>
                handleChange("mobileNumber", event.target.value)
              }
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
              value={formData.website}
              disabled={!isEditable}
              placeholder="Enter website"
              maxLength={255}
              onChange={(event) => handleChange("website", event.target.value)}
            />
            {formErrors.website && (
              <small className="error">{formErrors.website}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Date of Birth / Incorporation</label>
            <div className="position-relative">
              <InputText
                className="form-control"
                value={
                  formData.dob ? formatDate(formData.dob, "DD-MM-YYYY") : ""
                }
                disabled={!isEditable || Boolean(initialFormState.dob)}
                placeholder="Date of incorporation"
                onChange={(event) => handleChange("dob", event.target.value)}
              />
              <i className="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3 secondary-icon" />
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">Gender</label>
            <InputText
              className="form-control"
              value={formData.gender}
              disabled={!isEditable || Boolean(initialFormState.gender)}
              placeholder="Gender"
              onChange={(event) => handleChange("gender", event.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              PIN Code <sup>*</sup>
            </label>
            <InputText
              className="form-control"
              value={formData.zipCode}
              disabled={!isEditable}
              placeholder="Enter PIN code"
              maxLength={6}
              onKeyPress={(event) => {
                if (!NUMBER_ONLY_PATTERN.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onChange={(event) => void handlePinCode(event.target.value)}
            />
            {isFormSubmitted && formErrors.zipCode && (
              <small className="error">{formErrors.zipCode}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              State <sup>*</sup>
            </label>
            <Dropdown
              className="w-100"
              value={selectedStateOption}
              disabled
              options={stateOptions}
              optionLabel="name"
              placeholder="Select state"
              // onChange={(event) =>
              //   setFormData((prev) => ({
              //     ...prev,
              //     state: event.value?.name || "",
              //   }))
              // }
            />
            {isFormSubmitted && formErrors.state && (
              <small className="error">{formErrors.state}</small>
            )}
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              City <sup>*</sup>
            </label>
            <InputText
              className="form-control"
              value={formData.city}
              disabled
              placeholder="Enter city"
              // onChange={(event) => handleChange("city", event.target.value)}
            />
            {isFormSubmitted && formErrors.city && (
              <small className="error">{formErrors.city}</small>
            )}
          </div>
        </div>

        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group mb-4">
            <label className="form-label">
              Address <sup>*</sup>
            </label>
            <InputTextarea
              className="form-control"
              rows={4}
              value={formData.address}
              disabled={!isEditable}
              placeholder="Enter address"
              onChange={(event) =>
                handleChange("address", event.target.value.trimStart())
              }
            />
            {isFormSubmitted && formErrors.address && (
              <small className="error">{formErrors.address}</small>
            )}
          </div>
        </div>

        {formData.authorisedPersons.length > 0 && (
          <div className="col-12 mb-4">
            <div className="titleMainWrapper">
              <h2>Authorized Persons</h2>
            </div>

            <div className="d-flex flex-column gap-4 mt-3">
              {formData.authorisedPersons.map((person, index) =>
                renderAuthorizedPersonDetails(
                  person,
                  `Authorized Person ${index + 1}`,
                ),
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

      <Dialog
        visible={showDocumentDialog}
        header="Upload Lender Document"
        modal
        onHide={() => setShowDocumentDialog(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "760px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100"
              onClick={() => setShowDocumentDialog(false)}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              className="btn btn-orange w-100"
              onClick={handleUploadDocument}
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
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="row">
              <div className="form-group col-12 mb-3">
                <label className="form-label small" htmlFor="nbfcDocumentType">
                  Document Type <sup>*</sup>
                </label>
                <Dropdown
                  id="nbfcDocumentType"
                  value={uploadDocumentForm.documentType}
                  onChange={(event) =>
                    handleDocumentFieldChange("documentType", event.value)
                  }
                  options={documentTypeOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                />
                {uploadDocumentErrors.documentType && (
                  <small className="error">
                    {uploadDocumentErrors.documentType}
                  </small>
                )}
              </div>

              <div className="col-12 mb-4">
                <label className="form-label small" htmlFor="nbfcDocumentFile">
                  Upload PDF <sup>*</sup>
                </label>
                <small className="text-muted d-block mb-2">
                  Only PDF file up to {MAX_FILE_UPLOAD_NOTE}.
                </small>
                <div
                  style={{
                    border: "1px dashed #b8bec9",
                    borderRadius: "14px",
                    padding: "28px 20px",
                    textAlign: "center",
                    backgroundColor: "#fbfcfe",
                  }}
                >
                  <div
                    style={{
                      fontSize: "38px",
                      lineHeight: 1,
                      color: "#5f6f8a",
                    }}
                  >
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
                    Upload Lender document in PDF format only
                  </p>
                  <input
                    key={documentFileInputKey}
                    id="nbfcDocumentFile"
                    type="file"
                    accept={PDF_FILE_ACCEPT}
                    style={{ display: "none" }}
                    onChange={(event) =>
                      handleDocumentFieldChange(
                        "file",
                        event.target.files?.[0] || null,
                      )
                    }
                  />
                  <Button
                    type="button"
                    className="btn btn-black-line"
                    onClick={() =>
                      document.getElementById("nbfcDocumentFile")?.click()
                    }
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

export default NBFCProfile;

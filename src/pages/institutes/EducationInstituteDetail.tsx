import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatMobileNumber, RouteParams } from '../../utils/constants/constant';
import BackButton from '../../components/BackButton';
import Loader from '../../components/Loader';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import {
  activeInactiveEducationalInstituteAPI,
  createEducationalInstituteBranchAPI,
  deleteEducationalInstituteBranchAPI,
  fetchDetailsByPan,
  fetchStatesAPI,
  getEducationInstituteByIdAPI,
  getEducationalInstituteBranchDetailsAPI,
  getEducationalInstituteBranchesAPI,
  setEducationalInstitutePaymentBranchAPI,
  uploadEducationalInstituteAgreementAPI,
  updateEducationalInstituteBranchAPI,
} from '../../utils/axios/apiServices';
import { formatDate, getFileSizeLimitErrorMessage, isFileSizeWithinLimit, isPdfFile, MAX_FILE_UPLOAD_NOTE, PDF_FILE_ACCEPT, restrictInputByPattern, toastError, toastSuccess } from '../../utils/functions/shared';
import {
  IEducationalInstituteBranch,
  IEducationalInstituteBranchAuthorisedPerson,
  IGetAllEducationInstitutesDetailedBranches,
  IGetAllEducationInstitutesDetailedDocuments,
  IGetAllEducationInstitutesDetailedResponseData,
} from '../../interface/institutes';
import { IAddPanCardResponse, IConfirmDetail, OnlyPanNumber } from '../../interface/panCardResponse';
import { validationMessages } from '../../utils/constants/messages';
import { IFetchStateResponse, IFetchStateResponseData } from '../../interface/payOuts';
import { AADHAR_CARD_PATTERN, ACCOUNT_HOLDER_NAME_PATTERN, ADDRESS_PATTERN, BANK_ACCOUNT_NUMBER_ONLY_PATTERN, BANK_NAME_PATTERN, BRANCH_NAME_PATTERN, CITY_NAME_PATTERN, EMAIL_PATTERN, GST_NUMBER_PATTERN, IFSC_CODE_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN, NUMBER_ONLY_PATTERN, PAN_NUMBER_PATTERN } from '../../utils/constants/pattern';
import { decryptVAPTData, encryptVAPTData } from '../../utils/functions/encryptDecrypt';
import { DocumentFileTypeForInstitute } from '../../utils/constants/enum';

interface IBranchAuthorizedPersonForm {
  id: string;
  name: string;
  constitution: string;
  dob: string;
  gender: string;
  gstDetails: string;
  mobileNumber: string;
  emailAddress: string;
  panNumber?: string;
  address?: string;
  profilePhotoPath?: string;
}

interface IBranchForm {
  branchName: string;
  branchState: IFetchStateResponseData | null;
  city: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  branchAddress: string;
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  authorizedPersons: IBranchAuthorizedPersonForm[];
}

interface IBranchFormErrors {
  branchName: string;
  branchState: string;
  city: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  branchAddress: string;
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  authorizedPersons: Record<string, Omit<IBranchAuthorizedPersonForm, 'id'>>;
}

interface IBranchAuthorizedPersonPayload {
  name: string;
  dateOfBirth: string;
  panNumber: string;
  address: string;
  gender: string;
  constitution: string;
  mobileNumber: string;
  emailAddress: string;
}

interface IBranchAuthorizedPersonDetailErrors {
  emailID: string;
  mobileNumber: string;
  gstNumber: string;
  address: string;
}

const initialBranchAuthorizedPersonDetailErrors: IBranchAuthorizedPersonDetailErrors = {
  emailID: "",
  mobileNumber: "",
  gstNumber: "",
  address: "",
};

interface IBranchPayload {
  id?: string;
  instituteID: string;
  branchName: string;
  panNumber: string;
  aadharNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isBillingBranch: boolean;
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  contactPersonName: string;
  mobileNumber: string;
  emailAddress: string;
  gstNumber: string;
  isActive: boolean;
  authorisedPersons: IBranchAuthorizedPersonPayload[];
}

interface IInstituteUploadDocumentForm {
  documentType: string;
  file: File | null;
}

interface IBranchStoredDocument extends IGetAllEducationInstitutesDetailedDocuments {
  fileName?: string;
}

interface IBranchStoredData extends IGetAllEducationInstitutesDetailedBranches {
  branchStateOption: IFetchStateResponseData | null;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  branchAddress: string;
  country: string;
  isBillingBranch: boolean;
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  authorizedPersons: IBranchAuthorizedPersonForm[];
  documents: IBranchStoredDocument[];
}

type TBranchDialogMode = "add" | "view" | "edit";

const initialBranchAuthorizedPersonDetail: IConfirmDetail = {
  panNumber: "",
  emailID: "",
  mobileNumber: "",
  fullName: "",
  category: "",
  gstNumber: "",
  constitutionOfInstitute: "",
  constitution: "",
  website: "",
  dob: "",
  address: "",
  state: "",
  city: "",
  zipCode: "",
  maskedAadhaar: "",
  gender: "",
  firstName: "",
  middleName: "",
  lastName: "",
};

const initialBranchForm: IBranchForm = {
  branchName: "",
  branchState: null,
  city: "",
  panNumber: "",
  aadharNumber: "",
  gstNumber: "",
  branchAddress: "",
  accountHolderName: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  authorizedPersons: [],
};

const createAuthorizedPersonErrors = (): Omit<IBranchAuthorizedPersonForm, 'id'> => ({
  name: "",
  constitution: "",
  dob: "",
  gender: "",
  gstDetails: "",
  mobileNumber: "",
  emailAddress: "",
});

const createInitialBranchErrors = (): IBranchFormErrors => ({
  branchName: "",
  branchState: "",
  city: "",
  panNumber: "",
  aadharNumber: "",
  gstNumber: "",
  branchAddress: "",
  accountHolderName: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  authorizedPersons: {},
});

const documentTypeOptions = [
  { label: "Agreement", value: "Agreement" },
  { label: "Registration Document", value: "Registration Document" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "PAN", value: "PAN" },
  { label: "Other", value: "Other" },
];

const branchDocumentTypeOptions = [
  { label: "PAN", value: "PAN" },
  { label: "Aadhar", value: "Aadhar" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "Cancellation Cheque", value: "Cancellation Cheque" },
  { label: "Bank Proof", value: "Bank Proof" },
  { label: "Other", value: "Other" },
];

const instituteDocumentTypeMap: Record<string, DocumentFileTypeForInstitute> = {
  Agreement: DocumentFileTypeForInstitute.AGREEMENT,
  "Registration Document": DocumentFileTypeForInstitute.REGISTRATION_DOCUMENT,
  "GST Certificate": DocumentFileTypeForInstitute.GST_CERTIFICATE,
  PAN: DocumentFileTypeForInstitute.PAN,
  Other: DocumentFileTypeForInstitute.OTHER,
};

const EducationInstituteDetail = () => {
  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);

  const [instituteDetail, setInstituteDetail] = useState<IGetAllEducationInstitutesDetailedResponseData | null>(null);

  const [showInstituteDocumentDialog, setShowInstituteDocumentDialog] =
    useState<boolean>(false);

  const [showAddBranchDialog, setShowAddBranchDialog] = useState<boolean>(false);

  const [showBranchDocumentDialog, setShowBranchDocumentDialog] =
    useState<boolean>(false);

  const [showBranchAuthorizedPersonPanDialog, setShowBranchAuthorizedPersonPanDialog] =
    useState<boolean>(false);

  const [showBranchAuthorizedPersonConfirmDialog, setShowBranchAuthorizedPersonConfirmDialog] =
    useState<boolean>(false);

  const [stateOptions, setStateOptions] = useState<IFetchStateResponseData[]>([]);

  const [branchForm, setBranchForm] = useState<IBranchForm>(initialBranchForm);

  const [branchErrors, setBranchErrors] = useState<IBranchFormErrors>(createInitialBranchErrors());

  const [authorizedPersonListError, setAuthorizedPersonListError] = useState<string>("");

  const [isBranchFormSubmitted, setIsBranchFormSubmitted] = useState<boolean>(false);

  const [branchDialogMode, setBranchDialogMode] = useState<TBranchDialogMode>("add");

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const [branchPendingDeletion, setBranchPendingDeletion] =
    useState<IGetAllEducationInstitutesDetailedBranches | null>(null);

  const [selectedBranchForUpload, setSelectedBranchForUpload] = useState<IBranchStoredData | null>(null);

  const [branchRecords, setBranchRecords] = useState<IBranchStoredData[]>([]);

  const [uploadDocumentForm, setUploadDocumentForm] = useState<IInstituteUploadDocumentForm>({
    documentType: "",
    file: null,
  });

  const [uploadDocumentErrors, setUploadDocumentErrors] = useState<{ documentType: string; file: string }>({
    documentType: "",
    file: "",
  });

  const [documentFileInputKey, setDocumentFileInputKey] = useState<number>(0);

  const [branchUploadDocumentForm, setBranchUploadDocumentForm] = useState<IInstituteUploadDocumentForm>({
    documentType: "",
    file: null,
  });

  const [branchUploadDocumentErrors, setBranchUploadDocumentErrors] = useState<{ documentType: string; file: string }>({
    documentType: "",
    file: "",
  });

  const [branchDocumentFileInputKey, setBranchDocumentFileInputKey] = useState<number>(0);

  const [branchAuthorizedPersonFormValues, setBranchAuthorizedPersonFormValues] = useState<OnlyPanNumber>({
    panNumber: "",
  });

  const [branchAuthorizedPersonFormErrors, setBranchAuthorizedPersonFormErrors] = useState<OnlyPanNumber>({
    panNumber: "",
  });

  const [branchAuthorizedPersonDetail, setBranchAuthorizedPersonDetail] =
    useState<IConfirmDetail>(initialBranchAuthorizedPersonDetail);

  const [editingBranchAuthorizedPersonId, setEditingBranchAuthorizedPersonId] =
    useState<string | null>(null);

  const [branchAuthorizedPersonDetailErrors, setBranchAuthorizedPersonDetailErrors] =
    useState<IBranchAuthorizedPersonDetailErrors>(initialBranchAuthorizedPersonDetailErrors);

  const [isBranchAuthorizedPersonFormSubmitted, setIsBranchAuthorizedPersonFormSubmitted] =
    useState<boolean>(false);

  const [isBranchAuthorizedPersonEmailLocked, setIsBranchAuthorizedPersonEmailLocked] =
    useState<boolean>(false);

  const [isBranchAuthorizedPersonMobileLocked, setIsBranchAuthorizedPersonMobileLocked] =
    useState<boolean>(false);

  const [isBranchAuthorizedPersonGSTLocked, setIsBranchAuthorizedPersonGSTLocked] =
    useState<boolean>(false);

  const isBranchDialogReadOnly = branchDialogMode === "view";

  const getStateOptionByName = (stateName: string): IFetchStateResponseData | null =>
    stateOptions.find((stateOption) => stateOption.name === stateName) || null;

  const decryptValueOrFallback = (value?: string | null): string => {
    if (!value) {
      return "";
    }

    const decryptedValue = decryptVAPTData(value);
    return decryptedValue || value;
  };

  const normalizeGenderValue = (value?: string | number | null): string => {
    const normalizedValue = String(value || "")
      .trim()
      .toLowerCase();

    if (normalizedValue === "1" || normalizedValue === "male") return "Male";
    if (normalizedValue === "2" || normalizedValue === "female") return "Female";
    if (normalizedValue === "3" || normalizedValue === "other") return "Other";
    return "";
  };

  const getDecryptedPanDetails = (data: IAddPanCardResponse["data"]): IConfirmDetail => {
    const decryptedGstDetails = data.gstNumber?.map((gstDetail) => ({
      ...gstDetail,
      gstin: gstDetail.gstin ? decryptVAPTData(gstDetail.gstin) : "",
      state: gstDetail.state ? decryptVAPTData(gstDetail.state) : "",
    })) || null;

    const primaryGstDetail = decryptedGstDetails?.[0] || null;

    return {
      ...initialBranchAuthorizedPersonDetail,
      ...data,
      emailID: data.emailID || "",
      mobileNumber: data.mobileNumber || "",
      panNumber: data.panNumber ? decryptVAPTData(data.panNumber) : "",
      gstNumber: primaryGstDetail?.gstin || "",
      gstDetails: decryptedGstDetails,
      dob: data.dob ? decryptVAPTData(data.dob) : "",
      address: data.address ? decryptVAPTData(data.address) : "",
      state: data.state
        ? decryptVAPTData(data.state)
        : primaryGstDetail?.state || "",
      city: data.city ? decryptVAPTData(data.city) : "",
      zipCode: data.zipCode ? decryptVAPTData(data.zipCode) : "",
      gender: normalizeGenderValue(data.gender),
    };
  };

  const openFileLink = (filePath?: string | null): void => {
    if (filePath && typeof window !== "undefined") {
      window.open(filePath, "_blank", "noopener,noreferrer");
      return;
    }

    toastError(validationMessages.filePathMissing);
  };

  const renderAuthorizedPersonDocumentLink = (
    filePath?: string | null,
    label?: string,
    isImage?: boolean,
  ): JSX.Element => {
    if (!filePath) {
      return <span className="text-muted">Not uploaded</span>;
    }

    return (
      <p className="text-break mt-1">
        {filePath ? (
          <button
            type="button"
            className="nbfc-student-application-detail__link-button"
            onClick={() => openFileLink(filePath)}
          >
            View Document
          </button>
        ) : (
          "Not uploaded"
        )}
      </p>
    );
  };

  const renderAuthorizedPersonDetails = (
    person: IEducationalInstituteBranchAuthorisedPerson,
    sectionTitle: string,
  ): JSX.Element => (
    <div className="borderBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h5 className="mb-0">{sectionTitle}</h5>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Name</b>
          <p className="text-break">{person.name || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">{person.panNumber ? decryptVAPTData(person.panNumber) : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {person.dateOfBirth ? formatDate(decryptVAPTData(person.dateOfBirth), "DD MMM, YYYY") : "-"}
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
          <p className="text-break">{person.mobileNumber ? formatMobileNumber(decryptVAPTData(person.mobileNumber)) : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">{person.emailAddress ? decryptVAPTData(person.emailAddress) : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Constitution</b>
          <p className="text-break">{person.constitution || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Profile Photo</b>
          <p className="text-break mt-1">{renderAuthorizedPersonDocumentLink(person.profilePhotoPath, `Profile Image`, true)}</p>
        </div>
        <div className="col-12 mb-4">
          <b>Address</b>
          <p className="text-break">{person.address ? decryptVAPTData(person.address) : "-"}</p>
        </div>
      </div>
    </div>
  );

  const mapAuthorizedPersonsFromApi = (
    authorisedPersons?: IEducationalInstituteBranchAuthorisedPerson[]
  ): IBranchAuthorizedPersonForm[] => {
    if (!authorisedPersons?.length) {
      return [];
    }

    return authorisedPersons.map((person, index) => ({
      id: person.id || `authorized-person-${Date.now()}-${index + 1}`,
      name: person.name || "",
      constitution: decryptValueOrFallback(person.constitution),
      dob: decryptValueOrFallback(person.dateOfBirth)
        ? decryptValueOrFallback(person.dateOfBirth).split("T")[0]
        : "",
      gender: normalizeGenderValue(person.gender),
      gstDetails: "",
      mobileNumber: decryptValueOrFallback(person.mobileNumber),
      emailAddress: decryptValueOrFallback(person.emailAddress),
      panNumber: decryptValueOrFallback(person.panNumber),
      address: decryptValueOrFallback(person.address),
      profilePhotoPath: person.profilePhotoPath || "",
    }));
  };

  const createBranchRecord = (
    branchData: IGetAllEducationInstitutesDetailedBranches | IEducationalInstituteBranch,
    existingRecord?: IBranchStoredData
  ): IBranchStoredData => {
    const mappedAuthorizedPersons =
      "authorisedPersons" in branchData && branchData.authorisedPersons?.length
        ? mapAuthorizedPersonsFromApi(branchData.authorisedPersons)
        : undefined;

    return {
      id: branchData.id,
      branchCode: branchData.branchCode || existingRecord?.branchCode || "",
      branchName: branchData.branchName || existingRecord?.branchName || "",
      contactPerson:
        ("contactPersonName" in branchData ? branchData.contactPersonName : undefined) ||
        ("contactPerson" in branchData ? branchData.contactPerson : undefined) ||
        existingRecord?.contactPerson ||
        "",
      mobileNumber: decryptValueOrFallback(branchData.mobileNumber) || existingRecord?.mobileNumber || "",
      isPaymentBranch:
        ("isPaymentBranch" in branchData && typeof branchData.isPaymentBranch === "boolean"
          ? branchData.isPaymentBranch
          : undefined) ??
        ("isBillingBranch" in branchData && typeof branchData.isBillingBranch === "boolean"
          ? branchData.isBillingBranch
          : undefined) ??
        existingRecord?.isPaymentBranch ??
        false,
      city: decryptValueOrFallback(branchData.city) || existingRecord?.city || "",
      state: decryptValueOrFallback(branchData.state) || existingRecord?.state || "",
      isActive:
        ("isActive" in branchData && typeof branchData.isActive === "boolean"
          ? branchData.isActive
          : undefined) ??
        existingRecord?.isActive ??
        true,
      branchStateOption:
        existingRecord?.branchStateOption ||
        getStateOptionByName(branchData.state || "") ||
        null,
      panNumber:
        ("panNumber" in branchData ? decryptValueOrFallback(branchData.panNumber) : "") ||
        existingRecord?.panNumber ||
        "",
      aadharNumber:
        ("aadharNumber" in branchData ? decryptValueOrFallback(branchData.aadharNumber) : "") ||
        existingRecord?.aadharNumber ||
        "",
      gstNumber:
        ("gstNumber" in branchData ? decryptValueOrFallback(branchData.gstNumber) : "") ||
        existingRecord?.gstNumber ||
        "",
      branchAddress:
        ("address" in branchData ? decryptValueOrFallback(branchData.address) : "") ||
        existingRecord?.branchAddress ||
        "",
      country:
        ("country" in branchData ? branchData.country || "" : "") ||
        existingRecord?.country ||
        "India",
      isBillingBranch:
        ("isBillingBranch" in branchData && typeof branchData.isBillingBranch === "boolean"
          ? branchData.isBillingBranch
          : undefined) ??
        existingRecord?.isBillingBranch ??
        false,
      accountHolderName:
        ("accountHolderName" in branchData ? decryptValueOrFallback(branchData.accountHolderName) : "") ||
        existingRecord?.accountHolderName ||
        "",
      bankName:
        ("bankName" in branchData ? decryptValueOrFallback(branchData.bankName) : "") ||
        existingRecord?.bankName ||
        "",
      accountNo:
        ("accountNo" in branchData
          ? decryptValueOrFallback(branchData.accountNo)
          : "") ||
        existingRecord?.accountNo ||
        "",
      ifscCode:
        ("ifscCode" in branchData ? decryptValueOrFallback(branchData.ifscCode) : "") ||
        existingRecord?.ifscCode ||
        "",
      authorizedPersons:
        mappedAuthorizedPersons ||
        (existingRecord?.authorizedPersons?.length
          ? existingRecord.authorizedPersons
          : []),
      documents: existingRecord?.documents || [],
    };
  };

  const mapBranchRecordToForm = (branchData: IBranchStoredData): IBranchForm => ({
    branchName: branchData.branchName || "",
    branchState: branchData.branchStateOption || getStateOptionByName(branchData.state),
    city: branchData.city || "",
    panNumber: branchData.panNumber || "",
    aadharNumber: branchData.aadharNumber || "",
    gstNumber: branchData.gstNumber || "",
    branchAddress: branchData.branchAddress || "",
    accountHolderName: branchData.accountHolderName || "",
    bankName: branchData.bankName || "",
    accountNo: branchData.accountNo || "",
    ifscCode: branchData.ifscCode || "",
    authorizedPersons: branchData.authorizedPersons?.length
      ? branchData.authorizedPersons
      : [],
  });

  const resetBranchFormState = (): void => {
    setBranchForm({
      ...initialBranchForm,
      authorizedPersons: [],
    });
    setBranchErrors({
      ...createInitialBranchErrors(),
      authorizedPersons: {},
    });
    setAuthorizedPersonListError("");
    setIsBranchFormSubmitted(false);
    setSelectedBranchId(null);
    setBranchDialogMode("add");
    setShowBranchAuthorizedPersonPanDialog(false);
    setShowBranchAuthorizedPersonConfirmDialog(false);
    setBranchAuthorizedPersonFormValues({ panNumber: "" });
    setBranchAuthorizedPersonFormErrors({ panNumber: "" });
    setBranchAuthorizedPersonDetail(initialBranchAuthorizedPersonDetail);
    setBranchAuthorizedPersonDetailErrors(initialBranchAuthorizedPersonDetailErrors);
    setIsBranchAuthorizedPersonFormSubmitted(false);
    setIsBranchAuthorizedPersonEmailLocked(false);
    setIsBranchAuthorizedPersonMobileLocked(false);
  };

  const getEducationInstituteById = async (instituteId: string): Promise<void> => {
    const response = await getEducationInstituteByIdAPI(instituteId);

    if (!response) return;

    if (response.statusCode === 200) {
      setInstituteDetail(response.data);
    }
  };

  const fetchBranchList = async (showLoader: boolean = true): Promise<void> => {
    if (!id) return;

    if (showLoader) setLoading(true);

    const response = await getEducationalInstituteBranchesAPI({
      instituteID: id,
    });

    if (response?.statusCode === 200) {
      const branchList =
        response.data?.educationalInstituteBranches ||
        response.data?.educationalInstituteBranchList ||
        response.data?.branches ||
        [];

      setBranchRecords((prev) =>
        branchList.map((branch) => {
          const existingRecord = prev.find((record) => record.id === branch.id);
          return createBranchRecord(branch, existingRecord);
        })
      );
    }

    if (showLoader) setLoading(false);
  };

  const fetchBranchDetails = async (branchId: string): Promise<IBranchStoredData | null> => {
    const response = await getEducationalInstituteBranchDetailsAPI(branchId);

    if (!response || response.statusCode !== 200) {
      return null;
    }

    const existingRecord = branchRecords.find((branch) => branch.id === branchId);
    const branchRecord = createBranchRecord(response.data, existingRecord);

    setBranchRecords((prev) => {
      const existingIndex = prev.findIndex((branch) => branch.id === branchId);

      if (existingIndex === -1) {
        return [branchRecord, ...prev];
      }

      return prev.map((branch) => (branch.id === branchId ? branchRecord : branch));
    });

    return branchRecord;
  };

  const openBranchDialog = (mode: TBranchDialogMode, branchRecord: IBranchStoredData): void => {
    setBranchDialogMode(mode);
    setSelectedBranchId(branchRecord.id);
    setBranchForm(mapBranchRecordToForm(branchRecord));
    setBranchErrors(createInitialBranchErrors());
    setIsBranchFormSubmitted(false);
    setShowAddBranchDialog(true);
  };

  const buildBranchPayload = (branchId?: string): IBranchPayload => {
    const primaryAuthorizedPerson = branchForm.authorizedPersons[0];
    const existingBranch = branchRecords.find((branch) => branch.id === branchId);

    return {
      ...(branchId ? { ID: branchId } : {}),
      instituteID: id || "",
      branchName: branchForm.branchName.trim(),
      panNumber: encryptVAPTData(branchForm.panNumber.trim()),
      aadharNumber: encryptVAPTData(branchForm.aadharNumber.trim()),
      address: encryptVAPTData(branchForm.branchAddress.trim()),
      city: encryptVAPTData(branchForm.city.trim()),
      state: encryptVAPTData(branchForm.branchState?.name || ""),
      country: existingBranch?.country || "India",
      isBillingBranch: existingBranch?.isBillingBranch || false,
      accountHolderName: encryptVAPTData(branchForm.accountHolderName.trim()),
      bankName: encryptVAPTData(branchForm.bankName.trim()),
      accountNo: encryptVAPTData(branchForm.accountNo.trim()),
      ifscCode: encryptVAPTData(branchForm.ifscCode.trim()),
      contactPersonName: primaryAuthorizedPerson?.name?.trim() || "",
      mobileNumber: encryptVAPTData(primaryAuthorizedPerson?.mobileNumber?.trim() || ""),
      emailAddress: encryptVAPTData(primaryAuthorizedPerson?.emailAddress?.trim() || ""),
      gstNumber: branchForm.gstNumber.trim()
        ? encryptVAPTData(branchForm.gstNumber.trim())
        : "",
      isActive: existingBranch?.isActive ?? true,
      authorisedPersons: branchForm.authorizedPersons.map((person) => ({
        name: person.name.trim(),
        dateOfBirth: encryptVAPTData(person.dob),
        panNumber: encryptVAPTData(person.panNumber?.trim() || ""),
        address: encryptVAPTData(person.address?.trim() || ""),
        gender: person.gender.trim().toLowerCase(),
        constitution: encryptVAPTData(person.constitution.trim()),
        mobileNumber: encryptVAPTData(person.mobileNumber.trim()),
        emailAddress: encryptVAPTData(person.emailAddress.trim()),
        gstNumber: person.gstDetails
          ? encryptVAPTData(person.gstDetails.trim())
          : undefined,
      })),
    };
  };

  const getStatesList = async (): Promise<void> => {
    const response: IFetchStateResponse = await fetchStatesAPI();

    if (!response) return;

    if (response.statusCode === 200) {
      setStateOptions(response.data || []);
    }
  };

  const handleStatusChange = async (checked: boolean): Promise<void> => {
    if (!id) {
      toastError("Institute ID is missing.");
      return;
    }

    const previousIsActive = !!instituteDetail?.isActive;

    setInstituteDetail((prev: any) => ({
      ...prev,
      isActive: checked,
    }));

    setLoading(true);

    const body = {
      instituteID: id,
      isActive: checked,
    }

    const response = await activeInactiveEducationalInstituteAPI(body);

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      await getEducationInstituteById(id);
    } else {
      setInstituteDetail((prev: any) => ({
        ...prev,
        isActive: previousIsActive,
      }));
      toastError(response?.message);
    }

    setLoading(false);
  };

  const openDocument = (documentData: IGetAllEducationInstitutesDetailedDocuments): void => {
    const documentUrl = documentData.fileUrl;

    if (documentUrl && typeof window !== "undefined") {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    toastError(
      validationMessages.filePathMissing
    );
  };

  const handleAddBranch = () => {
    resetBranchFormState();
    setShowAddBranchDialog(true);
  };

  const handleCloseAddBranchDialog = (): void => {
    setShowAddBranchDialog(false);
    resetBranchFormState();
  };

  const handleBranchFieldChange = (
    field: keyof Omit<IBranchForm, 'authorizedPersons'>,
    value: string | IFetchStateResponseData | null
  ): void => {
    const normalizedValue =
      field === "aadharNumber" && typeof value === "string"
        ? value.replace(/\D/g, "").slice(0, 12)
        : value;

    setBranchForm((prev) => ({
      ...prev,
      [field]: normalizedValue,
    }));

    const stringValue = typeof normalizedValue === "string" ? normalizedValue : "";

    setBranchErrors((prev) => ({
      ...prev,
      [field]:
        field === "branchState"
          ? normalizedValue
            ? ""
            : validationMessages.stateRequired
          : field === "branchName"
            ? BRANCH_NAME_PATTERN.test(stringValue.trim()) && stringValue.trim().length >= 2 && stringValue.trim().length <= 100
              ? ""
              : validationMessages.branchNameInvalid
            : field === "city"
              ? CITY_NAME_PATTERN.test(stringValue.trim()) && stringValue.trim().length >= 2 && stringValue.trim().length <= 50
                ? ""
                : validationMessages.cityInvalid
              : field === "branchAddress"
                ? ADDRESS_PATTERN.test(stringValue.trim()) && stringValue.trim().length >= 5 && stringValue.trim().length <= 250
                  ? ""
                  : validationMessages.branchAddressInvalid
                : field === "accountHolderName"
                  ? ACCOUNT_HOLDER_NAME_PATTERN.test(stringValue.trim()) && stringValue.trim().length >= 2 && stringValue.trim().length <= 100
                    ? ""
                    : validationMessages.accountHolderNameInvalid
                  : field === "bankName"
                    ? BANK_NAME_PATTERN.test(stringValue.trim()) && stringValue.trim().length >= 2 && stringValue.trim().length <= 100
                      ? ""
                      : validationMessages.bankNameInvalid
                    : field === "panNumber"
                      ? PAN_NUMBER_PATTERN.test(stringValue.trim())
                        ? ""
                        : validationMessages.panNumberInvalid
                      : field === "aadharNumber"
                        ? AADHAR_CARD_PATTERN.test(stringValue.trim())
                          ? ""
                          : validationMessages.aadhaarInvalid
                        : field === "accountNo"
                          ? !stringValue.trim()
                            ? validationMessages.bankAccountNumberRequired
                            : BANK_ACCOUNT_NUMBER_ONLY_PATTERN.test(stringValue.trim())
                              ? ""
                              : validationMessages.bankAccountNumberInvalid
                          : field === "ifscCode"
                            ? !stringValue.trim()
                              ? validationMessages.ifscCodeRequired
                              : IFSC_CODE_PATTERN.test(stringValue.trim())
                                ? ""
                                : validationMessages.ifscCodeInvalid
                            : field === "gstNumber"
                              ? !stringValue.trim() || GST_NUMBER_PATTERN.test(stringValue.trim())
                                ? ""
                                : validationMessages.gstNumberInvalid
                              : "",
    }));
  };

  const handleAddAuthorizedPerson = (): void => {
    if (branchForm.authorizedPersons.length >= 3) {
      toastError("You can add up to 3 authorized persons only.");
      return;
    }

    resetBranchAuthorizedPersonFlow();
    setShowBranchAuthorizedPersonPanDialog(true);
  };

  const handleRemoveAuthorizedPerson = (personId: string): void => {
    setBranchForm((prev) => ({
      ...prev,
      authorizedPersons:
        prev.authorizedPersons.filter((person) => person.id !== personId),
    }));
    setBranchErrors((prev) => {
      const nextErrors = { ...prev.authorizedPersons };
      delete nextErrors[personId];

      return {
        ...prev,
        authorizedPersons: nextErrors,
      };
    });
  };

  const handleEditAuthorizedPerson = (person: IBranchAuthorizedPersonForm): void => {
    setEditingBranchAuthorizedPersonId(person.id);
    setBranchAuthorizedPersonFormValues({ panNumber: person.panNumber || "" });
    setBranchAuthorizedPersonFormErrors({ panNumber: "" });
    setBranchAuthorizedPersonDetail({
      ...initialBranchAuthorizedPersonDetail,
      panNumber: person.panNumber || "",
      fullName: person.name || "",
      constitution: person.constitution || "",
      constitutionOfInstitute: person.constitution || "",
      dob: person.dob || "",
      gender: person.gender || "",
      gstNumber: (person.gstDetails || "").toUpperCase(),
      mobileNumber: person.mobileNumber || "",
      emailID: person.emailAddress || "",
      address: person.address || "",
    });
    setBranchAuthorizedPersonDetailErrors(initialBranchAuthorizedPersonDetailErrors);
    setIsBranchAuthorizedPersonFormSubmitted(false);
    setIsBranchAuthorizedPersonEmailLocked(false);
    setIsBranchAuthorizedPersonMobileLocked(false);
    setIsBranchAuthorizedPersonGSTLocked(false);
    setShowBranchAuthorizedPersonConfirmDialog(true);
  };

  const handleBranchAuthorizedPersonPanChange = (value: string): void => {
    setBranchAuthorizedPersonFormValues({ panNumber: value });
    setBranchAuthorizedPersonFormErrors({
      panNumber: PAN_NUMBER_PATTERN.test(value) ? "" : branchAuthorizedPersonFormErrors.panNumber,
    });
  };

  const resetBranchAuthorizedPersonFlow = (): void => {
    setShowBranchAuthorizedPersonPanDialog(false);
    setShowBranchAuthorizedPersonConfirmDialog(false);
    setBranchAuthorizedPersonFormValues({ panNumber: "" });
    setBranchAuthorizedPersonFormErrors({ panNumber: "" });
    setBranchAuthorizedPersonDetail(initialBranchAuthorizedPersonDetail);
    setBranchAuthorizedPersonDetailErrors(initialBranchAuthorizedPersonDetailErrors);
    setIsBranchAuthorizedPersonFormSubmitted(false);
    setIsBranchAuthorizedPersonEmailLocked(false);
    setIsBranchAuthorizedPersonMobileLocked(false);
    setIsBranchAuthorizedPersonGSTLocked(false);
    setEditingBranchAuthorizedPersonId(null);
  };

  const handleVerifyBranchAuthorizedPersonPan = async (): Promise<void> => {
    setIsBranchAuthorizedPersonFormSubmitted(true);

    if (!PAN_NUMBER_PATTERN.test(branchAuthorizedPersonFormValues.panNumber)) {
      setBranchAuthorizedPersonFormErrors({
        panNumber: validationMessages.panNumberInvalid,
      });
      return;
    }

    const panNumber = branchAuthorizedPersonFormValues.panNumber.trim().toUpperCase();
    const institutePanNumbers = [
      branchForm.panNumber,
      decryptValueOrFallback(instituteDetail?.panNumber),
    ].map((pan) => pan.trim().toUpperCase());
    const authorizedPersonPanNumbers = [
      ...branchForm.authorizedPersons
        .filter((person) => person.id !== editingBranchAuthorizedPersonId)
        .map((person) => person.panNumber),
      ...branchRecords
        .filter((branch) => branch.id !== selectedBranchId)
        .flatMap((branch) => branch.authorizedPersons.map((person) => person.panNumber)),
      ...(instituteDetail?.authorisedPersons || []).map((person) =>
        decryptValueOrFallback(person.panNumber)
      ),
    ].map((pan) => pan?.trim().toUpperCase());

    if (institutePanNumbers.includes(panNumber)) {
      setBranchAuthorizedPersonFormErrors({
        panNumber: validationMessages.authorizedPersonPanMatchesInstitute,
      });
      return;
    }

    if (authorizedPersonPanNumbers.includes(panNumber)) {
      setBranchAuthorizedPersonFormErrors({
        panNumber: validationMessages.authorizedPersonPanDuplicateInstitute,
      });
      return;
    }

    setLoading(true);

    const response: IAddPanCardResponse = await fetchDetailsByPan({
      panNumber: encryptVAPTData(branchAuthorizedPersonFormValues.panNumber),
    });

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      const decryptedData = getDecryptedPanDetails(response.data);

      setBranchAuthorizedPersonDetail(decryptedData);
      setIsBranchAuthorizedPersonEmailLocked(!!response.data.emailID);
      setIsBranchAuthorizedPersonMobileLocked(!!response.data.mobileNumber);
      setIsBranchAuthorizedPersonGSTLocked(!!response.data.gstNumber);
      setShowBranchAuthorizedPersonPanDialog(false);
      setShowBranchAuthorizedPersonConfirmDialog(true);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleBranchAuthorizedPersonEmailChange = (value: string): void => {
    setBranchAuthorizedPersonDetail((prev) => ({
      ...prev,
      emailID: value,
    }));
    setBranchAuthorizedPersonDetailErrors((prev) => ({
      ...prev,
      emailID: !value ? validationMessages.emailRequired : EMAIL_PATTERN.test(value) ? "" : validationMessages.emailInvalid,
    }));
  };

  const handleBranchAuthorizedPersonMobileChange = (value: string): void => {
    setBranchAuthorizedPersonDetail((prev) => ({
      ...prev,
      mobileNumber: value,
    }));
    setBranchAuthorizedPersonDetailErrors((prev) => ({
      ...prev,
      mobileNumber: !value
        ? validationMessages.mobileNumberRequired
        : INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10
          ? ""
          : validationMessages.mobileNumberInvalid,
    }));
  };

  const handleBranchAuthorizedPersonGSTChange = (value: string): void => {
    const normalizedValue = value.toUpperCase();
    setBranchAuthorizedPersonDetail((prev) => ({
      ...prev,
      gstNumber: normalizedValue,
    }));
    setBranchAuthorizedPersonDetailErrors((prev) => ({
      ...prev,
      gstNumber: !normalizedValue.trim() || GST_NUMBER_PATTERN.test(normalizedValue.trim())
        ? ""
        : validationMessages.gstNumberInvalid,
    }));
  };

  const handleBranchAuthorizedPersonAddressChange = (value: string): void => {
    setBranchAuthorizedPersonDetail((prev) => ({
      ...prev,
      address: value,
    }));
    setBranchAuthorizedPersonDetailErrors((prev) => ({
      ...prev,
      address: value.trim() ? "" : validationMessages.addressRequired,
    }));
  };

  const handleSaveBranchAuthorizedPerson = (): void => {
    setIsBranchAuthorizedPersonFormSubmitted(true);

    const panNumber = (branchAuthorizedPersonDetail.panNumber ?? "").trim().toUpperCase();
    const institutePanNumbers = [
      branchForm.panNumber,
      decryptValueOrFallback(instituteDetail?.panNumber),
    ].map((pan) => pan.trim().toUpperCase());
    const authorizedPersonPanNumbers = [
      ...branchForm.authorizedPersons
        .filter((person) => person.id !== editingBranchAuthorizedPersonId)
        .map((person) => person.panNumber),
      ...branchRecords
        .filter((branch) => branch.id !== selectedBranchId)
        .flatMap((branch) => branch.authorizedPersons.map((person) => person.panNumber)),
      ...(instituteDetail?.authorisedPersons || []).map((person) =>
        decryptValueOrFallback(person.panNumber)
      ),
    ].map((pan) => pan?.trim().toUpperCase());

    if (institutePanNumbers.includes(panNumber)) {
      setBranchAuthorizedPersonFormErrors({
        panNumber: validationMessages.authorizedPersonPanMatchesInstitute,
      });
      setShowBranchAuthorizedPersonConfirmDialog(false);
      setShowBranchAuthorizedPersonPanDialog(true);
      return;
    }

    if (authorizedPersonPanNumbers.includes(panNumber)) {
      setBranchAuthorizedPersonFormErrors({
        panNumber: validationMessages.authorizedPersonPanDuplicateInstitute,
      });
      setShowBranchAuthorizedPersonConfirmDialog(false);
      setShowBranchAuthorizedPersonPanDialog(true);
      return;
    }

    const emailValue = branchAuthorizedPersonDetail.emailID?.trim().toLowerCase() || "";
    const mobileValue = branchAuthorizedPersonDetail.mobileNumber?.trim() || "";

    const nextErrors = {
      emailID:
        !emailValue
          ? validationMessages.emailRequired
          : !EMAIL_PATTERN.test(emailValue)
            ? validationMessages.emailInvalid
            : "",
      mobileNumber:
        !mobileValue
          ? validationMessages.mobileNumberRequired
          : !(INDIAN_MOBILE_NUMBER_PATTERN.test(mobileValue) && mobileValue.length === 10)
            ? validationMessages.mobileNumberInvalid
            : "",
      gstNumber:
        !branchAuthorizedPersonDetail.gstNumber?.trim() ||
          GST_NUMBER_PATTERN.test(branchAuthorizedPersonDetail.gstNumber.trim())
          ? ""
          : validationMessages.gstNumberInvalid,
      address: branchAuthorizedPersonDetail.address?.trim() ? "" : validationMessages.addressRequired,
    };

    setBranchAuthorizedPersonDetailErrors(nextErrors);

    if (nextErrors.emailID || nextErrors.mobileNumber || nextErrors.gstNumber || nextErrors.address) {
      return;
    }

    const personId = editingBranchAuthorizedPersonId || `authorized-person-${Date.now()}-${branchForm.authorizedPersons.length + 1}`;
    const authorizedPerson: IBranchAuthorizedPersonForm = {
      id: personId,
      name: branchAuthorizedPersonDetail.fullName || "",
      constitution: branchAuthorizedPersonDetail.constitutionOfInstitute || branchAuthorizedPersonDetail.constitution || branchAuthorizedPersonDetail.category || "",
      dob: branchAuthorizedPersonDetail.dob || "",
      gender: normalizeGenderValue(branchAuthorizedPersonDetail.gender),
      gstDetails: (branchAuthorizedPersonDetail.gstNumber || "").toUpperCase(),
      mobileNumber: branchAuthorizedPersonDetail.mobileNumber || "",
      emailAddress: branchAuthorizedPersonDetail.emailID || "",
      panNumber: branchAuthorizedPersonDetail.panNumber || "",
      address: branchAuthorizedPersonDetail.address || "",
      profilePhotoPath: "",
    };

    setBranchForm((prev) => ({
      ...prev,
      authorizedPersons: editingBranchAuthorizedPersonId
        ? prev.authorizedPersons.map((person) =>
          person.id === editingBranchAuthorizedPersonId ? authorizedPerson : person,
        )
        : [...prev.authorizedPersons, authorizedPerson],
    }));
    setAuthorizedPersonListError("");

    setBranchErrors((prev) => ({
      ...prev,
      authorizedPersons: {
        ...prev.authorizedPersons,
        [personId]: createAuthorizedPersonErrors(),
      },
    }));

    resetBranchAuthorizedPersonFlow();
  };

  const validateBranchForm = (): boolean => {
    const nextErrors: IBranchFormErrors = {
      branchName: BRANCH_NAME_PATTERN.test(branchForm.branchName.trim()) && branchForm.branchName.trim().length >= 2 && branchForm.branchName.trim().length <= 100 ? "" : validationMessages.branchNameInvalid,
      branchState: branchForm.branchState ? "" : validationMessages.stateRequired,
      city: CITY_NAME_PATTERN.test(branchForm.city.trim()) && branchForm.city.trim().length >= 2 && branchForm.city.trim().length <= 50 ? "" : validationMessages.cityInvalid,
      panNumber: PAN_NUMBER_PATTERN.test(branchForm.panNumber.trim()) ? "" : validationMessages.panNumberInvalid,
      aadharNumber: AADHAR_CARD_PATTERN.test(branchForm.aadharNumber.trim()) ? "" : validationMessages.aadhaarInvalid,
      gstNumber:
        branchForm.gstNumber.trim() && !GST_NUMBER_PATTERN.test(branchForm.gstNumber.trim())
          ? validationMessages.gstNumberInvalid
          : "",
      branchAddress: ADDRESS_PATTERN.test(branchForm.branchAddress.trim()) && branchForm.branchAddress.trim().length >= 5 && branchForm.branchAddress.trim().length <= 250 ? "" : validationMessages.branchAddressInvalid,
      accountHolderName: ACCOUNT_HOLDER_NAME_PATTERN.test(branchForm.accountHolderName.trim()) && branchForm.accountHolderName.trim().length >= 2 && branchForm.accountHolderName.trim().length <= 100 ? "" : validationMessages.accountHolderNameInvalid,
      bankName: BANK_NAME_PATTERN.test(branchForm.bankName.trim()) && branchForm.bankName.trim().length >= 2 && branchForm.bankName.trim().length <= 100 ? "" : validationMessages.bankNameInvalid,
      accountNo: !branchForm.accountNo.trim()
        ? validationMessages.bankAccountNumberRequired
        : BANK_ACCOUNT_NUMBER_ONLY_PATTERN.test(branchForm.accountNo.trim())
          ? ""
          : validationMessages.bankAccountNumberInvalid,
      ifscCode: !branchForm.ifscCode.trim()
        ? validationMessages.ifscCodeRequired
        : IFSC_CODE_PATTERN.test(branchForm.ifscCode.trim())
          ? ""
          : validationMessages.ifscCodeInvalid,
      authorizedPersons: {},
    };

    branchForm.authorizedPersons.forEach((person) => {
      nextErrors.authorizedPersons[person.id] = {
        name: person.name.trim() ? "" : validationMessages.nameRequired,
        constitution: person.constitution.trim() ? "" : "Please enter constitution",
        dob: person.dob ? "" : "Please select DOB",
        gender: person.gender ? "" : "Please select gender",
        gstDetails:
          person.gstDetails.trim() &&
            !GST_NUMBER_PATTERN.test(person.gstDetails.trim())
            ? validationMessages.gstNumberInvalid
            : "",
        mobileNumber:
          INDIAN_MOBILE_NUMBER_PATTERN.test(person.mobileNumber.trim()) && person.mobileNumber.trim().length === 10
            ? ""
            : person.mobileNumber.trim()
              ? validationMessages.mobileNumberInvalid
              : validationMessages.mobileNumberRequired,
        emailAddress:
          EMAIL_PATTERN.test(person.emailAddress.trim())
            ? ""
            : person.emailAddress.trim()
              ? validationMessages.emailInvalid
              : validationMessages.emailRequired,
      };
    });

    setBranchErrors(nextErrors);
    setAuthorizedPersonListError(
      branchForm.authorizedPersons.length ? "" : validationMessages.authorizedPersonRequired
    );

    const hasTopLevelErrors = Object.entries(nextErrors)
      .filter(([key]) => key !== "authorizedPersons")
      .some(([, value]) => Boolean(value));

    const hasAuthorizedPersonErrors = Object.values(nextErrors.authorizedPersons).some((personErrors) =>
      Object.values(personErrors).some(Boolean)
    );

    return branchForm.authorizedPersons.length > 0 && !hasTopLevelErrors && !hasAuthorizedPersonErrors;
  };

  const handleSaveBranch = async (): Promise<void> => {
    if (isBranchDialogReadOnly) {
      handleCloseAddBranchDialog();
      return;
    }

    setIsBranchFormSubmitted(true);

    if (!validateBranchForm()) {
      return;
    }

    setLoading(true);

    const payload = buildBranchPayload(selectedBranchId || undefined);

    try {
      const response = selectedBranchId
        ? await updateEducationalInstituteBranchAPI(payload)
        : await createEducationalInstituteBranchAPI(payload);

      if (response?.statusCode === 200) {
        toastSuccess(response.message);
        handleCloseAddBranchDialog();
        await fetchBranchList(false);
      } else {
        toastError(response?.message || "Unable to save institute branch.");
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Unable to save institute branch.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstituteDocumentFieldChange = (field: "documentType" | "file", value: string | File | null): void => {
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

    if (!id) {
      toastError("Institute ID is missing.");
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
      formData.append("instituteID", id);
      formData.append("documentType", String(documentType));

      const response = await uploadEducationalInstituteAgreementAPI(formData);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        await getEducationInstituteById(id);
      } else {
        toastError(response.message);
        return;
      }
    } finally {
      setShowInstituteDocumentDialog(false);
      setLoading(false);
    }

    setUploadDocumentForm({
      documentType: "",
      file: null,
    });
    setUploadDocumentErrors({
      documentType: "",
      file: "",
    });
    setDocumentFileInputKey((prev) => prev + 1);
  };

  const handleSetPaymentBranch = async (branchData: IGetAllEducationInstitutesDetailedBranches): Promise<void> => {
    setLoading(true);

    try {
      const response = await setEducationalInstitutePaymentBranchAPI(branchData.id);

      if (response?.statusCode === 200) {
        toastSuccess(response.message);
        await fetchBranchList(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewBranch = async (branchData: IGetAllEducationInstitutesDetailedBranches): Promise<void> => {
    setLoading(true);

    try {
      const branchRecord = await fetchBranchDetails(branchData.id);

      if (branchRecord) {
        openBranchDialog("view", branchRecord);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditBranch = async (branchData: IGetAllEducationInstitutesDetailedBranches): Promise<void> => {
    setLoading(true);

    try {
      const branchRecord = await fetchBranchDetails(branchData.id);

      if (branchRecord) {
        openBranchDialog("edit", branchRecord);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = (branchData: IGetAllEducationInstitutesDetailedBranches): void => {
    setBranchPendingDeletion(branchData);
  };

  const handleConfirmDeleteBranch = async (): Promise<void> => {
    if (!branchPendingDeletion) return;

    setLoading(true);

    const response = await deleteEducationalInstituteBranchAPI(branchPendingDeletion.id);

    if (response?.statusCode === 200) {
      toastSuccess(response.message);
      await fetchBranchList(false);
      setBranchPendingDeletion(null);
    }

    setLoading(false);
  };

  const handleBranchDocumentFieldChange = (
    field: "documentType" | "file",
    value: string | File | null
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

    setBranchUploadDocumentForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    setBranchUploadDocumentErrors((prev) => ({
      ...prev,
      [field]:
        field === "documentType"
          ? nextValue
            ? ""
            : "Please select document type"
          : nextFileError || (nextValue ? "" : "Please upload PDF file"),
    }));
  };

  const handleUploadBranchDocument = async (): Promise<void> => {
    const nextErrors = {
      documentType: branchUploadDocumentForm.documentType ? "" : "Please select document type",
      file: branchUploadDocumentForm.file ? "" : "Please upload PDF file",
    };

    setBranchUploadDocumentErrors(nextErrors);

    if (
      nextErrors.documentType ||
      nextErrors.file ||
      !branchUploadDocumentForm.file ||
      !selectedBranchForUpload
    ) {
      return;
    }

    if (!isFileSizeWithinLimit(branchUploadDocumentForm.file)) {
      setBranchUploadDocumentErrors((prev) => ({
        ...prev,
        file: getFileSizeLimitErrorMessage("File"),
      }));
      return;
    }

    const documentType = instituteDocumentTypeMap[branchUploadDocumentForm.documentType];

    if (!documentType) {
      toastError("Invalid document type selected.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("documentFile", branchUploadDocumentForm.file);
      formData.append("instituteID", id || "");
      formData.append("branchID", selectedBranchForUpload.id);
      formData.append("documentType", String(documentType));

      const response = await uploadEducationalInstituteAgreementAPI(formData);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        const refreshedBranchRecord = await fetchBranchDetails(selectedBranchForUpload.id);

        if (refreshedBranchRecord) {
          setSelectedBranchForUpload(refreshedBranchRecord);
        }
      } else {
        toastError(response.message);
        return;
      }
    } finally {
      setLoading(false);
    }

    setBranchUploadDocumentForm({
      documentType: "",
      file: null,
    });
    setBranchUploadDocumentErrors({
      documentType: "",
      file: "",
    });
    setBranchDocumentFileInputKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!id) return;

    const initializePageData = async (): Promise<void> => {
      setLoading(true);

      try {
        await Promise.all([
          getEducationInstituteById(id),
          fetchBranchList(false),
        ]);
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, [id]);

  useEffect(() => {
    getStatesList();
  }, []);

  useEffect(() => {
    if (!stateOptions.length) {
      return;
    }

    setBranchRecords((prev) =>
      prev.map((branch) => ({
        ...branch,
        branchStateOption: branch.branchStateOption || getStateOptionByName(branch.state),
      }))
    );
  }, [stateOptions]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <h2 className="txt-24 mb-1">Educational Institute Details</h2>

          <BackButton />
        </div>
        {instituteDetail ? (
          <div className="row g-4">
            <div className="col-12">
              <TabView className="custom-tabview">
                <TabPanel header="Institute Details">
                  <div className="borderBoxHldr p-24 mt-3">
                    <div className="row">
                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">Institute Code</b>
                        <p className="text-break mb-0">{instituteDetail.code}</p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">Institute Name</b>
                        <p className="text-break mb-0">{instituteDetail.tradeName ? decryptVAPTData(instituteDetail.tradeName) : instituteDetail.fullName}</p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">Mobile Number</b>
                        <p className="text-break mb-0">
                          {instituteDetail.phoneNumber ? formatMobileNumber(decryptVAPTData(instituteDetail.phoneNumber)) : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">Email</b>
                        <p className="text-break mb-0">{instituteDetail.email ? decryptVAPTData(instituteDetail.email) : "-"}</p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">State</b>
                        <p className="text-break mb-0">{instituteDetail.state ? decryptVAPTData(instituteDetail.state) : "-"}</p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">City</b>
                        <p className="text-break mb-0">{instituteDetail.city ? decryptVAPTData(instituteDetail.city) : "-"}</p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">PAN Number</b>
                        <p className="text-break mb-0">
                          {instituteDetail.panNumber ? decryptVAPTData(instituteDetail.panNumber) : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                        <b className="fw-semibold">Status</b>
                        <p className="d-flex align-items-center mt-2 mb-0">
                          <InputSwitch
                            checked={!!instituteDetail.isActive}
                            onChange={(e) => handleStatusChange(!!e.value)}
                          />
                          <span className="ms-2">
                            {instituteDetail.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>

                      <div className="col-12 mb-4">
                        <b className="fw-semibold">Address</b>
                        <p className="text-break mb-0">
                          {instituteDetail.address ? decryptVAPTData(instituteDetail.address) : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                {instituteDetail.authorisedPersons?.length > 0 && (
                  <TabPanel header="Authorised Persons">
                    <div className="d-flex flex-column gap-4 mt-3">
                      {instituteDetail.authorisedPersons.map((person, index) =>
                        renderAuthorizedPersonDetails(person, `Authorised Person ${index + 1}`)
                      )}
                    </div>
                  </TabPanel>
                )}
              </TabView>
            </div>

            <div className="col-12">
              <div className="whiteBoxHldr">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="txt-20 mb-0">Uploaded Documents</h3>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <Button
                      className="btn btn-orange"
                      onClick={() => setShowInstituteDocumentDialog(true)}
                    >
                      <i className="bi bi-upload me-2" />
                      Upload Document
                    </Button>
                  </div>
                </div>

                {instituteDetail.agreements?.length ? (
                  <div className="table-responsive">
                    <table className="tableMain">
                      <thead>
                        <tr>
                          <th>Document Type</th>
                          <th>Uploaded Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instituteDetail.agreements.map((documentData: IGetAllEducationInstitutesDetailedDocuments, index: number) => (
                          <tr key={`${documentData.fileUrl}-${index}`}>
                            <td>{documentData.type}</td>
                            <td>{formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}</td>
                            <td>
                              <Button
                                className="btn btn-black-line py-2 px-3"
                                onClick={() => openDocument(documentData)}
                                label="View PDF"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">No documents uploaded for this institute yet.</p>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="whiteBoxHldr">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <h3 className="txt-20 mb-1">Institute Branches</h3>
                  </div>

                  <Button
                    className="btn btn-orange"
                    onClick={() => handleAddBranch()}
                  >
                    <i className="bi bi-plus-circle me-2" />
                    Add Branch
                  </Button>
                </div>

                {branchRecords.length > 0 ? (
                  <div className="table-responsive">
                    <table className="tableMain institute-branches-table">
                      <thead>
                        <tr>
                          <th>Branch Code</th>
                          <th>Branch Name</th>
                          <th>Contact Person</th>
                          <th>Mobile Number</th>
                          <th>Is Payment Branch</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchRecords.map((branch: IGetAllEducationInstitutesDetailedBranches) => (
                          <tr key={branch.id}>
                            <td>{branch.branchCode}</td>
                            <td>
                              <span className="institute-branches-table__two-line" title={branch.branchName}>
                                {branch.branchName}
                              </span>
                            </td>
                            <td>
                              <span className="institute-branches-table__two-line" title={branch.contactPerson}>
                                {branch.contactPerson}
                              </span>
                            </td>
                            <td>{formatMobileNumber(branch.mobileNumber)}</td>
                            <td>
                              {branch.isPaymentBranch ? (
                                <span className="StatusLabel greenLine">Yes</span>
                              ) : (
                                <Button
                                  className="btn btn-orange text-white py-2 px-3 institute-branches-table__payment-button"
                                  onClick={() => handleSetPaymentBranch(branch)}
                                >Set Payment Branch</Button>
                              )}
                            </td>
                            <td>
                              <span className="institute-branches-table__two-line" title={branch.city}>
                                {branch.city}
                              </span>
                            </td>
                            <td>{branch.state}</td>
                            <td>
                              <span className={`StatusLabel ${branch.isActive ? "greenLine" : "redLine"}`}>
                                {branch.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap">
                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="View"
                                  onClick={() => handleViewBranch(branch)}
                                >
                                  <i className='icon-eye' />
                                </Button>

                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="Edit"
                                  onClick={() => handleEditBranch(branch)}
                                >
                                  <i className='icon-edit' />
                                </Button>

                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="Delete"
                                  onClick={() => handleDeleteBranch(branch)}
                                >
                                  <i className="bi bi-trash ms-2" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">
                    No branches added for this institute yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="whiteBoxHldr">
            <p className="mb-3">Educational institute not found.</p>
            <BackButton />
          </div>
        )}
      </div>

      <Dialog
        visible={showAddBranchDialog}
        header={
          branchDialogMode === "view"
            ? "View Branch"
            : branchDialogMode === "edit"
              ? "Edit Branch"
              : "Add Branch"
        }
        modal
        onHide={handleCloseAddBranchDialog}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "860px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100"
              onClick={handleCloseAddBranchDialog}
              disabled={loading}
            >
              {isBranchDialogReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isBranchDialogReadOnly && (
              <Button
                className="btn btn-orange w-100"
                onClick={handleSaveBranch}
                disabled={loading}
              >
                {branchDialogMode === "edit" ? "Update Branch" : "Save Branch"}
              </Button>
            )}
          </div>
        }
      >
        <Loader isLoading={loading} />

        <div className="modal-content">
          <div
            className="modal-body"
            style={{ maxHeight: "72vh", overflowY: "auto", overflowX: "hidden" }}
          >
            <div className="row form-group">
              <div className="col-12 mb-3">
                <h4 className="txt-18 mb-0">Branch Details</h4>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchName">Branch Name <sup>*</sup></label>
                <InputText
                  id="branchName"
                  className="form-control"
                  value={branchForm.branchName}
                  onChange={(e) => handleBranchFieldChange("branchName", e.target.value?.trimStart())}
                  placeholder="Enter branch name"
                  maxLength={100}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.branchName && (
                  <small className="error">{branchErrors.branchName}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchState">Branch State <sup>*</sup></label>
                <Dropdown
                  id="branchState"
                  className="w-100"
                  value={branchForm.branchState}
                  onChange={(e) => handleBranchFieldChange("branchState", e.value)}
                  options={stateOptions}
                  optionLabel="name"
                  placeholder="Select branch state"
                  filter
                  showClear
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.branchState && (
                  <small className="error">{branchErrors.branchState}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchCity">City <sup>*</sup></label>
                <InputText
                  id="branchCity"
                  className="form-control"
                  value={branchForm.city}
                  onChange={(e) => handleBranchFieldChange("city", e.target.value?.trimStart())}
                  placeholder="Enter city"
                  maxLength={50}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.city && (
                  <small className="error">{branchErrors.city}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchPanNumber">PAN Number <sup>*</sup></label>
                <InputText
                  id="branchPanNumber"
                  className="form-control"
                  value={branchForm.panNumber}
                  onChange={(e) => handleBranchFieldChange("panNumber", e.target.value.toUpperCase()?.trimStart())}
                  placeholder="Enter PAN number"
                  maxLength={10}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.panNumber && (
                  <small className="error">{branchErrors.panNumber}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchAadharNumber">Aadhar Number <sup>*</sup></label>
                <InputText
                  id="branchAadharNumber"
                  className="form-control"
                  value={branchForm.aadharNumber}
                  onChange={(e) => handleBranchFieldChange("aadharNumber", e.target.value?.trimStart())}
                  placeholder="Enter Aadhar number"
                  maxLength={12}
                  onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.aadharNumber && (
                  <small className="error">{branchErrors.aadharNumber}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="branchGstNumber">GST Number</label>
                <InputText
                  id="branchGstNumber"
                  className="form-control"
                  value={branchForm.gstNumber}
                  onChange={(e) => handleBranchFieldChange("gstNumber", e.target.value.toUpperCase()?.trimStart())}
                  placeholder="Enter GST number"
                  maxLength={15}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.gstNumber && (
                  <small className="error">{branchErrors.gstNumber}</small>
                )}
              </div>

              <div className="col-12 mb-4">
                <label className="form-label small" htmlFor="branchAddress">Branch Address <sup>*</sup></label>
                <InputText
                  id="branchAddress"
                  className="form-control"
                  value={branchForm.branchAddress}
                  onChange={(e) => handleBranchFieldChange("branchAddress", e.target.value?.trimStart())}
                  placeholder="Enter branch address"
                  maxLength={250}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.branchAddress && (
                  <small className="error">{branchErrors.branchAddress}</small>
                )}
              </div>

              <div className="col-12 mb-3">
                <h4 className="txt-18 mb-0">Bank Account Details</h4>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="accountHolderName">Account Holder Name <sup>*</sup></label>
                <InputText
                  id="accountHolderName"
                  className="form-control"
                  value={branchForm.accountHolderName}
                  onChange={(e) => handleBranchFieldChange("accountHolderName", e.target.value?.trimStart())}
                  placeholder="Enter account holder name"
                  maxLength={100}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.accountHolderName && (
                  <small className="error">{branchErrors.accountHolderName}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="bankName">Bank Name <sup>*</sup></label>
                <InputText
                  id="bankName"
                  className="form-control"
                  value={branchForm.bankName}
                  onChange={(e) => handleBranchFieldChange("bankName", e.target.value?.trimStart())}
                  placeholder="Enter bank name"
                  maxLength={100}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.bankName && (
                  <small className="error">{branchErrors.bankName}</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small" htmlFor="accountNo">Account Number <sup>*</sup></label>
                <InputText
                  id="accountNo"
                  className="form-control"
                  value={branchForm.accountNo}
                  onChange={(e) => handleBranchFieldChange("accountNo", e.target.value?.trimStart())}
                  placeholder="Enter account number"
                  maxLength={18}
                  onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.accountNo && (
                  <small className="error">{branchErrors.accountNo}</small>
                )}
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label small" htmlFor="ifscCode">IFSC Code <sup>*</sup></label>
                <InputText
                  id="ifscCode"
                  className="form-control"
                  value={branchForm.ifscCode}
                  onChange={(e) => handleBranchFieldChange("ifscCode", e.target.value.toUpperCase()?.trimStart())}
                  placeholder="Enter IFSC code"
                  maxLength={11}
                  disabled={isBranchDialogReadOnly}
                />
                {branchErrors.ifscCode && (
                  <small className="error">{branchErrors.ifscCode}</small>
                )}
              </div>

              <div className="col-12 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h4 className="txt-18 mb-0">Branch Authorized Person Details</h4>
                <Button
                  className="btn btn-black-line"
                  onClick={handleAddAuthorizedPerson}
                  disabled={branchForm.authorizedPersons.length >= 3 || isBranchDialogReadOnly}
                >
                  <i className="bi bi-plus-circle me-2" />
                  Add Authorized Person
                </Button>
              </div>

              <div className="col-12">
                {branchForm.authorizedPersons.length > 0 ? (
                  <div className="authorized-person-summary__list">
                    {branchForm.authorizedPersons.map((person, index) => (
                      <div key={person.id} className="authorized-person-summary__card">
                        <div className="authorized-person-summary__content">
                          <p className="authorized-person-summary__badge">
                            Authorized Person {index + 1}
                          </p>
                          <p className="authorized-person-summary__meta">
                            Name: {person.name || "-"}
                          </p>
                          <p className="authorized-person-summary__meta">
                            PAN: {person.panNumber || "-"}
                          </p>
                          <p className="authorized-person-summary__meta">
                            Email Address: {person.emailAddress || "-"}
                          </p>
                          <p className="authorized-person-summary__meta">
                            Mobile Number: {person.mobileNumber || "-"}
                          </p>
                          <p className="authorized-person-summary__address">
                            Address: {person.address || "-"}
                          </p>
                        </div>
                        <div className="authorized-person-summary__actions">
                          <Button
                            type="button"
                            className="trash-icon p-0 authorized-person-summary__icon-button"
                            onClick={() => handleEditAuthorizedPerson(person)}
                            disabled={isBranchDialogReadOnly}
                            aria-label={`Edit authorized person ${index + 1}`}
                          >
                            <i className='icon-edit' />
                          </Button>
                          <Button
                            type="button"
                            className="trash-icon p-0 authorized-person-summary__delete"
                            onClick={() => handleRemoveAuthorizedPerson(person.id)}
                            disabled={isBranchDialogReadOnly}
                            aria-label={`Remove authorized person ${index + 1}`}
                          >
                            <i className='icon-trash' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="authorized-person-summary__empty">
                    <p className="mb-0 text-muted">
                      You can add up to 3 authorized persons.
                    </p>
                  </div>
                )}
                {isBranchFormSubmitted && authorizedPersonListError && (
                  <small className="error d-block mt-2">{authorizedPersonListError}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Delete Institute Branch"
        visible={!!branchPendingDeletion}
        modal
        onHide={() => setBranchPendingDeletion(null)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "460px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="text-center btn btn-black-line w-100"
              onClick={() => setBranchPendingDeletion(null)}
              disabled={loading}
              label="Cancel"
            />
            <Button
              className="text-center btn btn-orange w-100"
              onClick={() => void handleConfirmDeleteBranch()}
              disabled={loading}
              label="Delete"
            />
          </div>
        }
      >
        <Loader isLoading={loading} />
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-0">
              Are you sure you want to delete the branch
              {branchPendingDeletion?.branchName ? ` “${branchPendingDeletion.branchName}”` : ""}? This action cannot be undone.
            </p>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Authorized Person PAN Details"
        visible={showBranchAuthorizedPersonPanDialog}
        className="modalWrapper"
        onHide={resetBranchAuthorizedPersonFlow}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "650px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={resetBranchAuthorizedPersonFlow}
              disabled={loading}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={() => void handleVerifyBranchAuthorizedPersonPan()}
              disabled={loading}
              label="Next"
            />
          </div>
        }
      >
        <Loader isLoading={loading} />
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
              Enter the PAN Card number to authenticate the authorized person and continue.
            </p>

            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="branchAuthorizedPersonPanNumber">
                PAN <sup>*</sup>
              </label>
              <InputText
                id="branchAuthorizedPersonPanNumber"
                autoFocus
                className="form-control"
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                value={branchAuthorizedPersonFormValues.panNumber.toUpperCase()}
                maxLength={10}
                onChange={(e) => handleBranchAuthorizedPersonPanChange(e.target.value.toUpperCase().trim())}
              />
              {isBranchAuthorizedPersonFormSubmitted && branchAuthorizedPersonFormErrors.panNumber && (
                <small className="error">{branchAuthorizedPersonFormErrors.panNumber}</small>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showBranchAuthorizedPersonConfirmDialog}
        header="Authorized Person Details"
        modal
        onHide={resetBranchAuthorizedPersonFlow}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100"
              disabled={loading}
              onClick={resetBranchAuthorizedPersonFlow}
            >
              Cancel
            </Button>

            <Button
              className="btn btn-orange w-100"
              onClick={handleSaveBranchAuthorizedPerson}
              disabled={loading}
            >
              {editingBranchAuthorizedPersonId ? "Update Authorized Person" : "Save Authorized Person"}
            </Button>
          </div>
        }
        blockScroll
        style={{ width: "720px" }}
      >
        <Loader isLoading={loading} />
        <div className="modalWrapper modal-dialog modal-dialog-centered p-0">
          <div className="modal-content">
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" }}
            >
              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonName">
                  Name
                </label>
                <InputText
                  id="branchAuthorizedPersonName"
                  value={branchAuthorizedPersonDetail.fullName}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonEmail">
                  Email Address <sup>*</sup>
                </label>
                <InputText
                  id="branchAuthorizedPersonEmail"
                  value={branchAuthorizedPersonDetail.emailID ?? ""}
                  placeholder="Enter Email Address"
                  className="form-control"
                  disabled={isBranchAuthorizedPersonEmailLocked}
                  onChange={(e) => handleBranchAuthorizedPersonEmailChange(e.target.value.trim().toLowerCase())}
                />
                {isBranchAuthorizedPersonFormSubmitted && branchAuthorizedPersonDetailErrors.emailID && (
                  <small className="error">{branchAuthorizedPersonDetailErrors.emailID}</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonDob">
                  DOB
                </label>
                <InputText
                  id="branchAuthorizedPersonDob"
                  value={branchAuthorizedPersonDetail.dob ?? ""}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonMobile">
                  Mobile Number <sup>*</sup>
                </label>
                <InputText
                  id="branchAuthorizedPersonMobile"
                  value={branchAuthorizedPersonDetail.mobileNumber ?? ""}
                  placeholder="Enter Mobile Number"
                  className="form-control"
                  maxLength={10}
                  disabled={isBranchAuthorizedPersonMobileLocked}
                  onChange={(e) => handleBranchAuthorizedPersonMobileChange(e.target.value)}
                  onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
                />
                {isBranchAuthorizedPersonFormSubmitted && branchAuthorizedPersonDetailErrors.mobileNumber && (
                  <small className="error">{branchAuthorizedPersonDetailErrors.mobileNumber}</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonGst">
                  GST Details
                </label>
                <InputText
                  id="branchAuthorizedPersonGst"
                  value={branchAuthorizedPersonDetail.gstNumber}
                  onChange={(e) => handleBranchAuthorizedPersonGSTChange(e.target.value.toUpperCase())}
                  className="form-control"
                  disabled={isBranchAuthorizedPersonGSTLocked}
                  placeholder="Enter GST Number"
                  maxLength={15}
                />
                {isBranchAuthorizedPersonFormSubmitted && branchAuthorizedPersonDetailErrors.gstNumber && (
                  <small className="error">{branchAuthorizedPersonDetailErrors.gstNumber}</small>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonGender">
                  Gender
                </label>
                <InputText
                  id="branchAuthorizedPersonGender"
                  value={
                    branchAuthorizedPersonDetail.gender
                      ? branchAuthorizedPersonDetail.gender.charAt(0).toUpperCase() +
                      branchAuthorizedPersonDetail.gender.slice(1).toLowerCase()
                      : ""
                  }
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonConstitution">
                  Constitution
                </label>
                <InputText
                  id="branchAuthorizedPersonConstitution"
                  value={branchAuthorizedPersonDetail.constitutionOfInstitute || branchAuthorizedPersonDetail.constitution || branchAuthorizedPersonDetail.category || ""}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="branchAuthorizedPersonAddress">
                  Address <sup>*</sup>
                </label>
                <InputTextarea
                  id="branchAuthorizedPersonAddress"
                  value={branchAuthorizedPersonDetail.address ?? ""}
                  placeholder="Enter Address"
                  className="form-control"
                  rows={3}
                  autoResize={false}
                  maxLength={250}
                  onChange={(e) => handleBranchAuthorizedPersonAddressChange(e.target.value)}
                />
                {isBranchAuthorizedPersonFormSubmitted && branchAuthorizedPersonDetailErrors.address && (
                  <small className="error">{branchAuthorizedPersonDetailErrors.address}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

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
                  onChange={(e) => handleInstituteDocumentFieldChange("documentType", e.value)}
                  options={documentTypeOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                />
                {uploadDocumentErrors.documentType && (
                  <small className="error">{uploadDocumentErrors.documentType}</small>
                )}
              </div>

              <div className="form-group col-12 mb-4">
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
                      handleInstituteDocumentFieldChange("file", e.target.files?.[0] || null)
                    }
                  />
                  <Button
                    type="button"
                    className="btn btn-black-line"
                    onClick={() =>
                      document.getElementById("documentFile")?.click()
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

      <Dialog
        visible={showBranchDocumentDialog}
        header={`Upload Branch Document${selectedBranchForUpload?.branchName ? ` - ${selectedBranchForUpload.branchName}` : ""}`}
        modal
        onHide={() => setShowBranchDocumentDialog(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "760px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100"
              onClick={() => setShowBranchDocumentDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="btn btn-orange w-100"
              onClick={handleUploadBranchDocument}
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
                <label className="form-label small" htmlFor="branchDocumentType">
                  Document Type <sup>*</sup>
                </label>
                <Dropdown
                  id="branchDocumentType"
                  value={branchUploadDocumentForm.documentType}
                  onChange={(e) => handleBranchDocumentFieldChange("documentType", e.value)}
                  options={branchDocumentTypeOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                />
                {branchUploadDocumentErrors.documentType && (
                  <small className="error">{branchUploadDocumentErrors.documentType}</small>
                )}
              </div>

              <div className="col-12 mb-4">
                <label className="form-label small" htmlFor="branchDocumentFile">
                  Upload PDF <sup>*</sup>
                </label>
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
                    Upload branch document in PDF format only
                  </p>
                  <input
                    key={branchDocumentFileInputKey}
                    id="branchDocumentFile"
                    type="file"
                    accept={PDF_FILE_ACCEPT}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleBranchDocumentFieldChange("file", e.target.files?.[0] || null)
                    }
                  />
                  <Button
                    type="button"
                    className="btn btn-black-line"
                    onClick={() =>
                      document.getElementById("branchDocumentFile")?.click()
                    }
                    label="Upload PDF"
                  />
                  {branchUploadDocumentForm.file && (
                    <small className="text-muted d-block mt-3">
                      {branchUploadDocumentForm.file.name}
                    </small>
                  )}
                </div>
                {branchUploadDocumentErrors.file && (
                  <small className="error">{branchUploadDocumentErrors.file}</small>
                )}
              </div>

              <div className="col-12">
                <h4 className="txt-18 mb-3">Uploaded Documents</h4>

                {selectedBranchForUpload?.documents?.length ? (
                  <div className="d-flex flex-column gap-3">
                    {selectedBranchForUpload.documents.map((documentData: IGetAllEducationInstitutesDetailedDocuments, index: number) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #d9e3f0",
                          borderRadius: "16px",
                          padding: "16px 18px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <p
                              className="mb-1"
                              style={{
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "#1f2c3d",
                              }}
                            >
                              {documentData.type}
                            </p>
                            <p
                              className="mb-0 text-break"
                              style={{
                                fontSize: "13px",
                                color: "#6f7785",
                              }}
                            >
                              {documentData.fileUrl} | {formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-0 text-muted">No uploaded documents available for this branch.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

    </>
  )
}

export default EducationInstituteDetail

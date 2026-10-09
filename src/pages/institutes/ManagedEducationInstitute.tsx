import { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import TableTitle from '../../components/TableTitle';
import SearchButton from '../../components/SearchButton';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { PaginateReqEntity } from '../../interface/pagination';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { IsNullOrEmptyArray, IsStringNullEmptyOrUndefined } from '../../utils/functions/nullCheck';
import PrimePaginator from '../../components/PrimePaginator';
import { PaginatorPageChangeEvent } from 'primereact/paginator';
import { extraToken, formatDate, getFileSizeLimitErrorMessage, IMAGE_FILE_ACCEPT, IsFormValid, isFileSizeWithinLimit, isImageFile, isPdfFile, MAX_FILE_UPLOAD_NOTE, PDF_FILE_ACCEPT, restrictInputByPattern, toastError, toastSuccess } from '../../utils/functions/shared';
import useDebouncedEffect from '../../hooks/useDebounce';
import { debounceTimeInMilliseconds, formatMobileNumber } from '../../utils/constants/constant';
import { Tooltip } from 'primereact/tooltip';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { IAddPanCardResponse, IConfirmDetail, OnlyPanNumber } from '../../interface/panCardResponse';
import { validationMessages } from '../../utils/constants/messages';
import { EMAIL_PATTERN, GST_NUMBER_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN, NUMBER_ONLY_PATTERN, PAN_NUMBER_PATTERN, TRADE_NAME_PATTERN, WEBSITE_PATTERN } from '../../utils/constants/pattern';
import { addEducationalInstituteAPI, deleteInstituteNBFCAuthRecordAPI, fetchDetailsByPan, fetchStatesAPI, getAllEducationInstitutesAPI, getEducationInstituteByIdAPI, updateEducationalInstituteAPI, uploadCommonDocumentAPI, uploadEducationalInstituteAgreementAPI } from '../../utils/axios/apiServices';
import { IAddEducationalInstituteResponse, IEducationInstitutes, IGetAllEducationInstitutesDetailedResponse } from '../../interface/institutes';
import { decryptVAPTData, encryptData, encryptVAPTData } from '../../utils/functions/encryptDecrypt';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { CLIENT_ROLE } from '../../utils/constants/constant';
import { IAuthorizedPersonRegisterRequest, IRegisterParams } from '../../interface/signIn';
import { IFetchStateResponse, IFetchStateResponseData } from '../../interface/payOuts';
import { DeleteAuthorizedPersonType, DocumentFileTypeForInstitute, DocumentForFileUploadType } from '../../utils/constants/enum';
import usePermission from '../../hooks/usePermission';
import { IValidation } from '../nbfc/ManagedNBFC';
import ImpersonateUserModal from '../../components/ImpersonateUserModal';

interface IInstituteConfirmValidation extends IValidation {
    website: string;
    gstNumber: string;
    tradeName: string;
}

interface IAuthorizedPersonValidation extends IValidation {
    profilePhoto: string;
    gstNumber: string;
}

interface IAuthorizedPersonDraft extends IConfirmDetail {
    id: string;
    authRecordID: string | null;
    profilePhoto: File | null;
    profilePhotoPath: string | null;
}

interface IAuthorizedPersonFormDetail extends IConfirmDetail {
    authRecordID?: string | null;
    profilePhoto: File | null;
    profilePhotoPath: string | null;
}

const initialConfirmDetail: IConfirmDetail = {
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
    tradeName: "",
};

const initialAuthorizedPersonDetail: IAuthorizedPersonFormDetail = {
    ...initialConfirmDetail,
    authRecordID: null,
    profilePhoto: null,
    profilePhotoPath: null,
};

const initialInstituteValidation: IInstituteConfirmValidation = {
    emailID: "",
    mobileNumber: "",
    website: "",
    gstNumber: "",
    tradeName: "",
};

const initialAuthorizedPersonValidation: IAuthorizedPersonValidation = {
    emailID: "",
    mobileNumber: "",
    profilePhoto: "",
    gstNumber: "",
};

const ManagedEducationInstitute = () => {
    const { userID, whiteLabelSettings } = useSelector((state: RootState) => state.user.user);

    const [loading, setLoading] = useState<boolean>(false);

    const [loadingMessage, setLoadingMessage] = useState<string>("");

    const [institutes, setInstitutes] = useState<IEducationInstitutes[]>([]);

    const [searchText, setSearchText] = useState<string>("");

    const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
        pageNumber: 0,
        pageSize: 10,
        searchText: "",
    });

    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [selectedState, setSelectedState] = useState<IFetchStateResponseData | null>(null);

    const [stateOptions, setStateOptions] = useState<IFetchStateResponseData[]>([]);

    const [showInstitutePanDialog, setShowInstitutePanDialog] = useState<boolean>(false);

    const [showAuthorizedPersonPanDialog, setShowAuthorizedPersonPanDialog] = useState<boolean>(false);

    const [formValues, setFormValues] = useState<OnlyPanNumber>({
        panNumber: "",
    });

    const [authorizedPersonFormValues, setAuthorizedPersonFormValues] = useState<OnlyPanNumber>({
        panNumber: "",
    });

    const [formErrors, setFormErrors] = useState<OnlyPanNumber>({
        panNumber: "",
    });

    const [authorizedPersonFormErrors, setAuthorizedPersonFormErrors] = useState<OnlyPanNumber>({
        panNumber: "",
    });

    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

    const [isAuthorizedPersonFormSubmitted, setIsAuthorizedPersonFormSubmitted] = useState<boolean>(false);

    const [validation, setValidation] = useState<IInstituteConfirmValidation>(initialInstituteValidation);

    const [authorizedPersonValidation, setAuthorizedPersonValidation] = useState<IAuthorizedPersonValidation>(initialAuthorizedPersonValidation);

    const [confirmDetail, setConfirmDetail] = useState<IConfirmDetail>(initialConfirmDetail);

    const [authorizedPersonDetail, setAuthorizedPersonDetail] = useState<IAuthorizedPersonFormDetail>(initialAuthorizedPersonDetail);

    const [isAuthorizedPersonEmailLocked, setIsAuthorizedPersonEmailLocked] = useState<boolean>(false);

    const [isAuthorizedPersonMobileLocked, setIsAuthorizedPersonMobileLocked] = useState<boolean>(false);

    const [isAuthorizedPersonGSTLocked, setIsAuthorizedPersonGSTLocked] = useState<boolean>(false);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    const [showAgreementUploadModal, setShowAgreementUploadModal] = useState<boolean>(false);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const [editingInstituteId, setEditingInstituteId] = useState<string | null>(null);

    const [showAuthorizedPersonConfirmModal, setShowAuthorizedPersonConfirmModal] = useState<boolean>(false);

    const [authorisedPersons, setAuthorisedPersons] = useState<IAuthorizedPersonDraft[]>([]);

    const [editingAuthorizedPersonId, setEditingAuthorizedPersonId] = useState<string | null>(null);

    const [agreementFile, setAgreementFile] = useState<File | null>(null);

    const [agreementPreviewUrl, setAgreementPreviewUrl] = useState<string>("");

    const [agreementFileError, setAgreementFileError] = useState<string>("");

    const [impersonateModal, setImpersonateModal] = useState<boolean>(false);

    const [userId, setUserId] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        if (!agreementFile) {
            setAgreementPreviewUrl("");
            return undefined;
        }

        const previewUrl = URL.createObjectURL(agreementFile);
        setAgreementPreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [agreementFile]);

    const setLoadingState = (nextLoading: boolean, message = ""): void => {
        setLoading(nextLoading);
        setLoadingMessage(nextLoading ? message : "");
    };

    const { create } = usePermission("ManageEducationInstitute", ["create"])();

    const decryptValueOrFallback = (value?: string | null): string => {
        if (!value) return "";

        const decryptedValue = decryptVAPTData(value);
        return decryptedValue || value;
    };

    const buildValidationState = (detail: IConfirmDetail): IValidation => {
        const emailValue = detail.emailID?.trim().toLowerCase() || "";
        const mobileValue = detail.mobileNumber?.trim() || "";

        return {
            emailID: IsStringNullEmptyOrUndefined(emailValue)
                ? validationMessages.emailRequired
                : !EMAIL_PATTERN.test(emailValue)
                    ? validationMessages.emailInvalid
                    : "",
            mobileNumber: IsStringNullEmptyOrUndefined(mobileValue)
                ? validationMessages.mobileNumberRequired
                : !(INDIAN_MOBILE_NUMBER_PATTERN.test(mobileValue) && mobileValue.length === 10)
                    ? validationMessages.mobileNumberInvalid
                    : "",
        };
    };

    const getDecryptedPanDetails = (data: IAddPanCardResponse["data"]): IConfirmDetail => {
        const decryptedGstDetails = data.gstNumber?.map((gstDetail) => ({
            ...gstDetail,
            gstin: gstDetail.gstin ? decryptVAPTData(gstDetail.gstin) : "",
            state: gstDetail.state ? decryptVAPTData(gstDetail.state) : "",
        })) || null;

        const primaryGstDetail = decryptedGstDetails?.[0] || null;

        return {
            ...initialConfirmDetail,
            ...data,
            emailID: decryptValueOrFallback(data.emailID),
            mobileNumber: decryptValueOrFallback(data.mobileNumber),
            panNumber: decryptValueOrFallback(data.panNumber),
            gstNumber: primaryGstDetail?.gstin || "",
            gstDetails: decryptedGstDetails,
            dob: decryptValueOrFallback(data.dob),
            address: decryptValueOrFallback(data.address),
            state: data.state
                ? decryptValueOrFallback(data.state)
                : primaryGstDetail?.state || "",
            city: decryptValueOrFallback(data.city),
            zipCode: decryptValueOrFallback(data.zipCode),
            tradeName: decryptValueOrFallback(data.tradeName),
            website: data.website || "",
        };
    };

    const resetInstitutePanDialog = (): void => {
        setShowInstitutePanDialog(false);
        setFormValues({ panNumber: "" });
        setFormErrors({ panNumber: "" });
        setIsFormSubmitted(false);
    };

    const resetAuthorizedPersonFlow = (): void => {
        setShowAuthorizedPersonPanDialog(false);
        setShowAuthorizedPersonConfirmModal(false);
        setAuthorizedPersonFormValues({ panNumber: "" });
        setAuthorizedPersonFormErrors({ panNumber: "" });
        setAuthorizedPersonDetail(initialAuthorizedPersonDetail);
        setAuthorizedPersonValidation(initialAuthorizedPersonValidation);
        setIsAuthorizedPersonFormSubmitted(false);
        setIsAuthorizedPersonEmailLocked(false);
        setIsAuthorizedPersonMobileLocked(false);
        setIsAuthorizedPersonGSTLocked(false);
        setEditingAuthorizedPersonId(null);
    };

    const onPageChange = (event: PaginatorPageChangeEvent): void => {
        setFilterReq((prev) => ({
            ...prev,
            pageSize: event.rows,
            pageNumber: event.page,
        }));
    };

    const fetchInstitutes = async (): Promise<void> => {
        setLoading(true);

        const response = await getAllEducationInstitutesAPI({
            pageNumber: filterReq.pageNumber,
            pageSize: filterReq.pageSize,
            search: filterReq.searchText,
            stateSearch: selectedState?.name ? encryptVAPTData(selectedState.name) : "",
        });

        if (!response) {
            setLoading(false);
            return;
        }

        if (response.statusCode === 200) {
            setInstitutes(response?.data?.educationalInstituteList || []);
            setTotalRecords(response?.data?.totalCount || 0);
        }

        setLoading(false);
    }

    const fetchStatesList = async (): Promise<void> => {
        const response: IFetchStateResponse = await fetchStatesAPI();

        if (!response) return;

        if (response.statusCode === 200) {
            setStateOptions(response.data || []);
        }
    };

    const statusBodyTemplate = (rowData: IEducationInstitutes): JSX.Element => {
        const statusClass = rowData.isActive ? "greenLine" : "redLine";
        const statusText = rowData.isActive ? "Active" : "Inactive";

        return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
    };

    const actionBodyTemplate = (rowData: IEducationInstitutes): JSX.Element => {
        const viewId = `education-view-${rowData.id}`;
        const editId = `education-edit-${rowData.id}`;
        const assignId = `education-assign-${rowData.id}`;

        return (
            <>
                <Tooltip target={`#${viewId}`} position="top" />
                <Tooltip target={`#${editId}`} position="top" />
                <Tooltip target={`#${assignId}`} position="top" />

                <Button
                    id={viewId}
                    className="trash-icon p-0 me-2"
                    data-pr-tooltip="View Institute"
                    onClick={() =>
                        navigate(
                            `${RoutePathConstant.private.educationManagedInstitute}/${rowData.id}`,
                        )
                    }
                >
                    <i className='icon-eye' />
                </Button>

                {create && (
                    <>
                        <Button
                            id={editId}
                            className="trash-icon p-0 me-2"
                            data-pr-tooltip="Edit Institute"
                            onClick={() => void handleOpenEditInstitute(rowData)}
                        >
                            <i className='icon-edit' />
                        </Button>

                        <Button
                            id={assignId}
                            className="trash-icon p-0"
                            data-pr-tooltip="View BRE"
                            onClick={() =>
                                navigate(
                                    RoutePathConstant.private.breBuilder.replace(
                                        ":id",
                                        rowData.id.toString()
                                    )
                                )
                            }
                        >
                            <i className='icon-security-user' />
                        </Button>
                    </>
                )}
            </>
        );
    };

    const handleImpersonate = (userId: string): void => {
        setUserId(userId);
        setImpersonateModal(true);
    };

    const handleCloseInstituteFlow = (): void => {
        resetInstitutePanDialog();
        setShowConfirmModal(false);
        setConfirmDetail(initialConfirmDetail);
        setValidation(initialInstituteValidation);
        setAuthorisedPersons([]);
        setAgreementFile(null);
        setAgreementFileError("");
        setIsEditMode(false);
        setEditingInstituteId(null);
        resetAuthorizedPersonFlow();
    };

    const handleOpenEditInstitute = async (rowData: IEducationInstitutes): Promise<void> => {
        if (!create) {
            toastError("You do not have permission to edit institutes.");
            return;
        }

        setLoadingState(true, "Loading institute details...");

        const detailResponse: IGetAllEducationInstitutesDetailedResponse =
            await getEducationInstituteByIdAPI(rowData.id);

        if (!detailResponse || detailResponse.statusCode !== 200) {
            toastError(detailResponse?.message);
            setLoadingState(false);
            return;
        }

        const detailData = detailResponse.data;

        const prefilledDetail: IConfirmDetail = {
            ...initialConfirmDetail,
            fullName: detailData.fullName || rowData.fullName || "",
            emailID: decryptValueOrFallback(detailData.email || rowData.email),
            mobileNumber: decryptValueOrFallback(detailData.phoneNumber || rowData.phoneNumber),
            panNumber: decryptValueOrFallback(detailData.panNumber || rowData.panNumber),
            category: detailData.constitutionOfInstitute || rowData.constitutionOfInstitute || "",
            gstNumber: decryptValueOrFallback(detailData.gstNumber),
            constitutionOfInstitute: detailData.constitutionOfInstitute || rowData.constitutionOfInstitute || "",
            constitution: detailData.constitutionOfInstitute || rowData.constitutionOfInstitute || "",
            website: detailData.website || rowData.website || "",
            tradeName: decryptValueOrFallback(detailData.tradeName || rowData.tradeName),
            dob: decryptValueOrFallback(detailData.dob || rowData.dob),
            address: decryptValueOrFallback(detailData.address || rowData.address),
            state: decryptValueOrFallback(detailData.state || rowData.state),
            city: decryptValueOrFallback(detailData.city || rowData.city),
            zipCode: decryptValueOrFallback(detailData.zipCode || rowData.zipCode),
        };

        const prefilledAuthorizedPersons: IAuthorizedPersonDraft[] = (detailData.authorisedPersons || []).map((person, index) => {
            const decryptedDob = decryptValueOrFallback(person.dateOfBirth);
            const constitution = decryptValueOrFallback(
                person.constitutionOfInstitute || person.constitution,
            );

            return {
                ...initialAuthorizedPersonDetail,
                id: person.id || `${Date.now()}-${index + 1}`,
                authRecordID: person.id || null,
                fullName: person.name || "",
                firstName: person.name || "",
                emailID: decryptValueOrFallback(person.emailAddress),
                mobileNumber: decryptValueOrFallback(person.mobileNumber),
                panNumber: decryptValueOrFallback(person.panNumber),
                dob: decryptedDob ? decryptedDob.split("T")[0] : "",
                address: decryptValueOrFallback(person.address),
                gender: person.gender || "",
                category: constitution,
                constitutionOfInstitute: constitution,
                constitution,
                profilePhoto: null,
                profilePhotoPath: person.profilePhotoPath || null,
            };
        });

        setIsEditMode(true);
        setEditingInstituteId(rowData.id);
        setShowInstitutePanDialog(false);
        setShowAgreementUploadModal(false);
        setAgreementFile(null);
        setAgreementFileError("");
        setAuthorisedPersons(prefilledAuthorizedPersons);
        setConfirmDetail(prefilledDetail);
        setValidation({
            ...initialInstituteValidation,
            ...buildValidationState(prefilledDetail),
        });
        setShowConfirmModal(true);
        setLoadingState(false);
    };

    const handleVerifyInstitutePan = async (): Promise<void> => {
        setIsFormSubmitted(true);

        const isValid: boolean = PAN_NUMBER_PATTERN.test(formValues.panNumber);

        if (!isValid) {
            setFormErrors({
                panNumber: validationMessages.panNumberInvalid,
            });
            return;
        }

        setLoadingState(true, "Fetching institute PAN details...");

        const encryptedPayload = {
            panNumber: encryptVAPTData(formValues.panNumber),
        };

        const response: IAddPanCardResponse = await fetchDetailsByPan(encryptedPayload);

        if (!response) return;

        if (response.statusCode === 200) {
            const decryptedData = getDecryptedPanDetails(response.data);

            setConfirmDetail(decryptedData);

            setValidation({
                ...initialInstituteValidation,
                ...buildValidationState(decryptedData),
            });

            setShowInstitutePanDialog(false);

            setShowConfirmModal(true);
        } else {
            toastError(response.message);
        }
        setLoadingState(false);
    };

    const handleReset = () => {
        resetInstitutePanDialog();
        setValidation(initialInstituteValidation);
        setShowConfirmModal(false);
        setConfirmDetail(initialConfirmDetail);
        setAuthorisedPersons([]);
        setShowAgreementUploadModal(false);
        setAgreementFile(null);
        setAgreementFileError("");
        setIsEditMode(false);
        setEditingInstituteId(null);
        resetAuthorizedPersonFlow();
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
                onClick={() => void handleOpenAgreementUploadModal()}
                disabled={loading}
            >
                {loading ? (loadingMessage || "Processing...") : isEditMode ? "Update Institute" : "Save Institute"}
            </Button>
        </div>
    );

    const handleChange = (fieldName: string, value: string): void => {
        if (fieldName === "panNumber") {
            const isValid: boolean = PAN_NUMBER_PATTERN.test(value);

            setFormErrors((prevErrors) => ({
                ...prevErrors,
                panNumber:
                    !value || IsStringNullEmptyOrUndefined(value) || !isValid
                        ? validationMessages.panNumberInvalid
                        : "",
            }));
        }

        setFormValues({ ...formValues, [fieldName]: value });
    };

    const handleAuthorizedPersonPanChange = (value: string): void => {
        const isValid: boolean = PAN_NUMBER_PATTERN.test(value);

        setAuthorizedPersonFormErrors({
            panNumber:
                !value || IsStringNullEmptyOrUndefined(value) || !isValid
                    ? validationMessages.panNumberInvalid
                    : "",
        });

        setAuthorizedPersonFormValues({ panNumber: value });
    };

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
    };

    const handleChangeGST = (value: string) => {
        const normalizedValue = value.toUpperCase();
        const isValid = GST_NUMBER_PATTERN.test(normalizedValue);

        setValidation((prev) => ({
            ...prev,
            gstNumber: IsStringNullEmptyOrUndefined(normalizedValue)
                ? ""
                : !isValid
                    ? validationMessages.gstNumberInvalid
                    : "",
        }));

        setConfirmDetail((prev) => ({
            ...prev,
            gstNumber: normalizedValue,
        }));
    };

    const handleInstituteWebsiteChange = (value: string) => {
        setValidation((prev) => ({
            ...prev,
            website: !value || WEBSITE_PATTERN.test(value) ? "" : validationMessages.websiteInvalid,
        }));

        setConfirmDetail((prev) => ({
            ...prev,
            website: value,
        }));
    };

    const handleInstituteTradeNameChange = (value: string) => {
        setValidation((prev) => ({
            ...prev,
            tradeName: !value || (TRADE_NAME_PATTERN.test(value.trim()) && value.trim().length >= 2 && value.trim().length <= 100)
                ? ""
                : validationMessages.tradeNameInvalid,
        }));
        setConfirmDetail((prev) => ({
            ...prev,
            tradeName: value,
        }));
    };

    const handleAuthorizedPersonEmailChange = (value: string) => {
        const isValid: boolean = EMAIL_PATTERN.test(value);

        setAuthorizedPersonValidation({
            ...authorizedPersonValidation,
            emailID: IsStringNullEmptyOrUndefined(String(value))
                ? validationMessages.emailRequired
                : !isValid
                    ? validationMessages.emailInvalid
                    : "",
        });

        setAuthorizedPersonDetail((prev) => ({
            ...prev,
            emailID: value,
        }));
    };

    const handleAuthorizedPersonMobileChange = (value: string) => {
        const isValid: boolean =
            INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

        setAuthorizedPersonValidation({
            ...authorizedPersonValidation,
            mobileNumber: IsStringNullEmptyOrUndefined(String(value))
                ? validationMessages.mobileNumberRequired
                : !isValid
                    ? validationMessages.mobileNumberInvalid
                    : "",
        });

        setAuthorizedPersonDetail((prev) => ({
            ...prev,
            mobileNumber: value,
        }));
    };

    const handleAuthorizedPersonAddressChange = (value: string) => {
        setAuthorizedPersonDetail((prev) => ({
            ...prev,
            address: value,
        }));
    };

    const handleAuthorizedPersonGstChange = (value: string) => {
        const normalizedValue = value.toUpperCase();
        const isValid = GST_NUMBER_PATTERN.test(normalizedValue);

        setAuthorizedPersonValidation((prev) => ({
            ...prev,
            gstNumber: IsStringNullEmptyOrUndefined(normalizedValue)
                ? ""
                : !isValid
                    ? validationMessages.gstNumberInvalid
                    : "",
        }));

        setAuthorizedPersonDetail((prev) => ({
            ...prev,
            gstNumber: normalizedValue,
        }));
    };

    const handleAuthorizedPersonProfilePhotoChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        const selectedFile = event.target.files?.[0] || null;
        const input = event.target;

        if (!selectedFile) {
            setAuthorizedPersonDetail((prev) => ({
                ...prev,
                profilePhoto: null,
                profilePhotoPath: null,
            }));
            setAuthorizedPersonValidation((prev) => ({
                ...prev,
                profilePhoto: "Please upload profile photo.",
            }));
            input.value = "";
            return Promise.resolve();
        }

        if (!isImageFile(selectedFile)) {
            toastError("Invalid file type. Only JPG, JPEG, or PNG images are allowed.");
            input.value = "";
            return Promise.resolve();
        }

        if (!isFileSizeWithinLimit(selectedFile)) {
            setAuthorizedPersonDetail((prev) => ({
                ...prev,
                profilePhoto: null,
                profilePhotoPath: null,
            }));
            setAuthorizedPersonValidation((prev) => ({
                ...prev,
                profilePhoto: getFileSizeLimitErrorMessage("Profile photo"),
            }));
            input.value = "";
            return Promise.resolve();
        }

        const uploadFormData = new FormData();
        uploadFormData.append("documentFile", selectedFile);
        uploadFormData.append("documentFor", String(DocumentForFileUploadType.INSTITUTE));

        setLoadingState(true, "Uploading profile photo...");

        return uploadCommonDocumentAPI(uploadFormData)
            .then((response) => {
                if (!response || response.statusCode !== 200) {
                    toastError(response?.message);
                    setAuthorizedPersonDetail((prev) => ({
                        ...prev,
                        profilePhoto: null,
                        profilePhotoPath: null,
                    }));
                    setAuthorizedPersonValidation((prev) => ({
                        ...prev,
                        profilePhoto: "Please upload profile photo.",
                    }));
                    input.value = "";
                    return;
                }

                const profilePhotoPath: string | null = response.data.path;

                if (!profilePhotoPath) {
                    toastError("Profile photo path was not returned from upload.");
                    setAuthorizedPersonDetail((prev) => ({
                        ...prev,
                        profilePhoto: null,
                        profilePhotoPath: null,
                    }));
                    setAuthorizedPersonValidation((prev) => ({
                        ...prev,
                        profilePhoto: "Please upload profile photo.",
                    }));
                    input.value = "";
                    return;
                }

                setAuthorizedPersonDetail((prev) => ({
                    ...prev,
                    profilePhoto: selectedFile,
                    profilePhotoPath,
                }));
                setAuthorizedPersonValidation((prev) => ({
                    ...prev,
                    profilePhoto: "",
                }));
            })
            .finally(() => {
                setLoadingState(false);
            });
    };

    const handleOpenAuthorizedPersonPanDialog = (): void => {
        if (authorisedPersons.length >= 3) {
            toastError("You can add up to 3 authorized persons only.");
            return;
        }

        resetAuthorizedPersonFlow();
        setShowAuthorizedPersonPanDialog(true);
    };

    const handleVerifyAuthorizedPersonPan = async (): Promise<void> => {
        setIsAuthorizedPersonFormSubmitted(true);

        const isValid: boolean = PAN_NUMBER_PATTERN.test(authorizedPersonFormValues.panNumber);

        if (!isValid) {
            setAuthorizedPersonFormErrors({
                panNumber: validationMessages.panNumberInvalid,
            });
            return;
        }

        const panNumber = authorizedPersonFormValues.panNumber.trim().toUpperCase();
        const institutePanNumber = (confirmDetail.panNumber ?? "").trim().toUpperCase();
        const authorizedPersonPanNumbers = authorisedPersons.map((person) =>
            decryptValueOrFallback(person.panNumber).trim().toUpperCase()
        );

        if (panNumber === institutePanNumber) {
            setAuthorizedPersonFormErrors({
                panNumber: validationMessages.authorizedPersonPanMatchesInstitute,
            });
            return;
        }

        if (authorizedPersonPanNumbers.includes(panNumber)) {
            setAuthorizedPersonFormErrors({
                panNumber: validationMessages.authorizedPersonPanDuplicateInstitute,
            });
            return;
        }

        setLoadingState(true, "Fetching authorized person PAN details...");


        const response: IAddPanCardResponse = await fetchDetailsByPan({
            panNumber: encryptVAPTData(authorizedPersonFormValues.panNumber),
        });

        if (!response) return;

        if (response.statusCode === 200) {
            const decryptedData = getDecryptedPanDetails(response.data);

            setAuthorizedPersonDetail({
                ...decryptedData,
                authRecordID: null,
                profilePhoto: null,
                profilePhotoPath: null,
            });

            setAuthorizedPersonValidation({
                ...initialAuthorizedPersonValidation,
                ...buildValidationState(decryptedData),
            });

            setIsAuthorizedPersonEmailLocked(!IsStringNullEmptyOrUndefined(response.data.emailID ?? ""));

            setIsAuthorizedPersonMobileLocked(!IsStringNullEmptyOrUndefined(response.data.mobileNumber ?? ""));

            setIsAuthorizedPersonGSTLocked(Boolean(response.data.gstNumber?.length));

            setShowAuthorizedPersonPanDialog(false);

            setShowAuthorizedPersonConfirmModal(true);
        } else {
            toastError(response.message);
        }

        setLoadingState(false);
    };

    const handleEditAuthorizedPerson = (person: IAuthorizedPersonDraft): void => {
        setEditingAuthorizedPersonId(person.id);
        setAuthorizedPersonDetail({
            ...person,
            emailID: decryptValueOrFallback(person.emailID),
            mobileNumber: decryptValueOrFallback(person.mobileNumber),
            panNumber: decryptValueOrFallback(person.panNumber),
            dob: decryptValueOrFallback(person.dob),
            address: decryptValueOrFallback(person.address),
            gstNumber: decryptValueOrFallback(person.gstNumber),
            constitutionOfInstitute: decryptValueOrFallback(person.constitutionOfInstitute),
            constitution: decryptValueOrFallback(person.constitution),
            category: decryptValueOrFallback(person.category),
            profilePhoto: null,
        });
        setAuthorizedPersonValidation({
            ...initialAuthorizedPersonValidation,
            ...buildValidationState(person),
            profilePhoto: person.profilePhotoPath ? "" : "Please upload profile photo.",
        });
        setIsAuthorizedPersonFormSubmitted(false);
        setIsAuthorizedPersonEmailLocked(false);
        setIsAuthorizedPersonMobileLocked(false);
        setIsAuthorizedPersonGSTLocked(false);
        setShowAuthorizedPersonPanDialog(false);
        setShowAuthorizedPersonConfirmModal(true);
    };

    const handleSaveAuthorizedPerson = (): void => {
        setIsAuthorizedPersonFormSubmitted(true);

        const panNumber = (authorizedPersonDetail.panNumber ?? "").trim().toUpperCase();
        const institutePanNumber = (confirmDetail.panNumber ?? "").trim().toUpperCase();
        const duplicateAuthorizedPerson = authorisedPersons.some((person) =>
            person.id !== editingAuthorizedPersonId &&
            decryptValueOrFallback(person.panNumber).trim().toUpperCase() === panNumber
        );

        if (panNumber === institutePanNumber) {
            toastError(validationMessages.authorizedPersonPanMatchesInstitute);
            return;
        }

        if (duplicateAuthorizedPerson) {
            toastError(validationMessages.authorizedPersonPanDuplicateInstitute);
            return;
        }

        const nextValidation: IAuthorizedPersonValidation = {
            ...buildValidationState(authorizedPersonDetail),
            gstNumber: IsStringNullEmptyOrUndefined(authorizedPersonDetail.gstNumber ?? "")
                ? ""
                : !GST_NUMBER_PATTERN.test(authorizedPersonDetail.gstNumber ?? "")
                    ? validationMessages.gstNumberInvalid
                    : "",
            profilePhoto: authorizedPersonDetail.profilePhotoPath ? "" : "Please upload profile photo.",
        };

        setAuthorizedPersonValidation(nextValidation);

        if (!IsFormValid(nextValidation)) {
            return;
        }

        if (editingAuthorizedPersonId) {
            setAuthorisedPersons((prev) =>
                prev.map((person) =>
                    person.id === editingAuthorizedPersonId
                        ? {
                            ...person,
                            ...authorizedPersonDetail,
                            id: editingAuthorizedPersonId,
                            authRecordID: person.authRecordID || null,
                            profilePhoto: authorizedPersonDetail.profilePhoto || null,
                            profilePhotoPath: authorizedPersonDetail.profilePhotoPath || null,
                        }
                        : person,
                ),
            );
        } else {
            setAuthorisedPersons((prev) => [
                ...prev,
                {
                    ...authorizedPersonDetail,
                    id: `${Date.now()}-${prev.length + 1}`,
                    authRecordID: null,
                    profilePhoto: authorizedPersonDetail.profilePhoto || null,
                    profilePhotoPath: authorizedPersonDetail.profilePhotoPath || null,
                },
            ]);
        }

        resetAuthorizedPersonFlow();
    };

    const handleRemoveAuthorizedPerson = async (person: IAuthorizedPersonDraft): Promise<void> => {
        if (isEditMode && editingInstituteId && person.authRecordID) {
            setLoadingState(true, "Deleting authorized person...");

            const response = await deleteInstituteNBFCAuthRecordAPI({
                parentEntityID: editingInstituteId,
                authRecordID: person.authRecordID,
                deleteType: DeleteAuthorizedPersonType.INSTITUTE,
            });

            if (!response || response.statusCode !== 200) {
                toastError(response?.message);
                setLoadingState(false);
                return;
            }

            toastSuccess(response.message);
            setLoadingState(false);
        }

        setAuthorisedPersons((prev) => prev.filter((item) => item.id !== person.id));

        if (editingAuthorizedPersonId === person.id) {
            resetAuthorizedPersonFlow();
        }
    };

    const buildAuthorizedPersonPayload = (): IAuthorizedPersonRegisterRequest[] =>
        authorisedPersons.map((person) => ({
            name: person.fullName,
            dateOfBirth: person.dob ? encryptVAPTData(person.dob) : undefined,
            panNumber: person.panNumber ? encryptVAPTData(person.panNumber) : "",
            address: person.address ? encryptVAPTData(person.address) : undefined,
            gender: person.gender || undefined,
            constitution: person.category,
            userType: CLIENT_ROLE.AUTHORIZED_PERSON,
            emailAddress: person.emailID ? encryptVAPTData(person.emailID.trim().toLowerCase()) : "",
            mobileNumber: person.mobileNumber ? encryptVAPTData(person.mobileNumber.trim()) : "",
            constitutionOfInstitute: person.category,
            profilePhotoPath: person.profilePhotoPath || null,
        }));

    const buildInstitutePayload = (): IRegisterParams => ({
        emailID: encryptVAPTData(confirmDetail.emailID?.trim().toLowerCase() || ""),
        mobileNumber: encryptVAPTData(confirmDetail.mobileNumber?.trim() || ""),
        extraToken: encryptData(extraToken()),
        panNumber: encryptVAPTData(confirmDetail.panNumber || ""),
        userType: CLIENT_ROLE.EDUCATIONAL_INSTITUTE,
        isUserDetailsRequired: true,
        parentID: userID,
        fullName: confirmDetail.fullName,
        firstName: confirmDetail.firstName,
        middleName: confirmDetail.middleName,
        lastName: confirmDetail.lastName,
        category: confirmDetail.category,
        dob: confirmDetail.dob ? encryptVAPTData(confirmDetail.dob) : null,
        address: confirmDetail.address ? encryptVAPTData(confirmDetail.address) : null,
        state: confirmDetail.state ? encryptVAPTData(confirmDetail.state) : null,
        city: confirmDetail.city ? encryptVAPTData(confirmDetail.city) : null,
        zipCode: confirmDetail.zipCode ? encryptVAPTData(confirmDetail.zipCode) : null,
        maskedAadhaar: confirmDetail.maskedAadhaar ? encryptVAPTData(confirmDetail.maskedAadhaar) : null,
        gender: confirmDetail.gender || null,
        gstNumber: confirmDetail.gstNumber ? encryptVAPTData(confirmDetail.gstNumber) : null,
        constitutionOfInstitute: confirmDetail.category,
        tradeName: confirmDetail.tradeName ? encryptVAPTData(confirmDetail.tradeName) : null,
        website: confirmDetail.website || null,
        authorisedPersons: buildAuthorizedPersonPayload(),
        whiteLabelTenantId: whiteLabelSettings?.id || "",
        masterCpID: userID || "",
    });

    const handleCreateInstitute = async (): Promise<IAddEducationalInstituteResponse> =>
        addEducationalInstituteAPI(buildInstitutePayload());

    const handleEditInstitute = async (): Promise<IAddEducationalInstituteResponse | null> => {
        if (!editingInstituteId) {
            toastError("Institute ID is missing for update.");
            return null;
        }

        const payload = {
            ...buildInstitutePayload(),
            instituteID: editingInstituteId,
            isEditMode: true,
        } as IRegisterParams & { instituteID: string; isEditMode: boolean };

        return updateEducationalInstituteAPI(payload);
    };

    const handleSaveInstitute = async (): Promise<void> => {
        setIsFormSubmitted(true);

        const nextValidation: IInstituteConfirmValidation = {
            ...buildValidationState(confirmDetail),
            gstNumber: IsStringNullEmptyOrUndefined(confirmDetail.gstNumber ?? "")
                ? ""
                : !GST_NUMBER_PATTERN.test(confirmDetail.gstNumber ?? "")
                    ? validationMessages.gstNumberInvalid
                    : "",
            website: !confirmDetail.website || WEBSITE_PATTERN.test(confirmDetail.website) ? "" : validationMessages.websiteInvalid,
            tradeName: !confirmDetail.tradeName || (TRADE_NAME_PATTERN.test(confirmDetail.tradeName.trim()) && confirmDetail.tradeName.trim().length >= 2 && confirmDetail.tradeName.trim().length <= 100)
                ? ""
                : validationMessages.tradeNameInvalid,
        };

        setValidation(nextValidation);

        if (!IsFormValid(nextValidation)) {
            return;
        }

        setLoadingState(true, isEditMode ? "Updating institute..." : "Saving institute...");

        const response = isEditMode
            ? await handleEditInstitute()
            : await handleCreateInstitute();

        if (!response) return;

        if (response.statusCode === 200) {
            const instituteID = isEditMode ? editingInstituteId : response?.data?.userID;

            if (agreementFile && instituteID) {
                const agreementUploadPayload = new FormData();

                agreementUploadPayload.append("documentFile", agreementFile);
                agreementUploadPayload.append("instituteID", instituteID);
                agreementUploadPayload.append("documentType", String(DocumentFileTypeForInstitute.AGREEMENT));

                const agreementUploadResponse = await uploadEducationalInstituteAgreementAPI(
                    agreementUploadPayload,
                );

                if (!agreementUploadResponse || agreementUploadResponse.statusCode !== 200) {
                    toastError(agreementUploadResponse?.message);
                    setLoadingState(false);
                    await fetchInstitutes();
                    return;
                }
            }

            toastSuccess(response.message);
            handleCloseInstituteFlow();
            await fetchInstitutes();
        } else {
            toastError(response.message);
        }

        setLoadingState(false);
    };

    const handleOpenAgreementUploadModal = async (): Promise<void> => {
        setIsFormSubmitted(true);

        const nextValidation: IInstituteConfirmValidation = {
            ...buildValidationState(confirmDetail),
            gstNumber: IsStringNullEmptyOrUndefined(confirmDetail.gstNumber ?? "")
                ? ""
                : !GST_NUMBER_PATTERN.test(confirmDetail.gstNumber ?? "")
                    ? validationMessages.gstNumberInvalid
                    : "",
            website: !confirmDetail.website || WEBSITE_PATTERN.test(confirmDetail.website) ? "" : validationMessages.websiteInvalid,
            tradeName: !confirmDetail.tradeName || (TRADE_NAME_PATTERN.test(confirmDetail.tradeName.trim()) && confirmDetail.tradeName.trim().length >= 2 && confirmDetail.tradeName.trim().length <= 100)
                ? ""
                : validationMessages.tradeNameInvalid,
        };

        setValidation(nextValidation);

        if (!IsFormValid(nextValidation)) {
            return;
        }

        setAgreementFileError("");
        setShowAgreementUploadModal(true);
    };

    const handleAgreementFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = event.target.files?.[0] || null;

        if (!selectedFile) {
            setAgreementFile(null);
            setAgreementFileError("");
            return;
        }

        if (!isPdfFile(selectedFile)) {
            setAgreementFile(null);
            setAgreementFileError("Only PDF file are allowed.");
            return;
        }

        if (!isFileSizeWithinLimit(selectedFile)) {
            setAgreementFile(null);
            setAgreementFileError(getFileSizeLimitErrorMessage("Agreement file"));
            event.target.value = "";
            return;
        }

        setAgreementFile(selectedFile);
        setAgreementFileError("");
    };

    const handleOpenAgreementPreview = (): void => {
        if (agreementPreviewUrl) {
            window.open(agreementPreviewUrl, "_blank", "noopener,noreferrer");
        }
    };

    const handleDownloadAgreement = (): void => {
        if (!agreementPreviewUrl || !agreementFile) return;

        const link = document.createElement("a");
        link.href = agreementPreviewUrl;
        link.download = agreementFile.name;
        link.click();
    };

    const handleConfirmAgreementUpload = async (): Promise<void> => {
        setShowAgreementUploadModal(false);
        await handleSaveInstitute();
    };

    useDebouncedEffect(
        () => {
            if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
                setFilterReq((prev) => ({
                    ...prev,
                    searchText: searchText.trim(),
                    pageNumber: 0,
                }));
            }
        },
        debounceTimeInMilliseconds,
        [searchText],
    );

    useEffect(() => {
        fetchInstitutes();
    }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText, selectedState]);

    useEffect(() => {
        fetchStatesList();
    }, []);

    return (
        <>
            <div className="whiteBoxHldr p-24">
                <Loader isLoading={loading} />

                <div className="row">
                    <div className="col-lg-12">
                        <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
                            <TableTitle title="Manage Education Institute" />

                            <div className="BtnRightHldr flex-md-wrap">
                                <SearchButton
                                    searchText={searchText}
                                    setSearchText={setSearchText}
                                    placeholder="Search by code and name"
                                />

                                <div className="form-group">
                                    <Dropdown
                                        style={{ width: "220px" }}
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.value);
                                            setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                                        }}
                                        options={stateOptions}
                                        optionLabel="name"
                                        showClear={selectedState !== null}
                                        placeholder="Filter by State"
                                    />
                                </div>

                                {create && (
                                    <div className="form-group">
                                        <Button
                                            onClick={() => setShowInstitutePanDialog(true)}
                                            className="btn btn-orange"
                                        >
                                            <i className="bi bi-plus-circle me-2" />
                                            Add Institute
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="whiteBoxHldr">
                            <div className="table-responsive">
                                <DataTable
                                    className="tableMain"
                                    value={institutes}
                                    emptyMessage="No educational institutes found."
                                >
                                    <Column field="code" header="Code" />

                                    <Column body={(rowData: IEducationInstitutes) => {
                                        const tooltipId: string = `tooltip-${rowData.id}`;

                                        const style: React.CSSProperties = {
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                        };

                                        return (
                                            <>
                                                <span
                                                    id={tooltipId}
                                                    style={style}
                                                    onClick={() => handleImpersonate(rowData.id)}
                                                >
                                                    {rowData.tradeName ? decryptVAPTData(rowData.tradeName) : rowData.fullName}
                                                </span>
                                                <Tooltip
                                                    target={`#${tooltipId}`}
                                                    content="Login as Institute"
                                                    position="top"
                                                />
                                            </>
                                        )
                                    }
                                    } header="Name" />

                                    <Column body={(rowData: IEducationInstitutes) =>
                                        (rowData.constitutionOfInstitute || "-")
                                    } header="Category" />

                                    <Column
                                        body={(rowData: IEducationInstitutes) =>
                                            rowData.phoneNumber ? formatMobileNumber(decryptVAPTData(rowData.phoneNumber)) : "-"
                                        }
                                        header="Mobile Number"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) => rowData.branchCount}
                                        header="Total Branches"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) =>
                                            rowData.city ? decryptVAPTData(rowData.city) : "-"
                                        }
                                        header="City"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) =>
                                            rowData.state ? decryptVAPTData(rowData.state) : "-"
                                        }
                                        header="State"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) =>
                                            formatDate(rowData.createdAt, "DD MMM, YYYY h:mm A")
                                        }
                                        header="Registered Date"
                                    />

                                    <Column body={statusBodyTemplate} header="Status" />

                                    <Column body={actionBodyTemplate} header="Action" />
                                </DataTable>
                            </div>

                            {!IsNullOrEmptyArray(institutes) && (
                                <PrimePaginator
                                    onPageChange={onPageChange}
                                    pageNumber={filterReq.pageNumber}
                                    pageSize={filterReq.pageSize}
                                    totalRecords={totalRecords}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div >

            <Dialog
                header="PAN Details"
                visible={showInstitutePanDialog}
                className="modalWrapper"
                onHide={handleCloseInstituteFlow}
                draggable={false}
                resizable={false}
                blockScroll
                style={{ width: "650px" }}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100 text-center"
                            onClick={handleCloseInstituteFlow}
                            disabled={loading}
                            label="Cancel"
                        />
                        <Button
                            className="btn btn-orange w-100 text-center"
                            onClick={handleVerifyInstitutePan}
                            disabled={loading}
                            label={loading ? (loadingMessage || "Processing...") : "Next"}
                        />
                    </div>
                }
            >
                <Loader isLoading={loading} />

                <div className="modal-content">
                    <div className="modal-body">
                        <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
                            Enter the PAN Card number to authenticate the educational institute
                            and continue with institute onboarding.
                        </p>

                        <div className="form-group mb-3">
                            <label className="form-label small" htmlFor="institutePanNumber">
                                PAN <sup>*</sup>
                            </label>
                            <InputText
                                id="institutePanNumber"
                                name="panNumber"
                                autoFocus
                                className="form-control"
                                placeholder="Enter PAN (e.g., ABCDE1234F)"
                                value={formValues.panNumber.toUpperCase()}
                                maxLength={10}
                                onChange={(e) =>
                                    handleChange(
                                        "panNumber",
                                        e.target.value.toUpperCase().trim()
                                    )
                                }
                            />
                            {formErrors.panNumber && (
                                <small className="error">{formErrors.panNumber}</small>
                            )}
                        </div>
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
                                <label className="form-label small" htmlFor="individualName">
                                    Institute Name
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
                                    Constitution
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

                                <InputText
                                    autoFocus
                                    id="emailAddress"
                                    name="emailAddress"
                                    value={confirmDetail.emailID ?? ""}
                                    placeholder="Enter Email Address"
                                    className="form-control"
                                    // disabled={isInstituteEmailLocked}
                                    // onPaste={(e) => e.preventDefault()}
                                    // onCopy={(e) => e.preventDefault()}
                                    // onCut={(e) => e.preventDefault()}
                                    onChange={(e) =>
                                        handleChangeEmail(e.target.value.trim().toLowerCase())
                                    }
                                />

                                {validation.emailID && (
                                    <span className="error">{validation.emailID}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="mobileNumber">
                                    Mobile Number <sup>*</sup>
                                </label>

                                <InputText
                                    autoFocus
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={confirmDetail.mobileNumber ?? ""}
                                    placeholder="Enter Mobile Number"
                                    className="form-control"
                                    maxLength={10}
                                    // disabled={isInstituteMobileLocked}
                                    onChange={(e) => handleChangeMobile(e.target.value)}
                                    onKeyPress={(e) =>
                                        restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                    }
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                                />

                                {validation.mobileNumber && (
                                    <span className="error">{validation.mobileNumber}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="gstDetails">
                                    GST Details
                                </label>

                                <InputText
                                    id="gstDetails"
                                    value={confirmDetail.gstNumber ?? ""}
                                    className="form-control"
                                    placeholder='GST Details'
                                    maxLength={15}
                                    onChange={(e) => handleChangeGST(e.target.value)}
                                // disabled
                                />
                                {validation.gstNumber && (
                                    <span className="error">{validation.gstNumber}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="website">
                                    Website
                                </label>

                                <InputText
                                    id="website"
                                    value={confirmDetail.website ?? ""}
                                    placeholder="Enter Website"
                                    className="form-control"
                                    maxLength={255}
                                    onChange={(e) => handleInstituteWebsiteChange(e.target.value.trim())}
                                />
                                {validation.website && (
                                    <span className="error">{validation.website}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="tradeName">
                                    Trade Name
                                </label>

                                <InputText
                                    id="tradeName"
                                    value={confirmDetail.tradeName ?? ""}
                                    placeholder="Enter Trade Name"
                                    className="form-control"
                                    maxLength={100}
                                    onChange={(e) => handleInstituteTradeNameChange(e.target.value?.trimStart())}
                                />
                                {validation.tradeName && (
                                    <span className="error">{validation.tradeName}</span>
                                )}
                            </div>

                            <div className="form-group mb-0">
                                <div className="authorized-person-summary__header">
                                    <label className="form-label small mb-0 authorized-person-summary__title">
                                        Authorized Person Details
                                    </label>
                                    <Button
                                        type="button"
                                        className="btn btn-black-line authorized-person-summary__action"
                                        onClick={handleOpenAuthorizedPersonPanDialog}
                                        disabled={loading || authorisedPersons.length >= 3}
                                    >
                                        Add Authorized Person
                                    </Button>
                                </div>

                                {authorisedPersons.length > 0 ? (
                                    <div className="authorized-person-summary__list">
                                        {authorisedPersons.map((person, index) => (
                                            <div key={person.id} className="authorized-person-summary__card">
                                                <div className="authorized-person-summary__content">
                                                    <p className="authorized-person-summary__badge">
                                                        Authorized Person {index + 1}
                                                    </p>
                                                    <p className="authorized-person-summary__meta">
                                                        Name: {person.fullName || "-"}
                                                    </p>
                                                    <p className="authorized-person-summary__meta">
                                                        PAN: {person.panNumber || "-"}
                                                    </p>
                                                    <p className="authorized-person-summary__meta">
                                                        Email Address : {decryptValueOrFallback(person.emailID) || "-"}
                                                    </p>
                                                    <p className="authorized-person-summary__meta">
                                                        Mobile Number : {decryptValueOrFallback(person.mobileNumber) || "-"}
                                                    </p>
                                                    <p className="authorized-person-summary__address">
                                                        Address : {decryptValueOrFallback(person.address) || "-"}
                                                    </p>
                                                </div>
                                                <div className="authorized-person-summary__actions">
                                                    <Button
                                                        type="button"
                                                        className="trash-icon p-0 authorized-person-summary__icon-button"
                                                        onClick={() => handleEditAuthorizedPerson(person)}
                                                        aria-label={`Edit authorized person ${index + 1}`}
                                                    >
                                                        <i className='icon-edit' />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="trash-icon p-0 authorized-person-summary__delete"
                                                        onClick={() => handleRemoveAuthorizedPerson(person)}
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
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                header="Authorized Person PAN Details"
                visible={showAuthorizedPersonPanDialog}
                className="modalWrapper"
                onHide={resetAuthorizedPersonFlow}
                draggable={false}
                resizable={false}
                blockScroll
                style={{ width: "650px" }}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100 text-center"
                            onClick={resetAuthorizedPersonFlow}
                            disabled={loading}
                            label="Cancel"
                        />
                        <Button
                            className="btn btn-orange w-100 text-center"
                            onClick={handleVerifyAuthorizedPersonPan}
                            disabled={loading}
                            label={loading ? (loadingMessage || "Processing...") : "Next"}
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
                            <label className="form-label small" htmlFor="authorizedPersonPanNumber">
                                PAN <sup>*</sup>
                            </label>
                            <InputText
                                id="authorizedPersonPanNumber"
                                name="authorizedPersonPanNumber"
                                autoFocus
                                className="form-control"
                                placeholder="Enter PAN (e.g., ABCDE1234F)"
                                value={authorizedPersonFormValues.panNumber.toUpperCase()}
                                maxLength={10}
                                onChange={(e) =>
                                    handleAuthorizedPersonPanChange(
                                        e.target.value.toUpperCase().trim()
                                    )
                                }
                            />
                            {authorizedPersonFormErrors.panNumber && (
                                <small className="error">{authorizedPersonFormErrors.panNumber}</small>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={showAuthorizedPersonConfirmModal}
                header="Authorized Person Details"
                modal
                onHide={resetAuthorizedPersonFlow}
                className="modalWrapper"
                draggable={false}
                resizable={false}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100"
                            disabled={loading}
                            onClick={resetAuthorizedPersonFlow}
                        >
                            Cancel
                        </Button>

                        <Button
                            className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"} w-100`}
                            onClick={handleSaveAuthorizedPerson}
                            disabled={loading}
                        >
                            {editingAuthorizedPersonId ? "Update Authorized Person" : "Save Authorized Person"}
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
                                <label className="form-label small" htmlFor="authorizedPersonName">
                                    Name
                                </label>
                                <InputText
                                    id="authorizedPersonName"
                                    value={authorizedPersonDetail.fullName}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonEmail">
                                    Email Address <sup>*</sup>
                                </label>
                                <InputText
                                    id="authorizedPersonEmail"
                                    value={authorizedPersonDetail.emailID ?? ""}
                                    placeholder="Enter Email Address"
                                    className="form-control"
                                    disabled={isAuthorizedPersonEmailLocked}
                                    onChange={(e) =>
                                        handleAuthorizedPersonEmailChange(
                                            e.target.value.trim().toLowerCase()
                                        )
                                    }
                                />
                                {isAuthorizedPersonFormSubmitted && (
                                    <span className="error">{authorizedPersonValidation.emailID}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonDob">
                                    DOB
                                </label>
                                <InputText
                                    id="authorizedPersonDob"
                                    value={authorizedPersonDetail.dob ?? ""}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonMobile">
                                    Mobile Number <sup>*</sup>
                                </label>
                                <InputText
                                    id="authorizedPersonMobile"
                                    value={authorizedPersonDetail.mobileNumber ?? ""}
                                    placeholder="Enter Mobile Number"
                                    className="form-control"
                                    maxLength={10}
                                    disabled={isAuthorizedPersonMobileLocked}
                                    onChange={(e) => handleAuthorizedPersonMobileChange(e.target.value)}
                                    onKeyPress={(e) =>
                                        restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                    }
                                />
                                {isAuthorizedPersonFormSubmitted && (
                                    <span className="error">{authorizedPersonValidation.mobileNumber}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonGst">
                                    GST Details
                                </label>
                                <InputText
                                    id="authorizedPersonGst"
                                    value={authorizedPersonDetail.gstNumber ?? ""}
                                    className="form-control"
                                    placeholder='GST Details'
                                    maxLength={15}
                                    disabled={isAuthorizedPersonGSTLocked}
                                    onChange={(e) => handleAuthorizedPersonGstChange(e.target.value.toUpperCase())}
                                    onKeyPress={(e) =>
                                        restrictInputByPattern(e, GST_NUMBER_PATTERN)
                                    }
                                />
                            </div>
                            <span className="error">{authorizedPersonValidation.gstNumber}</span>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonGender">
                                    Gender
                                </label>
                                <InputText
                                    id="authorizedPersonGender"
                                    value={authorizedPersonDetail.gender
                                        ? authorizedPersonDetail.gender.charAt(0).toUpperCase() + authorizedPersonDetail.gender.slice(1).toLowerCase()
                                        : "-"}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-0">
                                <label className="form-label small" htmlFor="authorizedPersonConstitution">
                                    Constitution
                                </label>
                                <InputText
                                    id="authorizedPersonConstitution"
                                    value={authorizedPersonDetail.constitutionOfInstitute || authorizedPersonDetail.constitution || authorizedPersonDetail.category || ""}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mt-3 mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonProfilePhoto">
                                    Profile Photo <sup>*</sup>
                                </label>
                                <small className="text-muted d-block mb-2">Only JPG, JPEG, or PNG files up to {MAX_FILE_UPLOAD_NOTE}.</small>
                                <InputText
                                    id="authorizedPersonProfilePhoto"
                                    type="file"
                                    className="form-control"
                                    accept={IMAGE_FILE_ACCEPT}
                                    onChange={handleAuthorizedPersonProfilePhotoChange}
                                />
                                {authorizedPersonDetail.profilePhoto && (
                                    <small className="text-muted d-block mt-2">
                                        {authorizedPersonDetail.profilePhoto.name}
                                    </small>
                                )}
                                {isAuthorizedPersonFormSubmitted && (
                                    <span className="error">{authorizedPersonValidation.profilePhoto}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonAddress">
                                    Address
                                </label>
                                <InputTextarea
                                    id="authorizedPersonAddress"
                                    value={authorizedPersonDetail.address ?? ""}
                                    placeholder="Enter Address"
                                    className="form-control"
                                    rows={3}
                                    autoResize={false}
                                    maxLength={250}
                                    onChange={(e) => handleAuthorizedPersonAddressChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={showAgreementUploadModal}
                header="Upload Agreement"
                modal
                onHide={() => {
                    if (!loading) {
                        setShowAgreementUploadModal(false);
                    }
                }}
                className="modalWrapper"
                draggable={false}
                resizable={false}
                blockScroll
                style={{ width: "520px" }}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100"
                            disabled={loading}
                            onClick={() => setShowAgreementUploadModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"} w-100`}
                            disabled={loading}
                            onClick={() => void handleConfirmAgreementUpload()}
                        >
                            {loading ? (loadingMessage || "Processing...") : isEditMode ? "Update Institute" : "Submit Institute"}
                        </Button>
                    </div>
                }
            >
                <Loader isLoading={loading} />
                <div className="modal-content">
                    <div className="modal-body">
                        <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
                            Upload the signed agreement in PDF format if available. You can also continue without it.
                        </p>

                        <div className="form-group mb-3">
                            <label className="form-label small" htmlFor="agreementFile">
                                Agreement PDF
                            </label>
                            <small className="text-muted d-block mb-2">Only PDF file up to {MAX_FILE_UPLOAD_NOTE}.</small>
                            <InputText
                                id="agreementFile"
                                type="file"
                                className="form-control"
                                accept={PDF_FILE_ACCEPT}
                                onChange={handleAgreementFileChange}
                            />
                            {agreementFile && (
                                <div
                                    className="d-flex align-items-center justify-content-between gap-3 flex-wrap mt-3 p-3"
                                    style={{ backgroundColor: "#f6f9fc", border: "1px solid #dce6f0", borderRadius: "8px" }}
                                >
                                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                                        <i className="pi pi-file-pdf" style={{ color: "#d92d20", fontSize: "20px" }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div className="fw-semibold text-truncate" title={agreementFile.name}>
                                                {agreementFile.name}
                                            </div>
                                            <small className="text-muted">Ready to preview or download</small>
                                        </div>
                                    </div>
                                    <div className="d-flex w-100" style={{ gap: "12px" }}>
                                        <Button
                                            type="button"
                                            label="View"
                                            className="btn btn-black-line py-2 px-3"
                                            disabled={!agreementPreviewUrl}
                                            onClick={handleOpenAgreementPreview}
                                            style={{ display: "inline-flex", flex: "1 1 0", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap", textAlign: "center" }}
                                        />
                                        <Button
                                            type="button"
                                            label="Download"
                                            className="btn btn-black-line py-2 px-3"
                                            disabled={!agreementPreviewUrl}
                                            onClick={handleDownloadAgreement}
                                            style={{ display: "inline-flex", flex: "1 1 0", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap", textAlign: "center" }}
                                        />
                                    </div>
                                </div>
                            )}
                            {agreementFileError && (
                                <small className="error">{agreementFileError}</small>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>

            <ImpersonateUserModal
                impersonateModal={impersonateModal}
                setImpersonateModal={setImpersonateModal}
                impersonateId={userId}
            />
        </>
    )
}

export default ManagedEducationInstitute

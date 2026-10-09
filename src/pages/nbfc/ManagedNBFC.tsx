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
import { extraToken, formatDate, getFileSizeLimitErrorMessage, IMAGE_FILE_ACCEPT, IsFormValid, isFileSizeWithinLimit, isImageFile, MAX_FILE_UPLOAD_NOTE, restrictInputByPattern, toastError, toastSuccess } from '../../utils/functions/shared';
import useDebouncedEffect from '../../hooks/useDebounce';
import { CLIENT_ROLE, debounceTimeInMilliseconds, formatMobileNumber } from '../../utils/constants/constant';
import { Tooltip } from 'primereact/tooltip';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { IAddPanCardResponse, IConfirmDetail, OnlyPanNumber } from '../../interface/panCardResponse';
import { validationMessages } from '../../utils/constants/messages';
import { EMAIL_PATTERN, GST_NUMBER_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN, NUMBER_ONLY_PATTERN, PAN_NUMBER_PATTERN, TRADE_NAME_PATTERN, WEBSITE_PATTERN } from '../../utils/constants/pattern';
import {
    addNBFCUserAPI,
    fetchDetailsByPan,
    fetchStatesAPI,
    getAllNBFCUsersAPI,
    getNBFCUserByIdAPI,
    uploadCommonDocumentAPI, updateNBFCUserAPI
} from '../../utils/axios/apiServices';
import { IEducationalInstituteBranchAuthorisedPerson, IEducationInstitutes, IGetAllEducationInstitutesDetailedResponse, IGetAllEducationInstitutesDetailedResponseData, IGetAllNBFC } from '../../interface/institutes';
import { decryptVAPTData, encryptData, encryptVAPTData } from '../../utils/functions/encryptDecrypt';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { APIResponseEntity } from '../../interface/apiResponse';
import { IAuthorizedPersonRegisterRequest } from '../../interface/signIn';
import { IFetchStateResponse, IFetchStateResponseData } from '../../interface/payOuts';
import { DocumentForFileUploadType } from '../../utils/constants/enum';
import usePermission from '../../hooks/usePermission';

export interface IValidation {
    emailID: string;
    mobileNumber: string;
}

interface INbfcValidation extends IValidation {
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
    phoneNumber: string;
    profilePhoto: File | null;
    profilePhotoPath: string | null;
}

interface IAuthorizedPersonFormDetail extends IConfirmDetail {
    phoneNumber: string;
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
    phoneNumber: "",
    profilePhoto: null,
    profilePhotoPath: null,
};

const initialNbfcValidation: INbfcValidation = {
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

const ManagedNBFC = () => {
    const user = useSelector((state: RootState) => state.user.user);

    const { userID } = user;

    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);

    const [loadingMessage, setLoadingMessage] = useState<string>("");

    const [nbfcUsers, setNbfcUsers] = useState<IGetAllNBFC[]>([]);

    const [searchText, setSearchText] = useState<string>("");

    const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
        pageNumber: 0,
        pageSize: 10,
        searchText: "",
    });

    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [selectedState, setSelectedState] = useState<IFetchStateResponseData | null>(null);

    const [stateOptions, setStateOptions] = useState<IFetchStateResponseData[]>([]);

    const [showNbfcPanDialog, setShowNbfcPanDialog] = useState<boolean>(false);

    const [showAuthorizedPersonPanDialog, setShowAuthorizedPersonPanDialog] = useState<boolean>(false);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    const [showAuthorizedPersonConfirmModal, setShowAuthorizedPersonConfirmModal] = useState<boolean>(false);

    const [formValues, setFormValues] = useState<OnlyPanNumber>({ panNumber: "" });

    const [authorizedPersonFormValues, setAuthorizedPersonFormValues] = useState<OnlyPanNumber>({ panNumber: "" });

    const [formErrors, setFormErrors] = useState<OnlyPanNumber>({ panNumber: "" });

    const [authorizedPersonFormErrors, setAuthorizedPersonFormErrors] = useState<OnlyPanNumber>({ panNumber: "" });

    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

    const [isAuthorizedPersonFormSubmitted, setIsAuthorizedPersonFormSubmitted] = useState<boolean>(false);

    const [validation, setValidation] = useState<INbfcValidation>(initialNbfcValidation);

    const [authorizedPersonValidation, setAuthorizedPersonValidation] =
        useState<IAuthorizedPersonValidation>(initialAuthorizedPersonValidation);

    const [confirmDetail, setConfirmDetail] = useState<IConfirmDetail>(initialConfirmDetail);

    const [authorizedPersonDetail, setAuthorizedPersonDetail] =
        useState<IAuthorizedPersonFormDetail>(initialAuthorizedPersonDetail);

    const [authorisedPersons, setAuthorisedPersons] = useState<IAuthorizedPersonDraft[]>([]);

    const [editingAuthorizedPersonId, setEditingAuthorizedPersonId] = useState<string | null>(null);

    const [isInstituteEmailLocked, setIsInstituteEmailLocked] = useState<boolean>(false);

    const [isInstituteMobileLocked, setIsInstituteMobileLocked] = useState<boolean>(false);

    const [isAuthorizedPersonEmailLocked, setIsAuthorizedPersonEmailLocked] = useState<boolean>(false);

    const [isAuthorizedPersonMobileLocked, setIsAuthorizedPersonMobileLocked] = useState<boolean>(false);

    const [isAuthorizedPersonGSTLocked, setIsAuthorizedPersonGSTLocked] =
        useState<boolean>(false);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const [editingNbfcId, setEditingNbfcId] = useState<string | null>(null);

    const [isActive, setIsActive] = useState<boolean>(true);

    const { view, create } = usePermission("ManageNBFC", ["view", "create"])();

    const setLoadingState = (nextLoading: boolean, message = ""): void => {
        setLoading(nextLoading);
        setLoadingMessage(nextLoading ? message : "");
    };

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
            emailID: data.emailID ? decryptVAPTData(data.emailID) : "",
            mobileNumber: data.mobileNumber ? decryptVAPTData(data.mobileNumber) : "",
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
            website: data.website || "",
        };
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

    const handleCloseNbfcFlow = (): void => {
        setShowNbfcPanDialog(false);
        setShowConfirmModal(false);
        setShowAuthorizedPersonPanDialog(false);
        setShowAuthorizedPersonConfirmModal(false);
        setFormValues({ panNumber: "" });
        setAuthorizedPersonFormValues({ panNumber: "" });
        setFormErrors({ panNumber: "" });
        setAuthorizedPersonFormErrors({ panNumber: "" });
        setIsFormSubmitted(false);
        setIsAuthorizedPersonFormSubmitted(false);
        setValidation(initialNbfcValidation);
        setAuthorizedPersonValidation(initialAuthorizedPersonValidation);
        setConfirmDetail(initialConfirmDetail);
        setAuthorizedPersonDetail(initialAuthorizedPersonDetail);
        setAuthorisedPersons([]);
        setIsEditMode(false);
        setEditingNbfcId(null);
        setIsActive(true);
        setIsInstituteEmailLocked(false);
        setIsInstituteMobileLocked(false);
        resetAuthorizedPersonFlow();
    };

    const fetchStatesList = async (): Promise<void> => {
        const response: IFetchStateResponse = await fetchStatesAPI();

        if (response?.statusCode === 200) {
            setStateOptions(response.data || []);
        }
    };

    const fetchNbfcUsers = async (): Promise<void> => {
        setLoading(true);

        const response = await getAllNBFCUsersAPI({
            page: filterReq.pageNumber + 1,
            pageSize: filterReq.pageSize,
            search: filterReq.searchText,
            stateSearch: selectedState?.name ? encryptVAPTData(selectedState.name) : "",
        });

        if (!response) {
            setLoading(false);
            return;
        }

        if (response.statusCode === 200) {
            setNbfcUsers(response.data?.nBFCUserList || []);
            setTotalRecords(response.data?.totalCount || 0);
        }

        setLoading(false);
    };

    const onPageChange = (event: PaginatorPageChangeEvent): void => {
        setFilterReq((prev) => ({
            ...prev,
            pageSize: event.rows,
            pageNumber: event.page,
        }));
    };

    const handleChange = (value: string): void => {
        setFormErrors({
            panNumber:
                !isFormSubmitted
                    ? ""
                    : PAN_NUMBER_PATTERN.test(value)
                        ? ""
                        : validationMessages.panNumberInvalid,
        });

        setFormValues({ panNumber: value });
    };

    const handleVerifyNbfcPan = async (): Promise<void> => {
        setIsFormSubmitted(true);

        if (!PAN_NUMBER_PATTERN.test(formValues.panNumber)) {
            setFormErrors({ panNumber: validationMessages.panNumberInvalid });
            return;
        }

        setLoadingState(true, "Fetching Lender PAN details...");

        const response: IAddPanCardResponse = await fetchDetailsByPan({
            panNumber: encryptVAPTData(formValues.panNumber),
        });

        if (!response) return;

        if (response.statusCode === 200) {
            const decryptedData = getDecryptedPanDetails(response.data);

            setConfirmDetail(decryptedData);
            setValidation({
                ...initialNbfcValidation,
                ...buildValidationState(decryptedData),
            });
            setIsInstituteEmailLocked(!IsStringNullEmptyOrUndefined(response.data.emailID ?? ""));
            setIsInstituteMobileLocked(!IsStringNullEmptyOrUndefined(response.data.mobileNumber ?? ""));
            setShowNbfcPanDialog(false);
            setShowConfirmModal(true);
        } else {
            toastError(response.message);
        }

        setLoadingState(false);
    };

    const handleEditNbfc = async (rowData: IEducationInstitutes): Promise<void> => {
        setLoadingState(true, "Loading Lender details...");

        const detailResponse: IGetAllEducationInstitutesDetailedResponse = await getNBFCUserByIdAPI(rowData.id);

        if (!detailResponse.status || detailResponse.statusCode !== 200) {
            toastError(detailResponse.message);
            setLoadingState(false);
            return;
        }

        const detailData: IGetAllEducationInstitutesDetailedResponseData = detailResponse?.statusCode === 200 ? detailResponse.data : {} as IGetAllEducationInstitutesDetailedResponseData;

        const prefilledDetail: IConfirmDetail = {
            ...initialConfirmDetail,
            fullName: detailData?.fullName || "",
            emailID: detailData?.email ? decryptVAPTData(detailData.email) : "",
            mobileNumber: detailData?.phoneNumber ? decryptVAPTData(detailData.phoneNumber) : "",
            panNumber: detailData?.panNumber ? decryptVAPTData(detailData.panNumber) : "",
            gstNumber: detailData?.gstNumber
                ? decryptVAPTData(detailData.gstNumber)
                : "",
            constitutionOfInstitute: detailData?.constitutionOfInstitute || "",
            constitution: detailData?.constitutionOfInstitute || "",
            website: detailData?.website || "",
            tradeName: detailData?.tradeName ? decryptVAPTData(detailData?.tradeName) : "",
            dob: detailData?.dob ? decryptVAPTData(detailData.dob) : "",
            address: detailData?.address ? decryptVAPTData(detailData.address) : "",
            state: detailData?.state ? decryptVAPTData(detailData.state) : "",
            city: detailData?.city ? decryptVAPTData(detailData.city) : "",
            zipCode: detailData?.zipCode ? decryptVAPTData(detailData.zipCode) : "",
        };

        const apiAuthorizedPersons: IEducationalInstituteBranchAuthorisedPerson[] = detailData?.authorisedPersons || [];
        setAuthorisedPersons(
            apiAuthorizedPersons.map((person, index) => ({
                ...initialAuthorizedPersonDetail,
                id: person.id || `${Date.now()}-${index + 1}`,
                fullName: person.name || "",
                firstName: person.name || "",
                emailID: decryptValueOrFallback(person.emailAddress),
                mobileNumber: decryptValueOrFallback(person.mobileNumber),
                panNumber: decryptValueOrFallback(person.panNumber),
                dob: person.dateOfBirth ? decryptValueOrFallback(person.dateOfBirth).split("T")[0] : "",
                address: decryptValueOrFallback(person.address),
                gender: person.gender || "",
                category: person.constitution || "",
                constitutionOfInstitute: person.constitution || "",
                constitution: person.constitution || "",
                phoneNumber: decryptValueOrFallback(person.mobileNumber),
                profilePhoto: null,
                profilePhotoPath: person.profilePhotoPath || null,
            }))
        );

        setConfirmDetail(prefilledDetail);
        setValidation({
            ...initialNbfcValidation,
            ...buildValidationState(prefilledDetail),
        });
        setIsEditMode(true);
        setEditingNbfcId(rowData.id);
        setIsActive(detailData?.isActive ?? rowData.isActive ?? true);
        setShowConfirmModal(true);
        setLoadingState(false);
    };

    const handleChangeEmail = (value: string): void => {
        setValidation((prev) => ({
            ...prev,
            emailID: IsStringNullEmptyOrUndefined(value)
                ? validationMessages.emailRequired
                : !EMAIL_PATTERN.test(value)
                    ? validationMessages.emailInvalid
                    : "",
        }));
        setConfirmDetail((prev) => ({ ...prev, emailID: value }));
    };

    const handleChangeMobile = (value: string): void => {
        setValidation((prev) => ({
            ...prev,
            mobileNumber: IsStringNullEmptyOrUndefined(value)
                ? validationMessages.mobileNumberRequired
                : !(INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10)
                    ? validationMessages.mobileNumberInvalid
                    : "",
        }));
        setConfirmDetail((prev) => ({ ...prev, mobileNumber: value }));
    };

    const handleChangeGST = (value: string): void => {
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

    const handleConfirmFieldChange = (field: keyof IConfirmDetail, value: string): void => {
        if (field === "website" || field === "tradeName") {
            setValidation((prev) => ({
                ...prev,
                [field]: field === "website"
                    ? !value || WEBSITE_PATTERN.test(value) ? "" : validationMessages.websiteInvalid
                    : !value || (TRADE_NAME_PATTERN.test(value.trim()) && value.trim().length >= 2 && value.trim().length <= 100)
                        ? ""
                        : validationMessages.tradeNameInvalid,
            }));
        }
        setConfirmDetail((prev) => ({ ...prev, [field]: value }));
    };

    const handleAuthorizedPersonPanChange = (value: string): void => {
        setAuthorizedPersonFormErrors({
            panNumber:
                !isAuthorizedPersonFormSubmitted
                    ? ""
                    : PAN_NUMBER_PATTERN.test(value)
                        ? ""
                        : validationMessages.panNumberInvalid,
        });
        setAuthorizedPersonFormValues({ panNumber: value });
    };

    const handleVerifyAuthorizedPersonPan = async (): Promise<void> => {
        setIsAuthorizedPersonFormSubmitted(true);

        if (!PAN_NUMBER_PATTERN.test(authorizedPersonFormValues.panNumber)) {
            setAuthorizedPersonFormErrors({ panNumber: validationMessages.panNumberInvalid });
            return;
        }

        const panNumber = authorizedPersonFormValues.panNumber.trim().toUpperCase();
        const institutePanNumber = (confirmDetail.panNumber ?? "").trim().toUpperCase();
        const authorizedPersonPanNumbers = authorisedPersons.map((person) =>
            decryptValueOrFallback(person.panNumber).trim().toUpperCase()
        );

        if (panNumber === institutePanNumber) {
            setAuthorizedPersonFormErrors({
                panNumber: validationMessages.authorizedPersonPanMatchesNBFC,
            });
            return;
        }

        if (authorizedPersonPanNumbers.includes(panNumber)) {
            setAuthorizedPersonFormErrors({
                panNumber: validationMessages.authorizedPersonPanDuplicateNBFC,
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
                phoneNumber: decryptedData.mobileNumber || "",
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

    const handleAuthorizedPersonFieldChange = (
        field: keyof IAuthorizedPersonFormDetail,
        value: string | File | null
    ): void => {
        if (field === "emailID" && typeof value === "string") {
            const emailValue = value.trim().toLowerCase();

            setAuthorizedPersonValidation((prev) => ({
                ...prev,
                emailID: IsStringNullEmptyOrUndefined(emailValue)
                    ? validationMessages.emailRequired
                    : !EMAIL_PATTERN.test(emailValue)
                        ? validationMessages.emailInvalid
                        : "",
            }));
        }

        if (field === "mobileNumber" && typeof value === "string") {
            const mobileValue = value.trim();

            setAuthorizedPersonValidation((prev) => ({
                ...prev,
                mobileNumber: IsStringNullEmptyOrUndefined(mobileValue)
                    ? validationMessages.mobileNumberRequired
                    : !(INDIAN_MOBILE_NUMBER_PATTERN.test(mobileValue) && mobileValue.length === 10)
                        ? validationMessages.mobileNumberInvalid
                        : "",
            }));
        }

        if (field === "gstNumber" && typeof value === "string") {
            const normalizedValue = value.toUpperCase();
            value = normalizedValue;
            const isValid = GST_NUMBER_PATTERN.test(normalizedValue);

            setAuthorizedPersonValidation((prev) => ({
                ...prev,
                gstNumber: IsStringNullEmptyOrUndefined(normalizedValue)
                    ? ""
                    : !isValid
                        ? validationMessages.gstNumberInvalid
                        : "",
            }));
        }

        setAuthorizedPersonDetail((prev) => ({ ...prev, [field]: value as never }));
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
        uploadFormData.append("documentFor", String(DocumentForFileUploadType.NBFC));

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

    const handleSaveAuthorizedPerson = (): void => {
        setIsAuthorizedPersonFormSubmitted(true);

        const panNumber = (authorizedPersonDetail.panNumber ?? "").trim().toUpperCase();
        const institutePanNumber = (confirmDetail.panNumber ?? "").trim().toUpperCase();
        const duplicateAuthorizedPerson = authorisedPersons.some((person) =>
            person.id !== editingAuthorizedPersonId &&
            decryptValueOrFallback(person.panNumber).trim().toUpperCase() === panNumber
        );

        if (panNumber === institutePanNumber) {
            toastError(validationMessages.authorizedPersonPanMatchesNBFC);
            return;
        }

        if (duplicateAuthorizedPerson) {
            toastError(validationMessages.authorizedPersonPanDuplicateNBFC);
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
                            phoneNumber: authorizedPersonDetail.phoneNumber || "",
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
                    phoneNumber: authorizedPersonDetail.phoneNumber || "",
                    profilePhoto: authorizedPersonDetail.profilePhoto || null,
                    profilePhotoPath: authorizedPersonDetail.profilePhotoPath || null,
                },
            ]);
        }

        resetAuthorizedPersonFlow();
    };

    const handleRemoveAuthorizedPerson = (personId: string): void => {
        setAuthorisedPersons((prev) => prev.filter((person) => person.id !== personId));

        if (editingAuthorizedPersonId === personId) {
            resetAuthorizedPersonFlow();
        }
    };

    const handleSaveNbfc = async (): Promise<void> => {
        setIsFormSubmitted(true);

        const nextValidation: INbfcValidation = {
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

        setLoadingState(true, isEditMode ? "Updating Lender..." : "Saving Lender...");

        const authorizedPersonPayload: IAuthorizedPersonRegisterRequest[] = authorisedPersons.map((person) => ({
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

        const response: APIResponseEntity = isEditMode && editingNbfcId
            ? await updateNBFCUserAPI({
                id: editingNbfcId,
                emailID: encryptVAPTData(confirmDetail.emailID?.trim().toLowerCase() || null),
                mobileNumber: encryptVAPTData(confirmDetail.mobileNumber?.trim() || null),
                panNumber: encryptVAPTData(confirmDetail.panNumber || null),
                tradeName: confirmDetail.tradeName ? encryptVAPTData(confirmDetail.tradeName) : null,
                fullName: confirmDetail.fullName,
                firstName: confirmDetail.firstName || confirmDetail.fullName,
                middleName: confirmDetail.middleName || null,
                lastName: confirmDetail.lastName || null,
                category: confirmDetail.category || null,
                address: confirmDetail.address ? encryptVAPTData(confirmDetail.address) : null,
                state: confirmDetail.state ? encryptVAPTData(confirmDetail.state) : null,
                city: confirmDetail.city ? encryptVAPTData(confirmDetail.city) : null,
                zipCode: confirmDetail.zipCode ? encryptVAPTData(confirmDetail.zipCode) : null,
                gender: confirmDetail.gender || null,
                dob: confirmDetail.dob ? encryptVAPTData(confirmDetail.dob) : null,
                constitutionOfInstitute: confirmDetail.constitutionOfInstitute || confirmDetail.constitution || null,
                authorisedPersons: authorizedPersonPayload,
                website: confirmDetail.website || null,
            })
            : await addNBFCUserAPI({
                emailID: encryptVAPTData(confirmDetail.emailID?.trim().toLowerCase() || null),
                mobileNumber: encryptVAPTData(confirmDetail.mobileNumber?.trim() || null),
                panNumber: encryptVAPTData(confirmDetail.panNumber || null),
                tradeName: confirmDetail.tradeName ? encryptVAPTData(confirmDetail.tradeName) : null,
                fullName: confirmDetail.fullName,
                firstName: confirmDetail.firstName || confirmDetail.fullName,
                middleName: confirmDetail.middleName || null,
                lastName: confirmDetail.lastName || null,
                category: confirmDetail.category || null,
                address: confirmDetail.address ? encryptVAPTData(confirmDetail.address) : null,
                state: confirmDetail.state ? encryptVAPTData(confirmDetail.state) : null,
                city: confirmDetail.city ? encryptVAPTData(confirmDetail.city) : null,
                zipCode: confirmDetail.zipCode ? encryptVAPTData(confirmDetail.zipCode) : null,
                dob: confirmDetail.dob ? encryptVAPTData(confirmDetail.dob) : null,
                gender: confirmDetail.gender || null,
                extraToken: encryptData(extraToken()),
                whiteLabelTenantId: user?.whiteLabelSettings?.id || null,
                userType: CLIENT_ROLE.NBFC,
                constitutionOfInstitute: confirmDetail.constitutionOfInstitute || confirmDetail.constitution || null,
                website: confirmDetail.website || null,
                isUserDetailsRequired: true,
                authorisedPersons: authorizedPersonPayload,
                isActive: isActive,
                parentID: userID,
            });

        if (!response) {
            setLoadingState(false);
            return
        }

        if (response.statusCode === 200) {
            toastSuccess(response.message);
            handleCloseNbfcFlow();
            fetchNbfcUsers();
        } else {
            toastError(response.message)
        }

        setLoadingState(false);
    };

    const handleReset = (): void => {
        handleCloseNbfcFlow();
    };

    const handleOpenAuthorizedPersonPanDialog = (): void => {
        if (authorisedPersons.length >= 3) {
            toastError("You can add up to 3 authorized persons only.");
            return;
        }

        resetAuthorizedPersonFlow();
        setShowAuthorizedPersonPanDialog(true);
    };

    const handleConfirmAgreementUpload = async (): Promise<void> => {
        await handleSaveNbfc();
    };

    const statusBodyTemplate = (rowData: IEducationInstitutes): JSX.Element => (
        <span className={`StatusLabel ${rowData.isActive ? "greenLine" : "redLine"}`}>
            {rowData.isActive ? "Active" : "Inactive"}
        </span>
    );

    const actionBodyTemplate = (rowData: IEducationInstitutes): JSX.Element => {
        const viewId = `nbfc-view-${rowData.id}`;
        const editId = `nbfc-edit-${rowData.id}`;

        return (
            <>
                {view &&
                    <>
                        <Tooltip target={`#${viewId}`} position="top" />
                        <Button
                            id={viewId}
                            className="trash-icon p-0 me-2"
                            data-pr-tooltip="View Lender"
                            onClick={() =>
                                navigate(`${RoutePathConstant.private.educationManagedNbfc}/${rowData.id}`)
                            }
                        >
                            <i className='icon-eye' />
                        </Button>
                    </>
                }

                {create &&
                    <>
                        <Tooltip target={`#${editId}`} position="top" />

                        <Button
                            id={editId}
                            className="trash-icon p-0 me-2"
                            data-pr-tooltip="Edit Lender"
                            onClick={() => handleEditNbfc(rowData)}
                        >
                            <i className='icon-edit' />
                        </Button>
                    </>
                }
            </>
        );
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
        fetchNbfcUsers();
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
                            <TableTitle title="Manage Lender" />

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

                                <div className="form-group">
                                    <Button
                                        onClick={() => setShowNbfcPanDialog(true)}
                                        className="btn btn-orange"
                                    >
                                        <i className="bi bi-plus-circle me-2" />
                                        Add Lender
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="whiteBoxHldr">
                            <div className="table-responsive">
                                <DataTable className="tableMain" value={nbfcUsers} emptyMessage="No Lender found">
                                    <Column field="code" header="Lender Code" />

                                    <Column field="fullName" header="Lender Name" />

                                    <Column
                                        body={(rowData: IEducationInstitutes) => rowData.phoneNumber ? formatMobileNumber(decryptVAPTData(rowData.phoneNumber)) : "-"}
                                        header="Mobile Number"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) => rowData.state ? decryptVAPTData(rowData.state) : "-"}
                                        header="State"
                                    />

                                    <Column
                                        body={(rowData: IEducationInstitutes) => rowData.city ? decryptVAPTData(rowData.city) : "-"}
                                        header="City"
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

                            {!IsNullOrEmptyArray(nbfcUsers) && (
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
            </div>
            <Dialog
                header="PAN Details"
                visible={showNbfcPanDialog}
                className="modalWrapper"
                onHide={handleCloseNbfcFlow}
                draggable={false}
                resizable={false}
                blockScroll
                style={{ width: "650px" }}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100 text-center"
                            onClick={handleCloseNbfcFlow}
                            disabled={loading}
                            label="Cancel"
                        />
                        <Button
                            className="btn btn-orange w-100 text-center"
                            onClick={() => void handleVerifyNbfcPan()}
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
                            Enter the PAN Card number to authenticate the Lender and continue with onboarding.
                        </p>

                        <div className="form-group mb-3">
                            <label className="form-label small" htmlFor="nbfcPanNumber">
                                PAN <sup>*</sup>
                            </label>
                            <InputText
                                id="nbfcPanNumber"
                                name="panNumber"
                                autoFocus
                                className="form-control"
                                placeholder="Enter PAN (e.g., ABCDE1234F)"
                                value={formValues.panNumber.toUpperCase()}
                                maxLength={10}
                                onChange={(e) => handleChange(e.target.value.toUpperCase().trim())}
                            />
                            {isFormSubmitted && formErrors.panNumber && (
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
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100"
                            disabled={loading}
                            onClick={handleReset}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"} w-100`}
                            onClick={handleConfirmAgreementUpload}
                            disabled={loading}
                        >
                            {loading ? (loadingMessage || "Processing...") : isEditMode ? "Update Lender" : "Save Lender"}
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
                                <label className="form-label small" htmlFor="nbfcName">
                                    Lender Name
                                </label>
                                <InputText
                                    id="nbfcName"
                                    value={confirmDetail.fullName}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcCategory">
                                    Constitution
                                </label>
                                <InputText
                                    id="nbfcCategory"
                                    value={confirmDetail.category}
                                    className="form-control text-capitalize"
                                    placeholder='Constitution'
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcPan">
                                    PAN Number
                                </label>
                                <InputText
                                    id="nbfcPan"
                                    value={confirmDetail.panNumber}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcEmail">
                                    Email Address <sup>*</sup>
                                </label>
                                <InputText
                                    autoFocus
                                    id="nbfcEmail"
                                    value={confirmDetail.emailID ?? ""}
                                    placeholder="Enter Email Address"
                                    className="form-control"
                                    disabled={isInstituteEmailLocked}
                                    onChange={(e) => handleChangeEmail(e.target.value.trim().toLowerCase())}
                                />
                                {validation.emailID && (
                                    <span className="error">{validation.emailID}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcMobile">
                                    Mobile Number <sup>*</sup>
                                </label>
                                <InputText
                                    id="nbfcMobile"
                                    value={confirmDetail.mobileNumber ?? ""}
                                    placeholder="Enter Mobile Number"
                                    className="form-control"
                                    maxLength={10}
                                    disabled={isInstituteMobileLocked}
                                    onChange={(e) => handleChangeMobile(e.target.value)}
                                    onKeyPress={(e) => restrictInputByPattern(e, NUMBER_ONLY_PATTERN)}
                                />
                                {validation.mobileNumber && (
                                    <span className="error">{validation.mobileNumber}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcGst">
                                    GST Details
                                </label>

                                <InputText
                                    id="nbfcGst"
                                    value={confirmDetail.gstNumber ?? ""}
                                    placeholder="Enter GST Details"
                                    className="form-control"
                                    maxLength={15}
                                    onChange={(e) => handleChangeGST(e.target.value.toUpperCase())}
                                />
                                {validation.gstNumber && (
                                    <span className="error">{validation.gstNumber}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcWebsite">
                                    Website
                                </label>
                                <InputText
                                    id="nbfcWebsite"
                                    value={confirmDetail.website ?? ""}
                                    placeholder="Enter Website"
                                    className="form-control"
                                    maxLength={255}
                                    onChange={(e) => handleConfirmFieldChange("website", e.target.value.trim())}
                                />
                                {validation.website && (
                                    <span className="error">{validation.website}</span>
                                )}
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="nbfcTradeName">
                                    Trade Name
                                </label>
                                <InputText
                                    id="nbfcTradeName"
                                    value={confirmDetail.tradeName ?? ""}
                                    placeholder="Enter Trade Name"
                                    className="form-control"
                                    maxLength={100}
                                    onChange={(e) => handleConfirmFieldChange("tradeName", e.target.value?.trimStart())}
                                />
                                {validation.tradeName && (
                                    <span className="error">{validation.tradeName}</span>
                                )}
                            </div>

                            {isEditMode && (
                                <div className="form-group mb-3">
                                    <label className="form-label small" htmlFor="nbfcAddress">
                                        Address
                                    </label>
                                    <InputTextarea
                                        id="nbfcAddress"
                                        value={confirmDetail.address ?? ""}
                                        placeholder="Enter Address"
                                        className="form-control"
                                        rows={3}
                                        autoResize={false}
                                        maxLength={250}
                                        onChange={(e) => handleConfirmFieldChange("address", e.target.value)}
                                    />
                                </div>
                            )}

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
                                                        onClick={() => handleRemoveAuthorizedPerson(person.id)}
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
                            onClick={() => void handleVerifyAuthorizedPersonPan()}
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
                            {isAuthorizedPersonFormSubmitted && authorizedPersonFormErrors.panNumber && (
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
                                        handleAuthorizedPersonFieldChange(
                                            "emailID",
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
                                    onChange={(e) => handleAuthorizedPersonFieldChange("mobileNumber", e.target.value)}
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
                                    placeholder="GST Details"
                                    maxLength={15}
                                    disabled={isAuthorizedPersonGSTLocked}
                                    onChange={(e) => handleAuthorizedPersonFieldChange("gstNumber", e.target.value.toUpperCase())}
                                />
                            </div>
                            <span className="error">{authorizedPersonValidation.gstNumber}</span>

                            <div className="form-group mb-3">
                                <label className="form-label small" htmlFor="authorizedPersonGender">
                                    Gender
                                </label>
                                <InputText
                                    id="authorizedPersonGender"
                                    value={authorizedPersonDetail.gender ? authorizedPersonDetail.gender.charAt(0).toUpperCase() +
                                        authorizedPersonDetail.gender.slice(1).toLowerCase() : ""}
                                    className="form-control"
                                    placeholder="Gender"
                                    disabled
                                />
                            </div>

                            <div className="form-group mb-0">
                                <label className="form-label small" htmlFor="authorizedPersonConstitution">
                                    Constitution
                                </label>
                                <InputText
                                    id="authorizedPersonConstitution"
                                    value={authorizedPersonDetail.constitutionOfInstitute || authorizedPersonDetail.category || ""}
                                    className="form-control"
                                    placeholder="Constitution"
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
                                    onChange={(e) => handleAuthorizedPersonProfilePhotoChange(e)}
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
                                    onChange={(e) => handleAuthorizedPersonFieldChange("address", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default ManagedNBFC;

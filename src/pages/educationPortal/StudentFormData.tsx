import Loader from '../../components/Loader';
import { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import TableTitle from '../../components/TableTitle';
import { IEducationStudentApplicant, IEducationStudentFormData } from '../../interface/educationManagement';
import { genderOptions } from '../../utils/constants/constant';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import CameraCaptureDialog from '../../components/CameraCaptureDialog';
import { IFetchMobilePrefillResult, IFetchStudentDetailResponse, IUploadCommonDocumentResponse } from '../../interface/student';
import type { StudentFormPrefillNavigationState } from './students/ManageStudents';
import { createEducationStudentAPI, fetchMobilePrefillAPI, getStudentDetailAPI, updateEducationStudentAPI, uploadCommonDocumentAPI } from '../../utils/axios/apiServices';
import { DocumentForFileUploadType } from '../../utils/constants/enum';
import { extraToken, getFileSizeLimitErrorMessage, IMAGE_FILE_ACCEPT, isFileSizeWithinLimit, isImageFile, isPdfFile, normalizeGenderForDisplay, normalizeGenderForPayload, PDF_FILE_ACCEPT, toastError, toastSuccess } from '../../utils/functions/shared';
import { validationMessages } from '../../utils/constants/messages';
import { EMAIL_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN, PAN_NUMBER_PATTERN, PERSON_NAME_PATTERN, UNSAFE_TEXT_PATTERN } from '../../utils/constants/pattern';
import { decryptVAPTData, encryptData, encryptVAPTData } from '../../utils/functions/encryptDecrypt';
import { CLIENT_ROLE } from '../../utils/constants/constant';
import { RootState } from '../../store';

export const createEmptyApplicant = (): IEducationStudentApplicant => ({
    name: "",
    pan: "",
    panDocument: null,
    aadhaarDocument: null,
    dateOfBirth: "",
    gender: "",
    mobileNumber: "",
    email: "",
    photo: null,
    address: "",
});


export const defaultStudentForm: IEducationStudentFormData = {
    studentName: "",
    studentPan: "",
    studentPanDocument: null,
    studentAadhaarDocument: null,
    studentDateOfBirth: "",
    studentGender: "",
    studentPhoto: null,
    mobileNumber: "",
    email: "",
    address: "",
    applicants: [createEmptyApplicant()],
    coApplicantName: "",
    coApplicantMobileNumber: "",
    coApplicantRelation: "",
    isActive: true,
};

type PhotoEditorTarget =
    | { type: "student" }
    | { type: "applicant"; index: number; title: string };

type UploadedCommonDocument = {
    path: string;
    link: string;
};

type StudentFieldLockState = Partial<Record<keyof IEducationStudentFormData, boolean>>;

type ApplicantAddFlowState = {
    index: number;
    title: string;
    isPrimaryApplicant: boolean;
};

const createApplicantFromStudent = (
    student: IEducationStudentFormData,
    id?: string,
): IEducationStudentApplicant => ({
    id,
    name: student.studentName,
    pan: student.studentPan,
    panDocument: student.studentPanDocument,
    aadhaarDocument: student.studentAadhaarDocument,
    dateOfBirth: student.studentDateOfBirth,
    gender: student.studentGender,
    mobileNumber: student.mobileNumber,
    email: student.email,
    photo: student.studentPhoto,
    address: student.address,
});

function normalizeDateOfBirth(value: string | null | undefined): string {
    const trimmedValue = (value || "").trim();

    if (!trimmedValue) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
        return trimmedValue;
    }

    if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmedValue)) {
        const [year, month, day] = trimmedValue.split("/");
        return `${year}-${month}-${day}`;
    }

    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmedValue)) {
        const [day, month, year] = trimmedValue.split(/[-/]/);
        return `${year}-${month}-${day}`;
    }

    return trimmedValue;
}

function buildAddress(prefillResult: IFetchMobilePrefillResult | null | undefined): string {
    const primaryAddress = prefillResult?.address?.[0];

    if (!primaryAddress) return "";

    return [
        primaryAddress.firstLineOfAddress,
        primaryAddress.secondLineOfAddress,
        primaryAddress.thirdLineOfAddress,
        primaryAddress.city,
        primaryAddress.state,
        primaryAddress.postalCode,
        primaryAddress.countryCode,
    ]
        .filter((value) => typeof value === "string" && value.trim() !== "")
        .join(", ");
}

const createApplicantFromPrefill = (
    mobileNumber: string,
    prefillResult: IFetchMobilePrefillResult | null | undefined,
): IEducationStudentApplicant => ({
    ...createEmptyApplicant(),
    name: prefillResult?.name?.trim() || "",
    pan: prefillResult?.pan?.trim().toUpperCase() || "",
    dateOfBirth: normalizeDateOfBirth(prefillResult?.dob),
    gender: normalizeGenderForDisplay(prefillResult?.gender),
    mobileNumber,
    email: prefillResult?.email?.trim() || "",
    address: buildAddress(prefillResult),
});

const createDateFromValue = (value: string): Date | null => {
    if (!value) return null;

    const parsedDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatDateToValue = (date: Date | null): string => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMinimumStudentAgeDate = (): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    return date;
};

const isAtLeastFifteenYearsOld = (dateOfBirth: string): boolean => {
    const date = createDateFromValue(dateOfBirth);
    return date !== null && date <= getMinimumStudentAgeDate();
};

const validatePersonName = (value: string): string => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return validationMessages.nameRequired;
    if (trimmedValue.length < 2 || trimmedValue.length > 100 || !PERSON_NAME_PATTERN.test(trimmedValue)) {
        return validationMessages.personNameInvalid;
    }

    return "";
};

const validateAddress = (value: string): string => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return validationMessages.addressRequired;
    if (trimmedValue.length < 5 || trimmedValue.length > 250 || UNSAFE_TEXT_PATTERN.test(trimmedValue)) {
        return validationMessages.addressInvalid;
    }

    return "";
};

const areApplicantsEquivalent = (
    student: IEducationStudentFormData,
    applicant: IEducationStudentApplicant,
): boolean => (
    student.studentName === applicant.name &&
    student.studentPan === applicant.pan &&
    student.studentPanDocument === applicant.panDocument &&
    student.studentAadhaarDocument === applicant.aadhaarDocument &&
    student.studentDateOfBirth === applicant.dateOfBirth &&
    student.studentGender === applicant.gender &&
    student.mobileNumber === applicant.mobileNumber &&
    student.email === applicant.email &&
    student.studentPhoto === applicant.photo &&
    student.address === (applicant.address || "")
);

const splitFullName = (fullName: string): {
    fullName: string;
    firstName: string;
    middleName: string;
    lastName: string;
} => {
    const sanitizedFullName = fullName.trim().replace(/\s+/g, " ");
    const nameParts = sanitizedFullName ? sanitizedFullName.split(" ") : [];

    return {
        fullName: sanitizedFullName,
        firstName: nameParts[0] || "",
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
    };
};

const StudentFormData = () => {
    const [studentForm, setStudentForm] = useState<IEducationStudentFormData>(defaultStudentForm);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [lockedStudentFields, setLockedStudentFields] = useState<StudentFieldLockState>({});

    const [photoEditorTarget, setPhotoEditorTarget] =
        useState<PhotoEditorTarget | null>(null);

    const [photoPreviewLinks, setPhotoPreviewLinks] = useState<Record<string, string>>({});

    const [documentPreviewLinks, setDocumentPreviewLinks] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState<boolean>(false);

    const [isPhotoUploading, setIsPhotoUploading] = useState<boolean>(false);

    const [isApplicantSameAsStudent, setIsApplicantSameAsStudent] = useState<boolean>(false);

    const [showPhotoCapture, setShowPhotoCapture] = useState<boolean>(false);

    const [applicantAddFlow, setApplicantAddFlow] = useState<ApplicantAddFlowState | null>(null);

    const [applicantLookupMobile, setApplicantLookupMobile] = useState<string>("");

    const [applicantLookupError, setApplicantLookupError] = useState<string>("");

    const [isApplicantLookupSubmitted, setIsApplicantLookupSubmitted] = useState<boolean>(false);

    const [isApplicantManualEntryRequired, setIsApplicantManualEntryRequired] = useState<boolean>(false);

    const navigate = useNavigate();

    const location = useLocation();

    const user = useSelector((state: RootState) => state.user.user);

    const { id } = useParams();

    const isEditMode = Boolean(id);

    const isApplicantEditingEnabled = true;

    const navigationState = (location.state || {}) as StudentFormPrefillNavigationState;

    const hasValue = (value: string | null | undefined): boolean =>
        typeof value === "string" ? value.trim() !== "" : value !== null && value !== undefined;

    const fetchEditableStudentDetails = async (): Promise<void> => {
        if (!id) return;

        setLoading(true);

        try {
            const params = {
                studentID: id,
            }

            const response: IFetchStudentDetailResponse = await getStudentDetailAPI(params);

            if (!response.status) {
                toastError(response.message);
                return;
            }

            if (response && response.statusCode === 200) {
                const studentProfile = response.data.students;
                const applicantProfile = response.data.applicants;
                const coApplicantProfiles = response.data.coApplicants || [];

                const primaryApplicant: IEducationStudentApplicant = applicantProfile
                    ? {
                        id: applicantProfile.id,
                        name: applicantProfile.name || "",
                        pan: applicantProfile.pan ? decryptVAPTData(applicantProfile.pan) : "",
                        panDocument: applicantProfile.panDocument || null,
                        aadhaarDocument: applicantProfile.aadhaarDocument || null,
                        dateOfBirth: applicantProfile.dateOfBirth ? normalizeDateOfBirth(decryptVAPTData(applicantProfile.dateOfBirth)) : "",
                        gender: normalizeGenderForDisplay(applicantProfile.gender),
                        mobileNumber: applicantProfile.mobileNumber ? decryptVAPTData(applicantProfile.mobileNumber) : "",
                        email: applicantProfile.email ? decryptVAPTData(applicantProfile.email) : "",
                        photo: applicantProfile.photo || null,
                        address: applicantProfile.address ? decryptVAPTData(applicantProfile.address) : "",
                    }
                    : createEmptyApplicant();

                const nextStudentForm: IEducationStudentFormData = {
                    ...defaultStudentForm,
                    studentName: studentProfile?.name || "",
                    studentPan: studentProfile.pan ? decryptVAPTData(studentProfile.pan) : "",
                    studentPanDocument: studentProfile?.panDocument || null,
                    studentAadhaarDocument: studentProfile?.aadhaarDocument || null,
                    studentDateOfBirth: studentProfile?.dateOfBirth ? normalizeDateOfBirth(decryptVAPTData(studentProfile?.dateOfBirth)) : "",
                    studentGender: normalizeGenderForDisplay(studentProfile?.gender),
                    studentPhoto: studentProfile?.photo || null,
                    mobileNumber: studentProfile.mobileNumber ? decryptVAPTData(studentProfile.mobileNumber) : "",
                    email: studentProfile.email ? decryptVAPTData(studentProfile.email) : "",
                    address: studentProfile.address ? decryptVAPTData(studentProfile.address) : "",
                    applicants: [
                        primaryApplicant,
                        ...coApplicantProfiles.map((coApplicant) => ({
                            id: coApplicant.id,
                            name: coApplicant.name || "",
                            pan: coApplicant.pan ? decryptVAPTData(coApplicant.pan) : "",
                            panDocument: coApplicant.panDocument || null,
                            aadhaarDocument: coApplicant.aadhaarDocument || null,
                            dateOfBirth: coApplicant.dateOfBirth ? normalizeDateOfBirth(decryptVAPTData(coApplicant.dateOfBirth)) : "",
                            gender: normalizeGenderForDisplay(coApplicant.gender),
                            mobileNumber: coApplicant.mobileNumber ? decryptVAPTData(coApplicant.mobileNumber) : "",
                            email: coApplicant.email ? decryptVAPTData(coApplicant.email) : "",
                            photo: coApplicant.photo || null,
                            address: coApplicant.address ? decryptVAPTData(coApplicant.address) : "",
                        })),
                    ],
                    isActive: true,
                };

                setStudentForm(nextStudentForm);
                setIsApplicantSameAsStudent(areApplicantsEquivalent(nextStudentForm, primaryApplicant));
                setLockedStudentFields({
                    mobileNumber: true,
                });
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isEditMode) return;

        const mobilePrefill = navigationState.mobilePrefill;

        if (!mobilePrefill?.mobileNumber) return;

        const prefillResult = mobilePrefill.result;

        const nextStudentForm: IEducationStudentFormData = {
            ...defaultStudentForm,
            studentName: prefillResult?.name?.trim() || "",
            studentPan: prefillResult?.pan?.trim().toUpperCase() || "",
            studentDateOfBirth: normalizeDateOfBirth(prefillResult?.dob),
            studentGender: normalizeGenderForDisplay(prefillResult?.gender),
            mobileNumber: mobilePrefill.mobileNumber,
            email: prefillResult?.email?.trim() || "",
            address: buildAddress(prefillResult),
        };

        setStudentForm((prev) => ({
            ...prev,
            ...nextStudentForm,
        }));

        setLockedStudentFields({
            mobileNumber: hasValue(nextStudentForm.mobileNumber),
        });
    }, [isEditMode, navigationState.mobilePrefill]);

    useEffect(() => {
        if (!isEditMode || !id || !user.userID) return;

        fetchEditableStudentDetails();
    }, [id, isEditMode, user.userID]);

    const handleFieldChange = (
        fieldName: keyof IEducationStudentFormData,
        value: string | boolean | IEducationStudentApplicant[] | null,
    ): void => {
        setStudentForm((prev) => {
            const updatedStudentForm = {
                ...prev,
                [fieldName]: value,
            };

            if (!isApplicantSameAsStudent) {
                return updatedStudentForm;
            }

            const primaryApplicant = createApplicantFromStudent(
                updatedStudentForm,
                updatedStudentForm.applicants[0]?.id,
            );
            const remainingApplicants = updatedStudentForm.applicants.slice(1);

            return {
                ...updatedStudentForm,
                applicants: [primaryApplicant, ...remainingApplicants],
            };
        });

        const stringValue = typeof value === "string" ? value : "";
        const fieldError = fieldName === "studentName" ? validatePersonName(stringValue)
            : fieldName === "studentDateOfBirth" ? !stringValue ? validationMessages.dateOfBirthRequired : isAtLeastFifteenYearsOld(stringValue) ? "" : validationMessages.studentMinimumAge
                : fieldName === "studentGender" ? stringValue ? "" : validationMessages.genderRequired
                    : fieldName === "mobileNumber" ? !stringValue ? validationMessages.mobileNumberRequired : isEditMode || INDIAN_MOBILE_NUMBER_PATTERN.test(stringValue) ? "" : validationMessages.mobileNumberInvalid
                        : fieldName === "email" ? !stringValue ? validationMessages.emailRequired : EMAIL_PATTERN.test(stringValue) && stringValue.length <= 254 ? "" : validationMessages.emailInvalid
                            : fieldName === "address" ? validateAddress(stringValue)
                                : fieldName === "studentPan" ? !stringValue || PAN_NUMBER_PATTERN.test(stringValue) ? "" : validationMessages.panNumberInvalid
                                    : "";

        const primaryApplicantFieldMap: Partial<Record<keyof IEducationStudentFormData, keyof IEducationStudentApplicant>> = {
            studentName: "name",
            studentPan: "pan",
            studentDateOfBirth: "dateOfBirth",
            studentGender: "gender",
            mobileNumber: "mobileNumber",
            email: "email",
            address: "address",
            studentPanDocument: "panDocument",
            studentAadhaarDocument: "aadhaarDocument",
        };

        const applicantFieldName = isApplicantSameAsStudent
            ? primaryApplicantFieldMap[fieldName]
            : undefined;
        const applicantError = applicantFieldName === "name" ? validatePersonName(stringValue)
            : applicantFieldName === "pan" ? !stringValue ? validationMessages.panNumberRequired : PAN_NUMBER_PATTERN.test(stringValue) ? "" : validationMessages.panNumberInvalid
                : applicantFieldName === "dateOfBirth" ? !stringValue ? validationMessages.dateOfBirthRequired : isAtLeastFifteenYearsOld(stringValue) ? "" : validationMessages.applicantMinimumAge("Applicant")
                    : applicantFieldName === "gender" ? stringValue ? "" : validationMessages.genderRequired
                        : applicantFieldName === "mobileNumber" ? !stringValue ? validationMessages.mobileNumberRequired : INDIAN_MOBILE_NUMBER_PATTERN.test(stringValue) ? "" : validationMessages.mobileNumberInvalid
                            : applicantFieldName === "email" ? !stringValue ? validationMessages.emailRequired : EMAIL_PATTERN.test(stringValue) && stringValue.length <= 254 ? "" : validationMessages.emailInvalid
                                : applicantFieldName === "address" ? validateAddress(stringValue)
                                    : applicantFieldName === "panDocument" || applicantFieldName === "aadhaarDocument" ? stringValue ? "" : `Please upload ${applicantFieldName === "panDocument" ? "PAN" : "Aadhaar"} document`
                                        : "";

        setFormErrors((prev) => ({
            ...prev,
            [fieldName]: fieldError,
            ...(applicantFieldName ? { [`applicants.0.${applicantFieldName}`]: applicantError } : {}),
        }));
    };

    const uploadStudentDocument = async (
        file: File,
        documentFor: DocumentForFileUploadType,
        successMessage: string,
        showLoader: boolean = true,
    ): Promise<UploadedCommonDocument | null> => {
        if (!isFileSizeWithinLimit(file)) {
            toastError(getFileSizeLimitErrorMessage("File"));
            return null;
        }

        const uploadFormData = new FormData();
        uploadFormData.append("documentFile", file);
        uploadFormData.append("documentFor", String(documentFor));

        if (showLoader) setLoading(true);

        try {
            const response: IUploadCommonDocumentResponse = await uploadCommonDocumentAPI(uploadFormData);

            if (!response || response.statusCode !== 200) {
                toastError(response?.message);
                return null;
            }

            if (!response.data.path || !response.data.link) {
                toastError("Uploaded document path or link is missing.");
                return null;
            }

            toastSuccess(successMessage);
            return response.data;
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const savePhotoValue = (target: PhotoEditorTarget | null, value: string | null): void => {
        if (!target) return;

        if (target.type === "student") {
            handleFieldChange("studentPhoto", value);
            return;
        }

        handleApplicantChange(target.index, "photo", value);
    };

    const getPhotoPreviewKey = (target: PhotoEditorTarget): string =>
        target.type === "student" ? "student" : `applicant-${target.index}`;

    const getDocumentPreviewKey = (
        owner: "student" | "applicant",
        fieldName: "studentPanDocument" | "studentAadhaarDocument" | "panDocument" | "aadhaarDocument",
        applicantIndex?: number,
    ): string => owner === "student" ? `student-${fieldName}` : `applicant-${applicantIndex}-${fieldName}`;

    const openPhotoEditor = (target: PhotoEditorTarget): void => {
        setPhotoEditorTarget(target);
    };

    const getPhotoValue = (target: PhotoEditorTarget | null): string | null => {
        if (!target) return null;

        if (target.type === "student") {
            return photoPreviewLinks[getPhotoPreviewKey(target)] || studentForm.studentPhoto;
        }

        return photoPreviewLinks[getPhotoPreviewKey(target)]
            || (studentForm.applicants[target.index]?.photo ?? null);
    };

    const handleApplicantChange = (
        index: number,
        fieldName: keyof IEducationStudentApplicant,
        value: string | null,
    ): void => {
        setStudentForm((prev) => ({
            ...prev,
            applicants: prev.applicants.map((applicant, applicantIndex) =>
                applicantIndex === index ? { ...applicant, [fieldName]: value } : applicant,
            ),
        }));

        const applicantType = index === 0 ? "Applicant" : "Co-applicant";
        const fieldError = fieldName === "name" ? validatePersonName(value || "")
            : fieldName === "pan" ? !value ? validationMessages.panNumberRequired : PAN_NUMBER_PATTERN.test(value.trim()) ? "" : validationMessages.panNumberInvalid
                : fieldName === "dateOfBirth" ? !value ? validationMessages.dateOfBirthRequired : isAtLeastFifteenYearsOld(value) ? "" : validationMessages.applicantMinimumAge(applicantType)
                    : fieldName === "gender" ? value ? "" : validationMessages.genderRequired
                        : fieldName === "mobileNumber" ? !value ? validationMessages.mobileNumberRequired : INDIAN_MOBILE_NUMBER_PATTERN.test(value) ? "" : validationMessages.mobileNumberInvalid
                            : fieldName === "email" ? !value ? validationMessages.emailRequired : EMAIL_PATTERN.test(value) && value.length <= 254 ? "" : validationMessages.emailInvalid
                                : fieldName === "address" ? validateAddress(value || "")
                                    : "";

        setFormErrors((prev) => ({ ...prev, [`applicants.${index}.${fieldName}`]: fieldError }));
    };

    const handleApplicantDocumentChange = async (
        index: number,
        fieldName: "panDocument" | "aadhaarDocument",
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!isPdfFile(selectedFile) && !isImageFile(selectedFile)) {
            toastError("Invalid file type. Only PDF, JPG, JPEG, or PNG files are allowed.");
            event.target.value = "";
            return;
        }

        await handleApplicantDocumentUpload(index, fieldName, selectedFile);
        event.target.value = "";
    };

    const handleApplicantSyncChange = (checked: boolean): void => {
        setIsApplicantSameAsStudent(checked);

        if (checked) {
            setFormErrors((prev) => {
                const nextErrors = { ...prev };

                const shouldShowValidation = Object.values(prev).some(Boolean);

                if (shouldShowValidation) {
                    const primaryApplicant = createApplicantFromStudent(
                        studentForm,
                        studentForm.applicants[0]?.id,
                    );

                    nextErrors["applicants.0.name"] = validatePersonName(primaryApplicant.name);
                    nextErrors["applicants.0.pan"] = primaryApplicant.pan
                        ? PAN_NUMBER_PATTERN.test(primaryApplicant.pan)
                            ? ""
                            : validationMessages.panNumberInvalid
                        : validationMessages.panNumberRequired;
                    nextErrors["applicants.0.dateOfBirth"] = primaryApplicant.dateOfBirth
                        ? isAtLeastFifteenYearsOld(primaryApplicant.dateOfBirth)
                            ? ""
                            : validationMessages.applicantMinimumAge("Applicant")
                        : validationMessages.dateOfBirthRequired;
                    nextErrors["applicants.0.gender"] = primaryApplicant.gender
                        ? ""
                        : validationMessages.genderRequired;
                    nextErrors["applicants.0.mobileNumber"] = primaryApplicant.mobileNumber
                        ? INDIAN_MOBILE_NUMBER_PATTERN.test(primaryApplicant.mobileNumber)
                            ? ""
                            : validationMessages.mobileNumberInvalid
                        : validationMessages.mobileNumberRequired;
                    nextErrors["applicants.0.email"] = primaryApplicant.email
                        ? EMAIL_PATTERN.test(primaryApplicant.email) && primaryApplicant.email.length <= 254
                            ? ""
                            : validationMessages.emailInvalid
                        : validationMessages.emailRequired;
                    nextErrors["applicants.0.address"] = validateAddress(primaryApplicant.address || "");
                    nextErrors["applicants.0.panDocument"] = primaryApplicant.panDocument
                        ? ""
                        : "Please upload PAN document";
                    nextErrors["applicants.0.aadhaarDocument"] = primaryApplicant.aadhaarDocument
                        ? ""
                        : "Please upload Aadhaar document";
                }

                return nextErrors;
            });
        }

        if (checked) {
            setPhotoPreviewLinks((prev) =>
                prev.student
                    ? { ...prev, "applicant-0": prev.student }
                    : prev,
            );
            setDocumentPreviewLinks((prev) => ({
                ...prev,
                ...(prev["student-studentPanDocument"]
                    ? { "applicant-0-panDocument": prev["student-studentPanDocument"] }
                    : {}),
                ...(prev["student-studentAadhaarDocument"]
                    ? { "applicant-0-aadhaarDocument": prev["student-studentAadhaarDocument"] }
                    : {}),
            }));
        } else {
            setPhotoPreviewLinks(({ "applicant-0": _applicantPhoto, ...prev }) => prev);
            setDocumentPreviewLinks(({
                "applicant-0-panDocument": _applicantPanDocument,
                "applicant-0-aadhaarDocument": _applicantAadhaarDocument,
                ...prev
            }) => prev);
        }

        setStudentForm((prev) => ({
            ...prev,
            applicants: [
                checked
                    ? createApplicantFromStudent(prev, prev.applicants[0]?.id)
                    : createEmptyApplicant(),
                ...prev.applicants.slice(1),
            ],
        }));
    };

    const removeCoApplicant = (index: number): void => {
        setStudentForm((prev) => ({
            ...prev,
            applicants: prev.applicants.filter((_, applicantIndex) => applicantIndex !== index),
        }));
    };

    const openApplicantAddFlow = (flowState: ApplicantAddFlowState): void => {
        setApplicantAddFlow(flowState);
        setApplicantLookupMobile("");
        setApplicantLookupError("");
        setIsApplicantLookupSubmitted(false);
        setIsApplicantManualEntryRequired(false);
    };

    const closeApplicantAddFlow = (): void => {
        setApplicantAddFlow(null);
        setApplicantLookupMobile("");
        setApplicantLookupError("");
        setIsApplicantLookupSubmitted(false);
        setIsApplicantManualEntryRequired(false);
    };

    const applyApplicantProfile = (
        flowState: ApplicantAddFlowState,
        applicantProfile: IEducationStudentApplicant,
    ): void => {
        const applicantIndex = flowState.isPrimaryApplicant ? 0 : flowState.index;

        setStudentForm((prev) => {
            const nextApplicants = [...prev.applicants];

            if (flowState.isPrimaryApplicant) {
                nextApplicants[0] = applicantProfile;
            } else {
                nextApplicants.splice(applicantIndex, 0, applicantProfile);
            }

            return {
                ...prev,
                applicants: nextApplicants,
            };
        });

        setFormErrors((prev) => {
            const nextErrors = { ...prev };

            [
                "name",
                "pan",
                "dateOfBirth",
                "gender",
                "mobileNumber",
                "email",
                "address",
                "panDocument",
                "aadhaarDocument",
            ].forEach((fieldName) => {
                nextErrors[`applicants.${applicantIndex}.${fieldName}`] = "";
            });

            return nextErrors;
        });
    };

    const handleFetchApplicantByMobile = async (): Promise<void> => {
        if (!applicantAddFlow) return;

        const mobileNumber = applicantLookupMobile.trim();
        const nextMobileError = !mobileNumber
            ? validationMessages.mobileNumberRequired
            : !INDIAN_MOBILE_NUMBER_PATTERN.test(mobileNumber)
                ? validationMessages.mobileNumberInvalid
                : "";

        setIsApplicantLookupSubmitted(true);
        setApplicantLookupError(nextMobileError);

        if (nextMobileError) {
            return;
        }

        if (!user.userID) {
            toastError("Institute details are missing.");
            return;
        }

        setApplicantLookupError("");
        setLoading(true);

        try {
            const body = {
                mobile_no: mobileNumber,
                instituteId: user.userID,
            };

            const response = await fetchMobilePrefillAPI(body);

            if (!response) {
                toastError("Unable to fetch co-applicant details.");
                return;
            }

            if (response.data?.isManualEntryRequired) {
                setIsApplicantManualEntryRequired(true);
                return;
            }

            if (response.statusCode !== 200) {
                toastError(response.message);
                return;
            }

            applyApplicantProfile(
                applicantAddFlow,
                createApplicantFromPrefill(mobileNumber, response.data?.result),
            );

            toastSuccess(`${applicantAddFlow.title} details fetched successfully.`);
            closeApplicantAddFlow();
        } finally {
            setLoading(false);
        }
    };

    const handleAddApplicantManually = (): void => {
        if (!applicantAddFlow) return;

        applyApplicantProfile(
            applicantAddFlow,
            createApplicantFromPrefill(applicantLookupMobile.trim(), null),
        );
        closeApplicantAddFlow();
    };

    const goBack = (): void => {
        navigate(RoutePathConstant.private.educationManageStudents);
    };

    const renderPhotoUploadCard = (
        title: string,
        helper: string,
        target: PhotoEditorTarget,
        disabled?: boolean,
    ) => {
        const photoValue = getPhotoValue(target);

        return (
            <div className="education-student-create-upload">
                <label className="form-label d-block">{title}</label>

                <div
                    role={disabled ? undefined : "button"}
                    tabIndex={disabled ? -1 : 0}
                    className={`borderBoxHldr p-15 text-start education-student-create-upload__card education-student-create-photo-card ${disabled ? "education-student-create-upload__card--disabled" : ""
                        }`}
                    onClick={() => {
                        if (!disabled) {
                            openPhotoEditor(target);
                        }
                    }}
                    onKeyDown={(event) => {
                        if (disabled) return;
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openPhotoEditor(target);
                        }
                    }}
                >
                    <div className="education-student-create-photo-card__main">
                        {photoValue ? (
                            <span className="education-student-create-photo-card__thumb">
                                <img src={photoValue} alt={`${title} preview`} />
                            </span>
                        ) : (
                            <span className="education-student-create-photo-card__icon">
                                <i className="bi bi-camera-fill" />
                            </span>
                        )}
                        <div>
                            <b className="d-block mb-1">{title}</b>
                            <small className="text-muted d-block">
                                {photoValue ? "Photo uploaded successfully" : helper}
                            </small>
                        </div>
                    </div>

                    {photoValue ? (
                        <div className="education-student-create-photo-card__actions">
                            <Button
                                className="education-student-create-photo-card__action education-student-create-photo-card__action--label"
                                disabled={disabled}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    openPhotoEditor(target);
                                }}
                                aria-label={`View ${title.toLowerCase()}`}
                            >
                                <i className="bi bi-eye" />
                                <span>View</span>
                            </Button>
                        </div>
                    ) : (
                        <span className="education-student-create-photo-card__cta">
                            Upload or Capture
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderUploadField = (
        idValue: string,
        title: string,
        helper: string,
        onChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>,
        error?: string,
        required?: boolean,
        disabled?: boolean,
        documentUrl?: string | null,
        documentPath?: string | null,
    ) => (
        <div className="education-student-create-upload form-group">
            <label className="form-label d-block" htmlFor={idValue}>
                {title}
                {required ? <sup>*</sup> : null}
            </label>
            <div
                className={`borderBoxHldr p-15 education-student-create-upload__card education-student-create-photo-card education-student-create-document-card ${disabled ? "education-student-create-upload__card--disabled" : ""}`}
            >
                <div className="education-student-create-photo-card__main">
                    <span className="education-student-create-photo-card__icon">
                        <i className="bi bi-file-earmark-text-fill" />
                    </span>
                    <label
                        htmlFor={idValue}
                        className={`education-student-create-document-card__content ${disabled ? "" : "cursor-pointer"}`}
                    >
                        <b className="d-block mb-1">{title}</b>
                        <small className="text-muted">{helper}</small>
                    </label>
                </div>
                {documentUrl || documentPath ? (
                    <div className="education-student-create-photo-card__actions">
                        <a
                            href={documentUrl || documentPath || ""}
                            target="_blank"
                            rel="noreferrer"
                            className="education-student-create-photo-card__action education-student-create-photo-card__action--label"
                        >
                            <i className="bi bi-eye" />
                            <span>View</span>
                        </a>
                    </div>
                ) : null}
            </div>

            <input
                id={idValue}
                type="file"
                accept={`${PDF_FILE_ACCEPT},${IMAGE_FILE_ACCEPT}`}
                onChange={(event) => void onChange(event)}
                disabled={disabled}
                className="d-none"
            />
            {error ? <small className="error">{error}</small> : null}
        </div>
    );

    const renderApplicantCard = (
        applicant: IEducationStudentApplicant,
        index: number,
        title: string,
        description: string,
        canRemove: boolean,
        isPrimaryApplicant: boolean = false,
        disabled: boolean = false,
    ) => {
        const isPrimaryApplicantLocked =
            disabled || (isPrimaryApplicant && isApplicantSameAsStudent);

        return (
            <section
                key={index}
                className={`education-student-create-card mt-5 ${isPrimaryApplicantLocked ? "education-student-create-card--disabled" : ""
                    }`}
            >
                <div className="education-student-create-card__head">
                    <div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                    </div>
                    <div className="education-student-create-card__head-actions">
                        {isPrimaryApplicant ? (
                            <>
                                <label className="education-student-sync-check">
                                    <input
                                        type="checkbox"
                                        checked={isApplicantSameAsStudent}
                                        disabled={disabled}
                                        onChange={(event) =>
                                            handleApplicantSyncChange(event.target.checked)
                                        }
                                    />
                                    <span>Same as Student</span>
                                </label>
                                {!isApplicantSameAsStudent ? (
                                    <Button
                                        className="btn btn-black-line"
                                        disabled={disabled}
                                        onClick={() =>
                                            openApplicantAddFlow({
                                                index: 0,
                                                title: "Applicant",
                                                isPrimaryApplicant: true,
                                            })
                                        }
                                    >
                                        Add Applicant via Mobile Number
                                    </Button>
                                ) : null}
                            </>
                        ) : canRemove ? (
                            <Button
                                className="btn btn-black-line"
                                disabled={disabled}
                                onClick={() => removeCoApplicant(index)}
                            >
                                Remove
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="education-student-create-card__body education-student-create-card__body--single">
                    <fieldset
                        className="education-student-create-fields education-student-create-fields--reset"
                        disabled={isPrimaryApplicantLocked}
                    >
                        <div className="row g-3">
                            <div className="form-group col-md-6">
                                <label className="form-label">Name<sup>*</sup></label>
                                <InputText
                                    className="form-control"
                                    placeholder={`Enter ${title.toLowerCase()} name`}
                                    maxLength={100}
                                    value={applicant.name}
                                    onChange={(event) =>
                                        handleApplicantChange(index, "name", event.target.value?.trimStart())
                                    }
                                />
                                {formErrors[`applicants.${index}.name`] ? (
                                    <small className="error">{formErrors[`applicants.${index}.name`]}</small>
                                ) : null}
                            </div>

                            <div className="form-group col-md-6">
                                <label className="form-label">PAN<sup>*</sup></label>
                                <InputText
                                    className="form-control"
                                    placeholder={`Enter ${title.toLowerCase()} PAN`}
                                    value={applicant.pan}
                                    onChange={(event) =>
                                        handleApplicantChange(index, "pan", event.target.value.toUpperCase()?.trimStart())
                                    }
                                />
                                {formErrors[`applicants.${index}.pan`] ? (
                                    <small className="error">{formErrors[`applicants.${index}.pan`]}</small>
                                ) : null}
                            </div>

                            <div className="form-group col-md-6">
                                <label className="form-label">Date of Birth<sup>*</sup></label>
                                <Calendar
                                    inputId={`applicantDob-${index}`}
                                    name={`applicants.${index}.dateOfBirth`}
                                    value={createDateFromValue(applicant.dateOfBirth)}
                                    onChange={(event) =>
                                        handleApplicantChange(
                                            index,
                                            "dateOfBirth",
                                            formatDateToValue(event.value as Date | null),
                                        )
                                    }
                                    placeholder="Select Date"
                                    dateFormat="dd/mm/yy"
                                    className="w-100"
                                    showButtonBar
                                    disabled={isPrimaryApplicantLocked}
                                />
                                {formErrors[`applicants.${index}.dateOfBirth`] ? (
                                    <small className="error">
                                        {formErrors[`applicants.${index}.dateOfBirth`]}
                                    </small>
                                ) : null}
                            </div>

                            <div className="form-group col-md-6">
                                <label className="form-label">Gender<sup>*</sup></label>
                                {isPrimaryApplicantLocked && applicant.gender ? (
                                    <InputText
                                        className="form-control"
                                        value={applicant.gender}
                                        disabled
                                    />
                                ) : (
                                    <Dropdown
                                        className="w-100"
                                        value={applicant.gender}
                                        options={genderOptions}
                                        onChange={(event) =>
                                            handleApplicantChange(index, "gender", event.value)
                                        }
                                        placeholder="Select gender"
                                        disabled={isPrimaryApplicantLocked}
                                    />
                                )}
                                {formErrors[`applicants.${index}.gender`] ? (
                                    <small className="error">{formErrors[`applicants.${index}.gender`]}</small>
                                ) : null}
                            </div>

                            <div className="form-group col-md-6">
                                <label className="form-label">Mobile Number<sup>*</sup></label>
                                <InputText
                                    className="form-control"
                                    maxLength={10}
                                    placeholder="Enter 10-digit mobile number"
                                    value={applicant.mobileNumber}
                                    disabled={isPrimaryApplicantLocked}
                                    onChange={(event) =>
                                        handleApplicantChange(
                                            index,
                                            "mobileNumber",
                                            event.target.value.replace(/\D/g, "").slice(0, 10),
                                        )
                                    }
                                />
                                {formErrors[`applicants.${index}.mobileNumber`] ? (
                                    <small className="error">
                                        {formErrors[`applicants.${index}.mobileNumber`]}
                                    </small>
                                ) : null}
                            </div>

                            <div className="form-group col-md-6">
                                <label className="form-label">Email Address<sup>*</sup></label>
                                <InputText
                                    className="form-control"
                                    placeholder="Enter email address"
                                    value={applicant.email}
                                    onChange={(event) =>
                                        handleApplicantChange(index, "email", event.target.value?.trimStart())
                                    }
                                />
                                {formErrors[`applicants.${index}.email`] ? (
                                    <small className="error">{formErrors[`applicants.${index}.email`]}</small>
                                ) : null}
                            </div>

                            <div className="form-group col-12">
                                <label className="form-label">Address<sup>*</sup></label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    maxLength={250}
                                    placeholder={`Enter ${title.toLowerCase()} address`}
                                    value={applicant.address || ""}
                                    onChange={(event) =>
                                        handleApplicantChange(index, "address", event.target.value)
                                    }
                                />
                                {formErrors[`applicants.${index}.address`] ? (
                                    <small className="error">{formErrors[`applicants.${index}.address`]}</small>
                                ) : null}
                            </div>
                        </div>

                        <div className="education-student-create-upload-grid">
                            {renderPhotoUploadCard(
                                `${title} Photo`,
                                "Upload or capture photo",
                                { type: "applicant", index, title },
                                isPrimaryApplicantLocked,
                            )}

                            {renderUploadField(
                                `applicantPanDocumentUpload-${index}`,
                                "PAN Upload",
                                applicant.panDocument
                                    ? "PAN document uploaded"
                                    : "Required: upload PAN document",
                                (event) => handleApplicantDocumentChange(index, "panDocument", event),
                                formErrors[`applicants.${index}.panDocument`],
                                true,
                                isPrimaryApplicantLocked,
                                documentPreviewLinks[getDocumentPreviewKey("applicant", "panDocument", index)],
                                applicant.panDocument,
                            )}

                            {renderUploadField(
                                `applicantAadhaarDocumentUpload-${index}`,
                                "Aadhaar Upload",
                                applicant.aadhaarDocument
                                    ? "Aadhaar document uploaded"
                                    : "Required: upload Aadhaar document",
                                (event) =>
                                    handleApplicantDocumentChange(index, "aadhaarDocument", event),
                                formErrors[`applicants.${index}.aadhaarDocument`],
                                true,
                                isPrimaryApplicantLocked,
                                documentPreviewLinks[getDocumentPreviewKey("applicant", "aadhaarDocument", index)],
                                applicant.aadhaarDocument,
                            )}
                        </div>
                    </fieldset>
                </div>
            </section>
        );
    };

    const addCoApplicant = (): void => {
        const currentCoApplicantCount = Math.max(studentForm.applicants.length - 1, 0);

        if (currentCoApplicantCount >= 3) {
            return;
        }

        openApplicantAddFlow({
            index: studentForm.applicants.length,
            title: "Co-applicant",
            isPrimaryApplicant: false,
        });
    };

    const getApplicantDocumentForType = (
        applicantIndex: number,
        fieldName: "photo" | "panDocument" | "aadhaarDocument",
    ): DocumentForFileUploadType => {
        const isPrimaryApplicant = applicantIndex === 0;

        if (fieldName === "photo") {
            return isPrimaryApplicant
                ? DocumentForFileUploadType.APPLICANT_PHOTO
                : DocumentForFileUploadType.COAPPLICANT_PHOTO;
        }

        if (fieldName === "panDocument") {
            return isPrimaryApplicant
                ? DocumentForFileUploadType.APPLICANT_PAN
                : DocumentForFileUploadType.COAPPLICANT_PAN;
        }

        return isPrimaryApplicant
            ? DocumentForFileUploadType.APPLICANT_AADHAR
            : DocumentForFileUploadType.COAPPLICANT_AADHAR;
    };

    const validateForm = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const validateApplicant = (applicant: IEducationStudentApplicant, index: number): void => {
            nextErrors[`applicants.${index}.name`] = validatePersonName(applicant.name);
            nextErrors[`applicants.${index}.pan`] = applicant.pan.trim()
                ? PAN_NUMBER_PATTERN.test(applicant.pan.trim())
                    ? ""
                    : validationMessages.panNumberInvalid
                : validationMessages.panNumberRequired;
            nextErrors[`applicants.${index}.dateOfBirth`] = applicant.dateOfBirth.trim()
                ? isAtLeastFifteenYearsOld(applicant.dateOfBirth)
                    ? ""
                    : `${index === 0 ? "Applicant" : "Co-applicant"} must be at least 15 years old`
                : validationMessages.dateOfBirthRequired;
            nextErrors[`applicants.${index}.gender`] = applicant.gender
                ? ""
                : "Please select gender";
            nextErrors[`applicants.${index}.mobileNumber`] = applicant.mobileNumber.trim()
                ? INDIAN_MOBILE_NUMBER_PATTERN.test(applicant.mobileNumber.trim())
                    ? ""
                    : validationMessages.mobileNumberInvalid
                : validationMessages.mobileNumberRequired;
            nextErrors[`applicants.${index}.email`] = applicant.email.trim()
                ? EMAIL_PATTERN.test(applicant.email.trim()) && applicant.email.trim().length <= 254
                    ? ""
                    : validationMessages.emailInvalid
                : validationMessages.emailRequired;
            nextErrors[`applicants.${index}.address`] = validateAddress(applicant.address || "");
            nextErrors[`applicants.${index}.panDocument`] = applicant.panDocument
                ? ""
                : "Please upload PAN document";
            nextErrors[`applicants.${index}.aadhaarDocument`] = applicant.aadhaarDocument
                ? ""
                : "Please upload Aadhaar document";
        };

        nextErrors.studentName = validatePersonName(studentForm.studentName);
        nextErrors.studentDateOfBirth = studentForm.studentDateOfBirth.trim()
            ? isAtLeastFifteenYearsOld(studentForm.studentDateOfBirth)
                ? ""
                : validationMessages.studentMinimumAge
            : validationMessages.dateOfBirthRequired;
        nextErrors.studentGender = studentForm.studentGender
            ? ""
            : "Please select gender";
        nextErrors.mobileNumber = studentForm.mobileNumber.trim()
            ? isEditMode || INDIAN_MOBILE_NUMBER_PATTERN.test(studentForm.mobileNumber.trim())
                ? ""
                : validationMessages.mobileNumberInvalid
            : validationMessages.mobileNumberRequired;
        nextErrors.email = studentForm.email.trim()
            ? EMAIL_PATTERN.test(studentForm.email.trim()) && studentForm.email.trim().length <= 254
                ? ""
                : validationMessages.emailInvalid
            : validationMessages.emailRequired;
        nextErrors.address = validateAddress(studentForm.address);
        nextErrors.studentPan = studentForm.studentPan.trim()
            ? PAN_NUMBER_PATTERN.test(studentForm.studentPan.trim())
                ? ""
                : validationMessages.panNumberInvalid
            : "";
        nextErrors.studentAadhaarDocument = studentForm.studentAadhaarDocument
            ? ""
            : "Please upload Aadhaar document";

        studentForm.applicants.forEach((applicant, index) => validateApplicant(applicant, index));

        setFormErrors(nextErrors);
        return Object.values(nextErrors).every((value) => value === "");
    };

    const handleSave = async (): Promise<void> => {
        if (!validateForm()) return;

        setLoading(true);

        const { fullName, firstName, middleName, lastName } = splitFullName(studentForm.studentName);

        const primaryApplicant = studentForm.applicants[0] ?? createEmptyApplicant();

        const coApplicants = studentForm.applicants.slice(1);

        const mapApplicantPayload = (applicant: IEducationStudentApplicant) => ({
            name: applicant.name.trim(),
            pan: applicant.pan ? encryptVAPTData(applicant.pan) : "",
            panDocument: applicant.panDocument,
            aadhaarDocument: applicant.aadhaarDocument,
            dateOfBirth: applicant.dateOfBirth ? encryptVAPTData(applicant.dateOfBirth) : "",
            gender: normalizeGenderForPayload(applicant.gender),
            mobileNumber: applicant.mobileNumber ? encryptVAPTData(applicant.mobileNumber) : "",
            email: applicant.email ? encryptVAPTData(applicant.email.toLowerCase()) : "",
            photo: applicant.photo,
            address: applicant.address ? encryptVAPTData(applicant.address) : "",
        });

        const mapUpdateApplicantPayload = (
            applicant: IEducationStudentApplicant,
            idKey: "applicantID" | "coApplicantID",
        ) => ({
            [idKey]: applicant.id || null,
            name: applicant.name.trim(),
            pan: applicant.pan ? encryptVAPTData(applicant.pan.trim()) : "",
            panDocument: applicant.panDocument || "",
            aadhaarDocument: applicant.aadhaarDocument || "",
            dateOfBirth: applicant.dateOfBirth
                ? encryptVAPTData(applicant.dateOfBirth)
                : "",
            gender: normalizeGenderForPayload(applicant.gender),
            mobileNumber: applicant.mobileNumber
                ? encryptVAPTData(applicant.mobileNumber.trim())
                : "",
            email: applicant.email
                ? encryptVAPTData(applicant.email.trim().toLowerCase())
                : "",
            photo: applicant.photo || "",
            address: applicant.address
                ? encryptVAPTData(applicant.address.trim())
                : "",
        });

        const createPayload = {
            studentInfo: {
                email: studentForm.email ? encryptVAPTData(studentForm.email.toLowerCase()) : "",
                mobileNumber: studentForm.mobileNumber ? encryptVAPTData(studentForm.mobileNumber) : "",
                isUserDetailsRequired: true,
                instituteID: user.userID || "",
                pan: studentForm.studentPan ? encryptVAPTData(studentForm.studentPan) : "",
                fullName,
                firstName,
                middleName,
                lastName,
                category: "",
                dateOfBirth: studentForm.studentDateOfBirth ? encryptVAPTData(studentForm.studentDateOfBirth) : "",
                address: studentForm.address ? encryptVAPTData(studentForm.address) : "",
                state: "",
                city: "",
                zipCode: "",
                maskedAadhaar: "",
                gender: normalizeGenderForPayload(studentForm.studentGender),
                extraToken: encryptData(extraToken()),
                whiteLabelTenantId: user?.whiteLabelSettings?.id || "",
                userType: CLIENT_ROLE.STUDENT,
                photo: studentForm.studentPhoto,
                panDocument: studentForm.studentPanDocument,
                aadhaarDocument: studentForm.studentAadhaarDocument,
            },
            applicants: [mapApplicantPayload(primaryApplicant)],
            coApplicants: coApplicants.map(mapApplicantPayload),
        };

        const updatePayload = {
            studentInfo: {
                studentID: id || "",
                fullName,
                firstName,
                middleName,
                lastName,
                panNumber: studentForm.studentPan
                    ? encryptVAPTData(studentForm.studentPan.trim())
                    : "",
                email: studentForm.email
                    ? encryptVAPTData(studentForm.email.trim().toLowerCase())
                    : "",
                phoneNumber: studentForm.mobileNumber
                    ? encryptVAPTData(studentForm.mobileNumber.trim())
                    : "",
                gender: normalizeGenderForPayload(studentForm.studentGender),
                dob: studentForm.studentDateOfBirth
                    ? encryptVAPTData(studentForm.studentDateOfBirth)
                    : "",
                address: studentForm.address
                    ? encryptVAPTData(studentForm.address.trim())
                    : "",
                city: "",
                state: "",
                zipCode: "",
                aadhaar: "",
                profilePicture: studentForm.studentPhoto || "",
                panFilePath: studentForm.studentPanDocument || "",
                aadharFilePath: studentForm.studentAadhaarDocument || "",
            },
            applicants: [mapUpdateApplicantPayload(primaryApplicant, "applicantID")],
            coApplicants: coApplicants.map((applicant) =>
                mapUpdateApplicantPayload(applicant, "coApplicantID"),
            ),
        };

        try {
            const response = isEditMode
                ? await updateEducationStudentAPI(updatePayload)
                : await createEducationStudentAPI(createPayload);

            if (!response) {
                toastError("Unable to save student details.");
                return;
            }

            if (response.statusCode === 200) {
                toastSuccess(response.message);
                navigate(RoutePathConstant.private.educationManageStudents);
            } else {
                toastError(response.message);
            }
        } catch (error: any) {
            toastError(
                error?.response?.data?.message,
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStudentDocumentChange = async (
        fieldName: "studentPanDocument" | "studentAadhaarDocument",
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!isPdfFile(selectedFile) && !isImageFile(selectedFile)) {
            toastError("Invalid file type. Only PDF, JPG, JPEG, or PNG files are allowed.");
            event.target.value = "";
            return;
        }

        const documentFor =
            fieldName === "studentPanDocument"
                ? DocumentForFileUploadType.STUDENT_PAN
                : DocumentForFileUploadType.STUDENT_AADHAR;

        const uploadedDocument = await uploadStudentDocument(
            selectedFile,
            documentFor,
            fieldName === "studentPanDocument"
                ? "Student PAN uploaded successfully."
                : "Student Aadhaar uploaded successfully.",
        );

        if (uploadedDocument) {
            handleFieldChange(fieldName, uploadedDocument.path);
            setDocumentPreviewLinks((prev) => ({
                ...prev,
                [getDocumentPreviewKey("student", fieldName)]: uploadedDocument.link,
                ...(isApplicantSameAsStudent
                    ? {
                        [getDocumentPreviewKey(
                            "applicant",
                            fieldName === "studentPanDocument" ? "panDocument" : "aadhaarDocument",
                            0,
                        )]: uploadedDocument.link,
                    }
                    : {}),
            }));
        }

        event.target.value = "";
    };

    const handleApplicantDocumentUpload = async (
        index: number,
        fieldName: "panDocument" | "aadhaarDocument",
        file: File,
    ): Promise<void> => {
        const documentFor = getApplicantDocumentForType(index, fieldName);
        const uploadedDocument = await uploadStudentDocument(
            file,
            documentFor,
            index === 0
                ? fieldName === "panDocument"
                    ? "Applicant PAN uploaded successfully."
                    : "Applicant Aadhaar uploaded successfully."
                : fieldName === "panDocument"
                    ? "Co-applicant PAN uploaded successfully."
                    : "Co-applicant Aadhaar uploaded successfully.",
        );

        if (uploadedDocument) {
            handleApplicantChange(index, fieldName, uploadedDocument.path);
            setDocumentPreviewLinks((prev) => ({
                ...prev,
                [getDocumentPreviewKey("applicant", fieldName, index)]: uploadedDocument.link,
            }));
        }
    };

    const handlePhotoFileChange = async (
        target: PhotoEditorTarget,
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!isImageFile(selectedFile)) {
            toastError("Invalid file type. Only JPG, JPEG, or PNG images are allowed for photos.");
            event.target.value = "";
            return;
        }

        const previewKey = getPhotoPreviewKey(target);
        const previousPhoto = getPhotoValue(target);
        const localPreviewUrl = URL.createObjectURL(selectedFile);

        setPhotoPreviewLinks((prev) => ({
            ...prev,
            [previewKey]: localPreviewUrl,
            ...(target.type === "student" && isApplicantSameAsStudent
                ? { "applicant-0": localPreviewUrl }
                : {}),
        }));
        setIsPhotoUploading(true);

        try {
            const uploadedPhoto = await uploadStudentDocument(
                selectedFile,
                target.type === "student"
                    ? DocumentForFileUploadType.STUDENT_PHOTO
                    : getApplicantDocumentForType(target.index, "photo"),
                target.type === "student"
                    ? "Student photo uploaded successfully."
                    : target.index === 0
                        ? "Applicant photo uploaded successfully."
                        : "Co-applicant photo uploaded successfully.",
                false,
            );

            if (!uploadedPhoto) {
                setPhotoPreviewLinks((prev) => ({
                    ...prev,
                    [previewKey]: previousPhoto || "",
                    ...(target.type === "student" && isApplicantSameAsStudent
                        ? { "applicant-0": previousPhoto || "" }
                        : {}),
                }));
                return;
            }

            savePhotoValue(target, uploadedPhoto.path);
            setPhotoPreviewLinks((prev) => ({
                ...prev,
                [previewKey]: uploadedPhoto.link,
                ...(target.type === "student" && isApplicantSameAsStudent
                    ? { "applicant-0": uploadedPhoto.link }
                    : {}),
            }));
            setPhotoEditorTarget(null);
        } finally {
            URL.revokeObjectURL(localPreviewUrl);
            setIsPhotoUploading(false);
        }

        event.target.value = "";
    };

    const getPhotoTitle = (target: PhotoEditorTarget | null): string => {
        if (!target) return "Photo";
        return target.type === "student" ? "Student Photo" : `${target.title} Photo`;
    };

    const primaryApplicant = studentForm.applicants[0] ?? createEmptyApplicant();
    const coApplicants = studentForm.applicants.slice(1);
    const canAddMoreCoApplicants = coApplicants.length < 3;

    return (
        <>
            <Loader isLoading={loading} />

            <div className="whiteBoxHldr p-24 education-student-create-page">
                <div className="education-student-create-page__header">
                    <Button className="btn btn-black-line" onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}>
                        <i className="bi bi-arrow-left me-2" />
                        Back
                    </Button>
                </div>
                <TableTitle title={isEditMode ? "Edit Student" : "Add Student"} />

                <div className="education-student-create-layout">
                    <main className="education-student-create-main">
                        <section className="education-student-create-card">
                            <div className="education-student-create-card__head">
                                <div>
                                    <h4>Student Details</h4>
                                    <p>Capture the core profile, contact details, address, and KYC documents.</p>
                                </div>
                            </div>

                            <div className="education-student-create-card__body education-student-create-card__body--single">
                                <div className="education-student-create-fields">
                                    <div className="row g-3">
                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentName">
                                                Student Name<sup>*</sup>
                                            </label>
                                            <InputText
                                                id="studentName"
                                                className="form-control"
                                                placeholder="Enter student name"
                                                maxLength={100}
                                                value={studentForm.studentName}
                                                disabled={lockedStudentFields.studentName}
                                                onChange={(event) =>
                                                    handleFieldChange("studentName", event.target.value?.trimStart())
                                                }
                                            />
                                            {formErrors.studentName ? (
                                                <small className="error">{formErrors.studentName}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentPan">
                                                Student PAN
                                            </label>
                                            <InputText
                                                id="studentPan"
                                                className="form-control"
                                                placeholder="Enter student PAN"
                                                value={studentForm.studentPan}
                                                disabled={lockedStudentFields.studentPan}
                                                onChange={(event) =>
                                                    handleFieldChange("studentPan", event.target.value.toUpperCase()?.trimStart())
                                                }
                                            />
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentDob">
                                                Date of Birth<sup>*</sup>
                                            </label>
                                            {lockedStudentFields.studentDateOfBirth ? (
                                                <Calendar
                                                    inputId="studentDob"
                                                    name="studentDateOfBirth"
                                                    value={createDateFromValue(studentForm.studentDateOfBirth)}
                                                    placeholder="Select Date"
                                                    dateFormat="dd/mm/yy"
                                                    className="w-100"
                                                    showButtonBar
                                                    disabled
                                                />
                                            ) : (
                                                <Calendar
                                                    inputId="studentDob"
                                                    name="studentDateOfBirth"
                                                    value={createDateFromValue(studentForm.studentDateOfBirth)}
                                                    onChange={(event) =>
                                                        handleFieldChange(
                                                            "studentDateOfBirth",
                                                            formatDateToValue(event.value as Date | null),
                                                        )
                                                    }
                                                    placeholder="Select Date"
                                                    dateFormat="dd/mm/yy"
                                                    className="w-100"
                                                    showButtonBar
                                                />
                                            )}
                                            {formErrors.studentDateOfBirth ? (
                                                <small className="error">{formErrors.studentDateOfBirth}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentGender">
                                                Gender<sup>*</sup>
                                            </label>
                                            {lockedStudentFields.studentGender ? (
                                                <InputText
                                                    id="studentGender"
                                                    className="form-control"
                                                    value={studentForm.studentGender}
                                                    disabled
                                                />
                                            ) : (
                                                <Dropdown
                                                    id="studentGender"
                                                    className="w-100"
                                                    value={studentForm.studentGender}
                                                    options={genderOptions}
                                                    onChange={(event) =>
                                                        handleFieldChange("studentGender", event.value)
                                                    }
                                                    placeholder="Select gender"
                                                />
                                            )}
                                            {formErrors.studentGender ? (
                                                <small className="error">{formErrors.studentGender}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentMobile">
                                                Mobile Number<sup>*</sup>
                                            </label>
                                            <InputText
                                                id="studentMobile"
                                                className="form-control"
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength={10}
                                                value={studentForm.mobileNumber}
                                                onChange={(event) =>
                                                    handleFieldChange(
                                                        "mobileNumber",
                                                        event.target.value.replace(/\D/g, "").slice(0, 10),
                                                    )
                                                }
                                            />
                                            {formErrors.mobileNumber ? (
                                                <small className="error">{formErrors.mobileNumber}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label className="form-label" htmlFor="studentEmail">
                                                Email Address<sup>*</sup>
                                            </label>
                                            <InputText
                                                id="studentEmail"
                                                className="form-control"
                                                placeholder="Enter student email address"
                                                value={studentForm.email}
                                                disabled={lockedStudentFields.email}
                                                onChange={(event) => handleFieldChange("email", event.target.value?.trimStart())}
                                            />
                                            {formErrors.email ? (
                                                <small className="error">{formErrors.email}</small>
                                            ) : null}
                                        </div>

                                        <div className="form-group col-12">
                                            <label className="form-label" htmlFor="studentAddress">
                                                Address<sup>*</sup>
                                            </label>
                                            <textarea
                                                id="studentAddress"
                                                className="form-control"
                                                rows={3}
                                                maxLength={250}
                                                placeholder="Enter full student address"
                                                value={studentForm.address}
                                                disabled={lockedStudentFields.address}
                                                onChange={(event) => handleFieldChange("address", event.target.value)}
                                            />
                                            {formErrors.address ? (
                                                <small className="error">{formErrors.address}</small>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="education-student-create-upload-grid">
                                        {renderPhotoUploadCard(
                                            "Student Photo",
                                            "Upload or capture student photo",
                                            { type: "student" },
                                        )}

                                        {renderUploadField(
                                            "studentPanDocumentUpload",
                                            "Student PAN Upload",
                                            studentForm.studentPanDocument
                                                ? "PAN document uploaded"
                                                : "Optional: upload PAN document",
                                            (event) =>
                                                handleStudentDocumentChange("studentPanDocument", event),
                                            undefined,
                                            undefined,
                                            undefined,
                                            documentPreviewLinks[getDocumentPreviewKey("student", "studentPanDocument")],
                                            studentForm.studentPanDocument,
                                        )}

                                        {renderUploadField(
                                            "studentAadhaarDocumentUpload",
                                            "Student Aadhaar Upload",
                                            studentForm.studentAadhaarDocument
                                                ? "Aadhaar document uploaded"
                                                : "Required: upload Aadhaar document",
                                            (event) =>
                                                handleStudentDocumentChange("studentAadhaarDocument", event),
                                            formErrors.studentAadhaarDocument,
                                            true,
                                            undefined,
                                            documentPreviewLinks[getDocumentPreviewKey("student", "studentAadhaarDocument")],
                                            studentForm.studentAadhaarDocument,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {renderApplicantCard(
                            primaryApplicant,
                            0,
                            "Applicant",
                            "Use the checkbox when the applicant matches the student profile.",
                            false,
                            true,
                            !isApplicantEditingEnabled,
                        )}

                        <section className="education-student-create-card mt-5">
                            <div className="education-student-create-card__head">
                                <div>
                                    <h4>Co-applicant Details</h4>
                                    <p>Add co-applicants only when the financing structure requires them.</p>
                                </div>
                                <Button
                                    className="btn btn-orange"
                                    onClick={addCoApplicant}
                                    disabled={!isApplicantEditingEnabled || !canAddMoreCoApplicants}
                                >
                                    <i className="bi bi-plus-circle me-2" />
                                    {canAddMoreCoApplicants ? "Add Co-applicant" : "Max 3 Co-applicants"}
                                </Button>
                            </div>

                            {coApplicants.length > 0 ? (
                                <div className="education-student-create-stack">
                                    {coApplicants.map((applicant, coApplicantIndex) =>
                                        renderApplicantCard(
                                            applicant,
                                            coApplicantIndex + 1,
                                            `Co-applicant ${coApplicantIndex + 1}`,
                                            "Capture only the fields that differ from the student or applicant profile.",
                                            coApplicants.length > 1,
                                            false,
                                            !isApplicantEditingEnabled,
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="education-student-profile-empty-state">
                                    <strong>No co-applicants added yet.</strong>
                                </div>
                            )}
                        </section>

                        <div className="education-student-create-footer mt-3">
                            <Button className="btn btn-black-line" onClick={goBack}>
                                Cancel
                            </Button>
                            <Button className="btn btn-orange" onClick={handleSave}>
                                {isEditMode ? "Save Changes" : "Save Student"}
                            </Button>
                        </div>
                    </main>
                </div>
            </div>

            <Dialog
                header={photoEditorTarget ? getPhotoTitle(photoEditorTarget) : "Photo Upload"}
                visible={photoEditorTarget !== null}
                onHide={() => setPhotoEditorTarget(null)}
                modal
                draggable={false}
                resizable={false}
                blockScroll
                className="modalWrapper"
                style={{ width: "560px", maxWidth: "95vw" }}
            >
                <Loader isLoading={isPhotoUploading} />
                {photoEditorTarget ? (
                    <div className="education-student-create-photo-dialog">
                        <div className="education-student-create-photo-dialog__preview">
                            {getPhotoValue(photoEditorTarget) ? (
                                <img
                                    src={getPhotoValue(photoEditorTarget) || ""}
                                    alt={getPhotoTitle(photoEditorTarget)}
                                />
                            ) : (
                                <div className="education-student-create-photo-dialog__empty">
                                    <i className="bi bi-camera2" />
                                    <strong>No photo uploaded yet</strong>
                                    <span>Use upload or capture to save the image.</span>
                                </div>
                            )}
                        </div>

                        <div className="education-student-create-photo-dialog__actions">
                            <Button
                                type="button"
                                className="btn btn-black-line"
                                onClick={() => setPhotoEditorTarget(null)}
                                disabled={isPhotoUploading}
                            >
                                Cancel
                            </Button>
                            <label
                                htmlFor="studentPhotoModalUpload"
                                className="btn btn-orange-line mb-0"
                            >
                                Upload Image
                            </label>
                            <Button
                                type="button"
                                className="btn btn-orange"
                                onClick={() => setShowPhotoCapture(true)}
                                disabled={isPhotoUploading}
                            >
                                Capture Image
                            </Button>
                        </div>

                        <input
                            id="studentPhotoModalUpload"
                            type="file"
                            accept={IMAGE_FILE_ACCEPT}
                            disabled={isPhotoUploading}
                            onChange={(event) =>
                                photoEditorTarget && void handlePhotoFileChange(photoEditorTarget, event)
                            }
                            className="d-none"
                        />
                    </div>
                ) : null}
            </Dialog>

            <Dialog
                header="Mobile Number"
                visible={applicantAddFlow !== null}
                onHide={closeApplicantAddFlow}
                modal
                draggable={false}
                resizable={false}
                blockScroll
                className="modalWrapper"
                style={{ width: "520px" }}
                footer={
                    <div className="modal-footer gap-3">
                        <Button
                            className="btn btn-black-line w-100 text-center"
                            onClick={closeApplicantAddFlow}
                            disabled={loading}
                            label="Cancel"
                        />
                        {isApplicantManualEntryRequired ? (
                            <Button
                                className="btn btn-orange w-100 text-center"
                                onClick={handleAddApplicantManually}
                                disabled={loading}
                                label={`Add ${applicantAddFlow?.title || "Applicant"} Manually`}
                            />
                        ) : (
                            <Button
                                className="btn btn-orange w-100 text-center"
                                onClick={() => void handleFetchApplicantByMobile()}
                                disabled={loading}
                                label={loading ? "Processing..." : "Next"}
                            />
                        )}
                    </div>
                }
            >
                <Loader isLoading={loading} />

                <div className="modal-content">
                    <div className="modal-body">
                        <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
                            {isApplicantManualEntryRequired
                                ? `We didn't find details for the given mobile number. Still you can add this ${applicantAddFlow?.title?.toLowerCase() || "applicant"} manually by clicking 'Add ${applicantAddFlow?.title || "Applicant"} Manually'.`
                                : `Enter mobile number to authenticate ${applicantAddFlow?.title?.toLowerCase() || "applicant"} and continue.`}
                        </p>

                        <div className="form-group mb-3">
                            <label className="form-label small" htmlFor="applicantMobileNumber">
                                Mobile Number <sup>*</sup>
                            </label>
                            <InputText
                                id="applicantMobileNumber"
                                name="mobileNumber"
                                autoFocus
                                className="form-control"
                                placeholder="Enter Mobile Number"
                                value={applicantLookupMobile}
                                maxLength={10}
                                onChange={(event) => {
                                    setApplicantLookupMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                                    setApplicantLookupError("");
                                    setIsApplicantManualEntryRequired(false);
                                }}
                            />
                            {isApplicantLookupSubmitted && applicantLookupError ? (
                                <small className="error">{applicantLookupError}</small>
                            ) : null}
                        </div>
                    </div>
                </div>
            </Dialog>

            <CameraCaptureDialog
                visible={showPhotoCapture}
                title={photoEditorTarget ? `Capture ${getPhotoTitle(photoEditorTarget)}` : "Capture Photo"}
                onHide={() => setShowPhotoCapture(false)}
                loading={loading}
                onCapture={async (dataUrl) => {
                    if (!photoEditorTarget) {
                        setShowPhotoCapture(false);
                        return;
                    }

                    const blob = await fetch(dataUrl).then((response) => response.blob());

                    const capturedPhotoFile = new File([blob], "student-photo.png", { type: blob.type || "image/png" });

                    const uploadedPhoto = await uploadStudentDocument(
                        capturedPhotoFile,
                        photoEditorTarget.type === "student"
                            ? DocumentForFileUploadType.STUDENT_PHOTO
                            : getApplicantDocumentForType(photoEditorTarget.index, "photo"),
                        photoEditorTarget.type === "student"
                            ? "Student photo uploaded successfully."
                            : photoEditorTarget.index === 0
                                ? "Applicant photo uploaded successfully."
                                : "Co-applicant photo uploaded successfully.",
                    );

                    if (uploadedPhoto) {
                        savePhotoValue(photoEditorTarget, uploadedPhoto.path);
                        setPhotoPreviewLinks((prev) => ({
                            ...prev,
                            [getPhotoPreviewKey(photoEditorTarget)]: uploadedPhoto.link,
                            ...(photoEditorTarget.type === "student" && isApplicantSameAsStudent
                                ? { "applicant-0": uploadedPhoto.link }
                                : {}),
                        }));
                        setPhotoEditorTarget(null);
                    }

                    setShowPhotoCapture(false);
                }}
            />
        </>
    )
}

export default StudentFormData

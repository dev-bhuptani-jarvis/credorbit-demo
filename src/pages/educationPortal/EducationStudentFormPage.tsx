import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import Loader from "../../components/Loader";
import CameraCaptureDialog from "../../components/CameraCaptureDialog";
import {
  IEducationStudentApplicant,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  createEducationStudent,
  getEducationStudentById,
  updateEducationStudent,
} from "../../utils/demo/demoEducationStudents";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  convertFileToDataUrl,
  createEmptyApplicant,
  defaultStudentForm,
  genderOptions,
} from "./studentFormUtils";
import TableTitle from "../../components/TableTitle";

type StudentFormLocationState = {
  returnTo?: string;
  preselectedStudentId?: string;
};

type PhotoEditorTarget =
  | { type: "student" }
  | { type: "applicant"; index: number; title: string };

type PhotoPreviewState = {
  title: string;
  image: string;
};

type MobileLookupTarget =
  | { type: "student" }
  | { type: "applicant"; index: number; title: string };

type MobileLookupPreview = {
  name: string;
  pan: string;
  dateOfBirth: string;
  gender: IEducationStudentApplicant["gender"];
  mobileNumber: string;
  email: string;
  address: string;
};

const buildMobileLookupPreview = (mobileNumber: string): MobileLookupPreview => {
  const normalizedMobileNumber = mobileNumber.trim();
  const digits = normalizedMobileNumber.padEnd(10, "0");
  const firstSeed = Number(digits.slice(0, 2));
  const secondSeed = Number(digits.slice(2, 4));
  const year = 1980 + (Number(digits.slice(4, 6)) % 18);
  const month = (Number(digits.slice(6, 8)) % 12) + 1;
  const day = (Number(digits.slice(8, 10)) % 28) + 1;
  const genderPool: Array<IEducationStudentApplicant["gender"]> = ["Male", "Female", "Other"];
  const firstNames = ["Aarav", "Diya", "Kavya", "Rohan", "Mihir", "Tanvi", "Vihaan", "Ishita"];
  const lastNames = ["Shah", "Patel", "Nair", "Mehta", "Joshi", "Reddy", "Kapoor", "Iyer"];
  const localities = [
    "Navrangpura, Ahmedabad, Gujarat",
    "Malad West, Mumbai, Maharashtra",
    "Panampilly Nagar, Kochi, Kerala",
    "Indiranagar, Bengaluru, Karnataka",
    "Banjara Hills, Hyderabad, Telangana",
    "T Nagar, Chennai, Tamil Nadu",
  ];
  const firstName = firstNames[firstSeed % firstNames.length];
  const lastName = lastNames[secondSeed % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const panPrefix = `${firstName}${lastName}`
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .padEnd(5, "X")
    .slice(0, 5);

  return {
    name,
    pan: `${panPrefix}${digits.slice(0, 4)}${lastName.charAt(0).toUpperCase()}`,
    dateOfBirth: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    gender: genderPool[firstSeed % genderPool.length],
    mobileNumber: normalizedMobileNumber,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${digits.slice(6)}@demo.app`,
    address: `${(Number(digits.slice(0, 3)) % 90) + 10}, ${localities[firstSeed % localities.length]}`,
  };
};

const EducationStudentFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const navigationState = (location.state || {}) as StudentFormLocationState;
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [studentForm, setStudentForm] =
    useState<IEducationStudentFormData>(defaultStudentForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isApplicantSameAsStudent, setIsApplicantSameAsStudent] =
    useState<boolean>(false);
  const [photoEditorTarget, setPhotoEditorTarget] =
    useState<PhotoEditorTarget | null>(null);
  const [photoPreviewState, setPhotoPreviewState] =
    useState<PhotoPreviewState | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState<boolean>(false);
  const [mobileLookupTarget, setMobileLookupTarget] =
    useState<MobileLookupTarget | null>(null);
  const [mobileLookupNumber, setMobileLookupNumber] = useState<string>("");
  const [mobileLookupError, setMobileLookupError] = useState<string>("");
  const [mobileLookupPreview, setMobileLookupPreview] =
    useState<MobileLookupPreview | null>(null);
  const [isStudentLockedByLookup, setIsStudentLockedByLookup] =
    useState<boolean>(false);
  const [lockedApplicantIds, setLockedApplicantIds] =
    useState<Record<string, boolean>>({});

  const primaryApplicant = studentForm.applicants[0] || createEmptyApplicant();
  const coApplicants = studentForm.applicants.slice(1);

  const getLinkedApplicant = useCallback((
    applicant: IEducationStudentApplicant,
  ): IEducationStudentApplicant => ({
    ...applicant,
    name: studentForm.studentName,
    pan: studentForm.studentPan,
    dateOfBirth: studentForm.studentDateOfBirth,
    gender: studentForm.studentGender,
    mobileNumber: studentForm.mobileNumber,
    email: studentForm.email,
    photo: studentForm.studentPhoto,
    address: studentForm.address,
  }), [
    studentForm.address,
    studentForm.email,
    studentForm.mobileNumber,
    studentForm.studentPan,
    studentForm.studentDateOfBirth,
    studentForm.studentGender,
    studentForm.studentName,
    studentForm.studentPhoto,
  ]);

  useEffect(() => {
    if (!isEditMode || !id) {
      setStudentForm({
        ...defaultStudentForm,
        applicants: [createEmptyApplicant()],
      });
      setIsApplicantSameAsStudent(false);
      setIsStudentLockedByLookup(false);
      setLockedApplicantIds({});
      setMobileLookupTarget({ type: "student" });
      setMobileLookupNumber("");
      setMobileLookupError("");
      setMobileLookupPreview(null);
      return;
    }

    const student = getEducationStudentById(id);

    if (!student) {
      toastError("Student not found.");
      navigate(RoutePathConstant.private.educationManageStudents);
      return;
    }

    setStudentForm({
      studentName: student.studentName,
      studentPan: student.studentPan,
      studentPanDocument: student.studentPanDocument ?? null,
      studentAadhaarDocument: student.studentAadhaarDocument ?? null,
      studentDateOfBirth: student.studentDateOfBirth || "",
      studentGender: student.studentGender || "",
      studentPhoto: student.studentPhoto ?? null,
      isMinor: student.isMinor,
      parentPan: student.parentPan,
      mobileNumber: student.mobileNumber,
      email: student.email,
      address: student.address || "",
      applicants:
        student.applicants?.length > 0
          ? student.applicants
          : [createEmptyApplicant()],
      coApplicantName: student.coApplicantName,
      coApplicantMobileNumber: student.coApplicantMobileNumber,
      coApplicantRelation: student.coApplicantRelation,
      isActive: student.isActive,
    });
    setIsApplicantSameAsStudent(false);
    setIsStudentLockedByLookup(false);
    setLockedApplicantIds({});
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (!isApplicantSameAsStudent) return;

    setStudentForm((prev) => ({
      ...prev,
      applicants: prev.applicants.map((applicant, applicantIndex) =>
        applicantIndex === 0 ? getLinkedApplicant(applicant) : applicant,
      ),
    }));
  }, [
    getLinkedApplicant,
    isApplicantSameAsStudent,
  ]);

  const handleFieldChange = (
    fieldName: keyof IEducationStudentFormData,
    value: string | boolean | IEducationStudentApplicant[] | null,
  ): void => {
    setStudentForm((prev) => ({
      ...prev,
      [fieldName]: value,
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));

    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));
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

    setFormErrors((prev) => ({
      ...prev,
      [`applicants.${index}.${fieldName}`]: "",
    }));
  };

  const addCoApplicant = (): void => {
    setStudentForm((prev) => ({
      ...prev,
      applicants: [...prev.applicants, createEmptyApplicant()],
    }));
  };

  const removeCoApplicant = (index: number): void => {
    setStudentForm((prev) => ({
      ...prev,
      applicants: prev.applicants.filter((_, applicantIndex) => applicantIndex !== index),
    }));
  };

  const handleApplicantSyncChange = (checked: boolean): void => {
    setIsApplicantSameAsStudent(checked);

    if (!checked) return;

    setStudentForm((prev) => ({
      ...prev,
      applicants: prev.applicants.map((applicant, applicantIndex) =>
        applicantIndex === 0 ? getLinkedApplicant(applicant) : applicant,
      ),
    }));
  };

  const openMobileLookup = (target: MobileLookupTarget): void => {
    const defaultMobileNumber =
      target.type === "student"
        ? studentForm.mobileNumber
        : studentForm.applicants[target.index]?.mobileNumber || "";

    setMobileLookupTarget(target);
    setMobileLookupNumber(defaultMobileNumber);
    setMobileLookupError("");
    setMobileLookupPreview(
      INDIAN_MOBILE_NUMBER_PATTERN.test(defaultMobileNumber.trim())
        ? buildMobileLookupPreview(defaultMobileNumber.trim())
        : null,
    );
  };

  const closeMobileLookup = (): void => {
    setMobileLookupTarget(null);
    setMobileLookupNumber("");
    setMobileLookupError("");
    setMobileLookupPreview(null);
  };

  const handleFetchMobileLookup = (): void => {
    const normalizedMobileNumber = mobileLookupNumber.trim();

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(normalizedMobileNumber)) {
      setMobileLookupError("Enter a valid 10-digit mobile number.");
      setMobileLookupPreview(null);
      return;
    }

    setMobileLookupError("");
    setMobileLookupPreview(buildMobileLookupPreview(normalizedMobileNumber));
  };

  const applyMobileLookup = (): void => {
    if (!mobileLookupTarget || !mobileLookupPreview) return;

    if (mobileLookupTarget.type === "student") {
      setStudentForm((prev) => {
        const nextStudentData = {
          studentName: mobileLookupPreview.name,
          studentPan: mobileLookupPreview.pan,
          studentDateOfBirth: mobileLookupPreview.dateOfBirth,
          studentGender: mobileLookupPreview.gender,
          mobileNumber: mobileLookupPreview.mobileNumber,
          email: mobileLookupPreview.email,
          address: mobileLookupPreview.address,
        };

        return {
          ...prev,
          ...nextStudentData,
          isMinor: false,
          parentPan: "",
          applicants: prev.applicants.map((applicant, applicantIndex) =>
            applicantIndex === 0 && isApplicantSameAsStudent
              ? {
                ...applicant,
                name: nextStudentData.studentName,
                pan: nextStudentData.studentPan,
                dateOfBirth: nextStudentData.studentDateOfBirth,
                gender: nextStudentData.studentGender,
                mobileNumber: nextStudentData.mobileNumber,
                email: nextStudentData.email,
                photo: prev.studentPhoto,
                address: nextStudentData.address,
              }
              : applicant,
          ),
        };
      });

      setFormErrors((prev) => ({
        ...prev,
        studentName: "",
        studentDateOfBirth: "",
        studentGender: "",
        mobileNumber: "",
        email: "",
        address: "",
        parentPan: "",
      }));
      setIsStudentLockedByLookup(true);
      closeMobileLookup();
      toastSuccess("Student details fetched from mobile number.");
      return;
    }

    const applicantId = studentForm.applicants[mobileLookupTarget.index]?.id;

    setStudentForm((prev) => ({
      ...prev,
      applicants: prev.applicants.map((applicant, applicantIndex) =>
        applicantIndex === mobileLookupTarget.index
          ? {
            ...applicant,
            name: mobileLookupPreview.name,
            pan: mobileLookupPreview.pan,
            dateOfBirth: mobileLookupPreview.dateOfBirth,
            gender: mobileLookupPreview.gender,
            mobileNumber: mobileLookupPreview.mobileNumber,
            email: mobileLookupPreview.email,
            address: mobileLookupPreview.address,
          }
          : applicant,
      ),
    }));

    setFormErrors((prev) => ({
      ...prev,
      [`applicants.${mobileLookupTarget.index}.name`]: "",
      [`applicants.${mobileLookupTarget.index}.pan`]: "",
      [`applicants.${mobileLookupTarget.index}.dateOfBirth`]: "",
      [`applicants.${mobileLookupTarget.index}.gender`]: "",
      [`applicants.${mobileLookupTarget.index}.mobileNumber`]: "",
      [`applicants.${mobileLookupTarget.index}.email`]: "",
      [`applicants.${mobileLookupTarget.index}.address`]: "",
    }));

    if (applicantId) {
      setLockedApplicantIds((prev) => ({
        ...prev,
        [applicantId]: true,
      }));
    }

    closeMobileLookup();
    toastSuccess(`${mobileLookupTarget.title} fetched from mobile number.`);
  };

  const getPhotoValue = (target: PhotoEditorTarget | null): string | null => {
    if (!target) return null;

    if (target.type === "student") {
      return studentForm.studentPhoto;
    }

    return studentForm.applicants[target.index]?.photo ?? null;
  };

  const getPhotoTitle = (target: PhotoEditorTarget | null): string => {
    if (!target) return "Photo";
    return target.type === "student" ? "Student Photo" : `${target.title} Photo`;
  };

  const savePhotoValue = (target: PhotoEditorTarget | null, photo: string): void => {
    if (!target) return;

    if (target.type === "student") {
      handleFieldChange("studentPhoto", photo);
      return;
    }

    handleApplicantChange(target.index, "photo", photo);
  };

  const openPhotoEditor = (target: PhotoEditorTarget): void => {
    setPhotoEditorTarget(target);
  };

  const openPhotoPreview = (title: string, image: string | null): void => {
    if (!image) return;
    setPhotoPreviewState({ title, image });
  };

  const handlePhotoFileChange = async (
    target: PhotoEditorTarget,
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const photo = await convertFileToDataUrl(selectedFile);
    savePhotoValue(target, photo);
    event.target.value = "";
  };

  const handleStudentDocumentChange = async (
    fieldName: "studentPanDocument" | "studentAadhaarDocument",
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const documentValue = await convertFileToDataUrl(selectedFile);
    handleFieldChange(fieldName, documentValue);
    event.target.value = "";
  };

  const handleApplicantDocumentChange = async (
    index: number,
    fieldName: "panDocument" | "aadhaarDocument",
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const documentValue = await convertFileToDataUrl(selectedFile);
    handleApplicantChange(index, fieldName, documentValue);
    event.target.value = "";
  };

  const validateApplicant = (
    applicant: IEducationStudentApplicant,
    index: number,
    label: string,
    nextErrors: Record<string, string>,
  ): void => {
    if (!applicant.name.trim()) {
      nextErrors[`applicants.${index}.name`] = `${label} name is required.`;
    }

    if (!PAN_NUMBER_PATTERN.test(applicant.pan.trim().toUpperCase())) {
      nextErrors[`applicants.${index}.pan`] =
        `Enter a valid ${label.toLowerCase()} PAN number.`;
    }

    if (!applicant.panDocument) {
      nextErrors[`applicants.${index}.panDocument`] = `${label} PAN upload is required.`;
    }

    if (!applicant.aadhaarDocument) {
      nextErrors[`applicants.${index}.aadhaarDocument`] =
        `${label} Aadhaar upload is required.`;
    }

    if (!applicant.dateOfBirth) {
      nextErrors[`applicants.${index}.dateOfBirth`] =
        `${label} date of birth is required.`;
    }

    if (!applicant.gender) {
      nextErrors[`applicants.${index}.gender`] = `${label} gender is required.`;
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(applicant.mobileNumber.trim())) {
      nextErrors[`applicants.${index}.mobileNumber`] =
        `Enter a valid 10-digit ${label.toLowerCase()} mobile number.`;
    }

    if (!EMAIL_PATTERN.test(applicant.email.trim())) {
      nextErrors[`applicants.${index}.email`] =
        `Enter a valid ${label.toLowerCase()} email address.`;
    }

    if (!applicant.address?.trim()) {
      nextErrors[`applicants.${index}.address`] = `${label} address is required.`;
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!studentForm.studentName.trim()) {
      nextErrors.studentName = "Student name is required.";
    }

    if (!studentForm.studentDateOfBirth) {
      nextErrors.studentDateOfBirth = "Student date of birth is required.";
    }

    if (!studentForm.studentAadhaarDocument) {
      nextErrors.studentAadhaarDocument = "Student Aadhaar upload is required.";
    }

    if (!studentForm.studentGender) {
      nextErrors.studentGender = "Student gender is required.";
    }

    if (
      studentForm.isMinor &&
      !PAN_NUMBER_PATTERN.test(studentForm.parentPan.trim().toUpperCase())
    ) {
      nextErrors.parentPan = "Enter a valid parent PAN number.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(studentForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(studentForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!studentForm.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    validateApplicant(primaryApplicant, 0, "Applicant", nextErrors);
    coApplicants.forEach((applicant, index) =>
      validateApplicant(applicant, index + 1, `Co-applicant ${index + 1}`, nextErrors),
    );

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goBack = (): void => {
    navigate(
      navigationState.returnTo ||
      RoutePathConstant.private.educationManageStudents,
      {
        state: navigationState.preselectedStudentId
          ? { preselectedStudentId: navigationState.preselectedStudentId }
          : undefined,
      },
    );
  };

  const handleSave = (): void => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const savedStudent =
        isEditMode && id
          ? updateEducationStudent(id, studentForm)
          : createEducationStudent(studentForm);

      if (!savedStudent) {
        toastError("Unable to save student details.");
        return;
      }

      toastSuccess(
        `${savedStudent.studentName} ${isEditMode ? "updated" : "added"} successfully.`,
      );

      navigate(
        navigationState.returnTo ||
        RoutePathConstant.private.educationManageStudents,
        {
          state: {
            preselectedStudentId: savedStudent.id,
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const renderUploadField = (
    idValue: string,
    title: string,
    helper: string,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>,
    error?: string,
    required?: boolean,
    disabled?: boolean,
  ) => (
    <div className="education-student-create-upload">
      <label className="form-label d-block" htmlFor={idValue}>
        {title}
        {required ? <sup>*</sup> : null}
      </label>
      <label
        htmlFor={idValue}
        className={`borderBoxHldr p-15 d-block education-student-create-upload__card ${disabled ? "education-student-create-upload__card--disabled" : "cursor-pointer"
          }`}
      >
        <b className="d-block mb-1">{title}</b>
        <small className="text-muted">{helper}</small>
      </label>
      <input
        id={idValue}
        type="file"
        accept=".pdf,image/*"
        onChange={(event) => void onChange(event)}
        disabled={disabled}
        className="d-none"
      />
      {error ? <small className="error">{error}</small> : null}
    </div>
  );

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
          className={`borderBoxHldr p-15 d-block text-start education-student-create-upload__card education-student-create-photo-card ${disabled ? "education-student-create-upload__card--disabled" : ""
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
            <span className="education-student-create-photo-card__icon">
              <i className={`bi ${photoValue ? "bi-image-fill" : "bi-camera-fill"}`} />
            </span>
            <div>
              <b className="d-block mb-1">{title}</b>
              <small className="text-muted d-block">
                {photoValue ? "Photo uploaded successfully" : helper}
              </small>
            </div>
          </div>

          {photoValue ? (
            <div className="education-student-create-photo-card__actions">
              <button
                type="button"
                className="education-student-create-photo-card__action"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  openPhotoPreview(title, photoValue);
                }}
                aria-label={`View ${title.toLowerCase()}`}
              >
                <i className="bi bi-eye" />
              </button>
              <button
                type="button"
                className="education-student-create-photo-card__action"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  openPhotoEditor(target);
                }}
                aria-label={`Edit ${title.toLowerCase()}`}
              >
                <i className="bi bi-pencil" />
              </button>
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

  const renderApplicantCard = (
    applicant: IEducationStudentApplicant,
    index: number,
    title: string,
    description: string,
    canRemove: boolean,
  ) => {
    const isPrimaryApplicantLocked = !canRemove && isApplicantSameAsStudent;
    const isApplicantLockedByLookup = Boolean(lockedApplicantIds[applicant.id]);
    const disableIdentityFields = isPrimaryApplicantLocked || isApplicantLockedByLookup;

    return (
      <section
        key={applicant.id}
        className={`education-student-create-card mt-5 ${disableIdentityFields ? "education-student-create-card--disabled" : ""
          }`}
      >
        <div className="education-student-create-card__head">
          <div>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
          <div className="education-student-create-card__head-actions">
            {!canRemove ? (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  className="btn btn-orange-line"
                  onClick={() => openMobileLookup({ type: "applicant", index, title })}
                >
                  Fetch by Mobile
                </Button>
                <label className="education-student-sync-check">
                  <input
                    type="checkbox"
                    checked={isApplicantSameAsStudent}
                    onChange={(event) =>
                      handleApplicantSyncChange(event.target.checked)
                    }
                  />
                  <span>Same as Student</span>
                </label>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  className="btn btn-orange-line"
                  onClick={() => openMobileLookup({ type: "applicant", index, title })}
                >
                  Fetch by Mobile
                </Button>
                <Button
                  className="btn btn-black-line"
                  onClick={() => removeCoApplicant(index)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="education-student-create-card__body education-student-create-card__body--single">
          <div className="education-student-create-fields education-student-create-fields--reset">
            <div className="row g-3">
              <div className="form-group col-md-6">
                <label className="form-label">Name<sup>*</sup></label>
                <InputText
                  className="form-control"
                  placeholder={`Enter ${title.toLowerCase()} name`}
                  value={applicant.name}
                  disabled={disableIdentityFields}
                  onChange={(event) =>
                    handleApplicantChange(index, "name", event.target.value)
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
                  disabled={disableIdentityFields}
                  onChange={(event) =>
                    handleApplicantChange(index, "pan", event.target.value.toUpperCase())
                  }
                />
                {formErrors[`applicants.${index}.pan`] ? (
                  <small className="error">{formErrors[`applicants.${index}.pan`]}</small>
                ) : null}
              </div>

              <div className="form-group col-md-6">
                <label className="form-label">Date of Birth<sup>*</sup></label>
                <InputText
                  className="form-control"
                  type="date"
                  value={applicant.dateOfBirth}
                  disabled={disableIdentityFields}
                  onChange={(event) =>
                    handleApplicantChange(index, "dateOfBirth", event.target.value)
                  }
                />
                {formErrors[`applicants.${index}.dateOfBirth`] ? (
                  <small className="error">
                    {formErrors[`applicants.${index}.dateOfBirth`]}
                  </small>
                ) : null}
              </div>

              <div className="form-group col-md-6">
                <label className="form-label">Gender<sup>*</sup></label>
                <Dropdown
                  className="w-100"
                  value={applicant.gender}
                  options={genderOptions}
                  disabled={disableIdentityFields}
                  onChange={(event) =>
                    handleApplicantChange(index, "gender", event.value)
                  }
                  placeholder="Select gender"
                />
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
                  disabled={disableIdentityFields}
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
                  disabled={disableIdentityFields}
                  onChange={(event) =>
                    handleApplicantChange(index, "email", event.target.value)
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
                  placeholder={`Enter ${title.toLowerCase()} address`}
                  value={applicant.address || ""}
                  disabled={disableIdentityFields}
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
                false,
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
                false,
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
                false,
              )}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24 education-student-create-page">
        <div className="education-student-create-page__header">
          <Button className="btn btn-black-line" onClick={goBack}>
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
                <Button className="btn btn-orange-line" onClick={() => openMobileLookup({ type: "student" })}>
                  Fetch by Mobile
                </Button>
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
                        value={studentForm.studentName}
                        disabled={isStudentLockedByLookup}
                        onChange={(event) =>
                          handleFieldChange("studentName", event.target.value)
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
                        disabled={isStudentLockedByLookup}
                        onChange={(event) =>
                          handleFieldChange("studentPan", event.target.value.toUpperCase())
                        }
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label className="form-label" htmlFor="studentDob">
                        Date of Birth<sup>*</sup>
                      </label>
                      <InputText
                        id="studentDob"
                        className="form-control"
                        type="date"
                        value={studentForm.studentDateOfBirth}
                        disabled={isStudentLockedByLookup}
                        onChange={(event) =>
                          handleFieldChange("studentDateOfBirth", event.target.value)
                        }
                      />
                      {formErrors.studentDateOfBirth ? (
                        <small className="error">{formErrors.studentDateOfBirth}</small>
                      ) : null}
                    </div>

                    <div className="form-group col-md-6">
                      <label className="form-label" htmlFor="studentGender">
                        Gender<sup>*</sup>
                      </label>
                      <Dropdown
                        id="studentGender"
                        className="w-100"
                        value={studentForm.studentGender}
                        options={genderOptions}
                        disabled={isStudentLockedByLookup}
                        onChange={(event) =>
                          handleFieldChange("studentGender", event.value)
                        }
                        placeholder="Select gender"
                      />
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
                        disabled={isStudentLockedByLookup}
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
                        disabled={isStudentLockedByLookup}
                        onChange={(event) => handleFieldChange("email", event.target.value)}
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
                        placeholder="Enter full student address"
                        value={studentForm.address}
                        disabled={isStudentLockedByLookup}
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
                    )}
                  </div>
                </div>
              </div>
            </section>

            {renderApplicantCard(
              primaryApplicant,
              0,
              "Applicant Details",
              "Use the checkbox when the applicant matches the student profile.",
              false,
            )}

            <section className="education-student-create-card mt-5">
              <div className="education-student-create-card__head">
                <div>
                  <h4>Co-applicant Details</h4>
                  <p>Add co-applicants only when the financing structure requires them.</p>
                </div>
                <Button className="btn btn-orange" onClick={addCoApplicant}>
                  <i className="bi bi-plus-circle me-2" />
                  Add Co-applicant
                </Button>
              </div>

              {coApplicants.length > 0 ? (
                <div className="education-student-create-stack">
                  {coApplicants.map((applicant, index) =>
                    renderApplicantCard(
                      applicant,
                      index + 1,
                      `Co-applicant ${index + 1}`,
                      "Capture only the fields that differ from the student or applicant profile.",
                      true,
                    ),
                  )}
                </div>
              ) : (
                <div className="education-student-profile-empty-state">
                  <strong>No co-applicants added yet.</strong>
                </div>
              )}
            </section>

            <div className="education-student-create-footer">
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
        header={
          mobileLookupTarget?.type === "student"
            ? "Verify Student Mobile Number"
            : mobileLookupTarget
              ? `Verify ${mobileLookupTarget.title} Mobile Number`
              : "Verify Mobile Number"
        }
        visible={mobileLookupTarget !== null}
        onHide={closeMobileLookup}
        modal
        draggable={false}
        resizable={false}
        blockScroll
        className="modalWrapper responsive-dialog"
        style={{ width: "680px", maxWidth: "95vw" }}
      >
        <div className="education-verification-dialog">
          <div className="form-group">
            <label className="form-label" htmlFor="mobileLookupNumber">
              Mobile Number<sup>*</sup>
            </label>
            <InputText
              id="mobileLookupNumber"
              className="form-control"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              value={mobileLookupNumber}
              onChange={(event) => {
                setMobileLookupNumber(event.target.value.replace(/\D/g, "").slice(0, 10));
                setMobileLookupError("");
              }}
            />
          </div>

          {mobileLookupError ? <small className="error">{mobileLookupError}</small> : null}

          <div className="d-flex justify-content-end mt-3">
            <Button className="btn btn-orange-line" onClick={handleFetchMobileLookup}>
              Fetch Mobile Details
            </Button>
          </div>

          {mobileLookupPreview ? (
            <div className="borderBoxHldr p-24 mt-3">
              <div className="row">
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>Name</b>
                  <p className="text-break">{mobileLookupPreview.name}</p>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>PAN</b>
                  <p className="text-break">{mobileLookupPreview.pan}</p>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>Date of Birth</b>
                  <p className="text-break">{mobileLookupPreview.dateOfBirth}</p>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>Gender</b>
                  <p className="text-break">{mobileLookupPreview.gender}</p>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>Mobile Number</b>
                  <p className="text-break">{mobileLookupPreview.mobileNumber}</p>
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-4">
                  <b>Email Address</b>
                  <p className="text-break">{mobileLookupPreview.email}</p>
                </div>
                <div className="col-12 mb-0">
                  <b>Address</b>
                  <p className="text-break mb-0">{mobileLookupPreview.address}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="d-flex justify-content-end gap-3 mt-4 flex-wrap">
            <Button className="btn btn-black-line" onClick={closeMobileLookup}>
              Cancel
            </Button>
            <Button
              className="btn btn-orange"
              onClick={applyMobileLookup}
              disabled={!mobileLookupPreview}
            >
              Continue
            </Button>
          </div>
        </div>
      </Dialog>

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
              >
                Capture Image
              </Button>
            </div>

            <input
              id="studentPhotoModalUpload"
              type="file"
              accept="image/*"
              onChange={(event) =>
                photoEditorTarget && void handlePhotoFileChange(photoEditorTarget, event)
              }
              className="d-none"
            />
          </div>
        ) : null}
      </Dialog>

      <Dialog
        header={photoPreviewState?.title || "Photo Preview"}
        visible={photoPreviewState !== null}
        onHide={() => setPhotoPreviewState(null)}
        modal
        draggable={false}
        resizable={false}
        blockScroll
        className="modalWrapper"
        style={{ width: "560px", maxWidth: "95vw" }}
      >
        {photoPreviewState ? (
          <div className="education-student-create-photo-preview">
            <img src={photoPreviewState.image} alt={photoPreviewState.title} />
          </div>
        ) : null}

        <div className="education-student-create-photo-dialog__actions">
          <Button
            type="button"
            className="btn btn-black-line"
            onClick={() => setPhotoEditorTarget(null)}
          >
            Cancel
          </Button>
        </div>
      </Dialog>

      <CameraCaptureDialog
        visible={showPhotoCapture}
        title={photoEditorTarget ? `Capture ${getPhotoTitle(photoEditorTarget)}` : "Capture Photo"}
        onHide={() => setShowPhotoCapture(false)}
        onCapture={(dataUrl) => {
          savePhotoValue(photoEditorTarget, dataUrl);
          setShowPhotoCapture(false);
        }}
      />
    </>
  );
};

export default EducationStudentFormPage;

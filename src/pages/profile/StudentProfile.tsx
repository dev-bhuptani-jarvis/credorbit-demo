import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import Loader from "../../components/Loader";
import { RootState } from "../../store";
import {
  getStudentDetailAPI,
  updateEducationStudentAPI,
  uploadCommonDocumentAPI,
} from "../../utils/axios/apiServices";
import {
  IApplicantProfile,
  IFetchStudentDetailResponse,
  IStudentProfile,
  IUploadCommonDocumentResponse,
} from "../../interface/student";
import { IEducationStudentApplicant } from "../../interface/educationManagement";
import { APIResponseEntity } from "../../interface/apiResponse";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import {
  formatDate,
  getFileSizeLimitErrorMessage,
  IMAGE_FILE_ACCEPT,
  isFileSizeWithinLimit,
  isImageFile,
  isPdfFile,
  normalizeGenderForDisplay,
  normalizeGenderForPayload,
  PDF_FILE_ACCEPT,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { EMAIL_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN, PAN_NUMBER_PATTERN } from "../../utils/constants/pattern";
import { formatMobileNumber } from "../../utils/constants/constant";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { DocumentForFileUploadType } from "../../utils/constants/enum";
import { validationMessages } from "../../utils/constants/messages";

interface IStudentProfileForm {
  id: string;
  studentName: string;
  studentCode: string;
  studentDateOfBirth: string;
  studentGender: string;
  mobileNumber: string;
  email: string;
  studentPan: string;
  address: string;
  studentPhoto: string | null;
  studentPanDocument: string | null;
  studentAadhaarDocument: string | null;
}

interface IStudentProfileValidation {
  mobileNumber: string;
  email: string;
  studentPan: string;
  address: string;
}

type StudentDocumentField = "studentPhoto" | "studentPanDocument" | "studentAadhaarDocument";

type UploadedCommonDocument = {
  path: string;
  link: string;
};

const initialStudentForm: IStudentProfileForm = {
  id: "",
  studentName: "",
  studentCode: "",
  studentDateOfBirth: "",
  studentGender: "",
  mobileNumber: "",
  email: "",
  studentPan: "",
  address: "",
  studentPhoto: null,
  studentPanDocument: null,
  studentAadhaarDocument: null,
};

const initialValidation: IStudentProfileValidation = {
  mobileNumber: "",
  email: "",
  studentPan: "",
  address: "",
};

const createEmptyApplicant = (): IEducationStudentApplicant => ({
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

const StudentProfile = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const { userID } = user;

  const [loading, setLoading] = useState(false);

  const [isEditable, setIsEditable] = useState(false);

  const [studentForm, setStudentForm] = useState<IStudentProfileForm>(initialStudentForm);

  const [initialStudentFormData, setInitialStudentFormData] =
    useState<IStudentProfileForm>(initialStudentForm);

  const [primaryApplicant, setPrimaryApplicant] =
    useState<IEducationStudentApplicant>(createEmptyApplicant());

  const [coApplicants, setCoApplicants] = useState<IEducationStudentApplicant[]>([]);

  const [formErrors, setFormErrors] =
    useState<IStudentProfileValidation>(initialValidation);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const [studentDocumentLinks, setStudentDocumentLinks] = useState<
    Partial<Record<StudentDocumentField, string>>
  >({});

  const studentPhotoInputRef = useRef<HTMLInputElement>(null);

  const studentPanInputRef = useRef<HTMLInputElement>(null);

  const studentAadhaarInputRef = useRef<HTMLInputElement>(null);

  const decryptIfPresent = (value?: string | null): string => {
    if (!value) return "";

    const decryptedValue = decryptVAPTData(value);
    return decryptedValue || value;
  };

  const mapApplicantProfile = useCallback(
    (applicant?: IApplicantProfile | null): IEducationStudentApplicant =>
      applicant
        ? {
          id: applicant.id,
          name: applicant.name || "",
          pan: decryptIfPresent(applicant.pan),
          panDocument: applicant.panDocument || null,
          aadhaarDocument: applicant.aadhaarDocument || null,
          dateOfBirth: decryptIfPresent(applicant.dateOfBirth),
          gender: normalizeGenderForDisplay(applicant.gender),
          mobileNumber: decryptIfPresent(applicant.mobileNumber),
          email: decryptIfPresent(applicant.email),
          photo: applicant.photo || null,
          address: decryptIfPresent(applicant.address),
        }
        : createEmptyApplicant(),
    [],
  );

  const mapStudentProfile = useCallback(
    (studentProfile: IStudentProfile): IStudentProfileForm => ({
      id: studentProfile.id,
      studentName: studentProfile.name || "",
      studentCode: studentProfile.code || "",
      studentDateOfBirth: decryptIfPresent(studentProfile.dateOfBirth),
      studentGender: normalizeGenderForDisplay(studentProfile.gender),
      mobileNumber: decryptIfPresent(studentProfile.mobileNumber),
      email: decryptIfPresent(studentProfile.email),
      studentPan: decryptIfPresent(studentProfile.pan),
      address: decryptIfPresent(studentProfile.address),
      studentPhoto: studentProfile.photo || null,
      studentPanDocument: studentProfile.panDocument || null,
      studentAadhaarDocument: studentProfile.aadhaarDocument || null,
    }),
    [],
  );

  const buildValidationState = (
    formData: IStudentProfileForm,
  ): IStudentProfileValidation => ({
    mobileNumber: "",
    studentPan:
      IsStringNullEmptyOrUndefined(formData.studentPan.trim()) || PAN_NUMBER_PATTERN.test(formData.studentPan.trim())
        ? ""
        : "Please enter valid PAN number",
    email: IsStringNullEmptyOrUndefined(formData.email.trim())
      ? validationMessages.emailRequired
      : !EMAIL_PATTERN.test(formData.email.trim().toLowerCase())
        ? validationMessages.emailInvalid
        : "",
    address: IsStringNullEmptyOrUndefined(formData.address.trim())
      ? validationMessages.addressRequired
      : "",
  });

  const fetchStudentProfile = useCallback(async (): Promise<void> => {
    if (!userID) return;

    setLoading(true);

    try {
      const response: IFetchStudentDetailResponse = await getStudentDetailAPI({
        studentID: userID,
      });

      if (!response) return;

      if (response.statusCode === 200 && response.data) {
        const mappedStudent = mapStudentProfile(response.data.students);
        setStudentForm(mappedStudent);
        setInitialStudentFormData(mappedStudent);
        setPrimaryApplicant(mapApplicantProfile(response.data.applicants));
        setCoApplicants(
          (response.data.coApplicants || []).map((applicant) =>
            mapApplicantProfile(applicant),
          ),
        );
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  }, [mapApplicantProfile, mapStudentProfile, userID]);

  useEffect(() => {
    void fetchStudentProfile();
  }, [fetchStudentProfile]);

  const handleChange = (fieldName: keyof IStudentProfileForm, value: string): void => {
    const updatedValue =
      fieldName === "email" ? value.trim().toLowerCase() : value;

    setStudentForm((prev) => ({
      ...prev,
      [fieldName]: updatedValue,
    }));

    setFormErrors(
      buildValidationState({
        ...studentForm,
        [fieldName]: updatedValue,
      }),
    );
  };

  const splitFullName = (fullName: string) => {
    const sanitizedFullName = fullName.trim().replace(/\s+/g, " ");
    const nameParts = sanitizedFullName ? sanitizedFullName.split(" ") : [];

    return {
      fullName: sanitizedFullName,
      firstName: nameParts[0] || "",
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
    };
  };

  const uploadStudentDocument = async (
    file: File,
    documentFor: DocumentForFileUploadType,
  ): Promise<UploadedCommonDocument | null> => {
    if (!isFileSizeWithinLimit(file)) {
      toastError(getFileSizeLimitErrorMessage("File"));
      return null;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("documentFile", file);
    uploadFormData.append("documentFor", String(documentFor));

    setLoading(true);

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

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const handleStudentDocumentUpload = async (
    fieldName: StudentDocumentField,
    documentFor: DocumentForFileUploadType,
    file: File,
  ): Promise<void> => {
    const uploadedDocument = await uploadStudentDocument(file, documentFor);

    if (!uploadedDocument) return;

    setStudentForm((prev) => ({
      ...prev,
      [fieldName]: uploadedDocument.path,
    }));
    setStudentDocumentLinks((prev) => ({ ...prev, [fieldName]: uploadedDocument.link }));

    toastSuccess("Document uploaded successfully.");
  };

  const handleReset = (): void => {
    setStudentForm(initialStudentFormData);
    setFormErrors(initialValidation);
    setIsFormSubmitted(false);
    setIsEditable(false);
  };

  const handleSave = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const nextErrors = buildValidationState(studentForm);
    setFormErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);

    const { fullName, firstName, middleName, lastName } = splitFullName(
      studentForm.studentName,
    );

    const mapApplicantPayload = (
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
      address: applicant.address ? encryptVAPTData(applicant.address.trim()) : "",
    });

    const payload = {
      studentInfo: {
        studentID: studentForm.id || userID,
        fullName,
        firstName,
        middleName,
        lastName,
        panNumber: studentForm.studentPan
          ? encryptVAPTData(studentForm.studentPan.trim())
          : "",
        email: encryptVAPTData(studentForm.email.trim().toLowerCase()),
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
      applicants: [mapApplicantPayload(primaryApplicant, "applicantID")],
      coApplicants: coApplicants.map((applicant) =>
        mapApplicantPayload(applicant, "coApplicantID"),
      ),
    };

    try {
      const response: APIResponseEntity = await updateEducationStudentAPI(payload);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        await fetchStudentProfile();
        setIsEditable(false);
        setIsFormSubmitted(false);
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStudentDocumentCard = (
    title: string,
    filePath: string | null,
    uploadRef: { current: HTMLInputElement | null },
    documentFor: DocumentForFileUploadType,
    fieldName: StudentDocumentField,
    isImage: boolean = false,
  ): JSX.Element => {
    const documentLink = studentDocumentLinks[fieldName] || filePath;

    return (
      <div className="col-lg-4 col-md-6 col-12">
        <article className="document-card student-profile-document-card d-flex flex-column">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="document-icon flex-shrink-0">
              <i className={`bi ${isImage ? "bi-image" : "bi-file-earmark-text"}`} />
            </div>
            <div className="min-w-0">
              <h5 className="mb-1">{title}</h5>
              <small className={documentLink ? "text-success" : "text-muted"}>
                {documentLink ? "Uploaded" : "Not uploaded"}
              </small>
            </div>
          </div>
          <p className="small text-muted mb-3">
            {isImage ? "JPG, JPEG, PNG" : "PDF, JPG, JPEG, PNG"}
          </p>
          <div className="d-flex align-items-center gap-3 flex-wrap mt-auto">
            {documentLink ? (
              <a
                href={documentLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary fw-semibold"
              >
                View Document
              </a>
            ) : (
              <span className="text-muted small">No document available</span>
            )}
            {isEditable && (
              <>
                <input
                  ref={uploadRef}
                  type="file"
                  accept={isImage ? IMAGE_FILE_ACCEPT : `${PDF_FILE_ACCEPT},${IMAGE_FILE_ACCEPT}`}
                  style={{ display: "none" }}
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0];
                    if (!selectedFile) return;

                    if (isImage ? !isImageFile(selectedFile) : !isPdfFile(selectedFile) && !isImageFile(selectedFile)) {
                      toastError(isImage ? "Only JPG, JPEG, or PNG images are allowed." : "Only PDF, JPG, JPEG, or PNG files are allowed.");
                      event.target.value = "";
                      return;
                    }

                    void handleStudentDocumentUpload(
                      fieldName,
                      documentFor,
                      selectedFile,
                    );
                    event.target.value = "";
                  }}
                />
                <Button
                  className="btn btn-orange-line"
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                >
                  Upload
                </Button>
              </>
            )}
          </div>
        </article>
      </div>
    );
  };

  const renderApplicantDetails = (
    applicant: IEducationStudentApplicant,
    sectionTitle: string,
  ): JSX.Element => (
    <article className="borderBoxHldr p-24 student-profile-person-card">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
        <div>
          <h5 className="mb-1">{sectionTitle}</h5>
          <span className="text-muted small">{applicant.name || "Applicant information"}</span>
        </div>
        <span className="badge rounded-pill text-bg-light border">{sectionTitle === "Applicant" ? "Primary" : "Co-applicant"}</span>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Name</span>
          <p className="text-break mb-0">{applicant.name || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">PAN</span>
          <p className="text-break mb-0">{applicant.pan || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Date of Birth</span>
          <p className="text-break mb-0">
            {applicant.dateOfBirth
              ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Gender</span>
          <p className="text-break mb-0">{applicant.gender
            ? applicant.gender.charAt(0).toUpperCase() + applicant.gender.slice(1).toLowerCase()
            : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Mobile Number</span>
          <p className="text-break mb-0">
            {applicant.mobileNumber ? formatMobileNumber(applicant.mobileNumber) : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Email Address</span>
          <p className="text-break mb-0">{applicant.email || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Photo</span>
          <div className="mt-1">
            {applicant.photo ? (
              <a href={applicant.photo} target="_blank" rel="noreferrer" className="text-primary fw-semibold">
                View Document
              </a>
            ) : "Not uploaded"}
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">PAN Upload</span>
          <div className="mt-1">
            {applicant.panDocument ? (
              <a href={applicant.panDocument} target="_blank" rel="noreferrer" className="text-primary fw-semibold">
                View Document
              </a>
            ) : "Not uploaded"}
          </div>
        </div>
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
          <span className="student-profile-person-card__label">Aadhaar Upload</span>
          <div className="mt-1">
            {applicant.aadhaarDocument ? (
              <a href={applicant.aadhaarDocument} target="_blank" rel="noreferrer" className="text-primary fw-semibold">
                View Document
              </a>
            ) : "Not uploaded"}
          </div>
        </div>
        <div className="col-lg-9 col-md-8 col-sm-12 col-12 mb-0">
          <span className="student-profile-person-card__label">Address</span>
          <p className="text-break mb-0">{applicant.address || "-"}</p>
        </div>
      </div>
    </article>
  );

  return (
    <div className="row">
      <Loader isLoading={loading} />

      <div className="col-12 mb-4">
        <div className="titleMainWrapper">
          <h2>Student Profile</h2>

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
          <label className="form-label">Student Name</label>
          <InputText
            className="form-control"
            value={studentForm.studentName}
            disabled={!isEditable || Boolean(initialStudentFormData.studentName)}
            placeholder="Student name"
            onChange={(event) => handleChange("studentName", event.target.value)}
          />
        </div>
      </div>

      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">Student Code</label>
          <InputText
            className="form-control"
            value={studentForm.studentCode}
            disabled
            placeholder="Student code"
          />
        </div>
      </div>

      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">PAN Number</label>
          <InputText
            className="form-control"
            value={studentForm.studentPan}
            disabled={!isEditable || Boolean(initialStudentFormData.studentPan)}
            placeholder="PAN number"
            onChange={(event) => handleChange("studentPan", event.target.value.toUpperCase())}
          />
          {formErrors.studentPan && <small className="error">{formErrors.studentPan}</small>}
        </div>
      </div>

      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">Date of Birth</label>
          <div className="position-relative">
            <InputText
              className="form-control"
              value={
                studentForm.studentDateOfBirth
                  ? formatDate(studentForm.studentDateOfBirth, "DD-MM-YYYY")
                  : ""
              }
              disabled={!isEditable || Boolean(initialStudentFormData.studentDateOfBirth)}
              placeholder="Date of birth"
              onChange={(event) => handleChange("studentDateOfBirth", event.target.value)}
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
            value={studentForm.studentGender
              ? studentForm.studentGender.charAt(0).toUpperCase() + studentForm.studentGender.slice(1).toLowerCase()
              : ""}
            disabled={!isEditable || Boolean(initialStudentFormData.studentGender)}
            placeholder="Gender"
            onChange={(event) => handleChange("studentGender", event.target.value)}
          />
        </div>
      </div>

      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">Mobile Number <sup>*</sup></label>
          <InputText
            className="form-control"
            value={studentForm.mobileNumber}
            disabled={!isEditable || Boolean(initialStudentFormData.mobileNumber)}
            placeholder="Mobile number"
            maxLength={10}
            onChange={(event) => handleChange("mobileNumber", event.target.value)}
          />
          {isFormSubmitted && formErrors.mobileNumber && (
            <small className="error">{formErrors.mobileNumber}</small>
          )}
        </div>
      </div>

      <div className="col-lg-4 col-md-6 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">Email Address <sup>*</sup></label>
          <InputText
            className="form-control"
            value={studentForm.email}
            disabled={!isEditable}
            placeholder="Enter email address"
            onChange={(event) => handleChange("email", event.target.value)}
          />
          {isFormSubmitted && formErrors.email && (
            <small className="error">{formErrors.email}</small>
          )}
        </div>
      </div>

      <div className="col-lg-12 col-sm-12 col-12">
        <div className="form-group mb-4">
          <label className="form-label">Address <sup>*</sup></label>
          <InputTextarea
            className="form-control"
            rows={4}
            value={studentForm.address}
            placeholder="Enter full student address"
            disabled={!isEditable}
            onChange={(event) => handleChange("address", event.target.value.trimStart())}
          />
          {isFormSubmitted && formErrors.address && (
            <small className="error">{formErrors.address}</small>
          )}
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="titleMainWrapper">
          <h2>Student Documents</h2>
        </div>

        <div className="row g-3 mt-1">
          {renderStudentDocumentCard(
            "Student Photo",
            studentForm.studentPhoto,
            studentPhotoInputRef,
            DocumentForFileUploadType.STUDENT_PHOTO,
            "studentPhoto",
            true,
          )}
          {renderStudentDocumentCard(
            "Student PAN Upload",
            studentForm.studentPanDocument,
            studentPanInputRef,
            DocumentForFileUploadType.STUDENT_PAN,
            "studentPanDocument",
          )}
          {renderStudentDocumentCard(
            "Student Aadhaar Upload",
            studentForm.studentAadhaarDocument,
            studentAadhaarInputRef,
            DocumentForFileUploadType.STUDENT_AADHAR,
            "studentAadhaarDocument",
          )}
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="titleMainWrapper">
          <h2>Applicant Details</h2>
        </div>

        <div className="d-flex flex-column gap-4 mt-3">
          {renderApplicantDetails(primaryApplicant, "Applicant")}
        </div>
      </div>

      <div className="col-12 mb-4">
        <div className="titleMainWrapper">
          <h2>Co-Applicants</h2>
        </div>

        {(coApplicants || []).length > 0 ? (
          <div className="d-flex flex-column gap-4 mt-3">
            {coApplicants.map((applicant, index) =>
              renderApplicantDetails(applicant, `Co-Applicant ${index + 1}`),
            )}
          </div>
        ) : (
          <p className="mb-0 text-muted">No co-applicant details available.</p>
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
  );
};

export default StudentProfile;

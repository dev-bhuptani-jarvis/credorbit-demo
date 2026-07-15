import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
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
import { getEducationCourses } from "../../utils/demo/demoEducationCourses";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  convertFileToDataUrl,
  createEmptyApplicant,
  defaultStudentForm,
  genderOptions,
  getInitials,
} from "./studentFormUtils";
import TableTitle from "../../components/TableTitle";

type StudentFormLocationState = {
  returnTo?: string;
  preselectedStudentId?: string;
};

const EducationStudentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const navigationState = (location.state || {}) as StudentFormLocationState;
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [studentForm, setStudentForm] =
    useState<IEducationStudentFormData>(defaultStudentForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showStudentCamera, setShowStudentCamera] = useState<boolean>(false);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(
    null,
  );

  const courseOptions = useMemo(
    () =>
      getEducationCourses().map((course) => ({
        label: course.courseName,
        value: course.id,
      })),
    [],
  );

  const primaryApplicant = studentForm.applicants[0] || createEmptyApplicant();
  const coApplicants = studentForm.applicants.slice(1);

  useEffect(() => {
    if (!isEditMode || !id) {
      setStudentForm({
        ...defaultStudentForm,
        applicants: [createEmptyApplicant()],
      });
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
      courseId: student.courseId,
      studentPan: student.studentPan,
      studentDateOfBirth: student.studentDateOfBirth || "",
      studentGender: student.studentGender || "",
      studentPhoto: student.studentPhoto ?? null,
      isMinor: student.isMinor,
      parentPan: student.parentPan,
      mobileNumber: student.mobileNumber,
      email: student.email,
      applicants:
        student.applicants?.length > 0
          ? student.applicants
          : [createEmptyApplicant()],
      coApplicantName: student.coApplicantName,
      coApplicantMobileNumber: student.coApplicantMobileNumber,
      coApplicantRelation: student.coApplicantRelation,
      isActive: student.isActive,
    });
  }, [id, isEditMode, navigate]);

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

  const copyApplicantFromStudent = (index: number): void => {
    setStudentForm((prev) => ({
      ...prev,
      applicants: prev.applicants.map((applicant, applicantIndex) =>
        applicantIndex === index
          ? {
            ...applicant,
            name: prev.studentName,
            dateOfBirth: prev.studentDateOfBirth,
            gender: prev.studentGender,
            mobileNumber: prev.mobileNumber,
            email: prev.email,
            photo: prev.studentPhoto,
          }
          : applicant,
      ),
    }));
  };

  const handleStudentPhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const photo = await convertFileToDataUrl(selectedFile);
    handleFieldChange("studentPhoto", photo);
    event.target.value = "";
  };

  const handleApplicantPhotoChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const photo = await convertFileToDataUrl(selectedFile);
    handleApplicantChange(index, "photo", photo);
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
      nextErrors[`applicants.${index}.pan`] = `Enter a valid ${label.toLowerCase()} PAN number.`;
    }

    if (!applicant.dateOfBirth) {
      nextErrors[`applicants.${index}.dateOfBirth`] = `${label} date of birth is required.`;
    }

    if (!applicant.gender) {
      nextErrors[`applicants.${index}.gender`] = `${label} gender is required.`;
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(applicant.mobileNumber.trim())) {
      nextErrors[`applicants.${index}.mobileNumber`] =
        `Enter a valid 10-digit ${label.toLowerCase()} mobile number.`;
    }

    if (!EMAIL_PATTERN.test(applicant.email.trim())) {
      nextErrors[`applicants.${index}.email`] = `Enter a valid ${label.toLowerCase()} email address.`;
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!studentForm.studentName.trim()) {
      nextErrors.studentName = "Student name is required.";
    }

    if (!studentForm.courseId) {
      nextErrors.courseId = "Course is required.";
    }

    if (!studentForm.studentDateOfBirth) {
      nextErrors.studentDateOfBirth = "Student date of birth is required.";
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
      const savedStudent = isEditMode && id
        ? updateEducationStudent(id, studentForm)
        : createEducationStudent(studentForm);

      if (!savedStudent) {
        toastError("Unable to save student details.");
        return;
      }

      toastSuccess(
        `${savedStudent.studentName} ${isEditMode ? "updated" : "added"
        } successfully.`,
      );

      const targetRoute =
        navigationState.returnTo ||
        RoutePathConstant.private.educationManageStudents;

      navigate(targetRoute, {
        state: {
          preselectedStudentId: savedStudent.id,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const renderApplicantCard = (
    applicant: IEducationStudentApplicant,
    index: number,
    title: string,
    description: string,
    canRemove: boolean,
  ) => (
    <div key={applicant.id} className="education-student-applicant-card">
      <div className="education-student-applicant-card__head">
        <div>
          <h5>{title}</h5>
          <p>{description}</p>
        </div>
        <div className="education-student-applicant-card__actions">
          {!canRemove &&
            <Button
              className="btn btn-orange-line"
              onClick={() => copyApplicantFromStudent(index)}
            >
              Copy as above
            </Button>
          }
          {canRemove && (
            <Button
              className="btn btn-black-line"
              onClick={() => removeCoApplicant(index)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-3 col-md-4 col-sm-12">
          <div className="education-student-photo-card education-student-photo-card--applicant">
            <div className="education-student-photo-card__preview">
              {applicant.photo ? (
                <img src={applicant.photo} alt={applicant.name || title} />
              ) : (
                <span>{getInitials(applicant.name || title)}</span>
              )}
            </div>
            <div className="education-student-photo-card__actions">
              <label
                htmlFor={`applicantPhotoUpload-${index}`}
                className="btn btn-orange-line mb-0"
              >
                Upload
              </label>
              <label
                htmlFor={`applicantPhotoCapture-${index}`}
                className="btn btn-orange mb-0"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveCameraIndex(index);
                }}
              >
                Capture
              </label>
            </div>
            <input
              id={`applicantPhotoUpload-${index}`}
              type="file"
              accept="image/*"
              onChange={(event) => void handleApplicantPhotoChange(index, event)}
              className="d-none"
            />
          </div>
        </div>

        <div className="col-lg-9 col-md-8 col-sm-12">
          <div className="row g-3">
            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">Name<sup>*</sup></label>
              <InputText
                className="form-control"
                placeholder={`Enter ${title.toLowerCase()} name`}
                value={applicant.name}
                onChange={(event) =>
                  handleApplicantChange(index, "name", event.target.value)
                }
              />
              {formErrors[`applicants.${index}.name`] && (
                <small className="error">{formErrors[`applicants.${index}.name`]}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">PAN<sup>*</sup></label>
              <InputText
                className="form-control"
                placeholder={`Enter ${title.toLowerCase()} PAN`}
                value={applicant.pan}
                onChange={(event) =>
                  handleApplicantChange(index, "pan", event.target.value.toUpperCase())
                }
              />
              {formErrors[`applicants.${index}.pan`] && (
                <small className="error">{formErrors[`applicants.${index}.pan`]}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">Date of Birth<sup>*</sup></label>
              <InputText
                className="form-control"
                type="date"
                value={applicant.dateOfBirth}
                onChange={(event) =>
                  handleApplicantChange(
                    index,
                    "dateOfBirth",
                    event.target.value,
                  )
                }
              />
              {formErrors[`applicants.${index}.dateOfBirth`] && (
                <small className="error">
                  {formErrors[`applicants.${index}.dateOfBirth`]}
                </small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">Gender<sup>*</sup></label>
              <Dropdown
                className="w-100"
                value={applicant.gender}
                options={genderOptions}
                onChange={(event) =>
                  handleApplicantChange(index, "gender", event.value)
                }
                placeholder="Select gender"
              />
              {formErrors[`applicants.${index}.gender`] && (
                <small className="error">{formErrors[`applicants.${index}.gender`]}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">Mobile Number<sup>*</sup></label>
              <InputText
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={applicant.mobileNumber}
                onChange={(event) =>
                  handleApplicantChange(
                    index,
                    "mobileNumber",
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
              />
              {formErrors[`applicants.${index}.mobileNumber`] && (
                <small className="error">
                  {formErrors[`applicants.${index}.mobileNumber`]}
                </small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label">Email Address<sup>*</sup></label>
              <InputText
                className="form-control"
                placeholder="Enter email address"
                value={applicant.email}
                onChange={(event) =>
                  handleApplicantChange(index, "email", event.target.value)
                }
              />
              {formErrors[`applicants.${index}.email`] && (
                <small className="error">{formErrors[`applicants.${index}.email`]}</small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24 education-student-page">
        <div className="education-student-page__hero">
          <div>
            <TableTitle title={isEditMode ? "Edit Student" : "Add Student"} />
          </div>
          <div className="education-student-page__hero-actions">
            <Button
              className="btn btn-black-line"
              onClick={goBack}
            >
              Cancel
            </Button>
            <Button
              className="btn btn-orange"
              onClick={handleSave}
            >
              {isEditMode ? "Save Changes" : "Save Student"}
            </Button>
          </div>
        </div>
        <div className="education-student-form-shell">
          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Student Details</h4>
                <p>Keep the student profile simple and PAN-free.</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-3 col-md-4 col-sm-12">
                <div className="education-student-photo-card">
                  <div className="education-student-photo-card__preview">
                    {studentForm.studentPhoto ? (
                      <img
                        src={studentForm.studentPhoto}
                        alt={studentForm.studentName || "Student"}
                      />
                    ) : (
                      <span>{getInitials(studentForm.studentName)}</span>
                    )}
                  </div>
                  <div className="education-student-photo-card__actions">
                    <label
                      htmlFor="studentPhotoUpload"
                      className="btn btn-orange-line mb-0"
                    >
                      Upload
                    </label>
                    <label
                      htmlFor="studentPhotoCapture"
                      className="btn btn-orange mb-0"
                      onClick={(event) => {
                        event.preventDefault();
                        setShowStudentCamera(true);
                      }}
                    >
                      Capture
                    </label>
                  </div>
                  <input
                    id="studentPhotoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleStudentPhotoChange}
                    className="d-none"
                  />
                </div>
              </div>

              <div className="col-lg-9 col-md-8 col-sm-12">
                <div className="row g-3">
                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentName">
                      Student Name<sup>*</sup>
                    </label>
                    <InputText
                      id="studentName"
                      className="form-control"
                      placeholder="Enter student name"
                      value={studentForm.studentName}
                      onChange={(event) =>
                        handleFieldChange("studentName", event.target.value)
                      }
                    />
                    {formErrors.studentName && (
                      <small className="error">{formErrors.studentName}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentCourse">
                      Course<sup>*</sup>
                    </label>
                    <Dropdown
                      id="studentCourse"
                      className="w-100"
                      value={studentForm.courseId}
                      options={courseOptions}
                      onChange={(event) => handleFieldChange("courseId", event.value)}
                      placeholder="Select course"
                    />
                    {formErrors.courseId && (
                      <small className="error">{formErrors.courseId}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentMobile">
                      Mobile Number<sup>*</sup>
                    </label>
                    <InputText
                      id="studentMobile"
                      className="form-control"
                      placeholder="Enter 10-digit mobile number"
                      value={studentForm.mobileNumber}
                      maxLength={10}
                      onChange={(event) =>
                        handleFieldChange(
                          "mobileNumber",
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                    />
                    {formErrors.mobileNumber && (
                      <small className="error">{formErrors.mobileNumber}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentEmail">
                      Email Address<sup>*</sup>
                    </label>
                    <InputText
                      id="studentEmail"
                      className="form-control"
                      placeholder="Enter student email address"
                      value={studentForm.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                    />
                    {formErrors.email && (
                      <small className="error">{formErrors.email}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentDob">
                      Date of Birth<sup>*</sup>
                    </label>
                    <InputText
                      id="studentDob"
                      className="form-control"
                      type="date"
                      value={studentForm.studentDateOfBirth}
                      onChange={(event) =>
                        handleFieldChange(
                          "studentDateOfBirth",
                          event.target.value,
                        )
                      }
                    />
                    {formErrors.studentDateOfBirth && (
                      <small className="error">{formErrors.studentDateOfBirth}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentGender">
                      Gender<sup>*</sup>
                    </label>
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
                    {formErrors.studentGender && (
                      <small className="error">{formErrors.studentGender}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Applicant Details</h4>
                <p>The primary applicant can copy student details and then be adjusted if needed.</p>
              </div>
            </div>
            {renderApplicantCard(
              primaryApplicant,
              0,
              "Applicant",
              "Use copy as above if the applicant details matches with the student.",
              false,
            )}
          </section>

          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Co-applicants</h4>
                <p>Add multiple co-applicants only when required for the application.</p>
              </div>
              <Button className="btn btn-orange" onClick={addCoApplicant}>
                <i className="bi bi-plus-circle me-2" />
                Add Co-applicant
              </Button>
            </div>

            {coApplicants.length > 0 ? (
              <div className="education-student-applicant-stack">
                {coApplicants.map((applicant, index) =>
                  renderApplicantCard(
                    applicant,
                    index + 1,
                    `Co-applicant ${index + 1}`,
                    "Copy from student and update only the fields that differ.",
                    true,
                  ),
                )}
              </div>
            ) : (
              <div className="education-student-empty-state">
                <strong>No co-applicants added yet.</strong>
              </div>
            )}
          </section>

          <div className="education-student-form-footer">
            <Button
              className="btn btn-black-line"
              onClick={goBack}
            >
              Cancel
            </Button>
            <Button
              className="btn btn-orange"
              onClick={handleSave}
            >
              {isEditMode ? "Save Changes" : "Save Student"}
            </Button>
          </div>
        </div>
      </div>

      <CameraCaptureDialog
        visible={showStudentCamera}
        title="Capture Student Photo"
        onHide={() => setShowStudentCamera(false)}
        onCapture={(dataUrl) => {
          handleFieldChange("studentPhoto", dataUrl);
          setShowStudentCamera(false);
        }}
      />

      <CameraCaptureDialog
        visible={activeCameraIndex !== null}
        title={activeCameraIndex === 0 ? "Capture Applicant Photo" : "Capture Co-applicant Photo"}
        onHide={() => setActiveCameraIndex(null)}
        onCapture={(dataUrl) => {
          if (activeCameraIndex !== null) {
            handleApplicantChange(activeCameraIndex, "photo", dataUrl);
          }
          setActiveCameraIndex(null);
        }}
      />
    </>
  );
};

export default EducationStudentFormPage;

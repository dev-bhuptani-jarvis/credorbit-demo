import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import CameraCaptureDialog from "../../components/CameraCaptureDialog";
import PrimePaginator from "../../components/PrimePaginator";
import { RootState } from "../../store";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { setUserData } from "../../store/reducer/userSlice";
import {
  EducationDiscountType,
  IEducationCourse,
  IEducationStudent,
  IEducationStudentApplicant,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  buildEducationCustomerInfo,
  calculateEducationLoanSummary,
  getRecommendedEmiOptions,
} from "../../utils/demo/demoEducationLoanFlow";
import {
  createEducationLoanDraftAPI,
  createEducationStudentAPI,
  getEducationCoursesAPI,
  getEducationStudentsAPI,
} from "../../utils/axios/apiServices";
import {
  formatDate,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { defaultStudentForm } from "./studentFormUtils";

const parseAmount = (value: string): number =>
  Number(value.replace(/,/g, "").trim() || 0);

const consentChecklist = [
  "I confirm the student has agreed to proceed with the course financing request.",
  "I authorize bureau, banking, and underwriting checks for this application.",
  "I confirm the KFS and repayment obligations will be reviewed before submission.",
];

const cardStyle = {
  border: "1px solid #f1d4c8",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(255, 99, 44, 0.08), rgba(255, 247, 242, 0.95))",
  padding: "14px"
};

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const createEmptyApplicant = (): IEducationStudentApplicant => ({
  id: `applicant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  pan: "",
  dateOfBirth: "",
  gender: "",
  mobileNumber: "",
  email: "",
  photo: null,
});

const toInputDate = (value: string): Date | null => (value ? new Date(value) : null);

const toIsoDate = (value: Date | null): string =>
  value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

const convertFileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });

const EducationLoanApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState<boolean>(false);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [students, setStudents] = useState<IEducationStudent[]>([]);

  const [courses, setCourses] = useState<IEducationCourse[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<IEducationStudent | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [selectedCourseTenure, setSelectedCourseTenure] = useState<string>("");

  const [courseFees, setCourseFees] = useState<string>("");

  const [emiOptionMonths, setEmiOptionMonths] = useState<number>(0);

  const [downpayment, setDownpayment] = useState<string>("");

  const [discountType, setDiscountType] =
    useState<EducationDiscountType>("percentage");

  const [discountValue, setDiscountValue] = useState<string>("");

  const [consentState, setConsentState] = useState<boolean[]>(
    consentChecklist.map(() => true),
  );

  const [consentError, setConsentError] = useState<string>("");

  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);

  const [studentForm, setStudentForm] =
    useState<IEducationStudentFormData>(defaultStudentForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showStudentCamera, setShowStudentCamera] = useState<boolean>(false);

  const [applicantCameraIndex, setApplicantCameraIndex] = useState<number | null>(null);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 8,
    searchText: "",
  });

  const currentUser = useSelector((state: RootState) => state.user.user);
  const isStudentUser =
    currentUser.userID === "student-role-001" ||
    currentUser.roleName === "Student";

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const filteredStudents = useMemo(() => {
    const searchValue = (filterReq.searchText || "").trim().toLowerCase();

    return students.filter((student) => {
      if (!student.isActive) return false;
      if (!searchValue) return true;

      return (
        student.studentName.toLowerCase().includes(searchValue) ||
        student.studentCode.toLowerCase().includes(searchValue) ||
        student.courseName.toLowerCase().includes(searchValue) ||
        student.mobileNumber.includes(searchValue)
      );
    });
  }, [filterReq.searchText, students]);

  const paginatedStudents = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredStudents.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredStudents]);

  const emiOptions = useMemo(
    () =>
      selectedCourseTenure
        ? getRecommendedEmiOptions(selectedCourseTenure).map((value) => ({
          label: `${value} Months`,
          value,
        }))
        : [],
    [selectedCourseTenure],
  );

  const summary = useMemo(
    () =>
      calculateEducationLoanSummary({
        courseFees: parseAmount(courseFees),
        emiOptionMonths,
        downpayment: parseAmount(downpayment),
        discountType,
        discountValue: parseAmount(discountValue),
      }),
    [courseFees, discountType, discountValue, downpayment, emiOptionMonths],
  );

  const allConsentsAccepted = consentState.every(Boolean);
  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        label: course.courseName,
        value: course.id,
      })),
    [courses],
  );

  const formatNumber = (value: number): string =>
    value > 0 ? new Intl.NumberFormat("en-IN").format(value) : "";

  const applySelectedCourse = (course: IEducationCourse | undefined): void => {
    setSelectedCourseId(course?.id || "");
    setSelectedCourseTenure(course?.courseTenure || "");
    setCourseFees(course ? formatNumber(course.courseFees) : "");
    setEmiOptionMonths(0);
    setDownpayment("");
    setDiscountType("percentage");
    setDiscountValue("");
    setReviewErrors({});
  };

  const resetStudentForm = (): void => {
    setStudentForm({
      ...defaultStudentForm,
      applicants: [createEmptyApplicant()],
    });
    setFormErrors({});
  };

  const loadPageData = async (): Promise<void> => {
    setLoading(true);

    try {
      const [studentResponse, courseResponse] = await Promise.all([
        getEducationStudentsAPI(),
        getEducationCoursesAPI(),
      ]);

      setStudents(studentResponse);
      setCourses(courseResponse);

      const preselectedStudentId =
        state?.preselectedStudentId ||
        getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID);

      if (preselectedStudentId) {
        const matchedStudent = studentResponse.find(
          (student) => student.id === preselectedStudentId,
        );

        if (matchedStudent) {
          setSelectedStudent(matchedStudent);
          applySelectedCourse(undefined);
          setActiveIndex(1);
        }
      } else if (isStudentUser) {
        const matchedStudent = studentResponse.find(
          (student) =>
            student.email.toLowerCase() === currentUser.emailID?.toLowerCase() ||
            student.mobileNumber === currentUser.mobileNumber ||
            student.studentPan === currentUser.panNumber ||
            student.studentName === currentUser.userName,
        );

        if (matchedStudent) {
          setSelectedStudent(matchedStudent);
          applySelectedCourse(undefined);
          setActiveIndex(1);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    setFilterReq((previous) => ({
      ...previous,
      pageNumber: 0,
    }));
  }, [filterReq.searchText]);

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((previous) => ({
      ...previous,
      pageNumber: event.page,
      pageSize: event.rows,
    }));
  };

  const handleFieldChange = (
    fieldName: keyof IEducationStudentFormData,
    value: string | boolean | IEducationStudentApplicant[] | null,
  ): void => {
    setStudentForm((previous) => ({
      ...previous,
      [fieldName]: value,
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));

    setFormErrors((previous) => ({
      ...previous,
      [fieldName]: "",
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));
  };

  const handleApplicantChange = (
    index: number,
    fieldName: keyof IEducationStudentApplicant,
    value: string | null,
  ): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: previous.applicants.map((applicant, applicantIndex) =>
        applicantIndex === index ? { ...applicant, [fieldName]: value } : applicant,
      ),
    }));

    setFormErrors((previous) => ({
      ...previous,
      [`applicants.${index}.${fieldName}`]: "",
    }));
  };

  const addApplicant = (): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: [...previous.applicants, createEmptyApplicant()],
    }));
  };

  const removeApplicant = (index: number): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants:
        previous.applicants.length === 1
          ? [createEmptyApplicant()]
          : previous.applicants.filter((_, applicantIndex) => applicantIndex !== index),
    }));
  };

  const copyApplicantFromStudent = (index: number): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: previous.applicants.map((applicant, applicantIndex) =>
        applicantIndex === index
          ? {
              ...applicant,
              name: previous.studentName,
              dateOfBirth: previous.studentDateOfBirth,
              gender: previous.studentGender,
              mobileNumber: previous.mobileNumber,
              email: previous.email,
              photo: previous.studentPhoto,
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

  const validateStudentForm = (): boolean => {
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

    studentForm.applicants.forEach((applicant, index) => {
      if (!applicant.name.trim()) {
        nextErrors[`applicants.${index}.name`] = "Applicant name is required.";
      }

      if (!PAN_NUMBER_PATTERN.test(applicant.pan.trim().toUpperCase())) {
        nextErrors[`applicants.${index}.pan`] = "Enter a valid applicant PAN number.";
      }

      if (!applicant.dateOfBirth) {
        nextErrors[`applicants.${index}.dateOfBirth`] =
          "Applicant date of birth is required.";
      }

      if (!applicant.gender) {
        nextErrors[`applicants.${index}.gender`] = "Applicant gender is required.";
      }

      if (!INDIAN_MOBILE_NUMBER_PATTERN.test(applicant.mobileNumber.trim())) {
        nextErrors[`applicants.${index}.mobileNumber`] =
          "Enter a valid 10-digit applicant mobile number.";
      }

      if (!EMAIL_PATTERN.test(applicant.email.trim())) {
        nextErrors[`applicants.${index}.email`] = "Enter a valid applicant email address.";
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveStudent = async (): Promise<void> => {
    if (!validateStudentForm()) return;

    setLoading(true);

    try {
      const createdStudent = await createEducationStudentAPI(studentForm);
      toastSuccess(`${createdStudent.studentName} added successfully.`);
      setShowStudentDialog(false);
      resetStudentForm();
      await loadPageData();
      setSelectedStudent(createdStudent);
      setFilterReq((previous) => ({
        ...previous,
        pageNumber: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateReviewStep = (): boolean => {
    const nextErrors: Record<string, string> = {};

    const discountNumericValue = parseAmount(discountValue);

    const downpaymentValue = parseAmount(downpayment);

    const effectiveCourseFees = parseAmount(courseFees);

    if (!emiOptionMonths) {
      nextErrors.emiOptionMonths = "Select an EMI option.";
    }

    if (
      discountType === "percentage" &&
      (discountNumericValue < 0 || discountNumericValue > 100)
    ) {
      nextErrors.discountValue = "Percentage discount must be between 0 and 100.";
    }

    if (
      discountType === "amount" &&
      discountNumericValue > effectiveCourseFees
    ) {
      nextErrors.discountValue =
        "Discount amount cannot be more than the course fee.";
    }

    if (downpaymentValue > summary.discountedCourseFee) {
      nextErrors.downpayment =
        "Down payment cannot be more than the discounted course fee.";
    }

    if (!allConsentsAccepted) {
      setConsentError("All consent confirmations are required to continue.");
    } else {
      setConsentError("");
    }

    setReviewErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && allConsentsAccepted;
  };

  const prepareStudentForDraft = async (): Promise<IEducationStudent | null> => {
    if (!selectedStudent) return null;
    return selectedStudent;
  };

  const handlePrimaryAction = async (): Promise<void> => {
    if (activeIndex === 0) {
      if (!selectedStudent) {
        toastError("Select a student to continue.");
        return;
      }

      setActiveIndex(1);
      return;
    }

    if (activeIndex === 1) {
      if (!selectedCourse) {
        toastError("Select a course to continue.");
        return;
      }

      setActiveIndex(2);
      return;
    }

    if (!selectedStudent || !selectedCourse) {
      toastError("Student and course details are required.");
      return;
    }

    // if (!validateReviewStep()) return;

    setLoading(true);

    try {
      const draftStudent = await prepareStudentForDraft();

      if (!draftStudent) return;

      const response = await createEducationLoanDraftAPI({
        student: draftStudent,
        course: selectedCourse,
        instituteName: currentUser.userName || "Education Institute",
        courseFees: parseAmount(courseFees),
        emiOptionMonths,
        downpayment: parseAmount(downpayment),
        discountType,
        discountValue: parseAmount(discountValue),
      });

      const draft = response.data;

      dispatch(setCustomerInfo(buildEducationCustomerInfo(draftStudent)));

      if (!isStudentUser) {
        const impersonatedStudent = {
          ...currentUser,
          userID: draft.studentUserId,
          userName: draft.studentName,
          emailID: draft.studentEmail,
          mobileNumber: draft.studentMobileNumber,
          panNumber: draft.studentPan,
          userType: CLIENT_ROLE.CUSTOMER,
          roleName: "Student",
          cpID: currentUser.userID || "edu-inst-001",
          cpName: currentUser.userName || "Education Institute",
        };

        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
          JSON.stringify(currentUser),
        );

        dispatch(setImpersonateUser(true));
        dispatch(setUserData(impersonatedStudent));
      }

      toastSuccess(
        `${draft.studentName}'s application is ready for credit and banking checks.`,
      );

      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          educationFlow: true,
          educationLoanApplicationId: draft.id,
          loanApp: draft.id,
          loanType: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 className="txt-30 fw-bold mb-2">Education Loan Application</h2>
          </div>

          {activeIndex === 0 && currentUser.userType === CLIENT_ROLE.CHANNEL_PARTNER && !isStudentUser && (
            <Button
              type="button"
              className="btn btn-orange"
              icon="bi bi-plus-circle me-2"
              label="Add Student"
              onClick={() =>
                navigate(RoutePathConstant.private.educationAddStudent, {
                  state: {
                    returnTo: RoutePathConstant.private.educationStudentLoanApplication,
                  },
                })
              }
            />
          )}
        </div>

        {activeIndex === 0 && (
          <div className="row g-4">
            <div className="col-12">
              <div className="p-24 h-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                  <div>
                    <h4 className="mb-1">Select Student</h4>
                    <p className="mb-0 text-muted">
                      Choose the student profile that should move into the education
                      loan journey.
                    </p>
                  </div>
                </div>

                <DataTable
                  className="tableMain"
                  value={paginatedStudents}
                  emptyMessage="No student found"
                  dataKey="id"
                  selectionMode="single"
                  selection={selectedStudent}
                  onSelectionChange={(event) =>
                    setSelectedStudent(event.value as IEducationStudent)
                  }
                >
                  <Column selectionMode="single" />
                  <Column field="studentCode" header="Student Code" />
                  <Column field="studentName" header="Student Name" />
                  <Column field="courseName" header="Current Course" />
                  <Column
                    header="Mobile"
                    body={(rowData: IEducationStudent) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                  />
                  <Column
                    header="Credit Score"
                    body={(rowData: IEducationStudent) =>
                      rowData.creditInformation.creditScore || "-"
                    }
                  />
                  <Column
                    header="Registered"
                    body={(rowData: IEducationStudent) =>
                      formatDate(rowData.createdAt)
                    }
                  />
                </DataTable>

                <div className="mt-3">
                  <PrimePaginator
                    onPageChange={onPageChange}
                    pageNumber={filterReq.pageNumber}
                    pageSize={filterReq.pageSize}
                    totalRecords={filteredStudents.length}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <div className="row g-4">
            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <div className="mb-4">
                  <h4 className="mb-1">Select Course</h4>
                  <p className="mb-0 text-muted">
                    Match the application to the right course configuration and fee
                    structure.
                  </p>
                </div>

                <div className="form-group col-lg-6 col-12 px-0">
                  <label className="form-label">
                    Course<sup>*</sup>
                  </label>
                  <Dropdown
                    className="w-100"
                    value={selectedCourseId}
                    options={courseOptions}
                    onChange={(event) =>
                      applySelectedCourse(
                        courses.find((course) => course.id === event.value),
                      )
                    }
                    placeholder="Select course"
                  />
                </div>
              </div>
            </div>

            {selectedCourse && (
              <div className="col-12">
                <div className="borderBoxHldr p-24 h-100">
                  <div className="row g-4 align-items-start">
                    <div className="col-lg-4 col-12">
                      <h4 className="mb-3">Course Information</h4>

                      <div className="p-20" style={cardStyle}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Name</small>
                          <b>{selectedCourse.courseName}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Tenure</small>
                          <b>{selectedCourse.courseTenure}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Type</small>
                          <b>{selectedCourse.courseType}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Fees</small>
                          <b>{formatCurrencyAmount(selectedCourse.courseFees)}</b>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Job Guaranteed</small>
                          <b>{selectedCourse.isJobGuaranteed ? "Yes" : "No"}</b>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 col-12">
                      <h4 className="mb-3">Configure Loan Structure</h4>

                      <div className="row g-3">
                        <div className="form-group col-12">
                          <label className="form-label">
                            Course Tenure<sup>*</sup>
                          </label>
                          <InputText
                            className="form-control w-100"
                            value={selectedCourseTenure}
                            disabled
                            placeholder="Select course tenure"
                          />
                        </div>

                        <div className="form-group col-12">
                          <label className="form-label">
                            EMI Options<sup>*</sup>
                          </label>
                          <Dropdown
                            className="w-100"
                            value={emiOptionMonths}
                            options={emiOptions}
                            onChange={(event) => {
                              setEmiOptionMonths(event.value);
                              setReviewErrors((previous) => ({
                                ...previous,
                                emiOptionMonths: "",
                              }));
                            }}
                            placeholder="Select EMI option"
                          />
                          {reviewErrors.emiOptionMonths && (
                            <small className="error">
                              {reviewErrors.emiOptionMonths}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-md-6 col-12">
                          <label className="form-label">Discount Type</label>
                          <Dropdown
                            className="w-100"
                            value={discountType}
                            options={[
                              { label: "Percentage (%)", value: "percentage" },
                              { label: "Amount", value: "amount" },
                            ]}
                            onChange={(event) => {
                              setDiscountType(event.value);
                              setReviewErrors((previous) => ({
                                ...previous,
                                discountValue: "",
                              }));
                            }}
                          />
                        </div>

                        <div className="form-group col-md-6 col-12">
                          <label className="form-label">Discount (Optional)</label>
                          <InputText
                            className="form-control"
                            value={discountValue}
                            placeholder={
                              discountType === "percentage"
                                ? "Enter discount percentage"
                                : "Enter discount amount"
                            }
                            onChange={(event) => {
                              setDiscountValue(
                                formatNumber(parseAmount(event.target.value)),
                              );
                              setReviewErrors((previous) => ({
                                ...previous,
                                discountValue: "",
                              }));
                            }}
                          />
                          {reviewErrors.discountValue && (
                            <small className="error">{reviewErrors.discountValue}</small>
                          )}
                        </div>

                        <div className="form-group col-12">
                          <label className="form-label">Down payment (Optional)</label>
                          <InputText
                            className="form-control"
                            value={downpayment}
                            placeholder="Enter down payment"
                            onChange={(event) => {
                              setDownpayment(
                                formatNumber(parseAmount(event.target.value)),
                              );
                              setReviewErrors((previous) => ({
                                ...previous,
                                downpayment: "",
                              }));
                            }}
                          />
                          {reviewErrors.downpayment && (
                            <small className="error">{reviewErrors.downpayment}</small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 col-12">
                      <h4 className="mb-3">Loan Summary</h4>

                      <div
                        className="table-responsive"
                        style={{
                          border: "1px solid #f1d4c8",
                          borderRadius: "18px",
                          overflow: "hidden",
                          padding: "10px",
                        }}
                      >
                        <table className="table mb-0 align-middle">
                          <tbody>
                            <tr>
                              <td className="fw-semibold">Total Loan Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(parseAmount(courseFees))}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">Down payment</td>
                              <td className="text-end">
                                {formatCurrencyAmount(parseAmount(downpayment))}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">
                                Discount {discountType === "percentage" ? "(%)" : "(Amount)"}
                              </td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.discountAmount)}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">Total Payable Loan Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.loanAmount)}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">Total EMI</td>
                              <td className="text-end">
                                {emiOptionMonths || 0}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">EMI Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.emiAmount)} / EMI
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeIndex === 2 && selectedStudent && selectedCourse && (
          <div className="row g-4">
            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <h4 className="mb-3">Student Summary</h4>
                <p className="mb-2">
                  <b>{selectedStudent.studentName}</b>
                </p>
                <p className="mb-2">{selectedStudent.email}</p>
                <p className="mb-2">
                  {formatMobileNumber(selectedStudent.mobileNumber)}
                </p>
                <p className="mb-3">
                  Credit Score: {selectedStudent.creditInformation.creditScore || "-"}
                </p>
                <div className="p-20" style={cardStyle}>
                  <small className="text-muted d-block mb-2">Selected course</small>
                  <b>{selectedStudent.courseName}</b>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <h4 className="mb-3">Loan Structure</h4>
                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>Course</span>
                  <b>{selectedCourse.courseName}</b>
                </div>

                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>Tenure</span>
                  <b>{selectedCourse.courseTenure}</b>
                </div>

                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>Course Fees</span>
                  <b>INR {formatNumber(parseAmount(courseFees))}</b>
                </div>

                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>Discount</span>
                  <b>INR {formatNumber(summary.discountAmount)}</b>
                </div>

                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>Down payment</span>
                  <b>INR {formatNumber(parseAmount(downpayment))}</b>
                </div>

                <div className="mb-2 d-flex justify-content-between gap-3">
                  <span>EMI Plan</span>
                  <b>{emiOptionMonths || "-"} Months</b>
                </div>

                <div className="mt-3 p-20" style={cardStyle}>
                  <small className="text-muted d-block">Net Loan Amount</small>
                  <h4 className="mb-1 mt-1">{formatCurrencyAmount(summary.loanAmount)}</h4>
                  <small className="text-muted">
                    EMI: {formatCurrencyAmount(summary.emiAmount)} for{" "}
                    {summary.numberOfEmis} instalments
                  </small>
                </div>

              </div>
            </div>

            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <h4 className="mb-3">Applicants and Consent</h4>

                <div className="education-review-applicant-list mb-4">
                  {(selectedStudent.applicants || []).map((applicant, index) => (
                    <div
                      key={applicant.id || `${applicant.name}-${index}`}
                      className="education-review-applicant-card"
                    >
                      <div className="education-review-applicant-card__avatar">
                        {applicant.photo ? (
                          <img src={applicant.photo} alt={applicant.name} />
                        ) : (
                          <span>{getInitials(applicant.name || `Applicant ${index + 1}`)}</span>
                        )}
                      </div>
                      <div>
                        <small className="text-muted d-block">Applicant {index + 1}</small>
                        <b>{applicant.name}</b>
                        <p className="mb-0 mt-1 text-muted">
                          {applicant.pan} | {formatMobileNumber(applicant.mobileNumber)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {consentChecklist.map((consent, index) => (
                  <div
                    className="d-flex align-items-start gap-3 mb-3 form-check"
                    key={consent}
                  >
                    <Checkbox
                      inputId={`consent-${index}`}
                      checked={consentState[index]}
                      onChange={(event) => {
                        const nextState = [...consentState];
                        nextState[index] = !!event.checked;
                        setConsentState(nextState);
                        setConsentError("");
                      }}
                    />
                    <label htmlFor={`consent-${index}`} className="form-check-label mb-0">
                      {consent}
                    </label>
                  </div>
                ))}

                {consentError && <small className="error">{consentError}</small>}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-5 flex-wrap gap-3">
          <Button
            className="btn btn-black-line"
            label={activeIndex === 0 ? "Back to Dashboard" : "Back"}
            onClick={() => {
              if (activeIndex === 0) {
                navigate(RoutePathConstant.private.channelPartnerDashboard);
                return;
              }

              setActiveIndex((previous) => Math.max(previous - 1, 0));
            }}
          />

          <Button
            className={`btn ${(
              (activeIndex === 0 && !selectedStudent) ||
              (activeIndex === 1 && !selectedCourse)
            )
              ? "btn-orange-disabled"
              : "btn-orange"
              }`}
            label={
              activeIndex < 2 ? "Continue" : "Run Credit and Banking Checks"
            }
            disabled={
              (activeIndex === 0 && !selectedStudent) ||
              (activeIndex === 1 && !selectedCourse)
            }
            onClick={handlePrimaryAction}
          />
        </div>
      </div>

      <Dialog
        header="Add Student"
        visible={showStudentDialog}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "860px" }}
        onHide={() => {
          setShowStudentDialog(false);
          resetStudentForm();
        }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              label="Cancel"
              onClick={() => {
                setShowStudentDialog(false);
                resetStudentForm();
              }}
            />
            <Button
              className="btn btn-orange w-100 text-center"
              label="Create Student"
              onClick={handleSaveStudent}
            />
          </div>
        }
      >
        <div className="education-student-form-shell">
          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Student Details</h4>
                <p>Capture the student profile without PAN and keep the applicant records below.</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-3 col-md-4 col-sm-12">
                <div className="education-student-photo-card">
                  <div className="education-student-photo-card__preview">
                    {studentForm.studentPhoto ? (
                      <img src={studentForm.studentPhoto} alt={studentForm.studentName || "Student"} />
                    ) : (
                      <span>{getInitials(studentForm.studentName)}</span>
                    )}
                  </div>
                  <div className="education-student-photo-card__actions">
                    <label htmlFor="loanStudentPhotoUpload" className="btn btn-orange-line mb-0">
                      Upload
                    </label>
                    <label
                      htmlFor="loanStudentPhotoCapture"
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
                    id="loanStudentPhotoUpload"
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
                      onChange={(event) => handleFieldChange("studentName", event.target.value)}
                    />
                    {formErrors.studentName && <small className="error">{formErrors.studentName}</small>}
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
                    {formErrors.courseId && <small className="error">{formErrors.courseId}</small>}
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
                    {formErrors.mobileNumber && <small className="error">{formErrors.mobileNumber}</small>}
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
                    {formErrors.email && <small className="error">{formErrors.email}</small>}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="loanStudentDob">
                      Date of Birth<sup>*</sup>
                    </label>
                    <Calendar
                      id="loanStudentDob"
                      value={toInputDate(studentForm.studentDateOfBirth)}
                      onChange={(event) =>
                        handleFieldChange(
                          "studentDateOfBirth",
                          toIsoDate((event.value as Date | null) || null),
                        )
                      }
                      className="w-100"
                      showIcon
                      maxDate={new Date()}
                      placeholder="Select date of birth"
                      dateFormat="dd M yy"
                    />
                    {formErrors.studentDateOfBirth && (
                      <small className="error">{formErrors.studentDateOfBirth}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="loanStudentGender">
                      Gender<sup>*</sup>
                    </label>
                    <Dropdown
                      id="loanStudentGender"
                      className="w-100"
                      value={studentForm.studentGender}
                      options={genderOptions}
                      onChange={(event) => handleFieldChange("studentGender", event.value)}
                      placeholder="Select gender"
                    />
                    {formErrors.studentGender && (
                      <small className="error">{formErrors.studentGender}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label d-block mb-2">Is Student Minor?</label>
                    <div className="d-flex align-items-center gap-2">
                      <InputSwitch
                        checked={studentForm.isMinor}
                        onChange={(event) => handleFieldChange("isMinor", !!event.value)}
                      />
                      <span>{studentForm.isMinor ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  {studentForm.isMinor && (
                    <div className="form-group col-sm-12 col-lg-6">
                      <label className="form-label" htmlFor="parentPan">
                        Parent PAN<sup>*</sup>
                      </label>
                      <InputText
                        id="parentPan"
                        className="form-control"
                        placeholder="Enter parent PAN"
                        value={studentForm.parentPan}
                        onChange={(event) =>
                          handleFieldChange("parentPan", event.target.value.toUpperCase())
                        }
                      />
                      {formErrors.parentPan && <small className="error">{formErrors.parentPan}</small>}
                    </div>
                  )}

                  <div className="form-group col-12">
                    <label className="form-label d-block mb-2">Status</label>
                    <div className="d-flex align-items-center gap-2">
                      <InputSwitch
                        checked={studentForm.isActive}
                        onChange={(event) => handleFieldChange("isActive", !!event.value)}
                      />
                      <span>{studentForm.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Applicants</h4>
                <p>Add multiple applicants and use copy as above when the details are similar.</p>
              </div>
              <Button className="btn btn-orange" onClick={addApplicant}>
                <i className="bi bi-plus-circle me-2" />
                Add Applicant
              </Button>
            </div>

            <div className="education-student-applicant-stack">
              {studentForm.applicants.map((applicant, index) => (
                <div key={applicant.id} className="education-student-applicant-card">
                  <div className="education-student-applicant-card__head">
                    <div>
                      <h5>Applicant {index + 1}</h5>
                      <p>Copy student details, then edit any applicant-specific changes.</p>
                    </div>
                    <div className="education-student-applicant-card__actions">
                      <Button
                        className="btn btn-orange-line"
                        onClick={() => copyApplicantFromStudent(index)}
                      >
                        Copy as above
                      </Button>
                      {studentForm.applicants.length > 1 && (
                        <Button
                          className="btn btn-black-line"
                          onClick={() => removeApplicant(index)}
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
                            <img src={applicant.photo} alt={applicant.name || "Applicant"} />
                          ) : (
                            <span>{getInitials(applicant.name || `Applicant ${index + 1}`)}</span>
                          )}
                        </div>
                        <div className="education-student-photo-card__actions">
                          <label
                            htmlFor={`loanApplicantPhotoUpload-${index}`}
                            className="btn btn-orange-line mb-0"
                          >
                            Upload
                          </label>
                          <label
                            htmlFor={`loanApplicantPhotoCapture-${index}`}
                            className="btn btn-orange mb-0"
                            onClick={(event) => {
                              event.preventDefault();
                              setApplicantCameraIndex(index);
                            }}
                          >
                            Capture
                          </label>
                        </div>
                        <input
                          id={`loanApplicantPhotoUpload-${index}`}
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
                          <label className="form-label">Applicant Name<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter applicant name"
                            value={applicant.name}
                            onChange={(event) =>
                              handleApplicantChange(index, "name", event.target.value)
                            }
                          />
                          {formErrors[`applicants.${index}.name`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.name`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Applicant PAN<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter applicant PAN"
                            value={applicant.pan}
                            onChange={(event) =>
                              handleApplicantChange(index, "pan", event.target.value.toUpperCase())
                            }
                          />
                          {formErrors[`applicants.${index}.pan`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.pan`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Date of Birth<sup>*</sup></label>
                          <Calendar
                            value={toInputDate(applicant.dateOfBirth)}
                            onChange={(event) =>
                              handleApplicantChange(
                                index,
                                "dateOfBirth",
                                toIsoDate((event.value as Date | null) || null),
                              )
                            }
                            className="w-100"
                            showIcon
                            maxDate={new Date()}
                            placeholder="Select applicant date of birth"
                            dateFormat="dd M yy"
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
                            placeholder="Select applicant gender"
                          />
                          {formErrors[`applicants.${index}.gender`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.gender`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Mobile Number<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter 10-digit mobile number"
                            value={applicant.mobileNumber}
                            maxLength={10}
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
                            placeholder="Enter applicant email address"
                            value={applicant.email}
                            onChange={(event) =>
                              handleApplicantChange(index, "email", event.target.value)
                            }
                          />
                          {formErrors[`applicants.${index}.email`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.email`]}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Dialog>

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
        visible={applicantCameraIndex !== null}
        title="Capture Applicant Photo"
        onHide={() => setApplicantCameraIndex(null)}
        onCapture={(dataUrl) => {
          if (applicantCameraIndex !== null) {
            handleApplicantChange(applicantCameraIndex, "photo", dataUrl);
          }
          setApplicantCameraIndex(null);
        }}
      />
    </>
  );
};

export default EducationLoanApplication;

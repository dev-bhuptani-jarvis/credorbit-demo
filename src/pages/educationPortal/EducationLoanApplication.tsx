import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import { RootState } from "../../store";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { setUserData } from "../../store/reducer/userSlice";
import {
  EducationDiscountType,
  IEducationCourse,
  IEducationStudent,
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
  updateEducationStudentAPI,
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
import { defaultStudentForm } from "./ManageStudents";

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
    consentChecklist.map(() => false),
  );

  const [consentError, setConsentError] = useState<string>("");

  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);

  const [studentForm, setStudentForm] =
    useState<IEducationStudentFormData>(defaultStudentForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 8,
    searchText: "",
  });

  const [coApplicantForm, setCoApplicantForm] = useState({
    coApplicantName: "",
    coApplicantMobileNumber: "",
    coApplicantRelation: "",
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
    setStudentForm(defaultStudentForm);
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
    value: string | boolean,
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

  const validateStudentForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!studentForm.studentName.trim()) {
      nextErrors.studentName = "Student name is required.";
    }

    if (!studentForm.courseId) {
      nextErrors.courseId = "Course is required.";
    }

    if (!PAN_NUMBER_PATTERN.test(studentForm.studentPan.trim().toUpperCase())) {
      nextErrors.studentPan = "Enter a valid student PAN number.";
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

    if (
      studentForm.coApplicantMobileNumber.trim() &&
      !INDIAN_MOBILE_NUMBER_PATTERN.test(
        studentForm.coApplicantMobileNumber.trim(),
      )
    ) {
      nextErrors.coApplicantMobileNumber =
        "Enter a valid co-applicant mobile number.";
    }

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
    
    const isCoApplicantStarted = Object.values(coApplicantForm).some((value) =>
      value.trim(),
    );

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

    if (isCoApplicantStarted) {
      if (!coApplicantForm.coApplicantName.trim()) {
        nextErrors.coApplicantName = "Co-applicant name is required.";
      }

      if (!coApplicantForm.coApplicantRelation.trim()) {
        nextErrors.coApplicantRelation = "Co-applicant relation is required.";
      }

      if (
        !INDIAN_MOBILE_NUMBER_PATTERN.test(
          coApplicantForm.coApplicantMobileNumber.trim(),
        )
      ) {
        nextErrors.coApplicantMobileNumber =
          "Enter a valid 10-digit co-applicant mobile number.";
      }
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

    const hasExistingCoApplicant = !!selectedStudent.coApplicantName.trim();
    const shouldUpdateCoApplicant =
      !hasExistingCoApplicant &&
      !!coApplicantForm.coApplicantName.trim() &&
      !!coApplicantForm.coApplicantRelation.trim() &&
      !!coApplicantForm.coApplicantMobileNumber.trim();

    if (!shouldUpdateCoApplicant) {
      return selectedStudent;
    }

    const updatedStudent = await updateEducationStudentAPI(selectedStudent.id, {
      studentName: selectedStudent.studentName,
      courseId: selectedStudent.courseId,
      studentPan: selectedStudent.studentPan,
      isMinor: selectedStudent.isMinor,
      parentPan: selectedStudent.parentPan,
      mobileNumber: selectedStudent.mobileNumber,
      email: selectedStudent.email,
      coApplicantName: coApplicantForm.coApplicantName.trim(),
      coApplicantMobileNumber: coApplicantForm.coApplicantMobileNumber.trim(),
      coApplicantRelation: coApplicantForm.coApplicantRelation.trim(),
      isActive: selectedStudent.isActive,
    });

    if (!updatedStudent) {
      toastError("Unable to attach the co-applicant details to the student.");
      return null;
    }

    setSelectedStudent(updatedStudent);
    return updatedStudent;
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

          {currentUser.userType === CLIENT_ROLE.CHANNEL_PARTNER && !isStudentUser && (
            <Button
              type="button"
              className="btn btn-orange"
              icon="bi bi-plus-circle me-2"
              label="Add Student"
              onClick={() => {
                resetStudentForm();
                setShowStudentDialog(true);
              }}
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
                <h4 className="mb-3">Co-applicant and Consent</h4>

                {!selectedStudent.coApplicantName.trim() && (
                  <>
                    <div className="form-group mb-3">
                      <label className="form-label">Co-applicant Name</label>
                      <InputText
                        className="form-control"
                        value={coApplicantForm.coApplicantName}
                        placeholder="Optional fallback co-applicant"
                        onChange={(event) => {
                          setCoApplicantForm((previous) => ({
                            ...previous,
                            coApplicantName: event.target.value,
                          }));
                          setReviewErrors((previous) => ({
                            ...previous,
                            coApplicantName: "",
                          }));
                        }}
                      />
                      {reviewErrors.coApplicantName && (
                        <small className="error">{reviewErrors.coApplicantName}</small>
                      )}
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label">Co-applicant Mobile</label>
                      <InputText
                        className="form-control"
                        value={coApplicantForm.coApplicantMobileNumber}
                        maxLength={10}
                        onChange={(event) => {
                          setCoApplicantForm((previous) => ({
                            ...previous,
                            coApplicantMobileNumber: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }));
                          setReviewErrors((previous) => ({
                            ...previous,
                            coApplicantMobileNumber: "",
                          }));
                        }}
                      />
                      {reviewErrors.coApplicantMobileNumber && (
                        <small className="error">
                          {reviewErrors.coApplicantMobileNumber}
                        </small>
                      )}
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label">Co-applicant Relation</label>
                      <InputText
                        className="form-control"
                        value={coApplicantForm.coApplicantRelation}
                        onChange={(event) => {
                          setCoApplicantForm((previous) => ({
                            ...previous,
                            coApplicantRelation: event.target.value,
                          }));
                          setReviewErrors((previous) => ({
                            ...previous,
                            coApplicantRelation: "",
                          }));
                        }}
                      />
                      {reviewErrors.coApplicantRelation && (
                        <small className="error">
                          {reviewErrors.coApplicantRelation}
                        </small>
                      )}
                    </div>
                  </>
                )}

                {selectedStudent.coApplicantName.trim() && (
                  <div className="p-20 mb-4" style={cardStyle}>
                    <small className="text-muted d-block mb-2">Existing co-applicant</small>
                    <b>{selectedStudent.coApplicantName}</b>
                    <p className="mb-0 mt-1 text-muted">
                      {selectedStudent.coApplicantRelation} |{" "}
                      {formatMobileNumber(
                        selectedStudent.coApplicantMobileNumber || "",
                      )}
                    </p>
                  </div>
                )}

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
            <label className="form-label" htmlFor="studentPan">
              Student PAN<sup>*</sup>
            </label>
            <InputText
              id="studentPan"
              className="form-control"
              placeholder="Enter student PAN"
              value={studentForm.studentPan}
              onChange={(event) =>
                handleFieldChange("studentPan", event.target.value.toUpperCase())
              }
            />
            {formErrors.studentPan && (
              <small className="error">{formErrors.studentPan}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label d-block mb-2">Is Student Minor?</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={studentForm.isMinor}
                onChange={(event) =>
                  handleFieldChange("isMinor", !!event.value)
                }
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
              {formErrors.parentPan && (
                <small className="error">{formErrors.parentPan}</small>
              )}
            </div>
          )}

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

          <div className="col-12">
            <h6 className="mb-2">Co-applicant (Optional)</h6>
          </div>

          <div className="form-group col-sm-12 col-lg-4">
            <label className="form-label" htmlFor="coApplicantName">
              Co-applicant Name
            </label>
            <InputText
              id="coApplicantName"
              className="form-control"
              placeholder="Enter parent or guardian name"
              value={studentForm.coApplicantName}
              onChange={(event) =>
                handleFieldChange("coApplicantName", event.target.value)
              }
            />
          </div>

          <div className="form-group col-sm-12 col-lg-4">
            <label className="form-label" htmlFor="coApplicantMobile">
              Co-applicant Mobile
            </label>
            <InputText
              id="coApplicantMobile"
              className="form-control"
              placeholder="Enter co-applicant mobile"
              value={studentForm.coApplicantMobileNumber}
              maxLength={10}
              onChange={(event) =>
                handleFieldChange(
                  "coApplicantMobileNumber",
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
            {formErrors.coApplicantMobileNumber && (
              <small className="error">
                {formErrors.coApplicantMobileNumber}
              </small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-4">
            <label className="form-label" htmlFor="coApplicantRelation">
              Co-applicant Relation
            </label>
            <InputText
              id="coApplicantRelation"
              className="form-control"
              placeholder="Enter relation"
              value={studentForm.coApplicantRelation}
              onChange={(event) =>
                handleFieldChange("coApplicantRelation", event.target.value)
              }
            />
          </div>

          <div className="form-group col-12">
            <label className="form-label d-block mb-2">Status</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={studentForm.isActive}
                onChange={(event) =>
                  handleFieldChange("isActive", !!event.value)
                }
              />
              <span>{studentForm.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EducationLoanApplication;

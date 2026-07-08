import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import {
  IEducationStudent,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { debounceTimeInMilliseconds, formatMobileNumber } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import { getEducationCourses } from "../../utils/demo/demoEducationCourses";
import {
  createEducationStudent,
  deleteEducationStudent,
  getEducationStudentById,
  getEducationStudents,
  updateEducationStudent,
} from "../../utils/demo/demoEducationStudents";
import { formatDate, toastSuccess } from "../../utils/functions/shared";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const defaultStudentForm: IEducationStudentFormData = {
  studentName: "",
  courseId: "",
  studentPan: "",
  isMinor: false,
  parentPan: "",
  mobileNumber: "",
  email: "",
  coApplicantName: "",
  coApplicantMobileNumber: "",
  coApplicantRelation: "",
  isActive: true,
};

const ManageStudents = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<IEducationStudent[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedRepaymentStatus, setSelectedRepaymentStatus] = useState<string>("");
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<IEducationStudent | null>(null);
  const [studentForm, setStudentForm] = useState<IEducationStudentFormData>(defaultStudentForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<IEducationStudent | null>(null);

  const isEditMode = !!selectedStudent;

  const courseOptions = useMemo(
    () =>
      getEducationCourses().map((course) => ({
        label: course.courseName,
        value: course.id,
      })),
    [],
  );

  const repaymentStatusOptions = [
    { label: "On-Time", value: "On-Time" },
    { label: "Delayed", value: "Delayed" },
    { label: "Pending", value: "Pending" },
  ];

  const fetchStudents = (): void => {
    setLoading(true);
    setStudents(getEducationStudents());
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.studentName.toLowerCase().includes(searchValue) ||
        student.studentCode.toLowerCase().includes(searchValue) ||
        student.courseName.toLowerCase().includes(searchValue);

      const matchesCourse = !selectedCourseId || student.courseId === selectedCourseId;
      const matchesRepaymentStatus =
        !selectedRepaymentStatus ||
        student.loanDetails.repaymentStatus === selectedRepaymentStatus;

      return matchesSearch && matchesCourse && matchesRepaymentStatus;
    });
  }, [filterReq.searchText, selectedCourseId, selectedRepaymentStatus, students]);

  const paginatedStudents = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredStudents.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredStudents]);

  const resetForm = (): void => {
    setStudentForm(defaultStudentForm);
    setFormErrors({});
    setSelectedStudent(null);
  };

  const handleFieldChange = (
    fieldName: keyof IEducationStudentFormData,
    value: string | boolean,
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

  const validateForm = (): boolean => {
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
      !INDIAN_MOBILE_NUMBER_PATTERN.test(studentForm.coApplicantMobileNumber.trim())
    ) {
      nextErrors.coApplicantMobileNumber = "Enter a valid co-applicant mobile number.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAddDialog = (): void => {
    resetForm();
    setShowStudentDialog(true);
  };

  const openEditDialog = (student: IEducationStudent): void => {
    const selectedDetail = getEducationStudentById(student.id) || student;

    setSelectedStudent(selectedDetail);
    setStudentForm({
      studentName: selectedDetail.studentName,
      courseId: selectedDetail.courseId,
      studentPan: selectedDetail.studentPan,
      isMinor: selectedDetail.isMinor,
      parentPan: selectedDetail.parentPan,
      mobileNumber: selectedDetail.mobileNumber,
      email: selectedDetail.email,
      coApplicantName: selectedDetail.coApplicantName,
      coApplicantMobileNumber: selectedDetail.coApplicantMobileNumber,
      coApplicantRelation: selectedDetail.coApplicantRelation,
      isActive: selectedDetail.isActive,
    });
    setFormErrors({});
    setShowStudentDialog(true);
  };

  const handleSaveStudent = (): void => {
    if (!validateForm()) return;

    setLoading(true);

    if (selectedStudent) {
      const updatedStudent = updateEducationStudent(selectedStudent.id, studentForm);
      if (updatedStudent) {
        toastSuccess(`${updatedStudent.studentName} updated successfully.`);
      }
    } else {
      const createdStudent = createEducationStudent(studentForm);
      toastSuccess(`${createdStudent.studentName} added successfully.`);
    }

    setShowStudentDialog(false);
    resetForm();
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
    fetchStudents();
    setLoading(false);
  };

  const handleDeleteStudent = (): void => {
    if (!deleteTarget) return;

    deleteEducationStudent(deleteTarget.id);
    toastSuccess(`${deleteTarget.studentName} deleted successfully.`);
    setDeleteTarget(null);
    fetchStudents();
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
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
    fetchStudents();
  }, []);

  useEffect(() => {
    setTotalRecords(filteredStudents.length);
  }, [filteredStudents]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Manage Students" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by student, code, or course"
                />

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={courseOptions}
                    showClear={selectedCourseId !== ""}
                    placeholder="Filter by Course"
                  />
                </div>

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedRepaymentStatus}
                    onChange={(e) => {
                      setSelectedRepaymentStatus(e.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={repaymentStatusOptions}
                    showClear={selectedRepaymentStatus !== ""}
                    placeholder="Filter by Repayment"
                  />
                </div>

                <div className="form-group">
                  <Button onClick={openAddDialog} className="btn btn-orange">
                    <i className="bi bi-plus-circle me-2" />
                    Add Student
                  </Button>
                </div>
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={paginatedStudents}
                  emptyMessage="No students found."
                >
                  <Column field="studentCode" header="Student Code" />
                  <Column field="studentName" header="Student Name" />
                  <Column field="courseName" header="Course" />
                  <Column
                    body={(rowData: IEducationStudent) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />
                  <Column field="email" header="Email Address" />
                  <Column
                    body={(rowData: IEducationStudent) => rowData.loanDetails.repaymentStatus}
                    header="Repayment Status"
                  />
                  
                  <Column
                    header="Action"
                    body={(rowData: IEducationStudent) => (
                      <div className="d-flex gap-2">
                        <Button
                          className="trash-icon p-0"
                          onClick={() =>
                            navigate(
                              RoutePathConstant.private.educationStudentDetail.replace(
                                ":id",
                                rowData.id,
                              ),
                            )
                          }
                        >
                          <img src="/assets/images/eye.svg" alt="view-student" />
                        </Button>
                        <Button
                          className="trash-icon p-0"
                          onClick={() => openEditDialog(rowData)}
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                        <Button
                          className="trash-icon p-0"
                          onClick={() => setDeleteTarget(rowData)}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </div>
                    )}
                  />
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(paginatedStudents) && (
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
        header={isEditMode ? "Update Student" : "Add Student"}
        visible={showStudentDialog}
        className="modalWrapper"
        onHide={() => {
          setShowStudentDialog(false);
          resetForm();
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "860px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => {
                setShowStudentDialog(false);
                resetForm();
              }}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleSaveStudent}
              label={isEditMode ? "Update Student" : "Save Student"}
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
              onChange={(e) => handleFieldChange("studentName", e.target.value)}
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
              onChange={(e) => handleFieldChange("courseId", e.value)}
              placeholder="Select course"
            />
            {formErrors.courseId && <small className="error">{formErrors.courseId}</small>}
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
              onChange={(e) => handleFieldChange("studentPan", e.target.value.toUpperCase())}
            />
            {formErrors.studentPan && <small className="error">{formErrors.studentPan}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label d-block mb-2">Is Student Minor?</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={studentForm.isMinor}
                onChange={(e) => handleFieldChange("isMinor", !!e.value)}
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
                onChange={(e) => handleFieldChange("parentPan", e.target.value.toUpperCase())}
              />
              {formErrors.parentPan && <small className="error">{formErrors.parentPan}</small>}
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
              onChange={(e) =>
                handleFieldChange(
                  "mobileNumber",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
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
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
            {formErrors.email && <small className="error">{formErrors.email}</small>}
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
              onChange={(e) => handleFieldChange("coApplicantName", e.target.value)}
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
              onChange={(e) =>
                handleFieldChange(
                  "coApplicantMobileNumber",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
            {formErrors.coApplicantMobileNumber && (
              <small className="error">{formErrors.coApplicantMobileNumber}</small>
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
              onChange={(e) => handleFieldChange("coApplicantRelation", e.target.value)}
            />
          </div>

          <div className="form-group col-12">
            <label className="form-label d-block mb-2">Status</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={studentForm.isActive}
                onChange={(e) => handleFieldChange("isActive", !!e.value)}
              />
              <span>{studentForm.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Delete Student"
        visible={!!deleteTarget}
        className="modalWrapper"
        onHide={() => setDeleteTarget(null)}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "520px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => setDeleteTarget(null)}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleDeleteStudent}
              label="Delete Student"
            />
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.studentName}</strong>?
        </p>
      </Dialog>
    </>
  );
};

export default ManageStudents;

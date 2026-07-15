import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import {
  IEducationCourse,
  IEducationCourseFormData,
} from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { debounceTimeInMilliseconds, formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  createEducationCourse,
  deleteEducationCourse,
  getEducationCourses,
  updateEducationCourse,
} from "../../utils/demo/demoEducationCourses";
import { toastSuccess } from "../../utils/functions/shared";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const courseTypeOptions = [
  { label: "Online", value: "Online" },
  { label: "Offline", value: "Offline" },
];

const jobGuaranteedOptions = [
  { label: "Job Guaranteed", value: "yes" },
  { label: "Not Job Guaranteed", value: "no" },
];

const defaultCourseForm: IEducationCourseFormData = {
  courseName: "",
  courseTenure: "",
  courseFees: "",
  courseType: "",
  isJobGuaranteed: false,
  description: "",
  isActive: true,
};

const ManageCourses = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const [courses, setCourses] = useState<IEducationCourse[]>([]);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedCourseType, setSelectedCourseType] = useState<string>("");

  const [selectedJobGuaranteed, setSelectedJobGuaranteed] = useState<string>("");

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [showCourseDialog, setShowCourseDialog] = useState<boolean>(false);

  const [selectedCourse, setSelectedCourse] = useState<IEducationCourse | null>(null);

  const [courseForm, setCourseForm] = useState<IEducationCourseFormData>(defaultCourseForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<IEducationCourse | null>(null);

  const isEditMode = !!selectedCourse;

  const fetchCourses = (): void => {
    setLoading(true);
    setCourses(getEducationCourses());
    setLoading(false);
  };

  const filteredCourses = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return courses.filter((course) => {
      const matchesSearch =
        !searchValue ||
        course.courseName.toLowerCase().includes(searchValue) ||
        course.courseTenure.toLowerCase().includes(searchValue) ||
        course.courseType.toLowerCase().includes(searchValue);

      const matchesType = !selectedCourseType || course.courseType === selectedCourseType;
      const matchesJobGuaranteed =
        !selectedJobGuaranteed ||
        (selectedJobGuaranteed === "yes" ? course.isJobGuaranteed : !course.isJobGuaranteed);

      return matchesSearch && matchesType && matchesJobGuaranteed;
    });
  }, [courses, filterReq.searchText, selectedCourseType, selectedJobGuaranteed]);

  const paginatedCourses = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredCourses.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredCourses]);

  const resetForm = (): void => {
    setCourseForm(defaultCourseForm);
    setFormErrors({});
    setSelectedCourse(null);
  };

  const handleFieldChange = (
    fieldName: keyof IEducationCourseFormData,
    value: string | boolean,
  ): void => {
    setCourseForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!courseForm.courseName.trim()) {
      nextErrors.courseName = "Course name is required.";
    }

    if (!courseForm.courseTenure.trim()) {
      nextErrors.courseTenure = "Course tenure is required.";
    }

    if (!courseForm.courseFees.trim() || Number(courseForm.courseFees) <= 0) {
      nextErrors.courseFees = "Enter a valid course fee.";
    }

    if (!courseForm.courseType) {
      nextErrors.courseType = "Course type is required.";
    }

    if (!courseForm.description.trim()) {
      nextErrors.description = "Course description is required.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAddDialog = (): void => {
    resetForm();
    setShowCourseDialog(true);
  };

  const openEditDialog = (course: IEducationCourse): void => {
    setSelectedCourse(course);
    setCourseForm({
      courseName: course.courseName,
      courseTenure: course.courseTenure,
      courseFees: String(course.courseFees),
      courseType: course.courseType,
      isJobGuaranteed: course.isJobGuaranteed,
      description: course.description,
      isActive: course.isActive,
    });
    setFormErrors({});
    setShowCourseDialog(true);
  };

  const handleSaveCourse = (): void => {
    if (!validateForm()) return;

    setLoading(true);

    if (selectedCourse) {
      const updatedCourse = updateEducationCourse(selectedCourse.id, courseForm);
      if (updatedCourse) {
        toastSuccess(`${updatedCourse.courseName} updated successfully.`);
      }
    } else {
      const createdCourse = createEducationCourse(courseForm);
      toastSuccess(`${createdCourse.courseName} added successfully.`);
    }

    setShowCourseDialog(false);
    resetForm();
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
    fetchCourses();
    setLoading(false);
  };

  const handleDeleteCourse = (): void => {
    if (!deleteTarget) return;

    deleteEducationCourse(deleteTarget.id);
    toastSuccess(`${deleteTarget.courseName} deleted successfully.`);
    setDeleteTarget(null);
    fetchCourses();
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
    fetchCourses();
  }, []);

  useEffect(() => {
    setTotalRecords(filteredCourses.length);
  }, [filteredCourses]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Manage Course" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by course name or type"
                />

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedCourseType}
                    onChange={(e) => {
                      setSelectedCourseType(e.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={courseTypeOptions}
                    showClear={selectedCourseType !== ""}
                    placeholder="Filter by Course Type"
                  />
                </div>

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedJobGuaranteed}
                    onChange={(e) => {
                      setSelectedJobGuaranteed(e.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={jobGuaranteedOptions}
                    showClear={selectedJobGuaranteed !== ""}
                    placeholder="Filter by Guarantee"
                  />
                </div>

                <div className="form-group">
                  <Button onClick={openAddDialog} className="btn btn-orange">
                    <i className="bi bi-plus-circle me-2" />
                    Add Course
                  </Button>
                </div>
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={paginatedCourses}
                  emptyMessage="No courses found."
                >
                  <Column field="id" header="Course Code" />

                  <Column field="courseName" header="Course Name" />

                  <Column field="courseTenure" header="Course Tenure" />

                  <Column
                    body={(rowData: IEducationCourse) =>
                      formatCurrencyAmount(rowData.courseFees)
                    }
                    header="Course Fees"
                  />

                  <Column field="courseType" header="Course Type" />

                  <Column
                    body={(rowData: IEducationCourse) =>
                      rowData.isJobGuaranteed ? "Yes" : "No"
                    }
                    header="Job Guaranteed"
                  />

                  <Column
                    header="Action"
                    body={(rowData: IEducationCourse) => (
                      <div className="d-flex gap-2">
                        <Button
                          className="trash-icon p-0"
                          onClick={() =>
                            navigate(
                              RoutePathConstant.private.educationCourseDetail.replace(
                                ":id",
                                rowData.id,
                              ),
                            )
                          }
                        >
                          <img src="/assets/images/eye.svg" alt="view-course" />
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

              {!IsNullOrEmptyArray(paginatedCourses) && (
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
        header={isEditMode ? "Update Course" : "Add Course"}
        visible={showCourseDialog}
        className="modalWrapper"
        onHide={() => {
          setShowCourseDialog(false);
          resetForm();
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "760px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => {
                setShowCourseDialog(false);
                resetForm();
              }}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleSaveCourse}
              label={isEditMode ? "Update Course" : "Save Course"}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseName">
              Course Name<sup>*</sup>
            </label>
            <InputText
              id="courseName"
              className="form-control"
              placeholder="Enter course name"
              value={courseForm.courseName}
              onChange={(e) => handleFieldChange("courseName", e.target.value)}
            />
            {formErrors.courseName && <small className="error">{formErrors.courseName}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseTenure">
              Course Tenure<sup>*</sup>
            </label>
            <InputText
              id="courseTenure"
              className="form-control"
              placeholder="Enter course tenure"
              value={courseForm.courseTenure}
              onChange={(e) => handleFieldChange("courseTenure", e.target.value)}
            />
            {formErrors.courseTenure && <small className="error">{formErrors.courseTenure}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseFees">
              Course Fees<sup>*</sup>
            </label>
            <InputText
              id="courseFees"
              className="form-control"
              placeholder="Enter course fees"
              value={courseForm.courseFees}
              onChange={(e) =>
                handleFieldChange("courseFees", e.target.value.replace(/\D/g, ""))
              }
            />
            {formErrors.courseFees && <small className="error">{formErrors.courseFees}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseType">
              Course Type<sup>*</sup>
            </label>
            <Dropdown
              id="courseType"
              className="w-100"
              value={courseForm.courseType}
              options={courseTypeOptions}
              onChange={(e) => handleFieldChange("courseType", e.value)}
              placeholder="Select course type"
            />
            {formErrors.courseType && <small className="error">{formErrors.courseType}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label d-block mb-2">Job Guaranteed?</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={courseForm.isJobGuaranteed}
                onChange={(e) => handleFieldChange("isJobGuaranteed", !!e.value)}
              />
              <span>{courseForm.isJobGuaranteed ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label d-block mb-2">Status</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                checked={courseForm.isActive}
                onChange={(e) => handleFieldChange("isActive", !!e.value)}
              />
              <span>{courseForm.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="courseDescription">
              Description<sup>*</sup>
            </label>
            <InputTextarea
              id="courseDescription"
              className="form-control"
              rows={4}
              autoResize
              placeholder="Enter course description"
              value={courseForm.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
            {formErrors.description && <small className="error">{formErrors.description}</small>}
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Delete Course"
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
              onClick={handleDeleteCourse}
              label="Delete Course"
            />
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.courseName}</strong>?
        </p>
      </Dialog>
    </>
  );
};

export default ManageCourses;

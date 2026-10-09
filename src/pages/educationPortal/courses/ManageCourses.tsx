import React, { useEffect, useState } from 'react'
import PrimePaginator from '../../../components/PrimePaginator';
import Loader from '../../../components/Loader';
import { PaginateReqEntity } from '../../../interface/pagination';
import TableTitle from '../../../components/TableTitle';
import SearchButton from '../../../components/SearchButton';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { courseTypeOptions, debounceTimeInMilliseconds, formatCurrencyAmount, jobGuaranteedOptions } from '../../../utils/constants/constant';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import { IsNullOrEmptyArray } from '../../../utils/functions/nullCheck';
import { PaginatorPageChangeEvent } from 'primereact/paginator';
import useDebouncedEffect from '../../../hooks/useDebounce';
import { createEducationalInstituteCourseAPI, getAllGetEducationalInstituteCoursesAPI, updateEducationalInstituteCourseAPI } from '../../../utils/axios/apiServices';
import { useNavigate } from 'react-router-dom';
import { IEducationCourseFormData, IEducationCourseManagementData, IEducationCourseManagementFilterReq, IEducationCourseManagementResponse } from '../../../interface/courseManagement';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { convertNumberToWords, formatCourseTenure, IsFormValid, restrictInputByPattern, toastError, toastSuccess } from '../../../utils/functions/shared';
import { validationMessages } from '../../../utils/constants/messages';
import { COURSE_DESCRIPTION_PATTERN, COURSE_FEES_PATTERN, COURSE_NAME_INPUT_PATTERN, COURSE_NAME_PATTERN, COURSE_TENURE_PATTERN, NON_NUMERIC_DECIMAL_CHARACTERS_PATTERN, NUMBER_ONLY_PATTERN } from '../../../utils/constants/pattern';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { CourseType } from '../../../utils/constants/enum';
import usePermission from '../../../hooks/usePermission';

const sanitizeCourseFees = (value: string): string => {
  const [whole = "", ...decimalParts] = value.replace(NON_NUMERIC_DECIMAL_CHARACTERS_PATTERN, "").split(".");
  const decimal = decimalParts.join("").slice(0, 2);

  return `${whole.slice(0, 10)}${decimalParts.length ? `.${decimal}` : ""}`;
};

const ManageCourses = () => {
  const defaultCourseForm = {
    courseName: "",
    courseTenure: "",
    courseFees: "",
    courseType: 0,
    isJobGuaranteed: true,
    description: "",
    isActive: true,
  }

  const [loading, setLoading] = useState<boolean>(false);

  const [courses, setCourses] = useState<IEducationCourseManagementData[]>([]);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedCourseType, setSelectedCourseType] = useState<number>(0);

  const [selectedJobGuaranteed, setSelectedJobGuaranteed] = useState<boolean | null>(null);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [showCourseDialog, setShowCourseDialog] = useState<boolean>(false);

  const [selectedCourse, setSelectedCourse] = useState<IEducationCourseManagementData | null>(null);

  const [courseForm, setCourseForm] = useState<IEducationCourseFormData>(defaultCourseForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const isEditMode = !!selectedCourse;

  const courseFeesInWords = Number(courseForm.courseFees) > 0
    ? `${convertNumberToWords(Number(courseForm.courseFees))} Only`
    : "";

  const { userID } = useSelector((state: RootState) => state.user.user);

  const { view, create } = usePermission("ManageCourses", ["view", "create"])();

  const navigate = useNavigate();

  const fetchCourses = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IEducationCourseManagementFilterReq = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      instituteId: userID
    };

    if (filterReq.searchText?.trim()) {
      queryParams.courseName = filterReq.searchText?.trim();
    }

    if (selectedCourseType) {
      queryParams.courseType = selectedCourseType;
    }

    if (selectedJobGuaranteed !== null) {
      queryParams.isItJobGuaranteed = selectedJobGuaranteed;
    }

    const response: IEducationCourseManagementResponse = await getAllGetEducationalInstituteCoursesAPI(queryParams);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      setCourses(response.data?.courseList || []);
      setTotalRecords(response.data?.totalCount || 0);
    }

    setLoading(false);
  };

  const actionBody = (rowData: IEducationCourseManagementData): JSX.Element => {
    const viewTooltipId = `view-course-${rowData.id}`;

    const editTooltipId = `course-edit-${rowData.id}`;

    return (
      <>
        {view && (
          <>
            <Tooltip target={`#${viewTooltipId}`} position="top" />
            <Button
              className="trash-icon p-0 me-2"
              id={viewTooltipId}
              data-pr-tooltip="View Course"
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.educationManageCourse}/${rowData.id}`,
                )
              }
            >
              <i className="icon-eye" />
            </Button>
          </>
        )}

        {create && (
          <>
            <Tooltip target={`#${editTooltipId}`} position="top" />
            <Button
              id={editTooltipId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Edit Course"
              onClick={() => openEditDialog(rowData)}
            >
              <i className="icon-edit" />
            </Button>
          </>
        )}
      </>
    )
  }

  const resetForm = (): void => {
    setCourseForm(defaultCourseForm);
    setFormErrors({});
    setSelectedCourse(null);
    setIsFormSubmitted(false);
  };

  const openAddDialog = (): void => {
    resetForm();
    setShowCourseDialog(true);
  };

  const openEditDialog = (course: IEducationCourseManagementData): void => {
    const courseTenureMonths = Number(course.courseTenure || 0);

    setSelectedCourse(course);

    setCourseForm({
      courseName: course.courseName || "",
      courseTenure: courseTenureMonths
        ? String(courseTenureMonths)
        : "",
      courseFees: String(course.courseFees || ""),
      courseType: course.courseType || 0,
      isJobGuaranteed: !!course.isItJobGuaranteed,
      description: course.courseShortDescription || "",
      isActive: !!course.isActive,
    });

    setFormErrors({});
    setIsFormSubmitted(false);
    setShowCourseDialog(true);
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
  };

  const validateCourseName = (value: string): string => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return validationMessages.courseNameRequired;

    if (trimmedValue.length < 2 || trimmedValue.length > 100) {
      return validationMessages.courseNameInvalid;
    }

    if (!COURSE_NAME_PATTERN.test(trimmedValue)) {
      return validationMessages.courseNameInvalidSpecialCharacters;
    }

    return "";
  };

  const validateCourseTenure = (value: string): string => {
    if (!value.trim()) return validationMessages.courseTenureRequired;

    if (!COURSE_TENURE_PATTERN.test(value)) {
      return validationMessages.courseTenureInvalid;
    }

    return "";
  };

  const validateCourseFees = (value: string): string => {
    if (!value.trim()) return validationMessages.courseFeesRequired;

    if (!COURSE_FEES_PATTERN.test(value) || Number(value) <= 0) {
      return validationMessages.courseFeesInvalid;
    }

    return "";
  };

  const validateCourseType = (value: number): string => (
    value > 0 ? "" : validationMessages.courseTypeRequired
  );

  const validateDescription = (value: string): string => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return validationMessages.descriptionRequired;
    if (trimmedValue.length < 10 || trimmedValue.length > 500 || !COURSE_DESCRIPTION_PATTERN.test(trimmedValue)) {
      return validationMessages.courseDescriptionInvalid;
    }

    return "";
  };

  const handleChange = (
    fieldName: keyof IEducationCourseFormData,
    value: string | number | boolean,
  ): void => {
    const updatedCourseForm = { ...courseForm, [fieldName]: value };

    setCourseForm(updatedCourseForm);

    let errorMessage = "";

    switch (fieldName) {
      case "courseName":
        errorMessage = validateCourseName(String(value));
        break;

      case "courseTenure": {
        errorMessage = validateCourseTenure(String(value));
        break;
      }

      case "courseFees":
        errorMessage = validateCourseFees(String(value));
        break;

      case "courseType":
        errorMessage = validateCourseType(Number(value));
        break;

      case "description":
        errorMessage = validateDescription(String(value));
        break;

      default:
        errorMessage = "";
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
  };

  const handleSaveCourse = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const updatedFormErrors = {
      ...formErrors,
      courseName: validateCourseName(courseForm.courseName),
      courseTenure: validateCourseTenure(courseForm.courseTenure),
      courseFees: validateCourseFees(courseForm.courseFees),
      courseType: validateCourseType(courseForm.courseType),
      description: validateDescription(courseForm.description),
    };

    setFormErrors(updatedFormErrors);

    const isValid = IsFormValid(updatedFormErrors);

    if (!isValid) return;

    setLoading(true);

    const payload = {
      ...(selectedCourse?.id && { id: selectedCourse.id }),
      instituteId: userID,
      courseName: courseForm.courseName.trim(),
      courseTenure: Number(courseForm.courseTenure),
      courseFees: Number(courseForm.courseFees),
      courseType: courseForm.courseType,
      isItJobGuaranteed: courseForm.isJobGuaranteed,
      courseShortDescription: courseForm.description.trim(),
      isActive: courseForm.isActive,
    };

    const response = selectedCourse
      ? await updateEducationalInstituteCourseAPI(payload)
      : await createEducationalInstituteCourseAPI(payload);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      setShowCourseDialog(false);
      resetForm();

      if (filterReq.pageNumber !== 0) {
        setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
      } else {
        await fetchCourses();
      }
    } else {
      toastError(response.message);
    }

    setLoading(false);
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
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText, selectedCourseType, selectedJobGuaranteed]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24">
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Manage Course" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by course name"
                />

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedCourseType}
                    onChange={(e) => {
                      setSelectedCourseType(e.value ?? 0);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={courseTypeOptions}
                    showClear={selectedCourseType !== 0}
                    placeholder="Filter by Course Type"
                  />
                </div>

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedJobGuaranteed}
                    onChange={(e) => {
                      setSelectedJobGuaranteed(e.value == null ? null : Boolean(e.value));
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={jobGuaranteedOptions}
                    showClear={selectedJobGuaranteed !== null}
                    placeholder="Filter by Guarantee"
                  />
                </div>

                {create && (
                  <div className="form-group">
                    <Button onClick={openAddDialog} className="btn btn-orange">
                      <i className="bi bi-plus-circle me-2" />
                      Add Course
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={courses}
                  emptyMessage="No courses found."
                >
                  <Column field="courseCode" header="Course Code" />

                  <Column field="courseName" header="Course Name" />

                  <Column
                    body={(rowData: IEducationCourseManagementData) =>
                      formatCourseTenure(rowData.courseTenure)
                    }
                    header="Course Tenure"
                  />

                  <Column
                    body={(rowData: IEducationCourseManagementData) =>
                      formatCurrencyAmount(rowData.courseFees)
                    }
                    header="Course Fees"
                  />

                  <Column
                    body={(rowData: IEducationCourseManagementData) =>
                      rowData.courseType === CourseType.ONLINE ? "Online" : rowData.courseType === CourseType.OFFLINE ? "Offline" : ""
                    }
                    header="Course Type"
                  />

                  <Column
                    body={(rowData: IEducationCourseManagementData) =>
                      rowData.isItJobGuaranteed ? "Yes" : "No"
                    }
                    header="Job Guaranteed"
                  />

                  {(create || view) && <Column header="Action" body={actionBody} />}
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(courses) && (
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
        header={isEditMode ? "Update Course" : "Create Course"}
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
              disabled={loading}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleSaveCourse}
              disabled={loading}
              label={isEditMode ? "Update" : "Create"}
            />
          </div>
        }
      >
        <Loader isLoading={loading} />

        <div className="row g-3">
          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseName">
              Course Name<sup>*</sup>
            </label>
            <InputText
              id="courseName"
              name="courseName"
              className="form-control"
              placeholder="Enter course name"
              maxLength={100}
              value={courseForm.courseName?.trimStart()}
              onChange={(e) => handleChange("courseName", e.target.value?.trimStart())}
              onKeyDown={(e) => restrictInputByPattern(e, COURSE_NAME_INPUT_PATTERN)}
            />
            {formErrors.courseName && <small className="error">{formErrors.courseName}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseTenure">
              Course Tenure (In Months)<sup>*</sup>
            </label>

            <InputText
              id="courseTenure"
              name="courseTenure"
              className="form-control"
              placeholder="Enter course tenure in months"
              value={courseForm.courseTenure}
              maxLength={3}
              onChange={(e) =>
                handleChange(
                  "courseTenure",
                  e.target.value.replace(/\D/g, "")
                )
              }
              onKeyDown={(e) =>
                restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
              }
            />

            {formErrors.courseTenure && (
              <small className="error">
                {formErrors.courseTenure}
              </small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseFees">
              Course Fees<sup>*</sup>
            </label>
            <InputText
              id="courseFees"
              name="courseFees"
              className="form-control"
              placeholder="Enter course fees"
              value={courseForm.courseFees}
              onChange={(e) =>
                handleChange("courseFees", sanitizeCourseFees(e.target.value))
              }
            />
            {courseFeesInWords && (
              <small className="text-muted d-block mt-1">{courseFeesInWords}</small>
            )}
            {formErrors.courseFees && <small className="error">{formErrors.courseFees}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="courseType">
              Course Type<sup>*</sup>
            </label>
            <Dropdown
              id="courseType"
              name="courseType"
              className="w-100"
              value={courseForm.courseType}
              options={courseTypeOptions}
              onChange={(e) => handleChange("courseType", e.value)}
              placeholder="Select course type"
            />
            {formErrors.courseType && <small className="error">{formErrors.courseType}</small>}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="courseDescription">
              Description<sup>*</sup>
            </label>
            <InputTextarea
              id="courseDescription"
              name="courseDescription"
              className="form-control"
              rows={4}
              maxLength={500}
              autoResize
              placeholder="Enter course description"
              value={courseForm.description?.trimStart()}
              onChange={(e) => handleChange("description", e.target.value?.trimStart())}
            />
            {formErrors.description && <small className="error">{formErrors.description}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-3">
            <label className="form-label d-block mb-2">Job Guaranteed?</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                name="isJobGuaranteed"
                id="isJobGuaranteed"
                checked={courseForm.isJobGuaranteed}
                onChange={(e) => handleChange("isJobGuaranteed", !!e.value)}
              />
              <span>{courseForm.isJobGuaranteed ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="form-group col-sm-12 col-lg-3">
            <label className="form-label d-block mb-2">Status</label>
            <div className="d-flex align-items-center gap-2">
              <InputSwitch
                name="isActive"
                id="isActive"
                checked={courseForm.isActive}
                onChange={(e) => handleChange("isActive", !!e.value)}
              />
              <span>{courseForm.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ManageCourses

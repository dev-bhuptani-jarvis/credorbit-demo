import React, { useCallback, useEffect, useState } from 'react'
import TableTitle from '../../../components/TableTitle'
import { Button } from 'primereact/button'
import { useNavigate, useParams } from 'react-router-dom';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import { courseTypeOptions, formatCurrencyAmount, RouteParams } from '../../../utils/constants/constant';
import Loader from '../../../components/Loader';
import { IEducationCourseManagementData } from '../../../interface/courseManagement';
import { getEducationalInstituteCourseByIdAPI, updateEducationalInstituteCourseAPI } from '../../../utils/axios/apiServices';
import { formatCourseTenure, toastError, toastSuccess } from '../../../utils/functions/shared';
import { InputSwitch } from 'primereact/inputswitch';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import usePermission from '../../../hooks/usePermission';

const CourseDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);

  const [course, setCourse] = useState<IEducationCourseManagementData | null>(null);

  const [updatedStatus, setUpdatedStatus] = useState<boolean>(false);

  const [initialStatus, setInitialStatus] = useState<boolean>(false);

  const { userID } = useSelector((state: RootState) => state.user.user);

  const { create } = usePermission("ManageCourses", ["create"])();

  const courseTypeLabel = courseTypeOptions.find(
    (option) => option.value === course?.courseType,
  )?.label || "-";

  const fetchCourseDetails = useCallback(async (): Promise<void> => {
    if (!id) {
      toastError("Course ID is missing");
      navigate(RoutePathConstant.private.educationManageCourse);
      return;
    }

    setLoading(true);

    const response = await getEducationalInstituteCourseByIdAPI(id);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      setCourse(response.data);
      const normalizedStatus = Boolean(response.data.isActive);
      setUpdatedStatus(normalizedStatus);
      setInitialStatus(normalizedStatus);
    } else {
      toastError(response.message);
      navigate(RoutePathConstant.private.educationManageCourse);
    }

    setLoading(false);
  }, [id, navigate]);

  const hasStatusChanged = course ? updatedStatus !== initialStatus : false;

  const handleSaveStatus = async (): Promise<void> => {
    if (!course || !id || !hasStatusChanged) return;

    setLoading(true);

    const response = await updateEducationalInstituteCourseAPI({
      id,
      instituteId: userID,
      courseName: course.courseName.trim(),
      courseTenure: Number(course.courseTenure),
      courseFees: Number(course.courseFees),
      courseType: course.courseType,
      isItJobGuaranteed: course.isItJobGuaranteed,
      courseShortDescription: course.courseShortDescription.trim(),
      isActive: updatedStatus,
    });

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      setInitialStatus(updatedStatus);
      setCourse((prevCourse) => (
        prevCourse
          ? { ...prevCourse, isActive: updatedStatus }
          : prevCourse
      ));
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <TableTitle title={`Course Details${course?.courseName ? ` - ${course.courseName}` : ""}`} />
          <Button
            className="btn btn-black-line"
            onClick={() => navigate(RoutePathConstant.private.educationManageCourse)}
          >
            Back
          </Button>
        </div>
        {course && (
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course Code</b>
                        <p className="text-break">{course.courseCode}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course Name</b>
                        <p className="text-break">{course.courseName}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course Tenure</b>
                        <p className="text-break">
                          {course.courseTenure
                            ? formatCourseTenure(course.courseTenure)
                            : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course Fees</b>
                        <p className="text-break">
                          {formatCurrencyAmount(course.courseFees)}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course Type</b>
                        <p className="text-break">{courseTypeLabel}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Job Guaranteed</b>
                        <p className="text-break">
                          {course.isItJobGuaranteed ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Description</b>
                        <p className="text-break">{course.courseShortDescription}</p>
                      </div>

                      {create ?
                        <>
                          <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                            <b className="fw-semibold">Status</b>
                            <>
                              <div className="d-flex align-items-center mt-2">
                                <InputSwitch
                                  aria-label="Course Active Status"
                                  checked={Boolean(updatedStatus)}
                                  onChange={() => setUpdatedStatus((prevStatus) => !prevStatus)}
                                  disabled={loading}
                                />
                                <p className="ps-2 small mb-0">
                                  {updatedStatus ? "Active" : "Inactive"}
                                </p>
                              </div>

                              {hasStatusChanged && (
                                <p className="small text-muted mt-2 mb-0">
                                  Status has changed. Save to apply the update.
                                </p>
                              )}
                            </>
                          </div>

                          <div className="col-12 d-flex justify-content-end gap-3">
                            {hasStatusChanged && (
                              <Button
                                className="btn btn-orange"
                                label="Save"
                                onClick={handleSaveStatus}
                                disabled={loading}
                              />
                            )}
                          </div></>
                        :
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Status</b>
                          <p className="text-break">{course.isActive ? "Active" : "Inactive"}</p>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CourseDetail

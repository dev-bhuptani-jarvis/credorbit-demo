import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import { getEducationCourseById } from "../../utils/demo/demoEducationCourses";

const CourseDetail = () => {
  const navigate = useNavigate();

  const { id = "" } = useParams();

  const course = useMemo(() => getEducationCourseById(id), [id]);

  if (!course) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Course Details" />
        <p className="mb-3">Course not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.educationManageCourse)}
        >
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <TableTitle title={`Course Details - ${course.courseName}`} />
        <Button
          className="btn btn-black-line"
          onClick={() => navigate(RoutePathConstant.private.educationManageCourse)}
        >
          Back
        </Button>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-12 mt-4">
              <div className="borderBoxHldr p-24">
                <div className="row">
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course Name</b>
                    <p className="text-break">{course.courseName}</p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course Tenure</b>
                    <p className="text-break">{course.courseTenure}</p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Number of EMI Options</b>
                    <p className="text-break">{course.numberOfEmi}</p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course Fees</b>
                    <p className="text-break">
                      {formatCurrencyAmount(course?.courseFees)}
                    </p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course Type</b>

                    <p className="text-break">{course?.courseType}</p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Job Guaranteed</b>
                    <p className="text-break">
                      {course.isJobGuaranteed ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Status</b>
                    <p className="text-break">{course.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Description</b>
                    <p className="text-break">{course.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

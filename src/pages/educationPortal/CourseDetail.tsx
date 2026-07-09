import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { getEducationCourseById } from "../../utils/demo/demoEducationCourses";
import { getEducationStudents } from "../../utils/demo/demoEducationStudents";

const CourseDetail = () => {
  const navigate = useNavigate();

  const { id = "" } = useParams();

  const course = useMemo(() => getEducationCourseById(id), [id]);
  const appliedStudents = useMemo(() => {
    if (!course) return [];

    return getEducationStudents().filter(
      (student) =>
        student.courseId === course.id || student.courseName === course.courseName,
    );
  }, [course]);

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

        <div className="col-12 mt-4">
          <div className="whiteBoxHldr">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h3 className="txt-20 mb-1">Students Applied for Loan</h3>
                <p className="mb-0 text-muted">
                  Students currently mapped to this course and carrying loan records.
                </p>
              </div>
              <span className="text-muted small">
                {appliedStudents.length} student(s)
              </span>
            </div>

            {appliedStudents.length > 0 ? (
              <div className="table-responsive">
                <table className="tableMain">
                  <thead>
                    <tr>
                      <th>Student Code</th>
                      <th>Student Name</th>
                      <th>Mobile Number</th>
                      <th>Email Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.studentCode}</td>
                        <td>{student.studentName}</td>
                        <td>{formatMobileNumber(student.mobileNumber)}</td>
                        <td>{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mb-0 text-muted">
                No students with loan applications are currently mapped to this course.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

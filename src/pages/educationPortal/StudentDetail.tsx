import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount, formatMobileNumber } from "../../utils/constants/constant";
import { formatDate } from "../../utils/functions/shared";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const student = useMemo(() => getEducationStudentById(id), [id]);

  if (!student) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student Profile View" />
        <p className="mb-3">Student not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <TableTitle title={student.studentName} />
        <Button
          className="btn btn-black-line"
          onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}
        >
          Back
        </Button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-3">Personal Details</h5>
              <div className="borderBoxHldr p-24">
                <div className="row">
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Student Information</b>
                    <p className="text-break">{student.studentName}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Student Code</b>
                    <p className="text-break">{student.studentCode}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course</b>
                    <p className="text-break">{student.courseName}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Student PAN</b>
                    <p className="text-break">{student.studentPan}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Parent PAN</b>
                    <p className="text-break">{student.parentPan || "-"}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Minor Student</b>
                    <p className="text-break">{student.isMinor ? "Yes" : "No"}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Credit Score</b>
                    <p className="text-break">{student.creditInformation.creditScore}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Contact Details</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Mobile Number</b>
                <p className="text-break">{formatMobileNumber(student.mobileNumber)}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Email Address</b>
                <p className="text-break">{student.email}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Co-applicant Name</b>
                <p className="text-break">{student.coApplicantName || "-"}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Co-applicant Relation</b>
                <p className="text-break">{student.coApplicantRelation || "-"}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Co-applicant Mobile</b>
                <p className="text-break">
                  {student.coApplicantMobileNumber
                    ? formatMobileNumber(student.coApplicantMobileNumber)
                    : "-"}
                </p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Registered On</b>
                <p className="text-break">{formatDate(student.createdAt, "DD MMM, YYYY")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Loan Details</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Total Loans Availed</b>
                <p className="text-break">{student.loanDetails.totalLoansAvailed}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Active Loans</b>
                <p className="text-break">{student.loanDetails.activeLoans}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Closed Loans</b>
                <p className="text-break">{student.loanDetails.closedLoans}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Outstanding Amount</b>
                <p className="text-break">
                  {formatCurrencyAmount(student.loanDetails.outstandingAmount)}
                </p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>EMI Information</b>
                <p className="text-break">{student.loanDetails.emiInformation}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Repayment Status</b>
                <p className="text-break">{student.loanDetails.repaymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

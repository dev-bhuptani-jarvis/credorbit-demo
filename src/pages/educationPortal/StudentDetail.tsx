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

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="whiteBoxHldr h-100">
            <h5 className="mb-3">Personal Details</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small">Student Information</label>
                <p className="mb-0">{student.studentName}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Student Code</label>
                <p className="mb-0">{student.studentCode}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Course</label>
                <p className="mb-0">{student.courseName}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Student PAN</label>
                <p className="mb-0">{student.studentPan}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Parent PAN</label>
                <p className="mb-0">{student.parentPan || "-"}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Minor Student</label>
                <p className="mb-0">{student.isMinor ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="whiteBoxHldr h-100">
            <h5 className="mb-3">Contact Details</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small">Mobile Number</label>
                <p className="mb-0">{formatMobileNumber(student.mobileNumber)}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Email Address</label>
                <p className="mb-0 text-break">{student.email}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Co-applicant Name</label>
                <p className="mb-0">{student.coApplicantName || "-"}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Co-applicant Relation</label>
                <p className="mb-0">{student.coApplicantRelation || "-"}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Co-applicant Mobile</label>
                <p className="mb-0">
                  {student.coApplicantMobileNumber
                    ? formatMobileNumber(student.coApplicantMobileNumber)
                    : "-"}
                </p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Registered On</label>
                <p className="mb-0">{formatDate(student.createdAt, "DD MMM, YYYY")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="whiteBoxHldr h-100">
            <h5 className="mb-3">Loan Details</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label small">Total Loans Availed</label>
                <p className="mb-0">{student.loanDetails.totalLoansAvailed}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Active Loans</label>
                <p className="mb-0">{student.loanDetails.activeLoans}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Closed Loans</label>
                <p className="mb-0">{student.loanDetails.closedLoans}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Outstanding Amount</label>
                <p className="mb-0">
                  {formatCurrencyAmount(student.loanDetails.outstandingAmount)}
                </p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">EMI Information</label>
                <p className="mb-0">{student.loanDetails.emiInformation}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Repayment Status</label>
                <p className="mb-0">{student.loanDetails.repaymentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="whiteBoxHldr h-100">
            <h5 className="mb-3">Credit Information</h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small">Credit Bureau Summary</label>
                <p className="mb-0">{student.creditInformation.creditBureauSummary}</p>
              </div>
              <div className="col-sm-6">
                <label className="form-label small">Credit Score</label>
                <p className="mb-0">{student.creditInformation.creditScore}</p>
              </div>
              <div className="col-12">
                <label className="form-label small">Credit History</label>
                <p className="mb-0">{student.creditInformation.creditHistory}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

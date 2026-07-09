import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import { toastError } from "../../utils/functions/shared";
import { getStudentEnrollmentById } from "../../utils/demo/demoStudentEnrollments";

const StudentEnrolledCourseDetail = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const enrollment = useMemo(() => getStudentEnrollmentById(id), [id]);

  const loanDocuments = useMemo(
    () => [
      {
        title: "Loan Agreement",
        url: "/assets/images/dummy-loan-aggrement.pdf",
      },
      {
        title: "Sanction Letter",
        url: "/assets/images/sanction-letter.pdf",
      },
      {
        title: "EMI Repayment Schedule",
        url: "/assets/images/sanction-letter.pdf",
      },
    ],
    [enrollment],
  );

  const openDocument = (documentUrl: string | null): void => {
    if (documentUrl && typeof window !== "undefined") {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    toastError("Loan document is not available for this enrolled course.");
  };

  if (!enrollment) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Course Details View" />
        <p className="mb-3">Enrolled course not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.studentEnrolledCourses)}
        >
          Back to Enrolled Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <TableTitle title={enrollment.courseName} />
        <Button
          className="btn btn-black-line"
          onClick={() => navigate(RoutePathConstant.private.studentEnrolledCourses)}
        >
          Back
        </Button>
      </div>

      <div className="row">
        <div className="col-12">
          <h5 className="mb-3">Course Information</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Institute Name</b>
                <p className="text-break">{enrollment.instituteName}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Course Name</b>
                <p className="text-break">{enrollment.courseName}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Duration</b>
                <p className="text-break">{enrollment.duration}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Fee Structure</b>
                <p className="text-break">{formatCurrencyAmount(enrollment.feeStructure)}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Credit Score</b>
                <p className="text-break">{enrollment.creditScore}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Loan Information</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Loan Account Number</b>
                <p className="text-break">{enrollment.loanAccountNumber}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Loan Amount</b>
                <p className="text-break">{formatCurrencyAmount(enrollment.loanAmount)}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Outstanding Amount</b>
                <p className="text-break">
                  {formatCurrencyAmount(enrollment.outstandingAmount)}
                </p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>EMI Amount</b>
                <p className="text-break">{formatCurrencyAmount(enrollment.emiAmount)}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>EMI Schedule</b>
                <p className="text-break">{enrollment.emiSchedule}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Repayment Status</b>
                <p className="text-break">{enrollment.repaymentStatus}</p>
              </div>
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Loan Status</b>
                <p className="text-break">{enrollment.loanStatus}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Loan Documents</h5>
          <div className="borderBoxHldr p-24">
            <div className="table-responsive">
              <table className="tableMain">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loanDocuments.map((document) => (
                    <tr key={document.title}>
                      <td>{document.title}</td>
                      <td>{document.url ? "Available" : "Pending"}</td>
                      <td>
                        <Button
                          className="btn btn-black-line py-2 px-3"
                          label="View Document"
                          onClick={() => openDocument(document.url)}
                          disabled={!document.url}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrolledCourseDetail;

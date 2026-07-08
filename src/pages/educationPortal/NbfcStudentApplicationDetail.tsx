import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import {
  enableNbfcEnach,
  getEducationLoanDraftById,
  sendNbfcLoanAgreementForSigning,
  updateNbfcEducationLoanApplicationStatus,
} from "../../utils/demo/demoEducationLoanFlow";
import { toastError, toastSuccess } from "../../utils/functions/shared";

type NbfcApplicationStatus =
  | "Pending"
  | "Approved"
  | "Sanctioned"
  | "Disbursed"
  | "Rejected"
  | "Query Raised";

const statusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Query Raised", value: "Query Raised" },
  { label: "Sanctioned", value: "Sanctioned" },
  { label: "Disbursed", value: "Disbursed" },
  { label: "Rejected", value: "Rejected" },
];

const NbfcStudentApplicationDetail = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const draft = useMemo(() => getEducationLoanDraftById(id), [id]);

  const [activeDraft, setActiveDraft] = useState(draft);

  const [selectedStatus, setSelectedStatus] = useState<
    NbfcApplicationStatus | ""
  >(activeDraft?.loanApplicationStatus || "");

  const [sanctionDate, setSanctionDate] = useState<string>(
    activeDraft?.sanctionDate ? activeDraft.sanctionDate.slice(0, 10) : "",
  );

  const [disbursementDate, setDisbursementDate] = useState<string>(
    activeDraft?.disbursementDate ? activeDraft.disbursementDate.slice(0, 10) : "",
  );

  const [utrNumber, setUtrNumber] = useState<string>(activeDraft?.utrNumber || "");

  const [transactionReference, setTransactionReference] = useState<string>(
    activeDraft?.transactionReference || "",
  );

  const [queryRemarks, setQueryRemarks] = useState<string>(
    activeDraft?.queryRemarks || "",
  );

  const [disbursementRemarks, setDisbursementRemarks] = useState<string>(
    activeDraft?.disbursementRemarks || "",
  );

  if (!activeDraft) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student Application Details" />
        <p className="mb-3">Student loan application not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() =>
            navigate(RoutePathConstant.private.educationNbfcStudentApplications)
          }
        >
          Back to Student Applications
        </Button>
      </div>
    );
  }

  const handleStatusUpdate = (): void => {
    if (!selectedStatus) return;

    if (selectedStatus === "Sanctioned" && !sanctionDate) {
      toastError("Sanction date is required for sanctioned applications.");
      return;
    }

    if (selectedStatus === "Disbursed") {
      if (!sanctionDate) {
        toastError("Sanction date is required before disbursement.");
        return;
      }

      if (!disbursementDate || !utrNumber.trim() || !transactionReference.trim()) {
        toastError(
          "Disbursement date, UTR number, and transaction reference are required.",
        );
        return;
      }
    }

    if (selectedStatus === "Query Raised" && !queryRemarks.trim()) {
      toastError("Please enter query remarks before raising a query.");
      return;
    }

    const updatedDraft = updateNbfcEducationLoanApplicationStatus(activeDraft.id, {
      loanApplicationStatus: selectedStatus,
      sanctionDate: sanctionDate || null,
      disbursementDate: disbursementDate || null,
      utrNumber: utrNumber.trim(),
      transactionReference: transactionReference.trim(),
      queryRemarks: queryRemarks.trim(),
      disbursementRemarks: disbursementRemarks.trim(),
    });
    if (updatedDraft) {
      setActiveDraft(updatedDraft);
    }
    if (selectedStatus === "Sanctioned") {
      toastSuccess(
        "Status updated to Sanctioned. Sanction letter, repayment schedule, and student email delivery have been generated in demo mode.",
      );
    } else {
      toastSuccess("Loan application status updated successfully.");
    }
  };

  const handleSendAgreement = (): void => {
    const updatedDraft = sendNbfcLoanAgreementForSigning(activeDraft.id);

    if (!updatedDraft) {
      toastError("Loan agreement could not be sent.");
      return;
    }

    setActiveDraft(updatedDraft);

    toastSuccess(
      `DGO link sent to ${activeDraft.studentEmail}. The student can complete e-signing on the external platform.`,
    );
  };

  const handleEnableEnach = (): void => {
    if (
      !["Sanctioned", "Disbursed"].includes(
        selectedStatus || activeDraft.loanApplicationStatus,
      )
    ) {
      toastError("e-NACH can be initiated only after the loan is sanctioned.");
      return;
    }

    const updatedDraft = enableNbfcEnach(activeDraft.id);

    if (!updatedDraft) {
      toastError("e-NACH registration could not be initiated.");
      return;
    }

    setActiveDraft(updatedDraft);

    toastSuccess("e-NACH registration has been initiated successfully.");
  };

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <TableTitle title={`Student Application - ${activeDraft.studentName}`} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            className="btn btn-black-line"
            onClick={() =>
              navigate(RoutePathConstant.private.educationNbfcStudentApplications)
            }
          >
            Back
          </Button>
          <Button className="btn btn-orange" onClick={handleStatusUpdate}>
            Save Status
          </Button>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="row g-3">
            <div className="col-lg-3 col-md-6 col-12">
              <div className="borderBoxHldr p-20 h-100" style={{ padding: '20px' }}>
                <small className="text-muted d-block">Loan Amount</small>
                <h5 className="mb-0 mt-2">{formatCurrencyAmount(activeDraft.loanAmount)}</h5>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="borderBoxHldr p-20 h-100" style={{ padding: '20px' }}>
                <small className="text-muted d-block">Institute</small>
                <h6 className="mb-0 mt-2">{activeDraft.instituteName}</h6>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="borderBoxHldr p-20 h-100" style={{ padding: '20px' }}>
                <small className="text-muted d-block">UTR Number</small>
                <h6 className="mb-0 mt-2">{activeDraft.utrNumber || "Pending"}</h6>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="borderBoxHldr p-20 h-100" style={{ padding: '20px' }}>
                <small className="text-muted d-block">e-NACH</small>
                <h6 className="mb-0 mt-2">
                  {activeDraft.enachEnabled ? "Enabled" : "Not Initiated"}
                </h6>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="borderBoxHldr p-24" style={{ padding: '24px' }}>
            <div className="row align-items-end">
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Loan Status</label>
                <Dropdown
                  className="w-100"
                  value={selectedStatus}
                  options={statusOptions}
                  optionLabel="label"
                  optionValue="value"
                  onChange={(e) => setSelectedStatus(e.value)}
                  placeholder="Select loan status"
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Sanction Date</label>
                <InputText
                  type="date"
                  className="form-control"
                  value={sanctionDate}
                  onChange={(e) => setSanctionDate(e.target.value)}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Disbursement Date</label>
                <InputText
                  type="date"
                  className="form-control"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">UTR Number</label>
                <InputText
                  className="form-control"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  placeholder="Enter UTR number"
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Transaction Reference</label>
                <InputText
                  className="form-control"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Enter transaction reference"
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Query Remarks</label>
                <InputText
                  className="form-control"
                  value={queryRemarks}
                  onChange={(e) => setQueryRemarks(e.target.value)}
                  placeholder="Enter query remarks"
                />
              </div>
              <div className="form-group col-lg-4 col-md-6 col-12 mb-4">
                <label className="form-label fw-bold">Disbursement Remarks</label>
                <InputText
                  className="form-control"
                  value={disbursementRemarks}
                  onChange={(e) => setDisbursementRemarks(e.target.value)}
                  placeholder="Enter disbursement remarks"
                />
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap mt-2">
              <Button
                className="btn btn-orange-line"
                onClick={handleSendAgreement}
              >
                Send Loan Agreement Document to Sign (DGO)
              </Button>
              <Button className="btn btn-orange-line" onClick={handleEnableEnach}>
                e-NACH Registration
              </Button>
            </div>
          </div>
        </div>

        <div className="col-12">
          <h5 className="mb-3">Student Details</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Student Name</b>
                <p className="text-break">{activeDraft.studentName}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Student PAN</b>
                <p className="text-break">{activeDraft.studentPan}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Email</b>
                <p className="text-break">{activeDraft.studentEmail}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Mobile Number</b>
                <p className="text-break">{activeDraft.studentMobileNumber}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Parent PAN</b>
                <p className="text-break">{activeDraft.parentPan || "-"}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Co-applicant Name</b>
                <p className="text-break">{activeDraft.coApplicantName || "-"}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Co-applicant Mobile</b>
                <p className="text-break">{activeDraft.coApplicantMobileNumber || "-"}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Co-applicant Relation</b>
                <p className="text-break">{activeDraft.coApplicantRelation || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Course & KFS Details</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Institute Name</b>
                <p className="text-break">{activeDraft.instituteName}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Course Name</b>
                <p className="text-break">{activeDraft.courseName}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Course Tenure</b>
                <p className="text-break">{activeDraft.courseTenure}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Course Type</b>
                <p className="text-break">{activeDraft.courseType}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Agreed Course Fee</b>
                <p className="text-break">{formatCurrencyAmount(activeDraft.courseFees)}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Discount Amount</b>
                <p className="text-break">
                  {formatCurrencyAmount(activeDraft.discountAmount)}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Discounted Course Fee</b>
                <p className="text-break">
                  {formatCurrencyAmount(activeDraft.discountedCourseFee)}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Downpayment</b>
                <p className="text-break">{formatCurrencyAmount(activeDraft.downpayment)}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Loan Amount</b>
                <p className="text-break">{formatCurrencyAmount(activeDraft.loanAmount)}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Loan Tenure</b>
                <p className="text-break">{activeDraft.emiOptionMonths} Months</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Advance EMI</b>
                <p className="text-break">{formatCurrencyAmount(activeDraft.advanceEmi)}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Number of EMIs</b>
                <p className="text-break">{activeDraft.numberOfEmis}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>EMI Amount</b>
                <p className="text-break">{formatCurrencyAmount(activeDraft.emiAmount)}</p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Total Amount to Institute</b>
                <p className="text-break">
                  {formatCurrencyAmount(activeDraft.totalAmountToInstitute)}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Consent Accepted</b>
                <p className="text-break">{activeDraft.consentAccepted ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Loan Documentation Distribution</h5>
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Loan Agreement Sent</b>
                <p className="text-break">
                  {activeDraft.loanAgreementSentAt
                    ? new Date(activeDraft.loanAgreementSentAt).toLocaleString("en-IN")
                    : "Not sent"}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>e-NACH Status</b>
                <p className="text-break">
                  {activeDraft.enachEnabled
                    ? `Enabled on ${new Date(
                      activeDraft.enachRegisteredAt || "",
                    ).toLocaleString("en-IN")}`
                    : "Not initiated"}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Sanction Letter</b>
                <p className="text-break">
                  {activeDraft.sanctionLetterUrl ? "Generated" : "Pending"}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Repayment Schedule</b>
                <p className="text-break">
                  {activeDraft.repaymentScheduleUrl ? "Generated" : "Pending"}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Loan Agreement</b>
                <p className="text-break">
                  {activeDraft.loanAgreementUrl ? "Available" : "Pending"}
                </p>
              </div>
              <div className="col-lg-3 col-md-6 col-12 mb-4">
                <b>Disbursement Advice</b>
                <p className="text-break">
                  {activeDraft.disbursementAdviceUrl ? "Available" : "Pending"}
                </p>
              </div>
              <div className="col-lg-6 col-12 mb-4">
                <b>Final Document List</b>
                <p className="text-break mb-0">
                  Sanction Letter, Loan Agreement, Repayment Schedule,
                  Disbursement Advice, and other required onboarding documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NbfcStudentApplicationDetail;

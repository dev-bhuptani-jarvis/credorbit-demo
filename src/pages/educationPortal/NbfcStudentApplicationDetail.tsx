import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentEnrollment,
} from "../../interface/educationManagement";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  enableNbfcEnach,
  getEducationLoanDraftById,
} from "../../utils/demo/demoEducationLoanFlow";
import { getStudentEnrollments } from "../../utils/demo/demoStudentEnrollments";
import { formatDate, toastError, toastSuccess } from "../../utils/functions/shared";

type RepaymentScheduleItem = {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: "Paid" | "Upcoming" | "Overdue";
};

const getRiskBucket = (repaymentStatus: string): string => {
  switch (repaymentStatus) {
    case "Overdue":
      return "High Risk";
    case "Delayed":
      return "Watchlist";
    case "Closed":
      return "Closed";
    case "On-Time":
      return "Current";
    default:
      return "Current";
  }
};

const getDaysPastDue = (repaymentStatus: string): number => {
  switch (repaymentStatus) {
    case "Overdue":
      return 32;
    case "Delayed":
      return 7;
    default:
      return 0;
  }
};

const getBadgeStyles = (repaymentStatus: string): React.CSSProperties => {
  switch (repaymentStatus) {
    case "Overdue":
      return { backgroundColor: "#fde8e8", color: "#dc2626" };
    case "Delayed":
      return { backgroundColor: "#fff4db", color: "#d97706" };
    case "Closed":
      return { backgroundColor: "#e5e7eb", color: "#4b5563" };
    case "On-Time":
      return { backgroundColor: "#e7f8ef", color: "#15803d" };
    default:
      return { backgroundColor: "#eff6ff", color: "#2563eb" };
  }
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "18px 16px",
  height: "100%",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "18px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  height: "100%",
};

const pageTextMuted: React.CSSProperties = {
  color: "#6b7280",
};

const labelStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  letterSpacing: "0.02em",
};

const buildRepaymentSchedule = (
  draft: IEducationLoanDraft,
  enrollment: IEducationStudentEnrollment | undefined,
  installmentsPaid: number,
): RepaymentScheduleItem[] => {
  const totalInstallments = draft.numberOfEmis || 0;
  const baseDate = new Date(
    draft.disbursementDate || draft.sanctionDate || draft.createdAt,
  );
  const dayOfMonth = enrollment?.emiSchedule?.match(/\d+/)?.[0] || "5";

  return Array.from({ length: totalInstallments }, (_, index) => {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + index + 1);
    dueDate.setDate(Number(dayOfMonth));

    const isPaid = index < installmentsPaid;
    const isOverdue =
      !isPaid &&
      enrollment?.repaymentStatus === "Overdue" &&
      index === installmentsPaid;

    return {
      id: `schedule-${index + 1}`,
      installmentNumber: index + 1,
      dueDate: dueDate.toISOString(),
      amount: enrollment?.emiAmount || draft.emiAmount,
      status: isPaid ? "Paid" : isOverdue ? "Overdue" : "Upcoming",
    };
  });
};

const NbfcStudentApplicationDetail = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const draft = useMemo(() => getEducationLoanDraftById(id), [id]);
  const linkedEnrollment = useMemo(
    () => getStudentEnrollments().find((enrollment) => enrollment.draftId === id),
    [id],
  );

  const [activeDraft, setActiveDraft] = useState(draft);
  const [internalNote, setInternalNote] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);

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

  const repaymentStatus = linkedEnrollment?.repaymentStatus || "Pending";
  const daysPastDue = getDaysPastDue(repaymentStatus);
  const loanAmount = activeDraft.loanAmount;
  const principalOutstanding =
    linkedEnrollment?.outstandingAmount ??
    Math.max(loanAmount - activeDraft.advanceEmi, 0);
  const emiAmount = linkedEnrollment?.emiAmount || activeDraft.emiAmount;
  const totalInstallments = activeDraft.numberOfEmis || 0;
  const installmentsPaid =
    emiAmount > 0
      ? Math.max(
          0,
          Math.min(
            totalInstallments,
            totalInstallments - Math.ceil(principalOutstanding / emiAmount),
          ),
        )
      : 0;
  const totalRepayable =
    activeDraft.advanceEmi + activeDraft.numberOfEmis * activeDraft.emiAmount;
  const amountCollected = Math.max(totalRepayable - principalOutstanding, 0);
  const repaymentSchedule = buildRepaymentSchedule(
    activeDraft,
    linkedEnrollment,
    installmentsPaid,
  );

  const activityLog = [
    activeDraft.sanctionDate
      ? `Loan sanctioned on ${formatDate(activeDraft.sanctionDate, "DD MMM YYYY")}.`
      : "",
    activeDraft.loanAgreementSentAt
      ? `Loan agreement shared on ${formatDate(activeDraft.loanAgreementSentAt, "DD MMM YYYY h:mm A")}.`
      : "",
    activeDraft.enachRegisteredAt
      ? `e-NACH registered on ${formatDate(activeDraft.enachRegisteredAt, "DD MMM YYYY h:mm A")}.`
      : "",
    activeDraft.disbursementDate
      ? `Loan disbursed on ${formatDate(activeDraft.disbursementDate, "DD MMM YYYY")} with UTR ${activeDraft.utrNumber || "-"}.`
      : "",
    activeDraft.queryRemarks ? `Latest query: ${activeDraft.queryRemarks}` : "",
  ].filter(Boolean);

  const handleDownloadStatement = (): void => {
    if (!activeDraft.repaymentScheduleUrl) {
      toastError("Repayment statement is not available yet.");
      return;
    }

    if (typeof window !== "undefined") {
      window.open(activeDraft.repaymentScheduleUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSendReminder = (): void => {
    toastSuccess(`Reminder sent to ${activeDraft.studentName} successfully.`);
  };

  const handleForecloseLoan = (): void => {
    toastSuccess("Foreclosure request has been marked for review.");
  };

  const handleEnableEnach = (): void => {
    const updatedDraft = enableNbfcEnach(activeDraft.id);

    if (!updatedDraft) {
      toastError("e-NACH registration could not be initiated.");
      return;
    }

    setActiveDraft(updatedDraft);
    toastSuccess("e-NACH registration has been initiated successfully.");
  };

  const handleManualCollection = (installmentNumber: number): void => {
    toastSuccess(`Manual collection recorded for EMI #${installmentNumber}.`);
  };

  const handleAddNote = (): void => {
    if (!internalNote.trim()) {
      toastError("Please enter a note first.");
      return;
    }

    setNotes((prev) => [internalNote.trim(), ...prev]);
    setInternalNote("");
    toastSuccess("Internal note added.");
  };

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(RoutePathConstant.private.educationNbfcStudentApplications)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#6b7280",
              fontSize: "14px",
              marginBottom: "16px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Back to student applications
          </button>

          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <span style={{ color: "#6b7280", fontSize: "13px" }}>
              {linkedEnrollment?.loanAccountNumber || activeDraft.id}
            </span>
            <span
              style={{
                ...getBadgeStyles(repaymentStatus),
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {repaymentStatus === "On-Time" ? "Active - on time" : repaymentStatus}
            </span>
          </div>

          <h2 className="txt-24 mb-0" style={{ fontWeight: 700 }}>
            {activeDraft.studentName}
          </h2>
          <p className="mb-0 mt-2" style={pageTextMuted}>
            {activeDraft.instituteName}
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Button className="btn btn-black-line" onClick={handleDownloadStatement}>
            Download statement
          </Button>
          <Button className="btn btn-black-line" onClick={handleSendReminder}>
            Send reminder
          </Button>
          <Button
            className="btn"
            onClick={handleForecloseLoan}
            style={{
              backgroundColor: "#fff1f2",
              color: "#b42318",
              border: "1px solid #fecdd3",
            }}
          >
            Foreclose loan
          </Button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-4 col-md-6 col-12">
          <div style={cardStyle}>
            <h5 className="mb-4" style={{ fontWeight: 700 }}>
              Loan summary
            </h5>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Principal</span>
              <span style={{ fontWeight: 700 }}>{formatCurrencyAmount(loanAmount)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Interest rate</span>
              <span style={{ fontWeight: 700 }}>14% p.a. reducing</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Tenure</span>
              <span style={{ fontWeight: 700 }}>{activeDraft.emiOptionMonths} months</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>EMI</span>
              <span style={{ fontWeight: 700, color: "#ff632c" }}>
                {formatCurrencyAmount(emiAmount)}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span style={labelStyle}>eNACH mandate</span>
              <span
                style={{
                  fontWeight: 700,
                  color: activeDraft.enachEnabled ? "#15803d" : "#d97706",
                }}
              >
                {activeDraft.enachEnabled ? "Registered" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-12">
          <div style={cardStyle}>
            <h5 className="mb-4" style={{ fontWeight: 700 }}>
              Repayment progress
            </h5>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Installments paid</span>
              <span style={{ fontWeight: 700 }}>
                {installmentsPaid} / {totalInstallments}
              </span>
            </div>
            <div
              style={{
                height: "10px",
                backgroundColor: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: `${
                    totalInstallments > 0
                      ? (installmentsPaid / totalInstallments) * 100
                      : 0
                  }%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #ff632c 0%, #f59e0b 100%)",
                }}
              />
            </div>
            <p style={{ ...pageTextMuted, fontSize: "13px" }}>
              {formatCurrencyAmount(amountCollected)} collected of{" "}
              {formatCurrencyAmount(totalRepayable)} total repayable
            </p>
            <div className="d-flex justify-content-between mt-4">
              <span style={labelStyle}>Principal outstanding</span>
              <span style={{ fontWeight: 700 }}>
                {formatCurrencyAmount(principalOutstanding)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-12 col-12">
          <div style={cardStyle}>
            <h5 className="mb-4" style={{ fontWeight: 700 }}>
              Collection health
            </h5>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Days past due</span>
              <span style={{ fontWeight: 700 }}>{daysPastDue}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <span style={labelStyle}>Risk bucket</span>
              <span
                style={{
                  ...getBadgeStyles(repaymentStatus),
                  borderRadius: "999px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {getRiskBucket(repaymentStatus)}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Late fees accrued</span>
              <span
                style={{
                  fontWeight: 700,
                  color: daysPastDue > 0 ? "#dc2626" : "#111827",
                }}
              >
                {daysPastDue > 0 ? formatCurrencyAmount(daysPastDue * 25) : "?0"}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={labelStyle}>Last payment</span>
              <span style={{ fontWeight: 700 }}>
                {activeDraft.disbursementDate
                  ? formatDate(activeDraft.disbursementDate, "DD MMM YYYY")
                  : "--"}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span style={labelStyle}>Reminders sent</span>
              <span style={{ fontWeight: 700 }}>{notes.length > 0 ? 1 : 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6 col-12">
          <div style={panelStyle}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 className="mb-0" style={{ fontWeight: 700 }}>
                Repayment schedule
              </h5>
              <button
                type="button"
                onClick={handleEnableEnach}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff632c",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Run eNACH on next due
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {repaymentSchedule.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 110px 110px 90px 80px",
                    gap: "10px",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #eef2f7",
                  }}
                >
                  <span style={labelStyle}>#{item.installmentNumber}</span>
                  <span style={{ color: "#374151" }}>
                    {formatDate(item.dueDate, "DD MMM YYYY")}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {formatCurrencyAmount(item.amount)}
                  </span>
                  <span
                    style={{
                      justifySelf: "start",
                      backgroundColor:
                        item.status === "Paid"
                          ? "#e7f8ef"
                          : item.status === "Overdue"
                            ? "#fde8e8"
                            : "#f3f4f6",
                      color:
                        item.status === "Paid"
                          ? "#15803d"
                          : item.status === "Overdue"
                            ? "#dc2626"
                            : "#6b7280",
                      borderRadius: "999px",
                      padding: "2px 10px",
                      fontSize: "12px",
                    }}
                  >
                    {item.status}
                  </span>
                  <Button
                    className="btn"
                    onClick={handleEnableEnach}
                    style={{
                      backgroundColor: "#fff4db",
                      color: "#b45309",
                      border: "1px solid #f6d38b",
                      padding: "6px 10px",
                    }}
                  >
                    eNACH
                  </Button>
                  <Button
                    className="btn"
                    onClick={() => handleManualCollection(item.installmentNumber)}
                    style={{
                      backgroundColor: "transparent",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      padding: "6px 10px",
                    }}
                  >
                    Manual
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-12">
          <div className="d-flex flex-column gap-3">
            <div style={panelStyle}>
              <h5 className="mb-3" style={{ fontWeight: 700 }}>
                Activity log
              </h5>
              {activityLog.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {activityLog.map((item, index) => (
                    <div key={`${item}-${index}`} style={{ color: "#374151" }}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0" style={pageTextMuted}>
                  No activity yet.
                </p>
              )}
            </div>

            <div style={panelStyle}>
              <h5 className="mb-3" style={{ fontWeight: 700 }}>
                Internal notes
              </h5>
              {notes.length > 0 ? (
                <div className="d-flex flex-column gap-2 mb-3">
                  {notes.map((note, index) => (
                    <div
                      key={`${note}-${index}`}
                      style={{
                        backgroundColor: "#fffaf5",
                        border: "1px solid #fed7aa",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        color: "#374151",
                      }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3" style={pageTextMuted}>
                  No notes yet.
                </p>
              )}

              <div className="d-flex gap-2">
                <InputText
                  className="form-control"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add an internal note about this account..."
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#d1d5db",
                    color: "#111827",
                  }}
                />
                <Button
                  className="btn"
                  onClick={handleAddNote}
                  style={{
                    backgroundColor: "#ff632c",
                    color: "#ffffff",
                    border: "1px solid #ff632c",
                    minWidth: "70px",
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div style={panelStyle}>
              <h5 className="mb-3" style={{ fontWeight: 700 }}>
                Borrower details
              </h5>
              <div className="row">
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Loan Application ID</div>
                  <div>{activeDraft.id}</div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Selected NBFC</div>
                  <div>{activeDraft.selectedBankName || "-"}</div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Student Email</div>
                  <div>{activeDraft.studentEmail}</div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Student Mobile</div>
                  <div>{formatMobileNumber(activeDraft.studentMobileNumber)}</div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Parent PAN</div>
                  <div>{activeDraft.parentPan || "-"}</div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div style={labelStyle}>Co-applicant</div>
                  <div>
                    {activeDraft.coApplicantName || "-"}
                    {activeDraft.coApplicantRelation
                      ? ` � ${activeDraft.coApplicantRelation}`
                      : ""}
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

export default NbfcStudentApplicationDetail;

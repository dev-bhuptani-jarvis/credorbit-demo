import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { IEducationLoanDraft } from "../../interface/educationManagement";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount, formatMobileNumber } from "../../utils/constants/constant";
import { formatDate } from "../../utils/functions/shared";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import {
  getEducationLoanDraftById,
  getEducationLoanDrafts,
} from "../../utils/demo/demoEducationLoanFlow";

const timelineStages = [
  { label: "Application Started", matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"] },
  { label: "Credit Check", matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"] },
  { label: "Eligibility Generated", matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"] },
  { label: "Offer Received", matches: ["Approved", "Sanctioned", "Disbursed"] },
  { label: "Approved", matches: ["Approved", "Sanctioned", "Disbursed"] },
  { label: "Disbursed", matches: ["Disbursed"] },
];

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

const buildDocumentList = (drafts: IEducationLoanDraft[]) =>
  drafts.flatMap((draft, index) => [
    {
      id: `${draft.id}-passport`,
      title: "Credit Passport",
      subtitle: `${draft.courseName} · Updated ${formatDate(draft.updatedAt, "DD MMM, YYYY")}`,
      href: draft.repaymentScheduleUrl || "/assets/images/CAM_Report_Sample_HL.xlsx",
    },
    {
      id: `${draft.id}-sanction`,
      title: "Sanction Letter",
      subtitle: draft.sanctionDate ? `Issued ${formatDate(draft.sanctionDate, "DD MMM, YYYY")}` : "Awaiting sanction",
      href: draft.sanctionLetterUrl || "/assets/images/sanction-letter.pdf",
    },
    {
      id: `${draft.id}-agreement`,
      title: "Loan Agreement",
      subtitle: draft.loanAgreementSentAt
        ? `Shared ${formatDate(draft.loanAgreementSentAt, "DD MMM, YYYY")}`
        : "Pending release",
      href: draft.loanAgreementUrl || "/assets/images/sanction-letter.pdf",
    },
    {
      id: `${draft.id}-advice-${index}`,
      title: "Disbursement Advice",
      subtitle: draft.disbursementDate
        ? `Disbursed ${formatDate(draft.disbursementDate, "DD MMM, YYYY")}`
        : "Available after disbursement",
      href: draft.disbursementAdviceUrl || "/assets/images/sanction-letter.pdf",
    },
  ]);

const Student360View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const selectedDraftId = (location.state as { selectedDraftId?: string } | null)
    ?.selectedDraftId;

  const fallbackDraft = useMemo(() => getEducationLoanDraftById(id), [id]);
  const resolvedStudentId = fallbackDraft?.studentId || id;
  const student = useMemo(
    () => getEducationStudentById(resolvedStudentId),
    [resolvedStudentId],
  );
  const studentDrafts = useMemo(
    () =>
      getEducationLoanDrafts()
        .filter((draft) => draft.studentId === resolvedStudentId)
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [resolvedStudentId],
  );

  const activeDraft =
    studentDrafts.find((draft) => draft.id === selectedDraftId) ||
    fallbackDraft ||
    studentDrafts[0];
  const stageStatus = activeDraft?.loanApplicationStatus || "Pending";
  const documents = useMemo(() => buildDocumentList(studentDrafts).slice(0, 6), [studentDrafts]);

  if (!student) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student 360° View" />
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
    <div className="education-360-page">
      <div className="education-360-page__header">
        <TableTitle title={student.studentName} />
      </div>

      <div className="education-360-layout">
        <div className="education-360-main">
          <section className="education-360-hero">
            <div className="education-360-hero__profile">
              <div className="education-360-avatar">
                {student.studentPhoto ? (
                  <img src={student.studentPhoto} alt={student.studentName} />
                ) : (
                  <span>{getInitials(student.studentName)}</span>
                )}
              </div>
              <div className="education-360-hero__meta">
                <div className="education-360-hero__name">
                  <h2>{student.studentName}</h2>
                  <span className="education-360-chip">Lead</span>
                </div>
                <p>
                  {student.studentCode} · {student.courseName}
                </p>
                <p>{formatMobileNumber(student.mobileNumber)}</p>
              </div>
            </div>

            <div className="education-360-hero__stats">
              <div className="education-360-stat-card">
                <span>Credit Score</span>
                <strong>{student.creditInformation.creditScore}</strong>
              </div>
              <div className="education-360-stat-card">
                <span>Applications</span>
                <strong>{studentDrafts.length}</strong>
              </div>
            </div>
          </section>

          <div className="education-360-grid">
            <section className="education-360-card">
              <h3>Course Details</h3>
              <div className="education-360-course">
                <div className="education-360-course__icon">
                  <i className="bi bi-mortarboard" />
                </div>
                <div>
                  <h4>{student.courseName}</h4>
                  <p>
                    Registered {formatDate(student.createdAt, "DD MMM, YYYY")} · {student.studentGender}
                  </p>
                </div>
              </div>
              <div className="education-360-course__stats">
                <div>
                  <span>Date of Birth</span>
                  <strong>{student.studentDateOfBirth ? formatDate(student.studentDateOfBirth, "DD MMM, YYYY") : "-"}</strong>
                </div>
                <div>
                  <span>Outstanding</span>
                  <strong>{formatCurrencyAmount(student.loanDetails.outstandingAmount)}</strong>
                </div>
                <div>
                  <span>EMI</span>
                  <strong>{student.loanDetails.emiInformation}</strong>
                </div>
              </div>
            </section>

            <section className="education-360-card">
              <h3>Applicants</h3>
              <div className="education-360-applicant-list">
                {student.applicants?.map((applicant, index) => (
                  <div key={applicant.id || `${applicant.name}-${index}`} className="education-360-applicant">
                    <div className="education-360-applicant__avatar">
                      {applicant.photo ? (
                        <img src={applicant.photo} alt={applicant.name} />
                      ) : (
                        <span>{getInitials(applicant.name || `Applicant ${index + 1}`)}</span>
                      )}
                    </div>
                    <div className="education-360-applicant__meta">
                      <h4>{applicant.name || `Applicant ${index + 1}`}</h4>
                      <p>{applicant.pan}</p>
                      <p>
                        {applicant.gender} · {applicant.dateOfBirth ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY") : "-"}
                      </p>
                      <p>
                        {formatMobileNumber(applicant.mobileNumber)} · {applicant.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="education-360-card education-360-documents">
            <div className="education-360-card__head">
              <h3>Documents & Reports</h3>
              <Button
                className="btn btn-link"
                onClick={() =>
                  navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                    state: { preselectedStudentId: student.id },
                  })
                }
              >
                Upload
              </Button>
            </div>
            <div className="education-360-documents__grid">
              {documents.map((document) => (
                <a
                  key={document.id}
                  className="education-360-document"
                  href={document.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="education-360-document__icon">
                    <i className="bi bi-file-earmark-text" />
                  </div>
                  <div className="education-360-document__meta">
                    <h4>{document.title}</h4>
                    <p>{document.subtitle}</p>
                  </div>
                  <i className="bi bi-download" />
                </a>
              ))}
              {documents.length === 0 && (
                <div className="education-360-document education-360-document--empty">
                  No documents available yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="education-360-timeline">
          <div className="education-360-card education-360-card--sticky">
            <h3>Journey Timeline</h3>
            <p className="education-360-card__hint">Click a stage to jump</p>
            <div className="education-360-timeline__list">
              {timelineStages.map((stage) => {
                const isComplete = stage.matches.includes(stageStatus);
                return (
                  <button
                    key={stage.label}
                    type="button"
                    className={`education-360-timeline__item ${isComplete ? "is-active" : ""}`}
                    onClick={() =>
                      navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                        state: { preselectedStudentId: student.id },
                      })
                    }
                  >
                    <span className="education-360-timeline__dot" />
                    <span>{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Student360View;

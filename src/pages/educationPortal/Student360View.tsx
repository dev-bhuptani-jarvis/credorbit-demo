import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentApplicant,
} from "../../interface/educationManagement";
import { RootState } from "../../store";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { formatDate } from "../../utils/functions/shared";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import {
  getEducationLoanDraftById,
  getEducationLoanDrafts,
} from "../../utils/demo/demoEducationLoanFlow";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";

const RAZORPAY_TEST_LINK =
  "https://razorpay.com/payment-link/plink_SokyWAJOOqGcI2/test";

const timelineStages = [
  {
    label: "Application Started",
    matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"],
  },
  {
    label: "Credit Check",
    matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"],
  },
  {
    label: "Eligibility Generated",
    matches: ["Pending", "Query Raised", "Approved", "Sanctioned", "Disbursed"],
  },
  {
    label: "Offer Received",
    matches: ["Approved", "Sanctioned", "Disbursed"],
  },
  {
    label: "Approved",
    matches: ["Approved", "Sanctioned", "Disbursed"],
  },
  { label: "Disbursed", matches: ["Disbursed"] },
];

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

const renderField = (label: string, value: string) => (
  <div className="education-360-field">
    <span>{label}</span>
    <strong>{value || "-"}</strong>
  </div>
);

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
      subtitle: draft.sanctionDate
        ? `Issued ${formatDate(draft.sanctionDate, "DD MMM, YYYY")}`
        : "Awaiting sanction",
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

const renderApplicantCard = (
  applicant: IEducationStudentApplicant,
  title: string,
  relation?: string,
) => (
  <div className="education-360-applicant">
    <div className="education-360-applicant__avatar">
      {applicant.photo ? (
        <img src={applicant.photo} alt={applicant.name || title} />
      ) : (
        <span>{getInitials(applicant.name || title)}</span>
      )}
    </div>

    <div className="education-360-applicant__meta">
      <h4>{applicant.name || title}</h4>
      <p>{relation || title}</p>
      <div className="education-360-field-grid education-360-field-grid--compact">
        {renderField("Name", applicant.name || "-")}
        {renderField("PAN", applicant.pan || "-")}
        {renderField(
          "DOB",
          applicant.dateOfBirth
            ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
            : "-",
        )}
        {renderField("Gender", applicant.gender || "-")}
        {renderField(
          "Mobile",
          applicant.mobileNumber
            ? formatMobileNumber(applicant.mobileNumber)
            : "-",
        )}
        {renderField("Email", applicant.email || "-")}
        {renderField("Photo", applicant.photo ? "Uploaded" : "Not Uploaded")}
        {renderField("Address", applicant.address || "-")}
      </div>
    </div>
  </div>
);

const Student360View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "" } = useParams();
  const { userID, roleName } = useSelector((state: RootState) => state.user.user);
  const impersonatedStudentId = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
  );
  const selectedDraftId = (location.state as { selectedDraftId?: string } | null)
    ?.selectedDraftId;
  const isStudentPortalUser =
    userID === "student-role-001" ||
    roleName === "Student" ||
    Boolean(impersonatedStudentId);

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
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        ),
    [resolvedStudentId],
  );

  if (!student) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student 360 View" />
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

  const activeDraft =
    studentDrafts.find((draft) => draft.id === selectedDraftId) ||
    fallbackDraft ||
    studentDrafts[0];
  const stageStatus = activeDraft?.loanApplicationStatus || "Pending";
  const documents = buildDocumentList(studentDrafts).slice(0, 6);
  const primaryApplicant = student.applicants?.[0];
  const coApplicants = student.applicants?.slice(1) || [];
  const openRazorpayLink = (): void => {
    if (typeof window !== "undefined") {
      window.open(RAZORPAY_TEST_LINK, "_blank", "noopener,noreferrer");
    }
  };
  const studentDetailFields = [
    { label: "Name", value: student.studentName },
    { label: "PAN", value: student.studentPan || "-" },
    {
      label: "DOB",
      value: student.studentDateOfBirth
        ? formatDate(student.studentDateOfBirth, "DD MMM, YYYY")
        : "-",
    },
    { label: "Gender", value: student.studentGender || "-" },
    { label: "Mobile", value: formatMobileNumber(student.mobileNumber) },
    { label: "Email", value: student.email },
    { label: "Photo", value: student.studentPhoto ? "Uploaded" : "Not Uploaded" },
    { label: "Address", value: student.address || "-" },
  ];
  const profileSummaryFields = [
    { label: "Course", value: student.courseName },
    {
      label: "Registered On",
      value: formatDate(student.createdAt, "DD MMM, YYYY"),
    },
    { label: "Parent PAN", value: student.parentPan || "-" },
    {
      label: "Outstanding Amount",
      value: formatCurrencyAmount(student.loanDetails.outstandingAmount),
    },
    { label: "EMI Information", value: student.loanDetails.emiInformation },
    {
      label: "Applied Loan Amount",
      value: formatCurrencyAmount(student.loanDetails.appliedLoanAmount),
    },
    {
      label: "Last Credit Score Fetch",
      value: student.creditInformation.lastDateCreditScore || "-",
    },
    {
      label: "Primary Co-applicant",
      value: student.coApplicantName || "-",
    },
  ];

  return (
    <div className="education-360-page">
      <div className="education-360-page__header">
        <TableTitle title={student.studentName} />
        <div className="education-360-page__actions">
          <Button
            className="btn btn-black-line"
            onClick={() =>
              navigate(
                isStudentPortalUser
                  ? RoutePathConstant.private.studentOngoingApplications
                  : RoutePathConstant.private.educationManageStudents,
              )
            }
          >
            Back
          </Button>
        </div>
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
                  <span className="education-360-chip">Student</span>
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
              <div className="education-360-stat-card">
                <span>Active Loans</span>
                <strong>{student.loanDetails.activeLoans}</strong>
              </div>
            </div>
          </section>

          <div className="education-360-grid">
            <section className="education-360-card">
              <div className="education-360-card__head">
                <div>
                  <h3>Student Details</h3>
                  <p className="education-360-card__hint">
                    Saved profile fields from student onboarding.
                  </p>
                </div>
              </div>
              <div className="education-360-profile-banner">
                <div className="education-360-profile-banner__avatar">
                  {student.studentPhoto ? (
                    <img src={student.studentPhoto} alt={student.studentName} />
                  ) : (
                    <span>{getInitials(student.studentName)}</span>
                  )}
                </div>
                <div>
                  <h4>{student.studentName}</h4>
                  <p>{student.address || "Address not available"}</p>
                </div>
              </div>
              <div className="education-360-field-grid">
                {studentDetailFields.map((field) => (
                  <div key={field.label}>{renderField(field.label, field.value)}</div>
                ))}
              </div>
            </section>

            <section className="education-360-card">
              <div className="education-360-card__head">
                <div>
                  <h3>Profile Summary</h3>
                  <p className="education-360-card__hint">
                    Reference details used across applicant and loan workflows.
                  </p>
                </div>
              </div>
              <div className="education-360-field-grid">
                {profileSummaryFields.map((field) => (
                  <div key={field.label}>{renderField(field.label, field.value)}</div>
                ))}
              </div>
            </section>
          </div>

          <section className="education-360-card">
            <div className="education-360-card__head">
              <h3>Applicant Details</h3>
              <p className="education-360-card__hint">
                Applicant and co-applicant information saved with the student profile.
              </p>
            </div>
            <div className="education-360-applicant-list">
              {primaryApplicant ? (
                renderApplicantCard(primaryApplicant, "Applicant")
              ) : (
                <div className="education-360-document education-360-document--empty">
                  No applicant details available.
                </div>
              )}

              {coApplicants.map((applicant, index) => (
                <div key={applicant.id || `${applicant.name}-${index}`}>
                  {renderApplicantCard(
                    applicant,
                    `Co-applicant ${index + 1}`,
                    student.coApplicantRelation || `Co-applicant ${index + 1}`,
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="education-360-card">
            <div className="education-360-card__head">
              <div>
                <h3>Loan Journey</h3>
                <p className="education-360-card__hint">
                  Latest application activity and current progress of the selected journey.
                </p>
              </div>
              {isStudentPortalUser && (
                <div className="education-360-page__actions">
                  <Button
                    className="btn btn-orange-line"
                    onClick={openRazorpayLink}
                  >
                    Repay EMI Overdue
                  </Button>
                  <Button
                    className="btn btn-orange"
                    onClick={openRazorpayLink}
                  >
                    Force Close Loan
                  </Button>
                </div>
              )}
            </div>
            <div className="education-360-field-grid">
              {renderField(
                "Application Status",
                activeDraft?.loanApplicationStatus || "Pending",
              )}
              {renderField("Selected NBFC", activeDraft?.selectedBankName || "-")}
              {renderField(
                "Loan Amount",
                activeDraft ? formatCurrencyAmount(activeDraft.loanAmount) : "-",
              )}
              {renderField(
                "Sanction Date",
                activeDraft?.sanctionDate
                  ? formatDate(activeDraft.sanctionDate, "DD MMM, YYYY")
                  : "-",
              )}
              {renderField(
                "Disbursement Date",
                activeDraft?.disbursementDate
                  ? formatDate(activeDraft.disbursementDate, "DD MMM, YYYY")
                  : "-",
              )}
              {renderField(
                "Processing Fee",
                activeDraft?.processingFeeAmount
                  ? formatCurrencyAmount(activeDraft.processingFeeAmount)
                  : "-",
              )}
            </div>
          </section>

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

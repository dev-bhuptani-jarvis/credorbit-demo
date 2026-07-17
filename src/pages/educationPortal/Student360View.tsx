import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import TableTitle from "../../components/TableTitle";
import { IEducationLoanDraft } from "../../interface/educationManagement";
import { RootState } from "../../store";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { formatDate, toastInfo, toastSuccess } from "../../utils/functions/shared";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import {
  buildEducationCustomerInfo,
  getEducationLoanDraftById,
  getEducationLoanDrafts,
} from "../../utils/demo/demoEducationLoanFlow";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";

const RAZORPAY_TEST_LINK =
  "https://razorpay.com/payment-link/plink_SokyWAJOOqGcI2/test";

const timelineStages = [
  "Application Started",
  "Credit Check",
  "Banking Check",
  "Eligibility Generated",
  "Offer Received",
  "Approved",
  "Disbursed",
] as const;

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

type StudentDocumentItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const buildDocumentList = (draft: IEducationLoanDraft | undefined): StudentDocumentItem[] => {
  if (!draft) return [];

  return [
    {
      id: `${draft.id}-sanction`,
      title: "Sanction Letter",
      subtitle: draft.sanctionDate
        ? `Issued · ${formatDate(draft.sanctionDate, "DD MMM, YYYY")}`
        : "Awaiting sanction",
      href: draft.sanctionLetterUrl || "/assets/images/sanction-letter.pdf",
    },
    {
      id: `${draft.id}-agreement`,
      title: "Loan Agreement",
      subtitle: draft.loanAgreementSentAt
        ? `Shared · ${formatDate(draft.loanAgreementSentAt, "DD MMM, YYYY")}`
        : "Pending release",
      href: draft.loanAgreementUrl || "/assets/images/sanction-letter.pdf",
    },
    {
      id: `${draft.id}-passport`,
      title: "Credorbit Credit Passport",
      subtitle: `Updated · ${formatDate(draft.updatedAt, "DD MMM, YYYY")}`,
      href: draft.repaymentScheduleUrl || "/assets/images/CAM_Report_Sample_HL.xlsx",
    },
    {
      id: `${draft.id}-advice`,
      title: "Disbursement Advice",
      subtitle: draft.disbursementDate
        ? `Disbursed · ${formatDate(draft.disbursementDate, "DD MMM, YYYY")}`
        : "Available after disbursement",
      href: draft.disbursementAdviceUrl || "/assets/images/sanction-letter.pdf",
    },
  ];
};

const addMonthsToDate = (
  value: string | null | undefined,
  months: number,
): Date | null => {
  if (!value) return null;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  const updatedDate = new Date(parsedDate);
  updatedDate.setMonth(updatedDate.getMonth() + months);
  return updatedDate;
};

const Student360View = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id = "" } = useParams();
  const [showRepaymentDetails, setShowRepaymentDetails] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<StudentDocumentItem[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);

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

  const activeDraft =
    studentDrafts.find((draft) => draft.id === selectedDraftId) ||
    fallbackDraft ||
    studentDrafts[0];

  const baseDocuments = useMemo(() => buildDocumentList(activeDraft), [activeDraft]);
  const documents = useMemo(
    () => [...baseDocuments, ...uploadedDocuments],
    [baseDocuments, uploadedDocuments],
  );
  const stageStatus = activeDraft?.loanApplicationStatus || "Pending";

  useEffect(() => {
    setUploadedDocuments([]);
  }, [activeDraft?.id]);

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

  const openRazorpayLink = (): void => {
    if (typeof window !== "undefined") {
      window.open(RAZORPAY_TEST_LINK, "_blank", "noopener,noreferrer");
    }
  };

  const headerMetrics = [
    {
      label: "Credit",
      value: String(student.creditInformation.creditScore || "-"),
    }
  ];

  const courseDetailFields = [
    {
      label: "Course",
      value: student.courseName,
    },
    {
      label: "Institute",
      value: activeDraft?.instituteName || "-",
    },
    {
      label: "Fee",
      value: activeDraft ? formatCurrencyAmount(activeDraft.courseFees) : "-",
    },
    {
      label: "Down payment",
      value: activeDraft ? formatCurrencyAmount(activeDraft.downpayment) : "-",
    },
    {
      label: "Loan amount",
      value: activeDraft ? formatCurrencyAmount(activeDraft.loanAmount) : "-",
    },
    {
      label: "Tenure",
      value: activeDraft?.courseTenure || "-",
    },
  ];

  const loanJourneyFields = [
    {
      label: "Application Status",
      value: stageStatus,
    },
    {
      label: "Selected NBFC",
      value: activeDraft?.selectedBankName || "-",
    },
    {
      label: "Processing Fee",
      value: activeDraft?.processingFeeAmount
        ? formatCurrencyAmount(activeDraft.processingFeeAmount)
        : "-",
    },
    {
      label: "E-NACH",
      value: activeDraft?.enachEnabled ? "Enabled" : "Pending",
    },
    {
      label: "Sanction Date",
      value: activeDraft?.sanctionDate
        ? formatDate(activeDraft.sanctionDate, "DD MMM, YYYY")
        : "-",
    },
    {
      label: "Disbursement Date",
      value: activeDraft?.disbursementDate
        ? formatDate(activeDraft.disbursementDate, "DD MMM, YYYY")
        : "-",
    },
  ];

  const completedTimelineCount = (() => {
    switch (stageStatus) {
      case "Disbursed":
        return 7;
      case "Sanctioned":
      case "Approved":
        return 6;
      case "Query Raised":
      case "Pending":
        return 4;
      default:
        return 1;
    }
  })();

  const loanStartDate =
    activeDraft?.disbursementDate || activeDraft?.sanctionDate || activeDraft?.createdAt || null;
  const totalEmis = activeDraft?.numberOfEmis || activeDraft?.emiOptionMonths || 0;
  const emiAmount = activeDraft?.emiAmount || 0;
  const outstandingAmount = student.loanDetails.outstandingAmount || 0;
  const remainingEmis =
    emiAmount > 0 ? Math.max(Math.ceil(outstandingAmount / emiAmount), 0) : 0;
  const paidEmis = Math.max(totalEmis - remainingEmis, 0);
  const lastEmiPaidDate = paidEmis > 0 ? addMonthsToDate(loanStartDate, paidEmis) : null;
  const nextEmiPaidDate =
    totalEmis > paidEmis ? addMonthsToDate(loanStartDate, paidEmis + 1) : null;
  const loanMatureDate = totalEmis > 0 ? addMonthsToDate(loanStartDate, totalEmis) : null;

  const repaymentDetailFields = [
    {
      label: "Last EMI Paid Date",
      value: lastEmiPaidDate ? formatDate(lastEmiPaidDate, "DD MMM, YYYY") : "-",
    },
    {
      label: "Last EMI Paid Amount",
      value: paidEmis > 0 && emiAmount > 0 ? formatCurrencyAmount(emiAmount) : "-",
    },
    {
      label: "Next EMI Paid Date",
      value: nextEmiPaidDate ? formatDate(nextEmiPaidDate, "DD MMM, YYYY") : "-",
    },
    {
      label: "Next EMI Paid Amount",
      value: nextEmiPaidDate && emiAmount > 0 ? formatCurrencyAmount(emiAmount) : "-",
    },
    {
      label: "Loan Mature Date",
      value: loanMatureDate ? formatDate(loanMatureDate, "DD MMM, YYYY") : "-",
    },
    {
      label: "Loan Start Date",
      value: loanStartDate ? formatDate(loanStartDate, "DD MMM, YYYY") : "-",
    },
    {
      label: "Loan Sanctioned Amount",
      value: activeDraft ? formatCurrencyAmount(activeDraft.loanAmount) : "-",
    },
    {
      label: "Loan Current Outstanding",
      value: formatCurrencyAmount(outstandingAmount),
    },
  ];

  const handleTimelineClick = (stage: (typeof timelineStages)[number]): void => {
    if (!activeDraft) return;

    if (stage === "Credit Check") {
      dispatch(setCustomerInfo(buildEducationCustomerInfo(student)));
      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          educationFlow: true,
          educationLoanApplicationId: activeDraft.id,
          loanApp: activeDraft.id,
          loanType: 0,
          resumeStep: "credit-score",
        },
      });
      return;
    }

    if (stage === "Banking Check") {
      dispatch(setCustomerInfo(buildEducationCustomerInfo(student)));
      navigate(RoutePathConstant.private.bankingAnalyticsReport);
      return;
    }

    toastInfo(`Loan application status updated: ${stage}`);
  };

  const handleDocumentFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;
    setSelectedDocumentFile(file);
    event.target.value = "";
  };

  const closeUploadModal = (): void => {
    setShowUploadModal(false);
    setDocumentTitle("");
    setSelectedDocumentFile(null);
  };

  const handleSaveDocument = (): void => {
    if (!documentTitle.trim() || !selectedDocumentFile) return;

    const sizeInKb = Math.max(Math.round(selectedDocumentFile.size / 1024), 1);

    setUploadedDocuments((prev) => [
      ...prev,
      {
        id: `${activeDraft?.id || student.id}-${Date.now()}`,
        title: documentTitle.trim(),
        subtitle: `Uploaded · ${sizeInKb} KB`,
        href: URL.createObjectURL(selectedDocumentFile),
      },
    ]);

    toastSuccess("Document uploaded successfully.");
    closeUploadModal();
  };

  return (
    <>
    <div className="education-360-page">
      <div className="education-360-page__header">
        <TableTitle title="Student 360 View" />
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
                  <span className="education-360-chip">
                    {stageStatus === "Pending" ? "Eligibility Generated" : stageStatus}
                  </span>
                </div>
                <p>
                  {student.studentCode} · {student.courseName} · {formatMobileNumber(student.mobileNumber)}
                </p>
              </div>
            </div>

            <div className="education-360-hero__stats">
              {headerMetrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`education-360-stat-card ${
                    index === 1 ? "education-360-stat-card--highlight" : ""
                  }`}
                >
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <div className="education-360-grid">
            <section className="education-360-card">
              <div className="education-360-card__head">
                <div>
                  <h3>Course Details</h3>
                  <p className="education-360-card__hint">
                    Course, institute, fee breakup, sanctioned amount, and tenure.
                  </p>
                </div>
              </div>

              <div className="education-360-field-grid">
                {courseDetailFields.map((field) => (
                  <div key={field.label}>{renderField(field.label, field.value)}</div>
                ))}
              </div>
            </section>

            <section className="education-360-card">
              <div className="education-360-card__head">
                <div>
                  <h3>Loan Journey</h3>
                  <p className="education-360-card__hint">
                    Current lending progress, fee details, and readiness status.
                  </p>
                </div>
                {isStudentPortalUser && (
                  <div className="education-360-page__actions">
                    <Button
                      className="btn btn-orange-line"
                      onClick={() => setShowRepaymentDetails(true)}
                    >
                      Repay EMI Overdue
                    </Button>
                    <Button className="btn btn-orange" onClick={openRazorpayLink}>
                      Force Close Loan
                    </Button>
                  </div>
                )}
              </div>

              <div className="education-360-field-grid">
                {loanJourneyFields.map((field) => (
                  <div key={field.label}>{renderField(field.label, field.value)}</div>
                ))}
              </div>
            </section>
          </div>

          {isStudentPortalUser && showRepaymentDetails ? (
            <section className="education-360-card">
              <div className="education-360-card__head">
                <div>
                  <h3>Repayment Details</h3>
                  <p className="education-360-card__hint">
                    EMI repayment summary for the selected student loan.
                  </p>
                </div>
                <Button className="btn btn-orange" onClick={openRazorpayLink}>
                  Pay Now
                </Button>
              </div>

              <div className="education-360-field-grid">
                {repaymentDetailFields.map((field) => (
                  <div key={field.label}>{renderField(field.label, field.value)}</div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="education-360-card education-360-documents">
            <div className="education-360-card__head">
              <div>
                <h3>Documents & Reports</h3>
                <p className="education-360-card__hint">
                  Loan paperwork and generated lending reports for this student.
                </p>
              </div>
              <Button className="btn btn-link" onClick={() => setShowUploadModal(true)}>
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

              {documents.length === 0 ? (
                <div className="education-360-document education-360-document--empty">
                  No documents available yet.
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="education-360-timeline">
          <div className="education-360-card education-360-card--sticky">
            <h3>Journey Timeline</h3>
            <p className="education-360-card__hint">Click a stage to jump</p>

            <div className="education-360-timeline__list">
              {timelineStages.map((stage, index) => {
                const isActive = index < completedTimelineCount;
                const isCurrent =
                  (stage === "Eligibility Generated" && stageStatus === "Pending") ||
                  (stage === "Approved" &&
                    (stageStatus === "Approved" || stageStatus === "Sanctioned")) ||
                  (stage === "Disbursed" && stageStatus === "Disbursed");

                return (
                  <button
                    key={stage}
                    type="button"
                    className={`education-360-timeline__item ${
                      isActive ? "is-active" : ""
                    } ${isCurrent ? "is-current" : ""}`}
                    onClick={() => handleTimelineClick(stage)}
                  >
                    <span className="education-360-timeline__dot" />
                    <span>{stage}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>

    <Dialog
      header="Upload Document"
      visible={showUploadModal}
      onHide={closeUploadModal}
      modal
      draggable={false}
      resizable={false}
      blockScroll
      className="modalWrapper"
      style={{ width: "560px", maxWidth: "95vw" }}
      footer={
        <div className="modal-footer gap-3">
          <Button
            className="btn btn-black-line w-100 text-center"
            onClick={closeUploadModal}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-orange w-100 text-center"
            onClick={handleSaveDocument}
            disabled={!documentTitle.trim() || !selectedDocumentFile}
          >
            Upload Document
          </Button>
        </div>
      }
    >
      <div className="education-360-upload-dialog">
        <div className="form-group">
          <label className="form-label" htmlFor="student360DocumentTitle">
            Document Name
          </label>
          <InputText
            id="student360DocumentTitle"
            className="form-control"
            placeholder="Enter document name"
            value={documentTitle}
            onChange={(event) => setDocumentTitle(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label d-block" htmlFor="student360DocumentUpload">
            Upload File
          </label>
          <label
            htmlFor="student360DocumentUpload"
            className="borderBoxHldr p-15 d-block cursor-pointer education-360-upload-trigger"
          >
            <b className="d-block mb-1">
              {selectedDocumentFile ? selectedDocumentFile.name : "Choose a file"}
            </b>
            <small className="text-muted">
              Supports PDF, images, Word, and Excel files.
            </small>
          </label>
          <input
            id="student360DocumentUpload"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
            className="d-none"
            onChange={handleDocumentFileChange}
          />
        </div>
      </div>
    </Dialog>
    </>
  );
};

export default Student360View;

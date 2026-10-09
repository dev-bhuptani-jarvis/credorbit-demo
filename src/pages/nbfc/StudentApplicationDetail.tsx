import React, { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  IActionCenterStatus,
  IActivityLog,
  IGetLoanDetailForNBFCResponse,
  IGetLoanDetailForNBFCResponseData,
  ILoanSummary,
  IUploadedDocument,
  IKFSDetails,
  INBFCStudentDetail,
} from "../../interface/loanDetail";
import {
  getLoanDetailForNBFCAPI,
  updateEducationLoanStatusAPI,
} from "../../utils/axios/apiServices";
import {
  formatCurrencyAmount,
  RouteParams,
} from "../../utils/constants/constant";
import {
  formatDate,
  IsFormValid,
  isPdfFile,
  PDF_FILE_ACCEPT,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { DocumentFileTypeForInstitute } from "../../utils/constants/enum";
import { Dropdown } from "primereact/dropdown";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { UTR_CODE_PATTERN } from "../../utils/constants/pattern";

type GenericRecord = Record<string, unknown>;

type NormalizedDocument = {
  id: string;
  name: string;
  type: string;
  path: string;
  uploadedDate: string | null;
};

type NormalizedRepaymentSchedule = {
  id: string;
  label: string;
  dueDate: string | null;
  amount: number | null;
  status: string;
};

type ActionStatusFormValues = {
  sanctionedDate: string;
  sanctionedAmount: string;
  bankID: string;
  disbursedDate: string;
  disbursedAmount: string;
  utrNumber: string;
  comments: string;
  file: File | null;
  documentTypeId: number | null;
};

type ActionStatusFormErrors = {
  sanctionedDate: string;
  sanctionedAmount: string;
  bankID: string;
  disbursedDate: string;
  disbursedAmount: string;
  utrNumber: string;
  comments: string;
  documentTypeId: string;
  file: string;
};

const NBFC_ACTION_STATUS = {
  PENDING: 1,
  APPLIED: 2,
  LOAN_QUERY_RAISED: 3,
  SANCTIONED: 4,
  AGREEMENT_SENT: 5,
  AGREEMENT_SIGNED: 7, // 6
  DISBURSED: 6, // 7
  ENACH_INITIATED: 8,
  ENACH_REGISTERED: 9,
  REJECTED: 10,
  FORECLOSED: 11,
  COMPLETED: 12,
} as const;

const getInitialActionStatusFormValues = (
  sanctionedAmount = "",
  disbursedAmount = "",
): ActionStatusFormValues => ({
  sanctionedDate: "",
  sanctionedAmount,
  bankID: "",
  disbursedDate: "",
  disbursedAmount,
  utrNumber: "",
  comments: "",
  file: null,
  documentTypeId: null,
});

const initialActionStatusFormErrors: ActionStatusFormErrors = {
  sanctionedDate: "",
  sanctionedAmount: "",
  bankID: "",
  disbursedDate: "",
  disbursedAmount: "",
  utrNumber: "",
  comments: "",
  documentTypeId: "",
  file: "",
};

const allowedSupportingDocumentExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
];

const maxSupportingDocumentSizeInBytes = 5 * 1024 * 1024;

const fileUploadVisibleStatusIds: number[] = [
  NBFC_ACTION_STATUS.LOAN_QUERY_RAISED,
  NBFC_ACTION_STATUS.SANCTIONED,
  NBFC_ACTION_STATUS.AGREEMENT_SIGNED,
];

const fileRequiredStatusIds: number[] = [
  NBFC_ACTION_STATUS.AGREEMENT_SIGNED,
];

const pdfOnlyFileStatusIds: number[] = [
  NBFC_ACTION_STATUS.SANCTIONED,
  NBFC_ACTION_STATUS.AGREEMENT_SIGNED,
];

const simpleActionStatusIds: number[] = [
  NBFC_ACTION_STATUS.PENDING,
  NBFC_ACTION_STATUS.APPLIED,
  NBFC_ACTION_STATUS.AGREEMENT_SENT,
  NBFC_ACTION_STATUS.ENACH_INITIATED,
  NBFC_ACTION_STATUS.ENACH_REGISTERED,
  NBFC_ACTION_STATUS.FORECLOSED,
  NBFC_ACTION_STATUS.COMPLETED,
];

const defaultLoanDetail: IGetLoanDetailForNBFCResponseData = {
  loanApplicationID: "",
  studentDetail: {
    studentID: "",
    studentCode: "",
    name: "",
    photo: "",
    loanApplicationCode: "",
    courseName: "",
    instituteName: "",
    instituteTradeName: "",
    disbursedDate: null,
    utrNumber: "",
  },
  courseLoanRequest: {
    courseId: "",
    courseName: "",
    courseFee: 0,
    tenure: 0,
    loanRequestedAmount: 0,
  },
  kfsDetails: {
    agreedFee: 0,
    discountAmount: 0,
    downPayment: 0,
    totalLoanAmount: 0,
    numbersOfEMI: 0,
    advancedEMI: 0,
    remainingEMI: 0,
    emiAmount: 0,
  },
  uploadedDocumentsByInstitute: [],
  actionCenter: [],
  activityLog: [],
  loanSummary: {
    loanAmount: 0,
    interestRate: null,
    emiAmount: 0,
    enachMandate: false,
    totalEMI: 0,
    paidEMI: 0,
    outstandingAmount: null,
  },
  repaymentSchedule: [],
  loanDocuments: [],
};

const getObjectValue = (
  source: GenericRecord,
  keys: string[],
): unknown => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }

  return null;
};

const formatDisplayDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }

  return formatDate(value, "DD MMM, YYYY hh:mm A");
};

const formatDateForPayload = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  return formatCurrencyAmount(Number(value || 0));
};

const openDocumentFile = (filePath?: string): void => {
  if (!filePath) {
    toastError("Document path is not available.");
    return;
  }

  window.open(filePath, "_blank", "noopener,noreferrer");
};

const documentTypeOptions = Object.entries(DocumentFileTypeForInstitute)
  .filter(([, value]) => typeof value === "number")
  .map(([label, value]) => ({
    label: label
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: value as number,
  }));

const documentTypeOptionsByStatus: Partial<Record<number, number[]>> = {
  [NBFC_ACTION_STATUS.LOAN_QUERY_RAISED]: [DocumentFileTypeForInstitute.QUERY],
  [NBFC_ACTION_STATUS.SANCTIONED]: [DocumentFileTypeForInstitute.SANCTION_LETTER],
  [NBFC_ACTION_STATUS.AGREEMENT_SIGNED]: [DocumentFileTypeForInstitute.AGREEMENT],
};

const getNormalizedActionStatusName = (statusName?: string | null): string =>
  (statusName || "").trim().toLowerCase();

const simpleActionStatusNames = new Set([
  "pending",
  "applied",
  "agreementsentforesign",
  "enachrequestsent",
  "awaitingenachregistration",
  "enachregistered",
  "foreclosed",
  "completed",
]);

const isRejectedActionStatus = (
  statusId?: number | null,
  statusName?: string | null,
): boolean =>
  getNormalizedActionStatusName(statusName) === "rejected" ||
  (!statusName && statusId === NBFC_ACTION_STATUS.REJECTED);

const isSimpleActionStatus = (
  statusId?: number | null,
  statusName?: string | null,
): boolean =>
  simpleActionStatusIds.includes(statusId as number) ||
  simpleActionStatusNames.has(getNormalizedActionStatusName(statusName));

const StudentApplicationDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);

  const [loanDetail, setLoanDetail] =
    useState<IGetLoanDetailForNBFCResponseData>(defaultLoanDetail);

  const [selectedActionStatusId, setSelectedActionStatusId] = useState<number | null>(null);

  const [actionFormValues, setActionFormValues] = useState<ActionStatusFormValues>(
    getInitialActionStatusFormValues(),
  );

  const [actionFormErrors, setActionFormErrors] = useState<ActionStatusFormErrors>(
    initialActionStatusFormErrors,
  );

  const [isActionFormSubmitted, setIsActionFormSubmitted] = useState<boolean>(false);

  const [actionFileInputKey, setActionFileInputKey] = useState<number>(0);

  const [showActionStatusDialog, setShowActionStatusDialog] = useState<boolean>(false);

  const fetchLoanDetail = async (): Promise<void> => {
    if (!id) {
      toastError("Loan application ID is missing.");
      navigate(-1);
      return;
    }

    setLoading(true);

    const body = {
      loanApplicationID: id,
    }

    const response: IGetLoanDetailForNBFCResponse = await getLoanDetailForNBFCAPI(body);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response && response.statusCode === 200) {
      setLoanDetail(response.data);
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLoanDetail();
  }, [id]);

  useEffect(() => {
    if (
      selectedActionStatusId &&
      !loanDetail.actionCenter.some((status) => status.statusId === selectedActionStatusId)
    ) {
      handleCloseActionStatusDialog();
    }
  }, [loanDetail.actionCenter, selectedActionStatusId]);

  const normalizedLoanDocuments = useMemo<NormalizedDocument[]>(
    () =>
      (loanDetail.loanDocuments || []).map((document, index) => {
        const currentDocument = document as GenericRecord;

        return {
          id: String(
            getObjectValue(currentDocument, ["id", "documentId", "loanDocumentID"]) ||
            `loan-document-${index + 1}`,
          ),
          name: String(
            getObjectValue(currentDocument, ["documentName", "name", "title"]) ||
            `Loan Document ${index + 1}`,
          ),
          type: String(
            getObjectValue(currentDocument, ["documentType", "type", "category"]) ||
            "Loan Document",
          ),
          path: String(
            getObjectValue(currentDocument, ["filePath", "documentPath", "fileUrl", "url"]) || "",
          ),
          uploadedDate:
            (getObjectValue(currentDocument, ["uploadedDate", "createdDate", "date"]) as string | null) || null,
        };
      }),
    [loanDetail.loanDocuments],
  );

  const normalizedInstituteDocuments = useMemo<NormalizedDocument[]>(
    () =>
      (loanDetail.uploadedDocumentsByInstitute || []).map(
        (document: IUploadedDocument, index) => ({
          id: `${document.documentName || "document"}-${index + 1}`,
          name: document.documentName || `Institute Document ${index + 1}`,
          type: document.documentType || "Institute Document",
          path: document.filePath || "",
          uploadedDate: document.uploadedDate || null,
        }),
      ),
    [loanDetail.uploadedDocumentsByInstitute],
  );

  const normalizedRepaymentSchedule = useMemo<NormalizedRepaymentSchedule[]>(
    () =>
      (loanDetail.repaymentSchedule || []).map((item, index) => {
        const currentSchedule = item as GenericRecord;
        const rawAmount = getObjectValue(currentSchedule, ["emiAmount", "amount", "emi", "dueAmount"]);
        const rawStatus = getObjectValue(currentSchedule, ["status", "paymentStatus", "installmentStatus"]);
        const isCompleted = Boolean(
          getObjectValue(currentSchedule, ["isCompleted", "isPaid"]),
        );

        return {
          id: String(getObjectValue(currentSchedule, ["id", "installmentId"]) || `schedule-${index + 1}`),
          label: String(
            getObjectValue(currentSchedule, ["label", "installmentName", "installmentNumber"]) ||
            `Installment #${index + 1}`,
          ),
          dueDate:
            (getObjectValue(currentSchedule, ["dueDate", "emiDate", "paymentDate", "statusUpdatedDate"]) as string | null) || null,
          amount:
            rawAmount !== null && rawAmount !== undefined ? Number(rawAmount) : null,
          status:
            typeof rawStatus === "string"
              ? rawStatus
              : isCompleted
                ? "Paid"
                : "Upcoming",
        };
      }),
    [loanDetail.repaymentSchedule],
  );

  const repaymentProgress = useMemo(() => {
    const totalInstallments =
      loanDetail.loanSummary.totalEMI ||
      loanDetail.kfsDetails.numbersOfEMI ||
      normalizedRepaymentSchedule.length;

    const paidInstallments =
      loanDetail.loanSummary.paidEMI ||
      normalizedRepaymentSchedule.filter((item) =>
        item.status.toLowerCase().includes("paid"),
      ).length;

    return {
      totalInstallments,
      paidInstallments,
      pendingInstallments:
        totalInstallments > paidInstallments
          ? totalInstallments - paidInstallments
          : 0,
    };
  }, [
    loanDetail.kfsDetails.numbersOfEMI,
    loanDetail.loanSummary.paidEMI,
    loanDetail.loanSummary.totalEMI,
    normalizedRepaymentSchedule,
  ]);

  const getStatusClassName = (status: string): string => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus.includes("complete") ||
      normalizedStatus.includes("paid") ||
      normalizedStatus.includes("verified") ||
      normalizedStatus.includes("generated")
    ) {
      return "greenLine";
    }

    if (
      normalizedStatus.includes("review") ||
      normalizedStatus.includes("current") ||
      normalizedStatus.includes("upcoming") ||
      normalizedStatus.includes("progress")
    ) {
      return "orangeLine";
    }

    if (
      normalizedStatus.includes("pending") ||
      normalizedStatus.includes("due") ||
      normalizedStatus.includes("lock")
    ) {
      return "redLine";
    }

    return "grayLine";
  };

  const resetActionForm = (): void => {
    const defaultLoanAmount = String(loanDetail.kfsDetails.totalLoanAmount || "");

    setActionFormValues(
      getInitialActionStatusFormValues(
        defaultLoanAmount,
        defaultLoanAmount,
      ),
    );

    setActionFormErrors(initialActionStatusFormErrors);
    setIsActionFormSubmitted(false);
    setActionFileInputKey((prev) => prev + 1);
  };

  const handleCloseActionStatusDialog = (): void => {
    setShowActionStatusDialog(false);
    setSelectedActionStatusId(null);
    resetActionForm();
  };

  const selectedActionStatus = useMemo<IActionCenterStatus | null>(
    () =>
      loanDetail.actionCenter.find(
        (status) => status.statusId === selectedActionStatusId,
      ) || null,
    [loanDetail.actionCenter, selectedActionStatusId],
  );

  const isFileUploadVisible = (
    statusId?: number | null,
    statusName?: string | null,
  ): boolean => {
    if (isRejectedActionStatus(statusId, statusName)) {
      return false;
    }

    return fileUploadVisibleStatusIds.includes(statusId as number);
  };

  const isFileRequired = (
    statusId?: number | null,
    statusName?: string | null,
  ): boolean =>
    !isRejectedActionStatus(statusId, statusName) &&
    fileRequiredStatusIds.includes(statusId as number);

  const getDocumentTypeOptionsForStatus = (
    statusId?: number | null,
  ): { label: string; value: number }[] => {
    const allowedDocumentTypes = documentTypeOptionsByStatus[statusId as number];

    if (!allowedDocumentTypes?.length) {
      return documentTypeOptions;
    }

    return documentTypeOptions.filter((option) =>
      allowedDocumentTypes.includes(option.value),
    );
  };

  const getDefaultDocumentTypeId = (statusId?: number | null): number | null =>
    getDocumentTypeOptionsForStatus(statusId)[0]?.value ?? null;

  const getFileAcceptValue = (
    statusId?: number | null,
    statusName?: string | null,
  ): string =>
    pdfOnlyFileStatusIds.includes(statusId as number)
      ? PDF_FILE_ACCEPT
      : allowedSupportingDocumentExtensions.join(",");

  const getFileUploadLabel = (statusId?: number | null): string => {
    switch (statusId) {
      case NBFC_ACTION_STATUS.LOAN_QUERY_RAISED:
        return "Document";
      case NBFC_ACTION_STATUS.SANCTIONED:
        return "Sanction Letter";
      case NBFC_ACTION_STATUS.AGREEMENT_SIGNED:
        return "Signed Agreement";
      default:
        return "Document";
    }
  };

  const getFileUploadPlaceholder = (statusId?: number | null): string => {
    switch (statusId) {
      case NBFC_ACTION_STATUS.LOAN_QUERY_RAISED:
        return "Click to upload document";
      case NBFC_ACTION_STATUS.SANCTIONED:
        return "Click to upload sanction letter";
      case NBFC_ACTION_STATUS.AGREEMENT_SIGNED:
        return "Click to upload signed agreement";
      default:
        return "Click to upload document";
    }
  };

  const getFileUploadHelpText = (statusId?: number | null): string =>
    pdfOnlyFileStatusIds.includes(statusId as number)
      ? "PDF files only (Max 5MB)"
      : "PDF, JPG, PNG, DOC, DOCX (Max 5MB)";

  const getCommentLabel = (
    statusId?: number | null,
    statusName?: string | null,
  ): string => {
    if (isRejectedActionStatus(statusId, statusName)) {
      return "Rejected comments";
    }

    switch (statusId) {
      case NBFC_ACTION_STATUS.LOAN_QUERY_RAISED:
        return "Query Remarks";
      default:
        return "Comments";
    }
  };

  const getCommentPlaceholder = (
    statusId?: number | null,
    statusName?: string | null,
  ): string => {
    if (isRejectedActionStatus(statusId, statusName)) {
      return "Enter rejected comments";
    }

    switch (statusId) {
      case NBFC_ACTION_STATUS.LOAN_QUERY_RAISED:
        return "Enter query remarks";
      case NBFC_ACTION_STATUS.SANCTIONED:
        return "Enter sanction comments";
      case NBFC_ACTION_STATUS.DISBURSED:
        return "Enter disbursed comments";
      default:
        return "Enter comments";
    }
  };

  const getRequiredCommentMessage = (
    statusId?: number | null,
    statusName?: string | null,
  ): string => {
    if (isRejectedActionStatus(statusId, statusName)) {
      return "Please enter rejected comments.";
    }

    switch (statusId) {
      case NBFC_ACTION_STATUS.LOAN_QUERY_RAISED:
        return "Please enter query remarks.";
      default:
        return "Please enter comments.";
    }
  };

  const validateSelectedFile = (
    file: File,
    statusId?: number | null,
  ): string => {
    const fileName = file.name.toLowerCase();

    if (pdfOnlyFileStatusIds.includes(statusId as number)) {
      return isPdfFile(file)
        ? ""
        : "Please upload a PDF document.";
    }

    const hasValidExtension = allowedSupportingDocumentExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    return hasValidExtension
      ? ""
      : "Please upload a PDF, image, DOC, or DOCX file.";
  };

  const validateActionStatusForm = (
    formValues: ActionStatusFormValues = actionFormValues,
  ): ActionStatusFormErrors => {
    const nextErrors: ActionStatusFormErrors = {
      ...initialActionStatusFormErrors,
    };

    nextErrors.comments = formValues.comments.trim()
      ? ""
      : getRequiredCommentMessage(
        selectedActionStatusId,
        selectedActionStatus?.statusName,
      );

    if (!isRejectedActionStatus(selectedActionStatusId, selectedActionStatus?.statusName)) {
      switch (selectedActionStatusId) {
        case NBFC_ACTION_STATUS.SANCTIONED:
          nextErrors.sanctionedDate = formValues.sanctionedDate
            ? ""
            : "Please select the sanctioned date.";
          break;
        case NBFC_ACTION_STATUS.AGREEMENT_SIGNED:
          nextErrors.file = formValues.file
            ? validateSelectedFile(formValues.file, selectedActionStatusId)
            : "Please upload the signed agreement.";
          break;
        case NBFC_ACTION_STATUS.DISBURSED:
          if (!formValues.utrNumber.trim()) {
            nextErrors.utrNumber = "Please enter the UTR number.";
          } else if (!UTR_CODE_PATTERN.test(formValues.utrNumber.trim())) {
            nextErrors.utrNumber =
              "Enter a 12–22 character UTR using uppercase letters and numbers only.";
          }
          nextErrors.disbursedDate = formValues.disbursedDate
            ? ""
            : "Please select the disbursed date.";
          break;
        default:
          break;
      }
    }

    if (
      formValues.file &&
      !nextErrors.file &&
      isFileUploadVisible(selectedActionStatusId, selectedActionStatus?.statusName)
    ) {
      nextErrors.file = validateSelectedFile(
        formValues.file,
        selectedActionStatusId,
      );
    }

    if (formValues.file && isFileUploadVisible(
      selectedActionStatusId,
      selectedActionStatus?.statusName
    )) {
      if (!formValues.documentTypeId) {
        nextErrors.documentTypeId = "Please select a document type.";
      }

      if (!nextErrors.file) {
        nextErrors.file = validateSelectedFile(
          formValues.file,
          selectedActionStatusId
        );
      }
    }

    return nextErrors;
  };

  const handleActionFormFieldChange = (
    field: Exclude<keyof ActionStatusFormValues, "file">,
    value: string,
  ): void => {
    const nextFormValues: ActionStatusFormValues = {
      ...actionFormValues,
      [field]: value,
    };

    setActionFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (!isActionFormSubmitted) {
      return;
    }

    setActionFormErrors(validateActionStatusForm(nextFormValues));
  };

  const handleDocumentTypeChange = (value: number | null): void => {
    const nextFormValues: ActionStatusFormValues = {
      ...actionFormValues,
      documentTypeId: value,
    };

    setActionFormValues((prev) => ({
      ...prev,
      documentTypeId: value,
    }));

    if (!isActionFormSubmitted) {
      return;
    }

    setActionFormErrors(validateActionStatusForm(nextFormValues));
  };

  const handleActionFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      const nextFormValues: ActionStatusFormValues = {
        ...actionFormValues,
        file: null,
      };

      setActionFormValues((prev) => ({
        ...prev,
        file: null,
      }));

      if (isActionFormSubmitted) {
        setActionFormErrors(validateActionStatusForm(nextFormValues));
      } else {
        setActionFormErrors((prev) => ({
          ...prev,
          file: "",
        }));
      }
      return;
    }

    if (selectedFile.size > maxSupportingDocumentSizeInBytes) {
      const nextFormValues: ActionStatusFormValues = {
        ...actionFormValues,
        file: null,
      };

      setActionFormValues((prev) => ({
        ...prev,
        file: null,
      }));

      setActionFormErrors((prev) => ({
        ...prev,
        file: "File size should not exceed 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    const nextFormValues: ActionStatusFormValues = {
      ...actionFormValues,
      file: selectedFile,
    };

    setActionFormValues((prev) => ({
      ...prev,
      file: selectedFile,
    }));

    if (isActionFormSubmitted) {
      setActionFormErrors(validateActionStatusForm(nextFormValues));
      return;
    }

    setActionFormErrors((prev) => ({
      ...prev,
      file: validateSelectedFile(selectedFile, selectedActionStatusId),
    }));
  };

  const submitLoanStatus = async (
    statusId: number,
    shouldValidateForm: boolean,
  ): Promise<void> => {
    if (!id || !statusId) {
      toastError("Please select a status to continue.");
      return;
    }

    if (shouldValidateForm) {
      setIsActionFormSubmitted(true);

      const nextErrors = validateActionStatusForm();
      setActionFormErrors(nextErrors);

      if (!IsFormValid(nextErrors)) {
        return;
      }
    }

    const payload = new FormData();

    payload.append("loanApplicationID", id);

    payload.append("statusID", String(statusId));

    if (statusId === NBFC_ACTION_STATUS.SANCTIONED) {
      if (actionFormValues.sanctionedDate) {
        payload.append("sanctionedDate", actionFormValues.sanctionedDate);
      }

      if (actionFormValues.sanctionedAmount.trim()) {
        payload.append("sanctionedAmount", actionFormValues.sanctionedAmount.trim());
      }
    }

    if (statusId === NBFC_ACTION_STATUS.DISBURSED) {
      if (actionFormValues.disbursedDate) {
        payload.append("disbursedDate", actionFormValues.disbursedDate);
      }

      if (actionFormValues.disbursedAmount.trim()) {
        payload.append("disbursedAmount", actionFormValues.disbursedAmount.trim());
      }

      if (actionFormValues.utrNumber.trim()) {
        payload.append("utrNumber", actionFormValues.utrNumber.trim());
      }
    }

    if (actionFormValues.comments.trim()) {
      payload.append("comments", actionFormValues.comments.trim());
    }

    if (
      isRejectedActionStatus(statusId, selectedActionStatus?.statusName) &&
      actionFormValues.comments.trim()
    ) {
      payload.append("rejectionReason", actionFormValues.comments.trim());
    }

    if (actionFormValues.file) {
      payload.append("File", actionFormValues.file);

      if (actionFormValues.documentTypeId) {
        payload.append(
          "documentTypeID",
          String(actionFormValues.documentTypeId)
        );
      }
    }

    // Close first so the user immediately sees the global progress indicator.
    handleCloseActionStatusDialog();
    setLoading(true);

    try {
      const response = await updateEducationLoanStatusAPI(payload);

      if (!response) {
        return;
      }

      if (response.statusCode === 200) {
        toastSuccess(response.message);
        await fetchLoanDetail();
      } else {
        toastError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActionStatus = async (
    statusId: number,
    statusName?: string | null,
  ): Promise<void> => {
    setSelectedActionStatusId(statusId);
    resetActionForm();
    const defaultLoanAmount = String(loanDetail.kfsDetails.totalLoanAmount || "");

    setActionFormValues({
      ...getInitialActionStatusFormValues(
        defaultLoanAmount,
        defaultLoanAmount,
      ),
      documentTypeId: getDefaultDocumentTypeId(statusId),
    });

    if (isSimpleActionStatus(statusId, statusName)) {
      await submitLoanStatus(statusId, false);
      return;
    }

    setShowActionStatusDialog(true);
  };

  const handleUpdateLoanStatus = async (): Promise<void> => {
    if (!selectedActionStatusId) {
      toastError("Please select a status to continue.");
      return;
    }

    await submitLoanStatus(selectedActionStatusId, true);
  };

  const renderDetailField = (label: string, value: React.ReactNode): JSX.Element => (
    <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
      <b>{label}</b>
      <p className="text-break mb-0">{value || "-"}</p>
    </div>
  );

  const renderSummaryList = (
    items: { label: string; value: React.ReactNode; highlight?: boolean }[],
  ): JSX.Element => (
    <div className="nbfc-student-application-detail__stack">
      {items.map((item) => (
        <div
          key={item.label}
          className="nbfc-student-application-detail__summary-row"
        >
          <span>{item.label}</span>
          <strong
            className={
              item.highlight
                ? "nbfc-student-application-detail__summary-value--highlight"
                : ""
            }
          >
            {item.value || "-"}
          </strong>
        </div>
      ))}
    </div>
  );

  const renderDocumentSection = (
    documents: NormalizedDocument[],
    emptyMessage: string,
  ): JSX.Element =>
    documents.length > 0 ? (
      <div className="nbfc-student-application-detail__stack">
        {documents.map((document) => (
          <div
            key={document.id}
            className="nbfc-student-application-detail__document-item"
          >
            <div className="nbfc-student-application-detail__document-copy">
              <div className="nbfc-student-application-detail__document-icon">
                <i className="pi pi-file" />
              </div>
              <div>
                <strong>{document.name}</strong>
                <span>
                  {document.type}
                  {document.uploadedDate
                    ? ` • ${formatDisplayDate(document.uploadedDate)}`
                    : ""}
                </span>
              </div>
            </div>

            <Button
              className="btn btn-black-line"
              onClick={() => openDocumentFile(document.path)}
            >
              View
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <div className="nbfc-student-application-detail__empty-state">
        {emptyMessage}
      </div>
    );

  const renderStudentSection = (studentDetail: INBFCStudentDetail): JSX.Element => (
    <div className="borderBoxHldr p-24">
      <div className="row">
        {renderDetailField("Name", studentDetail.name || "-")}

        {renderDetailField("Student Code", studentDetail.studentCode || "-")}

        {renderDetailField(
          "Application Code",
          studentDetail.loanApplicationCode || "-",
        )}

        {renderDetailField("Course", studentDetail.courseName || "-")}

        {renderDetailField("Institute", studentDetail.instituteTradeName ? decryptVAPTData(studentDetail.instituteTradeName) ? studentDetail.instituteName : "-" : "-")}

        {renderDetailField(
          "Disbursed Date",
          formatDisplayDate(studentDetail.disbursedDate),
        )}

        {renderDetailField("UTR Number", studentDetail.utrNumber || "-")}

        {renderDetailField(
          "Student Photo",
          studentDetail.photo ? (
            <button
              type="button"
              className="nbfc-student-application-detail__link-button"
              onClick={() => openDocumentFile(studentDetail.photo)}
            >
              View Document
            </button>
          ) : (
            "-"
          ),
        )}
      </div>
    </div>
  );

  const renderActivityLog = (activityLog: IActivityLog[]): JSX.Element =>
    activityLog.length > 0 ? (
      <div className="nbfc-student-application-detail__stack">
        {activityLog.map((item: IActivityLog) => (
          <div
            key={item.id}
            className="nbfc-student-application-detail__timeline-item"
          >
            <span className="nbfc-student-application-detail__timeline-dot" />

            <div className="nbfc-student-application-detail__timeline-copy">
              <strong>{item.eventType}</strong>

              <p>{item.eventDescription || "-"}</p>

              <span>{formatDisplayDate(item.eventDate)}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="nbfc-student-application-detail__empty-state">
        No activity log is available for this application yet.
      </div>
    );

  const renderActionCenter = (actionCenter: IActionCenterStatus[]): JSX.Element => {
    return actionCenter.length > 0 ? (
      <div className="nbfc-student-application-detail__stack">
        {actionCenter.map((item, index) => {
          const stateLabel = item.isCompleted
            ? "Completed"
            : "";

          return (
            <div
              key={`${item.statusId}-${item.statusName}`}
              className="nbfc-student-application-detail__action-row"
            >
              <div className="nbfc-student-application-detail__action-copy">
                <div className="nbfc-student-application-detail__action-index">
                  {item.statusId || index + 1}
                </div>

                <div>
                  <strong>{item.statusName || "-"}</strong>
                  <span>
                    {item.statusUpdatedDate
                      ? `Updated ${formatDisplayDate(item.statusUpdatedDate)}`
                      : "Awaiting next action"}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                {!item.isCompleted && (
                  <Button
                    className={
                      selectedActionStatusId === item.statusId
                        ? "btn btn-orange"
                        : "btn btn-black-line"
                    }
                    onClick={() =>
                      handleSelectActionStatus(item.statusId, item.statusName)
                    }
                  >
                    {selectedActionStatusId === item.statusId
                      ? "Selected"
                      : "Take Action"}
                  </Button>
                )}

                <span
                  className={`StatusLabel ${getStatusClassName(stateLabel)}`}
                >
                  {stateLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="nbfc-student-application-detail__empty-state">
        Action center details are not available right now.
      </div>
    );
  };

  const renderActionStatusForm = (): JSX.Element => {
    if (!selectedActionStatus) {
      return (
        <div className="nbfc-student-application-detail__empty-state">
          Status details are not available.
        </div>
      );
    }

    const isReadOnlyStatus = selectedActionStatus.isCompleted;
    const isRejectedStatusSelected = isRejectedActionStatus(
      selectedActionStatusId,
      selectedActionStatus.statusName,
    );
    const showSharedCommentField =
      !isRejectedStatusSelected &&
      selectedActionStatusId !== NBFC_ACTION_STATUS.LOAN_QUERY_RAISED &&
      selectedActionStatusId !== NBFC_ACTION_STATUS.SANCTIONED &&
      selectedActionStatusId !== NBFC_ACTION_STATUS.DISBURSED;
    const availableDocumentTypeOptions = getDocumentTypeOptionsForStatus(
      selectedActionStatusId,
    );
    const isDocumentTypeLocked = availableDocumentTypeOptions.length <= 1;

    return (
      <div className="row">
        {selectedActionStatusId === NBFC_ACTION_STATUS.LOAN_QUERY_RAISED && (
          <>
            <div className="form-group col-12 mb-3">
              <label className="form-label small" htmlFor="loanQueryComment">
                Query Remarks <sup>*</sup>
              </label>

              <InputTextarea
                id="loanQueryComment"
                rows={4}
                autoResize={false}
                className="form-control"
                value={actionFormValues.comments}
                onChange={(e) => handleActionFormFieldChange("comments", e.target.value)}
                disabled={isReadOnlyStatus || loading}
                placeholder="Enter query remarks"
              />

              {isActionFormSubmitted && actionFormErrors.comments && (
                <small className="error">{actionFormErrors.comments}</small>
              )}
            </div>
          </>
        )}

        {selectedActionStatusId === NBFC_ACTION_STATUS.SANCTIONED && (
          <>
            <div className="form-group col-lg-6 col-12 mb-3">
              <label className="form-label small" htmlFor="sanctionedDate">
                Sanctioned Date <sup>*</sup>
              </label>

              <Calendar
                id="sanctionedDate"
                value={
                  actionFormValues.sanctionedDate
                    ? new Date(actionFormValues.sanctionedDate)
                    : null
                }
                onChange={(e) =>
                  handleActionFormFieldChange(
                    "sanctionedDate",
                    e.value instanceof Date ? formatDateForPayload(e.value) : "",
                  )
                }
                maxDate={new Date()}
                showButtonBar
                className="w-100"
                disabled={isReadOnlyStatus || loading}
                placeholder="Select sanctioned date"
              />

              {isActionFormSubmitted && actionFormErrors.sanctionedDate && (
                <small className="error">{actionFormErrors.sanctionedDate}</small>
              )}
            </div>

            <div className="form-group col-lg-6 col-12 mb-3">
              <label className="form-label small" htmlFor="sanctionedAmount">
                Sanctioned Amount
              </label>
              <InputText
                id="sanctionedAmount"
                type="number"
                className="form-control"
                value={actionFormValues.sanctionedAmount}
                onChange={(e) =>
                  handleActionFormFieldChange("sanctionedAmount", e.target.value)
                }
                disabled
                placeholder="Enter sanctioned amount"
              />
            </div>

            <div className="form-group col-12 mb-3">
              <label className="form-label small" htmlFor="sanctionComment">
                {getCommentLabel(selectedActionStatusId)} <sup>*</sup>
              </label>
              <InputTextarea
                id="sanctionComment"
                rows={4}
                autoResize={false}
                className="form-control"
                value={actionFormValues.comments}
                onChange={(e) => handleActionFormFieldChange("comments", e.target.value)}
                disabled={isReadOnlyStatus || loading}
                placeholder={getCommentPlaceholder(selectedActionStatusId)}
              />

              {isActionFormSubmitted && actionFormErrors.comments && (
                <small className="error">{actionFormErrors.comments}</small>
              )}
            </div>
          </>
        )}

        {selectedActionStatusId === NBFC_ACTION_STATUS.DISBURSED && (
          <>
            <div className="form-group col-lg-6 col-12 mb-3">
              <label className="form-label small" htmlFor="utrNumber">
                UTR Number <sup>*</sup>
              </label>
              <InputText
                id="utrNumber"
                className="form-control"
                value={actionFormValues.utrNumber}
                onChange={(e) =>
                  handleActionFormFieldChange(
                    "utrNumber",
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 22),
                  )
                }
                disabled={isReadOnlyStatus || loading}
                placeholder="Enter UTR number"
                maxLength={22}
              />
              {isActionFormSubmitted && actionFormErrors.utrNumber && (
                <small className="error">{actionFormErrors.utrNumber}</small>
              )}
            </div>

            <div className="form-group col-lg-6 col-12 mb-3">
              <label className="form-label small" htmlFor="disbursedDate">
                Disbursed Date <sup>*</sup>
              </label>

              <Calendar
                id="disbursedDate"
                value={
                  actionFormValues.disbursedDate
                    ? new Date(actionFormValues.disbursedDate)
                    : null
                }
                onChange={(e) =>
                  handleActionFormFieldChange(
                    "disbursedDate",
                    e.value instanceof Date ? formatDateForPayload(e.value) : "",
                  )
                }
                maxDate={new Date()}
                showButtonBar
                className="w-100"
                disabled={isReadOnlyStatus || loading}
                placeholder="Select disbursed date"
              />

              {isActionFormSubmitted && actionFormErrors.disbursedDate && (
                <small className="error">{actionFormErrors.disbursedDate}</small>
              )}
            </div>

            <div className="form-group col-lg-6 col-12 mb-3">
              <label className="form-label small" htmlFor="disbursedAmount">
                Disbursed Amount
              </label>
              <InputText
                id="disbursedAmount"
                className="form-control"
                value={actionFormValues.disbursedAmount}
                disabled
                placeholder="Enter disbursed amount"
              />
            </div>

            <div className="form-group col-12 mb-3">
              <label className="form-label small" htmlFor="disbursedComment">
                {getCommentLabel(selectedActionStatusId)} <sup>*</sup>
              </label>
              <InputTextarea
                id="disbursedComment"
                rows={4}
                autoResize={false}
                className="form-control"
                value={actionFormValues.comments}
                onChange={(e) => handleActionFormFieldChange("comments", e.target.value)}
                disabled={isReadOnlyStatus || loading}
                placeholder={getCommentPlaceholder(selectedActionStatusId)}
              />

              {isActionFormSubmitted && actionFormErrors.comments && (
                <small className="error">{actionFormErrors.comments}</small>
              )}
            </div>
          </>
        )}

        {showSharedCommentField && (
          <div className="form-group col-12 mb-3">
            <label className="form-label small" htmlFor="statusComment">
              {getCommentLabel(selectedActionStatusId, selectedActionStatus.statusName)} <sup>*</sup>
            </label>

            <InputTextarea
              id="statusComment"
              rows={4}
              autoResize={false}
              className="form-control"
              value={actionFormValues.comments}
              onChange={(e) =>
                handleActionFormFieldChange("comments", e.target.value)
              }
              disabled={isReadOnlyStatus || loading}
              placeholder={getCommentPlaceholder(selectedActionStatusId, selectedActionStatus.statusName)}
            />

            {isActionFormSubmitted && actionFormErrors.comments && (
              <small className="error">{actionFormErrors.comments}</small>
            )}
          </div>
        )}

        {isRejectedStatusSelected && (
          <div className="form-group col-12 mb-3">
            <label className="form-label small" htmlFor="rejectionComment">
              {getCommentLabel(selectedActionStatusId, selectedActionStatus.statusName)} <sup>*</sup>
            </label>

            <InputTextarea
              id="rejectionComment"
              rows={4}
              autoResize={false}
              className="form-control"
              value={actionFormValues.comments}
              onChange={(e) =>
                handleActionFormFieldChange("comments", e.target.value)
              }
              disabled={isReadOnlyStatus || loading}
              placeholder={getCommentPlaceholder(selectedActionStatusId, selectedActionStatus.statusName)}
            />

            {isActionFormSubmitted && actionFormErrors.comments && (
              <small className="error">{actionFormErrors.comments}</small>
            )}
          </div>
        )}

        {isFileUploadVisible(
          selectedActionStatusId,
          selectedActionStatus.statusName
        ) && (
            <>
              {/* Document Type */}
              <div className="form-group col-12 mb-3">
                <label className="form-label small" htmlFor="documentType">
                  Document Type
                </label>

                <Dropdown
                  id="documentType"
                  value={actionFormValues.documentTypeId}
                  options={availableDocumentTypeOptions}
                  optionLabel="label"
                  optionValue="value"
                  onChange={(e) => handleDocumentTypeChange(e.value)}
                  placeholder="Select document type"
                  className="w-100"
                  disabled={isReadOnlyStatus || loading || isDocumentTypeLocked}
                />

                {isActionFormSubmitted && actionFormErrors.documentTypeId && (
                  <small className="error">{actionFormErrors.documentTypeId}</small>
                )}
              </div>

              {/* File Upload */}
              <div className="form-group col-12 mb-3">
                <label
                  className="form-label small d-block"
                  htmlFor="statusDocument"
                >
                  {getFileUploadLabel(selectedActionStatusId)}

                  {isFileRequired(
                    selectedActionStatusId,
                    selectedActionStatus.statusName
                  ) && <sup>*</sup>}
                </label>

                <label
                  htmlFor="statusDocument"
                  style={{
                    width: "100%",
                    minHeight: "132px",
                    border: "1px dashed #ff6b3d",
                    borderRadius: "8px",
                    backgroundColor: "#f1f3f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor:
                      isReadOnlyStatus || loading
                        ? "not-allowed"
                        : "pointer",
                    opacity: isReadOnlyStatus || loading ? 0.7 : 1,
                    padding: "20px",
                    marginBottom: "0",
                  }}
                >
                  <div>
                    <i
                      className="pi pi-cloud-upload"
                      style={{
                        fontSize: "30px",
                        color: "#ff6b3d",
                        marginBottom: "12px",
                        display: "block",
                      }}
                    />

                    <div
                      style={{
                        color: "#4b5563",
                        fontSize: "14px",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      {getFileUploadPlaceholder(selectedActionStatusId)}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      {getFileUploadHelpText(selectedActionStatusId)}
                    </div>
                  </div>
                </label>

                <InputText
                  key={actionFileInputKey}
                  id="statusDocument"
                  type="file"
                  className="d-none"
                  accept={getFileAcceptValue(
                    selectedActionStatusId,
                    selectedActionStatus.statusName
                  )}
                  onChange={handleActionFileChange}
                  disabled={isReadOnlyStatus || loading}
                />

                {actionFormValues.file && (
                  <small className="text-muted d-block mt-2">
                    {actionFormValues.file.name}
                  </small>
                )}

                {((isActionFormSubmitted && actionFormErrors.file) ||
                  actionFormErrors.file) && (
                    <small className="error">
                      {actionFormErrors.file}
                    </small>
                  )}
              </div>
            </>
          )}

        <div className="col-12 d-flex justify-content-end gap-2 mt-2 flex-wrap">
          <Button
            className="btn btn-black-line"
            onClick={handleCloseActionStatusDialog}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="btn btn-orange"
            onClick={() => void handleUpdateLoanStatus()}
            disabled={loading || isReadOnlyStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    );
  };

  const renderRepaymentSchedule = (
    repaymentSchedule: NormalizedRepaymentSchedule[],
  ): JSX.Element =>
    repaymentSchedule.length > 0 ? (
      <div className="nbfc-student-application-detail__stack">
        {repaymentSchedule.map((item) => (
          <div
            key={item.id}
            className="nbfc-student-application-detail__repayment-row"
          >
            <div className="d-flex flex-column">
              <strong>{item.label}</strong>
              <span>{formatDisplayDate(item.dueDate)}</span>
            </div>

            <div className="text-end d-flex flex-column">
              <strong>{formatCurrency(item.amount)}</strong>
              <span className={`StatusLabel ${getStatusClassName(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="nbfc-student-application-detail__empty-state">
        Repayment schedule is not available yet.
      </div>
    );

  const loanSummary = loanDetail.loanSummary as ILoanSummary;

  const kfsDetails = loanDetail.kfsDetails as IKFSDetails;

  return (
    <div className="whiteBoxHldr p-24 nbfc-student-application-detail-page">
      <Loader isLoading={loading} />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="mb-1 nbfc-student-application-detail__title">
            Student Application Detail
          </h2>
          <p className="mb-0 nbfc-student-application-detail__subtitle">
            Review the student profile, loan structure, documents, and repayment
            timeline for this Lender application.
          </p>
        </div>

        <Button className="btn btn-black-line" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <section>
        {renderStudentSection(loanDetail.studentDetail)}
      </section>

      <div className="row g-4 mt-1">
        <div className="col-xl-6 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Loan Summary</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  Core loan amount, EMI, and repayment health summary.
                </p>
              </div>
            </div>

            {renderSummaryList([
              {
                label: "Loan Amount",
                value: formatCurrency(loanSummary.loanAmount),
              },
              {
                label: "Interest Rate",
                value:
                  loanSummary.interestRate !== null
                    ? `${loanSummary.interestRate}%`
                    : "-",
              },
              {
                label: "EMI Amount",
                value: formatCurrency(loanSummary.emiAmount),
                highlight: true,
              },
              {
                label: "eNACH Mandate",
                value: loanSummary.enachMandate ? "Registered" : "Pending",
              },
              {
                label: "Installments Paid",
                value: `${repaymentProgress.paidInstallments} / ${repaymentProgress.totalInstallments}`,
              },
              {
                label: "Outstanding Amount",
                value: formatCurrency(loanSummary.outstandingAmount),
              },
            ])}
          </section>
        </div>

        <div className="col-xl-6 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Key Fact Statement (KFS)</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  Sanction structure and borrower-facing repayment facts.
                </p>
              </div>
            </div>

            {renderSummaryList([
              {
                label: "Agreed Fee",
                value: formatCurrency(kfsDetails.agreedFee),
              },
              {
                label: "Discount Amount",
                value: formatCurrency(kfsDetails.discountAmount),
              },
              {
                label: "Down Payment",
                value: formatCurrency(kfsDetails.downPayment),
              },
              {
                label: "Total Loan Amount",
                value: formatCurrency(kfsDetails.totalLoanAmount),
              },
              {
                label: "Number of EMI",
                value: `${kfsDetails.numbersOfEMI} months` || "-",
              },
              {
                label: "Advanced EMI",
                value: `${kfsDetails.advancedEMI} months` || "-",
              },
              {
                label: "Remaining EMI",
                value: `${kfsDetails.remainingEMI} months` || "-",
              },
              {
                label: "EMI Amount",
                value: formatCurrency(kfsDetails.emiAmount),
                highlight: true,
              },
            ])}
          </section>
        </div>

        <div className="col-xl-6 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Document Center</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  Generated and application-linked loan documents available for review.
                </p>
              </div>
            </div>

            {renderDocumentSection(
              normalizedLoanDocuments,
              "No loan documents are available for this application yet.",
            )}
          </section>
        </div>

        <div className="col-xl-6 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Documents Uploaded by Institute</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  Supporting files submitted by the institute during processing.
                </p>
              </div>
            </div>

            {renderDocumentSection(
              normalizedInstituteDocuments,
              "No institute documents have been uploaded yet.",
            )}
          </section>
        </div>
      </div>

      <section className="admin-dashboard-panel mt-4">
        <div className="admin-dashboard-section-head">
          <div>
            <h5 className="mb-1">Action Center</h5>
            <p className="admin-dashboard-section-copy mb-0">
              Current lifecycle steps and the latest action status for this loan.
            </p>
          </div>
        </div>

        {renderActionCenter(loanDetail.actionCenter)}
      </section>

      <div className="row g-4 mt-1">
        <div className="col-xl-7 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Repayment Schedule</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  Installment-wise due dates, amounts, and repayment status.
                </p>
              </div>
            </div>

            {renderRepaymentSchedule(normalizedRepaymentSchedule)}
          </section>
        </div>

        <div className="col-xl-5 col-12">
          <section className="admin-dashboard-panel h-100">
            <div className="admin-dashboard-section-head">
              <div>
                <h5 className="mb-1">Activity Log</h5>
                <p className="admin-dashboard-section-copy mb-0">
                  A chronological view of the latest loan events and user actions.
                </p>
              </div>
            </div>

            {renderActivityLog(loanDetail.activityLog)}
          </section>
        </div>
      </div>

      <Dialog
        visible={showActionStatusDialog}
        header={selectedActionStatus?.statusName || "Update Loan Status"}
        onHide={handleCloseActionStatusDialog}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "720px" }}
      >
        {renderActionStatusForm()}
      </Dialog>
    </div>
  );
};

export default StudentApplicationDetail;

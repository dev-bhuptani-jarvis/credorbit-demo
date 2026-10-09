import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import {
  BankDocumentGroup,
  IInstitutionListResponse,
  InstitutionList,
  IReUploadedDocumentResponse,
  IUploadBankDocumentResponse,
  IUploadedBankDocumentDetails,
  IUploadedDocument,
  UploadRequestBody,
} from "../../../interface/bankDetail";
import {
  deleteReuploadLoanDocumentAPI,
  fetchUploadedBankDocumentsAPI,
  getBankDetailsAPI,
  getInstitutionList,
  isProceedForCamReportForEducationalInstituteAPI,
  uploadBankStatementFilesEducationalInstituteAPI,
  validateBankStatementFilesAPI,
} from "../../../utils/axios/apiServices";
import {
  getApiErrorMessage,
  getFetchEligibilityStatus,
  handleViewDocument,
  MAX_FILE_UPLOAD_NOTE,
  MAX_FILE_UPLOAD_SIZE_BYTES,
  showGlobalReportModal,
  toastErrorWithExtraTime,
  toastSuccessWithExtraTime,
} from "../../../utils/functions/shared";
import Loader from "../../../components/Loader";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { APIResponseEntity } from "../../../interface/apiResponse";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import TableTitle from "../../../components/TableTitle";
import { useLocation, useNavigate } from "react-router-dom";
import ModalLoader from "../../../components/ModalLoader";
import {
  ReportType,
  ReportTypeSignalR
} from "../../../utils/constants/enum";
import ReFetchModal from "../../../components/ReFetchModal";
import {
  IIsProceedForCamReportEntity,
  IIsProceedForCamReportResponse,
  IIsProceedForGeneratingReport,
  IIsProceedForReportEntity
} from "../../../interface/wallet";
import { Tooltip } from "primereact/tooltip";
import { IsNullOrEmptyArray } from "../../../utils/functions/nullCheck";

interface IWrongUserDialog {
  modal: boolean;
  message: string;
}

const BANK_STATEMENT_FILE_ACCEPT = ".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed";

const isBankStatementFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".pdf") || fileName.endsWith(".zip");
};

export interface INextStepProps {
  nextStep?: () => void;
  prevStep?: () => void;
}

const BankDetails = ({ prevStep }: INextStepProps) => {
  const [institutionList, setInstitutionList] = useState<InstitutionList[]>([]);

  const [selectedInstitutionID, setSelectedInstitutionID] = useState<
    number | undefined
  >(undefined);

  const [uploadedBanksDocument, setUploadedBanksDocument] = useState<
    IUploadedBankDocumentDetails[]
  >([]);

  const [finalBanksDocument, setFinalBanksDocument] = useState<
    IUploadedBankDocumentDetails[]
  >([]);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const [showPrevDocs, setShowPrevDocs] = useState<boolean>(false);

  const [bankNameList, setBankNameList] = useState<
    { bankName: string; bankID: number }[]
  >([]);

  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  const [showReUploadModal, setShowReUploadModal] = useState<boolean>(false);

  const [isReuploading, setIsReuploading] = useState<boolean>(false);

  const [reUploadDocumentID, setReUploadDocumentID] = useState<string>("");

  const [passwordValue, setPasswordValue] = useState<string>("");

  const [passwordID, setPasswordID] = useState<string>("");

  const [wrongUserDialog, setWrongUserDialog] = useState<IWrongUserDialog>({
    modal: false,
    message: "",
  });

  const [stateKey, setStateKey] = useState<number>(0);

  const [uploadDocs, setUploadDocs] = useState<boolean>(false);

  const [checkEligibilityBtn, setCheckEligibilityBtn] =
    useState<boolean>(false);

  const [validAllDocument, setValidAllDocument] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [camReportDetails, setCamReportDetails] = useState<
    IIsProceedForReportEntity[]
  >([]);

  const [cAMReportPopUp, setCAMReportPopUp] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [bankingLastReportDate, setBankingLastReportDate] = useState<number>(0);

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const { state } = useLocation();

  const locationState = state as any;
  const studentID = locationState?.studentID || "";

  const isBankingReportRequired: boolean = locationState?.isBankingReportRequired !== false;

  const navigate = useNavigate();

  const handleDropFileUpload = async (
    event: React.DragEvent<HTMLDivElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!event.dataTransfer.files || event.dataTransfer.files.length === 0) {
      toastErrorWithExtraTime("No file dropped");
      return;
    }

    const fakeEvent = {
      target: {
        files: event.dataTransfer.files,
        value: "",
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await handleFileUpload(fakeEvent);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setLoading(true);

    if (!selectedInstitutionID) {
      toastErrorWithExtraTime("Please select a bank");
      setLoading(false);
      event.target.value = "";
      return;
    }

    const files = event.target.files;

    if (!files || files.length === 0) {
      toastErrorWithExtraTime("No file selected");
      setLoading(false);
      event.target.value = "";
      return;
    }

    let zipFile = null;

    const pdfFiles: File[] = [];

    for (const file of Array.from(files)) {
      if (file?.name?.toLowerCase()?.endsWith(".zip")) {
        if (zipFile) {
          toastErrorWithExtraTime("Only one ZIP file can be uploaded");
          setLoading(false);
          event.target.value = "";
          return;
        }
        zipFile = file;
      } else if (file?.name?.toLowerCase()?.endsWith(".pdf")) {
        pdfFiles.push(file);
      } else {
        toastErrorWithExtraTime(
          "Invalid file type. Only ZIP or PDF files are allowed",
        );
        setLoading(false);
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_UPLOAD_SIZE_BYTES) {
        toastErrorWithExtraTime(
          `File ${file.name} exceeds the ${MAX_FILE_UPLOAD_NOTE.replace("Max ", "")} limit.`,
        );
        setLoading(false);
        event.target.value = "";
        return;
      }
    }

    const formData: FormData = new FormData();

    if (zipFile) {
      formData.append("files", zipFile);
    } else {
      pdfFiles.forEach((pdf) => formData.append("files", pdf));
    }

    formData.append("bankID", String(selectedInstitutionID));

    formData.append("studentID", studentID);

    try {
      const response: IUploadBankDocumentResponse =
        await getBankDetailsAPI(formData);

      if (!response) return;

      if (response.statusCode === 200) {
        const uploadedDocument: IUploadedDocument[] =
          response.data.uploadedFiles;

        const selectedBank: InstitutionList | undefined = institutionList.find(
          (bank) => bank.institutionID === selectedInstitutionID,
        );

        if (!selectedBank) {
          toastErrorWithExtraTime("Selected bank not found.");
          setLoading(false);
          event.target.value = "";
          return;
        }

        const updatedDocuments = uploadedDocument.map(
          (doc: IUploadedBankDocumentDetails) => {
            const errorMessages: string[] = [];

            if (doc.isScannedPdf)
              errorMessages.push("Please upload a digital PDF");
            if (doc.hasPasswordIssue)
              errorMessages.push("Password is required");
            if (!doc.isValidPdf) errorMessages.push("PDF file is invalid");

            return {
              ...doc,
              bankName: selectedBank.bankName,
              valid: errorMessages.length === 0,
              message:
                errorMessages.length > 0 ? errorMessages.join(", ") : null,
            };
          },
        );

        setUploadedBanksDocument(updatedDocuments);

        setSelectedBankIndex(selectedInstitutionID);

        if (
          uploadedDocument.some(
            (doc: IUploadedBankDocumentDetails) => doc.isScannedPdf,
          )
        ) {
          toastErrorWithExtraTime(
            "The files you have uploaded are having scanned PDFs, Please upload digital PDFs",
          );
        }
      } else {
        toastErrorWithExtraTime(getApiErrorMessage(response.message));
      }

      setLoading(false);
      setUploadDocs(true);
      event.target.value = "";
    } catch (error) {
      setLoading(false);
      event.target.value = "";
    }
  };

  const fetchInstitutionList = async (): Promise<InstitutionList[]> => {
    const response: IInstitutionListResponse = await getInstitutionList();

    if (!response) return [];

    if (response && response.statusCode === 200) {
      setInstitutionList(response.data);
      return response.data;
    } else {
      toastErrorWithExtraTime(getApiErrorMessage(response.message));
      return [];
    }
  };

  const updatedBankTemplate = (
    rowData: IUploadedBankDocumentDetails,
  ): JSX.Element => {
    const viewTooltipId = `view-loan-application-${rowData.id}`;

    return (
      <>
        <Tooltip target={`#${viewTooltipId}`} position="top" />
        <Button
          className="trash-icon p-0 ms-2"
          id={viewTooltipId}
          data-pr-tooltip="View Bank Document"
          onClick={() => handleViewDocument(rowData.filePath)}
        >
          <i className="icon-eye" />
        </Button>
      </>
    );
  };

  const handleWrongUserInfo = (message: string): void => {
    setWrongUserDialog({ modal: true, message });
  };

  const handlePreviousNavigation = (): void => {
    if (prevStep) {
      prevStep();
      return;
    }

    if (locationState?.previousRoute === "credit-score") {
      navigate(RoutePathConstant.private.educationStudentConsentVerification, {
        state: {
          loanApplicationId: locationState?.loanApplicationId,
          studentID: locationState?.studentID,
          studentName:
            locationState?.selectedStudent?.fullName ||
            locationState?.selectedStudent?.name ||
            locationState?.studentName ||
            "",
          selectedStudent: locationState?.selectedStudent || null,
        },
      });
      return;
    }

    navigate(
      `${RoutePathConstant.private.educationStudentDetail360View}/${locationState?.studentID}`,
      {
        state: {
          selectedDraftId: locationState?.loanApplicationId,
          loanApplicationId: locationState?.loanApplicationId,
          studentID: locationState?.studentID,
          studentName:
            locationState?.selectedStudent?.fullName ||
            locationState?.selectedStudent?.name ||
            locationState?.studentName ||
            "",
          selectedStudent: locationState?.selectedStudent || null,
        },
      },
    );
    return;
  };

  const handleUpload = async (): Promise<void> => {
    setLoading(true);

    const checkResponse = await isProceedForCamReportForEducationalInstituteAPI(
      ReportTypeSignalR.BankingReportCompleted,
      studentID,
      locationState?.loanApplicationId,
    )

    if (!checkResponse) return;

    if (checkResponse && checkResponse.statusCode === 200) {
      const data = checkResponse.data as IIsProceedForGeneratingReport;

      if (data.isInProgress) {
        toastErrorWithExtraTime(getApiErrorMessage(checkResponse.message));
        setLoading(false);
        return;
      }

      setLoading(false);

      const groupedDocuments = finalBanksDocument.reduce(
        (acc: BankDocumentGroup[], doc) => {
          const existingBank = acc.find((item) => item.bankID === doc.bankID);

          const documentObject = {
            fileName: doc.fileName,
            id: doc.id,
            password: doc.password || "",
          };

          if (existingBank) {
            existingBank.UploadedDocumentsList.push(documentObject);
          } else {
            acc.push({
              bankID: doc.bankID,
              UploadedDocumentsList: [documentObject],
            });
          }

          return acc;
        },
        [],
      );

      setReportLoading(true);

      const body: UploadRequestBody = {
        UploadedDocumentObjectList: groupedDocuments,
        studentID,
      };

      const response: APIResponseEntity = await uploadBankStatementFilesEducationalInstituteAPI(body);

      if (!response) return;

      if (response?.statusCode === 200) {
        setCheckEligibilityBtn(true);
        showGlobalReportModal(getApiErrorMessage(response?.message), "Banking Report Update");
      } else if (response?.statusCode === 409) {
        handleWrongUserInfo(getApiErrorMessage(response?.message));
      } else {
        showGlobalReportModal(getApiErrorMessage(response?.message), "Banking Report Update");
      }

      setReportLoading(false);
    }

    setLoading(false);
  };

  const handleCheckEligibility = async () => {
    setReportLoading(true);

    const response: IIsProceedForCamReportResponse = await isProceedForCamReportForEducationalInstituteAPI(
      undefined,
      studentID,
      locationState?.loanApplicationId,
    )

    if (!response) return;

    if (response?.statusCode === 200) {
      const data = response?.data as IIsProceedForCamReportEntity;

      if (!data.isProceedForCamReport && !IsNullOrEmptyArray(data.reports)) {
        setCAMReportPopUp(true);
        setCamReportDetails(data.reports);
      } else if (
        !data.isProceedForCamReport &&
        IsNullOrEmptyArray(data.reports)
      ) {
        setCamReportDetails([]);
        toastErrorWithExtraTime(getApiErrorMessage(response?.message));
      } else if (data.isProceedForCamReport) {
        setCamReportDetails([]);

        navigate(RoutePathConstant.private.loanMarketPlaceForEducationInstitute, {
          state: {
            loanApplicationId: locationState?.loanApplicationId,
            loanApplicationID: locationState?.loanApplicationId,
            studentID: locationState?.studentID,
            studentName:
              locationState?.selectedStudent?.fullName ||
              locationState?.selectedStudent?.name ||
              locationState?.studentName ||
              "",
            selectedStudent: locationState?.selectedStudent || null,
            isBankingReportRequired,
            origin: "bank-details",
          },
        });
      } else {
        setCamReportDetails([]);
        toastErrorWithExtraTime(getApiErrorMessage(response?.message));
      }
    } else {
      toastErrorWithExtraTime(getApiErrorMessage(response?.message));
    }
    setReportLoading(false);
  };

  const handleSkipBankingReport = (): void => {
    navigate(RoutePathConstant.private.loanMarketPlaceForEducationInstitute, {
      state: {
        loanApplicationId: locationState?.loanApplicationId,
        loanApplicationID: locationState?.loanApplicationId,
        studentID: locationState?.studentID,
        studentName:
          locationState?.selectedStudent?.fullName ||
          locationState?.selectedStudent?.name ||
          locationState?.studentName ||
          "",
        selectedStudent: locationState?.selectedStudent || null,
        isBankingReportRequired,
        origin: "bank-details",
      },
    });
  };

  const handleDeleteDocument = async (id: string): Promise<void> => {
    setLoading(true);
    const formData = new FormData();

    formData.append("actionType", "1");
    formData.append("id", id);

    const response: APIResponseEntity =
      await deleteReuploadLoanDocumentAPI(formData);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccessWithExtraTime(response.message);

      const updatedDocuments = uploadedBanksDocument.filter(
        (doc) => doc.id !== id,
      );

      const updatedFinalDocuments = finalBanksDocument.filter(
        (doc) => doc.id !== id,
      );

      setUploadedBanksDocument(updatedDocuments);

      setFinalBanksDocument(updatedFinalDocuments);

      const bankIDsWithDocs = new Set(
        updatedDocuments.map((doc) => doc.bankID),
      );

      setBankNameList((prevBankList) =>
        prevBankList.filter((bank) => bankIDsWithDocs.has(bank.bankID)),
      );

      if (updatedDocuments.length === 0) setUploadDocs(false);
    }

    setStateKey((prev) => prev + 1);
    setLoading(false);
  };

  const handlePassword = (id: string): void => {
    setShowPasswordModal(true);
    setPasswordID(id);
  };

  const handleReUploadDocument = (documentID: string) => {
    setReUploadDocumentID(documentID);
    setShowReUploadModal(true);
  };

  const handleReUploadFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (file.size > MAX_FILE_UPLOAD_SIZE_BYTES) {
      toastErrorWithExtraTime(`File size should not exceed ${MAX_FILE_UPLOAD_NOTE.replace("Max ", "")}.`);
      event.target.value = "";
      return;
    }

    if (!isBankStatementFile(file)) {
      toastErrorWithExtraTime("Only PDF or ZIP files are allowed");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("actionType", "2");
    formData.append("file", file);
    formData.append("id", reUploadDocumentID);

    setIsReuploading(true);

    try {
      const response: IReUploadedDocumentResponse =
        await deleteReuploadLoanDocumentAPI(formData);

      if (response && response.statusCode === 200) {
        toastSuccessWithExtraTime(response.message);

      const updatedDocument: IUploadedDocument =
        response.data.reuploadedDocument;

      let errorMessages: string[] = [];

      if (updatedDocument.isScannedPdf)
        errorMessages.push("Please upload a digital PDF");
      if (updatedDocument.hasPasswordIssue)
        errorMessages.push("Password is required");
      if (!updatedDocument.isValidPdf)
        errorMessages.push("PDF file is invalid");

      const updatedDocuments = uploadedBanksDocument.map(
        (doc: IUploadedBankDocumentDetails) => {
          return doc.id === reUploadDocumentID
            ? {
              ...updatedDocument,
              bankName: "",
              valid: errorMessages.length === 0,
              message:
                errorMessages.length > 0 ? errorMessages.join(", ") : null,
            }
            : doc;
        },
      );

      if (updatedDocuments.some((doc) => doc.isScannedPdf)) {
        toastErrorWithExtraTime(
          "The files you have uploaded are having scanned PDFs, Please upload digital PDFs",
        );
      }

        setUploadedBanksDocument([...updatedDocuments]);
        setShowReUploadModal(false);
        setStateKey((prev) => prev + 1);
      } else {
        toastErrorWithExtraTime(getApiErrorMessage(response?.message));
      }
    } catch {
      toastErrorWithExtraTime("Document could not be re-uploaded. Please try again.");
    } finally {
      setIsReuploading(false);
      event.target.value = "";
    }
  };

  const uploadedBankTemplate = (
    rowData: IUploadedBankDocumentDetails,
  ): JSX.Element => {
    const viewId = `view-${rowData.id}`;
    const passwordId = `password-${rowData.id}`;
    const reuploadId = `reupload-${rowData.id}`;
    const deleteId = `delete-${rowData.id}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${passwordId}`} position="top" />
        <Tooltip target={`#${reuploadId}`} position="top" />
        <Tooltip target={`#${deleteId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 ms-2 mb-2"
          data-pr-tooltip="View Document"
          onClick={() => handleViewDocument(rowData.filePath)}
        >
          <i className="icon-eye" />
        </Button>

        {rowData.hasPasswordIssue && (
          <>
            <Button
              id={passwordId}
              className="trash-icon p-0 ms-2"
              data-pr-tooltip="Enter Document Password"
              onClick={() => handlePassword(rowData.id)}
            >
              <img
                src="/assets/images/password-check.svg"
                alt="eye-icon"
                loading="lazy"
              />
            </Button>
          </>
        )}

        <Button
          id={reuploadId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="Reupload Document"
          onClick={() => handleReUploadDocument(rowData.id)}
        >
          <i className="bi bi-cloud-upload" />
        </Button>

        <Button
          id={deleteId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="Delete Document"
          onClick={() => handleDeleteDocument(rowData.id)}
        >
          <i className="bi bi-trash" style={{ fontSize: '22px' }} />
        </Button>
      </>
    );
  };

  const uploadedFinalBankTemplate = (
    rowData: IUploadedBankDocumentDetails,
  ): JSX.Element => {
    const viewId = `final-view-${rowData.id}`;
    const deleteId = `final-delete-${rowData.id}`;

    return (
      <div className="bank-details-file-actions">
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${deleteId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0"
          data-pr-tooltip="View File"
          onClick={() => handleViewDocument(rowData.filePath)}
        >
          <i className="icon-eye" />
        </Button>

        <Button
          id={deleteId}
          className="trash-icon p-0"
          data-pr-tooltip="Delete File"
          onClick={() => handleDeleteDocument(rowData.id)}
        >
          <i className="bi bi-trash" style={{ fontSize: '22px' }} />
        </Button>
      </div>
    );
  };

  const handlePasswordChange = (): void => {
    const updatedDocuments = [...uploadedBanksDocument];
    let selectedDoc = updatedDocuments.find((data) => data.id === passwordID);

    if (selectedDoc) {
      selectedDoc.password = passwordValue;
      selectedDoc.valid = true;
      setUploadedBanksDocument(updatedDocuments);
    }
    setPasswordValue("");
    setShowPassword(false);
    setShowPasswordModal(false);
    setStateKey((prev) => prev + 1);
  };

  const handleRemoveFiles = async () => {
    setLoading(true);

    const updatedBanks = bankNameList.filter(
      (bank) => bank.bankID !== selectedBankIndex,
    );

    const bankDocuments = uploadedBanksDocument.filter(
      (doc) => doc.bankID !== selectedBankIndex,
    );

    for (const doc of uploadedBanksDocument) {
      await handleDeleteDocument(doc.id);
    }

    setBankNameList(updatedBanks);
    setUploadDocs(false);
    setUploadedBanksDocument(bankDocuments);

    setLoading(false);
  };

  const validateBankStatementFilesFunction = async (
    bankDocument: IUploadedBankDocumentDetails[],
  ): Promise<void> => {
    setLoading(true);

    const body = {
      bankId: bankDocument[0].bankID,
      uploadedDocumentsList: bankDocument.map((bankDocument) => {
        return {
          fileName: bankDocument.fileName,
          id: bankDocument.id,
          password: bankDocument.password,
        };
      }),
    };

    const response: any = await validateBankStatementFilesAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      const updatedDocument: IUploadedDocument[] = response.data.uploadedFiles;

      const uploadedDocument = updatedDocument.map((documemt) => {
        let errorMessages: string[] = [];

        if (documemt.isScannedPdf)
          errorMessages.push("Please upload a digital PDF");

        if (documemt.hasPasswordIssue)
          errorMessages.push(
            "Password is wrong, please enter the correct password",
          );

        if (!documemt.isValidPdf) errorMessages.push("PDF file is invalid");

        const originalDoc = bankDocument.find(
          (d) => String(d.id) === String(documemt.id),
        );

        const updatedDocuments = {
          ...documemt,
          bankName: "",
          valid: errorMessages.length === 0,
          message: errorMessages.length > 0 ? errorMessages.join(", ") : null,
          password: originalDoc?.password || "",
        };

        return updatedDocuments;
      });

      setUploadedBanksDocument(uploadedDocument);
      setStateKey((prev) => prev + 1);

      const allValid = uploadedDocument.every((doc) => doc.valid);

      if (allValid) handleNextClick();
    } else {
      toastErrorWithExtraTime(getApiErrorMessage(response.message));
    }

    setLoading(false);
  };

  const handleNextClick = () => {
    setUploadDocs(false);

    const mergedDocuments = [...finalBanksDocument, ...uploadedBanksDocument];

    const sortData = mergedDocuments.sort((a, b) => a.bankID - b.bankID);
    setFinalBanksDocument(sortData);

    setStateKey((prev) => prev + 1);
  };

  const handleAlreadyUploadedDocument = async (
    institutions: InstitutionList[],
  ): Promise<void> => {
    if (!studentID) {
      setShowPrevDocs(false);
      toastErrorWithExtraTime("Student ID is missing.");
      return;
    }

    const response = await fetchUploadedBankDocumentsAPI({ studentID });

    if (!response) {
      setShowPrevDocs(false);
      return;
    }

    if (response?.statusCode === 200) {
      const updatedDocs = response?.data?.uploadedFiles
        ?.filter((docs: any) => docs.bankID !== null)
        ?.map((doc: any) => {
          const bank = institutions.find(
            (b) => b.institutionID === doc.bankID,
          );

          return {
            ...doc,
            bankName: bank ? bank.bankName : "Unknown Bank",
          };
        });

      setFinalBanksDocument(updatedDocs);

      const eligibility = getFetchEligibilityStatus(
        response?.data?.bankingReportDate,
      );

      setBankingLastReportDate(eligibility?.daysLeft);

      setShowPrevDocs(updatedDocs.length > 0 ? true : false);
    } else {
      toastErrorWithExtraTime(getApiErrorMessage(response.message));
    }
  };

  const handleReGenerate = async (): Promise<void> => {
    setLoading(true);

    const checkResponse = await isProceedForCamReportForEducationalInstituteAPI(
      ReportTypeSignalR.BankingReportCompleted,
      studentID,
      locationState?.loanApplicationId
    );

    if (!checkResponse) return;

    if (checkResponse && checkResponse.statusCode === 200) {
      const data = checkResponse.data as IIsProceedForGeneratingReport;

      if (data.isInProgress) {
        toastErrorWithExtraTime(getApiErrorMessage(checkResponse.message));
        setLoading(false);
        return;
      }

      setLoading(false);

      if (bankingLastReportDate < 30) {
        setShowRefetchReport(true);
      } else {
        setShowPrevDocs(false);
        setFinalBanksDocument([]);
        setShowRefetchReport(false);
      }
    }

    setLoading(false);
  };

  const footerContent = (
    <div className="d-flex justify-content-end gap-2 mt-4">
      <Button
        className="btn btn-black-line w-100 text-center"
        data-bs-dismiss="modal"
        label="Back"
        disabled={loading}
        onClick={() => {
          setShowPassword(false);
          setShowPasswordModal(false);
        }}
      />

      <Button
        className={`btn ${loading || !passwordValue ? "btn-orange-disabled" : "btn-orange"
          }  w-100 ms-2 text-center`}
        label="Submit"
        disabled={loading || !passwordValue}
        onClick={handlePasswordChange}
      />
    </div>
  );

  const reuploadfooterContent = () => {
    return (
      <Button
        className="btn btn-black-line w-100 text-center mt-4"
        data-bs-dismiss="modal"
        label="Cancel"
        disabled={loading || isReuploading}
        onClick={() => setShowReUploadModal(false)}
      />
    );
  };

  const documentUploadFooterContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        disabled={loading}
        onClick={handleRemoveFiles}
      >
        Cancel
      </Button>

      <Button
        className={`btn ${loading || validAllDocument
          ? "btn btn-orange-disabled cursor-not-allowed"
          : "btn-orange"
          } w-100 text-center`}
        onClick={() =>
          validateBankStatementFilesFunction(uploadedBanksDocument)
        }
        disabled={loading || validAllDocument}
        label="Upload"
      />
    </div>
  );

  const statusBodyTemplate = (rowData: any): JSX.Element => {
    const getStatusClass = () => {
      switch (rowData.status) {
        case "Completed":
          return "greenLine";
        case "In Progress":
          return "orangeLine";
        case "Pending":
          return "redLine";
        default:
          return "orangeLine";
      }
    };

    return (
      <span className={`StatusLabel ${getStatusClass()}`}>
        {rowData.status}
      </span>
    );
  };

  const footerContentCamReport = (
    <div className="flex justify-content-end mt-3">
      <Button
        className="btn btn-black-line text-center"
        data-bs-dismiss="modal"
        label="Cancel"
        onClick={() => setCAMReportPopUp(false)}
      />
    </div>
  );

  useEffect(() => {
    const initializeBankDetails = async () => {
      setIsInitialLoading(true);

      try {
        const institutions = await fetchInstitutionList();

        if (institutions.length > 0) {
          await handleAlreadyUploadedDocument(institutions);
        } else {
          setShowPrevDocs(false);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeBankDetails();
  }, []);

  useEffect(() => {
    const allDocumentsValid =
      uploadedBanksDocument.length > 0 &&
      uploadedBanksDocument.every(
        (doc: IUploadedBankDocumentDetails) => doc.valid,
      );

    setValidAllDocument(!allDocumentsValid);
  }, [uploadedBanksDocument]);

  useEffect(() => {
    if (uploadedBanksDocument.length > 0 && institutionList.length > 0) {
      const updatedDocs = uploadedBanksDocument.map((doc) => {
        const bank = institutionList.find(
          (b) => b.institutionID === doc.bankID,
        );
        return { ...doc, bankName: bank ? bank.bankName : "Unknown Bank" };
      });

      setUploadedBanksDocument(updatedDocs);
    }
  }, [stateKey]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // This is necessary for some browsers to show a warning dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (state?.triggerEligibility) setCheckEligibilityBtn(true);
  }, [state]);

  return (
    <>
      <Loader isLoading={loading || isInitialLoading} />

      {!isInitialLoading && showPrevDocs && (
        <>
          <div className="col-12 mt-4 d-flex gap-2 text-heading-muted">
            {finalBanksDocument.length > 0 && (
              <div className="col-12">
                <b style={{ fontSize: "1.125em" }}>Uploaded Documents</b>

                <div className="table-responsive mt-3">
                  <DataTable
                    key={stateKey}
                    className="tableMain"
                    value={finalBanksDocument}
                    emptyMessage="No Document found"
                  >
                    <Column
                      header="Sr. No."
                      body={(rowData, options) => options.rowIndex + 1}
                    />

                    <Column field="bankName" header="Bank Name" />

                    <Column field="fileName" header="File Name" />

                    <Column body={updatedBankTemplate} header="Action" />
                  </DataTable>
                </div>
              </div>
            )}
          </div>

          <div className="form-group mt-4 d-flex">
            <Button
              className="btn btn-black-line text-center"
              onClick={handlePreviousNavigation}
              label="Previous"
            />

            <Button
              className="btn btn-orange ms-2 text-center"
              onClick={handleReGenerate}
              label="Re-generate Report"
            />

            {state !== "dashboard" && (
              <Button
                className={`btn ${!showPrevDocs ? "btn-orange-disabled" : "btn-orange"
                  } ms-2 text-center`}
                onClick={handleCheckEligibility}
                disabled={!showPrevDocs}
                label="Check Eligibility"
              />
            )}

            {!isBankingReportRequired && (
              <Button
                className="btn btn-orange ms-2 text-center"
                onClick={handleSkipBankingReport}
                label="Skip"
              />
            )}
          </div>
        </>
      )}

      {!isInitialLoading && !showPrevDocs && (
        <div className="whiteBoxHldr p-24">
          <div className="row text-heading-muted">
            <div className="col-12">
              <div className="col-12 mb-4 titleMainWrapper txt-orange">
                <h2 className="client-welcome">
                  <span>Application for,</span> {locationState?.studentName || "Student"}
                </h2>
              </div>

              <div className="col-12 titleBtnWrapper mt-5">
                <TableTitle title="Bank Details" />
              </div>
              <p className="mt-2 mb-4">
                Start by selecting a bank and uploading its documents. Want to
                add more? Just select another bank and upload its documents too.
              </p>
              <div className="col-12">
                <div className="form-group">
                  <label
                    className="form-label small"
                    htmlFor="institutionSelectSecond"
                  >
                    Bank<sup>*</sup>
                  </label>

                  <Dropdown
                    id="institutionSelectSecond"
                    value={selectedInstitutionID}
                    onChange={(e) => setSelectedInstitutionID(e.value)}
                    options={institutionList
                      .sort((a, b) => a.bankName.localeCompare(b.bankName))
                      .map((institution) => ({
                        label: institution.bankName,
                        value: institution.institutionID,
                      }))}
                    placeholder="Select Bank"
                    filter
                    showClear
                    filterBy="label"
                  />
                </div>

                {selectedInstitutionID && (
                  <div
                    className="uploadFileWrapper"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropFileUpload}
                  >
                    <img
                      src="/assets/images/upload-cloud.svg"
                      alt="upload-icon"
                      loading="lazy"
                    />

                    <p>Upload bank statements for the past 12 months</p>

                    <small className="text-muted">
                      Accepted formats: PDF or a ZIP file containing only PDFs. {MAX_FILE_UPLOAD_NOTE} per file.
                    </small>

                    <label
                      className="btn btn-black-line"
                      htmlFor="documentupload"
                    >
                      Upload File
                    </label>

                    <InputText
                      type="file"
                      id="documentupload"
                      accept=".zip,.pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="d-none"
                    />
                  </div>
                )}

                {finalBanksDocument.length > 0 && (
                  <div className="col-12 mt-4">
                    <b style={{ fontSize: "1.125em" }}>Bank details</b>

                    <div className="table-responsive mt-3">
                      <DataTable
                        key={stateKey}
                        className="tableMain"
                        value={finalBanksDocument}
                        emptyMessage="No Document found"
                        groupRowsBy="bankName"
                        rowGroupMode="rowspan"
                        scrollable
                      >
                        <Column field="bankName" header="Bank Name" />

                        <Column field="fileName" header="Uploaded Files" />

                        <Column
                          body={uploadedFinalBankTemplate}
                          header="Files Action"
                          headerClassName="bank-details-file-actions-column"
                          bodyClassName="bank-details-file-actions-column"
                          style={{ width: "18%" }}
                        />
                      </DataTable>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(finalBanksDocument.length > 0 || !isBankingReportRequired) && (
            <div className="form-group mt-4 d-flex">
              {state !== "dashboard" && (
                <Button
                  className="btn btn-black-line text-center"
                  onClick={handlePreviousNavigation}
                  label="Previous"
                />
              )}

              {finalBanksDocument.length > 0 && (
                <Button
                  className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
                    } ms-2 text-center`}
                  disabled={loading}
                  label="Generate Report"
                  onClick={handleUpload}
                />
              )}

              {state !== "dashboard" && finalBanksDocument.length > 0 && (
                <Button
                  className={`btn ${!checkEligibilityBtn ? "btn-orange-disabled" : "btn-orange"
                    } ms-2 text-center`}
                  onClick={handleCheckEligibility}
                  disabled={!checkEligibilityBtn}
                  label="Check Eligibility"
                />
              )}

              {!isBankingReportRequired && (
                <Button
                  className="btn btn-orange ms-2 text-center"
                  onClick={handleSkipBankingReport}
                  label="Skip"
                />
              )}
            </div>
          )}
        </div>
      )}

      <Dialog
        visible={reportLoading}
        onHide={() => { }}
        draggable={false}
        resizable={false}
        modal
        className="modalWrapper"
        blockScroll
      >
        <div className="text-center">
          <ModalLoader />
        </div>
        <h2 className="txt-orange mt-3">Processing...</h2>
        {/* <p className="mt-2">⚠️ Please do not refresh the page!</p> */}
        <p className="mt-2">
          Hang on! Your report is being generated. This might take a few
          moments.
        </p>
        <p className="mt-2">
          If you see loader for{" "}
          <strong>5 mins or more please refresh the page</strong> to get the
          report
        </p>
      </Dialog>

      <Dialog
        header="Enter Document Password"
        visible={showPasswordModal}
        modal
        onHide={() => setShowPasswordModal(false)}
        draggable={false}
        resizable={false}
        className="modalWrapper"
        style={{ width: "500px" }}
        blockScroll
        footer={footerContent}
      >
        <div className="form-group">
          <label className="form-label small" htmlFor="password">
            Password<sup>*</sup>
          </label>

          <div className="d-flex align-items-center position-relative">
            <InputText
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter password"
              value={passwordValue}
              maxLength={25}
              name="password"
              onChange={(e) => {
                const val = e.target.value;
                if (!val.includes(" ")) {
                  setPasswordValue(val);
                }
              }}
              // onPaste={(e) => e.preventDefault()}
              // onCopy={(e) => e.preventDefault()}
              // onCut={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
            />

            <Button
              className="btn position-absolute end-0 me-2 bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <i className="icon-eye" />
              ) : (
                <i className="icon-eye-slash" />
              )}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Re-Upload Document"
        visible={showReUploadModal}
        modal
        onHide={() => {
          if (!isReuploading) setShowReUploadModal(false);
        }}
        draggable={false}
        resizable={false}
        className="modalWrapper"
        style={{ width: "500px" }}
        footer={reuploadfooterContent}
        blockScroll
      >
        {isReuploading ? (
          <div className="d-flex flex-column align-items-center justify-content-center gap-2 py-5">
            <i className="pi pi-spinner pi-spin fs-2" aria-hidden="true" />
            <span>Re-uploading document...</span>
          </div>
        ) : (
          <div className="form-group">
          <div className="uploadFileWrapper">
            <img
              src="/assets/images/upload-cloud.svg"
              alt="upload-icon"
              loading="lazy"
            />

            <p style={{ fontSize: "0.875em" }}>Upload a statement</p>

            <p style={{ color: "var(--color-text-disabled-soft)", fontSize: "0.75em" }}>
              Accepted formats: PDF or a ZIP file containing only PDFs. {MAX_FILE_UPLOAD_NOTE} per file.
            </p>

            <label className="btn btn-black-line" htmlFor="reuploaddocument">
              Upload File
            </label>

            <InputText
              type="file"
              id="reuploaddocument"
              accept={BANK_STATEMENT_FILE_ACCEPT}
              onChange={handleReUploadFileChange}
              className="d-none"
            />
          </div>
          </div>
        )}
      </Dialog>

      <Dialog
        visible={uploadDocs}
        onHide={() => setUploadDocs(false)}
        draggable={false}
        resizable={false}
        modal
        header="Uploaded Documents"
        className="modalWrapper"
        footer={documentUploadFooterContent}
        blockScroll
      >
        <Loader isLoading={loading} />
        {uploadedBanksDocument.length > 0 && (
          <div className="col-12">
            <div
              className="table-responsive mt-1"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <DataTable
                key={stateKey}
                className="tableMain"
                value={uploadedBanksDocument}
                emptyMessage="No Document found"
              >
                <Column
                  header="Sr. No."
                  body={(rowData, options) => options.rowIndex + 1}
                />

                <Column field="bankName" header="Bank Name" />

                <Column
                  field="fileName"
                  header="File Name"
                  body={(rowData: IUploadedBankDocumentDetails) => {
                    const infoId = `file-info-${rowData.id}`;

                    return (
                      <>
                        <Tooltip target={`#${infoId}`} position="top" />
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <span
                            style={{
                              color: rowData.valid
                                ? "var(--color-text-black)"
                                : "var(--color-danger)",
                            }}
                          >
                            {rowData.fileName}
                            {!rowData.valid && rowData.message && (
                              <Button
                                id={infoId}
                                className="trash-icon p-0 ms-2"
                                data-pr-tooltip={rowData.message}
                              >
                                <img
                                  src="/assets/images/info-circle.svg"
                                  alt="info"
                                  loading="lazy"
                                />
                              </Button>
                            )}
                          </span>
                        </span>
                      </>
                    );
                  }}
                />

                <Column body={uploadedBankTemplate} header="Action" />
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        visible={wrongUserDialog.modal}
        modal
        draggable={false}
        resizable={false}
        className="modalWrapper text-center p-6"
        style={{ width: "600px" }}
        blockScroll
        onHide={() => {
          setWrongUserDialog({ modal: false, message: "" });
          setFinalBanksDocument([]);
          setShowPrevDocs(false);
          setSelectedInstitutionID(undefined);
        }}
      >
        <h2 className="txt-orange text-2xl font-bold">
          Wrong Statements Uploaded
        </h2>

        <p className="mt-4 text-gray-600">{wrongUserDialog?.message}</p>

        <div className="d-flex flex justify-content-center gap-2 mt-4">
          <Button
            className="btn btn-black-line w-100 text-center"
            onClick={() => {
              setWrongUserDialog({ modal: false, message: "" });
              setFinalBanksDocument([]);
              setShowPrevDocs(false);
              setSelectedInstitutionID(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-orange w-100 text-center"
            onClick={() => {
              setWrongUserDialog({ modal: false, message: "" });
              if (state !== "dashboard") {
                setCheckEligibilityBtn(true);
              }
            }}
          >
            Accept
          </Button>
        </div>
      </Dialog>

      {cAMReportPopUp &&
        <Dialog
          header="Eligibility Screening Report"
          visible={cAMReportPopUp}
          onHide={() => setCAMReportPopUp(false)}
          draggable={false}
          resizable={false}
          modal
          closable
          blockScroll
          className="modalWrapper"
          style={{ width: "500px" }}
          footer={footerContentCamReport}
        >
          <div className="modal-content">
            <div className="modal-body">
              <div className="camList">
                {camReportDetails.map((item, index) => (
                  <div key={index} className="camCard">
                    <div className="camLeft">
                      <span className="camTitle">{item.reportType}</span>
                    </div>

                    {statusBodyTemplate(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      }

      <ReFetchModal
        visible={showRefetchReport}
        onHide={() => setShowRefetchReport(false)}
        reportType={ReportType.BANKING_REPORT}
        daysLeft={bankingLastReportDate}
        reportFetchFunction={() => {
          setShowPrevDocs(false);
          setFinalBanksDocument([]);
          setShowRefetchReport(false);
        }}
      />
    </>
  );
};

export default BankDetails;


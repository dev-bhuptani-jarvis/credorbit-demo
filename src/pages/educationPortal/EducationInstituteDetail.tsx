import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import { RouteParams, formatMobileNumber } from "../../utils/constants/constant";
import {
  AADHAR_CARD_PATTERN,
  BANK_ACCOUNT_NUMBER_ONLY_PATTERN,
  EMAIL_PATTERN,
  GST_NUMBER_PATTERN,
  IFSC_CODE_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  IEducationInstitute,
  IEducationInstituteBranch,
  IEducationInstituteBranchFormData,
  IEducationInstituteDocument,
} from "../../interface/educationInstitute";
import {
  addEducationInstituteBranchDocument,
  createEducationInstituteBranch,
  deleteEducationInstituteBranch,
  getEducationInstituteById,
  getEducationInstituteDocumentUrl,
  setEducationInstitutePaymentBranch,
  toggleEducationInstituteStatus,
  updateEducationInstituteBranch,
} from "../../utils/demo/demoEducationInstitutes";
import { formatDate, toastError, toastSuccess } from "../../utils/functions/shared";

const stateOptions = [
  "Gujarat",
  "Maharashtra",
  "Rajasthan",
  "Karnataka",
  "Telangana",
].map((state) => ({
  label: state,
  value: state,
}));

const branchDocumentTypeOptions = [
  { label: "PAN", value: "PAN" },
  { label: "Aadhar Card", value: "Aadhar Card" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "Cancelled Cheque", value: "Cancelled Cheque" },
  { label: "Bank Proof", value: "Bank Proof" },
  { label: "Other", value: "Other" },
];

const defaultBranchForm: IEducationInstituteBranchFormData = {
  branchName: "",
  contactPerson: "",
  mobileNumber: "",
  email: "",
  state: "",
  city: "",
  address: "",
  panNumber: "",
  aadharNumber: "",
  gstNumber: "",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  isActive: true,
};

type BranchDialogMode = "add" | "edit" | "view";

const EducationInstituteDetail = () => {
  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);
  const [instituteDetail, setInstituteDetail] = useState<IEducationInstitute>();

  const [branchDialogVisible, setBranchDialogVisible] = useState<boolean>(false);

  const [branchDialogMode, setBranchDialogMode] = useState<BranchDialogMode>("add");

  const [selectedBranch, setSelectedBranch] = useState<IEducationInstituteBranch | null>(null);

  const [branchForm, setBranchForm] =
    useState<IEducationInstituteBranchFormData>(defaultBranchForm);

  const [branchFormErrors, setBranchFormErrors] = useState<Record<string, string>>({});

  const [uploadBranch, setUploadBranch] = useState<IEducationInstituteBranch | null>(null);

  const [branchDocumentType, setBranchDocumentType] = useState<string>("");

  const [selectedBranchDocument, setSelectedBranchDocument] = useState<File | null>(null);

  const [branchDocumentError, setBranchDocumentError] = useState<string>("");

  const [deleteBranchTarget, setDeleteBranchTarget] = useState<IEducationInstituteBranch | null>(
    null,
  );

  const isViewMode = branchDialogMode === "view";

  const refreshInstituteDetail = (): void => {
    if (!id) return;
    setInstituteDetail(getEducationInstituteById(id));
  };

  const resetBranchForm = (): void => {
    setBranchForm(defaultBranchForm);
    setBranchFormErrors({});
    setSelectedBranch(null);
    setBranchDialogMode("add");
  };

  const openBranchDialog = (
    mode: BranchDialogMode,
    branch?: IEducationInstituteBranch,
  ): void => {
    setBranchDialogMode(mode);
    setSelectedBranch(branch || null);
    setBranchForm(
      branch
        ? {
          branchName: branch.branchName,
          contactPerson: branch.contactPerson,
          mobileNumber: branch.mobileNumber,
          email: branch.email,
          state: branch.state,
          city: branch.city,
          address: branch.address,
          panNumber: branch.panNumber,
          aadharNumber: branch.aadharNumber,
          gstNumber: branch.gstNumber,
          accountHolderName: branch.accountHolderName,
          bankName: branch.bankName,
          accountNumber: branch.accountNumber,
          ifscCode: branch.ifscCode,
          isActive: branch.isActive,
        }
        : defaultBranchForm,
    );
    setBranchFormErrors({});
    setBranchDialogVisible(true);
  };

  const handleStatusChange = (checked: boolean): void => {
    if (!instituteDetail) return;

    const updatedInstitute = toggleEducationInstituteStatus(instituteDetail.id, checked);

    if (updatedInstitute) {
      setInstituteDetail(updatedInstitute);
      toastSuccess(
        `Educational institute marked as ${checked ? "Active" : "Inactive"}.`,
      );
    }
  };

  const openDocument = (documentData: IEducationInstituteDocument): void => {
    const documentUrl = getEducationInstituteDocumentUrl(documentData);

    if (documentUrl && typeof window !== "undefined") {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    toastError(
      "Document metadata is available. Re-upload the file in this session to preview it.",
    );
  };

  const handleBranchFormFieldChange = (
    fieldName: keyof IEducationInstituteBranchFormData,
    value: string | boolean,
  ): void => {
    setBranchForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setBranchFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const validateBranchForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!branchForm.branchName.trim()) {
      nextErrors.branchName = "Branch name is required.";
    }

    if (!branchForm.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(branchForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(branchForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!branchForm.state) {
      nextErrors.state = "State is required.";
    }

    if (!branchForm.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!branchForm.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!PAN_NUMBER_PATTERN.test(branchForm.panNumber.trim().toUpperCase())) {
      nextErrors.panNumber = "Enter a valid PAN number.";
    }

    if (!AADHAR_CARD_PATTERN.test(branchForm.aadharNumber.trim())) {
      nextErrors.aadharNumber = "Enter a valid 12-digit Aadhar number.";
    }

    if (
      branchForm.gstNumber.trim() &&
      !GST_NUMBER_PATTERN.test(branchForm.gstNumber.trim().toUpperCase())
    ) {
      nextErrors.gstNumber = "Enter a valid GST number.";
    }

    if (!branchForm.accountHolderName.trim()) {
      nextErrors.accountHolderName = "Account holder name is required.";
    }

    if (!branchForm.bankName.trim()) {
      nextErrors.bankName = "Bank name is required.";
    }

    if (!BANK_ACCOUNT_NUMBER_ONLY_PATTERN.test(branchForm.accountNumber.trim())) {
      nextErrors.accountNumber = "Enter a valid bank account number.";
    }

    if (!IFSC_CODE_PATTERN.test(branchForm.ifscCode.trim().toUpperCase())) {
      nextErrors.ifscCode = "Enter a valid IFSC code.";
    }

    setBranchFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBranchSubmit = (): void => {
    if (!id || !validateBranchForm()) return;

    setLoading(true);

    const normalizedData: IEducationInstituteBranchFormData = {
      ...branchForm,
      panNumber: branchForm.panNumber.trim().toUpperCase(),
      aadharNumber: branchForm.aadharNumber.trim(),
      gstNumber: branchForm.gstNumber.trim().toUpperCase(),
      ifscCode: branchForm.ifscCode.trim().toUpperCase(),
    };

    if (branchDialogMode === "add") {
      const createdBranch = createEducationInstituteBranch(id, normalizedData);

      if (createdBranch) {
        toastSuccess(`${createdBranch.branchName} added successfully.`);
      }
    }

    if (branchDialogMode === "edit" && selectedBranch) {
      const updatedBranch = updateEducationInstituteBranch(id, selectedBranch.id, {
        ...normalizedData,
      });

      if (updatedBranch) {
        toastSuccess(`${updatedBranch.branchName} updated successfully.`);
      }
    }

    refreshInstituteDetail();
    setBranchDialogVisible(false);
    resetBranchForm();
    setLoading(false);
  };

  const handleBranchFileSelection = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toastError("Only PDF documents are allowed.");
      event.target.value = "";
      return;
    }

    setSelectedBranchDocument(file);
    setBranchDocumentError("");
  };

  const handleUploadBranchDocument = (): void => {
    if (!id || !uploadBranch) {
      toastError("Please choose a branch first.");
      return;
    }

    if (!branchDocumentType) {
      setBranchDocumentError("Document type is required.");
      return;
    }

    if (!selectedBranchDocument) {
      toastError("Please select a PDF file.");
      return;
    }

    setLoading(true);

    const documentData = addEducationInstituteBranchDocument(
      id,
      uploadBranch.id,
      branchDocumentType,
      selectedBranchDocument,
    );

    if (documentData) {
      toastSuccess(`${branchDocumentType} uploaded successfully.`);
    }

    refreshInstituteDetail();
    setSelectedBranchDocument(null);
    setBranchDocumentType("");
    setBranchDocumentError("");
    setUploadBranch(null);
    setLoading(false);
  };

  const handleDeleteBranch = (): void => {
    if (!id || !deleteBranchTarget) return;

    setLoading(true);
    deleteEducationInstituteBranch(id, deleteBranchTarget.id);
    refreshInstituteDetail();
    toastSuccess(`${deleteBranchTarget.branchName} deleted successfully.`);
    setDeleteBranchTarget(null);
    setLoading(false);
  };

  const handleSetPaymentBranch = (branch: IEducationInstituteBranch): void => {
    if (!id) return;

    setLoading(true);
    setEducationInstitutePaymentBranch(id, branch.id);
    refreshInstituteDetail();
    setSelectedBranch((prev) =>
      prev?.id === branch.id ? { ...branch, isPaymentBranch: true } : prev,
    );
    toastSuccess(`${branch.branchName} is now the payment branch.`);
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setInstituteDetail(getEducationInstituteById(id));
    setLoading(false);
  }, [id]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <h2 className="txt-24 mb-1">Educational Institute Details</h2>

          <BackButton />
        </div>

        {instituteDetail ? (
          <div className="row g-4">
            <div className="col-12">
              <div className="borderBoxHldr p-24">
                <div className="row">
                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Institute Code</b>
                    <p className="text-break mb-0">{instituteDetail.instituteCode}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Institute Name</b>
                    <p className="text-break mb-0">{instituteDetail.instituteName}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Contact Person</b>
                    <p className="text-break mb-0">{instituteDetail.contactPerson}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Mobile Number</b>
                    <p className="text-break mb-0">
                      {formatMobileNumber(instituteDetail.mobileNumber)}
                    </p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Email</b>
                    <p className="text-break mb-0">{instituteDetail.email}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">State</b>
                    <p className="text-break mb-0">{instituteDetail.state}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">City</b>
                    <p className="text-break mb-0">{instituteDetail.city}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">GST Number</b>
                    <p className="text-break mb-0">{instituteDetail.gstNumber || "-"}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">PAN Number</b>
                    <p className="text-break mb-0">{instituteDetail.panNumber || "-"}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Registration Number</b>
                    <p className="text-break mb-0">
                      {instituteDetail.registrationNumber || "-"}
                    </p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Address</b>
                    <p className="text-break mb-0">{instituteDetail.address}</p>
                  </div>

                  <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                    <b className="fw-semibold">Status</b>
                    <p className="d-flex align-items-center mt-2 mb-0">
                      <InputSwitch
                        checked={!!instituteDetail.isActive}
                        onChange={(e) => handleStatusChange(!!e.value)}
                      />
                      <span className="ms-2">
                        {instituteDetail.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="whiteBoxHldr">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="txt-20 mb-0">Uploaded Documents</h3>
                  <span className="text-muted small">
                    {instituteDetail.documents.length} document(s) available
                  </span>
                </div>

                {instituteDetail.documents.length > 0 ? (
                  <div className="table-responsive">
                    <table className="tableMain">
                      <thead>
                        <tr>
                          <th>Document Type</th>
                          <th>Uploaded Date</th>
                          <th>File Size</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instituteDetail.documents.map((documentData) => (
                          <tr key={documentData.id}>
                            <td>{documentData.type}</td>
                            <td>{formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}</td>
                            <td>{(documentData.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                            <td>
                              <Button
                                className="btn btn-black-line py-2 px-3"
                                onClick={() => openDocument(documentData)}
                                label="View PDF"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">No documents uploaded for this institute yet.</p>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="whiteBoxHldr">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <h3 className="txt-20 mb-1">Institute Branches</h3>
                  </div>

                  <Button
                    className="btn btn-orange"
                    onClick={() => openBranchDialog("add")}
                  >
                    <i className="bi bi-plus-circle me-2" />
                    Add Branch
                  </Button>
                </div>

                {instituteDetail.branches.length > 0 ? (
                  <div className="table-responsive">
                    <table className="tableMain">
                      <thead>
                        <tr>
                          <th>Branch Code</th>
                          <th>Branch Name</th>
                          <th>Contact Person</th>
                          <th>Mobile Number</th>
                          <th>Is Payment Branch</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instituteDetail.branches.map((branch) => (
                          <tr key={branch.id}>
                            <td>{branch.branchCode}</td>
                            <td>{branch.branchName}</td>
                            <td>{branch.contactPerson}</td>
                            <td>{formatMobileNumber(branch.mobileNumber)}</td>
                            <td>
                              {branch.isPaymentBranch ? (
                                <span className="StatusLabel greenLine">Yes</span>
                              ) : (
                                <Button
                                  className="btn btn-orange py-2 px-3"
                                  label="Set Payment Branch"
                                  onClick={() => handleSetPaymentBranch(branch)}
                                />
                              )}
                            </td>
                            <td>{branch.city}</td>
                            <td>{branch.state}</td>
                            <td>
                              <span
                                className={`StatusLabel ${branch.isActive ? "greenLine" : "redLine"
                                  }`}
                              >
                                {branch.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap">
                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="View"
                                  onClick={() => openBranchDialog("view", branch)}
                                >
                                  <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
                                </Button>

                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="Edit"
                                  onClick={() => openBranchDialog("edit", branch)}
                                >
                                  <i className="bi bi-pencil-fill ms-2" />
                                </Button>

                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="Upload Docs"
                                  onClick={() => setUploadBranch(branch)}
                                >
                                  <i className="bi bi-upload ms-2" />
                                </Button>

                                <Button
                                  className="trash-icon p-0 ms-2"
                                  data-pr-tooltip="Delete"
                                  onClick={() => setDeleteBranchTarget(branch)}
                                >
                                  <i className="bi bi-trash ms-2" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">
                    No branches added for this institute yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="whiteBoxHldr">
            <p className="mb-3">Educational institute not found.</p>
            <BackButton />
          </div>
        )}
      </div>

      <Dialog
        header={
          branchDialogMode === "add"
            ? "Add Institute Branch"
            : branchDialogMode === "edit"
              ? "Update Institute Branch"
              : "Branch Details"
        }
        visible={branchDialogVisible}
        className="modalWrapper"
        onHide={() => {
          setBranchDialogVisible(false);
          resetBranchForm();
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "940px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => {
                setBranchDialogVisible(false);
                resetBranchForm();
              }}
              label={isViewMode ? "Close" : "Cancel"}
            />
            {!isViewMode && (
              <Button
                className="btn btn-orange w-100 text-center"
                onClick={handleBranchSubmit}
                label={branchDialogMode === "add" ? "Save Branch" : "Update Branch"}
              />
            )}
          </div>
        }
      >
        <div
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px"
          }}
        >
          <div className="row g-3">
            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchName">
                Branch Name<sup>*</sup>
              </label>
              <InputText
                id="branchName"
                className="form-control"
                placeholder="Enter branch name"
                value={branchForm.branchName}
                onChange={(e) => handleBranchFormFieldChange("branchName", e.target.value)}
                disabled={isViewMode}
              />
              {branchFormErrors.branchName && (
                <small className="error">{branchFormErrors.branchName}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchContactPerson">
                Contact Person<sup>*</sup>
              </label>
              <InputText
                id="branchContactPerson"
                className="form-control"
                placeholder="Enter branch contact person"
                value={branchForm.contactPerson}
                onChange={(e) => handleBranchFormFieldChange("contactPerson", e.target.value)}
                disabled={isViewMode}
              />
              {branchFormErrors.contactPerson && (
                <small className="error">{branchFormErrors.contactPerson}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchMobileNumber">
                Mobile Number<sup>*</sup>
              </label>
              <InputText
                id="branchMobileNumber"
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                value={branchForm.mobileNumber}
                maxLength={10}
                onChange={(e) =>
                  handleBranchFormFieldChange(
                    "mobileNumber",
                    e.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                disabled={isViewMode}
              />
              {branchFormErrors.mobileNumber && (
                <small className="error">{branchFormErrors.mobileNumber}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchEmail">
                Email<sup>*</sup>
              </label>
              <InputText
                id="branchEmail"
                className="form-control"
                placeholder="Enter branch email"
                value={branchForm.email}
                onChange={(e) => handleBranchFormFieldChange("email", e.target.value)}
                disabled={isViewMode}
              />
              {branchFormErrors.email && (
                <small className="error">{branchFormErrors.email}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchState">
                State<sup>*</sup>
              </label>
              <Dropdown
                id="branchState"
                className="w-100"
                value={branchForm.state}
                options={stateOptions}
                onChange={(e) => handleBranchFormFieldChange("state", e.value)}
                placeholder="Select state"
                disabled={isViewMode}
              />
              {branchFormErrors.state && <small className="error">{branchFormErrors.state}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchCity">
                City<sup>*</sup>
              </label>
              <InputText
                id="branchCity"
                className="form-control"
                placeholder="Enter city"
                value={branchForm.city}
                onChange={(e) => handleBranchFormFieldChange("city", e.target.value)}
                disabled={isViewMode}
              />
              {branchFormErrors.city && <small className="error">{branchFormErrors.city}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchPan">
                PAN Number<sup>*</sup>
              </label>
              <InputText
                id="branchPan"
                className="form-control"
                placeholder="Enter PAN number"
                value={branchForm.panNumber}
                onChange={(e) =>
                  handleBranchFormFieldChange("panNumber", e.target.value.toUpperCase())
                }
                disabled={isViewMode}
              />
              {branchFormErrors.panNumber && (
                <small className="error">{branchFormErrors.panNumber}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchAadhar">
                Aadhar Number<sup>*</sup>
              </label>
              <InputText
                id="branchAadhar"
                className="form-control"
                placeholder="Enter 12-digit Aadhar number"
                value={branchForm.aadharNumber}
                maxLength={12}
                onChange={(e) =>
                  handleBranchFormFieldChange(
                    "aadharNumber",
                    e.target.value.replace(/\D/g, "").slice(0, 12),
                  )
                }
                disabled={isViewMode}
              />
              {branchFormErrors.aadharNumber && (
                <small className="error">{branchFormErrors.aadharNumber}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="branchGstNumber">
                GST Number
              </label>
              <InputText
                id="branchGstNumber"
                className="form-control"
                placeholder="Enter GST number"
                value={branchForm.gstNumber}
                onChange={(e) =>
                  handleBranchFormFieldChange("gstNumber", e.target.value.toUpperCase())
                }
                disabled={isViewMode}
              />
              {branchFormErrors.gstNumber && (
                <small className="error">{branchFormErrors.gstNumber}</small>
              )}
            </div>

            {/* -------------------- Bank Account Details -------------------- */}
            <div className="col-12 mt-4">
              <div className="border rounded-3 p-3 bg-light">
                <h5 className="mb-3">Bank Account Details</h5>

                <div className="row g-3">
                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="branchAccountHolderName">
                      Account Holder Name<sup>*</sup>
                    </label>
                    <InputText
                      id="branchAccountHolderName"
                      className="form-control"
                      placeholder="Enter account holder name"
                      value={branchForm.accountHolderName}
                      onChange={(e) =>
                        handleBranchFormFieldChange("accountHolderName", e.target.value)
                      }
                      disabled={isViewMode}
                    />
                    {branchFormErrors.accountHolderName && (
                      <small className="error">{branchFormErrors.accountHolderName}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="branchBankName">
                      Bank Name<sup>*</sup>
                    </label>
                    <InputText
                      id="branchBankName"
                      className="form-control"
                      placeholder="Enter bank name"
                      value={branchForm.bankName}
                      onChange={(e) =>
                        handleBranchFormFieldChange("bankName", e.target.value)
                      }
                      disabled={isViewMode}
                    />
                    {branchFormErrors.bankName && (
                      <small className="error">{branchFormErrors.bankName}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="branchAccountNumber">
                      Account Number<sup>*</sup>
                    </label>
                    <InputText
                      id="branchAccountNumber"
                      className="form-control"
                      placeholder="Enter bank account number"
                      value={branchForm.accountNumber}
                      onChange={(e) =>
                        handleBranchFormFieldChange(
                          "accountNumber",
                          e.target.value.replace(/[^0-9-]/g, "")
                        )
                      }
                      disabled={isViewMode}
                    />
                    {branchFormErrors.accountNumber && (
                      <small className="error">{branchFormErrors.accountNumber}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="branchIfscCode">
                      IFSC Code<sup>*</sup>
                    </label>
                    <InputText
                      id="branchIfscCode"
                      className="form-control"
                      placeholder="Enter IFSC code"
                      value={branchForm.ifscCode}
                      onChange={(e) =>
                        handleBranchFormFieldChange("ifscCode", e.target.value.toUpperCase())
                      }
                      disabled={isViewMode}
                    />
                    {branchFormErrors.ifscCode && (
                      <small className="error">{branchFormErrors.ifscCode}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group col-12">
              <label className="form-label" htmlFor="branchAddress">
                Address<sup>*</sup>
              </label>
              <InputTextarea
                id="branchAddress"
                className="form-control"
                autoResize
                rows={4}
                placeholder="Enter full branch address"
                value={branchForm.address}
                onChange={(e) => handleBranchFormFieldChange("address", e.target.value)}
                disabled={isViewMode}
              />
              {branchFormErrors.address && (
                <small className="error">{branchFormErrors.address}</small>
              )}
            </div>

            {selectedBranch && (
              <div className="col-12 mt-4">
                <div className="education-document-list">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h6 className="mb-0">Uploaded Branch Documents</h6>
                    <span className="text-muted small">
                      {selectedBranch.documents.length} document(s)
                    </span>
                  </div>

                  {selectedBranch.documents.length > 0 ? (
                    selectedBranch.documents.map((documentData) => (
                      <div key={documentData.id} className="education-document-item">
                        <div>
                          <div className="education-document-item__title">{documentData.type}</div>
                          <div className="education-document-item__meta">
                            {documentData.fileName} |{" "}
                            {formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <span className="education-document-item__size">
                            {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button
                            className="btn btn-black-line py-2 px-3"
                            label="View PDF"
                            onClick={() => openDocument(documentData)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="mb-0 text-muted">No branch documents uploaded yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Upload Branch Documents${uploadBranch ? ` - ${uploadBranch.branchName}` : ""}`}
        visible={!!uploadBranch}
        className="modalWrapper"
        onHide={() => {
          setUploadBranch(null);
          setBranchDocumentType("");
          setSelectedBranchDocument(null);
          setBranchDocumentError("");
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "620px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line text-center w-100"
              label="Cancel"
              onClick={() => {
                setUploadBranch(null);
                setSelectedBranchDocument(null);
                setBranchDocumentType("");
                setBranchDocumentError("");
              }}
            />

            <Button
              className="btn btn-orange text-center w-100"
              label="Upload"
              onClick={handleUploadBranchDocument}
              disabled={!selectedBranchDocument}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-12">
            <label className="form-label" htmlFor="branchDocumentType">
              Document Type<sup>*</sup>
            </label>
            <Dropdown
              id="branchDocumentType"
              className="w-100"
              value={branchDocumentType}
              options={branchDocumentTypeOptions}
              onChange={(e) => {
                setBranchDocumentType(e.value);
                setBranchDocumentError("");
              }}
              placeholder="Select document type"
            />
            {branchDocumentError && <small className="error">{branchDocumentError}</small>}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="educationBranchDocumentUpload">
              Upload PDF<sup>*</sup>
            </label>
            <div className="uploadFileWrapper">
              <img src="/assets/images/upload-cloud.svg" alt="upload-icon" loading="lazy" />
              <p>Upload branch document in PDF format only</p>
              <label className="btn btn-black-line" htmlFor="educationBranchDocumentUpload">
                Upload PDF
              </label>
              <InputText
                type="file"
                id="educationBranchDocumentUpload"
                accept=".pdf,application/pdf"
                onChange={handleBranchFileSelection}
                className="d-none"
              />
            </div>
            {selectedBranchDocument && (
              <span className="text-muted mt-2 d-block">
                Selected File: {selectedBranchDocument.name}
              </span>
            )}
          </div>

          {uploadBranch && uploadBranch.documents.length > 0 && (
            <div className="col-12 mt-0">
              <div className="education-document-list">
                <h6 className="mb-3">Uploaded Documents</h6>
                {uploadBranch.documents.map((documentData) => (
                  <div key={documentData.id} className="education-document-item">
                    <div>
                      <div className="education-document-item__title">{documentData.type}</div>
                      <div className="education-document-item__meta">
                        {documentData.fileName} |{" "}
                        {formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}
                      </div>
                    </div>
                    <span className="education-document-item__size">
                      {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog
        header="Delete Branch"
        visible={!!deleteBranchTarget}
        className="modalWrapper"
        onHide={() => setDeleteBranchTarget(null)}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "520px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              label="Cancel"
              onClick={() => setDeleteBranchTarget(null)}
            />
            <Button
              className="btn btn-danger w-100 text-center"
              label="Delete Branch"
              onClick={handleDeleteBranch}
            />
          </div>
        }
      >
        <p className="mb-0">
          {deleteBranchTarget?.isPaymentBranch
            ? `Are you sure you want to delete ${deleteBranchTarget.branchName}? Another available branch will automatically become the payment branch.`
            : `Are you sure you want to delete ${deleteBranchTarget?.branchName}?`}
        </p>
      </Dialog>
    </>
  );
};

export default EducationInstituteDetail;

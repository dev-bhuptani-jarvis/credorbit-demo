import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { Tooltip } from "primereact/tooltip";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { IEducationInstitute, IEducationInstituteFormData } from "../../interface/educationInstitute";
import { PaginateReqEntity } from "../../interface/pagination";
import { debounceTimeInMilliseconds, formatMobileNumber } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { EMAIL_PATTERN, GST_NUMBER_PATTERN, INDIAN_MOBILE_NUMBER_PATTERN } from "../../utils/constants/pattern";
import {
  addEducationInstituteDocument,
  createEducationInstitute,
  getEducationInstitutes,
} from "../../utils/demo/demoEducationInstitutes";
import { formatDate, toastError, toastSuccess } from "../../utils/functions/shared";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

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

const documentTypeOptions = [
  { label: "Registration Document", value: "Registration Document" },
  { label: "GST Certificate", value: "GST Certificate" },
  { label: "Contract", value: "Contract" },
  { label: "Other", value: "Other" },
];

const defaultInstituteForm: IEducationInstituteFormData = {
  instituteName: "",
  contactPerson: "",
  mobileNumber: "",
  email: "",
  state: "",
  city: "",
  address: "",
  gstNumber: "",
  registrationNumber: "",
  isActive: true,
};

const ManagedEducationInstitute = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const [institutes, setInstitutes] = useState<IEducationInstitute[]>([]);

  const [searchText, setSearchText] = useState<string>("");

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [selectedState, setSelectedState] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [showAddInstituteDialog, setShowAddInstituteDialog] = useState<boolean>(false);

  const [instituteForm, setInstituteForm] =
    useState<IEducationInstituteFormData>(defaultInstituteForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [uploadInstitute, setUploadInstitute] = useState<IEducationInstitute | null>(null);

  const [documentType, setDocumentType] = useState<string>("");

  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

  const [documentError, setDocumentError] = useState("");

  const fetchInstitutes = (): void => {
    setLoading(true);
    setInstitutes(getEducationInstitutes());
    setLoading(false);
  };

  const filteredInstitutes = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return institutes.filter((institute) => {
      const matchesSearch =
        !searchValue ||
        institute.instituteName.toLowerCase().includes(searchValue) ||
        institute.instituteCode.toLowerCase().includes(searchValue) ||
        institute.contactPerson.toLowerCase().includes(searchValue) ||
        institute.city.toLowerCase().includes(searchValue);

      const matchesState = !selectedState || institute.state === selectedState;

      return matchesSearch && matchesState;
    });
  }, [filterReq.searchText, institutes, selectedState]);

  const paginatedInstitutes = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredInstitutes.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredInstitutes]);

  const handleFormFieldChange = (
    fieldName: keyof IEducationInstituteFormData,
    value: string | boolean,
  ): void => {
    setInstituteForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const validateInstituteForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!instituteForm.instituteName.trim()) {
      nextErrors.instituteName = "Institute name is required.";
    }

    if (!instituteForm.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(instituteForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(instituteForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!instituteForm.state) {
      nextErrors.state = "State is required.";
    }

    if (!instituteForm.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!instituteForm.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (
      instituteForm.gstNumber.trim() &&
      !GST_NUMBER_PATTERN.test(instituteForm.gstNumber.trim().toUpperCase())
    ) {
      nextErrors.gstNumber = "Enter a valid GST number.";
    }

    if (!instituteForm.registrationNumber.trim()) {
      nextErrors.registrationNumber = "Registration number is required.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddInstitute = (): void => {
    if (!validateInstituteForm()) return;

    setLoading(true);

    const nextInstitute = createEducationInstitute({
      ...instituteForm,
      gstNumber: instituteForm.gstNumber.trim().toUpperCase(),
    });

    toastSuccess(`${nextInstitute.instituteName} added successfully.`);
    setShowAddInstituteDialog(false);
    setInstituteForm(defaultInstituteForm);
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
    fetchInstitutes();
    setLoading(false);
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toastError("Only PDF documents are allowed.");
      event.target.value = "";
      return;
    }

    setSelectedDocument(file);
    setDocumentError("");
  };

  const handleUploadDocument = (): void => {
    if (!uploadInstitute) {
      toastError("Please choose an institute first.");
      return;
    }

    if (!documentType) {
      setDocumentError("Document Type is required.");
      return;
    }

    if (!selectedDocument) {
      toastError("Please select a PDF file.");
      return;
    }

    setLoading(true);

    addEducationInstituteDocument(
      uploadInstitute.id,
      documentType,
      selectedDocument,
    );

    toastSuccess(`${documentType} uploaded successfully.`);

    setSelectedDocument(null);
    setDocumentType("");
    setUploadInstitute(null);

    fetchInstitutes();
    setLoading(false);
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
  };

  const statusBodyTemplate = (rowData: IEducationInstitute): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const actionBodyTemplate = (rowData: IEducationInstitute): JSX.Element => {
    const viewId = `education-view-${rowData.id}`;
    const uploadId = `education-upload-${rowData.id}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${uploadId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View Institute"
          onClick={() =>
            navigate(
              RoutePathConstant.private.educationInstituteDetail.replace(":id", rowData.id),
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" />
        </Button>

        <Button
          id={uploadId}
          className="trash-icon p-0"
          data-pr-tooltip="Upload Documents"
          onClick={() => setUploadInstitute(rowData)}
        >
          <i className="bi bi-upload" />
        </Button>
      </>
    );
  };

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText],
  );

  useEffect(() => {
    fetchInstitutes();
  }, []);

  useEffect(() => {
    setTotalRecords(filteredInstitutes.length);
  }, [filteredInstitutes]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Managed Education Institute" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by institute, code, contact"
                />

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={stateOptions}
                    showClear={selectedState !== ""}
                    placeholder="Filter by State"
                  />
                </div>

                <div className="form-group">
                  <Button
                    onClick={() => setShowAddInstituteDialog(true)}
                    className="btn btn-orange"
                  >
                    <i className="bi bi-plus-circle me-2" />
                    Add Institute
                  </Button>
                </div>
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={paginatedInstitutes}
                  emptyMessage="No educational institutes found."
                >
                  <Column field="instituteCode" header="Institute Code" />

                  <Column field="instituteName" header="Institute Name" />

                  <Column field="contactPerson" header="Contact Person" />

                  <Column
                    body={(rowData: IEducationInstitute) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />

                  <Column field="state" header="State" />

                  <Column
                    body={(rowData: IEducationInstitute) =>
                      formatDate(rowData.createdAt, "DD MMM, YYYY h:mm A")
                    }
                    header="Registered Date"
                  />

                  <Column body={statusBodyTemplate} header="Status" />

                  <Column body={actionBodyTemplate} header="Action" />
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(paginatedInstitutes) && (
                <PrimePaginator
                  onPageChange={onPageChange}
                  pageNumber={filterReq.pageNumber}
                  pageSize={filterReq.pageSize}
                  totalRecords={totalRecords}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        header="Add Educational Institute"
        visible={showAddInstituteDialog}
        className="modalWrapper"
        onHide={() => {
          setShowAddInstituteDialog(false);
          setInstituteForm(defaultInstituteForm);
          setFormErrors({});
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "820px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => setShowAddInstituteDialog(false)}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleAddInstitute}
              label="Save Institute"
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="instituteName">
              Institute Name<sup>*</sup>
            </label>
            <InputText
              id="instituteName"
              className="form-control"
              placeholder="Enter institute name"
              value={instituteForm.instituteName}
              onChange={(e) => handleFormFieldChange("instituteName", e.target.value)}
            />
            {formErrors.instituteName && <small className="error">{formErrors.instituteName}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="contactPerson">
              Contact Person<sup>*</sup>
            </label>
            <InputText
              id="contactPerson"
              className="form-control"
              placeholder="Enter contact person name"
              value={instituteForm.contactPerson}
              onChange={(e) => handleFormFieldChange("contactPerson", e.target.value)}
            />
            {formErrors.contactPerson && <small className="error">{formErrors.contactPerson}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="mobileNumber">
              Mobile Number<sup>*</sup>
            </label>
            <InputText
              id="mobileNumber"
              className="form-control"
              placeholder="Enter 10-digit mobile number"
              value={instituteForm.mobileNumber}
              maxLength={10}
              onChange={(e) =>
                handleFormFieldChange(
                  "mobileNumber",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
            {formErrors.mobileNumber && <small className="error">{formErrors.mobileNumber}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="email">
              Email<sup>*</sup>
            </label>
            <InputText
              id="email"
              className="form-control"
              placeholder="Enter institute email"
              value={instituteForm.email}
              onChange={(e) => handleFormFieldChange("email", e.target.value)}
            />
            {formErrors.email && <small className="error">{formErrors.email}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="state">
              State<sup>*</sup>
            </label>
            <Dropdown
              id="state"
              className="w-100"
              value={instituteForm.state}
              options={stateOptions}
              onChange={(e) => handleFormFieldChange("state", e.value)}
              placeholder="Select state"
            />
            {formErrors.state && <small className="error">{formErrors.state}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="city">
              City<sup>*</sup>
            </label>
            <InputText
              id="city"
              className="form-control"
              placeholder="Enter city"
              value={instituteForm.city}
              onChange={(e) => handleFormFieldChange("city", e.target.value)}
            />
            {formErrors.city && <small className="error">{formErrors.city}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="registrationNumber">
              Registration Number<sup>*</sup>
            </label>
            <InputText
              id="registrationNumber"
              className="form-control"
              placeholder="Enter registration number"
              value={instituteForm.registrationNumber}
              onChange={(e) => handleFormFieldChange("registrationNumber", e.target.value)}
            />
            {formErrors.registrationNumber && (
              <small className="error">{formErrors.registrationNumber}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="gstNumber">
              GST Number
            </label>
            <InputText
              id="gstNumber"
              className="form-control"
              placeholder="Enter GST number"
              value={instituteForm.gstNumber}
              onChange={(e) =>
                handleFormFieldChange("gstNumber", e.target.value.toUpperCase())
              }
            />
            {formErrors.gstNumber && <small className="error">{formErrors.gstNumber}</small>}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="address">
              Address<sup>*</sup>
            </label>
            <InputTextarea
              id="address"
              className="form-control"
              autoResize
              rows={4}
              placeholder="Enter full institute address"
              value={instituteForm.address}
              onChange={(e) => handleFormFieldChange("address", e.target.value)}
            />
            {formErrors.address && <small className="error">{formErrors.address}</small>}
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Upload Institute Documents${uploadInstitute ? ` - ${uploadInstitute.instituteName}` : ""}`}
        visible={!!uploadInstitute}
        className="modalWrapper"
        onHide={() => {
          setUploadInstitute(null);
          setDocumentType("");
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
                setUploadInstitute(null);
                setSelectedDocument(null);
                setDocumentType("");
                setDocumentError("");
              }}
            />

            <Button
              className="btn btn-orange text-center w-100"
              label="Upload"
              onClick={handleUploadDocument}
              disabled={!selectedDocument}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-12">
            <label className="form-label" htmlFor="documentType">
              Document Type<sup>*</sup>
            </label>
            <Dropdown
              id="documentType"
              className="w-100"
              value={documentType}
              options={documentTypeOptions}
              onChange={(e) => {
                setDocumentType(e.value);
                setDocumentError("");
              }}
              placeholder="Select document type"
            />

            {documentError && (
              <small className="error">{documentError}</small>
            )}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="educationInstituteDocumentUpload">
              Upload PDF<sup>*</sup>
            </label>
            <div className="uploadFileWrapper">
              <img
                src="/assets/images/upload-cloud.svg"
                alt="upload-icon"
                loading="lazy"
              />
              <p>Upload institute document in PDF format only</p>
              <label className="btn btn-black-line" htmlFor="educationInstituteDocumentUpload">
                Upload PDF
              </label>
              <InputText
                type="file"
                id="educationInstituteDocumentUpload"
                accept=".pdf,application/pdf"
                onChange={handleFileSelection}
                className="d-none"
              />
            </div>
            {selectedDocument && (
              <span className="text-muted mt-2 d-block">
                Selected File: {selectedDocument.name}
              </span>
            )}
          </div>

          {uploadInstitute && uploadInstitute.documents.length > 0 && (
            <div className="col-12 mt-0">
              <div className="education-document-list">
                <h6 className="mb-3">Uploaded Documents</h6>
                {uploadInstitute.documents.slice(0, 4).map((documentData) => (
                  <div key={documentData.id} className="education-document-item">
                    <div>
                      <div className="education-document-item__title">{documentData.type}</div>
                      <div className="education-document-item__meta">
                        {documentData.fileName} •{" "}
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
    </>
  );
};

export default ManagedEducationInstitute;

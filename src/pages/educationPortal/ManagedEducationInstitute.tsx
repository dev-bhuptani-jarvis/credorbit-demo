import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { Tooltip } from "primereact/tooltip";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import {
  EducationInstitutePersonGender,
  IEducationInstitute,
  IEducationInstituteAuthorizedPerson,
  IEducationInstituteFormData,
} from "../../interface/educationInstitute";
import { PaginateReqEntity } from "../../interface/pagination";
import {
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  GST_NUMBER_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  addEducationInstituteDocument,
  createEducationInstitute,
  getEducationAuthorizedPersonPanPreview,
  getEducationInstitutePanPreview,
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

const genderOptions: { label: string; value: EducationInstitutePersonGender }[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const categoryOptions = [
  "Educational Institute",
  "Finance Institute",
  "Business Academy",
  "Skills Academy",
  "Commerce College",
  "Global Institute",
].map((value) => ({
  label: value,
  value,
}));

const createEmptyAuthorizedPerson = (): IEducationInstituteAuthorizedPerson => ({
  id: `auth-person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  panNumber: "",
  fullName: "",
  constitution: "",
  dateOfBirth: "",
  gender: "",
  gstNumber: "",
  mobileNumber: "",
  email: "",
});

const isAuthorizedPersonVerified = (
  person: IEducationInstituteAuthorizedPerson,
): boolean =>
  !!(
    person.fullName.trim() &&
    person.constitution.trim() &&
    person.dateOfBirth &&
    person.gender
  );

const defaultInstituteForm: IEducationInstituteFormData = {
  institutePanNumber: "",
  instituteName: "",
  category: "",
  mobileNumber: "",
  email: "",
  gstNumber: "",
  contactPerson: "",
  state: "Gujarat",
  city: "Ahmedabad",
  address: "",
  registrationNumber: "",
  isActive: true,
  authorizedPersons: [createEmptyAuthorizedPerson()],
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
  const [showInstitutePanDialog, setShowInstitutePanDialog] = useState<boolean>(false);
  const [showAddInstituteDialog, setShowAddInstituteDialog] = useState<boolean>(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState<boolean>(false);
  const [instituteForm, setInstituteForm] =
    useState<IEducationInstituteFormData>(defaultInstituteForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [verifiedInstitutePan, setVerifiedInstitutePan] = useState<boolean>(false);
  const [selectedAgreementDocument, setSelectedAgreementDocument] = useState<File | null>(null);
  const [agreementError, setAgreementError] = useState<string>("");

  const fetchInstitutes = (): void => {
    setLoading(true);
    setInstitutes(getEducationInstitutes());
    setLoading(false);
  };

  const resetInstituteForm = (): void => {
    setInstituteForm({
      ...defaultInstituteForm,
      authorizedPersons: [createEmptyAuthorizedPerson()],
    });
    setFormErrors({});
    setVerifiedInstitutePan(false);
    setSelectedAgreementDocument(null);
    setAgreementError("");
  };

  const handleCloseInstituteFlow = (): void => {
    setShowInstitutePanDialog(false);
    setShowAddInstituteDialog(false);
    setShowAgreementDialog(false);
    resetInstituteForm();
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

  const handleInstituteFieldChange = (
    fieldName: keyof IEducationInstituteFormData,
    value: string | boolean | IEducationInstituteAuthorizedPerson[],
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

  const handleAuthorizedPersonChange = (
    index: number,
    fieldName: keyof IEducationInstituteAuthorizedPerson,
    value: string,
  ): void => {
    const nextAuthorizedPersons = [...instituteForm.authorizedPersons];
    nextAuthorizedPersons[index] = {
      ...nextAuthorizedPersons[index],
      [fieldName]: value,
    };

    setInstituteForm((prev) => ({
      ...prev,
      contactPerson: index === 0 && fieldName === "fullName" ? value : prev.contactPerson,
      authorizedPersons: nextAuthorizedPersons,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [`authorizedPersons.${index}.${fieldName}`]: "",
    }));
  };

  const handleVerifyInstitutePan = (): void => {
    const normalizedPanNumber = instituteForm.institutePanNumber.trim().toUpperCase();

    if (!PAN_NUMBER_PATTERN.test(normalizedPanNumber)) {
      setFormErrors((prev) => ({
        ...prev,
        institutePanNumber: "Enter a valid PAN number before verification.",
      }));
      return;
    }

    const institutePreview = getEducationInstitutePanPreview(normalizedPanNumber);

    setInstituteForm((prev) => ({
      ...prev,
      institutePanNumber: normalizedPanNumber,
      instituteName: institutePreview.instituteName,
      category: institutePreview.category,
      mobileNumber: institutePreview.mobileNumber,
      email: institutePreview.email,
      gstNumber: institutePreview.gstNumber,
      registrationNumber: prev.registrationNumber || `REG-${normalizedPanNumber.slice(0, 4)}-2026`,
      address: prev.address || `${institutePreview.instituteName}, India`,
    }));
    setVerifiedInstitutePan(true);
    setFormErrors((prev) => ({
      ...prev,
      institutePanNumber: "",
    }));
    setShowInstitutePanDialog(false);
    setShowAddInstituteDialog(true);
    toastSuccess("Institute PAN verified successfully.");
  };

  const handleVerifyAuthorizedPersonPan = (index: number): void => {
    const authorizedPerson = instituteForm.authorizedPersons[index];
    const normalizedPanNumber = authorizedPerson.panNumber.trim().toUpperCase();

    if (!PAN_NUMBER_PATTERN.test(normalizedPanNumber)) {
      setFormErrors((prev) => ({
        ...prev,
        [`authorizedPersons.${index}.panNumber`]:
          "Enter a valid PAN number before verification.",
      }));
      return;
    }

    const personPreview = getEducationAuthorizedPersonPanPreview(normalizedPanNumber);

    const nextAuthorizedPersons = [...instituteForm.authorizedPersons];
    nextAuthorizedPersons[index] = {
      ...nextAuthorizedPersons[index],
      panNumber: normalizedPanNumber,
      fullName: personPreview.fullName,
      constitution: personPreview.constitution,
      dateOfBirth: personPreview.dateOfBirth,
      gender: personPreview.gender,
      gstNumber: personPreview.gstNumber,
      mobileNumber: personPreview.mobileNumber,
      email: personPreview.email,
    };

    setInstituteForm((prev) => ({
      ...prev,
      contactPerson: index === 0 ? personPreview.fullName : prev.contactPerson,
      authorizedPersons: nextAuthorizedPersons,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [`authorizedPersons.${index}.panNumber`]: "",
    }));
    toastSuccess("Authorized person PAN verified successfully.");
  };

  const addAuthorizedPerson = (): void => {
    if (instituteForm.authorizedPersons.length >= 3) {
      toastError("You can add up to 3 authorized persons only.");
      return;
    }

    handleInstituteFieldChange("authorizedPersons", [
      ...instituteForm.authorizedPersons,
      createEmptyAuthorizedPerson(),
    ]);
  };

  const removeAuthorizedPerson = (index: number): void => {
    if (instituteForm.authorizedPersons.length === 1) return;

    const nextAuthorizedPersons = instituteForm.authorizedPersons.filter(
      (_, personIndex) => personIndex !== index,
    );

    setInstituteForm((prev) => ({
      ...prev,
      contactPerson: nextAuthorizedPersons[0]?.fullName || "",
      authorizedPersons: nextAuthorizedPersons,
    }));
  };

  const validateInstituteForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!verifiedInstitutePan) {
      nextErrors.institutePanNumber = "Verify institute PAN first.";
    }

    if (!instituteForm.instituteName.trim()) {
      nextErrors.instituteName = "Institute name is required.";
    }

    if (!instituteForm.category.trim()) {
      nextErrors.category = "Category is required.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(instituteForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(instituteForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      instituteForm.gstNumber.trim() &&
      !GST_NUMBER_PATTERN.test(instituteForm.gstNumber.trim().toUpperCase())
    ) {
      nextErrors.gstNumber = "Enter a valid GST number.";
    }

    instituteForm.authorizedPersons.forEach((person, index) => {
      if (!PAN_NUMBER_PATTERN.test(person.panNumber.trim().toUpperCase())) {
        nextErrors[`authorizedPersons.${index}.panNumber`] = "PAN number is required.";
      }

      if (!person.fullName.trim()) {
        nextErrors[`authorizedPersons.${index}.fullName`] = "Name is required.";
      }

      if (!person.constitution.trim()) {
        nextErrors[`authorizedPersons.${index}.constitution`] = "Constitution is required.";
      }

      if (!person.dateOfBirth) {
        nextErrors[`authorizedPersons.${index}.dateOfBirth`] = "DOB is required.";
      }

      if (!person.gender) {
        nextErrors[`authorizedPersons.${index}.gender`] = "Gender is required.";
      }

      if (
        person.gstNumber.trim() &&
        !GST_NUMBER_PATTERN.test(person.gstNumber.trim().toUpperCase())
      ) {
        nextErrors[`authorizedPersons.${index}.gstNumber`] = "Enter a valid GST number.";
      }

      if (!INDIAN_MOBILE_NUMBER_PATTERN.test(person.mobileNumber.trim())) {
        nextErrors[`authorizedPersons.${index}.mobileNumber`] =
          "Enter a valid 10-digit mobile number.";
      }

      if (!EMAIL_PATTERN.test(person.email.trim())) {
        nextErrors[`authorizedPersons.${index}.email`] = "Enter a valid email address.";
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenAgreementDialog = (): void => {
    if (!validateInstituteForm()) return;
    setShowAgreementDialog(true);
  };

  const handleAgreementSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toastError("Only PDF documents are allowed.");
      event.target.value = "";
      return;
    }

    setSelectedAgreementDocument(file);
    setAgreementError("");
  };

  const handleCreateInstituteWithAgreement = (): void => {
    if (!selectedAgreementDocument) {
      setAgreementError("Agreement document is required.");
      return;
    }

    setLoading(true);

    const nextInstitute = createEducationInstitute({
      ...instituteForm,
      institutePanNumber: instituteForm.institutePanNumber.trim().toUpperCase(),
      gstNumber: instituteForm.gstNumber.trim().toUpperCase(),
      contactPerson:
        instituteForm.authorizedPersons[0]?.fullName || instituteForm.contactPerson,
      authorizedPersons: instituteForm.authorizedPersons.map((person) => ({
        ...person,
        panNumber: person.panNumber.trim().toUpperCase(),
        fullName: person.fullName.trim(),
        constitution: person.constitution.trim(),
        gstNumber: person.gstNumber.trim().toUpperCase(),
        mobileNumber: person.mobileNumber.trim(),
        email: person.email.trim(),
      })),
    });

    addEducationInstituteDocument(nextInstitute.id, "Agreement", selectedAgreementDocument);

    toastSuccess(`${nextInstitute.instituteName} added successfully.`);
    setShowAgreementDialog(false);
    setShowAddInstituteDialog(false);
    resetInstituteForm();
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
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

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

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
              <TableTitle title="Manage Education Institute" />

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
                    onClick={() => setShowInstitutePanDialog(true)}
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
                  <Column field="category" header="Category" />
                  <Column field="contactPerson" header="Authorized Person" />
                  <Column
                    body={(rowData: IEducationInstitute) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />
                  <Column
                    body={(rowData: IEducationInstitute) => rowData.branches.length}
                    header="Total Branches"
                  />
                  <Column field="city" header="City" />
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
        header="PAN Details"
        visible={showInstitutePanDialog}
        className="modalWrapper"
        onHide={handleCloseInstituteFlow}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "650px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseInstituteFlow}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleVerifyInstitutePan}
              label="Next"
            />
          </div>
        }
      >
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
              Enter the PAN Card number to authenticate the educational institute
              and continue with institute onboarding.
            </p>

            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="institutePanNumber">
                PAN <sup>*</sup>
              </label>
              <InputText
                id="institutePanNumber"
                autoFocus
                className="form-control"
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                value={instituteForm.institutePanNumber}
                maxLength={10}
                onChange={(e) =>
                  handleInstituteFieldChange(
                    "institutePanNumber",
                    e.target.value.toUpperCase().trim(),
                  )
                }
              />
              {formErrors.institutePanNumber && (
                <small className="error">{formErrors.institutePanNumber}</small>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Confirm Institute Details"
        visible={showAddInstituteDialog}
        className="modalWrapper"
        onHide={handleCloseInstituteFlow}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "960px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseInstituteFlow}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleOpenAgreementDialog}
              label="Save Institute"
            />
          </div>
        }
      >
        <div
          style={{
            maxHeight: "72vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px",
          }}
        >
          <div className="row g-3">
            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="instituteName">
                Name<sup>*</sup>
              </label>
              <InputText
                id="instituteName"
                className="form-control"
                value={instituteForm.instituteName}
                disabled
              />
              {formErrors.instituteName && <small className="error">{formErrors.instituteName}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="instituteEmail">
                Email<sup>*</sup>
              </label>
              <InputText
                id="instituteEmail"
                className="form-control"
                value={instituteForm.email}
                disabled
              />
              {formErrors.email && <small className="error">{formErrors.email}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="instituteCategory">
                Category<sup>*</sup>
              </label>
              <InputText
                id="instituteCategory"
                className="form-control"
                value={instituteForm.category}
                disabled
              />
              {formErrors.category && <small className="error">{formErrors.category}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="instituteMobileNumber">
                Mobile Number<sup>*</sup>
              </label>
              <InputText
                id="instituteMobileNumber"
                className="form-control"
                maxLength={10}
                value={instituteForm.mobileNumber}
                disabled
              />
              {formErrors.mobileNumber && (
                <small className="error">{formErrors.mobileNumber}</small>
              )}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="instituteGstNumber">
                GST Details
              </label>
              <InputText
                id="instituteGstNumber"
                className="form-control"
                value={instituteForm.gstNumber}
                disabled
              />
              {formErrors.gstNumber && <small className="error">{formErrors.gstNumber}</small>}
            </div>

            <div className="col-12 mt-2">
              <div className="borderBoxHldr p-24 education-authorized-persons">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                  <div>
                    <h5 className="mb-1">Add Authorized Person Details</h5>
                    <p className="mb-0 text-muted">You can add up to 3 authorized persons.</p>
                  </div>
                  <Button className="btn btn-orange-line" onClick={addAuthorizedPerson}>
                    Add Authorized Person
                  </Button>
                </div>

                <div className="education-authorized-persons__list">
                  {instituteForm.authorizedPersons.map((person, index) => (
                    <div key={person.id} className="education-authorized-person-card">
                      {(() => {
                        const isVerified = isAuthorizedPersonVerified(person);

                        return (
                          <>
                            <div className="education-authorized-person-card__header">
                              <div>
                                <span className="education-authorized-person-card__badge">
                                  Authorized Person {index + 1}
                                </span>
                                <h6 className="education-authorized-person-card__title">
                                  {isVerified ? "Confirmed authorized person details" : "PAN Details"}
                                </h6>
                              </div>

                              {instituteForm.authorizedPersons.length > 1 && (
                                <Button
                                  className="btn btn-black-line"
                                  onClick={() => removeAuthorizedPerson(index)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>

                            <div className="education-authorized-person-card__pan-step">
                              <p className="education-authorized-person-card__intro">
                                Enter the PAN Card number to authenticate the authorized person
                                and continue with their profile details.
                              </p>

                              <div className="row g-3 align-items-end">
                                <div className="form-group col-sm-12 col-lg-4">
                                  <label className="form-label">PAN Number<sup>*</sup></label>
                                  <InputText
                                    className="form-control"
                                    placeholder="Enter PAN number"
                                    value={person.panNumber}
                                    onChange={(e) =>
                                      handleAuthorizedPersonChange(
                                        index,
                                        "panNumber",
                                        e.target.value.toUpperCase(),
                                      )
                                    }
                                  />
                                  {formErrors[`authorizedPersons.${index}.panNumber`] && (
                                    <small className="error">
                                      {formErrors[`authorizedPersons.${index}.panNumber`]}
                                    </small>
                                  )}
                                </div>

                                <div className="form-group col-sm-12 col-lg-3">
                                  <Button
                                    className="btn btn-orange w-100"
                                    onClick={() => handleVerifyAuthorizedPersonPan(index)}
                                  >
                                    Verify PAN
                                  </Button>
                                </div>
                                <div className="form-group col-sm-12 col-lg-5">
                                  {isVerified ? (
                                    null
                                  ) : (
                                    <div className="education-authorized-person-card__pending-chip">
                                      Verify PAN to continue with person details.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isVerified && (
                              <div className="education-authorized-person-card__details">
                                <div className="row g-3">
                                  <div className="form-group col-sm-12 col-lg-6">
                                    <label className="form-label">Name<sup>*</sup></label>
                                    <InputText
                                      className="form-control"
                                      placeholder="Authorized person name"
                                      value={person.fullName}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(index, "fullName", e.target.value)
                                      }
                                      disabled
                                    />
                                    {formErrors[`authorizedPersons.${index}.fullName`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.fullName`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-6">
                                    <label className="form-label">Constitution<sup>*</sup></label>
                                    <InputText
                                      className="form-control"
                                      placeholder="Enter constitution"
                                      value={person.constitution}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(
                                          index,
                                          "constitution",
                                          e.target.value,
                                        )
                                      }
                                      disabled
                                    />
                                    {formErrors[`authorizedPersons.${index}.constitution`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.constitution`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-4">
                                    <label className="form-label">DOB<sup>*</sup></label>
                                    <InputText
                                      value={person.dateOfBirth}
                                      className="form-control"
                                      disabled
                                    />
                                    {formErrors[`authorizedPersons.${index}.dateOfBirth`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.dateOfBirth`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-4">
                                    <label className="form-label">Gender<sup>*</sup></label>
                                    <Dropdown
                                      className="w-100"
                                      value={person.gender}
                                      options={genderOptions}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(index, "gender", e.value)
                                      }
                                      placeholder="Select gender"
                                      disabled
                                    />
                                    {formErrors[`authorizedPersons.${index}.gender`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.gender`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-4">
                                    <label className="form-label">GST Details</label>
                                    <InputText
                                      className="form-control"
                                      placeholder="Enter GST details"
                                      value={person.gstNumber}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(
                                          index,
                                          "gstNumber",
                                          e.target.value.toUpperCase(),
                                        )
                                      }
                                      disabled
                                    />
                                    {formErrors[`authorizedPersons.${index}.gstNumber`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.gstNumber`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-4">
                                    <label className="form-label">Mobile Number<sup>*</sup></label>
                                    <InputText
                                      className="form-control"
                                      maxLength={10}
                                      placeholder="Enter mobile number"
                                      value={person.mobileNumber}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(
                                          index,
                                          "mobileNumber",
                                          e.target.value.replace(/\D/g, "").slice(0, 10),
                                        )
                                      }
                                    />
                                    {formErrors[`authorizedPersons.${index}.mobileNumber`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.mobileNumber`]}
                                      </small>
                                    )}
                                  </div>

                                  <div className="form-group col-sm-12 col-lg-4">
                                    <label className="form-label">Email<sup>*</sup></label>
                                    <InputText
                                      className="form-control"
                                      placeholder="Enter email address"
                                      value={person.email}
                                      onChange={(e) =>
                                        handleAuthorizedPersonChange(index, "email", e.target.value)
                                      }
                                    />
                                    {formErrors[`authorizedPersons.${index}.email`] && (
                                      <small className="error">
                                        {formErrors[`authorizedPersons.${index}.email`]}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Upload Agreement"
        visible={showAgreementDialog}
        className="modalWrapper"
        onHide={() => {
          setShowAgreementDialog(false);
          setSelectedAgreementDocument(null);
          setAgreementError("");
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
                setShowAgreementDialog(false);
                setSelectedAgreementDocument(null);
                setAgreementError("");
              }}
            />

            <Button
              className="btn btn-orange text-center w-100"
              label="Save"
              onClick={handleCreateInstituteWithAgreement}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-12">
            <label className="form-label" htmlFor="educationInstituteAgreementUpload">
              Upload Agreement<sup>*</sup>
            </label>
            <div className="uploadFileWrapper">
              <img
                src="/assets/images/upload-cloud.svg"
                alt="upload-icon"
                loading="lazy"
              />
              <p>Upload institute agreement in PDF format only</p>
              <label className="btn btn-black-line" htmlFor="educationInstituteAgreementUpload">
                Upload PDF
              </label>
              <InputText
                type="file"
                id="educationInstituteAgreementUpload"
                accept=".pdf,application/pdf"
                onChange={handleAgreementSelection}
                className="d-none"
              />
            </div>
            {selectedAgreementDocument && (
              <span className="text-muted mt-2 d-block">
                Selected File: {selectedAgreementDocument.name}
              </span>
            )}
            {agreementError && <small className="error">{agreementError}</small>}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManagedEducationInstitute;

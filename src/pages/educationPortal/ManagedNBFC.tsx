import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
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
  addNbfcInstituteDocument,
  createNbfcInstitute,
  getNbfcAuthorizedPersonPanPreview,
  getNbfcInstitutePanPreview,
  getNbfcInstitutes,
  updateNbfcInstitute,
} from "../../utils/demo/demoNbfcInstitutes";
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

const createEmptyAuthorizedPerson = (): IEducationInstituteAuthorizedPerson => ({
  id: `nbfc-auth-person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

const defaultNbfcForm: IEducationInstituteFormData = {
  institutePanNumber: "",
  instituteName: "",
  category: "NBFC",
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

const ManagedNBFC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [nbfcList, setNbfcList] = useState<IEducationInstitute[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });
  const [selectedState, setSelectedState] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [showNbfcPanDialog, setShowNbfcPanDialog] = useState<boolean>(false);
  const [showAddNbfcDialog, setShowAddNbfcDialog] = useState<boolean>(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [selectedNbfc, setSelectedNbfc] = useState<IEducationInstitute | null>(null);
  const [nbfcForm, setNbfcForm] = useState<IEducationInstituteFormData>(defaultNbfcForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [verifiedNbfcPan, setVerifiedNbfcPan] = useState<boolean>(false);
  const [selectedAgreementDocument, setSelectedAgreementDocument] =
    useState<File | null>(null);
  const [agreementError, setAgreementError] = useState<string>("");

  const fetchNbfcList = (): void => {
    setLoading(true);
    setNbfcList(getNbfcInstitutes());
    setLoading(false);
  };

  const resetNbfcForm = (): void => {
    setNbfcForm({
      ...defaultNbfcForm,
      authorizedPersons: [createEmptyAuthorizedPerson()],
    });
    setFormErrors({});
    setVerifiedNbfcPan(false);
    setSelectedAgreementDocument(null);
    setAgreementError("");
    setSelectedNbfc(null);
  };

  const handleCloseAddFlow = (): void => {
    setShowNbfcPanDialog(false);
    setShowAddNbfcDialog(false);
    setShowAgreementDialog(false);
    resetNbfcForm();
  };

  const filteredNbfcList = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return nbfcList.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.instituteName.toLowerCase().includes(searchValue) ||
        item.instituteCode.toLowerCase().includes(searchValue) ||
        item.contactPerson.toLowerCase().includes(searchValue) ||
        item.city.toLowerCase().includes(searchValue);

      const matchesState = !selectedState || item.state === selectedState;

      return matchesSearch && matchesState;
    });
  }, [filterReq.searchText, nbfcList, selectedState]);

  const paginatedNbfcList = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredNbfcList.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredNbfcList]);

  const handleNbfcFieldChange = (
    fieldName: keyof IEducationInstituteFormData,
    value: string | boolean | IEducationInstituteAuthorizedPerson[],
  ): void => {
    setNbfcForm((prev) => ({
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
    const nextAuthorizedPersons = [...nbfcForm.authorizedPersons];
    nextAuthorizedPersons[index] = {
      ...nextAuthorizedPersons[index],
      [fieldName]: value,
    };

    setNbfcForm((prev) => ({
      ...prev,
      contactPerson: index === 0 && fieldName === "fullName" ? value : prev.contactPerson,
      authorizedPersons: nextAuthorizedPersons,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [`authorizedPersons.${index}.${fieldName}`]: "",
    }));
  };

  const handleVerifyNbfcPan = (): void => {
    const normalizedPanNumber = nbfcForm.institutePanNumber.trim().toUpperCase();

    if (!PAN_NUMBER_PATTERN.test(normalizedPanNumber)) {
      setFormErrors((prev) => ({
        ...prev,
        institutePanNumber: "Enter a valid PAN number before verification.",
      }));
      return;
    }

    const nbfcPreview = getNbfcInstitutePanPreview(normalizedPanNumber);

    setNbfcForm((prev) => ({
      ...prev,
      institutePanNumber: normalizedPanNumber,
      instituteName: nbfcPreview.instituteName,
      category: nbfcPreview.category,
      mobileNumber: nbfcPreview.mobileNumber,
      email: nbfcPreview.email,
      gstNumber: nbfcPreview.gstNumber,
      registrationNumber:
        prev.registrationNumber || `NBFC-${normalizedPanNumber.slice(0, 4)}-2026`,
      address: prev.address || `${nbfcPreview.instituteName}, India`,
    }));
    setVerifiedNbfcPan(true);
    setFormErrors((prev) => ({
      ...prev,
      institutePanNumber: "",
    }));
    setShowNbfcPanDialog(false);
    setShowAddNbfcDialog(true);
    toastSuccess("NBFC PAN verified successfully.");
  };

  const handleVerifyAuthorizedPersonPan = (index: number): void => {
    const authorizedPerson = nbfcForm.authorizedPersons[index];
    const normalizedPanNumber = authorizedPerson.panNumber.trim().toUpperCase();

    if (!PAN_NUMBER_PATTERN.test(normalizedPanNumber)) {
      setFormErrors((prev) => ({
        ...prev,
        [`authorizedPersons.${index}.panNumber`]:
          "Enter a valid PAN number before verification.",
      }));
      return;
    }

    const personPreview = getNbfcAuthorizedPersonPanPreview(normalizedPanNumber);
    const nextAuthorizedPersons = [...nbfcForm.authorizedPersons];
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

    setNbfcForm((prev) => ({
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
    if (nbfcForm.authorizedPersons.length >= 3) {
      toastError("You can add up to 3 authorized persons only.");
      return;
    }

    handleNbfcFieldChange("authorizedPersons", [
      ...nbfcForm.authorizedPersons,
      createEmptyAuthorizedPerson(),
    ]);
  };

  const removeAuthorizedPerson = (index: number): void => {
    if (nbfcForm.authorizedPersons.length === 1) return;

    const nextAuthorizedPersons = nbfcForm.authorizedPersons.filter(
      (_, personIndex) => personIndex !== index,
    );

    setNbfcForm((prev) => ({
      ...prev,
      contactPerson: nextAuthorizedPersons[0]?.fullName || "",
      authorizedPersons: nextAuthorizedPersons,
    }));
  };

  const validateAddNbfcForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!verifiedNbfcPan) {
      nextErrors.institutePanNumber = "Verify NBFC PAN first.";
    }

    if (!nbfcForm.instituteName.trim()) {
      nextErrors.instituteName = "NBFC name is required.";
    }

    if (!nbfcForm.category.trim()) {
      nextErrors.category = "Category is required.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(nbfcForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(nbfcForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      nbfcForm.gstNumber.trim() &&
      !GST_NUMBER_PATTERN.test(nbfcForm.gstNumber.trim().toUpperCase())
    ) {
      nextErrors.gstNumber = "Enter a valid GST number.";
    }

    nbfcForm.authorizedPersons.forEach((person, index) => {
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

  const validateEditForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!nbfcForm.instituteName.trim()) {
      nextErrors.instituteName = "NBFC name is required.";
    }

    if (!nbfcForm.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact person is required.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(nbfcForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(nbfcForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!nbfcForm.state) {
      nextErrors.state = "State is required.";
    }

    if (!nbfcForm.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!nbfcForm.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (
      nbfcForm.gstNumber.trim() &&
      !GST_NUMBER_PATTERN.test(nbfcForm.gstNumber.trim().toUpperCase())
    ) {
      nextErrors.gstNumber = "Enter a valid GST number.";
    }

    if (
      nbfcForm.institutePanNumber.trim() &&
      !PAN_NUMBER_PATTERN.test(nbfcForm.institutePanNumber.trim().toUpperCase())
    ) {
      nextErrors.institutePanNumber = "Enter a valid PAN number.";
    }

    if (!nbfcForm.registrationNumber.trim()) {
      nextErrors.registrationNumber = "Registration number is required.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenAgreementDialog = (): void => {
    if (!validateAddNbfcForm()) return;
    setShowAgreementDialog(true);
  };

  const handleAgreementSelection = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

  const handleCreateNbfcWithAgreement = (): void => {
    if (!selectedAgreementDocument) {
      setAgreementError("Agreement document is required.");
      return;
    }

    setLoading(true);

    const nextNbfc = createNbfcInstitute({
      ...nbfcForm,
      institutePanNumber: nbfcForm.institutePanNumber.trim().toUpperCase(),
      gstNumber: nbfcForm.gstNumber.trim().toUpperCase(),
      contactPerson:
        nbfcForm.authorizedPersons[0]?.fullName || nbfcForm.contactPerson,
      authorizedPersons: nbfcForm.authorizedPersons.map((person) => ({
        ...person,
        panNumber: person.panNumber.trim().toUpperCase(),
        fullName: person.fullName.trim(),
        constitution: person.constitution.trim(),
        gstNumber: person.gstNumber.trim().toUpperCase(),
        mobileNumber: person.mobileNumber.trim(),
        email: person.email.trim(),
      })),
    });

    addNbfcInstituteDocument(nextNbfc.id, "Agreement", selectedAgreementDocument);

    toastSuccess(`${nextNbfc.instituteName} added successfully.`);
    setShowAgreementDialog(false);
    setShowAddNbfcDialog(false);
    resetNbfcForm();
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
    fetchNbfcList();
    setLoading(false);
  };

  const openAddDialog = (): void => {
    resetNbfcForm();
    setShowNbfcPanDialog(true);
  };

  const openEditDialog = (nbfcData: IEducationInstitute): void => {
    setSelectedNbfc(nbfcData);
    setNbfcForm({
      institutePanNumber: nbfcData.panNumber,
      instituteName: nbfcData.instituteName,
      category: nbfcData.category || "NBFC",
      mobileNumber: nbfcData.mobileNumber,
      email: nbfcData.email,
      gstNumber: nbfcData.gstNumber,
      contactPerson: nbfcData.contactPerson,
      state: nbfcData.state,
      city: nbfcData.city,
      address: nbfcData.address,
      registrationNumber: nbfcData.registrationNumber,
      isActive: nbfcData.isActive,
      authorizedPersons:
        nbfcData.authorizedPersons?.length > 0
          ? nbfcData.authorizedPersons.map((person) => ({ ...person }))
          : [createEmptyAuthorizedPerson()],
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const handleSaveEditedNbfc = (): void => {
    if (!selectedNbfc || !validateEditForm()) return;

    setLoading(true);

    const updatedNbfc = updateNbfcInstitute(selectedNbfc.id, {
      instituteName: nbfcForm.instituteName.trim(),
      contactPerson: nbfcForm.contactPerson.trim(),
      mobileNumber: nbfcForm.mobileNumber.trim(),
      email: nbfcForm.email.trim(),
      state: nbfcForm.state,
      city: nbfcForm.city.trim(),
      address: nbfcForm.address.trim(),
      gstNumber: nbfcForm.gstNumber.trim().toUpperCase(),
      panNumber: nbfcForm.institutePanNumber.trim().toUpperCase(),
      registrationNumber: nbfcForm.registrationNumber.trim(),
      isActive: nbfcForm.isActive,
    });

    if (updatedNbfc) {
      toastSuccess(`${updatedNbfc.instituteName} updated successfully.`);
    }

    setShowEditDialog(false);
    resetNbfcForm();
    fetchNbfcList();
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
    const viewId = `nbfc-view-${rowData.id}`;
    const editId = `nbfc-edit-${rowData.id}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${editId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View NBFC"
          onClick={() =>
            navigate(
              RoutePathConstant.private.educationManagedNbfcDetail.replace(":id", rowData.id),
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" />
        </Button>

        <Button
          id={editId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Edit NBFC"
          onClick={() => openEditDialog(rowData)}
        >
          <i className="bi bi-pencil" />
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
    fetchNbfcList();
  }, []);

  useEffect(() => {
    setTotalRecords(filteredNbfcList.length);
  }, [filteredNbfcList]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Manage NBFC" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by NBFC, code, contact"
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
                  <Button onClick={openAddDialog} className="btn btn-orange">
                    <i className="bi bi-plus-circle me-2" />
                    Add NBFC
                  </Button>
                </div>
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={paginatedNbfcList}
                  emptyMessage="No NBFC records found."
                >
                  <Column field="instituteCode" header="NBFC Code" />
                  <Column field="instituteName" header="NBFC Name" />
                  <Column field="contactPerson" header="Authorized Person" />
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

              {!IsNullOrEmptyArray(paginatedNbfcList) && (
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
        visible={showNbfcPanDialog}
        className="modalWrapper"
        onHide={handleCloseAddFlow}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "650px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseAddFlow}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleVerifyNbfcPan}
              label="Next"
            />
          </div>
        }
      >
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3" style={{ fontSize: "16px", fontWeight: "400" }}>
              Enter the PAN Card number to authenticate the NBFC and continue
              with NBFC onboarding.
            </p>

            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="nbfcPanNumberVerify">
                PAN <sup>*</sup>
              </label>
              <InputText
                id="nbfcPanNumberVerify"
                autoFocus
                className="form-control"
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                value={nbfcForm.institutePanNumber}
                maxLength={10}
                onChange={(e) =>
                  handleNbfcFieldChange(
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
        header="Confirm NBFC Details"
        visible={showAddNbfcDialog}
        className="modalWrapper"
        onHide={handleCloseAddFlow}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "960px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseAddFlow}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleOpenAgreementDialog}
              label="Save NBFC"
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
              <label className="form-label" htmlFor="nbfcName">
                Name<sup>*</sup>
              </label>
              <InputText
                id="nbfcName"
                className="form-control"
                value={nbfcForm.instituteName}
                disabled
              />
              {formErrors.instituteName && <small className="error">{formErrors.instituteName}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="nbfcEmail">
                Email<sup>*</sup>
              </label>
              <InputText
                id="nbfcEmail"
                className="form-control"
                value={nbfcForm.email}
                disabled
              />
              {formErrors.email && <small className="error">{formErrors.email}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="nbfcCategory">
                Category<sup>*</sup>
              </label>
              <InputText
                id="nbfcCategory"
                className="form-control"
                value={nbfcForm.category}
                disabled
              />
              {formErrors.category && <small className="error">{formErrors.category}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="nbfcMobileNumber">
                Mobile Number<sup>*</sup>
              </label>
              <InputText
                id="nbfcMobileNumber"
                className="form-control"
                maxLength={10}
                value={nbfcForm.mobileNumber}
                disabled
              />
              {formErrors.mobileNumber && <small className="error">{formErrors.mobileNumber}</small>}
            </div>

            <div className="form-group col-sm-12 col-lg-6">
              <label className="form-label" htmlFor="nbfcGstNumber">
                GST Details
              </label>
              <InputText
                id="nbfcGstNumber"
                className="form-control"
                value={nbfcForm.gstNumber}
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
                  {nbfcForm.authorizedPersons.map((person, index) => (
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

                              {nbfcForm.authorizedPersons.length > 1 && (
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
                                  {!isVerified && (
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
                                        handleAuthorizedPersonChange(index, "constitution", e.target.value)
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
              onClick={handleCreateNbfcWithAgreement}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-12">
            <label className="form-label" htmlFor="nbfcAgreementUpload">
              Upload Agreement<sup>*</sup>
            </label>
            <div className="uploadFileWrapper">
              <img src="/assets/images/upload-cloud.svg" alt="upload-icon" loading="lazy" />
              <p>Upload NBFC agreement in PDF format only</p>
              <label className="btn btn-black-line" htmlFor="nbfcAgreementUpload">
                Upload PDF
              </label>
              <InputText
                type="file"
                id="nbfcAgreementUpload"
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

      <Dialog
        header="Update NBFC"
        visible={showEditDialog}
        className="modalWrapper"
        onHide={() => {
          setShowEditDialog(false);
          resetNbfcForm();
        }}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "820px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => {
                setShowEditDialog(false);
                resetNbfcForm();
              }}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleSaveEditedNbfc}
              label="Update NBFC"
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcName">
              NBFC Name<sup>*</sup>
            </label>
            <InputText
              id="editNbfcName"
              className="form-control"
              placeholder="Enter NBFC name"
              value={nbfcForm.instituteName}
              onChange={(e) => handleNbfcFieldChange("instituteName", e.target.value)}
            />
            {formErrors.instituteName && <small className="error">{formErrors.instituteName}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcContactPerson">
              Contact Person<sup>*</sup>
            </label>
            <InputText
              id="editNbfcContactPerson"
              className="form-control"
              placeholder="Enter contact person name"
              value={nbfcForm.contactPerson}
              onChange={(e) => handleNbfcFieldChange("contactPerson", e.target.value)}
            />
            {formErrors.contactPerson && <small className="error">{formErrors.contactPerson}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcMobileNumber">
              Mobile Number<sup>*</sup>
            </label>
            <InputText
              id="editNbfcMobileNumber"
              className="form-control"
              placeholder="Enter 10-digit mobile number"
              value={nbfcForm.mobileNumber}
              maxLength={10}
              onChange={(e) =>
                handleNbfcFieldChange(
                  "mobileNumber",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
            {formErrors.mobileNumber && <small className="error">{formErrors.mobileNumber}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcEmail">
              Email<sup>*</sup>
            </label>
            <InputText
              id="editNbfcEmail"
              className="form-control"
              placeholder="Enter NBFC email"
              value={nbfcForm.email}
              onChange={(e) => handleNbfcFieldChange("email", e.target.value)}
            />
            {formErrors.email && <small className="error">{formErrors.email}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcState">
              State<sup>*</sup>
            </label>
            <Dropdown
              id="editNbfcState"
              className="w-100"
              value={nbfcForm.state}
              options={stateOptions}
              onChange={(e) => handleNbfcFieldChange("state", e.value)}
              placeholder="Select state"
            />
            {formErrors.state && <small className="error">{formErrors.state}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcCity">
              City<sup>*</sup>
            </label>
            <InputText
              id="editNbfcCity"
              className="form-control"
              placeholder="Enter city"
              value={nbfcForm.city}
              onChange={(e) => handleNbfcFieldChange("city", e.target.value)}
            />
            {formErrors.city && <small className="error">{formErrors.city}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcRegistrationNumber">
              Registration Number<sup>*</sup>
            </label>
            <InputText
              id="editNbfcRegistrationNumber"
              className="form-control"
              placeholder="Enter registration number"
              value={nbfcForm.registrationNumber}
              onChange={(e) => handleNbfcFieldChange("registrationNumber", e.target.value)}
            />
            {formErrors.registrationNumber && (
              <small className="error">{formErrors.registrationNumber}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcGstNumber">
              GST Number
            </label>
            <InputText
              id="editNbfcGstNumber"
              className="form-control"
              placeholder="Enter GST number"
              value={nbfcForm.gstNumber}
              onChange={(e) => handleNbfcFieldChange("gstNumber", e.target.value.toUpperCase())}
            />
            {formErrors.gstNumber && <small className="error">{formErrors.gstNumber}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="editNbfcPanNumber">
              PAN Number
            </label>
            <InputText
              id="editNbfcPanNumber"
              className="form-control"
              placeholder="Enter PAN number"
              value={nbfcForm.institutePanNumber}
              onChange={(e) =>
                handleNbfcFieldChange("institutePanNumber", e.target.value.toUpperCase())
              }
            />
            {formErrors.institutePanNumber && (
              <small className="error">{formErrors.institutePanNumber}</small>
            )}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="editNbfcAddress">
              Address<sup>*</sup>
            </label>
            <InputTextarea
              id="editNbfcAddress"
              className="form-control"
              autoResize
              rows={4}
              placeholder="Enter full NBFC address"
              value={nbfcForm.address}
              onChange={(e) => handleNbfcFieldChange("address", e.target.value)}
            />
            {formErrors.address && <small className="error">{formErrors.address}</small>}
          </div>

          <div className="form-group col-12">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div>
                <label className="form-label d-block mb-2">Status</label>
                <div className="d-flex align-items-center gap-2">
                  <InputSwitch
                    checked={!!nbfcForm.isActive}
                    onChange={(e) => handleNbfcFieldChange("isActive", !!e.value)}
                  />
                  <span>{nbfcForm.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManagedNBFC;

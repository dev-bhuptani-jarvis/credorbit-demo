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
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { Tooltip } from "primereact/tooltip";
import {
  IEducationInstitute,
  IEducationInstituteFormData,
} from "../../interface/educationInstitute";
import { PaginateReqEntity } from "../../interface/pagination";
import { debounceTimeInMilliseconds, formatMobileNumber } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  GST_NUMBER_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  createNbfcInstitute,
  getNbfcInstitutes,
  updateNbfcInstitute,
} from "../../utils/demo/demoNbfcInstitutes";
import { formatDate, toastSuccess } from "../../utils/functions/shared";
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

const defaultNbfcForm: IEducationInstituteFormData = {
  instituteName: "",
  contactPerson: "",
  mobileNumber: "",
  email: "",
  state: "",
  city: "",
  address: "",
  gstNumber: "",
  panNumber: "",
  registrationNumber: "",
  isActive: true,
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

  const [showNbfcDialog, setShowNbfcDialog] = useState<boolean>(false);

  const [selectedNbfc, setSelectedNbfc] = useState<IEducationInstitute | null>(null);

  const [nbfcForm, setNbfcForm] = useState<IEducationInstituteFormData>(defaultNbfcForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isEditMode = !!selectedNbfc;

  const fetchNbfcList = (): void => {
    setLoading(true);
    setNbfcList(getNbfcInstitutes());
    setLoading(false);
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

  const handleFormFieldChange = (
    fieldName: keyof IEducationInstituteFormData,
    value: string | boolean,
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

  const validateNbfcForm = (): boolean => {
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
      nbfcForm.panNumber.trim() &&
      !PAN_NUMBER_PATTERN.test(nbfcForm.panNumber.trim().toUpperCase())
    ) {
      nextErrors.panNumber = "Enter a valid PAN number.";
    }

    if (!nbfcForm.registrationNumber.trim()) {
      nextErrors.registrationNumber = "Registration number is required.";
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = (): void => {
    setNbfcForm(defaultNbfcForm);
    setFormErrors({});
    setSelectedNbfc(null);
  };

  const openAddDialog = (): void => {
    resetForm();
    setShowNbfcDialog(true);
  };

  const openEditDialog = (nbfcData: IEducationInstitute): void => {
    setSelectedNbfc(nbfcData);
    setNbfcForm({
      instituteName: nbfcData.instituteName,
      contactPerson: nbfcData.contactPerson,
      mobileNumber: nbfcData.mobileNumber,
      email: nbfcData.email,
      state: nbfcData.state,
      city: nbfcData.city,
      address: nbfcData.address,
      gstNumber: nbfcData.gstNumber,
      panNumber: nbfcData.panNumber,
      registrationNumber: nbfcData.registrationNumber,
      isActive: nbfcData.isActive,
    });
    setFormErrors({});
    setShowNbfcDialog(true);
  };

  const handleSaveNbfc = (): void => {
    if (!validateNbfcForm()) return;

    setLoading(true);

    const payload: IEducationInstituteFormData = {
      ...nbfcForm,
      gstNumber: nbfcForm.gstNumber.trim().toUpperCase(),
      panNumber: nbfcForm.panNumber.trim().toUpperCase(),
    };

    if (selectedNbfc) {
      const updatedNbfc = updateNbfcInstitute(selectedNbfc.id, payload);

      if (updatedNbfc) {
        toastSuccess(`${updatedNbfc.instituteName} updated successfully.`);
      }
    } else {
      const createdNbfc = createNbfcInstitute(payload);
      toastSuccess(`${createdNbfc.instituteName} added successfully.`);
    }

    setShowNbfcDialog(false);
    resetForm();
    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
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
        header={isEditMode ? "Update NBFC" : "Add NBFC"}
        visible={showNbfcDialog}
        className="modalWrapper"
        onHide={() => {
          setShowNbfcDialog(false);
          resetForm();
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
                setShowNbfcDialog(false);
                resetForm();
              }}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleSaveNbfc}
              label={isEditMode ? "Update NBFC" : "Save NBFC"}
            />
          </div>
        }
      >
        <div className="row g-3">
          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcName">
              NBFC Name<sup>*</sup>
            </label>
            <InputText
              id="nbfcName"
              className="form-control"
              placeholder="Enter NBFC name"
              value={nbfcForm.instituteName}
              onChange={(e) => handleFormFieldChange("instituteName", e.target.value)}
            />
            {formErrors.instituteName && (
              <small className="error">{formErrors.instituteName}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcContactPerson">
              Contact Person<sup>*</sup>
            </label>
            <InputText
              id="nbfcContactPerson"
              className="form-control"
              placeholder="Enter contact person name"
              value={nbfcForm.contactPerson}
              onChange={(e) => handleFormFieldChange("contactPerson", e.target.value)}
            />
            {formErrors.contactPerson && (
              <small className="error">{formErrors.contactPerson}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcMobileNumber">
              Mobile Number<sup>*</sup>
            </label>
            <InputText
              id="nbfcMobileNumber"
              className="form-control"
              placeholder="Enter 10-digit mobile number"
              value={nbfcForm.mobileNumber}
              maxLength={10}
              onChange={(e) =>
                handleFormFieldChange(
                  "mobileNumber",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
            />
            {formErrors.mobileNumber && (
              <small className="error">{formErrors.mobileNumber}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcEmail">
              Email<sup>*</sup>
            </label>
            <InputText
              id="nbfcEmail"
              className="form-control"
              placeholder="Enter NBFC email"
              value={nbfcForm.email}
              onChange={(e) => handleFormFieldChange("email", e.target.value)}
            />
            {formErrors.email && <small className="error">{formErrors.email}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcState">
              State<sup>*</sup>
            </label>
            <Dropdown
              id="nbfcState"
              className="w-100"
              value={nbfcForm.state}
              options={stateOptions}
              onChange={(e) => handleFormFieldChange("state", e.value)}
              placeholder="Select state"
            />
            {formErrors.state && <small className="error">{formErrors.state}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcCity">
              City<sup>*</sup>
            </label>
            <InputText
              id="nbfcCity"
              className="form-control"
              placeholder="Enter city"
              value={nbfcForm.city}
              onChange={(e) => handleFormFieldChange("city", e.target.value)}
            />
            {formErrors.city && <small className="error">{formErrors.city}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcRegistrationNumber">
              Registration Number<sup>*</sup>
            </label>
            <InputText
              id="nbfcRegistrationNumber"
              className="form-control"
              placeholder="Enter registration number"
              value={nbfcForm.registrationNumber}
              onChange={(e) =>
                handleFormFieldChange("registrationNumber", e.target.value)
              }
            />
            {formErrors.registrationNumber && (
              <small className="error">{formErrors.registrationNumber}</small>
            )}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcGstNumber">
              GST Number
            </label>
            <InputText
              id="nbfcGstNumber"
              className="form-control"
              placeholder="Enter GST number"
              value={nbfcForm.gstNumber}
              onChange={(e) =>
                handleFormFieldChange("gstNumber", e.target.value.toUpperCase())
              }
            />
            {formErrors.gstNumber && <small className="error">{formErrors.gstNumber}</small>}
          </div>

          <div className="form-group col-sm-12 col-lg-6">
            <label className="form-label" htmlFor="nbfcPanNumber">
              PAN Number
            </label>
            <InputText
              id="nbfcPanNumber"
              className="form-control"
              placeholder="Enter PAN number"
              value={nbfcForm.panNumber}
              onChange={(e) =>
                handleFormFieldChange("panNumber", e.target.value.toUpperCase())
              }
            />
            {formErrors.panNumber && <small className="error">{formErrors.panNumber}</small>}
          </div>

          <div className="form-group col-12">
            <label className="form-label" htmlFor="nbfcAddress">
              Address<sup>*</sup>
            </label>
            <InputTextarea
              id="nbfcAddress"
              className="form-control"
              autoResize
              rows={4}
              placeholder="Enter full NBFC address"
              value={nbfcForm.address}
              onChange={(e) => handleFormFieldChange("address", e.target.value)}
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
                    onChange={(e) => handleFormFieldChange("isActive", !!e.value)}
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

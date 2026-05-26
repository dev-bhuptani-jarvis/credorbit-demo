import { useEffect, useState } from "react";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getClientMasterAPI } from "../../utils/axios/apiServices";
import {
  ICategoryList,
  IClientMaster,
  IClientMasterListingParams,
  IClientMasterResponse,
} from "../../interface/clientMaster";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import {
  formatDate,
  handleDownloadCSVData,
  shouldShowContractModal,
  toastError,
} from "../../utils/functions/shared";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import SearchButton from "../../components/SearchButton";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { PaginateReqEntity } from "../../interface/pagination";
import { Column } from "primereact/column";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import ImpersonateUserModal from "../../components/ImpersonateUserModal";
import useDebouncedEffect from "../../hooks/useDebounce";
import usePermission from "../../hooks/usePermission";
import AddPanModal from "../../components/AddPanModal";
import { Dropdown } from "primereact/dropdown";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const ClientMaster = () => {
  const [clientMaster, setClientMaster] = useState<IClientMaster[]>([]);

  const [impersonateId, setImpersonateId] = useState<string>("");

  const [impersonateModal, setImpersonateModal] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
    status: "",
  });

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [categoryList, setCategoryList] = useState<ICategoryList[]>([]);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const {
    userID,
    showPanDetailPopUp,
    userType,
    isContractSigned,
    contractEnforcementDate,
  } = useSelector((state: RootState) => state.user.user);

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const navigate = useNavigate();

  const { create, view } = usePermission("ClientMaster", ["create", "view"])();

  const headersMap: Record<string, string> = {
    Code: "customerCode",
    Name: "fullName",
    "Registration Date": "createdDate",
    "Mobile Number": "phoneNumber",
  };

  const handleImpersonate = (userId: string): void => {
    setImpersonateId(userId);
    setImpersonateModal(true);
  };

  const fetchClientMasterListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IClientMasterListingParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      parentID: userID,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.customerName = filterReq.searchText?.trim();
    }

    if (filterReq.status) {
      queryParams.categoryID = filterReq.status;
    }

    const response: IClientMasterResponse =
      await getClientMasterAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setTotalRecords(response.data.totalCount);
      setCategoryList(response.data.categoryList);
      setClientMaster(response.data.customersList);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const statusBodyTemplate = (rowData: IClientMaster): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const actionBody = (partner: IClientMaster): JSX.Element => {
    const viewTooltipId = `view-client-${partner.id}`;

    return (
      <>
        {view && (
          <>
            <Tooltip target={`#${viewTooltipId}`} position="top" />
            <Button
              id={viewTooltipId}
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.userMasterClientMaster}/${partner.id}`,
                )
              }
              className="trash-icon p-0 ms-3"
              data-pr-tooltip="View Client"
            >
              <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
            </Button>
          </>
        )}
      </>
    );
  };

  const fetchAllClientList = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IClientMasterListingParams = {
      page: 0,
      pageSize: 0,
      parentID: userID,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.customerName = filterReq.searchText?.trim();
    }

    if (filterReq.status) {
      queryParams.categoryID = filterReq.status;
    }

    const response: IClientMasterResponse =
      await getClientMasterAPI(queryParams);

    if (!response) return;

    if (response.statusCode === 200) {
      const decryptedData = response.data.customersList.map((client) => ({
        ...client,
        phoneNumber: client.phoneNumber
          ? decryptVAPTData(client.phoneNumber)
          : "",
      }));

      handleDownloadCSVData(
        decryptedData,
        headersMap,
        `Client_${moment().format("YYYY-MM-DD")}`,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
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
    fetchClientMasterListingApi();
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    filterReq.status,
    filterReq.searchText,
    isProfileUpdated,
  ]);

  useEffect(() => {
    if (userType === CLIENT_ROLE.SOURCING_PARTNER) {
      setShowContractAgreement(!isContractSigned);
    }
  }, [isContractSigned]);

  return (
    <>
      <Loader isLoading={loading} />
      <div className="whiteBoxHldr p-24">
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="My Clients" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by Client"
                />
                <div className="form-group">
                  <Dropdown
                    style={{ width: "300px" }}
                    value={filterReq.status}
                    onChange={(e) =>
                      setFilterReq({ ...filterReq, status: e.value })
                    }
                    showClear={filterReq.status !== ""}
                    options={categoryList
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => ({
                        label: category.name,
                        value: category.id,
                      }))}
                    placeholder="Select Category"
                    className="category-dropdown"
                  />
                </div>
                {create &&
                  (userType === CLIENT_ROLE.CHANNEL_PARTNER ||
                    userType === CLIENT_ROLE.USER_MANAGEMENT) && (
                    <div className="d-flex flex-row gap-2">
                      <div className="form-group">
                        <Button
                          className="btn btn-orange"
                          onClick={() => {
                            if (
                              !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                              !isContractSigned &&
                              !hasSkippedContractAgreement &&
                              shouldShowContractModal(contractEnforcementDate)
                            ) {
                              setShowContractAgreement(true);
                            } else {
                              setPanDetailPopUp(true);
                            }
                          }}
                          icon="bi bi-plus-circle me-2"
                          label="Add Client"
                          iconPos="left"
                        />
                      </div>
                      <div className="form-group">
                        <Button
                          onClick={fetchAllClientList}
                          className="btn btn-orange"
                        >
                          <i className="bi bi-download me-2" /> Download Client
                          List
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  key={clickCounter}
                  value={clientMaster}
                  emptyMessage="No client found"
                >
                  <Column field="customerCode" header="Client Code" />

                  <Column
                    body={(rowData: IClientMaster) => {
                      const isClickable =
                        view &&
                        (userType === CLIENT_ROLE.CHANNEL_PARTNER ||
                          userType === CLIENT_ROLE.USER_MANAGEMENT);
                      const tooltipId = `tooltip-${rowData.id}`;

                      const style: React.CSSProperties = {
                        cursor: isClickable ? "pointer" : "default",
                        fontWeight: isClickable ? "bold" : "normal",
                      };

                      return (
                        <>
                          <span
                            id={tooltipId}
                            style={style}
                            onClick={() => {
                              if (!isClickable) return;

                              if (
                                !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                                !isContractSigned &&
                                !hasSkippedContractAgreement &&
                                shouldShowContractModal(contractEnforcementDate)
                              ) {
                                setShowContractAgreement(true);
                              } else {
                                if (showPanDetailPopUp) {
                                  setPanDetailPopUp(true);
                                } else {
                                  handleImpersonate(rowData.id);
                                }
                              }
                            }}
                          >
                            {rowData.fullName}
                          </span>
                          {isClickable && (
                            <Tooltip
                              target={`#${tooltipId}`}
                              content="Login as Client"
                              position="top"
                            />
                          )}
                        </>
                      );
                    }}
                    header="Client Name"
                  />

                  <Column
                    body={(rowData: IClientMaster) =>
                      formatDate(rowData.createdDate)
                    }
                    header="Registered Date"
                  />

                  <Column
                    body={(rowData: IClientMaster) =>
                      formatMobileNumber(rowData.phoneNumber)
                    }
                    header="Mobile Number"
                  />

                  <Column body={statusBodyTemplate} header="Status" />

                  {(create || view) && (
                    <Column body={actionBody} header="Action" />
                  )}
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(clientMaster) && (
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

      <AddPanModal
        panDetailPopUp={panDetailPopUp}
        setPanDetailPopUp={setPanDetailPopUp}
        showPartnerOption={String(showPanDetailPopUp) === "true" ? false : true}
        targetUser={CLIENT_ROLE.CUSTOMER}
      />

      <ContractAgreementModal
        showContractAgreement={
          showContractAgreement &&
          shouldShowContractModal(contractEnforcementDate)
        }
        setShowContractAgreement={(value) => {
          if (!value) {
            setHasSkippedContractAgreement(true);
            setClickCounter((prev) => prev + 1);
          }
          setShowContractAgreement(value);
        }}
      />

      <ImpersonateUserModal
        impersonateModal={impersonateModal}
        setImpersonateModal={setImpersonateModal}
        impersonateId={impersonateId}
      />
    </>
  );
};

export default ClientMaster;

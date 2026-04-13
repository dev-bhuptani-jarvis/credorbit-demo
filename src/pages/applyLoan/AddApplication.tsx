import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  IClientMaster,
  IClientMasterListingParams,
  IClientMasterResponse,
} from "../../interface/clientMaster";
import { getClientMasterAPI } from "../../utils/axios/apiServices";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { PaginateReqEntity } from "../../interface/pagination";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  formatDate,
  shouldShowContractModal,
  toastError,
} from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { Steps } from "primereact/steps";
import useDebouncedEffect from "../../hooks/useDebounce";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import SearchButton from "../../components/SearchButton";
import Loader from "../../components/Loader";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import AddPanModal from "../../components/AddPanModal";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const AddApplication = () => {
  const [clientMaster, setClientMaster] = useState<IClientMaster[]>([]);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedClient, setSelectedClient] = useState<IClientMaster | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(false);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const navigate = useNavigate();

  const {
    userID,
    isContractSigned,
    userType,
    showPanDetailPopUp,
    contractEnforcementDate,
  } = useSelector((state: RootState) => state.user.user);

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const items = [{ label: "Select Client" }, { label: "Select Loan" }];

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const fetchClientMasterListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IClientMasterListingParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      parentID: userID,
      isShowOnlyActiveClients: true,
      needCpAndSpClients: true,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.customerName = filterReq.searchText?.trim();
    }

    const response: IClientMasterResponse = await getClientMasterAPI(
      queryParams
    );

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = response.data.customersList.map((customer) => ({
        ...customer,
        phoneNumber: decryptVAPTData(customer.phoneNumber),
      }));

      setTotalRecords(response.data.totalCount);
      setClientMaster(decryptedData);
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
    [searchText]
  );

  useEffect(() => {
    fetchClientMasterListingApi();
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    filterReq.searchText,
    isProfileUpdated,
  ]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="row">
          <div className="col-lg-12 mb-5">
            <div className="titleMainWrapper">
              <h2 className="txt-30 fw-bold">Application</h2>
            </div>

            <form className="col-12" autoComplete="off">
              <div className="col-12 mt-2">
                <div className="titleMainWrapper justify-content-center d-flex flex-column">
                  <div className="req-det-steps">
                    <Steps
                      model={items}
                      activeIndex={activeIndex}
                      onSelect={(e) => setActiveIndex(e.index)}
                    />
                  </div>
                  <h2 className="txt-24 mt-4">Select Client</h2>
                  <p className="mt-2 mb-4">
                    Please select the Client from the list below for whom you
                    want to apply for a loan.
                  </p>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-between mb-4">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by Client"
                />

                {userType === CLIENT_ROLE.CHANNEL_PARTNER && (
                  <Button
                    type="button"
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
                )}
              </div>

              <div className="col-12">
                <div className="table-responsive">
                  <DataTable
                    key={clickCounter}
                    className="tableMain"
                    value={clientMaster}
                    emptyMessage="No client found"
                    dataKey="id"
                    selectionMode="single"
                    selection={selectedClient}
                    onSelectionChange={(e) =>
                      setSelectedClient(e.value as IClientMaster)
                    }
                  >
                    <Column selectionMode="single" />

                    <Column field="customerCode" header="Sr. No." />

                    <Column field="fullName" header="Client Name" />

                    <Column
                      body={(rowData) =>
                        formatMobileNumber(rowData.phoneNumber)
                      }
                      header="Mobile Number"
                    />

                    <Column
                      body={(rowData) => rowData.sourcingPartnerName ?? "-"}
                      header="Sourcing Partner Name"
                    />
                    <Column
                      body={(rowData) =>
                        formatDate(rowData.createdDate)
                      }
                      header="Registered Date"
                    />
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

              <div className="d-flex justify-content-end mt-5">
                <div className="form-group">
                  <Button
                    className="btn btn-black-line"
                    label="Cancel"
                    onClick={() =>
                      navigate(
                        RoutePathConstant.private.channelPartnerDashboard
                      )
                    }
                  />
                  <Button
                    className={`btn ${
                      selectedClient === null
                        ? "btn-orange-disabled"
                        : "btn-orange"
                    }  ms-2 text-center`}
                    label="Next"
                    disabled={selectedClient === null}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(RoutePathConstant.private.applyLoan, {
                        state: selectedClient,
                      });
                    }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AddPanModal
        panDetailPopUp={panDetailPopUp}
        setPanDetailPopUp={setPanDetailPopUp}
        showPartnerOption={String(showPanDetailPopUp) === "true" ? false : true}
        targetUser={CLIENT_ROLE.CUSTOMER}
      />

      {showContractAgreement &&
        shouldShowContractModal(contractEnforcementDate) && (
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
        )}
    </>
  );
};

export default AddApplication;

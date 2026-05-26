import { useEffect, useState } from "react";
import {
  ISourcingPartner,
  ISourcingPartnerListParams,
  ISourcingPartnerResponse,
} from "../../interface/sourcingPartner";
import { getSourcingPartnerAPI } from "../../utils/axios/apiServices";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { Button } from "primereact/button";
import SearchButton from "../../components/SearchButton";
import { PaginateReqEntity } from "../../interface/pagination";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import PrimePaginator from "../../components/PrimePaginator";
import Loader from "../../components/Loader";
import useDebouncedEffect from "../../hooks/useDebounce";
import usePermission from "../../hooks/usePermission";
import AddPanModal from "../../components/AddPanModal";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import {
  formatDate,
  handleDownloadCSVData,
  shouldShowContractModal,
  toastError,
} from "../../utils/functions/shared";
import TableTitle from "../../components/TableTitle";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import moment from "moment";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const SourcingPartner = () => {
  const [sourcingPartner, setSourcingPartner] = useState<ISourcingPartner[]>(
    [],
  );

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [searchText, setSearchText] = useState<string>("");

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const navigate = useNavigate();

  const { userType, isContractSigned, contractEnforcementDate, userID } =
    useSelector((state: RootState) => state.user.user);

  const { create, view } = usePermission("SourcingPartner", [
    "view",
    "create",
  ])();

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const fetchSourcingPartnerListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: ISourcingPartnerListParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      channelpartnerID: userID,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.sourcingPartner = filterReq.searchText?.trim();
    }

    const response: ISourcingPartnerResponse =
      await getSourcingPartnerAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setTotalRecords(response.data.totalCount);
      setSourcingPartner(response.data.sourcingPartersList);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const statusBodyTemplate = (rowData: ISourcingPartner): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const actionBody = (partner: ISourcingPartner): JSX.Element => {
    const viewTooltipId = `view-sourcing-partner-${partner.id}`;
    return (
      <>
        {view && (
          <>
            <Tooltip target={`#${viewTooltipId}`} position="top" />
            <Button
              id={viewTooltipId}
              className="trash-icon p-0"
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.userMasterSourcingPartner}/${partner.id}`,
                )
              }
              data-pr-tooltip="View Sourcing Partner"
            >
              <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
            </Button>
          </>
        )}
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const headersMap: Record<string, string> = {
    Code: "code",
    Name: "name",
    "Registration Date": "registeredDate",
    "Mobile Number": "mobileNumber",
    "No. of Registered SP": "noOfRegisteredSP",
  };

  const fetchAllSourcingPartnerList = async (): Promise<void> => {
    setLoading(true);

    const queryParams: ISourcingPartnerListParams = {
      page: 0,
      pageSize: 0,
      channelpartnerID: userID,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.sourcingPartner = filterReq.searchText?.trim();
    }

    const response: ISourcingPartnerResponse =
      await getSourcingPartnerAPI(queryParams);

    if (!response) return;

    if (response.statusCode === 200) {
      const decryptedData = response.data.sourcingPartersList.map(
        (partner) => ({
          ...partner,
          mobileNumber: partner.mobileNumber
            ? decryptVAPTData(partner.mobileNumber)
            : "",
        }),
      );

      handleDownloadCSVData(
        decryptedData,
        headersMap,
        `Sourcing_Partner_${moment().format("YYYY-MM-DD")}`,
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
    fetchSourcingPartnerListingApi();
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    isProfileUpdated,
    filterReq.searchText,
  ]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title="My Sourcing Partner" />

              <div className="BtnRightHldr">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search"
                />

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
                        >
                          <i className="bi bi-plus-circle me-2" /> Add Sourcing
                          Partner
                        </Button>
                      </div>
                      <div className="form-group">
                        <Button
                          onClick={fetchAllSourcingPartnerList}
                          className="btn btn-orange"
                        >
                          <i className="bi bi-download me-2" /> Download
                          Sourcing Partner List
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  key={clickCounter}
                  className="tableMain"
                  emptyMessage="No sourcing partners found"
                  value={sourcingPartner}
                >
                  <Column field="code" header="Sourcing Partner Code" />

                  <Column field="name" header="Sourcing Partner Name" />

                  <Column
                    body={(rowData) => formatDate(rowData.registeredDate)}
                    header="Registration Date"
                  />

                  <Column
                    body={(rowData: ISourcingPartner) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />

                  <Column body={statusBodyTemplate} header="Status" />

                  {view && <Column body={actionBody} header="Action" />}
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(sourcingPartner) && (
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
        showPartnerOption={false}
        targetUser={CLIENT_ROLE.SOURCING_PARTNER}
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
    </>
  );
};

export default SourcingPartner;

import { useEffect, useState } from "react";
import { getChannelPartnerListing } from "../../utils/axios/apiServices";
import {
  IChannelPartnerListParams,
  IChannelPartnerResponse,
  IUserMasterChannelPartner,
} from "../../interface/channelPartner";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { Button } from "primereact/button";
import { PaginateReqEntity } from "../../interface/pagination";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import Loader from "../../components/Loader";
import useDebouncedEffect from "../../hooks/useDebounce";
import usePermission from "../../hooks/usePermission";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import {
  formatDate,
  handleDownloadCSVData,
  toastError,
} from "../../utils/functions/shared";
import AddPanModal from "../../components/AddPanModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import moment from "moment";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const ChannelPartnerManagement = () => {
  const [channelPartners, setChannelPartners] = useState<
    IUserMasterChannelPartner[]
  >([]);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>("");

  const { create, view } = usePermission("ChannelPartner", [
    "view",
    "create",
  ])();

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const navigate = useNavigate();

  const fetchChannelPartners = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IChannelPartnerListParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.channelPartner = filterReq.searchText?.trim();
    }

    const response: IChannelPartnerResponse =
      await getChannelPartnerListing(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        channelPartnerList: response.data.channelPartnerList.map((item) => ({
          ...item,
          mobileNumber: item.mobileNumber
            ? decryptVAPTData(item.mobileNumber)
            : "",
        })),
      };

      setChannelPartners(decryptedData.channelPartnerList);
      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const statusBodyTemplate = (
    rowData: IUserMasterChannelPartner,
  ): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const actionBody = (partner: IUserMasterChannelPartner): JSX.Element => {
    const viewId = `cp-view-${partner.id}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        {view && (
          <Button
            id={viewId}
            className="trash-icon p-0 me-2"
            data-pr-tooltip="View Channel Partner"
            onClick={() =>
              navigate(
                `${RoutePathConstant.private.userMasterChannelPartner}/${partner.id}`,
              )
            }
          >
            <img src="/assets/images/eye.svg" alt="eye-icon" />
          </Button>
        )}
      </>
    );
  };

  const headersMap: Record<string, string> = {
    Code: "code",
    Name: "name",
    "Registration Date": "registeredDate",
    "Mobile Number": "mobileNumber",
    "No. of Registered SP": "noOfRegisteredSP",
  };

  const fetchAllChannelPartnerList = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IChannelPartnerListParams = {
      page: 0,
      pageSize: 0,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.channelPartner = filterReq.searchText?.trim();
    }

    const response: IChannelPartnerResponse =
      await getChannelPartnerListing(queryParams);

    if (!response) return;

    if (response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        channelPartnerList: response.data.channelPartnerList.map((item) => ({
          ...item,
          mobileNumber: item.mobileNumber
            ? formatMobileNumber(decryptVAPTData(item.mobileNumber))
            : "",
        })),
      };

      handleDownloadCSVData(
        decryptedData.channelPartnerList,
        headersMap,
        `Channel_Partner_${moment().format("YYYY-MM-DD")}`,
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
    fetchChannelPartners();
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
              <TableTitle title="Channel Partner" />

              <div className="BtnRightHldr">
                <div style={{ width: "300px", marginRight: "10px" }}>
                  <SearchButton
                    searchText={searchText}
                    setSearchText={setSearchText}
                    placeholder="Search by Channel Partner"
                  />
                </div>

                {create && (
                  <div className="form-group">
                    <Button
                      onClick={() => setPanDetailPopUp(!panDetailPopUp)}
                      className="btn btn-orange"
                    >
                      <i className="bi bi-plus-circle me-2" /> Add Channel
                      Partner
                    </Button>
                  </div>
                )}

                {create && (
                  <div className="form-group">
                    <Button
                      onClick={fetchAllChannelPartnerList}
                      className="btn btn-orange"
                    >
                      <i className="bi bi-download me-2" /> Download Channel
                      Partner List
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={channelPartners}
                  emptyMessage="No channel partners found."
                >
                  <Column field="code" header="Channel Partner Code" />

                  <Column field="name" header="Channel Partner Name" />

                  <Column
                    body={(rowData: IUserMasterChannelPartner) =>
                      formatDate(rowData.registeredDate, "DD MMM, YYYY h:mm A")
                    }
                    header="Registered Date"
                  />

                  <Column
                    body={(rowData: IUserMasterChannelPartner) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />

                  <Column field="noOfRegisteredSP" header="Registered SPs" />

                  <Column body={statusBodyTemplate} header="Status" />

                  {view && <Column body={actionBody} header="Action" />}
                </DataTable>
              </div>

              {!IsNullOrEmptyArray(channelPartners) && (
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
        setPanDetailPopUp={setPanDetailPopUp}
        panDetailPopUp={panDetailPopUp}
        showPartnerOption={false}
        targetUser={CLIENT_ROLE.CHANNEL_PARTNER}
      />
    </>
  );
};

export default ChannelPartnerManagement;

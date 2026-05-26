import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import SearchButton from "../../components/SearchButton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PaginateReqEntity } from "../../interface/pagination";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import useDebouncedEffect from "../../hooks/useDebounce";
import { toastError } from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { getCpReportClientListAPI } from "../../utils/axios/apiServices";
import {
  IChannelPartnerClientReportResponse,
  IChannelPartnerReportParams,
  IClientList,
} from "../../interface/reports";
import TableTitle from "../../components/TableTitle";
import usePermission from "../../hooks/usePermission";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const Report = () => {
  const [reportsData, setReportsData] = useState<IClientList[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const navigate = useNavigate();

  const { view } = usePermission("Reports", ["view"])();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const fetchReports = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IChannelPartnerReportParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.clientFilter = filterReq.searchText?.trim();
    }

    const response: IChannelPartnerClientReportResponse =
      await getCpReportClientListAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setReportsData(response.data.clientsList);
      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionBody = (rowData: IClientList): JSX.Element => {
    const viewId = `client-report-${rowData.clientID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View Client Report"
          onClick={() =>
            navigate(`${RoutePathConstant.private.reports}/${rowData.clientID}`)
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
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
    fetchReports();
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper d-flex justify-content-between">
            <TableTitle title="Reports" />
            <SearchButton
              searchText={searchText}
              setSearchText={setSearchText}
              placeholder="Search by Client"
            />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          className="tableMain"
          value={reportsData}
          emptyMessage="No reports found"
        >
          <Column
            body={(rowData, options) =>
              filterReq.pageNumber * filterReq.pageSize + options.rowIndex + 1
            }
            header="Sr. No."
          />

          <Column field="clientName" header="Client Name" />

          <Column field="clientCode" header="Client Code" />

          <Column
            body={(rowData: IClientList) => formatMobileNumber(rowData.mobile)}
            header="Mobile Number"
          />

          <Column
            body={(rowData: IClientList) => rowData.sourcingPartnerName ?? "-"}
            header="Sourcing Partner"
          />

          {view && <Column body={actionBody} header="Action" />}
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(reportsData) && (
        <PrimePaginator
          onPageChange={onPageChange}
          pageNumber={filterReq.pageNumber}
          pageSize={filterReq.pageSize}
          totalRecords={totalRecords}
        />
      )}
    </div>
  );
};

export default Report;

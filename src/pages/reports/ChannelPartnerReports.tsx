import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import usePermission from "../../hooks/usePermission";
import { getAdminChannelPartnerReportAPI } from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  IChannelPartnersQueue,
  IReportParams,
  IReportResponse,
} from "../../interface/reports";
import useDebouncedEffect from "../../hooks/useDebounce";
import { debounceTimeInMilliseconds } from "../../utils/constants/constant";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";

const ChannelPartnerReports = () => {
  const [reportsData, setReportsData] = useState<IChannelPartnersQueue[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>("");

  const { create } = usePermission("Reports", ["view", "create"])();

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const fetchReportListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IReportParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.channelPartner = filterReq.searchText?.trim();
    }

    const response: IReportResponse = await getAdminChannelPartnerReportAPI(
      queryParams
    );

    if (!response) return;

    if (response && response.statusCode === 200) {
      setReportsData(response.data.channelPartnersQueue);
      setTotalRecords(response.data.totalCount);
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
    fetchReportListingApi();
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <TableTitle title="Channel Partner Report" />
          </div>
        </div>
      </div>
      <div className="col-12 mb-3 d-flex justify-content-between">
        <div className="h-50px col-3">
          <SearchButton
            searchText={searchText}
            setSearchText={setSearchText}
            placeholder="Search"
          />
        </div>
        <div className="BtnRightHldr">
          <div className="form-group">
            {create && (
              <Button
                className="btn btn-orange"
                label="Export Report"
                onClick={() => toastSuccess("Coming Soon...")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          className="tableMain"
          value={reportsData}
          emptyMessage="No data found"
        >
          <Column
            body={(rowData, options) =>
              filterReq.pageNumber * filterReq.pageSize + options.rowIndex + 1
            }
            header="Sr. No."
          />

          <Column field="cpCode" header="Channel Partner Code" />

          <Column field="cpName" header="Channel Partner Name" />

          <Column field="spCount" header="Sourcing Partner Count" />

          <Column field="clientsCount" header="Client Count" />

          <Column field="totalLoan" header="Total Loan" />

          <Column field="totalAmount" header="Total Amount" />
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

export default ChannelPartnerReports;

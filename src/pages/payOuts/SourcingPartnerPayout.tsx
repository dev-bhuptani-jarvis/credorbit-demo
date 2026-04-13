import { DataTable } from "primereact/datatable";
import PrimePaginator from "../../components/PrimePaginator";
import { Column } from "primereact/column";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { useEffect, useState } from "react";
import {
  ISourcingPartnerPayOuts,
  ISourcingPartnerPayOutsParams,
  ISourcingPartnerPayOutsResponse,
} from "../../interface/payOuts";
import Loader from "../../components/Loader";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { PaginateReqEntity } from "../../interface/pagination";
import { getSpPayoutsListAPI } from "../../utils/axios/apiServices";
import { toastError } from "../../utils/functions/shared";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { debounceTimeInMilliseconds } from "../../utils/constants/constant";
import useDebouncedEffect from "../../hooks/useDebounce";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { Tooltip } from "primereact/tooltip";

const SourcingPartnerPayout = () => {
  const [spPayOutsData, setSpPayOutsData] = useState<ISourcingPartnerPayOuts[]>(
    [],
  );

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const navigate = useNavigate();

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const renderPartnerInput = () => {
    return (
      <InputText
        className="form-control"
        placeholder="Search Name"
        value={searchText?.trimStart()}
        onChange={(e) => setSearchText(e.target.value)}
        // onPaste={(e) => e.preventDefault()}
        // onCopy={(e) => e.preventDefault()}
        // onCut={(e) => e.preventDefault()}
      />
    );
  };

  const fetchPayOutsListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: ISourcingPartnerPayOutsParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.spFilter = filterReq.searchText?.trim();
    }

    const response: ISourcingPartnerPayOutsResponse =
      await getSpPayoutsListAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setSpPayOutsData(response.data.paymentRequests);
      setTotalRecords(response.data.totalPaymentRequestsCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionBodyTemplate = (rowData: ISourcingPartnerPayOuts) => {
    const viewId = `sp-payout-view-${rowData.spID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="View Payouts"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.sourcingPartnerPayouts}/${rowData.spID}`,
            )
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
    fetchPayOutsListingApi();
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <TableTitle title="SP Payouts" />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          className="tableMain"
          filterDisplay="row"
          value={spPayOutsData}
          emptyMessage="No payouts found"
        >
          <Column field="spCode" header="Sourcing Partner Code" />

          <Column />

          <Column
            field="spName"
            header="Sourcing Partner Name"
            showFilterMenu={false}
            filter
            filterElement={renderPartnerInput()}
          />

          <Column field="noOfPendingRequests" header="Pending" />

          <Column field="noOfApprovedRequests" header="Approved" />

          <Column field="noOfRejectedRequests" header="Rejected" />

          <Column field="noOfCompletedRequests" header="Completed" />

          <Column body={actionBodyTemplate} header="Action" />
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(spPayOutsData) && (
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

export default SourcingPartnerPayout;

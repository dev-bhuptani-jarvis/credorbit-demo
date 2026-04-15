import { useEffect, useState } from "react";
import {
  IPayOuts,
  IPayOutsParams,
  IPayOutsResponse,
} from "../../interface/payOuts";
import { getPayOutsListingAPI } from "../../utils/axios/apiServices";
import { toastError } from "../../utils/functions/shared";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { InputText } from "primereact/inputtext";
import { PaginateReqEntity } from "../../interface/pagination";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import useDebouncedEffect from "../../hooks/useDebounce";
import {
  debounceTimeInMilliseconds,
  formatCurrencyAmount,
} from "../../utils/constants/constant";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import { Tooltip } from "primereact/tooltip";

const PayOuts = () => {
  const [payOutsData, setPayOutsData] = useState<IPayOuts[]>([]);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const { userType } = useSelector((state: RootState) => state.user.user);

  const navigate = useNavigate();

  const fetchPayOutsListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IPayOutsParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      userType,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.partnerName = filterReq.searchText?.trim();
    }

    const response: IPayOutsResponse = await getPayOutsListingAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setPayOutsData(response.data.payOuts);
      setTotalRecords(response.data.totalPayOutsCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const renderPartnerInput = () => {
    return (
      <InputText
        className="form-control w-75"
        placeholder="Search Name"
        value={searchText?.trimStart()}
        onChange={(e) => setSearchText(e.target.value)}
        // onPaste={(e) => e.preventDefault()}
        // onCopy={(e) => e.preventDefault()}
        // onCut={(e) => e.preventDefault()}
      />
    );
  };

  const actionBodyTemplate = (rowData: IPayOuts) => {
    const viewId = `payout-view-${rowData.payoutID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="View Payouts"
          onClick={() =>
            navigate(`${RoutePathConstant.private.payouts}/${rowData.payoutID}`)
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
        </Button>
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
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
            <TableTitle title="Payouts" />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          className="tableMain"
          value={payOutsData}
          emptyMessage="No payouts found"
        >
          <Column field="month" header="Period" />

          <Column
            field="userName"
            header="Name"
          />

          <Column
            body={(rowData: IPayOuts) =>
              formatCurrencyAmount(rowData.amountSanctioned)
            }
            header="Loan Amount"
          />

          <Column
            body={(rowData: IPayOuts) => rowData.payOutPercent.toFixed(2)}
            header="Payout(%)"
          />

          <Column field="gstPercent" header="GST (%)" />

          <Column body={actionBodyTemplate} header="Action" />
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(payOutsData) && (
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

export default PayOuts;

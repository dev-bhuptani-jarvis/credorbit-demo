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
import { getAdminGeographicalReportAPI } from "../../utils/axios/apiServices";
import {
  ICityDropdown,
  IGeographicalChannelPartnerQueue,
  IGeographicalReportResponse,
  IReportParams,
} from "../../interface/reports";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import SearchButton from "../../components/SearchButton";
import useDebouncedEffect from "../../hooks/useDebounce";
import { debounceTimeInMilliseconds } from "../../utils/constants/constant";
import { Dropdown } from "primereact/dropdown";
import TableTitle from "../../components/TableTitle";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";

const GeographicalReports = () => {
  const [geographicalReportsData, setGeographicalReportsData] = useState<
    IGeographicalChannelPartnerQueue[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    code: number;
  } | null>(null);

  const [cities, setCities] = useState<ICityDropdown[]>([]);

  const { create } = usePermission("GeographicalReport", ["create"])();

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
      queryParams.filter = filterReq.searchText?.trim();
    }

    if (selectedCity) {
      queryParams.stateFilter = encryptVAPTData(selectedCity.name);
    }

    const response: IGeographicalReportResponse =
      await getAdminGeographicalReportAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        list: response.data.list.map((item) => ({
          ...item,
          city: item.city,
          state: item.state,
        })),
        stateList: response.data.stateList.map(
          (item: string | null, index: number) => ({
            name: item ? (item) : "-",
            code: index + 1,
          })
        ),
      };

      setGeographicalReportsData(decryptedData.list);
      setTotalRecords(decryptedData.totalCount);

      setCities(decryptedData.stateList);
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
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    filterReq.searchText,
    selectedCity,
  ]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <TableTitle title="Geographical Report" />
          </div>
        </div>
      </div>

      <div className="col-12 mb-3">
        <div className="d-flex justify-content-between gap-3">
          <div className="h-50px col-2">
            <SearchButton
              searchText={searchText}
              setSearchText={setSearchText}
              placeholder="Search"
            />
          </div>

          <div className="form-group w-100">
            <Dropdown
              value={selectedCity}
              placeholder="Select a State"
              onChange={(e) => setSelectedCity(e.value)}
              options={cities?.sort((a, b) => a?.name?.localeCompare(b?.name))}
              optionLabel="name"
              showClear
              className="w-50"
            />
          </div>

          <div className="BtnRightHldr w-100 d-flex justify-content-end">
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
      </div>

      <div className="table-responsive">
        <DataTable
          className="tableMain"
          value={geographicalReportsData}
          emptyMessage="No data found"
        >
          <Column
            body={(rowData, options) =>
              filterReq.pageNumber * filterReq.pageSize + options.rowIndex + 1
            }
            header="Sr. No."
          />

          <Column
            body={(rowData) =>
              selectedCity ? rowData.city || "-" : rowData.state || "-"
            }
            header={selectedCity ? "City" : "State"}
          />

          <Column field="cpCount" header="Channel Partner Count" />

          <Column field="spCount" header="Sourcing Partner Count" />

          <Column field="clientsCount" header="Client Count" />

          <Column field="totalLoan" header="Total Loan" />

          <Column field="totalAmount" header="Total Amount" />
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(geographicalReportsData) && (
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

export default GeographicalReports;

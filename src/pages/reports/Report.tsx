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
  formatMobileNumber
} from "../../utils/constants/constant";
import useDebouncedEffect from "../../hooks/useDebounce";
import { toastError } from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { getInstituteReportStudentListAPI } from "../../utils/axios/apiServices";
import {
  IInstituteReportParams,
  IInstituteReportResponse,
  IStudentList,
} from "../../interface/reports";
import TableTitle from "../../components/TableTitle";
import usePermission from "../../hooks/usePermission";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const Report = () => {
  const [reportsData, setReportsData] = useState<IStudentList[]>([]);

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

    const queryParams: IInstituteReportParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.studentFilter = filterReq.searchText?.trim();
    }

    const response: IInstituteReportResponse =
      await getInstituteReportStudentListAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        studentsList: response.data.studentsList.map((item) => ({
          ...item,
          mobile: item.mobile ? decryptVAPTData(item.mobile) : "",
        })),
      };

      setReportsData(decryptedData.studentsList);
      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionBody = (rowData: IStudentList): JSX.Element => {
    const viewId = `student-report-${rowData.studentID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        <Button
          id={viewId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="View Student Report"
          onClick={() =>
            navigate(`${RoutePathConstant.private.reports}/${rowData.studentID}`)
          }
        >
          <i className="icon-eye" />
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
          <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
            <TableTitle title="Reports" />

            <div className="BtnRightHldr flex-md-wrap">
              <SearchButton
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Search by Student name and code"
              />
            </div>
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

          <Column field="studentName" header="Student Name" />

          <Column field="studentCode" header="Student Code" />

          <Column
            body={(rowData: IStudentList) => formatMobileNumber(rowData.mobile)}
            header="Mobile Number"
          />

          {view && (
            <Column body={actionBody} header="Action" />
          )}

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

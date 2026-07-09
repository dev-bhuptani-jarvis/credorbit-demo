import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { IEducationStudentEnrollment } from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { RootState } from "../../store";
import { debounceTimeInMilliseconds, formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getStudentEnrollments } from "../../utils/demo/demoStudentEnrollments";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const courseTypeOptions = [
  { label: "Online", value: "Online" },
  { label: "Offline", value: "Offline" },
];

const repaymentStatusOptions = [
  { label: "On-Time", value: "On-Time" },
  { label: "Delayed", value: "Delayed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Closed", value: "Closed" },
  { label: "Pending", value: "Pending" },
];

const StudentEnrolledCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userID } = useSelector((state: RootState) => state.user.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [enrollments, setEnrollments] = useState<IEducationStudentEnrollment[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCourseType, setSelectedCourseType] = useState<string>("");
  const [selectedRepaymentStatus, setSelectedRepaymentStatus] = useState<string>("");
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const repaymentStatusFilterFromNavigation =
    (location.state as { repaymentStatusFilter?: string } | null)?.repaymentStatusFilter || "";

  const fetchEnrollments = (): void => {
    setLoading(true);
    setEnrollments(getStudentEnrollments(userID));
    setLoading(false);
  };

  const filteredEnrollments = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return enrollments.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.courseName.toLowerCase().includes(searchValue) ||
        item.instituteName.toLowerCase().includes(searchValue) ||
        item.loanAccountNumber.toLowerCase().includes(searchValue);

      const matchesType = !selectedCourseType || item.courseType === selectedCourseType;
      const matchesRepayment =
        !selectedRepaymentStatus || item.repaymentStatus === selectedRepaymentStatus;

      return matchesSearch && matchesType && matchesRepayment;
    });
  }, [enrollments, filterReq.searchText, selectedCourseType, selectedRepaymentStatus]);

  const paginatedEnrollments = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredEnrollments.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredEnrollments]);

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
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
    fetchEnrollments();
  }, [userID]);

  useEffect(() => {
    if (!repaymentStatusFilterFromNavigation) return;

    setSelectedRepaymentStatus(repaymentStatusFilterFromNavigation);
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  }, [repaymentStatusFilterFromNavigation]);

  useEffect(() => {
    setTotalRecords(filteredEnrollments.length);
  }, [filteredEnrollments]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
            <TableTitle title="Enrolled Courses" />

            <div className="BtnRightHldr flex-md-wrap">
              <SearchButton
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Search by course, institute, or loan account"
              />

              <div className="form-group">
                <Dropdown
                  style={{ width: "220px" }}
                  value={selectedCourseType}
                  onChange={(e) => {
                    setSelectedCourseType(e.value);
                    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                  }}
                  options={courseTypeOptions}
                  showClear={selectedCourseType !== ""}
                  placeholder="Filter by Course Type"
                />
              </div>

              <div className="form-group">
                <Dropdown
                  style={{ width: "220px" }}
                  value={selectedRepaymentStatus}
                  onChange={(e) => {
                    setSelectedRepaymentStatus(e.value);
                    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                  }}
                  options={repaymentStatusOptions}
                  showClear={selectedRepaymentStatus !== ""}
                  placeholder="Filter by Repayment"
                />
              </div>
            </div>
          </div>

          <div className="whiteBoxHldr">
            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={paginatedEnrollments}
                emptyMessage="No enrolled courses found."
              >
                <Column field="instituteName" header="Institute Name" />
                <Column field="courseName" header="Course Name" />
                <Column field="duration" header="Duration" />
                <Column
                  body={(rowData: IEducationStudentEnrollment) =>
                    formatCurrencyAmount(rowData.feeStructure)
                  }
                  header="Fee Structure"
                />
                <Column field="loanAccountNumber" header="Loan Account Number" />
                <Column field="repaymentStatus" header="Repayment Status" />
                <Column field="loanStatus" header="Loan Status" />
                <Column
                  header="Action"
                  body={(rowData: IEducationStudentEnrollment) => (
                    <Button
                      className="trash-icon p-0"
                      onClick={() =>
                        navigate(
                          RoutePathConstant.private.studentEnrolledCourseDetail.replace(
                            ":id",
                            rowData.id,
                          ),
                        )
                      }
                    >
                      <img src="/assets/images/eye.svg" alt="view-enrollment" />
                    </Button>
                  )}
                />
              </DataTable>
            </div>

            {!IsNullOrEmptyArray(paginatedEnrollments) && (
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
  );
};

export default StudentEnrolledCourses;

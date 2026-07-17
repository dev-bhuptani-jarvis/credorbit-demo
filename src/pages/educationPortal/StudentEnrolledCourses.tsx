import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { IEducationLoanDraft } from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { RootState } from "../../store";
import { debounceTimeInMilliseconds, formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getEducationLoanDrafts } from "../../utils/demo/demoEducationLoanFlow";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const STUDENT_USER_ID = "student-role-001";

const StudentEnrolledCourses = () => {
  const navigate = useNavigate();
  const { userID } = useSelector((state: RootState) => state.user.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [loans, setLoans] = useState<IEducationLoanDraft[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const fetchLoans = (): void => {
    setLoading(true);

    const matchedLoans = getEducationLoanDrafts().filter(
      (draft) =>
        draft.studentUserId === (userID || STUDENT_USER_ID) &&
        draft.loanApplicationStatus === "Sanctioned",
    );

    setLoans(
      matchedLoans.length > 0
        ? matchedLoans
        : getEducationLoanDrafts().filter(
          (draft) =>
            draft.studentUserId === STUDENT_USER_ID &&
            draft.loanApplicationStatus === "Sanctioned",
        ),
    );

    setLoading(false);
  };

  const filteredLoans = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return loans.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.courseName.toLowerCase().includes(searchValue) ||
        item.instituteName.toLowerCase().includes(searchValue) ||
        item.studentMobileNumber.includes(searchValue);

      return matchesSearch;
    });
  }, [filterReq.searchText, loans]);

  const paginatedLoans = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredLoans.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredLoans]);

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
    fetchLoans();
  }, [userID]);

  useEffect(() => {
    setTotalRecords(filteredLoans.length);
  }, [filteredLoans]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
            <TableTitle title="Loans" />

            <div className="BtnRightHldr flex-md-wrap">
              <SearchButton
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Search by course, institute, or mobile"
              />
            </div>
          </div>

          <div className="whiteBoxHldr">
            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={paginatedLoans}
                emptyMessage="No sanctioned loans found."
              >
                <Column field="courseName" header="Course Name" />

                <Column
                  header="Course Fees"
                  body={(rowData: IEducationLoanDraft) =>
                    formatCurrencyAmount(rowData.courseFees)}
                />

                <Column
                  body={(rowData: IEducationLoanDraft) =>
                    formatCurrencyAmount(rowData.loanAmount)
                  }
                  header="Loan Amount"
                />

                <Column field="loanApplicationStatus" header="Application Status" />

                <Column
                  header="Sanctioned On"
                  body={(rowData: IEducationLoanDraft) =>
                    rowData.sanctionDate
                      ? new Date(rowData.sanctionDate).toLocaleDateString("en-IN")
                      : "-"
                  }
                />
                <Column
                  header="Action"
                  body={(rowData: IEducationLoanDraft) => (
                    <Button
                      className="trash-icon p-0"
                      onClick={() =>
                        navigate(
                          RoutePathConstant.private.educationStudentDetail360View.replace(
                            ":id",
                            rowData.studentId,
                          ),
                          {
                            state: {
                              selectedDraftId: rowData.id,
                            },
                          },
                        )
                      }
                    >
                      <img src="/assets/images/eye.svg" alt="view-loan" />
                    </Button>
                  )}
                />
              </DataTable>
            </div>

            {!IsNullOrEmptyArray(paginatedLoans) && (
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

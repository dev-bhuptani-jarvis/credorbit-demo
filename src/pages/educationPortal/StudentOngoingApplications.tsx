import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { IEducationLoanDraft } from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import { RootState } from "../../store";
import { debounceTimeInMilliseconds, formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  buildEducationCustomerInfo,
  getEducationLoanDrafts,
  getEducationLoanResumeStep,
} from "../../utils/demo/demoEducationLoanFlow";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const STUDENT_USER_ID = "student-role-001";

const ongoingStatuses: IEducationLoanDraft["loanApplicationStatus"][] = [
  "Pending",
];

const statusOptions = ongoingStatuses.map((status) => ({
  label: status,
  value: status,
}));

const StudentOngoingApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userID } = useSelector((state: RootState) => state.user.user);

  const [loading, setLoading] = useState<boolean>(false);
  
  const [applications, setApplications] = useState<IEducationLoanDraft[]>([]);
  
  const [searchText, setSearchText] = useState<string>("");
  
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const statusFilterFromNavigation =
    (location.state as { loanApplicationStatusFilter?: string } | null)
      ?.loanApplicationStatusFilter || "";

  const effectiveUserId = userID || STUDENT_USER_ID;

  const fetchApplications = (): void => {
    setLoading(true);

    const matchedApplications = getEducationLoanDrafts().filter(
      (draft) =>
        draft.studentUserId === effectiveUserId &&
        ongoingStatuses.includes(draft.loanApplicationStatus),
    );

    setApplications(
      matchedApplications.length > 0
        ? matchedApplications
        : getEducationLoanDrafts().filter(
          (draft) =>
            draft.studentUserId === STUDENT_USER_ID &&
            ongoingStatuses.includes(draft.loanApplicationStatus),
        ),
    );

    setLoading(false);
  };

  const filteredApplications = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return applications.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.studentName.toLowerCase().includes(searchValue) ||
        item.courseName.toLowerCase().includes(searchValue) ||
        item.studentMobileNumber.includes(searchValue) ||
        item.studentEmail.toLowerCase().includes(searchValue);

      const matchesStatus =
        !selectedStatus || item.loanApplicationStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, filterReq.searchText, selectedStatus]);

  const paginatedApplications = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredApplications.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredApplications]);

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
    fetchApplications();
  }, [effectiveUserId]);

  useEffect(() => {
    if (!statusFilterFromNavigation) return;

    setSelectedStatus(statusFilterFromNavigation);
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  }, [statusFilterFromNavigation]);

  useEffect(() => {
    setTotalRecords(filteredApplications.length);
  }, [filteredApplications]);

  const handleResumeApplication = (draft: IEducationLoanDraft): void => {
    const resumeStep = getEducationLoanResumeStep(draft.id);
    const student = getEducationStudentById(draft.studentId);

    if (resumeStep === "consent" || draft.status === "draft") {
      navigate(RoutePathConstant.private.educationStudentLoanApplication, {
        state: {
          preselectedStudentId: draft.studentId,
          resumeDraftId: draft.id,
        },
      });
      return;
    }

    if (resumeStep === "loan-offer" || draft.status === "cam_generated") {
      navigate(
        RoutePathConstant.private.educationStudentLoanOffer.replace(":id", draft.id),
      );
      return;
    }

    if ((resumeStep === "credit-score" || resumeStep === "banking-details") && student) {
      dispatch(setCustomerInfo(buildEducationCustomerInfo(student)));
      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          educationFlow: true,
          educationLoanApplicationId: draft.id,
          loanApp: draft.id,
          loanType: 0,
          resumeStep,
        },
      });
      return;
    }

    navigate(
      RoutePathConstant.private.educationStudentDetail360View.replace(
        ":id",
        draft.studentId,
      ),
      {
        state: {
          selectedDraftId: draft.id,
        },
      },
    );
  };

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
            <TableTitle title="Ongoing Applications" />

            <div className="BtnRightHldr flex-md-wrap">
              <SearchButton
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Search by course, email, or mobile"
              />

              <div className="form-group">
                <Dropdown
                  style={{ width: "220px" }}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.value);
                    setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                  }}
                  options={statusOptions}
                  showClear={selectedStatus !== ""}
                  placeholder="Filter by Status"
                />
              </div>
            </div>
          </div>

          <div className="whiteBoxHldr">
            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={paginatedApplications}
                emptyMessage="No ongoing applications found."
              >
                <Column field="courseName" header="Course Name" />

                <Column
                  header="Course Fees"
                  body={(rowData: IEducationLoanDraft) =>
                    formatCurrencyAmount(rowData.courseFees)}
                />

                <Column
                  header="Loan Amount"
                  body={(rowData: IEducationLoanDraft) =>
                    formatCurrencyAmount(rowData.loanAmount)
                  }
                />

                <Column field="loanApplicationStatus" header="Status" />

                <Column
                  header="Last Activity Date"
                  body={(rowData: IEducationLoanDraft) =>
                    new Date(rowData.updatedAt).toLocaleDateString("en-IN")
                  }
                />

                <Column
                  header="Action"
                  body={(rowData: IEducationLoanDraft) => (
                    <Button
                      className="trash-icon p-0"
                      onClick={() => handleResumeApplication(rowData)}
                    >
                      <img src="/assets/images/eye.svg" alt="view-application" />
                    </Button>
                  )}
                />
              </DataTable>
            </div>

            {!IsNullOrEmptyArray(paginatedApplications) && (
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

export default StudentOngoingApplications;

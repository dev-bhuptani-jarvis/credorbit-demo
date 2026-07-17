import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { Tooltip } from "primereact/tooltip";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentEnrollment,
} from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { debounceTimeInMilliseconds, formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getNbfcEducationLoanApplications } from "../../utils/demo/demoEducationLoanFlow";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import { getStudentEnrollments } from "../../utils/demo/demoStudentEnrollments";
import { formatDate } from "../../utils/functions/shared";
import useDebouncedEffect from "../../hooks/useDebounce";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

const statusOptions = [
  { label: "Approved", value: "Approved" },
  { label: "Pending", value: "Pending" },
  { label: "Query Raised", value: "Query Raised" },
  { label: "Sanctioned", value: "Sanctioned" },
  { label: "Disbursed", value: "Disbursed" },
  { label: "Rejected", value: "Rejected" },
];

const repaymentStatusOptions = [
  { label: "On-Time", value: "On-Time" },
  { label: "Delayed", value: "Delayed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Closed", value: "Closed" },
  { label: "Pending", value: "Pending" },
];

type INbfcStudentApplicationRow = IEducationLoanDraft & {
  loanApplicationId: string;
  linkedEnrollment?: IEducationStudentEnrollment;
  repaymentStatus: string;
  nextDue: string;
  dpd: number;
};

const getRepaymentMeta = (
  repaymentStatus: string,
): { dpd: number; nextDue: string } => {
  const today = new Date("2026-07-17T00:00:00");

  if (repaymentStatus === "Overdue") {
    return {
      dpd: 32,
      nextDue: formatDate(new Date(today.getFullYear(), today.getMonth(), 5).toISOString(), "DD MMM YYYY"),
    };
  }

  if (repaymentStatus === "Delayed") {
    return {
      dpd: 7,
      nextDue: formatDate(new Date(today.getFullYear(), today.getMonth(), 10).toISOString(), "DD MMM YYYY"),
    };
  }

  if (repaymentStatus === "Closed") {
    return {
      dpd: 0,
      nextDue: "-",
    };
  }

  return {
    dpd: 0,
    nextDue: formatDate(new Date(today.getFullYear(), today.getMonth(), 25).toISOString(), "DD MMM YYYY"),
  };
};

const NbfcStudentApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);

  const [applications, setApplications] = useState<INbfcStudentApplicationRow[]>([]);

  const [searchText, setSearchText] = useState<string>("");

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRepaymentStatus, setSelectedRepaymentStatus] = useState<string>("");

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const statusFilterFromNavigation =
    (location.state as { loanApplicationStatusFilter?: string } | null)
      ?.loanApplicationStatusFilter || "";
  const repaymentFilterFromNavigation =
    (location.state as { repaymentStatusFilter?: string } | null)?.repaymentStatusFilter || "";

  const fetchApplications = (): void => {
    setLoading(true);
    const enrollments = getStudentEnrollments();
    setApplications(
      getNbfcEducationLoanApplications().map((application) => ({
        ...application,
        loanApplicationId: application.id,
        linkedEnrollment: enrollments.find((enrollment) => enrollment.draftId === application.id),
        repaymentStatus:
          enrollments.find((enrollment) => enrollment.draftId === application.id)?.repaymentStatus ||
          getEducationStudentById(application.studentId)?.loanDetails.repaymentStatus ||
          "Pending",
        ...getRepaymentMeta(
          enrollments.find((enrollment) => enrollment.draftId === application.id)?.repaymentStatus ||
          getEducationStudentById(application.studentId)?.loanDetails.repaymentStatus ||
          "Pending",
        ),
      })),
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
      const matchesRepayment =
        !selectedRepaymentStatus || item.repaymentStatus === selectedRepaymentStatus;

      return matchesSearch && matchesStatus && matchesRepayment;
    });
  }, [applications, filterReq.searchText, selectedRepaymentStatus, selectedStatus]);

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
  }, []);

  useEffect(() => {
    if (!statusFilterFromNavigation && !repaymentFilterFromNavigation) return;

    setSelectedStatus(statusFilterFromNavigation);
    setSelectedRepaymentStatus(repaymentFilterFromNavigation);
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  }, [repaymentFilterFromNavigation, statusFilterFromNavigation]);

  useEffect(() => {
    setTotalRecords(filteredApplications.length);
  }, [filteredApplications]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
            <TableTitle title="Student Applications" />

            <div className="BtnRightHldr flex-md-wrap">
              <SearchButton
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Search by student, course, email, or mobile"
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
                value={paginatedApplications}
                emptyMessage="No student loan applications found."
              >
                <Column field="loanApplicationId" header="Loan Application ID" />
                <Column field="studentName" header="Student Name" />
                <Column field="instituteName" header="Institute" />
                <Column
                  header="Loan Amount"
                  body={(rowData: INbfcStudentApplicationRow) =>
                    formatCurrencyAmount(rowData.loanAmount)
                  }
                />
                <Column
                  header="EMI"
                  body={(rowData: INbfcStudentApplicationRow) =>
                    formatCurrencyAmount(
                      rowData.linkedEnrollment?.emiAmount || rowData.emiAmount,
                    )
                  }
                />
                <Column field="nextDue" header="Next Due" />
                <Column field="dpd" header="DPD" />
                <Column field="loanApplicationStatus" header="Status" />
                <Column
                  header="Action"
                  body={(rowData: INbfcStudentApplicationRow) => (
                    <div className="d-flex gap-3">
                      <Tooltip target={`#nbfc-app-view-${rowData.id}`} position="top" />
                      <Button
                        id={`nbfc-app-view-${rowData.id}`}
                        className="trash-icon p-0"
                        data-pr-tooltip="View Application"
                        onClick={() =>
                          navigate(
                            RoutePathConstant.private.educationNbfcStudentApplicationDetail.replace(
                              ":id",
                              rowData.id,
                            ),
                          )
                        }
                      >
                        <img src="/assets/images/eye.svg" alt="view-application" />
                      </Button>
                    </div>
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

export default NbfcStudentApplications;

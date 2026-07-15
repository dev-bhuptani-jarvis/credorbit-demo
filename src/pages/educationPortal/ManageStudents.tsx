import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { Tooltip } from "primereact/tooltip";
import Loader from "../../components/Loader";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import StudentImpersonateUserModal from "../../components/StudentImpersonateUserModal";
import TableTitle from "../../components/TableTitle";
import { IEducationStudent } from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import {
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  deleteEducationStudent,
  getEducationStudents,
} from "../../utils/demo/demoEducationStudents";
import { formatDate, toastSuccess } from "../../utils/functions/shared";
import useDebouncedEffect from "../../hooks/useDebounce";

const repaymentStatusOptions = [
  { label: "On-Time", value: "On-Time" },
  { label: "Delayed", value: "Delayed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Closed", value: "Closed" },
  { label: "Pending", value: "Pending" },
];

const ManageStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<IEducationStudent[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedRepaymentStatus, setSelectedRepaymentStatus] =
    useState<string>("");
  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [deleteTarget, setDeleteTarget] = useState<IEducationStudent | null>(
    null,
  );
  const [impersonateId, setImpersonateId] = useState<string>("");
  const [impersonateModal, setImpersonateModal] = useState<boolean>(false);

  const fetchStudents = (): void => {
    setLoading(true);
    setStudents(getEducationStudents());
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    const searchValue = filterReq.searchText?.trim().toLowerCase() || "";

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.studentName.toLowerCase().includes(searchValue) ||
        student.studentCode.toLowerCase().includes(searchValue) ||
        student.courseName.toLowerCase().includes(searchValue);

      const matchesRepaymentStatus =
        !selectedRepaymentStatus ||
        student.loanDetails.repaymentStatus === selectedRepaymentStatus;

      return matchesSearch && matchesRepaymentStatus;
    });
  }, [filterReq.searchText, selectedRepaymentStatus, students]);

  const paginatedStudents = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredStudents.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredStudents]);

  const handleDeleteStudent = (): void => {
    if (!deleteTarget) return;

    deleteEducationStudent(deleteTarget.id);
    toastSuccess(`${deleteTarget.studentName} deleted successfully.`);
    setDeleteTarget(null);
    fetchStudents();
  };

  const handleImpersonate = (userId: string): void => {
    setImpersonateId(userId);
    setImpersonateModal(true);
  };

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
    fetchStudents();
  }, []);

  useEffect(() => {
    const repaymentStatusFilter = location.state?.repaymentStatusFilter;

    if (!repaymentStatusFilter) return;

    setSelectedRepaymentStatus(repaymentStatusFilter);
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  }, [location.state]);

  useEffect(() => {
    setTotalRecords(filteredStudents.length);
  }, [filteredStudents]);

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />

        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper flex-md-wrap">
              <TableTitle title="Manage Students" />

              <div className="BtnRightHldr flex-md-wrap">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by student, code, or course"
                />

                <div className="form-group">
                  <Dropdown
                    style={{ width: "220px" }}
                    value={selectedRepaymentStatus}
                    onChange={(event) => {
                      setSelectedRepaymentStatus(event.value);
                      setFilterReq((prev) => ({ ...prev, pageNumber: 0 }));
                    }}
                    options={repaymentStatusOptions}
                    showClear={selectedRepaymentStatus !== ""}
                    placeholder="Filter by Repayment"
                  />
                </div>

                <div className="form-group">
                  <Button
                    onClick={() =>
                      navigate(RoutePathConstant.private.educationAddStudent)
                    }
                    className="btn btn-orange"
                  >
                    <i className="bi bi-plus-circle me-2" />
                    Add Student
                  </Button>
                </div>
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={paginatedStudents}
                  emptyMessage="No students found."
                >
                  <Column field="studentCode" header="Student Code" />

                  <Column
                    body={(rowData: IEducationStudent) => {
                      const tooltipId = `tooltip-${rowData.id}`;

                      return (
                        <>
                          <span
                            id={tooltipId}
                            style={{ cursor: "pointer", fontWeight: "bold" }}
                            onClick={() => handleImpersonate(rowData.id)}
                          >
                            {rowData.studentName}
                          </span>
                          <Tooltip
                            target={`#${tooltipId}`}
                            content="Login as Student"
                            position="top"
                          />
                        </>
                      );
                    }}
                    header="Student Name"
                  />

                  <Column
                    body={(rowData: IEducationStudent) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                    header="Mobile Number"
                  />

                  <Column field="email" header="Email Address" />

                  <Column
                    header="Action"
                    body={(rowData: IEducationStudent) => (
                      <div className="d-flex gap-2">
                        <Button
                          className="trash-icon p-0"
                          onClick={() =>
                            navigate(
                              RoutePathConstant.private.educationStudentLoanApplication,
                              {
                                state: { preselectedStudentId: rowData.id },
                              },
                            )
                          }
                        >
                          <i className="bi bi-journal-check" />
                        </Button>
                        <Button
                          className="trash-icon p-0"
                          onClick={() =>
                            navigate(
                              RoutePathConstant.private.educationStudentDetail.replace(
                                ":id",
                                rowData.id,
                              ),
                            )
                          }
                        >
                          <img src="/assets/images/eye.svg" alt="view-student" />
                        </Button>
                        <Button
                          className="trash-icon p-0"
                          onClick={() =>
                            navigate(
                              RoutePathConstant.private.educationEditStudent.replace(
                                ":id",
                                rowData.id,
                              ),
                            )
                          }
                        >
                          <i className="bi bi-pencil" />
                        </Button>
                        <Button
                          className="trash-icon p-0"
                          onClick={() => setDeleteTarget(rowData)}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </div>
                    )}
                  />
                </DataTable>
              </div>

              <PrimePaginator
                pageNumber={filterReq.pageNumber}
                pageSize={filterReq.pageSize}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        header="Delete Student"
        visible={!!deleteTarget}
        className="modalWrapper"
        onHide={() => setDeleteTarget(null)}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "520px" }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => setDeleteTarget(null)}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleDeleteStudent}
              label="Delete Student"
            />
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{deleteTarget?.studentName}</strong>?
        </p>
      </Dialog>

      <StudentImpersonateUserModal
        impersonateModal={impersonateModal}
        setImpersonateModal={setImpersonateModal}
        impersonateId={impersonateId}
      />
    </>
  );
};

export default ManageStudents;

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import BackButton from "../../components/BackButton";
import PrimePaginator from "../../components/PrimePaginator";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { IGetEduPortalLoanApplicationResponse, IEduPortalLoanApplication, IGetEduPortalLoanApplicationBody } from "../../interface/loanApplicationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import { RootState } from "../../store";
import { getEduPortalLoanApplicationsAPI } from "../../utils/axios/apiServices";
import { CLIENT_ROLE, debounceTimeInMilliseconds, formatCurrencyAmount, getLoanStatusClassName, getTitleByStatus } from "../../utils/constants/constant";
import { LoanStatusType } from "../../utils/constants/enum";
import { formatDate, handleDownloadCSVData, toastError } from "../../utils/functions/shared";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import useDebouncedEffect from "../../hooks/useDebounce";
import { Tooltip } from "primereact/tooltip";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import usePermission from "../../hooks/usePermission";

const LoanApplications = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const location = useLocation();

  const { userID, userType } = useSelector((state: RootState) => state.user.user);

  const [searchText, setSearchText] = useState<string>("");

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [loanApplications, setLoanApplications] = useState<IEduPortalLoanApplication[]>([]);

  const status = searchParams.get("status") || LoanStatusType.TOTAL.toString();

  const statusParam = searchParams.get("status");

  const { isImpersonate } = useSelector((state: RootState) => state.impersonateUser);

  const statusFilter =
    !statusParam || statusParam === LoanStatusType.TOTAL.toString()
      ? undefined
      : statusParam
        .split(",")
        .map((x) => Number(x))
        .filter((x) => !isNaN(x));

  const fetchLoanApplications = async (): Promise<void> => {
    if (!userID || !userType) {
      setLoanApplications([]);
      setTotalRecords(0);
      return;
    }

    setLoading(true);

    const body: IGetEduPortalLoanApplicationBody = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      search: filterReq.searchText?.trim() || undefined,
      statusFilter,
      userType,
      userID,
    }

    const response: IGetEduPortalLoanApplicationResponse = await getEduPortalLoanApplicationsAPI(body);

    if (!response) {
      setLoading(false);
      return
    }

    if (response && response?.statusCode === 200) {
      setLoanApplications(response.data.loanApplications || []);
      setTotalRecords(response.data.total || 0);
    } else {
      setLoanApplications([]);
      setTotalRecords(0);
      toastError(response?.message);
    }

    setLoading(false);
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((previous) => ({
      ...previous,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
  };

  const statusBody = (rowData: IEduPortalLoanApplication): JSX.Element => {
    return (
      <span
        className={`loan-status-label ${getLoanStatusClassName(
          rowData.status?.statusId || 0,
        )}`}
      >
        {rowData.status?.label || '-'}
      </span>
    );
  }

  const actionBody = (rowData: IEduPortalLoanApplication): JSX.Element => {
    const viewTooltipId = `view-loan-application-${rowData.loanApplicationID}`;

    const editTooltipId = `edit-loan-application-${rowData.loanApplicationID}`;

    const canEditLoanApplication =
      !isImpersonate && userType !== CLIENT_ROLE.SUPER_ADMIN &&
      userType !== CLIENT_ROLE.NBFC && userType !== CLIENT_ROLE.STUDENT &&
      [LoanStatusType.PENDING, LoanStatusType.QUERY_RAISED].includes(Number(rowData.status?.statusId));

    const canViewLoanApplication =
      !isImpersonate && (userType !== CLIENT_ROLE.SUPER_ADMIN || rowData.verificationStatus === "Verified");

    return (
      <>
        {canViewLoanApplication ? <Tooltip target={`#${viewTooltipId}`} position="top" /> : null}

        {canEditLoanApplication ? (
          <Tooltip target={`#${editTooltipId}`} position="top" />
        ) : null}

        {canViewLoanApplication ? (
          <Button
            className="trash-icon p-0 me-2"
            id={viewTooltipId}
            data-pr-tooltip={rowData.verificationStatus === "Verified" ? "View Student 360" : "Student Consent Pending"}
            onClick={() => {
              if (userType === CLIENT_ROLE.NBFC) {
                navigate(
                  RoutePathConstant.private.educationNbfcStudentApplicationDetail.replace(
                    ":id",
                    rowData.loanApplicationID,
                  ),
                );
                return;
              }

              if (rowData.verificationStatus !== "Verified") {
                navigate(
                  RoutePathConstant.private.educationStudentLoanApplication,
                  {
                    state: {
                      selectedStudent: {
                        id: rowData.studentID,
                        fullName: rowData.studentInfo.studentName,
                        panNumber: rowData.studentInfo.panNumber,
                        email: rowData.studentInfo.email,
                        phoneNumber: rowData.studentInfo.phoneNumber || "",
                        gender: rowData.studentInfo.gender as unknown as number,
                        dob: rowData.studentInfo.dateOfBirth,
                        aadhaar: "",
                        code: rowData.studentInfo.code,
                        address: rowData.studentInfo.address,
                        city: "",
                        state: "",
                        country: "",
                        zipCode: "",
                      },
                      activeIndex: 2,
                      loanApplicationId: rowData.loanApplicationID,
                      returnTo: `${location.pathname}${location.search}`,
                    },
                  },
                );
                return;
              }

              navigate(
                `${RoutePathConstant.private.educationStudentDetail360View}/${rowData.studentID}`,
                {
                  state: {
                    selectedDraftId: rowData.loanApplicationID,
                    loanApplicationId: rowData.loanApplicationID,
                    studentID: rowData.studentID,
                    studentName: rowData.studentName || "",
                    selectedStudent: null,
                  },
                },
              );
            }}
          >
            <i className="icon-eye" />
          </Button>
        ) : null}

        {canEditLoanApplication ? (
          <Button
            className="trash-icon p-0 me-2"
            id={editTooltipId}
            data-pr-tooltip="Edit Loan Application"
            onClick={() => {
              navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                state: {
                  selectedStudent: {
                    id: rowData.studentID,
                    fullName: rowData.studentInfo.studentName,
                    panNumber: rowData.studentInfo.panNumber,
                    email: rowData.studentInfo.email,
                    phoneNumber: rowData.studentInfo.phoneNumber || "",
                    gender: rowData.studentInfo.gender as unknown as number,
                    dob: rowData.studentInfo.dateOfBirth,
                    aadhaar: "",
                    code: rowData.studentInfo.code,
                    address: rowData.studentInfo.address,
                    city: "",
                    state: "",
                    country: "",
                    zipCode: "",
                  },
                  activeIndex: 1,
                  isEditingLoan: true,
                  loanApplicationId: rowData.loanApplicationID,
                  studentID: rowData.studentID,
                  verificationStatus: rowData.verificationStatus,
                  returnTo: `${location.pathname}${location.search}`,
                },
              });
            }}
          >
            <i className="icon-edit" />
          </Button>
        ) : null}
      </>
    );
  };

  const headersMap: Record<string, string> = {
    "Application Code": "applicationCode",
    "Student Name": "studentName",
    "Course Name": "courseName",
    "Institute Name": "instituteName",
    "Applied Date": "loanAppliedDate",
    "Loan Amount": "loanAmount",
    Status: "status",
  };

  const handleDownloadLoanApplication = async (): Promise<void> => {
    if (!status) return;

    setLoading(true);

    const body: IGetEduPortalLoanApplicationBody = {
      userType,
      page: 1,
      pageSize: totalRecords,
      userID,
    };

    if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
      body.search = searchText.trim();
    }

    const response: IGetEduPortalLoanApplicationResponse =
      await getEduPortalLoanApplicationsAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const downloadRows = response.data.loanApplications.map((loanApplication) => ({
        ...loanApplication,
        instituteName: loanApplication.tradeName
          ? decryptVAPTData(loanApplication.tradeName)
          : loanApplication.instituteName || "-",
        loanAppliedDate: loanApplication.loanAppliedDate
          ? formatDate(loanApplication.loanAppliedDate, "DD MMM, YYYY")
          : "-",
        loanAmount: formatCurrencyAmount(loanApplication.loanAmount || 0),
        status: loanApplication.status?.label || "-",
      }));

      handleDownloadCSVData(
        downloadRows,
        headersMap,
        `${getTitleByStatus(status)}`,
      );
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
    fetchLoanApplications();
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText, status, userID, userType]);

  return (
    <div className="whiteBoxHldr p-30">
      <div className="row">
        <div className="col-12">
          <Loader isLoading={loading} />

          <div className="titleLinkMain mb-4 d-flex justify-content-between">
            <TableTitle title={getTitleByStatus(status)} />

            <div className="BtnRightHldr">
              <div className="col-12 d-flex gap-3 align-items-center">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search by student name"
                />

                <Button
                  className="btn btn-orange"
                  onClick={() => handleDownloadLoanApplication()}
                  disabled={
                    loanApplications?.length === 0
                  }
                >
                  <i className="bi bi-download me-2" /> Download Loan
                  Application
                </Button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <DataTable
              className="tableMain"
              value={loanApplications}
              emptyMessage="No Application Found"
            >
              <Column field="applicationCode" header="Application Code" />

              <Column
                field="studentName"
                header="Student Name"
                body={(rowData: IEduPortalLoanApplication) => rowData.studentName || "-"}
              />

              <Column
                field="courseName"
                header="Course Name"
                body={(rowData: IEduPortalLoanApplication) => rowData.courseName || "-"}
              />

              <Column
                field="instituteName"
                header="Institute Name"
                body={(rowData: IEduPortalLoanApplication) => rowData.tradeName ? decryptVAPTData(rowData.tradeName) : rowData.instituteName || "-"}
              />

              <Column
                field="loanAppliedDate"
                header="Applied Date"
                body={(rowData: IEduPortalLoanApplication) =>
                  rowData.loanAppliedDate
                    ? formatDate(rowData.loanAppliedDate, "DD MMM, YYYY")
                    : "-"
                }
              />

              <Column
                field="loanAmount"
                header="Loan Amount"
                body={(rowData: IEduPortalLoanApplication) =>
                  formatCurrencyAmount(rowData.loanAmount || 0)
                }
              />

              <Column body={statusBody} header="Status" />

              {!isImpersonate && <Column body={actionBody} header="Action" />}
            </DataTable>
          </div>

          {!IsNullOrEmptyArray(loanApplications) && (
            <PrimePaginator
              onPageChange={onPageChange}
              pageNumber={filterReq.pageNumber}
              pageSize={filterReq.pageSize}
              totalRecords={totalRecords}
            />
          )}
        </div>

      </div>
      <div className="mt-4">
        <BackButton />
      </div>
    </div>
  );
};

export default LoanApplications;

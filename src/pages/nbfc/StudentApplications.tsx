import React, { useEffect, useState } from 'react'
import { IsNullOrEmptyArray } from '../../utils/functions/nullCheck';
import PrimePaginator from '../../components/PrimePaginator';
import Loader from '../../components/Loader';
import TableTitle from '../../components/TableTitle';
import SearchButton from '../../components/SearchButton';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaginateReqEntity } from '../../interface/pagination';
import { debounceTimeInMilliseconds, formatCurrencyAmount } from '../../utils/constants/constant';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import useDebouncedEffect from '../../hooks/useDebounce';
import { PaginatorPageChangeEvent } from 'primereact/paginator';
import { getAllStudentLoanApplicationsAPI } from '../../utils/axios/apiServices';
import { IListAllApplicationsResponse } from '../../interface/nbfcApplication';

const StudentApplications = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [studentApplications, setStudentApplications] = useState<any[]>([]);

    const [searchText, setSearchText] = useState<string>("");

    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const [selectedRepaymentStatus, setSelectedRepaymentStatus] = useState<string>("");

    const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
        pageNumber: 0,
        pageSize: 10,
        searchText: "",
    });

    const [totalRecords, setTotalRecords] = useState<number>(0);

    const navigate = useNavigate();

    const location = useLocation();

    const handleBack = (): void => {
        const fallbackPath = RoutePathConstant.private.nbfcDashboard;
        navigate((location.state as { from?: string } | null)?.from || fallbackPath);
    };

    const fetchStudentApplications = async (): Promise<void> => {
        setLoading(true);

        const queryParams: any = {
            page: filterReq.pageNumber + 1,
            pageSize: filterReq.pageSize,
            userType: 1
        };

        if (filterReq.searchText?.trim()) {
            queryParams.courseName = filterReq.searchText?.trim();
        }

        const response: IListAllApplicationsResponse = await getAllStudentLoanApplicationsAPI(queryParams);

        if (!response) {
            setLoading(false);
            return;
        }

        if (response.statusCode === 200) {
            setStudentApplications(response.data.loanApplications);
            setTotalRecords(response.data.totalLoanApplications);
        }

        setLoading(false);
    }

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
        fetchStudentApplications();
    }, [filterReq.pageNumber, filterReq.pageSize, filterReq.status, filterReq.searchText]);

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
                                    // options={statusOptions}
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
                                    // options={repaymentStatusOptions}
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
                                value={studentApplications}
                                emptyMessage="No student loan applications found."
                            >
                                <Column field="loanApplicationCode" header="Loan Application ID" />

                                <Column field="customerName" header="Student Name" />

                                <Column field="instituteName" header="Institute" />

                                <Column
                                    header="Loan Amount"
                                    body={(rowData: any) =>
                                        formatCurrencyAmount(rowData.loanAmount)
                                    }
                                />

                                <Column
                                    header="EMI"
                                    body={(rowData: any) =>
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
                                    body={(rowData: any) => (
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
                                                <i className='icon-eye' />
                                            </Button>
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </div>

                        {!IsNullOrEmptyArray(studentApplications) && (
                            <PrimePaginator
                                onPageChange={onPageChange}
                                pageNumber={filterReq.pageNumber}
                                pageSize={filterReq.pageSize}
                                totalRecords={totalRecords}
                            />
                        )}
                    </div>

                    <div className="mt-3 pt-1">
                        <Button className="btn btn-black-line" onClick={handleBack}>
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentApplications

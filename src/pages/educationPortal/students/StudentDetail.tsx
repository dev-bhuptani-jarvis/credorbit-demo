import React, { useEffect, useMemo, useState } from 'react';
import TableTitle from '../../../components/TableTitle';
import { Button } from 'primereact/button';
import { useNavigate, useParams } from 'react-router-dom';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import { TabPanel, TabView } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Loader from '../../../components/Loader';
import { activeInactiveStudentAPI, getStudentDetailAPI } from '../../../utils/axios/apiServices';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { formatDate, toastError, toastSuccess } from '../../../utils/functions/shared';
import { CLIENT_ROLE, formatCurrencyAmount, formatMobileNumber, getLoanStatusClassName, RouteParams } from '../../../utils/constants/constant';
import {
    IApplicantProfile,
    IAppliedLoanApplication,
    IFetchStudentDetailResponse,
    IStudentDetailResponseData,
    IStudentProfile,
} from '../../../interface/student';
import { decryptVAPTData } from '../../../utils/functions/encryptDecrypt';
import { InputSwitch } from 'primereact/inputswitch';
import { LoanStatusType } from '../../../utils/constants/enum';
import usePermission from '../../../hooks/usePermission';

const defaultStudentDetail: IStudentDetailResponseData = {
    students: {
        id: '',
        code: '',
        name: '',
        isActive: true,
        pan: '',
        panDocument: '',
        aadhaarDocument: '',
        dateOfBirth: '',
        gender: '',
        mobileNumber: '',
        email: '',
        photo: '',
        address: '',
        creditScore: 0,
        lastDateCreditScore: '',
    },
    applicants: {
        id: '',
        code: '',
        name: '',
        isActive: true,
        pan: '',
        consentsStatus: false,
        panDocument: '',
        aadhaarDocument: '',
        dateOfBirth: '',
        gender: '',
        mobileNumber: '',
        email: '',
        photo: '',
        address: '',
        creditScore: 0,
        lastDateCreditScore: '',
    },
    coApplicants: [],
    createdAt: '',
    updatedAt: '',
    appliedLoanApplications: [],
};

const StudentDetail = () => {
    const navigate = useNavigate();

    const { id } = useParams<RouteParams>();

    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);

    const [studentDetail, setStudentDetail] = useState<IStudentDetailResponseData>(defaultStudentDetail);

    const { userID, userType } = useSelector((state: RootState) => state.user.user);

    const { create, view } = usePermission("ManageStudents", ["create", "view"])();

    const student = useMemo<IStudentProfile>(() => studentDetail.students, [studentDetail.students]);

    const primaryApplicant = useMemo<IApplicantProfile | null>(
        () => (studentDetail.applicants?.id ? studentDetail.applicants : null),
        [studentDetail.applicants],
    );

    const handleStatusChange = async (checked: boolean): Promise<void> => {
        if (!id) {
            toastError('Student ID is missing');
            return;
        }

        const previousIsActive = !!student.isActive;

        setStudentDetail((prevStudentDetail) => ({
            ...prevStudentDetail,
            students: {
                ...prevStudentDetail.students,
                isActive: checked,
            },
        }));

        setLoading(true);

        const response = await activeInactiveStudentAPI({
            studentID: id,
            isActive: checked,
        });

        if (response?.statusCode === 200) {
            toastSuccess(response.message);
            await fetchStudentDetails();
        } else {
            setStudentDetail((prevStudentDetail) => ({
                ...prevStudentDetail,
                students: {
                    ...prevStudentDetail.students,
                    isActive: previousIsActive,
                },
            }));
            toastError(response?.message);
        }

        setLoading(false);
    };

    const renderDocumentLink = (filePath?: string | null): JSX.Element => {
        if (!filePath) {
            return <span className="text-muted">Not uploaded</span>;
        }

        return (
            <a href={filePath} target="_blank" rel="noreferrer">
                View Document
            </a>
        );
    };

    const renderApplicantDetails = (
        applicant: IApplicantProfile,
        sectionTitle: string,
    ): JSX.Element => (
        <div className="borderBoxHldr p-24">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="mb-0">{sectionTitle}</h5>
                {applicant.code ? <span className="badge bg-light text-dark">{applicant.code}</span> : null}
            </div>

            <div className="row">
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Name</b>
                    <p className="text-break">{applicant.name || '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>PAN</b>
                    <p className="text-break">{applicant.pan ? decryptVAPTData(applicant.pan) : '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Date of Birth</b>
                    <p className="text-break">
                        {applicant.dateOfBirth ? formatDate(decryptVAPTData(applicant.dateOfBirth), 'DD MMM, YYYY') : '-'}
                    </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Gender</b>
                    <p className="text-break">{applicant.gender
                        ? applicant.gender.charAt(0).toUpperCase() + applicant.gender.slice(1).toLowerCase()
                        : "-"}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Mobile Number</b>
                    <p className="text-break">{applicant.mobileNumber ? formatMobileNumber(decryptVAPTData(applicant.mobileNumber)) : '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Email Address</b>
                    <p className="text-break">{applicant.email ? decryptVAPTData(applicant.email) : '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Credit Score</b>
                    <p className="text-break">{applicant.creditScore || '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Photo</b>
                    <p className="text-break">{renderDocumentLink(applicant.photo)}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>PAN Upload</b>
                    <p className="text-break">{renderDocumentLink(applicant.panDocument)}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Aadhaar Upload</b>
                    <p className="text-break">{renderDocumentLink(applicant.aadhaarDocument)}</p>
                </div>
                <div className="col-lg-6 col-md-7 col-sm-12 col-12 mb-4">
                    <b>Address</b>
                    <p className="text-break">{applicant.address ? decryptVAPTData(applicant.address) : '-'}</p>
                </div>
            </div>
        </div>
    );

    const fetchStudentDetails = async (): Promise<void> => {
        if (!userID) {
            setStudentDetail(defaultStudentDetail);
            return;
        }

        if (!id) {
            toastError('Student ID is missing');
            navigate(RoutePathConstant.private.educationManageStudents);
            return;
        }

        setLoading(true);

        const response: IFetchStudentDetailResponse = await getStudentDetailAPI({
            studentID: id,
        });

        if (!response) {
            setLoading(false);
            return;
        }

        if (response.statusCode === 200 && response.data) {
            setStudentDetail(response.data);
        } else {
            toastError(response.message);
            navigate(RoutePathConstant.private.educationManageStudents);
        }

        setLoading(false);
    };

    const applicationStatusBody = (rowData: IAppliedLoanApplication): JSX.Element => {
        return (
            <span
                className={`loan-status-label ${getLoanStatusClassName(
                    rowData.status?.statusID || 0,
                )}`}
            >
                {rowData.status?.label || '-'}
            </span>
        );
    };

    const actionBody = (rowData: IAppliedLoanApplication) => (
        <div className="d-flex gap-2">
            {view && (userType !== CLIENT_ROLE.SUPER_ADMIN || rowData.verificationStatus === "Verified") ? (
                <Button
                    className="trash-icon p-0"
                    tooltip={rowData.verificationStatus === "Verified" ? "View Student 360" : "Student Consent Pending"}
                    onClick={() => {
                        if (rowData.verificationStatus !== "Verified") {
                            navigate(
                                RoutePathConstant.private.educationStudentLoanApplication,
                                {
                                    state: {
                                        selectedStudent: {
                                            id: student.id,
                                            fullName: student.name,
                                            panNumber: student.pan,
                                            email: student.email,
                                            phoneNumber: student.mobileNumber || "",
                                            gender: student.gender as unknown as number,
                                            dob: student.dateOfBirth,
                                            aadhaar: "",
                                            code: student.code,
                                            address: student.address,
                                            city: "",
                                            state: "",
                                            country: "",
                                            zipCode: "",
                                        },
                                        activeIndex: 2,
                                        loanApplicationId: rowData.id,
                                        returnTo: RoutePathConstant.private.educationStudentDetail.replace(":id", student.id),
                                    },
                                },
                            );
                            return;
                        }

                        navigate(
                            `${RoutePathConstant.private.educationStudentDetail360View}/${student.id}`,
                            {
                                state: {
                                    selectedDraftId: rowData.id,
                                    loanApplicationId: rowData.id,
                                    studentID: student.id,
                                    studentName: student.name,
                                    appliedLoanDraft: rowData,
                                },
                            },
                        );
                    }}
                >
                    <i className="icon-eye" />
                </Button>
            ) : null}

            {create && userType !== CLIENT_ROLE.SUPER_ADMIN && [LoanStatusType.PENDING, LoanStatusType.QUERY_RAISED].includes(Number(rowData.status?.statusID)) ? (
                <Button
                    className="trash-icon p-0"
                    aria-label="Edit loan application"
                    tooltip="Edit Application"
                    onClick={() => {
                        navigate(
                            RoutePathConstant.private.educationStudentLoanApplication,
                            {
                                state: {
                                    selectedStudent: {
                                        id: student.id,
                                        fullName: student.name,
                                        panNumber: student.pan,
                                        email: student.email,
                                        phoneNumber: student.mobileNumber || "",
                                        gender: student.gender as unknown as number,
                                        dob: student.dateOfBirth,
                                        aadhaar: "",
                                        code: student.code,
                                        address: student.address,
                                        city: "",
                                        state: "",
                                        country: "",
                                        zipCode: "",
                                    },
                                    activeIndex: 1,
                                    isEditingLoan: true,
                                    loanApplicationId: rowData.id,
                                    studentID: student.id,
                                    returnTo: RoutePathConstant.private.educationStudentDetail.replace(":id", student.id),
                                },
                            },
                        );
                    }}
                >
                    <i className="icon-edit" />
                </Button>
            ) : null}
        </div>
    );

    useEffect(() => {
        fetchStudentDetails();
    }, [id]);

    return (
        <div className="whiteBoxHldr p-24">
            <Loader isLoading={loading} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <TableTitle title="Student Details" />
                <Button
                    className="btn btn-black-line"
                    onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}
                >
                    Back
                </Button>
            </div>

            <div className="row">
                <div className="col-12">
                    <TabView
                        className="custom-tabview"
                        activeIndex={activeTabIndex}
                        onTabChange={(event) => setActiveTabIndex(event.index)}
                    >
                        <TabPanel header="Personal Details">
                            <div className="borderBoxHldr p-24 mt-3">
                                <div className="row">
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Name</b>
                                        <p className="text-break">{student.name || '-'}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Code</b>
                                        <p className="text-break">{student.code || '-'}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Date of Birth</b>
                                        <p className="text-break">
                                            {student.dateOfBirth
                                                ? formatDate(decryptVAPTData(student.dateOfBirth), 'DD MMM, YYYY')
                                                : '-'}
                                        </p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Gender</b>
                                        <p className="text-break">{student.gender
                                            ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase()
                                            : "-"}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Mobile Number</b>
                                        <p className="text-break">{student.mobileNumber ? formatMobileNumber(decryptVAPTData(student.mobileNumber)) : '-'}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Email Address</b>
                                        <p className="text-break">{student.email ? decryptVAPTData(student.email) : '-'}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>PAN</b>
                                        <p className="text-break">{student.pan ? decryptVAPTData(student.pan) : '-'}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Credit Score</b>
                                        <p className="text-break">{student.creditScore || '-'}</p>
                                    </div>

                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Photo</b>
                                        <p className="text-break">{renderDocumentLink(student.photo)}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>PAN Upload</b>
                                        <p className="text-break">{renderDocumentLink(student.panDocument)}</p>
                                    </div>
                                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                        <b>Aadhaar Upload</b>
                                        <p className="text-break">{renderDocumentLink(student.aadhaarDocument)}</p>
                                    </div>

                                    {create ?
                                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                            <b>Status</b>
                                            <p className="d-flex align-items-center mt-2 mb-0">
                                                <InputSwitch
                                                    checked={!!student.isActive}
                                                    onChange={(event) => handleStatusChange(!!event.value)}
                                                    disabled={loading}
                                                />
                                                <span className="ms-2">
                                                    {student.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                        :
                                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                                            <b>Status</b>
                                            <p className="text-break">{student.isActive ? "Active" : "Inactive"}</p>
                                        </div>
                                    }

                                    <div className="col-12 mb-4">
                                        <b>Address</b>
                                        <p className="text-break">{student.address ? decryptVAPTData(student.address) : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header="Applicants Details">
                            <div className="mt-3">
                                {primaryApplicant ? (
                                    renderApplicantDetails(primaryApplicant, 'Applicant')
                                ) : (
                                    <div className="borderBoxHldr p-24">
                                        <p className="mb-0">No applicant details available.</p>
                                    </div>
                                )}
                            </div>
                        </TabPanel>

                        <TabPanel header="Co-Applicants Details">
                            <div className="mt-3">
                                {(studentDetail.coApplicants || []).length > 0 ? (
                                    (studentDetail.coApplicants || []).map((applicant, index) => (
                                        <div
                                            key={applicant.id || `co-applicant-${index + 1}`}
                                            className={index > 0 ? 'mt-3' : ''}
                                        >
                                            {renderApplicantDetails(applicant, `Co-applicant ${index + 1}`)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="borderBoxHldr p-24">
                                        <p className="mb-0">No co-applicant details available.</p>
                                    </div>
                                )}
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                <div className="col-12 mt-4">
                    <h5 className="mb-3">Applied Loan Applications</h5>
                    <div className="borderBoxHldr p-24">
                        <div className="table-responsive">
                            <DataTable
                                className="tableMain"
                                value={studentDetail.appliedLoanApplications}
                                emptyMessage="No applied loan applications found for this student."
                            >
                                <Column field="loanApplicationCode" header="Code" />

                                <Column field="courseName" header="Course Name" />

                                <Column
                                    header="Loan Amount"
                                    body={(rowData: IAppliedLoanApplication) =>
                                        formatCurrencyAmount(Number(rowData.loanAmount || 0))
                                    }
                                />

                                <Column body={applicationStatusBody} header="Application Status" />

                                <Column
                                    header="Last Activity Date"
                                    body={(rowData: IAppliedLoanApplication) =>
                                        rowData.lastActivityDate ? formatDate(rowData.lastActivityDate, 'DD MMM, YYYY') : '-'
                                    }
                                />

                                <Column
                                    header="Action"
                                    body={actionBody}
                                />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;

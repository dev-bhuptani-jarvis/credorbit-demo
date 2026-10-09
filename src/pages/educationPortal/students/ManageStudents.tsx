import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaginateReqEntity } from '../../../interface/pagination';
import useDebouncedEffect from '../../../hooks/useDebounce';
import { debounceTimeInMilliseconds, formatMobileNumber } from '../../../utils/constants/constant';
import Loader from '../../../components/Loader';
import TableTitle from '../../../components/TableTitle';
import SearchButton from '../../../components/SearchButton';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PrimePaginator from '../../../components/PrimePaginator';
import { PaginatorPageChangeEvent } from 'primereact/paginator';
import { Dialog } from 'primereact/dialog';
import { deleteEducationStudentAPI, fetchMobilePrefillAPI, getAllStudentsAPI } from '../../../utils/axios/apiServices';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { toastError, toastSuccess } from '../../../utils/functions/shared';
import { InputText } from 'primereact/inputtext';
import { validationMessages } from '../../../utils/constants/messages';
import { INDIAN_MOBILE_NUMBER_PATTERN } from '../../../utils/constants/pattern';
import { IFetchMobilePrefillResult, IFetchStudentResponse, IStudent } from '../../../interface/student';
import { decryptVAPTData } from '../../../utils/functions/encryptDecrypt';
import usePermission from '../../../hooks/usePermission';

type StudentLookupForm = {
  mobileNumber: string;
};

type StudentLookupErrors = {
  mobileNumber: string;
};

export type StudentFormPrefillNavigationState = {
  mobilePrefill?: {
    mobileNumber: string;
    result: IFetchMobilePrefillResult | null;
  };
  openStudentMobileDialog?: boolean;
};

const ManageStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);

  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const [students, setStudents] = useState<IStudent[]>([]);

  const [searchText, setSearchText] = useState<string>('');

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [studentForm, setStudentForm] = useState<boolean>(false);

  const [formValues, setFormValues] = useState<StudentLookupForm>({
    mobileNumber: '',
  });

  const [formErrors, setFormErrors] = useState<StudentLookupErrors>({
    mobileNumber: '',
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [isManualEntryRequired, setIsManualEntryRequired] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const { userID } = useSelector((state: RootState) => state.user.user);

  const { view, create } = usePermission("ManageStudents", ["view", "create"])();

  const locationState = (location.state || {}) as StudentFormPrefillNavigationState;

  const validateMobileNumber = (value: string): string => {
    if (!value.trim()) {
      return validationMessages.mobileNumberRequired;
    }

    if (!(INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10)) {
      return validationMessages.mobileNumberInvalid;
    }

    return '';
  };

  const fetchStudents = async (): Promise<void> => {
    if (!userID) {
      setStudents([]);
      setTotalRecords(0);
      return;
    }

    setLoading(true);

    const requestBody: {
      instituteID: string;
      search?: string;
      page: number;
      pageSize: number;
    } = {
      instituteID: userID,
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      requestBody.search = filterReq.searchText.trim();
    }

    const response: IFetchStudentResponse = await getAllStudentsAPI(requestBody);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      setStudents(response.data.studentList);
      setTotalRecords(response.data.totalCount);
    } else {
      setStudents([]);
      setTotalRecords(0);
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDeleteStudent = async (): Promise<void> => {
    if (!deleteTarget?.id) return;

    setLoading(true);
    setLoadingMessage('Deleting student...');

    try {
      const response = await deleteEducationStudentAPI(deleteTarget.id);

      if (!response) {
        return;
      }

      if (response.statusCode !== 200) {
        toastError(response.message);
        return;
      }

      toastSuccess(response.message);
      setDeleteTarget(null);
      await fetchStudents();
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const resetStudentLookupForm = (): void => {
    setFormValues({
      mobileNumber: '',
    });
    setFormErrors({
      mobileNumber: '',
    });
    setIsFormSubmitted(false);
    setIsManualEntryRequired(false);
    setLoadingMessage('');
  };

  const handleCloseStudentForm = (): void => {
    setStudentForm(false);
    resetStudentLookupForm();
  };

  const handleChange = (fieldName: keyof StudentLookupForm, value: string): void => {
    const sanitizedValue =
      fieldName === 'mobileNumber'
        ? value.replace(/\D/g, '').slice(0, 10)
        : value;

    setFormValues((prev) => ({
      ...prev,
      [fieldName]: sanitizedValue,
    }));

    setIsManualEntryRequired(false);

    setFormErrors((prev) => ({
      ...prev,
      [fieldName]:
        fieldName === 'mobileNumber'
          ? validateMobileNumber(sanitizedValue)
          : '',
    }));
  };

  const handleVerifyStudentMobileNumber = async (): Promise<void> => {
    const mobileNumber = formValues.mobileNumber.trim();
    const mobileNumberError = validateMobileNumber(mobileNumber);

    setIsFormSubmitted(true);
    setFormErrors({ mobileNumber: mobileNumberError });

    if (mobileNumberError || !userID) {
      return;
    }

    setLoading(true);
    setLoadingMessage('Fetching details...');

    try {
      const body = {
        mobile_no: mobileNumber,
        instituteId: userID,
      };

      const response = await fetchMobilePrefillAPI(body);

      if (!response) return;

      if (response.data?.isManualEntryRequired) {
        toastError(response.message);
        setIsManualEntryRequired(true);
        return;
      }

      if (response.statusCode !== 200) {
        toastError(response.message);
        return;
      }

      navigate(RoutePathConstant.private.educationAddStudent, {
        state: {
          mobilePrefill: {
            mobileNumber,
            result: response.data?.result ?? null,
          },
        } satisfies StudentFormPrefillNavigationState,
      });

      handleCloseStudentForm();
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleContinueWithoutMobileNumber = (mobileNumber: string = ''): void => {
    navigate(RoutePathConstant.private.educationAddStudent, {
      state: mobileNumber
        ? {
          mobilePrefill: {
            mobileNumber,
            result: null,
          },
        } satisfies StudentFormPrefillNavigationState
        : undefined,
    });
  };

  const handleAddStudentManually = (): void => {
    handleContinueWithoutMobileNumber(formValues.mobileNumber.trim());
    handleCloseStudentForm();
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageSize: event.rows,
      pageNumber: event.page,
    }));
  };

  const actionBody = (rowData: IStudent) => {
    const loanTooltipId = `student-loan-${rowData.id}`;
    const viewTooltipId = `student-view-${rowData.id}`;
    const editTooltipId = `student-edit-${rowData.id}`;
    const deleteTooltipId = `student-delete-${rowData.id}`;

    return (
      <div className="d-flex gap-2">
        {view && (
          <>
            <Tooltip target={`#${viewTooltipId}`} position="top" />
            <Button
              id={viewTooltipId}
              className="trash-icon p-0"
              data-pr-tooltip="View Student"
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.educationManageStudents}/${rowData.id}`,
                )
              }
            >
              <i className='icon-eye' />
            </Button>
          </>
        )}

        {create && (
          <>
            <Tooltip target={`#${loanTooltipId}`} position="top" />
            <Tooltip target={`#${editTooltipId}`} position="top" />
            <Tooltip target={`#${deleteTooltipId}`} position="top" />
            <Button
              id={loanTooltipId}
              className="trash-icon p-0"
              data-pr-tooltip="Apply Loan"
              onClick={() =>
                navigate(
                  RoutePathConstant.private.educationStudentLoanApplication,
                  {
                    state: {
                      preselectedStudentId: rowData.id,
                      selectedStudent: rowData,
                      activeIndex: 1,
                      returnTo: RoutePathConstant.private.educationManageStudents,
                    },
                  },
                )
              }
            >
              <i className="bi bi-journal-check" />
            </Button>
            <Button
              id={editTooltipId}
              className="trash-icon p-0"
              data-pr-tooltip="Edit Student"
              onClick={() =>
                navigate(
                  RoutePathConstant.private.educationEditStudent.replace(':id', rowData.id),
                )
              }
            >
              <i className='icon-edit' />
            </Button>
            <Button
              id={deleteTooltipId}
              className="trash-icon p-0"
              data-pr-tooltip="Delete Student"
              onClick={() => setDeleteTarget(rowData)}
            >
              <i className="bi bi-trash" />
            </Button>
          </>
        )}
      </div>
    );
  }

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
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText]);

  useEffect(() => {
    if (!locationState.openStudentMobileDialog) {
      return;
    }

    setStudentForm(true);

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, locationState.openStudentMobileDialog, navigate]);

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
                  placeholder="Search by Student code and name"
                />

                {create && (
                  <div className="form-group">
                    <Button
                      onClick={() => setStudentForm(true)}
                      className="btn btn-orange"
                    >
                      <i className="bi bi-plus-circle me-2" />
                      Add Student
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="whiteBoxHldr">
              <div className="table-responsive">
                <DataTable
                  className="tableMain"
                  value={students}
                  emptyMessage="No students found."
                >
                  <Column field="code" header="Code" />

                  <Column
                    field="fullName"
                    header="Name"
                  />

                  <Column
                    body={(rowData: IStudent) =>
                      rowData.phoneNumber ? formatMobileNumber(decryptVAPTData(rowData.phoneNumber)) : "-"
                    }
                    header="Mobile Number"
                  />

                  <Column
                    body={(rowData: IStudent) =>
                      rowData.email ? decryptVAPTData(rowData.email) : ""
                    }
                    header="Email Address" />

                  {(create || view) &&
                    <Column
                      header="Action"
                      body={actionBody}
                    />
                  }
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
        style={{ width: '520px' }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={() => setDeleteTarget(null)}
              disabled={loading}
              label="Cancel"
            />
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={handleDeleteStudent}
              disabled={loading}
              label={loading && deleteTarget ? (loadingMessage || 'Deleting...') : 'Delete Student'}
            />
          </div>
        }
      >
        <p className="mb-0">
          Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>?
        </p>
      </Dialog>

      <Dialog
        header="Mobile Number"
        visible={studentForm}
        className="modalWrapper"
        onHide={handleCloseStudentForm}
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: '520px' }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseStudentForm}
              disabled={loading}
              label="Cancel"
            />
            {isManualEntryRequired ? (
              <Button
                className="btn btn-orange w-100 text-center"
                onClick={handleAddStudentManually}
                disabled={loading}
                label="Add Student Manually"
              />
            ) : (
              <Button
                className="btn btn-orange w-100 text-center"
                onClick={() => handleVerifyStudentMobileNumber()}
                disabled={loading}
                label={loading ? (loadingMessage || 'Processing...') : 'Next'}
              />
            )}
          </div>
        }
      >
        <Loader isLoading={loading} />

        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3" style={{ fontSize: '16px', fontWeight: '400' }}>
              {isManualEntryRequired
                ? "We didn't found details for the given mobile number. Still you can add this student manually by click on 'Add Student Manually'."
                : 'Enter the mobile number to authenticate the student and continue with student onboarding.'}
            </p>

            <div className="form-group mb-3">
              <label className="form-label small" htmlFor="studentMobileNumber">
                Mobile Number <sup>*</sup>
              </label>
              <InputText
                id="studentMobileNumber"
                name="mobileNumber"
                autoFocus
                className="form-control"
                placeholder="Enter Mobile Number"
                value={formValues.mobileNumber}
                maxLength={10}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
              />
              {isFormSubmitted && formErrors.mobileNumber ? (
                <small className="error">{formErrors.mobileNumber}</small>
              ) : null}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManageStudents;

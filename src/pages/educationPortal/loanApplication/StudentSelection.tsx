import { useEffect, useState } from 'react'
import PrimePaginator from '../../../components/PrimePaginator'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatMobileNumber } from '../../../utils/constants/constant'
import { toastError } from '../../../utils/functions/shared'
import { PaginateReqEntity } from '../../../interface/pagination'
import { PaginatorPageChangeEvent } from 'primereact/paginator'
import { getAllStudentsAPI } from '../../../utils/axios/apiServices'
import { IFetchStudentResponse, IStudent } from '../../../interface/student'
import { RootState } from '../../../store'
import { useSelector } from 'react-redux'
import { decryptVAPTData } from '../../../utils/functions/encryptDecrypt'
import Loader from '../../../components/Loader'

type StudentSelectionProps = {
  selectedStudent: IStudent | null;
  onSelectionChange: (student: IStudent | null) => void;
};

const StudentSelection = ({
  selectedStudent,
  onSelectionChange,
}: StudentSelectionProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [students, setStudents] = useState<IStudent[]>([]);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const { userID } = useSelector((state: RootState) => state.user.user);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
  });

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: event.page,
      pageSize: event.rows,
    }));
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

  useEffect(() => {
    fetchStudents();
  }, [filterReq.pageNumber, filterReq.pageSize]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="row g-4">
        <div className="col-12">
          <div className="p-24 h-100">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h4 className="mb-1">Select Student</h4>
                <p className="mb-0 text-muted">
                  Choose the student profile that should move into the education
                  loan journey.
                </p>
              </div>
            </div>

            <DataTable
              className="tableMain"
              value={students}
              emptyMessage="No student found"
              dataKey="id"
              selectionMode="single"
              selection={selectedStudent}
              onSelectionChange={(event) =>
                onSelectionChange((event.value as IStudent) ?? null)
              }
            >
              <Column selectionMode="single" />

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
                header="Email Address"
              />

            </DataTable>

            <div className="mt-3">
              <PrimePaginator
                onPageChange={onPageChange}
                pageNumber={filterReq.pageNumber}
                pageSize={filterReq.pageSize}
                totalRecords={totalRecords}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentSelection

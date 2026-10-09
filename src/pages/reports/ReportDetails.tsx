import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BackButton from "../../components/BackButton";
import usePermission from "../../hooks/usePermission";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import {
  formatMobileNumber,
  RouteParams
} from "../../utils/constants/constant";
import { handleFileDownload, toastError } from "../../utils/functions/shared";
import TableTitle from "../../components/TableTitle";
import moment from "moment";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";
import { downloadAllReportsAPI, getStudentReportDetailAPI } from "../../utils/axios/apiServices";
import { IStudentReportDetailResponse, IStudentReportDetailResponseData, IStudentReports } from "../../interface/reports";

const ReportDetails = () => {
  const [studentDetail, setStudentDetail] =
    useState<IStudentReportDetailResponseData>();

  const [loading, setLoading] = useState<boolean>(false);

  const { view } = usePermission("Reports", ["view"])();

  const { id } = useParams<RouteParams>();

  const fetchChannelPartnerReportApi = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const params: { studentID: string, isStudentDetailsRequired: boolean } = {
      studentID: id,
      isStudentDetailsRequired: true
    };

    const response: IStudentReportDetailResponse =
      await getStudentReportDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        email: response.data.email ? decryptVAPTData(response.data.email) : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
      };

      setStudentDetail(decryptedData);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionBody = (studentInfo: IStudentReports) => {
    console.log('studentInfo', studentInfo)
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const downloadId = `student-detail-download-${studentInfo.reportType}`;

    return (
      <>
        <Tooltip target={`#${downloadId}`} position="top" />

        <Button
          id={downloadId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="Download Report"
          onClick={() =>
            handleFileDownload(
              studentInfo.filePath,
              `${studentInfo.name}_${timestamp}`,
            )
          }
        >
          <i className="icon-download" />
        </Button>
      </>
    );
  };

  const handleDownloadAllReports = async (): Promise<void> => {
    if (!studentDetail?.studentID) return;

    const reportTypes =
      studentDetail?.studentReports
        .map((report) => report.reportType)
        .filter((type) => type !== undefined) || [];

    if (studentDetail?.studentReports.length === 0) {
      toastError("No valid report types found");
      return;
    }

    setLoading(true);

    const response: ArrayBuffer = await downloadAllReportsAPI(
      reportTypes,
      studentDetail?.studentID,
    );

    const blob = new Blob([response], { type: "application/zip" });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `Reports-${studentDetail.studentName}.zip`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setLoading(false);
  };

  useEffect(() => {
    fetchChannelPartnerReportApi();
  }, [id]);

  console.log('studentDetail', studentDetail)

  return (
    <div className="row">
      <Loader isLoading={loading} />

      <div className="col-lg-12 col-md-12 col-sm-12 col-12">
        <div className="whiteBoxHldr p-30">
          <div className="row">
            <div className="col-12">
              <TableTitle title="Reports" />

              <div className="row">
                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Student Code</b>
                        <p className="text-break">{studentDetail?.studentCode}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Student Name</b>
                        <p className="text-break">{studentDetail?.studentName}</p>
                      </div>

                      {studentDetail?.mobileNumber &&
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Mobile Number</b>
                          <p className="text-break">
                            {formatMobileNumber(studentDetail?.mobileNumber)}
                          </p>
                        </div>
                      }

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Email</b>

                        <p className="text-break">{studentDetail?.email}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12">
                        <b>PAN Number</b>
                        <p className="text-break">{studentDetail?.panNumber}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12">
                        <b>Institute</b>
                        <p className="text-break">{studentDetail?.institute}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-4">
                  <div className="whiteBoxHldr">
                    <div className="table-responsive">
                      <DataTable
                        className="tableMain"
                        value={studentDetail?.studentReports}
                        emptyMessage="No Report Found"
                      >
                        <Column
                          body={(rowData, options) => options.rowIndex + 1}
                          header="Sr. No."
                        />

                        <Column
                          field="name"
                          header="Reports"
                          style={{ width: "60vw" }}
                        />

                        {view && <Column body={actionBody} header="Action" />}
                      </DataTable>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-sm-12 col-12 mt-4">
                  <Button
                    label="Download All Reports"
                    className={`btn ${studentDetail?.studentReports?.length === 0
                      ? "btn-orange-disabled"
                      : "btn-orange"
                      } me-2`}
                    onClick={handleDownloadAllReports}
                    disabled={studentDetail?.studentReports?.length === 0}
                  />
                  <BackButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;

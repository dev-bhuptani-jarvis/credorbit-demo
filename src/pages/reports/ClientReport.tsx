import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { handleFileDownload, toastError } from "../../utils/functions/shared";
import {
  IChannelPartnerClientReportDetailResponse,
  IClientDetailList,
  IClientDetailListParams,
} from "../../interface/reports";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  getCpReportDetailsAPI,
} from "../../utils/axios/apiServices";
import TableTitle from "../../components/TableTitle";
import moment from "moment";
import { Tooltip } from "primereact/tooltip";

const ClientReport = () => {
  const [reportsData, setReportsData] = useState<IClientDetailList[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const { userName, userID } = useSelector(
    (state: RootState) => state.user.user,
  );

  const actionBody = (clientInfo: IClientDetailList): JSX.Element => {
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const downloadId = `client-download-${clientInfo.reportType}`;

    return (
      <>
        <Tooltip target={`#${downloadId}`} position="top" />

        <Button
          id={downloadId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download Report"
          onClick={() =>
            handleFileDownload(
              clientInfo.filePath,
              `${clientInfo.name}_${userName}_${timestamp}`,
            )
          }
        >
          <img
            src="/assets/images/download.svg"
            alt="download-icon"
            loading="lazy"
          />
        </Button>
      </>
    );
  };

  const fetchClientReports = async (): Promise<void> => {
    setLoading(true);

    const params: IClientDetailListParams = {
      clientID: userID,
      isClientDetailsRequired: false,
    };

    const response: IChannelPartnerClientReportDetailResponse =
      await getCpReportDetailsAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setReportsData(response.data.clientReports);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClientReports();
  }, []);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 titleMainWrapper justify-content-between mb-4">
            <TableTitle title="Reports" />

            <div className="BtnRightHldr flex-md-wrap">
              {/* {reportsData.length > 0 && (
                <Button
                  label="Download All Reports"
                  className="btn btn-orange"
                  onClick={handleDownloadAllReports}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <DataTable
          className="tableMain"
          value={reportsData}
          emptyMessage="No reports found"
        >
          <Column
            body={(rowData, options) => options.rowIndex + 1}
            header="Sr. No."
          />

          <Column field="name" header="Reports" style={{ width: "60vw" }} />

          <Column body={actionBody} header="Action" />
        </DataTable>
      </div>
    </div>
  );
};

export default ClientReport;

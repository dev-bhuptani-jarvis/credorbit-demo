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
  RouteParams,
} from "../../utils/constants/constant";
import {
  getCpReportDetailsAPI,
} from "../../utils/axios/apiServices";
import { handleFileDownload, toastError } from "../../utils/functions/shared";
import {
  IChannelPartnerClientReportDetailData,
  IChannelPartnerClientReportDetailResponse,
  IClientDetailList,
  IClientDetailListParams,
} from "../../interface/reports";
import TableTitle from "../../components/TableTitle";
import moment from "moment";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const ReportDetails = () => {
  const [clientDetail, setClientDetail] =
    useState<IChannelPartnerClientReportDetailData>();

  const [loading, setLoading] = useState<boolean>(false);

  const { view } = usePermission("Reports", ["view"])();

  const { id } = useParams<RouteParams>();

  const fetchChannelPartnerReportApi = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const params: IClientDetailListParams = {
      clientID: id,
      isClientDetailsRequired: true,
    };

    const response: IChannelPartnerClientReportDetailResponse =
      await getCpReportDetailsAPI(params);

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

      setClientDetail(decryptedData);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionBody = (clientInfo: IClientDetailList) => {
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const downloadId = `client-detail-download-${clientInfo.reportType}`;

    return (
      <>
        <Tooltip target={`#${downloadId}`} position="top" />

        <Button
          id={downloadId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="Download Report"
          onClick={() =>
            handleFileDownload(
              clientInfo.filePath,
              `${clientInfo.name}_${clientDetail?.clientName}_${timestamp}`,
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

  useEffect(() => {
    fetchChannelPartnerReportApi();
  }, [id]);

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
                        <b>Client Code</b>
                        <p className="text-break">{clientDetail?.clientCode}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Client Name</b>
                        <p className="text-break">{clientDetail?.clientName}</p>
                      </div>

                      {clientDetail?.mobileNumber &&
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Mobile Number</b>
                          <p className="text-break">
                            {formatMobileNumber(clientDetail?.mobileNumber)}
                          </p>
                        </div>
                      }

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Email</b>

                        <p className="text-break">{clientDetail?.email}</p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12">
                        <b>Channel Partner</b>
                        <p className="text-break">
                          {clientDetail?.channelPartner}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12">
                        <b>PAN Number</b>
                        <p className="text-break">{clientDetail?.panNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-4">
                  <div className="whiteBoxHldr">
                    <div className="table-responsive">
                      <DataTable
                        className="tableMain"
                        value={clientDetail?.clientReports}
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

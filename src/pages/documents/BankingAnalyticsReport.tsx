import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  IBankingAnalyticsReportData,
  IBankingAnalyticsReportResponse,
  IBankingReportList,
} from "../../interface/reports";
import { getBankingAnalyticsDetailsAPI } from "../../utils/axios/apiServices";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import BackButton from "../../components/BackButton";
import TableTitle from "../../components/TableTitle";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import moment from "moment";
import { handleFileDownload } from "../../utils/functions/shared";
import { Tooltip } from "primereact/tooltip";

const BankingAnalyticsReport = () => {
  const [bankingAnalyticsReport, setBankingAnalyticsReport] =
    useState<IBankingAnalyticsReportData>();

  const [loading, setLoading] = useState<boolean>(false);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient } = useSelector(
    (state: RootState) => state.user.user,
  );

  const { count } = useSelector((state: RootState) => state.count);

  const navigate = useNavigate();

  const fetchBankingAnalyticsReport = async (): Promise<void> => {
    setLoading(true);

    const response: IBankingAnalyticsReportResponse =
      await getBankingAnalyticsDetailsAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setBankingAnalyticsReport(response.data);
    }
    setLoading(false);
  };

  const actionBody = (clientInfo: IBankingReportList): JSX.Element => {
    const pdfId = `pdf-${clientInfo.id}`;
    const excelId = `excel-${clientInfo.id}`;

    return (
      <>
        <Tooltip target={`#${pdfId}`} position="top" />
        <Tooltip target={`#${excelId}`} position="top" />

        <Button
          id={pdfId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download PDF Report"
          onClick={() =>
            handleFileDownload(clientInfo.pdfFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/pdf-download.svg"
            alt="pdf-download-icon"
            loading="lazy"
          />
        </Button>

        <Button
          id={excelId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download Excel Report"
          onClick={() =>
            handleFileDownload(clientInfo.excelFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/excel-download.svg"
            alt="excel-download-icon"
            loading="lazy"
          />
        </Button>
      </>
    );
  };

  useEffect(() => {
    fetchBankingAnalyticsReport();
  }, [count]);

  return (
    <div className="col-12">
      <div className="whiteBoxHldr p-24">
        <Loader isLoading={loading} />
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title="Banking Analytics" />

              <div className="BtnRightHldr">
                <div className="form-group">
                  {(isDefaultCpClient || isImpersonate) && (
                    <Button
                      className="btn btn-orange"
                      onClick={() =>
                        navigate(RoutePathConstant.private.bankDetails, {
                          state: "dashboard",
                        })
                      }
                      label="Get Banking Analytics"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive mb-4">
          <DataTable
            className="tableMain"
            value={bankingAnalyticsReport?.bankingAnalyticsDetailsList}
            emptyMessage="No Report Found"
          >
            <Column
              header="Sr. No."
              body={(rowData, options) => options.rowIndex + 1}
            />

            <Column field="fileName" header="File Name" />

            <Column
              body={(rowData: IBankingReportList) => rowData.bankName || "-"}
              header="Bank Name"
            />

            <Column
              body={(rowData: IBankingReportList) => rowData.period || "-"}
              header="Period"
            />

            <Column
              body={(rowData: IBankingReportList) => rowData.accountType || "-"}
              header="Account Type"
            />

            <Column
              body={(rowData: IBankingReportList) =>
                moment(rowData.retrievedDate).format("Do MMMM YYYY, h:mm A")
              }
              header="Fetched Date & Time"
            />

            <Column body={actionBody} header="Action" />
          </DataTable>
        </div>

        <BackButton />
      </div>
    </div>
  );
};

export default BankingAnalyticsReport;

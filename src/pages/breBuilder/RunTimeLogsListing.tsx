import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tooltip } from "primereact/tooltip";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import {
  IGetRunTimeLogsData,
  IGetRunTimeLogsResponse,
} from "../../interface/breBulilder";
import { getRuntimeLogsAPI } from "../../utils/axios/apiServices";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatDate, toastError } from "../../utils/functions/shared";
import "./runtimeLogs.css";

const getDecisionClassName = (decision?: string | null): string => {
  const normalizedDecision = decision?.trim().toUpperCase();

  if (normalizedDecision === "APPROVE") {
    return "runtime-logs-page__decision runtime-logs-page__decision--approve";
  }

  if (normalizedDecision === "REVIEW") {
    return "runtime-logs-page__decision runtime-logs-page__decision--review";
  }

  if (normalizedDecision === "REJECT") {
    return "runtime-logs-page__decision runtime-logs-page__decision--reject";
  }

  return "runtime-logs-page__decision runtime-logs-page__decision--neutral";
};

const RunTimeLogsListing = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [runtimeLogs, setRuntimeLogs] = useState<IGetRunTimeLogsData[]>([]);

  const fetchRuntimeLogs = async (): Promise<void> => {
    setLoading(true);

    try {
      const response: IGetRunTimeLogsResponse = await getRuntimeLogsAPI();

      if (!response) {
        return;
      }

      if (response.statusCode === 200) {
        setRuntimeLogs(response.data?.logs || []);
        return;
      }

      setRuntimeLogs([]);
      toastError(response.message);
    } catch (error) {
      console.error("Failed to fetch run time logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuntimeLogs();
  }, []);

  return (
    <div className="whiteBoxHldr p-24 runtime-logs-page">
      <Loader isLoading={loading} />

      <div className="runtime-logs-page__header">
        <TableTitle title="Run Time Logs" />
      </div>

      <div className="runtime-logs-page__section p-24">
        <div className="table-responsive">
          <DataTable
            className="tableMain"
            value={runtimeLogs}
            emptyMessage="No run time logs found."
          >
            <Column field="loanApplicationCode" header="Loan App ID" />

            <Column field="studentName" header="Student Name" />
            
            <Column field="studentCode" header="Student Code" />
            
            <Column
              header="Policy"
              body={(rowData: IGetRunTimeLogsData) =>
                `V${rowData.versionNo || 0} / ${rowData.policyVersionID || "-"}`
              }
            />
            
            <Column
              header="Decision"
              body={(rowData: IGetRunTimeLogsData) => (
                <span className={getDecisionClassName(rowData.finalDecision)}>
                  {rowData.finalDecision || "-"}
                </span>
              )}
            />

            <Column
              field="evaluationStatus"
              header="Evaluation Status"
              body={(rowData: IGetRunTimeLogsData) => rowData.evaluationStatus || "-"}
            />
            
            <Column
              header="ROI %"
              body={(rowData: IGetRunTimeLogsData) => rowData.roiPercent ?? "-"}
            />
            
            <Column
              header="Processing Fee"
              body={(rowData: IGetRunTimeLogsData) =>
                rowData.processingFee !== null && rowData.processingFee !== undefined
                  ? formatCurrencyAmount(Number(rowData.processingFee || 0))
                  : "-"
              }
            />

            <Column
              header="Tenure"
              body={(rowData: IGetRunTimeLogsData) =>
                rowData.tenureMonths ? `${rowData.tenureMonths} months` : "-"
              }
            />
            
            <Column
              header="Created On"
              body={(rowData: IGetRunTimeLogsData) =>
                rowData.createdAt ? formatDate(rowData.createdAt, "DD MMM, YYYY hh:mm A") : "-"
              }
            />
            
            <Column
              header="Action"
              body={(rowData: IGetRunTimeLogsData) => {
                const actionTooltipId = `runtime-log-view-${rowData.id}`;

                return (
                  <>
                    <Tooltip target={`#${actionTooltipId}`} position="top" />
                    <Button
                      id={actionTooltipId}
                      className="trash-icon p-0"
                      data-pr-tooltip="View Log Detail"
                      onClick={() =>
                        navigate(
                          RoutePathConstant.private.runTimeLogsDetails.replace(
                            ":id",
                            rowData.id.toString(),
                          ),
                        )
                      }
                    >
                      <i className="icon-eye" />
                    </Button>
                  </>
                );
              }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default RunTimeLogsListing;

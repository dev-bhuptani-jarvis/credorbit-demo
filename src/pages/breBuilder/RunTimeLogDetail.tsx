import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  IGetRunTimeLogsDetailResponse,
  IGetRunTimeLogsDetailResponseData,
  IRunTimeLogEvaluationTrace,
} from "../../interface/breBulilder";
import { getRuntimeLogDetailAPI } from "../../utils/axios/apiServices";
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

const parseJsonSafely = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Failed to parse runtime log json", error);
    return fallback;
  }
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  return String(value);
};

const RunTimeLogDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [runtimeLogDetail, setRuntimeLogDetail] = useState<IGetRunTimeLogsDetailResponseData | null>(null);

  const fetchRuntimeLogDetail = async (): Promise<void> => {
    const runtimeLogID = Number(id || 0);

    if (!runtimeLogID) {
      toastError("Run time log ID is missing.");
      navigate(RoutePathConstant.private.runTimeLogs);
      return;
    }

    setLoading(true);

    try {
      const response: IGetRunTimeLogsDetailResponse = await getRuntimeLogDetailAPI({ runtimeLogID });

      if (!response) {
        return;
      }

      if (response.statusCode === 200 && response.data) {
        setRuntimeLogDetail(response.data);
        return;
      }

      toastError(response.message);
      navigate(RoutePathConstant.private.runTimeLogs);
    } catch (error) {
      console.error("Failed to fetch run time log detail", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuntimeLogDetail();
  }, [id]);

  const inputSnapshot = useMemo<Record<string, unknown>>(() => {
    if (!runtimeLogDetail) {
      return {};
    }

    if (runtimeLogDetail.inputSnapshot && Object.keys(runtimeLogDetail.inputSnapshot).length > 0) {
      return runtimeLogDetail.inputSnapshot;
    }

    return parseJsonSafely<Record<string, unknown>>(runtimeLogDetail.inputSnapshotJson, {});
  }, [runtimeLogDetail]);

  const evaluationTrace = useMemo<IRunTimeLogEvaluationTrace[]>(() => {
    if (!runtimeLogDetail) {
      return [];
    }

    if (Array.isArray(runtimeLogDetail.evaluationTrace) && runtimeLogDetail.evaluationTrace.length > 0) {
      return runtimeLogDetail.evaluationTrace;
    }

    return parseJsonSafely<IRunTimeLogEvaluationTrace[]>(runtimeLogDetail.evaluationTraceJson, []);
  }, [runtimeLogDetail]);

  return (
    <div className="whiteBoxHldr p-24 runtime-logs-page">
      <Loader isLoading={loading} />

      <div className="runtime-logs-page__header">
        <div>
          <h3 className="mb-1">Run Time Log Detail</h3>
          <p className="mb-0 text-muted">
            Review executed inputs, policy output, and evaluation trace path.
          </p>
        </div>

        <Button
          className="btn btn-black-line"
          onClick={() => navigate(RoutePathConstant.private.runTimeLogs)}
        >
          Back to Logs
        </Button>
      </div>

      <div className="runtime-logs-page__section p-24">
        <div className="runtime-logs-page__summary">
          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Loan App ID</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.loanApplicationCode || "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Student</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.studentName || "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Policy Version</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail ? `V${runtimeLogDetail.versionNo || 0} / ${runtimeLogDetail.policyVersionID || "-"}` : "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Final Decision</span>
            <span className={getDecisionClassName(runtimeLogDetail?.finalDecision)}>
              {runtimeLogDetail?.finalDecision || "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Evaluation Status</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.evaluationStatus || "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Terminal Outcome ID</span>
            <span className="runtime-logs-page__value">
              {formatValue(runtimeLogDetail?.terminalOutcomeID)}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">ROI %</span>
            <span className="runtime-logs-page__value">
              {formatValue(runtimeLogDetail?.roiPercent)}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Processing Fee</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.processingFee !== null && runtimeLogDetail?.processingFee !== undefined
                ? formatCurrencyAmount(Number(runtimeLogDetail.processingFee || 0))
                : "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Advance EMI %</span>
            <span className="runtime-logs-page__value">
              {formatValue(runtimeLogDetail?.advanceEmiPercent)}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Tenure Months</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.tenureMonths ? `${runtimeLogDetail.tenureMonths} months` : "-"}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">No. of EMI</span>
            <span className="runtime-logs-page__value">
              {formatValue(runtimeLogDetail?.noOfEmis)}
            </span>
          </div>

          <div className="runtime-logs-page__card">
            <span className="runtime-logs-page__label">Created On</span>
            <span className="runtime-logs-page__value">
              {runtimeLogDetail?.createdAt
                ? formatDate(runtimeLogDetail.createdAt, "DD MMM, YYYY hh:mm A")
                : "-"}
            </span>
          </div>
        </div>

        {runtimeLogDetail?.rejectionReason ? (
          <div className="runtime-logs-page__card mt-3">
            <span className="runtime-logs-page__label">Rejection Reason</span>
            <span className="runtime-logs-page__value">{runtimeLogDetail.rejectionReason}</span>
          </div>
        ) : null}
      </div>

      <div className="runtime-logs-page__section p-24">
        <div className="runtime-logs-page__section-head">
          <div>
            <h5>Input Snapshot</h5>
            <p>Policy input values captured for this execution.</p>
          </div>
        </div>

        {Object.keys(inputSnapshot).length > 0 ? (
          <div className="runtime-logs-page__kv">
            {Object.entries(inputSnapshot).map(([key, value]) => (
              <div className="runtime-logs-page__kv-item" key={key}>
                <span className="runtime-logs-page__label">{key}</span>
                <span className="runtime-logs-page__value">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        ) : runtimeLogDetail?.inputSnapshotJson ? (
          <pre className="runtime-logs-page__json">{runtimeLogDetail.inputSnapshotJson}</pre>
        ) : (
          <div className="runtime-logs-page__empty">No input snapshot available.</div>
        )}
      </div>

      <div className="runtime-logs-page__section p-24">
        <div className="runtime-logs-page__section-head">
          <div>
            <h5>Evaluation Trace</h5>
            <p>Step-by-step policy path matched during execution.</p>
          </div>
        </div>

        {evaluationTrace.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Node ID</th>
                  <th>Node Code</th>
                  <th>Parameter Value</th>
                  <th>Operator</th>
                  <th>Branch Matched</th>
                  <th>Next Node</th>
                  <th>Terminal Outcome</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {evaluationTrace.map((trace) => (
                  <tr key={`${trace.stepNo}-${trace.nodeInstanceID}`}>
                    <td>{trace.stepNo}</td>
                    <td>{trace.nodeInstanceID}</td>
                    <td>{trace.nodeCode || "-"}</td>
                    <td>{trace.parameterValue || "-"}</td>
                    <td>{trace.operatorUsed || "-"}</td>
                    <td>{trace.branchMatched || "-"}</td>
                    <td>{formatValue(trace.nextNodeInstanceID)}</td>
                    <td>{formatValue(trace.terminalOutcomeID)}</td>
                    <td>{trace.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : runtimeLogDetail?.evaluationTraceJson ? (
          <pre className="runtime-logs-page__json">{runtimeLogDetail.evaluationTraceJson}</pre>
        ) : (
          <div className="runtime-logs-page__empty">No evaluation trace available.</div>
        )}
      </div>
    </div>
  );
};

export default RunTimeLogDetail;

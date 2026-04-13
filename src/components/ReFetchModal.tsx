import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";
import { ReportType } from "../utils/constants/enum";

interface ReFetchModalProps {
  visible: boolean;
  onHide: () => void;
  reportType: number;
  daysLeft: number;
  reportFetchFunction: () => void;
  message?: string;
}

const ReFetchModal: React.FC<ReFetchModalProps> = ({
  visible,
  onHide,
  reportType,
  daysLeft,
  reportFetchFunction,
  message,
}) => {
  const footerContent = (): React.ReactNode => {
    return (
      <div className="modal-footer" style={{ display: "flex", gap: "10px" }}>
        <Button
          className="btn btn-black-line text-center"
          onClick={handleReset}
          label="Back"
          style={{ flex: 1 }}
        />
        <Button
          className="btn btn-orange text-center"
          label="Re-fetch Report"
          onClick={reportFetchFunction}
          style={{ flex: 1 }}
        />
      </div>
    );
  };

  const getDynamicHeader = (): string => {
    switch (reportType) {
      case ReportType.CREDIT_REPORT:
        return "Re-fetch Credit Report";

      case ReportType.IT_REPORT:
        return "Re-fetch Income Tax Report";

      case ReportType.GST_REPORT:
        return "Re-fetch GST Report";

      case ReportType.BANKING_REPORT:
        return "Re-fetch Banking Report";

      default:
        return "Re-fetch Report";
    }
  };

  const handleReset = (): void => {
    onHide();
  };

  return (
    <Dialog
      header={getDynamicHeader}
      visible={visible}
      modal
      onHide={handleReset}
      className="modalWrapper"
      draggable={false}
      resizable={false}
      footer={footerContent}
      blockScroll
      style={{ width: "650px" }}
    >
      <>
        {message ? (
          <p className="fw-semibold mb-3">{message}</p>
        ) : (
          <p className="fw-semibold mb-3">
            You have already fetched this report{" "}
            <span className="txt-orange">{daysLeft}</span>{" "}
            {daysLeft === 1 ? "day" : "days"} ago.
            <br />
            Do you want to re-fetch it?
          </p>
        )}

        {reportType === ReportType.CREDIT_REPORT && (
          <small className="text-muted">
            Note: Re-fetching your credit report may cut additional credits.
            Please proceed with caution.
          </small>
        )}

        {reportType === ReportType.IT_REPORT && (
          <small className="text-muted">
            Note: Re-fetching your IT report may cut additional credits. Please
            proceed with caution.
          </small>
        )}

        {reportType === ReportType.GST_REPORT && (
          <small className="text-muted">
            Note: Re-fetching your GST report may cut additional credits. Please
            proceed with caution.
          </small>
        )}

        {reportType === ReportType.BANKING_REPORT && (
          <small className="text-muted">
            Note: Re-fetching your Banking report may cut additional credits. Please
            proceed with caution.
          </small>
        )}
      </>
    </Dialog>
  );
};

export default ReFetchModal;

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import PrimePaginator from "../../components/PrimePaginator";
import CustomModal from "../../components/CustomModal";
import { useEffect, useState } from "react";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
  PAYMENT_REQUEST_STATUS,
  RouteParams,
} from "../../utils/constants/constant";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import {
  formatDate,
  handleDownloadCSVData,
  shouldShowContractModal,
  toastError,
} from "../../utils/functions/shared";
import { Nullable } from "primereact/ts-helpers";
import {
  IPayOutsDetailList,
  ISourcingPartnerPayOutDetailParams,
  ISourcingPartnerPayOutDetailResponse,
  ISourcingPartnerPayOutDetailResponseData,
} from "../../interface/payOuts";
import { getSpPayOutDetailsAPI } from "../../utils/axios/apiServices";
import { Calendar } from "primereact/calendar";
import usePermission from "../../hooks/usePermission";
import BackButton from "../../components/BackButton";
import TableTitle from "../../components/TableTitle";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Tooltip } from "primereact/tooltip";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const SourcingPartnerPayoutsDetail = () => {
  const [sourcingPartnerPayOutsData, setSourcingPartnerPayOutsData] =
    useState<ISourcingPartnerPayOutDetailResponseData>();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);

  const [status, setStatus] = useState<number>(0);

  const [paymentModal, setPaymentModal] = useState<boolean>(false);

  const [selectedApplicationID, setSelectedApplicationID] =
    useState<string>("");

  const [reason, setReason] = useState<string>("");

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  const [selectedRowData, setSelectedRowData] =
    useState<IPayOutsDetailList | null>(null);

  const { id } = useParams<RouteParams>();

  const { create } = usePermission("SourcingPartnerPayout", ["create"])();

  const { isContractSigned, contractEnforcementDate, userType } = useSelector(
    (state: RootState) => state.user.user,
  );

  const headersMap: Record<string, string> = {
    "Application Code": "applicationCode",
    "Application Name": "applicantName",
    "Disbursed Date": "disbursementDate",
    "Disbursement Amount": "amountDisburse",
    "Loan Amount": "amountSanctioned",
    "Payout(%)": "payoutPercent",
    "Pay Amount": "payAmount",
    "GST (18%)": "gstAmount",
    Bills: "bills",
    "TDS (5%)": "tdsAmount",
    Payment: "netPayment",
    Remarks: "remarks",
  };

  const handleDateSelect = (clickedDate: Date) => {
    if (!dates || !dates[0]) {
      // First click → set start date
      setDates([clickedDate, null]);
      setCalendarVisible(true);
      return;
    }

    const [start, end] = dates;

    if (start && !end) {
      if (clickedDate < start) {
        // Clicked an earlier date → reset start
        setDates([clickedDate, null]);
        setCalendarVisible(true);
      } else if (clickedDate > start) {
        // Valid end date → set end and close calendar
        setDates([start, clickedDate]);
        setCalendarVisible(false);
      } else {
        // Same date clicked → just keep as start
        setDates([clickedDate, null]);
        setCalendarVisible(true);
      }
      return;
    }

    // Both dates exist → restart selection
    setDates([clickedDate, null]);
    setCalendarVisible(true);
  };

  const renderMonthDropdown = (): JSX.Element => (
    <Calendar
      inputId="disbursementDate"
      value={dates}
      selectionMode="range"
      placeholder="From - To"
      readOnlyInput
      hideOnRangeSelection={false} // we control visibility manually
      maxDate={new Date()}
      showButtonBar
      style={{ width: "250px" }}
      visible={calendarVisible}
      onSelect={(e) => handleDateSelect(e.value as Date)}
      onChange={(e) => {
        if (!e.value) {
          // Clear button clicked → reset state AND close overlay
          setDates(null);
          setCalendarVisible(false); // close calendar
        }
      }}
      onVisibleChange={(e) => {
        // Only allow closing if both dates exist OR overlay is manually closed
        if (!dates || !dates[0] || !dates[1]) {
          setCalendarVisible(true); // keep open if incomplete
        } else {
          setCalendarVisible(e.visible);
        }
      }}
    />
  );

  const remarksBodyTemplate = (rowData: IPayOutsDetailList): JSX.Element => {
    const remarksId = `remarks-${rowData.applicationId}`;

    return (
      <>
        {rowData.remarks && rowData.paymentDate ? (
          <>
            <Tooltip target={`#${remarksId}`} position="top" />

            <Button
              id={remarksId}
              className="trash-icon p-0 ms-2"
              data-pr-tooltip="View Remarks"
              onClick={() => handleViewRemarks(rowData)}
            >
              <img src="/assets/images/eye.svg" alt="eye-icon" />
            </Button>
          </>
        ) : (
          <span>-</span>
        )}
      </>
    );
  };

  const handleViewRemarks = (rowData: IPayOutsDetailList) => {
    setStatus(PAYMENT_REQUEST_STATUS.VIEW_REMARKS);
    setSelectedRowData(rowData);
    setPaymentModal(true);
    setSelectedApplicationID(rowData.applicationId);
  };

  const fetchSourcingPartnerPayOutsDetailApi = async (): Promise<void> => {
    if (!id) return;

    const startDate = dates?.[0];
    const endDate = dates?.[1];

    if (dates && (!startDate || !endDate)) {
      return;
    }

    setLoading(true);

    const formattedFromDate = startDate
      ? formatDate(startDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = endDate
      ? formatDate(endDate, "YYYY-MM-DD")
      : undefined;

    const queryParams: ISourcingPartnerPayOutDetailParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      spID: id,
    };

    if (formattedFromDate && formattedToDate) {
      queryParams.fromDate = formattedFromDate;
      queryParams.toDate = formattedToDate;
    }

    const response: ISourcingPartnerPayOutDetailResponse =
      await getSpPayOutDetailsAPI(queryParams);

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

      setSourcingPartnerPayOutsData(decryptedData);
      setTotalRecords(response.data.totalCount);
      setCalendarVisible(false);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const statusBodyTemplate = (rowData: IPayOutsDetailList): JSX.Element => {
    const hasReason = !!rowData.reason;
    const tooltipTargetId = `status-tooltip-${rowData.applicationId}`;

    return (
      <>
        <span
          id={tooltipTargetId}
          className="StatusLabel"
          style={{
            color: rowData.payoutStatus.color,
            border: `1px solid ${rowData.payoutStatus.color}`,
          }}
        >
          {rowData.payoutStatus.label}
        </span>
        {hasReason && (
          <Tooltip
            target={`#${tooltipTargetId}`}
            content={`Reason:- ${rowData.reason}`}
          />
        )}
      </>
    );
  };

  const handleApproved = (
    rowData: IPayOutsDetailList,
    applicationID: string,
  ) => {
    setStatus(PAYMENT_REQUEST_STATUS.APPROVED);
    setPaymentModal(true);
    setSelectedRowData(rowData);
    setSelectedApplicationID(applicationID);
  };

  const handleRejected = (applicationID: string) => {
    setStatus(PAYMENT_REQUEST_STATUS.REJECTED);
    setPaymentModal(true);
    setSelectedApplicationID(applicationID);
  };

  const handleCompleted = (applicationID: string) => {
    setStatus(PAYMENT_REQUEST_STATUS.COMPLETED);
    setPaymentModal(true);
    setSelectedApplicationID(applicationID);
  };

  const handleInvoiceDownload = (invoiceUrl: string | null) => {
    if (!invoiceUrl) {
      toastError("Invoice URL is not available");
      return;
    }

    window.open(invoiceUrl, "_blank");
  };

  const actionBody = (rowData: IPayOutsDetailList) => {
    const approveId = `approve-${rowData.applicationId}`;
    const rejectId = `reject-${rowData.applicationId}`;
    const downloadId = `download-${rowData.applicationId}`;
    const remarksId = `enter-remarks-${rowData.applicationId}`;

    return (
      <>
        <Tooltip target={`#${approveId}`} position="top" />
        <Tooltip target={`#${rejectId}`} position="top" />
        <Tooltip target={`#${downloadId}`} position="top" />
        <Tooltip target={`#${remarksId}`} position="top" />

        {create && IsStringNullEmptyOrUndefined(rowData?.remarks ?? "") ? (
          <>
            {rowData.requestStatus === PAYMENT_REQUEST_STATUS.INCOMPLETE && (
              <>
                <Button
                  id={approveId}
                  className="trash-icon p-0 me-2"
                  data-pr-tooltip="Approve Payout"
                  onClick={() => {
                    if (
                      !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                      !isContractSigned &&
                      !hasSkippedContractAgreement &&
                      shouldShowContractModal(contractEnforcementDate)
                    ) {
                      setShowContractAgreement(true);
                    } else {
                      handleApproved(rowData, rowData.applicationId);
                    }
                  }}
                >
                  <img src="/assets/images/tick-circle.svg" alt="Approve" />
                </Button>

                <Button
                  id={rejectId}
                  className="trash-icon p-0 me-2"
                  data-pr-tooltip="Reject Payout"
                  onClick={() => {
                    if (
                      !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                      !isContractSigned &&
                      !hasSkippedContractAgreement &&
                      shouldShowContractModal(contractEnforcementDate)
                    ) {
                      setShowContractAgreement(true);
                    } else {
                      handleRejected(rowData.applicationId);
                    }
                  }}
                >
                  <img src="/assets/images/close-circle.svg" alt="Reject" />
                </Button>
              </>
            )}

            {rowData.requestStatus === PAYMENT_REQUEST_STATUS.APPROVED &&
              rowData.invoiceUrl && (
                <>
                  <Button
                    id={downloadId}
                    className="trash-icon p-0 me-2"
                    data-pr-tooltip="Download Invoice"
                    onClick={() => {
                      if (
                        !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                        !isContractSigned &&
                        !hasSkippedContractAgreement &&
                        shouldShowContractModal(contractEnforcementDate)
                      ) {
                        setShowContractAgreement(true);
                      } else {
                        handleInvoiceDownload(rowData.invoiceUrl);
                      }
                    }}
                  >
                    <img
                      src="/assets/images/download.svg"
                      alt="Download Invoice"
                    />
                  </Button>

                  <Button
                    id={remarksId}
                    className="trash-icon p-0 me-2"
                    data-pr-tooltip="Enter Remarks"
                    onClick={() => {
                      if (
                        !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                        !isContractSigned &&
                        !hasSkippedContractAgreement &&
                        shouldShowContractModal(contractEnforcementDate)
                      ) {
                        setShowContractAgreement(true);
                      } else {
                        handleCompleted(rowData.applicationId);
                      }
                    }}
                  >
                    <img
                      src="/assets/images/receipt-text.svg"
                      alt="Enter Remarks"
                    />
                  </Button>
                </>
              )}
          </>
        ) : (
          <>
            <Button
              id={downloadId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Download Invoice"
              onClick={() => {
                if (
                  !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                  !isContractSigned &&
                  !hasSkippedContractAgreement &&
                  shouldShowContractModal(contractEnforcementDate)
                ) {
                  setShowContractAgreement(true);
                } else {
                  handleInvoiceDownload(rowData.invoiceUrl);
                }
              }}
            >
              <img src="/assets/images/download.svg" alt="Download Invoice" />
            </Button>
          </>
        )}
      </>
    );
  };

  const fetchAllPayoutList = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const startDate = dates?.[0];
    const endDate = dates?.[1];

    if (dates && (!startDate || !endDate)) {
      return;
    }

    setLoading(true);

    const formattedFromDate = startDate
      ? formatDate(startDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = endDate
      ? formatDate(endDate, "YYYY-MM-DD")
      : undefined;

    const queryParams: ISourcingPartnerPayOutDetailParams = {
      page: 0,
      pageSize: 0,
      spID: id,
    };

    if (formattedFromDate && formattedToDate) {
      queryParams.fromDate = formattedFromDate;
      queryParams.toDate = formattedToDate;
    }

    const response: ISourcingPartnerPayOutDetailResponse =
      await getSpPayOutDetailsAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      handleDownloadCSVData(
        response.data.payoutList,
        headersMap,
        `Payouts - ${sourcingPartnerPayOutsData?.userCode}`,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSourcingPartnerPayOutsDetailApi();
  }, [filterReq, dates]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 titleBtnWrapper d-flex justify-content-between">
            <TableTitle title="Payouts" />
            <Button className="btn btn-orange" onClick={fetchAllPayoutList}>
              <i className="bi bi-download me-2" /> Download Payouts
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mt-4 mb-4">
          <div className="borderBoxHldr p-24">
            <div className="row">
              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Sourcing Partner Code</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.userCode}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Sourcing Partner Name</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.userName}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Mobile Number</b>
                <p className="text-break">
                  {formatMobileNumber(sourcingPartnerPayOutsData?.mobileNumber)}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Email</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.email}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>PAN Number</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.panNumber}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Payout Sharing Rate(%)</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.payOutPercent.toFixed(2)}
                </p>
              </div>

              <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                <b>Loans Completed</b>
                <p className="text-break">
                  {sourcingPartnerPayOutsData?.loansCompleted}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <DataTable
          className="tableMain"
          filterDisplay="row"
          value={sourcingPartnerPayOutsData?.payoutList}
          emptyMessage="No Payouts found"
          key={clickCounter}
        >
          <Column field="applicationCode" header="Code" />

          <Column />

          <Column
            body={(rowData: IPayOutsDetailList) => {
              return rowData?.applicantName || "-";
            }}
            header="Applicant Name"
          />

          <Column
            body={(rowData: IPayOutsDetailList) => {
              return rowData?.disbursementDate
                ? formatDate(rowData?.disbursementDate, "DD MMM, YYYY")
                : "-";
            }}
            header="Disbursed Date"
            filter
            showFilterMenu={false}
            filterElement={renderMonthDropdown()}
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.amountDisburse) || "-"
            }
            header="Loan Amount"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              rowData?.payoutPercent?.toFixed(2)
            }
            header="Payout(%)"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.payAmount) || "-"
            }
            header="Pay Amount"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.gstAmount) || "-"
            }
            header="GST (18%)"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.bills) || "-"
            }
            header="Bills"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.tdsAmount) || "-"
            }
            header="TDS (5%)"
          />

          <Column
            body={(rowData: IPayOutsDetailList) =>
              formatCurrencyAmount(rowData?.netPayment) || "-"
            }
            header="Payment"
          />

          <Column body={statusBodyTemplate} header="Payout Status" />

          <Column body={remarksBodyTemplate} header="Remarks" />

          {create && <Column body={actionBody} header="Action" />}
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(sourcingPartnerPayOutsData?.payoutList || []) && (
        <PrimePaginator
          onPageChange={onPageChange}
          pageNumber={filterReq.pageNumber}
          pageSize={filterReq.pageSize}
          totalRecords={totalRecords}
        />
      )}

      <BackButton />

      <CustomModal
        status={status}
        paymentModal={paymentModal}
        setPaymentModal={setPaymentModal}
        applicationID={selectedApplicationID}
        fetchPayOutsDetailApi={fetchSourcingPartnerPayOutsDetailApi}
        setReason={setReason}
        reason={reason}
        selectedRowData={selectedRowData}
        setSelectedRowData={setSelectedRowData}
      />

      <ContractAgreementModal
        showContractAgreement={
          showContractAgreement &&
          shouldShowContractModal(contractEnforcementDate)
        }
        setShowContractAgreement={(value) => {
          if (!value) {
            setHasSkippedContractAgreement(true);
            setClickCounter((prev) => prev + 1);
          }
          setShowContractAgreement(value);
        }}
      />
    </div>
  );
};

export default SourcingPartnerPayoutsDetail;

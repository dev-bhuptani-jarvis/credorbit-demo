/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getPayOutsDetailsAPI } from "../../utils/axios/apiServices";
import {
  IPayOutsDetailData,
  IPayOutsDetailList,
  IPayOutsDetailParams,
  IPayOutsDetailResponse,
} from "../../interface/payOuts";
import { useParams } from "react-router-dom";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
  PAYMENT_REQUEST_STATUS,
  RouteParams,
} from "../../utils/constants/constant";
import { PaginateReqEntity } from "../../interface/pagination";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import {
  formatDate,
  handleDownloadCSVData,
  shouldShowContractModal,
  toastError,
} from "../../utils/functions/shared";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import CustomModal from "../../components/CustomModal";
import usePermission from "../../hooks/usePermission";
import BackButton from "../../components/BackButton";
import TableTitle from "../../components/TableTitle";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import { Tooltip } from "primereact/tooltip";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const PayoutsDetail = () => {
  const [payOutsData, setPayOutsData] = useState<IPayOutsDetailData>();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [status, setStatus] = useState<number>(0);

  const [paymentModal, setPaymentModal] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  const [selectedApplicationID, setSelectedApplicationID] =
    useState<string>("");

  const [reason, setReason] = useState<string>("");

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [selectedUserType, setSelectedUserType] = useState<number>(
    CLIENT_ROLE.SOURCING_PARTNER,
  );

  const [clickCounter, setClickCounter] = useState<number>(0);

  const [selectedRowData, setSelectedRowData] =
    useState<IPayOutsDetailList | null>(null);

  const { id } = useParams<RouteParams>();

  const { userType, isContractSigned, contractEnforcementDate } = useSelector(
    (state: RootState) => state.user.user,
  );

  const { create } = usePermission("PayOuts", ["create"])();

  const SourcingPartnerPayout = usePermission("SourcingPartnerPayout", [
    "create",
  ])();

  // Handle Calendar range selection
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

  // Render Calendar as filter in the DataTable
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

  // Fetch Payout Details
  const fetchPayOutsDetailApi = async (): Promise<void> => {
    if (!id) return;

    const startDate = dates?.[0];
    const endDate = dates?.[1];

    // Only fetch if both dates are selected
    if (dates && (!startDate || !endDate)) return;

    setLoading(true);

    const formattedFromDate = startDate
      ? formatDate(startDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = endDate
      ? formatDate(endDate, "YYYY-MM-DD")
      : undefined;

    const queryParams: IPayOutsDetailParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      payoutID: id,
      userType,
    };

    if (formattedFromDate && formattedToDate) {
      queryParams.fromDate = formattedFromDate;
      queryParams.toDate = formattedToDate;
    }

    const response: IPayOutsDetailResponse =
      await getPayOutsDetailsAPI(queryParams);

    if (!response) return;

    if (response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        email: response.data.email ? decryptVAPTData(response.data.email) : "",
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
      };

      setPayOutsData(decryptedData);
      setTotalRecords(response.data.totalCount);
      setCalendarVisible(false);
    } else {
      toastError(response.message);
    }

    setLoading(false);
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
              <img src="/assets/images/eye.svg" alt="eye-icon" loading="lazy" />
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

  const handleRequested = (
    rowData: IPayOutsDetailList,
    applicationID: string,
  ) => {
    setStatus(PAYMENT_REQUEST_STATUS.INCOMPLETE);
    setPaymentModal(true);
    setSelectedRowData(rowData);
    setSelectedApplicationID(applicationID);
  };

  const handleCompleted = (rowData: IPayOutsDetailList, applicationID: string) => {
    setStatus(PAYMENT_REQUEST_STATUS.COMPLETED);
    setPaymentModal(true);
    setSelectedRowData(rowData);
    setSelectedApplicationID(applicationID);
    setSelectedUserType(CLIENT_ROLE.CHANNEL_PARTNER);
  };

  const handleAddHSNNumber = (
    rowData: IPayOutsDetailList,
    applicationID: string,
  ) => {
    setStatus(PAYMENT_REQUEST_STATUS.HSN_NUMBER);
    setSelectedRowData(rowData);
    setPaymentModal(true);
    setSelectedApplicationID(applicationID);
  };

  const handleViewRejected = (
    rowData: IPayOutsDetailList,
    applicationID: string,
  ) => {
    setStatus(PAYMENT_REQUEST_STATUS.VIEW_REJECTED);
    setSelectedRowData(rowData);
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

  const cpActionBody = (rowData: IPayOutsDetailList) => {
    const showContractModalCheck = () =>
      !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
      !isContractSigned &&
      !hasSkippedContractAgreement &&
      shouldShowContractModal(contractEnforcementDate);

    const generateId = `cp-generate-${rowData.applicationId}`;
    const downloadId = `cp-download-${rowData.applicationId}`;
    const remarksId = `cp-remarks-${rowData.applicationId}`;

    return (
      <>
        <Tooltip target={`#${generateId}`} position="top" />
        <Tooltip target={`#${downloadId}`} position="top" />
        <Tooltip target={`#${remarksId}`} position="top" />

        {IsStringNullEmptyOrUndefined(rowData.invoiceUrl) ? (
          <Button
            id={generateId}
            className="trash-icon p-0 me-2"
            data-pr-tooltip="Generate Invoice"
            onClick={() => {
              if (showContractModalCheck()) {
                setShowContractAgreement(true);
              } else {
                handleAddHSNNumber(rowData, rowData.applicationId);
              }
            }}
          >
            <img src="/assets/images/receipt-text.svg" alt="Generate Invoice" />
          </Button>
        ) : (
          <>
            <Button
              id={downloadId}
              className="trash-icon p-0 me-2"
              data-pr-tooltip="Download Invoice"
              onClick={() => {
                if (showContractModalCheck()) {
                  setShowContractAgreement(true);
                } else {
                  handleInvoiceDownload(rowData.invoiceUrl);
                }
              }}
            >
              <img src="/assets/images/download.svg" alt="Download Invoice" />
            </Button>

            {rowData.remarks === null && (
              <Button
                id={remarksId}
                className="trash-icon p-0 me-2"
                data-pr-tooltip="Enter Remarks"
                onClick={() => {
                  if (showContractModalCheck()) {
                    setShowContractAgreement(true);
                  } else {
                    handleCompleted(rowData, rowData.applicationId);
                  }
                }}
              >
                <img
                  src="/assets/images/receipt-text.svg"
                  alt="Enter Remarks"
                />
              </Button>
            )}
          </>
        )}
      </>
    );
  };

  const actionBody = (rowData: IPayOutsDetailList) => {
    const requestId = `req-${rowData.applicationId}`;
    const rejectId = `reject-${rowData.applicationId}`;
    const generateId = `gen-${rowData.applicationId}`;
    const downloadId = `download-${rowData.applicationId}`;

    return (
      <>
        <Tooltip target={`#${requestId}`} position="top" />
        <Tooltip target={`#${rejectId}`} position="top" />
        <Tooltip target={`#${generateId}`} position="top" />
        <Tooltip target={`#${downloadId}`} position="top" />

        {IsStringNullEmptyOrUndefined(rowData?.remarks ?? "") ? (
          <>
            {/* Request Payout */}
            {rowData.requestStatus === PAYMENT_REQUEST_STATUS.PENDING &&
              userType === CLIENT_ROLE.SOURCING_PARTNER && (
                <Button
                  id={requestId}
                  className="trash-icon p-0 me-2"
                  data-pr-tooltip="Request Payout"
                  onClick={() => {
                    if (
                      !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                      !isContractSigned &&
                      !hasSkippedContractAgreement &&
                      shouldShowContractModal(contractEnforcementDate)
                    ) {
                      setShowContractAgreement(true);
                    } else {
                      handleRequested(rowData, rowData.applicationId);
                    }
                  }}
                >
                  <img
                    src="/assets/images/money-recive.svg"
                    alt="Request Payout"
                  />
                </Button>
              )}

            {/* Rejection Reason */}
            {rowData.requestStatus === PAYMENT_REQUEST_STATUS.REJECTED &&
              userType === CLIENT_ROLE.SOURCING_PARTNER && (
                <Button
                  id={rejectId}
                  className="trash-icon p-0 me-2"
                  data-pr-tooltip="See Rejection Reason"
                  onClick={() => {
                    setReason(rowData.reason || "");
                    handleViewRejected(rowData, rowData.applicationId);
                  }}
                >
                  <img
                    src="/assets/images/money-forbidden.svg"
                    alt="See Rejection Reason"
                  />
                </Button>
              )}

            {/* Generate Invoice */}
            {(rowData.requestStatus === PAYMENT_REQUEST_STATUS.PENDING ||
              rowData.requestStatus === PAYMENT_REQUEST_STATUS.INCOMPLETE) &&
              (userType === CLIENT_ROLE.CHANNEL_PARTNER ||
                userType === CLIENT_ROLE.USER_MANAGEMENT) && (
                <Button
                  id={generateId}
                  className="trash-icon p-0 me-2"
                  data-pr-tooltip="Generate Invoice"
                  onClick={() => {
                    if (
                      !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                      !isContractSigned &&
                      !hasSkippedContractAgreement &&
                      shouldShowContractModal(contractEnforcementDate)
                    ) {
                      setShowContractAgreement(true);
                    } else {
                      handleAddHSNNumber(rowData, rowData.applicationId);
                    }
                  }}
                >
                  <img
                    src="/assets/images/receipt-text.svg"
                    alt="Generate Invoice"
                  />
                </Button>
              )}

            {/* Download Invoice */}
            {rowData.invoiceUrl && (
              <Button
                id={downloadId}
                className="trash-icon p-0 me-2"
                style={{ width: "25px" }}
                data-pr-tooltip="Download Payout Invoice"
                onClick={() => window.open(rowData.invoiceUrl, "_blank")}
              >
                <img src="/assets/images/download.svg" alt="Payout Invoice" />
              </Button>
            )}
          </>
        ) : (
          <>
            {rowData.invoiceUrl && (
              <Button
                id={downloadId}
                className="trash-icon p-0 me-2"
                style={{ width: "25px" }}
                data-pr-tooltip="Download Payout Invoice"
                onClick={() => window.open(rowData.invoiceUrl, "_blank")}
              >
                <img src="/assets/images/download.svg" alt="Payout Invoice" />
              </Button>
            )}
          </>
        )}
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

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

    const queryParams: IPayOutsDetailParams = {
      page: 0,
      pageSize: 0,
      payoutID: id,
      userType,
    };

    if (formattedFromDate && formattedToDate) {
      queryParams.fromDate = formattedFromDate;
      queryParams.toDate = formattedToDate;
    }

    const response: IPayOutsDetailResponse =
      await getPayOutsDetailsAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      handleDownloadCSVData(
        response.data.payoutList,
        headersMap,
        `Payouts - ${payOutsData?.userCode}`,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPayOutsDetailApi();
  }, [filterReq, dates]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper d-flex justify-content-between">
            <TableTitle title="Payouts" />
            <Button className="btn btn-orange" onClick={fetchAllPayoutList}>
              <i className="bi bi-download me-2" /> Download Payouts
            </Button>
          </div>
        </div>
      </div>

      {userType === CLIENT_ROLE.SOURCING_PARTNER && (
        <div className="row">
          <div className="col-12 mt-4 mb-4">
            <div className="borderBoxHldr p-24">
              <div className="row">
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Sourcing Partner Code</b>
                  <p className="text-break">{payOutsData?.userCode}</p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Sourcing Partner Name</b>
                  <p className="text-break">{payOutsData?.userName}</p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Mobile Number</b>
                  <p className="text-break">
                    {formatMobileNumber(payOutsData?.mobileNumber)}
                  </p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Email</b>
                  <p className="text-break">{payOutsData?.email}</p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>PAN Number</b>
                  <p className="text-break">{payOutsData?.panNumber}</p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Payout Sharing Rate(%)</b>
                  <p className="text-break">
                    {payOutsData?.payOutPercent.toFixed(2)}
                  </p>
                </div>

                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Loans Completed</b>
                  <p className="text-break">{payOutsData?.loansCompleted}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <DataTable
          className="tableMain"
          filterDisplay="row"
          key={clickCounter}
          value={payOutsData?.payoutList}
          emptyMessage="No Data found"
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

          {(create || SourcingPartnerPayout.create) && (
            <Column
              body={
                userType === CLIENT_ROLE.CHANNEL_PARTNER
                  ? cpActionBody
                  : actionBody
              }
              header="Action"
            />
          )}
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(payOutsData?.payoutList || []) && (
        <PrimePaginator
          onPageChange={onPageChange}
          pageNumber={filterReq.pageNumber}
          pageSize={filterReq.pageSize}
          totalRecords={totalRecords}
        />
      )}

      <div className="mt-4">
        <BackButton />
      </div>

      <CustomModal
        status={status}
        paymentModal={paymentModal}
        setPaymentModal={setPaymentModal}
        applicationID={selectedApplicationID}
        fetchPayOutsDetailApi={fetchPayOutsDetailApi}
        setReason={setReason}
        reason={reason}
        selectedUserType={selectedUserType}
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

export default PayoutsDetail;

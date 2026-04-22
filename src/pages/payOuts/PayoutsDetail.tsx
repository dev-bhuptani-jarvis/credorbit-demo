/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { getPayOutsDetailsAPI } from "../../utils/axios/apiServices";
import {
  IPayOutsDetailData,
  IPayOutsDetailList,
  IPayOutsDetailParams,
  IPayOutsDetailResponse,
} from "../../interface/payOuts";
import { useParams } from "react-router-dom";
import { Calendar } from "primereact/calendar";
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
import { setReportMessage } from "../../store/reducer/reportMessageSlice";
import { useDispatch } from "react-redux";

const PayoutsDetail = () => {
  const dateFilterPopupRef = useRef<HTMLDivElement>(null);

  const [payOutsData, setPayOutsData] = useState<IPayOutsDetailData>();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [status, setStatus] = useState<number>(0);

  const [paymentModal, setPaymentModal] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [fromDate, setFromDate] = useState<Date | null>(null);

  const [toDate, setToDate] = useState<Date | null>(null);

  const [draftFromDate, setDraftFromDate] = useState<Date | null>(null);

  const [draftToDate, setDraftToDate] = useState<Date | null>(null);

  const [showDateFilterPopup, setShowDateFilterPopup] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

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

  const dispatch = useDispatch();

  const updateDateFilters = (
    nextFromDate: Date | null,
    nextToDate: Date | null,
  ) => {
    setFromDate(nextFromDate);
    setToDate(nextToDate);
    setFilterReq((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  };

  const openDateFilterDialog = () => {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setShowDateFilterPopup((prev) => !prev);
  };

  const closeDateFilterDialog = () => {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setShowDateFilterPopup(false);
  };

  const applyDateFilter = () => {
    updateDateFilters(draftFromDate, draftToDate);
    setShowDateFilterPopup(false);
  };

  const clearDraftDateFilter = () => {
    setDraftFromDate(null);
    setDraftToDate(null);
    updateDateFilters(null, null);
    setShowDateFilterPopup(false);
  };

  const isDateFilterSelectionValid =
    !!draftFromDate && !!draftToDate;

  useEffect(() => {
    if (!showDateFilterPopup) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dateFilterPopupRef.current &&
        !dateFilterPopupRef.current.contains(event.target as Node)
      ) {
        closeDateFilterDialog();
      }
    };

    const handleViewportChange = () => {
      setShowDateFilterPopup(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [showDateFilterPopup, fromDate, toDate]);

  const renderMonthDropdown = (): JSX.Element => (
    <div className="payout-date-filter-wrapper" ref={dateFilterPopupRef}>
      <Button
        type="button"
        icon="pi pi-sliders-h"
        label="Filter"
        className="payout-date-filter-trigger"
        onClick={openDateFilterDialog}
      />

      {showDateFilterPopup && (
        <div className="payout-date-filter-overlay">
          <div className="payout-date-filter-card p-4">
            <h5 className="payout-date-filter-title mb-4">Date Range</h5>

            <div className="d-flex align-items-end gap-3 flex-wrap">
              <div style={{ minWidth: "180px", flex: 1 }}>
                <label
                  htmlFor="disbursementFromDate"
                  className="payout-date-filter-label d-block mb-2"
                >
                  From
                </label>
                <Calendar
                  inputId="disbursementFromDate"
                  value={draftFromDate}
                  placeholder="From Date"
                  readOnlyInput
                  maxDate={draftToDate || new Date()}
                  showButtonBar
                  className="payout-date-filter-calendar"
                  style={{ width: "100%" }}
                  onChange={(e) => {
                    const selectedFromDate = e.value as Date | null;
                    const nextToDate =
                      selectedFromDate &&
                        draftToDate &&
                        draftToDate < selectedFromDate
                        ? null
                        : draftToDate;

                    setDraftFromDate(selectedFromDate);
                    setDraftToDate(nextToDate);
                  }}
                />
              </div>

              <div style={{ minWidth: "180px", flex: 1 }}>
                <label
                  htmlFor="disbursementToDate"
                  className="payout-date-filter-label d-block mb-2"
                >
                  To
                </label>
                <Calendar
                  inputId="disbursementToDate"
                  value={draftToDate}
                  placeholder="To Date"
                  readOnlyInput
                  minDate={draftFromDate || undefined}
                  maxDate={new Date()}
                  showButtonBar
                  className="payout-date-filter-calendar"
                  style={{ width: "100%" }}
                  disabled={!draftFromDate}
                  onChange={(e) =>
                    setDraftToDate(e.value as Date | null)
                  }
                />
              </div>
            </div>

            <div className="payout-date-filter-actions d-flex justify-content-between align-items-center mt-4 pt-3 gap-2">
              <Button
                type="button"
                label="Clear"
                className="btn btn-orange-line text-center"
                onClick={clearDraftDateFilter}
              />

              <Button
                type="button"
                label="Done"
                className="payout-date-filter-done"
                onClick={applyDateFilter}
                disabled={!isDateFilterSelectionValid}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Fetch Payout Details
  const fetchPayOutsDetailApi = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const formattedFromDate = fromDate
      ? formatDate(fromDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = toDate
      ? formatDate(toDate, "YYYY-MM-DD")
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

    if (userType === CLIENT_ROLE.CHANNEL_PARTNER || userType === CLIENT_ROLE.USER_MANAGEMENT) {
      window.open("/assets/images/cpPayout.pdf", "_blank")
    } else {
      window.open("/assets/images/spPayout.pdf", "_blank")
    }
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
                onClick={() => {
                  if (userType === CLIENT_ROLE.CHANNEL_PARTNER || userType === CLIENT_ROLE.USER_MANAGEMENT) {
                    window.open("/assets/images/cpPayout.pdf", "_blank")
                  } else {
                    window.open("/assets/images/spPayout.pdf", "_blank")
                  }
                }}
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
                onClick={() => {
                  if (userType === CLIENT_ROLE.CHANNEL_PARTNER || userType === CLIENT_ROLE.USER_MANAGEMENT) {
                    window.open("/assets/images/cpPayout.pdf", "_blank")
                  } else {
                    window.open("/assets/images/spPayout.pdf", "_blank")
                  }
                }}
              >
                <img src="/assets/images/download.svg" alt="Payout Invoice" />
              </Button>
            )}
          </>
        )
        }
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

    setLoading(true);

    const formattedFromDate = fromDate
      ? formatDate(fromDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = toDate
      ? formatDate(toDate, "YYYY-MM-DD")
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
  }, [filterReq, fromDate, toDate]);

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


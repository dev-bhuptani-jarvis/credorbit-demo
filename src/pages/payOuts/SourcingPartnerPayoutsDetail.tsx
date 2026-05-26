import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import PrimePaginator from "../../components/PrimePaginator";
import CustomModal from "../../components/CustomModal";
import { useEffect, useRef, useState } from "react";
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
import { setReportMessage } from "../../store/reducer/reportMessageSlice";
import { useDispatch } from "react-redux";

const SourcingPartnerPayoutsDetail = () => {
  const dateFilterPopupRef = useRef<HTMLDivElement>(null);

  const [sourcingPartnerPayOutsData, setSourcingPartnerPayOutsData] =
    useState<ISourcingPartnerPayOutDetailResponseData>();

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [fromDate, setFromDate] = useState<Date | null>(null);

  const [toDate, setToDate] = useState<Date | null>(null);

  const [draftFromDate, setDraftFromDate] = useState<Date | null>(null);

  const [draftToDate, setDraftToDate] = useState<Date | null>(null);

  const [showDateFilterPopup, setShowDateFilterPopup] = useState<boolean>(false);

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

  const [selectedRowData, setSelectedRowData] =
    useState<IPayOutsDetailList | null>(null);

  const { id } = useParams<RouteParams>();

  const { create } = usePermission("SourcingPartnerPayout", ["create"])();

  const dispatch = useDispatch();

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

  const isDateFilterSelectionValid = !!draftFromDate && !!draftToDate;

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

    setLoading(true);

    const formattedFromDate = fromDate
      ? formatDate(fromDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = toDate
      ? formatDate(toDate, "YYYY-MM-DD")
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
      setSourcingPartnerPayOutsData(response.data);
      setTotalRecords(response.data.totalCount);
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

  const handleCompleted = (rowData: IPayOutsDetailList, applicationID: string) => {
    setStatus(PAYMENT_REQUEST_STATUS.COMPLETED);
    setPaymentModal(true);
    setSelectedRowData(rowData);
    setSelectedApplicationID(applicationID);
  };

  const handleInvoiceDownload = (invoiceUrl: string | null) => {
    if (!invoiceUrl) {
      toastError("Invoice URL is not available");
      return;
    }

    window.open("/assets/images/spPayout.pdf", "_blank");
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
                        handleCompleted(rowData, rowData.applicationId);
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

    const formattedFromDate = fromDate
      ? formatDate(fromDate, "YYYY-MM-DD")
      : undefined;
    const formattedToDate = toDate
      ? formatDate(toDate, "YYYY-MM-DD")
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
  }, [filterReq, fromDate, toDate]);

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



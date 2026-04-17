import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Loader from "../../components/Loader";
import { useEffect, useRef, useState } from "react";
import TableTitle from "../../components/TableTitle";
import { RadioButton } from "primereact/radiobutton";
import { Dialog } from "primereact/dialog";
import {
  createLinkAPI,
  fetchSubsciptionHistoryAPI,
  fetchSubscriptionUsageAPI,
  fetchSubscriptionPlansAPI,
  generateSubscriptionInvoiceAPI,
  fetchAllPaymentsAPI,
  getPaymentFetchUserTabWiseAPI,
  addCreditsAPI,
} from "../../utils/axios/apiServices";
import {
  IAddCreditsBody,
  IFetchAllPaymentsResponse,
  IFetchAllPaymentsResponseRecord,
  IPaginateReqEntityForFetchUserTabWise,
  IPaginateReqEntityForSubscription,
  ISubscriptionBody,
  ISubscriptionListingData,
  ISubscriptionListingResponse,
  ISubscriptionPlanListingData,
  ISubscriptionPlanListingResponse,
  ISubscriptionResponse,
  ISubscriptionResponseListingData,
  ISubscriptionUsageListingData,
  ISubscriptionUsageResponse,
  TabWiseUserRecordEntity,
} from "../../interface/subscription";
import {
  PaymentStatusType,
  SubscriptionPlanType,
} from "../../utils/constants/enum";
import {
  formatDate,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { TabPanel, TabView } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { NUMBER, NUMBER_ONLY_PATTERN } from "../../utils/constants/pattern";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { validationMessages } from "../../utils/constants/messages";
import {
  IGenerateSubscriptionInvoiceParams,
  IGenerateSubscriptionInvoiceResponse,
} from "../../interface/payOuts";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatCurrencyAmount,
  paymentStatusList,
} from "../../utils/constants/constant";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import SearchButton from "../../components/SearchButton";
import useDebouncedEffect from "../../hooks/useDebounce";
import { Dropdown, DropdownFilterEvent } from "primereact/dropdown";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { useLocation, useNavigate } from "react-router-dom";
import CreditNotAvailable from "../../components/CreditNotAvailable";
import { Tooltip } from "primereact/tooltip";
import { setReportMessage } from "../../store/reducer/reportMessageSlice";
import { useDispatch } from "react-redux";

const Subscription = () => {
  const [subscriptionHistory, setSubscriptionHistory] =
    useState<ISubscriptionListingData>({
      totalCredits: 0,
      subscriptionHistory: [],
    });

  const [subscriptionSpend, setSubscriptionSpend] = useState<
    ISubscriptionUsageListingData[]
  >([]);

  const [plans, setPlans] = useState<ISubscriptionPlanListingData[]>([]);

  const [allPayments, setAllPayments] = useState<
    IFetchAllPaymentsResponseRecord[]
  >([]);

  const [paymentStatusDialog, setPaymentStatusDialog] =
    useState<PaymentStatusType | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [customPlanDialog, setCustomPlanDialog] = useState<boolean>(false);

  const [customAmount, setCustomAmount] = useState<string>("10,000");

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState({
    customAmount: validationMessages.customAmountRequired,
  });

  const [searchText, setSearchText] = useState<string>("");

  const { userType } = useSelector((state: RootState) => state.user.user);

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
    status: "",
  });

  const filterReqSubscription = {
    page: 1,
    pageSize: 25,
    type: CLIENT_ROLE.CHANNEL_PARTNER,
  };

  const [addCreditDialog, setAddCreditDialog] = useState<boolean>(false);

  const [activeCreditTab, setActiveCreditTab] = useState<number>(0);

  const [selectedUser, setSelectedUser] =
    useState<TabWiseUserRecordEntity | null>(null);

  const [creditAmount, setCreditAmount] = useState<string>("");

  const [creditError, setCreditError] = useState<{
    selectedClient: string;
    creditAmount: string;
  }>({
    selectedClient: "",
    creditAmount: "",
  });

  const [loadingCredits, setLoadingCredits] = useState<boolean>(false);

  const [dropdownSearch, setDropdownSearch] = useState<string>("");

  const dropdownPanelRef = useRef<HTMLDivElement | null>(null);

  const [dropdownUsers, setDropdownUsers] = useState<TabWiseUserRecordEntity[]>(
    [],
  );

  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);

  const [dropdownHasMore, setDropdownHasMore] = useState<boolean>(true);

  const [showCreditPopup, setShowCreditPopup] = useState(false);

  const lastFetchedPageRef = useRef(0);

  const fetchingRef = useRef(false);

  const noMoreDataRef = useRef(false);

  const dropdownRef = useRef<any>(null);

  const currentSearchRef = useRef<string>("");

  const location = useLocation();

  const navigate = useNavigate();

  const hasHandledRef = useRef(false);

  const { state } = useLocation();

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const actionBody = (
    rowData: ISubscriptionResponseListingData,
  ): JSX.Element => {
    return (
      <span
        className="StatusLabel"
        style={{
          backgroundColor: rowData.colorCode,
        }}
      >
        {rowData.paymentStatus}
      </span>
    );
  };

  const dispatch = useDispatch();

  const handleCreditTabChange = (e: { index: number }) => {
    setActiveCreditTab(e.index);

    setDropdownUsers([]);
    setDropdownHasMore(true);

    resetAddCreditForm();

    lastFetchedPageRef.current = 0;
    fetchingRef.current = false;
    noMoreDataRef.current = false;
    currentSearchRef.current = "";
  };

  const handleRequestSubscriptionInvoice = async (
    rowData: ISubscriptionResponseListingData,
  ) => {
    const body: IGenerateSubscriptionInvoiceParams = {
      paymentLinkID: rowData.paymentLinkID,
      payAmount: rowData.amount,
      gstAmount: rowData.gstAmount,
      netPayment: rowData.amount,
      amountWithoutGST: rowData.amountWithoutGst,
      planName: rowData.planName,
      credits: rowData.creditPoints ? rowData.creditPoints.toString() : "0",
    };

    setLoading(true);

    const response: IGenerateSubscriptionInvoiceResponse =
      await generateSubscriptionInvoiceAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      window.open("/assets/images/gstReport.pdf", "_blank");
      fetchSubscriptionHistory();
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const invoiceBody = (
    rowData: ISubscriptionResponseListingData,
  ): JSX.Element => {
    const downloadId = `sub-download-${rowData.paymentLinkID}`;
    const requestId = `sub-request-${rowData.paymentLinkID}`;

    return (
      <>
        <Tooltip target={`#${downloadId}`} position="top" />
        <Tooltip target={`#${requestId}`} position="top" />

        {rowData.paymentStatus === "Paid" && (
          <>
            {rowData.subscriptionUrl ? (
              <Button
                id={downloadId}
                className="trash-icon p-0 me-2"
                style={{ width: "25px" }}
                data-pr-tooltip="Download Subscription Invoice"
                onClick={() =>
                  window.open("/assets/images/gstReport.pdf", "_blank")
                }
              >
                <img
                  src="/assets/images/download.svg"
                  alt="Subscription Invoice"
                />
              </Button>
            ) : (
              <Button
                id={requestId}
                className="trash-icon p-0 me-2"
                style={{ width: "25px" }}
                data-pr-tooltip="Request Subscription Invoice"
                onClick={() => handleRequestSubscriptionInvoice(rowData)}
              >
                <img
                  src="/assets/images/invoice-generation.svg"
                  alt="Subscription Invoice"
                />
              </Button>
            )}
          </>
        )
        }
      </>
    );
  };

  const createRazorPayLink = async (): Promise<void> => {
    setIsFormSubmitted(true);
    setShowDialog(false);

    if (selectedPlan?.name === SubscriptionPlanType.CUSTOM) {
      const errors: typeof formErrors = {
        customAmount: "",
      };

      const rawAmount = Number(customAmount.replace(NUMBER, ""));

      if (!customAmount || rawAmount <= 10000) {
        errors.customAmount = "Amount must be more than ₹10,000";
      } else if (rawAmount % 1000 !== 0) {
        errors.customAmount = "Amount must be in multiples of ₹1000";
      }

      setFormErrors(errors);

      if (!IsStringNullEmptyOrUndefined(errors.customAmount)) return;
    }

    const amountToSend =
      selectedPlan?.name === SubscriptionPlanType.CUSTOM
        ? Math.floor(Number(customAmount.replace(NUMBER, "")) / 1000) * 1000
        : selectedPlan?.price;

    if (!amountToSend || amountToSend <= 0) return;

    const responseBody: ISubscriptionBody = {
      subscriptionPlanID: selectedPlan.planID,
      amount:
        selectedPlan?.name === SubscriptionPlanType.CUSTOM
          ? String(amountToSend)
          : undefined,
    };

    setLoading(true);

    const response: ISubscriptionResponse = await createLinkAPI(responseBody);

    if (!response) return;

    if (response.statusCode === 200) {
      window.location.href = response.data.shortUrl;
    } else {
      toastError(response.message);
    }

    setTimeout(() => {
      setLoading(false);
      setCustomPlanDialog(false);
      setSelectedPlan(null);
      setCustomAmount("10,000");
      setIsFormSubmitted(false);
    }, 1000);
  };

  const dialogFooter = (
    <div className="subscription-plan-footer">
      <Button
        label="Cancel"
        className="btn btn-orange-line text-center"
        onClick={() => {
          setShowDialog(false);
          setSelectedPlan(null);
        }}
      />
      <Button
        label="Confirm"
        className="btn btn-orange text-center"
        onClick={createRazorPayLink}
        disabled={!selectedPlan}
      />
    </div>
  );

  const dialogCustomFooter = (
    <div className="d-flex justify-content-end mt-4">
      <Button
        label="Cancel"
        className="btn btn-orange-line me-2"
        onClick={() => {
          setCustomPlanDialog(false);
          setSelectedPlan(null);
          setCustomAmount("10,000");
          setShowDialog(true);
        }}
      />
      <Button
        label="Confirm"
        className="btn btn-orange"
        onClick={createRazorPayLink}
        disabled={!selectedPlan}
      />
    </div>
  );

  const dialogPaymentFooter = (
    <div className="d-flex justify-content-end mt-4">
      <Button
        label="Close"
        className="btn btn-orange-line"
        onClick={() => {
          setPaymentStatusDialog(null);

          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }}
      />
    </div>
  );

  const fetchSubscriptionHistory = async (): Promise<void> => {
    setLoading(true);

    const response: ISubscriptionListingResponse =
      await fetchSubsciptionHistoryAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setSubscriptionHistory(response.data);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchSubscriptionSpend = async (): Promise<void> => {
    const response: ISubscriptionUsageResponse =
      await fetchSubscriptionUsageAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setSubscriptionSpend(response.data.subscriptionUsage);
    } else {
      toastError(response.message);
    }
  };

  const fetchSubscriptionPlans = async (): Promise<void> => {
    const response: ISubscriptionPlanListingResponse =
      await fetchSubscriptionPlansAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setPlans(response.data);
    } else {
      toastError(response.message);
    }
  };

  const handleSelectPlan = (plan: ISubscriptionPlanListingData) => {
    if (plan.name === SubscriptionPlanType.CUSTOM) {
      setCustomPlanDialog(true);
      setShowDialog(false);
    }
    setSelectedPlan(plan);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value.replace(NUMBER, ""));

    if (value > 400000) value = 400000;

    const formattedValue = value
      ? new Intl.NumberFormat("en-IN").format(Number(value))
      : "";

    setIsFormSubmitted(false);
    setFormErrors({ customAmount: "" });
    setCustomAmount(formattedValue);
  };

  const fetchAllPayments = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IPaginateReqEntityForSubscription = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.search = filterReq.searchText?.trim();
    }

    if (filterReq.status) {
      queryParams.status = filterReq.status;
    }

    const response: IFetchAllPaymentsResponse =
      await fetchAllPaymentsAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setAllPayments(response.data.records);
      setTotalRecords(response.data.totalRecords);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const resetAddCreditForm = () => {
    setSelectedUser(null);
    setCreditAmount("");
    setCreditError({
      selectedClient: "",
      creditAmount: "",
    });
    setDropdownUsers([]);
    setDropdownSearch("");
    setSearchText("");
    setDropdownHasMore(true);
    setDropdownLoading(false);
    lastFetchedPageRef.current = 0;
    fetchingRef.current = false;
    noMoreDataRef.current = false;
    currentSearchRef.current = "";
  };

  const handleAddCredits = async () => {
    if (!selectedUser) {
      setCreditError({
        selectedClient: validationMessages.selectedUserInvalid,
        creditAmount: "",
      });
      return;
    }

    const amount = Number(creditAmount.replace(/,/g, ""));

    if (!amount || amount <= 0) {
      setCreditError({
        selectedClient: "",
        creditAmount: validationMessages.creditAmountInvalid,
      });
      return;
    }

    setLoadingCredits(true);

    const body: IAddCreditsBody = {
      creditbeneficiaryUserID: selectedUser.id,
      credit: amount,
    };

    const response = await addCreditsAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      toastSuccess(response?.message);
      resetAddCreditForm();
      setAddCreditDialog(false);
      setActiveCreditTab(0);
    } else {
      toastError(response?.message);
    }

    setLoadingCredits(false);
  };

  const fetchDropdownUsers = async (page: number, search: string) => {
    if (fetchingRef.current || noMoreDataRef.current) return;

    fetchingRef.current = true;
    setDropdownLoading(true);

    try {
      const body: IPaginateReqEntityForFetchUserTabWise = {
        page,
        pageSize: filterReqSubscription.pageSize,
        type:
          activeCreditTab === 0
            ? CLIENT_ROLE.CHANNEL_PARTNER
            : CLIENT_ROLE.CUSTOMER,
      };

      if (!IsStringNullEmptyOrUndefined(search?.trim())) {
        body.search = search.trim();
      }

      const response = await getPaymentFetchUserTabWiseAPI(body);

      if (!response) return;

      if (response?.statusCode === 200) {
        const records = response.data.records || [];

        if (records.length === 0) {
          noMoreDataRef.current = true;
          setDropdownHasMore(false);
          return;
        }

        const formattedRecords = records.map((item: any) => ({
          ...item,
          fullName: `${item.fullName} (${item.code})`,
        }));

        setDropdownUsers((prev) => [...prev, ...formattedRecords]);
        lastFetchedPageRef.current = page;

        if (records.length < filterReqSubscription.pageSize) {
          noMoreDataRef.current = true;
          setDropdownHasMore(false);
        }
      }
    } finally {
      fetchingRef.current = false;
      setDropdownLoading(false);
    }
  };

  const handleDropdownSearch = (e: DropdownFilterEvent) => {
    setDropdownSearch(e.filter || "");
  };

  const handleDropdownScroll = (e: Event) => {
    if (fetchingRef.current || noMoreDataRef.current) return;

    const target = e.target as HTMLDivElement;

    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10;

    if (isAtBottom) {
      fetchDropdownUsers(
        lastFetchedPageRef.current + 1,
        currentSearchRef.current,
      );
    }
  };

  const handleDropdownShow = () => {
    setTimeout(() => {
      const panel = document.querySelector(
        ".dropdown-scroll-panel .p-dropdown-items-wrapper",
      ) as HTMLDivElement | null;

      if (panel) {
        dropdownPanelRef.current = panel;
        panel.addEventListener("scroll", handleDropdownScroll);
      }
    }, 0);
  };

  const handleDropdownHide = () => {
    if (dropdownPanelRef.current) {
      dropdownPanelRef.current.removeEventListener(
        "scroll",
        handleDropdownScroll,
      );
      dropdownPanelRef.current = null;
    }
  };

  const handleCreditAmountChange = (value: string) => {
    const rawValue = value.toString().replace(NUMBER, "");

    const formattedValue = rawValue
      ? new Intl.NumberFormat("en-IN").format(Number(rawValue))
      : "";

    setCreditAmount(formattedValue);

    setCreditError({
      selectedClient: "",
      creditAmount: "",
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus: string | null = searchParams.get(
      "razorpay_payment_link_status",
    );

    if (paymentStatus) {
      if (paymentStatus === PaymentStatusType.PAID) {
        setPaymentStatusDialog(PaymentStatusType.PAID);
      } else if (
        paymentStatus === PaymentStatusType.CANCELLED ||
        paymentStatus === PaymentStatusType.FAILED
      ) {
        setPaymentStatusDialog(PaymentStatusType.CANCELLED);
      } else {
        setPaymentStatusDialog(PaymentStatusType.FAILED);
      }
    }
  }, []);

  useEffect(() => {
    if (userType === CLIENT_ROLE.SUPER_ADMIN) fetchAllPayments();
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    filterReq.searchText,
    filterReq.status,
  ]);

  useEffect(() => {
    if (userType !== CLIENT_ROLE.SUPER_ADMIN) {
      fetchSubscriptionPlans();
      fetchSubscriptionHistory();
      fetchSubscriptionSpend();
    }
  }, []);

  useEffect(() => {
    if (state && !hasHandledRef.current) {
      hasHandledRef.current = true;

      // ✅ popup open
      setShowCreditPopup(true);

      // ✅ router state reset (but popup stays open)
      navigate(location.pathname, { replace: true });
    }
  }, [state, navigate, location.pathname]);

  useEffect(() => {
    if (!addCreditDialog) return;

    // full reset
    setDropdownUsers([]);
    setDropdownHasMore(true);

    lastFetchedPageRef.current = 0;
    noMoreDataRef.current = false;
    fetchingRef.current = false;
    currentSearchRef.current = "";

    fetchDropdownUsers(1, dropdownSearch?.trim() || "");
  }, [addCreditDialog, activeCreditTab]);

  useEffect(() => {
    const panel = document.querySelector(
      ".dropdown-scroll-panel .p-dropdown-items-wrapper",
    );

    if (panel) {
      panel.addEventListener("scroll", handleDropdownScroll as any);
    }

    return () => {
      if (panel) {
        panel.removeEventListener("scroll", handleDropdownScroll as any);
      }
    };
  }, [dropdownHasMore, dropdownLoading]);

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText],
  );

  const getDiscountPercentByPrice = (price: number): number => {
    const discountMap: Record<number, number> = {
      499: 0,
      1999: 10,
      4999: 15,
      9999: 25,
    };

    return discountMap[price] ?? 0;
  };

  useDebouncedEffect(
    () => {
      if (!addCreditDialog) return;

      // reset pagination & data on new search
      setDropdownUsers([]);
      setDropdownHasMore(true);

      lastFetchedPageRef.current = 0;
      noMoreDataRef.current = false;
      fetchingRef.current = false;

      currentSearchRef.current = dropdownSearch.trim();

      fetchDropdownUsers(1, dropdownSearch.trim());
    },
    debounceTimeInMilliseconds,
    [dropdownSearch, activeCreditTab, addCreditDialog],
  );

  const getRelatedPercent = (price: number): number => {
    if (!price || price <= 0) return 0;
    return price % 2 === 0 ? 25 : 20;
  };

  const getMRP = (price: number, percent: number): number => {
    if (!price) return 0;

    // ✅ 0% discount → same price show as line-through
    if (percent === 0) return price;

    const increased = price * (1 + percent / 100);
    const digits = Math.floor(Math.log10(increased));
    const roundTo = Math.pow(10, digits);

    return Math.ceil(increased / roundTo) * roundTo;
  };

  return (
    <>
      <div className="col-12">
        <div className="whiteBoxHldr p-24">
          <Loader isLoading={loading} />

          <div className="row">
            <div className="col-lg-12">
              <div className="col-12 mb-4 titleBtnWrapper">
                <TableTitle title="Subscription" />

                {userType === CLIENT_ROLE.SUPER_ADMIN && (
                  <>
                    <div className="BtnRightHldr d-flex">
                      <div style={{ width: "300px", marginRight: "10px" }}>
                        <SearchButton
                          searchText={searchText}
                          setSearchText={setSearchText}
                          placeholder="Search..."
                        />
                      </div>
                      <div className="form-group">
                        <Dropdown
                          style={{ width: "300px" }}
                          value={filterReq.status}
                          placeholder="Select Payment Status"
                          onChange={(e) =>
                            setFilterReq({ ...filterReq, status: e.value })
                          }
                          options={paymentStatusList
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((status) => ({
                              label: status.name,
                              value: status.code,
                            }))}
                          optionLabel="label"
                          showClear={filterReq.status !== ""}
                        />
                      </div>
                      <button
                        className="btn btn-orange"
                        onClick={() => setAddCreditDialog(true)}
                      >
                        Add Credits
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {userType !== CLIENT_ROLE.SUPER_ADMIN && (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="custom-card card shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-white m-0">Total Credits</h5>

                    <button
                      className="btn btn-more-point"
                      onClick={() => setShowDialog(true)}
                    >
                      Get more Points
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="fw-semibold m-0 text-white">
                      <span className="text-dark font-large">
                        {formatCurrencyAmount(subscriptionHistory.totalCredits)}
                      </span>
                    </h4>
                  </div>
                </div>
              </div>

              <TabView className="mt-4 custom-tabview">
                <TabPanel header="Payment History">
                  <div className="table-responsive mt-4">
                    <DataTable
                      className="tableMain"
                      value={subscriptionHistory.subscriptionHistory}
                      emptyMessage="No subscription history found"
                    >
                      <Column
                        body={(rowData, options) => options.rowIndex + 1}
                        header="Sr. No."
                      />

                      <Column field="planName" header="Plan Name" />

                      <Column
                        body={(rowData: ISubscriptionResponseListingData) =>
                          formatCurrencyAmount(rowData.amount)
                        }
                        header="Amount"
                      />

                      <Column
                        body={(rowData: ISubscriptionResponseListingData) =>
                          formatCurrencyAmount(rowData.creditPoints)
                        }
                        header="Credit Points"
                      />

                      <Column
                        body={(rowData: ISubscriptionResponseListingData) =>
                          formatDate(rowData.dateTime)
                        }
                        header="Date"
                      />

                      <Column body={actionBody} header="Payment Info" />

                      <Column body={invoiceBody} header="Invoice" />
                    </DataTable>
                  </div>
                </TabPanel>

                <TabPanel header="Credits History">
                  <div className="table-responsive mt-4">
                    <DataTable
                      className="tableMain"
                      value={subscriptionSpend}
                      emptyMessage="No subscription spend records"
                    >
                      <Column
                        body={(rowData, options) => options.rowIndex + 1}
                        header="Sr. No."
                      />

                      <Column field="reason" header="Credit Source" />

                      <Column
                        body={(rowData: ISubscriptionUsageListingData) => (
                          <div className="d-flex align-items-center gap-2">
                            {rowData.isCreditsAdd === true ? (
                              <img
                                src="/assets/images/trending-up.svg"
                                alt="trending-up"
                              />
                            ) : rowData.isCreditsAdd === false ? (
                              <img
                                src="/assets/images/trending-down.svg"
                                alt="trending-down"
                              />
                            ) : null}

                            {rowData.isCreditsAdd === null ? (
                              <span>
                                <s>{rowData.credits}</s> 0
                              </span>
                            ) : (
                              <span>{rowData.credits}</span>
                            )}
                          </div>
                        )}
                        header="Credit Points"
                      />

                      <Column
                        body={(rowData: ISubscriptionUsageListingData) =>
                          formatDate(rowData.createdAt)
                        }
                        header="Date"
                      />
                    </DataTable>
                  </div>
                </TabPanel>
              </TabView>
            </>
          )}

          {userType === CLIENT_ROLE.SUPER_ADMIN && (
            <>
              <div className="table-responsive mb-4">
                <DataTable
                  className="tableMain"
                  value={allPayments}
                  emptyMessage="No Report Found"
                >
                  <Column field="userName" header="Name" />

                  <Column
                    body={(rowData: IFetchAllPaymentsResponseRecord) =>
                      rowData.userType === CLIENT_ROLE.SUPER_ADMIN
                        ? "Super Admin"
                        : rowData.userType === CLIENT_ROLE.CHANNEL_PARTNER
                          ? "Channel Partner"
                          : rowData.userType === CLIENT_ROLE.USER_MANAGEMENT
                            ? "User Management"
                            : rowData.userType === CLIENT_ROLE.SOURCING_PARTNER
                              ? "Sourcing Partner"
                              : rowData.userType === CLIENT_ROLE.CUSTOMER
                                ? "Client"
                                : ""
                    }
                    header="Type"
                  />

                  <Column
                    body={(rowData: IFetchAllPaymentsResponseRecord) =>
                      `₹ ${rowData.amount}`
                    }
                    header="Amount"
                  />

                  <Column field="creditPoints" header="Credit Points" />

                  <Column
                    body={(rowData: IFetchAllPaymentsResponseRecord) =>
                      rowData.dateTime ? formatDate(rowData.dateTime) : "-"
                    }
                    header="Date"
                  />

                  <Column body={actionBody} header="Payment Status" />
                </DataTable>
              </div>

              <PrimePaginator
                onPageChange={onPageChange}
                pageNumber={filterReq.pageNumber}
                pageSize={filterReq.pageSize}
                totalRecords={totalRecords}
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        header="Choose Your Plan"
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        draggable={false}
        resizable={false}
        className="modalWrapper subscription-plan-dialog"
        style={{ width: "min(920px, 96vw)" }}
        footer={dialogFooter}
        blockScroll
      >
        <div className="plan-modal-body">
          <div className="plan-dialog-intro">
            <span className="plan-dialog-kicker">
              Smart pricing for every stage
            </span>
            <h5>Select the plan that fits your usage best</h5>
            <p>
              Compare credits, pricing, and savings, then continue with the plan
              you want to activate.
            </p>
          </div>

          <div className="plan-scroll-area">
            {plans.map((plan) => {
              const discountPercent = getDiscountPercentByPrice(plan.price);
              const mrp = getMRP(plan.price, discountPercent);
              const isSelected = selectedPlan?.planID === plan.planID;

              return (
                <div
                  key={plan.planID}
                  className={`plan-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="plan-card-main">
                    <div className="plan-card-header">
                      <div>
                        <h6>{plan.name}</h6>
                        <p className="plan-card-subtitle">
                          Pick this plan to unlock credits instantly.
                        </p>
                      </div>

                      {plan.credits > 0 && (
                        <span className="plan-credits-badge">
                          {formatCurrencyAmount(plan.credits)} credits
                        </span>
                      )}
                    </div>

                    {plan.price > 0 && (
                      <div className="plan-price-row">
                        <div className="price-block">
                          {discountPercent > 0 && (
                            <div className="strike-price">
                              {formatCurrencyAmount(mrp)}
                            </div>
                          )}

                          <div className="final-price">
                            {formatCurrencyAmount(plan.price)}
                          </div>
                        </div>

                        {discountPercent > 0 && (
                          <span className="discount-pill">
                            Save {discountPercent}%
                          </span>
                        )}
                      </div>
                    )}

                    {isSelected && (
                      <div className="plan-selected-state">Selected plan</div>
                    )}
                  </div>

                  <div
                    className="plan-card-selector"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <RadioButton
                      inputId={`plan-${plan.planID}`}
                      name="subscription-plan"
                      checked={isSelected}
                      onChange={() => handleSelectPlan(plan)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={paymentStatusDialog === PaymentStatusType.PAID}
        onHide={() => setPaymentStatusDialog(null)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={dialogPaymentFooter}
        style={{ width: "650px" }}
        blockScroll
      >
        <div className="text-center py-4">
          <img
            src="/assets/images/tick-circle.svg"
            alt="tick-circle"
            loading="lazy"
            style={{
              width: "80px",
              height: "80px",
            }}
          />

          <h4 className="mb-0 mt-3">Thank you! Your payment was successful.</h4>
        </div>
      </Dialog>

      <Dialog
        visible={
          paymentStatusDialog === PaymentStatusType.CANCELLED ||
          paymentStatusDialog === PaymentStatusType.FAILED
        }
        onHide={() => setPaymentStatusDialog(null)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        footer={dialogPaymentFooter}
        style={{ width: "650px" }}
        blockScroll
      >
        <div className="text-center py-4">
          <img
            src="/assets/images/cancel-circle.svg"
            alt="cancel-circle"
            loading="lazy"
            style={{
              width: "80px",
              height: "80px",
            }}
          />

          <h4 className="mb-0 mt-3">
            Oops! Something went wrong with the payment.
          </h4>
        </div>
      </Dialog>

      <Dialog
        visible={customPlanDialog}
        onHide={() => setCustomPlanDialog(false)}
        className="modalWrapper responsive-dialog pt-0"
        draggable={false}
        resizable={false}
        footer={dialogCustomFooter}
        blockScroll
      >
        <div className="d-flex flex-column gap-3 subscription-custom-dialog">
          <div className="form-group">
            <label
              htmlFor="custom-amount"
              className="form-label fw-semibold font-15"
            >
              Enter Amount (in ₹)
            </label>

            <div className="form-group search">
              <i className="bi bi-currency-rupee" />
              <InputText
                id="custom-amount"
                value={customAmount}
                className="form-control"
                placeholder="Enter the approx. value"
                onChange={handleCustomAmountChange}
                onKeyPress={(e) =>
                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createRazorPayLink();
                  }
                }}
              // onPaste={(e) => e.preventDefault()}
              // onCopy={(e) => e.preventDefault()}
              // onCut={(e) => e.preventDefault()}
              />
            </div>
            {isFormSubmitted && formErrors.customAmount && (
              <small className="error">{formErrors.customAmount}</small>
            )}
          </div>
          <small className="text-muted">
            Note: Please enter the amount in a slab of 1,000 and minimum amount
            is ₹10,000
          </small>
        </div>
      </Dialog>

      <Dialog
        header="Add Credits"
        visible={addCreditDialog}
        onHide={() => {
          setAddCreditDialog(false);
          resetAddCreditForm();
          setActiveCreditTab(0);
        }}
        modal
        blockScroll
        draggable={false}
        resizable={false}
        className="modalWrapper responsive-dialog"
        style={{ width: "900px" }}
      >
        <div className="d-flex flex-column gap-4">
          <TabView
            activeIndex={activeCreditTab}
            onTabChange={handleCreditTabChange}
            className="custom-tabview"
          >
            <TabPanel header="Channel Partner">
              <div className="form-group w-100 txt-black fw-semibold mt-4">
                <label
                  className="form-label small font-15"
                  htmlFor="channelPartner"
                >
                  Select Channel Partner
                </label>

                <Dropdown
                  ref={dropdownRef}
                  value={selectedUser}
                  options={dropdownUsers}
                  optionLabel="fullName"
                  placeholder="Select Channel Partner"
                  filter
                  className="w-100"
                  onFilter={handleDropdownSearch}
                  onChange={(e) => setSelectedUser(e.value)}
                  loading={dropdownLoading}
                  panelClassName="dropdown-scroll-panel w-25"
                  onShow={handleDropdownShow}
                  onHide={handleDropdownHide}
                />
                {creditError.selectedClient && (
                  <small className="error">{creditError.selectedClient}</small>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Borrower">
              <div className="form-group w-100 txt-black fw-semibold mt-4">
                <label
                  className="form-label small font-15"
                  htmlFor="defaultCpClient"
                >
                  Select Borrower
                </label>

                <Dropdown
                  ref={dropdownRef}
                  value={selectedUser}
                  options={dropdownUsers}
                  optionLabel="fullName"
                  placeholder="Select Borrower"
                  filter
                  className="w-100"
                  onFilter={handleDropdownSearch}
                  onChange={(e) => setSelectedUser(e.value)}
                  loading={dropdownLoading}
                  panelClassName="dropdown-scroll-panel w-25"
                  onShow={handleDropdownShow}
                  onHide={handleDropdownHide}
                />
                {creditError.selectedClient && (
                  <small className="error">{creditError.selectedClient}</small>
                )}
              </div>
            </TabPanel>
          </TabView>

          {selectedUser && (
            <div className="user-info-card">
              <div className="user-info-header">
                <span>User Details</span>
              </div>

              <div className="user-info-grid">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{selectedUser.fullName}</span>
                </div>

                {selectedUser.email && (
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">
                      {decryptVAPTData(selectedUser.email)}
                    </span>
                  </div>
                )}

                {selectedUser.panNumber && (
                  <div className="info-row">
                    <span className="info-label">PAN Number</span>
                    <span className="info-value">
                      {decryptVAPTData(selectedUser.panNumber)}
                    </span>
                  </div>
                )}

                {selectedUser.phoneNumber && (
                  <div className="info-row">
                    <span className="info-label">Mobile Number</span>
                    <span className="info-value">
                      {decryptVAPTData(selectedUser.phoneNumber)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="form-group">
              <label
                className="form-label small font-15"
                htmlFor="creditAmount"
              >
                Enter Credit
              </label>

              <div className="form-group">
                <InputText
                  value={creditAmount}
                  className="form-control"
                  placeholder="Enter the credit"
                  onChange={(e) => handleCreditAmountChange(e.target.value)}
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  maxLength={8}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />
              </div>

              {creditError.creditAmount && (
                <small className="error">{creditError.creditAmount}</small>
              )}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="btn btn-orange-line"
              onClick={() => {
                setAddCreditDialog(false);
                resetAddCreditForm();
                setActiveCreditTab(0);
              }}
            />

            <Button
              label="Add Credits"
              className="btn btn-orange"
              loading={loadingCredits}
              disabled={!selectedUser}
              onClick={handleAddCredits}
            />
          </div>
        </div>
      </Dialog>

      {/* <CreditNotAvailable
        isShow={showCreditPopup}
        onHide={handleClosePopup}
        message="Please add credits to your wallet so the client can access this feature."
      /> */}
    </>
  );
};

export default Subscription;

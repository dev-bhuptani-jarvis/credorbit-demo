import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableExpandedRows } from "primereact/datatable";
import { TabPanel, TabView } from "primereact/tabview";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import {
  IGetLoanMarketPlaceForEducationalInstituteResponse,
  IGetLoanMarketPlaceForEducationalInstituteResponseData,
  ILoanMarketplaceBankDetail,
  ILoanMarketplaceParticipant,
} from "../../../interface/applyLoan";
import {
  ISubscriptionBody,
  ISubscriptionResponse,
} from "../../../interface/subscription";
import { IStudent } from "../../../interface/student";
import {
  createLinkAPI,
  getLoanMarketPlaceForEducationalInstituteAPI,
  submitApplicationToBankForEducationalInstituteAPI,
} from "../../../utils/axios/apiServices";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../../utils/constants/constant";
import { PaymentStatusType, StorageKeyEnum } from "../../../utils/constants/enum";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import { decryptVAPTData } from "../../../utils/functions/encryptDecrypt";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "../../../utils/functions/sessionStorage";
import { formatDate, toastError, toastSuccess } from "../../../utils/functions/shared";
import { Dialog } from "primereact/dialog";

type EducationLoanMarketplaceNavigationState = {
  loanApplicationId?: string;
  loanApplicationID?: string;
  studentID?: string;
  selectedStudent?: IStudent | null;
  origin?: "student-360" | "bank-details";
};

type StoredLoanMarketplaceContext = {
  loanApplicationID: string;
  studentID: string;
};

type LoanMarketplaceBankDetailRow = ILoanMarketplaceBankDetail & {
  rowKey: string;
};

const defaultMarketplaceData: IGetLoanMarketPlaceForEducationalInstituteResponseData =
{
  studentID: "",
  loanApplicationID: "",
  loanApplicationCode: "",
  studentInfo: {
    studentName: "",
    studentCode: "",
    course: "",
    dateOfBirth: "",
    gender: "",
    creditScore: null,
    abb: null,
    lastTimeCreditScoreFetchDate: null,
    pan: "",
    mobileNumber: "",
    emailAddress: "",
    address: "",
    photo: "",
    panDocument: "",
    aadharDocument: "",
  },
  loanStructure: {
    courseID: "",
    course: "",
    tenureInYears: 0,
    agreedFee: 0,
    discountRate: 0,
    discountAmount: 0,
    netAgreedFee: 0,
    downPayment: 0,
    emiPlanInMonths: 0,
    advancedEMIMonths: 0,
    advancedEMIAmount: 0,
    remainingEMIs: 0,
    disbursementToInstitute: 0,
    netLoanAmount: 0,
    emiAmount: 0,
    emiAmountDescription: "",
  },
  courseDetails: {
    courseID: "",
    course: "",
    tenureInYears: 0,
    agreedFee: 0,
    discountRate: 0,
    discountAmount: 0,
    netAgreedFee: 0,
    downPayment: 0,
    emiPlanInMonths: 0,
    advancedEMIMonths: 0,
    advancedEMIAmount: 0,
    remainingEMIs: 0,
    disbursementToInstitute: 0,
    netLoanAmount: 0,
    emiAmount: 0,
    emiAmountDescription: "",
  },
  creditScore: null,
  abb: null,
  consent: {
    isTermsAndPrivacyConsentGiven: false,
    isCreditInformationConsentGiven: false,
    isDigiLockerConsentGiven: false,
    isDataSharingConsentGiven: false,
    isCommunicationConsentGiven: false,
    consentedAt: null,
  },
  applicants: [],
  coApplicants: [],
  isPaymentDone: false,
  bankDetails: [],
};

const LoanMarketPlace = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const [marketplaceNotice, setMarketplaceNotice] = useState<string>("");

  const [marketplaceData, setMarketplaceData] =
    useState<IGetLoanMarketPlaceForEducationalInstituteResponseData>(
      defaultMarketplaceData,
    );

  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | ILoanMarketplaceBankDetail[]
  >({});

  const [showThankYouDialog, setShowThankYouDialog] = useState<boolean>(false);

  const [isConfirmingProcessingFee, setIsConfirmingProcessingFee] = useState<boolean>(false);

  const [creatingPaymentRowKey, setCreatingPaymentRowKey] = useState<string>("");

  const [submittingBankRowKey, setSubmittingBankRowKey] = useState<string>("");

  const [paymentStatusDialog, setPaymentStatusDialog] =
    useState<PaymentStatusType | null>(null);

  const location = useLocation();

  const navigate = useNavigate();

  const locationState =
    (location.state || {}) as EducationLoanMarketplaceNavigationState;

  const storedMarketplaceContext = useMemo((): StoredLoanMarketplaceContext | null => {
    const rawValue = getDecryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_EDUCATION_LOAN_MARKETPLACE_CONTEXT,
    );

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(String(rawValue)) as StoredLoanMarketplaceContext;
    } catch (error) {
      console.error("Failed to parse marketplace context", error);
      removeSessionStorageKey(
        StorageKeyEnum.CRED_ORBIT_EDUCATION_LOAN_MARKETPLACE_CONTEXT,
      );
      return null;
    }
  }, []);

  const loanApplicationID =
    locationState.loanApplicationID
    || locationState.loanApplicationId
    || storedMarketplaceContext?.loanApplicationID
    || "";

  const studentID =
    locationState.studentID
    || locationState.selectedStudent?.id
    || storedMarketplaceContext?.studentID
    || "";

  const handleBackNavigation = (): void => {
    if (locationState.origin === "student-360" && studentID) {
      navigate(`${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`, {
        state: {
          selectedDraftId: loanApplicationID,
          loanApplicationId: loanApplicationID,
          studentID,
          selectedStudent: locationState.selectedStudent || null,
        },
      });
      return;
    }

    if (locationState.origin === "bank-details") {
      navigate(RoutePathConstant.private.educationStudentBankDetails, {
        state: {
          ...locationState,
          isEducationPortal: true,
          loanApplicationId: loanApplicationID,
          studentID,
        },
      });
      return;
    }

    navigate(-1);
  };

  const studentInfoItems = useMemo(
    () => {
      const applicationAbb = marketplaceData.abb ?? marketplaceData.studentInfo.abb;

      return [
        {
          label: "Student Name",
          value: marketplaceData?.studentInfo?.studentName || "-",
        },
        {
          label: "Date of Birth",
          value: marketplaceData.studentInfo.dateOfBirth
            ? formatDate(
              decryptVAPTData(marketplaceData.studentInfo.dateOfBirth),
              "DD MMM, YYYY",
            )
            : "-",
        },
        {
          label: "Gender",
          value: marketplaceData.studentInfo.gender || "-",
        },
        {
          label: "PAN",
          value: marketplaceData.studentInfo.pan ? decryptVAPTData(marketplaceData.studentInfo.pan) : "-",
        },
        {
          label: "Mobile Number",
          value: marketplaceData.studentInfo.mobileNumber
            ? formatMobileNumber(decryptVAPTData(marketplaceData.studentInfo.mobileNumber))
            : "-",
        },
        {
          label: "Email Address",
          value: marketplaceData.studentInfo.emailAddress ? decryptVAPTData(marketplaceData.studentInfo.emailAddress) : "-",
        },
        {
          label: "Course Name",
          value:
            marketplaceData.courseDetails.course || marketplaceData.studentInfo.course || marketplaceData.loanStructure.course || "-",
        },
        {
          label: "Credit Score",
          value: marketplaceData.creditScore ?? marketplaceData.studentInfo.creditScore ?? "-",
        },
        {
          label: "ABB",
          value: applicationAbb !== null
            ? formatCurrencyAmount(applicationAbb)
            : "-",
        },
      ];
    },
    [marketplaceData],
  );

  const bankDetailRows = useMemo<LoanMarketplaceBankDetailRow[]>(
    () =>
      (marketplaceData.bankDetails || []).map((bankDetail, index) => ({
        ...bankDetail,
        rowKey: [
          bankDetail.nbfcID || "nbfc",
          bankDetail.bankID,
          bankDetail.loanTypeID,
          bankDetail.tenure,
          index,
        ].join("-"),
      })),
    [marketplaceData.bankDetails],
  );

  const fetchLoanMarketplace = async (): Promise<void> => {
    if (!loanApplicationID || !studentID) {
      setMarketplaceData(defaultMarketplaceData);
      setMarketplaceNotice("");
      return;
    }

    setLoading(true);

    try {
      const params = {
        loanApplicationID,
        studentID,
      };

      const response: IGetLoanMarketPlaceForEducationalInstituteResponse =
        await getLoanMarketPlaceForEducationalInstituteAPI(params);

      setMarketplaceData(response?.data || defaultMarketplaceData);

      if (response?.statusCode === 200) {
        setMarketplaceNotice("");
      } else {
        setMarketplaceNotice(response?.message);
      }
    } catch (error) {
      const errorResponse = (
        error as AxiosError<IGetLoanMarketPlaceForEducationalInstituteResponse>
      )?.response?.data;

      if (errorResponse?.data) {
        setMarketplaceData(errorResponse.data);
        setMarketplaceNotice(errorResponse.message || "");
      } else {
        setMarketplaceData(defaultMarketplaceData);
        setMarketplaceNotice("");
      }

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanMarketplace();
  }, [loanApplicationID, studentID]);

  useEffect(() => {
    if (!loanApplicationID || !studentID) {
      return;
    }

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_EDUCATION_LOAN_MARKETPLACE_CONTEXT,
      JSON.stringify({
        loanApplicationID,
        studentID,
      } satisfies StoredLoanMarketplaceContext),
    );
  }, [loanApplicationID, studentID]);

  useEffect(() => {
    if (!showThankYouDialog) {
      return undefined;
    }

    const redirectTimer = window.setTimeout(() => {
      setShowThankYouDialog(false);
      navigate(RoutePathConstant.private.institueDashboard);
    }, 5000);

    return () => window.clearTimeout(redirectTimer);
  }, [navigate, showThankYouDialog]);

  const renderParticipantDetails = (
    participant: ILoanMarketplaceParticipant,
    sectionTitle: string,
  ): JSX.Element => (
    <div className="borderBoxHldr p-24">
      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Name</b>
          <p className="text-break">{(participant.name) || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">{participant.pan ? decryptVAPTData(participant.pan) : "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {participant.dateOfBirth
              ? formatDate(decryptVAPTData(participant.dateOfBirth), "DD MMM, YYYY")
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Gender</b>
          <p className="text-break">
            {participant.gender
              ? participant.gender.charAt(0).toUpperCase() + participant.gender.slice(1).toLowerCase()
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {participant.mobileNumber
              ? formatMobileNumber(decryptVAPTData(participant.mobileNumber))
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">
            {participant.emailAddress ? decryptVAPTData(participant.emailAddress) : "-"}
          </p>
        </div>
        {/* <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Relation</b>
          <p className="text-break">{participant.relation || "-"}</p>
        </div> */}
        <div className="col-lg-6 col-md-7 col-sm-12 col-12 mb-4">
          <b>Address</b>
          <p className="text-break">
            {[
              decryptVAPTData(participant.address),
              participant.city,
              participant.state,
              participant.pinCode,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>
        </div>
      </div>
    </div>
  );

  const getBankDetailRowKey = (rowData: LoanMarketplaceBankDetailRow): string =>
    rowData.rowKey;

  const toggleRowExpansion = (rowData: LoanMarketplaceBankDetailRow): void => {
    setExpandedRows((previous) => {
      const currentRows = previous as DataTableExpandedRows;
      const rowKey = getBankDetailRowKey(rowData);

      if (currentRows[rowKey]) {
        return {};
      }

      return {
        [rowKey]: true,
      };
    });
  };

  const handleCreatePaymentLink = async (
    bankDetail: LoanMarketplaceBankDetailRow,
  ): Promise<void> => {
    if (!loanApplicationID || !studentID) {
      toastError("Loan application context is missing.");
      return;
    }

    const rowKey = getBankDetailRowKey(bankDetail);

    setCreatingPaymentRowKey(rowKey);

    setLoading(true);

    try {
      const payload: ISubscriptionBody = {
        studentID,
        loanApplicationID,
        nbfcID: bankDetail.nbfcID || "",
        amount: String(bankDetail.processingFeeAmount || 0),
      };

      const response: ISubscriptionResponse = await createLinkAPI(payload);

      if (!response) return;

      if (response.statusCode === 200 && response.data?.shortUrl) {
        window.location.href = response.data.shortUrl;
      } else {
        toastError(response.message);
      }
    } catch (error) {
      console.error("Failed to create payment link", error);
    } finally {
      setCreatingPaymentRowKey("");
    }

    setLoading(false);
  };

  const handlePaymentStatusAcknowledgement = async (): Promise<void> => {
    setIsConfirmingProcessingFee(true);
    await fetchLoanMarketplace();
    setPaymentStatusDialog(null);
    setIsConfirmingProcessingFee(false);
  };

  const handleSubmitApplication = async (
    bankDetail: LoanMarketplaceBankDetailRow,
  ): Promise<void> => {
    if (!loanApplicationID || !studentID) {
      toastError("Loan application context is missing.");
      return;
    }

    setLoading(true);

    const rowKey = getBankDetailRowKey(bankDetail);
    setSubmittingBankRowKey(rowKey);

    try {
      const response = await submitApplicationToBankForEducationalInstituteAPI({
        loanApplicationID,
        studentID,
        bankID: 1,
        nbfcID: bankDetail.nbfcID || "",
      });

      if (response?.statusCode === 200) {
        toastSuccess(response.message);
        setShowThankYouDialog(true);
      } else {
        toastError(response?.message);
      }
    } finally {
      setSubmittingBankRowKey("");
    }

    setLoading(false);
  };

  const renderOfferExpansion = (
    rowData: ILoanMarketplaceBankDetail,
  ): JSX.Element => (
    <div
      style={{
        background: "#ffffff",
        borderTop: "1px solid #f2f4f7",
        padding: "18px 20px 22px",
      }}
    >
      <div
        className="borderBoxHldr p-24"
        style={{
          borderRadius: "18px",
        }}
      >
        <div className="row">
          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Loan Amount</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.loanAmount)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Loan Tenure</b>
            <p className="text-break mb-0">
              {`${marketplaceData.courseDetails.emiPlanInMonths || marketplaceData.loanStructure.emiPlanInMonths || 0} Month${(marketplaceData.courseDetails.emiPlanInMonths || marketplaceData.loanStructure.emiPlanInMonths || 0) === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Total EMI Amount</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.emi)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Interest Amount</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.interestAmount || 0)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Advance EMI Months</b>
            <p className="text-break mb-0">
              {`${marketplaceData.courseDetails.advancedEMIMonths || marketplaceData.loanStructure.advancedEMIMonths || 0} Month${(marketplaceData.courseDetails.advancedEMIMonths || marketplaceData.loanStructure.advancedEMIMonths || 0) === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Advanced EMI Amount</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.advancedEMI || 0)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Remaining EMI Months</b>
            <p className="text-break mb-0">
              {`${rowData.remainingEMI || 0} Month${rowData.remainingEMI === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Processing Fees Amount (Incl. GST of 18%)</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.processingFeeAmount || 0)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Financed Fee to Institute</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.processingFeeAmount || 0)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Disbursement to Institute</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.disbursementToInstitute || 0)}
            </p>
          </div>

          {rowData.roi_Min > 0 &&
            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
              <b>Interest Rate (%)</b>
              <p className="text-break mb-0">
                {rowData.roi_Min}% (Flat Rate)
              </p>
            </div>
          }

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Net Cost To Customer</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.processingFeeAmount || 0)}
            </p>
          </div>

          <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <b>Total Amount paid through EMIs</b>
            <p className="text-break mb-0">
              {formatCurrencyAmount(rowData.processingFeeAmount || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus: string | null = searchParams.get(
      "razorpay_payment_link_status",
    );

    if (paymentStatus) {
      setPaymentStatusDialog(
        paymentStatus === PaymentStatusType.PAID
          ? PaymentStatusType.PAID
          : PaymentStatusType.FAILED,
      );

      navigate(
        `${location.pathname}`,
        {
          replace: true,
          state: location.state || storedMarketplaceContext || undefined,
        },
      );
    }
  }, [location.pathname, location.state, navigate, storedMarketplaceContext]);


  if (!loanApplicationID || !studentID) {
    return (
      <div className="whiteBoxHldr p-24">
        <p className="mb-0">
          Loan application context is missing. Please go back and open the
          marketplace again from the student loan flow.
        </p>
      </div>
    );
  }

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h3 className="mb-0" style={{ color: "#1d2939", fontWeight: 700 }}>
          Eligibility Screen - {marketplaceData?.studentInfo?.studentName}
        </h3>

        <Button className="btn btn-black-line" onClick={handleBackNavigation}>
          Back
        </Button>
      </div>

      <TabView
        className="custom-tabview"
        activeIndex={activeTabIndex}
        onTabChange={(event) => setActiveTabIndex(event.index)}
      >
        <TabPanel header="Personal Details">
          <div
            className="borderBoxHldr p-24 mt-3"
            style={{
              borderRadius: "18px",
            }}
          >
            <div className="row">
              {studentInfoItems.map((item) => (
                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4" key={item.label}>
                  <b>{item.label}</b>
                  <p className="text-break mb-0">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Applicants Details">
          <div className="mt-3">
            {marketplaceData.applicants?.length ? (
              renderParticipantDetails(marketplaceData.applicants[0], "Applicant")
            ) : (
              <div className="borderBoxHldr p-24">
                <p className="mb-0">No applicant details available.</p>
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel header="Co-Applicants Details">
          <div className="mt-3">
            {marketplaceData.coApplicants?.length ? (
              marketplaceData.coApplicants.map((participant, index) => (
                <div
                  key={participant.participantID || `co-applicant-${index + 1}`}
                  className={index > 0 ? "mt-3" : ""}
                >
                  {renderParticipantDetails(participant, `Co-applicant ${index + 1}`)}
                </div>
              ))
            ) : (
              <div className="borderBoxHldr p-24">
                <p className="mb-0">No co-applicant details available.</p>
              </div>
            )}
          </div>
        </TabPanel>
      </TabView>

      <div className="borderBoxHldr p-24 mt-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h4 className="mb-1" style={{ color: "#1d2939", fontWeight: 700 }}>
              Lender Details
            </h4>
            <p className="mb-0 text-muted">
              Review eligible lenders below, then click Check to view
              offer details, pay the processing fee, and continue the application
              flow.
            </p>
          </div>

          <span
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              background: "#fff1ea",
              color: "#0d8dc9",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {marketplaceData.bankDetails.length} Offer
            {marketplaceData.bankDetails.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="table-responsive loan-marketplace-offers">
          <DataTable
            className="tableMain loan-marketplace-offers-table"
            value={bankDetailRows}
            dataKey="rowKey"
            expandedRows={expandedRows}
            onRowToggle={(event) =>
              setExpandedRows(
                (event.data || {}) as DataTableExpandedRows | ILoanMarketplaceBankDetail[],
              )
            }
            rowExpansionTemplate={renderOfferExpansion}
            removableSort
            emptyMessage="No Lender offers are available for this application right now."
          >
            <Column
              header=""
              body={(rowData: LoanMarketplaceBankDetailRow) => {
                const isExpanded =
                  !!(expandedRows as DataTableExpandedRows)?.[
                  getBankDetailRowKey(rowData)
                  ];

                return (
                  <button
                    type="button"
                    onClick={() => toggleRowExpansion(rowData)}
                    aria-label={isExpanded ? "Collapse offer details" : "Expand offer details"}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#475467",
                      padding: 0,
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    <i className={`pi ${isExpanded ? "pi-chevron-up" : "pi-chevron-down"}`} />
                  </button>
                );
              }}
              style={{ width: "54px" }}
            />

            <Column
              field="bankName"
              header="Lender Name"
              sortable
              body={(rowData: ILoanMarketplaceBankDetail) => (
                <span style={{ color: "#344054" }}>
                  {rowData.nbfcName || rowData.bankName || "-"}
                </span>
              )}
            />

            <Column
              field="loanAmount"
              header="Loan Amount"
              sortable
              body={(rowData: ILoanMarketplaceBankDetail) =>
                formatCurrencyAmount(rowData.loanAmount)
              }
            />

            <Column
              field="tenure"
              header="Tenure"
              sortable
              body={(rowData: ILoanMarketplaceBankDetail) =>
                `${rowData.tenure} Month${rowData.tenure > 1 ? "s" : ""}`
              }
            />

            <Column
              field="emi"
              header="EMI"
              body={(rowData: ILoanMarketplaceBankDetail) =>
                formatCurrencyAmount(rowData.emi)
              }
            />

            <Column
              header="Action"
              style={{ minWidth: "210px" }}
              body={(rowData: LoanMarketplaceBankDetailRow) => {
                const isFreeProcessingFee =
                  (rowData.processingFeeAmount ?? 0) <= 0;

                const rowKey = getBankDetailRowKey(rowData);
                const isProcessingFeePaid =
                  isFreeProcessingFee || rowData.isPaymentDone;
                const isApplyingThisBank = submittingBankRowKey === rowKey;
                const isCreatingPaymentForThisBank = creatingPaymentRowKey === rowKey;

                if (isProcessingFeePaid) {
                  return (
                    <div
                      className="loan-marketplace-offers-action"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {!isFreeProcessingFee && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background: "#ecfdf3",
                            color: "#027a48",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          <i className="pi pi-check-circle" />
                          <span>Payment Successful</span>
                        </span>
                      )}

                      <Button
                        className="btn btn-orange text-white loan-marketplace-payment-button"
                        disabled={isApplyingThisBank}
                        loading={isApplyingThisBank}
                        onClick={() => void handleSubmitApplication(rowData)}
                      >
                        {isApplyingThisBank ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <Button
                    className="btn btn-orange text-white loan-marketplace-payment-button"
                    disabled={isCreatingPaymentForThisBank}
                    loading={isCreatingPaymentForThisBank}
                    onClick={() => handleCreatePaymentLink(rowData)}
                  >
                    {isCreatingPaymentForThisBank ? "Opening..." : "Pay Processing Fee"}
                  </Button>
                )
              }}
            />

          </DataTable>
        </div>
      </div>

      <Dialog
        visible={Boolean(marketplaceNotice)}
        onHide={() => setMarketplaceNotice("")}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "500px", padding: 0 }}
      >
        <div className="p-4">
          <p className="mb-0">{marketplaceNotice}</p>

          <div className="d-flex justify-content-end mt-4">
            <Button
              className="btn btn-orange"
              label="Okay"
              onClick={() => setMarketplaceNotice("")}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={paymentStatusDialog === PaymentStatusType.PAID}
        onHide={() => void handlePaymentStatusAcknowledgement()}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="p-2">
          <h4 className="mb-3">Payment Successful</h4>
          <p className="mb-0">Processing fee payment completed successfully.</p>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              className="btn btn-orange"
              label={isConfirmingProcessingFee ? "Loading..." : "Okay"}
              onClick={() => handlePaymentStatusAcknowledgement()}
              loading={isConfirmingProcessingFee}
              disabled={isConfirmingProcessingFee}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={
          paymentStatusDialog === PaymentStatusType.FAILED
        }
        onHide={() => setPaymentStatusDialog(null)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="p-2">
          <h4 className="mb-3">
            Payment Failed
          </h4>

          <p className="mb-0">
            Payment could not be completed. Please try again using Pay Processing Fee.
          </p>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              className="btn btn-black-line"
              label="Okay"
              onClick={() => setPaymentStatusDialog(null)}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showThankYouDialog}
        onHide={() => {
          setShowThankYouDialog(false);
          navigate(RoutePathConstant.private.institueDashboard);
        }}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="text-center py-4">
          <img
            src="/assets/images/tick-circle.svg"
            alt="tick-circle"
            loading="lazy"
            style={{ width: "80px", height: "80px" }}
          />
          <h4 className="mb-0 mt-3">Thank you</h4>
          <p className="mb-2">
            The loan application has been submitted successfully. Redirecting to
            the dashboard.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default LoanMarketPlace;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentApplicant,
} from "../../interface/educationManagement";
import { ILoanMarketBankDetails, ILoanMarketResponse } from "../../interface/loanMarketPlace";
import { fetchNBFCLoanMarketPlaceListingAPI } from "../../utils/axios/apiServices";
import {
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  completeEducationLoanApplication,
  getEducationLoanDraftById,
  setEducationLoanResumeStep,
  updateEducationLoanDraftOfferSelection,
} from "../../utils/demo/demoEducationLoanFlow";
import { formatDate, toastError, toastSuccess } from "../../utils/functions/shared";

const RAZORPAY_TEST_LINK =
  "https://razorpay.com/payment-link/plink_SokyWAJOOqGcI2/test";
const PROCESSING_FEE_RATE = 0.01;

const EducationLoanOffer = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState<number | null>(0);
  const [showLenderDialog, setShowLenderDialog] = useState<boolean>(false);
  const [lenders, setLenders] = useState<ILoanMarketBankDetails[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState<boolean>(false);
  const [selectedLender, setSelectedLender] = useState<ILoanMarketBankDetails | null>(null);
  const [draft, setDraft] = useState<IEducationLoanDraft | null>(() =>
    getEducationLoanDraftById(id) || null,
  );

  const primaryApplicant = draft?.applicants?.[0];
  const coApplicants = draft?.applicants?.slice(1) || [];

  useEffect(() => {
    setDraft(getEducationLoanDraftById(id) || null);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setEducationLoanResumeStep(id, "loan-offer");
  }, [id]);

  useEffect(() => {
    const loadLenders = async (): Promise<void> => {
      if (!draft) return;

      setLoading(true);

      try {
        const response: ILoanMarketResponse = await fetchNBFCLoanMarketPlaceListingAPI({
          loanAppID: id,
        });

        if (response?.statusCode === 200 && response.data?.bankDetails) {
          setLenders(response.data.bankDetails);
        } else {
          setLenders([]);
          toastError(response?.message || "Unable to load NBFC list.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadLenders();
  }, [draft, id]);

  useEffect(() => {
    if (!showThankYouDialog) return undefined;

    const redirectTimeout = window.setTimeout(() => {
      setShowThankYouDialog(false);
      navigate(RoutePathConstant.private.channelPartnerDashboard);
    }, 2500);

    return () => window.clearTimeout(redirectTimeout);
  }, [navigate, showThankYouDialog]);

  const renderApplicantDetails = (
    applicant: IEducationStudentApplicant,
    title: string,
    relation?: string,
  ) => (
    <div className="borderBoxHldr p-24 mt-3">
      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>{title} Name</b>
          <p className="text-break">{applicant.name || "-"}</p>
        </div>
        {relation && (
          <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
            <b>Relation</b>
            <p className="text-break">{relation}</p>
          </div>
        )}
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">{applicant.pan || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {applicant.dateOfBirth
              ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Gender</b>
          <p className="text-break">{applicant.gender || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {applicant.mobileNumber
              ? formatMobileNumber(applicant.mobileNumber)
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">{applicant.email || "-"}</p>
        </div>
      </div>
    </div>
  );

  const buildOfferMetrics = (lender: ILoanMarketBankDetails) => {
    const processingFeeAmount = Number((lender.loanAmount * PROCESSING_FEE_RATE).toFixed(2));
    const totalRepayment =
      Number((lender.emi * (draft?.numberOfEmis || 0)).toFixed(2)) +
      Number(draft?.advanceEmi || 0);
    const interestAmount = Math.max(
      Number((totalRepayment - lender.loanAmount).toFixed(2)),
      0,
    );

    return {
      processingFeeAmount,
      interestAmount,
    };
  };

  const markProcessingFeePaid = (): void => {
    if (!draft || !selectedLender) return;

    const { processingFeeAmount } = buildOfferMetrics(selectedLender);
    const updatedDraft = updateEducationLoanDraftOfferSelection(draft.id, {
      selectedBankId: selectedLender.bankID,
      selectedBankName: selectedLender.bankName,
      processingFeeAmount,
      processingFeePaid: true,
      processingFeePaidAt: new Date().toISOString(),
    });

    if (!updatedDraft) {
      toastError("Unable to update the processing fee status.");
      return;
    }

    setDraft(updatedDraft);
    setShowPaymentDialog(false);
    toastSuccess("Processing fee marked as paid.");
  };

  const handleProcessingFeeClick = (lender: ILoanMarketBankDetails): void => {
    setSelectedLender(lender);
    window.open(RAZORPAY_TEST_LINK, "_blank", "noopener,noreferrer");
    setShowPaymentDialog(true);
  };

  const handleOpenLenderDialog = (lender: ILoanMarketBankDetails): void => {
    setSelectedLender(lender);
    setActiveAccordionIndex(0);
    setShowLenderDialog(true);
  };

  const handleApply = (lender: ILoanMarketBankDetails): void => {
    if (!draft) return;

    const { processingFeeAmount } = buildOfferMetrics(lender);
    const preparedDraft = updateEducationLoanDraftOfferSelection(draft.id, {
      selectedBankId: lender.bankID,
      selectedBankName: lender.bankName,
      processingFeeAmount,
      processingFeePaid: true,
      processingFeePaidAt: draft.processingFeePaidAt || new Date().toISOString(),
    });

    if (!preparedDraft) {
      toastError("The loan application could not be updated.");
      return;
    }

    const completedDraft = completeEducationLoanApplication(preparedDraft.id);

    if (!completedDraft) {
      toastError("The loan application could not be submitted.");
      return;
    }

    setEducationLoanResumeStep(completedDraft.id, "submitted");
    setDraft(completedDraft);
    setShowThankYouDialog(true);
  };

  if (!draft) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Loan Eligibility Screen" />
        <p className="mb-3">Education loan application not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.channelPartnerDashboard)}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <TableTitle title={`Loan Eligibility Screen - ${draft.studentName}`} />
          <Button
            className="btn btn-black-line"
            onClick={() => navigate(RoutePathConstant.private.channelPartnerDashboard)}
          >
            Back
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-12">
            <TabView
              className="custom-tabview"
              activeIndex={activeTabIndex}
              onTabChange={(event) => setActiveTabIndex(event.index)}
            >
              <TabPanel header="Personal Details">
                <div className="borderBoxHldr p-24 mt-3">
                  <div className="row">
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Student Information</b>
                      <p className="text-break">{draft.studentName}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Date of Birth</b>
                      <p className="text-break">
                        {draft.studentDateOfBirth
                          ? formatDate(draft.studentDateOfBirth, "DD MMM, YYYY")
                          : "-"}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Gender</b>
                      <p className="text-break">{draft.studentGender || "-"}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>PAN</b>
                      <p className="text-break">{draft.studentPan || "-"}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Mobile Number</b>
                      <p className="text-break">
                        {formatMobileNumber(draft.studentMobileNumber)}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Email Address</b>
                      <p className="text-break">{draft.studentEmail}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Course Name</b>
                      <p className="text-break">{draft.courseName}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Course Type</b>
                      <p className="text-break">{draft.courseType}</p>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Applicants Details">
                {primaryApplicant ? (
                  renderApplicantDetails(primaryApplicant, "Applicant")
                ) : (
                  <div className="borderBoxHldr p-24 mt-3">
                    <p className="mb-0">No applicant details available.</p>
                  </div>
                )}
              </TabPanel>

              <TabPanel header="Co-Applicants Details">
                {coApplicants.length > 0 ? (
                  coApplicants.map((applicant, index) => (
                    <div
                      key={applicant.id || `co-applicant-${index + 1}`}
                      className={index > 0 ? "mt-3" : ""}
                    >
                      {renderApplicantDetails(
                        applicant,
                        `Co-applicant ${index + 1}`,
                        draft.coApplicantRelation || `Co-applicant ${index + 1}`,
                      )}
                    </div>
                  ))
                ) : (
                  <div className="borderBoxHldr p-24 mt-3">
                    <p className="mb-0">No co-applicant details available.</p>
                  </div>
                )}
              </TabPanel>
            </TabView>
          </div>

          <div className="col-12">
            <div className="borderBoxHldr p-24">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                  <h5 className="mb-1">Eligible NBFC List</h5>
                  <p className="mb-0 text-muted">
                    Review eligible NBFCs in the table below, then click Check to
                    view offer details, pay the processing fee, and continue the
                    application flow.
                  </p>
                </div>
                <span className="education-offer-count">
                  {lenders.length} {lenders.length === 1 ? "Offer" : "Offers"}
                </span>
              </div>

              {lenders.length > 0 ? (
                <DataTable
                  removableSort
                  className="tableMain"
                  value={lenders}
                  emptyMessage="No NBFC matched this application right now."
                >
                  <Column field="bankName" header="NBFC Name" sortable />
                  <Column
                    field="loanAmount"
                    header="Loan Amount"
                    sortable
                    body={(rowData: ILoanMarketBankDetails) =>
                      formatCurrencyAmount(rowData.loanAmount)
                    }
                  />
                  <Column
                    field="tenure"
                    header="Tenure"
                    sortable
                    body={(rowData: ILoanMarketBankDetails) =>
                      `${rowData.tenure} ${rowData.tenure === 1 ? "Year" : "Years"}`
                    }
                  />
                  <Column
                    header="EMI"
                    body={(rowData: ILoanMarketBankDetails) =>
                      formatCurrencyAmount(Number(rowData.emi.toFixed(2)))
                    }
                  />
                  <Column
                    header="Action"
                    body={(rowData: ILoanMarketBankDetails) => (
                      <Button
                        className="btn btn-orange-line"
                        label="Check"
                        onClick={() => handleOpenLenderDialog(rowData)}
                      />
                    )}
                  />
                </DataTable>
              ) : (
                <p className="mb-0">No NBFC matched this application right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        visible={showLenderDialog}
        onHide={() => setShowLenderDialog(false)}
        header={selectedLender ? `${selectedLender.bankName} Offer Details` : "Offer Details"}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "900px" }}
      >
        {selectedLender && (
          <>
            <Accordion
              activeIndex={activeAccordionIndex}
              onTabChange={(event) =>
                setActiveAccordionIndex(
                  typeof event.index === "number" ? event.index : null,
                )
              }
            >
              <AccordionTab
                header={
                  <div className="education-offer-header">
                    <div>
                      <h6 className="mb-1">{selectedLender.bankName}</h6>
                      <small className="text-muted">
                        {formatCurrencyAmount(selectedLender.loanAmount)} sanctioned potential
                      </small>
                    </div>
                    <div className="education-offer-header__stats">
                      <span>
                        {formatCurrencyAmount(Number(selectedLender.emi.toFixed(2)))}
                      </span>
                      <small className="text-muted">EMI</small>
                    </div>
                  </div>
                }
              >
                {(() => {
                  const { processingFeeAmount, interestAmount } =
                    buildOfferMetrics(selectedLender);
                  const isProcessingFeePaid =
                    draft.processingFeePaid &&
                    draft.selectedBankId === selectedLender.bankID;

                  return (
                    <>
                      <div className="row">
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Loan Amount</b>
                          <p className="text-break">
                            {formatCurrencyAmount(selectedLender.loanAmount)}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Tenure</b>
                          <p className="text-break">
                            {selectedLender.tenure} {selectedLender.tenure === 1 ? "Year" : "Years"}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>EMI</b>
                          <p className="text-break">
                            {formatCurrencyAmount(Number(selectedLender.emi.toFixed(2)))}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Advanced EMI</b>
                          <p className="text-break">
                            {formatCurrencyAmount(draft.advanceEmi)}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Remaining EMI</b>
                          <p className="text-break">{draft.numberOfEmis} Months</p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Interest Amount (Born by institute)</b>
                          <p className="text-break">
                            {formatCurrencyAmount(interestAmount)}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Disbursement to Institute</b>
                          <p className="text-break">
                            {formatCurrencyAmount(draft.totalAmountToInstitute)}
                          </p>
                        </div>
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          <b>Processing Fees Amount</b>
                          <p className="text-break">
                            {formatCurrencyAmount(processingFeeAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-3 flex-wrap mt-2">
                        {isProcessingFeePaid ? (
                          <>
                            <span className="education-processing-status">
                              Processing fee paid
                            </span>
                            <Button
                              className="btn btn-orange"
                              label="Apply"
                              onClick={() => handleApply(selectedLender)}
                            />
                          </>
                        ) : (
                          <Button
                            className="btn btn-orange-line"
                            label="Pay Processing Fee"
                            onClick={() => handleProcessingFeeClick(selectedLender)}
                          />
                        )}
                      </div>
                    </>
                  );
                })()}
              </AccordionTab>
            </Accordion>

            <div className="d-flex justify-content-end mt-4">
              <Button
                className="btn btn-black-line"
                label="Close"
                onClick={() => setShowLenderDialog(false)}
              />
            </div>
          </>
        )}
      </Dialog>

      <Dialog
        visible={showPaymentDialog}
        onHide={() => setShowPaymentDialog(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="p-2">
          <h4 className="mb-3">Confirm Processing Fee Payment</h4>
          <p className="mb-0">
            The Razorpay link has been opened for{" "}
            <b>{selectedLender?.bankName || "the selected NBFC"}</b>. Once the
            payment is completed, confirm it here to enable the apply action.
          </p>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              className="btn btn-black-line"
              label="Close"
              onClick={() => setShowPaymentDialog(false)}
            />
            <Button
              className="btn btn-orange"
              label="Payment Completed"
              onClick={markProcessingFeePaid}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showThankYouDialog}
        onHide={() => {
          setShowThankYouDialog(false);
          navigate(RoutePathConstant.private.channelPartnerDashboard);
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
    </>
  );
};

export default EducationLoanOffer;

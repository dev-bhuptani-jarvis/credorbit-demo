import { Button } from "primereact/button";
import ApplyLoanModal from "../../components/ApplyLoanModal";
import { useEffect, useState } from "react";
import UploadDocumentModal from "../../components/UploadDocumentModal";
import Loader from "../../components/Loader";
import BackButton from "../../components/BackButton";
import { useLocation } from "react-router-dom";
import {
  fetchLoanMarketPlaceListingAPI,
  getLoanDetailAPI,
} from "../../utils/axios/apiServices";
import { toastError } from "../../utils/functions/shared";
import {
  ILoanMarketBankDetails,
  ILoanMarketPlacePayload,
  ILoanMarketResponse,
} from "../../interface/loanMarketPlace";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IBankInfo } from "../../interface/applyLoan";
import { ILoanDetailData, ILoanResponse } from "../../interface/loanDetail";
import moment from "moment";

const LoanMarketPlace = () => {
  const [loanMarketPlaceData, setLoanMarketPlaceData] = useState<
    ILoanMarketBankDetails[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [loanModal, setLoanModal] = useState<boolean>(false);

  const [bankInfo, setBankInfo] = useState<IBankInfo>({
    bankID: 0,
    loanTenureID: 0,
    rateOfInterest: 0,
  });

  const [uploadModal, setUploadModal] = useState<boolean>(false);

  const { state } = useLocation();

  const [showDocumentFlow, setShowDocumentFlow] = useState<boolean>(
    state?.showDocument ?? true,
  );

  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const [loanDetail, setLoanDetail] = useState<ILoanDetailData>();

  const fetchLoanMarketPlace = async (): Promise<void> => {
    setLoading(true);

    const params: ILoanMarketPlacePayload = {
      loanAppID: state.loanApp,
    };

    const response: ILoanMarketResponse =
      await fetchLoanMarketPlaceListingAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setLoanMarketPlaceData(response.data.bankDetails || []);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchLoanDetails = async (): Promise<void> => {
    const params: ILoanMarketPlacePayload = {
      loanAppID: state.loanApp,
    };

    const response: ILoanResponse = await getLoanDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setLoanDetail(response.data);
    } else {
      toastError(response.message);
    }
  };

  useEffect(() => {
    fetchLoanMarketPlace();
    fetchLoanDetails();
  }, []);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    if (showDocumentFlow) {
      setUploadModal(true);
      setLoanModal(false);
    } else {
      setLoanModal(true);
      setUploadModal(false);
    }
  }, [showDocumentFlow]);

  const loanSummaryItems = [
    {
      label: "Loan Type",
      value: loanDetail?.loanType ?? "-",
    },
    {
      label: "Loan Amount",
      value: loanDetail?.loanAmount
        ? formatCurrencyAmount(loanDetail.loanAmount)
        : "-",
    },
    {
      label: "Applied Date",
      value: loanDetail?.loanAppiedDate
        ? moment(loanDetail.loanAppiedDate).format("DD MMM YYYY")
        : "-",
    },
  ];

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
              <div>
                <h2 className="txt-24 fw-bold mb-1">Loan Marketplace</h2>
                <p className="mb-0 text-muted">
                  Compare lender offers for this application and continue with
                  the best fit.
                </p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {loanSummaryItems.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.label}>
                  <div
                    className="h-100"
                    style={{
                      border: "1px solid #f0dfcf",
                      borderRadius: "18px",
                      padding: "18px 20px",
                      background:
                        "linear-gradient(180deg, #fffaf6 0%, #ffffff 100%)",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <p
                      className="mb-2 text-uppercase"
                      style={{
                        fontSize: "12px",
                        letterSpacing: "0.08em",
                        color: "#9a6b3f",
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </p>
                    <h3
                      className="mb-0"
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#1f2937",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.value}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="row CheckEligibilityWrapper">
              <div className="col-12">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                  <div>
                    <h3 className="mb-1 fw-bold">Available Lender Matches</h3>
                    <p className="mb-0 text-muted">
                      Offers are calculated against the selected loan
                      application.
                    </p>
                  </div>
                  <div
                    className="px-3 py-2 align-self-start align-self-md-center"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "#fff4eb",
                      color: "#c86a1a",
                      fontWeight: 600,
                    }}
                  >
                    {loanMarketPlaceData.length} option
                    {loanMarketPlaceData.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="my-5 table-responsive">
                  <DataTable
                    removableSort
                    className="tableMain"
                    value={loanMarketPlaceData}
                    emptyMessage="No loan market found"
                  >
                    <Column
                      body={(rowData: ILoanMarketBankDetails) => (
                        <div className="CheckEligibiltyTable d-flex align-items-center">
                          <div className="checkEligMain">
                            <h3>{rowData.bankName}</h3>
                          </div>
                        </div>
                      )}
                      header="Bank Name"
                    />

                    <Column
                      field="loanAmount"
                      body={(rowData: ILoanMarketBankDetails) =>
                        formatCurrencyAmount(rowData.loanAmount)
                      }
                      sortable
                      header="Loan Amount"
                    />

                    <Column
                      field="roI_Min"
                      body={(rowData: ILoanMarketBankDetails) =>
                        `${rowData.roI_Min} %`
                      }
                      sortable
                      header="ROI (Min)"
                    />

                    <Column
                      field="roI_Max"
                      body={(rowData: ILoanMarketBankDetails) =>
                        `${rowData.roI_Max} %`
                      }
                      sortable
                      header="ROI (Max)"
                    />

                    <Column
                      field="tenure"
                      body={(rowData: ILoanMarketBankDetails) =>
                        `${rowData.tenure} ${
                          rowData.tenure === 1 ? "Year" : "Years"
                        }`
                      }
                      sortable
                      header="Tenure"
                    />

                    <Column
                      body={(rowData: ILoanMarketBankDetails) =>
                        `${formatCurrencyAmount(Number(Number(rowData.emi).toFixed(2)))}`
                      }
                      header="EMI"
                    />

                    <Column
                      body={(rowData: ILoanMarketBankDetails) => (
                        <>
                          {showDocumentFlow ? (
                            <div className="btnMain">
                              <Button
                                className="btn btn-orange-line w-85"
                                onClick={() => {
                                  setShowDocumentFlow(true);
                                  setUploadModal(true);
                                  setBankInfo({
                                    bankID: rowData.bankID,
                                    loanTenureID: rowData.tenure,
                                    rateOfInterest: rowData.roI_Min,
                                  });
                                }}
                                label="Log in"
                              />
                            </div>
                          ) : (
                            <div className="btnMain">
                              <Button
                                className="btn btn-orange-line w-130"
                                onClick={() => {
                                  setLoanModal(true);
                                  setBankInfo({
                                    bankID: rowData.bankID,
                                    loanTenureID: rowData.tenure,
                                    rateOfInterest: rowData.roI_Min,
                                  });
                                }}
                                label="Apply Loan"
                              />
                            </div>
                          )}
                        </>
                      )}
                    />
                  </DataTable>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BackButton />
      </div>

      {loanModal && (
        <ApplyLoanModal
          setLoanModal={setLoanModal}
          loanModal={loanModal}
          bankInfo={bankInfo}
        />
      )}

      <UploadDocumentModal
        setUploadModal={setUploadModal}
        uploadModal={uploadModal}
        locationState={{
          ...state,
          bankID: bankInfo.bankID,
        }}
        bankInfo={bankInfo}
        setShowDocumentFlow={setShowDocumentFlow}
      />

      <p className="text-center position-relative bottom-0 mt-2 text-xl">
        Disclaimer on Analysis: The Loan Amount, Interest rate, Tenure, EMI and
        CAM report provided by Credorbit are for informational purposes only and
        are based solely on the data submitted by customer or channel partner.
        Credorbit does not guarantee loan approval or sanction by any lender.
        Lending decisions are made independently by lenders according to their
        own policies. Users and partners should not rely on these estimates as
        the sole basis for financial decisions and must use them at their own
        risk.
      </p>
    </>
  );
};

export default LoanMarketPlace;

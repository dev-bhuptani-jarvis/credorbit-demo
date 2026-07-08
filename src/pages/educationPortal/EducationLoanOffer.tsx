import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import { ILoanMarketBankDetails, ILoanMarketResponse } from "../../interface/loanMarketPlace";
import { fetchNBFCLoanMarketPlaceListingAPI } from "../../utils/axios/apiServices";
import { formatCurrencyAmount } from "../../utils/constants/constant";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getEducationLoanDraftById } from "../../utils/demo/demoEducationLoanFlow";
import { toastError } from "../../utils/functions/shared";

const cardStyle = {
  border: "1px solid #dbe8de",
  borderRadius: "24px",
  padding: "24px",
  background: "linear-gradient(135deg, #f4fbf5 0%, #ffffff 65%)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
};

const EducationLoanOffer = () => {
  const navigate = useNavigate();

  const { id = "" } = useParams();

  const [loading, setLoading] = useState<boolean>(false);

  const [lenders, setLenders] = useState<ILoanMarketBankDetails[]>([]);

  const draft = useMemo(() => getEducationLoanDraftById(id), [id]);

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

    loadLenders();
  }, [draft, id]);

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
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <TableTitle title={`Loan Eligibility Screen - ${draft.studentName}`} />
            <p className="mt-2 mb-0 text-muted" style={{ maxWidth: "820px" }}>
              Compare the eligible NBFC offers for this student application and
              continue with the lender that best matches the course financing need.
            </p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-xl-4">
            <div style={cardStyle} className="h-100">
              <p
                className="mb-2 text-uppercase"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: "#2f7a45",
                  fontWeight: 700,
                }}
              >
                Student
              </p>
              <h3 className="mb-1">{draft.studentName}</h3>
              <p className="mb-0 text-muted">{draft.courseName}</p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div style={cardStyle} className="h-100">
              <p
                className="mb-2 text-uppercase"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: "#2f7a45",
                  fontWeight: 700,
                }}
              >
                Loan Amount
              </p>
              <h3 className="mb-1">{formatCurrencyAmount(draft.loanAmount)}</h3>
              <p className="mb-0 text-muted">{draft.emiOptionMonths} month tenure requested</p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div style={cardStyle} className="h-100">
              <p
                className="mb-2 text-uppercase"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: "#2f7a45",
                  fontWeight: 700,
                }}
              >
                Eligible NBFCs
              </p>
              <h3 className="mb-1">{lenders.length}</h3>
              <p className="mb-0 text-muted">Matching lenders available for application</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <DataTable
            removableSort
            className="tableMain"
            value={lenders}
            emptyMessage="No NBFC matched this application right now."
          >
            <Column
              header="NBFC Name"
              body={(rowData: ILoanMarketBankDetails) => (
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <h3 className="mb-0" style={{ fontSize: "18px" }}>
                      {rowData.bankName}
                    </h3>
                  </div>
                </div>
              )}
            />

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
                formatCurrencyAmount(Number(Number(rowData.emi).toFixed(2)))
              }
            />

            <Column
              header="Action"
              body={(rowData: ILoanMarketBankDetails) => (
                <Button
                  className="btn btn-orange-line text-center"
                  label="Apply"
                  onClick={() =>
                    navigate(
                      RoutePathConstant.private.educationStudentLoanOfferKfs
                        .replace(":id", draft.id)
                        .replace(":bankId", String(rowData.bankID)),
                    )
                  }
                />
              )}
            />
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default EducationLoanOffer;

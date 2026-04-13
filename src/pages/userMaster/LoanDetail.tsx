import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLoanDetailAPI } from "../../utils/axios/apiServices";
import {
  ILoanDetailData,
  ILoanParams,
  ILoanResponse,
} from "../../interface/loanDetail";
import {
  formatCurrencyAmount,
  RouteParams,
} from "../../utils/constants/constant";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import {
  handleDownloadDocument,
  toastError,
} from "../../utils/functions/shared";
import moment from "moment";
import { LoanStatusType } from "../../utils/constants/enum";

const initialTrainPosition = "8%";

const rejectedTrainTargetPositions: Record<number, string> = {
  1: "8%",
  2: "calc(27.6667% - 50px)",
  3: "calc(86.3333% - 50px)",
};

const rejectedPlatformPositions: Record<number, string> = {
  1: "8%",
  2: "calc(27.6667% - 50px)",
  3: "calc(86.3333% - 50px)",
};

const trainTargetPositions: Record<number, string> = {
  1: "8%",
  2: "calc(27.6667% - 50px)",
  3: "calc(44.3333% - 50px)",
  4: "calc(61% - 50px)",
  5: "calc(77.6667% - 50px)",
  6: "calc(94.3333% - 50px)",
};

const platformPositions: Record<number, string> = {
  1: "8%",
  2: "calc(27.6667% - 50px)",
  3: "calc(44.3333% - 50px)",
  4: "calc(61% - 50px)",
  5: "calc(77.6667% - 50px)",
  6: "calc(94.3333% - 50px)",
};

const LoanDetail = () => {
  const [loanDetail, setLoanDetail] = useState<ILoanDetailData>();

  const [loading, setLoading] = useState<boolean>(false);

  const [animatedPlatform, setAnimatedPlatform] = useState<number>(0);

  const [trainLeft, setTrainLeft] = useState(initialTrainPosition);

  const { id } = useParams<RouteParams>();

  const rejectedLoanPlatforms = [
    { id: LoanStatusType.PENDING, name: "Pending", key: "pendingLoanAmount" },
    { id: LoanStatusType.APPLIED, name: "Applied", key: "loanAmount" },
    { id: LoanStatusType.REJECTED, name: "Rejected", key: "rejectedAmount" },
  ];

  const loanPlatforms = [
    { id: LoanStatusType.PENDING, name: "Pending", key: "pendingLoanAmount" },
    { id: LoanStatusType.APPLIED, name: "Applied", key: "loanAmount" },
    {
      id: LoanStatusType.QUERY_RAISED,
      name: "Query Raised",
      key: "queryRaisedAmount",
    },
    {
      id: LoanStatusType.SANCTIONED,
      name: "Sanctioned",
      key: "sanctionedAmount",
    },
    {
      id: LoanStatusType.PENDING_AT_CREDIT,
      name: "Pending At Credit",
      key: "pendingAtCreditAmount",
    },
    { id: LoanStatusType.DISBURSED, name: "Disbursed", key: "disbursedAmount" },
  ];

  const getCurrentPlatformFromData = (detail: ILoanDetailData) => {
    return detail?.status?.statusID || LoanStatusType.PENDING;
  };

  const fetchLoanDetailApi = async (): Promise<void> => {
    setLoading(true);
    if (!id) return;

    const params: ILoanParams = { loanAppID: id };
    const response: ILoanResponse = await getLoanDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setLoanDetail(response.data);

      setTimeout(() => {
        const platform = getCurrentPlatformFromData(response.data);
        setAnimatedPlatform(platform);
      }, 300);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleSanctionedLetterDownload = (): JSX.Element => {
    if (!loanDetail) return <></>;

    const sanctionedLetterUrl = loanDetail.sanctionLetterUrl;
    if (!sanctionedLetterUrl) return <>-</>;

    return (
      <div
        className="d-inline-flex align-items-center mt-2 cursor-pointer"
        onClick={() =>
          handleDownloadDocument(
            sanctionedLetterUrl,
            `${loanDetail.loanApplicationID}-sanction-letter`,
          )
        }
        style={{ gap: "8px" }}
      >
        <img
          src="/assets/images/download.svg"
          alt="download-icon"
          className="cursor-pointer"
          style={{ width: "18px", height: "18px" }}
          loading="lazy"
        />

        <span className="text-primary text-decoration-underline">
          Download Sanction Letter
        </span>
      </div>
    );
  };

  const getPlatformsToRender = () => {
    if (!loanDetail) return loanPlatforms;

    return loanDetail.status.statusID === LoanStatusType.REJECTED
      ? rejectedLoanPlatforms
      : loanPlatforms;
  };

  useEffect(() => {
    fetchLoanDetailApi();
  }, [id]);

  useEffect(() => {
    if (!loanDetail) return;

    const finalPlatform = getCurrentPlatformFromData(loanDetail);
    const isRejected = loanDetail.status.statusID === LoanStatusType.REJECTED;

    setTrainLeft(initialTrainPosition);

    setTimeout(() => {
      if (isRejected) {
        const rejectedStep = rejectedLoanPlatforms.length; // = 3

        setAnimatedPlatform(rejectedStep);
        setTrainLeft(rejectedTrainTargetPositions[rejectedStep]);
      } else {
        setAnimatedPlatform(finalPlatform);
        setTrainLeft(trainTargetPositions[finalPlatform]);
      }
    }, 300);
  }, [loanDetail]);

  if (!loanDetail) return <Loader isLoading={loading} />;

  return (
    <div className="row">
      <div className="col-lg-12 col-md-12 col-sm-12 col-12">
        <div className="whiteBoxHldr p-30">
          <div className="row">
            <div className="col-12">
              <h2 className="txt-24">Loan Details</h2>

              {/* Train Platform Animation */}
              <div className="modern-train-wrapper">
                <style>{`
  .modern-train-wrapper {
    margin: 40px 0;
    width: 100%;
    position: relative;
  }

  /* ---- TRACK ---- */
  .progress-track {
    position: relative;
    height: 8px;
    width: 100%;
    background: #e8e8e8;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.08);
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #ff7b41, #ff4d11);
    transition: width 1.3s ease-in-out;
    border-radius: 50px;
    box-shadow: 0 0 12px rgba(255, 99, 44, 0.4);
  }

  /* ---- TRAIN ICON ---- */
  .train-icon {
    position: absolute;
    top: -70px;     /* train sits perfectly above track */
    height: 100px;  /* BIG modern train */
    width: auto;
    transform: translateX(-50%);
    transition: left 1.3s ease-in-out;
    filter: drop-shadow(0 6px 8px rgba(0,0,0,0.25));
  }

  /* ---- STATIONS ---- */
  .station-container {
    display: flex;
    justify-content: space-between;
    margin-top: 45px;
  }

  .station {
    text-align: center;
    flex: 1;
  }

  .station-dot {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #cfcfcf;
    margin: 0 auto;
    transition: all 0.25s ease-in-out;
  }

  .station-dot.active {
    background: #ff632c;
    box-shadow: 0 0 10px rgba(255, 99, 44, 0.5);
    transform: scale(1.25);
  }

  .station-dot.completed {
    background: #ff7b41;
    transform: scale(1.1);
  }

  .station-label {
    margin-top: 8px;
    font-size: 13px;
    color: #444;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  /* ---- MOBILE ---- */
  @media (max-width: 600px) {
    .train-icon {
      height: 55px;
      top: -40px;
    }
    .station-label {
      font-size: 10px;
    }
    .station-dot {
      height: 14px;
      width: 14px;
    }
    .progress-track {
      height: 6px;
    }
  }
`}</style>

                <img
                  src="/assets/images/train.webp"
                  className="train-icon"
                  alt="train"
                  style={{
                    left: trainLeft,
                  }}
                />

                {/* Track */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        loanDetail.status.statusID === LoanStatusType.REJECTED
                          ? rejectedPlatformPositions[animatedPlatform]
                          : platformPositions[animatedPlatform],
                    }}
                  />
                </div>

                {/* Stations */}
                <div className="station-container">
                  {getPlatformsToRender().map((platform, idx) => {
                    const step = idx + 1;
                    const isCompleted = step < animatedPlatform;
                    const isActive = step === animatedPlatform;

                    return (
                      <div className="station" key={platform.id}>
                        <div
                          className={`station-dot ${
                            isCompleted ? "completed" : isActive ? "active" : ""
                          }`}
                        ></div>
                        <div className="station-label">{platform.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="row">
                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <h2 className="txt-24 mb-3">Loan Information</h2>
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Bank Name</b>
                        <p className="text-break">
                          {loanDetail.bankName ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Loan Type</b>
                        <p className="text-break">
                          {loanDetail.loanType ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Amount</b>
                        <p className="text-break">
                          {loanDetail.loanAmount
                            ? formatCurrencyAmount(loanDetail.loanAmount)
                            : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Rate of Interest</b>
                        <p className="text-break">
                          {loanDetail.rateOfInterest ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Co-Applicant Name 1</b>
                        <p className="text-break">
                          {loanDetail.coApplicantName1 ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Co-Applicant Name 2</b>
                        <p className="text-break">
                          {loanDetail.coApplicantName2 ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Reference Name 1</b>
                        <p className="text-break">
                          {loanDetail.referenceName1 ?? "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Reference Name 2</b>
                        <p className="text-break">
                          {loanDetail.referenceName2 ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <h2 className="txt-24 mb-3">Sanctioned Details</h2>
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Amount</b>
                        <p className="text-break">
                          {loanDetail.sanctionedAmount
                            ? formatCurrencyAmount(loanDetail.sanctionedAmount)
                            : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Date</b>
                        <p className="text-break">
                          {loanDetail.loanSanctionedDate
                            ? moment(loanDetail.loanSanctionedDate).format(
                                "DD MMM, YYYY",
                              )
                            : "-"}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Letter</b>
                        <p className="text-break">
                          {handleSanctionedLetterDownload()}
                        </p>
                      </div>

                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Comments</b>
                        <p className="text-break">
                          {loanDetail.loanSanctioncomments ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {loanDetail?.disbursedHistory?.length > 0 && (
                  <div className="col-12 mt-4">
                    <div className="borderBoxHldr p-24">
                      <h2 className="txt-24 mb-3">Disbursed Details</h2>

                      {loanDetail.disbursedHistory.map((disbursed, index) => (
                        <div key={index} className="borderBoxHldr p-4 mb-4">
                          <h5 className="mb-3">
                            Disbursed Details {index + 1}
                          </h5>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3">
                              <b>Amount</b>
                              <p className="text-break">
                                {disbursed.disbursedAmount
                                  ? formatCurrencyAmount(
                                      disbursed.disbursedAmount,
                                    )
                                  : "-"}
                              </p>
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3">
                              <b>Date</b>
                              <p className="text-break">
                                {disbursed.loanDisbursedDate
                                  ? moment(disbursed.loanDisbursedDate).format(
                                      "DD MMM, YYYY",
                                    )
                                  : "-"}
                              </p>
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3">
                              <b>Comments</b>
                              <p className="text-break">
                                {disbursed.loanDisbursementComment || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-4">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;

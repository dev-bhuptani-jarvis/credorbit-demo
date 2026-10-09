import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import TableTitle from '../../components/TableTitle';
import { toastError } from '../../utils/functions/shared';
import { DashboardType } from '../../utils/constants/enum';
import { getCommonDashboardForEducationAPI } from '../../utils/axios/apiServices';
import Loader from '../../components/Loader';
import {
  IEducationAdminDashboardApplicationOverview,
  IEducationAdminDashboardPaymentHistoryCards,
  IEducationAdminDashboardResponse
} from '../../interface/educationalAdminDashboard';

type INBFCDashboardCardItem = {
  title: string;
  value: number;
  icon: string;
  subtitle: string;
  loanApplicationStatus?: number;
  repaymentStatus?: string;
};

const NBFCDashboard = () => {
  const [nbfcSummaryMetrics, setNbfcSummaryMetrics] = useState<IEducationAdminDashboardApplicationOverview[]>([]);

  const [nbfcRepaymentMetrics, setNbfcRepaymentMetrics] = useState<IEducationAdminDashboardPaymentHistoryCards>();

  const [nbfcDashboardInfo, setNbfcDashboardInfo] = useState<IEducationAdminDashboardResponse["data"] | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchNBFCDashboardDetail = async (): Promise<void> => {
    setLoading(true);

    const body = {
      dashboardType: DashboardType.NBFC
    };

    const response: IEducationAdminDashboardResponse = await getCommonDashboardForEducationAPI(body);

    if (response.statusCode === 200) {
      setNbfcDashboardInfo(response.data);

      setNbfcSummaryMetrics(
        response.data.applicationOverview || [],
      );

      setNbfcRepaymentMetrics(
        response.data.paymentHistoryCards,
      );
    } else {
      toastError(response.message);
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchNBFCDashboardDetail();
  }, []);

  const statusIconMap: Record<string, string> = {
    "Total Applications": "bi-journal-check",
    Pending: "bi-hourglass-split",
    Applied: "bi-file-earmark-text",
    Sanctioned: "bi-patch-check",
    Disbursed: "bi-bank",
    Rejected: "bi-x-octagon",
    "Query Raised": "bi-question-circle",
  };

  const statusSubtitleMap: Record<string, string> = {
    "Total Applications": "All student applications currently handled by the Lender.",
    Pending: "Applications waiting for the next action from the Lender.",
    Applied: "Applications submitted and currently under processing.",
    Sanctioned: "Applications successfully moved to approval or sanction.",
    Disbursed: "Students who have already received Lender disbursals.",
    Rejected: "Applications that were declined during review or credit checks.",
    "Query Raised": "Applications where additional information has been requested.",
  };

  const nbfcSummaryCards = useMemo<INBFCDashboardCardItem[]>(
    () =>
      [...nbfcSummaryMetrics]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => ({
          title: item.displayName,
          value: item.noOfApplications,
          icon: statusIconMap[item.displayName] ?? "bi-bar-chart",
          subtitle:
            statusSubtitleMap[item.displayName] ??
            `${item.displayName} applications.`,
          loanApplicationStatus: item.statusID,
        })),
    [nbfcSummaryMetrics]
  );

  const nbfcRepaymentCards = useMemo<INBFCDashboardCardItem[]>(() => {
    const currentMonth = new Date().toLocaleString("en-US", {
      month: "short",
    });

    const repaymentCards =
      nbfcRepaymentMetrics?.monthly.currYear?.[currentMonth] ?? [];

    return [
      {
        title:
          repaymentCards.find((item) => item.title === "Ongoing")?.title ??
          "Ongoing",
        value:
          repaymentCards.find((item) => item.title === "Ongoing")?.loanCount ?? 0,
        icon: "bi-check-circle",
        subtitle: "Applications with repayments staying on schedule.",
        repaymentStatus:
          repaymentCards.find((item) => item.title === "Ongoing")?.title,
      },
      {
        title:
          repaymentCards.find((item) => item.title === "Delayed")?.title ??
          "Delayed",
        value:
          repaymentCards.find((item) => item.title === "Delayed")?.loanCount ?? 0,
        icon: "bi-exclamation-circle",
        subtitle: "Applications showing repayment delays that need follow-up.",
        repaymentStatus:
          repaymentCards.find((item) => item.title === "Delayed")?.title,
      },
      {
        title:
          repaymentCards.find((item) => item.title === "Overdue")?.title ??
          "Overdue",
        value:
          repaymentCards.find((item) => item.title === "Overdue")?.loanCount ?? 0,
        icon: "bi-clock-history",
        subtitle:
          "Applications with repayments overdue beyond the expected date.",
        repaymentStatus:
          repaymentCards.find((item) => item.title === "Overdue")?.title,
      },
    ];
  }, [nbfcRepaymentMetrics]);

  const totalApplications = nbfcDashboardInfo?.totalApplicationInInstitute ?? 0;

  const approvedOrSanctionedApplications = nbfcDashboardInfo?.totalSanctionedApplication ?? 0;

  const disbursedApplications = nbfcDashboardInfo?.totalDisbursedApplication ?? 0;

  return (
    <>
      <Loader isLoading={loading} />

      <div className="col-12 mb-4">
        <section
          className="admin-dashboard-hero admin-dashboard-hero--education"
          role="button"
          tabIndex={0}
        >
          <div className="admin-dashboard-hero__content">
            <div className="admin-dashboard-eyebrow">
              <i className="bi bi-bank2" />
              Lender Dashboard
            </div>
            <h1 className="admin-dashboard-hero__title">Students Loan Summary</h1>
            <p className="admin-dashboard-hero__copy">
              Monitor student applications, sanction progress, and repayment behaviour
              from one Lender-focused dashboard.
            </p>

            <div className="admin-dashboard-hero__chips">
              <div className="admin-dashboard-pill">
                <i className="bi bi-journal-check" />
                {totalApplications} applications in pipeline
              </div>
              <div className="admin-dashboard-pill">
                <i className="bi bi-bank" />
                {disbursedApplications} disbursed applications
              </div>
            </div>
          </div>

          <div className="admin-dashboard-hero__spotlight">
            <div className="admin-dashboard-spotlight-card">
              <div className="admin-dashboard-spotlight-card__label">
                Approved/Sanctioned
              </div>
              <div className="admin-dashboard-spotlight-card__value">
                {approvedOrSanctionedApplications}
              </div>
              <div className="admin-dashboard-spotlight-card__helper">
                Applications successfully moved to approval or sanction.
              </div>
            </div>

            <div className="admin-dashboard-spotlight-card">
              <div className="admin-dashboard-spotlight-card__label">
                Disbursed Applications
              </div>
              <div className="admin-dashboard-spotlight-card__value">
                {disbursedApplications}
              </div>
              <div className="admin-dashboard-spotlight-card__helper">
                Students who have already received Lender disbursals.
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="col-12 mb-4">
        <section className="admin-dashboard-metrics-grid admin-dashboard-metrics-grid--education">
          {nbfcSummaryCards.map((metric) => (
            <div
              key={metric.title}
              className="admin-dashboard-metric-card"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  `${RoutePathConstant.private.educationLoanApplications}?status=${metric.loanApplicationStatus}`,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(
                    `${RoutePathConstant.private.educationLoanApplications}?status=${metric.loanApplicationStatus}`,
                  )
                }
              }}
            >
              <div className="admin-dashboard-metric-card__icon">
                <i className={`bi ${metric.icon}`} />
              </div>
              <div className="admin-dashboard-metric-card__body">
                <div className="admin-dashboard-metric-card__title">{metric.title}</div>
                <div className="admin-dashboard-metric-card__value">{metric.value}</div>
                <div className="admin-dashboard-metric-card__subtitle">
                  {metric.subtitle}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="col-12 mb-4">
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-section-head">
            <div>
              <TableTitle title="Students Loan Summary" />
              <p className="admin-dashboard-section-copy mb-0">
                Current repayment health across Lender-managed student applications.
              </p>
            </div>
          </div>

          <div className="admin-dashboard-metrics-grid admin-dashboard-metrics-grid--education">
            {nbfcRepaymentCards.map((metric) => (
              <div
                key={metric.title}
                className="admin-dashboard-metric-card"
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(RoutePathConstant.private.educationNbfcStudentApplications, {
                    state: {
                      repaymentStatusFilter: metric.repaymentStatus,
                    },
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(RoutePathConstant.private.educationNbfcStudentApplications, {
                      state: {
                        repaymentStatusFilter: metric.repaymentStatus,
                      },
                    });
                  }
                }}
              >
                <div className="admin-dashboard-metric-card__icon">
                  <i className={`bi ${metric.icon}`} />
                </div>
                <div className="admin-dashboard-metric-card__body">
                  <div className="admin-dashboard-metric-card__title">{metric.title}</div>
                  <div className="admin-dashboard-metric-card__value">{metric.value}</div>
                  <div className="admin-dashboard-metric-card__subtitle">
                    {metric.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default NBFCDashboard

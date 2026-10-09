import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePathConstant } from '../../utils/constants/routePaths';
import { DashboardType, LoanStatusType } from '../../utils/constants/enum';
import { toastError } from '../../utils/functions/shared';
import { getCommonDashboardForEducationAPI } from '../../utils/axios/apiServices';
import Loader from '../../components/Loader';
import { IEducationAdminDashboardApplicationOverview, IEducationAdminDashboardResponse } from '../../interface/educationalAdminDashboard';

type IStudentMatrixItem = {
  title: string;
  value: number;
  icon: string;
  subtitle: string;
  path: string;
};

const StudentDashboard = () => {
  const [studentLoanDrafts, setStudentLoanDrafts] = useState<IEducationAdminDashboardApplicationOverview[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchStudentDashboardDetail = async (): Promise<void> => {
    setLoading(true);

    const body = {
      dashboardType: DashboardType.STUDENT
    };

    const response: IEducationAdminDashboardResponse = await getCommonDashboardForEducationAPI(body);

    if (response.statusCode === 200) {
      setStudentLoanDrafts(response?.data?.applicationOverview || []);
    } else {
      toastError(response.message);
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStudentDashboardDetail();
  }, []);

  const sanctionedStatuses = [
    LoanStatusType.SANCTIONED,
    LoanStatusType.DISBURSED,
  ];

  const otherStatuses = [
    LoanStatusType.PENDING,
    LoanStatusType.PENDING_AT_CREDIT,
    LoanStatusType.APPLIED,
    LoanStatusType.QUERY_RAISED,
    LoanStatusType.REJECTED,
  ];

  const studentMatrix = useMemo<IStudentMatrixItem[]>(() => {
    return [
      {
        title: studentLoanDrafts?.[0]?.displayName,
        value: studentLoanDrafts?.[0]?.noOfApplications || 0,
        icon: "bi-bank",
        subtitle: "Track all ongoing loan applications and their current status.",
        path: `${RoutePathConstant.private.educationLoanApplications}?status=${otherStatuses}`,
      },
      {
        title: studentLoanDrafts?.[1]?.displayName,
        value: studentLoanDrafts?.[1]?.noOfApplications || 0,
        icon: "bi-journal-text",
        subtitle: "View your sanctioned student loan records.",
        path: `${RoutePathConstant.private.educationLoanApplications}?status=${sanctionedStatuses}`,
      },
    ];
  }, [studentLoanDrafts]);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="col-12 mb-4">
        <section className="admin-dashboard-metrics-grid admin-dashboard-metrics-grid--education">

          {studentMatrix.map((metric) => (
            <div
              key={metric.title}
              className="admin-dashboard-metric-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(metric.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(metric.path);
                }
              }}
            >
              <div className="admin-dashboard-metric-card__icon">
                <i className={`bi ${metric.icon}`} />
              </div>
              <div className="admin-dashboard-metric-card__body">
                <div className="admin-dashboard-metric-card__title">{metric.title}</div>
                <div className="admin-dashboard-metric-card__value">{metric.value}</div>
                <div className="admin-dashboard-metric-card__subtitle">{metric.subtitle}</div>
              </div>
            </div>
          ))}

        </section>
      </div>
    </>
  )
}

export default StudentDashboard

import { lazy } from "react";
import { Navigate, Outlet, RouteObject } from "react-router-dom";
import { useSelector } from "react-redux";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { dashboardRoute } from "../utils/functions/appRuntime";
import { RootState } from "../store";

const PublicLayout = lazy(() => import("../layout/publicLayout"));
const PrivateLayout = lazy(() => import("../layout/privateLayout"));
const EducationalAdminDashboard = lazy(() => import("../pages/dashboard/EducationalAdminDashboard"));
const UserProfile = lazy(() => import("../layout/userProfile"));
const CongratulationsPage = lazy(() => import("../components/congratulations"));
const Supports = lazy(() => import("../pages/supports/Supports"));
const UserManagement = lazy(
  () => import("../pages/userManagement/UserManagement"),
);
const UserManagementDetail = lazy(
  () => import("../pages/userManagement/UserManagementDetail"),
);
const UserManagementRights = lazy(
  () => import("../pages/userManagement/UserManagementRights"),
);
const RoleMaster = lazy(() => import("../pages/roleMaster/RoleMaster"));
const RoleMasterDetail = lazy(
  () => import("../pages/roleMaster/RoleMasterDetail"),
);
const StudentFormData = lazy(() => import("../pages/educationPortal/StudentFormData"));
const ManageCourses = lazy(() => import("../pages/educationPortal/courses/ManageCourses"));
const ManageStudents = lazy(() => import("../pages/educationPortal/students/ManageStudents"));
const CourseDetail = lazy(() => import("../pages/educationPortal/courses/CourseDetail"));
const InstitueDashboard = lazy(() => import("../pages/dashboard/InstitueDashboard"));
const NBFCDashboard = lazy(() => import("../pages/dashboard/NBFCDashboard"));
const StudentDashboard = lazy(() => import("../pages/dashboard/StudentDashboard"));
const NbfcStudentApplicationDetail = lazy(() => import("../pages/nbfc/StudentApplicationDetail"));
const ManagedEducationInstitute = lazy(
  () => import("../pages/institutes/ManagedEducationInstitute"),
);
const ManagedNBFC = lazy(() => import("../pages/nbfc/ManagedNBFC"));
const NBFCDetail = lazy(() => import("../pages/nbfc/NBFCDetail"));
const EducationInstituteDetail = lazy(
  () => import("../pages/institutes/EducationInstituteDetail"),
);
const StudentDetail = lazy(() => import("../pages/educationPortal/students/StudentDetail"));
const LoanApplications = lazy(() => import("../pages/applyLoan/LoanApplications"));
const EducationLoanApplication = lazy(() => import("../pages/educationPortal/loanApplication/EducationLoanApplication"));
const GetCreditScoreForEducation = lazy(() => import("../pages/educationPortal/loanApplication/GetCreditScoreForEducation"));
const EducationBankDetails = lazy(() => import("../pages/educationPortal/loanApplication/EducationBankDetails"));
const StudentDetail360View = lazy(() => import("../pages/educationPortal/students/StudentDetail360View"));
const LoanMarketPlaceForEducationInstitute = lazy(() => import("../pages/educationPortal/loanApplication/LoanMarketPlace"));
const PrivacyPolicy = lazy(() => import("../pages/policy/PrivacyPolicy"));
const BreBuilderDetail = lazy(
  () => import("../pages/breBuilder/BreBuilderDetail"),
);
const BreBuilderListing = lazy(
  () => import("../pages/breBuilder/BreBuilderListing"),
);
const RunTimeLogsListing = lazy(
  () => import("../pages/breBuilder/RunTimeLogsListing"),
);
const RunTimeLogDetail = lazy(
  () => import("../pages/breBuilder/RunTimeLogDetail"),
);
const TermsConditions = lazy(
  () => import("../pages/termsConditions/TermsConditions"),
);
const NotificationPage = lazy(
  () => import("../pages/notification-page/notification-page"),
);
const Reports = lazy(() => import("../pages/reports/Report"));
const ReportDetails = lazy(() => import("../pages/reports/ReportDetails"));
const ManagedNBFCLoanApplications = lazy(() => import("../pages/nbfc/LoanApplications"))

const DashboardRouteRedirect = () => {
  const userType = useSelector((state: RootState) => state.user.user.userType);

  return <Navigate to={dashboardRoute(userType)} replace />;
};

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <PublicLayout />,
      },
      {
        path: RoutePathConstant.public.login,
        element: <PublicLayout />,
      },
      // {
      //   path: RoutePathConstant.public.register,
      //   element: <PublicLayout />,
      // },
      {
        path: RoutePathConstant.public.congratulations,
        element: <CongratulationsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
];

export const privateRoutes: RouteObject[] = [
  {
    path: "/",
    element: <PrivateLayout />,
    children: [
      {
        index: true,
        element: <PrivateLayout />,
      },
      {
        path: RoutePathConstant.private.dashboard,
        element: <EducationalAdminDashboard />,
      },
      {
        path: RoutePathConstant.private.profile,
        element: <UserProfile />,
      },
      {
        path: RoutePathConstant.private.support,
        element: <Supports />,
      },
      {
        path: RoutePathConstant.private.userManagement,
        element: <UserManagement />,
      },
      {
        path: RoutePathConstant.private.userManagementCreate,
        element: <UserManagementDetail />,
      },
      {
        path: RoutePathConstant.private.userManagementView,
        element: <UserManagementDetail />,
      },
      {
        path: RoutePathConstant.private.userManagementEdit,
        element: <UserManagementDetail />,
      },
      {
        path: RoutePathConstant.private.userManagementRights,
        element: <UserManagementRights />,
      },
      {
        path: RoutePathConstant.private.educationManageStudents,
        element: <ManageStudents />,
      },
      {
        path: RoutePathConstant.private.educationAddStudent,
        element: <StudentFormData />,
      },
      {
        path: RoutePathConstant.private.educationEditStudent,
        element: <StudentFormData />,
      },
      {
        path: RoutePathConstant.private.educationManageCourse,
        element: <ManageCourses />,
      },
      {
        path: RoutePathConstant.private.educationCourseDetail,
        element: <CourseDetail />,
      },
      {
        path: RoutePathConstant.private.institueDashboard,
        element: <InstitueDashboard />,
      },
      {
        path: RoutePathConstant.private.nbfcDashboard,
        element: <NBFCDashboard />,
      },
      {
        path: RoutePathConstant.private.studentDashboard,
        element: <StudentDashboard />,
      },
      {
        path: RoutePathConstant.private.educationNbfcStudentApplications,
        element: <LoanApplications />,
      },
      {
        path: RoutePathConstant.private.educationNbfcStudentApplicationDetail,
        element: <NbfcStudentApplicationDetail />,
      },
      {
        path: RoutePathConstant.private.roleMaster,
        element: <RoleMaster />,
      },
      {
        path: RoutePathConstant.private.roleMasterView,
        element: <RoleMasterDetail />,
      },
      {
        path: RoutePathConstant.private.roleMasterCreate,
        element: <RoleMasterDetail />,
      },
      {
        path: RoutePathConstant.private.roleMasterEdit,
        element: <RoleMasterDetail />,
      },
      {
        path: RoutePathConstant.private.educationManagedInstitute,
        element: <ManagedEducationInstitute />,
      },
      {
        path: RoutePathConstant.private.educationInstituteDetail,
        element: <EducationInstituteDetail />,
      },
      {
        path: RoutePathConstant.private.educationManagedNbfc,
        element: <ManagedNBFC />,
      },
      {
        path: RoutePathConstant.private.educationManagedNbfcDetail,
        element: <NBFCDetail />,
      },
      {
        path: RoutePathConstant.private.educationStudentDetail,
        element: <StudentDetail />,
      },
      {
        path: RoutePathConstant.private.educationLoanApplications,
        element: <LoanApplications />,
      },
      {
        path: RoutePathConstant.private.educationStudentLoanApplication,
        element: <EducationLoanApplication />,
      },
      {
        path: RoutePathConstant.private.educationStudentConsentVerification,
        element: <GetCreditScoreForEducation />,
      },
      {
        path: RoutePathConstant.private.educationStudentBankDetails,
        element: <EducationBankDetails />,
      },
      {
        path: RoutePathConstant.private.educationStudentDetail360ViewDetailed,
        element: <StudentDetail360View />,
      },
      {
        path: RoutePathConstant.private.loanMarketPlaceForEducationInstitute,
        element: <LoanMarketPlaceForEducationInstitute />,
      },
      {
        path: RoutePathConstant.private.breBuilderDetail,
        element: <BreBuilderDetail />,
      },
      {
        path: RoutePathConstant.private.policy,
        element: <PrivacyPolicy />,
      },
      {
        path: RoutePathConstant.private.termsConditions,
        element: <TermsConditions />,
      },
      {
        path: RoutePathConstant.private.breBuilder,
        element: <BreBuilderListing />,
      },
      {
        path: RoutePathConstant.private.runTimeLogs,
        element: <RunTimeLogsListing />,
      },
      {
        path: RoutePathConstant.private.runTimeLogsDetails,
        element: <RunTimeLogDetail />,
      },
      {
        path: RoutePathConstant.private.notification,
        element: <NotificationPage />,
      },
      {
        path: RoutePathConstant.private.reports,
        element: <Reports />,
      },
      {
        path: RoutePathConstant.private.reportDetails,
        element: <ReportDetails />,
      },
      {
        path: RoutePathConstant.private.educationManagedNbfcLoanApplications,
        element: <ManagedNBFCLoanApplications />,
      },
      {
        path: "*",
        element: <DashboardRouteRedirect />,
      },
    ],
  },
];

import { lazy } from "react";
import { Navigate, Outlet, RouteObject } from "react-router-dom";
import { RoutePathConstant } from "../utils/constants/routePaths";
import ChannelPartnerDetail from "../pages/userMaster/ChannelPartnerDetail";
import NotificationPage from "../pages/notification-page/notification-page";

const PublicLayout = lazy(() => import("../layout/publicLayout"));
const PrivateLayout = lazy(() => import("../layout/privateLayout"));
const AdminDashboard = lazy(() => import("../pages/dashboard/AdminDashboard"));
const ChannelPartnerManagement = lazy(
  () => import("../pages/userMaster/ChannelPartnerManagement"),
);
const UserProfile = lazy(() => import("../pages/profile/Profile"));
const CongratulationsPage = lazy(() => import("../components/congratulations"));
const ClientDetail = lazy(() => import("../pages/userMaster/ClientDetail"));
const LoanDetail = lazy(() => import("../pages/userMaster/LoanDetail"));
const SourcingPartnerDetail = lazy(
  () => import("../pages/userMaster/SourcingPartnerDetail"),
);
const ClientDashboard = lazy(
  () => import("../pages/dashboard/ClientDashboard"),
);
const SourcingPartner = lazy(
  () => import("../pages/userMaster/SourcingPartner"),
);
const ClientMaster = lazy(() => import("../pages/userMaster/ClientMaster"));
const RoleMaster = lazy(() => import("../pages/roleMaster/RoleMaster"));
const RoleMasterDetail = lazy(
  () => import("../pages/roleMaster/RoleMasterDetail"),
);
const ChannelPartnerDashboard = lazy(
  () => import("../pages/dashboard/ChannelPartnerDashboard"),
);
const PayOuts = lazy(() => import("../pages/payOuts/Payouts"));
const PayoutsDetail = lazy(() => import("../pages/payOuts/PayoutsDetail"));
const ContractChannelPartner = lazy(
  () => import("../pages/contracts/ContractChannelPartner"),
);
const ContractSourcingPartner = lazy(
  () => import("../pages/contracts/ContractSourcingPartner"),
);
const ContractClient = lazy(() => import("../pages/contracts/ContractClient"));
const PrivacyPolicy = lazy(() => import("../pages/policy/PrivacyPolicy"));
const Supports = lazy(() => import("../pages/supports/Supports"));
const ApplyLoan = lazy(() => import("../pages/applyLoan/ApplyLoan"));
const Documents = lazy(() => import("../pages/documents/Documents"));
const LoanMarketPlace = lazy(
  () => import("../pages/applyLoan/LoanMarketPlace"),
);
const CheckEligibility = lazy(
  () => import("../pages/applyLoan/checkEligibilty/CheckEligibility"),
);
const TermsConditions = lazy(
  () => import("../pages/termsConditions/TermsConditions"),
);
const AddApplication = lazy(() => import("../pages/applyLoan/AddApplication"));
const UserManagement = lazy(
  () => import("../pages/userManagement/UserManagement"),
);
const UserManagementDetail = lazy(
  () => import("../pages/userManagement/UserManagementDetail"),
);
const SourcingPartnerPayout = lazy(
  () => import("../pages/payOuts/SourcingPartnerPayout"),
);
const SourcingPartnerPayoutsDetail = lazy(
  () => import("../pages/payOuts/SourcingPartnerPayoutsDetail"),
);
const UserManagementRights = lazy(
  () => import("../pages/userManagement/UserManagementRights"),
);
const ChannelPartnerReports = lazy(
  () => import("../pages/reports/ChannelPartnerReports"),
);
const GeographicalReports = lazy(
  () => import("../pages/reports/GeographicalReports"),
);
const IncomeTaxReport = lazy(
  () => import("../pages/documents/IncomeTaxReport"),
);
const GstReport = lazy(() => import("../pages/documents/GstReport"));
const BankingAnalyticsReport = lazy(
  () => import("../pages/documents/BankingAnalyticsReport"),
);
const Subscription = lazy(() => import("../pages/subscription/Subscription"));
const Reports = lazy(() => import("../pages/reports/Report"));
const ReportDetails = lazy(() => import("../pages/reports/ReportDetails"));
const ClientReport = lazy(() => import("../pages/reports/ClientReport"));
const DocumentFolder = lazy(() => import("../pages/documents/DocumentFolder"));
const PolicyPage = lazy(() => import("../pages/policy/PublicPolicy"));
const TermsConditionsPage = lazy(() => import("../pages/policy/PublicPolicy"));
const ClientPolicyPage = lazy(() => import("../pages/policy/PublicPolicy"));
const ChannelPartnerPolicyPage = lazy(
  () => import("../pages/policy/PublicPolicy"),
);
const BankDetails = lazy(
  () => import("../pages/applyLoan/checkEligibilty/BankDetails"),
);
const DocumentFileList = lazy(
  () => import("../pages/documents/DocumentFileList"),
);
const DeleteAccount = lazy(() => import("../pages/auth/DeleteAccont"));
const Wallet = lazy(() => import("../pages/wallet/wallet"));
const ManagedEducationInstitute = lazy(
  () => import("../pages/educationPortal/ManagedEducationInstitute"),
);
const ManagedNBFC = lazy(() => import("../pages/educationPortal/ManagedNBFC"));
const EducationInstituteDetail = lazy(
  () => import("../pages/educationPortal/EducationInstituteDetail"),
);
const ManageCourses = lazy(() => import("../pages/educationPortal/ManageCourses"));
const CourseDetail = lazy(() => import("../pages/educationPortal/CourseDetail"));
const ManageStudents = lazy(() => import("../pages/educationPortal/ManageStudents"));
const StudentDetail = lazy(() => import("../pages/educationPortal/StudentDetail"));
const EducationLoanApplication = lazy(
  () => import("../pages/educationPortal/EducationLoanApplication"),
);
const EducationLoanOffer = lazy(
  () => import("../pages/educationPortal/EducationLoanOffer"),
);
const EducationLoanOfferKfs = lazy(
  () => import("../pages/educationPortal/EducationLoanOfferKfs"),
);
const StudentEnrolledCourses = lazy(
  () => import("../pages/educationPortal/StudentEnrolledCourses"),
);
const StudentEnrolledCourseDetail = lazy(
  () => import("../pages/educationPortal/StudentEnrolledCourseDetail"),
);

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
      {
        path: RoutePathConstant.public.register,
        element: <PublicLayout />,
      },
      {
        path: RoutePathConstant.public.congratulations,
        element: <CongratulationsPage />,
      },
      {
        path: RoutePathConstant.public.policy,
        element: <PolicyPage />,
      },
      {
        path: RoutePathConstant.public.termsConditions,
        element: <TermsConditionsPage />,
      },
      {
        path: RoutePathConstant.public.clientPolicy,
        element: <ClientPolicyPage />,
      },
      {
        path: RoutePathConstant.public.channelPartnerPolicy,
        element: <ChannelPartnerPolicyPage />,
      },
      {
        path: RoutePathConstant.public.deleteAccount,
        element: <DeleteAccount />,
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
        element: <AdminDashboard />,
      },
      {
        path: RoutePathConstant.private.clientDashboard,
        element: <ClientDashboard />,
      },
      {
        path: RoutePathConstant.private.channelPartnerDashboard,
        element: <ChannelPartnerDashboard />,
      },
      {
        path: RoutePathConstant.private.userMasterChannelPartner,
        element: <ChannelPartnerManagement />,
      },
      {
        path: RoutePathConstant.private.profile,
        element: <UserProfile />,
      },
      {
        path: RoutePathConstant.private.channelPartnerDetail,
        element: <ChannelPartnerDetail />,
      },
      {
        path: RoutePathConstant.private.clientDetail,
        element: <ClientDetail />,
      },
      {
        path: RoutePathConstant.private.loanDetails,
        element: <LoanDetail />,
      },
      {
        path: RoutePathConstant.private.sourcingPartnerDetail,
        element: <SourcingPartnerDetail />,
      },
      {
        path: RoutePathConstant.private.userMasterSourcingPartner,
        element: <SourcingPartner />,
      },
      {
        path: RoutePathConstant.private.userMasterClientMaster,
        element: <ClientMaster />,
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
        path: RoutePathConstant.private.payouts,
        element: <PayOuts />,
      },
      {
        path: RoutePathConstant.private.payoutsDetail,
        element: <PayoutsDetail />,
      },
      {
        path: RoutePathConstant.private.contractChannelMaster,
        element: <ContractChannelPartner />,
      },
      {
        path: RoutePathConstant.private.contractSourcingPartner,
        element: <ContractSourcingPartner />,
      },
      {
        path: RoutePathConstant.private.contractClient,
        element: <ContractClient />,
      },
      {
        path: RoutePathConstant.private.policy,
        element: <PrivacyPolicy />,
      },
      {
        path: RoutePathConstant.private.support,
        element: <Supports />,
      },
      {
        path: RoutePathConstant.private.applyLoan,
        element: <ApplyLoan />,
      },
      {
        path: RoutePathConstant.private.editLoanDetail,
        element: <ApplyLoan />,
      },
      {
        path: RoutePathConstant.private.loanMarketPlace,
        element: <LoanMarketPlace />,
      },
      {
        path: RoutePathConstant.private.checkEligibility,
        element: <CheckEligibility />,
      },
      {
        path: RoutePathConstant.private.termsConditions,
        element: <TermsConditions />,
      },
      {
        path: RoutePathConstant.private.addApplications,
        element: <AddApplication />,
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
        path: RoutePathConstant.private.channelPartnerReport,
        element: <ChannelPartnerReports />,
      },
      {
        path: RoutePathConstant.private.geographicalReport,
        element: <GeographicalReports />,
      },
      {
        path: RoutePathConstant.private.sourcingPartnerPayouts,
        element: <SourcingPartnerPayout />,
      },
      {
        path: RoutePathConstant.private.sourcingPartnerPayoutsDetail,
        element: <SourcingPartnerPayoutsDetail />,
      },
      {
        path: RoutePathConstant.private.incomeTaxReport,
        element: <IncomeTaxReport />,
      },
      {
        path: RoutePathConstant.private.gstReport,
        element: <GstReport />,
      },
      {
        path: RoutePathConstant.private.bankingAnalyticsReport,
        element: <BankingAnalyticsReport />,
      },
      {
        path: RoutePathConstant.private.subscription,
        element: <Subscription />,
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
        path: RoutePathConstant.private.clientReports,
        element: <ClientReport />,
      },
      {
        path: RoutePathConstant.private.documents,
        element: <Documents />,
      },
      {
        path: RoutePathConstant.private.documentId,
        element: <DocumentFolder />,
      },
      {
        path: RoutePathConstant.private.subDocumentId,
        element: <DocumentFileList />,
      },
      {
        path: RoutePathConstant.private.bankDetails,
        element: <BankDetails />,
      },
      {
        path: RoutePathConstant.private.wallet,
        element: <Wallet />,
      },
      {
        path: RoutePathConstant.private.notification,
        element: <NotificationPage />,
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
        path: RoutePathConstant.private.educationManageCourse,
        element: <ManageCourses />,
      },
      {
        path: RoutePathConstant.private.educationCourseDetail,
        element: <CourseDetail />,
      },
      {
        path: RoutePathConstant.private.educationManageStudents,
        element: <ManageStudents />,
      },
      {
        path: RoutePathConstant.private.educationStudentDetail,
        element: <StudentDetail />,
      },
      {
        path: RoutePathConstant.private.educationStudentLoanApplication,
        element: <EducationLoanApplication />,
      },
      {
        path: RoutePathConstant.private.educationStudentLoanOffer,
        element: <EducationLoanOffer />,
      },
      {
        path: RoutePathConstant.private.educationStudentLoanOfferKfs,
        element: <EducationLoanOfferKfs />,
      },
      {
        path: RoutePathConstant.private.studentEnrolledCourses,
        element: <StudentEnrolledCourses />,
      },
      {
        path: RoutePathConstant.private.studentEnrolledCourseDetail,
        element: <StudentEnrolledCourseDetail />,
      },
      {
        path: "*",
        element: <Navigate to={RoutePathConstant.private.dashboard} />,
      },
    ],
  },
];

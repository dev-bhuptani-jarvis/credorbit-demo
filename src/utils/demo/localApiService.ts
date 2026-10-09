import instituteDashboardResponse from "./instituteDashboard.json";
import { generateDemoPublicToken, sendDemoOTP, verifyDemoOTP, verifyDemoReferralCode } from "./demoAuth";
import { getDemoImpersonateUser } from "./demoClient";
import { getDemoUserProfileByContext } from "./demoProfile";
import { getAdminAllData, getDemoAdminDashboard, getDemoApplyForLoan, getDemoBankingAnalyticsDetails, getDemoDocumentStatus, getDemoGstDetails, getDemoInstitutionList, getDemoItrDetails, getDemoLoanMarketplace, getDemoNBFCLoanMarketplace, getDemoProceedForCreditReport, getDemoSendOtpForCreditReport, getDemoVerifyOtpAndGenerateReport } from "./demoReports";
import { getDemoClientMaster, getDemoCpSpList, getDemoLoanApplications, getDemoLoanTypeList, getDemoPanDetails, getDemoPincode, getDemoRoleDetail, getDemoRoleMasterList, getDemoStates, getDemoUserManagementList, getDemoUserNotifications, logoutDemoUser } from "./demoPortal";
import { getDemoContent, getDemoSupportData } from "./demoContent";
import { createEducationCourse, getEducationCourseById, getEducationCourses, updateEducationCourse } from "./demoEducationCourses";
import { createEducationInstitute, getEducationAuthorizedPersonPanPreview, getEducationInstituteById, getEducationInstitutePanPreview, getEducationInstitutes, toggleEducationInstituteStatus, updateEducationInstitute } from "./demoEducationInstitutes";
import { createEducationStudent, getEducationStudentById, getEducationStudents, updateEducationStudent } from "./demoEducationStudents";
import { completeEducationLoanApplication, createEducationLoanDraft, getEducationLoanDraftById, getEducationLoanDrafts, getNbfcEducationLoanApplications, updateNbfcEducationLoanApplicationStatus } from "./demoEducationLoanFlow";
import { createNbfcInstitute, getNbfcAuthorizedPersonPanPreview, getNbfcInstituteById, getNbfcInstitutePanPreview, getNbfcInstitutes, updateNbfcInstitute } from "./demoNbfcInstitutes";

type LocalResponse = { status: boolean; statusCode: number; message: string; data: any };

const defaultResponse = (): LocalResponse => ({ status: true, statusCode: 200, message: "Demo response loaded locally.", data: {} });
const asResponse = (value: any): any => value && typeof value === "object" && "status" in value ? value : { status: true, statusCode: 200, message: "Demo response loaded locally.", data: value ?? {} };
const requestData = (args: unknown[]): any => {
  const first = args[0] as { params?: unknown } | undefined;
  return first && typeof first === "object" && "params" in first ? first.params : first;
};

// Existing Demo fixtures win. Endpoints without a prior fixture get a local success response.
// No branch here creates an HTTP request.
const resolveResponse = async (url: string, args: unknown[]): Promise<any> => {
  const body = requestData(args) as any;
  const id = body?.id || body?.courseID || body?.instituteID || body?.studentID || body?.educationalInstituteID;

  if (url.includes("/LoanApplication/getDashboardData")) return instituteDashboardResponse;
  if (url.includes("/Auth/generatePublicToken")) return generateDemoPublicToken();
  if (url.includes("/Auth/sendOtp")) return sendDemoOTP(body);
  if (url.includes("/Auth/verifyEmailOTP")) return verifyDemoOTP(body);
  if (url.includes("/Referral/verifyReferralCode")) return verifyDemoReferralCode(body?.referralCode || "");
  if (url.includes("/ContentManagement/getContentByPageName")) return getDemoContent(body);
  if (url.includes("/ContentManagement/getSupportData")) return getDemoSupportData();
  if (url.includes("/ContentManagement/getLoanTypeList")) return getDemoLoanTypeList();
  if (url.includes("/Pan/fetchUserDetailsByPan")) return getDemoPanDetails();
  if (url.includes("/UserMaster/getUserProfile")) return getDemoUserProfileByContext(null, null, false);
  if (url.includes("/Auth/logout")) return logoutDemoUser();
  if (url.includes("/LoanApplication/getAllLoanApplications")) return getDemoLoanApplications(body);
  if (url.includes("/RolesAndRights/getAllRoles")) return getDemoRoleMasterList();
  if (url.includes("/RolesAndRights/viewRole")) return getDemoRoleDetail();
  if (url.includes("/Client/getAllClients")) return getDemoClientMaster(body);
  if (url.includes("/Client/getStatesList")) return getDemoStates();
  if (url.includes("/UserMaster/getCpSpList")) return getDemoCpSpList();
  if (url.includes("/UserMaster/getUserManagementList")) return getDemoUserManagementList();
  if (url.includes("/UserNotifications/getUserNotificationList")) return getDemoUserNotifications();
  if (url.includes("/Reports/getInstitutionList")) return getDemoInstitutionList();
  if (url.includes("/LoanApplication/getAdminDashboard")) return getDemoAdminDashboard();
  if (url.includes("/LoanApplication/getAdminAllData")) return getAdminAllData();
  if (url.includes("/CreditAnalytics/sendOtpForCreditReport")) return getDemoSendOtpForCreditReport();
  if (url.includes("/CreditAnalytics/verifyOtpAndGenerateReport")) return getDemoVerifyOtpAndGenerateReport();
  if (url.includes("/CreditAnalytics/proceedForCreditReport")) return getDemoProceedForCreditReport();
  if (url.includes("/Reports/getApplyForLoan")) return getDemoApplyForLoan();
  if (url.includes("/Reports/getGstDetails")) return getDemoGstDetails();
  if (url.includes("/Reports/getItrDetails")) return getDemoItrDetails();
  if (url.includes("/Reports/getBankingAnalyticsDetails")) return getDemoBankingAnalyticsDetails();
  if (url.includes("/Reports/getLoanMarketPlace")) return getDemoLoanMarketplace();
  if (url.includes("/Reports/getNBFCLoanMarketPlace")) return getDemoNBFCLoanMarketplace();
  if (url.includes("/Reports/getDocumentStatus")) return getDemoDocumentStatus();
  if (url.includes("/UserMaster/GetDataByPincode")) return getDemoPincode();
  if (url.includes("/Auth/impersonateUser")) return getDemoImpersonateUser();

  if (url.includes("/EducationalInstituteCourse/GetAll")) return asResponse(getEducationCourses());
  if (url.includes("/EducationalInstituteCourse/GetEducationalInstituteCourseDetails")) return asResponse(getEducationCourseById(id));
  if (url.includes("/EducationalInstituteCourse/create")) return asResponse(createEducationCourse(body));
  if (url.includes("/EducationalInstituteCourse/update")) return asResponse(updateEducationCourse(id, body));
  if (url.includes("/EducationalInstitute/getAlleducationalinstitutelist")) return asResponse(getEducationInstitutes());
  if (url.includes("/EducationalInstitute/geteducationalinstitutedetail")) return asResponse(getEducationInstituteById(id));
  if (url.includes("/EducationalInstitute/addeducationalinstitute")) return asResponse(createEducationInstitute(body));
  if (url.includes("/EducationalInstitute/updateeducationalinstitute")) return asResponse(updateEducationInstitute(id, body));
  if (url.includes("/EducationalInstitute/activeInactiveEducationalInstitute")) return asResponse(toggleEducationInstituteStatus(id, Boolean(body?.isActive)));
  if (url.includes("/EducationalInstitute/fetchMobilePrefill")) return asResponse(getEducationInstitutePanPreview(body?.panNumber || body?.pan || ""));
  if (url.includes("/EducationalInstitute/fetchAuthorizedPerson")) return asResponse(getEducationAuthorizedPersonPanPreview(body?.panNumber || body?.pan || ""));
  if (url.includes("/NBFCUser/getAllNBFCUserlist")) return asResponse(getNbfcInstitutes());
  if (url.includes("/NBFCUser/getNBFCUserdetail")) return asResponse(getNbfcInstituteById(id));
  if (url.includes("/NBFCUser/addNBFCUser")) return asResponse(createNbfcInstitute(body));
  if (url.includes("/NBFCUser/updateNBFCUser")) return asResponse(updateNbfcInstitute(id, body));
  if (url.includes("/NBFCUser/fetchMobilePrefill")) return asResponse(getNbfcInstitutePanPreview(body?.panNumber || body?.pan || ""));
  if (url.includes("/NBFCUser/fetchAuthorizedPerson")) return asResponse(getNbfcAuthorizedPersonPanPreview(body?.panNumber || body?.pan || ""));
  if (url.includes("/Student/GetAllStudents")) return asResponse(getEducationStudents());
  if (url.includes("/Student/GetStudentDetail")) return asResponse(getEducationStudentById(id));
  if (url.includes("/Student/addStudentWithoutOtp")) return asResponse(createEducationStudent(body));
  if (url.includes("/Student/updateStudent")) return asResponse(updateEducationStudent(id, body));
  if (url.includes("/NBFCLoanApplicationManagement/listAllLoanApplications")) return asResponse(getNbfcEducationLoanApplications());
  if (url.includes("/NBFCLoanApplicationManagement/addLoanApplication")) return asResponse(createEducationLoanDraft(body));
  if (url.includes("/NBFCLoanApplicationManagement/UpdateEducationLoanStatus")) return asResponse(updateNbfcEducationLoanApplicationStatus(id, body));
  if (url.includes("/EducationalInstitute/getStudentLoanDetail")) return asResponse(getEducationLoanDraftById(id));
  if (url.includes("/LoanApplication/getEduPortalLoanApplications")) return asResponse(getEducationLoanDrafts());
  if (url.includes("/LoanApplication/submitApplicationToBankForEducationalInstitute")) return asResponse(completeEducationLoanApplication(id));

  return defaultResponse();
};

const respond = (url: string, args: unknown[]): Promise<any> => resolveResponse(url, args);
export const localApi = {
  get: (url: string, ...args: unknown[]) => respond(url, args),
  post: (url: string, ...args: unknown[]) => respond(url, args),
  put: (url: string, ...args: unknown[]) => respond(url, args),
  delete: (url: string, ...args: unknown[]) => respond(url, args),
  patch: (url: string, ...args: unknown[]) => respond(url, args),
};

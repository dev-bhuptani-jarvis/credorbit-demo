import { getDecryptedSessionStorage } from "../functions/sessionStorage";
import {
  IGeneratePublicTokenRequest,
  IGeneratePublicTokenResponse,
} from "../../interface/publicToken";
import {
  IVerifyEmailOTPRequest,
  IVerifyEmailOTPResponse,
} from "../../interface/otpRequest";
import {
  IChannelPartnerDetailResponse,
  IChannelPartnerListParams,
  IChannelPartnerParams,
  IChannelPartnerResponse,
} from "../../interface/channelPartner";
import {
  OnlyPanNumber,
  IAddPanCardResponse,
} from "../../interface/panCardResponse";
import {
  IDeleteUser,
  IGSTListInfo,
  IPincodeFetchDetailsResponse,
  IUpdateAadhaarBody,
  IUserProfileResponse,
} from "../../interface/userData";
import { APIResponseEntity } from "../../interface/apiResponse";
import {
  IGetNotificationResponse,
  INotificationBody,
} from "../../interface/notifications";
import { ILogoutResponse } from "../../interface/logout";
import {
  IClientPartnerParams,
  IClientResponse,
  IFetchCreditScoreBody,
  IGetPartnerListResponse,
  IPartnerParams,
  IResendOTPCreditScoreBody,
} from "../../interface/client";
import {
  ILoanParams,
  ILoanResponse,
  ILoanTypeListResponse,
  IUpdateLoanStatus,
  IUpdateLoanStatusResponse,
} from "../../interface/loanDetail";
import {
  ISourcingPartnerDetailsResponse,
  ISourcingPartnerListParams,
  ISourcingPartnerParams,
  ISourcingPartnerResponse,
} from "../../interface/sourcingPartner";
import {
  IClientMasterListingParams,
  IClientMasterResponse,
} from "../../interface/clientMaster";
import { IAdminAllDataResponse, IAdminDashboardFilterBody, IAdminDashboardResponse } from "../../interface/adminDashboard";
import {
  IClientDashboardResponse,
  ICreditAnalyticsResponse,
} from "../../interface/clientDashboard";
import {
  IRoleDetailData,
  IRoleDetailResponse,
  IRoleMasterListParams,
  IRoleMasterResponse,
  IRoleParams,
} from "../../interface/roleMaster";
import {
  IChannelPartnerDashboardResponse,
  IGetAllLoanApplicationsResponse,
  ILoanApplicationParams,
} from "../../interface/channelPartnerDashboard";
import {
  ICreatePayOutsRequestParams,
  IFetchStateResponse,
  IGenerateCpPayoutInvoiceParams,
  IGenerateCpPayoutInvoiceResponse,
  IGenerateSpPayoutInvoiceParams,
  IGenerateSpPayoutInvoiceResponse,
  IGenerateSubscriptionInvoiceParams,
  IGenerateSubscriptionInvoiceResponse,
  IPayOutsDetailParams,
  IPayOutsDetailResponse,
  IPayOutsParams,
  IPayOutsResponse,
  IPayOutsUpdateStatusParams,
  ISourcingPartnerPayOutDetailParams,
  ISourcingPartnerPayOutDetailResponse,
  ISourcingPartnerPayOutsParams,
  ISourcingPartnerPayOutsResponse,
} from "../../interface/payOuts";
import {
  IAadharCardResponse,
  IContractListParams,
  IContractListResponse,
  IContractParams,
  IContractResponse,
  IUpdatedContractBody,
  IUpdatedContractStatusBody,
  IUserListForAdminContractListResponse,
  OnlyAadharNumber,
} from "../../interface/contract";
import {
  ISupportDataResponse,
  IUpdateSupportData,
} from "../../interface/supportData";
import { StorageKeyEnum } from "../constants/enum";
import {
  IInstitutionListResponse,
  IReUploadedDocumentResponse,
  IUploadBankDocumentResponse,
  UploadRequestBody,
} from "../../interface/bankDetail";
import {
  IAddLoanApplication,
  IApplyLoanApplicationResponse,
  IGetApplyForLoanParams,
  IGetApplyForLoanResponse,
  ISubmitCoApplicant,
  ISubmitLoanApplicationToBankResponse,
} from "../../interface/applyLoan";
import {
  ICreateEducationLoanDraftBody,
  ICreateEducationLoanDraftResponse,
  IEducationCourse,
  IEducationStudent,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import {
  IGetAddEditRoleUserResponse,
  IGetUserRightsForUserManagementResponse,
  ISaveUserDetailData,
  IUpdateUserRightBodyData,
  IUserDataResponse,
  IUserMasterListParams,
} from "../../interface/userManagement";
import {
  IBankingAnalyticsReportResponse,
  IChannelPartnerClientReportDetailResponse,
  IChannelPartnerClientReportResponse,
  IChannelPartnerReportParams,
  IClientDetailListParams,
  IGeographicalReportResponse,
  IGSTReportResponse,
  IExternalReportResponse,
  IITRReportBody,
  IITRReportResponse,
  IReportParams,
  IReportResponse,
  IShareLinkITRReportBody,
  IGenerateGstReportUsingLinkBodyForOTP,
  IGenerateGstReportUsingLinkBodyForPassword,
  IGenerateGstReportShareLink,
  IValidateGSTReportResponse,
} from "../../interface/reports";
import {
  IGSTGenerateOTPBody,
  IGSTGenerateOTPResponse,
  IGSTValidateReportBody,
  IGSTVerifyOTPBody,
} from "../../interface/checkEligibility";
import {
  IDocumentListDetailResponse,
  IDocumentListResponse,
  IGetSecureUnsecureDocumentListResponse,
  IMoveDocumentBody,
} from "../../interface/document";
import {
  ILoanMarketPlacePayload,
  ILoanMarketResponse,
} from "../../interface/loanMarketPlace";
import { IAddCreditsBody, IFetchAllPaymentsResponse, IFetchTabWiseUserListingResponse, IPaginateReqEntityForFetchUserTabWise, IPaginateReqEntityForSubscription, ISubscriptionBody, ISubscriptionListingResponse, ISubscriptionPlanListingResponse, ISubscriptionResponse, ISubscriptionUsageResponse } from "../../interface/subscription";
import { ISendOTPResponse } from "../../interface/signIn";
import { IIsProceedForCamReportResponse, IIsProceedForCreditReportResponse, IRefferalCodeResponse, IRefferalDataResponse, IRefferalListingResponse, IWalletListingResponse } from "../../interface/wallet";
import { PaginateReqEntity } from "../../interface/pagination";
import {
  generateDemoPublicToken,
  sendDemoOTP,
  verifyDemoOTP,
  verifyDemoReferralCode,
} from "../demo/demoAuth";
import {
  getDemoClientDashboard,
  getDemoImpersonateStudent,
  getDemoImpersonateUser,
} from "../demo/demoClient";
import { getDemoUserProfileByContext } from "../demo/demoProfile";
import { getAdminAllData, getDemoCpReportDetailByClientId, getGstReportForLinkApproach, updateAadhar, updateGstDetails } from "../demo/demoReports";
import {
  getDemoAddPanForCP,
  getDemoAdminChannelPartnerReport,
  getDemoAdminDashboard,
  getDemoAdminGeographicalReport,
  getDemoChannelPartnerDetail,
  getDemoApplyForLoan,
  getDemoBankingAnalyticsDetails,
  getDemoChannelPartnerListing,
  getDemoCreateSpPaymentRequest,
  getDemoDeleteReuploadLoanDocument,
  getDemoDeleteRole,
  getDemoDeleteUploadRemainingDocuments,
  getDemoDocumentDetails,
  getDemoDocumentStatus,
  getDemoFileAutomatedRequestForItr,
  getDemoFileAutomatedRequestForItrUsingLink,
  getDemoGenerateAadharOtp,
  getDemoGenerateGstReport,
  getDemoGenerateItrReport,
  getDemoGstReportGenerateOtp,
  getDemoGstReportGenerateOtpUsingLink,
  getDemoGstReportVerifyOtp,
  getDemoGstReportViaPasswordUsingLink,
  getDemoFetchUserTabwise,
  getDemoFetchAllPayments,
  getDemoGstDetails,
  getDemoGenerateSubscriptionInvoice,
  getDemoItrDetails,
  getDemoInstitutionList,
  getDemoLoanMarketplace,
  getDemoProceedForCamReport,
  getDemoProceedForCreditReport,
  getDemoSecureUnsecureDocumentList,
  getDemoSendOtpForCreditReport,
  getDemoSubfolderDetails,
  getDemoSubmitApplicationToBank,
  getDemoSubmitApplyForLoan,
  getDemoSubmitUserRightsForUserManagement,
  getDemoUploadedBankDocuments,
  getDemoUploadAllDocuments,
  getDemoUploadBankStatementFiles,
  getDemoUploadLoanDocuments,
  getDemoUpdateLoanApplicationAmount,
  getDemoUpdatePayout,
  getDemoUserRightsForUserManagement,
  getDemoValidateBankStatementFiles,
  getDemoValidateGstReportGeneration,
  getDemoVerifyOtpAndGenerateReport,
  getDemoAddCreditForUser,
  getDemoMoveDocument,
} from "../demo/demoReports";
import {
  addDemoUserWithoutOtp,
  addDemoLoanApplication,
  convertDemoPartnersToCoApplicants,
  createDemoLink,
  generateDemoCpPayoutInvoice,
  generateDemoSpPayoutInvoice,
  generateDemoReferralCode,
  getDemoAddEditRoleUserData,
  getDemoChannelPartnerDashboard,
  getDemoClientDetail,
  getDemoClientMaster,
  getDemoCpReportClientList,
  getDemoCpReportDetail,
  getDemoCpSpList,
  getDemoLoanApplications,
  getDemoLoanDetail,
  getDemoLoanTypeList,
  getDemoPayOutsDetail,
  getDemoPayOutsList,
  getDemoPanDetails,
  getDemoPincode,
  getDemoReferralCode,
  getDemoReferralPoints,
  getDemoRoleDetail,
  getDemoRoleMasterList,
  getDemoSourcingPartners,
  getDemoSourcingPartnerDetail,
  getDemoSpPayoutDetail,
  getDemoSpPayoutsList,
  getDemoStates,
  getDemoSubscriptionHistory,
  getDemoSubscriptionPlans,
  getDemoSubscriptionUsage,
  getDemoTrackReferrals,
  getDemoUserManagementList, getDemoUserNotifications,
  getDemoWalletHistory,
  logoutDemoUser,
  submitDemoAddEditRoleUserData,
  updateDemoSpPayoutRequest,
  updateDemoRoleDetail,
  updateDemoLoanApplicationStatus,
  updateDemoNotificationStatus,
  uploadDemoSanctionLetter,
  updateDemoUserProfile,
  deleteDemoUserProfile,
  getVerifyReferralCode
} from "../demo/demoPortal";
import {
  getDemoContent as getDemoCmsContent,
  getDemoContractList as getDemoCmsContractList,
  getDemoSupportData as getDemoCmsSupportData,
  getDemoUserListForAdminContractList as getDemoCmsUserContractList,
  updateDemoContent as updateDemoCmsContent,
  updateDemoContractStatus as updateDemoCmsContractStatus,
  updateDemoSupportData as updateDemoCmsSupportData,
} from "../demo/demoContent";
import {
  createEducationLoanDraft,
} from "../demo/demoEducationLoanFlow";
import {
  getEducationCourses,
} from "../demo/demoEducationCourses";
import {
  createEducationStudent,
  getEducationStudents,
  updateEducationStudent,
} from "../demo/demoEducationStudents";

export const generatePublicTokenAPI = async (
  payload: IGeneratePublicTokenRequest
): Promise<IGeneratePublicTokenResponse> => {
  return await generateDemoPublicToken();
};

export const sendOTPAPI = async (
  bodyRequestObject: any
): Promise<ISendOTPResponse> => {
  return await sendDemoOTP(bodyRequestObject);
};

export const addUserWithoutOTPAPI = async (
  bodyRequestObject: any
): Promise<ILogoutResponse> => {
  return await addDemoUserWithoutOtp();
};

export const verifyEmailOTPAPI = async (
  bodyRequestObject: IVerifyEmailOTPRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await verifyDemoOTP(bodyRequestObject);
};

export const getChannelPartnerListing = async (
  data: IChannelPartnerListParams
): Promise<IChannelPartnerResponse> => {
  return await getDemoChannelPartnerListing();
};

export const fetchDetailsByPan = async (
  payload: OnlyPanNumber
): Promise<IAddPanCardResponse> => {
  return await getDemoPanDetails();
};

export const fetchUserProfile = async (): Promise<IUserProfileResponse> => {
  const currentUserData = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_USER_DATA
  );
  const impersonateUserData = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA
  );
  const isImpersonate =
    currentUserData !== impersonateUserData &&
    Boolean(currentUserData) &&
    Boolean(impersonateUserData);

  return await getDemoUserProfileByContext(
    currentUserData,
    impersonateUserData,
    isImpersonate
  );
};

export const updateUserProfile = async (
  data: FormData
): Promise<APIResponseEntity> => {
  return await updateDemoUserProfile()
};

export const deleteUser = async (
  body: IDeleteUser
): Promise<ILogoutResponse> => {
  return await deleteDemoUserProfile();
};

export const getChannelPartnerDetail = async (
  params: IChannelPartnerParams
): Promise<IChannelPartnerDetailResponse> => {
  return await getDemoChannelPartnerDetail();
};

export const logoutAPI = async (): Promise<ILogoutResponse> => {
  return await logoutDemoUser();
};

export const getClientDetailAPI = async (
  params: IClientPartnerParams
): Promise<IClientResponse> => {
  return await getDemoClientDetail();
};

export const getAllLoanApplicationsAPI = async (
  params: ILoanApplicationParams
): Promise<IGetAllLoanApplicationsResponse> => {
  return await getDemoLoanApplications({
    statusFilter: params.statusFilter,
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });
};

export const getLoanDetailAPI = async (
  params: ILoanParams
): Promise<ILoanResponse> => {
  return await getDemoLoanDetail();
};

export const getSourcingPartnerAPI = async (
  params: ISourcingPartnerListParams
): Promise<ISourcingPartnerResponse> => {
  return await getDemoSourcingPartners();
};

export const getClientMasterAPI = async (
  params: IClientMasterListingParams
): Promise<IClientMasterResponse> => {
  return await getDemoClientMaster(params);
};

export const getSourcingPartnerDetailAPI = async (
  params: ISourcingPartnerParams
): Promise<ISourcingPartnerDetailsResponse> => {
  return await getDemoSourcingPartnerDetail();
};

export const getClientDashboardAPI =
  async (): Promise<IClientDashboardResponse> => {
    return await getDemoClientDashboard();
  };

export const getRoleMasterAPI = async (
  data: IRoleMasterListParams
): Promise<IRoleMasterResponse> => {
  return await getDemoRoleMasterList();
};

export const viewRoleDetailAPI = async (
  params: IRoleParams
): Promise<IRoleDetailResponse> => {
  return await getDemoRoleDetail();
};

export const updateRoleDetailAPI = async (
  body: IRoleDetailData
): Promise<APIResponseEntity> => {
  return await updateDemoRoleDetail();
};

export const deleteRoleApi = async (
  params: IRoleParams
): Promise<APIResponseEntity> => {
  return await getDemoDeleteRole();
};

export const getChannelPartnerDashboardAPI =
  async (): Promise<IChannelPartnerDashboardResponse> => {
    return await getDemoChannelPartnerDashboard();
  };

export const getPayOutsListingAPI = async (
  params: IPayOutsParams
): Promise<IPayOutsResponse> => {
  return await getDemoPayOutsList();
};

export const getPayOutsDetailsAPI = async (
  params: IPayOutsDetailParams
): Promise<IPayOutsDetailResponse> => {
  return await getDemoPayOutsDetail();
};

export const updatePayOutsDetailsAPI = async (body: {
  userID: string;
  percent: number;
}): Promise<APIResponseEntity> => {
  return await getDemoUpdatePayout();
};

export const getContractListAPI = async (
  params: IContractListParams
): Promise<IContractListResponse> => {
  return await getDemoCmsContractList(params);
};

export const getContentAPI = async (
  params: IContractParams
): Promise<IContractResponse> => {
  return await getDemoCmsContent(params);
};

export const updateContentAPI = async (
  body: IUpdatedContractBody
): Promise<ILogoutResponse> => {
  return await updateDemoCmsContent(body);
};

export const updateContractStatusAPI = async (
  body: IUpdatedContractStatusBody
): Promise<APIResponseEntity> => {
  return await updateDemoCmsContractStatus(body);
};

export const getSupportDataAPI = async (): Promise<ISupportDataResponse> => {
  return await getDemoCmsSupportData();
};

export const updateSupportDataAPI = async (
  body: IUpdateSupportData
): Promise<APIResponseEntity> => {
  return await updateDemoCmsSupportData(body);
};

export const getCreditAnalyticsSendOtpAPI = async (
  partnerID: string
): Promise<IExternalReportResponse> => {
  return await getDemoSendOtpForCreditReport();
};

export const getCreditAnalyticsVerifyOtpAPI = async (
  body: IFetchCreditScoreBody
): Promise<ICreditAnalyticsResponse> => {
  return await getDemoVerifyOtpAndGenerateReport();
};

export const fetchImpersonateUser = async (
  body: IGeneratePublicTokenRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await getDemoImpersonateUser();
};

export const fetchImpersonateStudent = async (
  body: IGeneratePublicTokenRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await getDemoImpersonateStudent();
};

export const getInstitutionList =
  async (): Promise<IInstitutionListResponse> => {
    return await getDemoInstitutionList();
  };

export const getBankDetailsAPI = async (
  body: FormData
): Promise<IUploadBankDocumentResponse> => {
  return await getDemoUploadLoanDocuments();
};

export const fetchCpSpListAPI = async (
  params: IPartnerParams
): Promise<IGetPartnerListResponse> => {
  return await getDemoCpSpList();
};

export const addPanForCPAPI = async (
  body: OnlyPanNumber
): Promise<APIResponseEntity> => {
  return await getDemoAddPanForCP();
};

export const generateAadharOTP = async (
  body: OnlyAadharNumber
): Promise<IAadharCardResponse> => {
  return await getDemoGenerateAadharOtp();
};

export const updateAadharAPI = async (
  body: IUpdateAadhaarBody
): Promise<APIResponseEntity> => {
  return await updateAadhar();
};

export const getLoanTypeListAPI = async (): Promise<ILoanTypeListResponse> => {
  return await getDemoLoanTypeList();
};

export const addLoanApplicationAPI = async (
  body: IAddLoanApplication
): Promise<IApplyLoanApplicationResponse> => {
  return await addDemoLoanApplication();
};

export const getEducationStudentsAPI = async (): Promise<IEducationStudent[]> => {
  return getEducationStudents();
};

export const createEducationStudentAPI = async (
  body: IEducationStudentFormData
): Promise<IEducationStudent> => {
  return createEducationStudent(body);
};

export const updateEducationStudentAPI = async (
  studentId: string,
  body: IEducationStudentFormData
): Promise<IEducationStudent | undefined> => {
  return updateEducationStudent(studentId, body);
};

export const getEducationCoursesAPI = async (): Promise<IEducationCourse[]> => {
  return getEducationCourses();
};

export const createEducationLoanDraftAPI = async (
  body: ICreateEducationLoanDraftBody
): Promise<ICreateEducationLoanDraftResponse> => {
  const draft = createEducationLoanDraft(body);

  return {
    status: true,
    statusCode: 200,
    message: "Education loan draft created successfully.",
    data: draft,
  };
};

export const getAdminDashboardAPI =
  async (): Promise<IAdminDashboardResponse> => {
    return await getDemoAdminDashboard();
  };

export const getUserListingAPI = async (
  params: IUserMasterListParams
): Promise<IUserDataResponse> => {
  return await getDemoUserManagementList();
};

export const submitAddEditRoleUserDataAPI = async (
  userData: ISaveUserDetailData
): Promise<IUserDataResponse> => {
  return await submitDemoAddEditRoleUserData(userData);
};

export const createSpPaymentRequestAPI = async (
  body: ICreatePayOutsRequestParams
): Promise<APIResponseEntity> => {
  return await getDemoCreateSpPaymentRequest();
};

export const generateCpPayoutInvoiceAPI = async (
  body: IGenerateCpPayoutInvoiceParams
): Promise<IGenerateCpPayoutInvoiceResponse> => {
  return await generateDemoCpPayoutInvoice();
};

export const updateSpPayOutRequestAPI = async (
  body: IPayOutsUpdateStatusParams
): Promise<APIResponseEntity> => {
  return await updateDemoSpPayoutRequest();
};

export const getSpPayoutsListAPI = async (
  params: ISourcingPartnerPayOutsParams
): Promise<ISourcingPartnerPayOutsResponse> => {
  return await getDemoSpPayoutsList();
};

export const getSpPayOutDetailsAPI = async (
  params: ISourcingPartnerPayOutDetailParams
): Promise<ISourcingPartnerPayOutDetailResponse> => {
  return await getDemoSpPayoutDetail();
};

export const getAddEditRoleUserDataAPI = async (params: {
  userID: string | null;
}): Promise<IGetAddEditRoleUserResponse> => {
  return await getDemoAddEditRoleUserData(params);
};

export const getUserRightsForUserManagementAPI = async (params: {
  userID: string;
}): Promise<IGetUserRightsForUserManagementResponse> => {
  return await getDemoUserRightsForUserManagement();
};

export const submitUserRightsForUserManagementAPI = async (
  body: IUpdateUserRightBodyData
): Promise<IGetUserRightsForUserManagementResponse> => {
  return await getDemoSubmitUserRightsForUserManagement();
};

export const getAdminChannelPartnerReportAPI = async (
  params: IReportParams
): Promise<IReportResponse> => {
  return await getDemoAdminChannelPartnerReport();
};

export const getAdminGeographicalReportAPI = async (
  params: IReportParams
): Promise<IGeographicalReportResponse> => {
  return await getDemoAdminGeographicalReport();
};

export const updateLoanApplicationStatusAPI = async (
  body: IUpdateLoanStatus
): Promise<IUpdateLoanStatusResponse> => {
  return await updateDemoLoanApplicationStatus();
};

export const getApplyForLoanAPI = async (
  params: IGetApplyForLoanParams
): Promise<IGetApplyForLoanResponse> => {
  return await getDemoApplyForLoan();
};

export const submitApplyForLoanAPI = async (
  body: ISubmitCoApplicant
): Promise<APIResponseEntity> => {
  return await getDemoSubmitApplyForLoan();
};

export const getGstReportGenerateOtpAPI = async (
  body: IGSTGenerateOTPBody
): Promise<IGSTGenerateOTPResponse> => {
  return await getDemoGstReportGenerateOtp() as IGSTGenerateOTPResponse;
};

export const getGstReportVerifyOtpAPI = async (
  body: IGSTVerifyOTPBody
): Promise<IExternalReportResponse> => {
  return await getDemoGstReportVerifyOtp() as IExternalReportResponse;
};

export const getGstDetailsAPI = async (): Promise<IGSTReportResponse> => {
  return await getDemoGstDetails();
};

export const getITRDetailsAPI = async (): Promise<IITRReportResponse> => {
  return await getDemoItrDetails();
};

export const getBankingAnalyticsDetailsAPI =
  async (): Promise<IBankingAnalyticsReportResponse> => {
    return await getDemoBankingAnalyticsDetails();
  };

export const getUserNotificationListAPI =
  async (params: PaginateReqEntity): Promise<IGetNotificationResponse> => {
    return await getDemoUserNotifications();
  };

export const updateNotificationStatusAPI = async (
  body: INotificationBody
): Promise<APIResponseEntity> => {
  return await updateDemoNotificationStatus();
};

export const getCpReportClientListAPI = async (
  params: IChannelPartnerReportParams
): Promise<IChannelPartnerClientReportResponse> => {
  return await getDemoCpReportClientList();
};

export const getCpReportDetailsAPI = async (
  params: IClientDetailListParams
): Promise<IChannelPartnerClientReportDetailResponse> => {
  const demoResponse = await getDemoCpReportDetailByClientId(params.clientID);

  if (demoResponse) {
    return demoResponse;
  }

  return await getDemoCpReportDetail();
};

export const fetchDocumentStatusAPI = async (body: {
  loanType: number;
  loanApplicationID: string | null;
}): Promise<IDocumentListResponse> => {
  return await getDemoDocumentStatus();
};

export const getDocumentDetailsAPI = async (params: {
  folderName: string;
  loanApplicationID: string | null;
}): Promise<IDocumentListDetailResponse> => {
  const demoResponse = await getDemoDocumentDetails(params.folderName);

  if (demoResponse) {
    return demoResponse;
  }

  return {
    status: true,
    statusCode: 200,
    message: "",
    data: {
      documentType: params.folderName,
      folderPath: null,
      fileModels: [],
      missingDocuments: [],
      subFolders: [],
      isFileModels: false,
    },
  };
};

export const getSubFolderDetailsAPI = async (params: {
  folderName: string;
  subFolderName: string;
  loanApplicationID: string | null;
}): Promise<IDocumentListDetailResponse> => {
  const demoResponse = await getDemoSubfolderDetails(
    params.folderName,
    params.subFolderName
  );

  if (demoResponse) {
    return demoResponse;
  }

  return {
    status: true,
    statusCode: 200,
    message: "",
    data: {
      documentType: params.subFolderName,
      folderPath: null,
      fileModels: [],
      missingDocuments: [],
      subFolders: [],
      isFileModels: false,
    },
  };
};

export const fileAutomatedRequestForItrAPI = async (
  body: IITRReportBody
): Promise<IExternalReportResponse> => {
  return await getDemoFileAutomatedRequestForItr() as IExternalReportResponse;
};

export const resendOtpForCreditReportAPI = async (
  body: IResendOTPCreditScoreBody
): Promise<any> => {
  return await getDemoSendOtpForCreditReport();
};

export const uploadBankStatementFilesAPI = async (
  body: UploadRequestBody
): Promise<APIResponseEntity> => {
  return await getDemoUploadBankStatementFiles();
};

export const uploadAllDocumentsAPI = async (
  body: FormData
): Promise<APIResponseEntity> => {
  return await getDemoUploadAllDocuments();
};

export const deleteReuploadLoanDocumentAPI = async (
  body: FormData
): Promise<IReUploadedDocumentResponse> => {
  return await getDemoDeleteReuploadLoanDocument() as IReUploadedDocumentResponse;
};

export const deleteUploadRemainingDocumentsAPI = async (
  body: FormData
): Promise<APIResponseEntity> => {
  return await getDemoDeleteUploadRemainingDocuments();
};

export const fetchUploadedBankDocumentsAPI = async (): Promise<any> => {
  return await getDemoUploadedBankDocuments();
};

export const fetchLoanMarketPlaceListingAPI = async (
  params: ILoanMarketPlacePayload
): Promise<ILoanMarketResponse> => {
  return await getDemoLoanMarketplace();
};

export const submitApplicationToBankAPI = async (
  params: IGetApplyForLoanParams
): Promise<ISubmitLoanApplicationToBankResponse> => {
  return await getDemoSubmitApplicationToBank();
};

export const updateGstDetailsAPI = async (
  body: IGSTListInfo
): Promise<APIResponseEntity> => {
  return await updateGstDetails();
};

export const validateBankStatementFilesAPI = async (
  body: any
): Promise<APIResponseEntity> => {
  return await getDemoValidateBankStatementFiles();
};

export const createLinkAPI = async (
  body: ISubscriptionBody
): Promise<ISubscriptionResponse> => {
  return await createDemoLink();
};

export const fetchSubsciptionHistoryAPI = async (): Promise<ISubscriptionListingResponse> => {
  return await getDemoSubscriptionHistory();
};

export const fetchSubscriptionPlansAPI = async (): Promise<ISubscriptionPlanListingResponse> => {
  return await getDemoSubscriptionPlans();
};

export const fetchSubscriptionUsageAPI = async (): Promise<ISubscriptionUsageResponse> => {
  return await getDemoSubscriptionUsage();
};

export const getSecureUnsecureDocumentListAPI = async (): Promise<IGetSecureUnsecureDocumentListResponse> => {
  return await getDemoSecureUnsecureDocumentList();
};

export const moveDocumentAPI = async (body: IMoveDocumentBody): Promise<APIResponseEntity> => {
  return await getDemoMoveDocument();
};

export const generateSpPayoutInvoiceAPI = async (body: IGenerateSpPayoutInvoiceParams): Promise<IGenerateSpPayoutInvoiceResponse> => {
  return await generateDemoSpPayoutInvoice();
};

export const generateSubscriptionInvoiceAPI = async (body: IGenerateSubscriptionInvoiceParams): Promise<IGenerateSubscriptionInvoiceResponse> => {
  return await getDemoGenerateSubscriptionInvoice() as IGenerateSubscriptionInvoiceResponse;
};

export const fetchAllPaymentsAPI = async (params: IPaginateReqEntityForSubscription): Promise<IFetchAllPaymentsResponse> => {
  return await getDemoFetchAllPayments();
};

export const validateGstReportGenerationAPI = async (body: IGSTValidateReportBody): Promise<IValidateGSTReportResponse> => {
  return await getDemoValidateGstReportGeneration();
};

export const generateGstReportAPI = async (body: IGSTValidateReportBody): Promise<APIResponseEntity> => {
  return await getDemoGenerateGstReport();
};

export const fileAutomatedRequestForItrUsingLinkAPI = async (body: { email: string }): Promise<any> => {
  return await getDemoFileAutomatedRequestForItrUsingLink();
};

export const generateITRReportAPI = async (body: IShareLinkITRReportBody): Promise<APIResponseEntity> => {
  return await getDemoGenerateItrReport();
};

export const getGstReportGenerateOtpUsingLinkAPI = async (body: IGenerateGstReportUsingLinkBodyForOTP): Promise<IGenerateGstReportShareLink> => {
  return await getDemoGstReportGenerateOtpUsingLink() as IGenerateGstReportShareLink;
};

export const getGstReportViaPasswordUsingLinkAPI = async (body: IGenerateGstReportUsingLinkBodyForPassword): Promise<IGenerateGstReportShareLink> => {
  return await getDemoGstReportViaPasswordUsingLink() as IGenerateGstReportShareLink;
};

export const getGstReportForLinkApproachAPI = async (body: { referenceID: string }): Promise<APIResponseEntity> => {
  return await getGstReportForLinkApproach();
};

export const uploadSanctionLetterForLoanApplicationAPI = async (data: FormData): Promise<IUpdateLoanStatusResponse> => {
  return await uploadDemoSanctionLetter();
};

export const getDataByPincodeAPI = async (params: { pincode: number }): Promise<IPincodeFetchDetailsResponse> => {
  return await getDemoPincode();
}

export const getPaymentFetchUserTabWiseAPI = async (params: IPaginateReqEntityForFetchUserTabWise): Promise<IFetchTabWiseUserListingResponse> => {
  return await getDemoFetchUserTabwise(params.type);
};

export const addCreditsAPI = async (body: IAddCreditsBody): Promise<APIResponseEntity> => {
  return await getDemoAddCreditForUser();
};

export const getUserListForAdminContractListAPI = async (params: IContractListParams): Promise<IUserListForAdminContractListResponse> => {
  return await getDemoCmsUserContractList(params);
};

export const generategenerateReferralCodeAPI = async (): Promise<IGenerateSubscriptionInvoiceResponse> => {
  return await generateDemoReferralCode() as unknown as IGenerateSubscriptionInvoiceResponse;
};

export const fetchVerifyReferralCodeAPI = async (referralCode: string): Promise<IRefferalCodeResponse> => {
  return await getVerifyReferralCode();
};

export const fetchTrackReferralsAPI = async (): Promise<IRefferalListingResponse> => {
  return await getDemoTrackReferrals();
};

export const fetchWalletAPI = async (): Promise<IWalletListingResponse> => {
  return await getDemoWalletHistory();
};

export const getReferralPointsAPI = async (): Promise<IRefferalDataResponse> => {
  return await getDemoReferralPoints();
};

export const verifyReferralCodeAPI = async (referralCode: string): Promise<IRefferalDataResponse> => {
  return await verifyDemoReferralCode(referralCode);
};

export const fetchSubmitApplicationToBankDetailsAPI = async (body: { loanApplicationID: string, bankID: number }): Promise<ISubmitLoanApplicationToBankResponse> => {
  return await getDemoSubmitApplicationToBank();
}

export const fetchReferralCodeAPI = async (): Promise<IRefferalCodeResponse> => {
  return await getDemoReferralCode();
};

export const IsProceedForCamReport = async (
  reportType?: number
): Promise<IIsProceedForCamReportResponse> => {
  return await getDemoProceedForCamReport();
};

export const fetchStatesAPI = async (): Promise<IFetchStateResponse> => {
  return await getDemoStates();
};

export const convertPartnersToCoApplicantsAPI = async (body: { partnersID: string, userType: number }): Promise<APIResponseEntity> => {
  return await convertDemoPartnersToCoApplicants();
};

export const updateLoanApplicationAmountAPI = async (body: { loanAppID: string, loanAmount: string, loanTypeID: number }): Promise<APIResponseEntity> => {
  return await getDemoUpdateLoanApplicationAmount();
}

export const proceedForCreditReportAPI = async (): Promise<IIsProceedForCreditReportResponse> => {
  return await getDemoProceedForCreditReport();
};

export const getAdminAllDataAPI = async (
  body: IAdminDashboardFilterBody
): Promise<IAdminAllDataResponse> => {
  return await getAdminAllData();
};

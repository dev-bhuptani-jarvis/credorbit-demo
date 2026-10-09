import { localApi } from "../demo/localApiService";
import { API_URL } from "../constants/constant";
import { getDecryptedSessionStorage } from "../functions/sessionStorage";
import {
  IDomainConfigurationRequest,
  IDomainConfigurationResponse,
  IGeneratePublicTokenRequest,
  IGeneratePublicTokenResponse,
} from "../../interface/publicToken";
import {
  ICheckLeadUserExistsOrNoteRequest,
  IVerifyEmailOTPRequest,
  IVerifyEmailOTPResponse,
} from "../../interface/otpRequest";
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
  IValidateCINNumberBody,
  IValidateUdhyamNumberBody,
} from "../../interface/userData";
import { APIResponseEntity } from "../../interface/apiResponse";
import {
  IGetNotificationResponse,
  INotificationBody,
} from "../../interface/notifications";
import { ILogoutResponse } from "../../interface/logout";
import {
  IFetchCreditScoreBody,
  IFetchCreditScoreForEducationBody,
  IGetPartnerListResponse,
  IPartnerParams,
  IResendOTPCreditScoreBody,
  IResendOTPCreditScoreForEducationBody
} from "../../interface/client";
import {
  IGetLoanDetailForNBFCResponse,
  ILoanParams,
  ILoanResponse,
  ILoanTypeListResponse
} from "../../interface/loanDetail";
import {
  IClientMasterListingParams,
  IClientMasterResponse,
} from "../../interface/clientMaster";
import {
  IAdminAllDataResponse,
  IAdminDashboardFilterBody,
  IAdminDashboardResponse,
} from "../../interface/adminDashboard";
import {
  IClientDashboardResponse,
  ICreditAnalyticsResponse,
} from "../../interface/clientDashboard";
import {
  IGetAllLoanApplicationsResponse,
  ILoanApplicationParams
} from "../../interface/channelPartnerDashboard";
import {
  IAssignLoansToUMUserBody,
  IGetEduPortalLoanApplicationBody,
  IGetEduPortalLoanApplicationResponse,
  IGetLoanApplicationPermissionUsersParams,
  IGetLoanApplicationPermissionUsersResponse,
} from "../../interface/loanApplicationManagement";
import {
  ICreatePayOutsRequestParams,
  IFetchStateResponse,
  IGenerateCpPayoutInvoiceParams,
  IGenerateCpPayoutInvoiceResponse,
  IGenerateMasterPayoutInvoiceParams,
  IGenerateMasterPayoutInvoiceResponse, IPayOutsUpdateStatusParams
} from "../../interface/payOuts";
import {
  IAadharCardResponse, IContractParams, IContractResponse, IUpdatedContractBody, OnlyAadharNumber
} from "../../interface/contract";
import {
  ISupportDataResponse,
  IUpdateSupportData,
} from "../../interface/supportData";
import { StorageKeyEnum } from "../constants/enum";
import store from "../../store";
import { setLogout } from "../../store/reducer/authSlice";
import {
  IInstitutionListResponse,
  IReUploadedDocumentResponse,
  IUploadBankDocumentResponse,
  UploadRequestBody,
} from "../../interface/bankDetail";
import {
  IAddLoanApplication,
  IAddLoanApplicationForEducationalInstituteResponse,
  IApplyLoanApplicationResponse,
  IFetchEducationPortalLoanDetailsResponse,
  IGetApplyForLoanParams,
  IGetApplyForLoanResponse,
  IGetLoanMarketPlaceForEducationalInstituteResponse,
  ISubmitCoApplicant,
  ISubmitLoanApplicationToBankForEducationInstituteResponse,
  ISubmitLoanApplicationToBankResponse,
} from "../../interface/applyLoan";
import { toastError } from "../functions/shared";
import {
  IGetAddEditRoleUserResponse,
  IGetUserRightsForUserManagementResponse,
  ISaveUserDetailData,
  IUpdateUserRightBodyData,
  IUserDataResponse,
  IUserMasterListParams,
} from "../../interface/userManagement";
import {
  IExternalReportResponse,
  IGetStudentCoApplicantsListResponse,
  IInstituteReportParams,
  IInstituteReportResponse,
  IStudentReportDetailResponse
} from "../../interface/reports";
import {
  IGSTGenerateOTPBody,
  IGSTGenerateOTPResponse, IGSTVerifyOTPBody
} from "../../interface/checkEligibility";
import {
  ILoanMarketPlacePayload,
  ILoanMarketResponse,
} from "../../interface/loanMarketPlace";
import { IRegisterParams, ISendOTPForLeadResponse, ISendOTPResponse } from "../../interface/signIn";
import { IIsProceedForCamReportResponse, IIsProceedForCreditReportResponse, IRefferalDataResponse } from "../../interface/wallet";
import { PaginateReqEntity } from "../../interface/pagination";
import { IEducationAdminDashboardResponse } from "../../interface/educationalAdminDashboard";
import { IEducationCourseManagementFilterReq, IEducationCourseManagementResponse } from "../../interface/courseManagement";
import { IListAllApplicationsResponse } from "../../interface/nbfcApplication";
import { IRoleDetailData, IRoleDetailResponse, IRoleMasterListParams, IRoleMasterResponse, IRoleParams } from "../../interface/roleMaster";
import {
  IAddEducationalInstituteResponse,
  IGetAllEducationInstitutesDetailedResponse,
  IGetAllEducationInstitutesResponse,
  IGetAllNBFCResponse,
  IGetEducationalInstituteBranchDetailsResponse,
  IGetEducationalInstituteBranchListParams,
  IGetEducationalInstituteBranchListResponse,
} from "../../interface/institutes";
import { IFetchMobilePrefillBody, IFetchMobilePrefillResponse, IFetchStudentDetailResponse, IFetchStudentResponse, IGetStudentLoanDetailResponse, IUploadCommonDocumentResponse } from "../../interface/student";
import { ICreateDraftPolicyBody, ICreateDraftPolicyResponse, IGetAllPoliciesResponse, IGetComparisonOptionsResponse, IGetNodeCatalogsResponse, IGetPolicyResponse, IGetRunTimeLogsDetailResponse, IGetRunTimeLogsResponse, IGetTerminalOutcomesResponse, IPolicyNode, IPublishPolicyResponse, ISavePolicyResponse, ISimulatePolicyBody, ISimulatePolicyResponse } from "../../interface/breBulilder";
import { ISubscriptionBody, ISubscriptionResponse } from "../../interface/subscription";

export const generatePublicTokenAPI = async (
  payload: IGeneratePublicTokenRequest
): Promise<IGeneratePublicTokenResponse> => {
  return await localApi.post(`${API_URL}/Auth/generatePublicToken`, payload);
};

export const getContentAPI = async (
  params: IContractParams
): Promise<IContractResponse> => {
  return await localApi.get(`${API_URL}/ContentManagement/getContentByPageName`, {
    params,
  });
};

export const updateContentAPI = async (
  body: IUpdatedContractBody
): Promise<ILogoutResponse> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/updateContentByPageName`,
    body
  );
};

export const sendOTPAPI = async (
  bodyRequestObject: any
): Promise<ISendOTPResponse> => {
  return await localApi.post(`${API_URL}/Auth/sendOtp`, bodyRequestObject);
};

export const sendOTPForLeadAPI = async (
  bodyRequestObject: any
): Promise<ISendOTPForLeadResponse> => {
  return await localApi.post(`${API_URL}/Auth/sendOtpForLead`, bodyRequestObject);
};

export const addUserWithoutOTPAPI = async (
  bodyRequestObject: any
): Promise<ILogoutResponse> => {
  return await localApi.post(
    `${API_URL}/Auth/addUserWithoutOTP`,
    bodyRequestObject
  );
};

export const verifyEmailOTPAPI = async (
  bodyRequestObject: IVerifyEmailOTPRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await localApi.post(`${API_URL}/Auth/verifyEmailOTP`, bodyRequestObject);
};

export const fetchDetailsByPan = async (
  payload: OnlyPanNumber
): Promise<IAddPanCardResponse> => {
  return await localApi.post(`${API_URL}/Pan/fetchUserDetailsByPan`, payload);
};

export const fetchUserProfile = async (): Promise<IUserProfileResponse> => {
  return await localApi.get(`${API_URL}/UserMaster/getUserProfile`);
};

export const updateUserProfile = async (
  data: FormData
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/UserMaster/updateUserProfile`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteUser = async (
  body: IDeleteUser
): Promise<ILogoutResponse> => {
  return await localApi.post(`${API_URL}/UserMaster/deleteUser`, body);
};

export const logoutAPI = async (): Promise<ILogoutResponse> => {
  return await localApi.get(`${API_URL}/Auth/logout`);
};

export const getAllLoanApplicationsAPI = async (
  params: ILoanApplicationParams
): Promise<IGetAllLoanApplicationsResponse> => {
  return await localApi.get(`${API_URL}/LoanApplication/getAllLoanApplications`, {
    params,
  });
};

export const getRoleMasterAPI = async (
  data: IRoleMasterListParams
): Promise<IRoleMasterResponse> => {
  return await localApi.get(`${API_URL}/RolesAndRights/getAllRoles`, {
    params: data,
  });
};

export const viewRoleDetailAPI = async (
  params: IRoleParams
): Promise<IRoleDetailResponse> => {
  return await localApi.get(`${API_URL}/RolesAndRights/viewRole`, { params });
};

export const updateRoleDetailAPI = async (
  body: IRoleDetailData
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/RolesAndRights/addEditRole`, body);
};

export const deleteRoleApi = async (
  params: IRoleParams
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/RolesAndRights/deleteRole`, params);
};

export const getUsersWithLoanApplicationPermissionAPI = async (
  params: IGetLoanApplicationPermissionUsersParams
): Promise<IGetLoanApplicationPermissionUsersResponse> => {
  return await localApi.get(
    `${API_URL}/UserMaster/getUsersWithLoanApplicationPermission`,
    {
      params,
    }
  );
};

export const assignLoanApplicationsToUMUserAPI = async (
  body: IAssignLoansToUMUserBody
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/LoanApplication/UpdateProcessedByUMUser`,
    body
  );
};

export const getLoanDetailAPI = async (
  params: ILoanParams
): Promise<ILoanResponse> => {
  return await localApi.get(
    `${API_URL}/LoanApplication/getLoanApplicationDetails`,
    {
      params,
    }
  );
};

export const getClientMasterAPI = async (
  params: IClientMasterListingParams
): Promise<IClientMasterResponse> => {
  return await localApi.get(`${API_URL}/Client/getAllClients`, { params });
};

export const getClientDashboardAPI = async (
  params?: { parentUserId?: string }
): Promise<IClientDashboardResponse> => {
  return await localApi.get(
    `${API_URL}/Client/getClientDashboard`,
    {
      params,
    }
  );
};

export const updateMasterCPPayOutsDetailsAPI = async (body: IPayOutsUpdateStatusParams): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/PayOut/updateMCPPayoutRequest`, body);
};

export const getSupportDataAPI = async (): Promise<ISupportDataResponse> => {
  return await localApi.get(`${API_URL}/ContentManagement/getSupportData`);
};

export const updateSupportDataAPI = async (
  body: IUpdateSupportData
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/updateSupportData`,
    body
  );
};

export const getCreditAnalyticsSendOtpAPI = async (
  partnerID?: string
): Promise<IExternalReportResponse> => {
  const body = partnerID ? { partnerID } : { partnerID: null };

  return await localApi.post(`${API_URL}/CreditAnalytics/sendOtpForCreditReport`, body);
};

export const getCreditAnalyticsVerifyOtpAPI = async (
  body: IFetchCreditScoreBody
): Promise<ICreditAnalyticsResponse> => {
  return await localApi.post(
    `${API_URL}/CreditAnalytics/verifyOtpAndGenerateReport`,
    body
  );
};

export const proceedForCreditReportEducationalInsituteAPI = async (body: {
  partnerID: string;
}): Promise<IIsProceedForCreditReportResponse> => {
  return await localApi.post(
    `${API_URL}/CreditAnalytics/proceedForCreditReportEducationalInsitute`,
    body,
  );
};

export const sendOtpForCreditReportEducationalInsituteAPI = async (partnerID: string): Promise<IExternalReportResponse> => {
  const body = partnerID ? { partnerID } : { partnerID: null };

  return await localApi.post(
    `${API_URL}/CreditAnalytics/sendOtpForCreditReportEducationalInsitute`,
    body
  );
};

export const resendOtpForCreditReportEducationalInsituteAPI = async (
  body: IResendOTPCreditScoreForEducationBody,
): Promise<IExternalReportResponse> => {
  return await localApi.post(
    `${API_URL}/CreditAnalytics/resendOtpForCreditReportEducationalInsitute`,
    body,
  );
};

export const verifyOtpAndGenerateReportEducationalInsituteAPI = async (
  body: IFetchCreditScoreForEducationBody,
): Promise<ICreditAnalyticsResponse> => {
  return await localApi.post(
    `${API_URL}/CreditAnalytics/verifyOtpAndGenerateReportEducationalInsitute`,
    body,
  );
};

export const fetchImpersonateUser = async (
  body: IGeneratePublicTokenRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await localApi.post(`${API_URL}/Auth/impersonateUser`, body);
};

export const getInstitutionList =
  async (): Promise<IInstitutionListResponse> => {
    return await localApi.get(`${API_URL}/Reports/getInstitutionList`);
  };

export const getBankDetailsAPI = async (
  body: FormData
): Promise<IUploadBankDocumentResponse> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/uploadLoanDocumentsForEducationalInstitute`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const fetchCpSpListAPI = async (
  params: IPartnerParams
): Promise<IGetPartnerListResponse> => {
  return await localApi.get(`${API_URL}/UserMaster/getCpSpList`, { params });
};

export const addPanForCPAPI = async (
  body: OnlyPanNumber
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/Auth/addPanForCP`, body);
};

export const generateAadharOTP = async (
  body: OnlyAadharNumber
): Promise<IAadharCardResponse> => {
  return await localApi.post(`${API_URL}/UserDetails/generateAadharOTP`, body);
};

export const updateAadharAPI = async (
  body: IUpdateAadhaarBody
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/UserMaster/updateAadhaar`, body);
};

export const getLoanTypeListAPI = async (): Promise<ILoanTypeListResponse> => {
  return await localApi.get(`${API_URL}/ContentManagement/getLoanTypeList`);
};

export const addLoanApplicationAPI = async (
  body: IAddLoanApplication
): Promise<IApplyLoanApplicationResponse> => {
  return await localApi.post(
    `${API_URL}/LoanApplication/addLoanApplication`,
    body
  );
};

export const getAdminDashboardAPI =
  async (body: IAdminDashboardFilterBody): Promise<IAdminDashboardResponse> => {
    return await localApi.post(`${API_URL}/LoanApplication/getAdminDashboard`, body);
  };

export const getAdminAllDataAPI = async (
  body: IAdminDashboardFilterBody
): Promise<IAdminAllDataResponse> => {
  return await localApi.post(`${API_URL}/LoanApplication/getAdminAllData`, body);
};

export const getUserListingAPI = async (
  params: IUserMasterListParams
): Promise<IUserDataResponse> => {
  return await localApi.get(`${API_URL}/UserMaster/getUserManagementList`, {
    params,
  });
};

export const submitAddEditRoleUserDataAPI = async (
  userData: ISaveUserDetailData
): Promise<IUserDataResponse> => {
  return await localApi.post(
    `${API_URL}/UserMaster/submitAddEditRoleUserData`,
    userData
  );
};

export const createSpPaymentRequestAPI = async (
  body: ICreatePayOutsRequestParams
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/PayOut/createSpPaymentRequest`, body);
};

export const generateCpPayoutInvoiceAPI = async (
  body: IGenerateCpPayoutInvoiceParams
): Promise<IGenerateCpPayoutInvoiceResponse> => {
  return await localApi.post(`${API_URL}/PayOut/generateCpPayoutInvoice`, body);
};

export const generateMasterCpPayoutInvoiceAPI = async (
  body: IGenerateMasterPayoutInvoiceParams
): Promise<IGenerateMasterPayoutInvoiceResponse> => {
  return await localApi.post(`${API_URL}/PayOut/generateMasterCpPayoutInvoice`, body);
};

export const updateSpPayOutRequestAPI = async (
  body: IPayOutsUpdateStatusParams
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/PayOut/updateSpPayOutRequest`, body);
};

export const getAddEditRoleUserDataAPI = async (params: {
  userID: string | null;
}): Promise<IGetAddEditRoleUserResponse> => {
  return await localApi.get(`${API_URL}/UserMaster/getAddEditRoleUserData`, {
    params,
  });
};

export const getUserRightsForUserManagementAPI = async (params: {
  userID: string;
}): Promise<IGetUserRightsForUserManagementResponse> => {
  return await localApi.get(
    `${API_URL}/UserMaster/getUserRightsForUserManagement`,
    {
      params,
    }
  );
};

export const submitUserRightsForUserManagementAPI = async (
  body: IUpdateUserRightBodyData
): Promise<IGetUserRightsForUserManagementResponse> => {
  return await localApi.post(
    `${API_URL}/UserMaster/submitUserRightsForUserManagement`,
    body
  );
};

export const getApplyForLoanAPI = async (
  params: IGetApplyForLoanParams
): Promise<IGetApplyForLoanResponse> => {
  return await localApi.get(`${API_URL}/LoanApplication/getApplyForLoan`, {
    params,
  });
};

export const getCoApplicantsListAPI = async (
  params: { studentId: string },
): Promise<IGetStudentCoApplicantsListResponse> => {
  return await localApi.get(`${API_URL}/Student/getStudentCoApplicantsList`, {
    params,
  });
};

export const submitApplyForLoanAPI = async (
  body: ISubmitCoApplicant
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/LoanApplication/submitApplyForLoan`,
    body
  );
};

export const getGstReportGenerateOtpAPI = async (
  body: IGSTGenerateOTPBody
): Promise<IGSTGenerateOTPResponse> => {
  return await localApi.post(
    `${API_URL}/UserDetails/getGstReportGenerateOtp`,
    body
  );
};

export const getGstReportVerifyOtpAPI = async (
  body: IGSTVerifyOTPBody
): Promise<IExternalReportResponse> => {
  return await localApi.post(`${API_URL}/UserDetails/getGstReportVerifyOtp`, body);
};

export const getUserNotificationListAPI =
  async (params: PaginateReqEntity): Promise<IGetNotificationResponse> => {
    return await localApi.get(
      `${API_URL}/UserNotifications/getUserNotificationList`, { params }
    );
  };

export const updateNotificationStatusAPI = async (
  body: INotificationBody
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/UserNotifications/updateNotificationStatus`,
    body
  );
};

export const resendOtpForCreditReportAPI = async (
  body: IResendOTPCreditScoreBody
): Promise<any> => {
  return await localApi.post(
    `${API_URL}/CreditAnalytics/resendOtpForCreditReport`,
    body
  );
};

export const uploadAllDocumentsAPI = async (
  body: FormData
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/uploadAllDocuments`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteReuploadLoanDocumentAPI = async (
  body: FormData
): Promise<IReUploadedDocumentResponse> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/deleteReuploadLoanDocument`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const fetchUploadedBankDocumentsAPI = async (params: { studentID: string }): Promise<any> => {
  return await localApi.get(
    `${API_URL}/ContentManagement/fetchUploadedBankDocumentsForEducationalInstitute`, {
    params
  }
  );
};

export const fetchLoanMarketPlaceListingAPI = async (
  params: ILoanMarketPlacePayload
): Promise<ILoanMarketResponse> => {
  return await localApi.post(
    `${API_URL}/LoanApplication/loadLoanMarketPlace`,
    params
  );
};

export const submitApplicationToBankAPI = async (
  params: IGetApplyForLoanParams
): Promise<ISubmitLoanApplicationToBankResponse> => {
  return await localApi.post(
    `${API_URL}/LoanApplication/submitApplicationToBank`,
    params
  );
};

export const updateGstDetailsAPI = async (
  body: IGSTListInfo
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/UserDetails/updateGstDetails`, body);
};

export const validateBankStatementFilesAPI = async (
  body: any
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/ContentManagement/validateBankStatementFiles`, body);
};

export const getDataByPincodeAPI = async (params: { pincode: number }): Promise<IPincodeFetchDetailsResponse> => {
  return await localApi.get(`${API_URL}/UserMaster/GetDataByPincode`, { params });
}

export const verifyReferralCodeAPI = async (referralCode: string): Promise<IRefferalDataResponse> => {
  return await localApi.get(`${API_URL}/Referral/verifyReferralCode?referralCode=${referralCode}`);
};

export const fetchStatesAPI = async (): Promise<IFetchStateResponse> => {
  return await localApi.get(`${API_URL}/Client/getStatesList`);
};

export const convertPartnersToCoApplicantsAPI = async (body: { partnersID: string, userType: number }): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/Auth/convertPartnersToCoApplicants`, body);
};

export const updateLoanApplicationAmountAPI = async (body: { loanAppID: string, loanAmount: number, loanTypeID: number }): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/LoanApplication/UpdateLoanApplicationAmount`, body);
}

export const proceedForCreditReportAPI = async (partnerID?: string): Promise<IIsProceedForCreditReportResponse> => {
  const body = partnerID ? { partnerID } : { partnerID: null };

  return await localApi.post(`${API_URL}/CreditAnalytics/proceedForCreditReport`, body);
};

export const updateLoanApplicationJourneyStatusAPI = async (body: { loanAppID: string, loanJourneyStatus: number }): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/LoanApplication/updateLoanApplicationJourneyStatus`, body);
};

export const checkLeadUserExistsOrNoteAPI = async (bodyRequestObject: ICheckLeadUserExistsOrNoteRequest): Promise<IVerifyEmailOTPResponse> => {
  return await localApi.post(`${API_URL}/Auth/checkLeadUserExistsOrNote`, bodyRequestObject);
};

export const createCPPaymentRequestAPI = async (
  body: ICreatePayOutsRequestParams
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/PayOut/createCPPaymentRequest`, body);
};

export const getdomainconfiugrationAPI = async (
  params: IDomainConfigurationRequest
): Promise<IDomainConfigurationResponse> => {
  return await localApi.get(`${API_URL}/Auth/getdomainconfiugration`, { params });
};

export const validateUdyamNumberAPI = async (body: IValidateUdhyamNumberBody): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/UserDetails/validateUdyamNumber`, body);
};

export const validateCinNumberAPI = async (body: IValidateCINNumberBody): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/UserDetails/getNameToCin`, body);
};

export const getCommonDashboardForEducationAPI = async (body: IAdminDashboardFilterBody): Promise<IEducationAdminDashboardResponse> => {
  return await localApi.post(`${API_URL}/LoanApplication/getDashboardData`, body);
};

export const getAllGetEducationalInstituteCoursesAPI = async (body: IEducationCourseManagementFilterReq): Promise<IEducationCourseManagementResponse> => {
  return await localApi.post(`${API_URL}/EducationalInstituteCourse/GetAllGetEducationalInstituteCourses`, body);
};

export const createEducationalInstituteCourseAPI = async (body: any): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/EducationalInstituteCourse/createEducationalInstituteCourse`, body);
};

export const updateEducationalInstituteCourseAPI = async (body: any): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/EducationalInstituteCourse/updateEducationalInstituteCourse`, body);
};

export const getEducationalInstituteCourseByIdAPI = async (courseId: string): Promise<any> => {
  return await localApi.get(`${API_URL}/EducationalInstituteCourse/GetEducationalInstituteCourseDetails`, {
    params: { courseID: courseId },
  });
};

export const getAllStudentLoanApplicationsAPI = async (params: any): Promise<IListAllApplicationsResponse> => {
  return await localApi.get(`${API_URL}/NBFCLoanApplicationManagement/listAllLoanApplications`, { params });
};

export const getAllEducationInstitutesAPI = async (params: any): Promise<IGetAllEducationInstitutesResponse> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/getAlleducationalinstitutelist`, params);
};

export const getEducationInstituteByIdAPI = async (instituteId: string): Promise<IGetAllEducationInstitutesDetailedResponse> => {
  return await localApi.get(`${API_URL}/EducationalInstitute/geteducationalinstitutedetail`, {
    params: { instituteID: instituteId },
  });
};

export const addEducationalInstituteAPI = async (body: IRegisterParams): Promise<IAddEducationalInstituteResponse> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/addeducationalinstitute`, body);
};

export const updateEducationalInstituteAPI = async (
  body: IRegisterParams,
): Promise<IAddEducationalInstituteResponse> => {
  return await localApi.post(
    `${API_URL}/EducationalInstitute/updateeducationalinstitute`,
    body,
  );
};

export const getAllNBFCUsersAPI = async (params: any): Promise<IGetAllNBFCResponse> => {
  return await localApi.post(`${API_URL}/NBFCUser/getAllNBFCUserlist`, params);
};

export const getNBFCUserByIdAPI = async (nbfcId: string): Promise<IGetAllEducationInstitutesDetailedResponse> => {
  return await localApi.get(`${API_URL}/NBFCUser/getNBFCUserdetail`, {
    params: { InstituteID: nbfcId },
  });
};

export const addNBFCUserAPI = async (body: any): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/NBFCUser/addNBFCUser`,
    body,
  );
};

export const updateNBFCUserAPI = async (body: any): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/NBFCUser/updateNBFCUser`,
    body,
  );
};

export const getEducationalInstituteBranchesAPI = async (
  body: IGetEducationalInstituteBranchListParams
): Promise<IGetEducationalInstituteBranchListResponse> => {
  return await localApi.post(
    `${API_URL}/EducationalInstituteBranch/GetAllGetEducationalInstituteBranches`,
    body
  );
};

export const getEducationalInstituteBranchDetailsAPI = async (
  branchId: string
): Promise<IGetEducationalInstituteBranchDetailsResponse> => {
  return await localApi.get(
    `${API_URL}/EducationalInstituteBranch/GetEducationalInstituteBranchDetails`,
    {
      params: { BranchID: branchId },
    }
  );
};

export const createEducationalInstituteBranchAPI = async (
  body: any
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/EducationalInstituteBranch/createEducationalInstituteBranch`, body)
};

export const deleteInstituteNBFCAuthRecordAPI = async (
  body: { parentEntityID: string; authRecordID: string; deleteType: number }
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/NBFCUser/deleteInstituteNBFCAuthRecord`, body)
};

export const updateEducationalInstituteBranchAPI = async (
  body: any
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/EducationalInstituteBranch/updateEducationalInstituteBranch`, body);
};

export const deleteEducationalInstituteBranchAPI = async (
  educationInstituteBranchID: string
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/EducationalInstituteBranch/deleteEducationalInstituteBranch`,
    {},
    {
      params: { educationInstituteBranchID },
    }
  );
};

export const setEducationalInstitutePaymentBranchAPI = async (
  educationInstituteBranchID: string
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/EducationalInstituteBranch/SetPaymentBranch`,
    {},
    {
      params: { educationInstituteBranchID },
    }
  );
};

export const getAllStudentsAPI = async (params: any): Promise<IFetchStudentResponse> => {
  return await localApi.post(`${API_URL}/Student/GetAllStudents`, params);
};

export const getStudentDetailAPI = async (params: {
  studentID: string,
}): Promise<IFetchStudentDetailResponse> => {
  return await localApi.get(`${API_URL}/Student/GetStudentDetail`, { params });
};

export const uploadCommonDocumentAPI = async (body: FormData): Promise<IUploadCommonDocumentResponse> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/uploadCommonDocument`, body);
};

export const uploadEducationalInstituteAgreementAPI = async (body: FormData): Promise<any> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/uploadEducationalInstituteAgreement`, body);
};

export const activeInactiveEducationalInstituteAPI = async (body: any): Promise<any> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/activeInactiveEducationalInstitute`, body);
};

export const activeInactiveNBFCUserAPI = async (body: any): Promise<any> => {
  return await localApi.post(`${API_URL}/NBFCUser/activeInactiveNBFCUser`, body);
};

export const activeInactiveStudentAPI = async (body: any): Promise<any> => {
  return await localApi.post(`${API_URL}/Student/activeInactiveStudent`, body);
};

export const addLoanApplicationForEducationalInstituteAPI = async (body: any): Promise<IAddLoanApplicationForEducationalInstituteResponse> => {
  return await localApi.post(`${API_URL}/NBFCLoanApplicationManagement/addLoanApplicationForEducationalInstitute`, body);
};

export const getEducationPortalLoanDetailsAPI = async (params: {
  loanApplicationId: string;
  studentID: string;
}): Promise<IFetchEducationPortalLoanDetailsResponse> => {
  return await localApi.get(
    `${API_URL}/NBFCLoanApplicationManagement/getEducationPortalLoanDetails`,
    { params },
  );
};

export const fetchMobilePrefillAPI = async (body: IFetchMobilePrefillBody): Promise<IFetchMobilePrefillResponse> => {
  return await localApi.post(`${API_URL}/EducationalInstitute/fetchMobilePrefill`, body);
};

export const createEducationStudentAPI = async (
  bodyRequestObject: any
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/Student/addStudentWithoutOtp`, bodyRequestObject);
};

export const updateEducationStudentAPI = async (
  bodyRequestObject: any
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/Student/updateStudent`, bodyRequestObject);
};

export const deleteEducationStudentAPI = async (
  studentID: string
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/Student/DeleteStudent`, {},
    {
      params: { studentID },
    });
};

export const sendOTPEducationInstituteAPI = async (body: {
  loanApplicationID: string,
  participantID: string,
  participantUserType: number
}
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/NBFCLoanApplicationManagement/sendOTPEducationInstitute`, body);
};

export const verifyOTPEducationInstituteAPI = async (body: {
  loanApplicationID: string,
  participantID: string,
  participantUserType: number,
  otp: number,
  studentID: string
}
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/NBFCLoanApplicationManagement/verifyOTPEducationInstitute`, body);
};

export const updateEducationPortalConsentAPI = async (body: {
  loanApplicationID: string,
  isTermsAndPrivacyConsentGiven: boolean,
  isCreditInformationConsentGiven: boolean,
  isDigiLockerConsentGiven: boolean,
  isDataSharingConsentGiven: boolean,
  isCommunicationConsentGiven: boolean,
}
): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/NBFCLoanApplicationManagement/updateEducationPortalConsent`, body);
};

export const uploadBankStatementFilesEducationalInstituteAPI = async (
  body: UploadRequestBody
): Promise<APIResponseEntity> => {
  return await localApi.post(
    `${API_URL}/ContentManagement/uploadBankStatementFilesEducationalInstitute`,
    body
  );
};

export const isProceedForCamReportForEducationalInstituteAPI = async (
  reportType?: number,
  studentID?: string,
  loanApplicationID?: string
): Promise<IIsProceedForCamReportResponse> => {
  return await localApi.get(
    `${API_URL}/ContentManagement/isProceedForCamReportForEducationalInstitute`,
    {
      params: {
        reportType,
        studentID,
        loanApplicationID,
      },
    }
  );
};

export const sendUpdateMobileOtp = async (body: { mobileNumber: string }): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/auth/sendUpdateMobileOtp`, body);
};

export const verifyUpdateMobileOtp = async (body: { mobileNumber: string, otp: string }): Promise<APIResponseEntity> => {
  return await localApi.post(`${API_URL}/auth/verifyUpdateMobileOtp`, body);
};

export const getStudentLoanDetailAPI = async (params: { loanApplicationID: string }): Promise<IGetStudentLoanDetailResponse> => {
  return await localApi.get(`${API_URL}/EducationalInstitute/getStudentLoanDetail`, { params });
};

export const getLoanMarketPlaceForEducationalInstituteAPI = async (params: { loanApplicationID: string, studentID: string }): Promise<IGetLoanMarketPlaceForEducationalInstituteResponse> => {
  return await localApi.get(`${API_URL}/NBFCLoanApplicationManagement/getLoanMarketPlaceForEducationalInstitute`, { params });
};

export const submitApplicationToBankForEducationalInstituteAPI = async (body: { loanApplicationID: string, studentID: string, bankID: number, nbfcID: string }): Promise<ISubmitLoanApplicationToBankForEducationInstituteResponse> => {
  return await localApi.post(`${API_URL}/LoanApplication/submitApplicationToBankForEducationalInstitute`, body);
};

export const getEduPortalLoanApplicationsAPI = async (body: IGetEduPortalLoanApplicationBody): Promise<IGetEduPortalLoanApplicationResponse> => {
  return await localApi.post(`${API_URL}/LoanApplication/getEduPortalLoanApplications`, body);
};

export const getLoanDetailForNBFCAPI = async (params: { loanApplicationID: string }): Promise<IGetLoanDetailForNBFCResponse> => {
  return await localApi.get(`${API_URL}/NBFCUser/getLoanDetailForNBFC`, { params });
};

export const updateEducationLoanStatusAPI = async (body: FormData): Promise<any> => {
  return await localApi.post(`${API_URL}/NBFCLoanApplicationManagement/UpdateEducationLoanStatus`, body);
};

export const getNodeCatalogsAPI = async (): Promise<IGetNodeCatalogsResponse> => {
  return await localApi.get(`${API_URL}/EducationalInstitute/getNodeCatalogs`);
};

export const getComparisonOptionsAPI = async (): Promise<IGetComparisonOptionsResponse> => {
  return await localApi.get(`${API_URL}/EducationalInstitute/getComparisonOptions`);
};

export const getTerminalOutcomesAPI = async (): Promise<IGetTerminalOutcomesResponse> => {
  return await localApi.get(`${API_URL}/EducationalInstitute/getTerminalOutcomes`);
};

export const createDraftPolicyAPI = async (body: ICreateDraftPolicyBody): Promise<ICreateDraftPolicyResponse> => {
  return await localApi.post(`${API_URL}/EducationInstituteDecisionTree/CreateDraftPolicy`, body);
};

export const getPolicyAPI = async (params: { policyVersionID: number }): Promise<IGetPolicyResponse> => {
  return await localApi.get(`${API_URL}/EducationInstituteDecisionTree/GetPolicy`, { params });
};

export const savePolicyAPI = async (body: IPolicyNode): Promise<ISavePolicyResponse> => {
  return await localApi.post(`${API_URL}/EducationInstituteDecisionTree/SavePolicy`, body);
};

export const simulatePolicyAPI = async (body: ISimulatePolicyBody): Promise<ISimulatePolicyResponse> => {
  return await localApi.post(`${API_URL}/EducationInstituteDecisionTree/SimulatePolicy`, body);
};

export const publishPolicyAPI = async (params: { policyVersionID: number }): Promise<IPublishPolicyResponse> => {
  return await localApi.post(`${API_URL}/EducationInstituteDecisionTree/PublishPolicy`, {}, { params });
};

export const getAllPoliciesAPI = async (params: { institutionID: string }): Promise<IGetAllPoliciesResponse> => {
  return await localApi.get(`${API_URL}/EducationInstituteDecisionTree/GetAllPolicies`, { params });
};

export const clonePolicyAPI = async (body: { policyVersionID: number }): Promise<IPublishPolicyResponse> => {
  return await localApi.post(`${API_URL}/EducationInstituteDecisionTree/ClonePolicy`, body);
};

export const getRuntimeLogsAPI = async (): Promise<IGetRunTimeLogsResponse> => {
  return await localApi.get(`${API_URL}/EducationInstituteDecisionTree/GetRuntimeLogs`);
};

export const getRuntimeLogDetailAPI = async (params: { runtimeLogID: number }): Promise<IGetRunTimeLogsDetailResponse> => {
  return await localApi.get(`${API_URL}/EducationInstituteDecisionTree/GetRuntimeLogDetail`, { params });
};

export const createLinkAPI = async (
  body: ISubscriptionBody
): Promise<ISubscriptionResponse> => {
  return await localApi.post(`${API_URL}/Payment/createLinkForEducationalInstitute`, body);
};

export const getInstituteReportStudentListAPI = async (
  params: IInstituteReportParams,
): Promise<IInstituteReportResponse> => {
  return await localApi.get(`${API_URL}/Reports/getInstituteReportStudentList`, {
    params,
  });
};

export const getStudentReportDetailAPI = async (params: { studentID: string, isStudentDetailsRequired: boolean }): Promise<IStudentReportDetailResponse> => {
  return await localApi.get(`${API_URL}/Reports/getInstituteReportStudentDetails`, {
    params
  })
}

export const downloadAllReportsAPI = async (
  reportTypes: number[],
  userId: string,
): Promise<any> => {
  const queryString =
    reportTypes.map((type) => `reportTypes=${type}`).join("&") +
    `&userId=${userId}`;

  return await localApi.get(
    `${API_URL}/Reports/downloadAllReports?${queryString}`,
    {
      responseType: "arraybuffer",
    },
  );
};
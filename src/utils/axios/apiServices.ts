import axios, { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { API_URL } from "../constants/constant";
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
import { IAdminDashboardResponse } from "../../interface/adminDashboard";
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
  IApplyLoanApplicationResponse,
  IGetApplyForLoanParams,
  IGetApplyForLoanResponse,
  ISubmitCoApplicant,
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
  getDemoUserManagementList,
  getDemoUserProfile,
  getDemoUserNotifications,
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
  getVerifyReferralCode,
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

function checkInternetConnectivity(): boolean {
  return navigator.onLine;
}

axios.interceptors.request.use(
  (config) => {
    if (!checkInternetConnectivity()) {
      toastError("No Internet Connection");
      return Promise.reject(new Error("No Internet Connection"));
    }

    const deviceId = document.cookie
      .split(";")
      .find((cookie) => cookie.startsWith(" deviceId="))
      ?.split("=")[1];

    const token = getDecryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN
    );

    if (!config.headers) {
      config.headers = {} as AxiosHeaders;
    }

    if (deviceId) {
      config.headers["X-Device-Id"] = deviceId;
    }

    if (token) {
      config.headers["X-Session-Token"] = token;
    }

    config.headers["Isimpersonatedclient"] = store
      .getState()
      .impersonateUser.isImpersonate.toString();

    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["X-Frame-Options"] = "DENY";
    config.headers["Content-Security-Policy"] = "frame-ancestors 'none'";

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      store.dispatch(setLogout());
      return;
    }

    let message =
      "A small error has occurred, causing an interruption of service. Please try again";

    if (!checkInternetConnectivity()) {
      message =
        "We're having trouble connecting to the network. Please try again later.";
    } else if (error?.response) {
      const errorResponse: AxiosResponse = error.response;
      message = errorResponse?.data?.message || message;
    }

    toastError(message);
    return Promise.reject(error);
  }
);

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
  return await axios.get(`${API_URL}/ChannelPartner/getAllChannelpartners`, {
    params: data,
  });
};

export const fetchDetailsByPan = async (
  payload: OnlyPanNumber
): Promise<IAddPanCardResponse> => {
  return await getDemoPanDetails();
};

export const fetchUserProfile = async (): Promise<IUserProfileResponse> => {
  return await getDemoUserProfile();
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
  return await axios.get(`${API_URL}/ChannelPartner/viewCpDetails`, { params });
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
    return await axios.get(`${API_URL}/Client/getClientDashboard`);
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
  return await axios.post(`${API_URL}/RolesAndRights/deleteRole`, params);
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
  return await axios.post(`${API_URL}/PayOut/updatePayOut`, body);
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
  return await axios.post(
    `${API_URL}/CreditAnalytics/sendOtpForCreditReport`,
    {},
    {
      params: { partnerID },
    }
  );
};

export const getCreditAnalyticsVerifyOtpAPI = async (
  body: IFetchCreditScoreBody
): Promise<ICreditAnalyticsResponse> => {
  return await axios.post(
    `${API_URL}/CreditAnalytics/verifyOtpAndGenerateReport`,
    body
  );
};

export const fetchImpersonateUser = async (
  body: IGeneratePublicTokenRequest
): Promise<IVerifyEmailOTPResponse> => {
  return await axios.post(`${API_URL}/Auth/impersonateUser`, body);
};

export const getInstitutionList =
  async (): Promise<IInstitutionListResponse> => {
    return await axios.get(`${API_URL}/Reports/getInstitutionList`);
  };

export const getBankDetailsAPI = async (
  body: FormData
): Promise<IUploadBankDocumentResponse> => {
  return await axios.post(
    `${API_URL}/ContentManagement/uploadLoanDocuments`,
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
  return await getDemoCpSpList();
};

export const addPanForCPAPI = async (
  body: OnlyPanNumber
): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/Auth/addPanForCP`, body);
};

export const generateAadharOTP = async (
  body: OnlyAadharNumber
): Promise<IAadharCardResponse> => {
  return await axios.post(`${API_URL}/UserDetails/generateAadharOTP`, body);
};

export const updateAadharAPI = async (
  body: IUpdateAadhaarBody
): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/UserMaster/updateAadhaar`, body);
};

export const getLoanTypeListAPI = async (): Promise<ILoanTypeListResponse> => {
  return await getDemoLoanTypeList();
};

export const addLoanApplicationAPI = async (
  body: IAddLoanApplication
): Promise<IApplyLoanApplicationResponse> => {
  return await addDemoLoanApplication();
};

export const getAdminDashboardAPI =
  async (): Promise<IAdminDashboardResponse> => {
    return await axios.get(`${API_URL}/LoanApplication/getAdminDashboard`);
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
  return await axios.post(`${API_URL}/PayOut/createSpPaymentRequest`, body);
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
  return await axios.get(
    `${API_URL}/UserMaster/getUserRightsForUserManagement`,
    {
      params,
    }
  );
};

export const submitUserRightsForUserManagementAPI = async (
  body: IUpdateUserRightBodyData
): Promise<IGetUserRightsForUserManagementResponse> => {
  return await axios.post(
    `${API_URL}/UserMaster/submitUserRightsForUserManagement`,
    body
  );
};

export const getAdminChannelPartnerReportAPI = async (
  params: IReportParams
): Promise<IReportResponse> => {
  return await axios.get(`${API_URL}/Reports/getAdminChannelPartnerReport`, {
    params,
  });
};

export const getAdminGeographicalReportAPI = async (
  params: IReportParams
): Promise<IGeographicalReportResponse> => {
  return await axios.get(`${API_URL}/Reports/getAdminGeographicalReport`, {
    params,
  });
};

export const updateLoanApplicationStatusAPI = async (
  body: IUpdateLoanStatus
): Promise<IUpdateLoanStatusResponse> => {
  return await updateDemoLoanApplicationStatus();
};

export const getApplyForLoanAPI = async (
  params: IGetApplyForLoanParams
): Promise<IGetApplyForLoanResponse> => {
  return await axios.get(`${API_URL}/LoanApplication/getApplyForLoan`, {
    params,
  });
};

export const submitApplyForLoanAPI = async (
  body: ISubmitCoApplicant
): Promise<APIResponseEntity> => {
  return await axios.post(
    `${API_URL}/LoanApplication/submitApplyForLoan`,
    body
  );
};

export const getGstReportGenerateOtpAPI = async (
  body: IGSTGenerateOTPBody
): Promise<IGSTGenerateOTPResponse> => {
  return await axios.post(
    `${API_URL}/UserDetails/getGstReportGenerateOtp`,
    body
  );
};

export const getGstReportVerifyOtpAPI = async (
  body: IGSTVerifyOTPBody
): Promise<IExternalReportResponse> => {
  return await axios.post(`${API_URL}/UserDetails/getGstReportVerifyOtp`, body);
};

export const getGstDetailsAPI = async (): Promise<IGSTReportResponse> => {
  return await axios.get(`${API_URL}/UserDetails/getGstDetails`);
};

export const getITRDetailsAPI = async (): Promise<IITRReportResponse> => {
  return await axios.get(`${API_URL}/UserDetails/getITRDetails`);
};

export const getBankingAnalyticsDetailsAPI =
  async (): Promise<IBankingAnalyticsReportResponse> => {
    return await axios.get(`${API_URL}/UserDetails/getBankingAnalyticsDetails`);
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
  return await getDemoCpReportDetail();
};

export const fetchDocumentStatusAPI = async (body: {
  loanType: number;
  loanApplicationID: string | null;
}): Promise<IDocumentListResponse> => {
  return await axios.get(`${API_URL}/ContentManagement/fetchDocumentStatus`, {
    params: body,
  });
};

export const getDocumentDetailsAPI = async (params: {
  folderName: string;
  loanApplicationID: string | null;
}): Promise<IDocumentListDetailResponse> => {
  return await axios.get(`${API_URL}/ContentManagement/getDocumentDetails`, {
    params,
  });
};

export const getSubFolderDetailsAPI = async (params: {
  folderName: string;
  subFolderName: string;
  loanApplicationID: string | null;
}): Promise<IDocumentListDetailResponse> => {
  return await axios.get(`${API_URL}/ContentManagement/getSubfolderDetails`, {
    params,
  });
};

export const fileAutomatedRequestForItrAPI = async (
  body: IITRReportBody
): Promise<IExternalReportResponse> => {
  return await axios.post(
    `${API_URL}/UserDetails/fileAutomatedRequestForItr`,
    body
  );
};

export const resendOtpForCreditReportAPI = async (
  body: IResendOTPCreditScoreBody
): Promise<any> => {
  return await axios.post(
    `${API_URL}/CreditAnalytics/resendOtpForCreditReport`,
    body
  );
};

export const uploadBankStatementFilesAPI = async (
  body: UploadRequestBody
): Promise<APIResponseEntity> => {
  return await axios.post(
    `${API_URL}/ContentManagement/uploadBankStatementFiles`,
    body
  );
};

export const uploadAllDocumentsAPI = async (
  body: FormData
): Promise<APIResponseEntity> => {
  return await axios.post(
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
  return await axios.post(
    `${API_URL}/ContentManagement/deleteReuploadLoanDocument`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteUploadRemainingDocumentsAPI = async (
  body: FormData
): Promise<APIResponseEntity> => {
  return await axios.post(
    `${API_URL}/ContentManagement/deleteUploadRemainingDocuments`,
    body,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const downloadAllReportsAPI = async (
  reportTypes: number[],
  userId: string
): Promise<any> => {
  const queryString =
    reportTypes.map((type) => `reportTypes=${type}`).join("&") +
    `&userId=${userId}`;

  return await axios.get(
    `${API_URL}/Reports/downloadAllReports?${queryString}`,
    {
      responseType: "arraybuffer",
    }
  );
};

export const fetchUploadedBankDocumentsAPI = async (): Promise<any> => {
  return await axios.get(
    `${API_URL}/ContentManagement/fetchUploadedBankDocuments`
  );
};

export const fetchLoanMarketPlaceListingAPI = async (
  params: ILoanMarketPlacePayload
): Promise<ILoanMarketResponse> => {
  return await axios.post(
    `${API_URL}/LoanApplication/loadLoanMarketPlace`,
    params
  );
};

export const submitApplicationToBankAPI = async (
  params: IGetApplyForLoanParams
): Promise<ISubmitLoanApplicationToBankResponse> => {
  return await axios.post(
    `${API_URL}/LoanApplication/submitApplicationToBank`,
    params
  );
};

export const updateGstDetailsAPI = async (
  body: IGSTListInfo
): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/UserDetails/updateGstDetails`, body);
};

export const validateBankStatementFilesAPI = async (
  body: any
): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/ContentManagement/validateBankStatementFiles`, body);
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
  return await axios.get(`${API_URL}/ContentManagement/getSecureUnsecureDocumentList`);
};

export const moveDocumentAPI = async (body: IMoveDocumentBody): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/ContentManagement/moveDocument`, body);
};

export const generateSpPayoutInvoiceAPI = async (body: IGenerateSpPayoutInvoiceParams): Promise<IGenerateSpPayoutInvoiceResponse> => {
  return await generateDemoSpPayoutInvoice();
};

export const generateSubscriptionInvoiceAPI = async (body: IGenerateSubscriptionInvoiceParams): Promise<IGenerateSubscriptionInvoiceResponse> => {
  return await axios.post(`${API_URL}/PayOut/generateSubscriptionInvoice`, body);
};

export const fetchAllPaymentsAPI = async (params: IPaginateReqEntityForSubscription): Promise<IFetchAllPaymentsResponse> => {
  return await axios.get(`${API_URL}/Payment/fetchAllPayments`, { params });
};

export const validateGstReportGenerationAPI = async (body: IGSTValidateReportBody): Promise<IValidateGSTReportResponse> => {
  return await axios.post(`${API_URL}/UserDetails/validateGstReportGeneration`, body);
};

export const generateGstReportAPI = async (body: IGSTValidateReportBody): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/UserDetails/generateGstReport`, body);
};

export const fileAutomatedRequestForItrUsingLinkAPI = async (body: { email: string }): Promise<any> => {
  return await axios.post(`${API_URL}/UserDetails/fileAutomatedRequestForItrUsingLink`, body);
};

export const generateITRReportAPI = async (body: IShareLinkITRReportBody): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/UserDetails/generateITRReport`, body);
};

export const getGstReportGenerateOtpUsingLinkAPI = async (body: IGenerateGstReportUsingLinkBodyForOTP): Promise<IGenerateGstReportShareLink> => {
  return await axios.post(`${API_URL}/UserDetails/getGstReportGenerateOtpUsingLink`, body);
};

export const getGstReportViaPasswordUsingLinkAPI = async (body: IGenerateGstReportUsingLinkBodyForPassword): Promise<IGenerateGstReportShareLink> => {
  return await axios.post(`${API_URL}/UserDetails/getGstReportViaPasswordUsingLink`, body);
};

export const getGstReportForLinkApproachAPI = async (body: { referenceID: string }): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/UserDetails/getGstReportForLinkApproach`, body);
};

export const uploadSanctionLetterForLoanApplicationAPI = async (data: FormData): Promise<IUpdateLoanStatusResponse> => {
  return await uploadDemoSanctionLetter();
};

export const getDataByPincodeAPI = async (params: { pincode: number }): Promise<IPincodeFetchDetailsResponse> => {
  return await getDemoPincode();
}

export const getPaymentFetchUserTabWiseAPI = async (params: IPaginateReqEntityForFetchUserTabWise): Promise<IFetchTabWiseUserListingResponse> => {
  return await axios.get(
    `${API_URL}/Payment/fetchUserTabwise`,
    {
      params,
    }
  );
};

export const addCreditsAPI = async (body: IAddCreditsBody): Promise<APIResponseEntity> => {
  return await axios.post(
    `${API_URL}/Payment/addCreditForUser`,
    body
  );
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
  return await axios.post(`${API_URL}/LoanApplication/submitApplicationToBank`, body);
}

export const fetchReferralCodeAPI = async (): Promise<IRefferalCodeResponse> => {
  return await getDemoReferralCode();
};

export const IsProceedForCamReport = async (
  reportType?: number
): Promise<IIsProceedForCamReportResponse> => {
  return await axios.get(
    `${API_URL}/ContentManagement/isProceedForCamReport`,
    {
      params: {
        ReportType: reportType,
      },
    }
  );
};

export const fetchStatesAPI = async (): Promise<IFetchStateResponse> => {
  return await getDemoStates();
};

export const convertPartnersToCoApplicantsAPI = async (body: { partnersID: string, userType: number }): Promise<APIResponseEntity> => {
  return await convertDemoPartnersToCoApplicants();
};

export const updateLoanApplicationAmountAPI = async (body: { loanAppID: string, loanAmount: string, loanTypeID: number }): Promise<APIResponseEntity> => {
  return await axios.post(`${API_URL}/LoanApplication/UpdateLoanApplicationAmount`, body);
}

export const proceedForCreditReportAPI = async (): Promise<IIsProceedForCreditReportResponse> => {
  return await axios.post(`${API_URL}/CreditAnalytics/proceedForCreditReport`);
};

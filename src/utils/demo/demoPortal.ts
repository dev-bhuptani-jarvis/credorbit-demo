import { APIResponseEntity } from "../../interface/apiResponse";
import { IChannelPartnerDashboardResponse } from "../../interface/channelPartnerDashboard";
import { IGetAllLoanApplicationsResponse } from "../../interface/channelPartnerDashboard";
import { IClientResponse, IGetPartnerListResponse } from "../../interface/client";
import { IClientMasterResponse } from "../../interface/clientMaster";
import { IGetNotificationResponse } from "../../interface/notifications";
import { IApplyLoanApplicationResponse } from "../../interface/applyLoan";
import { ILoanResponse, ILoanTypeListResponse } from "../../interface/loanDetail";
import {
  ISubscriptionListingResponse,
  ISubscriptionResponse,
  ISubscriptionPlanListingResponse,
  ISubscriptionUsageResponse,
} from "../../interface/subscription";
import {
  IPincodeFetchDetailsResponse,
  IUserProfileResponse,
  PartnerData,
} from "../../interface/userData";
import { IAddPanCardResponse } from "../../interface/panCardResponse";
import { ILogoutResponse } from "../../interface/logout";
import { IUpdateLoanStatusResponse } from "../../interface/loanDetail";
import {
  IFetchStateResponse,
  IGenerateCpPayoutInvoiceResponse,
  IPayOutsDetailResponse,
  IPayOutsResponse,
  ISourcingPartnerPayOutDetailResponse,
  ISourcingPartnerPayOutsResponse,
} from "../../interface/payOuts";
import {
  IGetAddEditRoleUserResponse,
  ISaveUserDetailData,
  IUserDataResponse,
} from "../../interface/userManagement";
import {
  IRoleDetailResponse,
  IRoleMasterResponse,
} from "../../interface/roleMaster";
import { ISourcingPartnerResponse } from "../../interface/sourcingPartner";
import {
  IChannelPartnerClientReportDetailResponse,
  IChannelPartnerClientReportResponse,
} from "../../interface/reports";
import {
  IRefferalCodeResponse,
  IRefferalDataResponse,
  IRefferalListingResponse,
  IWalletListingResponse,
} from "../../interface/wallet";
import { decryptVAPTData, encryptVAPTData } from "../functions/encryptDecrypt";
import { getDecryptedSessionStorage } from "../functions/sessionStorage";
import { StorageKeyEnum } from "../constants/enum";
import { ISourcingPartnerDetailsResponse } from "../../interface/sourcingPartner";
import {
  getDemoUserProfileByContext,
  persistDemoProfileById,
} from "./demoProfile";

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const DEMO_DELAY_MS = 250;

const demoPartnerListResponse: IGetPartnerListResponse = {
  status: true,

  statusCode: 200,

  message:
    "User list fetched successfully!",

  data: [
    {
      id:
        "DEMO-LA-001",

      name:
        "ABC INDUSTRIES PRIVATE LIMITED",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-002",

      name:
        "XYZ BUSINESS SOLUTIONS LLP",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-003",

      name:
        "MNO USER",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-004",

      name:
        "OPQ USER",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-005",

      name:
        "RST USER",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-006",

      name:
        "UVW USER",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-007",

      name:
        "XYZ USER",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-008",

      name:
        "GLOBAL TECH ENTERPRISES",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-009",

      name:
        "NEXUS INDUSTRIAL SOLUTIONS LLP",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-010",

      name:
        "ABC SOURCE SP",

      email:
        "abc@gmail.com",
    },

    {
      id:
        "DEMO-LA-011",

      name:
        "DEF SOURCE SP",

      email:
        "abc@gmail.com",
    },
  ],
};

const demoNotificationsResponse: IGetNotificationResponse = {
  status: true,
  statusCode: 200,
  message: "User Notification List fetched successfully!",
  data: {
    userNotifications: [],
    totalCount: 0,
    unReadNotificationCount: 0,
  },
};

const demoChannelPartnerDashboardResponse: IChannelPartnerDashboardResponse = {
  status: true,
  statusCode: 200,
  message: "Dashboard of the channel partner fetched successfully!",
  data: {
    totalLoanApplicationsCountByStatus: [
      {
        displayName: "Pending Applications",
        displayOrder: 1,
        amount: 11604515241,
        noOfApplications: 5,
        formattedAmount: "1160.45 Cr+",
        statusID: 1,
      },
      {
        displayName: "Login Applications",
        displayOrder: 2,
        amount: 2902000,
        noOfApplications: 4,
        formattedAmount: "29.02 Lac+",
        statusID: 2,
      },
      {
        displayName: "Query Raised Applications",
        displayOrder: 3,
        amount: 1500000,
        noOfApplications: 1,
        formattedAmount: "15.00 Lac+",
        statusID: 3,
      },
      {
        displayName: "Sanctioned Applications",
        displayOrder: 4,
        amount: 3530000,
        noOfApplications: 4,
        formattedAmount: "35.30 Lac+",
        statusID: 4,
      },
      {
        displayName: "Pending at Credit Applications",
        displayOrder: 5,
        amount: 1500000,
        noOfApplications: 1,
        formattedAmount: "15.00 Lac+",
        statusID: 5,
      },
      {
        displayName: "Disbursed Applications",
        displayOrder: 6,
        amount: 50735281222,
        noOfApplications: 5,
        formattedAmount: "5073.53 Cr+",
        statusID: 6,
      },
      {
        displayName: "Rejected Applications",
        displayOrder: 7,
        amount: 1515000,
        noOfApplications: 2,
        formattedAmount: "15.15 Lac+",
        statusID: 7,
      },
    ],
    loanApplicationStatusGraphList: [
      {
        statusID: 1,
        status: "Pending",
        percentageValue: 54.040405,
        color: "#FF632C",
      },
      {
        statusID: 2,
        status: "Applied",
        percentageValue: 2.020202,
        color: "#3DA0E7",
      },
      {
        statusID: 3,
        status: "Query Raised",
        percentageValue: 0.5050505,
        color: "#F4A917",
      },
      {
        statusID: 4,
        status: "Sanctioned",
        percentageValue: 2.020202,
        color: "#947CFB",
      },
      {
        statusID: 5,
        status: "Pending at Credit",
        percentageValue: 0.5050505,
        color: "#9AC900",
      },
      {
        statusID: 6,
        status: "Disbursed",
        percentageValue: 39.89899,
        color: "#0BB680",
      },
      {
        statusID: 7,
        status: "Rejected",
        percentageValue: 1.010101,
        color: "#F64F59",
      },
    ],
    isAddApplicationEnabled: true,
    userDetails: {
      contractEnforcementDate: "2025-10-09T00:00:00",
      emailID: "PjCsDPUr/SMcy0TJrJ1Wb5Ggye2vwjyj41h4oJMW5LQ=",
      isContractSigned: true,
      profilePicture:
        "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      showPanDetailPopUp: false,
      userName: "Jarvis Credo CP",
    },
  },
};

const demoEducationInstituteDashboardResponse: IChannelPartnerDashboardResponse = {
  status: true,
  statusCode: 200,
  message: "Dashboard of the education institute fetched successfully!",
  data: {
    totalLoanApplicationsCountByStatus: [
      {
        displayName: "Pending Applications",
        displayOrder: 1,
        amount: 11604515241,
        noOfApplications: 5,
        formattedAmount: "1160.45 Cr+",
        statusID: 1,
      },
      {
        displayName: "Login Applications",
        displayOrder: 2,
        amount: 2902000,
        noOfApplications: 4,
        formattedAmount: "29.02 Lac+",
        statusID: 2,
      },
      {
        displayName: "Query Raised Applications",
        displayOrder: 3,
        amount: 1500000,
        noOfApplications: 1,
        formattedAmount: "15.00 Lac+",
        statusID: 3,
      },
      {
        displayName: "Sanctioned Applications",
        displayOrder: 4,
        amount: 3530000,
        noOfApplications: 4,
        formattedAmount: "35.30 Lac+",
        statusID: 4,
      },
      {
        displayName: "Pending at Credit Applications",
        displayOrder: 5,
        amount: 1500000,
        noOfApplications: 1,
        formattedAmount: "15.00 Lac+",
        statusID: 5,
      },
      {
        displayName: "Disbursed Applications",
        displayOrder: 6,
        amount: 50735281222,
        noOfApplications: 5,
        formattedAmount: "5073.53 Cr+",
        statusID: 6,
      },
      {
        displayName: "Rejected Applications",
        displayOrder: 7,
        amount: 1515000,
        noOfApplications: 2,
        formattedAmount: "15.15 Lac+",
        statusID: 7,
      },
    ],
    loanApplicationStatusGraphList: [
      {
        statusID: 1,
        status: "Pending",
        percentageValue: 54.040405,
        color: "#FF632C",
      },
      {
        statusID: 2,
        status: "Applied",
        percentageValue: 2.020202,
        color: "#3DA0E7",
      },
      {
        statusID: 3,
        status: "Query Raised",
        percentageValue: 0.5050505,
        color: "#F4A917",
      },
      {
        statusID: 4,
        status: "Sanctioned",
        percentageValue: 2.020202,
        color: "#947CFB",
      },
      {
        statusID: 5,
        status: "Pending at Credit",
        percentageValue: 0.5050505,
        color: "#9AC900",
      },
      {
        statusID: 6,
        status: "Disbursed",
        percentageValue: 39.89899,
        color: "#0BB680",
      },
      {
        statusID: 7,
        status: "Rejected",
        percentageValue: 1.010101,
        color: "#F64F59",
      },
    ],
    isAddApplicationEnabled: true,
    userDetails: {
      contractEnforcementDate: "2025-10-09T00:00:00",
      emailID: "educationinstitute1@yopmail.com",
      isContractSigned: true,
      profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      showPanDetailPopUp: false,
      userName: "Education Institute One",
    },
  },
};

const getCurrentDemoUser = (): { userID?: string } | null => {
  const currentUserData = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_USER_DATA,
  );

  if (!currentUserData) return null;

  try {
    return JSON.parse(currentUserData);
  } catch {
    return null;
  }
};

const demoSubscriptionHistoryResponse: ISubscriptionListingResponse = {
  status: true,
  statusCode: 200,
  message: "Subcription history fetched successfully!",
  data: {
    totalCredits: 2190469,
    reservedCredits: 396,
    subscriptionHistory: [
      {
        paymentLinkID: "203",
        planName: "Value Plus Plan",
        amount: 2358.82,
        gstAmount: 359.82,
        amountWithoutGst: 1999,
        creditPoints: 2200,
        dateTime: "2026-04-01T17:19:05.009716",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "202",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-04-01T16:44:36.774228",
        paymentStatus: "Created",
        colorCode: "#17a2b8",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "201",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-04-01T16:43:49.071867",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "200",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-31T18:57:50.383813",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "199",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-31T16:31:14.333059",
        paymentStatus: "Expired",
        colorCode: "#dc3545",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "197",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-25T14:06:19.986654",
        paymentStatus: "Expired",
        colorCode: "#dc3545",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "196",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-23T16:47:18.43312",
        paymentStatus: "Expired",
        colorCode: "#dc3545",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "195",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-20T16:41:35.740692",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "194",
        planName: "Custom Plan",
        amount: 472000,
        gstAmount: 72000,
        amountWithoutGst: 400000,
        creditPoints: 500000,
        dateTime: "2026-03-20T16:27:01.498863",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "193",
        planName: "Custom Plan",
        amount: 472000,
        gstAmount: 72000,
        amountWithoutGst: 400000,
        creditPoints: 500000,
        dateTime: "2026-03-19T17:02:22.797131",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "192",
        planName: "Max Saver Plan",
        amount: 11798.82,
        gstAmount: 1799.82,
        amountWithoutGst: 9999,
        creditPoints: 12000,
        dateTime: "2026-03-19T16:56:28.098434",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "191",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-19T16:55:01.27078",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "190",
        planName: "Max Saver Plan",
        amount: 11798.82,
        gstAmount: 1799.82,
        amountWithoutGst: 9999,
        creditPoints: 12000,
        dateTime: "2026-03-19T16:12:19.505657",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "189",
        planName: "Max Saver Plan",
        amount: 11798.82,
        gstAmount: 1799.82,
        amountWithoutGst: 9999,
        creditPoints: 12000,
        dateTime: "2026-03-18T17:47:23.443888",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "188",
        planName: "Max Saver Plan",
        amount: 11798.82,
        gstAmount: 1799.82,
        amountWithoutGst: 9999,
        creditPoints: 12000,
        dateTime: "2026-03-18T17:24:56.617415",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "187",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-16T13:52:10.788202",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "185",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-03-05T13:22:04.601474",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
      {
        paymentLinkID: "184",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-02-24T17:45:17.174451",
        paymentStatus: "Expired",
        colorCode: "#dc3545",
        subscriptionUrl: null as unknown as string,
      },
      {
        paymentLinkID: "183",
        planName: "Kickstart Plan",
        amount: 588.82,
        gstAmount: 89.82,
        amountWithoutGst: 499,
        creditPoints: 500,
        dateTime: "2026-02-17T13:46:10.04072",
        paymentStatus: "Paid",
        colorCode: "#28a745",
        subscriptionUrl:
          "/assets/images/Subscription_Invoice.pdf",
      },
    ],
  },
};

const demoSubscriptionPlansResponse: ISubscriptionPlanListingResponse = {
  status: true,
  statusCode: 200,
  message: "Subscription plans fetched successfully!",
  data: [
    {
      "planID": 6,
      "name": "Value Plus Plan",
      "credits": 2499,
      "price": 2499,
    },
    {
      "planID": 7,
      "name": "Power Pack Plan",
      "credits": 5500,
      "price": 4999,
    },
    {
      "planID": 8,
      "name": "Max Saver Plan",
      "credits": 12000,
      "price": 9999,
    },
    {
      "planID": 9,
      "name": "Custom Plan",
      "credits": 0,
      "price": 0,
    }
  ],
};

const demoSubscriptionUsageResponse: ISubscriptionUsageResponse = {
  status: true,
  statusCode: 200,
  message: "Subcription history fetched successfully!",

  data: {
    subscriptionUsage: [
      {
        id: 467,

        credits: 199,

        isCreditsAdd: null,

        reason:
          "CAM report downloaded for UserName : ABC INDUSTRIES PRIVATE LIMITED, UserID : demo-user-id-001",

        createdAt:
          "2026-04-09T19:32:41.800319",
      },

      {
        id: 466,

        credits: 199,

        isCreditsAdd: null,

        reason:
          "CAM report downloaded for UserName : MNO USER, UserID : demo-user-id-002",

        createdAt:
          "2026-04-09T18:38:14.530856",
      },

      {
        id: 465,

        credits: 199,

        isCreditsAdd: null,

        reason:
          "CAM report downloaded for UserName : XYZ BUSINESS SOLUTIONS LLP, UserID : demo-user-id-003",

        createdAt:
          "2026-04-08T16:39:41.211145",
      },

      {
        id: 464,

        credits: 99,

        isCreditsAdd: null,

        reason:
          "Credit report downloaded for UserName : DEF INDUSTRIES PRIVATE LIMITED, UserID : demo-user-id-004",

        createdAt:
          "2026-04-08T16:31:49.413303",
      },

      {
        id: 463,

        credits: 99,

        isCreditsAdd: null,

        reason:
          "Credit report downloaded for UserName : OPQ USER, UserID : demo-user-id-005",

        createdAt:
          "2026-04-08T16:16:32.587099",
      },

      {
        id: 462,

        credits: 500,

        isCreditsAdd: true,

        reason:
          "Recharge",

        createdAt:
          "2026-04-01T16:43:48.826443",
      },

      {
        id: 461,

        credits: 2200,

        isCreditsAdd: true,

        reason:
          "Recharge",

        createdAt:
          "2026-04-01T17:19:04.800324",
      },

      {
        id: 460,

        credits: 199,

        isCreditsAdd: false,

        reason:
          "Banking report generated successfully UserName : XYZ USER, UserId : demo-user-id-006",

        createdAt:
          "2026-03-31T17:20:53.332296",
      },

      {
        id: 459,

        credits: 99,

        isCreditsAdd: false,

        reason:
          "ITR Report download success for UserName : RST USER, UserID : demo-user-id-007",

        createdAt:
          "2026-03-31T18:23:58.681361",
      },

      {
        id: 458,

        credits: 199,

        isCreditsAdd: null,

        reason:
          "CAM report downloaded for UserName : GLOBAL TECH ENTERPRISES, UserID : demo-user-id-008",

        createdAt:
          "2026-03-29T19:13:15.106461",
      },
    ],
  },
};

const demoReferralCodeResponse: IRefferalCodeResponse = {
  status: true,
  statusCode: 200,
  message: "Referral code fetched successfully",
  data: "CP-THQZS4",
};

const demoVerifyReferralCodeResponse: IRefferalCodeResponse = {
  status: true,
  statusCode: 200,
  message: "Valid referral code",
  data: "true",
};

const demoTrackReferralsResponse: IRefferalListingResponse = {
  status: true,
  statusCode: 200,
  message: "Referral list fetched successfully",

  data: [
    {
      referredName:
        "ABC INDUSTRIES PRIVATE LIMITED",

      referralCode:
        "DEMO-REF-001",

      status:
        "CONFIRMED",

      referredDate:
        "2026-03-05T13:29:13.996003",
    },

    {
      referredName:
        "MNO USER",

      referralCode:
        "DEMO-REF-001",

      status:
        "CONFIRMED",

      referredDate:
        "2026-01-12T16:04:27.102967",
    },

    {
      referredName:
        "OPQ USER",

      referralCode:
        "DEMO-REF-001",

      status:
        "CONFIRMED",

      referredDate:
        "2026-01-08T18:26:50",
    },
  ],
};

const demoWalletHistoryResponse: IWalletListingResponse = {
  status: true,
  statusCode: 200,
  message: "Wallet history fetched successfully",

  data: [
    {
      date:
        "2026-03-05T13:30:37.892545",

      transactionType:
        "CREDIT",

      points: 59,

      description:
        "You earned 59 points because ABC INDUSTRIES PRIVATE LIMITED recharged their subscription.",
    },

    {
      date:
        "2026-01-12T18:16:42.040831",

      transactionType:
        "CREDIT",

      points: 590,

      description:
        "You earned 590 points because MNO USER recharged their subscription.",
    },

    {
      date:
        "2026-01-12T16:35:33.973763",

      transactionType:
        "CREDIT",

      points: 1180,

      description:
        "You earned 1180 points because MNO USER recharged their subscription.",
    },

    {
      date:
        "2026-01-12T16:34:14.582296",

      transactionType:
        "CREDIT",

      points: 59,

      description:
        "You earned 59 points because MNO USER recharged their subscription.",
    },

    {
      date:
        "2026-01-12T01:02:34.62965",

      transactionType:
        "CREDIT",

      points: 236,

      description:
        "You earned 236 points because OPQ USER recharged their subscription.",
    },

    {
      date:
        "2026-01-12T00:36:05.906207",

      transactionType:
        "CREDIT",

      points: 58,

      description:
        "You earned 58 points because OPQ USER recharged their subscription.",
    },

    {
      date:
        "2026-01-08T18:29:04",

      transactionType:
        "CREDIT",

      points: 500,

      description:
        "You earned 500 points because OPQ USER recharged their subscription.",
    },
  ],
};

const demoReferralPointsResponse: IRefferalDataResponse = {
  status: true,
  statusCode: 200,
  message: "Wallet balance fetched successfully",
  data: 2682,
};

const demoPayOutsListResponse: IPayOutsResponse = {
  status: true,

  statusCode: 200,

  message:
    "Payout List fetched successfully!",

  data: {
    totalPayOutsCount: 10,

    payOuts: [
      {
        payoutID:
          "demo-payout-id-001",

        userName:
          "Demo Prime CP",

        month:
          "April 2026",

        amountSanctioned:
          8505012,

        amountDisburse:
          8505012,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-002",

        userName:
          "Demo Prime CP",

        month:
          "March 2026",

        amountSanctioned:
          2116200,

        amountDisburse:
          2116200,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-003",

        userName:
          "Demo Prime CP",

        month:
          "February 2026",

        amountSanctioned:
          2807100,

        amountDisburse:
          2807100,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-004",

        userName:
          "Demo Prime CP",

        month:
          "January 2026",

        amountSanctioned:
          335300,

        amountDisburse:
          335300,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-005",

        userName:
          "Demo Prime CP",

        month:
          "December 2025",

        amountSanctioned:
          15000,

        amountDisburse:
          15000,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-006",

        userName:
          "Demo Prime CP",

        month:
          "November 2025",

        amountSanctioned:
          200349914025,

        amountDisburse:
          200349914025,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-007",

        userName:
          "Demo Prime CP",

        month:
          "October 2025",

        amountSanctioned:
          50337271000,

        amountDisburse:
          50337271000,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-008",

        userName:
          "Demo Prime CP",

        month:
          "September 2025",

        amountSanctioned:
          784925000,

        amountDisburse:
          784925000,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-009",

        userName:
          "Demo Prime CP",

        month:
          "August 2025",

        amountSanctioned:
          1046915000,

        amountDisburse:
          1046915000,

        payOutPercent: 2,

        gstPercent: 18,
      },

      {
        payoutID:
          "demo-payout-id-010",

        userName:
          "Demo Prime CP",

        month:
          "July 2025",

        amountSanctioned:
          11195000,

        amountDisburse:
          11195000,

        payOutPercent: 0,

        gstPercent: 18,
      },
    ],
  },
};

const demoSpPayoutsListResponse: ISourcingPartnerPayOutsResponse = {
  status: true,
  statusCode: 200,
  message: "Payout List fetched successfully!",

  data: {
    totalPaymentRequestsCount: 3,

    paymentRequests: [
      {
        spID:
          "demo-sp-id-001",

        spName:
          "MNO USER",

        spCode:
          "DEMO-SP-001",

        noOfPendingRequests: 0,

        noOfApprovedRequests: 0,

        noOfRejectedRequests: 0,

        noOfCompletedRequests: 1,
      },

      {
        spID:
          "demo-sp-id-002",

        spName:
          "ABC SOURCE SP",

        spCode:
          "DEMO-SP-002",

        noOfPendingRequests: 2,

        noOfApprovedRequests: 9,

        noOfRejectedRequests: 1,

        noOfCompletedRequests: 22,
      },

      {
        spID:
          "demo-sp-id-003",

        spName:
          "XYZ USER",

        spCode:
          "DEMO-SP-003",

        noOfPendingRequests: 3,

        noOfApprovedRequests: 5,

        noOfRejectedRequests: 0,

        noOfCompletedRequests: 4,
      },
    ],
  },
};

const demoPayOutDetailResponse: IPayOutsDetailResponse = {
  status: true,
  statusCode: 200,
  message: "Payout Details fetched successfully!",

  data: {
    userId:
      "demo-user-id-001",

    userName:
      "Demo Prime CP",

    userCode:
      "DEMO-CP-001",

    mobileNumber:
      "9000000001",

    email:
      "demoprime@email.com",

    panNumber:
      "DEMOP9876A",

    payOutPercent: 2,

    loansCompleted: 37,

    totalCount: 35,

    payoutList: [
      {
        applicationId:
          "demo-application-id-001",

        applicationCode:
          "DEMO-LA-001",

        applicantName:
          "MNO USER",

        date:
          "2026-04-13",

        amountSanctioned:
          150000,

        amountDisburse:
          15000,

        disbursementId:
          "demo-disbursement-id-001",

        payoutPercent: 2,

        payAmount: 300,

        gstAmount: 54,

        tdsAmount: 15,

        bills: 354,

        netPayment: 339,

        payoutStatus: {
          label: "Incomplete",
          color: "#FC902C",
          statusID: 0,
        },

        requestStatus: 0,

        remarks: null,

        reason: null,

        saccode: null,

        userInvoiceNumber: null,

        paymentDate:
          "0001-01-01T05:53:00",

        disbursementDate:
          "2026-04-13T21:42:07",

        invoiceUrl:
          null as unknown as string,
      },

      {
        applicationId:
          "demo-application-id-002",

        applicationCode:
          "DEMO-LA-002",

        applicantName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          30000,

        disbursementId:
          "demo-disbursement-id-002",

        payoutPercent: 2,

        payAmount: 600,

        gstAmount: 108,

        tdsAmount: 30,

        bills: 708,

        netPayment: 678,

        payoutStatus: {
          label: "Completed",
          color: "#27AE60",
          statusID: 0,
        },

        requestStatus: 4,

        remarks:
          "Demo remarks",

        reason: null,

        saccode: null,

        userInvoiceNumber: null,

        paymentDate:
          "2026-04-11T14:37:24.43",

        disbursementDate:
          "2026-04-11T03:23:59",

        invoiceUrl:
          "https://example.com/demo-invoice.pdf",
      },

      {
        applicationId:
          "demo-application-id-003",

        applicationCode:
          "DEMO-LA-003",

        applicantName:
          "XYZ BUSINESS SOLUTIONS LLP",

        date:
          "2026-04-10",

        amountSanctioned:
          5000000,

        amountDisburse:
          80000,

        disbursementId:
          "demo-disbursement-id-003",

        payoutPercent: 2,

        payAmount: 1600,

        gstAmount: 288,

        tdsAmount: 80,

        bills: 1888,

        netPayment: 1808,

        payoutStatus: {
          label: "Incomplete",
          color: "#FC902C",
          statusID: 0,
        },

        requestStatus: 0,

        remarks: null,

        reason: null,

        saccode: null,

        userInvoiceNumber: null,

        paymentDate:
          "0001-01-01T05:53:00",

        disbursementDate:
          "2026-04-11T03:10:20",

        invoiceUrl:
          null as unknown as string,
      },

      {
        applicationId:
          "demo-application-id-004",

        applicationCode:
          "DEMO-LA-004",

        applicantName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          400000,

        disbursementId:
          "demo-disbursement-id-004",

        payoutPercent: 2,

        payAmount: 8000,

        gstAmount: 1440,

        tdsAmount: 400,

        bills: 9440,

        netPayment: 9040,

        payoutStatus: {
          label: "Incomplete",
          color: "#FC902C",
          statusID: 0,
        },

        requestStatus: 0,

        remarks: null,

        reason: null,

        saccode: null,

        userInvoiceNumber: null,

        paymentDate:
          "0001-01-01T05:53:00",

        disbursementDate:
          "2026-04-10T05:30:00",

        invoiceUrl:
          null as unknown as string,
      },
    ],
  },
};

const demoSpPayoutDetailResponse: ISourcingPartnerPayOutDetailResponse = {
  status: true,
  statusCode: 200,
  message: "Payout Details fetched successfully!",

  data: {
    userId:
      "demo-sp-id-001",

    userName:
      "MNO USER",

    userCode:
      "DEMO-SP-001",

    mobileNumber:
      "9000000001",

    email:
      "demosp@email.com",

    panNumber:
      "DEMOP9876A",

    payOutPercent: 50,

    loansCompleted: 7,

    totalCount: 8,

    payoutList: [
      {
        applicationId:
          "demo-application-id-001",

        applicationCode:
          "DEMO-LA-001",

        applicantName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          15000,

        disbursementId:
          "demo-disbursement-id-001",

        payoutPercent: 50,

        payAmount: 150,

        gstAmount: 27,

        tdsAmount: 7.5,

        bills: 177,

        netPayment: 169.5,

        payoutStatus: {
          label: "Completed",
          color: "#27AE60",
          statusID: 0,
        },

        requestStatus: 4,

        remarks:
          "Demo remarks",

        reason: null,

        saccode:
          "encrypted-sac-code",

        userInvoiceNumber:
          "encrypted-invoice-number",

        paymentDate:
          "2026-04-10T16:36:33.961",

        disbursementDate:
          "2026-04-11T03:23:59",

        invoiceUrl:
          "https://example.com/demo-invoice.pdf",
      },

      {
        applicationId:
          "demo-application-id-002",

        applicationCode:
          "DEMO-LA-002",

        applicantName:
          "XYZ BUSINESS SOLUTIONS LLP",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          30000,

        disbursementId:
          "demo-disbursement-id-002",

        payoutPercent: 50,

        payAmount: 300,

        gstAmount: 54,

        tdsAmount: 15,

        bills: 354,

        netPayment: 339,

        payoutStatus: {
          label: "Completed",
          color: "#27AE60",
          statusID: 0,
        },

        requestStatus: 4,

        remarks:
          "Demo payout processed",

        reason: null,

        saccode:
          "encrypted-sac-code",

        userInvoiceNumber:
          null,

        paymentDate:
          "2026-04-11T13:34:24.809",

        disbursementDate:
          "2026-04-11T03:23:59",

        invoiceUrl:
          "https://example.com/demo-invoice.pdf",
      },

      {
        applicationId:
          "demo-application-id-003",

        applicationCode:
          "DEMO-LA-003",

        applicantName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          50000,

        disbursementId:
          "demo-disbursement-id-003",

        payoutPercent: 50,

        payAmount: 500,

        gstAmount: 90,

        tdsAmount: 25,

        bills: 590,

        netPayment: 565,

        payoutStatus: {
          label: "Approved",
          color: "#008080",
          statusID: 0,
        },

        requestStatus: 2,

        remarks: null,

        reason: null,

        saccode:
          "encrypted-sac-code",

        userInvoiceNumber:
          null,

        paymentDate:
          "0001-01-01T05:53:00",

        disbursementDate:
          "2026-04-11T03:19:39",

        invoiceUrl:
          "https://example.com/demo-invoice.pdf",
      },

      {
        applicationId:
          "demo-application-id-004",

        applicationCode:
          "DEMO-LA-004",

        applicantName:
          "MNO USER",

        date:
          "2026-04-10",

        amountSanctioned:
          6000000,

        amountDisburse:
          700000,

        disbursementId:
          "demo-disbursement-id-004",

        payoutPercent: 50,

        payAmount: 7000,

        gstAmount: 1260,

        tdsAmount: 350,

        bills: 8260,

        netPayment: 7910,

        payoutStatus: {
          label: "Incomplete",
          color: "#FC902C",
          statusID: 0,
        },

        requestStatus: 1,

        remarks: null,

        reason: null,

        saccode:
          "encrypted-sac-code",

        userInvoiceNumber:
          "encrypted-invoice-number",

        paymentDate:
          "0001-01-01T05:53:00",

        disbursementDate:
          "2026-04-11T03:19:39",

        invoiceUrl:
          "https://example.com/demo-invoice.pdf",
      },
    ],
  },
};

const demoStatesResponse: IFetchStateResponse = {
  status: true,
  statusCode: 200,
  message: null as unknown as string,
  data: [
    { id: 1, name: "Andhra Pradesh", stateCode: "AP" },
    { id: 2, name: "Arunachal Pradesh", stateCode: "AR" },
    { id: 3, name: "Assam", stateCode: "AS" },
    { id: 4, name: "Bihar", stateCode: "BR" },
    { id: 5, name: "Chhattisgarh", stateCode: "CG" },
    { id: 6, name: "Goa", stateCode: "GA" },
    { id: 7, name: "Gujarat", stateCode: "GJ" },
    { id: 8, name: "Haryana", stateCode: "HR" },
    { id: 9, name: "Himachal Pradesh", stateCode: "HP" },
    { id: 10, name: "Jharkhand", stateCode: "JH" },
    { id: 11, name: "Karnataka", stateCode: "KA" },
    { id: 12, name: "Kerala", stateCode: "KL" },
    { id: 13, name: "Madhya Pradesh", stateCode: "MP" },
    { id: 14, name: "Maharashtra", stateCode: "MH" },
    { id: 15, name: "Manipur", stateCode: "MN" },
    { id: 16, name: "Meghalaya", stateCode: "ML" },
    { id: 17, name: "Mizoram", stateCode: "MZ" },
    { id: 18, name: "Nagaland", stateCode: "NL" },
    { id: 19, name: "Odisha", stateCode: "OD" },
    { id: 20, name: "Punjab", stateCode: "PB" },
    { id: 21, name: "Rajasthan", stateCode: "RJ" },
    { id: 22, name: "Sikkim", stateCode: "SK" },
    { id: 23, name: "Tamil Nadu", stateCode: "TN" },
    { id: 24, name: "Telangana", stateCode: "TS" },
    { id: 25, name: "Tripura", stateCode: "TR" },
    { id: 26, name: "Uttar Pradesh", stateCode: "UP" },
    { id: 27, name: "Uttarakhand", stateCode: "UK" },
    { id: 28, name: "West Bengal", stateCode: "WB" },
    { id: 29, name: "Andaman and Nicobar Islands", stateCode: "AN" },
    { id: 30, name: "Chandigarh", stateCode: "CH" },
    { id: 31, name: "Dadra & Nagar Haveli and Daman & Diu", stateCode: "DN" },
    { id: 32, name: "Delhi", stateCode: "DL" },
    { id: 33, name: "Jammu and Kashmir", stateCode: "JK" },
    { id: 34, name: "Ladakh", stateCode: "LA" },
    { id: 35, name: "Lakshadweep", stateCode: "LD" },
    { id: 36, name: "Puducherry", stateCode: "PY" },
  ],
};

const demoCpPayoutInvoiceResponse: IGenerateCpPayoutInvoiceResponse = {
  status: true,
  statusCode: 200,
  message: "Invoice generated successfully!",
  data: "https://grotesque-red-pmuuyjye9n.edgeone.app/GST%20Report_NEXUS%20NUTRI%20SCIENCE%20LIMITED_20260417_152222.pdf",
};

const demoLoanDetailResponse: ILoanResponse = {
  status: true,
  statusCode: 200,
  message: "Details of Loan Application fetched successfully!",
  data: {
    loanApplicationCode: "COLA260305",
    loanApplicationID: "08de9715-a36b-4ec9-8f76-0337ef7de7fe",
    bankName: null,
    loanType: "Home Loan",
    loanAmount: 6000000,
    sanctionedAmount: 6000000,
    disbursedAmount: 3195012,
    loanAppiedDate: "2026-04-10T15:27:12.476888",
    loanSanctionedDate: "2026-04-10T00:00:00",
    loanDisbursedDate: "2026-04-10T21:49:39",
    status: {
      label: "Disbursed",
      color: "#0BB680",
      statusID: 6,
    },
    rateOfInterest: 0,
    sanctionLetterUrl:
      "/assets/images/sanction-letter.pdf",
    coApplicantName1: null as unknown as string,
    coApplicantName2: null as unknown as string,
    referenceName1: null as unknown as string,
    referenceName2: null as unknown as string,
    uploadedDocuments: [],
    loanDisbursementcomments: ["p1", "p2", "p3", "p4", "p5", "p6", "p6", "p6", "p7", "p8", "p8", "p9"],
    loanSanctioncomments: "Sanctioned ",
    disbursedHistory: [
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 50000, loanDisbursementComment: "p1" },
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 100000, loanDisbursementComment: "p2" },
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 700000, loanDisbursementComment: "p3" },
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 1400000, loanDisbursementComment: "p4" },
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 600000, loanDisbursementComment: "p5" },
      { loanDisbursedDate: "2026-04-10T00:00:00", disbursedAmount: 50000, loanDisbursementComment: "p6" },
      { loanDisbursedDate: "2026-04-10T21:30:49", disbursedAmount: 60000, loanDisbursementComment: "p6" },
      { loanDisbursedDate: "2026-04-10T21:30:49", disbursedAmount: 60000, loanDisbursementComment: "p6" },
      { loanDisbursedDate: "2026-04-10T21:39:42", disbursedAmount: 80000, loanDisbursementComment: "p7" },
      { loanDisbursedDate: "2026-04-10T21:40:20", disbursedAmount: 80000, loanDisbursementComment: "p8" },
      { loanDisbursedDate: "2026-04-10T21:49:00", disbursedAmount: 15000, loanDisbursementComment: "p8" },
      { loanDisbursedDate: "2026-04-10T21:49:39", disbursedAmount: 12, loanDisbursementComment: "p9" },
    ] as any,
  },
};

const demoCreateLinkResponse: ISubscriptionResponse = {
  status: true,
  statusCode: 200,
  message: "Payment link created successfully!",
  data: {
    linkId: "plink_SYCyORyRygnNLQ",
    shortUrl: "https://rzp.io/rzp/rf6cuYx",
    status: "fetched",
  },
};

const demoConvertPartnersResponse: APIResponseEntity = {
  status: true,
  statusCode: 200,
  message: "CoApplicant added successfully!",
};

const demoClientDetailResponse: IClientResponse = {
  status: true,
  statusCode: 200,
  message: "Client details fetched successfully!",
  data: {
    clientID: "demo-client-id-001",

    clientName: "ABC INDUSTRIES PRIVATE LIMITED",
    clientCode: "DEMO001",

    mobileNumber: "9000000001",
    email: "abc@gmail.com",

    channelPartner: "Demo Prime CP",

    panNumber: "DEMOP9876A",

    loanApplicationsList: [
      {
        loanApplicationID: "demo-loan-id-001",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-001",
        bankName: null,
        loanType:
          "Loan against property - Residential",
        loanTypeID: 7,
        date: "2026-01-10",
        sanctionedDate: "2026-01-15",
        disbursedDate: null,
        loanAmount: 5000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl:
          "/assets/images/sanction-letter.pdf",
        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",
        userID: "demo-client-id-001",
        progressPercent: 60,
        isCamReportGenerated: false,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-002",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-002",
        bankName: "Demo Bank",
        loanType: "Home Loan",
        loanTypeID: 1,
        date: "2026-02-05",
        sanctionedDate: "2026-02-08",
        disbursedDate: "2026-02-10",
        loanAmount: 10000000,
        sanctionedLoanAmount: 8000000,
        disbursedLoanAmount: 5000000,
        sanctionLetterUrl:
          "/assets/images/sanction-letter.pdf",
        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",
        userID: "demo-client-id-001",
        progressPercent: 80,
        isCamReportGenerated: true,
        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },

      {
        loanApplicationID: "demo-loan-id-003",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-003",
        bankName: null,
        loanType: "CC/OD - Secured",
        loanTypeID: 10,
        date: "2026-03-12",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 3000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",
        userID: "demo-client-id-001",
        progressPercent: 45,
        isCamReportGenerated: false,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-004",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-004",
        bankName: "Sample Finance",
        loanType: "Business Loan",
        loanTypeID: 4,
        date: "2026-03-20",
        sanctionedDate: "2026-03-25",
        disbursedDate: "2026-03-28",
        loanAmount: 7500000,
        sanctionedLoanAmount: 7000000,
        disbursedLoanAmount: 6500000,
        sanctionLetterUrl:
          "/assets/images/sanction-letter.pdf",
        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",
        userID: "demo-client-id-001",
        progressPercent: 100,
        isCamReportGenerated: true,
        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },
    ],
  },
};

const demoSourcingPartnerDetailResponse: ISourcingPartnerDetailsResponse = {
  status: true,

  statusCode: 200,

  message:
    null as unknown as string,

  data: {
    id:
      "demo-sp-id-001",

    name:
      "ABC SOURCE SP",

    code:
      "DEMO-SP-001",

    mobileNumber:
      "9000000001",

    email:
      "abc@gmail.com",

    channelPartner:
      "Demo Prime CP",

    panNumber:
      "encrypted-demo-pan",

    payOuts: 50,

    loansCompleted: 0,
  },
};

const demoCpReportDetailResponse: IChannelPartnerClientReportDetailResponse = {
  status: true,
  statusCode: 200,
  message:
    "Channel partner details fetched successfully!",

  data: {
    clientID:
      "demo-client-id-001",

    clientName:
      "MNO USER",

    clientCode:
      "DEMO001",

    mobileNumber:
      "9000000001",

    email:
      "demouser1@gmail.com",

    channelPartner:
      "Demo Prime CP",

    panNumber:
      "DEMOP9876A",

    clientReports: [
      {
        name: "GST Report",

        filePath:
          "/assets/images/GST Report.pdf",

        reportType: 5,
      },

      {
        name: "ITR Report",

        filePath:
          "/assets/images/ITR Report.pdf",

        reportType: 4,
      },

      {
        name: "Banking Report",

        filePath:
          "/assets/images/Banking Report.pdf",

        reportType: 3,
      },

      {
        name:
          "Credit Analytics Report",

        filePath:
          "/assets/images/Credit Analytics Report.pdf",

        reportType: 1,
      },

      {
        name:
          "CAM_Report_ABC_INDUSTRIES_PRIVATE_LIMITED",

        filePath:
          "/assets/images/CAM_Report_Sample_HL.xlsx",

        reportType: 8,
      },
    ],
  },
};

const demoUpdateSpPayoutResponse: APIResponseEntity = {
  status: true,
  statusCode: 200,
  message: "Payout updated successfully!",
};

const demoSpPayoutInvoiceResponse = {
  status: true,
  statusCode: 200,
  message: "Invoice generated successfully!",
  data: "https://grotesque-red-pmuuyjye9n.edgeone.app/GST%20Report_NEXUS%20NUTRI%20SCIENCE%20LIMITED_20260417_152222.pdf",
};

const demoClientMasterResponse: IClientMasterResponse = {
  status: true,
  statusCode: 200,
  message: "List of customers fetched successfully!",
  data: {
    totalCount: 5,
    customersList: [
      {
        id: "demo-id-001",
        customerCode: "DEMO001",
        fullName: "ABC INDUSTRIES PRIVATE LIMITED",
        phoneNumber: "9000000001",
        sourcingPartnerName: null,
        createdDate: "2026-01-10T10:15:00",
        isActive: true,
        applicationStatuses: ["Disbursed", "Pending"],
      },

      {
        id: "demo-id-002",
        customerCode: "DEMO002",
        fullName: "MNO USER",
        phoneNumber: "9000000002",
        sourcingPartnerName: null,
        createdDate: "2026-02-05T14:20:00",
        isActive: true,
        applicationStatuses: ["Pending"],
      },

      {
        id: "demo-id-003",
        customerCode: "DEMO003",
        fullName: "XYZ BUSINESS SOLUTIONS LLP",
        phoneNumber: "9000000003",
        sourcingPartnerName: null,
        createdDate: "2026-02-18T11:45:00",
        isActive: true,
        applicationStatuses: ["Sanctioned", "Disbursed"],
      },

      {
        id: "demo-id-004",
        customerCode: "DEMO004",
        fullName: "OPQ USER",
        phoneNumber: "9000000004",
        sourcingPartnerName: null,
        createdDate: "2026-03-02T09:30:00",
        isActive: true,
        applicationStatuses: ["Applied"],
      },

      {
        id: "demo-id-005",
        customerCode: "DEMO005",
        fullName: "DEF INDUSTRIES PRIVATE LIMITED",
        phoneNumber: "9000000005",
        sourcingPartnerName: null,
        createdDate: "2026-03-15T16:10:00",
        isActive: true,
        applicationStatuses: ["Pending", "Query Raised"],
      },
    ],

    categoryList: [
      { id: 1, name: "Individual" },
      { id: 2, name: "Company" },
      {
        id: 3,
        name: "Hindu Undivided Family",
      },
      {
        id: 4,
        name: "Association Of Persons",
      },
      {
        id: 5,
        name: "Body Of Individuals",
      },
      {
        id: 6,
        name: "Government Agency",
      },
      {
        id: 7,
        name: "Artificial Juridical Person",
      },
      {
        id: 8,
        name: "Local Authority",
      },
      { id: 9, name: "Firm" },
      { id: 10, name: "Trust" },
      { id: 11, name: "Person" },
    ],
  },
};

const createLoanTenure = () =>
  Array.from({ length: 30 }, (_, index) => ({
    loanTenureID: index + 1,
    loanTenureInYears: index + 1,
  }));

const demoLoanTypeListResponse: ILoanTypeListResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Type List fetched successfully!",
  data: {
    loanTypes: [
      {
        loanTypeId: 1,
        loanTypeName: "HomeLoan",
        displayName: "Home Loan",
        displayOrder: 1,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 2,
        loanTypeName: "PersonalLoan",
        displayName: "Personal Loan",
        displayOrder: 6,
        isSecuredLoan: 0,
        isMarketValueRequired: false,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 4,
        loanTypeName: "UnsecuredBusinessLoan",
        displayName: "Unsecured Business Loan",
        displayOrder: 7,
        isSecuredLoan: 0,
        isMarketValueRequired: false,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 5,
        loanTypeName: "LoanPropertyPlot",
        displayName: "Loan against property - Plot",
        displayOrder: 5,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 6,
        loanTypeName: "CC/ODCGTMSE",
        displayName: "CC/OD - CGTMSE",
        displayOrder: 9,
        isSecuredLoan: 0,
        isMarketValueRequired: false,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 7,
        loanTypeName: "LoanPropertyResidential",
        displayName: "Loan against property - Residential",
        displayOrder: 2,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 8,
        loanTypeName: "LoanPropertyCommercial",
        displayName: "Loan against property - Commercial",
        displayOrder: 3,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 9,
        loanTypeName: "LoanPropertyIndustrial",
        displayName: "Loan against property - Industrial",
        displayOrder: 4,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
      {
        loanTypeId: 10,
        loanTypeName: "CC/ODSecured",
        displayName: "CC/OD - Secured",
        displayOrder: 8,
        isSecuredLoan: 1,
        isMarketValueRequired: true,
        loanTenure: createLoanTenure(),
      },
    ],
    unitOptions: [
      { id: 1, displayName: "Manufacturing" },
      { id: 2, displayName: "Trader" },
      { id: 3, displayName: "Service" },
      { id: 4, displayName: "Other" },
    ],
    industryOptions: [
      {
        id: 1,
        displayName: "Agriculture, Animal Husbandry and Forestry",
      },
      { id: 2, displayName: "Co-operative Society Activities" },
      { id: 3, displayName: "Computer And Related Services" },
      { id: 4, displayName: "Construction" },
      { id: 5, displayName: "Culture And Sport" },
      { id: 6, displayName: "Education Services" },
      { id: 7, displayName: "Electricity, Gas and Water" },
      {
        id: 8,
        displayName: "Extra Territorial Organisations And Bodies",
      },
      { id: 9, displayName: "Financial Intermediation Services" },
      { id: 10, displayName: "Fish Farming" },
      { id: 11, displayName: "Healthcare Servcies" },
      {
        id: 12,
        displayName: "Hotels, Restaurants And Hospitality Services",
      },
      { id: 13, displayName: "Manufacturing" },
      { id: 14, displayName: "Minning And Quarrying" },
      { id: 15, displayName: "Other Services" },
      { id: 16, displayName: "Post and Telecommunication Services" },
      { id: 17, displayName: "Professions" },
      { id: 18, displayName: "Real Estate And Renting Services" },
      { id: 19, displayName: "Renting Of Machinery" },
      { id: 20, displayName: "Research And Development" },
      { id: 21, displayName: "Social And Community Work" },
      { id: 22, displayName: "Transport And Logistics Services" },
      { id: 23, displayName: "Wholesale And Retail Trade" },
      { id: 24, displayName: "Salaried Employee" },
    ],
    professionOptions: [
      { id: 1, displayName: "Doctor" },
      { id: 2, displayName: "Chartered Accountant/Company Secretary" },
      { id: 3, displayName: "Engineer/Architect" },
      { id: 4, displayName: "Lawyer" },
      { id: 5, displayName: "Other" },
    ],
  },
};

const demoPincodeResponse: IPincodeFetchDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "Location fetched successfully.",
  data: {
    name: "Krishnanagar (Ahmedabad)",
    district: "Ahmedabad",
    state: "Gujarat",
    circle: "Ahmadabad City",
    division: "Ahmedabad City",
    country: "India",
  },
};

const demoAddLoanApplicationResponse: IApplyLoanApplicationResponse = {
  status: true,
  statusCode: 200,
  message:
    "Thank you for your application! We have successfully registered it.",
  data: {
    loanAppID: "08de9948-41b9-4506-8507-a6303edd8480",
    customerID: "08de8f26-c1c2-493c-8bbc-493b9af79369",
    loanStatusID: 1,
    loanTypeID: 1,
    loanTenureID: null,
    loanAmount: 500000,
    loanProcessorID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    loanProcessorType: 2,
    createdDate: "2026-04-13T16:04:35.2071949",
  },
};

const demoPanDetailsResponse: IAddPanCardResponse = {
  status: true,
  statusCode: 200,
  message: "PAN details fetched successfully.",
  data: {
    fullName: "DEV SANJAYKUMAR BHUPTANI",
    firstName: "DEV",
    middleName: "SANJAYKUMAR",
    lastName: "BHUPTANI",
    category: "person",
    panNumber: "EZNPB5567B",
    emailID: null as unknown as string,
    mobileNumber: null as unknown as string,
    dob: "DVXrbb2iCMu2YkMP3s4PyQ==",
    address:
      "PXoBDi6i9qorLkeviDtw4yyMRsAroVxzarUsszuNKZeLZBF7F+jsDQviu8Qm62y1L0QGDfY1gaaPs1qEN86w2xnBSSe1R9N6mH6Llt7eisqXkb0jmXPRWdjgaPqISm4HFsWIV/ov3eculpS2VZqQ+V+WMGL0hnVxbQV7g4a/0eWm3LMqbORAsr7qsNyB2DeY",
    state: "BkFZ9XSp8OfIQZ3E6jrlAA==",
    city: "0/uFJ6slmmGhvzYYiBk81g==",
    zipCode: "1cqyY1btLiZmjXErd2u2Dg==",
    maskedAadhaar: "XXXXXXXX2525",
    gender: "M",
  },
};

const demoAddUserWithoutOtpResponse = {
  status: true,
  statusCode: 200,
  message: "User added successfully!",
  data: {
    userID: "08de9949-8fa7-4692-8078-38b1487b64eb",
    userName: "DEV SANJAYKUMAR BHUPTANI",
    showPanDetailPopUp: false,
    emailID: "AM45RxEIOloP6nJczrQ55w==",
    mobileNumber: "vO5BMExR9EM6qawgtekoVg==",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkszczRJTnlINnBVN0FlZjVMdHF0NStXU0o5QVJyMFpUOUhHMVNYVGFKNmYxVk1uaGpsUDQ3V01HMDNQcm9YL1AiLCJuYmYiOjE3NzYwNzcwMzYsImV4cCI6MTc3NjE2MzQzNiwiaWF0IjoxNzc2MDc3MDM2fQ.nooS77oXgTuuOy8DOIqHICiNvfH6ot2BjxFnO6twSCA",
    userType: 4,
    panTypeID: 11,
    roleID: 4,
    panNumber: "EZNPB5567B",
    gstNumber: null,
    roleName: "Client",
    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
    contractEnforcementDate: null,
    isDefaultCpClient: false,
    isContractSigned: true,
    permissions: [
      {
        rightID: 1,
        parentID: 0,
        rightName: "Dashboard",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Dashboard",
        displayOrder: 1,
      },
      {
        rightID: 2,
        parentID: 0,
        rightName: "Profile",
        create: true,
        delete: null,
        view: null,
        list: true,
        displayName: "Profile",
        displayOrder: 2,
      },
      {
        rightID: 7,
        parentID: 0,
        rightName: "Reports",
        create: null,
        delete: null,
        view: true,
        list: true,
        displayName: "Reports",
        displayOrder: 10,
      },
      {
        rightID: 10,
        parentID: 15,
        rightName: "ContractClient",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Client Contract ",
        displayOrder: 16,
      },
      {
        rightID: 12,
        parentID: 0,
        rightName: "Support",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Support",
        displayOrder: 18,
      },
      {
        rightID: 15,
        parentID: 0,
        rightName: "Contracts",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Contracts",
        displayOrder: 13,
      },
      {
        rightID: 17,
        parentID: 0,
        rightName: "Subscription",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Subscription",
        displayOrder: 23,
      },
      {
        rightID: 23,
        parentID: 0,
        rightName: "UserManagement",
        create: false,
        delete: null,
        view: false,
        list: false,
        displayName: "User Management",
        displayOrder: 3,
      },
    ],
  },
};

const demoUpdateLoanApplicationStatusResponse: IUpdateLoanStatusResponse = {
  status: true,
  statusCode: 200,
  message: "Loan Application status updated successfully!",
  data: null as unknown as ILogoutResponse,
};

const demoUploadSanctionLetterResponse: IUpdateLoanStatusResponse = {
  status: true,
  statusCode: 200,
  message: "Sanction letter has been uploaded successfully!",
  data: "UploadedDocuments/08de8f26-c1c2-493c-8bbc-493b9af79369/Recognized/Loan Documents - Individual/WelcomeLetter/dummy.pdf",
};

const demoLogoutResponse: ILogoutResponse = {
  status: true,
  statusCode: 200,
  message: "User logged out successfully.",
  data: null,
};

const demoUserProfileResponse: IUserProfileResponse = {
  status: true,

  statusCode: 200,

  message:
    "User fetched successfully!",

  data: {
    id:
      "demo-cp-id-001",

    name:
      "Demo Prime CP",

    panNumber:
      "encrypted-demo-pan",

    emailID:
      "abc@gmail.com",

    mobileNumber:
      "9000000001",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    selectedGstNumber:
      "29AAACC1206D2ZB",

    gstList: [],

    billingDetails: true,

    role:
      "Channel Partner",

    customerID:
      "DEMO-CP-001",

    isCompany: true,

    coApplicants: [],

    partners: [
      {
        id:
          "demo-partner-id-001",

        name:
          "MNO USER",

        firstName:
          "MNO",

        middleName:
          "",

        lastName:
          "USER",

        pan:
          "ABCDE1234F",

        aadhaarNumber:
          "XXXX-XXXX-1234",

        address:
          "Demo Corporate Road, Ahmedabad, Gujarat",

        state:
          "Gujarat",

        city:
          "Ahmedabad",

        pinCode:
          "380015",

        mobile:
          "9000000001",

        dateOfBirth:
          "1991-02-15",

        gender:
          "M",

        creditScore:
          null,
      },
    ],

    commission: 2,

    bankAccountNumber:
      "encrypted-demo-bank-account",

    bankName:
      "Demo Bank",

    ifscCode:
      "encrypted-demo-ifsc",

    dateOfBirth:
      "encrypted-demo-dob",

    address:
      "encrypted-demo-address",

    city:
      "encrypted-demo-city",

    state:
      "encrypted-demo-state",

    zipCode:
      "encrypted-demo-zipcode",

    aadhaar:
      "encrypted-demo-aadhaar",

    country:
      "INDIA",

    udhyamAadhaar:
      "encrypted-demo-udyam",

    userConsents: [
      {
        userConsentID: 1,

        consentName:
          "Email",

        isConsented: true,
      },

      {
        userConsentID: 3,

        consentName:
          "SMS",

        isConsented: true,
      },

      {
        userConsentID: 5,

        consentName:
          "WhatsApp",

        isConsented: true,
      },
    ],

    cpCompanyLogo:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",
  },
};

const demoUpdateUserResponse: ILogoutResponse = {
  status: true,
  statusCode: 200,
  message: "Profile updated successfully.",
  data: null,
};

const demoDeleteUserResponse: ILogoutResponse = {
  status: true,
  statusCode: 200,
  message: "Profile deleted successfully.",
  data: null,
};

const demoUserManagementResponse: IUserDataResponse = {
  status: true,
  statusCode: 200,
  message: "User management list fetched successfully!",

  data: {
    totalCount: 7,

    userManagementList: [
      {
        userID:
          "demo-user-id-001",

        userName: "MNO USER",

        roleName: "Account",

        designation: "Manager",

        email: "mnouser@gmail.com",

        mobileNumber: "9000000001",

        status: true,
      },

      {
        userID:
          "demo-user-id-002",

        userName: "OPQ USER",

        roleName: "Account",

        designation: "Senior Accountant",

        email: "opquser@gmail.com",

        mobileNumber: "9000000002",

        status: true,
      },

      {
        userID:
          "demo-user-id-003",

        userName: "RST USER",

        roleName: "Account",

        designation: "Operations Lead",

        email: "rstuser@gmail.com",

        mobileNumber: "9000000003",

        status: true,
      },

      {
        userID:
          "demo-user-id-004",

        userName: "UVW USER",

        roleName: "Executive",

        designation: "Manager",

        email: "uvwuser@gmail.com",

        mobileNumber: "9000000004",

        status: true,
      },

      {
        userID:
          "demo-user-id-005",

        userName: "XYZ USER",

        roleName: "Manager",

        designation: "Branch Manager",

        email: "xyzuser@gmail.com",

        mobileNumber: "9000000005",

        status: true,
      },

      {
        userID:
          "demo-user-id-006",

        userName: "ABC ADMIN",

        roleName: "Admin",

        designation: "QA Analyst",

        email: "abcadmin@gmail.com",

        mobileNumber: "9000000006",

        status: true,
      },

      {
        userID:
          "demo-user-id-007",

        userName: "DEF USER",

        roleName: "Account",

        designation: "Team Lead",

        email: "defuser@gmail.com",

        mobileNumber: "9000000007",

        status: true,
      },
    ],
  },
};

const demoRoleMasterResponse: IRoleMasterResponse = {
  status: true,
  statusCode: 200,
  message: "All Roles are fetched successfully!",
  data: {
    totalCount: 5,
    rolesList: [
      { roleID: 184, roleName: "Admin", isActive: true },
      { roleID: 185, roleName: "Manager", isActive: true },
      { roleID: 186, roleName: "Account", isActive: true },
      { roleID: 187, roleName: "Executive", isActive: true },
      { roleID: 608, roleName: "CTO", isActive: true },
    ],
  },
};

const demoRoleDetailResponse: IRoleDetailResponse = {
  status: true,
  statusCode: 200,
  message: "Role fetched Successfully!",
  data: {
    roleID: 184,
    roleName: "Admin",
    isActive: true,
    permissions: [
      {
        id: 2971,
        rightID: 1,
        rightName: "Dashboard",
        displayName: "Dashboard",
        displayOrder: 0,
        create: true,
        view: null,
        list: true,
      },
      {
        id: 2972,
        rightID: 2,
        rightName: "Profile",
        displayName: "Profile",
        displayOrder: 0,
        create: false,
        view: null,
        list: true,
      },
      {
        id: 2973,
        rightID: 3,
        rightName: "Role Master",
        displayName: "Role Master",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2974,
        rightID: 4,
        rightName: "Client Master",
        displayName: "Client Master",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2975,
        rightID: 6,
        rightName: "Sourcing Partner",
        displayName: "Sourcing Partner",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2976,
        rightID: 7,
        rightName: "Reports",
        displayName: "Reports",
        displayOrder: 0,
        create: null,
        view: true,
        list: true,
      },
      {
        id: 2977,
        rightID: 8,
        rightName: "Channel Partner Contract ",
        displayName: "Channel Partner Contract ",
        displayOrder: 0,
        create: null,
        view: null,
        list: true,
      },
      {
        id: 2978,
        rightID: 9,
        rightName: "Sourcing Partner Contract ",
        displayName: "Sourcing Partner Contract ",
        displayOrder: 0,
        create: null,
        view: null,
        list: true,
      },
      {
        id: 2979,
        rightID: 18,
        rightName: "Manage Users",
        displayName: "Manage Users",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2980,
        rightID: 21,
        rightName: "My Payout",
        displayName: "My Payout",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2981,
        rightID: 22,
        rightName: "SP Payout",
        displayName: "SP Payout",
        displayOrder: 0,
        create: true,
        view: true,
        list: true,
      },
      {
        id: 2982,
        rightID: 11,
        rightName: "Policy",
        displayName: "Policy",
        displayOrder: 0,
        create: null,
        view: null,
        list: false,
      },
      {
        id: 2983,
        rightID: 12,
        rightName: "Support",
        displayName: "Support",
        displayOrder: 0,
        create: null,
        view: null,
        list: false,
      },
      {
        id: 2984,
        rightID: 13,
        rightName: "Payouts",
        displayName: "Payouts",
        displayOrder: 0,
        create: null,
        view: null,
        list: true,
      },
      {
        id: 2985,
        rightID: 14,
        rightName: "Master",
        displayName: "Master",
        displayOrder: 0,
        create: null,
        view: null,
        list: true,
      },
      {
        id: 2986,
        rightID: 15,
        rightName: "Contracts",
        displayName: "Contracts",
        displayOrder: 0,
        create: null,
        view: null,
        list: true,
      },
    ],
  },
};

const demoAddEditRoleUserBase: IGetAddEditRoleUserResponse = {
  status: true,
  statusCode: 200,
  message: "User Data and Role Data fetched successfully!",
  data: {
    fullName: "",
    email: "",
    mobileNumber: "",
    designation: "",
    selectedRoleName: "",
    isActive: true,
    rolesList: [
      { id: 184, roleName: "Admin" },
      { id: 185, roleName: "Manager" },
      { id: 186, roleName: "Account" },
      { id: 187, roleName: "Executive" },
      { id: 608, roleName: "CTO" },
    ],
  },
};

const getDemoAddEditRoleUserDataResponse = (
  userID: string | null,
): IGetAddEditRoleUserResponse => {
  if (!userID) {
    return demoAddEditRoleUserBase;
  }

  const matchedUser = demoUserManagementResponse.data.userManagementList.find(
    (user) => user.userID === userID,
  );

  if (!matchedUser) {
    return demoAddEditRoleUserBase;
  }

  return {
    ...demoAddEditRoleUserBase,
    data: {
      ...demoAddEditRoleUserBase.data,
      fullName: matchedUser.userName,
      email: matchedUser.email,
      mobileNumber: matchedUser.mobileNumber,
      designation: matchedUser.designation,
      selectedRoleName: matchedUser.roleName,
      isActive: matchedUser.status,
    },
  };
};

const demoSubmitAddEditRoleUserResponse = {
  status: true,
  statusCode: 200,
  message: "User created successfully!",
  data: true,
};

const demoRoleUpdateResponse: APIResponseEntity = {
  status: true,
  statusCode: 200,
  message: "Role Edited successfully!",
};

const demoSourcingPartnerResponse: ISourcingPartnerResponse = {
  status: true,

  statusCode: 200,

  message:
    "List of sourcing partners fetched successfully!",

  data: {
    totalCount: 10,

    sourcingPartersList: [
      {
        id:
          "demo-sp-id-001",

        name:
          "MNO USER",

        code:
          "DEMO-SP-001",

        registeredDate:
          "2025-08-26T13:02:36.406697",

        mobileNumber:
          "9000000001",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-002",

        name:
          "OPQ USER",

        code:
          "DEMO-SP-002",

        registeredDate:
          "2025-08-21T11:12:25.714065",

        mobileNumber:
          "9000000002",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-003",

        name:
          "RST USER",

        code:
          "DEMO-SP-003",

        registeredDate:
          "2025-05-12T17:37:11.347593",

        mobileNumber:
          "9000000003",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-004",

        name:
          "UVW USER",

        code:
          "DEMO-SP-004",

        registeredDate:
          "2025-04-28T10:49:18.816338",

        mobileNumber:
          "9000000004",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-005",

        name:
          "XYZ USER",

        code:
          "DEMO-SP-005",

        registeredDate:
          "2025-04-23T13:09:16.291292",

        mobileNumber:
          "9000000005",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-006",

        name:
          "ABC USER",

        code:
          "DEMO-SP-006",

        registeredDate:
          "2025-04-23T12:33:35.767611",

        mobileNumber:
          "9000000006",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-007",

        name:
          "DEF USER",

        code:
          "DEMO-SP-007",

        registeredDate:
          "2025-03-28T11:46:56.666926",

        mobileNumber:
          "9000000007",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-008",

        name:
          "GHI USER",

        code:
          "DEMO-SP-008",

        registeredDate:
          "2025-03-07T12:43:25.190751",

        mobileNumber:
          "9000000008",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-009",

        name:
          "JKL USER",

        code:
          "DEMO-SP-009",

        registeredDate:
          "2025-01-30T16:28:13.887042",

        mobileNumber:
          "9000000009",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },

      {
        id:
          "demo-sp-id-010",

        name:
          "PQR USER",

        code:
          "DEMO-SP-010",

        registeredDate:
          "2024-12-23T19:19:14.850335",

        mobileNumber:
          "9000000010",

        noOfRegisteredSP: 0,

        activeCredits: 0,

        reservedCredits: 0,

        isActive: true,
      },
    ],

    categoryList:
      demoClientMasterResponse.data.categoryList,
  },
};

const demoCpReportClientListResponse: IChannelPartnerClientReportResponse = {
  status: true,
  statusCode: 200,
  message: "Channel partner report fetched successfully!",

  data: {
    clientsList: [
      {
        clientID: "demo-client-id-001",

        clientName: "MNO USER",

        clientCode: "DEMO001",

        mobile: "9000000001",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-002",

        clientName: "OPQ USER",

        clientCode: "DEMO002",

        mobile: "9000000002",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-003",

        clientName: "RST USER",

        clientCode: "DEMO003",

        mobile: "9000000003",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-004",

        clientName: "UVW USER",

        clientCode: "DEMO004",

        mobile: "9000000004",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-005",

        clientName: "XYZ USER",

        clientCode: "DEMO005",

        mobile: "9000000005",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-006",

        clientName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        clientCode: "DEMO006",

        mobile: "9000000006",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-007",

        clientName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        clientCode: "DEMO007",

        mobile: "9000000007",

        sourcingPartnerName:
          null as unknown as string,
      },

      {
        clientID: "demo-client-id-008",

        clientName:
          "XYZ BUSINESS SOLUTIONS LLP",

        clientCode: "DEMO008",

        mobile: "9000000008",

        sourcingPartnerName:
          null as unknown as string,
      },
    ],

    totalCount: 8,
  },
};

const demoPendingLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",
  data: {
    totalLoanApplications: 10,

    loanApplications: [
      {
        loanApplicationID: "demo-loan-id-001",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-001",
        bankName: null,
        loanType:
          "Loan against property - Residential",
        loanTypeID: 7,
        date: "2026-04-09",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 6000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",
        userID: "demo-user-id-001",
        progressPercent: 40,
        isCamReportGenerated: false,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-002",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-002",
        bankName: null,
        loanType: "Home Loan",
        loanTypeID: 1,
        date: "2026-04-08",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 5000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName: "MNO USER",
        userID: "demo-user-id-002",
        progressPercent: 80,
        isCamReportGenerated: false,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-003",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-003",
        bankName: null,
        loanType: "CC/OD - Secured",
        loanTypeID: 10,
        date: "2026-04-07",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 30000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName:
          "XYZ BUSINESS SOLUTIONS LLP",
        userID: "demo-user-id-003",
        progressPercent: 60,
        isCamReportGenerated: true,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-004",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-004",
        bankName: null,
        loanType: "Home Loan",
        loanTypeID: 1,
        date: "2026-04-06",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 3000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName: "OPQ USER",
        userID: "demo-user-id-004",
        progressPercent: 40,
        isCamReportGenerated: false,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },

      {
        loanApplicationID: "demo-loan-id-005",
        disbursementId:
          "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "DEMO-LA-005",
        bankName: "Demo Finance Bank",
        loanType:
          "Loan against property - Residential",
        loanTypeID: 7,
        date: "2026-04-05",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 5000000,
        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,
        sanctionLetterUrl: null,
        customerName:
          "DEF INDUSTRIES PRIVATE LIMITED",
        userID: "demo-user-id-005",
        progressPercent: 100,
        isCamReportGenerated: true,
        status: {
          label: "Pending",
          color: "#FF632C",
          statusID: 1,
        },
      },
    ],
  },
};

const demoLoginLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 4,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType: "Unsecured Business Loan",
        loanTypeID: 4,

        date: "2026-02-10",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 200000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "MNO USER",

        userID: "demo-user-id-001",

        progressPercent: 60,

        isCamReportGenerated: false,

        status: {
          label: "Applied",
          color: "#3DA0E7",
          statusID: 2,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-002",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-002",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2025-09-16",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "OPQ USER",

        userID: "demo-user-id-002",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Applied",
          color: "#3DA0E7",
          statusID: 2,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-003",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-003",

        bankName: "Demo Bank",

        loanType:
          "Loan against property - Residential",
        loanTypeID: 7,

        date: "2025-09-01",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-003",

        progressPercent: 40,

        isCamReportGenerated: true,

        status: {
          label: "Applied",
          color: "#3DA0E7",
          statusID: 2,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-004",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-004",

        bankName: null,

        loanType: "CC/OD - Secured",
        loanTypeID: 10,

        date: "2025-06-02",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1250000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-004",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Applied",
          color: "#3DA0E7",
          statusID: 2,
        },
      },
    ],
  },
};

const demoQueryLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 1,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType:
          "Loan against property - Industrial",

        loanTypeID: 9,

        date: "2025-09-03",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "MNO USER",

        userID: "demo-user-id-001",

        progressPercent: 40,

        isCamReportGenerated: false,

        raisedQuery:
          "Query Raised for documents",

        status: {
          label: "Query Raised",
          color: "#F4A917",
          statusID: 3,
        },
      },
    ],
  },
};

const demoSanctionedLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 4,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2026-01-09",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 500000,
        sanctionedLoanAmount: 150000,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "MNO USER",

        userID: "demo-user-id-001",

        progressPercent: 60,

        isCamReportGenerated: false,

        status: {
          label: "Sanctioned",
          color: "#947CFB",
          statusID: 4,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-002",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-002",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2025-12-23",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,
        sanctionedLoanAmount: 1500000,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "OPQ USER",

        userID: "demo-user-id-002",

        progressPercent: 80,

        isCamReportGenerated: false,

        status: {
          label: "Sanctioned",
          color: "#947CFB",
          statusID: 4,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-003",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-003",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2025-12-11",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 3000000,
        sanctionedLoanAmount: 2500000,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-003",

        progressPercent: 20,

        isCamReportGenerated: false,

        status: {
          label: "Sanctioned",
          color: "#947CFB",
          statusID: 4,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-004",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-004",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2025-08-25",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 2000000,
        sanctionedLoanAmount: 1800000,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-004",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Sanctioned",
          color: "#947CFB",
          statusID: 4,
        },
      },
    ],
  },
};

const demoPendingAtCreditLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 1,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType:
          "Loan against property - Residential",

        loanTypeID: 7,

        date: "2025-09-01",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-001",

        progressPercent: 40,

        isCamReportGenerated: true,

        status: {
          label: "Pending at Credit",
          color: "#9AC900",
          statusID: 5,
        },
      },
    ],
  },
};

const demoDisbursedLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 10,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType: "Home Loan",
        loanTypeID: 1,

        date: "2026-04-10",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 6000000,
        sanctionedLoanAmount: 6000000,
        disbursedLoanAmount: 4500000,

        sanctionLetterUrl: null,

        customerName: "MNO USER",

        userID: "demo-user-id-001",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-002",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-002",

        bankName: null,

        loanType:
          "Loan against property - Residential",

        loanTypeID: 7,

        date: "2026-04-09",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 7000000,
        sanctionedLoanAmount: 5000000,
        disbursedLoanAmount: 3000000,

        sanctionLetterUrl: null,

        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-002",

        progressPercent: 20,

        isCamReportGenerated: false,

        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-003",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-003",

        bankName: null,

        loanType: "CC/OD - Secured",
        loanTypeID: 10,

        date: "2026-04-08",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 5000000,
        sanctionedLoanAmount: 5000000,
        disbursedLoanAmount: 2100000,

        sanctionLetterUrl: null,

        customerName:
          "XYZ BUSINESS SOLUTIONS LLP",

        userID: "demo-user-id-003",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-004",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-004",

        bankName: "Demo Finance Bank",

        loanType:
          "Loan against property - Industrial",

        loanTypeID: 9,

        date: "2026-03-31",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 2000000,
        sanctionedLoanAmount: 2000000,
        disbursedLoanAmount: 2000000,

        sanctionLetterUrl: null,

        customerName:
          "DEF INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-004",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-005",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-005",

        bankName: null,

        loanType: "Personal Loan",
        loanTypeID: 2,

        date: "2026-03-06",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 500000,
        sanctionedLoanAmount: 500000,
        disbursedLoanAmount: 500000,

        sanctionLetterUrl: null,

        customerName: "OPQ USER",

        userID: "demo-user-id-005",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Disbursed",
          color: "#0BB680",
          statusID: 6,
        },
      },
    ],
  },
};

const demoRejectedLoanApplicationsResponse: IGetAllLoanApplicationsResponse =
{
  status: true,
  statusCode: 200,
  message:
    "List of all Loan Applications fetched successfully!",

  data: {
    totalLoanApplications: 2,

    loanApplications: [
      {
        loanApplicationID:
          "demo-loan-id-001",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-001",

        bankName: null,

        loanType:
          "Loan against property - Commercial",

        loanTypeID: 8,

        date: "2025-09-02",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName:
          "ABC INDUSTRIES PRIVATE LIMITED",

        userID: "demo-user-id-001",

        progressPercent: 40,

        isCamReportGenerated: false,

        status: {
          label: "Rejected",
          color: "#F64F59",
          statusID: 7,
        },
      },

      {
        loanApplicationID:
          "demo-loan-id-002",

        disbursementId:
          "00000000-0000-0000-0000-000000000000",

        loanApplicationCode: "DEMO-LA-002",

        bankName: null,

        loanType:
          "Loan against property - Residential",

        loanTypeID: 7,

        date: "2025-05-26",

        sanctionedDate: null,
        disbursedDate: null,

        loanAmount: 1500000,

        sanctionedLoanAmount: null,
        disbursedLoanAmount: null,

        sanctionLetterUrl: null,

        customerName: "MNO USER",

        userID: "demo-user-id-002",

        progressPercent: 40,

        isCamReportGenerated: true,

        status: {
          label: "Rejected",
          color: "#F64F59",
          statusID: 7,
        },
      },
    ],
  },
};

export const getDemoUserNotifications =
  async (): Promise<IGetNotificationResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoNotificationsResponse;
  };

export const updateDemoNotificationStatus =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return {
      status: true,
      statusCode: 200,
      message: "Notification status updated successfully!",
    };
  };

export const getDemoCpSpList = async (): Promise<IGetPartnerListResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoPartnerListResponse;
};

export const getDemoChannelPartnerDashboard =
  async (): Promise<IChannelPartnerDashboardResponse> => {
    await wait(DEMO_DELAY_MS);
    const currentUser = getCurrentDemoUser();

    if (currentUser?.userID === "edu-inst-001") {
      return demoEducationInstituteDashboardResponse;
    }

    return demoChannelPartnerDashboardResponse;
  };

export const getDemoSubscriptionHistory =
  async (): Promise<ISubscriptionListingResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSubscriptionHistoryResponse;
  };

export const getDemoSubscriptionPlans =
  async (): Promise<ISubscriptionPlanListingResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSubscriptionPlansResponse;
  };

export const getDemoSubscriptionUsage =
  async (): Promise<ISubscriptionUsageResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSubscriptionUsageResponse;
  };

export const getDemoReferralCode = async (): Promise<IRefferalCodeResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoReferralCodeResponse;
};

export const generateDemoReferralCode =
  async (): Promise<IRefferalCodeResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoReferralCodeResponse;
  };

export const getVerifyReferralCode =
  async (): Promise<IRefferalCodeResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoVerifyReferralCodeResponse;
  };

export const getDemoTrackReferrals =
  async (): Promise<IRefferalListingResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoTrackReferralsResponse;
  };

export const getDemoWalletHistory =
  async (): Promise<IWalletListingResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoWalletHistoryResponse;
  };

export const getDemoReferralPoints =
  async (): Promise<IRefferalDataResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoReferralPointsResponse;
  };

export const getDemoPayOutsList = async (): Promise<IPayOutsResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoPayOutsListResponse;
};

export const getDemoLoanDetail = async (): Promise<ILoanResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoLoanDetailResponse;
};

export const getDemoClientDetail = async (): Promise<IClientResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoClientDetailResponse;
};

export const getDemoSourcingPartnerDetail =
  async (): Promise<ISourcingPartnerDetailsResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSourcingPartnerDetailResponse;
  };

export const getDemoCpReportDetail =
  async (): Promise<IChannelPartnerClientReportDetailResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoCpReportDetailResponse;
  };

export const getDemoPayOutsDetail =
  async (): Promise<IPayOutsDetailResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoPayOutDetailResponse;
  };

export const getDemoSpPayoutsList =
  async (): Promise<ISourcingPartnerPayOutsResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSpPayoutsListResponse;
  };

export const getDemoSpPayoutDetail =
  async (): Promise<ISourcingPartnerPayOutDetailResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSpPayoutDetailResponse;
  };

export const generateDemoCpPayoutInvoice =
  async (): Promise<IGenerateCpPayoutInvoiceResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoCpPayoutInvoiceResponse;
  };

export const updateDemoSpPayoutRequest =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return demoUpdateSpPayoutResponse;
  };

export const generateDemoSpPayoutInvoice =
  async (): Promise<any> => {
    await wait(DEMO_DELAY_MS);
    return demoSpPayoutInvoiceResponse;
  };

export const getDemoStates = async (): Promise<IFetchStateResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoStatesResponse;
};

export const createDemoLink = async (): Promise<ISubscriptionResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoCreateLinkResponse;
};

export const convertDemoPartnersToCoApplicants =
  async (): Promise<APIResponseEntity> => {
    await wait(DEMO_DELAY_MS);
    return demoConvertPartnersResponse;
  };

export const getDemoClientMaster = async (params?: {
  page?: number;
  pageSize?: number;
  customerName?: string;
  categoryID?: string;
  isShowOnlyActiveClients?: boolean;
}): Promise<IClientMasterResponse> => {
  await wait(DEMO_DELAY_MS);

  const searchText = params?.customerName?.trim().toLowerCase() || "";
  let filteredCustomers = [...demoClientMasterResponse.data.customersList];

  if (params?.isShowOnlyActiveClients) {
    filteredCustomers = filteredCustomers.filter(
      (customer) => customer.isActive,
    );
  }

  if (searchText) {
    filteredCustomers = filteredCustomers.filter((customer) => {
      const searchableFields = [
        customer.fullName,
        customer.customerCode,
        customer.sourcingPartnerName || "",
      ];

      return searchableFields.some((field) =>
        field.toLowerCase().includes(searchText),
      );
    });
  }

  const page = params?.page ?? 1;
  const pageSize =
    params?.pageSize && params.pageSize > 0
      ? params.pageSize
      : filteredCustomers.length || 10;
  const startIndex = Math.max(page - 1, 0) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + pageSize,
  );

  return {
    ...demoClientMasterResponse,
    data: {
      totalCount: filteredCustomers.length,
      customersList: paginatedCustomers,
      categoryList: demoClientMasterResponse.data.categoryList,
    },
  };
};

export const getDemoLoanTypeList = async (): Promise<ILoanTypeListResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoLoanTypeListResponse;
};

export const getDemoPincode =
  async (): Promise<IPincodeFetchDetailsResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoPincodeResponse;
  };

export const addDemoLoanApplication =
  async (): Promise<IApplyLoanApplicationResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoAddLoanApplicationResponse;
  };

export const getDemoPanDetails = async (): Promise<IAddPanCardResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoPanDetailsResponse;
};

export const addDemoUserWithoutOtp = async (): Promise<ILogoutResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoAddUserWithoutOtpResponse as unknown as ILogoutResponse;
};

export const updateDemoLoanApplicationStatus =
  async (): Promise<IUpdateLoanStatusResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoUpdateLoanApplicationStatusResponse;
  };

export const uploadDemoSanctionLetter =
  async (): Promise<IUpdateLoanStatusResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoUploadSanctionLetterResponse;
  };

export const logoutDemoUser = async (): Promise<ILogoutResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoLogoutResponse;
};

export const getDemoUserProfile = async (): Promise<IUserProfileResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoUserProfileResponse;
};

export const updateDemoUserProfile = async (
  data?: FormData,
): Promise<ILogoutResponse> => {
  await wait(DEMO_DELAY_MS);

  if (!data) {
    return demoUpdateUserResponse;
  }

  const currentUserData = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_USER_DATA,
  );
  const impersonateUserData = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
  );
  const isImpersonate =
    currentUserData !== impersonateUserData &&
    Boolean(currentUserData) &&
    Boolean(impersonateUserData);

  const currentProfile = await getDemoUserProfileByContext(
    currentUserData,
    impersonateUserData,
    isImpersonate,
  );

  const currentUser =
    (currentUserData ? JSON.parse(currentUserData) : null) ||
    (impersonateUserData ? JSON.parse(impersonateUserData) : null);
  const profileId = currentProfile.data.id || currentUser?.userID || currentUser?.id;

  const readString = (field: string, shouldDecrypt = false): string | null => {
    const value = data.get(field);
    if (typeof value !== "string" || value === "") return null;

    if (!shouldDecrypt) return value;

    try {
      return decryptVAPTData(value);
    } catch {
      return value;
    }
  };

  const readJson = <T,>(field: string): T | null => {
    const value = data.get(field);
    if (typeof value !== "string" || value === "") return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  };

  const toDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const partners = readJson<Record<string, unknown>[]>("partners");
  const normalizedPartners: PartnerData[] | undefined = partners?.map((partner) => {
    const nextPartner: Record<string, unknown> = {};

    Object.entries(partner).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        nextPartner[key] = value;
        return;
      }

      if (
        ["id", "name", "firstName", "middleName", "lastName", "gender", "profilePicture"].includes(
          key,
        )
      ) {
        nextPartner[key] = value;
        return;
      }

      if (typeof value === "string") {
        try {
          nextPartner[key] = decryptVAPTData(value);
        } catch {
          nextPartner[key] = value;
        }
        return;
      }

      nextPartner[key] = value;
    });

    return nextPartner as unknown as PartnerData;
  });

  const nextProfile: IUserProfileResponse = {
    ...currentProfile,
    data: {
      ...currentProfile.data,
      bankName: readString("bankName") ?? currentProfile.data.bankName,
      bankAccountNumber:
        readString("bankAccountNumber", true) ?? currentProfile.data.bankAccountNumber,
      ifscCode: readString("ifscCode", true) ?? currentProfile.data.ifscCode,
      aadhaar: readString("aadhaar", true) ?? currentProfile.data.aadhaar,
      selectedGstNumber:
        readString("gstNumber", true) ?? currentProfile.data.selectedGstNumber,
      address: readString("address", true) ?? currentProfile.data.address,
      city: readString("city", true) ?? currentProfile.data.city,
      state: readString("state", true) ?? currentProfile.data.state,
      zipCode: readString("zipCode", true) ?? currentProfile.data.zipCode,
      udhyamAadhaar:
        readString("udhyamAadhaar", true) ?? currentProfile.data.udhyamAadhaar,
      mobileNumber:
        readString("mobileNumber", true) ?? currentProfile.data.mobileNumber,
      constitution: readString("constitution") ?? currentProfile.data.constitution ?? null,
      website: readString("website") ?? currentProfile.data.website ?? null,
      billingDetails:
        readString("billingDetails") !== null
          ? readString("billingDetails") === "true"
          : currentProfile.data.billingDetails,
      userConsents:
        readJson<typeof currentProfile.data.userConsents>("userConsents") ??
        currentProfile.data.userConsents,
      partners: normalizedPartners ?? currentProfile.data.partners,
    },
  };

  const profilePictureFile = data.get("profilePicture");
  if (profilePictureFile instanceof File) {
    nextProfile.data.profilePicture = await toDataUrl(profilePictureFile);
  }

  const companyLogoFile = data.get("cpCompanyLogo");
  if (companyLogoFile instanceof File) {
    nextProfile.data.cpCompanyLogo = await toDataUrl(companyLogoFile);
  }

  if (profileId) {
    persistDemoProfileById(profileId, nextProfile);
  }

  return demoUpdateUserResponse;
};

export const deleteDemoUserProfile = async (): Promise<ILogoutResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoDeleteUserResponse;
};

export const getDemoUserManagementList =
  async (): Promise<IUserDataResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoUserManagementResponse;
  };

export const getDemoRoleMasterList = async (): Promise<IRoleMasterResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoRoleMasterResponse;
};

export const getDemoRoleDetail = async (): Promise<IRoleDetailResponse> => {
  await wait(DEMO_DELAY_MS);
  return demoRoleDetailResponse;
};

export const updateDemoRoleDetail = async (): Promise<APIResponseEntity> => {
  await wait(DEMO_DELAY_MS);
  return demoRoleUpdateResponse;
};

export const getDemoAddEditRoleUserData = async (params: {
  userID: string | null;
}): Promise<IGetAddEditRoleUserResponse> => {
  await wait(DEMO_DELAY_MS);
  return getDemoAddEditRoleUserDataResponse(params.userID);
};

export const submitDemoAddEditRoleUserData = async (
  userData: ISaveUserDetailData,
): Promise<IUserDataResponse> => {
  await wait(DEMO_DELAY_MS);

  const existingIndex =
    demoUserManagementResponse.data.userManagementList.findIndex(
      (user) => user.userID === userData.userID,
    );

  const userRecord = {
    userID: userData.userID ?? "demo-created-user-id",
    userName: userData.fullName.trim(),
    roleName: userData.roleName,
    designation: userData.designation,
    email: userData.email || encryptVAPTData("demo.user@example.com"),
    mobileNumber: userData.mobileNumber || encryptVAPTData("9876543210"),
    status: userData.status,
  };

  if (existingIndex >= 0) {
    demoUserManagementResponse.data.userManagementList[existingIndex] =
      userRecord;
  } else {
    demoUserManagementResponse.data.userManagementList.unshift(userRecord);
    demoUserManagementResponse.data.totalCount =
      demoUserManagementResponse.data.userManagementList.length;
  }

  return demoSubmitAddEditRoleUserResponse as unknown as IUserDataResponse;
};

export const getDemoSourcingPartners =
  async (): Promise<ISourcingPartnerResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoSourcingPartnerResponse;
  };

export const getDemoCpReportClientList =
  async (): Promise<IChannelPartnerClientReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoCpReportClientListResponse;
  };

export const getDemoLoanApplications = async (params?: {
  statusFilter?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<IGetAllLoanApplicationsResponse> => {
  await wait(DEMO_DELAY_MS);

  const responseByStatus: Record<string, IGetAllLoanApplicationsResponse> = {
    "1": demoPendingLoanApplicationsResponse,
    "2": demoLoginLoanApplicationsResponse,
    "3": demoQueryLoanApplicationsResponse,
    "4": demoSanctionedLoanApplicationsResponse,
    "5": demoPendingAtCreditLoanApplicationsResponse,
    "6": demoDisbursedLoanApplicationsResponse,
    "7": demoRejectedLoanApplicationsResponse,
  };

  if ((params?.statusFilter) === undefined) {
    return {
      "status": true,
      "statusCode": 200,
      "message": "List of all Loan Applications fetched successfully!",
      "data": {
        "totalLoanApplications": 8,
        "loanApplications": [
          {
            "loanApplicationID": "08deb58f-899c-4e3a-8157-cbdf43002662",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260508",
            "bankName": null,
            "loanType": "CC/OD - Secured",
            "loanTypeID": 10,
            "date": "2026-05-19",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 10000678.000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": true,
            "status": {
              "label": "Pending",
              "color": "#FF632C",
              "statusID": 1
            }
          },
          {
            "loanApplicationID": "08deb58f-47c7-4513-8afe-cffd1d9344c9",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260507",
            "bankName": null,
            "loanType": "Home Loan",
            "loanTypeID": 1,
            "date": "2026-05-19",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 5000000.0000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Pending",
              "color": "#FF632C",
              "statusID": 1
            }
          },
          {
            "loanApplicationID": "08deb58a-d559-49f4-8b83-232c2b58dade",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260506",
            "bankName": null,
            "loanType": "CC/OD - Secured",
            "loanTypeID": 10,
            "date": "2026-05-19",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 100000.00000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Pending",
              "color": "#FF632C",
              "statusID": 1
            }
          },
          {
            "loanApplicationID": "08deacff-b769-4d14-8f06-21a85cf37816",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260505",
            "bankName": null,
            "loanType": "CC/OD - Secured",
            "loanTypeID": 10,
            "date": "2026-05-08",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 10000678.000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": true,
            "status": {
              "label": "Pending",
              "color": "#FF632C",
              "statusID": 1
            }
          },
          {
            "loanApplicationID": "08deacf5-bd62-44ac-8c08-cd703c979893",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260502",
            "bankName": null,
            "loanType": "Home Loan",
            "loanTypeID": 1,
            "date": "2026-05-08",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 10000005.000000000000000000000,
            "sanctionedLoanAmount": 1000000.0000000000000000000000,
            "disbursedLoanAmount": 1000000.0000000000000000000000,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Disbursed",
              "color": "#0BB680",
              "statusID": 6
            }
          },
          {
            "loanApplicationID": "08de8f54-7e21-4514-8560-210217417137",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260420",
            "bankName": "Ujjivan Small Finance Bank",
            "loanType": "Loan against property - Residential",
            "loanTypeID": 7,
            "date": "2026-04-01",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 5000000.0000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": true,
            "status": {
              "label": "Applied",
              "color": "#3DA0E7",
              "statusID": 2
            }
          },
          {
            "loanApplicationID": "08de8f1e-d50d-4178-892f-3170f0484a19",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260318",
            "bankName": null,
            "loanType": "Loan against property - Residential",
            "loanTypeID": 7,
            "date": "2026-03-31",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 5000000.0000000000000000000000,
            "sanctionedLoanAmount": 150000.00000000000000000000000,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Sanctioned",
              "color": "#947CFB",
              "statusID": 4
            }
          },
          {
            "loanApplicationID": "08de8f1b-4267-4cd8-8154-e20e2d3c5582",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260317",
            "bankName": null,
            "loanType": "Home Loan",
            "loanTypeID": 1,
            "date": "2026-03-31",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 5000000.0000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Query Raised",
              "color": "#F4A917",
              "statusID": 3
            }
          },
          {
            "loanApplicationID": "08de8f1b-4267-4cd8-8154-e20e2d3c5582",
            "disbursementId": "00000000-0000-0000-0000-000000000000",
            "loanApplicationCode": "COLA260317",
            "bankName": null,
            "loanType": "Home Loan",
            "loanTypeID": 1,
            "date": "2026-03-31",
            "sanctionedDate": null,
            "disbursedDate": null,
            "loanAmount": 5000000.0000000000000000000000,
            "sanctionedLoanAmount": null,
            "disbursedLoanAmount": null,
            "sanctionLetterUrl": null,
            "raisedQuery": null,
            "customerName": "RAHUL NEGI",
            "userID": "08de8f16-381b-4de4-859f-be9de1bde262",
            "progressPercent": 80,
            "isCamReportGenerated": false,
            "status": {
              "label": "Query Raised",
              "color": "#F4A917",
              "statusID": 3
            }
          }
        ],
      }
    }
  }

  const baseResponse = params?.statusFilter
    ? responseByStatus[params.statusFilter]
    : undefined;

  if (baseResponse) {
    const searchText = params?.search?.trim().toLowerCase() || "";
    const page = params?.page || 1;
    const pageSize =
      params?.pageSize || baseResponse.data.loanApplications.length || 10;

    const filteredApplications =
      searchText.length === 0
        ? baseResponse.data.loanApplications
        : baseResponse.data.loanApplications.filter((application) => {
          const searchableFields = [
            application.customerName,
            application.loanApplicationCode,
            application.loanType || "",
            application.bankName || "",
          ];

          return searchableFields.some((field) =>
            field.toLowerCase().includes(searchText),
          );
        });

    const startIndex = (page - 1) * pageSize;
    const paginatedApplications = filteredApplications.slice(
      startIndex,
      startIndex + pageSize,
    );

    return {
      ...baseResponse,
      data: {
        ...baseResponse.data,
        totalLoanApplications: filteredApplications.length,
        loanApplications: paginatedApplications,
      },
    };
  }

  return {
    status: true,
    statusCode: 200,
    message: "List of all Loan Applications fetched successfully!",
    data: {
      totalLoanApplications: 0,
      loanApplications: [],
    },
  };
};

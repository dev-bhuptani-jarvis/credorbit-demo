import { Permission } from "../../interface/sidebarPermission";
import { IGeneratePublicTokenResponse } from "../../interface/publicToken";
import {
  IVerifyEmailOTPRequest,
  IVerifyEmailOTPResponse,
} from "../../interface/otpRequest";
import { ISendOTPResponse } from "../../interface/signIn";
import { IRefferalDataResponse } from "../../interface/wallet";
import { CLIENT_ROLE } from "../constants/constant";
import { OtpRequestType } from "../constants/enum";
import { decryptVAPTData, encryptVAPTData } from "../functions/encryptDecrypt";

const DEMO_AUTH_OTP = "1234";

const DEMO_DELAY_MS = 300;

const emptyPermissions: Permission[] = [];

const demoChannelPartnerPermissions: Permission[] = [
  {
    rightID: 1,
    parentID: 0,
    rightName: "Dashboard",
    create: true,
    view: null as unknown as boolean,
    list: true,
    displayName: "Dashboard",
    displayOrder: 1,
  },
  {
    rightID: 2,
    parentID: 0,
    rightName: "Profile",
    create: true,
    view: null as unknown as boolean,
    list: true,
    displayName: "Profile",
    displayOrder: 2,
  },
  {
    rightID: 3,
    parentID: 23,
    rightName: "RoleMaster",
    create: true,
    view: true,
    list: true,
    displayName: "Role Master",
    displayOrder: 5,
  },
  {
    rightID: 4,
    parentID: 14,
    rightName: "ClientMaster",
    create: true,
    view: true,
    list: true,
    displayName: "Client Master",
    displayOrder: 7,
  },
  {
    rightID: 5,
    parentID: 14,
    rightName: "ChannelPartner",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: null as unknown as boolean,
    displayName: "Channel Partner",
    displayOrder: 8,
  },
  {
    rightID: 6,
    parentID: 14,
    rightName: "SourcingPartner",
    create: true,
    view: true,
    list: true,
    displayName: "Sourcing Partner",
    displayOrder: 9,
  },
  {
    rightID: 7,
    parentID: 0,
    rightName: "Reports",
    create: null as unknown as boolean,
    view: true,
    list: true,
    displayName: "Reports",
    displayOrder: 10,
  },
  {
    rightID: 8,
    parentID: 15,
    rightName: "ContractChannelPartner",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Channel Partner Contract ",
    displayOrder: 14,
  },
  {
    rightID: 9,
    parentID: 15,
    rightName: "ContractSourcingPartner",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Sourcing Partner Contract ",
    displayOrder: 15,
  },
  {
    rightID: 16,
    parentID: 0,
    rightName: "TermsAndConditions",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: null as unknown as boolean,
    displayName: "Terms & Conditions",
    displayOrder: 19,
  },
  {
    rightID: 17,
    parentID: 0,
    rightName: "Subscription",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Subscription",
    displayOrder: 23,
  },
  {
    rightID: 18,
    parentID: 23,
    rightName: "ManageUsers",
    create: true,
    view: true,
    list: true,
    displayName: "Manage Users",
    displayOrder: 4,
  },
  {
    rightID: 19,
    parentID: 7,
    rightName: "ChannelPartnerReport",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: null as unknown as boolean,
    displayName: "Channel Partner Report",
    displayOrder: 11,
  },
  {
    rightID: 20,
    parentID: 7,
    rightName: "GeographicalReport",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: null as unknown as boolean,
    displayName: "Geographical Report",
    displayOrder: 12,
  },
  {
    rightID: 21,
    parentID: 13,
    rightName: "ChannelPartnerPayout",
    create: true,
    view: true,
    list: true,
    displayName: "My Payout",
    displayOrder: 21,
  },
  {
    rightID: 22,
    parentID: 13,
    rightName: "SourcingPartnerPayout",
    create: true,
    view: true,
    list: true,
    displayName: "SP Payout",
    displayOrder: 22,
  },
  {
    rightID: 10,
    parentID: 15,
    rightName: "ContractClient",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: null as unknown as boolean,
    displayName: "Client Contract ",
    displayOrder: 16,
  },
  {
    rightID: 11,
    parentID: 0,
    rightName: "Policy",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Policy",
    displayOrder: 17,
  },
  {
    rightID: 12,
    parentID: 0,
    rightName: "Support",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Support",
    displayOrder: 18,
  },
  {
    rightID: 13,
    parentID: 0,
    rightName: "PayOuts",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Payouts",
    displayOrder: 20,
  },
  {
    rightID: 14,
    parentID: 0,
    rightName: "UserMaster",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Master",
    displayOrder: 6,
  },
  {
    rightID: 15,
    parentID: 0,
    rightName: "Contracts",
    create: null as unknown as boolean,
    view: null as unknown as boolean,
    list: true,
    displayName: "Contracts",
    displayOrder: 13,
  },
  {
    rightID: 23,
    parentID: 0,
    rightName: "UserManagement",
    create: true,
    view: true,
    list: true,
    displayName: "User Management",
    displayOrder: 3,
  },
  {
    rightID: 24,
    parentID: 0,
    rightName: "WalletAndReferral",
    create: true,
    view: true,
    list: true,
    displayName: "Wallet and Referral",
    displayOrder: 24,
  },
];

const demoLoginAssociatedUsers = [
  {
    userType: 3,
    cpID: "08dd2596-99f9-43e6-8b7b-d62ab50b29a2",
    spID: null,
    cpName: "MEGHAL SHAH NEW & ASSOCIATES",
    spName: null,
    userName: "MEGHAL SHAH NEW & ASSOCIATES",
    userID: "08dd25b0-d9a3-4d54-8b53-04adf5ca7137",
  },
  {
    userType: 3,
    cpID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    spID: null,
    cpName: "Jarvis Credo CP",
    spName: null,
    userName: "DEV SANJAYKUMAR BHUPTANI",
    userID: "08dd5d47-8d58-4536-816e-69beba1e38f8",
  },
  {
    userType: 2,
    cpID: null,
    spID: null,
    cpName: null,
    spName: null,
    userName: "Jarvis Credo CP",
    userID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
  },
];

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getRoleMeta = (userType?: number) => {
  switch (userType) {
    case CLIENT_ROLE.CHANNEL_PARTNER:
      return {
        roleID: CLIENT_ROLE.CHANNEL_PARTNER,
        roleName: "Channel Partner",
      };
    case CLIENT_ROLE.SOURCING_PARTNER:
      return {
        roleID: CLIENT_ROLE.SOURCING_PARTNER,
        roleName: "Sourcing Partner",
      };
    case CLIENT_ROLE.SUPER_ADMIN:
      return {
        roleID: CLIENT_ROLE.SUPER_ADMIN,
        roleName: "Super Admin",
      };
    case CLIENT_ROLE.CUSTOMER:
    default:
      return {
        roleID: CLIENT_ROLE.CUSTOMER,
        roleName: "Borrower",
      };
  }
};

const buildDemoUserName = (encryptedEmail?: string, encryptedPan?: string) => {
  const email = encryptedEmail ? decryptVAPTData(encryptedEmail) : "";
  const panNumber = encryptedPan ? decryptVAPTData(encryptedPan) : "";
  const emailName = email.split("@")[0]?.trim();

  if (emailName) {
    return emailName
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return panNumber || "Demo User";
};

export const getDemoAuthOtp = () => DEMO_AUTH_OTP;

export const generateDemoPublicToken =
  async (): Promise<IGeneratePublicTokenResponse> => {
    await wait(DEMO_DELAY_MS);

    return {
      statusCode: 200,
      status: true,
      message: "Token has been generated successfully!",
      data: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IlY0VDVxWmF4d0w1aERkenVCdFFmc292a3c2VVhZRlNsSGlVYjFOcmd0VDUzR1F1OHVZcVovUkFMOXBxckIwQ2IiLCJuYmYiOjE3NzYwNjg1MzIsImV4cCI6MTc3NjE1NDkzMiwiaWF0IjoxNzc2MDY4NTMyfQ.WAMEcO1RtF6izYh2m9oArCtdK90vMQ5TuFwHhGDKX-k",
    };
  };

export const sendDemoOTP = async (bodyRequestObject: any): Promise<ISendOTPResponse> => {
  await wait(DEMO_DELAY_MS);

  const associatedUsers =
    bodyRequestObject?.otpType === OtpRequestType.LOGIN
      ? demoLoginAssociatedUsers
      : [];

  return {
    statusCode: 200,
    status: true,
    message:
      bodyRequestObject?.otpType === OtpRequestType.LOGIN
        ? "Successfully sent OTP to your Mobile Number!"
        : `Demo OTP sent successfully. Use ${DEMO_AUTH_OTP} to continue.`,
    data: {
      associatedUsers,
    },
  };
};

export const verifyDemoOTP = async (
  bodyRequestObject: IVerifyEmailOTPRequest & {
    panNumber?: string;
    userID?: string;
    referralCode?: string;
    channelPartnerCode?: string;
  },
): Promise<IVerifyEmailOTPResponse> => {
  await wait(DEMO_DELAY_MS);

  if (String(bodyRequestObject?.otp ?? "") !== DEMO_AUTH_OTP) {
    return {
      statusCode: 400,
      status: false,
      message: `Invalid demo OTP. Please enter ${DEMO_AUTH_OTP}.`,
      data: {} as IVerifyEmailOTPResponse["data"],
    };
  }

  const selectedLoginUser = demoLoginAssociatedUsers.find(
    (user) => user.userID === bodyRequestObject.userID,
  );
  const resolvedUserType =
    selectedLoginUser?.userType ??
    bodyRequestObject.userType ??
    CLIENT_ROLE.CUSTOMER;
  const roleMeta = getRoleMeta(resolvedUserType);
  const encryptedPanNumber =
    bodyRequestObject.panNumber ||
    (resolvedUserType === CLIENT_ROLE.CHANNEL_PARTNER
      ? "uBrXSZkYxtxeJ12EzmYaLA=="
      : encryptVAPTData("ABCDE1234F"));

  if (!bodyRequestObject.userType) {
    if (resolvedUserType === CLIENT_ROLE.CHANNEL_PARTNER) {
      return {
        statusCode: 200,
        status: true,
        message: "Successfully signed in!",
        data: {
          userID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
          userName: "Jarvis Credo CP",
          showPanDetailPopUp: false,
          emailID: "PjCsDPUr/SMcy0TJrJ1Wb5Ggye2vwjyj41h4oJMW5LQ=",
          mobileNumber: "DR/IXQnqfRCnSsOyS0i9gA==",
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IlBXUzJKTkJEU2dRMDErK3BXY2tLVHZ4a0ZZaHZSQU1XeVByTzRHT1cxWmRoVUFRMyswa2s5aWFJVVRVbmhpRDQiLCJuYmYiOjE3NzYwNjg2NzAsImV4cCI6MTc3NjE1NTA3MCwiaWF0IjoxNzc2MDY4NjcwfQ.awRI0EGQHWtvWhgqvhcINt_37Rc96z9WFlZXJDioLyI",
          userType: 2,
          panTypeID: 9,
          roleID: 2,
          panNumber: "uBrXSZkYxtxeJ12EzmYaLA==",
          gstNumber: "galvf4LyZEjBmoENB1GWrA==",
          roleName: "Channel Partner",
          profilePicture:
            "https://credstagestorage.blob.core.windows.net/credorbit-dev/ProfilePictures/3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9.jpg?sv=2025-05-05&se=2026-04-13T09%3A14%3A45Z&sr=b&sp=r&sig=tk8%2BOcs7detOcrs4y0Gv81cfVlxmDFMAX%2F%2Bo0X5yjhg%3D",
          contractEnforcementDate: "2025-10-09T00:00:00",
          isDefaultCpClient: false,
          isContractSigned: true,
          permissions: demoChannelPartnerPermissions,
        },
      };
    }

    if (resolvedUserType === CLIENT_ROLE.SOURCING_PARTNER) {
      return {
        statusCode: 200,
        status: true,
        message: "Successfully signed in!",
        data: {
          userID: selectedLoginUser?.userID || "08dd25b0-d9a3-4d54-8b53-04adf5ca7137",
          userName:
            selectedLoginUser?.userName || "MEGHAL SHAH NEW & ASSOCIATES",
          showPanDetailPopUp: false,
          emailID: bodyRequestObject.emailID,
          mobileNumber: bodyRequestObject.mobileNumber,
          token: "demo-sourcing-partner-token",
          userType: 3,
          panTypeID: 9,
          roleID: 3,
          panNumber: encryptVAPTData("ABCDE1234F"),
          gstNumber: null,
          roleName: "Sourcing Partner",
          profilePicture: "",
          contractEnforcementDate: "2025-10-09T00:00:00",
          isDefaultCpClient: false,
          isContractSigned: true,
          permissions: demoChannelPartnerPermissions,
        },
      };
    }
  }

  return {
    statusCode: 200,
    status: true,
    message:
      bodyRequestObject.userType != null
        ? "Demo registration completed successfully."
        : "Demo login completed successfully.",
    data: {
      emailID: bodyRequestObject.emailID,
      mobileNumber: bodyRequestObject.mobileNumber,
      permissions: emptyPermissions,
      profilePicture: "",
      roleID: roleMeta.roleID,
      roleName: roleMeta.roleName,
      token: "demo-session-token",
      userID: bodyRequestObject.userID || "demo-user-id",
      userName: buildDemoUserName(
        bodyRequestObject.emailID,
        encryptedPanNumber,
      ),
      userType: resolvedUserType,
      showPanDetailPopUp: false,
      isDefaultCpClient: false,
      isContractSigned: false,
      panNumber: encryptedPanNumber,
      gstNumber: null,
      panTypeID: 1,
      contractEnforcementDate: "2026-01-01T00:00:00.000Z",
    },
  };
};

export const verifyDemoReferralCode = async (
  referralCode: string,
): Promise<IRefferalDataResponse> => {
  await wait(DEMO_DELAY_MS);

  const isValid = referralCode.trim().length === 9;

  return {
    statusCode: isValid ? 200 : 400,
    status: isValid,
    message: isValid
      ? "Demo referral code verified successfully."
      : "Invalid referral code.",
    data: isValid ? 1 : 0,
  };
};

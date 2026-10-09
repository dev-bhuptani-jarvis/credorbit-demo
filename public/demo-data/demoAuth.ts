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
import { decryptLoginVAPTData, decryptVAPTData, encryptVAPTData } from "../functions/encryptDecrypt";

const DEMO_DELAY_MS = 300;

const emptyPermissions: Permission[] = [];

const decryptDemoValue = (value?: string): string => {
  if (!value) return "";

  try {
    return decryptLoginVAPTData(value).trim();
  } catch {
    return "";
  }
};

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
    userType: CLIENT_ROLE.SUPER_ADMIN,
    cpID: null,
    spID: null,
    cpName: null,
    spName: null,
    userName: "Credorbit Technologies Private Limited",
    userID: "f4204821-5d9b-484c-87b7-83e61167840d",
  },
  {
    userType: CLIENT_ROLE.CHANNEL_PARTNER,
    cpID: null,
    spID: null,
    cpName: null,
    spName: null,
    userName: "Demo Nexus CP",
    userID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
  },
  {
    userType: CLIENT_ROLE.CHANNEL_PARTNER,
    cpID: null,
    spID: null,
    cpName: null,
    spName: null,
    userName: "Education Institute One",
    userID: "edu-inst-001",
  },
  {
    userType: CLIENT_ROLE.SOURCING_PARTNER,
    cpID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    spID: null,
    cpName: "Demo Nexus CP",
    spName: null,
    userName: "Demo Source SP",
    userID: "19f2869e-95b7-4faf-81f3-998ede783b61",
  },
  {
    userType: CLIENT_ROLE.CUSTOMER,
    cpID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    spID: null,
    cpName: "Demo Nexus CP",
    spName: null,
    userName: "DEMO INDUSTRIES PRIVATE LIMITED",
    userID: "08de0598-4bee-48ca-8a7c-005b36583e79",
  },
  {
    userType: CLIENT_ROLE.CUSTOMER,
    cpID: "edu-inst-001",
    spID: null,
    cpName: "Education Institute One",
    spName: null,
    userName: "Student One",
    userID: "student-role-001",
  },
  {
    userType: CLIENT_ROLE.CHANNEL_PARTNER,
    cpID: null,
    spID: null,
    cpName: null,
    spName: null,
    userName: "NBFC One",
    userID: "nbfc-user-001",
  },
];

const demoAdminPermissions: Permission[] = [
  { rightID: 1, parentID: 0, rightName: "Dashboard", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Dashboard", displayOrder: 1 } as Permission,
  { rightID: 2, parentID: 0, rightName: "Profile", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Profile", displayOrder: 2 } as Permission,
  { rightID: 3, parentID: 23, rightName: "RoleMaster", create: true, delete: null as unknown as boolean, view: true, list: true, displayName: "Role Master", displayOrder: 5 } as Permission,
  { rightID: 4, parentID: 14, rightName: "ClientMaster", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Client Master", displayOrder: 7 } as Permission,
  { rightID: 5, parentID: 14, rightName: "ChannelPartner", create: true, delete: null as unknown as boolean, view: true, list: true, displayName: "Channel Partner", displayOrder: 8 } as Permission,
  { rightID: 6, parentID: 14, rightName: "SourcingPartner", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Sourcing Partner", displayOrder: 9 } as Permission,
  { rightID: 7, parentID: 0, rightName: "Reports", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Reports", displayOrder: 10 } as Permission,
  { rightID: 8, parentID: 15, rightName: "ContractChannelPartner", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Channel Partner Contract ", displayOrder: 14 } as Permission,
  { rightID: 9, parentID: 15, rightName: "ContractSourcingPartner", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Sourcing Partner Contract ", displayOrder: 15 } as Permission,
  { rightID: 10, parentID: 15, rightName: "ContractClient", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Client Contract ", displayOrder: 16 } as Permission,
  { rightID: 11, parentID: 0, rightName: "Policy", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Policy", displayOrder: 17 } as Permission,
  { rightID: 12, parentID: 0, rightName: "Support", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Support", displayOrder: 18 } as Permission,
  { rightID: 13, parentID: 0, rightName: "PayOuts", create: false, delete: null as unknown as boolean, view: null as unknown as boolean, list: false, displayName: "Payouts", displayOrder: 20 } as Permission,
  { rightID: 14, parentID: 0, rightName: "UserMaster", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Master", displayOrder: 6 } as Permission,
  { rightID: 15, parentID: 0, rightName: "Contracts", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Contracts", displayOrder: 13 } as Permission,
  { rightID: 16, parentID: 0, rightName: "TermsAndConditions", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Terms & Conditions", displayOrder: 19 } as Permission,
  { rightID: 17, parentID: 0, rightName: "Subscription", create: true, delete: null as unknown as boolean, view: true, list: true, displayName: "Subscription", displayOrder: 23 } as Permission,
  { rightID: 18, parentID: 23, rightName: "ManageUsers", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Manage Users", displayOrder: 4 } as Permission,
  { rightID: 19, parentID: 7, rightName: "ChannelPartnerReport", create: null as unknown as boolean, delete: null as unknown as boolean, view: true, list: true, displayName: "Channel Partner Report", displayOrder: 11 } as Permission,
  { rightID: 20, parentID: 7, rightName: "GeographicalReport", create: null as unknown as boolean, delete: null as unknown as boolean, view: true, list: true, displayName: "Geographical Report", displayOrder: 12 } as Permission,
  { rightID: 21, parentID: 13, rightName: "ChannelPartnerPayout", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "My Payout", displayOrder: 21 } as Permission,
  { rightID: 22, parentID: 13, rightName: "SourcingPartnerPayout", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "SP Payout", displayOrder: 22 } as Permission,
  { rightID: 23, parentID: 0, rightName: "UserManagement", create: true, delete: null as unknown as boolean, view: true, list: true, displayName: "User Management", displayOrder: 3 } as Permission,
  { rightID: 24, parentID: 0, rightName: "EducationalManagement", create: true, delete: null as unknown as boolean, view: true, list: true, displayName: "Educational Management", displayOrder: 24 } as Permission,
];

const demoSourcingPartnerPermissions: Permission[] = [
  { rightID: 12, parentID: 0, rightName: "Support", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Support", displayOrder: 18 } as Permission,
  { rightID: 13, parentID: 0, rightName: "PayOuts", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Payouts", displayOrder: 20 } as Permission,
  { rightID: 14, parentID: 0, rightName: "UserMaster", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Master", displayOrder: 6 } as Permission,
  { rightID: 15, parentID: 0, rightName: "Contracts", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Contracts", displayOrder: 13 } as Permission,
  { rightID: 16, parentID: 0, rightName: "TermsAndConditions", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Terms & Conditions", displayOrder: 19 } as Permission,
  { rightID: 17, parentID: 0, rightName: "Subscription", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Subscription", displayOrder: 23 } as Permission,
  { rightID: 18, parentID: 23, rightName: "ManageUsers", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Manage Users", displayOrder: 4 } as Permission,
  { rightID: 19, parentID: 7, rightName: "ChannelPartnerReport", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Channel Partner Report", displayOrder: 11 } as Permission,
  { rightID: 20, parentID: 7, rightName: "GeographicalReport", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Geographical Report", displayOrder: 12 } as Permission,
  { rightID: 21, parentID: 13, rightName: "ChannelPartnerPayout", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "My Payout", displayOrder: 21 } as Permission,
  { rightID: 22, parentID: 13, rightName: "SourcingPartnerPayout", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "SP Payout", displayOrder: 22 } as Permission,
  { rightID: 1, parentID: 0, rightName: "Dashboard", create: null as unknown as boolean, delete: null as unknown as boolean, view: true, list: true, displayName: "Dashboard", displayOrder: 1 } as Permission,
  { rightID: 2, parentID: 0, rightName: "Profile", create: true, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Profile", displayOrder: 2 } as Permission,
  { rightID: 3, parentID: 23, rightName: "RoleMaster", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Role Master", displayOrder: 5 } as Permission,
  { rightID: 4, parentID: 14, rightName: "ClientMaster", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Client Master", displayOrder: 7 } as Permission,
  { rightID: 5, parentID: 14, rightName: "ChannelPartner", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Channel Partner", displayOrder: 8 } as Permission,
  { rightID: 6, parentID: 14, rightName: "SourcingPartner", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Sourcing Partner", displayOrder: 9 } as Permission,
  { rightID: 7, parentID: 0, rightName: "Reports", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Reports", displayOrder: 10 } as Permission,
  { rightID: 8, parentID: 15, rightName: "ContractChannelPartner", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Channel Partner Contract ", displayOrder: 14 } as Permission,
  { rightID: 9, parentID: 15, rightName: "ContractSourcingPartner", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Sourcing Partner Contract ", displayOrder: 15 } as Permission,
  { rightID: 10, parentID: 15, rightName: "ContractClient", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: null as unknown as boolean, displayName: "Client Contract ", displayOrder: 16 } as Permission,
  { rightID: 11, parentID: 0, rightName: "Policy", create: null as unknown as boolean, delete: null as unknown as boolean, view: null as unknown as boolean, list: true, displayName: "Policy", displayOrder: 17 } as Permission,
  { rightID: 23, parentID: 0, rightName: "UserManagement", create: false, delete: null as unknown as boolean, view: false, list: false, displayName: "User Management", displayOrder: 3 } as Permission,
];

const demoClientPermissions: Permission[] = [
  { rightID: 1, parentID: 0, rightName: "Dashboard", create: null, delete: null, view: null, list: true, displayName: "Dashboard", displayOrder: 1 },
  { rightID: 2, parentID: 0, rightName: "Profile", create: true, delete: null, view: null, list: true, displayName: "Profile", displayOrder: 2 },
  { rightID: 3, parentID: 23, rightName: "RoleMaster", create: null, delete: null, view: null, list: null, displayName: "Role Master", displayOrder: 5 },
  { rightID: 4, parentID: 14, rightName: "ClientMaster", create: null, delete: null, view: null, list: null, displayName: "Client Master", displayOrder: 7 },
  { rightID: 5, parentID: 14, rightName: "ChannelPartner", create: null, delete: null, view: null, list: null, displayName: "Channel Partner", displayOrder: 8 },
  { rightID: 6, parentID: 14, rightName: "SourcingPartner", create: null, delete: null, view: null, list: null, displayName: "Sourcing Partner", displayOrder: 9 },
  { rightID: 7, parentID: 0, rightName: "Reports", create: null, delete: null, view: true, list: true, displayName: "Reports", displayOrder: 10 },
  { rightID: 8, parentID: 15, rightName: "ContractChannelPartner", create: null, delete: null, view: null, list: null, displayName: "Channel Partner Contract ", displayOrder: 14 },
  { rightID: 9, parentID: 15, rightName: "ContractSourcingPartner", create: null, delete: null, view: null, list: null, displayName: "Sourcing Partner Contract ", displayOrder: 15 },
  { rightID: 10, parentID: 15, rightName: "ContractClient", create: null, delete: null, view: null, list: true, displayName: "Client Contract ", displayOrder: 16 },
  { rightID: 11, parentID: 0, rightName: "Policy", create: null, delete: null, view: null, list: false, displayName: "Policy", displayOrder: 17 },
  { rightID: 12, parentID: 0, rightName: "Support", create: null, delete: null, view: null, list: true, displayName: "Support", displayOrder: 18 },
  { rightID: 13, parentID: 0, rightName: "PayOuts", create: null, delete: null, view: null, list: null, displayName: "Payouts", displayOrder: 20 },
  { rightID: 14, parentID: 0, rightName: "UserMaster", create: null, delete: null, view: null, list: null, displayName: "Master", displayOrder: 6 },
  { rightID: 15, parentID: 0, rightName: "Contracts", create: null, delete: null, view: null, list: true, displayName: "Contracts", displayOrder: 13 },
  { rightID: 16, parentID: 0, rightName: "TermsAndConditions", create: null, delete: null, view: null, list: null, displayName: "Terms & Conditions", displayOrder: 19 },
  { rightID: 17, parentID: 0, rightName: "Subscription", create: null, delete: null, view: null, list: true, displayName: "Subscription", displayOrder: 23 },
  { rightID: 18, parentID: 23, rightName: "ManageUsers", create: null, delete: null, view: null, list: null, displayName: "Manage Users", displayOrder: 4 },
  { rightID: 19, parentID: 7, rightName: "ChannelPartnerReport", create: null, delete: null, view: null, list: null, displayName: "Channel Partner Report", displayOrder: 11 },
  { rightID: 20, parentID: 7, rightName: "GeographicalReport", create: null, delete: null, view: null, list: null, displayName: "Geographical Report", displayOrder: 12 },
  { rightID: 21, parentID: 13, rightName: "ChannelPartnerPayout", create: null, delete: null, view: null, list: null, displayName: "My Payout", displayOrder: 21 },
  { rightID: 22, parentID: 13, rightName: "SourcingPartnerPayout", create: null, delete: null, view: null, list: null, displayName: "SP Payout", displayOrder: 22 },
  { rightID: 23, parentID: 0, rightName: "UserManagement", create: false, delete: null, view: false, list: false, displayName: "User Management", displayOrder: 3 },
];

const demoStudentPermissions: Permission[] = [
  { rightID: 1, parentID: 0, rightName: "Dashboard", create: null, delete: null, view: null, list: true, displayName: "Dashboard", displayOrder: 1 },
  { rightID: 2, parentID: 0, rightName: "Profile", create: true, delete: null, view: null, list: true, displayName: "Profile", displayOrder: 2 },
  { rightID: 3, parentID: 23, rightName: "RoleMaster", create: null, delete: null, view: null, list: null, displayName: "Role Master", displayOrder: 5 },
  { rightID: 4, parentID: 14, rightName: "ClientMaster", create: null, delete: null, view: null, list: null, displayName: "Client Master", displayOrder: 7 },
  { rightID: 5, parentID: 14, rightName: "ChannelPartner", create: null, delete: null, view: null, list: null, displayName: "Channel Partner", displayOrder: 8 },
  { rightID: 6, parentID: 14, rightName: "SourcingPartner", create: null, delete: null, view: null, list: null, displayName: "Sourcing Partner", displayOrder: 9 },
  { rightID: 7, parentID: 0, rightName: "Reports", create: null, delete: null, view: null, list: null, displayName: "Reports", displayOrder: 10 },
  { rightID: 8, parentID: 15, rightName: "ContractChannelPartner", create: null, delete: null, view: null, list: null, displayName: "Channel Partner Contract ", displayOrder: 14 },
  { rightID: 9, parentID: 15, rightName: "ContractSourcingPartner", create: null, delete: null, view: null, list: null, displayName: "Sourcing Partner Contract ", displayOrder: 15 },
  { rightID: 10, parentID: 15, rightName: "ContractClient", create: null, delete: null, view: null, list: true, displayName: "Client Contract ", displayOrder: 16 },
  { rightID: 11, parentID: 0, rightName: "Policy", create: null, delete: null, view: null, list: false, displayName: "Policy", displayOrder: 17 },
  { rightID: 12, parentID: 0, rightName: "Support", create: null, delete: null, view: null, list: true, displayName: "Support", displayOrder: 18 },
  { rightID: 13, parentID: 0, rightName: "PayOuts", create: null, delete: null, view: null, list: null, displayName: "Payouts", displayOrder: 20 },
  { rightID: 14, parentID: 0, rightName: "UserMaster", create: null, delete: null, view: null, list: null, displayName: "Master", displayOrder: 6 },
  { rightID: 15, parentID: 0, rightName: "Contracts", create: null, delete: null, view: null, list: true, displayName: "Contracts", displayOrder: 13 },
  { rightID: 16, parentID: 0, rightName: "TermsAndConditions", create: null, delete: null, view: null, list: null, displayName: "Terms & Conditions", displayOrder: 19 },
  { rightID: 17, parentID: 0, rightName: "Subscription", create: null, delete: null, view: null, list: true, displayName: "Subscription", displayOrder: 23 },
  { rightID: 18, parentID: 23, rightName: "ManageUsers", create: null, delete: null, view: null, list: null, displayName: "Manage Users", displayOrder: 4 },
  { rightID: 19, parentID: 7, rightName: "ChannelPartnerReport", create: null, delete: null, view: null, list: null, displayName: "Channel Partner Report", displayOrder: 11 },
  { rightID: 20, parentID: 7, rightName: "GeographicalReport", create: null, delete: null, view: null, list: null, displayName: "Geographical Report", displayOrder: 12 },
  { rightID: 21, parentID: 13, rightName: "ChannelPartnerPayout", create: null, delete: null, view: null, list: null, displayName: "My Payout", displayOrder: 21 },
  { rightID: 22, parentID: 13, rightName: "SourcingPartnerPayout", create: null, delete: null, view: null, list: null, displayName: "SP Payout", displayOrder: 22 },
  { rightID: 23, parentID: 0, rightName: "UserManagement", create: false, delete: null, view: false, list: false, displayName: "User Management", displayOrder: 3 },
];

const demoLoginResponses = {
  admin: {
    statusCode: 200,

    status: true,

    message:
      "Successfully signed in!",

    data: {
      userID:
        "demo-admin-id-001",

      userName:
        "ABC TECHNOLOGIES PRIVATE LIMITED",

      showPanDetailPopUp: false,

      emailID:
        "abc@gmail.com",

      mobileNumber:
        "9000000001",

      token:
        "demo-jwt-token",

      userType: 1,

      panTypeID: 1,

      roleID: 1,

      panNumber:
        "encrypted-demo-pan",

      gstNumber:
        "29AAACC1206D2ZB",

      roleName:
        "Admin",

      profilePicture:
        "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

      contractEnforcementDate:
        null as unknown as string,

      isDefaultCpClient: false,

      isContractSigned: false,

      permissions:
        demoAdminPermissions,
    },
  },
  channelPartner: {
    statusCode: 200,
    status: true,
    message: "Successfully signed in!",
    data: {
      userID: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
      userName: "Demo Nexus CP",
      showPanDetailPopUp: false,
      emailID: "PjCsDPUr/SMcy0TJrJ1Wb5Ggye2vwjyj41h4oJMW5LQ=",
      mobileNumber: "DR/IXQnqfRCnSsOyS0i9gA==",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IlBXUzJKTkJEU2dRMDErK3BXY2tLVHZ4a0ZZaHZSQU1XeVByTzRHT1cxWmRoVUFRMyswa2s5aWFJVVRVbmhpRDQiLCJuYmYiOjE3NzYxNDE3NzYsImV4cCI6MTc3NjIyODE3NiwiaWF0IjoxNzc2MTQxNzc2fQ.L4eRsEupN58R6jP_vMF3lUyUpwSNoniDuxoy5Wby7BY",
      userType: 2,
      panTypeID: 9,
      roleID: 2,
      panNumber: "uBrXSZkYxtxeJ12EzmYaLA==",
      gstNumber: "galvf4LyZEjBmoENB1GWrA==",
      roleName: "Channel Partner",
      profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      contractEnforcementDate: "2025-10-09T00:00:00",
      isDefaultCpClient: false,
      isContractSigned: true,
      permissions: demoChannelPartnerPermissions,
    },
  },
  educationInstitute: {
    statusCode: 200,
    status: true,
    message: "Successfully signed in!",
    data: {
      userID: "edu-inst-001",
      userName: "Education Institute One",
      showPanDetailPopUp: false,
      emailID: "educationinstitute1@yopmail.com",
      mobileNumber: "2222222222",
      token: "demo-education-institute-token",
      userType: 2,
      panTypeID: 9,
      roleID: 2,
      panNumber: "EDUIN1234E",
      gstNumber: "24EDUIN1234E1Z5",
      roleName: "Educational Institute",
      profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      contractEnforcementDate: "2025-10-09T00:00:00",
      isDefaultCpClient: false,
      isContractSigned: true,
      permissions: demoChannelPartnerPermissions,
    },
  },
  sourcingPartner: {
    statusCode: 200,

    status: true,

    message:
      "Successfully signed in!",

    data: {
      userID:
        "demo-sp-id-001",

      userName:
        "ABC Source SP",

      showPanDetailPopUp: false,

      emailID:
        "abc@gmail.com",

      mobileNumber:
        "9000000001",

      token:
        "demo-jwt-token",

      userType: 3,

      panTypeID: 1,

      roleID: 3,

      panNumber:
        "encrypted-demo-pan",

      gstNumber:
        "29AAACC1206D2ZB",

      roleName:
        "Sourcing Partner",

      profilePicture:
        "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

      contractEnforcementDate:
        "2025-09-24T00:00:00",

      isDefaultCpClient: false,

      isContractSigned: true,

      permissions:
        demoSourcingPartnerPermissions,
    },
  },
  client: {
    statusCode: 200,

    status: true,

    message: "Successfully signed in!",

    data: {
      userID:
        "08de0598-4bee-48ca-8a7c-005b36583e79",

      userName:
        "DEMO INDUSTRIES PRIVATE LIMITED",

      showPanDetailPopUp: false,

      emailID: "nexustest@yopmail.com",

      mobileNumber: "9000000001",

      token:
        "demo-jwt-token-placeholder",

      userType: 4,

      panTypeID: 2,

      roleID: 4,

      panNumber: "DEMOP1234D",

      gstNumber: "27DEMOP1234D1Z5",

      roleName: "Client",

      profilePicture:
        "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

      contractEnforcementDate:
        "2025-10-09T00:00:00",

      isDefaultCpClient: false,

      isContractSigned: true,

      permissions: demoClientPermissions,
    },
  },
  student: {
    statusCode: 200,
    status: true,
    message: "Successfully signed in!",
    data: {
      userID: "student-role-001",
      userName: "Student One",
      showPanDetailPopUp: false,
      emailID: "student1@yopmail.com",
      mobileNumber: "2222222222",
      token: "demo-student-token",
      userType: 4,
      panTypeID: 2,
      roleID: 4,
      panNumber: "STUDN1234S",
      gstNumber: null,
      roleName: "Student",
      profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      contractEnforcementDate: "2025-10-09T00:00:00",
      isDefaultCpClient: false,
      isContractSigned: true,
      permissions: demoStudentPermissions,
    },
  },
  nbfcUser: {
    statusCode: 200,
    status: true,
    message: "Successfully signed in!",
    data: {
      userID: "nbfc-user-001",
      userName: "NBFC One",
      showPanDetailPopUp: false,
      emailID: "nbfc1@yopmail.com",
      mobileNumber: "2222222222",
      token: "demo-nbfc-user-token",
      userType: 2,
      panTypeID: 9,
      roleID: 2,
      panNumber: "NBFCC1234N",
      gstNumber: "24NBFCC1234N1Z5",
      roleName: "NBFC User",
      profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      contractEnforcementDate: "2025-10-09T00:00:00",
      isDefaultCpClient: false,
      isContractSigned: true,
      permissions: demoChannelPartnerPermissions,
    },
  },
};

const getDemoLoginPreset = (encryptedEmail?: string, encryptedMobile?: string) => {
  const email = decryptDemoValue(encryptedEmail).toLowerCase();
  const mobile = decryptDemoValue(encryptedMobile);

  console.log('email', email)
  console.log('mobile', mobile)

  if (email === "info@credorbit.com" && mobile === "1111111111") {
    console.log('admin');
    return {
      associatedUsers: [demoLoginAssociatedUsers[0]],
      response: demoLoginResponses.admin,
    };
  }

  if (email === "credsp1@yopmail.com" && mobile === "3333333333") {
    console.log('sourcing partner');
    return {
      associatedUsers: [demoLoginAssociatedUsers[3]],
      response: demoLoginResponses.sourcingPartner,
    };
  }

  if (email === "educationinstitute1@yopmail.com" && mobile === "2222222222") {
    return {
      associatedUsers: [demoLoginAssociatedUsers[2]],
      response: demoLoginResponses.educationInstitute,
    };
  }

  if (email === "client@yopmail.com" && mobile === "4444444444") {
    console.log('client');
    return {
      associatedUsers: [demoLoginAssociatedUsers[4]],
      response: demoLoginResponses.client,
    };
  }

  if (email === "student1@yopmail.com" && mobile === "2222222222") {
    return {
      associatedUsers: [demoLoginAssociatedUsers[5]],
      response: demoLoginResponses.student,
    };
  }

  if (email === "nbfc1@yopmail.com" && mobile === "2222222222") {
    return {
      associatedUsers: [demoLoginAssociatedUsers[6]],
      response: demoLoginResponses.nbfcUser,
    };
  }

  console.log('channel partner');
  return {
    associatedUsers: [demoLoginAssociatedUsers[1]],
    response: demoLoginResponses.channelPartner,
  };
};

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
      ? getDemoLoginPreset(
        bodyRequestObject?.emailID,
        bodyRequestObject?.mobileNumber,
      ).associatedUsers
      : [];

  return {
    statusCode: 200,
    status: true,
    message: "OTP sent successfully.",
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

  const enteredOtp = String(bodyRequestObject?.otp ?? "");

  if (!/^\d{4}$/.test(enteredOtp)) {
    return {
      statusCode: 400,
      status: false,
      message: "Please enter any valid 4-digit OTP to continue.",
      data: {} as IVerifyEmailOTPResponse["data"],
    };
  }

  const loginPreset = getDemoLoginPreset(
    bodyRequestObject.emailID,
    bodyRequestObject.mobileNumber,
  );
  const selectedLoginUser = loginPreset.associatedUsers.find(
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
      : encryptVAPTData("DEMOP1234D"));

  if (!bodyRequestObject.userType) {
    return loginPreset.response;
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
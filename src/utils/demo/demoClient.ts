import { IVerifyEmailOTPResponse } from "../../interface/otpRequest";
import { IClientDashboardResponse } from "../../interface/clientDashboard";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const demoImpersonateUserResponse = {
  status: true,

  statusCode: 200,

  message: "Impersonated the user successfully!",

  data: {
    userID:
      "08de0598-4bee-48ca-8a7c-005b36583e79",

    userName:
      "DEMO INDUSTRIES PRIVATE LIMITED",

    showPanDetailPopUp: false,

    emailID: "nexustest@yopmail.com",

    mobileNumber: "9000000001",

    token: "demo-jwt-token-placeholder",

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
        rightID: 3,
        parentID: 23,
        rightName: "RoleMaster",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Role Master",
        displayOrder: 5,
      },

      {
        rightID: 4,
        parentID: 14,
        rightName: "ClientMaster",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Client Master",
        displayOrder: 7,
      },

      {
        rightID: 5,
        parentID: 14,
        rightName: "ChannelPartner",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Channel Partner",
        displayOrder: 8,
      },

      {
        rightID: 6,
        parentID: 14,
        rightName: "SourcingPartner",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Sourcing Partner",
        displayOrder: 9,
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
        rightID: 8,
        parentID: 15,
        rightName: "ContractChannelPartner",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName:
          "Channel Partner Contract",
        displayOrder: 14,
      },

      {
        rightID: 9,
        parentID: 15,
        rightName: "ContractSourcingPartner",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName:
          "Sourcing Partner Contract",
        displayOrder: 15,
      },

      {
        rightID: 10,
        parentID: 15,
        rightName: "ContractClient",
        create: null,
        delete: null,
        view: null,
        list: true,
        displayName: "Client Contract",
        displayOrder: 16,
      },

      {
        rightID: 11,
        parentID: 0,
        rightName: "Policy",
        create: null,
        delete: null,
        view: null,
        list: false,
        displayName: "Policy",
        displayOrder: 17,
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
        rightID: 13,
        parentID: 0,
        rightName: "PayOuts",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Payouts",
        displayOrder: 20,
      },

      {
        rightID: 14,
        parentID: 0,
        rightName: "UserMaster",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Master",
        displayOrder: 6,
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
        rightID: 16,
        parentID: 0,
        rightName: "TermsAndConditions",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Terms & Conditions",
        displayOrder: 19,
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
        rightID: 18,
        parentID: 23,
        rightName: "ManageUsers",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "Manage Users",
        displayOrder: 4,
      },

      {
        rightID: 19,
        parentID: 7,
        rightName: "ChannelPartnerReport",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName:
          "Channel Partner Report",
        displayOrder: 11,
      },

      {
        rightID: 20,
        parentID: 7,
        rightName: "GeographicalReport",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName:
          "Geographical Report",
        displayOrder: 12,
      },

      {
        rightID: 21,
        parentID: 13,
        rightName: "ChannelPartnerPayout",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "My Payout",
        displayOrder: 21,
      },

      {
        rightID: 22,
        parentID: 13,
        rightName: "SourcingPartnerPayout",
        create: null,
        delete: null,
        view: null,
        list: null,
        displayName: "SP Payout",
        displayOrder: 22,
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
} as IVerifyEmailOTPResponse;

const demoImpersonateStudentResponse = {
  status: true,
  statusCode: 200,
  message: "Student impersonated successfully!",
  data: {
    
  },
} as IVerifyEmailOTPResponse;

const demoClientDashboardResponse = {
  status: true,
  statusCode: 200,
  message: "List of all Loan Applications fetched successfully!",
  data: {
    creditScore: null,
    maxCreditScore: 900,
    creditScoreFetchedDate: "2026-04-01T12:49:17.964011",
    loanApplicationList: [
      {
        loanApplicationID: "08de9957-529b-4df9-83f6-e3ded4006a52",
        disbursementId: "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "COLA260423",
        bankName: null,
        loanType: "Home Loan",
        loanTypeID: 1,
        date: "2026-04-13",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 5000000.0,
        sanctionedLoanAmount: 5000000.0,
        disbursedLoanAmount: 100000.0,
        sanctionLetterUrl: null,
        customerName: "DEMO INDUSTRIES PRIVATE LIMITED",
        userID: "08de0598-4bee-48ca-8a7c-005b36583e79",
        progressPercent: 60,
        isCamReportGenerated: false,
        status: { label: "Disbursed", color: "#0BB680", statusID: 6 },
      },
      {
        loanApplicationID: "08de9601-76b5-4691-880a-1116e852fe41",
        disbursementId: "00000000-0000-0000-0000-000000000000",
        loanApplicationCode: "COLA260412",
        bankName: null,
        loanType: "Loan against property - Residential",
        loanTypeID: 7,
        date: "2026-04-09",
        sanctionedDate: null,
        disbursedDate: null,
        loanAmount: 5000000.0,
        sanctionedLoanAmount: 4000000.0,
        disbursedLoanAmount: 650000.0,
        sanctionLetterUrl: null,
        customerName: "DEMO INDUSTRIES PRIVATE LIMITED",
        userID: "08de0598-4bee-48ca-8a7c-005b36583e79",
        progressPercent: 60,
        isCamReportGenerated: false,
        status: { label: "Disbursed", color: "#0BB680", statusID: 6 },
      },
    ],
    reports: [
      {
        name: "GST Report",
        filePath: "/assets/images/GST Report.pdf",
        reportType: 5,
      },
      {
        name: "ITR Report",
        filePath: "/assets/images/ITR Report.pdf",
        reportType: 4,
      },
      {
        name: "Banking Report",
        filePath: "/assets/images/Banking Report.pdf",
        reportType: 3,
      },
      {
        name: "Credit Analytics Report",
        filePath: "/assets/images/Credit Analytics Report.pdf",
        reportType: 1,
      },
    ],
    creditReportDate: "2026-04-02T15:08:11.671899",
    bankingReportDate: "2026-03-20T14:25:56.378287",
    itrReportDate: null,
    gstReportDate: "2026-02-26T05:21:11.871114",
    rocReportDate: null,
    cfoReportDate: null,

    gstNumber: "29AAACC1206D2ZB",

    gstList: [
      {
        id: 220,
        userId: "08de0598-4bee-48ca-8a7c-005b36583e79",
        gstNo: "29AAACC1206D2ZB",
        dateOfGstRegistration: null,
        tradeName: "Orbitex Industries",
        gstAddress: null,
        cinOrLLP: null,
        user: null,
      },
      {
        id: 221,
        userId: "08de0598-4bee-48ca-8a7c-005b36583e79",
        gstNo: "29AAACC1206D2ZC",
        dateOfGstRegistration: null,
        tradeName: "Orbitex Logistics",
        gstAddress: null,
        cinOrLLP: null,
        user: null,
      },
      {
        id: 222,
        userId: "08de0598-4bee-48ca-8a7c-005b36583e79",
        gstNo: "29AAACC1206D2ZD",
        dateOfGstRegistration: null,
        tradeName: "Orbitex Manufacturing",
        gstAddress: null,
        cinOrLLP: null,
        user: null,
      },
    ],

    totalLoanApplicationsCountByStatus: [
      {
        displayName: "Total Applications",
        displayOrder: 0,
        amount: 0,
        noOfApplications: 9,
        formattedAmount: null,
        statusID: 0,
      },
      {
        displayName: "Login Applications",
        displayOrder: 2,
        amount: 0,
        noOfApplications: 0,
        formattedAmount: null,
        statusID: 2,
      },
      {
        displayName: "Sanctioned Applications",
        displayOrder: 4,
        amount: 0,
        noOfApplications: 0,
        formattedAmount: null,
        statusID: 4,
      },
    ],

    userDetails: {
      contractEnforcementDate: "2025-10-09T00:00:00",
      emailID: "abc@gmail.com",
      isContractSigned: true,
      profilePicture:
        "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
      showPanDetailPopUp: false,
      userName: "DEMO INDUSTRIES PRIVATE LIMITED",
    },

    partners: [
      {
        id: "08de8f1c-36df-44e4-86a5-73ebfe34f5ac",
        name: "AARAV SHAH",
        firstName: "AARAV",
        middleName: "",
        lastName: "SHAH",
        pan: "encrypted-pan-1",
        aadhaarNumber: "encrypted-aadhaar-1",
        address: "encrypted-address-1",
        state: "encrypted-state-1",
        city: "encrypted-city-1",
        pinCode: "encrypted-pincode-1",
        mobile: "encrypted-mobile-1",
        dateOfBirth: "encrypted-dob-1",
        gender: "M",
        creditScore: null,
      },
      {
        id: "08de8f1c-a869-4822-8f52-cea2d9323470",
        name: "DEMO USER TWO",
        firstName: "RIYA",
        middleName: "",
        lastName: "MEHTA",
        pan: "encrypted-pan-2",
        aadhaarNumber: "encrypted-aadhaar-2",
        address: "encrypted-address-2",
        state: "encrypted-state-2",
        city: "encrypted-city-2",
        pinCode: "encrypted-pincode-2",
        mobile: "encrypted-mobile-2",
        dateOfBirth: "encrypted-dob-2",
        gender: "F",
        creditScore: null,
      },
      {
        id: "08de8f1c-b63f-48ef-834a-27d9ac63fc5a",
        name: "DEMO USER SIX",
        firstName: "KARAN",
        middleName: "",
        lastName: "MALHOTRA",
        pan: "encrypted-pan-3",
        aadhaarNumber: "encrypted-aadhaar-3",
        address: "encrypted-address-3",
        state: "encrypted-state-3",
        city: "encrypted-city-3",
        pinCode: "encrypted-pincode-3",
        mobile: "encrypted-mobile-3",
        dateOfBirth: "encrypted-dob-3",
        gender: "M",
        creditScore: null,
      },
      {
        id: "08de8f46-aa27-475a-8aed-955af25bcc6f",
        name: "DEMO USER FOUR",
        firstName: "NEHA",
        middleName: "",
        lastName: "VERMA",
        pan: "encrypted-pan-4",
        aadhaarNumber: "encrypted-aadhaar-4",
        address: "encrypted-address-4",
        state: "encrypted-state-4",
        city: "encrypted-city-4",
        pinCode: "encrypted-pincode-4",
        mobile: "encrypted-mobile-4",
        dateOfBirth: "encrypted-dob-4",
        gender: "F",
        creditScore: null,
      },
      {
        id: "08de8f48-7e49-495e-8838-3a1c25b67e97",
        name: "VIKRAM IYER",
        firstName: "VIKRAM",
        middleName: "",
        lastName: "IYER",
        pan: "encrypted-pan-5",
        aadhaarNumber: "encrypted-aadhaar-5",
        address: "encrypted-address-5",
        state: "encrypted-state-5",
        city: "encrypted-city-5",
        pinCode: "encrypted-pincode-5",
        mobile: "encrypted-mobile-5",
        dateOfBirth: "encrypted-dob-5",
        gender: "M",
        creditScore: null,
      },
    ],
  },
} as IClientDashboardResponse;

export const getDemoImpersonateUser =
  async (): Promise<IVerifyEmailOTPResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoImpersonateUserResponse;
  };

export const getDemoClientDashboard =
  async (): Promise<IClientDashboardResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoClientDashboardResponse;
  };

export const getDemoImpersonateStudent =
  async (): Promise<IVerifyEmailOTPResponse> => {
    await wait(DEMO_DELAY_MS);
    return demoImpersonateStudentResponse;
  };

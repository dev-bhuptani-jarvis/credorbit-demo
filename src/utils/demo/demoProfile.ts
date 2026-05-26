import { IUserProfileResponse } from "../../interface/userData";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const adminProfileResponse = {
  status: true,

  statusCode: 200,

  message:
    "User fetched successfully!",

  data: {
    id:
      "demo-admin-id-001",

    name:
      "ABC TECHNOLOGIES PRIVATE LIMITED",

    panNumber:
      "encrypted-demo-pan",

    emailID:
      "encrypted-demo-email",

    mobileNumber:
      "encrypted-demo-mobile",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    selectedGstNumber:
      "encrypted-demo-gst",

    gstList: [],

    billingDetails: true,

    role:
      "Admin",

    customerID:
      "DEMO-ADMIN-001",

    isCompany: true,

    coApplicants: [],

    partners: [],

    commission: 0,

    bankAccountNumber:
      null,

    bankName:
      null,

    ifscCode:
      null,

    dateOfBirth:
      "encrypted-demo-dob",

    address:
      "encrypted-demo-address",

    city:
      "encrypted-demo-city",

    state:
      "encrypted-demo-state",

    country:
      "INDIA",

    zipCode:
      "encrypted-demo-zipcode",

    aadhaar:
      "encrypted-demo-aadhaar",

    udhyamAadhaar:
      "encrypted-demo-udyam",

    cpCompanyLogo:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    userConsents: [],
  },
} as IUserProfileResponse;

const channelPartnerProfileResponse: IUserProfileResponse = {
  status: true,

  statusCode: 200,

  message: "User fetched successfully!",

  data: {
    id:
      "demo-cp-id-001",

    name:
      "ABC Prime CP",

    panNumber:
      "ABCDE1234F",

    emailID:
      "demo@abcprimecp.com",

    mobileNumber:
      "9000000001",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    selectedGstNumber:
      "27ABCDE1234F1Z5",

    gstList: [],

    billingDetails: true,

    role:
      "Channel Partner",

    customerID:
      "DEMO-CP-001",

    isCompany: true,

    coApplicants: [
      {
        id:
          "demo-coapplicant-id-001",

        name:
          "MNO USER",

        firstName: null,

        middleName: null,

        lastName: null,

        pan:
          "MNOPQ1234R",

        aadhaarNumber:
          "XXXX-XXXX-1234",

        address: null,

        state: null,

        city: null,

        pinCode: null,

        mobile: null,

        dateOfBirth: "2021-08-05T13:38:41.932+00:00",

        gender: null,

        creditScore: null,
      },
    ],

    partners: [
      {
        id:
          "demo-partner-id-001",

        name:
          "OPQ USER",

        firstName:
          "OPQ",

        middleName: "",

        lastName:
          "USER",

        pan:
          "PQRSX5678Y",

        aadhaarNumber:
          "XXXX-XXXX-5678",

        address:
          "Demo Corporate Road",

        state:
          "Gujarat",

        city:
          "Ahmedabad",

        pinCode:
          "380015",

        mobile:
          "9000000002",

        dateOfBirth:
          "1991-02-15",

        gender: "M",

        creditScore: null,
      },
    ],

    commission: 2,

    bankAccountNumber:
      "XXXXXX1234",

    bankName:
      "Demo Bank",

    ifscCode:
      "DEMO0001234",

    dateOfBirth:
      "1990-01-01",

    address:
      "Demo Corporate Office, Ahmedabad, Gujarat",

    city:
      "Ahmedabad",

    state:
      "Gujarat",

    country:
      "INDIA",

    zipCode:
      "380015",

    aadhaar:
      "XXXX-XXXX-1234",

    udhyamAadhaar:
      "UDYAM-GJ-01-0000001",

    cpCompanyLogo:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    userConsents: [
      {
        userConsentID: 1,
        consentName: "Email",
        isConsented: true,
      },

      {
        userConsentID: 3,
        consentName: "SMS",
        isConsented: true,
      },

      {
        userConsentID: 5,
        consentName:
          "WhatsApp",

        isConsented: true,
      },
    ],
  },
};

const sourcingPartnerProfileResponse = {
  status: true,

  statusCode: 200,

  message:
    "User fetched successfully!",

  data: {
    id:
      "demo-sp-id-001",

    name:
      "ABC Source SP",

    panNumber:
      "encrypted-demo-pan",

    emailID:
      "encrypted-demo-email",

    mobileNumber:
      "encrypted-demo-mobile",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    selectedGstNumber:
      "encrypted-demo-gst",

    gstList: [],

    billingDetails: true,

    role:
      "Sourcing Partner",

    customerID:
      "DEMO-SP-001",

    isCompany: true,

    coApplicants: [],

    partners: [],

    commission: 55,

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

    country:
      "INDIA",

    zipCode:
      "encrypted-demo-zipcode",

    aadhaar:
      "encrypted-demo-aadhaar",

    udhyamAadhaar:
      null,

    cpCompanyLogo:
      "https://i.postimg.cc/Njq5CnTY/demo-logo.jpg",

    userConsents: [],
  },
} as IUserProfileResponse;

const impersonatedClientProfileResponse = {
  status: true,

  statusCode: 200,

  message: "User fetched successfully!",

  data: {
    id: "08de0598-4bee-48ca-8a7c-005b36583e79",

    name:
      "DEMO INDUSTRIES PRIVATE LIMITED",

    panNumber: "DEMOP1234D",

    emailID: "client.demo@example.com",

    mobileNumber: "9000000001",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    selectedGstNumber:
      "27DEMOP1234D1Z5",

    gstList: [
      {
        gstNumber: "27DEMOP1234D1Z5",
        tradeName: "Orbitex Industries",
        gstAddress:
          "Ahmedabad, Gujarat",
        cinOrLlp:
          "U12345GJ2025PTC000001",
        udhyamAadhaar:
          "UDYAM-GJ-01-0000001",
        dateOfGstRegistration:
          "2025-10-10",
      } as any,

      {
        gstNumber: "24DEMOP1234D1Z2",
        tradeName:
          "Orbitex Trading Division",
        gstAddress:
          "Surat, Gujarat",
        cinOrLlp:
          "U12345GJ2025PTC000002",
        udhyamAadhaar:
          "UDYAM-GJ-24-0000002",
        dateOfGstRegistration:
          "2025-11-15",
      } as any,

      {
        gstNumber: "29DEMOP1234D1Z8",
        tradeName:
          "Orbitex South Operations",
        gstAddress:
          "Bengaluru, Karnataka",
        cinOrLlp:
          "U12345KA2025PTC000003",
        udhyamAadhaar:
          "UDYAM-KR-29-0000003",
        dateOfGstRegistration:
          "2026-01-08",
      } as any,
    ],

    billingDetails: true,

    role: "Client",

    customerID: "COCU251003",

    isCompany: true,

    coApplicants: [
      {
        id:
          "08de90a0-d788-4ff6-82ce-25c363c59baf",

        name: "DEMO USER ONE",

        firstName: null,
        middleName: null,
        lastName: null,

        pan: "ASSOC5678K",

        aadhaarNumber:
          "XXXX-XXXX-1023",

        address: null,
        state: null,
        city: null,
        pinCode: null,
        mobile: null,
        dateOfBirth: null,
        gender: null,
        creditScore: null,
      },

      {
        id:
          "08de90a0-dfd7-4f41-8d66-883df7bdb523",

        name: "DEMO PARTNER ONE",

        firstName: null,
        middleName: null,
        lastName: null,

        pan: "PARTN4321P",

        aadhaarNumber:
          "XXXX-XXXX-2045",

        address: null,
        state: null,
        city: null,
        pinCode: null,
        mobile: null,
        dateOfBirth: null,
        gender: null,
        creditScore: null,
      },

      {
        id:
          "08de9956-ff7d-4dbe-88ee-0167cfd2bca4",

        name: "DEMO USER SIX",

        firstName: null,
        middleName: null,
        lastName: null,

        pan: "COAPP7654T",

        aadhaarNumber:
          "XXXX-XXXX-9087",

        address: null,
        state: null,
        city: null,
        pinCode: null,
        mobile: null,
        dateOfBirth: null,
        gender: null,
        creditScore: null,
      },

      {
        id:
          "08de99e5-5265-4696-85d7-129fd8a235c0",

        name: "DEMO USER FOUR",

        firstName: null,
        middleName: null,
        lastName: null,

        pan: "COAPP8765L",

        aadhaarNumber:
          "XXXX-XXXX-6754",

        address: null,
        state: null,
        city: null,
        pinCode: null,
        mobile: null,
        dateOfBirth: null,
        gender: null,
        creditScore: null,
      },
    ],

    partners: [
      {
        id:
          "08de8f1c-36df-44e4-86a5-73ebfe34f5ac",

        name: "DEMO USER ONE",

        firstName: "AARAV",
        middleName: "",
        lastName: "SHARMA",

        pan: "ASSOC5678K",

        aadhaarNumber:
          "XXXX-XXXX-1023",

        address:
          "Satellite Road, Ahmedabad",

        state: "Gujarat",

        city: "Ahmedabad",

        pinCode: "380015",

        mobile: "9000000001",

        dateOfBirth: "1992-04-12",

        gender: "M",

        creditScore: null,
      },

      {
        id:
          "08de8f1c-a869-4822-8f52-cea2d9323470",

        name: "DEMO USER TWO",

        firstName: "RIYA",
        middleName: "",
        lastName: "MEHTA",

        pan: "REFER6543N",

        aadhaarNumber:
          "XXXX-XXXX-4567",

        address:
          "Prahlad Nagar, Ahmedabad",

        state: "Gujarat",

        city: "Ahmedabad",

        pinCode: "380051",

        mobile: "9000000002",

        dateOfBirth: "1994-09-21",

        gender: "F",

        creditScore: null,
      },

      {
        id:
          "08de8f1c-b63f-48ef-834a-27d9ac63fc5a",

        name: "DEMO PARTNER ONE",

        firstName: "VIKRAM",
        middleName: "",
        lastName: "DESAI",

        pan: "PARTN4321P",

        aadhaarNumber:
          "XXXX-XXXX-2045",

        address:
          "SG Highway, Ahmedabad",

        state: "Gujarat",

        city: "Ahmedabad",

        pinCode: "380054",

        mobile: "9000000003",

        dateOfBirth: "1991-02-15",

        gender: "M",

        creditScore: null,
      },

      {
        id:
          "08de8f46-aa27-475a-8aed-955af25bcc6f",

        name: "KABIR SINGH",

        firstName: "KABIR",
        middleName: "",
        lastName: "SINGH",

        pan: "CLEAN2345R",

        aadhaarNumber:
          "XXXX-XXXX-7788",

        address:
          "Vastrapur, Ahmedabad",

        state: "Gujarat",

        city: "Ahmedabad",

        pinCode: "380052",

        mobile: "9000000004",

        dateOfBirth: "1989-07-10",

        gender: "M",

        creditScore: null,
      },
    ],

    commission: 2,

    bankAccountNumber:
      "XXXXXX4521",

    bankName:
      "HDFC Bank",

    ifscCode:
      "HDFC0001023",

    dateOfBirth: "1990-01-01",

    address:
      "Corporate House, SG Highway, Ahmedabad, Gujarat",

    city: "Ahmedabad",

    state: "Gujarat",

    country: "INDIA",

    zipCode: "380015",

    aadhaar:
      "XXXX-XXXX-4521",

    udhyamAadhaar:
      "UDYAM-GJ-01-0000001",

    cpCompanyLogo:
      "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    userConsents: [
      {
        userConsentID: 984,
        consentName: "Email",
        isConsented: true,
      },

      {
        userConsentID: 986,
        consentName: "SMS",
        isConsented: true,
      },

      {
        userConsentID: 988,
        consentName: "WhatsApp",
        isConsented: true,
      },

      {
        userConsentID: 990,
        consentName: "Call",
        isConsented: true,
      },
    ],
  },
} as IUserProfileResponse;

export const getDemoUserProfileByContext = async (
  currentUserData: string | null,
  impersonateUserData: string | null,
  isImpersonate: boolean,
): Promise<IUserProfileResponse> => {
  await wait(DEMO_DELAY_MS);

  if (isImpersonate) {
    return impersonatedClientProfileResponse;
  }

  try {
    const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
    const impersonateUser = impersonateUserData
      ? JSON.parse(impersonateUserData)
      : null;
    const email = (
      currentUser?.emailID ||
      impersonateUser?.emailID ||
      ""
    ).toLowerCase();

    if (email === "info@credorbit.com") {
      return adminProfileResponse;
    }

    if (email === "credsp1@yopmail.com") {
      return sourcingPartnerProfileResponse;
    }

    if (email === "nexustest@yopmail.com") {
      return impersonatedClientProfileResponse;
    }
  } catch {
    return channelPartnerProfileResponse;
  }

  return channelPartnerProfileResponse;
};

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

const educationInstituteProfileResponse: IUserProfileResponse = {
  status: true,

  statusCode: 200,

  message: "User fetched successfully!",

  data: {
    id: "edu-inst-001",

    name: "Education Institute One",

    panNumber: "EDUIN1234E",

    emailID: "educationinstitute1@yopmail.com",

    mobileNumber: "2222222222",

    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    selectedGstNumber: "24EDUIN1234E1Z5",

    gstList: [],

    billingDetails: true,

    role: "Educational Institute",

    customerID: "EDU-CP-001",

    isCompany: true,

    coApplicants: [],

    partners: [],

    commission: 2,

    bankAccountNumber: "XXXXXX2211",

    bankName: "HDFC Bank",

    ifscCode: "HDFC0002211",

    dateOfBirth: "1991-06-12",

    address: "Education House, SG Highway, Ahmedabad, Gujarat",

    city: "Ahmedabad",

    state: "Gujarat",

    country: "INDIA",

    zipCode: "380015",

    aadhaar: "XXXX-XXXX-2211",

    udhyamAadhaar: "UDYAM-GJ-24-0002211",

    cpCompanyLogo: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    userConsents: [
      {
        userConsentID: 1,
        consentName: "Email",
        isConsented: true,
      },
      {
        userConsentID: 2,
        consentName: "SMS",
        isConsented: true,
      },
    ],
  },
};

const nbfcUserProfileResponse: IUserProfileResponse = {
  status: true,

  statusCode: 200,

  message: "User fetched successfully!",

  data: {
    id: "nbfc-user-001",

    name: "NBFC One",

    panNumber: "NBFCC1234N",

    emailID: "nbfc1@yopmail.com",

    mobileNumber: "2222222222",

    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    selectedGstNumber: "24NBFCC1234N1Z5",

    gstList: [],

    billingDetails: true,

    role: "NBFC User",

    customerID: "NBFC-CP-001",

    isCompany: true,

    coApplicants: [],

    partners: [],

    commission: 2,

    bankAccountNumber: "XXXXXX3311",

    bankName: "ICICI Bank",

    ifscCode: "ICIC0003311",

    dateOfBirth: "1992-04-16",

    address: "NBFC House, Prahladnagar, Ahmedabad, Gujarat",

    city: "Ahmedabad",

    state: "Gujarat",

    country: "INDIA",

    zipCode: "380015",

    aadhaar: "XXXX-XXXX-3311",

    udhyamAadhaar: "UDYAM-GJ-24-0003311",

    cpCompanyLogo: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    userConsents: [
      {
        userConsentID: 1,
        consentName: "Email",
        isConsented: true,
      },
      {
        userConsentID: 2,
        consentName: "SMS",
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

    panNumber: "ABLPK3592Q",

    emailID: "client@yopmail.com",

    mobileNumber: "4444444444",

    profilePicture:
      "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",

    selectedGstNumber:
      "27ABLPK3592Q1Z5",

    gstList: [
      {
        gstNumber: "27ABLPK3592Q1Z5",
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
        gstNumber: "24ABLPK3592Q1Z2",
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
        gstNumber: "29ABLPK3592Q1Z8",
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
          "Demo Road, Ahmedabad",

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
          "Demo Area, Ahmedabad",

        state: "Gujarat",

        city: "Ahmedabad",

        pinCode: "380051",

        mobile: "9000000002",

        dateOfBirth: "1994-09-21",

        gender: "F",

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

    console.log('currentUser', currentUser)
    const impersonateUser = impersonateUserData
      ? JSON.parse(impersonateUserData)
      : null;
    const email = (
      currentUser?.emailID ||
      impersonateUser?.emailID ||
      ""
    ).toLowerCase();
    const userId = currentUser?.userID || impersonateUser?.userID || currentUser?.id || impersonateUser?.id;
    const userType = currentUser?.userType ?? impersonateUser?.userType;
    const roleName = (currentUser?.roleName || impersonateUser?.roleName || "").toLowerCase();

    console.log('email', email)

    if (
      userType === 1 ||
      roleName === "admin" ||
      userId === "demo-admin-id-001" ||
      email === "info@credorbit.com"
    ) {
      return adminProfileResponse;
    }

    if (
      userType === 3 ||
      roleName === "sourcing partner" ||
      userId === "demo-sp-id-001" ||
      email === "credsp1@yopmail.com"
    ) {
      return sourcingPartnerProfileResponse;
    }

    if (
      userId === "edu-inst-001" ||
      email === "educationinstitute1@yopmail.com"
    ) {
      return educationInstituteProfileResponse;
    }

    if (
      userId === "nbfc-user-001" ||
      email === "nbfc1@yopmail.com" ||
      roleName === "nbfc user"
    ) {
      return nbfcUserProfileResponse;
    }

    if (
      userId === "student-role-001" ||
      email === "student1@yopmail.com" ||
      roleName === "student"
    ) {
      return impersonatedClientProfileResponse;
    }

    if (
      userType === 4 ||
      roleName === "client" ||
      userId === "08de0598-4bee-48ca-8a7c-005b36583e79" ||
      email === "client@yopmail.com" ||
      email === "nexustest@yopmail.com"
    ) {
      return impersonatedClientProfileResponse;
    }

    if (
      userType === 2 ||
      roleName === "channel partner" ||
      userId === "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9"
    ) {
      return channelPartnerProfileResponse;
    }

  } catch {
    return channelPartnerProfileResponse;
  }

  return channelPartnerProfileResponse;
};

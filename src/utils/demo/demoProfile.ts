import { IUserProfileResponse } from "../../interface/userData";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const adminProfileResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    id: "f4204821-5d9b-484c-87b7-83e61167840d",
    name: "Credorbit Technologies Private Limited",
    panNumber: "LX/ScGwqfjd5z6ITxli2Tg==",
    emailID: "hgV3Kjk4oifc2LWlj9bHFihc5wiugsecOwYSOvwmm10=",
    mobileNumber: "5D9rxg7pqM2x2MaJHs70MA==",
    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
    selectedGstNumber: "bMr/yes6Ss9amRPkUPPH/g==",
    gstList: [],
    billingDetails: true,
    role: "Admin",
    customerID: "COAD24121",
    isCompany: true,
    coApplicants: [],
    partners: [],
    commission: 0,
    bankAccountNumber: null,
    bankName: null,
    ifscCode: null,
    dateOfBirth: "mGZJeVz+jkdZ+DKyTY+jkUnGBMZkSizZS+h/5B0nFRg=",
    address: "ozngRo1HF43ZIdMVzN9Pwca7pjw97LGyX4ByXpCUt/BQlK63rej6DJdx/b3cBpqfGyhEa/XmoVYmbi4IIeQemnNCuIAwO9/MOaBC2OpthsU=",
    city: "0/uFJ6slmmGhvzYYiBk81g==",
    state: "ACqMBUzXjoW77dzATOXLvA==",
    country: "INDIA",
    zipCode: "Q8guqlvx61CH1gzuXk9bfQ==",
    aadhaar: "pY1R+9dga/ja2YTReusQpA==",
    udhyamAadhaar: "pY1R+9dga/ja2YTReusQpA==",
    cpCompanyLogo: "https://credstagestorage.blob.core.windows.net/credorbit-dev/CPCompanyLogo/f4204821-5d9b-484c-87b7-83e61167840d.png?sv=2025-05-05&se=2026-04-15T10%3A01%3A50Z&sr=b&sp=r&sig=20l7shUwt2QOLlpRCtcNi80Kt2J8gXB6jLLO7CzJ%2FS0%3D",
    userConsents: [],
  },
} as IUserProfileResponse;

const channelPartnerProfileResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    id: "3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9",
    name: "Jarvis Credo CP",
    panNumber: "uBrXSZkYxtxeJ12EzmYaLA==",
    emailID: "PjCsDPUr/SMcy0TJrJ1Wb5Ggye2vwjyj41h4oJMW5LQ=",
    mobileNumber: "DR/IXQnqfRCnSsOyS0i9gA==",
    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
    selectedGstNumber: "galvf4LyZEjBmoENB1GWrA==",
    gstList: [],
    billingDetails: true,
    role: "Channel Partner",
    customerID: "COCP241101",
    isCompany: true,
    coApplicants: [
      {
        id: "08de995c-9f18-485f-8179-86586b8c5125",
        name: "DARSHAK ATULKUMAR ACHARYA",
        firstName: null,
        middleName: null,
        lastName: null,
        pan: "P4OJWWP5SgQ3vzk/ukhRmA==",
        aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==",
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
        id: "08de8bc0-3f7f-49a7-861f-402c96bc70a9",
        name: "DARSHAK ATULKUMAR ACHARYA",
        firstName: "DARSHAK",
        middleName: "ATULKUMAR",
        lastName: "ACHARYA",
        pan: "P4OJWWP5SgQ3vzk/ukhRmA==",
        aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==",
        address: "xpMThbhpbA2FK/T5gihVNHnKd8UV4gM3uVHZPJ5THFhXdq+yepZgK2bPBSP3h5IeJaoPc2/JvCAnEuZ+iPiLTLNmx3i+7b93ImjalyrmcnmBLrgsdDDjvCYka2jvp5KxzWhFXu+fszl7z22gYMZrl2Q8DdLKu6l8pq1dhHT6Z/w=",
        state: "",
        city: "",
        pinCode: "",
        mobile: "",
        dateOfBirth: "D60kyAv6XHMebIyhLZ1KGQ==",
        gender: "M",
        creditScore: null,
      },
    ],
    commission: 2,
    bankAccountNumber: "ucFzF/VSigoE/NK0huuFFQ==",
    bankName: "HDFC",
    ifscCode: "uBT5uZUf8pKY11F7FHqLLA==",
    dateOfBirth: "Yfs+vfAezK8h6/SmmrGVg9dfX8+EhHqibSdDip2RY1o=",
    address: "woAABcGudYHuak92v2If/V5CijOeFB3yq+1bscT9j7cXJ2pjce7CqSEDFI03Tdq0xkvl89hPfw+TP0kLYgnaDe9ftOD4/4LxQ/locsEYCI4bVK/K6aNLNjyyjZ+eMoXD",
    city: "0/uFJ6slmmGhvzYYiBk81g==",
    state: "ACqMBUzXjoW77dzATOXLvA==",
    country: "INDIA",
    zipCode: "rqTjq8a3SfIm3At4hB+wwQ==",
    aadhaar: "pY1R+9dga/ja2YTReusQpA==",
    udhyamAadhaar: "RCVHnNRpk28cp5TFP4PN3A==",
    cpCompanyLogo: "https://credstagestorage.blob.core.windows.net/credorbit-dev/CPCompanyLogo/3ac6f9cf-ef3c-44de-a5b6-c2d4d3848ed9.jpg?sv=2025-05-05&se=2026-04-15T11%3A27%3A39Z&sr=b&sp=r&sig=XBElAQK%2FP%2FtDexTMAcCwOkXSe2UWsoZj7fMItHLwqPc%3D",
    userConsents: [
      { userConsentID: 1, consentName: "Email", isConsented: true },
      { userConsentID: 3, consentName: "SMS", isConsented: true },
      { userConsentID: 5, consentName: "WhatsApp", isConsented: true },
    ],
  },
} as IUserProfileResponse;

const sourcingPartnerProfileResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    id: "19f2869e-95b7-4faf-81f3-998ede783b61",
    name: "Darshak's SP",
    panNumber: "XddZrz34byR+vCoIfeTKpw==",
    emailID: "c7qsnirnKR8HV2QEhD1LgIDxNYkmDwJfieH+CgeLmMA=",
    mobileNumber: "omkLM1XLNKJoEaMlLFlxLQ==",
    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
    selectedGstNumber: "galvf4LyZEjBmoENB1GWrA==",
    gstList: [],
    billingDetails: true,
    role: "Sourcing Partner",
    customerID: "COSP241026",
    isCompany: true,
    coApplicants: [],
    partners: [],
    commission: 55,
    bankAccountNumber: "DY+cXtvPybYJY6yoP+qhBQ==",
    bankName: "baroda",
    ifscCode: "9imgfZ5bWAwGi4czEsXk4Q==",
    dateOfBirth: "iA3YuxcRmsCg8rf8jpxMlyX3P2w2XaAULzwdOOAP2hQ=",
    address: "/82ovDkOB5h87m0ABozfWX3Ry4xeDZFyBbQT3+5+1lHV+/wo1rWFFtaiGbSBq1CZ",
    city: "X/HKR7yb/ue2HKELWvrymg==",
    state: "QNpWMyqbgJxqgAhGIiewjw==",
    country: "INDIA",
    zipCode: "c5mPbPbv/02klbqbATMJnQ==",
    aadhaar: "MgX5JucT6OUNw9uAarO5FQ==",
    udhyamAadhaar: null,
    cpCompanyLogo: "https://credstagestorage.blob.core.windows.net/credorbit-dev/ProfilePictures/DefaultProfilePicture.png?sv=2025-05-05&se=2026-04-15T11%3A28%3A43Z&sr=b&sp=r&sig=u1iFIJ3%2B7msGnbMwd9K48qCZEb8k46WbUjN0EjMWRb0%3D",
    userConsents: [],
  },
} as IUserProfileResponse;

const impersonatedClientProfileResponse = {
  status: true,
  statusCode: 200,
  message: "User fetched successfully!",
  data: {
    id: "08de0598-4bee-48ca-8a7c-005b36583e79",
    name: "NEXUS NUTRI SCIENCE LIMITED",
    panNumber: "cgsUTjP4e1TKDstAGzjwUw==",
    emailID: "QGbhj6TQHkSdcMwrOQjuXnJm9WgL5JmzhNFbOyF3+QA=",
    mobileNumber: "7UnlDe9E9Dd9xrAPlVCSAQ==",
    profilePicture: "https://i.postimg.cc/Njq5CnTY/credorbit-logo.jpg",
    selectedGstNumber: "djtPZLt2l6mxlm5kPD32xw==",
    gstList: [
      { gstNumber: "qM1+glEUF++WdxM3oyACgw==", tradeName: null, gstAddress: null, cinOrLlp: null, udhyamAadhaar: null, dateOfGstRegistration: null } as any,
      { gstNumber: "LrDZ99I/RC7UGJElYhBrLQ==", tradeName: null, gstAddress: null, cinOrLlp: null, udhyamAadhaar: null, dateOfGstRegistration: null } as any,
      { gstNumber: "djtPZLt2l6mxlm5kPD32xw==", tradeName: null, gstAddress: null, cinOrLlp: null, udhyamAadhaar: null, dateOfGstRegistration: null } as any,
    ],
    billingDetails: true,
    role: "Client",
    customerID: "COCU251003",
    isCompany: true,
    coApplicants: [
      { id: "08de90a0-d788-4ff6-82ce-25c363c59baf", name: "DEV SANJAYKUMAR BHUPTANI", firstName: null, middleName: null, lastName: null, pan: "yMxMPliigDtX5/toz6v+xQ==", aadhaarNumber: "5MQcIhAiN8RAsJHaUSjBQg==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de90a0-dfd7-4f41-8d66-883df7bdb523", name: "DARSHAK ATULKUMAR ACHARYA", firstName: null, middleName: null, lastName: null, pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de9956-ff7d-4dbe-88ee-0167cfd2bca4", name: "KARAN RAI", firstName: null, middleName: null, lastName: null, pan: "nH+TAIKCrJ2XFm/gjXt2kw==", aadhaarNumber: "Kn0ctiYNs+aXuSCOTZ4o/w==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
      { id: "08de99e5-5265-4696-85d7-129fd8a235c0", name: "ASHOK SAINI", firstName: null, middleName: null, lastName: null, pan: "iJ2tPLSwpMKeMIDLJ6fxIA==", aadhaarNumber: "Lz15O4Tp2hBBAcWonFQurw==", address: null, state: null, city: null, pinCode: null, mobile: null, dateOfBirth: null, gender: null, creditScore: null },
    ],
    partners: [
      { id: "08de8f1c-36df-44e4-86a5-73ebfe34f5ac", name: "DEV SANJAYKUMAR BHUPTANI", firstName: "DEV", middleName: "SANJAYKUMAR", lastName: "BHUPTANI", pan: "yMxMPliigDtX5/toz6v+xQ==", aadhaarNumber: "5MQcIhAiN8RAsJHaUSjBQg==", address: "PXoBDi6i9qorLkeviDtw4yyMRsAroVxzarUsszuNKZeLZBF7F+jsDQviu8Qm62y1L0QGDfY1gaaPs1qEN86w2xnBSSe1R9N6mH6Llt7eisqXkb0jmXPRWdjgaPqISm4HFsWIV/ov3eculpS2VZqQ+V+WMGL0hnVxbQV7g4a/0eWm3LMqbORAsr7qsNyB2DeY", state: "BkFZ9XSp8OfIQZ3E6jrlAA==", city: "0/uFJ6slmmGhvzYYiBk81g==", pinCode: "1cqyY1btLiZmjXErd2u2Dg==", mobile: "vO5BMExR9EM6qawgtekoVg==", dateOfBirth: "DVXrbb2iCMu2YkMP3s4PyQ==", gender: "M", creditScore: null },
      { id: "08de8f1c-a869-4822-8f52-cea2d9323470", name: "RAHUL NEGI", firstName: "RAHUL", middleName: "", lastName: "NEGI", pan: "NadGzHcmxrOyYL6Xa+aJwA==", aadhaarNumber: "0SlZDHNVt4inOMDmEHOJvA==", address: "v8jip8Xrjw/26byPJcdnvr3JMZyiowj/5lii0NLyjVj4dE9LoxkN2tiotaLsy9XwrSNs/3/YuOnbjhvd5No6UMpLsngbMF2eX2J0/JbiRG+YDB0GZ/u0oq85d5L8xPV1", state: "J9zJBmmB4zDeQF4jdERuzw==", city: "5qKDxGSYTt593e3DQecRJg==", pinCode: "ewwNmyl1ZTmqkH/PQYYADg==", mobile: "Ents0fXvQkeeV1YXpanKSg==", dateOfBirth: "PyDaSrVhr6LKSJZ8rtYmvQ==", gender: "M", creditScore: null },
      { id: "08de8f1c-b63f-48ef-834a-27d9ac63fc5a", name: "DARSHAK ATULKUMAR ACHARYA", firstName: "DARSHAK", middleName: "ATULKUMAR", lastName: "ACHARYA", pan: "P4OJWWP5SgQ3vzk/ukhRmA==", aadhaarNumber: "rXgHI8q/qWT1mehve3IPxQ==", address: "foUByoj8GlaabUfAwsJakcuGkvGgMY8qgvK6v32GwAewlvC/dQ1p/1xG8/M7ka4gPvMwshvVOKEHbESDWkrq8W6z4PFihaxwGeQ4Ow+BP1w=", state: "BkFZ9XSp8OfIQZ3E6jrlAA==", city: "sttq+2jLhUB2djxOgMuSDQ==", pinCode: "Bodt782hYNRCusKVoxm4Nw==", mobile: "5U8wsmljtwmIsUU9juI9Yw==", dateOfBirth: "D60kyAv6XHMebIyhLZ1KGQ==", gender: "M", creditScore: null },
      { id: "08de8f46-aa27-475a-8aed-955af25bcc6f", name: "RAM SINGH BHANDARI", firstName: "RAM", middleName: "SINGH", lastName: "BHANDARI", pan: "7ZIchhrh7zQU1xSjpR6RWg==", aadhaarNumber: null, address: "", state: "", city: "", pinCode: "", mobile: "5FQXGGwZ6yFnp5YwnZnVbQ==", dateOfBirth: "u9aFC7qdvNaY/wiGhmpQnQ==", gender: "M", creditScore: null },
      { id: "08de8f48-7e49-495e-8838-3a1c25b67e97", name: "ASHOK SAINI", firstName: "ASHOK", middleName: "", lastName: "SAINI", pan: "iJ2tPLSwpMKeMIDLJ6fxIA==", aadhaarNumber: "Lz15O4Tp2hBBAcWonFQurw==", address: "FVb4EbrFWDnDsOWaoZ4ZWz7cHSfKFRm51sq0YUO5FY83Jcrwhm9dElg8DCppTk9kmWsyKrlxbzmEx3zowy3gwA==", state: "z19VcZmQerqZ/vPnKMQBOw==", city: "BBEGMk+3YfsK5alod0llrw==", pinCode: "Ilo/NZhmvrWBk3mV/6dlFA==", mobile: "17sBZ+HpFipZI5Alud/5RQ==", dateOfBirth: "uLfimPS8aVqYphDDG4hZKA==", gender: "M", creditScore: null },
      { id: "08de8f49-7b22-4059-8f5c-a39b3b3d2ca5", name: "OMPRAKASH GULAPPA BISNAL", firstName: "OMPRAKASH GULAPPA", middleName: "", lastName: "BISNAL", pan: "IuqZ5In9yiKTjEe9TP24ZA==", aadhaarNumber: "U/Dkaz0AQTEzYdgXsHZAYA==", address: "Cvfif2k9o/ALEuu5beLLEfRERgb0nD0Daqkw0n3GNVk/vQIGdUr4RWAG5QGopjocpfoqeW3Lm1SI5FU0v6pXYOe3i1sw1eCw8EMRZt8hPUXOvDcAaUJdRTvqkpt5FY6I7RZotM6LUmmURjnb1Hocs0EjAzQBahGefeaYvrAj13g=", state: "wydZscZyTjPAS6WhmEjL+w==", city: "5Rg0RWPjmNPXaAYH3/rK3w==", pinCode: "yUDmzmHxqEWthsZNuGIaXg==", mobile: "vxD5Ahi6OmAybA7qQR5Uxg==", dateOfBirth: "UvRQRNOG2XWoBIUpTz/iLw==", gender: "M", creditScore: null },
      { id: "08de8fab-7dbd-4bb2-8c80-3d2a5767190d", name: "KARAN RAI", firstName: "KARAN", middleName: "", lastName: "RAI", pan: "nH+TAIKCrJ2XFm/gjXt2kw==", aadhaarNumber: "Kn0ctiYNs+aXuSCOTZ4o/w==", address: "2e7b6BwJDQw3hckI8K5/y9bZgin/FEyXwimf8zwcvWi0gLYYL3/jmTFuq1kuGuahEOmlzko9+H/38gNt602K5a98Z6uZMPwIttEkFOFPEjc=", state: "fXBXw7uyF+PFS3l35+3h3g==", city: "xhz1fj4GN4kAFrqfBmFYug==", pinCode: "r4kp+XEFUeXJNaba0jb0yA==", mobile: "9AoQbOtlXb6R8Nyys2hhDQ==", dateOfBirth: "I4oZyJe8wR4LqCS/8mam7w==", gender: "M", creditScore: null },
      { id: "08de8fab-b8e0-4d09-82a4-b166e0053fa0", name: "RAM SINGH BHANDARI", firstName: "RAM", middleName: "SINGH", lastName: "BHANDARI", pan: "7ZIchhrh7zQU1xSjpR6RWg==", aadhaarNumber: null, address: "", state: "", city: "", pinCode: "", mobile: "5FQXGGwZ6yFnp5YwnZnVbQ==", dateOfBirth: "u9aFC7qdvNaY/wiGhmpQnQ==", gender: "M", creditScore: null },
    ],
    commission: 2,
    bankAccountNumber: null,
    bankName: null,
    ifscCode: null,
    dateOfBirth: "UQNA3cT5lD8cnGNalGb+yw==",
    address: "abZs8oS7FMvRrWyc0Eqm46+r+N8fSo9rgy+XIKcb3RY93cEu5zGZ5Hql7lca9g7idXQ0XOfFgPHH9MJYGSlggtoGlTbDKiSPovzV8SDUA+ZP5o02rsc0Y16R6ZvgP0lCFvrSgDdtWRhCwdoY5hB5KVyGRhsoPmVjXPYutTVOt+FEcfUy0xk37FdcSWJcY895wSMfxLEWMLvjbNP1wWhuA11PitxpJg7kf+99w1S0nQZPwufM0XHgm3WlGKjwZJO1AuFFvTXeMCOJKOKdZ11HC+4Kz0CVi72AAsHwsYeP2Gzl5YbxLLrW77lvbkPC/Nkfr9buv4yIJxokO9ig0KENVg==",
    city: "0/uFJ6slmmGhvzYYiBk81g==",
    state: "ACqMBUzXjoW77dzATOXLvA==",
    country: "INDIA",
    zipCode: "ccgK5Hxtvciq/LkeLHblNA==",
    aadhaar: "pY1R+9dga/ja2YTReusQpA==",
    udhyamAadhaar: "pY1R+9dga/ja2YTReusQpA==",
    cpCompanyLogo: "https://credstagestorage.blob.core.windows.net/credorbit-dev/ProfilePictures/DefaultProfilePicture.png?sv=2025-05-05&se=2026-04-15T11%3A29%3A51Z&sr=b&sp=r&sig=%2FpmRKuYu%2FU79PpX7Yj2YfnkOZsXT59KyI84CIDSGIgA%3D",
    userConsents: [
      { userConsentID: 984, consentName: "Email", isConsented: true },
      { userConsentID: 986, consentName: "SMS", isConsented: true },
      { userConsentID: 988, consentName: "WhatsApp", isConsented: true },
      { userConsentID: 990, consentName: "Call ", isConsented: true },
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

    if (email === "client@yopmail.com") {
      return impersonatedClientProfileResponse;
    }
  } catch {
    return channelPartnerProfileResponse;
  }

  return channelPartnerProfileResponse;
};

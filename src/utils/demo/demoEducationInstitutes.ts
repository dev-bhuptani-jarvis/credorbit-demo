import {
  IEducationInstitute,
  IEducationInstituteBranch,
  IEducationInstituteBranchFormData,
  IEducationInstituteDocument,
  IEducationInstituteFormData,
} from "../../interface/educationInstitute";

const STORAGE_KEY = "credorbit.educationInstitutes";

const documentUrlMap = new Map<string, string>();

const createSeedBranch = (
  suffix: string,
  branchName: string,
  city: string,
  state: string,
  paymentBranch: boolean,
): IEducationInstituteBranch => ({
  id: `branch-${suffix}`,
  branchCode: `COBR26${suffix}`,
  branchName,
  contactPerson: "Operations Desk",
  mobileNumber: "9876511111",
  email: `${branchName.toLowerCase().replace(/\s+/g, "")}@credorbit.demo`,
  state,
  city,
  address: `${city} Main Campus Office`,
  panNumber: "ABCDE1234F",
  aadharNumber: "123412341234",
  gstNumber: "24ABCDE1234F1Z5",
  accountHolderName: branchName,
  bankName: "HDFC Bank",
  accountNumber: `10020030040${suffix}`,
  ifscCode: "HDFC0001234",
  isActive: true,
  isPaymentBranch: paymentBranch,
  createdAt: "2026-01-11T10:30:00.000Z",
  updatedAt: "2026-01-11T10:30:00.000Z",
  documents: [],
});

const seedInstitutes: IEducationInstitute[] = [
  {
    id: "edu-001",
    instituteCode: "COEDU2601",
    instituteName: "Ahmedabad School of Finance",
    contactPerson: "Riya Mehta",
    mobileNumber: "9876500001",
    email: "admissions@asf.edu.in",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "Prahlad Nagar, Ahmedabad",
    gstNumber: "24AACCA1234A1Z5",
    panNumber: "AACCA1234A",
    registrationNumber: "REG-ASF-1001",
    isActive: true,
    createdAt: "2026-01-11T10:30:00.000Z",
    updatedAt: "2026-01-11T10:30:00.000Z",
    documents: [],
    totalStudents: 1500,
    branches: [
      createSeedBranch("1001", "Ahmedabad Main Branch", "Ahmedabad", "Gujarat", true),
      createSeedBranch("1002", "Ahmedabad Satellite Branch", "Ahmedabad", "Gujarat", false),
    ],
  },
  {
    id: "edu-002",
    instituteCode: "COEDU2602",
    instituteName: "Vadodara Institute of Analytics",
    contactPerson: "Kunal Shah",
    mobileNumber: "9876500002",
    email: "admin@via.edu.in",
    state: "Gujarat",
    city: "Vadodara",
    address: "Alkapuri, Vadodara",
    gstNumber: "24AACCV5678B1Z6",
    panNumber: "AACCV5678B",
    registrationNumber: "REG-VIA-1002",
    isActive: true,
    createdAt: "2026-01-14T09:15:00.000Z",
    updatedAt: "2026-01-14T09:15:00.000Z",
    documents: [],
    totalStudents: 800,
    branches: [createSeedBranch("1003", "Vadodara Main Branch", "Vadodara", "Gujarat", true)],
  },
  {
    id: "edu-003",
    instituteCode: "COEDU2603",
    instituteName: "Surat Business Academy",
    contactPerson: "Neha Patel",
    mobileNumber: "9876500003",
    email: "registrar@sba.edu.in",
    state: "Gujarat",
    city: "Surat",
    address: "Athwa Lines, Surat",
    gstNumber: "24AACCS1122C1Z7",
    panNumber: "AACCS1122C",
    registrationNumber: "REG-SBA-1003",
    isActive: false,
    createdAt: "2026-01-20T11:00:00.000Z",
    updatedAt: "2026-02-02T12:00:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-004",
    instituteCode: "COEDU2604",
    instituteName: "Mumbai School of Management",
    contactPerson: "Ananya Joshi",
    mobileNumber: "9876500004",
    email: "office@msm.edu.in",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Andheri East, Mumbai",
    gstNumber: "27AACCM4455D1Z8",
    panNumber: "AACCM4455D",
    registrationNumber: "REG-MSM-1004",
    isActive: true,
    createdAt: "2026-02-04T08:00:00.000Z",
    updatedAt: "2026-02-04T08:00:00.000Z",
    documents: [],
    totalStudents: 2200,
    branches: [createSeedBranch("1004", "Mumbai Main Branch", "Mumbai", "Maharashtra", true)],
  },
  {
    id: "edu-005",
    instituteCode: "COEDU2605",
    instituteName: "Pune Tech and Commerce Institute",
    contactPerson: "Aditya Kulkarni",
    mobileNumber: "9876500005",
    email: "contact@ptci.edu.in",
    state: "Maharashtra",
    city: "Pune",
    address: "Baner, Pune",
    gstNumber: "27AACCP8899E1Z9",
    panNumber: "AACCP8899E",
    registrationNumber: "REG-PTCI-1005",
    isActive: true,
    createdAt: "2026-02-12T14:20:00.000Z",
    updatedAt: "2026-02-12T14:20:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-006",
    instituteCode: "COEDU2606",
    instituteName: "Nagpur Education Hub",
    contactPerson: "Sonal Verma",
    mobileNumber: "9876500006",
    email: "info@neh.edu.in",
    state: "Maharashtra",
    city: "Nagpur",
    address: "Dharampeth, Nagpur",
    gstNumber: "27AACCN7788F1Z0",
    panNumber: "AACCN7788F",
    registrationNumber: "REG-NEH-1006",
    isActive: false,
    createdAt: "2026-02-28T16:45:00.000Z",
    updatedAt: "2026-03-10T10:05:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-007",
    instituteCode: "COEDU2607",
    instituteName: "Jaipur Career Institute",
    contactPerson: "Mohit Jain",
    mobileNumber: "9876500007",
    email: "hello@jci.edu.in",
    state: "Rajasthan",
    city: "Jaipur",
    address: "Malviya Nagar, Jaipur",
    gstNumber: "08AACCJ5566G1Z1",
    panNumber: "AACCJ5566G",
    registrationNumber: "REG-JCI-1007",
    isActive: true,
    createdAt: "2026-03-06T10:10:00.000Z",
    updatedAt: "2026-03-06T10:10:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-008",
    instituteCode: "COEDU2608",
    instituteName: "Udaipur Learning Centre",
    contactPerson: "Isha Soni",
    mobileNumber: "9876500008",
    email: "support@ulc.edu.in",
    state: "Rajasthan",
    city: "Udaipur",
    address: "Fatehpura, Udaipur",
    gstNumber: "08AACCU3344H1Z2",
    panNumber: "AACCU3344H",
    registrationNumber: "REG-ULC-1008",
    isActive: true,
    createdAt: "2026-03-15T12:40:00.000Z",
    updatedAt: "2026-03-15T12:40:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-009",
    instituteCode: "COEDU2609",
    instituteName: "Bengaluru Skills Academy",
    contactPerson: "Varun Rao",
    mobileNumber: "9876500009",
    email: "admin@bsa.edu.in",
    state: "Karnataka",
    city: "Bengaluru",
    address: "Indiranagar, Bengaluru",
    gstNumber: "29AACCB2211I1Z3",
    panNumber: "AACCB2211I",
    registrationNumber: "REG-BSA-1009",
    isActive: true,
    createdAt: "2026-03-21T09:05:00.000Z",
    updatedAt: "2026-03-21T09:05:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-010",
    instituteCode: "COEDU2610",
    instituteName: "Mysuru Commerce College",
    contactPerson: "Pooja Nair",
    mobileNumber: "9876500010",
    email: "contact@mcc.edu.in",
    state: "Karnataka",
    city: "Mysuru",
    address: "VV Mohalla, Mysuru",
    gstNumber: "29AACCM9898J1Z4",
    panNumber: "AACCM9898J",
    registrationNumber: "REG-MCC-1010",
    isActive: false,
    createdAt: "2026-04-02T15:35:00.000Z",
    updatedAt: "2026-04-06T08:25:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-011",
    instituteCode: "COEDU2611",
    instituteName: "Hyderabad Global Institute",
    contactPerson: "Rahul Reddy",
    mobileNumber: "9876500011",
    email: "admissions@hgi.edu.in",
    state: "Telangana",
    city: "Hyderabad",
    address: "Gachibowli, Hyderabad",
    gstNumber: "36AACCH6677K1Z5",
    panNumber: "AACCH6677K",
    registrationNumber: "REG-HGI-1011",
    isActive: true,
    createdAt: "2026-04-18T11:55:00.000Z",
    updatedAt: "2026-04-18T11:55:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "edu-012",
    instituteCode: "COEDU2612",
    instituteName: "Warangal FinTech School",
    contactPerson: "Sneha Gupta",
    mobileNumber: "9876500012",
    email: "team@wfs.edu.in",
    state: "Telangana",
    city: "Warangal",
    address: "Hanamkonda, Warangal",
    gstNumber: "36AACCW4433L1Z6",
    panNumber: "AACCW4433L",
    registrationNumber: "REG-WFS-1012",
    isActive: true,
    createdAt: "2026-04-26T13:30:00.000Z",
    updatedAt: "2026-04-26T13:30:00.000Z",
    documents: [],
    totalStudents: 0,
    branches: [],
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const persistInstitutes = (institutes: IEducationInstitute[]): void => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(institutes));
};

const getNextBranchCode = (institutes: IEducationInstitute[]): string => {
  const branchCount = institutes.reduce(
    (count, institute) => count + (institute.branches?.length || 0),
    0,
  );

  return `COBR26${1001 + branchCount}`;
};

export const getEducationInstitutes = (): IEducationInstitute[] => {
  if (!canUseStorage()) return seedInstitutes;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    persistInstitutes(seedInstitutes);
    return seedInstitutes;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationInstitute[];
    return Array.isArray(parsedValue)
      ? parsedValue.map((institute) => ({
        ...institute,
        branches: institute.branches || [],
      }))
      : seedInstitutes;
  } catch {
    persistInstitutes(seedInstitutes);
    return seedInstitutes;
  }
};

export const getEducationInstituteById = (
  instituteId: string,
): IEducationInstitute | undefined =>
  getEducationInstitutes().find((institute) => institute.id === instituteId);

export const createEducationInstitute = (
  instituteData: IEducationInstituteFormData,
): IEducationInstitute => {
  const institutes = getEducationInstitutes();
  const now = new Date().toISOString();
  const instituteNumber = institutes.length + 1001;

  const nextInstitute: IEducationInstitute = {
    id: `edu-${Date.now()}`,
    instituteCode: `COEDU26${instituteNumber}`,
    instituteName: instituteData.instituteName.trim(),
    contactPerson: instituteData.contactPerson.trim(),
    mobileNumber: instituteData.mobileNumber.trim(),
    email: instituteData.email.trim(),
    state: instituteData.state,
    city: instituteData.city.trim(),
    address: instituteData.address.trim(),
    gstNumber: instituteData.gstNumber.trim(),
    panNumber: instituteData.panNumber.trim().toUpperCase(),
    registrationNumber: instituteData.registrationNumber.trim(),
    isActive: instituteData.isActive,
    createdAt: now,
    updatedAt: now,
    documents: [],
    totalStudents: 0,
    branches: [],
  };

  const nextInstitutes = [nextInstitute, ...institutes];
  persistInstitutes(nextInstitutes);

  return nextInstitute;
};

export const updateEducationInstitute = (
  instituteId: string,
  institutePatch: Partial<IEducationInstitute>,
): IEducationInstitute | undefined => {
  const institutes = getEducationInstitutes();
  let updatedInstitute: IEducationInstitute | undefined;

  const nextInstitutes = institutes.map((institute) => {
    if (institute.id !== instituteId) {
      return institute;
    }

    updatedInstitute = {
      ...institute,
      ...institutePatch,
      updatedAt: new Date().toISOString(),
    };

    return updatedInstitute;
  });

  persistInstitutes(nextInstitutes);

  return updatedInstitute;
};

export const toggleEducationInstituteStatus = (
  instituteId: string,
  isActive: boolean,
): IEducationInstitute | undefined =>
  updateEducationInstitute(instituteId, { isActive });

const createDocumentRecord = (file: File, type: string): IEducationInstituteDocument => {
  const nextDocument: IEducationInstituteDocument = {
    id: `edu-doc-${Date.now()}`,
    type,
    fileName: file.name,
    mimeType: file.type || "application/pdf",
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    documentUrlMap.set(nextDocument.id, URL.createObjectURL(file));
  }

  return nextDocument;
};

export const addEducationInstituteDocument = (
  instituteId: string,
  documentType: string,
  file: File,
): IEducationInstituteDocument | undefined => {
  const institute = getEducationInstituteById(instituteId);

  if (!institute) return undefined;

  const nextDocument = createDocumentRecord(file, documentType);

  updateEducationInstitute(instituteId, {
    documents: [nextDocument, ...(institute.documents || [])],
  });

  return nextDocument;
};

export const createEducationInstituteBranch = (
  instituteId: string,
  branchData: IEducationInstituteBranchFormData,
): IEducationInstituteBranch | undefined => {
  const institutes = getEducationInstitutes();
  const institute = institutes.find((item) => item.id === instituteId);

  if (!institute) return undefined;

  const now = new Date().toISOString();
  const nextBranch: IEducationInstituteBranch = {
    id: `branch-${Date.now()}`,
    branchCode: getNextBranchCode(institutes),
    branchName: branchData.branchName.trim(),
    contactPerson: branchData.contactPerson.trim(),
    mobileNumber: branchData.mobileNumber.trim(),
    email: branchData.email.trim(),
    state: branchData.state,
    city: branchData.city.trim(),
    address: branchData.address.trim(),
    panNumber: branchData.panNumber.trim().toUpperCase(),
    aadharNumber: branchData.aadharNumber.trim(),
    gstNumber: branchData.gstNumber.trim().toUpperCase(),
    accountHolderName: branchData.accountHolderName.trim(),
    bankName: branchData.bankName.trim(),
    accountNumber: branchData.accountNumber.trim(),
    ifscCode: branchData.ifscCode.trim().toUpperCase(),
    isActive: branchData.isActive,
    isPaymentBranch: !institute.branches.some((branch) => branch.isPaymentBranch),
    createdAt: now,
    updatedAt: now,
    documents: [],
  };

  updateEducationInstitute(instituteId, {
    branches: [...institute.branches, nextBranch],
  });

  if (nextBranch.isPaymentBranch) {
    setEducationInstitutePaymentBranch(instituteId, nextBranch.id);
  }

  return nextBranch;
};

export const updateEducationInstituteBranch = (
  instituteId: string,
  branchId: string,
  branchPatch: Partial<IEducationInstituteBranch>,
): IEducationInstituteBranch | undefined => {
  const institute = getEducationInstituteById(instituteId);

  if (!institute) return undefined;

  let updatedBranch: IEducationInstituteBranch | undefined;

  const nextBranches = institute.branches.map((branch) => {
    if (branch.id !== branchId) {
      return branch;
    }

    updatedBranch = {
      ...branch,
      ...branchPatch,
      updatedAt: new Date().toISOString(),
    };

    return updatedBranch;
  });

  updateEducationInstitute(instituteId, { branches: nextBranches });

  return updatedBranch;
};

export const deleteEducationInstituteBranch = (
  instituteId: string,
  branchId: string,
): IEducationInstitute | undefined => {
  const institute = getEducationInstituteById(instituteId);

  if (!institute) return undefined;

  const branchToDelete = institute.branches.find((branch) => branch.id === branchId);
  const nextBranches = institute.branches.filter((branch) => branch.id !== branchId);

  const updatedInstitute = updateEducationInstitute(instituteId, {
    branches: nextBranches,
  });

  if (branchToDelete?.isPaymentBranch && nextBranches.length > 0) {
    return setEducationInstitutePaymentBranch(instituteId, nextBranches[0].id);
  }

  return updatedInstitute;
};

export const setEducationInstitutePaymentBranch = (
  instituteId: string,
  branchId: string,
): IEducationInstitute | undefined => {
  const institute = getEducationInstituteById(instituteId);

  if (!institute) return undefined;

  const nextBranches = institute.branches.map((branch) => ({
    ...branch,
    isPaymentBranch: branch.id === branchId,
    updatedAt: branch.id === branchId ? new Date().toISOString() : branch.updatedAt,
  }));

  return updateEducationInstitute(instituteId, { branches: nextBranches });
};

export const toggleEducationInstituteBranchStatus = (
  instituteId: string,
  branchId: string,
  isActive: boolean,
): IEducationInstituteBranch | undefined =>
  updateEducationInstituteBranch(instituteId, branchId, { isActive });

export const addEducationInstituteBranchDocument = (
  instituteId: string,
  branchId: string,
  documentType: string,
  file: File,
): IEducationInstituteDocument | undefined => {
  const institute = getEducationInstituteById(instituteId);
  const branch = institute?.branches.find((item) => item.id === branchId);

  if (!institute || !branch) return undefined;

  const nextDocument = createDocumentRecord(file, documentType);

  updateEducationInstituteBranch(instituteId, branchId, {
    documents: [nextDocument, ...(branch.documents || [])],
  });

  return nextDocument;
};

export const getEducationInstituteDocumentUrl = (
  documentId: string,
): string | undefined => documentUrlMap.get(documentId);

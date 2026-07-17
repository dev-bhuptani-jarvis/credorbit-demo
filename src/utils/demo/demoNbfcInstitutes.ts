import {
  IEducationInstitute,
  IEducationInstituteDocument,
} from "../../interface/educationInstitute";

const STORAGE_KEY = "credorbit.nbfcInstitutes";

interface INbfcFormData {
  instituteName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  state: string;
  city: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  registrationNumber: string;
  isActive: boolean;
}

const documentUrlMap = new Map<string, string>();

const seedNbfcDocuments: IEducationInstituteDocument[] = [
  {
    id: "nbfc-doc-1783578115277",
    type: "Loan Agreement Document",
    fileName: "/assets/images/dummy-registration-document.pdf",
    mimeType: "application/pdf",
    fileSize: 2149384,
    uploadedAt: "2026-07-09T06:21:48.502Z",
  },
  {
    id: "nbfc-doc-1783578115278",
    type: "Loan Documentation",
    fileName: "/assets/images/dummy-gst-registration.pdf",
    mimeType: "application/pdf",
    fileSize: 2159001,
    uploadedAt: "2026-07-09T06:21:55.278Z",
  },
];

const getSeedNbfcDocuments = (): IEducationInstituteDocument[] =>
  seedNbfcDocuments.map((document) => ({ ...document }));

const seedNbfcInstitutes: IEducationInstitute[] = [
  {
    id: "nbfc-001",
    instituteCode: "CONBFC2601",
    instituteName: "Astra Finance Limited",
    category: "NBFC",
    contactPerson: "Mehul Shah",
    mobileNumber: "9876600001",
    email: "operations@astrafinance.in",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "SG Highway, Ahmedabad",
    gstNumber: "24AATCA1234A1Z5",
    panNumber: "AATCA1234A",
    registrationNumber: "NBFC-AFL-1001",
    isActive: true,
    createdAt: "2026-02-03T10:00:00.000Z",
    updatedAt: "2026-02-03T10:00:00.000Z",
    documents: getSeedNbfcDocuments(),
    totalStudents: 0,
    authorizedPersons: [],
    branches: [],
  },
  {
    id: "nbfc-002",
    instituteCode: "CONBFC2602",
    instituteName: "Vertex Capital Finance",
    category: "NBFC",
    contactPerson: "Priya Desai",
    mobileNumber: "9876600002",
    email: "support@vertexcapital.in",
    state: "Maharashtra",
    city: "Mumbai",
    address: "BKC, Mumbai",
    gstNumber: "27AACCV5678B1Z6",
    panNumber: "AACCV5678B",
    registrationNumber: "NBFC-VCF-1002",
    isActive: true,
    createdAt: "2026-02-12T11:20:00.000Z",
    updatedAt: "2026-02-12T11:20:00.000Z",
    documents: [],
    totalStudents: 0,
    authorizedPersons: [],
    branches: [],
  },
  {
    id: "nbfc-003",
    instituteCode: "CONBFC2603",
    instituteName: "EduCred Lending Services",
    category: "NBFC",
    contactPerson: "Rohit Verma",
    mobileNumber: "9876600003",
    email: "admin@educredlending.in",
    state: "Karnataka",
    city: "Bengaluru",
    address: "MG Road, Bengaluru",
    gstNumber: "29AACCE1122C1Z7",
    panNumber: "AACCE1122C",
    registrationNumber: "NBFC-ELS-1003",
    isActive: false,
    createdAt: "2026-03-01T09:45:00.000Z",
    updatedAt: "2026-03-08T12:10:00.000Z",
    documents: [],
    totalStudents: 0,
    authorizedPersons: [],
    branches: [],
  },
  {
    id: "nbfc-004",
    instituteCode: "CONBFC2604",
    instituteName: "Progressive Credit Partners",
    category: "NBFC",
    contactPerson: "Sneha Reddy",
    mobileNumber: "9876600004",
    email: "contact@progressivecredit.in",
    state: "Telangana",
    city: "Hyderabad",
    address: "Madhapur, Hyderabad",
    gstNumber: "36AACCP4455D1Z8",
    panNumber: "AACCP4455D",
    registrationNumber: "NBFC-PCP-1004",
    isActive: true,
    createdAt: "2026-03-18T13:30:00.000Z",
    updatedAt: "2026-03-18T13:30:00.000Z",
    documents: [],
    totalStudents: 0,
    authorizedPersons: [],
    branches: [],
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const normalizeNbfcInstitutes = (institutes: IEducationInstitute[]): IEducationInstitute[] =>
  institutes.map((item) => {
    if (item.id === "nbfc-001" && (!item.documents || item.documents.length === 0)) {
      return {
        ...item,
        documents: getSeedNbfcDocuments(),
        category: item.category || "NBFC",
        authorizedPersons: item.authorizedPersons || [],
        branches: item.branches || [],
      };
    }

    return {
      ...item,
      category: item.category || "NBFC",
      documents: item.documents || [],
      authorizedPersons: item.authorizedPersons || [],
      branches: item.branches || [],
    };
  });

const persistNbfcInstitutes = (institutes: IEducationInstitute[]): void => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(institutes));
};

export const getNbfcInstitutes = (): IEducationInstitute[] => {
  if (!canUseStorage()) return normalizeNbfcInstitutes(seedNbfcInstitutes);

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const normalizedSeedInstitutes = normalizeNbfcInstitutes(seedNbfcInstitutes);
    persistNbfcInstitutes(normalizedSeedInstitutes);
    return normalizedSeedInstitutes;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationInstitute[];
    if (!Array.isArray(parsedValue)) {
      return normalizeNbfcInstitutes(seedNbfcInstitutes);
    }

    const normalizedInstitutes = normalizeNbfcInstitutes(parsedValue);

    if (JSON.stringify(normalizedInstitutes) !== JSON.stringify(parsedValue)) {
      persistNbfcInstitutes(normalizedInstitutes);
    }

    return normalizedInstitutes;
  } catch {
    const normalizedSeedInstitutes = normalizeNbfcInstitutes(seedNbfcInstitutes);
    persistNbfcInstitutes(normalizedSeedInstitutes);
    return normalizedSeedInstitutes;
  }
};

export const getNbfcInstituteById = (
  instituteId: string,
): IEducationInstitute | undefined =>
  getNbfcInstitutes().find((institute) => institute.id === instituteId);

export const createNbfcInstitute = (
  instituteData: INbfcFormData,
): IEducationInstitute => {
  const institutes = getNbfcInstitutes();
  const now = new Date().toISOString();
  const nextNumber = institutes.length + 1001;

  const nextInstitute: IEducationInstitute = {
    id: `nbfc-${Date.now()}`,
    instituteCode: `CONBFC26-${nextNumber}`,
    instituteName: instituteData.instituteName.trim(),
    category: "NBFC",
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
    authorizedPersons: [],
    branches: [],
  };

  persistNbfcInstitutes([nextInstitute, ...institutes]);

  return nextInstitute;
};

export const updateNbfcInstitute = (
  instituteId: string,
  institutePatch: Partial<IEducationInstitute>,
): IEducationInstitute | undefined => {
  const institutes = getNbfcInstitutes();
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

  persistNbfcInstitutes(nextInstitutes);

  return updatedInstitute;
};

export const getNbfcDocumentUrl = (
  document: Pick<IEducationInstituteDocument, "id" | "fileName">,
): string | undefined => {
  const inSessionDocumentUrl = documentUrlMap.get(document.id);

  if (inSessionDocumentUrl) {
    return inSessionDocumentUrl;
  }

  const trimmedFileName = document.fileName.trim();

  if (
    trimmedFileName.startsWith("/") ||
    trimmedFileName.startsWith("http://") ||
    trimmedFileName.startsWith("https://")
  ) {
    return trimmedFileName;
  }

  return undefined;
};

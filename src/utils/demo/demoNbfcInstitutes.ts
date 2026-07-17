import {
  IEducationInstitute,
  IEducationInstituteAuthorizedPerson,
  IEducationInstituteFormData,
  IEducationInstituteDocument,
} from "../../interface/educationInstitute";

const STORAGE_KEY = "credorbit.nbfcInstitutes";

const documentUrlMap = new Map<string, string>();

const nbfcPanPreviewMap: Record<
  string,
  {
    instituteName: string;
    email: string;
    category: string;
    mobileNumber: string;
    gstNumber: string;
  }
> = {
  AATCA1234A: {
    instituteName: "Astra Finance Limited",
    email: "operations@astrafinance.in",
    category: "NBFC",
    mobileNumber: "9876600001",
    gstNumber: "24AATCA1234A1Z5",
  },
  AACCV5678B: {
    instituteName: "Vertex Capital Finance",
    email: "support@vertexcapital.in",
    category: "NBFC",
    mobileNumber: "9876600002",
    gstNumber: "27AACCV5678B1Z6",
  },
};

const authorizedPersonPreviewMap: Record<
  string,
  Omit<IEducationInstituteAuthorizedPerson, "id" | "panNumber">
> = {
  DDDDD4444D: {
    fullName: "Mehul Shah",
    constitution: "Director",
    dateOfBirth: "1987-08-11",
    gender: "Male",
    gstNumber: "24AATCA1234A1Z5",
    mobileNumber: "9876600101",
    email: "mehul.shah@astrafinance.in",
  },
  EEEEE5555E: {
    fullName: "Priya Desai",
    constitution: "Authorized Signatory",
    dateOfBirth: "1991-03-27",
    gender: "Female",
    gstNumber: "27AACCV5678B1Z6",
    mobileNumber: "9876600102",
    email: "priya.desai@vertexcapital.in",
  },
};

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
  instituteData: IEducationInstituteFormData,
): IEducationInstitute => {
  const institutes = getNbfcInstitutes();
  const now = new Date().toISOString();
  const nextNumber = institutes.length + 1001;

  const nextInstitute: IEducationInstitute = {
    id: `nbfc-${Date.now()}`,
    instituteCode: `CONBFC26-${nextNumber}`,
    instituteName: instituteData.instituteName.trim(),
    category: "NBFC",
    contactPerson:
      instituteData.authorizedPersons[0]?.fullName?.trim() ||
      instituteData.contactPerson.trim(),
    mobileNumber: instituteData.mobileNumber.trim(),
    email: instituteData.email.trim(),
    state: instituteData.state,
    city: instituteData.city.trim(),
    address: instituteData.address.trim(),
    gstNumber: instituteData.gstNumber.trim(),
    panNumber: instituteData.institutePanNumber.trim().toUpperCase(),
    registrationNumber: instituteData.registrationNumber.trim(),
    isActive: instituteData.isActive,
    createdAt: now,
    updatedAt: now,
    documents: [],
    totalStudents: 0,
    authorizedPersons: instituteData.authorizedPersons.map((person, index) => ({
      ...person,
      id: person.id || `nbfc-auth-${Date.now()}-${index + 1}`,
      panNumber: person.panNumber.trim().toUpperCase(),
      fullName: person.fullName.trim(),
      constitution: person.constitution.trim(),
      gstNumber: person.gstNumber.trim().toUpperCase(),
      mobileNumber: person.mobileNumber.trim(),
      email: person.email.trim(),
    })),
    branches: [],
  };

  persistNbfcInstitutes([nextInstitute, ...institutes]);

  return nextInstitute;
};

export const getNbfcInstitutePanPreview = (panNumber: string) => {
  const normalizedPanNumber = panNumber.trim().toUpperCase();

  return (
    nbfcPanPreviewMap[normalizedPanNumber] || {
      instituteName: `NBFC ${normalizedPanNumber.slice(0, 5)}`,
      email: `${normalizedPanNumber.toLowerCase()}@nbfc.demo`,
      category: "NBFC",
      mobileNumber: "9876600200",
      gstNumber: `24${normalizedPanNumber}1Z5`,
    }
  );
};

export const getNbfcAuthorizedPersonPanPreview = (panNumber: string) => {
  const normalizedPanNumber = panNumber.trim().toUpperCase();

  return (
    authorizedPersonPreviewMap[normalizedPanNumber] || {
      fullName: `Authorized ${normalizedPanNumber.slice(0, 4)}`,
      constitution: "Authorized Signatory",
      dateOfBirth: "1992-01-01",
      gender: "Male" as const,
      gstNumber: `24${normalizedPanNumber}1Z5`,
      mobileNumber: "9876600999",
      email: `${normalizedPanNumber.toLowerCase()}@nbfc.demo`,
    }
  );
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

const createDocumentRecord = (file: File, type: string): IEducationInstituteDocument => {
  const nextDocument: IEducationInstituteDocument = {
    id: `nbfc-doc-${Date.now()}`,
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

export const addNbfcInstituteDocument = (
  instituteId: string,
  documentType: string,
  file: File,
): IEducationInstituteDocument | undefined => {
  const institute = getNbfcInstituteById(instituteId);

  if (!institute) return undefined;

  const nextDocument = createDocumentRecord(file, documentType);

  updateNbfcInstitute(instituteId, {
    documents: [nextDocument, ...(institute.documents || [])],
  });

  return nextDocument;
};

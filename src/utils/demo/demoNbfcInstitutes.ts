import {
  IEducationInstitute,
  IEducationInstituteFormData,
} from "../../interface/educationInstitute";

const STORAGE_KEY = "credorbit.nbfcInstitutes";

const seedNbfcInstitutes: IEducationInstitute[] = [
  {
    id: "nbfc-001",
    instituteCode: "CONBFC2601",
    instituteName: "Astra Finance Limited",
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
    documents: [],
    totalStudents: 0,
    branches: [],
  },
  {
    id: "nbfc-002",
    instituteCode: "CONBFC2602",
    instituteName: "Vertex Capital Finance",
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
    branches: [],
  },
  {
    id: "nbfc-003",
    instituteCode: "CONBFC2603",
    instituteName: "EduCred Lending Services",
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
    branches: [],
  },
  {
    id: "nbfc-004",
    instituteCode: "CONBFC2604",
    instituteName: "Progressive Credit Partners",
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
    branches: [],
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const persistNbfcInstitutes = (institutes: IEducationInstitute[]): void => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(institutes));
};

export const getNbfcInstitutes = (): IEducationInstitute[] => {
  if (!canUseStorage()) return seedNbfcInstitutes;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    persistNbfcInstitutes(seedNbfcInstitutes);
    return seedNbfcInstitutes;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationInstitute[];

    return Array.isArray(parsedValue)
      ? parsedValue.map((item) => ({
          ...item,
          documents: item.documents || [],
          branches: item.branches || [],
        }))
      : seedNbfcInstitutes;
  } catch {
    persistNbfcInstitutes(seedNbfcInstitutes);
    return seedNbfcInstitutes;
  }
};

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

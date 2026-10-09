import { APIResponseEntity } from "./apiResponse";

export interface IFetchMobilePrefillResponse extends APIResponseEntity {
    data: IFetchMobilePrefillResponseData;
}

export interface IFetchMobilePrefillResponseData {
    isManualEntryRequired: boolean;
    httpResponseCode: number;
    clientRefNum: string;
    requestId: string;
    resultCode: number;
    message: string;
    result: IFetchMobilePrefillResult;
    score: null;
}

export interface IFetchMobilePrefillResult {
    name: string;
    dob: string;
    gender: string;
    pan: string;
    email: string;
    address: IFetchMobilePrefillAddress[];
}

export interface IFetchMobilePrefillAddress {
    firstLineOfAddress: string;
    secondLineOfAddress: string;
    thirdLineOfAddress: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
}

export interface IFetchMobilePrefillBody {
    mobile_no: string;
    instituteId: string;
}

export interface IFetchStudentResponse extends APIResponseEntity {
    data: IFetchStudentResponseData;
}

export interface IFetchStudentResponseData {
    totalCount: number;
    studentList: IStudent[];
}

export interface IStudent {
    id: string;
    fullName: string;
    panNumber: string;
    email: string;
    phoneNumber: string;
    gender: number;
    dob: string;
    aadhaar: string;
    code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface IFetchStudentDetailResponse extends APIResponseEntity {
    data: IStudentDetailResponseData;
}

export interface IStudentDetailResponseData {
    students: IStudentProfile;
    applicants: IApplicantProfile;
    coApplicants: IApplicantProfile[];
    createdAt: string;
    updatedAt: string;
    appliedLoanApplications: IAppliedLoanApplication[];
}

export interface IStudentProfile {
    id: string;
    code: string;
    name: string;
    isActive?: boolean;
    pan: string;
    panDocument: string;
    aadhaarDocument: string;
    dateOfBirth: string;
    gender: string;
    mobileNumber: string | null;
    email: string;
    photo: string;
    address: string;
    creditScore: number;
    lastDateCreditScore: string;
}

export interface IApplicantProfile {
    id: string;
    code: string;
    name: string;
    isActive?: boolean;
    pan: string;
    consentsStatus: boolean;
    panDocument: string;
    aadhaarDocument: string;
    dateOfBirth: string;
    gender: string;
    mobileNumber: string | null;
    email: string;
    photo: string;
    address: string;
    creditScore: number;
    lastDateCreditScore: string;
}

export interface IAppliedLoanApplication {
    id: string;
    courseName: string;
    loanAmount: number;
    loanApplicationCode: string;
    status: ILoanApplicationStatus;
    lastActivityDate: string;
    name: string | null;
    verificationStatus: string;
}

export interface ILoanApplicationStatus {
    label: string;
    color: string;
    statusID: number;
}

export interface IGetStudentLoanDetailResponse extends APIResponseEntity {
    data: IGetStudentLoanDetailResponseData;
}

export interface IGetStudentLoanDetailResponseData {
    loanApplicationID: string;
    isLoanMarketPlaceGenerated: boolean;
    isBankingReportRequired: boolean;
    isCreditReportRequired: boolean;
    isCreditReportFetched: boolean;
    isBankingReportFetched: boolean;
    showRepaymentSection: boolean;
    showForeClosure: boolean;
    showOverdueAmount: boolean;
    queryRaisedComment: string | null;
    studentDetail: IStudentDetail;
    courseDetail: ICourseDetail | null;
    loanDetail: ILoanDetail | null;
    loanPaymentDetails: ILoanPaymentDetails | null;
    loanDocuments: ILoanDocument[] | null;
}

export interface IStudentDetail {
    studentID: string;
    name: string;
    photo: string;
    loanApplicationCode: string;
    creditScore: number | null;
    lastFetchedCreditScore: string | null;
}

export interface ICourseDetail {
    courseId: string;
    courseName: string;
    instituteName: string;
    instituteTradeName: string | null;
    courseAgreedFee: number;
    tenure: number;
}

export interface ILoanDetail {
    nbfcBankName: string;
    currentStatusId: number;
    currentStatus: string;
    processingFee: number | null;
    eNachStatus: boolean;
    sanctionedDate: string | null;
    disbursementDate: string | null;
    lstLoanTimelineJourney: ILoanTimelineJourney[];
}

export interface ILoanTimelineJourney {
    statusId: number;
    statusName: string;
    isCompleted: boolean;
    statusUpdatedDate: string | null;
}

export interface ILoanPaymentDetails {
    loanAmount: number;
    downPayment: number;
    advancePayment: number;
    discountAmount: number;
    totalEMI: number;
    emiAmount: number;
    advanceEMI: number;
    paidEMI: number;
    pendingEMI: number;
    lastEMIPaidDate: string | null;
    emiMaturityDate: string | null;
    lstPaymentSchedule: IPaymentSchedule[] | null;
}

export interface IPaymentSchedule {
    id: string;
    emiDate: string;
    emiAmount: number;
    status: number;
    emiPaidDate: string | null;
    paymentTransactionNumber: string | null;
    paidAmount: number | null;
}

export interface ILoanDocument {
    id: string;
    documentName: string;
    documentType: string;
    filePath: string;
}

export interface IUploadCommonDocumentResponse extends APIResponseEntity {
    data: IUploadCommonDocumentResponseData;
}

export interface IUploadCommonDocumentResponseData {
    link: string;
    path: string;
}
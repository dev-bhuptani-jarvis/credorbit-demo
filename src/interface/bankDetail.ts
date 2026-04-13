import { APIResponseEntity } from "./apiResponse";

export interface IInstitutionListResponse extends APIResponseEntity {
  data: InstitutionList[];
}

export interface InstitutionList {
  institutionID: number;
  bankName: string;
}

export interface IStatementDetails {
  id: string;
  fileName: string;
  isValidPdf: boolean;
  password?: string;
}

export interface IUploadedBankDocumentDetails {
  id: string;
  bankID: number;
  fileName: string;
  filePath: string;
  isValidPdf: boolean;
  password?: string;
  isScannedPdf: boolean;
  hasPasswordIssue: boolean;
  valid?: boolean;
  message?: string | null;
}

export interface IGetBankDetailsResponse extends APIResponseEntity {
  data: IUploadedBankDocumentDetails[];
}

export interface IBankTemplate {
  bankName: string;
  bankID: number;
}

export interface DocumentObject {
  fileName: string;
  id: string;
  password: string;
}

export interface BankDocumentGroup {
  bankID: number;
  UploadedDocumentsList: DocumentObject[];
}

export interface UploadRequestBody {
  UploadedDocumentObjectList: BankDocumentGroup[];
}

export interface IUploadBankDocumentResponse extends APIResponseEntity {
  data: { uploadedFiles: IUploadedDocument[] };
}

export interface IUploadedDocument {
  id: string;
  bankID: number;
  fileName: string;
  filePath: string;
  isValidPdf: boolean;
  isScannedPdf: boolean;
  hasPasswordIssue: boolean;
}

export interface IReUploadedDocumentResponse extends APIResponseEntity {
  data: { reuploadedDocument: IUploadedDocument };
}

export interface IReUploadedDocument {
  id: string;
  bankID: number;
  fileName: string;
  filePath: string;
  isValidPdf: boolean;
  isScannedPdf: boolean;
  hasPasswordIssue: boolean;
}
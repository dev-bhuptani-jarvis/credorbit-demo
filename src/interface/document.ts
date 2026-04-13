import { APIResponseEntity } from "./apiResponse";

export interface IDocumentListResponse extends APIResponseEntity {
  data: IDocumentListData[];
}

export interface IDocumentListData {
  documentName: string;
  isCarryingFiles: boolean;
  isRequired: boolean;
  isExclamation: boolean;
  missingFiles: string[];
  isSecure: boolean | null;
}

export interface IDocumentListDetailResponse extends APIResponseEntity {
  data: IDocumentListDetailData;
}

export interface IDocumentListDetailData {
  documentType: string;
  folderPath: string | null;
  fileModels: IFileModel[];
  missingDocuments: string[];
  subFolders: ISubFolderModel[];
  isFileModels: boolean;
}

export interface ISubFolderModel {
  subFolderName: string;
  files: IFileModel[];
}

export interface IFileModel {
  fileName: string;
  filePath: string;
  uploadDate: string;
  documentType: string;
  url: string | null;
}

export interface IGetSecureUnsecureDocumentListResponse extends APIResponseEntity {
  data: IGetSecureUnsecureDocumentListData[];
}

export interface IGetSecureUnsecureDocumentListData {
  folderName: string;
  folderPath: string;
  subFolders: ISubFolderModel[];
}

export interface IGetSecureUnsecureDocumentListResponse extends APIResponseEntity {
  data: IGetSecureUnsecureDocumentListData[];
}

export interface IGetSecureUnsecureDocumentListData {
  folderName: string;
  folderPath: string;
  subFolders: ISubFolderModel[];
}

export interface IMoveDocumentBody {
  currentPath: string;
  targetPath: string;
}
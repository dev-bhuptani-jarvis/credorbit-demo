import { APIResponseEntity } from "./apiResponse";

export interface IUpdateSupportData {
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
}

export interface IGetSupportData {
  Name: string;
  PhoneNumber: string;
  WhatsappNumber: string;
  EmailID: string;
}

export interface ISupportDataResponse extends APIResponseEntity {
  data: ISupportData[];
}

interface ISupportData {
  id: number;
  name: string;
  value: string;
  updatedDate: string;
}

import { APIResponseEntity } from "./apiResponse";

export interface IGeneratePublicTokenRequest {
  userID: string;
  extraToken: string;
}

export interface IGeneratePublicTokenResponse extends APIResponseEntity {
  data: string;
}

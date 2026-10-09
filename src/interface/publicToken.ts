import { APIResponseEntity } from "./apiResponse";
import { IGetWhiteLabelSettingsByUserIdResponseData } from "./whiteLabel";

export interface IGeneratePublicTokenRequest {
  userID: string;
  parentUserId?: string;
  extraToken: string;
}

export interface IGeneratePublicTokenResponse extends APIResponseEntity {
  data: string;
}

export interface IDomainConfigurationRequest {
  strDomainUrl: string;
}

export interface IDomainConfigurationResponse extends APIResponseEntity {
  data: IDomainConfigurationResponseData;
}

export interface IDomainConfigurationResponseData {
  id: string;
  whiteLabelUserId: string;
  companyName: string;
  displayName: string;
  logoUrl: string;
  faviconUrl: string;
  logoUrlBase64: null;
  faviconUrlBase64: null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: null;
  theme: string;
  customCss: null;
  isLogoUploaded: boolean;
  isDefault: boolean;
  subDomainUrl: string;
  userType: number;
}

export interface IDomainConfigurationWhiteLabelSettings
  extends IGetWhiteLabelSettingsByUserIdResponseData {
  isDefault: boolean;
  subDomainUrl: string;
  userType: number;
}

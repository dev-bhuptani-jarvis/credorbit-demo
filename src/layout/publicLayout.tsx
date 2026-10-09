import { useLocation } from "react-router-dom";
import Login from "../pages/auth/Login";
import { useEffect, useState } from "react";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../utils/constants/enum";
import { generatePublicTokenAPI, getdomainconfiugrationAPI } from "../utils/axios/apiServices";
import { encryptData } from "../utils/functions/encryptDecrypt";
import {
  dynamicSecretKey,
  extraToken,
  toastError,
} from "../utils/functions/shared";
import { startLoading, stopLoading } from "../store/reducer/loaderSlice";
import { useDispatch } from "react-redux";
import { setToken } from "../store/reducer/authSlice";
import { setPublicWhiteLabelTenantId } from "../store/reducer/userSlice";
import {
  IDomainConfigurationRequest, IDomainConfigurationWhiteLabelSettings,
  IGeneratePublicTokenRequest,
  IGeneratePublicTokenResponse
} from "../interface/publicToken";
import {
  applyWhiteLabelBranding,
  getWhiteLabelLogoUrl,
  mapDomainConfigurationToWhiteLabelSettings,
} from "../utils/functions/whiteLabelBranding";
import Loader from "../components/Loader";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { environment } from "../utils/constants/environments";

const PublicLayout = () => {
  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const [domainWhiteLabelSettings, setDomainWhiteLabelSettings] =
    useState<IDomainConfigurationWhiteLabelSettings | null>(null);

  const [isDomainConfigurationLoading, setIsDomainConfigurationLoading] =
    useState<boolean>(true);

  const fetchPublicToken = async (): Promise<void> => {
    const payload: IGeneratePublicTokenRequest = {
      userID: encryptData(dynamicSecretKey()),
      extraToken: encryptData(extraToken()),
    };

    const response: IGeneratePublicTokenResponse = await generatePublicTokenAPI(
      payload,
    );

    if (!response) return;

    if (response && response.statusCode === 200) {
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
        response.data,
      );
      dispatch(setToken(response.data));
    } else {
      toastError(response.message);
    }
  }

  const setDeviceId = () => {
    if (document.cookie.includes("deviceId")) return;

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const expiryDate = oneMonthFromNow.toUTCString();

    document.cookie = `deviceId=${dynamicSecretKey()}; Expires=${expiryDate}; path=/;`;
  };

  const initializePublicLayout = async (): Promise<void> => {
    dispatch(startLoading());

    setDeviceId();

    const payload: IDomainConfigurationRequest = {
      strDomainUrl: environment.DOMAIN_URL,
    };

    const [domainConfigurationResponse] = await Promise.all([
      getdomainconfiugrationAPI(payload),
      fetchPublicToken(),
    ]);

    let mappedWhiteLabelSettings: IDomainConfigurationWhiteLabelSettings | null =
      null;

    if (domainConfigurationResponse?.statusCode === 200) {
      mappedWhiteLabelSettings = mapDomainConfigurationToWhiteLabelSettings(
        domainConfigurationResponse.data,
      );

      setDomainWhiteLabelSettings(mappedWhiteLabelSettings);

      dispatch(
        setPublicWhiteLabelTenantId(mappedWhiteLabelSettings?.id || ""),
      );

      // applyWhiteLabelBranding(mappedWhiteLabelSettings);
    } else if (domainConfigurationResponse) {
      setDomainWhiteLabelSettings(null);

      // dispatch(setPublicWhiteLabelSettings(null));

      // applyWhiteLabelBranding(null);

      toastError(domainConfigurationResponse.message);
    } else {
      setDomainWhiteLabelSettings(null);

      // dispatch(setPublicWhiteLabelSettings(null));

      // applyWhiteLabelBranding(null);
    }

    setIsDomainConfigurationLoading(false);
    dispatch(stopLoading());
  };

  useEffect(() => {
    initializePublicLayout();

    return () => {
      applyWhiteLabelBranding(null);
    };
  }, []);

  if (isDomainConfigurationLoading) {
    return <Loader isLoading={true} />;
  }

  const loginWrapperClassName =
    domainWhiteLabelSettings?.userType === CLIENT_ROLE.SUPER_ADMIN
      ? "loginWrapper"
      : "loginWrapper loginWrapper--primary";

  return (
    <div className={loginWrapperClassName}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 loginHldr">
            <div className="form-section">
              <div className="logoMain">
                <img
                  src={getWhiteLabelLogoUrl(domainWhiteLabelSettings, "public")}
                  alt={domainWhiteLabelSettings?.displayName || "logo"}
                  loading="lazy"
                />
              </div>
              <Login whiteLabelSettings={domainWhiteLabelSettings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;

import { useLocation } from "react-router-dom";
import Login from "../pages/auth/Login";
import RegisterPage from "../pages/auth/RegisterPage";
import { useEffect } from "react";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../utils/constants/enum";
import { generatePublicTokenAPI } from "../utils/axios/apiServices";
import { encryptData } from "../utils/functions/encryptDecrypt";
import {
  dynamicSecretKey,
  extraToken,
  toastError,
} from "../utils/functions/shared";
import { startLoading, stopLoading } from "../store/reducer/loaderSlice";
import { useDispatch } from "react-redux";
import { setToken } from "../store/reducer/authSlice";
import { IGeneratePublicTokenRequest, IGeneratePublicTokenResponse } from "../interface/publicToken";

const PublicLayout = () => {
  const { pathname } = useLocation();


  const dispatch = useDispatch();

  const fetchPublicToken = async (): Promise<void> => {
    try {
      dispatch(startLoading());

      const payload: IGeneratePublicTokenRequest = {
        userID: encryptData(dynamicSecretKey()),
        extraToken: encryptData(extraToken()),
      };

      const response: IGeneratePublicTokenResponse = await generatePublicTokenAPI(
        payload
      );

      if (!response) return;

      if (response && response.statusCode === 200) {
        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
          response.data
        );
        dispatch(setToken(response.data))
      } else {
        toastError(response.message);
      }
    } finally {
      dispatch(stopLoading());
    }
  };


  const setDeviceId = () => {
    if (document.cookie.includes("deviceId")) return;

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const expiryDate = oneMonthFromNow.toUTCString();

    document.cookie = `deviceId=${dynamicSecretKey()}; Expires=${expiryDate}; path=/;`;
  };

  useEffect(() => {
    setDeviceId();
    fetchPublicToken();
  }, []);

  return (
    <div className="loginWrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 loginHldr">
            <div className="form-section">
              <div className="logoMain">
                <img
                  src="/assets/images/logo-black.svg"
                  alt="logo"
                  loading="lazy"
                />
              </div>
              {pathname.includes("register") ? <RegisterPage /> : <Login />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;

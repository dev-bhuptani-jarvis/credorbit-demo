import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { IGeneratePublicTokenRequest } from "../interface/publicToken";
import { decryptVAPTData, encryptData } from "../utils/functions/encryptDecrypt";
import {
  extraToken,
  toastError,
  toastSuccess,
} from "../utils/functions/shared";
import { IVerifyEmailOTPResponse } from "../interface/otpRequest";
import { fetchImpersonateUser } from "../utils/axios/apiServices";
import { setImpersonateUser } from "../store/reducer/impersonateSlice";
import { setUserData } from "../store/reducer/userSlice";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../utils/constants/enum";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Loader from "./Loader";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { dashboardRoute } from "../utils/functions/appRuntime";

interface ImpersonateModalProps {
  impersonateModal: boolean;
  setImpersonateModal: (value: boolean) => void;
  impersonateId: string;
}

const ImpersonateUserModal = ({
  impersonateModal,
  setImpersonateModal,
  impersonateId,
}: ImpersonateModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { userID } = useSelector((state: RootState) => state.user.user);

  const handleImpersonateUser = async (): Promise<void> => {
    setLoading(true);

    const body: IGeneratePublicTokenRequest = {
      userID: impersonateId,
      parentUserId: userID,
      extraToken: encryptData(extraToken()),
    };

    const response: IVerifyEmailOTPResponse = await fetchImpersonateUser(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        emailID: response.data.emailID
          ? decryptVAPTData(response.data.emailID)
          : "",
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
        gstNumber: response.data.gstNumber
          ? decryptVAPTData(response.data.gstNumber)
          : null,
      };

      dispatch(setImpersonateUser(true));

      dispatch(setUserData(decryptedData));

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
        decryptedData.token
      );

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_RETURN_PATH,
        `${location.pathname}${location.search}`,
      );

      toastSuccess(response.message);

      navigate(dashboardRoute(response.data.userType));
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const footerContent = (
    <div className="d-flex justify-content-end gap-2 mt-4">
      <Button
        className="btn btn-black-line w-100 text-center"
        data-bs-dismiss="modal"
        label="Cancel"
        disabled={loading}
        onClick={() => setImpersonateModal(false)}
      />

      <Button
        className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
          } w-100 ms-2 text-center`}
        label={loading ? "Loading..." : "Login"}
        disabled={loading}
        onClick={handleImpersonateUser}
      />
    </div>
  );

  return (
    <Dialog
      header="Login as Institute"
      visible={impersonateModal}
      modal
      onHide={() => {
        setImpersonateModal(false);
      }}
      draggable={false}
      resizable={false}
      className="modalWrapper"
      style={{ width: "500px" }}
      footer={footerContent}
      blockScroll
    >
      <Loader isLoading={loading} />

      <p className="modal-text">
        Do you want to proceed with logging in as this institute ?
      </p>
    </Dialog >
  );
};

export default ImpersonateUserModal;

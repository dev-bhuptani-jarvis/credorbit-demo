import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { IGeneratePublicTokenRequest } from "../interface/publicToken";
import { encryptData } from "../utils/functions/encryptDecrypt";
import {
  extraToken,
  toastError,
  toastSuccess,
} from "../utils/functions/shared";
import { IVerifyEmailOTPResponse } from "../interface/otpRequest";
import { fetchImpersonateStudent } from "../utils/axios/apiServices";
import { setImpersonateUser } from "../store/reducer/impersonateSlice";
import { setUserData } from "../store/reducer/userSlice";
import { setEncryptedSessionStorage } from "../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../utils/constants/enum";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Loader from "./Loader";
import { RootState } from "../store";

interface ImpersonateModalProps {
  impersonateModal: boolean;
  setImpersonateModal: (value: boolean) => void;
  impersonateId: string;
}

const StudentImpersonateUserModal = ({
  impersonateModal,
  setImpersonateModal,
  impersonateId,
}: ImpersonateModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const currentUser = useSelector((state: RootState) => state.user.user);

  const handleImpersonateUser = async (): Promise<void> => {
    setLoading(true);

    const body: IGeneratePublicTokenRequest = {
      userID: impersonateId,
      extraToken: encryptData(extraToken()),
    };

    const response: IVerifyEmailOTPResponse = await fetchImpersonateStudent(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        emailID: response.data.emailID
          ? (response.data.emailID)
          : "",
        mobileNumber: response.data.mobileNumber
          ? (response.data.mobileNumber)
          : "",
        panNumber: response.data.panNumber
          ? (response.data.panNumber)
          : "",
        gstNumber: response.data.gstNumber
          ? (response.data.gstNumber)
          : null,
      };

      dispatch(setImpersonateUser(true));

      dispatch(setUserData(decryptedData));

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
        JSON.stringify(currentUser),
      );

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
        impersonateId,
      );

      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
        decryptedData.token
      );

      toastSuccess(response.message);

      navigate(RoutePathConstant.private.educationStudentLoanApplication, {
        state: {
          preselectedStudentId: impersonateId,
          studentSelfFlow: true,
        },
      });
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
        label={loading ? "Loading..." : "Login as Student"}
        disabled={loading}
        onClick={handleImpersonateUser}
      />
    </div>
  );

  return (
    <Dialog
      header="Login as Student"
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
        Do you want to proceed with logging in as this student?
      </p>
    </Dialog>
  );
};

export default StudentImpersonateUserModal;

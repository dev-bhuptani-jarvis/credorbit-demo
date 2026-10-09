import {
  RouteObject,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
import { privateRoutes } from "./Routes";
import CookieConsent from "react-cookie-consent";
import { useSignalR } from "../hooks/useSignalR";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { IsStringNullEmptyOrUndefined } from "../utils/functions/nullCheck";
import { clearReportMessage } from "../store/reducer/reportMessageSlice";
import { setWrongUser } from "../store/reducer/wrongUserSlice";
import { RoutePathConstant } from "../utils/constants/routePaths";
import DashboardHeader from "../pages/dashboard/DashboardHeader";
import { v4 as uuidv4 } from "uuid";
import { LeadStatusType } from "../utils/constants/enum";

export const PrivateRouteComponent = () => {
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const userData = useSelector((state: RootState) => state.user.user);

  const privateRoutesRender = useRoutes(privateRoutes as RouteObject[]);

  const { title, message } = useSelector(
    (state: RootState) => state.reportMessage,
  );

  const { wrongUser } = useSelector((state: RootState) => state.wrongUser);

  useSignalR(userData.token, userData.userID);

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const handleClose = () => {
    setOpenModal(false);

    dispatch(clearReportMessage());
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button className="btn btn-black-line w-100" onClick={handleClose}>
        Cancel
      </Button>

      <Button className="btn btn-orange w-100" onClick={handleClose}>
        OK
      </Button>
    </div>
  );

  useEffect(() => {
    if (!IsStringNullEmptyOrUndefined(message)) {
      setOpenModal(false);

      setTimeout(() => {
        setOpenModal(true);
      }, 0);
    }
  }, [message]);

  useEffect(() => {
    const shouldRestrictLeadNavigation =
      userData?.isFromLead &&
      userData?.leadStatus !== LeadStatusType.CONVERTED &&
      pathname !== RoutePathConstant.private.applyLoan;

    if (!shouldRestrictLeadNavigation) return;

    navigate(RoutePathConstant.private.applyLoan, {
      replace: true,
      state: userData,
    });

  }, [pathname, userData]);

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="I understand"
        cookieName="mySiteCookieConsent"
        style={{ background: "var(--color-text-heading-soft)" }}
        buttonStyle={{ color: "var(--color-text-banner-button)", fontSize: "13px" }}
        expires={150}
      >
        This website uses cookies to enhance the user experience.
      </CookieConsent>

      {message !== "" && !wrongUser && (
        <Dialog
          header={title}
          visible={openModal}
          modal
          onHide={handleClose}
          className="modalWrapper"
          draggable={false}
          resizable={false}
          footer={footerContent}
          style={{ width: "650px" }}
          blockScroll
        >
          {message}
        </Dialog>
      )}

      {wrongUser && (
        <Dialog
          visible={wrongUser}
          modal
          draggable={false}
          resizable={false}
          className="modalWrapper text-center p-6"
          style={{ width: "600px" }}
          blockScroll
          onHide={() => {
            dispatch(setWrongUser(false));
            dispatch(clearReportMessage());
          }}
        >
          <h2 className="txt-orange text-2xl font-bold">
            Wrong Statements Uploaded
          </h2>

          <p className="mt-4 text-gray-600">{message}</p>

          <div className="d-flex flex justify-content-center gap-2 mt-4">
            <Button
              className="btn btn-orange w-100 text-center"
              onClick={() => {
                dispatch(setWrongUser(false));
                dispatch(clearReportMessage());
              }}
            >
              Ok
            </Button>
          </div>
        </Dialog>
      )}

      {false && <DashboardHeader key={uuidv4()} />}

      {privateRoutesRender}
    </>
  );
};


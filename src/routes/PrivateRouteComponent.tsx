import {
  RouteObject,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
import { privateRoutes } from "./Routes";
import CookieConsent from "react-cookie-consent";
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
import CreditNotAvailable from "../components/CreditNotAvailable";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../utils/constants/enum";
import { CLIENT_ROLE } from "../utils/constants/constant";

export const PrivateRouteComponent = () => {
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [showCreditPopup, setShowCreditPopup] = useState<boolean>(false);

  const userData = useSelector((state: RootState) => state.user.user);

  const privateRoutesRender = useRoutes(privateRoutes as RouteObject[]);

  const { title, message } = useSelector(
    (state: RootState) => state.reportMessage,
  );

  const { wrongUser } = useSelector((state: RootState) => state.wrongUser);

  const navigate = useNavigate();

  const { pathname, state } = useLocation();

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

  const handleClosePopup = () => {
    setShowCreditPopup(false);
    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_CREDIT_POP_UP_CLOSE,
      Date.now().toString(),
    );
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkCredits = () => {
      const creditsLoaded = getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_CREDITS_LOADED,
      );

      if (!creditsLoaded) {
        console.log("Credits not loaded yet → skip popup");
        return;
      }

      const totalCredit = Number(
        getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_CP_TOTAL_CREDIT),
      );

      if (totalCredit === 0) {
        const lastClosed = getDecryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_CREDIT_POP_UP_CLOSE,
        );

        // first time → show instantly
        if (!lastClosed) {
          setShowCreditPopup(true);
        } else {
          const diff = Date.now() - Number(lastClosed);
          if (diff >= 5 * 60 * 1000) {
            setShowCreditPopup(true);
          }
        }

        // start repeat checker every 5 minutes
        if (!interval) {
          interval = setInterval(checkCredits, 5 * 60 * 1000);
        }
      } else {
        // credits available → stop popup completely
        setShowCreditPopup(false);
        removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_CREDIT_POP_UP_CLOSE);

        if (interval) clearInterval(interval);
      }
    };

    // run once when component mounts
    checkCredits();

    // 🔥 listen when dashboard fetches credits
    window.addEventListener("creditsUpdated", checkCredits);

    return () => {
      window.removeEventListener("creditsUpdated", checkCredits);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!IsStringNullEmptyOrUndefined(message)) {
      setOpenModal(false);

      setTimeout(() => {
        setOpenModal(true);
      }, 0);
    }
  }, [message]);

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="I understand"
        cookieName="mySiteCookieConsent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        expires={150}
      >
        This website uses cookies to enhance the user experience.
      </CookieConsent>

      {(userData.userType === CLIENT_ROLE.CHANNEL_PARTNER ||
        userData.isDefaultCpClient) && (
        <CreditNotAvailable
          isShow={showCreditPopup}
          onHide={handleClosePopup}
          forCredit={true}
          message="Please add credits to your wallet so the client can access this feature."
        />
      )}

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
              className="btn btn-black-line w-100 text-center"
              onClick={() => {
                dispatch(setWrongUser(false));
                dispatch(clearReportMessage());
              }}
            >
              Cancel
            </Button>

            <Button
              className="btn btn-orange w-100 text-center"
              onClick={() => {
                // CASE 1 — User already on Bank Details page
                if (pathname === RoutePathConstant.private.bankDetails) {
                  if (state !== "dashboard") {
                    // 🔥 Trigger eligibility flow inside BankDetails
                    navigate(pathname, {
                      replace: true,
                      state: { triggerEligibility: true },
                    });
                  } else {
                    navigate(RoutePathConstant.private.bankingAnalyticsReport);
                  }

                  dispatch(setWrongUser(false));
                  dispatch(clearReportMessage());
                  return;
                }

                // CASE 2 — From any other page → go to Bank Details
                navigate(RoutePathConstant.private.bankDetails, {
                  state: "dashboard",
                });

                dispatch(setWrongUser(false));
                dispatch(clearReportMessage());
              }}
            >
              {pathname === RoutePathConstant.private.bankDetails
                ? "Accept"
                : "Go to Bank Details"}
            </Button>
          </div>
        </Dialog>
      )}

      {false && <DashboardHeader key={uuidv4()} />}

      {privateRoutesRender}
    </>
  );
};

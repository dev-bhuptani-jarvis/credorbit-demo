import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { setUserData } from "../../store/reducer/userSlice";
import { toastSuccess } from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { ILogoutResponse } from "../../interface/logout";
import {
  getUserNotificationListAPI,
  logoutAPI,
} from "../../utils/axios/apiServices";
import { setLogout } from "../../store/reducer/authSlice";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import { validationMessages } from "../../utils/constants/messages";
import { NotificationList } from "../../interface/notifications";
import NotificationModalNew from "../../components/notifcationmodel/notifcation-model-new";

const DashboardHeader = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState<boolean>(false);

  const [showNotificationMenu, setShowNotificationMenu] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [unReadNotificationList, setUnReadNotificationList] = useState<
    NotificationList[]
  >([]);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const userData = useSelector((state: RootState) => state.user.user);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const [notificationList, setNotificationList] = useState<NotificationList[]>(
    [],
  );

  const [unReadNotificationCount, setUnReadNotificationCount] =
    useState<number>(0);

  useEffect(() => {
    getUserNotificationList();
  }, []);

  const handleImpersonateLogout = (): void => {
    const previousUserData = JSON.parse(
      getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      ),
    );

    dispatch(setUserData(previousUserData));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      previousUserData.token,
    );

    removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID);

    navigate(RoutePathConstant.private.channelPartnerDashboard);

    setShowLogoutDialog(false);

    dispatch(setImpersonateUser(false));

    toastSuccess(validationMessages.userLoggedOutSuccessfully);
  };

  const handleStandardLogout = (message: string): void => {
    removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID);
    toastSuccess(message);
    dispatch(setLogout());
  };

  const handleLogout = async () => {
    setLoading(true);

    const response: ILogoutResponse = await logoutAPI();

    if (!response) return;

    if (isImpersonate) {
      handleImpersonateLogout();
    } else {
      handleStandardLogout(response.message);
      navigate(RoutePathConstant.public.login);
    }
    setLoading(false);
  };

  const footerContent = () => (
    <div className="d-flex justify-content-end gap-2 mt-4">
      <Button
        label="Cancel"
        onClick={() => setShowLogoutDialog(false)}
        className="btn btn-black-line w-100 text-center"
      />
      <Button
        onClick={handleLogout}
        label={loading ? "Loading..." : "Logout"}
        disabled={loading}
        className={`btn ${
          loading ? "btn-orange-disabled" : "btn-orange"
        } w-100 ms-2 text-center`}
      />
    </div>
  );

  const getUserNotificationList = async (): Promise<void> => {
    setLoading(true);

    const response = await getUserNotificationListAPI({
      pageNumber: 1,
      pageSize: 10,
    });

    if (!response) return;

    if (response.statusCode === 200) {
      setNotificationList(
        response.data.userNotifications.filter((n) => !n.isRead),
      );

      setUnReadNotificationList(
        response.data.userNotifications.filter((n) => !n.isRead),
      );

      setUnReadNotificationCount(response.data.unReadNotificationCount || 0);
    }

    setLoading(false);
  };

  const updateNotificationLists = (list: NotificationList[]) => {
    setNotificationList(list);
    setUnReadNotificationList(list.filter((n) => !n.isRead));
  };

  return (
    <>
      <Loader isLoading={loading} />

      <header className="header whiteBoxHldr p-30">
        <Link className="menuHldr" id="menuHldr" to="#">
          <i className="bi bi-list" />
        </Link>
        <ul className="rightSide">
          <li>
            <Link
              to="#"
              className="dropdown notiWrapper"
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            >
              <div className="bell-wrapper">
                <i className="icon-notification" />

                {unReadNotificationList.length > 0 && (
                  <span className="bell-badge">
                    {unReadNotificationList.length}
                  </span>
                )}
              </div>

              {showNotificationMenu && (
                <NotificationModalNew
                  showNotificationMenu={showNotificationMenu}
                  notificationList={notificationList}
                  unReadNotificationList={unReadNotificationList}
                  updateNotificationLists={updateNotificationLists}
                  onClose={() => setShowNotificationMenu(false)}
                  unReadNotificationCount={unReadNotificationCount}
                  getUserNotificationList={getUserNotificationList}
                />
              )}
            </Link>
          </li>

          <li>
            <Link to={RoutePathConstant.private.profile}>
              <img
                src={userData.profilePicture}
                alt="user-profile"
                className="userMain"
              />
            </Link>
          </li>

          <li>
            <Link to="#" onClick={() => setShowLogoutDialog(true)}>
              <i className="bi bi-box-arrow-right" />
            </Link>
          </li>
        </ul>
      </header>

      <Dialog
        header="Confirm Logout"
        visible={showLogoutDialog}
        className="modalWrapper responsive-dialog"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        footer={footerContent}
        onHide={() => setShowLogoutDialog(false)}
      >
        <Loader isLoading={loading} />
        <p className="modal-text">Are you sure you want to log out?</p>
      </Dialog>
    </>
  );
};

export default DashboardHeader;

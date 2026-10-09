import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { LoanStatusType, StorageKeyEnum } from "../../utils/constants/enum";
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
import { useCallback, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import { validationMessages } from "../../utils/constants/messages";
import { NotificationList } from "../../interface/notifications";
import NotificationModalNew from "../../components/notifcationmodel/notifcation-model-new";
import { NOTIFICATION_SIGNALR_EVENT } from "../../hooks/useSignalR";
import { CLIENT_ROLE } from "../../utils/constants/constant";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

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

  const { profilePicture, userID, userName, userType, tradeName } = useSelector((state: RootState) => state.user.user);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const isEducationInstituteDashboard: boolean = (userType === CLIENT_ROLE.EDUCATIONAL_INSTITUTE || userType === CLIENT_ROLE.USER_MANAGEMENT);

  const isStudentDashboard: boolean = userType === CLIENT_ROLE.STUDENT;

  const isManagedEducationHeader =
    isEducationInstituteDashboard || isStudentDashboard;

  const [notificationList, setNotificationList] = useState<NotificationList[]>(
    [],
  );

  const [unReadNotificationCount, setUnReadNotificationCount] =
    useState<number>(0);

  const educationDashboardActions = [
    ...(!isImpersonate ? [{
      key: "loan-application",
      label: "Add Application",
      iconClassName: "bi bi-list-ul",
      buttonClassName: "btn btn-orange-line",
      onClick: () =>
        navigate(RoutePathConstant.private.educationStudentLoanApplication),
    }] : []),
    ...(!isImpersonate ? [{
      key: "student",
      label: "Student",
      iconClassName: "bi bi-person-plus",
      buttonClassName: "btn btn-orange-line",
      onClick: () =>
        navigate(RoutePathConstant.private.educationManageStudents, {
          state: {
            openStudentMobileDialog: true,
          },
        }),
    }] : []),
    {
      key: "ongoing-applications",
      label: "Ongoing Applications",
      iconClassName: "bi bi-clock-history",
      buttonClassName: "btn btn-orange",
      onClick: () =>
        navigate(`${RoutePathConstant.private.educationLoanApplications}?status=${LoanStatusType.PENDING}`)
    },
  ];

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

    const impersonateReturnPath =
      getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_RETURN_PATH,
      ) || RoutePathConstant.private.institueDashboard;

    removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_RETURN_PATH);

    navigate(impersonateReturnPath);

    setShowLogoutDialog(false);

    dispatch(setImpersonateUser(false));

    toastSuccess(validationMessages.userLoggedOutSuccessfully);
  };

  const handleStandardLogout = (message: string): void => {
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
        className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
          } w-100 ms-2 text-center`}
      />
    </div>
  );

  const getUserNotificationList = useCallback(async (): Promise<void> => {
    const response = await getUserNotificationListAPI({
      pageNumber: 1,
      pageSize: 10,
    });

    if (!response) return;

    if (response.statusCode === 200) {
      setNotificationList(response.data.userNotifications);

      setUnReadNotificationList(
        response.data.userNotifications.filter((n) => !n.isRead),
      );

      setUnReadNotificationCount(response.data.unReadNotificationCount || 0);
    }
  }, []);

  const updateNotificationLists = (list: NotificationList[]) => {
    setNotificationList(list);
    const unreadNotifications = list.filter((n) => !n.isRead);
    setUnReadNotificationList(unreadNotifications);
    setUnReadNotificationCount(unreadNotifications.length);
  };

  useEffect(() => {
    setNotificationList([]);
    setUnReadNotificationList([]);
    setUnReadNotificationCount(0);
    setShowNotificationMenu(false);
  }, [userID]);

  useEffect(() => {
    if (userID) {
      getUserNotificationList();
    }
  }, [userID, getUserNotificationList]);

  useEffect(() => {
    if (showNotificationMenu) {
      getUserNotificationList();
    }
  }, [showNotificationMenu, getUserNotificationList]);

  useEffect(() => {
    const handleNotificationSignalR = () => {
      getUserNotificationList();
    };

    window.addEventListener(
      NOTIFICATION_SIGNALR_EVENT,
      handleNotificationSignalR,
    );

    return () => {
      window.removeEventListener(
        NOTIFICATION_SIGNALR_EVENT,
        handleNotificationSignalR,
      );
    };
  }, [getUserNotificationList]);

  return (
    <>
      <Loader isLoading={loading} />

      <header
        className={`header whiteBoxHldr p-30 ${isManagedEducationHeader ? "education-dashboard-header" : ""
          } ${isStudentDashboard ? "student-dashboard-header" : ""
          } dashboard-header-shell`}
      >
        <button
          type="button"
          className="menuHldr dashboard-header__menu-toggle"
          id="menuHldr"
          aria-label="Toggle sidebar"
          style={{ border: 0, padding: 0, font: "inherit" }}
        >
          <i className="bi bi-list secondary-icon" />
        </button>

        <div
          className={`titleMainWrapper dashboard-header-shell__content ${isManagedEducationHeader ? "education-dashboard-header__content" : ""
            } ${isStudentDashboard ? "student-dashboard-header__content" : ""
            }`}
        >
          <div className="education-dashboard-header-div dashboard-header-shell__main">
            <div className="dashboard-header-shell__top-row">
              <h2
                className={`fw-bold txt-30 dashboard-header-shell__title ${isManagedEducationHeader ? "education-dashboard-header__title" : ""
                  } ${isStudentDashboard ? "student-dashboard-header__title" : ""
                  }`}
              >
                <span>Welcome,</span> {userType === CLIENT_ROLE.SUPER_ADMIN ? userName.split(" ", 1)[0] : tradeName ? decryptVAPTData(tradeName) : userName.split(" ", 1)[0]}
              </h2>

              <div
                className={`dashboard-header-shell__right-cluster ${isManagedEducationHeader ? "education-dashboard-header__right-cluster" : ""
                  } ${isStudentDashboard ? "student-dashboard-header__right-cluster" : ""
                  }`}
              >
                {(isEducationInstituteDashboard || isStudentDashboard) && (
                  <div
                    className={`BtnRightHldr dashboard-header-shell__actions ${isManagedEducationHeader ? "education-dashboard-header__actions" : ""
                      } ${isStudentDashboard ? "student-dashboard-header__actions" : ""
                      }`}
                  >
                    {isEducationInstituteDashboard && (
                      <>
                        {educationDashboardActions.map((action) => (
                          <div
                            key={action.key}
                            className={`form-group education-dashboard-header__action education-dashboard-header__action--${action.key}`}
                          >
                            <Button
                              className={`${action.buttonClassName} education-dashboard-header__button`}
                              onClick={action.onClick}
                            >
                              <span className="education-dashboard-header__button-content">
                                <i className={action.iconClassName} />
                                <span>{action.label}</span>
                              </span>
                            </Button>
                          </div>
                        ))}
                      </>
                    )}

                    {isStudentDashboard && (
                      <div className="form-group education-dashboard-header__action">
                        <Button
                          className="btn btn-orange student-dashboard-header__button"
                          onClick={() =>
                            navigate(`${RoutePathConstant.private.educationLoanApplications}?status=${LoanStatusType.TOTAL}`)
                          }
                        >
                          Show Ongoing Applications
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <ul
                  className={`rightSide dashboard-header-shell__utility ${isManagedEducationHeader ? "education-dashboard-header__utility" : ""
                    } ${isStudentDashboard ? "student-dashboard-header__utility" : ""
                    }`}
                >
                  <li>
                    <button
                      type="button"
                      className="dropdown notiWrapper"
                      aria-label="Notifications"
                      aria-expanded={showNotificationMenu}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() =>
                        setShowNotificationMenu((isOpen) => !isOpen)
                      }
                    >
                      <div className="bell-wrapper">
                        <i className="icon-notification" style={{ fontSize: "22px" }} />

                        {unReadNotificationList.length > 0 && (
                          <span className="bell-badge">
                            {unReadNotificationList.length}
                          </span>
                        )}
                      </div>
                    </button>

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
                  </li>

                  <li>
                    <Link to={RoutePathConstant.private.profile}>
                      <img
                        src={profilePicture}
                        alt="user-profile"
                        className="userMain"
                      />
                    </Link>
                  </li>

                  <li>
                    <button
                      type="button"
                      className="notiWrapper dashboard-header-shell__logout-button"
                      aria-label="Logout"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <i className="bi bi-box-arrow-right" style={{ fontSize: "22px" }} />
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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

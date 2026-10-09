import { TabMenu } from "primereact/tabmenu";
import { useEffect, useRef, useState } from "react";
import { updateNotificationStatusAPI } from "../utils/axios/apiServices";
import {
  INotificationBody,
  NotificationList,
} from "../interface/notifications";
import moment from "moment";
import { toastError, toastSuccess } from "../utils/functions/shared";
import { APIResponseEntity } from "../interface/apiResponse";
import Loader from "./Loader";

interface INotificationModalProps {
  showNotificationMenu: boolean;
  notificationList: NotificationList[];
  unReadNotificationList: NotificationList[];
  updateNotificationLists: (list: NotificationList[]) => void;
  onClose: () => void;
}

const NotficationModal = ({
  showNotificationMenu,
  notificationList,
  unReadNotificationList,
  updateNotificationLists,
  onClose,
}: INotificationModalProps) => {
  // const [notificationList, setNotificationList] = useState<NotificationList[]>(
  //   [],
  // );

  // const [unReadNotificationList, setUnReadNotificationList] = useState<
  //   NotificationList[]
  // >([]);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // const getUserNotificationList = async (): Promise<void> => {
  //   setLoading(true);
  //   const response = await getUserNotificationListAPI();

  //   if (!response) return;

  //   if (response && response.statusCode === 200) {
  //     setNotificationList(response.data);
  //     setUnReadNotificationList(
  //       response.data.filter(
  //         (notification: NotificationList) => !notification.isRead,
  //       ),
  //     );
  //     setLoading(false);
  //   }
  //   setLoading(false);
  // };

  const items = [
    {
      label: "All",
      icon: "pi pi-home",
      template: (item: any, options: any) => (
        <button className={options.className} onClick={options.onClick}>
          <span className={options.iconClassName} />
          All
          <span className="active-notif-badge">{notificationList.length}</span>
        </button>
      ),
    },
    {
      label: "Unread",
      icon: "pi pi-envelope",
      template: (item: any, options: any) => (
        <button className={options.className} onClick={options.onClick}>
          <span className={options.iconClassName} />
          Unread
          <span className="active-notif-badge">
            {unReadNotificationList.length}
          </span>
        </button>
      ),
    },
  ];

  const updateNotification = async (
    notificationID: number,
    notificationType: number,
  ) => {
    // const prevAll = notificationList;
    const prevUnread = unReadNotificationList;

    try {
      if (notificationType === 2) {
        const updatedList = notificationList.map((n) =>
          n.id === notificationID ? { ...n, isRead: true } : n,
        );

        updateNotificationLists(updatedList);
        updateNotificationLists(updatedList.filter((n) => !n.isRead));
      }

      if (notificationType === 1) {
        const updatedList = notificationList.filter(
          (n) => n.id !== notificationID,
        );

        updateNotificationLists(updatedList);
        updateNotificationLists(updatedList.filter((n) => !n.isRead));
      }

      const body: INotificationBody = {
        notificationID,
        updateType: notificationType,
      };

      const response: APIResponseEntity =
        await updateNotificationStatusAPI(body);

      if (!response) return;

      if (response.statusCode === 200) {
        toastSuccess(response.message);
      } else {
        toastError(response.message);
      }
    } catch (error: any) {
      // updateNotificationLists(prevAll);
      updateNotificationLists(prevUnread);
      toastError(error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (showNotificationMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationMenu, onClose]);

  return (
    <>
      <Loader isLoading={loading} />

      <>
        <div
          ref={modalRef}
          className={`notification-dropdown ${showNotificationMenu ? "show" : ""}`}
          aria-labelledby="dropdownMenuButton1"
        >
          {/* Header */}
          <div className="notification-header">
            <h5>Notifications</h5>
            {loading && <span className="loading-dot"></span>}
          </div>

          {/* Tabs */}
          <TabMenu
            model={items}
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className="notification-tabmenu"
          />

          {/* Notification List */}
          <div className="notification-body">
            <Loader isLoading={loading} />

            {(activeIndex === 0 ? notificationList : unReadNotificationList)
              .length > 0 ? (
              (activeIndex === 0
                ? notificationList
                : unReadNotificationList
              ).map((notification: NotificationList) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!notification.isRead) {
                      updateNotification(notification.id, 2);
                    }
                  }}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.isRead && (
                        <span className="unread-dot"></span>
                      )}
                    </div>

                    <div className="notification-desc">
                      {notification.description}
                    </div>

                    <div className="notification-time">
                      {moment(notification.createdDate).fromNow()}
                    </div>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateNotification(notification.id, 1);
                    }}
                    title="Delete"
                  >
                    <i className="pi pi-times clear-icon-btn" />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="pi pi-bell"></i>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </>
    </>
  );
};

export default NotficationModal;

import { useEffect, useRef } from "react";
import moment from "moment";
import "../notifcationmodel/notification-model.css";
import {
  INotificationBody,
  NotificationList,
} from "../../interface/notifications";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { APIResponseEntity } from "../../interface/apiResponse";
import { updateNotificationStatusAPI } from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";

interface INotificationModalProps {
  showNotificationMenu: boolean;
  notificationList: NotificationList[];
  unReadNotificationList: NotificationList[];
  updateNotificationLists: (list: NotificationList[]) => void;
  onClose: () => void;
  unReadNotificationCount: number;
  getUserNotificationList: () => void;
}

const NotificationModalNew = ({
  showNotificationMenu,
  notificationList,
  unReadNotificationList,
  updateNotificationLists,
  onClose,
  unReadNotificationCount,
  getUserNotificationList,
}: INotificationModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const updateNotification = async (
    notificationID: number,
    type: number,
  ): Promise<void> => {
    let updatedList = [...notificationList];

    if (type === 2) {
      updatedList = notificationList.map((n) =>
        n.id === notificationID ? { ...n, isRead: true } : n,
      );
    }

    if (type === 1) {
      updatedList = notificationList.filter((n) => n.id !== notificationID);
    }

    const body: INotificationBody = {
      notificationID,
      updateType: type,
    };

    const response: APIResponseEntity = await updateNotificationStatusAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      getUserNotificationList();
    } else {
      toastError(response.message);
    }

    updateNotificationLists(updatedList);
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
    <div
      ref={modalRef}
      className={`notification-dropdown ${showNotificationMenu ? "show" : ""}`}
    >
      {/* HEADER */}
      <div className="notification-header">
        <div className="notification-header-top">
          <span>
            You have <strong>{unReadNotificationCount}</strong> new
            notifications
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="notification-body">
        {unReadNotificationList.length > 0 ? (
          unReadNotificationList.slice(0, 2).map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.isRead ? "read" : "unread"
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  updateNotification(notification.id, 2);
                }
              }}
            >
              <div className="notification-icon">
                <i className="pi pi-exclamation-circle"></i>
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>

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
                  e.stopPropagation();
                  updateNotification(notification.id, 1);
                }}
              >
                <i className="pi pi-times"></i>
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

      {/* FOOTER */}
      {!IsNullOrEmptyArray(notificationList) && (
        <div
          className="notification-footer"
          onClick={() => navigate(RoutePathConstant.private.notification)}
        >
          <button
            className="show-all-link"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              navigate(RoutePathConstant.private.notification);
            }}
          >
            Show all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationModalNew;

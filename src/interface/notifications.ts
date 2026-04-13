import { APIResponseEntity } from "./apiResponse";

export interface IGetNotificationResponse extends APIResponseEntity {
  data: {
    userNotifications: NotificationList[],
    totalCount: number,
    unReadNotificationCount: number
  };
}

export interface NotificationList {
  id: number;
  userName: string;
  title: string;
  description: string;
  createdDate: string;
  isRead: boolean;
}

export interface INotificationBody {
  notificationID: number;
  updateType: number;
}
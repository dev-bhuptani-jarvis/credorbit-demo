import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { NotificationList } from "../../interface/notifications";
import {
  getUserNotificationListAPI,
  updateNotificationStatusAPI,
} from "../../utils/axios/apiServices";
import { formatDate, toastSuccess } from "../../utils/functions/shared";
import { Button } from "primereact/button";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import PrimePaginator from "../../components/PrimePaginator";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";

export default function NotificationPage() {
  const [loading, setLoading] = useState<boolean>(false);

  const [notificationList, setNotificationList] = useState<NotificationList[]>(
    [],
  );

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 10,
    searchText: "",
    status: "",
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const getUserNotificationList = async (): Promise<void> => {
    setLoading(true);

    const queryParams: PaginateReqEntity = {
      pageNumber: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    const response = await getUserNotificationListAPI(queryParams);

    if (!response) return;

    if (response.statusCode === 200) {
      setNotificationList(response.data.userNotifications);

      setTotalRecords(response.data.totalCount);
    }

    setLoading(false);
  };

  const markNotificationAsRead = async (
    notificationId: number,
  ): Promise<void> => {
    setLoading(true);

    const response = await updateNotificationStatusAPI({
      notificationID: notificationId,
      updateType: 1,
    });

    if (!response) return;

    if (response.statusCode === 200) {
      setNotificationList((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );

      toastSuccess(response.message);

      getUserNotificationList();
    }

    setLoading(false);
  };

  const markAllAsRead = async () => {
    // const response = await markAllNotificationAsReadAPI();
    // if (!response) return;
    // if (response.statusCode === 200) {
    //   setNotificationList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    //   getUserNotificationList();
    // }
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  useEffect(() => {
    getUserNotificationList();
  }, []);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24">
        <div className="col-12 mb-4">
          <div className="titleMainWrapper">
            <h2 className="txt-24">Notifications</h2>

            <div className="btnGroup">
              {/* <Button
                className="show-all-link"
                onClick={markAllAsRead}
                disabled={notificationList.every((n) => n.isRead)}
              >
                Mark all as read
              </Button> */}
            </div>
          </div>
        </div>

        <div className="notificationListWrapper">
          {notificationList.length === 0 && (
            <div className="emptyNotification">No notifications found</div>
          )}

          {notificationList.map((item: NotificationList) => (
            <div
              key={item.id}
              className={`notificationCard ${!item.isRead ? "unread clickable" : ""}`}
              onClick={() => {
                if (!item.isRead) markNotificationAsRead(item.id);
              }}
            >
              <div className="notificationContent">
                <div className="titleRow">
                  {!item.isRead && <span className="unreadDot" />}
                  <h4 className="notificationTitle">{item.title}</h4>
                </div>

                <p className="notificationDesc">{item.description}</p>

                <span className="notificationDate">
                  {formatDate(item.createdDate)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!IsNullOrEmptyArray(notificationList) && (
          <PrimePaginator
            onPageChange={onPageChange}
            pageNumber={filterReq.pageNumber}
            pageSize={filterReq.pageSize}
            totalRecords={totalRecords}
          />
        )}
      </div>
    </>
  );
}

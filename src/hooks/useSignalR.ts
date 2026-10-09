import { useEffect, useRef, useState } from "react";
import { HubConnection } from "@microsoft/signalr";
import { createNotificationConnection } from "../utils/signalR/signalr";
import { ReportTypeSignalrResponse } from "../interface/signalr";
import {
  fetchCreditAnalyticsDashboard,
  updateWhiteLabelSettings,
} from "../utils/functions/shared";

export const NOTIFICATION_SIGNALR_EVENT = "notificationSignalRReceived";

export const useSignalR = (token: string, userId: string) => {
  const connectionRef = useRef<HubConnection | null>(null);

  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!token || !userId) return;

    const connection = createNotificationConnection(token, userId);
    connectionRef.current = connection;

    connection.on("ReceiveStatus", (data: ReportTypeSignalrResponse) => {
      console.log("🔔 Notification received:", data);

      window.dispatchEvent(
        new CustomEvent(NOTIFICATION_SIGNALR_EVENT, {
          detail: data,
        }),
      );

      if (data?.whiteLabelUserId) {
        updateWhiteLabelSettings(data);
      }

      if (data?.reportType) {
        fetchCreditAnalyticsDashboard(data.reportType, data);
      }
    });

    connection.onclose((error) => {
      console.error("🔴 SignalR disconnected:", error);
      console.log({ error });
      setConnected(false);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ SignalR connected");
        console.log({ connection });
        setConnected(true);
      } catch (err) {
        console.error("❌ SignalR start failed", err);
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, [token, userId]);

  return { connected };
};

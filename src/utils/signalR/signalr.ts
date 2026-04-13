import * as signalR from "@microsoft/signalr";
import { SIGNAL_R_URL } from "../constants/constant";

export const createNotificationConnection = (
    token: string,
    userId: string
) => {
    const SIGNALR_URL = `${SIGNAL_R_URL}notificationHub?userId=${encodeURIComponent(
        userId
    )}`;
    
    return new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URL, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.LongPolling, 
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
};



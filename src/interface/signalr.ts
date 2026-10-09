import { IGetWhiteLabelSettingsByUserIdResponseData } from "./whiteLabel";

export interface ReportTypeSignalrResponse {
    referenceId?: string;
    message: string;
    status: boolean;
    userID?: string | null;
    userId?: string | null;
    reservationId?: string;
    reportType?: number;
    statusCode?: 200 | 400 | 409;
    whiteLabelUserId?: string;
    whiteLabelSettings?: IGetWhiteLabelSettingsByUserIdResponseData;
}

export interface ReportTypeSignalrResponse {
    referenceId: string;
    message: string;
    status: boolean;
    userID: string;
    reservationId: string;
    reportType: number;
    statusCode: 200 | 400 | 409;
}

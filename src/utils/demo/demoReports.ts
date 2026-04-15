import {
  IBankingAnalyticsReportResponse,
  IChannelPartnerClientReportDetailResponse,
  IGSTReportResponse,
  IITRReportResponse,
} from "../../interface/reports";
import {
  IDocumentListDetailResponse,
  IDocumentListResponse,
  IGetSecureUnsecureDocumentListResponse,
} from "../../interface/document";

const DEMO_DELAY_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const nexusCpReportDetailResponse = {
  status: true,
  statusCode: 200,
  message: "Channel partner details fetched successfully!",
  data: {
    clientID: "00000000-0000-0000-0000-000000000000",
    clientName: null,
    clientCode: null,
    mobileNumber: null,
    email: null,
    channelPartner: null,
    panNumber: null,
    clientReports: [
      {
        name: "GST Report",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//GST Report_NEXUS NUTRI SCIENCE LIMITED_20260226_105117.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=OUSMutrT%2F%2BO7jtJtqw%2FQYRUUOg2Ai8B680wKA4EBD1Q%3D",
        reportType: 5,
      },
      {
        name: "ITR Report",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/ItrReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251031_171022.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=QGRISxIBD7EmqTbm0PDveQccYJy4lJitZqYp94e09x4%3D",
        reportType: 4,
      },
      {
        name: "Banking Report",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/BankingReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//Banking Report_NEXUS NUTRI SCIENCE LIMITED_20260320_195556.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=vX8d%2BnaJ8hk7x4yl%2ByKzGrCaVpQR8Fs4v7Al3yCARWY%3D",
        reportType: 3,
      },
      {
        name: "Credit Analytics Report",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CreditBureauReports/08de0598-4bee-48ca-8a7c-005b36583e79/Credit Analytics Report_NEXUS NUTRI SCIENCE LIMITED_20260401_181917.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=y6DKAedh9byjwBDn7ltRRpmPNzNDOOATKKDNTqeY%2Frk%3D",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - DARSHAK ATULKUMAR ACHARYA",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CreditBureauReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners/08de20ef-e9b3-4155-8074-10c512ed81cf/Credit Analytics Report_DARSHAK ATULKUMAR ACHARYA_20251121_100955.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=H2fkxAtKeZXRNrF6fihssn1kwYxqKsuo73tNMA%2BdHV0%3D",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - DARSHAK ATULKUMAR ACHARYA",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CreditBureauReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners/08de8a2d-57e7-41da-8d5e-b31ced62cbaf/Credit Analytics Report_DARSHAK ATULKUMAR ACHARYA_20260326_121444.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=zgHF7zlBkJgrKTr%2BEmthBBdk58VD%2BxSx6UQ5Jztb2Bs%3D",
        reportType: 1,
      },
      {
        name: "Credit Analytics Report of Partner - ASHOK SAINI",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CreditBureauReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners/08de8f48-7e49-495e-8838-3a1c25b67e97/Credit Analytics Report_ASHOK SAINI_20260402_203811.pdf?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=5vt8tIO5jCTOOcJ%2BhT7spxMT1MggaulvxeQx9KMiZ0U%3D",
        reportType: 1,
      },
      {
        name: "CAM Report_HL_08de8bd3-7517-4b14-895d-86d153b58721_03/27/2026 09:18:27_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CAMReports/08de0598-4bee-48ca-8a7c-005b36583e79/CAM_Report_08de0598-4bee-48ca-8a7c-005b36583e79_08de8bd3-7517-4b14-895d-86d153b58721_20260327_144824.xlsx?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=zHfy1XLZprze7DGPLuRjyv4rmXefyW%2BaPySC8Dowh68%3D",
        reportType: 8,
      },
      {
        name: "CAM Report_WC_Secured_08de955e-20ce-444e-888c-8ad06a3b1f1a_04/08/2026 11:01:48_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CAMReports/08de0598-4bee-48ca-8a7c-005b36583e79/CAM_Report_08de0598-4bee-48ca-8a7c-005b36583e79_08de955e-20ce-444e-888c-8ad06a3b1f1a_20260408_163146.xlsx?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=rbPWMNxGUeB2nAo%2FrwfCyywOSUXIr0%2Bag%2BNJdc0AvmY%3D",
        reportType: 8,
      },
      {
        name: "CAM Report_LAP_Residential_08de955a-236c-4f99-8f84-c84f7ae8f09d_04/14/2026 10:15:28_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CAMReports/08de0598-4bee-48ca-8a7c-005b36583e79/CAM_Report_08de0598-4bee-48ca-8a7c-005b36583e79_08de955a-236c-4f99-8f84-c84f7ae8f09d_20260414_154527.xlsx?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=Z4YwZva31LzDSZIt1YV4GYx%2BEAnQOn9Bj2dD6kS%2BB68%3D",
        reportType: 8,
      },
      {
        name: "CAM Report_LAP_Residential_08de9a0f-245d-46d6-8a46-67bacbe62074_04/14/2026 11:10:48_NEXUS NUTRI SCIENCE LIMITED",
        filePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/CAMReports/08de0598-4bee-48ca-8a7c-005b36583e79/CAM_Report_08de0598-4bee-48ca-8a7c-005b36583e79_08de9a0f-245d-46d6-8a46-67bacbe62074_20260414_164044.xlsx?sv=2025-05-05&se=2026-04-14T12%3A30%3A13Z&sr=b&sp=r&sig=%2BUlviIyc3ukn0Vr49jALdSE712Ih6nMrVJUTt69KFcc%3D",
        reportType: 8,
      },
    ],
  },
} as IChannelPartnerClientReportDetailResponse;

export const getDemoCpReportDetailByClientId = async (
  clientID: string,
): Promise<IChannelPartnerClientReportDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (clientID === "08de0598-4bee-48ca-8a7c-005b36583e79") {
    return nexusCpReportDetailResponse;
  }

  return null;
};

const nexusItrDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "ITR details fetched successfully.",
  data: {
    itrReportDate: "2025-10-31T11:40:22.178244",
    itrDetailsList: [
      {
        id: "08de1872-61c7-4d0d-82af-f9557911e2de",
        fileName: "ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251031_171022",
        filePath: null,
        retrievedDate: "2025-10-31T17:10:22.178244",
        pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/ItrReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251031_171022.pdf?sv=2025-05-05&se=2026-04-14T12%3A42%3A46Z&sr=b&sp=r&sig=0%2BAV2wAZY6o85Rv75KvmIB6lZ4XCcjaB9pNthhqerpA%3D",
        excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/ItrReports/08de0598-4bee-48ca-8a7c-005b36583e79/ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251031_171021.xlsx?sv=2025-05-05&se=2026-04-14T12%3A42%3A46Z&sr=b&sp=r&sig=APtvoBi%2FMN7jLhX9Ah3%2BZx9CtYJpitgBbko8%2BR6eIz0%3D",
      },
      {
        id: "08de107b-a2eb-4d52-85e4-d3cea3cbd02b",
        fileName: "ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251021_135701",
        filePath: null,
        retrievedDate: "2025-10-21T13:57:01.145641",
        pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/ItrReports/08de0598-4bee-48ca-8a7c-005b36583e79/ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251021_135701.pdf?sv=2025-05-05&se=2026-04-14T12%3A42%3A46Z&sr=b&sp=r&sig=79sBTHYoxwgJJHmdhoa%2B3fKXIkww8yoxwr7qAmkMaG4%3D",
        excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/ItrReports/08de0598-4bee-48ca-8a7c-005b36583e79/ITR Report_NEXUS NUTRI SCIENCE LIMITED_20251021_135700.xlsx?sv=2025-05-05&se=2026-04-14T12%3A42%3A46Z&sr=b&sp=r&sig=X2EHZhSGL5MjyPdM2Q0m46Z%2BXW1jHR0nB7aGCK1MSK0%3D",
      },
    ],
  },
} as IITRReportResponse;

const nexusGstDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "GST details fetched successfully!",
  data: {
    enableGstReport: true,
    gstNumber: "djtPZLt2l6mxlm5kPD32xw==",
    gstList: [
      { id: 220, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "qM1+glEUF++WdxM3oyACgw==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
      { id: 221, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "LrDZ99I/RC7UGJElYhBrLQ==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
      { id: 222, userId: "08de0598-4bee-48ca-8a7c-005b36583e79", gstNo: "djtPZLt2l6mxlm5kPD32xw==", dateOfGstRegistration: null, tradeName: null, gstAddress: null, cinOrLLP: null, user: null },
    ],
    gstDetailsList: [
      { id: "08de74f7-44ea-4dfe-8b46-658ac0e4abad", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20260226_105117", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//GST Report_NEXUS NUTRI SCIENCE LIMITED_20260226_105117.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=%2Fjq50TY1%2FBB0%2FKHRNTviEyQEiPNt7ShvSpVe%2FOShvnc%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20260126_155142.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=mvoYE3mKvY1naPjLxmPzctBwyYSFky4kc17rrOK6A98%3D", retrievedDate: "2026-02-26T10:51:11.871114", gstFrom: "Apr 2023", gstTo: "Nov 2025", gstNumber: "24ABBFM8327L1Z2" },
      { id: "08de1929-6cb7-4754-88cf-b4200c7e583a", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_150042", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_150042.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=H%2FrEPU%2BtiiBidHBGHBWn%2Fw%2BFU9ufgHGBvnGLxC64MJ8%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_150041.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=%2Fvxk%2F4AIoyvqW2crv0DB2d6utLJrGOgPtL%2Buk3JeHDs%3D", retrievedDate: "2025-11-01T15:00:42.081426", gstFrom: "Apr 2023", gstTo: "Sep 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ" },
      { id: "08de1924-f83f-4159-829e-ec09c65a9836", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_142842", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_142842.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=xKt0BVSr8xlBhRe33a0NlZDXKO1bzKb91Lb%2Bhwr2wkI%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251101_142841.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=BCSsSbFbLwnP8MztMB1earI6CguA6Sncp312qjkAh%2Bc%3D", retrievedDate: "2025-11-01T14:28:42.549947", gstFrom: "Apr 2023", gstTo: "Sep 2025", gstNumber: "08AAGCN4499R1ZD" },
      { id: "08de0bd6-e5a6-428b-82fc-002972127382", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160645", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160645.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=QVODlF2pfurASt1qbTGhl9G6b6icnQH8hKFLePsGvug%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160644.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=QkNb4s7abO0r6PiLtnD88Zfk61De4d%2Bqx%2BF9Bu8PNJI%3D", retrievedDate: "2025-10-15T16:06:45.375995", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
      { id: "08de0bd6-572f-4d44-8b23-dee4ed341271", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160201", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160201.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=HOxdYFF8exe6xwlYmLmm63RF8w4rMsWkOoqOdsE8FmQ%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251015_160159.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=kjsXqFqKjQ1uKct8ncN4TXmUvzwqIRmt8t3philDLGo%3D", retrievedDate: "2025-10-15T16:02:01.599857", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "08AAGCN4499R1ZD, 24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
      { id: "08de05a1-d2a1-4d0b-84b4-48d8313c4cc0", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183220", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183220.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=szc%2FRNvW5xihRf0mbcAemIDsAm9%2FR9NkRx1xVegx1c8%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183215.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=I7opkavrp5oY6ydQstisYuRTmCGoY%2BXWXZLp2vZWgTk%3D", retrievedDate: "2025-08-07T18:32:20.416701", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ" },
      { id: "08de05a1-87ea-4b24-8287-785490863a86", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183014", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183014.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=EyQr%2BkSg8hM6u2d4%2BAfDQ0SOaIi2t2yzi74DJiCL6nA%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_183009.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=mPhT4NpoFPY2Ip%2F5W99gmkz%2B5U6WEZr8fVCrwRRjX7I%3D", retrievedDate: "2025-08-07T18:30:13.942839", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ" },
      { id: "08de05a0-0e87-4346-86ba-d6a449fc50fc", fileName: "GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_181911", pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_181911.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=V1ZgA5dq3Z0oBRtmN631JUYgZE0CEN7is%2Fa4uwgIgAg%3D", excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/GstReports/08de0598-4bee-48ca-8a7c-005b36583e79/GST Report_NEXUS NUTRI SCIENCE LIMITED_20251007_181905.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A00Z&sr=b&sp=r&sig=dIUxlbbAhgXnjpWScqSt1bBdCui5udU2CtqhcLR%2FQnE%3D", retrievedDate: "2025-08-07T18:19:10.943928", gstFrom: "Apr 2023", gstTo: "Aug 2025", gstNumber: "24AAGCN4499R1ZJ, 23AAGCN4499R1ZL" },
    ],
  },
} as unknown as IGSTReportResponse;

const nexusBankingAnalyticsDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "Banking Analytics details fetched successfully.",
  data: {
    bankingReportDate: false,
    bankingAnalyticsDetailsList: [
      {
        id: "08de868c-b1ab-4ef4-837d-36e47fbd1d50",
        fileName: "Banking Report_NEXUS NUTRI SCIENCE LIMITED_20260320_195556",
        filePath: null,
        retrievedDate: "2026-03-20T19:55:56.378287",
        bankName: "Yes Bank",
        accountType: "Current",
        period: "01-08-2022 to 31-08-2022",
        pdfFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/BankingReports/08de0598-4bee-48ca-8a7c-005b36583e79/CoApplicantsAndPartners//Banking Report_NEXUS NUTRI SCIENCE LIMITED_20260320_195556.pdf?sv=2025-05-05&se=2026-04-14T12%3A43%3A16Z&sr=b&sp=r&sig=Z%2F5OACRmDst21PHd4E87JgKf2sEcN2GsvOUd1bPr%2Fig%3D",
        excelFilePath: "https://credstagestorage.blob.core.windows.net/credorbit-dev/Documents/BankingReports/08de0598-4bee-48ca-8a7c-005b36583e79/Banking Report_NEXUS NUTRI SCIENCE LIMITED_20260320_195555.xlsx?sv=2025-05-05&se=2026-04-14T12%3A43%3A16Z&sr=b&sp=r&sig=fQs3fexXiH5zhY7KoNyh7ihZkJ%2BxNwJGteiCL9U12WY%3D",
      },
    ],
  },
} as unknown as IBankingAnalyticsReportResponse;

const nexusDocumentStatusResponse = {
  status: true,
  statusCode: 200,
  message: "Document status fetched successfully",
  data: [
    { documentName: "BankStatements", isCarryingFiles: true, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Loan Documents - Company", isCarryingFiles: true, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "KYC - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "KYC - Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "IT Returns - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "IT Returns - Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "TAR", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "SAR of Company", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Loan Documents - Directors", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "GST Returns", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
    { documentName: "Property Documents", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: true },
    { documentName: "Unrecognized", isCarryingFiles: false, isRequired: false, isExclamation: false, missingFiles: [], isSecure: null },
  ],
} as IDocumentListResponse;

const nexusDocumentDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "",
  data: {
    documentType: "BankStatements",
    folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements",
    fileModels: [],
    missingDocuments: [],
    subFolders: [
      {
        subFolderName: "BankStatements",
        files: [
          { fileName: "Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%25%23criptionIn%28voiceJarvis Credo CP_20260319_112629.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A18Z&sr=b&sp=r&sig=3C5fm2UWLz8JP1m0wkI9oK4%2FpRIeNoOjVAnSkDOv9cE%3D" },
          { fileName: "YES %$( BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %$( BANK STATEMENT AUG-22.pdf", uploadDate: "2026-03-20T14:23:39Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %25%24%28 BANK STATEMENT AUG-22.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A18Z&sr=b&sp=r&sig=hfHXA2HvpYk1obMhAg4w3muvUys2K8Zb2VoDHhVQEyw%3D" },
          { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf", uploadDate: "2026-01-22T06:41:26Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A18Z&sr=b&sp=r&sig=T44b2nNd0LKPE50jGIhYEcLfbuozHGXNM5xpvoDyM%2B0%3D" },
        ],
      },
    ],
    isFileModels: false,
  },
} as IDocumentListDetailResponse;

const nexusSecureUnsecureDocumentListResponse = {
  status: true,
  statusCode: 200,
  message: "Document List Fetched successfully!",
  data: [
    { folderName: "KYC - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/KYC - Directors", subFolders: [{ subFolderName: "PAN Card", files: [] }, { subFolderName: "Aadhar Card", files: [] }, { subFolderName: "Light Bill", files: [] }, { subFolderName: "Tax Bill", files: [] }] },
    { folderName: "KYC - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/KYC - Company", subFolders: [{ subFolderName: "PAN of Company", files: [] }, { subFolderName: "GST Certificate", files: [] }, { subFolderName: "VAT Certificate", files: [] }, { subFolderName: "Udhyam Certificate", files: [] }, { subFolderName: "Certificate of Incorporation", files: [] }, { subFolderName: "Certificate of Import-Export", files: [] }, { subFolderName: "Rent Agreement", files: [] }, { subFolderName: "GPCB Certificate", files: [] }, { subFolderName: "MOA", files: [] }, { subFolderName: "AOA", files: [] }, { subFolderName: "Light Bill of business", files: [] }, { subFolderName: "Tax Bill of business", files: [] }, { subFolderName: "ISO Certificate", files: [] }] },
    { folderName: "IT Returns - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/IT Returns - Directors", subFolders: [{ subFolderName: "ITR Acknowledgement", files: [] }, { subFolderName: "ITR Form", files: [] }, { subFolderName: "Computation of Income", files: [] }, { subFolderName: "Form 26AS", files: [] }] },
    { folderName: "IT Returns - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/IT Returns - Company", subFolders: [{ subFolderName: "ITR Acknowledgement", files: [] }, { subFolderName: "ITR Form", files: [] }, { subFolderName: "Computation of Income", files: [] }, { subFolderName: "Form 26AS", files: [] }] },
    { folderName: "TAR", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/TAR", subFolders: [{ subFolderName: "Form 3CD", files: [] }, { subFolderName: "Financials", files: [] }, { subFolderName: "Acknowledgement Receipt of TAR", files: [] }] },
    { folderName: "SAR of Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/SAR of Company", subFolders: [{ subFolderName: "Auditors Report", files: [] }, { subFolderName: "Financials", files: [] }, { subFolderName: "Director's Report", files: [] }] },
    { folderName: "BankStatements", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements", subFolders: [{ subFolderName: "BankStatements", files: [] }] },
    { folderName: "Loan Documents - Directors", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Loan Documents - Directors", subFolders: [{ subFolderName: "Welcome letter or Sanction letter", files: [] }, { subFolderName: "Statement of Account or SOA", files: [] }] },
    { folderName: "Loan Documents - Company", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Loan Documents - Company", subFolders: [{ subFolderName: "Welcome letter or Sanction letter", files: [] }, { subFolderName: "Statement of Account or SOA", files: [] }] },
    { folderName: "GST Returns", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/GST Returns", subFolders: [{ subFolderName: "GSTR 3B", files: [] }, { subFolderName: "GSTR 1", files: [] }] },
    { folderName: "Property Documents", folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/Property Documents", subFolders: [{ subFolderName: "7 by 12 Utara", files: [] }, { subFolderName: "Form 8A", files: [] }, { subFolderName: "Form 6 Hakka Patra Entries", files: [] }, { subFolderName: "NA Permission Order", files: [] }, { subFolderName: "Gam Namuno 2", files: [] }, { subFolderName: "Layout Plan of the Unit", files: [] }, { subFolderName: "Raja Chiththi or Commencement Certificate", files: [] }, { subFolderName: "Land Purchase Agreement", files: [] }, { subFolderName: "Original Title Report", files: [] }, { subFolderName: "Development Agreement", files: [] }, { subFolderName: "Society Registration Certificate", files: [] }, { subFolderName: "Society No Due Certificate", files: [] }, { subFolderName: "Index - 2", files: [] }, { subFolderName: "Sale deed copy", files: [] }, { subFolderName: "Allotment Letter", files: [] }, { subFolderName: "Possesion Letter", files: [] }, { subFolderName: "Share Certificate", files: [] }, { subFolderName: "Mortgage deed copy", files: [] }, { subFolderName: "Release of mortgage", files: [] }] },
  ],
} as IGetSecureUnsecureDocumentListResponse;

const nexusSubfolderDetailsResponse = {
  status: true,
  statusCode: 200,
  message: "",
  data: {
    documentType: "BankStatements",
    folderPath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/",
    fileModels: [
      { fileName: "Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%#criptionIn(voiceJarvis Credo CP_20260319_112629.pdf", uploadDate: "2026-03-20T14:21:41Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/Subs%25%23criptionIn%28voiceJarvis Credo CP_20260319_112629.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A51Z&sr=b&sp=r&sig=TIkP4aDk0E6XvVVpMKi1IZL5%2BeivRLIPgZbMZp2UOgs%3D" },
      { fileName: "YES %$( BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %$( BANK STATEMENT AUG-22.pdf", uploadDate: "2026-03-20T14:23:39Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES %25%24%28 BANK STATEMENT AUG-22.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A51Z&sr=b&sp=r&sig=P%2FbwD00sJT8eiFCdj5Veu9oCsYn5bjvDrgoRFgBQIPo%3D" },
      { fileName: "YES BANK STATEMENT AUG-22.pdf", filePath: "UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf", uploadDate: "2026-01-22T06:41:26Z", documentType: "PDF", url: "https://credstagestorage.blob.core.windows.net/credorbit-dev/UploadedDocuments/08de0598-4bee-48ca-8a7c-005b36583e79/Recognized/BankStatements/BankStatements/YES BANK STATEMENT AUG-22.pdf?sv=2025-05-05&se=2026-04-14T12%3A44%3A51Z&sr=b&sp=r&sig=wh178sQ7OgDL9Qweqenl4ZMXGfpreIG6Xq1jnG4bWrY%3D" },
    ],
    missingDocuments: null as unknown as string[],
    subFolders: null as unknown as any[],
    isFileModels: true,
  },
} as IDocumentListDetailResponse;

export const getDemoItrDetails = async (): Promise<IITRReportResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusItrDetailsResponse;
};

export const getDemoGstDetails = async (): Promise<IGSTReportResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusGstDetailsResponse;
};

export const getDemoBankingAnalyticsDetails =
  async (): Promise<IBankingAnalyticsReportResponse> => {
    await wait(DEMO_DELAY_MS);
    return nexusBankingAnalyticsDetailsResponse;
  };

export const getDemoDocumentStatus = async (): Promise<IDocumentListResponse> => {
  await wait(DEMO_DELAY_MS);
  return nexusDocumentStatusResponse;
};

export const getDemoDocumentDetails = async (
  folderName: string,
): Promise<IDocumentListDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (folderName === "BankStatements") {
    return nexusDocumentDetailsResponse;
  }

  return null;
};

export const getDemoSecureUnsecureDocumentList =
  async (): Promise<IGetSecureUnsecureDocumentListResponse> => {
    await wait(DEMO_DELAY_MS);
    return nexusSecureUnsecureDocumentListResponse;
  };

export const getDemoSubfolderDetails = async (
  folderName: string,
  subFolderName: string,
): Promise<IDocumentListDetailResponse | null> => {
  await wait(DEMO_DELAY_MS);

  if (folderName === "BankStatements" && subFolderName === "BankStatements") {
    return nexusSubfolderDetailsResponse;
  }

  return null;
};

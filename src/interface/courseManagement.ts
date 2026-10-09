import { APIResponseEntity } from "./apiResponse";

export interface IEducationCourseManagementResponse extends APIResponseEntity {
    data: IEducationCourseManagementResponseData | null;
}

export interface IEducationCourseManagementResponseData {
    totalCount: number;
    courseList: IEducationCourseManagementData[]
}

export interface IEducationCourseManagementData {
    id: string,
    institute: string | null,
    courseName: string,
    courseShortDescription: string,
    courseCode: string,
    courseTenure: number,
    courseFees: number,
    courseType: number,
    isItJobGuaranteed: boolean,
    maxEMIMonths: number,
    emiDurationType: number,
    isDownpaymentRequire: boolean,
    allowToPrepayment: boolean,
    createdDate: string,
    isActive: boolean,
    applicationStatuses: null
}

export interface IEducationCourseManagementFilterReq {
    page: number;
    pageSize: number;
    courseName?: string;
    courseType?: number;
    isItJobGuaranteed?: boolean;
    instituteId?: string;
}

export interface IEducationCourseFormData {
    courseName: string;
    courseTenure: string;
    courseFees: string;
    courseType: number;
    isJobGuaranteed: boolean;
    description: string;
    isActive: boolean;
}

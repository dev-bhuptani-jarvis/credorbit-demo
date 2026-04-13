import { PaginatorPageChangeEvent } from "primereact/paginator";

export interface PaginateReqEntity {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
  status?: string;
}

export interface PaginateRespEntity {
  data: any[] | [];
  totalCount: number;
}

export interface PrimePaginatorPropsEntity {
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
  onPageChange: (values: PaginatorPageChangeEvent) => void;
}

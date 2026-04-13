import {
  Paginator,
  PaginatorCurrentPageReportOptions,
  PaginatorTemplateOptions,
} from "primereact/paginator";
import { PrimePaginatorPropsEntity } from "../interface/pagination";
import { Dropdown } from "primereact/dropdown";
import { rowsPerPageOptions } from "../utils/constants/constant";

const PrimePaginator = ({
  pageNumber,
  totalRecords,
  onPageChange,
  pageSize,
}: PrimePaginatorPropsEntity) => {
  const template: PaginatorTemplateOptions = {
    layout:
      "RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport",
    CurrentPageReport: (options: PaginatorCurrentPageReportOptions) => {
      return (
        <span
          style={{
            color: "var(--text-color)",
            userSelect: "none",
            width: "120px",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {options.first} - {options.last} of {options.totalRecords}
        </span>
      );
    },
    RowsPerPageDropdown: (options) => {
      return (
        <div className="form-group">
          <Dropdown
            value={options.value}
            options={rowsPerPageOptions}
            onChange={options.onChange}
          />
        </div>
      );
    },
  };

  return (
    <Paginator
      first={pageNumber * pageSize}
      rows={pageSize}
      totalRecords={totalRecords}
      template={template}
      onPageChange={onPageChange}
    />
  );
};

export default PrimePaginator;

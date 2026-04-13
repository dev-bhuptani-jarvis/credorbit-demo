import { InputText } from "primereact/inputtext";
import { ProfileTextFieldProps } from "./ProfileTextField";
import { formatDate } from "../../utils/functions/shared";

const DateTextField = ({
  label,
  name,
  value,
  placeholder,
}: ProfileTextFieldProps) => {
  return (
    <div className="col-lg-4 col-md-6 col-sm-12 col-12">
      <div className="form-group mb-4">
        <label className="form-label small" htmlFor={name}>
          {label}
        </label>
        <div className="position-relative">
          <InputText
            className="form-control"
            placeholder={placeholder}
            name={name}
            value={value ? formatDate(value, "DD-MM-YYYY") : ""}
            disabled
            // onPaste={(e) => e.preventDefault()}
            // onCopy={(e) => e.preventDefault()}
            // onCut={(e) => e.preventDefault()}
          />
          <i className="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-3" />
        </div>
      </div>
    </div>
  );
};

export default DateTextField;

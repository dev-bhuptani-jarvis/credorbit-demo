import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

export interface ProfileTextFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  isEditable?: boolean;
  onChange?: (name: string, value: Date | null) => void;
  disabled?: boolean;
  tooltip?: boolean;
}

export const ProfileTextField = ({
  label,
  name,
  value,
  placeholder,
  tooltip,
}: ProfileTextFieldProps) => (
  <div className="col-lg-4 col-md-6 col-sm-12 col-12">
    <div className="form-group mb-4">
      <div className="d-flex flex-row align-items-center">
        <label className="form-label" htmlFor={name}>
          {label}
        </label>
        {tooltip && (
          <Button
            className="trash-icon p-0 ms-2 mb-1"
            tooltip="Auto-filled from GST if applicable"
          >
            <img
              src="/assets/images/info-circle.svg"
              alt="info"
              loading="lazy"
            />
          </Button>
        )}
      </div>
      <InputText
        className="form-control"
        placeholder={placeholder}
        name={name}
        value={value}
        disabled
        // onPaste={(e) => e.preventDefault()}
        // onCopy={(e) => e.preventDefault()}
        // onCut={(e) => e.preventDefault()}
      />
    </div>
  </div>
);

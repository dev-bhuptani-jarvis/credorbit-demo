import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import {
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "primereact/button";
import {
  IsFormValid,
  restrictInputByPattern,
} from "../../utils/functions/shared";
import { validationMessages } from "../../utils/constants/messages";

interface IUserAccountDelete {
  mobileNumber: string;
  isConfirmDelete: boolean;
}

interface IUserAccountDeleteValidation {
  mobileNumber: string;
  isConfirmDelete: string;
}

const DeleteAccount = () => {
  const [formValues, setFormValues] = useState<IUserAccountDelete>({
    mobileNumber: "",
    isConfirmDelete: false,
  });

  const [formErrors, setFormErrors] = useState<IUserAccountDeleteValidation>({
    mobileNumber: validationMessages.mobileNumberRequired,
    isConfirmDelete: validationMessages.confirmDeleteRequired,
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  const handleChange = (fieldName: string, value: string | boolean): void => {
    const errors = { ...formErrors };

    if (fieldName === "mobileNumber") {
      const val = value as string;
      const isValid: boolean = INDIAN_MOBILE_NUMBER_PATTERN.test(val);

      errors.mobileNumber = !val
        ? validationMessages.mobileNumberRequired
        : !isValid
        ? validationMessages.mobileNumberInvalid
        : "";
    }

    if (fieldName === "isConfirmDelete") {
      const val = value as boolean;
      errors.isConfirmDelete = !val
        ? validationMessages.confirmDeleteRequired
        : "";
    }

    setFormErrors(errors);
    setFormValues({ ...formValues, [fieldName]: value } as IUserAccountDelete);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const errors: IUserAccountDeleteValidation = {
      mobileNumber: !formValues.mobileNumber
        ? validationMessages.mobileNumberRequired
        : !INDIAN_MOBILE_NUMBER_PATTERN.test(formValues.mobileNumber)
        ? validationMessages.mobileNumberInvalid
        : "",
      isConfirmDelete: !formValues.isConfirmDelete
        ? validationMessages.confirmDeleteRequired
        : "",
    };

    setFormErrors(errors);

    const isValid: boolean = IsFormValid(errors);

    if (!isValid) {
      return;
    }

    setFormValues({
      mobileNumber: "",
      isConfirmDelete: false,
    });

    setFormErrors({
      mobileNumber: validationMessages.mobileNumberRequired,
      isConfirmDelete: validationMessages.confirmDeleteRequired,
    });

    setIsFormSubmitted(false);

    setIsDeleted(true);
  };

  useEffect(() => {
    document.title =
      "Delete Your Credorbit Account | Permanent Account Deletion";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Securely delete your Credorbit account. This action is permanent and will remove all your data within 7 working days. Confirm before proceeding."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Securely delete your Credorbit account. This action is permanent and will remove all your data within 7 working days. Confirm before proceeding.";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <>
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="card shadow-lg p-4"
          style={{ maxWidth: "650px", borderRadius: "12px" }}
        >
          <div className="card-body">
            <h1 className="txt-24 mb-3">Delete Your Account</h1>

            <div className="alert alert-danger" role="alert">
              <strong>Warning:</strong> This action is permanent and cannot be
              undone.
            </div>

            <form autoComplete="off" onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="mobileNumber" className="form-label">
                  Mobile Number<sup>*</sup>
                </label>

                <InputText
                  aria-label="Mobile Number"
                  placeholder="Enter mobile number"
                  className="form-control"
                  maxLength={10}
                  name="mobileNumber"
                  id="mobileNumber"
                  onKeyPress={(e) =>
                    restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                  }
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                  value={formValues.mobileNumber}
                  onChange={(e) =>
                    handleChange(e.target.name, e.target.value.trim())
                  }
                />
                {isFormSubmitted && (
                  <span className="error">{formErrors.mobileNumber}</span>
                )}
              </div>

              <div className="form-group mb-4">
                <div className="form-check">
                  <Checkbox
                    id="confirmDelete"
                    checked={formValues.isConfirmDelete}
                    onChange={(e) =>
                      handleChange("isConfirmDelete", e.checked ?? false)
                    }
                  />

                  <label
                    className="form-check-label mt-1"
                    htmlFor="confirmDelete"
                  >
                    I understand that deleting my account is permanent.
                  </label>
                </div>
                {isFormSubmitted && (
                  <span className="error">{formErrors.isConfirmDelete}</span>
                )}
              </div>

              <Button
                type="submit"
                className="btn btn-orange w-100 text-center"
                label="Delete My Account"
              />
            </form>

            {isDeleted && (
              <p className="form-check-label mt-4 mb-0">
                Thank you for being part of <strong>Credorbit</strong>. <br />{" "}
                Your account will be deleted and all your data will be removed
                in <strong>7 working days</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;

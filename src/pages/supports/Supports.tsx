import { FormEvent, useEffect, useState } from "react";
import {
  getSupportDataAPI,
  updateSupportDataAPI,
} from "../../utils/axios/apiServices";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { CLIENT_ROLE, formatMobileNumber } from "../../utils/constants/constant";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import {
  formatDate,
  IsFormValid,
  restrictInputByPattern,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  IGetSupportData,
  ISupportDataResponse,
} from "../../interface/supportData";
import { APIResponseEntity } from "../../interface/apiResponse";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import TableTitle from "../../components/TableTitle";

const Supports = () => {
  const [formValues, setFormValues] = useState<IGetSupportData>({
    Name: "",
    PhoneNumber: "",
    WhatsappNumber: "",
    EmailID: "",
  });

  const [formErrors, setFormErrors] = useState<IGetSupportData>({
    Name: "",
    PhoneNumber: "",
    WhatsappNumber: "",
    EmailID: "",
  });

  const [updatedDate, setUpdatedDate] = useState<string>("");

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const { userType } = useSelector((state: RootState) => state.user.user);

  const { create } = usePermission("Support", ["create"])();

  const handleSaveContent = async (
    e: FormEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsFormSubmitted(true);

    const isValid: boolean = IsFormValid(formErrors);

    if (isValid) {
      setIsFormSubmitted(false);
      setIsEditable(false);

      const body = {
        name: formValues.Name,
        email: formValues.EmailID,
        phoneNumber: formValues.PhoneNumber,
        whatsappNumber: formValues.WhatsappNumber,
      };

      const response: APIResponseEntity = await updateSupportDataAPI(body);

      if (!response) return;

      if (response && response.statusCode === 200) {
        toastSuccess(response.message);
        fetchSupportContract();
      } else {
        toastError(response.message);
      }
    }
  };

  const fetchSupportContract = async (): Promise<void> => {
    setLoading(true);

    const response: ISupportDataResponse = await getSupportDataAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const fetchedData = response.data.reduce(
        (acc, item) => ({ ...acc, [item.name]: item.value }),
        {} as IGetSupportData
      );
      setUpdatedDate(response.data[0].updatedDate);
      setFormValues(fetchedData);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleChange = (fieldName: string, value: string): void => {
    const errors = { ...formErrors };

    switch (fieldName) {
      case "Name": {
        errors[fieldName] = IsStringNullEmptyOrUndefined(value)
          ? "Please Enter Name"
          : "";
        break;
      }

      case "EmailID": {
        const isEmailValid: boolean = EMAIL_PATTERN.test(value);

        errors[fieldName] = IsStringNullEmptyOrUndefined(value)
          ? "Please Enter Email Address"
          : !isEmailValid
          ? "Please Enter a Valid Email Address"
          : "";
        break;
      }

      case "PhoneNumber":
      case "WhatsappNumber":
        const isPhoneValid: boolean = INDIAN_MOBILE_NUMBER_PATTERN.test(value);
        errors[fieldName] = IsStringNullEmptyOrUndefined(value)
          ? `Please Enter ${
              fieldName === "PhoneNumber" ? "Mobile" : "WhatsApp"
            } Number`
          : !isPhoneValid
          ? `Enter a Valid 10-digit ${
              fieldName === "PhoneNumber" ? "Mobile" : "WhatsApp"
            } Number`
          : value.length !== 10
          ? `${
              fieldName === "PhoneNumber" ? "Mobile" : "WhatsApp"
            } Number must be exactly 10 digits`
          : "";
        break;
      default:
        break;
    }

    setFormErrors(errors);
    setFormValues({ ...formValues, [fieldName]: value });
  };

  useEffect(() => {
    fetchSupportContract();
  }, []);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <div className="d-flex flex-column">
              <TableTitle title="Support" />
              {!isEditable && (
                <p className="txt-14">
                  Last Updated: {formatDate(updatedDate)}
                </p>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-12 mt-4 mb-4">
              <div
                className={`col-12 ${
                  !isEditable && "col-lg-4 col-md-4 col-sm-4"
                }`}
              >
                <div className="borderBoxHldr p-24">
                  <div className="row">
                    <div className="col-12">
                      {!isEditable && (
                        <h2 className="txt-24 mb-3 d-flex">
                          {formValues.Name}
                          {userType === CLIENT_ROLE.SUPER_ADMIN && create && (
                            <button
                              className="ms-auto trash-icon"
                              onClick={() => setIsEditable(true)}
                            >
                              <i className="icon-edit" />
                            </button>
                          )}
                        </h2>
                      )}
                      {isEditable && (
                        <>
                          <div className="form-group col-12 col-lg-4 col-md-6 mb-4">
                            <label className="form-label small" htmlFor="Name">
                              Name<sup>*</sup>
                            </label>
                            <InputText
                              id="Name"
                              name="Name"
                              className="form-control"
                              value={formValues.Name}
                              onChange={(e) => {
                                let value = e.target.value;

                                value = value.replace(/[^a-zA-Z\s]/g, "");

                                value = value.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                );

                                handleChange(e.target.name, value.trimStart());
                              }}
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                            {isFormSubmitted && (
                              <span className="error">{formErrors.Name}</span>
                            )}
                          </div>
                          <div className="d-flex flex-column flex-md-row gap-4">
                            <div className="form-group w-100">
                              <label
                                className="form-label small"
                                htmlFor="PhoneNumber"
                              >
                                Mobile Number<sup>*</sup>
                              </label>
                              <InputText
                                id="PhoneNumber"
                                name="PhoneNumber"
                                maxLength={10}
                                className="form-control"
                                value={formValues.PhoneNumber}
                                onChange={(e) =>
                                  handleChange(
                                    e.target.name,
                                    e.target.value.trimStart()
                                  )
                                }
                                onKeyPress={(e) =>
                                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                }
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                              {isFormSubmitted && (
                                <span className="error">
                                  {formErrors.PhoneNumber}
                                </span>
                              )}
                            </div>
                            <div className="form-group w-100">
                              <label
                                className="form-label small"
                                htmlFor="WhatsappNumber"
                              >
                                WhatsApp Number<sup>*</sup>
                              </label>
                              <InputText
                                id="WhatsappNumber"
                                name="WhatsappNumber"
                                maxLength={10}
                                className="form-control"
                                value={formValues.WhatsappNumber}
                                onChange={(e) =>
                                  handleChange(
                                    e.target.name,
                                    e.target.value.trimStart()
                                  )
                                }
                                onKeyPress={(e) =>
                                  restrictInputByPattern(e, NUMBER_ONLY_PATTERN)
                                }
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                              {isFormSubmitted && (
                                <span className="error">
                                  {formErrors.WhatsappNumber}
                                </span>
                              )}
                            </div>
                            <div className="form-group w-100">
                              <label
                                className="form-label small"
                                htmlFor="EmailID"
                              >
                                Email<sup>*</sup>
                              </label>
                              <InputText
                                id="EmailID"
                                name="EmailID"
                                className="form-control"
                                value={formValues.EmailID}
                                onChange={(e) =>
                                  handleChange(
                                    e.target.name,
                                    e.target.value.trimStart()
                                  )
                                }
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                              {isFormSubmitted && (
                                <span className="error">
                                  {formErrors.EmailID}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {!isEditable && (
                        <ul className="contactMain text-break">
                          <li>
                            <i className="bi bi-telephone-fill" />
                            {formValues.PhoneNumber ? formatMobileNumber(formValues.PhoneNumber) : ""}
                          </li>
                          <li>
                            <i className="bi bi-whatsapp" />
                            {formValues.WhatsappNumber ? formatMobileNumber(formValues.WhatsappNumber) : ""}
                          </li>
                          <li>
                            <i className="bi bi-envelope-fill" />
                            {formValues.EmailID}
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditable && (
            <div className="col-lg-3 col-md-6 col-sm-6 col-12 mb-4">
              <Button
                className="btn btn-black-line"
                onClick={() => {
                  setIsEditable(false);
                  fetchSupportContract();
                }}
                label="Cancel"
              />

              <Button
                className="btn btn-orange ms-2"
                onClick={(e) => handleSaveContent(e)}
                label="Save"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Supports;

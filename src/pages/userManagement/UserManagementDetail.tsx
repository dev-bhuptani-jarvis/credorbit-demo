import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { Button } from "primereact/button";
import BackButton from "../../components/BackButton";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import {
  IsFormValid,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import {
  getAddEditRoleUserDataAPI,
  submitAddEditRoleUserDataAPI,
} from "../../utils/axios/apiServices";
import { RouteParams } from "../../utils/constants/constant";
import {
  IGetAddEditRoleUserResponse,
  IRoleOption,
  ISaveUserDetailData,
  IUserDetailData,
  IUserDetailValidationData,
} from "../../interface/userManagement";
import { InputText } from "primereact/inputtext";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  NUMBER_ONLY_PATTERN,
} from "../../utils/constants/pattern";
import { InputSwitch } from "primereact/inputswitch";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { Dropdown } from "primereact/dropdown";
import TableTitle from "../../components/TableTitle";
import { validationMessages } from "../../utils/constants/messages";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";

const UserManagementDetail = () => {
  const [userData, setUserData] = useState<IUserDetailData>();

  const [roleOptions, setRoleOptions] = useState<IRoleOption[]>([]);

  const [formErrors, setFormErrors] = useState<IUserDetailValidationData>({
    firstName: validationMessages.firstNameRequired,
    lastName: validationMessages.lastNameRequired,
    rolesList: validationMessages.selectRole,
    designation: validationMessages.designationRequired,
    email: validationMessages.selectEmail,
    mobileNumber: validationMessages.mobileNumberRequired,
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState<string>("");

  const location = useLocation();

  const navigate = useNavigate();

  const { id } = useParams<RouteParams>();

  const currentState = location.pathname.split("/")[2];

  const currentTopic = (state: string): string => {
    return state === "create"
      ? "Create"
      : state === "view"
        ? "View"
        : state === "edit"
          ? "Edit"
          : "";
  };

  const fetchUserDetailApi = async (): Promise<void> => {
    setLoading(true);

    const params = {
      userID: currentState === "create" ? null : id ?? null,
    };

    const response: IGetAddEditRoleUserResponse =
      await getAddEditRoleUserDataAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const formatedUserData: IUserDetailData = {
        firstName: response.data.fullName.split(" ")[0] || "",
        lastName: response.data.fullName.split(" ")[1] || "",
        email: response.data.email,
        mobileNumber: response.data.mobileNumber,
        designation: response.data.designation,
        rolesList: response.data.rolesList.map((role) => role.roleName) || [],
        selectedRoleName: response.data.selectedRoleName,
        status: response.data.isActive,
      };

      setSelectedOption(response.data.selectedRoleName);

      setUserData(formatedUserData);

      const roleList = response.data.rolesList.map((role) => {
        return {
          value: role.id,
          label: role.roleName,
        };
      });

      setRoleOptions(roleList);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const validateFormFields = (): void => {
    if (!userData) return;

    const errors = { ...formErrors };

    errors.firstName = IsStringNullEmptyOrUndefined(userData.firstName ?? "")
      ? validationMessages.firstNameRequired
      : "";

    errors.lastName = IsStringNullEmptyOrUndefined(userData.lastName ?? "")
      ? validationMessages.lastNameRequired
      : "";

    const isEmailValid = EMAIL_PATTERN.test(
      userData.email.toLowerCase().trim()
    );

    errors.email = IsStringNullEmptyOrUndefined(userData.email)
      ? validationMessages.emailRequired
      : !isEmailValid
        ? validationMessages.emailInvalid
        : "";

    const isMobileValid =
      INDIAN_MOBILE_NUMBER_PATTERN.test(userData.mobileNumber.trim()) &&
      userData.mobileNumber.trim().length === 10;
    errors.mobileNumber = IsStringNullEmptyOrUndefined(userData.mobileNumber)
      ? validationMessages.mobileNumberRequired
      : !isMobileValid
        ? validationMessages.mobileNumberInvalid
        : "";

    errors.designation = IsStringNullEmptyOrUndefined(userData.designation)
      ? validationMessages.designationRequired
      : "";

    errors.rolesList = selectedOption ? "" : validationMessages.selectRole;

    setFormErrors(errors);
  };

  const handleSave = async (): Promise<void> => {
    if (!userData) return;

    setIsFormSubmitted(true);

    validateFormFields();

    const isValid: boolean = IsFormValid(formErrors);

    if (isValid) {
      const formatedUserData: ISaveUserDetailData = {
        fullName: `${userData.firstName!} ${userData.lastName!}`,
        email: encryptVAPTData(userData.email.trim()),
        mobileNumber: encryptVAPTData(userData.mobileNumber.trim()),
        designation: userData.designation.trim(),
        roleName: selectedOption,
        status: userData.status,
      };

      if (id) {
        formatedUserData.userID = id;
      }

      setLoading(true);

      const response = await submitAddEditRoleUserDataAPI(formatedUserData);

      if (!response) return;

      if (response && response.statusCode === 200) {
        toastSuccess(response.message);
        navigate(RoutePathConstant.private.userManagement);
      } else {
        toastError(response.message);
      }
    }

    setLoading(false);
  };

  const handleChange = (fieldName: string, value: string): void => {
    if (!userData) return;

    switch (fieldName) {
      case "firstName":
        const formattedFirstName = value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "";

        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(formattedFirstName)
            ? validationMessages.firstNameRequired
            : "",
        });

        setUserData({ ...userData, firstName: formattedFirstName });
        break;

      case "lastName":
        const formattedLastName = value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "";

        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(formattedLastName)
            ? validationMessages.lastNameRequired
            : "",
        });

        setUserData({ ...userData, lastName: formattedLastName });
        break;

      case "email": {
        const isValid: boolean = EMAIL_PATTERN.test(String(value));

        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.emailRequired
            : !isValid
              ? validationMessages.emailInvalid
              : "",
        });

        setUserData({ ...userData, [fieldName]: value });
        break;
      }

      case "mobileNumber": {
        const isValid: boolean =
          INDIAN_MOBILE_NUMBER_PATTERN.test(value) && value.length === 10;

        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.mobileNumberRequired
            : !isValid
              ? validationMessages.mobileNumberInvalid
              : "",
        });

        setUserData({ ...userData, [fieldName]: value });
        break;
      }

      case "designation":
        const formattedDesignationValue = value
          ? value
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
          : "";

        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(formattedDesignationValue)
            ? validationMessages.designationRequired
            : "",
        });

        setUserData({ ...userData, designation: formattedDesignationValue });
        break;

      case "roleName":
        setFormErrors({
          ...formErrors,
          rolesList:
            selectedOption || value ? "" : validationMessages.roleNameRequired,
        });

        setSelectedOption(value);

        break;

      default:
        break;
    }
  };

  useEffect(() => {
    fetchUserDetailApi();
  }, [id]);

  useEffect(() => {
    if (currentState === "edit") {
      validateFormFields();
    }
  }, [userData]);

  return (
    <>
      {userData && (
        <div className="whiteBoxHldr p-24">
          <Loader isLoading={loading} />
          <div className="row">
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title={`${currentTopic(currentState)} User`} />
            </div>
            <div className="row mb-4">
              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="firstName">
                  First Name<sup>*</sup>
                </label>

                <InputText
                  aria-label="First Name"
                  placeholder="Enter first name"
                  className="form-control"
                  maxLength={50}
                  name="firstName"
                  value={userData.firstName}
                  onChange={(e) =>
                    handleChange(e.target.name, e.target.value.trim())
                  }
                  disabled={currentState === "view"}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.firstName}</span>
                )}
              </div>

              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="lastName">
                  Last Name<sup>*</sup>
                </label>

                <InputText
                  aria-label="Last Name"
                  placeholder="Enter last name"
                  className="form-control"
                  maxLength={50}
                  name="lastName"
                  value={userData.lastName}
                  onChange={(e) =>
                    handleChange(e.target.name, e.target.value.trim())
                  }
                  disabled={currentState === "view"}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.lastName}</span>
                )}
              </div>

              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="email">
                  Email ID<sup>*</sup>
                </label>

                <InputText
                  aria-label="Email ID"
                  placeholder="Enter email id"
                  className="form-control"
                  maxLength={50}
                  name="email"
                  value={userData.email}
                  onChange={(e) =>
                    handleChange(
                      e.target.name,
                      e.target.value.toLowerCase().trim()
                    )
                  }
                  disabled={currentState === "view" || currentState === "edit"}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="mobileNumber">
                  Mobile Number<sup>*</sup>
                </label>

                <InputText
                  aria-label="Mobile Number"
                  placeholder="Enter mobile number"
                  className="form-control"
                  maxLength={10}
                  name="mobileNumber"
                  value={userData?.mobileNumber}
                  onChange={(e) =>
                    handleChange(e.target.name, e.target.value.trim())
                  }
                  onKeyPress={(e) => {
                    if (!NUMBER_ONLY_PATTERN.test(e.key) && e.key !== "Enter") {
                      e.preventDefault();
                    }
                  }}
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                  disabled={currentState === "view" || currentState === "edit"}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.mobileNumber}</span>
                )}
              </div>

              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="designation">
                  Designation<sup>*</sup>
                </label>

                <InputText
                  aria-label="Designation"
                  placeholder="Enter designation"
                  className="form-control"
                  maxLength={35}
                  name="designation"
                  value={userData.designation}
                  onChange={(e) =>
                    handleChange(e.target.name, e.target.value.trimStart())
                  }
                  disabled={currentState === "view"}
                // onPaste={(e) => e.preventDefault()}
                // onCopy={(e) => e.preventDefault()}
                // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.designation}</span>
                )}
              </div>

              <div className="form-group col-sm-12 col-lg-6 mb-4">
                <label className="form-label" htmlFor="roleName">
                  Role<sup>*</sup>
                </label>

                <Dropdown
                  name="roleName"
                  className="user-management-role"
                  variant={currentState === "view" ? "filled" : "outlined"}
                  value={selectedOption}
                  onChange={(e) => {
                    handleChange("roleName", e.value);
                    setSelectedOption(e.value);
                  }}
                  options={roleOptions
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((option) => ({
                      label: option.label,
                      value: option.label,
                    }))}
                  placeholder="Select Role"
                  disabled={currentState === "view"}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.rolesList}</span>
                )}
              </div>

              <div className="col-lg-6 col-sm-12 d-flex align-items-center mb-4">
                <InputSwitch
                  aria-label="Role Active"
                  checked={userData.status}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      status: e.value,
                    })
                  }
                  disabled={currentState === "view"}
                />
                <p className="ps-2 small">
                  {userData.status ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-4 col-sm-12 col-12 mb-4">
            {currentState !== "view" && (
              <Button
                className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
                  } me-3`}
                onClick={handleSave}
                disabled={loading}
                label={currentState === "create" ? "Create" : "Save"}
              />
            )}

            <BackButton />

            {currentState === "view" && (
              <Button
                className="btn btn-orange ms-3"
                label="Edit User"
                onClick={() =>
                  navigate(
                    `${RoutePathConstant.private.userManagement}/edit/${id}`
                  )
                }
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementDetail;

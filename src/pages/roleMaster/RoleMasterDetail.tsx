import { useEffect, useState } from "react";
import { IsStringNullEmptyOrUndefined } from "../../utils/functions/nullCheck";
import { InputSwitch } from "primereact/inputswitch";
import {
  IRoleDetailData,
  IRoleDetailResponse,
  IRolePermission,
  IRoleValidation,
} from "../../interface/roleMaster";
import {
  updateRoleDetailAPI,
  viewRoleDetailAPI,
} from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { APIResponseEntity } from "../../interface/apiResponse";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { CLIENT_ROLE, RouteParams } from "../../utils/constants/constant";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import TableTitle from "../../components/TableTitle";
import { validationMessages } from "../../utils/constants/messages";

const RoleMasterDetail = () => {
  const [roleData, setRoleData] = useState<IRoleDetailData>();

  const [initialRoleData, setInitialRoleData] = useState<IRoleDetailData>();

  const [formErrors, setFormErrors] = useState<IRoleValidation>({
    roleName: validationMessages.roleNameRequired,
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams<RouteParams>();

  const { userType } = useSelector((state: RootState) => state.user.user);

  const currentState = location.pathname.split("/")[2];

  const handleChange = (fieldName: string, value: string): void => {
    if (!roleData) return;

    if (fieldName === "roleName") {
      setFormErrors({
        ...formErrors,
        [fieldName]: IsStringNullEmptyOrUndefined(value)
          ? validationMessages.roleNameRequired
          : "",
      });
    }

    setRoleData({ ...roleData, [fieldName]: value });
  };

  const fetchViewRoleApi = async (): Promise<void> => {
    setLoading(true);

    const params = {
      roleID: currentState === "create" ? 0 : Number(id),
      isMasterRole: userType === CLIENT_ROLE.SUPER_ADMIN,
    };

    const response: IRoleDetailResponse = await viewRoleDetailAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const updatedPermissions = {
        ...response.data,
        permissions: response.data.permissions.filter(
          (permission) =>
            typeof permission.create === "boolean" ||
            typeof permission.view === "boolean" ||
            typeof permission.list === "boolean"
        ),
      };

      setRoleData(updatedPermissions);

      setInitialRoleData(updatedPermissions);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handlePermissionChange = (
    action: string,
    value: boolean,
    rightId: number
  ): void => {
    if (!roleData) return;

    const updatedPermissions = roleData.permissions.map((permission) => {
      if (permission.rightID !== rightId) return permission;

      const updatedPermission = { ...permission };

      if (action === "create" || action === "view") {
        // Only update if action field is not null
        if (updatedPermission[action] !== null) {
          updatedPermission[action] = value;
        }

        if (value && updatedPermission.list !== null) {
          // If create/view is checked, check list if list is not null
          updatedPermission.list = true;
        }
      } else if (action === "list") {
        // Only update list if it's not null
        if (updatedPermission.list !== null) {
          updatedPermission.list = value;
        }

        if (!value) {
          // If list is unchecked, uncheck create and view only if they are not null
          if (updatedPermission.create !== null) {
            updatedPermission.create = false;
          }
          if (updatedPermission.view !== null) {
            updatedPermission.view = false;
          }
        }
      }

      return updatedPermission;
    });

    setClickCounter((prev) => prev + 1);

    setRoleData({ ...roleData, permissions: updatedPermissions });
  };

  const renderCheckBoxes = (
    role: IRolePermission,
    action: keyof IRolePermission
  ): JSX.Element | null => {
    if (role[action] === undefined) {
      return null;
    }

    const isDisabled =
      role.rightName === "Role Master" ||
      currentState === "view" ||
      (role.rightName === "Dashboard" && action === "list");

    return (
      <div className="form-check">
        {typeof role[action] === "boolean" ? (
          <Checkbox
            className={`${isDisabled ? "checkbox-disabled" : ""}`}
            disabled={isDisabled}
            checked={!!role[action]}
            onChange={(e) =>
              handlePermissionChange(action, e.target.checked!, role.rightID)
            }
          />
        ) : (
          <i className="bi bi-x-circle-fill" style={{ color: "#E5222D" }} />
        )}
      </div>
    );
  };

  const handleSave = async (): Promise<void> => {
    if (!roleData) return;

    if (IsStringNullEmptyOrUndefined(roleData.roleName)) {
      setFormErrors({ ...formErrors, roleName: validationMessages.roleNameRequired });
      setIsFormSubmitted(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormErrors({ roleName: "" });
    setIsFormSubmitted(false);

    if (roleData.roleID === 0) {
      delete roleData.roleID;
    }

    const getChangedPermissions = () => {
      if (!initialRoleData) return [];

      return roleData.permissions
        .map((currentPermission) => {
          const initialPermission = initialRoleData.permissions.find(
            (p) => p.rightID === currentPermission.rightID
          );

          if (!initialPermission) {
            // New permission added (optional, depends if needed)
            return {
              id: currentPermission.id,
              rightID: currentPermission.rightID,
              rightName: currentPermission.rightName,
              displayOrder: currentPermission.displayOrder,
              ...(currentPermission.create !== null && {
                create: currentPermission.create,
              }),
              ...(currentPermission.view !== null && {
                view: currentPermission.view,
              }),
              ...(currentPermission.list !== null && {
                list: currentPermission.list,
              }),
            };
          }

          const changedFields: Partial<IRolePermission> = {};

          if (currentPermission.create !== initialPermission.create) {
            changedFields.create = currentPermission.create;
          }
          if (currentPermission.view !== initialPermission.view) {
            changedFields.view = currentPermission.view;
          }
          if (currentPermission.list !== initialPermission.list) {
            changedFields.list = currentPermission.list;
          }

          if (Object.keys(changedFields).length > 0) {
            return {
              id: currentPermission.id,
              rightID: currentPermission.rightID,
              rightName: currentPermission.rightName,
              displayOrder: currentPermission.displayOrder,
              ...changedFields,
            };
          }

          return null;
        })
        .filter((perm) => perm !== null); // Only keep changed permissions
    };

    const changedPermissions = getChangedPermissions();

    setLoading(true);

    const payload = {
      ...roleData,
      changedPermissions,
    };

    const response: APIResponseEntity = await updateRoleDetailAPI(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      navigate(RoutePathConstant.private.roleMaster);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const currentTopic = (state: string): string => {
    return state === "create"
      ? "Create Role"
      : state === "view"
      ? "View Role"
      : state === "edit"
      ? "Edit Role"
      : "Role";
  };

  useEffect(() => {
    fetchViewRoleApi();
  }, [id]);

  return (
    <>
      <Loader isLoading={loading} />

      {roleData && (
        <div className="whiteBoxHldr p-24">
          <div className="row">
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title={currentTopic(currentState)} />
            </div>
            <div className="row mb-4 col-8">
              <div className="form-group col-sm-12 col-lg-6">
                <label className="form-label small" htmlFor="roleName">
                  Role Name<sup>*</sup>
                </label>

                <InputText
                  autoFocus
                  aria-label="Role Name"
                  placeholder="Enter Role"
                  className="form-control"
                  maxLength={50}
                  name="roleName"
                  value={roleData.roleName.trimStart()}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  disabled={currentState === "view"}
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.roleName}</span>
                )}
              </div>

              <div className="col-lg-6 col-sm-12 d-flex align-items-center mt-4">
                <InputSwitch
                  aria-label="Role Active"
                  checked={roleData.isActive}
                  onChange={(e) =>
                    setRoleData({
                      ...roleData,
                      isActive: e.value,
                    })
                  }
                  disabled={currentState === "view"}
                />
                <p className="ps-2 small">
                  {roleData.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            {currentState === "view" && (
              <div className="row col-4 d-flex justify-content-end align-content-center">
                <Button
                  className="btn btn-orange w-50"
                  onClick={() => {
                    setClickCounter((prev) => prev + 1);
                    navigate(
                      `${RoutePathConstant.private.roleMaster}/edit/${id}`
                    );
                  }}
                >
                  Edit Rights <i className="bi bi-arrow-right ms-2" />
                </Button>
              </div>
            )}
          </div>

          {userType === CLIENT_ROLE.SUPER_ADMIN && (
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title="Rights List" />
            </div>
          )}

          <div className="table-responsive">
            <DataTable
              className="tableMain"
              key={clickCounter}
              value={roleData.permissions}
              emptyMessage="No Role Found"
            >
              <Column
                field="rightName"
                header="Module"
                style={{ width: "740px" }}
              />

              <Column
                header="Create / Edit"
                body={(role: IRolePermission) =>
                  renderCheckBoxes(role, "create")
                }
                style={{ width: "150px" }}
              />
              <Column
                header="View"
                body={(role: IRolePermission) => renderCheckBoxes(role, "view")}
                style={{ width: "150px" }}
              />
              <Column
                header="List"
                body={(role: IRolePermission) => renderCheckBoxes(role, "list")}
                style={{ width: "150px" }}
              />
            </DataTable>
          </div>

          <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-4">
            {currentState !== "view" && (
              <Button className="btn btn-orange me-3" onClick={handleSave}>
                {currentState === "create" ? "Create" : "Save"}
              </Button>
            )}
            <Button
              className="btn btn-black-line text-center"
              onClick={() => {
                navigate(-1);
                fetchViewRoleApi();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              label="Back"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RoleMasterDetail;

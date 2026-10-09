import { MouseEvent, useEffect, useState } from "react";
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
import { ROLE_NAME_PATTERN } from "../../utils/constants/pattern";
import {
  buildPermissionTableTree,
  disableUserManagementPermissions,
  isPermissionBlockedByParent,
  PermissionTableNode,
  updatePermissionWithChildren,
} from "../../utils/functions/permissionTree";
import usePermission from "../../hooks/usePermission";

const RoleMasterDetail = () => {
  const [roleData, setRoleData] = useState<IRoleDetailData>();

  const [initialRoleData, setInitialRoleData] = useState<IRoleDetailData>();

  const [formErrors, setFormErrors] = useState<IRoleValidation>({
    roleName: validationMessages.roleNameRequired,
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [isRoleNameTouched, setIsRoleNameTouched] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const [expandedRows, setExpandedRows] = useState<
    Record<string, boolean> | PermissionTableNode[]
  >({});

  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams<RouteParams>();

  const { userType, userID } = useSelector((state: RootState) => state.user.user);

  const currentState = location.pathname.split("/")[2];

  const { create } = usePermission("RoleMaster", ["create"])();

  const handleChange = (fieldName: string, value: string): void => {
    if (!roleData) return;

    if (fieldName === "roleName") {
      setIsRoleNameTouched(true);
      setFormErrors({
        ...formErrors,
        [fieldName]: IsStringNullEmptyOrUndefined(value.trim())
          ? validationMessages.roleNameRequired
          : value.trim().length < 3 || value.trim().length > 50 || !ROLE_NAME_PATTERN.test(value.trim())
            ? validationMessages.roleNameInvalid
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
        permissions: disableUserManagementPermissions(response.data.permissions),
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

    const updatedPermissions = updatePermissionWithChildren(
      roleData.permissions,
      action,
      value,
      rightId
    );

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
      currentState === "view" ||
      (role.rightName === "Dashboard" && action === "list") ||
      isPermissionBlockedByParent(roleData?.permissions || [], role);

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
          <div className="danger-icon">
            <i className="bi bi-x-circle-fill" />
          </div>
        )}
      </div>
    );
  };

  const handleSave = async (event?: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event?.currentTarget.blur();
    if (!roleData) return;

    const roleName = roleData.roleName.trim();

    if (IsStringNullEmptyOrUndefined(roleName) || roleName.length < 3 || roleName.length > 50 || !ROLE_NAME_PATTERN.test(roleName)) {
      setFormErrors({
        ...formErrors,
        roleName: IsStringNullEmptyOrUndefined(roleName)
          ? validationMessages.roleNameRequired
          : validationMessages.roleNameInvalid,
      });
      setIsFormSubmitted(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormErrors({ roleName: "" });
    setIsFormSubmitted(false);

    // if (roleData.roleID === 0) {
    //   delete roleData.roleID;
    // }

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

    if (userType !== CLIENT_ROLE.SUPER_ADMIN) {
      payload.linkedUserID = userID;
    }

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

  const permissionTree = roleData
    ? buildPermissionTableTree(roleData.permissions)
    : [];

  const canExpandRow = (rowData: PermissionTableNode): boolean =>
    rowData.children.length > 0;

  const renderModuleCell = (
    permission: IRolePermission,
    isChild = false
  ): JSX.Element => (
    <div className={`permission-matrix-module ${isChild ? "permission-matrix-module-child" : ""}`}>
      <span className="permission-matrix-module-title">
        {permission.displayName}
      </span>
    </div>
  );

  const renderPermissionExpansion = (
    rowData: PermissionTableNode
  ): JSX.Element => (
    <div className="permission-matrix-expansion">
      <div className="permission-matrix-expansion-header">
        <span>Sub-module</span>
        <span>Create / Edit</span>
        <span>View</span>
        <span>List</span>
      </div>

      {rowData.children.map((childPermission) => (
        <div className="permission-matrix-child-row" key={childPermission.rightID}>
          <div className="permission-matrix-child-module">
            {renderModuleCell(childPermission, true)}
          </div>
          <div className="permission-matrix-child-check" data-label="Create / Edit">
            {renderCheckBoxes(childPermission, "create")}
          </div>
          <div className="permission-matrix-child-check" data-label="View">
            {renderCheckBoxes(childPermission, "view")}
          </div>
          <div className="permission-matrix-child-check" data-label="List">
            {renderCheckBoxes(childPermission, "list")}
          </div>
        </div>
      ))}
    </div>
  );

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

                {(isFormSubmitted || isRoleNameTouched) && formErrors.roleName && (
                  <span className="error">{formErrors.roleName}</span>
                )}
              </div>

              {create &&
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
                  <p className="ps-2 primary-color">
                    {roleData.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              }
            </div>

            {currentState === "view" && create && (
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
              className="tableMain permission-matrix-table"
              key={clickCounter}
              value={permissionTree}
              dataKey="rightID"
              expandedRows={expandedRows}
              onRowToggle={(event) =>
                setExpandedRows(
                  (event.data || {}) as Record<string, boolean> | PermissionTableNode[]
                )
              }
              rowExpansionTemplate={renderPermissionExpansion}
              emptyMessage="No Role Found"
            >
              <Column expander={canExpandRow} style={{ width: "3.5rem" }} />
              <Column
                header="Module"
                body={(role: PermissionTableNode) => renderModuleCell(role)}
                style={{ width: "calc(43% - 3.5rem)" }}
              />

              <Column
                header="Create / Edit"
                body={(role: IRolePermission) =>
                  renderCheckBoxes(role, "create")
                }
                style={{ width: "19%" }}
                bodyClassName="permission-matrix-check-cell"
                headerClassName="permission-matrix-check-header"
              />
              <Column
                header="View"
                body={(role: IRolePermission) => renderCheckBoxes(role, "view")}
                style={{ width: "19%" }}
                bodyClassName="permission-matrix-check-cell"
                headerClassName="permission-matrix-check-header"
              />
              <Column
                header="List"
                body={(role: IRolePermission) => renderCheckBoxes(role, "list")}
                style={{ width: "19%" }}
                bodyClassName="permission-matrix-check-cell"
                headerClassName="permission-matrix-check-header"
              />
            </DataTable>
          </div>

          <div className="col-12 mt-4 d-flex justify-content-end">
            {currentState !== "view" && (
              <Button className="btn btn-orange me-3" onClick={handleSave}>
                {currentState === "create" ? "Create" : "Save"}
              </Button>
            )}
            <Button
              className="btn btn-black-line text-center"
              onClick={(
                event?: MouseEvent<HTMLButtonElement>
              ) => {
                navigate(-1);
                fetchViewRoleApi();
                window.scrollTo({ top: 0, behavior: "smooth" });
                event?.currentTarget?.blur();
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

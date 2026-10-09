import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import BackButton from "../../components/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { RouteParams } from "../../utils/constants/constant";
import {
  getUserRightsForUserManagementAPI,
  submitUserRightsForUserManagementAPI,
} from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  IGetUserRightsForUserManagementResponse,
  IUpdateUserRightBodyData,
  IUserRightData,
} from "../../interface/userManagement";
import { IRolePermission } from "../../interface/roleMaster";
import { Checkbox } from "primereact/checkbox";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import TableTitle from "../../components/TableTitle";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import {
  buildPermissionTableTree,
  disableUserManagementPermissions,
  getPermissionAvailability,
  isPermissionBlockedByParent,
  PermissionTableNode,
  updatePermissionWithChildren,
} from "../../utils/functions/permissionTree";

const UserManagementRights = () => {
  const [rightsData, setRightsData] = useState<IUserRightData>({
    userEmail: "",
    rolesAndRights: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const [expandedRows, setExpandedRows] = useState<
    Record<string, boolean> | PermissionTableNode[]
  >({});

  const { id } = useParams<RouteParams>();

  const navigate = useNavigate();

  const fetchViewRoleApi = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const params: {
      userID: string;
    } = {
      userID: id,
    };

    const response: IGetUserRightsForUserManagementResponse =
      await getUserRightsForUserManagementAPI(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const responseData = response.data as IUserRightData;

      const updatedPermissions = {
        ...responseData,
        userEmail: responseData.userEmail ? decryptVAPTData(responseData.userEmail) : "",
        rolesAndRights: disableUserManagementPermissions(responseData.rolesAndRights)
          .filter(getPermissionAvailability)
          .map((permission) =>
            permission.rightName === "Dashboard"
              ? { ...permission, list: true }
              : permission
          ),
      };

      setRightsData(updatedPermissions);
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
    if (!rightsData.rolesAndRights) return;

    const updatedPermissions = updatePermissionWithChildren(
      rightsData.rolesAndRights,
      action,
      value,
      rightId
    );

    setClickCounter((prev) => prev + 1);

    setRightsData({ ...rightsData, rolesAndRights: updatedPermissions });
  };

  const renderCheckBoxes = (
    role: IRolePermission,
    action: keyof IRolePermission
  ): JSX.Element | null => {
    if (role[action] === undefined) {
      return null;
    }

    const isDashboardList = role.rightName === "Dashboard" && action === "list";
    const isDisabled = isDashboardList || isPermissionBlockedByParent(
      rightsData.rolesAndRights,
      role
    );

    return (
      <div className="form-check">
        {typeof role[action] === "boolean" ? (
          <Checkbox
            className={isDisabled ? "checkbox-disabled" : ""}
            disabled={isDisabled}
            checked={isDashboardList ? true : !!role[action]}
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

  const handleSave = async (): Promise<void> => {
    if (!rightsData.rolesAndRights || !id) return;

    setLoading(true);

    const body: IUpdateUserRightBodyData = {
      userID: id,
      permissions: rightsData.rolesAndRights,
    };

    const response: IGetUserRightsForUserManagementResponse =
      await submitUserRightsForUserManagementAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      navigate(RoutePathConstant.private.userManagement);
    } else {
      toastError(response.message)
    }

    setLoading(false);
  };

  const handleReset = async (): Promise<void> => {
    if (!rightsData.rolesAndRights) return;

    setLoading(true);

    const resetPermissions = rightsData.rolesAndRights.map((permission) => ({
      ...permission,
      create: permission.create === null ? null : false,
      view: permission.view === null ? null : false,
      list: permission.list === null ? null : permission.rightName === "Dashboard" ? true : false,
    }));

    setRightsData({ ...rightsData, rolesAndRights: resetPermissions });

    setLoading(false);
  };

  useEffect(() => {
    fetchViewRoleApi();
  }, [id]);

  const permissionTree = buildPermissionTableTree(rightsData.rolesAndRights);

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
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-12 mb-4 titleBtnWrapper">
          <TableTitle title="User Rights" />
        </div>
      </div>
      <h2 className="user-assign-rights">
        Rights List for User: {rightsData.userEmail}
      </h2>

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
            body={(role: IRolePermission) => renderCheckBoxes(role, "create")}
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

      <div className="col-sm-12 col-12 mt-4 justify-content-end d-flex">
        <Button className="btn btn-orange me-3" onClick={handleSave}>
          Assign Rights
        </Button>
        <Button className="btn btn-orange-line me-3" onClick={handleReset}>
          Reset Rights
        </Button>
        <BackButton />
      </div>
    </div>
  );
};

export default UserManagementRights;

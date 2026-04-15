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

const UserManagementRights = () => {
  const [rightsData, setRightsData] = useState<IUserRightData>({
    userEmail: "",
    rolesAndRights: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

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

    if (response && response.statusCode === 200 && response.data) {
      const updatedPermissions = {
        ...response.data,
        userEmail: response.data.userEmail ? decryptVAPTData(response.data.userEmail) : "",
        rolesAndRights: response.data.rolesAndRights.filter(
          (permission) =>
            typeof permission.create === "boolean" ||
            typeof permission.view === "boolean" ||
            typeof permission.list === "boolean"
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

    const updatedPermissions = rightsData.rolesAndRights.map((permission) => {
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

    setRightsData({ ...rightsData, rolesAndRights: updatedPermissions });
  };

  const renderCheckBoxes = (
    role: IRolePermission,
    action: keyof IRolePermission
  ): JSX.Element | null => {
    if (role[action] === undefined) {
      return null;
    }

    return (
      <div className="form-check">
        {typeof role[action] === "boolean" ? (
          <Checkbox
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
    if (!rightsData.rolesAndRights || !id) return;

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
    }
  };

  const handleReset = async (): Promise<void> => {
    if (!rightsData.rolesAndRights) return;

    const resetPermissions = rightsData.rolesAndRights.map((permission) => ({
      ...permission,
      create: permission.create === null ? null : false,
      view: permission.view === null ? null : false,
      list: permission.list === null ? null : false,
    }));

    setRightsData({ ...rightsData, rolesAndRights: resetPermissions });
  };

  useEffect(() => {
    fetchViewRoleApi();
  }, [id]);

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
          className="tableMain"
          key={clickCounter}
          value={rightsData.rolesAndRights}
          emptyMessage="No Role Found"
        >
          <Column field="rightName" header="Module" />
          <Column
            header="Create"
            body={(role: IRolePermission) => renderCheckBoxes(role, "create")}
          />
          <Column
            header="View"
            body={(role: IRolePermission) => renderCheckBoxes(role, "view")}
          />
          <Column
            header="List"
            body={(role: IRolePermission) => renderCheckBoxes(role, "list")}
          />
        </DataTable>
      </div>

      <div className="col-sm-12 col-12 mt-4">
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

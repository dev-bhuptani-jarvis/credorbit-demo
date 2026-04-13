import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Permission } from "../interface/sidebarPermission";
import { PermissionModule } from "../utils/constants/constant";

export type ActionType = "view" | "create";

const usePermission = (subModule: PermissionModule, action: ActionType[]) => {
  const { permissions } = useSelector((state: RootState) => state.user.user);

  const checkPermissions = () => {
    const modulePermission = permissions?.find(
      (perm: Permission) => perm.rightName === subModule
    );

    return action.reduce((result, action) => {
      result[action] = modulePermission?.[action] ?? false;
      return result;
    }, {} as Record<ActionType, boolean>);
  };

  return checkPermissions;
};

export default usePermission;

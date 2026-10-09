import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Permission } from "../interface/sidebarPermission";
import { CLIENT_ROLE, PermissionModule } from "../utils/constants/constant";

export type ActionType = "view" | "create";

const usePermission = (subModule: PermissionModule, action: ActionType[]) => {
  const { permissions, userType } = useSelector((state: RootState) => state.user.user);

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const isReadOnlyImpersonation =
    isImpersonate && userType === CLIENT_ROLE.EDUCATIONAL_INSTITUTE;

  const checkPermissions = () => {
    const modulePermission = permissions?.find(
      (perm: Permission) => perm.rightName === subModule
    );

    return action.reduce((result, action) => {
      result[action] =
        action === "create" && isReadOnlyImpersonation
          ? false
          : modulePermission?.[action] ?? false;
      return result;
    }, {} as Record<ActionType, boolean>);
  };

  return checkPermissions;
};

export default usePermission;

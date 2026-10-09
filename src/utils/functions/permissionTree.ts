import { IRolePermission } from "../../interface/roleMaster";

export interface PermissionTableNode extends IRolePermission {
  children: PermissionTableNode[];
}

export const isUserManagementPermission = (
  permission: IRolePermission
): boolean =>
  ["UserManagement", "ManageUsers", "RoleMaster"].includes(
    permission.rightName
  ) ||
  ["User Management", "Manage Users", "Role Master"].includes(
    permission.displayName || ""
  );

export const disableUserManagementPermissions = (
  permissions: IRolePermission[]
): IRolePermission[] =>
  permissions.map((permission) =>
    isUserManagementPermission(permission)
      ? { ...permission, create: null, view: null, list: null }
      : permission
  );

const sortByDisplayOrder = (
  firstPermission: IRolePermission,
  secondPermission: IRolePermission
): number => (firstPermission.displayOrder || 0) - (secondPermission.displayOrder || 0);

export const getPermissionAvailability = (
  permission: IRolePermission
): boolean =>
  typeof permission.create === "boolean" ||
  typeof permission.view === "boolean" ||
  typeof permission.list === "boolean" ||
  isUserManagementPermission(permission);

export const buildPermissionTableTree = (
  permissions: IRolePermission[]
): PermissionTableNode[] => {
  const permissionMap: Record<number, PermissionTableNode> = {};

  const permissionNodes = permissions
    .filter(getPermissionAvailability)
    .sort(sortByDisplayOrder)
    .map((permission) => {
      const permissionNode: PermissionTableNode = {
        ...permission,
        displayName: permission.displayName || permission.rightName,
        children: [],
      };

      permissionMap[permission.rightID] = permissionNode;

      return permissionNode;
    });

  return permissionNodes.filter((permissionNode) => {
    if (permissionNode.parentID !== 0) {
      const parentPermission = permissionMap[permissionNode.parentID];

      if (parentPermission) {
        parentPermission.children.push(permissionNode);
        parentPermission.children.sort(sortByDisplayOrder);

        return false;
      }
    }

    return permissionNode.parentID === 0;
  });
};

const getDescendantPermissionIds = (
  permissions: IRolePermission[],
  parentPermissionId: number
): Set<number> => {
  const descendantIds = new Set<number>();
  const pendingParentIds = [parentPermissionId];

  while (pendingParentIds.length) {
    const currentParentId = pendingParentIds.pop();

    if (currentParentId === undefined) {
      continue;
    }

    for (const permission of permissions) {
      if (
        permission.parentID === currentParentId &&
        !descendantIds.has(permission.rightID)
      ) {
        descendantIds.add(permission.rightID);
        pendingParentIds.push(permission.rightID);
      }
    }
  }

  return descendantIds;
};

const hasAnyPermissionEnabled = (permission: IRolePermission): boolean =>
  permission.create === true ||
  permission.view === true ||
  permission.list === true;

const enableFirstAvailablePermission = (
  permission: IRolePermission
): boolean => {
  if (typeof permission.list === "boolean") {
    permission.list = true;
    return true;
  }

  if (typeof permission.create === "boolean") {
    permission.create = true;
    return true;
  }

  if (typeof permission.view === "boolean") {
    permission.view = true;
    return true;
  }

  return false;
};

// Keep every enabled parent reachable through at least one enabled child module.
// This shared rule is used by every role/rights screen.
const ensureEnabledParentsHaveEnabledChildren = (
  permissions: IRolePermission[]
): IRolePermission[] => {
  const updatedPermissions = permissions.map((permission) => ({ ...permission }));
  const childPermissionsByParentId = new Map<number, IRolePermission[]>();

  for (const permission of updatedPermissions) {
    if (permission.parentID === 0) {
      continue;
    }

    const children = childPermissionsByParentId.get(permission.parentID) || [];
    children.push(permission);
    childPermissionsByParentId.set(permission.parentID, children);
  }

  childPermissionsByParentId.forEach((children) => {
    children.sort(sortByDisplayOrder);
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const parentPermission of updatedPermissions) {
      const childPermissions = childPermissionsByParentId.get(
        parentPermission.rightID
      );

      if (
        !childPermissions ||
        !hasAnyPermissionEnabled(parentPermission) ||
        childPermissions.some(hasAnyPermissionEnabled)
      ) {
        continue;
      }

      const firstAvailableChild = childPermissions.find(
        getPermissionAvailability
      );

      if (firstAvailableChild && enableFirstAvailablePermission(firstAvailableChild)) {
        changed = true;
      }
    }
  }

  return updatedPermissions;
};

const syncAncestorListPermissions = (
  permissions: IRolePermission[],
  rightId: number
): IRolePermission[] => {
  const permissionMap = new Map(
    permissions.map((permission) => [permission.rightID, permission]),
  );

  const updatedPermissions = permissions.map((permission) => ({ ...permission }));

  const updatedPermissionMap = new Map(
    updatedPermissions.map((permission) => [permission.rightID, permission]),
  );

  let currentParentId = permissionMap.get(rightId)?.parentID || 0;

  while (currentParentId !== 0) {
    const parentPermission = updatedPermissionMap.get(currentParentId);

    if (!parentPermission) {
      break;
    }

    const childPermissions = updatedPermissions.filter(
      (permission) => permission.parentID === currentParentId,
    );

    const hasCheckedChildPermission = childPermissions.some(hasAnyPermissionEnabled);

    if (parentPermission.list !== null) {
      parentPermission.list = hasCheckedChildPermission;
    }

    if (!hasCheckedChildPermission) {
      if (parentPermission.create !== null) {
        parentPermission.create = false;
      }

      if (parentPermission.view !== null) {
        parentPermission.view = false;
      }
    }

    currentParentId = parentPermission.parentID;
  }

  return updatedPermissions;
};

export const updatePermissionWithChildren = (
  permissions: IRolePermission[],
  action: string,
  value: boolean,
  rightId: number
): IRolePermission[] => {
  const childPermissionIds =
    action === "list"
      ? getDescendantPermissionIds(permissions, rightId)
      : new Set<number>();

  const updatedPermissions = permissions.map((permission) => {
    const isTargetPermission = permission.rightID === rightId;
    const isChildPermission = childPermissionIds.has(permission.rightID);

    if (!isTargetPermission && !isChildPermission) {
      return permission;
    }

    const updatedPermission = { ...permission };

    if (isChildPermission) {
      return {
        ...updatedPermission,
        create:
          value || updatedPermission.create === null ? updatedPermission.create : false,
        view:
          value || updatedPermission.view === null ? updatedPermission.view : false,
        list: updatedPermission.list === null ? null : value,
      };
    }

    if (action === "create" || action === "view") {
      if (updatedPermission[action] !== null) {
        updatedPermission[action] = value;
      }

      if (value && updatedPermission.list !== null) {
        updatedPermission.list = true;
      }
    } else if (action === "list") {
      if (updatedPermission.list !== null) {
        updatedPermission.list = value;
      }

      if (!value) {
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

  return ensureEnabledParentsHaveEnabledChildren(
    syncAncestorListPermissions(updatedPermissions, rightId)
  );
};

export const isPermissionBlockedByParent = (
  permissions: IRolePermission[],
  permissionToCheck: IRolePermission
): boolean => {
  let currentParentId = permissionToCheck.parentID;

  while (currentParentId !== 0) {
    let parentPermission: IRolePermission | undefined;

    for (const permission of permissions) {
      if (permission.rightID === currentParentId) {
        parentPermission = permission;
        break;
      }
    }

    if (!parentPermission) {
      return true;
    }

    if (!hasAnyPermissionEnabled(parentPermission)) {
      return true;
    }

    currentParentId = parentPermission.parentID;
  }

  return false;
};

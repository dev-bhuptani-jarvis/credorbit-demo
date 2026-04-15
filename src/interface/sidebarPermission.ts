export interface Permission {
  create: boolean;
  list: boolean;
  delete?: boolean | null;
  parentID: number;
  rightID: number;
  rightName: string;
  view: boolean;
  displayName: string;
  displayOrder: number;
}

export interface SideBarMenuItem {
  icon: string;
  path: string;
}

export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  displayName: string;
  icon: string | null;
  path: string | null;
  children: MenuItem[];
  displayOrder: number;
}

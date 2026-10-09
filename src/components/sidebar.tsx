import { RoutePathConstant } from "../utils/constants/routePaths";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MenuItem,
  Permission,
  SideBarMenuItem,
} from "../interface/sidebarPermission";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { IsNullOrEmptyArray } from "../utils/functions/nullCheck";
import {
  getWhiteLabelPreviewSettings,
  shouldApplyWhiteLabelBranding,
  subscribeWhiteLabelPreviewChange,
} from "../utils/functions/whiteLabelBranding";
import { IGetWhiteLabelSettingsByUserIdResponseData } from "../interface/whiteLabel";
import { dashboardRoute } from "../utils/functions/appRuntime";

const SIDEBAR_TOGGLE_EVENT = "credoorbit:sidebar-toggle";
const DESKTOP_BREAKPOINT = 992;
const SIDEBAR_COLLAPSED_STORAGE_KEY = "credoorbit-sidebar-collapsed";

const Sidebar = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.sessionStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  });

  const [hoveredMenuId, setHoveredMenuId] = useState<number | null>(null);

  const hoverCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();

  const navigate = useNavigate();

  const { userID, userType, permissions, isDefaultCpClient, whiteLabelSettings, isUserUnderMasterCP } = useSelector(
    (state: RootState) => state.user.user
  );

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser
  );

  const [previewSettings, setPreviewSettings] =
    useState<IGetWhiteLabelSettingsByUserIdResponseData | null>(
      getWhiteLabelPreviewSettings(),
    );

  const effectiveWhiteLabelSettings = previewSettings || whiteLabelSettings;

  const canShowWhiteLabelUi = shouldApplyWhiteLabelBranding(effectiveWhiteLabelSettings);

  const sidebarLogoSrc =
    canShowWhiteLabelUi &&
      effectiveWhiteLabelSettings?.isLogoUploaded &&
      effectiveWhiteLabelSettings?.logoUrl
      ? effectiveWhiteLabelSettings.logoUrl
      : isDesktopCollapsed
        ? "/assets/images/favicon.webp"
        : "/assets/images/logo.jpg";

  const reportsRoute = useMemo((): string => {
    switch (userType) {
      case CLIENT_ROLE.SUPER_ADMIN:
        return RoutePathConstant.private.reports;
      case CLIENT_ROLE.STUDENT:
        return userID
          ? `${RoutePathConstant.private.reports}/${userID}`
          : RoutePathConstant.private.reports;
      case CLIENT_ROLE.EDUCATIONAL_INSTITUTE:
        return RoutePathConstant.private.reports;
      default:
        return RoutePathConstant.private.reports;
    }
  }, [userID, userType]);

  const sideBarMenu = useMemo<Record<string, SideBarMenuItem>>(() => ({
    Dashboard: {
      icon: "icon-dashboard",
      path: dashboardRoute(userType),
    },
    Profile: { icon: "icon-profile", path: RoutePathConstant.private.profile },
    RoleMaster: {
      icon: "icon-profile-user",
      path: RoutePathConstant.private.roleMaster,
    },
    Reports: { icon: "icon-reports", path: reportsRoute },
    Policy: {
      icon: "icon-policy",
      path: RoutePathConstant.private.policy,
    },
    Support: { icon: "icon-support", path: RoutePathConstant.private.support },
    Contracts: { icon: "icon-contract", path: "#" },
    UserMaster: { icon: "icon-user-master", path: "#" },
    TermsAndConditions: {
      icon: "icon-profile",
      path: RoutePathConstant.private.termsConditions,
    },
    UserManagement: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.userManagement,
    },
    ManageUsers: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.userManagement,
    },
    WhiteLabelOperations: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.managedWhiteLabelling,
    },
    LoanApplicationManagement: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.loanApplicationManagement,
    },
    NBFCOperations: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.nbfcOperations,
    },
    StudentApplications: {
      icon: "",
      path: RoutePathConstant.private.educationNbfcStudentApplications,
    },
    EducationManagement: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.educationManagement,
    },
    ManageCourses: {
      icon: "",
      path: RoutePathConstant.private.educationManageCourse,
    },
    ManageStudents: {
      icon: "",
      path: RoutePathConstant.private.educationManageStudents,
    },
    EducationPortal: {
      icon: "icon-user-management",
      path: RoutePathConstant.private.educationManagement,
    },
    ManageEducationInstitute: {
      icon: "",
      path: RoutePathConstant.private.educationManagedInstitute,
    },
    ManageNBFC: {
      icon: "",
      path: RoutePathConstant.private.educationManagedNbfc,
    },
    RunTimeLogs: {
      icon: "icon-policy",
      path: RoutePathConstant.private.runTimeLogs,
    }
  }), [reportsRoute, userType]);

  const buildMenuTree = useCallback((): MenuItem[] => {
    const itemMap: { [key: number]: MenuItem } = {};

    const menuItems: MenuItem[] = permissions
      ?.filter((item: Permission) => {
        if (!item.list) {
          return false;
        }

        return true;
      })
      ?.map((item: Permission) => {
        const menuItem: MenuItem = {
          id: item.rightID,
          parentId: item.parentID,
          name: item.rightName,
          displayName: item.displayName,
          icon: sideBarMenu[item.rightName]?.icon || null,
          path:
            item.parentID === 0 && sideBarMenu[item.rightName]?.path !== "#"
              ? sideBarMenu[item.rightName]?.path || null
              : null,
          children: [],
          displayOrder: item.displayOrder,
        };

        itemMap[item.rightID] = menuItem;
        return menuItem;
      });
    menuItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const menuTree: MenuItem[] = menuItems?.filter((item) => {
      if (item.parentId !== 0) {
        const parentItem = itemMap[item.parentId];
        if (parentItem) {
          item.path = sideBarMenu[item.name]?.path || null;
          item.icon = null;
          parentItem.children.push(item);

          parentItem.children.sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          return false;
        }
      }
      return item.parentId === 0;
    });

    return menuTree;
  }, [permissions, sideBarMenu]);

  const handleToggle = (id: number): void => {
    if (isDesktopCollapsed) {
      return;
    }

    setActiveId((prevId) => (prevId === id ? null : id));
  };

  const handleHoverToggle = (id: number | null): void => {
    if (!isDesktopCollapsed || window.innerWidth < DESKTOP_BREAKPOINT) {
      return;
    }

    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }

    setHoveredMenuId(id);
  };

  const handleHoverLeave = (): void => {
    if (!isDesktopCollapsed || window.innerWidth < DESKTOP_BREAKPOINT) {
      return;
    }

    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
    }

    hoverCloseTimeoutRef.current = setTimeout(() => {
      setHoveredMenuId(null);
      hoverCloseTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    const handleSidebarToggle = (): void => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setIsMobileOpen((prevState) => !prevState);
        return;
      }

      setIsDesktopCollapsed((prevState) => {
        const nextState = !prevState;
        window.sessionStorage.setItem(
          SIDEBAR_COLLAPSED_STORAGE_KEY,
          String(nextState),
        );

        return nextState;
      });
    };

    window.addEventListener(SIDEBAR_TOGGLE_EVENT, handleSidebarToggle);

    return () => {
      window.removeEventListener(SIDEBAR_TOGGLE_EVENT, handleSidebarToggle);
    };
  }, []);

  useEffect(() => {
    const menuHldr = document.getElementById("menuHldr");

    if (!menuHldr) {
      return undefined;
    }

    const dispatchSidebarToggle = (event: Event): void => {
      event.preventDefault();
      window.dispatchEvent(new Event(SIDEBAR_TOGGLE_EVENT));
    };

    menuHldr.addEventListener("click", dispatchSidebarToggle);

    return () => {
      menuHldr.removeEventListener("click", dispatchSidebarToggle);
    };
  }, []);

  useEffect(() => {
    const syncPreviewSettings = (): void => {
      setPreviewSettings(getWhiteLabelPreviewSettings());
    };

    syncPreviewSettings();

    return subscribeWhiteLabelPreviewChange(syncPreviewSettings);
  }, []);

  useEffect(() => {
    let FinalSideBarArray: MenuItem[] = buildMenuTree();

    if (isUserUnderMasterCP) {
      FinalSideBarArray = FinalSideBarArray
        .filter((item) => item.name !== "ContractChannelPartner")
        .map((item) => ({
          ...item,
          children: item.children?.filter(
            (child) => child.name !== "ContractChannelPartner"
          ) || [],
        }));
    } else {
      FinalSideBarArray = FinalSideBarArray
        .filter((item) => item.name !== "MasterCPToCPContract")
        .map((item) => ({
          ...item,
          children: item.children?.filter(
            (child) => child.name !== "MasterCPToCPContract"
          ) || [],
        }))
    }

    setMenuTree(FinalSideBarArray);
  }, [buildMenuTree, isImpersonate, permissions, userType, isDefaultCpClient, canShowWhiteLabelUi, isUserUnderMasterCP]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate(dashboardRoute(userType));
    }
  }, [location.pathname, navigate, userType]);

  useEffect(() => {
    // Auto-expand parent if a child route is active
    const matchedParent = menuTree.find((parent) =>
      parent.children?.some((child) =>
        location.pathname.startsWith(child.path || "")
      )
    );

    if (matchedParent) {
      setActiveId(matchedParent.id);
    } else {
      setActiveId(null); // Collapse all if none match
    }
  }, [location.pathname, menuTree]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.classList.toggle("sidebar-collapsed", isDesktopCollapsed);

    return () => {
      document.body.classList.remove("sidebar-collapsed");
    };
  }, [isDesktopCollapsed]);

  useEffect(() => {
    const syncSidebarViewportState = (): void => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsMobileOpen(false);
      } else {
        setHoveredMenuId(null);
      }
    };

    window.addEventListener("resize", syncSidebarViewportState);

    return () => {
      window.removeEventListener("resize", syncSidebarViewportState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoverCloseTimeoutRef.current) {
        clearTimeout(hoverCloseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      id="sidemenuMobile"
      className={`sideMenuWrapper grey-bg ${isMobileOpen ? "is-mobile-open" : ""
        } ${isDesktopCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="logoMain">
        <img
          src={sidebarLogoSrc}
          alt="Logo"
          loading="lazy"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(dashboardRoute(userType))}
        />

        <button
          type="button"
          className="closeMobile"
          id="closeMobile"
          style={{ border: 0, padding: 0, font: "inherit" }}
          onClick={() => {
            setIsMobileOpen(false);
          }}
        >
          <i className="bi bi-x-circle" style={{ fontSize: '1.55em' }} />
        </button>
      </div>

      <div className="leftNavHldr">
        <div className="accordion leftNavMain" id="leftNavigation">
          {!IsNullOrEmptyArray(menuTree) &&
            menuTree.map((item) => {
              const isParentActive = activeId === item.id;
              const isHoverOpen = hoveredMenuId === item.id;
              const isSubmenuVisible = isDesktopCollapsed
                ? isHoverOpen
                : isParentActive;
              const isChildActive = item.children?.some((child) =>
                location.pathname.startsWith(child.path || "")
              );

              return (
                <div
                  className="accordion-item"
                  key={item.id}
                  onMouseEnter={() => handleHoverToggle(item.id)}
                  onMouseLeave={handleHoverLeave}
                >
                  {item.children && item.children.length > 0 ? (
                    <>
                      <h2
                        className={`accordion-header ${isChildActive ? "parent-active" : ""
                          }`}
                      >
                        <button
                          className={`accordion-button ${isParentActive ? "" : "collapsed"
                            }`}
                          type="button"
                          onClick={() => handleToggle(item.id)}
                          aria-label={item.displayName}
                          title={isDesktopCollapsed ? item.displayName : undefined}
                        >
                          {item.icon?.includes("assets") ? (
                            <img
                              src={item.icon}
                              alt={`${item.displayName} icon`}
                              className="sidebar-icon"
                            />
                          ) : (
                            <i className={item.icon || ""} />
                          )}

                          <span className="ms-1 sidebar-item-label">{item.displayName}</span>
                        </button>
                      </h2>

                      <div
                        className={`accordion-collapse collapse sidebar-submenu ${isSubmenuVisible ? "show" : ""
                          }`}
                        onMouseEnter={() => handleHoverToggle(item.id)}
                        onMouseLeave={handleHoverLeave}
                      >
                        <div className="accordion-body">
                          {isDesktopCollapsed && (
                            <div className="sidebar-submenu-title">{item.displayName}</div>
                          )}
                          <ul>
                            {item.children.map((subItem: MenuItem) => (
                              <li key={subItem.id}>
                                <Link
                                  className={`linkMain ${subItem.path && location.pathname
                                    .split("/")
                                    .slice(0, 3)
                                    .join("/")
                                    .includes(subItem.path) ? "active" : ""
                                    }`}
                                  to={subItem.path || "#"}
                                  onClick={() => {
                                    if (window.innerWidth < DESKTOP_BREAKPOINT) {
                                      setIsMobileOpen(false);
                                    }
                                  }}
                                >
                                  {subItem.displayName}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <h2 className="accordion-header">
                      <Link
                        className={`linkMain ${item.path && location.pathname
                          .split("/")
                          .slice(0, 3)
                          .join("/")
                          .includes(item.path) ? "active" : ""
                          }`}
                        to={item.path ?? "#"}
                        title={isDesktopCollapsed ? item.displayName : undefined}
                        onClick={() => {
                          if (window.innerWidth < DESKTOP_BREAKPOINT) {
                            setIsMobileOpen(false);
                          }
                        }}
                      >
                        {item.icon?.includes("assets") ? (
                          <img
                            src={item.icon}
                            alt={`${item.displayName} icon`}
                            className="sidebar-icon"
                          />
                        ) : (
                          <i className={item.icon || ""} />
                        )}
                        <span className="ms-1 sidebar-item-label">{item.displayName}</span>
                      </Link>
                    </h2>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

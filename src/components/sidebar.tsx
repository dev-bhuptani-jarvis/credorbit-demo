import { RoutePathConstant } from "../utils/constants/routePaths";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MenuItem,
  Permission,
  SideBarMenuItem,
} from "../interface/sidebarPermission";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { IsNullOrEmptyArray } from "../utils/functions/nullCheck";
import { StorageKeyEnum } from "../utils/constants/enum";
import { getDecryptedSessionStorage } from "../utils/functions/sessionStorage";

const Sidebar = () => {
  const educationPortalIcon = "/assets/images/user-master.svg";

  const [activeId, setActiveId] = useState<number | null>(null);

  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);

  const location = useLocation();

  const navigate = useNavigate();

  const { userType, permissions, isDefaultCpClient, userID, roleName } = useSelector(
    (state: RootState) => state.user.user
  );

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser
  );

  const impersonatedStudentId = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
  );

  const isStudentPortalUser =
    userID === "student-role-001" ||
    roleName === "Student" ||
    Boolean(impersonatedStudentId);

  const dashboardRoute = useCallback((): string => {
    if (isStudentPortalUser) {
      return RoutePathConstant.private.channelPartnerDashboard;
    }

    switch (userType) {
      case CLIENT_ROLE.SUPER_ADMIN:
        return RoutePathConstant.private.dashboard;
      case CLIENT_ROLE.CUSTOMER:
        return RoutePathConstant.private.clientDashboard;
      case CLIENT_ROLE.SOURCING_PARTNER:
        return RoutePathConstant.private.userMasterClientMaster;
      default:
        return RoutePathConstant.private.channelPartnerDashboard;
    }
  }, [isStudentPortalUser, userType]);

  const reportsRoute = useCallback((): string => {
    switch (userType) {
      case CLIENT_ROLE.CHANNEL_PARTNER:
        return RoutePathConstant.private.reports;
      case CLIENT_ROLE.CUSTOMER:
        return RoutePathConstant.private.clientReports;
      case CLIENT_ROLE.USER_MANAGEMENT:
        return RoutePathConstant.private.reports;
      default:
        return "";
    }
  }, [userType]);

  const SideBarMenu = useMemo(
    () => ({
      Dashboard: {
        icon: "icon-dashboard",
        path: dashboardRoute(),
      },
      Profile: { icon: "icon-profile", path: RoutePathConstant.private.profile },
      RoleMaster: {
        icon: "icon-profile-user",
        path: RoutePathConstant.private.roleMaster,
      },
      Reports: { icon: "/assets/images/reports.svg", path: reportsRoute() },
      Policy: {
        icon: "/assets/images/policy.svg",
        path: RoutePathConstant.private.policy,
      },
      Support: { icon: "icon-support", path: RoutePathConstant.private.support },
      PayOuts: { icon: "icon-support", path: RoutePathConstant.private.payouts },
      Contracts: { icon: "icon-contract", path: "#" },
      ContractChannelPartner: {
        icon: "",
        path: RoutePathConstant.private.contractChannelMaster,
      },
      ContractSourcingPartner: {
        icon: "",
        path: RoutePathConstant.private.contractSourcingPartner,
      },
      ContractClient: {
        icon: "",
        path: RoutePathConstant.private.contractClient,
      },
      UserMaster: { icon: "/assets/images/user-master.svg", path: "#" },
      ChannelPartner: {
        icon: "",
        path: RoutePathConstant.private.userMasterChannelPartner,
      },
      ClientMaster: {
        icon: "",
        path: RoutePathConstant.private.userMasterClientMaster,
      },
      SourcingPartner: {
        icon: "",
        path: RoutePathConstant.private.userMasterSourcingPartner,
      },
      TermsAndConditions: {
        icon: "icon-profile",
        path: RoutePathConstant.private.termsConditions,
      },
      ChannelPartnerPayout: {
        icon: "icon-profile",
        path: RoutePathConstant.private.payouts,
      },
      SourcingPartnerPayout: {
        icon: "icon-profile",
        path: RoutePathConstant.private.sourcingPartnerPayouts,
      },
      ChannelPartnerReport: {
        icon: "",
        path: RoutePathConstant.private.channelPartnerReport,
      },
      GeographicalReport: {
        icon: "",
        path: RoutePathConstant.private.geographicalReport,
      },
      UserManagement: {
        icon: "/assets/images/user-management.svg",
        path: RoutePathConstant.private.userManagement,
      },
      Subscription: {
        icon: "/assets/images/subscription.svg",
        path: RoutePathConstant.private.subscription,
      },
      ManageUsers: {
        icon: "/assets/images/user-management.svg",
        path: RoutePathConstant.private.userManagement,
      },
      WalletAndReferral: {
        icon: "/assets/images/subscription.svg",
        path: RoutePathConstant.private.wallet,
      },
      EducationPortal: {
        icon: educationPortalIcon,
        path: "#",
      },
      ManagedEducationInstitute: {
        icon: "",
        path: RoutePathConstant.private.educationManagedInstitute,
      },
      ManagedNBFC: {
        icon: "",
        path: RoutePathConstant.private.educationManagedNbfc,
      },
      ManageCourse: {
        icon: "",
        path: RoutePathConstant.private.educationManageCourse,
      },
      ManageStudents: {
        icon: "",
        path: RoutePathConstant.private.educationManageStudents,
      },
      EnrolledCourses: {
        icon: "",
        path: RoutePathConstant.private.studentEnrolledCourses,
      },
      NbfcStudentApplications: {
        icon: "",
        path: RoutePathConstant.private.educationNbfcStudentApplications,
      },
    }),
    [dashboardRoute, educationPortalIcon, reportsRoute],
  );

  const buildMenuTree = useCallback((): MenuItem[] => {
    const menuMapping: { [key: string]: SideBarMenuItem } = SideBarMenu;
    const itemMap: { [key: number]: MenuItem } = {};

    const menuItems: MenuItem[] = permissions
      ?.filter((item: Permission) => item.list)
      ?.map((item: Permission) => {
        const menuItem: MenuItem = {
          id: item.rightID,
          parentId: item.parentID,
          name: item.rightName,
          displayName: item.displayName,
          icon: menuMapping[item.rightName]?.icon || null,
          path:
            item.parentID === 0 && menuMapping[item.rightName]?.path !== "#"
              ? menuMapping[item.rightName]?.path || null
              : null,
          children: [],
          displayOrder: item.displayOrder,
        };

        itemMap[item.rightID] = menuItem;
        return menuItem;
      });

    menuItems?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const menuTree: MenuItem[] = menuItems?.filter((item) => {
      if (item.parentId !== 0) {
        const parentItem = itemMap[item.parentId];
        if (parentItem) {
          item.path = menuMapping[item.name]?.path || null;
          item.icon = null;
          parentItem.children.push(item);

          parentItem.children?.sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
          );
          return false;
        }
      }
      return item.parentId === 0;
    });

    return menuTree;
  }, [permissions, SideBarMenu]);

  const handleToggle = (id: number): void => {
    setActiveId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    const toggleMenu = () => {
      const sideMenu = document.getElementById("sidemenuMobile");

      if (sideMenu) {
        if (
          sideMenu.style.display === "none" ||
          sideMenu.style.display === ""
        ) {
          sideMenu.style.display = "block";
        } else {
          sideMenu.style.display = "";
        }
      }
    };

    const menuHldr = document.getElementById("menuHldr");
    const closeMobile = document.getElementById("closeMobile");

    if (menuHldr) menuHldr.addEventListener("click", toggleMenu);
    if (closeMobile) closeMobile.addEventListener("click", toggleMenu);

    return () => {
      if (menuHldr) menuHldr.removeEventListener("click", toggleMenu);
      if (closeMobile) closeMobile.removeEventListener("click", toggleMenu);
    };
  }, []);

  useEffect(() => {
    let FinalSideBarArray: MenuItem[] = buildMenuTree();

    FinalSideBarArray = FinalSideBarArray?.filter(
      (item) => item.name !== "EducationalManagement"
    );

    if (userType === CLIENT_ROLE.SUPER_ADMIN) {
      const hasEducationPortal = FinalSideBarArray.some(
        (item) => item.name === "EducationPortal"
      );

      if (!hasEducationPortal) {
        FinalSideBarArray.push({
          id: 100001,
          parentId: 0,
          name: "EducationPortal",
          displayName: "Education Portal",
          icon: educationPortalIcon,
          path: null,
          children: [
            {
              id: 100002,
              parentId: 100001,
              name: "ManagedEducationInstitute",
              displayName: "Managed Education Institute",
              icon: null,
              path: RoutePathConstant.private.educationManagedInstitute,
              children: [],
              displayOrder: 1,
            },
            {
              id: 100003,
              parentId: 100001,
              name: "ManagedNBFC",
              displayName: "Managed NBFC",
              icon: null,
              path: RoutePathConstant.private.educationManagedNbfc,
              children: [],
              displayOrder: 2,
            },
          ],
          displayOrder: 24,
        });
      }
    }

    if (userID === "edu-inst-001") {
      FinalSideBarArray = FinalSideBarArray?.filter(
        (item) =>
          item.name === "Dashboard" ||
          item.name === "Profile" ||
          item.name === "Support" ||
          item.name === "TermsAndConditions" ||
          item.name === "Policy",
      );

      FinalSideBarArray.push({
        id: 100010,
        parentId: 0,
        name: "EducationManagement",
        displayName: "Education Management",
        icon: educationPortalIcon,
        path: null,
        children: [
          {
            id: 100011,
            parentId: 100010,
            name: "ManageCourse",
            displayName: "Manage Course",
            icon: null,
            path: RoutePathConstant.private.educationManageCourse,
            children: [],
            displayOrder: 1,
          },
          {
            id: 100012,
            parentId: 100010,
            name: "ManageStudents",
            displayName: "Manage Students",
            icon: null,
            path: RoutePathConstant.private.educationManageStudents,
            children: [],
            displayOrder: 2,
          }
        ],
        displayOrder: 6,
      });
    }

    if (roleName === "NBFC User") {
      FinalSideBarArray = FinalSideBarArray?.filter(
        (item) =>
          item.name === "Dashboard" ||
          item.name === "Profile" ||
          item.name === "Support" ||
          item.name === "TermsAndConditions" ||
          item.name === "Policy",
      );

      FinalSideBarArray.push({
        id: 100030,
        parentId: 0,
        name: "EducationNBFC",
        displayName: "NBFC Operations",
        icon: educationPortalIcon,
        path: null,
        children: [
          {
            id: 100031,
            parentId: 100030,
            name: "NbfcStudentApplications",
            displayName: "Student Applications",
            icon: null,
            path: RoutePathConstant.private.educationNbfcStudentApplications,
            children: [],
            displayOrder: 2,
          },
        ],
        displayOrder: 6,
      });
    }

    if (isStudentPortalUser) {
      FinalSideBarArray = FinalSideBarArray?.filter(
        (item) =>
          item.name === "Dashboard" ||
          item.name === "Reports" ||
          item.name === "Profile" ||
          item.name === "Support" ||
          item.name === "TermsAndConditions" ||
          item.name === "Policy",
      );

      FinalSideBarArray.push({
        id: 100020,
        parentId: 0,
        name: "EducationLearning",
        displayName: "Education Learning",
        icon: educationPortalIcon,
        path: null,
        children: [
          {
            id: 100021,
            parentId: 100020,
            name: "StudentLoanApplication",
            displayName: "Loan Application",
            icon: null,
            path: RoutePathConstant.private.educationStudentLoanApplication,
            children: [],
            displayOrder: 1,
          },
          {
            id: 100022,
            parentId: 100020,
            name: "EnrolledCourses",
            displayName: "Enrolled Courses",
            icon: null,
            path: RoutePathConstant.private.studentEnrolledCourses,
            children: [],
            displayOrder: 2,
          },
        ],
        displayOrder: 6,
      });

      const hasReportsMenu = FinalSideBarArray.some(
        (item) => item.name === "Reports",
      );

      if (!hasReportsMenu) {
        FinalSideBarArray.push({
          id: 100022,
          parentId: 0,
          name: "Reports",
          displayName: "Reports",
          icon: "/assets/images/reports.svg",
          path: RoutePathConstant.private.clientReports,
          children: [],
          displayOrder: 7,
        });
      }
    }

    if (userType === CLIENT_ROLE.CUSTOMER && !isDefaultCpClient) {
      FinalSideBarArray = FinalSideBarArray?.filter(
        (item) => item.name !== "Subscription"
      );
    }

    FinalSideBarArray?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    setMenuTree(FinalSideBarArray);
  }, [
    buildMenuTree,
    educationPortalIcon,
    isDefaultCpClient,
    isImpersonate,
    isStudentPortalUser,
    roleName,
    userID,
    userType,
  ]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate(dashboardRoute());
    }
  }, [dashboardRoute, location.pathname, navigate]);

  useEffect(() => {
    // Auto-expand parent if a child route is active
    const matchedParent = menuTree?.find((parent) =>
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

  return (
    <div id="sidemenuMobile" className="sideMenuWrapper grey-bg">
      <div className="logoMain">
        <img
          src="/assets/images/logo.svg"
          alt=""
          loading="lazy"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(dashboardRoute())}
        />

        <Link to="#" className="closeMobile" id="closeMobile">
          <i className="bi bi-x-circle" />
        </Link>
      </div>

      <div className="leftNavHldr">
        <div className="accordion leftNavMain" id="leftNavigation">
          {!IsNullOrEmptyArray(menuTree) &&
            menuTree.map((item) => {
              const isParentActive = activeId === item.id;
              const isChildActive = item.children?.some((child) =>
                location.pathname.startsWith(child.path || "")
              );

              return (
                <div className="accordion-item" key={item.id}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <h2
                        className={`accordion-header ${
                          isChildActive ? "parent-active" : ""
                        }`}
                      >
                        <button
                          className={`accordion-button ${
                            isParentActive ? "" : "collapsed"
                          }`}
                          onClick={() => handleToggle(item.id)}
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

                          <span className="ms-1">{item.displayName}</span>
                        </button>
                      </h2>

                      <div
                        className={`accordion-collapse collapse ${
                          isParentActive ? "show" : ""
                        }`}
                      >
                        <div className="accordion-body">
                          <ul>
                            {item.children.map((subItem: MenuItem) => (
                              <li key={subItem.id}>
                                <Link
                                  className={`linkMain ${
                                    location.pathname
                                      .split("/")
                                      .slice(0, 3)
                                      .join("/")
                                      .includes(subItem.path || "") && "active"
                                  }`}
                                  to={subItem.path || ""}
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
                        className={`linkMain ${
                          location.pathname
                            .split("/")
                            .slice(0, 3)
                            .join("/")
                            .includes(item.path || "") && "active"
                        }`}
                        to={item.path ?? ""}
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
                        <span className="ms-1">{item.displayName}</span>
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

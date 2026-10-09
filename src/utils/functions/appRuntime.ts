import { CLIENT_ROLE } from "../constants/constant";
import { RoutePathConstant } from "../constants/routePaths";

export const handleErrors = (): void => {
  if (
    process.env.REACT_APP_NAME === "PRODUCTION" ||
    process.env.REACT_APP_NAME === "STAGING"
  ) {
    console.log = () => {};
    console.error = () => {};
    console.debug = () => {};
    console.warn = () => {};
  }
};

export const dashboardRoute = (userType: number): string => {
  switch (userType) {
    case CLIENT_ROLE.SUPER_ADMIN:
      return RoutePathConstant.private.dashboard;
    case CLIENT_ROLE.USER_MANAGEMENT:
    case CLIENT_ROLE.EDUCATIONAL_INSTITUTE:
      return RoutePathConstant.private.institueDashboard;
    case CLIENT_ROLE.NBFC:
      return RoutePathConstant.private.nbfcDashboard;
    case CLIENT_ROLE.STUDENT:
      return RoutePathConstant.private.studentDashboard;
    default:
      return RoutePathConstant.private.institueDashboard;
  }
};

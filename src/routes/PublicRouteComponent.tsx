import { RouteObject, useRoutes } from "react-router-dom";
import { publicRoutes } from "./Routes";

export const PublicRouteComponent = () => {
  const publicRoutesRender = useRoutes(publicRoutes as RouteObject[]);
  return <>{publicRoutesRender}</>;
};

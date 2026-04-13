import { RootState } from "../store";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { PrivateRouteComponent } from "./PrivateRouteComponent";
import { PublicRouteComponent } from "./PublicRouteComponent";
import { toasterPosition } from "../utils/constants/constant";
import { handleErrors } from "../utils/functions/shared";
import { useEffect } from "react";

const AppRoutes = () => {
  const { isLogin } = useSelector((state: RootState) => state.auth);

  handleErrors();

  useEffect(() => {
    if (window.self !== window.top) {
      document.body.innerHTML = "<h1>Clickjacking Attempt Detected</h1>";
    }
  }, []);

  return (
    <>
      <Toaster position={toasterPosition} />
      {isLogin ? <PrivateRouteComponent /> : <PublicRouteComponent />}
    </>
  );
};

export default AppRoutes;

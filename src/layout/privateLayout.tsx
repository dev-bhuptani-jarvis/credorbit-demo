import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../pages/dashboard/DashboardHeader";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  getWhiteLabelPreviewSettings,
  shouldApplyWhiteLabelBranding,
  subscribeWhiteLabelPreviewChange,
} from "../utils/functions/whiteLabelBranding";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { useEffect, useState } from "react";
import { IGetWhiteLabelSettingsByUserIdResponseData } from "../interface/whiteLabel";

const PrivateLayout = () => {
  const { userType, whiteLabelSettings } = useSelector((state: RootState) => state.user.user);

  const [previewSettings, setPreviewSettings] =
    useState<IGetWhiteLabelSettingsByUserIdResponseData | null>(
      getWhiteLabelPreviewSettings(),
    );

  useEffect(() => {
    const syncPreviewSettings = (): void => {
      setPreviewSettings(getWhiteLabelPreviewSettings());
    };

    syncPreviewSettings();

    return subscribeWhiteLabelPreviewChange(syncPreviewSettings);
  }, []);

  const effectiveWhiteLabelSettings = previewSettings || whiteLabelSettings;

  const isWhiteLabelFeatureActive = shouldApplyWhiteLabelBranding(effectiveWhiteLabelSettings);

  return (
    <>
      <Sidebar />
      <section className="rightMainWrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 col-md-12 col-sm-12 col-12">
              <DashboardHeader />
              <Outlet />
            </div>
          </div>
        </div>
        {userType !== CLIENT_ROLE.SUPER_ADMIN && isWhiteLabelFeatureActive && (
          <div className="text-center text-black py-3">
            Powered by Credorbit
          </div>
        )}
      </section>
    </>
  );
};

export default PrivateLayout;

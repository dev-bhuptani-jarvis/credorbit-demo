import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../pages/dashboard/DashboardHeader";

const PrivateLayout = () => {
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
      </section>
    </>
  );
};

export default PrivateLayout;

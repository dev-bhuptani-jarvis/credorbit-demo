/* eslint-disable react-hooks/exhaustive-deps */
import {
  CLIENT_ROLE,
  formatDecimalValue,
} from "../../utils/constants/constant";
import { Link, useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useEffect, useState } from "react";
import { getAdminDashboardAPI } from "../../utils/axios/apiServices";
import {
  IAdminDashboardData,
  IAdminDashboardResponse,
  ITotalCountByStatus,
  ITotalNoOfUsers,
} from "../../interface/adminDashboard";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import Loader from "../../components/Loader";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import TableTitle from "../../components/TableTitle";
import { toastError } from "../../utils/functions/shared";
import { Button } from "primereact/button";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const AdminDashboard = () => {
  const [adminInfo, setAdminInfo] = useState<IAdminDashboardData>();

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const { userName, userType } = useSelector(
    (state: RootState) => state.user.user,
  );

  const fetchDashboardDetail = async (): Promise<void> => {
    setLoading(true);

    const response: IAdminDashboardResponse = await getAdminDashboardAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        demographicsData: response.data.demographicsData.map((item) => ({
          ...item,
          state: item.state ? decryptVAPTData(item.state) : "",
        })),
      };

      setAdminInfo(decryptedData);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const dashboardRoute = (): void => {
    if (userType === CLIENT_ROLE.SUPER_ADMIN) {
      navigate(RoutePathConstant.private.dashboard);
    } else if (userType === CLIENT_ROLE.CUSTOMER) {
      navigate(RoutePathConstant.private.clientDashboard);
    } else if (userType === CLIENT_ROLE.SOURCING_PARTNER) {
      navigate(RoutePathConstant.private.userMasterClientMaster);
    } else {
      navigate(RoutePathConstant.private.channelPartnerDashboard);
    }
  };

  const chartColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A6",
    "#FFC733",
    "#57FF33",
    "#33FFF3",
    "#A633FF",
    "#FF8333",
    "#33FF83",
    "#8333FF",
    "#FF3383",
    "#FF3D33",
    "#3DFF33",
    "#333DFF",
    "#FF3D83",
    "#83FF33",
    "#33A6FF",
    "#FF33C7",
    "#A6FF33",
  ];

  const dataLength: number = adminInfo?.demographicsData?.length ?? 0;
  const chartHeight = dataLength <= 10 ? 10 : dataLength <= 20 ? 20 : 30;

  const chartData = {
    chart: {
      type: "bar",
      height: 50 * chartHeight,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: adminInfo?.demographicsData.map((item) => item.state || "-"),
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Applications",
      },
    },
    plotOptions: {
      series: {
        animation: false,
        groupPadding: 0.2,
        pointPadding: 0.05,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
        },
        pointWidth: 50,
      },
    },
    tooltip: {
      headerFormat: "",
      pointFormat: "{point.name}: <b>{point.y}</b>",
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: "Loan Applications",
        data: adminInfo?.demographicsData.map((item, index) => ({
          name: item.state || "-",
          y: item.noOfLoanApplications,
          color: chartColors[index % chartColors.length],
        })),
      },
    ],
  };

  useEffect(() => {
    fetchDashboardDetail();
    dashboardRoute();
  }, []);

  return (
    <div className="whiteBoxHldr p-30">
      <Loader isLoading={loading} />
      <div className="row">
        {
          <div className="col-lg-12 mb-4">
            <div className="titleMainWrapper">
              <h2 className="fw-bold txt-30">
                <span>Welcome,</span> {userName}
              </h2>
            </div>
          </div>
        }

        {!IsNullOrEmptyArray(adminInfo?.totalCountByStatus || []) && (
          <div className="col-12 ApplicationsBoxWrapper mt-4">
            <TableTitle title="Loan Applications" />
            <div className="row">
              {adminInfo?.totalCountByStatus.map(
                (applicationStatus: ITotalCountByStatus) => {
                  return (
                    <div
                      key={applicationStatus.displayName}
                      className="col-lg-4 col-md-4 col-sm-6 col-12 mt-4"
                    >
                      <div className="applicationBoxHldr">
                        <div className="amoutnHldr">
                          <h2 className="fw-bold">
                            {applicationStatus.noOfApplications}
                          </h2>
                          {applicationStatus.formattedAmount && (
                            <p className="txt-20">
                              Amount: ₹
                              {formatDecimalValue(
                                applicationStatus.formattedAmount,
                              )}
                            </p>
                          )}
                        </div>
                        <h3 className="fw-bold">
                          {applicationStatus.displayName}
                        </h3>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {!IsNullOrEmptyArray(adminInfo?.usersInfo || []) && (
          <div className="col-12 ApplicationsBoxWrapper mt-5">
            <TableTitle title="Total Users" />
            <div className="row">
              {adminInfo?.usersInfo.map((userInfo: ITotalNoOfUsers) => {
                return (
                  <div
                    className="col-lg-4 col-md-4 col-sm-6 col-12 mt-4"
                    key={userInfo.userType}
                    style={{
                      cursor:
                        userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER
                          ? "pointer"
                          : "default",
                    }}
                    onClick={() => {
                      if (userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER) {
                        navigate(
                          RoutePathConstant.private.userMasterChannelPartner,
                        );
                      }
                    }}
                  >
                    <div className="applicationBoxHldr">
                      <div className="amoutnHldr">
                        <h2>{userInfo.count}</h2>
                      </div>
                      <h3 className="fw-bold">{userInfo.name}</h3>
                      {userInfo.userType === CLIENT_ROLE.CHANNEL_PARTNER && (
                        <div className="clickNext">
                          <i className="bi bi-arrow-right" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!IsNullOrEmptyArray(adminInfo?.demographicsData || []) && (
          <div className="col-12 ApplicationsBoxWrapper mt-5">
            <div className="col-lg-12">
              <div className="col-12 mb-4 titleBtnWrapper">
                <TableTitle title="Geographical Applications" />

                <div className="BtnRightHldr">
                  <div className="form-group">
                    <Button
                      className={`btn ${
                        loading ? "btn-orange-disabled" : "btn-orange"
                      } w-100`}
                      onClick={() =>
                        navigate(RoutePathConstant.private.geographicalReport)
                      }
                      disabled={loading}
                    >
                      <div className="d-flex gap-2">
                        View All
                        <i className="bi bi-arrow-right" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <HighchartsReact highcharts={Highcharts} options={chartData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

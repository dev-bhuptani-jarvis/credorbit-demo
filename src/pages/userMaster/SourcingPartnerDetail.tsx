import { useEffect, useState } from "react";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
  RouteParams,
} from "../../utils/constants/constant";
import { useNavigate, useParams } from "react-router-dom";
import {
  ICustomerListData,
  ISourcingPartnerDetailsData,
  ISourcingPartnerDetailsResponse,
  ISourcingPartnerParams,
} from "../../interface/sourcingPartner";
import {
  getClientMasterAPI,
  getSourcingPartnerDetailAPI,
  updatePayOutsDetailsAPI,
} from "../../utils/axios/apiServices";
import {
  formatDate,
  shouldShowContractModal,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { InputText } from "primereact/inputtext";
import { PaginateReqEntity } from "../../interface/pagination";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import BackButton from "../../components/BackButton";
import {
  ICategoryList,
  IClientMaster,
  IClientMasterListingParams,
  IClientMasterResponse,
} from "../../interface/clientMaster";
import useDebouncedEffect from "../../hooks/useDebounce";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { useSelector } from "react-redux";
import { FloatLabel } from "primereact/floatlabel";
import { NUMBER_WITH_SINGLE_DOT_PATTERN } from "../../utils/constants/pattern";
import { APIResponseEntity } from "../../interface/apiResponse";
import { RootState } from "../../store";
import SearchButton from "../../components/SearchButton";
import { Dropdown } from "primereact/dropdown";
import AddPanModal from "../../components/AddPanModal";
import ImpersonateUserModal from "../../components/ImpersonateUserModal";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import { Tooltip } from "primereact/tooltip";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const SourcingPartnerDetail = () => {
  const [sourcingPartnerDetail, setSourcingPartnerDetail] =
    useState<ISourcingPartnerDetailsData>();

  const [payOutError, setPayOutError] = useState<string>("");

  const [sourcingFilterReq, setSourcingFilterReq] = useState<PaginateReqEntity>(
    {
      pageNumber: 0,
      pageSize: 10,
      searchText: "",
      status: "",
    },
  );

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const { id } = useParams<RouteParams>();

  const [clientList, setClientList] = useState<IClientMaster[]>([]);

  const [clientCategoryList, setClientCategoryList] = useState<ICategoryList[]>(
    [],
  );

  const [panDetailPopUp, setPanDetailPopUp] = useState<boolean>(false);

  const [impersonateId, setImpersonateId] = useState<string>("");

  const [impersonateModal, setImpersonateModal] = useState<boolean>(false);

  const { view } = usePermission("SourcingPartner", ["view"])();

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [updatedPayOutPercent, setUpdatedPayOutPercent] = useState<
    string | null
  >(null);

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const {
    userType,
    showPanDetailPopUp,
    isContractSigned,
    contractEnforcementDate,
  } = useSelector((state: RootState) => state.user.user);

  const { isProfileUpdated } = useSelector((state: RootState) => state.profile);

  const navigate = useNavigate();

  const fetchClientListingApi = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const queryParams: IClientMasterListingParams = {
      parentID: id,
      page: sourcingFilterReq.pageNumber + 1,
      pageSize: sourcingFilterReq.pageSize,
    };

    if (sourcingFilterReq.searchText?.trim()) {
      queryParams.customerName = sourcingFilterReq.searchText?.trim();
    }

    if (sourcingFilterReq.status) {
      queryParams.categoryID = sourcingFilterReq.status;
    }

    const response: IClientMasterResponse =
      await getClientMasterAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = response.data.customersList.map((partner) => ({
        ...partner,
        phoneNumber: partner.phoneNumber
          ? decryptVAPTData(partner.phoneNumber)
          : "",
      }));

      setTotalRecords(response.data.totalCount);
      setClientList(decryptedData);
      setClientCategoryList(response.data.categoryList);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const fetchSourcingPartnerDetailApi = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const queryParams: ISourcingPartnerParams = {
      userID: id,
    };

    const response: ISourcingPartnerDetailsResponse =
      await getSourcingPartnerDetailAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        mobileNumber: response.data.mobileNumber
          ? decryptVAPTData(response.data.mobileNumber)
          : "",
        email: response.data.email ? decryptVAPTData(response.data.email) : "",
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "",
      };

      setSourcingPartnerDetail(decryptedData);
      setUpdatedPayOutPercent(
        response.data.payOuts ? String(response.data.payOuts) : "0",
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleImpersonate = (userId: string): void => {
    setImpersonateId(userId);
    setImpersonateModal(true);
  };

  const statusBodyTemplate = (rowData: ICustomerListData): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const actionBody = (sourcingPartner: ICustomerListData): JSX.Element => {
    const viewId = `client-view-${sourcingPartner.id}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />

        {view && (
          <Button
            id={viewId}
            className="trash-icon p-0 ms-3"
            data-pr-tooltip="View Client"
            onClick={() =>
              navigate(
                `${RoutePathConstant.private.userMasterClientMaster}/${sourcingPartner.id}`,
              )
            }
          >
            <img src="/assets/images/eye.svg" alt="eye-icon" />
          </Button>
        )}
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setSourcingFilterReq({
      ...sourcingFilterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!updatedPayOutPercent || updatedPayOutPercent.trim() === "") {
      setPayOutError("Payout percentage is required");
      return;
    }

    setLoading(true);

    const body: {
      userID: string;
      percent: number;
    } = {
      userID: String(sourcingPartnerDetail?.id),
      percent: Number(updatedPayOutPercent),
    };

    const response: APIResponseEntity = await updatePayOutsDetailsAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      setIsEditable(false);
      setUpdatedPayOutPercent(null);
      fetchSourcingPartnerDetailApi();
    }

    setLoading(false);
  };

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setSourcingFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText],
  );

  useEffect(() => {
    fetchSourcingPartnerDetailApi();
  }, [id]);

  useEffect(() => {
    fetchClientListingApi();
  }, [
    sourcingFilterReq.pageNumber,
    sourcingFilterReq.pageSize,
    sourcingFilterReq.status,
    sourcingFilterReq.searchText,
    isProfileUpdated,
  ]);

  return (
    <>
      <div className="row">
        <Loader isLoading={loading} />
        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
          <div className="whiteBoxHldr p-30">
            <div className="row">
              <div className="col-12">
                <h2 className="txt-24">Sourcing Partner</h2>

                <div className="row">
                  <div className="col-12 mt-4 mb-4">
                    <div className="borderBoxHldr p-24">
                      <div className="row mt-3">
                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Sourcing Partner Code</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.code}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>Sourcing Partner Code</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.code}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Sourcing Partner Name</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.name}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>Sourcing Partner Name</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.name}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Mobile Number</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.mobileNumber}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>Mobile Number</b>
                              <p className="text-break">
                                {formatMobileNumber(
                                  sourcingPartnerDetail?.mobileNumber,
                                )}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Email</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.email}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>Email</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.email}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Channel Partner</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.channelPartner}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>Channel Partner</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.channelPartner}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>PAN Number</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={sourcingPartnerDetail?.panNumber}
                                disabled
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <>
                              <b>PAN Number</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.panNumber}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <FloatLabel>
                              <span>
                                Payout(%)<sup className="text-danger">*</sup>
                              </span>
                              <InputText
                                variant="filled"
                                id="payOuts"
                                className="form-control h-50px"
                                value={
                                  updatedPayOutPercent !== null
                                    ? String(updatedPayOutPercent)
                                    : String(sourcingPartnerDetail?.payOuts)
                                }
                                onChange={(e) => {
                                  const value = e.target.value.trim();

                                  if (
                                    NUMBER_WITH_SINGLE_DOT_PATTERN.test(value)
                                  ) {
                                    setUpdatedPayOutPercent(value);
                                    setPayOutError("");
                                  } else {
                                    setPayOutError("Invalid payout format");
                                  }
                                }}
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                              />

                              {payOutError && (
                                <small className="error">{payOutError}</small>
                              )}
                            </FloatLabel>
                          ) : (
                            <>
                              <b>Payout(%)</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.payOuts.toFixed(2)}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                          {isEditable ? (
                            <>
                              <span>Loans Completed</span>
                              <InputText
                                variant="filled"
                                className="form-control h-50px"
                                value={(
                                  sourcingPartnerDetail?.loansCompleted as number
                                ).toString()}
                                // onPaste={(e) => e.preventDefault()}
                                // onCopy={(e) => e.preventDefault()}
                                // onCut={(e) => e.preventDefault()}
                                disabled
                              />
                            </>
                          ) : (
                            <>
                              <b>Loans Completed</b>
                              <p className="text-break">
                                {sourcingPartnerDetail?.loansCompleted}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditable &&
                        (userType === CLIENT_ROLE.CHANNEL_PARTNER ||
                          userType === CLIENT_ROLE.USER_MANAGEMENT) && (
                          <Button
                            className="edit-icon payout-icon"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                            }}
                            onClick={() => setIsEditable(true)}
                          >
                            <img
                              src="/assets/images/pencil.svg"
                              alt="edit-icon"
                              loading="lazy"
                            />
                          </Button>
                        )}
                    </div>
                  </div>

                  {isEditable && (
                    <div className="col-lg-3 col-md-3 col-sm-6 col-12 mb-4">
                      <Button
                        className="btn btn-orange"
                        onClick={handleSave}
                        label="Save"
                      />

                      <Button
                        className="btn btn-black-line ms-2"
                        onClick={() => {
                          setIsEditable(false);
                          setUpdatedPayOutPercent(null);
                          fetchSourcingPartnerDetailApi();
                          setPayOutError("");
                        }}
                        label="Cancel"
                      />
                    </div>
                  )}

                  <div className="col-12">
                    <div className="form-group d-flex gap-3">
                      <div style={{ width: "300px" }}>
                        <SearchButton
                          searchText={searchText}
                          setSearchText={setSearchText}
                          placeholder="Search by Client"
                        />
                      </div>
                      <Dropdown
                        style={{ width: "300px" }}
                        value={sourcingFilterReq.status}
                        onChange={(e) =>
                          setSourcingFilterReq({
                            ...sourcingFilterReq,
                            status: e.value,
                          })
                        }
                        showClear={sourcingFilterReq.status !== ""}
                        options={clientCategoryList
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((category) => ({
                            label: category.name,
                            value: category.id,
                          }))}
                        placeholder="Select Category"
                      />
                    </div>

                    <div className="whiteBoxHldr mt-3">
                      <div className="table-responsive">
                        <DataTable
                          className="tableMain"
                          key={clickCounter}
                          value={clientList}
                          emptyMessage="No Client Found"
                        >
                          <Column field="customerCode" header="Client Code" />

                          <Column
                            body={(rowData: IClientMaster) => {
                              const isClickable = view;
                              const tooltipId = `tooltip-${rowData.id}`;

                              const style: React.CSSProperties = {
                                cursor: isClickable ? "pointer" : "default",
                                fontWeight: isClickable ? "bold" : "normal",
                              };
                              return (
                                <>
                                  <span
                                    id={tooltipId}
                                    style={style}
                                    onClick={() => {
                                      if (!isClickable) return;

                                      if (
                                        !isContractSigned &&
                                        !hasSkippedContractAgreement &&
                                        shouldShowContractModal(
                                          contractEnforcementDate,
                                        )
                                      ) {
                                        setShowContractAgreement(true);
                                      } else {
                                        if (showPanDetailPopUp) {
                                          setPanDetailPopUp(true);
                                        } else {
                                          handleImpersonate(rowData.id);
                                        }
                                      }
                                    }}
                                  >
                                    {rowData.fullName}
                                  </span>
                                  {isClickable && (
                                    <Tooltip
                                      target={`#${tooltipId}`}
                                      content="Login as Client"
                                      position="top"
                                    />
                                  )}
                                </>
                              );
                            }}
                            header="Client Name"
                          />

                          <Column
                            body={(rowData) => formatDate(rowData.createdDate)}
                            header="Registered Date"
                          />

                          <Column
                            body={(rowData: ICustomerListData) =>
                              formatMobileNumber(rowData.phoneNumber)
                            }
                            header="Mobile Number"
                          />

                          <Column body={statusBodyTemplate} header="Status" />

                          {view && <Column body={actionBody} header="Action" />}
                        </DataTable>
                      </div>

                      {!IsNullOrEmptyArray(clientList) && (
                        <PrimePaginator
                          onPageChange={onPageChange}
                          pageNumber={sourcingFilterReq.pageNumber}
                          pageSize={sourcingFilterReq.pageSize}
                          totalRecords={totalRecords}
                        />
                      )}

                      <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-5">
                        <BackButton />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddPanModal
        panDetailPopUp={panDetailPopUp}
        setPanDetailPopUp={setPanDetailPopUp}
        showPartnerOption={String(showPanDetailPopUp) === "true" ? false : true}
        targetUser={CLIENT_ROLE.CUSTOMER}
      />

      <ContractAgreementModal
        showContractAgreement={
          showContractAgreement &&
          shouldShowContractModal(contractEnforcementDate)
        }
        setShowContractAgreement={(value) => {
          if (!value) {
            setHasSkippedContractAgreement(true);
            setClickCounter((prev) => prev + 1);
          }
          setShowContractAgreement(value);
        }}
      />

      <ImpersonateUserModal
        impersonateModal={impersonateModal}
        setImpersonateModal={setImpersonateModal}
        impersonateId={impersonateId}
      />
    </>
  );
};

export default SourcingPartnerDetail;

import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import {
  IUserDataResponse,
  IUserMasterListParams,
  IUsersData,
} from "../../interface/userManagement";
import { shouldShowContractModal, toastError } from "../../utils/functions/shared";
import { getUserListingAPI } from "../../utils/axios/apiServices";
import { Button } from "primereact/button";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useNavigate } from "react-router-dom";
import usePermission from "../../hooks/usePermission";
import TableTitle from "../../components/TableTitle";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ContractAgreementModal from "../../components/ContractAgreementModal";
import {
  CLIENT_ROLE,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import SearchButton from "../../components/SearchButton";
import useDebouncedEffect from "../../hooks/useDebounce";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { Tooltip } from "primereact/tooltip";

const UserManagement = () => {
  const [usersData, setUsersData] = useState<IUsersData[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [clickCounter, setClickCounter] = useState<number>(0);

  const { isContractSigned, contractEnforcementDate, userType } = useSelector(
    (state: RootState) => state.user.user
  );

  const [showContractAgreement, setShowContractAgreement] =
    useState<boolean>(false);

  const [hasSkippedContractAgreement, setHasSkippedContractAgreement] =
    useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>("");

  const navigate = useNavigate();

  const { view, create } = usePermission("UserManagement", [
    "view",
    "create",
  ])();

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const fetchUserDataListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IUserMasterListParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
    };

    if (filterReq.searchText?.trim()) {
      queryParams.search = filterReq.searchText?.trim();
    }

    const response: IUserDataResponse = await getUserListingAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const updatedUserData = response.data.userManagementList.map((user) => {
        return {
          ...user,
          firstName: user.userName.split(" ")[0],
          lastName: user.userName.split(" ")[1],
        };
      });

      const decryptedUserData = updatedUserData.map((user) => {
        return {
          ...user,
          email: user.email ? decryptVAPTData(user.email) : "",
          mobileNumber: user.mobileNumber ? decryptVAPTData(user.mobileNumber) : "",
        };
      });

      setUsersData(decryptedUserData);

      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const actionTemplate = (user: IUsersData) => {
  const viewId = `user-view-${user.userID}`;
  const editId = `user-edit-${user.userID}`;
  const rightsId = `user-rights-${user.userID}`;

  return (
    <>
      <Tooltip target={`#${viewId}`} position="top" />
      <Tooltip target={`#${editId}`} position="top" />
      <Tooltip target={`#${rightsId}`} position="top" />

      {view && (
        <Button
          id={viewId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="View User"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.userManagement}/view/${user.userID}`
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="eye-icon" />
        </Button>
      )}

      {create && (
        <Button
          id={editId}
          className="trash-icon p-0 ms-2"
          data-pr-tooltip="Edit User"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.userManagement}/edit/${user.userID}`
            )
          }
        >
          <img src="/assets/images/pencil.svg" alt="edit-icon" />
        </Button>
      )}

      {create && (
        <Button
          id={rightsId}
          className="trash-icon p-0 ms-2 me-2"
          data-pr-tooltip="Assign Rights"
          onClick={() =>
            navigate(
              `${RoutePathConstant.private.userManagement}/rights/${user.userID}`
            )
          }
        >
          <img
            src="/assets/images/security-user.svg"
            alt="security-user-icon"
          />
        </Button>
      )}
    </>
  );
};

  const statusBodyTemplate = (user: IUsersData): JSX.Element => {
    const statusClass = user.status ? "greenLine" : "redLine";
    const statusText = user.status ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText]
  );

  useEffect(() => {
    fetchUserDataListingApi();
  }, [filterReq.pageNumber, filterReq.pageSize, filterReq.searchText]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <TableTitle title="Users" />

            <div className="BtnRightHldr">
              <div className="form-group">
                <div className="col-12 d-flex justify-content-between mb-4">
                  <SearchButton
                    searchText={searchText}
                    setSearchText={setSearchText}
                    placeholder="Search by User"
                  />
                  {create && (
                    <Button
                      className="btn btn-orange"
                      onClick={() => {
                        if (
                          !(userType === CLIENT_ROLE.USER_MANAGEMENT) &&
                          !isContractSigned &&
                          !hasSkippedContractAgreement &&
                          shouldShowContractModal(contractEnforcementDate)
                        ) {
                          setShowContractAgreement(true);
                        } else {
                          navigate(
                            RoutePathConstant.private.userManagementCreate
                          );
                        }
                      }}
                      label="Add User"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          key={clickCounter}
          className="tableMain"
          value={usersData}
          emptyMessage="No users found"
        >
          <Column field="firstName" header="First Name" />

          <Column field="lastName" header="Last Name" />

          <Column
            body={(rowData: IUsersData) => rowData.roleName || "-"}
            header="Role"
          />

          <Column field="designation" header="Designation" />

          <Column field="email" header="Email ID" />

          <Column
            body={(rowData: IUsersData) =>
              formatMobileNumber(rowData.mobileNumber)
            }
            header="Mobile Number"
          />

          <Column body={statusBodyTemplate} header="Status" />

          {(create || view) && <Column body={actionTemplate} header="Action" />}
        </DataTable>
      </div>

      {!IsNullOrEmptyArray(usersData) && (
        <PrimePaginator
          onPageChange={onPageChange}
          pageNumber={filterReq.pageNumber}
          pageSize={filterReq.pageSize}
          totalRecords={totalRecords}
        />
      )}

      <ContractAgreementModal
        showContractAgreement={showContractAgreement && shouldShowContractModal(contractEnforcementDate)}
        setShowContractAgreement={(value) => {
          if (!value) {
            setHasSkippedContractAgreement(true);
            setClickCounter((prev) => prev + 1);
          }
          setShowContractAgreement(value);
        }}
      />
    </div>
  );
};

export default UserManagement;

import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { useEffect, useState } from "react";
import { deleteRoleApi, getRoleMasterAPI } from "../../utils/axios/apiServices";
import {
  IRoleList,
  IRoleMasterListParams,
  IRoleMasterResponse,
  IRoleParams,
} from "../../interface/roleMaster";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PaginateReqEntity } from "../../interface/pagination";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import { IsNullOrEmptyArray } from "../../utils/functions/nullCheck";
import { APIResponseEntity } from "../../interface/apiResponse";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CLIENT_ROLE } from "../../utils/constants/constant";
import TableTitle from "../../components/TableTitle";
import { Tooltip } from "primereact/tooltip";

const RoleMaster = () => {
  const [roleMaster, setRoleMaster] = useState<IRoleList[]>([]);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
  });

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const [deleteId, setDeleteId] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const { view, create } = usePermission("RoleMaster", ["view", "create"])();

  const { userType, userID } = useSelector(
    (state: RootState) => state.user.user
  );

  const fetchRoleListingApi = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IRoleMasterListParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      isMasterRole: userType === CLIENT_ROLE.SUPER_ADMIN,
    };

    if (userType !== CLIENT_ROLE.SUPER_ADMIN) {
      queryParams.linkedUserID = userID;
    }

    const response: IRoleMasterResponse = await getRoleMasterAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setRoleMaster(response.data.rolesList);
      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const statusBodyTemplate = (rowData: IRoleList): JSX.Element => {
    const statusClass = rowData.isActive ? "greenLine" : "redLine";
    const statusText = rowData.isActive ? "Active" : "Inactive";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const handleDelete = (roleID: number): void => {
    setDeleteId(roleID);
    setDeleteModal(true);
  };

  const handleDeleteRole = async (): Promise<void> => {
    setLoading(true);

    const payload = {
      roleID: deleteId,
    };

    const response: APIResponseEntity = await deleteRoleApi(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);

      const shouldMoveToPreviousPage =
        roleMaster.length === 1 && filterReq.pageNumber > 0;

      if (shouldMoveToPreviousPage) {
        setFilterReq((prev) => ({
          ...prev,
          pageNumber: prev.pageNumber - 1,
        }));
      } else {
        fetchRoleListingApi();
      }
    } else {
      toastError(response.message);
    }

    setDeleteModal(false);

    setLoading(false);
  };

  const actionTemplate = (role: IRoleParams) => {
    const viewId = `role-view-${role.roleID}`;
    const editId = `role-edit-${role.roleID}`;
    const deleteId = `role-delete-${role.roleID}`;

    return (
      <>
        <Tooltip target={`#${viewId}`} position="top" />
        <Tooltip target={`#${editId}`} position="top" />
        <Tooltip target={`#${deleteId}`} position="top" />

        {view && (
          <Button
            id={viewId}
            className="trash-icon p-0 ms-2"
            data-pr-tooltip="View Role"
            onClick={() =>
              navigate(
                `${RoutePathConstant.private.roleMaster}/view/${role.roleID}`
              )
            }
          >
            <i className="icon-eye" />
          </Button>
        )}

        {create && (
          <Button
            id={editId}
            className="trash-icon p-0 ms-2"
            data-pr-tooltip="Edit Role"
            onClick={() =>
              navigate(
                `${RoutePathConstant.private.roleMaster}/edit/${role.roleID}`
              )
            }
          >
            <i className="icon-edit" />
          </Button>
        )}

        {userType === CLIENT_ROLE.USER_MANAGEMENT && (
          <Button
            id={deleteId}
            className="trash-icon p-0 ms-2"
            data-pr-tooltip="Delete Role"
            onClick={() => handleDelete(role.roleID)}
          >
            <i className="bi bi-trash" style={{ fontSize: '22px' }} />
          </Button>
        )}
      </>
    );
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100 text-center"
        disabled={loading}
        onClick={() => setDeleteModal(false)}
        label="Cancel"
      />

      <Button
        className={`btn ${loading ? "btn-orange-disabled" : "btn-orange"
          } w-100 text-center`}
        disabled={loading}
        onClick={handleDeleteRole}
        label="Delete"
      />
    </div>
  );

  useEffect(() => {
    fetchRoleListingApi();
  }, [filterReq]);

  return (
    <>
      <div className="col-12">
        <div className="whiteBoxHldr p-24">
          <Loader isLoading={loading} />
          <div className="row">
            <div className="col-lg-12">
              <div className="col-12 mb-4 titleBtnWrapper">
                <TableTitle title="Role" />

                <div className="BtnRightHldr">
                  <div className="form-group">
                    {create && (
                      <Button
                        className="btn btn-orange"
                        onClick={() =>
                          navigate(RoutePathConstant.private.roleMasterCreate)
                        }
                        label="Add Role"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <DataTable
              className="tableMain"
              value={roleMaster}
              emptyMessage="No Role Found"
            >
              <Column
                header="Sr. No."
                body={(rowData, options) =>
                  filterReq.pageNumber * filterReq.pageSize +
                  options.rowIndex +
                  1
                }
              />
              <Column field="roleName" header="Role Name" />

              <Column body={statusBodyTemplate} header="Status" />

              {(create || view) && (
                <Column body={actionTemplate} header="Action" />
              )}
            </DataTable>
          </div>

          {!IsNullOrEmptyArray(roleMaster) && (
            <PrimePaginator
              onPageChange={onPageChange}
              pageNumber={filterReq.pageNumber}
              pageSize={filterReq.pageSize}
              totalRecords={totalRecords}
            />
          )}
        </div>
      </div>

      <Dialog
        header="Delete Role"
        visible={deleteModal}
        className="modalWrapper"
        onHide={() => {
          setDeleteModal(false);
        }}
        blockScroll
        draggable={false}
        resizable={false}
        footer={footerContent}
        style={{ width: "500px" }}
      >
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3">Are you sure you want to delete this role ?</p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default RoleMaster;

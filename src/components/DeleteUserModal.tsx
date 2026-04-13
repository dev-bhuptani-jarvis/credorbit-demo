import { Dialog } from "primereact/dialog";
import { deleteUser } from "../utils/axios/apiServices";
import { toastSuccess } from "../utils/functions/shared";
import { Button } from "primereact/button";
import { ILogoutResponse } from "../interface/logout";
import { IDeleteUser } from "../interface/userData";

interface DeleteModalProps {
  deleteModal: boolean;
  setDeleteModal: (value: boolean) => void;
  deleteId: string;
  fetchListingAPI: () => Promise<void>;
  targetUser: number;
  targetUserName: string;
}

const DeleteUserModal = ({
  deleteModal,
  setDeleteModal,
  deleteId,
  fetchListingAPI,
  targetUser,
  targetUserName,
}: DeleteModalProps) => {
  const handleDelete = async (): Promise<void> => {
    setDeleteModal(true);

    const body: IDeleteUser = {
      userId: deleteId,
      userType: targetUser!,
    };

    const response: ILogoutResponse = await deleteUser(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);

      fetchListingAPI();

      setDeleteModal(false);
    }
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        onClick={() => setDeleteModal(false)}
      >
        No
      </Button>

      <Button className="btn btn-orange w-100" onClick={handleDelete}>
        Yes
      </Button>
    </div>
  );

  return (
    <Dialog
      header={`Delete ${targetUserName}`}
      visible={deleteModal}
      className="modalWrapper"
      onHide={() => setDeleteModal(false)}
      draggable={false}
      resizable={false}
      footer={footerContent}
      style={{ width: "500px" }}
      blockScroll
    >
      <div className="modal-content">
        <div className="modal-body">
          <p className="mb-3 modal-text">Are you sure you want to delete?</p>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteUserModal;

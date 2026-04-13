import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { toastError, toastSuccess } from "../utils/functions/shared";
import { IsNullOrUndefined } from "../utils/functions/nullCheck";
import { uploadAllDocumentsAPI } from "../utils/axios/apiServices";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { useNavigate } from "react-router-dom";
import { APIResponseEntity } from "../interface/apiResponse";
import { environment } from "../utils/constants/environments";
import { allowedZipMimeTypes } from "../utils/constants/constant";
import { IBankInfo } from "../interface/applyLoan";

interface UploadLoanModalProps {
  uploadModal: boolean;
  setUploadModal: (visible: boolean) => void;
  locationState: { loanType: number; loanApp: string };
  bankInfo: IBankInfo;
  setShowDocumentFlow: (val: boolean) => void;
}

const UploadDocumentModal = ({
  uploadModal,
  setUploadModal,
  locationState,
  bankInfo,
  setShowDocumentFlow,
}: UploadLoanModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [isUploadModalVisible, setIsUploadModalVisible] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const handleCloseLoginModal = () => {
    setUploadModal(false);
    setIsUploadModalVisible(false);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalVisible(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setLoading(true);

    const file = event.target.files?.[0];

    if (!file) {
      toastError("No file selected.");
      setLoading(false);
      event.target.value = "";
      return;
    }

    const MAX_FILE_SIZE = environment.DOCUMENT_FILE_SIZE * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      toastError(
        `File size exceeds the ${environment.DOCUMENT_FILE_SIZE} MB limit. Please upload a smaller file.`,
      );
      setLoading(false);
      event.target.value = "";
      return;
    }

    const isValidFileExtension =
      file.name.toLowerCase().endsWith(".zip") ||
      file.name.toLowerCase().endsWith(".rar");

    const isValidMimeType = allowedZipMimeTypes.includes(file.type);

    if (!isValidFileExtension || !isValidMimeType) {
      toastError("Please upload a valid ZIP or RAR file.");
      setLoading(false);
      event.target.value = "";
      return;
    }

    const formData: FormData = new FormData();

    if (file && !IsNullOrUndefined(file)) {
      formData.append("uploadedFile", file);
    }

    formData.append("loanTypeID", String(locationState.loanType));

    formData.append("loanApplicationID", locationState.loanApp);

    try {
      const response: APIResponseEntity = await uploadAllDocumentsAPI(formData);

      if (!response) return;

      if (response && response.statusCode === 200) {
        toastSuccess(response.message);
        navigate(RoutePathConstant.private.documents, {
          state: { ...locationState, bankInfo },
        });
      } else {
        toastError(response.message);
        event.target.value = "";
      }

      setLoading(false);
    } catch (error) {
      event.target.value = "";
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!uploadModal) {
      setIsUploadModalVisible(false);
    }
  }, [uploadModal]);

  return (
    <>
      <Loader isLoading={loading} />

      <Dialog
        header="Login Application"
        visible={uploadModal}
        modal
        onHide={handleCloseLoginModal}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={handleCloseLoginModal}
              label="Cancel"
            />

            <Button
              className="btn btn-orange w-100 text-center"
              onClick={() => setIsUploadModalVisible(true)}
              label="Upload"
            />
          </div>
        }
        style={{ width: "500px" }}
      >
        <p>
          For further loan application you need to upload the document, please
          upload the document first.
        </p>
      </Dialog>

      <Dialog
        header=""
        visible={isUploadModalVisible}
        modal
        onHide={handleCloseUploadModal}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        style={{ width: "700px" }}
        blockScroll
      >
        <Loader isLoading={loading} />

        <div className="modal-body text-center">
          <h2 className="txt-22">Apply For Loan</h2>

          <p>
            Please upload the ZIP file containing all the required documents.
          </p>

          <div className="uploadFileWrapper">
            <img
              src="/assets/images/upload-cloud.svg"
              alt="upload-icon"
              loading="lazy"
            />

            <p>Upload the document ZIP or RAR files</p>

            <label className="btn btn-black-line" htmlFor="documentupload">
              Upload File
            </label>

            <InputText
              type="file"
              id="documentupload"
              accept=".zip,.rar"
              onChange={handleFileUpload}
              className="d-none"
            />
          </div>
        </div>

        {!loading && (
          <div className="modal-footer gap-3 mt-3">
            <Button
              className="btn btn-black-line text-center w-100"
              onClick={handleCloseUploadModal}
              label="Cancel"
            />
            <Button
              className="btn btn-orange text-center ms-2 w-100"
              label="Skip"
              onClick={() => {
                setIsUploadModalVisible(false); 
                setUploadModal(false);
                setShowDocumentFlow(false); 
              }}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default UploadDocumentModal;

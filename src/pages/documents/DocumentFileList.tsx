import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import {
  IDocumentListDetailResponse,
  IFileModel,
  IGetSecureUnsecureDocumentListData,
  IGetSecureUnsecureDocumentListResponse,
  IMoveDocumentBody,
} from "../../interface/document";
import {
  deleteUploadRemainingDocumentsAPI,
  getSecureUnsecureDocumentListAPI,
  getSubFolderDetailsAPI,
  moveDocumentAPI,
} from "../../utils/axios/apiServices";
import { useLocation, useParams } from "react-router-dom";
import {
  formatDate,
  toastError,
  toastInfo,
  toastSuccess,
} from "../../utils/functions/shared";
import { APIResponseEntity } from "../../interface/apiResponse";
import { Dialog } from "primereact/dialog";
import { Accordion, AccordionTab } from "primereact/accordion";
import { validationMessages } from "../../utils/constants/messages";
import { environment } from "../../utils/constants/environments";
import { Tooltip } from "primereact/tooltip";

const DocumentFileList = () => {
  const [documentList, setDocumentList] = useState<IFileModel[]>([]);

  const [folderName, setFolderName] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const [targetFile, setTargetFile] = useState<IFileModel | null>(null);

  const [moveModal, setMoveModal] = useState<boolean>(false);

  const [moveFolderList, setMoveFolderList] = useState<
    IGetSecureUnsecureDocumentListData[]
  >([]);

  const [selectedMoveFolderPath, setSelectedMoveFolderPath] = useState<
    string | null
  >(null);

  const [activeAccordionIndex, setActiveAccordionIndex] = useState<
    number | null
  >(null);

  const { id, subId } = useParams();

  const { state } = useLocation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const fileArray = Array.from(files);
      if (fileArray.length > 5) {
        toastError("You can upload a maximum of 5 files at a time.");
        return;
      }
      setSelectedFiles(fileArray);
    }
  };

  const fetchDocumentDetail = async (): Promise<void> => {
    if (!id || !subId) return;

    setLoading(true);

    const body: {
      folderName: string;
      subFolderName: string;
      loanApplicationID: string | null;
    } = {
      folderName: id,
      subFolderName: subId,
      loanApplicationID: state.loanApplicationID || null,
    };

    const response: IDocumentListDetailResponse =
      await getSubFolderDetailsAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setFolderName(response.data.folderPath || null);
      setDocumentList(response.data.fileModels || []);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDelete = (rowData: IFileModel): void => {
    setTargetFile(rowData);
    setDeleteModal(true);
  };

  const confirmDeleteFile = async (): Promise<void> => {
    if (!targetFile) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("actionType", "1");
    formData.append("path", targetFile?.filePath || "");

    const response: APIResponseEntity =
      await deleteUploadRemainingDocumentsAPI(formData);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      fetchDocumentDetail();
      setDeleteModal(false);
      setTargetFile(null);
      setMoveModal(false);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleViewDocument = (url: string): void => {
    window.open(url, "_blank");
  };

  const fetchMoveFolderList = async (): Promise<void> => {
    setLoading(true);

    const response: IGetSecureUnsecureDocumentListResponse =
      await getSecureUnsecureDocumentListAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setMoveFolderList(response.data);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleMoveDocument = (rowData: IFileModel): void => {
    setTargetFile(rowData);
    setMoveModal(true);
  };

  const actionBody = (rowData: IFileModel): JSX.Element => {
    const deleteId = `delete-${rowData.documentType}`;
    const moveId = `move-${rowData.documentType}`;
    const viewId = `view-${rowData.documentType}`;

    return (
      <>
        <Tooltip target={`#${deleteId}`} position="top" />
        <Tooltip target={`#${moveId}`} position="top" />
        <Tooltip target={`#${viewId}`} position="top" />

        <Button
          id={deleteId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Delete Document"
          onClick={() => handleDelete(rowData)}
        >
          <img
            src="/assets/images/trash.svg"
            alt="delete-icon"
            loading="lazy"
          />
        </Button>

        <Button
          id={moveId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Move Document"
          onClick={() => handleMoveDocument(rowData)}
        >
          <img
            src="/assets/images/move-icon.svg"
            alt="move-icon"
            loading="lazy"
          />
        </Button>

        {rowData.url && (
          <Button
            id={viewId}
            className="trash-icon p-0 me-2"
            data-pr-tooltip="View Document"
            onClick={() => handleViewDocument(rowData.url || "")}
          >
            <img src="/assets/images/eye.svg" alt="view-icon" loading="lazy" />
          </Button>
        )}
      </>
    );
  };
  const handleUpload = async (): Promise<void> => {
    if (!id) return;

    if (selectedFiles.length === 0) {
      return toastInfo(validationMessages.selectFileToUpload);
    }

    setLoading(true);

    const MAX_FILE_SIZE = environment.DOCUMENT_FILE_SIZE * 1024 * 1024;

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setLoading(false);
        return toastError(
          `File ${file.name} exceeds the ${environment.DOCUMENT_FILE_SIZE} MB limit.`,
        );
      }
    }

    const formData = new FormData();

    formData.append("actionType", "2");
    formData.append("isFolderPath", folderName ? "true" : "false");
    formData.append("path", folderName || documentList[0].filePath || "");

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const response: APIResponseEntity =
      await deleteUploadRemainingDocumentsAPI(formData);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      fetchDocumentDetail();
      setSelectedFiles([]);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const deleteFooterContent = (
    <div className="modal-footer gap-3">
      <Button
        label="Cancel"
        className="btn btn-black-line text-center w-100"
        onClick={() => {
          setDeleteModal(false);
          setTargetFile(null);
          setMoveModal(false);
        }}
      />
      <Button
        label="Yes, Delete"
        className="btn btn-orange text-center w-100"
        onClick={confirmDeleteFile}
      />
    </div>
  );

  const handleMoveConfirm = async (): Promise<void> => {
    if (!targetFile || !selectedMoveFolderPath) return;

    setLoading(true);

    const body: IMoveDocumentBody = {
      currentPath: targetFile.filePath || "",
      targetPath: selectedMoveFolderPath,
    };

    const response: APIResponseEntity = await moveDocumentAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      fetchDocumentDetail();
      setMoveModal(false);
      setTargetFile(null);
      setSelectedMoveFolderPath(null);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const moveFooterContent = (
    <div className="modal-footer gap-3">
      <Button
        label="Cancel"
        className="btn btn-black-line text-center w-100"
        onClick={() => {
          setMoveModal(false);
          setSelectedMoveFolderPath(null);
        }}
      />
      <Button
        label="Yes, Move"
        className="btn btn-orange text-center w-100"
        onClick={handleMoveConfirm}
      />
    </div>
  );

  useEffect(() => {
    fetchDocumentDetail();
    fetchMoveFolderList();
  }, []);

  return (
    <div className="whiteBoxHldr p-30">
      <Loader isLoading={loading} />

      <div className="row mb-5">
        <div className="col-lg-12 mb-3">
          <div className="titleMainWrapper">
            <h2 className="txt-30 fw-bold">{`${subId} Document`}</h2>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
          <div className="form-group mb-4 d-flex flex-row gap-3">
            <div className="file-input">
              <input type="file" multiple onChange={handleFileChange} />

              <span className="button">Choose</span>

              <span className="label">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} files selected`
                  : "No files selected"}
              </span>
            </div>

            <Button
              className="btn btn-orange text-center"
              onClick={handleUpload}
            >
              <span style={{ fontWeight: "600", color: "#FFFFFF" }}>
                Upload
              </span>
            </Button>
          </div>
        </div>

        <div className="col-12">
          <div className="table-responsive">
            <DataTable
              className="tableMain"
              value={documentList || []}
              emptyMessage="No documents found"
            >
              <Column
                body={(rowData, options) => options.rowIndex + 1}
                header="Sr. No."
              />

              <Column
                field="fileName"
                header="Document Name"
                body={(rowData) =>
                  rowData.fileName.length > 50
                    ? `${rowData.fileName.substring(0, 50)}...`
                    : rowData.fileName
                }
              />

              <Column field="documentType" header="Document Type" />

              <Column
                body={(rowData: IFileModel) =>
                  rowData.uploadDate
                    ? formatDate(rowData.uploadDate, "Do MMMM YYYY, h:mm A")
                    : "-"
                }
                header="Uploaded Date"
              />

              <Column body={actionBody} header="Action" />
            </DataTable>
          </div>
        </div>
      </div>

      <BackButton />

      <Dialog
        header={`Delete ${targetFile?.fileName}`}
        visible={deleteModal}
        className="modalWrapper"
        onHide={() => setDeleteModal(false)}
        draggable={false}
        resizable={false}
        blockScroll
        footer={deleteFooterContent}
        style={{ width: "500px" }}
      >
        <div className="modal-content">
          <div className="modal-body">
            <p className="mb-3 modal-text">Are you sure you want to delete?</p>
          </div>
        </div>
      </Dialog>

      <Dialog
        header={`Move ${targetFile?.fileName}`}
        visible={moveModal}
        className="modalWrapper"
        onHide={() => setMoveModal(false)}
        draggable={false}
        resizable={false}
        blockScroll
        footer={moveFooterContent}
        style={{ width: "600px", maxWidth: "90vw" }}
      >
        <div className="modal-content">
          <div className="modal-body">
            <div className="move-folder-container">
              {moveFolderList.length > 0 && (
                <Accordion
                  activeIndex={activeAccordionIndex}
                  onTabChange={(e) =>
                    setActiveAccordionIndex(e.index as number)
                  }
                >
                  {moveFolderList.map((folder, index) => {
                    const pathPrefix = folder.folderPath;
                    const isParentOfSelected =
                      selectedMoveFolderPath?.startsWith(pathPrefix);
                    const isOpen = activeAccordionIndex === index;

                    const shouldHighlight = isParentOfSelected && !isOpen;
                    return (
                      <AccordionTab
                        key={folder.folderPath}
                        header={
                          <div
                            className={`folder-header ${shouldHighlight ? "highlighted-tab" : ""
                              }`}
                          >
                            <div className="folder-header-title">
                              <img
                                src="/assets/images/folder.svg"
                                alt="folder"
                                className="folder-icon"
                              />
                              {folder.folderName}
                            </div>
                            <div className="subfolder-count">
                              {folder.subFolders.length} subfolder
                              {folder.subFolders.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        }
                        pt={{
                          header: {
                            className: shouldHighlight
                              ? "highlight-header"
                              : "",
                          },
                        }}
                      >
                        {folder.subFolders.length > 0 &&
                          folder.subFolders.map((sub) => {
                            const path = `${folder.folderPath}/${sub.subFolderName}`;
                            const isSelected = selectedMoveFolderPath === path;

                            return (
                              <div
                                key={path}
                                className={`subfolder-item ${isSelected ? "selected" : ""
                                  }`}
                                onClick={() => setSelectedMoveFolderPath(path)}
                              >
                                <img
                                  src="/assets/images/folder.svg"
                                  alt="sub-folder"
                                  className={`folder-icon ${isSelected ? "icon-white" : ""
                                    }`}
                                />
                                {sub.subFolderName}
                              </div>
                            );
                          })}
                      </AccordionTab>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DocumentFileList;

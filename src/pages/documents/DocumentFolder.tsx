import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";
import {
  IDocumentListDetailResponse,
  IFileModel,
  IGetSecureUnsecureDocumentListData,
  IGetSecureUnsecureDocumentListResponse,
  IMoveDocumentBody,
} from "../../interface/document";
import {
  deleteUploadRemainingDocumentsAPI,
  getDocumentDetailsAPI,
  getSecureUnsecureDocumentListAPI,
  moveDocumentAPI,
} from "../../utils/axios/apiServices";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RouteParams } from "../../utils/constants/constant";
import {
  formatDate,
  toastError,
  toastInfo,
  toastSuccess,
} from "../../utils/functions/shared";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { APIResponseEntity } from "../../interface/apiResponse";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Dialog } from "primereact/dialog";
import { validationMessages } from "../../utils/constants/messages";
import { environment } from "../../utils/constants/environments";
import { Tooltip } from "primereact/tooltip";

const DocumentFolder = () => {
  const [documentList, setDocumentList] = useState<string[]>([]);

  const [documentFileList, setDocumentFileList] = useState<IFileModel[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [folderName, setFolderName] = useState<string | null>(null);

  const [fileModels, setFileModels] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

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

  const { id } = useParams<RouteParams>();

  const { state } = useLocation();

  const navigate = useNavigate();

  const fetchDocumentDetail = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const body: { folderName: string; loanApplicationID: string | null } = {
      folderName: id,
      loanApplicationID: state.loanApplicationID || null,
    };

    const response: IDocumentListDetailResponse =
      await getDocumentDetailsAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const {
        subFolders = [],
        missingDocuments = [],
        fileModels = [],
        isFileModels,
        folderPath = "",
      } = response.data;

      const folderNames = subFolders
        .map((f) => f?.subFolderName)
        .filter(Boolean);

      setDocumentList(isFileModels ? [] : folderNames);
      setDocumentFileList(isFileModels ? fileModels : []);
      setFolderName(folderPath);
      setFileModels(isFileModels);

      if (missingDocuments.length > 0) {
        const missingMsg = `${missingDocuments.join(", ")} ${
          missingDocuments.length === 1 ? "is" : "are"
        } missing.`;

        toastInfo(missingMsg);
      }
      // else {
      //   toastSuccess(response.message);
      // }
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleDelete = async (rowData: IFileModel): Promise<void> => {
    setLoading(true);

    const formData = new FormData();

    formData.append("actionType", "1");
    formData.append("path", rowData.filePath);

    const response: APIResponseEntity =
      await deleteUploadRemainingDocumentsAPI(formData);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      fetchDocumentDetail();
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

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
    formData.append("path", folderName || "");

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
            alt="delete-icon"
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
            <img
              src="/assets/images/eye.svg"
              alt="delete-icon"
              loading="lazy"
            />
          </Button>
        )}
      </>
    );
  };

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

      <div className="row">
        <div className="col-lg-12 mb-3">
          <div className="titleMainWrapper">
            <TableTitle title={`${id} ${fileModels ? "Files" : "Folders"}`} />
          </div>

          <div className="col-12 ApplicationsBoxWrapper mb-4">
            <div className="row">
              {documentList.length <= 0 && (
                <div className="col-lg-4 col-md-6 col-sm-12 col-12 mt-4">
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
              )}

              {!fileModels &&
                documentList.map((document: string) => {
                  return (
                    <div
                      className="col-lg-4 col-md-6 col-sm-6 col-12 mt-4"
                      key={document}
                    >
                      <div
                        className="applicationBoxHldr d-flex flex-column text-center border"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            `${RoutePathConstant.private.documents}/${id}/${document}`,
                            {
                              state: {
                                loanApplicationID: state.loanApplicationID,
                              },
                            },
                          )
                        }
                      >
                        <div className="folder-img mt-2 mb-4">
                          <img
                            src="/assets/images/folder.svg"
                            alt="folder"
                            loading="lazy"
                          />
                        </div>
                        <b
                          style={{
                            fontWeight: "600",
                            fontSize: "16px",
                            lineHeight: "24px",
                          }}
                        >
                          {document}
                        </b>
                        {
                          <div className="clickNext">
                            <i className="bi bi-arrow-right" />
                          </div>
                        }
                      </div>
                    </div>
                  );
                })}

              {fileModels && (
                <>
                  <div className="table-responsive">
                    <DataTable
                      className="tableMain"
                      value={documentFileList || []}
                      emptyMessage="No files found"
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
                            ? formatDate(
                                rowData.uploadDate,
                                "Do MMMM YYYY, h:mm A",
                              )
                            : "-"
                        }
                        header="Uploaded Date"
                      />

                      <Column body={actionBody} header="Action" />
                    </DataTable>
                  </div>
                </>
              )}
            </div>

            <div className="form-group mt-4">
              <BackButton />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        header={`Move ${targetFile?.fileName}`}
        visible={moveModal}
        className="modalWrapper"
        onHide={() => setMoveModal(false)}
        draggable={false}
        resizable={false}
        footer={moveFooterContent}
        style={{ width: "600px", maxWidth: "90vw" }}
        blockScroll
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
                            className={`folder-header ${
                              shouldHighlight ? "highlighted-tab" : ""
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
                                className={`subfolder-item ${
                                  isSelected ? "selected" : ""
                                }`}
                                onClick={() => setSelectedMoveFolderPath(path)}
                              >
                                <img
                                  src="/assets/images/folder.svg"
                                  alt="sub-folder"
                                  className={`folder-icon ${
                                    isSelected ? "icon-white" : ""
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

export default DocumentFolder;

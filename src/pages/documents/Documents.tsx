import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import TableTitle from "../../components/TableTitle";
import { useEffect, useState } from "react";
import { fetchDocumentStatusAPI } from "../../utils/axios/apiServices";
import {
  IDocumentListData,
  IDocumentListResponse,
} from "../../interface/document";
import Loader from "../../components/Loader";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { toastError } from "../../utils/functions/shared";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { DocumentType } from "../../utils/constants/enum";
import { Dropdown } from "primereact/dropdown";

const Documents = () => {
  const [documentInfo, setDocumentInfo] = useState<IDocumentListData[]>([]);

  const [filterDocumentInfo, setFilterDocumentInfo] = useState<
    IDocumentListData[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [folderType, setFolderType] = useState<DocumentType>(
    DocumentType.SECURED_DOCUMENT
  );

  const navigate = useNavigate();

  const { state } = useLocation();

  const fetchDocument = async (): Promise<void> => {
    setLoading(true);

    const body: { loanType: number; loanApplicationID: string | null } = {
      loanType: state?.loanType,
      loanApplicationID: state?.loanApp || null,
    };

    const response: IDocumentListResponse = await fetchDocumentStatusAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setDocumentInfo(response.data);
      filterDocuments(response.data, DocumentType.SECURED_DOCUMENT);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const filterDocuments = (
    documents: IDocumentListData[],
    type: DocumentType
  ): void => {
    const filtered = documents.filter((doc) => {
      if (type === DocumentType.SECURED_DOCUMENT)
        return doc.isSecure === true || doc.isSecure === null;
      else return doc.isSecure === false || doc.isSecure === null;
    });

    setFilterDocumentInfo(filtered);
  };

  const handleFolderTypeChange = (e: { value: DocumentType }) => {
    setFolderType(e.value);
    filterDocuments(documentInfo, e.value);
  };

  const validDocument = (document: IDocumentListData): boolean => {
    const { loanType } = state;

    return loanType === 0
      ? true
      : document.isExclamation ||
          document.isCarryingFiles ||
          document.isRequired;
  };

  useEffect(() => {
    if (state?.loanType === undefined) {
      navigate(RoutePathConstant.private.dashboard);
    }
    fetchDocument();
  }, []);

  return (
    <div className="whiteBoxHldr p-30">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12 mb-5">
          <div className="titleMainWrapper d-flex justify-content-between">
            <TableTitle title="Document Folder" />
            {state?.loanType === 0 && (
              <div className="form-group w-auto">
                <Dropdown
                  value={folderType}
                  options={[
                    {
                      label: "Secured Folder",
                      value: DocumentType.SECURED_DOCUMENT,
                    },
                    {
                      label: "Unsecured Folder",
                      value: DocumentType.UNSECURED_DOCUMENT,
                    },
                  ]}
                  onChange={handleFolderTypeChange}
                  placeholder="Select Folder Type"
                />
              </div>
            )}
          </div>

          <div className="col-12 ApplicationsBoxWrapper mb-4">
            <div className="row">
              {filterDocumentInfo.map((document: IDocumentListData) => {
                return (
                  <div
                    className="col-lg-4 col-md-6 col-sm-6 col-12 mt-4"
                    key={document.documentName}
                  >
                    <div
                      className="applicationBoxHldr d-flex flex-column text-center border"
                      style={{
                        cursor: validDocument(document) ? "pointer" : "default",
                      }}
                      onClick={() => {
                        const shouldNavigate = validDocument(document);

                        if (!shouldNavigate) return;

                        navigate(
                          `${RoutePathConstant.private.documents}/${document.documentName}`,
                          {
                            state: { loanApplicationID: state.loanApp },
                          }
                        );
                      }}
                    >
                      {document.isExclamation && (
                        <>
                          <img
                            src="/assets/images/red-info-circle.svg"
                            alt="red-info-circle"
                            loading="lazy"
                            data-pr-tooltip={(() => {
                              const files = document.missingFiles;
                              const firstTwo = files.slice(0, 2).join(", ");
                              const remaining = files.length - 2;

                              const fileList =
                                files.length > 2
                                  ? `${firstTwo}, and ${remaining} more`
                                  : firstTwo;

                              const verb = files.length === 1 ? "is" : "are";

                              return `${fileList} ${verb} missing.`;
                            })()}
                            data-pr-position="left"
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                            }}
                          />
                          <Tooltip target="[data-pr-tooltip]" />
                        </>
                      )}
                      {document.isRequired && !document.isExclamation && (
                        <img
                          src="/assets/images/tick-circle.svg"
                          alt="tick-circle"
                          loading="lazy"
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                          }}
                        />
                      )}
                      <div className="folder-img mt-2 mb-4">
                        <img
                          src="/assets/images/folder.svg"
                          alt="folder"
                          loading="lazy"
                          style={{
                            filter: validDocument(document)
                              ? "none"
                              : "grayscale(100%)",
                          }}
                        />
                      </div>
                      <b
                        style={{
                          fontWeight: "600",
                          fontSize: "16px",
                          lineHeight: "24px",
                        }}
                      >
                        {document.documentName}
                      </b>
                      {validDocument(document) && (
                        <div className="clickNext">
                          <i className="bi bi-arrow-right" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-group mt-4">
              <BackButton />

              {state?.loanType !== 0 && (
                <>
                  <span
                    data-pr-tooltip={
                      filterDocumentInfo.some((doc) => doc.isExclamation)
                        ? "Please upload the necessary documents to proceed further"
                        : "Proceed to the next step"
                    }
                    data-pr-position="right"
                  >
                    <Button
                      className={`btn ${
                        filterDocumentInfo.some(
                          (document) => document.isExclamation
                        )
                          ? "btn-orange-disabled"
                          : "btn-orange"
                      } text-center ms-2`}
                      label="Next"
                      disabled={filterDocumentInfo.some(
                        (document) => document.isExclamation
                      )}
                      onClick={() =>
                        navigate(RoutePathConstant.private.loanMarketPlace, {
                          state: {
                            showDocument: false,
                            loanType: state.loanType,
                            loanApp: state.loanApp,
                            bankID: state.bankID,
                            loanTenureID: state.loanTenureID,
                            rateOfInterest: state.rateOfInterest,
                          },
                        })
                      }
                    />
                  </span>

                  <Tooltip target="[data-pr-tooltip]" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;

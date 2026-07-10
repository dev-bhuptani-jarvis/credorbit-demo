import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import {
  IEducationInstitute,
  IEducationInstituteDocument,
} from "../../interface/educationInstitute";
import { RouteParams, formatMobileNumber } from "../../utils/constants/constant";
import {
  getNbfcDocumentUrl,
  getNbfcInstituteById,
} from "../../utils/demo/demoNbfcInstitutes";
import { formatDate, toastError } from "../../utils/functions/shared";

const NBFCDetail = () => {
  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);

  const [nbfcDetail, setNbfcDetail] = useState<IEducationInstitute>();

  const openDocument = (documentData: IEducationInstituteDocument): void => {
    const documentUrl = getNbfcDocumentUrl(documentData);

    if (documentUrl && typeof window !== "undefined") {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    toastError(
      "Document metadata is available. Re-upload the file in this session to preview it.",
    );
  };

  const renderDocumentSection = (
    title: string,
    documents: IEducationInstituteDocument[],
  ): JSX.Element => (
    <div className="whiteBoxHldr">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h3 className="txt-20 mb-0">{title}</h3>
        <span className="text-muted small">{documents.length} document(s) available</span>
      </div>

      {documents.length > 0 ? (
        <div className="table-responsive">
          <table className="tableMain">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Uploaded Date</th>
                <th>File Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((documentData) => (
                <tr key={documentData.id}>
                  <td>{documentData.type}</td>
                  <td>{formatDate(documentData.uploadedAt, "DD MMM, YYYY h:mm A")}</td>
                  <td>{(documentData.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                  <td>
                    <Button
                      className="btn btn-black-line py-2 px-3"
                      onClick={() => openDocument(documentData)}
                      label="View PDF"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-0 text-muted">No documents available in this section.</p>
      )}
    </div>
  );

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setNbfcDetail(getNbfcInstituteById(id));
    setLoading(false);
  }, [id]);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="txt-24 mb-1">NBFC Details</h2>
        <BackButton />
      </div>

      {nbfcDetail ? (
        <div className="row g-4">
          <div className="col-12">
            <div className="borderBoxHldr p-24">
              <div className="row">
                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">NBFC Code</b>
                  <p className="text-break mb-0">{nbfcDetail.instituteCode}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">NBFC Name</b>
                  <p className="text-break mb-0">{nbfcDetail.instituteName}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">Contact Person</b>
                  <p className="text-break mb-0">{nbfcDetail.contactPerson}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">Mobile Number</b>
                  <p className="text-break mb-0">
                    {formatMobileNumber(nbfcDetail.mobileNumber)}
                  </p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">Email</b>
                  <p className="text-break mb-0">{nbfcDetail.email}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">State</b>
                  <p className="text-break mb-0">{nbfcDetail.state}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">City</b>
                  <p className="text-break mb-0">{nbfcDetail.city}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">Registration Number</b>
                  <p className="text-break mb-0">{nbfcDetail.registrationNumber || "-"}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">GST Number</b>
                  <p className="text-break mb-0">{nbfcDetail.gstNumber || "-"}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">PAN Number</b>
                  <p className="text-break mb-0">{nbfcDetail.panNumber || "-"}</p>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                  <b className="fw-semibold">Address</b>
                  <p className="text-break mb-0">{nbfcDetail.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            {renderDocumentSection("Loan Document", nbfcDetail?.documents || [])}
          </div>
        </div>
      ) : (
        <div className="borderBoxHldr p-24">
          <p className="mb-0 text-muted">NBFC detail not found.</p>
        </div>
      )}
    </div>
  );
};

export default NBFCDetail;

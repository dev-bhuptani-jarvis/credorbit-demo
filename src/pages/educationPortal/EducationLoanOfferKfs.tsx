import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { useNavigate, useParams } from "react-router-dom";
import TableTitle from "../../components/TableTitle";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  completeEducationLoanApplication,
  getEducationLoanDraftById,
} from "../../utils/demo/demoEducationLoanFlow";
import { toastError } from "../../utils/functions/shared";
import { InputText } from "primereact/inputtext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EducationLoanOfferKfs = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [reviewAccepted, setReviewAccepted] = useState<boolean>(false);

  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const [showThankYou, setShowThankYou] = useState<boolean>(false);

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    studentPan: null,
    studentAadhaar: null,
    coApplicantPan: null,
    coApplicantAadhaar: null,
  });

  const draft = useMemo(() => getEducationLoanDraftById(id), [id]);

  const documentFields = [
    { key: "studentPan", label: "Applicant PAN" },
    { key: "studentAadhaar", label: "Applicant Aadhaar" },
    ...(draft?.hasCoApplicant
      ? [
        { key: "coApplicantPan", label: "Co-applicant PAN" },
        { key: "coApplicantAadhaar", label: "Co-applicant Aadhaar" },
      ]
      : []),
  ];

  useEffect(() => {
    if (!showThankYou) return undefined;

    const redirectTimeout = window.setTimeout(() => {
      setShowThankYou(false);
      navigate(RoutePathConstant.private.channelPartnerDashboard);
    }, 5000);

    return () => window.clearTimeout(redirectTimeout);
  }, [navigate, showThankYou]);

  if (!draft) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="KFS Details" />
        <p className="mb-3">Education loan application not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.channelPartnerDashboard)}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const validateUploads = (): boolean => {
    const nextErrors: Record<string, string> = {};

    documentFields.forEach((field) => {
      const selectedFile = uploadedFiles[field.key];

      if (!selectedFile) {
        nextErrors[field.key] = `${field.label} is required.`;
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        nextErrors[field.key] = `${field.label} should be 5 MB or smaller.`;
      }
    });

    if (!reviewAccepted) {
      nextErrors.reviewAccepted = "Please review and accept the KFS offer.";
    }

    setFileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
  ) => {
    const selectedFile = event.target.files?.[0] || null;

    setUploadedFiles((previous) => ({
      ...previous,
      [fieldKey]: selectedFile,
    }));

    setFileErrors((previous) => ({
      ...previous,
      [fieldKey]: "",
    }));
  };

  const handleSubmit = () => {
    if (!validateUploads()) return;

    const completedDraft = completeEducationLoanApplication(draft.id);

    if (!completedDraft) {
      toastError("The application could not be submitted.");
      return;
    }

    setShowThankYou(true);
  };

  return (
    <>
      <div className="whiteBoxHldr p-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <TableTitle title="Upload Applicant Documents" />
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="borderBoxHldr p-24">
              <div className="row">
                {documentFields.map((field) => (
                  <div className="form-group col-lg-6 col-12 mb-4" key={field.key}>
                    <label className="form-label">
                      {field.label}
                      <sup>*</sup>
                    </label>
                    <InputText
                      type="file"
                      className="form-control"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(event) => handleFileChange(event, field.key)}
                    />
                    <small className="text-muted d-block mt-2">
                      Accepted formats: PDF, PNG, JPG, JPEG. Max size 5 MB.
                    </small>
                    {uploadedFiles[field.key] && (
                      <small className="d-block mt-2">
                        Selected: {uploadedFiles[field.key]?.name}
                      </small>
                    )}
                    {fileErrors[field.key] && (
                      <small className="error d-block mt-2">{fileErrors[field.key]}</small>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <div className="borderBoxHldr p-24">
              <div className="form-check d-flex align-items-start gap-3">
                <Checkbox
                  inputId="reviewOffer"
                  checked={reviewAccepted}
                  onChange={(event) => {
                    setReviewAccepted(!!event.checked);
                    setFileErrors((previous) => ({
                      ...previous,
                      reviewAccepted: "",
                    }));
                  }}
                />
                <label htmlFor="reviewOffer" className="form-label mb-0">
                  I have reviewed the KFS above offer and I am ready to submit.
                </label>
              </div>
              {fileErrors.reviewAccepted && (
                <small className="error d-block mt-2">{fileErrors.reviewAccepted}</small>
              )}
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end mt-5 gap-3">
            <Button
              className="btn btn-black-line"
              onClick={() =>
                navigate(
                  RoutePathConstant.private.educationStudentLoanOffer.replace(
                    ":id",
                    draft.id,
                  ),
                )
              }
            >
              Back
            </Button>
            <Button className="btn btn-orange" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        visible={showThankYou}
        modal
        onHide={() => {
          setShowThankYou(false);
          navigate(RoutePathConstant.private.channelPartnerDashboard);
        }}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="text-center py-4">
          <img
            src="/assets/images/tick-circle.svg"
            alt="tick-circle"
            loading="lazy"
            style={{
              width: "80px",
              height: "80px",
            }}
          />

          <h4 className="mb-0 mt-3">Thank you</h4>

          <p className="mb-2">
            The student education loan application has been submitted successfully.
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default EducationLoanOfferKfs;

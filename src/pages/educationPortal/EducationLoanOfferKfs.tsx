import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import { ILoanMarketBankDetails, ILoanMarketResponse } from "../../interface/loanMarketPlace";
import { fetchLoanMarketPlaceListingAPI } from "../../utils/axios/apiServices";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  completeEducationLoanApplication,
  getEducationLoanDraftById,
} from "../../utils/demo/demoEducationLoanFlow";
import { toastError, toastSuccess } from "../../utils/functions/shared";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EducationLoanOfferKfs = () => {
  const navigate = useNavigate();
  const { id = "", bankId = "" } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [reviewAccepted, setReviewAccepted] = useState<boolean>(false);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    studentPan: null,
    studentAadhaar: null,
    coApplicantPan: null,
    coApplicantAadhaar: null,
  });
  const [selectedLender, setSelectedLender] =
    useState<ILoanMarketBankDetails | null>(null);

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
      navigate(RoutePathConstant.private.clientDashboard);
    }, 5000);

    return () => window.clearTimeout(redirectTimeout);
  }, [navigate, showThankYou]);

  useEffect(() => {
    const loadSelectedLender = async (): Promise<void> => {
      if (!draft) return;

      setLoading(true);

      try {
        const response: ILoanMarketResponse = await fetchLoanMarketPlaceListingAPI({
          loanAppID: draft.id,
        });

        const lender =
          response?.data?.bankDetails?.find(
            (item) => String(item.bankID) === String(bankId),
          ) || null;

        setSelectedLender(lender);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedLender();
  }, [bankId, draft]);

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

    toastSuccess("Education loan application submitted successfully.");
    setShowThankYou(true);
  };

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <TableTitle title={`KFS Details - ${draft.studentName}`} />
            {selectedLender && (
              <p className="mt-2 mb-0 text-muted">
                Selected NBFC: <strong>{selectedLender.bankName}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12 mt-2">
            <div className="borderBoxHldr p-24">
              <div className="row">
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Course Name</b>
                  <p className="text-break">{draft.courseName}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Agreed Course Fee</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.courseFees)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Discount Amount</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.discountAmount)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Discounted Course Fee</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.discountedCourseFee)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Downpayment</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.downpayment)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Loan Amount</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.loanAmount)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Loan Tenure</b>
                  <p className="text-break">{draft.emiOptionMonths} Months</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Advance EMI</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.advanceEmi)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Number of EMIs</b>
                  <p className="text-break">{draft.numberOfEmis}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>EMI Amount</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.emiAmount)}
                  </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                  <b>Total Amount to Institute</b>
                  <p className="text-break">
                    INR {new Intl.NumberFormat("en-IN").format(draft.totalAmountToInstitute)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <h5 className="mb-3">Upload Applicant Documents</h5>
            <div className="borderBoxHldr p-24">
              <div className="row">
                {documentFields.map((field) => (
                  <div className="form-group col-lg-6 col-12 mb-4" key={field.key}>
                    <label className="form-label">
                      {field.label}
                      <sup>*</sup>
                    </label>
                    <input
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
              <div className="d-flex align-items-start gap-3">
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
                <label htmlFor="reviewOffer" className="mb-0">
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
          navigate(RoutePathConstant.private.clientDashboard);
        }}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="text-center py-3">
          <h3 className="txt-orange">Thank you</h3>
          <p className="mb-2">
            The student education loan application has been submitted successfully.
          </p>
          <p className="mb-0 text-muted">
            Redirecting to the student dashboard in 5 seconds.
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default EducationLoanOfferKfs;

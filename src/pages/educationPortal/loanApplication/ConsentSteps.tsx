import { useEffect, useMemo, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import {
  getEducationPortalLoanDetailsAPI,
  sendOTPEducationInstituteAPI,
  updateEducationPortalConsentAPI,
  verifyOTPEducationInstituteAPI,
} from '../../../utils/axios/apiServices';
import {
  IFetchEducationPortalLoanDetailsData,
  IFetchEducationPortalLoanDetailsResponse,
  ILoanParticipant,
} from '../../../interface/applyLoan';
import { formatCurrencyAmount, formatMobileNumber } from '../../../utils/constants/constant';
import { decryptVAPTData } from '../../../utils/functions/encryptDecrypt';
import { formatCourseTenure, formatDate, toastError, toastSuccess } from '../../../utils/functions/shared';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import { IStudent } from '../../../interface/student';
import { InputText } from 'primereact/inputtext';
import { APIResponseEntity } from '../../../interface/apiResponse';

interface IConsentStepsProps {
  loanApplicationId: string;
  studentID: string;
  onReviewValidationChange?: (isValid: boolean) => void;
  onReviewCompleteActionChange?: (action: (() => Promise<void>) | null) => void;
}

type EducationConsentVerificationNavigationState = {
  loanApplicationId: string;
  studentID: string;
  selectedStudent?: IStudent | null;
};

type ConsentChecklistItem = {
  declaration: string;
  bulletPoints?: string[];
  sections?: Array<{
    title: string;
    bulletPoints: string[];
  }>;
};

const CONSENT_CHECKLIST = [
  {
    declaration: 'I explicitly agree to Terms and Conditions and Privacy Policy of Credorbit Technologies Private Limited (Brand Name “Schofee”).',
  },
  {
    declaration: 'I authorize Credorbit Technologies Private Limited (Brand Name “Schofee”) and its lending partners (Armour Capital) to:',
    bulletPoints: [
      'Access or download my CKYC records from the CKYCR.',
      'Act as my authorized representative to obtain my Credit Information from credit bureaus and/or alternate sources for:',
      'Assessing my credit profile.',
      'Managing loan processing and repayment.',
      'Offering any services related to my loan or financial profile.',
    ],
    sections: [
      {
        title: 'This consent remains valid:',
        bulletPoints: [
          'For the full duration of my loan tenure, or',
          'Up to 6 months from the date of consent collection, whichever is later.',
        ],
      },
    ],
  },
  {
    declaration: 'I hereby consent to share and provide access to my documents from DigiLocker for verification purposes with Lending Partners.',
  },
  {
    declaration: 'I further agree that Credorbit Technologies Private Limited (Brand Name “Schofee”) has given me the option to provide or deny consent for the use of my KYC, financial, or personal data. I understand that:',
    bulletPoints: [
      'My data may be shared with Lenders or authorized service providers only for the purposes mentioned in Terms and Conditions and Privacy Policy of Credorbit Technologies Private Limited (Brand Name “Schofee”).',
      'I can revoke my consent at any time, and request deletion of my personal data.',
      'Revoking data access may affect the services being provided to me.',
    ],
  },
  {
    declaration: 'I agree to allow Credorbit Technologies Private Limited (Brand Name “Schofee”) and/or its Lender partners to send me important information and updates over Whatsapp, SMS, call or E-mail.',
  },
] satisfies ConsentChecklistItem[];

const CONSENT_ACCENT = '#0d8dc9';
interface IVerificationParticipant extends ILoanParticipant {
  stepLabel: string;
}

const ConsentSteps = ({
  loanApplicationId,
  studentID,
  onReviewValidationChange,
  onReviewCompleteActionChange,
}: IConsentStepsProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [reviewTabIndex, setReviewTabIndex] = useState<number>(0);

  const [consentStepsData, setConsentStepsData] = useState<IFetchEducationPortalLoanDetailsData | null>(null);

  const [consentState, setConsentState] = useState<boolean[]>(
    Array(CONSENT_CHECKLIST.length).fill(false),
  );

  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  const [otpValue, setOtpValue] = useState<string>('');

  const [otpSent, setOtpSent] = useState<boolean>(false);

  const [activeParticipantIndex, setActiveParticipantIndex] = useState<number>(0);

  const [verificationState, setVerificationState] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const location = useLocation();

  const verificationParticipants = useMemo<IVerificationParticipant[]>(
    () => [
      ...(consentStepsData?.applicants?.slice(0, 1).map((participant) => ({
        ...participant,
        stepLabel: 'Applicant',
      })) || []),
      ...(consentStepsData?.coApplicants?.map((participant, index) => ({
        ...participant,
        stepLabel: `Co-applicant ${index + 1}`,
      })) || []),
    ],
    [consentStepsData],
  );

  const allParticipantsVerified = useMemo(
    () =>
      verificationParticipants.length > 0 &&
      verificationParticipants.every((participant) => verificationState[participant.participantID]),
    [verificationParticipants, verificationState],
  );

  const isReviewValid = useMemo(
    () =>
      consentState.length === CONSENT_CHECKLIST.length &&
      consentState.every(Boolean) &&
      allParticipantsVerified,
    [allParticipantsVerified, consentState],
  );

  const allConsentsSelected = consentState.length === CONSENT_CHECKLIST.length && consentState.every(Boolean);

  const fetchConsentStepsData = async (preserveSelectedConsents = false): Promise<void> => {
    if (!loanApplicationId || !studentID) {
      setConsentStepsData(null);
      setConsentState(Array(CONSENT_CHECKLIST.length).fill(false));
      return;
    }

    setLoading(true);

    const response: IFetchEducationPortalLoanDetailsResponse = await getEducationPortalLoanDetailsAPI({
      loanApplicationId,
      studentID,
    });

    if (response?.statusCode === 200 && response.data) {
      setConsentStepsData(response.data);
      const savedConsentState = [
        !!response.data.consent?.isTermsAndPrivacyConsentGiven,
        !!response.data.consent?.isCreditInformationConsentGiven,
        !!response.data.consent?.isDigiLockerConsentGiven,
        !!response.data.consent?.isDataSharingConsentGiven,
        !!response.data.consent?.isCommunicationConsentGiven,
      ];

      setConsentState((previousConsentState) =>
        preserveSelectedConsents && previousConsentState.every(Boolean)
          ? previousConsentState
          : savedConsentState,
      );
      setVerificationState(
        [...(response.data.applicants || []), ...(response.data.coApplicants || [])].reduce<Record<string, boolean>>(
          (accumulator, participant) => {
            accumulator[participant.participantID] = !!participant.isVerified;
            return accumulator;
          },
          {},
        ),
      );
    } else if (response) {
      setConsentStepsData(null);
      setConsentState(Array(CONSENT_CHECKLIST.length).fill(false));
      setVerificationState({});
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleReviewComplete = async (): Promise<void> => {
    if (!loanApplicationId) {
      toastError('Loan application ID is missing.');
      return;
    }

    if (!consentState.every(Boolean)) {
      toastError("Please accept all consent declarations.");
      return;
    }

    if (!isReviewValid) {
      toastError('Please complete consent and verify all participants first.');
      return;
    }

    setLoading(true);

    const response = await updateEducationPortalConsentAPI({
      loanApplicationID: loanApplicationId,
      isTermsAndPrivacyConsentGiven: consentState[0],
      isCreditInformationConsentGiven: consentState[1],
      isDigiLockerConsentGiven: consentState[2],
      isDataSharingConsentGiven: consentState[3],
      isCommunicationConsentGiven: consentState[4],
    });

    setLoading(false);

    if (!(response && response.statusCode === 200)) {
      toastError(response?.message);
      return;
    }

    toastSuccess(response.message);

    const navigationState = (location.state || {}) as { selectedStudent?: IStudent | null };

    navigate(
      `${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`,
      {
        state: {
          selectedDraftId: loanApplicationId,
          loanApplicationId,
          studentID,
          selectedStudent: navigationState.selectedStudent || null,
        } as EducationConsentVerificationNavigationState & {
          selectedDraftId: string;
        },
      },
    );
  };

  const activeParticipant = verificationParticipants[activeParticipantIndex] || null;

  const handleTakeConsentClick = async (): Promise<void> => {
    if (!verificationParticipants.length) {
      toastError('No applicant or co-applicant found for OTP verification.');
      return;
    }

    const nextPendingIndex = verificationParticipants.findIndex(
      (participant) => !verificationState[participant.participantID],
    );

    if (nextPendingIndex === -1) {
      toastSuccess('All participants are already verified.');
      return;
    }

    setActiveParticipantIndex(nextPendingIndex);
    setOtpValue('');
    setOtpSent(false);
    setShowOtpModal(true);
  };

  const handleSendOtp = async (): Promise<void> => {
    if (!activeParticipant) return;

    setLoading(true);

    const body = {
      loanApplicationID: loanApplicationId,
      participantID: activeParticipant.participantID,
      participantUserType: activeParticipant.participantUserType,
    }

    const response: APIResponseEntity = await sendOTPEducationInstituteAPI(body);

    if (response && response.statusCode === 200) {
      setOtpSent(true);
      toastSuccess(response.message);
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const handleVerifyAndContinue = async (): Promise<void> => {
    if (!activeParticipant) return;

    if (!otpValue.trim() && otpValue.length !== 4) {
      toastError('Please enter OTP of 4 digits');
      return;
    }

    setLoading(true);

    const body = {
      loanApplicationID: loanApplicationId,
      participantID: activeParticipant.participantID,
      participantUserType: activeParticipant.participantUserType,
      otp: Number(otpValue),
      studentID,
    };

    try {
      const response: APIResponseEntity = await verifyOTPEducationInstituteAPI(body);

      if (!response.status) {
        toastError(response.message);
        return;
      }

      setVerificationState((previous) => ({
        ...previous,
        [activeParticipant.participantID]: true,
      }));

      toastSuccess(response.message);

      const nextPendingIndex = verificationParticipants.findIndex(
        (participant, index) =>
          index > activeParticipantIndex &&
          !verificationState[participant.participantID] &&
          participant.participantID !== activeParticipant.participantID,
      );

      if (nextPendingIndex === -1) {
        setShowOtpModal(false);
        setOtpValue('');
        setOtpSent(false);
        fetchConsentStepsData(true);
        return;
      }

      setActiveParticipantIndex(nextPendingIndex);
      setOtpValue('');
      setOtpSent(false);
    } catch (error: any) {
      console.error('OTP verification failed:', error);

      toastError(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentLink = (filePath?: string | null): JSX.Element => {
    if (!filePath) {
      return <span className="text-muted">Not uploaded</span>;
    }

    return (
      <a href={filePath} target="_blank" rel="noreferrer">
        View Document
      </a>
    );
  };

  const renderParticipantDetails = (
    participant: ILoanParticipant,
    sectionTitle: string,
  ): JSX.Element => (
    <div className="borderBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h5 className="mb-0">{sectionTitle}</h5>
        <span className={`badge p-3 ${participant.isVerified ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'}`}>
          {participant.verificationStatus || (participant.isVerified ? 'Verified' : 'Pending')}
        </span>
      </div>

      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Name</b>
          <p className="text-break">{participant.name || '-'}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">{participant.pan ? decryptVAPTData(participant.pan) : '-'}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {participant.dateOfBirth ? formatDate(decryptVAPTData(participant.dateOfBirth), 'DD MMM, YYYY') : '-'}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Gender</b>
          <p className="text-break">
            {participant.gender
              ? participant.gender.charAt(0).toUpperCase() + participant.gender.slice(1).toLowerCase()
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {participant.mobileNumber ? formatMobileNumber(decryptVAPTData(participant.mobileNumber)) : '-'}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">{participant.emailAddress ? decryptVAPTData(participant.emailAddress) : '-'}</p>
        </div>
        {/* <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Relation</b>
          <p className="text-break">{participant.relation || '-'}</p>
        </div> */}
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Photo</b>
          <p className="text-break">{renderDocumentLink(participant.photo)}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN Upload</b>
          <p className="text-break">{renderDocumentLink(participant.panDocument)}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Aadhar Upload</b>
          <p className="text-break">{renderDocumentLink(participant.aadharDocument)}</p>
        </div>
        <div className="col-lg-6 col-md-7 col-sm-12 col-12 mb-4">
          <b>Address</b>
          <p className="text-break">
            {[
              decryptVAPTData(participant.address),
              participant.city,
              participant.state,
              participant.pinCode,
            ].filter(Boolean).join(', ') || '-'}
          </p>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchConsentStepsData();
  }, []);

  useEffect(() => {
    onReviewValidationChange?.(isReviewValid);
  }, [isReviewValid, onReviewValidationChange]);

  useEffect(() => {
    onReviewCompleteActionChange?.(isReviewValid ? handleReviewComplete : null);
  }, [isReviewValid, onReviewCompleteActionChange]);

  if (!loanApplicationId || !studentID) {
    return (
      <div className="borderBoxHldr p-24">
        <p className="mb-0">Loan application context is missing. Please complete the previous steps again.</p>
      </div>
    );
  }

  return (
    <>
      <Loader isLoading={loading} />

      {!loading && !consentStepsData ? (
        <div className="borderBoxHldr p-24">
          <p className="mb-0">Loan details could not be loaded for review.</p>
        </div>
      ) : null}

      {consentStepsData ? (
        <div className="row g-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              {consentStepsData.consent.consentedAt ? (
                <div className="borderBoxHldr px-3 py-2">
                  <small className="text-muted d-block">Consented On</small>
                  <strong>{formatDate(consentStepsData.consent.consentedAt, 'DD MMM, YYYY')}</strong>
                </div>
              ) : null}
            </div>

            <TabView
              className="custom-tabview"
              activeIndex={reviewTabIndex}
              onTabChange={(event) => setReviewTabIndex(event.index)}
            >
              <TabPanel header="Personal Details">
                <div className="borderBoxHldr p-24 mt-3">
                  <div className="row">
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Student Name</b>
                      <p className="text-break">{consentStepsData.studentInfo.studentName || '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Student Code</b>
                      <p className="text-break">{consentStepsData.studentInfo.studentCode || '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Course</b>
                      <p className="text-break">{consentStepsData.studentInfo.course || '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Date of Birth</b>
                      <p className="text-break">
                        {consentStepsData.studentInfo.dateOfBirth
                          ? formatDate(decryptVAPTData(consentStepsData.studentInfo.dateOfBirth), 'DD MMM, YYYY')
                          : '-'}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Gender</b>
                      <p className="text-break">
                        {consentStepsData.studentInfo.gender
                          ? consentStepsData.studentInfo.gender.charAt(0).toUpperCase() +
                          consentStepsData.studentInfo.gender.slice(1).toLowerCase()
                          : "-"}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Credit Score</b>
                      <p className="text-break">{consentStepsData.studentInfo.creditScore ?? '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Last Credit Score Fetch Date</b>
                      <p className="text-break">
                        {consentStepsData.studentInfo.lastTimeCreditScoreFetchDate
                          ? formatDate(consentStepsData.studentInfo.lastTimeCreditScoreFetchDate, 'DD MMM, YYYY')
                          : '-'}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>PAN</b>
                      <p className="text-break">{consentStepsData.studentInfo.pan ? decryptVAPTData(consentStepsData.studentInfo.pan) : '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Mobile Number</b>
                      <p className="text-break">
                        {consentStepsData.studentInfo.mobileNumber
                          ? formatMobileNumber(decryptVAPTData(consentStepsData.studentInfo.mobileNumber))
                          : '-'}
                      </p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Email Address</b>
                      <p className="text-break">{consentStepsData.studentInfo.emailAddress ? decryptVAPTData(consentStepsData.studentInfo.emailAddress) : '-'}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Photo</b>
                      <p className="text-break">{renderDocumentLink(consentStepsData.studentInfo.photo)}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>PAN Upload</b>
                      <p className="text-break">{renderDocumentLink(consentStepsData.studentInfo.panDocument)}</p>
                    </div>
                    <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                      <b>Aadhaar Upload</b>
                      <p className="text-break">{renderDocumentLink(consentStepsData.studentInfo.aadharDocument)}</p>
                    </div>
                    <div className="col-lg-6 col-md-7 col-sm-12 col-12 mb-0">
                      <b>Address</b>
                      <p className="text-break">{consentStepsData.studentInfo.address ? decryptVAPTData(consentStepsData.studentInfo.address) : '-'}</p>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel header="Applicants Details">
                <div className="mt-3">
                  {consentStepsData.applicants?.length ? (
                    renderParticipantDetails(consentStepsData.applicants[0], 'Applicant')
                  ) : (
                    <div className="borderBoxHldr p-24">
                      <p className="mb-0">No applicant details available.</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Co-Applicants Details">
                <div className="mt-3">
                  {consentStepsData.coApplicants?.length ? (
                    consentStepsData.coApplicants.map((participant, index) => (
                      <div
                        key={participant.participantID || `co-applicant-${index + 1}`}
                        className={index > 0 ? 'mt-3' : ''}
                      >
                        {renderParticipantDetails(participant, `Co-applicant ${index + 1}`)}
                      </div>
                    ))
                  ) : (
                    <div className="borderBoxHldr p-24">
                      <p className="mb-0">No co-applicant details available.</p>
                    </div>
                  )}
                </div>
              </TabPanel>
            </TabView>
          </div>

          <div className="col-12">
            <h5 className="mb-3">Loan Structure</h5>
            <div className="borderBoxHldr p-24 h-100">
              <div className="row g-4 align-items-stretch">
                <div className="col-lg-7 col-12">
                  <div
                    className="table-responsive h-100"
                    style={{
                      border: '1px solid #f1d4c8',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <table className="table mb-0 align-middle">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Course</td>
                          <td className="text-end">{consentStepsData.loanStructure.course || '-'}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Tenure</td>
                          <td className="text-end">
                            {formatCourseTenure(consentStepsData.loanStructure.tenureInYears)}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Agreed Fee</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.agreedFee || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Discount Rate</td>
                          <td className="text-end">{consentStepsData.loanStructure.discountRate || 0}%</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Discount</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.discountAmount || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Net Agreed Fee</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.netAgreedFee || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Down Payment</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.downPayment || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">EMI Plan</td>
                          <td className="text-end">
                            {consentStepsData.loanStructure.emiPlanInMonths
                              ? `${consentStepsData.loanStructure.emiPlanInMonths} Months`
                              : '-'}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Advanced EMI Months</td>
                          <td className="text-end">{consentStepsData.loanStructure.advancedEMIMonths ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Advanced EMI Amount</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.advancedEMIAmount || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Remaining EMIs</td>
                          <td className="text-end">{consentStepsData.loanStructure.remainingEMIs ?? 0}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Net Loan Amount</td>
                          <td className="text-end">{formatCurrencyAmount(consentStepsData.loanStructure.netLoanAmount || 0)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">EMI Amount</td>
                          <td className="text-end">
                            {consentStepsData.loanStructure.emiAmountDescription || formatCurrencyAmount(consentStepsData.loanStructure.emiAmount || 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-lg-5 col-12">
                  <div
                    className="borderBoxHldr p-24 h-100"
                    style={{
                      borderColor: '#f1d4c8',
                      background: '#fff',
                    }}
                  >
                    <div className="mb-4">
                      <div>
                        <h4 className="mb-1">Consent</h4>
                        <p className="text-muted mb-0">
                          Confirm each declaration before proceeding to applicant verification.
                        </p>
                      </div>
                    </div>

                    <label
                      htmlFor="consent-review-select-all"
                      className={`education-consent-select-all ${allConsentsSelected ? 'is-accepted' : ''}`}
                    >
                      <Checkbox
                        inputId="consent-review-select-all"
                        checked={allConsentsSelected}
                        onChange={(event) =>
                          setConsentState(Array(CONSENT_CHECKLIST.length).fill(!!event.checked))
                        }
                      />
                      <span>
                        <strong>Select all consents</strong>
                        <small>Select or clear every declaration at once.</small>
                      </span>
                    </label>

                    <div className="education-consent-list">
                      {CONSENT_CHECKLIST.map((consent, index) => (
                        <label
                          key={consent.declaration}
                          htmlFor={`consent-review-${index}`}
                          className={`education-consent-item ${consentState[index] ? 'is-accepted' : ''}`}
                        >
                          <Checkbox
                            inputId={`consent-review-${index}`}
                            checked={consentState[index]}
                            onChange={(event) => {
                              const nextState = [...consentState];
                              nextState[index] = !!event.checked;
                              setConsentState(nextState);
                            }}
                          />
                          <span className="education-consent-item__copy">
                            <span className="education-consent-item__number">
                              Consent {`${index + 1}`.padStart(2, '0')}
                            </span>
                            <span className="education-consent-item__text">
                              <span>{consent.declaration}</span>
                              {consent.bulletPoints ? (
                                <ul className="education-consent-item__bullets">
                                  {consent.bulletPoints.map((point) => (
                                    <li key={point}>{point}</li>
                                  ))}
                                </ul>
                              ) : null}
                              {consent.sections?.map((section) => (
                                <span className="education-consent-item__section" key={section.title}>
                                  <span>{section.title}</span>
                                  <ul className="education-consent-item__bullets">
                                    {section.bulletPoints.map((point) => (
                                      <li key={point}>{point}</li>
                                    ))}
                                  </ul>
                                </span>
                              ))}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="d-flex gap-2 flex-wrap mt-4">
                      <Button
                        className="btn btn-orange"
                        label="Take Consent"
                        onClick={() => handleTakeConsentClick()}
                        disabled={!consentState.every(Boolean) || allParticipantsVerified}
                      />
                    </div>

                    {!consentState.every(Boolean) && (
                      <small className="text-danger d-block mt-2">
                        Please accept all consent declarations to continue.
                      </small>
                    )}

                    <small className={`d-block mt-3 ${isReviewValid ? 'text-success' : 'text-muted'}`}>
                      {isReviewValid
                        ? 'All declarations are confirmed and every participant has been verified.'
                        : allParticipantsVerified
                          ? 'Take Consent to save declarations.'
                          : 'Take Consent to verify applicant and co-applicant details.'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        header="OTP Verification"
        visible={showOtpModal}
        modal
        onHide={() => setShowOtpModal(false)}
        className="modalWrapper responsive-dialog"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: '560px', maxWidth: '95vw' }}
      >

        <Loader isLoading={loading} />

        {activeParticipant ? (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h5 className="mb-1">{activeParticipant.name || activeParticipant.stepLabel}</h5>
                <p className="text-muted mb-0">Verify {activeParticipant.stepLabel} mobile OTP before proceeding.</p>
              </div>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: '#fff1ea',
                  color: CONSENT_ACCENT,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {activeParticipantIndex + 1}/{verificationParticipants.length}
              </span>
            </div>

            <div className='form-group'>
              <label className="form-label fw-semibold">
                Mobile Number<span style={{ color: '#ef4444' }}>*</span>
              </label>
              <InputText
                className="form-control"
                value={activeParticipant.mobileNumber ? formatMobileNumber(decryptVAPTData(activeParticipant.mobileNumber)) : ''}
                disabled
                placeholder='Mobile Number'
              />
            </div>

            {otpSent ? (
              <div className='form-group'>
                <label className="form-label fw-semibold">
                  OTP <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <InputText
                  className="form-control"
                  value={otpValue}
                  onChange={(event) => setOtpValue(event.target.value.trimStart())}
                  maxLength={4}
                  placeholder="Enter OTP"
                />
              </div>
            ) : null}

            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button
                className="btn btn-black-line"
                label="Cancel"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpValue('');
                  setOtpSent(false);
                }}
              />
              {otpSent ?
                <Button
                  className="btn btn-orange"
                  label="Verify and Continue"
                  onClick={() => handleVerifyAndContinue()}
                  disabled={!otpSent || !otpValue.trim()}
                />
                :
                <Button
                  className="btn btn-orange"
                  label="Get OTP"
                  disabled={!activeParticipant.mobileNumber}
                  onClick={() => handleSendOtp()}
                />
              }
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
};

export default ConsentSteps;

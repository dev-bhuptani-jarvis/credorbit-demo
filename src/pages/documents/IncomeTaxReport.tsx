import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import {
  getFetchEligibilityStatus,
  handleFileDownload,
  showGlobalReportModal,
  toastError,
  toastErrorWithExtraTime,
  toastSuccess,
} from "../../utils/functions/shared";
import BackButton from "../../components/BackButton";
import {
  fileAutomatedRequestForItrAPI,
  fileAutomatedRequestForItrUsingLinkAPI,
  generateITRReportAPI,
  getITRDetailsAPI,
  IsProceedForCamReport,
} from "../../utils/axios/apiServices";
import {
  IITRDetail,
  IExternalReportResponse,
  IITRReportBody,
  IITRReportData,
  IITRReportResponse,
  IShareLinkITRReportBody,
} from "../../interface/reports";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import TableTitle from "../../components/TableTitle";
import {
  ITR_REPORT_NORMAL_ERROR,
  ITR_REPORT_TECHNICAL_ERROR,
} from "../../utils/constants/constant";
import moment from "moment";
import ModalLoader from "../../components/ModalLoader";
import { validationMessages } from "../../utils/constants/messages";
import { encryptVAPTData } from "../../utils/functions/encryptDecrypt";
import { APIResponseEntity } from "../../interface/apiResponse";
import { setImpersonateUser } from "../../store/reducer/impersonateSlice";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { setUserData } from "../../store/reducer/userSlice";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import {
  ReportType,
  ReportTypeSignalR,
  StorageKeyEnum,
} from "../../utils/constants/enum";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreditNotAvailable from "../../components/CreditNotAvailable";
import ReFetchModal from "../../components/ReFetchModal";
import {
  IIsProceedForCamReportResponse,
  IIsProceedForGeneratingReport,
} from "../../interface/wallet";
import { Tooltip } from "primereact/tooltip";

const IncomeTaxReport = () => {
  const [incomeTaxReport, setIncomeTaxReport] = useState<IITRReportData>();

  const [showITReports, setShowITReports] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [panPassword, setPanPassword] = useState<string>("");

  const [panPasswordErrors, setPanPasswordErrors] = useState<string>(
    validationMessages.panPasswordRequired,
  );

  const [showCreditPopup, setShowCreditPopup] = useState(false);

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [showGenerateReportButton, setShowGenerateReportButton] =
    useState<boolean>(false);

  const [shareLinkReference, setShareLinkReference] =
    useState<IShareLinkITRReportBody>({
      referenceID: "",
      reservationId: "",
    });

  const [showNormalError, setShowNormalError] = useState<string>("");

  const [useShareLink, setUseShareLink] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");

  const [emailErrors, setEmailErrors] = useState<string>("");

  const [showRefetchReport, setShowRefetchReport] = useState<boolean>(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { isImpersonate } = useSelector(
    (state: RootState) => state.impersonateUser,
  );

  const { isDefaultCpClient, panNumber } = useSelector(
    (state: RootState) => state.user.user,
  );

  const { count } = useSelector((state: RootState) => state.count);

  const fetchIncomeTaxReport = async (): Promise<void> => {
    setLoading(true);

    const response: IITRReportResponse = await getITRDetailsAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      const eligibility = getFetchEligibilityStatus(
        response.data.itrReportDate,
      );

      const finalData: IITRReportData = {
        ...response.data,
        itrReportRefetchedDays: eligibility?.daysLeft,
      };

      setIncomeTaxReport(finalData);
    } else {
      toastErrorWithExtraTime(response.message);
    }

    setLoading(false);
  };

  const handleChange = (value: string): void => {
    setPanPassword(value);
    setPanPasswordErrors(
      value.trim() ? "" : validationMessages.panPasswordRequired,
    );
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailErrors("Email is required");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailErrors("Please enter a valid email address");
      return false;
    }
    setEmailErrors("");
    return true;
  };

  const handleEmailChange = (value: string): void => {
    setEmail(value);
    if (isFormSubmitted) {
      validateEmail(value);
    }
  };

  const handleCancel = (): void => {
    setShowITReports(false);
    setPanPassword("");
    setPanPasswordErrors(validationMessages.panPasswordRequired);
    setShowNormalError("");
    setUseShareLink(true);
    setEmail("");
    setEmailErrors("");
    setIsFormSubmitted(false);
    setShowGenerateReportButton(false);
    setShareLinkReference({
      referenceID: "",
      reservationId: "",
    });
  };

  const handleErrorMessage = (response: IExternalReportResponse) => {
    if (ITR_REPORT_NORMAL_ERROR.includes(response?.data?.responseCode)) {
      toastErrorWithExtraTime(response?.message);
    } else if (
      ITR_REPORT_TECHNICAL_ERROR.includes(response?.data?.responseCode)
    ) {
      setShowNormalError(response?.message);
    } else {
      toastErrorWithExtraTime(response?.message);
    }
  };

  const handleShareLinkSubmit = async (): Promise<void> => {
    setIsFormSubmitted(true);

    if (!validateEmail(email)) {
      return;
    }

    setReportLoading(true);

    const body: { email: string } = {
      email: encryptVAPTData(email.trim()),
    };

    const response: IExternalReportResponse =
      await fileAutomatedRequestForItrUsingLinkAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      toastSuccess(response.message);
      setShowGenerateReportButton(true);
      setShareLinkReference({
        referenceID: response?.data?.referenceID!,
        reservationId: response?.data?.reservationId!,
      });
      handleCancel();
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      handleErrorMessage(response);
    }

    setReportLoading(false);
  };

  const handleImpersonateLogout = (): void => {
    if (isDefaultCpClient) {
      navigate(RoutePathConstant.private.subscription, {
        state: { creditsInSufficient: true },
      });
      return;
    }

    const previousUserData = JSON.parse(
      getDecryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA,
      ),
    );

    dispatch(setUserData(previousUserData));

    setEncryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
      previousUserData.token,
    );
    navigate(RoutePathConstant.private.subscription, {
      state: { creditsInSufficient: true },
    });

    dispatch(setImpersonateUser(false));
  };

  const handleIncomeTaxDetail = async (): Promise<void> => {
    setIsFormSubmitted(true);

    if (!panPassword.trim()) {
      setPanPasswordErrors(validationMessages.panPasswordRequired);
      return;
    }

    setReportLoading(true);

    const body: IITRReportBody = {
      username: encryptVAPTData(panNumber),
      password: encryptVAPTData(panPassword),
    };

    const response: IExternalReportResponse =
      await fileAutomatedRequestForItrAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      showGlobalReportModal(response?.message, "Income Tax Report Update");
      setShowITReports(false);
      fetchIncomeTaxReport();
      handleCancel();
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      handleErrorMessage(response);
    }

    setReportLoading(false);
  };

  const handleGenerateITRReport = async (): Promise<void> => {
    setIsFormSubmitted(true);

    setReportLoading(true);

    const body: IShareLinkITRReportBody = shareLinkReference;

    const response: APIResponseEntity = await generateITRReportAPI(body);

    if (!response) return;

    if (response?.statusCode === 200) {
      toastSuccess(response?.message);
      setShowITReports(false);
      fetchIncomeTaxReport();
      handleCancel();
    } else if (response?.statusCode === 402) {
      if (!isImpersonate) {
        setShowCreditPopup(true);
      } else {
        handleImpersonateLogout();
      }
    } else {
      toastError(response?.message);
    }

    setReportLoading(false);
  };

  const handleModeToggle = (mode: boolean): void => {
    setUseShareLink(mode);
    setIsFormSubmitted(false);
    setPanPassword("");
    setPanPasswordErrors(validationMessages.panPasswordRequired);
    setEmail("");
    setEmailErrors("");
    setShowNormalError("");
  };

  const actionBody = (clientInfo: IITRDetail): JSX.Element => {
    const pdfId = `itr-pdf-${clientInfo.id}`;
    const excelId = `itr-excel-${clientInfo.id}`;

    return (
      <>
        <Tooltip target={`#${pdfId}`} position="top" />
        <Tooltip target={`#${excelId}`} position="top" />

        <Button
          id={pdfId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download PDF Report"
          onClick={() =>
            handleFileDownload(clientInfo.pdfFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/pdf-download.svg"
            alt="pdf-download-icon"
            loading="lazy"
          />
        </Button>

        <Button
          id={excelId}
          className="trash-icon p-0 me-2"
          data-pr-tooltip="Download Excel Report"
          onClick={() =>
            handleFileDownload(clientInfo.excelFilePath, clientInfo.fileName)
          }
        >
          <img
            src="/assets/images/excel-download.svg"
            alt="excel-download-icon"
            loading="lazy"
          />
        </Button>
      </>
    );
  };

  const handleClickITReport = async (): Promise<void> => {
    setLoading(true);

    const response: IIsProceedForCamReportResponse =
      await IsProceedForCamReport(ReportTypeSignalR.IncomeTaxReport);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const data = response.data as IIsProceedForGeneratingReport;

      if (data.isInProgress) {
        toastErrorWithExtraTime(response.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (incomeTaxReport?.itrReportDate === null) {
        setShowITReports(true);
      } else if ((incomeTaxReport?.itrReportRefetchedDays ?? 0) < 30) {
        setShowRefetchReport(true);
      } else {
        setShowITReports(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (showITReports) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    if (showITReports) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showITReports]);

  useEffect(() => {
    fetchIncomeTaxReport();
  }, [count]);

  return (
    <>
      <div className="col-12">
        <div className="whiteBoxHldr p-24">
          <Loader isLoading={loading} />

          <Dialog
            visible={reportLoading}
            onHide={() => {}}
            draggable={false}
            resizable={false}
            modal
            blockScroll
            className="modalWrapper"
          >
            <div className="text-center">
              <ModalLoader />
            </div>
            <h2 className="txt-orange mt-3">Processing...</h2>
            <p className="mt-2">
              {useShareLink
                ? "Sending the link to your email. This might take a few moments."
                : "Hang on! Your report is being generated. This might take a few moments."}
            </p>
            <p className="mt-2">
              We’re securely fetching your ITR details. You’ll be automatically
              moved to the next step once it’s ready.
            </p>
          </Dialog>

          <div className="row">
            <div className="col-lg-12">
              <div className="col-12 mb-4 titleBtnWrapper">
                <TableTitle title="Income Tax Details" />

                <div className="BtnRightHldr">
                  <div className="form-group">
                    {(isDefaultCpClient || isImpersonate) && (
                      <Button
                        className="btn btn-orange"
                        onClick={handleClickITReport}
                        label="Get Income Tax Report"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive mb-4">
            <DataTable
              className="tableMain"
              value={incomeTaxReport?.itrDetailsList}
              emptyMessage="No Report Found"
            >
              <Column
                header="Sr. No."
                body={(rowData, options) => options.rowIndex + 1}
              />

              <Column field="fileName" header="File Name" />

              <Column
                body={(rowData: IITRDetail) =>
                  moment(rowData.retrievedDate).format("Do MMMM YYYY, h:mm A")
                }
                header="Fetched Date & Time"
              />

              <Column body={actionBody} header="Action" />
            </DataTable>
          </div>

          <BackButton />
        </div>
      </div>

      <Dialog
        visible={showITReports}
        modal
        onHide={handleCancel}
        header="Income Tax Details"
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "500px" }}
      >
        <div className="modal-content">
          <Loader isLoading={loading} />

          <div className="modal-body">
            <div className="row">
              {/* Toggle between Manual and Share Link */}
              <div className="form-group mb-3">
                <div className="d-flex gap-3">
                  <Button
                    className={`btn ${
                      useShareLink ? "btn-orange" : "btn-black-line"
                    } flex-fill text-center`}
                    onClick={() => {
                      handleModeToggle(true);
                      setShowGenerateReportButton(false);
                      setShareLinkReference({
                        referenceID: "",
                        reservationId: "",
                      });
                    }}
                    label="Share Link"
                  />

                  <Button
                    className={`btn ${
                      !useShareLink ? "btn-orange" : "btn-black-line"
                    } flex-fill text-center`}
                    onClick={() => {
                      handleModeToggle(false);
                      setShowGenerateReportButton(false);
                      setShareLinkReference({
                        referenceID: "",
                        reservationId: "",
                      });
                    }}
                    label="Manual Entry"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label small" htmlFor="username">
                  User Name<sup>*</sup>
                </label>

                <InputText
                  id="username"
                  className="form-control"
                  placeholder="Enter user name"
                  value={panNumber}
                  name="username"
                  disabled
                  // onPaste={(e) => e.preventDefault()}
                  // onCopy={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>

              {useShareLink ? (
                // Share Link Mode - Email Input
                <div className="form-group mt-3">
                  <label className="form-label small" htmlFor="email">
                    Email Address<sup>*</sup>
                  </label>

                  <InputText
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={email}
                    name="email"
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />

                  {isFormSubmitted && emailErrors && (
                    <span className="error">{emailErrors}</span>
                  )}

                  <small className="form-text text-muted mt-2 d-block">
                    A secure link will be sent to this email to complete the
                    authentication process.
                  </small>
                </div>
              ) : (
                // Manual Mode - Password Input
                <div className="form-group mt-3">
                  <label className="form-label small" htmlFor="password">
                    Password<sup>*</sup>
                  </label>

                  <div className="d-flex align-items-center position-relative">
                    <InputText
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter password"
                      value={panPassword.trim()}
                      maxLength={25}
                      name="password"
                      onChange={(e) => handleChange(e.target.value)}
                      // onPaste={(e) => e.preventDefault()}
                      // onCopy={(e) => e.preventDefault()}
                      // onCut={(e) => e.preventDefault()}
                    />

                    <Button
                      className="btn position-absolute end-0 me-2 bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <img
                          src="/assets/images/eye.svg"
                          alt="eye-icon"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src="/assets/images/eye-slash.svg"
                          alt="eye-icon"
                          loading="lazy"
                        />
                      )}
                    </Button>
                  </div>

                  {isFormSubmitted && (
                    <span className="error">{panPasswordErrors}</span>
                  )}
                </div>
              )}

              {showNormalError && (
                <span className="error">{showNormalError}</span>
              )}

              <div className="form-group mt-4 d-flex">
                <Button
                  className="btn btn-black-line text-center w-100"
                  onClick={handleCancel}
                  label="Back"
                />

                {showGenerateReportButton ? (
                  <Button
                    className="btn btn-orange ms-2 w-100 text-center"
                    onClick={handleGenerateITRReport}
                    label="Generate Report"
                  />
                ) : (
                  <Button
                    className="btn btn-orange ms-2 w-100 text-center"
                    onClick={
                      useShareLink
                        ? handleShareLinkSubmit
                        : handleIncomeTaxDetail
                    }
                    label={useShareLink ? "Send Link" : "Get Details"}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <CreditNotAvailable
        isShow={showCreditPopup}
        onHide={() => setShowCreditPopup(false)}
        message="Your channel partner does not have credits. Please ask them to add the credits."
      />

      <ReFetchModal
        visible={showRefetchReport}
        onHide={() => setShowRefetchReport(false)}
        reportType={ReportType.IT_REPORT}
        daysLeft={incomeTaxReport?.itrReportRefetchedDays || 0}
        reportFetchFunction={() => {
          setShowITReports(true);
          setShowRefetchReport(false);
        }}
      />
    </>
  );
};

export default IncomeTaxReport;

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import {
  CLIENT_ROLE,
  PAYMENT_REQUEST_STATUS,
  RouteParams,
} from "../utils/constants/constant";
import { useEffect, useState } from "react";
import { IsStringNullEmptyOrUndefined } from "../utils/functions/nullCheck";
import { InputTextarea } from "primereact/inputtextarea";
import {
  createSpPaymentRequestAPI,
  fetchStatesAPI,
  generateCpPayoutInvoiceAPI,
  generateSpPayoutInvoiceAPI,
  updateSpPayOutRequestAPI,
} from "../utils/axios/apiServices";
import {
  IFetchStateResponseData,
  IGenerateCpPayoutInvoiceParams,
  IGenerateSpPayoutInvoiceParams,
  IPayOutsDetailList,
  IPayOutsUpdateStatusParams,
} from "../interface/payOuts";
import {
  formatDate,
  IsFormValid,
  toastError,
  toastSuccess,
} from "../utils/functions/shared";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import Loader from "./Loader";
import moment from "moment";
import { validationMessages } from "../utils/constants/messages";
import { InputText } from "primereact/inputtext";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { EMAIL_PATTERN, GST_NUMBER_PATTERN } from "../utils/constants/pattern";
import { encryptVAPTData } from "../utils/functions/encryptDecrypt";
import { Dropdown } from "primereact/dropdown";

interface CustomModalProps {
  status: (typeof PAYMENT_REQUEST_STATUS)[keyof typeof PAYMENT_REQUEST_STATUS];
  paymentModal: boolean;
  setPaymentModal: (value: boolean) => void;
  applicationID: string;
  fetchPayOutsDetailApi: () => Promise<void>;
  reason: string;
  setReason: (value: string) => void;
  selectedUserType?: number;
  selectedRowData: IPayOutsDetailList | null;
  setSelectedRowData: (value: IPayOutsDetailList | null) => void;
}

interface IFormValue {
  remarks: string;
  paymentDate: Nullable<Date>;
}

interface IFormError {
  remarks: string;
  paymentDate: string;
}

interface IValue {
  saccode: string;
  invoiceNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientGST: string;
  recipientAddress: string;
  recipientState: IFetchStateResponseData | null;
}

interface IValueErrors {
  saccode: string;
  invoiceNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientGST: string;
  recipientAddress: string;
  recipientState: string;
}

const CustomModal = ({
  status,
  paymentModal,
  setPaymentModal,
  applicationID,
  fetchPayOutsDetailApi,
  reason,
  setReason,
  selectedUserType,
  selectedRowData,
  setSelectedRowData,
}: CustomModalProps) => {
  const { userID, userType } = useSelector(
    (state: RootState) => state.user.user,
  );

  const [formValues, setFormValues] = useState<IFormValue>({
    remarks: "",
    paymentDate: null,
  });

  const [formErrors, setFormErrors] = useState<IFormError>({
    remarks: validationMessages.remarksRequired,
    paymentDate: validationMessages.paymentDateRequired,
  });

  const [values, setValues] = useState<IValue>({
    saccode: "",
    invoiceNumber: "",
    recipientName: "",
    recipientEmail: "",
    recipientGST: "",
    recipientAddress: "",
    recipientState: null,
  });

  const [valueErrors, setValueErrors] = useState<IValueErrors>({
    saccode: validationMessages.hsnNumberRequired,
    invoiceNumber: "",
    recipientName:
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? validationMessages.recipientNameRequired
        : "",
    recipientEmail:
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? validationMessages.recipientEmailRequired
        : "",
    recipientGST:
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? validationMessages.recipientGSTRequired
        : "",
    recipientAddress:
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? validationMessages.recipientAddressRequired
        : "",
    recipientState:
      userType === CLIENT_ROLE.CHANNEL_PARTNER
        ? validationMessages.stateRequired
        : "",
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [stateList, setStateList] = useState<IFetchStateResponseData[]>([]);

  const { id } = useParams<RouteParams>();

  const handleReset = () => {
    setPaymentModal(false);

    setFormErrors({
      remarks: validationMessages.remarksRequired,
      paymentDate: validationMessages.paymentDateRequired,
    });

    setFormValues({
      remarks: "",
      paymentDate: null,
    });

    setValues({
      saccode: "",
      invoiceNumber: "",
      recipientName: "",
      recipientEmail: "",
      recipientGST: "",
      recipientAddress: "",
      recipientState: null,
    });

    setValueErrors({
      saccode: validationMessages.hsnNumberRequired,
      invoiceNumber: "",
      recipientName:
        userType === CLIENT_ROLE.CHANNEL_PARTNER
          ? validationMessages.recipientNameRequired
          : "",
      recipientEmail:
        userType === CLIENT_ROLE.CHANNEL_PARTNER
          ? validationMessages.recipientEmailRequired
          : "",
      recipientGST:
        userType === CLIENT_ROLE.CHANNEL_PARTNER
          ? validationMessages.recipientGSTRequired
          : "",
      recipientAddress:
        userType === CLIENT_ROLE.CHANNEL_PARTNER
          ? validationMessages.recipientAddressRequired
          : "",
      recipientState:
        userType === CLIENT_ROLE.CHANNEL_PARTNER
          ? validationMessages.stateRequired
          : "",
    });

    setReason("");

    setIsFormSubmitted(false);

    setLoading(false);

    setSelectedRowData(null);
  };

  const handleGenerateInvoice = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const isValid: boolean = IsFormValid(valueErrors);

    if (!isValid || !id || !selectedRowData) return;

    setLoading(true);

    const payload: IGenerateCpPayoutInvoiceParams = {
      cpId: userID,
      applicationCode: selectedRowData?.applicationCode ?? "",
      disbursedDate: selectedRowData?.disbursementDate ?? "",
      payAmount: selectedRowData?.payAmount,
      gstAmount: selectedRowData?.gstAmount,
      tdsAmount: selectedRowData?.tdsAmount,
      netPayment: selectedRowData?.netPayment,
      applicationID,
      payoutId: id,
      saccode: values.saccode ? encryptVAPTData(values.saccode) : "",
      recipientName: values.recipientName,
      recipientGST: values.recipientGST
        ? encryptVAPTData(values.recipientGST)
        : "",
      recipientEmail: values.recipientEmail
        ? encryptVAPTData(values.recipientEmail)
        : "",
      recipientAddress: values.recipientAddress
        ? encryptVAPTData(values.recipientAddress)
        : "",
      recipientStateID: values.recipientState?.id || 0,
      recipientStateName: values.recipientState?.name || "",
      recipientStateCode: values.recipientState?.stateCode || "",
    };

    if (!IsStringNullEmptyOrUndefined(values.invoiceNumber))
      payload.userInvoiceNumber = encryptVAPTData(values.invoiceNumber);

    const response = await generateCpPayoutInvoiceAPI(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      window.open(response.data, "_blank");
      fetchPayOutsDetailApi();
    } else {
      toastError(response.message);
    }

    handleReset();
  };

  const handleCreatePaymentRequest = async (): Promise<void> => {
    setIsFormSubmitted(true);

    const isValid: boolean = IsFormValid(valueErrors);

    if (
      (status !== PAYMENT_REQUEST_STATUS.VIEW_REJECTED && !isValid) ||
      !id ||
      !selectedRowData
    )
      return;

    setLoading(true);

    const payload: IGenerateSpPayoutInvoiceParams = {
      spId: userID,
      applicationCode: selectedRowData?.applicationCode,
      disbursedDate: selectedRowData?.disbursementDate ?? "",
      payAmount: selectedRowData?.payAmount,
      gstAmount: selectedRowData?.gstAmount,
      tdsAmount: selectedRowData?.tdsAmount,
      netPayment: selectedRowData?.netPayment,
      applicationID,
      payoutId: id,
      recipientName: values.recipientName
        ? encryptVAPTData(values.recipientName)
        : "",
      recipientGST: values.recipientGST
        ? encryptVAPTData(values.recipientGST)
        : "",
      recipientEmail: values.recipientEmail
        ? encryptVAPTData(values.recipientEmail)
        : "",
      recipientAddress: values.recipientAddress
        ? encryptVAPTData(values.recipientAddress)
        : "",
    };

    if (
      !IsStringNullEmptyOrUndefined(values.saccode) ||
      !IsStringNullEmptyOrUndefined(selectedRowData?.saccode || "")
    ) {
      const saccode = values.saccode || selectedRowData?.saccode || "";

      payload.saccode = encryptVAPTData(saccode);
    }

    if (
      !IsStringNullEmptyOrUndefined(values.invoiceNumber) ||
      !IsStringNullEmptyOrUndefined(selectedRowData?.userInvoiceNumber || "")
    ) {
      const invoiceNumber =
        values.invoiceNumber || selectedRowData?.userInvoiceNumber || "";

      payload.userInvoiceNumber = encryptVAPTData(invoiceNumber);
    }

    const response = await createSpPaymentRequestAPI(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      fetchPayOutsDetailApi();
    } else {
      toastError(response.message);
    }

    handleReset();
  };

  const handleChangeStatus = async (): Promise<void> => {
    setIsFormSubmitted(true);

    if (status === PAYMENT_REQUEST_STATUS.COMPLETED) {
      const isValid: boolean = IsFormValid(formErrors);

      if (!isValid) return;
    }

    setLoading(true);

    const payload: IPayOutsUpdateStatusParams = {
      applicationID,
      userType: selectedUserType || CLIENT_ROLE.SOURCING_PARTNER,
      status,
    };

    if (reason) {
      payload.reason = reason;
    }

    if (formValues.remarks && formValues.paymentDate) {
      payload.remarks = formValues.remarks;
      payload.paymentDate = moment(new Date(formValues.paymentDate))
        .utcOffset("+05:30")
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    }

    const response = await updateSpPayOutRequestAPI(payload);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);

      // Completed is for the CP Payout and Rejected is for rejecting the SP Payout
      if (
        status === PAYMENT_REQUEST_STATUS.COMPLETED ||
        status === PAYMENT_REQUEST_STATUS.REJECTED
      ) {
        fetchPayOutsDetailApi();
      }

      if (status === PAYMENT_REQUEST_STATUS.APPROVED) {
        if (!selectedRowData || !id) return;

        const payload: IGenerateSpPayoutInvoiceParams = {
          spId: id,
          applicationCode: selectedRowData?.applicationCode ?? "",
          disbursedDate: selectedRowData?.disbursementDate ?? "",
          payAmount: selectedRowData?.payAmount,
          gstAmount: selectedRowData?.gstAmount,
          tdsAmount: selectedRowData?.tdsAmount,
          netPayment: selectedRowData?.netPayment,
          applicationID,
          payoutId: id,
          saccode: selectedRowData?.saccode ?? "",
          recipientAddress: values.recipientAddress
            ? encryptVAPTData(values.recipientAddress)
            : "",
          recipientEmail: values.recipientEmail
            ? encryptVAPTData(values.recipientEmail)
            : "",
          recipientGST: values.recipientGST
            ? encryptVAPTData(values.recipientGST)
            : "",
          recipientName: values.recipientName
            ? encryptVAPTData(values.recipientName)
            : "",
        };

        if (selectedRowData.userInvoiceNumber)
          payload.userInvoiceNumber = selectedRowData.userInvoiceNumber;

        const response = await generateSpPayoutInvoiceAPI(payload);

        if (!response) return;

        if (response && response.statusCode === 200) {
          toastSuccess(response.message);
          window.open(response.data, "_blank");
          fetchPayOutsDetailApi();
        } else {
          toastError(response.message);
        }
      }
    } else {
      toastError(response.message);
    }

    handleReset();
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        onClick={handleReset}
      >
        Cancel
      </Button>

      {status === PAYMENT_REQUEST_STATUS.INCOMPLETE && (
        <Button
          className="btn btn-orange w-100"
          onClick={handleCreatePaymentRequest}
        >
          Request
        </Button>
      )}

      {status === PAYMENT_REQUEST_STATUS.APPROVED && (
        <Button className="btn btn-orange w-100" onClick={handleChangeStatus}>
          Approve
        </Button>
      )}

      {status === PAYMENT_REQUEST_STATUS.HSN_NUMBER && (
        <Button
          className="btn btn-orange w-100"
          onClick={handleGenerateInvoice}
        >
          Generate Invoice
        </Button>
      )}

      {status === PAYMENT_REQUEST_STATUS.REJECTED && (
        <Button
          className={`btn ${
            IsStringNullEmptyOrUndefined(reason)
              ? "btn-orange-disabled"
              : "btn-orange"
          } w-100`}
          disabled={IsStringNullEmptyOrUndefined(reason)}
          onClick={handleChangeStatus}
        >
          Reject
        </Button>
      )}

      {status === PAYMENT_REQUEST_STATUS.COMPLETED && (
        <Button className="btn btn-orange w-100" onClick={handleChangeStatus}>
          Save
        </Button>
      )}

      {status === PAYMENT_REQUEST_STATUS.VIEW_REJECTED && (
        <Button
          className="btn btn-orange w-100"
          onClick={handleCreatePaymentRequest}
        >
          Request Again
        </Button>
      )}
    </div>
  );

  const handleChange = (fieldName: string, value: any): void => {
    switch (fieldName) {
      case "reason":
        setReason(value);
        break;

      case "remarks":
        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.remarksRequired
            : "",
        });

        setFormValues({
          ...formValues,
          remarks: value,
        });

        break;

      case "paymentDate":
        setFormErrors({
          ...formErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.paymentDateRequired
            : "",
        });

        setFormValues({
          ...formValues,
          paymentDate: value,
        });
        break;

      case "saccode":
        setValueErrors({
          ...valueErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.hsnNumberRequired
            : "",
        });

        setValues({
          ...values,
          saccode: value,
        });
        break;

      case "recipientName":
        setValueErrors({
          ...valueErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.recipientNameRequired
            : "",
        });

        setValues({
          ...values,
          recipientName: value,
        });
        break;

      case "recipientEmail": {
        const isValid: boolean = EMAIL_PATTERN.test(value);

        setValueErrors({
          ...valueErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.recipientEmailRequired
            : !isValid
              ? validationMessages.emailInvalid
              : "",
        });

        setValues({
          ...values,
          recipientEmail: value,
        });
        break;
      }

      case "recipientGST": {
        const isValid: boolean = GST_NUMBER_PATTERN.test(value);

        setValueErrors({
          ...valueErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.recipientGSTRequired
            : !isValid
              ? validationMessages.gstNumberInvalid
              : "",
        });

        setValues({
          ...values,
          recipientGST: value,
        });
        break;
      }

      case "recipientAddress":
        setValueErrors({
          ...valueErrors,
          [fieldName]: IsStringNullEmptyOrUndefined(value)
            ? validationMessages.recipientAddressRequired
            : "",
        });

        setValues({
          ...values,
          recipientAddress: value,
        });
        break;

      case "recipientState":
        setValueErrors({
          ...valueErrors,
          recipientState: !value ? validationMessages.stateRequired : "",
        });

        setValues({
          ...values,
          recipientState: value,
        });
        break;

      case "invoiceNumber":
        setValues({
          ...values,
          invoiceNumber: value,
        });
        break;

      default:
        break;
    }
  };

  const fetchStates = async () => {
    const response = await fetchStatesAPI();

    if (!response) return;

    if (response && response.statusCode === 200) {
      setStateList(response.data);
    }
  };

  useEffect(() => {
    if (paymentModal && status === PAYMENT_REQUEST_STATUS.HSN_NUMBER) {
      fetchStates();
    }
  }, [paymentModal, status]);

  return (
    <Dialog
      visible={paymentModal}
      className="modalWrapper"
      onHide={handleReset}
      draggable={false}
      resizable={false}
      footer={footerContent}
      style={{
        width: `${status === PAYMENT_REQUEST_STATUS.HSN_NUMBER ? "95vw" : "500px"}`,
        maxWidth: "1000px",
      }}
      blockScroll
      contentStyle={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <div className="modal-content">
        <Loader isLoading={loading} />

        <div className="modal-body">
          {status === PAYMENT_REQUEST_STATUS.INCOMPLETE && (
            <>
              <div className="p-2">
                <h2 className="fw-bold txt-24">Request Payout Invoice</h2>
                <p className="mb-3 mt-3 modal-text">
                  Request Channel Partner for the payout invoice and enter SAC
                  Code and invoice number.
                </p>
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="saccode">
                  SAC Code <sup>*</sup>
                </label>

                <InputText
                  name="saccode"
                  value={values.saccode}
                  className="form-control"
                  placeholder="Enter the SAC Code"
                  maxLength={50}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  // onCopy={(e) => e.preventDefault()}
                  // onPaste={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{valueErrors.saccode}</span>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="invoiceNumber">
                  Invoice Number
                </label>

                <InputText
                  name="invoiceNumber"
                  value={values.invoiceNumber}
                  className="form-control"
                  placeholder="Enter the Invoice Number"
                  maxLength={50}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  // onCopy={(e) => e.preventDefault()}
                  // onPaste={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            </>
          )}

          {status === PAYMENT_REQUEST_STATUS.APPROVED && (
            <div className="text-center p-2">
              <h2 className="fw-bold txt-24">Approve Payment Request</h2>
              <p className="mb-3 mt-3 modal-text">
                Are you sure you want to approve this payment request raised by
                the Sourcing Partner?
              </p>
            </div>
          )}

          {status === PAYMENT_REQUEST_STATUS.HSN_NUMBER && (
            <div
              className="p-2"
              style={{
                maxHeight: "70vh",
              }}
            >
              <div className="text-center">
                <h2 className="fw-bold txt-24">Generate Invoice</h2>
                <p className="mb-3 mt-3 modal-text">
                  Please enter the required fields
                </p>
              </div>

              <div className="row">
                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="saccode">
                    SAC Code <sup>*</sup>
                  </label>

                  <InputText
                    name="saccode"
                    value={values.saccode}
                    className="form-control"
                    placeholder="Enter the SAC Code"
                    maxLength={50}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">{valueErrors.saccode}</span>
                  )}
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="invoiceNumber">
                    Invoice Number
                  </label>

                  <InputText
                    name="invoiceNumber"
                    value={values.invoiceNumber}
                    className="form-control"
                    placeholder="Enter the Invoice Number"
                    maxLength={50}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="recipientName">
                    Recipient Name <sup>*</sup>
                  </label>

                  <InputText
                    name="recipientName"
                    value={values.recipientName}
                    className="form-control"
                    placeholder="Enter the Recipient Name"
                    maxLength={50}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">{valueErrors.recipientName}</span>
                  )}
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="recipientEmail">
                    Recipient Email <sup>*</sup>
                  </label>

                  <InputText
                    name="recipientEmail"
                    value={values.recipientEmail}
                    className="form-control"
                    placeholder="Enter the Recipient Email"
                    maxLength={50}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">{valueErrors.recipientEmail}</span>
                  )}
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="recipientGST">
                    Recipient GST <sup>*</sup>
                  </label>

                  <InputText
                    name="recipientGST"
                    value={values.recipientGST}
                    className="form-control"
                    placeholder="Enter the Recipient GST"
                    maxLength={15}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">{valueErrors.recipientGST}</span>
                  )}
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label
                    className="form-label small"
                    htmlFor="recipientAddress"
                  >
                    Recipient Address <sup>*</sup>
                  </label>

                  <InputText
                    name="recipientAddress"
                    value={values.recipientAddress}
                    className="form-control"
                    placeholder="Enter the Recipient Address"
                    maxLength={50}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    // onCopy={(e) => e.preventDefault()}
                    // onPaste={(e) => e.preventDefault()}
                    // onCut={(e) => e.preventDefault()}
                  />

                  {isFormSubmitted && (
                    <span className="error">
                      {valueErrors.recipientAddress}
                    </span>
                  )}
                </div>

                <div className="form-group col-md-6 col-lg-6 col-12 mb-3">
                  <label className="form-label small" htmlFor="recipientState">
                    Recipient state <sup>*</sup>
                  </label>

                  <Dropdown
                    name="recipientState"
                    value={values.recipientState}
                    options={stateList}
                    optionLabel="name"
                    placeholder="Select State"
                    className="w-100"
                    showClear
                    filter
                    onChange={(e) => handleChange("recipientState", e.value)}
                  />

                  {isFormSubmitted && (
                    <span className="error">{valueErrors.recipientState}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === PAYMENT_REQUEST_STATUS.REJECTED && (
            <div className="p-2">
              <div className="text-center">
                <h2 className="fw-bold txt-24">Reject Payment Request</h2>
                <p className="mb-3 mt-3 modal-text">
                  Are you sure you want to reject this payment request raised by
                  the Sourcing Partner?
                </p>
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="reason">
                  Reason <sup>*</sup>
                </label>

                <InputTextarea
                  name="reason"
                  value={reason}
                  className="form-control"
                  placeholder="Enter the reason"
                  maxLength={500}
                  rows={5}
                  cols={30}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  // onCopy={(e) => e.preventDefault()}
                  // onPaste={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />
              </div>
            </div>
          )}

          {selectedRowData &&
            status === PAYMENT_REQUEST_STATUS.VIEW_REMARKS && (
              <div className="text-center">
                <h2 className="fw-bold txt-24">View Remarks</h2>

                <div className="d-flex flex-column text-start mt-3">
                  <label className="form-label small" htmlFor="reason">
                    Remarks
                  </label>

                  <InputTextarea
                    name="remarks"
                    value={selectedRowData?.remarks?.trimStart()}
                    className="form-control"
                    placeholder="Enter the remarks"
                    rows={5}
                    cols={30}
                    disabled
                  />
                </div>

                <div className="d-flex flex-column text-start mt-3">
                  <label className="form-label small" htmlFor="reason">
                    Payment Received Date
                  </label>

                  <InputText
                    name="paymentDate"
                    value={
                      selectedRowData?.paymentDate
                        ? formatDate(selectedRowData?.paymentDate, "DD-MM-YYYY")
                        : ""
                    }
                    disabled
                    placeholder="Select Date"
                    className="w-100"
                  />
                </div>
              </div>
            )}

          {status === PAYMENT_REQUEST_STATUS.COMPLETED && (
            <>
              <h2 className="fw-bold txt-24">Enter Remarks</h2>
              <p className="mb-3 mt-3 modal-text">
                Enter the remarks and select date for the transaction.
              </p>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="reason">
                  Remarks<sup>*</sup>
                </label>

                <InputTextarea
                  name="remarks"
                  value={formValues.remarks.trimStart()}
                  className="form-control"
                  placeholder="Enter the remarks"
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  rows={5}
                  cols={30}
                  maxLength={250}
                  // onCopy={(e) => e.preventDefault()}
                  // onPaste={(e) => e.preventDefault()}
                  // onCut={(e) => e.preventDefault()}
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.remarks}</span>
                )}
              </div>

              <div className="form-group mb-3">
                <label className="form-label small" htmlFor="reason">
                  Payment Received Date<sup>*</sup>
                </label>

                <Calendar
                  inputId="paymentDate"
                  name="paymentDate"
                  value={formValues.paymentDate}
                  onChange={(e) => handleChange(e.target.name, e.value)}
                  placeholder="Select Date"
                  className="w-100"
                  maxDate={new Date()}
                  showButtonBar
                />

                {isFormSubmitted && (
                  <span className="error">{formErrors.paymentDate}</span>
                )}
              </div>
            </>
          )}

          {status === PAYMENT_REQUEST_STATUS.VIEW_REJECTED && (
            <div className="p-2">
              <h2 className="text-center">Payment Rejected</h2>
              <div className="form-group my-3">
                <label className="form-label mb-3" htmlFor="reason">
                  Reason
                </label>

                <InputTextarea
                  name="reason"
                  value={reason}
                  className="form-control"
                  placeholder="Enter the reason"
                  rows={5}
                  cols={30}
                  readOnly
                  disabled
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default CustomModal;

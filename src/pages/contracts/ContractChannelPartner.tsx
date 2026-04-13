import { InputText } from "primereact/inputtext";
import { useEffect, useRef, useState } from "react";
import {
  getContentAPI,
  getContractListAPI,
  sendOTPAPI,
  updateContentAPI,
  updateContractStatusAPI,
} from "../../utils/axios/apiServices";
import {
  IContractListItemData,
  IContractListParams,
  IContractListResponse,
  IContractParams,
  IContractResponse,
  IContractResponseData,
  IUpdatedContractBody,
  OnlyMobileNumber,
} from "../../interface/contract";
import Editor from "../../components/Editor";
import { Button } from "primereact/button";
import {
  CLIENT_ROLE,
  ContractSigned,
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { APIResponseEntity } from "../../interface/apiResponse";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PrimePaginator from "../../components/PrimePaginator";
import { PaginateReqEntity } from "../../interface/pagination";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import useDebouncedEffect from "../../hooks/useDebounce";
import { Dialog } from "primereact/dialog";
import {
  cleanCmsContent,
  formatDate,
  formatTime,
  sanitizeHTML,
  startOfDay,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { InputOtp } from "primereact/inputotp";
import { INDIAN_MOBILE_NUMBER_PATTERN } from "../../utils/constants/pattern";
import {
  IsNullOrEmptyArray,
  IsStringNullEmptyOrUndefined,
} from "../../utils/functions/nullCheck";
import Congratulation from "../applyLoan/Congratulation";
import { ILogoutResponse } from "../../interface/logout";
import SearchButton from "../../components/SearchButton";
import TableTitle from "../../components/TableTitle";
import { updateShowPanDetailPopUp } from "../../store/reducer/userSlice";
import { environment } from "../../utils/constants/environments";
import {
  ContractType,
  OtpRequestType,
  OTPType,
} from "../../utils/constants/enum";
import { ISendOTPResponse } from "../../interface/signIn";
import { validationMessages } from "../../utils/constants/messages";
import {
  decryptVAPTData,
  encryptVAPTData,
} from "../../utils/functions/encryptDecrypt";
import { Calendar } from "primereact/calendar";
import moment from "moment";

export interface IMobileNumberFormData {
  mobileNumber: string;
}

const ContractChannelPartner = () => {
  const [channelPartners, setChannelPartners] = useState<
    IContractListItemData[]
  >([]);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageSize: 10,
    pageNumber: 0,
    searchText: "",
  });

  const [searchText, setSearchText] = useState<string>("");

  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [contract, setContract] = useState<IContractResponseData>({
    isAgreed: false,
    content: "",
    updatedDate: "",
  });

  const [acceptContract, setAcceptContract] = useState<boolean>(false);

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [showMobileOTP, setShowMobileOTP] = useState<boolean>(false);

  const [otpValues, setOtpValues] = useState<number | undefined>(undefined);

  const [congratulationMessage, setCongratulationMessage] =
    useState<boolean>(false);

  const [congratulationMessageCount, setCongratulationMessageCount] =
    useState<number>(0);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [showModal, setShowModal] = useState<boolean>(false);

  const [enforcementDate, setEnforcementDate] = useState<Date | null>(null);

  const today = startOfDay(new Date());

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const { userType, userID } = useSelector(
    (state: RootState) => state.user.user
  );

  const userData = useSelector((state: RootState) => state.user.user);

  const { create } = usePermission("ContractChannelPartner", ["create"])();

  const dispatch = useDispatch();

  const dropdownRef = useRef<any>(null);

  const otpRef = useRef<HTMLInputElement | null>(null);

  const truncateContent = (content: string, wordLimit: number): string => {
    const words = content?.split(" ");

    if (words?.length > wordLimit) {
      return words?.slice(0, wordLimit).join(" ") + "...";
    }
    return content;
  };

  const fetchChannelPartners = async (): Promise<void> => {
    if (userType !== CLIENT_ROLE.SUPER_ADMIN) {
      return;
    }

    setLoading(true);

    const queryParams: IContractListParams = {
      page: filterReq.pageNumber + 1,
      pageSize: filterReq.pageSize,
      userType: CLIENT_ROLE.CHANNEL_PARTNER,
    };

    if (filterReq?.searchText?.trim()) {
      queryParams.user = filterReq?.searchText?.trim();
    }

    const response: IContractListResponse = await getContractListAPI(
      queryParams
    );

    if (!response) return;

    if (response?.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        contractList: response.data.contractList.map((item) => ({
          ...item,
          mobileNumber: item.mobileNumber
            ? decryptVAPTData(item.mobileNumber)
            : "",
        })),
      };

      setChannelPartners(decryptedData.contractList);
      setTotalRecords(response.data.totalCount);
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const fetchChannelPartnersContracts = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IContractParams = {
      pageName: ContractType.CONTRACT,
      contractTypeID: ContractSigned.ADMIN_TO_CP,
    };

    const response: IContractResponse = await getContentAPI(queryParams);

    if (!response) return;

    if (response && response?.statusCode === 200) {
      setContract({
        ...response.data,
        content: cleanCmsContent(response.data.content),
      });
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const handleSaveContent = async (): Promise<void> => {
    if (contract.content.trim() === "<p><br></p>") {
      toastError(validationMessages.contentRequired);
      return;
    }

    if (!enforcementDate) {
      toastError(validationMessages.enforcementDateRequired);
      return;
    }

    const chosen = startOfDay(enforcementDate).getTime();
    const min = tomorrow.getTime();

    if (chosen < min) {
      toastError(validationMessages.enforcementDateInvalid);
      return;
    }

    const contractEnforcementDate = moment(new Date(enforcementDate))
      .utcOffset("+05:30")
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    const body: IUpdatedContractBody = {
      pageName: ContractType.CONTRACT,
      description: sanitizeHTML(contract?.content),
      contractID: ContractSigned.ADMIN_TO_CP,
      contractEnforcementDate,
    };

    setLoading(true);

    try {
      const response: ILogoutResponse = await updateContentAPI(body);

      if (!response) return;

      const updatedUser = {
        ...userData,
        isContractSigned: true,
      };

      if (response && response?.statusCode === 200) {
        toastSuccess(response?.message);
        fetchChannelPartnersContracts();
        dispatch(updateShowPanDetailPopUp(updatedUser));
        fetchChannelPartners();
      } else {
        toastError(response?.message);
      }

      setShowModal(false);
      setEnforcementDate(null);
      setIsEditable(false);
    } catch (error) {
      setShowModal(false);
      setEnforcementDate(null);
      setIsEditable(false);
    }

    setLoading(false);
  };

  const handleOpenModal = async (): Promise<void> => {
    if (contract.content.trim() === "<p><br></p>") {
      toastError(validationMessages.contentRequired);
      return;
    }

    setShowModal(true);
  };

  const handleCloseModal = async (): Promise<void> => {
    setShowModal(false);
    setEnforcementDate(null);
  };

  const handleOtpChange = (value: string | number | null | undefined): void => {
    if (typeof value === "number") {
      setOtpValues(value);
    } else if (typeof value === "string") {
      setOtpValues(Number(value));
    } else {
      setOtpValues(undefined);
    }
  };

  const handleAgree = async (): Promise<void> => {
    if (!otpValues || otpValues.toString().length !== OTPType.FOUR_DIGIT_OTP) {
      toastError(`Please enter a valid ${OTPType.FOUR_DIGIT_OTP}-digit OTP`);
      return;
    }

    const body = {
      otp: otpValues,
      mobileNumber: encryptVAPTData(userData.mobileNumber),
      userID,
      status: true,
    };

    setLoading(true);

    const response: APIResponseEntity = await updateContractStatusAPI(body);

    if (!response) return;

    if (response && response?.statusCode === 200) {
      setCongratulationMessage(true);
      setCongratulationMessageCount((prev) => prev + 1);
      const updatedUser = {
        ...userData,
        isContractSigned: true,
      };

      dispatch(updateShowPanDetailPopUp(updatedUser));
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const statusBodyTemplate = (rowData: IContractListItemData): JSX.Element => {
    const isSigned = Boolean(rowData.contractSigned);
    const statusClass = isSigned ? "greenLine" : "redLine";
    const statusText = isSigned ? "Agreed" : "Pending";

    return <span className={`StatusLabel ${statusClass}`}>{statusText}</span>;
  };

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq({
      ...filterReq,
      pageSize: event.rows,
      pageNumber: event.page,
    });
  };

  const handleReset = (): void => {
    setAcceptContract(false);
    setShowMobileOTP(false);
    setOtpValues(undefined);
    setCongratulationMessage(false);
    setCongratulationMessageCount(0);
  };

  const handleGetMobileOTP = async (): Promise<void> => {
    setLoading(true);

    let errorMessage = "";

    if (userData.mobileNumber.length === 0) {
      errorMessage = validationMessages.mobileNumberRequired;
    } else if (
      userData.mobileNumber.length !== 10 ||
      !INDIAN_MOBILE_NUMBER_PATTERN.test(userData.mobileNumber)
    ) {
      errorMessage = validationMessages.mobileNumberInvalid;
    }

    if (!IsStringNullEmptyOrUndefined(errorMessage)) {
      toastError(errorMessage);
      setLoading(false);
      return;
    }

    const body: OnlyMobileNumber = {
      emailID: encryptVAPTData(userData.emailID),
      mobileNumber: encryptVAPTData(userData.mobileNumber),
      otpType: OtpRequestType.CONTRACT,
    };

    const response: ISendOTPResponse = await sendOTPAPI(body);

    if (!response) return;

    if (response.statusCode === 200) {
      setShowMobileOTP(true);
      setOtpValues(undefined);
      toastSuccess(response.message);

      setTimeLeft(environment.OTP_TIMER);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const footerContent = (
    <div className="modal-footer gap-3">
      {!showMobileOTP && (
        <>
          <Button
            className="btn btn-black-line w-100"
            data-bs-dismiss="modal"
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className={`btn ${
              loading ? "btn-orange-disabled" : "btn-orange"
            } w-100`}
            onClick={handleGetMobileOTP}
            disabled={loading}
          >
            {loading ? "Sending OTP" : "Get OTP"}
          </Button>
        </>
      )}

      {showMobileOTP && (
        <>
          <Button
            className="btn btn-black-line w-100"
            data-bs-dismiss="modal"
            onClick={handleReset}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className={`btn ${
              loading ? "btn-orange-disabled" : "btn-orange"
            } w-100`}
            onClick={handleAgree}
            disabled={loading}
          >
            {loading ? "Signing the contract..." : "Submit"}
          </Button>
        </>
      )}
    </div>
  );

  const updateFooterContent = (
    <div className="modal-footer gap-3">
      <Button
        className="btn btn-black-line w-100"
        data-bs-dismiss="modal"
        onClick={handleCloseModal}
        disabled={loading}
      >
        Cancel
      </Button>

      <Button
        className={`btn ${
          loading ? "btn-orange-disabled" : "btn-orange"
        } w-100`}
        onClick={handleSaveContent}
        disabled={loading}
        autoFocus
      >
        {loading ? "Updating" : "Submit"}
      </Button>
    </div>
  );

  const resendOTP = async (): Promise<void> => {
    setLoading(true);
    setTimeLeft(environment.OTP_TIMER);

    const body: OnlyMobileNumber = {
      emailID: encryptVAPTData(userData.emailID),
      mobileNumber: encryptVAPTData(userData.mobileNumber),
      otpType: OtpRequestType.CONTRACT,
    };

    const response: ISendOTPResponse = await sendOTPAPI(body);

    if (!response) return;

    if (response && response?.statusCode === 200) {
      toastSuccess(response?.message);
    } else {
      toastError(response?.message);
    }

    setLoading(false);
  };

  const handleEnforcementDateChange = (value: Date | null): void => {
    setEnforcementDate(value ?? null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  useEffect(() => {
    if (showMobileOTP) {
      setTimeout(() => {
        const firstInput = document.querySelector(
          ".p-inputotp input"
        ) as HTMLInputElement;
        firstInput?.focus();
      }, 0);
    }
  }, [showMobileOTP]);

  useEffect(() => {
    if (userType === CLIENT_ROLE.SUPER_ADMIN) {
      fetchChannelPartners();
    }
  }, [
    filterReq.pageNumber,
    filterReq.pageSize,
    userType,
    filterReq.searchText,
  ]);

  useEffect(() => {
    fetchChannelPartnersContracts();
  }, []);

  useEffect(() => {
    if (congratulationMessage) {
      const timer = setTimeout(() => {
        handleReset();
        fetchChannelPartnersContracts();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [congratulationMessageCount]);

  useEffect(() => {
    if (otpValues && otpValues.toString().length === OTPType.FOUR_DIGIT_OTP) {
      handleAgree();
    }
  }, [otpValues]);

  useDebouncedEffect(
    () => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        setFilterReq((prev) => ({
          ...prev,
          searchText: searchText.trim(),
          pageNumber: 0,
        }));
      }
    },
    debounceTimeInMilliseconds,
    [searchText]
  );

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const panel = document.querySelector(".p-dropdown-panel");
      const target = event.target as HTMLElement;

      if (panel && panel.contains(target)) {
        return;
      }

      if (dropdownRef.current) {
        dropdownRef.current.hide();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <div className="d-flex flex-column">
              <TableTitle title="Channel Partner Contract" />
              <p className="txt-14">
                Last Updated:{" "}
                {contract?.updatedDate ? formatDate(contract?.updatedDate) : ""}
              </p>
            </div>

            {!isEditable && userType === CLIENT_ROLE.SUPER_ADMIN && create && (
              <div className="BtnRightHldr">
                <div className="form-group">
                  <Button
                    className="btn btn-orange"
                    onClick={() => setIsEditable(true)}
                  >
                    Edit Contract <i className="bi bi-pencil-fill ms-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-12 mt-4 mb-4">
              {isEditable ? (
                <Editor
                  content={contract?.content}
                  setContent={(value) =>
                    setContract((prevState) => ({
                      ...prevState,
                      content: value,
                    }))
                  }
                />
              ) : (
                <div>
                  <div
                    className="ql-editor-preview"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(
                        isExpanded
                          ? contract?.content
                          : truncateContent(contract?.content, 250)
                      ),
                    }}
                  />

                  {contract?.content?.split(" ").length > 250 && (
                    <Button
                      className="btn btn-link trash-icon p-0 txt-orange"
                      style={{ textDecoration: "none" }}
                      label={isExpanded ? "View Less" : "View More"}
                      onClick={() => setIsExpanded(!isExpanded)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditable && (
            <div className="col-lg-3 col-md-3 col-sm-6 col-12 mb-4">
              <Button
                className={`btn ${
                  loading ? "btn-orange-disabled" : "btn-orange"
                }`}
                onClick={handleOpenModal}
                label="Update"
                disabled={loading}
              />

              <Button
                className="btn btn-black-line ms-2"
                onClick={() => {
                  setIsEditable(false);
                  fetchChannelPartnersContracts();
                }}
                label="Cancel"
              />
            </div>
          )}
        </div>
      </div>

      {userType === CLIENT_ROLE.SUPER_ADMIN && (
        <div className="row">
          <div className="col-lg-12">
            <div className="col-12 mb-4 titleBtnWrapper">
              <TableTitle title="Channel Partners" />

              <div className="BtnRightHldr">
                <SearchButton
                  searchText={searchText}
                  setSearchText={setSearchText}
                  placeholder="Search"
                />
              </div>
            </div>

            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={channelPartners}
                emptyMessage="No channel partner found"
              >
                <Column field="userCode" header="Channel Partner Code" />

                <Column field="name" header="Channel Partner Name" />

                <Column
                  body={(rowData: IContractListItemData) =>
                    formatMobileNumber(rowData.mobileNumber)
                  }
                  header="Mobile Number"
                />

                <Column
                  body={(rowData: IContractListItemData) =>
                    rowData.contractSigned
                      ? formatDate(rowData.contractSigned)
                      : "-"
                  }
                  header="Contract Signed"
                />

                <Column body={statusBodyTemplate} header="Status" />
              </DataTable>
            </div>

            {!IsNullOrEmptyArray(channelPartners) && (
              <PrimePaginator
                onPageChange={onPageChange}
                pageNumber={filterReq.pageNumber}
                pageSize={filterReq.pageSize}
                totalRecords={totalRecords}
              />
            )}
          </div>
        </div>
      )}

      {!contract?.isAgreed && userType === CLIENT_ROLE.CHANNEL_PARTNER && (
        <div className="BtnRightHldr">
          <div className="d-flex form-group justify-content-end">
            <Button
              className="btn btn-orange"
              onClick={() => setAcceptContract(true)}
              label="Agree"
            />
          </div>
        </div>
      )}

      <Dialog
        header={!congratulationMessage && "Contract Agreement"}
        visible={acceptContract}
        modal
        onHide={() => setAcceptContract(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        footer={!congratulationMessage && footerContent}
        style={{ width: "500px" }}
      >
        <div className="modalWrapper modal-dialog modal-dialog-centered p-0">
          <Loader isLoading={loading} />

          <div className="modal-content">
            <div className="modal-body">
              {!congratulationMessage && (
                <>
                  <p className="modal-text">
                    By entering your mobile number, you agree to the Terms &
                    Conditions for the contract. Your mobile number and OTP
                    verification will be considered as your virtual signature.
                  </p>

                  {!showMobileOTP && (
                    <div className="form-group mt-3">
                      <label
                        className="form-label small"
                        htmlFor="mobileNumber"
                      >
                        Mobile Number <sup>*</sup>
                      </label>

                      <InputText
                        id="mobileNumber"
                        maxLength={10}
                        className="form-control"
                        name="mobileNumber"
                        // onPaste={(e) => e.preventDefault()}
                        // onCopy={(e) => e.preventDefault()}
                        // onCut={(e) => e.preventDefault()}
                        disabled
                        placeholder="Enter your Mobile Number"
                        value={formatMobileNumber(userData.mobileNumber)}
                      />
                    </div>
                  )}

                  {showMobileOTP && (
                    <div className="form-group mt-3">
                      <label className="form-label small" htmlFor="otpInput">
                        Enter OTP <sup>*</sup>
                      </label>

                      <InputOtp
                        id="otpInput"
                        integerOnly
                        ref={otpRef}
                        value={otpValues}
                        length={OTPType.FOUR_DIGIT_OTP}
                        onChange={(e) => handleOtpChange(e.value)}
                      />

                      {timeLeft > 0 ? (
                        <b
                          className="txt-14"
                          style={{ fontWeight: "600" }}
                        >{`Resend OTP in ${formatTime(timeLeft)}`}</b>
                      ) : (
                        <Button
                          className="resendBtn"
                          onClick={resendOTP}
                          label="Resend OTP"
                          disabled={loading || timeLeft > 0}
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              {congratulationMessage && (
                <Congratulation message="Thank you! Your contract has been registered with the Credorbit." />
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showModal}
        onHide={handleCloseModal}
        footer={updateFooterContent}
        modal
        className="modalWrapper"
        draggable={false}
        resizable={false}
        header="Update Contract"
        style={{ width: "500px" }}
        blockScroll
      >
        <div className="modalWrapper modal-dialog modal-dialog-centered p-0">
          <div className="modal-content">
            <div className="modal-body">
              <p className="modal-text">
                By updating the contract, you agree to the Terms & Conditions
                for the contract. Please select the enforcement date to update
                the contract.
              </p>

              <div className="form-group mt-3">
                <label className="form-label small" htmlFor="enforcementDate">
                  Enforcement Date <sup>*</sup>
                </label>

                <Calendar
                  ref={dropdownRef}
                  inputId="enforcementDate"
                  name="enforcementDate"
                  value={enforcementDate}
                  onChange={(e) =>
                    handleEnforcementDateChange(e.value as Date | null)
                  }
                  placeholder="Select Date"
                  className="w-100"
                  minDate={tomorrow}
                  showButtonBar
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ContractChannelPartner;

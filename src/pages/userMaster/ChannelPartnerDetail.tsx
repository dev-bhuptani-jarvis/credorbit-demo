import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getChannelPartnerDetail,
  updatePayOutsDetailsAPI,
} from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  IChannelPartnerDetail,
  IChannelPartnerDetailResponse,
  IChannelPartnerParams,
} from "../../interface/channelPartner";
import {
  CLIENT_ROLE,
  formatMobileNumber,
  RouteParams,
} from "../../utils/constants/constant";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader";
import { InputText } from "primereact/inputtext";
import { APIResponseEntity } from "../../interface/apiResponse";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { NUMBER_WITH_SINGLE_DOT_PATTERN } from "../../utils/constants/pattern";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const ChannelPartnerDetail = () => {
  const [channelPartnerDetail, setChannelPartnerDetail] =
    useState<IChannelPartnerDetail>();

  const [payOutError, setPayOutError] = useState<string>("");

  const { id } = useParams<RouteParams>();

  const [loading, setLoading] = useState<boolean>(false);

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [updatedPayOutPercent, setUpdatedPayOutPercent] = useState<
    string | null
  >(null);

  const fetchChannelPartnerDetailApi = async (): Promise<void> => {
    setLoading(true);

    if (!id) return;

    const params: IChannelPartnerParams = {
      userId: id,
      userType: CLIENT_ROLE.SUPER_ADMIN,
    };

    const response: IChannelPartnerDetailResponse =
      await getChannelPartnerDetail(params);

    if (!response) return;

    if (response && response.statusCode === 200) {
      const decryptedData = {
        ...response.data,
        mobileNumber: decryptVAPTData(response.data.mobileNumber),
        email: decryptVAPTData(response.data.email),
        panNumber: response.data.panNumber
          ? decryptVAPTData(response.data.panNumber)
          : "-",
      };

      setChannelPartnerDetail(decryptedData);

      setUpdatedPayOutPercent(
        response.data.payOuts ? String(response.data.payOuts) : "0"
      );
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleSave = async (): Promise<void> => {
    if (!updatedPayOutPercent || updatedPayOutPercent.trim() === "") {
      setPayOutError("Payout percentage is required");
      return;
    }

    setLoading(true);

    const body: {
      userID: string;
      percent: number;
    } = {
      userID: String(channelPartnerDetail?.id),
      percent: Number(updatedPayOutPercent),
    };

    const response: APIResponseEntity = await updatePayOutsDetailsAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      toastSuccess(response.message);
      setIsEditable(false);
      setUpdatedPayOutPercent(null);
      fetchChannelPartnerDetailApi();
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchChannelPartnerDetailApi();
  }, [id]);

  return (
    <div className="row">
      <Loader isLoading={loading} />
      <div className="col-lg-12 col-md-12 col-sm-12 col-12">
        <div className="whiteBoxHldr p-30">
          <div className="row">
            <div className="col-12">
              <h2 className="txt-24">Channel Partner</h2>
              <div className="row">
                <div className="col-12 mt-4">
                  <div className="borderBoxHldr p-24">
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Channel Partner Code</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.code}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Channel Partner Code</b>
                            <p className="text-break">
                              {channelPartnerDetail?.code}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Channel Partner Name</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.name}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Channel Partner Name</b>
                            <p className="text-break">
                              {channelPartnerDetail?.name}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Mobile Number</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.mobileNumber}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Mobile Number</b>
                            <p className="text-break">
                              {formatMobileNumber(
                                channelPartnerDetail?.mobileNumber
                              )}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Email</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.email}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Email</b>
                            <p className="text-break">
                              {channelPartnerDetail?.email}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>PAN Number</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.panNumber ?? "-"}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">PAN Number</b>
                            <p className="text-break">
                              {channelPartnerDetail?.panNumber ?? "-"}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <FloatLabel>
                            <span>
                              Payout Sharing Rate(%)
                              <sup className="text-danger">*</sup>
                            </span>
                            <InputText
                              variant="filled"
                              id="payOuts"
                              className="form-control h-50px"
                              value={
                                updatedPayOutPercent !== null
                                  ? String(updatedPayOutPercent)
                                  : String(channelPartnerDetail?.payOuts)
                              }
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                              onChange={(e) => {
                                const value = e.target.value.trim();

                                if (
                                  NUMBER_WITH_SINGLE_DOT_PATTERN.test(value)
                                ) {
                                  setUpdatedPayOutPercent(value);
                                  setPayOutError("");
                                } else {
                                  setPayOutError("Invalid payout format");
                                }
                              }}
                            />

                            {payOutError && (
                              <small className="error">{payOutError}</small>
                            )}
                          </FloatLabel>
                        ) : (
                          <>
                            <b className="fw-semibold">
                              Payout Sharing Rate(%)
                            </b>
                            <p className="text-break">
                              {channelPartnerDetail?.payOuts}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Loans Completed</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.loansCompleted.toString()}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Loans Completed</b>
                            <p className="text-break">
                              {channelPartnerDetail?.loansCompleted}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        {isEditable ? (
                          <>
                            <span>Registered SPs</span>
                            <InputText
                              variant="filled"
                              className="form-control h-50px"
                              value={channelPartnerDetail?.noOfRegisteredSP.toString()}
                              disabled
                              // onPaste={(e) => e.preventDefault()}
                              // onCopy={(e) => e.preventDefault()}
                              // onCut={(e) => e.preventDefault()}
                            />
                          </>
                        ) : (
                          <>
                            <b className="fw-semibold">Registered SPs</b>
                            <p className="text-break">
                              {channelPartnerDetail?.noOfRegisteredSP}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {!isEditable && (
                      <Button
                        className="edit-icon payout-icon"
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                        }}
                        onClick={() => {
                          setIsEditable(true);
                        }}
                      >
                        <img
                          src="/assets/images/pencil.svg"
                          alt="edit-icon"
                          loading="lazy"
                        />
                      </Button>
                    )}
                  </div>
                </div>
                {isEditable ? (
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4 mt-4">
                    <Button
                      className="btn btn-orange"
                      onClick={handleSave}
                      label="Save"
                    />

                    <Button
                      className="btn btn-black-line ms-2"
                      onClick={() => {
                        setIsEditable(false);
                        setUpdatedPayOutPercent(null);
                        fetchChannelPartnerDetailApi();
                        setPayOutError("");
                      }}
                      label="Cancel"
                    />
                  </div>
                ) : (
                  <div className="col-lg-4 col-md-4 col-sm-12 col-12 mt-4">
                    <BackButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelPartnerDetail;

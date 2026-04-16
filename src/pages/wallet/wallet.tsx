import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Loader from "../../components/Loader";
import { useEffect, useState } from "react";
import TableTitle from "../../components/TableTitle";
import { Dialog } from "primereact/dialog";
import {
    generategenerateReferralCodeAPI,
    fetchTrackReferralsAPI,
    fetchWalletAPI,
    getReferralPointsAPI,
    fetchReferralCodeAPI,
} from "../../utils/axios/apiServices";
import {
    formatDate,
    toastError,
    toastSuccess,
} from "../../utils/functions/shared";
import { TabPanel, TabView } from "primereact/tabview";
import { IGenerateSubscriptionInvoiceResponse } from "../../interface/payOuts";
import {
    IRefferalCodeResponse,
    IRefferalData,
    IRefferalDataResponse,
    IRefferalListingResponse,
    IWalletData,
    IWalletListingResponse,
} from "../../interface/wallet";

const Wallet = () => {
    const [getReferralPoints, setGetReferralPoints] = useState<number>(0);

    const [referralDetails, setReferralDetails] = useState<IRefferalData[]>([]);

    const [walletDetails, setWalletDetails] = useState<IWalletData[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const [showDialog, setShowDialog] = useState<boolean>(false);

    const [refferalCode, setRefferalCode] = useState<string | null>(null);

    const [registrationLink, setRegistrationLink] = useState<string>('');

    const [isReferralGenerated, setIsReferralGenerated] = useState<boolean>(false);


    const actionBody = (rowData: IRefferalData): JSX.Element => {
        return (
            <span
                className="StatusLabel"
                style={{
                    backgroundColor: rowData.status === "CONFIRMED" ? "#27ae60" : "",
                }}
            >
                {rowData.status}
            </span>
        );
    };

    const handleGenerateReferralCode = async () => {
        setLoading(true);

        const response: IGenerateSubscriptionInvoiceResponse =
            await generategenerateReferralCodeAPI();

        if (!response) return;

        if (response.statusCode === 200 && response.data) {
            setRefferalCode(response.data);

            const link = `${window.location.origin}/register?referralCode=${response.data}`;
            setRegistrationLink(link);
            navigator.clipboard
                .writeText(registrationLink)
                .then(() => {
                    toastSuccess(
                        "Referral link is generated and copied to clipboard. You can now share it with the other channel partner."
                    );
                })
                .catch(() => {
                    toastError(
                        "Failed to copy the referral link. Please try again later."
                    );
                });
            setIsReferralGenerated(true);

            toastSuccess("Referral code generated successfully.");
        } else {
            toastError(response.message);
        }

        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(registrationLink);
        toastSuccess("Referral link copied to clipboard");
    };

    const encodedText = encodeURIComponent(
        "Access our digital lending platform in one click. Please register using this referral link to onboard on Credorbit.\n\nFetch credit reports, check client loan eligibility, access GST, ITR, Bank Analysis, and CAM reports, manage payouts, and sort client documents — all on one secure platform.\n\n Get started using the link below:"
    );


    const encodedUrl = encodeURIComponent(registrationLink);
    const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodedText}%20${registrationLink}`,
        sms: `sms:?body=${encodedText}%20${encodedUrl}`,
    };

    const openShareWindow = (shareUrl: string) => {
        // Open popup window instead of redirecting or new tab
        window.open(
            shareUrl,
            "shareWindow",
            "width=600,height=500,left=100,top=100,noopener,noreferrer"
        );
    };


    console.log("getReferralPoints === 10000", getReferralPoints === 10000);

    const dialogFooter = (
        <div className="d-flex justify-content-end">
            <Button
                label="Cancel"
                className="btn btn-orange-line me-2 w-100 text-center"
                onClick={() => {
                    setShowDialog(false);
                }}
            />
            {
                !refferalCode && <Button
                    label="Generate Referral Code"
                    className="btn btn-orange me-2 w-100 text-center"
                    onClick={handleGenerateReferralCode}
                />
            }

            <Button
                label="Convert wallet point to subscription credits"
                className="btn btn-orange w-100 text-center"
                disabled={!(getReferralPoints >= 10000)}
            />
        </div>)


    const fetchTrackReferrals = async (): Promise<void> => {
        setLoading(true);

        const response: IRefferalListingResponse = await fetchTrackReferralsAPI();

        if (!response) return;

        if (response && response.statusCode === 200) {
            setReferralDetails(response.data);
        } else {
            toastError(response.message);
        }

        setLoading(false);
    };

    const fetchReferralCode = async (): Promise<void> => {
        setLoading(true);

        const response: IRefferalCodeResponse = await fetchReferralCodeAPI();

        if (!response) return;

        if (response && response.statusCode === 200) {
            const data = response.data
            setRefferalCode(response.data);

            if (data === null) {
                setIsReferralGenerated(false);
            }
            else {
                const link = `${window.location.origin}/register?referralCode=${response.data}`;
                setRegistrationLink(link);
                setIsReferralGenerated(true);
            }

        } else {
            toastError(response.message);
        }

        setLoading(false);
    };

    const fetchWalletsDetails = async (): Promise<void> => {
        setLoading(true);

        const response: IWalletListingResponse = await fetchWalletAPI();

        if (!response) return;

        if (response && response.statusCode === 200) {
            setWalletDetails(response.data);
        } else {
            toastError(response.message);
        }

        setLoading(false);
    };

    const fetchReferralPoints = async (): Promise<void> => {
        setLoading(true);

        const response: IRefferalDataResponse = await getReferralPointsAPI();

        if (!response) return;

        if (response && response.statusCode === 200) {
            setGetReferralPoints(response.data);
        } else {
            toastError(response.message);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchReferralCode();
        fetchTrackReferrals();
        fetchWalletsDetails();
        fetchReferralPoints();
    }, []);

    return (
        <>
            <div className="col-12">
                <div className="whiteBoxHldr p-24">
                    <Loader isLoading={loading} />

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="col-12 mb-4 titleBtnWrapper">
                                <TableTitle title="Wallet and Referral" />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <div className="custom-card card shadow-sm p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold text-white m-0">Credorbit Miles</h5>

                                <button
                                    className="btn btn-more-point"
                                    onClick={() => setShowDialog(true)}
                                >
                                    Refer a friend
                                </button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="fw-semibold m-0 text-white">
                                    <span className="text-dark font-large">
                                        {getReferralPoints} <img src="/assets/images/coin.svg" alt="coin-icon" loading="lazy" />
                                    </span>
                                </h4>
                            </div>
                        </div>
                    </div>

                    <TabView className="mt-4 custom-tabview">
                        <TabPanel header="Referral History">
                            <div className="table-responsive mt-4">
                                <DataTable
                                    className="tableMain"
                                    value={referralDetails}
                                    emptyMessage="No referral history found"
                                >
                                    <Column
                                        body={(rowData, options) => options.rowIndex + 1}
                                        header="Sr. No."
                                    />

                                    <Column field="referredName" header="Referred Name" />

                                    <Column field="referralCode" header="Referral Code" />

                                    <Column
                                        body={(rowData: IRefferalData) =>
                                            formatDate(rowData.referredDate)
                                        }
                                        header="Date"
                                    />

                                    <Column body={actionBody} header="Status" />
                                </DataTable>
                            </div>
                        </TabPanel>

                        <TabPanel header="Wallet history">
                            <div className="table-responsive mt-4">
                                <DataTable
                                    className="tableMain"
                                    value={walletDetails}
                                    emptyMessage="No wallet history found"
                                >
                                    <Column
                                        body={(rowData, options) => options.rowIndex + 1}
                                        header="Sr. No."
                                    />
                                    <Column
                                        body={(rowData: IWalletData) => rowData.points}
                                        header="Points"
                                    />

                                    <Column field="transactionType" header="Transaction Type" />

                                    <Column
                                        body={(rowData: IWalletData) => formatDate(rowData.date)}
                                        header="Date"
                                    />
                                    <Column field="description" header="Description" />
                                </DataTable>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            <Dialog
                header="Unlock Your Wallet Rewards"
                visible={showDialog}
                onHide={() => setShowDialog(false)}
                draggable={false}
                resizable={false}
                className="modalWrapper"
                style={{ width: "900px" }}
                footer={dialogFooter}
                blockScroll
            >
                <div className="modalWrapper modal-dialog modal-dialog-centered p-0">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="mb-3">
                                <p className="mb-3">
                                    Make the most of your wallet points. Generate a referral code to
                                    invite others or convert your points into subscription credits.
                                </p>

                                {isReferralGenerated && (
                                    <div className="referral-box p-3 border rounded">
                                        <div className="d-flex align-items-center justify-content-between">

                                            {/* 🔹 Left: Referral code */}
                                            <strong className="fs-5">{refferalCode}</strong>

                                            {/* 🔹 Right: Icons in one line */}
                                            <div className="d-flex align-items-center gap-3">
                                                {/* Copy */}
                                                <i
                                                    className="bi bi-copy fs-5 cursor-pointer"
                                                    onClick={handleCopy}
                                                    title="Copy"
                                                />

                                                {/* WhatsApp */}
                                                <i
                                                    className="bi bi-whatsapp fs-5 text-success cursor-pointer"

                                                    onClick={() => openShareWindow(shareLinks.whatsapp)}
                                                    title="Share on WhatsApp"
                                                />

                                                {/* SMS */}
                                                <i
                                                    className="bi bi-chat-dots fs-5 cursor-pointer"
                                                    onClick={() => openShareWindow(shareLinks.sms)}
                                                    title="Share via SMS"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default Wallet;

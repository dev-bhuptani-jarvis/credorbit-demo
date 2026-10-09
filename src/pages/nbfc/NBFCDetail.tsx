import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import Loader from '../../components/Loader';
import { InputSwitch } from 'primereact/inputswitch';
import { formatMobileNumber, RouteParams } from '../../utils/constants/constant';
import { activeInactiveNBFCUserAPI, getNBFCUserByIdAPI } from '../../utils/axios/apiServices';
import {
    IEducationalInstituteBranchAuthorisedPerson,
    IGetAllEducationInstitutesDetailedResponse,
    IGetAllEducationInstitutesDetailedResponseData
} from '../../interface/institutes';
import { decryptVAPTData } from '../../utils/functions/encryptDecrypt';
import { formatDate, toastError, toastSuccess } from '../../utils/functions/shared';

const NBFCDetail = () => {
    const { id } = useParams<RouteParams>();

    const [loading, setLoading] = useState<boolean>(false);

    const [nbfcDetail, setNbfcDetail] = useState<IGetAllEducationInstitutesDetailedResponseData | null>(null);

    const fetchNbfcDetail = async (nbfcId: string): Promise<void> => {
        setLoading(true);

        const response: IGetAllEducationInstitutesDetailedResponse = await getNBFCUserByIdAPI(nbfcId);

        if (response?.statusCode === 200) {
            setNbfcDetail(response.data);
        } else {
            toastError(response.message)
        }

        setLoading(false);
    };

    const handleStatusChange = async (checked: boolean): Promise<void> => {
        if (!id) {
            toastError("Lender ID is missing.");
            return;
        }

        const previousIsActive = !!nbfcDetail?.isActive;

        setNbfcDetail((prev) =>
            prev
                ? {
                    ...prev,
                    isActive: checked,
                }
                : prev,
        );

        setLoading(true);

        const response = await activeInactiveNBFCUserAPI({
            nbfcUserId: id,
            isActive: checked,
        });

        if (response?.statusCode === 200) {
            toastSuccess(response.message);
            await fetchNbfcDetail(id);
        } else {
            setNbfcDetail((prev) =>
                prev
                    ? {
                        ...prev,
                        isActive: previousIsActive,
                    }
                    : prev,
            );
            toastError(response?.message);
        }

        setLoading(false);
    };

    const renderAuthorizedPersonDetails = (
        person: IEducationalInstituteBranchAuthorisedPerson,
        sectionTitle: string,
    ): JSX.Element => (
        <div className="borderBoxHldr p-24">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="mb-0">{sectionTitle}</h5>
            </div>

            <div className="row">
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Name</b>
                    <p className="text-break">{person.name || "-"}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>PAN</b>
                    <p className="text-break">{person.panNumber ? decryptVAPTData(person.panNumber) : "-"}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Date of Birth</b>
                    <p className="text-break">
                        {person.dateOfBirth ? formatDate(decryptVAPTData(person.dateOfBirth), 'DD MMM, YYYY') : '-'}
                    </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Gender</b>
                    <p className="text-break">{person.gender
                        ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1).toLowerCase()
                        : "-"}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Mobile Number</b>
                    <p className="text-break">
                        {person.mobileNumber ? formatMobileNumber(decryptVAPTData(person.mobileNumber)) : '-'}
                    </p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Email Address</b>
                    <p className="text-break">{person.emailAddress ? decryptVAPTData(person.emailAddress) : '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Constitution</b>
                    <p className="text-break">{person.constitution || '-'}</p>
                </div>
                <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Profile Photo</b>
                    <p className="text-break mt-1">
                        {person.profilePhoto ? (
                            <a
                                href={person.profilePhoto}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary fw-semibold"
                            >
                                View Document
                            </a>
                        ) : (
                            "Not uploaded"
                        )}
                    </p>
                </div>
                <div className="col-12 mb-0">
                    <b>Address</b>
                    <p className="text-break">{person.address ? decryptVAPTData(person.address) : '-'}</p>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        if (!id) return;

        fetchNbfcDetail(id);
    }, [id]);

    return (
        <div className="whiteBoxHldr p-24">
            <Loader isLoading={loading} />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h2 className="txt-24 mb-1">Lender Details</h2>
                <BackButton />
            </div>

            {nbfcDetail ? (
                <div className="row g-4">
                    <div className="col-12">
                        <div className="borderBoxHldr p-24">
                            <div className="row">
                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">Lender Code</b>
                                    <p className="text-break mb-0">{nbfcDetail.code}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">Lender Name</b>
                                    <p className="text-break mb-0">{nbfcDetail.fullName}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">Mobile Number</b>
                                    <p className="text-break mb-0">
                                        {nbfcDetail.phoneNumber ? formatMobileNumber(decryptVAPTData(nbfcDetail.phoneNumber)) : "-"}
                                    </p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">Email</b>
                                    <p className="text-break mb-0">{nbfcDetail.email ? decryptVAPTData(nbfcDetail.email) : "-"}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">State</b>
                                    <p className="text-break mb-0">{nbfcDetail.state ? decryptVAPTData(nbfcDetail.state) : "-"}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">City</b>
                                    <p className="text-break mb-0">{nbfcDetail.city ? decryptVAPTData(nbfcDetail.city) : "-"}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">GST Number</b>
                                    <p className="text-break mb-0">{nbfcDetail.gstNumber ? decryptVAPTData(nbfcDetail.gstNumber) : "-"}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">PAN Number</b>
                                    <p className="text-break mb-0">{nbfcDetail.panNumber ? decryptVAPTData(nbfcDetail.panNumber) : "-"}</p>
                                </div>

                                <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
                                    <b className="fw-semibold">Status</b>
                                    <p className="d-flex align-items-center mt-2 mb-0">
                                        <InputSwitch
                                            checked={!!nbfcDetail.isActive}
                                            onChange={(e) => void handleStatusChange(!!e.value)}
                                        />
                                        <span className="ms-2">
                                            {nbfcDetail.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </p>
                                </div>

                                <div className="col-lg-6 col-md-8 col-sm-12 col-12 mb-4">
                                    <b className="fw-semibold">Address</b>
                                    <p className="text-break mb-0">{nbfcDetail.address ? decryptVAPTData(nbfcDetail.address) : "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="whiteBoxHldr">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                <h3 className="txt-20 mb-0">Authorised Persons</h3>
                            </div>

                            {nbfcDetail.authorisedPersons?.length ? (
                                <div className="d-flex flex-column gap-4 mt-3">
                                    {nbfcDetail.authorisedPersons.map((person, index) =>
                                        renderAuthorizedPersonDetails(person, `Authorised Person ${index + 1}`)
                                    )}
                                </div>
                            ) : (
                                <p className="mb-0 text-muted">No authorised persons available.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="whiteBoxHldr">
                    <p className="mb-3">Lender details not found.</p>
                    <BackButton />
                </div>
            )}
        </div>
    );
};

export default NBFCDetail;

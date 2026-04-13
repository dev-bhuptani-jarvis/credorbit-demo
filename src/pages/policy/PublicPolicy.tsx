import { useEffect, useState } from "react";
import TableTitle from "../../components/TableTitle";
import {
  IContractParams,
  IContractResponse,
  IContractResponseData,
} from "../../interface/contract";
import {
  generatePublicTokenAPI,
  getContentAPI,
} from "../../utils/axios/apiServices";
import Loader from "../../components/Loader";
import BackButton from "../../components/BackButton";
import { useLocation } from "react-router-dom";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  IGeneratePublicTokenRequest,
  IGeneratePublicTokenResponse,
} from "../../interface/publicToken";
import { encryptData } from "../../utils/functions/encryptDecrypt";
import {
  dynamicSecretKey,
  extraToken,
  sanitizeHTML,
  toastError,
} from "../../utils/functions/shared";
import { setEncryptedSessionStorage } from "../../utils/functions/sessionStorage";
import { ContractType, StorageKeyEnum } from "../../utils/constants/enum";
import { ContractSigned } from "../../utils/constants/constant";

const PublicPolicy = () => {
  const [contract, setContract] = useState<IContractResponseData>({
    isAgreed: false,
    content: "",
    updatedDate: "",
  });

  const fetchPublicToken = async (): Promise<void> => {
    const payload: IGeneratePublicTokenRequest = {
      userID: encryptData(dynamicSecretKey()),
      extraToken: encryptData(extraToken()),
    };

    const response: IGeneratePublicTokenResponse = await generatePublicTokenAPI(
      payload
    );

    if (!response) return;

    if (response && response.statusCode === 200) {
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_PUBLIC_TOKEN,
        response.data
      );

      fetchPrivacyPolicyContract();
    } else {
      toastError(response.message);
    }
  };

  const { pathname } = useLocation();

  const [loading, setLoading] = useState<boolean>(false);

  const fetchPrivacyPolicyContract = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IContractParams = {
      pageName:
        pathname === RoutePathConstant.public.policy
          ? ContractType.PRIVACY_POLICY
          : pathname === RoutePathConstant.public.clientPolicy
          ? ContractType.CONTRACT
          : pathname === RoutePathConstant.public.channelPartnerPolicy
          ? ContractType.CONTRACT
          : ContractType.TERMS_AND_CONDITIONS,
      ...(pathname === RoutePathConstant.public.clientPolicy
        ? { contractTypeID: ContractSigned.CLIENT }
        : pathname === RoutePathConstant.public.channelPartnerPolicy
        ? { contractTypeID: ContractSigned.ADMIN_TO_CP }
        : {}),
    };

    const response: IContractResponse = await getContentAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setContract(response.data);
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPublicToken();
  }, []);

  return (
    <div className="whiteBoxHldr p-24 m-4">
      <Loader isLoading={loading} />

      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <div className="d-flex flex-column">
              <TableTitle
                title={
                  pathname === RoutePathConstant.public.policy
                    ? "Privacy Policy"
                    : "Terms & Conditions"
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 mt-4 mb-4">
              <div
                className="ql-editor-preview"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(contract?.content) }}
              />
            </div>
          </div>
        </div>
      </div>

      <BackButton />
    </div>
  );
};

export default PublicPolicy;

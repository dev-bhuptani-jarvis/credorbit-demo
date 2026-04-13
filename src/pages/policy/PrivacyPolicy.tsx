import { useEffect, useState } from "react";
import Editor from "../../components/Editor";
import { getContentAPI, updateContentAPI } from "../../utils/axios/apiServices";
import {
  IContractParams,
  IContractResponse,
  IContractResponseData,
  IUpdatedContractBody,
} from "../../interface/contract";
import {
  cleanCmsContent,
  formatDate,
  sanitizeHTML,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CLIENT_ROLE } from "../../utils/constants/constant";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";
import { ILogoutResponse } from "../../interface/logout";
import TableTitle from "../../components/TableTitle";
import { ContractType } from "../../utils/constants/enum";
import { validationMessages } from "../../utils/constants/messages";

const PrivacyPolicy = () => {
  const [contract, setContract] = useState<IContractResponseData>({
    isAgreed: false,
    content: "",
    updatedDate: "",
  });

  const [isEditable, setIsEditable] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const { userType } = useSelector((state: RootState) => state.user.user);

  const { create } = usePermission("Policy", ["create"])();

  const handleSaveContent = async (): Promise<void> => {
    if (contract.content.trim() === "<p><br></p>") {
      toastError(validationMessages.contentRequired);
      return;
    }

    setLoading(true);

    const body: IUpdatedContractBody = {
      pageName: ContractType.PRIVACY_POLICY,
      description: sanitizeHTML(contract?.content),
    };

    const response: ILogoutResponse = await updateContentAPI(body);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setIsEditable(false);
      toastSuccess(response.message);
      fetchPrivacyPolicyContract();
    }

    setLoading(false);
  };

  const fetchPrivacyPolicyContract = async (): Promise<void> => {
    setLoading(true);

    const queryParams: IContractParams = {
      pageName: ContractType.PRIVACY_POLICY,
    };

    const response: IContractResponse = await getContentAPI(queryParams);

    if (!response) return;

    if (response && response.statusCode === 200) {
      setContract({
        ...response.data,
        content: cleanCmsContent(response.data.content),
      });
    } else {
      toastError(response.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPrivacyPolicyContract();
  }, []);

  return (
    <div className="whiteBoxHldr p-24">
      <Loader isLoading={loading} />
      <div className="row">
        <div className="col-lg-12">
          <div className="col-12 mb-4 titleBtnWrapper">
            <div className="d-flex flex-column">
              <TableTitle title="Policy" />
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
                    Edit Policy <i className="bi bi-pencil-fill ms-2" />
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
                <div
                  className="ql-editor-preview"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(contract?.content) }}
                />
              )}
            </div>
          </div>

          {isEditable && (
            <div className="col-lg-3 col-md-3 col-sm-6 col-12 mb-4">
              <Button
                className="btn btn-orange"
                onClick={handleSaveContent}
                disabled={loading}
                label="Save"
              />

              <Button
                className="btn btn-black-line ms-2"
                onClick={() => {
                  setIsEditable(false);
                  fetchPrivacyPolicyContract();
                }}
                label="Cancel"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

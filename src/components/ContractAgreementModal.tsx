import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { CLIENT_ROLE } from "../utils/constants/constant";
import { isWithin30DaysOnly } from "../utils/functions/shared";

interface IContractAgreement {
  setShowContractAgreement: (showContractAgreement: boolean) => void;
  showContractAgreement: boolean;
}

const ContractAgreementModal = ({
  setShowContractAgreement,
  showContractAgreement,
}: IContractAgreement) => {
  const { userType } = useSelector((state: RootState) => state.user.user);

  const navigate = useNavigate();

  const { contractEnforcementDate } = useSelector(
    (state: RootState) => state.user.user
  );

  const footerContent = (
    <div className="modal-footer gap-3">
      {isWithin30DaysOnly(contractEnforcementDate) && (
        <Button
          className="btn btn-black-line w-100"
          onClick={() => setShowContractAgreement(false)}
        >
          Skip
        </Button>
      )}
      <Button
        className="btn btn-orange w-100"
        onClick={() =>
          navigate(
            userType === CLIENT_ROLE.CHANNEL_PARTNER
              ? RoutePathConstant.private.contractChannelMaster
              : userType === CLIENT_ROLE.SOURCING_PARTNER
              ? RoutePathConstant.private.contractSourcingPartner
              : userType === CLIENT_ROLE.USER_MANAGEMENT
              ? RoutePathConstant.private.contractChannelMaster
              : RoutePathConstant.private.contractClient
          )
        }
      >
        Go to contract page
      </Button>
    </div>
  );

  return (
    <Dialog
      header="Contract Agreement"
      visible={showContractAgreement}
      onHide={() => setShowContractAgreement(false)}
      modal
      className="modalWrapper"
      draggable={false}
      resizable={false}
      style={{ width: "500px" }}
      footer={footerContent}
      blockScroll
    >
      <p className="modal-text">
        The contract has been updated. Please review and sign the contract to
        continue.
      </p>
    </Dialog>
  );
};

export default ContractAgreementModal;

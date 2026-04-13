import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { RoutePathConstant } from "../utils/constants/routePaths";
import { useLocation, useNavigate } from "react-router-dom";

interface CreditNotAvailableProps {
  isShow: boolean;
  onHide: () => void;
  message: string;
  forCredit?: boolean;
}

const CreditNotAvailable: React.FC<CreditNotAvailableProps> = ({
  isShow,
  onHide,
  message,
  forCredit,
}) => {
  const navigate = useNavigate();

  const { pathname } = useLocation();

  return (
    <Dialog
      header={null}
      visible={isShow}
      modal
      closable={false}
      draggable={false}
      resizable={false}
      onHide={onHide}
      className="modalWrapper p-6"
      blockScroll
    >
      <div className="text-center">
        <div className="credit-icon">
          <i className="bi bi-wallet2" />
        </div>

        <h4 className="mb-2 fw-bold text-dark">Credits Not Available</h4>

        <p className="mb-4">{message}</p>

        {pathname !== RoutePathConstant.private.subscription && forCredit ? (
          <div className="modal-footer gap-3">
            <Button
              label="Add Credit"
              className="btn btn-orange w-100 text-center"
              onClick={() => navigate(RoutePathConstant.private.subscription)}
            />
            <Button
              className="btn btn-black-line w-100 text-center"
              onClick={onHide}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            label="OK"
            className="btn btn-orange w-100 text-center"
            onClick={onHide}
          />
        )}
      </div>
    </Dialog>
  );
};

export default CreditNotAvailable;

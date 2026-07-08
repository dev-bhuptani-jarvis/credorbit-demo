import { Steps } from "primereact/steps";
import { useEffect, useState } from "react";
import GetCreditScore from "./GetCreditScore";
import IncomeTaxDetail from "./IncomeTaxDetail";
import GSTDetails from "./GSTDetails";
import BankDetails from "./BankDetails";
import { useNavigate } from "react-router-dom";
import { RoutePathConstant } from "../../../utils/constants/routePaths";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useLocation } from "react-router-dom";

const CheckEligibility = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const navigate = useNavigate();
  const { state } = useLocation();

  const { customerInfo } = useSelector((state: RootState) => state.customer);

  const { userName } = useSelector((state: RootState) => state.user.user);

  const isEducationFlow = !!state?.educationFlow;

  const items = isEducationFlow
    ? [{ label: "Credit Bureau Fetch" }, { label: "Bank Statement Upload" }]
    : [
        { label: "Get Credit Score" },
        { label: "Income Tax Details" },
        { label: "GST Details" },
        { label: "Bank Details" },
      ];

  const nextStep = (): void => {
    if (activeIndex < items.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevStep = (): void => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleMessage = () => {
    if (isEducationFlow) {
      switch (activeIndex) {
        case 0:
          return "Step 4 of 6: Fetch the student or co-applicant credit bureau report.";
        case 1:
          return "Step 5 of 6: Upload bank statements and generate the CAM report.";
      }
    }

    switch (activeIndex) {
      case 0:
        return "You're just 4-step away from your eligibility check!";
      case 1:
        return "You're just 3-step away from your eligibility check!";
      case 2:
        return "You're close to completing your eligibility check!";
      case 3:
        return "You're almost there, just one more step to complete your eligibility check!";
    }
  };

  useEffect(() => {
    if (customerInfo.maxCreditScore === 0) {
      navigate(RoutePathConstant.private.clientDashboard);
    }
  }, [customerInfo]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // This is necessary for some browsers to show a warning dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="whiteBoxHldr p-30">
      <div className="row">
        <div className="col-12">
          <div className="col-12 mb-4 titleMainWrapper txt-orange">
            <h2 className="client-welcome">
              <span>Application for,</span> {userName}
            </h2>
          </div>
          <div className="req-det-steps">
            <h3
              className="mt-5 text-center fw-bold bebas-neue-regular"
              style={{ fontSize: "1.125em" }}
            >
              {handleMessage()}
            </h3>

            <Steps
              className="mt-5 mb-4"
              model={items.map((step, index) => ({
                ...step,
                className: index > activeIndex ? "disabled-step" : "", // Add a custom class to disable
              }))}
              activeIndex={activeIndex}
              onSelect={(e) => {
                if (e.index <= activeIndex) {
                  setActiveIndex(e.index);
                }
              }}
              readOnly={false}
            />
          </div>
        </div>

        {activeIndex === 0 && <GetCreditScore nextStep={nextStep} />}

        {!isEducationFlow && activeIndex === 1 && (
          <IncomeTaxDetail nextStep={nextStep} prevStep={prevStep} />
        )}

        {!isEducationFlow && activeIndex === 2 && (
          <GSTDetails nextStep={nextStep} prevStep={prevStep} />
        )}

        {((!isEducationFlow && activeIndex === 3) ||
          (isEducationFlow && activeIndex === 1)) && (
          <BankDetails prevStep={prevStep} />
        )}
      </div>
    </div>
  );
};

export default CheckEligibility;

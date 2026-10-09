import { useLocation, useParams } from "react-router-dom";
import DecisionFlowBuilder from "../../components/ruleBuilder/DecisionFlowBuilder";

const BreBuilderDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const policyVersionID = Number(id);
  const isReadOnly = new URLSearchParams(location.search).get("mode") === "view";

  if (!id || Number.isNaN(policyVersionID)) {
    return null;
  }

  return (
    <div className="whiteBoxHldr p-24 m-4">
      <DecisionFlowBuilder policyVersionID={policyVersionID} isReadOnly={isReadOnly} />
    </div>
  );
};

export default BreBuilderDetail;

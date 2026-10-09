import { APIResponseEntity } from "./apiResponse";
import { EmiCostType, ProcessingFeeType } from "../utils/constants/enum";

export interface IGetNodeCatalogsResponse extends APIResponseEntity {
  data: IGetNodeCatalogsResponseData[];
}

export interface IGetNodeCatalogsResponseData {
  nodeCatalogID: number;
  code: string;
  name: string;
  nodeType: string;
  dataType: string;
  sourceType: string;
  unit: string;
  regex?: string | null;
  validationRegex?: string | null;
  validationPattern?: string | null;
  isActive: boolean;
  description: string;
  nodeInstances: INodeInstance[];
}

export interface INodeInstance {
  [key: string]: unknown;
}

export interface IGetComparisonOptionsResponse extends APIResponseEntity {
  data: IGetComparisonOptionsResponseData[];
}

export interface IGetComparisonOptionsResponseData {
  comparisonOptionID: number;
  code: string;
  symbol: string;
  applicableDataTypes: string;
  requiresMinValue: boolean;
  requiresMaxValue: boolean;
  isActive: boolean;
}

export interface IGetTerminalOutcomesResponse extends APIResponseEntity {
  data: IGetTerminalOutcomesResponseData[];
}

export interface IGetTerminalOutcomesResponseData {
  terminalOutcomeID: number;
  outcomeCode: string;
  outcomeName: string;
  finalDecision: string;
  isTerminal: boolean;
  needsCommercialRate: boolean;
  needsManualReview: boolean;
  displayOrder: number;
  processingFeeType?: ProcessingFeeType | null;
  emiCostType?: EmiCostType | null;
  remarks: string;
}

export interface ICreateDraftPolicyBody {
  instituteID: string;
  productTypeID: number;
}

export interface ICreateDraftPolicyResponse extends APIResponseEntity {
  data: {
    policyVersionID: number;
  };
}

export interface IPolicyRateMatrix {
  rateMatrixID: number;
  noOfEmis?: number | null;
  tenureMonths?: number | null;
  roiPercent: number;
  processingFee: number;
  advanceEmiPercent?: number | null;
  otherCharges?: number | null;
  isActive?: boolean;
}

export interface IPolicyTerminalOutcome {
  terminalOutcomeID: number;
  outcomeCode: string;
  outcomeName: string;
  finalDecision: string;
  isTerminal: boolean;
  needsCommercialRate: boolean;
  needsManualReview: boolean;
  displayOrder: number;
  processingFeeType?: ProcessingFeeType | null;
  emiCostType?: EmiCostType | null;
  remarks: string;
  commercialRates: IPolicyRateMatrix[];
}

export interface IPolicyBranch {
  branchID: number;
  comparisonOptionID: number | null;
  valueMin: number | null;
  valueMax: number | null;
  valueText: string | null;
  booleanValue: boolean | null;
  sequenceNo: number;
  remarks: string;
  nextNode: IPolicyTreeNode | null;
  terminalOutcome: IPolicyTerminalOutcome | null;
}

export interface IPolicyTreeNode {
  nodeInstanceID: number;
  nodeCatalogID: number;
  nodeLabel: string;
  sequenceNo: number;
  isRoot: boolean;
  isActive: boolean;
  remarks: string;
  branches: IPolicyBranch[];
}

export interface IPolicyNode {
  policyVersionID: number;
  rootNode: IPolicyTreeNode;
}

export interface IGetPolicyResponse extends APIResponseEntity {
  data: IGetPolicyResponseData;
}

export interface IGetPolicyResponseData {
  policyInfo: IPolicyInfo;
  rootNode: IPolicyTreeNode | null;
}

export interface IPolicyInfo {
  policyVersionID: number;
  instituteID: string;
  productTypeID: number;
  versionNo: number;
  status: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  rootNodeInstanceID: number | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  publishedBy: string | null;
  publishedAt: string | null;
  remarks: string | null;
}

export interface ISavePolicyResponse extends APIResponseEntity {
  data: {
    policyVersionID: number;
  };
}

export interface ISimulatePolicyBody {
  policyVersionID: number;
  inputs: Record<string, string>;
}

export interface IPolicySimulationMatchedPath {
  stepNo: number;
  nodeInstanceID: number;
  nodeLabel: string;
  parameterValue: string;
  operatorUsed: string;
  branchMatched: string;
  nextNodeInstanceID: number | null;
  terminalOutcomeID: number | null;
  notes: string;
}

export interface IPolicySimulationResultData {
  policyInfo: IPolicyInfo | null;
  matchedPath: IPolicySimulationMatchedPath[];
  terminalOutcome: IPolicyTerminalOutcome | null;
  commercialRates: IPolicyRateMatrix[];
}

export interface ISimulatePolicyResponse extends APIResponseEntity {
  data: IPolicySimulationResultData;
}

export interface IPublishPolicyResponse extends APIResponseEntity {
  data: {
    policyVersionId?: number;
    policyVersionID?: number;
  };
}

export interface IGetAllPoliciesResponse extends APIResponseEntity {
  data: IGetAllPoliciesResponseData
}

export interface IGetAllPoliciesResponseData {
  policies: IPolicySummary[];
}

export interface IPolicySummary {
  policyVersionID: number;
  instituteID: string;
  instituteName: string;
  status: string;
  versionNo: number;
  isActive: boolean;
  tradeName: string | null;
  createdAt: string;
  publishedAt: string | null;
  rootNodeInstanceID: number;
}

export interface IGetRunTimeLogsResponse extends APIResponseEntity {
  data: IGetRunTimeLogsResponseData
}

export interface IGetRunTimeLogsResponseData {
  logs: IGetRunTimeLogsData[]
}

export interface IGetRunTimeLogsData {
  id: number,
  loanApplicationID: string,
  loanApplicationCode: string,
  studentID: string,
  studentName: string,
  studentCode: string,
  policyVersionID: number,
  versionNo: number,
  policyStatus: string,
  terminalOutcomeID: number,
  finalDecision: string,
  evaluationStatus: string,
  rejectionReason: string | null,
  roiPercent: number,
  processingFee: number,
  advanceEmiPercent: number | null,
  noOfEmis: number | null,
  tenureMonths: number,
  createdAt: string
}

export interface IGetRunTimeLogsDetailResponse extends APIResponseEntity {
  data: IGetRunTimeLogsDetailResponseData
}

export interface IRunTimeLogEvaluationTrace {
  stepNo: number;
  nodeInstanceID: number;
  nodeCode: string;
  parameterValue: string;
  operatorUsed: string;
  branchMatched: string;
  nextNodeInstanceID: number | null;
  terminalOutcomeID: number | null;
  notes: string;
}

export interface IGetRunTimeLogsDetailResponseData {
  inputSnapshotJson: string;
  evaluationTraceJson: string;

  inputSnapshot: {
    cIBIL: string;
    aBB: string;
    advanceEMI: string;
    eMIAmount: string;
    eMICount: string;
    loanAmount: string;
    courseFee: string;
    interestAmount: string;
    disbursementToInstitute: string;
  };

  evaluationTrace: IRunTimeLogEvaluationTrace[];

  id: number;
  loanApplicationID: string;
  loanApplicationCode: string;
  studentID: string;
  studentName: string;
  studentCode: string;
  policyVersionID: number;
  versionNo: number;
  policyStatus: string;
  terminalOutcomeID: number | null;
  finalDecision: string;
  evaluationStatus: string;
  rejectionReason: string | null;
  roiPercent: number;
  processingFee: number;
  advanceEmiPercent: number | null;
  noOfEmis: number | null;
  tenureMonths: number;
  createdAt: string;
}

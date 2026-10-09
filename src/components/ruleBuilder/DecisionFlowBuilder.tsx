import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import {
  createDraftPolicyAPI,
  getComparisonOptionsAPI,
  getNodeCatalogsAPI,
  getPolicyAPI,
  getTerminalOutcomesAPI,
  publishPolicyAPI,
  savePolicyAPI,
  simulatePolicyAPI,
} from "../../utils/axios/apiServices";
import { toastError, toastSuccess } from "../../utils/functions/shared";
import {
  ICreateDraftPolicyBody,
  IGetComparisonOptionsResponseData,
  IGetNodeCatalogsResponseData,
  IGetTerminalOutcomesResponseData,
  IPolicyInfo,
  IPolicyNode,
  IPolicySimulationMatchedPath,
  IPolicySimulationResultData,
  IPolicyTerminalOutcome,
  IPolicyTreeNode,
  IPolicyRateMatrix,
  ISimulatePolicyBody,
} from "../../interface/breBulilder";
import { EmiCostType, ProcessingFeeType } from "../../utils/constants/enum";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { validationMessages } from "../../utils/constants/messages";
import { BOOLEAN_VALUE_PATTERN, EMI_AMOUNT_INPUT_PATTERN, EMI_AMOUNT_PATTERN, EMI_MONTHS_PATTERN, NON_NEGATIVE_AMOUNT_PATTERN, NUMERIC_DATA_TYPE_PATTERN, PROCESSING_FEE_PERCENT_PATTERN, ROI_PERCENT_PATTERN } from "../../utils/constants/pattern";
import "./decisionFlowBuilder.css";

interface IOption<TValue extends string | number> {
  label: string;
  value: TValue;
}

interface ICommercialRateForm {
  clientId: string;
  rateMatrixID: number;
  tenureMonths: number;
  roiPercent: string;
  processingFee: string;
}

interface ITerminalOutcomeForm {
  clientId: string;
  terminalOutcomeID: number;
  outcomeCode: "APPROVE" | "REVIEW" | "REJECT";
  outcomeName: string;
  finalDecision: string;
  isTerminal: boolean;
  needsCommercialRate: boolean;
  needsManualReview: boolean;
  displayOrder: number;
  processingFeeType: ProcessingFeeType;
  emiCostType: EmiCostType;
  remarks: string;
  commercialRates: ICommercialRateForm[];
}

interface IBranchForm {
  clientId: string;
  branchID: number;
  comparisonOptionID: number | null;
  valueMin: string;
  valueMax: string;
  valueText: string;
  booleanValue: "" | "true" | "false";
  sequenceNo: number;
  remarks: string;
  nextNode: INodeForm | null;
  terminalOutcome: ITerminalOutcomeForm | null;
}

interface INodeForm {
  clientId: string;
  nodeInstanceID: number;
  nodeCatalogID: number;
  nodeLabel: string;
  sequenceNo: number;
  isRoot: boolean;
  isActive: boolean;
  remarks: string;
  branches: IBranchForm[];
}

interface IDecisionFlowBuilderProps {
  policyVersionID: number;
  isReadOnly?: boolean;
}

interface INodeCardProps {
  node: INodeForm;
  depth: number;
  isReadOnly: boolean;
  nodeCatalogsData: IGetNodeCatalogsResponseData[];
  nodeCatalogOptions: IOption<number>[];
  comparisonOptions: IOption<number>[];
  destinationOptions: IOption<string>[];
  comparisonOptionsData: IGetComparisonOptionsResponseData[];
  onUpdateNode: (
    nodeId: string,
    fieldName: keyof Pick<INodeForm, "nodeCatalogID" | "nodeLabel" | "remarks">,
    value: string | number,
  ) => void;
  onAddBranch: (nodeId: string) => void;
  onUpdateBranch: (
    branchId: string,
    fieldName:
      | keyof Pick<
        IBranchForm,
        "comparisonOptionID" | "valueMin" | "valueMax" | "valueText" | "booleanValue" | "remarks"
      >
      | "destinationType",
    value: string | number,
  ) => void;
  onUpdateTerminalOutcome: (
    branchId: string,
    fieldName: keyof Pick<ITerminalOutcomeForm, "remarks" | "processingFeeType" | "emiCostType">,
    value: string | number,
  ) => void;
  onUpdateCommercialRate: (
    branchId: string,
    rateId: string,
    fieldName: keyof Pick<ICommercialRateForm, "tenureMonths" | "roiPercent" | "processingFee">,
    value: string,
  ) => void;
  onAddCommercialRate: (branchId: string) => void;
  onRemoveCommercialRate: (branchId: string, rateId: string) => void;
  onDeleteBranch: (nodeId: string, branchId: string) => void;
  onMoveBranch: (nodeId: string, branchId: string, direction: "up" | "down") => void;
}

interface ITerminalOutcomeCardProps {
  branch: IBranchForm;
  isReadOnly: boolean;
  onUpdateTerminalOutcome: (
    branchId: string,
    fieldName: keyof Pick<ITerminalOutcomeForm, "remarks" | "processingFeeType" | "emiCostType">,
    value: string | number,
  ) => void;
  onUpdateCommercialRate: (
    branchId: string,
    rateId: string,
    fieldName: keyof Pick<ICommercialRateForm, "tenureMonths" | "roiPercent" | "processingFee">,
    value: string,
  ) => void;
  onAddCommercialRate: (branchId: string) => void;
  onRemoveCommercialRate: (branchId: string, rateId: string) => void;
}

interface ISimulationInputRow {
  clientId: string;
  nodeCatalogCode: string;
  value: string;
  emiAmount: string;
}

interface ISimulationResultPanelProps {
  result: IPolicySimulationResultData;
}

const BOOLEAN_OPTIONS: IOption<string>[] = [
  { label: "True", value: "true" },
  { label: "False", value: "false" },
];

const PROCESSING_TYPE_OPTIONS: IOption<ProcessingFeeType>[] = [
  { label: "%", value: ProcessingFeeType.PERCENTAGE },
  { label: "₹", value: ProcessingFeeType.RUPEES },
];

const EMI_COST_TYPE_OPTIONS: IOption<EmiCostType>[] = [
  { label: "Low-cost EMI", value: EmiCostType.LOW_COST_EMI },
  { label: "No Cost EMI", value: EmiCostType.NO_COST_EMI },
];

const MIN_ZOOM = 0.1;

const MAX_ZOOM = 1.6;

const ZOOM_STEP = 0.1;

export const DEFAULT_PRODUCT_TYPE_ID = 14;

const createId = (): string =>
  `flow-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createSimulationInputRow = (nodeCatalogCode = ""): ISimulationInputRow => ({
  clientId: createId(),
  nodeCatalogCode,
  value: "",
  emiAmount: "",
});

const normalizeApiList = <TValue,>(data: TValue | TValue[] | null | undefined): TValue[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data ? [data] : [];
};

const getNodeCatalogLabelFromData = (
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  nodeCatalogID: number,
): string => nodeCatalogs.find((item) => item.nodeCatalogID === nodeCatalogID)?.name || "";

const getNodeCatalogMeta = (
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  nodeCatalogID: number,
): IGetNodeCatalogsResponseData | undefined =>
  nodeCatalogs.find((item) => item.nodeCatalogID === nodeCatalogID);

const getComparisonMeta = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): IGetComparisonOptionsResponseData | undefined =>
  comparisonOptionsData.find((item) => item.comparisonOptionID === comparisonOptionID);

const isLessThanOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);
  const code = comparisonMeta?.code?.toUpperCase() || "";

  return code.includes("LT") || code.includes("LTE");
};

const isGreaterThanOrEqualOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);
  const code = comparisonMeta?.code?.toUpperCase() || "";

  return code.includes("GTE");
};

const isAbbComparisonOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);
  const code = comparisonMeta?.code?.toUpperCase() || "";
  const symbol = comparisonMeta?.symbol || "";

  return [">", ">=", "<", "<="].includes(symbol)
    || ["GT", "GTE", "LT", "LTE"].some((operator) => code.includes(operator));
};

const getAbbComparisonOptionID = (
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): number | null =>
  comparisonOptionsData.find((item) =>
    isGreaterThanOrEqualOperator(item.comparisonOptionID, comparisonOptionsData))?.comparisonOptionID
  ?? null;

const usesValueMaxField = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => isLessThanOperator(comparisonOptionID, comparisonOptionsData);

const isAbbNode = (
  nodeCatalogID: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
): boolean => getNodeCatalogMeta(nodeCatalogs, nodeCatalogID)?.code?.toUpperCase() === "ABB";

const isBooleanNode = (
  nodeCatalogID: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
): boolean =>
  getNodeCatalogMeta(nodeCatalogs, nodeCatalogID)?.dataType?.toLowerCase().includes("boolean")
  || false;

const isAbbSimulationCode = (nodeCatalogCode: string): boolean =>
  nodeCatalogCode.trim().toUpperCase() === "ABB";

const isTextOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);
  const code = comparisonMeta?.code?.toUpperCase() || "";

  return code.includes("CONTAINS") || code.includes("STARTS") || code.includes("ENDS");
};

const isBooleanOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);

  return comparisonMeta?.applicableDataTypes?.toUpperCase().includes("BOOLEAN") || false;
};

const getDefaultComparisonOptionID = (
  nodeCatalogID: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): number | null => {
  if (isAbbNode(nodeCatalogID, nodeCatalogs)) {
    return getAbbComparisonOptionID(comparisonOptionsData);
  }

  if (isBooleanNode(nodeCatalogID, nodeCatalogs)) {
    return comparisonOptionsData.find((item) =>
      item.applicableDataTypes?.toUpperCase().includes("BOOLEAN"),
    )?.comparisonOptionID ?? null;
  }

  return comparisonOptionsData[0]?.comparisonOptionID ?? null;
};

const isBetweenOperator = (
  comparisonOptionID: number | null,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): boolean => {
  const comparisonMeta = getComparisonMeta(comparisonOptionID, comparisonOptionsData);

  return comparisonMeta?.code?.toUpperCase().includes("BETWEEN") || false;
};

const createCommercialRateForm = (): ICommercialRateForm => ({
  clientId: createId(),
  rateMatrixID: 0,
  tenureMonths: 0,
  roiPercent: "",
  processingFee: "",
});

const createCommercialRates = (): ICommercialRateForm[] => [createCommercialRateForm()];

const mapCommercialRatesToForm = (
  rates: IPolicyRateMatrix[],
  needsCommercialRate: boolean,
): ICommercialRateForm[] => {
  if (!needsCommercialRate) {
    return [];
  }

  if (rates.length === 0) {
    return createCommercialRates();
  }

  return rates.map((rate) => ({
    clientId: createId(),
    rateMatrixID: rate.rateMatrixID,
    tenureMonths: rate.tenureMonths ?? 0,
    roiPercent: String(rate.roiPercent ?? ""),
    processingFee: String(rate.processingFee ?? ""),
  }));
};

const createTerminalOutcomeFromMaster = (
  outcomeCode: "APPROVE" | "REVIEW" | "REJECT",
  terminalOutcomeOptions: IGetTerminalOutcomesResponseData[],
): ITerminalOutcomeForm => {
  const matchedOutcome = terminalOutcomeOptions.find((item) => item.outcomeCode === outcomeCode);

  return {
    clientId: createId(),
    terminalOutcomeID: matchedOutcome?.terminalOutcomeID || 0,
    outcomeCode,
    outcomeName: matchedOutcome?.outcomeName || outcomeCode,
    finalDecision: matchedOutcome?.finalDecision || outcomeCode,
    isTerminal: matchedOutcome?.isTerminal ?? true,
    needsCommercialRate: matchedOutcome?.needsCommercialRate ?? (outcomeCode === "APPROVE"),
    needsManualReview: matchedOutcome?.needsManualReview ?? (outcomeCode === "REVIEW"),
    displayOrder: matchedOutcome?.displayOrder || 1,
    processingFeeType:
      matchedOutcome?.processingFeeType === ProcessingFeeType.RUPEES
        ? ProcessingFeeType.RUPEES
        : ProcessingFeeType.PERCENTAGE,
    emiCostType:
      matchedOutcome?.emiCostType === EmiCostType.NO_COST_EMI
        ? EmiCostType.NO_COST_EMI
        : EmiCostType.LOW_COST_EMI,
    remarks: matchedOutcome?.remarks || "",
    commercialRates:
      matchedOutcome?.needsCommercialRate || outcomeCode === "APPROVE"
        ? createCommercialRates()
        : [],
  };
};

const createNodeForm = (
  isRoot: boolean,
  sequenceNo: number,
  defaultNodeCatalogID: number,
): INodeForm => ({
  clientId: createId(),
  nodeInstanceID: 0,
  nodeCatalogID: defaultNodeCatalogID,
  nodeLabel: "",
  sequenceNo,
  isRoot,
  isActive: true,
  remarks: "",
  branches: [],
});

const createBranchForm = (
  sequenceNo: number,
  defaultNodeCatalogID: number,
  comparisonOptionID: number | null = null,
): IBranchForm => ({
  clientId: createId(),
  branchID: 0,
  comparisonOptionID,
  valueMin: "",
  valueMax: "",
  valueText: "",
  booleanValue: "",
  sequenceNo,
  remarks: "",
  nextNode: createNodeForm(false, sequenceNo, defaultNodeCatalogID),
  terminalOutcome: null,
});

const mapTerminalOutcomeToForm = (outcome: IPolicyTerminalOutcome): ITerminalOutcomeForm => ({
  clientId: createId(),
  terminalOutcomeID: outcome.terminalOutcomeID,
  outcomeCode: outcome.outcomeCode as "APPROVE" | "REVIEW" | "REJECT",
  outcomeName: outcome.outcomeName,
  finalDecision: outcome.finalDecision,
  isTerminal: outcome.isTerminal,
  needsCommercialRate: outcome.needsCommercialRate,
  needsManualReview: outcome.needsManualReview,
  displayOrder: outcome.displayOrder,
  processingFeeType:
    outcome.processingFeeType === ProcessingFeeType.RUPEES
      ? ProcessingFeeType.RUPEES
      : ProcessingFeeType.PERCENTAGE,
  emiCostType:
    outcome.emiCostType === EmiCostType.NO_COST_EMI
      ? EmiCostType.NO_COST_EMI
      : EmiCostType.LOW_COST_EMI,
  remarks: outcome.remarks,
  commercialRates: mapCommercialRatesToForm(
    outcome.commercialRates || [],
    outcome.needsCommercialRate,
  ),
});

const mapNodeToForm = (
  node: IPolicyTreeNode,
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): INodeForm => ({
  clientId: createId(),
  nodeInstanceID: node.nodeInstanceID,
  nodeCatalogID: node.nodeCatalogID,
  nodeLabel: node.nodeLabel,
  sequenceNo: node.sequenceNo,
  isRoot: node.isRoot,
  isActive: node.isActive,
  remarks: node.remarks,
  branches: (node.branches || []).map((branch) => ({
    clientId: createId(),
    branchID: branch.branchID,
    comparisonOptionID: branch.comparisonOptionID,
    valueMin:
      usesValueMaxField(branch.comparisonOptionID, comparisonOptionsData)
        ? ""
        : branch.valueMin === null
          ? ""
          : String(branch.valueMin),
    valueMax:
      usesValueMaxField(branch.comparisonOptionID, comparisonOptionsData)
        ? branch.valueMax === null
          ? ""
          : String(branch.valueMax)
        : branch.valueMax === null
          ? ""
          : String(branch.valueMax),
    valueText: branch.valueText || "",
    booleanValue:
      branch.booleanValue === null ? "" : branch.booleanValue ? "true" : "false",
    sequenceNo: branch.sequenceNo,
    remarks: branch.remarks,
    nextNode: branch.nextNode ? mapNodeToForm(branch.nextNode, comparisonOptionsData) : null,
    terminalOutcome: branch.terminalOutcome
      ? mapTerminalOutcomeToForm(branch.terminalOutcome)
      : null,
  })),
});

const resequenceBranches = (branches: IBranchForm[]): IBranchForm[] =>
  branches.map((branch, index) => ({
    ...branch,
    sequenceNo: index + 1,
    nextNode: branch.nextNode
      ? {
        ...branch.nextNode,
        sequenceNo: index + 1,
      }
      : null,
    terminalOutcome: branch.terminalOutcome
      ? {
        ...branch.terminalOutcome,
        displayOrder: index + 1,
      }
      : null,
  }));

const sanitizeBranchesForNodeCatalog = (
  branches: IBranchForm[],
  nodeCatalogID: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): IBranchForm[] => {
  const requiresDefaultOperator =
    isAbbNode(nodeCatalogID, nodeCatalogs) || isBooleanNode(nodeCatalogID, nodeCatalogs);

  if (!requiresDefaultOperator) {
    return branches;
  }

  const comparisonOptionID = getDefaultComparisonOptionID(
    nodeCatalogID,
    nodeCatalogs,
    comparisonOptionsData,
  );
  const booleanNode = isBooleanNode(nodeCatalogID, nodeCatalogs);

  return branches.map((branch) => {
    if (
      branch.comparisonOptionID === comparisonOptionID
      && (!booleanNode || branch.booleanValue !== "")
    ) {
      return branch;
    }

    return {
      ...branch,
      comparisonOptionID,
      valueMin: "",
      valueMax: "",
      valueText: "",
      booleanValue: booleanNode ? "true" : "",
    };
  });
};

const getBranchDestinationType = (branch: IBranchForm): string => {
  if (branch.terminalOutcome) {
    return branch.terminalOutcome.outcomeCode;
  }

  return "NEXT_NODE";
};

const updateNodeById = (
  currentNode: INodeForm,
  nodeId: string,
  updater: (node: INodeForm) => INodeForm,
): INodeForm => {
  if (currentNode.clientId === nodeId) {
    return updater(currentNode);
  }

  return {
    ...currentNode,
    branches: currentNode.branches.map((branch) => ({
      ...branch,
      nextNode: branch.nextNode ? updateNodeById(branch.nextNode, nodeId, updater) : null,
    })),
  };
};

const updateBranchById = (
  currentNode: INodeForm,
  branchId: string,
  updater: (branch: IBranchForm) => IBranchForm,
): INodeForm => ({
  ...currentNode,
  branches: currentNode.branches.map((branch) => {
    if (branch.clientId === branchId) {
      return updater(branch);
    }

    return {
      ...branch,
      nextNode: branch.nextNode ? updateBranchById(branch.nextNode, branchId, updater) : null,
    };
  }),
});

const addBranchToNode = (
  currentNode: INodeForm,
  nodeId: string,
  defaultNodeCatalogID: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): INodeForm => {
  if (currentNode.clientId === nodeId) {
    const branchComparisonOptionID = getDefaultComparisonOptionID(
      currentNode.nodeCatalogID,
      nodeCatalogs,
      comparisonOptionsData,
    );
    const booleanNode = isBooleanNode(currentNode.nodeCatalogID, nodeCatalogs);

    const newBranch = createBranchForm(
      currentNode.branches.length + 1,
      defaultNodeCatalogID,
      branchComparisonOptionID,
    );

    if (booleanNode) {
      newBranch.booleanValue = "true";
    }

    return {
      ...currentNode,
      branches: resequenceBranches([
        ...currentNode.branches,
        newBranch,
      ]),
    };
  }

  return {
    ...currentNode,
    branches: currentNode.branches.map((branch) => ({
      ...branch,
      nextNode: branch.nextNode
        ? addBranchToNode(
          branch.nextNode,
          nodeId,
          defaultNodeCatalogID,
          nodeCatalogs,
          comparisonOptionsData,
        )
        : null,
    })),
  };
};

const removeBranchFromNode = (
  currentNode: INodeForm,
  nodeId: string,
  branchId: string,
): INodeForm => {
  if (currentNode.clientId === nodeId) {
    return {
      ...currentNode,
      branches: resequenceBranches(
        currentNode.branches.filter((branch) => branch.clientId !== branchId),
      ),
    };
  }

  return {
    ...currentNode,
    branches: currentNode.branches.map((branch) => ({
      ...branch,
      nextNode: branch.nextNode ? removeBranchFromNode(branch.nextNode, nodeId, branchId) : null,
    })),
  };
};

const moveBranchWithinNode = (
  currentNode: INodeForm,
  nodeId: string,
  branchId: string,
  direction: "up" | "down",
): INodeForm => {
  if (currentNode.clientId === nodeId) {
    const branchIndex = currentNode.branches.findIndex((branch) => branch.clientId === branchId);

    if (branchIndex === -1) {
      return currentNode;
    }

    const targetIndex = direction === "up" ? branchIndex - 1 : branchIndex + 1;

    if (targetIndex < 0 || targetIndex >= currentNode.branches.length) {
      return currentNode;
    }

    const reorderedBranches = [...currentNode.branches];
    const [movedBranch] = reorderedBranches.splice(branchIndex, 1);

    reorderedBranches.splice(targetIndex, 0, movedBranch);

    return {
      ...currentNode,
      branches: resequenceBranches(reorderedBranches),
    };
  }

  return {
    ...currentNode,
    branches: currentNode.branches.map((branch) => ({
      ...branch,
      nextNode: branch.nextNode
        ? moveBranchWithinNode(branch.nextNode, nodeId, branchId, direction)
        : null,
    })),
  };
};

const toNumberOrNull = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const getProcessingFeeValidationMessage = (
  value: string,
  processingFeeType: ProcessingFeeType,
): string => {
  if (!value.trim()) {
    return "";
  }

  if (processingFeeType === ProcessingFeeType.PERCENTAGE) {
    return PROCESSING_FEE_PERCENT_PATTERN.test(value)
      ? ""
      : validationMessages.processingFeePercentInvalid;
  }

  return NON_NEGATIVE_AMOUNT_PATTERN.test(value)
    ? ""
    : validationMessages.nonNegativeAmountInvalid;
};

const getTenureValidationMessage = (value: string): string =>
  !value.trim() || EMI_MONTHS_PATTERN.test(value)
    ? ""
    : validationMessages.tenureMonthsInvalid;

const getRoiValidationMessage = (value: string): string =>
  !value.trim() || ROI_PERCENT_PATTERN.test(value)
    ? ""
    : validationMessages.roiPercentInvalid;

const getCatalogRegex = (nodeCatalog?: IGetNodeCatalogsResponseData): string =>
  nodeCatalog?.validationRegex || nodeCatalog?.validationPattern || nodeCatalog?.regex || "";

const getSimulationValueValidationMessage = (
  value: string,
  nodeCatalog?: IGetNodeCatalogsResponseData,
): string => {
  if (!value.trim() || !nodeCatalog) {
    return "";
  }

  const validationRegex = getCatalogRegex(nodeCatalog);

  if (validationRegex) {
    try {
      return new RegExp(validationRegex).test(value)
        ? ""
        : validationMessages.simulationValueInvalid(nodeCatalog.name);
    } catch {
      return "";
    }
  }

  const dataType = nodeCatalog.dataType?.toLowerCase() || "";

  if (NUMERIC_DATA_TYPE_PATTERN.test(dataType) && !NON_NEGATIVE_AMOUNT_PATTERN.test(value)) {
    return validationMessages.nonNegativeNumberInvalid;
  }

  if (dataType.includes("boolean") && !BOOLEAN_VALUE_PATTERN.test(value)) {
    return validationMessages.booleanInvalid;
  }

  return "";
};

const hasInvalidRateMatrixValue = (node: INodeForm): boolean =>
  node.branches.some((branch) => {
    const terminalOutcome = branch.terminalOutcome;

    if (
      terminalOutcome?.needsCommercialRate
      && terminalOutcome.commercialRates.some((rate) =>
        Boolean(
          getTenureValidationMessage(String(rate.tenureMonths || ""))
          || getRoiValidationMessage(rate.roiPercent)
          || getProcessingFeeValidationMessage(rate.processingFee, terminalOutcome.processingFeeType),
        ),
      )
    ) {
      return true;
    }

    return branch.nextNode ? hasInvalidRateMatrixValue(branch.nextNode) : false;
  });

const mapCommercialRateForPayload = (rate: ICommercialRateForm): IPolicyRateMatrix => ({
  rateMatrixID: rate.rateMatrixID,
  tenureMonths: rate.tenureMonths || null,
  roiPercent: Number(rate.roiPercent || 0),
  processingFee: Number(rate.processingFee || 0),
  advanceEmiPercent: null,
  otherCharges: null,
  isActive: true,
});

const mapTerminalOutcomeForPayload = (
  terminalOutcome: ITerminalOutcomeForm,
  branchSequenceNo: number,
): IPolicyTerminalOutcome => ({
  terminalOutcomeID: terminalOutcome.terminalOutcomeID,
  outcomeCode: terminalOutcome.outcomeCode,
  outcomeName: terminalOutcome.outcomeName,
  finalDecision: terminalOutcome.finalDecision,
  isTerminal: terminalOutcome.isTerminal,
  needsCommercialRate: terminalOutcome.needsCommercialRate,
  needsManualReview: terminalOutcome.needsManualReview,
  displayOrder: branchSequenceNo,
  processingFeeType: terminalOutcome.processingFeeType,
  emiCostType: terminalOutcome.emiCostType,
  remarks: terminalOutcome.remarks,
  commercialRates: terminalOutcome.commercialRates.map(mapCommercialRateForPayload),
});

const mapNodeToPayload = (
  node: INodeForm,
  sequenceNo: number,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): IPolicyTreeNode => ({
  nodeInstanceID: node.nodeInstanceID,
  nodeCatalogID: node.nodeCatalogID,
  nodeLabel: node.nodeLabel.trim() || getNodeCatalogLabelFromData(nodeCatalogs, node.nodeCatalogID),
  sequenceNo,
  isRoot: node.isRoot,
  isActive: node.isActive,
  remarks: node.remarks,
  branches: resequenceBranches(node.branches).map((branch, index) => {
    const branchSequenceNo = index + 1;
    const textOperator = isTextOperator(branch.comparisonOptionID, comparisonOptionsData);
    const booleanOperator = isBooleanOperator(branch.comparisonOptionID, comparisonOptionsData);
    const betweenOperator = isBetweenOperator(branch.comparisonOptionID, comparisonOptionsData);

    return {
      branchID: branch.branchID,
      comparisonOptionID: branch.comparisonOptionID,
      valueMin:
        textOperator || booleanOperator || usesValueMaxField(branch.comparisonOptionID, comparisonOptionsData)
          ? null
          : toNumberOrNull(branch.valueMin),
      valueMax:
        betweenOperator || usesValueMaxField(branch.comparisonOptionID, comparisonOptionsData)
          ? toNumberOrNull(branch.valueMax)
          : null,
      valueText: textOperator ? branch.valueText || null : null,
      booleanValue:
        booleanOperator && branch.booleanValue !== ""
          ? branch.booleanValue === "true"
          : null,
      sequenceNo: branchSequenceNo,
      remarks: branch.remarks,
      nextNode: branch.nextNode
        ? mapNodeToPayload(
          {
            ...branch.nextNode,
            isRoot: false,
          },
          branchSequenceNo,
          nodeCatalogs,
          comparisonOptionsData,
        )
        : null,
      terminalOutcome: branch.terminalOutcome
        ? mapTerminalOutcomeForPayload(branch.terminalOutcome, branchSequenceNo)
        : null,
    };
  }),
});

const buildPayload = (
  policyVersionID: number,
  rootNode: INodeForm,
  nodeCatalogs: IGetNodeCatalogsResponseData[],
  comparisonOptionsData: IGetComparisonOptionsResponseData[],
): IPolicyNode => ({
  policyVersionID,
  rootNode: mapNodeToPayload(
    {
      ...rootNode,
      isRoot: true,
    },
    1,
    nodeCatalogs,
    comparisonOptionsData,
  ),
});

const getSimulationOutcomeCode = (
  result: IPolicySimulationResultData | null,
): "APPROVE" | "REVIEW" | "REJECT" | "" => {
  const outcomeCode = result?.terminalOutcome?.outcomeCode?.toUpperCase() || "";

  if (outcomeCode === "APPROVE" || outcomeCode === "REVIEW" || outcomeCode === "REJECT") {
    return outcomeCode;
  }

  return "";
};

const getSimulationRateMatrix = (result: IPolicySimulationResultData): IPolicyRateMatrix[] => {
  if (result.commercialRates?.length) {
    return result.commercialRates;
  }

  return result.terminalOutcome?.commercialRates || [];
};

const normalizeSimulationResultData = (
  result: Partial<IPolicySimulationResultData> | null | undefined,
): IPolicySimulationResultData => ({
  policyInfo: result?.policyInfo || null,
  matchedPath: Array.isArray(result?.matchedPath) ? result?.matchedPath || [] : [],
  terminalOutcome: result?.terminalOutcome || null,
  commercialRates: Array.isArray(result?.commercialRates)
    ? result?.commercialRates || []
    : result?.terminalOutcome?.commercialRates || [],
});

const getSimulationOutcomeTheme = (
  outcomeCode: "APPROVE" | "REVIEW" | "REJECT" | "",
): {
  title: string;
  toneClassName: string;
  badgeLabel: string;
} => {
  if (outcomeCode === "APPROVE") {
    return {
      title: "Policy Approved",
      toneClassName: "dfb-simulation-result--approve",
      badgeLabel: "Approved",
    };
  }

  if (outcomeCode === "REVIEW") {
    return {
      title: "Manual Review Required",
      toneClassName: "dfb-simulation-result--review",
      badgeLabel: "Review",
    };
  }

  if (outcomeCode === "REJECT") {
    return {
      title: "Policy Rejected",
      toneClassName: "dfb-simulation-result--reject",
      badgeLabel: "Rejected",
    };
  }

  return {
    title: "Simulation Result",
    toneClassName: "",
    badgeLabel: "Result",
  };
};

const SimulationMatchedPathCard = ({
  step,
}: {
  step: IPolicySimulationMatchedPath;
}) => (
  <div className="dfb-path-card">
    <div className="dfb-path-card__step">Step {step.stepNo}</div>

    <div className="dfb-path-card__body">
      <div className="dfb-path-card__title">{step.nodeLabel}</div>
      <div className="dfb-path-card__meta">
        Value: <strong>{step.parameterValue || "-"}</strong>
      </div>
      <div className="dfb-path-card__meta">
        Matched: <strong>{step.branchMatched || "-"}</strong>
      </div>
      <div className="dfb-path-card__meta">
        Operator: <strong>{step.operatorUsed || "-"}</strong>
      </div>
      {step.notes ? <div className="dfb-path-card__note">{step.notes}</div> : null}
    </div>
  </div>
);

const SimulationResultPanel = ({ result }: ISimulationResultPanelProps) => {
  const outcomeCode = getSimulationOutcomeCode(result);
  const theme = getSimulationOutcomeTheme(outcomeCode);
  const rateMatrix = getSimulationRateMatrix(result);

  return (
    <div className={`dfb-simulation-result ${theme.toneClassName}`}>
      <div className="dfb-simulation-result__header">
        <div>
          <div className="dfb-simulation-result__eyebrow">Simulation Outcome</div>
          <h3 className="dfb-simulation-result__title">{theme.title}</h3>
          <p className="dfb-simulation-result__text">
            {result.terminalOutcome?.remarks || "The policy simulation completed successfully."}
          </p>
        </div>

        <span className="dfb-simulation-result__badge">{theme.badgeLabel}</span>
      </div>

      <div className="dfb-simulation-result__summary">
        <div className="dfb-simulation-stat">
          <span className="dfb-simulation-stat__label">Final Decision</span>
          <strong className="dfb-simulation-stat__value">
            {result.terminalOutcome?.finalDecision || "-"}
          </strong>
        </div>

        <div className="dfb-simulation-stat">
          <span className="dfb-simulation-stat__label">Matched Steps</span>
          <strong className="dfb-simulation-stat__value">{result.matchedPath.length}</strong>
        </div>

        <div className="dfb-simulation-stat">
          <span className="dfb-simulation-stat__label">Policy Version</span>
          <strong className="dfb-simulation-stat__value">
            {result.policyInfo?.policyVersionID || "-"}
          </strong>
        </div>
      </div>

      {result.matchedPath.length > 0 && (
        <div className="dfb-simulation-block">
          <div className="dfb-simulation-block__header">
            <h4 className="dfb-simulation-block__title">Matched Path</h4>
            <span className="dfb-simulation-block__text">
              Review how the input values travelled through the decision tree.
            </span>
          </div>

          <div className="dfb-path-grid">
            {result.matchedPath.map((step) => (
              <SimulationMatchedPathCard key={`${step.stepNo}-${step.nodeInstanceID}`} step={step} />
            ))}
          </div>
        </div>
      )}

      {outcomeCode === "APPROVE" && rateMatrix.length > 0 && (
        <div className="dfb-simulation-block">
          <div className="dfb-simulation-block__header">
            <h4 className="dfb-simulation-block__title">Approved Tenure Matrix</h4>
            <span className="dfb-simulation-block__text">
              ROI % and processing fee available for this approval result.
            </span>
          </div>

          <div className="dfb-simulation-table">
            <div className="dfb-simulation-table__head">
              <span>
                {result.terminalOutcome?.emiCostType === EmiCostType.NO_COST_EMI
                  ? "Tenure"
                  : "No. of EMI"}
              </span>
              <span>ROI %</span>
              <span>Processing Fee</span>
              <span>Processing Fee Type</span>
            </div>

            {rateMatrix.map((rate) => (
              <div
                className="dfb-simulation-table__row"
                key={`${rate.rateMatrixID}-${rate.tenureMonths}`}
              >
                <span>
                  {`${rate.tenureMonths ?? 0} months`}
                </span>
                <span>{rate.roiPercent}</span>
                <span>{rate.processingFee}</span>
                <span>
                  {result.terminalOutcome?.processingFeeType === ProcessingFeeType.RUPEES ? "₹" : "%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TerminalOutcomeCard = ({
  branch,
  isReadOnly,
  onUpdateTerminalOutcome,
  onUpdateCommercialRate,
  onAddCommercialRate,
  onRemoveCommercialRate,
}: ITerminalOutcomeCardProps) => {
  if (!branch.terminalOutcome) {
    return null;
  }

  const tenureLabel =
    branch.terminalOutcome.emiCostType === EmiCostType.NO_COST_EMI
      ? "Tenure Month"
      : "No. of EMI";
  const tenurePlaceholder =
    branch.terminalOutcome.emiCostType === EmiCostType.NO_COST_EMI
      ? "Enter tenure month"
      : "Enter number of EMI";
  const processingFeeType = branch.terminalOutcome.processingFeeType;
  const processingFeeLabel = processingFeeType === ProcessingFeeType.RUPEES
    ? "Processing Fee (₹)"
    : "Processing Fee (%)";
  const processingFeePlaceholder = processingFeeType === ProcessingFeeType.RUPEES
    ? "Enter amount in ₹"
    : "Enter percentage (0-100)";
  const commercialRates = branch.terminalOutcome.commercialRates;

  return (
    <div className="dfb-outcome-card">
      <div className="dfb-outcome-card__header">
        <span className="dfb-outcome-card__badge">{branch.terminalOutcome.outcomeCode}</span>
        <span className="dfb-outcome-card__meta">{branch.terminalOutcome.finalDecision}</span>
      </div>

      <div className="dfb-field">
        <label className="dfb-field__label">Outcome Remarks</label>
        <InputText
          value={branch.terminalOutcome.remarks}
          onChange={(event) =>
            onUpdateTerminalOutcome(branch.clientId, "remarks", event.target.value)
          }
          className="dfb-field__input"
          placeholder="Enter outcome remarks"
          disabled={isReadOnly}
        />
      </div>

      {branch.terminalOutcome.needsCommercialRate && (
        <div className="dfb-rate-matrix">
          <div className="dfb-rate-matrix__header">
            <div className="dfb-rate-matrix__div">
              <span className="dfb-rate-matrix__title">Approval Tenure Matrix</span>
              <span className="dfb-rate-matrix__subtitle">
                Configure common fee type, EMI mode, and approval matrix values.
              </span>
            </div>

            {!isReadOnly && (
              <Button
                type="button"
                label="+ Add Tenure Matrix"
                className="dfb-btn dfb-btn--ghost dfb-btn--mini"
                onClick={() => onAddCommercialRate(branch.clientId)}
              />
            )}
          </div>

          <div className="dfb-rate-matrix__config">
            <div className="dfb-field">
              <label className="dfb-field__label">Processing Fee Type</label>
              <Dropdown
                value={branch.terminalOutcome.processingFeeType}
                options={PROCESSING_TYPE_OPTIONS}
                optionLabel="label"
                optionValue="value"
                onChange={(event: DropdownChangeEvent) =>
                  onUpdateTerminalOutcome(
                    branch.clientId,
                    "processingFeeType",
                    Number(event.value || ProcessingFeeType.PERCENTAGE),
                  )
                }
                className="dfb-field__control"
                disabled={isReadOnly}
              />
            </div>

            <div className="dfb-field">
              <label className="dfb-field__label">EMI Cost Type</label>
              <div className="dfb-rate-matrix__radio-group">
                {EMI_COST_TYPE_OPTIONS.map((option) => (
                  <label className="dfb-rate-matrix__radio" key={option.value}>
                    <RadioButton
                      inputId={`${branch.clientId}-emi-cost-${option.value}`}
                      name={`${branch.clientId}-emi-cost`}
                      value={option.value}
                      onChange={(event) =>
                        onUpdateTerminalOutcome(
                          branch.clientId,
                          "emiCostType",
                          Number(event.value || EmiCostType.LOW_COST_EMI),
                        )
                      }
                      checked={branch.terminalOutcome?.emiCostType === option.value}
                      disabled={isReadOnly}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="dfb-rate-matrix__table">
            <div className={`dfb-rate-matrix__head ${isReadOnly ? "dfb-rate-matrix__head--without-action" : ""}`}>
              <span>{tenureLabel}</span>
              <span>ROI %</span>
              <span>{processingFeeLabel}</span>
              {!isReadOnly && <span>Action</span>}
            </div>

            {commercialRates.map((rate) => (
              <div
                className={`dfb-rate-matrix__row ${isReadOnly ? "dfb-rate-matrix__row--without-action" : ""}`}
                key={rate.clientId}
              >
                <div className="dfb-rate-matrix__cell" data-label={tenureLabel}>
                  <InputText
                    value={String(rate.tenureMonths || "")}
                    onChange={(event) =>
                      onUpdateCommercialRate(
                        branch.clientId,
                        rate.clientId,
                        "tenureMonths",
                        event.target.value,
                      )
                    }
                    className={`dfb-field__input ${getTenureValidationMessage(String(rate.tenureMonths || "")) ? "p-invalid" : ""}`}
                    placeholder={tenurePlaceholder}
                    inputMode="numeric"
                    disabled={isReadOnly}
                  />
                  {getTenureValidationMessage(String(rate.tenureMonths || "")) && (
                    <small className="error">
                      {getTenureValidationMessage(String(rate.tenureMonths || ""))}
                    </small>
                  )}
                </div>

                <div className="dfb-rate-matrix__cell" data-label="ROI %">
                  <InputText
                    value={rate.roiPercent}
                    onChange={(event) =>
                      onUpdateCommercialRate(
                        branch.clientId,
                        rate.clientId,
                        "roiPercent",
                        event.target.value,
                      )
                    }
                    className={`dfb-field__input ${getRoiValidationMessage(rate.roiPercent) ? "p-invalid" : ""}`}
                    placeholder="Enter ROI % (0-100)"
                    inputMode="decimal"
                    disabled={isReadOnly}
                  />
                  {getRoiValidationMessage(rate.roiPercent) && (
                    <small className="error">{getRoiValidationMessage(rate.roiPercent)}</small>
                  )}
                </div>

                <div className="dfb-rate-matrix__cell" data-label={processingFeeLabel}>
                  <InputText
                    value={rate.processingFee}
                    onChange={(event) =>
                      onUpdateCommercialRate(
                        branch.clientId,
                        rate.clientId,
                        "processingFee",
                        event.target.value,
                      )
                    }
                    className={`dfb-field__input ${getProcessingFeeValidationMessage(rate.processingFee, processingFeeType) ? "p-invalid" : ""}`}
                    placeholder={processingFeePlaceholder}
                    inputMode="decimal"
                    disabled={isReadOnly}
                  />
                  {getProcessingFeeValidationMessage(rate.processingFee, processingFeeType) && (
                    <small className="error">
                      {getProcessingFeeValidationMessage(rate.processingFee, processingFeeType)}
                    </small>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="dfb-rate-matrix__cell" data-label="Action">
                    <Button
                      type="button"
                      label="Remove"
                      className="dfb-btn dfb-btn--red dfb-btn--mini dfb-rate-matrix__remove"
                      onClick={() => onRemoveCommercialRate(branch.clientId, rate.clientId)}
                      disabled={commercialRates.length === 1}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NodeCard = ({
  node,
  depth,
  isReadOnly,
  nodeCatalogsData,
  nodeCatalogOptions,
  comparisonOptions,
  destinationOptions,
  comparisonOptionsData,
  onUpdateNode,
  onAddBranch,
  onUpdateBranch,
  onUpdateTerminalOutcome,
  onUpdateCommercialRate,
  onAddCommercialRate,
  onRemoveCommercialRate,
  onDeleteBranch,
  onMoveBranch,
}: INodeCardProps) => {
  const isRoot = depth === 0;
  const abbNode = isAbbNode(node.nodeCatalogID, nodeCatalogsData);
  const booleanNode = isBooleanNode(node.nodeCatalogID, nodeCatalogsData);
  const filteredComparisonOptions = abbNode
    ? comparisonOptionsData
      .filter((item) => isAbbComparisonOperator(item.comparisonOptionID, comparisonOptionsData))
      .map((item) => ({
        label: item.symbol || item.code,
        value: item.comparisonOptionID,
      }))
    : comparisonOptions;
  return (
    <div className={`dfb-tree-node ${isRoot ? "dfb-tree-node--root" : ""}`}>
      <Card className="dfb-card">
        <div className="dfb-card__meta">
          <span className="dfb-card__badge">{isRoot ? "Root Node" : "Decision Node"}</span>
          <span className="dfb-card__level">Level {depth + 1}</span>
        </div>

        <div className="dfb-card__editor">
          <div className="dfb-field">
            <label className="dfb-field__label">Field</label>
            <Dropdown
              value={node.nodeCatalogID}
              options={nodeCatalogOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(event: DropdownChangeEvent) =>
                onUpdateNode(node.clientId, "nodeCatalogID", Number(event.value || 0))
              }
              className="dfb-field__control"
              disabled={isReadOnly}
            />
          </div>

          <div className="dfb-field">
            <label className="dfb-field__label">Node Label</label>
            <InputText
              value={node.nodeLabel}
              onChange={(event) => onUpdateNode(node.clientId, "nodeLabel", event.target.value)}
              className="dfb-field__input"
              placeholder="Enter node label (optional)"
              disabled={isReadOnly}
            />
          </div>

          <div className="dfb-field">
            <label className="dfb-field__label">Node Remarks</label>
            <InputText
              value={node.remarks}
              onChange={(event) => onUpdateNode(node.clientId, "remarks", event.target.value)}
              className="dfb-field__input"
              placeholder="Enter node remarks"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {!isReadOnly && (
          <div className="dfb-card__actions">
            <Button
              type="button"
              label="+ Branch"
              className="dfb-btn dfb-btn--blue"
              onClick={() => onAddBranch(node.clientId)}
            />
          </div>
        )}
      </Card>

      {node.branches.length > 0 && (
        <div className="dfb-branch-group">
          <div className="dfb-branch-group__trunk" />

          <div className={`dfb-branch-grid ${node.branches.length === 1 ? "dfb-branch-grid--single" : ""}`}>
            {node.branches.map((branch, index) => {
              const comparisonMeta = getComparisonMeta(
                branch.comparisonOptionID,
                comparisonOptionsData,
              );
              const showBoolean = booleanNode || isBooleanOperator(
                branch.comparisonOptionID,
                comparisonOptionsData,
              );
              const showText = isTextOperator(
                branch.comparisonOptionID,
                comparisonOptionsData,
              );
              const showBetween = isBetweenOperator(
                branch.comparisonOptionID,
                comparisonOptionsData,
              );
              const useValueMax = usesValueMaxField(
                branch.comparisonOptionID,
                comparisonOptionsData,
              );
              const showMin =
                !showBoolean && !showText && (comparisonMeta?.requiresMinValue || showBetween);
              const showMax =
                !showBoolean
                && !showText
                && (comparisonMeta?.requiresMaxValue || showBetween || useValueMax);
              const numericValueLabel = abbNode
                ? "No. of EMI months"
                : useValueMax
                  ? "Value Max"
                  : "Value Min";
              const numericValuePlaceholder = abbNode
                ? "Enter number of EMI months"
                : useValueMax
                  ? "Enter maximum value"
                  : "Enter minimum value";

              return (
                <div className="dfb-branch-grid__item" key={branch.clientId}>
                  <div className="dfb-branch-grid__connector" />

                  <Card className="dfb-branch-card">
                    <div className="dfb-branch-card__header">
                      <span className="dfb-branch-card__badge">Branch {branch.sequenceNo}</span>

                      {!isReadOnly && (
                        <div className="dfb-branch-card__tools">
                          <Button
                            type="button"
                            label="Up"
                            className="dfb-btn dfb-btn--ghost dfb-btn--mini"
                            onClick={() => onMoveBranch(node.clientId, branch.clientId, "up")}
                            disabled={index === 0}
                          />

                          <Button
                            type="button"
                            label="Down"
                            className="dfb-btn dfb-btn--ghost dfb-btn--mini"
                            onClick={() => onMoveBranch(node.clientId, branch.clientId, "down")}
                            disabled={index === node.branches.length - 1}
                          />

                          <Button
                            type="button"
                            label="Delete"
                            className="dfb-btn dfb-btn--red dfb-btn--mini"
                            onClick={() => onDeleteBranch(node.clientId, branch.clientId)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="dfb-branch-card__editor">
                      <div className="dfb-field">
                        <label className="dfb-field__label">Operator</label>
                        {booleanNode ? (
                          <Dropdown
                            value={branch.booleanValue}
                            options={BOOLEAN_OPTIONS}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(event: DropdownChangeEvent) =>
                              onUpdateBranch(
                                branch.clientId,
                                "booleanValue",
                                String(event.value || ""),
                              )
                            }
                            className="dfb-field__control"
                            disabled={isReadOnly}
                          />
                        ) : (
                          <Dropdown
                            value={branch.comparisonOptionID}
                            options={filteredComparisonOptions}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Operator"
                            onChange={(event: DropdownChangeEvent) =>
                              onUpdateBranch(
                                branch.clientId,
                                "comparisonOptionID",
                                Number(event.value || 0),
                              )
                            }
                            className="dfb-field__control"
                            disabled={isReadOnly}
                          />
                        )}
                      </div>

                      {showMin && !useValueMax && (
                        <div className="dfb-field">
                          <label className="dfb-field__label">{numericValueLabel}</label>
                          <InputText
                            value={branch.valueMin}
                            onChange={(event) =>
                              onUpdateBranch(branch.clientId, "valueMin", event.target.value)
                            }
                            className="dfb-field__input"
                            placeholder={numericValuePlaceholder}
                            disabled={isReadOnly}
                          />
                        </div>
                      )}

                      {showMax && (
                        <div className="dfb-field">
                          <label className="dfb-field__label">
                            {useValueMax || abbNode ? numericValueLabel : "Value Max"}
                          </label>
                          <InputText
                            value={branch.valueMax}
                            onChange={(event) =>
                              onUpdateBranch(branch.clientId, "valueMax", event.target.value)
                            }
                            className="dfb-field__input"
                            placeholder={
                              useValueMax || abbNode ? numericValuePlaceholder : "Enter maximum value"
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                      )}

                      {showText && (
                        <div className="dfb-field">
                          <label className="dfb-field__label">Value Text</label>
                          <InputText
                            value={branch.valueText}
                            onChange={(event) =>
                              onUpdateBranch(branch.clientId, "valueText", event.target.value)
                            }
                            className="dfb-field__input"
                            placeholder="Enter text value"
                            disabled={isReadOnly}
                          />
                        </div>
                      )}

                      {showBoolean && !booleanNode && (
                        <div className="dfb-field">
                          <label className="dfb-field__label">Boolean Value</label>
                          <Dropdown
                            value={branch.booleanValue}
                            options={BOOLEAN_OPTIONS}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(event: DropdownChangeEvent) =>
                              onUpdateBranch(
                                branch.clientId,
                                "booleanValue",
                                String(event.value || ""),
                              )
                            }
                            className="dfb-field__control"
                            disabled={isReadOnly}
                          />
                        </div>
                      )}

                      <div className="dfb-field">
                        <label className="dfb-field__label">Branch Title / Remarks</label>
                        <InputText
                          value={branch.remarks}
                          onChange={(event) =>
                            onUpdateBranch(branch.clientId, "remarks", event.target.value)
                          }
                          className="dfb-field__input"
                          placeholder="Enter branch remarks"
                          disabled={isReadOnly}
                        />
                      </div>

                      <div className="dfb-field">
                        <label className="dfb-field__label">Destination</label>
                        <Dropdown
                          value={getBranchDestinationType(branch)}
                          options={destinationOptions}
                          optionLabel="label"
                          optionValue="value"
                          onChange={(event: DropdownChangeEvent) =>
                            onUpdateBranch(
                              branch.clientId,
                              "destinationType",
                              String(event.value || "NEXT_NODE"),
                            )
                          }
                          className="dfb-field__control"
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>

                    {branch.nextNode && !branch.terminalOutcome && (
                      <div className="dfb-branch-card__destination">
                        <NodeCard
                          node={branch.nextNode}
                          depth={depth + 1}
                          isReadOnly={isReadOnly}
                          nodeCatalogsData={nodeCatalogsData}
                          nodeCatalogOptions={nodeCatalogOptions}
                          comparisonOptions={comparisonOptions}
                          destinationOptions={destinationOptions}
                          comparisonOptionsData={comparisonOptionsData}
                          onUpdateNode={onUpdateNode}
                          onAddBranch={onAddBranch}
                          onUpdateBranch={onUpdateBranch}
                          onUpdateTerminalOutcome={onUpdateTerminalOutcome}
                          onUpdateCommercialRate={onUpdateCommercialRate}
                          onAddCommercialRate={onAddCommercialRate}
                          onRemoveCommercialRate={onRemoveCommercialRate}
                          onDeleteBranch={onDeleteBranch}
                          onMoveBranch={onMoveBranch}
                        />
                      </div>
                    )}

                    {branch.terminalOutcome && (
                      <div className="dfb-branch-card__destination">
                        <TerminalOutcomeCard
                          branch={branch}
                          isReadOnly={isReadOnly}
                          onUpdateTerminalOutcome={onUpdateTerminalOutcome}
                          onUpdateCommercialRate={onUpdateCommercialRate}
                          onAddCommercialRate={onAddCommercialRate}
                          onRemoveCommercialRate={onRemoveCommercialRate}
                        />
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const DecisionFlowBuilder = ({
  policyVersionID,
  isReadOnly = false,
}: IDecisionFlowBuilderProps) => {
  const navigate = useNavigate();

  const [rootNode, setRootNode] = useState<INodeForm>(createNodeForm(true, 1, 1));

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [currentPolicyVersionID, setCurrentPolicyVersionID] = useState<number>(policyVersionID);

  const [policyInfo, setPolicyInfo] = useState<IPolicyInfo | null>(null);

  const [policyInstituteID, setPolicyInstituteID] = useState<string>("");

  const [nodeCatalogs, setNodeCatalogs] = useState<IGetNodeCatalogsResponseData[]>([]);

  const [comparisonOptionsData, setComparisonOptionsData] = useState<
    IGetComparisonOptionsResponseData[]
  >([]);

  const [terminalOutcomes, setTerminalOutcomes] = useState<IGetTerminalOutcomesResponseData[]>([]);

  const [simulationRows, setSimulationRows] = useState<ISimulationInputRow[]>([
    createSimulationInputRow(),
  ]);

  const [simulationResult, setSimulationResult] = useState<IPolicySimulationResultData | null>(
    null,
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const [isSimulationDialogVisible, setIsSimulationDialogVisible] = useState<boolean>(false);

  const [isLoadingPolicy, setIsLoadingPolicy] = useState<boolean>(true);

  const [isCreatingPolicy, setIsCreatingPolicy] = useState<boolean>(false);

  const [isSavingPolicy, setIsSavingPolicy] = useState<boolean>(false);

  const [isSimulatingPolicy, setIsSimulatingPolicy] = useState<boolean>(false);

  const [isPublishingPolicy, setIsPublishingPolicy] = useState<boolean>(false);

  const defaultNodeCatalogID = nodeCatalogs[0]?.nodeCatalogID || 1;

  const loadPolicy = async (
    nextPolicyVersionID: number,
    activeNodeCatalogs: IGetNodeCatalogsResponseData[],
    activeComparisonOptions: IGetComparisonOptionsResponseData[],
  ): Promise<void> => {
    setIsLoadingPolicy(true);

    try {
      const policyResponse = await getPolicyAPI({ policyVersionID: nextPolicyVersionID });

      const nextPolicyInfo = policyResponse?.data?.policyInfo || null;

      const nextRootNode = policyResponse?.data?.rootNode || null;

      setPolicyInfo(nextPolicyInfo);
      setPolicyInstituteID(nextPolicyInfo?.instituteID || "");
      setCurrentPolicyVersionID(nextPolicyInfo?.policyVersionID ?? nextPolicyVersionID);
      setRootNode(
        nextRootNode
          ? mapNodeToForm(nextRootNode, activeComparisonOptions)
          : createNodeForm(true, 1, activeNodeCatalogs[0]?.nodeCatalogID || 1),
      );
      setHasUnsavedChanges(false);
      setSimulationRows([createSimulationInputRow()]);
      setSimulationResult(null);
      setIsSimulationDialogVisible(false);
    } catch (error) {
      if (nextPolicyVersionID === 0) {
        setPolicyInfo(null);
        setPolicyInstituteID("");
        setCurrentPolicyVersionID(0);
        setRootNode(createNodeForm(true, 1, activeNodeCatalogs[0]?.nodeCatalogID || 1));
        setHasUnsavedChanges(false);
        setSimulationRows([createSimulationInputRow()]);
        setSimulationResult(null);
        setIsSimulationDialogVisible(false);
      } else {
        console.error("Failed to load policy", error);
      }
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      try {
        const [nodeCatalogResponse, comparisonOptionResponse, terminalOutcomeResponse] =
          await Promise.all([
            getNodeCatalogsAPI(),
            getComparisonOptionsAPI(),
            getTerminalOutcomesAPI(),
          ]);

        const nextNodeCatalogs = normalizeApiList(nodeCatalogResponse?.data).filter(
          (item) => item?.isActive,
        );
        const nextComparisonOptions = normalizeApiList(comparisonOptionResponse?.data).filter(
          (item) => item?.isActive,
        );
        const nextTerminalOutcomes = normalizeApiList(terminalOutcomeResponse?.data).filter(
          (item) => item?.isTerminal,
        );

        setNodeCatalogs(nextNodeCatalogs);
        setComparisonOptionsData(nextComparisonOptions);
        setTerminalOutcomes(nextTerminalOutcomes);
        setRootNode((currentRootNode) => ({
          ...currentRootNode,
          nodeCatalogID: currentRootNode.nodeCatalogID || nextNodeCatalogs[0]?.nodeCatalogID || 1,
        }));

        await loadPolicy(policyVersionID, nextNodeCatalogs, nextComparisonOptions);
      } catch (error) {
        console.error("Failed to load BRE master data", error);
        setIsLoadingPolicy(false);
      }
    };

    void loadInitialData();
  }, [policyVersionID]);

  const nodeCatalogOptions: IOption<number>[] = nodeCatalogs.map((item) => ({
    label: item.name,
    value: item.nodeCatalogID,
  }));

  const comparisonOptions: IOption<number>[] = comparisonOptionsData.map((item) => ({
    label: item.symbol || item.code,
    value: item.comparisonOptionID,
  }));

  const destinationOptions: IOption<string>[] = [
    { label: "Next Node", value: "NEXT_NODE" },
    ...terminalOutcomes.map((item) => ({
      label: item.outcomeCode,
      value: item.outcomeCode,
    })),
  ];

  const isEditorVisible = currentPolicyVersionID > 0;

  const hasPolicyData = rootNode.branches.length > 0;
  
  const isPublishedPolicy = policyInfo?.status?.toLowerCase() === "published";
  
  const isPolicyReadOnly = isReadOnly || isPublishedPolicy;
  
  const canSimulatePolicy =
    isEditorVisible && hasPolicyData && !hasUnsavedChanges && !isPublishedPolicy;

  const markPolicyDirty = (): void => {
    setHasUnsavedChanges(true);
    setSimulationResult(null);
  };

  const handleCreatePolicy = async (): Promise<void> => {
    if (isReadOnly || isLoadingPolicy) {
      return;
    }

    const instituteID = policyInstituteID || policyInfo?.instituteID;

    if (!instituteID) {
      toastError("Institute ID is missing.");
      return;
    }

    setIsCreatingPolicy(true);

    try {
      const payload: ICreateDraftPolicyBody = {
        instituteID,
        productTypeID: DEFAULT_PRODUCT_TYPE_ID,
      };

      const response = await createDraftPolicyAPI(payload);
      const nextPolicyVersionID = response?.data?.policyVersionID || 0;

      setCurrentPolicyVersionID(nextPolicyVersionID);
      setPolicyInfo((currentPolicyInfo) => ({
        policyVersionID: nextPolicyVersionID,
        instituteID,
        productTypeID: DEFAULT_PRODUCT_TYPE_ID,
        versionNo: currentPolicyInfo?.versionNo || 1,
        status: "Draft",
        effectiveFrom: null,
        effectiveTo: null,
        rootNodeInstanceID: null,
        isActive: true,
        createdBy: currentPolicyInfo?.createdBy || "",
        createdAt: currentPolicyInfo?.createdAt || "",
        publishedBy: null,
        publishedAt: null,
        remarks: null,
      }));
      setPolicyInstituteID(instituteID);
      setRootNode(createNodeForm(true, 1, defaultNodeCatalogID));
      setHasUnsavedChanges(true);
      setSimulationRows([createSimulationInputRow()]);
      setSimulationResult(null);
      setIsSimulationDialogVisible(false);
      toastSuccess(response?.message);
    } catch (error) {
      console.error("Failed to create draft policy", error);
    } finally {
      setIsCreatingPolicy(false);
    }
  };

  const handleUpdateNode = (
    nodeId: string,
    fieldName: keyof Pick<INodeForm, "nodeCatalogID" | "nodeLabel" | "remarks">,
    value: string | number,
  ): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateNodeById(currentRootNode, nodeId, (node) => ({
        ...node,
        [fieldName]: value,
        branches:
          fieldName === "nodeCatalogID"
            ? sanitizeBranchesForNodeCatalog(
              node.branches,
              Number(value),
              nodeCatalogs,
              comparisonOptionsData,
            )
            : node.branches,
      })),
    );
  };

  const handleAddBranch = (nodeId: string): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      addBranchToNode(
        currentRootNode,
        nodeId,
        defaultNodeCatalogID,
        nodeCatalogs,
        comparisonOptionsData,
      ),
    );
  };

  const handleUpdateBranch = (
    branchId: string,
    fieldName:
      | keyof Pick<
        IBranchForm,
        "comparisonOptionID" | "valueMin" | "valueMax" | "valueText" | "booleanValue" | "remarks"
      >
      | "destinationType",
    value: string | number,
  ): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateBranchById(currentRootNode, branchId, (branch) => {
        if (fieldName === "destinationType") {
          const destinationType = String(value);

          if (destinationType === "NEXT_NODE") {
            return {
              ...branch,
              nextNode: branch.nextNode || createNodeForm(false, branch.sequenceNo, defaultNodeCatalogID),
              terminalOutcome: null,
            };
          }

          return {
            ...branch,
            nextNode: null,
            terminalOutcome: createTerminalOutcomeFromMaster(
              destinationType as "APPROVE" | "REVIEW" | "REJECT",
              terminalOutcomes,
            ),
          };
        }

        if (fieldName === "comparisonOptionID") {
          return {
            ...branch,
            comparisonOptionID: Number(value),
            valueMin: "",
            valueMax: "",
            valueText: "",
            booleanValue: "",
          };
        }

        return {
          ...branch,
          [fieldName]: value,
        };
      }),
    );
  };

  const handleUpdateTerminalOutcome = (
    branchId: string,
    fieldName: keyof Pick<ITerminalOutcomeForm, "remarks" | "processingFeeType" | "emiCostType">,
    value: string | number,
  ): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateBranchById(currentRootNode, branchId, (branch) => ({
        ...branch,
        terminalOutcome: branch.terminalOutcome
          ? {
            ...branch.terminalOutcome,
            [fieldName]: value,
          }
          : null,
      })),
    );
  };

  const handleUpdateCommercialRate = (
    branchId: string,
    rateId: string,
    fieldName: keyof Pick<ICommercialRateForm, "tenureMonths" | "roiPercent" | "processingFee">,
    value: string,
  ): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateBranchById(currentRootNode, branchId, (branch) => ({
        ...branch,
        terminalOutcome: branch.terminalOutcome
          ? {
            ...branch.terminalOutcome,
            commercialRates: branch.terminalOutcome.commercialRates.map((rate) =>
              rate.clientId === rateId
                ? {
                  ...rate,
                  [fieldName]:
                    fieldName === "tenureMonths"
                      ? Number(value || 0)
                      : value,
                }
                : rate,
            ),
          }
          : null,
      })),
    );
  };

  const handleAddCommercialRate = (branchId: string): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateBranchById(currentRootNode, branchId, (branch) => ({
        ...branch,
        terminalOutcome: branch.terminalOutcome
          ? {
            ...branch.terminalOutcome,
            commercialRates: [
              ...branch.terminalOutcome.commercialRates,
              createCommercialRateForm(),
            ],
          }
          : null,
      })),
    );
  };

  const handleRemoveCommercialRate = (branchId: string, rateId: string): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      updateBranchById(currentRootNode, branchId, (branch) => ({
        ...branch,
        terminalOutcome: branch.terminalOutcome
          ? {
            ...branch.terminalOutcome,
            commercialRates:
              branch.terminalOutcome.commercialRates.filter((rate) => rate.clientId !== rateId) || [],
          }
          : null,
      })),
    );
  };

  const handleDeleteBranch = (nodeId: string, branchId: string): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) => removeBranchFromNode(currentRootNode, nodeId, branchId));
  };

  const handleMoveBranch = (
    nodeId: string,
    branchId: string,
    direction: "up" | "down",
  ): void => {
    if (isReadOnly) {
      return;
    }

    markPolicyDirty();
    setRootNode((currentRootNode) =>
      moveBranchWithinNode(currentRootNode, nodeId, branchId, direction),
    );
  };

  const handleSavePolicy = async (): Promise<void> => {
    if (isReadOnly) {
      return;
    }

    if (currentPolicyVersionID === 0) {
      toastError("Create a new policy before saving.");
      return;
    }

    if (hasInvalidRateMatrixValue(rootNode)) {
      toastError(validationMessages.rateMatrixInvalid);
      return;
    }

    setIsSavingPolicy(true);

    try {
      const payload = buildPayload(
        currentPolicyVersionID,
        rootNode,
        nodeCatalogs,
        comparisonOptionsData,
      );

      const response = await savePolicyAPI(payload);

      if (!response) {
        setIsSavingPolicy(false);
        return;
      }

      if (response && response.statusCode === 200) {
        setHasUnsavedChanges(false);
        toastSuccess(response?.message);
      } else {
        toastError(response?.message);
      }

    } catch (error) {
      console.error("Failed to save policy", error);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleOpenSimulationDialog = (): void => {
    if (!canSimulatePolicy) {
      toastError("Save the latest policy changes before simulation.");
      return;
    }

    setIsSimulationDialogVisible(true);
  };

  const handleSimulationRowChange = (
    rowId: string,
    fieldName: keyof Pick<ISimulationInputRow, "nodeCatalogCode" | "value" | "emiAmount">,
    value: string,
  ): void => {
    if (
      fieldName === "emiAmount" &&
      !EMI_AMOUNT_INPUT_PATTERN.test(value)
    ) {
      return;
    }

    setSimulationResult(null);
    setSimulationRows((currentRows) =>
      currentRows.map((row) =>
        row.clientId === rowId
          ? {
            ...row,
            [fieldName]: value,
            ...(fieldName === "nodeCatalogCode" && !isAbbSimulationCode(value)
              ? {
                emiAmount: "",
              }
              : {}),
          }
          : row,
      ),
    );
  };

  const handleAddSimulationRow = (): void => {
    setSimulationResult(null);
    setSimulationRows((currentRows) => [...currentRows, createSimulationInputRow()]);
  };

  const handleRemoveSimulationRow = (rowId: string): void => {
    setSimulationResult(null);
    setSimulationRows((currentRows) => {
      const filteredRows = currentRows.filter((row) => row.clientId !== rowId);

      return filteredRows.length > 0 ? filteredRows : [createSimulationInputRow()];
    });
  };

  const handleSimulatePolicy = async (): Promise<void> => {
    if (!canSimulatePolicy) {
      toastError("Save the latest policy changes before simulation.");
      return;
    }

    const trimmedRows = simulationRows
      .map((row) => ({
        ...row,
        nodeCatalogCode: row.nodeCatalogCode.trim(),
        value: row.value.trim(),
        emiAmount: row.emiAmount.trim(),
      }))
      .filter((row) => row.nodeCatalogCode && row.value);

    if (trimmedRows.length === 0) {
      toastError("Add at least one simulation input.");
      return;
    }

    const selectedCodes = trimmedRows.map((row) => row.nodeCatalogCode);
    const hasDuplicateCodes = new Set(selectedCodes).size !== selectedCodes.length;

    if (hasDuplicateCodes) {
      toastError("Each simulation parameter can be selected only once.");
      return;
    }

    const invalidSimulationRow = trimmedRows.find((row) =>
      Boolean(
        getSimulationValueValidationMessage(
          row.value,
          nodeCatalogs.find((catalog) => catalog.code === row.nodeCatalogCode),
        ),
      ),
    );

    if (invalidSimulationRow) {
      toastError(`Enter a valid value for ${invalidSimulationRow.nodeCatalogCode}.`);
      return;
    }

    const abbRows = trimmedRows.filter((row) => isAbbSimulationCode(row.nodeCatalogCode));

    if (abbRows.some((row) => !row.emiAmount)) {
      toastError("Enter EMI Amount for ABB simulation.");
      return;
    }

    if (abbRows.some(
      (row) =>
        !EMI_AMOUNT_PATTERN.test(row.emiAmount) ||
        Number(row.emiAmount) <= 0 ||
        Number.isNaN(Number(row.emiAmount)),
    )) {
      toastError(validationMessages.emiAmountInvalid);
      return;
    }

    setIsSimulatingPolicy(true);

    try {
      const inputs = trimmedRows.reduce<Record<string, string>>((accumulator, row) => {
        accumulator[row.nodeCatalogCode] = row.value;

        if (isAbbSimulationCode(row.nodeCatalogCode)) {
          const abbValue = Number(row.value);
          const emiAmountValue = Number(row.emiAmount);
          const normalizedAbbValue = !Number.isNaN(abbValue) && emiAmountValue > 0
            ? String(abbValue / emiAmountValue)
            : row.value;

          accumulator[row.nodeCatalogCode] = normalizedAbbValue;
        }

        return accumulator;
      }, {});

      const payload: ISimulatePolicyBody = {
        policyVersionID: currentPolicyVersionID,
        inputs,
      };

      const response = await simulatePolicyAPI(payload);

      setSimulationResult(normalizeSimulationResultData(response?.data));
      toastSuccess(response?.message);
    } catch (error) {
      console.error("Failed to simulate policy", error);
    } finally {
      setIsSimulatingPolicy(false);
    }
  };

  const handlePublishPolicy = async (): Promise<void> => {
    if (currentPolicyVersionID === 0) {
      toastError("Create a policy before publishing.");
      return;
    }

    setIsPublishingPolicy(true);

    try {
      const response = await publishPolicyAPI({ policyVersionID: currentPolicyVersionID });

      if (!response || response.statusCode !== 200) {
        toastError(response?.message);
        return;
      }

      setPolicyInfo((currentPolicyInfo) =>
        currentPolicyInfo
          ? {
            ...currentPolicyInfo,
            status: "Published",
          }
          : currentPolicyInfo,
      );
      setIsSimulationDialogVisible(false);
      toastSuccess(response?.message);
    } catch (error) {
      console.error("Failed to publish policy", error);
    } finally {
      setIsPublishingPolicy(false);
    }
  };

  const handleZoomIn = (): void => {
    setZoomLevel((currentZoomLevel) =>
      Math.min(MAX_ZOOM, Number((currentZoomLevel + ZOOM_STEP).toFixed(2))),
    );
  };

  const handleZoomOut = (): void => {
    setZoomLevel((currentZoomLevel) =>
      Math.max(MIN_ZOOM, Number((currentZoomLevel - ZOOM_STEP).toFixed(2))),
    );
  };

  const getSimulationCatalogOptions = (currentRowId: string): IOption<string>[] => {
    const selectedCodes = simulationRows
      .filter((row) => row.clientId !== currentRowId)
      .map((row) => row.nodeCatalogCode)
      .filter(Boolean);

    return nodeCatalogs
      .filter((catalog) => !selectedCodes.includes(catalog.code))
      .map((catalog) => ({
        label: `${catalog.name} (${catalog.code})`,
        value: catalog.code,
      }));
  };

  const handleBackToPolicyListing = (): void => {
    const instituteID = policyInstituteID || policyInfo?.instituteID;

    if (instituteID) {
      navigate(
        RoutePathConstant.private.breBuilder.replace(":id", instituteID),
      );
      return;
    }

    navigate(-1);
  };

  return (
    <div className="dfb-page">
      <Button
        type="button"
        label="Back to Policies"
        className="dfb-btn dfb-btn--ghost align-self-start"
        onClick={handleBackToPolicyListing}
      />
      <div className="dfb-hero">
        <div className="dfb-hero__panel dfb-hero__panel--info">

          <span className="dfb-hero__eyebrow">Visual Rule Flow</span>
          <h2 className="dfb-hero__title">Decision Flow Builder</h2>
          <p className="dfb-hero__text">
            Build decision branches visually so the policy path is easy to explain and review.
          </p>

          <div className="dfb-policy-strip">
            <span className="dfb-policy-chip">
              Policy Version ID: <strong>{currentPolicyVersionID}</strong>
            </span>
            <span className="dfb-policy-chip">
              Status: <strong>{policyInfo?.status || "Draft"}</strong>
            </span>
            {isReadOnly && (
              <span className="dfb-policy-chip">
                Mode: <strong>View Only</strong>
              </span>
            )}
            <span className="dfb-policy-chip">
              Changes: <strong>{hasUnsavedChanges ? "Unsaved" : "Saved"}</strong>
            </span>
          </div>
        </div>

        <div className="dfb-hero__panel dfb-hero__panel--actions">
          <div className="dfb-zoom-panel">
            <span className="dfb-zoom-panel__label">Canvas Zoom</span>

            <div className="dfb-zoom-panel__controls">
              <Button
                type="button"
                label="-"
                className="dfb-btn dfb-btn--ghost dfb-btn--zoom"
                onClick={handleZoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
              />

              <span className="dfb-zoom-panel__value">{Math.round(zoomLevel * 100)}%</span>

              <Button
                type="button"
                label="+"
                className="dfb-btn dfb-btn--ghost dfb-btn--zoom"
                onClick={handleZoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
              />
            </div>
          </div>

          {!isReadOnly && (
            <Button
              type="button"
              label="Create New Policy"
              className="dfb-btn dfb-btn--blue"
              onClick={handleCreatePolicy}
              loading={isCreatingPolicy}
              disabled={isLoadingPolicy || isCreatingPolicy}
            />
          )}

          {!isReadOnly && isEditorVisible && !isPublishedPolicy && (
            <Button
              type="button"
              label="Save Policy"
              className="dfb-btn dfb-btn--ghost"
              onClick={handleSavePolicy}
              loading={isSavingPolicy}
              disabled={isLoadingPolicy || isCreatingPolicy || isSavingPolicy}
            />
          )}

          {canSimulatePolicy && (
            <Button
              type="button"
              label="Simulate Policy"
              className="dfb-btn dfb-btn--blue"
              onClick={handleOpenSimulationDialog}
              disabled={isLoadingPolicy || isCreatingPolicy}
            />
          )}

          {!isReadOnly && isEditorVisible && hasUnsavedChanges && (
            <span className="dfb-helper-text">
              Save the latest policy changes to enable simulation.
            </span>
          )}
        </div>
      </div>

      {isLoadingPolicy ? (
        <div className="dfb-empty-state">Loading policy...</div>
      ) : !isEditorVisible ? (
        <div className="dfb-empty-state">
          Create a new draft policy to start building the decision tree.
        </div>
      ) : (
        <>
          <div className="dfb-canvas-viewport">
            <div
              className="dfb-canvas"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                width: `${100 / zoomLevel}%`,
              }}
            >
              <section className="dfb-root-section">
                <NodeCard
                  node={rootNode}
                  depth={0}
                  isReadOnly={isPolicyReadOnly}
                  nodeCatalogsData={nodeCatalogs}
                  nodeCatalogOptions={nodeCatalogOptions}
                  comparisonOptions={comparisonOptions}
                  destinationOptions={destinationOptions}
                  comparisonOptionsData={comparisonOptionsData}
                  onUpdateNode={handleUpdateNode}
                  onAddBranch={handleAddBranch}
                  onUpdateBranch={handleUpdateBranch}
                  onUpdateTerminalOutcome={handleUpdateTerminalOutcome}
                  onUpdateCommercialRate={handleUpdateCommercialRate}
                  onAddCommercialRate={handleAddCommercialRate}
                  onRemoveCommercialRate={handleRemoveCommercialRate}
                  onDeleteBranch={handleDeleteBranch}
                  onMoveBranch={handleMoveBranch}
                />
              </section>
            </div>
          </div>
        </>
      )}

      <Dialog
        visible={isSimulationDialogVisible}
        onHide={() => setIsSimulationDialogVisible(false)}
        header="Simulate Policy"
        className="modalWrapper dfb-simulation-dialog"
        style={{ width: "min(980px, 94vw)" }}
        draggable={false}
        resizable={false}
      >
        <div className="dfb-simulation-dialog__body">
          <div className="dfb-simulation-dialog__intro">
            Choose the policy parameters you want to test, enter their values, and run the
            simulation on the latest saved version.
          </div>

          <div className="dfb-simulate-grid">
            {simulationRows.map((row) => {
              const selectedCatalog = nodeCatalogs.find(
                (catalog) => catalog.code === row.nodeCatalogCode,
              );
              const isBooleanSimulationValue = selectedCatalog?.dataType
                ?.toLowerCase()
                .includes("boolean") || false;
              const showEmiAmount = isAbbSimulationCode(row.nodeCatalogCode) && row.value.trim();
              const valueValidationMessage = getSimulationValueValidationMessage(
                row.value,
                selectedCatalog,
              );

              return (
                <div
                  className={`dfb-simulate-row ${showEmiAmount ? "dfb-simulate-row--with-emi" : ""}`}
                  key={row.clientId}
                >
                  <div className="dfb-field form-group">
                    <label className="dfb-field__label">Parameter</label>
                    <Dropdown
                      value={row.nodeCatalogCode}
                      options={getSimulationCatalogOptions(row.clientId)}
                      optionLabel="label"
                      optionValue="value"
                      onChange={(event: DropdownChangeEvent) =>
                        handleSimulationRowChange(
                          row.clientId,
                          "nodeCatalogCode",
                          String(event.value || ""),
                        )
                      }
                      className="dfb-field__control"
                      placeholder="Select parameter"
                    />
                  </div>

                  <div className="dfb-field">
                    <label className="dfb-field__label">Value</label>
                    {isBooleanSimulationValue ? (
                      <Dropdown
                        value={row.value}
                        options={BOOLEAN_OPTIONS}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select True or False"
                        onChange={(event: DropdownChangeEvent) =>
                          handleSimulationRowChange(
                            row.clientId,
                            "value",
                            String(event.value || ""),
                          )
                        }
                        className={`dfb-field__control ${valueValidationMessage ? "p-invalid" : ""}`}
                      />
                    ) : (
                      <InputText
                        value={row.value}
                        onChange={(event) =>
                          handleSimulationRowChange(row.clientId, "value", event.target.value)
                        }
                        className={`dfb-field__input ${valueValidationMessage ? "p-invalid" : ""}`}
                        placeholder="Enter input value"
                        inputMode={
                          NUMERIC_DATA_TYPE_PATTERN.test(
                            selectedCatalog?.dataType?.toLowerCase() || "",
                          )
                            ? "decimal"
                            : "text"
                        }
                      />
                    )}
                    {valueValidationMessage && (
                      <small className="error">{valueValidationMessage}</small>
                    )}
                  </div>

                  {showEmiAmount && (
                    <>
                      <div className="dfb-field">
                        <label className="dfb-field__label">EMI Amount</label>
                        <InputText
                          value={row.emiAmount}
                          onChange={(event) =>
                            handleSimulationRowChange(row.clientId, "emiAmount", event.target.value)
                          }
                          className="dfb-field__input"
                          placeholder="Enter EMI Amount"
                          inputMode="decimal"
                          maxLength={13}
                        />
                      </div>
                    </>
                  )}

                  <div className="dfb-simulate-row__actions">
                    <Button
                      type="button"
                      label="Remove"
                      className="dfb-btn dfb-btn--red dfb-btn--mini dfb-simulate-row__remove"
                      onClick={() => handleRemoveSimulationRow(row.clientId)}
                      disabled={simulationRows.length === 1}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dfb-simulation-dialog__toolbar">
            <Button
              type="button"
              label="Back"
              className="dfb-btn dfb-btn--ghost"
              onClick={() => setIsSimulationDialogVisible(false)}
            />

            <Button
              type="button"
              label="+ Add Parameter"
              className="dfb-btn dfb-btn--ghost"
              onClick={handleAddSimulationRow}
              disabled={nodeCatalogs.length > 0 && simulationRows.length >= nodeCatalogs.length}
            />

            <Button
              type="button"
              label="Run Simulation"
              className="dfb-btn dfb-btn--blue"
              onClick={handleSimulatePolicy}
              loading={isSimulatingPolicy}
            />
          </div>

          {simulationResult ? <SimulationResultPanel result={simulationResult} /> : null}

          {simulationResult && !isPublishedPolicy ? (
            <div className="dfb-simulation-dialog__footer">
              <Button
                type="button"
                label="Publish Policy"
                className="dfb-btn dfb-btn--ghost"
                onClick={handlePublishPolicy}
                loading={isPublishingPolicy}
              />
            </div>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
};

export default DecisionFlowBuilder;

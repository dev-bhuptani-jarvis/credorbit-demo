import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Loader from "../../components/Loader";
import TableTitle from "../../components/TableTitle";
import {
  clonePolicyAPI,
  createDraftPolicyAPI,
  getAllPoliciesAPI,
} from "../../utils/axios/apiServices";
import { formatDate, toastError, toastSuccess } from "../../utils/functions/shared";
import {
  ICreateDraftPolicyResponse,
  IGetAllPoliciesResponse,
  IPolicySummary,
} from "../../interface/breBulilder";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { Tooltip } from "primereact/tooltip";
import { DEFAULT_PRODUCT_TYPE_ID } from "../../components/ruleBuilder/DecisionFlowBuilder";
import { decryptVAPTData } from "../../utils/functions/encryptDecrypt";

const BreBuilderListing = () => {
  const [loading, setLoading] = useState(false);

  const [policies, setPolicies] = useState<IPolicySummary[]>([]);

  const [cloningPolicyVersionID, setCloningPolicyVersionID] = useState<number | null>(null);

  const navigate = useNavigate();

  const { id } = useParams();

  const handleCreateNewPolicy = async (): Promise<void> => {
    if (!id) {
      toastError("Institute ID is missing.");
      return;
    }

    setLoading(true);

    const response: ICreateDraftPolicyResponse = await createDraftPolicyAPI({
      instituteID: id,
      productTypeID: DEFAULT_PRODUCT_TYPE_ID,
    });

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200 && response.data?.policyVersionID) {
      navigate(
        RoutePathConstant.private.breBuilderDetail.replace(
          ":id",
          response.data.policyVersionID.toString(),
        ),
      );
      return;
    }

    toastError(response.message);
    setLoading(false);
  };

  const fetchPolicies = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);

    const params = {
      institutionID: id
    }

    const response: IGetAllPoliciesResponse = await getAllPoliciesAPI(params);

    if (!response) {
      setLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      const sortedPolicies = (response.data?.policies || []).sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return Number(b.isActive) - Number(a.isActive);
        }

        const aPublished = a.status?.toLowerCase() === "published";
        const bPublished = b.status?.toLowerCase() === "published";

        return Number(bPublished) - Number(aPublished);
      });

      setPolicies(sortedPolicies);
    } else {
      setPolicies([]);
      toastError(response.message);
    }

    setLoading(false);
  };

  const handleClonePolicy = async (policyVersionID: number): Promise<void> => {
    if (!policyVersionID) {
      toastError("Policy version ID is missing.");
      return;
    }

    setCloningPolicyVersionID(policyVersionID);

    try {
      const response = await clonePolicyAPI({ policyVersionID });

      const nextPolicyVersionID = response?.data?.policyVersionID || 0;

      if (!nextPolicyVersionID) {
        toastError(response?.message);
        return;
      }

      toastSuccess(response?.message);

      navigate(
        RoutePathConstant.private.breBuilderDetail.replace(
          ":id",
          nextPolicyVersionID.toString(),
        ),
      );
    } catch (error) {
      console.error("Failed to clone policy", error);
    } finally {
      setCloningPolicyVersionID(null);
    }
  };

  const actionBody = (rowData: IPolicySummary): JSX.Element => {
    const isViewOnly = rowData.status?.toLowerCase() === "published" || rowData.status?.toLowerCase() === "inactive";

    const actionTooltipId = `${isViewOnly ? "view" : "edit"}-policy-${rowData.policyVersionID}`;
    const cloneTooltipId = `clone-policy-${rowData.policyVersionID}`;

    const actionLabel = isViewOnly ? "View Policy" : "Edit Policy";

    const actionIconClass = isViewOnly ? "icon-eye" : "icon-edit";

    const targetPath = RoutePathConstant.private.breBuilderDetail.replace(
      ":id",
      rowData.policyVersionID.toString(),
    );

    return (
      <>
        <Tooltip target={`#${actionTooltipId}`} position="top" />
        <Tooltip target={`#${cloneTooltipId}`} position="top" />

        <Button
          className="trash-icon p-0 me-2"
          id={actionTooltipId}
          data-pr-tooltip={actionLabel}
          onClick={() =>
            navigate(isViewOnly ? `${targetPath}?mode=view` : targetPath)
          }
        >
          <i className={actionIconClass} />
        </Button>

        <Button
          className="trash-icon p-0"
          id={cloneTooltipId}
          data-pr-tooltip="Clone Policy"
          onClick={() => handleClonePolicy(rowData.policyVersionID)}
          loading={cloningPolicyVersionID === rowData.policyVersionID}
        >
          <i className="pi pi-copy" />
        </Button>
      </>
    );
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="row">
          <div className="col-12">
            <div className="titleLinkMain mb-4 d-flex justify-content-between align-items-center">
              <TableTitle title="BRE Builder" />

              <div className="d-flex gap-2">
                <Button className="btn btn-orange" onClick={() => handleCreateNewPolicy()}>
                  Create new policy
                </Button>

                <Button className="btn btn-black-line" onClick={() => navigate(RoutePathConstant.private.educationManagedInstitute)}>Back</Button>
              </div>
            </div>

            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={policies}
                emptyMessage="No Policies Found"
              >
                <Column
                  field="versionNo"
                  header="Version"
                  body={(rowData: IPolicySummary) => `V${rowData.versionNo}`}
                />

                <Column
                  field="instituteName"
                  header="Institute Name"
                  body={(rowData: IPolicySummary) =>
                    rowData.tradeName ? decryptVAPTData(rowData.tradeName) : rowData.instituteName
                  }
                />

                <Column
                  field="status"
                  header="Status"
                  body={(rowData: IPolicySummary) => rowData.status || "-"}
                />

                <Column
                  field="isActive"
                  header="Active"
                  body={(rowData: IPolicySummary) =>
                    rowData.isActive ? "Yes" : "No"
                  }
                />

                <Column
                  field="createdAt"
                  header="Created On"
                  body={(rowData: IPolicySummary) =>
                    rowData.createdAt
                      ? formatDate(rowData.createdAt, "DD MMM, YYYY")
                      : "-"
                  }
                />

                <Column
                  field="publishedAt"
                  header="Published On"
                  body={(rowData: IPolicySummary) =>
                    rowData.publishedAt
                      ? formatDate(rowData.publishedAt, "DD MMM, YYYY")
                      : "-"
                  }
                />

                <Column body={actionBody} header="Action" />
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BreBuilderListing;

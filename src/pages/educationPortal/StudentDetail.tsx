import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { TabPanel, TabView } from "primereact/tabview";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentApplicant,
} from "../../interface/educationManagement";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { formatCurrencyAmount, formatMobileNumber } from "../../utils/constants/constant";
import { formatDate } from "../../utils/functions/shared";
import { getEducationStudentById } from "../../utils/demo/demoEducationStudents";
import { getEducationLoanDrafts } from "../../utils/demo/demoEducationLoanFlow";

const StudentDetail = () => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const { id = "" } = useParams();

  const student = useMemo(() => getEducationStudentById(id), [id]);
  const primaryApplicant = student?.applicants?.[0];
  const coApplicants = student?.applicants?.slice(1) || [];

  const appliedLoanApplications = useMemo(
    () =>
      getEducationLoanDrafts().filter(
        (draft) => draft.studentId === id && draft.status === "submitted",
      ),
    [id],
  );

  const renderApplicantDetails = (
    applicant: IEducationStudentApplicant,
    title: string,
    relation?: string,
  ) => (
    <div className="borderBoxHldr p-24">
      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>{title} Name</b>
          <p className="text-break">{applicant.name || "-"}</p>
        </div>
        {relation && (
          <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
            <b>Relation</b>
            <p className="text-break">{relation}</p>
          </div>
        )}
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>PAN</b>
          <p className="text-break">{applicant.pan || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Date of Birth</b>
          <p className="text-break">
            {applicant.dateOfBirth
              ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Gender</b>
          <p className="text-break">{applicant.gender || "-"}</p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Mobile Number</b>
          <p className="text-break">
            {applicant.mobileNumber
              ? formatMobileNumber(applicant.mobileNumber)
              : "-"}
          </p>
        </div>
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Email Address</b>
          <p className="text-break">{applicant.email || "-"}</p>
        </div>
      </div>
    </div>
  );

  if (!student) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student Profile View" />
        <p className="mb-3">Student not found.</p>
        <Button
          className="btn btn-orange"
          onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}
        >
          Back to Students
        </Button>
      </div>
    );
  }

  const actionBody = (rowData: IEducationLoanDraft) => {
    return (
      <div className="d-flex gap-2">
        <Button
          className="trash-icon p-0"
          onClick={() =>
            navigate(
              RoutePathConstant.private.educationStudentDetail360View.replace(
                ":id",
                rowData.studentId,
              ),
              {
                state: {
                  selectedDraftId: rowData.id,
                  appliedLoanDraft: rowData,
                },
              },
            )
          }
        >
          <img src="/assets/images/eye.svg" alt="view-student" />
        </Button>
      </div>
    );
  };

  return (
    <div className="whiteBoxHldr p-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <TableTitle title={student.studentName} />
        <Button
          className="btn btn-black-line"
          onClick={() => navigate(RoutePathConstant.private.educationManageStudents)}
        >
          Back
        </Button>
      </div>

      <div className="row">
        <div className="col-12">
          <TabView
            className="custom-tabview"
            activeIndex={activeTabIndex}
            onTabChange={(event) => setActiveTabIndex(event.index)}
          >
            <TabPanel header="Personal Details">
              <div className="borderBoxHldr p-24 mt-3">
                <div className="row">
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Student Information</b>
                    <p className="text-break">{student.studentName}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Student Code</b>
                    <p className="text-break">{student.studentCode}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Date of Birth</b>
                    <p className="text-break">
                      {student.studentDateOfBirth
                        ? formatDate(student.studentDateOfBirth, "DD MMM, YYYY")
                        : "-"}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Gender</b>
                    <p className="text-break">{student.studentGender || "-"}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Mobile Number</b>
                    <p className="text-break">{formatMobileNumber(student.mobileNumber)}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Email Address</b>
                    <p className="text-break">{student.email}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Credit Score</b>
                    <p className="text-break">{student.creditInformation.creditScore}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Last Time Credit Score Fetch Date</b>
                    <p className="text-break">
                      {student.creditInformation.lastDateCreditScore}
                    </p>
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Applicants Details">
              <div className="mt-3">
                {primaryApplicant ? (
                  renderApplicantDetails(primaryApplicant, "Applicant")
                ) : (
                  <div className="borderBoxHldr p-24">
                    <p className="mb-0">No applicant details available.</p>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Co-Applicants Details">
              <div className="mt-3">
                {coApplicants.length > 0 ? (
                  coApplicants.map((applicant, index) => (
                    <div
                      key={applicant.id || `co-applicant-${index + 1}`}
                      className={index > 0 ? "mt-3" : ""}
                    >
                      {renderApplicantDetails(
                        applicant,
                        `Co-applicant ${index + 1}`,
                        student.coApplicantRelation || `Co-applicant ${index + 1}`,
                      )}
                    </div>
                  ))
                ) : (
                  <div className="borderBoxHldr p-24">
                    <p className="mb-0">No co-applicant details available.</p>
                  </div>
                )}
              </div>
            </TabPanel>
          </TabView>
        </div>

        <div className="col-12 mt-4">
          <h5 className="mb-3">Applied Loan Applications</h5>
          <div className="borderBoxHldr p-24">
            <div className="table-responsive">
              <DataTable
                className="tableMain"
                value={appliedLoanApplications}
                emptyMessage="No applied loan applications found for this student."
              >
                <Column field="id" header="Loan Application Id" />
                <Column field="courseName" header="Course Name" />
                <Column
                  header="Loan Amount"
                  body={(rowData: IEducationLoanDraft) =>
                    formatCurrencyAmount(rowData.loanAmount)
                  }
                />
                <Column field="loanApplicationStatus" header="Application Status" />
                <Column
                  header="Last Activity Date"
                  body={(rowData: IEducationLoanDraft) =>
                    formatDate(rowData.updatedAt, "DD MMM, YYYY")
                  }
                />
                <Column
                  header="Action"
                  body={actionBody}
                />
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

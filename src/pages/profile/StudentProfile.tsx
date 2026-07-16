import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import TableTitle from "../../components/TableTitle";
import {
  IEducationLoanDraft,
  IEducationStudentApplicant,
} from "../../interface/educationManagement";
import { RootState } from "../../store";
import { formatMobileNumber } from "../../utils/constants/constant";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import { getEducationLoanDrafts } from "../../utils/demo/demoEducationLoanFlow";
import {
  getEducationStudentById,
  getEducationStudents,
} from "../../utils/demo/demoEducationStudents";
import { formatDate } from "../../utils/functions/shared";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";

const DEFAULT_STUDENT_USER_ID = "student-role-001";

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { userID, roleName } = useSelector((state: RootState) => state.user.user);
  const impersonatedStudentId = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
  );

  const studentContext = useMemo(() => {
    const directStudentId = impersonatedStudentId || userID;

    if (directStudentId) {
      const matchedStudent = getEducationStudentById(directStudentId);
      if (matchedStudent) {
        return {
          student: matchedStudent,
          studentUserId: impersonatedStudentId ? directStudentId : userID || DEFAULT_STUDENT_USER_ID,
        };
      }
    }

    const draftCandidates = getEducationLoanDrafts().filter(
      (draft) => draft.studentUserId === (userID || DEFAULT_STUDENT_USER_ID),
    );

    if (draftCandidates.length > 0) {
      const matchedStudent = getEducationStudentById(draftCandidates[0].studentId);

      if (matchedStudent) {
        return {
          student: matchedStudent,
          studentUserId: draftCandidates[0].studentUserId,
        };
      }
    }

    const fallbackStudent = getEducationStudents()[0];

    return {
      student: fallbackStudent,
      studentUserId: userID || DEFAULT_STUDENT_USER_ID,
    };
  }, [impersonatedStudentId, userID]);

  const student = studentContext.student;
  const studentUserId = studentContext.studentUserId;

  const studentApplications = useMemo(() => {
    const matchedByStudentId = getEducationLoanDrafts().filter(
      (draft) => draft.studentId === student?.id,
    );

    const matchedDrafts =
      matchedByStudentId.length > 0
        ? matchedByStudentId
        : getEducationLoanDrafts().filter(
            (draft) => draft.studentUserId === studentUserId,
          );

    return matchedDrafts.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }, [student?.id, studentUserId]);

  const primaryApplicant = student?.applicants?.[0];
  const coApplicants = student?.applicants?.slice(1) || [];

  const renderField = (label: string, value: string) => (
    <div className="education-student-profile-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );

  const renderApplicantCard = (
    applicant: IEducationStudentApplicant,
    title: string,
    relation?: string,
  ) => (
    <div className="education-student-profile-person-card">
      <div className="education-student-profile-person-card__head">
        <div className="education-student-profile-person-card__avatar">
          {applicant.photo ? (
            <img src={applicant.photo} alt={applicant.name || title} />
          ) : (
            <span>{getInitials(applicant.name || title)}</span>
          )}
        </div>
        <div>
          <h4>{applicant.name || title}</h4>
          <p>{relation || title}</p>
        </div>
      </div>

      <div className="education-student-profile-field-grid">
        {renderField("Name", applicant.name || "-")}
        {renderField("PAN", applicant.pan || "-")}
        {renderField(
          "DOB",
          applicant.dateOfBirth
            ? formatDate(applicant.dateOfBirth, "DD MMM, YYYY")
            : "-",
        )}
        {renderField("Mobile", applicant.mobileNumber ? formatMobileNumber(applicant.mobileNumber) : "-")}
        {renderField("Email", applicant.email || "-")}
        {renderField("Gender", applicant.gender || "-")}
        {renderField("Photo", applicant.photo ? "Uploaded" : "Not Uploaded")}
        {renderField("Address", applicant.address || "-")}
      </div>
    </div>
  );

  const studentFields = student
    ? [
        { label: "Name", value: student.studentName },
        { label: "PAN", value: student.studentPan || "-" },
        {
          label: "DOB",
          value: student.studentDateOfBirth
            ? formatDate(student.studentDateOfBirth, "DD MMM, YYYY")
            : "-",
        },
        { label: "Mobile", value: formatMobileNumber(student.mobileNumber) },
        { label: "Email", value: student.email },
        { label: "Gender", value: student.studentGender || "-" },
        { label: "Photo", value: student.studentPhoto ? "Uploaded" : "Not Uploaded" },
        { label: "Address", value: student.address || "-" },
      ]
    : [];

  const profileSummaryFields = student
    ? [
        { label: "Student Code", value: student.studentCode },
        { label: "Course", value: student.courseName },
        { label: "Registered On", value: formatDate(student.createdAt, "DD MMM, YYYY") },
        { label: "Parent PAN", value: student.parentPan || "-" },
        { label: "Primary Applicant", value: primaryApplicant?.name || "-" },
        { label: "Primary Co-applicant", value: student.coApplicantName || "-" },
        {
          label: "Co-applicant Mobile",
          value: student.coApplicantMobileNumber
            ? formatMobileNumber(student.coApplicantMobileNumber)
            : "-",
        },
        { label: "Co-applicant Relation", value: student.coApplicantRelation || "-" },
      ]
    : [];

  if (!student) {
    return (
      <div className="whiteBoxHldr p-24">
        <TableTitle title="Student Profile" />
        <p className="mb-3">Student profile not found for this login.</p>
      </div>
    );
  }

  return (
    <div className="education-student-profile-page">
      <div className="education-student-profile-page__header">
        <TableTitle title="Student Profile" />
        <div className="d-flex gap-2 flex-wrap">
          <Button
            className="btn btn-black-line"
            onClick={() =>
              navigate(
                RoutePathConstant.private.educationEditStudent.replace(
                  ":id",
                  student.id,
                ),
                {
                  state: {
                    returnTo: RoutePathConstant.private.profile,
                    preselectedStudentId: student.id,
                  },
                },
              )
            }
          >
            Edit Profile
          </Button>
          <Button
            className="btn btn-orange"
            onClick={() => navigate(RoutePathConstant.private.studentOngoingApplications)}
          >
            Ongoing Applications
          </Button>
        </div>
      </div>

      <section className="education-student-profile-hero">
        <div className="education-student-profile-hero__identity">
          <div className="education-student-profile-hero__avatar">
            {student.studentPhoto ? (
              <img src={student.studentPhoto} alt={student.studentName} />
            ) : (
              <span>{getInitials(student.studentName)}</span>
            )}
          </div>

          <div className="education-student-profile-hero__copy">
            <div className="education-student-profile-hero__eyebrow">
              {roleName === "Student" ? "Student Role Profile" : "Student Profile"}
            </div>
            <h2>{student.studentName}</h2>
            <p>
              {student.studentCode} · {student.courseName}
            </p>
            <div className="education-student-profile-chip-row">
              <span className="education-student-profile-chip">
                {student.studentGender || "Gender Pending"}
              </span>
              <span className="education-student-profile-chip">
                Registered {formatDate(student.createdAt, "DD MMM, YYYY")}
              </span>
            </div>
          </div>
        </div>

        <div className="education-student-profile-hero__stats">
          <div className="education-student-profile-stat-card">
            <span>Credit Score</span>
            <strong>{student.creditInformation.creditScore || 0}</strong>
          </div>
          <div className="education-student-profile-stat-card">
            <span>Applications</span>
            <strong>{studentApplications.length}</strong>
          </div>
          <div className="education-student-profile-stat-card">
            <span>Active Loans</span>
            <strong>{student.loanDetails.activeLoans}</strong>
          </div>
        </div>
      </section>

      <div className="education-student-profile-main">
          <section className="education-student-profile-card">
            <div className="education-student-profile-card__head">
              <div>
                <h3>Student Details</h3>
                <p>
                  Personal information saved while the educational institute added
                  this student.
                </p>
              </div>
            </div>
            <div className="education-student-profile-tab-panel">
              <div className="education-student-profile-tab-grid">
                <div className="education-student-profile-tab-spotlight">
                  <div className="education-student-profile-tab-spotlight__avatar">
                    {student.studentPhoto ? (
                      <img src={student.studentPhoto} alt={student.studentName} />
                    ) : (
                      <span>{getInitials(student.studentName)}</span>
                    )}
                  </div>
                  <div>
                    <h4>{student.studentName}</h4>
                    <p>{student.address || "Address not available"}</p>
                  </div>
                </div>

                <div className="education-student-profile-tab-sections">
                  <div>
                    <h5>Personal Information</h5>
                    <div className="education-student-profile-field-grid">
                      {studentFields.map((field) => (
                        <div key={field.label}>{renderField(field.label, field.value)}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5>Profile Summary</h5>
                    <div className="education-student-profile-field-grid">
                      {profileSummaryFields.map((field) => (
                        <div key={field.label}>{renderField(field.label, field.value)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="education-student-profile-card">
            <div className="education-student-profile-card__head">
              <div>
                <h3>Applicant Details</h3>
                <p>Applicant information saved with the student profile.</p>
              </div>
            </div>
            {primaryApplicant ? (
              renderApplicantCard(primaryApplicant, "Applicant")
            ) : (
              <div className="education-student-profile-empty-state">
                No applicant details available.
              </div>
            )}
          </section>

          <section className="education-student-profile-card">
            <div className="education-student-profile-card__head">
              <div>
                <h3>Co-applicant Details</h3>
                <p>Co-applicant details saved by the educational institute.</p>
              </div>
            </div>
            <div className="education-student-profile-stack">
              {coApplicants.length > 0 ? (
                coApplicants.map((applicant, index) => (
                  <div key={applicant.id || `co-applicant-${index + 1}`}>
                    {renderApplicantCard(
                      applicant,
                      `Co-applicant ${index + 1}`,
                      student.coApplicantRelation || `Co-applicant ${index + 1}`,
                    )}
                  </div>
                ))
              ) : (
                <div className="education-student-profile-empty-state">
                  No co-applicant details available.
                </div>
              )}
            </div>
          </section>
      </div>
    </div>
  );
};

export default StudentProfile;

import { useEffect, useState } from 'react';
import Loader from '../../../components/Loader';
import { Button } from 'primereact/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { CLIENT_ROLE } from '../../../utils/constants/constant';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { RoutePathConstant } from '../../../utils/constants/routePaths';
import CourseSelection, { ICourseSelectionInitialValues, ICourseSelectionPayload } from './CourseSelection';
import ConsentSteps from './ConsentSteps';
import StudentSelection from './StudentSelection';
import { addLoanApplicationForEducationalInstituteAPI, getStudentLoanDetailAPI } from '../../../utils/axios/apiServices';
import { LoanStatusType, StorageKeyEnum } from '../../../utils/constants/enum';
import { toastError, toastSuccess } from '../../../utils/functions/shared';
import { removeSessionStorageKey } from '../../../utils/functions/sessionStorage';
import { IStudent } from '../../../interface/student';
import usePermission from '../../../hooks/usePermission';

type EducationLoanApplicationNavigationState = {
  selectedStudent?: IStudent | null;
  activeIndex?: number;
  returnTo?: string;
  loanApplicationId?: string;
  studentID?: string;
  isEditingLoan?: boolean;
  verificationStatus?: string;
};

const EDITABLE_LOAN_STATUS_IDS = new Set([LoanStatusType.PENDING, LoanStatusType.QUERY_RAISED]);

const EducationLoanApplication = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const [isCourseSelectionValid, setIsCourseSelectionValid] = useState<boolean>(false);

  const [isCourseValidationRequested, setIsCourseValidationRequested] = useState<boolean>(false);

  const [isConsentReviewValid, setIsConsentReviewValid] = useState<boolean>(false);

  const [courseSelectionPayload, setCourseSelectionPayload] = useState<ICourseSelectionPayload | null>(null);

  const [reviewCompleteAction, setReviewCompleteAction] = useState<(() => Promise<void>) | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  const [loanApplicationId, setLoanApplicationId] = useState<string>('');

  const [studentID, setStudentID] = useState<string>('');

  const [isEditingLoan, setIsEditingLoan] = useState<boolean>(false);

  const [initialCourseValues, setInitialCourseValues] = useState<ICourseSelectionInitialValues | null>(null);

  const navigate = useNavigate();

  const location = useLocation();

  const { userType } = useSelector((state: RootState) => state.user.user);

  const { create: canCreateStudent } = usePermission("ManageStudents", ["create"])();

  const isAdminViewOnly = userType === CLIENT_ROLE.SUPER_ADMIN;

  useEffect(() => {
    const navigationState = location.state as EducationLoanApplicationNavigationState | null;

    // No route state means user started a new application from any screen.
    if (!navigationState) {
      removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_EDUCATION_LOAN_APPLICATION_CONTEXT);
      setActiveIndex(0);
      setSelectedStudent(null);
      setStudentID('');
      setLoanApplicationId('');
      setCourseSelectionPayload(null);
      setIsCourseSelectionValid(false);
      setIsCourseValidationRequested(false);
      setIsConsentReviewValid(false);
      setReviewCompleteAction(null);
      return;
    }

    setSelectedStudent(navigationState.selectedStudent || null);
    setStudentID(navigationState.studentID || navigationState.selectedStudent?.id || '');
    setActiveIndex(navigationState.activeIndex ?? 0);
    setLoanApplicationId(navigationState.loanApplicationId || '');
    setIsEditingLoan(!!navigationState.isEditingLoan);
    if (!navigationState.isEditingLoan) {
      setInitialCourseValues(null);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchEditableLoan = async (): Promise<void> => {
      if (!isEditingLoan || !loanApplicationId) return;

      setLoading(true);
      const response = await getStudentLoanDetailAPI({ loanApplicationID: loanApplicationId });
      setLoading(false);

      if (!(response?.statusCode === 200 && response.data)) {
        toastError(response?.message || 'Loan application details could not be loaded.');
        return;
      }

      if (!EDITABLE_LOAN_STATUS_IDS.has(Number(response.data.loanDetail?.currentStatusId))) {
        toastError('This loan application can no longer be edited.');
        navigate(`${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`, {
          state: { selectedDraftId: loanApplicationId, loanApplicationId, studentID, selectedStudent },
          replace: true,
        });
        return;
      }

      const courseDetail = response.data.courseDetail;
      const payment = response.data.loanPaymentDetails;
      if (!courseDetail || !payment) {
        toastError('Course and loan details could not be loaded.');
        return;
      }

      setInitialCourseValues({
        courseID: courseDetail.courseId,
        courseName: courseDetail.courseName,
        courseFees: courseDetail.courseAgreedFee,
        courseTenure: courseDetail.tenure,
        noOfEMIs: payment.totalEMI,
        noOfAdvanceEMI: payment.advanceEMI,
        discountAmount: payment.discountAmount,
        downpaymentAmount: payment.downPayment,
      });
    };

    void fetchEditableLoan();
  }, [isEditingLoan, loanApplicationId]);

  const handlePrimaryAction = async (): Promise<void> => {
    if (activeIndex === 0) {
      if (!selectedStudent) {
        toastError("Please select a student to continue.");
        return;
      }

      const nextState: EducationLoanApplicationNavigationState = {
        ...((location.state || {}) as EducationLoanApplicationNavigationState),
        selectedStudent,
        studentID: selectedStudent.id,
        activeIndex: 1,
      };

      setActiveIndex(1);
      navigate(RoutePathConstant.private.educationStudentLoanApplication, {
        state: nextState,
        replace: true,
      });
      return;
    }

    if (activeIndex === 1) {
      if (!isCourseSelectionValid || !courseSelectionPayload) {
        setIsCourseValidationRequested(true);
        return;
      }

      setLoading(true);

      const response = await addLoanApplicationForEducationalInstituteAPI({
        ...courseSelectionPayload,
        ...(isEditingLoan ? { loanApplicationID: loanApplicationId } : {}),
      });

      if (response && response.statusCode === 200) {
        toastSuccess(response.message);
        const nextLoanApplicationId = response.data?.loanAppID || loanApplicationId;
        setLoanApplicationId(nextLoanApplicationId);
        setActiveIndex(2);
        navigate(RoutePathConstant.private.educationStudentLoanApplication, {
          state: {
            ...((location.state || {}) as EducationLoanApplicationNavigationState),
            selectedStudent,
            studentID: selectedStudent?.id || studentID,
            activeIndex: 2,
            loanApplicationId: nextLoanApplicationId,
          },
          replace: true,
        });
      } else {
        toastError(response?.message);
      }

      setLoading(false);
      return;
    }

    if (activeIndex === 2) {
      if (!reviewCompleteAction) {
        toastError("Please complete all consent checks first.");
        return;
      }

      await reviewCompleteAction();
    }
  };

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 className="txt-30 fw-bold mb-2">Education Loan Application</h2>
          </div>

          {activeIndex === 0 && canCreateStudent && (userType === CLIENT_ROLE.EDUCATIONAL_INSTITUTE || userType === CLIENT_ROLE.STUDENT) && (
            <Button
              type="button"
              className="btn btn-orange"
              icon="bi bi-plus-circle me-2"
              label="Add Student"
              onClick={() =>
                navigate(RoutePathConstant.private.educationManageStudents, {
                  state: {
                    openStudentMobileDialog: true,
                  },
                })
              }
            />
          )}
        </div>

        {activeIndex === 0 && (
          <StudentSelection
            selectedStudent={selectedStudent}
            onSelectionChange={setSelectedStudent}
          />
        )}

        {activeIndex === 1 && (
          <CourseSelection
            selectedStudent={selectedStudent}
            onValidationChange={(isValid) => {
              setIsCourseSelectionValid(isValid);
              if (isValid) setIsCourseValidationRequested(false);
            }}
            onSelectionChange={setCourseSelectionPayload}
            initialValues={initialCourseValues}
            isCourseLocked={isEditingLoan}
            showValidationErrors={isCourseValidationRequested}
          />
        )}

        {activeIndex === 2 && (
          <ConsentSteps
            loanApplicationId={loanApplicationId}
            studentID={selectedStudent?.id || studentID}
            onReviewValidationChange={setIsConsentReviewValid}
            onReviewCompleteActionChange={(action) =>
              setReviewCompleteAction(() => action)
            }
          />
        )}

        <div className="d-flex justify-content-between align-items-center mt-5 flex-wrap gap-3">
          <Button
            className="btn btn-black-line"
            label={activeIndex === 0 ? "Back to Dashboard" : "Back"}
            onClick={() => {
              const navigationState = (location.state || {}) as EducationLoanApplicationNavigationState;

              if (activeIndex === 1 && navigationState.returnTo) {
                navigate(navigationState.returnTo);
                return;
              }

              if (activeIndex === 1 && isEditingLoan) {
                if (navigationState.returnTo) {
                  navigate(navigationState.returnTo);
                  return;
                }

                if (navigationState.verificationStatus !== "Verified") {
                  setActiveIndex(2);
                  navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                    state: {
                      ...navigationState,
                      selectedStudent,
                      activeIndex: 2,
                      isEditingLoan: true,
                      loanApplicationId,
                      studentID: selectedStudent?.id || studentID,
                    },
                    replace: true,
                  });
                  return;
                }

                navigate(`${RoutePathConstant.private.educationStudentDetail360View}/${studentID}`, {
                  state: { selectedDraftId: loanApplicationId, loanApplicationId, studentID, selectedStudent },
                });
                return;
              }

              if (activeIndex === 2) {
                setActiveIndex(1);
                setIsEditingLoan(true);
                navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                  state: {
                    ...navigationState,
                    selectedStudent,
                    activeIndex: 1,
                    isEditingLoan: true,
                    loanApplicationId,
                    studentID: selectedStudent?.id || studentID,
                  },
                  replace: true,
                });
                return;
              }

              if (activeIndex === 1 && userType === CLIENT_ROLE.STUDENT) {
                navigate(
                  navigationState.returnTo
                  || RoutePathConstant.private.educationLoanApplications,
                );
                return;
              }

              if (activeIndex === 0) {
                navigate(RoutePathConstant.private.institueDashboard);
                return;
              }

              setActiveIndex((previous) => {
                const nextActiveIndex = Math.max(previous - 1, 0);

                navigate(RoutePathConstant.private.educationStudentLoanApplication, {
                  state: {
                    ...navigationState,
                    selectedStudent,
                    activeIndex: nextActiveIndex,
                    loanApplicationId,
                    studentID: selectedStudent?.id || studentID,
                  },
                  replace: true,
                });

                return nextActiveIndex;
              });
            }}
          />

          {!isAdminViewOnly ? (
            <Button
              className="btn btn-orange"
              label={activeIndex === 2 ? "Review Complete" : isEditingLoan ? "Update" : "Continue"}
              onClick={handlePrimaryAction}
              disabled={activeIndex === 2 && !isConsentReviewValid}
            />
          ) : null}
        </div>
      </div>
    </>
  )
}

export default EducationLoanApplication

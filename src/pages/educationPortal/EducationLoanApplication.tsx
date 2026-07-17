import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputOtp } from "primereact/inputotp";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import { TabPanel, TabView } from "primereact/tabview";
import Loader from "../../components/Loader";
import CameraCaptureDialog from "../../components/CameraCaptureDialog";
import PrimePaginator from "../../components/PrimePaginator";
import { RootState } from "../../store";
import { setCustomerInfo } from "../../store/reducer/customerSlice";
import {
  IEducationCourse,
  IEducationStudent,
  IEducationStudentApplicant,
  IEducationStudentFormData,
} from "../../interface/educationManagement";
import { PaginateReqEntity } from "../../interface/pagination";
import {
  CLIENT_ROLE,
  formatCurrencyAmount,
  formatMobileNumber,
} from "../../utils/constants/constant";
import { OTPType, StorageKeyEnum } from "../../utils/constants/enum";
import { environment } from "../../utils/constants/environments";
import { RoutePathConstant } from "../../utils/constants/routePaths";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_NUMBER_PATTERN,
  PAN_NUMBER_PATTERN,
} from "../../utils/constants/pattern";
import {
  buildEducationCustomerInfo,
  calculateEducationLoanSummary,
  getEducationLoanDraftById,
  getPendingEducationLoanApplicationsByStudent,
  getRecommendedEmiOptions,
  setEducationLoanResumeStep,
} from "../../utils/demo/demoEducationLoanFlow";
import {
  createEducationLoanDraftAPI,
  createEducationStudentAPI,
  getEducationCoursesAPI,
  getEducationStudentsAPI,
} from "../../utils/axios/apiServices";
import {
  formatDate,
  formatTime,
  toastError,
  toastSuccess,
} from "../../utils/functions/shared";
import {
  getDecryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { defaultStudentForm } from "./studentFormUtils";

const parseAmount = (value: string): number =>
  Number(value.replace(/,/g, "").trim() || 0);

const consentChecklist = [
  "I confirm the student has agreed to proceed with the course financing request.",
  "I authorize bureau, banking, and underwriting checks for this application.",
  "I confirm the KFS and repayment obligations will be reviewed before submission.",
];

const cardStyle = {
  border: "1px solid #f1d4c8",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(255, 99, 44, 0.08), rgba(255, 247, 242, 0.95))",
  padding: "14px",
  width: "100%",
  height: "100%",
};

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const EDUCATION_OTP_VERIFICATION_KEY = "credorbit.educationOtpVerification";

type VerificationEntityType = "student" | "applicant" | "coApplicant";

interface IVerificationQueueItem {
  id: string;
  type: VerificationEntityType;
  name: string;
  mobileNumber: string;
}

interface IVerificationStatus {
  verifiedAt: string;
  mobileNumber: string;
}

const canUseLocalStorage = (): boolean =>
  typeof window !== "undefined" && !!window.localStorage;

const getVerificationStorageMap = (): Record<string, IVerificationStatus> => {
  if (!canUseLocalStorage()) return {};

  const storedValue = window.localStorage.getItem(EDUCATION_OTP_VERIFICATION_KEY);

  if (!storedValue) return {};

  try {
    return JSON.parse(storedValue) as Record<string, IVerificationStatus>;
  } catch {
    return {};
  }
};

const setVerificationStorageMap = (
  value: Record<string, IVerificationStatus>,
): void => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(EDUCATION_OTP_VERIFICATION_KEY, JSON.stringify(value));
};

const buildVerificationStorageKey = (
  studentId: string,
  entityType: VerificationEntityType,
  entityId: string,
): string => `${studentId}:${entityType}:${entityId}`;

const createEmptyApplicant = (): IEducationStudentApplicant => ({
  id: `applicant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  pan: "",
  panDocument: null,
  aadhaarDocument: null,
  dateOfBirth: "",
  gender: "",
  mobileNumber: "",
  email: "",
  photo: null,
});

const toInputDate = (value: string): Date | null => (value ? new Date(value) : null);

const toIsoDate = (value: Date | null): string =>
  value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";

const getInitials = (value: string): string =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "ST";

const convertFileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });

const EducationLoanApplication = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const resumeDraftId = state?.resumeDraftId as string | undefined;

  const [loading, setLoading] = useState<boolean>(false);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [reviewTabIndex, setReviewTabIndex] = useState<number>(0);
  const [verificationStatusMap, setVerificationStatusMap] = useState<
    Record<string, IVerificationStatus>
  >(() => getVerificationStorageMap());
  const [showVerificationDialog, setShowVerificationDialog] =
    useState<boolean>(false);
  const [verificationQueue, setVerificationQueue] = useState<
    IVerificationQueueItem[]
  >([]);
  const [verificationStepIndex, setVerificationStepIndex] = useState<number>(0);
  const [verificationMobileNumber, setVerificationMobileNumber] =
    useState<string>("");
  const [verificationOtp, setVerificationOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [demoOtpCode, setDemoOtpCode] = useState<string>("");
  const [showReapplyDialog, setShowReapplyDialog] = useState<boolean>(false);

  const [students, setStudents] = useState<IEducationStudent[]>([]);

  const [courses, setCourses] = useState<IEducationCourse[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<IEducationStudent | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [selectedCourseTenure, setSelectedCourseTenure] = useState<string>("");

  const [courseFees, setCourseFees] = useState<string>("");

  const [emiOptionMonths, setEmiOptionMonths] = useState<number>(0);

  const [advancedEmiMonths, setAdvancedEmiMonths] = useState<number | null>(null);

  const [downpayment, setDownpayment] = useState<string>("");

  const [discountPercentage, setDiscountPercentage] = useState<string>("");

  const [discountAmount, setDiscountAmount] = useState<string>("");

  const [consentState, setConsentState] = useState<boolean[]>(
    consentChecklist.map(() => true),
  );

  const [consentError, setConsentError] = useState<string>("");

  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

  const [showStudentDialog, setShowStudentDialog] = useState<boolean>(false);

  const [studentForm, setStudentForm] =
    useState<IEducationStudentFormData>(defaultStudentForm);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showStudentCamera, setShowStudentCamera] = useState<boolean>(false);

  const [applicantCameraIndex, setApplicantCameraIndex] = useState<number | null>(null);

  const [filterReq, setFilterReq] = useState<PaginateReqEntity>({
    pageNumber: 0,
    pageSize: 8,
    searchText: "",
  });

  const currentUser = useSelector((state: RootState) => state.user.user);
  const isStudentUser =
    currentUser.userID === "student-role-001" ||
    currentUser.roleName === "Student";

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const filteredStudents = useMemo(() => {
    const searchValue = (filterReq.searchText || "").trim().toLowerCase();

    return students.filter((student) => {
      if (!student.isActive) return false;
      if (!searchValue) return true;

      return (
        student.studentName.toLowerCase().includes(searchValue) ||
        student.studentCode.toLowerCase().includes(searchValue) ||
        student.courseName.toLowerCase().includes(searchValue) ||
        student.mobileNumber.includes(searchValue)
      );
    });
  }, [filterReq.searchText, students]);

  const paginatedStudents = useMemo(() => {
    const startIndex = filterReq.pageNumber * filterReq.pageSize;
    return filteredStudents.slice(startIndex, startIndex + filterReq.pageSize);
  }, [filterReq.pageNumber, filterReq.pageSize, filteredStudents]);

  const emiOptions = useMemo(
    () =>
      selectedCourseTenure
        ? getRecommendedEmiOptions(selectedCourseTenure).map((value) => ({
          label: `${value} Months`,
          value,
        }))
        : [],
    [selectedCourseTenure],
  );

  const advancedEmiOptions = useMemo(
    () =>
      Array.from(
        { length: Math.max(emiOptionMonths, 0) },
        (_, index) => ({
          label: `${index} Month${index !== 1 ? "s" : ""}`,
          value: index,
        }),
      ),
    [emiOptionMonths],
  );

  const summary = useMemo(
    () =>
      calculateEducationLoanSummary({
        courseFees: parseAmount(courseFees),
        emiOptionMonths,
        advancedEmiMonths,
        downpayment: parseAmount(downpayment),
        discountValue: parseAmount(discountAmount),
      }),
    [
      courseFees,
      emiOptionMonths,
      advancedEmiMonths,
      downpayment,
      discountAmount,
    ],
  );

  const verificationQueueItems = useMemo<IVerificationQueueItem[]>(() => {
    if (!selectedStudent) return [];

    const primaryApplicant = selectedStudent.applicants?.[0];
    const coApplicants = selectedStudent.applicants?.slice(1) || [];

    return [
      {
        id: selectedStudent.id,
        type: "student",
        name: selectedStudent.studentName,
        mobileNumber: selectedStudent.mobileNumber,
      },
      ...(primaryApplicant
        ? [
          {
            id: primaryApplicant.id,
            type: "applicant" as const,
            name: primaryApplicant.name,
            mobileNumber: primaryApplicant.mobileNumber,
          },
        ]
        : []),
      ...coApplicants.map((applicant) => ({
        id: applicant.id,
        type: "coApplicant" as const,
        name: applicant.name,
        mobileNumber: applicant.mobileNumber,
      })),
    ];
  }, [selectedStudent]);

  const getVerificationKey = (item: IVerificationQueueItem): string =>
    selectedStudent
      ? buildVerificationStorageKey(selectedStudent.id, item.type, item.id)
      : "";

  const isQueueItemVerified = (item: IVerificationQueueItem): boolean => {
    const key = getVerificationKey(item);
    return Boolean(key && verificationStatusMap[key]);
  };

  const pendingVerificationQueue = useMemo(() => {
    if (!selectedStudent) return [];

    return verificationQueueItems.filter((item) => {
      const verificationKey = buildVerificationStorageKey(
        selectedStudent.id,
        item.type,
        item.id,
      );

      return !verificationStatusMap[verificationKey];
    });
  }, [selectedStudent, verificationQueueItems, verificationStatusMap]);

  const currentVerificationItem = verificationQueue[verificationStepIndex] || null;

  const renderReviewApplicantDetails = (
    applicant: IEducationStudentApplicant,
    title: string,
    relation?: string,
    isVerified: boolean = false,
  ) => (
    <div className="borderBoxHldr p-24">
      <div className="row">
        <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
          <b>Verification Status</b>
          <p className="text-break mb-0">
            <span
              className={`education-verification-badge ${
                isVerified ? "is-verified" : "is-pending"
              }`}
            >
              {isVerified ? "Verified" : "Pending Verification"}
            </span>
          </p>
        </div>
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

  const getCourseFee = () => parseAmount(courseFees);

  const updateDiscountPercentage = (value: string) => {
    const percentage = Number(value.replace(/,/g, "") || 0);
    const fee = getCourseFee();

    const finalPercentage = Math.min(Math.max(percentage, 0), 100);

    const amount = (fee * finalPercentage) / 100;

    setDiscountPercentage(
      finalPercentage ? finalPercentage.toString() : ""
    );
    setDiscountAmount(
      amount ? formatNumber(Math.round(amount)) : ""
    );
  };

  const updateDiscountAmount = (value: string) => {
    const fee = getCourseFee();

    let amount = parseAmount(value);

    amount = Math.min(Math.max(amount, 0), fee);

    const percentage = fee ? (amount / fee) * 100 : 0;

    setDiscountAmount(
      amount ? formatNumber(amount) : ""
    );

    setDiscountPercentage(
      percentage ? percentage.toFixed(2).replace(/\.00$/, "") : ""
    );
  };

  const resetVerificationStepState = (mobileNumber: string): void => {
    setVerificationMobileNumber(mobileNumber);
    setVerificationOtp("");
    setIsOtpSent(false);
    setOtpTimer(0);
    setDemoOtpCode("");
  };

  const openVerificationFlow = (): void => {
    if (pendingVerificationQueue.length === 0) return;

    setVerificationQueue(pendingVerificationQueue);
    setVerificationStepIndex(0);
    resetVerificationStepState(pendingVerificationQueue[0].mobileNumber);
    setShowVerificationDialog(true);
  };

  const closeVerificationFlow = (): void => {
    setShowVerificationDialog(false);
    setVerificationQueue([]);
    setVerificationStepIndex(0);
    resetVerificationStepState("");
  };

  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        label: course.courseName,
        value: course.id,
      })),
    [courses],
  );

  const formatNumber = (value: number): string =>
    value > 0 ? new Intl.NumberFormat("en-IN").format(value) : "";

  const applySelectedCourse = (course: IEducationCourse | undefined): void => {
    setSelectedCourseId(course?.id || "");
    setSelectedCourseTenure(course?.courseTenure || "");
    setCourseFees(course ? formatNumber(course.courseFees) : "");

    // Reset loan configuration
    setEmiOptionMonths(0);
    setAdvancedEmiMonths(null);
    setDownpayment("");

    // Reset discount fields
    setDiscountPercentage("");
    setDiscountAmount("");

    // Clear validation errors
    setReviewErrors({});
  };

  const resetStudentForm = (): void => {
    setStudentForm({
      ...defaultStudentForm,
      applicants: [createEmptyApplicant()],
    });
    setFormErrors({});
  };

  const loadPageData = async (): Promise<void> => {
    setLoading(true);

    try {
      const [studentResponse, courseResponse] = await Promise.all([
        getEducationStudentsAPI(),
        getEducationCoursesAPI(),
      ]);

      setStudents(studentResponse);
      setCourses(courseResponse);

      const resumeDraft = resumeDraftId
        ? getEducationLoanDraftById(resumeDraftId)
        : undefined;

      const preselectedStudentId =
        resumeDraft?.studentId ||
        state?.preselectedStudentId ||
        getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID);

      if (preselectedStudentId) {
        const matchedStudent = studentResponse.find(
          (student) => student.id === preselectedStudentId,
        );

        if (matchedStudent) {
          setSelectedStudent(matchedStudent);
          if (resumeDraft) {
            const matchedCourse = courseResponse.find(
              (course) => course.id === resumeDraft.courseId,
            );

            applySelectedCourse(matchedCourse);
            setEmiOptionMonths(resumeDraft.emiOptionMonths);
            setAdvancedEmiMonths(resumeDraft.advancedEmiMonths);
            setDownpayment(formatNumber(resumeDraft.downpayment));
            setDiscountAmount(formatNumber(resumeDraft.discountAmount));
            setDiscountPercentage(
              resumeDraft.courseFees
                ? Number(
                    ((resumeDraft.discountAmount / resumeDraft.courseFees) * 100).toFixed(2),
                  )
                    .toString()
                    .replace(/\.00$/, "")
                : "",
            );
            setConsentState(consentChecklist.map(() => resumeDraft.consentAccepted));
            setReviewTabIndex(0);
            setActiveIndex(2);
            setEducationLoanResumeStep(resumeDraft.id, "consent");
          } else {
            applySelectedCourse(undefined);
            setActiveIndex(1);
          }
        }
      } else if (isStudentUser) {
        const matchedStudent = studentResponse.find(
          (student) =>
            student.email.toLowerCase() === currentUser.emailID?.toLowerCase() ||
            student.mobileNumber === currentUser.mobileNumber ||
            student.studentPan === currentUser.panNumber ||
            student.studentName === currentUser.userName,
        );

        if (matchedStudent) {
          setSelectedStudent(matchedStudent);
          applySelectedCourse(undefined);
          setActiveIndex(1);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    setFilterReq((previous) => ({
      ...previous,
      pageNumber: 0,
    }));
  }, [filterReq.searchText]);

  useEffect(() => {
    if (!showVerificationDialog || !currentVerificationItem) return;
    resetVerificationStepState(currentVerificationItem.mobileNumber);
  }, [currentVerificationItem, showVerificationDialog]);

  useEffect(() => {
    if (!showVerificationDialog || otpTimer <= 0) return;

    const timer = window.setTimeout(() => {
      setOtpTimer((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpTimer, showVerificationDialog]);

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    setFilterReq((previous) => ({
      ...previous,
      pageNumber: event.page,
      pageSize: event.rows,
    }));
  };

  const handleFieldChange = (
    fieldName: keyof IEducationStudentFormData,
    value: string | boolean | IEducationStudentApplicant[] | null,
  ): void => {
    setStudentForm((previous) => ({
      ...previous,
      [fieldName]: value,
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));

    setFormErrors((previous) => ({
      ...previous,
      [fieldName]: "",
      ...(fieldName === "isMinor" && !value ? { parentPan: "" } : {}),
    }));
  };

  const handleApplicantChange = (
    index: number,
    fieldName: keyof IEducationStudentApplicant,
    value: string | null,
  ): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: previous.applicants.map((applicant, applicantIndex) =>
        applicantIndex === index ? { ...applicant, [fieldName]: value } : applicant,
      ),
    }));

    setFormErrors((previous) => ({
      ...previous,
      [`applicants.${index}.${fieldName}`]: "",
    }));
  };

  const addApplicant = (): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: [...previous.applicants, createEmptyApplicant()],
    }));
  };

  const removeApplicant = (index: number): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants:
        previous.applicants.length === 1
          ? [createEmptyApplicant()]
          : previous.applicants.filter((_, applicantIndex) => applicantIndex !== index),
    }));
  };

  const copyApplicantFromStudent = (index: number): void => {
    setStudentForm((previous) => ({
      ...previous,
      applicants: previous.applicants.map((applicant, applicantIndex) =>
        applicantIndex === index
          ? {
            ...applicant,
            name: previous.studentName,
            dateOfBirth: previous.studentDateOfBirth,
            gender: previous.studentGender,
            mobileNumber: previous.mobileNumber,
            email: previous.email,
            photo: previous.studentPhoto,
          }
          : applicant,
      ),
    }));
  };

  const handleStudentPhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const photo = await convertFileToDataUrl(selectedFile);
    handleFieldChange("studentPhoto", photo);
    event.target.value = "";
  };

  const handleStudentDocumentChange = async (
    fieldName: "studentPanDocument" | "studentAadhaarDocument",
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const documentValue = await convertFileToDataUrl(selectedFile);
    handleFieldChange(fieldName, documentValue);
    event.target.value = "";
  };

  const handleApplicantPhotoChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const photo = await convertFileToDataUrl(selectedFile);
    handleApplicantChange(index, "photo", photo);
    event.target.value = "";
  };

  const handleApplicantDocumentChange = async (
    index: number,
    fieldName: "panDocument" | "aadhaarDocument",
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    const documentValue = await convertFileToDataUrl(selectedFile);
    handleApplicantChange(index, fieldName, documentValue);
    event.target.value = "";
  };

  const validateStudentForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!studentForm.studentName.trim()) {
      nextErrors.studentName = "Student name is required.";
    }

    if (!studentForm.courseId) {
      nextErrors.courseId = "Course is required.";
    }

    if (!studentForm.studentDateOfBirth) {
      nextErrors.studentDateOfBirth = "Student date of birth is required.";
    }

    if (!studentForm.studentAadhaarDocument) {
      nextErrors.studentAadhaarDocument = "Student Aadhaar upload is required.";
    }

    if (!studentForm.studentGender) {
      nextErrors.studentGender = "Student gender is required.";
    }

    if (
      studentForm.isMinor &&
      !PAN_NUMBER_PATTERN.test(studentForm.parentPan.trim().toUpperCase())
    ) {
      nextErrors.parentPan = "Enter a valid parent PAN number.";
    }

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(studentForm.mobileNumber.trim())) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!EMAIL_PATTERN.test(studentForm.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    studentForm.applicants.forEach((applicant, index) => {
      if (!applicant.name.trim()) {
        nextErrors[`applicants.${index}.name`] = "Applicant name is required.";
      }

      if (!PAN_NUMBER_PATTERN.test(applicant.pan.trim().toUpperCase())) {
        nextErrors[`applicants.${index}.pan`] = "Enter a valid applicant PAN number.";
      }

      if (!applicant.panDocument) {
        nextErrors[`applicants.${index}.panDocument`] =
          "Applicant PAN upload is required.";
      }

      if (!applicant.aadhaarDocument) {
        nextErrors[`applicants.${index}.aadhaarDocument`] =
          "Applicant Aadhaar upload is required.";
      }

      if (!applicant.dateOfBirth) {
        nextErrors[`applicants.${index}.dateOfBirth`] =
          "Applicant date of birth is required.";
      }

      if (!applicant.gender) {
        nextErrors[`applicants.${index}.gender`] = "Applicant gender is required.";
      }

      if (!INDIAN_MOBILE_NUMBER_PATTERN.test(applicant.mobileNumber.trim())) {
        nextErrors[`applicants.${index}.mobileNumber`] =
          "Enter a valid 10-digit applicant mobile number.";
      }

      if (!EMAIL_PATTERN.test(applicant.email.trim())) {
        nextErrors[`applicants.${index}.email`] = "Enter a valid applicant email address.";
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveStudent = async (): Promise<void> => {
    if (!validateStudentForm()) return;

    setLoading(true);

    try {
      const createdStudent = await createEducationStudentAPI(studentForm);
      toastSuccess(`${createdStudent.studentName} added successfully.`);
      setShowStudentDialog(false);
      resetStudentForm();
      await loadPageData();
      setSelectedStudent(createdStudent);
      setFilterReq((previous) => ({
        ...previous,
        pageNumber: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationOtp = (): void => {
    if (!currentVerificationItem) return;

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(verificationMobileNumber.trim())) {
      toastError("Enter a valid 10-digit mobile number before requesting OTP.");
      return;
    }

    const nextOtp = String(
      Math.floor(100000 + Math.random() * 900000),
    );

    setDemoOtpCode(nextOtp);
    setIsOtpSent(true);
    setOtpTimer(environment.OTP_TIMER);
    toastSuccess(
      `OTP sent to ${formatMobileNumber(verificationMobileNumber.trim())}.`,
    );
  };

  const markCurrentVerificationComplete = async (): Promise<void> => {
    if (!selectedStudent || !currentVerificationItem) return;

    if (!INDIAN_MOBILE_NUMBER_PATTERN.test(verificationMobileNumber.trim())) {
      toastError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!verificationOtp || verificationOtp.length !== OTPType.SIX_DIGIT_OTP) {
      toastError(`Please enter a valid ${OTPType.SIX_DIGIT_OTP}-digit OTP.`);
      return;
    }

    if (!isOtpSent) {
      toastError("Request OTP before verification.");
      return;
    }

    if (demoOtpCode && verificationOtp !== demoOtpCode) {
      toastError("Entered OTP does not match the generated OTP.");
      return;
    }

    const verificationKey = buildVerificationStorageKey(
      selectedStudent.id,
      currentVerificationItem.type,
      currentVerificationItem.id,
    );

    const nextVerificationStatusMap = {
      ...verificationStatusMap,
      [verificationKey]: {
        verifiedAt: new Date().toISOString(),
        mobileNumber: verificationMobileNumber.trim(),
      },
    };

    setVerificationStatusMap(nextVerificationStatusMap);
    setVerificationStorageMap(nextVerificationStatusMap);

    toastSuccess(`${currentVerificationItem.name} verified successfully.`);

    const nextStepIndex = verificationStepIndex + 1;

    if (nextStepIndex < verificationQueue.length) {
      setVerificationStepIndex(nextStepIndex);
      return;
    }

    closeVerificationFlow();
    await handleProceedAfterVerification();
  };

  const prepareStudentForDraft = async (): Promise<IEducationStudent | null> => {
    if (!selectedStudent) return null;
    return selectedStudent;
  };

  const proceedToCreditChecks = async (): Promise<void> => {
    if (!selectedStudent || !selectedCourse) {
      toastError("Student and course details are required.");
      return;
    }

    setLoading(true);

    try {
      const draftStudent = await prepareStudentForDraft();

      if (!draftStudent) return;

      const response = await createEducationLoanDraftAPI({
        student: draftStudent,
        course: selectedCourse,
        instituteName: currentUser.userName || "Education Institute",
        courseFees: parseAmount(courseFees),
        emiOptionMonths,
        advancedEmiMonths,
        downpayment: parseAmount(downpayment),
        discountValue: parseAmount(discountAmount),
      });

      const draft = response.data;

      setEducationLoanResumeStep(draft.id, "credit-score");
      dispatch(setCustomerInfo(buildEducationCustomerInfo(draftStudent)));

      toastSuccess(
        `${draft.studentName}'s application is ready for credit and banking checks.`,
      );

      navigate(RoutePathConstant.private.checkEligibility, {
        state: {
          educationFlow: true,
          educationLoanApplicationId: draft.id,
          loanApp: draft.id,
          loanType: 0,
          resumeStep: "credit-score",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedAfterVerification = async (
    forceReapply: boolean = false,
  ): Promise<void> => {
    if (!selectedStudent) {
      toastError("Select a student before continuing.");
      return;
    }

    if (resumeDraftId) {
      const resumeDraft = getEducationLoanDraftById(resumeDraftId);

      if (resumeDraft) {
        setEducationLoanResumeStep(resumeDraft.id, "credit-score");
        dispatch(setCustomerInfo(buildEducationCustomerInfo(selectedStudent)));
        navigate(RoutePathConstant.private.checkEligibility, {
          state: {
            educationFlow: true,
            educationLoanApplicationId: resumeDraft.id,
            loanApp: resumeDraft.id,
            loanType: 0,
            resumeStep: "credit-score",
          },
        });
        return;
      }
    }

    const pendingApplications = getPendingEducationLoanApplicationsByStudent(
      selectedStudent.id,
    );

    if (!forceReapply && pendingApplications.length > 0) {
      setShowReapplyDialog(true);
      return;
    }

    await proceedToCreditChecks();
  };

  const handlePrimaryAction = async (): Promise<void> => {
    if (activeIndex === 0) {
      if (!selectedStudent) {
        toastError("Select a student to continue.");
        return;
      }

      setActiveIndex(1);
      return;
    }

    if (activeIndex === 1) {
      if (!selectedCourse) {
        toastError("Select a course to continue.");
        return;
      }

      setActiveIndex(2);
      return;
    }

    if (pendingVerificationQueue.length > 0) {
      openVerificationFlow();
      return;
    }

    await handleProceedAfterVerification();
  };

  return (
    <>
      <Loader isLoading={loading} />

      <div className="whiteBoxHldr p-30">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 className="txt-30 fw-bold mb-2">Education Loan Application</h2>
          </div>

          {activeIndex === 0 && currentUser.userType === CLIENT_ROLE.CHANNEL_PARTNER && !isStudentUser && (
            <Button
              type="button"
              className="btn btn-orange"
              icon="bi bi-plus-circle me-2"
              label="Add Student"
              onClick={() =>
                navigate(RoutePathConstant.private.educationAddStudent, {
                  state: {
                    returnTo: RoutePathConstant.private.educationStudentLoanApplication,
                  },
                })
              }
            />
          )}
        </div>

        {activeIndex === 0 && (
          <div className="row g-4">
            <div className="col-12">
              <div className="p-24 h-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                  <div>
                    <h4 className="mb-1">Select Student</h4>
                    <p className="mb-0 text-muted">
                      Choose the student profile that should move into the education
                      loan journey.
                    </p>
                  </div>
                </div>

                <DataTable
                  className="tableMain"
                  value={paginatedStudents}
                  emptyMessage="No student found"
                  dataKey="id"
                  selectionMode="single"
                  selection={selectedStudent}
                  onSelectionChange={(event) =>
                    setSelectedStudent(event.value as IEducationStudent)
                  }
                >
                  <Column selectionMode="single" />

                  <Column field="studentCode" header="Student Code" />

                  <Column field="studentName" header="Student Name" />

                  <Column field="courseName" header="Current Course" />

                  <Column
                    header="Mobile"
                    body={(rowData: IEducationStudent) =>
                      formatMobileNumber(rowData.mobileNumber)
                    }
                  />

                  <Column
                    header="Registered"
                    body={(rowData: IEducationStudent) =>
                      formatDate(rowData.createdAt)
                    }
                  />
                </DataTable>

                <div className="mt-3">
                  <PrimePaginator
                    onPageChange={onPageChange}
                    pageNumber={filterReq.pageNumber}
                    pageSize={filterReq.pageSize}
                    totalRecords={filteredStudents.length}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <div className="row g-4">
            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <div className="mb-4">
                  <h4 className="mb-1">Select Course</h4>
                  <p className="mb-0 text-muted">
                    Match the application to the right course configuration and fee
                    structure.
                  </p>
                </div>

                <div className="form-group col-lg-6 col-12 px-0">
                  <label className="form-label">
                    Course<sup>*</sup>
                  </label>
                  <Dropdown
                    className="w-100"
                    value={selectedCourseId}
                    options={courseOptions}
                    onChange={(event) =>
                      applySelectedCourse(
                        courses.find((course) => course.id === event.value),
                      )
                    }
                    placeholder="Select course"
                  />
                </div>
              </div>
            </div>

            {selectedCourse && (
              <div className="col-12">
                <div className="borderBoxHldr p-24 h-100">
                  <div className="row g-4 align-items-stretch">
                    <div className="col-lg-4 col-12 d-flex flex-column">
                      <h4 className="mb-3">Course Information</h4>

                      <div className="p-20" style={cardStyle}>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Name</small>
                          <b>{selectedCourse.courseName}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Tenure</small>
                          <b>{selectedCourse.courseTenure}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Type</small>
                          <b>{selectedCourse.courseType}</b>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Course Fees</small>
                          <b>{formatCurrencyAmount(selectedCourse.courseFees)}</b>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Job Guaranteed</small>
                          <b>{selectedCourse.isJobGuaranteed ? "Yes" : "No"}</b>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 col-12">
                      <h4 className="mb-3">Configure Loan Structure</h4>

                      <div className="row g-3">
                        <div className="form-group col-12">
                          <label className="form-label">
                            Course Tenure<sup>*</sup>
                          </label>
                          <InputText
                            className="form-control w-100"
                            value={selectedCourseTenure}
                            disabled
                            placeholder="Select course tenure"
                          />
                        </div>

                        <div className="form-group col-12">
                          <label className="form-label">
                            EMI Options<sup>*</sup>
                          </label>
                          <Dropdown
                            className="w-100"
                            value={emiOptionMonths}
                            options={emiOptions}
                            onChange={(event) => {
                              setEmiOptionMonths(event.value);
                              setAdvancedEmiMonths(null);
                              setReviewErrors((previous) => ({
                                ...previous,
                                emiOptionMonths: "",
                              }));
                            }}
                            placeholder="Select EMI option"
                          />
                          {reviewErrors.emiOptionMonths && (
                            <small className="error">
                              {reviewErrors.emiOptionMonths}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-12">
                          <label className="form-label">
                            Advanced EMI Options
                          </label>
                          <Dropdown
                            className="w-100"
                            value={advancedEmiMonths}
                            options={advancedEmiOptions}
                            onChange={(event) => {
                              setAdvancedEmiMonths(event.value);
                              setReviewErrors((previous) => ({
                                ...previous,
                                advancedEmiMonths: "",
                              }));
                            }}
                            placeholder="Select Advanced EMI Option"
                            showClear
                          />
                        </div>

                        <div className="form-group col-md-6 col-12">
                          <label className="form-label">Discount in Percentage(%)</label>
                          <InputText
                            className="form-control"
                            value={discountPercentage}
                            placeholder="Enter discount %"
                            onChange={(e) => updateDiscountPercentage(e.target.value)}
                          />
                        </div>

                        <div className="form-group col-md-6 col-12">
                          <label className="form-label">Discount in Amount</label>
                          <InputText
                            className="form-control"
                            value={discountAmount}
                            placeholder="Enter discount amount"
                            onChange={(e) => updateDiscountAmount(e.target.value)}
                          />
                        </div>

                        <div className="form-group col-12">
                          <label className="form-label">Down payment (Optional)</label>
                          <InputText
                            className="form-control"
                            value={downpayment}
                            placeholder="Enter down payment"
                            onChange={(event) => {
                              setDownpayment(
                                formatNumber(parseAmount(event.target.value)),
                              );
                              setReviewErrors((previous) => ({
                                ...previous,
                                downpayment: "",
                              }));
                            }}
                          />
                          {reviewErrors.downpayment && (
                            <small className="error">{reviewErrors.downpayment}</small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 col-12 d-flex flex-column">
                      <h4 className="mb-3">Loan Summary</h4>

                      <div
                        className="table-responsive flex-grow-1"
                        style={{
                          border: "1px solid #f1d4c8",
                          borderRadius: "18px",
                          overflow: "hidden",
                          padding: "10px",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <table className="table mb-0 align-middle">
                          <tbody>
                            <tr>
                              <td className="fw-semibold">Agreed Fee</td>
                              <td className="text-end">
                                {formatCurrencyAmount(parseAmount(courseFees))}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Discount (%)</td>
                              <td className="text-end">
                                {discountPercentage || 0}%
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Discount Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.discountAmount)}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Net Agreed Fee</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.discountedCourseFee)}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Down Payment</td>
                              <td className="text-end">
                                {formatCurrencyAmount(parseAmount(downpayment))}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Total Loan Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.loanAmount)}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Total EMI</td>
                              <td className="text-end">
                                {emiOptionMonths || 0}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Advanced EMI</td>
                              <td className="text-end">
                                {advancedEmiMonths ?? 0}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Advance EMI Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.advanceEmi)}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">Remaining EMIs</td>
                              <td className="text-end">
                                {summary.numberOfEmis}
                              </td>
                            </tr>

                            <tr>
                              <td className="fw-semibold">EMI Amount</td>
                              <td className="text-end">
                                {formatCurrencyAmount(summary.emiAmount)} / EMI
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeIndex === 2 && selectedStudent && selectedCourse && (
          <div className="row g-4">
            <div className="col-12">
              <TabView
                className="custom-tabview"
                activeIndex={reviewTabIndex}
                onTabChange={(event) => setReviewTabIndex(event.index)}
              >
                <TabPanel header="Personal Details">
                  <div className="borderBoxHldr p-24 mt-3">
                    <div className="row">
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Verification Status</b>
                        <p className="text-break mb-0">
                          <span
                            className={`education-verification-badge ${
                              verificationQueueItems[0] &&
                              isQueueItemVerified(verificationQueueItems[0])
                                ? "is-verified"
                                : "is-pending"
                            }`}
                          >
                            {verificationQueueItems[0] &&
                            isQueueItemVerified(verificationQueueItems[0])
                              ? "Verified"
                              : "Pending Verification"}
                          </span>
                        </p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Student Information</b>
                        <p className="text-break">{selectedStudent.studentName}</p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Student Code</b>
                        <p className="text-break">{selectedStudent.studentCode}</p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Course</b>
                        <p className="text-break">{selectedCourse.courseName}</p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Date of Birth</b>
                        <p className="text-break">
                          {selectedStudent.studentDateOfBirth
                            ? formatDate(selectedStudent.studentDateOfBirth, "DD MMM, YYYY")
                            : "-"}
                        </p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Gender</b>
                        <p className="text-break">{selectedStudent.studentGender || "-"}</p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                        <b>Credit Score</b>
                        <p className="text-break">
                          {selectedStudent.creditInformation.creditScore || "-"}
                        </p>
                      </div>
                      <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-0">
                        <b>Last Time Credit Score Fetch Date</b>
                        <p className="text-break">
                          {selectedStudent.creditInformation.lastDateCreditScore || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel header="Applicants Details">
                  <div className="mt-3">
                    {selectedStudent.applicants?.[0] ? (
                      renderReviewApplicantDetails(
                        selectedStudent.applicants[0],
                        "Applicant",
                        undefined,
                        Boolean(
                          verificationQueueItems[1] &&
                          isQueueItemVerified(verificationQueueItems[1]),
                        ),
                      )
                    ) : (
                      <div className="borderBoxHldr p-24">
                        <p className="mb-0">No applicant details available.</p>
                      </div>
                    )}
                  </div>
                </TabPanel>

                <TabPanel header="Co-Applicants Details">
                  <div className="mt-3">
                    {selectedStudent.applicants?.slice(1).length ? (
                      selectedStudent.applicants.slice(1).map((applicant, index) => (
                        <div
                          key={applicant.id || `co-applicant-${index + 1}`}
                          className={index > 0 ? "mt-3" : ""}
                        >
                          {renderReviewApplicantDetails(
                            applicant,
                            `Co-applicant ${index + 1}`,
                            selectedStudent.coApplicantRelation ||
                              `Co-applicant ${index + 1}`,
                            Boolean(
                              verificationQueueItems[index + 2] &&
                              isQueueItemVerified(verificationQueueItems[index + 2]),
                            ),
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

            <div className="col-12">
              <h5 className="mb-3">Contact Details</h5>
              <div className="borderBoxHldr p-24">
                <div className="row">
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Mobile Number</b>
                    <p className="text-break">
                      {formatMobileNumber(selectedStudent.mobileNumber)}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Email Address</b>
                    <p className="text-break">{selectedStudent.email}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Co-applicant Name</b>
                    <p className="text-break">{selectedStudent.coApplicantName || "-"}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Co-applicant Relation</b>
                    <p className="text-break">
                      {selectedStudent.coApplicantRelation || "-"}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Co-applicant Mobile</b>
                    <p className="text-break">
                      {selectedStudent.coApplicantMobileNumber
                        ? formatMobileNumber(selectedStudent.coApplicantMobileNumber)
                        : "-"}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-0">
                    <b>Registered On</b>
                    <p className="text-break">
                      {formatDate(selectedStudent.createdAt, "DD MMM, YYYY")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <h5 className="mb-3">Loan Structure</h5>
              <div className="borderBoxHldr p-24 h-100">
                <div className="row">
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course</b>
                    <p className="text-break">{selectedCourse.courseName}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Tenure</b>
                    <p className="text-break">{selectedCourse.courseTenure}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Course Fees</b>
                    <p className="text-break">{formatCurrencyAmount(parseAmount(courseFees))}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Discount Rate</b>
                    <p className="text-break">{discountPercentage || 0}%</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Discount Amount</b>
                    <p className="text-break">{formatCurrencyAmount(summary.discountAmount)}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Down Payment</b>
                    <p className="text-break">
                      {formatCurrencyAmount(parseAmount(downpayment))}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>EMI Plan</b>
                    <p className="text-break">
                      {emiOptionMonths ? `${emiOptionMonths} Months` : "-"}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Advanced EMI Months</b>
                    <p className="text-break">{advancedEmiMonths ?? 0}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Advanced EMI Amount</b>
                    <p className="text-break">{formatCurrencyAmount(summary.advanceEmi)}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Disbursement Amount to Institute</b>
                    <p className="text-break">
                      {formatCurrencyAmount(summary.totalAmountToInstitute)}
                    </p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-4">
                    <b>Net Loan Amount</b>
                    <p className="text-break">{formatCurrencyAmount(summary.loanAmount)}</p>
                  </div>
                  <div className="col-lg-3 col-md-5 col-sm-6 col-12 mb-0">
                    <b>EMI Amount</b>
                    <p className="text-break">
                      {formatCurrencyAmount(summary.emiAmount)} for {summary.numberOfEmis}{" "}
                      instalments
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="borderBoxHldr p-24 h-100">
                <h4 className="mb-3">Consent</h4>
                {consentChecklist.map((consent, index) => (
                  <div
                    className="d-flex align-items-start gap-3 mb-3 form-check"
                    key={consent}
                  >
                    <Checkbox
                      inputId={`consent-${index}`}
                      checked={consentState[index]}
                      onChange={(event) => {
                        const nextState = [...consentState];
                        nextState[index] = !!event.checked;
                        setConsentState(nextState);
                        setConsentError("");
                      }}
                    />
                    <label htmlFor={`consent-${index}`} className="form-check-label mb-0">
                      {consent}
                    </label>
                  </div>
                ))}

                {consentError && <small className="error">{consentError}</small>}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-5 flex-wrap gap-3">
          <Button
            className="btn btn-black-line"
            label={activeIndex === 0 ? "Back to Dashboard" : "Back"}
            onClick={() => {
              if (activeIndex === 0) {
                navigate(RoutePathConstant.private.channelPartnerDashboard);
                return;
              }

              setActiveIndex((previous) => Math.max(previous - 1, 0));
            }}
          />

          <Button
            className={`btn ${(
              (activeIndex === 0 && !selectedStudent) ||
              (activeIndex === 1 && !selectedCourse)
            )
              ? "btn-orange-disabled"
              : "btn-orange"
              }`}
            label="Continue"
            disabled={
              (activeIndex === 0 && !selectedStudent) ||
              (activeIndex === 1 && !selectedCourse)
            }
            onClick={handlePrimaryAction}
          />
        </div>
      </div>

      <Dialog
        header="Add Student"
        visible={showStudentDialog}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        blockScroll
        style={{ width: "860px" }}
        onHide={() => {
          setShowStudentDialog(false);
          resetStudentForm();
        }}
        footer={
          <div className="modal-footer gap-3">
            <Button
              className="btn btn-black-line w-100 text-center"
              label="Cancel"
              onClick={() => {
                setShowStudentDialog(false);
                resetStudentForm();
              }}
            />
            <Button
              className="btn btn-orange w-100 text-center"
              label="Create Student"
              onClick={handleSaveStudent}
            />
          </div>
        }
      >
        <div className="education-student-form-shell">
          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Student Details</h4>
                <p>Capture the student profile without PAN and keep the applicant records below.</p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-3 col-md-4 col-sm-12">
                <div className="education-student-photo-card">
                  <div className="education-student-photo-card__preview">
                    {studentForm.studentPhoto ? (
                      <img src={studentForm.studentPhoto} alt={studentForm.studentName || "Student"} />
                    ) : (
                      <span>{getInitials(studentForm.studentName)}</span>
                    )}
                  </div>
                  <div className="education-student-photo-card__actions">
                    <label htmlFor="loanStudentPhotoUpload" className="btn btn-orange-line mb-0">
                      Upload
                    </label>
                    <label
                      htmlFor="loanStudentPhotoCapture"
                      className="btn btn-orange mb-0"
                      onClick={(event) => {
                        event.preventDefault();
                        setShowStudentCamera(true);
                      }}
                    >
                      Capture
                    </label>
                  </div>
                  <input
                    id="loanStudentPhotoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleStudentPhotoChange}
                    className="d-none"
                  />
                </div>
              </div>

              <div className="col-lg-9 col-md-8 col-sm-12">
                <div className="row g-3">
                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentName">
                      Student Name<sup>*</sup>
                    </label>
                    <InputText
                      id="studentName"
                      className="form-control"
                      placeholder="Enter student name"
                      value={studentForm.studentName}
                      onChange={(event) => handleFieldChange("studentName", event.target.value)}
                    />
                    {formErrors.studentName && <small className="error">{formErrors.studentName}</small>}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentCourse">
                      Course<sup>*</sup>
                    </label>
                    <Dropdown
                      id="studentCourse"
                      className="w-100"
                      value={studentForm.courseId}
                      options={courseOptions}
                      onChange={(event) => handleFieldChange("courseId", event.value)}
                      placeholder="Select course"
                    />
                    {formErrors.courseId && <small className="error">{formErrors.courseId}</small>}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentMobile">
                      Mobile Number<sup>*</sup>
                    </label>
                    <InputText
                      id="studentMobile"
                      className="form-control"
                      placeholder="Enter 10-digit mobile number"
                      value={studentForm.mobileNumber}
                      maxLength={10}
                      onChange={(event) =>
                        handleFieldChange(
                          "mobileNumber",
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                    />
                    {formErrors.mobileNumber && <small className="error">{formErrors.mobileNumber}</small>}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentEmail">
                      Email Address<sup>*</sup>
                    </label>
                    <InputText
                      id="studentEmail"
                      className="form-control"
                      placeholder="Enter student email address"
                      value={studentForm.email}
                      onChange={(event) => handleFieldChange("email", event.target.value)}
                    />
                    {formErrors.email && <small className="error">{formErrors.email}</small>}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="loanStudentDob">
                      Date of Birth<sup>*</sup>
                    </label>
                    <Calendar
                      id="loanStudentDob"
                      value={toInputDate(studentForm.studentDateOfBirth)}
                      onChange={(event) =>
                        handleFieldChange(
                          "studentDateOfBirth",
                          toIsoDate((event.value as Date | null) || null),
                        )
                      }
                      className="w-100"
                      showIcon
                      maxDate={new Date()}
                      placeholder="Select date of birth"
                      dateFormat="dd M yy"
                    />
                    {formErrors.studentDateOfBirth && (
                      <small className="error">{formErrors.studentDateOfBirth}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="loanStudentGender">
                      Gender<sup>*</sup>
                    </label>
                    <Dropdown
                      id="loanStudentGender"
                      className="w-100"
                      value={studentForm.studentGender}
                      options={genderOptions}
                      onChange={(event) => handleFieldChange("studentGender", event.value)}
                      placeholder="Select gender"
                    />
                    {formErrors.studentGender && (
                      <small className="error">{formErrors.studentGender}</small>
                    )}
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label" htmlFor="studentPan">
                      Student PAN
                    </label>
                    <InputText
                      id="studentPan"
                      className="form-control"
                      placeholder="Enter student PAN"
                      value={studentForm.studentPan}
                      onChange={(event) =>
                        handleFieldChange("studentPan", event.target.value.toUpperCase())
                      }
                    />
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label d-block mb-2">Is Student Minor?</label>
                    <div className="d-flex align-items-center gap-2">
                      <InputSwitch
                        checked={studentForm.isMinor}
                        onChange={(event) => handleFieldChange("isMinor", !!event.value)}
                      />
                      <span>{studentForm.isMinor ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  {studentForm.isMinor && (
                    <div className="form-group col-sm-12 col-lg-6">
                      <label className="form-label" htmlFor="parentPan">
                        Parent PAN<sup>*</sup>
                      </label>
                      <InputText
                        id="parentPan"
                        className="form-control"
                        placeholder="Enter parent PAN"
                        value={studentForm.parentPan}
                        onChange={(event) =>
                          handleFieldChange("parentPan", event.target.value.toUpperCase())
                        }
                      />
                      {formErrors.parentPan && <small className="error">{formErrors.parentPan}</small>}
                    </div>
                  )}

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label d-block">
                      Student PAN Upload
                    </label>
                    <label
                      htmlFor="studentPanDocumentUpload"
                      className="borderBoxHldr p-15 d-block cursor-pointer"
                    >
                      <b className="d-block mb-1">Upload Student PAN</b>
                      <small className="text-muted">
                        {studentForm.studentPanDocument
                          ? "PAN document uploaded"
                          : "Optional: upload PAN document"}
                      </small>
                    </label>
                    <input
                      id="studentPanDocumentUpload"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(event) =>
                        void handleStudentDocumentChange("studentPanDocument", event)
                      }
                      className="d-none"
                    />
                  </div>

                  <div className="form-group col-sm-12 col-lg-6">
                    <label className="form-label d-block">
                      Student Aadhaar Upload<sup>*</sup>
                    </label>
                    <label
                      htmlFor="studentAadhaarDocumentUpload"
                      className="borderBoxHldr p-15 d-block cursor-pointer"
                    >
                      <b className="d-block mb-1">Upload Student Aadhaar</b>
                      <small className="text-muted">
                        {studentForm.studentAadhaarDocument
                          ? "Aadhaar document uploaded"
                          : "Required: upload Aadhaar document"}
                      </small>
                    </label>
                    <input
                      id="studentAadhaarDocumentUpload"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(event) =>
                        void handleStudentDocumentChange("studentAadhaarDocument", event)
                      }
                      className="d-none"
                    />
                    {formErrors.studentAadhaarDocument && (
                      <small className="error">{formErrors.studentAadhaarDocument}</small>
                    )}
                  </div>

                  <div className="form-group col-12">
                    <label className="form-label d-block mb-2">Status</label>
                    <div className="d-flex align-items-center gap-2">
                      <InputSwitch
                        checked={studentForm.isActive}
                        onChange={(event) => handleFieldChange("isActive", !!event.value)}
                      />
                      <span>{studentForm.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="education-student-form-section">
            <div className="education-student-form-section__head">
              <div>
                <h4>Applicants</h4>
                <p>Add multiple applicants and use copy as above when the details are similar.</p>
              </div>
              <Button className="btn btn-orange" onClick={addApplicant}>
                <i className="bi bi-plus-circle me-2" />
                Add Applicant
              </Button>
            </div>

            <div className="education-student-applicant-stack">
              {studentForm.applicants.map((applicant, index) => (
                <div key={applicant.id} className="education-student-applicant-card">
                  <div className="education-student-applicant-card__head">
                    <div>
                      <h5>Applicant {index + 1}</h5>
                      <p>Copy student details, then edit any applicant-specific changes.</p>
                    </div>
                    <div className="education-student-applicant-card__actions">
                      <Button
                        className="btn btn-orange-line"
                        onClick={() => copyApplicantFromStudent(index)}
                      >
                        Copy as above
                      </Button>
                      {studentForm.applicants.length > 1 && (
                        <Button
                          className="btn btn-black-line"
                          onClick={() => removeApplicant(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-lg-3 col-md-4 col-sm-12">
                      <div className="education-student-photo-card education-student-photo-card--applicant">
                        <div className="education-student-photo-card__preview">
                          {applicant.photo ? (
                            <img src={applicant.photo} alt={applicant.name || "Applicant"} />
                          ) : (
                            <span>{getInitials(applicant.name || `Applicant ${index + 1}`)}</span>
                          )}
                        </div>
                        <div className="education-student-photo-card__actions">
                          <label
                            htmlFor={`loanApplicantPhotoUpload-${index}`}
                            className="btn btn-orange-line mb-0"
                          >
                            Upload
                          </label>
                          <label
                            htmlFor={`loanApplicantPhotoCapture-${index}`}
                            className="btn btn-orange mb-0"
                            onClick={(event) => {
                              event.preventDefault();
                              setApplicantCameraIndex(index);
                            }}
                          >
                            Capture
                          </label>
                        </div>
                        <input
                          id={`loanApplicantPhotoUpload-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(event) => void handleApplicantPhotoChange(index, event)}
                          className="d-none"
                        />
                      </div>
                    </div>

                    <div className="col-lg-9 col-md-8 col-sm-12">
                      <div className="row g-3">
                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Applicant Name<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter applicant name"
                            value={applicant.name}
                            onChange={(event) =>
                              handleApplicantChange(index, "name", event.target.value)
                            }
                          />
                          {formErrors[`applicants.${index}.name`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.name`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Applicant PAN<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter applicant PAN"
                            value={applicant.pan}
                            onChange={(event) =>
                              handleApplicantChange(index, "pan", event.target.value.toUpperCase())
                            }
                          />
                          {formErrors[`applicants.${index}.pan`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.pan`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label d-block">
                            Applicant PAN Upload<sup>*</sup>
                          </label>
                          <label
                            htmlFor={`loanApplicantPanDocumentUpload-${index}`}
                            className="borderBoxHldr p-15 d-block cursor-pointer"
                          >
                            <b className="d-block mb-1">Upload Applicant PAN</b>
                            <small className="text-muted">
                              {applicant.panDocument
                                ? "PAN document uploaded"
                                : "Required: upload PAN document"}
                            </small>
                          </label>
                          <input
                            id={`loanApplicantPanDocumentUpload-${index}`}
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(event) =>
                              void handleApplicantDocumentChange(
                                index,
                                "panDocument",
                                event,
                              )
                            }
                            className="d-none"
                          />
                          {formErrors[`applicants.${index}.panDocument`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.panDocument`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label d-block">
                            Applicant Aadhaar Upload<sup>*</sup>
                          </label>
                          <label
                            htmlFor={`loanApplicantAadhaarDocumentUpload-${index}`}
                            className="borderBoxHldr p-15 d-block cursor-pointer"
                          >
                            <b className="d-block mb-1">Upload Applicant Aadhaar</b>
                            <small className="text-muted">
                              {applicant.aadhaarDocument
                                ? "Aadhaar document uploaded"
                                : "Required: upload Aadhaar document"}
                            </small>
                          </label>
                          <input
                            id={`loanApplicantAadhaarDocumentUpload-${index}`}
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(event) =>
                              void handleApplicantDocumentChange(
                                index,
                                "aadhaarDocument",
                                event,
                              )
                            }
                            className="d-none"
                          />
                          {formErrors[`applicants.${index}.aadhaarDocument`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.aadhaarDocument`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Date of Birth<sup>*</sup></label>
                          <Calendar
                            value={toInputDate(applicant.dateOfBirth)}
                            onChange={(event) =>
                              handleApplicantChange(
                                index,
                                "dateOfBirth",
                                toIsoDate((event.value as Date | null) || null),
                              )
                            }
                            className="w-100"
                            showIcon
                            maxDate={new Date()}
                            placeholder="Select applicant date of birth"
                            dateFormat="dd M yy"
                          />
                          {formErrors[`applicants.${index}.dateOfBirth`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.dateOfBirth`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Gender<sup>*</sup></label>
                          <Dropdown
                            className="w-100"
                            value={applicant.gender}
                            options={genderOptions}
                            onChange={(event) =>
                              handleApplicantChange(index, "gender", event.value)
                            }
                            placeholder="Select applicant gender"
                          />
                          {formErrors[`applicants.${index}.gender`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.gender`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Mobile Number<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter 10-digit mobile number"
                            value={applicant.mobileNumber}
                            maxLength={10}
                            onChange={(event) =>
                              handleApplicantChange(
                                index,
                                "mobileNumber",
                                event.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                          />
                          {formErrors[`applicants.${index}.mobileNumber`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.mobileNumber`]}
                            </small>
                          )}
                        </div>

                        <div className="form-group col-sm-12 col-lg-6">
                          <label className="form-label">Email Address<sup>*</sup></label>
                          <InputText
                            className="form-control"
                            placeholder="Enter applicant email address"
                            value={applicant.email}
                            onChange={(event) =>
                              handleApplicantChange(index, "email", event.target.value)
                            }
                          />
                          {formErrors[`applicants.${index}.email`] && (
                            <small className="error">
                              {formErrors[`applicants.${index}.email`]}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Dialog>

      <CameraCaptureDialog
        visible={showStudentCamera}
        title="Capture Student Photo"
        onHide={() => setShowStudentCamera(false)}
        onCapture={(dataUrl) => {
          handleFieldChange("studentPhoto", dataUrl);
          setShowStudentCamera(false);
        }}
      />

      <CameraCaptureDialog
        visible={applicantCameraIndex !== null}
        title="Capture Applicant Photo"
        onHide={() => setApplicantCameraIndex(null)}
        onCapture={(dataUrl) => {
          if (applicantCameraIndex !== null) {
            handleApplicantChange(applicantCameraIndex, "photo", dataUrl);
          }
          setApplicantCameraIndex(null);
        }}
      />

      <Dialog
        header="OTP Verification"
        visible={showVerificationDialog}
        className="modalWrapper responsive-dialog"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        onHide={closeVerificationFlow}
      >
        {currentVerificationItem && (
          <div className="education-verification-dialog">
            <div className="education-verification-dialog__meta">
              <div>
                <h4 className="mb-1">{currentVerificationItem.name}</h4>
                <p className="mb-0 text-muted">
                  Verify {currentVerificationItem.type === "student"
                    ? "student"
                    : currentVerificationItem.type === "applicant"
                      ? "applicant"
                      : "co-applicant"} mobile OTP before proceeding.
                </p>
              </div>
              <span className="education-verification-dialog__step">
                {verificationStepIndex + 1} / {verificationQueue.length}
              </span>
            </div>

            <div className="education-verification-dialog__progress">
              {verificationQueueItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`education-verification-dialog__person ${
                    currentVerificationItem.id === item.id &&
                    currentVerificationItem.type === item.type
                      ? "is-current"
                      : ""
                  }`}
                >
                  <div className="fw-semibold">{item.name}</div>
                  <small>
                    {isQueueItemVerified(item) ? "Verified" : "Pending"}
                  </small>
                </div>
              ))}
            </div>

            <div className="form-group mt-3">
              <label className="form-label" htmlFor="verificationMobileNumber">
                Mobile Number<sup>*</sup>
              </label>
              <InputText
                id="verificationMobileNumber"
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                value={verificationMobileNumber}
                maxLength={10}
                onChange={(event) =>
                  setVerificationMobileNumber(
                    event.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
              />
            </div>

            {isOtpSent && (
              <div className="form-group mt-3">
                <label className="form-label" htmlFor="verificationOtp">
                  Enter OTP<sup>*</sup>
                </label>
                <InputOtp
                  id="verificationOtp"
                  value={verificationOtp}
                  length={OTPType.SIX_DIGIT_OTP}
                  onChange={(event) => setVerificationOtp(String(event.value || ""))}
                  integerOnly
                />
                <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                  <small className="text-muted">
                    Demo OTP: <b>{demoOtpCode}</b>
                  </small>
                  <small className="text-muted">
                    {otpTimer > 0
                      ? `Resend OTP in ${formatTime(otpTimer)}`
                      : "You can resend OTP now."}
                  </small>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
              <Button
                className="btn btn-black-line"
                label="Cancel"
                onClick={closeVerificationFlow}
              />
              <Button
                className="btn btn-orange-line"
                label={isOtpSent ? "Resend OTP" : "Get OTP"}
                onClick={sendVerificationOtp}
                disabled={otpTimer > 0}
              />
              <Button
                className="btn btn-orange"
                label="Verify and Continue"
                onClick={() => void markCurrentVerificationComplete()}
                disabled={!isOtpSent}
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        visible={showReapplyDialog}
        onHide={() => setShowReapplyDialog(false)}
        className="modalWrapper"
        draggable={false}
        resizable={false}
        modal
        blockScroll
        style={{ width: "480px" }}
      >
        <div className="p-2">
          <h4 className="mb-3">Loan Already In Process</h4>
          <p className="mb-0">
            Your loan is already in process, do you want to re-apply for the
            loan?
          </p>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              className="btn btn-black-line"
              label="Cancel"
              onClick={() => setShowReapplyDialog(false)}
            />
            <Button
              className="btn btn-orange"
              label="Re-Apply"
              onClick={async () => {
                setShowReapplyDialog(false);
                await handleProceedAfterVerification(true);
              }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EducationLoanApplication;

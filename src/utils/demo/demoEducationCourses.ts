import {
  IEducationCourse,
  IEducationCourseFormData,
} from "../../interface/educationManagement";

const STORAGE_KEY = "credorbit.educationCourses";

const seedCourses: IEducationCourse[] = [
  {
    id: "course-001",
    courseName: "BBA in Finance and Lending",
    courseTenure: "3 Years",
    courseFees: 180000,
    courseType: "Offline",
    isJobGuaranteed: true,
    description: "A campus-based program focused on finance, sales, and lending operations.",
    isActive: true,
    createdAt: "2026-04-04T10:30:00.000Z",
    updatedAt: "2026-04-04T10:30:00.000Z",
  },
  {
    id: "course-002",
    courseName: "Diploma in Credit Underwriting",
    courseTenure: "12 Months",
    courseFees: 95000,
    courseType: "Online",
    isJobGuaranteed: false,
    description: "An online underwriting and risk-assessment diploma with case-study based learning.",
    isActive: true,
    createdAt: "2026-04-10T09:15:00.000Z",
    updatedAt: "2026-04-10T09:15:00.000Z",
  },
  {
    id: "course-003",
    courseName: "Certificate in NBFC Operations",
    courseTenure: "6 Months",
    courseFees: 55000,
    courseType: "Offline",
    isJobGuaranteed: true,
    description: "A short-term certification designed around collections, servicing, and NBFC workflows.",
    isActive: true,
    createdAt: "2026-04-18T12:00:00.000Z",
    updatedAt: "2026-04-18T12:00:00.000Z",
  },
];

const canUseStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const persistCourses = (courses: IEducationCourse[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};

export const getEducationCourses = (): IEducationCourse[] => {
  if (!canUseStorage()) return seedCourses;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    persistCourses(seedCourses);
    return seedCourses;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as IEducationCourse[];
    return Array.isArray(parsedValue) ? parsedValue : seedCourses;
  } catch {
    persistCourses(seedCourses);
    return seedCourses;
  }
};

export const getEducationCourseById = (
  courseId: string,
): IEducationCourse | undefined =>
  getEducationCourses().find((course) => course.id === courseId);

export const createEducationCourse = (
  courseData: IEducationCourseFormData,
): IEducationCourse => {
  const courses = getEducationCourses();
  const now = new Date().toISOString();

  const nextCourse: IEducationCourse = {
    id: `course-${Date.now()}`,
    courseName: courseData.courseName.trim(),
    courseTenure: courseData.courseTenure.trim(),
    courseFees: Number(courseData.courseFees || 0),
    courseType: courseData.courseType || "Online",
    isJobGuaranteed: courseData.isJobGuaranteed,
    description: courseData.description.trim(),
    isActive: courseData.isActive,
    createdAt: now,
    updatedAt: now,
  };

  persistCourses([nextCourse, ...courses]);
  return nextCourse;
};

export const updateEducationCourse = (
  courseId: string,
  courseData: IEducationCourseFormData,
): IEducationCourse | undefined => {
  const courses = getEducationCourses();
  let updatedCourse: IEducationCourse | undefined;

  const nextCourses = courses.map((course) => {
    if (course.id !== courseId) return course;

    updatedCourse = {
      ...course,
      courseName: courseData.courseName.trim(),
      courseTenure: courseData.courseTenure.trim(),
      courseFees: Number(courseData.courseFees || 0),
      courseType: courseData.courseType || "Online",
      isJobGuaranteed: courseData.isJobGuaranteed,
      description: courseData.description.trim(),
      isActive: courseData.isActive,
      updatedAt: new Date().toISOString(),
    };

    return updatedCourse;
  });

  persistCourses(nextCourses);
  return updatedCourse;
};

export const deleteEducationCourse = (courseId: string): void => {
  const courses = getEducationCourses();
  persistCourses(courses.filter((course) => course.id !== courseId));
};

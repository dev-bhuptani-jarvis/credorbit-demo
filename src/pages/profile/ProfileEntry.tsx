import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";
import Profile from "./Profile";
import StudentProfile from "./StudentProfile";

const STUDENT_USER_ID = "student-role-001";

const ProfileEntry = () => {
  const { userID, roleName } = useSelector((state: RootState) => state.user.user);
  const impersonatedStudentId = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_IMPERSONATE_STUDENT_ID,
  );

  const isStudentPortalUser =
    userID === STUDENT_USER_ID ||
    roleName === "Student" ||
    Boolean(impersonatedStudentId);

  if (isStudentPortalUser) {
    return <StudentProfile />;
  }

  return <Profile />;
};

export default ProfileEntry;

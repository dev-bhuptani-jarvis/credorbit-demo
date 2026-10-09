import { useSelector } from "react-redux";
import { RootState } from "../store";
import { CLIENT_ROLE } from "../utils/constants/constant";
import InstituteProfile from "../pages/profile/InstituteProfile";
import NBFCProfile from "../pages/profile/NBFCProfile";
import StudentProfile from "../pages/profile/StudentProfile";
import Profile from "../pages/profile/Profile";

const UserProfile = () => {
  const { userType } = useSelector((state: RootState) => state.user.user);

  return (
    <>
      {userType === CLIENT_ROLE.EDUCATIONAL_INSTITUTE ? (
        <InstituteProfile />
      ) : userType === CLIENT_ROLE.NBFC ? (
        <NBFCProfile />
      ) : userType === CLIENT_ROLE.STUDENT ? (
        <StudentProfile />
      ) : (
        <Profile />
      )}
    </>
  );
};

export default UserProfile;

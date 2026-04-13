import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StorageKeyEnum } from "../../utils/constants/enum";
import {
  getDecryptedSessionStorage,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { UserData } from "../../interface/otpRequest";

interface UserState {
  user: UserData;
}

const initialState: UserState = {
  user:
    JSON.parse(
      getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_DATA)
    ) || {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state: UserState, action: PayloadAction<UserData>) => {
      state.user = { ...action.payload };
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_USER_DATA,
        JSON.stringify(action.payload)
      );
    },

    updateShowPanDetailPopUp: (
      state: UserState,
      action: PayloadAction<UserData>
    ) => {
      state.user = { ...action.payload };
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_USER_DATA,
        JSON.stringify(state.user)
      );
    },
  },
});

export const { setUserData, updateShowPanDetailPopUp } = userSlice.actions;

export default userSlice.reducer;

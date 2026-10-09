import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { UserData } from "../../interface/otpRequest";

interface ImpersonateUserState {
  isImpersonate: boolean;
}

const parseUserData = (value: string): UserData | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UserData;
  } catch {
    return null;
  }
};

const getIsImpersonateFromStorage = (): boolean => {
  const currentUserData = parseUserData(
    getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_DATA)
  );

  const impersonateUserData = parseUserData(
    getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA)
  );

  if (!currentUserData?.userID || !impersonateUserData?.userID) {
    return false;
  }

  return currentUserData.userID !== impersonateUserData.userID;
};

const initialState: ImpersonateUserState = {
  isImpersonate: getIsImpersonateFromStorage(),
};

export const isImpersonateSlice = createSlice({
  name: "isImpersonate",
  initialState,
  reducers: {
    setImpersonateUser: (
      state: ImpersonateUserState,
      action: PayloadAction<boolean>
    ) => {
      state.isImpersonate = action.payload;
    },
  },
});

export const { setImpersonateUser } = isImpersonateSlice.actions;

export default isImpersonateSlice.reducer;

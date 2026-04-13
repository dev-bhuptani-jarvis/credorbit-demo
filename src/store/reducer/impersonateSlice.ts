import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../../utils/constants/enum";

interface ImpersonateUserState {
  isImpersonate: boolean;
}

const initialState: ImpersonateUserState = {
  isImpersonate: getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_DATA) !== getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_IMPERSONATE_USER_DATA),
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

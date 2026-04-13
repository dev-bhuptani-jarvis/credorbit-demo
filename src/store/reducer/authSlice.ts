import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  clearSessionStorage,
  getDecryptedSessionStorage
} from "../../utils/functions/sessionStorage";
import { StorageKeyEnum } from "../../utils/constants/enum";

interface AuthState {
  isLogin: boolean;
  token: string;
}

const initialState: AuthState = {
  isLogin: Boolean(
    getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_DATA)
  ),
  token: "",
};

export const authSlice = createSlice({
  name: "isLogin",
  initialState,
  reducers: {
    setAuth: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
    setLogout: (state: AuthState) => {
      state.isLogin = false;
      state.token = "";
      clearSessionStorage();
      window.location.reload();
    },
    setToken: (state: AuthState, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setAuth, setLogout, setToken } = authSlice.actions;

export default authSlice.reducer;
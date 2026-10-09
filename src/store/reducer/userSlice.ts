import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StorageKeyEnum } from "../../utils/constants/enum";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "../../utils/functions/sessionStorage";
import { UserData } from "../../interface/otpRequest";

interface UserState {
  user: UserData;
  publicWhiteLabelTenantId: string;
}

const getPersistedUserData = (userData: UserData): UserData => {
  if (!userData?.whiteLabelSettings) {
    return userData;
  }

  const {
    logoUrlBase64,
    faviconUrlBase64,
    ...sanitizedWhiteLabelSettings
  } = userData.whiteLabelSettings;

  return {
    ...userData,
    whiteLabelSettings: sanitizedWhiteLabelSettings,
  };
};

const initialState: UserState = {
  user: (() => {
    const persistedUserData = JSON.parse(
      getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_DATA),
    ) || {};

    return persistedUserData;
  })(),
  publicWhiteLabelTenantId:
    getDecryptedSessionStorage(
      StorageKeyEnum.CRED_ORBIT_PUBLIC_WHITE_LABEL_TENANT_ID,
    ) || "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state: UserState, action: PayloadAction<UserData>) => {
      state.user = { ...action.payload };
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_USER_DATA,
        JSON.stringify(getPersistedUserData(action.payload))
      );
    },

    updateShowPanDetailPopUp: (
      state: UserState,
      action: PayloadAction<UserData>
    ) => {
      state.user = { ...action.payload };
      setEncryptedSessionStorage(
        StorageKeyEnum.CRED_ORBIT_USER_DATA,
        JSON.stringify(getPersistedUserData(state.user))
      );
    },

    setPublicWhiteLabelTenantId: (
      state: UserState,
      action: PayloadAction<string>,
    ) => {
      state.publicWhiteLabelTenantId = action.payload;

      if (action.payload) {
        setEncryptedSessionStorage(
          StorageKeyEnum.CRED_ORBIT_PUBLIC_WHITE_LABEL_TENANT_ID,
          action.payload,
        );
      } else {
        removeSessionStorageKey(
          StorageKeyEnum.CRED_ORBIT_PUBLIC_WHITE_LABEL_TENANT_ID,
        );
      }
    },
  },
});

export const {
  setUserData,
  updateShowPanDetailPopUp,
  setPublicWhiteLabelTenantId,
} = userSlice.actions;

export default userSlice.reducer;

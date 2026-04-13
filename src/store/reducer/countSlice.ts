import { createSlice } from "@reduxjs/toolkit";
import { StorageKeyEnum } from "../../utils/constants/enum";
import { getDecryptedSessionStorage } from "../../utils/functions/sessionStorage";

const initialState = {
  count:
    0 ||
    Number(
      getDecryptedSessionStorage(StorageKeyEnum.CRED_ORBIT_USER_EXPIRY_TIMER)
    ),
};

const countSlice = createSlice({
  name: "count",
  initialState,
  reducers: {
    setCount: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const { setCount } = countSlice.actions;
export default countSlice.reducer;

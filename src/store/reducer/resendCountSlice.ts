import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resendCount: 0,
};

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    incrementResendCount: (state) => {
      if (state.resendCount < 3) {
        state.resendCount += 1;
      }
    },
    resetResendCount: (state) => {
      state.resendCount = 0;
    },
  },
});

export const { incrementResendCount, resetResendCount } = otpSlice.actions;
export default otpSlice.reducer;

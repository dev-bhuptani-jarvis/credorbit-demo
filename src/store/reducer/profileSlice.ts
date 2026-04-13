import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  isProfileUpdated: false,
};

export const isProfileUpdated = createSlice({
  name: "isProfileUpdated",
  initialState,
  reducers: {
    setProfileUpdated: (state, action: PayloadAction<boolean>) => {
      state.isProfileUpdated = action.payload;
    },
  },
});

export const { setProfileUpdated } = isProfileUpdated.actions;

export default isProfileUpdated.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  isNewTransaction: true,
};

export const newTransaction = createSlice({
  name: "isNewTransaction",
  initialState,
  reducers: {
    setNewTransaction: (state, action: PayloadAction<boolean>) => {
      state.isNewTransaction = action.payload;
    },
  },
});

export const { setNewTransaction } = newTransaction.actions;

export default newTransaction.reducer;

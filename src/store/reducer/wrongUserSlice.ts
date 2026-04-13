import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    wrongUser: false,
};

const wrongUserSlice = createSlice({
    name: "wrongUser",
    initialState,
    reducers: {
        setWrongUser: (state, action) => {
            state.wrongUser = action.payload;
        },
    },
});

export const { setWrongUser } = wrongUserSlice.actions;
export default wrongUserSlice.reducer;

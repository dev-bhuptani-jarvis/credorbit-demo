import { createSlice } from "@reduxjs/toolkit";

interface LoaderState {
    activeRequests: number;
}

const initialState: LoaderState = {
    activeRequests: 0,
};

const loaderSlice = createSlice({
    name: "loader",
    initialState,
    reducers: {
        startLoading: (state) => {
            state.activeRequests += 1;
        },
        stopLoading: (state) => {
            state.activeRequests = Math.max(0, state.activeRequests - 1);
        },
    },
});

export const { startLoading, stopLoading } = loaderSlice.actions;
export default loaderSlice.reducer;

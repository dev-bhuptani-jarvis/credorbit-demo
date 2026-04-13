import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReportMessageState {
    title: string;
    message: string;
}

const initialState: ReportMessageState = {
    title: "",
    message: "",
};

interface SetReportPayload {
    title: string;
    message: string;
}

const reportMessageSlice = createSlice({
    name: "reportMessage",
    initialState,
    reducers: {
        setReportMessage: (state, action: PayloadAction<SetReportPayload>) => {
            state.title = action.payload.title;
            state.message = action.payload.message;
        },

        clearReportMessage: (state) => {
            state.title = "";
            state.message = "";
        },
    },
});

export const { setReportMessage, clearReportMessage } = reportMessageSlice.actions;
export default reportMessageSlice.reducer;

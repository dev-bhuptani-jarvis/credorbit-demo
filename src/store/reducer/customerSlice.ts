import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IClientDashboardData } from "../../interface/clientDashboard";

const defaultCustomerInfo: IClientDashboardData = {
  creditScore: 0,
  maxCreditScore: 0,
  creditScoreRefetchedDays: 0,
  incomeTaxRefetchedDays: 0,
  loanApplicationList: [],
  creditReportDate: null,
  bankingReportDate: null,
  itrReportDate: null,
  gstReportDate: null,
  rocReportDate: null,
  cfoReportDate: null,
  totalLoanApplicationsCountByStatus: [],
  reports: [],
  gstNumber: null,
  gstList: [],
  partners: [],
};

const initialState = {
  customerInfo: defaultCustomerInfo,
};

export const customerSlice = createSlice({
  name: "customerInfo",
  initialState,
  reducers: {
    setCustomerInfo: (state, action: PayloadAction<IClientDashboardData>) => {
      state.customerInfo = action.payload;
    },
  },
});

export const { setCustomerInfo } = customerSlice.actions;

export default customerSlice.reducer;

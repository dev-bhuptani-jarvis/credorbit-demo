import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authSlice";
import userReducer from "./reducer/userSlice";
import impersonateUserReducer from "./reducer/impersonateSlice";
import customerReducer from "./reducer/customerSlice";
import newTransactionReducer from "./reducer/newTransactionSlice";
import profileReducer from "./reducer/profileSlice";
import resendCountReducer from "./reducer/resendCountSlice";
import countReducer from "./reducer/countSlice";
import loaderReducer from "./reducer/loaderSlice";
import reportMessageReducer from "./reducer/reportMessageSlice";
import wrongUserReducer from "./reducer/wrongUserSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  impersonateUser: impersonateUserReducer,
  customer: customerReducer,
  newTransaction: newTransactionReducer,
  profile: profileReducer,
  resend: resendCountReducer,
  count: countReducer,
  loader: loaderReducer,
  reportMessage: reportMessageReducer,
  wrongUser: wrongUserReducer
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;

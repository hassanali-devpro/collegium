import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";
import { officesApi } from "../features/offices/officeApi"; 

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [officesApi.reducerPath]: officesApi.reducer, 
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      officesApi.middleware 
    ),
});

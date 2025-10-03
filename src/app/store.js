import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";
import { officesApi } from "../features/offices/officeApi"; 
import { agentsApi } from "../features/agents/agentApi"; 
import { courseApi } from "../features/courses/courseApi";
import { updateApi } from "../features/updates/updateApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [officesApi.reducerPath]: officesApi.reducer, auth: authReducer,
    [agentsApi.reducerPath]: agentsApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [updateApi.reducerPath]: updateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      officesApi.middleware,
      agentsApi.middleware,
      courseApi.middleware,
      updateApi.middleware,
    ),
});

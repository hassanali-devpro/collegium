import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";
import { officesApi } from "../features/offices/officeApi"; 
import { agentsApi } from "../features/agents/agentApi"; 
import { courseApi } from "../features/courses/courseApi";
import { updateApi } from "../features/updates/updateApi";
import { studentApi } from "../features/students/studentApi";
import { docApi } from "../features/documents/docApi";
import {agentStudentApi} from "../features/agentStudent/agentStudentApi";


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [officesApi.reducerPath]: officesApi.reducer, auth: authReducer,
    [agentsApi.reducerPath]: agentsApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [updateApi.reducerPath]: updateApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [docApi.reducerPath]: docApi.reducer,
    [agentStudentApi.reducerPath]: agentStudentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      officesApi.middleware,
      agentsApi.middleware,
      courseApi.middleware,
      updateApi.middleware,
      studentApi.middleware,
      docApi.middleware,
      agentStudentApi.middleware
    ),
});

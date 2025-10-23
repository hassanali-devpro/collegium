import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./apiConfig";

// Create a base query with error handling
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with 401 error handling
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, clear the auth state and redirect to login
  if (result.error && result.error.status === 401) {
    // Dispatch logout action to clear auth state
    api.dispatch({ type: 'auth/logout' });
    
    // Clear all API cache to prevent stale data
    Object.keys(api.getState()).forEach(key => {
      if (key.endsWith('Api')) {
        api.dispatch({ type: `${key}/resetApiState` });
      }
    });
    
    // Log for debugging purposes
    console.warn('Session expired. User has been automatically logged out.');
    
    // Optional: You can trigger a page reload to ensure clean state
    // window.location.reload();
  }

  return result;
};

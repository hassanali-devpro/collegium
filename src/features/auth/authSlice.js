import { createSlice } from "@reduxjs/toolkit";

// Load any previously saved auth state from sessionStorage
// If nothing exists, set default values (user, token, refreshToken as null)
const storedAuth = JSON.parse(sessionStorage.getItem("auth")) || {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth", // Slice name (used internally by Redux)
  initialState: storedAuth, // Initial state comes from sessionStorage or defaults above
  reducers: {
    // ✅ Action: Save user credentials after login
    setCredentials: (state, action) => {
      state.user = action.payload.user;              // Store user data
      state.token = action.payload.token;            // Store JWT access token
      state.refreshToken = action.payload.refreshToken; // Store refresh token (if available)

      // Save entire auth state into sessionStorage so it's persisted
      sessionStorage.setItem("auth", JSON.stringify(state));
    },

    // ✅ Action: Logout and clear credentials
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      // Remove auth data from sessionStorage
      sessionStorage.removeItem("auth");
    },
  },
});

// Export actions so components can dispatch them
export const { setCredentials, logout } = authSlice.actions;

// Export reducer to configure it inside Redux store
export default authSlice.reducer;

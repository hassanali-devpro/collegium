import { createSlice } from "@reduxjs/toolkit";

const storedAuth = JSON.parse(sessionStorage.getItem("auth")) || {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth", 
  initialState: storedAuth, 
  reducers: {

    setCredentials: (state, action) => {
      state.user = action.payload.user;              
      state.token = action.payload.token;            
      state.refreshToken = action.payload.refreshToken; 


      sessionStorage.setItem("auth", JSON.stringify(state));
    },


    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;


      sessionStorage.removeItem("auth");
    },
  },
});


export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// features/offices/officesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const officesSlice = createSlice({
  name: "offices",
  initialState: {
    selectedOffice: null,
  },
  reducers: {
    setSelectedOffice: (state, action) => {
      state.selectedOffice = action.payload;
    },
    clearSelectedOffice: (state) => {
      state.selectedOffice = null;
    },
  },
});

export const { setSelectedOffice, clearSelectedOffice } = officesSlice.actions;
export default officesSlice.reducer;

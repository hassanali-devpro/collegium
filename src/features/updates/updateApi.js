import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const updateApi = createApi({ 
  reducerPath: "updateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const auth = JSON.parse(sessionStorage.getItem("auth"));
      const token = auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getStudentOptionsCount: builder.query({
      query: () => "students/options/count",
    }),
  }),
});

export const { useGetStudentOptionsCountQuery } = updateApi; // ✅ fixed export

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const docApi = createApi({
  reducerPath: "docApi",
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
    // 🔹 Bulk upload documents
    uploadDocuments: builder.mutation({
      query: ({ studentId, formData }) => ({
        url: `students/${studentId}/documents/bulk`,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadDocumentsMutation } = docApi;

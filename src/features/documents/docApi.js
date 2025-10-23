import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const docApi = createApi({
  reducerPath: "docApi",
  baseQuery: baseQueryWithReauth,
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

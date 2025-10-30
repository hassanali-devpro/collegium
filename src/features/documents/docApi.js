import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const docApi = createApi({
  reducerPath: "docApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    uploadDocuments: builder.mutation({
      query: ({ studentId, formData }) => ({
        url: `students/${studentId}/documents/bulk`,
        method: "POST",
        body: formData,
      }),
    }),

    getDocuments: builder.query({
      query: (studentId) => ({
        url: `students/${studentId}/documents`,
        method: "GET",
      }),
    }),
  }),
});

export const { useUploadDocumentsMutation, useGetDocumentsQuery } = docApi;

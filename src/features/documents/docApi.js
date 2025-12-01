import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const docApi = createApi({
  reducerPath: "docApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Documents"],
  endpoints: (builder) => ({

    uploadDocuments: builder.mutation({
      query: ({ studentId, formData }) => ({
        url: `students/${studentId}/documents/bulk`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Documents"],
    }),

    getDocuments: builder.query({
      query: (studentId) => ({
        url: `students/${studentId}/documents`,
        method: "GET",
      }),
      providesTags: ["Documents"],
    }),

    deleteDocument: builder.mutation({
      query: ({ studentId, fieldName, index }) => {
        const url =
          index !== undefined
            ? `students/${studentId}/documents/${fieldName}?index=${index}`
            : `students/${studentId}/documents/${fieldName}`;

        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Documents"],
    }),

  }),
});

export const {
  useUploadDocumentsMutation,
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} = docApi;

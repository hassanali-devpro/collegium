import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const officesApi = createApi({
  reducerPath: "officesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Office"],
  endpoints: (builder) => ({
    getOffices: builder.query({
      query: ({ page = 1, limit = 10 }) => `/offices?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Office", id: _id })),
              { type: "Office", id: "LIST" },
            ]
          : [{ type: "Office", id: "LIST" }],
    }),


    addOffice: builder.mutation({
      query: (newOffice) => ({
        url: "/offices",
        method: "POST",
        body: newOffice,
      }),
      invalidatesTags: [{ type: "Office", id: "LIST" }],
    }),


    updateOffice: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/offices/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Office", id }],
    }),


    deleteOffice: builder.mutation({
      query: (id) => ({
        url: `/offices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Office", id }],
    }),
  }),
});

export const {
  useGetOfficesQuery,
  useAddOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
} = officesApi;

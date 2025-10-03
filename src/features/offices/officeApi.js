import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../app/apiConfig";

export const officesApi = createApi({
  reducerPath: "officesApi",
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

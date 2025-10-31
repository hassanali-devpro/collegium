import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const metaApi = createApi({
  reducerPath: "metaApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCountries: builder.query({
      query: () => `meta/countries`,
    }),
  }),
});

export const { useGetCountriesQuery } = metaApi;



import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const updateApi = createApi({ 
  reducerPath: "updateApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getStudentOptionsCount: builder.query({
      query: () => "students/options/count",
    }),
  }),
});

export const { useGetStudentOptionsCountQuery } = updateApi; // ✅ fixed export

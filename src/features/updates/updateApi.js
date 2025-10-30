import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const updateApi = createApi({ 
  reducerPath: "updateApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getStudentOptionsCount: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.startDate) searchParams.set('startDate', params.startDate);
        if (params.endDate) searchParams.set('endDate', params.endDate);
        if (params.dateField) searchParams.set('dateField', params.dateField);
        const qs = searchParams.toString();
        return `students/options/count${qs ? `?${qs}` : ''}`;
      },
    }),
  }),
});

export const { useGetStudentOptionsCountQuery } = updateApi; // ✅ fixed export

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const agentStudentApi = createApi({
    reducerPath: "agentStudentApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAgentStudents: builder.query({
            query: ({ agentId, page = 1, limit = 10 }) =>
                `students/agent/${agentId}?page=${page}&limit=${limit}`,
            providesTags: ["AgentStudents"],
        }),
    }),
});

export const { useGetAgentStudentsQuery } = agentStudentApi;

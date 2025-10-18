import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const agentStudentApi = createApi({
    reducerPath: "agentStudentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
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
        getAgentStudents: builder.query({
            query: ({ agentId, page = 1, limit = 10 }) =>
                `students/agent/${agentId}?page=${page}&limit=${limit}`,
            providesTags: ["AgentStudents"],
        }),
    }),
});

export const { useGetAgentStudentsQuery } = agentStudentApi;

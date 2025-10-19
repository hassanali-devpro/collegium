import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
    reducerPath: "studentApi",
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
    tagTypes: ["Student"],
    endpoints: (builder) => ({
        // 🔹 GET all students
        getStudents: builder.query({
            query: () => "students",
            providesTags: ["Student"],
        }),

        // 🔹 GET single student by ID
        getStudentById: builder.query({
            query: (id) => `students/${id}`,
            providesTags: ["Student"],
        }),

        // 🔹 ADD new student
        addStudent: builder.mutation({
            query: (newStudent) => ({
                url: "students",
                method: "POST",
                body: newStudent,
            }),
            invalidatesTags: ["Student"],
        }),

        // 🔹 UPDATE existing student
        updateStudent: builder.mutation({
            query: ({ id, ...updatedData }) => ({
                url: `students/${id}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Student"],
        }),

        // 🔹 DELETE a student
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `students/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Student"],
        }),

        getStudentOption: builder.query({
            query: (id) => ({
                url: `students/${id}/options`,
                method: "GET",
            }),
            providesTags: ["Student"],
        }),

        updateStudentOption: builder.mutation({
            query: ({ id, ...updatedData }) => ({
                url: `students/${id}/options`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Student"],
        }),

        // Get student's linked courses/applications
        getStudentApplications: builder.query({
            query: (id) => `students/${id}/courses`,
            providesTags: ["Student"],
        }),
    }),
});

export const {
    useGetStudentsQuery,
    useGetStudentByIdQuery,
    useAddStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
    useGetStudentOptionQuery,
    useUpdateStudentOptionMutation,
    useGetStudentApplicationsQuery,
} = studentApi;

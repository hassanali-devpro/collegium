import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
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
  tagTypes: ["Courses"], 
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: ({ page = 1, limit = 10 }) => `courses?page=${page}&limit=${limit}`,
      providesTags: ["Courses"],
    }),

 
    searchCourses: builder.query({
      query: ({ search, country, type, page = 1, limit = 10 }) => {
        let queryString = `courses?search=${encodeURIComponent(search || "")}&country=${country || ""}&type=${type || ""}&page=${page}&limit=${limit}`;
        return queryString;
      },
      providesTags: ["Courses"],
    }),


    getCourseById: builder.query({
      query: (id) => `courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),


    createCourse: builder.mutation({
      query: (newCourse) => ({
        url: "courses",
        method: "POST",
        body: newCourse,
      }),
      invalidatesTags: ["Courses"],
    }),


    updateCourse: builder.mutation({
      query: ({ id, ...updatedCourse }) => ({
        url: `courses/${id}`,
        method: "PUT",
        body: updatedCourse,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Courses", id },
        "Courses",
      ],
    }),


    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Courses", id },
        "Courses",
      ],
    }),

    // Link student to course
    linkStudentToCourse: builder.mutation({
      query: ({ courseId, studentId }) => ({
        url: `courses/${courseId}/students/${studentId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Courses", "Student", "Applications"],
    }),

    // Unlink student from course
    unlinkStudentFromCourse: builder.mutation({
      query: ({ courseId, studentId }) => ({
        url: `courses/${courseId}/students/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses", "Student", "Applications"],
    }),

    // Get students enrolled in a course
    getCourseStudents: builder.query({
      query: (courseId) => `courses/${courseId}/students`,
      providesTags: (result, error, courseId) => [
        { type: "Courses", id: courseId },
        "Student"
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useSearchCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useLinkStudentToCourseMutation,
  useUnlinkStudentFromCourseMutation,
  useGetCourseStudentsQuery,
} = courseApi;

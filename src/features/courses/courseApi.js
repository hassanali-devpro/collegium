import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Courses"], 
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: ({ page = 1, limit = 10 }) => `courses?page=${page}&limit=${limit}`,
      providesTags: ["Courses"],
    }),

 
    searchCourses: builder.query({
      query: ({ search, country, type, university, intake, feeSort, page = 1, limit = 10 }) => {
        let queryString = `courses?search=${encodeURIComponent(search || "")}&country=${country || ""}&type=${type || ""}&university=${university || ""}&intake=${intake || ""}&feeSort=${feeSort || ""}&page=${page}&limit=${limit}`;
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

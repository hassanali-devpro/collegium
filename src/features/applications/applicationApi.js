import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../app/apiConfig';

export const applicationApi = createApi({
  reducerPath: 'applicationApi',
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
  tagTypes: ['Applications'],
  endpoints: (builder) => ({
    // Get all applications with filtering
    getApplications: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        sortBy = 'applicationDate', 
        sortOrder = 'desc',
        priority = '',
        startDate = '',
        endDate = '',
        dateField = 'applicationDate'
      } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (priority) params.append('priority', priority);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (dateField) params.append('dateField', dateField);
        
        return `applications?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ _id }) => ({ type: 'Applications', id: _id })), 'Applications']
          : ['Applications'],
      // Keep data fresh for 30 seconds to prevent excessive refetches
      keepUnusedDataFor: 30,
    }),

    // Get application by ID
    getApplicationById: builder.query({
      query: (id) => `applications/${id}`,
      providesTags: (result, error, id) => [{ type: 'Applications', id }],
    }),

    // Get applications by student ID
    getApplicationsByStudent: builder.query({
      query: ({ 
        studentId, 
        page = 1, 
        limit = 10, 
        sortBy = 'applicationDate', 
        sortOrder = 'desc',
        priority = ''
      }) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (priority) params.append('priority', priority);
        
        return `applications/student/${studentId}?${params.toString()}`;
      },
      providesTags: ['Applications'],
    }),

    // Get applications by course ID
    getApplicationsByCourse: builder.query({
      query: ({ 
        courseId, 
        page = 1, 
        limit = 10, 
        sortBy = 'applicationDate', 
        sortOrder = 'desc',
        priority = ''
      }) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (priority) params.append('priority', priority);
        
        return `applications/course/${courseId}?${params.toString()}`;
      },
      providesTags: ['Applications'],
    }),

    // Search applications
    searchApplications: builder.query({
      query: ({ 
        q, 
        page = 1, 
        limit = 10, 
        sortBy = 'applicationDate', 
        sortOrder = 'desc' 
      }) => {
        const params = new URLSearchParams();
        params.append('q', q);
        params.append('page', page);
        params.append('limit', limit);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        
        return `applications/search?${params.toString()}`;
      },
      providesTags: ['Applications'],
    }),

    // Get application statistics
    getApplicationStats: builder.query({
      query: () => 'applications/stats',
      providesTags: ['Applications'],
      // Keep stats data fresh for 60 seconds
      keepUnusedDataFor: 60,
    }),

    // Create application
    createApplication: builder.mutation({
      query: (applicationData) => ({
        url: 'applications',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['Applications'],
    }),

    // Update application
    updateApplication: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `applications/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Applications', id }, 'Applications'],
    }),

    // Delete application
    deleteApplication: builder.mutation({
      query: (id) => ({
        url: `applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Applications', id }, 'Applications'],
    }),

    // Add comment to application
    addCommentToApplication: builder.mutation({
      query: ({ applicationId, content }) => ({
        url: `applications/${applicationId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: 'Applications', id: applicationId }, 
        'Applications'
      ],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationsByStudentQuery,
  useGetApplicationsByCourseQuery,
  useSearchApplicationsQuery,
  useGetApplicationStatsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useAddCommentToApplicationMutation,
} = applicationApi;

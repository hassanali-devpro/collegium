import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../app/apiConfig';

export const announcementApi = createApi({
  reducerPath: 'announcementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const auth = JSON.parse(sessionStorage.getItem('auth') || '{}');
      const token = auth?.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Announcement'],
  endpoints: (builder) => ({
    getActiveAnnouncements: builder.query({
      query: () => ({ url: 'announcements/active' }),
      providesTags: ['Announcement'],
      // poll for updates so active window stays fresh
      pollingInterval: 15000,
    }),
    createAnnouncement: builder.mutation({
      query: (payload) => ({ url: 'announcements', method: 'POST', body: payload }),
      invalidatesTags: ['Announcement'],
    }),
    listAnnouncements: builder.query({
      query: (params) => ({ url: 'announcements', params }),
      providesTags: ['Announcement'],
    }),
    updateAnnouncementTimeWindow: builder.mutation({
      query: ({ id, ...body }) => ({ url: `announcements/${id}/time-window`, method: 'PATCH', body }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({ url: `announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Announcement'],
    }),
  }),
});

export const {
  useGetActiveAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useListAnnouncementsQuery,
  useUpdateAnnouncementTimeWindowMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;



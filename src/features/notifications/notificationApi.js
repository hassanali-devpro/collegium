import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../app/apiConfig';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Get token from sessionStorage
            const auth = JSON.parse(sessionStorage.getItem('auth') || '{}');
            const token = auth?.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        // Get all notifications
        getNotifications: builder.query({
            query: ({ isRead, limit = 50 } = {}) => ({
                url: 'notifications',
                params: { isRead, limit }
            }),
            providesTags: ['Notification'],
        }),

        // Mark notification as read
        markNotificationAsRead: builder.mutation({
            query: (notificationId) => ({
                url: `notifications/${notificationId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Mark all notifications as read
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({
                url: 'notifications/read-all',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Delete notification
        deleteNotification: builder.mutation({
            query: (notificationId) => ({
                url: `notifications/${notificationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Delete all notifications
        deleteAllNotifications: builder.mutation({
            query: () => ({
                url: 'notifications',
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
} = notificationApi;


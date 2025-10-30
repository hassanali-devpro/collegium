import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Chats", "Messages"],
  endpoints: (builder) => ({
    // Get user's chats
    getUserChats: builder.query({
      query: (params) => ({
        url: "chats",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Chats"],
    }),

    // Get chat messages
    getChatMessages: builder.query({
      query: ({ chatId, page = 1, limit = 50 }) => ({
        url: `chats/${chatId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
      ],
    }),

    // Create a new chat
    createChat: builder.mutation({
      query: (chatData) => ({
        url: "chats",
        method: "POST",
        body: chatData,
      }),
      invalidatesTags: ["Chats"],
    }),

    // Send a message
    sendMessage: builder.mutation({
      query: ({ chatId, content, messageType = "text", replyTo }) => ({
        url: `chats/${chatId}/messages`,
        method: "POST",
        body: { content, messageType, replyTo },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
        "Chats",
      ],
    }),

    // Edit a message
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `chats/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
      ],
    }),

    // Delete a message
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `chats/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Messages", "Chats"],
    }),

    // Get unread count
    getUnreadCount: builder.query({
      query: (chatId) => ({
        url: "chats/unread-count",
        method: "GET",
        params: chatId ? { chatId } : {},
      }),
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation({
      query: (chatId) => ({
        url: `chats/${chatId}/messages/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: "Messages", id: chatId },
      ],
    }),

    // Get chat participants
    getChatParticipants: builder.query({
      query: (chatId) => ({
        url: `chats/${chatId}/participants`,
        method: "GET",
      }),
    }),

    // Search users
    searchUsers: builder.query({
      query: (params) => ({
        url: "chats/search-users",
        method: "GET",
        params: params || {},
      }),
    }),
  }),
});

export const {
  useGetUserChatsQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useGetUnreadCountQuery,
  useMarkMessagesAsReadMutation,
  useGetChatParticipantsQuery,
  useSearchUsersQuery,
} = chatApi;



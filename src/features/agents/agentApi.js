// src/features/agents/agentApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const agentsApi = createApi({
  reducerPath: "agentsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Agents"],
  endpoints: (builder) => ({
    getAgents: builder.query({
      query: ({ page = 1, limit = 10 }) => `agents?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Agents", id: _id })),
              { type: "Agents", id: "LIST" },
            ]
          : [{ type: "Agents", id: "LIST" }],
    }),

    createAgent: builder.mutation({
      query: (newAgent) => ({
        url: "agents",
        method: "POST",
        body: newAgent,
      }),
      invalidatesTags: [{ type: "Agents", id: "LIST" }],
    }),

    updateAgent: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `agents/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Agents", id },
        { type: "Agents", id: "LIST" },
      ],
    }),

    deleteAgent: builder.mutation({
      query: (id) => ({
        url: `agents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Agents", id },
        { type: "Agents", id: "LIST" },
      ],
    }),

    activateAgent: builder.mutation({
      query: (id) => ({
        url: `agents/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Agents", id },
        { type: "Agents", id: "LIST" },
      ],
    }),

    deactivateAgent: builder.mutation({
      query: (id) => ({
        url: `agents/${id}/deactivate`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Agents", id },
        { type: "Agents", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useActivateAgentMutation,
  useDeactivateAgentMutation,
} = agentsApi;

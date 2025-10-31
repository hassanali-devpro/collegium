import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../app/baseQuery";

export const learningResourceApi = createApi({
  reducerPath: "learningResourceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LearningResources"],
  endpoints: (builder) => ({
    // Get all learning resources
    getLearningResources: builder.query({
      query: () => `learning-resources`,
      providesTags: ["LearningResources"],
    }),

    // Get learning resource by country
    getLearningResourceByCountry: builder.query({
      query: (country) => `learning-resources/${country}`,
      providesTags: (result, error, country) => [
        { type: "LearningResources", id: country },
      ],
    }),

    // Upload file to learning resource
    uploadLearningResourceFile: builder.mutation({
      query: ({ country, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `learning-resources/${country}/upload`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { country }) => [
        { type: "LearningResources", id: country },
        "LearningResources",
      ],
    }),

    // Delete file from learning resource
    deleteLearningResourceFile: builder.mutation({
      query: ({ country, fileId }) => ({
        url: `learning-resources/${country}/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { country }) => [
        { type: "LearningResources", id: country },
        "LearningResources",
      ],
    }),

    // Get download URL for file
    downloadLearningResourceFile: builder.query({
      query: ({ country, fileId }) =>
        `learning-resources/${country}/files/${fileId}/download`,
    }),
  }),
});

export const {
  useGetLearningResourcesQuery,
  useGetLearningResourceByCountryQuery,
  useUploadLearningResourceFileMutation,
  useDeleteLearningResourceFileMutation,
  useLazyDownloadLearningResourceFileQuery,
} = learningResourceApi;


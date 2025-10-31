import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  useGetLearningResourceByCountryQuery,
  useUploadLearningResourceFileMutation,
  useDeleteLearningResourceFileMutation,
  useLazyDownloadLearningResourceFileQuery,
} from "../../features/learningResources/learningResourceApi";
import { useGetCountriesQuery } from "../../features/meta/metaApi";
import { useToastContext } from "../../contexts/ToastContext";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Upload, Download, Trash2, FileText, Loader2 } from "lucide-react";

export default function LearningResources() {
  const { user } = useSelector((state) => state.auth);
  const { success, error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } =
    useConfirmationModal();

  const { data: countriesData } = useGetCountriesQuery();
  const countries = countriesData?.data || [];

  // Default to first country for SuperAdmin
  const [selectedCountry, setSelectedCountry] = useState(
    countries.length > 0 ? countries[0] : ""
  );

  // Update selected country when countries load
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, selectedCountry]);

  const fileInputRef = useRef(null);

  const {
    data: resourceData,
    isLoading,
    refetch,
  } = useGetLearningResourceByCountryQuery(selectedCountry, {
    skip: !selectedCountry,
  });

  const [uploadFile, { isLoading: isUploading }] =
    useUploadLearningResourceFileMutation();
  const [deleteFile, { isLoading: isDeleting }] =
    useDeleteLearningResourceFileMutation();
  const [downloadFile, { isLoading: isDownloading }] =
    useLazyDownloadLearningResourceFileQuery();

  const resource = resourceData?.data;
  const files = resource?.files || [];
  const isSuperAdmin = user?.role === "SuperAdmin";
  const canUpload = files.length < 2;

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedCountry) {
      showError("Please select a country first");
      return;
    }

    if (files.length >= 2) {
      showError("Maximum 2 files allowed per country");
      return;
    }

    try {
      await uploadFile({ country: selectedCountry, file }).unwrap();
      success("File uploaded successfully!");
      refetch();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      showError(err?.data?.message || "Failed to upload file");
    }
  };

  const handleDelete = (fileId, fileName) => {
    showConfirmation({
      title: "Delete File",
      message: `Are you sure you want to delete "${fileName}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteFile({ country: selectedCountry, fileId }).unwrap();
          success("File deleted successfully!");
          refetch();
        } catch (err) {
          console.error("Delete error:", err);
          showError(err?.data?.message || "Failed to delete file");
        }
      },
    });
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const result = await downloadFile({
        country: selectedCountry,
        fileId,
      }).unwrap();

      if (result?.data?.downloadUrl) {
        // Open download URL in new tab
        const link = document.createElement("a");
        link.href = result.data.downloadUrl;
        link.download = fileName || result.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success("Download started!");
      } else {
        showError("Download URL not available");
      }
    } catch (err) {
      console.error("Download error:", err);
      showError(err?.data?.message || "Failed to download file");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Learning Resources
          </h1>
          <p className="text-gray-600">
            {isSuperAdmin
              ? "Manage learning resources by country (Max 2 files per country)"
              : "Download learning resources for your selected country"}
          </p>
        </div>

        {/* Country Selection */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Files for {selectedCountry || "Selected Country"}
              </h2>
              {isSuperAdmin && canUpload && (
                <button
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload File
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No files available for this country</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="text-blue-600 flex-shrink-0" size={24} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.originalName}
                        </p>
                        {file.size && (
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(file._id, file.originalName)}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(file._id, file.originalName)}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </div>
  );
}

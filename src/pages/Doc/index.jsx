import React, { useState } from "react";
import { Trash2, FileText, Loader2, UploadCloud } from "lucide-react";
import { useUploadDocumentsMutation } from "../../features/documents/docApi";
import { useToastContext } from "../../contexts/ToastContext";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const documentTypes = [
  "Profile Picture",
  "Matric Certificate",
  "Matric Marks Sheet",
  "Intermediate Certificate",
  "Intermediate Marks Sheet",
  "Degree",
  "Transcript",
  "Language Test",
  "Passport",
  "Experience Letter",
  "Birth Certificate",
  "Family Registration",
  "Other Documents",
];

const DocumentsPage = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadDocuments] = useUploadDocumentsMutation();
  const { success, error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  // 🔹 Replace with actual student ID (from Redux, params, or context)
  const studentId = "123"; 

  const handleFileSelect = (type, file) => {
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleDelete = (type) => {
    showConfirmation({
      title: "Delete Document",
      message: `Are you sure you want to delete ${type}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        setSelectedFiles((prev) => {
          const updated = { ...prev };
          delete updated[type];
          return updated;
        });
      }
    });
  };

  const handleUploadAll = async () => {
    const filesToUpload = Object.entries(selectedFiles).filter(([_, f]) => f);
    if (filesToUpload.length === 0) {
      showError("Please select at least one file before submitting.");
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach(([type, file]) => {
      formData.append("documents", file); // key name depends on your backend
      formData.append("types", type); // to identify document type
    });

    try {
      setUploading(true);
      await uploadDocuments({ studentId, formData }).unwrap();
      success("All selected files uploaded successfully!");
      setSelectedFiles({});
    } catch (error) {
      console.error(error);
      showError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-[8%]">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <img src="/Logo-R.png" alt="Logo" className="h-16 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">
          Document Upload Center
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Select your documents and click “Submit All” to upload them together.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {documentTypes.map((type) => {
          const selectedFile = selectedFiles[type];
          return (
            <div
              key={type}
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{type}</h3>
                <FileText className="text-blue-500" size={20} />
              </div>

              <div className="flex flex-col gap-3">
                <label className="cursor-pointer w-full bg-gray-100 border p-2 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(type, e.target.files[0] || null)
                    }
                  />
                </label>

                {selectedFile && (
                  <p className="text-sm text-blue-600 truncate italic">
                    Selected: {selectedFile.name}
                  </p>
                )}

                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => handleDelete(type)}
                    className="flex items-center justify-center gap-2 bg-red-100 text-red-600 p-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit All Button */}
      <div className="flex justify-center">
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white ${
            uploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Uploading All...
            </>
          ) : (
            <>
              <UploadCloud size={18} /> Submit
            </>
          )}
        </button>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirmation}
      />
    </div>
  );
};

export default DocumentsPage;

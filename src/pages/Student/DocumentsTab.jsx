import React, { useState } from "react";
import { Trash2, FileText, Loader2, UploadCloud } from "lucide-react";
import { useUploadDocumentsMutation } from "../../features/documents/docApi";
import { useToastContext } from "../../contexts/ToastContext";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const documentTypes = [
  { displayName: "Profile Picture", fieldName: "profilePicture" },
  { displayName: "Matric Certificate", fieldName: "matricCertificate" },
  { displayName: "Matric Marks Sheet", fieldName: "matricMarksSheet" },
  { displayName: "Intermediate Certificate", fieldName: "intermediateCertificate" },
  { displayName: "Intermediate Marks Sheet", fieldName: "intermediateMarkSheet" },
  { displayName: "Degree", fieldName: "degree" },
  { displayName: "Transcript", fieldName: "transcript" },
  { displayName: "Language Test", fieldName: "languageCertificate" },
  { displayName: "Passport", fieldName: "passport" },
  { displayName: "Experience Letter", fieldName: "experienceLetter" },
  { displayName: "Birth Certificate", fieldName: "birthCertificate" },
  { displayName: "Family Registration", fieldName: "familyRegistration" },
  { displayName: "Other Documents", fieldName: "otherDocs" },
];

const DocumentsTab = ({ studentId, onPrev, onNext }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadDocuments] = useUploadDocumentsMutation();
  const { success, error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  const handleFileSelect = (fieldName, file) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleDelete = (fieldName) => {
    const documentType = documentTypes.find(dt => dt.fieldName === fieldName);
    const displayName = documentType?.displayName || fieldName;
    
    showConfirmation({
      title: "Delete Document",
      message: `Are you sure you want to delete ${displayName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        setSelectedFiles((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    });
  };

  const handleUploadAll = async () => {
    if (!studentId) {
      showError("Student ID is required for document upload.");
      return;
    }

    const filesToUpload = Object.entries(selectedFiles).filter(([_, f]) => f);
    if (filesToUpload.length === 0) {
      showError("Please select at least one file before submitting.");
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach(([fieldName, file]) => {
      // Use the correct field name for each document type
      formData.append(fieldName, file);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Document Upload Center
        </h3>
        <p className="text-gray-500 text-sm">
          Select your documents and click "Submit All" to upload them together.
        </p>
        {studentId && (
          <p className="text-blue-600 text-sm mt-1">
            Student ID: {studentId}
          </p>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {documentTypes.map((docType) => {
          const selectedFile = selectedFiles[docType.fieldName];
          return (
            <div
              key={docType.fieldName}
              className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 text-sm">{docType.displayName}</h4>
                <FileText className="text-blue-500" size={16} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="cursor-pointer w-full bg-white border border-gray-300 p-2 rounded text-xs text-gray-600 hover:bg-gray-50 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(docType.fieldName, e.target.files[0] || null)
                    }
                  />
                </label>

                {selectedFile && (
                  <p className="text-xs text-blue-600 truncate italic">
                    Selected: {selectedFile.name}
                  </p>
                )}

                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => handleDelete(docType.fieldName)}
                    className="flex items-center justify-center gap-1 bg-red-100 text-red-600 p-1 rounded text-xs font-medium hover:bg-red-200 transition"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit All Button */}
      <div className="flex justify-center mb-6">
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
              <UploadCloud size={18} /> Submit All Documents
            </>
          )}
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Next
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

export default DocumentsTab;

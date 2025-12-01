import React, { useState, useEffect } from "react";
import { Trash2, FileText, Loader2, UploadCloud, Eye } from "lucide-react";
import {
  useUploadDocumentsMutation,
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} from "../../features/documents/docApi";
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
  { displayName: "Recommendation Letter 1", fieldName: "recommendationLetter1" },
  { displayName: "Recommendation Letter 2", fieldName: "recommendationLetter2" },
  { displayName: "Experience Letter", fieldName: "experienceLetter" },
  { displayName: "Birth Certificate", fieldName: "birthCertificate" },
  { displayName: "Family Registration", fieldName: "familyRegistration" },
  { displayName: "Other Document", fieldName: "otherDocs" },
];

const DocumentsTab = ({ studentId, onPrev, onNext }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);

  const [uploadDocuments] = useUploadDocumentsMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const { data, error, isLoading, refetch } = useGetDocumentsQuery(studentId, {
    skip: !studentId,
  });

  const { success, error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  useEffect(() => {
    if (data) console.log("📄 Documents API Response:", data);
    if (error) console.error("❌ Error fetching documents:", error);
  }, [data, error]);

  const handleFileSelect = (fieldName, file) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleUploadAll = async () => {
    if (!studentId) return showError("Student ID is required.");

    const filesToUpload = Object.entries(selectedFiles).filter(([_, f]) => f);
    if (filesToUpload.length === 0) return showError("Please select at least one file.");

    const formData = new FormData();
    filesToUpload.forEach(([fieldName, file]) => formData.append(fieldName, file));

    try {
      setUploading(true);
      await uploadDocuments({ studentId, formData }).unwrap();
      success("All selected files uploaded successfully!");
      setSelectedFiles({});
      refetch();
    } catch (error) {
      console.error(error);
      showError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ----------- DELETE LOGIC UPDATE -----------
  const handleDelete = (fieldName, index = null) => {
    const docType = documentTypes.find((d) => d.fieldName === fieldName);
    const displayName = docType?.displayName || fieldName;

    showConfirmation({
      title: "Delete Document",
      message:
        index !== null
          ? `Are you sure you want to delete ${displayName} #${index + 1}?`
          : `Are you sure you want to delete ${displayName}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDocument({ studentId, fieldName, index }).unwrap();
          success(`${displayName} deleted successfully.`);
          refetch();
        } catch (err) {
          console.error(err);
          showError("Failed to delete document. Please try again.");
        }
      },
    });
  };
  // -------------------------------------------

  const uploadedDocs = data?.data?.documents || {};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Document Upload Center</h3>
        <p className="text-gray-500 text-sm">
          Select your documents and click "Submit All" to upload them together.
        </p>
        {studentId && (
          <p className="text-blue-600 text-sm mt-1">Student ID: {studentId}</p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {documentTypes.map((docType) => {
          const uploaded = uploadedDocs[docType.fieldName];
          const selectedFile = selectedFiles[docType.fieldName];

          return (
            <div key={docType.fieldName} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition">
              
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 text-sm">{docType.displayName}</h4>
                <FileText className="text-blue-500" size={16} />
              </div>

              {/* File input */}
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer w-full bg-white border border-gray-300 p-2 rounded text-xs text-gray-600 hover:bg-gray-50 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileSelect(docType.fieldName, e.target.files[0] || null)}
                  />
                </label>

                {/* Selected File */}
                {selectedFile && (
                  <p className="text-xs text-blue-600 truncate italic">
                    Selected: {selectedFile.name}
                  </p>
                )}

                {/* MULTIPLE otherDocs display */}
                {docType.fieldName === "otherDocs" && Array.isArray(uploaded) && (
                  <div className="space-y-2 mt-2">
                    {uploaded.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs text-gray-700 bg-white border rounded p-2">
                        <a
                          href={file.path || file.s3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Eye size={12} /> {file.originalName}
                        </a>

                        <button
                          onClick={() => handleDelete(docType.fieldName, index)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single file uploaded */}
                {uploaded && docType.fieldName !== "otherDocs" && (
                  <div className="flex items-center justify-between text-xs text-gray-700 bg-white border rounded p-2">
                    <a
                      href={uploaded.path || uploaded.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Eye size={12} /> View
                    </a>

                    <button
                      onClick={() => handleDelete(docType.fieldName)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit All */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleUploadAll}
          disabled={uploading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white ${
            uploading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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

      {/* Navigation */}
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
        onClose={hideConfirmation}
      />
    </div>
  );
};

export default DocumentsTab;

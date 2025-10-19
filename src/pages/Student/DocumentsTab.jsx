import React, { useState } from "react";
import { Trash2, FileText, Loader2, UploadCloud } from "lucide-react";
import { useUploadDocumentsMutation } from "../../features/documents/docApi";

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

const DocumentsTab = ({ studentId, onPrev, onNext }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadDocuments] = useUploadDocumentsMutation();

  const handleFileSelect = (type, file) => {
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleDelete = (type) => {
    if (window.confirm(`Delete ${type}?`)) {
      setSelectedFiles((prev) => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    }
  };

  const handleUploadAll = async () => {
    if (!studentId) {
      alert("Student ID is required for document upload.");
      return;
    }

    const filesToUpload = Object.entries(selectedFiles).filter(([_, f]) => f);
    if (filesToUpload.length === 0) {
      alert("Please select at least one file before submitting.");
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
      alert("All selected files uploaded successfully!");
      setSelectedFiles({});
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
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
        {documentTypes.map((type) => {
          const selectedFile = selectedFiles[type];
          return (
            <div
              key={type}
              className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 text-sm">{type}</h4>
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
                      handleFileSelect(type, e.target.files[0] || null)
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
                    onClick={() => handleDelete(type)}
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
    </div>
  );
};

export default DocumentsTab;

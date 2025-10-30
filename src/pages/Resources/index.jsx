import React, { useState, useRef } from "react";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const COUNTRIES = [
  "France",
  "Italy",
  "Cyprus",
  "Malta",
  "Sweden",
  "Finland",
  "Germany",
  "Belgium",
  "UK",
  "Spain",
  "USA",
  "Australia",
  "Canada",
  "Hungary",
  "Netherlands",
  "Denmark",
  "Lithuania",
  "Estonia",
  "Belarus",
  "Georgia"
];


export default function LearningResources() {
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();
  const [data, setData] = useState(
    COUNTRIES.reduce((acc, country) => {
      acc[country] = [
        {
          id: `${country}-pdf1`,
          name: `${country}-Resource1.pdf`,
          url: `/resources/${country}/resource1.pdf`,
          type: "application/pdf",
        },
        {
          id: `${country}-ppt1`,
          name: `${country}-Slides1.pptx`,
          url: `/resources/${country}/slides1.pptx`,
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        },
      ];
      return acc;
    }, {})
  );

  const fileInputsRef = useRef({});

  const handleUpload = (country, files) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((file) => ({
      id: `${country}-${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setData((prev) => ({
      ...prev,
      [country]: [...(prev[country] || []), ...newFiles],
    }));

    if (fileInputsRef.current[country]) fileInputsRef.current[country].value = "";
  };

  const handleDelete = (country, id) => {
    const file = data[country]?.find(f => f.id === id);
    const fileName = file?.name || 'this file';
    
    showConfirmation({
      title: "Delete File",
      message: `Are you sure you want to delete ${fileName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          [country]: (prev[country] || []).filter((f) => f.id !== id),
        }));
      }
    });
  };

  const handleDownload = (file) => {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col items-center mb-8">
        <img src="/Logo-R.png" alt="Company Logo" className="w-24 h-auto mb-3" />
        <h1 className="text-xl font-semibold text-gray-800">Learning Resources</h1>
      </header>

      <div className="space-y-5">
        {COUNTRIES.map((country) => (
          <section key={country} className="border border-gray-200 rounded-lg p-4 bg-white shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-700">{country}</h2>

              <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                Upload
                <input
                  ref={(el) => (fileInputsRef.current[country] = el)}
                  onChange={(e) => handleUpload(country, e.target.files)}
                  multiple
                  accept=".pdf,.ppt,.pptx"
                  type="file"
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-3">
              {(data[country] || []).length === 0 ? (
                <p className="text-sm text-gray-400">No files available.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {(data[country] || []).map((file) => (
                    <li key={file.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <FileIcon name={file.name} type={file.type} />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(country, file.id)}
                          className="text-xs px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
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
}

function FileIcon({ name, type }) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const isPdf = ext === "pdf" || type === "application/pdf";
  const isPpt = ["ppt", "pptx"].includes(ext) || type.includes("presentation");

  return (
    <div
      className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded ${
        isPdf
          ? "bg-red-100 text-red-600"
          : isPpt
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isPdf ? "PDF" : isPpt ? "PPT" : ext.toUpperCase()}
    </div>
  );
}

"use client";
import { useState, useRef } from "react";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function FileUpload({
  onFileSelect,
  accept = ".pdf",
  maxSize = 10 * 1024 * 1024,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError("");

    if (
      accept &&
      !accept
        .split(",")
        .some((type) =>
          file.name.toLowerCase().endsWith(type.trim().replace(".", ""))
        )
    ) {
      setError(`Please select a valid file type: ${accept}`);
      return;
    }

    if (file.size > maxSize) {
      setError(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 rounded-lg p-6 transition-colors duration-300 ${
          dragActive
            ? "border-blue-500 bg-[#1c2333]"
            : selectedFile
            ? "border-green-500 bg-[#1e2e28]"
            : error
            ? "border-red-500 bg-[#2a1a1a]"
            : "border-gray-700 bg-[#1a1a2e] hover:bg-[#22223d]"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {selectedFile ? (
          <div className="text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <div className="flex items-center justify-center space-x-2">
              <p className="text-sm font-medium text-green-300">
                {selectedFile.name}
              </p>
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="font-medium text-blue-400 hover:text-blue-500 transition-colors duration-200"
                >
                  Click to upload
                </button>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept} up to {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}

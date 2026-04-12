"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  label: string;
  onFile: (file: File) => void;
  file: File | null;
  accept?: string;
}

export default function UploadZone({ label, onFile, file, accept }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const borderStyle = dragOver
    ? { borderColor: "#378ADD", backgroundColor: "#EFF6FF" }
    : file
    ? { borderColor: "#5DCAA5", backgroundColor: "#E1F5EE" }
    : { borderColor: "#E8EAED", backgroundColor: "#FAFAFA" };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="relative border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition-all duration-200 hover:border-[#378ADD] hover:bg-[#EFF6FF]/30"
      style={borderStyle}
    >
      <input type="file" accept={accept || "image/*"} onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      {file ? (
        <div className="space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "#E1F5EE" }}>
            <svg className="w-5 h-5" style={{ color: "#085041" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "#085041" }}>{file.name}</p>
          <p className="text-xs" style={{ color: "#5DCAA5" }}>{(file.size / 1024).toFixed(0)} KB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1EFE8" }}>
            <svg className="w-5 h-5" style={{ color: "#8A8985" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#3D3D3A" }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#8A8985" }}>Drag & drop or click to browse</p>
            <p className="text-xs" style={{ color: "#A1A09D" }}>JPEG, PNG, WebP — max 20MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps { label: string; onFile: (file: File) => void; file: File | null; accept?: string; }

export default function UploadZone({ label, onFile, file, accept }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }, [onFile]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) onFile(f); }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="relative text-center cursor-pointer transition-all duration-200"
      style={{
        border: `2px dashed ${dragOver ? "#4f46e5" : file ? "#10b981" : "#cbd5e1"}`,
        borderRadius: 16,
        padding: 48,
        background: dragOver ? "rgba(99,102,241,0.05)" : file ? "#ecfdf5" : "transparent",
      }}
    >
      <input type="file" accept={accept || "image/*"} onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      {file ? (
        <div className="space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: "#d1fae5" }}>
            <svg className="w-5 h-5" style={{ color: "#065f46" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#065f46" }}>{file.name}</p>
          <p className="text-xs" style={{ color: "#10b981" }}>{(file.size / 1024).toFixed(0)} KB</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-colors duration-200" style={{ background: "#f1f5f9" }}>
            <svg className="w-6 h-6 transition-colors duration-200" style={{ color: dragOver ? "#6366f1" : "#94a3b8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#334155" }}>{label}</p>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Drag & drop or click to browse</p>
            <p className="text-[11px]" style={{ color: "#94a3b8" }}>JPEG, PNG, WebP — max 20MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

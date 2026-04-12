"use client";

import { useState, useId } from "react";
import UploadZone from "@/components/UploadZone";
import ScanAnimation from "@/components/ScanAnimation";
import VerificationResultCard from "@/components/VerificationResult";
import { VerificationResult } from "@/lib/types";

type AppState = "upload" | "scanning" | "result" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [showCrossDoc, setShowCrossDoc] = useState(false);
  const uid = useId();

  async function handleVerify() {
    if (!idFile) return;
    setState("scanning");
    setError("");
    try {
      const formData = new FormData();
      formData.append("idImage", idFile);
      if (secondFile && showCrossDoc) formData.append("secondDocument", secondFile);
      const res = await fetch("/api/verify", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.detail || "Verification failed");
      }
      setResult(await res.json());
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setState("upload"); setIdFile(null); setSecondFile(null); setResult(null); setError(""); setShowCrossDoc(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-[1100px] mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-[18px] font-bold text-white">VerifyID</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium px-3 py-1 rounded-[20px]" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>Notary Everyday</span>
            <span className="text-[12px] text-slate-400 hidden sm:inline">VillageHacks 2026</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 py-8">
        {state === "upload" && (
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold" style={{ color: "#0f172a" }}>ID Verification</h1>
              <p className="text-sm mt-1.5" style={{ color: "#64748b" }}>Upload a government-issued ID to verify authenticity and extract data.</p>
            </div>
            <div className="bg-white p-7 space-y-5" style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.02)" }}>
              <UploadZone label="Upload Primary ID" onFile={setIdFile} file={idFile} />
              <div className="flex items-center justify-between">
                <label htmlFor={uid} className="text-sm font-medium" style={{ color: "#334155" }}>Cross-document matching</label>
                <button id={uid} onClick={() => setShowCrossDoc(!showCrossDoc)}
                  className="relative w-10 h-[22px] rounded-full transition-colors duration-200"
                  style={{ background: showCrossDoc ? "#6366f1" : "#e2e8f0" }}>
                  <div className="absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform duration-200"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transform: showCrossDoc ? "translateX(22px)" : "translateX(3px)" }} />
                </button>
              </div>
              {showCrossDoc && <UploadZone label="Upload Supporting Document" onFile={setSecondFile} file={secondFile} />}
              <button onClick={handleVerify} disabled={!idFile}
                className="w-full py-3 rounded-[10px] text-white text-sm font-semibold transition-all duration-150"
                style={idFile ? { background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" } : { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }}>
                Verify Document
              </button>
            </div>
            <p className="text-[12px] text-center mt-4 italic" style={{ color: "#94a3b8" }}>For demonstration purposes. No PII is stored.</p>
          </div>
        )}

        {state === "scanning" && <ScanAnimation />}
        {state === "result" && result && <VerificationResultCard result={result} onReset={handleReset} />}

        {state === "error" && (
          <div className="max-w-sm mx-auto text-center py-16 animate-fade-in-up">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "#fef2f2" }}>
              <svg className="w-6 h-6" style={{ color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: "#0f172a" }}>Verification Failed</h3>
            <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>
            <button onClick={handleReset} className="mt-5 px-6 py-2.5 rounded-[10px] text-white text-xs font-semibold transition-all duration-150"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}>Try Again</button>
          </div>
        )}
      </main>
    </div>
  );
}

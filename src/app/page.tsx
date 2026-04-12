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
      if (secondFile && showCrossDoc) {
        formData.append("secondDocument", secondFile);
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.detail || "Verification failed");
      }

      const data = await res.json();
      setResult(data);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setState("upload");
    setIdFile(null);
    setSecondFile(null);
    setResult(null);
    setError("");
    setShowCrossDoc(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-900">VerifyID</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">Notary Everyday</span>
            <span className="text-slate-400 hidden sm:inline">VillageHacks 2026</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {state === "upload" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-xl font-semibold text-slate-900">ID Verification</h1>
              <p className="text-sm text-slate-500 mt-1">Upload a government-issued ID to verify authenticity and extract data.</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
              <UploadZone label="Upload Primary ID" onFile={setIdFile} file={idFile} />

              <div className="flex items-center justify-between">
                <label htmlFor={uid} className="text-sm text-slate-600">Cross-document matching</label>
                <button
                  id={uid}
                  onClick={() => setShowCrossDoc(!showCrossDoc)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${showCrossDoc ? "bg-blue-500" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${showCrossDoc ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>

              {showCrossDoc && (
                <UploadZone label="Upload Supporting Document" onFile={setSecondFile} file={secondFile} />
              )}

              <button
                onClick={handleVerify}
                disabled={!idFile}
                className={`w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  idFile
                    ? "bg-blue-600 hover:bg-blue-700 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Verify Document
              </button>
            </div>

            <p className="text-xs text-center text-slate-400 mt-4">
              For demonstration purposes. No PII is stored.
            </p>
          </div>
        )}

        {state === "scanning" && <ScanAnimation />}

        {state === "result" && result && (
          <div>
            <VerificationResultCard result={result} onReset={handleReset} />
          </div>
        )}

        {state === "error" && (
          <div className="max-w-sm mx-auto text-center py-16">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Verification Failed</h3>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button onClick={handleReset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

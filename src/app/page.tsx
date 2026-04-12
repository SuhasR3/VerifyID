"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">VerifyID</h1>
              <p className="text-xs text-slate-400">AI-Powered Document Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Notary Everyday
            </span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
              VillageHacks 2026
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {state === "upload" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold text-slate-900">
                ID Verification Scan
              </h2>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Upload a government-issued ID to verify authenticity, extract data, and check notarial compliance.
              </p>
            </div>

            {/* Level badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                L1 Authenticity
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                L2 Extraction
              </span>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${showCrossDoc ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-400"}`}>
                L3 Matching {showCrossDoc ? "ON" : "OFF"}
              </span>
              <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-medium">
                L4 Compliance
              </span>
            </div>

            {/* Upload zones */}
            <div className="max-w-md mx-auto space-y-4">
              <UploadZone
                label="Upload Primary ID"
                onFile={setIdFile}
                file={idFile}
              />

              {/* Cross-doc toggle */}
              <div className="flex items-center justify-between px-1">
                <label className="text-sm text-slate-600 cursor-pointer" htmlFor="crossdoc">
                  Enable cross-document matching (Level 3)
                </label>
                <button
                  id="crossdoc"
                  onClick={() => setShowCrossDoc(!showCrossDoc)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${showCrossDoc ? "bg-blue-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showCrossDoc ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              {showCrossDoc && (
                <UploadZone
                  label="Upload Supporting Document"
                  onFile={setSecondFile}
                  file={secondFile}
                />
              )}

              <button
                onClick={handleVerify}
                disabled={!idFile}
                className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${
                  idFile
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-500/25 cursor-pointer"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                Verify Document
              </button>

              <p className="text-xs text-center text-slate-400">
                For demonstration purposes. Uses synthetic or sample data. No PII is stored.
              </p>
            </div>
          </div>
        )}

        {state === "scanning" && <ScanAnimation />}

        {state === "result" && result && (
          <div className="space-y-4">
            <VerificationResultCard result={result} />
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Verify Another Document
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Verification Failed</h3>
            <p className="text-sm text-red-500 mt-2">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-slate-400">
          <span>VerifyID &mdash; Built for VillageHacks 2026</span>
          <span>Powered by Gemini Vision AI</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useId, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import UploadZone from "@/components/UploadZone";
import ScanAnimation from "@/components/ScanAnimation";
import VerificationResultCard from "@/components/VerificationResult";
import { VerificationResult } from "@/lib/types";

const FaceMatchInline = dynamic(() => import("@/components/FaceMatchInline"), { ssr: false });

type AppState = "upload" | "selfie-capture" | "scanning" | "result" | "error";

interface FaceResult {
  match: boolean;
  distance: number;
  confidence: number;
  selfieDataUrl: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [faceResult, setFaceResult] = useState<FaceResult | null>(null);
  const [showFaceMatch, setShowFaceMatch] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCrossDoc, setShowCrossDoc] = useState(false);
  const selfieFileRef = useRef<Blob | null>(null);
  const uid = useId();

  function handleVerifyClick() {
    if (!idFile) return;
    if (showFaceMatch) {
      // Go to selfie capture first
      setState("selfie-capture");
    } else {
      startVerification();
    }
  }

  function handleSelfieCaptured(dataUrl: string, blob: Blob) {
    selfieFileRef.current = blob;
    // Now start the actual verification + face comparison in parallel
    startVerification(dataUrl);
  }

  async function startVerification(selfieDataUrl?: string) {
    setState("scanning");
    setError("");
    try {
      // Start ID verification
      const formData = new FormData();
      formData.append("idImage", idFile!);
      if (secondFile && showCrossDoc) formData.append("secondDocument", secondFile);

      const verifyPromise = fetch("/api/verify", { method: "POST", body: formData })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || errData.detail || "Verification failed");
          }
          return res.json();
        });

      // Start face comparison in parallel if selfie was captured
      let facePromise: Promise<FaceResult | null> = Promise.resolve(null);
      if (selfieDataUrl && showFaceMatch && idFile) {
        facePromise = runFaceComparison(idFile, selfieDataUrl);
      }

      const [verifyResult, faceMatchResult] = await Promise.all([verifyPromise, facePromise]);

      setResult(verifyResult);
      setFaceResult(faceMatchResult);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  async function runFaceComparison(idImageFile: File, selfieDataUrl: string): Promise<FaceResult> {
    const faceapi = await import("face-api.js");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    // ID face
    const idUrl = URL.createObjectURL(idImageFile);
    const idImg = await faceapi.fetchImage(idUrl);
    const idDetection = await faceapi
      .detectSingleFace(idImg, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    URL.revokeObjectURL(idUrl);

    if (!idDetection) {
      return { match: false, distance: 1, confidence: 0, selfieDataUrl };
    }

    // Selfie face
    const selfieImg = await faceapi.fetchImage(selfieDataUrl);
    const selfieDetection = await faceapi
      .detectSingleFace(selfieImg, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!selfieDetection) {
      return { match: false, distance: 1, confidence: 0, selfieDataUrl };
    }

    const distance = faceapi.euclideanDistance(idDetection.descriptor, selfieDetection.descriptor);
    return {
      match: distance < 0.5,
      distance: Math.round(distance * 1000) / 1000,
      confidence: Math.max(0, Math.min(1, 1 - distance)),
      selfieDataUrl,
    };
  }

  function handleReset() {
    setState("upload"); setIdFile(null); setSecondFile(null); setResult(null);
    setFaceResult(null); setError(""); setShowCrossDoc(false); setShowFaceMatch(false);
    selfieFileRef.current = null;
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
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

        {/* ── UPLOAD ── */}
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
                <ToggleSwitch on={showCrossDoc} onToggle={() => setShowCrossDoc(!showCrossDoc)} id={uid} />
              </div>
              {showCrossDoc && <UploadZone label="Upload Supporting Document" onFile={setSecondFile} file={secondFile} />}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium" style={{ color: "#334155" }}>Face verification</label>
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>Capture a live selfie to compare against ID photo</p>
                </div>
                <ToggleSwitch on={showFaceMatch} onToggle={() => setShowFaceMatch(!showFaceMatch)} />
              </div>
              <button onClick={handleVerifyClick} disabled={!idFile}
                className="w-full py-3 rounded-[10px] text-white text-sm font-semibold transition-all duration-150"
                style={idFile ? { background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" } : { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }}>
                {showFaceMatch ? "Next: Capture Selfie" : "Verify Document"}
              </button>
            </div>
            <p className="text-[12px] text-center mt-4 italic" style={{ color: "#94a3b8" }}>For demonstration purposes. No PII is stored.</p>
          </div>
        )}

        {/* ── SELFIE CAPTURE (before scanning) ── */}
        {state === "selfie-capture" && (
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <SelfieCaptureScreen onCapture={handleSelfieCaptured} onSkip={() => startVerification()} />
          </div>
        )}

        {/* ── SCANNING ── */}
        {state === "scanning" && <ScanAnimation />}

        {/* ── RESULTS ── */}
        {state === "result" && result && (
          <VerificationResultCard result={result} faceResult={faceResult} idFile={idFile} onReset={handleReset} />
        )}

        {/* ── ERROR ── */}
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

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function ToggleSwitch({ on, onToggle, id }: { on: boolean; onToggle: () => void; id?: string }) {
  return (
    <button id={id} onClick={onToggle}
      className="relative w-10 h-[22px] rounded-full transition-colors duration-200"
      style={{ background: on ? "#6366f1" : "#e2e8f0" }}>
      <div className="absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform duration-200"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transform: on ? "translateX(22px)" : "translateX(3px)" }} />
    </button>
  );
}

// ─── Selfie Capture Screen ───────────────────────────────────────────────────
function SelfieCaptureScreen({ onCapture, onSkip }: { onCapture: (dataUrl: string, blob: Blob) => void; onSkip: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setCamError("Camera access denied. Please allow camera permissions.");
      }
    })();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    canvas.toBlob((blob) => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (blob) onCapture(dataUrl, blob);
    }, "image/jpeg", 0.9);
  }, [onCapture]);

  if (camError) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px]" style={{ color: "#ef4444" }}>{camError}</p>
        <button onClick={onSkip} className="mt-4 text-[12px] font-medium" style={{ color: "#6366f1" }}>Skip face verification</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold" style={{ color: "#0f172a" }}>Capture Selfie</h2>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Position your face in the frame for identity comparison</p>
      </div>

      <div className="relative overflow-hidden mx-auto" style={{ maxWidth: 420, borderRadius: 16, border: "2px solid #e2e8f0", background: "#000" }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ transform: "scaleX(-1)", borderRadius: 14 }} />
        {/* Face guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-44 h-56 border-2 border-dashed rounded-[40%] opacity-40" style={{ borderColor: "#6366f1" }} />
        </div>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.8)" }}>
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={capture} disabled={!ready}
          className="px-8 py-3 text-[13px] font-semibold text-white rounded-[10px] transition-all duration-150"
          style={ready ? { background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" } : { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }}>
          Capture & Verify
        </button>
        <button onClick={onSkip} className="px-6 py-3 text-[13px] font-medium rounded-[10px] transition-colors"
          style={{ color: "#64748b", border: "1px solid #e2e8f0" }}>
          Skip
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

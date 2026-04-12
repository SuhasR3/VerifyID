"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type FaceApi = typeof import("face-api.js");
type MatchState = "idle" | "loading-models" | "webcam-ready" | "capturing" | "comparing" | "result";

interface FaceMatchResult {
  match: boolean;
  distance: number;
  confidence: number;
}

export default function FaceMatch({ idImageFile }: { idImageFile: File }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceapi, setFaceapi] = useState<FaceApi | null>(null);
  const [state, setState] = useState<MatchState>("idle");
  const [result, setResult] = useState<FaceMatchResult | null>(null);
  const [error, setError] = useState<string>("");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    setState("loading-models");
    setError("");
    try {
      const fa = await import("face-api.js");
      await fa.nets.tinyFaceDetector.loadFromUri("/models");
      await fa.nets.faceLandmark68Net.loadFromUri("/models");
      await fa.nets.faceRecognitionNet.loadFromUri("/models");
      setFaceapi(fa);
      setState("webcam-ready");
    } catch (err) {
      setError("Failed to load face recognition models. " + (err instanceof Error ? err.message : ""));
      setState("idle");
    }
  }, []);

  // Start webcam
  useEffect(() => {
    if (state !== "webcam-ready") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions.");
        setState("idle");
      }
    })();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [state]);

  // Capture selfie and compare
  const captureAndCompare = useCallback(async () => {
    if (!faceapi || !videoRef.current || !canvasRef.current) return;
    setState("capturing");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setSelfieDataUrl(canvas.toDataURL("image/jpeg", 0.9));

    // Stop webcam
    streamRef.current?.getTracks().forEach(t => t.stop());

    setState("comparing");

    try {
      // Get face descriptor from ID image
      const idImageUrl = URL.createObjectURL(idImageFile);
      const idImg = await faceapi.fetchImage(idImageUrl);
      const idDetection = await faceapi
        .detectSingleFace(idImg, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      URL.revokeObjectURL(idImageUrl);

      if (!idDetection) {
        setError("No face detected in the ID image. Make sure the ID photo is clearly visible.");
        setState("idle");
        return;
      }

      // Get face descriptor from selfie
      const selfieDetection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!selfieDetection) {
        setError("No face detected in selfie. Please try again with better lighting.");
        setState("idle");
        return;
      }

      // Compare
      const distance = faceapi.euclideanDistance(
        idDetection.descriptor,
        selfieDetection.descriptor
      );

      const match = distance < 0.5;
      const confidence = Math.max(0, Math.min(1, 1 - distance));

      setResult({ match, distance: Math.round(distance * 1000) / 1000, confidence });
      setState("result");
    } catch (err) {
      setError("Face comparison failed. " + (err instanceof Error ? err.message : ""));
      setState("idle");
    }
  }, [faceapi, idImageFile]);

  const reset = () => {
    setResult(null);
    setSelfieDataUrl("");
    setError("");
    setState("idle");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (state === "idle") {
    return (
      <div className="text-center py-6">
        <button onClick={loadModels}
          className="px-6 py-3 text-[13px] font-semibold text-white rounded-[10px] transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
          Start Face Verification
        </button>
        {error && <p className="text-[13px] mt-3" style={{ color: "#ef4444" }}>{error}</p>}
      </div>
    );
  }

  if (state === "loading-models") {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 mx-auto border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-[13px] mt-3" style={{ color: "#64748b" }}>Loading face recognition models...</p>
        <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>~7MB download, runs entirely in your browser</p>
      </div>
    );
  }

  if (state === "webcam-ready" || state === "capturing") {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden mx-auto" style={{ maxWidth: 400, borderRadius: 16, border: "2px solid #e2e8f0" }}>
          <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ transform: "scaleX(-1)", borderRadius: 14 }} />
          {/* Face guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-60 border-2 border-dashed rounded-[40%] opacity-40" style={{ borderColor: "#6366f1" }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13px] mb-3" style={{ color: "#64748b" }}>Position your face in the guide and capture</p>
          <button onClick={captureAndCompare}
            className="px-8 py-3 text-[13px] font-semibold text-white rounded-[10px] transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            Capture & Compare
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  if (state === "comparing") {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 mx-auto border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-[13px] mt-3" style={{ color: "#64748b" }}>Comparing faces...</p>
      </div>
    );
  }

  // Result
  if (state === "result" && result) {
    const matchPct = Math.round(result.confidence * 100);
    const color = result.match ? "#10b981" : "#ef4444";
    const bg = result.match
      ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
      : "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)";

    return (
      <div className="space-y-4">
        <div className="rounded-[16px] p-5" style={{ background: bg, borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>
              {result.match ? "✓" : "✗"}
            </span>
            <div>
              <h3 className="text-[15px] font-bold" style={{ color: "#0f172a" }}>
                {result.match ? "Face Match Confirmed" : "Face Mismatch Detected"}
              </h3>
              <p className="text-[12px]" style={{ color: "#64748b" }}>
                Similarity: {matchPct}% · Distance: {result.distance}
              </p>
            </div>
          </div>
          {/* Side by side preview */}
          {selfieDataUrl && (
            <div className="flex gap-3 mt-3">
              <div className="text-center">
                <p className="text-[10px] uppercase mb-1" style={{ color: "#94a3b8", letterSpacing: "1px" }}>Selfie</p>
                <img src={selfieDataUrl} alt="Selfie" className="w-20 h-20 rounded-lg object-cover" style={{ border: `2px solid ${color}`, transform: "scaleX(-1)" }} />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase mb-1" style={{ color: "#94a3b8", letterSpacing: "1px" }}>ID Photo</p>
                <img src={URL.createObjectURL(idImageFile)} alt="ID" className="w-20 h-20 rounded-lg object-cover" style={{ border: `2px solid ${color}` }} />
              </div>
            </div>
          )}
        </div>
        <div className="text-center">
          <button onClick={reset} className="text-[12px] font-medium transition-colors" style={{ color: "#6366f1" }}
            onMouseEnter={e => e.currentTarget.style.color = "#4f46e5"} onMouseLeave={e => e.currentTarget.style.color = "#6366f1"}>
            Retry Face Verification
          </button>
        </div>
      </div>
    );
  }

  return null;
}

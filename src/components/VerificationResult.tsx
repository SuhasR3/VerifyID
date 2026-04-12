"use client";

import { VerificationResult as VR } from "@/lib/types";

function pct(v: number) { return Math.round(v * 100); }

// ─── Status Pill ─────────────────────────────────────────────────────────────
function StatusPill({ status, label }: { status: "pass" | "fail" | "warn" | "na"; label: string }) {
  const s = {
    pass: { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
    fail: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
    warn: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    na: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  }[status];
  return <span className="text-[12px] font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: "4px 14px", display: "inline-block" }}>{label}</span>;
}

// ─── Confidence Badge ────────────────────────────────────────────────────────
function ConfBadge({ value }: { value: number }) {
  const p = pct(value);
  const s = p >= 80 ? { bg: "#ecfdf5", color: "#065f46" } : p >= 40 ? { bg: "#fffbeb", color: "#92400e" } : { bg: "#fef2f2", color: "#991b1b" };
  return <span className="text-[11px] font-semibold font-mono-data" style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "3px 8px" }}>{p}%</span>;
}

// ─── Check Row ───────────────────────────────────────────────────────────────
function CheckRow({ label, value }: { label: string; value: string }) {
  const ok = ["valid", "match", "detected", "present", "good", "intact", "photo_limited"].includes(value);
  const warn = ["unclear", "acceptable", "suspicious", "damaged", "not_applicable"].includes(value);
  const bc = ok ? "#10b981" : warn ? "#f59e0b" : "#ef4444";
  const iconBg = ok ? "#10b981" : warn ? "#f59e0b" : "#ef4444";
  const iconChar = ok ? "✓" : warn ? "!" : "✗";
  const hoverBg = ok ? "#f0fdf4" : warn ? "#fffbeb" : "#fef2f2";
  return (
    <div className="group flex items-center justify-between transition-colors duration-150 cursor-default"
      style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 6, borderLeft: `3px solid ${bc}`, background: "white" }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = "white")}>
      <span className="text-[13px] font-medium" style={{ color: "#334155" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px]" style={{ color: "#94a3b8" }}>{value.replace(/_/g, " ")}</span>
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white font-bold" style={{ background: iconBg }}>{iconChar}</span>
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SH({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color: "#64748b", letterSpacing: "1.2px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{children}</h3>;
}

// ─── Confidence Donut ────────────────────────────────────────────────────────
function ConfDonut({ value, size = 76 }: { value: number; size?: number }) {
  const p = pct(value);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value * circ);
  const color = p >= 78 ? "#10b981" : p >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeLinecap="round" className="animate-ring-draw"
          style={{ "--ring-circ": circ, "--ring-offset": offset, strokeDashoffset: offset, filter: `drop-shadow(0 0 8px ${color}4d)` } as React.CSSProperties} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-mono-data" style={{ color: "#0f172a" }}>{p}</span>
      </div>
    </div>
  );
}

// ─── Signal Bar ──────────────────────────────────────────────────────────────
function SignalBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const p = pct(value);
  const grad = p >= 80 ? "linear-gradient(90deg, #10b981, #34d399)" : p >= 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : p >= 40 ? "linear-gradient(90deg, #f97316, #fb923c)" : "linear-gradient(90deg, #ef4444, #f87171)";
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[11px] w-32 truncate capitalize" style={{ color: "#64748b" }}>{label.replace(/([A-Z])/g, " $1")}</span>
      <div className="flex-1 rounded overflow-hidden relative" style={{ background: "#f1f5f9", height: 8, borderRadius: 4 }}>
        <div className="h-full rounded animate-bar-grow relative overflow-hidden" style={{ width: `${p}%`, background: grad, borderRadius: 4, animationDelay: `${delay}ms` }}>
          <div className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", width: "50%" }} />
        </div>
      </div>
      <span className="text-[12px] font-semibold font-mono-data w-8 text-right" style={{ color: "#334155" }}>{p}</span>
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
function Card({ children, className = "", accentColor }: { children: React.ReactNode; className?: string; accentColor?: string }) {
  return (
    <div className={`bg-white transition-all duration-200 ${className}`}
      style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.02)", borderTop: accentColor ? `3px solid transparent` : undefined }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; if (accentColor) e.currentTarget.style.borderTopColor = accentColor; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.02)"; if (accentColor) e.currentTarget.style.borderTopColor = "transparent"; }}>
      {children}
    </div>
  );
}

// ─── Face Result type ────────────────────────────────────────────────────────
interface FaceResult {
  match: boolean;
  distance: number;
  confidence: number;
  selfieDataUrl: string;
  noFaceOnId?: boolean;
  noFaceOnSelfie?: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VerificationResultCard({ result, faceResult, idFile, onReset }: { result: VR; faceResult?: FaceResult | null; idFile?: File | null; onReset: () => void }) {
  const { overall, level1_authenticity: l1, level2_extraction: l2, level3_crossMatch: l3, level4_compliance: l4 } = result;
  const lr = overall.levelResults;
  const vid = `VRF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const checkLabels: Record<string, string> = { documentLayout: "Document Layout", fontConsistency: "Font Consistency", fieldFormat: "Field Format", securityFeatures: "Security Features", barcodePresence: "Barcode", photoQuality: "Photo Quality", borderIntegrity: "Border Integrity" };
  const fieldLabels: Record<string, string> = { name: "Full Name", first_name: "First Name", last_name: "Last Name", dob: "Date of Birth", address: "Address", idNumber: "ID Number", expiration: "Expiration", issue_date: "Issue Date", idClass: "Class", state: "State", issuing_state: "Issuing State" };

  const vCfg = {
    AUTHENTIC: { bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "#10b981" },
    SUSPICIOUS: { bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "#f59e0b" },
    FAKE: { bg: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)", border: "#ef4444" },
  }[overall.verdict];

  return (
    <div className="space-y-5">

      {/* ══ VERDICT BANNER ══ */}
      <div className="animate-fade-in-up" style={{ background: vCfg.bg, borderLeft: `4px solid ${vCfg.border}`, borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" }}>
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>{overall.verdict}</h2>
            <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#334155" }}>{overall.summary}</p>
            {lr && (
              <div className="flex flex-wrap gap-2 mt-4">
                <StatusPill status={lr.l1 ? "pass" : "fail"} label={`L1 ${lr.l1 ? "Pass" : "Fail"}`} />
                <StatusPill status={lr.l2 ? "pass" : "fail"} label={`L2 ${lr.l2 ? "Pass" : "Fail"}`} />
                {lr.l3 !== null ? <StatusPill status={lr.l3 ? "pass" : "fail"} label={`L3 ${lr.l3 ? "Pass" : "Fail"}`} /> : <StatusPill status="na" label="L3 N/A" />}
                <StatusPill status={lr.l4 ? "pass" : "fail"} label={`L4 ${lr.l4 ? "Pass" : "Fail"}`} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center shrink-0">
            <ConfDonut value={overall.confidence} />
            <span className="text-[10px] mt-1.5 font-medium" style={{ color: "#94a3b8" }}>confidence</span>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4 pt-3 text-[11px]" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#64748b" }}>
          <span className="font-mono-data">{vid}</span>
          <span>{l2.documentType?.replace(/_/g, " ")}{l2.state ? ` · ${l2.state}` : ""}</span>
          <span>{((result.processingTime || 0) / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* ══ FACE VERIFICATION (right below verdict) ══ */}
      {faceResult && (
        <Card className="animate-fade-in-up stagger-1" accentColor={faceResult.match ? "#10b981" : "#ef4444"}>
          <div className="flex items-center justify-between mb-3">
            <SH>Face Verification</SH>
            <StatusPill status={faceResult.match ? "pass" : "fail"} label={faceResult.match ? "MATCH" : "MISMATCH"} />
          </div>
          <div className="flex items-center gap-5">
            {/* Photos side by side */}
            <div className="flex gap-3 shrink-0">
              <div className="text-center">
                <p className="text-[10px] uppercase mb-1.5" style={{ color: "#94a3b8", letterSpacing: "1px" }}>Live Selfie</p>
                <img src={faceResult.selfieDataUrl} alt="Selfie" className="w-[72px] h-[72px] rounded-xl object-cover"
                  style={{ border: `2px solid ${faceResult.match ? "#10b981" : "#ef4444"}`, transform: "scaleX(-1)" }} />
              </div>
              {idFile && (
                <div className="text-center">
                  <p className="text-[10px] uppercase mb-1.5" style={{ color: "#94a3b8", letterSpacing: "1px" }}>ID Photo</p>
                  <img src={URL.createObjectURL(idFile)} alt="ID" className="w-[72px] h-[72px] rounded-xl object-cover"
                    style={{ border: `2px solid ${faceResult.match ? "#10b981" : "#ef4444"}` }} />
                </div>
              )}
            </div>
            {/* Scores */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: faceResult.match ? "#10b981" : "#ef4444" }}>
                  {faceResult.match ? "✓" : "✗"}
                </span>
                <div>
                  <p className="text-[15px] font-bold" style={{ color: "#0f172a" }}>
                    {faceResult.noFaceOnId ? "No Face Detected on ID" : faceResult.noFaceOnSelfie ? "No Face Detected in Selfie" : faceResult.match ? "Face Match Confirmed" : "Face Mismatch"}
                  </p>
                  <p className="text-[12px]" style={{ color: "#64748b" }}>
                    {faceResult.noFaceOnId ? "Ensure the ID photo is clearly visible and unobstructed" : faceResult.noFaceOnSelfie ? "Try again with better lighting and face centered in frame" : `Similarity: ${Math.round(faceResult.confidence * 100)}% · Distance: ${faceResult.distance}`}
                  </p>
                </div>
              </div>
              {/* Similarity bar */}
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: "#94a3b8" }}>Similarity</span>
                <div className="flex-1 rounded overflow-hidden" style={{ background: "#f1f5f9", height: 8, borderRadius: 4 }}>
                  <div className="h-full rounded animate-bar-grow" style={{
                    width: `${Math.round(faceResult.confidence * 100)}%`,
                    background: faceResult.match ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f87171)",
                    borderRadius: 4
                  }} />
                </div>
                <span className="text-[12px] font-semibold font-mono-data" style={{ color: "#334155" }}>{Math.round(faceResult.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ══ DATA + CHECKS ══ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {/* Extracted Data */}
        <Card className="md:col-span-3 animate-fade-in-up stagger-1" accentColor="#3b82f6">
          <SH>Extracted Data</SH>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(["name", "first_name", "last_name", "dob", "address", "idNumber", "expiration", "issue_date", "idClass", "state", "issuing_state"] as const).map((field) => {
              const value = l2[field]; const conf = l2.confidence?.[field] ?? 0;
              if (value === null && conf === 0) return null;
              const isName = ["name", "first_name", "last_name"].includes(field);
              const isDate = ["dob", "expiration", "issue_date"].includes(field);
              const isIdNum = field === "idNumber";
              const valStyle: React.CSSProperties = isName
                ? { fontSize: 17, fontWeight: 600, letterSpacing: "0.01em", color: "#1e293b" }
                : isDate
                ? { fontSize: 16, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#1e293b" }
                : isIdNum
                ? { fontSize: 16, fontWeight: 500, fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em", color: "#1e293b" }
                : { fontSize: 15, fontWeight: 500, color: "#334155" };
              return (
                <div key={field} className="transition-transform duration-150 hover:-translate-y-px" style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span style={{ fontSize: 11, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: 4, display: "block" }}>{fieldLabels[field]}</span>
                      <span style={{ ...valStyle, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
                    </div>
                    <ConfBadge value={conf} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Authenticity Checks */}
        <Card className="md:col-span-2 animate-fade-in-up stagger-2" accentColor="#10b981">
          <div className="flex items-center justify-between mb-3">
            <SH>Authenticity Checks</SH>
            <StatusPill status={l1.passed ? "pass" : "fail"} label={l1.passed ? "PASSED" : "FAILED"} />
          </div>
          {Object.entries(l1.checks).map(([key, val]) => (
            <CheckRow key={key} label={checkLabels[key] || key} value={val} />
          ))}

          {l1.flags.length > 0 && (
            <div className="mt-3" style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              {l1.flags.map((f, i) => <p key={i} className="text-[13px] leading-relaxed" style={{ color: "#78350f" }}>• {f}</p>)}
            </div>
          )}

          {l1.signalScores && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <SH>Weighted Signals</SH>
              {Object.entries(l1.signalScores).map(([key, val], i) => (
                <SignalBar key={key} label={key} value={val} delay={i * 100} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ══ CROSS-DOCUMENT ══ */}
      {l3 && l3.performed && (
        <Card className="animate-fade-in-up stagger-3" accentColor="#8b5cf6">
          <div className="flex items-center justify-between mb-3">
            <SH>Cross-Document Match</SH>
            <ConfBadge value={l3.overallMatchScore} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(l3.matches).map(([field, matched]) => (
              <div key={field} className="flex items-center justify-between" style={{ padding: "12px 16px", borderRadius: 10, borderLeft: `3px solid ${matched ? "#10b981" : "#ef4444"}`, background: matched ? "#f0fdf4" : "#fef2f2" }}>
                <span className="text-[13px] capitalize" style={{ color: "#334155" }}>{field}</span>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white font-bold" style={{ background: matched ? "#10b981" : "#ef4444" }}>{matched ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
          {l3.partialMatches && Object.keys(l3.partialMatches).length > 0 && (
            <div className="mt-3" style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: "#92400e" }}>Partial Matches</p>
              {Object.entries(l3.partialMatches).map(([f, v]) => (
                <p key={f} className="text-[13px] font-mono-data" style={{ color: "#78350f" }}>{f}: &quot;{v.idValue}&quot; ↔ &quot;{v.docValue}&quot; <span style={{ color: "#b45309" }}>({v.reason})</span></p>
              ))}
            </div>
          )}
          {Object.keys(l3.mismatches).length > 0 && (
            <div className="mt-2" style={{ background: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: "#991b1b" }}>Mismatches</p>
              {Object.entries(l3.mismatches).map(([f, v]) => (
                <p key={f} className="text-[13px] font-mono-data" style={{ color: "#991b1b" }}>{f}: &quot;{v.idValue}&quot; vs &quot;{v.docValue}&quot;</p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ══ COMPLIANCE + EDGE CASES ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="animate-fade-in-up stagger-3" accentColor="#f59e0b">
          <SH>Compliance & Expiration</SH>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: "Expiry", value: l4.expiryStatus.replace(/_/g, " "), sub: l4.daysUntilExpiry != null ? `${l4.daysUntilExpiry}d` : undefined, status: l4.expiryStatus === "valid" ? "pass" as const : l4.expiryStatus === "expiring_soon" ? "warn" as const : "fail" as const },
              { label: "Out-of-State", value: l4.outOfStateIssue ? "Yes" : "No", status: l4.outOfStateIssue ? "warn" as const : "pass" as const },
              { label: "Standards", value: l4.belowNotaryStandards ? "Below" : "Meets", status: l4.belowNotaryStandards ? "fail" as const : "pass" as const },
            ].map((item) => {
              const s = { pass: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" }, warn: { bg: "#fffbeb", border: "#fde68a", color: "#92400e" }, fail: { bg: "#fef2f2", border: "#fecaca", color: "#991b1b" } }[item.status];
              return (
                <div key={item.label} className="text-center" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: "16px 12px" }}>
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>{item.label}</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: s.color }}>{item.value}</p>
                  {item.sub && <p className="text-[12px]" style={{ color: "#94a3b8" }}>{item.sub}</p>}
                </div>
              );
            })}
          </div>
          {l4.flags.length > 0 && (
            <div className="mb-3" style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              {l4.flags.map((f, i) => <p key={i} className="text-[13px] leading-[1.6]" style={{ color: "#78350f" }}>• {f}</p>)}
            </div>
          )}
          {l4.citedRules.length > 0 && (
            <div style={{ background: "#eff6ff", borderLeft: "3px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: "#1e40af" }}>Cited Rules</p>
              {l4.citedRules.map((r, i) => <p key={i} className="text-[13px] font-mono-data leading-[1.6]" style={{ color: "#1e40af" }}>• {r}</p>)}
            </div>
          )}
        </Card>

        <Card className="animate-fade-in-up stagger-4" accentColor="#64748b">
          <SH>Edge Cases & Notes</SH>
          {result.edgeCasesDetected.length > 0 ? (
            <div className="space-y-2">
              {result.edgeCasesDetected.map((e, i) => (
                <div key={i} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, borderLeft: "3px solid #94a3b8" }}>
                  <p className="text-[13px] leading-snug" style={{ color: "#334155" }}>{e}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2" style={{ color: "#64748b" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white font-bold" style={{ background: "#10b981" }}>✓</span>
              <span className="text-[13px]">No edge cases detected</span>
            </div>
          )}
        </Card>
      </div>

      {/* ══ ACTIONS ══ */}
      <div className="flex items-center justify-center gap-3 pt-3 pb-6 animate-fade-in-up stagger-4">
        <button onClick={onReset}
          className="px-7 py-3 text-[13px] font-semibold text-white transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", borderRadius: 10, border: "none" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
          Verify Another
        </button>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
          className="px-7 py-3 text-[13px] font-semibold transition-all duration-150"
          style={{ background: "white", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 10 }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
          Copy JSON
        </button>
      </div>
    </div>
  );
}

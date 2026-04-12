"use client";

import { VerificationResult as VR } from "@/lib/types";

// ─── Color tokens ────────────────────────────────────────────────────────────

const C = {
  // Status backgrounds + text
  greenBg: "#E1F5EE", greenText: "#085041",
  amberBg: "#FFF8E1", amberText: "#633806",
  redBg: "#FEF2F2", redText: "#791F1F",
  // Flag/warning boxes
  flagBg: "#FFFBEB", flagBorder: "#EF9F27", flagText: "#422006",
  // Cited rules boxes
  rulesBg: "#EFF6FF", rulesBorder: "#378ADD", rulesText: "#042C53",
  // Signal bar ramp
  barLow: "#F09595", barMid: "#FAC775", barHigh: "#5DCAA5", barTop: "#97C459",
  barTrack: "#F1EFE8",
  // Neutral
  cardBorder: "#E8EAED", sectionLabel: "#5F5E5A",
  // Verdict banners
  verdictGreenBg: "#E1F5EE", verdictGreenBorder: "#A7DFC9", verdictGreenText: "#085041",
  verdictAmberBg: "#FFF8E1", verdictAmberBorder: "#F5D98C", verdictAmberText: "#633806",
  verdictRedBg: "#FEF2F2", verdictRedBorder: "#F5B5B5", verdictRedText: "#791F1F",
};

function barColor(v: number): string {
  const p = Math.round(v * 100);
  if (p <= 30) return C.barLow;
  if (p <= 60) return C.barMid;
  if (p <= 80) return C.barHigh;
  return C.barTop;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(v: number) { return Math.round(v * 100); }

function StatusPill({ status, label }: { status: "pass" | "fail" | "warn" | "na"; label: string }) {
  const styles = {
    pass: { bg: C.greenBg, text: C.greenText, border: "#A7DFC9" },
    fail: { bg: C.redBg, text: C.redText, border: "#F5B5B5" },
    warn: { bg: C.amberBg, text: C.amberText, border: "#F5D98C" },
    na: { bg: "#F5F5F4", text: "#A1A09D", border: "#E8EAED" },
  };
  const s = styles[status];
  return (
    <span style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
      className="text-[11px] font-medium px-2 py-0.5 rounded border">{label}</span>
  );
}

function ConfBadge({ value }: { value: number }) {
  const p = pct(value);
  const bg = p >= 80 ? C.greenBg : p >= 50 ? C.amberBg : C.redBg;
  const text = p >= 80 ? C.greenText : p >= 50 ? C.amberText : C.redText;
  return <span style={{ backgroundColor: bg, color: text }} className="text-[11px] font-semibold px-1.5 py-0.5 rounded">{p}%</span>;
}

function CheckRow({ label, value }: { label: string; value: string }) {
  const ok = ["valid", "match", "detected", "present", "good", "intact", "photo_limited"].includes(value);
  const warn = ["unclear", "acceptable", "suspicious", "damaged", "not_applicable"].includes(value);
  const borderColor = ok ? "#5DCAA5" : warn ? "#EF9F27" : "#F09595";
  const bgColor = ok ? C.greenBg : warn ? C.amberBg : C.redBg;
  const iconColor = ok ? C.greenText : warn ? C.amberText : C.redText;
  const iconChar = ok ? "✓" : warn ? "!" : "✗";
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-r-md"
      style={{ borderLeft: `3px solid ${borderColor}`, backgroundColor: bgColor }}>
      <span className="text-xs" style={{ color: "#3D3D3A" }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] capitalize" style={{ color: "#8A8985" }}>{value.replace(/_/g, " ")}</span>
        <span className="text-xs font-bold" style={{ color: iconColor }}>{iconChar}</span>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color: C.sectionLabel, letterSpacing: "0.8px" }}
    className="text-[11px] font-semibold uppercase mb-2">{children}</h3>;
}

// ─── Confidence Donut ────────────────────────────────────────────────────────

function ConfidenceDonut({ value, size = 72 }: { value: number; size?: number }) {
  const p = Math.round(value * 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value * circ);
  const color = p >= 78 ? "#5DCAA5" : p >= 50 ? "#EF9F27" : "#F09595";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.barTrack} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color: "#1A1A18" }}>{p}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function VerificationResultCard({ result, onReset }: { result: VR; onReset: () => void }) {
  const { overall, level1_authenticity: l1, level2_extraction: l2, level3_crossMatch: l3, level4_compliance: l4 } = result;
  const lr = overall.levelResults;

  const verificationId = `VRF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const checkLabels: Record<string, string> = {
    documentLayout: "Document Layout", fontConsistency: "Font Consistency", fieldFormat: "Field Format",
    securityFeatures: "Security Features", barcodePresence: "Barcode", photoQuality: "Photo Quality", borderIntegrity: "Border Integrity",
  };

  const fieldLabels: Record<string, string> = {
    name: "Full Name", first_name: "First Name", last_name: "Last Name", dob: "Date of Birth",
    address: "Address", idNumber: "ID Number", expiration: "Expiration", issue_date: "Issue Date",
    idClass: "Class", state: "State", issuing_state: "Issuing State",
  };

  const verdictConfig = {
    AUTHENTIC: { bg: C.verdictGreenBg, border: C.verdictGreenBorder, text: C.verdictGreenText, icon: "✓" },
    SUSPICIOUS: { bg: C.verdictAmberBg, border: C.verdictAmberBorder, text: C.verdictAmberText, icon: "!" },
    FAKE: { bg: C.verdictRedBg, border: C.verdictRedBorder, text: C.verdictRedText, icon: "✗" },
  };
  const vc = verdictConfig[overall.verdict];

  return (
    <div className="space-y-4">

      {/* ══════ MINI DASHBOARD ══════ */}
      <div className="rounded-lg p-5" style={{ backgroundColor: vc.bg, border: `1px solid ${vc.border}` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold" style={{ color: vc.text }}>{vc.icon}</span>
              <h2 className="text-lg font-bold" style={{ color: vc.text }}>{overall.verdict}</h2>
            </div>
            <p className="text-sm leading-snug" style={{ color: "#4A4A47" }}>{overall.summary}</p>
            {lr && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <StatusPill status={lr.l1 ? "pass" : "fail"} label={`L1 ${lr.l1 ? "Pass" : "Fail"}`} />
                <StatusPill status={lr.l2 ? "pass" : "fail"} label={`L2 ${lr.l2 ? "Pass" : "Fail"}`} />
                {lr.l3 !== null
                  ? <StatusPill status={lr.l3 ? "pass" : "fail"} label={`L3 ${lr.l3 ? "Pass" : "Fail"}`} />
                  : <StatusPill status="na" label="L3 N/A" />}
                <StatusPill status={lr.l4 ? "pass" : "fail"} label={`L4 ${lr.l4 ? "Pass" : "Fail"}`} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center shrink-0">
            <ConfidenceDonut value={overall.confidence} />
            <span className="text-[10px] mt-1" style={{ color: "#8A8985" }}>confidence</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 text-[10px]" style={{ borderTop: `1px solid ${vc.border}`, color: "#8A8985" }}>
          <span>ID: {verificationId}</span>
          <span>{l2.documentType?.replace(/_/g, " ")} {l2.state ? `· ${l2.state}` : ""}</span>
          <span>{((result.processingTime || 0) / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* ══════ EXTRACTED DATA + CHECKS ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Extracted data */}
        <div className="md:col-span-3 bg-white rounded-lg p-4" style={{ border: `1px solid ${C.cardBorder}` }}>
          <SectionHeader>Extracted Data</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {(["name", "first_name", "last_name", "dob", "address", "idNumber", "expiration", "issue_date", "idClass", "state", "issuing_state"] as const).map((field) => {
              const value = l2[field];
              const conf = l2.confidence?.[field] ?? 0;
              if (value === null && conf === 0) return null;
              return (
                <div key={field} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F3F3F0" }}>
                  <div className="min-w-0">
                    <span className="text-[10px] block" style={{ color: "#8A8985" }}>{fieldLabels[field]}</span>
                    <span className="text-sm font-medium truncate block" style={{ color: "#1A1A18" }}>{value || "—"}</span>
                  </div>
                  <ConfBadge value={conf} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Authenticity checks */}
        <div className="md:col-span-2 bg-white rounded-lg p-4" style={{ border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Authenticity Checks</SectionHeader>
            <StatusPill status={l1.passed ? "pass" : "fail"} label={l1.passed ? "PASSED" : "FAILED"} />
          </div>
          <div className="space-y-1.5">
            {Object.entries(l1.checks).map(([key, val]) => (
              <CheckRow key={key} label={checkLabels[key] || key} value={val} />
            ))}
          </div>

          {l1.flags.length > 0 && (
            <div className="mt-3 p-2.5 rounded" style={{ backgroundColor: C.flagBg, borderLeft: `3px solid ${C.flagBorder}` }}>
              {l1.flags.map((f, i) => (
                <p key={i} className="text-[11px]" style={{ color: C.flagText }}>• {f}</p>
              ))}
            </div>
          )}

          {l1.signalScores && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #F3F3F0" }}>
              <p className="text-[10px] font-medium mb-1.5" style={{ color: C.sectionLabel, letterSpacing: "0.8px", textTransform: "uppercase" }}>Weighted Signals</p>
              {Object.entries(l1.signalScores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] w-28 truncate capitalize" style={{ color: "#8A8985" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                  <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: C.barTrack }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct(val)}%`, backgroundColor: barColor(val) }} />
                  </div>
                  <span className="text-[10px] w-7 text-right" style={{ color: "#8A8985" }}>{pct(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════ CROSS-DOCUMENT MATCH ══════ */}
      {l3 && l3.performed && (
        <div className="bg-white rounded-lg p-4" style={{ border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Cross-Document Match</SectionHeader>
            <ConfBadge value={l3.overallMatchScore} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(l3.matches).map(([field, matched]) => {
              const bg = matched ? C.greenBg : C.redBg;
              const bc = matched ? "#5DCAA5" : "#F09595";
              const tc = matched ? C.greenText : C.redText;
              return (
                <div key={field} className="flex items-center justify-between px-2.5 py-1.5 rounded-r-md"
                  style={{ borderLeft: `3px solid ${bc}`, backgroundColor: bg }}>
                  <span className="text-xs capitalize" style={{ color: "#4A4A47" }}>{field}</span>
                  <span className="text-xs font-bold" style={{ color: tc }}>{matched ? "✓" : "✗"}</span>
                </div>
              );
            })}
          </div>
          {l3.partialMatches && Object.keys(l3.partialMatches).length > 0 && (
            <div className="mt-2 p-2.5 rounded" style={{ backgroundColor: C.flagBg, borderLeft: `3px solid ${C.flagBorder}` }}>
              <p className="text-[10px] font-semibold mb-0.5" style={{ color: C.amberText }}>Partial Matches</p>
              {Object.entries(l3.partialMatches).map(([field, vals]) => (
                <p key={field} className="text-[11px]" style={{ color: C.flagText }}>{field}: &quot;{vals.idValue}&quot; ↔ &quot;{vals.docValue}&quot; <span style={{ color: "#8A7340" }}>({vals.reason})</span></p>
              ))}
            </div>
          )}
          {Object.keys(l3.mismatches).length > 0 && (
            <div className="mt-2 p-2.5 rounded" style={{ backgroundColor: C.redBg, borderLeft: `3px solid #F09595` }}>
              <p className="text-[10px] font-semibold mb-0.5" style={{ color: C.redText }}>Mismatches</p>
              {Object.entries(l3.mismatches).map(([field, vals]) => (
                <p key={field} className="text-[11px]" style={{ color: C.redText }}>{field}: &quot;{vals.idValue}&quot; vs &quot;{vals.docValue}&quot;</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ COMPLIANCE & EDGE CASES ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white rounded-lg p-4" style={{ border: `1px solid ${C.cardBorder}` }}>
          <SectionHeader>Compliance & Expiration</SectionHeader>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Expiry", value: l4.expiryStatus.replace(/_/g, " "), sub: l4.daysUntilExpiry != null ? `${l4.daysUntilExpiry}d` : undefined, status: l4.expiryStatus === "valid" ? "pass" as const : l4.expiryStatus === "expiring_soon" ? "warn" as const : "fail" as const },
              { label: "Out-of-State", value: l4.outOfStateIssue ? "Yes" : "No", status: l4.outOfStateIssue ? "warn" as const : "pass" as const },
              { label: "Standards", value: l4.belowNotaryStandards ? "Below" : "Meets", status: l4.belowNotaryStandards ? "fail" as const : "pass" as const },
            ].map((item) => {
              const bg = item.status === "pass" ? C.greenBg : item.status === "warn" ? C.amberBg : C.redBg;
              const tc = item.status === "pass" ? C.greenText : item.status === "warn" ? C.amberText : C.redText;
              const bc = item.status === "pass" ? "#A7DFC9" : item.status === "warn" ? "#F5D98C" : "#F5B5B5";
              return (
                <div key={item.label} className="rounded-lg p-2 text-center" style={{ backgroundColor: bg, border: `1px solid ${bc}` }}>
                  <p className="text-[10px]" style={{ color: "#8A8985" }}>{item.label}</p>
                  <p className="text-xs font-semibold capitalize" style={{ color: tc }}>{item.value}</p>
                  {item.sub && <p className="text-[10px]" style={{ color: "#8A8985" }}>{item.sub}</p>}
                </div>
              );
            })}
          </div>
          {l4.flags.length > 0 && (
            <div className="p-2.5 rounded mb-2" style={{ backgroundColor: C.flagBg, borderLeft: `3px solid ${C.flagBorder}` }}>
              {l4.flags.map((f, i) => <p key={i} className="text-[11px]" style={{ color: C.flagText }}>• {f}</p>)}
            </div>
          )}
          {l4.citedRules.length > 0 && (
            <div className="p-2.5 rounded" style={{ backgroundColor: C.rulesBg, borderLeft: `3px solid ${C.rulesBorder}` }}>
              <p className="text-[10px] font-semibold mb-0.5" style={{ color: C.rulesText }}>Cited Rules</p>
              {l4.citedRules.map((r, i) => <p key={i} className="text-[11px]" style={{ color: C.rulesText }}>• {r}</p>)}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4" style={{ border: `1px solid ${C.cardBorder}` }}>
          <SectionHeader>Edge Cases & Notes</SectionHeader>
          {result.edgeCasesDetected.length > 0 ? (
            <div className="space-y-1">
              {result.edgeCasesDetected.map((e, i) => (
                <p key={i} className="text-xs leading-snug" style={{ color: "#4A4A47" }}>• {e}</p>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: "#8A8985" }}>No edge cases detected.</p>
          )}
        </div>
      </div>

      {/* ══════ ACTIONS ══════ */}
      <div className="flex items-center justify-center gap-3 pt-2 pb-4">
        <button onClick={onReset}
          className="px-5 py-2 bg-white rounded-lg text-xs font-medium hover:bg-[#F5F5F4] transition-colors"
          style={{ border: `1px solid ${C.cardBorder}`, color: "#4A4A47" }}>
          Verify Another
        </button>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); }}
          className="px-5 py-2 bg-white rounded-lg text-xs font-medium hover:bg-[#F5F5F4] transition-colors"
          style={{ border: `1px solid ${C.cardBorder}`, color: "#4A4A47" }}>
          Copy JSON
        </button>
      </div>
    </div>
  );
}

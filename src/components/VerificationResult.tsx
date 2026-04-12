"use client";

import { VerificationResult as VR } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(v: number) { return Math.round(v * 100); }

function StatusPill({ status, label }: { status: "pass" | "fail" | "warn" | "na"; label: string }) {
  const styles = {
    pass: "bg-green-50 text-green-700 border-green-200",
    fail: "bg-red-50 text-red-700 border-red-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    na: "bg-slate-50 text-slate-400 border-slate-200",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${styles[status]}`}>{label}</span>
  );
}

function ConfBadge({ value }: { value: number }) {
  const p = pct(value);
  const c = p >= 80 ? "text-green-700 bg-green-50" : p >= 50 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";
  return <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${c}`}>{p}%</span>;
}

function CheckRow({ label, value }: { label: string; value: string }) {
  const ok = ["valid", "match", "detected", "present", "good", "intact", "photo_limited"].includes(value);
  const warn = ["unclear", "acceptable", "suspicious", "damaged", "not_applicable"].includes(value);
  const color = ok ? "border-green-400 bg-green-50/50" : warn ? "border-amber-400 bg-amber-50/50" : "border-red-400 bg-red-50/50";
  const icon = ok ? "text-green-600" : warn ? "text-amber-500" : "text-red-500";
  const iconChar = ok ? "✓" : warn ? "!" : "✗";
  return (
    <div className={`flex items-center justify-between px-3 py-2 border-l-[3px] rounded-r-md ${color}`}>
      <span className="text-xs text-slate-700">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 capitalize">{value.replace(/_/g, " ")}</span>
        <span className={`text-xs font-bold ${icon}`}>{iconChar}</span>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{children}</h3>;
}

// ─── Confidence Donut ────────────────────────────────────────────────────────

function ConfidenceDonut({ value, size = 72 }: { value: number; size?: number }) {
  const p = Math.round(value * 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value * circ);
  const color = p >= 78 ? "#22C55E" : p >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{p}</span>
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

  const verdictColors = {
    AUTHENTIC: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: "✓" },
    SUSPICIOUS: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "!" },
    FAKE: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "✗" },
  };
  const vc = verdictColors[overall.verdict];

  return (
    <div className="space-y-4">

      {/* ══════ MINI DASHBOARD (above the fold) ══════ */}
      <div className={`rounded-lg border p-5 ${vc.bg}`}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: verdict + summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xl font-bold ${vc.text}`}>{vc.icon}</span>
              <h2 className={`text-lg font-bold ${vc.text}`}>{overall.verdict}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-snug">{overall.summary}</p>

            {/* Level pass/fail row */}
            {lr && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <StatusPill status={lr.l1 ? "pass" : "fail"} label={`L1 ${lr.l1 ? "Pass" : "Fail"}`} />
                <StatusPill status={lr.l2 ? "pass" : "fail"} label={`L2 ${lr.l2 ? "Pass" : "Fail"}`} />
                {lr.l3 !== null ? (
                  <StatusPill status={lr.l3 ? "pass" : "fail"} label={`L3 ${lr.l3 ? "Pass" : "Fail"}`} />
                ) : (
                  <StatusPill status="na" label="L3 N/A" />
                )}
                <StatusPill status={lr.l4 ? "pass" : "fail"} label={`L4 ${lr.l4 ? "Pass" : "Fail"}`} />
              </div>
            )}
          </div>

          {/* Right: donut */}
          <div className="flex flex-col items-center shrink-0">
            <ConfidenceDonut value={overall.confidence} />
            <span className="text-[10px] text-slate-400 mt-1">confidence</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/60 text-[10px] text-slate-400">
          <span>ID: {verificationId}</span>
          <span>{l2.documentType?.replace(/_/g, " ")} {l2.state ? `· ${l2.state}` : ""}</span>
          <span>{((result.processingTime || 0) / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* ══════ EXTRACTED DATA + CHECKS (two-column on desktop) ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Left column: extracted data (3/5 width) */}
        <div className="md:col-span-3 bg-white rounded-lg border border-slate-200 p-4">
          <SectionHeader>Extracted Data</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {(["name", "first_name", "last_name", "dob", "address", "idNumber", "expiration", "issue_date", "idClass", "state", "issuing_state"] as const).map((field) => {
              const value = l2[field];
              const conf = l2.confidence?.[field] ?? 0;
              if (value === null && conf === 0) return null;
              return (
                <div key={field} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block">{fieldLabels[field]}</span>
                    <span className="text-sm text-slate-800 font-medium truncate block">{value || "—"}</span>
                  </div>
                  <ConfBadge value={conf} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: authenticity checks (2/5 width) */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-4">
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
            <div className="mt-3 p-2.5 bg-amber-50 rounded border border-amber-200">
              {l1.flags.map((f, i) => (
                <p key={i} className="text-[11px] text-amber-700">• {f}</p>
              ))}
            </div>
          )}

          {/* Signal scores */}
          {l1.signalScores && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium mb-1.5">Weighted Signals</p>
              {Object.entries(l1.signalScores).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-slate-400 w-28 truncate capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${val >= 0.8 ? "bg-green-500" : val >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${pct(val)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-7 text-right">{pct(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════ CROSS-DOCUMENT MATCH (if performed) ══════ */}
      {l3 && l3.performed && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Cross-Document Match</SectionHeader>
            <ConfBadge value={l3.overallMatchScore} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(l3.matches).map(([field, matched]) => (
              <div key={field} className={`flex items-center justify-between px-2.5 py-1.5 rounded border-l-[3px] ${matched ? "border-green-400 bg-green-50/50" : "border-red-400 bg-red-50/50"}`}>
                <span className="text-xs text-slate-600 capitalize">{field}</span>
                <span className={`text-xs font-bold ${matched ? "text-green-600" : "text-red-500"}`}>{matched ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
          {l3.partialMatches && Object.keys(l3.partialMatches).length > 0 && (
            <div className="mt-2 p-2.5 bg-amber-50 rounded border border-amber-200">
              <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Partial Matches</p>
              {Object.entries(l3.partialMatches).map(([field, vals]) => (
                <p key={field} className="text-[11px] text-amber-600">{field}: &quot;{vals.idValue}&quot; ↔ &quot;{vals.docValue}&quot; <span className="text-amber-400">({vals.reason})</span></p>
              ))}
            </div>
          )}
          {Object.keys(l3.mismatches).length > 0 && (
            <div className="mt-2 p-2.5 bg-red-50 rounded border border-red-200">
              <p className="text-[10px] font-semibold text-red-700 mb-0.5">Mismatches</p>
              {Object.entries(l3.mismatches).map(([field, vals]) => (
                <p key={field} className="text-[11px] text-red-600">{field}: &quot;{vals.idValue}&quot; vs &quot;{vals.docValue}&quot;</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ COMPLIANCE & EDGE CASES (below the fold) ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Compliance */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <SectionHeader>Compliance & Expiration</SectionHeader>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Expiry", value: l4.expiryStatus.replace(/_/g, " "), sub: l4.daysUntilExpiry != null ? `${l4.daysUntilExpiry}d` : undefined, status: l4.expiryStatus === "valid" ? "pass" as const : l4.expiryStatus === "expiring_soon" ? "warn" as const : "fail" as const },
              { label: "Out-of-State", value: l4.outOfStateIssue ? "Yes" : "No", status: l4.outOfStateIssue ? "warn" as const : "pass" as const },
              { label: "Standards", value: l4.belowNotaryStandards ? "Below" : "Meets", status: l4.belowNotaryStandards ? "fail" as const : "pass" as const },
            ].map((item) => {
              const bg = item.status === "pass" ? "bg-green-50 border-green-200" : item.status === "warn" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
              const tc = item.status === "pass" ? "text-green-700" : item.status === "warn" ? "text-amber-700" : "text-red-700";
              return (
                <div key={item.label} className={`rounded border p-2 text-center ${bg}`}>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                  <p className={`text-xs font-semibold capitalize ${tc}`}>{item.value}</p>
                  {item.sub && <p className="text-[10px] text-slate-400">{item.sub}</p>}
                </div>
              );
            })}
          </div>
          {l4.flags.length > 0 && (
            <div className="p-2 bg-amber-50 rounded border border-amber-200 mb-2">
              {l4.flags.map((f, i) => <p key={i} className="text-[11px] text-amber-700">• {f}</p>)}
            </div>
          )}
          {l4.citedRules.length > 0 && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-[10px] font-semibold text-blue-700 mb-0.5">Cited Rules</p>
              {l4.citedRules.map((r, i) => <p key={i} className="text-[11px] text-blue-600">• {r}</p>)}
            </div>
          )}
        </div>

        {/* Edge cases */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <SectionHeader>Edge Cases & Notes</SectionHeader>
          {result.edgeCasesDetected.length > 0 ? (
            <div className="space-y-1">
              {result.edgeCasesDetected.map((e, i) => (
                <p key={i} className="text-xs text-slate-600 leading-snug">• {e}</p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No edge cases detected.</p>
          )}
        </div>
      </div>

      {/* ══════ ACTIONS ══════ */}
      <div className="flex items-center justify-center gap-3 pt-2 pb-4">
        <button onClick={onReset}
          className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
          Verify Another
        </button>
        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); }}
          className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
          Copy JSON
        </button>
      </div>
    </div>
  );
}

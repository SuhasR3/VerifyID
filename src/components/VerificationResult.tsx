"use client";

import { VerificationResult as VR } from "@/lib/types";

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "text-green-700 bg-green-100" :
    pct >= 50 ? "text-yellow-700 bg-yellow-100" :
    "text-red-700 bg-red-100";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

function CheckIcon({ passed }: { passed: boolean | string }) {
  const ok = passed === true || passed === "valid" || passed === "match" || passed === "detected" || passed === "present" || passed === "good" || passed === "intact";
  const warn = passed === "unclear" || passed === "acceptable" || passed === "suspicious" || passed === "damaged";
  if (ok)
    return <span className="text-green-500 font-bold">&#10003;</span>;
  if (warn)
    return <span className="text-yellow-500 font-bold">&#9888;</span>;
  return <span className="text-red-500 font-bold">&#10007;</span>;
}

function VerdictBanner({ verdict, confidence, summary }: VR["overall"]) {
  const bg =
    verdict === "AUTHENTIC" ? "from-green-500 to-green-600" :
    verdict === "SUSPICIOUS" ? "from-yellow-500 to-yellow-600" :
    "from-red-500 to-red-600";
  const icon =
    verdict === "AUTHENTIC" ? "&#10003;" :
    verdict === "SUSPICIOUS" ? "&#9888;" :
    "&#10007;";

  return (
    <div className={`bg-gradient-to-r ${bg} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl" dangerouslySetInnerHTML={{ __html: icon }} />
          <div>
            <h2 className="text-xl font-bold">{verdict}</h2>
            <p className="text-white/80 text-sm mt-0.5">{summary}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{Math.round(confidence * 100)}%</div>
          <div className="text-white/70 text-xs">confidence</div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationResultCard({ result }: { result: VR }) {
  const { level1_authenticity, level2_extraction, level3_crossMatch, level4_compliance } = result;

  const checkLabels: Record<string, string> = {
    documentLayout: "Document Layout",
    fontConsistency: "Font Consistency",
    fieldFormat: "Field Format",
    securityFeatures: "Security Features",
    barcodePresence: "Barcode",
    photoQuality: "Photo Quality",
    borderIntegrity: "Border Integrity",
  };

  const fieldLabels: Record<string, string> = {
    name: "Full Name",
    dob: "Date of Birth",
    address: "Address",
    idNumber: "ID Number",
    expiration: "Expiration",
    idClass: "Class",
    state: "State",
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <VerdictBanner {...result.overall} />

      {/* Document Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Document</h3>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-slate-400">Type:</span>{" "}
            <span className="font-medium">{level2_extraction.documentType.replace(/_/g, " ")}</span>
          </div>
          {level2_extraction.state && (
            <div>
              <span className="text-slate-400">State:</span>{" "}
              <span className="font-medium">{level2_extraction.state}</span>
            </div>
          )}
          <div>
            <span className="text-slate-400">Processing:</span>{" "}
            <span className="font-medium">{(result.processingTime / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Level 1: Authenticity Checks */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Level 1 — Authenticity Check
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded ${level1_authenticity.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {level1_authenticity.passed ? "PASSED" : "FAILED"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(level1_authenticity.checks).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-sm text-slate-600">{checkLabels[key] || key}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 capitalize">{value}</span>
                <CheckIcon passed={value} />
              </div>
            </div>
          ))}
        </div>
        {level1_authenticity.flags.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs font-semibold text-yellow-700 mb-1">Flags:</p>
            {level1_authenticity.flags.map((f, i) => (
              <p key={i} className="text-xs text-yellow-600">• {f}</p>
            ))}
          </div>
        )}
      </div>

      {/* Level 2: Extracted Fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Level 2 — Extracted Data
        </h3>
        <div className="space-y-2">
          {(["name", "dob", "address", "idNumber", "expiration", "idClass", "state"] as const).map((field) => {
            const value = level2_extraction[field];
            const conf = level2_extraction.confidence[field] ?? 0;
            if (value === null && conf === 0) return null;
            return (
              <div key={field} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                <div>
                  <span className="text-xs text-slate-400">{fieldLabels[field]}</span>
                  <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
                </div>
                <ConfidenceBadge value={conf} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Level 3: Cross-Document Match */}
      {level3_crossMatch && level3_crossMatch.performed && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Level 3 — Cross-Document Match
            </h3>
            <ConfidenceBadge value={level3_crossMatch.overallMatchScore} />
          </div>
          <div className="space-y-2">
            {Object.entries(level3_crossMatch.matches).map(([field, matched]) => (
              <div key={field} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm text-slate-600 capitalize">{field}</span>
                <CheckIcon passed={matched} />
              </div>
            ))}
            {Object.keys(level3_crossMatch.mismatches).length > 0 && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg">
                <p className="text-xs font-semibold text-red-700 mb-1">Mismatches:</p>
                {Object.entries(level3_crossMatch.mismatches).map(([field, vals]) => (
                  <p key={field} className="text-xs text-red-600">
                    <strong>{field}:</strong> ID: &quot;{vals.idValue}&quot; vs Doc: &quot;{vals.docValue}&quot;
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Level 4: Compliance */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Level 4 — Compliance & Expiration
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className={`rounded-lg p-3 text-center ${
            level4_compliance.expiryStatus === "valid" ? "bg-green-50" :
            level4_compliance.expiryStatus === "expiring_soon" ? "bg-yellow-50" : "bg-red-50"
          }`}>
            <p className="text-xs text-slate-400">Expiry Status</p>
            <p className={`text-sm font-bold capitalize ${
              level4_compliance.expiryStatus === "valid" ? "text-green-700" :
              level4_compliance.expiryStatus === "expiring_soon" ? "text-yellow-700" : "text-red-700"
            }`}>{level4_compliance.expiryStatus.replace(/_/g, " ")}</p>
            {level4_compliance.daysUntilExpiry !== null && (
              <p className="text-xs text-slate-500 mt-0.5">{level4_compliance.daysUntilExpiry} days</p>
            )}
          </div>
          <div className={`rounded-lg p-3 text-center ${level4_compliance.outOfStateIssue ? "bg-yellow-50" : "bg-green-50"}`}>
            <p className="text-xs text-slate-400">Out-of-State</p>
            <p className={`text-sm font-bold ${level4_compliance.outOfStateIssue ? "text-yellow-700" : "text-green-700"}`}>
              {level4_compliance.outOfStateIssue ? "Yes" : "No"}
            </p>
          </div>
          <div className={`rounded-lg p-3 text-center ${level4_compliance.belowNotaryStandards ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-slate-400">Notary Standards</p>
            <p className={`text-sm font-bold ${level4_compliance.belowNotaryStandards ? "text-red-700" : "text-green-700"}`}>
              {level4_compliance.belowNotaryStandards ? "Below" : "Meets"}
            </p>
          </div>
        </div>
        {level4_compliance.flags.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg mb-2">
            {level4_compliance.flags.map((f, i) => (
              <p key={i} className="text-xs text-yellow-600">• {f}</p>
            ))}
          </div>
        )}
        {level4_compliance.citedRules.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-1">Cited Rules:</p>
            {level4_compliance.citedRules.map((r, i) => (
              <p key={i} className="text-xs text-blue-600">• {r}</p>
            ))}
          </div>
        )}
      </div>

      {/* Edge Cases */}
      {result.edgeCasesDetected.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Edge Cases Detected
          </h3>
          {result.edgeCasesDetected.map((e, i) => (
            <p key={i} className="text-xs text-slate-600">• {e}</p>
          ))}
        </div>
      )}
    </div>
  );
}

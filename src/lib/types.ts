export interface Level1Authenticity {
  passed: boolean;
  checks: {
    documentLayout: "valid" | "invalid" | "suspicious";
    fontConsistency: "match" | "mismatch" | "unclear";
    fieldFormat: "valid" | "invalid" | "suspicious";
    securityFeatures: "detected" | "not_detected" | "unclear" | "photo_limited";
    barcodePresence: "present" | "absent" | "damaged" | "not_applicable";
    photoQuality: "good" | "poor" | "acceptable";
    borderIntegrity: "intact" | "compromised" | "unclear";
  };
  flags: string[];
  signalScores: {
    templateConformance: number;
    dataFieldValidity: number;
    dataConsistency: number;
    imageIntegrity: number;
    securityFeaturePresence: number;
  };
}

export interface Level2Extraction {
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  dob: string | null;
  address: string | null;
  idNumber: string | null;
  expiration: string | null;
  issue_date: string | null;
  idClass: string | null;
  state: string | null;
  issuing_state: string | null;
  documentType:
    | "drivers_license"
    | "state_id"
    | "passport"
    | "military_id"
    | "foreign_id"
    | "unknown";
  confidence: { [field: string]: number };
}

export interface Level3CrossMatch {
  performed: boolean;
  matches: { [field: string]: boolean };
  mismatches: {
    [field: string]: { idValue: string; docValue: string };
  };
  partialMatches?: {
    [field: string]: { idValue: string; docValue: string; reason: string };
  };
  overallMatchScore: number;
}

export interface Level4Compliance {
  isExpired: boolean;
  daysUntilExpiry: number | null;
  expiryStatus: "valid" | "expiring_soon" | "expired";
  outOfStateIssue: boolean;
  nameMismatch: boolean;
  belowNotaryStandards: boolean;
  flags: string[];
  citedRules: string[];
}

export interface VerificationResult {
  overall: {
    verdict: "AUTHENTIC" | "SUSPICIOUS" | "FAKE";
    confidence: number;
    summary: string;
  };
  level1_authenticity: Level1Authenticity;
  level2_extraction: Level2Extraction;
  level3_crossMatch: Level3CrossMatch | null;
  level4_compliance: Level4Compliance;
  processingTime: number;
  edgeCasesDetected: string[];
}

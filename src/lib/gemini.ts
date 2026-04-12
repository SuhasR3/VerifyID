import { GoogleGenerativeAI } from "@google/generative-ai";
import { VerificationResult } from "./types";

function buildVerificationPrompt(hasSecondDocument: boolean): string {
  return `You are a forensic document examiner and notarial compliance expert with 20+ years of experience authenticating government-issued identification documents. You have deep knowledge of:
- US state DMV document specifications and security features for all 50 states
- Federal Real ID Act compliance requirements
- Passport booklet and passport card specifications (ICAO 9303 standard)
- Military ID (CAC) formats
- Notary public laws across all US states
- Common forgery techniques and how to detect them
- Document aging patterns vs. artificial distressing

You will analyze the provided ID image(s) and return a comprehensive verification report. Be thorough, precise, and clinically objective. Flag anything suspicious, no matter how minor.

${hasSecondDocument ? "A second supporting document has also been provided for cross-document identity verification (Level 3). Compare all matching fields between the primary ID and the second document carefully." : ""}

## LEVEL 1: Document Authenticity Analysis

Examine the following physical and structural elements:

**Layout & Dimensions:**
- US Driver's License standard: 3.375" x 2.125" (CR80 card format, aspect ratio ~1.586:1)
- Check if proportions match the claimed document type
- Verify the document orientation (landscape for DL/state IDs, portrait for passports)

**Typography & Fonts:**
- Each US state uses specific DMV-mandated fonts. Look for inconsistencies in character spacing, kerning, baseline alignment
- Check if all fields use consistent font weight and size hierarchy
- Flag any mixed font families
- Field labels vs. field values should have consistent typographic hierarchy

**Security Features (visible in photographs):**
- State seals and ghost images (faint duplicate photo in background)
- Holographic overlays (rainbow/metallic sheen in photos taken at angles)
- Microprint text along borders
- Fine-line guilloche patterns in background
- Laser-perforated state or document number
- AAMVA-compliant PDF417 barcode (2D)
- Color-shifting ink on newer IDs
- Tactile features (embossed text, raised lettering)

**Field Formatting Standards:**
- Date formats: MM/DD/YYYY (US standard)
- ID number formats vary by state (e.g., California: 1 letter + 7 digits; Texas: 8 digits; New York: 9 digits; Florida: 1 letter + 12 digits)
- Address format: standard USPS format with 5-digit or 9-digit ZIP
- Class/restriction/endorsement codes per AAMVA standards

**Photo Zone:**
- Photo should be centered in designated zone
- Check for signs of photo substitution (misaligned borders, resolution mismatches)
- Ghost image (second smaller photo) on Real ID compliant cards

## LEVEL 2: Data Extraction

Extract ALL readable fields with precision. For each field, assign a confidence score 0.0-1.0.

Fields: Full Legal Name, Date of Birth, Full Address, ID/License Number, Expiration Date, Document Class, Issuing State/Country, Document Type.

If a field is not readable, return null and assign confidence 0.0.

## LEVEL 3: Cross-Document Verification${hasSecondDocument ? "" : " (NOT PERFORMED — no second document provided)"}

${hasSecondDocument ? `Compare every matching field between the primary ID and the second document:
- Names: check for exact match, nicknames, abbreviations
- Addresses: check for matching street, city, state, ZIP
- Date of Birth: must match exactly
- Assign match: true/false per field
- For mismatches, record both values exactly
- Compute overall match score 0.0-1.0` : "No second document. Set level3_crossMatch to null."}

## LEVEL 4: Expiration & Notarial Compliance

**Expiration Analysis:**
- Today's date: ${new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
- Calculate days until expiry
- Classify: expired (< 0 days), expiring_soon (0-90 days), valid (> 90 days)

**Notarial Compliance Rules (cite specific statutes):**
- RULONA § 2(14): Satisfactory evidence of identity requires unexpired government-issued photo ID
- Out-of-state IDs are generally acceptable but some states prefer in-state for certain documents
- Name on ID must match name on document being notarized exactly
- Foreign IDs: typically not acceptable as sole ID for US notarial acts

## EDGE CASES — actively check:
- Low image quality: blur, compression, poor lighting, shadows
- Partial occlusion: fingers, objects, glare
- Photocopied/scanned ID: flat lighting, no shadows, perfect edges
- Foreign ID: different language, layout
- Novelty/prop ID: incorrect dimensions, watermarks saying VOID/SAMPLE
- Tampered ID: inconsistent fonts, photo zone anomalies
- Multiple IDs or no ID visible in image
- Test data: names like "John Doe", "Jane Sample", "SPECIMEN"

## OUTPUT FORMAT

You MUST respond with ONLY valid JSON — no markdown, no explanation, no code blocks. The JSON must exactly match this schema:

{
  "overall": {
    "verdict": "AUTHENTIC" | "SUSPICIOUS" | "FAKE",
    "confidence": <number 0.0-1.0>,
    "summary": "<2-3 sentence professional summary>"
  },
  "level1_authenticity": {
    "passed": <boolean>,
    "checks": {
      "documentLayout": "valid" | "invalid" | "suspicious",
      "fontConsistency": "match" | "mismatch" | "unclear",
      "fieldFormat": "valid" | "invalid" | "suspicious",
      "securityFeatures": "detected" | "not_detected" | "unclear",
      "barcodePresence": "present" | "absent" | "damaged",
      "photoQuality": "good" | "poor" | "acceptable",
      "borderIntegrity": "intact" | "compromised" | "unclear"
    },
    "flags": ["<specific issue>"]
  },
  "level2_extraction": {
    "name": "<string or null>",
    "dob": "<MM/DD/YYYY or null>",
    "address": "<full address or null>",
    "idNumber": "<string or null>",
    "expiration": "<MM/DD/YYYY or null>",
    "idClass": "<string or null>",
    "state": "<2-letter code or null>",
    "documentType": "drivers_license" | "state_id" | "passport" | "military_id" | "foreign_id" | "unknown",
    "confidence": {
      "name": <0.0-1.0>,
      "dob": <0.0-1.0>,
      "address": <0.0-1.0>,
      "idNumber": <0.0-1.0>,
      "expiration": <0.0-1.0>,
      "idClass": <0.0-1.0>,
      "state": <0.0-1.0>
    }
  },
  "level3_crossMatch": ${hasSecondDocument ? '{ "performed": true, "matches": {}, "mismatches": {}, "overallMatchScore": <0.0-1.0> }' : "null"},
  "level4_compliance": {
    "isExpired": <boolean>,
    "daysUntilExpiry": <integer or null>,
    "expiryStatus": "valid" | "expiring_soon" | "expired",
    "outOfStateIssue": <boolean>,
    "nameMismatch": <boolean>,
    "belowNotaryStandards": <boolean>,
    "flags": [],
    "citedRules": []
  },
  "edgeCasesDetected": []
}

Be rigorous. A real forensic examiner does not give benefit of the doubt. If something looks off, flag it.`;
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  let mimeType = file.type || "image/jpeg";
  if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    mimeType = "image/jpeg";
  }
  return { base64, mimeType };
}

export async function verifyID(
  idImageFile: File,
  secondDocFile?: File | null
): Promise<VerificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const idImage = await fileToBase64(idImageFile);
  const hasSecondDocument = !!secondDocFile;

  const imageParts: { inlineData: { data: string; mimeType: string } }[] = [
    { inlineData: { data: idImage.base64, mimeType: idImage.mimeType } },
  ];

  if (secondDocFile) {
    const secondImage = await fileToBase64(secondDocFile);
    imageParts.push({
      inlineData: { data: secondImage.base64, mimeType: secondImage.mimeType },
    });
  }

  const prompt = buildVerificationPrompt(hasSecondDocument) +
    `\n\n${hasSecondDocument ? "The first image is the primary ID. The second image is the supporting document." : "The image provided is the ID to verify."}`;

  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text();

  // Parse JSON — strip any accidental markdown fences
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);
  return parsed;
}

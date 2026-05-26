# VerifyID

**AI-powered identity document verification for notarial compliance.**
> 🏆 Winner · VillageHacks 2026 · Arizona State University

Upload a government-issued ID and get an instant authenticity verdict, extracted data fields with per-field confidence scores, and compliance flags against RULONA, NIST IAL2, and MISMO standards. Cross-reference a second document or verify a live selfie against the ID photo, with biometric matching running entirely in-browser. See [Scope](#scope) for what is production-ready.

---

<img width="800" height="450" alt="demo" src="https://github.com/user-attachments/assets/bcb9a1e6-e4e5-4537-92f9-74f2af891d9f" />

**Full Video:** [link](https://www.youtube.com/watch?v=4z_sjcKUTc8)

**App Live Link:** [link](https://verifyid.vercel.app/)

---

## What makes this interesting

**Hybrid AI + deterministic architecture.** The LLM extracts signals. Code computes the verdict. Five weighted signals are aggregated in TypeScript with hard caps for expired IDs, invalid state-specific ID number formats, and per-level failures. The model cannot hallucinate a passing score.

**Two-step Gemini pipeline.** Step 1 classifies the document (type, issuing state, side, under-21 flag, REAL ID star). That classification is injected into the Step 2 prompt, enabling state-specific field format rules and reducing hallucinations on ambiguous documents.

**Privacy enforced architecturally.** Face comparison runs entirely client-side via face-api.js. The 128-dim descriptor matching happens in the browser; the selfie never reaches the server.

**Compliance-ready output.** Results cite specific regulatory standards (RULONA § 2(14), NIST SP 800-63-3 IAL2, MISMO) with expiration checks and out-of-state flags, directly usable in notarial documentation.

---

## Architecture

```
Browser                                    Server
──────────────────────────────────         ──────────────────────────

  Upload ID image
  ├── (optional) 2nd document
  ├── (optional) Live selfie
  │
  └── Promise.all([
        │
        ├── POST /api/verify ──────────►   Route Handler
        │                                    │
        │                                    ├── Gemini Step 1: Classify
        │                                    │   (type, state, side, orientation)
        │                                    │
        │                                    ├── Gemini Step 2: Analyze
        │                                    │   (forensics, extraction, compliance)
        │                                    │
        │                                    └── computeVerdict()
        │                                        deterministic scoring
        │   ◄──────── JSON result ─────────      in TypeScript
        │
        └── runFaceComparison()
              face-api.js (client-side)
              TinyFaceDetector
              FaceRecognitionNet
              128-dim descriptor matching
      ])
  │
  └── Render verification dashboard
```

### Scoring

The LLM extracts signals. Code computes the score.

| Signal | Weight |
|---|---|
| Template conformance | 25% |
| Data field validity | 25% |
| Data consistency | 20% |
| Image integrity | 15% |
| Security feature presence | 15% |

Hard caps override the weighted score: invalid state-specific ID number format caps confidence at 40%, expired documents at 70%, any per-level failure at 77%.

**Verdict thresholds:** ≥ 78% AUTHENTIC, ≥ 50% SUSPICIOUS, < 50% FAKE.

---

## Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Full-stack framework with API Route Handlers |
| React 19 + TypeScript 5 | UI with state machine-driven flow |
| Tailwind CSS 4 | Styling |
| Gemini 2.5 Flash | Two-step document classification and forensic analysis |
| face-api.js | Client-side face detection and 128-dim descriptor matching |

---

## Scope

Hackathon prototype. Verification logic works end to end; surrounding infrastructure is not production-grade.

**Not implemented:** authentication, rate limiting, persistent storage, structured logging, MIME type verification against image bytes, cache eviction, test suite.

**Production roadmap:** auth and per-tenant API keys, audit log persistence, edge rate limiting, integration tests for the scoring engine, structured logging with per-step latency metrics, bounded LRU cache.

---

## Getting Started

```bash
git clone https://github.com/yourusername/VerifyID.git
cd VerifyID
npm install
cp .env.example .env.local
# add GEMINI_API_KEY to .env.local
npm run dev
```

Get a Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Optional `GEMINI_API_KEY_FALLBACK` is used on rate-limit errors.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Client state machine, selfie capture, face comparison
│   ├── api/verify/route.ts       # API route, validates input, calls Gemini pipeline
│   └── layout.tsx                # App shell, font loading
├── lib/
│   ├── gemini.ts                 # Two-step Gemini pipeline, scoring engine, cache
│   └── types.ts                  # TypeScript interfaces for all verification levels
└── components/
    ├── VerificationResult.tsx    # Results dashboard (verdict, fields, compliance)
    ├── UploadZone.tsx            # Drag-and-drop file upload
    └── ScanAnimation.tsx         # Loading state
public/
└── models/                       # face-api.js model weights
```

---

## License

MIT

# ANVAYA Agriculture OS

ANVAYA is a mobile-first Agriculture Operating System for Bharat. It connects farm, climate, crop, water, market, finance, equipment, storage, logistics, and opportunity context into one decision layer.

KisanMitra AI is the farmer-facing intelligence inside ANVAYA.

## Product Principles

- Farmer intelligence access remains free.
- The first useful interaction works without authentication.
- Every visible screen uses one complete language at a time.
- Location use is contextual, consent-based, reversible, and minimized.
- Agricultural recommendations are explainable and pass through a safety firewall.
- Commerce is relevant, optional, and transparently disclosed.
- Seeded demo information is labeled and never presented as traction or verified impact.

## Current Status

Phase 0 is establishing the ANVAYA product contract, quality baseline, and implementation gates. The existing KisanMitra prototype remains in the source tree while the public experience is migrated in approved phases.

The detailed implementation plan is in [ANVAYA_PHASE_ONE_PLAN.md](./ANVAYA_PHASE_ONE_PLAN.md). The active product contract is [SPEC.md](./SPEC.md).

## Approved Stack

- Next.js App Router
- React 19 and strict TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, and RLS
- Zustand
- Zod
- PWA support
- Google Cloud Run compatible standalone build

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The application must also be verified at 390x844 and 1440x900 before a phase is accepted.

## Demo Resilience

The commercial demo must run without paid API keys. Weather, market, KisanMitra, diagnosis, commerce, and Farm Digital Twin surfaces return deterministic seeded information when an integration is missing, unavailable, timed out, or offline.

Every data surface distinguishes live, cached, seeded demo, and unavailable states.

## Safety

ANVAYA does not provide pesticide dosage or application-method instructions and does not guarantee diagnosis, yield, prices, loans, insurance, or financial outcomes. Severe or uncertain crop conditions require escalation to an agriculture officer or licensed expert.

## Deployment

The repository includes a root Dockerfile and Next.js standalone output for Google Cloud Run compatibility. Deployment follows only after the relevant implementation phase passes its acceptance checks.

## UMANG/eNAM APMC Integration

APMC discovery and mandi details are requested only from the server. Configure these values in the deployment secret store or local `.env.local`:

```bash
UMANG_ENAM_API_KEY=
UMANG_ENAM_ACCESS_TOKEN=
UMANG_ENAM_REQUEST_TOKEN=
UMANG_ENAM_TRACKER=213132
UMANG_ENAM_USER_ID=09
```

The UMANG gateway requires both the bearer authorization token and `x-api-key`. When credentials are absent, expired, or forbidden, the dashboard labels the market as a GPS estimate and uses the local fallback rather than presenting it as live data.

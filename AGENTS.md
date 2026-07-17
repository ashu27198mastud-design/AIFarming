# ANVAYA Agriculture OS

ANVAYA is a mobile-first Agriculture Operating System for Bharat. KisanMitra AI is the farmer-facing intelligence inside ANVAYA.

The approved product and engineering plan is `./ANVAYA_PHASE_ONE_PLAN.md`. The active product contract is `./SPEC.md`. Both supersede the legacy KisanMitra documents retained at the repository root for historical reference.

## Approved Stack

- Next.js 14+ App Router, React 19, strict TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Storage, and Row-Level Security
- Zustand for client state and Zod for every API input and output
- PWA support and Google Cloud Run compatibility
- Dockerfile at the repository root

Do not replace Supabase, introduce a UI component library, or change deployment architecture without approval.

## Product Hierarchy

- Corporate brand: ANVAYA
- Descriptor: Agriculture OS
- Farmer-facing AI: KisanMitra AI
- Positioning: The connected intelligence and commerce layer for agriculture
- Farmer access: INR 0 for platform intelligence

ANVAYA remains stable in Latin script for recognition. Sanskrit informs the brand identity but is never treated as the default or superior interface language.

## Non-Negotiable Product Rules

### Public first experience

- Route `/` is a public product experience, not a login form.
- One useful KisanMitra interaction works without authentication.
- Authentication appears only after save, profile, history, expert escalation, or transaction intent.
- The first viewport must explain ANVAYA, KisanMitra, farmer-free access, lifecycle coverage, and ecosystem value.

### Single-language UI

- Every visible interface renders in exactly one active language.
- English, Hindi, and Marathi are the complete phase-one application languages.
- All user-facing strings come from typed dictionaries. Hardcoded JSX copy is forbidden.
- The 23-language brand promise is a separate reviewed preview layer, not permission to show partial application translations.
- Manual language selection always wins. Document `lang` and `dir` must follow the active language.
- Urdu and other Perso-Arabic experiences require correct RTL layout.

### Location consent

- Never request geolocation on page load.
- First explain why location would help and offer Use my location, Choose manually, and Not now.
- Coordinates used for language suggestion remain client-side.
- A location-based language is temporary until confirmed and always reversible.
- Do not store precise coordinates until the farmer deliberately saves a farm location.

### Farmer trust and commercial ethics

- Farmers pay no subscription, premium feature, AI query, language, or platform-access fee.
- Never sell personally identifiable farmer data.
- Never change the principal recommendation because a provider paid more.
- Label partner offers, sponsored placements, referrals, service charges, eligibility estimates, and simulated data.
- Relevant commerce may follow a real farmer need; unrelated advertising may not interrupt the journey.
- Platform revenue is not shown in the normal farmer interface unless directly relevant to a disclosed fee.

### Agricultural safety firewall

- Never render pesticide dosage or application-method instructions.
- Never guarantee diagnosis, yield, loan approval, insurance approval, or financial outcome.
- Diagnosis includes confidence, severity, reasoning summary, safe next step, and expert escalation.
- Low-confidence or high-severity results require an agriculture officer or licensed expert recommendation.
- Recommend safe product categories before products and show at least three eligible options where commerce is relevant.
- Restricted agrochemicals never support direct purchase.

### Demo integrity

- The complete experience must work with zero paid API keys.
- Each integration returns deterministic seeded data when absent, failed, timed out, or offline.
- One failed integration never blocks the page.
- Seeded and illustrative outcomes are clearly labeled.
- Never display invented traction, deployment, or accuracy figures.

## Bharat Field Atlas Design System

- Kshetra Rekha: field boundaries, crop rows, and irrigation channels shape data paths and section rhythm.
- Ritu Rang: agricultural green, monsoon blue, mitti red, haldi gold, indigo, cotton white, and semantic colors create a varied palette.
- Regional cultural accents appear only after self-selected regional context. Keep them subtle and locally reviewed or commissioned.
- Do not combine unrelated folk traditions into a national collage.
- The operational UI remains calm, precise, and readable. Culture lives in imagery, transitions, dividers, and celebration states.
- Use a real or generated Bharat farm image for the hero, not stock imagery, model-authored SVG illustration, rustic clip art, or a tricolour theme.
- Cards use 20-24 px radii where specified, with restrained border and shadow. Never nest cards.
- Primary farmer controls are at least 56 px.

## Engineering Conventions

- Server routes live under `/src/app/api/*`; secrets remain server-side.
- Validate request and response contracts with Zod.
- Database schema changes use new files under `/supabase/migrations`; never edit an applied migration.
- Seed data stays separate from migrations.
- Apply own-record RLS to farmer data and narrow read rules to approved public or partner data.
- Use existing helpers and components before adding abstractions.
- Use `next/image` or optimized media pipelines for shipped imagery.
- Keep comments short and only where logic is not self-explanatory.

## Quality Gates

Every implementation phase must run:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

After implementation, start the development server and verify at 390x844 and 1440x900. Capture screenshots of named states, record the primary flow, and produce a walkthrough artifact.

Do not declare a phase complete while the production build is failing. Stop for approval before beginning the next major phase.

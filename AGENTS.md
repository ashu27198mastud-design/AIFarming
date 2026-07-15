Project: KisanMitra Predict — farmer-first AI copilot, mobile-first PWA (web now, app later)

Full functional spec: ./SPEC.md — consult it before planning any task.

Stack (do not deviate without asking)

- Next.js 14+ App Router, React 19, TypeScript strict, Tailwind CSS
- Supabase (Auth: Google OAuth + email/password; Postgres with RLS; Storage)
- Zustand for client state; next-pwa for service worker/manifest
- zod validation on every API route input AND output
- Deploy target: Google Cloud Run (Dockerfile at root)

Non-negotiable product rules (violating these = failed task)

- SINGLE-LANGUAGE UI: every user-facing string comes from /lib/i18n/{hi,mr,en}.ts dictionaries. The UI renders in exactly ONE language at a time. Bilingual strings like "Farm Khata / खेती का हिसाब" are FORBIDDEN anywhere in the UI. Hardcoded user-facing strings in components are FORBIDDEN — fail the build via an ESLint rule (no-literal-strings on JSX text) where practical.
- SAFETY FIREWALL: never render pesticide dosage or application-method instructions. Diagnosis and fertilizer-gap flows may link only to product CATEGORIES (3+ retailer options), never a single product. Restricted agrochemicals render "contact licensed shop" (localized), no add-to-cart. High-severity or low-confidence diagnosis must set see_officer=true and show the officer banner.
- DEMO-FIRST: every API route must return seeded demo data when its key is missing or the upstream call fails. The ENTIRE app must run and be browser-verifiable with ZERO env keys. Never block a screen on a failed fetch — per-card error boundaries.
- PRIVACY: consent timestamp stored at signup; geolocation from the language-detection flow is client-side only until profile save.
- DESIGN SYSTEM: follow SPEC.md §0 exactly (glass cards on #F5F5F7, blur 16px, radius 20-24px, shadow 0 8px 32px rgba(0,0,0,.04); max 12 visible words per card; big-number-small-label; ≥56px targets; Latin numerals; ₹ Indian grouping; Anek Devanagari + Mukta via next/font). No stock photos, no rustic clipart. Tricolour only as the login wordmark underline.

Conventions

- Server routes under /app/api/*; secrets server-side only; never expose keys to the client bundle.
- DB schema lives in /supabase/migrations/*.sql; seed in /supabase/seed.sql. Never modify schema outside migrations.
- Commit after each completed task list item with conventional-commit messages.
- Test command: npm run lint && npm run typecheck && npm run build. Run it before declaring any task complete.
- Dev server: npm run dev on http://localhost:3000 (browser allowlist: localhost only).

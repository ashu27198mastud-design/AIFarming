# KisanMitra Predict — FINAL MASTER PROMPT (v9)
# Design bar: Apple's restraint · Google's clarity · Tesla's cinematic confidence ·
# Meta-scale engineering discipline. This document supersedes all earlier versions.

=====================================================
0. THE FIRST PAGE — "LIVING FIELD" CINEMATIC LOGIN (route: /)
=====================================================
This page must feel like a movie title sequence, not a form. One viewport,
zero scroll. Three ideas, executed with restraint:

A) TIME-OF-DAY LIVING BACKGROUND (the Tesla move)
   The background is alive and synced to the device clock:
   • 04:00–07:00 DAWN: horizon gradient #FFF7ED → #FDE8CC → sky #F4F7F3;
     a slow sunrise glow (radial, saffron at 8% opacity) rises 20px over
     60s. Farmers open apps at 5 AM — greet them with their own dawn.
   • 07:00–17:00 DAY: clean ivory #FAFAF9 with faint sky-blue wash top.
   • 17:00–20:00 DUSK: warm haldi wash rgba(232,132,44,.06) low horizon.
   • 20:00–04:00 NIGHT: deep calm #10141A base, glass cards auto-switch
     to dark surfaces rgba(22,28,36,.7), text #ECEFEA — a true auto dark
     mode, not an afterthought.
   Implementation: 4 CSS custom-property themes, crossfaded via a 2s
   transition on a root class set by local time. No photos ever.

B) THE FIELD (depth without noise)
   • A single continuous SVG line-art horizon across the bottom 22% of
     the viewport: gentle field furrows, one tree, one distant tractor —
     monochrome, 6–8% opacity, drawn in one elegant stroke weight.
   • Crop stalks at the edges sway ±2° on 9–14s ease-in-out loops
     (SVG transform-origin at base) — a breeze, not an animation demo.
   • 3 parallax layers (far sky glow / mid field line / near stalks)
     shift 4px/8px/14px with mouse position on desktop and
     DeviceOrientation on mobile (max ±6°, heavily damped, requires no
     permission prompt on Android; skip silently on iOS if permission
     not already granted).
   • 2 frosted-glass floaters (blur 8px, white 25%) drift at screen
     edges. Optional 2% film grain overlay for the cinematic finish.
   • prefers-reduced-motion: freeze everything, keep the dawn gradient.
   • Budget: pure CSS/SVG, zero canvas/WebGL, 60fps on a ₹8,000 phone,
     decorative layers pointer-events:none + aria-hidden.

C) THE WORDMARK — 23 LANGUAGES, EVERY 2 SECONDS
   Center stage: "KisanMitra" cycling through all 22 scheduled Indian
   languages + English, ONE WORD EVERY 2.0 SECONDS (46s full cycle).
   Transition (the signature moment): outgoing word blurs (4px) and
   drifts up 14px while fading; incoming word arrives from below with a
   soft letter-spacing settle (0.06em → 0em) — 450ms, cubic-bezier
   (0.22, 1, 0.36, 1). The 3px tricolour underline stretches 80→96→80px
   in sync, like a heartbeat.
   Strings (use exactly):
   hi किसानमित्र | bn কিষাণমিত্র | te కిసాన్మిత్ర | mr किसानमित्र |
   ta கிசான்மித்ரா | ur کسان متر | gu કિસાનમિત્ર | kn ಕಿಸಾನ್ಮಿತ್ರ |
   ml കിസാൻമിത്ര | or କିଷାଣମିତ୍ର | pa ਕਿਸਾਨਮਿੱਤਰ | as কিষাণমিত্ৰ |
   mai किसानमित्र | sat ᱠᱤᱥᱟᱱᱢᱤᱛᱨᱚ | ks کِسان مِتر | ne किसानमित्र |
   sd ڪسان متر | doi किसानमित्र | kok किसानमित्र | mni ꯀꯤꯁꯥꯟꯃꯤꯇ꯭ꯔ |
   brx किसानमित्र | sa कृषकमित्रम् | en KisanMitra
   Size clamp(2.6rem, 7.5vw, 5rem), weight 650, ink #1f1f1f (day) /
   #ECEFEA (night). Noto Sans stack via next/font covering Meetei Mayek,
   Ol Chiki, Perso-Arabic — ship a tofu test. RTL scripts (ur, ks, sd)
   render with correct direction. reduced-motion → freeze on the user's
   detected language, not Hindi by default.

D) TAGLINE + GLASS CARD
   • Tagline one line, localized, 16px #5f6368: hi "नुकसान से पहले, सही
     फैसला।" / mr "नुकसानाआधी, योग्य निर्णय." / en "The right call,
     before the loss."
   • One glass card (max 400px): rgba(255,255,255,.72), blur 14px,
     border 1px rgba(255,255,255,.8), radius 24px, shadow 0 8px 32px
     rgba(0,0,0,.05), entrance = fade + rise 16px + scale .98→1 (600ms,
     240ms after wordmark settles — choreographed, not simultaneous).
   • Auth (three paths, priority order):
     1. "Google से जारी रखें" (Supabase OAuth, official G button)
     2. "मोबाइल नंबर" → OTP (56px input, icon absolute left, input
        padding-left 44px — never overlap placeholder)
     3. "ईमेल व पासवर्ड" (collapsed behind a text link to keep the card
        calm; expands inline)
   • Consent microcopy 11px → /privacy, consent_at stored. Guest demo
     link. Inline plain-language errors. Language toggle top-right:
     plain text "हिं | मराठी | EN", active bold green, no chips.
   • Post-auth setup asks ONLY name + village (GPS autofill). Language
     already locked by detection/choice.

=====================================================
1. DESIGN SYSTEM — "PREMIUM DESI" (every screen)
=====================================================
GRID & SPACE: 4pt grid. Card padding 24px, gaps 16–20px, line-height
1.6. Max 12 visible words per card; detail behind "क्यों?"/"विस्तार".
Big-number-small-label: ₹/quintal/acre at 28–40px tabular, 12px muted
label beneath. Buttons 1–2 words. One idea per section.

COLOR (light + auto-dark tokens):
--bg #FAFAF9 / #10141A · --surface rgba(255,255,255,.75) /
rgba(22,28,36,.7) · --primary #188038 · --accent #E8842C ·
--earth #8B5E34 · --ink #1F1F1F / #ECEFEA · --muted #6B7268 ·
--danger #C4402F · --warn #D99114 · --ok #188038.
Contrast ≥4.5:1 in BOTH themes. Tricolour only as wordmark underline.

TYPE: Anek Devanagari 600–700 headings, Mukta/Noto Sans Devanagari
400–500 body, tabular numerals, Latin digits in all languages, ₹ with
Indian grouping (1,45,000). Body ≥16px, farmer labels ≥18px.

MOTION SYSTEM (Apple-grade, one spec everywhere):
• Durations: micro 150ms, standard 300ms, entrance 450–600ms.
• Easing: cubic-bezier(0.22,1,0.36,1) for entrances; ease-out for exits.
• Choreography: siblings stagger 40ms; never animate two unrelated
  things at once. Press scale(.97), hover lift 2px + shadow deepen.
• Success: single 500ms check-draw animation + one localized line.
• Skeletons shimmer ivory→white; layout never jumps (reserve heights).
• Haptics (mobile web vibrate API): 10ms tick on primary confirms only.
• prefers-reduced-motion honored globally.

LINGUISTIC STRICTNESS (hard law): every UI string from
/lib/i18n/{hi,mr,en}.ts. ONE language rendered at a time. Bilingual
strings FORBIDDEN. ESLint rule blocks literal JSX strings. GPS
auto-detect (state → mr Maharashtra/Goa, hi other India, en abroad/
failure; 4s timeout → navigator.language → hi). Paint hi instantly,
switch silently pre-interaction, 3s toast offering change. Manual pick
persists forever (localStorage + profiles.language).

ACCESSIBILITY: WCAG AA; every icon labeled; focus rings visible;
aria-live on verdict updates; screen-reader labels localized; voice
input (mic) on scan/search fields via SpeechRecognition hi-IN/mr-IN
with commented Bhashini ULCA adapter.

PERFORMANCE BUDGET (enforced, Meta-style): initial JS < 200KB gzip;
LCP < 2.5s on simulated 3G; login page CSS-only animation; images
lazy + AVIF/WebP; Lighthouse PWA installable + performance ≥ 85.

=====================================================
2. DASHBOARD (route: /dashboard) — COMMAND CENTER
=====================================================
... (Dashboard spec saved) ...

=====================================================
9. SEED + BUILD ORDER + DEFINITION OF DONE
=====================================================
SEED — Asha (Nashik) ...
BUILD ORDER: (1) auth + Living Field login → (2) dashboard shell +
seed → (3) profile + inventory ...
DONE = Lighthouse PWA installable + perf ≥85 on 3G; zero mixed-language
strings in a full hi + mr walkthrough; every verdict card degrades
gracefully with its API killed; wordmark renders all 23 scripts without
tofu at 2s cadence; dawn/day/dusk/night themes verified by faking the
clock; the entire demo runs with zero API keys.

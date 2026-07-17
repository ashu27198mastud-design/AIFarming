# ANVAYA Agriculture OS - Phase One Product and Engineering Plan

Status: Approved for phased implementation
Prepared: 2026-07-17
Repository: `AIFarming` on `main`

This artifact is the approved planning gate for the ANVAYA phase-one commercial demo. ANVAYA is a Sanskrit-rooted identity expressing connection, relationship, and continuity. KisanMitra AI remains the farmer-facing intelligence inside the platform.

## 1. Product Understanding in 12 Points

1. ANVAYA is the stable corporate brand and Agriculture OS; KisanMitra AI is the farmer-facing intelligence inside it.
2. The product must unify decisions across the full farm lifecycle, not present a collection of disconnected agriculture tools.
3. The first useful interaction must work without authentication, and the public route must explain the product within roughly ten seconds.
4. Farmer access is permanently free; revenue comes from transparent ecosystem services, transactions, enterprise software, and institutional deployment.
5. Farmer trust outranks commission value. Sponsorship, referral relationships, fees, eligibility estimates, and simulated information must be visibly disclosed.
6. The interface is India-first and mobile-first, with voice, camera, location, large targets, low bandwidth support, and minimal typing.
7. ANVAYA remains stable in Latin script. Its promise rotates through 23 languages, while the application renders exactly one complete language at a time.
8. English, Hindi, and Marathi are the only full application languages in phase one. Other languages may appear in the reviewed brand-promise preview only.
9. KisanMitra answers must be structured as verdict, reason, expected impact, data basis or confidence, next action, and human escalation where needed.
10. The demo must use realistic seeded information, clearly identify simulated outcomes, and never present invented traction, accuracy, or deployment figures.
11. Agricultural safety is a product boundary: no pesticide dosage, no guaranteed diagnosis, no single-brand steering, and mandatory expert escalation for severe or uncertain cases.
12. The investor journey must use the real product UI and prove both farmer value and transparent ecosystem value within three minutes.

## 2. Current Repository Assessment

### Product state

The repository is a functioning KisanMitra mobile PWA prototype centered on a cinematic login route and an authenticated four-tab dashboard. It already contains useful intelligence, camera, diagnosis, weather, market, farm-planning, and demo-data foundations. It is not yet composed as the ANVAYA commercial platform described in the new brief.

### Architecture and quality baseline

| Area | Current state | Assessment |
| --- | --- | --- |
| Framework | Next.js 16.2, React 19.2, strict TypeScript | Compatible with the required Next.js 14+ and React 19 stack |
| UI | Tailwind 4, Lucide, Radix primitives, Framer Motion | Reuse existing libraries; add no new component library |
| State | Zustand persisted farm store | Reusable, but requires slices for language, demo story, commerce, and consent |
| Backend | Next route handlers plus one Supabase migration | Production-shaped start, but APIs lack required Zod input/output contracts |
| Authentication | Hand-built OAuth URL plus localStorage sessions and local plaintext test accounts | Not production-grade Supabase Auth; local demo mode can remain, local password accounts cannot |
| Database | 17 tables with RLS for farmer-owned data and public directories | Strong base; no commercial event, consent ledger, provider disclosure, or transaction reversal model |
| Demo resilience | Weather and mandi have fallbacks; Gemini helpers often have fallbacks | Inconsistent: several routes still return blocking 500 responses |
| PWA | Manifest, icons, hand-written service worker | Installable shell is partial; navigation and API offline behavior are insufficient |
| Internationalization | One monolithic `i18n.ts` with English, Hindi, Marathi | Complete-language typing is possible, but 23-language preview, RTL, state machine, and review status are absent |
| Design system | Approximately 85 KB of layered global CSS across four files | Multiple competing token systems and override layers increase regression and performance risk |
| Tests | No test script or automated test suite | High risk for language precedence, safety, fallbacks, and commercial disclosures |
| Lint | Passes with 18 warnings | No blocking errors; JSX literal enforcement is disabled across most legacy UI |
| Typecheck | Passes | Good baseline |
| Production build | Blocked by `EPERM` while unlinking a locked `.next` file in the OneDrive workspace | Environment/build-output lock must be cleared before implementation acceptance |

### Critical findings

- `/` is a login-first experience, directly conflicting with the required public ANVAYA experience.
- The login route requests geolocation on initial load, before contextual consent.
- Reduced motion freezes the rotating wordmark on Hindi rather than the detected or selected language.
- The current 23-language animation rotates translations of KisanMitra, not ANVAYA's product promise.
- `proofLines` contains an unverified claim that 2,40,000 farmers used the product. This must be removed in phase one before any external demo.
- The Gemini chat prompt explicitly asks for a bilingual Hindi and English response, violating single-language UI.
- Many diagnosis, camera, navigation, privacy, route-error, and seed strings are hardcoded. ESLint exemptions conceal the problem.
- Current setup requires GPS before completion and defaults to precise Nashik coordinates; GPS must be optional and client-side for language suggestion.
- The diagnosis model is useful but does not consistently enforce structured verdict/reason/impact/data-basis/action/escalation output.
- The seed contains an action to apply a copper-based fungicide within four hours without a clear escalation boundary. Demo advice should be category-level, conservative, and reviewable.
- Firebase remains in the codebase even though Supabase is the approved platform.
- The rule engine contains unrelated venue and crowd-congestion concepts and should not be presented as agricultural intelligence.

## 3. Reusable Components and Code

| Existing asset | Reuse decision | Required adaptation |
| --- | --- | --- |
| `CameraCapture.tsx` | Reuse | Localize every label, retain compression and mobile camera fallbacks, add image-upload demo state |
| `DiagnosisCard.tsx` | Rework and reuse | Replace hardcoded copy, implement the six-part response model, enforce safety escalation |
| Weather adapter and route | Reuse | Add Zod contracts, timeout envelope, data provenance, and deterministic offline fallback |
| Mandi adapter and fallback JSON | Reuse | Add schemas, freshness labels, offer comparison model, and explicit demo/live source treatment |
| `farm-intelligence.ts` | Reuse core scoring | Separate explainable rules from UI copy; remove hardcoded language content and unsupported certainty |
| Farm twin types and Zustand store | Reuse | Add crop, water, finance, inventory, insurance, market, and commercial-event demo state |
| `FieldMap.tsx` | Reuse below the fold | Lazy-load Leaflet and use it inside the Farm Digital Twin, never in initial hero JS |
| Asha seed model | Rework and reuse | Align Asha to Maharashtra with tomato and soybean and label every impact as illustrative |
| Existing RLS migration | Extend with new migration | Do not edit migration `0001`; add commercial-event and consent structures in `0002` |
| Time-of-day theme and reduced-motion CSS | Reuse selectively | Move into unified ANVAYA tokens and remove decorative parallax that does not communicate data |
| PWA manifest/icons/service worker | Rework | Rebrand to ANVAYA, add offline route shell, versioning, and predictable update behavior |
| Setup and auth flow | Preserve behind intent gates | Move to `/auth`, use official Supabase clients, keep a separate auth-free demo session |

## 4. Conflicts With the Master Prompt

The following existing repository rules conflict with the new ANVAYA brief and require explicit supersession:

1. `AGENTS.md` and `SPEC.md` define KisanMitra Predict as the product brand. The new brief defines ANVAYA as the platform and KisanMitra as its AI.
2. `SPEC.md` requires a one-screen login route at `/`. The new brief explicitly forbids login-first entry and requires a full commercial experience.
3. The old spec uses a tricolour KisanMitra wordmark animation. The new brief requires a fixed ANVAYA wordmark and a rotating 23-language product promise.
4. The old GPS rule silently selects Marathi or Hindi. The new rule requires browser language before GPS and contextual consent before any GPS request.
5. The old fallback defaults to Hindi. The new brief defines English as the neutral technical fallback.
6. The old dashboard has four bottom-nav destinations. The new mobile architecture requires Home, Ask, My Farm, Market, and More, with Ask centered.
7. The old visual system includes multiple Google-inspired overrides and one-login-card composition. The new system requires warm ivory, deep agricultural green, restrained gold, an aerial farm intelligence scene, and a live KisanMitra surface.
8. The old proof copy includes invented traction. The new brief expressly forbids unverified traction and accuracy figures.
9. The old implementation permits hardcoded JSX copy through broad lint exemptions. The new brief requires typed dictionaries and single-language screens.
10. The old chat response is bilingual and paragraph-oriented. The new response must be single-language, concise, structured, and actionable.

Approved resolution: update `AGENTS.md` and replace `SPEC.md` with an ANVAYA phase-one product contract before application implementation begins. Retain the old cinematic-login history in Git rather than carrying conflicting live instructions.

## 5. Assumptions Requiring Approval

| ID | Proposed assumption | Why approval matters |
| --- | --- | --- |
| A1 | ANVAYA fully supersedes KisanMitra Predict as the product brand; KisanMitra remains the AI name | Changes every public surface, metadata, and governing document |
| A2 | `/` becomes the public product experience; authentication moves to `/auth` and appears only after save, profile, history, or transaction intent | Material first-use architecture change |
| A3 | English, Hindi, and Marathi are the only active full-interface languages in phase one | Prevents partially translated product screens |
| A4 | All 23 product-promise translations require human linguistic review before they are marked production-ready | The product explicitly prohibits poor machine translation; engineering cannot certify linguistic quality |
| A5 | Unreviewed headline translations may exist in source as `draft` but must not enter the public rotation | Protects trust while allowing parallel content work |
| A6 | Asha's demo farm is in Nashik, Maharashtra and contains tomato and soybean plots | Aligns existing seed geography with the requested farmer story |
| A7 | Demo prices, service fees, water savings, costs, and platform revenue are configurable illustrative values, always labeled as such | Commercial-event amounts must not be mistaken for operating performance |
| A8 | A discreet presenter lens may reveal the illustrative ecosystem revenue event in Demo Story mode; the normal farmer UI will not expose platform revenue | Satisfies the investor journey without polluting farmer experience |
| A9 | The official Supabase JS/SSR packages and a focused test runner may be added; no UI component library will be added | Current auth and test foundations are incomplete |
| A10 | The hero uses a custom generated Bharat aerial-farm AVIF as its inspectable base image, with lightweight CSS/SVG data overlays | Meets visual quality and performance requirements without stock imagery or WebGL |
| A11 | Current local plaintext password accounts are removed; auth-free demo mode remains local and clearly simulated | Required security correction |
| A12 | Phase one optimizes for a complete three-minute vertical story and credible section previews, not production integrations for every lifecycle service | The entire national-scale platform is not credible in one week |

## 6. Commercial Information Architecture

### Public product route

1. Multilingual ANVAYA hero with embedded KisanMitra first interaction
2. Live Intelligence Strip
3. Mission Control preview
4. Farm Digital Twin
5. ANVAYA Decision Loop
6. Complete Farming Lifecycle
7. Connected Commerce
8. Asha impact story, labeled Illustrative demo
9. Ecosystem and Partner Value
10. Trust Architecture
11. Mobile and Offline Experience
12. Final CTA
13. Minimal footer

### Product routes

| Route | Purpose | Authentication |
| --- | --- | --- |
| `/` | Commercial product experience and one KisanMitra demo interaction | None |
| `/mission-control` | Seeded operating-system canvas and Farm Digital Twin | None in demo mode; profile required to save |
| `/ask` | Full KisanMitra text, voice, camera, and upload experience | One demo interaction free; save/history requires auth |
| `/auth` | Supabase sign-in and account creation | Public |
| `/setup` | Name, village, optional farm location, and explicit consent | Authenticated |
| `/dashboard` | Compatibility redirect to `/mission-control` | Existing sessions retained during migration |
| `/privacy` | Localized trust, privacy, consent, and data-use policy | None |

### Commercial value surfaces

- Farmer surface: relevant options, provider identity, price, distance, terms, verification, and disclosed platform fee.
- Partner surface in phase one: public value proposition and example demand signal, not a fake live partner dashboard.
- Investor Demo Story lens: event provenance, disclosure state, consent state, transaction value, and illustrative platform revenue.
- Institution surface: deployment model, governance, localization, safety, offline capability, and API readiness.

## 7. Landing-Page Wireframe

```text
+--------------------------------------------------------------------------------+
| ANVAYA / AGRICULTURE OS                 Language       Demo Story       Menu     |
+-----------------------------------------+--------------------------------------+
| ANVAYA                                  | Ask KisanMitra AI                    |
| [stable 23-language promise viewport]   | [prompt examples]                   |
| Weather, crops, water, markets...       | [structured demo answer]            |
| Free for farmers. Ecosystem powered.    | [text] [voice] [camera] [upload]     |
| [Ask KisanMitra] [Mission Control]      | No login for this demo interaction  |
| No subscription. No hidden access fee.  |                                      |
| Custom aerial farm intelligence scene spans the full hero background            |
+--------------------------------------------------------------------------------+
| Rain risk | Crop health | Water stress | Market | Equipment | Scheme | Storage  |
+--------------------------------------------------------------------------------+
| Mission Control: one decision per card, progressive detail                       |
| Today's Decision | Climate | Crop Doctor | Market | Water | Finance | Equipment |
+--------------------------------------------------------------------------------+
| Farm Digital Twin: interactive plot + contextual variables + outcome panel       |
+--------------------------------------------------------------------------------+
| Observe > Understand > Predict > Recommend > Connect > Learn                     |
+--------------------------------------------------------------------------------+
| Lifecycle explorer: Plan ... Learn                                               |
+--------------------------------------------------------------------------------+
| Connected Commerce | Asha Story | Partners | Trust | Offline                    |
+--------------------------------------------------------------------------------+
| Every Important Farming Decision Can Begin Here.                                |
| [Start with KisanMitra] [Explore ANVAYA]                                         |
+--------------------------------------------------------------------------------+
```

On mobile, the hero is a single continuous scene. The ANVAYA identity and value proposition appear first, followed immediately by the KisanMitra prompt surface. The next intelligence strip remains visibly hinted at below the fold.

## 8. Mobile-First Interaction Flow

1. Render the stable ANVAYA brand immediately using the saved or browser language for surrounding UI.
2. Show the reviewed promise rotation unless reduced motion is active.
3. Let the farmer choose a prompt, speak, type, take a picture, or upload one without signing in.
4. Return a compact structured result with verdict, reason, impact, basis, next action, and escalation.
5. Allow exploration of Mission Control and the Farm Digital Twin using seeded Asha data.
6. Ask for authentication only when the farmer chooses Save, Set reminder, Ask an expert, Create my farm, or Complete booking.
7. After authentication, collect name and village first. Offer farm GPS as optional and explain its purpose.
8. Keep persistent bottom navigation at Home, Ask, My Farm, Market, and More; Ask is the centered primary action.
9. Cache the product shell, selected language, demo story state, and last safe recommendations for low-bandwidth continuity.
10. For unsupported voice or camera capability, provide one-tap text and file alternatives without dead ends.

## 9. GPS and Language-Selection State Diagram

```mermaid
stateDiagram-v2
    [*] --> ResolveManual
    ResolveManual --> UseManual: confirmed preference exists
    ResolveManual --> ResolveProfile: none
    ResolveProfile --> UseProfile: authenticated profile language exists
    ResolveProfile --> ResolveBrowser: none
    ResolveBrowser --> UseBrowser: complete app dictionary supported
    ResolveBrowser --> UseEnglish: unsupported or unavailable
    UseManual --> Ready
    UseProfile --> Ready
    UseBrowser --> Ready
    UseEnglish --> Ready
    Ready --> LocationPrompt: contextual personalization prompt shown
    LocationPrompt --> Ready: Not now
    LocationPrompt --> ManualChooser: Choose manually
    LocationPrompt --> RequestGPS: Use my location
    RequestGPS --> RegionalSuggestions: permission granted; process coordinates client-side
    RequestGPS --> Ready: denied, unavailable, or timeout
    RegionalSuggestions --> TemporaryLanguage: select strongest suggestion temporarily
    TemporaryLanguage --> ConfirmedLanguage: Continue
    TemporaryLanguage --> ManualChooser: Change or Undo
    ManualChooser --> ConfirmedLanguage: user selects complete app language
    ConfirmedLanguage --> Ready: persist confirmed preference
```

Rules:

- Manual selection always wins and is never overwritten by location.
- GPS coordinates used for language suggestion never leave the browser.
- Up to four regional suggestions are shown; All languages opens the full list.
- A temporary GPS suggestion is not written to the profile until confirmed or deliberately continued.
- Urdu sets `dir="rtl"`; the entire active experience changes direction, not only the text block.

## 10. 23-Language Content Architecture

### Type model

```ts
type PreviewLanguageCode =
  | 'en' | 'as' | 'bn' | 'brx' | 'doi' | 'gu' | 'hi' | 'kn'
  | 'ks' | 'kok' | 'mai' | 'ml' | 'mni' | 'mr' | 'ne' | 'or'
  | 'pa' | 'sa' | 'sat' | 'sd' | 'ta' | 'te' | 'ur';

type AppLanguageCode = 'en' | 'hi' | 'mr';

type ContentStatus = 'draft' | 'reviewed' | 'approved';
```

### Content layers

| Layer | Languages | Activation rule |
| --- | --- | --- |
| Brand identity | ANVAYA and AGRICULTURE OS | Stable English only |
| Promise preview | All 23 | Only `reviewed` or `approved` entries rotate publicly |
| Core trust and location chooser | All 23 where supplied | May appear only as a complete chooser unit |
| Full application dictionaries | English, Hindi, Marathi initially | Type-complete dictionary required at build time |
| Future full dictionaries | Remaining 20 | Feature flag activates only after content review and completeness tests |

### Engineering controls

- Split the monolithic dictionary into typed locale modules with one canonical schema.
- Make TypeScript fail when English, Hindi, or Marathi misses any key.
- Store preview headline metadata separately: native name, script, direction, font subset, translation, reviewer, and status.
- Add a dictionary completeness test and a JSX-literal lint rule without broad page exemptions.
- Keep language-neutral codes, units, organization names, and regulated names in structured data rather than prose strings.
- Set document `lang` and `dir` whenever the active language changes.
- Preload only the active app font plus the next headline's script subset; do not load all script fonts at startup.

## 11. Design-System Specification

### Foundations

| Token group | Phase-one specification |
| --- | --- |
| Background | Warm ivory `#FAF9F5`, mineral white `#F7F8F5`, very light moss `#EFF4ED` |
| Primary | Deep agricultural green `#173F31` |
| Secondary | Emerald `#1F7A54` |
| Accent | Restrained warm gold `#B99145` |
| Ink | `#1D2420`; muted `#68716B` |
| Semantic | Positive `#287A4B`, warning `#A66A16`, risk `#B5443C`, info `#356B86` |
| Cards | 20-24 px radius where the established ANVAYA spec requires it, subtle border, low shadow, no nested cards |
| Targets | Minimum 56 px primary farmer interactions; 44 px absolute minimum for secondary icon controls |
| Grid | 4 px base, 16-20 px gaps, 24 px card padding |
| Type | Noto Sans for Latin; Noto Sans Devanagari for Hindi/Marathi; script-specific Noto subsets for preview languages |
| Numerals | Latin digits, tabular metrics, INR with Indian grouping |

### Composition rules

- The hero is one immersive full-width Bharat field scene, not a split card layout.
- ANVAYA is the strongest first-viewport signal.
- Operational sections are unframed page bands; cards are reserved for repeated decisions, offers, and tools.
- One card presents one verdict, one reason, and one action.
- No decorative gradient orbs, generic stock agriculture, rustic clip art, or tricolour theme.
- Intelligence overlays must reveal actual farm state: scan band, weather flow, crop-health zones, water stress, and route traces.
- Kshetra Rekha uses field boundaries, irrigation channels, and crop rows as the geometry for data paths and section rhythms.
- Ritu Rang adds seasonal and crop-aware accents through agricultural green, monsoon blue, mitti red, haldi gold, indigo, and cotton white.
- Regional cultural accents appear only after a farmer selects a region. They remain subtle, are reviewed or commissioned locally, and never mix unrelated traditions into a national collage.
- Sanskrit informs the brand identity but never becomes the default or superior interface language.
- Mobile layout is designed independently around thumb reach and bottom navigation.

## 12. Component Tree

```text
RootLayout
`-- AnvayaProviders
    |-- LanguageProvider
    |-- ConsentProvider
    `-- DemoStoryProvider
        `-- PublicHomePage
            |-- AnvayaHeader
            |   |-- LanguageControl
            |   `-- DemoStoryLauncher
            |-- AnvayaHero
            |   |-- AgricultureIntelligenceScene
            |   |-- BrandPromiseRotator
            |   `-- KisanMitraDemo
            |       |-- PromptExamples
            |       |-- MultimodalInputBar
            |       `-- DecisionResponse
            |-- IntelligenceStrip
            |-- MissionControlPreview
            |   `-- DecisionCard x8
            |-- FarmDigitalTwin
            |   |-- LazyFieldMap
            |   |-- TwinControls
            |   `-- TwinOutcomePanel
            |-- DecisionLoop
            |-- LifecycleExplorer
            |-- ConnectedCommerce
            |   `-- CommerceOption x3+
            |-- FarmerImpactStory
            |-- EcosystemValue
            |-- TrustArchitecture
            |-- OfflineExperience
            |-- FinalCta
            |-- MinimalFooter
            `-- MobileBottomNav

MissionControlPage
|-- MissionControlCanvas
|-- ContextPanel
|-- FarmDigitalTwin
|-- ActivityTimeline
`-- DemoStoryGuide
```

## 13. Animation Plan

| Motion | Meaning | Implementation | Fallback |
| --- | --- | --- | --- |
| Promise reveal every 2.75 s | Linguistic inclusion | Fixed-height opacity, 10 px vertical reveal, and gentle character dissolve | Selected/detected language only |
| Cloud-shadow drift | Near-term weather movement | Low-opacity translated mask over farm image | Static shadow state |
| Satellite scan | Observation refresh | One bounded scan band triggered on section entry | Static timestamp and source badge |
| Crop-health transition | State comparison | Crossfade between healthy and stressed plot overlays | Side-by-side labels |
| Water flow | Irrigation context | Slow path-dash movement only while irrigation variable is active | Static blue channel |
| AI reasoning pulse | Recommendation generated | One 300 ms state pulse, then settle | Immediate result |
| Decision Loop | System sequence | Step activation follows Observe to Learn, pauses on hover/focus | All steps visible |
| Booking confirmation | Transaction state | One check-draw plus activity/event insertion | Text status update |

Global rules:

- No typewriter, marquee, infinite card float, aggressive glow, or unrelated parallax.
- Use CSS for first-viewport motion; defer Framer Motion to below-fold interactive sequences only if bundle budget allows.
- Respect `prefers-reduced-motion`, Save-Data, low memory, low core count, and hidden-tab state.
- Reserve layout dimensions before motion begins.

## 14. Performance Plan

1. Render most landing sections as Server Components and isolate only the language rotator, KisanMitra demo, twin controls, and Demo Story as client islands.
2. Keep first-load JavaScript below 200 KB gzip by excluding Leaflet, Recharts, camera capture, and below-fold Framer Motion from the initial chunk.
3. Use one generated aerial-farm AVIF at responsive sizes, with WebP fallback and a lightweight static poster for low-power mode.
4. Target an LCP asset below 220 KB on mobile and preload only the selected hero source.
5. Replace the four layered global stylesheets with one token layer and route/component modules; remove duplicate override systems after visual parity.
6. Lazy-load Farm Digital Twin mapping on approach to viewport and reserve its aspect ratio to prevent layout shift.
7. Add explicit upstream timeouts and return per-service demo envelopes instead of blocking page rendering.
8. Cache immutable assets aggressively; use stale-while-revalidate for market and weather information.
9. Build a real offline shell for `/`, `/ask`, and `/mission-control`, while clearly showing last-updated and demo/cached states.
10. Verify 390x844 and 1440x900, simulated slow 3G, reduced motion, Save-Data, offline, and failed API scenarios.

## 15. Demo-Data Architecture

### Contract

```ts
type DataSource = 'live' | 'cached' | 'seeded-demo' | 'unavailable';

type DataEnvelope<T> = {
  data: T;
  source: DataSource;
  generatedAt: string;
  lastVerifiedAt?: string;
  confidence?: number;
  disclosureKey: string;
};
```

### Providers

- `WeatherProvider`: configured upstream, Open-Meteo, then deterministic Asha fallback.
- `MarketProvider`: data.gov.in, cache, then seeded Nashik comparisons.
- `KisanMitraProvider`: live model when configured, structured local scenarios otherwise.
- `CropDiagnosisProvider`: live image analysis when configured; safe structured demo diagnosis for the bundled sample image; unavailable response for arbitrary unprocessed images.
- `CommerceProvider`: seeded providers, offers, equipment, warehouse, and logistics options with explicit simulated status.
- `FarmTwinProvider`: deterministic Asha tomato and soybean state shared by all sections.
- `CommercialEventProvider`: Supabase-backed when configured; local in-memory story ledger in demo mode.

Demo rules:

- One canonical Asha dataset feeds hero, Mission Control, twin, lifecycle, commerce, impact story, and investor mode.
- No random values during a presentation.
- Every seeded metric carries a source and disclosure.
- Live integration failure changes only the affected card, never the whole screen.
- The UI distinguishes live, cached, seeded demo, partner offer, sponsored placement, government/market source, and human guidance.

## 16. Commercial-Event Architecture

### Event record

```ts
type CommercialEvent = {
  id: string;
  eventType: CommercialEventType;
  profileId?: string;
  farmerConsentStatus: 'not-required' | 'requested' | 'granted' | 'denied' | 'withdrawn';
  providerId: string;
  recommendationSource: string;
  occurredAt: string;
  transactionValueInr?: number;
  platformRevenueInr?: number;
  disclosureShown: boolean;
  disclosureVersion?: string;
  status: 'created' | 'pending' | 'completed' | 'cancelled' | 'reversed';
  cancellationOrReversalReason?: string;
  mode: 'demo' | 'live';
};
```

### Phase-one event taxonomy

- `input_referral_created`
- `equipment_booking_created`
- `equipment_booking_completed`
- `warehouse_booking_created`
- `logistics_booking_created`
- `buyer_subscription_lead_created`
- `loan_consent_granted`
- `loan_referral_created`
- `insurance_referral_created`
- `partner_campaign_viewed`

### Storage and access

- Add a new migration rather than modifying `0001_initial_schema.sql`.
- Farmer-linked records use own-record RLS.
- Client code never writes platform revenue directly; server validation derives it from approved provider terms.
- Provider and presenter access use separate roles and views, not broad public policies.
- Consent evidence is versioned and withdrawal is append-only.
- The normal farmer interface shows relevant service charge and terms, not internal platform revenue.
- Demo Story may show an illustrative event trace in its presenter lens, with `Illustrative demo` permanently visible.

## 17. Investor-Demo Journey

Target duration: 3 minutes. The guide advances the actual interface and never replaces it with slides.

| Time | Product action | Proof point |
| --- | --- | --- |
| 0:00-0:20 | ANVAYA promise rotates; presenter opens language control | National linguistic inclusion with farmer control |
| 0:20-0:35 | Presenter opts into location suggestion, sees regional choices, confirms Marathi, then switches back if desired | Consent, reversibility, and multilingual location nuance |
| 0:35-0:55 | Ask whether irrigation is needed | Structured verdict, reason, water impact, confidence, next action |
| 0:55-1:15 | Upload bundled crop sample | Diagnosis confidence, severity, safe next step, expert escalation |
| 1:15-1:35 | Compare market options | Connected intelligence and transparent data source |
| 1:35-1:55 | Find same-village equipment and open three options | Relevant commerce with distance, price, rating, and service charge |
| 1:55-2:10 | Complete demo booking | Real UI state transition and booking reference |
| 2:10-2:25 | Open activity and farm account | Expense is recorded automatically |
| 2:25-2:35 | Open presenter lens | Illustrative commercial event and disclosed platform revenue |
| 2:35-2:50 | Show season profitability | Full lifecycle context, not a single-feature app |
| 2:50-3:00 | End on Farm Digital Twin | One system connecting crop, climate, water, finance, and market |

The guide must include Restart, Back, Next, and Exit controls and persist no precise location or personal data.

## 18. Accessibility Plan

- Meet WCAG 2.2 AA for contrast, focus, keyboard use, labels, landmarks, and error identification.
- Keep body copy at 16 px or larger and important farmer labels at 18 px or larger.
- Use minimum 56 px primary controls and maintain thumb-safe spacing around the central Ask action.
- Synchronize document `lang` and `dir`; validate Urdu keyboard, punctuation, numerals, icon order, and screen-reader flow.
- Give the promise rotator one live region that announces only the active promise. Hidden language strings remain `aria-hidden`.
- Stop automatic language rotation under reduced motion and show the selected or detected language.
- Provide text alternatives for voice, file alternatives for camera, and clear permission-denied recovery.
- Make decision results keyboard-focusable and announce verdict updates through a polite live region.
- Do not encode source, risk, sponsorship, or severity using color alone.
- Test 200 percent zoom, 320 px width, Windows High Contrast, VoiceOver/TalkBack patterns, and keyboard-only desktop use.
- Add script-rendering checks for all 23 preview entries to detect missing glyphs before release.

## 19. Security and Privacy Controls

1. Use official Supabase clients and server-managed sessions; remove local plaintext password storage.
2. Keep service-role keys server-side and fail the build if a server secret is imported into a client module.
3. Validate every route input and output with Zod, including file size, MIME type, text length, coordinates, enum values, and provider payloads.
4. Add request timeouts, body limits, rate limits for AI and media routes, and sanitized user-facing errors.
5. Strip image metadata where feasible before storage; use signed URLs and private Supabase buckets for farmer media.
6. Keep language-suggestion GPS processing client-side. Send or store coordinates only after explicit farm-location consent.
7. Apply own-record RLS to profiles, plots, scans, ledger, consent, and commercial events.
8. Keep public market/provider data in approved read-only views with no farmer joins.
9. Record consent purpose, disclosure version, timestamp, and withdrawal as append-only events.
10. Add a centralized agricultural safety firewall after AI parsing and before rendering.
11. Never return pesticide dosage, application method, guaranteed approval, guaranteed yield, or guaranteed diagnosis.
12. Log operational errors without crop images, precise coordinates, phone numbers, or personal prompt text.

## 20. Phase-One Implementation Plan

Each phase ends with lint, typecheck, focused tests, production build, 390x844 and 1440x900 verification, screenshots, primary-flow recording, and a walkthrough artifact. Approval is required before the next major phase.

### Phase 0 - Contract and build baseline

- Approve this plan and assumptions.
- Update `AGENTS.md`, `SPEC.md`, and `README.md` to ANVAYA.
- Resolve the locked `.next` build-output issue and establish a green baseline.
- Add test tooling and core policy tests.

Exit: governing documents no longer conflict; lint, typecheck, tests, and build run reliably.

### Phase 1 - Brand, language, and consent foundation

- Implement typed English, Hindi, and Marathi dictionaries.
- Add the 23-language reviewed headline manifest and font-subset strategy.
- Build manual/browser/profile/GPS preference state machine.
- Move login to `/auth`; make `/` public.
- Rebrand metadata, manifest, icons, privacy, and shell.

Exit: no partial language screen, no unsolicited GPS prompt, correct reduced motion and RTL behavior.

### Phase 2 - Commercial hero and KisanMitra demo

- Build the custom aerial farm scene and stable ANVAYA brand composition.
- Add one auth-free text/voice/camera/upload interaction.
- Implement the structured KisanMitra response and safety firewall.
- Add Live Intelligence Strip with source labels.

Exit: a farmer and investor understand the platform and free-access promise within ten seconds.

### Phase 3 - Mission Control and Farm Digital Twin

- Build eight decision cards with verdict, reason, and action.
- Reuse field map and Asha farm state for interactive twin controls.
- Add Decision Loop and activity timeline.
- Keep every integration independently fallible.

Exit: one connected intelligence model is visible across farm, weather, crop, water, market, and finance.

### Phase 4 - Lifecycle, commerce, trust, and impact

- Add lifecycle explorer, relevant commerce comparison, Asha story, ecosystem value, institution value, trust architecture, and offline section.
- Add transparent provider, sponsored, referral, and service-fee labels.
- Add commercial event migration and demo provider.

Exit: partner value is understandable without weakening farmer trust.

### Phase 5 - Investor Demo Story and release hardening

- Implement the deterministic three-minute guide and presenter lens.
- Complete demo equipment booking, automatic expense, event trace, profitability, and twin conclusion.
- Harden PWA, offline behavior, failure states, accessibility, performance, and Cloud Run packaging.
- Capture final mobile and desktop walkthrough artifacts.

Exit: all phase-one acceptance criteria pass with zero API keys and with each upstream integration disabled in turn.

## 21. Exact Files to Create or Modify

This is the proposed phase-one implementation set. Any change in scope should update this list before coding.

### Governing and platform files to modify

```text
AGENTS.md
SPEC.md
README.md
package.json
package-lock.json
next.config.ts
eslint.config.mjs
Dockerfile
public/manifest.json
public/sw.js
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/app/dashboard/page.tsx
src/app/setup/page.tsx
src/app/privacy/page.tsx
src/app/api/chat/route.ts
src/app/api/ai/diagnose/route.ts
src/app/api/ai/land-plan/route.ts
src/app/api/ai/soil-report/route.ts
src/app/api/mandi/route.ts
src/app/api/weather/route.ts
src/components/BottomNav.tsx
src/components/CameraCapture.tsx
src/components/DiagnosisCard.tsx
src/components/FieldMap.tsx
src/lib/auth-session.ts
src/lib/demo-seed.ts
src/lib/farm-intelligence.ts
src/lib/gemini.ts
src/lib/i18n.ts
src/store/farmStore.ts
src/types/index.ts
supabase/seed.sql
```

### Files to create

```text
src/app/auth/page.tsx
src/app/ask/page.tsx
src/app/mission-control/page.tsx
src/app/api/commercial-events/route.ts
src/app/api/demo/diagnosis/route.ts
src/components/anvaya/AnvayaHeader.tsx
src/components/anvaya/AnvayaHero.tsx
src/components/anvaya/AgricultureIntelligenceScene.tsx
src/components/anvaya/BrandPromiseRotator.tsx
src/components/anvaya/LanguageControl.tsx
src/components/anvaya/LocationLanguagePrompt.tsx
src/components/anvaya/KisanMitraDemo.tsx
src/components/anvaya/DecisionResponse.tsx
src/components/anvaya/IntelligenceStrip.tsx
src/components/anvaya/MissionControlPreview.tsx
src/components/anvaya/FarmDigitalTwin.tsx
src/components/anvaya/DecisionLoop.tsx
src/components/anvaya/LifecycleExplorer.tsx
src/components/anvaya/ConnectedCommerce.tsx
src/components/anvaya/FarmerImpactStory.tsx
src/components/anvaya/EcosystemValue.tsx
src/components/anvaya/TrustArchitecture.tsx
src/components/anvaya/OfflineExperience.tsx
src/components/anvaya/FinalCta.tsx
src/components/anvaya/MinimalFooter.tsx
src/components/anvaya/DemoStoryGuide.tsx
src/i18n/types.ts
src/i18n/config.ts
src/i18n/headlines.ts
src/i18n/index.ts
src/i18n/locales/en.ts
src/i18n/locales/hi.ts
src/i18n/locales/mr.ts
src/lib/language/preference.ts
src/lib/language/regional-suggestions.ts
src/lib/ai/decision-response.ts
src/lib/ai/safety-firewall.ts
src/lib/data/demo-provider.ts
src/lib/data/commercial-events.ts
src/lib/schemas/api.ts
src/providers/AnvayaProviders.tsx
src/data/demo/anvaya-demo.ts
src/store/languageStore.ts
src/store/demoStoryStore.ts
src/styles/anvaya-tokens.css
src/styles/anvaya-landing.css
src/styles/anvaya-motion.css
src/lib/__tests__/language-preference.test.ts
src/lib/__tests__/dictionary-completeness.test.ts
src/lib/__tests__/safety-firewall.test.ts
src/lib/__tests__/demo-provider.test.ts
src/lib/__tests__/commercial-events.test.ts
supabase/migrations/0002_commercial_events_and_consent.sql
public/images/anvaya-farm-hero-mobile.avif
public/images/anvaya-farm-hero-desktop.avif
public/images/demo-crop-sample.webp
```

### Files to retire after parity

```text
src/app/google-clean.css
src/app/google-compact.css
src/app/liquid-glass.css
src/lib/firebase.ts
```

Retirement occurs only after imports are removed, screenshots match approved states, and the build remains green.

## 22. Risks to Next-Week Delivery

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Human review of 23 promise translations is not available | Critical | Treat content approval as a release gate; never publish draft translations |
| The brief contains a national platform's breadth | Critical | Deliver the complete three-minute vertical story and credible previews; defer unintegrated backend depth |
| Existing governing files contradict the new brief | High | Update product contract in Phase 0 before implementation |
| OneDrive currently locks `.next` build artifacts | High | Stop the owning process or move build output/worktree to a non-synced path before every acceptance run |
| Landing page is a large client monolith | High | Replace with server composition and small interactive islands rather than incrementally enlarging it |
| CSS has four competing systems | High | Introduce ANVAYA tokens first, migrate section by section, then retire legacy layers |
| Current auth stores local test passwords | High | Remove before external testing; use Supabase or auth-free demo sessions |
| No automated test suite exists | High | Add focused policy tests in Phase 0 before high-risk refactors |
| Current AI and seed responses can violate single-language and safety rules | High | Centralize parsing and safety enforcement before rendering any response |
| Camera, voice, and location vary across browsers | Medium | Capability detection, explicit permission prompts, text/file fallbacks, and device verification |
| Full script font coverage can damage LCP | Medium | Lazy script subsets, prefetch next headline only, tofu tests, and system fallbacks |
| Live market and weather services can fail during the demo | Medium | Deterministic local providers and per-card source labels |
| Illustrative commercial values could be misunderstood | Medium | Permanent demo disclosure and approved configuration values |

## 23. Features Recommended for Postponement

The following should not block the phase-one commercial demo:

- Real satellite ingestion, drone telemetry, IoT irrigation control, and automated actuation
- Live loan approval, insurance underwriting, or guaranteed eligibility
- Payment settlement, escrow, refund orchestration, and regulated financial workflows
- Production buyer procurement portal and paid buyer subscriptions
- Partner analytics, investor analytics, and government administration dashboards
- Full application activation for the remaining 20 languages before complete review
- Carbon-credit measurement, verification, issuance, or trading
- National FPO tenancy, enterprise SSO, white-label deployment, and API billing
- Cross-device offline write synchronization and conflict resolution
- Warehouse, cold-chain, and logistics integrations beyond deterministic demo booking
- Real sponsored campaign bidding or ranking
- Predictive accuracy claims, farmer traction claims, or impact claims without verified evidence
- Global country packs currently present in seed data; phase one should remain Bharat-first
- Unrelated research prototypes and venue/congestion rules

## Approval Record

Approved by the product owner on 2026-07-17:

1. ANVAYA Agriculture OS as the corporate identity, with KisanMitra AI as the farmer-facing intelligence.
2. Assumptions A1-A12 and the five-phase delivery sequence.
3. The Bharat Field Atlas design direction, including Kshetra Rekha, Ritu Rang, and reviewed regional cultural accents.

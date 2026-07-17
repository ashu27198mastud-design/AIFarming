# ANVAYA Agriculture OS - Phase One Product Contract

Version: 1.0
Status: Approved for phased implementation
Detailed plan: `./ANVAYA_PHASE_ONE_PLAN.md`

## 1. Product Identity

ANVAYA is the stable corporate brand and Agriculture OS for Bharat. The name is Sanskrit-rooted and expresses connection, relationship, continuity, and coherent order.

KisanMitra AI is the conversational intelligence farmers use inside ANVAYA.

ANVAYA connects weather, crop health, satellite and field observations, irrigation, markets, finance, equipment, storage, logistics, government opportunities, and farm accounting into one decision system.

Farmer access to the intelligence platform remains free.

## 2. Product Promise

Stable brand:

```text
ANVAYA
AGRICULTURE OS
```

Source promise:

```text
Every Farm.
One Intelligence Layer.
```

The promise may rotate through the 22 Eighth Schedule languages plus English only after each translation is professionally reviewed. The application itself renders one complete active language at a time.

## 3. First-Use Objective

Within approximately ten seconds, the public experience must communicate:

1. ANVAYA is an Agriculture Operating System.
2. It serves farmers first.
3. KisanMitra can answer an immediate farming question.
4. Farmer intelligence access is free.
5. The platform connects the complete farming lifecycle.
6. Commercial value comes from transparent ecosystem services.
7. The product can expand to partners, institutions, and government deployments.

The first route must not begin with authentication, a government-style menu, or a heavy dashboard.

## 4. Primary Routes

| Route | Purpose | Authentication |
| --- | --- | --- |
| `/` | Public ANVAYA experience and one KisanMitra interaction | None |
| `/ask` | Text, voice, camera, and image KisanMitra experience | One demo interaction is free |
| `/mission-control` | Seeded operating-system canvas and Farm Digital Twin | None in demo mode |
| `/auth` | Supabase sign-in and account creation | Public |
| `/setup` | Name, village, optional location, and explicit consent | Authenticated |
| `/dashboard` | Compatibility redirect to Mission Control | Existing session compatible |
| `/privacy` | Localized trust, privacy, consent, and data-use policy | None |

Authentication is requested only when the visitor saves a recommendation, creates a farm, accesses personal history, requests expert escalation, or completes a transaction.

## 5. Public Information Architecture

Build sections in this order:

1. Multilingual ANVAYA hero with live KisanMitra interaction
2. Live Intelligence Strip
3. Mission Control preview
4. Farm Digital Twin
5. ANVAYA Decision Loop
6. Complete Farming Lifecycle
7. Connected Commerce
8. Asha Farmer Impact Story, labeled Illustrative demo
9. Ecosystem and Partner Value
10. Trust Architecture
11. Mobile and Offline Experience
12. Final CTA
13. Minimal footer

## 6. Hero Experience

The hero is one immersive full-width Bharat farm scene. It is not a split card layout and does not contain a login card.

The visual base is an optimized generated aerial farm image. Lightweight overlays communicate cloud shadow, weather flow, crop-health zones, water stress, irrigation channels, satellite scan, and market or route signals. Motion must express data or environmental state.

Required content:

- Eyebrow: ANVAYA AGRICULTURE OS
- Brand: ANVAYA
- Reviewed 23-language promise viewport
- Farmer-free commercial assurance
- Primary CTA: Ask KisanMitra
- Secondary CTA: Explore Mission Control
- Trust line: No farmer subscription. No hidden platform-access fee.

The next intelligence section must remain visibly hinted at on mobile and desktop.

## 7. KisanMitra Decision Model

Every important response contains:

1. Verdict
2. Reason
3. Expected impact
4. Confidence or data basis
5. Recommended next action
6. Human escalation where required

Avoid long chat paragraphs. Prefer decisive cards with progressive detail.

The first demo interaction supports text, voice, camera, and image upload. Unsupported browser capabilities always have a text or file fallback.

## 8. Language Architecture

Priority order:

1. Confirmed manual preference
2. Authenticated profile language
3. Browser or device language
4. Consent-based regional suggestion
5. English fallback

Manual selection always wins.

English, Hindi, and Marathi are the complete phase-one application dictionaries. All other languages may enter the brand-promise preview only after review. A partial application dictionary must never activate.

All user-facing strings come from typed dictionaries. Broad JSX-literal lint exemptions are prohibited.

Reduced motion stops automatic language cycling and shows the selected or detected language. Screen readers announce only the visible promise.

## 9. Location Consent

Never trigger the browser geolocation prompt on load.

First show:

```text
Personalise language and local farm intelligence using your location.
```

Actions:

- Use my location
- Choose language manually
- Not now

GPS language processing remains client-side. Show no more than four likely languages plus All languages. A suggestion remains temporary until confirmed and must offer immediate Undo or Change.

Do not infer a permanent language from location. Do not store precise coordinates until a farmer deliberately saves a farm location.

## 10. Bharat Field Atlas Design System

### Kshetra Rekha

Field boundaries, crop rows, terrace contours, and irrigation channels provide the geometry for maps, data paths, progress lines, and section transitions.

### Ritu Rang

Use a varied agricultural palette:

- Deep field green for primary actions
- Emerald for healthy state
- Monsoon blue for information and water
- Mitti red for earth and grounded accents
- Haldi gold for opportunity and harvest
- Indigo for intelligence and institutional context
- Cotton white and mineral white for breathing space

Do not use one-note green, beige, brown, dark-blue, or purple themes. The Bharat tricolour is not the primary design language.

### Regional cultural accents

Regional accents appear only after self-selected context and remain secondary to the product. They may draw from locally reviewed textile rhythm, field geometry, crop forms, and agricultural practices.

Do not copy sacred symbols, imitate folk art superficially, or combine unrelated regional traditions into a decorative collage. Production cultural assets require local artist commissioning or review.

### Interface foundations

- Modern sans-serif typography with complete Indic glyph coverage
- 20-24 px card radii where specified
- Restrained borders and low shadows
- No nested cards
- Minimum 56 px primary farmer controls
- Strong numeric hierarchy with Latin digits and Indian INR grouping
- No stock-photo hero, rustic clip art, decorative gradient orbs, or ornamental motion

## 11. Mission Control

Mission Control presents everything requiring attention in one place.

Cards:

- Today's Decision
- Climate Intelligence
- Crop Doctor
- Market Pulse
- Water Intelligence
- Farm Finance
- Equipment Network
- Opportunity Centre

Each card contains one verdict, one supporting reason, and one action. Detail opens progressively.

## 12. Farm Digital Twin

The twin connects:

- Plot boundaries
- Crop type and stage
- Soil condition
- Weather and water
- Disease risk
- Input inventory
- Expected yield
- Current cost and expected revenue
- Insurance status
- Market conditions

Sample controls must visibly change connected outcomes rather than operate as isolated widgets.

## 13. ANVAYA Decision Loop

The sequence is:

```text
OBSERVE > UNDERSTAND > PREDICT > RECOMMEND > CONNECT > LEARN
```

Animation shows intelligence moving through the loop. Reduced-motion mode shows all steps without automatic sequencing.

## 14. Complete Farming Lifecycle

The interactive lifecycle contains:

```text
Plan > Prepare > Finance > Plant > Protect > Grow > Harvest > Sell > Transport > Store > Account > Learn
```

Each stage reveals the farmer need, available intelligence, next action, relevant service, and possible transparent commercial event.

## 15. Connected Commerce

Commerce appears only when relevant to an actual need.

- Inputs show categories first and at least three options where possible.
- Equipment ranks same-village and nearby availability first.
- Buyer comparisons show price, quality conditions, payment timing, deductions, logistics responsibility, and verification.
- Finance and insurance show estimated eligibility, regulated provider identity, and explicit sharing consent.
- Storage and logistics show availability, distance, price, terms, provider, booking reference, and platform fee.
- Sponsored placement never silently changes the principal recommendation.

## 16. Commercial Events

Phase-one events include input referrals, equipment bookings, warehouse and logistics bookings, buyer leads, finance consent, loan or insurance referrals, and partner campaign views.

Every event records:

- Event type
- Farmer consent status where applicable
- Provider
- Recommendation source
- Timestamp
- Transaction value
- Platform revenue
- Disclosure shown
- Status
- Cancellation or reversal status
- Demo or live mode

Client code never writes platform revenue directly. The normal farmer interface does not expose internal platform revenue.

## 17. Demo Data and Failure Behavior

The full story runs with zero paid API keys.

One canonical Asha dataset in Nashik, Maharashtra supplies tomato and soybean context to every section. All simulated outcomes are labeled Illustrative demo.

Providers return one of:

```text
live | cached | seeded-demo | unavailable
```

Every card displays source and freshness where relevant. Integration failure affects only its own card.

No invented farmer counts, state counts, commercial scale, or accuracy claims may appear.

## 18. Agricultural Safety

- No pesticide dosage or application-method instructions
- No guaranteed diagnosis, approval, yield, price, or financial outcome
- Confidence, severity, reasoning, safe next step, and expert escalation on diagnosis
- Mandatory officer or licensed-expert escalation for high severity or low confidence
- No single pesticide brand recommendation
- Restricted agrochemicals cannot be purchased directly
- Category-first options with transparent choice

The safety firewall runs after AI parsing and before rendering.

## 19. Security and Privacy

- Official Supabase sessions replace local plaintext password accounts.
- Server keys never enter the browser bundle.
- Zod validates every route input and output.
- Farmer media uses private storage and signed access.
- Farmer-owned tables use own-record RLS.
- Consent purpose, version, timestamp, and withdrawal are recorded.
- Operational logs exclude images, precise coordinates, phone numbers, and personal prompt content.

## 20. Accessibility

- WCAG 2.2 AA contrast, focus, keyboard access, landmarks, labels, and errors
- Correct document language and RTL direction
- Voice and camera alternatives
- Risk, source, sponsorship, and severity never depend on color alone
- Stable text containers and no layout shift during language rotation
- Verification at 200 percent zoom, 320 px width, and reduced motion
- Script-rendering checks for all 23 preview languages

## 21. Performance and Offline

- Initial JavaScript target below 200 KB gzip
- LCP below 2.5 seconds on simulated slow 3G
- Server-rendered landing sections with small client islands
- Lazy-load Leaflet, charts, camera internals, and below-fold motion
- Optimized AVIF/WebP visual assets
- Offline shell for `/`, `/ask`, and `/mission-control`
- Save-Data and low-power static fallbacks
- Per-service timeouts and stale-while-revalidate caching

## 22. Mobile and Desktop

Mobile bottom navigation:

```text
Home | Ask | My Farm | Market | More
```

Ask is the central primary action. Mobile prioritizes voice, camera, large choices, offline continuity, and minimal typing.

Desktop uses a mission-control canvas, contextual side panel, expandable intelligence, Farm Digital Twin, and activity timeline. It must not resemble a conventional admin dashboard.

## 23. Investor Demo Story

The three-minute story uses the real product UI:

1. Multilingual ANVAYA identity
2. Consent-based language suggestion
3. Irrigation decision
4. Structured impact and reasoning
5. Sample crop image diagnosis
6. Expert escalation
7. Market comparison
8. Nearby equipment
9. Demo booking
10. Automatic expense
11. Illustrative ecosystem revenue event
12. Season profitability
13. Farm Digital Twin conclusion

The presenter lens is discreet and permanently labels simulated information.

## 24. Phase Gates

Each approved phase must:

1. Implement the scoped work.
2. Run lint, typecheck, tests, and production build.
3. Start the local development server.
4. Verify 390x844 and 1440x900.
5. Capture named screenshots.
6. Record the primary interaction.
7. Produce a walkthrough artifact.
8. Wait for approval before the next major phase.

The product is not complete while the build is failing, a language screen is partial, an unsafe recommendation can render, an integration failure blocks the page, or simulated information is presented as verified performance.

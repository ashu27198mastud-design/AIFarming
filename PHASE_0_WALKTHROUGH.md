# ANVAYA Phase 0 Walkthrough

**Status:** Complete - awaiting approval
**Date:** 2026-07-17

## Objective

Establish the ANVAYA Agriculture OS product contract, a repeatable quality baseline, and explicit safety-policy tests before the user-facing rebuild begins.

## Delivered

- Replaced the active repository guidance with the approved ANVAYA product, cultural-design, language, consent, safety, and commercial-integrity contract.
- Preserved the former KisanMitra documents as historical references.
- Added Vitest and eight focused policy tests for language resolution, geolocation consent, expert escalation, evidence labels, commercial disclosure, and unsafe agricultural claims.
- Isolated the stale locked Next.js output and restored clean production builds.
- Fixed the legacy multilingual wordmark containment defect found during desktop verification.

## Acceptance Evidence

| Check | Result |
| --- | --- |
| `npm run lint` | Pass: 0 errors; 18 existing warnings documented for later cleanup |
| `npm run typecheck` | Pass |
| `npm run test` | Pass: 8 tests |
| `npm run build` | Pass |
| 390x844 verification | Pass: no horizontal overflow; wordmark and tagline do not overlap |
| 1440x900 verification | Pass: no horizontal overflow; wordmark and tagline do not overlap |
| Demo entry | Pass: `View without login (demo)` reaches `/setup` |
| Browser console | Pass: no warnings or errors during the final walkthrough |

## Visual Evidence

- [Mobile login baseline](walkthroughs/phase-0/mobile-390x844.jpg)
- [Desktop login baseline](walkthroughs/phase-0/desktop-1440x900.jpg)
- [Demo profile handoff](walkthroughs/phase-0/demo-entry-390x844.jpg)

The login and setup screens intentionally remain the legacy KisanMitra experience in Phase 0. The primary interaction record is the mobile before-and-after sequence from login to the profile-setup handoff.

## Known Follow-Ups

- Phase 1 replaces the legacy identity with ANVAYA, introduces the explicit language-choice hierarchy, and adds consent-first location behavior.
- `npm audit` reports two moderate findings: a nested PostCSS advisory surfaced through Next.js. The proposed automatic remediation is an unsafe Next.js downgrade, so no forced fix was applied.
- The production build currently fetches Google fonts. Phase 1 should bundle or self-host the required font files so builds do not depend on external font availability.
- Eighteen existing lint warnings remain in legacy code; there are no lint errors.

## Approval Gate

Approve Phase 0 to begin **Phase 1 - Brand, Language, and Consent Foundation**.

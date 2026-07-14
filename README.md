# KisanMitra Predict

KisanMitra Predict is a farmer-first AI farming copilot for crop diagnosis, preventive guidance, crop selection, fertilizer planning, weather risk, and mandi price decisions.

The hackathon pitch:

> Before the farmer loses money, KisanMitra predicts risk and recommends the safest, most profitable action to take today.

## What It Does

- Capture or upload crop photos for AI disease understanding.
- Explain the likely issue, severity, confidence, visible signs, missing evidence, and next steps.
- Predict farm risk using weather, scan history, crop stage, and market context.
- Recommend crops using season fit, water need, weather risk, disease sensitivity, and market potential.
- Suggest fertilizer categories and safety guidance without unsafe dosage claims.
- Pull mandi prices from data.gov.in when configured, with fallback demo data when offline.
- Give sell/wait/compare guidance based on price trend, modal price, and market spread.
- Work as a mobile-friendly PWA with Hindi, Marathi, and English support.

## Core Screens

- Predictive cockpit: today's best action, farm readiness score, disease risk, and mandi area.
- Crop disease scan: take a photo or upload from gallery, then analyze crop disease.
- Prevent loss: weather-driven fungal, wind, heat, spray, and follow-up alerts.
- Crop selection: ranked crop recommendations with explainable score.
- Fertilizer selection: organic-first and mineral-category guidance.
- Mandi prices: live/fallback market data, trend, price spread, and sell-readiness signal.
- Farmer education: short rules for crop choice, fertilizer safety, and market timing.

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Gemini API for crop image analysis
- Open-Meteo for weather
- data.gov.in Agmarknet API for mandi prices
- Zustand for local farm state
- PWA service worker and manifest

## Environment Variables

Create `.env.local` for live services:

```bash
GEMINI_API_KEY=your_gemini_api_key
DATA_GOV_API_KEY=your_data_gov_api_key

NEXT_PUBLIC_FIREBASE_API_KEY=optional
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=optional
NEXT_PUBLIC_FIREBASE_PROJECT_ID=optional
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=optional
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=optional
NEXT_PUBLIC_FIREBASE_APP_ID=optional
```

If keys are missing, the app falls back to demo or simulated data where possible.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Hackathon Demo Story

1. Asha opens KisanMitra in Nashik.
2. The cockpit says whether spraying is safe today and shows the farm readiness score.
3. She uploads a leaf photo.
4. The app explains the likely crop disease, visible symptoms, severity, and immediate action.
5. It recommends the best crop option, fertilizer category, and market decision.
6. She learns why the recommendation was made in simple language.

## Safety Notes

- AI diagnosis is guidance, not a certified agronomist replacement.
- The app avoids pesticide dosage recommendations.
- Severe, unclear, or fast-spreading symptoms should be confirmed with a local agriculture officer or certified agronomist.

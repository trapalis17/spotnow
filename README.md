# Vibe ✳ — Frontend-only interactive preview

Expo React Native/Web UI. All venues and rankings are demo data. No backend, external APIs, GPS, or server. Onboarding, authentication, recommendations, swipe, map, favorites, and profile are simulated client-side.

## Run

```bash
npm install
npm run web
```

The previous `trapalis17/vibe-app` repository remains untouched. This repository is for UI iteration before backend development.

## Vibe Swipe — taste learning (frontend-only)

The Discover screen includes an optional **Vibe Swipe** entry above venue recommendations. This is **not** a venue-finding/booking swipe: its cards describe atmosphere, aesthetic and outing concepts, never specific businesses.

- Swipe right or tap **My vibe** for a positive preference.
- Swipe left or tap **Not mine** for a negative preference.
- **Skip** is neutral and the card is marked seen.
- Progress persists locally in AsyncStorage (`vibe:taste-feedback:v1`), independent of signup preferences and existing venue likes.
- Review your **Vibe DNA**, including liked/disliked qualities, or reset it without changing signup selections.
- There are 24 fixed fictional concept cards. The second set unlocks after 6 responses, and unseen/uncertain traits are prioritized. No infinite feed or real ML inference is claimed.
- Demo venue metadata contains fictional taste tags and estimated budgets; a lightweight local heuristic adjusts the **approximate Vibe Match %**. Distance, neighborhood choices and budget remain distinct ranking signals.
- Decorative photos use fixed Unsplash image URLs (static image files, **not an API**); gradients provide a visual fallback if images are unavailable.
- The existing spot list, spot swipe and mock map remain available; the spot swipe is explicitly labeled **Swipe spots**.

No signup preference is inferred from a Vibe Swipe answer; Vibe DNA only contains user-provided taste feedback. This is not a psychological/personality assessment. No account, backend, authentication or network API is used for preference storage or scoring.

# Vibe ✳ — Frontend-only interactive preview

Expo React Native/Web UI. All venues and rankings are demo data. No backend, external APIs, GPS, or server. Onboarding, authentication, recommendations, swipe, map, favorites, and profile are simulated client-side.

## Run

```bash
npm install
npm run web
```

The previous `trapalis17/vibe-app` repository remains untouched. This repository is for UI iteration before backend development.

## Vibe Swipe — named demo venues, eight per 24 hours

Discover retains its optional top-of-screen **Vibe Swipe** card. Tapping it now opens **8 specific, named fictional cafés, bars or restaurants**, not abstract lifestyle concepts.

- Each card has the **venue name**, mock area, illustrative stock photo, venue attributes and a clickable **venue details** link.
- **Right** / My vibe = like, **left** / Not mine = dislike, **Skip** = neutral.
- The first eight-venue session starts on the **first opening** of Vibe Swipe. Its eight IDs, votes, DNA and 24-hour start time persist in AsyncStorage (`vibe:daily-venue-swipe:v1`).
- Reopening the swipe before 24 hours preserves the current eight; it **does not** issue more cards. Once all eight are rated, the modal shows the next-unlock countdown.
- At least **24 elapsed hours** after the session begins, the next opening (or an active modal refresh) issues exactly eight new spots. Cards are not repeated until the finite **40-venue demo pool** is exhausted (five batches); then it cycles again.
- Ratings feed an **explainable, heuristic Vibe DNA** and estimated Vibe Match %, but do not change explicit signup budget, neighborhoods or personal preferences. Resetting Vibe DNA **does not reset the daily limit**.
- Everything is local; no bookings, server, API calls, verification of venue details or personal account.
- Venue names, locations and images are mock data. Static Unsplash image files require image network access; they are *illustrative*, **not actual venue photography**.
- The original **Swipe spots**, list, area filters, mock map, saved venues and onboarding remain available.

Because this is an offline-only prototype, the 24-hour timer relies on the device clock and local storage. A production-wide quota would require an authenticated server time source and backend persistence.

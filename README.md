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

## For You — personalized discovery

New **Για σένα / For You** bottom tab, following the existing Vibe purple/lime/rose visual language with gradients, photographic editorial cards and subtle interactive states.

- One featured **Top Pick**, a horizontal **Next on your radar** carousel, and a **More your vibe** feed.
- Every recommendation is clickable and opens the existing venue detail screen. Hearts reuse locally stored Favorites.
- Uses the existing signup preferences (mood, outing type, budget, preferred neighborhoods, music/atmosphere), selected search area, accumulated 8-per-24h Vibe Swipe likes/dislikes, and favorites.
- Clear reasons explain each estimated **Vibe Match %**; the number is a deterministic *mock ranking estimate*, not a verified personality or business-compatibility measure.
- Category chips (All / Coffee / Food / Drinks), **Within my budget** and **My areas** filters are interactive and optional.
- If swipe has never been used, recommendations work from signup preferences alone; a link back to Discover encourages further learning, but does not require it.
- Athens demo venues now use representative coordinates and names from the exact 30 signup neighborhoods so area preferences can match sample locations.
- All 40 example venues are fictional, with illustrative photo URLs and approximate demo spend. **No network API, server, database, or backend** is involved in personalized rankings.

## Demo account navigation

- **New user:** Welcome → Onboarding → Register → Discover.
- **Returning user:** Welcome → Login → Discover. Login restores the local profile and saved onboarding preferences; no real password authentication occurs.
- **Edit preferences:** Profile → Onboarding (edit mode) → Profile; For You → Onboarding (edit mode) → For You. Save and Cancel stay inside the logged-in experience.
- **Logout:** Profile → Welcome, clearing only the active session while keeping the on-device demo account, chosen preferences, favorites and Vibe DNA. Tabs check the stored session before displaying.
- Previously created demo profiles are preserved on logout through a local account migration.

The login/register forms remain frontend-only demos: passwords are not checked against a server or stored as credentials.

## Vibe v2 frontend improvements (feature branch)
- The top Discover entry opens an abstract **Taste Swipe**: aesthetic concepts and experiences, not venue discovery. It accepts right/left gestures and clickable Like / Dislike / Skip actions. Concept votes persist locally and the Vibe DNA can be reviewed or reset.
- The separate venue Swipe Spots mode was removed from Discover to avoid competing swiping interfaces; List and Map remain.
- **For You** now reads abstract taste feedback. Its taste match calculation excludes budget, preferred neighborhoods and travel distance, which remain separate sorting/filter criteria. When taste evidence is absent, cards avoid claiming a numeric match.
- Profile displays the learned Vibe DNA and supports resetting it. Saved supports on-device collections; venue details allow voluntary post-visit feedback.
- Onboarding no longer immediately requests GPS permission. The user explicitly triggers nearby suggestions; manual selection and the 30-area dataset remain available. Budget is labeled per person.
- All data and features remain mock/local. No new backend, authentication service or venue API was added.
- Regression tests are included in `tests/vibe-v2.test.ts` and can be run with `npm test` after dependencies are installed.

**Limitations:** This branch has not been runtime-tested in Expo here. Collection UI currently supports creating/deleting collections and adding saved venues; renaming, visit-feedback-driven ranking, daily concept caps, a calibrated confidence model, and a production authentication flow remain future work. The 40 fictional venues are intentionally unchanged.

## Real-venue taste swipe update
The **Taste Swipe** on Discover now uses ten curated, existing Athens venues identified from public venue listings (e.g., Six d.o.g.s., The Clumsies, Neratzia Bistro, Kalimeres, Nomad, Gaston). Cards show only venue names, neighborhoods and broad publicly supported categories. **No live inventory, confirmed opening hours, prices, current imagery, or venue API** are available. Gradient artwork avoids presenting stock photos as actual venue photographs. Feedback learns the user’s taste and influences the fictional For You dataset. The separate search uses demo stores. There are up to eight cards per rolling 24-hour session, until the small curated pool is exhausted. Add more vetted real venues to expand the pool.

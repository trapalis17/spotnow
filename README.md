# spotnow ✳ — Frontend UI Preview

**spotnow is an interactive, frontend-only mobile venue-discovery prototype built with Expo / React Native / Web.**
The interface is designed for a light, editorial, Gen Z style: clear typography, restrained violet gradients, short copy and readable cards.

## Current experience

- **Welcome / demo account:** local signup and email-only demo login (no real password verification).
- **Onboarding:** three simple steps for taste, outing types and preferred locations/budget. Exactly 30 supported Attica neighborhoods; the user can request 7 nearest or manually select areas. Budget options: €5 / €10 / €20 / €40 / €60+ per person.
- **Discover:** searchable demo venue results, category and location filters, List / Map toggle and a prominent Vibe Swipe entry.
- **Vibe Swipe:** a curated collection of ten named, existing Athens venues. Like / Pass / Skip teaches a local **Vibe DNA**; eight swipes per rolling 24-hour session. Cards deliberately use editorial gradients instead of presenting stock photos as actual venue photos.
- **For You:** personalized ranked *fictional demo* venues. Taste-based match estimate is separate from geographic/budget sorting and filters.
- **Saved:** on-device saved venues and customizable collections (create, rename, delete, assign).
- **Profile:** Vibe DNA summary, editable signup preferences, reset taste and logout.
- **Venue details:** demo venue attributes, map and an optional voluntary post-visit feedback control.
- **Local demo analytics:** some interactions are stored in on-device event history only.

All screens are clickable, but this is **not** a production venue directory. The current real-place swipe cards identify real businesses using curated names and broad categories, **not** verified live opening hours, prices, location feeds, real venue photos, or bookable availability. All discovery / For You venues remain fictional mock data. The current set of real swipe cards is limited to ten, so it does not yet support a long-running daily stream of eight unique venues.

## Run

```bash
npm install
npm run web
```

To run on a device with Expo Go, use `npx expo start`. Check that your Expo Go version supports Expo SDK 58.

## Quality checks

```bash
npm run typecheck
npm test
```

The feature branch includes a GitHub Actions workflow running these checks on pull requests. This confirms TypeScript and basic rules, not complete visual and device testing.

## Data & privacy boundaries

No backend, database, authentication provider or third-party venue API is connected to **this** repository. Demo account, swipes, collections, feedback, and preferences use AsyncStorage on the device. Location is requested only after user action; selected neighborhoods can be entered manually. Network images, where used, are illustrations rather than real venue photos.

The unrelated `vibe-app` and GameNow repositories are not part of this prototype.

## Production work remaining

- Proper user authentication and server-side persistence
- Verified, licensed venue information and photography
- Larger curated real-venue coverage
- Robust and validated personalization / venue evidence
- Full accessibility, security, mobile device, navigation and layout QA

The frontend-only implementation intentionally avoids claiming these production capabilities are already provided.

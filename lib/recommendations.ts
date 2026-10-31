import type { RecommendationResult, UserPreferences, Venue, VenueCategory, PriceBand } from '../types';

/**
 * Deterministic, local-only recommendation scoring for DEMO venue attributes.
 * No external AI model or training data is used.
 */
const fold = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const matches = (text: string, terms: string[]): boolean => terms.some((term) => text.includes(fold(term)));
const intersects = (left: string[], right: string[]): boolean => {
  const normalized = new Set(left.map(fold));
  return right.some((item) => normalized.has(fold(item)));
};

interface Intent {
  moods: string[];
  category?: VenueCategory;
  priceLimit?: PriceBand;
  outdoors: boolean;
  indoors: boolean;
}

export function parseIntent(input = ''): Intent {
  const text = fold(input);
  const moods: string[] = [];
  if (matches(text, ['romantic', 'date night', 'date', 'ρομαντικ', 'ραντεβου'])) moods.push('romantic');
  if (matches(text, ['cozy', 'warm', 'χουχουλια', 'ζεστ'])) moods.push('cozy');
  if (matches(text, ['quiet', 'calm', 'χωρις φασαρια', 'ησυχ'])) moods.push('quiet');
  if (matches(text, ['lively', 'party', 'energetic', 'ζωνταν', 'παρτι'])) moods.push('lively');

  let category: VenueCategory | undefined;
  if (matches(text, ['brunch'])) category = 'brunch';
  else if (matches(text, ['coffee', 'cafe', 'καφε'])) category = 'cafe';
  else if (matches(text, ['restaurant', 'dinner', 'εστιατορι', 'φαγητο'])) category = 'restaurant';
  else if (matches(text, ['bar', 'drinks', 'cocktail', 'ποτο', 'μπαρ'])) category = 'bar';

  let priceLimit: PriceBand | undefined;
  if (matches(text, ['very cheap', 'very low budget', 'πολυ φθην'])) priceLimit = 'budget';
  else if (matches(text, ['cheap', 'affordable', 'budget', 'not too expensive', 'not expensive', 'οικονομικ', 'φθην', 'οχι πολυ ακριβ'])) priceLimit = 'mid';

  const outdoors = matches(text, ['outside', 'outdoors', 'terrace', 'εξω', 'αυλη', 'ταρατσα']);
  const indoors = matches(text, ['inside', 'indoors', 'εσωτερικ', 'μεσα']);
  return { moods, category, priceLimit, outdoors, indoors };
}

const priceOrder: Record<PriceBand, number> = { budget: 1, mid: 2, premium: 3 };

function userBudgetLimit(budget: number): number {
  return budget < 40 ? 1 : budget < 80 ? 2 : 3;
}

function isEligible(venue: Venue, preferences: UserPreferences, intent: Intent): boolean {
  const ceiling = Math.min(
    userBudgetLimit(preferences.budget),
    intent.priceLimit ? priceOrder[intent.priceLimit] : 3,
  );
  if (priceOrder[venue.priceBand] > ceiling) return false;
  if (intent.category && venue.category !== intent.category) return false;
  if (intent.outdoors && !venue.outdoor) return false;
  if (intent.indoors && !venue.indoor) return false;
  return true;
}

function rankVenue(venue: Venue, preferences: UserPreferences, intent: Intent): RecommendationResult {
  let score = 12;
  const reasons: string[] = [];

  if (intersects(intent.moods, venue.moodTags)) {
    score += 28;
    reasons.push('Matches the mood you asked for');
  }
  if (intersects(preferences.moods, venue.moodTags)) {
    score += 14;
    reasons.push('Matches your saved mood preferences');
  }
  if (intersects(preferences.atmosphere, venue.atmosphere)) {
    score += 10;
    reasons.push('Matches your preferred atmosphere');
  }
  if (intersects(preferences.music, venue.music)) {
    score += 8;
    reasons.push('Matches your music preferences');
  }
  if (preferences.neighborhoods.map(fold).includes(fold(venue.neighborhood))) {
    score += 12;
    reasons.push('In one of your preferred neighborhoods');
  }
  if (priceOrder[venue.priceBand] <= userBudgetLimit(preferences.budget)) {
    score += Math.max(5, 14 - 4 * (userBudgetLimit(preferences.budget) - priceOrder[venue.priceBand]));
    reasons.push('Within your selected budget range');
  }
  if (intent.outdoors && venue.outdoor) {
    score += 8;
    reasons.push('Has outdoor seating');
  }
  if (intent.indoors && venue.indoor) {
    score += 8;
    reasons.push('Has indoor seating');
  }
  if (intent.category && intent.category === venue.category) {
    score += 10;
    reasons.push('Matches your requested venue type');
  }
  if (intent.moods.includes('quiet') && venue.quiet) {
    score += 7;
    reasons.push('Listed as a quiet venue');
  }
  if (intent.moods.includes('lively') && venue.lively) {
    score += 7;
    reasons.push('Listed as a lively venue');
  }

  // Small deterministic tiebreak signals; demo metrics are not verified real-world ratings.
  score += Math.min(4, Math.max(0, venue.groupSuitability / 25));
  score += Math.max(0, 4 - venue.distanceKm);

  return {
    venue,
    score: Math.min(100, Math.round(score)),
    reasons: reasons.length ? reasons.slice(0, 4) : ['Suggested using the available demo venue attributes'],
  };
}

export function getRecommendations(
  venues: Venue[],
  preferences: UserPreferences,
  intentInput = '',
): RecommendationResult[] {
  const intent = parseIntent(intentInput);
  return venues
    .filter((venue) => isEligible(venue, preferences, intent))
    .map((venue) => rankVenue(venue, preferences, intent))
    .sort((a, b) => b.score - a.score || a.venue.id.localeCompare(b.venue.id))
    .slice(0, 5);
}

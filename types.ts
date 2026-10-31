export type VenueCategory =
  | 'cafe'
  | 'restaurant'
  | 'bar'
  | 'brunch'
  | 'nightlife';

export type PriceBand = 'budget' | 'mid' | 'premium';

export interface UserPreferences {
  moods: string[];
  outings: string[];
  budget: number;
  music: string[];
  neighborhoods: string[];
  atmosphere: string[];
  social: string[];
  timeSlots: string[];
}

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  neighborhood: string;
  city: string;
  priceBand: PriceBand;
  moodTags: string[];
  atmosphere: string[];
  music: string[];
  seating: string[];
  description: string;
  image: string;
  rating: number;
  distanceKm: number;
  groupSuitability: number;
  budgetScore: number;
  indoor: boolean;
  outdoor: boolean;
  quiet: boolean;
  lively: boolean;
  amenities: string[];
}

export interface RecommendationResult {
  venue: Venue;
  score: number;
  reasons: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: UserPreferences;
}

/** Real venue data from OpenStreetMap. Optional data stays unknown, never fabricated. */
export interface RealPlace {
  id: string;
  osmId: number;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  category: VenueCategory;
  latitude: number;
  longitude: number;
  city: string;
  neighborhood: string;
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  cuisine?: string;
  outdoorSeating?: boolean;
  wheelchair?: string;
  distanceKm: number;
  source: 'OpenStreetMap';
  approximatePin: boolean;
}

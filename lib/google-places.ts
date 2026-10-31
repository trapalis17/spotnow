import type {TasteTag} from './vibe-dna';
export interface GooglePlace {
  id: string;
  name: string;
  category: 'cafe' | 'restaurant' | 'bar';
  address?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  primaryType?: string;
  types: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  phone?: string;
  website?: string;
  openNow?: boolean;
  weekdayDescriptions?: string[];
  businessStatus?: string;
  outdoorSeating?: boolean;
  goodForGroups?: boolean;
  liveMusic?: boolean;
  servesCocktails?: boolean;
  servesCoffee?: boolean;
  servesBrunch?: boolean;
  reservable?: boolean;
  allowsDogs?: boolean;
  accessibility?: string[];
  editorialSummary?: string;
  /** Locally-authored, fictional venue taste metadata for the frontend mock. */
  tasteTags?: TasteTag[];
  photoName?: string;
  photoAttributions?: { displayName: string; uri?: string }[];
}
export const isGooglePlaceId=(id:string):boolean=>/^[a-zA-Z0-9_-]{8,150}$/.test(id);

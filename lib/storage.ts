import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, UserProfile } from '@/types';
import type { SwipeFeedback, SwipeDecision } from './swipe-intelligence';
import { isGooglePlaceId } from './google-places';

const USER_KEY = 'vibe:user';
const PREFS_KEY = 'vibe:prefs';
const SAVED_KEY = 'vibe:saved';
const ONBOARDED_KEY = 'vibe:completed-onboarding';
const SWIPE_KEY = 'vibe:swipe-feedback:v1';
let swipeWriteQueue: Promise<void> = Promise.resolve();
let savedWriteQueue: Promise<void> = Promise.resolve();

export const defaultPreferences: UserPreferences = {
  moods: ['cozy', 'creative'],
  outings: ['coffee with friends', 'date night'],
  budget: 60,
  music: ['indie', 'jazz'],
  neighborhoods: ['Kolonaki', 'Plaka'],
  atmosphere: ['warm', 'chill'],
  social: ['small group'],
  timeSlots: ['evening'],
};

export async function getUser(): Promise<UserProfile | null> {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as UserProfile) : null;
}

export async function setUser(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getPreferences(): Promise<UserPreferences> {
  const value = await AsyncStorage.getItem(PREFS_KEY);
  return value ? (JSON.parse(value) as UserPreferences) : defaultPreferences;
}

export async function setPreferences(pref: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(pref));
}

export async function getSavedVenueIds(): Promise<string[]> {
  const value = await AsyncStorage.getItem(SAVED_KEY);
  return value ? (JSON.parse(value) as string[]) : [];
}

export async function toggleSavedVenue(id: string): Promise<string[]> {
  const saved = await getSavedVenueIds();
  const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export async function isOnboarded(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDED_KEY);
  return value === 'true';
}

export async function setOnboarded(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, String(value));
}

/** Persist user-generated likes/passes by Google Place ID only, never Google venue metadata. */
export async function getSwipeFeedback(): Promise<SwipeFeedback> {
  try {
    const raw = await AsyncStorage.getItem(SWIPE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id,v]) =>
      isGooglePlaceId(id) && (v === 'like' || v === 'pass')).slice(-500)) as SwipeFeedback;
  } catch { return {}; }
}

/** Replace feedback atomically from the app's current state. */
export function saveSwipeFeedback(feedback: SwipeFeedback): Promise<void> {
  const safe=Object.fromEntries(Object.entries(feedback)
    .filter(([id,v]) => isGooglePlaceId(id) && (v === 'like' || v === 'pass')).slice(-500));
  // Preserve vote order even if a user swipes quickly.
  swipeWriteQueue=swipeWriteQueue.catch(()=>undefined).then(()=>
    AsyncStorage.setItem(SWIPE_KEY, JSON.stringify(safe)));
  return swipeWriteQueue;
}
export function clearSwipeFeedback(): Promise<void> {
  swipeWriteQueue=swipeWriteQueue.catch(()=>undefined).then(()=>AsyncStorage.removeItem(SWIPE_KEY));
  return swipeWriteQueue;
}

/** Unlike toggleSavedVenue, swiping right must never accidentally un-save a venue. */
export async function ensureSavedVenue(id: string): Promise<string[]> {
  if (!id.startsWith('google-') || !isGooglePlaceId(id.slice(7))) throw new Error('Invalid Google Place ID');
  let output: string[]=[];
  const next=savedWriteQueue.catch(()=>undefined).then(async()=>{
    const current=await getSavedVenueIds();
    output=current.includes(id)?current:[...current,id];
    if (!current.includes(id)) await AsyncStorage.setItem(SAVED_KEY,JSON.stringify(output));
  });
  savedWriteQueue=next;
  await next;
  return output;
}

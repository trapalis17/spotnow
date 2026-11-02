import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, UserProfile } from '@/types';
import type { SwipeFeedback, SwipeDecision } from './swipe-intelligence';
import { isGooglePlaceId } from './google-places';
import {sanitizeTasteFeedback} from './vibe-dna';
import type {TasteFeedback} from './vibe-dna';
import {normalizeDailyVenueSwipeState} from './daily-venue-swipe';
import type {DailyVenueSwipeState} from './daily-venue-swipe';

const USER_KEY = 'vibe:user';
const DEMO_ACCOUNT_KEY = 'vibe:demo-account';
const PREFS_KEY = 'vibe:prefs';
const SAVED_KEY = 'vibe:saved';
const ONBOARDED_KEY = 'vibe:completed-onboarding';
const SWIPE_KEY = 'vibe:swipe-feedback:v1';
const DNA_KEY = 'vibe:taste-feedback:v1';
const DAILY_VENUES_KEY='vibe:daily-venue-swipe:v1';
let venueDeckQueue:Promise<void>=Promise.resolve();
let tasteWriteQueue:Promise<void>=Promise.resolve();
let swipeWriteQueue: Promise<void> = Promise.resolve();
let savedWriteQueue: Promise<void> = Promise.resolve();

export const defaultPreferences: UserPreferences = {
  moods: ['cozy', 'creative'],
  outings: ['coffee with friends', 'date night'],
  budget: 60,
  music: ['indie', 'jazz'],
  neighborhoods: ['Κολωνάκι', 'Κουκάκι'],
  atmosphere: ['warm', 'chill'],
  social: ['small group'],
  timeSlots: ['evening'],
};

export async function getUser(): Promise<UserProfile | null> {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as UserProfile) : null;
}

/**
 * The demo account is a local profile, not an authenticated online identity.
 * Keep it through logout so returning to Login restores the same name/email.
 */
export async function getDemoAccount(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(DEMO_ACCOUNT_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function setUser(profile: UserProfile): Promise<void> {
  const serialized = JSON.stringify(profile);
  await AsyncStorage.multiSet([[USER_KEY, serialized], [DEMO_ACCOUNT_KEY, serialized]]);
}

export async function clearUser(): Promise<void> {
  // Upgrade profiles saved before the dedicated demo-account key existed.
  // Logout ends only the session; it never deletes the user's demo identity,
  // selected preferences, favorites or swipe progress.
  const [active, persisted] = await AsyncStorage.multiGet([USER_KEY, DEMO_ACCOUNT_KEY]);
  if (active[1] && !persisted[1]) {
    await AsyncStorage.setItem(DEMO_ACCOUNT_KEY, active[1]);
  }
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getPreferences(): Promise<UserPreferences> {
  const value = await AsyncStorage.getItem(PREFS_KEY);
  return value ? (JSON.parse(value) as UserPreferences) : defaultPreferences;
}

export async function setPreferences(pref: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(pref));
  // Keep the optional profile snapshots consistent with the canonical
  // onboarding preferences; this is not a session/login operation.
  const [active, account] = await AsyncStorage.multiGet([USER_KEY, DEMO_ACCOUNT_KEY]);
  const updates: [string, string][] = [];
  if (active[1]) {
    const profile = JSON.parse(active[1]) as UserProfile;
    updates.push([USER_KEY, JSON.stringify({ ...profile, preferences: pref })]);
  }
  if (account[1]) {
    const profile = JSON.parse(account[1]) as UserProfile;
    updates.push([DEMO_ACCOUNT_KEY, JSON.stringify({ ...profile, preferences: pref })]);
  }
  if (updates.length) await AsyncStorage.multiSet(updates);
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

/** Separate, local-only preference learning. Never mutates signup preferences. */
export async function getTasteFeedback():Promise<TasteFeedback>{
 try{
  const raw=await AsyncStorage.getItem(DNA_KEY);
  return raw?sanitizeTasteFeedback(JSON.parse(raw)):{};
 }catch{return {};}
}
export function saveTasteFeedback(feedback:TasteFeedback):Promise<void>{
 const safe=sanitizeTasteFeedback(feedback);
 tasteWriteQueue=tasteWriteQueue.catch(()=>undefined).then(()=>
   AsyncStorage.setItem(DNA_KEY,JSON.stringify(safe)));
 return tasteWriteQueue;
}
export function clearTasteFeedback():Promise<void>{
 tasteWriteQueue=tasteWriteQueue.catch(()=>undefined).then(()=>
   AsyncStorage.removeItem(DNA_KEY));
 return tasteWriteQueue;
}

/** One local daily quota shared across openings of the Discover screen. */
export async function getDailyVenueSwipeState():Promise<DailyVenueSwipeState>{
 try{
  const raw=await AsyncStorage.getItem(DAILY_VENUES_KEY);
  return normalizeDailyVenueSwipeState(raw?JSON.parse(raw):null);
 }catch{return normalizeDailyVenueSwipeState(null);}
}
export function saveDailyVenueSwipeState(state:DailyVenueSwipeState):Promise<void>{
 const safe=normalizeDailyVenueSwipeState(state);
 venueDeckQueue=venueDeckQueue.catch(()=>undefined).then(()=>
   AsyncStorage.setItem(DAILY_VENUES_KEY,JSON.stringify(safe)));
 return venueDeckQueue;
}

/** Prototype-only, on-device custom collections. */
export type SavedCollection={id:string;name:string;venueIds:string[]};
const COLLECTIONS_KEY='vibe:collections:v1';
export async function getCollections():Promise<SavedCollection[]>{
 try{
  const value=await AsyncStorage.getItem(COLLECTIONS_KEY);
  const parsed=value?JSON.parse(value):[];
  return Array.isArray(parsed)?parsed.filter((c:any)=>typeof c.id==='string'&&typeof c.name==='string'&&Array.isArray(c.venueIds)):[];
 }catch{return [];}
}
export async function saveCollections(collections:SavedCollection[]):Promise<void>{
 await AsyncStorage.setItem(COLLECTIONS_KEY,JSON.stringify(collections));
}
export type VisitFeedback='yes'|'kind-of'|'no';
const VISIT_FEEDBACK_KEY='vibe:visit-feedback:v1';
export async function getVisitFeedback():Promise<Record<string,VisitFeedback>>{
 try{const raw=await AsyncStorage.getItem(VISIT_FEEDBACK_KEY);return raw?JSON.parse(raw):{};}catch{return {};}
}
export async function saveVisitFeedback(id:string,value:VisitFeedback):Promise<void>{
 const current=await getVisitFeedback();
 await AsyncStorage.setItem(VISIT_FEEDBACK_KEY,JSON.stringify({...current,[id]:value}));
}

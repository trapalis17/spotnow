import AsyncStorage from '@react-native-async-storage/async-storage';
import {NEIGHBORHOODS} from './attica-neighborhoods';
/** Static area selector; coordinates are only used to order curated local demo venues. */
export type SearchArea = { id: string; label: string; latitude: number; longitude: number; radius?: number };
/** Each approved Attica neighborhood has a stable ID so demo venue links can reopen. */
export const NEIGHBORHOOD_AREAS:SearchArea[]=NEIGHBORHOODS.map((n,i)=>({
 id:'attica-'+String(i+1).padStart(2,'0'),label:n.name,
 latitude:n.latitude,longitude:n.longitude
}));
export function getNeighborhoodSearchArea(name:string):SearchArea|undefined{
 return NEIGHBORHOOD_AREAS.find(a=>a.label===name);
}
export const AREAS: SearchArea[] = [
  { id: 'athens', label: 'Αθήνα', latitude: 37.9755, longitude: 23.7348 },
  { id: 'palaio-faliro', label: 'Παλαιό Φάληρο', latitude: 37.9291, longitude: 23.6954 },
  { id: 'glyfada', label: 'Γλυφάδα', latitude: 37.8619, longitude: 23.7541 },
  { id: 'kifisia', label: 'Κηφισιά', latitude: 38.0739, longitude: 23.8085 },
  { id: 'piraeus', label: 'Πειραιάς', latitude: 37.9429, longitude: 23.6465 },
  { id: 'thessaloniki', label: 'Θεσσαλονίκη', latitude: 40.6327, longitude: 22.9419 },
  { id: 'heraklion', label: 'Ηράκλειο', latitude: 35.3387, longitude: 25.1442 },
  { id: 'chania', label: 'Χανιά', latitude: 35.5122, longitude: 24.0199 },
  { id: 'rethymno', label: 'Ρέθυμνο', latitude: 35.3693, longitude: 24.4741 },
  { id: 'patras', label: 'Πάτρα', latitude: 38.2466, longitude: 21.7346 },
  { id: 'larisa', label: 'Λάρισα', latitude: 39.6383, longitude: 22.4188 },
  { id: 'volos', label: 'Βόλος', latitude: 39.3610, longitude: 22.9431 },
  { id: 'ioannina', label: 'Ιωάννινα', latitude: 39.6650, longitude: 20.8537 },
  { id: 'kalamata', label: 'Καλαμάτα', latitude: 37.0389, longitude: 22.1142 },
  { id: 'nafplio', label: 'Ναύπλιο', latitude: 37.5674, longitude: 22.8016 },
  { id: 'rhodes', label: 'Ρόδος', latitude: 36.4350, longitude: 28.2175 },
  { id: 'corfu', label: 'Κέρκυρα', latitude: 39.6243, longitude: 19.9217 },
  { id: 'kavala', label: 'Καβάλα', latitude: 40.9376, longitude: 24.4129 },
  { id: 'tripoli', label: 'Τρίπολη', latitude: 37.5083, longitude: 22.3797 },
  { id: 'lamia', label: 'Λαμία', latitude: 38.8996, longitude: 22.4341 },
  ...NEIGHBORHOOD_AREAS,
];
export const DEFAULT_AREA = AREAS[0];
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const toRad = (x: number) => x * Math.PI / 180;
  const dlat = toRad(b.latitude - a.latitude), dlon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dlon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
const KEY='vibe:demo:area';
export async function getSelectedArea():Promise<SearchArea>{try{const id=await AsyncStorage.getItem(KEY);return AREAS.find(a=>a.id===id)??DEFAULT_AREA;}catch{return DEFAULT_AREA;}}
export async function selectArea(area:SearchArea):Promise<void>{await AsyncStorage.setItem(KEY,area.id);}

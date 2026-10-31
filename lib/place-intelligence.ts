import type { UserPreferences } from '../types';
import type { GooglePlace } from './google-places';
import type { SearchArea } from './places';
import { distanceKm } from './places';
import { parseIntent } from './recommendations';
import {getDailyVenueMatchAdjustment} from './daily-venue-swipe';
import type {TasteFeedback} from './vibe-dna';

export type PlaceVibe = { label: string; tags:string[]; evidence:string[]; confidence:'high'|'medium'|'low' };
export type PlaceMatch = { place:GooglePlace; score:number; reasons:string[]; vibe:PlaceVibe };
const norm = (s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const includesAny=(s:string,keys:string[])=>keys.some(k=>s.includes(norm(k)));
/** Explainable, evidence-based content recommender; not a trained ML predictor. */
export function inferPlaceVibe(place:GooglePlace):PlaceVibe {
  const raw=[place.primaryType??'', ...place.types].map(norm);
  const has=(...terms:string[])=>raw.some(x=>terms.some(t=>x===norm(t)));
  const tags=new Set<string>(), evidence:string[]=[];
  if(place.category==='cafe'){tags.add('coffee');tags.add('casual');evidence.push('Κατηγορία: καφέ');}
  if(place.category==='restaurant'){tags.add('food');evidence.push('Κατηγορία: εστιατόριο');}
  if(place.category==='bar'){tags.add('nightlife');tags.add('social');evidence.push('Κατηγορία: bar');}
  if(has('brunch_restaurant','breakfast_restaurant')){tags.add('brunch');tags.add('date');evidence.push('Κατηγορία brunch/πρωινού');}
  if(has('fine_dining_restaurant')){tags.add('premium');tags.add('date');evidence.push('Κατηγορία fine dining');}
  if(has('fast_food_restaurant','meal_takeaway','sandwich_shop')){tags.add('quick');tags.add('budget');evidence.push('Γρήγορο φαγητό');}
  if(has('cocktail_bar','wine_bar')){tags.add('date');tags.add('nightlife');evidence.push('Κατηγορία cocktail/wine bar');}
  if(has('night_club')){tags.add('lively');tags.add('nightlife');evidence.push('Κατηγορία night club');}
  if(has('bakery','dessert_shop','ice_cream_shop')){tags.add('sweet');tags.add('casual');evidence.push('Γλυκά/αρτοποιείο');}
  if(place.outdoorSeating===true){tags.add('outdoor');evidence.push('Διαθέτει εξωτερικό χώρο');}
  if(place.servesCoffee===true)tags.add('coffee');
  if(place.servesCocktails===true){tags.add('cocktails');tags.add('nightlife');}
  if(place.servesBrunch===true)tags.add('brunch');
  if(place.liveMusic===true){tags.add('live');tags.add('lively');evidence.push('Δηλωμένη ζωντανή μουσική');}
  if(place.goodForGroups===true){tags.add('groups');tags.add('social');evidence.push('Κατάλληλο για παρέες');}
  if(place.priceLevel==='PRICE_LEVEL_INEXPENSIVE'){tags.add('budget');evidence.push('Χαμηλή δηλωμένη τιμή');}
  if(place.priceLevel==='PRICE_LEVEL_EXPENSIVE'||place.priceLevel==='PRICE_LEVEL_VERY_EXPENSIVE'){tags.add('premium');evidence.push('Υψηλή δηλωμένη τιμή');}
  // Never claim music genres, noise level, interior design, or romance are observed if missing.
  const label=tags.has('brunch')?'Brunch & coffee':tags.has('cocktails')?'Cocktail nights':
    tags.has('nightlife')?'Night out':tags.has('premium')?'Special occasion':
    tags.has('quick')?'Quick bite':tags.has('coffee')?'Coffee & chill':'Food spot';
  return {label,tags:[...tags],evidence,confidence:evidence.length>=2?'high':evidence.length===1?'medium':'low'};
}
export function rankGooglePlaces(places:GooglePlace[],preferences:UserPreferences|null,prompt:string,area:SearchArea, dna:TasteFeedback={}):PlaceMatch[]{
  const intent=parseIntent(prompt);
  const ptext=norm(prompt);
  const liked=norm([...(preferences?.moods??[]),...(preferences?.outings??[]),...(preferences?.atmosphere??[]),...(preferences?.social??[])].join(' '));
  const categories= intent.category==='nightlife'?'bar':intent.category==='brunch'?'cafe':intent.category;
  return places.map(place=>{
    const vibe=inferPlaceVibe(place),tags=vibe.tags, reasons:string[]=[];
    const distance=distanceKm(area,{latitude:place.latitude,longitude:place.longitude});
    let score=25;
    if(categories){if(place.category===categories){score+=38;reasons.push('Ταιριάζει με τον τύπο εξόδου σου');}else score-=25;}
    if(includesAny(ptext,['brunch','πρωινο'])&&tags.includes('brunch')){score+=25;reasons.push('Brunch στο προφίλ του καταστήματος');}
    if(includesAny(ptext,['κοκτειλ','cocktail','ποτο','drink'])&&tags.includes('cocktails')){score+=20;reasons.push('Cocktail bar');}
    if(includesAny(ptext,['παρεα','φιλ','group','friends'])&&tags.includes('social')){score+=14;reasons.push('Επιλογή για παρέα');}
    if(includesAny(ptext,['ραντεβου','date','ρομαντικ'])&&tags.includes('date')){score+=17;reasons.push('Κατάλληλος τύπος για ραντεβού (εκτίμηση)');}
    if(intent.outdoors){if(tags.includes('outdoor')){score+=25;reasons.push('Δηλωμένος εξωτερικός χώρος');}else score-=3;}
    if(includesAny(liked,['coffee','καφε','cafe'])&&tags.includes('coffee')){score+=12;reasons.push('Σχετικό με τις προτιμήσεις σου για καφέ');}
    if(includesAny(liked,['date','ρομαντικ'])&&tags.includes('date')){score+=12;reasons.push('Σχετικό με τις προτιμήσεις σου για έξοδο');}
    if(includesAny(liked,['night','party','social','παρεα'])&&tags.includes('nightlife'))score+=10;
    if(includesAny(liked,['brunch'])&&tags.includes('brunch'))score+=10;
    // Signup budget is evaluated separately from Vibe DNA and distance.
    if(preferences&&typeof place.demoBudget==='number'){
      const budgetFits=preferences.budget>=60||place.demoBudget<=preferences.budget;
      if(budgetFits){score+=6;reasons.push('Μέσα στο ενδεικτικό budget σου');}
      else{score-=8;reasons.push('Πάνω από το ενδεικτικό budget σου');}
    }
    const preferred=(preferences?.neighborhoods??[]).some(n=>place.address&&norm(place.address).includes(norm(n)));
    if(preferred){score+=12;reasons.push('Βρίσκεται σε περιοχή προτίμησης');}
    score+=Math.max(0,24-Math.round(distance*5));
    if(distance<2)reasons.push('Κοντά στην επιλεγμένη περιοχή');
    if(place.rating!==undefined&&place.userRatingCount!==undefined&&place.userRatingCount>=20){score+=Math.max(0,(place.rating-3)*7);}
    const learned=getDailyVenueMatchAdjustment(place.tasteTags,dna);
    if(learned.reason)reasons.unshift(learned.reason);
    // Explainable estimate, not personality compatibility; DNA never overrides location, budget, or explicit preferences.
    const estimate=Math.max(0,Math.min(100,Math.round(score+learned.delta)));
    return {place,score:estimate,reasons:reasons.length?reasons.slice(0,3):['Με βάση την κατηγορία και την απόσταση'],vibe};
  }).sort((a,b)=>b.score-a.score||a.place.name.localeCompare(b.place.name));
}

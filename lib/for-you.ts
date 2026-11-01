import type {UserPreferences} from '../types';
import type {GooglePlace} from './google-places';
import type {SearchArea} from './places';
import type {TasteFeedback,TasteTag} from './vibe-dna';
import {rankGooglePlaces,type PlaceMatch} from './place-intelligence';
import {getTasteMatchAdjustment} from './vibe-dna';
import {canonicalArea} from './attica-neighborhoods';
import {distanceKm} from './places';
import {getDemoPlaceById} from './demo-places';
import type {VisitFeedback} from './storage';

export type ForYouCategory='all'|'cafe'|'restaurant'|'bar';
export type ForYouMatch=PlaceMatch&{
  areaLabel:string;nearbyKm:number;inBudget:boolean;preferredArea:boolean;
  tasteReasons:string[];tasteTags:TasteTag[];isLiked:boolean;rankScore:number;matchConfidence:'low'|'medium'|'high';
};

const fold=(text:string)=>text.toLocaleLowerCase('el-GR')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

const VALUE_TAGS:Record<string,TasteTag[]>={
 cozy:['cozy','intimate','low-light'],
 romantic:['romantic','intimate','elegant'],
 quiet:['quiet','specialty','minimal'],
 lively:['lively','social','nightlife'],
 creative:['creative','artsy','alternative'],
 social:['social','groups','casual'],
 'coffee with friends':['coffee','social','casual'],
 'date night':['romantic','intimate','low-light'],
 brunch:['brunch','daytime','coffee'],
 'night out':['nightlife','cocktails','lively'],
 'study session':['quiet','coffee','minimal'],
 'casual drinks':['cocktails','casual','social'],
 indie:['indie','alternative','live-music'],
 jazz:['jazz','intimate','live-music'],
 warm:['cozy','intimate'],
 chill:['quiet','casual'],
 bright:['daytime','minimal'],
 'small group':['intimate','cozy'],
 evening:['low-light','nightlife'],
 morning:['daytime','coffee'],
 outdoor:['outdoor','garden'],
 garden:['garden','nature'],
 modern:['minimal','industrial']
};
const LABELS:Partial<Record<TasteTag,string>>={
 cozy:'cozy ατμόσφαιρα',romantic:'ρομαντικό vibe',quiet:'ήσυχο περιβάλλον',
 lively:'ζωντανή ατμόσφαιρα',coffee:'καφές',brunch:'brunch',nightlife:'night out',
 cocktails:'cocktails',minimal:'minimal αισθητική',outdoor:'εξωτερικός χώρος',
 garden:'κήπος',social:'παρέες',creative:'creative αισθητική',
 intimate:'χαλαρές συζητήσεις',elegant:'elegant διάθεση',indie:'indie μουσική',
 jazz:'jazz',artsy:'artsy vibe',specialty:'specialty coffee',daytime:'daytime έξοδος'
};
const categoryNames={cafe:'Καφέ',restaurant:'Φαγητό',bar:'Ποτό'};
export function venueCategoryLabel(category:GooglePlace['category']){return categoryNames[category];}
export function venueAreaLabel(place:GooglePlace):string{
 return place.address?.split('·').slice(-1)[0]?.trim()||'Demo περιοχή';
}
export function tastesFromSignup(preferences:UserPreferences):TasteTag[]{
 const entries=[...preferences.moods,...preferences.outings,...preferences.atmosphere,
   ...preferences.music,...preferences.social,...preferences.timeSlots];
 return [...new Set(entries.flatMap(value=>VALUE_TAGS[fold(value)]??[]))];
}

export function getForYouMatches(
 places:GooglePlace[],preferences:UserPreferences,area:SearchArea,
 votes:TasteFeedback,savedIds:readonly string[]=[],visitFeedback:Record<string,VisitFeedback>={}
):ForYouMatch[]{
 const baseline=rankGooglePlaces(places,preferences,'',area,votes);
 const wanted=new Set(tastesFromSignup(preferences));
 const preferredAreas=new Set(preferences.neighborhoods.map(n=>fold(canonicalArea(n))));
 const saved=new Set(savedIds);
 const visitTags:Record<string,number>={};
 for(const [id,vote] of Object.entries(visitFeedback)){
   const visited=getDemoPlaceById(id);
   if(!visited?.tasteTags)continue;
   const weight=vote==='yes'?1:vote==='no'?-1:0;
   for(const tag of visited.tasteTags)visitTags[tag]=(visitTags[tag]??0)+weight/visited.tasteTags.length;
 }
 return baseline.map(match=>{
   const {place}=match;
   const areaLabel=venueAreaLabel(place);
   const preferredArea=preferredAreas.has(fold(areaLabel));
   const tags=place.tasteTags??[];
   const shared=[...new Set(tags.filter(tag=>wanted.has(tag)))];
   const dna=getTasteMatchAdjustment(tags,votes);
   const nearbyKm=distanceKm(area,place);
   const inBudget=preferences.budget>=60||place.demoBudget===undefined||place.demoBudget<=preferences.budget;
   const isLiked=saved.has('google-'+place.id);
   const reasons:string[]=[];
   if(preferredArea)reasons.push('Στην περιοχή που επέλεξες');
   if(shared.length)reasons.push('Ταιριάζει με '+(LABELS[shared[0]]??shared[0]));
   if(dna.delta>0)reasons.push('Ταιριάζει με τις επιλογές σου στο Taste Swipe');
   if(isLiked)reasons.push('Από τις αγαπημένες σου επιλογές');
   if(inBudget)reasons.push('Στο budget σου');
   if(nearbyKm<=3)reasons.push('Κοντά στην περιοχή αναζήτησης');
   if(!reasons.length)reasons.push('Με βάση το προφίλ και τα ενδιαφέροντά σου');
   // Match % measures demo taste affinity ONLY; area, budget, distance and favorites rank separately.
   const validTags=tags.filter(tag=>wanted.has(tag));
   const learnedTags=tags.filter(tag=>Math.abs(dna.delta)>0);
   const tasteEvidence=wanted.size+Object.keys(votes).length+Object.keys(visitFeedback).length;
   const visitDelta=Math.max(-15,Math.min(15,Math.round(tags.reduce((acc,t)=>acc+(visitTags[t]??0),0)*9)));
   if(visitDelta>0)reasons.push('Μοιάζει με μέρη που αξιολόγησες θετικά');
   const score=tasteEvidence===0||tags.length===0?0:Math.max(20,Math.min(95,Math.round(
     50+validTags.length*8+Math.max(-25,Math.min(25,dna.delta))+visitDelta
   )));
   const meaningfulSwipes=Object.values(votes).filter(x=>x!=='skip').length;
   const matchConfidence:ForYouMatch['matchConfidence']=tasteEvidence===0||tags.length<2?'low':meaningfulSwipes>=8&&tags.length>=4?'high':'medium';
   const rankBoost=(preferredArea?15:0)+(inBudget?9:-15)+Math.max(0,12-Math.round(nearbyKm*1.6))+(isLiked?4:0);
   return {
     ...match,score,matchConfidence,rankScore:score+rankBoost,areaLabel,nearbyKm,inBudget,preferredArea,isLiked,
     tasteReasons:reasons.slice(0,3),tasteTags:tags
   };
 }).filter(item=>votes[item.place.id]!=='dislike')
   .sort((a,b)=>b.rankScore-a.rankScore||a.nearbyKm-b.nearbyKm||a.place.name.localeCompare(b.place.name));
}

export function filterForYouMatches(
 matches:ForYouMatch[],
 category:ForYouCategory,
 withinBudget:boolean,
 onlyMyAreas:boolean
):ForYouMatch[]{
 return matches.filter(match=>
   (category==='all'||match.place.category===category)&&
   (!withinBudget||match.inBudget)&&
   (!onlyMyAreas||match.preferredArea)
 );
}

import type {UserPreferences} from '../types';
import type {TasteFeedback,TasteTag} from './vibe-dna';
import {getTasteWeights} from './vibe-dna';
import {tastesFromSignup} from './for-you';
import {getDemoPlaceById} from './demo-places';
import type {VisitFeedback} from './storage';

/**
 * Frontend-only, interpretable mood suggestion; this is NOT an ML forecast.
 * Uses local clock + current saved preferences, taste swipes, saved places,
 * and optional post-visit feedback. No background collection or API calls.
 */
export type PredictiveMoodKey='coffee'|'brunch'|'dinner'|'cocktails'|'creative';
export type MoodCategory='cafe'|'restaurant'|'bar';
export type PredictiveMood={
 key:PredictiveMoodKey;
 category:MoodCategory;
 title:string;
 explanation:string;
 tags:readonly TasteTag[];
 icon:'cafe-outline'|'restaurant-outline'|'wine-outline'|'sparkles-outline';
 signalLabel:string;
 personalized:boolean;
};

type MoodCandidate=Omit<PredictiveMood,'signalLabel'|'personalized'|'explanation'> & {
 caption:string;
};
const candidates:readonly MoodCandidate[]=[
 {key:'coffee',category:'cafe',title:'A cozy coffee kind of day.',
  caption:'Για ήσυχη κουβέντα και ένα ωραίο specialty coffee.',
  tags:['coffee','cozy','quiet','specialty','minimal','casual'],
  icon:'cafe-outline'},
 {key:'brunch',category:'cafe',title:'Your brunch era is calling.',
  caption:'Ίσως είναι η στιγμή για ένα χαλαρό brunch spot.',
  tags:['brunch','daytime','garden','coffee','social'],
  icon:'cafe-outline'},
 {key:'dinner',category:'restaurant',title:'Dinner plans sound right.',
  caption:'Ίσως απόψε ταιριάζει ένα όμορφο μέρος για φαγητό.',
  tags:['dining','romantic','elegant','intimate','low-light'],
  icon:'restaurant-outline'},
 {key:'cocktails',category:'bar',title:'Tonight might be cocktail night.',
  caption:'Αν έχεις διάθεση για έξοδο, δοκίμασε ένα cocktail spot.',
  tags:['nightlife','cocktails','lively','social','low-light'],
  icon:'wine-outline'},
 {key:'creative',category:'cafe',title:'Something a little different?',
  caption:'Ίσως σου ταιριάζει μια πιο creative στάση στην πόλη.',
  tags:['creative','artsy','alternative','casual','coffee'],
  icon:'sparkles-outline'},
];

/** Contextual time-of-day priors, not historical usage predictions. */
const timeScore=(key:PredictiveMoodKey,hour:number,weekend:boolean):number=>{
 if(hour>=6&&hour<11)return key==='coffee'?7:key==='brunch'?(weekend?8:4):key==='creative'?2:0;
 if(hour>=11&&hour<15)return key==='brunch'?(weekend?9:7):key==='coffee'?4:key==='dinner'?2:0;
 if(hour>=15&&hour<19)return key==='coffee'?7:key==='creative'?6:key==='brunch'?2:key==='dinner'?2:0;
 if(hour>=19&&hour<23)return key==='dinner'?7:key==='cocktails'?(weekend?9:6):key==='creative'?2:0;
 return key==='cocktails'?8:key==='dinner'?2:key==='coffee'?1:0;
};
const bounded=(x:number,limit:number)=>Math.max(-limit,Math.min(limit,x));

export function getPredictiveMood(
 now:Date,preferences:UserPreferences,feedback:TasteFeedback,
 savedIds:readonly string[]=[],visits:Record<string,VisitFeedback>={}
):PredictiveMood{
 const hour=now.getHours();
 const day=now.getDay();
 const weekend=day===0||day===6;
 const preferred=new Set(tastesFromSignup(preferences));
 const dna=getTasteWeights(feedback);
 const savedTags:Record<string,number>={};
 const visitTags:Record<string,number>={};
 const update=(into:Record<string,number>,id:string,weight:number)=>{
  const p=getDemoPlaceById(id.replace(/^google-/,''));if(!p?.tasteTags?.length)return;
  for(const tag of p.tasteTags)into[tag]=(into[tag]??0)+weight/p.tasteTags.length;
 };
 for(const id of savedIds)if(id.startsWith('google-'))update(savedTags,id,1);
 for(const [id,vote] of Object.entries(visits))update(visitTags,id,vote==='yes'?1:vote==='no'?-1:0);
 const meaningful=Object.values(feedback).filter(v=>v!=='skip').length;
 const hasPersonalSignals=preferred.size>0||meaningful>0||Object.keys(savedTags).length>0||Object.keys(visitTags).length>0;
 const evaluated=candidates.map((m,i)=>{
  const personalScore=m.tags.reduce((sum,tag)=>sum+
   (preferred.has(tag)?1.15:0)+bounded(dna[tag]*4,2.7)+
   bounded((savedTags[tag]??0)*2.0,1.4)+bounded((visitTags[tag]??0)*2,1.5),0);
  return {m,i,score:timeScore(m.key,hour,weekend)+bounded(personalScore,6.5)};
 });
 evaluated.sort((a,b)=>b.score-a.score||a.i-b.i);
 const winner=evaluated[0].m;
 const context=hour>=19||hour<6?'για απόψε':hour<12?'για το πρωί':hour<18?'για σήμερα το απόγευμα':'για σήμερα';
 const signals=[
  ...(meaningful?['swipes']:[]),
  ...(preferred.size?['προτιμήσεις']:[]),
  ...(Object.keys(savedTags).length?['saved spots']:[]),
  ...(Object.keys(visitTags).length?['feedback επισκέψεων']:[])
 ];
 const signalLabel=signals.length?'Based on '+signals.slice(0,2).join(' + '):'Based on day & time';
 const explanation=hasPersonalSignals
  ?`Μια πρόταση ${context}, με βάση την ώρα και όσα έχεις επιλέξει. ${winner.caption}`
  :`Μια αρχική ιδέα ${context} με βάση την ημέρα και την ώρα. ${winner.caption}`;
 return {...winner,explanation,signalLabel,personalized:hasPersonalSignals};
}

/** Predict a specific candidate venue from contextual fit plus on-device behavior.
 * This is an interpretable ranking estimate, NOT a trained probability model.
 * Crucially, it doesn't depend on active For You category filters.
 */
import type {ForYouMatch} from './for-you';
import type {DemoEvent} from './demo-analytics';
import {getVenueDnaWeights} from './daily-venue-swipe';

export type PredictedVenue={
 place:ForYouMatch['place'];
 areaLabel:string;
 headline:string;
 reason:string;
 signalLabel:string;
 evidenceLevel:'starter'|'learning'|'personalized';
 score:number;
};

const venueId=(id:string)=>id.replace(/^google-/,'');
const normalizeDate=(timestamp:number)=>new Date(timestamp);
const samePeriod=(a:number,b:number)=>Math.floor(a/4)===Math.floor(b/4);
const relevantEventNames=new Set(['recommendation_opened','prediction_opened','venue_save_toggled']);

export function predictNextVenue(
 now:Date,matches:readonly ForYouMatch[],preferences:UserPreferences,
 taste:TasteFeedback,savedIds:readonly string[]=[],visits:Record<string,VisitFeedback>={},
 venueVotes:TasteFeedback={},events:readonly DemoEvent[]=[]
):PredictedVenue|null{
 if(!matches.length)return null;
 const mood=getPredictiveMood(now,preferences,taste,savedIds,visits);
 const hour=now.getHours(),weekend=now.getDay()===0||now.getDay()===6;
 const preferred=new Set(tastesFromSignup(preferences));
 const dna=getTasteWeights(taste),swipeDna=getVenueDnaWeights(venueVotes);
 const saved=new Set(savedIds.map(venueId));
 const recentEvents=events.filter(e=>relevantEventNames.has(e.name)&&!!e.context&&
  Number.isFinite(e.timestamp)&&e.timestamp<=now.getTime()&&now.getTime()-e.timestamp<90*86400000);
 const contextual=recentEvents.filter(e=>{
  const when=normalizeDate(e.timestamp);
  const isWeekend=when.getDay()===0||when.getDay()===6;
  return samePeriod(when.getHours(),hour)&&isWeekend===weekend;
 });
 const meaningfulTaste=Object.values(taste).filter(v=>v!=='skip').length;
 const meaningfulVotes=Object.values(venueVotes).filter(v=>v!=='skip').length;
 const signalCount=meaningfulTaste+meaningfulVotes+Object.keys(visits).length+recentEvents.length;
 const favorites=matches.map(match=>{
  const {place}=match;
  if(venueVotes[place.id]==='dislike'||visits[place.id]==='no')return {match,score:-Infinity,habit:0};
  const tags=place.tasteTags??[];
  const categoryHour=place.category===mood.category?11:-3;
  const tagFit=tags.filter(t=>mood.tags.includes(t)).length*2.5;
  const tasteFit=tags.reduce((acc,tag)=>acc+(preferred.has(tag)?2.4:0)+
    Math.max(-6,Math.min(6,(dna[tag]+swipeDna[tag])*9)),0);
  const usage=contextual.reduce((acc,event)=>{
   if(venueId(event.context??'')!==place.id)return acc;
   const ageDays=(now.getTime()-event.timestamp)/86400000;
   return acc+Math.max(.5,1-ageDays/140)*(event.name==='prediction_opened'?3.5:5);
  },0);
  const allTimeHabit=recentEvents.reduce((acc,event)=>
   venueId(event.context??'')===place.id?acc+1.1:acc,0);
  const savedBonus=saved.has(place.id)?2:0;
  const visitBonus=visits[place.id]==='yes'?5:visits[place.id]==='kind-of'?1:0;
  const swipeBonus=venueVotes[place.id]==='like'?6:0;
  const budgetPenalty=match.inBudget?0:-22;
  const areaBonus=match.preferredArea?5:0;
  const distancePenalty=Math.min(14,Math.max(0,match.nearbyKm-3)*1.4);
  return {match,habit:usage,score:categoryHour+tagFit+tasteFit+
   usage+allTimeHabit+savedBonus+visitBonus+swipeBonus+areaBonus-
   distancePenalty+budgetPenalty+match.rankScore*.13};
 }).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score||
  a.match.nearbyKm-b.match.nearbyKm||a.match.place.id.localeCompare(b.match.place.id));
 const best=favorites[0];
 if(!best)return null;
 const place=best.match.place;
 const timeLabel=hour>=19||hour<5?'απόψε':hour<12?'αυτό το πρωί':hour<17?'σήμερα':'το απόγευμα';
 const fromHabit=best.habit>=3;
 const fromTaste=Boolean((place.tasteTags??[]).some(tag=>preferred.has(tag)||dna[tag]>0||swipeDna[tag]>0));
 const reason=fromHabit?'Έχεις δείξει ενδιαφέρον για αυτό το μέρος σε παρόμοιες ώρες.':
  visits[place.id]==='yes'?'Έχεις αξιολογήσει θετικά αυτό το μέρος και ταιριάζει στη σημερινή σου έξοδο.':
  fromTaste?'Ταιριάζει με τα vibes που επιλέγεις και τη σημερινή ώρα.':
  'Μια αρχική εκτίμηση από την ώρα, την περιοχή και το είδος εξόδου.';
 const evidenceLevel:PredictedVenue['evidenceLevel']=signalCount>=10?'personalized':signalCount>=3?'learning':'starter';
 const headline='Ίσως σου ταιριάζει '+timeLabel+' — με βάση '+(fromHabit?'τις συνήθειές σου.':signalCount?'το γούστο σου.':'την ώρα και την περιοχή.');
 const signalLabel=evidenceLevel==='starter'?'EARLY ESTIMATE · LIMITED HISTORY':
  evidenceLevel==='learning'?'LEARNING YOUR HABITS · LOCAL DATA':'PERSONALIZED FROM YOUR ACTIVITY';
 return {place,areaLabel:best.match.areaLabel,headline,reason,signalLabel,evidenceLevel,score:best.score};
}

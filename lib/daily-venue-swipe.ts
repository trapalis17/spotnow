import {getDemoPlaceById,getDemoPlaces} from './demo-places';
import type {SearchArea} from './places';
import type {TasteDecision,TasteFeedback,TasteTag} from './vibe-dna';
import {TASTE_TAGS,TASTE_LABELS} from './vibe-dna';

export const DAILY_SWIPE_LIMIT=8;
export const DAILY_SWIPE_INTERVAL_MS=24*60*60*1000;

/** All daily quota and preferences stay in local app storage. */
export type DailyVenueSwipeState={
 startedAt:number;
 batchIds:string[];
 batchVotes:TasteFeedback;
 seenIds:string[];
 votes:TasteFeedback;
 cycle:number;
};
export const emptyDailyVenueSwipeState=():DailyVenueSwipeState=>({
 startedAt:0,batchIds:[],batchVotes:{},seenIds:[],votes:{},cycle:0
});
const isVote=(x:unknown):x is TasteDecision=>x==='like'||x==='dislike'||x==='skip';
const isId=(x:unknown):x is string=>typeof x==='string'&&/^demo_\d+_[a-z0-9-]+$/.test(x);
const voteMap=(raw:unknown):TasteFeedback=>{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 return Object.fromEntries(Object.entries(raw as Record<string,unknown>)
  .filter(([id,decision])=>isId(id)&&isVote(decision)).slice(-1000)) as TasteFeedback;
};
export function normalizeDailyVenueSwipeState(raw:unknown):DailyVenueSwipeState{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return emptyDailyVenueSwipeState();
 const x=raw as Partial<DailyVenueSwipeState>;
 const ids=(arr:unknown)=>Array.isArray(arr)?[...new Set(arr.filter(isId))].slice(0,400):[];
 const batch=ids(x.batchIds).slice(0,DAILY_SWIPE_LIMIT);
 const votes=voteMap(x.votes);
 const batchRaw=voteMap(x.batchVotes);
 const batchVotes=Object.fromEntries(Object.entries(batchRaw).filter(([id])=>batch.includes(id)));
 return {
  startedAt:typeof x.startedAt==='number'&&Number.isFinite(x.startedAt)&&x.startedAt>0?x.startedAt:0,
  batchIds:batch,batchVotes,seenIds:ids(x.seenIds),votes,
  cycle:typeof x.cycle==='number'&&Number.isInteger(x.cycle)&&x.cycle>=0?x.cycle:0
 };
}
export function remainingDailyMs(state:DailyVenueSwipeState,now:number):number{
 if(!state.startedAt)return 0;
 return Math.max(0,state.startedAt+DAILY_SWIPE_INTERVAL_MS-now);
}
/** A period starts with the first opened deck, not at midnight. Opening the app does not consume the daily quota. */
export function ensureDailyVenueBatch(stateInput:DailyVenueSwipeState,area:SearchArea,now:number):DailyVenueSwipeState{
 const state=normalizeDailyVenueSwipeState(stateInput);
 if(state.batchIds.length===DAILY_SWIPE_LIMIT&&remainingDailyMs(state,now)>0)return state;
 // Only rotate at first open or AFTER the last 24-hour period elapsed.
 const places=getDemoPlaces(area);
 const seen=new Set(state.seenIds);
 let unseen=places.filter(place=>!seen.has(place.id));
 if(unseen.length<DAILY_SWIPE_LIMIT){
  // The finite 40-shop demo pool is exhausted; restart its presentation cycle.
  seen.clear();
  unseen=[...places];
 }
 // A deterministic varied order, stable once persisted; no network or daily random request.
 const order=[...unseen].sort((a,b)=>{
  const ai=Number(a.id.split('_')[1]),bi=Number(b.id.split('_')[1]);
  const ashift=(ai*17+state.cycle*13)%places.length;
  const bshift=(bi*17+state.cycle*13)%places.length;
  return ashift-bshift;
 });
 const picked=order.slice(0,DAILY_SWIPE_LIMIT).map(place=>place.id);
 const nextSeen=[...seen,...picked];
 return {
  ...state,
  startedAt:now,batchIds:picked,batchVotes:{},
  seenIds:nextSeen,cycle:state.cycle+1
 };
}
export function recordDailyVenueVote(state:DailyVenueSwipeState,id:string,decision:TasteDecision):DailyVenueSwipeState{
 if(!state.batchIds.includes(id)||id in state.batchVotes)return state;
 return {
  ...state,
  batchVotes:{...state.batchVotes,[id]:decision},
  votes:{...state.votes,[id]:decision}
 };
}
export function resetDailyVenueDNA(state:DailyVenueSwipeState):DailyVenueSwipeState{
 // DNA resets, NOT the 8-card quota or the active 24-hour timer.
 return {...state,votes:{}};
}
const weightsCache=new WeakMap<TasteFeedback,Record<TasteTag,number>>();
export function getVenueDnaWeights(votes:TasteFeedback):Record<TasteTag,number>{
 const cached=weightsCache.get(votes);
 if(cached)return cached;
 const weights=Object.fromEntries(TASTE_TAGS.map(tag=>[tag,0])) as Record<TasteTag,number>;
 for(const [id,decision] of Object.entries(votes)){
  if(decision==='skip')continue;
  const place=getDemoPlaceById(id);
  if(!place?.tasteTags?.length)continue;
  const direction=decision==='like'?1:-1;
  for(const tag of place.tasteTags) weights[tag]+=direction/place.tasteTags.length;
 }
 weightsCache.set(votes,weights);
 return weights;
}
export function getDailyVenueDnaSummary(votes:TasteFeedback){
 const weights=getVenueDnaWeights(votes);
 const ranked=TASTE_TAGS.map(tag=>({tag,label:TASTE_LABELS[tag],weight:weights[tag]}));
 const values=Object.values(votes);
 return {
  ratedCount:values.length,
  meaningfulCount:values.filter(x=>x!=='skip').length,
  likes:values.filter(x=>x==='like').length,
  dislikes:values.filter(x=>x==='dislike').length,
  skipped:values.filter(x=>x==='skip').length,
  positives:ranked.filter(x=>x.weight>.001).sort((a,b)=>b.weight-a.weight).slice(0,6),
  negatives:ranked.filter(x=>x.weight<-.001).sort((a,b)=>a.weight-b.weight).slice(0,6)
 };
}
export function getDailyVenueMatchAdjustment(tags:readonly TasteTag[]|undefined,votes:TasteFeedback){
 if(!tags?.length)return {delta:0,reason:null as string|null};
 const weights=getVenueDnaWeights(votes);
 const relevant=tags.map(tag=>({tag,weight:weights[tag]}));
 const total=relevant.reduce((n,x)=>n+x.weight,0);
 const delta=Math.max(-20,Math.min(20,Math.round(total/Math.sqrt(tags.length)*12)));
 const winner=relevant.filter(x=>Math.sign(x.weight)===Math.sign(delta))
  .sort((a,b)=>Math.abs(b.weight)-Math.abs(a.weight))[0];
 const reason=!winner||!delta?null:delta>0
  ?'Από τα μαγαζιά που σου άρεσαν: '+TASTE_LABELS[winner.tag]
  :'Από τα μαγαζιά που προσπέρασες: λιγότερο '+TASTE_LABELS[winner.tag];
 return {delta,reason};
}

import type {UserPreferences} from '../types';
import type {TasteFeedback,TasteTag} from './vibe-dna';
import {getTasteWeights} from './vibe-dna';
import {getVenueDnaWeights} from './daily-venue-swipe';
import {tastesFromSignup} from './for-you';
import {getDemoPlaceById} from './demo-places';
import type {VisitFeedback} from './storage';
import type {DemoEvent} from './demo-analytics';

/**
 * Six Vibe identities based on explicit interests and voluntary interactions.
 * Local, explainable prototype scoring; no inferred demographic attributes.
 */
export type VibeTypeKey='regular'|'explorer'|'socialite'|'nocturnal'|'romantic'|'tastemaker';
type VibeIcon='repeat-outline'|'compass-outline'|'people-outline'|'moon-outline'|'heart-outline'|'sparkles-outline';
export type VibeIdentity={key:VibeTypeKey;title:string;subtitle:string;icon:VibeIcon};
type Definition=VibeIdentity&{tags:readonly TasteTag[]};
const definitions:readonly Definition[]=[
 {key:'regular',title:'regular',subtitle:'Good spots. Good routines.',icon:'repeat-outline',
  tags:['neighborhood','coffee','specialty','cozy','quiet','casual']},
 {key:'explorer',title:'explorer',subtitle:'Always somewhere new.',icon:'compass-outline',
  tags:['outdoor','rooftop','garden','nature','daytime','alternative']},
 {key:'socialite',title:'socialite',subtitle:'Better together.',icon:'people-outline',
  tags:['social','lively','groups','live-music','casual']},
 {key:'nocturnal',title:'nocturnal',subtitle:'Made for after dark.',icon:'moon-outline',
  tags:['nightlife','cocktails','underground','low-light','lively']},
 {key:'romantic',title:'romantic',subtitle:'It’s all about the atmosphere.',icon:'heart-outline',
  tags:['romantic','intimate','cozy','elegant','low-light']},
 {key:'tastemaker',title:'tastemaker',subtitle:'Your taste sets the tone.',icon:'sparkles-outline',
  tags:['creative','artsy','vintage','premium','elegant','minimal','indie','retro','dining']}
];

/** Recurring visits and wide-ranging venue discovery supply behavioral evidence. */
export function getVibeIdentity(
 preferences:UserPreferences|null,taste:TasteFeedback,
 venueVotes:TasteFeedback={},savedIds:readonly string[]=[],
 visits:Record<string,VisitFeedback>={},events:readonly DemoEvent[]=[]
):VibeIdentity|null{
 const wanted=new Set(preferences?tastesFromSignup(preferences):[]);
 const dna=getTasteWeights(taste);
 const venueDna=getVenueDnaWeights(venueVotes);
 const likedVenues=new Set(savedIds.map(id=>id.replace(/^google-/,'')));
 const venueTags:Record<string,number>={};
 const register=(id:string,weight:number)=>{
  const place=getDemoPlaceById(id.replace(/^google-/,''));
  if(!place?.tasteTags?.length)return;
  for(const tag of place.tasteTags)venueTags[tag]=(venueTags[tag]??0)+weight/place.tasteTags.length;
 };
 for(const id of likedVenues)register(id,2.5);
 for(const [id,vote] of Object.entries(visits)){
  if(vote==='yes')register(id,3);
  if(vote==='no')register(id,-3);
 }
 // Dislikes lower alignment, not simply "likes add points".
 const getTagScore=(tag:TasteTag)=>
  (wanted.has(tag)?2.1:0)+
  Math.max(-5,Math.min(5,dna[tag]*7))+
  Math.max(-5,Math.min(5,venueDna[tag]*7))+
  Math.max(-4,Math.min(4,venueTags[tag]??0));

 const eventIds=events.filter(e=>(e.name==='recommendation_opened'||e.name==='prediction_opened')&&
   typeof e.context==='string'&&e.context.startsWith('demo_'))
  .map(e=>e.context as string);
 const visitsByVenue=new Map<string,number>();
 for(const id of eventIds)visitsByVenue.set(id,(visitsByVenue.get(id)??0)+1);
 const repeatCount=Math.max(0,...visitsByVenue.values());
 const distinctVenues=new Set([...eventIds,...likedVenues,...Object.keys(visits)]);
 const seenAreas=new Set([...distinctVenues].map(id=>getDemoPlaceById(id)?.address).filter(Boolean));
 const meaningfulVotes=Object.values(taste).filter(v=>v!=='skip').length+
  Object.values(venueVotes).filter(v=>v!=='skip').length;
 const hasEvidence=Boolean(wanted.size||meaningfulVotes||likedVenues.size||
  Object.keys(visits).length||eventIds.length);
 if(!hasEvidence)return null;

 const ranked=definitions.map((d,i)=>{
  const base=d.tags.reduce((acc,tag)=>acc+getTagScore(tag),0);
  const behavior=d.key==='regular'&&repeatCount>=3?7+Math.min(10,(repeatCount-2)*2.5):
   d.key==='explorer'&&distinctVenues.size>=4?
    6+Math.min(9,(distinctVenues.size-3)*1.6)+Math.min(4,Math.max(0,seenAreas.size-2)):0;
  return {d,i,score:base+behavior};
 }).sort((a,b)=>b.score-a.score||a.i-b.i);
 const winner=ranked[0].d;
 return {key:winner.key,title:winner.title,subtitle:winner.subtitle,icon:winner.icon};
}

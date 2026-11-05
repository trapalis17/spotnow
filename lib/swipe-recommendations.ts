import type {UserPreferences} from '../types';
import type {GooglePlace} from './google-places';
import type {SearchArea} from './places';
import type {TasteFeedback,TasteTag} from './vibe-dna';
import {getTasteWeights,TASTE_LABELS} from './vibe-dna';
import {getVenueDnaWeights} from './daily-venue-swipe';
import {getForYouMatches,tastesFromSignup} from './for-you';
import type {VisitFeedback} from './storage';

export type RecommendedSwipe={place:GooglePlace;reason:string;score:number};

/** A reason is always grounded in user-provided signals or an actual preference constraint. */
export function explainSwipeRecommendation(
 place:GooglePlace,preferences:UserPreferences,area:SearchArea,
 taste:TasteFeedback={},venueVotes:TasteFeedback={}
):string{
 const tags=place.tasteTags??[];
 const wanted=new Set(tastesFromSignup(preferences));
 const signupMatch=tags.find(tag=>wanted.has(tag));
 if(signupMatch)return 'Επειδή έχεις επιλέξει '+TASTE_LABELS[signupMatch]+' στις προτιμήσεις σου.';
 const learned=getVenueDnaWeights(venueVotes);
 const positive=tags.filter(tag=>learned[tag]>.05)
  .sort((a,b)=>learned[b]-learned[a])[0];
 if(positive)return 'Μοιάζει με μαγαζιά που σου άρεσαν: '+TASTE_LABELS[positive]+'.';
 const oldTaste=getTasteWeights(taste);
 const oldPositive=tags.filter(tag=>oldTaste[tag]>.05).sort((a,b)=>oldTaste[b]-oldTaste[a])[0];
 if(oldPositive)return 'Ταιριάζει με επιλογές σου στο Vibe DNA: '+TASTE_LABELS[oldPositive]+'.';
 if(preferences.neighborhoods.includes(place.address?.split('·').pop()?.trim()??''))
  return 'Βρίσκεται σε περιοχή που έχεις επιλέξει.';
 if(preferences.budget>0&&place.demoBudget!==undefined&&
   (preferences.budget>=60||place.demoBudget<=preferences.budget))
  return 'Είναι εντός του budget που έχεις ορίσει.';
 return 'Πρόταση με βάση την περιοχή αναζήτησής σου: '+area.label+'.';
}

/**
 * Curate the eight strongest matches from the same fictional catalogue as Saved/For You.
 * No random spots, no remote calls, no invented match percentage. Past dislikes excluded.
 */
export function rankSwipeRecommendations(
 places:GooglePlace[],preferences:UserPreferences,area:SearchArea,
 taste:TasteFeedback={},venueVotes:TasteFeedback={},
 savedIds:readonly string[]=[],visits:Record<string,VisitFeedback>={}
):RecommendedSwipe[]{
 const wanted=new Set(tastesFromSignup(preferences));
 const learned=getVenueDnaWeights(venueVotes);
 const oldTaste=getTasteWeights(taste);
 return getForYouMatches(places,preferences,area,taste,savedIds,visits)
  .filter(item=>venueVotes[item.place.id]!=='dislike')
  .map(item=>{
    const tags=item.place.tasteTags??[];
    const selected=tags.filter(tag=>wanted.has(tag));
    const learnedAffinity=tags.reduce((n,tag)=>n+learned[tag],0);
    const oldAffinity=tags.reduce((n,tag)=>n+oldTaste[tag],0);
    const behavioralMatch=Object.entries(visits).some(([id,vote])=>
      vote==='yes'&&id===item.place.id);
    const personalScore=selected.length*29+
      Math.max(-27,Math.min(27,learnedAffinity*28))+
      Math.max(-14,Math.min(14,oldAffinity*12))+
      (behavioralMatch?12:0);
    return {
      place:item.place,
      reason:explainSwipeRecommendation(item.place,preferences,area,taste,venueVotes),
      score:item.rankScore+personalScore+(item.preferredArea?5:0)-
       (item.isLiked?7:0)
    };
  }).sort((a,b)=>b.score-a.score||a.place.id.localeCompare(b.place.id));
}

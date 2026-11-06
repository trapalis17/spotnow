import type {UserPreferences} from '../types';
import type {GooglePlace} from './google-places';
import type {SearchArea} from './places';
import type {TasteFeedback,TasteTag} from './vibe-dna';
import {getTasteWeights,TASTE_LABELS} from './vibe-dna';
import {getVenueDnaWeights} from './daily-venue-swipe';
import {getForYouMatches,tastesFromSignup} from './for-you';
import type {VisitFeedback} from './storage';

export type RecommendedSwipe={place:GooglePlace;reason:string;score:number};

type PersonalSignal={label:string;tags:readonly TasteTag[]};
/**
 * Only claim that a user has chosen a preference when that explicit option is
 * present in their profile AND it matches an actual venue tag. Never infer
 * a preference just because the venue has that feature.
 */
const PREFERENCE_SIGNALS:readonly {field:keyof Pick<UserPreferences,'moods'|'outings'>;
 value:string;label:string;tags:readonly TasteTag[]}[]=[
 {field:'moods',value:'cozy',label:'cozy ατμόσφαιρα',tags:['cozy']},
 {field:'moods',value:'romantic',label:'romantic spots',tags:['romantic','intimate']},
 {field:'moods',value:'quiet',label:'ήσυχα μέρη',tags:['quiet']},
 {field:'moods',value:'lively',label:'ζωντανά μαγαζιά',tags:['lively']},
 {field:'moods',value:'creative',label:'δημιουργικά spots',tags:['creative','artsy']},
 {field:'moods',value:'social',label:'μέρη για παρέα',tags:['social','groups']},
 {field:'outings',value:'coffee with friends',label:'καφέ με την παρέα',tags:['coffee']},
 {field:'outings',value:'date night',label:'date nights',tags:['romantic','intimate','low-light']},
 {field:'outings',value:'brunch',label:'brunch',tags:['brunch']},
 {field:'outings',value:'night out',label:'βραδινές εξόδους',tags:['nightlife','cocktails']},
 {field:'outings',value:'study session',label:'ήρεμα study spots',tags:['quiet']},
 {field:'outings',value:'casual drinks',label:'χαλαρό ποτό',tags:['cocktails','casual']},

];
const EXTRA_FEATURES:readonly {tag:TasteTag;label:string}[]=[
 {tag:'rooftop',label:'rooftop'},{tag:'sunset',label:'θέα στο ηλιοβασίλεμα'},
 {tag:'garden',label:'κήπο'},{tag:'outdoor',label:'εξωτερικό χώρο'},
 {tag:'specialty',label:'specialty coffee'},{tag:'low-light',label:'χαμηλό φωτισμό'},
 {tag:'live-music',label:'live μουσική'},{tag:'minimal',label:'minimal αισθητική'},
 {tag:'intimate',label:'πιο intimate ατμόσφαιρα'},
 {tag:'cocktails',label:'cocktails'},{tag:'brunch',label:'brunch'},
 {tag:'quiet',label:'ήσυχη ατμόσφαιρα'},{tag:'creative',label:'creative αισθητική'},
 {tag:'lively',label:'ζωντανή ατμόσφαιρα'},{tag:'coffee',label:'καφέ'},
 {tag:'romantic',label:'romantic ατμόσφαιρα'}
];
const numberFor=(id:string)=>[...id].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,17);
const endingFor=(id:string)=>[
 'Μήπως βρήκαμε το επόμενο στέκι σου; 👀',
 'Αυτό εδώ τσεκάρει αρκετά από τα κουτάκια σου.',
 'Ε, αυτό αξίζει μια πιο προσεκτική ματιά.',
 'Κάτι μας λέει πως είναι αρκετά του γούστου σου.'
][numberFor(id)%4];
const uniqueSignals=(signals:readonly PersonalSignal[])=>{
 const seen=new Set<string>();
 return signals.filter(s=>{if(seen.has(s.label))return false;seen.add(s.label);return true;});
};

/**
 * An explainable, fun sentence built from actual matching signals.
 * - Explicit onboarding selections are never confused with inferred likes.
 * - Learned evidence requires a positive net swipe weight for this spot's tags.
 * - Area/budget appear only when the demo metadata really meets those settings.
 * - With insufficient evidence, admit uncertainty rather than inventing affinity.
 * The same user + venue + state returns the same copy (no random flicker).
 */
export function explainSwipeRecommendation(
 place:GooglePlace,preferences:UserPreferences,area:SearchArea,
 taste:TasteFeedback={},venueVotes:TasteFeedback={}
):string{
 const tags=place.tasteTags??[];
 const selected=uniqueSignals(PREFERENCE_SIGNALS.filter(s=>
  preferences[s.field]?.includes(s.value)&&s.tags.some(tag=>tags.includes(tag)))
  ).slice(0,3);

 const venueLikes=getVenueDnaWeights(venueVotes);
 const conceptLikes=getTasteWeights(taste);
 const learnedTag=tags
  .map(tag=>({tag,weight:venueLikes[tag]*1.4+conceptLikes[tag]}))
  .filter(s=>s.weight>.12)
  .sort((a,b)=>b.weight-a.weight)[0]?.tag;
 const learned=learnedTag?TASTE_LABELS[learnedTag]:null;

 const placeArea=place.address?.split('·').pop()?.trim()??'';
 const areaMatch=Boolean(placeArea&&preferences.neighborhoods.includes(placeArea));
 const priceMatch=typeof place.demoBudget==='number'&&
  (preferences.budget<60?place.demoBudget<=preferences.budget:
   place.demoBudget>=60);
 const budget=priceMatch?(preferences.budget>=60?'60€+':preferences.budget+'€'):null;
 const extra=EXTRA_FEATURES.find(f=>tags.includes(f.tag)&&
  !selected.some(s=>s.tags.includes(f.tag)))?.label;
 const finish=endingFor(place.id);

 if(selected.length>=2){
  const [first,second]=selected;
  const intro='Έχεις επιλέξει '+first.label+' και '+second.label+'. ';
  // Third evidence is included only if it is distinct and independently true.
  if(learned&&!selected.some(s=>s.tags.includes(learnedTag!)))
   return intro+'Στα likes σου βλέπουμε και '+learned+' — '+finish;
  if(areaMatch)return intro+'Και είναι στο '+placeArea+' που έχεις βάλει στις περιοχές σου. '+finish;
  if(extra)return intro+'Εδώ έχει και '+extra+'. '+finish;
  return intro+'Αυτό το spot τα συνδυάζει. '+finish;
 }
 if(selected.length===1){
  const first=selected[0];
  if(learned&&!first.tags.includes(learnedTag!))
   return 'Έχεις επιλέξει '+first.label+', ενώ τα likes σου δείχνουν '+learned+'. Αυτό εδώ συνδυάζει και τα δύο. '+finish;
  if(areaMatch)return 'Έχεις επιλέξει '+first.label+' και το spot είναι στο '+placeArea+' που προτιμάς. '+finish;
  if(extra)return 'Έχεις επιλέξει '+first.label+'. Εδώ βρίσκεις και '+extra+' — '+finish;
  if(budget)return 'Έχεις επιλέξει '+first.label+' και αυτό το spot ταιριάζει στο budget σου ('+budget+'). '+finish;
  return 'Έχεις επιλέξει '+first.label+' και αυτό το spot το έχει. '+finish;
 }
 if(learned){
  if(areaMatch)return 'Τα likes σου δείχνουν '+learned+', και αυτό το spot είναι στο '+placeArea+' που διάλεξες. '+finish;
  if(extra)return 'Από τα likes σου έχουμε μάθει ότι σου ταιριάζει '+learned+'. Εδώ βρίσκεις και '+extra+'. '+finish;
  return 'Από τα likes σου έχουμε μάθει ότι σου ταιριάζει '+learned+'. '+finish;
 }
 if(areaMatch&&budget)return 'Το '+placeArea+' είναι στις περιοχές σου και το spot ταιριάζει στο budget σου ('+budget+'). Μήπως αξίζει μια ματιά;';
 if(areaMatch)return 'Το '+placeArea+' είναι στις περιοχές που έχεις επιλέξει. Για το vibe του, θα μας πεις εσύ! 😉';
 if(budget)return 'Αυτό το spot ταιριάζει στο budget σου ('+budget+'). Για το υπόλοιπο vibe, θέλουμε τη γνώμη σου!';
 return 'Δεν έχουμε ακόμη αρκετά κοινά στοιχεία με τα γούστα σου για σίγουρη πρόταση. Πες μας με ένα swipe αν σε εκφράζει!';
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

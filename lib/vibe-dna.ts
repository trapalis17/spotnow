/** Local, fictional taste concepts. This is not a personality or demographic assessment. */
export const TASTE_TAGS = [
  'cozy','intimate','minimal','coffee','rooftop','sunset','outdoor','nightlife',
  'underground','alternative','vintage','social','lively','quiet','specialty',
  'elegant','dining','garden','industrial','live-music','casual','neighborhood',
  'creative','brunch','cocktails','artsy','romantic','low-light','daytime',
  'nature','retro','premium','indie','jazz','groups'
] as const;
export type TasteTag = (typeof TASTE_TAGS)[number];
export type TasteDecision = 'like'|'dislike'|'skip';
export type TasteFeedback = Record<string,TasteDecision>;
export type TasteFacet = 'atmosphere'|'aesthetic'|'noise'|'music'|'social'|'setting'|'category'|'experience';
export type TasteCard = {
 id:string;title:string;subtitle:string;image:string;
 colors:readonly [string,string];icon:string;
 tags:readonly TasteTag[];
 facets:Partial<Record<TasteFacet,string>>;
 unlockAt:number;
};
const img=(id:string)=>'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=900&q=80';
const make=(id:string,title:string,subtitle:string,photo:string,
 tags:readonly TasteTag[],facets:TasteCard['facets'],colors:readonly [string,string],icon:string,unlockAt=0):TasteCard=>({
 id,title,subtitle,image:img(photo),tags,facets,colors,icon,unlockAt
});
/** Fixed photo URLs are optional decorative media; no external APIs or place lookups. */
export const TASTE_CARDS:readonly TasteCard[]=[
 make('cozy-intimate','Cozy & intimate','Απαλός φωτισμός και χαλαρές κουβέντες','photo-1517248135467-4c7edcad34c4',
 ['cozy','intimate','low-light'],{atmosphere:'cozy',noise:'quiet',social:'small groups',setting:'indoor'},['#7050B8','#C785A6'],'moon-outline'),
 make('minimal-coffee','Minimal coffee aesthetics','Καθαρή αισθητική, τέλειος espresso','photo-1495474472287-4d71bcdd2085',
 ['minimal','coffee','daytime'],{aesthetic:'minimal',category:'cafe',experience:'coffee'},['#8F82BC','#D8B29D'],'cafe-outline'),
 make('rooftop-sunsets','Rooftop sunsets','Golden hour με θέα','photo-1514933651103-005eec06c04b',
 ['rooftop','sunset','outdoor','romantic'],{setting:'outdoor',experience:'sunset',atmosphere:'romantic'},['#DB9169','#885BBF'],'sunny-outline'),
 make('underground-nightlife','Underground nightlife','Late nights, low lights','photo-1470337458703-46ad1756a187',
 ['underground','nightlife','low-light','lively'],{atmosphere:'lively',noise:'loud',experience:'nightlife'},['#473487','#AA4985'],'flash-outline'),
 make('vintage-alternative','Vintage & alternative','Μοναδικά μέρη με χαρακτήρα','photo-1514933651103-005eec06c04b',
 ['vintage','alternative','retro','artsy'],{aesthetic:'vintage',music:'indie',atmosphere:'alternative'},['#A46F62','#6B5B9D'],'color-palette-outline'),
 make('social-bars','Lively social bars','Η παρέα είναι το main event','photo-1515003197210-e0cd71810b5f',
 ['social','lively','groups','cocktails'],{social:'large groups',noise:'lively',category:'bar'},['#AB5A93','#E09A6C'],'people-outline'),
 make('quiet-specialty','Quiet specialty coffee','Slow morning, serious coffee','photo-1509042239860-f550ce710b93',
 ['quiet','specialty','coffee','daytime'],{noise:'quiet',category:'cafe',experience:'specialty coffee'},['#7B6EB2','#C7A98B'],'cafe-outline'),
 make('elegant-dining','Elegant dining','Μικρές λεπτομέρειες, μεγάλη εμπειρία','photo-1552566626-52f8b828add9',
 ['elegant','dining','premium','intimate'],{aesthetic:'elegant',category:'restaurant',experience:'dining'},['#3E5674','#BE87B2'],'restaurant-outline'),
 make('garden-cafes','Outdoor garden cafés','Πράσινο, φως και αέρας','photo-1445116572660-236099ec97a0',
 ['garden','nature','outdoor','coffee'],{setting:'outdoor',aesthetic:'natural',category:'cafe'},['#427E67','#A7C99A'],'leaf-outline'),
 make('industrial-interiors','Industrial interiors','Concrete, neon and texture','photo-1481833761820-0509d3217039',
 ['industrial','minimal','creative'],{aesthetic:'industrial',setting:'indoor'},['#56677F','#8D69BB'],'grid-outline'),
 make('live-music','Live music atmosphere','Μουσική που γεμίζει τον χώρο','photo-1493225457124-a3eb161ffa5f',
 ['live-music','lively','social','indie'],{music:'live',noise:'lively',experience:'music'},['#7052B8','#D66C9D'],'musical-notes-outline'),
 make('neighborhood-hangouts','Neighborhood hangouts','Τα στέκια που νιώθεις δικά σου','photo-1528605248644-14dd04022da1',
 ['casual','neighborhood','social','cozy'],{atmosphere:'casual',social:'friends',experience:'hangout'},['#5E96A4','#9F8AD8'],'heart-outline'),
 make('slow-brunch','Slow weekend brunch','Sunday feeling, any day','photo-1525351484163-7529414344d8',
 ['brunch','daytime','social','coffee'],{category:'cafe',experience:'brunch',social:'friends'},['#DC9A81','#C2B784'],'sunny-outline',6),
 make('jazz-night','Intimate jazz nights','Smooth rhythms, softer lights','photo-1415201364774-f6f0bb35f28f',
 ['jazz','intimate','live-music','low-light'],{music:'jazz',noise:'moderate',setting:'indoor'},['#423D7A','#9C6AA9'],'musical-notes-outline',6),
 make('creative-corners','Artsy corners','Ιδέες, χρώματα, προσωπικότητα','photo-1543007630-9710e4a00a20',
 ['artsy','creative','alternative','coffee'],{aesthetic:'artsy',atmosphere:'creative',category:'cafe'},['#A363B7','#E49A94'],'brush-outline',6),
 make('wine-date','Wine & date night','Μια ήσυχη βραδιά για δύο','photo-1510812431401-41d2bd2722f3',
 ['romantic','elegant','intimate','low-light'],{social:'intimate',noise:'quiet',experience:'date night'},['#713963','#C47C88'],'wine-outline',6),
 make('sunny-terraces','Sunny terraces','Μεσημέρια έξω, χωρίς βιασύνη','photo-1414235077428-338989a2e8c0',
 ['outdoor','daytime','casual','social'],{setting:'outdoor',atmosphere:'casual',experience:'daytime'},['#DBAC67','#73A7A1'],'sunny-outline',6),
 make('speakeasy','Hidden cocktail rooms','Μυστικές πόρτες, ιδιαίτερα cocktails','photo-1470337458703-46ad1756a187',
 ['cocktails','low-light','nightlife','intimate'],{category:'bar',experience:'cocktails',noise:'moderate'},['#4B386C','#C07487'],'wine-outline',6),
 make('retro-vinyl','Retro & vinyl','Αναλογικός ήχος, old-school διάθεση','photo-1487180144351-b8472da7d491',
 ['retro','vintage','indie','cozy'],{aesthetic:'retro',music:'indie',atmosphere:'cozy'},['#A5725A','#69548D'],'disc-outline',6),
 make('open-air-gatherings','Open-air gatherings','Φίλοι και ανοιχτός ουρανός','photo-1517457373958-b7bdd4587205',
 ['outdoor','groups','social','lively'],{setting:'outdoor',social:'groups',atmosphere:'lively'},['#55897A','#C8A36B'],'people-outline',6),
 make('quiet-reading','A quiet coffee corner','Το αγαπημένο σου ήσυχο τραπέζι','photo-1442512595331-e89e73853f31',
 ['quiet','coffee','cozy','minimal'],{noise:'quiet',category:'cafe',experience:'reading'},['#B18F86','#6F9D99'],'book-outline',6),
 make('night-out','Dance-floor energy','Μια βραδιά που δεν τελειώνει','photo-1459749411175-04bf5292ceea',
 ['nightlife','lively','social','groups'],{noise:'loud',social:'groups',experience:'nightlife'},['#4F43AB','#D46B97'],'flash-outline',6),
 make('al-fresco-dining','Al fresco dining','Dinner under the stars','photo-1466978913421-dad2ebd01d17',
 ['dining','outdoor','romantic','garden'],{category:'restaurant',setting:'outdoor',experience:'dining'},['#5C9286','#D2938E'],'restaurant-outline',6),
 make('coffee-roastery','Coffee culture','Αρώματα, roasting και craft','photo-1447933601403-0c6688de566e',
 ['specialty','coffee','industrial','daytime'],{category:'cafe',experience:'specialty coffee',aesthetic:'industrial'},['#816F65','#C49B70'],'cafe-outline',6)
];

export const TASTE_LABELS:Record<TasteTag,string>={
 cozy:'cozy ατμόσφαιρα',intimate:'οικειότητα',minimal:'minimal αισθητική',coffee:'καφέ',
 rooftop:'rooftop',sunset:'ηλιοβασίλεμα',outdoor:'εξωτερικό χώρο',nightlife:'βραδινή έξοδο',
 underground:'underground αισθητική',alternative:'alternative στυλ',vintage:'vintage αισθητική',
 social:'κοινωνική διάθεση',lively:'ζωντανή ατμόσφαιρα',quiet:'ησυχία',specialty:'specialty coffee',
 elegant:'κομψή αισθητική',dining:'φαγητό',garden:'κήπο',industrial:'industrial design',
 'live-music':'live μουσική',casual:'χαλαρή έξοδο',neighborhood:'γειτονιά',creative:'δημιουργικά spots',
 brunch:'brunch',cocktails:'cocktails',artsy:'artistic αισθητική',romantic:'ρομαντική ατμόσφαιρα',
 'low-light':'χαμηλό φωτισμό',daytime:'πρωινή έξοδο',nature:'φυσικά στοιχεία',retro:'retro διάθεση',
 premium:'premium εμπειρία',indie:'indie μουσική',jazz:'jazz',groups:'μεγάλη παρέα'
};

export const isTasteDecision=(value:unknown):value is TasteDecision=>
 value==='like'||value==='dislike'||value==='skip';
export function sanitizeTasteFeedback(value:unknown):TasteFeedback{
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const allowed=new Set(TASTE_CARDS.map(card=>card.id));
 return Object.fromEntries(Object.entries(value as Record<string,unknown>)
   .filter(([id,decision])=>allowed.has(id)&&isTasteDecision(decision))) as TasteFeedback;
}
export function getTasteWeights(feedback:TasteFeedback):Record<TasteTag,number>{
 const weights=Object.fromEntries(TASTE_TAGS.map(tag=>[tag,0])) as Record<TasteTag,number>;
 for(const card of TASTE_CARDS){
   const direction=feedback[card.id]==='like'?1:feedback[card.id]==='dislike'?-1:0;
   if(direction)for(const tag of card.tags)weights[tag]+=direction/card.tags.length;
 }
 return weights;
}
export function getDnaSummary(feedback:TasteFeedback){
 const weights=getTasteWeights(feedback);
 const entries=TASTE_TAGS.map(tag=>({tag,label:TASTE_LABELS[tag],weight:weights[tag]}));
 const positives=entries.filter(entry=>entry.weight>0).sort((a,b)=>b.weight-a.weight).slice(0,6);
 const negatives=entries.filter(entry=>entry.weight<0).sort((a,b)=>a.weight-b.weight).slice(0,6);
 return {
   ratedCount:Object.keys(feedback).length,
   meaningfulCount:Object.values(feedback).filter(value=>value!=='skip').length,
   likes:Object.values(feedback).filter(value=>value==='like').length,
   dislikes:Object.values(feedback).filter(value=>value==='dislike').length,
   skipped:Object.values(feedback).filter(value=>value==='skip').length,
   positives,negatives
 };
}
/** Static follow-on pack unlocks after 6 responses; unknown/uncertain attributes appear first. */
export function getPendingTasteCards(feedback:TasteFeedback):TasteCard[]{
 const rated=Object.keys(feedback).length;
 const weights=getTasteWeights(feedback);
 return TASTE_CARDS
  .filter(card=>!(card.id in feedback)&&card.unlockAt<=rated)
  .map((card,index)=>({
    card,index,
    priority:card.tags.reduce((score,tag)=>score+1/(1+Math.abs(weights[tag])*3),0)/card.tags.length
  }))
  .sort((a,b)=>b.priority-a.priority||a.card.unlockAt-b.card.unlockAt||a.index-b.index)
  .map(item=>item.card);
}
/** Only taste metadata enters this optional adjustment. Budget, geography and signup choices remain separate. */
export function getTasteMatchAdjustment(venueTags:readonly TasteTag[]|undefined,feedback:TasteFeedback){
 if(!venueTags?.length)return {delta:0,reason:null as string|null};
 const weights=getTasteWeights(feedback);
 const matched=venueTags.map(tag=>({tag,weight:weights[tag]})).filter(item=>Math.abs(item.weight)>0.001);
 if(!matched.length)return {delta:0,reason:null as string|null};
 const strength=matched.reduce((sum,item)=>sum+item.weight,0)/Math.sqrt(venueTags.length);
 const delta=Math.max(-20,Math.min(20,Math.round(strength*12)));
 const strongest=matched.sort((a,b)=>Math.abs(b.weight)-Math.abs(a.weight))[0];
 const reason=strongest.weight>0
   ?'Από το Vibe DNA σου: σου αρέσει '+TASTE_LABELS[strongest.tag]
   :'Από το Vibe DNA σου: προτιμάς λιγότερο '+TASTE_LABELS[strongest.tag];
 return {delta,reason};
}

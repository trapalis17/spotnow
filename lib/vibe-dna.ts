/** Curated real Athens venue names, with limited publicly sourced category metadata. Not a live directory. */
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
 make('real-six-dogs','Six d.o.g.s.','Μοναστηράκι · Bar, μουσική και κήπος','',
 ['alternative','live-music','garden','nightlife'],{category:'bar',experience:'live music',setting:'outdoor'},['#6144A3','#A060A2'],'musical-notes-outline'),
 make('real-clumsies','The Clumsies','Κέντρο Αθήνας · Cocktail bar','',
 ['cocktails','nightlife','social'],{category:'bar',experience:'cocktails'},['#3A317A','#BF6999'],'wine-outline'),
 make('real-neratzia','Neratzia Bistro','Κουκάκι · Café / bistro','',
 ['coffee','brunch','casual'],{category:'cafe',experience:'brunch'},['#7B7557','#B99670'],'cafe-outline'),
 make('real-it-restaurant','IT Restaurant','Κολωνάκι · Restaurant / café','',
 ['dining','brunch','coffee'],{category:'restaurant',experience:'dining'},['#8C6898','#D09BA9'],'restaurant-outline'),
 make('real-kalimeres','Kalimeres','Ψυρρή · All-day café / cocktail bar','',
 ['brunch','coffee','cocktails','social'],{category:'cafe',experience:'brunch'},['#A86A89','#D8A16A'],'cafe-outline'),
 make('real-laluk','Laluk Cafe-Bar','Κουκάκι · Coffee / wine bar','',
 ['coffee','cocktails','casual'],{category:'bar',experience:'coffee'},['#716B9B','#BD8C91'],'wine-outline'),
 make('real-me-kolonaki','Me Kolonaki','Κολωνάκι · Brunch / dining','',
 ['brunch','dining','daytime'],{category:'restaurant',experience:'brunch'},['#946C74','#D5AE86'],'restaurant-outline'),
 make('real-mayor','Mayor','Κολωνάκι · All-day bar restaurant','',
 ['dining','cocktails','social'],{category:'restaurant',experience:'dining'},['#4F6C87','#AA72B4'],'restaurant-outline'),
 make('real-nomad','Nomad','Χαλάνδρι · Specialty coffee / drinks','',
 ['coffee','specialty','cocktails'],{category:'cafe',experience:'specialty coffee'},['#657D80','#B59C81'],'cafe-outline'),
 make('real-gaston','Gaston','Νέα Σμύρνη · All-day café / bar / restaurant','',
 ['coffee','brunch','dining','cocktails'],{category:'cafe',experience:'brunch'},['#745D9A','#D1A9A6'],'cafe-outline')
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
 const direction=Math.sign(delta);
 const strongest=matched
   .filter(item=>Math.sign(item.weight)===direction)
   .sort((a,b)=>Math.abs(b.weight)-Math.abs(a.weight))[0];
 const reason=!strongest?null:direction>0
   ?'Από το Vibe DNA σου: σου αρέσει '+TASTE_LABELS[strongest.tag]
   :'Από το Vibe DNA σου: προτιμάς λιγότερο '+TASTE_LABELS[strongest.tag];
 return {delta,reason};
}

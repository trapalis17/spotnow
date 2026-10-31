import type {GooglePlace} from './google-places';
import {AREAS} from './places';
import type {SearchArea} from './places';
import type {TasteTag} from './vibe-dna';
/** All venues are fictional, for prototyping only. */
const seeds=[
 {name:'Mellow Coffee',category:'cafe',type:'coffee_shop',types:['cafe','coffee_shop'],outdoor:true,groups:true,brunch:false,cocktails:false},
 {name:'Bloom Brunch Club',category:'cafe',type:'breakfast_restaurant',types:['cafe','brunch_restaurant'],outdoor:true,groups:true,brunch:true,cocktails:false},
 {name:'Luna Rooftop',category:'bar',type:'cocktail_bar',types:['bar','cocktail_bar'],outdoor:true,groups:true,brunch:false,cocktails:true},
 {name:'Kanso Kitchen',category:'restaurant',type:'restaurant',types:['restaurant'],outdoor:false,groups:true,brunch:false,cocktails:false},
 {name:'Cloud Nine Café',category:'cafe',type:'cafe',types:['cafe','bakery'],outdoor:true,groups:false,brunch:false,cocktails:false},
 {name:'Afterglow Bar',category:'bar',type:'wine_bar',types:['bar','wine_bar'],outdoor:false,groups:true,brunch:false,cocktails:true},
 {name:'Sunday Table',category:'restaurant',type:'brunch_restaurant',types:['restaurant','brunch_restaurant'],outdoor:true,groups:true,brunch:true,cocktails:false},
 {name:'Ritual Espresso',category:'cafe',type:'coffee_shop',types:['cafe','coffee_shop'],outdoor:false,groups:false,brunch:false,cocktails:false},
 {name:'Noir Cocktail Room',category:'bar',type:'cocktail_bar',types:['bar','cocktail_bar'],outdoor:false,groups:true,brunch:false,cocktails:true},
 {name:'Olive & Salt',category:'restaurant',type:'restaurant',types:['restaurant'],outdoor:true,groups:true,brunch:false,cocktails:false},
 {name:'Side Quest Café',category:'cafe',type:'cafe',types:['cafe','dessert_shop'],outdoor:true,groups:true,brunch:false,cocktails:false},
 {name:'Good Mood Social',category:'bar',type:'pub',types:['bar','pub'],outdoor:true,groups:true,brunch:false,cocktails:true},
] as const;
/** Fictional signals for the twelve demo venues. Never inferred from real people. */
const venueTasteTags = [
 ['cozy','intimate','quiet','coffee','low-light'],
 ['brunch','daytime','garden','social','coffee'],
 ['rooftop','sunset','outdoor','cocktails','romantic'],
 ['dining','elegant','intimate','minimal'],
 ['quiet','specialty','coffee','minimal','daytime'],
 ['nightlife','cocktails','social','low-light'],
 ['brunch','dining','garden','social'],
 ['coffee','specialty','quiet','industrial'],
 ['underground','nightlife','cocktails','alternative'],
 ['dining','outdoor','garden','romantic'],
 ['creative','artsy','coffee','casual'],
 ['lively','groups','social','live-music','casual']
] as const satisfies readonly (readonly TasteTag[])[];
const offsets:[number,number][]=[
 [-.002,.003],[.004,-.004],[.008,.005],[-.006,-.003],[.003,.008],
 [-.008,.006],[.005,-.007],[-.003,-.008],[.01,-.004],[-.009,-.006],
 [.007,.011],[-.011,.003]
];
export function getDemoPlaces(area:SearchArea):GooglePlace[]{
 return seeds.map((s,i)=>({
   id:'demo_'+i+'_'+area.id,
   name:s.name,
   category:s.category,
   primaryType:s.type,
   types:[...s.types],
   latitude:area.latitude+offsets[i][0],
   longitude:area.longitude+offsets[i][1],
   address:'Εικονικό κατάστημα · '+area.label,
   googleMapsUrl:'',
   outdoorSeating:s.outdoor,
   goodForGroups:s.groups,
   servesBrunch:s.brunch,
   servesCocktails:s.cocktails,
   servesCoffee:s.category==='cafe',
   reservable:false,
   tasteTags:[...venueTasteTags[i]],
   editorialSummary:'Αυτό είναι ένα εικονικό κατάστημα για την προεπισκόπηση του Vibe. Όλα τα χαρακτηριστικά είναι ενδεικτικά.'
 }));
}
export function getDemoPlaceById(id:string):GooglePlace|null{
 for(const area of AREAS){const p=getDemoPlaces(area).find(x=>x.id===id);if(p)return p;}
 return null;
}

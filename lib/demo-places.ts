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
const venueDemoBudgets=[5,10,20,70,10,20,20,5,40,45,10,20] as const;
const demoAthensNeighborhoods=[
 'Κολωνάκι','Κουκάκι','Ψυρρή','Παλαιό Φάληρο',
 'Σύνταγμα','Νέα Σμύρνη','Γκάζι','Γλυφάδα',
 'Χαλάνδρι','Καλλιθέα','Πειραιάς','Περιστέρι'
] as const;
const extraVenues = [
 ['Velvet Room','bar'],
 ['Little Nomad','cafe'],
 ['Basil & Brick','restaurant'],
 ['Pastel Morning','cafe'],
 ['Echo Lounge','bar'],
 ['The Olive Yard','restaurant'],
 ['Common Ground','cafe'],
 ['Twilight Social','bar'],
 ['Paper & Coffee','cafe'],
 ['Lemon & Thyme','restaurant'],
 ['Greenhouse Brew','cafe'],
 ['Orbit Bar','bar'],
 ['Honeycomb Brunch','cafe'],
 ['Stone & Salt','restaurant'],
 ['Midnight Garden','bar'],
 ['Daily Ritual','cafe'],
 ['Terracotta Table','restaurant'],
 ['Neon Frequency','bar'],
 ['Mysa Coffee Lab','cafe'],
 ['Alba Rooftop','bar'],
 ['Paloma Kitchen','restaurant'],
 ['Wildflower Café','cafe'],
 ['Cosmos Cocktails','bar'],
 ['Table Eleven','restaurant'],
 ['Brew Society','cafe'],
 ['Mood Alley','bar'],
 ['The Sunday Club','cafe'],
 ['Citrus Dining','restaurant']
] as const;
const allSeeds=[...seeds,...extraVenues.map(([name,category],i)=>({
 name,category,type:category==='bar'?'cocktail_bar':category==='cafe'?'coffee_shop':'restaurant',
 types:[category],outdoor:i%3!==0,groups:i%4!==0,brunch:category==='cafe'&&i%4===0,
 cocktails:category==='bar'
}))];
const photos = [
 'photo-1517248135467-4c7edcad34c4','photo-1495474472287-4d71bcdd2085',
 'photo-1514933651103-005eec06c04b','photo-1552566626-52f8b828add9',
 'photo-1509042239860-f550ce710b93','photo-1470337458703-46ad1756a187',
 'photo-1525351484163-7529414344d8','photo-1447933601403-0c6688de566e',
 'photo-1515003197210-e0cd71810b5f','photo-1466978913421-dad2ebd01d17',
 'photo-1442512595331-e89e73853f31','photo-1487180144351-b8472da7d491'
];
const offsets:[number,number][]=[
 [-.002,.003],[.004,-.004],[.008,.005],[-.006,-.003],[.003,.008],
 [-.008,.006],[.005,-.007],[-.003,-.008],[.01,-.004],[-.009,-.006],
 [.007,.011],[-.011,.003]
];
export function getDemoPlaces(area:SearchArea):GooglePlace[]{
 return allSeeds.map((s,i)=>({
   id:'demo_'+i+'_'+area.id,
   name:s.name,
   category:s.category,
   primaryType:s.type,
   types:[...s.types],
   latitude:area.latitude+(offsets[i%offsets.length][0]+Math.floor(i/offsets.length)*.0003),
   longitude:area.longitude+(offsets[i%offsets.length][1]+Math.floor(i/offsets.length)*.0003),
   address:'Εικονικό κατάστημα · '+(area.id==='athens'?demoAthensNeighborhoods[i%demoAthensNeighborhoods.length]:area.label),
   googleMapsUrl:'',
   outdoorSeating:s.outdoor,
   goodForGroups:s.groups,
   servesBrunch:s.brunch,
   servesCocktails:s.cocktails,
   servesCoffee:s.category==='cafe',
   reservable:false,
   tasteTags:[...venueTasteTags[i%venueTasteTags.length]],
   demoBudget:venueDemoBudgets[i%venueDemoBudgets.length],
   demoPhoto:'https://images.unsplash.com/'+photos[i%photos.length]+'?auto=format&fit=crop&w=900&q=80',
   editorialSummary:'Αυτό είναι ένα εικονικό κατάστημα για την προεπισκόπηση του Vibe. Όλα τα χαρακτηριστικά είναι ενδεικτικά.'
 }));
}
export function getDemoPlaceById(id:string):GooglePlace|null{
 for(const area of AREAS){const p=getDemoPlaces(area).find(x=>x.id===id);if(p)return p;}
 return null;
}

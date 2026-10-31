/**
 * Static, approximate neighborhood center coordinates (WGS84).
 * These are representative centroids for sorting suggestions, not exact boundaries.
 * No runtime geocoding, map service or remote location data is used.
 */
export const REGIONS=[
  'Athens Center','South Athens','North Athens','West Athens','Piraeus','East Athens'
] as const;
export type Region=(typeof REGIONS)[number];
export type Neighborhood={name:string;region:Region;latitude:number;longitude:number};
type Coordinate=[name:string,latitude:number,longitude:number];
const COORDINATES:Record<Region,Coordinate[]>={
 'Athens Center':[
  ['Κολωνάκι',37.9787,23.7417],
  ['Παγκράτι',37.9670,23.7541],
  ['Κουκάκι',37.9630,23.7270],
  ['Ψυρρή',37.9787,23.7240],
  ['Μοναστηράκι',37.9753,23.7260],
  ['Θησείο',37.9775,23.7187],
  ['Πετράλωνα',37.9669,23.7119],
  ['Εξάρχεια',37.9875,23.7340],
  ['Γκάζι',37.9780,23.7120],
  ['Κεραμεικός',37.9788,23.7160],
  ['Σύνταγμα',37.9755,23.7349],
  ['Κυψέλη',38.0007,23.7375],
  ['Νέος Κόσμος',37.9575,23.7310]
 ],
 'South Athens':[
  ['Νέα Σμύρνη',37.9440,23.7165],
  ['Παλαιό Φάληρο',37.9290,23.7000],
  ['Καλλιθέα',37.9570,23.7000],
  ['Γλυφάδα',37.8635,23.7530],
  ['Άλιμος',37.9130,23.7200],
  ['Ηλιούπολη',37.9320,23.7570]
 ],
 'North Athens':[
  ['Χαλάνδρι',38.0210,23.8030],
  ['Κηφισιά',38.0740,23.8120],
  ['Μαρούσι',38.0540,23.8080],
  ['Αγία Παρασκευή',38.0100,23.8230],
  ['Χολαργός',38.0010,23.8000]
 ],
 'West Athens':[
  ['Περιστέρι',38.0140,23.6910],
  ['Αιγάλεω',37.9940,23.6800]
 ],
 'Piraeus':[
  ['Πειραιάς',37.9429,23.6465],
  ['Μικρολίμανο',37.9370,23.6590],
  ['Πασαλιμάνι',37.9415,23.6480]
 ],
 'East Athens':[
  ['Ζωγράφου',37.9750,23.7750]
 ]
};
export const NEIGHBORHOODS:Neighborhood[]=REGIONS.flatMap(region=>
 COORDINATES[region].map(([name,latitude,longitude])=>({name,region,latitude,longitude}))
);
export type CoordinatePoint={latitude:number;longitude:number};
export function haversineKm(a:CoordinatePoint,b:CoordinatePoint):number{
 const rad=(angle:number)=>angle*Math.PI/180;
 const dLat=rad(b.latitude-a.latitude),dLon=rad(b.longitude-a.longitude);
 const c=2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dLat/2)**2+
   Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2)));
 return 6371*c;
}
export function closestAreas(reference:CoordinatePoint,count=7):Neighborhood[]{
 return [...NEIGHBORHOODS].sort((a,b)=>
   haversineKm(reference,a)-haversineKm(reference,b)||
   a.name.localeCompare(b.name,'el')
 ).slice(0,count);
}
export const normalizeSearch=(text:string):string=>
 text.toLocaleLowerCase('el-GR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const ALIASES:Record<string,string>={
 kolonkai:'Κολωνάκι',kolonaki:'Κολωνάκι',psyrri:'Ψυρρή',
 psyri:'Ψυρρή',gazi:'Γκάζι',koukaki:'Κουκάκι',
 'palaio faliro':'Παλαιό Φάληρο',glyfada:'Γλυφάδα'
};
/** Match older saved English identifiers without dropping any preference. */
export function canonicalArea(value:string):string{
 return ALIASES[normalizeSearch(value)]??value;
}

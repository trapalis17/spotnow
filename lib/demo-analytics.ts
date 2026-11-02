import AsyncStorage from '@react-native-async-storage/async-storage';
/** Local development telemetry only. No network requests or identifiers. */
export type DemoEvent={name:string;timestamp:number;context?:string};
const KEY='vibe:demo-events:v1';
let queue:Promise<unknown>=Promise.resolve();
export function trackDemoEvent(name:string,context?:string):void{
 queue=queue.catch(()=>undefined).then(async()=>{
   let items:DemoEvent[]=[];
   try{const raw=await AsyncStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))items=parsed;}}catch{}
   items.push({name,timestamp:Date.now(),...(context?{context}:{})});
   await AsyncStorage.setItem(KEY,JSON.stringify(items.slice(-200)));
 });
}
export async function getDemoEvents():Promise<DemoEvent[]>{
 try{const raw=await AsyncStorage.getItem(KEY);return raw?JSON.parse(raw):[];}catch{return [];}
}

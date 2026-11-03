import AsyncStorage from '@react-native-async-storage/async-storage';

/** Handcrafted gradient avatar presets for the Vibe frontend preview. */
export const VIBE_AVATARS=[
 {id:'orbit',label:'Orbit',icon:'planet-outline',colors:['#4F3EB5','#B48AFA']},
 {id:'bloom',label:'Bloom',icon:'flower-outline',colors:['#EE92C7','#F4C4D9']},
 {id:'nova',label:'Nova',icon:'sparkles-outline',colors:['#5B65E9','#A9A5FC']},
 {id:'mellow',label:'Mellow',icon:'cloud-outline',colors:['#8493CC','#CED3F8']},
 {id:'pixel',label:'Pixel',icon:'game-controller-outline',colors:['#6354CE','#B7A1FF']},
 {id:'muse',label:'Muse',icon:'color-palette-outline',colors:['#D97AA9','#F5AFD9']},
 {id:'sol',label:'Sol',icon:'sunny-outline',colors:['#F3A568','#FAD3A2']},
 {id:'sage',label:'Sage',icon:'leaf-outline',colors:['#63A99D','#B1DBBA']},
 {id:'glow',label:'Glow',icon:'flash-outline',colors:['#9E6ADA','#DEB9FF']},
 {id:'echo',label:'Echo',icon:'headset-outline',colors:['#5765C5','#84C6E9']},
 {id:'dusk',label:'Dusk',icon:'moon-outline',colors:['#423C87','#A68BD8']},
 {id:'lucky',label:'Lucky',icon:'heart-outline',colors:['#D77FA1','#F7BBC0']}
] as const;
export type VibeAvatarId=(typeof VIBE_AVATARS)[number]['id'];
export type ProfilePicture={kind:'avatar';id:VibeAvatarId}|{kind:'photo';uri:string};
const KEY_PREFIX='vibe:profile-picture:v1:';
const MAX_BASE64_CHARS=500000;

export function defaultAvatarId(email:string):VibeAvatarId{
 const normalized=email.trim().toLowerCase();
 let hash=2166136261;
 for(const char of normalized)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 return VIBE_AVATARS[hash%VIBE_AVATARS.length].id;
}
export function avatarById(id:string){return VIBE_AVATARS.find(item=>item.id===id)??VIBE_AVATARS[0];}
export function defaultProfilePicture(email:string):ProfilePicture{
 return {kind:'avatar',id:defaultAvatarId(email)};
}
export function isProfilePicture(value:unknown):value is ProfilePicture{
 if(!value||typeof value!=='object')return false;
 const input=value as Record<string,unknown>;
 return (input.kind==='avatar'&&typeof input.id==='string'&&VIBE_AVATARS.some(a=>a.id===input.id))||
  (input.kind==='photo'&&typeof input.uri==='string'&&
   /^data:image\/jpeg;base64,[a-zA-Z0-9+/=]+$/.test(input.uri)&&
   input.uri.length<=MAX_BASE64_CHARS+23);
}
const accountKey=(email:string)=>KEY_PREFIX+encodeURIComponent(email.trim().toLowerCase());

export async function getProfilePicture(email:string):Promise<ProfilePicture>{
 if(!email.trim())return defaultProfilePicture(email);
 try{
  const raw=await AsyncStorage.getItem(accountKey(email));
  if(!raw)return defaultProfilePicture(email);
  const parsed:unknown=JSON.parse(raw);
  return isProfilePicture(parsed)?parsed:defaultProfilePicture(email);
 }catch{return defaultProfilePicture(email);}
}
export async function saveProfilePicture(email:string,picture:ProfilePicture):Promise<void>{
 if(!email.trim()||!isProfilePicture(picture))throw new Error('Invalid profile picture.');
 await AsyncStorage.setItem(accountKey(email),JSON.stringify(picture));
}
export async function resetProfilePicture(email:string):Promise<ProfilePicture>{
 if(!email.trim())throw new Error('Missing demo account.');
 await AsyncStorage.removeItem(accountKey(email));
 return defaultProfilePicture(email);
}
export function photoFromBase64(base64:string):ProfilePicture{
 const uri='data:image/jpeg;base64,'+base64;
 if(!isProfilePicture({kind:'photo',uri}))throw new Error('Photo is too large or invalid.');
 return {kind:'photo',uri};
}

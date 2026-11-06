import AsyncStorage from '@react-native-async-storage/async-storage';

// Spotnow People: 8 original Gen Z 3D profile avatars.
/** Spotnow People: 8 original 3D portraits in a local 4x2 offline spritesheet.
 * The original eight IDs remain stable for previously saved profile pictures.
 * Coordinates are zero-based columns (0–3) and rows (0–1).
 */
export const VIBE_AVATARS=[
 {id:'orbit',label:'Milo',col:0,row:0},
 {id:'bloom',label:'Maya',col:1,row:0},
 {id:'nova',label:'Alex',col:2,row:0},
 {id:'mellow',label:'Leo',col:3,row:0},
 {id:'pixel',label:'Noah',col:0,row:1},
 {id:'muse',label:'Ruby',col:1,row:1},
 {id:'sol',label:'Iris',col:2,row:1},
 {id:'sage',label:'Nia',col:3,row:1}
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

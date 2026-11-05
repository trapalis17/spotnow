import type {SavedCollection} from './storage';

export const TOP_SWIPES_COLLECTION_ID='top-swipes';
export const TOP_SWIPES_COLLECTION_NAME='Top Swipes';

/** Pure merge: a right swipe is idempotent and never removes an existing favorite. */
export function mergeTopSwipesCollection(
 collections:readonly SavedCollection[],venueId:string
):SavedCollection[]{
 const match=collections.find(c=>c.id===TOP_SWIPES_COLLECTION_ID||
   c.name.trim().toLocaleLowerCase('en-US')===TOP_SWIPES_COLLECTION_NAME.toLowerCase());
 if(!match){
  return [...collections,{id:TOP_SWIPES_COLLECTION_ID,name:TOP_SWIPES_COLLECTION_NAME,venueIds:[venueId]}];
 }
 return collections.map(c=>c!==match?c:{
  ...c,name:TOP_SWIPES_COLLECTION_NAME,
  venueIds:c.venueIds.includes(venueId)?c.venueIds:[...c.venueIds,venueId]
 });
}
export function isTopSwipesCollection(collection:SavedCollection):boolean{
 return collection.id===TOP_SWIPES_COLLECTION_ID||
  collection.name.trim().toLowerCase()===TOP_SWIPES_COLLECTION_NAME.toLowerCase();
}

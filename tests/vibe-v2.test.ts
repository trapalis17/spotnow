import assert from 'node:assert/strict';
import {test} from 'node:test';
import {NEIGHBORHOODS,closestAreas} from '../lib/attica-neighborhoods';
import {getTasteMatchAdjustment,getDnaSummary,TASTE_CARDS} from '../lib/vibe-dna';

test('onboarding keeps exactly 30 unique neighborhoods',()=>{
 assert.equal(NEIGHBORHOODS.length,30);
 assert.equal(new Set(NEIGHBORHOODS.map(n=>n.name)).size,30);
});
test('nearby selection returns exactly seven sorted areas',()=>{
 const a=closestAreas({latitude:37.944,longitude:23.7165},7);
 assert.equal(a.length,7);assert.equal(a[0].name,'Νέα Σμύρνη');
});
test('taste swipe uses curated real venue names and supports negative feedback',()=>{
 assert.ok(TASTE_CARDS.length>=8);
 const liked=getTasteMatchAdjustment(['alternative'],{'real-six-dogs':'like'});
 const disliked=getTasteMatchAdjustment(['alternative'],{'real-six-dogs':'dislike'});
 assert.ok(liked.delta>0);
 assert.ok(disliked.delta<0);
 assert.equal(getDnaSummary({'real-six-dogs':'skip'}).meaningfulCount,0);
});

import {curateForYouSections,type ForYouMatch} from '../lib/for-you';

test('For You editorial sections do not repeat venues and respect input filtering',()=>{
 const matches=Array.from({length:18},(_,i)=>({
  place:{id:'demo-'+i,category:(i%3===0?'cafe':i%3===1?'restaurant':'bar')},
  score:90-i,rankScore:100-i,preferredArea:i%4===0,isLiked:i%5===0,
 })) as unknown as ForYouMatch[];
 const groups=curateForYouSections(matches);
 const entries=[...(groups.topPick?[groups.topPick]:[]),...groups.perfect,...groups.hiddenGems,...groups.tryDifferent,...groups.more];
 const ids=entries.map(x=>x.place.id);
 assert.equal(new Set(ids).size,ids.length,'same venue should never appear twice');
 assert.equal(groups.topPick?.place.id,'demo-0');
 assert.ok(groups.hiddenGems.every(x=>!x.preferredArea&&!x.isLiked));
 assert.ok(groups.tryDifferent.every(x=>x.place.category!==groups.topPick?.place.category));
 assert.ok(ids.every(id=>matches.some(x=>x.place.id===id)));
 assert.deepEqual(curateForYouSections([]),{topPick:undefined,perfect:[],hiddenGems:[],tryDifferent:[],more:[]});
});

test('taste swipe has distinct illustrative editorial stock photos and remains real-name demo only',()=>{
 assert.ok(TASTE_CARDS.every(card=>card.image.includes('images.unsplash.com/photo-')));
 assert.equal(new Set(TASTE_CARDS.map(card=>card.id)).size,TASTE_CARDS.length);
 assert.ok(TASTE_CARDS.every(card=>card.tags.length>0));
});

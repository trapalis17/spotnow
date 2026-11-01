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
test('taste swipe uses non-venue concepts and supports negative feedback',()=>{
 assert.ok(TASTE_CARDS.length>=8);
 const liked=getTasteMatchAdjustment(['cozy'],{'cozy-intimate':'like'});
 const disliked=getTasteMatchAdjustment(['cozy'],{'cozy-intimate':'dislike'});
 assert.ok(liked.delta>0);
 assert.ok(disliked.delta<0);
 assert.equal(getDnaSummary({'cozy-intimate':'skip'}).meaningfulCount,0);
});

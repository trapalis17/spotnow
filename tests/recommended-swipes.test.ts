import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DEFAULT_AREA} from '../lib/places';
import {getDemoPlaces} from '../lib/demo-places';
import type {UserPreferences} from '../types';
const defaultPreferences:UserPreferences={
 moods:['cozy','creative'],outings:['coffee with friends','date night'],budget:60,
 music:['indie','jazz'],neighborhoods:['Κολωνάκι','Κουκάκι'],atmosphere:['warm','chill'],
 social:['small group'],timeSlots:['evening']
};
import {rankSwipeRecommendations,explainSwipeRecommendation} from '../lib/swipe-recommendations';
import {ensureDailyVenueBatch,recordDailyVenueVote,remainingDailyMs,resetDailyVenueDNA,emptyDailyVenueSwipeState} from '../lib/daily-venue-swipe';
import {TOP_SWIPES_COLLECTION_ID,mergeTopSwipesCollection} from '../lib/top-swipes';

const places=getDemoPlaces(DEFAULT_AREA);
test('recommended swipes are ranked by personal taste, never random discovery order',()=>{
 const prefs={...defaultPreferences,moods:['lively'],outings:['night out'],music:[],atmosphere:[],social:[],timeSlots:['evening']};
 const ranked=rankSwipeRecommendations(places,prefs,DEFAULT_AREA);
 assert.equal(ranked.length,40);
 assert.ok(ranked[0].place.tasteTags?.some(t=>['nightlife','cocktails','lively'].includes(t)));
 assert.ok(ranked[0].reason.length>10);
 assert.ok(ranked.every(x=>x.reason&&x.place.id.startsWith('demo_')));
});
test('negative venue feedback excludes those venues and explains preferred tags',()=>{
 const prefs={...defaultPreferences,outings:['night out']};
 const first=rankSwipeRecommendations(places,prefs,DEFAULT_AREA)[0];
 const ranked=rankSwipeRecommendations(places,prefs,DEFAULT_AREA,{}, {[first.place.id]:'dislike'});
 assert.ok(!ranked.some(x=>x.place.id===first.place.id));
 const coffee=places.find(x=>x.tasteTags?.includes('coffee'))!;
 const reason=explainSwipeRecommendation(coffee,{...defaultPreferences,outings:['coffee with friends']},DEFAULT_AREA);
 assert.match(reason,/επιλέξει|προτιμήσεις/);
});
test('daily batch chooses the strongest eight ranked recommendations and enforces 24h',()=>{
 const recommended=rankSwipeRecommendations(places,defaultPreferences,DEFAULT_AREA).map(x=>x.place.id);
 const now=Date.UTC(2026,10,5,16);
 const deck=ensureDailyVenueBatch(emptyDailyVenueSwipeState(),DEFAULT_AREA,now,recommended);
 assert.deepEqual(deck.batchIds,recommended.slice(0,8));
 assert.equal(new Set(deck.batchIds).size,8);
 const after=recordDailyVenueVote(deck,deck.batchIds[0],'like');
 const again=ensureDailyVenueBatch(after,DEFAULT_AREA,now+50000,recommended);
 assert.deepEqual(again.batchIds,deck.batchIds);
 assert.equal(again.batchVotes[deck.batchIds[0]],'like');
 assert.equal(remainingDailyMs(again,now+1000),86400000-1000);
 assert.equal(Object.keys(resetDailyVenueDNA(again).batchVotes).length,1);
 const next=ensureDailyVenueBatch(again,DEFAULT_AREA,now+86400001,recommended);
 assert.equal(next.batchIds.length,8);
 assert.ok(!next.batchIds.includes(deck.batchIds[0]));
});
test('Top Swipes collection is created once and repeated likes are idempotent',()=>{
 const id='google-demo_0_athens',other='google-demo_1_athens';
 const first=mergeTopSwipesCollection([],id);
 assert.deepEqual(first,[{id:TOP_SWIPES_COLLECTION_ID,name:'Top Swipes',venueIds:[id]}]);
 const again=mergeTopSwipesCollection(first,id);
 assert.deepEqual(again,first);
 const added=mergeTopSwipesCollection(again,other);
 assert.deepEqual(added[0].venueIds,[id,other]);
 assert.deepEqual(mergeTopSwipesCollection([{id:'user-made',name:'TOP SWIPES',venueIds:[]}],id),
  [{id:'user-made',name:'Top Swipes',venueIds:[id]}]);
});

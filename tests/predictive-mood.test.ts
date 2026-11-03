import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getPredictiveMood} from '../lib/predictive-mood';
import {defaultPreferences} from '../lib/storage';
import type {UserPreferences} from '../types';

const empty:UserPreferences={moods:[],outings:[],budget:40,music:[],
 neighborhoods:[],atmosphere:[],social:[],timeSlots:[]};
test('Predictive Mood uses local weekend brunch context without claiming personalization',()=>{
 const p=getPredictiveMood(new Date(2026,10,1,11,0,0),empty,{});
 assert.equal(p.key,'brunch');assert.equal(p.category,'cafe');
 assert.equal(p.personalized,false);assert.match(p.signalLabel,/day & time/);
});
test('Predictive Mood prioritizes evening cocktails on weekend',()=>{
 const p=getPredictiveMood(new Date(2026,10,7,22,0,0),empty,{});
 assert.equal(p.key,'cocktails');assert.equal(p.category,'bar');
});
test('Predictive Mood takes positive and negative swipe signals and signup taste into account',()=>{
 const now=new Date(2026,10,2,16,0,0);
 const a=getPredictiveMood(now,{...empty,moods:['creative']},{});
 assert.equal(a.key,'creative');assert.equal(a.personalized,true);
 const b=getPredictiveMood(now,{...empty,moods:['creative']},{'real-six-dogs':'dislike'});
 assert.equal(b.personalized,true);
 assert.ok(b.explanation.includes('όσα έχεις επιλέξει'));
});
test('Predictive Mood respects no signals and returns a stable suggestion',()=>{
 const now=new Date(2026,10,2,9,0,0);
 assert.equal(getPredictiveMood(now,empty,{}).key,'coffee');
 assert.deepEqual(getPredictiveMood(now,defaultPreferences,{}),getPredictiveMood(now,defaultPreferences,{}));
});

import {getDemoPlaces} from '../lib/demo-places';
import {DEFAULT_AREA} from '../lib/places';
import {getForYouMatches} from '../lib/for-you';
import {predictNextVenue} from '../lib/predictive-mood';
import type {DemoEvent} from '../lib/demo-analytics';

test('Venue prediction returns a specific demo shop with an explainable reason',()=>{
 const now=new Date(2026,10,7,22,0,0);
 const matches=getForYouMatches(getDemoPlaces(DEFAULT_AREA),defaultPreferences,DEFAULT_AREA,{});
 const result=predictNextVenue(now,matches,defaultPreferences,{});
 assert.ok(result?.place.id.startsWith('demo_'));
 assert.ok(result?.reason.length);
 assert.ok(result?.headline.length);
 assert.equal(result?.evidenceLevel,'starter');
});
test('Repeated same-period activity changes predicted venue instead of filtering',()=>{
 const now=new Date(2026,10,7,21,0,0);
 const p={...empty,budget:60};
 const matches=getForYouMatches(getDemoPlaces(DEFAULT_AREA),p,DEFAULT_AREA,{});
 const defaultChoice=predictNextVenue(now,matches,p,{});
 const rival=matches.find(x=>x.place.id!==defaultChoice?.place.id&&x.place.category==='bar');
 assert.ok(rival);
 const events:DemoEvent[]=Array.from({length:18},(_,i)=>({
  name:'recommendation_opened',context:rival!.place.id,
  timestamp:new Date(2026,9,31-(i%3)*7,21,0,0).getTime()
 }));
 const predicted=predictNextVenue(now,matches,p,{},[],{}, {},events);
 assert.equal(predicted?.place.id,rival!.place.id);
 assert.match(predicted!.reason,/παρόμοιες ώρες/);
});
test('Disliked and negatively reviewed venues are excluded from specific prediction',()=>{
 const now=new Date(2026,10,7,22);
 const matches=getForYouMatches(getDemoPlaces(DEFAULT_AREA),defaultPreferences,DEFAULT_AREA,{});
 const first=predictNextVenue(now,matches,defaultPreferences,{})!;
 assert.notEqual(predictNextVenue(now,matches,defaultPreferences,{},[],{}, {[first.place.id]:'dislike'})?.place.id,first.place.id);
 assert.notEqual(predictNextVenue(now,matches,defaultPreferences,{},[],{[first.place.id]:'no'})?.place.id,first.place.id);
});

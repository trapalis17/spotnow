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

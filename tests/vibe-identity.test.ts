import assert from 'node:assert/strict';
import {test} from 'node:test';
import {getVibeIdentity} from '../lib/vibe-identity';
import type {UserPreferences} from '../types';

const empty:UserPreferences={moods:[],outings:[],budget:60,music:[],neighborhoods:[],
 atmosphere:[],social:[],timeSlots:[]};
test('Vibe Type is not invented before any user taste or behavior',()=>{
 assert.equal(getVibeIdentity(empty,{}),null);
});
test('Profile identity uses exactly the six agreed one-word titles',()=>{
 const cases=[
  [{...empty,moods:['social','lively'],outings:['coffee with friends']},'socialite'],
  [{...empty,moods:['romantic'],outings:['date night']},'romantic'],
  [{...empty,moods:['lively'],outings:['night out'],timeSlots:['evening']},'nocturnal'],
  [{...empty,moods:['creative'],music:['indie']},'tastemaker'],
 ] as const;
 for(const [p,expected] of cases)assert.equal(getVibeIdentity(p,{})?.key,expected);
});
test('Returning repeatedly to the same venue can lead to regular',()=>{
 const events=Array.from({length:9},(_,i)=>({
  name:'recommendation_opened',context:'demo_0_athens',timestamp:i+1
 }));
 assert.equal(getVibeIdentity(empty,{}, {},[],{},events)?.key,'regular');
});
test('Exploring many different venues can lead to explorer',()=>{
 const events=Array.from({length:10},(_,i)=>({
  name:'recommendation_opened',context:'demo_'+i+'_athens',timestamp:i+1
 }));
 assert.equal(getVibeIdentity(empty,{}, {},[],{},events)?.key,'explorer');
});
test('Taste swipes influence the title without storing a manually selected identity',()=>{
 const p={...empty, outings:['date night']};
 const before=getVibeIdentity(p,{});
 const after=getVibeIdentity(p,{'real-clumsies':'like','real-six-dogs':'like'});
 assert.ok(before);
 assert.ok(after);
 assert.ok(['regular','explorer','socialite','nocturnal','romantic','tastemaker'].includes(after!.key));
 assert.equal(getVibeIdentity(p,{'real-clumsies':'like','real-six-dogs':'like'})?.key,after?.key);
});

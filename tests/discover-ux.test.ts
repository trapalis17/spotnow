import assert from 'node:assert/strict';
import {test} from 'node:test';
import {NEIGHBORHOODS,REGIONS,closestAreas,haversineKm} from '../lib/attica-neighborhoods';
import {NEIGHBORHOOD_AREAS,getNeighborhoodSearchArea,AREAS} from '../lib/places';

test('Discover supports exactly the approved 30 Athens neighborhoods',()=>{
 assert.equal(NEIGHBORHOOD_AREAS.length,30);
 assert.equal(new Set(NEIGHBORHOOD_AREAS.map(a=>a.id)).size,30);
 assert.deepEqual(NEIGHBORHOOD_AREAS.map(a=>a.label),NEIGHBORHOODS.map(n=>n.name));
 assert.ok(NEIGHBORHOOD_AREAS.every(a=>AREAS.includes(a)));
 assert.equal(REGIONS.length,6);
});
test('Each selected neighborhood maps to a persistent demo-compatible SearchArea',()=>{
 for(const neighborhood of NEIGHBORHOODS){
  const area=getNeighborhoodSearchArea(neighborhood.name);
  assert.equal(area?.label,neighborhood.name);
  assert.ok(area?.id.startsWith('attica-'));
 }
});
test('The seven nearest neighborhoods are ordered by their distances to a user-selected reference',()=>{
 const point={latitude:37.929,longitude:23.700};
 const nearest=closestAreas(point,7);
 assert.equal(nearest.length,7);
 assert.equal(nearest[0].name,'Παλαιό Φάληρο');
 const distances=nearest.map(n=>haversineKm(point,n));
 assert.ok(distances.every((d,i)=>i===0||d>=distances[i-1]));
});

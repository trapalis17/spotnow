import {useMemo} from 'react';
import type {SearchArea} from '../lib/places';
import {getDemoPlaces} from '../lib/demo-places';
export const GOOGLE_PLACES_CONFIGURED=true;
export function useGooglePlaces(area:SearchArea){
 const places=useMemo(()=>getDemoPlaces(area),[area.id,area.latitude,area.longitude]);
 return {places,loading:false,error:'',configured:true};
}

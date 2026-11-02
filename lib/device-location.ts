import {Platform} from 'react-native';
import * as Location from 'expo-location';
import type {CoordinatePoint} from './attica-neighborhoods';

/** Location is requested only after the user taps "Κοντά μου".
 * GPS coordinates are used for ordering and are never persisted.
 */
export async function requestDevicePosition():Promise<CoordinatePoint>{
 if(Platform.OS==='web'){
  if(typeof navigator==='undefined'||!navigator.geolocation)
   throw new Error('Το πρόγραμμα περιήγησης δεν υποστηρίζει εντοπισμό.');
  return new Promise((resolve,reject)=>
   navigator.geolocation.getCurrentPosition(
    p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude}),
    ()=>reject(new Error('Δεν επιτράπηκε ή δεν ήταν διαθέσιμη η τοποθεσία.')),
    {enableHighAccuracy:false,timeout:12000,maximumAge:60000}
   )
  );
 }
 const permission=await Location.requestForegroundPermissionsAsync();
 if(permission.status!=='granted')throw new Error('Δεν επιτράπηκε η τοποθεσία.');
 const pos=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
 return {latitude:pos.coords.latitude,longitude:pos.coords.longitude};
}

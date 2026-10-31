import {useCallback,useEffect,useState} from 'react';
import {Alert} from 'react-native';
import {DEFAULT_AREA,getSelectedArea,selectArea} from '../lib/places';
import type {SearchArea} from '../lib/places';
export function useSearchArea(){
 const [area,setArea]=useState<SearchArea>(DEFAULT_AREA);
 useEffect(()=>{getSelectedArea().then(setArea).catch(()=>undefined);},[]);
 const changeArea=useCallback((next:SearchArea)=>{setArea(next);selectArea(next).catch(()=>undefined);},[]);
 const useDeviceLocation=useCallback(async()=>{
   changeArea(DEFAULT_AREA);
   Alert.alert('Demo location','Το πρωτότυπο δεν χρησιμοποιεί GPS. Επιλέχθηκε η Αθήνα για την προεπισκόπηση.');
 },[changeArea]);
 return {area,changeArea,useDeviceLocation};
}

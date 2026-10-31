import {useEffect,useMemo,useState} from 'react';
import {Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import {PreferenceChip} from './PreferenceChip';
import {Colors} from '../constants/theme';
import {
  REGIONS,NEIGHBORHOODS,canonicalArea,closestAreas,normalizeSearch,
  type CoordinatePoint,type Neighborhood,
} from '../lib/attica-neighborhoods';

type Reference={point:CoordinatePoint;source:'device'|'manual';label:string};
type Props={selected:string[];onToggle:(name:string)=>void};

async function requestPosition():Promise<CoordinatePoint>{
  if(Platform.OS==='web'){
    if(typeof navigator==='undefined'||!navigator.geolocation)
      throw new Error('Το πρόγραμμα περιήγησης δεν παρέχει πρόσβαση στην τοποθεσία.');
    return new Promise((resolve,reject)=>
      navigator.geolocation.getCurrentPosition(
        position=>resolve({latitude:position.coords.latitude,longitude:position.coords.longitude}),
        ()=>reject(new Error('Δεν επιτράπηκε ή δεν ήταν διαθέσιμη η τοποθεσία.')),
        {enableHighAccuracy:false,timeout:12000,maximumAge:60000}
      )
    );
  }
  const permission=await Location.requestForegroundPermissionsAsync();
  if(permission.status!=='granted') throw new Error('Δεν επιτράπηκε η τοποθεσία.');
  const position=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
  return {latitude:position.coords.latitude,longitude:position.coords.longitude};
}

/**
 * Renders inside the EXISTING third onboarding step.
 * No location is saved or transmitted; only selected neighborhood names are persisted
 * by the parent onboarding form, just as before.
 */
export function OnboardingLocationPreferences({selected,onToggle}:Props){
 const [reference,setReference]=useState<Reference|null>(null);
 const [locating,setLocating]=useState(true);
 const [locationMessage,setLocationMessage]=useState('');
 const [referencePicker,setReferencePicker]=useState(false);
 const [referenceSearch,setReferenceSearch]=useState('');
 const [expanded,setExpanded]=useState(false);
 const [search,setSearch]=useState('');

 useEffect(()=>{
   let active=true;
   requestPosition().then(point=>{
     if(active){setReference({point,source:'device',label:'Κοντά στην τοποθεσία σου'});setLocating(false);}
   }).catch(()=>{
     if(active){
       setLocationMessage('Δεν υπάρχει πρόσβαση στην τοποθεσία. Διάλεξε περιοχή αναφοράς για να δεις τις 7 κοντινότερες.');
       setReferencePicker(true);
       setLocating(false);
     }
   });
   return ()=>{active=false;};
 },[]);

 const nearby=useMemo(()=>reference?closestAreas(reference.point,7):[],[reference]);
 const nearbyNames=useMemo(()=>new Set(nearby.map(area=>area.name)),[nearby]);
 const checked=useMemo(()=>new Set(selected.map(canonicalArea)),[selected]);
 const normalizedQuery=normalizeSearch(search);
 const regions=useMemo(()=>REGIONS.map(region=>({
   region,
   areas:NEIGHBORHOODS.filter(area=>
     area.region===region&&!nearbyNames.has(area.name)&&
     (!normalizedQuery||normalizeSearch(area.name).includes(normalizedQuery))
   )
 })).filter(group=>group.areas.length>0),[nearbyNames,normalizedQuery]);
 const manualQuery=normalizeSearch(referenceSearch);
 const manualCandidates=useMemo(()=>
   NEIGHBORHOODS.filter(area=>manualQuery
     ? normalizeSearch(area.name).includes(manualQuery)
     : ['Σύνταγμα','Νέα Σμύρνη','Παλαιό Φάληρο','Χαλάνδρι','Πειραιάς'].includes(area.name)
   ).slice(0,12),[manualQuery]);

 const chooseReference=(area:Neighborhood)=>{
   setReference({point:{latitude:area.latitude,longitude:area.longitude},source:'manual',label:area.name});
   setReferencePicker(false);
   setReferenceSearch('');
   setLocationMessage('');
 };
 const chip=(area:Neighborhood)=>(
   <PreferenceChip key={area.name} label={area.name}
     selected={checked.has(area.name)} onPress={()=>onToggle(area.name)}/>
 );

 return <View style={styles.root}>
   <View style={styles.head}>
     <Ionicons name="location-outline" color={Colors.violet} size={17}/>
     <Text style={styles.label}>Περιοχές που προτιμάς</Text>
     {checked.size>0?<Text style={styles.count}>{checked.size} επιλεγμένες</Text>:null}
   </View>
   {locating?<Text style={styles.info}>Εντοπίζουμε τις πιο κοντινές περιοχές με την άδειά σου…</Text>:null}
   {!locating&&!reference?<Text style={styles.info}>{locationMessage}</Text>:null}
   {reference?<View style={styles.referenceRow}>
     <Text style={styles.referenceText}>
       {reference.source==='device'?'⌖ Με βάση την τοποθεσία σου':'⌖ Περιοχή αναφοράς: '+reference.label}
     </Text>
     <Pressable accessibilityRole="button" onPress={()=>setReferencePicker(v=>!v)}>
       <Text style={styles.change}>Αλλαγή</Text>
     </Pressable>
   </View>:null}

   {referencePicker?<View style={styles.manual}>
     <Text style={styles.manualLabel}>Επίλεξε περιοχή αναφοράς (όχι πραγματική τοποθεσία)</Text>
     <TextInput value={referenceSearch} onChangeText={setReferenceSearch}
       style={styles.input} placeholder="Αναζήτηση περιοχής αναφοράς…"
       placeholderTextColor={Colors.muted} autoCapitalize="none"
       accessibilityLabel="Αναζήτηση περιοχής αναφοράς"/>
     <View style={styles.chips}>
       {manualCandidates.map(area=>
         <PreferenceChip key={area.name} label={area.name} selected={reference?.source==='manual'&&reference.label===area.name}
           onPress={()=>chooseReference(area)}/>)}
     </View>
     {!manualCandidates.length?<Text style={styles.info}>Δεν βρέθηκε περιοχή.</Text>:null}
   </View>:null}

   {reference?<View>
     <Text style={styles.smallHeading}>7 κοντινότερες περιοχές</Text>
     <View style={styles.chips}>{nearby.map(chip)}</View>
   </View>:null}
   <Pressable style={styles.more} onPress={()=>setExpanded(v=>!v)}
     accessibilityRole="button" accessibilityState={{expanded}}
     accessibilityLabel={expanded?'− Show less':'+ Show more areas'}>
     <Text style={styles.moreText}>{expanded?'− Show less':'+ Show more areas'}</Text>
   </Pressable>
   {expanded?<View style={styles.expanded}>
     <View style={styles.searchBox}>
       <Ionicons name="search-outline" size={17} color={Colors.violet}/>
       <TextInput style={styles.search} value={search} onChangeText={setSearch}
         placeholder="Αναζήτηση γειτονιάς…" placeholderTextColor={Colors.muted}
         autoCapitalize="none" accessibilityLabel="Αναζήτηση γειτονιάς"/>
       {search.length>0?<Pressable onPress={()=>setSearch('')} accessibilityLabel="Καθαρισμός αναζήτησης">
         <Ionicons name="close-circle" size={18} color={Colors.muted}/>
       </Pressable>:null}
     </View>
     {regions.map(({region,areas})=><View key={region} style={styles.group}>
       <Text style={styles.region}>{region}</Text>
       <View style={styles.chips}>{areas.map(chip)}</View>
     </View>)}
     {!regions.length?<Text style={styles.info}>Δεν βρέθηκαν άλλες περιοχές.</Text>:null}
   </View>:null}
 </View>;
}
const styles=StyleSheet.create({
 root:{width:'100%',marginBottom:10},
 head:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:10,flexWrap:'wrap'},
 label:{color:Colors.text,fontWeight:'800',fontSize:13},
 count:{color:Colors.violet,fontSize:11,fontWeight:'800',marginLeft:'auto'},
 info:{fontSize:12,color:Colors.muted,lineHeight:19,marginVertical:9},
 referenceRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:12},
 referenceText:{fontSize:11,color:Colors.muted,flex:1},
 change:{fontSize:11,color:Colors.violet,fontWeight:'900',padding:6},
 smallHeading:{fontSize:12,color:Colors.muted,fontWeight:'700',marginBottom:11},
 chips:{flexDirection:'row',flexWrap:'wrap'},
 more:{backgroundColor:'#F1EDFF',borderRadius:14,borderColor:Colors.border,borderWidth:1,
   paddingVertical:13,paddingHorizontal:15,alignItems:'center',marginTop:5,marginBottom:12},
 moreText:{color:Colors.violet,fontWeight:'900',fontSize:12},
 expanded:{width:'100%',paddingTop:1},
 searchBox:{flexDirection:'row',alignItems:'center',gap:9,backgroundColor:Colors.card,
   borderWidth:1,borderColor:Colors.border,borderRadius:14,paddingHorizontal:12,marginBottom:12},
 search:{flex:1,color:Colors.text,fontSize:13,paddingVertical:12},
 group:{marginBottom:13},
 region:{color:Colors.violet,fontSize:12,fontWeight:'900',marginBottom:10},
 manual:{backgroundColor:'#F8F6FC',borderRadius:17,padding:12,marginBottom:15},
 manualLabel:{fontSize:11,color:Colors.muted,fontWeight:'700',marginBottom:9},
 input:{backgroundColor:Colors.card,borderWidth:1,borderColor:Colors.border,borderRadius:13,
   paddingHorizontal:12,paddingVertical:12,color:Colors.text,fontSize:13,marginBottom:11}
});

import {useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Colors,Radius} from '../constants/theme';
import {closestAreas,haversineKm,NEIGHBORHOODS,normalizeSearch,REGIONS,type CoordinatePoint,type Neighborhood} from '../lib/attica-neighborhoods';
import {getNeighborhoodSearchArea,type SearchArea} from '../lib/places';
import {requestDevicePosition} from '../lib/device-location';

type Props={area:SearchArea;onChange:(next:SearchArea)=>void};
/** Search is on the approved 30 Attica neighborhoods. GPS is opt-in and never saved. */
export function DiscoverAreaPicker({area,onChange}:Props){
 const [gps,setGps]=useState<CoordinatePoint|null>(null);
 const [locating,setLocating]=useState(false);
 const [message,setMessage]=useState('');
 const [expanded,setExpanded]=useState(false);
 const [search,setSearch]=useState('');
 const [openGroups,setOpenGroups]=useState<Record<string,boolean>>({});
 const reference=gps??area;
 const nearby=useMemo(()=>closestAreas(reference,7),[reference.latitude,reference.longitude]);
 const nearbyNames=useMemo(()=>new Set(nearby.map(n=>n.name)),[nearby]);
 const query=normalizeSearch(search);
 const nearFiltered=useMemo(()=>nearby.filter(n=>!query||normalizeSearch(n.name).includes(query)),[nearby,query]);
 const groups=useMemo(()=>REGIONS.map(region=>({
  region,areas:NEIGHBORHOODS.filter(n=>n.region===region&&!nearbyNames.has(n.name)&&
   (!query||normalizeSearch(n.name).includes(query)))
 })).filter(g=>g.areas.length>0),[nearbyNames,query]);
 const choose=(neighborhood:Neighborhood)=>{
  const found=getNeighborhoodSearchArea(neighborhood.name);
  if(found)onChange(found);
 };
 const locate=async()=>{
  if(locating)return;
  setLocating(true);setMessage('');
  try{setGps(await requestDevicePosition());}
  catch{setMessage('Δεν δόθηκε τοποθεσία. Μπορείς να επιλέξεις περιοχή χειροκίνητα.');}
  finally{setLocating(false);}
 };
 const chip=(n:Neighborhood)=>{
  const selected=area.label===n.name;
  return <Pressable key={n.name} onPress={()=>choose(n)} accessibilityRole="button"
   accessibilityLabel={'Επιλογή περιοχής '+n.name} accessibilityState={{selected}}
   style={[s.chip,selected&&s.chipOn]}>
   <Text style={[s.chipName,selected&&s.chipTextOn]}>{n.name}</Text>
   {gps?<Text style={[s.distance,selected&&s.distanceOn]}>{haversineKm(gps,n).toFixed(1)} km</Text>:null}
  </Pressable>;
 };
 return <View style={s.root}>
  <View style={s.header}>
   <View style={s.headerText}><Text style={s.eyebrow}>DISCOVERY AREAS</Text>
    <Text style={s.selected}> <Ionicons name="location-outline" color={Colors.violet} size={17}/>{'  '}{area.label}</Text>
   </View>
   <Pressable onPress={locate} disabled={locating} accessibilityRole="button" style={s.locate}>
    <Ionicons name="navigate-outline" color={Colors.violet} size={16}/>
    <Text style={s.locateText}>{locating?'Εντοπισμός…':'Κοντά μου'}</Text>
   </Pressable>
  </View>
  {message?<Text style={s.notice}>{message}</Text>:null}
  <Text style={s.groupHeading}>{gps?'Οι 7 κοντινότερες περιοχές σου':'7 περιοχές κοντά στην επιλεγμένη περιοχή'}</Text>
  <View style={s.chips}>{nearFiltered.map(chip)}</View>
  <Pressable onPress={()=>setExpanded(v=>!v)} style={s.showAll} accessibilityRole="button"
   accessibilityState={{expanded}} accessibilityLabel={expanded?'Κλείσιμο λίστας περιοχών':'Προβολή όλων των περιοχών'}>
   <Text style={s.showAllText}>{expanded?'Λιγότερες περιοχές':'Όλες οι περιοχές'}</Text>
   <Ionicons name={expanded?'chevron-up':'chevron-down'} size={16} color={Colors.violet}/>
  </Pressable>
  {expanded?<View style={s.expanded}>
   <View style={s.search}>
    <Ionicons name="search-outline" color={Colors.violet} size={18}/>
    <TextInput value={search} onChangeText={setSearch} placeholder="Αναζήτηση περιοχής…"
     placeholderTextColor={Colors.subtle} style={s.input} autoCapitalize="none"
     accessibilityLabel="Αναζήτηση γειτονιάς"/>
    {search?<Pressable onPress={()=>setSearch('')} accessibilityRole="button" accessibilityLabel="Καθαρισμός περιοχής">
      <Ionicons name="close-circle" size={18} color={Colors.muted}/>
     </Pressable>:null}
   </View>
   {groups.map(({region,areas})=>{
    const open=Boolean(openGroups[region])||Boolean(query);
    return <View key={region} style={s.group}>
     <Pressable onPress={()=>setOpenGroups(o=>({...o,[region]:!o[region]}))}
      accessibilityRole="button" accessibilityState={{expanded:open}} style={s.groupHead}>
      <Text style={s.region}>{region}</Text>
      <View style={s.groupRight}><Text style={s.groupCount}>{areas.length}</Text>
       <Ionicons name={open?'chevron-up':'chevron-down'} size={17} color={Colors.violet}/>
      </View>
     </Pressable>
     {open?<View style={s.chips}>{areas.map(chip)}</View>:null}
    </View>;
   })}
   {query&&!groups.length&&!nearFiltered.length?<Text style={s.notice}>Δεν βρέθηκε περιοχή.</Text>:null}
   <Text style={s.helper}>30 επιλεγμένες περιοχές Αττικής · Ενδεικτικές αποστάσεις από κέντρα περιοχών.</Text>
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 root:{marginTop:6,marginBottom:22},
 header:{flexDirection:'row',alignItems:'center',gap:10,justifyContent:'space-between',marginBottom:15},
 headerText:{flex:1},eyebrow:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1.1},
 selected:{fontSize:16,fontWeight:'900',color:Colors.text,marginTop:6},
 locate:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:Colors.cardSoft,borderRadius:Radius.pill,paddingHorizontal:14,paddingVertical:11},
 locateText:{color:Colors.violet,fontSize:12,fontWeight:'900'},
 notice:{color:Colors.muted,fontSize:12,lineHeight:18,marginBottom:12},
 groupHeading:{color:Colors.muted,fontSize:12,fontWeight:'800',marginBottom:11},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:8},
 chip:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.pill,
  paddingHorizontal:13,paddingVertical:10,flexDirection:'row',alignItems:'center',gap:5},
 chipOn:{borderColor:Colors.lavender,backgroundColor:Colors.lilac},
 chipName:{color:Colors.text,fontWeight:'800',fontSize:12},
 chipTextOn:{color:Colors.violet},
 distance:{fontSize:10,color:Colors.muted,fontWeight:'700'},
 distanceOn:{color:Colors.violet},
 showAll:{marginTop:14,backgroundColor:Colors.cardSoft,borderRadius:15,padding:14,flexDirection:'row',
  justifyContent:'center',alignItems:'center',gap:7},
 showAllText:{color:Colors.violet,fontWeight:'900',fontSize:12},
 expanded:{marginTop:14},
 search:{flexDirection:'row',alignItems:'center',gap:9,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,
  borderRadius:15,paddingHorizontal:13,minHeight:49,marginBottom:11},
 input:{color:Colors.text,flex:1,fontSize:13,paddingVertical:10},
 group:{marginTop:7,paddingBottom:8,borderBottomWidth:1,borderBottomColor:Colors.border},
 groupHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10},
 region:{color:Colors.text,fontSize:13,fontWeight:'900'},
 groupRight:{flexDirection:'row',alignItems:'center',gap:8},
 groupCount:{color:Colors.violet,fontSize:12,fontWeight:'800'},
 helper:{color:Colors.subtle,fontSize:10,lineHeight:16,marginTop:17},
});

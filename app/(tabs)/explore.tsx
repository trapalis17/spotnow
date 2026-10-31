import { useState } from 'react';
import { Pressable,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AreaSelector } from '../../components/AreaSelector';
import { GooglePlacesResults } from '../../components/GooglePlacesResults';
import { useSearchArea } from '../../hooks/useSearchArea';
import { Colors,Spacing } from '../../constants/theme';
type Filter='all'|'cafe'|'restaurant'|'bar';
const filters:{id:Filter;label:string}[]=[
 {id:'all',label:'✳ All vibes'},{id:'cafe',label:'☕ Coffee'},
 {id:'restaurant',label:'✺ Food'},{id:'bar',label:'✦ Nightlife'}
];
export default function ExploreScreen(){
 const {area,changeArea,useDeviceLocation}=useSearchArea();
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<Filter>('all');
 const [mapMode,setMapMode]=useState(true);
 const [revision,setRevision]=useState(0);
 return <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
  <Text style={styles.kicker}>✦ THE CITY IS YOURS</Text>
  <Text style={styles.title}>Go somewhere<Text style={{color:Colors.lime}}> good.</Text></Text>
  <Text style={styles.subtitle}>Real places. Real personalities. Your next spot, sorted for you.</Text>
  <AreaSelector area={area} onChange={a=>{setRevision(0);changeArea(a);}} onLocate={useDeviceLocation}/>
  <LinearGradient colors={['#FFFFFF','#F0EDFA']} style={styles.searchWrap}>
   <Text style={styles.searchIcon}>⌕</Text>
   <TextInput style={styles.input} value={query} onChangeText={setQuery}
    placeholder="Όνομα, περιοχή ή vibe..." placeholderTextColor="#777086" autoCorrect={false}/>
   {query?<Pressable onPress={()=>setQuery('')}><Text style={styles.clear}>×</Text></Pressable>:null}
  </LinearGradient>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
   {filters.map(o=><Pressable key={o.id} onPress={()=>setFilter(o.id)} style={[styles.filter,filter===o.id&&styles.active]}>
     <Text style={[styles.filterText,filter===o.id&&styles.activeText]}>{o.label}</Text>
   </Pressable>)}
  </ScrollView>
  <View style={styles.modeRow}>
   <Text style={styles.modeLabel}>DISCOVER <Text style={{color:Colors.lime}}>✳</Text> {area.label}</Text>
   <View style={styles.mode}>
    <Pressable style={[styles.modeBtn,mapMode&&styles.selected]} onPress={()=>setMapMode(true)}><Text style={styles.modeText}>⌖ Map</Text></Pressable>
    <Pressable style={[styles.modeBtn,!mapMode&&styles.selected]} onPress={()=>setMapMode(false)}><Text style={styles.modeText}>☷ List</Text></Pressable>
   </View>
  </View>
  <GooglePlacesResults key={area.id+'-'+revision} area={area} query={query} filter={filter} mapMode={mapMode}/>
  <Pressable onPress={()=>setRevision(n=>n+1)} style={styles.refresh}><Text style={styles.refreshText}>↻ Ανανέωση καταστημάτων</Text></Pressable>
 </ScrollView>;
}
const styles=StyleSheet.create({
 container:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:40,paddingBottom:52},
 kicker:{color:Colors.purple,fontSize:10,fontWeight:'900',letterSpacing:1.5,marginBottom:9},
 title:{color:Colors.text,fontSize:34,fontWeight:'900',letterSpacing:-1.5,lineHeight:42},
 subtitle:{color:Colors.muted,fontSize:13,marginTop:6,marginBottom:24,lineHeight:20},
 searchWrap:{borderRadius:18,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'rgba(196,152,255,.35)',paddingHorizontal:14,marginBottom:18},
 searchIcon:{fontSize:27,color:Colors.lime,marginRight:10},input:{color:Colors.text,flex:1,fontSize:14,paddingVertical:16},
 clear:{color:Colors.text,fontSize:23,fontWeight:'800',padding:6},
 filters:{gap:8,paddingBottom:18},
 filter:{paddingVertical:11,paddingHorizontal:13,borderRadius:999,backgroundColor:Colors.card,borderWidth:1,borderColor:Colors.border},
 active:{backgroundColor:Colors.limeSoft,borderColor:Colors.limeSoft},
 filterText:{color:Colors.muted,fontWeight:'800',fontSize:12},activeText:{color:'#172311'},
 modeRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:5},
 modeLabel:{color:Colors.text,fontSize:12,fontWeight:'900',flex:1},
 mode:{flexDirection:'row',gap:5,backgroundColor:Colors.card,padding:4,borderRadius:15},
 modeBtn:{paddingVertical:9,paddingHorizontal:13,borderRadius:12},selected:{backgroundColor:'#ECE4FF'},
 modeText:{color:Colors.violet,fontSize:12,fontWeight:'900'},
 refresh:{padding:16,alignItems:'center',borderRadius:17,backgroundColor:Colors.card,marginTop:10},
 refreshText:{color:Colors.lime,fontWeight:'900'},
});

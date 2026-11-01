import {Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {GooglePlace} from '../lib/google-places';
import type {SearchArea} from '../lib/places';
import {Colors} from '../constants/theme';
export function GooglePinsMap({area,places,onSelect}:{area:SearchArea;places:GooglePlace[];onSelect:(id:string)=>void}){
 return <View style={styles.wrap}>
   <View style={styles.top}><Ionicons name="map-outline" size={19} color={Colors.violet}/>
     <Text style={styles.heading}>Demo map · {area.label}</Text></View>
   <View style={styles.map}>
     <View style={[styles.road,{top:'28%',transform:[{rotate:'12deg'}]}]}/>
     <View style={[styles.road,{top:'70%',transform:[{rotate:'-8deg'}]}]}/>
     <View style={[styles.vertical,{left:'35%'}]}/><View style={[styles.vertical,{left:'74%'}]}/>
     {places.map((p,i)=><Pressable key={p.id} onPress={()=>onSelect(p.id)} accessibilityRole="button"
       accessibilityLabel={'Άνοιγμα '+p.name}
       style={[styles.pin,{left:18+(i%3)*95,top:20+Math.floor(i/3)*61}]}>
       <Ionicons name={p.category==='cafe'?'cafe':p.category==='bar'?'wine':'restaurant'} color="#fff" size={15}/>
     </Pressable>)}
     <Text style={styles.watermark}>VIBE / MOCK MAP</Text>
   </View>
   <Text style={styles.caption}>Ενδεικτικές πινέζες — χωρίς GPS ή εξωτερικό χάρτη. Πάτησε μια πινέζα.</Text>
 </View>;
}
const styles=StyleSheet.create({
 wrap:{borderRadius:22,overflow:'hidden',backgroundColor:'#fff',marginBottom:15,borderColor:Colors.border,borderWidth:1},
 top:{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:15,paddingVertical:12},
 heading:{fontWeight:'900',fontSize:14,color:Colors.text},
 map:{height:305,backgroundColor:'#EEE6DC',overflow:'hidden',position:'relative'},
 road:{position:'absolute',left:-20,right:-20,height:19,backgroundColor:'#fff',opacity:.85},
 vertical:{position:'absolute',top:-15,bottom:-15,width:20,backgroundColor:'#fff',opacity:.84,transform:[{rotate:'14deg'}]},
 pin:{position:'absolute',width:35,height:35,borderRadius:18,borderWidth:2,borderColor:'#fff',backgroundColor:Colors.violet,alignItems:'center',justifyContent:'center',shadowColor:'#67443B',shadowOpacity:.2,shadowRadius:5,elevation:3},
 watermark:{position:'absolute',bottom:14,right:15,fontSize:10,color:'#A2958B',fontWeight:'900',letterSpacing:2},
 caption:{fontSize:11,color:Colors.muted,padding:12,lineHeight:17}
});

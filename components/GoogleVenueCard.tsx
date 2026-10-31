import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PlaceMatch } from '../lib/place-intelligence';
import { Colors } from '../constants/theme';

const looks={
 cafe:{colors:['#EEE8FF','#DCD8FC'] as const,icon:'cafe-outline' as const,label:'Καφέ',accent:'#674CB5'},
 restaurant:{colors:['#FFE8EC','#FFDCE7'] as const,icon:'restaurant-outline' as const,label:'Φαγητό',accent:'#BB4876'},
 bar:{colors:['#E0F8EC','#C9EEE4'] as const,icon:'wine-outline' as const,label:'Ποτό',accent:'#237D69'}
};
export function GoogleVenueCard({match,onPress,saved,onSave}:{
 match:PlaceMatch;onPress:()=>void;saved:boolean;onSave:()=>void
}){
 const {place,vibe,score,reasons}=match;
 const look=looks[place.category];
 return <Pressable style={({pressed})=>[styles.card,pressed&&styles.pressed]} onPress={onPress} accessibilityRole="button">
  <LinearGradient colors={look.colors} style={styles.cover} start={{x:0,y:0}} end={{x:1,y:1}}>
   <View style={styles.decorRing}/>
   <View style={styles.categoryTag}>
    <Ionicons name={look.icon} color={look.accent} size={16}/>
    <Text style={[styles.categoryText,{color:look.accent}]}>{look.label}</Text>
   </View>
   <Ionicons name={look.icon} color={look.accent} size={73} style={styles.heroIcon}/>
   <Pressable hitSlop={10} style={styles.heart} onPress={e=>{e.stopPropagation();onSave();}}
     accessibilityLabel={saved?'Αφαίρεση από αγαπημένα':'Προσθήκη στα αγαπημένα'}>
     <Ionicons name={saved?'heart':'heart-outline'} color={saved?Colors.rose:Colors.text} size={22}/>
   </Pressable>
  </LinearGradient>
  <View style={styles.body}>
   <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
   <View style={styles.addressRow}>
    <Ionicons name="location-outline" size={15} color={Colors.muted}/>
    <Text style={styles.address} numberOfLines={1}>{place.address??'Δες τη θέση του στον χάρτη'}</Text>
   </View>
   <View style={styles.bottom}>
    <View style={styles.match}>
      <Ionicons name="sparkles" color={Colors.violet} size={15}/>
      <Text style={styles.matchText}>≈{score}% Vibe Match</Text>
    </View>
    <Text style={styles.reason} numberOfLines={1}>{reasons[0]??vibe.label}</Text>
    <View style={styles.arrow}><Ionicons name="arrow-forward" size={18} color="#fff"/></View>
   </View>
  </View>
 </Pressable>;
}
const styles=StyleSheet.create({
 card:{backgroundColor:'#fff',borderRadius:25,overflow:'hidden',borderWidth:1,borderColor:Colors.border,marginBottom:15,
  shadowColor:'#3E2861',shadowOffset:{width:0,height:6},shadowOpacity:.07,shadowRadius:12,elevation:2},
 pressed:{opacity:.86},
 cover:{height:108,padding:15,flexDirection:'row',justifyContent:'space-between',overflow:'hidden'},
 decorRing:{position:'absolute',width:205,height:205,borderRadius:103,right:50,top:-143,borderWidth:28,borderColor:'rgba(255,255,255,.44)'},
 categoryTag:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,255,255,.84)',paddingHorizontal:12,paddingVertical:8,borderRadius:999},
 categoryText:{fontSize:12,fontWeight:'800'},
 heroIcon:{position:'absolute',bottom:-13,right:80,opacity:.55,transform:[{rotate:'-12deg'}]},
 heart:{width:39,height:39,borderRadius:13,backgroundColor:'rgba(255,255,255,.92)',alignItems:'center',justifyContent:'center'},
 body:{paddingHorizontal:17,paddingTop:15,paddingBottom:16},
 name:{color:Colors.text,fontSize:21,fontWeight:'900',letterSpacing:-.7,lineHeight:27},
 addressRow:{flexDirection:'row',gap:5,alignItems:'center',marginTop:7},
 address:{color:Colors.muted,fontSize:12,flex:1},
 bottom:{marginTop:16,paddingTop:12,borderTopWidth:1,borderTopColor:Colors.border,flexDirection:'row',alignItems:'center',gap:8},
 match:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#F2ECFF',paddingHorizontal:9,paddingVertical:8,borderRadius:11},
 matchText:{color:Colors.violet,fontWeight:'900',fontSize:12},
 reason:{flex:1,color:Colors.muted,fontSize:11},
 arrow:{width:32,height:32,borderRadius:11,backgroundColor:Colors.violet,alignItems:'center',justifyContent:'center'}
});

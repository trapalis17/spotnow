import {Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import type {PlaceMatch} from '../lib/place-intelligence';
import {Colors,Radius} from '../constants/theme';
const look={
 cafe:{colors:['#EEE8FF','#D9D0F8'] as const,icon:'cafe-outline' as const,label:'Coffee'},
 restaurant:{colors:['#F9E7F0','#F3D7E8'] as const,icon:'restaurant-outline' as const,label:'Food'},
 bar:{colors:['#E6E9FF','#D1D6F7'] as const,icon:'wine-outline' as const,label:'Drinks'}
};
export function GoogleVenueCard({match,onPress,saved,onSave}:{match:PlaceMatch;onPress:()=>void;saved:boolean;onSave:()=>void}){
 const {place,score}=match;const theme=look[place.category];
 return <Pressable onPress={onPress} accessibilityRole="button" style={({pressed})=>[s.card,pressed&&{opacity:.82}]}>
  <LinearGradient colors={theme.colors} style={s.photo} start={{x:0,y:0}} end={{x:1,y:1}}>
   <Ionicons name={theme.icon} size={54} color={Colors.violet}/>
  </LinearGradient>
  <View style={s.details}>
   <View style={s.top}><Text style={s.category}>{theme.label} · Demo</Text><Pressable onPress={e=>{e.stopPropagation();onSave();}} hitSlop={10} accessibilityRole="button" accessibilityLabel={saved?'Αφαίρεση από αγαπημένα':'Προσθήκη στα αγαπημένα'}><Ionicons name={saved?'heart':'heart-outline'} size={21} color={saved?Colors.rose:Colors.muted}/></Pressable></View>
   <Text style={s.name} numberOfLines={1}>{place.name}</Text>
   <Text style={s.area} numberOfLines={1}><Ionicons name="location-outline" size={12} color={Colors.muted}/> {place.address?.replace('Εικονικό κατάστημα · ','')||'Demo area'}</Text>
   <View style={s.bottom}><Text style={s.match}>✳ ≈{score}% match</Text><Ionicons name="arrow-forward" size={17} color={Colors.violet}/></View>
  </View>
 </Pressable>;
}
const s=StyleSheet.create({
 card:{backgroundColor:'#fff',borderRadius:Radius.md,borderWidth:1,borderColor:Colors.border,marginBottom:12,
  flexDirection:'row',overflow:'hidden',minHeight:143},
 photo:{width:120,alignItems:'center',justifyContent:'center'},
 details:{flex:1,padding:14,gap:5},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 category:{fontSize:11,fontWeight:'800',color:Colors.violet,backgroundColor:'#F3EFFF',paddingVertical:6,paddingHorizontal:11,borderRadius:Radius.pill,overflow:'hidden'},
 name:{fontSize:17,fontWeight:'900',letterSpacing:-.3,color:Colors.text},
 area:{fontSize:12,color:Colors.muted},
 bottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:4},
 match:{fontSize:12,fontWeight:'900',color:Colors.violet,backgroundColor:'#F2ECFF',paddingHorizontal:12,paddingVertical:7,borderRadius:Radius.pill,overflow:'hidden'}
});

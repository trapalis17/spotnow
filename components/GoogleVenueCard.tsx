import {useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import type {PlaceMatch} from '../lib/place-intelligence';
import {Colors,Radius} from '../constants/theme';

const looks={
 cafe:{colors:['#E1D2BF','#B58F7D'] as const,icon:'cafe-outline' as const,label:'Coffee'},
 restaurant:{colors:['#EBD2C2','#B97D71'] as const,icon:'restaurant-outline' as const,label:'Food'},
 bar:{colors:['#D8C1AE','#866655'] as const,icon:'wine-outline' as const,label:'Drinks'},
};
type CardVariant='featured'|'grid';
type Props={match:PlaceMatch;onPress:()=>void;saved:boolean;onSave:()=>void;variant?:CardVariant};

/** Discover-only venue card. One large featured spot followed by compact 2-column image cards. */
export function GoogleVenueCard({match,onPress,saved,onSave,variant='featured'}:Props){
 const {place,score,vibe}=match;
 const theme=looks[place.category];
 const [photoFailed,setPhotoFailed]=useState(false);
 const hasPhoto=Boolean(place.demoPhoto&&!photoFailed);
 const area=place.address?.replace('Εικονικό κατάστημα · ','')||'Demo περιοχή';
 const compact=variant==='grid';
 return <Pressable
   onPress={onPress}
   accessibilityRole="button"
   accessibilityLabel={place.name+' · '+area+' · άνοιγμα demo καταστήματος'}
   style={({pressed})=>[styles.card,compact&&styles.gridCard,pressed&&styles.pressed]}>
   <View style={[styles.photo,compact&&styles.gridPhoto]}>
    <LinearGradient colors={theme.colors} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}}/>
    {!hasPhoto?<Ionicons name={theme.icon} size={compact?49:72} color="rgba(255,255,255,.75)" style={styles.fallback}/>:null}
    {hasPhoto?<Image source={{uri:place.demoPhoto}} style={StyleSheet.absoluteFill} resizeMode="cover"
      accessibilityLabel="Ενδεικτική φωτογραφία και όχι πραγματική φωτογραφία καταστήματος"
      onError={()=>setPhotoFailed(true)}/>:null}
    <LinearGradient colors={['rgba(23,16,39,.20)','rgba(23,16,39,0)','rgba(23,16,39,.48)']}
      locations={[0,.5,1]} style={StyleSheet.absoluteFill}/>
    <View style={[styles.photoTop,compact&&styles.photoTopSmall]}>
     <View style={[styles.categoryPill,compact&&styles.categorySmall]}>
      <Text style={[styles.categoryText,compact&&styles.categoryTextSmall]}>{theme.label}</Text>
     </View>
     <Pressable onPress={event=>{event.stopPropagation();onSave();}}
      accessibilityRole="button" accessibilityLabel={saved?'Αφαίρεση από αγαπημένα':'Αποθήκευση στα αγαπημένα'}
      hitSlop={8} style={[styles.heart,compact&&styles.smallHeart]}>
      <Ionicons name={saved?'heart':'heart-outline'} size={compact?18:22} color={saved?Colors.rose:Colors.text}/>
     </Pressable>
    </View>
    {!compact?<Text style={styles.photoDisclosure}>{hasPhoto?'Ενδεικτική φωτογραφία':'Demo spot · χωρίς φωτογραφία'}</Text>:null}
   </View>
   <View style={[styles.body,compact&&styles.gridBody]}>
    <Text style={[styles.name,compact&&styles.gridName]} numberOfLines={compact?2:1}>{place.name}</Text>
    <View style={styles.locationRow}>
     <Ionicons name="location-outline" color={Colors.muted} size={compact?12:15}/>
     <Text numberOfLines={1} style={[styles.area,compact&&styles.gridArea]}>{area}</Text>
    </View>
    <View style={[styles.bottom,compact&&styles.gridBottom]}>
     {!compact?<Text style={styles.vibe} numberOfLines={1}>{vibe.label}</Text>:null}
     <View style={[styles.matchPill,compact&&styles.compactMatch]}>
      <Ionicons name="sparkles" size={compact?11:13} color={Colors.violet}/>
      <Text style={[styles.matchText,compact&&styles.compactMatchText]}>≈{score}% match</Text>
     </View>
    </View>
   </View>
  </Pressable>;
}
const styles=StyleSheet.create({
 card:{backgroundColor:Colors.card,borderRadius:Radius.lg,overflow:'hidden',marginBottom:18,
  shadowColor:'#4C352A',shadowOffset:{width:0,height:6},shadowOpacity:.08,shadowRadius:17,elevation:2},
 gridCard:{width:'48.3%',borderRadius:Radius.md,marginBottom:13,
  shadowOpacity:.045,shadowRadius:10,elevation:1},
 pressed:{opacity:.9,transform:[{scale:.995}]},
 photo:{height:257,backgroundColor:'#E9D5C6',justifyContent:'space-between',overflow:'hidden'},
 gridPhoto:{height:174},
 fallback:{position:'absolute',alignSelf:'center',top:'35%'},
 photoTop:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',padding:15},
 photoTopSmall:{padding:9},
 categoryPill:{backgroundColor:'rgba(255,255,255,.96)',borderRadius:Radius.pill,paddingHorizontal:14,paddingVertical:9},
 categorySmall:{paddingHorizontal:9,paddingVertical:7},
 categoryText:{color:Colors.text,fontSize:12,fontWeight:'800'},
 categoryTextSmall:{fontSize:10},
 heart:{width:43,height:43,borderRadius:Radius.pill,backgroundColor:'rgba(255,255,255,.96)',alignItems:'center',justifyContent:'center'},
 smallHeart:{width:32,height:32},
 photoDisclosure:{color:'#fff',fontSize:11,fontWeight:'700',marginLeft:16,marginBottom:12,
  textShadowColor:'rgba(0,0,0,.55)',textShadowRadius:4,textShadowOffset:{width:0,height:1}},
 body:{paddingHorizontal:17,paddingTop:16,paddingBottom:18},
 gridBody:{paddingHorizontal:12,paddingTop:12,paddingBottom:13,minHeight:103},
 name:{fontSize:22,fontWeight:'900',letterSpacing:-.65,color:Colors.text,lineHeight:28},
 gridName:{fontSize:15,fontWeight:'800',letterSpacing:-.3,lineHeight:19,minHeight:19},
 locationRow:{flexDirection:'row',gap:5,alignItems:'center',marginTop:7},
 area:{fontSize:13,color:Colors.muted,flex:1},
 gridArea:{fontSize:11},
 bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:14},
 gridBottom:{marginTop:10},
 vibe:{flex:1,fontSize:13,fontWeight:'700',color:Colors.muted},
 matchPill:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#F7EAE0',
  borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:9,alignSelf:'flex-start'},
 compactMatch:{paddingHorizontal:9,paddingVertical:7},
 matchText:{fontSize:12,fontWeight:'900',color:Colors.violet},
 compactMatchText:{fontSize:10},
});

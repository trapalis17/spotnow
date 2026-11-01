import {useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import type {PlaceMatch} from '../lib/place-intelligence';
import {Colors,Radius} from '../constants/theme';

const looks={
 cafe:{colors:['#D3C3EA','#8D6AB6'] as const,icon:'cafe-outline' as const,label:'Coffee'},
 restaurant:{colors:['#EAC4C8','#B16E9E'] as const,icon:'restaurant-outline' as const,label:'Food'},
 bar:{colors:['#B6AED9','#6B568E'] as const,icon:'wine-outline' as const,label:'Drinks'}
};

export function GoogleVenueCard({match,onPress,saved,onSave}:{
 match:PlaceMatch;onPress:()=>void;saved:boolean;onSave:()=>void;
}){
 const {place,score,vibe}=match;
 const theme=looks[place.category];
 const [photoFailed,setPhotoFailed]=useState(false);
 const hasImage=Boolean(place.demoPhoto&&!photoFailed);
 const area=place.address?.replace('Εικονικό κατάστημα · ','')||'Demo περιοχή';

 return <Pressable
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel={place.name+' · '+area+' · προβολή demo καταστήματος'}
  style={({pressed})=>[styles.card,pressed&&styles.pressed]}>
  <View style={styles.media}>
   <LinearGradient colors={theme.colors} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}}/>
   {!hasImage?<Ionicons name={theme.icon} size={76} color="rgba(255,255,255,.7)" style={styles.fallbackIcon}/>:null}
   {hasImage?<Image
     source={{uri:place.demoPhoto}}
     style={StyleSheet.absoluteFill}
     resizeMode="cover"
     accessibilityLabel="Ενδεικτική φωτογραφία, όχι φωτογραφία του συγκεκριμένου καταστήματος"
     onError={()=>setPhotoFailed(true)}
    />:null}
   <LinearGradient
    colors={['rgba(23,16,39,.14)','rgba(23,16,39,0)','rgba(23,16,39,.55)']}
    locations={[0,.48,1]}
    style={StyleSheet.absoluteFill}
   />
   <View style={styles.photoTop}>
    <View style={styles.categoryPill}>
     <Text style={styles.categoryText}>{theme.label}</Text>
    </View>
    <Pressable
     onPress={event=>{event.stopPropagation();onSave();}}
     accessibilityRole="button"
     accessibilityLabel={saved?'Αφαίρεση από τα αγαπημένα':'Αποθήκευση στα αγαπημένα'}
     hitSlop={10}
     style={({pressed})=>[styles.heart,pressed&&{opacity:.75}]}>
     <Ionicons name={saved?'heart':'heart-outline'} size={23} color={saved?Colors.rose:Colors.text}/>
    </Pressable>
   </View>
   <Text style={styles.photoDisclosure}>{hasImage?'Ενδεικτική φωτογραφία':'Demo venue · χωρίς φωτογραφία'}</Text>
  </View>
  <View style={styles.body}>
   <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
   <View style={styles.locationRow}>
    <Ionicons name="location-outline" color={Colors.muted} size={15}/>
    <Text style={styles.area} numberOfLines={1}>{area}</Text>
   </View>
   <View style={styles.bottom}>
    <Text style={styles.vibe} numberOfLines={1}>{vibe.label}</Text>
    <View style={styles.matchPill}>
     <Ionicons name="sparkles" size={13} color={Colors.violet}/>
     <Text style={styles.matchText}>≈{score}% match</Text>
    </View>
   </View>
  </View>
 </Pressable>;
}

const styles=StyleSheet.create({
 card:{
  backgroundColor:Colors.card,borderRadius:Radius.lg,overflow:'hidden',marginBottom:20,
  shadowColor:'#271D42',shadowOffset:{width:0,height:7},shadowOpacity:.09,
  shadowRadius:20,elevation:3,
 },
 pressed:{opacity:.91,transform:[{scale:.993}]},
 media:{height:260,backgroundColor:'#D8CAED',overflow:'hidden',justifyContent:'space-between'},
 fallbackIcon:{position:'absolute',alignSelf:'center',top:92},
 photoTop:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',padding:15},
 categoryPill:{
  backgroundColor:'rgba(255,255,255,.94)',borderRadius:Radius.pill,
  paddingHorizontal:15,paddingVertical:9,
 },
 categoryText:{fontSize:12,fontWeight:'800',color:Colors.text},
 heart:{
  width:44,height:44,borderRadius:Radius.pill,backgroundColor:'rgba(255,255,255,.96)',
  alignItems:'center',justifyContent:'center',
 },
 photoDisclosure:{
  color:'#fff',fontSize:11,fontWeight:'700',marginLeft:17,marginBottom:13,
  textShadowColor:'rgba(0,0,0,.55)',textShadowRadius:5,textShadowOffset:{width:0,height:1},
 },
 body:{paddingHorizontal:18,paddingTop:17,paddingBottom:18},
 name:{fontSize:22,fontWeight:'900',letterSpacing:-.65,color:Colors.text,lineHeight:28},
 locationRow:{flexDirection:'row',gap:6,alignItems:'center',marginTop:7},
 area:{fontSize:13,color:Colors.muted,flex:1},
 bottom:{
  flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  gap:12,marginTop:15,
 },
 vibe:{flex:1,fontSize:13,fontWeight:'700',color:Colors.muted},
 matchPill:{
  flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#F0EAFE',
  borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:9,
 },
 matchText:{fontSize:12,fontWeight:'900',color:Colors.violet},
});

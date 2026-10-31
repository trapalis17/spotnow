import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Spacing} from '../../constants/theme';
import {getSavedVenueIds,toggleSavedVenue} from '../../lib/storage';
import {getDemoPlaceById} from '../../lib/demo-places';
import type {GooglePlace} from '../../lib/google-places';
export default function SavedScreen(){
 const router=useRouter();
 const [ids,setIds]=useState<string[]>([]);
 useFocusEffect(useCallback(()=>{getSavedVenueIds().then(setIds).catch(()=>setIds([]));},[]));
 const places=ids.filter(id=>id.startsWith('google-')).map(id=>getDemoPlaceById(id.slice(7))).filter((p):p is GooglePlace=>p!==null);
 return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
  <Text style={styles.title}>Τα αγαπημένα σου <Text style={{color:Colors.rose}}>♥</Text></Text>
  <Text style={styles.subtitle}>{places.length?places.length+' demo spots που κράτησες.':'Τα μέρη που αγαπάς, όλα σε ένα σημείο.'}</Text>
  {!places.length?<LinearGradient colors={['#F0E9FF','#FDEBF4']} style={styles.empty}>
   <Ionicons name="heart-outline" size={42} color={Colors.rose}/>
   <Text style={styles.emptyTitle}>Δεν έχεις κρατήσει κάποιο μέρος ακόμη.</Text>
   <Text style={styles.emptyText}>Πάτα ♡ σε ένα demo μαγαζί ή κάνε swipe δεξιά.</Text>
   <Pressable style={styles.discover} onPress={()=>router.push('/(tabs)')}><Text style={styles.discoverText}>Ανακάλυψε μαγαζιά ↗</Text></Pressable>
  </LinearGradient>:null}
  {places.map(place=><Pressable key={place.id} style={styles.card}
   onPress={()=>router.push({pathname:'/google-venue',params:{id:place.id}})}>
   <View style={styles.symbol}><Ionicons name={place.category==='cafe'?'cafe-outline':place.category==='bar'?'wine-outline':'restaurant-outline'} size={23} color={Colors.violet}/></View>
   <View style={styles.middle}><Text style={styles.name}>{place.name}</Text><Text style={styles.note}>{place.address}</Text></View>
   <Pressable onPress={async(e)=>{e.stopPropagation();setIds(await toggleSavedVenue('google-'+place.id));}} accessibilityLabel="Αφαίρεση από αγαπημένα">
     <Ionicons name="heart" size={24} color={Colors.rose}/>
   </Pressable>
  </Pressable>)}
  {places.length?<Text style={styles.footer}>Τοπικά αποθηκευμένα αγαπημένα · Μόνο demo καταστήματα.</Text>:null}
 </ScrollView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:39,paddingBottom:65},
 title:{fontSize:32,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:40},
 subtitle:{color:Colors.muted,fontSize:14,lineHeight:21,marginTop:9,marginBottom:25},
 empty:{padding:25,borderRadius:26,alignItems:'center',gap:12},
 emptyTitle:{textAlign:'center',color:Colors.text,fontSize:20,fontWeight:'900',lineHeight:27},
 emptyText:{textAlign:'center',color:Colors.muted,fontSize:13,lineHeight:20},
 discover:{backgroundColor:Colors.violet,borderRadius:14,paddingVertical:14,paddingHorizontal:19,marginTop:7},
 discoverText:{color:'#fff',fontWeight:'900',fontSize:14},
 card:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:19,padding:15,marginBottom:12,flexDirection:'row',alignItems:'center',gap:12},
 symbol:{width:49,height:49,backgroundColor:'#F0E9FF',borderRadius:14,alignItems:'center',justifyContent:'center'},
 middle:{flex:1},name:{fontWeight:'900',fontSize:16,color:Colors.text},
 note:{fontSize:12,color:Colors.muted,marginTop:5},
 footer:{fontSize:11,color:Colors.muted,marginTop:10}
});

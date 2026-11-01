import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../constants/theme';
import { isGooglePlaceId } from '../lib/google-places';
import { getDemoPlaceById } from '../lib/demo-places';
import type { GooglePlace } from '../lib/google-places';
import { inferPlaceVibe } from '../lib/place-intelligence';
import { getSavedVenueIds, toggleSavedVenue, getVisitFeedback, saveVisitFeedback, type VisitFeedback } from '../lib/storage';
import { GooglePinsMap } from '../components/GooglePinsMap';

const priceText:Record<string,string>={
 PRICE_LEVEL_FREE:'Δωρεάν', PRICE_LEVEL_INEXPENSIVE:'€',
 PRICE_LEVEL_MODERATE:'€€', PRICE_LEVEL_EXPENSIVE:'€€€',
 PRICE_LEVEL_VERY_EXPENSIVE:'€€€€',
};
const amenityKeys:{key:keyof GooglePlace;name:string;icon:'sunny-outline'|'people-outline'|'cafe-outline'|'wine-outline'|'musical-notes-outline'|'calendar-outline'|'paw-outline'|'restaurant-outline'}[]=[
 {key:'outdoorSeating',name:'Εξωτερικός χώρος',icon:'sunny-outline'},
 {key:'goodForGroups',name:'Για παρέες',icon:'people-outline'},
 {key:'servesBrunch',name:'Brunch',icon:'restaurant-outline'},
 {key:'servesCoffee',name:'Καφές',icon:'cafe-outline'},
 {key:'servesCocktails',name:'Cocktails',icon:'wine-outline'},
 {key:'liveMusic',name:'Live μουσική',icon:'musical-notes-outline'},
 {key:'reservable',name:'Κρατήσεις',icon:'calendar-outline'},
 {key:'allowsDogs',name:'Pet friendly',icon:'paw-outline'},
];
const safeWeb=(url?:string)=>url&&/^https:\/\//i.test(url)?url:null;
const directionsUrl=(p:GooglePlace)=>'https://www.google.com/maps/dir/?api=1&destination='+
 encodeURIComponent(p.latitude+','+p.longitude)+'&destination_place_id='+encodeURIComponent(p.id);
const categoryName=(c:GooglePlace['category'])=>c==='cafe'?'Καφέ':c==='bar'?'Bar':'Εστιατόριο';
export default function GoogleVenueProfile(){
 const {id}=useLocalSearchParams<{id?:string}>();
 const router=useRouter();
 const [place,setPlace]=useState<GooglePlace|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [saved,setSaved]=useState(false);
 const [showHours,setShowHours]=useState(false);
 const [showMap,setShowMap]=useState(false);
 const [confirmedVisit,setConfirmedVisit]=useState(false);
 const [visitFeedback,setVisitFeedback]=useState<VisitFeedback|null>(null);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const placeId=typeof id==='string'?id:'';
  const mock=isGooglePlaceId(placeId)?getDemoPlaceById(placeId):null;
  setPlace(mock);
  setError(mock?'':'Δεν βρέθηκε το demo κατάστημα.');
  setLoading(false);
  setShowHours(false);setShowMap(false);
  getSavedVenueIds().then(ids=>setSaved(ids.includes('google-'+placeId))).catch(()=>undefined);
  getVisitFeedback().then(items=>setVisitFeedback(items[placeId]??null)).catch(()=>undefined);
 },[id,retry]);
 const open=(_url?:string|null)=>{Alert.alert('Demo preview','Οι οδηγίες και τα εξωτερικά links θα συνδεθούν σε επόμενο στάδιο.');};
 const vibe=place?inferPlaceVibe(place):null;
 const amenities=place?amenityKeys.filter(({key})=>place[key]===true):[];
 const photo: string | null = null;
 const googleDirections=place?directionsUrl(place):null;
 return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
  {loading?<View style={styles.loading}><ActivityIndicator color={Colors.violet} size="large"/><Text style={styles.message}>Φορτώνουμε το μαγαζί…</Text></View>:null}
  {!loading&&error?<View style={styles.errorCard}>
   <Text style={styles.errorText}>{error}</Text>
   <Pressable onPress={()=>setRetry(n=>n+1)} style={styles.retry}><Text style={styles.retryText}>Δοκίμασε ξανά</Text></Pressable>
   <Pressable onPress={()=>router.back()}><Text style={styles.backText}>Επιστροφή</Text></Pressable>
  </View>:null}
  {place?<View>
   <View style={styles.hero}>
    <LinearGradient colors={place.category==='cafe'?['#945342','#B77A64']:place.category==='bar'?['#65483E','#B37966']:['#6F897E','#A66F5B']}
      style={StyleSheet.absoluteFill}/>
    {photo?<Image style={StyleSheet.absoluteFill} source={{uri:photo}} resizeMode="cover"/>:null}
    <LinearGradient colors={['rgba(13,10,30,.27)','rgba(18,12,37,.25)','rgba(17,12,33,.91)']}
      locations={[0,.35,1]} style={StyleSheet.absoluteFill}/>
    {!photo?<Ionicons name={place.category==='cafe'?'cafe-outline':place.category==='bar'?'wine-outline':'restaurant-outline'}
      size={132} color="rgba(255,255,255,.24)" style={styles.heroSymbol}/>:null}
    <View style={styles.heroTop}>
     <Pressable style={styles.circleButton} onPress={()=>router.back()} accessibilityLabel="Επιστροφή">
       <Ionicons name="arrow-back" size={23} color="#fff"/>
     </Pressable>
     <Pressable style={styles.circleButton} onPress={async()=>{
      const ids=await toggleSavedVenue('google-'+place.id);setSaved(ids.includes('google-'+place.id));
     }} accessibilityLabel={saved?'Αφαίρεση από αγαπημένα':'Αποθήκευση'}>
       <Ionicons name={saved?'heart':'heart-outline'} size={23} color="#fff"/>
     </Pressable>
    </View>
    <View style={styles.heroBottom}>
     <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{categoryName(place.category)}</Text></View>
     <Text style={styles.name}>{place.name}</Text>
     <View style={styles.heroAddressRow}>
       <Ionicons name="location-outline" size={16} color="#fff"/>
       <Text style={styles.heroAddress} numberOfLines={2}>{place.address??'Διαθέσιμο στο Google Maps'}</Text>
     </View>
    </View>
   </View>
   {place.photoAttributions?.length? <View style={styles.photoCredit}>
     {place.photoAttributions.map((a,i)=><Text key={i} style={styles.credit}
       onPress={()=>open(a.uri?.startsWith('//')?'https:'+a.uri:a.uri)}>
       Φωτογραφία: {a.displayName}{a.uri?' ↗':''}
     </Text>)}
   </View>:null}

   <View style={styles.main}>
    <View style={styles.facts}>
     {place.rating!==undefined?<View style={styles.fact}>
       <Ionicons name="star" size={17} color="#D7A256"/>
       <Text style={styles.factValue}>{place.rating.toFixed(1)}</Text>
       {place.userRatingCount!==undefined?<Text style={styles.factHint}>({place.userRatingCount})</Text>:null}
     </View>:null}
     {place.priceLevel&&priceText[place.priceLevel]?<View style={styles.fact}>
       <Text style={styles.factValue}>{priceText[place.priceLevel]}</Text>
       <Text style={styles.factHint}>Τιμές</Text>
     </View>:null}
     {place.openNow!==undefined?<View style={styles.fact}>
       <View style={[styles.dot,{backgroundColor:place.openNow?'#638F69':'#9B8D84'}]}/>
       <Text style={styles.factValue}>{place.openNow?'Ανοιχτό':'Κλειστό'}</Text>
     </View>:null}
    </View>

    <View style={styles.actions}>
     <Pressable onPress={()=>open(googleDirections)} style={styles.primaryAction}>
       <Ionicons name="navigate" size={19} color="#fff"/>
       <Text style={styles.primaryText}>Οδηγίες</Text>
     </Pressable>
     {place.phone?<Pressable onPress={()=>Alert.alert('Demo preview','Η κλήση είναι ανενεργή στο πρωτότυπο.')} style={styles.outlineAction}>
       <Ionicons name="call-outline" size={19} color={Colors.violet}/>
       <Text style={styles.outlineText}>Κλήση</Text>
     </Pressable>:null}
     {place.website&&safeWeb(place.website)?<Pressable onPress={()=>open(place.website)} style={styles.outlineAction}>
       <Ionicons name="globe-outline" size={19} color={Colors.violet}/>
       <Text style={styles.outlineText}>Website</Text>
     </Pressable>:null}
    </View>

    <LinearGradient colors={['#F7EAE0','#FBF5EE']} style={styles.vibePanel}>
     <View style={styles.panelIcon}><Ionicons name="sparkles" size={22} color={Colors.violet}/></View>
     <Text style={styles.panelTitle}>The vibe</Text>
     <Text style={styles.vibeTitle}>{vibe?.label}</Text>
     <View style={styles.tags}>
       {vibe?.tags.slice(0,5).map(tag=><View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
     </View>
     {vibe?.evidence?.length?<Text style={styles.evidence}>{vibe.evidence.slice(0,2).join(' · ')}</Text>:null}
     <Text style={styles.disclosure}>Εκτίμηση Vibe από τις καταχωρισμένες πληροφορίες — όχι επιβεβαιωμένη ατμόσφαιρα.</Text>
    </LinearGradient>

    {place.editorialSummary?<Text style={styles.summary}>{place.editorialSummary}</Text>:null}
    {amenities.length||place.accessibility?.length?<View style={styles.section}>
      <Text style={styles.sectionTitle}>Highlights</Text>
      <View style={styles.amenities}>
       {amenities.map(({key,name,icon})=><View key={key} style={styles.amenity}>
        <Ionicons name={icon} size={17} color={Colors.violet}/>
        <Text style={styles.amenityText}>{name}</Text>
       </View>)}
       {place.accessibility?.length?<View style={styles.amenity}><Ionicons name="accessibility-outline" size={17} color={Colors.violet}/><Text style={styles.amenityText}>Δηλωμένη προσβασιμότητα</Text></View>:null}
      </View>
     </View>:null}

    {place.weekdayDescriptions?.length?<View style={styles.section}>
      <Pressable style={styles.sectionToggle} onPress={()=>setShowHours(v=>!v)} accessibilityRole="button" accessibilityState={{expanded:showHours}}>
       <View style={styles.sectionToggleLabel}><Ionicons name="time-outline" size={21} color={Colors.violet}/><Text style={styles.sectionTitle}>Opening hours</Text></View>
       <Ionicons name={showHours?'chevron-up':'chevron-down'} size={20} color={Colors.text}/>
      </Pressable>
      {showHours?<View style={styles.hours}>{place.weekdayDescriptions.map((line,i)=>
        <Text key={i} style={styles.hourText}>{line}</Text>)}</View>:null}
     </View>:null}

    <View style={styles.section}>
     <View style={styles.sectionToggleLabel}><Ionicons name="location-outline" size={21} color={Colors.violet}/><Text style={styles.sectionTitle}>Location</Text></View>
     <Text style={styles.street}>{place.address??'Προβολή στο Google Maps'}</Text>
     <Pressable style={styles.mapToggle} onPress={()=>setShowMap(v=>!v)} accessibilityRole="button">
      <Text style={styles.mapToggleText}>{showMap?'Κλείσιμο χάρτη':'Δες το στον χάρτη'}</Text>
      <Ionicons name={showMap?'chevron-up':'arrow-forward'} size={18} color={Colors.violet}/>
     </Pressable>
     {showMap?<GooglePinsMap area={{id:'venue',label:place.name,latitude:place.latitude,longitude:place.longitude}}
       places={[place]} onSelect={()=>open(place.googleMapsUrl)}/>:null}
    </View>
    <View style={styles.visitCard}>
      <Text style={styles.visitHeading}>Was it your vibe? ✳</Text>
      <Text style={styles.visitBody}>Έχεις επισκεφθεί το συγκεκριμένο demo spot; Το feedback είναι προαιρετικό και αποθηκεύεται μόνο στη συσκευή.</Text>
      {!confirmedVisit&&!visitFeedback?<Pressable style={styles.visitButton} onPress={()=>setConfirmedVisit(true)}><Text style={styles.visitButtonText}>Ναι, το επισκέφθηκα</Text></Pressable>:null}
      {confirmedVisit||visitFeedback?<View style={styles.feedbackRow}>
        {([['yes','Loved it'],['kind-of','Kind of'],['no','Not really']] as const).map(([key,label])=><Pressable key={key} onPress={()=>{setVisitFeedback(key);saveVisitFeedback(place.id,key).catch(()=>undefined);}} style={[styles.feedbackChoice,visitFeedback===key&&styles.feedbackSelected]}><Text style={styles.feedbackText}>{label}</Text></Pressable>)}
      </View>:null}
    </View>
    <Text style={styles.googleCredit}>Demo καταχώριση — τα χαρακτηριστικά είναι ενδεικτικά, όχι πραγματικά δεδομένα.</Text>
   </View>
  </View>:null}
 </ScrollView>;
}
const styles=StyleSheet.create({
 visitCard:{borderRadius:20,backgroundColor:'#F8E7DB',padding:17,marginTop:19,marginBottom:16},
 visitHeading:{fontSize:17,fontWeight:'900',color:Colors.text},
 visitBody:{fontSize:13,lineHeight:20,color:Colors.muted,marginVertical:9},
 visitButton:{backgroundColor:Colors.violet,borderRadius:13,padding:12,alignItems:'center'},
 visitButtonText:{fontSize:12,color:'#fff',fontWeight:'800'},
 feedbackRow:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:7},
 feedbackChoice:{borderWidth:1,borderColor:Colors.border,borderRadius:Radius.pill,paddingHorizontal:14,paddingVertical:11,backgroundColor:'#fff'},
 feedbackSelected:{borderColor:Colors.violet,backgroundColor:'#EBD5C7'},
 feedbackText:{color:Colors.violet,fontWeight:'800',fontSize:11},
 page:{flex:1,backgroundColor:Colors.background},content:{paddingBottom:45},
 loading:{paddingTop:135,alignItems:'center',gap:20},
 message:{color:Colors.muted,fontSize:14},
 errorCard:{margin:24,marginTop:120,backgroundColor:'#fff',padding:26,borderRadius:24,alignItems:'center'},
 errorText:{color:Colors.text,fontSize:16,textAlign:'center',marginBottom:18},
 retry:{backgroundColor:Colors.limeSoft,padding:15,paddingHorizontal:20,borderRadius:14},
 retryText:{fontWeight:'900',color:'#3E4C39'},
 backText:{color:Colors.violet,fontWeight:'800',marginTop:16},
 hero:{height:370,backgroundColor:'#A4614A',justifyContent:'space-between',overflow:'hidden'},
 heroTop:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:22,paddingTop:38},
 circleButton:{height:45,width:45,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(21,14,42,.48)'},
 heroBottom:{paddingHorizontal:24,paddingBottom:29},
 heroSymbol:{position:'absolute',right:26,top:75,transform:[{rotate:'-15deg'}]},
 categoryBadge:{alignSelf:'flex-start',backgroundColor:'rgba(255,255,255,.24)',paddingHorizontal:14,paddingVertical:8,borderRadius:Radius.pill,borderWidth:1,borderColor:'rgba(255,255,255,.38)',marginBottom:14},
 categoryBadgeText:{color:'#fff',fontSize:12,fontWeight:'900'},
 name:{color:'#fff',fontSize:34,fontWeight:'900',letterSpacing:-1.35,lineHeight:40},
 heroAddressRow:{flexDirection:'row',gap:7,alignItems:'flex-start',marginTop:11},
 heroAddress:{flex:1,color:'#fff',opacity:.93,fontSize:13,lineHeight:20},
 photoCredit:{paddingHorizontal:24,paddingTop:7},
 credit:{fontSize:10,color:Colors.muted,marginTop:3},
 main:{paddingHorizontal:Spacing.lg,paddingTop:22},
 facts:{flexDirection:'row',flexWrap:'wrap',gap:8},
 fact:{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:10,paddingHorizontal:14,backgroundColor:'#fff',borderRadius:Radius.pill,borderWidth:1,borderColor:Colors.border},
 factValue:{fontSize:13,fontWeight:'900',color:Colors.text},
 factHint:{fontSize:11,color:Colors.muted},
 dot:{height:8,width:8,borderRadius:4},
 actions:{flexDirection:'row',gap:8,marginVertical:21},
 primaryAction:{flex:1.2,flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center',backgroundColor:Colors.violet,borderRadius:17,paddingVertical:17},
 primaryText:{fontSize:14,color:'#fff',fontWeight:'900'},
 outlineAction:{flex:1,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Colors.border,backgroundColor:'#fff',borderRadius:17,paddingVertical:16},
 outlineText:{fontSize:12,color:Colors.violet,fontWeight:'800'},
 vibePanel:{borderRadius:26,padding:22,marginBottom:25,overflow:'hidden'},
 panelIcon:{height:42,width:42,backgroundColor:'#fff',borderRadius:15,alignItems:'center',justifyContent:'center',marginBottom:11},
 panelTitle:{fontSize:16,color:Colors.text,fontWeight:'800'},
 vibeTitle:{fontSize:26,color:Colors.violet,fontWeight:'900',letterSpacing:-.7,marginTop:5},
 tags:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:15},
 tag:{backgroundColor:'rgba(255,255,255,.85)',borderRadius:Radius.pill,paddingHorizontal:13,paddingVertical:9},
 tagText:{fontSize:12,color:Colors.violet,fontWeight:'700'},
 evidence:{fontSize:12,color:Colors.text,lineHeight:19,marginTop:13},
 disclosure:{fontSize:11,lineHeight:17,color:Colors.muted,marginTop:14},
 summary:{color:Colors.text,fontSize:15,lineHeight:25,marginBottom:24,paddingHorizontal:4},
 section:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:22,padding:18,marginBottom:15},
 sectionTitle:{fontSize:17,fontWeight:'900',color:Colors.text,letterSpacing:-.3},
 amenities:{flexDirection:'row',gap:8,flexWrap:'wrap',marginTop:16},
 amenity:{flexDirection:'row',alignItems:'center',gap:6,borderRadius:Radius.pill,backgroundColor:'#F7F1EA',paddingHorizontal:14,paddingVertical:11},
 amenityText:{fontSize:12,color:Colors.text,fontWeight:'700'},
 sectionToggle:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 sectionToggleLabel:{flexDirection:'row',alignItems:'center',gap:9},
 hours:{marginTop:17,paddingTop:13,borderTopWidth:1,borderTopColor:Colors.border},
 hourText:{fontSize:13,color:Colors.text,lineHeight:25},
 street:{fontSize:13,color:Colors.muted,lineHeight:20,marginTop:9},
 mapToggle:{backgroundColor:'#F5E7DC',paddingHorizontal:15,paddingVertical:13,borderRadius:13,marginTop:15,marginBottom:5,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 mapToggleText:{fontSize:13,color:Colors.violet,fontWeight:'900'},
 googleCredit:{fontSize:11,color:Colors.muted,lineHeight:18,paddingHorizontal:4,marginTop:6}
});

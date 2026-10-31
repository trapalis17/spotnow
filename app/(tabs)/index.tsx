import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {useFocusEffect,useRouter} from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { GooglePlacesResults } from '../../components/GooglePlacesResults';
import { VibeTasteSwipe } from '../../components/VibeTasteSwipe';
import type {TasteDecision} from '../../lib/vibe-dna';
import {emptyDailyVenueSwipeState,ensureDailyVenueBatch,recordDailyVenueVote,resetDailyVenueDNA,
 getDailyVenueDnaSummary,remainingDailyMs,type DailyVenueSwipeState} from '../../lib/daily-venue-swipe';
import {getDailyVenueSwipeState,saveDailyVenueSwipeState} from '../../lib/storage';
import { Colors, Spacing } from '../../constants/theme';
import { useSearchArea } from '../../hooks/useSearchArea';
import { AREAS } from '../../lib/places';

type Category = 'all' | 'cafe' | 'restaurant' | 'bar';
const categories: {id:Category;name:string;icon:'sparkles-outline'|'cafe-outline'|'restaurant-outline'|'wine-outline'}[] = [
 {id:'all',name:'Όλα',icon:'sparkles-outline'},
 {id:'cafe',name:'Καφέ',icon:'cafe-outline'},
 {id:'restaurant',name:'Φαγητό',icon:'restaurant-outline'},
 {id:'bar',name:'Ποτό',icon:'wine-outline'},
];
function NumberLabel({n,title}: {n:number;title:string}) {
 return <View style={styles.numberRow}>
   <View style={styles.number}><Text style={styles.numberText}>{n}</Text></View>
   <Text style={styles.stepTitle}>{title}</Text>
 </View>;
}
export default function HomeScreen(){
 const router=useRouter();
 const {area,changeArea,useDeviceLocation}=useSearchArea();
 const [category,setCategory]=useState<Category>('all');
 const [mood,setMood]=useState('');
 const [discoveryMode,setDiscoveryMode]=useState<'list'|'map'|'swipe'>('swipe');
 const [showAllAreas,setShowAllAreas]=useState(false);
 const [dailyState,setDailyState]=useState<DailyVenueSwipeState>(emptyDailyVenueSwipeState);
 const dailyRef=useRef<DailyVenueSwipeState>(emptyDailyVenueSwipeState());
 const dailyHydrated=useRef(false);
 const editVersion=useRef(0);
 const [tasteOpen,setTasteOpen]=useState(false);
 const [tasteView,setTasteView]=useState<'cards'|'dna'>('cards');
 const commitDaily=(next:DailyVenueSwipeState)=>{
   editVersion.current+=1;
   dailyRef.current=next;
   dailyHydrated.current=true;
   setDailyState(next);
   saveDailyVenueSwipeState(next).catch(()=>undefined);
 };
 useFocusEffect(useCallback(()=>{
   let active=true;
   const version=editVersion.current;
   getDailyVenueSwipeState().then(saved=>{
     if(active&&editVersion.current===version){
       dailyRef.current=saved;dailyHydrated.current=true;setDailyState(saved);
     }
   }).catch(()=>undefined);
   return ()=>{active=false;};
 },[]));
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{
   const tick=()=>{
     const timestamp=Date.now();
     setNow(timestamp);
     const current=dailyRef.current;
     if(tasteOpen&&current.startedAt&&remainingDailyMs(current,timestamp)===0){
       commitDaily(ensureDailyVenueBatch(current,area,timestamp));
     }
   };
   const timer=setInterval(tick,30000);
   return ()=>clearInterval(timer);
 },[tasteOpen,area]);
 const tasteSummary=useMemo(()=>getDailyVenueDnaSummary(dailyState.votes),[dailyState.votes]);
 const openTaste=async(view:'cards'|'dna')=>{
   const current=dailyHydrated.current?dailyRef.current:await getDailyVenueSwipeState();
   const next=ensureDailyVenueBatch(current,area,Date.now());
   commitDaily(next);
   setNow(Date.now());
   setTasteView(view);
   setTasteOpen(true);
 };
 const voteTaste=(id:string,decision:TasteDecision)=>{
   const now=Date.now();
   const current=dailyRef.current;
   // Do not allow an expired day's card to count as an extra swipe.
   const active=current.startedAt&&remainingDailyMs(current,now)>0
     ?current:ensureDailyVenueBatch(current,area,now);
   const next=recordDailyVenueVote(active,id,decision);
   if(next!==current)commitDaily(next);
 };
 const resetTaste=()=>commitDaily(resetDailyVenueDNA(dailyRef.current));
 const answeredToday=Object.keys(dailyState.batchVotes).length;
 const timeLeft=remainingDailyMs(dailyState,now);
 const areas=showAllAreas?AREAS:AREAS.slice(0,5);
 return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
   <View style={styles.brand}>
     <Text style={styles.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
     <Text style={styles.brandRight}>Βρες το δικό σου spot.</Text>
   </View>
   <Text style={styles.headline}>Πού πάμε<Text style={{color:Colors.violet}}> σήμερα;</Text></Text>
   <Text style={styles.intro}>3 βήματα για να βρεις το spot σου · Demo preview.</Text>
   <LinearGradient colors={['#E7DFFF','#FFEAF2','#E8F8EC']}
     start={{x:0,y:0}} end={{x:1,y:1}} style={styles.tasteEntry}>
     <View style={styles.tasteTop}>
       <View style={styles.tasteSymbol}><Ionicons name="sparkles" size={24} color={Colors.violet}/></View>
       <Text style={styles.tasteKicker}>NEW ✳ PREFERENCE LEARNING</Text>
       <View style={styles.tasteDots}><Text style={styles.tasteDotsText}>♥ × ↷</Text></View>
     </View>
     <Text style={styles.tasteTitle}>Vibe Swipe <Text style={{color:Colors.violet}}>✳</Text></Text>
     <Text style={styles.tasteDescription}>8 συγκεκριμένα demo μαγαζιά κάθε 24 ώρες. Κάνε swipe σε spots, δες τα προφίλ τους και ανακάλυψε τι σου ταιριάζει.</Text>
     <View style={styles.tasteMeta}>
       <Ionicons name="finger-print-outline" color={Colors.violet} size={15}/>
       <Text style={styles.tasteMetaText}>{dailyState.startedAt&&timeLeft===0?'Νέες 8 κάρτες διαθέσιμες':`${answeredToday} / 8 σήμερα · ${tasteSummary.meaningfulCount} taste signals`}</Text>
     </View>
     <View style={styles.tasteActions}>
       <Pressable style={styles.tasteStart} onPress={()=>{openTaste('cards').catch(()=>undefined);}} accessibilityRole="button">
         <Text style={styles.tasteStartText}>{answeredToday>=8?'Δες τη σημερινή οκτάδα':answeredToday?'Continue swiping':'Start swiping'} ↗</Text>
       </Pressable>
       <Pressable style={styles.tasteReview} onPress={()=>{openTaste('dna').catch(()=>undefined);}} accessibilityRole="button">
         <Text style={styles.tasteReviewText}>My Vibe DNA</Text>
         <Ionicons name="arrow-forward-outline" color={Colors.violet} size={16}/>
       </Pressable>
     </View>
   </LinearGradient>

   <View style={styles.step}>
     <NumberLabel n={1} title="Τι έχεις όρεξη;"/>
     <View style={styles.categoryRow}>
       {categories.map(item=><Pressable key={item.id} onPress={()=>setCategory(item.id)}
         accessibilityRole="button" accessibilityState={{selected:category===item.id}}
         style={[styles.category,category===item.id&&styles.categoryActive]}>
         <Ionicons name={item.icon} size={23} color={category===item.id?'#fff':Colors.violet}/>
         <Text style={[styles.categoryText,category===item.id&&styles.categoryTextActive]}>{item.name}</Text>
       </Pressable>)}
     </View>
     <View style={styles.searchBox}>
       <Ionicons name="sparkles-outline" size={19} color={Colors.violet}/>
       <TextInput value={mood} onChangeText={setMood} style={styles.input}
         placeholder="Π.χ. ήσυχο, brunch, για ραντεβού…"
         placeholderTextColor="#827A91" returnKeyType="done" accessibilityLabel="Πώς θέλεις να είναι το μαγαζί;"/>
       {mood? <Pressable onPress={()=>setMood('')} accessibilityLabel="Καθαρισμός διάθεσης">
         <Ionicons name="close-circle" size={21} color={Colors.muted}/>
       </Pressable>:null}
     </View>
   </View>

   <View style={styles.step}>
     <NumberLabel n={2} title="Σε ποια περιοχή;"/>
     <View style={styles.currentRow}>
       <View style={styles.currentArea}>
         <Ionicons name="location" size={20} color={Colors.violet}/>
         <Text style={styles.currentText} numberOfLines={1}>{area.label}</Text>
       </View>
       <Pressable onPress={()=>useDeviceLocation().catch(e=>Alert.alert('Τοποθεσία',e instanceof Error?e.message:'Δεν βρέθηκε η τοποθεσία.'))}
         style={styles.nearMe} accessibilityRole="button">
         <Ionicons name="navigate" size={16} color={Colors.violet}/>
         <Text style={styles.nearMeText}>Κοντά μου</Text>
       </Pressable>
     </View>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areas}>
       {areas.map(option=><Pressable key={option.id} onPress={()=>changeArea(option)}
         accessibilityRole="button" accessibilityState={{selected:area.id===option.id}}
         style={[styles.areaChip,area.id===option.id&&styles.areaChipActive]}>
         <Text style={[styles.areaChipText,area.id===option.id&&styles.areaChipTextActive]}>{option.label}</Text>
       </Pressable>)}
       <Pressable onPress={()=>setShowAllAreas(v=>!v)} style={styles.moreAreas}>
         <Text style={styles.moreText}>{showAllAreas?'Λιγότερες':'Άλλες περιοχές'}  {showAllAreas?'−':'+'}</Text>
       </Pressable>
     </ScrollView>
   </View>

   <View style={styles.resultsHead}>
     <NumberLabel n={3} title="Διάλεξε το spot σου"/>
     <View style={styles.toggle}>
       {([
        {id:'list',label:'Λίστα',icon:'list'},
        {id:'swipe',label:'Swipe spots',icon:'albums-outline'},
        {id:'map',label:'Χάρτης',icon:'map-outline'},
       ] as const).map(item=><Pressable key={item.id} onPress={()=>setDiscoveryMode(item.id)}
         accessibilityRole="button" accessibilityState={{selected:discoveryMode===item.id}}
         style={[styles.toggleBtn,discoveryMode===item.id&&styles.toggleActive]}
         accessibilityLabel={item.id==='swipe'?'Swipe προτάσεις με like και pass':item.label}>
         <Ionicons name={item.icon} size={17} color={discoveryMode===item.id?'#fff':Colors.text}/>
         <Text style={[styles.toggleText,discoveryMode===item.id&&styles.toggleTextActive]}>{item.label}</Text>
       </Pressable>)}
     </View>
   </View>
   {discoveryMode==='swipe'?<Text style={styles.swipeIntro}>Swipe demo spots για αποθήκευση ή pass. Το Vibe Swipe πιο πάνω παρουσιάζει 8 ονομαστικά μαγαζιά ανά 24ωρο.</Text>:null}
   <GooglePlacesResults area={area} filter={category} prompt={mood} tasteFeedback={dailyState.votes}
     compact={discoveryMode==='list'} mapMode={discoveryMode==='map'}
     swipeMode={discoveryMode==='swipe'} hideHeading/>
   <VibeTasteSwipe visible={tasteOpen} initialView={tasteView} state={dailyState}
     onVote={voteTaste} onReset={resetTaste} onClose={()=>setTasteOpen(false)}
     onOpenVenue={id=>{setTasteOpen(false);router.push({pathname:'/google-venue',params:{id}});}}/>
 </ScrollView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:31,paddingBottom:85},
 brand:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
 logo:{fontSize:34,fontWeight:'900',letterSpacing:-2,color:Colors.text},
 brandRight:{fontSize:12,color:Colors.muted,fontWeight:'600'},
 headline:{fontSize:38,fontWeight:'900',color:Colors.text,letterSpacing:-1.9,lineHeight:45},
 intro:{color:Colors.muted,fontSize:14,lineHeight:21,marginTop:7,marginBottom:25},
 step:{backgroundColor:Colors.card,borderRadius:27,padding:18,marginBottom:16,borderWidth:1,borderColor:Colors.border},
 numberRow:{flexDirection:'row',alignItems:'center',gap:11},
 number:{height:30,width:30,borderRadius:11,backgroundColor:Colors.limeSoft,alignItems:'center',justifyContent:'center'},
 numberText:{color:'#24341C',fontSize:14,fontWeight:'900'},
 stepTitle:{fontSize:19,color:Colors.text,fontWeight:'900',letterSpacing:-.5},
 categoryRow:{flexDirection:'row',gap:8,marginTop:17},
 category:{flex:1,alignItems:'center',justifyContent:'center',gap:8,paddingVertical:15,borderRadius:16,backgroundColor:'#F4F1FA',borderWidth:1,borderColor:Colors.border},
 categoryActive:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 categoryText:{fontSize:11,fontWeight:'800',color:Colors.text},
 categoryTextActive:{color:'#fff'},
 searchBox:{flexDirection:'row',alignItems:'center',gap:10,borderRadius:16,backgroundColor:'#F8F6FC',paddingHorizontal:14,marginTop:12,borderWidth:1,borderColor:Colors.border},
 input:{flex:1,fontSize:13,color:Colors.text,paddingVertical:15},
 currentRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:17},
 currentArea:{flex:1,flexDirection:'row',alignItems:'center',gap:8},
 currentText:{fontSize:16,fontWeight:'800',color:Colors.text,flexShrink:1},
 nearMe:{flexDirection:'row',gap:5,alignItems:'center',backgroundColor:'#F1EBFF',borderRadius:12,paddingHorizontal:11,paddingVertical:10},
 nearMeText:{fontSize:12,fontWeight:'800',color:Colors.violet},
 areas:{gap:8,paddingTop:17,paddingBottom:3},
 areaChip:{paddingHorizontal:14,paddingVertical:10,borderRadius:999,backgroundColor:'#F5F3FA',borderWidth:1,borderColor:Colors.border},
 areaChipActive:{backgroundColor:Colors.limeSoft,borderColor:Colors.limeSoft},
 areaChipText:{fontSize:12,fontWeight:'700',color:Colors.muted},
 areaChipTextActive:{color:'#223519'},
 moreAreas:{paddingHorizontal:13,paddingVertical:10,borderRadius:999,borderWidth:1,borderColor:Colors.border},
 moreText:{color:Colors.violet,fontSize:12,fontWeight:'800'},
 resultsHead:{flexDirection:'column',alignItems:'stretch',marginTop:12,marginBottom:7,gap:13},
 toggle:{flexDirection:'row',alignItems:'center',padding:3,backgroundColor:'#EFECF8',borderRadius:14,width:'100%'},
 toggleBtn:{flex:1,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',paddingVertical:12,paddingHorizontal:8,borderRadius:11},
 toggleActive:{backgroundColor:Colors.violet},
 toggleText:{color:Colors.text,fontSize:11,fontWeight:'800'},
 toggleTextActive:{color:'#fff'},
 swipeIntro:{fontSize:12,color:Colors.muted,lineHeight:19,marginTop:8},
 tasteEntry:{borderRadius:25,padding:17,overflow:'hidden',marginBottom:19,borderWidth:1,borderColor:'rgba(112,74,177,.13)'},
 tasteTop:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
 tasteSymbol:{backgroundColor:'rgba(255,255,255,.8)',height:36,width:36,alignItems:'center',justifyContent:'center',borderRadius:12},
 tasteKicker:{color:Colors.violet,fontSize:9,fontWeight:'900',letterSpacing:1.1,flex:1},
 tasteDots:{paddingHorizontal:9,paddingVertical:6,borderRadius:25,backgroundColor:'rgba(255,255,255,.8)'},
 tasteDotsText:{fontSize:13,color:Colors.rose,fontWeight:'900'},
 tasteTitle:{color:Colors.text,fontSize:25,fontWeight:'900',letterSpacing:-1},
 tasteDescription:{fontSize:12,color:Colors.text,lineHeight:19,marginTop:7,marginBottom:12,maxWidth:350},
 tasteMeta:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:14},
 tasteMetaText:{fontSize:11,color:Colors.muted,fontWeight:'800'},
 tasteActions:{flexDirection:'row',alignItems:'center',gap:8},
 tasteStart:{flex:1,backgroundColor:Colors.violet,borderRadius:13,alignItems:'center',paddingVertical:13,paddingHorizontal:11},
 tasteStartText:{color:'#fff',fontSize:12,fontWeight:'900'},
 tasteReview:{flex:1,flexDirection:'row',gap:5,alignItems:'center',justifyContent:'center',
   borderRadius:13,borderWidth:1,borderColor:'rgba(102,69,191,.24)',paddingVertical:13,paddingHorizontal:8,
   backgroundColor:'rgba(255,255,255,.68)'},
 tasteReviewText:{fontSize:11,color:Colors.violet,fontWeight:'900'},
});

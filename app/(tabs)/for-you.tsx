import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,ImageBackground,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {ForYouVenueCard} from '../../components/ForYouVenueCard';
import {getDemoEvents,trackDemoEvent,type DemoEvent} from '../../lib/demo-analytics';
import {getDemoPlaces} from '../../lib/demo-places';
import {getForYouMatches,filterForYouMatches,curateForYouSections,type ForYouCategory} from '../../lib/for-you';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import {predictNextVenue} from '../../lib/predictive-mood';
import {DEFAULT_AREA,getSelectedArea,type SearchArea} from '../../lib/places';
import {defaultPreferences,getTasteFeedback,getPreferences,getSavedVenueIds,getUser,toggleSavedVenue,getVisitFeedback,getDailyVenueSwipeState,type VisitFeedback} from '../../lib/storage';
import type {UserPreferences,UserProfile} from '../../types';

const categories:{id:ForYouCategory;label:string}[]=[
 {id:'all',label:'All vibes'},{id:'cafe',label:'Coffee'},
 {id:'restaurant',label:'Food'},{id:'bar',label:'Drinks'}
];
export default function ForYouScreen(){
 const router=useRouter();
 const [preferences,setPreferences]=useState<UserPreferences>(defaultPreferences);
 const [taste,setTaste]=useState<TasteFeedback>({});
 const [area,setArea]=useState<SearchArea>(DEFAULT_AREA);
 const [user,setUser]=useState<UserProfile|null>(null);
 const [savedIds,setSavedIds]=useState<string[]>([]);
 const [visits,setVisits]=useState<Record<string,VisitFeedback>>({});
 const [category,setCategory]=useState<ForYouCategory>('all');
 const [budgetOnly,setBudgetOnly]=useState(false);
 const [onlyMyAreas,setOnlyMyAreas]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [events,setEvents]=useState<DemoEvent[]>([]);
 const [venueVotes,setVenueVotes]=useState<Record<string,'like'|'dislike'|'skip'>>({});
 const [localNow,setLocalNow]=useState(()=>new Date());
 const saveLock=useRef(new Set<string>());
 useFocusEffect(useCallback(()=>{
  let active=true;setLoading(true);setError('');setLocalNow(new Date());
  Promise.all([getPreferences(),getTasteFeedback(),getSelectedArea(),getSavedVenueIds(),getUser(),getVisitFeedback(),getDemoEvents(),getDailyVenueSwipeState()])
   .then(([p,t,a,s,u,v,e,deck])=>{if(active){setPreferences(p);setTaste(t);setArea(a);setSavedIds(s);setUser(u);setVisits(v);setEvents(e);setVenueVotes(deck.votes);}})
   .catch(()=>{if(active)setError('Δεν φορτώθηκαν όλες οι επιλογές. Εμφανίζονται τα διαθέσιμα demo δεδομένα.');})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[]));
 const places=useMemo(()=>getDemoPlaces(area),[area]);
 const matches=useMemo(()=>getForYouMatches(places,preferences,area,taste,savedIds,visits),[places,preferences,area,taste,savedIds,visits]);
 const prediction=useMemo(()=>predictNextVenue(localNow,matches,preferences,taste,savedIds,visits,venueVotes,events),
  [localNow,matches,preferences,taste,savedIds,visits,venueVotes,events]);
 const filteredPicks=useMemo(()=>filterForYouMatches(matches,category,budgetOnly,onlyMyAreas),[matches,category,budgetOnly,onlyMyAreas]);
 const picks=filteredPicks;
 const dna=useMemo(()=>getDnaSummary(taste),[taste]);
 const sections=useMemo(()=>curateForYouSections(picks),[picks]);
 const {topPick:featured,perfect,hiddenGems,tryDifferent,more}=sections;
 const name=user?.name?.trim().split(' ')[0]||'you';
 const openVenue=(id:string)=>{trackDemoEvent('recommendation_opened',id);router.push({pathname:'/google-venue',params:{id}});};
 const save=async(id:string)=>{
  if(saveLock.current.has(id))return;saveLock.current.add(id);
  try{const next=await toggleSavedVenue('google-'+id);setSavedIds(next);trackDemoEvent('venue_save_toggled',id);}
  catch{setError('Δεν αποθηκεύτηκε η επιλογή σου. Δοκίμασε ξανά.');}
  finally{saveLock.current.delete(id);}
 };
 const render=(item:(typeof picks)[number],variant:'featured'|'portrait'|'row')=><ForYouVenueCard key={item.place.id} match={item} variant={variant} saved={savedIds.includes('google-'+item.place.id)} onPress={()=>openVenue(item.place.id)} onSave={()=>save(item.place.id)}/>;
 return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
  <View style={s.top}><Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text><Text style={s.topPill}>✳ JUST FOR YOU</Text></View>
  <Text style={s.kicker}>CURATED FOR {name.toUpperCase()}</Text>
  <Text style={s.title}>Your kind of<Text style={{color:Colors.violet}}> places.</Text></Text>
  <Text style={s.sub}>Καλύτερες επιλογές, όσο μαθαίνουμε το vibe σου.</Text>
  <LinearGradient colors={['#5141AE','#7E65D5','#B29DF1'] as const}
   start={{x:0,y:0}} end={{x:1,y:1}} style={s.moodBanner}>
   <View style={s.moodGlow}/>
   <View style={s.moodTop}>
    <View style={s.moodBadge}><Ionicons name="sparkles" size={14} color={Colors.violet}/>
     <Text style={s.moodBadgeLabel}>PREDICTIVE MOOD</Text></View>
    <View style={s.moodIcon}><Ionicons name="analytics-outline" size={22} color="#fff"/></View>
   </View>
   <Text style={s.moodTitle}>Your next spot, predicted.</Text>
   <Text style={s.moodDescription}>{prediction?.headline??'Ανακαλύπτουμε το επόμενο μέρος που μπορεί να σου ταιριάζει.'}</Text>
   {!loading&&prediction?<View style={s.predictedCard}>
    <Pressable onPress={()=>{trackDemoEvent('prediction_opened',prediction.place.id);openVenue(prediction.place.id);}}
     accessibilityRole="button" accessibilityLabel={'Προτεινόμενο μαγαζί: '+prediction.place.name} style={s.predictedMain}>
     <View style={s.predictedPhoto}>
      <ImageBackground source={prediction.place.demoPhoto?{uri:prediction.place.demoPhoto}:undefined}
       resizeMode="cover" style={StyleSheet.absoluteFill}>
       <LinearGradient colors={['rgba(42,30,86,.12)','rgba(42,30,86,.18)']} style={StyleSheet.absoluteFill}/>
      </ImageBackground>
      <View style={s.predictedPhotoBadge}><Ionicons name="sparkles" size={12} color={Colors.violet}/><Text style={s.predictedPhotoBadgeText}>YOUR PICK</Text></View>
     </View>
     <View style={s.predictedInfo}>
      <Text style={s.predictedCategory}>{prediction.place.category==='cafe'?'COFFEE & BRUNCH':prediction.place.category==='bar'?'DRINKS & NIGHTLIFE':'FOOD & DINING'}</Text>
      <Text style={s.predictedName} numberOfLines={2}>{prediction.place.name}</Text>
      <View style={s.predictedAreaRow}><Ionicons name="location-outline" color={Colors.muted} size={13}/><Text style={s.predictedArea} numberOfLines={1}>{prediction.areaLabel}</Text></View>
      <View style={s.predictedOpen}><Text style={s.predictedOpenText}>See this spot</Text><Ionicons name="arrow-forward" color={Colors.violet} size={15}/></View>
     </View>
    </Pressable>
    <View style={s.predictedReason}>
     <Ionicons name="bulb-outline" size={16} color={Colors.violet}/>
     <Text style={s.predictedReasonText}>{prediction.reason}</Text>
    </View>
    <View style={s.predictedFooter}>
     <Text style={s.predictedEvidence}>{prediction.signalLabel}</Text>
     <Pressable onPress={()=>save(prediction.place.id)} accessibilityRole="button"
      accessibilityLabel={savedIds.includes('google-'+prediction.place.id)?'Αφαίρεση από αποθηκευμένα':'Αποθήκευση προτεινόμενου μαγαζιού'}
      style={s.predictedSave}><Ionicons name={savedIds.includes('google-'+prediction.place.id)?'heart':'heart-outline'} size={18} color={Colors.rose}/></Pressable>
    </View>
   </View>:loading?<View style={s.loadingPredict}><ActivityIndicator size="small" color="#fff"/><Text style={s.loadingPredictText}>Finding your next spot…</Text></View>:
    <Text style={s.moodDescription}>Δεν βρέθηκε διαθέσιμο demo μαγαζί.</Text>}
   <Text style={s.moodDisclaimer}>Εκτίμηση από τοπικά demo δεδομένα και συνήθειες · Όχι εκπαιδευμένο ML ή βεβαιότητα επίσκεψης.</Text>
  </LinearGradient>
  <LinearGradient colors={Gradients.secondary} style={s.dna}>
   <View style={s.dnaSymbol}><Ionicons name="finger-print-outline" size={24} color={Colors.violet}/></View>
   <View style={s.dnaContent}><Text style={s.dnaTitle}>Your Vibe DNA</Text><Text style={s.dnaSub}>{dna.meaningfulCount?dna.meaningfulCount+' taste signals · evolving':'Έτοιμο να μάθει το γούστο σου'}</Text></View>
   <Pressable style={s.dnaArrow} onPress={()=>router.push('/(tabs)')} accessibilityRole="button" accessibilityLabel="Πήγαινε στο Taste Swipe"><Ionicons name="arrow-forward" size={18} color={Colors.violet}/></Pressable>
  </LinearGradient>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
   {categories.map(c=><Pressable key={c.id} onPress={()=>setCategory(c.id)} style={[s.chip,category===c.id&&s.chipSelected]} accessibilityRole="button" accessibilityState={{selected:category===c.id}}>{category===c.id?<LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill} pointerEvents="none"/>:null}<Text style={[s.chipText,category===c.id&&s.chipTextOn]}>{c.label}</Text></Pressable>)}
  </ScrollView>
  <View style={s.toggles}>
   <Pressable onPress={()=>setBudgetOnly(x=>!x)} accessibilityRole="button" accessibilityState={{selected:budgetOnly}} style={[s.filterButton,budgetOnly&&s.filterOn]}><Ionicons name={budgetOnly?'checkmark-circle':'wallet-outline'} size={15} color={Colors.violet}/><Text style={s.filterText}>My budget</Text></Pressable>
   <Pressable onPress={()=>setOnlyMyAreas(x=>!x)} accessibilityRole="button" accessibilityState={{selected:onlyMyAreas}} style={[s.filterButton,onlyMyAreas&&s.filterOn]}><Ionicons name={onlyMyAreas?'checkmark-circle':'location-outline'} size={15} color={Colors.violet}/><Text style={s.filterText}>My areas</Text></Pressable>
   <Pressable onPress={()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'for-you'}})} style={s.edit} accessibilityRole="button"><Ionicons name="options-outline" size={18} color={Colors.violet}/></Pressable>
  </View>
  {loading?<View style={s.loading}><ActivityIndicator color={Colors.violet}/><Text style={s.hint}>Finding your next spot…</Text></View>:null}
  {error?<Text style={s.error}>{error}</Text>:null}
  {!loading&&featured?<View>
   <View style={s.section}><Text style={s.sectionTitle}>Your top pick</Text><Text style={s.sectionMeta}>HIGHEST MATCH</Text></View>
   {render(featured,'featured')}
   <View style={s.why}><Ionicons name="sparkles-outline" size={17} color={Colors.violet}/><Text style={s.whyText}>{featured.tasteReasons[0]}</Text></View>
  </View>:null}
  {!loading&&perfect.length>0?<View style={s.block}>
   <View style={s.section}><View style={s.sectionHeading}><Text style={s.sectionTitle}>Perfect for you</Text><Text style={s.sectionHint}>Τα πιο κοντινά στο γούστο σου.</Text></View><Text style={s.sectionMeta}>{perfect.length} PICKS</Text></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalCards}>
    {perfect.map(item=>render(item,'portrait'))}
   </ScrollView>
  </View>:null}
  {!loading&&hiddenGems.length>0?<View style={s.block}>
   <View style={s.section}><View style={s.sectionHeading}><Text style={s.sectionTitle}>Hidden gems</Text><Text style={s.sectionHint}>Μέρη έξω από τις συνήθεις περιοχές σου.</Text></View><Ionicons name="compass-outline" size={19} color={Colors.violet}/></View>
   {hiddenGems.map(item=>render(item,'row'))}
  </View>:null}
  {!loading&&tryDifferent.length>0?<View style={s.block}>
   <View style={s.section}><View style={s.sectionHeading}><Text style={s.sectionTitle}>Try something different</Text><Text style={s.sectionHint}>Άλλη κατηγορία, νέο vibe.</Text></View><Ionicons name="shuffle-outline" size={19} color={Colors.violet}/></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalCards}>
    {tryDifferent.map(item=>render(item,'portrait'))}
   </ScrollView>
  </View>:null}
  {!loading&&more.length>0?<View style={s.block}>
   <View style={s.section}><Text style={s.sectionTitle}>More your vibe</Text><Text style={s.sectionMeta}>EXPLORE</Text></View>
   {more.map(item=>render(item,'row'))}
  </View>:null}
  {!loading&&!picks.length?<View style={s.empty}>
    <Ionicons name="options-outline" size={37} color={Colors.violet}/>
    <Text style={s.emptyTitle}>No matches with these filters</Text>
    <Text style={s.hint}>Άνοιξε λίγο τις επιλογές σου για να δεις περισσότερα μέρη.</Text>
    <Pressable style={s.clear} onPress={()=>{setCategory('all');setBudgetOnly(false);setOnlyMyAreas(false);}} accessibilityRole="button"><Text style={s.clearText}>Clear filters</Text></Pressable>
  </View>:null}
  <Text style={s.footer}>Demo recommendations · Φανταστικά καταστήματα. Το Hidden gems σημαίνει προτάσεις εκτός των προτιμώμενων περιοχών σου, όχι επιβεβαιωμένη δημοτικότητα.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:98},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:26},
 brand:{fontSize:31,fontWeight:'900',letterSpacing:-1.7,color:Colors.text},
 topPill:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1,backgroundColor:Colors.cardSoft,paddingHorizontal:13,paddingVertical:10,borderRadius:999},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:Colors.violet,marginBottom:8},
 title:{fontSize:Type.hero,fontWeight:'900',lineHeight:41,letterSpacing:-1.3,color:Colors.text},
 sub:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:7,marginBottom:17},
 moodBanner:{borderRadius:27,marginBottom:18,padding:19,overflow:'hidden',minHeight:290},
 moodGlow:{position:'absolute',width:220,height:220,borderRadius:110,right:-88,top:-92,backgroundColor:'rgba(245,233,255,.13)'},
 moodTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 moodBadge:{backgroundColor:'rgba(255,255,255,.94)',paddingVertical:8,paddingHorizontal:11,borderRadius:Radius.pill,flexDirection:'row',alignItems:'center',gap:6},
 moodBadgeLabel:{color:Colors.violet,fontWeight:'900',fontSize:9,letterSpacing:.9},
 moodIcon:{width:42,height:42,borderWidth:1,borderColor:'rgba(255,255,255,.29)',borderRadius:15,backgroundColor:'rgba(255,255,255,.15)',alignItems:'center',justifyContent:'center'},
 moodTitle:{fontSize:26,lineHeight:32,fontWeight:'900',letterSpacing:-.9,color:'#fff',marginTop:16,maxWidth:'95%'},
 moodDescription:{fontSize:12.5,color:'rgba(255,255,255,.94)',lineHeight:19,marginTop:9,maxWidth:'96%'},
 moodBottom:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:10,marginTop:17},
 moodCTA:{backgroundColor:'#fff',borderRadius:13,paddingVertical:12,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:8},
 moodCTAText:{color:Colors.violet,fontSize:12,fontWeight:'900'},
 moodSignal:{fontSize:10,fontWeight:'800',color:'rgba(255,255,255,.95)',flexShrink:1},
 moodDisclaimer:{fontSize:9,color:'rgba(255,255,255,.84)',lineHeight:14,marginTop:14},
 predictedCard:{marginTop:15,borderRadius:20,backgroundColor:'#fff',overflow:'hidden'},
 predictedMain:{flexDirection:'row',padding:10,gap:11,minHeight:140},
 predictedPhoto:{width:118,minHeight:126,borderRadius:14,overflow:'hidden',backgroundColor:Colors.lilac},
 predictedPhotoBadge:{position:'absolute',left:7,bottom:8,backgroundColor:'rgba(255,255,255,.95)',paddingHorizontal:8,paddingVertical:6,borderRadius:Radius.pill,flexDirection:'row',alignItems:'center',gap:3},
 predictedPhotoBadgeText:{fontSize:8,fontWeight:'900',color:Colors.violet},
 predictedInfo:{flex:1,paddingVertical:6,justifyContent:'center'},
 predictedCategory:{fontSize:9,color:Colors.violet,letterSpacing:.8,fontWeight:'900'},
 predictedName:{fontSize:19,lineHeight:23,color:Colors.text,fontWeight:'900',marginTop:6},
 predictedAreaRow:{flexDirection:'row',gap:4,alignItems:'center',marginTop:8},
 predictedArea:{fontSize:11,color:Colors.muted,flex:1},
 predictedOpen:{marginTop:12,flexDirection:'row',gap:6,alignItems:'center'},
 predictedOpenText:{fontSize:11,color:Colors.violet,fontWeight:'900'},
 predictedReason:{flexDirection:'row',gap:9,paddingHorizontal:15,paddingVertical:12,backgroundColor:Colors.cardSoft,alignItems:'flex-start'},
 predictedReasonText:{flex:1,color:Colors.text,fontSize:12,lineHeight:18,fontWeight:'700'},
 predictedFooter:{flexDirection:'row',gap:9,alignItems:'center',paddingHorizontal:15,paddingVertical:11},
 predictedEvidence:{flex:1,color:Colors.muted,fontSize:10,fontWeight:'800'},
 predictedSave:{height:30,width:30,borderRadius:10,backgroundColor:'#FDF1F9',alignItems:'center',justifyContent:'center'},
 loadingPredict:{flexDirection:'row',alignItems:'center',gap:10,padding:18},
 loadingPredictText:{fontSize:12,color:'#fff'},
 dna:{borderRadius:Radius.lg,padding:15,flexDirection:'row',alignItems:'center',gap:12,marginBottom:22},
 dnaSymbol:{width:46,height:46,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderRadius:15},
 dnaContent:{flex:1},dnaTitle:{fontSize:15,fontWeight:'900',color:Colors.text},
 dnaSub:{fontSize:12,color:Colors.muted,marginTop:5},
 dnaArrow:{backgroundColor:'#fff',width:37,height:37,borderRadius:12,alignItems:'center',justifyContent:'center'},
 filters:{gap:8,paddingBottom:15},
 chip:{overflow:'hidden',paddingVertical:12,paddingHorizontal:18,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.pill},
 chipSelected:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 chipText:{fontSize:13,color:Colors.text,fontWeight:'800'},chipTextOn:{color:'#fff'},
 toggles:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:17},
 filterButton:{flexDirection:'row',alignItems:'center',gap:7,borderRadius:Radius.pill,paddingHorizontal:15,paddingVertical:12,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border},
 filterOn:{backgroundColor:'#EEE9FF',borderColor:'#C8BBF6'},
 filterText:{fontSize:12,color:Colors.violet,fontWeight:'800'},
 edit:{marginLeft:'auto',padding:10,borderRadius:12,backgroundColor:Colors.cardSoft},
 section:{marginBottom:15,marginTop:9,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 sectionTitle:{fontSize:Type.section,fontWeight:'900',color:Colors.text,letterSpacing:-.6},
 sectionHeading:{flex:1,gap:5},
 sectionHint:{fontSize:12,lineHeight:17,color:Colors.muted},
 horizontalCards:{paddingBottom:7,paddingRight:Spacing.lg},
 sectionMeta:{fontSize:9,color:Colors.violet,letterSpacing:.8,fontWeight:'900'},
 why:{flexDirection:'row',alignItems:'center',gap:9,padding:14,borderRadius:15,backgroundColor:'#F4EFFF',marginTop:9},
 whyText:{fontSize:12,lineHeight:18,color:Colors.text,flex:1},
 block:{marginTop:25},hint:{fontSize:13,color:Colors.muted,lineHeight:21},
 loading:{paddingVertical:32,alignItems:'center',gap:10},
 error:{fontSize:12,color:Colors.danger,marginVertical:13},
 empty:{alignItems:'center',backgroundColor:'#F4EFFF',borderRadius:Radius.lg,padding:27,gap:11},
 emptyTitle:{fontSize:18,fontWeight:'900',color:Colors.text},
 clear:{backgroundColor:Colors.violet,paddingVertical:12,paddingHorizontal:22,borderRadius:Radius.pill,marginTop:6},
 clearText:{fontSize:13,fontWeight:'800',color:'#fff'},
 footer:{fontSize:11,color:Colors.muted,lineHeight:18,marginTop:28,textAlign:'center'}
});

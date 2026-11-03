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
 const momentTitle=localNow.getHours()>=19||localNow.getHours()<5?'Tonight\u2019s vibe.':
  localNow.getHours()<12?'A morning kind of vibe.':
  localNow.getHours()<18?'An afternoon kind of vibe.':'Your evening vibe.';
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
  <LinearGradient colors={['#F1EAFF','#FBF9FF','#EDE5FF'] as const}
   start={{x:0,y:0}} end={{x:1,y:1}} style={s.moodBanner}>
   <View style={s.moodHeader}>
    <View style={s.moodLabelRow}>
     <View style={s.moodStar}><Ionicons name="sparkles" size={14} color={Colors.violet}/></View>
     <Text style={s.moodEyebrow}>PREDICTIVE MOOD</Text>
    </View>
    <View style={s.moodAccent}><View style={s.moodAccentDot}/><Text style={s.moodAccentText}>FOR YOU</Text></View>
   </View>
   <Text style={s.moodTitle}>{momentTitle}</Text>
   {!loading&&prediction?<View style={s.venueFrame}>
    <Pressable onPress={()=>{trackDemoEvent('prediction_opened',prediction.place.id);openVenue(prediction.place.id);}}
     accessibilityRole="button" accessibilityLabel={'Δες το προτεινόμενο μαγαζί '+prediction.place.name}
     style={({pressed})=>[s.venuePress,pressed&&s.venuePressed]}>
     <ImageBackground source={prediction.place.demoPhoto?{uri:prediction.place.demoPhoto}:undefined}
      resizeMode="cover" style={s.venueCover} imageStyle={s.venueCoverImage}>
      <LinearGradient colors={['rgba(25,18,53,.10)','rgba(25,18,53,.13)','rgba(17,12,35,.88)']}
       locations={[0,.43,1]} style={StyleSheet.absoluteFill}/>
      <View style={s.coverTop}>
       <View style={s.coverPill}><Ionicons name="sparkles" size={12} color="#fff"/><Text style={s.coverPillText}>YOUR SPOT</Text></View>
      </View>
      <View style={s.coverBottom}>
       <View style={s.coverCopy}>
        <Text style={s.coverCategory}>{prediction.place.category==='cafe'?'COFFEE & BRUNCH':prediction.place.category==='bar'?'BAR & DRINKS':'FOOD & DINING'}</Text>
        <Text style={s.coverName} numberOfLines={2}>{prediction.place.name}</Text>
        <View style={s.coverAreaRow}><Ionicons name="location-outline" size={15} color="rgba(255,255,255,.86)"/>
         <Text style={s.coverArea} numberOfLines={1}>{prediction.areaLabel}</Text>
        </View>
       </View>
       <View style={s.coverArrow}><Ionicons name="arrow-up-forward" size={22} color={Colors.violet}/></View>
      </View>
     </ImageBackground>
    </Pressable>
    <Pressable onPress={()=>save(prediction.place.id)} accessibilityRole="button"
     accessibilityLabel={savedIds.includes('google-'+prediction.place.id)?'Αφαίρεση από αποθηκευμένα':'Αποθήκευση προτεινόμενου μαγαζιού'}
     style={s.coverSave}>
     <Ionicons name={savedIds.includes('google-'+prediction.place.id)?'heart':'heart-outline'} size={20}
      color={savedIds.includes('google-'+prediction.place.id)?Colors.rose:Colors.text}/>
    </Pressable>
   </View>:loading?<View style={s.moodLoading}><ActivityIndicator color={Colors.violet}/>
    <Text style={s.moodLoadingText}>Finding your spot…</Text>
   </View>:<View style={s.moodLoading}><Text style={s.moodLoadingText}>No spot available right now.</Text></View>}
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
 moodBanner:{borderRadius:Radius.xl,marginBottom:18,padding:15,overflow:'hidden',borderWidth:1,borderColor:'#E8DCFF'},
 moodHeader:{paddingHorizontal:5,paddingTop:3,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
 moodLabelRow:{flexDirection:'row',alignItems:'center',gap:8},
 moodStar:{height:29,width:29,borderRadius:10,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
 moodEyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1,color:Colors.violet},
 moodAccent:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:9,paddingVertical:7,
  backgroundColor:'rgba(255,255,255,.60)',borderRadius:Radius.pill},
 moodAccentDot:{width:6,height:6,borderRadius:3,backgroundColor:Colors.violet},
 moodAccentText:{fontSize:9,fontWeight:'900',letterSpacing:.7,color:Colors.violet},
 moodTitle:{fontSize:27,fontWeight:'900',letterSpacing:-1.0,lineHeight:33,color:Colors.text,
  marginTop:14,marginBottom:15,marginLeft:5},
 venueFrame:{position:'relative',borderRadius:22,overflow:'hidden',backgroundColor:Colors.lilac},
 venuePress:{width:'100%',overflow:'hidden'},
 venuePressed:{opacity:.93},
 venueCover:{height:280,justifyContent:'space-between',padding:18},
 venueCoverImage:{borderRadius:22},
 coverTop:{flexDirection:'row',justifyContent:'flex-start'},
 coverPill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(35,24,60,.47)',
  borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:8,
  borderWidth:1,borderColor:'rgba(255,255,255,.28)'},
 coverPillText:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:.7},
 coverBottom:{flexDirection:'row',alignItems:'flex-end',gap:11},
 coverCopy:{flex:1},
 coverCategory:{fontSize:10,color:'rgba(255,255,255,.87)',fontWeight:'900',letterSpacing:1,marginBottom:7},
 coverName:{fontSize:30,lineHeight:33,fontWeight:'900',color:'#fff',letterSpacing:-1.0},
 coverAreaRow:{flexDirection:'row',alignItems:'center',gap:5,marginTop:8},
 coverArea:{fontSize:12,color:'rgba(255,255,255,.93)',fontWeight:'700',flexShrink:1},
 coverArrow:{width:45,height:45,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',
  borderRadius:15,marginBottom:1},
 coverSave:{position:'absolute',right:15,top:15,width:39,height:39,borderRadius:13,
  backgroundColor:'rgba(255,255,255,.95)',alignItems:'center',justifyContent:'center'},
 moodLoading:{height:155,borderRadius:20,backgroundColor:'rgba(255,255,255,.65)',
  flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
 moodLoadingText:{fontSize:13,color:Colors.muted,fontWeight:'700'},
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

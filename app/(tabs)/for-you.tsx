import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing} from '../../constants/theme';
import {ForYouVenueCard} from '../../components/ForYouVenueCard';
import {getDemoPlaces} from '../../lib/demo-places';
import {getForYouMatches,filterForYouMatches,type ForYouCategory} from '../../lib/for-you';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import {DEFAULT_AREA,getSelectedArea,type SearchArea} from '../../lib/places';
import {defaultPreferences,getTasteFeedback,getPreferences,getSavedVenueIds,getUser,toggleSavedVenue,getVisitFeedback,type VisitFeedback} from '../../lib/storage';
import type {UserPreferences,UserProfile} from '../../types';

const choices=[
 {id:'all',label:'All vibes',icon:'sparkles-outline'},
 {id:'cafe',label:'Coffee',icon:'cafe-outline'},
 {id:'restaurant',label:'Food',icon:'restaurant-outline'},
 {id:'bar',label:'Drinks',icon:'wine-outline'}
] as const;
const caps=(name:string)=>name.trim().split(/\s+/)[0]||'you';

export default function ForYouScreen(){
 const router=useRouter();
 const [preferences,setPreferences]=useState<UserPreferences>(defaultPreferences);
 const [taste,setTaste]=useState<TasteFeedback>({});
 const [selectedArea,setSelectedArea]=useState<SearchArea>(DEFAULT_AREA);
 const [profile,setProfile]=useState<UserProfile|null>(null);
 const [savedIds,setSavedIds]=useState<string[]>([]);
 const [visits,setVisits]=useState<Record<string,VisitFeedback>>({});
 const [category,setCategory]=useState<ForYouCategory>('all');
 const [budgetOnly,setBudgetOnly]=useState(true);
 const [onlyMyAreas,setOnlyMyAreas]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const saveLock=useRef(new Set<string>());

 useFocusEffect(useCallback(()=>{
   let active=true;
   setLoading(true);setError('');
   Promise.all([
     getPreferences(),getTasteFeedback(),getSelectedArea(),getSavedVenueIds(),getUser(),getVisitFeedback()
   ]).then(([prefs,dna,area,saved,user,visitData])=>{
     if(!active)return;
     setPreferences(prefs);setTaste(dna);setSelectedArea(area);setSavedIds(saved);setProfile(user);setVisits(visitData);
   }).catch(()=>{
     if(active)setError('Δεν μπορέσαμε να φορτώσουμε όλες τις αποθηκευμένες επιλογές. Δείχνουμε προσωρινά τα demo δεδομένα.');
   }).finally(()=>{if(active)setLoading(false);});
   return ()=>{active=false;};
 },[]));

 const places=useMemo(()=>getDemoPlaces(selectedArea),[selectedArea]);
 const fullMatches=useMemo(()=>getForYouMatches(places,preferences,selectedArea,taste,savedIds,visits),
   [places,preferences,selectedArea,taste,savedIds,visits]);
 const picks=useMemo(()=>filterForYouMatches(fullMatches,category,budgetOnly,onlyMyAreas),
   [fullMatches,category,budgetOnly,onlyMyAreas]);
 const dnaSummary=useMemo(()=>getDnaSummary(taste),[taste]);
 const featured=picks[0];
 const carousel=picks.slice(1,6);
 const other=picks.slice(6,18);
 const preferredAreas=preferences.neighborhoods.slice(0,2);
 const firstMood=preferences.moods[0]??'your mood';
 const displayName=profile?.name?caps(profile.name):'you';
 const budgetName=preferences.budget>=60?'60€+':preferences.budget+'€';

 const openVenue=(id:string)=>router.push({pathname:'/google-venue',params:{id}});
 const save=async(id:string)=>{
   if(saveLock.current.has(id))return;
   saveLock.current.add(id);
   try{
     const updated=await toggleSavedVenue('google-'+id);
     setSavedIds(updated);
   }catch{setError('Δεν αποθηκεύτηκε η αλλαγή στα αγαπημένα. Δοκίμασε ξανά.');}
   finally{saveLock.current.delete(id);}
 };
 return <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
   <View style={styles.brandRow}>
     <Text style={styles.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
     <View style={styles.navPill}><Ionicons name="sparkles" size={14} color={Colors.violet}/>
       <Text style={styles.navText}>FOR YOU</Text>
     </View>
   </View>
   <LinearGradient colors={Gradients.hero} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
     <View style={styles.bigRing}/>
     <View style={styles.smallRing}/>
     <View style={styles.heroEyebrow}><Ionicons name="sparkles" size={16} color={Colors.limeSoft}/><Text style={styles.heroEyebrowText}>YOUR PERSONALIZED EDIT</Text></View>
     <Text style={styles.heroTitle}>The good spots.\n<Text style={styles.heroAccent}>Your kind of spots.</Text></Text>
     <Text style={styles.heroSub}>Hey {displayName} ✳ Φτιάξαμε το δικό σου mix από καφέ, φαγητό και ποτό. Όσο μαθαίνουμε το vibe σου, τόσο αλλάζουν οι προτάσεις.</Text>
     <View style={styles.heroStats}>
       <View style={styles.glassStat}><Text style={styles.statNumber}>{picks.length}</Text><Text style={styles.statLabel}>matches</Text></View>
       <View style={styles.glassStat}><Text style={styles.statNumber}>{dnaSummary.meaningfulCount}</Text><Text style={styles.statLabel}>taste signals</Text></View>
       <View style={styles.glassStat}><Text style={styles.statNumber}>{budgetName}</Text><Text style={styles.statLabel}>budget</Text></View>
     </View>
   </LinearGradient>

   <View style={styles.dnaCard}>
     <View style={styles.dnaLeft}><View style={styles.dnaIcon}><Ionicons name="finger-print-outline" size={22} color={Colors.violet}/></View>
       <View style={{flex:1}}>
         <Text style={styles.dnaHeading}>Your Vibe DNA</Text>
         <Text style={styles.dnaSub}>{dnaSummary.meaningfulCount?'Τα swipes σου επηρεάζουν ήδη τις προτάσεις.':'Οι προτάσεις βασίζονται ήδη στο signup σου.'}</Text>
       </View>
     </View>
     <View style={styles.profileChips}>
       {(dnaSummary.positives.length?dnaSummary.positives.slice(0,3).map(x=>x.label):
         [firstMood,...preferredAreas].slice(0,3)).map((label,i)=>
         <View key={label+'-'+i} style={styles.profileChip}><Text style={styles.profileChipText}>✳ {label}</Text></View>)}
     </View>
     <Pressable style={styles.learnMore} onPress={()=>router.push('/(tabs)')} accessibilityRole="button">
       <Text style={styles.learnMoreText}>Refine my Vibe DNA · Taste Swipe</Text>
       <Ionicons name="arrow-forward" size={17} color={Colors.violet}/>
     </Pressable>
   </View>

   <View style={styles.headingRow}>
     <View>
       <Text style={styles.kicker}>THE PERSONALIZED LINEUP</Text>
       <Text style={styles.sectionTitle}>Made for <Text style={{color:Colors.violet}}>you.</Text></Text>
     </View>
     <View style={styles.starDecoration}><Ionicons name="sparkles" size={22} color={Colors.violet}/></View>
   </View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
     {choices.map(choice=><Pressable key={choice.id} onPress={()=>setCategory(choice.id)}
       accessibilityRole="button" accessibilityState={{selected:category===choice.id}}
       style={[styles.filterChip,category===choice.id&&styles.filterChipActive]}>
       <Ionicons name={choice.icon} size={16} color={category===choice.id?'#fff':Colors.violet}/>
       <Text style={[styles.filterText,category===choice.id&&styles.filterTextActive]}>{choice.label}</Text>
     </Pressable>)}
   </ScrollView>
   <View style={styles.extraFilters}>
     <Pressable style={[styles.toggleChip,budgetOnly&&styles.toggleChipOn]} onPress={()=>setBudgetOnly(v=>!v)}
       accessibilityRole="button" accessibilityState={{selected:budgetOnly}}>
       <Ionicons name={budgetOnly?'checkmark-circle':'ellipse-outline'} color={Colors.violet} size={16}/>
       <Text style={styles.toggleText}>Within my budget</Text>
     </Pressable>
     <Pressable style={[styles.toggleChip,onlyMyAreas&&styles.toggleChipOn]} onPress={()=>setOnlyMyAreas(v=>!v)}
       accessibilityRole="button" accessibilityState={{selected:onlyMyAreas}}>
       <Ionicons name={onlyMyAreas?'checkmark-circle':'location-outline'} color={Colors.violet} size={16}/>
       <Text style={styles.toggleText}>My areas</Text>
     </Pressable>
   </View>
   <Text style={styles.contextNote}><Ionicons name="location-outline" color={Colors.muted} size={13}/> Demo spots · Περιοχή αναζήτησης: {selectedArea.label} · Ενδεικτικό Vibe Match</Text>
   {loading?<View style={styles.loading}><ActivityIndicator color={Colors.violet}/><Text style={styles.loadingText}>Finding your next favorite...</Text></View>:null}
   {error?<Text style={styles.error}>{error}</Text>:null}
   {!loading&&featured?<View>
     <View style={styles.inlineHeader}><Text style={styles.inlineTitle}>The one for you <Text style={{color:Colors.rose}}>♥</Text></Text><Text style={styles.inlineSmall}>TOP MATCH</Text></View>
     <ForYouVenueCard match={featured} variant="featured" saved={savedIds.includes('google-'+featured.place.id)}
       onPress={()=>openVenue(featured.place.id)} onSave={()=>save(featured.place.id)}/>
     <View style={styles.whyCard}>
       <View style={styles.whyHead}><Ionicons name="sparkles" size={17} color={Colors.violet}/><Text style={styles.whyTitle}>Why we're vibing with this</Text></View>
       {featured.tasteReasons.map((reason,i)=><View style={styles.whyLine} key={i}>
         <View style={styles.whyDot}/><Text style={styles.whyText}>{reason}</Text>
       </View>)}
     </View>
   </View>:null}
   {!loading&&carousel.length>0?<View style={styles.carouselSection}>
     <View style={styles.inlineHeader}><Text style={styles.inlineTitle}>Next on your radar <Text style={{color:Colors.violet}}>✳</Text></Text><Text style={styles.inlineSmall}>HANDPICKED</Text></View>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
       {carousel.map(match=><ForYouVenueCard key={match.place.id} match={match} variant="portrait"
         saved={savedIds.includes('google-'+match.place.id)}
         onPress={()=>openVenue(match.place.id)} onSave={()=>save(match.place.id)}/>)}
     </ScrollView>
   </View>:null}
   {!loading&&other.length>0?<View style={styles.moreSection}>
     <View style={styles.inlineHeader}><Text style={styles.inlineTitle}>More your vibe.</Text><Text style={styles.inlineSmall}>JUST FOR YOU</Text></View>
     {other.map(match=><ForYouVenueCard key={match.place.id} match={match} variant="row"
       saved={savedIds.includes('google-'+match.place.id)}
       onPress={()=>openVenue(match.place.id)} onSave={()=>save(match.place.id)}/>)}
   </View>:null}
   {!loading&&!picks.length?<View style={styles.emptyCard}>
     <Ionicons name="options-outline" size={36} color={Colors.violet}/>
     <Text style={styles.emptyTitle}>No spots in this mix — yet.</Text>
     <Text style={styles.emptyText}>Δοκίμασε να βγάλεις κάποιο φίλτρο ή να αλλάξεις τις προτιμήσεις σου. Δεν χρειάζεται να κάνεις swipe για να δεις προτάσεις.</Text>
     <Pressable style={styles.resetFilters} onPress={()=>{setCategory('all');setBudgetOnly(false);setOnlyMyAreas(false);}}>
       <Text style={styles.resetFiltersText}>Show all matches ↗</Text>
     </Pressable>
   </View>:null}
   <LinearGradient colors={['#F1EBFF','#FFEFF5']} style={styles.outro}>
     <View style={styles.outroIcon}><Ionicons name="color-wand-outline" size={22} color={Colors.violet}/></View>
     <Text style={styles.outroTitle}>Your taste isn't static.</Text>
     <Text style={styles.outroBody}>Οι προτάσεις ανανεώνονται από τα likes, τα αγαπημένα και τις περιοχές που έχεις επιλέξει. Θέλεις να αλλάξεις κάτι;</Text>
     <Pressable style={styles.outroButton} onPress={()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'for-you'}})} accessibilityRole="button">
       <Text style={styles.outroButtonText}>Edit my preferences</Text>
       <Ionicons name="arrow-forward" size={16} color="#fff"/>
     </Pressable>
   </LinearGradient>
   <Text style={styles.disclaimer}>✳ Frontend demo · Τα μαγαζιά, οι φωτογραφίες και οι τιμές είναι ενδεικτικά/φανταστικά. Τα Vibe Match % είναι εκτιμήσεις από τοπικούς κανόνες, όχι μετρήσεις πραγματικής συμβατότητας.</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:30,paddingBottom:100},
 brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:20},
 brand:{fontSize:32,letterSpacing:-2,color:Colors.text,fontWeight:'900'},
 navPill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#EBE4FF',paddingHorizontal:13,paddingVertical:9,borderRadius:100},
 navText:{fontWeight:'900',letterSpacing:1,fontSize:10,color:Colors.violet},
 hero:{borderRadius:27,padding:22,overflow:'hidden',minHeight:269,marginBottom:15},
 bigRing:{position:'absolute',right:-92,top:-97,width:280,height:280,borderRadius:140,borderWidth:50,borderColor:'rgba(255,255,255,.10)'},
 smallRing:{position:'absolute',right:-15,bottom:-84,width:188,height:188,borderRadius:94,borderWidth:37,borderColor:'rgba(255,255,255,.08)'},
 heroEyebrow:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:12},
 heroEyebrowText:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1.1},
 heroTitle:{fontSize:28,lineHeight:35,letterSpacing:-1.1,color:'#fff',fontWeight:'900'},
 heroAccent:{color:Colors.limeSoft},
 heroSub:{fontSize:12,color:'rgba(255,255,255,.94)',lineHeight:19,marginTop:12,maxWidth:330,marginBottom:19},
 heroStats:{flexDirection:'row',gap:9},
 glassStat:{flex:1,backgroundColor:'rgba(255,255,255,.15)',borderWidth:1,borderColor:'rgba(255,255,255,.20)',borderRadius:14,paddingVertical:11,paddingHorizontal:8,alignItems:'center'},
 statNumber:{fontSize:18,fontWeight:'900',color:'#fff'},
 statLabel:{fontSize:10,color:'rgba(255,255,255,.84)',marginTop:4,fontWeight:'700'},
 dnaCard:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:23,padding:15,marginBottom:30},
 dnaLeft:{flexDirection:'row',alignItems:'center',gap:12},
 dnaIcon:{height:47,width:47,borderRadius:15,backgroundColor:'#F0E9FF',justifyContent:'center',alignItems:'center'},
 dnaHeading:{fontWeight:'900',fontSize:16,color:Colors.text},
 dnaSub:{color:Colors.muted,fontSize:11,lineHeight:17,marginTop:4},
 profileChips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:14},
 profileChip:{backgroundColor:'#EDF9E5',borderRadius:30,paddingHorizontal:10,paddingVertical:8},
 profileChipText:{fontWeight:'800',fontSize:10,color:'#355F24'},
 learnMore:{borderTopWidth:1,borderTopColor:Colors.border,marginTop:15,paddingTop:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 learnMoreText:{fontWeight:'900',color:Colors.violet,fontSize:11,flex:1},
 headingRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:15},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:Colors.violet,marginBottom:5},
 sectionTitle:{fontSize:27,fontWeight:'900',color:Colors.text,letterSpacing:-1},
 starDecoration:{backgroundColor:'#ECE4FF',width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'},
 filterRow:{gap:9,paddingBottom:13},
 filterChip:{flexDirection:'row',alignItems:'center',gap:7,borderRadius:14,paddingVertical:12,paddingHorizontal:14,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border},
 filterChipActive:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 filterText:{fontSize:12,fontWeight:'900',color:Colors.text},
 filterTextActive:{color:'#fff'},
 extraFilters:{flexDirection:'row',gap:8,marginBottom:11,flexWrap:'wrap'},
 toggleChip:{flexDirection:'row',alignItems:'center',gap:7,borderWidth:1,borderColor:Colors.border,borderRadius:12,paddingHorizontal:12,paddingVertical:10,backgroundColor:'#fff'},
 toggleChipOn:{backgroundColor:'#F0EAFB',borderColor:'#DFD3F9'},
 toggleText:{fontSize:11,fontWeight:'800',color:Colors.violet},
 contextNote:{fontSize:11,color:Colors.muted,lineHeight:18,marginBottom:18},
 loading:{paddingVertical:50,alignItems:'center',gap:11},
 loadingText:{color:Colors.muted,fontSize:12},
 error:{fontSize:12,color:Colors.danger,marginVertical:12,lineHeight:18},
 inlineHeader:{marginTop:14,marginBottom:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},
 inlineTitle:{fontSize:20,fontWeight:'900',color:Colors.text,letterSpacing:-.6,flex:1},
 inlineSmall:{fontSize:9,color:Colors.violet,fontWeight:'900',letterSpacing:.7},
 whyCard:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:18,padding:15,marginTop:10},
 whyHead:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:11},
 whyTitle:{fontSize:13,fontWeight:'900',color:Colors.text},
 whyLine:{flexDirection:'row',alignItems:'center',gap:9,marginTop:6},
 whyDot:{width:6,height:6,borderRadius:3,backgroundColor:Colors.lime},
 whyText:{color:Colors.muted,fontSize:11,flex:1,lineHeight:17},
 carouselSection:{marginTop:16},
 carouselContent:{paddingRight:5,paddingBottom:7},
 moreSection:{marginTop:20},
 emptyCard:{backgroundColor:'#F1EBFF',borderRadius:22,alignItems:'center',padding:24,gap:12},
 emptyTitle:{fontSize:19,color:Colors.text,fontWeight:'900',textAlign:'center'},
 emptyText:{fontSize:12,lineHeight:19,color:Colors.muted,textAlign:'center'},
 resetFilters:{backgroundColor:Colors.violet,borderRadius:13,paddingHorizontal:15,paddingVertical:12},
 resetFiltersText:{color:'#fff',fontSize:12,fontWeight:'900'},
 outro:{borderRadius:23,padding:19,marginTop:30,overflow:'hidden'},
 outroIcon:{backgroundColor:'rgba(255,255,255,.8)',height:43,width:43,borderRadius:13,alignItems:'center',justifyContent:'center',marginBottom:11},
 outroTitle:{fontSize:21,fontWeight:'900',color:Colors.text,letterSpacing:-.5},
 outroBody:{fontSize:12,lineHeight:19,color:Colors.muted,marginTop:8,marginBottom:15},
 outroButton:{alignSelf:'flex-start',backgroundColor:Colors.violet,borderRadius:14,paddingHorizontal:14,paddingVertical:12,flexDirection:'row',gap:10,alignItems:'center'},
 outroButtonText:{fontSize:12,fontWeight:'900',color:'#fff'},
 disclaimer:{color:Colors.muted,fontSize:10,lineHeight:17,marginTop:18,textAlign:'center'}
});

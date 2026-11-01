import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {ForYouVenueCard} from '../../components/ForYouVenueCard';
import {trackDemoEvent} from '../../lib/demo-analytics';
import {getDemoPlaces} from '../../lib/demo-places';
import {getForYouMatches,filterForYouMatches,type ForYouCategory} from '../../lib/for-you';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import {DEFAULT_AREA,getSelectedArea,type SearchArea} from '../../lib/places';
import {defaultPreferences,getTasteFeedback,getPreferences,getSavedVenueIds,getUser,toggleSavedVenue,getVisitFeedback,type VisitFeedback} from '../../lib/storage';
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
 const saveLock=useRef(new Set<string>());
 useFocusEffect(useCallback(()=>{
  let active=true;setLoading(true);setError('');
  Promise.all([getPreferences(),getTasteFeedback(),getSelectedArea(),getSavedVenueIds(),getUser(),getVisitFeedback()])
   .then(([p,t,a,s,u,v])=>{if(active){setPreferences(p);setTaste(t);setArea(a);setSavedIds(s);setUser(u);setVisits(v);}})
   .catch(()=>{if(active)setError('Δεν φορτώθηκαν όλες οι επιλογές. Εμφανίζονται τα διαθέσιμα demo δεδομένα.');})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[]));
 const places=useMemo(()=>getDemoPlaces(area),[area]);
 const matches=useMemo(()=>getForYouMatches(places,preferences,area,taste,savedIds,visits),[places,preferences,area,taste,savedIds,visits]);
 const picks=useMemo(()=>filterForYouMatches(matches,category,budgetOnly,onlyMyAreas),[matches,category,budgetOnly,onlyMyAreas]);
 const dna=useMemo(()=>getDnaSummary(taste),[taste]);
 const featured=picks[0],next=picks.slice(1,5),others=picks.slice(5,15);
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
  <LinearGradient colors={Gradients.secondary} style={s.dna}>
   <View style={s.dnaSymbol}><Ionicons name="finger-print-outline" size={24} color={Colors.violet}/></View>
   <View style={s.dnaContent}><Text style={s.dnaTitle}>Your Vibe DNA</Text><Text style={s.dnaSub}>{dna.meaningfulCount?dna.meaningfulCount+' taste signals · evolving':'Έτοιμο να μάθει το γούστο σου'}</Text></View>
   <Pressable style={s.dnaArrow} onPress={()=>router.push('/(tabs)')} accessibilityRole="button" accessibilityLabel="Πήγαινε στο Taste Swipe"><Ionicons name="arrow-forward" size={18} color={Colors.violet}/></Pressable>
  </LinearGradient>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
   {categories.map(c=><Pressable key={c.id} onPress={()=>setCategory(c.id)} style={[s.chip,category===c.id&&s.chipSelected]} accessibilityRole="button" accessibilityState={{selected:category===c.id}}><Text style={[s.chipText,category===c.id&&s.chipTextOn]}>{c.label}</Text></Pressable>)}
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
  {!loading&&next.length>0?<View style={s.block}>
   <View style={s.section}><Text style={s.sectionTitle}>Next on your radar</Text><Text style={s.sectionMeta}>{next.length} SPOTS</Text></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight:Spacing.lg,paddingBottom:7}}>
    {next.map(item=>render(item,'portrait'))}
   </ScrollView>
  </View>:null}
  {!loading&&others.length>0?<View style={s.block}>
   <View style={s.section}><Text style={s.sectionTitle}>More your vibe</Text><Text style={s.sectionMeta}>EXPLORE</Text></View>
   {others.map(item=>render(item,'row'))}
  </View>:null}
  {!loading&&!picks.length?<View style={s.empty}>
    <Ionicons name="options-outline" size={37} color={Colors.violet}/>
    <Text style={s.emptyTitle}>No matches with these filters</Text>
    <Text style={s.hint}>Άνοιξε λίγο τις επιλογές σου για να δεις περισσότερα μέρη.</Text>
    <Pressable style={s.clear} onPress={()=>{setCategory('all');setBudgetOnly(false);setOnlyMyAreas(false);}} accessibilityRole="button"><Text style={s.clearText}>Clear filters</Text></Pressable>
  </View>:null}
  <Text style={s.footer}>Demo recommendations · Φανταστικά καταστήματα και εκτιμώμενα ποσοστά συμβατότητας.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:98},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:26},
 brand:{fontSize:31,fontWeight:'900',letterSpacing:-1.7,color:Colors.text},
 topPill:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1,backgroundColor:Colors.cardSoft,paddingHorizontal:13,paddingVertical:10,borderRadius:999},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.4,color:Colors.violet,marginBottom:8},
 title:{fontSize:Type.hero,fontWeight:'900',lineHeight:41,letterSpacing:-1.3,color:Colors.text},
 sub:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:7,marginBottom:22},
 dna:{borderRadius:Radius.lg,padding:15,flexDirection:'row',alignItems:'center',gap:12,marginBottom:22},
 dnaSymbol:{width:46,height:46,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderRadius:15},
 dnaContent:{flex:1},dnaTitle:{fontSize:15,fontWeight:'900',color:Colors.text},
 dnaSub:{fontSize:12,color:Colors.muted,marginTop:5},
 dnaArrow:{backgroundColor:'#fff',width:37,height:37,borderRadius:12,alignItems:'center',justifyContent:'center'},
 filters:{gap:8,paddingBottom:15},
 chip:{paddingVertical:11,paddingHorizontal:17,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:999},
 chipSelected:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 chipText:{fontSize:13,color:Colors.text,fontWeight:'800'},chipTextOn:{color:'#fff'},
 toggles:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:17},
 filterButton:{flexDirection:'row',alignItems:'center',gap:6,borderRadius:12,paddingHorizontal:11,paddingVertical:11,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border},
 filterOn:{backgroundColor:'#EFE9FF',borderColor:'#BFAAF6'},
 filterText:{fontSize:12,color:Colors.violet,fontWeight:'800'},
 edit:{marginLeft:'auto',padding:10,borderRadius:12,backgroundColor:Colors.cardSoft},
 section:{marginBottom:15,marginTop:9,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 sectionTitle:{fontSize:Type.section,fontWeight:'900',color:Colors.text,letterSpacing:-.6},
 sectionMeta:{fontSize:9,color:Colors.violet,letterSpacing:.8,fontWeight:'900'},
 why:{flexDirection:'row',alignItems:'center',gap:9,padding:14,borderRadius:15,backgroundColor:'#F1EDFC',marginTop:9},
 whyText:{fontSize:12,lineHeight:18,color:Colors.text,flex:1},
 block:{marginTop:25},hint:{fontSize:13,color:Colors.muted,lineHeight:21},
 loading:{paddingVertical:32,alignItems:'center',gap:10},
 error:{fontSize:12,color:Colors.danger,marginVertical:13},
 empty:{alignItems:'center',backgroundColor:'#F1EDFC',borderRadius:Radius.lg,padding:27,gap:11},
 emptyTitle:{fontSize:18,fontWeight:'900',color:Colors.text},
 clear:{backgroundColor:Colors.violet,paddingVertical:12,paddingHorizontal:22,borderRadius:12,marginTop:6},
 clearText:{fontSize:13,fontWeight:'800',color:'#fff'},
 footer:{fontSize:11,color:Colors.muted,lineHeight:18,marginTop:28,textAlign:'center'}
});

import { useFocusEffect,useRouter } from 'expo-router';
import { useCallback,useMemo,useRef,useState } from 'react';
import { ActivityIndicator,Pressable,StyleSheet,Text,View } from 'react-native';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import { rankGooglePlaces } from '../lib/place-intelligence';
import type { SearchArea } from '../lib/places';
import type { UserPreferences } from '../types';
import { getPreferences,getSavedVenueIds,toggleSavedVenue,getSwipeFeedback,saveSwipeFeedback,clearSwipeFeedback,ensureSavedVenue } from '../lib/storage';
import type { SwipeFeedback, SwipeDecision } from '../lib/swipe-intelligence';
import { personalizeMatches } from '../lib/swipe-intelligence';
import { SwipeDiscovery } from './SwipeDiscovery';
import { GoogleVenueCard } from './GoogleVenueCard';
import { GooglePinsMap } from './GooglePinsMap';
import { Colors } from '../constants/theme';
type Filter='all'|'cafe'|'restaurant'|'bar';
export function GooglePlacesResults({area,compact=false,prompt='',query='',filter='all',mapMode=false,swipeMode=false,hideHeading=false}:{
 area:SearchArea;compact?:boolean;prompt?:string;query?:string;filter?:Filter;mapMode?:boolean;swipeMode?:boolean;hideHeading?:boolean;
}){
 const router=useRouter();
 const {places,loading,error}=useGooglePlaces(area);
 const [preferences,setPreferences]=useState<UserPreferences|null>(null);
 const [savedIds,setSavedIds]=useState<string[]>([]);
 const [expanded,setExpanded]=useState(false);
 const [feedback,setFeedback]=useState<SwipeFeedback>({});
 const feedbackRef=useRef<SwipeFeedback>({});
 useFocusEffect(useCallback(()=>{
   getPreferences().then(setPreferences).catch(()=>undefined);
   getSavedVenueIds().then(setSavedIds).catch(()=>undefined);
   getSwipeFeedback().then(f=>{feedbackRef.current=f;setFeedback(f);}).catch(()=>undefined);
 },[]));
 const ranked=useMemo(()=>rankGooglePlaces(places,preferences,prompt,area).filter(x=>
   (filter==='all'||x.place.category===filter)&&
   (!query||[x.place.name,x.place.address??'',...x.vibe.tags].join(' ').toLocaleLowerCase('el-GR').includes(query.toLocaleLowerCase('el-GR')))
 ),[places,preferences,prompt,area,filter,query]);
 const personalized=useMemo(()=>personalizeMatches(ranked,feedback),[ranked,feedback]);
 const recommended=useMemo(()=>personalized.filter(x=>feedback[x.place.id]!=='pass'),[personalized,feedback]);
 const shown=mapMode?recommended.slice(0,3):compact&&!expanded?recommended.slice(0,5):recommended;
 const open=(id:string)=>router.push({pathname:'/google-venue',params:{id}});
 const save=async(id:string)=>setSavedIds(await toggleSavedVenue('google-'+id));
 const vote=(id:string,decision:SwipeDecision)=>{
   const next={...feedbackRef.current,[id]:decision};
   feedbackRef.current=next;
   setFeedback(next);
   saveSwipeFeedback(next).catch(()=>undefined);
   if(decision==='like')ensureSavedVenue('google-'+id).then(setSavedIds).catch(()=>undefined);
 };
 const resetVotes=()=>{
   feedbackRef.current={};setFeedback({});
   clearSwipeFeedback().catch(()=>undefined);
 };
 return <View style={styles.container}>
  {!hideHeading?<View style={styles.heading}>
   <View><Text style={styles.eyebrow}>✳ PERSONALIZED DISCOVERY</Text>
    <Text style={styles.title}>Your vibe, your spots.</Text>
   </View>
   <Text style={styles.total}>{loading?'…':ranked.length}</Text>
  </View>:null}
  {loading?<View style={styles.loading}><ActivityIndicator color={Colors.lime}/><Text style={styles.muted}>Φορτώνουμε τα demo spots…</Text></View>:null}
  {error?<Text style={styles.error}>Δεν φορτώνουν τα demo δεδομένα: {error}. Επίλεξε άλλη περιοχή ή άνοιξε το Google Maps.</Text>:null}
  {!loading&&!error&&mapMode?<GooglePinsMap area={area} places={recommended.map(x=>x.place)} onSelect={open}/>:null}
  {!loading&&!error&&swipeMode?<SwipeDiscovery matches={personalized} feedback={feedback}
    onVote={vote} onReset={resetVotes} onOpen={open}/>:null}
  {!loading&&!error&&!swipeMode&&shown.length===0?<Text style={styles.muted}>Δεν βρέθηκαν αποτελέσματα για αυτό το vibe ή το φίλτρο.</Text>:null}
  {!swipeMode&&shown.map(match=><GoogleVenueCard key={match.place.id} match={match} saved={savedIds.includes('google-'+match.place.id)}
   onPress={()=>open(match.place.id)} onSave={()=>save(match.place.id)}/>)}
  {compact&&!mapMode&&!swipeMode&&!expanded&&recommended.length>5?<Pressable onPress={()=>setExpanded(true)} style={styles.showMore} accessibilityRole="button"><Text style={styles.showMoreText}>Περισσότερα μαγαζιά  ({recommended.length})  ↓</Text></Pressable>:null}
  {!swipeMode?<Text style={styles.legal}>Demo venues (φανταστικά) · Ενδεικτικό Vibe match, όχι πραγματική αξιολόγηση.</Text>:null}

 </View>;
}
const styles=StyleSheet.create({
 container:{marginTop:14},heading:{marginBottom:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 eyebrow:{color:Colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1.2,marginBottom:6},
 title:{color:Colors.text,fontSize:20,fontWeight:'900',letterSpacing:-.5},
 total:{fontSize:20,fontWeight:'900',color:Colors.lime},
 loading:{padding:24,flexDirection:'row',alignItems:'center',gap:12},
 muted:{color:Colors.muted,fontSize:13,lineHeight:20,paddingVertical:12},
 error:{color:Colors.danger,lineHeight:22,marginVertical:12,fontSize:13},
 legal:{fontSize:10,lineHeight:17,color:Colors.muted,marginTop:6},
 link:{color:Colors.lime,fontSize:13,fontWeight:'900',marginVertical:15},
 showMore:{padding:15,backgroundColor:'#EEE8FA',borderRadius:16,alignItems:'center',marginBottom:13},
 showMoreText:{color:Colors.violet,fontWeight:'900',fontSize:13},
});

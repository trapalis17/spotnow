import {useEffect,useMemo,useRef,useState} from 'react';
import type {ComponentProps} from 'react';
import {Animated,ImageBackground,Modal,PanResponder,Pressable,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients} from '../constants/theme';
import type {TasteDecision,TasteTag} from '../lib/vibe-dna';
import {getDemoPlaceById} from '../lib/demo-places';
import {DAILY_SWIPE_LIMIT,getDailyVenueDnaSummary,remainingDailyMs,type DailyVenueSwipeState} from '../lib/daily-venue-swipe';

type Props={
 visible:boolean;initialView?:'cards'|'dna';state:DailyVenueSwipeState|null;
 onVote:(id:string,decision:TasteDecision)=>void;
 onReset:()=>void;onClose:()=>void;onOpenVenue:(id:string)=>void;
};
type IconName=ComponentProps<typeof Ionicons>['name'];
type VenueCard={id:string;title:string;subtitle:string;image:string;tags:TasteTag[];colors:readonly [string,string];icon:IconName};

export function VibeTasteSwipe({visible,initialView='cards',state,onVote,onReset,onClose,onOpenVenue}:Props){
 const {width:windowWidth,height:windowHeight}=useWindowDimensions();
 const cardWidth=Math.min(windowWidth-68,425);
 const cardHeight=Math.max(290,Math.min(430,windowHeight*.47));
 const [view,setView]=useState<'cards'|'dna'>('cards');
 const [confirmReset,setConfirmReset]=useState(false);
 const [clock,setClock]=useState(Date.now());
 useEffect(()=>{
   if(!visible)return;
   setClock(Date.now());
   const timer=setInterval(()=>setClock(Date.now()),30000);
   return ()=>clearInterval(timer);
 },[visible]);
 const pending=useMemo(()=>{
   if(!state)return [];
   return state.batchIds
    .filter(id=>!(id in state.batchVotes))
    .map(getDemoPlaceById).filter((p):p is NonNullable<typeof p>=>p!==null)
    .map(place=>({
      id:place.id,title:place.name,subtitle:place.address??'Εικονικό κατάστημα',
      image:place.demoPhoto??'',
      tags:place.tasteTags??[],
      colors:(place.category==='cafe'?['#7258B9','#D5A2BA']:
        place.category==='bar'?['#48338D','#AE579D']:['#508D9E','#C38BA9']) as readonly [string,string],
      icon:(place.category==='cafe'?'cafe-outline':
        place.category==='bar'?'wine-outline':'restaurant-outline') as IconName,
    } as VenueCard));
 },[state]);
 const summary=useMemo(()=>getDailyVenueDnaSummary(state?.votes??{}),[state?.votes]);
 const active=pending[0];
 const next=pending[1];
 const remaining=state?remainingDailyMs(state,clock):0;
 const countdown=remaining>0?Math.ceil(remaining/3600000)+' ώρες':'λίγο';
 const pan=useRef(new Animated.ValueXY()).current;
 const locked=useRef(false);
 const activeRef=useRef<VenueCard|undefined>(active);
 const voteRef=useRef(onVote);
 const flyRef=useRef<(d:TasteDecision)=>void>(()=>undefined);
 activeRef.current=active;
 voteRef.current=onVote;

 useEffect(()=>{
   if(visible){setView(initialView);setConfirmReset(false);}
   else{pan.stopAnimation();pan.setValue({x:0,y:0});locked.current=false;}
 },[visible,initialView,pan]);

 flyRef.current=(decision:TasteDecision)=>{
   const card=activeRef.current;
   if(!card||locked.current)return;
   locked.current=true;
   if(decision==='skip'){
     Animated.timing(pan,{toValue:{x:0,y:30},duration:180,useNativeDriver:true}).start(({finished})=>{
       pan.setValue({x:0,y:0});locked.current=false;
       if(finished)voteRef.current(card.id,'skip');
     });
     return;
   }
   Animated.timing(pan,{toValue:{x:decision==='like'?cardWidth*1.35:-cardWidth*1.35,y:12},
     duration:210,useNativeDriver:true}).start(({finished})=>{
       pan.setValue({x:0,y:0});locked.current=false;
       if(finished)voteRef.current(card.id,decision);
     });
 };
 const responder=useMemo(()=>PanResponder.create({
   onStartShouldSetPanResponder:()=>false,
   onMoveShouldSetPanResponder:(_event,g)=>Math.abs(g.dx)>10&&Math.abs(g.dx)>Math.abs(g.dy)*1.2,
   onPanResponderMove:(_event,g)=>{
     if(!locked.current)pan.setValue({x:g.dx,y:g.dy*.12});
   },
   onPanResponderRelease:(_event,g)=>{
     if(locked.current)return;
     if(Math.abs(g.dx)>cardWidth*.22||(Math.abs(g.vx)>.7&&Math.abs(g.dx)>35)){
       flyRef.current(g.dx>0?'like':'dislike');
     }else Animated.spring(pan,{toValue:{x:0,y:0},useNativeDriver:true,bounciness:6}).start();
   },
   onPanResponderTerminate:()=>Animated.spring(pan,{toValue:{x:0,y:0},useNativeDriver:true}).start(),
 }),[pan,cardWidth]);
 const rotation=pan.x.interpolate({inputRange:[-cardWidth,0,cardWidth],outputRange:['-14deg','0deg','14deg'],extrapolate:'clamp'});
 const yesOpacity=pan.x.interpolate({inputRange:[0,cardWidth*.22],outputRange:[0,1],extrapolate:'clamp'});
 const noOpacity=pan.x.interpolate({inputRange:[-cardWidth*.22,0],outputRange:[1,0],extrapolate:'clamp'});
 const reviewed=Object.keys(state?.batchVotes??{}).length;
 const done=reviewed>=DAILY_SWIPE_LIMIT;
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
   <View style={styles.backdrop}>
     <ScrollView contentContainerStyle={[styles.scroll,{minHeight:Math.min(windowHeight,640)}]}
       keyboardShouldPersistTaps="handled">
       <View style={styles.sheet}>
         <View style={styles.heading}>
           <View style={styles.titleGroup}>
             <Text style={styles.eyebrow}>✳ 8 SPOTS / 24 HOURS</Text>
             <Text style={styles.title}>Vibe Swipe<Text style={{color:Colors.violet}}> ✳</Text></Text>
           </View>
           <Pressable style={styles.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Κλείσιμο Vibe Swipe">
             <Ionicons name="close" color={Colors.text} size={24}/>
           </Pressable>
         </View>
         <View style={styles.tabs}>
           <Pressable onPress={()=>setView('cards')} style={[styles.tab,view==='cards'&&styles.activeTab]}>
             <Text style={[styles.tabText,view==='cards'&&styles.activeTabText]}>8 spots today</Text>
           </Pressable>
           <Pressable onPress={()=>setView('dna')} style={[styles.tab,view==='dna'&&styles.activeTab]}>
             <Text style={[styles.tabText,view==='dna'&&styles.activeTabText]}>My Vibe DNA</Text>
           </Pressable>
         </View>
         {view==='cards'?<View>
           <View style={styles.progress}>
             <Text style={styles.progressText}>{reviewed}/{DAILY_SWIPE_LIMIT} demo spots explored</Text>
             <Text style={styles.progressText}>{pending.length} left for today</Text>
           </View>
           <View style={styles.progressTrack}>
             <View style={[styles.progressFill,{width:`${reviewed/DAILY_SWIPE_LIMIT*100}%` as `${number}%`}]}/>
           </View>
           {active?<View style={[styles.deck,{height:cardHeight}]}>
             {next?<View style={[styles.nextCard,{height:cardHeight-8}]}>
               <LinearGradient colors={next.colors} style={StyleSheet.absoluteFill}/>
               <Text style={styles.nextText}>{next.title}</Text>
             </View>:null}
             <Animated.View key={active.id} {...responder.panHandlers}
               style={[styles.swipeCard,{height:cardHeight,transform:[{translateX:pan.x},{translateY:pan.y},{rotate:rotation}]}]}>
               <LinearGradient colors={active.colors} style={StyleSheet.absoluteFill}/>
               <ImageBackground source={{uri:active.image}} resizeMode="cover" style={styles.art} imageStyle={styles.artImage}>
                 <LinearGradient colors={['rgba(22,14,37,.02)','rgba(22,14,37,.18)','rgba(23,12,38,.88)']}
                   locations={[0,.42,1]} style={StyleSheet.absoluteFill}/>
                 <View style={styles.artTop}>
                   <View style={styles.pill}><Ionicons name={active.icon as IconName} size={16} color="#fff"/>
                     <Text style={styles.pillText}>DEMO VENUE</Text></View>
                   <Ionicons name="sparkles-outline" color="rgba(255,255,255,.95)" size={25}/>
                 </View>
                 <Animated.View pointerEvents="none" style={[styles.voteStamp,styles.likeStamp,{opacity:yesOpacity}]}>
                   <Text style={styles.voteText}>MY VIBE ♥</Text>
                 </Animated.View>
                 <Animated.View pointerEvents="none" style={[styles.voteStamp,styles.dislikeStamp,{opacity:noOpacity}]}>
                   <Text style={styles.voteText}>NOT MY VIBE ×</Text>
                 </Animated.View>
                 <View style={styles.artBottom}>
                   <Text style={styles.cardTitle}>{active.title}</Text>
                   <Text style={styles.cardSubtitle}>{active.subtitle} · Ενδεικτική φωτογραφία</Text>
                   <View style={styles.tags}>{active.tags.slice(0,4).map(tag=><View key={tag} style={styles.tag}>
                     <Text style={styles.tagText}>{tag.replace(/-/g,' ')}</Text>
                   </View>)}</View>
                 </View>
               </ImageBackground>
             </Animated.View>
           </View>:<View style={styles.finished}>
             <Ionicons name="sparkles" color={Colors.violet} size={40}/>
             <Text style={styles.finishedTitle}>{done?'8/8 for today ✳':'More spots coming soon'}</Text>
             <Text style={styles.finishedDesc}>{'Νέα οκτάδα σε περίπου '+countdown+'. Η σημερινή πρόοδος αποθηκεύεται τοπικά.'}</Text>
             <Pressable onPress={()=>setView('dna')} style={styles.dnaAction}><Text style={styles.dnaActionText}>View my Vibe DNA ↗</Text></Pressable>
           </View>}
           {active?<View style={styles.controls}>
             <Pressable style={[styles.action,styles.no]} onPress={()=>flyRef.current('dislike')} accessibilityRole="button" accessibilityLabel="Dislike · Not my vibe">
               <Ionicons name="close" color={Colors.rose} size={25}/><Text style={styles.actionLabel}>Not mine</Text>
             </Pressable>
             <Pressable style={[styles.action,styles.skip]} onPress={()=>flyRef.current('skip')} accessibilityRole="button" accessibilityLabel="Skip · Neutral">
               <Ionicons name="play-skip-forward" color={Colors.muted} size={22}/><Text style={styles.actionLabel}>Skip</Text>
             </Pressable>
             <Pressable style={[styles.action,styles.yes]} onPress={()=>flyRef.current('like')} accessibilityRole="button" accessibilityLabel="Like · My vibe">
               <Ionicons name="heart" color={Colors.mint} size={25}/><Text style={styles.actionLabel}>My vibe</Text>
             </Pressable>
           </View>:null}
           {active?<Pressable style={styles.profileLink} onPress={()=>onOpenVenue(active.id)}
             accessibilityRole="button"><Text style={styles.profileText}>Δες το προφίλ του {active.title} ↗</Text></Pressable>:null}
           <Text style={styles.hint}>8 μαγαζιά κάθε 24 ώρες · Swipe δεξιά ♥, αριστερά × ή Skip. Επιστρέφεις όποτε θέλεις.</Text>
         </View>:<View style={styles.dna}>
           <LinearGradient colors={Gradients.hero} style={styles.dnaHero}>
             <Ionicons name="finger-print-outline" color="#fff" size={32}/>
             <Text style={styles.dnaHeroTitle}>Your venue Vibe DNA</Text>
             <Text style={styles.dnaHeroSub}>{summary.meaningfulCount} αξιολογήσεις μαγαζιών έχουν επηρεάσει τα demo matches. Δεν είναι μέτρηση προσωπικότητας.</Text>
           </LinearGradient>
           <View style={styles.stats}>
             {([['♥',summary.likes,'Likes'],['×',summary.dislikes,'Dislikes'],['↷',summary.skipped,'Skips']] as const).map(([symbol,value,label])=>
               <View key={label} style={styles.stat}><Text style={styles.statNum}>{symbol} {value}</Text><Text style={styles.statLabel}>{label}</Text></View>)}
           </View>
           <Text style={styles.dnaHeading}>Τι σου ταιριάζει</Text>
           {summary.positives.length?<View style={styles.dnaChips}>{summary.positives.map(item=><View key={item.tag} style={styles.positive}><Text style={styles.positiveText}>♥ {item.label}</Text></View>)}</View>
            :<Text style={styles.emptyText}>Κάνε like σε μαγαζιά που σου αρέσουν για να χτίσεις το προφίλ σου.</Text>}
           <Text style={styles.dnaHeading}>Τι προτιμάς λιγότερο</Text>
           {summary.negatives.length?<View style={styles.dnaChips}>{summary.negatives.map(item=><View key={item.tag} style={styles.negative}><Text style={styles.negativeText}>× {item.label}</Text></View>)}</View>
            :<Text style={styles.emptyText}>Τα dislike μειώνουν τη συνάφεια αυτών των χαρακτηριστικών.</Text>}
           <Text style={styles.disclaimer}>Τα χαρακτηριστικά αφορούν μόνο μέρη, αισθητική, μουσική και εμπειρίες εξόδου. Δεν αλλάζουν τις επιλογές σου στο onboarding. Τα δεδομένα μένουν σε αυτή τη συσκευή.</Text>
           {!confirmReset?<Pressable onPress={()=>setConfirmReset(true)} style={styles.reset} accessibilityRole="button">
             <Ionicons name="refresh-outline" color={Colors.rose} size={17}/><Text style={styles.resetText}>Reset Vibe DNA</Text>
           </Pressable>:<View style={styles.confirm}>
             <Text style={styles.confirmText}>Να μηδενιστούν τα taste signals; Το σημερινό όριο δεν αλλάζει.</Text>
             <View style={styles.confirmRow}>
               <Pressable style={styles.confirmCancel} onPress={()=>setConfirmReset(false)}><Text style={styles.cancelText}>Άκυρο</Text></Pressable>
               <Pressable style={styles.confirmDelete} onPress={()=>{onReset();setConfirmReset(false);setView('cards');}}><Text style={styles.deleteText}>Ναι, reset</Text></Pressable>
             </View>
           </View>}
           <Pressable onPress={()=>setView('cards')} style={styles.backToSwipe}><Text style={styles.backText}>Back to today's spots ↗</Text></Pressable>
         </View>}
       </View>
     </ScrollView>
   </View>
 </Modal>;
}
const styles=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(20,12,37,.78)'},
 scroll:{paddingHorizontal:14,paddingTop:24,paddingBottom:28,alignItems:'center',justifyContent:'center'},
 sheet:{width:'100%',maxWidth:470,backgroundColor:'#F8F7FC',borderRadius:28,padding:17,overflow:'hidden'},
 heading:{flexDirection:'row',justifyContent:'space-between',gap:8,alignItems:'center',marginBottom:14},
 titleGroup:{flex:1},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1,color:Colors.violet},
 title:{fontSize:27,fontWeight:'900',letterSpacing:-1,color:Colors.text,marginTop:3},
 close:{backgroundColor:'#EDE8F4',height:40,width:40,borderRadius:13,alignItems:'center',justifyContent:'center'},
 tabs:{flexDirection:'row',backgroundColor:'#EAE5F3',padding:4,borderRadius:14,gap:5,marginBottom:15},
 tab:{flex:1,paddingVertical:11,alignItems:'center',borderRadius:11},
 activeTab:{backgroundColor:Colors.violet},
 tabText:{fontSize:11,fontWeight:'900',color:Colors.text},
 activeTabText:{color:'#fff'},
 progress:{flexDirection:'row',justifyContent:'space-between',marginBottom:7},
 progressText:{fontSize:10,color:Colors.muted,fontWeight:'800'},
 progressTrack:{height:5,backgroundColor:'#E4DDF0',borderRadius:4,overflow:'hidden',marginBottom:13},
 progressFill:{height:'100%',backgroundColor:Colors.violet},
 deck:{width:'100%',alignItems:'center',justifyContent:'flex-start',marginBottom:13},
 nextCard:{position:'absolute',left:9,right:9,top:7,borderRadius:24,overflow:'hidden',justifyContent:'flex-end',padding:22},
 nextText:{color:'#fff',fontSize:20,fontWeight:'900'},
 swipeCard:{width:'100%',borderRadius:24,overflow:'hidden',backgroundColor:Colors.violet,
  shadowColor:'#1D102F',shadowOpacity:.22,shadowRadius:12,shadowOffset:{width:0,height:7},elevation:5},
 art:{flex:1,justifyContent:'space-between'},artImage:{borderRadius:24},
 artTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',padding:18},
 pill:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(12,8,28,.42)',borderRadius:50,paddingHorizontal:12,paddingVertical:9},
 pillText:{fontSize:10,color:'#fff',fontWeight:'900',letterSpacing:1.2},
 artBottom:{paddingHorizontal:23,paddingBottom:24,paddingTop:25},
 cardTitle:{fontSize:31,color:'#fff',fontWeight:'900',letterSpacing:-.8,lineHeight:37},
 cardSubtitle:{fontSize:13,color:'rgba(255,255,255,.93)',marginTop:8,marginBottom:13,lineHeight:19},
 tags:{flexDirection:'row',gap:6,flexWrap:'wrap'},
 tag:{borderRadius:30,backgroundColor:'rgba(255,255,255,.23)',borderWidth:1,borderColor:'rgba(255,255,255,.34)',paddingVertical:7,paddingHorizontal:10},
 tagText:{fontSize:10,fontWeight:'800',color:'#fff'},
 voteStamp:{position:'absolute',top:87,padding:12,borderWidth:3,borderRadius:14,transform:[{rotate:'-14deg'}],zIndex:2},
 likeStamp:{left:19,borderColor:'#B9F8D6'},dislikeStamp:{right:14,borderColor:'#FFD3E1'},
 voteText:{fontSize:19,color:'#fff',fontWeight:'900'},
 controls:{flexDirection:'row',gap:12,justifyContent:'center',marginBottom:11},
 action:{flex:1,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:12,borderRadius:17,borderWidth:1,borderColor:Colors.border},
 no:{backgroundColor:'#FFF0F4'},skip:{backgroundColor:'#F2F0F8'},yes:{backgroundColor:'#EAFAF2'},
 actionLabel:{fontSize:11,fontWeight:'900',color:Colors.text},
 hint:{color:Colors.muted,fontSize:11,lineHeight:17,textAlign:'center',marginBottom:3},
 finished:{borderRadius:24,minHeight:295,backgroundColor:'#F0EAF9',alignItems:'center',justifyContent:'center',padding:22,gap:10,marginBottom:16},
 finishedTitle:{fontSize:23,fontWeight:'900',color:Colors.text,textAlign:'center'},
 finishedDesc:{fontSize:13,lineHeight:20,color:Colors.muted,textAlign:'center'},
 dnaAction:{padding:12,borderRadius:13,backgroundColor:Colors.violet,marginTop:4},
 dnaActionText:{color:'#fff',fontSize:12,fontWeight:'900'},
 dna:{gap:12},
 dnaHero:{borderRadius:20,padding:21,alignItems:'flex-start',gap:8},
 dnaHeroTitle:{fontSize:22,color:'#fff',fontWeight:'900'},
 dnaHeroSub:{fontSize:12,lineHeight:19,color:'rgba(255,255,255,.92)'},
 stats:{flexDirection:'row',gap:8},
 stat:{flex:1,borderRadius:15,backgroundColor:'#fff',padding:13,alignItems:'center'},
 statNum:{fontSize:18,fontWeight:'900',color:Colors.violet},
 statLabel:{fontSize:11,color:Colors.muted,marginTop:3,fontWeight:'800'},
 dnaHeading:{fontSize:15,color:Colors.text,fontWeight:'900',marginTop:6},
 dnaChips:{flexDirection:'row',flexWrap:'wrap',gap:8},
 positive:{backgroundColor:'#E4F8E9',borderRadius:14,paddingHorizontal:12,paddingVertical:10},
 positiveText:{fontSize:12,color:'#23693D',fontWeight:'800'},
 negative:{backgroundColor:'#FBEAF2',borderRadius:14,paddingHorizontal:12,paddingVertical:10},
 negativeText:{fontSize:12,color:Colors.rose,fontWeight:'800'},
 emptyText:{color:Colors.muted,fontSize:12,lineHeight:18},
 disclaimer:{fontSize:11,color:Colors.muted,lineHeight:18,marginTop:7},
 reset:{flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center',borderColor:Colors.border,borderWidth:1,borderRadius:14,padding:14},
 resetText:{color:Colors.rose,fontSize:12,fontWeight:'900'},
 confirm:{borderRadius:16,backgroundColor:'#FBEAF0',padding:15,gap:12},
 confirmText:{color:Colors.text,fontSize:12,fontWeight:'800'},
 confirmRow:{flexDirection:'row',gap:9},
 confirmCancel:{flex:1,padding:12,borderRadius:12,backgroundColor:'#fff',alignItems:'center'},
 confirmDelete:{flex:1,padding:12,borderRadius:12,backgroundColor:Colors.rose,alignItems:'center'},
 cancelText:{fontSize:12,fontWeight:'800',color:Colors.text},
 deleteText:{fontSize:12,fontWeight:'900',color:'#fff'},
 profileLink:{alignItems:'center',paddingVertical:11,marginBottom:4,borderRadius:13,backgroundColor:'#F0EAFB'},
 profileText:{fontWeight:'900',fontSize:12,color:Colors.violet},
 backToSwipe:{padding:12,alignItems:'center'},backText:{color:Colors.violet,fontWeight:'900',fontSize:12}
});

import {useEffect,useMemo,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Animated,Image,Modal,PanResponder,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {trackDemoEvent} from '../lib/demo-analytics';
import {getPendingTasteCards,getDnaSummary,type TasteFeedback,type TasteDecision} from '../lib/vibe-dna';
import {getTasteFeedback,saveTasteFeedback,clearTasteFeedback} from '../lib/storage';
import {Colors,Gradients,Radius} from '../constants/theme';

const DAY=86400000;
const KEY='vibe:concept-session:v1';
type Session={startedAt:number;count:number};

/**
 * Editorial photo-led taste discovery. All stock photos are illustrative only:
 * the names belong to existing venues, but the media is not a verified venue photo.
 * This remains a frontend-only, locally persisted prototype.
 */
export function TasteConceptModal({visible,onClose,initialView='cards'}:{
 visible:boolean;onClose:()=>void;initialView?:'cards'|'dna';
}){
 const [feedback,setFeedback]=useState<TasteFeedback>({});
 const [session,setSession]=useState<Session>({startedAt:0,count:0});
 const [view,setView]=useState<'cards'|'dna'>('cards');
 const [ready,setReady]=useState(false);
 const [photoFailed,setPhotoFailed]=useState(false);
 const drag=useRef(new Animated.ValueXY()).current;
 const animating=useRef(false);

 useEffect(()=>{
  if(!visible)return;
  let active=true;setView(initialView);setReady(false);setPhotoFailed(false);
  drag.setValue({x:0,y:0});
  animating.current=false;
  Promise.all([getTasteFeedback(),AsyncStorage.getItem(KEY)])
   .then(([votes,raw])=>{
    if(!active)return;
    let prev:Session={startedAt:0,count:0};
    try{
     if(raw){
      const parsed=JSON.parse(raw) as Session;
      if(Number.isFinite(parsed.startedAt)&&Number.isFinite(parsed.count))prev=parsed;
     }
    }catch{}
    setSession(prev.startedAt>0&&Date.now()-prev.startedAt<DAY?prev:{startedAt:0,count:0});
    setFeedback(votes);setReady(true);
   }).catch(()=>{if(active)setReady(true);});
  return ()=>{active=false;};
 },[visible,initialView,drag]);

 const pending=useMemo(()=>getPendingTasteCards(feedback),[feedback]);
 const summary=useMemo(()=>getDnaSummary(feedback),[feedback]);
 const inWindow=session.startedAt>0&&Date.now()-session.startedAt<DAY;
 const remaining=inWindow?Math.max(0,8-session.count):8;
 const current=remaining>0?pending[0]:undefined;
 const locationParts=current?.subtitle.split('·').map(x=>x.trim())??[];
 const location=locationParts[0]||'Αθήνα';
 const venueKind=locationParts.slice(1).join(' · ')||'Athens spot';

 useEffect(()=>setPhotoFailed(false),[current?.id]);

 const vote=(decision:TasteDecision)=>{
  if(!current)return;
  const next={...feedback,[current.id]:decision};
  const nextSession:Session=inWindow?{...session,count:session.count+1}:{startedAt:Date.now(),count:1};
  setFeedback(next);setSession(nextSession);
  saveTasteFeedback(next).catch(()=>undefined);
  AsyncStorage.setItem(KEY,JSON.stringify(nextSession)).catch(()=>undefined);
  trackDemoEvent('vibe_card_'+(decision==='like'?'liked':decision==='dislike'?'disliked':'skipped'),current.id);
 };
 const voteRef=useRef(vote);voteRef.current=vote;

 const choose=(decision:TasteDecision)=>{
  if(!current||animating.current)return;
  animating.current=true;
  const x=decision==='like'?430:decision==='dislike'?-430:0;
  Animated.timing(drag,{toValue:{x,y:0},duration:decision==='skip'?130:190,useNativeDriver:false})
   .start(()=>{
    drag.setValue({x:0,y:0});
    voteRef.current(decision);
    animating.current=false;
   });
 };
 const chooseRef=useRef(choose);chooseRef.current=choose;
 const pan=useMemo(()=>PanResponder.create({
  onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>18&&Math.abs(g.dx)>Math.abs(g.dy)*1.2,
  onPanResponderMove:(_,g)=>{if(!animating.current)drag.setValue({x:g.dx,y:g.dy*.14});},
  onPanResponderRelease:(_,g)=>{
   if(g.dx>95)chooseRef.current('like');
   else if(g.dx< -95)chooseRef.current('dislike');
   else Animated.spring(drag,{toValue:{x:0,y:0},friction:7,tension:65,useNativeDriver:false}).start();
  },
  onPanResponderTerminate:()=>Animated.spring(drag,{toValue:{x:0,y:0},friction:7,useNativeDriver:false}).start(),
 }),[drag]);

 const reset=()=>{setFeedback({});clearTasteFeedback().catch(()=>undefined);};
 const rotate=drag.x.interpolate({inputRange:[-260,0,260],outputRange:['-9deg','0deg','9deg'],extrapolate:'clamp'});
 const progress=Math.round(100*(8-remaining)/8);

 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <View style={s.page}>
   <View style={s.header}>
    <View>
     <Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
     <Text style={s.headerSub}>A LITTLE MORE YOU, EVERY DAY</Text>
    </View>
    <Pressable style={s.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Κλείσιμο Vibe Swipe">
     <Ionicons name="close" size={23} color={Colors.text}/>
    </Pressable>
   </View>
   <View style={s.tabs}>
    <Pressable onPress={()=>setView('cards')} style={[s.tab,view==='cards'&&s.tabOn]}
     accessibilityRole="button" accessibilityState={{selected:view==='cards'}}>
     <Text style={[s.tabText,view==='cards'&&s.tabTextOn]}>Discover your taste</Text>
    </Pressable>
    <Pressable onPress={()=>setView('dna')} style={[s.tab,view==='dna'&&s.tabOn]}
     accessibilityRole="button" accessibilityState={{selected:view==='dna'}}>
     <Text style={[s.tabText,view==='dna'&&s.tabTextOn]}>My Vibe DNA</Text>
    </Pressable>
   </View>

   {!ready?<View style={s.loading}><Text style={s.body}>Loading your vibe…</Text></View>
   :view==='cards'?<ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.topLine}><Text style={s.kicker}>TODAY'S EDITION</Text>
     <Text style={s.count}>{8-remaining}<Text style={{color:Colors.subtle}}> / 8 spots</Text></Text>
    </View>
    <View style={s.progress}><View style={[s.progressFill,{width:progress+'%'}]}/></View>
    <View style={s.intro}>
     <Text style={s.title}>Is this <Text style={{color:Colors.violet}}>your vibe?</Text></Text>
     <Text style={s.body}>Μια ματιά αρκεί. Κράτα ό,τι σου ταιριάζει.</Text>
    </View>

    {current?<View>
     <Animated.View style={[s.card,{transform:[{translateX:drag.x},{translateY:drag.y},{rotate}]}]} {...pan.panHandlers}>
      <View style={s.venueImage}>
       <LinearGradient colors={[current.colors[0],current.colors[1]]}
        style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}}/>
       {!photoFailed?<Image source={{uri:current.image}} style={StyleSheet.absoluteFill}
        resizeMode="cover" onError={()=>setPhotoFailed(true)}
        accessibilityLabel="Ενδεικτική φωτογραφία ατμόσφαιρας, όχι του συγκεκριμένου καταστήματος"/>:null}
       <LinearGradient colors={['rgba(36,23,18,.22)','rgba(36,23,18,.08)','rgba(30,18,14,.85)']}
        locations={[0,.34,1]} style={StyleSheet.absoluteFill}/>
       <View style={s.imageTop}>
        <View style={s.editionPill}><Ionicons name="sparkles-outline" size={13} color={Colors.text}/>
         <Text style={s.editionText}>ATHENS EDITION</Text></View>
        <View style={s.indexPill}><Text style={s.indexText}>{String(9-remaining).padStart(2,'0')}</Text></View>
       </View>
       <View style={s.imageBottom}>
        <View style={s.photoCategory}><Text style={s.photoCategoryText}>{venueKind}</Text></View>
        <Text style={s.venueName} numberOfLines={2}>{current.title}</Text>
        <View style={s.locationRow}><Ionicons name="location-outline" size={14} color="#fff"/>
         <Text style={s.locationText}>{location}</Text></View>
        <Text style={s.photoCredit}>Ενδεικτική φωτογραφία · Όχι του συγκεκριμένου μαγαζιού</Text>
       </View>
      </View>
      <View style={s.cardBody}>
       <View style={s.cardBodyTop}><Text style={s.cardLabel}>THE VIBE</Text><Text style={s.cardHint}>Swipe left or right</Text></View>
       <View style={s.tagRow}>
        {current.tags.slice(0,3).map(tag=><View key={tag} style={s.tagPill}>
         <Text style={s.tagText}>{tag.replace(/-/g,' ')}</Text>
        </View>)}
       </View>
      </View>
     </Animated.View>
     <View style={s.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Δεν είναι το vibe μου"
       onPress={()=>choose('dislike')} style={s.decision}>
       <View style={[s.decisionCircle,s.passCircle]}><Ionicons name="close" color={Colors.rose} size={28}/></View>
       <Text style={s.actionText}>Not my vibe</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Παράλειψη"
       onPress={()=>choose('skip')} style={s.decision}>
       <View style={[s.decisionCircle,s.skipCircle]}><Ionicons name="play-skip-forward-outline" color={Colors.muted} size={22}/></View>
       <Text style={s.actionText}>Skip</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Μου αρέσει"
       onPress={()=>choose('like')} style={s.decision}>
       <LinearGradient colors={Gradients.vibe} style={[s.decisionCircle,s.likeCircle]}>
        <Ionicons name="heart" color="#fff" size={27}/>
       </LinearGradient>
       <Text style={[s.actionText,s.likeText]}>My vibe</Text>
      </Pressable>
     </View>
     <Text style={s.hint}><Ionicons name="arrow-back" size={13} color={Colors.muted}/>  Pass  ·  Swipe  ·  Like  <Ionicons name="arrow-forward" size={13} color={Colors.muted}/></Text>
    </View>:<View style={s.complete}>
     <View style={s.completeIcon}><Ionicons name="sparkles" size={30} color={Colors.violet}/></View>
     <Text style={s.completeTitle}>Your vibe is evolving.</Text>
     <Text style={[s.body,{textAlign:'center'}]}>
      {pending.length?'Ολοκλήρωσες τα 8 σημερινά spots. Νέες επιλογές στο επόμενο 24ωρο.':'Έχεις δει όλα τα διαθέσιμα μαγαζιά αυτού του demo.'}
     </Text>
     <Pressable onPress={()=>setView('dna')} style={s.completeButton} accessibilityRole="button">
      <Text style={s.completeButtonText}>Explore my Vibe DNA</Text>
      <Ionicons name="arrow-forward" color="#fff" size={17}/>
     </Pressable>
    </View>}
    <Text style={s.disclaimer}>Πραγματικά ονόματα · Ενδεικτικές φωτογραφίες · Δεν υπάρχουν live στοιχεία ή κρατήσεις</Text>
   </ScrollView>:<ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.kicker}>YOUR PERSONAL TASTE</Text>
    <Text style={s.title}>Your Vibe <Text style={{color:Colors.violet}}>DNA ✳</Text></Text>
    <Text style={s.body}>{summary.meaningfulCount} meaningful swipes · Όσα μαθαίνει το Vibe από τις επιλογές σου.</Text>
    <LinearGradient colors={Gradients.secondary} style={s.summaryCard}>
     <View style={s.dnaIcon}><Ionicons name="finger-print-outline" size={28} color={Colors.violet}/></View>
     <View style={{flex:1}}><Text style={s.summaryTitle}>{summary.likes} likes · {summary.dislikes} passes</Text>
      <Text style={s.body}>Your taste is unique to you.</Text></View>
    </LinearGradient>
    <Text style={s.subheading}>Your top vibes</Text>
    {summary.positives.length?summary.positives.slice(0,6).map(x=><View key={x.tag} style={s.dnaItem}>
      <Text style={s.dnaLabel}>{x.label}</Text>
      <Ionicons name="sparkles" size={16} color={Colors.violet}/>
     </View>):<Text style={s.body}>Κάνε μερικά likes για να εμφανιστούν τα αγαπημένα σου vibes.</Text>}
    <Text style={s.subheading}>Less your vibe</Text>
    {summary.negatives.length?summary.negatives.slice(0,4).map(x=><View key={x.tag} style={s.dnaItem}>
      <Text style={s.dnaLabel}>{x.label}</Text>
      <Ionicons name="remove-circle-outline" size={17} color={Colors.muted}/>
     </View>):<Text style={s.body}>No dislikes yet.</Text>}
    <Pressable style={s.reset} onPress={reset} accessibilityRole="button">
     <Text style={s.resetText}>Reset learned preferences</Text>
    </Pressable>
    <Text style={s.disclaimer}>Taste preferences only · Not a psychological assessment. Reset δεν επαναφέρει τα σημερινά 8 swipes.</Text>
   </ScrollView>}
  </View>
 </Modal>;
}

const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:23,paddingBottom:17},
 brand:{fontSize:29,fontWeight:'900',color:Colors.text,letterSpacing:-1.4},
 headerSub:{fontSize:9,fontWeight:'800',letterSpacing:1.05,color:Colors.muted,marginTop:3},
 close:{width:43,height:43,borderRadius:15,backgroundColor:Colors.cardSoft,alignItems:'center',justifyContent:'center'},
 tabs:{flexDirection:'row',backgroundColor:'#F3EAE3',padding:4,borderRadius:Radius.pill,marginHorizontal:20,gap:4},
 tab:{flex:1,paddingVertical:12,paddingHorizontal:8,borderRadius:Radius.pill,alignItems:'center'},
 tabOn:{backgroundColor:'#fff',shadowColor:'#544036',shadowOpacity:.07,shadowRadius:4,elevation:1},
 tabText:{fontSize:12,fontWeight:'800',color:Colors.muted},
 tabTextOn:{color:Colors.violet},
 loading:{padding:30},
 content:{paddingHorizontal:20,paddingTop:21,paddingBottom:46},
 topLine:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 kicker:{fontSize:10,letterSpacing:1.45,fontWeight:'900',color:Colors.violet},
 count:{fontSize:12,fontWeight:'900',color:Colors.text},
 progress:{height:5,backgroundColor:'#EADFD6',borderRadius:99,marginTop:11,marginBottom:20,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:Colors.violet,borderRadius:99},
 intro:{marginBottom:0},
 title:{fontSize:29,fontWeight:'900',letterSpacing:-.95,color:Colors.text,lineHeight:36},
 body:{fontSize:13,color:Colors.muted,lineHeight:20,marginTop:6},
 card:{backgroundColor:'#fff',borderRadius:27,marginTop:19,overflow:'hidden',
  shadowColor:'#483026',shadowOpacity:.13,shadowOffset:{width:0,height:10},shadowRadius:22,elevation:5},
 venueImage:{height:348,justifyContent:'space-between',overflow:'hidden',backgroundColor:'#A88677'},
 imageTop:{padding:15,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},
 editionPill:{backgroundColor:'rgba(255,251,247,.94)',borderRadius:Radius.pill,flexDirection:'row',
  alignItems:'center',gap:5,paddingVertical:9,paddingHorizontal:12},
 editionText:{fontSize:10,fontWeight:'900',color:Colors.text,letterSpacing:.45},
 indexPill:{backgroundColor:'rgba(255,251,247,.24)',borderColor:'rgba(255,255,255,.55)',borderWidth:1,
  borderRadius:Radius.pill,width:37,height:37,alignItems:'center',justifyContent:'center'},
 indexText:{color:'#fff',fontSize:11,fontWeight:'900'},
 imageBottom:{paddingHorizontal:19,paddingBottom:17},
 photoCategory:{alignSelf:'flex-start',backgroundColor:'rgba(255,255,255,.20)',borderWidth:1,
  borderColor:'rgba(255,255,255,.30)',borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:7,marginBottom:11},
 photoCategoryText:{fontSize:11,color:'#fff',fontWeight:'800'},
 venueName:{color:'#fff',fontSize:34,fontWeight:'900',letterSpacing:-1.2,lineHeight:38},
 locationRow:{flexDirection:'row',alignItems:'center',gap:6,marginTop:10},
 locationText:{color:'#fff',fontSize:13,fontWeight:'700'},
 photoCredit:{marginTop:18,color:'rgba(255,255,255,.84)',fontSize:10,fontWeight:'700'},
 cardBody:{paddingHorizontal:16,paddingTop:13,paddingBottom:16},
 cardBodyTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8},
 cardLabel:{fontSize:10,color:Colors.violet,fontWeight:'900',letterSpacing:1.25},
 cardHint:{fontSize:10,color:Colors.muted,fontWeight:'700'},
 tagRow:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:12},
 tagPill:{backgroundColor:'#F6EEE8',borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:8},
 tagText:{color:Colors.violet,fontSize:12,fontWeight:'800'},
 actions:{flexDirection:'row',alignItems:'flex-start',justifyContent:'center',gap:29,marginTop:24},
 decision:{alignItems:'center',justifyContent:'center',gap:8,minWidth:72},
 decisionCircle:{width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center',
  borderWidth:1,borderColor:Colors.border,backgroundColor:'#fff'},
 passCircle:{backgroundColor:'#FBF5F1'},
 skipCircle:{backgroundColor:'#F5F0E9'},
 likeCircle:{width:68,height:68,borderRadius:34,borderWidth:0,marginTop:-5,
  shadowColor:Colors.violet,shadowOpacity:.18,shadowRadius:9,shadowOffset:{width:0,height:5},elevation:3},
 actionText:{fontSize:11,fontWeight:'800',color:Colors.muted},
 likeText:{color:Colors.violet},
 hint:{fontSize:11,color:Colors.muted,textAlign:'center',marginTop:19},
 disclaimer:{fontSize:10,color:Colors.muted,lineHeight:17,textAlign:'center',marginTop:25},
 complete:{backgroundColor:'#fff',borderRadius:24,padding:27,alignItems:'center',marginTop:25,gap:10},
 completeIcon:{backgroundColor:Colors.sand,borderRadius:20,padding:16,marginBottom:7},
 completeTitle:{fontSize:21,fontWeight:'900',color:Colors.text,textAlign:'center'},
 completeButton:{backgroundColor:Colors.violet,borderRadius:14,paddingHorizontal:19,paddingVertical:13,
  flexDirection:'row',gap:9,alignItems:'center',marginTop:12},
 completeButtonText:{color:'#fff',fontWeight:'900',fontSize:13},
 summaryCard:{marginTop:22,padding:17,borderRadius:22,flexDirection:'row',gap:13,alignItems:'center'},
 dnaIcon:{width:50,height:50,borderRadius:16,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
 summaryTitle:{fontSize:15,fontWeight:'900',color:Colors.text},
 subheading:{fontSize:18,fontWeight:'900',color:Colors.text,marginTop:29,marginBottom:13},
 dnaItem:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',
  paddingVertical:14,borderBottomWidth:1,borderBottomColor:Colors.border},
 dnaLabel:{fontSize:14,fontWeight:'700',color:Colors.text},
 reset:{marginTop:34,backgroundColor:Colors.cardSoft,borderRadius:15,padding:16,alignItems:'center'},
 resetText:{fontSize:13,color:Colors.violet,fontWeight:'800'}
});

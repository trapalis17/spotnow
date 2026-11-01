import {useEffect,useMemo,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Modal,PanResponder,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {trackDemoEvent} from '../lib/demo-analytics';
import {TASTE_CARDS,getPendingTasteCards,getDnaSummary,type TasteFeedback,type TasteDecision} from '../lib/vibe-dna';
import {getTasteFeedback,saveTasteFeedback,clearTasteFeedback} from '../lib/storage';
import {Colors,Gradients,Radius,Type} from '../constants/theme';
const DAY=86400000;
const KEY='vibe:concept-session:v1';
type Session={startedAt:number;count:number};

export function TasteConceptModal({visible,onClose,initialView='cards'}:{visible:boolean;onClose:()=>void;initialView?:'cards'|'dna'}){
 const [feedback,setFeedback]=useState<TasteFeedback>({});
 const [session,setSession]=useState<Session>({startedAt:0,count:0});
 const [view,setView]=useState<'cards'|'dna'>('cards');
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  if(!visible)return;
  let active=true;setView(initialView);setReady(false);
  Promise.all([getTasteFeedback(),AsyncStorage.getItem(KEY)])
   .then(([votes,raw])=>{
    if(!active)return;let prev:Session={startedAt:0,count:0};
    try{if(raw){const parsed=JSON.parse(raw) as Session;if(Number.isFinite(parsed.startedAt)&&Number.isFinite(parsed.count))prev=parsed;}}catch{}
    setSession(prev.startedAt>0&&Date.now()-prev.startedAt<DAY?prev:{startedAt:0,count:0});
    setFeedback(votes);setReady(true);
   }).catch(()=>{if(active)setReady(true);});
  return ()=>{active=false;};
 },[visible,initialView]);
 const pending=useMemo(()=>getPendingTasteCards(feedback),[feedback]);
 const summary=useMemo(()=>getDnaSummary(feedback),[feedback]);
 const inWindow=session.startedAt>0&&Date.now()-session.startedAt<DAY;
 const remaining=inWindow?Math.max(0,8-session.count):8;
 const current=remaining>0?pending[0]:undefined;
 const vote=(decision:TasteDecision)=>{
  if(!current)return;
  const next={...feedback,[current.id]:decision};
  const nextSession:Session=inWindow?{...session,count:session.count+1}:{startedAt:Date.now(),count:1};
  setFeedback(next);setSession(nextSession);
  saveTasteFeedback(next).catch(()=>undefined);
  AsyncStorage.setItem(KEY,JSON.stringify(nextSession)).catch(()=>undefined);
  trackDemoEvent('vibe_card_'+(decision==='like'?'liked':decision==='dislike'?'disliked':'skipped'),current.id);
 };
 const pan=useMemo(()=>PanResponder.create({
  onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>26&&Math.abs(g.dx)>Math.abs(g.dy),
  onPanResponderRelease:(_,g)=>{if(g.dx>80)vote('like');else if(g.dx< -80)vote('dislike');}
 }),[current?.id,feedback,session]);
 const reset=()=>{setFeedback({});clearTasteFeedback().catch(()=>undefined);};
 const subtitle=current?.subtitle.split('·')??[];
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <View style={s.page}>
   <View style={s.header}>
    <View><Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text><Text style={s.headerSub}>GET TO KNOW YOUR TASTE</Text></View>
    <Pressable style={s.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close Taste Swipe"><Ionicons name="close" size={23} color={Colors.text}/></Pressable>
   </View>
   <View style={s.tabs}>
    <Pressable onPress={()=>setView('cards')} style={[s.tab,view==='cards'&&s.tabOn]} accessibilityRole="button"><Text style={[s.tabText,view==='cards'&&s.tabTextOn]}>Swipe</Text></Pressable>
    <Pressable onPress={()=>setView('dna')} style={[s.tab,view==='dna'&&s.tabOn]} accessibilityRole="button"><Text style={[s.tabText,view==='dna'&&s.tabTextOn]}>My Vibe DNA</Text></Pressable>
   </View>
   {!ready?<View style={s.loading}><Text style={s.body}>Loading your vibe…</Text></View>:view==='cards'?<ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.topLine}><Text style={s.kicker}>YOUR DAILY 8</Text><Text style={s.count}>{8-remaining} / 8</Text></View>
    <View style={s.progress}><View style={[s.progressFill,{width:(100*(8-remaining)/8)+'%'}]}/></View>
    <Text style={s.title}>Would you go here?</Text>
    <Text style={s.body}>Like, pass ή skip. Κάθε επιλογή βελτιώνει το γούστο που μαθαίνει το Vibe.</Text>
    {current?<View style={s.card} {...pan.panHandlers}>
     <LinearGradient colors={[current.colors[0],current.colors[1]]} start={{x:0,y:0}} end={{x:1,y:1}} style={s.venueImage}>
      <View style={s.bigCircle}/><View style={s.smallCircle}/>
      <View style={s.mockTag}><Ionicons name="location-outline" size={13} color="#fff"/><Text style={s.mockTagText}>{subtitle[0]?.trim()||'Athens'}</Text></View>
      <View style={s.centerArtwork}><Ionicons name={current.icon as any} size={75} color="rgba(255,255,255,.84)"/></View>
      <Text style={s.venueKind}>{subtitle.slice(1).join('·').trim()||'Athens venue'}</Text>
     </LinearGradient>
     <View style={s.cardBody}>
      <Text style={s.venueName}>{current.title}</Text>
      <View style={s.tagRow}>{current.tags.slice(0,3).map(tag=><View key={tag} style={s.tagPill}><Text style={s.tagText}>{tag.replace(/-/g,' ')}</Text></View>)}</View>
     </View>
     <View style={s.actions}>
      <Pressable style={s.action} accessibilityRole="button" accessibilityLabel="Δεν μου αρέσει" onPress={()=>vote('dislike')}><Ionicons name="close" size={27} color={Colors.rose}/><Text style={s.actionText}>Pass</Text></Pressable>
      <Pressable style={s.action} accessibilityRole="button" accessibilityLabel="Παράλειψη" onPress={()=>vote('skip')}><Ionicons name="play-skip-forward-outline" size={23} color={Colors.muted}/><Text style={s.actionText}>Skip</Text></Pressable>
      <Pressable style={[s.action,s.like]} accessibilityRole="button" accessibilityLabel="Μου αρέσει" onPress={()=>vote('like')}><Ionicons name="heart" size={25} color="#fff"/><Text style={s.likeText}>My vibe</Text></Pressable>
     </View>
    </View>:<View style={s.complete}><View style={s.completeIcon}><Ionicons name="sparkles-outline" size={34} color={Colors.violet}/></View>
      <Text style={s.completeTitle}>Your vibe is evolving ✳</Text><Text style={s.body}>{pending.length?'Οι 8 σημερινές επιλογές ολοκληρώθηκαν. Νέες κάρτες σε επόμενο 24ωρο.':'Έχεις δει όλα τα διαθέσιμα μαγαζιά αυτής της έκδοσης.'}</Text>
      <Pressable onPress={()=>setView('dna')} style={s.completeButton}><Text style={s.completeButtonText}>View my Vibe DNA</Text><Ionicons name="arrow-forward" color="#fff" size={17}/></Pressable>
     </View>}
    <Text style={s.disclaimer}>Real venue names · Editorial artwork · No live venue data or bookings</Text>
   </ScrollView>:<ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <Text style={s.kicker}>YOUR PERSONAL TASTE</Text>
    <Text style={s.title}>Your Vibe DNA ✳</Text>
    <Text style={s.body}>{summary.meaningfulCount} meaningful swipes · Όσα μαθαίνει το Vibe από τις επιλογές σου.</Text>
    <LinearGradient colors={Gradients.secondary} style={s.summaryCard}><Ionicons name="finger-print-outline" size={30} color={Colors.violet}/><View style={{flex:1}}><Text style={s.summaryTitle}>{summary.likes} likes · {summary.dislikes} passes</Text><Text style={s.body}>Your taste is unique to you.</Text></View></LinearGradient>
    <Text style={s.subheading}>Your top vibes</Text>
    {summary.positives.length?summary.positives.slice(0,6).map(x=><View key={x.tag} style={s.dnaItem}><Text style={s.dnaLabel}>{x.label}</Text><Ionicons name="sparkles" size={16} color={Colors.violet}/></View>):<Text style={s.body}>Κάνε μερικά likes για να εμφανιστούν τα αγαπημένα σου vibes.</Text>}
    <Text style={s.subheading}>Less your vibe</Text>
    {summary.negatives.length?summary.negatives.slice(0,4).map(x=><View key={x.tag} style={s.dnaItem}><Text style={s.dnaLabel}>{x.label}</Text><Ionicons name="remove-circle-outline" size={17} color={Colors.muted}/></View>):<Text style={s.body}>No dislikes yet.</Text>}
    <Pressable style={s.reset} onPress={reset} accessibilityRole="button"><Text style={s.resetText}>Reset learned preferences</Text></Pressable>
    <Text style={s.disclaimer}>Taste preferences only · Not a psychological assessment</Text>
   </ScrollView>}
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:21,paddingTop:24,paddingBottom:19},
 brand:{fontSize:28,fontWeight:'900',color:Colors.text,letterSpacing:-1.4},headerSub:{fontSize:9,fontWeight:'900',letterSpacing:1,color:Colors.muted,marginTop:3},
 close:{width:42,height:42,borderRadius:14,backgroundColor:'#F0EDF6',alignItems:'center',justifyContent:'center'},
 tabs:{flexDirection:'row',backgroundColor:'#EFEAF8',padding:4,borderRadius:Radius.pill,marginHorizontal:20,gap:4},
 tab:{flex:1,padding:12,borderRadius:Radius.pill,alignItems:'center'},tabOn:{backgroundColor:'#fff'},
 tabText:{fontSize:13,fontWeight:'800',color:Colors.muted},tabTextOn:{color:Colors.violet},
 content:{paddingHorizontal:20,paddingTop:24,paddingBottom:50},
 topLine:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},kicker:{fontSize:10,letterSpacing:1.4,fontWeight:'900',color:Colors.violet},
 count:{fontSize:12,color:Colors.muted,fontWeight:'900'},
 progress:{height:5,backgroundColor:'#E8E1F2',borderRadius:9,marginTop:11,marginBottom:22,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:Colors.violet,borderRadius:9},
 title:{fontSize:Type.title,fontWeight:'900',letterSpacing:-.9,color:Colors.text},
 body:{fontSize:13,color:Colors.muted,lineHeight:21,marginTop:7},loading:{padding:25},
 card:{backgroundColor:'#fff',borderRadius:Radius.lg,marginTop:21,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
 venueImage:{height:290,padding:17,justifyContent:'space-between',overflow:'hidden'},
 bigCircle:{position:'absolute',right:-85,top:-100,width:290,height:290,borderRadius:145,borderWidth:45,borderColor:'rgba(255,255,255,.11)'},
 smallCircle:{position:'absolute',left:-42,bottom:-90,width:160,height:160,borderRadius:80,backgroundColor:'rgba(255,255,255,.13)'},
 mockTag:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:8,borderRadius:999,backgroundColor:'rgba(25,18,46,.23)'},
 mockTagText:{fontSize:12,color:'#fff',fontWeight:'800'},
 centerArtwork:{alignItems:'center',justifyContent:'center',flex:1},
 venueKind:{fontSize:13,fontWeight:'800',color:'#fff'},
 cardBody:{paddingHorizontal:18,paddingTop:18,paddingBottom:7},
 venueName:{fontSize:25,fontWeight:'900',color:Colors.text,letterSpacing:-.6},
 tagRow:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:11},
 tagPill:{backgroundColor:'#F2ECFF',borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:7},
 tagText:{color:Colors.violet,fontSize:12,fontWeight:'800'},
 actions:{flexDirection:'row',gap:9,margin:14,marginTop:19},
 action:{flex:1,minHeight:68,borderRadius:17,backgroundColor:'#F4F1F9',alignItems:'center',justifyContent:'center',gap:3},
 actionText:{color:Colors.text,fontSize:12,fontWeight:'800'},
 like:{backgroundColor:Colors.violet},likeText:{color:'#fff',fontSize:12,fontWeight:'900'},
 disclaimer:{fontSize:11,color:Colors.muted,lineHeight:18,textAlign:'center',marginTop:24},
 complete:{backgroundColor:'#fff',borderRadius:24,padding:27,alignItems:'center',marginTop:24,gap:10},
 completeIcon:{backgroundColor:'#F0E9FF',borderRadius:20,padding:15,marginBottom:7},
 completeTitle:{fontSize:20,fontWeight:'900',color:Colors.text,textAlign:'center'},
 completeButton:{backgroundColor:Colors.violet,borderRadius:14,paddingHorizontal:19,paddingVertical:13,flexDirection:'row',gap:9,alignItems:'center',marginTop:12},
 completeButtonText:{color:'#fff',fontWeight:'900',fontSize:13},
 summaryCard:{marginTop:22,padding:18,borderRadius:20,flexDirection:'row',gap:13,alignItems:'center'},
 summaryTitle:{fontSize:14,fontWeight:'900',color:Colors.text},
 subheading:{fontSize:18,fontWeight:'900',color:Colors.text,marginTop:29,marginBottom:13},
 dnaItem:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderBottomWidth:1,borderBottomColor:Colors.border},
 dnaLabel:{fontSize:14,fontWeight:'700',color:Colors.text},
 reset:{marginTop:34,backgroundColor:Colors.cardSoft,borderRadius:14,padding:16,alignItems:'center'},
 resetText:{fontSize:13,color:Colors.violet,fontWeight:'800'}
});

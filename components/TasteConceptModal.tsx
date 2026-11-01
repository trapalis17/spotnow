import {useEffect,useMemo,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {trackDemoEvent} from '../lib/demo-analytics';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View,PanResponder} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {TASTE_CARDS,getPendingTasteCards,getDnaSummary,type TasteFeedback,type TasteDecision} from '../lib/vibe-dna';
import {getTasteFeedback,saveTasteFeedback,clearTasteFeedback} from '../lib/storage';
import {Colors} from '../constants/theme';

export function TasteConceptModal({visible,onClose,initialView='cards'}:{visible:boolean;onClose:()=>void;initialView?:'cards'|'dna'}){
 const [feedback,setFeedback]=useState<TasteFeedback>({});
 const [view,setView]=useState<'cards'|'dna'>('cards');
 const [hydrated,setHydrated]=useState(false);
 const [session,setSession]=useState({startedAt:0,count:0});
 const DAY=86400000;
 const sessionKey='vibe:concept-session:v1';
 useEffect(()=>{if(visible){setView(initialView);setHydrated(false);Promise.all([getTasteFeedback(),AsyncStorage.getItem(sessionKey)]).then(([x,raw])=>{setFeedback(x);let previous={startedAt:0,count:0};try{if(raw)previous=JSON.parse(raw);}catch{} const valid=previous.startedAt>0&&Date.now()-previous.startedAt<DAY;setSession(valid?previous:{startedAt:Date.now(),count:0});setHydrated(true);}).catch(()=>setHydrated(true));}},[visible,initialView]);
 const pending=useMemo(()=>getPendingTasteCards(feedback),[feedback]);
 const summary=useMemo(()=>getDnaSummary(feedback),[feedback]);
 const remaining= session.startedAt>0&&Date.now()-session.startedAt<DAY?Math.max(0,8-session.count):8;
 const active=remaining>0?pending[0]:undefined;
 const vote=(decision:TasteDecision)=>{
   if(!active)return;
   const next={...feedback,[active.id]:decision};
   setFeedback(next);
   trackDemoEvent('vibe_card_'+(decision==='like'?'liked':decision==='dislike'?'disliked':'skipped'),active.id);
   saveTasteFeedback(next).catch(()=>undefined);
   const nextSession=(!session.startedAt||Date.now()-session.startedAt>=DAY)?{startedAt:Date.now(),count:1}:{startedAt:session.startedAt,count:session.count+1};
   setSession(nextSession);AsyncStorage.setItem(sessionKey,JSON.stringify(nextSession)).catch(()=>undefined);
 };
 const pan=useMemo(()=>PanResponder.create({
   onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>22&&Math.abs(g.dx)>Math.abs(g.dy),
   onPanResponderRelease:(_,g)=>{if(g.dx>75)vote('like');else if(g.dx< -75)vote('dislike');}
 }),[active?.id,feedback]);
 const reset=()=>{setFeedback({});clearTasteFeedback().catch(()=>undefined);};
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <View style={s.root}>
   <View style={s.header}>
    <Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Κλείσιμο"><Ionicons name="close-circle-outline" size={30} color={Colors.text}/></Pressable>
   </View>
   <View style={s.switcher}>
    <Pressable onPress={()=>setView('cards')} style={[s.tab,view==='cards'&&s.selected]}><Text style={s.tabText}>Taste swipe</Text></Pressable>
    <Pressable onPress={()=>setView('dna')} style={[s.tab,view==='dna'&&s.selected]}><Text style={s.tabText}>My Vibe DNA</Text></Pressable>
   </View>
   {!hydrated?<Text style={s.body}>Loading preferences…</Text>:view==='cards'?<ScrollView contentContainerStyle={s.content}>
    <Text style={s.kicker}>REAL ATHENS VENUES · TASTE LEARNING</Text>
    <Text style={s.title}>Would you go here?</Text>
    <Text style={s.body}>Swipe σε πραγματικά μαγαζιά της Αθήνας. Το Like/Dislike μαθαίνει τι σου αρέσει, δεν αποτελεί κράτηση ή αναζήτηση.</Text>
    {active?<View style={s.card} {...pan.panHandlers}>
      <View style={[s.image,{backgroundColor:active.colors[0],justifyContent:'center',alignItems:'center',padding:22}]}><Ionicons name={active.icon as any} size={60} color="#FFFFFF"/><Text style={{fontWeight:'900',fontSize:20,color:'#fff',textAlign:'center',marginTop:15}}>{active.title}</Text><Text style={{color:'#F3ECFF',marginTop:7,textAlign:'center'}}>Υπαρκτό μαγαζί · ενδεικτική κάρτα χωρίς φωτογραφία</Text></View>
      <Text style={s.title}>{active.title}</Text>
      <Text style={s.body}>{active.subtitle}</Text>
      <Text style={s.tags}>{active.tags.slice(0,4).join(' · ')}</Text>
      <View style={s.actions}>
       <Pressable accessibilityRole="button" style={s.action} onPress={()=>vote('dislike')}><Ionicons name="close" size={25} color={Colors.rose}/><Text>Not mine</Text></Pressable>
       <Pressable accessibilityRole="button" style={s.action} onPress={()=>vote('skip')}><Ionicons name="play-skip-forward" size={23} color={Colors.muted}/><Text>Skip</Text></Pressable>
       <Pressable accessibilityRole="button" style={[s.action,s.like]} onPress={()=>vote('like')}><Ionicons name="heart" size={24} color={Colors.violet}/><Text>My vibe</Text></Pressable>
      </View>
    </View>:<View style={s.card}><Text style={s.title}>Your vibe is taking shape ✳</Text><Text style={s.body}>{pending.length?'You have completed today’s 8 swipes. Come back after 24 hours from your first swipe.':'You have explored all available real venue cards.'}</Text><Pressable onPress={()=>setView('dna')}><Text style={s.link}>Explore Vibe DNA ↗</Text></Pressable></View>}
    <Text style={s.footer}>{summary.ratedCount} / {TASTE_CARDS.length} venues rated · {remaining} swipes available in this session</Text>
   </ScrollView>:<ScrollView contentContainerStyle={s.content}>
     <Text style={s.kicker}>YOUR TASTE PROFILE</Text>
     <Text style={s.title}>Vibe DNA ✳</Text>
     <Text style={s.body}>{summary.meaningfulCount} meaningful responses. This represents venue preferences, not a personality diagnosis.</Text>
     <Text style={s.section}>Your top vibes</Text>
     {summary.positives.length?summary.positives.map(x=><View key={x.tag} style={s.pill}><Text style={s.pillText}>✳ {x.label}</Text></View>):<Text style={s.body}>Like a few concepts to reveal your preferences.</Text>}
     <Text style={s.section}>Less your vibe</Text>
     {summary.negatives.length?summary.negatives.map(x=><View key={x.tag} style={s.pill}><Text style={s.pillText}>× {x.label}</Text></View>):<Text style={s.body}>No dislikes yet.</Text>}
     <Pressable style={s.reset} onPress={reset}><Text style={s.link}>Reset learned taste preferences</Text></Pressable>
   </ScrollView>}
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:Colors.background},header:{paddingHorizontal:22,paddingTop:26,paddingBottom:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 brand:{fontSize:29,fontWeight:'900',color:Colors.text},switcher:{flexDirection:'row',gap:8,paddingHorizontal:18},
 tab:{borderRadius:18,paddingVertical:12,paddingHorizontal:16,backgroundColor:'#EDE8F5'},selected:{backgroundColor:'#D9C7FA'},
 tabText:{fontWeight:'800',color:Colors.violet},content:{paddingHorizontal:22,paddingTop:20,paddingBottom:56},
 kicker:{fontSize:10,color:Colors.violet,fontWeight:'900',letterSpacing:1},title:{fontSize:27,fontWeight:'900',color:Colors.text,marginVertical:8},
 body:{fontSize:14,color:Colors.muted,lineHeight:21},card:{backgroundColor:'#fff',padding:15,borderRadius:25,marginTop:22,borderWidth:1,borderColor:Colors.border},
 image:{width:'100%',height:280,borderRadius:19},tags:{color:Colors.violet,fontSize:12,marginTop:11},
 actions:{flexDirection:'row',justifyContent:'space-between',gap:6,marginTop:20},
 action:{flex:1,alignItems:'center',paddingVertical:13,backgroundColor:'#F2EDF6',borderRadius:17,gap:5},
 like:{backgroundColor:'#E5D6FB'},footer:{textAlign:'center',fontSize:11,color:Colors.muted,marginTop:19},
 section:{fontSize:17,fontWeight:'900',color:Colors.text,marginTop:27,marginBottom:12},pill:{backgroundColor:'#E8DDF9',borderRadius:15,padding:14,marginVertical:4},
 pillText:{fontSize:13,fontWeight:'800',color:Colors.violet},reset:{marginTop:35},link:{color:Colors.violet,fontWeight:'800'}
});
import { useMemo, useRef } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PlaceMatch } from '../lib/place-intelligence';
import type { SwipeDecision, SwipeFeedback } from '../lib/swipe-intelligence';
import { pendingSwipeMatches } from '../lib/swipe-intelligence';
import { Colors } from '../constants/theme';

const width=Math.min(Dimensions.get('window').width - 32,480);
const SWIPE_THRESHOLD=width*.23;
const art={
 cafe:{bg:['#8B6AE6','#D89ACA'] as const,icon:'cafe-outline' as const,category:'Καφέ'},
 restaurant:{bg:['#E8759D','#F3B085'] as const,icon:'restaurant-outline' as const,category:'Φαγητό'},
 bar:{bg:['#6353B7','#B264B2'] as const,icon:'wine-outline' as const,category:'Ποτό'},
};
type Props={
 matches:PlaceMatch[];
 feedback:SwipeFeedback;
 onVote:(placeId:string,vote:SwipeDecision)=>void;
 onReset:()=>void;
 onOpen:(placeId:string)=>void;
};
export function SwipeDiscovery({matches,feedback,onVote,onReset,onOpen}:Props){
 const pending=pendingSwipeMatches(matches,feedback);
 const active=pending[0];
 const next=pending[1];
 const pan=useRef(new Animated.ValueXY()).current;
 const locked=useRef(false);
 const activeRef=useRef(active);
 const voteRef=useRef(onVote);
 activeRef.current=active;
 voteRef.current=onVote;
 const completeRef=useRef<(vote:SwipeDecision)=>void>(()=>undefined);
 completeRef.current=(vote)=>{
  const current=activeRef.current;
  if(!current||locked.current)return;
  locked.current=true;
  Animated.timing(pan,{
    toValue:{x:vote==='like'?width*1.5:-width*1.5,y:18},
    duration:205,useNativeDriver:true,
  }).start(({finished})=>{
    pan.setValue({x:0,y:0});
    locked.current=false;
    if(finished)voteRef.current(current.place.id,vote);
  });
 };
 const responder=useMemo(()=>PanResponder.create({
  onStartShouldSetPanResponder:()=>false,
  onMoveShouldSetPanResponder:(_e,g)=>Math.abs(g.dx)>9&&Math.abs(g.dx)>Math.abs(g.dy)*1.2,
  onPanResponderMove:(_e,g)=>{if(!locked.current)pan.setValue({x:g.dx,y:g.dy*.16});},
  onPanResponderRelease:(_e,g)=>{
   if(locked.current)return;
   const direction=g.dx>0?'like':'pass';
   if(Math.abs(g.dx)>SWIPE_THRESHOLD || (Math.abs(g.vx)>.75&&Math.abs(g.dx)>35))completeRef.current(direction);
   else Animated.spring(pan,{toValue:{x:0,y:0},useNativeDriver:true,bounciness:7}).start();
  },
  onPanResponderTerminate:()=>Animated.spring(pan,{toValue:{x:0,y:0},useNativeDriver:true}).start(),
 }),[pan]);
 const rotate=pan.x.interpolate({inputRange:[-width,0,width],outputRange:['-16deg','0deg','16deg'],extrapolate:'clamp'});
 const likeOpacity=pan.x.interpolate({inputRange:[0,SWIPE_THRESHOLD],outputRange:[0,1],extrapolate:'clamp'});
 const passOpacity=pan.x.interpolate({inputRange:[-SWIPE_THRESHOLD,0],outputRange:[1,0],extrapolate:'clamp'});
 const count=Object.keys(feedback).length;
 if(!active)return <View style={styles.done}>
  <View style={styles.doneIcon}><Ionicons name="sparkles" color={Colors.violet} size={34}/></View>
  <Text style={styles.doneTitle}>Το vibe σου γίνεται πιο ξεκάθαρο.</Text>
  <Text style={styles.doneText}>{count
    ? 'Είδες όλα τα διαθέσιμα spots. Οι επιλογές σου επηρεάζουν ήδη τις προτάσεις.'
    : 'Δεν βρέθηκαν spots με αυτά τα φίλτρα. Δοκίμασε άλλη περιοχή ή κατηγορία.'}</Text>
  {count>0?<Pressable onPress={onReset} style={styles.restart}><Text style={styles.restartText}>Ξεκίνα ξανά τις κάρτες ↻</Text></Pressable>:null}
 </View>;
 const viewArt=art[active.place.category];
 const nextArt=next?art[next.place.category]:null;
 return <View style={styles.root}>
   <View style={styles.topline}>
     <Text style={styles.count}>{pending.length} spots να ανακαλύψεις</Text>
     <View style={styles.topActions}>
      <View style={styles.learning}><Ionicons name="sparkles" color={Colors.violet} size={14}/><Text style={styles.learningText}>Μαθαίνουμε το vibe σου</Text></View>
      {count>0?<Pressable onPress={onReset} accessibilityRole="button" accessibilityLabel="Μηδενισμός swipe επιλογών" style={styles.resetButton}>
        <Ionicons name="refresh" color={Colors.violet} size={17}/>
      </Pressable>:null}
     </View>
   </View>
   <View style={styles.deck}>
     {next&&nextArt?<View pointerEvents="none" style={styles.beneath}>
       <LinearGradient colors={nextArt.bg} style={styles.beneathArt}/>
       <Text numberOfLines={1} style={styles.beneathText}>{next.place.name}</Text>
     </View>:null}
     <Animated.View key={active.place.id} {...responder.panHandlers}
       style={[styles.card,{transform:[{translateX:pan.x},{translateY:pan.y},{rotate}]}]}>
       <LinearGradient colors={viewArt.bg} style={styles.visual} start={{x:0,y:0}} end={{x:1,y:1}}>
         <View style={styles.orbit}/>
         <View style={styles.typePill}><Text style={styles.typePillText}>{viewArt.category}</Text></View>
         <Ionicons name={viewArt.icon} size={128} color="rgba(255,255,255,.35)" style={styles.artIcon}/>
         <Animated.View style={[styles.stamp,styles.likeStamp,{opacity:likeOpacity}]}>
           <Text style={styles.likeStampText}>LIKE  ♥</Text>
         </Animated.View>
         <Animated.View style={[styles.stamp,styles.passStamp,{opacity:passOpacity}]}>
           <Text style={styles.passStampText}>PASS  ×</Text>
         </Animated.View>
       </LinearGradient>
       <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{active.place.name}</Text>
        <Text style={styles.address} numberOfLines={2}>{active.place.address??'Περιοχή '+active.place.category}</Text>
        <View style={styles.details}>
          <View style={styles.match}><Ionicons name="sparkles" color={Colors.violet} size={17}/>
            <Text style={styles.matchText}>{active.score}% match</Text></View>
          <Text style={styles.vibeText} numberOfLines={1}>{active.vibe.label}</Text>
        </View>
        <Text style={styles.explanation} numberOfLines={2}>{active.reasons[0]??'Με βάση την περιοχή και τις προτιμήσεις σου'}</Text>
       </View>
     </Animated.View>
   </View>
   <View style={styles.controls}>
    <Pressable onPress={()=>completeRef.current('pass')} accessibilityRole="button"
      accessibilityLabel="Δεν μου αρέσει, επόμενη πρόταση" style={[styles.action,styles.passButton]}>
      <Ionicons name="close" size={30} color={Colors.rose}/>
    </Pressable>
    <Pressable onPress={()=>onOpen(active.place.id)} accessibilityRole="button"
      accessibilityLabel="Δες το προφίλ του μαγαζιού" style={[styles.action,styles.viewButton]}>
      <Ionicons name="eye-outline" size={24} color={Colors.violet}/>
    </Pressable>
    <Pressable onPress={()=>completeRef.current('like')} accessibilityRole="button"
      accessibilityLabel="Μου αρέσει, αποθήκευση στα αγαπημένα" style={[styles.action,styles.likeButton]}>
      <Ionicons name="heart" size={29} color="#fff"/>
    </Pressable>
   </View>
   <Text style={styles.tip}>← Όχι για μένα   ·   Μου αρέσει →</Text>
   <Text style={styles.foot}>Το ♥ αποθηκεύει το μαγαζί. Τα swipes βελτιώνουν τη σειρά προτάσεων από τα διαθέσιμα στοιχεία Google.</Text>
 </View>;
}
const styles=StyleSheet.create({
 root:{marginTop:9,marginBottom:18},
 topline:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:5,marginBottom:14},
 count:{color:Colors.muted,fontSize:12,fontWeight:'800'},
 topActions:{flexDirection:'row',alignItems:'center',gap:8},
 learning:{flexDirection:'row',alignItems:'center',gap:5},
 resetButton:{padding:7,borderRadius:10,backgroundColor:'#F0E9FF'},
 learningText:{color:Colors.violet,fontSize:11,fontWeight:'800'},
 deck:{height:430,position:'relative',justifyContent:'flex-start'},
 beneath:{position:'absolute',top:14,left:10,right:10,height:394,borderRadius:27,backgroundColor:'#fff',overflow:'hidden',borderWidth:1,borderColor:Colors.border,
  transform:[{scale:.97}]},
 beneathArt:{height:230},
 beneathText:{color:Colors.text,fontSize:18,fontWeight:'900',padding:18},
 card:{position:'absolute',top:0,left:0,right:0,height:414,backgroundColor:'#fff',borderRadius:27,overflow:'hidden',
  borderWidth:1,borderColor:Colors.border,shadowColor:'#392260',shadowOpacity:.15,shadowRadius:18,shadowOffset:{width:0,height:12},elevation:5},
 visual:{height:236,overflow:'hidden',padding:18},
 orbit:{position:'absolute',width:285,height:285,borderRadius:143,right:-68,top:-159,borderWidth:57,borderColor:'rgba(255,255,255,.20)'},
 typePill:{alignSelf:'flex-start',paddingHorizontal:15,paddingVertical:9,backgroundColor:'rgba(255,255,255,.28)',
  borderRadius:999,borderWidth:1,borderColor:'rgba(255,255,255,.48)'},
 typePillText:{color:'#fff',fontWeight:'900',fontSize:13},
 artIcon:{position:'absolute',right:39,bottom:7,transform:[{rotate:'-12deg'}]},
 stamp:{position:'absolute',top:77,borderWidth:4,paddingHorizontal:17,paddingVertical:9,borderRadius:13,transform:[{rotate:'-13deg'}]},
 likeStamp:{left:20,borderColor:'#D6FF8B'},
 passStamp:{right:20,borderColor:'#FFE7E5',transform:[{rotate:'13deg'}]},
 likeStampText:{color:'#D6FF8B',fontWeight:'900',fontSize:25,letterSpacing:1},
 passStampText:{color:'#FFE7E5',fontWeight:'900',fontSize:25,letterSpacing:1},
 info:{paddingHorizontal:20,paddingTop:15},
 name:{color:Colors.text,fontSize:25,fontWeight:'900',letterSpacing:-.7,lineHeight:29},
 address:{color:Colors.muted,fontSize:12,marginTop:5,lineHeight:17},
 details:{flexDirection:'row',alignItems:'center',gap:11,marginTop:12},
 match:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#F0E9FF',paddingHorizontal:10,paddingVertical:8,borderRadius:10},
 matchText:{color:Colors.violet,fontSize:12,fontWeight:'900'},
 vibeText:{color:Colors.violet,fontSize:12,fontWeight:'800',flexShrink:1},
 explanation:{color:Colors.muted,fontSize:11,lineHeight:16,marginTop:9},
 controls:{flexDirection:'row',justifyContent:'center',gap:22,marginTop:4},
 action:{height:62,width:62,borderRadius:21,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Colors.border},
 passButton:{backgroundColor:'#FFF1F6'},
 viewButton:{backgroundColor:'#F3EEFC'},
 likeButton:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 tip:{textAlign:'center',fontSize:13,fontWeight:'800',color:Colors.text,marginTop:14},
 foot:{textAlign:'center',color:Colors.muted,fontSize:11,lineHeight:17,marginTop:9,paddingHorizontal:8},
 done:{paddingVertical:40,paddingHorizontal:20,alignItems:'center',backgroundColor:'#F2EDFC',borderRadius:24,marginTop:14},
 doneIcon:{width:67,height:67,borderRadius:23,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginBottom:16},
 doneTitle:{color:Colors.text,fontWeight:'900',textAlign:'center',fontSize:20,lineHeight:26},
 doneText:{color:Colors.muted,fontSize:13,lineHeight:20,marginTop:9,textAlign:'center'},
 restart:{backgroundColor:Colors.violet,paddingVertical:13,paddingHorizontal:17,borderRadius:15,marginTop:19},
 restartText:{color:'#fff',fontWeight:'900',fontSize:13},
});

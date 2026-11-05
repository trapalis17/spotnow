import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {VibeAvatar} from '../../components/VibeAvatar';
import {ProfilePictureSheet} from '../../components/ProfilePictureSheet';
import {defaultProfilePicture,getProfilePicture,saveProfilePicture,resetProfilePicture,photoFromBase64,type ProfilePicture,type VibeAvatarId} from '../../lib/profile-picture';
import {
 clearUser,getPreferences,getUser,getTasteFeedback,clearTasteFeedback,
 getSavedVenueIds,getCollections,getDailyVenueSwipeState,getVisitFeedback
} from '../../lib/storage';
import {getDemoPlaceById} from '../../lib/demo-places';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import {getVibeIdentity} from '../../lib/vibe-identity';
import {getDemoEvents,type DemoEvent} from '../../lib/demo-analytics';
import type {VisitFeedback} from '../../lib/storage';
import type {UserPreferences,UserProfile} from '../../types';

export default function ProfileScreen(){
 const router=useRouter();
 const [user,setUser]=useState<UserProfile|null>(null);
 const [prefs,setPrefs]=useState<UserPreferences|null>(null);
 const [taste,setTaste]=useState<TasteFeedback>({});
 const [venueVotes,setVenueVotes]=useState<TasteFeedback>({});
 const [visits,setVisits]=useState<Record<string,VisitFeedback>>({});
 const [savedIds,setSavedIds]=useState<string[]>([]);
 const [events,setEvents]=useState<DemoEvent[]>([]);
 const [savedCount,setSavedCount]=useState(0);
 const [collectionCount,setCollectionCount]=useState(0);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [picture,setPicture]=useState<ProfilePicture>(defaultProfilePicture('vibe'));
 const [pictureSheetOpen,setPictureSheetOpen]=useState(false);
 const [pictureBusy,setPictureBusy]=useState(false);
 const [pictureError,setPictureError]=useState('');

 useFocusEffect(useCallback(()=>{
  let alive=true;
  getUser().then(async u=>{
   if(!alive)return;
   setUser(u);
   if(u){const p=await getProfilePicture(u.email);if(alive)setPicture(p);}
   else setPicture(defaultProfilePicture('vibe'));
  }).catch(()=>undefined);
  getPreferences().then(p=>{if(alive)setPrefs(p);}).catch(()=>undefined);
  getTasteFeedback().then(t=>{if(alive)setTaste(t);}).catch(()=>undefined);
  getSavedVenueIds().then(ids=>{
   if(alive){
    setSavedIds(ids);
    setSavedCount(ids.filter(id=>id.startsWith('google-')&&getDemoPlaceById(id.slice(7))!==null).length);
   }
  }).catch(()=>undefined);
  getDailyVenueSwipeState().then(d=>{if(alive)setVenueVotes(d.votes);}).catch(()=>undefined);
  getVisitFeedback().then(v=>{if(alive)setVisits(v);}).catch(()=>undefined);
  getDemoEvents().then(e=>{if(alive)setEvents(e);}).catch(()=>undefined);
  getCollections().then(c=>{if(alive)setCollectionCount(c.length);}).catch(()=>undefined);
  return ()=>{alive=false;};
 },[]));

 const dna=getDnaSummary(taste);
 const vibeType=getVibeIdentity(prefs,taste,venueVotes,savedIds,visits,events);
 const display=user?.name?.trim()||'Spotnow member';
 const budget=prefs?.budget?prefs.budget>=60?'60€+':prefs.budget+'€':'—';
 const edit=()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'profile'}});
 const reset=()=>Alert.alert('Reset Vibe DNA?','Θα διαγραφούν οι επιλογές γούστου που έχεις κάνει. Το ημερήσιο όριο των 8 swipes δεν μηδενίζεται.',[
  {text:'Cancel',style:'cancel'},
  {text:'Reset',style:'destructive',onPress:()=>clearTasteFeedback().then(()=>setTaste({})).catch(()=>setError('Δεν έγινε επαναφορά του Vibe DNA.'))}
 ]);
 const chooseAvatar=async(id:VibeAvatarId)=>{
  if(!user||pictureBusy)return;
  setPictureBusy(true);setPictureError('');
  try{const next:ProfilePicture={kind:'avatar',id};
   await saveProfilePicture(user.email,next);setPicture(next);setPictureSheetOpen(false);
  }catch{setPictureError('Δεν αποθηκεύτηκε το avatar. Δοκίμασε ξανά.');}
  finally{setPictureBusy(false);}
 };
 const uploadPhoto=async()=>{
  if(!user||pictureBusy)return;
  setPictureBusy(true);setPictureError('');
  try{
   const picked=await ImagePicker.launchImageLibraryAsync({
    mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:.8
   });
   if(picked.canceled||!picked.assets?.[0])return;
   // Keep a small, cropped JPEG so the photo survives reloads in local AsyncStorage.
   const compressed=await ImageManipulator.manipulateAsync(picked.assets[0].uri,
    [{resize:{width:380}}],
    {compress:.68,format:ImageManipulator.SaveFormat.JPEG,base64:true});
   if(!compressed.base64)throw new Error('Unable to encode photo');
   const next=photoFromBase64(compressed.base64);
   await saveProfilePicture(user.email,next);
   setPicture(next);setPictureSheetOpen(false);
  }catch{setPictureError('Δεν αποθηκεύτηκε η φωτογραφία. Δοκίμασε μια άλλη εικόνα.');}
  finally{setPictureBusy(false);}
 };
 const resetAvatar=async()=>{
  if(!user||pictureBusy)return;
  setPictureBusy(true);setPictureError('');
  try{const next=await resetProfilePicture(user.email);setPicture(next);setPictureSheetOpen(false);}
  catch{setPictureError('Δεν έγινε επαναφορά της φωτογραφίας.');}
  finally{setPictureBusy(false);}
 };
 const logout=async()=>{
  if(busy)return;setBusy(true);setError('');
  try{await clearUser();router.replace('/');}
  catch{setError('Δεν ολοκληρώθηκε η αποσύνδεση.');}
  finally{setBusy(false);}
 };
 return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
  <View style={s.top}>
   <Text style={s.logo}>spot<Text style={{color:Colors.lavender}}>now✳</Text></Text>
   <Pressable onPress={edit} accessibilityRole="button" accessibilityLabel="Επεξεργασία προτιμήσεων" style={s.topAction}>
    <Ionicons name="options-outline" color={Colors.violet} size={21}/>
   </Pressable>
  </View>
  <Text style={s.kicker}>YOUR SPACE, YOUR VIBE</Text>
  <Text style={s.title}>A little more <Text style={{color:Colors.violet}}>you.</Text></Text>
  <Text style={s.subtitle}>Your taste, your places, your way.</Text>

  <LinearGradient colors={Gradients.secondary} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
   <View style={s.identityRow}>
    <Pressable onPress={()=>{setPictureError('');setPictureSheetOpen(true);}}
     accessibilityRole="button" accessibilityLabel="Άλλαξε εικόνα προφίλ" style={s.avatarPress}>
     <VibeAvatar picture={picture} size={66}/>
     <View style={s.avatarEdit}><Ionicons name="camera-outline" size={12} color="#fff"/></View>
    </Pressable>
    <View style={s.heroUser}>
     <Text style={s.userName} numberOfLines={1}>{display}</Text>
     <Text style={s.userEmail} numberOfLines={1}>{user?.email||'Local demo account'}</Text>
     <Text style={s.memberTag}>✳ SPOTNOW MEMBER</Text>
    </View>
   </View>
   <View style={s.vibeIdentityCard}>
    <View style={s.vibeIdentityHead}><Ionicons name="sparkles-outline" size={15} color={Colors.violet}/>
     <Text style={s.vibeIdentityEyebrow}>YOUR VIBE TYPE</Text>
    </View>
    <View style={s.vibeIdentityBody}>
     <View style={s.vibeIdentityCopy}>
      <Text style={s.vibeIdentityTitle} numberOfLines={1}>{vibeType?.title??'discovering'}</Text>
      <Text style={s.vibeIdentitySub}>{vibeType?.subtitle??'Find your vibe with every swipe.'}</Text>
     </View>
     <LinearGradient colors={Gradients.primary} style={s.vibeIdentityIcon}>
      <Ionicons name={vibeType?.icon??'finger-print-outline'} color="#fff" size={26}/>
     </LinearGradient>
    </View>
   </View>
   <View style={s.stats}>
    <Pressable style={s.stat} onPress={()=>router.push('/(tabs)/saved')} accessibilityRole="button" accessibilityLabel="Προβολή αποθηκευμένων">
     <Text style={s.statValue}>{savedCount}</Text><Text style={s.statLabel}>Saved spots</Text>
    </Pressable>
    <View style={s.statDivider}/>
    <Pressable style={s.stat} onPress={()=>router.push('/(tabs)/saved')} accessibilityRole="button" accessibilityLabel="Προβολή συλλογών">
     <Text style={s.statValue}>{collectionCount}</Text><Text style={s.statLabel}>Collections</Text>
    </Pressable>
    <View style={s.statDivider}/>
    <Pressable style={s.stat} onPress={()=>router.push('/(tabs)')} accessibilityRole="button" accessibilityLabel="Πήγαινε στο Taste Swipe">
     <Text style={s.statValue}>{dna.meaningfulCount}</Text><Text style={s.statLabel}>Taste signals</Text>
    </Pressable>
   </View>
  </LinearGradient>

  <View style={s.section}>
   <View><Text style={s.sectionTitle}>Your Vibe DNA</Text><Text style={s.sectionCaption}>A snapshot of your taste.</Text></View>
   <View style={s.sectionSymbol}><Ionicons name="finger-print-outline" color={Colors.violet} size={22}/></View>
  </View>
  <View style={s.dnaCard}>
   <View style={s.dnaHeader}>
    <LinearGradient colors={Gradients.primary} style={s.dnaBadge}><Ionicons name="sparkles" size={21} color="#fff"/></LinearGradient>
    <View style={{flex:1}}>
     <Text style={s.dnaHeadline}>Your taste is evolving ✳</Text>
     <Text style={s.dnaSub}>{dna.meaningfulCount?dna.meaningfulCount+' meaningful swipes so far':'Every swipe helps us learn your vibe.'}</Text>
    </View>
   </View>
   {dna.positives.length?dna.positives.slice(0,4).map(x=><View key={x.tag} style={s.metric}>
    <View style={s.metricHead}><Text style={s.metricName}>{x.label}</Text><Ionicons name="sparkles-outline" size={14} color={Colors.violet}/></View>
    <View style={s.track}><LinearGradient colors={Gradients.primary} start={{x:0,y:0}} end={{x:1,y:0}} style={[s.fill,{width:Math.min(100,Math.max(10,x.weight*48))+'%'}]}/></View>
   </View>):<View style={s.dnaEmpty}>
    <Text style={s.dnaEmptyTitle}>Your vibe starts with a swipe.</Text>
    <Text style={s.dnaSub}>Κάνε μερικά likes στο Vibe Swipe για να δεις ποιες ατμόσφαιρες σου ταιριάζουν.</Text>
   </View>}
   <View style={s.dnaFoot}>
    <Pressable onPress={()=>router.push('/(tabs)')} accessibilityRole="button" style={s.inlineLink}><Text style={s.linkText}>Explore your taste</Text><Ionicons name="arrow-forward" color={Colors.violet} size={16}/></Pressable>
    <Pressable onPress={reset} accessibilityRole="button"><Text style={s.reset}>Reset DNA</Text></Pressable>
   </View>
  </View>

  <View style={s.section}>
   <View><Text style={s.sectionTitle}>My preferences</Text><Text style={s.sectionCaption}>What makes a place feel right.</Text></View>
   <Pressable onPress={edit} accessibilityRole="button" style={s.editPill}><Text style={s.editText}>Edit</Text><Ionicons name="arrow-forward" size={15} color={Colors.violet}/></Pressable>
  </View>
  <View style={s.prefCard}>
   <View style={s.infoRow}>
    <View style={s.prefIcon}><Ionicons name="sparkles-outline" size={20} color={Colors.violet}/></View>
    <View style={s.infoMain}><Text style={s.infoLabel}>Your style</Text>
     <View style={s.preferencePills}>
      {prefs?.moods?.length?prefs.moods.slice(0,3).map(m=><Text key={m} style={s.preferencePill}>{m}</Text>):<Text style={s.infoValue}>Not selected yet</Text>}
     </View>
    </View>
   </View>
   <View style={s.divider}/>
   <View style={s.infoRow}>
    <View style={s.prefIcon}><Ionicons name="location-outline" size={20} color={Colors.violet}/></View>
    <View style={s.infoMain}><Text style={s.infoLabel}>Favorite areas</Text>
     <View style={s.preferencePills}>
      {prefs?.neighborhoods?.length?<>{prefs.neighborhoods.slice(0,2).map(a=><Text key={a} style={s.preferencePill}>{a}</Text>)}
       {prefs.neighborhoods.length>2?<Text style={s.preferencePill}>+{prefs.neighborhoods.length-2}</Text>:null}</>:<Text style={s.infoValue}>Not selected yet</Text>}
     </View>
    </View>
   </View>
   <View style={s.divider}/>
   <View style={s.infoRow}>
    <View style={s.prefIcon}><Ionicons name="wallet-outline" size={20} color={Colors.violet}/></View>
    <View style={s.infoMain}><Text style={s.infoLabel}>Budget per person</Text><Text style={s.budgetPill}>{budget}</Text></View>
   </View>
  </View>

  <Pressable onPress={()=>router.push('/(tabs)/saved')} style={s.savedShortcut} accessibilityRole="button" accessibilityLabel="Άνοιγμα αποθηκευμένων μαγαζιών">
   <View style={s.savedIcon}><Ionicons name="heart-outline" color={Colors.rose} size={23}/></View>
   <View style={{flex:1}}><Text style={s.savedTitle}>Your saved places</Text><Text style={s.savedSub}>Take another look at your favorites.</Text></View>
   <Ionicons name="arrow-forward" color={Colors.violet} size={21}/>
  </Pressable>

  <View style={s.section}><Text style={s.sectionTitle}>Account</Text></View>
  <Pressable disabled={busy} onPress={logout} accessibilityRole="button" style={({pressed})=>[s.logout,pressed&&{opacity:.75}]}>
   <Ionicons name="log-out-outline" size={20} color={Colors.danger}/>
   <Text style={s.logoutText}>{busy?'Signing out…':'Log out'}</Text>
   <Ionicons name="chevron-forward" size={18} color={Colors.muted}/>
  </Pressable>
  {error?<Text style={s.error}>{error}</Text>:null}
  <Text style={s.foot}>Demo profile · Preferences are stored on this device only.</Text>
  <ProfilePictureSheet visible={pictureSheetOpen} picture={picture} busy={pictureBusy}
   error={pictureError} onClose={()=>{if(!pictureBusy)setPictureSheetOpen(false);}}
   onSelect={chooseAvatar} onUpload={uploadPhoto} onReset={resetAvatar}/>
 </ScrollView>;
}

const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:98},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:26},
 logo:{fontSize:31,fontWeight:'900',letterSpacing:-1.7,color:Colors.text},
 topAction:{height:42,width:42,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border},
 kicker:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1.5,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:41},
 subtitle:{fontSize:14,color:Colors.muted,marginTop:7,marginBottom:20},
 hero:{borderRadius:Radius.lg,borderWidth:1,borderColor:Colors.border,padding:18,marginBottom:5},
 identityRow:{flexDirection:'row',alignItems:'center',gap:13},
 avatarPress:{height:72,width:72,justifyContent:'center',alignItems:'center'},
 avatarEdit:{position:'absolute',right:0,bottom:0,height:25,width:25,backgroundColor:Colors.violet,
  borderRadius:9,borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'},
 heroUser:{flex:1},userName:{fontSize:22,fontWeight:'900',color:Colors.text,letterSpacing:-.5},
 userEmail:{fontSize:12,color:Colors.muted,marginTop:5},
 memberTag:{fontSize:10,color:Colors.violet,letterSpacing:.8,fontWeight:'900',marginTop:9},
 vibeIdentityCard:{marginTop:19,backgroundColor:'rgba(255,255,255,.86)',borderRadius:20,
  borderWidth:1,borderColor:'rgba(91,71,214,.10)',paddingHorizontal:17,paddingVertical:16},
 vibeIdentityHead:{flexDirection:'row',alignItems:'center',gap:7},
 vibeIdentityEyebrow:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1.3},
 vibeIdentityBody:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,marginTop:9},
 vibeIdentityCopy:{flex:1},
 vibeIdentityTitle:{color:Colors.text,fontWeight:'900',fontSize:29,letterSpacing:-.9,lineHeight:35},
 vibeIdentitySub:{fontSize:12,color:Colors.muted,marginTop:3},
 vibeIdentityIcon:{height:53,width:53,borderRadius:17,alignItems:'center',justifyContent:'center'},

 stats:{marginTop:20,borderRadius:17,backgroundColor:'rgba(255,255,255,.75)',flexDirection:'row',paddingVertical:13,alignItems:'center'},
 stat:{flex:1,alignItems:'center',gap:4},statValue:{fontSize:24,fontWeight:'900',color:Colors.violet},
 statLabel:{color:Colors.muted,fontSize:11,fontWeight:'800'},
 statDivider:{height:29,width:1,backgroundColor:Colors.border},
 section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9,marginTop:26,marginBottom:14},
 sectionTitle:{color:Colors.text,fontSize:Type.section,fontWeight:'900',letterSpacing:-.5},
 sectionCaption:{color:Colors.muted,fontSize:11,marginTop:5},
 sectionSymbol:{height:34,width:34,borderRadius:12,backgroundColor:Colors.cardSoft,alignItems:'center',justifyContent:'center'},
 dnaCard:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.lg,padding:18},
 dnaHeader:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:17},
 dnaBadge:{height:44,width:44,borderRadius:15,alignItems:'center',justifyContent:'center'},
 dnaHeadline:{color:Colors.text,fontSize:15,fontWeight:'900'},dnaSub:{color:Colors.muted,fontSize:12,lineHeight:19,marginTop:5},
 metric:{marginBottom:14,gap:8},metricHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 metricName:{fontSize:13,color:Colors.text,fontWeight:'700'},
 track:{height:7,borderRadius:99,backgroundColor:'#EEE8FF',overflow:'hidden'},
 fill:{height:'100%',borderRadius:99},
 dnaEmpty:{borderRadius:15,backgroundColor:Colors.cardSoft,padding:15,marginBottom:8},
 dnaEmptyTitle:{fontSize:14,fontWeight:'900',color:Colors.text},
 dnaFoot:{marginTop:7,paddingTop:15,borderTopWidth:1,borderTopColor:Colors.border,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 inlineLink:{flexDirection:'row',alignItems:'center',gap:6},linkText:{color:Colors.violet,fontSize:12,fontWeight:'900'},
 reset:{color:Colors.muted,fontSize:11,fontWeight:'800'},
 editPill:{backgroundColor:Colors.cardSoft,paddingHorizontal:13,paddingVertical:9,borderRadius:Radius.pill,flexDirection:'row',alignItems:'center',gap:5},
 editText:{color:Colors.violet,fontWeight:'900',fontSize:12},
 prefCard:{backgroundColor:'#fff',borderRadius:Radius.lg,borderWidth:1,borderColor:Colors.border,paddingHorizontal:17,paddingVertical:11},
 infoRow:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:11},
 prefIcon:{height:43,width:43,borderRadius:13,backgroundColor:Colors.cardSoft,alignItems:'center',justifyContent:'center'},
 infoMain:{flex:1},infoLabel:{color:Colors.muted,fontSize:12,fontWeight:'700'},
 infoValue:{color:Colors.text,fontSize:13,fontWeight:'700',marginTop:6},
 preferencePills:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:8},
 preferencePill:{color:Colors.violet,fontSize:12,fontWeight:'800',backgroundColor:Colors.cardSoft,paddingHorizontal:11,paddingVertical:7,borderRadius:Radius.pill,overflow:'hidden'},
 budgetPill:{color:Colors.violet,fontSize:12,fontWeight:'900',backgroundColor:Colors.cardSoft,alignSelf:'flex-start',paddingHorizontal:12,paddingVertical:8,borderRadius:Radius.pill,overflow:'hidden',marginTop:7},
 divider:{height:1,backgroundColor:Colors.border,marginVertical:3},
 savedShortcut:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.lg,padding:14,marginTop:15},
 savedIcon:{height:47,width:47,borderRadius:15,backgroundColor:'#FDF1F9',alignItems:'center',justifyContent:'center'},
 savedTitle:{fontSize:14,fontWeight:'900',color:Colors.text},
 savedSub:{fontSize:11,color:Colors.muted,marginTop:4},
 logout:{flexDirection:'row',alignItems:'center',gap:12,minHeight:57,paddingHorizontal:17,backgroundColor:'#fff',borderRadius:Radius.md,borderWidth:1,borderColor:Colors.border},
 logoutText:{flex:1,color:Colors.danger,fontSize:14,fontWeight:'800'},
 error:{color:Colors.danger,marginTop:12,fontSize:12},
 foot:{color:Colors.muted,fontSize:11,textAlign:'center',marginTop:23}
});

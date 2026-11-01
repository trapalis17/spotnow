import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../../components/PrimaryButton';
import { Colors, Gradients, Spacing } from '../../constants/theme';
import { clearUser, getPreferences, getUser, getTasteFeedback, clearTasteFeedback } from '../../lib/storage';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import type { UserPreferences, UserProfile } from '../../types';

export default function ProfileScreen(){
 const router=useRouter();
 const [user,setUser]=useState<UserProfile|null>(null);
 const [prefs,setPrefs]=useState<UserPreferences|null>(null);
 const [taste,setTaste]=useState<TasteFeedback>({});
 const [signingOut,setSigningOut]=useState(false);
 const [logoutError,setLogoutError]=useState('');
 useFocusEffect(useCallback(()=>{
  getUser().then(setUser).catch(()=>undefined);
  getPreferences().then(setPrefs).catch(()=>undefined);
  getTasteFeedback().then(setTaste).catch(()=>undefined);
 },[]));
 const display=user?.name||'Vibe explorer';
 const dna=getDnaSummary(taste);
 const logout=async()=>{
  if(signingOut)return;
  setSigningOut(true);setLogoutError('');
  try{
   // Clear the demo session, not the saved profile or swipe data.
   await clearUser();
   router.replace('/');
  }catch{setLogoutError('Η αποσύνδεση δεν ολοκληρώθηκε. Δοκίμασε ξανά.');}
  finally{setSigningOut(false);}
 };
 return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
  <Text style={styles.title}>Το προφίλ σου.</Text>
  <LinearGradient colors={Gradients.hero} style={styles.hero}>
    <View style={styles.avatar}><Text style={styles.avatarText}>{display.slice(0,1).toUpperCase()}</Text></View>
    <Text style={styles.name}>{display}</Text>
    <Text style={styles.email}>{user?.email||'Demo profile'}</Text>
  </LinearGradient>
  <View style={styles.card}>
   <View style={styles.row}><Ionicons name="sparkles" size={23} color={Colors.violet}/><Text style={styles.heading}>Το δικό σου vibe</Text></View>
   <View style={styles.chips}>{(prefs?.moods??[]).map(m=><Text key={m} style={styles.chip}>{m}</Text>)}</View>
   <View style={styles.divider}/>
   <View style={styles.row}><Ionicons name="location-outline" size={21} color={Colors.violet}/>
    <Text style={styles.areas}>{prefs?.neighborhoods?.length?prefs.neighborhoods.join(' · '):'Δεν έχεις επιλέξει περιοχές'}</Text>
   </View>
  </View>
  <View style={styles.card}>
   <View style={styles.row}><Ionicons name="finger-print-outline" size={24} color={Colors.violet}/><Text style={styles.heading}>Your Vibe DNA</Text></View>
   <Text style={styles.dnaSubtitle}>{dna.meaningfulCount} taste signals · Προφίλ προτιμήσεων, όχι αξιολόγηση προσωπικότητας</Text>
   {dna.positives.length?dna.positives.map(x=><View style={styles.dnaRow} key={x.tag}><Text style={styles.dnaName}>{x.label}</Text><View style={styles.dnaTrack}><View style={[styles.dnaFill,{width:(Math.min(100,Math.max(5,x.weight*45))+'%') as any}]}/></View></View>):<Text style={styles.dnaSubtitle}>Κάνε Taste Swipe στο Ανακάλυψε για να ξεκινήσει το Vibe DNA.</Text>}
   <Pressable onPress={()=>{clearTasteFeedback().then(()=>setTaste({})).catch(()=>undefined);}} style={{marginTop:18}} accessibilityRole="button"><Text style={{color:Colors.violet,fontWeight:'800'}}>Reset Vibe DNA</Text></Pressable>
  </View>
  <PrimaryButton label="Άλλαξε τις προτιμήσεις σου" onPress={()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'profile'}})}/>
  <View style={{height:12}}/>
  <SecondaryButton label={signingOut?'Αποσύνδεση…':'Αποσύνδεση'} onPress={logout}/>
  {logoutError?<Text style={styles.logoutError}>{logoutError}</Text>:null}
  <Text style={styles.foot}>Το προφίλ είναι demo και αποθηκεύεται τοπικά, όχι σε online λογαριασμό.</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
 dnaSubtitle:{fontSize:12,color:Colors.muted,lineHeight:19,marginTop:14},
 dnaRow:{marginTop:15,gap:6},dnaName:{fontSize:13,color:Colors.text,fontWeight:'700'},
 dnaTrack:{height:7,backgroundColor:'#F0EAFB',borderRadius:20,overflow:'hidden'},
 dnaFill:{height:'100%',backgroundColor:Colors.violet,borderRadius:20},
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:39,paddingBottom:60},
 title:{fontSize:34,color:Colors.text,fontWeight:'900',letterSpacing:-1.3,marginBottom:24},
 hero:{borderRadius:26,padding:23,minHeight:235,justifyContent:'center',marginBottom:21},
 avatar:{height:68,width:68,borderRadius:21,backgroundColor:Colors.limeSoft,alignItems:'center',justifyContent:'center',marginBottom:15},
 avatarText:{color:Colors.text,fontSize:30,fontWeight:'900'},
 name:{color:'#fff',fontSize:28,fontWeight:'900',letterSpacing:-1},
 email:{color:'rgba(255,255,255,.90)',fontSize:14,marginTop:7},
 card:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:23,padding:20,marginBottom:22},
 row:{flexDirection:'row',alignItems:'center',gap:10},
 heading:{color:Colors.text,fontSize:19,fontWeight:'900'},
 chips:{marginTop:17,flexDirection:'row',flexWrap:'wrap',gap:8},
 chip:{backgroundColor:'#EDF6E8',color:Colors.lime,fontSize:12,fontWeight:'800',borderRadius:999,paddingHorizontal:13,paddingVertical:10},
 divider:{height:1,backgroundColor:Colors.border,marginVertical:18},
 areas:{color:Colors.text,fontSize:13,flex:1,lineHeight:21},
 foot:{color:Colors.muted,fontSize:11,textAlign:'center',marginTop:19,lineHeight:17},
 logoutError:{color:Colors.danger,fontSize:12,textAlign:'center',marginTop:12}
});

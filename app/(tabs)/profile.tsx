import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../../components/PrimaryButton';
import { Colors, Gradients, Spacing } from '../../constants/theme';
import { clearUser, getPreferences, getUser } from '../../lib/storage';
import type { UserPreferences, UserProfile } from '../../types';

export default function ProfileScreen(){
 const router=useRouter();
 const [user,setUser]=useState<UserProfile|null>(null);
 const [prefs,setPrefs]=useState<UserPreferences|null>(null);
 const [signingOut,setSigningOut]=useState(false);
 const [logoutError,setLogoutError]=useState('');
 useFocusEffect(useCallback(()=>{
  getUser().then(setUser).catch(()=>undefined);
  getPreferences().then(setPrefs).catch(()=>undefined);
 },[]));
 const display=user?.name||'Vibe explorer';
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
  <PrimaryButton label="Άλλαξε τις προτιμήσεις σου" onPress={()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'profile'}})}/>
  <View style={{height:12}}/>
  <SecondaryButton label={signingOut?'Αποσύνδεση…':'Αποσύνδεση'} onPress={logout}/>
  {logoutError?<Text style={styles.logoutError}>{logoutError}</Text>:null}
  <Text style={styles.foot}>Το προφίλ είναι demo και αποθηκεύεται τοπικά, όχι σε online λογαριασμό.</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
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

import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {clearUser,getPreferences,getUser,getTasteFeedback,clearTasteFeedback} from '../../lib/storage';
import {getDnaSummary,type TasteFeedback} from '../../lib/vibe-dna';
import type {UserPreferences,UserProfile} from '../../types';

export default function ProfileScreen(){
 const router=useRouter();
 const [user,setUser]=useState<UserProfile|null>(null);
 const [prefs,setPrefs]=useState<UserPreferences|null>(null);
 const [taste,setTaste]=useState<TasteFeedback>({});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 useFocusEffect(useCallback(()=>{
  getUser().then(setUser).catch(()=>undefined);
  getPreferences().then(setPrefs).catch(()=>undefined);
  getTasteFeedback().then(setTaste).catch(()=>undefined);
 },[]));
 const dna=getDnaSummary(taste);
 const display=user?.name||'Vibe explorer';
 const logout=async()=>{if(busy)return;setBusy(true);setError('');try{await clearUser();router.replace('/');}catch{setError('Δεν ολοκληρώθηκε η αποσύνδεση.');}finally{setBusy(false);}};
 const budget=prefs?.budget?prefs.budget>=60?'60€+':prefs.budget+'€':'—';
 return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
  <View style={s.top}><Text style={s.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text><Ionicons name="settings-outline" color={Colors.violet} size={22}/></View>
  <Text style={s.kicker}>MADE PERSONAL</Text><Text style={s.title}>Your<Text style={{color:Colors.violet}}> profile.</Text></Text>
  <LinearGradient colors={Gradients.hero} style={s.hero}>
   <View style={s.avatar}><Text style={s.initial}>{display.slice(0,1).toUpperCase()}</Text></View>
   <View style={s.heroUser}><Text style={s.userName} numberOfLines={1}>{display}</Text><Text style={s.userEmail} numberOfLines={1}>{user?.email||'Local demo account'}</Text></View>
  </LinearGradient>
  <View style={s.section}><Text style={s.sectionTitle}>Your Vibe DNA</Text><Ionicons name="finger-print-outline" color={Colors.violet} size={21}/></View>
  <View style={s.card}>
   <View style={s.dnaHeader}><Text style={s.dnaHighlight}>{dna.meaningfulCount}</Text><View><Text style={s.dnaLead}>taste signals</Text><Text style={s.dnaSub}>Το γούστο σου εξελίσσεται με κάθε swipe.</Text></View></View>
   {dna.positives.length?dna.positives.slice(0,4).map(x=><View key={x.tag} style={s.metric}><Text style={s.metricName}>{x.label}</Text><View style={s.track}><View style={[s.fill,{width:Math.min(100,Math.max(10,x.weight*48))+'%'}]}/></View></View>):<View style={s.dnaEmpty}><Text style={s.dnaSub}>Δεν υπάρχουν ακόμη αρκετά swipes για να εμφανίσουμε τις αγαπημένες σου προτιμήσεις.</Text></View>}
   <View style={s.dnaFoot}><Pressable onPress={()=>router.push('/(tabs)')} accessibilityRole="button" style={s.inlineLink}><Text style={s.linkText}>Teach Vibe your taste</Text><Ionicons name="arrow-forward" color={Colors.violet} size={16}/></Pressable><Pressable onPress={()=>clearTasteFeedback().then(()=>setTaste({})).catch(()=>undefined)} accessibilityRole="button"><Text style={s.reset}>Reset DNA</Text></Pressable></View>
  </View>
  <View style={s.section}><Text style={s.sectionTitle}>Preferences</Text><Pressable onPress={()=>router.push({pathname:'/onboarding',params:{mode:'edit',from:'profile'}})} accessibilityRole="button"><Text style={s.edit}>Edit <Ionicons name="arrow-forward" size={14}/></Text></Pressable></View>
  <View style={s.prefCard}>
   <View style={s.infoRow}><View style={s.prefIcon}><Ionicons name="sparkles-outline" color={Colors.violet} size={19}/></View><View style={s.infoMain}><Text style={s.infoLabel}>Your style</Text><View style={s.preferencePills}>{prefs?.moods?.length?prefs.moods.slice(0,3).map(m=><Text key={m} style={s.preferencePill}>{m}</Text>):<Text style={s.infoValue}>Not selected</Text>}</View></View></View>
   <View style={s.divider}/>
   <View style={s.infoRow}><View style={s.prefIcon}><Ionicons name="location-outline" color={Colors.violet} size={19}/></View><View style={s.infoMain}><Text style={s.infoLabel}>Your areas</Text><View style={s.preferencePills}>{prefs?.neighborhoods?.length?<>{prefs.neighborhoods.slice(0,2).map(a=><Text key={a} style={s.preferencePill}>{a}</Text>)}{prefs.neighborhoods.length>2?<Text style={s.preferencePill}>+{prefs.neighborhoods.length-2}</Text>:null}</>:<Text style={s.infoValue}>Not selected</Text>}</View></View></View>
   <View style={s.divider}/>
   <View style={s.infoRow}><View style={s.prefIcon}><Ionicons name="wallet-outline" color={Colors.violet} size={19}/></View><View style={s.infoMain}><Text style={s.infoLabel}>Budget per person</Text><Text style={s.budgetPill}>{budget}</Text></View></View>
  </View>
  <View style={s.section}><Text style={s.sectionTitle}>Account</Text></View>
  <Pressable onPress={logout} accessibilityRole="button" style={({pressed})=>[s.logout,pressed&&{opacity:.75}]}><Ionicons name="log-out-outline" size={20} color={Colors.danger}/><Text style={s.logoutText}>{busy?'Signing out…':'Log out'}</Text><Ionicons name="chevron-forward" color={Colors.muted} size={19}/></Pressable>
  {error?<Text style={s.error}>{error}</Text>:null}
  <Text style={s.foot}>Demo account · Preferences stored on this device only.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:98},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:26},
 logo:{fontSize:31,fontWeight:'900',letterSpacing:-1.7,color:Colors.text},
 kicker:{color:Colors.violet,fontSize:10,fontWeight:'900',letterSpacing:1.5,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:41,marginBottom:20},
 hero:{minHeight:127,flexDirection:'row',alignItems:'center',padding:20,borderRadius:Radius.lg,gap:15,marginBottom:14},
 avatar:{width:61,height:61,borderRadius:20,backgroundColor:'rgba(255,255,255,.20)',borderWidth:1,borderColor:'rgba(255,255,255,.3)',alignItems:'center',justifyContent:'center'},
 initial:{fontSize:28,fontWeight:'900',color:'#fff'},
 heroUser:{flex:1},userName:{fontSize:24,color:'#fff',fontWeight:'900'},userEmail:{fontSize:12,color:'rgba(255,255,255,.88)',marginTop:7},
 section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:24,marginBottom:13},
 sectionTitle:{fontSize:Type.section,fontWeight:'900',color:Colors.text,letterSpacing:-.5},edit:{color:Colors.violet,fontSize:13,fontWeight:'800'},
 card:{borderRadius:Radius.lg,backgroundColor:'#fff',borderColor:Colors.border,borderWidth:1,padding:19},
 dnaHeader:{flexDirection:'row',alignItems:'center',gap:13,marginBottom:18},
 dnaHighlight:{fontSize:43,color:Colors.violet,fontWeight:'900',letterSpacing:-2},
 dnaLead:{fontSize:14,color:Colors.text,fontWeight:'900'},
 dnaSub:{color:Colors.muted,fontSize:12,lineHeight:19,marginTop:3},
 metric:{marginBottom:14,gap:7},metricName:{fontSize:13,color:Colors.text,fontWeight:'700'},
 track:{backgroundColor:'#F1EDFA',borderRadius:12,height:7,overflow:'hidden'},
 fill:{backgroundColor:Colors.violet,height:'100%',borderRadius:12},
 dnaEmpty:{paddingVertical:10},dnaFoot:{marginTop:9,paddingTop:16,borderTopWidth:1,borderTopColor:Colors.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:9},
 inlineLink:{flexDirection:'row',alignItems:'center',gap:7},linkText:{fontSize:12,color:Colors.violet,fontWeight:'900'},reset:{fontSize:11,color:Colors.muted,fontWeight:'800'},
 prefCard:{borderRadius:Radius.lg,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,paddingHorizontal:18,paddingVertical:14},
 infoRow:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:9},
 prefIcon:{width:42,height:42,backgroundColor:'#F1EBFF',borderRadius:13,alignItems:'center',justifyContent:'center'},
 infoMain:{flex:1},infoLabel:{fontSize:12,color:Colors.muted},infoValue:{color:Colors.text,fontWeight:'800',fontSize:14,marginTop:3,lineHeight:20},
 preferencePills:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:7},
 preferencePill:{fontSize:12,fontWeight:'800',color:Colors.violet,backgroundColor:'#F1EBFF',paddingHorizontal:12,paddingVertical:7,borderRadius:Radius.pill,overflow:'hidden'},
 budgetPill:{alignSelf:'flex-start',marginTop:7,fontSize:13,fontWeight:'900',color:Colors.violet,backgroundColor:'#F1EBFF',paddingHorizontal:15,paddingVertical:8,borderRadius:Radius.pill,overflow:'hidden'},
 divider:{height:1,backgroundColor:Colors.border,marginVertical:5},
 logout:{flexDirection:'row',alignItems:'center',gap:12,minHeight:57,paddingHorizontal:18,backgroundColor:'#fff',borderRadius:Radius.md,borderWidth:1,borderColor:Colors.border},
 logoutText:{flex:1,color:Colors.danger,fontSize:14,fontWeight:'800'},
 error:{color:Colors.danger,marginTop:12},foot:{color:Colors.muted,fontSize:11,textAlign:'center',marginTop:23}
});

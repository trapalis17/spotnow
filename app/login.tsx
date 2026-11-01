import {useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PrimaryButton,SecondaryButton} from '../components/PrimaryButton';
import {Colors,Spacing,Radius,Type} from '../constants/theme';
import {getDemoAccount,getPreferences,setUser} from '../lib/storage';

export default function LoginScreen(){
 const router=useRouter();
 const [email,setEmail]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;getDemoAccount().then(account=>{if(active&&account)setEmail(account.email);}).catch(()=>undefined);return ()=>{active=false;};},[]);
 const login=async()=>{
  if(busy)return;const input=email.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)){setError('Βάλε ένα έγκυρο email.');return;}
  setBusy(true);setError('');
  try{
   const [account,preferences]=await Promise.all([getDemoAccount(),getPreferences()]);
   if(account&&account.email.toLowerCase()!==input.toLowerCase()){setError('Αυτό το demo προφίλ έχει διαφορετικό email.');return;}
   await setUser({name:account?.name||input.split('@')[0],email:account?.email||input,preferences});
   router.replace('/(tabs)');
  }catch{setError('Δεν ολοκληρώθηκε η είσοδος. Προσπάθησε ξανά.');}finally{setBusy(false);}
 };
 return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
  <View style={s.top}><Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text></View>
  <Pressable onPress={()=>router.back()} style={s.back} accessibilityRole="button"><Ionicons name="arrow-back" color={Colors.violet} size={18}/><Text style={s.backText}>Back</Text></Pressable>
  <View style={s.icon}><Ionicons name="person-outline" size={27} color={Colors.violet}/></View>
  <Text style={s.kicker}>WELCOME BACK</Text>
  <Text style={s.title}>Back to your<Text style={{color:Colors.violet}}> vibe.</Text></Text>
  <Text style={s.sub}>Your favorite places are waiting.</Text>
  <Text style={s.label}>Email address</Text>
  <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholderTextColor={Colors.subtle}/>
  <View style={s.note}><Ionicons name="information-circle-outline" size={19} color={Colors.violet}/><Text style={s.noteText}>Demo login με email μόνο. Δεν υπάρχει ακόμη πραγματικός έλεγχος λογαριασμού.</Text></View>
  {error?<Text style={s.error}>{error}</Text>:null}
  <PrimaryButton label={busy?'Signing in…':'Continue'} onPress={login}/>
  <View style={s.footer}><SecondaryButton label="Create a new profile" onPress={()=>router.push('/onboarding')}/></View>
  <Text style={s.foot}>Local interactive prototype · No password required</Text>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{flexGrow:1,paddingHorizontal:Spacing.lg,paddingTop:32,paddingBottom:37,justifyContent:'center'},
 top:{marginBottom:34},brand:{fontSize:34,fontWeight:'900',letterSpacing:-1.8,color:Colors.text},
 back:{alignSelf:'flex-start',paddingVertical:12,flexDirection:'row',gap:6,alignItems:'center',marginBottom:27},
 backText:{fontSize:13,fontWeight:'800',color:Colors.violet},
 icon:{width:55,height:55,backgroundColor:'#EDE7FB',borderRadius:18,alignItems:'center',justifyContent:'center',marginBottom:20},
 kicker:{fontSize:10,color:Colors.violet,fontWeight:'900',letterSpacing:1.4,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',letterSpacing:-1.3,lineHeight:41,color:Colors.text},
 sub:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:10,marginBottom:28},
 label:{fontSize:12,fontWeight:'800',color:Colors.text,marginBottom:8},
 input:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.md,paddingHorizontal:16,minHeight:54,fontSize:15,color:Colors.text,marginBottom:18},
 note:{backgroundColor:'#F8EEE8',padding:14,borderRadius:14,flexDirection:'row',alignItems:'flex-start',gap:8,marginBottom:20},
 noteText:{flex:1,fontSize:12,color:Colors.muted,lineHeight:19},
 error:{fontSize:12,color:Colors.danger,marginBottom:14},
 footer:{marginTop:18},foot:{fontSize:11,color:Colors.muted,textAlign:'center',marginTop:24}
});
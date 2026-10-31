import { useRouter } from 'expo-router';
import { useEffect,useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';
import { Colors, Spacing } from '../constants/theme';
import { getUser } from '../lib/storage';

const steps=[
 {num:1,title:'Διάλεξε τι θέλεις',sub:'Καφέ, φαγητό ή ποτό',icon:'cafe-outline' as const},
 {num:2,title:'Βρες την περιοχή σου',sub:'Κοντά σου ή όπου θες',icon:'location-outline' as const},
 {num:3,title:'Πήγαινε στο spot σου',sub:'Προτάσεις που σου ταιριάζουν',icon:'navigate-outline' as const},
];
export default function WelcomeScreen(){
 const router=useRouter();
 const [checking,setChecking]=useState(true);
 useEffect(()=>{getUser().then(user=>{if(user)router.replace('/(tabs)');else setChecking(false);}).catch(()=>setChecking(false));},[router]);
 if(checking)return <View style={styles.loading}><ActivityIndicator color={Colors.violet}/></View>;
 return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
   <Text style={styles.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
   <LinearGradient colors={['#6A50CD','#AA58BA','#D06A93']} style={styles.hero}>
    <Ionicons name="sparkles" size={82} color="rgba(255,255,255,.25)" style={styles.heroIcon}/>
    <Text style={styles.title}>Το επόμενο αγαπημένο σου μέρος.</Text>
    <Text style={styles.sub}>Χωρίς ψάξιμο. Χωρίς άπειρο scrolling.</Text>
   </LinearGradient>
   <View style={styles.list}>
    {steps.map(s=><View key={s.num} style={styles.item}>
      <View style={styles.stepIcon}><Ionicons name={s.icon} size={24} color={Colors.violet}/></View>
      <View style={styles.info}><Text style={styles.itemTitle}>{s.num}. {s.title}</Text><Text style={styles.itemSub}>{s.sub}</Text></View>
    </View>)}
   </View>
   <PrimaryButton label="Ξεκίνα τώρα  ↗" onPress={()=>router.push('/onboarding')}/>
   <View style={{height:10}}/>
   <SecondaryButton label="Έχω ήδη προφίλ" onPress={()=>router.push('/login')}/>
   <Text style={styles.foot}>Προεπισκόπηση εφαρμογής · Demo λογαριασμοί</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
 loading:{flex:1,justifyContent:'center',backgroundColor:Colors.background},
 screen:{backgroundColor:Colors.background,flex:1},
 content:{flexGrow:1,paddingHorizontal:Spacing.xl,paddingTop:40,paddingBottom:33,justifyContent:'space-between'},
 logo:{fontSize:37,color:Colors.text,fontWeight:'900',letterSpacing:-2,marginBottom:22},
 hero:{borderRadius:28,minHeight:240,padding:24,justifyContent:'flex-end',overflow:'hidden'},
 heroIcon:{position:'absolute',right:-10,top:4,transform:[{rotate:'-15deg'}]},
 title:{color:'#fff',fontWeight:'900',fontSize:34,lineHeight:39,letterSpacing:-1},
 sub:{color:'rgba(255,255,255,.93)',fontSize:14,marginTop:12,lineHeight:22},
 list:{marginVertical:20,gap:11},
 item:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:18,flexDirection:'row',alignItems:'center',gap:13,padding:14},
 stepIcon:{width:46,height:46,borderRadius:14,backgroundColor:'#EFEAFF',alignItems:'center',justifyContent:'center'},
 info:{flex:1},
 itemTitle:{fontSize:16,fontWeight:'900',color:Colors.text},
 itemSub:{fontSize:12,color:Colors.muted,marginTop:4},
 foot:{fontSize:11,color:Colors.muted,textAlign:'center',marginTop:18},
});

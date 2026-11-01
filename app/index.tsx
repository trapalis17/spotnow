import {useRouter} from 'expo-router';
import {useEffect,useState} from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {PrimaryButton,SecondaryButton} from '../components/PrimaryButton';
import {Colors,Gradients,Spacing,Radius,Type} from '../constants/theme';
import {getUser} from '../lib/storage';

export default function WelcomeScreen(){
 const router=useRouter();const [checking,setChecking]=useState(true);
 useEffect(()=>{getUser().then(x=>{if(x)router.replace('/(tabs)');else setChecking(false);}).catch(()=>setChecking(false));},[router]);
 if(checking)return <View style={s.loading}><ActivityIndicator color={Colors.violet}/></View>;
 return <ScrollView style={s.page} contentContainerStyle={s.content}>
  <View style={s.brandRow}><Text style={s.brand}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text><Text style={s.demoLabel}>PREVIEW 2.0</Text></View>
  <View style={s.center}>
   <LinearGradient colors={Gradients.hero} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
    <View style={s.orb}/><View style={s.heroSymbol}><Ionicons name="sparkles-outline" size={31} color="#fff"/></View>
    <Text style={s.heroEyebrow}>NOT JUST ANOTHER PLACES APP</Text>
    <Text style={s.heroTitle}>Find places that<Text style={{color:'#F2F7D7'}}> feel like you.</Text></Text>
    <Text style={s.heroBody}>Discover cafés, bars & restaurants that match your vibe.</Text>
   </LinearGradient>
   <View style={s.benefits}>
    <View style={s.benefit}><View style={s.benefitIcon}><Ionicons name="finger-print-outline" color={Colors.violet} size={20}/></View><View style={s.benefitText}><Text style={s.benefitTitle}>Your taste, your picks</Text><Text style={s.benefitDetail}>Recommendations that evolve with you</Text></View></View>
    <View style={s.benefit}><View style={s.benefitIcon}><Ionicons name="heart-outline" color={Colors.violet} size={20}/></View><View style={s.benefitText}><Text style={s.benefitTitle}>Swipe. Discover. Save.</Text><Text style={s.benefitDetail}>Keep the spots worth remembering</Text></View></View>
   </View>
  </View>
  <View style={s.actions}>
   <PrimaryButton label="Get started" onPress={()=>router.push('/onboarding')}/>
   <View style={{height:11}}/><SecondaryButton label="I already have an account" onPress={()=>router.push('/login')}/>
   <Text style={s.foot}>Interactive frontend demo · No real account or booking</Text>
  </View>
 </ScrollView>;
}
const s=StyleSheet.create({
 loading:{flex:1,backgroundColor:Colors.background,justifyContent:'center',alignItems:'center'},
 page:{flex:1,backgroundColor:Colors.background},content:{flexGrow:1,paddingHorizontal:Spacing.lg,paddingTop:32,paddingBottom:35,justifyContent:'space-between'},
 brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:28},
 brand:{fontSize:35,fontWeight:'900',letterSpacing:-1.9,color:Colors.text},
 demoLabel:{fontSize:10,color:Colors.violet,fontWeight:'900',letterSpacing:1.2},
 center:{flex:1,justifyContent:'center'},
 hero:{borderRadius:Radius.xl,minHeight:342,overflow:'hidden',padding:26,justifyContent:'flex-end'},
 orb:{position:'absolute',width:320,height:320,borderRadius:160,right:-120,top:-115,borderWidth:60,borderColor:'rgba(255,255,255,.12)'},
 heroSymbol:{backgroundColor:'rgba(255,255,255,.22)',width:60,height:60,borderRadius:19,alignItems:'center',justifyContent:'center',marginBottom:37},
 heroEyebrow:{fontSize:10,fontWeight:'900',color:'rgba(255,255,255,.91)',letterSpacing:1.1,marginBottom:12},
 heroTitle:{fontSize:37,fontWeight:'900',color:'#fff',letterSpacing:-1.5,lineHeight:43},
 heroBody:{fontSize:14,color:'rgba(255,255,255,.90)',lineHeight:22,marginTop:14},
 benefits:{paddingVertical:21,gap:17},
 benefit:{flexDirection:'row',alignItems:'center',gap:12},
 benefitIcon:{backgroundColor:'#F0EAFE',width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'},
 benefitText:{flex:1},benefitTitle:{fontSize:14,fontWeight:'900',color:Colors.text},benefitDetail:{fontSize:12,color:Colors.muted,marginTop:4},
 actions:{marginTop:18},foot:{fontSize:11,color:Colors.muted,textAlign:'center',marginTop:21}
});

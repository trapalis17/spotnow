import {useLocalSearchParams,useRouter} from 'expo-router';
import {useEffect,useRef,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PreferenceChip} from '@/components/PreferenceChip';
import {OnboardingLocationPreferences} from '@/components/OnboardingLocationPreferences';
import {canonicalArea,NEIGHBORHOODS} from '@/lib/attica-neighborhoods';
import {Colors,Spacing,Radius,Type} from '@/constants/theme';
import {defaultPreferences,getPreferences,getUser,setOnboarded,setPreferences} from '@/lib/storage';

const moods=['cozy','romantic','quiet','lively','creative','social'];
const outings=['coffee with friends','date night','brunch','night out','study session','casual drinks'];
const budgets=[5,10,20,40,60] as const;
const allowed=new Set(NEIGHBORHOODS.map(x=>x.name));
const validAreas=(xs:string[])=>[...new Set(xs.map(canonicalArea).filter(x=>allowed.has(x)))];
const validBudget=(v:number)=>v>=60?60:v>=40?40:v>=20?20:v>=10?10:5;
const steps=[
 {headline:'What’s your vibe?',sub:'Διάλεξε όσα σε εκφράζουν.',label:'YOUR TASTE'},
 {headline:'How do you go out?',sub:'Τι σου αρέσει να κάνεις όταν βγαίνεις;',label:'YOUR PLANS'},
 {headline:'Where & how much?',sub:'Λίγες τελευταίες επιλογές και είσαι έτοιμος.',label:'YOUR PLACES'}
];
export default function OnboardingScreen(){
 const router=useRouter();
 const params=useLocalSearchParams<{mode?:string;from?:string}>();
 const editing=params.mode==='edit';
 const returnTo=params.from==='for-you'?('/(tabs)/for-you' as const):('/(tabs)/profile' as const);
 const [page,setPage]=useState(0);
 const [saving,setSaving]=useState(false);
 const [saveError,setSaveError]=useState('');
 const [prefs,setPrefs]=useState(()=>({...defaultPreferences,neighborhoods:validAreas(defaultPreferences.neighborhoods),budget:validBudget(defaultPreferences.budget)}));
 const userEdited=useRef(false);
 useEffect(()=>{let active=true;getPreferences().then(p=>{if(active&&!userEdited.current)setPrefs({...p,neighborhoods:validAreas(p.neighborhoods??[]),budget:validBudget(p.budget)});}).catch(()=>undefined);if(!editing)getUser().then(u=>{if(active&&!u)router.replace('/register');}).catch(()=>{if(active)router.replace('/register');});return ()=>{active=false;};},[editing,router]);
 const toggle=(key:'moods'|'outings'|'neighborhoods',value:string)=>{
  userEdited.current=true;
  setPrefs(p=>{if(key==='neighborhoods'){const exists=p.neighborhoods.some(n=>canonicalArea(n)===value);return {...p,neighborhoods:exists?p.neighborhoods.filter(n=>canonicalArea(n)!==value):[...p.neighborhoods,value]};}
   return {...p,[key]:p[key].includes(value)?p[key].filter(x=>x!==value):[...p[key],value]};});
 };
 const save=async()=>{
  if(saving)return;setSaving(true);setSaveError('');
  try{
   await setPreferences({...prefs,neighborhoods:validAreas(prefs.neighborhoods),budget:validBudget(prefs.budget)});
   if(editing)router.replace(returnTo);else {await setOnboarded(true);router.replace('/(tabs)');}
  }catch{setSaveError('Δεν αποθηκεύτηκαν οι επιλογές σου. Δοκίμασε ξανά.');}finally{setSaving(false);}
 };
 const next=()=>page<2?setPage(page+1):void save();
 return <View style={s.page}>
  <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
   <View style={s.header}>
    <Text style={s.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
    {editing?<Pressable onPress={()=>router.replace(returnTo)} accessibilityRole="button"><Ionicons name="close" color={Colors.text} size={24}/></Pressable>:null}
   </View>
   <View style={s.progressHeader}><Text style={s.kicker}>{editing?'EDIT YOUR VIBE':'LET’S GET TO KNOW YOU'}</Text><Text style={s.counter}>0{page+1} / 03</Text></View>
   <View style={s.progress}>{[0,1,2].map(i=><View key={i} style={[s.progressSegment,i<=page&&s.progressOn]}/>)}</View>
   <Text style={s.title}>{steps[page].headline}</Text>
   <Text style={s.subtitle}>{steps[page].sub}</Text>
   {page===0?<View style={s.panel}><View style={s.panelHeading}><Ionicons name="sparkles-outline" color={Colors.violet} size={20}/><Text style={s.panelTitle}>Your kind of atmosphere</Text></View><View style={s.chips}>{moods.map(x=><PreferenceChip key={x} label={x} selected={prefs.moods.includes(x)} onPress={()=>toggle('moods',x)}/>)}</View></View>:null}
   {page===1?<View style={s.panel}><View style={s.panelHeading}><Ionicons name="cafe-outline" color={Colors.violet} size={20}/><Text style={s.panelTitle}>Favorite kind of outing</Text></View><View style={s.chips}>{outings.map(x=><PreferenceChip key={x} label={x} selected={prefs.outings.includes(x)} onPress={()=>toggle('outings',x)}/>)}</View></View>:null}
   {page===2?<View style={s.panel}>
    <View style={s.panelHeading}><Ionicons name="location-outline" color={Colors.violet} size={20}/><Text style={s.panelTitle}>Preferred areas</Text></View>
    <OnboardingLocationPreferences selected={prefs.neighborhoods} onToggle={x=>toggle('neighborhoods',x)}/>
    <View style={s.divider}/>
    <View style={s.panelHeading}><Ionicons name="wallet-outline" color={Colors.violet} size={20}/><Text style={s.panelTitle}>Budget per person</Text></View>
    <View style={s.chips}>{budgets.map(x=><PreferenceChip key={x} label={x===60?'60€+':x+'€'} selected={prefs.budget===x} onPress={()=>{userEdited.current=true;setPrefs(p=>({...p,budget:x}));}}/>)}</View>
   </View>:null}
   <View style={s.help}><Ionicons name="shield-checkmark-outline" size={16} color={Colors.muted}/><Text style={s.helpText}>Μπορείς να αλλάξεις τις επιλογές σου οποιαδήποτε στιγμή.</Text></View>
   {saveError?<Text style={s.error}>{saveError}</Text>:null}
  </ScrollView>
  <View style={s.bottom}>
   {page>0?<Pressable style={s.back} onPress={()=>setPage(x=>x-1)} accessibilityRole="button"><Ionicons name="arrow-back" size={19} color={Colors.violet}/><Text style={s.backText}>Back</Text></Pressable>:null}
   <Pressable style={s.next} onPress={next} accessibilityRole="button" disabled={saving}>
    <Text style={s.nextText}>{saving?'Saving…':page===2?editing?'Save preferences':'Explore Vibe':'Continue'}</Text><Ionicons name="arrow-forward" color="#fff" size={19}/>
   </Pressable>
  </View>
 </View>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 content:{flexGrow:1,paddingHorizontal:Spacing.lg,paddingTop:26,paddingBottom:35},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:33},
 logo:{fontSize:31,color:Colors.text,letterSpacing:-1.7,fontWeight:'900'},
 progressHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:12,alignItems:'center'},
 kicker:{fontSize:10,fontWeight:'900',color:Colors.violet,letterSpacing:1.4},counter:{fontSize:12,fontWeight:'900',color:Colors.muted},
 progress:{flexDirection:'row',gap:6,marginBottom:28},
 progressSegment:{height:5,flex:1,borderRadius:6,backgroundColor:'#E8E0F2'},
 progressOn:{backgroundColor:Colors.violet},
 title:{fontSize:Type.hero,lineHeight:41,color:Colors.text,fontWeight:'900',letterSpacing:-1.4},
 subtitle:{fontSize:14,color:Colors.muted,marginTop:8,lineHeight:21,marginBottom:25},
 panel:{borderRadius:Radius.lg,backgroundColor:'#fff',padding:18,borderWidth:1,borderColor:Colors.border},
 panelHeading:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:18},
 panelTitle:{fontSize:16,fontWeight:'900',color:Colors.text},
 chips:{flexDirection:'row',flexWrap:'wrap'},
 divider:{height:1,backgroundColor:Colors.border,marginVertical:23},
 help:{marginTop:21,flexDirection:'row',gap:9,alignItems:'flex-start'},
 helpText:{color:Colors.muted,fontSize:12,lineHeight:18,flex:1},
 error:{color:Colors.danger,fontSize:12,marginTop:15},
 bottom:{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:Spacing.lg,paddingVertical:16,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:Colors.border},
 back:{flexDirection:'row',gap:7,alignItems:'center',minHeight:51,paddingHorizontal:14,borderRadius:14,backgroundColor:Colors.cardSoft},
 backText:{color:Colors.violet,fontSize:14,fontWeight:'800'},
 next:{flex:1,backgroundColor:Colors.violet,minHeight:51,paddingHorizontal:19,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
 nextText:{color:'#fff',fontSize:14,fontWeight:'900'}
});

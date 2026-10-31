import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PreferenceChip } from '@/components/PreferenceChip';
import { OnboardingLocationPreferences } from '@/components/OnboardingLocationPreferences';
import { canonicalArea } from '@/lib/attica-neighborhoods';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors, Spacing } from '@/constants/theme';
import { defaultPreferences, getPreferences, setOnboarded, setPreferences } from '@/lib/storage';
import { useEffect } from 'react';

const moods=['cozy','romantic','quiet','lively','creative','social'];
const outings=['coffee with friends','date night','brunch','night out','study session','casual drinks'];
const budget=[20,40,60,80,120];
function Step({number,title,children}:{number:number;title:string;children:React.ReactNode}){
 return <View style={styles.step}>
  <View style={styles.stepRow}><View style={styles.num}><Text style={styles.numText}>{number}</Text></View>
   <Text style={styles.stepTitle}>{title}</Text>
  </View>
  <View style={styles.options}>{children}</View>
 </View>;
}
export default function OnboardingScreen(){
 const router=useRouter();
 const [prefs,setPrefs]=useState(defaultPreferences);
 useEffect(()=>{getPreferences().then(setPrefs).catch(()=>undefined);},[]);
 const toggle=(key:'moods'|'outings'|'neighborhoods',value:string)=>{
  setPrefs(p=>{
   if(key==='neighborhoods'){
    const exists=p.neighborhoods.some(name=>canonicalArea(name)===value);
    return {...p,neighborhoods:exists
      ?p.neighborhoods.filter(name=>canonicalArea(name)!==value)
      :[...p.neighborhoods,value]};
   }
   return {...p,[key]:p[key].includes(value)?p[key].filter(v=>v!==value):[...p[key],value]};
  });
 };
 const save=async()=>{await setPreferences(prefs);await setOnboarded(true);router.replace('/login');};
 return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
  <Text style={styles.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
  <Text style={styles.title}>Φτιάξε το δικό σου vibe.</Text>
  <Text style={styles.subtitle}>Τρεις γρήγορες επιλογές για να γνωρίσουμε τι σου αρέσει.</Text>
  <Step number={1} title="Ποιο είναι το στυλ σου;">
   {moods.map(m=><PreferenceChip key={m} label={m} selected={prefs.moods.includes(m)} onPress={()=>toggle('moods',m)}/>)}
  </Step>
  <Step number={2} title="Πώς σου αρέσει να βγαίνεις;">
   {outings.map(m=><PreferenceChip key={m} label={m} selected={prefs.outings.includes(m)} onPress={()=>toggle('outings',m)}/>)}
  </Step>
  <Step number={3} title="Πού και με τι budget;">
   <OnboardingLocationPreferences selected={prefs.neighborhoods} onToggle={name=>toggle('neighborhoods',name)}/>
   <View style={styles.divider}/>
   <Text style={styles.budgetLabel}>Budget ανά έξοδο</Text>
   {budget.map(m=><PreferenceChip key={m} label={`€${m}`} selected={prefs.budget===m} onPress={()=>setPrefs(p=>({...p,budget:m}))}/>)}
  </Step>
  <PrimaryButton label="Βρες το vibe σου  ↗" onPress={save}/>
  <Text style={styles.foot}>Προσωρινό demo προφίλ. Οι προτιμήσεις αποθηκεύονται στη συσκευή σου.</Text>
 </ScrollView>;
}
const styles=StyleSheet.create({
 screen:{backgroundColor:Colors.background,flex:1},
 content:{paddingHorizontal:Spacing.lg,paddingTop:38,paddingBottom:50},
 logo:{fontSize:32,letterSpacing:-2,fontWeight:'900',color:Colors.text,marginBottom:24},
 title:{fontSize:32,fontWeight:'900',letterSpacing:-1.2,color:Colors.text,lineHeight:39},
 subtitle:{color:Colors.muted,fontSize:14,lineHeight:21,marginTop:8,marginBottom:23},
 step:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:22,padding:17,marginBottom:14},
 stepRow:{flexDirection:'row',gap:10,alignItems:'center',marginBottom:15},
 num:{width:30,height:30,borderRadius:10,backgroundColor:Colors.limeSoft,alignItems:'center',justifyContent:'center'},
 numText:{color:'#213D17',fontSize:14,fontWeight:'900'},
 stepTitle:{color:Colors.text,fontWeight:'900',fontSize:17,flex:1},
 options:{flexDirection:'row',flexWrap:'wrap'},
 divider:{width:'100%',height:1,backgroundColor:Colors.border,marginBottom:14,marginTop:2},
 budgetLabel:{fontSize:13,color:Colors.muted,fontWeight:'700',width:'100%',marginBottom:12},
 foot:{fontSize:11,color:Colors.muted,textAlign:'center',marginTop:17,lineHeight:17}
});

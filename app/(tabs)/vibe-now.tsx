import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AreaSelector } from '../../components/AreaSelector';
import { GooglePlacesResults } from '../../components/GooglePlacesResults';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SectionHeading, StatusPill, VibeHero } from '../../components/VibeUI';
import { Colors, Gradients, Spacing } from '../../constants/theme';
import { useSearchArea } from '../../hooks/useSearchArea';
import { getPreferences } from '../../lib/storage';
import type { UserPreferences } from '../../types';

const prompts=[
  {label:'☕ Coffee catch-up',value:'καφέ'},
  {label:'✺ Dinner date',value:'ρομαντικό εστιατόριο'},
  {label:'✦ Drinks tonight',value:'μπαρ'},
  {label:'☀ Outdoor moment',value:'καφέ έξω'},
] as const;

export default function VibeNowScreen(){
  const router=useRouter();
  const {prompt}=useLocalSearchParams<{prompt?:string}>();
  const {area,changeArea,useDeviceLocation}=useSearchArea();
  const [input,setInput]=useState('Θέλω ένα καφέ');
  const [preferences,setPreferences]=useState<UserPreferences|null>(null);
  useEffect(()=>{if(prompt)setInput(prompt);},[prompt]);
  useFocusEffect(useCallback(()=>{getPreferences().then(setPreferences).catch(()=>undefined);},[]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logoRow}>
        <Text style={styles.pageKicker}>✦ NOT SURE WHERE TO GO?</Text>
        <StatusPill variant="violet">VIBE MODE ON</StatusPill>
      </View>
      <VibeHero eyebrow="YOUR MOOD IS THE MAP" title={'Tell us the\nvibe ✳'}
        subtitle="Πες τη φάση σου και θα βρούμε demo spots ανάλογα με το mood σου."
        compact />
      <SectionHeading title="What's the plan?" detail="Εσύ το mood. Εμείς τα spots."/>
      <AreaSelector area={area} onChange={changeArea} onLocate={useDeviceLocation}/>
      <View style={styles.inputCard}>
        <View style={styles.textRow}>
          <Text style={styles.inputLabel}>✳ DESCRIBE YOUR VIBE</Text>
          <Text style={styles.inputHint}>no pressure</Text>
        </View>
        <TextInput multiline value={input} onChangeText={setInput} style={styles.input}
          placeholder="π.χ. καφέ με φίλους ή βραδινό μπαρ..." placeholderTextColor="#777086"
          textAlignVertical="top" />
        <View style={styles.underline}/>
        <Text style={styles.inputFooter}>Type your plan above ↑</Text>
      </View>
      <Text style={styles.quickTitle}>OR PICK A MOOD ↓</Text>
      <View style={styles.quickWrap}>
        {prompts.map(p=>
          <Pressable key={p.value} onPress={()=>setInput(p.value)}
            accessibilityRole="button" accessibilityState={{selected:input===p.value}}
            style={[styles.quick,input===p.value&&styles.quickActive]}>
            <Text style={[styles.quickText,input===p.value&&styles.quickTextActive]}>{p.label}</Text>
          </Pressable>
        )}
      </View>
      <SectionHeading title="Made for your mood ↗" detail={`Demo spots · ${area.label}`}/>
      <GooglePlacesResults area={area} compact prompt={input}/>
      <Text style={styles.note}>Demo προτάσεις με εικονικά καταστήματα. Τα scores υπολογίζονται τοπικά με κανόνες, όχι με εκπαιδευμένο ML μοντέλο.</Text>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},
  content:{paddingHorizontal:Spacing.lg,paddingTop:35,paddingBottom:50},
  logoRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:18},
  pageKicker:{color:Colors.purple,fontSize:10,fontWeight:'900',letterSpacing:1.2},
  inputCard:{backgroundColor:'#F1ECFC',borderWidth:1,borderColor:'rgba(180,145,255,0.4)',borderRadius:23,padding:17},
  textRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:9},
  inputLabel:{color:Colors.lime,fontSize:11,fontWeight:'900',letterSpacing:1.3},
  inputHint:{color:Colors.muted,fontSize:11},
  input:{color:Colors.text,fontSize:16,lineHeight:24,minHeight:95,paddingTop:9,paddingBottom:9},
  underline:{height:1,backgroundColor:'rgba(108,68,170,0.19)'},
  inputFooter:{fontSize:10,color:Colors.purple,marginTop:12,fontWeight:'700'},
  quickTitle:{fontSize:10,color:Colors.muted,letterSpacing:1.5,fontWeight:'900',marginTop:23,marginBottom:12},
  quickWrap:{flexDirection:'row',flexWrap:'wrap',gap:9},
  quick:{backgroundColor:Colors.card,borderColor:Colors.border,borderWidth:1,borderRadius:16,paddingVertical:11,paddingHorizontal:13},
  quickActive:{backgroundColor:Colors.limeSoft,borderColor:Colors.limeSoft},
  quickText:{color:Colors.text,fontSize:12,fontWeight:'800'},
  quickTextActive:{color:'#18220E'},
  match:{backgroundColor:Colors.card,borderColor:Colors.border,borderWidth:1,borderRadius:25,overflow:'hidden',marginBottom:16},
  matchTop:{height:96,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:19},
  rank:{color:'#FFFFFF',fontSize:12,fontWeight:'900',letterSpacing:1.1},
  matchIcon:{color:'#FFFFFF',fontSize:49},
  matchContent:{padding:18},
  matchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:10},
  name:{flex:1,color:Colors.text,fontSize:21,fontWeight:'900',letterSpacing:-.6},
  arrow:{color:Colors.lime,fontSize:24},
  place:{color:Colors.purple,fontSize:12,fontWeight:'700',marginTop:6,marginBottom:12},
  reason:{color:Colors.muted,fontSize:12,marginBottom:8,lineHeight:17},
  error:{color:Colors.lime,marginTop:18},
  empty:{backgroundColor:Colors.card,borderRadius:24,alignItems:'center',padding:32},
  emptySymbol:{color:Colors.violet,fontSize:46},emptyTitle:{color:Colors.text,fontWeight:'900',fontSize:19,marginTop:7},
  emptySub:{color:Colors.muted,fontSize:12,marginTop:6},
  note:{fontSize:10,color:Colors.muted,lineHeight:18,marginTop:18},
});

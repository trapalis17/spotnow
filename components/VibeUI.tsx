import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius } from '../constants/theme';

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <Text style={[styles.eyebrow, dark && { color:'#29203E' }]}>{children}</Text>;
}

export function VibeHero({ eyebrow, title, subtitle, children, compact = false }:{
  eyebrow: string; title: string; subtitle?: string; children?: ReactNode; compact?: boolean;
}) {
  return (
    <LinearGradient colors={Gradients.hero} start={{x:0,y:0}} end={{x:1,y:1}}
      style={[styles.hero,compact && styles.compact]}>
      <View pointerEvents="none" style={styles.orbLarge} />
      <View pointerEvents="none" style={styles.orbSmall} />
      <View style={styles.heroContent}>
        <View style={styles.ticket}><Text style={styles.ticketText}>✦ {eyebrow}</Text></View>
        <Text style={styles.heroTitle}>{title}</Text>
        {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        {children ? <View style={{marginTop:19}}>{children}</View> : null}
      </View>
    </LinearGradient>
  );
}

export function SectionHeading({ title, detail, action }:{
  title: string; detail?: string; action?: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={{flex:1}}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      {action}
    </View>
  );
}
export function StatusPill({ children, variant = 'lime' }:{
  children: ReactNode; variant?: 'lime' | 'violet' | 'muted';
}) {
  const style = variant==='lime' ? styles.pillLime : variant==='violet' ? styles.pillViolet : styles.pillMuted;
  return <View style={[styles.pill,style]}><Text style={[styles.pillText,variant==='lime' && {color:'#1A2110'}]}>{children}</Text></View>;
}

const styles=StyleSheet.create({
  eyebrow:{color:Colors.lime,fontSize:10,fontWeight:'900',letterSpacing:2,textTransform:'uppercase'},
  hero:{borderRadius:30,padding:23,overflow:'hidden',minHeight:225,marginBottom:22},
  compact:{minHeight:178},
  orbLarge:{position:'absolute',width:236,height:236,borderRadius:118,right:-98,top:-79,borderWidth:42,borderColor:'rgba(255,255,255,0.13)'},
  orbSmall:{position:'absolute',width:130,height:130,borderRadius:65,left:-55,bottom:-72,backgroundColor:'rgba(255,255,255,0.09)'},
  heroContent:{zIndex:1},
  ticket:{backgroundColor:'rgba(255,255,255,0.21)',alignSelf:'flex-start',paddingHorizontal:12,paddingVertical:7,borderRadius:999,borderWidth:1,borderColor:'rgba(255,255,255,0.23)',marginBottom:12},
  ticketText:{fontSize:10,fontWeight:'900',letterSpacing:1.3,color:'#FFFFFF'},
  heroTitle:{fontSize:31,lineHeight:35,fontWeight:'900',letterSpacing:-1.2,color:'#FFFFFF',maxWidth:'88%'},
  heroSubtitle:{fontSize:13,lineHeight:20,color:'rgba(255,255,255,0.91)',marginTop:10,maxWidth:'92%'},
  section:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginVertical:17,gap:10},
  sectionTitle:{color:Colors.text,fontSize:22,fontWeight:'900',letterSpacing:-0.7},
  sectionDetail:{color:Colors.muted,fontSize:12,marginTop:5},
  pill:{alignSelf:'flex-start',borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:8},
  pillLime:{backgroundColor:Colors.limeSoft},
  pillViolet:{backgroundColor:'#F3E2D7',borderWidth:1,borderColor:'rgba(103,68,174,0.20)'},
  pillMuted:{backgroundColor:'#F1EEF8'},
  pillText:{color:Colors.text,fontSize:10,fontWeight:'800',letterSpacing:0.4},
});

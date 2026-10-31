import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../constants/theme';

export function PrimaryButton({label,onPress,compact=false}: {label:string;onPress:()=>void;compact?:boolean}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({pressed})=>[styles.wrap,pressed&&{opacity:0.85}]}>
      <LinearGradient colors={Gradients.vibe} start={{x:0,y:0}} end={{x:1,y:0}}
        style={[styles.button,compact&&styles.compact]}>
        <Text style={styles.primary}>{label}</Text>
        <Text style={styles.arrow}>↗</Text>
      </LinearGradient>
    </Pressable>
  );
}
export function SecondaryButton({label,onPress}:{label:string;onPress:()=>void}) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={styles.secondary}>
    <Text style={styles.secondaryText}>{label}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({
  wrap:{borderRadius:18,overflow:'hidden'},
  button:{minHeight:53,paddingHorizontal:18,paddingVertical:14,alignItems:'center',justifyContent:'space-between',flexDirection:'row',gap:10},
  compact:{minHeight:45,paddingVertical:10},
  primary:{color:'#151F12',fontSize:14,fontWeight:'900',letterSpacing:.1},
  arrow:{color:'#151F12',fontSize:20,fontWeight:'800'},
  secondary:{paddingHorizontal:18,paddingVertical:15,alignItems:'center',justifyContent:'center',borderRadius:18,backgroundColor:Colors.cardSoft,borderWidth:1,borderColor:Colors.border},
  secondaryText:{fontWeight:'800',color:Colors.text,fontSize:14},
});

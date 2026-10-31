import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

export function PreferenceChip({label,selected=false,onPress}:{
  label:string;selected?:boolean;onPress?:()=>void;
}) {
  const content=<Text style={[styles.text,selected&&styles.textSelected]}>{label}</Text>;
  const style=[styles.chip,selected&&styles.selected];
  return onPress?
    <Pressable onPress={onPress} style={style} accessibilityRole="button" accessibilityState={{selected}}>
      {content}
    </Pressable>:
    <View style={style}>{content}</View>;
}
const styles=StyleSheet.create({
  chip:{backgroundColor:Colors.card,borderWidth:1,borderColor:Colors.border,borderRadius:999,
    paddingHorizontal:Spacing.md,paddingVertical:11,marginRight:8,marginBottom:9},
  selected:{backgroundColor:Colors.limeSoft,borderColor:Colors.limeSoft},
  text:{color:Colors.text,fontWeight:'800',fontSize:12},
  textSelected:{color:'#1B2612'},
});

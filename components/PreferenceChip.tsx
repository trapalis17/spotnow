import {Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Colors,Radius} from '../constants/theme';
export function PreferenceChip({label,selected=false,onPress}:{label:string;selected?:boolean;onPress?:()=>void}){
 const children=<><Text style={[styles.text,selected&&styles.textSelected]}>{label}</Text>{selected?<Ionicons name="checkmark" size={14} color="#fff"/>:null}</>;
 const style=[styles.chip,selected&&styles.selected];
 return onPress?<Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{selected}} style={({pressed})=>[...style,pressed&&{opacity:.78}]}>{children}</Pressable>:<View style={style}>{children}</View>;
}
const styles=StyleSheet.create({
 chip:{minHeight:42,backgroundColor:Colors.card,borderWidth:1,borderColor:Colors.border,
  borderRadius:Radius.pill,paddingHorizontal:16,paddingVertical:11,marginRight:8,marginBottom:9,
  flexDirection:'row',alignItems:'center',gap:6},
 selected:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 text:{color:Colors.text,fontWeight:'700',fontSize:13},
 textSelected:{color:'#fff'}
});

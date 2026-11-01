import {Pressable,StyleSheet,Text,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Colors,Gradients,Radius} from '../constants/theme';
export function PrimaryButton({label,onPress,compact=false}:{label:string;onPress:()=>void;compact?:boolean}){
 return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.primary,compact&&styles.compact,pressed&&styles.pressed]}>
  <LinearGradient colors={Gradients.primary} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} pointerEvents="none"/><Text style={styles.primaryText}>{label}</Text><Ionicons name="arrow-forward" size={18} color="#fff"/>
 </Pressable>;
}
export function SecondaryButton({label,onPress}:{label:string;onPress:()=>void}){
 return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.secondary,pressed&&styles.pressed]}>
  <Text style={styles.secondaryText}>{label}</Text>
 </Pressable>;
}
const styles=StyleSheet.create({
 primary:{overflow:'hidden',minHeight:54,backgroundColor:Colors.violet,borderRadius:Radius.md,paddingHorizontal:19,paddingVertical:14,
  flexDirection:'row',alignItems:'center',justifyContent:'center',gap:11},
 primaryText:{fontSize:15,fontWeight:'800',color:'#fff',letterSpacing:.1},
 compact:{minHeight:44,paddingVertical:11},
 pressed:{opacity:.85,transform:[{scale:.99}]},
 secondary:{minHeight:50,borderRadius:Radius.md,alignItems:'center',justifyContent:'center',
  backgroundColor:Colors.cardSoft,borderWidth:1,borderColor:Colors.border,paddingHorizontal:16,paddingVertical:13},
 secondaryText:{fontWeight:'800',fontSize:14,color:Colors.violet}
});

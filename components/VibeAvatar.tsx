import type {StyleProp,ViewStyle} from 'react-native';
import {Image,StyleSheet,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {avatarById,type ProfilePicture} from '../lib/profile-picture';

type Props={picture:ProfilePicture;size?:number;style?:StyleProp<ViewStyle>};
/** Gradient vector avatars share the same shape with local uploaded photos. */
export function VibeAvatar({picture,size=66,style}:Props){
 const radius=Math.round(size*.33);
 if(picture.kind==='photo')return <View style={[s.frame,{width:size,height:size,borderRadius:radius},style]}>
  <Image source={{uri:picture.uri}} style={StyleSheet.absoluteFillObject} resizeMode="cover"/>
 </View>;
 const preset=avatarById(picture.id);
 return <View style={[s.frame,{width:size,height:size,borderRadius:radius},style]}>
  <LinearGradient colors={preset.colors} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFillObject}/>
  <View style={[s.orbit,{width:size*.9,height:size*.9,borderRadius:size*.45,right:-size*.36,top:-size*.35,borderWidth:Math.max(5,size*.13)}]}/>
  <View style={[s.highlight,{height:size*.25,width:size*.25,borderRadius:size*.125,left:size*.1,top:size*.11}]}/>
  <Ionicons name={preset.icon} size={Math.round(size*.44)} color="#fff"/>
  <View style={[s.glint,{width:Math.max(4,size*.075),height:Math.max(4,size*.075),borderRadius:size*.04,right:size*.15,bottom:size*.15}]}/>
 </View>;
}
const s=StyleSheet.create({
 frame:{overflow:'hidden',justifyContent:'center',alignItems:'center',backgroundColor:'#DDD5FF'},
 orbit:{position:'absolute',borderColor:'rgba(255,255,255,.16)'},
 highlight:{position:'absolute',backgroundColor:'rgba(255,255,255,.16)'},
 glint:{position:'absolute',backgroundColor:'rgba(255,255,255,.63)'},
});

import type {StyleProp,ViewStyle} from 'react-native';
import {Image,StyleSheet,View} from 'react-native';
import {avatarById,type ProfilePicture} from '../lib/profile-picture';

// One bundled local image means all eight Spotnow People render instantly,
// including when the device is offline. The file contains a 4-column x 2-row grid.
const SPOTNOW_PEOPLE=require('../assets/avatars/spotnow-people.jpg');
type Props={picture:ProfilePicture;size?:number;style?:StyleProp<ViewStyle>};
export function VibeAvatar({picture,size=66,style}:Props){
 const frame={width:size,height:size,borderRadius:size/2};
 if(picture.kind==='photo')return <View style={[s.frame,frame,style]}>
  <Image source={{uri:picture.uri}} style={StyleSheet.absoluteFill} resizeMode="cover"/>
 </View>;
 const preset=avatarById(picture.id);
 return <View style={[s.frame,frame,style]}>
  <Image source={SPOTNOW_PEOPLE} resizeMode="stretch"
   accessible accessibilityLabel={'3D avatar '+preset.label}
   style={{position:'absolute',width:size*4,height:size*2,left:-preset.col*size,top:-preset.row*size}}/>
 </View>;
}
const s=StyleSheet.create({
 frame:{overflow:'hidden',justifyContent:'center',alignItems:'center',backgroundColor:'#FAF8FF'},
});

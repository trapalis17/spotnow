import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {VibeAvatar} from './VibeAvatar';
import {VIBE_AVATARS,type ProfilePicture,type VibeAvatarId} from '../lib/profile-picture';
import {Colors,Radius,Spacing} from '../constants/theme';

type Props={visible:boolean;picture:ProfilePicture;busy:boolean;error:string;
 onClose:()=>void;onSelect:(id:VibeAvatarId)=>void;onUpload:()=>void;onReset:()=>void};
export function ProfilePictureSheet({visible,picture,busy,error,onClose,onSelect,onUpload,onReset}:Props){
 return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}
  presentationStyle="overFullScreen">
  <View style={s.overlay}>
   <Pressable style={s.scrim} onPress={onClose} accessibilityLabel="Κλείσιμο επιλογής φωτογραφίας" accessibilityRole="button"/>
   <View style={s.sheet}>
    <View style={s.grabber}/>
    <View style={s.header}>
     <View style={s.headingText}><Text style={s.eyebrow}>MAKE IT YOURS</Text>
      <Text style={s.title}>Your profile picture.</Text>
     </View>
     <Pressable onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel="Κλείσιμο">
      <Ionicons name="close" size={21} color={Colors.text}/>
     </Pressable>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
     <View style={s.preview}>
      <VibeAvatar picture={picture} size={86}/>
      <Text style={s.previewLabel}>{picture.kind==='photo'?'Your photo':VIBE_AVATARS.find(a=>a.id===picture.id)?.label??'Your avatar'}</Text>
     </View>
     <Pressable onPress={onUpload} disabled={busy} accessibilityRole="button" style={[s.upload,busy&&s.disabled]}>
      <View style={s.uploadIcon}><Ionicons name="image-outline" size={21} color={Colors.violet}/></View>
      <View style={s.uploadCopy}><Text style={s.uploadTitle}>{busy?'Preparing photo…':'Upload your photo'}</Text>
       <Text style={s.uploadCaption}>Choose, crop & save from your gallery</Text>
      </View>
      <Ionicons name="arrow-forward" size={19} color={Colors.violet}/>
     </Pressable>
     {error?<Text style={s.error}>{error}</Text>:null}
     <View style={s.avatarHeader}><Text style={s.avatarHeading}>Or choose a Vibe avatar</Text><Text style={s.avatarCount}>12 STYLES</Text></View>
     <View style={s.grid}>
      {VIBE_AVATARS.map(a=>{
       const selected=picture.kind==='avatar'&&picture.id===a.id;
       return <Pressable key={a.id} disabled={busy} accessibilityRole="button"
        accessibilityState={{selected}} accessibilityLabel={'Επιλογή Vibe avatar '+a.label}
        onPress={()=>onSelect(a.id)} style={[s.option,selected&&s.optionSelected]}>
        <VibeAvatar picture={{kind:'avatar',id:a.id}} size={68}/>
        <Text style={[s.optionText,selected&&s.optionTextSelected]}>{a.label}</Text>
        {selected?<View style={s.selectedDot}/>:null}
       </Pressable>;
      })}
     </View>
     <Pressable disabled={busy} onPress={onReset} style={s.reset} accessibilityRole="button">
      <Ionicons name="refresh-outline" size={16} color={Colors.muted}/>
      <Text style={s.resetText}>Reset to default avatar</Text>
     </Pressable>
     <Text style={s.privacy}>Your picture stays on this device in the frontend preview.</Text>
    </ScrollView>
   </View>
  </View>
 </Modal>;
}
const s=StyleSheet.create({
 overlay:{flex:1,justifyContent:'flex-end'},
 scrim:{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'rgba(22,15,48,.55)'},
 sheet:{backgroundColor:Colors.background,borderTopLeftRadius:30,borderTopRightRadius:30,
  maxHeight:'92%',paddingTop:10,paddingHorizontal:Spacing.lg},
 grabber:{alignSelf:'center',height:5,width:40,borderRadius:5,backgroundColor:'#D2C5ED',marginBottom:17},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:18},
 headingText:{flex:1},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.3,color:Colors.violet},
 title:{fontSize:24,fontWeight:'900',letterSpacing:-.7,color:Colors.text,marginTop:6},
 close:{height:36,width:36,backgroundColor:Colors.cardSoft,borderRadius:12,alignItems:'center',justifyContent:'center'},
 scroll:{paddingBottom:37},
 preview:{alignItems:'center',gap:9,paddingBottom:19},
 previewLabel:{color:Colors.muted,fontWeight:'800',fontSize:12},
 upload:{flexDirection:'row',alignItems:'center',gap:12,padding:13,borderRadius:19,backgroundColor:'#fff',
  borderWidth:1,borderColor:'#DDD1FA',marginBottom:20},
 disabled:{opacity:.55},
 uploadIcon:{height:42,width:42,borderRadius:14,backgroundColor:Colors.cardSoft,alignItems:'center',justifyContent:'center'},
 uploadCopy:{flex:1},uploadTitle:{fontSize:13,fontWeight:'900',color:Colors.text},
 uploadCaption:{fontSize:11,color:Colors.muted,marginTop:3},
 error:{color:Colors.danger,fontSize:12,marginTop:-11,marginBottom:15,lineHeight:18},
 avatarHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:10},
 avatarHeading:{fontSize:15,color:Colors.text,fontWeight:'900'},
 avatarCount:{fontSize:10,color:Colors.violet,fontWeight:'900',letterSpacing:.6},
 grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12},
 option:{width:'31.5%',minHeight:104,borderRadius:18,backgroundColor:'#fff',borderWidth:1,
  borderColor:Colors.border,alignItems:'center',justifyContent:'center',paddingVertical:9,gap:6,position:'relative'},
 optionSelected:{borderColor:Colors.violet,backgroundColor:'#F1EBFF',borderWidth:2},
 optionText:{fontSize:11,color:Colors.muted,fontWeight:'800'},
 optionTextSelected:{color:Colors.violet},
 selectedDot:{width:7,height:7,borderRadius:4,backgroundColor:Colors.violet,
  position:'absolute',right:8,top:8},
 reset:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:15,marginTop:15},
 resetText:{fontSize:12,color:Colors.muted,fontWeight:'800'},
 privacy:{fontSize:10,color:Colors.subtle,textAlign:'center',marginBottom:4},
});

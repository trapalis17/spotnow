import {ImageBackground,Pressable,StyleSheet,Text,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import type {ForYouMatch} from '../lib/for-you';
import {venueCategoryLabel} from '../lib/for-you';
import {Colors,Radius} from '../constants/theme';

type Props={
 match:ForYouMatch;variant?:'featured'|'portrait'|'row';
 saved:boolean;onPress:()=>void;onSave:()=>void;
};
const palette={
 cafe:['#6254B2','#AE86C3'] as const,
 restaurant:['#9D588F','#CE9EB5'] as const,
 bar:['#483D81','#986DB0'] as const
};
const iconByCategory={
 cafe:'cafe-outline' as const,
 restaurant:'restaurant-outline' as const,
 bar:'wine-outline' as const
};
function SaveHeart({saved,onSave}:Pick<Props,'saved'|'onSave'>){
 return <Pressable hitSlop={9} accessibilityRole="button"
  accessibilityLabel={saved?'Αφαίρεση από τα αγαπημένα':'Προσθήκη στα αγαπημένα'}
  onPress={event=>{event.stopPropagation();onSave();}}
  style={styles.heart}>
  <Ionicons name={saved?'heart':'heart-outline'} size={20} color={saved?Colors.rose:Colors.text}/>
 </Pressable>;
}
function Photo({match,height,children}:{
 match:ForYouMatch;height:number|undefined;children:React.ReactNode;
}){
 const {place}=match;
 return <View style={[styles.photo, height===undefined?{flex:1}:{height}]}>
  <LinearGradient colors={palette[place.category]} style={StyleSheet.absoluteFill}/>
  <Ionicons name={iconByCategory[place.category]} size={84} color="rgba(255,255,255,.25)" style={styles.fallbackIcon}/>
  <ImageBackground source={place.demoPhoto?{uri:place.demoPhoto}:undefined} resizeMode="cover" style={StyleSheet.absoluteFill} imageStyle={styles.photoImage}>
    <LinearGradient colors={['rgba(17,12,32,.18)','rgba(17,12,32,.04)','rgba(17,12,32,.83)']}
      locations={[0,.37,1]} style={StyleSheet.absoluteFill}/>
    {children}
  </ImageBackground>
 </View>;
}
export function ForYouVenueCard({match,variant='row',saved,onPress,onSave}:Props){
 const {place,score,areaLabel,tasteReasons,matchConfidence}=match;
 const scoreLabel=score>0?('≈'+score+'%'):'More data needed';
 const confidenceLabel=matchConfidence==='low'?' · Early estimate':'';
 if(variant==='featured')return <Pressable onPress={onPress} accessibilityRole="button"
   accessibilityLabel={place.name+' · '+(score>0?score+'% εκτιμώμενο Vibe Match':'Ανεπαρκή δεδομένα')}
   style={({pressed})=>[styles.featured,pressed&&styles.pressed]}>
   <Photo match={match} height={330}>
    <View style={styles.featuredTop}>
     <View style={styles.topPick}><Ionicons name="sparkles" color="#231B36" size={14}/><Text style={styles.topPickText}>TOP PICK FOR YOU</Text></View>
     <SaveHeart saved={saved} onSave={onSave}/>
    </View>
    <View style={styles.featuredBottom}>
     <View style={styles.eyebrow}><Ionicons name={iconByCategory[place.category]} size={14} color="#fff"/><Text style={styles.photoMeta}>{venueCategoryLabel(place.category)} · {areaLabel}</Text></View>
     <Text style={styles.heroName} numberOfLines={2}>{place.name}</Text>
     <Text style={styles.heroReason} numberOfLines={2}>{tasteReasons[0]}</Text>
     <View style={styles.heroBottomRow}>
       <View style={styles.heroMatch}><Ionicons name="sparkles" size={16} color={Colors.limeSoft}/><Text style={styles.heroMatchText}>{scoreLabel} match{confidenceLabel}</Text></View>
       <View style={styles.arrowCircle}><Ionicons name="arrow-forward" size={19} color={Colors.text}/></View>
     </View>
    </View>
   </Photo>
  </Pressable>;
 if(variant==='portrait')return <Pressable onPress={onPress} accessibilityRole="button"
   accessibilityLabel={place.name+' · '+(score>0?score+'% εκτιμώμενο Vibe Match':'Ανεπαρκή δεδομένα')}
   style={({pressed})=>[styles.portrait,pressed&&styles.pressed]}>
   <Photo match={match} height={158}>
    <View style={styles.portraitTop}>
     <View style={styles.portraitMatch}><Ionicons name="sparkles" color={Colors.violet} size={13}/><Text style={styles.portraitMatchText}>{scoreLabel}</Text></View>
     <SaveHeart saved={saved} onSave={onSave}/>
    </View>

   </Photo>
   <View style={styles.portraitBody}>
     <Text style={styles.portraitName} numberOfLines={1}>{place.name}</Text>
     <View style={styles.areaRow}><Ionicons name="location-outline" color={Colors.muted} size={13}/><Text style={styles.smallArea} numberOfLines={1}>{areaLabel}</Text></View>
     <Text style={styles.smallWhy} numberOfLines={2}>{tasteReasons[0]}</Text>
   </View>
  </Pressable>;
 return <Pressable onPress={onPress} accessibilityRole="button"
  accessibilityLabel={place.name+' · '+(score>0?score+'% εκτιμώμενο Vibe Match':'Ανεπαρκή δεδομένα')}
  style={({pressed})=>[styles.row,pressed&&styles.pressed]}>
  <View style={styles.rowPicture}>
   <Photo match={match} height={119}>
    <View style={styles.rowCategory}><Text style={styles.rowCategoryText}>{venueCategoryLabel(place.category)}</Text></View>
   </Photo>
  </View>
  <View style={styles.rowDetails}>
    <View style={styles.rowTitleLine}>
      <Text style={styles.rowName} numberOfLines={1}>{place.name}</Text>
      <SaveHeart saved={saved} onSave={onSave}/>
    </View>
    <View style={styles.areaRow}><Ionicons name="location-outline" size={13} color={Colors.muted}/><Text style={styles.smallArea} numberOfLines={1}>{areaLabel}</Text></View>
    <Text style={styles.rowWhy} numberOfLines={2}>{tasteReasons[0]}</Text>
    <View style={styles.rowFooter}><Text style={styles.rowPercent}>✳ {scoreLabel} match</Text><Ionicons name="arrow-forward-outline" color={Colors.violet} size={18}/></View>
  </View>
 </Pressable>;
}
const styles=StyleSheet.create({
 pressed:{opacity:.88,transform:[{scale:.995}]},
 photo:{width:'100%',overflow:'hidden'},
 photoImage:{},
 fallbackIcon:{position:'absolute',top:24,left:34},
 heart:{backgroundColor:'rgba(255,255,255,.94)',borderRadius:13,width:36,height:36,alignItems:'center',justifyContent:'center'},
 featured:{borderRadius:26,overflow:'hidden',backgroundColor:Colors.violet,marginBottom:6,shadowColor:'#3C2268',shadowOpacity:.16,
   shadowOffset:{width:0,height:10},shadowRadius:19,elevation:5},
 featuredTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',padding:17},
 topPick:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:Colors.limeSoft,borderRadius:50,paddingHorizontal:12,paddingVertical:9},
 topPickText:{fontWeight:'900',fontSize:10,letterSpacing:.8,color:Colors.text},
 featuredBottom:{marginTop:'auto',paddingHorizontal:22,paddingBottom:23},
 eyebrow:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:7},
 photoMeta:{color:'#fff',fontSize:12,fontWeight:'800'},
 heroName:{color:'#fff',fontSize:32,fontWeight:'900',letterSpacing:-1.1,lineHeight:37},
 heroReason:{color:'rgba(255,255,255,.90)',fontSize:13,lineHeight:18,marginTop:7,marginBottom:15},
 heroBottomRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 heroMatch:{flexDirection:'row',gap:6,alignItems:'center',paddingHorizontal:12,paddingVertical:10,backgroundColor:'rgba(255,255,255,.17)',borderWidth:1,borderColor:'rgba(255,255,255,.25)',borderRadius:Radius.pill,flexShrink:1},
 heroMatchText:{color:'#fff',fontSize:12,fontWeight:'900'},
 arrowCircle:{width:41,height:41,borderRadius:14,backgroundColor:Colors.limeSoft,alignItems:'center',justifyContent:'center'},
 portrait:{width:225,backgroundColor:'#fff',borderRadius:22,overflow:'hidden',borderWidth:1,borderColor:Colors.border,marginRight:12,marginBottom:6},
 portraitTop:{flexDirection:'row',justifyContent:'space-between',padding:12},
 portraitMatch:{backgroundColor:'rgba(255,255,255,.96)',borderRadius:Radius.pill,paddingHorizontal:12,paddingVertical:8,flexDirection:'row',alignItems:'center',gap:4,height:36},
 portraitMatchText:{fontWeight:'900',fontSize:12,color:Colors.violet},
 portraitTags:{marginTop:'auto',paddingHorizontal:11,paddingBottom:11,flexDirection:'row',gap:6},
 photoTag:{backgroundColor:'rgba(20,10,35,.54)',borderRadius:20,paddingHorizontal:8,paddingVertical:6},
 photoTagText:{color:'#fff',fontWeight:'700',fontSize:10},
 portraitBody:{padding:15,minHeight:106},
 portraitName:{fontSize:17,fontWeight:'900',color:Colors.text,letterSpacing:-.5},
 areaRow:{flexDirection:'row',alignItems:'center',gap:4,marginTop:6},
 smallArea:{fontSize:12,color:Colors.muted,flex:1},
 smallWhy:{fontSize:12,lineHeight:18,color:Colors.violet,fontWeight:'700',marginTop:8},
 row:{flexDirection:'row',backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:21,overflow:'hidden',marginBottom:12,minHeight:119},
 rowPicture:{width:110},
 rowCategory:{position:'absolute',left:9,bottom:10,backgroundColor:'rgba(0,0,0,.50)',paddingHorizontal:9,paddingVertical:6,borderRadius:20},
 rowCategoryText:{color:'#fff',fontSize:10,fontWeight:'900'},
 rowDetails:{flex:1,paddingHorizontal:13,paddingVertical:11,justifyContent:'center'},
 rowTitleLine:{flexDirection:'row',alignItems:'center',gap:5,justifyContent:'space-between'},
 rowName:{flex:1,fontSize:16,fontWeight:'900',color:Colors.text,letterSpacing:-.3},
 rowWhy:{fontSize:12,color:Colors.muted,marginTop:7,lineHeight:18},
 rowFooter:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:9},
 rowPercent:{fontWeight:'900',color:Colors.violet,fontSize:11,backgroundColor:'#F2ECFF',paddingVertical:7,paddingHorizontal:11,borderRadius:Radius.pill,overflow:'hidden'}
});

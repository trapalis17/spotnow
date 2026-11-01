import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {getSavedVenueIds,toggleSavedVenue,getCollections,saveCollections,type SavedCollection} from '../../lib/storage';
import {trackDemoEvent} from '../../lib/demo-analytics';
import {getDemoPlaceById} from '../../lib/demo-places';
import type {GooglePlace} from '../../lib/google-places';

export default function SavedScreen(){
 const router=useRouter();
 const [ids,setIds]=useState<string[]>([]);
 const [collections,setCollections]=useState<SavedCollection[]>([]);
 const [newName,setNewName]=useState('');
 const [active,setActive]=useState<string|null>(null);
 const [editing,setEditing]=useState<string|null>(null);
 const [rename,setRename]=useState('');
 const [venueToManage,setVenueToManage]=useState<string|null>(null);
 useFocusEffect(useCallback(()=>{
  getSavedVenueIds().then(setIds).catch(()=>setIds([]));
  getCollections().then(setCollections).catch(()=>setCollections([]));
 },[]));
 const persist=(next:SavedCollection[])=>{setCollections(next);saveCollections(next).catch(()=>undefined);};
 const add=()=>{const name=newName.trim();if(!name)return;persist([...collections,{id:'collection-'+Date.now().toString(36),name,venueIds:[]}]);setNewName('');trackDemoEvent('collection_created');};
 const renameCollection=(id:string)=>{const name=rename.trim();if(name)persist(collections.map(c=>c.id===id?{...c,name}:c));setEditing(null);};
 const toggleVenueCollection=(id:string,venueId:string)=>persist(collections.map(c=>c.id!==id?c:{...c,venueIds:c.venueIds.includes(venueId)?c.venueIds.filter(v=>v!==venueId):[...c.venueIds,venueId]}));
 const all=useMemo(()=>ids.filter(x=>x.startsWith('google-')).map(x=>getDemoPlaceById(x.slice(7))).filter((x):x is GooglePlace=>x!==null),[ids]);
 const filtered=useMemo(()=>active?all.filter(x=>collections.find(c=>c.id===active)?.venueIds.includes('google-'+x.id)):all,[active,all,collections]);
 return <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
  <View style={s.top}><Text style={s.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text><Ionicons name="heart" color={Colors.rose} size={22}/></View>
  <Text style={s.kicker}>YOUR PERSONAL SHORTLIST</Text>
  <Text style={s.title}>Saved for<Text style={{color:Colors.violet}}> later.</Text></Text>
  <Text style={s.subtitle}>{all.length?all.length+' spots στη λίστα σου':'Μάζεψε εδώ όσα μέρη σου αρέσουν.'}</Text>
  <View style={s.section}><Text style={s.sectionTitle}>Collections</Text><Text style={s.mini}>{collections.length} lists</Text></View>
  <View style={s.createRow}><TextInput style={s.createInput} placeholder="New collection…" value={newName} onChangeText={setNewName} placeholderTextColor={Colors.subtle} returnKeyType="done" onSubmitEditing={add}/><Pressable onPress={add} style={s.add} accessibilityRole="button" accessibilityLabel="Δημιουργία συλλογής"><Ionicons name="add" color="#fff" size={22}/></Pressable></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.collectionScroll}>
   <Pressable onPress={()=>setActive(null)} style={[s.collectionTile,!active&&s.collectionActive]} accessibilityRole="button"><View style={s.collectionIcon}><Ionicons name="heart-outline" color={!active?'#fff':Colors.violet} size={20}/></View><Text style={[s.collectionName,!active&&s.collectionNameOn]}>All saved</Text><Text style={[s.collectionCount,!active&&s.collectionCountOn]}>{all.length} spots</Text></Pressable>
   {collections.map(c=><View key={c.id} style={[s.collectionTile,active===c.id&&s.collectionActive]}>
     <Pressable style={s.collectionTap} onPress={()=>setActive(c.id)} accessibilityRole="button" accessibilityLabel={'Άνοιγμα '+c.name}>
      <View style={s.collectionIcon}><Ionicons name="albums-outline" size={20} color={active===c.id?'#fff':Colors.violet}/></View>
      <Text numberOfLines={1} style={[s.collectionName,active===c.id&&s.collectionNameOn]}>{c.name}</Text>
      <Text style={[s.collectionCount,active===c.id&&s.collectionCountOn]}>{c.venueIds.length} spots</Text>
     </Pressable>
     <View style={s.collectionActions}><Pressable accessibilityRole="button" accessibilityLabel={'Μετονομασία '+c.name} onPress={()=>{setEditing(c.id);setRename(c.name);}}><Ionicons name="pencil-outline" size={16} color={active===c.id?'#fff':Colors.muted}/></Pressable><Pressable accessibilityRole="button" accessibilityLabel={'Διαγραφή '+c.name} onPress={()=>{persist(collections.filter(x=>x.id!==c.id));if(active===c.id)setActive(null);}}><Ionicons name="trash-outline" size={16} color={active===c.id?'#fff':Colors.muted}/></Pressable></View>
   </View>)}
  </ScrollView>
  <View style={s.section}><Text style={s.sectionTitle}>{active?collections.find(c=>c.id===active)?.name:'Your saved spots'}</Text><Text style={s.mini}>{filtered.length} places</Text></View>
  {filtered.length?filtered.map(place=><View key={place.id} style={s.venueCard}>
   <Pressable onPress={()=>router.push({pathname:'/google-venue',params:{id:place.id}})} style={s.venueMain} accessibilityRole="button">
    <View style={s.venueIcon}><Ionicons name={place.category==='cafe'?'cafe-outline':place.category==='bar'?'wine-outline':'restaurant-outline'} size={23} color={Colors.violet}/></View>
    <View style={s.venueText}><Text numberOfLines={1} style={s.venueName}>{place.name}</Text><Text numberOfLines={1} style={s.venueSubtitle}>{place.address?.replace('Εικονικό κατάστημα · ','')||'Demo spot'}</Text></View>
    <Ionicons name="chevron-forward" size={18} color={Colors.subtle}/>
   </Pressable>
   <View style={s.venueActions}>
    <Pressable onPress={()=>setVenueToManage('google-'+place.id)} accessibilityRole="button" style={s.venueButton}><Ionicons name="albums-outline" size={16} color={Colors.violet}/><Text style={s.venueActionText}>Collections</Text></Pressable>
    <Pressable onPress={async()=>{try{setIds(await toggleSavedVenue('google-'+place.id));}catch{}}} accessibilityRole="button" style={s.venueButton}><Ionicons name="heart" size={16} color={Colors.rose}/><Text style={s.venueActionText}>Remove</Text></Pressable>
   </View>
  </View>):<LinearGradient colors={Gradients.secondary} style={s.empty}>
   <Ionicons name="heart-outline" color={Colors.violet} size={36}/>
   <Text style={s.emptyTitle}>{active?'Nothing in this collection yet':'Your saved spots live here'}</Text>
   <Text style={s.emptySub}>Βρες κάτι που σου ταιριάζει και κράτησέ το.</Text>
   <Pressable onPress={()=>router.push('/(tabs)')} style={s.emptyButton}><Text style={s.emptyButtonText}>Explore places</Text><Ionicons name="arrow-forward" color="#fff" size={17}/></Pressable>
  </LinearGradient>}
  <Text style={s.footer}>Saved locally · Demo venue data</Text>
  <Modal visible={Boolean(venueToManage||editing)} transparent animationType="fade" onRequestClose={()=>{setVenueToManage(null);setEditing(null);}}>
   <View style={s.backdrop}><View style={s.sheet}>
    <View style={s.sheetHeader}><Text style={s.sheetTitle}>{editing?'Rename collection':'Add to collections'}</Text><Pressable onPress={()=>{setEditing(null);setVenueToManage(null);}} accessibilityRole="button"><Ionicons name="close" size={24} color={Colors.text}/></Pressable></View>
    {editing?<><TextInput style={s.renameInput} value={rename} onChangeText={setRename} autoFocus/><Pressable style={s.modalSave} onPress={()=>renameCollection(editing)}><Text style={s.modalSaveText}>Save name</Text></Pressable></>:null}
    {venueToManage?collections.length?collections.map(c=><Pressable key={c.id} onPress={()=>toggleVenueCollection(c.id,venueToManage)} style={s.pickRow} accessibilityRole="button"><Text style={s.pickName}>{c.name}</Text><Ionicons name={c.venueIds.includes(venueToManage)?'checkbox':'square-outline'} size={23} color={Colors.violet}/></Pressable>):<Text style={s.emptySub}>Φτιάξε πρώτα μια συλλογή.</Text>:null}
    {venueToManage?<Pressable style={s.modalSave} onPress={()=>setVenueToManage(null)}><Text style={s.modalSaveText}>Done</Text></Pressable>:null}
   </View></View>
  </Modal>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:100},
 top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:25},logo:{fontSize:31,fontWeight:'900',color:Colors.text,letterSpacing:-1.7},
 kicker:{fontSize:10,fontWeight:'900',color:Colors.violet,letterSpacing:1.4,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:41},
 subtitle:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:7,marginBottom:19},
 section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:16,gap:9},
 sectionTitle:{color:Colors.text,fontSize:Type.section,fontWeight:'900',letterSpacing:-.5,flex:1},
 mini:{color:Colors.muted,fontSize:12,fontWeight:'700'},
 createRow:{flexDirection:'row',gap:8,marginBottom:17},
 createInput:{backgroundColor:'#fff',borderRadius:Radius.md,borderWidth:1,borderColor:Colors.border,minHeight:50,paddingHorizontal:15,flex:1,color:Colors.text,fontSize:14},
 add:{backgroundColor:Colors.violet,width:51,borderRadius:Radius.md,alignItems:'center',justifyContent:'center'},
 collectionScroll:{gap:10,paddingBottom:9},
 collectionTile:{width:140,minHeight:133,backgroundColor:'#F3EFFB',padding:15,borderRadius:Radius.md,justifyContent:'space-between',borderWidth:1,borderColor:Colors.border},
 collectionActive:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 collectionTap:{flex:1},collectionIcon:{marginBottom:10},collectionName:{fontSize:14,fontWeight:'900',color:Colors.text},
 collectionNameOn:{color:'#fff'},collectionCount:{fontSize:11,color:Colors.muted,marginTop:4},
 collectionCountOn:{color:'rgba(255,255,255,.85)'},collectionActions:{flexDirection:'row',gap:18,justifyContent:'flex-end',marginTop:8},
 venueCard:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.md,padding:13,marginBottom:11},
 venueMain:{flexDirection:'row',alignItems:'center',gap:12},
 venueIcon:{height:50,width:50,borderRadius:15,backgroundColor:'#EDE7FB',justifyContent:'center',alignItems:'center'},
 venueText:{flex:1},venueName:{fontSize:15,fontWeight:'900',color:Colors.text},
 venueSubtitle:{fontSize:12,color:Colors.muted,marginTop:5},
 venueActions:{borderTopWidth:1,borderTopColor:Colors.border,marginTop:12,paddingTop:11,flexDirection:'row',gap:9,flexWrap:'wrap'},
 venueButton:{flexDirection:'row',gap:6,alignItems:'center',paddingVertical:9,paddingHorizontal:13,backgroundColor:Colors.cardSoft,borderRadius:Radius.pill},venueActionText:{fontSize:12,fontWeight:'800',color:Colors.muted},
 empty:{padding:26,borderRadius:Radius.lg,alignItems:'center',gap:12},
 emptyTitle:{fontSize:19,color:Colors.text,fontWeight:'900',textAlign:'center'},
 emptySub:{fontSize:13,color:Colors.muted,textAlign:'center',lineHeight:20},
 emptyButton:{marginTop:8,backgroundColor:Colors.violet,paddingVertical:13,paddingHorizontal:19,borderRadius:13,flexDirection:'row',alignItems:'center',gap:9},
 emptyButtonText:{color:'#fff',fontWeight:'900',fontSize:13},footer:{textAlign:'center',color:Colors.muted,fontSize:11,marginTop:22},
 backdrop:{flex:1,backgroundColor:'rgba(29,23,45,.48)',justifyContent:'flex-end'},
 sheet:{backgroundColor:Colors.background,borderTopLeftRadius:28,borderTopRightRadius:28,padding:24,paddingBottom:38,maxHeight:'85%'},
 sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:21},sheetTitle:{fontSize:21,fontWeight:'900',color:Colors.text},
 pickRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:15,borderBottomWidth:1,borderBottomColor:Colors.border},
 pickName:{fontWeight:'800',color:Colors.text,fontSize:14},renameInput:{minHeight:50,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,padding:14,borderRadius:14},
 modalSave:{padding:16,backgroundColor:Colors.violet,borderRadius:15,alignItems:'center',marginTop:21},modalSaveText:{color:'#fff',fontWeight:'900',fontSize:14}
});

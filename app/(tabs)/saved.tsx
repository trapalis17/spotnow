import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useMemo,useState} from 'react';
import {Alert,Image,Modal,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {getSavedVenueIds,toggleSavedVenue,getCollections,saveCollections,type SavedCollection} from '../../lib/storage';
import {trackDemoEvent} from '../../lib/demo-analytics';
import {getDemoPlaceById} from '../../lib/demo-places';
import type {GooglePlace} from '../../lib/google-places';

const categoryIcon={
 cafe:'cafe-outline' as const,bar:'wine-outline' as const,restaurant:'restaurant-outline' as const
};
const categoryLabel={cafe:'Coffee',bar:'Drinks',restaurant:'Food'};

export default function SavedScreen(){
 const router=useRouter();
 const [ids,setIds]=useState<string[]>([]);
 const [collections,setCollections]=useState<SavedCollection[]>([]);
 const [newName,setNewName]=useState('');
 const [active,setActive]=useState<string|null>(null);
 const [editing,setEditing]=useState<string|null>(null);
 const [rename,setRename]=useState('');
 const [venueToManage,setVenueToManage]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');

 useFocusEffect(useCallback(()=>{
  let alive=true;
  getSavedVenueIds().then(x=>{if(alive)setIds(x);}).catch(()=>{if(alive)setError('Δεν φορτώθηκαν τα αποθηκευμένα μέρη.');});
  getCollections().then(x=>{if(alive)setCollections(x);}).catch(()=>{if(alive)setError('Δεν φορτώθηκαν οι συλλογές.');});
  return ()=>{alive=false;};
 },[]));

 const persist=async(next:SavedCollection[])=>{
  const before=collections;setCollections(next);setError('');
  try{await saveCollections(next);}
  catch{setCollections(before);setError('Δεν αποθηκεύτηκε η αλλαγή στη συλλογή.');}
 };
 const add=()=>{
  const name=newName.trim();if(!name||busy)return;
  if(collections.some(c=>c.name.toLocaleLowerCase('el-GR')===name.toLocaleLowerCase('el-GR'))){
   setError('Υπάρχει ήδη συλλογή με αυτό το όνομα.');return;
  }
  setNewName('');
  void persist([...collections,{id:'collection-'+Date.now().toString(36),name,venueIds:[]}]);
  trackDemoEvent('collection_created');
 };
 const renameCollection=(id:string)=>{
  const name=rename.trim();if(!name)return;
  if(collections.some(c=>c.id!==id&&c.name.toLocaleLowerCase('el-GR')===name.toLocaleLowerCase('el-GR'))){
   setError('Υπάρχει ήδη συλλογή με αυτό το όνομα.');return;
  }
  void persist(collections.map(c=>c.id===id?{...c,name}:c));setEditing(null);
 };
 const removeCollection=(id:string,name:string)=>{
  Alert.alert('Delete collection?',`Να διαγραφεί η συλλογή «${name}»; Τα αποθηκευμένα μαγαζιά σου δεν θα διαγραφούν.`,[
   {text:'Cancel',style:'cancel'},
   {text:'Delete',style:'destructive',onPress:()=>{void persist(collections.filter(c=>c.id!==id));if(active===id)setActive(null);}}
  ]);
 };
 const toggleVenueCollection=(id:string,venueId:string)=>{
  void persist(collections.map(c=>c.id!==id?c:{...c,venueIds:c.venueIds.includes(venueId)?c.venueIds.filter(v=>v!==venueId):[...c.venueIds,venueId]}));
 };
 const removeVenue=async(id:string)=>{
  if(busy)return;setBusy(true);setError('');
  try{setIds(await toggleSavedVenue('google-'+id));}
  catch{setError('Δεν αφαιρέθηκε από τα αγαπημένα. Δοκίμασε ξανά.');}
  finally{setBusy(false);}
 };
 const all=useMemo(()=>ids.filter(x=>x.startsWith('google-')).map(x=>getDemoPlaceById(x.slice(7))).filter((x):x is GooglePlace=>x!==null),[ids]);
 const selectedCollection=collections.find(c=>c.id===active);
 const filtered=useMemo(()=>active?all.filter(x=>collections.find(c=>c.id===active)?.venueIds.includes('google-'+x.id)):all,[active,all,collections]);
 const coverFor=(c:SavedCollection)=>c.venueIds.map(id=>getDemoPlaceById(id.replace(/^google-/,''))).find(p=>p?.demoPhoto)?.demoPhoto;
 const placeCard=(place:GooglePlace)=>{
  const area=place.address?.replace('Εικονικό κατάστημα · ','')||'Demo περιοχή';
  return <View key={place.id} style={s.venueCard}>
   <Pressable style={s.venueMain} onPress={()=>router.push({pathname:'/google-venue',params:{id:place.id}})} accessibilityRole="button" accessibilityLabel={'Άνοιγμα '+place.name}>
    <View style={s.venuePhoto}>
     <LinearGradient colors={Gradients.cafe} style={StyleSheet.absoluteFill}/>
     {place.demoPhoto?<Image source={{uri:place.demoPhoto}} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel="Ενδεικτική φωτογραφία"/>:
      <Ionicons name={categoryIcon[place.category]} color="#fff" size={31}/>}
    </View>
    <View style={s.venueText}>
     <Text style={s.venueCategory}>{categoryLabel[place.category]}</Text>
     <Text numberOfLines={2} style={s.venueName}>{place.name}</Text>
     <View style={s.areaRow}><Ionicons name="location-outline" size={13} color={Colors.muted}/><Text numberOfLines={1} style={s.venueSubtitle}>{area}</Text></View>
     <Text style={s.viewDetails}>View spot <Ionicons name="arrow-forward-outline" size={13}/></Text>
    </View>
   </Pressable>
   <View style={s.venueActions}>
    <Pressable onPress={()=>setVenueToManage('google-'+place.id)} accessibilityRole="button" accessibilityLabel={'Διαχείριση συλλογών για '+place.name} style={s.venueButton}>
     <Ionicons name="albums-outline" size={16} color={Colors.violet}/><Text style={s.venueActionText}>Add to list</Text>
    </Pressable>
    <Pressable disabled={busy} onPress={()=>removeVenue(place.id)} accessibilityRole="button" accessibilityLabel={'Αφαίρεση '+place.name} style={s.removeButton}>
     <Ionicons name="heart" size={16} color={Colors.rose}/><Text style={s.removeText}>Saved</Text>
    </Pressable>
   </View>
  </View>;
 };

 return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
  <View style={s.top}><Text style={s.logo}>spot<Text style={{color:Colors.lavender}}>now✳</Text></Text><View style={s.topIcon}><Ionicons name="heart" color={Colors.rose} size={21}/></View></View>
  <Text style={s.kicker}>YOUR PERSONAL SHORTLIST</Text>
  <Text style={s.title}>Keep the <Text style={{color:Colors.violet}}>good spots.</Text></Text>
  <Text style={s.subtitle}>Όλα τα μέρη που θέλεις να θυμάσαι, σε ένα σημείο.</Text>
  <LinearGradient colors={Gradients.secondary} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
   <View style={s.heroInfo}>
    <Text style={s.heroEyebrow}>YOUR LITTLE COLLECTION ✳</Text>
    <Text style={s.heroHeading}>Places worth keeping.</Text>
    <Text style={s.heroSub}>Η δική σου λίστα για την επόμενη έξοδο.</Text>
   </View>
   <View style={s.heroNumbers}>
    <View style={s.heroStat}><Text style={s.heroNumber}>{all.length}</Text><Text style={s.heroLabel}>Saved spots</Text></View>
    <View style={s.statDivider}/>
    <View style={s.heroStat}><Text style={s.heroNumber}>{collections.length}</Text><Text style={s.heroLabel}>Collections</Text></View>
   </View>
  </LinearGradient>
  <View style={s.section}><View><Text style={s.sectionTitle}>Your collections</Text><Text style={s.sectionNote}>Organize the places you love.</Text></View><Ionicons name="albums-outline" color={Colors.violet} size={20}/></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.collectionScroll}>
   <Pressable onPress={()=>setActive(null)} accessibilityRole="button" accessibilityState={{selected:active===null}} style={[s.collectionTile,!active&&s.activeCollection]}>
    {!active?<LinearGradient colors={Gradients.primary} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} pointerEvents="none"/>:null}
    <View style={[s.collectionIcon,!active&&s.activeIcon]}><Ionicons name="heart-outline" size={20} color={!active?'#fff':Colors.violet}/></View>
    <Text numberOfLines={1} style={[s.collectionName,!active&&s.activeText]}>All saved</Text>
    <Text style={[s.collectionCount,!active&&s.activeCount]}>{all.length} spots</Text>
   </Pressable>
   {collections.map(c=>{
    const cover=coverFor(c),selected=active===c.id;
    return <View key={c.id} style={[s.collectionTile,selected&&s.activeCollection]}>
     {cover?<Image source={{uri:cover}} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel="Ενδεικτική φωτογραφία συλλογής"/>:<LinearGradient colors={selected?Gradients.primary:Gradients.secondary} style={StyleSheet.absoluteFill}/>}
     {cover?<LinearGradient colors={['rgba(37,27,70,.18)','rgba(37,27,70,.78)']} style={StyleSheet.absoluteFill}/>:null}
     <Pressable style={s.collectionTap} onPress={()=>setActive(c.id)} accessibilityRole="button" accessibilityState={{selected}} accessibilityLabel={'Άνοιγμα '+c.name}>
      <View style={[s.collectionIcon,(cover||selected)&&s.activeIcon]}><Ionicons name="albums-outline" size={19} color={cover||selected?'#fff':Colors.violet}/></View>
      <Text numberOfLines={1} style={[s.collectionName,(cover||selected)&&s.activeText]}>{c.name}</Text>
      <Text style={[s.collectionCount,(cover||selected)&&s.activeCount]}>{c.venueIds.length} spots</Text>
     </Pressable>
     <View style={s.collectionActions}>
      <Pressable accessibilityRole="button" accessibilityLabel={'Μετονομασία '+c.name} onPress={()=>{setEditing(c.id);setRename(c.name);}}>
       <Ionicons name="pencil-outline" size={16} color={cover||selected?'#fff':Colors.muted}/>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={'Διαγραφή '+c.name} onPress={()=>removeCollection(c.id,c.name)}>
       <Ionicons name="trash-outline" size={16} color={cover||selected?'#fff':Colors.muted}/>
      </Pressable>
     </View>
    </View>;
   })}
  </ScrollView>
  <View style={s.createRow}>
   <TextInput style={s.createInput} placeholder="Name a new collection…" value={newName} onChangeText={setNewName} placeholderTextColor={Colors.subtle} returnKeyType="done" onSubmitEditing={add} accessibilityLabel="Όνομα νέας συλλογής"/>
   <Pressable onPress={add} accessibilityRole="button" accessibilityLabel="Δημιουργία συλλογής" style={s.add}><LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill}/><Ionicons name="add" size={23} color="#fff"/></Pressable>
  </View>
  {error?<Text style={s.error}>{error}</Text>:null}
  <View style={s.section}><View style={{flex:1}}><Text style={s.sectionTitle}>{selectedCollection?.name||'Your saved spots'}</Text><Text style={s.sectionNote}>{active?'Spots from this collection':'All of your favorites, together'}</Text></View><Text style={s.counterPill}>{filtered.length} spots</Text></View>
  {filtered.length?filtered.map(placeCard):<LinearGradient colors={Gradients.secondary} style={s.empty}>
   <View style={s.emptyIcon}><Ionicons name={active?'albums-outline':'heart-outline'} color={Colors.violet} size={28}/></View>
   <Text style={s.emptyTitle}>{active?'Your collection is a blank canvas.':'Great places start here.'}</Text>
   <Text style={s.emptySub}>{active?'Βάλε σε αυτή τη συλλογή μερικά από τα αγαπημένα σου.':'Ανακάλυψε ένα μέρος που σου αρέσει και πάτησε την καρδιά.'}</Text>
   <Pressable onPress={()=>router.push('/(tabs)')} style={s.emptyButton} accessibilityRole="button"><LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill}/><Text style={s.emptyButtonText}>Discover spots</Text><Ionicons name="arrow-forward" color="#fff" size={17}/></Pressable>
  </LinearGradient>}
  <Text style={s.footer}>Demo saved spots · Αποθήκευση τοπικά στη συσκευή σου.</Text>
  <Modal visible={Boolean(venueToManage||editing)} transparent animationType="fade" onRequestClose={()=>{setVenueToManage(null);setEditing(null);}}>
   <View style={s.backdrop}><View style={s.sheet}>
    <View style={s.sheetHeader}><Text style={s.sheetTitle}>{editing?'Rename collection':'Add to collections'}</Text><Pressable onPress={()=>{setEditing(null);setVenueToManage(null);}} accessibilityRole="button" accessibilityLabel="Κλείσιμο"><Ionicons name="close" size={23} color={Colors.text}/></Pressable></View>
    {editing?<><TextInput style={s.renameInput} value={rename} onChangeText={setRename} autoFocus accessibilityLabel="Νέο όνομα συλλογής"/><Pressable style={s.modalSave} onPress={()=>renameCollection(editing)} accessibilityRole="button"><LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill}/><Text style={s.modalSaveText}>Save name</Text></Pressable></>:null}
    {venueToManage?collections.length?collections.map(c=><Pressable key={c.id} onPress={()=>toggleVenueCollection(c.id,venueToManage)} style={s.pickRow} accessibilityRole="button" accessibilityState={{checked:c.venueIds.includes(venueToManage)}}>
     <Text style={s.pickName}>{c.name}</Text><Ionicons name={c.venueIds.includes(venueToManage)?'checkbox':'square-outline'} size={23} color={Colors.violet}/>
    </Pressable>):<Text style={s.emptySub}>Φτιάξε πρώτα μια συλλογή.</Text>:null}
    {venueToManage?<Pressable style={s.modalSave} onPress={()=>setVenueToManage(null)} accessibilityRole="button"><LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill}/><Text style={s.modalSaveText}>Done</Text></Pressable>:null}
   </View></View>
  </Modal>
 </ScrollView>;
}

const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:100},
 top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
 logo:{fontSize:31,fontWeight:'900',color:Colors.text,letterSpacing:-1.7},
 topIcon:{height:41,width:41,borderRadius:14,backgroundColor:Colors.card,borderWidth:1,borderColor:Colors.border,alignItems:'center',justifyContent:'center'},
 kicker:{fontSize:10,fontWeight:'900',color:Colors.violet,letterSpacing:1.4,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:41},
 subtitle:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:7,marginBottom:20},
 hero:{borderRadius:Radius.lg,padding:19,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
 heroInfo:{gap:6},heroEyebrow:{fontSize:10,fontWeight:'900',color:Colors.violet,letterSpacing:1},
 heroHeading:{fontSize:22,fontWeight:'900',color:Colors.text,letterSpacing:-.6},heroSub:{fontSize:12,color:Colors.muted},
 heroNumbers:{flexDirection:'row',alignItems:'center',marginTop:20,backgroundColor:'rgba(255,255,255,.65)',borderRadius:16,paddingVertical:13},
 heroStat:{flex:1,alignItems:'center',gap:3},heroNumber:{fontSize:23,fontWeight:'900',color:Colors.violet},
 heroLabel:{fontSize:11,color:Colors.muted,fontWeight:'800'},statDivider:{width:1,height:26,backgroundColor:Colors.border},
 section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:27,marginBottom:14,gap:9},
 sectionTitle:{color:Colors.text,fontSize:Type.section,fontWeight:'900',letterSpacing:-.5},
 sectionNote:{color:Colors.muted,fontSize:11,marginTop:4},
 collectionScroll:{gap:10,paddingBottom:6},
 collectionTile:{width:155,minHeight:151,backgroundColor:Colors.cardSoft,borderRadius:20,overflow:'hidden',padding:13,justifyContent:'space-between',borderWidth:1,borderColor:Colors.border},
 activeCollection:{borderColor:Colors.lavender},
 collectionTap:{flex:1,justifyContent:'flex-start'},
 collectionIcon:{width:38,height:38,borderRadius:12,backgroundColor:'rgba(255,255,255,.68)',alignItems:'center',justifyContent:'center',marginBottom:13},
 activeIcon:{backgroundColor:'rgba(255,255,255,.20)'},
 collectionName:{fontSize:15,fontWeight:'900',color:Colors.text},
 activeText:{color:'#fff'},collectionCount:{fontSize:11,color:Colors.muted,marginTop:4},
 activeCount:{color:'rgba(255,255,255,.86)'},collectionActions:{flexDirection:'row',gap:19,justifyContent:'flex-end',marginTop:7},
 createRow:{flexDirection:'row',gap:8,marginTop:14,marginBottom:1},
 createInput:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,paddingHorizontal:15,minHeight:49,borderRadius:Radius.md,fontSize:13,color:Colors.text},
 add:{width:49,borderRadius:Radius.md,alignItems:'center',justifyContent:'center',overflow:'hidden'},
 counterPill:{backgroundColor:Colors.cardSoft,paddingHorizontal:13,paddingVertical:9,borderRadius:Radius.pill,color:Colors.violet,fontSize:11,fontWeight:'800',overflow:'hidden'},
 venueCard:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.md,overflow:'hidden',marginBottom:12},
 venueMain:{flexDirection:'row',gap:13,padding:11,alignItems:'center'},
 venuePhoto:{height:113,width:112,borderRadius:14,backgroundColor:Colors.lilac,overflow:'hidden',alignItems:'center',justifyContent:'center'},
 venueText:{flex:1},venueCategory:{color:Colors.violet,fontSize:10,fontWeight:'900',textTransform:'uppercase',letterSpacing:.9},
 venueName:{color:Colors.text,fontSize:16,fontWeight:'900',marginTop:5},
 areaRow:{flexDirection:'row',alignItems:'center',gap:3,marginTop:8},
 venueSubtitle:{fontSize:12,color:Colors.muted,flex:1},
 viewDetails:{fontSize:11,color:Colors.violet,fontWeight:'900',marginTop:10},
 venueActions:{flexDirection:'row',borderTopWidth:1,borderTopColor:Colors.border,padding:10,gap:8},
 venueButton:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:Colors.cardSoft,paddingHorizontal:14,paddingVertical:10,borderRadius:Radius.pill},
 venueActionText:{color:Colors.violet,fontWeight:'800',fontSize:12},
 removeButton:{marginLeft:'auto',flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#FDF1F9',paddingHorizontal:12,paddingVertical:10,borderRadius:Radius.pill},
 removeText:{color:Colors.rose,fontWeight:'800',fontSize:12},
 empty:{padding:25,borderRadius:Radius.lg,alignItems:'center',gap:12,borderWidth:1,borderColor:Colors.border},
 emptyIcon:{height:56,width:56,backgroundColor:'#fff',borderRadius:18,alignItems:'center',justifyContent:'center'},
 emptyTitle:{fontSize:19,color:Colors.text,fontWeight:'900',textAlign:'center'},
 emptySub:{fontSize:13,color:Colors.muted,textAlign:'center',lineHeight:20},
 emptyButton:{marginTop:8,borderRadius:15,overflow:'hidden',paddingVertical:13,paddingHorizontal:17,flexDirection:'row',alignItems:'center',gap:8},
 emptyButtonText:{color:'#fff',fontWeight:'900',fontSize:13},
 footer:{textAlign:'center',color:Colors.muted,fontSize:11,marginTop:23},
 error:{color:Colors.danger,fontSize:12,marginTop:9},
 backdrop:{flex:1,backgroundColor:'rgba(25,19,52,.50)',justifyContent:'flex-end'},
 sheet:{backgroundColor:Colors.background,borderTopLeftRadius:29,borderTopRightRadius:29,padding:23,paddingBottom:39,maxHeight:'86%'},
 sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:19},
 sheetTitle:{fontSize:21,fontWeight:'900',color:Colors.text},
 pickRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:15,borderBottomWidth:1,borderBottomColor:Colors.border},
 pickName:{fontWeight:'800',color:Colors.text,fontSize:14},
 renameInput:{minHeight:50,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,padding:14,borderRadius:14,color:Colors.text},
 modalSave:{marginTop:21,padding:16,borderRadius:15,overflow:'hidden',alignItems:'center'},
 modalSaveText:{fontSize:14,color:'#fff',fontWeight:'900'}
});

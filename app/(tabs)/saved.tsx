import {useFocusEffect,useRouter} from 'expo-router';
import {useCallback,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors,Spacing} from '../../constants/theme';
import {getSavedVenueIds,toggleSavedVenue,getCollections,saveCollections,type SavedCollection} from '../../lib/storage';
import {trackDemoEvent} from '../../lib/demo-analytics';
import {getDemoPlaceById} from '../../lib/demo-places';
import type {GooglePlace} from '../../lib/google-places';
export default function SavedScreen(){
 const router=useRouter();
 const [ids,setIds]=useState<string[]>([]);
 const [collections,setCollections]=useState<SavedCollection[]>([]);
 const [newName,setNewName]=useState('');
 const [renaming,setRenaming]=useState<string|null>(null);
 const [renameValue,setRenameValue]=useState('');
 useFocusEffect(useCallback(()=>{getSavedVenueIds().then(setIds).catch(()=>setIds([]));getCollections().then(setCollections).catch(()=>undefined);},[]));
 const updateCollections=(next:SavedCollection[])=>{setCollections(next);saveCollections(next).catch(()=>undefined);};
 const addCollection=()=>{const name=newName.trim();if(!name)return;trackDemoEvent('collection_created');updateCollections([...collections,{id:'collection-'+Date.now().toString(36),name,venueIds:[]}]);setNewName('');};
 const addToCollection=(collectionId:string,venueId:string)=>{
   updateCollections(collections.map(c=>c.id!==collectionId?c:{...c,venueIds:c.venueIds.includes(venueId)?c.venueIds.filter(v=>v!==venueId):[...c.venueIds,venueId]}));
 };
 const places=ids.filter(id=>id.startsWith('google-')).map(id=>getDemoPlaceById(id.slice(7))).filter((p):p is GooglePlace=>p!==null);
 return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
  <Text style={styles.title}>Τα αγαπημένα σου <Text style={{color:Colors.rose}}>♥</Text></Text>
  <Text style={styles.subtitle}>{places.length?places.length+' demo spots που κράτησες.':'Τα μέρη που αγαπάς, όλα σε ένα σημείο.'}</Text>
  <View style={styles.collectionPanel}>
   <Text style={styles.collectionHeading}>My collections ✳</Text>
   <View style={styles.newCollection}><TextInput value={newName} onChangeText={setNewName} placeholder="New collection name" style={styles.collectionInput} placeholderTextColor={Colors.muted}/><Pressable accessibilityRole="button" onPress={addCollection} style={styles.addButton}><Ionicons name="add" size={23} color="#fff"/></Pressable></View>
   {collections.map(c=><View key={c.id} style={styles.collectionRow}><View style={{flex:1}}>{renaming===c.id?<TextInput style={styles.collectionInput} value={renameValue} onChangeText={setRenameValue} autoFocus onSubmitEditing={()=>{const name=renameValue.trim();if(name)updateCollections(collections.map(x=>x.id===c.id?{...x,name}:x));setRenaming(null);}}/>:<Text style={styles.collectionName}>{c.name}</Text>}<Text style={styles.collectionCount}>{c.venueIds.length} spots</Text></View><Pressable onPress={()=>{if(renaming===c.id){const name=renameValue.trim();if(name)updateCollections(collections.map(x=>x.id===c.id?{...x,name}:x));setRenaming(null);}else{setRenaming(c.id);setRenameValue(c.name);}}} style={{padding:9}}><Ionicons name={renaming===c.id?'checkmark':'pencil-outline'} size={19} color={Colors.violet}/></Pressable><Pressable accessibilityRole="button" accessibilityLabel={'Διαγραφή '+c.name} onPress={()=>updateCollections(collections.filter(x=>x.id!==c.id))}><Ionicons name="trash-outline" size={19} color={Colors.rose}/></Pressable></View>)}
  </View>
  {!places.length?<LinearGradient colors={['#F0E9FF','#FDEBF4']} style={styles.empty}>
   <Ionicons name="heart-outline" size={42} color={Colors.rose}/>
   <Text style={styles.emptyTitle}>Δεν έχεις κρατήσει κάποιο μέρος ακόμη.</Text>
   <Text style={styles.emptyText}>Πάτα ♡ σε ένα demo μαγαζί ή κάνε swipe δεξιά.</Text>
   <Pressable style={styles.discover} onPress={()=>router.push('/(tabs)')}><Text style={styles.discoverText}>Ανακάλυψε μαγαζιά ↗</Text></Pressable>
  </LinearGradient>:null}
  {places.map(place=><Pressable key={place.id} style={styles.card}
   onPress={()=>router.push({pathname:'/google-venue',params:{id:place.id}})}>
   <View style={styles.symbol}><Ionicons name={place.category==='cafe'?'cafe-outline':place.category==='bar'?'wine-outline':'restaurant-outline'} size={23} color={Colors.violet}/></View>
   <View style={styles.middle}><Text style={styles.name}>{place.name}</Text><Text style={styles.note}>{place.address}</Text></View>
   <View style={{alignItems:'flex-end',gap:8}}>
    {collections.map(c=><Pressable key={c.id} accessibilityRole="button" onPress={e=>{e.stopPropagation();addToCollection(c.id,'google-'+place.id);}}>
       <Text style={{fontSize:10,color:Colors.violet,fontWeight:'800'}}>{c.venueIds.includes('google-'+place.id)?'✓ ':'+ '}{c.name}</Text>
    </Pressable>)}
   <Pressable onPress={async(e)=>{e.stopPropagation();setIds(await toggleSavedVenue('google-'+place.id));}} accessibilityLabel="Αφαίρεση από αγαπημένα">
     <Ionicons name="heart" size={24} color={Colors.rose}/>
   </Pressable></View>
  </Pressable>)}
  {places.length?<Text style={styles.footer}>Τοπικά αποθηκευμένα αγαπημένα · Μόνο demo καταστήματα.</Text>:null}
 </ScrollView>;
}
const styles=StyleSheet.create({
 collectionPanel:{backgroundColor:'#fff',padding:16,borderRadius:22,marginBottom:22,borderWidth:1,borderColor:Colors.border},
 collectionHeading:{fontSize:19,fontWeight:'900',color:Colors.text,marginBottom:12},
 newCollection:{flexDirection:'row',gap:8,marginBottom:11},
 collectionInput:{flex:1,borderRadius:13,backgroundColor:'#F3F0F8',padding:12,color:Colors.text},
 addButton:{width:44,borderRadius:12,backgroundColor:Colors.violet,alignItems:'center',justifyContent:'center'},
 collectionRow:{flexDirection:'row',alignItems:'center',borderTopWidth:1,borderTopColor:Colors.border,paddingVertical:11},
 collectionName:{fontSize:14,fontWeight:'800',color:Colors.text},
 collectionCount:{fontSize:11,color:Colors.muted,marginTop:3},
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:39,paddingBottom:65},
 title:{fontSize:32,fontWeight:'900',color:Colors.text,letterSpacing:-1.3,lineHeight:40},
 subtitle:{color:Colors.muted,fontSize:14,lineHeight:21,marginTop:9,marginBottom:25},
 empty:{padding:25,borderRadius:26,alignItems:'center',gap:12},
 emptyTitle:{textAlign:'center',color:Colors.text,fontSize:20,fontWeight:'900',lineHeight:27},
 emptyText:{textAlign:'center',color:Colors.muted,fontSize:13,lineHeight:20},
 discover:{backgroundColor:Colors.violet,borderRadius:14,paddingVertical:14,paddingHorizontal:19,marginTop:7},
 discoverText:{color:'#fff',fontWeight:'900',fontSize:14},
 card:{backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:19,padding:15,marginBottom:12,flexDirection:'row',alignItems:'center',gap:12},
 symbol:{width:49,height:49,backgroundColor:'#F0E9FF',borderRadius:14,alignItems:'center',justifyContent:'center'},
 middle:{flex:1},name:{fontWeight:'900',fontSize:16,color:Colors.text},
 note:{fontSize:12,color:Colors.muted,marginTop:5},
 footer:{fontSize:11,color:Colors.muted,marginTop:10}
});

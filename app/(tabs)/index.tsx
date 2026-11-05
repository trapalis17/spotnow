import {useCallback,useState} from 'react';
import {useFocusEffect,useRouter} from 'expo-router';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {LinearGradient} from 'expo-linear-gradient';
import {GooglePlacesResults} from '../../components/GooglePlacesResults';
import {DiscoverAreaPicker} from '../../components/DiscoverAreaPicker';
import {TasteConceptModal} from '../../components/TasteConceptModal';
import {getDailyVenueSwipeState} from '../../lib/storage';
import {Colors,Gradients,Spacing,Radius,Type} from '../../constants/theme';
import {useSearchArea} from '../../hooks/useSearchArea';

type Category='all'|'cafe'|'restaurant'|'bar';
const categories:{id:Category;name:string;icon:'apps-outline'|'cafe-outline'|'restaurant-outline'|'wine-outline'}[]=[
 {id:'all',name:'Όλα',icon:'apps-outline'}, {id:'cafe',name:'Καφές',icon:'cafe-outline'},
 {id:'restaurant',name:'Φαγητό',icon:'restaurant-outline'},{id:'bar',name:'Ποτό',icon:'wine-outline'}
];
export default function DiscoverScreen(){
 const router=useRouter();
 const {area,changeArea}=useSearchArea();
 const [category,setCategory]=useState<Category>('all');
 const [query,setQuery]=useState('');
 const [mode,setMode]=useState<'list'|'map'>('list');
 const [tasteOpen,setTasteOpen]=useState(false);
 const [tasteView,setTasteView]=useState<'cards'|'dna'>('cards');
 const [tasteCount,setTasteCount]=useState(0);
 const refreshTaste=()=>getDailyVenueSwipeState().then(x=>setTasteCount(Object.keys(x.votes).length)).catch(()=>undefined);
 useFocusEffect(useCallback(()=>{refreshTaste();},[]));
 const openTaste=(view:'cards'|'dna')=>{setTasteView(view);setTasteOpen(true);};
 return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
   <View style={s.topBar}>
     <Text style={s.logo}>spot<Text style={{color:Colors.violet}}>now✳</Text></Text>
     <Pressable onPress={()=>router.push('/(tabs)/profile')} style={s.avatar} accessibilityRole="button" accessibilityLabel="Άνοιγμα προφίλ"><Ionicons name="person-outline" size={20} color={Colors.violet}/></Pressable>
   </View>
   <Text style={s.kicker}>DISCOVER YOUR NEXT FAVORITE</Text>
   <Text style={s.title}>Βρες το επόμενο<Text style={{color:Colors.violet}}> spot σου.</Text></Text>
   <Text style={s.subtitle}>Μέρη που ταιριάζουν στο δικό σου vibe.</Text>
   <LinearGradient colors={Gradients.secondary} start={{x:0,y:0}} end={{x:1,y:1}} style={s.swipeCard}>
     <View style={s.swipeTop}><View style={s.swipeIcon}><Ionicons name="heart-outline" size={21} color={Colors.violet}/></View>
       <Text style={s.swipeEyebrow}>VIBE SWIPE</Text><Text style={s.swipeCounter}>{tasteCount} rated</Text>
     </View>
     <Text style={s.swipeTitle}>Κάθε swipe,<Text style={{color:Colors.violet}}> πιο εσύ.</Text></Text>
     <Text style={s.swipeDescription}>8 προτεινόμενα spots για σένα. Τα likes πάνε στα Top Swipes.</Text>
     <View style={s.swipeBottom}>
       <Pressable onPress={()=>openTaste('cards')} accessibilityRole="button" style={s.swipeCTA}><LinearGradient colors={Gradients.primary} start={{x:0,y:0}} end={{x:1,y:1}} style={s.swipeCTAInner}><Text style={s.swipeCTAText}>Start swiping</Text><Ionicons name="arrow-forward" size={17} color="#fff"/></LinearGradient></Pressable>
       <Pressable onPress={()=>openTaste('dna')} accessibilityRole="button" style={s.dnaCTA}><Text style={s.dnaText}>My DNA</Text><Ionicons name="finger-print-outline" size={17} color={Colors.violet}/></Pressable>
     </View>
   </LinearGradient>
   <View style={s.search}>
     <Ionicons name="search-outline" color={Colors.violet} size={20}/>
     <TextInput value={query} onChangeText={setQuery} style={s.input} placeholder="Όνομα, brunch, ήσυχο καφέ…" placeholderTextColor={Colors.subtle} returnKeyType="search" accessibilityLabel="Αναζήτηση μαγαζιών"/>
     {query?<Pressable onPress={()=>setQuery('')} accessibilityRole="button" accessibilityLabel="Καθαρισμός"><Ionicons name="close-circle" size={20} color={Colors.muted}/></Pressable>:null}
   </View>
   <View style={s.sectionRow}><View><Text style={s.sectionTitle}>Βρες το μέρος σου</Text><Text style={s.sectionCaption}>Προσαρμόζεις τις επιλογές σου</Text></View></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories}>
     {categories.map(c=><Pressable key={c.id} onPress={()=>setCategory(c.id)} accessibilityRole="button" accessibilityState={{selected:category===c.id}} style={[s.category,category===c.id&&s.categorySelected]}>
       {category===c.id?<LinearGradient colors={Gradients.primary} style={StyleSheet.absoluteFill} pointerEvents="none"/>:null}<Ionicons name={c.icon} size={16} color={category===c.id?'#fff':Colors.violet}/>
       <Text style={[s.categoryText,category===c.id&&s.selectedText]}>{c.name}</Text>
     </Pressable>)}
   </ScrollView>
   <DiscoverAreaPicker area={area} onChange={changeArea}/>
   <View style={s.resultsHead}><Text style={s.sectionTitle}>Spots to explore</Text>
    <View style={s.mode}>
      <Pressable style={[s.modeButton,mode==='list'&&s.modeSelected]} onPress={()=>setMode('list')} accessibilityRole="button"><Ionicons name="list-outline" size={19} color={mode==='list'?Colors.violet:Colors.muted}/></Pressable>
      <Pressable style={[s.modeButton,mode==='map'&&s.modeSelected]} onPress={()=>setMode('map')} accessibilityRole="button"><Ionicons name="map-outline" size={19} color={mode==='map'?Colors.violet:Colors.muted}/></Pressable>
    </View>
   </View>
   <GooglePlacesResults area={area} query={query} filter={category} compact={mode==='list'} mapMode={mode==='map'} hideHeading/>
   <TasteConceptModal visible={tasteOpen} initialView={tasteView} onClose={()=>{setTasteOpen(false);refreshTaste();}}/>
 </ScrollView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},content:{paddingHorizontal:Spacing.lg,paddingTop:24,paddingBottom:95},
 topBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:25},
 logo:{fontSize:31,fontWeight:'900',letterSpacing:-1.7,color:Colors.text},avatar:{width:42,height:42,alignItems:'center',justifyContent:'center',backgroundColor:Colors.card,borderRadius:15,borderWidth:1,borderColor:Colors.border},
 kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.6,color:Colors.violet,marginBottom:9},
 title:{fontSize:Type.hero,fontWeight:'900',color:Colors.text,letterSpacing:-1.5,lineHeight:41},
 subtitle:{fontSize:14,color:Colors.muted,lineHeight:21,marginTop:7,marginBottom:23},
 search:{minHeight:54,backgroundColor:'#fff',borderWidth:1,borderColor:Colors.border,borderRadius:Radius.md,flexDirection:'row',alignItems:'center',paddingHorizontal:16,gap:10,marginBottom:18},
 input:{flex:1,color:Colors.text,fontSize:14,paddingVertical:13},
 swipeCard:{borderRadius:Radius.lg,padding:19,borderWidth:1,borderColor:Colors.border,marginBottom:28},
 swipeTop:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:14},
 swipeIcon:{backgroundColor:'#fff',width:39,height:39,borderRadius:13,alignItems:'center',justifyContent:'center'},
 swipeEyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1,color:Colors.violet,flex:1},
 swipeCounter:{color:Colors.muted,fontSize:11,fontWeight:'700'},
 swipeTitle:{fontSize:25,lineHeight:31,fontWeight:'900',letterSpacing:-.6,color:Colors.text,maxWidth:'95%'},
 swipeDescription:{fontSize:13,color:Colors.muted,lineHeight:19,marginTop:8},
 swipeBottom:{flexDirection:'row',alignItems:'center',gap:9,marginTop:19},
 swipeCTA:{flex:1,borderRadius:14,overflow:'hidden'},
 swipeCTAInner:{paddingVertical:13,paddingHorizontal:15,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:9},
 swipeCTAText:{color:'#fff',fontSize:13,fontWeight:'900'},
 dnaCTA:{backgroundColor:'rgba(255,255,255,.82)',paddingHorizontal:17,paddingVertical:13,borderRadius:14,flexDirection:'row',alignItems:'center',gap:6},
 dnaText:{color:Colors.violet,fontSize:13,fontWeight:'800'},
 sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:16},
 sectionTitle:{fontSize:Type.section,fontWeight:'900',color:Colors.text,letterSpacing:-.6},
 sectionCaption:{color:Colors.muted,fontSize:12,marginTop:4},textLink:{fontWeight:'800',fontSize:12,color:Colors.violet},
 categories:{gap:8,paddingBottom:18},
 category:{overflow:'hidden',paddingHorizontal:16,paddingVertical:12,borderRadius:Radius.pill,borderWidth:1,borderColor:Colors.border,backgroundColor:'#fff',flexDirection:'row',alignItems:'center',gap:7},
 categorySelected:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 categoryText:{color:Colors.text,fontSize:13,fontWeight:'700'},selectedText:{color:'#fff'},
 resultsHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 mode:{flexDirection:'row',gap:4,backgroundColor:'#F1EEFA',borderRadius:Radius.pill,padding:4},
 modeButton:{padding:10,borderRadius:Radius.pill},modeSelected:{backgroundColor:'#fff'}
});

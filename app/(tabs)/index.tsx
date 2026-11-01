import {useCallback,useState} from 'react';
import {useFocusEffect,useRouter} from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { GooglePlacesResults } from '../../components/GooglePlacesResults';
import {TasteConceptModal} from '../../components/TasteConceptModal';
import {getTasteFeedback} from '../../lib/storage';
import { Colors, Spacing } from '../../constants/theme';
import { useSearchArea } from '../../hooks/useSearchArea';
import { AREAS } from '../../lib/places';

type Category = 'all' | 'cafe' | 'restaurant' | 'bar';
const categories: {id:Category;name:string;icon:'sparkles-outline'|'cafe-outline'|'restaurant-outline'|'wine-outline'}[] = [
 {id:'all',name:'Όλα',icon:'sparkles-outline'},
 {id:'cafe',name:'Καφέ',icon:'cafe-outline'},
 {id:'restaurant',name:'Φαγητό',icon:'restaurant-outline'},
 {id:'bar',name:'Ποτό',icon:'wine-outline'},
];
function NumberLabel({n,title}: {n:number;title:string}) {
 return <View style={styles.numberRow}>
   <View style={styles.number}><Text style={styles.numberText}>{n}</Text></View>
   <Text style={styles.stepTitle}>{title}</Text>
 </View>;
}
export default function HomeScreen(){
 const {area,changeArea,useDeviceLocation}=useSearchArea();
 const [category,setCategory]=useState<Category>('all');
 const [mood,setMood]=useState('');
 const [discoveryMode,setDiscoveryMode]=useState<'list'|'map'>('list');
 const [showAllAreas,setShowAllAreas]=useState(false);
 const [tasteOpen,setTasteOpen]=useState(false);
 const [tasteView,setTasteView]=useState<'cards'|'dna'>('cards');
 const [tasteCount,setTasteCount]=useState(0);
 useFocusEffect(useCallback(()=>{getTasteFeedback().then(v=>setTasteCount(Object.keys(v).length)).catch(()=>undefined);},[]));
 const openTaste=async(view:'cards'|'dna')=>{setTasteView(view);setTasteOpen(true);};
 const areas=showAllAreas?AREAS:AREAS.slice(0,5);
 return <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
   <View style={styles.brand}>
     <Text style={styles.logo}>vibe<Text style={{color:Colors.violet}}>✳</Text></Text>
     <Text style={styles.brandRight}>Βρες το δικό σου spot.</Text>
   </View>
   <Text style={styles.headline}>Πού πάμε<Text style={{color:Colors.violet}}> σήμερα;</Text></Text>
   <Text style={styles.intro}>3 βήματα για να βρεις το spot σου · Demo preview.</Text>
   <LinearGradient colors={['#E7DFFF','#FFEAF2','#E8F8EC']}
     start={{x:0,y:0}} end={{x:1,y:1}} style={styles.tasteEntry}>
     <View style={styles.tasteTop}>
       <View style={styles.tasteSymbol}><Ionicons name="sparkles" size={24} color={Colors.violet}/></View>
       <Text style={styles.tasteKicker}>NEW ✳ PREFERENCE LEARNING</Text>
       <View style={styles.tasteDots}><Text style={styles.tasteDotsText}>♥ × ↷</Text></View>
     </View>
     <Text style={styles.tasteTitle}>Vibe Swipe <Text style={{color:Colors.violet}}>✳</Text></Text>
     <Text style={styles.tasteDescription}>Κάνε swipe σε αισθητικές, ατμόσφαιρες και εμπειρίες. Μαθαίνουμε τι σου αρέσει για καλύτερες προτάσεις — όχι για να ψάχνεις μαγαζιά.</Text>
     <View style={styles.tasteMeta}>
       <Ionicons name="finger-print-outline" color={Colors.violet} size={15}/>
       <Text style={styles.tasteMetaText}>{tasteCount} concepts explored · πάντα διαθέσιμο</Text>
     </View>
     <View style={styles.tasteActions}>
       <Pressable style={styles.tasteStart} onPress={()=>{openTaste('cards').catch(()=>undefined);}} accessibilityRole="button">
         <Text style={styles.tasteStartText}>{'Start swiping'} ↗</Text>
       </Pressable>
       <Pressable style={styles.tasteReview} onPress={()=>{openTaste('dna').catch(()=>undefined);}} accessibilityRole="button">
         <Text style={styles.tasteReviewText}>My Vibe DNA</Text>
         <Ionicons name="arrow-forward-outline" color={Colors.violet} size={16}/>
       </Pressable>
     </View>
   </LinearGradient>

   <View style={styles.step}>
     <NumberLabel n={1} title="Τι έχεις όρεξη;"/>
     <View style={styles.categoryRow}>
       {categories.map(item=><Pressable key={item.id} onPress={()=>setCategory(item.id)}
         accessibilityRole="button" accessibilityState={{selected:category===item.id}}
         style={[styles.category,category===item.id&&styles.categoryActive]}>
         <Ionicons name={item.icon} size={23} color={category===item.id?'#fff':Colors.violet}/>
         <Text style={[styles.categoryText,category===item.id&&styles.categoryTextActive]}>{item.name}</Text>
       </Pressable>)}
     </View>
     <View style={styles.searchBox}>
       <Ionicons name="sparkles-outline" size={19} color={Colors.violet}/>
       <TextInput value={mood} onChangeText={setMood} style={styles.input}
         placeholder="Π.χ. ήσυχο, brunch, για ραντεβού…"
         placeholderTextColor="#827A91" returnKeyType="done" accessibilityLabel="Πώς θέλεις να είναι το μαγαζί;"/>
       {mood? <Pressable onPress={()=>setMood('')} accessibilityLabel="Καθαρισμός διάθεσης">
         <Ionicons name="close-circle" size={21} color={Colors.muted}/>
       </Pressable>:null}
     </View>
   </View>

   <View style={styles.step}>
     <NumberLabel n={2} title="Σε ποια περιοχή;"/>
     <View style={styles.currentRow}>
       <View style={styles.currentArea}>
         <Ionicons name="location" size={20} color={Colors.violet}/>
         <Text style={styles.currentText} numberOfLines={1}>{area.label}</Text>
       </View>
       <Pressable onPress={()=>useDeviceLocation().catch(e=>Alert.alert('Τοποθεσία',e instanceof Error?e.message:'Δεν βρέθηκε η τοποθεσία.'))}
         style={styles.nearMe} accessibilityRole="button">
         <Ionicons name="navigate" size={16} color={Colors.violet}/>
         <Text style={styles.nearMeText}>Κοντά μου</Text>
       </Pressable>
     </View>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areas}>
       {areas.map(option=><Pressable key={option.id} onPress={()=>changeArea(option)}
         accessibilityRole="button" accessibilityState={{selected:area.id===option.id}}
         style={[styles.areaChip,area.id===option.id&&styles.areaChipActive]}>
         <Text style={[styles.areaChipText,area.id===option.id&&styles.areaChipTextActive]}>{option.label}</Text>
       </Pressable>)}
       <Pressable onPress={()=>setShowAllAreas(v=>!v)} style={styles.moreAreas}>
         <Text style={styles.moreText}>{showAllAreas?'Λιγότερες':'Άλλες περιοχές'}  {showAllAreas?'−':'+'}</Text>
       </Pressable>
     </ScrollView>
   </View>

   <View style={styles.resultsHead}>
     <NumberLabel n={3} title="Διάλεξε το spot σου"/>
     <View style={styles.toggle}>
       {([
        {id:'list',label:'Λίστα',icon:'list'},
       
        {id:'map',label:'Χάρτης',icon:'map-outline'},
       ] as const).map(item=><Pressable key={item.id} onPress={()=>setDiscoveryMode(item.id)}
         accessibilityRole="button" accessibilityState={{selected:discoveryMode===item.id}}
         style={[styles.toggleBtn,discoveryMode===item.id&&styles.toggleActive]}
         accessibilityLabel={item.label}>
         <Ionicons name={item.icon} size={17} color={discoveryMode===item.id?'#fff':Colors.text}/>
         <Text style={[styles.toggleText,discoveryMode===item.id&&styles.toggleTextActive]}>{item.label}</Text>
       </Pressable>)}
     </View>
   </View>
   <GooglePlacesResults area={area} filter={category} prompt={mood} 
     compact={discoveryMode==='list'} mapMode={discoveryMode==='map'}
      hideHeading/>
   <TasteConceptModal initialView={tasteView} visible={tasteOpen} onClose={()=>{setTasteOpen(false);getTasteFeedback().then(v=>setTasteCount(Object.keys(v).length)).catch(()=>undefined);}}/>
 </ScrollView>;
}
const styles=StyleSheet.create({
 page:{flex:1,backgroundColor:Colors.background},
 content:{paddingHorizontal:Spacing.lg,paddingTop:31,paddingBottom:85},
 brand:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
 logo:{fontSize:34,fontWeight:'900',letterSpacing:-2,color:Colors.text},
 brandRight:{fontSize:12,color:Colors.muted,fontWeight:'600'},
 headline:{fontSize:38,fontWeight:'900',color:Colors.text,letterSpacing:-1.9,lineHeight:45},
 intro:{color:Colors.muted,fontSize:14,lineHeight:21,marginTop:7,marginBottom:25},
 step:{backgroundColor:Colors.card,borderRadius:27,padding:18,marginBottom:16,borderWidth:1,borderColor:Colors.border},
 numberRow:{flexDirection:'row',alignItems:'center',gap:11},
 number:{height:30,width:30,borderRadius:11,backgroundColor:Colors.limeSoft,alignItems:'center',justifyContent:'center'},
 numberText:{color:'#24341C',fontSize:14,fontWeight:'900'},
 stepTitle:{fontSize:19,color:Colors.text,fontWeight:'900',letterSpacing:-.5},
 categoryRow:{flexDirection:'row',gap:8,marginTop:17},
 category:{flex:1,alignItems:'center',justifyContent:'center',gap:8,paddingVertical:15,borderRadius:16,backgroundColor:'#F4F1FA',borderWidth:1,borderColor:Colors.border},
 categoryActive:{backgroundColor:Colors.violet,borderColor:Colors.violet},
 categoryText:{fontSize:11,fontWeight:'800',color:Colors.text},
 categoryTextActive:{color:'#fff'},
 searchBox:{flexDirection:'row',alignItems:'center',gap:10,borderRadius:16,backgroundColor:'#F8F6FC',paddingHorizontal:14,marginTop:12,borderWidth:1,borderColor:Colors.border},
 input:{flex:1,fontSize:13,color:Colors.text,paddingVertical:15},
 currentRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:17},
 currentArea:{flex:1,flexDirection:'row',alignItems:'center',gap:8},
 currentText:{fontSize:16,fontWeight:'800',color:Colors.text,flexShrink:1},
 nearMe:{flexDirection:'row',gap:5,alignItems:'center',backgroundColor:'#F1EBFF',borderRadius:12,paddingHorizontal:11,paddingVertical:10},
 nearMeText:{fontSize:12,fontWeight:'800',color:Colors.violet},
 areas:{gap:8,paddingTop:17,paddingBottom:3},
 areaChip:{paddingHorizontal:14,paddingVertical:10,borderRadius:999,backgroundColor:'#F5F3FA',borderWidth:1,borderColor:Colors.border},
 areaChipActive:{backgroundColor:Colors.limeSoft,borderColor:Colors.limeSoft},
 areaChipText:{fontSize:12,fontWeight:'700',color:Colors.muted},
 areaChipTextActive:{color:'#223519'},
 moreAreas:{paddingHorizontal:13,paddingVertical:10,borderRadius:999,borderWidth:1,borderColor:Colors.border},
 moreText:{color:Colors.violet,fontSize:12,fontWeight:'800'},
 resultsHead:{flexDirection:'column',alignItems:'stretch',marginTop:12,marginBottom:7,gap:13},
 toggle:{flexDirection:'row',alignItems:'center',padding:3,backgroundColor:'#EFECF8',borderRadius:14,width:'100%'},
 toggleBtn:{flex:1,flexDirection:'row',gap:6,alignItems:'center',justifyContent:'center',paddingVertical:12,paddingHorizontal:8,borderRadius:11},
 toggleActive:{backgroundColor:Colors.violet},
 toggleText:{color:Colors.text,fontSize:11,fontWeight:'800'},
 toggleTextActive:{color:'#fff'},
 swipeIntro:{fontSize:12,color:Colors.muted,lineHeight:19,marginTop:8},
 tasteEntry:{borderRadius:25,padding:17,overflow:'hidden',marginBottom:19,borderWidth:1,borderColor:'rgba(112,74,177,.13)'},
 tasteTop:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
 tasteSymbol:{backgroundColor:'rgba(255,255,255,.8)',height:36,width:36,alignItems:'center',justifyContent:'center',borderRadius:12},
 tasteKicker:{color:Colors.violet,fontSize:9,fontWeight:'900',letterSpacing:1.1,flex:1},
 tasteDots:{paddingHorizontal:9,paddingVertical:6,borderRadius:25,backgroundColor:'rgba(255,255,255,.8)'},
 tasteDotsText:{fontSize:13,color:Colors.rose,fontWeight:'900'},
 tasteTitle:{color:Colors.text,fontSize:25,fontWeight:'900',letterSpacing:-1},
 tasteDescription:{fontSize:12,color:Colors.text,lineHeight:19,marginTop:7,marginBottom:12,maxWidth:350},
 tasteMeta:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:14},
 tasteMetaText:{fontSize:11,color:Colors.muted,fontWeight:'800'},
 tasteActions:{flexDirection:'row',alignItems:'center',gap:8},
 tasteStart:{flex:1,backgroundColor:Colors.violet,borderRadius:13,alignItems:'center',paddingVertical:13,paddingHorizontal:11},
 tasteStartText:{color:'#fff',fontSize:12,fontWeight:'900'},
 tasteReview:{flex:1,flexDirection:'row',gap:5,alignItems:'center',justifyContent:'center',
   borderRadius:13,borderWidth:1,borderColor:'rgba(102,69,191,.24)',paddingVertical:13,paddingHorizontal:8,
   backgroundColor:'rgba(255,255,255,.68)'},
 tasteReviewText:{fontSize:11,color:Colors.violet,fontWeight:'900'},
});

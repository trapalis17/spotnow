import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AREAS } from '../lib/places';
import type { SearchArea } from '../lib/places';
import { Colors, Gradients } from '../constants/theme';

export function AreaSelector({area,onChange,onLocate}:{
  area:SearchArea;onChange:(area:SearchArea)=>void;onLocate:()=>Promise<void>;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.place}>
          <Text style={styles.eyebrow}>✳ CURRENT SCENE</Text>
          <Text style={styles.label}>⌁ {area.label} <Text style={styles.country}>· GREECE</Text></Text>
        </View>
        <Pressable onPress={()=>onLocate().catch(e=>Alert.alert('Τοποθεσία',e instanceof Error?e.message:'Η τοποθεσία δεν είναι διαθέσιμη.'))}
          accessibilityRole="button" accessibilityLabel="Αναζήτηση κοντά μου"
          style={styles.locate}>
          <Text style={styles.locateText}>⌖ NEAR ME</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {AREAS.map(option=>(
          <Pressable key={option.id} onPress={()=>onChange(option)}
            accessibilityRole="button" accessibilityState={{selected:option.id===area.id}}
            style={styles.chip}>
            {option.id===area.id
            ? <LinearGradient colors={Gradients.vibe} style={styles.chipFill}>
                <Text style={styles.selectedText}>✦ {option.label}</Text>
              </LinearGradient>
            : <View style={styles.chipInactive}><Text style={styles.text}>{option.label}</Text></View>}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
const styles=StyleSheet.create({
  container:{marginBottom:19},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14,gap:8},
  place:{flex:1},
  eyebrow:{color:Colors.purple,fontSize:10,letterSpacing:1.4,fontWeight:'900',marginBottom:5},
  label:{color:Colors.text,fontSize:17,fontWeight:'900',letterSpacing:-.4},
  country:{fontWeight:'700',fontSize:11,color:Colors.muted},
  locate:{backgroundColor:'#F1EAFD',borderColor:'rgba(70,121,43,0.25)',borderWidth:1,paddingHorizontal:12,paddingVertical:10,borderRadius:13},
  locateText:{color:Colors.lime,fontSize:10,fontWeight:'900',letterSpacing:.6},
  scroll:{gap:8,paddingRight:6},
  chip:{borderRadius:999,overflow:'hidden'},
  chipFill:{paddingHorizontal:15,paddingVertical:11},
  chipInactive:{paddingHorizontal:15,paddingVertical:10,borderWidth:1,borderColor:Colors.border,borderRadius:999,backgroundColor:Colors.card},
  text:{color:Colors.muted,fontSize:12,fontWeight:'700'},
  selectedText:{color:'#1B2614',fontWeight:'900',fontSize:12},
});

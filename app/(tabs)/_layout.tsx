import { Tabs } from 'expo-router/tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/theme';
export default function TabLayout(){
 return <Tabs screenOptions={{
   headerShown:false,tabBarActiveTintColor:Colors.violet,tabBarInactiveTintColor:'#827A90',
   tabBarLabelStyle:{fontWeight:'800',fontSize:11,marginTop:2},
   tabBarStyle:{backgroundColor:'#FFFFFF',borderTopWidth:1,borderTopColor:Colors.border,height:68,paddingTop:7,paddingBottom:9},
 }}>
   <Tabs.Screen name="index" options={{title:'Ανακάλυψε',tabBarIcon:({color,size})=><Ionicons name="compass-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="saved" options={{title:'Αγαπημένα',tabBarIcon:({color,size})=><Ionicons name="heart-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="profile" options={{title:'Προφίλ',tabBarIcon:({color,size})=><Ionicons name="person-circle-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="explore" options={{href:null}}/>
   <Tabs.Screen name="vibe-now" options={{title:"Vibe Now",tabBarIcon:({color,size})=><Ionicons name="sparkles-outline" color={typeof color==="string"?color:Colors.violet} size={size}/>}}/>
 </Tabs>;
}

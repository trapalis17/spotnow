import { Redirect, useFocusEffect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/theme';
import { getUser } from '../../lib/storage';

export default function TabLayout(){
 const [session,setSession]=useState<'checking'|'active'|'signed-out'>('checking');
 useFocusEffect(useCallback(()=>{
  let active=true;
  getUser().then(user=>{
   if(active)setSession(user?'active':'signed-out');
  }).catch(()=>{if(active)setSession('signed-out');});
  return ()=>{active=false;};
 },[]));
 if(session==='checking')return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:Colors.background}}>
  <ActivityIndicator color={Colors.violet}/>
 </View>;
 if(session==='signed-out')return <Redirect href="/"/>;
 return <Tabs screenOptions={{
   headerShown:false,tabBarActiveTintColor:Colors.violet,tabBarInactiveTintColor:'#827A90',
   tabBarLabelStyle:{fontWeight:'800',fontSize:11,marginTop:2},
   tabBarStyle:{backgroundColor:'#FFFFFF',borderTopWidth:1,borderTopColor:Colors.border,height:68,paddingTop:7,paddingBottom:9},
 }}>
   <Tabs.Screen name="index" options={{title:'Ανακάλυψε',tabBarIcon:({color,size})=><Ionicons name="compass-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="for-you" options={{title:"Για σένα",tabBarIcon:({color,size})=><Ionicons name="sparkles-outline" color={typeof color==="string"?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="saved" options={{title:'Αγαπημένα',tabBarIcon:({color,size})=><Ionicons name="heart-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="profile" options={{title:'Προφίλ',tabBarIcon:({color,size})=><Ionicons name="person-circle-outline" color={typeof color==='string'?color:Colors.violet} size={size}/>}}/>
   <Tabs.Screen name="explore" options={{href:null}}/>
 </Tabs>;
}

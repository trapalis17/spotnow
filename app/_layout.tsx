import {Slot} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../constants/theme';

/** Consistent safe-area canvas for notched phones and web previews. */
export default function RootLayout(){
 return <SafeAreaProvider>
  <SafeAreaView style={{flex:1,backgroundColor:Colors.background}} edges={['top']}>
   <StatusBar style="dark"/>
   <Slot/>
  </SafeAreaView>
 </SafeAreaProvider>;
}

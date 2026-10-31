import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '@/components/PrimaryButton';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { setUser } from '@/lib/storage';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('hello@vibe.app');
  const [password, setPassword] = useState('vibe123');

  const handleCreate = async () => {
    await setUser({
      name,
      email,
      preferences: {
        moods: ['cozy', 'social'],
        outings: ['date night', 'coffee with friends'],
        budget: 60,
        music: ['indie', 'jazz'],
        neighborhoods: ['Kolonaki', 'Plaka'],
        atmosphere: ['warm', 'bright'],
        social: ['small group'],
        timeSlots: ['evening'],
      },
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>vibe<Text style={{color:Colors.lime}}>✳</Text></Text>
      <LinearGradient colors={Gradients.hero} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.banner}>
        <Text style={styles.asterisk}>✳</Text>
        <Text style={styles.bannerText}>YOUR MOOD. YOUR PLACE.</Text>
      </LinearGradient>
      <Text style={styles.eyebrow}>✦ DEMO ACCESS</Text>
      <Text style={styles.title}>Join the vibe ✳</Text>
      <Text style={styles.subtitle}>A fresh start, a better going-out plan.</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#796F89" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#796F89" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#796F89" secureTextEntry />

      <Text style={styles.demo}>Preview only: your info is stored locally on this device.</Text>
      <PrimaryButton label="Start exploring ↗" onPress={handleCreate} />
      <View style={{ height: 12 }} />
      <SecondaryButton label="Back to login" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background,padding:Spacing.xl,justifyContent:'center'},
  brand:{color:Colors.text,fontSize:31,letterSpacing:-2,fontWeight:'900',marginBottom:17},
  banner:{height:128,borderRadius:23,padding:17,marginBottom:26,justifyContent:'flex-end',overflow:'hidden'},
  asterisk:{position:'absolute',fontSize:105,color:'rgba(255,255,255,0.8)',right:42,top:-6,transform:[{rotate:'-12deg'}]},
  bannerText:{color:'#fff',fontWeight:'900',letterSpacing:1.5,fontSize:10},
  eyebrow:{color:Colors.lime,fontWeight:'900',letterSpacing:1.6,fontSize:10,marginBottom:9},
  title:{color:Colors.text,fontWeight:'900',fontSize:34,letterSpacing:-1.3,marginBottom:8},
  subtitle:{color:Colors.muted,fontSize:14,lineHeight:22,marginBottom:24},
  input:{backgroundColor:Colors.card,borderWidth:1,borderColor:'rgba(190,150,255,0.22)',borderRadius:17,padding:16,color:Colors.text,marginBottom:12},
  demo:{color:Colors.purple,fontSize:11,lineHeight:18,marginBottom:16},
});

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, SecondaryButton } from '@/components/PrimaryButton';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { getDemoAccount, getPreferences, setUser } from '@/lib/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getDemoAccount().then(account => {
      if (active && account) setEmail(account.email);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const handleLogin = async () => {
    if (submitting) return;
    const enteredEmail = email.trim();
    if (!enteredEmail.includes('@')) {
      setError('Συμπλήρωσε ένα email για τη demo είσοδο.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const [account, preferences] = await Promise.all([getDemoAccount(), getPreferences()]);
      if (account && account.email.trim().toLowerCase() !== enteredEmail.toLowerCase()) {
        setError('Υπάρχει άλλο demo προφίλ σε αυτή τη συσκευή. Χρησιμοποίησε το email του ή δημιούργησε νέο λογαριασμό.');
        return;
      }
      // UI-only demo access: no passwords are sent, checked or persisted.
      await setUser({
        name: account?.name || enteredEmail.split('@')[0] || 'Vibe explorer',
        email: account?.email || enteredEmail,
        preferences
      });
      router.replace('/(tabs)');
    } catch {
      setError('Δεν ολοκληρώθηκε η demo είσοδος. Δοκίμασε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>vibe<Text style={{color:Colors.lime}}>✳</Text></Text>
      <LinearGradient colors={Gradients.hero} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.banner}>
        <Text style={styles.asterisk}>✳</Text>
        <Text style={styles.bannerText}>YOUR MOOD. YOUR PLACE.</Text>
      </LinearGradient>
      <Text style={styles.eyebrow}>✦ DEMO ACCESS</Text>
      <Text style={styles.title}>Back for more?</Text>
      <Text style={styles.subtitle}>Your next great spot is calling.</Text>

      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#796F89" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#796F89" secureTextEntry />

      <Text style={styles.demo}>Demo είσοδος μόνο σε αυτή τη συσκευή. Ο κωδικός δεν ελέγχεται ούτε αποθηκεύεται.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={submitting ? 'Είσοδος…' : "Let's go ↗"} onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <SecondaryButton label="Create account" onPress={() => router.push('/onboarding')} />
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
  error:{color:Colors.danger,fontSize:12,lineHeight:18,marginBottom:12},
});

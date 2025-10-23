import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { signIn, signInWithGoogle } from '../redux/slices/authSlice'

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  
  const [email, setEmail] = useState('kanhaiya.k23csai@nst.rishihood.edu.in')
  const [password, setPassword] = useState('kanhaiya')

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  try {
    const result = await dispatch(signIn({ email, password })).unwrap();

    // result.user is the Supabase user object
    const user = result.user;

    if (!user) {
      Alert.alert('Error', 'Login failed. Please try again.');
      return;
    }

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      Alert.alert(
        'Email not verified',
        `Please check your email (${user.email}) and verify your account before logging in.`
      );
      return;
    }

    // If verified, continue with navigation (handled by App auth state)
    console.log('Logged in user:', user); // Full user object for debugging

  } catch (error) {
    Alert.alert('Error', error.message ?? error);
  }
};


  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      Alert.alert('Error', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="University Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => Alert.alert('Info', 'Forgot password functionality coming soon')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4285F4',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
})

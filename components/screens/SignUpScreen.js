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
import { signUp, signInWithGoogle } from '../redux/slices/authSlice'

export default function SignUpScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  
  const [name, setName] = useState('kanhaiya')
  const [email, setEmail] = useState('kanhaiya.k23csai@nst.rishihood.edu.in')
  const [password, setPassword] = useState('kanhaiya')
  const [confirmPassword, setConfirmPassword] = useState('kanhaiya')

  const handleSignUp = async () => {
  if (!name || !email || !password) {
    Alert.alert('Error', 'Please fill in all fields')
    return
  }

  // if (!email.endsWith('rishihood.edu.in')) {
  //   Alert.alert('Error', 'Please use a valid Rishihood University email address')
  //   return
  // }

  if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match')
    return
  }

  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters')
    return
  }

  try {
    const { data, error } = await dispatch(signUp({ email, password, name })).unwrap()

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    // Check if email confirmation is required
    if (!data.user?.email_confirmed_at) {
      Alert.alert(
        'Verify your email',
        `A confirmation email has been sent to ${email}. Please verify to complete registration.`
      )
    } else {
      Alert.alert('Success', 'Account created successfully!')
    }
  } catch (error) {
    Alert.alert('Error', error)
  }
}


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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join RishiConnect to connect with your peers</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="University Email (@rishihood.edu.in)"
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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By signing up, you agree to our Terms of Service
        </Text>
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
    fontSize: 34,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    fontWeight: '300',
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4285F4',
    marginBottom: 20,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  terms: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
})

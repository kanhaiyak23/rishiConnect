import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native'
import Animated, { useSharedValue, withDelay, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useDispatch, useSelector } from 'react-redux'
import { signUp, signInWithGoogle } from '../redux/slices/authSlice'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

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

  const titleY = useSharedValue(30)
  const titleOpacity = useSharedValue(0)
  const formOpacity = useSharedValue(0)
  const buttonY = useSharedValue(40)

  useEffect(() => {
    titleY.value = withDelay(150, withSpring(0))
    titleOpacity.value = withDelay(150, withTiming(1, { duration: 400 }))
    formOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
    buttonY.value = withDelay(450, withSpring(0))
  }, [])

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }))

  const formStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value }))
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ translateY: buttonY.value }] }))

  return (
    <LinearGradient
      colors={['#f5f7fa', '#c3cfe2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>Create Account</Animated.Text>
        <Animated.Text style={[styles.subtitle, formStyle]}>Join RishiConnect to connect with your peers</Animated.Text>

        <Animated.View style={formStyle}>
          <BlurView intensity={60} style={styles.glassField}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#888"
            />
          </BlurView>
        </Animated.View>

        <Animated.View style={formStyle}>
          <BlurView intensity={60} style={styles.glassField}>
            <TextInput
              style={styles.input}
              placeholder="University Email (@rishihood.edu.in)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
          </BlurView>
        </Animated.View>

        <Animated.View style={formStyle}>
          <BlurView intensity={60} style={styles.glassField}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />
          </BlurView>
        </Animated.View>

        <Animated.View style={formStyle}>
          <BlurView intensity={60} style={styles.glassField}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />
          </BlurView>
        </Animated.View>

        <AnimatedTouchable
          style={[styles.primaryButton, buttonStyle]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </LinearGradient>
        </AnimatedTouchable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <AnimatedTouchable
          style={[styles.googleButton, buttonStyle]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          <BlurView intensity={70} style={styles.glassButton}>
            <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
          </BlurView>
        </AnimatedTouchable>

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
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  glassField: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#222',
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(66,133,244,0.4)',
  },
  glassButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)'
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

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import Animated, { useSharedValue, withDelay, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import { signUp, signInWithGoogle } from '../redux/slices/authSlice'
import { Ionicons } from '@expo/vector-icons'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function SignUpScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (!agreeToPrivacy) {
      Alert.alert('Error', 'Please agree to the Privacy Policy')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    try {
      const result = await dispatch(signUp({ email, password, name: email.split('@')[0] })).unwrap()
      
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email })
    } catch (error) {
      let message = typeof error === 'string' ? error : error?.message || 'An error occurred during signup.';
      
      if (message === 'EMAIL_EXISTS' || message.includes('already registered')) {
        Alert.alert(
          'Email Already Exists',
          'This email is already registered. Please sign in instead.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
        return;
      } else if (message === 'GOOGLE_OAUTH_EXISTS') {
        Alert.alert(
          'Email Already Registered',
          'This email is already registered with Google. Please use Google Sign-In instead.',
          [
            {
              text: 'Use Google Sign-In',
              onPress: () => handleGoogleSignIn(),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
        return;
      }
      
      Alert.alert('Error', message);
    }
  }


  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      Alert.alert('Error', error)
    }
  }

  const titleOpacity = useSharedValue(0)
  const titleScale = useSharedValue(0.9)
  const formOpacity = useSharedValue(0)
  const buttonOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(0.9)

  useEffect(() => {
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 400 }))
    titleScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 100 }))
    formOpacity.value = withDelay(200, withTiming(1, { duration: 400 }))
    buttonOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
    buttonScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 100 }))
  }, [])

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }))

  const formStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value }))
  const buttonStyle = useAnimatedStyle(() => ({ 
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }))

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.title, titleStyle]}>
          Create an account 👋
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, formStyle]}>
          Create your account in seconds. We'll help you find your perfect match.
        </Animated.Text>

        <Animated.View style={formStyle}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666666"
            />
          </View>
        </Animated.View>

        <Animated.View style={formStyle}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#666666"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.privacyContainer, formStyle]}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToPrivacy(!agreeToPrivacy)}
          >
            <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
              {agreeToPrivacy && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.privacyText}>
              I agree to RishiConnect <Text style={styles.privacyLink}>Privacy Policy.</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <AnimatedTouchable
          style={[styles.signUpButton, buttonStyle]}
          onPress={handleSignUp}
          disabled={loading || !agreeToPrivacy}
          activeOpacity={0.85}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Creating Account...' : 'Sign up'}
          </Text>
        </AnimatedTouchable>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.signInLink}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLinkText}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 40,
    fontWeight: '400',
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  privacyContainer: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  privacyLink: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    opacity: 1,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  signInText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  signInLinkText: {
    color: '#FF6B6B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})

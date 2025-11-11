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
import { useDispatch, useSelector } from 'react-redux'
import { signIn, signInWithGoogle } from '../redux/slices/authSlice'
import { Ionicons } from '@expo/vector-icons'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
    let message = typeof error === 'string' ? error : error?.message || 'An error occurred during login.';
    
    // Handle specific error cases
    if (message === 'GOOGLE_OAUTH_EXISTS') {
      Alert.alert(
        'Email Registered with Google',
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
};


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
      
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>
          Welcome back 👋
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, formStyle]}>
          Please enter your email & password to sign in.
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

        <Animated.View style={[styles.optionsContainer, formStyle]}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Info', 'Forgot password functionality coming soon')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </Animated.View>

        <AnimatedTouchable
          style={[styles.loginButton, buttonStyle]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Log in'}
          </Text>
        </AnimatedTouchable>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>
            Don't have an account? <Text style={styles.signUpLinkText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  signUpLinkText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
})

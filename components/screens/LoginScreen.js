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
import { useBottomSheet } from '../../context/BottomSheetContext'
import AuroraBackground from '../ui/AuroraBackground'
import FadeInUp from '../ui/FadeInUp'
import GlassInput from '../ui/GlassInput'
import GradientButton from '../ui/GradientButton'
import { theme } from '../ui/theme'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  const { showBottomSheet } = useBottomSheet()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  

  const handleLogin = async () => {
    if (!email || !password) {
      showBottomSheet('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(signIn({ email, password })).unwrap();

      // result.user is the Supabase user object
      const user = result.user;

      if (!user) {
        showBottomSheet('Error', 'Login failed. Please try again.');
        return;
      }

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        showBottomSheet(
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
        showBottomSheet(
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

      showBottomSheet('Error', message);
    }
  };


  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      showBottomSheet('Error', error)
    }
  }

  return (
    <AuroraBackground>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <FadeInUp delay={100}>
          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>Sign in to pick up where you left off.</Text>
        </FadeInUp>

        <FadeInUp delay={250}>
          <GlassInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </FadeInUp>

        <FadeInUp delay={350}>
          <GlassInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secure
          />
        </FadeInUp>

        <FadeInUp delay={420} style={styles.forgotRow}>
          <TouchableOpacity
            onPress={() => showBottomSheet('Info', 'Forgot password functionality coming soon')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </FadeInUp>

        <FadeInUp delay={500}>
          <GradientButton title="Log in" onPress={handleLogin} loading={loading} />
        </FadeInUp>

        <FadeInUp delay={600}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpLink}>
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpLinkText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </FadeInUp>
      </View>
    </AuroraBackground>
  )
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.surfaceBorder,
  },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 130 },
  title: { fontSize: 34, fontWeight: '800', color: theme.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.textMuted, marginBottom: 36, lineHeight: 22 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotPasswordText: { fontSize: 14, color: theme.primary, fontWeight: '600' },
  signUpLink: { alignItems: 'center', marginTop: 24 },
  signUpText: { fontSize: 15, color: theme.textMuted },
  signUpLinkText: { color: theme.primary, fontWeight: '700' },
})

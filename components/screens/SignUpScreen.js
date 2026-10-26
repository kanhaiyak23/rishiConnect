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
import { useBottomSheet } from '../../context/BottomSheetContext'
import AuroraBackground from '../ui/AuroraBackground'
import FadeInUp from '../ui/FadeInUp'
import GlassInput from '../ui/GlassInput'
import GradientButton from '../ui/GradientButton'
import { theme } from '../ui/theme'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function SignUpScreen({ navigation }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  const { showBottomSheet } = useBottomSheet()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      showBottomSheet('Error', 'Please fill in all fields')
      return
    }

    

    if (password.length < 6) {
      showBottomSheet('Error', 'Password must be at least 6 characters')
      return
    }
   



    try {
      const result = await dispatch(signUp({ email, password, name: email.split('@')[0] })).unwrap()

      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email })
    } catch (error) {
      let message = typeof error === 'string' ? error : error?.message || 'An error occurred during signup.';

      if (message === 'EMAIL_EXISTS' || message.includes('already registered')) {
        showBottomSheet(
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
        showBottomSheet(
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

      showBottomSheet('Error', message);
    }
  }


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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInUp delay={100}>
          <Text style={styles.title}>Create an account ✨</Text>
          <Text style={styles.subtitle}>
            Create your account in seconds. We'll help you find your perfect match.
          </Text>
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

        <FadeInUp delay={450} style={{ marginTop: 12 }}>
          <GradientButton title="Sign up" onPress={handleSignUp} loading={loading} />
        </FadeInUp>

        <FadeInUp delay={550}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signUpLink}>
            <Text style={styles.signUpText}>
              Already have an account? <Text style={styles.signUpLinkText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </FadeInUp>
      </ScrollView>
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

import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { signInWithGoogle } from '../redux/slices/authSlice'
import { useBottomSheet } from '../../context/BottomSheetContext'
import AuroraBackground from '../ui/AuroraBackground'
import FadeInUp from '../ui/FadeInUp'
import GradientButton from '../ui/GradientButton'
import { theme } from '../ui/theme'

const APressable = Animated.createAnimatedComponent(Pressable)

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch()
  const { showBottomSheet } = useBottomSheet()
  const float = useSharedValue(0)
  const googleScale = useSharedValue(1)

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    )
  }, [])

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }))
  const googleStyle = useAnimatedStyle(() => ({ transform: [{ scale: googleScale.value }] }))

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      showBottomSheet('Error', error || 'Failed to sign in with Google')
    }
  }

  return (
    <AuroraBackground>
      <View style={styles.content}>
        <FadeInUp delay={100} style={styles.hero}>
          <Animated.View style={[styles.iconGlow, floatStyle]}>
            <Image
              source={require('../../assets/iconf.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.appName}>RishiConnect</Text>
          <Text style={styles.description}>Meet people who match your vibe.</Text>
        </FadeInUp>

        <View style={styles.buttons}>
          <FadeInUp delay={450}>
            <APressable
              onPressIn={() => (googleScale.value = withSpring(0.96))}
              onPressOut={() => (googleScale.value = withSpring(1))}
              onPress={handleGoogleSignIn}
              style={[styles.googleButton, googleStyle]}
            >
              <Image
                source={require('../../assets/google-logo.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleText}>Continue with Google</Text>
            </APressable>
          </FadeInUp>

          <FadeInUp delay={550} style={{ marginTop: 14 }}>
            <GradientButton title="Log in" onPress={() => navigation.navigate('Login')} />
          </FadeInUp>

          <FadeInUp delay={650}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpLink}>
              <Text style={styles.signUpText}>
                Don't have an account? <Text style={styles.signUpLinkText}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </FadeInUp>
        </View>
      </View>
    </AuroraBackground>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconGlow: {
    shadowColor: theme.primary,
    shadowOpacity: 0.7,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  appIcon: { width: 110, height: 110 },
  appName: {
    fontSize: 40,
    color: theme.text,
    fontWeight: '800',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  description: { fontSize: 16, color: theme.textMuted, marginTop: 8, textAlign: 'center' },
  buttons: { paddingBottom: 50 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },
  signUpLink: { alignItems: 'center', marginTop: 22 },
  signUpText: { color: theme.textMuted, fontSize: 15 },
  signUpLinkText: { color: theme.primary, fontWeight: '700' },
})

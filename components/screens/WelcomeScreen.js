import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { signInWithGoogle } from '../redux/slices/authSlice'
import { Ionicons } from '@expo/vector-icons'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch()
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const descOpacity = useSharedValue(0)
  const button1Opacity = useSharedValue(0)
  const button1Scale = useSharedValue(0.8)
  const button2Opacity = useSharedValue(0)
  const button2Scale = useSharedValue(0.8)
  const button3Opacity = useSharedValue(0)
  const button3Scale = useSharedValue(0.8)
  const button4Opacity = useSharedValue(0)
  const button4Scale = useSharedValue(0.8)
  const button5Opacity = useSharedValue(0)
  const button5Scale = useSharedValue(0.8)

  useEffect(() => {
    logoScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }))
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 500 }))
    descOpacity.value = withDelay(250, withTiming(1, { duration: 400 }))
    
    // Buttons animate in quickly with fade + scale
    button1Opacity.value = withDelay(400, withTiming(1, { duration: 400 }))
    button1Scale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 100 }))
    
    button2Opacity.value = withDelay(450, withTiming(1, { duration: 400 }))
    button2Scale.value = withDelay(450, withSpring(1, { damping: 10, stiffness: 100 }))
    
    button3Opacity.value = withDelay(500, withTiming(1, { duration: 400 }))
    button3Scale.value = withDelay(500, withSpring(1, { damping: 10, stiffness: 100 }))
    
    button4Opacity.value = withDelay(550, withTiming(1, { duration: 400 }))
    button4Scale.value = withDelay(550, withSpring(1, { damping: 10, stiffness: 100 }))
    
    button5Opacity.value = withDelay(600, withTiming(1, { duration: 400 }))
    button5Scale.value = withDelay(600, withSpring(1, { damping: 10, stiffness: 100 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }))

  const button1Style = useAnimatedStyle(() => ({
    opacity: button1Opacity.value,
    transform: [{ scale: button1Scale.value }],
  }))

  const button2Style = useAnimatedStyle(() => ({
    opacity: button2Opacity.value,
    transform: [{ scale: button2Scale.value }],
  }))

  const button3Style = useAnimatedStyle(() => ({
    opacity: button3Opacity.value,
    transform: [{ scale: button3Scale.value }],
  }))

  const button4Style = useAnimatedStyle(() => ({
    opacity: button4Opacity.value,
    transform: [{ scale: button4Scale.value }],
  }))

  const button5Style = useAnimatedStyle(() => ({
    opacity: button5Opacity.value,
    transform: [{ scale: button5Scale.value }],
  }))

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap()
    } catch (error) {
      Alert.alert('Error', error || 'Failed to sign in with Google')
    }
  }

  const handleAppleSignIn = () => {
    Alert.alert('Coming Soon', 'Apple Sign In will be available soon')
  }

  const handleFacebookSignIn = () => {
    Alert.alert('Coming Soon', 'Facebook Sign In will be available soon')
  }

  const handleTwitterSignIn = () => {
    Alert.alert('Coming Soon', 'Twitter Sign In will be available soon')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../assets/iconf.png')} 
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        <Text style={styles.appName}>RishiConnect</Text>
        <Animated.Text style={[styles.description, descStyle]}>
          Let's dive in into your account!
        </Animated.Text>
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedTouchable
          style={[styles.socialButton, button1Style]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.socialButtonContent}>
            <View style={styles.googleIconContainer}>
              <View style={styles.googleIconBackground}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
            </View>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </View>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.socialButton, button2Style]}
          onPress={handleAppleSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.socialButtonContent}>
            <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </View>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.socialButton, button3Style]}
          onPress={handleFacebookSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.socialButtonContent}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </View>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.socialButton, button4Style]}
          onPress={handleTwitterSignIn}
          activeOpacity={0.8}
        >
          <View style={styles.socialButtonContent}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            <Text style={styles.socialButtonText}>Continue with Twitter</Text>
          </View>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.loginButton, button5Style]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 20,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  socialButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleIconBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  signUpText: {
    color: '#999999',
    fontSize: 16,
  },
  signUpLinkText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
})

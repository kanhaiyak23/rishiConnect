import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import RishiConnectLogo from '../RishiConnectLogo'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function WelcomeScreen({ navigation }) {
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const button1Y = useSharedValue(50)
  const button2Y = useSharedValue(50)
  const descOpacity = useSharedValue(0)

  useEffect(() => {
    logoScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 80 }))
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }))
    descOpacity.value = withDelay(600, withTiming(1, { duration: 400 }))
    button1Y.value = withDelay(800, withSpring(0, { damping: 10, stiffness: 60 }))
    button2Y.value = withDelay(900, withSpring(0, { damping: 10, stiffness: 60 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }))

  const button1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: button1Y.value }],
  }))

  const button2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: button2Y.value }],
  }))

  return (
    <LinearGradient
      colors={['#f5f7fa', '#c3cfe2', '#f093fb', '#f5576c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to</Text>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <RishiConnectLogo size="xlarge" />
        </Animated.View>
        <Animated.Text style={[styles.description, descStyle]}>
          Connect with fellow Rishihood University students and build meaningful relationships
        </Animated.Text>
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedTouchable
          style={[styles.primaryButton, button1Style]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </LinearGradient>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[styles.secondaryButton, button2Style]}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.8}
        >
          <BlurView intensity={80} style={styles.glassButton}>
            <Text style={styles.secondaryButtonText}>Sign Up</Text>
          </BlurView>
        </AnimatedTouchable>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    color: '#333',
    fontWeight: '300',
    marginBottom: 20,
    letterSpacing: 1,
  },
  logoWrapper: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 30,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  primaryButton: {
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  gradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  glassButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: '#764ba2',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
})

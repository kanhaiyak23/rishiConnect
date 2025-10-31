import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import RishiConnectLogo from '../RishiConnectLogo'

export default function SplashScreen({ navigation }) {
  const scale = useSharedValue(0.5)
  const rotate = useSharedValue(0)
  const opacity = useSharedValue(0)
  const glow = useSharedValue(0.3)

  useEffect(() => {
    // Logo entrance animation
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 80 }))
    opacity.value = withDelay(200, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }))
    
    // Floating glow effect
    glow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    )

    // Gentle rotation
    rotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    )
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }))

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Animated glow effect */}
      <Animated.View style={[styles.glow, glowStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Main logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <RishiConnectLogo size="xlarge" showIcon={true} />
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 200,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
})

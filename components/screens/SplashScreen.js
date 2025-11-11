import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function SplashScreen({ navigation }) {
  const logoScale = useSharedValue(0.8)
  const logoOpacity = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const titleY = useSharedValue(20)
  const loadingOpacity = useSharedValue(0)
  
  // Heart animations for scattered hearts
  const heart1Opacity = useSharedValue(0.3)
  const heart2Opacity = useSharedValue(0.3)
  const heart3Opacity = useSharedValue(0.3)
  const heart4Opacity = useSharedValue(0.3)
  const heart5Opacity = useSharedValue(0.3)
  const heart6Opacity = useSharedValue(0.3)
  const heart7Opacity = useSharedValue(0.3)
  const heart8Opacity = useSharedValue(0.3)

  useEffect(() => {
    // Logo animation
    logoScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }))
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
    
    // Title animation
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
    titleY.value = withDelay(400, withSpring(0, { damping: 10, stiffness: 100 }))
    
    // Loading indicator
    loadingOpacity.value = withDelay(600, withTiming(1, { duration: 400 }))
    
    // Floating hearts animation
    heart1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart3Opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart4Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart5Opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart6Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart7Opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    heart8Opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }))

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }))

  const heart1Style = useAnimatedStyle(() => ({ opacity: heart1Opacity.value }))
  const heart2Style = useAnimatedStyle(() => ({ opacity: heart2Opacity.value }))
  const heart3Style = useAnimatedStyle(() => ({ opacity: heart3Opacity.value }))
  const heart4Style = useAnimatedStyle(() => ({ opacity: heart4Opacity.value }))
  const heart5Style = useAnimatedStyle(() => ({ opacity: heart5Opacity.value }))
  const heart6Style = useAnimatedStyle(() => ({ opacity: heart6Opacity.value }))
  const heart7Style = useAnimatedStyle(() => ({ opacity: heart7Opacity.value }))
  const heart8Style = useAnimatedStyle(() => ({ opacity: heart8Opacity.value }))

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E', '#FFB3B3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Scattered Hearts Background */}
      <Animated.View style={[styles.heart, styles.heart1, heart1Style]}>
        <Ionicons name="heart" size={24} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart2, heart2Style]}>
        <Ionicons name="heart" size={20} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart3, heart3Style]}>
        <Ionicons name="heart" size={18} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart4, heart4Style]}>
        <Ionicons name="heart" size={22} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart5, heart5Style]}>
        <Ionicons name="heart" size={16} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart6, heart6Style]}>
        <Ionicons name="heart" size={20} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart7, heart7Style]}>
        <Ionicons name="heart" size={19} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.heart, styles.heart8, heart8Style]}>
        <Ionicons name="heart" size={17} color="#FFFFFF" />
      </Animated.View>

      <View style={styles.content}>
        {/* App Icon */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image 
            source={require('../../assets/iconf.png')} 
            style={styles.appIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name */}
        <Animated.Text style={[styles.appName, titleStyle]}>
          RishiConnect
        </Animated.Text>
      </View>

      {/* Loading Indicator */}
      <Animated.View style={[styles.loadingContainer, loadingStyle]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </Animated.View>
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
  },
  // Scattered Hearts
  heart: {
    position: 'absolute',
  },
  heart1: {
    top: '15%',
    left: '10%',
    opacity: 0.4,
  },
  heart2: {
    top: '25%',
    right: '15%',
    opacity: 0.35,
  },
  heart3: {
    top: '40%',
    left: '8%',
    opacity: 0.4,
  },
  heart4: {
    top: '50%',
    right: '12%',
    opacity: 0.35,
  },
  heart5: {
    top: '65%',
    left: '20%',
    opacity: 0.4,
  },
  heart6: {
    top: '75%',
    right: '8%',
    opacity: 0.35,
  },
  heart7: {
    top: '30%',
    left: '50%',
    opacity: 0.4,
  },
  heart8: {
    top: '60%',
    right: '25%',
    opacity: 0.35,
  },
  // Logo
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
})

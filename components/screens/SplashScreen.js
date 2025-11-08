import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

export default function SplashScreen({ navigation }) {
  const heartScale = useSharedValue(0.5)
  const heartOpacity = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const taglineOpacity = useSharedValue(0)

  useEffect(() => {
    // Heart icon entrance animation
    heartScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }))
    heartOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
    
    // Title fade in
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }))
    
    // Tagline fade in
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
  }, [])

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }))

  return (
    <LinearGradient
      colors={['#FF6B9D', '#C44569', '#8B4A9C', '#6B3FA0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Heart Icon */}
        <Animated.View style={[styles.heartContainer, heartStyle]}>
          <Text style={styles.heartIcon}>❤️</Text>
        </Animated.View>

        {/* App Name */}
        <Animated.Text style={[styles.appName, titleStyle]}>
          RishiConnect
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Your Campus, Your Circle
        </Animated.Text>
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
  },
  heartContainer: {
    marginBottom: 20,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  heartIcon: {
    fontSize: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    opacity: 0.95,
  },
})

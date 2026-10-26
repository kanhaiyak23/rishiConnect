import React, { useEffect } from 'react'
import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from './theme'

const APressable = Animated.createAnimatedComponent(Pressable)

export default function GradientButton({ title, onPress, loading, disabled, style }) {
  const scale = useSharedValue(1)
  const glow = useSharedValue(0)

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true)
  }, [])

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glow.value * 0.3,
    shadowRadius: 12 + glow.value * 10,
  }))

  return (
    <APressable
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12 }))}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, animated, style]}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </APressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gradient: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
})

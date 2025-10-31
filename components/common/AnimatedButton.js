import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function AnimatedButton({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  style 
}) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    )
    onPress()
  }

  const gradientColors = 
    variant === 'primary' 
      ? ['#667eea', '#764ba2'] 
      : variant === 'secondary'
      ? ['#f093fb', '#f5576c']
      : ['#667eea', '#764ba2']

  return (
    <AnimatedTouchable
      style={[styles.button, style, animatedStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={['#ffffff', '#f0f0f0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, variant === 'outline' && { borderWidth: 2, borderColor: '#764ba2' }]}
        >
          <Text style={[styles.text, variant === 'outline' && { color: '#764ba2' }]}>
            {title}
          </Text>
        </LinearGradient>
      )}
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})


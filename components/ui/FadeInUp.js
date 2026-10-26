import React, { useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
} from 'react-native-reanimated'

export default function FadeInUp({ delay = 0, distance = 24, style, children }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 500 }))
  }, [])

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }))

  return <Animated.View style={[animated, style]}>{children}</Animated.View>
}

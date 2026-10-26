import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from './theme'

function Blob({ color, size, top, left, dx, dy, duration }) {
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * dx },
      { translateY: t.value * dy },
      { scale: 1 + t.value * 0.2 },
    ],
  }))

  return (
    <Animated.View
      style={[
        { position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2, opacity: 0.55 }}
      />
    </Animated.View>
  )
}

export default function AuroraBackground({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      <Blob color="#FF5E7E" size={340} top={-90} left={-110} dx={70} dy={60} duration={7000} />
      <Blob color="#8B5CF6" size={380} top={260} left={120} dx={-80} dy={70} duration={9000} />
      <Blob color="#FF8A5C" size={280} top={560} left={-90} dx={60} dy={-70} duration={8000} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, overflow: 'hidden' },
})

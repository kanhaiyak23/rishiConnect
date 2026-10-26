import React, { useEffect } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import AuroraBackground from '../ui/AuroraBackground'
import { theme } from '../ui/theme'

function Dot({ delay }) {
  const t = useSharedValue(0.3)
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 450 }), withTiming(0.3, { duration: 450 })), -1)
    )
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.7 + t.value * 0.5 }] }))
  return <Animated.View style={[styles.dot, style]} />
}

export default function SplashScreen() {
  const logoScale = useSharedValue(0.5)
  const logoOpacity = useSharedValue(0)
  const pulse = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const titleY = useSharedValue(20)
  const dotsOpacity = useSharedValue(0)

  useEffect(() => {
    logoScale.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 90 }))
    logoOpacity.value = withDelay(150, withTiming(1, { duration: 600 }))
    pulse.value = withDelay(
      700,
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true)
    )
    titleOpacity.value = withDelay(450, withTiming(1, { duration: 600 }))
    titleY.value = withDelay(450, withSpring(0, { damping: 12 }))
    dotsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * (1 + pulse.value * 0.05) }],
    shadowOpacity: 0.4 + pulse.value * 0.4,
  }))
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }))
  const dotsStyle = useAnimatedStyle(() => ({ opacity: dotsOpacity.value }))

  return (
    <AuroraBackground>
      <View style={styles.content}>
        <Animated.View style={[styles.logo, logoStyle]}>
          <Image source={require('../../assets/iconf.png')} style={styles.appIcon} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[styles.appName, titleStyle]}>RishiConnect</Animated.Text>
      </View>
      <Animated.View style={[styles.dots, dotsStyle]}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </Animated.View>
    </AuroraBackground>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: {
    shadowColor: theme.primary,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  appIcon: { width: 120, height: 120 },
  appName: { fontSize: 40, fontWeight: '800', color: theme.text, marginTop: 28, letterSpacing: 0.5 },
  dots: { position: 'absolute', bottom: 70, alignSelf: 'center', flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary },
})

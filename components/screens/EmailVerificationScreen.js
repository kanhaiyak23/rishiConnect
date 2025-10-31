import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { useSharedValue, withDelay, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

export default function EmailVerificationScreen({ navigation }) {
  const iconScale = useSharedValue(0)
  const cardOpacity = useSharedValue(0)

  useEffect(() => {
    iconScale.value = withDelay(150, withSpring(1))
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
  }, [])

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }))
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }))

  return (
    <LinearGradient
      colors={['#f5f7fa', '#c3cfe2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.icon, iconStyle]}>📧</Animated.Text>
        <Animated.View style={[styles.card, cardStyle]}>
          <BlurView intensity={70} style={styles.blur}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.description}>
              We've sent a verification link to your university email address.
              Please click on the link to activate your account.
            </Text>
            <Text style={styles.subDescription}>
              Once verified, you can login and start connecting with fellow students!
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
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
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  blur: {
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  subDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

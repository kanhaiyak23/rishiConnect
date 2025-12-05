import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import Animated, { useSharedValue, withDelay, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch } from 'react-redux'
import { supabase } from '../lib/supabase'
import { useBottomSheet } from '../../context/BottomSheetContext'

export default function EmailVerificationScreen({ navigation, route }) {
  const dispatch = useDispatch()
  const email = route?.params?.email || ''
  const [resending, setResending] = useState(false)
  const { showBottomSheet } = useBottomSheet()

  const iconScale = useSharedValue(0)
  const cardOpacity = useSharedValue(0)

  useEffect(() => {
    iconScale.value = withDelay(150, withSpring(1))
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
  }, [])

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }))
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }))

  const maskEmail = (email) => {
    if (!email) return ''
    const [localPart, domain] = email.split('@')
    if (!localPart || !domain) return email
    const visibleChars = Math.max(2, Math.floor(localPart.length * 0.3))
    const masked = localPart.substring(0, visibleChars) + '*'.repeat(localPart.length - visibleChars)
    return `${masked}@${domain}`
  }

  const handleResendEmail = async () => {
    if (!email) {
      showBottomSheet('Error', 'Email address not found')
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'rishiconnect://auth/callback',
        },
      })

      if (error) throw error

      showBottomSheet('Success', 'Verification email has been resent!')
    } catch (error) {
      showBottomSheet('Error', error.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const handleVerified = () => {
    navigation.navigate('Login')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerCircle}>
              <Ionicons name="mail-outline" size={60} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.description}>
            We have sent an email to {maskEmail(email)}. Click the link inside to get started.
          </Text>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendEmail}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <Text style={styles.resendText}>Resend email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.verifiedButton}
            onPress={handleVerified}
          >
            <Text style={styles.verifiedButtonText}>I've verified my email</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  resendButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  verifiedButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
})

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export default function RishiConnectLogo({ size = 'medium', showIcon = true, style }) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 16, marginBottom: 2, iconSize: 28 }
      case 'large':
        return { fontSize: 32, marginBottom: 8, iconSize: 56 }
      case 'xlarge':
        return { fontSize: 48, marginBottom: 12, iconSize: 84 }
      default:
        return { fontSize: 24, marginBottom: 4, iconSize: 42 }
    }
  }

  const sizeStyles = getSizeStyles()

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <LinearGradient
          colors={['#FE3C72', '#FD5068', '#FF8B02']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.icon, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}
        >
          <Text style={[styles.iconText, { fontSize: sizeStyles.iconSize * 0.6 }]}>🔥</Text>
        </LinearGradient>
      )}
      <Text style={[styles.logoText, { fontSize: sizeStyles.fontSize, marginTop: sizeStyles.marginBottom }]}>
        RishiConnect
      </Text>
      {size !== 'small' && (
        <Text style={[styles.tagline, { fontSize: sizeStyles.fontSize * 0.5 }]}>
          Connect with fellow students
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    color: '#FFFFFF',
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: 2,
    color: '#FF6B6B',
  },
  tagline: {
    fontWeight: '300',
    letterSpacing: 0.5,
    color: '#666',
    marginTop: 4,
  },
})


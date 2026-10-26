import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { theme } from './theme'

export default function GlassInput({ icon, secure, ...props }) {
  const [show, setShow] = useState(false)
  const focus = useSharedValue(0)

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: focus.value ? theme.primary : theme.surfaceBorder,
    transform: [{ scale: 1 + focus.value * 0.015 }],
  }))

  return (
    <Animated.View style={[styles.wrap, borderStyle]}>
      <BlurView intensity={25} tint="dark" style={styles.blur}>
        {icon && <Ionicons name={icon} size={20} color={theme.textMuted} style={styles.icon} />}
        <TextInput
          {...props}
          style={styles.input}
          secureTextEntry={secure && !show}
          placeholderTextColor={theme.textFaint}
          onFocus={() => (focus.value = withTiming(1, { duration: 200 }))}
          onBlur={() => (focus.value = withTiming(0, { duration: 200 }))}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} hitSlop={10}>
            <Ionicons
              name={show ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: theme.surface,
  },
  blur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 },
  icon: { marginRight: 12 },
  input: { flex: 1, color: theme.text, fontSize: 16, paddingVertical: 0 },
})

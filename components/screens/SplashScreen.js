import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>RishiConnect</Text>
      <Text style={styles.subtitle}>Connect with fellow students</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
})

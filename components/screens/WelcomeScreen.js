import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>RishiConnect</Text>
        <Text style={styles.description}>
          Connect with fellow Rishihood University students and build meaningful relationships
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    color: '#666',
    marginBottom: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

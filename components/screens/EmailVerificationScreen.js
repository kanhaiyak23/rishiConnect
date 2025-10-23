import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function EmailVerificationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📧</Text>
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

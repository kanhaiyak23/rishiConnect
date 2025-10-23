import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react'
import { supabase } from './lib/supabase'
export default function App() {
  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1)
      if (error) console.log('Connection Error:', error)
      else console.log('Connected! Profiles:', data)
    }
    checkConnection()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Supabase Connected ✅</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

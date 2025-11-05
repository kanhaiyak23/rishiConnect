import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { updateProfile, fetchProfile } from '../redux/slices/profileSlice'
import { supabase } from '../lib/supabase'

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile, loading } = useSelector((state) => state.profile)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [year, setYear] = useState('')
  const [major, setMajor] = useState('')
  const [interests, setInterests] = useState('')
  const [photo, setPhoto] = useState(null) // { uri, base64 } or null
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Ensure profile is loaded
    if (user && !profile) {
      dispatch(fetchProfile(user.id))
    }
  }, [user, profile, dispatch])

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setYear(profile.year || '')
      setMajor(profile.major || '')
      setInterests((profile.interests || []).join(', '))
      // Keep existing photo via URL; new selection will override
    }
  }, [profile])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photos')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled) {
      setPhoto({ uri: result.assets[0].uri, base64: result.assets[0].base64 })
    }
  }

  const handleSave = async () => {
    if (!name || !year || !major) {
      Alert.alert('Error', 'Please fill in Name, Year and Major')
      return
    }

    setSaving(true)
    let photoUrl = profile?.photo_url || null

    try {
      // If a new photo was selected, upload it
      if (photo?.base64) {
        const fileExt = (photo.uri.split('.').pop() || 'jpg').toLowerCase()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const contentType = `image/${fileExt}`
        const arrayBuffer = decode(photo.base64)

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, arrayBuffer, { contentType, upsert: false })

        if (uploadError) throw uploadError

        const { data: pub } = supabase.storage.from('profile-photos').getPublicUrl(fileName)
        photoUrl = pub.publicUrl
      }

      const updated = {
        name,
        bio,
        year,
        major,
        interests: interests
          .split(',')
          .map(i => i.trim())
          .filter(Boolean),
        photo_url: photoUrl,
      }

      const result = await dispatch(updateProfile({ userId: user.id, profileData: updated })).unwrap()
      if (result) {
        Alert.alert('Success', 'Profile updated successfully')
        navigation.goBack()
      }
    } catch (e) {
      Alert.alert('Update Failed', e.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  const currentPhotoUri = photo?.uri || profile?.photo_url || 'https://via.placeholder.com/150'

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your details</Text>

        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Image source={{ uri: currentPhotoUri }} style={styles.photo} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.textArea}
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={200}
        />

        <TextInput
          style={styles.input}
          placeholder="Academic Year (e.g., 2024)"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Major/Department"
          value={major}
          onChangeText={setMajor}
        />

        <TextInput
          style={styles.input}
          placeholder="Interests (comma separated, e.g., coding, cricket)"
          value={interests}
          onChangeText={setInterests}
        />

        <TouchableOpacity
          style={[styles.saveButton, (saving || loading) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontWeight: '300',
  },
  photoButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    backgroundColor: '#F8F8F8',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})


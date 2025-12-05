import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { updateProfile, fetchProfile } from '../redux/slices/profileSlice'
import { supabase } from '../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useBottomSheet } from '../../context/BottomSheetContext'

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile, loading } = useSelector((state) => state.profile)
  const { showBottomSheet } = useBottomSheet()

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
      showBottomSheet('Permission needed', 'We need permission to access your photos')
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
      showBottomSheet('Error', 'Please fill in Name, Year and Major')
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
        showBottomSheet('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      }
    } catch (e) {
      showBottomSheet('Update Failed', e.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  const currentPhotoUri = photo?.uri || profile?.photo_url || 'https://placehold.co/150/2A2A2A/FF6B6B?text=No+Photo'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Image source={{ uri: currentPhotoUri }} style={styles.photo} />
          <View style={styles.photoEditOverlay}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Two-column row: Nickname */}
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Nickname"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Two-column row: Year and Major */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              placeholder="Year"
              placeholderTextColor="#666666"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              placeholder="Major"
              placeholderTextColor="#666666"
              value={major}
              onChangeText={setMajor}
            />
          </View>
        </View>

        {/* Full-width: Interests */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interests</Text>
          <TextInput
            style={styles.input}
            placeholder="Interests (comma separated)"
            placeholderTextColor="#666666"
            value={interests}
            onChangeText={setInterests}
          />
        </View>

        {/* Full-width: About Me */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#666666"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

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
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#333333',
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#FFFFFF',
    height: 120,
    borderWidth: 1,
    borderColor: '#333333',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 32,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})


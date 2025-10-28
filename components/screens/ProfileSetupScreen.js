import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../redux/slices/profileSlice'
import { supabase } from '../lib/supabase'
// REMOVED FileSystem as it's no longer needed for this
// import * as FileSystem from 'expo-file-system' 

// +++ IMPORT THE DECODER +++
import { decode } from 'base64-arraybuffer'

export default function ProfileSetupScreen({ navigation, route }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState('')
  const [year, setYear] = useState('')
  const [major, setMajor] = useState('')
  const [interests, setInterests] = useState('')
  const [photo, setPhoto] = useState(null) // This will now hold an object: { uri, base64 }
  const [loading, setLoading] = useState(false)

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
      base64: true, // This is correct
    })

    if (!result.canceled) {
      // +++ STORE BOTH URI AND BASE64 +++
      setPhoto({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      })
    }
  }

  const handleComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Redux user ID:", user.id);
      console.log("Supabase session user ID:", session?.user?.id);
      
      if (session?.user?.id !== user.id) {
        Alert.alert("Auth Mismatch", "The Supabase client is not authenticated as the correct user. Please log out and log back in.");
        return;
      }
    } catch (e) {
      console.error("Error getting session", e);
      return;
    }
    if (!bio || !year || !major) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    
    let photoUrl = null
    
    // Upload photo to Supabase Storage if selected
    if (photo) { // 'photo' is now an object
      try {
        // +++ 1. Get Base64 and file extension from the state object +++
        const base64 = photo.base64
        const fileExt = photo.uri.split('.').pop() // Get extension from the URI
        
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        const contentType = `image/${fileExt}`

        // +++ 2. Decode the Base64 string into an ArrayBuffer +++
        const arrayBuffer = decode(base64)

        // +++ 3. Upload the ArrayBuffer +++
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, arrayBuffer, { // Pass the ArrayBuffer
            contentType: contentType,
            upsert: false,
          })

        if (uploadError) throw uploadError

        // +++ 4. Get the public URL +++
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName)

        photoUrl = publicUrl

      } catch (error) {
        console.error('Error uploading image:', error.message)
        Alert.alert('Upload Error', 'Failed to upload your photo. Please try again.')
        setLoading(false) // Stop loading if upload fails
        return // Stop execution
      }
    }
    
    // --- This part runs only if photo upload is skipped or successful ---
    try {
      // Create profile
      const newProfileData = {
        id: user.id,
        name: user.user_metadata.name,
        bio,
        year,
        major,
        interests: interests.split(',').map(i => i.trim()).filter(i => i),
        photo_url: photoUrl,
        is_complete: true,
      };
      const { error } = await supabase
        .from('profiles')
        .insert(newProfileData);

      if (error) throw error

      dispatch(updateProfile({ userId: user.id, profileData: newProfileData }));
     
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell others about yourself</Text>

        {step === 1 && (
          <>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {photo ? (
                // +++ USE photo.uri TO DISPLAY THE IMAGE +++
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              ) : (
                <Text style={styles.photoText}>📷 Add Photo</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.textArea}
              placeholder="Write a short bio..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={200}
            />

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(2)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
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

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.completeButton, loading && styles.buttonDisabled]}
                onPress={handleComplete}
                disabled={loading}
              >
                <Text style={styles.completeButtonText}>
                  {loading ? 'Completing...' : 'Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
  photoText: {
    fontSize: 18,
    color: '#666',
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
  nextButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  backButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  completeButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

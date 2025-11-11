import React, { useState, useEffect } from 'react'
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
import Animated, { useSharedValue, withDelay, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../redux/slices/profileSlice'
import { supabase } from '../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { decode } from 'base64-arraybuffer'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

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

  const titleY = useSharedValue(30)
  const titleOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)

  useEffect(() => {
    titleY.value = withDelay(150, withSpring(0))
    titleOpacity.value = withDelay(150, withTiming(1, { duration: 400 }))
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 400 }))
  }, [])

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }))

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.title, titleStyle]}>Complete Your Profile</Animated.Text>
        <Animated.Text style={[styles.subtitle, contentStyle]}>Tell others about yourself</Animated.Text>

        {step === 1 && (
          <>
            <Animated.View style={contentStyle}>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#FF6B6B" />
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={contentStyle}>
              <Text style={styles.label}>Bio</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write a short bio..."
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  placeholderTextColor="#666666"
                />
              </View>
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </Animated.View>

            <AnimatedTouchable
              style={[styles.nextButton, contentStyle]}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </AnimatedTouchable>
          </>
        )}

        {step === 2 && (
          <>
            <Animated.View style={contentStyle}>
              <Text style={styles.label}>Academic Year</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#999999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Academic Year (e.g., 2024)"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  placeholderTextColor="#666666"
                />
              </View>
            </Animated.View>

            <Animated.View style={contentStyle}>
              <Text style={styles.label}>Major/Department</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="school-outline" size={20} color="#999999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Major/Department"
                  value={major}
                  onChangeText={setMajor}
                  placeholderTextColor="#666666"
                />
              </View>
            </Animated.View>

            <Animated.View style={contentStyle}>
              <Text style={styles.label}>Interests</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="heart-outline" size={20} color="#999999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Interests (comma separated, e.g., coding, cricket)"
                  value={interests}
                  onChangeText={setInterests}
                  placeholderTextColor="#666666"
                />
              </View>
            </Animated.View>

            <Animated.View style={[styles.buttonRow, contentStyle]}>
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
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 40,
    fontWeight: '400',
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  photoButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    overflow: 'hidden',
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: -15,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

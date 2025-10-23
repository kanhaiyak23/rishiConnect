import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from '../redux/slices/authSlice'
import { fetchProfile } from '../redux/slices/profileSlice'

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile(user.id))
    }
  }, [user, dispatch])

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(signOut())
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profile?.photo_url || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile?.name || user?.email}</Text>
          <Text style={styles.yearMajor}>
            {profile?.year} • {profile?.major}
          </Text>

          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>#{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.actionButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  yearMajor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  interestsSection: {
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FF6B6B',
  },
})

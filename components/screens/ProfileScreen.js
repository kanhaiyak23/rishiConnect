import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '../redux/slices/profileSlice'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile(user.id))
    }
  }, [user, dispatch])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
             <Image
                          source={require('../../assets/iconf.png')}
                          style={styles.appIcon}
                          resizeMode="contain"
                        />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          {/* Image indicators */}
          
          <Image
            source={{ uri: profile?.photo_url || 'https://placehold.co/400/2A2A2A/FF6B6B?text=No+Photo' }}
            style={styles.profileImage}
          />
        </View>

        {/* Profile Details Section */}
        <View style={styles.profileDetailsSection}>
          <View style={styles.profileDetailsLeft}>
            <Text style={styles.profileName}>
              {profile?.name || user?.email?.split('@')[0] || 'User'}
            </Text>
            {profile?.year && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={styles.detailIcon} />
                <Text style={styles.detailText}>{profile.year}</Text>
              </View>
            )}
            {profile?.major && (
              <View style={styles.detailRow}>
                <Ionicons name="school-outline" size={18} color="#FFFFFF" style={styles.detailIcon} />
                <Text style={styles.detailText}>{profile.major}</Text>
              </View>
            )}
            {profile?.bio && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={styles.detailIcon} />
                <Text style={styles.detailText} numberOfLines={2}>{profile.bio}</Text>
              </View>
            )}
            {profile?.interests && profile.interests.length > 0 && (
              <View style={styles.interestsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="heart-outline" size={18} color="#FFFFFF" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Interests</Text>
                </View>
                <View style={styles.interestsContainer}>
                  {profile.interests.slice(0, 5).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
   
    marginRight: 12,
  },
  appIcon: {
    width: 30,  
    height: 30,
    resizeMode: 'center',
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profilePictureSection: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  imageIndicators: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FF6B6B',
    width: 20,
  },
  profileImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  profileDetailsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  profileDetailsLeft: {
    flex: 1,
  },
  profileName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    opacity: 0.9,
  },
  interestsSection: {
    marginTop: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
})

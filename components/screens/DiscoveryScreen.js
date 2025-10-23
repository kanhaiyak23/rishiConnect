import React, { useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPotentialMatches, swipeUser, clearRecentMatch } from '../redux/slices/discoverySlice'
// +++ Import useFocusEffect +++
import { useFocusEffect } from '@react-navigation/native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function DiscoveryScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  // +++ Get loading state +++
  const { potentialMatches, currentIndex, recentMatch, loading } = useSelector((state) => state.discovery)
  
  const translateX = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current

  // +++ FIX: Replace useEffect with useFocusEffect +++
  useFocusEffect(
    useCallback(() => {
      // This runs every time the screen comes into focus
      if (user) {
        // Reset index and fetch new profiles
        dispatch(fetchPotentialMatches(user.id))
      }
      // We don't want to reset on blur, so we return undefined
      return undefined
    }, [user, dispatch])
  )

  const currentProfile = potentialMatches[currentIndex]

  const handleSwipe = (direction) => {
    // Prevent double-swipes
    if (!currentProfile) return

    const toValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      // Optimistically move to the next card
      // The reducer will also increment, so we do it here
      // No, let the reducer handle the state update.
      
      await dispatch(swipeUser({ 
        userId: user.id, 
        targetUserId: currentProfile.id, 
        action: direction === 'right' ? 'like' : 'pass' 
      }))
      
      // Reset animations for the *next* card
      translateX.setValue(0)
      rotate.setValue(0)

      // +++ IMPROVEMENT: Check if we're near the end of the list +++
      // If we have 3 or fewer cards left, fetch more.
      if (potentialMatches.length - (currentIndex + 1) <= 3) {
        dispatch(fetchPotentialMatches(user.id))
      }
    })
  }

  const handleSkip = () => {
    handleSwipe('left')
  }

  const handleConnect = () => {
    handleSwipe('right')
  }

  const renderCard = () => {
    // Show a loading spinner if we're fetching and have no cards
    if (loading && !currentProfile) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.emptySubtext}>Finding new connections...</Text>
        </View>
      )
    }

    if (!currentProfile) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more profiles</Text>
          <Text style={styles.emptySubtext}>Check back later for more connections!</Text>
        </View>
      )
    }

    const rotateStr = rotate.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-10deg', '0deg', '10deg'],
    })

    const opacity = translateX.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 1, 0],
    })

    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { rotate: rotateStr },
            ],
            opacity,
          },
        ]}
      >
        <Image
          source={{ uri: currentProfile.photo_url || 'https://placehold.co/400x600/FFF3F3/FF6B6B?text=No+Photo' }}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{currentProfile.name}</Text>
            <Text style={styles.cardAge}>{currentProfile.year} • {currentProfile.major}</Text>
          </View>
          <Text style={styles.cardBio} numberOfLines={2}>{currentProfile.bio}</Text>
          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {currentProfile.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>#{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      <View style={styles.cardContainer}>
        {renderCard()}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={!currentProfile}>
          <Text style={styles.skipButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={!currentProfile}>
          <Text style={styles.connectButtonText}>❤️</Text>
        </TouchableOpacity>
      </View>

      {/* +++ FIX: This modal will now have access to recentMatch.name +++ */}
      {recentMatch && (
        <View style={styles.matchModal}>
          <View style={styles.matchContent}>
            <Text style={styles.matchTitle}>🎉 It's a Match!</Text>
            <Text style={styles.matchText}>
              You and {recentMatch.name} are now connected
            </Text>
            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => {
                dispatch(clearRecentMatch())
                navigation.navigate('Chats') // You might want to pass the new chat room ID here
              }}
            >
              <Text style={styles.matchButtonText}>Send a Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.matchButtonSecondary}
              onPress={() => dispatch(clearRecentMatch())}
            >
              <Text style={styles.matchButtonSecondaryText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 600,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  cardInfo: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  cardAge: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cardBio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30,
  },
  skipButtonText: {
    fontSize: 30,
    color: '#FF6B6B',
  },
  connectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  matchModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: SCREEN_WIDTH - 60,
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  matchText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  matchButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchButtonSecondary: {
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  matchButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
  },
})

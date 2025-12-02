import React, { useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPotentialMatches, swipeUser, clearRecentMatch } from '../redux/slices/discoverySlice'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function DiscoveryScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)
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

  const handleUndo = () => {
    // TODO: Implement undo functionality
    Alert.alert('Info', 'Undo feature coming soon')
  }

  const handleReject = () => {
    handleSwipe('left')
  }

  const handleSuperLike = () => {
    // TODO: Implement super like functionality
    handleSwipe('right')
  }

  const handleLike = () => {
    handleSwipe('right')
  }

  const handleBoost = () => {
    // TODO: Implement boost functionality
    Alert.alert('Info', 'Boost feature coming soon')
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

    const scale = translateX.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [0.95, 1, 0.95],
    })

    // Calculate age if available (assuming year is academic year)
    const displayInfo = []
    if (currentProfile.year) displayInfo.push(currentProfile.year)
    if (currentProfile.major) displayInfo.push(currentProfile.major)

    return (
   
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { rotate: rotateStr },
              { perspective: 1000 },
              { scale },
            ],
            opacity,
          },
        ]}
      >
        <Image
          source={{ uri: currentProfile.photo_url || 'https://placehold.co/400x600/2A2A2A/FF6B6B?text=No+Photo' }}
          style={styles.cardImage}
        />
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[styles.indicator, index === 1 && styles.indicatorActive]}
            />
          ))}
        </View>
        {/* Profile info overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.cardInfo}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{currentProfile.name}</Text>
            {displayInfo.length > 0 && (
              <Text style={styles.cardDetails}>{displayInfo.join(' • ')}</Text>
            )}
          </View>
          {currentProfile.bio && (
            <Text style={styles.cardBio} numberOfLines={2}>{currentProfile.bio}</Text>
          )}
          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {currentProfile.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#FF6B6B" />
            <Ionicons name="heart" size={12} color="#E74C3C" style={styles.heartIcon} />
          </View>
          <Text style={styles.appName}>RishiConnect</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="options-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {renderCard()}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.undoButton]} 
          onPress={handleUndo} 
          disabled={!currentProfile}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={handleReject} 
          disabled={!currentProfile}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* <TouchableOpacity  */}
          {/* style={[styles.actionButton, styles.superLikeButton]} 
          onPress={handleSuperLike} 
          disabled={!currentProfile}
        >
          <Ionicons name="star" size={24} color="#FFFFFF" /> */}
        {/* </TouchableOpacity> */}

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={handleLike} 
          disabled={!currentProfile}
        >
          <Ionicons name="heart" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.boostButton]} 
          onPress={handleBoost} 
          disabled={!currentProfile}
        >
          <Ionicons name="flash" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {recentMatch && (
        <View style={styles.matchModal}>
          <BlurView intensity={80} style={styles.matchBlur}>
            <View style={styles.matchContent}>
              {/* Floating hearts */}
              <View style={styles.floatingHearts}>
                <Ionicons name="heart" size={20} color="#FF6B6B" style={styles.floatingHeart1} />
                <Ionicons name="heart" size={16} color="#FF6B6B" style={styles.floatingHeart2} />
                <Ionicons name="heart" size={18} color="#FF6B6B" style={styles.floatingHeart3} />
                <Ionicons name="heart" size={14} color="#FF6B6B" style={styles.floatingHeart4} />
              </View>

              {/* Profile pictures in heart frames */}
              <View style={styles.matchProfiles}>
                <View style={styles.heartFrame}>
                  <Image
                    source={{ uri: profile?.photo_url || 'https://placehold.co/100/2A2A2A/FF6B6B?text=You' }}
                    style={styles.matchPhoto}
                  />
                </View>
                <View style={styles.heartFrame}>
                  <Image
                    source={{ uri: recentMatch.photo_url || 'https://placehold.co/100/2A2A2A/FF6B6B?text=Match' }}
                    style={styles.matchPhoto}
                  />
                </View>
              </View>

              <Text style={styles.matchTitle}>You Got the Match!</Text>
              <Text style={styles.matchDescription}>
                You both liked each other. Take charge and start a meaningful conversation.
              </Text>

              <TouchableOpacity
                style={styles.letsChatButton}
                onPress={() => {
                  dispatch(clearRecentMatch())
                  navigation.navigate('Chats')
                }}
              >
                <Text style={styles.letsChatButtonText}>Let's Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.maybeLaterButton}
                onPress={() => dispatch(clearRecentMatch())}
              >
                <Text style={styles.maybeLaterButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
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
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    position: 'relative',
    marginRight: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
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
    backgroundColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
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
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cardBio: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    gap: 12,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  undoButton: {
    backgroundColor: '#34A853',
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
  },
  superLikeButton: {
    backgroundColor: '#FF9500',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  boostButton: {
    backgroundColor: '#4285F4',
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
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  matchModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchBlur: {
    width: SCREEN_WIDTH - 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
  matchContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  floatingHearts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingHeart1: {
    position: 'absolute',
    top: 20,
    left: 30,
    opacity: 0.7,
  },
  floatingHeart2: {
    position: 'absolute',
    top: 40,
    right: 40,
    opacity: 0.6,
  },
  floatingHeart3: {
    position: 'absolute',
    top: 60,
    left: 50,
    opacity: 0.5,
  },
  floatingHeart4: {
    position: 'absolute',
    top: 80,
    right: 60,
    opacity: 0.4,
  },
  matchProfiles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  heartFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    padding: 3,
    overflow: 'hidden',
  },
  matchPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  letsChatButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  letsChatButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  maybeLaterButton: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  maybeLaterButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
})

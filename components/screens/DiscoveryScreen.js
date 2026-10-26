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
import { fetchPotentialMatches, swipeUser, clearRecentMatch, nextCardOptimistic, refreshDiscovery } from '../redux/slices/discoverySlice'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from "react-native-safe-area-context"
import { useBottomSheet } from '../../context/BottomSheetContext'
import { useEffect } from 'react'
import { Easing, PanResponder } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import AuroraBackground from '../ui/AuroraBackground'
import FadeInUp from '../ui/FadeInUp'
import GradientButton from '../ui/GradientButton'
import { theme } from '../ui/theme'


const { width: SCREEN_WIDTH } = Dimensions.get('window')

function ActionButton({ icon, color, size = 64, onPress, disabled }) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Reanimated.View style={style}>
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled}
        onPressIn={() => (scale.value = withSpring(0.85, { damping: 12 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 8 }))}
        onPress={onPress}
        style={[styles.actionButton, { width: size, height: size, borderRadius: size / 2, shadowColor: color }]}
      >
        <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
          <Ionicons name={icon} size={size * 0.45} color={color} />
        </BlurView>
      </TouchableOpacity>
    </Reanimated.View>
  )
}

function MatchPopup({ children }) {
  const scale = useSharedValue(0.7)
  const opacity = useSharedValue(0)
  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 120 })
    opacity.value = withTiming(1, { duration: 250 })
  }, [])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }))
  return <Reanimated.View style={style}>{children}</Reanimated.View>
}

function PulsingHeart({ style, size, delay = 0 }) {
  const t = useSharedValue(0)
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 1200 + delay }), withTiming(0, { duration: 1200 + delay })), -1)
  }, [])
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: -t.value * 14 }, { scale: 1 + t.value * 0.25 }],
  }))
  return (
    <Reanimated.View style={[style, anim]}>
      <Ionicons name="heart" size={size} color={theme.primary} />
    </Reanimated.View>
  )
}

export default function DiscoveryScreen({ navigation }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)
  const { potentialMatches, currentIndex, recentMatch, loading } = useSelector((state) => state.discovery)
  const { showBottomSheet } = useBottomSheet()

  const translateX = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = React.useState(false);

  const swipeRef = useRef(null)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx)
        rotate.setValue(Math.max(-1, Math.min(1, g.dx / (SCREEN_WIDTH / 2))))
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > SCREEN_WIDTH * 0.25 || g.vx > 0.8) {
          swipeRef.current?.('right')
        } else if (g.dx < -SCREEN_WIDTH * 0.25 || g.vx < -0.8) {
          swipeRef.current?.('left')
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, friction: 6, useNativeDriver: true }),
            Animated.spring(rotate, { toValue: 0, friction: 6, useNativeDriver: true }),
          ]).start()
        }
      },
    })
  ).current

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
  useEffect(() => {
    if (potentialMatches.length - currentIndex <= 3) {
      dispatch(fetchPotentialMatches(user.id));
    }
  }, [currentIndex]);


  const currentProfile = potentialMatches[currentIndex]

  const handleSwipe = async (direction) => {
    if (!currentProfile || isAnimating) return;

    setIsAnimating(true);

    const toValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        // Immediately animate the next card in UI
        dispatch(nextCardOptimistic(currentProfile.id));

        // Backend update in background (swipe event)
        dispatch(
          swipeUser({
            userId: user.id,
            targetUserId: currentProfile.id,
            action: direction === 'right' ? 'like' : 'pass',
          })
        );

        // Reset animation for the next incoming card
        translateX.setValue(0);
        rotate.setValue(0);
      } catch (error) {
        console.error("Swipe error:", error);
      } finally {
        setIsAnimating(false);
      }
    });
  };


  swipeRef.current = handleSwipe

  // const handleRefresh = () => {
  //   if (loading) return

  //   // Dispatch refresh action
  //   dispatch(refreshDiscovery({
  //     userId: user.id,
  //     currentMatches: potentialMatches,
  //     currentIndex
  //   }))
  // }

  const handleReject = () => {
    handleSwipe('left')
  }



  const handleLike = () => {
    handleSwipe('right')
  }


  const renderCard = () => {
    // Show a loading spinner if we're fetching and have no cards
    if (loading && !currentProfile) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
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
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: currentProfile.photo_url || 'https://placehold.co/400x600/1B1B26/FF5E7E?text=No+Photo' }}
          style={styles.cardImage}
        />

        <Animated.View style={[styles.stamp, styles.stampLike, {
          opacity: translateX.interpolate({ inputRange: [0, SCREEN_WIDTH / 4], outputRange: [0, 1], extrapolate: 'clamp' }),
        }]}>
          <Text style={[styles.stampText, { color: '#4ADE80' }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNope, {
          opacity: translateX.interpolate({ inputRange: [-SCREEN_WIDTH / 4, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
        }]}>
          <Text style={[styles.stampText, { color: '#F87171' }]}>NOPE</Text>
        </Animated.View>

        {/* Profile info overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(11,11,18,0.75)', 'rgba(11,11,18,0.95)']}
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
    <AuroraBackground>
      <FadeInUp style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Image
              source={require('../../assets/iconf.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
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
      </FadeInUp>

      <FadeInUp delay={150} distance={40} style={styles.cardContainer}>
        {renderCard()}
      </FadeInUp>

      <FadeInUp delay={300} style={styles.actions}>
        <ActionButton icon="close" color="#F87171" onPress={handleReject} disabled={!currentProfile} />
        <ActionButton icon="heart" color={theme.primary} size={76} onPress={handleLike} disabled={!currentProfile} />
      </FadeInUp>

      {recentMatch && (
        <View style={styles.matchModal}>
          <MatchPopup>
            <BlurView intensity={80} tint="dark" style={styles.matchBlur}>
              <View style={styles.matchContent}>
                <View style={styles.floatingHearts}>
                  <PulsingHeart size={20} style={styles.floatingHeart1} />
                  <PulsingHeart size={16} style={styles.floatingHeart2} delay={300} />
                  <PulsingHeart size={18} style={styles.floatingHeart3} delay={600} />
                  <PulsingHeart size={14} style={styles.floatingHeart4} delay={900} />
                </View>

                <View style={styles.matchProfiles}>
                  <View style={styles.heartFrame}>
                    <Image
                      source={{ uri: profile?.photo_url || 'https://placehold.co/100/1B1B26/FF5E7E?text=You' }}
                      style={styles.matchPhoto}
                    />
                  </View>
                  <View style={styles.heartFrame}>
                    <Image
                      source={{ uri: recentMatch.photo_url || 'https://placehold.co/100/1B1B26/FF5E7E?text=Match' }}
                      style={styles.matchPhoto}
                    />
                  </View>
                </View>

                <Text style={styles.matchTitle}>It's a Match!</Text>
                <Text style={styles.matchDescription}>
                  You both liked each other. Take charge and start a meaningful conversation.
                </Text>

                <GradientButton
                  title="Let's Chat"
                  style={{ width: '100%', marginBottom: 14 }}
                  onPress={() => {
                    dispatch(clearRecentMatch())
                    navigation.navigate('Chats')
                  }}
                />

                <TouchableOpacity
                  style={styles.maybeLaterButton}
                  onPress={() => dispatch(clearRecentMatch())}
                >
                  <Text style={styles.maybeLaterButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </MatchPopup>
        </View>
      )}
    </AuroraBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {

    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',



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
    paddingTop: 60
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 560,
    borderRadius: 32,
    backgroundColor: '#1B1B26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  stamp: {
    position: 'absolute',
    top: 40,
    zIndex: 20,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  stampLike: { left: 24, borderColor: '#4ADE80', transform: [{ rotate: '-14deg' }] },
  stampNope: { right: 24, borderColor: '#F87171', transform: [{ rotate: '14deg' }] },
  stampText: { fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  interestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 28,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  actionBlur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    backgroundColor: 'rgba(11, 11, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchBlur: {
    width: SCREEN_WIDTH - 60,
    borderRadius: 28,
    overflow: 'hidden',
  },
  matchContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
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
    borderColor: '#FF5E7E',
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
    fontSize: 30,
    fontWeight: '800',
    color: '#FF5E7E',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  maybeLaterButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
})

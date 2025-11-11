import React, { useEffect, useCallback, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChatRooms, setCurrentRoom } from '../redux/slices/chatSlice'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated'

// Helper function to format the time
const formatChatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Format to HH:MM
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Active User Avatar Component with Animation
const ActiveUserAvatar = ({ activeUser, isOnline, onPress }) => {
  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(0.8)

  useEffect(() => {
    if (isOnline) {
      // Pulsing animation for active users
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    } else {
      pulseScale.value = 1
      pulseOpacity.value = 0.5
    }
  }, [isOnline])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }))

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isOnline ? pulseOpacity.value : 0.3,
  }))

  return (
    <TouchableOpacity
      style={styles.activeUserItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.activeUserAvatarContainer}>
        <Image
          source={{ uri: activeUser?.photo_url || 'https://placehold.co/60/2A2A2A/FF6B6B?text=No+Photo' }}
          style={[
            styles.activeUserAvatar,
            !isOnline && styles.inactiveUserAvatar
          ]}
        />
        {isOnline && (
          <Animated.View style={[styles.activeIndicatorPulse, pulseStyle]} />
        )}
        <Animated.View
          style={[
            styles.activeIndicator,
            indicatorStyle,
            !isOnline && styles.inactiveIndicator
          ]}
        />
      </View>
    </TouchableOpacity>
  )
}

// Helper to calculate unread count (simplified - counts recent messages from other user)
const getUnreadCount = async (roomId, userId, lastViewed) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return 0

    // If we have a last viewed time, count messages after that
    if (lastViewed) {
      const unread = data.filter(msg => new Date(msg.created_at) > new Date(lastViewed))
      return Math.min(unread.length, 99)
    }

    // Otherwise, return count of recent messages (last 10)
    return Math.min(data.length, 10)
  } catch {
    return 0
  }
}

export default function ChatsScreen() {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { user } = useSelector((state) => state.auth)
  const { chatRooms, loading } = useSelector((state) => state.chat)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [activeUsers, setActiveUsers] = useState([])
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const presenceChannelRef = useRef(null)

  // Fetch unread counts
  useEffect(() => {
    if (chatRooms.length > 0 && user) {
      const fetchUnreadCounts = async () => {
        const counts = {}
        for (const room of chatRooms) {
          // For now, pass null as lastViewed - in production, track this in the database
          const count = await getUnreadCount(room.id, user.id, null)
          counts[room.id] = count
        }
        setUnreadCounts(counts)
      }
      fetchUnreadCounts()
    }
  }, [chatRooms, user])

  // Set up Supabase Presence for tracking online users
  useEffect(() => {
    if (!user?.id) return

    // Create presence channel
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: `user_${user.id}`, // unique per user
        },
      },
    })
     // Listen for presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const onlineIds = new Set()

      // Extract user IDs from presence state

      Object.keys(state).forEach((key) => {
        const presences = state[key]
        presences.forEach((presence) => {
          if (presence.user_id && presence.user_id !== user.id) {
            onlineIds.add(presence.user_id)
          }
        })
      })
      console.log('Online users from Supabase:', Array.from(onlineIds))
      setOnlineUserIds(onlineIds)
    })
    

    // Subscribe to channel
    channel.subscribe(async (status) => {
      console.log('Realtime status:', status)
      if (status === 'SUBSCRIBED') {
        // Track yourself as online
        console.log('Tracking user presence...', user.id)
        channel.track({
          user_id: user.id,
          name: user.name,
          online_at: new Date().toISOString(),
        })
      }
    })

   
    
    

    // Listen for join/leave events
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      setOnlineUserIds((prevIds) => {
        const onlineIds = new Set(prevIds)
        newPresences.forEach((presence) => {
          if (presence.user_id && presence.user_id !== user.id) {
            onlineIds.add(presence.user_id)
          }
        })
        return onlineIds
      })
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      setOnlineUserIds((prevIds) => {
        const onlineIds = new Set(prevIds)
        leftPresences.forEach((presence) => {
          if (presence.user_id) {
            onlineIds.delete(presence.user_id)
          }
        })
        return onlineIds
      })
    })
    


    presenceChannelRef.current = channel

    // Cleanup on unmount
    return () => {
      if (presenceChannelRef.current) {
        // Untrack presence before unsubscribing
        presenceChannelRef.current.untrack()
        presenceChannelRef.current.unsubscribe()
        supabase.removeChannel(presenceChannelRef.current)
      }
    }
  }, [user?.id])

  // Update active users based on chat rooms and online status
  useEffect(() => {
    if (chatRooms.length > 0 && user) {
      const active = chatRooms
        .slice(0, 10) // Get more users to filter by online status
        .map(room => user.id === room.user1_id ? room.user2 : room.user1)
        .filter(Boolean)
        .map(userData => ({
          ...userData,
          isOnline: onlineUserIds.has(userData.id),
        }))
        .sort((a, b) => {
          // Sort: online users first, then by recent activity
          if (a.isOnline && !b.isOnline) return -1
          if (!a.isOnline && b.isOnline) return 1
          return 0
        })
        .slice(0, 5) // Take top 5

      setActiveUsers(active)
    }
  }, [chatRooms, user, onlineUserIds])

  // useFocusEffect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        dispatch(fetchChatRooms(user.id))
      }

      // Set up real-time subscription for chat rooms
      const channel = supabase
        .channel('public:chat_rooms')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_rooms',
            // Listen for new chat rooms where this user is user1
            filter: `user1_id=eq.${user?.id}`,
          },
          (payload) => {
            // Re-fetch chat rooms when a new room is created
            dispatch(fetchChatRooms(user.id))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_rooms',
            // Listen for new chat rooms where this user is user2
            filter: `user2_id=eq.${user?.id}`,
          },
          (payload) => {
            dispatch(fetchChatRooms(user.id))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_rooms',
            // Listen for updates where this user is user1
            filter: `user1_id=eq.${user?.id}`,
          },
          (payload) => {
            // Re-fetch chat rooms when an update happens
            dispatch(fetchChatRooms(user.id))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_rooms',
            filter: `user2_id=eq.${user?.id}`,
          },
          (payload) => {
            dispatch(fetchChatRooms(user.id))
          }
        )
        .subscribe()

      // Unsubscribe on cleanup
      return () => {
        supabase.removeChannel(channel)
      }
    }, [user, dispatch])
  )
// console.log('chatRooms', chatRooms)
//   console.log('Online users from Supabase:', Array.from(onlineUserIds))
  const renderChatItem = useCallback(({ item }) => {
    const otherUser = user.id === item.user1_id ? item.user2 : item.user1
    const unreadCount = unreadCounts[item.id] || 0

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          dispatch(setCurrentRoom(item))
          navigation.navigate('Chat', { room: item })
        }}
      >
        <Image
          source={{ uri: otherUser?.photo_url || 'https://placehold.co/60/2A2A2A/FF6B6B?text=No+Photo' }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherUser?.name || 'Unknown'}</Text>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.chatRight}>
          <Text style={styles.chatTime}>
            {formatChatTime(item.updated_at)}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }, [user, dispatch, navigation, unreadCounts])

  const renderActiveUser = (activeUser, index) => {
    const isOnline = activeUser?.isOnline || false
    return (
      <ActiveUserAvatar
        key={activeUser?.id || index}
        activeUser={activeUser}
        isOnline={isOnline}
        onPress={() => {
          const room = chatRooms.find(r =>
            (r.user1_id === activeUser?.id && r.user2_id === user?.id) ||
            (r.user1_id === user?.id && r.user2_id === activeUser?.id)
          )
          if (room) {
            dispatch(setCurrentRoom(room))
            navigation.navigate('Chat', { room })
          }
        }}
      />
    )
  }

  if (chatRooms.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Chats Yet</Text>
        <Text style={styles.emptyText}>
          Start swiping to find matches and begin chatting!
        </Text>
      </View>
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
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Now Active Section */}
        {activeUsers.length > 0 && (
          <View style={styles.activeSection}>
            <View style={styles.activeSectionHeader}>
              <Text style={styles.activeSectionTitle}>Now Active</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeUsersList}
            >
              {activeUsers.map((activeUser, index) => renderActiveUser(activeUser, index))}
            </ScrollView>
          </View>
        )}

        {/* Chat List */}
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.list}
          onRefresh={() => user && dispatch(fetchChatRooms(user.id))}
          refreshing={loading}
          scrollEnabled={false}
        />
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
  headerTitle: {
    fontSize: 28,
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
  content: {
    flex: 1,
  },
  activeSection: {
    marginBottom: 20,
  },
  activeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activeSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  activeUsersList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  activeUserItem: {
    marginRight: 12,
  },
  activeUserAvatarContainer: {
    position: 'relative',
  },
  activeUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#333333',
  },
  inactiveUserAvatar: {
    opacity: 0.6,
  },
  activeIndicatorPulse: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    opacity: 0.4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    zIndex: 1,
  },
  inactiveIndicator: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#2A2A2A',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: '#999999',
  },
  chatRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
})


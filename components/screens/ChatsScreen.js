import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChatRooms, setCurrentRoom } from '../redux/slices/chatSlice'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase' // Import supabase

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
  
  // Format to 10:30 AM
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatsScreen() {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { user } = useSelector((state) => state.auth)
  const { chatRooms, loading } = useSelector((state) => state.chat)

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

  const renderChatItem = useCallback(({ item }) => {
    const otherUser = user.id === item.user1_id ? item.user2 : item.user1

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          dispatch(setCurrentRoom(item))
          navigation.navigate('Chat', { room: item })
        }}
      >
        <Image
          source={{ uri: otherUser?.photo_url || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{otherUser?.name || 'Unknown'}</Text>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {/* This code is now correct and will update in real-time */}
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
        {/* +++ FIX: Display the actual message time +++ */}
        <Text style={styles.chatTime}>
          {formatChatTime(item.updated_at)}
        </Text>
      </TouchableOpacity>
    )
  }, [user, dispatch, navigation]) // Add dependencies

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
    <LinearGradient
      colors={['#f5f7fa', '#c3cfe2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChatItem}
        contentContainerStyle={styles.list}
        onRefresh={() => user && dispatch(fetchChatRooms(user.id))}
        refreshing={loading}
      />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: 0.5,
  },
  list: {
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})


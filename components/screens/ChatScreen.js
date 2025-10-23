import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMessages, sendMessage, addMessage } from '../redux/slices/chatSlice'
import { supabase } from '../lib/supabase'

export default function ChatScreen({ route }) {
  const { room } = route.params
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { messages } = useSelector((state) => state.chat)
  
  const [messageText, setMessageText] = useState('')
  const flatListRef = useRef(null)

  const otherUser = user.id === room.user1_id ? room.user2 : room.user1

  useEffect(() => {
    dispatch(fetchMessages(room.id))

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${room.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        (payload) => {
          dispatch(addMessage(payload.new))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [room.id])

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim()) return

    try {
      await dispatch(sendMessage({
        roomId: room.id,
        senderId: user.id,
        message: messageText,
      })).unwrap()

      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === user.id

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage,
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.otherMessageText,
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
        ]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 10,
    padding: 12,
    borderRadius: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B6B',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#999',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

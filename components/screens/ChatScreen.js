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
  Alert,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMessages, sendMessage, addMessage, updateMessageStatus, unmatchUser } from '../redux/slices/chatSlice'
import { supabase } from '../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function ChatScreen({ route }) {
  const navigation = useNavigation()
  const { room } = route.params
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { messages } = useSelector((state) => state.chat)

  const [messageText, setMessageText] = useState('')
  const flatListRef = useRef(null)

  const otherUser = user.id === room.user1_id ? room.user2 : room.user1

  // ------------------------
  // FETCH + REALTIME MESSAGES
  // ------------------------
  useEffect(() => {
    dispatch(fetchMessages(room.id))

    const subscription = supabase
      .channel(`messages:${room.id}`)
      .on(
        'postgres_changes',
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

  // ------------------------
  // MARK MESSAGES AS READ
  // ------------------------
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })

      const unreadMessages = messages.filter(
        m => m.sender_id !== user.id && m.status !== 'read'
      )

      unreadMessages.forEach(msg => {
        dispatch(updateMessageStatus({ messageId: msg.id, status: 'read' }))
      })
    }
  }, [messages])

  // ------------------------
  // SEND MESSAGE
  // ------------------------
  const handleSend = async () => {
    if (!messageText.trim()) return

    try {
      await dispatch(
        sendMessage({
          roomId: room.id,
          senderId: user.id,
          message: messageText,
        })
      ).unwrap()

      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // ------------------------
  // FORMAT MESSAGE TIME
  // ------------------------
  const formatMessageTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ------------------------
  // UNMATCH USER
  // ------------------------
  const handleUnmatch = () => {
    Alert.alert(
      "Unmatch User",
      "Are you sure you want to unmatch with this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(
                unmatchUser({
                  roomId: room.id,
                  userId: user.id,
                  matchedUserId: otherUser.id
                })
              ).unwrap()

              navigation.goBack()
            } catch (error) {
              Alert.alert("Error", "Failed to unmatch user.")
            }
          }
        }
      ]
    )
  }

  // ------------------------
  // RENDER MESSAGE ITEM
  // ------------------------
  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender_id === user.id

    const prevMessage = index > 0 ? messages[index - 1] : null
    const showDateSeparator =
      !prevMessage ||
      new Date(item.created_at).toDateString() !== new Date(prevMessage.created_at).toDateString()

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {new Date(item.created_at).toDateString()}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {item.message}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.created_at)}
            </Text>

            {isMyMessage && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
        </View>
      </>
    )
  }

  // ------------------------
  // RETURN UI
  // ------------------------
  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{otherUser?.name || "Chat"}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="call-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIcon} onPress={handleUnmatch}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CHAT + INPUT */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            placeholder="Send message ..."
            placeholderTextColor="#666666"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />

          {messageText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </KeyboardAvoidingView>

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
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      flex: 1,
      marginLeft: 16,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 16,
    },
    headerIcon: {
      padding: 4,
    },
    chatContainer: {
      flex: 1,
    },
    messagesList: {
      padding: 20,
      paddingBottom: 10,
    },
    dateSeparator: {
      alignItems: 'center',
      marginVertical: 16,
    },
    dateSeparatorText: {
      backgroundColor: '#2A2A2A',
      color: '#FFFFFF',
      fontSize: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: 'hidden',
    },
    messageContainer: {
      maxWidth: '80%',
      marginBottom: 12,
      padding: 12,
      borderRadius: 16,
    },
    myMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#FF6B6B',
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#2A2A2A',
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
      marginBottom: 6,
      lineHeight: 20,
    },
    myMessageText: {
      color: '#FFFFFF',
    },
    otherMessageText: {
      color: '#FFFFFF',
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
    },
    messageTime: {
      fontSize: 11,
    },
    myMessageTime: {
      color: 'rgba(255,255,255,0.7)',
    },
    otherMessageTime: {
      color: '#999999',
    },
    checkIcon: {
      marginLeft: 2,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      paddingHorizontal: 16,
      backgroundColor: '#1A1A1A',
      borderTopWidth: 1,
      borderTopColor: '#333333',
      alignItems: 'center',
      gap: 12,
    },
    plusButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#2A2A2A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: '#2A2A2A',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: '#FFFFFF',
      maxHeight: 100,
      borderRadius: 20,
    },
    micButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2A2A2A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF6B6B',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

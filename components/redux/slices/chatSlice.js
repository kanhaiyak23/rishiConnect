import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId, { rejectWithValue }) => {
    try {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          user1:profiles!chat_rooms_user1_id_fkey(*),
          user2:profiles!chat_rooms_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Manually fetch last message for each room to ensure accuracy
      const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('message, created_at')
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...room,
          last_message: lastMsg?.message || room.last_message || 'No messages yet',
          updated_at: lastMsg?.created_at || room.updated_at
        }
      }))

      // Sort again because updated_at might have changed
      return roomsWithDetails.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, senderId, message }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: senderId,
          message,
          status: 'sent', // Add status field
        })
        .select()
        .single()

      if (error) throw error

      // Update chat room's updated_at and last_message
      await supabase
        .from('chat_rooms')
        .update({
          updated_at: new Date().toISOString(),
          last_message: message
        })
        .eq('id', roomId)

      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateMessageStatus = createAsyncThunk(
  'chat/updateMessageStatus',
  async ({ messageId, status }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const sendTypingIndicator = createAsyncThunk(
  'chat/sendTypingIndicator',
  async ({ roomId, userId, isTyping }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          room_id: roomId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return { roomId, userId, isTyping }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const unmatchUser = createAsyncThunk(
  'chat/unmatchUser',
  async ({ roomId, userId, matchedUserId }, { rejectWithValue }) => {
    try {
      // Delete all messages in the room
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('room_id', roomId)

      if (messagesError) throw messagesError

      // Delete typing indicators
      const { error: typingError } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('room_id', roomId)

      if (typingError) throw typingError

      // Delete the chat room
      const { error: roomError } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId)

      if (roomError) throw roomError

      // Delete the match record (both directions)
      const { error: matchError1 } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', userId)
        .eq('matched_user_id', matchedUserId)

      const { error: matchError2 } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', matchedUserId)
        .eq('matched_user_id', userId)

      if (matchError1 || matchError2) throw matchError1 || matchError2

      return { roomId }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatRooms: [],
    currentRoom: null,
    messages: [],
    typingUsers: [], // Array of user IDs who are currently typing
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload
    },
    addMessage: (state, action) => {
      // +++ FIX: This is for the REAL-TIME SUBSCRIPTION +++
      // Check if the message (from the subscription) already exists
      const exists = state.messages.find(m => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload)
      }
    },
    clearMessages: (state) => {
      state.messages = []
      state.currentRoom = null
      state.typingUsers = []
    },
    updateTypingUsers: (state, action) => {
      state.typingUsers = action.payload
    },
    updateMessageInState: (state, action) => {
      const messageIndex = state.messages.findIndex(m => m.id === action.payload.id)
      if (messageIndex !== -1) {
        state.messages[messageIndex] = action.payload
      }
    },
    updateChatRoomLastMessage: (state, action) => {
      const { roomId, message, timestamp } = action.payload;
      const roomIndex = state.chatRooms.findIndex(r => r.id === roomId);
      if (roomIndex !== -1) {
        state.chatRooms[roomIndex].last_message = message;
        state.chatRooms[roomIndex].updated_at = timestamp;
        // Move this room to the top
        const room = state.chatRooms.splice(roomIndex, 1)[0];
        state.chatRooms.unshift(room);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false
        state.chatRooms = action.payload
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // +++ PER YOUR REQUEST +++
        // We are removing the "instant" message push from here.
        // We will now rely *only* on the real-time subscription
        // which calls the `addMessage` reducer.

        // const exists = state.messages.find(m => m.id === action.payload.id);
        // if (!exists) {
        //   state.messages.push(action.payload)
        // }
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const messageIndex = state.messages.findIndex(m => m.id === action.payload.id)
        if (messageIndex !== -1) {
          state.messages[messageIndex].status = action.payload.status
        }
      })
      .addCase(sendTypingIndicator.fulfilled, (state, action) => {
        // Typing indicator is handled via real-time subscription
      })
      .addCase(unmatchUser.fulfilled, (state, action) => {
        // Remove the chat room from the list
        state.chatRooms = state.chatRooms.filter(room => room.id !== action.payload.roomId)
        // Clear messages if this was the current room
        if (state.currentRoom?.id === action.payload.roomId) {
          state.messages = []
          state.currentRoom = null
        }
      })
  },
})

export const { setCurrentRoom, addMessage, clearMessages, updateTypingUsers, updateMessageInState, updateChatRoomLastMessage } = chatSlice.actions
export default chatSlice.reducer



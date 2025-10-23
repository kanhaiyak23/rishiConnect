import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          user1:profiles!chat_rooms_user1_id_fkey(*),
          user2:profiles!chat_rooms_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data
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
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update chat room's updated_at and last_message
      await supabase
        .from('chat_rooms')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message: message // We fixed this in the previous step
        })
        .eq('id', roomId)
      
      return data
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
  },
})

export const { setCurrentRoom, addMessage, clearMessages } = chatSlice.actions
export default chatSlice.reducer



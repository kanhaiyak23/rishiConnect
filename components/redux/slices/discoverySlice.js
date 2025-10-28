import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export const fetchPotentialMatches = createAsyncThunk(
  'discovery/fetchPotentialMatches',
  async (userId, { rejectWithValue }) => {
    try {
      // 1. Fetch ALL user IDs the current user has already swiped (liked or passed)
      const { data: swipedUsers, error: swipeError } = await supabase
        .from('swipes')
        .select('target_user_id') // Get the IDs of users they swiped on
        .eq('user_id', userId)
      
      if (swipeError) throw swipeError
      
      // 2. Create a list of IDs to exclude.
      // Start with the user's own ID.
      const excludedIds = [userId]
      
      // Add all swiped user IDs to the list
      if (swipedUsers) {
        swipedUsers.forEach(swipe => {
          excludedIds.push(swipe.target_user_id)
        })
      }
      
      // 3. Fetch profiles, excluding the user and anyone they've swiped on
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        // Use the new, correct excludedIds list
        .not('id', 'in', `(${excludedIds.join(',')})`) 
        .limit(20)
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const swipeUser = createAsyncThunk(
  'discovery/swipeUser',
  async ({ userId, targetUserId, action }, { rejectWithValue }) => {
    try {
      // 1. Insert the swipe
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          target_user_id: targetUserId,
          action: action, // 'like' or 'pass'
        })
        .select()
      
      if (error) throw error
      
      // 2. Check for a match if the action was 'like'
      if (action === 'like') {
        const { data: matchCheck } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', userId)
          .eq('action', 'like')
          .single()
        
        if (matchCheck) {
           console.log('✅ Match detected between:', userId, targetUserId)
          // It's a match!
          // 3. Create the match record for BOTH users
          await supabase
            .from('matches')
            .insert([
              {
                user_id: userId,
                matched_user_id: targetUserId,
              },
              {
                user_id: targetUserId,
                matched_user_id: userId,
              }
            ])
          
          // 4. Create the chat room
          await supabase
            .from('chat_rooms')
            .insert({
              user1_id: userId,
              user2_id: targetUserId,
            })
          
          // 5. +++ FIX: Fetch the matched user's profile for the modal +++
          const { data: matchedProfile, error: profileError } = await supabase
            .from('profiles')
            .select('name, photo_url') // Just get what the modal needs
            .eq('id', targetUserId)
            .single()

          if (profileError) throw profileError

          // Return the profile info so the modal can display "You matched with [Name]!"
          return { isMatch: true, match: matchedProfile }
        }
      }
      
      // No match, just a normal swipe
      return { isMatch: false }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const discoverySlice = createSlice({
  name: 'discovery',
  initialState: {
    potentialMatches: [],
    currentIndex: 0,
    loading: false,
    error: null,
    recentMatch: null,
  },
  reducers: {
    nextProfile: (state) => {
      state.currentIndex += 1
    },
    resetDiscovery: (state) => {
      state.currentIndex = 0
      state.potentialMatches = []
      state.recentMatch = null
    },
    clearRecentMatch: (state) => {
      state.recentMatch = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPotentialMatches.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPotentialMatches.fulfilled, (state, action) => {
        state.loading = false
        // Append new matches, avoiding duplicates
        const existingIds = new Set(state.potentialMatches.map(p => p.id))
        const newMatches = action.payload.filter(p => !existingIds.has(p.id))
        state.potentialMatches = [...state.potentialMatches, ...newMatches]
        // state.potentialMatches = action.payload // Use this if you want to replace
        state.error = null
      })
      .addCase(fetchPotentialMatches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(swipeUser.pending, (state) => {
        // We don't set global loading=true here to make swipes feel faster
      })
      .addCase(swipeUser.fulfilled, (state, action) => {
        if (action.payload.isMatch) {
          // This payload now contains { name, photo_url }
          state.recentMatch = action.payload.match 
        }
        // Increment index to show the next card
        state.currentIndex += 1
      })
  },
})

export const { nextProfile, resetDiscovery, clearRecentMatch } = discoverySlice.actions
export default discoverySlice.reducer

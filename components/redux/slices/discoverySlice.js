import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { notifyLike, notifyMatch } from '../../lib/notifications'

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
      console.log(action)
      // 2. Check for a match if the action was 'like'
      if (action === 'like') {
        const { data: matchCheck } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('target_user_id', userId)
          .eq('action', 'like')
          .single();

        if (matchCheck) {
          // ✅ It's a match!
          console.log('✅ Match detected between:', userId, targetUserId);

          await supabase.from('matches').insert([
            { user_id: userId, matched_user_id: targetUserId },
            { user_id: targetUserId, matched_user_id: userId },
          ]);

          await supabase.from('chat_rooms').insert({
            user1_id: userId,
            user2_id: targetUserId,
          });

          try {
            console.log("🎉 Calling notifyMatch...");
            await notifyMatch({ userAId: userId, userBId: targetUserId });
          } catch (e) {
            console.warn('notifyMatch failed', e);
          }

          const { data: matchedProfile, error: profileError } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', targetUserId)
            .single();

          if (profileError) throw profileError;

          return { isMatch: true, match: matchedProfile };
        } else {
          // ✅ One-way like — notify the target user
          try {
            console.log("💌 Calling notifyLike (one-way like)...");
            await notifyLike({ fromUserId: userId, toUserId: targetUserId });
          } catch (e) {
            console.warn('notifyLike failed', e);
          }

          return { isMatch: false };
        }
      }

    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const refreshDiscovery = createAsyncThunk(
  'discovery/refreshDiscovery',
  async ({ userId, currentMatches, currentIndex }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Identify users to "pass" (all remaining cards)
      const remainingUsers = currentMatches.slice(currentIndex)

      if (remainingUsers.length > 0) {
        const swipesToInsert = remainingUsers.map(profile => ({
          user_id: userId,
          target_user_id: profile.id,
          action: 'pass'
        }))

        // 2. Bulk insert swipes
        const { error } = await supabase
          .from('swipes')
          .insert(swipesToInsert)

        if (error) throw error
      }

      // 3. Reset local state
      dispatch(resetDiscovery())

      // 4. Fetch new matches
      dispatch(fetchPotentialMatches(userId))

      return
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
    nextCardOptimistic: (state, action) => {
      state.currentIndex += 1;
    }
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
        // state.currentIndex += 1
      })
  },
})

export const { nextProfile, resetDiscovery, clearRecentMatch, nextCardOptimistic } = discoverySlice.actions
export default discoverySlice.reducer

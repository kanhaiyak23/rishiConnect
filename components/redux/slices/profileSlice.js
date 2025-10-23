import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Don't throw an error if no profile is found, just return null.
      // PGRST116 is the code for "No rows found"
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    // We add this reducer so the authSlice can clear the profile on logout
    clearProfile: (state) => {
      state.profile = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Profile (with all states)
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

// Export the new action
export const { clearProfile } = profileSlice.actions
export default profileSlice.reducer


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Import the profile actions
import { fetchProfile, clearProfile } from './profileSlice'

WebBrowser.maybeCompleteAuthSession();

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: 'exp://10.7.2.228:8081',
        },
      })
      if (error) throw error
      
      // When sign up is successful, also set the user in state
      // (Supabase might return a user/session here depending on settings)
      if (data.user) {
        dispatch(setUser(data.user))
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://vwnwmrikprcqtzjhyblc.supabase.co/auth/v1/callback'
        },
      });

      if (error) throw error;
      
      // Start the auth flow. Don't await getSession().
      // The onAuthStateChanged listener in App.js will handle the result.
      if (data?.url) {
        await AuthSession.startAsync({ authUrl: data.url });
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // +++ SUCCESS: Fetch the user's profile +++
      if (data.user) {
        dispatch(fetchProfile(data.user.id))
      }
      
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // +++ SUCCESS: Clear the user's profile from state +++
      dispatch(clearProfile())
      return true
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // +++ CRITICAL FIX: Removed await supabase.auth.signOut(); +++
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // +++ SUCCESS: Fetch the user's profile +++
        dispatch(fetchProfile(session.user.id))
      } else {
        // No session, make sure profile is cleared
        dispatch(clearProfile())
      }
      
      return session
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    session: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Google Sign In
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithGoogle.fulfilled, (state) => {
        state.loading = false
        // We let the listener handle the session update
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.session = null
      })
      // Check Session
      .addCase(checkSession.fulfilled, (state, action) => {
        state.session = action.payload
        // +++ BUG FIX: Also set the user +++
        state.user = action.payload ? action.payload.user : null
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer


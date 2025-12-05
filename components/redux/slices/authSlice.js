import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
WebBrowser.maybeCompleteAuthSession();
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
         emailRedirectTo: 'rishiconnect://auth/callback', // or skip in dev
        },
      })
      if (data.user?.identities?.length === 0) {
        return rejectWithValue('User already registered');
      }
      if (error) {
        const errorMessage = error.message.toLowerCase();

        // Detect Google OAuth registration
        if (errorMessage.includes('already registered') || errorMessage.includes('user already registered')) {
          return rejectWithValue('GOOGLE_OAUTH_EXISTS');
        }

        
      
        
        throw error;
      }

      // No session yet because email verification is required
      if (data.user) {
        // Just store minimal info or show message
        dispatch(setUser({ email: data.user.email, id: data.user.id }))
      }

      // Tell UI that verification email was sent
      return { success: true, message: 'Check your email for verification link' }

    } catch (error) {
      // Handle specific refresh token issue gracefully
      
      if (error.message.includes('Refresh Token Not Found')) {
        return rejectWithValue('Verification email sent. Please verify your email before signing in.')
      }
      return rejectWithValue(error.message)
    }
  }
)


export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const redirectTo = 'rishiconnect://auth/callback'; // deep link configured in app.json
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;

      // Open Google login screen
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        console.log('OAuth result:', result);
      }

      return { success: true };
    } catch (err) {
      console.error('Google OAuth error:', err.message);
      return rejectWithValue(err.message);
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
      
      if (error) {
        console.log(error)
        // Check if the error suggests the email might be registered with Google
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = error.status || error.code || '';
        
        // Check for specific error codes or messages that indicate Google OAuth
        if (
          errorMessage.includes('google') ||
          errorMessage.includes('oauth') ||
          errorMessage.includes('provider') ||
          errorCode === 'signup_disabled' ||
          errorCode === 'email_provider_disabled'
        ) {
          return rejectWithValue('GOOGLE_OAUTH_EXISTS');
        }
        
        // For invalid credentials, we can't be sure if it's wrong password or Google OAuth
        // We'll let the UI handle this with a generic error message
        throw error;
      }
      
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
      console.log(error)
      console.log('User signed out successfully')
      
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
    setSession: (state, action) => {
      state.session = action.payload
      state.user = action.payload ? action.payload.user : null
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

export const { setUser, setSession, clearError } = authSlice.actions
export default authSlice.reducer


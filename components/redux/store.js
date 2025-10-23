import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import profileReducer from './slices/profileSlice.js'
import discoveryReducer from './slices/discoverySlice.js'
import chatReducer from './slices/chatSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    discovery: discoveryReducer,
    chat: chatReducer,
  },
})

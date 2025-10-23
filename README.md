# RishiConnect - College Social Connection App

A Tinder-inspired mobile application for Rishihood University students to connect and chat.

## Features

- 🔐 **University-Only Authentication** - Restricted to @rishihood.edu.in email addresses
- 👥 **Swipe-Based Matching** - Discover and connect with fellow students
- 💬 **Real-Time Chat** - Instant messaging with Supabase Realtime
- 👤 **Complete Profiles** - Bio, interests, major, and academic year
- 🎨 **Modern UI** - Beautiful, intuitive design inspired by popular dating apps

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Environment Variables
Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

#### Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  year TEXT,
  major TEXT,
  interests TEXT[],
  photo_url TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swipes Table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Chat Rooms Table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Swipes
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Matches
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- RLS Policies for Chat Rooms
CREATE POLICY "Users can view own chat rooms" ON chat_rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can insert chat rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for Messages
CREATE POLICY "Users can view messages in their rooms" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = messages.room_id 
    AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their rooms" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = messages.room_id 
    AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
  ) AND auth.uid() = sender_id
);
```

#### Storage Setup
1. Go to Storage in your Supabase dashboard
2. Create a bucket called `profile-photos`
3. Set it to public
4. Add the following policy:

```sql
CREATE POLICY "Anyone can view profile photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');
```

### 3. Run the App

```bash
npm start
```

Then press `i` for iOS or `a` for Android.

## Project Structure

```
components/
  ├── screens/
  │   ├── SplashScreen.js
  │   ├── WelcomeScreen.js
  │   ├── LoginScreen.js
  │   ├── SignUpScreen.js
  │   ├── EmailVerificationScreen.js
  │   ├── ProfileSetupScreen.js
  │   ├── DiscoveryScreen.js
  │   ├── ChatsScreen.js
  │   ├── ChatScreen.js
  │   ├── ProfileScreen.js
  │   └── SettingsScreen.js
  ├── redux/
  │   ├── store.js
  │   └── slices/
  │       ├── authSlice.js
  │       ├── profileSlice.js
  │       ├── discoverySlice.js
  │       └── chatSlice.js
  ├── lib/
  │   └── supabase.js
  └── App.js
```

## Features Overview

### Authentication Flow
1. Splash Screen → Welcome
2. Sign Up / Login
3. Email Verification
4. Profile Setup (first-time users)
5. Main App

### Main App (Tab Navigation)
1. **Discover** - Swipe through profiles
2. **Chats** - View all conversations
3. **Profile** - Manage profile and settings

### Key Features
- Email verification required for signup
- Profile completion mandatory before using the app
- Real-time messaging with Supabase Realtime
- Match notification system
- Photo uploads with Supabase Storage

## Customization

Update the university email domain in:
- `components/screens/SignUpScreen.js` (line 30)
- `components/screens/LoginScreen.js`

## License



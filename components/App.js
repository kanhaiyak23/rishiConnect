import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { store } from './redux/store'
import { checkSession } from './redux/slices/authSlice'
import { usePushNotifications } from './usePushNotification'
import { setUser } from './redux/slices/authSlice'
// import { updatePushToken } from './redux/slices/profileSlice'
// import NotificationService from './lib/notificationService'
import EmailVerificationHandler from './screens/EmailVerificationHandler'
import { BottomSheetProvider} from "../context/BottomSheetContext"


import * as Linking from 'expo-linking';


// Screens
import SplashScreen from './screens/SplashScreen'

import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import EmailVerificationScreen from './screens/EmailVerificationScreen'
import ProfileSetupScreen from './screens/ProfileSetupScreen'
import DiscoveryScreen from './screens/DiscoveryScreen'
import ChatsScreen from './screens/ChatsScreen'
import ChatScreen from './screens/ChatScreen'
import ProfileScreen from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import EditProfileScreen from './screens/EditProfileScreen'

const Tab = createBottomTabNavigator()

import { View, Button, Text, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './lib/supabase';
import RishiConnectLogo from './RishiConnectLogo';
import { Ionicons } from '@expo/vector-icons';
WebBrowser.maybeCompleteAuthSession();

function AuthStack() {

  const Stack = createNativeStackNavigator()


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </Stack.Navigator>
  )
}

function MainTabs() {

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 1,
          borderTopColor: '#333333',
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoveryScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function AppNavigator() {

  const Stack = createNativeStackNavigator()

  const dispatch = useDispatch()
  const { session, user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)
  const [isLoading, setIsLoading] = useState(true)
  const [minimumLoadingTime, setMinimumLoadingTime] = useState(true)


  useEffect(() => {
    const loadData = async () => {
      const startTime = Date.now()

      // Check session
      await dispatch(checkSession()).finally(() => {
        setIsLoading(false)
      })

      // Ensure minimum 3 seconds display time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      if (remainingTime > 0) {
        setTimeout(() => {
          setMinimumLoadingTime(false)
        }, remainingTime)
      } else {
        setMinimumLoadingTime(false)
      }
    }

    loadData()
  }, [dispatch])






  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <Stack.Navigator>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        ) : !profile?.is_complete ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: false, title: 'Edit Profile' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                headerShown: false,
                title: route.params?.room?.user2?.name || 'Chat'
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false, title: 'Settings' }}
            />
          </>

        )}

      </Stack.Navigator>
    </SafeAreaView>
  )
}

export default function App() {

  function PushNotificationSetup() {
    usePushNotifications(); // Handles login/logout internally
    return null;
  }


  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    // Show animated splash for 3 seconds
    const timer = setTimeout(() => {
      setShowAnimatedSplash(false);
    }, 3000); // duration of your splash animation

    return () => clearTimeout(timer);
  }, []);


  // useEffect(() => {
  //   const { data: subscription } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       if (session?.user) {
  //         dispatch(setUser(session.user));
  //       } else {
  //         dispatch(clearUser());
  //       }
  //     }
  //   );

  //   return () => subscription?.subscription.unsubscribe();
  // }, []);


  return (
    <Provider store={store}>
      <BottomSheetProvider>
        <SafeAreaProvider>
          {showAnimatedSplash ? (
            // Show your animated splash before main app
            <SplashScreen />
          ) : (
            <>
              <EmailVerificationHandler />
              <NavigationContainer>
                <PushNotificationSetup />
                <AppNavigator />
              </NavigationContainer>
            </>
          )}
        </SafeAreaProvider>
      </BottomSheetProvider>
    </Provider>
  )
}


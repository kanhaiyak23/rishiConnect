import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { store } from './redux/store'
import { checkSession } from './redux/slices/authSlice'
// import { updatePushToken } from './redux/slices/profileSlice'
// import NotificationService from './lib/notificationService'

import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

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

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

import { View, Button, Text, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './lib/supabase';
import RishiConnectLogo from './RishiConnectLogo';
WebBrowser.maybeCompleteAuthSession();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          height: 65,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
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
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color: color }}>✨</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color: color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 26, color: color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  const dispatch = useDispatch()
  const { session, user } = useSelector((state) => state.auth)
  const { profile } = useSelector((state) => state.profile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    dispatch(checkSession()).finally(() => {
      setIsLoading(false)
    })
  }, [dispatch])

  if (isLoading) {
    return <SplashScreen />
  }

  

  

  return (
    <Stack.Navigator>
      {!session ? (
        
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !profile?.is_complete ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={({ route }) => ({ 
              headerShown: true,
              title: route.params?.room?.user2?.name || 'Chat'
            })}
          /> 
           <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ headerShown: true, title: 'Settings' }}
          /> 
          </>
        
      )}
      
    </Stack.Navigator>
  )
}

export default function App() {
  return (
   <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <SafeAreaView style={{ flex: 1 }}>
            <AppNavigator />
          </SafeAreaView>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
)
}
// WebBrowser.maybeCompleteAuthSession();

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Listen to auth changes (sign-in, sign-out)
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (session) {
//         setUser(session.user);
//         console.log('User logged in:', session.user); // full user object
//       } else {
//         setUser(null);
//       }
//     });

//     // Check existing session (if user already logged in)
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session) {
//         setUser(session.user);
//         console.log('Existing session user:', session.user);
//       }
//     });

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const signInWithGoogle = async () => {
//     // const redirectTo = Linking.createURL('/');
//     // console.log(Linking.createURL('/'))
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: { redirectTo },
//     });

//     if (error) {
//       console.log('OAuth error:', error.message);
//       return;
//     }

//     // Open the Google login page
//     await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//   };

//   if (user) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text>Welcome, {user.user_metadata?.full_name ?? user.email}</Text>
//         <Button title="Sign Out" onPress={signOut} />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Sign in with Google" onPress={signInWithGoogle} />
//     </View>
//   );
// }
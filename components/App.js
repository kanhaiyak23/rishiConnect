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


import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

// Screens
import SplashScreen from './screens/SplashScreen'
import OnboardingScreen from './screens/OnboardingScreen'
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
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
    </Provider>
)
}






// _______
// Basic notification setup
// import * as Notifications from 'expo-notifications';
// import { useEffect, useRef, useState } from 'react';
// import { Text, View, Button, Platform, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';
// import { Linking } from 'react-native';
// // Set notification handler
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function App() {
//   const [expoPushToken, setExpoPushToken] = useState('');
//   const [notification, setNotification] = useState(undefined);
//   const notificationListener = useRef();
//   const responseListener = useRef();
//   const router=useRouter()

//   function redirect(notification) {
//   const url = notification.request.content.data?.url;
//   if (typeof url === 'string') {
//     console.log('Redirecting to:', url);
//     router.push(url);
//   }
// }

//   useEffect(() => {
//     // Register device for push notifications
//     registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

//     // Listen for received notifications
//      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });
//     const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//       //  redirect(response.notification);
//       const url = response.notification.request.content.data.url;
//       Linking.openURL(url);
//     });

//     // Listen for notification responses (user interaction)
    

//     // Cleanup listeners
//     return () => {
//      notificationListener.remove();
//       responseListener.remove();
//     };
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Your FCM Token:</Text>
//       <Text selectable style={styles.token}>{expoPushToken}</Text>

//       {notification && (
//         <View style={styles.notificationCard}>
//           <Text style={styles.title}>{notification.request.content.title}</Text>
//           <Text style={styles.body}>{notification.request.content.body}</Text>
//           <Text style={styles.data}>
//             {JSON.stringify(notification.request.content.data)}
//           </Text>
//         </View>
//       )}

//       {/* Uncomment if you want to test sending a notification */}
      
//        <Button 
//          title="Test Notification" 
//          onPress={async () => await sendPushNotification(expoPushToken)} 
//        /> 
      

//       <Button title="Schedule Test Notification" onPress={schedulePushNotification} />
//     </View>
//   );
// }

// // Redirect to the URL contained in notification data


// // Send a test push notification via Expo Push API
// async function sendPushNotification(expoPushToken) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title: 'Test Notification',
//     body: 'This is a test push notification!',
//     data: { someData: 'goes here' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-Encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

// // Register device for push notifications
// async function registerForPushNotificationsAsync() {
//   let token;

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     console.log('Existing permission:', existingStatus);

//     if (finalStatus !== 'granted') {
//       alert('Permission not granted!');
//       return;
//     }

//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ??
//       Constants?.easConfig?.projectId;

//     if (!projectId) {
//       console.error('Project ID not found');
//       return;
//     }
//     console.log(projectId)

//     try {
//       const pushTokenString = (
//         await Notifications.getExpoPushTokenAsync({ projectId })
//       ).data;
//       console.log('Expo Push Token:', pushTokenString);
//       token = pushTokenString;
//     } catch (e) {
//       console.error('Error getting push token:', e);
//     }
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   return token;
// }

// // Schedule a local notification
// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: 'Checkout Screen',
//       body: "I'm so proud of myself!",
//       sound: 'default',
//       data: { data: 'sss', url: '/components/screens/ChatScreen' },
//     },
//     trigger: { seconds: 10 },
//   });

//   console.log('Notification scheduled for 10 seconds from now.');
// }

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//   },
//   header: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   token: {
//     fontSize: 12,
//     color: 'gray',
//     marginBottom: 16,
//   },
//   notificationCard: {
//     padding: 16,
//     borderRadius: 8,
//     backgroundColor: '#e6f0ff',
//     marginBottom: 16,
//     width: '90%',
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   body: {
//     marginVertical: 4,
//   },
//   data: {
//     fontSize: 12,
//     color: 'gray',
//   },
// });






















// sign in with google
// export default function App() {
//   const { expoPushToken, notification } = usePushNotifications();
//   const data = JSON.stringify(notification, undefined, 2);
//   return (
//     <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
//       <Text>Token: {expoPushToken?.data ?? ""}</Text>
//       <Text>Notification: {data}</Text>
//     </View>
//   );
// }
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
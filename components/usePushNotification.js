import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useSelector } from 'react-redux'
import { savePushTokenForUser } from './lib/notifications'

export const usePushNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState();
  const [notification, setNotification] = useState();
  const authUser = useSelector((state) => state.auth.user)
  const profile = useSelector((state) => state.profile.profile)

  const notificationListener = useRef();
  const responseListener = useRef();
    

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }
  // Register for push notifications and save token when user changes
  useEffect(() => {
    let isMounted = true;

    // Register for push notifications (only once)
    if (!expoPushToken) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (isMounted && token) {
          setExpoPushToken(token);
          console.log('📱 Expo push token registered:', token);

          // Persist Expo push token to the user's profile if logged in
          if (authUser?.id) {
            try {
              await savePushTokenForUser(authUser.id, token);
            } catch (e) {
              console.warn('Failed to save push token on registration:', e);
            }
          }
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, []); // Only run once to register for push notifications

  // Save/update push token when user logs in, token changes, or profile is created/updated
  useEffect(() => {
    if (authUser?.id && expoPushToken) {
      console.log('💾 Saving push token for user:', authUser.id);
      savePushTokenForUser(authUser.id, expoPushToken).catch(e => {
        console.error('Failed to save/update push token:', e);
      });
    }
  }, [authUser?.id, expoPushToken, profile?.id]); // Re-run when user changes, token is set, or profile is created/updated

  // Set up notification listeners (only once, persist for app lifetime)
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log(notification)
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
      }
      if (responseListener.current) {
        responseListener.current.remove();
        responseListener.current = null;
      }
    };
  }, []); // Only set up listeners once

  return {
    expoPushToken,
    notification,
  };
};

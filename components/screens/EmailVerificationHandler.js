import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { setSession } from '../redux/slices/authSlice';
import { fetchProfile } from '../redux/slices/profileSlice';
import { useBottomSheet } from '../../context/BottomSheetContext';

export default function EmailVerificationHandler() {
  const dispatch = useDispatch();
  const { showBottomSheet } = useBottomSheet();

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (url?.startsWith('rishiconnect://auth/callback')) {
        console.log('Deep link received:', url);

        const fragment = url.split('#')[1];
        const queryParams = Object.fromEntries(new URLSearchParams(fragment));
        const access_token = queryParams['access_token'];
        const refresh_token = queryParams['refresh_token'];
        console.log(access_token, refresh_token)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('Error restoring session:', error);
            showBottomSheet('⚠️ Error', 'Could not restore session. Try logging in.');
            return;
          }

          const { data: userData } = await supabase.auth.getUser();
          console.log(userData)
          const user = userData?.user;
          console.log(user, "kk")
          const provider = user?.app_metadata?.provider;// 👈 Check auth provider

          if (provider === 'email') {
            // ✅ Email verification flow
            if (userData?.user?.email_confirmed_at) {
              showBottomSheet('✅ Email Verified', 'Please log in to continue.');
              await supabase.auth.signOut(); // only for email flow
            } else {
              showBottomSheet('Verification Pending', 'Please try again.');
            }
          } else if (provider === 'google') {
            // ✅ Google OAuth flow
            // Get the session after setting it
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
              // Set session and user in Redux
              dispatch(setSession(session));

              // Fetch the user's profile
              dispatch(fetchProfile(session.user.id));

              showBottomSheet('✅ Logged in with Google', 'Welcome!');
            } else {
              showBottomSheet('Error', 'Could not retrieve session after Google sign-in.');
            }

            // Do NOT sign out here, keep session active
          }
        } else {
          showBottomSheet('Invalid link', 'Missing authentication tokens.');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [dispatch]);


  return null;
}

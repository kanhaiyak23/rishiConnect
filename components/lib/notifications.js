import { use } from 'react';
import { supabase } from './supabase'

export async function savePushTokenForUser(userId, expoPushToken) {
  // Store Expo push token on the profile for server-side delivery
  await supabase
    .from('profiles')
    .update({
      expo_push_token: expoPushToken ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

export async function notifyLike({ fromUserId, toUserId }) {
  try {
    console.log("Invoking Supabase Edge Function: notify-like...");
    console.log("Payload:", { fromUserId, toUserId });

    const { data, error } = await supabase.functions.invoke('notify-like', {
      body: { toUserId, fromUserId },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message || "Unknown error from Supabase function");
    }

    console.log("Function response data:", data);
    return data;
  } catch (err) {
    console.error("Error invoking notify-like function:", err.message);
    throw err; // rethrow if you want to handle it elsewhere
  }
}


export async function notifyMatch({ userAId, userBId }) {
  // Requires a Supabase Edge Function named 'notify-match'
  // ✅ CORRECT - Await the function and check for errors

try {
  // 1. Await your function
  console.log("notifying notifyMatch call",userAId,userBId)
  const { data, error } = await supabase.functions.invoke('notify-match', {
    body: { userAId, userBId }})

  // 2. CHECK THE ERROR!
  if (error) {
    console.error('❌ Error calling notify-match function:', error);
    // Maybe show an alert to the user
    // alert('An error occurred: ' + error.message);
    return;
  }

  // 3. If no error, it worked!
  console.log('✅ Function invoked successfully:', data);
  

} catch (e) {
  // This catch block handles *other* errors, like if notifyMatch
  // itself throws an exception (which it doesn't currently, but it's good practice)
  console.error('💥 Critical error in notifyMatch call:', e);
}
}




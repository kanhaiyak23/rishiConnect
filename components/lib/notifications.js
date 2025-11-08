import { supabase } from './supabase'

export async function savePushTokenForUser(userId, expoPushToken) {
  if (!userId || !expoPushToken) {
    console.warn('savePushTokenForUser: Missing userId or expoPushToken', { userId, expoPushToken });
    return;
  }

  try {
    // First, try to update the existing profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        expo_push_token: expoPushToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      // If profile doesn't exist (PGRST116 = no rows found), log and return
      // The token will be saved when the profile is created during profile setup
      if (error.code === 'PGRST116') {
        console.log('⚠️ Profile does not exist yet for user:', userId, '- Push token will be saved when profile is created');
        return null;
      }
      // For other errors, throw
      console.error('Error saving push token:', error);
      throw error;
    }

    // If update succeeded but no rows were updated, profile might not exist
    if (!data || data.length === 0) {
      console.log('⚠️ Profile does not exist yet for user:', userId, '- Push token will be saved when profile is created');
      return null;
    }

    console.log('✅ Push token saved successfully for user:', userId);
    return data;
  } catch (error) {
    console.error('Failed to save push token for user:', userId, error);
    // Don't throw - we'll retry when profile is created
    return null;
  }
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



